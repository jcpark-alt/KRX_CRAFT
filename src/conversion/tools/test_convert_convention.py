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


def test_executedynamic_caller_classified_as_callback():
    # 본문에서 $c.sbm.executeDynamic 을 호출하는(통신 실행) 함수는 4구역으로 분류 (2026-09-01 규칙)
    script = SCRIPT_BASE + '''
scwin.loadList = async function () {
    const sbmOptions = { id : "s2", action : "/api/x" };
    const sbmRtn = await $c.sbm.executeDynamic(sbmOptions);
};
'''
    out, rep = _run_rule24(script)
    p4 = out.find("4. 서브미션 콜백 영역")
    p5 = out.find("5. 일반/업무 함수 영역")
    assert "scwin.loadList" in out[p4:p5]
    assert rep["rule4"]["callback"] == 3


def test_executedynamic_in_event_handler_stays_event():
    # ev:on* 이 참조하는 이벤트 핸들러는 executeDynamic 을 직접 호출해도 3구역 우선
    script = SCRIPT_BASE + '''
scwin.btn_load_onclick = async function () {
    await $c.sbm.executeDynamic({ id : "s3", action : "/api/y" });
};
'''
    body = BODY + '<w2:button id="btn_load" ev:onclick="scwin.btn_load_onclick"/>'
    out, _ = _run_rule24(script, body=body)
    p3 = out.find("3. 컴포넌트 이벤트 영역")
    p4 = out.find("4. 서브미션 콜백 영역")
    assert "scwin.btn_load_onclick" in out[p3:p4]


def test_executedynamic_in_comment_not_classified():
    # 주석 속 executeDynamic 호출은 분류에 영향 없음(문자열/주석 마스킹)
    script = SCRIPT_BASE + '''
scwin.calcFee = function () {
    // await $c.sbm.executeDynamic(sbmOptions);
    return 1;
};
'''
    out, _ = _run_rule24(script)
    p5 = out.find("5. 일반/업무 함수 영역")
    assert "scwin.calcFee" in out[p5:]


def test_first_function_doc_moves_with_function():
    # 첫 함수의 doc 주석은 preamble 에 남지 않고 섹션 헤더 아래 함수와 함께 배치 (멱등)
    script = '''
scwin.vScrenID = "TEST0001";

/**
 * @method
 * @name scwin.onpageload
*/
scwin.onpageload = function () {
    scwin.searchList();
};

scwin.searchList = function () {
    console.log("s");
};
'''
    out, _ = _run_rule24(script)
    p2 = out.find("2. 초기화 영역")
    assert out.find("@name scwin.onpageload") > p2 > -1
    twice, _ = _run_rule24(out)
    assert twice == out


def test_rule5e_neg_compare():
    rep = {}
    out = convert.rule5e_neg_compare("if (!e.responseStatusCode === 200) { }\n// !a === 1 주석\nconst s = '!x === 1';", rep)
    assert "e.responseStatusCode !== 200" in out
    assert "// !a === 1" in out and "'!x === 1'" in out   # 주석/문자열 보호
    assert len(rep["rule5e"]) == 1


def test_rule25_sequential_normalization():
    # submitDoneHandler 옵션형(수기 변환분) → 순차 스타일 정규화 + 멱등
    script = '''
scwin.sbm_list_submitdone = async function (e) {
    console.log(e);
};

scwin.load = async function () {
    const sbmOptions = {
        id: "sbm_list",
        action: "/api/x",
        submitDoneHandler: scwin.sbm_list_submitdone, isProcessMsg: false
    };

    await $c.sbm.executeDynamic(sbmOptions);
};
'''
    rep = {}
    out = convert.rule25_sequential_submission(script, rep)
    assert "submitDoneHandler" not in out
    assert "const sbmRtn = await $c.sbm.executeDynamic(sbmOptions);" in out
    assert "await scwin.sbm_list_submitdone(sbmRtn);" in out
    assert "isProcessMsg: false" in out
    assert convert.rule25_sequential_submission(out, {}) == out


def test_rule25_undefined_handler_todo():
    # 파일에 정의되지 않은 핸들러는 직접 호출 대신 TODO Stage2 주석
    script = '''
scwin.load = async function () {
    const sbmOptions = {
        id: "s1",
        submitDoneHandler: scwin.notDefined
    };
    await $c.sbm.executeDynamic(sbmOptions);
};
'''
    out = convert.rule25_sequential_submission(script, {})
    assert not re.search(r'submitDoneHandler\s*:', out)   # 속성은 제거(TODO 주석 문구는 무관)
    assert "TODO Stage2" in out and "notDefined" in out


def test_rule26_entry_trycatch():
    script = '''///////// 2. 초기화 영역 /////////
scwin.onpageload = async function () {
    await scwin.searchList();
};

scwin.onpageunload = function () {
};

///////// 3. 컴포넌트 이벤트 영역 /////////
scwin.btn_x_onclick = function () {
    scwin.searchList();
};

scwin.btn_y_onclick = async function () {
    try {
        await scwin.searchList();
    } catch (ex) {
        await $c.exception.handleError(ex, { context : "T.btn_y" });
    }
};

///////// 5. 일반/업무 함수 영역 /////////
scwin.searchList = async function () {
    console.log(1);
};
'''
    rep = {}
    out = convert.rule26_entry_trycatch(script, rep, "TEST0001")
    assert rep["rule26"] == 2   # onpageload + btn_x (btn_y 는 try 존재, onpageunload 는 빈 본문 → 제외)
    assert 'await $c.exception.handleError(ex, { context : "TEST0001.onpageload" });' in out
    assert '$c.exception.handleError(ex, { context : "TEST0001.btn_x_onclick" });' in out
    assert out.count('context : "T.btn_y"') == 1          # 기존 수기 적용분 보존
    assert 'context : "TEST0001.searchList"' not in out   # 5구역 일반 함수는 래핑하지 않음
    assert convert.rule26_entry_trycatch(out, {}, "TEST0001") == out


def test_rule26_section2_helper_excluded_and_tab_indent():
    # 2구역은 onpageload/onpageunload 만 래핑(init 등 헬퍼는 제외) + 탭 들여쓰기 단위 감지
    script = '''///////// 2. 초기화 영역 /////////
scwin.onpageload = async function () {
\tawait scwin.init();
};

scwin.init = async function () {
\tconsole.log(1);
};
'''
    rep = {}
    out = convert.rule26_entry_trycatch(script, rep, "T1")
    assert rep["rule26"] == 1
    assert 'context : "T1.onpageload"' in out
    assert 'context : "T1.init"' not in out          # 2구역 내부 헬퍼는 래핑하지 않음
    assert "\ttry {" in out and "\t\tawait scwin.init();" in out   # 탭 단위 유지(공백 혼입 없음)
    assert convert.rule26_entry_trycatch(out, {}, "T1") == out


def test_rule27_dedup_grid_child_ids():
    body = ('<w2:gridView id="g1"><w2:caption id="caption1"/><w2:header id="header1"></w2:header><w2:gBody id="gBody1"></w2:gBody></w2:gridView>'
            '<w2:gridView id="g2"><w2:caption id="caption1"/><w2:header id="header1"></w2:header><w2:gBody id="gBody1"></w2:gBody></w2:gridView>')
    rep = {}
    out = convert.rule27_dedup_grid_child_ids(body, rep)
    assert len(rep["rule27"]) == 3
    assert out.count('id="caption1"') == 1 and 'id="caption2"' in out
    assert out.count('id="header1"') == 1 and 'id="header2"' in out
    assert out.count('id="gBody1"') == 1 and 'id="gBody2"' in out
    out2 = convert.rule27_dedup_grid_child_ids(out, {})
    assert out2 == out


def test_rule13_bare_reference_sync():
    # 규칙 13 보강 — 정의 개명 시 bare 참조(대입 RHS 등)도 scwin.{신이름} 으로 동기화, 주석은 보존
    script = '''
scwin.fn_GetReturn = function (arrPar) {
    return arrPar;
};

scwin.btn_ret_onclick = function () {
    scwin.fn_GetPar = fn_GetReturn;
    // scwin.fn_GetPar = fn_GetReturn; 주석은 보존
};
'''
    rep = {"judgment": []}
    _, script2, _ = convert.rule13_rename_scwin_fn("", script, "", rep)
    assert "scwin.getReturn = function" in script2
    assert "scwin.fn_GetPar = scwin.getReturn;" in script2
    assert "// scwin.fn_GetPar = fn_GetReturn;" in script2


def test_rule17_popup_type_reception():
    # 팝업 타입별 수신 규약 — browserPopup: options.callbackFn + await 미사용 / pageFramePopup: await result
    script = '''
scwin.a = function () {
    $c.frame.CreateDialogFrame("gform", "/lstmgt/ULDSTF40601.gfm", "승인", 200, 100, 603, 398, "window");
};

scwin.b = function () {
    $c.frame.CreateDialogFrame("gform", "/common/ULDSTF92017.gfm", "종목선택", 200, 100, 410, 580, "tool");
};
'''
    rep = {"rule17": None, "judgment": []}
    out = convert.rule17_create_dialog_frame(script, rep)
    assert "CreateDialogFrame" not in out
    # browserPopup — options 에 callbackFn, await/result/data 없음, popupCallback 정의 1회 추가
    bseg = out[out.index("scwin.a"):out.index("scwin.b")]
    assert '"browserPopup"' in bseg and 'callbackFn: "scwin.popupCallback"' in bseg
    assert "$c.win.openPopup(\"/lstmgt/ULDSTF40601.gfm\", options);" in bseg
    assert "await" not in bseg and "const data" not in bseg
    assert out.count("scwin.popupCallback = function") == 1
    # pageFramePopup — data + await result 수신
    pseg = out[out.index("scwin.b"):]
    assert '"pageFramePopup"' in pseg and "const result = await $c.win.openPopup(" in pseg
    assert "callbackFn" not in pseg.split("scwin.popupCallback = function")[0]


def test_rule28_broadcast_guard():
    # 반복문 내 DataCollection 변경 → 앞뒤 setBroadcast(false)/(true, true) 삽입 + 멱등
    head = '<w2:dataList id="dlt_list" baseNode="list"></w2:dataList>'
    script = '''
scwin.proc = function () {
    for (let i = 0; i < dlt_list.getRowCount(); i++) {
        dlt_list.setCellData(i, "status", "done");
    }
};
'''
    rep = {}
    out = convert.rule28_broadcast_guard(script, head, rep)
    assert "dlt_list.setBroadcast(false);" in out
    assert "dlt_list.setBroadcast(true, true);" in out
    assert out.index("setBroadcast(false)") < out.index("for (") < out.index("setBroadcast(true, true)")
    assert len(rep["rule28"]) == 1
    assert convert.rule28_broadcast_guard(out, head, {}) == out


def test_rule28_foreach_skip_return_and_plain_loop():
    script = '''
scwin.a = function () {
    dlt_rows.forEach(function (item) {
        item.set("x", 1);
    });
};

scwin.b = function () {
    for (const r of rows) {
        dma_x.set("k", r);
        if (r === 0) return;
    }
};

scwin.c = function () {
    for (let i = 0; i < 3; i++) {
        console.log(i);
    }
};
'''
    rep = {"judgment": []}
    out = convert.rule28_broadcast_guard(script, "", rep)
    assert "dlt_rows.setBroadcast(false);" in out       # DC.forEach — 수신 객체 제어
    assert "dlt_rows.setBroadcast(true, true);" in out
    assert "dma_x.setBroadcast" not in out              # 본문 return → 보류(복원 누락 위험)
    assert any("규칙28" in j for j in rep["judgment"])
    assert out.count("setBroadcast") == 2               # DC 를 변경하지 않는 일반 루프는 무변환


def test_comment_space_formatting():
    # // 주석 뒤 공백 1개 보장 — 구분선/헤더/W-Craft 마커/문자열 내부는 제외 (code-convention 주석 규칙)
    src = '''
scwin.a = 1; //채권시장조치구분코드
//주석 라인
// 이미 공백 있음
///////// 1. 변수 및 선언 영역 /////////
//----W-Craft WebSquare 변환 확인----//
////dts_x.DataID = url;
const u = "http://x/y"; //URL문자열무관
const s = '//문자열내부는보호';
'''
    rep = {}
    out = convert.format_comment_space(src, rep)
    assert "// 채권시장조치구분코드" in out
    assert "// 주석 라인" in out
    assert "// 이미 공백 있음" in out                     # 변화 없음
    assert "///////// 1. 변수 및 선언 영역 /////////" in out  # 섹션 헤더 유지
    assert "//----W-Craft" in out                          # 마커 유지
    assert "////dts_x.DataID" in out                       # 4중 슬래시 유지
    assert "// URL문자열무관" in out
    assert "'//문자열내부는보호'" in out                    # 문자열 내부 보호
    assert rep["fmt_comment_space"] == 3
    out2 = convert.format_comment_space(out)
    assert out2 == out                                     # 멱등


def test_rule24_idempotent():
    once, _ = _run_rule24(SCRIPT_BASE)
    twice, _ = _run_rule24(once)
    assert twice == once
    # 헤더 중복 없음 + 현행 한 줄 슬래시 형식
    assert once.count("4. 서브미션 콜백 영역") == 1
    assert "///////// 4. 서브미션 콜백 영역 /////////" in once


def test_legacy_block_header_migration():
    # 구(舊) 3줄 블록 헤더가 남은 변환본 → 현행 슬래시 헤더로 교체(중복 없음)
    legacy = SCRIPT_BASE.replace(
        "// 일반 함수",
        "/************************************************************************\n"
        " * 5. 일반/업무 함수 영역\n"
        " ************************************************************************/")
    out, _ = _run_rule24(legacy)
    assert "/*****" not in out                     # 블록 형식 잔존 없음
    assert out.count("5. 일반/업무 함수 영역") == 1
    assert "///////// 5. 일반/업무 함수 영역 /////////" in out


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
