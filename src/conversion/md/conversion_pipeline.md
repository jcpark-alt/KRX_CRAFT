# 하이브리드 변환 파이프라인 (Python 기계 치환 → Claude Code 보강)

> 이 문서는 [websquare_conversion_guide.md](websquare_conversion_guide.md) 의 **§4 하이브리드 변환 파이프라인** 본문입니다. 규칙 정의는 [conversion_rules.md](conversion_rules.md), 규칙 7 치환 매핑표는 [substitution_map.md](substitution_map.md) 를 참조하세요.

규칙 1~7 중 **판단이 필요 없는 단순 치환·코드 재배치**는 Python 으로 일괄(기계어) 처리하고, **판단·재설계가 필요한 부분만** Claude Code 로 보강하는 2단계 워크플로우입니다. 대량 파일을 빠르고 일관되게, 그리고 비용 효율적으로 변환하는 것이 목적입니다.

> 기준 파일 예시: `src/conversion/next-krx-lds-fil-front/ui/ULDCOM00007.xml` — `head(3~430) → script CDATA(22~429) → body(431~568)` 구조.

## 전제 — 파일을 3개 영역으로 분리

WebSquare XML 은 `head(xml) → script(JavaScript, CDATA) → body(xml)` 구조이고, 영역마다 변환 성격이 달라 **영역을 먼저 분리한 뒤 영역별 변환기**를 적용합니다.

| 영역 | 범위 | 내용 | 주요 변환 |
| --- | --- | --- | --- |
| **HEAD** (xml) | `<head>` ~ `</head>` 중 `<script>` 제외 | `meta_*`, `<w2:dataCollection>`, `<xf:submission>` | 규칙 6(submission 파싱·삭제), 메타 보존 |
| **SCRIPT** (js) | `<script ...><![CDATA[` ~ `]]></script>` 내부 | 전역변수·이벤트함수·일반함수 JavaScript | 규칙 1·2·4·5·7 의 대부분 |
| **BODY** (xml) | `<body>` ~ `</body>` | UI 컴포넌트 마크업 + `ev:on*` 핸들러 속성 | 규칙 3(핸들러명 동기화) |

* 경계 추출은 정규식/문자열 인덱스로 결정적으로 가능합니다: `<script ...><![CDATA[` 와 `]]></script>` 사이가 SCRIPT, 그 바깥의 `<head>`/`<body>`.
* **영역 인식이 핵심**입니다. SCRIPT 변환기는 CDATA 내부만, BODY 변환기는 `ev:on*` 속성만 건드립니다. body 의 `<xf:label><![CDATA[가]]></xf:label>` 같은 **한글 UI 텍스트는 절대 치환 대상이 아닙니다.**

## 단계 1 — Python 기계 치환 (결정적 변환)

"입력이 같으면 출력이 항상 같은" **결정적(deterministic)** 변환만 Python 으로 일괄 처리합니다. 판단이 필요 없는 1:1 규칙이 대상입니다.

> **참조 구현**: `src/conversion/tools/convert.py` — 영역 분리 + 규칙 1~12 결정적 치환(문자열/주석/정규식 보호)과 단계 2 리포트 출력. 규칙 7 은 `gcc_mapping.substitution_dict()` 를 단일 출처로 쓰고, 검토/대체 태그·충돌 함수는 자동 치환하지 않고 리포트로 분리합니다. 마지막에 포매팅을 적용합니다: **`//----W-Craft` 마커 주석을 바로 아래 코드 라인의 들여쓰기에 맞춰 정렬**, **함수 단위 빈 줄 1개 삽입**, **함수 주석 맨앞(컬럼 0) 정렬**. 일괄 실행은 `src/conversion/tools/convert_all.py`.
> 실행: `python src/conversion/tools/convert.py <src.xml> [out.xml]`

| 규칙 | 처리 영역 | Python 처리 방식 | 비고 |
| --- | --- | --- | --- |
| 규칙 1 파일명 변수 | SCRIPT | 파일명 추출 → `scwin.vScrenID = "{파일명}";` 최상단 삽입(없을 때만) | 멱등 |
| 규칙 2 전역변수 이동 | SCRIPT | 최상위 `scwin.X = <리터럴>;` 만 `// 전역 변수 선언` 구역으로 이동 | 호출/참조 RHS(예: `$c.x.f()`)는 실행순서 영향으로 이동 보류·리포트 |
| 규칙 4 영역 재배치 | SCRIPT | 함수 정의를 init/event/일반 3구역으로 분류·정렬(경계 주석+doc 주석 동반). `gform_onload`→`onpageload` 병합은 안전조건에서만 | 함수 사이/뒤 최상위 실행문 있으면 보류·리포트 |
| 규칙 5 문법/API | SCRIPT | `==`/`!=` → `===`/`!==`, `X.value = v` → `X.setValue(v)`, `X.src = v` → `X.setBackgroundImage(v)`, `X.getTotalRow()` → `X.getRowCount()` | 문자열·정규식·주석 리터럴 보호. 속성 대입은 읽기 제외, 메서드명 치환은 수신 객체·인자 보존 |
| 규칙 6 Submission | HEAD+SCRIPT | 정적 action + 단순 `execute(id)` 만, 호출 앞에 `const sbmOptions = {...}` 선언 후 `executeDynamic(sbmOptions)` 로 변환 + 노드 삭제. target ID 역추적으로 body `<w2:gridView>` id 를 `gridview` 자동 삽입 | 동적 action/속성변형은 sbmOptions 스텁과 함께 리포트(`sbm-generator` 로직 이식) |
| 규칙 7 (1:1) | SCRIPT | **태그 없는** 매핑만 함수명 단어경계 치환 (`fn_Trim(` → `$c.str.trim(`) | `gcc_mapping.substitution_dict()` 사용(태그없음·무충돌) |
| 규칙 7m 메서드 치환 | SCRIPT | 레거시 메서드 호출 `{객체}.CloseFrame()` 전체를 인자 없는 `$c.win.closePopup()` 로 치환(수신 객체 제거, `await` 보존) | `_METHOD_CALL_MAP` 사용. 인자 있는 호출은 보류·리포트, 직전 W-Craft 마커 함께 제거. 매핑은 [substitution_map.md](substitution_map.md) §10·§6 |
| 규칙 7n 모듈명 정규화 | SCRIPT | 이미 `$c.<ns>.` 붙은 레거시명 정규화 `$c.stf.fn_setFromToDate(` → `$c.stf.setFromToDate(` (같은 ns, 이름만, 인자 보존) | `gcc_mapping.module_fn_dict()`(SOT: `src/as-is/*/gcc/*.xml` JSDoc, [substitution_map.md](substitution_map.md) §9) 사용. 네임스페이스 변경/태그 매핑·미정의 함수는 제외(단계 2) |
| 규칙 3 (동기화) | SCRIPT+BODY | 이벤트명 소문자화 + `ev:on*` 속성 ↔ 스크립트 함수명 **동시** 수정 | 이름변경 사전(dict) 공유 |
| 규칙 8 `var`→`const`/`let` | SCRIPT | 재할당 분석: 단일 할당 → `const`, 재할당·카운터 → `let` | 호이스팅·재선언 의존 시 Claude 검토 |
| 규칙 9 불필요 호출 제거 | SCRIPT | `$c.cm.ShowWin/ShowNoData/CloseWin/ShowTrWin/CloseTrWin` 단독 statement 삭제(주석 흔적 포함) | 중괄호 없는 제어문 본문은 보류·리포트 |
| 규칙 10 이벤트요소 삭제 | BODY(XML) | `<xf:events>...</xf:events>` 블록 및 `<xf:event .../>` 요소 전부 삭제(주석 블록 포함) | `ev:on*` 속성으로 대체됨(규칙 3) |
| 규칙 11 include 삭제 | SCRIPT | `include(...)` 로 시작하는 라인 삭제(주석 형태 포함) | gcc 는 `$c.*` 로 제공되어 불필요 |
| 규칙 13 `scwin.fn_*` 함수명 정규화 | HEAD+SCRIPT+BODY | 정의된 `scwin.fn_*` 함수의 `fn_` 제거 + camelCase(`fn_setFromToDate`→`setFromToDate`) 후 정의·호출부(script 호출, body `ev:on*`, head publicInfo/submission) 동기화 | 같은 파일 정의 함수만(로컬 우선). 외부 호출(`fn_GetPar` 등)·이름 충돌(`fn_search`/`fn_Search`→`search`)은 보류·리포트 |
| 규칙 12 DataID/reset → executeDynamic | SCRIPT | 같은 스코프의 `{DC}.DataID = encodeURI({url})`(주석 변형 포함) + `{DC}.reset()` 쌍을 `const sbmOptions = {...}` + `executeDynamic(sbmOptions)` 로 전환. action 은 URL 의 `?` 앞 경로, `ref:""`/`target:"{DC}=body.content"`/`submitDoneHandler:scwin.sbm_{DC}_submitdone`/`isProcessMsg:false` 자동 생성. url 변수·`.reset()`·W-Craft 주석 제거 | action URL(또는 url 변수) 해석 실패·짝 reset 없음은 미변환·리포트. 스코프별 `sbmOptions`/`2`… 명명. 상세는 [dynamic_submission_guide.md](dynamic_submission_guide.md) |

**기계 치환 원칙**
* **단어경계 매칭**: 함수명 치환은 `\b함수명\s*\(` 처럼 호출부만 매칭하여 부분 문자열 오치환을 막습니다. `replaceAll`·`trim` 등 흔한 이름은 특히 주의(원시 String 메서드와 충돌 가능).
* **멱등성(idempotent)**: 변환본을 다시 돌려도 결과가 동일해야 합니다 — 예: `scwin.vScrenID` 중복 삽입 금지.
    * 단, **이미 `$c.*` 로 바뀐 호출이라도 치환 매핑표([substitution_map.md](substitution_map.md))의 TO-BE(gcc) 항목에 해당하는 함수라면 치환(정규화) 대상에 포함**합니다. 즉, "`$c.*` 이면 무조건 건너뛴다"가 아니라 **TO-BE 목록 기준으로 판정**합니다.
    * 이 경우에도 이미 올바른 TO-BE 형태면 동일한 결과로 수렴하므로(재치환 = 같은 함수로의 no-op) 멱등성은 유지됩니다. 비표준/구버전 `$c.*` 호출이 TO-BE 항목에 매핑되어 있다면 표준 형태로 정규화됩니다.
* **리터럴 보호**: `==`→`===` 같은 치환은 문자열/정규식/주석 내부를 건드리지 않도록 토큰 단위로 처리합니다.
* **산출물**: ① 변환본 XML, ② 변환 전/후 diff, ③ **자동 치환하지 못한 항목 리포트**(검토/대체 태그, 시그니처 불일치 의심, 매핑표 미존재 함수)를 남겨 단계 2 의 입력으로 사용합니다.

## 단계 2 — Claude Code 보강 (판단 필요 변환)

Python 이 남긴 **"추가 작업 목록"만** Claude Code 로 처리합니다. 기계가 판단하기 어려운 부분이 대상입니다.

* **검토 태그 매핑**: 시그니처·기본값·반환형이 다른 함수(`toNum`→`$c.num.parseFloat`, `showObj`→`$c.validate.setComponentProperty`, `cIsBupin`→`$c.str.isBizID` 등) — 인자 순서/개수를 확인해 조정.
* **대체 태그 매핑**: 원시 XHR/`sendMessage` → `$c.sbm.execute`/`executeDynamic` 재작성, jQuery 풍 `$()` → `$c.util.getComponent`. 콜백·응답 처리 구조 재설계.
* **인자 형태 변환**: 의미는 같아도 레거시와 gcc 함수의 인자 형태가 다른 경우(날짜 가감 방향, 포맷 문자열 규칙, 반환 타입 등).
* **모호·충돌**: 같은 이름이 파일마다 다른 의미이거나, 치환 매핑표([substitution_map.md](substitution_map.md))에 없는 커스텀 로직.
* **검증**: 의미 보존 확인, 잔존 레거시 호출/미사용 정의 정리, `npm run lint:xml`(`wsxml_lint`) 통과 확인.

## 권장 실행 순서

1. **(Python)** 대상 파일을 HEAD/SCRIPT/BODY 3영역으로 분리한다.
2. **(Python)** 단계 1 결정적 규칙을 일괄 적용 → 변환본 + 리포트(미처리·검토 항목)를 생성한다.
3. **(Claude)** 리포트의 *검토·대체* 항목을 치환 매핑표([substitution_map.md](substitution_map.md))와 `gcc/index.html` 시그니처를 기준으로 보강한다.
4. **(Claude)** 잔존 레거시 호출을 grep 으로 점검하고, 의미를 검증한 뒤 `npm run lint:xml` 로 마무리한다.

> 역할 분담 요약: **Python = 양·일관성·속도**(결정적 1:1 치환·재배치), **Claude Code = 판단·재설계·검증**(검토/대체 매핑, 통신 재작성, 최종 확인).
