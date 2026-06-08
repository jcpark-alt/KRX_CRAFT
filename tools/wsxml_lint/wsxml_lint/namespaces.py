"""WebSquare XML namespace constants.

WebSquare 페이지는 항상 4개의 네임스페이스를 사용한다(루트 <html> 에 선언).
검사 로직 전반에서 이 상수를 사용해 Clark 표기({uri}local)로 요소를 찾는다.
"""

XHTML = "http://www.w3.org/1999/xhtml"
EV = "http://www.w3.org/2001/xml-events"
W2 = "http://www.inswave.com/websquare"
XF = "http://www.w3.org/2002/xforms"

# XPath 에서 쓰는 prefix→uri 매핑. 기본 네임스페이스(xhtml)도 prefix 'x' 로 노출한다.
NSMAP = {"x": XHTML, "ev": EV, "w2": W2, "xf": XF}

# 루트에 반드시 선언되어 있어야 하는 네임스페이스(누락 시 경고).
REQUIRED_NAMESPACES = {"w2": W2, "xf": XF}


def q(uri: str, local: str) -> str:
    """Clark notation 헬퍼: q(W2, 'type') -> '{...}type'."""
    return f"{{{uri}}}{local}"
