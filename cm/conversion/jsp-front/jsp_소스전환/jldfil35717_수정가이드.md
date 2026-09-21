# jldfil35717 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `../krx_소스전환/jldfil35717.xml` → 정비본: `jsp-front/jldfil35717.xml` (2026-09-07)
> 기준: [code-convention.md](../../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 3건 | `onpageload`·`init_recvParam`·`btn_self_onclick` 전 함수에 `@description`(구체 서술)·`@returns {void}`·`@example` 부여, `@event` → `@method` 통일, `@param {Object} e` 타입 보강. JSDoc 위 중복 한 줄 주석은 `@description` 으로 흡수 |
| publicInfo 등재 | 2건 | `scwin.onpageload`·`scwin.btn_self_onclick` (기계 패스 기적용) |
| let→const | 0건 | 재할당 없는 `let` 잔존 없음 (미사용 지역변수는 아래 삭제로 처리) |
| var 전환 | 0건 | `var` 없음 |
| __ 지역변수 개명 | 0건 | 개명 대신 미사용 핸들러 잔재 3건(`let ev`·`let event`·`let __self`) 삭제 — 규약 6.2 미사용 변수 삭제, 정답지 선례 동일 |
| 과밀 라인 분해 | 0건 | 200자 초과 코드 라인 없음. 단 `btn_self_onclick` 한 줄 4문장을 다행으로 정리 |
| onpageload 재배치 | 예 | 2구역 최상단으로 이동(코드 동일), `init_recvParam` 호출에 `// 1)` 순번 주석 부여 |

## 2. 화면 개요

신종증권(투자계약증권) 상장수수료 계산원칙 안내 팝업. 상장할 금액 구간별 수수료율 표와 유의사항은 정적 마크업이며, 스크립트는 파라미터 수신(`init_recvParam`)과 [닫기] 버튼(`$c.win.closePopup`)만 담당한다.

## 3. 보류(유지) 항목

없음 (jQuery·`fn_*` 명명·`== null` 관용구·`ev:ondataload` 배선 해당 없음)

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과

## conversion 규칙 재적용 (2026-09-21)

> `convert.py` 단계1을 제자리 실행하고 후처리로 보정(init 2구역 복원·5b DOM 수신 원복·개명 충돌 조정·JSDoc 동기화). 경위·공통 게이트: [krx_소스전환_미적용분석.md §5 이력 6](krx_소스전환_미적용분석.md). diff +1/−16.

| 항목 | 건수 | 내용 |
|------|------|------|
| 규칙 2 전역 선언 이동 | 1건 | 최상위 `scwin.X = …` 선언을 1구역으로 |
| 규칙 4 구역 재배치 | 0건 이동 | `init_*` 1건은 도구가 5구역으로 옮긴 것을 code-convention 대로 2구역(`onpageload` 아래)에 복원 |

검증: node --check 통과 · wsxml_lint 0 errors/0 warnings(WS111~113 제외) · body `ev:`·publicInfo ↔ 정의 일치 · 재변환 수렴(잔여 차이는 5b 보류분·빈 5구역 헤더뿐).

### A 그룹 — 운영 gcc 확장 7종 치환 (2026-09-21)

> 리포 `cm/gcc` 에 없는 운영 확장 함수를 dataMap/dataList·컴포넌트·`$c.session` API 로 치환(검토안: 미적용분석 §7.1). 전제: 페이지 컨텍스트 값은 `paramData` 파라미터로 전달된다(JSP 서버 모델값이 파라미터로 오지 않으면 별도 조회 API 필요).

| 대상 | 건수 | 치환 |
|------|------|------|
| `$c.data.recvParamData("dma_pageContext")` | 1 | 이 화면은 페이지 컨텍스트 값을 읽지 않아 수신 생략(주석)으로 대체 — `dma_pageContext` 미보유 |

검증: node --check 통과 · wsxml_lint 0/0 · 코드 내 미정의 dataCollection 참조 0 · `$c.data.readValue` 잔존 0건(보류) 외 A 그룹 호출 0.
