# jldfil35704 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `krx_소스전환/jldfil35704.xml` → 정비본: `jsp-front/jldfil35704.xml` (2026-09-07)
> 기준: [code-convention.md](../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 7건 | 전 함수(`onpageload`/`init_pageBody`/`init_recvParam`/`fn_init`/`unformat`/`numFormat`/`isMinusNum`)에 `@description`(본문 기반 구체 서술)·`@param {타입}`·`@returns {타입}`·`@example` 보강, placeholder 0 |
| publicInfo 등재 | 1건 | `scwin.onpageload` (기계 패스에서 처리 완료 — 본 정비에서 변경 없음) |
| let→const | 6건 | `unformat`: `n`·`len` / `numFormat`: `leng`·`size`·`cnt`·`pos` (재할당 없는 선언만; `strCalc`·`strListTp`·`temp`·`str` 등 재할당 변수는 let 유지) |
| var 전환 | 2건 | `isMinusNum`: `var ch`→`let ch`, `for (var i = 1, ch = …)` 콤마 재선언 루프를 `for (let i = 1; …)` + 본문 첫 줄 `ch = name.charAt(i)` 로 등가 재구성 |
| __ 지역변수 개명 | 0건 | 해당 없음 (`catch (_ex)` 는 단일 언더스코어 — 정답지 스타일에 맞춰 `ex` 로 정리) |
| 과밀 라인 분해 | 2건 | ① `fn_init` 데이터 수신 삼중 중첩식(283자) → `const param`/`openerScwin`/`dataSrc` 3단 분해 + `$c.data.getParameter()` 4회 반복 호출 const 캐싱 ② 10원소 `== null` 검사식(279자) → 2행 래핑 |
| onpageload 재배치 | 예 | 2구역 3번째 → **2구역 최상단** 이동, `init_recvParam`(1)·`init_pageBody`(2) 호출에 순번 주석 부여 |

## 2. 화면 개요

상장공시제출시스템 **상장수수료 계산기(인쇄)** 팝업. 호스트 화면이 넘긴 `dataArr`(종목별 상장주식수·종가·상장금액 10행 + 시장/수수료/상장방식 구분 + 합계)를 입력 필드에 렌더하고 `$c.win.popupPrint()` 로 인쇄를 호출한다.

## 3. 보류(유지) 항목

- `fn_*` 함수명(`fn_init`) — 명명 유지 (금지 규약).
- `fn_init` 의 10원소 `scwin.data[n] == null` 검사 — `== null` null/undefined 동시 판별 관용구 유지 (라인 래핑만 적용).
- `scwin.data`/`scwin.calType`/`scwin.subTitle1` 전역 선언(1구역), `init_recvParam` 상단 §106 안내 주석 — as-is 흐름 보존.
- `numFormat` 반복 호출부(`ipt_listAmt1~10`)의 순차 나열 — 로직 동등 유지를 위해 루프 축약 없이 유지.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과
