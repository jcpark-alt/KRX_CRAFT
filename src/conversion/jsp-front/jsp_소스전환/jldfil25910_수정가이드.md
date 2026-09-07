# jldfil25910 스크립트 실행 구조 개선 가이드

> 대상: `src/conversion/jsp-front/jsp_소스전환/jldfil25910.xml` (배당기준일자 신고 저장·수정 화면)
> 목적: `code-convention.md` 규약 준수 — **IIFE·onpageload 오버라이딩 제거**, **초기화 순차 호출**, 오류 처리·문법·명명·주석 규약 전반 적용.
> 자매 화면 [jldfil25900_수정가이드.md](jldfil25900_수정가이드.md) 와 동일 변환 패턴(규모 확대판).

---

## 1. 현재 구조의 문제점

2구역(초기화 영역)에 **자동 실행 IIFE 4개**와 **onpageload 오버라이딩 래핑 1개**가 있고, 3·4·5구역에 오류 처리·문법 규약 위반이 산재해 있었다.

| 구역 | 위반 | 건수 |
|------|------|------|
| 2 | 자동 실행 IIFE(`__attrReals`·`__rowCopies`·`__fillNow`·`evalConds`) | 4 |
| 2 | `var __prev = scwin.onpageload;` 오버라이딩 래핑 + `setTimeout` 다중 예약 | 1 + 8 |
| 2 | 미사용 전역 재선언(`scwin.result = undefined; scwin.modifiyDate = undefined;`) | 1 |
| 3 | 이벤트 핸들러의 미사용 지역변수(`ev`/`event`/`__self`) + 빈 catch·이중 중첩 try/catch | 14 |
| 4 | 서브미션 함수의 `executeDynamic` 자체 try/catch(예외 삼킴) + `== true` | 3 |
| 5 | 무의미한 자기 대입(`scwin.fn_x = scwin.fn_x;`) | 14 |
| 5 | 비엄격 비교(`== ''`·`== "Y"`)·미선언 루프변수(`for (i = …`)·`fn_modifiyDate` 중첩 IIFE 파서 | 다수 |
| 전체 | 함수 JSDoc 부재 | 39 |

---

## 2. 개선 방향 (code-convention 규약)

1. **초기화 절**: IIFE 4개를 명명 함수(`scwin.init_*`)로 분리, 자동 실행 제거.
2. `scwin.onpageload` 를 **2구역 최상단**에 단일 정의하고 `init_*` 를 **데이터 의존성 순서**로 순차 호출(오버라이딩·`__prev`·`setTimeout` 제거).
3. **오류 처리 절**: 진입점(3구역 이벤트 핸들러·onpageload)만 `try/catch + $c.exception.handleError` **한 줄**, 빈 catch·이중 중첩 제거, 내부 함수(4·5구역)는 예외 전파.
4. **변수·문법 절**: 엄격 비교(`===`/`!==`, `== null`/`!= null` 관용구 제외), `const` 기본, 미사용 지역변수·전역 삭제, `for (let i …`.
5. **주석 절**: 전 함수 표준 JSDoc.

---

## 3. 2구역 변경 후 구조 (요약)

`onpageload` 를 최상단에 두고 `init_*` 6개를 순차 호출한다(JSDoc 생략 표기).

```javascript
///////// 2. 초기화 영역 /////////

// 화면 진입점 — 2구역 최상단 정의, init_* 순차 실행(래핑 없이 단일 정의)
scwin.onpageload = function () {
  try {
    scwin.init_recvParam();   // 1) 파라미터 수신
    scwin.init_fillNow();     // 2) sysYear 미수신 시 서버 연도 충전
    scwin.init_attrReals();   // 3) textarea 라벨 동적 렌더
    scwin.init_rowCopies();   // 4) 기준년도·결산월 표시 행 복사
    scwin.init_conds();       // 5) 조건부 표시 영역 평가
    scwin.init_radio();       // 6) 배당기준일 라디오 초기 표시·change 바인딩
  } catch (ex) {
    $c.exception.handleError(ex, { context: "jldfil25910.onpageload" });
  }
};

scwin.init_attrReals = function () { /* applyAttrReals(주주명부·이익배당 라벨) */ };
scwin.init_rowCopies = function () { /* copyRows(기준년도·결산월) */ };
scwin.init_fillNow   = function () { /* sysYear 폴백 충전 */ };
scwin.init_recvParam = function () { $c.data.recvParamData("dma_pageContext"); };
scwin.init_conds     = function () { /* isEditable/isReadonly/hasBzProcsNo 로 조건부 영역 평가 */ };
scwin.init_radio     = function () { scwin.basDRadio(); /* divBasDdYn change 바인딩 */ };
```

> **evalConds 정리**: 구 코드는 17개 조건 바인딩이 동일한 `checkModifiyDate/listStatCd` 비교식을 인라인 반복했다. `isEditable`(수정 가능)·`isReadonly`(읽기전용)·`hasBzProcsNo`(등록 여부) 헬퍼로 추출해 중복을 제거했다.

---

## 4. 구역별 변경 요약

### 4.1 3구역 이벤트 핸들러 (14개)
- `try { let ev = e; let event = ev; let __self = …; BODY } catch (_ex) { try {…} catch (_ehx) {} }` → 진입점 표준형으로 통일.
- 미사용 `ev`/`event` 제거, `__self` 실사용 핸들러(`txa_*_onkeyup`/`_onblur` 4개)만 `const __self = …` 복원.
- catch 는 `[await] $c.exception.handleError(ex, { context: "jldfil25910.함수명" })` 한 줄, 빈 catch·이중 중첩 제거.

### 4.2 4구역 서브미션 함수 (3개)
- `tx_fn_register`·`tx_fn_modifiyDate`: `executeDynamic` 자체 try/catch 제거 → 예외 전파(진입점에서 처리), `success == true` → `=== true`, 응답 실패 메시지 표시는 유지.
- `tx_fn_FileDown`: `downFile` 감싸던 이중 try/catch·빈 catch 제거 → 전파.

### 4.3 5구역 업무 함수
- 무의미한 자기 대입(`scwin.fn_list = scwin.fn_list;` 등 14건) 삭제.
- `fn_modifiyDate`: 중첩 IIFE(JSON.stringify→parse 왕복) 파서 → 평탄한 `body` 추출로 단순화(로직 동등).
- 엄격 비교: `== ''` → `=== ''`(fn_validation 5건), `+ "" == "Y"`/`== ""` → `===`(basDRadio), `isFileType[i] == fileType`·`typeChkCnt == 0`·`modifiyDate == "N"`·`delck == "Y"`·`escape(...) == '%0A'` → `===`. (`== null`/`!= null` 관용구는 유지)
- 미선언 루프변수 `for (i = 0; …` → `for (let i = 0; …`(fn_fileTypeChk).

### 4.4 미참조 컴포넌트 캐싱 전역 삭제 (96개)
- W-Craft 변환기가 body 컴포넌트를 전부 `scwin.X = $c.util.getComponent('X')` 로 자동 캐싱했으나, 스크립트에서 `scwin.X` 로 참조하지 않는 것(`table_17`·`col_32`·`td_19` 등 body 부재 죽은 참조 포함)은 삭제한다.
- 함수는 `$c.util.getComponent(...)` 직접 조회 방식이라 무영향. **실사용 캐싱만 유지**: `ex`(onMover/onMout 의 `scwin.ex.setStyle`)·`filebox`(fn_fileDel 의 `scwin.filebox.setStyle`).
- 상태값(`result`·`modifiyDate`·`delck`·`screenId`)·특수 초기화(`upd_attachFile` = `__krxFileControl`)는 유지.

### 4.5 인라인 IIFE 전면 제거 → 명명 헬퍼 전환 (8건, 2026-09-04)
- code-convention **「IIFE 금지(화면 페이지 전면)」** 규칙 확정에 따라, 화면 페이지에서는 값 계산·값 쓰기용 인라인 IIFE 도 사용하지 않는다. 반복 로직을 5구역 명명 헬퍼로 분리해 호출한다.
- 제거 대상 8건:
  - **값 추출 6건**: `btn_FileDown_onclick`·`btn_FileDown_2_onclick`(각 `bzProcsNo`·`attachFileNm` 2건)·`basDRadio` 관련(`divBasDdYn` 2건) 의 `(function(){ … dma_dividendDate.get/getCellData … })()` → `scwin.getDmaValue("dma_dividendDate", "키")`.
  - **값 쓰기 1건**: `fn_setLength` 의 `(function(__c,__v){ setValue/setText })(…)` → `scwin.setComponentText(comp, val, tdName)`.
  - **파일 컨트롤 폴백 1건**: `scwin.upd_attachFile` 초기화의 `(function(){ getFrame().render … })().querySelector(…)` → `scwin.resolveFileControlRoot().querySelector(…)`.
- 신규 헬퍼 3종을 5구역 말미에 정의: `scwin.getDmaValue(dmaId, key)`·`scwin.setComponentText(comp, val, label)`·`scwin.resolveFileControlRoot()`.
- 결과: 화면 값계산/자동실행 IIFE **잔존 0**(이벤트 콜백 `.change(function(){…})` 는 IIFE 아님·유지).

### 4.6 주석 (전 구역)
- 함수 39개에 표준 JSDoc(`@method`/`@name`/`@description`/`@param`/`@returns`/`@hidden`) 부여, placeholder 0.
- (2026-09-07 규약 재감사) §4.5 헬퍼 3종에 누락됐던 JSDoc 보완 → **총 42개 완비**.

---

## 5. 유지(변환 제외) 항목

- **`== null`/`!= null`**: null·undefined 동시 판별 관용구라 엄격화하지 않는다.
- **jQuery DOM 조작**(`$("input[name=…]").val(…)`·form action 설정): 규칙 19(원시 jQuery→컴포넌트) 재설계 대상으로, code-convention 직접 규약 밖이라 이번 범위에서 제외. body 에 `dma_*Req` 바인딩 hidden input 이 있어 후속 전환 가능. → **2026-09-07 「규칙 19 — jQuery 컴포넌트 전환」 절에서 수행(전환 2·보류 12)**.
- **`fn_*`/`tx_fn_*` 명명**: 호출자 정합용 as-is 별칭(`fn_modifiyDate`·`tx_fn_*`)이라 개명 보류. 신규 5구역 함수는 camelCase.

---

## 6. 검토 체크리스트

- [x] 화면 IIFE(값 계산·값 쓰기·자동 실행 모두) 0건 — 헬퍼 3종(`getDmaValue`·`setComponentText`·`resolveFileControlRoot`) 전환
- [x] `__prev` / `var __prev = scwin.onpageload` 0건
- [x] `setTimeout(` 예약 호출 0건
- [x] `scwin.onpageload` 정의 1건, **2구역 최상단 배치**, `body ev:onpageload` 바인딩 유지
- [x] 빈 catch·이중 중첩 try/catch 0건, 내부 함수 예외 전파
- [x] 비엄격 `==`/`!=` (코드) 0건(관용구 `== null`/`!= null` 제외)
- [x] 자기 대입 0건, 미선언 루프변수 0건
- [x] 미참조 `scwin.X = getComponent('X')` 캐싱 전역 삭제(96개, 실사용 `ex`·`filebox`·상태값 유지)
- [x] 전 함수 JSDoc 완비(42개 — 헬퍼 3종 포함, placeholder 0)
- [x] XML well-formed + JS 구문 OK
```

---

## 규칙 19 — jQuery 컴포넌트 전환 (2026-09-07)

jQuery 원시 DOM 조작 **14건 중 2건 전환·12건 보류**(§5 의 "규칙 19 후속 전환 가능" 항목의 실행). 값 읽기/쓰기·이벤트 바인딩 계열만 전환하고, JSP form 제출 기계부·외부 위젯 결합 건은 원형 유지 + TODO 표기.

### 전환 (2건)

| 위치 | 변경 전 | 변경 후 |
|---|---|---|
| `init_radio` | `$("input[name='divBasDdYn']").change(function(){...})` (런타임 바인딩) | `rd_divBasDdYn` 에 `ev:onchange="scwin.rd_divBasDdYn_onchange"` 선언 바인딩 이관 + 3구역에 `scwin.rd_divBasDdYn_onchange` 신설(규칙 3 명명, try/catch+handleError, **publicInfo 등재**). 값은 `this.value` → `$c.util.getComponent("rd_divBasDdYn").getValue()` |
| `fn_fileValidation` | `$("input[type='file']")` + `.attr("value")` ×3 | `scwin.resolveFileControlRoot().querySelectorAll('input[type="file"]')[0]` + `.value` 1회 추출(`fileVal`). 파일 컨트롤 내부 DOM 은 컴포넌트 API 부재 — 기존 헬퍼 경유 원시 접근으로 jQuery 만 제거(사유 주석 부기) |

- `rd_divBasDdYn2`(읽기전용, 동일 name=divBasDdYn)는 `onclick` 이 false 를 반환해 변경이 차단되므로(구 change 바인딩도 사실상 사문) onchange 이관 대상에서 제외 — 동작 동일.
- `.attr("value")` → `.value` 프로퍼티: 구(舊) jQuery(attr=prop 시절) 의도(선택 파일 경로 읽기) 보존. 빈 매치 시 `undefined` 반환하던 것은 `null` 로 대체 — 후속 `!= null` 관용구 판별 동일.

### 보류 (12건) — form 제출 기계부·외부 위젯

각 위치에 `// TODO 규칙19-보류: ...` 한 줄 주석 표기(연속 블록은 블록 선두 1회).

| 함수 | 코드 | 사유 |
|---|---|---|
| `rd_divBasDdYn_onchange` (구 init_radio) | `$(".ui-datepicker-trigger").click()` | jQuery UI datepicker 위젯 트리거 — 외부 위젯 재설계(별도 과제) |
| `fn_list` | `$('#dividendDateForm').append('<input type="hidden" name="method" .../>')` | JSP form 제출 기계부 (dividendDateForm 은 `xf:group` tagname 렌더 — 폼 컴포넌트 아님) |
| `fn_list` | `$('#dividendDateForm').attr("action", ...)` / `.attr("onsubmit", "")` (2건) | 상동 |
| `fn_register` | `$('#dividendDateForm').append(...)` / `.attr("action", ...)` / `.attr("onsubmit", "")` (3건) | 상동 |
| `fn_fileDel` | `$("#attachFileList").remove()` | 폼 내 동적 첨부 목록 정리 — form 제출 재설계와 결합 |
| `fn_FileDown` | `$('#dividendDateAttachForm').append(...)` / `.attr("action", ...)` / `.attr("onsubmit", "")` (3건) | 상동 (dividendDateAttachForm 도 `xf:group` 렌더) |
| `fn_FileDown` | `$("#method").remove()` | 동적 히든 정리 — form 제출 재설계와 결합 |

### 검증

- [x] script CDATA 추출 → `node --check` OK
- [x] jQuery 잔존 12건 = 보류 12건 일치 (전환 대상 잔존 0)
- [x] `wsxml_lint --min-severity error` → 0 errors, `publicInfo="scwin.rd_divBasDdYn_onchange"` 정의 존재(WS201 없음)

---

## form 제출 재설계 — $c.win.openFormSubmit 전환 (2026-09-07)

JSP form 제출 기계부를 gcc 공통함수 `$c.win.openFormSubmit(url, params)` (동적 hidden 폼 생성 후 POST 제출 — JSP 페이지 전환·Content-Disposition 다운로드 의미 보존, src/gcc/win.xml) 기반으로 재설계. 규칙 19 form 계열 보류 11건 중 **8건 삭제·3건 multipart 보류 전환**(외부 위젯 datepicker 1건은 범위 외 유지).

### 제출 지점별 전환 (2건)

| 함수 | 구 흐름 | URL | params 구성 | 근거 |
|---|---|---|---|---|
| `fn_list` | dividendDateForm 에 method hidden append + `dma_listReq.set("method","dividendDateList")` + action="dividendBaseDate.do"·onsubmit 해제(보류 jQuery 3건) → `moveUrl("/jldfil25900/...")` 근사 전환 | `dividendBaseDate.do` (POST) | `method`(dma_listReq 값) + `bzProcsNo`·`isurCd`·`basYy`(히든 인풋 getValue) + `divBasDdYn`(rd_divBasDdYn)·`divBasDd`(cal_divBasDd)·`shrhdNmlistClsBasddContn`·`proftDivRemk`(textarea getValue) | body dividendDateForm(xf:group) 내 name 보유 폼 컴포넌트 실측 전량. `upd_attachFile`(name=attachFile)은 파일이라 params 이관 불가 — 목록 전환 제출에 불필요하여 제외(주석 부기). `rd_divBasDdYn2`(동일 name, 비바인딩 읽기전용 영역)·`divBasDd_2` 등 div 는 전송 필드 아님 |
| `fn_FileDown` | dividendDateAttachForm 에 method hidden append + action="dividendDateFiledown.do" + onsubmit 해제(보류 jQuery 3건) → `tx_fn_FileDown()`(`$c.data.downFile("filedown.do", …)` 근사·URL 상이) → `$("#method").remove()` 정리 | `dividendDateFiledown.do` (POST) | `method`(=dividendDateAttachFile, dma_listReq 값) + `contnId`·`attachFileNm`(setValue 후 getValue 실측) | body dividendDateAttachForm 내 바인딩 히든 인풋 2개(`ipt_contnId`[name=contnId]·`ipt_attachFileNm`[name=attachFileNm]) = 전송 필드 전량. 다운로드 제출은 페이지 전환 없이 Content-Disposition 저장 — openFormSubmit POST 로 원형 URL 복원 |

- `fn_FileDown` 부속 정리: 미사용 잔재 `let frm = (document.DividendDateAttachForm || …)` 삭제, 근사 구현 `scwin.tx_fn_FileDown`(downFile "filedown.do" — 원 action 과 URL 상이) 은 미참조 사장 코드가 되어 함수째 삭제(publicInfo 미등재 — WS201 무관), await 소멸로 `fn_FileDown` 은 일반 함수화(호출부 `await` 는 유효).
- `fn_list` 의 `moveUrl` 근사 전환 삭제 — 페이지 전환은 openFormSubmit 이 JSP 원형 그대로 수행.

### 보류 (multipart 예외 1지점 + 범위 외 1건)

| 함수 | 코드 | 사유 |
|---|---|---|
| `fn_register` | `$('#dividendDateForm').append('<input … name="method" …/>')` / `.attr("action", …)` / `.attr("onsubmit", "")` (3건, 원형 유지) | **multipart 파일 전송** — dividendDateForm 은 파일 컨트롤 `upd_attachFile`(name=attachFile)의 파일을 폼으로 전송하는 저장 제출이라 openFormSubmit 으로 파일 이관 불가. `// TODO form-재설계-보류: multipart 파일 전송 — 파일 업로드 API 재설계 필요` 로 TODO 갱신 |
| `rd_divBasDdYn_onchange` | `$(".ui-datepicker-trigger").click()` | 외부 위젯(jQuery UI datepicker) — 이번 form 재설계 범위 아님(규칙19-보류 유지) |

### fn_fileDel — `$("#attachFileList").remove()` 판단

- attachFileList 는 전송 필드가 없는 표시 영역(xf:group 내 다운로드 앵커·파일명 textbox)이라 **폼 정리 목적은 재설계로 소멸**, 삭제된 첨부 링크 숨김(UI)은 여전히 필요 → `$c.util.getComponent("attachFileList").setStyle("display", "none")` 컴포넌트 API 로 전환(기존 `scwin.filebox.setStyle` 선례와 동일 계열 — querySelector 불요). 부수: `let msg` → `const msg`.

### 삭제된 규칙19-보류 항목 (8건)

| 함수 | 삭제된 코드 |
|---|---|
| `fn_list` | `$('#dividendDateForm').append('<input … name="method" …/>')` / `.attr("action", "dividendBaseDate.do")` / `.attr("onsubmit", "")` (3건) |
| `fn_FileDown` | `$('#dividendDateAttachForm').append('<input … name="method" …/>')` / `.attr("action", "dividendDateFiledown.do")` / `.attr("onsubmit", "")` (3건) |
| `fn_FileDown` | `$("#method").remove()` (동적 히든 정리 — openFormSubmit 이 자체 폼을 생성·제거하므로 불필요) |
| `fn_fileDel` | `$("#attachFileList").remove()` (컴포넌트 API 숨김으로 전환) |

### 검증

- [x] script CDATA 추출 → `node --check` OK
- [x] `wsxml_lint --min-severity error` → 0 errors (publicInfo 변경 없음 — 삭제된 tx_fn_FileDown 은 미등재)
- [x] jQuery 잔존 4건 = 보류 4건(fn_register 3 + datepicker 1) 일치, `document.폼` 잔존 0건, `moveUrl` 잔존 0건, `openFormSubmit` 호출 2건(fn_list·fn_FileDown)
