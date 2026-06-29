# WebSquare 변환 세부 규칙 (Conversion Rules)

> 이 문서는 [websquare_conversion_guide.md](websquare_conversion_guide.md) 의 **§2 세부 변환 규칙** 본문입니다. 규칙 7 의 치환 매핑은 [substitution_map.md](substitution_map.md) 를, 단계별 파이프라인은 [conversion_pipeline.md](conversion_pipeline.md) 를 참조하세요.

## 세부 변환 규칙 (Rules)

### 규칙 1: 파일명 변수 선언 및 최상단 배치
* 변환 중인 XML 파일의 파일명(예: `ULDCOM00007.xml`)을 추출합니다.
* 스크립트 영역의 최상단에 `scwin.vScrenID = "{파일명}";` 형태로 코드를 삽입합니다.

### 규칙 2: 전역 변수 재정의
* 기존에 선언되어 있던 전역 변수들은 파일명 선언 바로 하단(`// 전역 변수 선언` 주석 구역)으로 이동시킵니다.

### 규칙 3: 이벤트 함수명 CamelCase 및 표준화
* 모든 이벤트 함수는 `scwin.{camelCase}` 구조로 변환하되, 단어 사이의 언더바(`_`) 값은 예외적으로 허용합니다.
* 특히, `<body>` 영역 XML의 `ev:on` 속성에 지정된 함수명과 스크립트 영역의 함수명을 동시에 동기화하여 수정해야 합니다.
* **컴포넌트 이벤트 명명 규칙**: `scwin.{컴포넌트명}_{이벤트명}` (이때 `{이벤트명}`은 전체 **소문자**로 변환).
    * *예시:* `ev:onclick="scwin.btn_Search_onclick"`

### 규칙 4: 코드 구조화 및 영역 분리 (정렬 순서)
스크립트 영역의 코드를 아래의 4가지 파트로 분류하고, 지정된 고정 주석을 바운더리로 삼아 순서를 재정렬합니다.

1. **전역 변수 선언 영역** (`// 전역 변수 선언`)
2. **초기화 함수 영역** (`// scwin.onpageload, scwin.onpageunload 함수`)
   - `scwin.gform_onload` 함수의 코드를 `scwin.onpageload` 내부로 이동하고, 기존 `scwin.gform_onload` 정의는 삭제.
3. **WebSquare 컴포넌트 이벤트 함수 영역** (`// WebSquare 컴포넌트 이벤트 함수`)
   - `<body>` 영역의 `ev:on` 으로 시작하는 함수들을 모두 이쪽으로 재배치 및 소문자화 가이드 적용.
4. **일반 함수 영역** (`// 일반 함수`)

### 규칙 5: 코드 문법 및 컴포넌트 API 최적화
* **비교 연산자 엄격화**: `==` 및 `!=`를 찾아 타입 체크가 포함된 일치 연산자 `===` 및 `!==`로 수정.
* **값 설정 API 변환**: `{컴포넌트명}.value = "";` 형태의 코드를 `{컴포넌트명}.setValue("");` 구조로 전면 치환.
* **값 설정 API 변환**: `{컴포넌트명}.src = "";` 형태의 코드를 `{컴포넌트명}.setBackgroundImage("");` 구조로 전면 치환.
* **메서드명 API 변환**: `{dataCollection}.getTotalRow();` 형태의 코드를 `{dataCollection}.getRowCount();` 구조로 치환(수신 객체·인자 보존, 메서드명만 변경).

### 규칙 6: Submission의 동적 함수($c.sbm.executeDynamic) 치환 및 XML 제거
* `<head>` 내의 `<xf:submission>` 태그 속성을 파싱하여 `sbmOptions` 객체를 생성합니다.
* 스크립트의 `$c.sbm.execute(sbm_commonCode);` 코드를 `$c.sbm.executeDynamic(sbmOptions);` 형태로 치환하고, 기존 `<xf:submission>` XML 노드는 완전히 삭제 처리합니다.
* 상세 매핑·`gridview` 역추적 규칙은 아래 [규칙 6 보충: Submission 변환 상세](#규칙-6-보충-submission-변환-상세) 를 참조하세요.

### 규칙 7: 레거시 공통함수 → gcc 공통함수($c.*) 치환
* 기존 스크립트가 호출하는 레거시 공통/유틸 함수(예: `fn_Trim`, `cGetToday`, `Add_MoneyComma`, `email_chk`)를 신규 gcc 공통함수(`$c.<ns>.<fn>`)로 치환합니다.
* **단일 출처(SOT)**: 원본 함수 → 대상 함수 매핑의 기준은 모듈별 이관 매핑 가이드인 `src/docs/api/{fil,ins,mgt}/index_transfer.html` 의 `DATA` 배열입니다. 변환 대상 파일이 속한 모듈의 매핑을 우선 적용하고, 대표 매핑은 별도 문서 [substitution_map.md](substitution_map.md) 에 정리되어 있습니다.
* **태그(tag) 의미**:
    * *(태그 없음)*: 1:1 직접 치환 가능.
    * **검토**: 시그니처·기본값·동작에 차이가 있을 수 있으므로 인자/반환값을 확인한 뒤 치환.
    * **대체**: 단순 함수 치환이 아니라 통신·구조 자체를 gcc 방식으로 재작성(주로 원시 XHR → `$c.sbm.*`, jQuery 풍 `$()` → `$c.util.getComponent`).
* **치환 시 유의사항**:
    * 인자 순서·개수가 레거시와 다를 수 있으므로, 치환 전 gcc 함수 시그니처(`src/docs/api/gcc/index.html`)를 반드시 확인합니다.
    * 동일 AS-IS 함수가 여러 모듈/파일에 **사본**(`common.xml`, `function.xml`, `utils.xml` 등)으로 중복 존재할 수 있습니다. 사본 정의를 직접 고치지 말고, 호출부를 gcc 공통함수 호출로 바꿉니다.
    * 치환 후 더 이상 참조되지 않는 레거시 공통함수 **정의**는 제거 검토 대상입니다. 단, 같은 파일 내 다른 함수가 여전히 참조하면 유지합니다.
    * **함수 선언/정의명은 치환에서 제외**합니다. 파일 내에 함수로 선언/정의된 이름(`scwin.JongmokName = function(...)`, `function isNum(...)`, `NAME = (...) =>` 등)이 매핑표 키와 겹치더라도, 로컬 정의 우선 원칙에 따라 해당 이름은 gcc 치환 대상에서 빼고 선언부·호출부를 그대로 둡니다(선언부 손상·동작 불일치 방지).
    * 비교 연산자 엄격화(규칙 5)와 함께, 치환 결과가 `null`/빈값을 반환할 수 있는 경우 `$c.util.isEmpty()` 로 방어 코드를 보강합니다.

### 규칙 7m: 레거시 메서드 호출 → gcc 공통함수 치환 (수신 객체 제거)

* 규칙 7(점(`.`) 없는 순수 식별자 함수 호출)과 달리, `{객체명}.method()` 형태의 **레거시 메서드 호출 전체**를 인자 없는 gcc 공통함수 호출로 치환합니다(수신 객체 제거).
* **대표 매핑**: `{객체명}.CloseFrame()` → `$c.win.closePopup()` (예: `frame.CloseFrame()`·`await $c.frame.CloseFrame()` → `$c.win.closePopup()`). 매핑은 [substitution_map.md](substitution_map.md) §10·§6 를 참조하세요.
* **치환 시 유의사항**:
    * 수신 객체는 식별자 체인(`frame`, `$c.frame` 등)을 포괄하며, **인자 없는 호출만** 자동 치환 대상입니다. `await` 등 선행 토큰은 보존합니다(`$c.win.closePopup()` 는 비동기 아님 — 무해).
    * **인자가 있는 동일 메서드 호출**(`obj.CloseFrame(arg)`)은 시그니처·동작 차이 가능성이 있으므로 자동 치환하지 않고 보류·리포트합니다.
    * 변환된 호출 **바로 위의 W-Craft 검수 마커**(해당 메서드명을 언급하는 `//----W-Craft … CloseFrame----//`)는 함께 제거합니다(규칙 12 동일 원칙).
    * 문자열/주석/정규식 등 리터럴 내부는 보호합니다(규칙 5 동일 원칙).

### 규칙 7n: 모듈 네임스페이스 레거시 함수명 정규화 (`$c.<ns>.fn_*` → `$c.<ns>.<정규명>`)

* 이미 `$c.<ns>.` 네임스페이스는 붙었으나 함수명이 레거시 원본인 호출(예: `$c.stf.fn_setFromToDate(...)`)을 gcc 정규명(`$c.stf.setFromToDate(...)`)으로 **이름만 정규화**합니다(인자 보존).
    * *예시:* `$c.stf.fn_OpenDisclViewer` → `$c.stf.openDisclViewer`, `$c.stf.Combo_CBDataSetPeriod` → `$c.stf.comboCbDataSetPeriod`, `$c.stf.CopyDataSet` → `$c.stf.copyDataSet`
* **단일 출처(SOT)**: 규칙 7(레거시 유틸 → `$c.core`, `index_transfer.html`)과 달리, 이 매핑은 **모듈 업무공통 함수**(substitution_map.md **§9**)이며 `src/as-is/{fil,ins,mgt,stf}/gcc/*.xml` 각 함수의 JSDoc `(AS-IS: 원본명)` ↔ `@name`/`scwin.<정규명>` 정의에서 직접 취합합니다(`gcc_mapping.module_fn_dict()`).
* **치환 시 유의사항**:
    * **같은 네임스페이스 안에서 이름만** 바뀌는 경우만 자동 대상입니다. 네임스페이스가 바뀌는 매핑(예: `$c.stf.showObj` → `$c.validate.setComponentProperty`, `$c.stf.getObjectValue` → `$c.util.getComponent`)이나 검토/대체 태그 함수는 자동 치환하지 않고 단계 2(Claude) 판단으로 남깁니다.
    * 이름이 이미 정규명이거나(`asis == tobe`) gcc 라이브러리에 정의가 없는 호출(`$c.stf.fn_PopupCorpInfo` 등)은 변환하지 않습니다.
    * 내부 헬퍼(`__`로 시작하는 `@hidden` 함수)로의 정규화는 제외합니다(외부 호출 보호).
    * 문자열/주석/정규식 리터럴 내부는 보호합니다.

### 규칙 8: `var` 선언의 `const` / `let` 치환
* 스크립트 영역의 `var` 선언을 블록 스코프 키워드(`const`/`let`)로 치환합니다.
    * **재할당이 없는 변수** → `const`
    * **재할당·증감되는 변수, 반복문 카운터** → `let`
* **판정 기준**: 선언 이후 같은 스코프에서 `=`(재대입)·`++`·`--`·`+=` 등으로 값이 다시 바뀌면 `let`, 한 번만 할당되면 `const`.
    * *예시:* `var url = ...;`(한 번만 할당) → `const url = ...;` / `var cnt = 0; ... cnt = i;` → `let cnt = 0;`
* **암묵적 전역 선언화**: `var` 없이 사용된 변수(예: `for (i = 1; i <= n; i++)` 의 `i`)도 명시적으로 선언합니다. 반복문 카운터·누적 변수는 `let`.
* **치환 시 유의사항(Claude 검토 대상)**:
    * `var` 의 **함수 스코프 호이스팅**에 의존하는 코드(선언 전 사용, 같은 이름 재선언)는 블록 스코프로 바꾸면 동작이 달라질 수 있으므로 검토 후 치환합니다.
    * 반복문 내부에서 **클로저가 루프 변수를 캡처**하는 경우, `var`→`let` 전환으로 캡처 동작이 바뀝니다(대개 의도대로 개선되나 확인 필요).
    * 문자열·주석·정규식 내부의 `var` 는 치환 대상이 아닙니다(리터럴 보호 — 규칙 5 동일 원칙).
    * 객체/배열 자체를 재대입하지 않고 내부만 변경(`obj.x = 1`, `arr.push(...)`)하는 경우는 `const` 가 적절합니다.

### 규칙 9: 불필요 공통함수 호출 제거

* gcc 표준에서 더 이상 사용하지 않는 아래 로딩/윈도우 제어 공통함수 **호출을 스크립트에서 삭제**합니다. (로딩 인디케이터는 통신 모듈이 자동 처리)
    * `$c.cm.ShowWin` / `$c.cm.CloseWin` — 로딩 윈도우 표시/닫기
    * `$c.cm.ShowNoData` — 데이터 없음 표시
    * `$c.cm.ShowTrWin` / `$c.cm.CloseTrWin` — 트랜잭션 윈도우 표시/닫기
* **삭제 범위**: 해당 함수만 호출하는 단독 statement 라인을 삭제합니다. 활성 코드뿐 아니라 주석 처리된 W-Craft 흔적(`////$c.cm.ShowWin(...)`)도 함께 제거합니다.
* **주의사항**:
    * 중괄호 없는 제어문 본문(`if (x) $c.cm.ShowWin(...);`)은 삭제 시 동작이 바뀌므로 보류·리포트합니다.
    * 문자열/주석 등 리터럴 내부는 보호합니다(규칙 5 동일 원칙).

### 규칙 10: `<xf:events>` / `<xf:event>` 요소 삭제

* XML(주로 `<body>`) 영역에서 **`<xf:events ...> ... </xf:events>` 블록과 그 안의 `<xf:event .../>` 요소를 전부 삭제**합니다.
    * `<xf:events>`(컨테이너, 짝 태그)와 `<xf:event>`(self-closing) 모두 대상입니다.
* 이들은 W-Craft 변환 시 남은 **레거시 이벤트 매핑 선언**으로, WebSquare 표준에서는 컴포넌트의 `ev:on*` 속성(규칙 3)으로 이벤트가 바인딩되므로 불필요합니다.
* **삭제 범위·주의사항**:
    * 주석 처리된 블록(`<!-- <xf:events ...> ... -->`)도 함께 제거합니다.
    * 컨테이너 `<xf:events>` 가 있으면 내부 `<xf:event>` 를 포함해 통째로 삭제하고, 컨테이너 없이 단독으로 존재하는 `<xf:event .../>` 도 삭제합니다.
    * 삭제 후 남는 빈 줄은 정리합니다.

### 규칙 11: `include(...)` 스크립트 삭제

* 스크립트 영역에서 **`include(...)` 로 시작하는 라인을 삭제**합니다. (예: `include("../js/common.js");`)
* 외부 JS 파일 로딩 구문으로, gcc 공통 라이브러리는 `$c.*` 네임스페이스로 제공되어 별도 include 가 필요 없습니다.
* **삭제 범위**: 활성 코드뿐 아니라 주석 처리된 형태(`//include(...)`, `////include(...)`)도 제거합니다.
* 문자열/비코드 내부는 보호합니다.

### 규칙 13: `scwin.fn_*` 정의 함수명 정규화 (`fn_` 제거 + camelCase)

* 스크립트에 **정의된** `scwin.fn_*` 함수(`scwin.fn_setFromToDate = function …`)의 `fn_` 접두어를 제거하고 **camelCase** 로 정규화합니다.
    * *변환 예:* `fn_setFromToDate` → `setFromToDate`, `fn_OpenRecvDetail` → `openRecvDetail`, `fn_in_charge` → `inCharge`, `fn_code1_sync` → `code1Sync`, `fn_GetByte` → `getByte`
    * camelCase 규칙: `fn_` 제거 후 언더바(`_`)로 분리 → 첫 토큰은 첫 글자 소문자, 이후 토큰은 첫 글자 대문자로 결합.
* **함께 변경(호출부 동기화)**: 개명된 함수를 참조하는 모든 곳을 동시에 수정합니다 — 스크립트 호출부, `<body>` 의 `ev:on*="scwin.fn_*"`, `<head>` 의 `publicInfo`/`submission` 핸들러.
* **치환 시 유의사항**:
    * **같은 파일에 정의된 함수만** 대상입니다(로컬 정의 우선). 정의 없이 호출만 있는 외부 함수(`scwin.fn_GetPar` 등)는 개명 시 호출이 깨지므로 **변경하지 않습니다**.
    * 대상명이 (개명되지 않는) 기존 함수명과 겹치거나, 둘 이상이 같은 이름으로 수렴하는 경우(`fn_search`·`fn_Search` → `search`)는 충돌 방지를 위해 **보류·리포트**합니다.
    * 문자열/주석/정규식 리터럴 내부는 보호합니다(규칙 5 동일 원칙).

### 규칙 14: 컴포넌트 인자 → 수신 객체 승격 (`$c.<ns>.<레거시메서드>(컴포넌트, …)` → `컴포넌트.<네이티브메서드>(…)`)

* 컴포넌트를 **첫 번째 인자**로 받던 레거시 모듈 공통함수 호출을, 해당 컴포넌트를 **수신 객체**로 끌어올린 WebSquare 네이티브 컴포넌트 메서드 호출로 치환합니다.
* **대표 매핑**:
    * 규칙 14a: `$c.{객체명}.showObj({컴포넌트}, true)` → `{컴포넌트}.show("");` — 인자로 `""` 을 추가하여 호출해야 이전 `display` 속성을 유지합니다.
    * 규칙 14b: `$c.{객체명}.showObj({컴포넌트}, false)` → `{컴포넌트}.hide();`
    * 규칙 14c: `$c.{객체명}.getObjectValue({컴포넌트})` → `{컴포넌트}.getValue();`
    * 규칙 14d: `$c.{객체명}.setObjectValue({컴포넌트}, value)` → `{컴포넌트}.setValue(value);`
    * 규칙 14e: `$c.{객체명}.removeRow({컴포넌트}, row)` → `{컴포넌트}.removeRows(row);` — 첫 인자=컴포넌트를 수신 객체로 승격하고, 두 번째 인자(행 위치/인덱스)를 네이티브 `removeRows(…)` 에 그대로 전달(메서드명 단수→복수). *예시:* `$c.cp.removeRow(dts_fileList, i)` → `dts_fileList.removeRows(i)`
* **치환 시 유의사항**:
    * `{객체명}` 네임스페이스는 무엇이든(`$c.stf`, `$c.fil`, `$c.ins`, `$c.mgt` 등) 대상이며, 첫 인자(컴포넌트 식별자/표현식)와 나머지 인자(setObjectValue 의 `value` 등)는 보존합니다.
    * `showObj` 의 두 번째 인자는 **불리언 리터럴(`true`/`false`)** 인 경우에만 자동 치환합니다. 변수 등 동적 값이면 `show`/`hide` 분기를 정적으로 결정할 수 없으므로 보류·리포트합니다.
    * 인자 개수가 매핑과 다르면(`showObj`≠2, `getObjectValue`≠1, `setObjectValue`≠2) 보류·리포트합니다.
    * 중첩 호출(`$c.stf.setObjectValue(comp, $c.stf.getObjectValue(other))`)은 안쪽 인자부터 함께 치환합니다.
    * 문자열/주석/정규식 리터럴 내부는 보호합니다(규칙 5 동일 원칙).

### 규칙 15: `alert_error` → `$c.win.alert`

* `$c.{객체명}.alert_error(...)` 호출을 `$c.win.alert(...)` 로 치환합니다(네임스페이스+함수명 변경, 인자 보존).
* 에러 메시지 문구를 직접 지정하거나 닫기 콜백이 필요한 경우에는 `$c.win.messageBox($p, "alert", "{보낼 메시지}", {callbackFunction})` 형태로 **수동 보강**합니다(자동 치환은 `$c.win.alert` 로만 수행하고 리포트로 안내).
* 문자열/주석/정규식 리터럴 내부는 보호합니다(규칙 5 동일 원칙).

### 규칙 16: Gauce 트랜잭션(trs) `Action`/`KeyValue`/`Parameters`/`Post` → `$c.sbm.executeDynamic`

* 같은 블록 스코프에서 레거시 Gauce 트랜잭션 객체의 아래 묶음을 `$c.sbm.executeDynamic(sbmOptions)` 로 전환합니다(규칙 12 와 동일 계열).

```javascript
{trs}.Action = "{url}" + ...;
{trs}.KeyValue = "JSP(I:pInput=A,I:pFile=B)";
{trs}.Parameters = "K1=" + expr1 + ",K2=" + expr2;   // 선택
{trs}.Post();
```

* **속성 매핑**:
    * **`Action` → `sbmOptions.action`**: URL 문자열에서 쿼리스트링(`?` 이후)을 제외한 순수 경로만 추출(규칙 12 의 `_find_url_literal` 동일).
    * **`KeyValue` → `sbmOptions.ref`**: `JSP(...)` 안의 각 `KEY:name=DATASET` 에서 `=` 우변 데이터셋명만 콤마결합. 예: `"JSP(I:pInput=dts_ContentsInfo,I:pFile=dts_fileList)"` → `"dts_ContentsInfo,dts_fileList"`, `"JSP(I:pInput=dts_ContentsDel)"` → `"dts_ContentsDel"`.
    * **`Parameters` → 주석 JSON**: 쿼리스트링 연결식(`"K1=" + expr1 + ",K2=" + expr2`)을 `// const sbmParams = { K1 : expr1, K2 : expr2 }` 형태의 **주석 처리된 JSON 객체**로 변환해 호출 앞에 첨부(검토용, 미실행). 값이 비면 `""`.
    * **`Post()` → `$c.sbm.executeDynamic(sbmOptions);`**.
* **자동 생성 속성**: `id : "sbm_{trs}"`, `target : "{trs}=body.content"`, `submitDoneHandler : scwin.sbm_{trs}_submitdone`, `isProcessMsg : false` (규칙 12 규약 동일).
    * `target`·`submitDoneHandler` 는 트랜잭션 응답 처리 규약상 **단계 2(Claude) 검토 보강 대상**입니다(기존 `{trs}_OnSuccess`/`{trs}_OnFail` 핸들러 로직 이식). `Parameters` 주석 JSON 은 서버 전달 파라미터를 어떻게 `sbmOptions` 에 반영할지 판단해 보강합니다.
* **유의사항**: Action URL 해석 실패·짝 `Action` 없는 `Post()` 는 미변환·리포트. 문자열/주석/정규식 리터럴 내부는 보호합니다(규칙 5 동일 원칙).

### 규칙 17: `$c.frame.CreateDialogFrame(...)` → `$c.win.openPopup(...)`

* 레거시 Gauce 팝업 호출을 WebSquare gcc 표준 팝업 공통함수로 전환합니다(선행 `await`, 수신자 `$c.frame`/`frame` 포함).

```javascript
[await] $c.frame.CreateDialogFrame({options.id}, {url}, {options.title}, {left}, {top}, {options.width}, {options.height}, {options.type});
```

* **변환 규칙**:
    1. `{options.type}` 값이 `"window"` → `type: "browserPopup"`, 값이 없거나 다른 경우 → `type: "pageFramePopup"`.
    2. `{left}`, `{top}` 인자는 사용하지 않습니다(드롭).
    3. `{options.id}` 는 AS-IS 첫 인자를 무시하고 `{url}` 의 **파일명(확장자 제거)** 을 사용합니다. 예: `/lstmgt/ULDSTF40601.gfm` → `"ULDSTF40601"`.
    4. `"browserPopup"` 이면 `data.callbackFn: "scwin.popupCallback"` + `scwin.popupCallback(result);` 호출 + `scwin.popupCallback` 정의를 파일에 1회 추가합니다.
    5. `CreateDialogFrame` 바로 윗줄이 인자에 `row` 를 넘기는 함수 호출(예: `fn_setId(row);`)이면 삭제합니다.
* **결정적 산출 보조**: `width`/`height` 는 정수 리터럴이면 `"{n}px"`, 표현식·변수면 원형 유지. `title`·`url` 은 원형 유지. `data` 객체는 레거시 호출에 페이로드가 없어 `// TO-DO` 플레이스홀더로 생성(browserPopup 만 `callbackFn` 포함). 같은 블록 다중 호출은 `options`/`data`/`result`, `options2`… 로 명명.
* **유의사항**: 인자 8개가 아니거나 `url` 이 문자열 리터럴이 아니면(동적 결합) 미변환·리포트. `data` 채움·`result` 처리 업무 로직과 표현식 width/height 정리는 **단계 2(Claude) 검토 보강 대상**입니다. 상세·예시는 [createdialogframe_popup_guide.md](createdialogframe_popup_guide.md) 를 참조하세요. 문자열/주석/정규식 리터럴 내부는 보호합니다(규칙 5 동일 원칙).

### 규칙 18: 모듈 네임스페이스의 시스템 날짜·쿠키·웹스토리지 함수 → gcc 공통함수 치환

* 레거시 모듈 네임스페이스로 호출되는 시스템 날짜/쿠키/웹스토리지 공통함수(`$c.{모듈ns}.<fn>(...)`, 예: `$c.mgt.getSysDate()`)를 gcc 표준 공통함수로 치환합니다(네임스페이스 변경, 인자 보존). `{모듈ns}` 는 `$c.mgt`·`$c.fil`·`$c.ins`·`$c.stf` 등 무엇이든 대상입니다(규칙 15 와 동일 계열 — 네임스페이스 교체).
* **대표 매핑**:
    * **시스템 날짜** → `$c.date.*` (네임스페이스 + 함수명 변경)
        * `$c.{ns}.getSysDate(...)` → `$c.date.getServerDateTime(...)` — 인자 없으면 기본 포맷 `yyyyMMdd`. **날짜 함수는 util.xml 이 아니라 `date.xml`(`$c.date`) 소속**이므로 cookie/storage 와 대상 네임스페이스가 다릅니다.
    * **쿠키** → `$c.util.*` (함수명 동일, 네임스페이스만 변경)
        * `$c.{ns}.getCookie(...)` → `$c.util.getCookie(...)`
        * `$c.{ns}.setCookie(...)` → `$c.util.setCookie(...)`
        * `$c.{ns}.removeCookie(...)` → `$c.util.removeCookie(...)`
    * **localStorage** → `$c.util.*` (함수명 동일, 네임스페이스만 변경)
        * `$c.{ns}.setLocalStorage / getLocalStorage / removeLocalStorage / clearLocalStorage(...)` → `$c.util.<동일명>(...)`
    * **sessionStorage** → `$c.util.*` (함수명 동일, 네임스페이스만 변경)
        * `$c.{ns}.setSessionStorage / getSessionStorage / removeSessionStorage / clearSessionStorage(...)` → `$c.util.<동일명>(...)`
* **치환 시 유의사항**:
    * 위 **대표 매핑의 정규 함수명에 한해** 자동 치환합니다. 함수명이 gcc 정규명과 다른 레거시 별칭(예: `sessionSaveKey`·`getSessionKey` 등)은 1:1 대응이 불명확하므로 자동 치환하지 않고 보류·리포트합니다.
    * 인자는 그대로 보존하고 네임스페이스(및 `getSysDate` 의 경우 함수명)만 교체합니다. 시그니처 차이가 의심되면(예: 쿠키 `options`·웹스토리지 직렬화 동작) gcc 함수 시그니처(`src/gcc/util.xml`·`src/gcc/date.xml`)를 확인한 뒤 치환합니다.
    * 같은 파일에 동일 이름으로 **정의된** 함수가 있으면 로컬 정의 우선 원칙에 따라 치환에서 제외합니다(규칙 7·13 동일 원칙).
    * 주석 처리된 W-Craft 흔적과 문자열/주석/정규식 리터럴 내부는 보호합니다(규칙 5 동일 원칙).

### 규칙 19: 원시 JSP/jQuery 레거시 페이지 → WebSquare/gcc 변환 (대체·재설계, 단계 2)

* 일부 화면(예: `inf/srch/ULDINF20000`, `inf/srch/ULDINF91000`, `inf/comm/ULDINF90400`)은 WebSquare 컴포넌트가 아니라 **원시 HTML·JSP·jQuery 로 작성된 레거시 페이지**입니다. 규칙 1~18 의 결정적(Python) 치환 대상이 아니며, **UI 마크업을 WebSquare 컴포넌트로 재구성한 뒤** 스크립트의 DOM/jQuery 호출을 컴포넌트 메서드로 옮기는 **단계 2(Claude) 판단·재설계** 작업입니다.
* **식별 신호**(아래가 보이면 본 규칙 대상): `$("…")`/`$('…')` jQuery 셀렉터, `document.{폼명}.{필드}`·`getElementById`·`getElementsByName` 원시 DOM, `<c:out .../>`·`${…}` JSP/JSTL 표현식, `$.ajax`/`$.post`/`$.parseJSON`, HTML 문자열 빌드(`var x = "<tr>…";`).

* **대표 매핑 (jQuery/DOM → WebSquare 컴포넌트 메서드)** — `#id` 셀렉터의 id 가 재구성된 WebSquare 컴포넌트 id 와 일치한다는 전제. 컴포넌트 참조는 id 직접 사용 또는 `$c.util.getComponent("id")`:
    * `$("#id").val()` → `id.getValue()`
    * `$("#id").val(v)` → `id.setValue(v)`
    * `$("#id").focus()` → `id.setFocus()`
    * `$("#id").show()` / `$("#id").attr("style","display:;")` → `id.show("")` (규칙 14 와 동일 인자 규약)
    * `$("#id").hide()` / `…display:none…` → `id.hide()`
    * `$("#id").css(p, v)` / 표시제어 외 `.attr("style", …)` → `id.setStyle(p, v)`
    * `$("#id").text(v)` / `$("#id").html(v)` → 출력 컴포넌트면 `id.setValue(v)`
    * `$("#id").attr("disabled"|"readonly", …)` → `id.setReadOnly(true/false)` (컴포넌트 속성에 맞춰)
    * `$(sel).each(…)`·DOM 순회 → DataList + `getRowCount()` 기반 반복으로 재작성
* **이벤트 바인딩**(`$(sel).bind/on("click"|"change"|…, fn)`): 스크립트 내 바인딩을 제거하고 컴포넌트의 `ev:on*` 속성으로 이관합니다(규칙 3 계열). 핸들러는 `scwin.{컴포넌트}_{이벤트}` 로 표준화.
* **원시 폼 DOM**:
    * `document.{폼}.{필드}.value` (읽기/쓰기) → `{필드}.getValue()` / `{필드}.setValue(v)`
    * `document.{폼}.submit()` / `$.ajax`·`$.post(…)` → `$c.sbm.executeDynamic(sbmOptions)` 로 재작성(규칙 6/16 계열, **대체**). 콜백·응답 처리 구조 재설계.
    * `$.parseJSON(x)` → `$c.util.getJSON(x)` (또는 `JSON.parse(x)`).
* **팝업**: `window.open(url, …)` → `$c.win.openPopup(url, options, data)` (규칙 17 계열).
* **날짜**: `new Date(…)`·수기 날짜연산(`getFullYear`/`substr` 포맷 등) → `$c.date.*`(`getServerDateTime`/`addDate`/`formatDate` 등 — 규칙 18 의 `date.xml` 소속).
* **JSP/JSTL 서버 표현식**: `<c:out value='${x}'/>`·`${x}` 는 **서버 렌더링 시점에 주입되던 값**입니다. WebSquare 에는 JSP EL 이 없으므로 해당 값은 **submission 응답(DataMap/DataList) 또는 진입 파라미터(`$c.util.getParameter`)로 전달받도록 재설계**합니다. 단순 문자열 치환으로 옮길 수 없습니다.

* **치환 시 유의사항**:
    * **선행조건**: 본 규칙은 HTML `<input>/<select>/<form>` 등이 WebSquare 컴포넌트(`<w2:*>`)로 재구성된 뒤에 적용 가능합니다. 마크업 재구성 없이 스크립트만 바꾸면 참조가 깨지므로 **마크업·스크립트를 함께** 변환합니다.
    * 결정적(Python) 자동 치환 대상이 **아니며 전 항목 단계 2(Claude) 판단**입니다. 규칙 1~18 의 표면 치환(`==`→`===`, `var`→`const/let` 등)은 이미 적용돼 있을 수 있으나 jQuery/DOM 블록은 그대로 남으므로 본 규칙으로 재작성합니다.
    * 셀렉터가 복합(`$('input[name=x]:radio:checked')`)·동적 결합이면 대응 컴포넌트를 일대일로 특정하기 어려우므로, 화면 설계를 확인해 라디오/그룹 컴포넌트의 `getValue()` 등으로 의미 보존 재작성하고 불명확하면 보류·리포트합니다.
    * 문자열/주석/정규식 리터럴 내부는 보호합니다(규칙 5 동일 원칙). HTML UI 텍스트(한글 라벨 등)는 치환 대상이 아닙니다.

### 규칙 20: 그리드 엑셀 다운로드 메서드 → 공통함수 (`{gridView}.advancedExcelDownload(…)` → `$c.data.downloadGridViewExcel({gridView}, …)`)

* 레거시 그리드 엑셀 다운로드 메서드 호출 `{gridView}.advancedExcelDownload(options[, infoArr])` 를 gcc 공통함수 `$c.data.downloadGridViewExcel({gridView}, options[, infoArr])` 로 치환합니다. **규칙 14 와 반대 방향**으로, 수신 객체(그리드 id)를 **첫 인자로 승격**하고 기존 인자는 순서대로 유지합니다.
* **TO-BE 형태**(공통함수 시그니처):
    ```javascript
    const infoArr = [];
    const options = {
       fileName : "downLoadExcel.xlsx" // [default : excel.xlsx] options.fileName 없으면 default 세팅
    };
    $c.data.downloadGridViewExcel({gridView}, options, infoArr);
    ```
* **변환 규약**(결정적, convert.py 규칙 20):
    * `{recv}.advancedExcelDownload(A, B)` → `$c.data.downloadGridViewExcel({recv}, A, B)` (2인자: 기존 `options`/`infoArr` 그대로).
    * `{recv}.advancedExcelDownload({fileName:…, sheetName:…})` → `$c.data.downloadGridViewExcel({recv}, {fileName:…, sheetName:…})` (1인자 인라인 리터럴: 객체 그대로). `infoArr` 인자는 임의로 만들지 않습니다(공통함수가 선택 인자로 처리).
* 수신 객체는 식별자 체인(`grd_x`, `$c.util.getComponent("grd_x")` 등)을 포괄합니다. 인자 안의 중첩 괄호·객체 리터럴은 `_scan_call` 로 정확히 파싱하고, 코드 세그먼트(문자열/주석/정규식 제외)만 치환하며 `await` 등 선행 토큰은 보존합니다. 변환 호출 바로 위의 W-Craft 검수 마커(메서드명 언급)는 함께 제거합니다(규칙 7m/12 동일 원칙).
* 결과 호출에는 `.advancedExcelDownload` 가 없으므로 **재변환 시 no-op(멱등)** 입니다. 매핑표는 [substitution_map.md](substitution_map.md) §10 참조.

#### 규칙 20b: `$c.data.downloadGridViewExcel` 위치인자 → 객체 시그니처 정규화

* 원본 소스에 이미 `$c.data.downloadGridViewExcel(grid, fileName, sheetName, type)` 형태의 **레거시 위치인자(정확히 4인자)** 호출이 존재합니다. 공통함수 시그니처는 `(grdObj, options, infoArr)` 라 문자열을 `options` 자리에 넘기면 **기본옵션으로 무시**(다운로드명 `excel.xls`, type 0)되어 의도가 깨집니다. 이를 객체 시그니처로 정규화합니다(convert.py 규칙 20b).
* **변환 규약**: `$c.data.downloadGridViewExcel(grid, A, B, C)`(4인자) → `$c.data.downloadGridViewExcel(grid, {fileName: A[, sheetName: B][, type: C]})`.
    * 2번째 → `options.fileName`, 4번째 → `options.type`(0/1/2/8 등 원형 보존), 3번째(시트명)는 **비어있으면 생략**(`""`/`''`), 아니면 `options.sheetName`.
    * 인자 토큰은 원형 보존(문자열 리터럴·표현식 `MxCombo.text + "…"`·미따옴표 숫자 `type: 8` 모두 그대로), 뒤 trailing 주석(`//16` 등)도 유지.
* **인자 개수로 형태 판별**: 객체 시그니처(2~3인자) 호출은 4인자가 아니므로 건드리지 않습니다. 규칙 20(advancedExcelDownload 승격)이 만든 2~3인자 결과와도 충돌하지 않으며, 결과는 2인자라 **재변환 시 no-op(멱등)** 입니다.

### 규칙 21: 레거시 프레임 접근 `{recv}.Provider("../")` → `$c.win.getParent()`

* 레거시 Gauce 프레임 접근 `frame.Provider("../")`(부모 1단계 pageFrame scope 반환)를 gcc 공통함수 `$c.win.getParent()` 로 치환합니다. `$c.win.getParent()` 는 `$p.parent()`(부모 pageFrame)를 반환하며 `Provider("../")` 와 동일 의미입니다(수신 객체 `frame` 제거).
* **변환 규약**: `{recv}.Provider("../")` → `$c.win.getParent()`. **정확히 `"../"`/`'../'` 리터럴 인자만** 대상.
    * 반환된 부모 pageFrame 에서 **데이터셋/컴포넌트는 직접 접근**(`$c.win.getParent().dlt_x` / `.dts_List`), **scwin 변수/함수는 `.scwin` 경유**(`$c.win.getParent().scwin.search()`) — JSDoc 규약. 따라서 `parentWin = $c.win.getParent()` 후 데이터셋 접근(`parentWin.dts_List.setCellData(...)`)은 안전하나, scwin 변수/함수 접근(`…js_com_market`/`…fn_x()`)은 `.scwin` 삽입이 필요할 수 있어 **단계 2 검토**입니다.
* **미변환·리포트(대응 공통함수 없음)**: `Provider("/top")`(상위 프레임 — `$c.win` 에 top 헬퍼 없음), `Provider("../../")`(조부모), `Provider("../" + 변수)`(동적 경로), `Provider("../name")`(형제 프레임)는 1:1 공통함수가 없어 미변환하고 `judgment` 로 분리합니다(단계 2: `$p.top()` 등 네이티브 또는 헬퍼 추가 검토).
* 코드 세그먼트(문자열/주석/정규식 제외)만 치환하며, 결과에 `.Provider(` 가 없으므로 **재변환 시 no-op(멱등)** 입니다. 매핑표는 [substitution_map.md](substitution_map.md) §6 참조.

---

## 규칙 6 보충: Submission 변환 상세

기존 가이드의 `gridview : "grd_main"`과 같은 고정 기본값 대신, 아래의 **역추적 매핑 규칙**을 적용합니다.

* **`gridview` 자동 매핑 규칙**:
1. `sbmOptions.target`에 지정된 dataCollection ID를 추출합니다. (예: `dlt_FaqList=body` 또는 `data:json,dlt_FaqList` 형태에서 순수 ID인 `dlt_FaqList`만 추출)
2. `<body>` XML 영역 전체를 스캔하여, `<w2:gridView>` 컴포넌트 중 `dataList` 속성에 해당 ID가 포함되어 있는지 찾습니다.
* *예시 매칭 조건:* `<w2:gridView ... dataList="data:dlt_FaqList" ...>` 또는 `dataList="dlt_FaqList"`


3. 일치하는 `<w2:gridView>` 컴포넌트를 찾으면, 해당 태그의 **`id` 속성 값**을 추출합니다. (예: `id="grd_jongmok"`)
4. 추출한 ID를 `sbmOptions` 객체의 **`gridview` 속성**으로 추가합니다. 만약 매핑된 `gridView`가 없다면 해당 속성은 생략하거나 가이드라인에 따라 처리합니다.



### [치환 적용 전/후 예시]

* **body xml 영역 (스캔 대상)**

```xml
<w2:gridView id="grd_jongmok" dataList="data:dlt_FaqList" ...>
</w2:gridView>

```

* **변경 후 스크립트 코드**

```javascript
const sbmOptions = {
    id : "sbm_SelectAfLoginFaqList",
    action : "/api/discls/support/faq/select-list",
    method : "get",
    ref : "dma_SearchReq",
    target : "dlt_FaqList=body",
    submitDoneHandler : scwin.sbm_SelectFaqList_submitdone,
    gridview : "grd_jongmok", // body xml의 w2:gridView id를 역추적하여 자동 삽입
    isProcessMsg : false
};
$c.sbm.executeDynamic(sbmOptions);

```

---

## Claude Code용 추가 프롬프트 텍스트 (영문 가이드 추가본)

기존 Claude Code 프롬프트의 **9번 항목**을 아래와 같이 구체화하여 실행하시면 Claude가 XML과 스크립트를 더 정확하게 교차 분석합니다. 기존 프롬프트에 이 내용을 덮어쓰거나 추가해 주세요.

```text
9. Advanced Submission Mapping:
   - When generating 'sbmOptions' from <xf:submission>, extract the pure DataList ID from the 'target' attribute (e.g., extract 'dlt_FaqList' from 'dlt_FaqList=body' or 'data:json,dlt_FaqList').
   - Scan the <body> XML area to find a <w2:gridView> component whose 'dataList' attribute matches this extracted DataList ID (e.g., dataList="data:dlt_FaqList").
   - If a matching <w2:gridView> is found, extract its 'id' attribute (e.g., id="grd_jongmok") and dynamically add it to 'sbmOptions' as the 'gridview' property (e.g., gridview : "grd_jongmok").
   - Finally, replace '$c.sbm.execute' with '$c.sbm.executeDynamic(sbmOptions);' and completely remove the corresponding <xf:submission> XML element nodes from the <head>.

```
