# jldinf20000p 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `../krx_소스전환/jldinf20000p.xml` → 정비본: `jsp-front/jldinf20000p.xml` (2026-09-07)
> 기준: [code-convention.md](../../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 23건 | 전 함수 `@description`(한국어 구체 서술)·`@param {타입}`·`@returns {타입}`·`@example` 완비, 기존 `@method`/`@event`/`@name` 유지 |
| publicInfo 등재 | 9건 | 기계 패스 기적용 (`onpageload`·이벤트 핸들러 8) |
| let→const | 29건 | 재할당 없는 `let` 전환 (`binds`·`dl`·`r`·`fm`·`frm`·`srIdx`·`ckArr`·`statLeng`, `dateSetting` 의 날짜 파생값 18건 등) + 캐싱 신규 `const` 다수 |
| var 전환 | 3건 | `dateSetting` 의 `var calMM` 3중 재선언 → `let calMM` 1회 선언 + 재대입 2회 |
| __ 지역변수 개명 | 9건 + 제거 5건 | `__attrReals`→`attrReals`, `__rowCopies`→`rowCopies`, `__v`→`v`, `__end`→`endDate`, `__start`→`startDate`, `__r`→`resolveComp`, `__s`→`startComp`, `__e2`→`endComp`, `__self`→`selfEl`(btn_window_onfocus, 실사용); 미사용 글루 `ev`/`event`/`__self` 5개소(btn_appDate2 ×3·btn_search·btn_window_onclick) 제거 |
| 과밀 라인 분해 | 14건 | 200자 초과 라인 전부 분해(init_attrReals 685자, fn_appDate2 579자, init_pageBody 598·580자 등), 잔존 0 |
| onpageload 재배치 | 예 | 2구역 말미 → **2구역 최상단** 이동, `init_*` 7단계 호출에 순번 주석(1~7) 부여; `scwin._popupWindow`/`scwin.type` 전역 선언은 1구역으로 이동·행 분리 |

동일 호출식 반복 `const` 캐싱: `readValue(dma_page, …)` ×3 → `readPage(key)` 헬퍼(init_attrReals), `readValue(…, "result")` ×2 → `result`, `readValue(…, soft)` ×4 반복 패턴(init_pageBody `std_cd_grnt_*`·dateSetting `curDate`) → `raw`/`str` 2단 `const`, `getComponent('dma_hiddenStore')` ×3(라인당) → `hiddenStore` 캐싱 + 문장 삼항 → `if/else` 전개(dateSetting·onPopupCode·fn_search), `getComponent('cal_*')` 분기 내 중복 → `calStart`/`calEnd`.
`open_corp_cd` 의 미선언 전역 대입 `formName` 은 `const` 지역 선언으로 전환(전역 유출 제거).

## 2. 화면 개요

표준코드 채권 조회 팝업 화면. 코드부여일 기간(3개월/6개월/1년 버튼)·발행기관명·종목명 조건으로 채권 표준코드 목록을 조회하고, 행 클릭 시 시장 구분별 유가증권 상세 팝업(winPop)을 연다.

## 3. 보류(유지) 항목

- jQuery `$("input[name=…]")` 수집·설정 코드(fn_search), `fn_*`/`tx_fn_*` 함수명, 외부 전역 호출(`fn_popupCorpSearch2`·`blockLoading`), `== null` 관용구, body XML(publicInfo 포함) 일체.
- `fn_search(1)` 호출 시 숫자 1 과 내부 `idx === '1'` 문자열 비교 불일치(pageIndex 리셋 미동작 가능성)는 as-is 동작 그대로 보존.
- `dateSetting`·`open_corp_cd` 는 화면 내 미호출 함수지만 as-is 흐름 보존 차원에서 유지.
- `String(String(...))` 이중 변환(init_rowCopy) 등 무해한 as-is 표현은 로직 동등성 우선으로 보존.
- 문자열 키 `__html`(applyAttrReals attr)은 API 계약 키라 개명 대상 아님.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0) — 23/23
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0 (잔존 `__` 토큰은 attr 키 `__html` 뿐)
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과 (200자 초과 라인 0, XML well-formed)

## 5. 후속 정정 (wsxml_lint 전수 검사)

- WS120 중복 컬럼 id 재부여(규칙 27): dataTb 내 `column3`(중복) → `column3_2` — 스크립트 참조 0건 확인, 원본 유래 결함

## 규칙 19 — jQuery 컴포넌트 전환 (2026-09-07)

기존 보류(3절 "jQuery `$("input[name=…]")` 수집·설정 코드")를 전량 전환했다. jQuery 잔존 0건.

| # | 위치 | as-is | to-be | 방식 |
|---|------|-------|-------|------|
| 1 | fn_search | `$('input[name=ipt_searchRadio]:checked').val()` | `$c.util.getComponent('ipt_searchRadio').getValue()` | 컴포넌트 API — 원본 라디오 그룹은 전환 시 hidden `<xf:input id="ipt_searchRadio">`(ref: dma_onPopupCodeReq.searchRadio)로 대체됨 |
| 2 | fn_search | `$('input[name=list_cd3]:checked')` 수집 + `$(ckArr[i]).val()` | `document.querySelectorAll('input[name="list_cd3"]:checked')` + `ckArr[i].value` | 표준 DOM API — body 실측 결과 name=list_cd3 체크박스 컴포넌트 **0건**(원본 JSP 상장구분 체크 목록이 전환 마크업에 부재)이라 컴포넌트 API 대응 불가. 수집 결과(`'v1','v2'` 콤마 문자열, 미체크 시 빈 문자열) 동일 |
| 3 | fn_search | `$('input[name=pageIndex]').val("1")` | `$c.util.getComponent('ipt_pageIndex').setValue("1")` | 컴포넌트 API — hidden `ipt_pageIndex`(name="pageIndex", ref: dma_onPopupCodeReq.pageIndex) |

- **ev 속성 이관**: 해당 없음(이벤트 바인딩 아님). publicInfo·body 마크업 변경 없음.
- **보류**: 0건.
- **검증**: script CDATA 추출 → `node --check` 통과, jQuery 잔존 0건(보류 0건과 일치), `wsxml_lint --min-severity error` 0 errors.

## form 제출 재설계 — $c.win.openFormSubmit 전환 (2026-09-07)

`popup_form`(onPopupCode) 제출 기계부 실측·재설계 — 부모 화면(jldinf20000)과 동일 패턴. body 실측: `popup_form` 은 빈 컨테이너 그룹(전송 필드 0건), 함수 내 `.submit()` 부재. as-is 의 `popup_form[target=winPop]` → `/srch/srch.do?method=srchPopup{type}` 제출은 이미 `$c.win.openPopup("/jldinf20000p/jldinf20000p.xml", …, dma_onPopupCodeReq.getJSON())` + 팝업 화면 자체 조회로 재설계된 상태였다.

| 제출 지점 | 구 흐름 | 재설계 | 판단 근거 |
|-----------|---------|--------|-----------|
| onPopupCode | `const fm = (document.popup_form ‖ …)` + `fm.action = "/srch/srch.do?method=srchPopup"+type` (제출 없음) | 무효 기계부 제거(폴백 선언·action 대입) + 재설계 경위 주석 | 잔존 action 대입은 무효(div 프로퍼티). `openFormSubmit(target:'winPop')` 전환은 pageFramePopup 흐름과 충돌(별개 네이티브 창 생성)이라 부적합. type 정보는 dma_hiddenStore.ipt_stdcdType 로 보존(122→12 정규화 포함) |

- **전환 0건·기계부 제거 1건·보류 0건**. `tx_onPopupCode`(srchPopup executeDynamic 스텁, 미호출)는 원형 유지.
- **범위 외 잔존** (`document.` 3건 — 이번 과제 대상 아님): open_corp_cd(`document.JLDINF20000p` — as-is 전역 `fn_popupCorpSearch2` 폼 객체 인자 계약), fn_search(`document.JLDINF20000p` — action/target 대입만, 조회는 tx_fn_search 기재설계), fn_search 의 `document.querySelectorAll('input[name="list_cd3"]:checked')`(규칙 19 표준 DOM 조회 — 폼 제출 아님).
- **검증**: script CDATA 추출(두 번째 CDATA, `<script lazy` 앵커) → `node --check` 통과, `.submit()` 잔존 0건·`document.폼` 잔존 2건 = 범위 외 목록과 일치, `wsxml_lint --min-severity error` 0 errors(publicInfo 변경 없음).
