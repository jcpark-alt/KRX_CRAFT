"""Level 2 — WebSquare 구조 규칙 검사.

검사 항목:
- WS101 루트가 {xhtml}html 인가
- WS102 필수 네임스페이스(w2, xf) 선언 여부
- WS110 <head> 존재
- WS111 head/@meta_screenId, @meta_screenName 존재(경고)
- WS112 head 필수 자식(w2:type, xf:model, w2:layoutInfo, w2:publicInfo) 존재
- WS113 xf:model 안에 w2:dataCollection 존재
- WS114 dataCollection/@baseNode 값이 map|list 인지
- WS120 문서 내 @id 중복
"""

from __future__ import annotations

from typing import Iterable

from ..document import WsDocument
from ..model import Finding, Severity
from ..namespaces import REQUIRED_NAMESPACES, W2, XF, XHTML, q
from .base import Check

# (라벨, uri, local, 누락 시 심각도)
REQUIRED_HEAD_CHILDREN = [
    ("w2:type", W2, "type", Severity.ERROR),
    ("xf:model", XF, "model", Severity.ERROR),
    ("w2:layoutInfo", W2, "layoutInfo", Severity.WARNING),
    ("w2:publicInfo", W2, "publicInfo", Severity.WARNING),
]

VALID_BASE_NODES = {"map", "list"}


class StructureCheck(Check):
    name = "structure"

    def run(self, doc: WsDocument) -> Iterable[Finding]:
        root = doc.root
        if root is None:
            return  # well-formed 검사가 이미 보고함.

        yield from self._check_root(doc, root)

        head = root.find(q(XHTML, "head"))
        if head is None:
            yield self._f(doc, "WS110", Severity.ERROR, "<head> 요소가 없습니다.", root)
            yield from self._check_duplicate_ids(doc, root)
            return

        yield from self._check_meta(doc, head)
        yield from self._check_head_children(doc, head)
        yield from self._check_data_collection(doc, head)
        yield from self._check_duplicate_ids(doc, root)

    # ------------------------------------------------------------------ helpers

    def _f(self, doc, code, severity, message, el) -> Finding:
        line = getattr(el, "sourceline", 0) or 0
        return Finding(
            code=code,
            severity=severity,
            message=message,
            file=doc.path,
            line=line,
            check=self.name,
        )

    def _check_root(self, doc, root) -> Iterable[Finding]:
        if root.tag != q(XHTML, "html"):
            yield self._f(
                doc,
                "WS101",
                Severity.ERROR,
                f"루트 요소는 xhtml:html 이어야 합니다(현재: {root.tag}).",
                root,
            )
        declared = set((root.nsmap or {}).values())
        for prefix, uri in REQUIRED_NAMESPACES.items():
            if uri not in declared:
                yield self._f(
                    doc,
                    "WS102",
                    Severity.WARNING,
                    f"필수 네임스페이스 '{prefix}'({uri}) 선언이 없습니다.",
                    root,
                )

    def _check_meta(self, doc, head) -> Iterable[Finding]:
        for attr in ("meta_screenId", "meta_screenName"):
            if not (head.get(attr) or "").strip():
                yield self._f(
                    doc,
                    "WS111",
                    Severity.WARNING,
                    f"<head> 에 @{attr} 가 없습니다.",
                    head,
                )

    def _check_head_children(self, doc, head) -> Iterable[Finding]:
        for label, uri, local, severity in REQUIRED_HEAD_CHILDREN:
            if head.find(q(uri, local)) is None:
                yield self._f(
                    doc,
                    "WS112",
                    severity,
                    f"<head> 에 필수 자식 <{label}> 가 없습니다.",
                    head,
                )

    def _check_data_collection(self, doc, head) -> Iterable[Finding]:
        model = head.find(q(XF, "model"))
        if model is None:
            return  # WS112 가 이미 보고.
        dc = model.find(q(W2, "dataCollection"))
        if dc is None:
            yield self._f(
                doc,
                "WS113",
                Severity.WARNING,
                "<xf:model> 안에 <w2:dataCollection> 이 없습니다.",
                model,
            )
            return
        base = dc.get("baseNode")
        if base is not None and base not in VALID_BASE_NODES:
            yield self._f(
                doc,
                "WS114",
                Severity.WARNING,
                f"dataCollection/@baseNode 값이 비정상입니다: '{base}' "
                f"(허용: {', '.join(sorted(VALID_BASE_NODES))}).",
                dc,
            )

    def _check_duplicate_ids(self, doc, root) -> Iterable[Finding]:
        seen: dict[str, int] = {}
        for el in root.iter():
            # 주석/PI 등 비요소 노드는 tag 가 문자열이 아니다.
            if not isinstance(el.tag, str):
                continue
            el_id = el.get("id")
            if not el_id:
                continue
            line = getattr(el, "sourceline", 0) or 0
            if el_id in seen:
                yield Finding(
                    code="WS120",
                    severity=Severity.ERROR,
                    message=f"중복된 id='{el_id}' (최초 정의: {seen[el_id]} 행).",
                    file=doc.path,
                    line=line,
                    check=self.name,
                )
            else:
                seen[el_id] = line
