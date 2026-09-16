# jldfil35709 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `../krx_소스전환/jldfil35709.xml` → 정비본: `jsp-front/jldfil35709.xml` (2026-09-07)
> 기준: [code-convention.md](../../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 3건 | 전 함수(@description 구체 서술·@param·@returns·@example·@hidden 완비, `@event`→`@method` 통일 1건 포함) |
| publicInfo 등재 | 2건 | 기계 패스 완료(onpageload·btn_self_onclick) — 이번 정비 범위 아님 |
| let→const | 3건 | `ev`/`event`(btn_self_onclick)·`__self`→`selfEl` |
| var 전환 | 0건 | var 잔존 없음 |
| `__` 지역변수 개명 | 1건 | `let __self` → `const selfEl`(btn_self_onclick) |
| 과밀 라인 분해 | 0건 | 200자 초과 라인 없음(init_recvParam·btn_self_onclick 압축 한 줄 본문만 다중행 정렬) |
| onpageload 재배치 | O | 2구역 최상단으로 이동(init_recvParam 앞), init_* 호출에 `// 1)` 순번 주석 부여 |

## 2. 화면 개요

증권시장 ELW 상장수수료 계산원칙 안내 팝업. 상장할 금액 구간별 수수료율 표와 변경상장수수료·입금계좌 안내가 전부 정적 마크업이며, 스크립트는 파라미터 수신(init_recvParam)과 [닫기](btn_self) 팝업 종료만 수행한다.

## 3. 보류(유지) 항목

- jQuery·`fn_*` 명명·`== null` 관용구·`ev:ondataload` 배선: 해당 없음(없음).
- dataCollection 에 `dma_pageContext` dataMap 미정의 상태로 init_recvParam 이 참조 — 원본과 동일한 as-is 형태라 유지(실패 표출은 공용 $c.data.recvParamData 몫).
- btn_self_onclick 의 미사용 지역변수 `ev`/`event`/`selfEl`: 변환기 표준 산출 형태라 로직 동등 원칙에 따라 삭제하지 않고 const 전환·개명만 수행.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과
