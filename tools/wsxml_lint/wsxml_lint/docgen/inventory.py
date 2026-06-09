"""레거시 WebSquare XML 의 전체 함수 인벤토리 추출.

docgen.extractor 는 공개(publicInfo) JSDoc 메서드만 다루지만, 레거시(mgt/ins/stf)
분석에는 publicInfo 와 무관하게 **모든** `scwin.<name> = function (...)` 선언이 필요하다.
이 모듈은 그 전수 목록을 제공한다(이관/분류 보고서의 단일 진실원).

WsDocument(CDATA 언랩) + Linter._expand 를 재사용한다.
"""

from __future__ import annotations

import os
import re

from ..document import WsDocument
from ..linter import Linter
from ..namespaces import XHTML, q

# scwin.<name> = function (<args>)  — 공백/개행 허용.
_FUNC_RE = re.compile(r"scwin\.([A-Za-z0-9_$]+)\s*=\s*function\s*\(([^)]*)\)")


def _clean_args(args: str) -> str:
    return ", ".join(a.strip() for a in args.split(",") if a.strip())


def extract_file_functions(path: str) -> list[tuple[str, str, str]]:
    """한 파일의 (filename, name, signature) 목록(선언 순서, 중복 제거 안 함)."""
    doc = WsDocument.load(path)
    root = doc.root
    filename = doc.filename
    if root is None:
        return []
    script = "\n".join((s.text or "") for s in root.iter(q(XHTML, "script")))
    out: list[tuple[str, str, str]] = []
    for m in _FUNC_RE.finditer(script):
        name = m.group(1)
        out.append((filename, name, f"{name}({_clean_args(m.group(2))})"))
    return out


def extract_all_functions(paths) -> list[tuple[str, str, str]]:
    """경로(파일/디렉터리) 목록의 전체 함수 인벤토리(파일명 기준 정렬)."""
    rows: list[tuple[str, str, str]] = []
    for f in Linter._expand(paths):
        rows.extend(extract_file_functions(f))
    rows.sort(key=lambda r: (r[0].lower(), r[1].lower()))
    return rows


def _main(argv=None) -> int:  # pragma: no cover - 편의용 CLI
    import sys

    args = argv if argv is not None else sys.argv[1:]
    if not args:
        print("usage: python -m wsxml_lint.docgen.inventory <path> [<path>...]", file=sys.stderr)
        return 2
    rows = extract_all_functions(args)
    by_file: dict[str, int] = {}
    for filename, name, sig in rows:
        by_file[filename] = by_file.get(filename, 0) + 1
        print(f"{filename}\t{name}\t{sig}")
    print(f"\n# {len(rows)} functions across {len(by_file)} files", file=sys.stderr)
    for fn in sorted(by_file):
        print(f"#   {fn}: {by_file[fn]}", file=sys.stderr)
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(_main())
