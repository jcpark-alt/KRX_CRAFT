# jldfil59400 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `../krx_소스전환/jldfil59400.xml` → 정비본: `jsp-front/jldfil59400.xml` (2026-09-07)
> 기준: [code-convention.md](../../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 20건 | 전 함수 `@description`(한국어 구체 서술)·`@param {타입}`·`@returns {타입}`·`@example` 완비, 기존 `@method`/`@event`/`@name` 유지 |
| publicInfo 등재 | 6건 | 기계 패스 기적용 (`onpageload`·`grd_pageList_fillAct`·이벤트 핸들러 4) |
| let→const | 12건 | 재할당 없는 `let` 전환 (`binds`·`dl`·`r`·`corpSearchURL`·`token`·`doc` 등) + 캐싱 신규 `const` 9건 |
| var 전환 | 0건 | `var` 없음 |
| __ 지역변수 개명 | 3건 + 제거 2건 | `__rowCopies`→`rowCopies`, `__r0`→`renderRoot`/`scanRoot`(재할당 분해), `__doc`→`doc`; 미사용 핸들러 글루 `ev`/`event`/`__self` 2개소(`slc_pageSize_onchange`·`btn_newWrite_onclick`) 제거 |
| 과밀 라인 분해 | 10건 | 200자 초과 라인 전부 분해(최장 1,162자 `grd_pageList_oncellclick` 포함), 잔존 0 |
| onpageload 재배치 | 예 | 2구역 중간 → **2구역 최상단** 이동, `init_*` 5단계 호출에 순번 주석(1~5) 부여 |

동일 호출식 반복 `const` 캐싱: `readSessionValue(repIdYn)` ×3 → `readRepIdYn()` 헬퍼, `readValue(dma_page, …)` ×3 → `readPage(key)` 헬퍼, `r["listProcsStatCd"]` ×8 → `listProcsStatCd`, `getComponent('dma_viewDetailReq')` ×3(viewDetail)·×2(fn_EditStatus) → `viewDetailReq`.
`scwin.loadTp`/`scwin.returnVal` 적재 시점 계산(같은 `readValue` ×4 반복, 464·491자)은 최상위 `const` 신설 없이 **동일 `scwin.*` 필드 3단 대입**으로 축약(호출 1회화, 적재 타이밍 유지)하고 1구역으로 이동.
`fn_AdjReqPop` 의 미선언 전역 대입(`w`/`h`/`l`/`t`)은 `const` 지역 선언으로 전환(전역 유출 제거, 계산식 보존).

## 2. 화면 개요

코스닥 전문평가신청 목록 화면. 책임자 ID 여부에 따라 신규작성 버튼·안내 문구를 조건 표시하고, 목록 행의 처리상태 코드에 따라 상세 조회(loadTp 분기)·제출·수정요청 팝업(jldfil59410)으로 분기한다.

## 3. 보류(유지) 항목

- `fn_*`/`tx_fn_*` 함수명(정의·호출부), `== null` 관용구, `ev:ondataload`(dlt_pageList → `grd_pageList_fillAct`) 배선, body XML(publicInfo 포함) 일체.
- `grd_pageList_oncellclick` 의 중복 분기('30'/'35'/'37' 개별 if 와 도달 불가한 말미 `viewDetail(…, "9")`)는 as-is 로직 그대로 보존(동작 변경 금지).
- `scwin.loadTp`/`scwin.returnVal` 의 **스크립트 적재 시점 평가**(recvParam 이전) 타이밍 유지 — onpageload 내부로 옮기면 알림 동작이 달라질 수 있어 이동하지 않음.
- 문자열 id `__rb0`(textbox)·`__rowAct`(dataList 컬럼)는 마크업/데이터 식별자라 개명 대상 아님.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0) — 20/20
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0 (잔존 `__` 토큰은 문자열 id `__rb0`/`__rowAct` 뿐)
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과 (200자 초과 라인 0, XML well-formed)

## 5. 후속 정정 (wsxml_lint 전수 검사)

- WS120 중복 컬럼 id 재부여(규칙 27): grd_pageList 내 `column1`→`column1_2`, `column5`→`column5_2` — 스크립트 참조 0건 확인, 원본 유래 결함
