# jldfil35708 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `krx_소스전환/jldfil35708.xml` → 정비본: `jsp-front/jldfil35708.xml` (2026-09-07)
> 기준: [code-convention.md](../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 7건 | 전 함수(`onpageload`/`init_pageBody`/`init_recvParam`/`fn_init`/`unformat`/`numFormat`/`isMinusNum`)에 `@description`(본문 기반 구체 서술)·`@param {타입}`·`@returns {타입}`·`@example` 보강, placeholder 0 |
| publicInfo 등재 | 1건 | `scwin.onpageload` (기계 패스에서 처리 완료 — 본 정비에서 변경 없음) |
| let→const | 7건 | `fn_init`: `gubun` / `unformat`: `n`·`len` / `numFormat`: `leng`·`size`·`cnt`·`pos` (재할당 없는 선언만; `temp`·`str`·`result` 등 재할당 변수는 let 유지) |
| var 전환 | 2건 | `isMinusNum`: `var ch`→`let ch`, `for (var i = 1, ch = …)` 콤마 재선언 루프를 `for (let i = 1; …)` + 본문 첫 줄 `ch = name.charAt(i)` 로 등가 재구성 |
| __ 지역변수 개명 | 0건 | 해당 없음 (`catch (_ex)` 는 단일 언더스코어 — 정답지 스타일에 맞춰 `ex` 로 정리) |
| 과밀 라인 분해 | 1건 | `fn_init` 데이터 수신 삼중 중첩식(`dataArr_trust`, 290자) → `const param`/`openerScwin`/`dataSrc` 3단 분해 + `$c.data.getParameter()` 4회 반복 호출 const 캐싱 |
| onpageload 재배치 | 예 | 2구역 3번째 → **2구역 최상단** 이동, `init_recvParam`(1)·`init_pageBody`(2) 호출에 순번 주석 부여 |

## 2. 화면 개요

상장공시제출시스템 **증권상품 상장수수료 계산기(인쇄)** 팝업. 호스트 화면이 넘긴 `dataArr_trust`(종목별 종목코드·원본액·수수료 10행 + 수수료구분 + 총액)를 렌더하며, 수수료구분(ETF/ETN/ELW/상장형 수익증권)에 따라 원본액 컬럼 라벨(`txt_tdNm4`)을 바꾼 뒤 `$c.win.popupPrint()` 로 인쇄를 호출한다.

## 3. 보류(유지) 항목

- `fn_*` 함수명(`fn_init`) — 명명 유지 (금지 규약).
- `scwin.data` 전역 선언(1구역), `init_recvParam` 상단 §106 안내 주석 — as-is 흐름 보존.
- `numFormat` 반복 호출부(`commission_1~10` 대상 — body 에 해당 id 컴포넌트 부재로 원본부터 미해결 참조이나, 동작 변경 금지 원칙에 따라 그대로 유지) — 후속 과제로 `ipt_commission1~10` 정합 검토 필요.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과
