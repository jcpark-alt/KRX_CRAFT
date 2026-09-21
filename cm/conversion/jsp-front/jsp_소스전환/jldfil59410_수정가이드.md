# jldfil59410 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `../krx_소스전환/jldfil59410.xml` → 정비본: `jsp-front/jldfil59410.xml` (2026-09-07)
> 기준: [code-convention.md](../../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 87 | 전 함수(85 + 신규 헬퍼 2)에 `@description`(본문 기반 한국어 서술)·`@param`(타입 명기)·`@returns`·`@hidden N`·`@example` 부여, placeholder 0. 기존 `@method`/`@event`/`@name` 유지 |
| publicInfo 등재 | 40 | 기계 패스 선반영분 유지(이벤트 핸들러 40종) — body/publicInfo 무변경 |
| let→const | 175 | 재할당 없는 `let` 전부 `const` 전환 (let 209 → 잔여 let 34: 루프 카운터·재할당 변수(`res`·`valuRslt`·`innerStr`·`objArr`·`strVal`·`chkDupFlag`·`subMode`·`txt`·`tmpFile*`·`rowIdx`·`renderRoot`·`a`·`v`·`n`)만 유지, const 220) |
| var 전환 | 2 | `checkForm` 의 `for (var i …` 2건 → `for (let i …` (루프 후 미사용 확인, 블록 스코프 무해) |
| `__` 지역변수 개명 | 62 | `__self`(37)→`srcElem`, `__d`(6)→`dataList`, `__g`(4)→`gen`, `__i`(4)→`idx`, `__vFields`(2)→`vFields`, `__pc_loadTp`/`__pc`→`pc`, `__attrReals`→`attrReals`, `__genFills`→`genFills`, `__row`→`rowIdx`, `__cell`→`readCell`(콜백 파라미터 `__v`/`__i`→`read`/`idx`), `__rowCopies`→`rowCopies`, `__r0`→`renderRoot`, `__doc`→`doc` — 함수 내 참조 전부 동반 개명, 선언 잔존 0 |
| 과밀 한 줄 분해 | 44 | 200자 초과 라인 전부 분해(잔존 0). 동일 호출식 반복은 const 캐싱: `readLoadTp`/`readDetail`(init_conds), `seq`(다운로드/삭제 핸들러 15종), `registerReq`(fn_Register·checkForm, `getComponent("dma_RegisterReq")` 14회 축약), `frameRender`(init_sessionFill), 4중 중복 `readValue`(loadTp·returnVal·entity.seq·leadcom_mbr_no·specy_valu_inst_cd) |
| 헬퍼 신설 | 2 | `scwin.findFileControl(id)`(파일 컨트롤 7종 로드 시 초기화의 동일 3항식 반복 제거)·`scwin.readPageParam(key)`(loadTp/returnVal 의 4중 중복 readValue + EL 토큰 가드 축약) — 로드 시점 사용부 상단에 정의(순서 의존 주석 명기), publicInfo 비등재(내부용) |
| onpageload 재배치 | 1 | 2구역 중간(파일컨트롤 선언 뒤) 정의를 **2구역 최상단**으로 이동, `init_recvParam → … → init_pageBody` 9단계에 순번 주석(1)~9)) 부여. 실행 시점은 body `ev:onpageload` 이벤트라 동작 무변경 |

## 2. 화면 개요

코스닥 **전문평가(특례평가) 배정 신청 작성/상세 화면**. 신규 진입(loadTp "0") 시 신청서 작성(회사·대표자·신청인 정보, 주관사/제척기관 선택, 평가기관 신청수·연장신청, 첨부파일 업로드)을, 조회 진입 시 저장분 복원과 평가결과 요약(valuRsltInfo1~6) 표시·수정/삭제/철회를 제공한다. 등록·철회·삭제·파일 다운로드는 `specyValuAppl.do` 서브미션(tx_fn_*)으로 처리하고, 목록 화면(jldfil59400)과 우편번호(jldinf90009)·업종코드 팝업이 연계된다.

## 3. 보류(유지) 항목

- **`fn_*`/`tx_fn_*` 명명 17건**: `fn_PopZipCode`·`fn_toList`·`fn_chk*`·`fn_check*`·`fn_Register`·`fn_Delete`·`fn_RetrRequest`·`fn_DownloadFile`·`fn_chkUploadFile` 등 14건 + `tx_fn_Delete`·`tx_fn_RetrRequest`·`tx_fn_DownloadFile` 3건 — 호출자 정합용 as-is 별칭이라 정의·호출부 모두 개명하지 않음.
- **jQuery 3건**: `$(".form_search").on(...)`·`$(".chkNumber").on(...)`(init_pageBody 이벤트 바인딩)·`$('[type=file]')`(fn_chkUploadFile) — 규칙 19(원시 jQuery→컴포넌트) 재설계 대상으로 범위 제외.
- **`== null`/`!= null` 관용구**: null·undefined 동시 판별 관용구라 엄격화하지 않음(중복 호출식 캐싱으로 16→12건 자연 감소, 전환 0).
- **`ev:ondataload` 배선·body 마크업·publicInfo**: 무변경.
- **`'__self.value'` 문자열 리터럴 2건**(rd_skilBzTpCd_onclick·rd_extnApplYn_onclick): 변수가 아닌 **문자열 인자**로 전달되는 as-is 변환 산출물 — 로직 동등 유지 원칙에 따라 문자열 그대로 보존(해당 JSDoc 에 명기). 변수 `__self` 자체는 전부 `srcElem` 으로 개명.
- **유지되는 `__` 토큰(지역변수 아님)**: `__krxFileControl`(외부 전역 헬퍼 참조), `__sdd_rec`(팝업 회신 레코드 마커 프로퍼티), `"__rb0"`/`"__rb1"`(body 컴포넌트 id 문자열).
- **converter 산출 특이 코드**: `leadcomList[$];`·`status.index;`(setLeadcomVars/setSpecyValuInsts 의 무효 표현식), 빈 if 블록(checkForm), `(corpRegNo + 0) === 0` 등 — 동작 변경 금지 원칙으로 그대로 유지.
- **`fn_DownloadFile(01, …)` 8진 표기 리터럴**(01/02): as-is 인자 그대로 유지.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0) — 87개
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0 (선언 62건 전부 개명, `let|const|var __` 잔존 0)
- [x] 200자 초과 라인 0 (44건 분해)
- [x] onpageload 2구역 최상단 단일 정의 + init_* 순번 주석
- [x] 로직 동등(동작 변경 없음) — 문자열 리터럴·$c 호출 대사(캐싱 축약분만 감소), 단락 평가 순서 보존
- [x] node --check 통과, XML well-formed, wsxml_lint(WS111·112·113 제외) 0 오류·0 경고
- [x] `@author`/`@date` 0건, publicInfo·body 마크업 무변경

## 5. 후속 정정 — 코드 뷰티파이 적용 (2026-09-07)

- **js-beautify(indent 4) 재포맷**을 script CDATA 전체에 적용 (jldfil25900·25910·35700c 선례 동일).
- 검증: 비공백 문자 빈도 완전 일치(로직 보존), node --check 통과, wsxml_lint 0 errors, 들여쓰기 4배수 위반 0.

## 규칙 19 — jQuery 컴포넌트 전환 (2026-09-07)

기존 보류 3건(3절 "jQuery 3건")을 전량 전환했다. jQuery 잔존 0건.

| # | 위치 | as-is | to-be | 방식 |
|---|------|-------|-------|------|
| 1 | init_pageBody | `$(".form_search").on("focusout", fn)` | `document.querySelectorAll(".form_search")` + `addEventListener("focusout", …)` | 표준 DOM API (아래 참고) |
| 2 | init_pageBody | `$(".chkNumber").on("keyup", fn)` | `document.querySelectorAll(".chkNumber")` + `addEventListener("keyup", …)` | 표준 DOM API (아래 참고) |
| 3 | fn_chkUploadFile | `$('[type=file]')` | `document.querySelectorAll('input[type="file"]')` | 표준 DOM API — file input 은 파일 컨트롤(`__krxFileControl`) 내부·동적 렌더(delAttachFile innerHTML) DOM 이라 대응 컴포넌트 없음 |

- **#1·#2 ev 속성 이관 불가 사유**: body 마크업 실측 결과 `form_search`/`chkNumber` 클래스를 가진 컴포넌트 **0건**(해당 토큰은 script 내부에만 존재) — `ev:onblur`/`ev:onkeyup` 이관 대상 컴포넌트가 없다. 원본 JSP 잔재 클래스가 배포 DOM(파일 컨트롤 등)에 존재할 가능성에 대비해 jQuery 를 제거하고 동등한 표준 DOM 바인딩으로 대체했다(jQuery `return false` 는 `e.preventDefault()`+`e.stopPropagation()` 으로 등가 치환, `this`=바인딩 요소 유지). publicInfo 변경 없음.
- **보류**: 0건.
- **검증**: script CDATA 추출 → `node --check` 통과, jQuery 잔존 0건(보류 0건과 일치), `wsxml_lint --min-severity error` 0 errors.

## form 제출 재설계 — $c.win.openFormSubmit 전환 (2026-09-07)

as-is JSP 의 insertForm/downloadForm 제출 기계부를 gcc 공통함수 `$c.win.openFormSubmit(url, params)` 기반으로 재설계했다. 중간 산출물이던 executeDynamic 서브미션(tx_fn_Delete·tx_fn_RetrRequest·tx_fn_DownloadFile, AJAX 재해석)은 페이지 전환·파일 다운로드 의미와 어긋나 제거하고, 각 제출 지점이 openFormSubmit 을 직접 호출한다(POST 기본 = as-is form POST). 파일을 multipart 전송하는 fn_Register 는 보류.

### 제출 지점별 전환표

| 제출 지점 | 구 흐름 | URL | params 근거 |
|-----------|---------|-----|-------------|
| `fn_Delete()` | `scwin.form.action` 설정 + dma_RegisterReq.set(method=`delete`) + confirm + tx_fn_Delete(executeDynamic, ref dma_DeleteReq) | `/listInvstg/specyValuAppl.do` | `dma_RegisterReq.getJSON()` — as-is 는 insertForm 전체 필드 제출. body 실측 결과 모든 입력이 `data:dma_RegisterReq.*` 바인딩이라 이를 params 원천으로 확정(구 ref 였던 dma_DeleteReq 는 바인딩 0건·항상 빈 전문 — Stage-2 산출 결함) |
| `fn_RetrRequest()` | `scwin.form.action` 설정 + dma_RegisterReq.set(method=`retrReqSubmit`) + confirm + tx_fn_RetrRequest(executeDynamic, ref dma_RetrRequestReq) | `/listInvstg/specyValuAppl.do` | `dma_RegisterReq.getJSON()` — 위와 동일(dma_RetrRequestReq 미사용). bzProcsNo 인자 미사용은 as-is 로직 그대로 보존 |
| `fn_DownloadFile(fileTpCd, fileSeq)` | `document.downloadForm.action` 설정 + dma_RegisterReq.set(method=`downloadFile`·fileTpCd·fileSeq) + tx_fn_DownloadFile(executeDynamic, ref dma_DownloadFileReq) | `/listInvstg/specyValuAppl.do` | 직접 구성 객체 `{ method: "downloadFile", fileTpCd, fileSeq }` — body 실측: downloadForm(form_466)의 필드는 hidden 3종(method·fileTpCd·fileSeq)뿐. as-is 에서 별도 폼이던 값을 dma_RegisterReq(신청서 전문)에 set 하던 오염(이후 등록 제출에 method=`downloadFile` 잔류 위험)도 함께 제거. 내부 await 소멸로 동기 함수화(호출부 await 무해) |

- method 파라미터: 3지점 모두 `options.method` 미지정 = **POST**(as-is form POST 제출과 동일; 다운로드도 POST 회신으로 의미 보존), target `_self`.

### 보류

- **`fn_Register('write'/'edit')`** — insertForm 은 파일 컨트롤 7종(`fileTpCd01[0]`·`fileTpCd02[0~2]`·`fileTpCd13[0~2]`, `__krxFileControl` 로드 초기화)과 delAttachFile 이 재주입하는 `input[type=file]` 을 함께 전송하는 **multipart 폼**이라 hidden input 전용인 openFormSubmit 로 전환 불가 → 원형 유지 + `// TODO form-재설계-보류: multipart 파일 전송` 표기(JSDoc 에도 명기). `frm = (document.insertForm || { elements: [] })` 폴백·`frm.action`/`frm.skilBzTpCd[n].checked` 참조 일체 보존.
- **`scwin.form` 전역(1구역 선언 + init_pageBody 의 `document.insertForm` 확보)** — 제출 용도 참조는 0건이 되었으나, setData 의 외부 공통 호출 4건(`$c.cm.fn_SetPhoneValue` ×3·`fn_SetEmaileValue` ×1)이 계약상 form 객체(`frm[name]` 접근)를 요구해 유지(선언부·확보부에 사유 주석).

### 함께 정리한 항목

- tx_fn_Delete·tx_fn_RetrRequest·tx_fn_DownloadFile 함수 3종 삭제(publicInfo 비등재라 XML 무변경). 4구역 헤더는 사유 주석으로 대체.
- `slc_setEmail_onchange` 의 `document.insertForm.apctEmail2` → `$c.util.getComponent('ipt_apctEmail2')` 전환 — body 실측: `ipt_apctEmail2`(ref `data:dma_RegisterReq.apctEmail2`) 컴포넌트 존재. `$c.cm.fn_SelEmail` 계약 실측(as-is fil common 동일 함수: `_targetObj.setValue()`/`.focus()`)상 setValue 를 가진 **컴포넌트**가 적합(DOM input 은 setValue 부재로 오히려 계약 위반).
- dataCollection 의 `dma_DeleteReq`·`dma_RetrRequestReq`·`dma_DownloadFileReq` 는 스크립트 참조 0건의 고아가 되었으나 body/dataCollection 무변경 원칙에 따라 XML 은 유지(후속 정리 후보).

### 검증

- script CDATA 추출 → `node --check` 통과.
- `python -m wsxml_lint jldfil59410.xml --min-severity error` → 0 errors.
- `document.폼`·`scwin.form` 잔존 = fn_Register(document.insertForm, multipart 보류)·setData 계약용 scwin.form 뿐 — 보류 목록과 일치. `.submit()`·`tx_fn_*` 잔존 0건.

## conversion 규칙 재적용 (2026-09-21)

> `convert.py` 단계1을 제자리 실행하고 후처리로 보정(init 2구역 복원·5b DOM 수신 원복·개명 충돌 조정·JSDoc 동기화). 경위·공통 게이트: [krx_소스전환_미적용분석.md §5 이력 6](krx_소스전환_미적용분석.md). diff +113/−145.

| 항목 | 건수 | 내용 |
|------|------|------|
| 규칙 13 `fn_*` 개명 | 14건 | `fn_PopZipCode`→`popZipCode`, `fn_toList`→`toList`, `fn_chkDuplicateMbrNo`→`chkDuplicateMbrNo`, `fn_chkDuplicateExcInstCd`→`chkDuplicateExcInstCd`, `fn_chkValuInstApplCnt`→`chkValuInstApplCnt`, `fn_chkOnecomApplRsnCd`→`chkOnecomApplRsnCd`, `fn_chkFornComYn`→`chkFornComYn`, `fn_checkCorpRegNo`→`checkCorpRegNo`, `fn_Register`→`register`, `fn_Delete`→`delete`, `fn_RetrRequest`→`retrRequest`, `fn_DownloadFile`→`downloadFile`, `fn_chkUploadFile`→`chkUploadFile`, `fn_checkBzRegNo`→`checkBzRegNo`. 정의·호출·body `ev:`·publicInfo 동기화(도구), JSDoc `@name`/`@example` 옛 이름 50건 후처리 동기화. 교차 화면 호출 없음 |
| 규칙 5a 엄격 비교 | 10건 | `==`/`!=` → `===`/`!==` |
| 규칙 2 전역 선언 이동 | 5건 | 최상위 `scwin.X = …` 선언을 1구역으로 |
| 규칙 4 구역 재배치 | 0건 이동 | 도구가 재정렬 보류(함수 사이 최상위 실행문) — 기존 5단계 배치 유지 |
| 규칙 5b `.value=` → `setValue` | 2건 원복·보류 | 수신 객체가 `ev.target`(DOM 요소)이라 `setValue` 가 TypeError — 원복. 컴포넌트 API(getValue/setValue) 전환은 호출부 재설계와 함께 후속 |
| 규칙 5d `getTotalRow()` → `getRowCount()` | 1건 | dataList 행 수 API |
| 규칙 26 진입점 try/catch | 2건 | 이벤트 핸들러 에 `$c.exception.handleError` 래핑 |

검증: node --check 통과 · wsxml_lint 0 errors/0 warnings(WS111~113 제외) · body `ev:`·publicInfo ↔ 정의 일치 · 재변환 수렴(잔여 차이는 5b 보류분·빈 5구역 헤더뿐).

### A 그룹 — 운영 gcc 확장 7종 치환 (2026-09-21)

> 리포 `cm/gcc` 에 없는 운영 확장 함수를 dataMap/dataList·컴포넌트·`$c.session` API 로 치환(검토안: 미적용분석 §7.1). 전제: 페이지 컨텍스트 값은 `paramData` 파라미터로 전달된다(JSP 서버 모델값이 파라미터로 오지 않으면 별도 조회 API 필요).

| 대상 | 건수 | 치환 |
|------|------|------|
| `$c.data.recvParamData("dma_pageContext")` | 1 | `dma_pageContext.setJSON($c.data.getParameter() \|\| {})` — gcc `getParameter` 가 파라미터 키 `paramData` 를 고정 사용 (keyInfo 에 사용 키 1개 추가) |
| `$c.data.readValue(dc, key, opts)` | 45 | dataMap → `dc.get("key")` 22건, dataList → `dc.getCellData(row, "key")` 21건, 변수 키 래퍼 → `.get(key)` 2건. `silent`/`soft`/`ctx`/`label` 옵션은 의미 없어 제거 |
| `$c.data.readValue("entity", …)` | 3 보류 | JSP 모델 객체 — 대응 dataMap 없음(§보류) |
| `$c.util.evalConds(binds)` | 1 | 로컬 `binds.forEach` — `bind.fn() ? comp.show() : comp.hide()` |
| `$c.data.copyRows(rowCopies)` | 1 | 로컬 `rowCopies.forEach` — `comp.setValue(rc.fn())` |
| `$c.util.applyAttrReals(attrReals)` | 1 | 로컬 `attrReals.forEach` — `__html` → `comp.render.innerHTML`, `label` → `setLabel`, 그 외 → `render.setAttribute` |

**보류 3건**: `readValue("entity", …)`(seq·leadcom_mbr_no·specy_valu_inst_cd) 는 JSP 모델 객체라 대응 dataMap 없음 — 조회 API 응답 dataMap 신설 후 전환. `readPageParam(key)` 래퍼는 `dma_pageContext.get(key)`(키 `returnVal` 선언 추가). `dlt_attachList01` 의 행 미지정 읽기는 0행으로 고정

검증: node --check 통과 · wsxml_lint 0/0 · 코드 내 미정의 dataCollection 참조 0 · `$c.data.readValue` 잔존 3건(보류) 외 A 그룹 호출 0.
