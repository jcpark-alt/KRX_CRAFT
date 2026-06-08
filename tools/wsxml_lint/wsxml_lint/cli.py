"""명령행 인터페이스.

사용 예:
    python -m wsxml_lint websquare/common/gcc_sample
    python -m wsxml_lint cm.xml --format json
    python -m wsxml_lint . --xsd schema/websquare.xsd --min-severity warning
    python -m wsxml_lint . --ignore WS111,WS201

종료 코드:
    0  에러 없음(경고는 허용)
    1  에러 1건 이상
    2  잘못된 사용(인자 오류 등)
"""

from __future__ import annotations

import argparse
import json
import sys

from .linter import DEFAULT_CHECKS, Linter
from .model import LintReport, Severity


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="wsxml_lint",
        description="WebSquare XML 오류 검사/파싱 도구 (lxml 기반)",
    )
    p.add_argument("paths", nargs="+", help="검사할 .xml 파일 또는 디렉터리")
    p.add_argument("--xsd", help="XSD 스키마 파일(주면 Level4 스키마 검증 활성화)")
    p.add_argument(
        "--format",
        choices=["text", "json"],
        default="text",
        help="출력 형식 (기본: text)",
    )
    p.add_argument(
        "--min-severity",
        default="info",
        help="이 심각도 미만은 숨김: info|warning|error (기본: info)",
    )
    p.add_argument("--select", help="이 코드들만 보고 (콤마구분, 예: WS101,WS120)")
    p.add_argument("--ignore", help="이 코드들은 제외 (콤마구분, 예: WS111,WS201)")
    p.add_argument(
        "--quiet",
        action="store_true",
        help="요약만 출력(개별 Finding 생략)",
    )
    return p


def _csv_set(value: str | None) -> set[str] | None:
    if not value:
        return None
    return {c.strip() for c in value.split(",") if c.strip()}


def _build_linter(args) -> Linter:
    checks = [c() for c in DEFAULT_CHECKS]
    if args.xsd:
        # 지연 import: lxml 미설치/스키마 오류를 사용 시점에만 발생시킨다.
        from .checks.schema import SchemaCheck, SchemaError

        try:
            checks.append(SchemaCheck(args.xsd))
        except SchemaError as exc:
            print(f"error: {exc}", file=sys.stderr)
            raise SystemExit(2)
    return Linter(
        checks=checks,
        select=_csv_set(args.select),
        ignore=_csv_set(args.ignore) or set(),
        min_severity=Severity.from_name(args.min_severity),
    )


def _print_text(report: LintReport, quiet: bool) -> None:
    if not quiet:
        for result in report.results:
            for finding in result.findings:
                print(finding.format_text())
    print(
        f"\n{len(report.results)} files, "
        f"{report.error_count} errors, {report.warning_count} warnings"
    )


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    try:
        linter = _build_linter(args)
    except SystemExit as exc:  # _build_linter 가 종료 코드 2 로 빠짐
        return int(exc.code or 2)
    except ValueError as exc:  # min-severity 오타 등
        print(f"error: {exc}", file=sys.stderr)
        return 2

    report = linter.lint_paths(args.paths)

    if args.format == "json":
        print(json.dumps(report.to_dict(), ensure_ascii=False, indent=2))
    else:
        _print_text(report, args.quiet)

    return 0 if report.ok else 1


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
