# -*- coding: utf-8 -*-
"""convert.py 규칙 6 표현식 호출 이중 await 교정 + 규칙 5b/5c body 컴포넌트 가드 단위 테스트(2026-09-22).

실행:
    pytest conversion/tools/test_convert_rule5b6_guard.py

- 규칙 6: `let res = await $c.sbm.execute(sbm_x)` → `let res = await $c.sbm.executeDynamic(sbmOptions)` (await 1개, 리포트 없음),
  인자 위치 호출 `f($c.sbm.execute(sbm_x))` 는 await 부여 + '응답 캡처 없음' 리포트
- 규칙 5b/5c: body 에 id 가 있는 컴포넌트만 setValue/setBackgroundImage 로 변환, DOM/form 필드 수신은 보류·리포트,
  body_ids 미지정(레거시 호출)은 종전대로 전부 변환
"""
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import convert  # noqa: E402

_HEAD = ('<?xml version="1.0" encoding="UTF-8"?>\n<html xmlns="http://www.w3.org/1999/xhtml" '
         'xmlns:w2="http://www.inswave.com/websquare" xmlns:xf="http://www.w3.org/2002/xforms" '
         'xmlns:ev="http://www.w3.org/2001/xml-events">\n<head>\n<xf:model>\n'
         '<xf:submission id="sbm_list" action="/api/list" method="get" mediatype="application/json" '
         'ref="data:json,dma_req" target="data:json,dlt_res" mode="asynchronous" ev:submitdone=""/>\n'
         '</xf:model>\n<script type="text/javascript"><![CDATA[\n')
_TAIL = (']]></script>\n</head>\n<body>\n<w2:gridView id="grd_main" dataList="data:dlt_res"/>\n'
         '<xf:input id="ibx_tot"/>\n</body>\n</html>\n')


def _conv(script):
    return convert.convert(_HEAD + script + _TAIL, "ULDTST00001.xml")


def test_rule6_assignment_with_existing_await_is_not_double_awaited():
    out, rep = _conv("scwin.search = async function () {\n    let res = await $c.sbm.execute(sbm_list);\n    return res;\n};\n")
    assert "await await" not in out
    assert "let res = await $c.sbm.executeDynamic(sbmOptions);" in out
    assert not any("응답(rtn) 캡처 없음" in j for j in rep["judgment"])
    assert '<xf:submission' not in out and 'gridview : "grd_main"' in out


def test_rule6_argument_call_gets_await_and_report():
    out, rep = _conv("scwin.search = async function () {\n    scwin.done($c.sbm.execute(sbm_list));\n};\n")
    assert "scwin.done(await $c.sbm.executeDynamic(sbmOptions));" in out
    assert any("응답(rtn) 캡처 없음" in j for j in rep["judgment"])


def test_rule5b_converts_only_body_components():
    script = ("scwin.a = function () {\n"
              "    ibx_tot.value = \"\";\n"
              "    downForm.prtDepoId.value = seq;\n"
              "    input.value = val;\n"
              "};\n")
    out, rep = _conv(script)
    assert 'ibx_tot.setValue("");' in out
    assert "downForm.prtDepoId.value = seq;" in out
    assert "input.value = val;" in out
    assert len(rep["rule5b"]) == 1
    assert sum("규칙5b" in j for j in rep["judgment"]) == 2


def test_rule5c_guard_and_legacy_signature():
    script = "scwin.a = function () {\n    img.src = \"a.gif\";\n    ibx_tot.src = \"b.gif\";\n};\n"
    out, rep = _conv(script)
    assert 'img.src = "a.gif";' in out and 'ibx_tot.setBackgroundImage("b.gif");' in out
    # body_ids 없이 직접 호출(종전 시그니처)하면 전부 변환
    rep2 = {"rule5b": [], "rule5c": [], "judgment": []}
    legacy = convert.rule5b_setvalue("x.y.value = 1;\ninput.value = 2;\n", rep2)
    assert legacy == "x.y.setValue(1);\ninput.setValue(2);\n" and rep2["judgment"] == []


def test_rule4_default_param_object_not_mistaken_for_body():
    # `function (params, options = {})` 의 `{}` 를 본문 시작으로 오인하면 함수 경계가 깨져 규칙 4 가 보류됐다(ULDFIL05040)
    script = ("scwin.onpageload = function () {\n    scwin.init();\n};\n"
              "scwin.openFormSubmit = function (params, options = {}) {\n"
              "    const { method = 'GET', arr = [] } = options;\n    return method;\n};\n"
              "scwin.btn_a_onclick = function (e) {\n    scwin.openFormSubmit({}, {});\n};\n")
    out, rep = _conv(script)
    assert not any("규칙4 재정렬 보류" in j for j in rep["judgment"])
    assert "///////// 3. " in out and "///////// 5. " in out
    assert out.count("scwin.openFormSubmit = function") == 1


def test_rule26_wraps_handler_with_default_param():
    script = ("scwin.onpageload = function () {\n    scwin.init();\n};\n"
              "scwin.btn_a_onclick = function (e, opt = {}) {\n    scwin.go(opt);\n};\n")
    out, rep = _conv(script)
    i = out.index("scwin.btn_a_onclick = function (e, opt = {}) {")
    seg = out[i:i + 200]
    assert "try {" in seg and "$c.exception.handleError" in seg   # 본문 전체가 try/catch 로 감싸짐
    assert rep["rule26"] >= 2



def test_rule13_renames_scwin_prefixed_refs_inside_strings():
    # 그리드 셀 HTML 문자열 안의 인라인 핸들러(onclick="scwin.fn_X(...)")도 정의 개명과 함께 바뀌어야 런타임에 깨지지 않는다
    script = ("scwin.onpageload = function () {\n    scwin.fn_fileDown(1);\n};\n"
              "scwin.fn_fileDown = function (seq) {\n"
              "    const html = '<a href=\"javascript:scwin.fn_fileDown(' + seq + ')\">down</a>';\n"
              "    return html;\n};\n")
    out, rep = _conv(script)
    assert "scwin.fn_fileDown" not in out
    assert 'javascript:scwin.fileDown(' in out and "scwin.fileDown = function" in out
    assert rep["rule13"] == ["fn_fileDown → fileDown"]


def test_rule12_skips_dataid_inside_commented_out_function():
    # 주석 처리된 함수 안의 DataID/reset 쌍은 변환하면 실행문이 함수 밖에 생긴다 → 보류·리포트
    script = ("scwin.onpageload = function () {\n    scwin.a();\n};\n"
              "// scwin.oldRead = function () {\n"
              "//     dts_x.DataID = encodeURI(\"/Prelisting.do?cmd=read\");\n"
              "//     dts_x.reset();\n"
              "// };\n"
              "scwin.a = function () {\n    dts_y.DataID = encodeURI(\"/Prelisting.do?cmd=list\");\n    dts_y.reset();\n};\n")
    out, rep = convert.convert(_HEAD + script + _TAIL, "ULDTST00002.xml")
    assert "sbm_dts_y" in out and "sbm_dts_x" not in out           # 활성 함수 안은 변환, 주석 함수 안은 미변환
    assert any("dts_x.DataID" in j and "함수 밖" in j for j in rep["judgment"])
    assert not any("재정렬 보류" in j for j in rep["judgment"])

