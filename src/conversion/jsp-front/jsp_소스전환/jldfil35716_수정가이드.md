# jldfil35716 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `../krx_소스전환/jldfil35716.xml` → 정비본: `jsp-front/jldfil35716.xml` (2026-09-07)
> 기준: [code-convention.md](../../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 4건 | `onpageload`·`init_conds`·`init_recvParam`·`btn_self_onclick` 전 함수에 `@description`(구체 서술)·`@returns {void}`·`@example` 부여, `@event` → `@method` 통일, `@param {Object} e` 타입 보강. JSDoc 위 중복 한 줄 주석은 `@description` 으로 흡수 |
| publicInfo 등재 | 2건 | `scwin.onpageload`·`scwin.btn_self_onclick` (기계 패스 기적용) |
| let→const | 1건 | `init_conds` 의 `let binds` → `const binds` (재할당 없음) |
| var 전환 | 0건 | `var` 없음 |
| __ 지역변수 개명 | 0건 | 개명 대신 미사용 핸들러 잔재 3건(`let ev`·`let event`·`let __self`) 삭제 — 규약 6.2 미사용 변수 삭제, 정답지 선례 동일 |
| 과밀 라인 분해 | 1건 | `init_conds` 의 binds 정의 약 1,620자 한 줄을 바인딩(11개)별 다행으로 분해. 동일 인자 `$c.data.readValue("dma_pageContext", "kk", …)` 12회 반복 호출(`if_kk_11_txt` 는 한 식에서 2회)을 `const kk` 1회 캐싱으로 치환(진입점 1회 동기 평가라 동작 동등) |
| onpageload 재배치 | 예 | 2구역 최상단으로 이동(코드 동일), `init_recvParam`/`init_conds` 호출에 `// 1)`·`// 2)` 순번 주석 부여 |

## 2. 화면 개요

유가시장 변경상장 상장수수료 계산원칙 안내 팝업. 파라미터 `kk`(1=주권류 200만원, 2=집합투자증권·4=신주인수권증권 30만원, 3=수익증권 10만원)에 따라 증권 유형별 제목(`if_kk_txt`~`if_kk_4_txt`, `txt_h115`~`txt_h121`)과 건당 수수료 문구(`if_kk_9_txt`~`if_kk_11_txt`)를 `$c.util.evalConds` 로 분기 표시하고, [닫기] 버튼은 `$c.win.closePopup` 을 호출한다.

## 3. 보류(유지) 항목

없음 (jQuery·`fn_*` 명명·`== null` 관용구·`ev:ondataload` 배선 해당 없음)

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과
