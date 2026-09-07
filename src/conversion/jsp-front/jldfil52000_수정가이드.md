# jldfil52000 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `krx_소스전환/jldfil52000.xml` → 정비본: `jsp-front/jldfil52000.xml` (2026-09-07)
> 기준: [code-convention.md](../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 20건 | 전 함수에 `@description`(본문 기반 구체 서술)·`@param {타입}`(한 줄 하나로 분리)·`@returns {타입}`·`@example`(이벤트 핸들러는 바인딩 자동 호출 표기) 보강, placeholder 0. 기존 `@method`/`@event`/`@name` 라인 유지 |
| publicInfo 등재 | 5건 | `grd_prtDepoList_fillAct`·`onpageload`·`grd_prtDepoList_oncellclick`·`krxpage_pagenavigator_78_onclick`·`btn_newWrite_onclick` (기계 패스에서 처리 완료 — 본 정비에서 변경 없음) |
| let→const | 11건 | `init_rowCopy`: `rowCopies` / `oncellclick`: `dl`·`r` / `btn_newWrite_onclick`: `ev`·`event`·`srcEl` / `fillAct`: `dl`·`r` / `fncSearch`: `pageIndex` / `fn_delete`: `rse` / `sendPrtDepoWithd`: `rse` (tx_* 4건의 `let res` 는 try 내 재할당이라 let 유지) |
| var 전환 | 0건 | 해당 없음 |
| __ 지역변수 개명 | 2건 | `init_rowCopy`: `__rowCopies`→`rowCopies` / `btn_newWrite_onclick`: `__self`→`srcEl` (컴포넌트 id `__rb0`·데이터 컬럼 `__rowAct` 는 지역변수가 아니므로 유지) |
| 과밀 라인 분해 | 3건 | ① `init_rowCopy` 표기 조립식(330자) → `readValue` 3회를 `totalCount`/`currentPage`/`totalPageCount` const 로 분해 ② `grd_prtDepoList_oncellclick` 단일 라인(약 1,900자) → 분기별 다중행 + `r["lstApprovYn"]`/`r["listProcsStatCd"]`/`r["prtdepoNo"]` 반복 접근 const 캐싱(`approvYn`/`statCd`/`prtdepoNo`) ③ `grd_prtDepoList_fillAct` 단일 라인(약 830자) → 루프 다중행 + `dl.getTotalRow()` 캐싱. 부가로 200자 미만 한 줄 핸들러 2건(`btn_newWrite_onclick`·`krxpage_pagenavigator_78_onclick`) 다중행 정리, `$c.util.getComponent('dma_viewDetailReq')` 반복 호출을 `viewDetail`/`fncSearch`/`fn_delete`/`sendPrtDepoWithd` 에서 `reqMap` 으로, `select_new_write` 3회 조회를 `comp` 로 캐싱 |
| onpageload 재배치 | 예 | 2구역 4번째 → **2구역 최상단** 이동, `init_recvParam`(1)·`init_rowCopy`(2)·`init_pageBody`(3) 호출에 순번 주석 부여 |

## 2. 화면 개요

**의무보유주식 처분 목록** 화면. 페이징 목록을 조회해 각 행의 승인여부/처리상태 코드 조합으로 비고 컬럼(`__rowAct`)에 제출/수정요청 액션을 표기하고, 셀 클릭 시 제출(`sendPrtDepoWithd`)·수정요청 팝업(`openAdjReqPop`, jldfil59411)·상세조회(`viewDetail`)로 분기하며, 신규작성 버튼으로 jldfil52100 으로 이동한다.

## 3. 보류(유지) 항목

- `fn_*`/`tx_fn_*` 함수명(`fn_delete`·`fn_New_Display`·`tx_fn_delete`) — 명명 유지 (금지 규약).
- `dlt_prtDepoList` 의 `ev:ondataload="scwin.grd_prtDepoList_fillAct"` 배선 및 body 마크업(publicInfo 포함) — 변경 없음.
- 1구역 `scwin.form = null` 과 2구역 말미 `scwin.searchType = undefined; scwin.form = undefined;`(as-is 흐름 보존 주석) — 로드 시점 실행 순서 동일하게 유지(문장만 2행 분리).
- `document.prtDepoListForm` DOM 폼 참조와 `scwin.form.action` 대입 — as-is 전송 흐름 보존.
- `btn_newWrite_onclick` 의 미사용 지역변수(`ev`/`event`/`srcEl`) — 삭제 대신 const 전환·개명만 적용(동작 변경 금지 원칙).
- tx_* 서브미션 함수의 `catch (_e)` 파라미터 — 단일 언더스코어(`__` 아님)로 규약 위반 아님, 유지.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과

## 5. 후속 정정 (wsxml_lint 전수 검사)

- WS120 중복 컬럼 id 재부여(규칙 27): grd_prtDepoList 내 `column1`(중복) → `column1_2` — 스크립트 참조 0건 확인, 원본 유래 결함
