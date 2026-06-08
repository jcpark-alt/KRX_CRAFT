"""검사 오케스트레이터.

Linter 는 검사기 목록을 들고 파일/디렉터리를 받아 LintReport 를 만든다.
- 디렉터리는 재귀적으로 *.xml 을 수집한다.
- code(select/ignore) 와 최소 심각도로 Finding 을 필터링한다.
- 파싱 자체가 죽어도(파일 깨짐) 파일 단위로 격리해 나머지를 계속 검사한다.
"""

from __future__ import annotations

import os
from typing import Iterable

from .checks.base import Check
from .checks.references import ReferenceCheck
from .checks.structure import StructureCheck
from .checks.wellformed import WellFormedCheck
from .document import WsDocument
from .model import FileResult, Finding, LintReport, Severity

#: 기본 검사기(스키마는 --xsd 가 있을 때만 추가).
DEFAULT_CHECKS: list[type[Check]] = [
    WellFormedCheck,
    StructureCheck,
    ReferenceCheck,
]


class Linter:
    def __init__(
        self,
        checks: list[Check] | None = None,
        select: set[str] | None = None,
        ignore: set[str] | None = None,
        min_severity: Severity = Severity.INFO,
    ):
        self.checks: list[Check] = checks if checks is not None else [c() for c in DEFAULT_CHECKS]
        self.select = select
        self.ignore = ignore or set()
        self.min_severity = min_severity

    # ------------------------------------------------------------------ public

    def lint_file(self, path: str) -> FileResult:
        result = FileResult(path)
        try:
            doc = WsDocument.load(path)
        except OSError as exc:
            result.add(
                Finding(
                    code="WS000",
                    severity=Severity.ERROR,
                    message=f"파일을 읽을 수 없습니다: {exc}",
                    file=path,
                    check="loader",
                )
            )
            return result

        for check in self.checks:
            for finding in check.run(doc):
                if self._accept(finding):
                    result.add(finding)
        result.findings.sort(key=lambda f: (f.line, f.column, f.code))
        return result

    def lint_paths(self, paths: Iterable[str]) -> LintReport:
        report = LintReport()
        for path in self._expand(paths):
            report.add(self.lint_file(path))
        return report

    # ------------------------------------------------------------------ filters

    def _accept(self, finding: Finding) -> bool:
        if finding.severity < self.min_severity:
            return False
        if finding.code in self.ignore:
            return False
        if self.select is not None and finding.code not in self.select:
            return False
        return True

    @staticmethod
    def _expand(paths: Iterable[str]) -> list[str]:
        files: list[str] = []
        for path in paths:
            if os.path.isdir(path):
                for dirpath, _dirs, names in os.walk(path):
                    for name in sorted(names):
                        if name.lower().endswith(".xml"):
                            files.append(os.path.join(dirpath, name))
            else:
                files.append(path)
        return files
