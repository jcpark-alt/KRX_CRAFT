"""docgen 단위 테스트 — JSDoc 파서 엣지케이스, publicInfo 필터, 렌더 이스케이프.

실행: cd tools/wsxml_lint && pytest
"""

from __future__ import annotations

from wsxml_lint.docgen import ApiMethod, ApiModule, extract_module, render_site
from wsxml_lint.docgen.extractor import (
    _build_method,
    _iter_doc_blocks,
    _parse_param,
    _split_type,
)

NS_DECL = (
    'xmlns="http://www.w3.org/1999/xhtml" '
    'xmlns:ev="http://www.w3.org/2001/xml-events" '
    'xmlns:w2="http://www.inswave.com/websquare" '
    'xmlns:xf="http://www.w3.org/2002/xforms"'
)


# ------------------------------------------------------------- _split_type


def test_split_type_balances_generics_and_objects():
    assert _split_type("{Promise<void>} x")[0] == "Promise<void>"
    assert _split_type("{a:b} y")[0] == "a:b"
    typ, rest = _split_type("{Object} valInfo 옵션")
    assert typ == "Object" and rest == "valInfo 옵션"


def test_split_type_no_type():
    assert _split_type("noBrace here") == ("", "noBrace here")


# ------------------------------------------------------------- _parse_param


def test_parse_param_missing_desc_and_empty():
    p = _parse_param("{Number} rowIndex")
    assert p.type == "Number" and p.name == "rowIndex" and p.desc == ""
    assert _parse_param("") is None


# ------------------------------------------------------------- _build_method


JSDOC_BODY = """
 * @method
 * @name getMsg
 * @description 첫 줄 설명.
 * 둘째 줄 설명.
 * @param {Object} valInfo 옵션
 * @returns {Object} msgInfo 결과 정보
 * @param {string} value 입력 값
 * @hidden N
 * @example $c.data.getMsg(valInfo, value);
"""


def test_build_method_handles_unordered_and_multiline():
    m = _build_method("getMsg", "valInfo, value", JSDOC_BODY)
    assert m.name == "getMsg"
    assert "둘째 줄 설명." in m.description          # multi-line @description
    assert len(m.params) == 2                        # @returns between @params handled
    assert (m.params[0].type, m.params[0].name) == ("Object", "valInfo")
    assert (m.params[1].type, m.params[1].name) == ("string", "value")
    assert m.returns.type == "Object"
    assert m.signature == "getMsg(valInfo, value)"
    assert "getMsg" in m.example


def test_build_method_deprecated_present_even_with_note():
    m = _build_method("old", "", " * @deprecated 쓰지 마세요\n * @description (사용중단)")
    assert m.deprecated == "쓰지 마세요"
    m2 = _build_method("nope", "", " * @description 정상")
    assert m2.deprecated is None


# ------------------------------------------------------------- _iter_doc_blocks


def test_iter_doc_blocks_skips_orphan_blocks():
    text = (
        "/** file-level comment, not attached */\n"
        "var x = 1;\n"
        "/**\n * @name foo\n */\n"
        "scwin.foo = function (a, b) {};\n"
    )
    blocks = list(_iter_doc_blocks(text))
    assert len(blocks) == 1
    assert blocks[0][0] == "foo"
    assert blocks[0][1] == "a, b"


# ------------------------------------------------------------- extract_module


def _write(tmp_path, name, content):
    p = tmp_path / name
    p.write_text(content, encoding="utf-8")
    return str(p)


def test_extract_module_public_only_and_prefix(tmp_path):
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<html {NS_DECL}>
<head meta_screenId="$c.util" meta_screenName="유틸" meta_desc="유틸 함수">
<w2:publicInfo method="scwin.isEmpty"/>
</head>
<body>
<script type="text/javascript"><![CDATA[
/**
 * @name isEmpty
 * @description 비었는지 검사.
 * @param {{Object}} value 입력 값
 * @returns {{Boolean}} 결과
 * @hidden N
 * @example $c.util.isEmpty(x);
 */
scwin.isEmpty = function (value) {{}};
/**
 * @name __helper
 * @hidden Y
 */
scwin.__helper = function () {{}};
]]></script>
</body>
</html>"""
    mod = extract_module(_write(tmp_path, "util.xml", xml))
    assert mod.name == "util" and mod.namespace == "$c.util" and mod.title == "유틸"
    assert [m.name for m in mod.methods] == ["isEmpty"]   # __helper excluded
    assert mod.methods[0].qualified == "$c.util.isEmpty"


def test_extract_module_empty_publicinfo_notes(tmp_path):
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<html {NS_DECL}>
<head meta_screenId="$c.ext"><w2:publicInfo method=""/></head>
<body><script><![CDATA[ scwin.onpageload = function () {{}}; ]]></script></body>
</html>"""
    mod = extract_module(_write(tmp_path, "ext.xml", xml))
    assert mod.methods == []
    assert mod.note == "공개 메서드가 없습니다."


# ------------------------------------------------------------- render


def test_render_contains_signature_and_escapes_html():
    mod = ApiModule(
        name="t", namespace="$c.t", file="t.xml", title="T",
        methods=[ApiMethod(name="f", signature="f(x)", description="<b>hi</b>",
                           qualified="$c.t.f")],
    )
    out = render_site([mod])
    assert "$c.t.f(x)" in out
    assert "&lt;b&gt;hi&lt;/b&gt;" in out      # escaped
    assert "<b>hi</b>" not in out              # raw HTML not injected
