# WebSquare XML Conversion Specification & Claude Code Execution Guide

WebSquare XML 소스를 GCC 공통함수 체계·표준 JS 규칙으로 자동 변환하기 위한 Claude Code 실행 지침서이자 규칙 정의서입니다.

이 문서는 **인덱스**입니다. 세부 내용은 아래 분리 문서를 참조하세요.

| 문서 | 내용 |
| --- | --- |
| [conversion_process_overview.md](conversion_process_overview.md) | **변환 프로세스 전체 개요·구조도**(단계 0~2 흐름, 디렉터리/도구 구조도, 규칙 1~23 요약, UI 공통 프레임워크·공통개발자 필요성) |
| [conversion_rules.md](conversion_rules.md) | **세부 변환 규칙(규칙 1~11)** + 규칙 6 Submission 변환 상세 + Claude Code용 영문 프롬프트 |
| [substitution_map.md](substitution_map.md) | **레거시 → gcc 공통함수 치환 매핑표**(`$c.*` namespace별 AS-IS/TO-BE) |
| [conversion_pipeline.md](conversion_pipeline.md) | **하이브리드 변환 파이프라인**(Python 기계 치환 → Claude Code 보강 2단계) |
| [dynamic_submission_guide.md](dynamic_submission_guide.md) | **URL/DataID 패턴 기반 동적 Submission 변환 지침**(규칙 12 상세) |
| [code-convention.md](../../docs/code-convention/code-convention.md) | **업무 화면 5단계 정형화 구조 컨벤션**(규칙 2·4 구조 규약 + 서브미션 async/await 순차 실행 원칙) |

---

## 1. 개요 및 변환 목표
* **목적**: 기존 구조의 WebSquare XML 파일을 분석하여 신규 GCC 공통 표준(컴포넌트 제어, 컴포넌트 속성 대입 → setter API 치환(`.value`→`setValue`, `.src`→`setBackgroundImage`), 동적 Submission, 엄격한 타입 비교 등)으로 일괄 자동 변환.
* **변환 대상**: XML 파일 내의 `<script>` 영역(JavaScript) 및 `<body>` 영역(UI XML 컴포넌트 마크업).
* **컨텍스트 가이드 파일** (repo 루트 기준):
    * `src/docs/sbm-generator/README.md` · `sbm-generator.html` (Submission 치환 가이드/참고)
    * `src/docs/api/{fil,ins,mgt}/index_transfer.html` (**레거시 → gcc 치환 목록**, 모듈별 `DATA` 배열이 단일 출처)
    * `src/docs/api/gcc/index.html` (`$c.*` API 레퍼런스 — 치환 함수 시그니처 확인)

---

## 2. 세부 변환 규칙 (Rules)

규칙 1~11 및 규칙 6 Submission 변환 상세는 별도 문서로 분리되었습니다 → **[conversion_rules.md](conversion_rules.md)**

---

## 3. 레거시 → gcc 공통함수 치환 매핑표 (Substitution Map)

대표 매핑표는 별도 문서로 분리되었습니다 → **[substitution_map.md](substitution_map.md)**

`src/docs/api/{fil,ins,mgt}/index_transfer.html` 의 `DATA` 배열을 namespace(`$c.str`/`$c.num`/`$c.date`/`$c.validate`/`$c.util`/`$c.win`/`$c.sbm`/`$c.data`·`$c.session`·`$c.print`) 기준으로 통합한 AS-IS → TO-BE 대표 매핑과 태그(검토/대체) 정보를 담고 있습니다. 규칙 7 치환 시 해당 문서를 참조하세요.

---

## 4. 하이브리드 변환 파이프라인 (Python 기계 치환 → Claude Code 보강)

단계별 파이프라인(영역 분리 → Python 결정적 치환(규칙 1~12) → Claude Code 보강 → 검증)은 별도 문서로 분리되었습니다 → **[conversion_pipeline.md](conversion_pipeline.md)**

---

## 5. URL/DataID 패턴 기반 동적 Submission 변환 지침 (규칙 12)

`{dataCollection}.DataID = encode({url})` + `{dataCollection}.reset();` 패턴을 `$c.sbm.executeDynamic` 으로 전환하는 독립 지침은 별도 문서로 분리되었습니다 → **[dynamic_submission_guide.md](dynamic_submission_guide.md)**
