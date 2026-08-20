"""wsxml_lint 단위 테스트.

각 레벨(well-formedness / 구조 / 참조)과 필터/CLI 종료코드를 검증한다.
실행: cd tools/wsxml_lint && pytest
"""

from __future__ import annotations

import os

import pytest

from wsxml_lint import Linter, Severity, WsDocument
from wsxml_lint.checks.references import ReferenceCheck
from wsxml_lint.checks.structure import StructureCheck
from wsxml_lint.checks.wellformed import WellFormedCheck

NS_DECL = (
    'xmlns="http://www.w3.org/1999/xhtml" '
    'xmlns:ev="http://www.w3.org/2001/xml-events" '
    'xmlns:w2="http://www.inswave.com/websquare" '
    'xmlns:xf="http://www.w3.org/2002/xforms"'
)


def make_doc(body: str) -> WsDocument:
    return WsDocument("mem.xml", body.encode("utf-8"))


def codes(findings) -> set[str]:
    return {f.code for f in findings}


# --------------------------------------------------------------- well-formed


def test_valid_document_is_well_formed():
    doc = make_doc(f'<?xml version="1.0"?><html {NS_DECL}><head/><body/></html>')
    assert doc.well_formed
    assert list(WellFormedCheck().run(doc)) == []


def test_malformed_document_reports_ws001():
    doc = make_doc(f"<html {NS_DECL}><head><unclosed></head></html>")
    assert not doc.well_formed
    found = list(WellFormedCheck().run(doc))
    assert "WS001" in codes(found)
    # recover 트리 덕분에 루트는 여전히 접근 가능해야 한다.
    assert doc.root is not None


def test_syntax_error_carries_line_number():
    doc = make_doc(f"<html {NS_DECL}>\n<head>\n<w2:type>X</w2:type>\n<bad></html>")
    err = next(f for f in doc.syntax_errors if f.code == "WS001")
    assert err.line >= 1


# ------------------------------------------------------------------- structure


def _full_head(extra_head: str = "", public_method: str = "") -> str:
    pub = f'<w2:publicInfo method="{public_method}"/>' if public_method or True else ""
    return f"""<?xml version="1.0"?>
<html {NS_DECL}>
  <head meta_screenId="cm" meta_screenName="cm">
    <w2:type>COMMON</w2:type>
    <xf:model><w2:dataCollection baseNode="map"/></xf:model>
    <w2:layoutInfo/>
    {pub}
    {extra_head}
  </head>
  <body/>
</html>"""


def test_wellformed_sample_passes_structure():
    doc = make_doc(_full_head())
    assert list(StructureCheck().run(doc)) == []


def test_wrong_root_reports_ws101():
    doc = make_doc(f'<root {NS_DECL}><head/></root>')
    assert "WS101" in codes(StructureCheck().run(doc))


def test_missing_required_head_child_reports_ws112():
    body = f"""<html {NS_DECL}>
      <head meta_screenId="x" meta_screenName="x">
        <w2:layoutInfo/>
      </head></html>"""
    found = codes(StructureCheck().run(make_doc(body)))
    assert "WS112" in found  # w2:type, xf:model 누락


def test_missing_meta_reports_ws111():
    body = f"""<html {NS_DECL}>
      <head>
        <w2:type>COMMON</w2:type>
        <xf:model><w2:dataCollection baseNode="map"/></xf:model>
        <w2:layoutInfo/><w2:publicInfo method=""/>
      </head></html>"""
    assert "WS111" in codes(StructureCheck().run(make_doc(body)))


def test_invalid_base_node_reports_ws114():
    body = f"""<html {NS_DECL}>
      <head meta_screenId="x" meta_screenName="x">
        <w2:type>COMMON</w2:type>
        <xf:model><w2:dataCollection baseNode="weird"/></xf:model>
        <w2:layoutInfo/><w2:publicInfo method=""/>
      </head></html>"""
    assert "WS114" in codes(StructureCheck().run(make_doc(body)))


def test_duplicate_id_reports_ws120():
    body = f"""<html {NS_DECL}>
      <head meta_screenId="x" meta_screenName="x">
        <w2:type>COMMON</w2:type>
        <xf:model><w2:dataCollection baseNode="map"/></xf:model>
        <w2:layoutInfo/><w2:publicInfo method=""/>
      </head>
      <body><div id="dup"/><div id="dup"/></body></html>"""
    assert "WS120" in codes(StructureCheck().run(make_doc(body)))


_WS120_HEAD = """
      <head meta_screenId="x" meta_screenName="x">
        <w2:type>COMMON</w2:type>
        <xf:model><w2:dataCollection baseNode="map">{dc}</w2:dataCollection></xf:model>
        <w2:layoutInfo/><w2:publicInfo method=""/>
      </head>"""


def _ws120_doc(dc: str, body: str = "") -> WsDocument:
    return make_doc(f"<html {NS_DECL}>{_WS120_HEAD.format(dc=dc)}<body>{body}</body></html>")


def test_ws120_gridview_column_matching_datalist_column_is_ok():
    # gridView 컬럼 id == 바인딩 dataList 컬럼 id — 규약상 필수 매핑(오탐 방지)
    dc = """<w2:dataList id="dlt_x" baseNode="list" repeatNode="map"><w2:columnInfo>
              <w2:column id="email" name="이메일"/></w2:columnInfo></w2:dataList>"""
    body = """<w2:gridView id="grd_x" dataList="data:dlt_x"><w2:gBody id="gb"><w2:row id="r1">
                <w2:column id="email" inputType="text"/></w2:row></w2:gBody></w2:gridView>"""
    assert "WS120" not in codes(StructureCheck().run(_ws120_doc(dc, body)))


def test_ws120_same_field_name_across_collections_is_ok():
    # 서로 다른 컬렉션 간 전문 필드명 재사용(dataMap key ↔ dataList column) — 정상
    dc = """<w2:dataMap id="dma_a" baseNode="map"><w2:keyInfo>
              <w2:key id="notiSvcId" name="n"/></w2:keyInfo></w2:dataMap>
            <w2:dataList id="dlt_b" baseNode="list" repeatNode="map"><w2:columnInfo>
              <w2:column id="notiSvcId" name="n"/></w2:columnInfo></w2:dataList>"""
    assert "WS120" not in codes(StructureCheck().run(_ws120_doc(dc)))


def test_ws120_duplicate_within_same_collection_reports():
    dc = """<w2:dataList id="dlt_x" baseNode="list" repeatNode="map"><w2:columnInfo>
              <w2:column id="email" name="a"/><w2:column id="email" name="b"/>
            </w2:columnInfo></w2:dataList>"""
    assert "WS120" in codes(StructureCheck().run(_ws120_doc(dc)))


def test_ws120_duplicate_within_same_gridview_reports():
    body = """<w2:gridView id="grd_x"><w2:gBody id="gb"><w2:row id="r1">
                <w2:column id="email" inputType="text"/><w2:column id="email" inputType="text"/>
              </w2:row></w2:gBody></w2:gridView>"""
    assert "WS120" in codes(StructureCheck().run(_ws120_doc("", body)))


def test_ws120_component_id_matching_collection_column_is_ok():
    # 일반 컴포넌트 id 와 컬렉션 내부 컬럼 id 는 별개 네임스페이스
    dc = """<w2:dataMap id="dma_a" baseNode="map"><w2:keyInfo>
              <w2:key id="title" name="제목"/></w2:keyInfo></w2:dataMap>"""
    body = '<xf:input id="title" ref="data:dma_a.title"/>'
    assert "WS120" not in codes(StructureCheck().run(_ws120_doc(dc, body)))


def test_ws120_collection_container_ids_stay_global():
    # 컬렉션 컨테이너(dataMap/dataList) 자체의 id 는 전역 유일 규칙 유지
    dc = """<w2:dataMap id="dma_a" baseNode="map"><w2:keyInfo/></w2:dataMap>
            <w2:dataMap id="dma_a" baseNode="map"><w2:keyInfo/></w2:dataMap>"""
    assert "WS120" in codes(StructureCheck().run(_ws120_doc(dc)))


# ------------------------------------------------------------------ references


def _doc_with_script(method: str, script: str) -> WsDocument:
    body = f"""<html {NS_DECL}>
      <head meta_screenId="x" meta_screenName="x">
        <w2:type>COMMON</w2:type>
        <xf:model><w2:dataCollection baseNode="map"/></xf:model>
        <w2:layoutInfo/>
        <w2:publicInfo method="{method}"/>
        <script type="text/javascript">{script}</script>
      </head><body/></html>"""
    return make_doc(body)


def test_public_method_defined_passes():
    doc = _doc_with_script("scwin.foo,scwin.bar", "scwin.foo = function(){}; function bar(){}")
    assert list(ReferenceCheck().run(doc)) == []


def test_public_method_missing_reports_ws201():
    doc = _doc_with_script("scwin.foo,scwin.ghost", "scwin.foo = function(){};")
    found = [f for f in ReferenceCheck().run(doc) if f.code == "WS201"]
    assert len(found) == 1
    assert "ghost" in found[0].message


def test_empty_method_entry_reports_ws202():
    doc = _doc_with_script("scwin.foo,,scwin.foo", "scwin.foo = function(){};")
    assert "WS202" in codes(ReferenceCheck().run(doc))


# ----------------------------------------------------------------- linter/cli


def test_filters_min_severity_and_ignore(tmp_path):
    # meta/type/model 누락으로 경고(WS111/WS102)와 에러(WS112)가 함께 발생.
    body = f"""<html {NS_DECL}>
      <head><w2:layoutInfo/></head><body/></html>"""
    fp = tmp_path / "f.xml"
    fp.write_text(body, encoding="utf-8")

    # min_severity=ERROR → 경고는 걸러지고 에러만 남는다.
    errs = Linter(min_severity=Severity.ERROR).lint_file(str(fp))
    assert errs.findings
    assert all(f.severity == Severity.ERROR for f in errs.findings)

    # ignore 로 특정 코드 제거.
    full = Linter().lint_file(str(fp))
    ignored = Linter(ignore={"WS111"}).lint_file(str(fp))
    assert "WS111" in codes(full.findings)
    assert "WS111" not in codes(ignored.findings)


def test_real_samples_if_present():
    """저장소의 실제 gcc_sample 디렉터리가 있으면 깨지지 않고 도는지 확인."""
    here = os.path.dirname(__file__)
    sample = os.path.normpath(
        os.path.join(here, "..", "..", "..", "websquare", "common", "gcc_sample")
    )
    if not os.path.isdir(sample):
        pytest.skip("샘플 디렉터리 없음")
    report = Linter().lint_paths([sample])
    assert len(report.results) >= 1
    # 모든 샘플은 well-formed 여야 한다(WS001 없어야 함).
    assert "WS001" not in {f.code for f in report.findings}
