# jldfil35700_layer_layer1 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `../krx_소스전환/jldfil35700_layer_layer1.xml` → 정비본: `jsp-front/jldfil35700_layer_layer1.xml` (2026-09-07)
> 기준: [code-convention.md](../../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 1건 | `btn_layerClose_onclick` 에 `@description`(부모 경유 닫기 + 자기 닫기 폴백 서술)·`@returns {void}`·`@example (a_334 ev:onclick 바인딩으로 자동 호출)` 부여 |
| publicInfo 등재 | 1건 | `scwin.btn_layerClose_onclick` (기계 패스 — 기등재) |
| let→const | 0건 | 해당 없음 |
| var 전환 | 2건 | `id`·`pa` → `const` |
| __ 지역변수 개명 | 0건 | 해당 없음 |
| 과밀 라인 분해 | 1건 | 부모 경유 닫기 try 블록(249자) → 멀티라인 분해 (인접한 자기 닫기 폴백 try 블록도 동일 정형화) |
| 구조 헤더 부여(layer) | 적용 | 섹션 헤더 부재 → `///////// 3. 컴포넌트 이벤트 영역 /////////` 부여 (그 외 구역은 내용이 없어 헤더 생략, onpageload 미생성) |
| onpageload 재배치 | 해당 없음 | onpageload 없음(레이어 프래그먼트) — 신설하지 않음 |

## 2. 화면 개요

jldfil35700(상장수수료)에서 분리된 인페이지 레이어 프래그먼트. "신주 추가상장 시 '추가상장' 선택 필요" 안내문과 Close 버튼만 가지며, 닫기는 부모 스코프 경유(`getParent().closePopup(id)`), 실패 시 자기 닫기(`$c.win.closePopup`)로 폴백한다.

## 3. 보류(유지) 항목

- `typeof $c !== 'undefined'` 방어 검사와 2단 try/catch 폴백 구조(부모 닫기 실패 → 자기 닫기)는 동작 보존을 위해 유지.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과
