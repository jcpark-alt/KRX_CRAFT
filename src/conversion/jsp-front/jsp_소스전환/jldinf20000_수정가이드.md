# jldinf20000 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `../krx_소스전환/jldinf20000.xml` → 정비본: `jsp-front/jldinf20000.xml` (2026-09-07)
> 기준: [code-convention.md](../../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

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

## 규칙 19 — jQuery 컴포넌트 전환 (2026-09-07)

기존 보류(3절 "jQuery `$("...")` 코드 21건")를 재설계했다. 호출식 24건 중 18건 전환, 6건 보류(페이징 DOM 재구성 2블록). body 실측: 조건 행 `tr[name=trSearch]` = `xf:group`(`id_isur`/`id_com`/`id_type`/`id_date`), 상품선택 라디오 = 개별 `xf:select1 ipt_searchRadio1~18`(단일 item, 값=id 접미), `input[name=pageIndex]` = hidden `xf:input ipt_pageIndex`(ref: dma_DownloadReq.pageIndex), `.paging` 테이블은 전환 마크업에 **부재**(`w2:pageList krxpage_pagenavigator_263` 대체).

| # | 위치 | as-is | to-be | 방식 |
|---|------|-------|-------|------|
| 1 | init_pageBody | `$('input[name=ipt_isurNm1]').keypress(Enter→fn_search('1'))` | `ipt_isurNm1` 에 `ev:onkeydown="scwin.ipt_isurNm1_onkeydown"` 신설(규칙 3 명명, publicInfo 등재) | 이벤트 속성 이관 |
| 2 | init_pageBody | `$('input[name=searchRadio]').bind("click", …)` (`$(this).val()` 포함) | 신설 `scwin.searchRadioClickCommon(value)` 를 18개 `ipt_searchRadioN_onclick` 말미(cgSearch 다음)에서 호출 — as-is 실행 순서(인라인 onclick → bind 콜백) 보존, `$(this).val()` 은 각 핸들러의 리터럴 값 전달 | 이벤트 이관(기존 ev:onclick 통합) |
| 3 | cgSearch | `$('tr[name=trSearch]').attr("style","display:none;")` | `["id_isur","id_com","id_type","id_date"].forEach(… getComponent(id).hide())` | hide() |
| 4 | cgSearch ×4 · searchData ×1 · fn_search ×2 | `$('input[name=searchRadio][value=N]').attr("checked", true)` | 신설 `scwin.setSearchRadioChecked(value)` → `getComponent('ipt_searchRadio'+value).setValue(String(value))`, 컴포넌트 부재 시 as-is(매칭 0건 no-op)처럼 경고만 | setValue |
| 5 | cgSearch | `$('input[name=searchDateRadio][value=1]').attr("checked", true)` | `getComponent('ipt_searchDateRadio1').setValue('1')` | setValue |
| 6 | fn_Download ×3 | `$('#ipt_searchRadio10/11/16').is(":checked")` | `getComponent('ipt_searchRadioN').getValue() === 'N'` 비교 (도달 불가 보존 코드 내) | getValue 비교 |
| 7 | searchData ×2 | `$('#ipt_isurCd1').length`·`$('#ipt_isurNm1').length` | `$c.util.getComponent(id) != null` (gcc getComponent 는 부재 시 undefined 반환 가능 → `!= null` 관용구) | 존재 확인 |
| 8 | fn_search | `$('input[name=pageIndex]').val("1")` | `getComponent('ipt_pageIndex').setValue("1")` (jldinf20000p 선례 동일) — 마크업 주석도 컴포넌트 참조로 갱신 | setValue |

- **보류 6건 (2블록)**: ① init_pageBody 페이징 현재 페이지 강조(`$('.paging td:contains')`·`$(obj).text/html/attr` 4건) ② searchRadioClickCommon 내 페이징 초기화(`$('.paging').empty()/append` 2건, bind 콜백에서 원형 이동). 사유: `.paging` 테이블이 전환 마크업에 없어(`w2:pageList` 대체) 현재 매칭 0건 no-op 이며, pageList API 로의 대응은 페이징 컴포넌트 재설계 대상 — 원형 유지 + `[규칙 19 보류]` 주석 표기.
- **신설 함수**: `scwin.ipt_isurNm1_onkeydown`(publicInfo 등재), `scwin.setSearchRadioChecked`·`scwin.searchRadioClickCommon`(비이벤트 헬퍼 — 기존 cgSearch 등과 동일하게 publicInfo 미등재). 18개 라디오 핸들러 JSDoc @description 에 공통 호출 반영.
- **주의(의미 드리프트 기록)**: as-is 라디오 checked 는 브라우저 name 공유로 상호 배타였으나, 전환 후 각 select1 컴포넌트 값은 개별 관리된다(#6 getValue 비교는 도달 불가 코드라 실동작 영향 없음).
- **검증**: script CDATA 추출 → `node --check` 통과, jQuery 잔존 6건(보류 6건과 일치, 주석 제외), `wsxml_lint --min-severity error` 0 errors(신설 핸들러 publicInfo 등재로 WS201 없음).

## form 제출 재설계 — $c.win.openFormSubmit 전환 (2026-09-07)

`popup_form`(onPopupCode) 제출 기계부 실측·재설계. body 실측: `popup_form` 은 빈 컨테이너 그룹(`<xf:group id="popup_form" name="popupForm"/>`, 전송 필드 0건)이고 함수 내 `.submit()` 호출은 부재 — as-is 의 `window.open('', 'winPop')` + `popup_form[target=winPop]` → `/srch/srch.do?method=srchPopup{type}` 제출은 Stage-1 에서 이미 `$c.win.openPopup("/jldinf20000p/jldinf20000p.xml", …, dma_onPopupCodeReq.getJSON())`(pageFramePopup + paramData 전달) + 팝업 화면 자체 조회로 재설계된 상태였다.

| 제출 지점 | 구 흐름 | 재설계 | 판단 근거 |
|-----------|---------|--------|-----------|
| onPopupCode | `const fm = (document.popup_form ‖ …)` + `fm.action = "/srch/srch.do?method=srchPopup"+type` (제출 없음) | 무효 기계부 제거(폴백 선언·action 대입) + 재설계 경위 주석 | 잔존 action 대입은 xf:group div 프로퍼티 대입으로 무효. `openFormSubmit(url, params, { target: 'winPop' })` 전환은 부적합 — WebSquare pageFramePopup(iframe) 과 별개로 네이티브 winPop 창을 새로 열어 원 JSP 응답을 띄우게 되어 to-be 팝업 흐름과 충돌한다. type 정보는 dma_hiddenStore.ipt_stdcdType 로 보존 |

- **전환 0건·기계부 제거 1건·보류 0건**(popup_form 은 제출·값 참조 모두 아님 → 컴포넌트 전환도 불요). `tx_onPopupCode`(srchPopup executeDynamic 스텁, 미호출)는 원형 유지.
- **범위 외 잔존** (`document.폼` 3건 — 이번 과제 대상 아님, 후속 form 재설계 대상): fn_Download(`document.JLDINF20000` — action 분기 대입 후 tx_fn_Download, 도달 불가 보존 코드 내), open_corp_cd(`document.JLDINF20000` — as-is 전역 `fn_popupCorpSearch2` 가 폼 객체를 인자로 받는 계약), fn_search(`document.JLDINF20000` — action/target 대입만, 조회는 tx_fn_search 기재설계).
- **검증**: script CDATA 추출(두 번째 CDATA, `<script lazy` 앵커) → `node --check` 통과, `.submit()` 잔존 0건·`document.폼` 잔존 3건 = 범위 외 목록과 일치, `wsxml_lint --min-severity error` 0 errors(publicInfo 변경 없음).
