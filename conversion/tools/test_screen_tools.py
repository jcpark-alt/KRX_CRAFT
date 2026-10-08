# -*- coding: utf-8 -*-
"""승격 도구(screen_tools / gate_screen / scan_mixed_compare / screen_convention / init_restructure) 스모크 테스트.

실행:
    pytest conversion/tools/test_screen_tools.py

잡 tmp 에만 있던 파이프라인 스크립트를 conversion/tools 로 올리면서(2026-10-01, r13 0단계) 각 단계의 핵심 동작만 고정한다.
"""
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import screen_tools as st  # noqa: E402
import gate_screen  # noqa: E402
import scan_mixed_compare  # noqa: E402
import screen_convention as sc  # noqa: E402
import init_restructure  # noqa: E402

HEAD = ('<?xml version="1.0" encoding="UTF-8"?>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:ev="http://www.w3.org/2001/xml-events"'
        ' xmlns:w2="http://www.inswave.com/websquare" xmlns:xf="http://www.w3.org/2002/xforms">\n'
        '<head meta_screenName="테스트" meta_screenId="jldfil00001">\n\t<w2:type>COMPONENT</w2:type>\n\t<w2:buildDate/>\n'
        '\t<xf:model><w2:dataCollection baseNode="map"><w2:dataMap baseNode="map" id="dma_req"><w2:keyInfo/></w2:dataMap></w2:dataCollection></xf:model>\n'
        '\t<w2:layoutInfo></w2:layoutInfo>\n\t<w2:publicInfo method="scwin.onpageload,scwin.ghost"></w2:publicInfo>\n')
SCRIPT = '''
scwin.unusedFlag = "N";
scwin.usedFlag = "N";

///////// 2. 초기화 영역 /////////

scwin.onpageload = async function () {
    try {
\tscwin.usedFlag = "Y";
        dma_req.set("a", "1");
        await scwin.searchList();
    } catch (ex) {
        $c.exception.handleError(ex, { context : "jldfil00001.onpageload" });
    }
};

///////// 3. 컴포넌트 이벤트 영역 /////////

// 조회 버튼을 눌렀을 때
scwin.btn_search_onclick = function (e) {
    if (btn_search.getValue() === 1) { return; }
    scwin.searchList();
};

///////// 4. 서브미션 콜백 영역 /////////

scwin.searchList = async function () {
    const sbmRtn = await $c.sbm.executeDynamic({});
    return sbmRtn;
};
'''
BODY = ('<body ev:onpageload="scwin.onpageload">\n<xf:trigger id="btn_search" ev:onclick="scwin.btn_search_onclick"><xf:label><![CDATA[조회]]></xf:label></xf:trigger>\n'
        '<xf:trigger id="btn_x" ev:onclick="scwin.nope"><xf:label><![CDATA[없음]]></xf:label></xf:trigger>\n'
        '<w2:gridView id="grd_main" dataList="data:dlt_main"><w2:header><w2:row><w2:column id="col1" value="A"/></w2:row></w2:header>'
        '<w2:gBody><w2:row><w2:column id="col1"/></w2:row></w2:gBody></w2:gridView>\n</body>\n</html>\n')
XML = HEAD + '\t<script lazy="false" type="text/javascript"><![CDATA[' + SCRIPT + ']]></script>\n</head>\n' + BODY


def _write(tmp_path, text=XML, name="jldfil00001.xml"):
    p = tmp_path / name
    p.write_text(text, encoding="utf-8")
    return str(p)


def test_pcc_for_prefix_rule():
    assert st.pcc_for("jldfil25900.xml") == "fil"
    assert st.pcc_for("uldmgt76101") == "mgt"
    assert st.pcc_for("ULDSTF05403.xml") == "fil"  # uld* 기본은 fil — stf 화면은 --pcc stf 로 지정
    assert st.pcc_for("SMPVAL10000.xml") is None


def test_func_spans_and_public_info_roundtrip():
    spans = st.func_spans(SCRIPT)
    assert [s[0] for s in spans] == ["onpageload", "btn_search_onclick", "searchList"]
    assert spans[0][4] is True and spans[1][4] is False
    head = st.set_public_info(HEAD, st.defined_functions(SCRIPT))
    assert 'publicInfo method="scwin.onpageload,scwin.btn_search_onclick,scwin.searchList"/>' in head
    assert st.public_info(head) == {"onpageload", "btn_search_onclick", "searchList"}


def test_gate_reports_each_defect(tmp_path):
    ok, r = gate_screen.gate_file(_write(tmp_path), inventory=({"sbm": {"executeDynamic"}, "exception": {"handleError"}}, set()), node=False)
    assert not ok
    assert r["public_only"] == ["ghost"]
    assert set(r["defined_only"]) == {"btn_search_onclick", "searchList"}
    assert r["handlers_undefined"] == ["nope"]
    assert r["unused_globals"] == ["unusedFlag"]
    assert r["undefined_c"] == []
    assert "tab char" in r["tokens"]


def test_scan_mixed_compare_finds_numeric_strict_and_unawaited(tmp_path):
    r = scan_mixed_compare.scan_file(_write(tmp_path), {("sbm", "executeDynamic"), ("exception", "handleError")})
    assert any(k.endswith("getValue()") for k in r["A"])
    assert r["B"] == {}  # executeDynamic 은 await 됨, handleError 는 제외


def test_convention_pipeline_fixes_the_fixture(tmp_path):
    p = _write(tmp_path)
    log = sc.apply(p, pcc=None, async_common={("sbm", "executeDynamic")}, dry=False)
    assert log["changed"] and log["unused_removed"] == ["unusedFlag"]
    assert log["await_added"] >= 2  # btn_search_onclick 의 searchList 호출 + onpageload catch 의 handleError
    assert log["header_id_renamed"] == 1 and log["dangling_attr_left"] == 0
    text = open(p, encoding="utf-8").read()
    reg = st.common_inventory  # noqa: F841  (import 경로 확인)
    script = __import__("convert").split_regions(text)["script"]
    assert " * @description 조회 버튼을 눌렀을 때" in script and "// 조회 버튼을 눌렀을 때" not in script
    assert "@description 「조회」 클릭 이벤트" not in script  # 직전 주석이 우선
    assert "scwin.btn_search_onclick = async function" in script and "await scwin.searchList();" in script
    assert "await $c.exception.handleError" in script
    assert "\t" not in script
    assert 'ev:onclick="scwin.nope"' not in text and 'id="col1_H"' in text
    assert 'publicInfo method="scwin.onpageload,scwin.btn_search_onclick,scwin.searchList"/>' in text
    # 게이트 통과 (node 는 환경 의존이라 생략)
    ok, r = gate_screen.gate_file(p, inventory=({"sbm": {"executeDynamic"}, "exception": {"handleError"}}, set()), node=False)
    assert ok, r


def test_reindent_keeps_multiline_string_inner_lines():
    js = 'scwin.html = "<tr>\\\n\t\t<td>x</td>";\n\tscwin.a = 1;\n'
    out = sc.reindent(js)
    assert "\t\t<td>x</td>" in out  # 문자열 안은 보존
    assert out.endswith("    scwin.a = 1;\n") or "\n    scwin.a = 1;" in out


def test_init_restructure_moves_init_statements():
    new_js, msg = init_restructure.restructure(SCRIPT)
    assert new_js is not None and msg.startswith("init 신설")
    assert "scwin.init = function () {" in new_js and 'scwin.usedFlag = "Y";' in new_js.split("scwin.init = function")[1]
    assert "// 초기화함수\n        scwin.init();\n\n        await scwin.searchList();" in new_js
    again, msg2 = init_restructure.restructure(new_js)
    assert again is None and msg2 == "이미 init 호출 구조"


def test_parse_box_strips_single_line_block_comment_markers():
    # 2026-10-08 ULDSTF92040: `/* 설명 */` 한 줄 블록 주석의 표지가 @description 에 남아 JSDoc 이 `*/` 에서 닫히던 결함
    desc, params = sc.parse_box("/* 기초시장 및 기초 자산*/\n")
    assert desc == "기초시장 및 기초 자산" and params == {}
    desc2, _ = sc.parse_box("/*\n * 설명 : 목록 조회\n */\n")
    assert desc2 == "목록 조회"


def test_finalize_adds_screen_id_without_screen_name():
    head = '<head meta_convertType="Craft" >\n<w2:buildDate/>\n<xf:model><w2:dataCollection baseNode="map"></w2:dataCollection></xf:model>\n</head>'
    new_head, _s, _b, _log = sc.finalize_head_body(head, "scwin.onpageload = function () {};\n", "<body></body>", "ULDSTF99999")
    assert 'meta_screenId="ULDSTF99999"' in new_head and "<w2:layoutInfo/>" in new_head
