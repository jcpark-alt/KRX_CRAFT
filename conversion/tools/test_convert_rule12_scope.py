# -*- coding: utf-8 -*-
"""규칙 12 — `{DC}.DataID = encodeURI(url)` 의 url 선언 탐색은 같은 최상위 함수 안으로 제한한다.

2026-10-08 ULDSTF92002: 규칙 4 재배치 뒤 다른 핸들러의 `let url = "/ui/lst/lstproc/ULDSTF05106_read.xml";`(팝업 URL) 이
"DataID 앞의 마지막 url 대입"으로 잡혀 삭제되고, 해석 실패한 DataID 는 그대로 남는 결함.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import convert as cv  # noqa: E402

XML = '''<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:ev="http://www.w3.org/2001/xml-events" xmlns:w2="http://www.inswave.com/websquare" xmlns:xf="http://www.w3.org/2002/xforms">
	<head meta_screenName="t" meta_screenId="TEST">
		<w2:type>COMPONENT</w2:type>
		<xf:model>
			<w2:dataCollection baseNode="map">
				<w2:dataMap baseNode="map" id="dma_BackList"><w2:keyInfo><w2:key id="a" name="a" dataType="text"></w2:key></w2:keyInfo></w2:dataMap>
			</w2:dataCollection>
		</xf:model>
		<script type="text/javascript" lazy="false"><![CDATA[
scwin.onpageload = function () {
};
scwin.btn_open_onclick = async function () {
    let url = "/ui/lst/lstproc/ULDSTF05106_read.xml";
    const opts = { id: "ULDSTF05106_read" };
    await $c.win.openPopup(url, opts);
};
scwin.fn_backlistReadSync = function () {
    dma_BackList.DataID = encodeURI(url);
    dma_BackList.Reset();
};
]]></script>
	</head>
	<body ev:onpageload="scwin.onpageload">
		<xf:trigger id="btn_open" type="button" ev:onclick="scwin.btn_open_onclick"><xf:label>열기</xf:label></xf:trigger>
	</body>
</html>
'''


def test_rule12_url_decl_lookup_is_scoped_to_enclosing_function():
    out, rep = cv.convert(XML, "TEST.xml", "screen")
    # 다른 함수의 팝업 URL 상수는 살아 있어야 한다
    assert 'url = "/ui/lst/lstproc/ULDSTF05106_read.xml";' in out
    assert "await $c.win.openPopup(url, opts);" in out
    # 같은 함수 안에 url 선언이 없는 DataID 는 해석 실패로 보류(삭제·오변환 없음)
    assert any("dma_BackList.DataID (action URL 해석 실패)" in s for s in rep["judgment"])
    assert "dma_BackList.DataID = encodeURI(url);" in out


def test_rule12_still_converts_when_url_is_in_same_function():
    xml = XML.replace('    dma_BackList.DataID = encodeURI(url);',
                      '    let url = "/Listing.do?method=searchBackList&ISUR_CD=1";\n    dma_BackList.DataID = encodeURI(url);')
    out, rep = cv.convert(xml, "TEST.xml", "screen")
    assert any(s.startswith("dma_BackList") for s in rep["rule12"]["converted"])
    assert 'action : "/Listing.do"' in out or 'action: "/Listing.do"' in out
    # 팝업 URL 상수는 여전히 보존
    assert 'url = "/ui/lst/lstproc/ULDSTF05106_read.xml";' in out
