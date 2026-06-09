"""명령행 인터페이스: WebSquare XML 의 JSDoc 으로 API 문서(HTML)를 생성한다.

사용 예:
    python -m wsxml_lint.docgen src/gcc -o src/docs/api/gcc
    wsxml-doc src/gcc -o out --title "gcc API"
"""

from __future__ import annotations

import argparse
import os
import sys

from .extractor import extract_modules
from .render import render_site


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="wsxml-doc",
        description="WebSquare XML(JSDoc) -> API 문서(HTML) 생성기",
    )
    p.add_argument("paths", nargs="+", help="입력 .xml 파일 또는 디렉터리")
    p.add_argument("-o", "--out", default="docs/api",
                   help="출력 디렉터리 (기본: docs/api). index.html 이 생성된다.")
    p.add_argument("--title", default="gcc API 문서", help="문서 제목")
    return p


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    modules = extract_modules(args.paths)
    if not modules:
        print("문서화할 .xml 파일을 찾지 못했습니다.", file=sys.stderr)
        return 1

    os.makedirs(args.out, exist_ok=True)
    out_file = os.path.join(args.out, "index.html")
    with open(out_file, "w", encoding="utf-8") as fh:
        fh.write(render_site(modules, title=args.title))

    total = sum(len(m.methods) for m in modules)
    nonempty = sum(1 for m in modules if m.methods)
    print(f"생성 완료: {out_file}  ({nonempty} modules, {total} methods)")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
