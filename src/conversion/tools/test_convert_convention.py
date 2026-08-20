# -*- coding: utf-8 -*-
"""convert.py 5단계 정형화 구조(code-convention.md) + async/await 순차 변환 단위 테스트.

실행:
    pytest src/conversion/tools/test_convert_convention.py

- 규칙 2/4: 5단계 블록 헤더(1 선언 / 2 초기화 / 3 이벤트 / 4 서브미션 콜백 / 5 일반) 삽입,
  콜백 구역 분류(이름 패턴·핸들러 참조), 구(舊) 한 줄 경계 주석 마이그레이션, 멱등성.
- 규칙 6/12: submitDoneHandler 콜백 대신 `const sbmRtn = await executeDynamic(...)` 순차 스타일
  (핸들러 정의 존재 시 직접 호출 연결, 부재 시 TODO Stage2), submitErrorHandler 존재 시 콜백 유지.
- mark_async_functions: await 포함 함수 async 부여·멱등.
"""
import os
import re
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import convert  # noqa: E402


def _rep():
    return {"rule2": 0, "rule2_skip": [], "rule4": None, "rule4_merge": None,
            "rule6": {"converted": [], "deleted": 0}, "rule12": {"converted": []},
            "async_marked": [], "judgment": []}


SCRIPT_BASE = '''
scwin.vScrenID = "TEST0001";
scwin.pageNum = 1;

// 일반 함수
scwin.onpageload = function () {
    scwin.searchList();
};

scwin.btn_search_onclick = function () {
    scwin.searchList();
};

scwin.sbm_dlt_list_submitdone = function (rtn) {
    console.log(rtn);
};

scwin.popupCallback = function (arg) {
    console.log(arg);
};

scwin.searchList = function () {
    console.log("search");
};
'''

BODY = '<w2:button id="btn_search" ev:onclick="scwin.btn_search_onclick"/>'


def _run_rule24(script, body=BODY):
    rep = _rep()
    s = convert.rule2_globals(script, rep)
    s, _ = convert.rule4_structure(s, body, rep)
    return s, rep


def test_five_section_headers_and_callback_bucket():
    out, rep = _run_rule24(SCRIPT_BASE)
    p1 = out.find("1. 변수 및 선언 영역")
    p2 = out.find("2. 초기화 영역")
    p3 = out.find("3. 컴포넌트 이벤트 영역")
    p4 = out.find("4. 서브미션 콜백 영역")
    p5 = out.find("5. 일반/업무 함수 영역")
    assert -1 < p1 < p2 < p3 < p4 < p5
    # 구(舊) 한 줄 경계 주석은 제거(마이그레이션)
    assert "// 일반 함수" not in out
    # 콜백 구역(4~5 사이)에 submitdone·popupCallback 배치
    seg4 = out[p4:p5]
    assert "sbm_dlt_list_submitdone" in seg4 and "popupCallback" in seg4
    # 일반 구역에 searchList
    assert "searchList" in out[p5:]
    assert rep["rule4"]["callback"] == 2


def test_handler_reference_classified_as_callback():
    script = SCRIPT_BASE + '''
scwin.loadDone = function (rtn) {
    console.log(rtn);
};

scwin.doLoad = function () {
    const sbmOptions = { id : "s1", submitDoneHandler : scwin.loadDone };
    $c.sbm.executeDynamic(sbmOptions);
};
'''
    out, _ = _run_rule24(script)
    p4 = out.find("4. 서브미션 콜백 영역")
    p5 = out.find("5. 일반/업무 함수 영역")
    assert "scwin.loadDone" in out[p4:p5]  # 이름 패턴이 아니어도 핸들러 참조로 분류


def test_rule24_idempotent():
    once, _ = _run_rule24(SCRIPT_BASE)
    twice, _ = _run_rule24(once)
    assert twice == once
    # 헤더 중복 없음
    assert once.count("4. 서브미션 콜백 영역") == 1


def test_rule12_await_with_defined_handler():
    script = '''
scwin.searchList = function () {
	dlt_list.DataID = "/api/legacy/list?method=sel";
	dlt_list.reset();
};

scwin.sbm_dlt_list_submitdone = function (rtn) {
    console.log(rtn);
};
'''
    rep = _rep()
    out = convert.rule12_dynamic_submission(script, rep)
    assert "submitDoneHandler" not in out
    assert "const sbmRtn = await $c.sbm.executeDynamic(sbmOptions);" in out
    assert "scwin.sbm_dlt_list_submitdone(sbmRtn);" in out  # 핸들러 정의 존재 → 직접 호출 연결
    out2 = convert.mark_async_functions(out, _rep())
    assert "scwin.searchList = async function" in out2


def test_rule12_await_without_handler_todo():
    script = '''
scwin.searchList = function () {
	dlt_list.DataID = "/api/legacy/list?method=sel";
	dlt_list.reset();
};
'''
    out = convert.rule12_dynamic_submission(script, _rep())
    assert "// TODO Stage2: sbmRtn 응답 처리" in out
    assert "scwin.sbm_dlt_list_submitdone(" not in out


def test_rule6_await_statement():
    head = ('<xf:submission id="sbm_list" ref="data:json,dma_req" target="data:json,dlt_list" '
            'action="/api/x/list" method="get" mediatype="application/json" '
            'ev:submitdone="scwin.sbm_list_submitdone"/>')
    script = '''
scwin.btn_search_onclick = function () {
    $c.sbm.execute(sbm_list);
};

scwin.sbm_list_submitdone = function (rtn) {
    console.log(rtn);
};
'''
    rep = _rep()
    new_head, out = convert.rule6_submission(head, "", script, rep)
    assert "<xf:submission" not in new_head
    assert "submitDoneHandler" not in out
    assert "const sbmRtn = await $c.sbm.executeDynamic(sbmOptions);" in out
    assert "scwin.sbm_list_submitdone(sbmRtn);" in out
    out2 = convert.mark_async_functions(out, _rep())
    assert "scwin.btn_search_onclick = async function" in out2


def test_rule6_keeps_callback_style_when_submiterror():
    head = ('<xf:submission id="sbm_list" action="/api/x/list" method="get" '
            'mediatype="application/json" ev:submitdone="scwin.done" ev:submiterror="scwin.err"/>')
    script = '''
scwin.btn_search_onclick = function () {
    $c.sbm.execute(sbm_list);
};
'''
    rep = _rep()
    _, out = convert.rule6_submission(head, "", script, rep)
    assert "submitDoneHandler : scwin.done" in out   # 콜백 스타일 유지
    assert "await" not in out
    assert any("submitErrorHandler 존재" in j for j in rep["judgment"])


def test_mark_async_idempotent_and_skip_existing():
    script = '''
scwin.a = function () {
    const r = await $c.sbm.executeDynamic(o);
};

scwin.b = async function () {
    await $c.win.openPopup("/x.xml");
};
'''
    rep = _rep()
    out = convert.mark_async_functions(script, rep)
    assert "scwin.a = async function" in out
    assert out.count("async function") == 2  # b 는 이미 async — 재부여 없음
    again = convert.mark_async_functions(out, _rep())
    assert again == out
    assert rep["async_marked"] == ["scwin.a"]
