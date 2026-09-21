# jldfil35708 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `../krx_소스전환/jldfil35708.xml` → 정비본: `jsp-front/jldfil35708.xml` (2026-09-07)
> 기준: [code-convention.md](../../../cm/docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

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

## conversion 규칙 재적용 (2026-09-21)

> `convert.py` 단계1을 제자리 실행하고 후처리로 보정(init 2구역 복원·5b DOM 수신 원복·개명 충돌 조정·JSDoc 동기화). 경위·공통 게이트: [krx_소스전환_미적용분석.md §5 이력 6](krx_소스전환_미적용분석.md). diff +7/−26.

| 항목 | 건수 | 내용 |
|------|------|------|
| 규칙 13 `fn_*` 개명 | 1건 | `fn_init`→`init`. 정의·호출·body `ev:`·publicInfo 동기화(도구), JSDoc `@name`/`@example` 옛 이름 3건 후처리 동기화. 교차 화면 호출 없음 |
| 규칙 2 전역 선언 이동 | 2건 | 최상위 `scwin.X = …` 선언을 1구역으로 |
| 규칙 4 구역 재배치 | 1건 이동 | `init_*` 2건은 도구가 5구역으로 옮긴 것을 code-convention 대로 2구역(`onpageload` 아래)에 복원; 구역 이동: `init`(5구역→2구역) |
| 규칙 5b `.value=` → `setValue` | 6건 원복·보류 | 수신 객체가 `ev.target`(DOM 요소)이라 `setValue` 가 TypeError — 원복. 컴포넌트 API(getValue/setValue) 전환은 호출부 재설계와 함께 후속 |

검증: node --check 통과 · wsxml_lint 0 errors/0 warnings(WS111~113 제외) · body `ev:`·publicInfo ↔ 정의 일치 · 재변환 수렴(잔여 차이는 5b 보류분·빈 5구역 헤더뿐).

### A 그룹 — 운영 gcc 확장 7종 치환 (2026-09-21)

> 리포 `cm/gcc` 에 없는 운영 확장 함수를 dataMap/dataList·컴포넌트·`$c.session` API 로 치환(검토안: 미적용분석 §7.1). 전제: 페이지 컨텍스트 값은 `paramData` 파라미터로 전달된다(JSP 서버 모델값이 파라미터로 오지 않으면 별도 조회 API 필요).

| 대상 | 건수 | 치환 |
|------|------|------|
| `$c.data.recvParamData("dma_pageContext")` | 1 | 이 화면은 페이지 컨텍스트 값을 읽지 않아 수신 생략(주석)으로 대체 — `dma_pageContext` 미보유 |
| 숫자 DOM 헬퍼·핸들러 컴포넌트 API 전환 | 12줄 / 핸들러 0 | `obj.value` → `getValue()/setValue()`, `self` → `comp` |

숫자 헬퍼 `unformat`·`numFormat` 을 `getValue()/setValue()` 로 전환(12줄) — 5b 보류 6건 해소. 호출부는 이미 `getComponent`

검증: node --check 통과 · wsxml_lint 0/0 · 코드 내 미정의 dataCollection 참조 0 · `$c.data.readValue` 잔존 0건(보류) 외 A 그룹 호출 0.
