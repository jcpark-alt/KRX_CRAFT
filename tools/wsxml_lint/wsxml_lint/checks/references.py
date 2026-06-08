"""Level 3 — 참조 무결성 검사.

WebSquare COMMON 페이지는 <w2:publicInfo method="scwin.a,scwin.b,..."> 로
외부 공개 함수 목록을 선언하고, 실제 본문은 <script> CDATA 의 JS 에 정의된다.
이 검사기는 두 목록이 어긋나는 지점을 찾는다:

- WS201 publicInfo 에 선언됐지만 CDATA 에 정의가 없는 함수
- WS202 publicInfo 의 method 항목이 비었거나 형식이 이상한 경우
"""

from __future__ import annotations

import re
from typing import Iterable

from ..document import WsDocument
from ..model import Finding, Severity
from ..namespaces import W2, XHTML, q
from .base import Check

# scwin.foo = ...  (대입 기반 정의)
_ASSIGN_DEF = re.compile(r"scwin\.([A-Za-z_$][\w$]*)\s*=")
# function foo(...)  (함수 선언 기반 정의)
_FUNC_DEF = re.compile(r"function\s+([A-Za-z_$][\w$]*)\s*\(")


class ReferenceCheck(Check):
    name = "references"

    def run(self, doc: WsDocument) -> Iterable[Finding]:
        root = doc.root
        if root is None:
            return

        head = root.find(q(XHTML, "head"))
        if head is None:
            return
        public_info = head.find(q(W2, "publicInfo"))
        if public_info is None:
            return  # 구조 검사가 부재를 보고.

        method_attr = public_info.get("method")
        if not method_attr or not method_attr.strip():
            return  # 공개 함수 없음 — 정상.

        defined = self._defined_functions(root)
        info_line = getattr(public_info, "sourceline", 0) or 0

        for raw in method_attr.split(","):
            entry = raw.strip()
            if not entry:
                yield Finding(
                    code="WS202",
                    severity=Severity.WARNING,
                    message="publicInfo/@method 에 빈 항목이 있습니다(연속 콤마 등).",
                    file=doc.path,
                    line=info_line,
                    check=self.name,
                )
                continue
            # 'scwin.foo' → 'foo' (마지막 . 뒤). prefix 없으면 그대로.
            name = entry.rsplit(".", 1)[-1]
            if not name:
                continue
            if name not in defined:
                yield Finding(
                    code="WS201",
                    severity=Severity.WARNING,
                    message=(
                        f"publicInfo 에 '{entry}' 가 선언됐지만 CDATA 스크립트에서 "
                        f"정의를 찾지 못했습니다."
                    ),
                    file=doc.path,
                    line=info_line,
                    check=self.name,
                )

    def _defined_functions(self, root) -> set[str]:
        names: set[str] = set()
        for script in root.iter(q(XHTML, "script")):
            text = script.text or ""
            names.update(_ASSIGN_DEF.findall(text))
            names.update(_FUNC_DEF.findall(text))
        return names
