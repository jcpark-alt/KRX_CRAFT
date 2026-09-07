# jldfil35706 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `krx_소스전환/jldfil35706.xml` → 정비본: `jsp-front/jldfil35706.xml` (2026-09-07)
> 기준: [code-convention.md](../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 4건 | `onpageload`·`tbh_tabs_onchange`·`init_tab`·`tbh_setLeaf` 에 `@description`(구체 서술)·`@returns {void}`·`@example` 부여, `tbh_setLeaf` 의 `@param {Number} i` 정형화 |
| publicInfo 등재 | 1건 | `scwin.tbh_tabs_onchange` (기계 패스 — 기등재) |
| let→const | 0건 | 해당 없음 |
| var 전환 | 5건 | `tc`(onchange)·`pd`·`tc`(init_tab)·`a` → `const`, `idx` → `let`(재할당 존재) |
| __ 지역변수 개명 | 0건 | 해당 없음 |
| 과밀 라인 분해 | 0건 | 200자 초과 라인 없음 |
| 구조 헤더 | — | 5단계 섹션 헤더 기보유 (변경 없음) |
| onpageload 재배치 | 불필요 | 이미 2구역 최상단. `init_tab()` 호출에 순번 주석(`// 1)`) 부여 |

## 2. 화면 개요

상장수수료 탭 호스트 화면(기본 탭 = 영수증 발급, `tbh_defaultIndex = 1`). jldfil35700 과 동일 골격으로, 진입 파라미터 `tab` 또는 기본 인덱스로 탭을 선택하고 탭 전환 시 breadcrumb 리프 라벨을 갱신한다.

## 3. 보류(유지) 항목

없음.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과
