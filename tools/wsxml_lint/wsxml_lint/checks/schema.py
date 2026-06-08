"""Level 4 — XSD 스키마 검증(선택).

--xsd 옵션으로 스키마 파일이 주어질 때만 활성화된다. 스키마가 없으면
이 검사기는 아예 등록되지 않으므로 결과에 영향이 없다.

XSD 는 lxml.etree.XMLSchema 로 한 번만 컴파일해 모든 파일에 재사용한다.
"""

from __future__ import annotations

from typing import Iterable

from lxml import etree

from ..document import WsDocument
from ..model import Finding, Severity
from .base import Check


class SchemaError(Exception):
    """XSD 컴파일 실패."""


class SchemaCheck(Check):
    name = "schema"

    def __init__(self, xsd_path: str):
        self.xsd_path = xsd_path
        try:
            self._schema = etree.XMLSchema(etree.parse(xsd_path))
        except (etree.XMLSchemaParseError, etree.XMLSyntaxError, OSError) as exc:
            raise SchemaError(f"XSD 로드 실패 ({xsd_path}): {exc}") from exc

    def run(self, doc: WsDocument) -> Iterable[Finding]:
        if doc.tree is None:
            return  # well-formed 하지 않으면 스키마 검증 불가.
        if self._schema.validate(doc.tree):
            return
        for err in self._schema.error_log:
            yield Finding(
                code="WS400",
                severity=Severity.ERROR,
                message=f"스키마 위반: {err.message}",
                file=doc.path,
                line=err.line or 0,
                column=err.column or 0,
                check=self.name,
            )
