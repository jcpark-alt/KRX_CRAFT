"""Level 2 — WebSquare 구조 규칙 검사.

검사 항목:
- WS101 루트가 {xhtml}html 인가
- WS102 필수 네임스페이스(w2, xf) 선언 여부
- WS110 <head> 존재
- WS111 head/@meta_screenId, @meta_screenName 존재(경고)
- WS112 head 필수 자식(w2:type, xf:model, w2:layoutInfo, w2:publicInfo) 존재
- WS113 xf:model 안에 w2:dataCollection 존재
- WS114 dataCollection/@baseNode 값이 map|list 인지
- WS120 @id 중복 — WebSquare 스코프 규칙 반영:
  · <w2:dataMap>/<w2:dataList> 내부(key/column)의 id 는 컬렉션별 네임스페이스
    (같은 컬렉션 안의 중복만 오류 — 다른 컬렉션·전역과의 동일 이름은 전문 필드명 재사용으로 정상)
  · <w2:gridView> 내부 <w2:column> 의 id 는 그리드별 네임스페이스
    (바인딩된 dataList 컬럼 id 와의 일치는 규약상 필수 매핑이라 중복이 아님)
  · 그 외 요소의 id 는 기존대로 문서 전역에서 유일해야 함
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
        """@id 중복 검사 — WebSquare 스코프 규칙 반영(모듈 docstring WS120 참조).

        기존 '문서 전역 유일' 규칙은 (a) 서로 다른 DataCollection 간 전문 필드명 재사용과
        (b) gridView 컬럼 id ↔ 바인딩 dataList 컬럼 id 의 규약상 필수 일치를 오탐했다.
        컬렉션/그리드 내부 id 를 각자 스코프로 분리하고, 그 외 요소만 전역 검사한다.
        (새 규칙의 검출 집합은 기존 전역 규칙의 부분집합 — 기존 0-오류 기준선은 그대로 유지된다.)
        """
        data_map_tag = q(W2, "dataMap")
        data_list_tag = q(W2, "dataList")
        grid_tag = q(W2, "gridView")
        col_tag = q(W2, "column")

        def dup_findings(elements, scope_label):
            seen: dict[str, int] = {}
            for el in elements:
                el_id = el.get("id")
                if not el_id:
                    continue
                line = getattr(el, "sourceline", 0) or 0
                if el_id in seen:
                    yield Finding(
                        code="WS120",
                        severity=Severity.ERROR,
                        message=f"중복된 id='{el_id}' (최초 정의: {seen[el_id]} 행{scope_label}).",
                        file=doc.path,
                        line=line,
                        check=self.name,
                    )
                else:
                    seen[el_id] = line

        scoped: set = set()  # 전역 검사에서 제외할 요소들(컬렉션/그리드 내부 id)

        # 1) dataMap/dataList 내부(key/column 등) — 컬렉션별 스코프
        for coll in root.iter():
            if not isinstance(coll.tag, str) or coll.tag not in (data_map_tag, data_list_tag):
                continue
            label = "dataMap" if coll.tag == data_map_tag else "dataList"
            inner = [el for el in coll.iter() if isinstance(el.tag, str) and el is not coll]
            scoped.update(inner)
            yield from dup_findings(inner, f" — 같은 {label}({coll.get('id', '')}) 내부")

        # 2) gridView 내부 <w2:column> — 그리드별 스코프
        #    (바인딩 dataList 컬럼 id 와의 일치는 정상 매핑이므로 전역 비교 대상이 아니다)
        for grid in root.iter():
            if not isinstance(grid.tag, str) or grid.tag != grid_tag:
                continue
            cols = [el for el in grid.iter() if isinstance(el.tag, str) and el.tag == col_tag]
            scoped.update(cols)
            yield from dup_findings(cols, f" — 같은 gridView({grid.get('id', '')}) 내부")

        # 3) 그 외 요소 — 문서 전역 유일 (주석/PI 등 비요소 노드는 tag 가 문자열이 아니다)
        rest = (el for el in root.iter() if isinstance(el.tag, str) and el not in scoped)
        yield from dup_findings(rest, "")
