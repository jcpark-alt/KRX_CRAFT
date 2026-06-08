"""XML 파일 로딩 + well-formedness 파싱.

WsDocument 는 한 번 로드하면 검사기들이 공유한다:
- `tree`           : 엄격 파싱 성공 시 ElementTree, 실패 시 None
- `recovered_tree` : recover 모드 best-effort 트리(구조 검사를 부분적으로라도 돌리기 위함)
- `syntax_errors`  : 엄격 파싱에서 나온 well-formedness Finding 목록
- `text`           : 디코딩된 원본 소스(정규식 기반 검사용)

lxml 보안 기본값: 외부 엔티티 해석/네트워크 접근을 끈다(XXE 방지).
"""

from __future__ import annotations

import io
import os

from lxml import etree

from .model import Finding, Severity


def _strict_parser() -> "etree.XMLParser":
    return etree.XMLParser(
        recover=False,
        resolve_entities=False,
        no_network=True,
        huge_tree=False,
    )


def _recover_parser() -> "etree.XMLParser":
    return etree.XMLParser(
        recover=True,
        resolve_entities=False,
        no_network=True,
        huge_tree=False,
    )


class WsDocument:
    def __init__(self, path: str, raw: bytes):
        self.path = path
        self.raw = raw
        self.text = raw.decode("utf-8", errors="replace")
        self.tree: "etree._ElementTree | None" = None
        self.recovered_tree: "etree._ElementTree | None" = None
        self.syntax_errors: list[Finding] = []
        self._parse()

    @classmethod
    def load(cls, path: str) -> "WsDocument":
        with open(path, "rb") as fh:
            raw = fh.read()
        return cls(path, raw)

    def _parse(self) -> None:
        # 1) 엄격 파싱: 성공하면 tree 확보, 실패하면 error_log 를 Finding 으로 변환.
        try:
            self.tree = etree.parse(io.BytesIO(self.raw), _strict_parser())
        except etree.XMLSyntaxError as exc:
            entries = list(exc.error_log) or [None]
            for err in entries:
                if err is None:
                    self.syntax_errors.append(
                        Finding(
                            code="WS001",
                            severity=Severity.ERROR,
                            message=str(exc),
                            file=self.path,
                            check="wellformed",
                        )
                    )
                    continue
                self.syntax_errors.append(
                    Finding(
                        code="WS001",
                        severity=Severity.ERROR,
                        message=err.message,
                        file=self.path,
                        line=err.line or 0,
                        column=err.column or 0,
                        check="wellformed",
                    )
                )
            # 2) recover 파싱으로 부분 트리라도 확보(구조/참조 검사 best-effort).
            try:
                self.recovered_tree = etree.parse(io.BytesIO(self.raw), _recover_parser())
            except etree.XMLSyntaxError:
                self.recovered_tree = None

    @property
    def root(self) -> "etree._Element | None":
        """엄격 트리 우선, 없으면 복구 트리의 루트."""
        tree = self.tree if self.tree is not None else self.recovered_tree
        return tree.getroot() if tree is not None else None

    @property
    def well_formed(self) -> bool:
        return self.tree is not None

    @property
    def filename(self) -> str:
        return os.path.basename(self.path)
