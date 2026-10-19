# -*- coding: utf-8 -*-
"""publish_gate(퍼블리싱 하네스 게이트) 단위 테스트.

실행:
    pytest conversion/tools/test_publish_gate.py

markup(P01~P03)·보존(P10~P13)·범위(P20~P24)·--allow 의 판정만 고정한다(lint/gate_screen 단계는 각 도구 테스트 소관).
"""
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import publish_gate as pg  # noqa: E402

DOC = ('<?xml version="1.0" encoding="UTF-8"?>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:ev="http://www.w3.org/2001/xml-events"'
       ' xmlns:w2="http://www.inswave.com/websquare" xmlns:xf="http://www.w3.org/2002/xforms">\n'
       '<head>{head}<script type="text/javascript"><![CDATA[\n{script}\n]]></script></head>\n<body>{body}</body></html>\n')
FNS = 'scwin.onpageload = function () {\n};\nscwin.btn_save_onclick = async function () {\n};\n'


def doc(body, script=FNS, head=""):
    return DOC.format(head=head, script=script, body=body)


def cell(tag, span=None, rowspan=None, style=""):
    attrs = ""
    if span or rowspan:
        attrs = "<w2:attributes>%s%s</w2:attributes>" % (
            "<w2:colspan>%d</w2:colspan>" % span if span else "", "<w2:rowspan>%d</w2:rowspan>" % rowspan if rowspan else "")
    return '<xf:group tagname="%s" style="%s">%s</xf:group>' % (tag, style, attrs)


def table(cols, rows, wrapped=0):
    cg = "".join('<xf:group tagname="col"/>' for _ in range(cols))
    if wrapped:
        cg += '<xf:group>%s</xf:group>' % "".join('<xf:group tagname="col"/>' for _ in range(wrapped))
    trs = "".join('<xf:group tagname="tr">%s</xf:group>' % "".join(r) for r in rows)
    return '<xf:group tagname="table"><xf:group tagname="colgroup">%s</xf:group>%s</xf:group>' % (cg, trs)


def colgroup(body):
    return pg.check_colgroup(pg.parse(doc(body)))


# ---------------------------------------------------------------- P01 colgroup
def test_colgroup_ok_with_colspan():
    f, w = colgroup(table(4, [[cell("th"), cell("td", 3)], [cell("th"), cell("td"), cell("th"), cell("td")]]))
    assert f == [] and w == []


def test_colgroup_mismatch_fails():
    f, _ = colgroup(table(2, [[cell("th"), cell("td"), cell("th"), cell("td")]]))
    assert len(f) == 1 and f[0].startswith("P01") and "2열" in f[0]


def test_colgroup_rowspan_occupancy():
    # 첫 행 th 가 2행을 차지 → 둘째 행은 td 3개만으로 4칸
    rows = [[cell("th", rowspan=2), cell("td"), cell("th"), cell("td")], [cell("td"), cell("th"), cell("td")]]
    assert colgroup(table(4, rows)) == ([], [])


def test_colgroup_hidden_toggle_is_warning():
    # 숨김 칸과 보이는 칸이 교대하는 토글 구조 — 보이는 칸 기준으로는 맞으므로 경고
    rows = [[cell("th"), cell("td"), cell("td", 2, style="display:none;")], [cell("th"), cell("td")]]
    f, w = colgroup(table(2, rows))
    assert f == [] and len(w) == 1 and "토글" in w[0]


def test_colgroup_wrapped_cols_reported():
    f, _ = colgroup(table(2, [[cell("th"), cell("td"), cell("th"), cell("td")]], wrapped=2))
    assert f and "다른 그룹에 싸여" in f[0]


def test_nested_table_rows_not_counted_for_outer():
    inner = table(3, [[cell("td"), cell("td"), cell("td")]])
    outer = ('<xf:group tagname="table"><xf:group tagname="colgroup"><xf:group tagname="col"/><xf:group tagname="col"/></xf:group>'
             '<xf:group tagname="tr"><xf:group tagname="th"/><xf:group tagname="td">%s</xf:group></xf:group></xf:group>' % inner)
    assert colgroup(outer) == ([], [])


# ---------------------------------------------------------------- P02 / P03
def test_attr_case_readonly():
    f = pg.check_attr_case(pg.parse(doc('<xf:input id="ipt_a" readonly="true"/><xf:input id="ipt_b" readOnly="true"/>')))
    assert len(f) == 1 and "readOnly" in f[0]


def test_tab_body_content_header(tmp_path):
    host = tmp_path / "HOST.xml"
    host.write_text(doc('<w2:tabControl id="tbc"><w2:content id="c0"><w2:pageFrame id="pfm0" src="/ui/jsp/BODY.xml"/>'
                        '</w2:content></w2:tabControl>'), encoding="utf-8")
    body = doc('<w2:pageFrame id="pfmContentHeader" src="/cm/xml/contentHeader.xml"/>')
    names = pg.tab_body_names([str(host)])
    assert names == {"body.xml"}
    assert len(pg.check_tab_content_header(pg.parse(body), str(tmp_path / "BODY.xml"), names)) == 1
    # host 자체(탭 본문 아님)는 contentHeader 를 가져도 된다
    assert pg.check_tab_content_header(pg.parse(body), str(host), names) == []


# ---------------------------------------------------------------- 보존 / 범위
BEFORE = doc('<w2:textbox label="종목명"/><xf:input id="ipt_isuNm" ref="data:dma_req.isuNm"/>'
             '<xf:trigger id="btn_save" ev:onclick="scwin.btn_save_onclick"><xf:label>저장</xf:label></xf:trigger>')


def compare(after_body, script=FNS, head=""):
    return pg.compare(pg.parse(BEFORE), pg.parse(doc(after_body, script, head)))


def test_relayout_only_passes():
    # 같은 요소를 lybox/titbox 로 감싸 재배치 — 바인딩·핸들러·라벨 보존
    after = ('<xf:group class="lybox"><xf:group class="titbox"><w2:textbox label="종목명" tagname="h3"/></xf:group>'
             '<xf:input id="ipt_isuNm" ref="data:dma_req.isuNm"/>'
             '<xf:trigger id="btn_save" ev:onclick="scwin.btn_save_onclick"><xf:label>저장</xf:label></xf:trigger></xf:group>')
    f, w = compare(after)
    assert f == [] and w == []


def test_lost_ref_handler_label_fail():
    f, _ = compare('<xf:input id="ipt_isuNm"/>')
    codes = {x[:3] for x in f}
    assert {"P10", "P11", "P12"} <= codes


def test_added_function_fails_and_script_change_warns():
    after = BEFORE.split("<body>")[1].split("</body>")[0]
    f, w = compare(after, FNS + "scwin.extra = function () {\n};\n")
    assert any(x.startswith("P20 scwin 함수 추가") for x in f)
    assert any(x.startswith("P22") for x in w)


def test_head_external_resource_fails():
    after = BEFORE.split("<body>")[1].split("</body>")[0]
    f, _ = compare(after, head='<script type="text/javascript" src="/x/extra.js"></script>')
    assert any(x.startswith("P21") for x in f)


def test_allow_downgrades_to_warning(tmp_path):
    before = tmp_path / "before.xml"
    after = tmp_path / "AFTER.xml"
    before.write_text(BEFORE, encoding="utf-8")
    after.write_text(doc('<xf:input id="ipt_isuNm" ref="data:dma_req.isuNm"/>'
                         '<xf:trigger id="btn_save" ev:onclick="scwin.btn_save_onclick"><xf:label>저장</xf:label></xf:trigger>'),
                     encoding="utf-8")
    strict = pg.check_file(str(after), BEFORE, lint=False, gate=False)
    assert [x[:3] for x in strict["fails"]] == ["P12"]
    loose = pg.check_file(str(after), BEFORE, lint=False, gate=False, allow=("P12",))
    assert loose["fails"] == [] and any(x.startswith("허용 P12") for x in loose["warns"])
    assert loose["stages"]["preserve/scope"] == "OK"
