# wsxml_lint — WebSquare XML 검사/파싱 모듈

`lxml` 기반으로 WebSquare `.xml` 페이지 정의를 파싱하고 4단계 수준으로 오류를 검사한다.

```
tools/wsxml_lint/
├── wsxml_lint/
│   ├── __init__.py        # 공개 API (Linter, Severity, ...)
│   ├── namespaces.py      # 4개 네임스페이스 상수 + q() 헬퍼
│   ├── model.py           # Severity / Finding / FileResult / LintReport
│   ├── document.py        # WsDocument — lxml 파싱 + well-formedness 수집
│   ├── linter.py          # 오케스트레이터(파일/디렉터리 수집, 필터)
│   ├── cli.py             # python -m wsxml_lint
│   ├── __main__.py
│   └── checks/
│       ├── base.py        # Check 인터페이스
│       ├── wellformed.py  # Level 1  (WS00x)
│       ├── structure.py   # Level 2  (WS1xx)
│       ├── references.py  # Level 3  (WS2xx)
│       └── schema.py      # Level 4  (WS4xx, --xsd 시에만)
├── tests/test_wsxml_lint.py
├── conftest.py
├── pyproject.toml
└── requirements.txt
```

## 설계 개요

```
            paths ──▶ Linter._expand ──▶ [*.xml ...]
                                              │
                          각 파일마다          ▼
            WsDocument.load ──▶ lxml 엄격 파싱 ──┐
                                              │ 실패 시 recover 파싱
                                              ▼
              ┌──────────── 공유 WsDocument ────────────┐
              │  .tree / .recovered_tree / .text        │
              └───────────────────┬─────────────────────┘
                                  ▼
          [WellFormed] [Structure] [References] (+[Schema])
                                  │  각 검사기는 Finding 들을 yield
                                  ▼
                    Linter 필터(select/ignore/min-severity)
                                  ▼
                      FileResult ─▶ LintReport ─▶ text/json
```

**핵심 설계 결정**

- **파싱 1회, 검사 N개 공유.** `WsDocument` 가 lxml 파싱을 한 번 수행하고
  모든 검사기가 같은 트리를 재사용한다(대용량 XML 에서 중복 파싱 방지).
- **깨진 파일도 부분 검사.** 엄격 파싱이 실패하면 well-formedness 오류를 보고하되,
  `recover=True` 트리로 구조/참조 검사를 best-effort 로 계속한다.
- **검사기는 플러그인.** `Check` 인터페이스(`run(doc) -> Iterable[Finding]`) 하나만
  구현하면 `linter.DEFAULT_CHECKS` 에 추가해 확장된다.
- **안정적인 규칙 코드.** 모든 Finding 은 `WSxxx` 코드를 가져 `--select`/`--ignore`
  로 정밀 제어한다(CI 점진 도입에 유리).
- **보안 기본값.** 외부 엔티티 해석/네트워크 비활성(XXE 방지).

## 검사 규칙

| 코드 | 레벨 | 심각도 | 내용 |
|------|------|--------|------|
| WS000 | - | error | 파일 읽기 실패 |
| WS001 | 1 | error | XML 문법 오류(태그 안 닫힘, 인코딩 등) |
| WS002 | 1 | error | 루트 요소 없음(빈 문서) |
| WS003 | 1 | warning | UTF-8 디코딩 실패 바이트(인코딩 불일치 의심) |
| WS101 | 2 | error | 루트가 `xhtml:html` 이 아님 |
| WS102 | 2 | warning | 필수 네임스페이스(w2/xf) 미선언 |
| WS110 | 2 | error | `<head>` 없음 |
| WS111 | 2 | warning | `head/@meta_screenId`·`@meta_screenName` 없음 |
| WS112 | 2 | error/warn | `head` 필수 자식 누락(type/model=error, layoutInfo/publicInfo=warn) |
| WS113 | 2 | warning | `xf:model` 안에 `w2:dataCollection` 없음 |
| WS114 | 2 | warning | `dataCollection/@baseNode` 가 map\|list 아님 |
| WS120 | 2 | error | 문서 내 `@id` 중복 |
| WS201 | 3 | warning | `publicInfo` 에 선언됐으나 CDATA 에 정의 없는 함수 |
| WS202 | 3 | warning | `publicInfo/@method` 항목이 비어있음 |
| WS400 | 4 | error | XSD 스키마 위반(`--xsd` 시) |

## 설치

이 머신에는 Python 이 설치돼 있지 않다(Microsoft Store stub 만 존재). 먼저 실제
Python 을 설치한다.

```powershell
# 1) Python 3.9+ 설치 (예: winget)
winget install Python.Python.3.12

# 2) 의존성 설치
cd tools\wsxml_lint
python -m pip install -r requirements.txt
#   또는 편집 설치:  python -m pip install -e .
```

> 참고: `lxml` 는 휠(wheel)로 배포되어 별도 컴파일러 없이 설치된다. 이 저장소가
> Jest 30 에서 겪는 네이티브 바인딩(`unrs-resolver`) 문제와는 무관하다.

## 사용

### CLI

```powershell
# 디렉터리 전체 검사
python -m wsxml_lint websquare\common\gcc_sample

# 단일 파일 + JSON 출력
python -m wsxml_lint websquare\common\gcc_sample\cm.xml --format json

# 경고 이상만, 특정 규칙 제외
python -m wsxml_lint . --min-severity warning --ignore WS111,WS201

# XSD 스키마 검증까지(Level 4)
python -m wsxml_lint . --xsd schema\websquare.xsd
```

종료 코드: `0` 에러 없음 · `1` 에러 있음 · `2` 사용법 오류. → CI 에 그대로 연결 가능.

### 라이브러리

```python
from wsxml_lint import Linter, Severity

report = Linter(min_severity=Severity.WARNING).lint_paths(
    ["websquare/common/gcc_sample"]
)
print(report.error_count, report.warning_count)
for f in report.findings:
    print(f.format_text())   # path:line:col [SEVERITY] CODE message
```

## 테스트

```powershell
cd tools\wsxml_lint
pytest            # 설치 없이도 conftest.py 가 경로를 잡아줌
```

## 확장 방법

새 검사를 추가하려면:

1. `checks/` 에 `Check` 하위 클래스를 만들고 `run(self, doc)` 에서 `Finding` 을 yield.
2. 새 규칙 코드(`WSxxx`)를 부여하고 위 표에 기록.
3. `linter.DEFAULT_CHECKS` 에 클래스를 등록.

검사기는 `doc.root`(lxml Element), `doc.text`(원본), `doc.tree` 를 자유롭게 사용한다.
```
