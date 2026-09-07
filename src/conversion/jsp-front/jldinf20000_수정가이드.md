# jldinf20000 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `krx_소스전환/jldinf20000.xml` → 정비본: `jsp-front/jldinf20000.xml` (2026-09-07)
> 기준: [code-convention.md](../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 완성 | 57함수 | 전 함수 `@description`(본문 기반 한국어 서술) 추가, 빈 `@returns` → `{void}`(onsubmit 은 `{Boolean}`), `@param {타입} 이름 설명` 정비, `@example` 추가(이벤트 핸들러 34건은 `(body ev:onclick 바인딩으로 자동 호출)` 형식). 기존 `@method`/`@event`/`@name`/`@hidden N` 유지 |
| let → const | 164 | 재할당 없는 `let` 전부 `const` 전환. 잔존 `let` 13건은 전부 실제 재할당 변수(루프 `i`, `res`, `height`, `calMM`, `bf*YY/MM`, `std_cd_grnt_*_dd`) |
| var 제거 | 3 | `dateSetting` 의 `var calMM` 3중 재선언 → `let calMM` 선언 1회 + 재할당 2회 (var 0건) |
| `__` 접두 지역변수 개명 | 42 | `__self`→`self`(핸들러 34건, `fn_boardCheck(self)` 참조 포함), `__pc_gubunRadio`→`pcDownloadReq`, `__attrReals`→`attrReals`, `__v`→`v`, `__rowCopies`→`rowCopies`, `__end`→`endDate`, `__start`→`startDate`, `__r`→`resolveComp`, `__s`→`startComp`, `__e2`→`endComp` (잔존 `__html` 은 속성명 문자열이라 변수 아님) |
| 과밀 한 줄 분해 | 28 | 200자 초과 라인 0건. `init_attrReals`/`init_conds`/`dateSetting`/`searchData` 의 `readValue` 이중 호출 괴물 라인은 `~Raw`/`~Str` const 캐싱으로 분해, `dma_hiddenStore` 3중 `getComponent` 반복은 `const hiddenStore` 캐싱, `resetPaging` HTML 문자열은 문자열 연결로 분할, `onPopupCode` 의 `openPopup` 인자는 `popupOptions`/`popupCodeReq` 로 분리. **로직 동등 유지**(순수 조회 캐싱만, 분기·호출 순서 불변) |
| onpageload 재배치 | 1 | 2구역 최상단으로 이동(정의 위치만 이동, 호출 내용 동일), `init_*` 8단계에 `// 1) ~ // 8)` 순번 주석 부여 |
| 1구역 정리 | 3 | 비어 있던 1구역으로 `scwin.dmenus`(try/catch 구조 유지·다중행 정렬), `scwin._popupWindow`, `scwin.type` 선언 이동 |
| 한 줄 함수체 전개 | 다수 | `init_datefmt_*`/`init_recvParam`/`dataTb_oncellclick`/`tx_fn_Download`/`fn_appDate2`/`krxpage_pagenavigator_263_onclick` 등 한 줄 압축 본문을 4-스페이스 다중행으로 전개 |

## 2. 화면 개요

발행정보 > **표준코드 조회** 화면. 검색구분(개별종목/발행기관별/상품·일자)에 따라 조건 행(trSearch)을 전환해 표준코드 목록(`dlt_result`)을 조회하고(`fn_search`→`tx_fn_search`), 행 클릭 시 유가증권 상세 팝업(jldinf20000p, `onPopupCode`→`tx_onPopupCode`)을 연다. 일자구분이 코드부여일일 때만 엑셀 다운로드 버튼이 노출되며(`fn_viewDownloadBtn`), 다운로드(`fn_Download`)는 현재 as-is 그대로 "조회 내용이 없습니다." 안내 후 조기 종료한다(이하 로직 도달 불가, 보존).

## 3. 보류(유지) 항목

- **jQuery `$("...")` 코드 21건** — 페이징 강조/초기화, 라디오 checked 조작, `keypress`/`bind` 바인딩 등. 규칙 19(WebSquare API 재설계) 대상이라 이번 정비에서 손대지 않음(동일 `$(...)` 호출식 반복의 const 캐싱 1건만 수행: `pagingLeng = pageObj.length`).
- **`fn_*`/`tx_fn_*` 함수명** — 호출자 정합용 as-is 계약이라 개명 보류.
- **`== null`/`!= null` 관용구** — null/undefined 동시 판별 관용구로 유지.
- **body XML 마크업(publicInfo 37메서드 포함)·`ev:*` 배선** — 무변경.
- **as-is 전역 의존** — `fn_boardCheck`/`fn_popupCorpSearch2`/`fnLeg`/`blockLoading` 전역 호출, `open_corp_cd` 의 `formName` 암묵 전역(팝업 공통 계약) 유지.
- **도달 불가 코드 보존** — `fn_Download` 의 조기 `return` 이후 기간 검증·action 분기 블록(미정의 `std_cd_grnt_start_dd.focus()` 참조 포함)은 as-is 흐름 기록용으로 보존.
- **`init_pageBody` catch context 라벨** — `'jldinf20000.onpageload'` 문자열 그대로 유지(동작 무관 라벨).

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과

## 5. 후속 정정 (wsxml_lint 전수 검사)

- WS120 중복 컬럼 id 재부여(규칙 27): dataTb 내 `column5`(중복) → `column5_2` — 스크립트 참조 0건 확인, 원본 유래 결함
