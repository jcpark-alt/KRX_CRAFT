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

## form 제출 재설계 — $c.win.openFormSubmit 전환 (2026-09-07)

as-is JSP 의 searchForm 제출 기계부(`scwin.form = document.searchForm` + `form.action` 설정 + submit)를 gcc 공통함수 `$c.win.openFormSubmit(url, params)` 기반으로 재설계했다. 중간 산출물이던 executeDynamic 서브미션(tx_viewDetail·tx_fn_Search·tx_fn_EditStatus, AJAX 재해석)은 JSP 페이지 전환 의미와 어긋나 제거하고, 각 제출 지점이 openFormSubmit 을 직접 호출한다(POST 기본 = as-is form POST).

### 제출 지점별 전환표

| 제출 지점 | 구 흐름 | URL | params 근거 |
|-----------|---------|-----|-------------|
| `viewDetail(bzProcsNo, strLoadTp)` | `scwin.form.action` 설정 + dma_viewDetailReq set(bzProcsNo·method=`editForm`·loadTp) + tx_viewDetail(executeDynamic) | `/listInvstg/specyValuAppl.do` | `dma_viewDetailReq.getJSON()` — set 3건 반영 후 전문 전체(beginIndex·bzProcsNo·isurCd·ldMktTpCd·loadTp·method·pageIndex·pageSize·regId = as-is searchForm hidden 필드 집합) |
| `fn_Search()` | `scwin.form.action` 설정 + tx_fn_Search(executeDynamic, ref dma_SearchReq) | `/listInvstg/specyValuAppl.do` | `dma_viewDetailReq.getJSON()` — as-is 는 method 재설정 없이 searchForm 현재 값 그대로 제출. 화면 바인딩(slc_pageSize ref·pageIndex set)이 전부 dma_viewDetailReq 라 이를 params 원천으로 확정(구 ref 였던 dma_SearchReq 는 바인딩 0건·항상 빈 전문 — Stage-2 산출 결함) |
| `fn_EditStatus(bzProcsNo, strMethod, strMsg)` | `scwin.form.action` 설정 + dma_viewDetailReq set(method·bzProcsNo) + confirm + tx_fn_EditStatus(executeDynamic, ref dma_EditStatusReq) | `/listInvstg/specyValuAppl.do` | `dma_viewDetailReq.getJSON()` — set 2건(method=`applSubmit` 등) 반영 후 전문 전체(dma_EditStatusReq 도 바인딩 0건이라 미사용) |

- method 파라미터: 3지점 모두 `options.method` 미지정 = **POST** (as-is searchForm POST 제출과 동일), target `_self`(페이지 전환).
- `viewDetail`·`fn_Search` 는 내부 await 소멸로 동기 함수화(호출부 `await` 는 무해하여 유지).

### 정리(제거) 항목

- `scwin.form = null`(1구역)·`scwin.form = (document.searchForm || { elements: [] })`(init_pageBody) 전역·폴백 제거 — 전환 후 참조 전수 0건 확인. init_pageBody JSDoc·onpageload 순번 주석 동반 갱신.
- tx_viewDetail·tx_fn_Search·tx_fn_EditStatus 함수 3종 삭제(publicInfo 비등재라 XML 무변경). 4구역 헤더는 사유 주석으로 대체.
- dataCollection 의 `dma_SearchReq`·`dma_EditStatusReq` 는 스크립트 참조 0건의 고아가 되었으나 body/dataCollection 무변경 원칙에 따라 XML 은 유지(후속 정리 후보).

### 보류

- 없음 (이 화면은 파일 전송 폼 없음).

### 검증

- script CDATA 추출 → `node --check` 통과.
- `python -m wsxml_lint jldfil59400.xml --min-severity error` → 0 errors.
- `document.searchForm`·`.submit()`·`scwin.form`·`tx_*` 잔존 0건 = 보류 목록(0건)과 일치.
