"""wsxml_lint — WebSquare XML 오류 검사/파싱 모듈 (lxml 기반).

빠른 사용:

    from wsxml_lint import Linter
    report = Linter().lint_paths(["websquare/common/gcc_sample"])
    print(report.error_count, report.warning_count)
    for f in report.findings:
        print(f.format_text())
"""

from .document import WsDocument
from .linter import DEFAULT_CHECKS, Linter
from .model import FileResult, Finding, LintReport, Severity

__all__ = [
    "Linter",
    "DEFAULT_CHECKS",
    "WsDocument",
    "Finding",
    "FileResult",
    "LintReport",
    "Severity",
]

__version__ = "0.1.0"
