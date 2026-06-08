"""Level 1 — well-formedness 검사.

실제 파싱은 WsDocument 로드 시점에 끝나 있다. 이 검사기는 거기서 수집된
syntax_errors 를 그대로 표면화하고, 빈 문서/디코딩 문제 같은 부가 상황만 덧붙인다.
"""

from __future__ import annotations

from typing import Iterable

from ..document import WsDocument
from ..model import Finding, Severity
from .base import Check


class WellFormedCheck(Check):
    name = "wellformed"

    def run(self, doc: WsDocument) -> Iterable[Finding]:
        # 로드 단계에서 모은 XMLSyntaxError → Finding 그대로 방출.
        yield from doc.syntax_errors

        if doc.well_formed and doc.root is None:
            yield Finding(
                code="WS002",
                severity=Severity.ERROR,
                message="문서에 루트 요소가 없습니다(빈 XML).",
                file=doc.path,
                check=self.name,
            )

        # UTF-8 디코딩 중 치환문자가 생겼다면 인코딩 불일치 가능성 경고.
        if "�" in doc.text:
            yield Finding(
                code="WS003",
                severity=Severity.WARNING,
                message="UTF-8 로 디코딩되지 않는 바이트가 있습니다(인코딩 선언 확인 필요).",
                file=doc.path,
                check=self.name,
            )
