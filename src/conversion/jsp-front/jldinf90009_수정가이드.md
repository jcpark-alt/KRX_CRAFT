# jldinf90009 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `krx_소스전환/jldinf90009.xml` → 정비본: `jsp-front/jldinf90009.xml` (2026-09-07)
> 기준: [code-convention.md](../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 6건 | `onpageload`·`init_conds`·`init_recvParam`·`grd_zipList_oncellclick`·`btn_sddSearchZip_onclick`·`setZipCode` 에 `@description`·`@returns {void}`·`@example` 부여, 한 줄 다중 `@param` 을 타입 포함 개별 라인으로 분리 |
| publicInfo 등재 | 3건 | `scwin.onpageload`·`scwin.btn_sddSearchZip_onclick`·`scwin.grd_zipList_oncellclick` (기계 패스 — 기등재) |
| let→const | 6건 | `binds`·`dl`·`r`·`kw`·`o`·`c`(forEach 내부) — 전부 재할당 없음 |
| var 전환 | 0건 | 해당 없음 |
| __ 지역변수 개명 | 0건 | 해당 없음 |
| 과밀 라인 분해 | 4건 | ① `init_conds` 바인딩(268자) → 멀티라인 + `zipList` readValue 1회 const 캐싱 ② `grd_zipList_oncellclick` 한 줄 함수(397자) → 멀티라인 분해 ③ forEach 콜백(272자) → 멀티라인 분해 ④ `setZipCode` opener 콤마식(607자) → `openerScope`/`openerScwin` const 캐싱 + `if` 문 분해 |
| 구조 헤더 | — | 5단계 섹션 헤더 기보유 (변경 없음) |
| onpageload 재배치 | 적용 | 3번째 위치 → 2구역 최상단으로 이동, `init_recvParam`/`init_conds` 호출에 순번 주석(`// 1)`, `// 2)`) 부여 |

## 2. 화면 개요

주소(우편번호) 검색 팝업. 검색어로 자기 화면을 재조회(`setPageFrameSrc`)해 `dlt_zipList` 목록을 갱신하고, 행 클릭 시 선택 우편번호·주소를 부모창(`setZipCode`)으로 전달한 뒤 팝업을 닫는다. 결과가 없으면 안내 문구(`txt_p8`)를 조건 표시한다.

## 3. 보류(유지) 항목

- `== null` null/undefined 동시 판별 관용구 유지 (`zipList == null`).
- `btn_sddSearchZip_onclick` 의 forEach 내부 개별 try/catch(컴포넌트별 조회 실패 무시) 구조는 동작 보존을 위해 유지.
- opener 폴백 객체 리터럴(`{ getComponentById: …, scwin: {} }`)은 원본 그대로 유지.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과
