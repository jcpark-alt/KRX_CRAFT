# jldfil52120 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `../krx_소스전환/jldfil52120.xml` → 정비본: `jsp-front/jldfil52120.xml` (2026-09-07)
> 기준: [code-convention.md](../../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 5건 | `onpageload`·`init_attrReals`·`init_recvParam`·`btn_window_onclick`·`setCorpInfo` 에 `@description`·`@returns {void}`·`@example` 부여, `setCorpInfo` 의 한 줄 `@param nm prtDepoId …` 를 `@param {String}` 4줄로 분리 |
| publicInfo 등재 | 2건 | `scwin.onpageload`·`scwin.btn_window_onclick` (기계 패스 — 기등재) |
| let→const | 2건 | `attrReals`(개명 겸)·`returnKey` 계열 → `const`. `str` 은 `+=` 재할당이라 `let` 유지 |
| var 전환 | 0건 | 해당 없음 |
| __ 지역변수 개명 | 1건 | `__attrReals` → `attrReals` (참조 2곳 동시 변경). 추가로 `btn_window_onclick` 의 미사용 지역변수 3건(`ev`·`event`·`__self`) 제거 |
| 과밀 라인 분해 | 3건 | ① `init_attrReals` 바인딩(330자) → 멀티라인 + `isurCd`/`bzProcsNo` const 캐싱 ② `returnKey` 3항식(519자) → `readValue` 1회 캐싱 후 3단 const 분해 ③ opener 콤마식(633자) → `openerScope`/`openerScwin` const 캐싱 + `if` 문 분해 |
| 구조 헤더 | — | 5단계 섹션 헤더 기보유 (변경 없음) |
| onpageload 재배치 | 적용 | 3번째 위치 → 2구역 최상단으로 이동, `init_recvParam`/`init_attrReals` 호출에 순번 주석(`// 1)`, `// 2)`) 부여 |

## 2. 화면 개요

해당법인의 의무보유목록 팝업. 진입 파라미터(isurCd·bzProcsNo)로 iframe(`iframe_10`) src 를 조립해 의무보유목록 검색 화면을 띄우고, iframe 이 콜백하는 `setCorpInfo` 로 선택 결과를 부모창(`setPrtDepoInfo`)에 전달한 뒤 팝업을 닫는다.

## 3. 보류(유지) 항목

- `== null` null/undefined 동시 판별 관용구 유지 (`returnKeyRaw == null`).
- `returnKey` 는 원본에서도 미사용이지만 `readValue`(soft 조회) 호출을 보존하기 위해 계산식 자체는 유지 (삭제 시 동작 차이 가능성 배제 목적).
- opener 폴백 객체 리터럴(`{ getComponentById: …, scwin: {} }`)과 이중 `closePopup` 호출 순서는 원본 그대로 유지.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과

## conversion 규칙 재적용 (2026-09-21)

> `convert.py` 단계1을 제자리 실행하고 후처리로 보정(init 2구역 복원·5b DOM 수신 원복·개명 충돌 조정·JSDoc 동기화). 경위·공통 게이트: [krx_소스전환_미적용분석.md §5 이력 6](krx_소스전환_미적용분석.md). diff +3/−16.

| 항목 | 건수 | 내용 |
|------|------|------|
| 규칙 5a 엄격 비교 | 1건 | `==`/`!=` → `===`/`!==` |
| 규칙 2 전역 선언 이동 | 1건 | 최상위 `scwin.X = …` 선언을 1구역으로 |
| 규칙 4 구역 재배치 | 0건 이동 | `init_*` 2건은 도구가 5구역으로 옮긴 것을 code-convention 대로 2구역(`onpageload` 아래)에 복원 |

검증: node --check 통과 · wsxml_lint 0 errors/0 warnings(WS111~113 제외) · body `ev:`·publicInfo ↔ 정의 일치 · 재변환 수렴(잔여 차이는 5b 보류분·빈 5구역 헤더뿐).

### A 그룹 — 운영 gcc 확장 7종 치환 (2026-09-21)

> 리포 `cm/gcc` 에 없는 운영 확장 함수를 dataMap/dataList·컴포넌트·`$c.session` API 로 치환(검토안: 미적용분석 §7.1). 전제: 페이지 컨텍스트 값은 `paramData` 파라미터로 전달된다(JSP 서버 모델값이 파라미터로 오지 않으면 별도 조회 API 필요).

| 대상 | 건수 | 치환 |
|------|------|------|
| `$c.data.recvParamData("dma_pageContext")` | 1 | `dma_pageContext.setJSON($c.data.getParameter() \|\| {})` — gcc `getParameter` 가 파라미터 키 `paramData` 를 고정 사용 (keyInfo 에 사용 키 1개 추가) |
| `$c.data.readValue(dc, key, opts)` | 3 | dataMap → `dc.get("key")` 3건, dataList → `dc.getCellData(row, "key")` 0건, 변수 키 래퍼 → `.get(key)` 0건. `silent`/`soft`/`ctx`/`label` 옵션은 의미 없어 제거 |
| `$c.util.applyAttrReals(attrReals)` | 1 | 로컬 `attrReals.forEach` — `__html` → `comp.render.innerHTML`, `label` → `setLabel`, 그 외 → `render.setAttribute` |

검증: node --check 통과 · wsxml_lint 0/0 · 코드 내 미정의 dataCollection 참조 0 · `$c.data.readValue` 잔존 0건(보류) 외 A 그룹 호출 0.
