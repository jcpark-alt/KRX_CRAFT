# jldfil35706c 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `krx_소스전환/jldfil35706c.xml` → 정비본: `jsp-front/jldfil35706c.xml` (2026-09-07)
> 기준: [code-convention.md](../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 24건 | 전 함수(@description 구체 서술·@param 타입·@returns·@example·@hidden 완비, `@event`→`@method` 통일 7건 포함) |
| publicInfo 등재 | 8건 | 기계 패스 완료(onpageload·onblur 2·onclick 3·onchange 1·pagenavigator 1) — 이번 정비 범위 아님 |
| let→const | 32건 | 재할당 없는 지역 전부(let 56 → 23, 잔존 23은 루프 카운터·분기 재할당 변수) + 별칭 `let gf = __genFills` 1건 인라인 제거 |
| var 전환 | 0건 | var 잔존 없음 |
| `__` 지역변수 개명 | 19건 | `__pc`→`pc`·`__genFills`→`genFills`·`__row`→`rowIdx`·`__cell`→`cellOf`·`__rowCopies`→`rowCopies`·`__self`→`selfEl`(핸들러 6)·콜백 파라미터 `__v`/`__i`→`v`/`idx`(각 4) |
| 과밀 라인 분해 | 4건 | init_fillGen 채움 명세(438자)·init_rowCopy(318자)·tx_fn_goPrint(268자)·krxpage_pagenavigator_87_onclick(262자) → 다중행 분해. 반복 호출식은 `const` 캐싱(`dltResult`·`printReq`) |
| onpageload 재배치 | O | 2구역 최하단 → **2구역 최상단**으로 이동, init_* 호출에 `// 1)`~`// 4)` 순번 주석 부여. 전역 선언(sub_printDate_Y/M/D)은 1구역으로 이동 |

부가: fn_goPrint 의 `$.ajax({...})` 옵션 객체를 다중행으로 정렬(로직 동일), success 콜백의 `$c.util.getComponent('dma_goPrintReq')` 반복 20여 회를 `printReq` 캐싱으로 통합. `switch` case 본문 들여쓰기 등 4-스페이스 정렬.

## 2. 화면 개요

상장수수료 영수증출력 화면. 입금일 기간(달력 직접입력 또는 최근1주일 등 기간 라디오)으로 상장수수료 입금 내역(dlt_result → c_foreach_77 제너레이터)을 페이지네이션 조회하고, 구분 체크 1건에 대해 리포트(RLDFIL00030) 영수증을 다운로드 인쇄한다.

## 3. 보류(유지) 항목

- `fn_*`/`tx_fn_*` 함수명(정의·호출부) 유지 — 개명 금지 규약.
- `$.ajax`(jQuery, `async: false` 동기 호출) 기반 fn_goPrint 흐름 유지 — 들여쓰기 정렬·캐싱만 수행.
- rd_period 라디오는 선택지 4개(최근1주일/1개월/1년/2년)인데 핸들러가 `'7D'` 고정 호출 — as-is 원본 로직 그대로 유지(동작 변경 금지).
- fn_printReceipt 의 `(dltResult.getTotalRow() > 0).checked` 죽은 분기(as-is 결함, 항상 undefined) — 로직 동등 원칙으로 유지.
- fn_setDate/fn_setMonth/fn_setFullYear 의 미사용 파라미터(startDate/endDate/ie)와 fn_setFullYear 의 ie 분기(양쪽 동일 로직) — as-is 시그니처·로직 보존(JSDoc 에 명기).
- 핸들러의 미사용 지역 alias(`ev`/`event`/`selfEl`)와 fn_printReceipt 의 미사용 `frm`, fn_goPrint success 의 미사용 `form` — 변환기 표준 산출 형태라 삭제하지 않고 const 전환·개명만 수행(jldfil35701 선례).
- `__rc1`~`__rc3`·`__rb0` 은 컴포넌트 id 문자열(지역변수 아님) — 유지.
- 분기별 단일 대입 변수(vMon/vMon2/vDay/vDay2 등)와 루프 카운터·`res`·`rowIdx` 는 재할당이 있어 let 유지.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과
