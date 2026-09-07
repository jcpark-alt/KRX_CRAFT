# jldfil52100 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `krx_소스전환/jldfil52100.xml` → 정비본: `jsp-front/jldfil52100.xml` (2026-09-07)
> 기준: [code-convention.md](../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 36건 | 전 함수(@description 구체 서술·@param 타입·@returns·@example·@hidden 완비, `@event`→`@method` 통일 12건 포함) |
| publicInfo 등재 | 13건 | 기계 패스 완료(onpageload + 이벤트 핸들러 12) — 이번 정비 범위 아님 |
| let→const | 75건 | 재할당 없는 지역 전부(let 84 → 9, 잔존 9는 루프 카운터 `i`/`j`·while 대입 `n`·catch 재할당 `v`·`res`×3·재조립 배열 `a`×2) |
| var 전환 | 0건 | var 잔존 없음 |
| `__` 지역변수 개명 | 19건 | `__cds`→`ctxDefaults`·`__pc0`→`pc`·`__ck`→`key`·`__cv0`→`cur`·`__rowCopies`→`rowCopies`·`__r0`→`renderRoot`/`root`·`__doc`→`doc`·`__self`→`selfEl`(핸들러 12) |
| 과밀 라인 분해 | 25건 | init_conds 바인딩 한 줄(2,377자) → `readSearchType`/`readReopnYn` 캐싱 + 바인딩별 행 분리 · init 의 ${} 가드 3줄(각 405~505자) → `readCtx` 헬퍼 · insert/updatePrtDepoWithd 의 unFormat 6줄(각 700자+) → 함수 내 `unformatField` 헬퍼(fieldEl 1회 해석 캐싱) · checkValue 체크 판정(405자) → `reopnYnComp`/`reopnYnChecked` 분리 · init_rowCopy·init_sessionFill·upd_attachFiles 결선 4건·btn_FileDown(_2)_onclick·tx_fn_FileDown·fn_findPrtDepo/fn_findAcptCompany openPopup·set*Info_recv 2건 등 다중행 분해. 반복 `getComponent('dma_FileDownReq')` 는 `fileDownReq` 캐싱 |
| onpageload 재배치 | O | 2구역 최하단 → **2구역 최상단**으로 이동, init_* 호출에 `// 1)`~`// 6)` 순번 주석 부여 |
| 기타 정리 | 1건 | 1구역 `scwin.form` 이중 선언(null → undefined 재선언)을 1벌(null)로 통합 — 모든 사용처가 사용 전 재할당하므로 동작 동등 |

## 2. 화면 개요

의무보유주식의 처분 작성 화면. 법인 검색(jldfil52110)·의무보유내역 검색(jldfil52120) 팝업으로 대상을 선정하고, 처분 주식수·사유·재의무보유 여부를 입력하고 공문/첨부서류를 업로드해 처분신청을 신규 저장(searchType=0)·수정 저장(2/3)·제출하며, 기첨부 파일을 다운로드한다. searchType 별로 업로드/다운로드 영역과 저장·제출 버튼 표시가 전환된다.

## 3. 보류(유지) 항목

- `fn_*`/`tx_*` 함수명(정의·호출부) 유지 — 개명 금지 규약.
- `== null`/`!= null` null/undefined 동시 판별 관용구 유지(checkValue·insertPrtDepoWithd·init 등).
- btn_filePrtDepoWithd_onclick 의 `filePrtDepoWithd()` — as-is 원본부터 이 화면에 정의가 없는 전역 호출. 로직 동등 원칙으로 유지(호출 시 try/catch 의 handleError 로 수집됨). JSDoc 에 명기.
- init_pageBody 의 `searchType = 'null';` 암묵 전역 대입 — as-is 흐름 보존(지역 선언화하면 전역 의미가 바뀌므로 유지).
- setCorpInfo_recv 의 파라미터 정렬 기준(setCorpInfo 시그니처)과 최종 적용 함수 호출 구조 — as-is 그대로 유지.
- `__krxFileControl`(외부 전역 함수)·`__sdd_rec`(팝업 회신 레코드 속성)·`__rb0`/`__rb1`/`__rb2`(컴포넌트 id 문자열) 등 비(非)지역변수 `__` 표기는 개명 대상 아님 — 유지.
- fn_findPrtDepo/fn_findAcptCompany 의 미사용 `w`/`h`/`l`/`t`(as-is window.open 좌표 계산 잔재), fn_FileDown 의 미사용 `downForm.action` 대입 흐름 — const 전환만 하고 유지.
- 핸들러의 미사용 지역 alias(`ev`/`event`/`selfEl`) — 변환기 표준 산출 형태라 삭제하지 않고 const 전환·개명만 수행(jldfil35701 선례).
- init 의 중첩 else-if 사다리 구조 — 로직 동등 원칙으로 평탄화하지 않고 유지.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과
