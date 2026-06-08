"""검사 결과를 표현하는 데이터 모델.

- Severity : 심각도 (INFO < WARNING < ERROR)
- Finding  : 단일 검사 결과 1건 (코드, 위치, 메시지)
- FileResult : 한 파일에 대한 Finding 집합
- LintReport : 여러 파일의 FileResult 집합
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import IntEnum


class Severity(IntEnum):
    """심각도. IntEnum 이라 임계값 비교(>=)에 그대로 쓸 수 있다."""

    INFO = 10
    WARNING = 20
    ERROR = 30

    @property
    def label(self) -> str:
        return self.name

    @classmethod
    def from_name(cls, name: str) -> "Severity":
        try:
            return cls[name.strip().upper()]
        except KeyError as exc:
            valid = ", ".join(s.name for s in cls)
            raise ValueError(f"알 수 없는 severity '{name}'. 가능한 값: {valid}") from exc


@dataclass(frozen=True)
class Finding:
    """검사 1건의 결과.

    code     : 안정적인 규칙 식별자 (예: 'WS101'). 무시/선택 필터의 키.
    severity : 심각도.
    message  : 사람이 읽는 설명.
    file     : 대상 파일 경로.
    line/column : 1-기준 위치. 0 이면 위치 정보 없음.
    check    : 이 Finding 을 만든 검사기 이름.
    """

    code: str
    severity: Severity
    message: str
    file: str
    line: int = 0
    column: int = 0
    check: str = ""

    def format_text(self) -> str:
        """`path:line:col [SEVERITY] CODE message` 형식 한 줄."""
        loc = self.file
        if self.line:
            loc += f":{self.line}"
            if self.column:
                loc += f":{self.column}"
        return f"{loc} [{self.severity.label}] {self.code} {self.message}"

    def to_dict(self) -> dict:
        return {
            "file": self.file,
            "line": self.line,
            "column": self.column,
            "severity": self.severity.label,
            "code": self.code,
            "check": self.check,
            "message": self.message,
        }


@dataclass
class FileResult:
    """한 파일의 검사 결과."""

    file: str
    findings: list[Finding] = field(default_factory=list)

    def add(self, finding: Finding) -> None:
        self.findings.append(finding)

    def count(self, severity: Severity) -> int:
        return sum(1 for f in self.findings if f.severity == severity)

    @property
    def error_count(self) -> int:
        return self.count(Severity.ERROR)

    @property
    def warning_count(self) -> int:
        return self.count(Severity.WARNING)

    @property
    def ok(self) -> bool:
        """에러가 하나도 없으면 통과로 본다(경고는 통과)."""
        return self.error_count == 0


@dataclass
class LintReport:
    """여러 파일의 종합 결과."""

    results: list[FileResult] = field(default_factory=list)

    def add(self, result: FileResult) -> None:
        self.results.append(result)

    @property
    def findings(self) -> list[Finding]:
        return [f for r in self.results for f in r.findings]

    @property
    def error_count(self) -> int:
        return sum(r.error_count for r in self.results)

    @property
    def warning_count(self) -> int:
        return sum(r.warning_count for r in self.results)

    @property
    def ok(self) -> bool:
        return all(r.ok for r in self.results)

    def to_dict(self) -> dict:
        return {
            "summary": {
                "files": len(self.results),
                "errors": self.error_count,
                "warnings": self.warning_count,
                "ok": self.ok,
            },
            "findings": [f.to_dict() for f in self.findings],
        }
