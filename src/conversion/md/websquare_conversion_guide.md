# WebSquare XML Conversion Specification & Claude Code Execution Guide

WebSquare XML 소스를 GCC 공통함수 체계·표준 JS 규칙으로 자동 변환하기 위한 Claude Code 실행 지침서이자 규칙 정의서입니다.

---

## 1. 개요 및 변환 목표
* **목적**: 기존 구조의 WebSquare XML 파일을 분석하여 신규 GCC 공통 표준(컴포넌트 제어, 동적 Submission, 엄격한 타입 비교 등)으로 일괄 자동 변환.
* **변환 대상**: XML 파일 내의 `<script>` 영역(JavaScript) 및 `<body>` 영역(UI XML 컴포넌트 마크업).
* **컨텍스트 가이드 파일** (repo 루트 기준):
    * `src/docs/sbm-generator/README.md` · `sbm-generator.html` (Submission 치환 가이드/참고)
    * `src/docs/api/{fil,ins,mgt}/index_transfer.html` (**레거시 → gcc 치환 목록**, 모듈별 `DATA` 배열이 단일 출처)
    * `src/docs/api/gcc/index.html` (`$c.*` API 레퍼런스 — 치환 함수 시그니처 확인)

---

## 2. 세부 변환 규칙 (Rules)

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

### 규칙 6: Submission의 동적 함수($c.sbm.executeDynamic) 치환 및 XML 제거
* `<head>` 내의 `<xf:submission>` 태그 속성을 파싱하여 `sbmOptions` 객체를 생성합니다.
* 스크립트의 `$c.sbm.execute(sbm_commonCode);` 코드를 `$c.sbm.executeDynamic(sbmOptions);` 형태로 치환하고, 기존 `<xf:submission>` XML 노드는 완전히 삭제 처리합니다.

### 규칙 7: 레거시 공통함수 → gcc 공통함수($c.*) 치환
* 기존 스크립트가 호출하는 레거시 공통/유틸 함수(예: `fn_Trim`, `cGetToday`, `Add_MoneyComma`, `email_chk`)를 신규 gcc 공통함수(`$c.<ns>.<fn>`)로 치환합니다.
* **단일 출처(SOT)**: 원본 함수 → 대상 함수 매핑의 기준은 모듈별 이관 매핑 가이드인 `src/docs/api/{fil,ins,mgt}/index_transfer.html` 의 `DATA` 배열입니다. 변환 대상 파일이 속한 모듈의 매핑을 우선 적용하고, 대표 매핑은 아래 **§3 치환 매핑표**에 정리되어 있습니다.
* **태그(tag) 의미**:
    * *(태그 없음)*: 1:1 직접 치환 가능.
    * **검토**: 시그니처·기본값·동작에 차이가 있을 수 있으므로 인자/반환값을 확인한 뒤 치환.
    * **대체**: 단순 함수 치환이 아니라 통신·구조 자체를 gcc 방식으로 재작성(주로 원시 XHR → `$c.sbm.*`, jQuery 풍 `$()` → `$c.util.getComponent`).
* **치환 시 유의사항**:
    * 인자 순서·개수가 레거시와 다를 수 있으므로, 치환 전 gcc 함수 시그니처(`src/docs/api/gcc/index.html`)를 반드시 확인합니다.
    * 동일 AS-IS 함수가 여러 모듈/파일에 **사본**(`common.xml`, `function.xml`, `utils.xml` 등)으로 중복 존재할 수 있습니다. 사본 정의를 직접 고치지 말고, 호출부를 gcc 공통함수 호출로 바꿉니다.
    * 치환 후 더 이상 참조되지 않는 레거시 공통함수 **정의**는 제거 검토 대상입니다. 단, 같은 파일 내 다른 함수가 여전히 참조하면 유지합니다.
    * 비교 연산자 엄격화(규칙 5)와 함께, 치환 결과가 `null`/빈값을 반환할 수 있는 경우 `$c.util.isEmpty()` 로 방어 코드를 보강합니다.

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

---

## 3. 레거시 → gcc 공통함수 치환 매핑표 (Substitution Map)

`src/docs/api/{fil,ins,mgt}/index_transfer.html` 의 `DATA` 배열을 namespace 기준으로 통합한 대표 매핑입니다. (AS-IS = 레거시 함수 / TO-BE = gcc 표준 `$c.*`) 동일 의미의 사본 함수는 슬래시(`/`)로 묶었습니다.

> **프로그램 접근**: 이 표는 사람이 읽는 요약이고, 변환기는 `src/conversion/tools/gcc_mapping.py` 로더로 위 `DATA`(SOT)를 직접 파싱해 사용합니다. `substitution_dict()` 는 **태그 없는 순수 식별자·무충돌** 항목만 담은 자동 1:1 치환 사전(규칙 7)을, `conflicts()` 는 동일 이름이 다른 `$c.*` 로 갈리는 충돌 항목을 돌려줍니다. (`python src/conversion/tools/gcc_mapping.py` 로 요약 확인)

### 3.1 `$c.str` — 문자열

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.str.trim` | `trim` / `Trim` / `LTrim` / `RTrim` / `MTrim` / `fn_Trim` | 앞뒤(양끝) 공백 제거 | |
| `$c.str.lpad` | `lpad` / `cGetZero` / `fnLeg` / `fnLPAD` / `fillZero` / `addZero` / `setDateMmDd` / `fn_AddZero` | 좌측(0) 패딩 | |
| `$c.str.replaceAll` | `replaceAll` / `cRmString` / `removeChar` / `fn_IgnoreSpaces` / `fn_delString` / `fn_DelChar2~5` / `fn_DelPoint` / `Del_Hypen*` / `Del_Point*` / `replacePercent` / `fn_condUrl` | 문자/공백 치환·제거 | |
| `$c.str.isEmail` | `email_chk` / `CheckEmail` / `fn_CheckEmail` / `IsValidEmail` / `fn_emailFrontCheck` / `fn_emailBackCheck` | 이메일 형식 검증 | |
| `$c.str.getByteLength` | `strLength` / `GetByte` / `getStringSize` / `fn_GetByte` / `fn_CheckByte` / `fn_getCheckByte` / `fn_getAsciiLength` / `fn_StrCharByte` / `fn_ChkStrLenb` / `byteCheck` / `cutMsg` / `fn_IsExceedMaxLen` | 바이트 길이 계산/초과 검사 | |
| `$c.str.isSSN` | `cIsJumin` / `isSocialNO` / `fn_JuminCheck` / `cIsResno`(mgt) | 주민/외국인 등록번호 검증 | |
| `$c.str.isBizID` | `cIsResno`(ins) / `cIsBupin` | 사업자/법인 등록번호 검증 | 검토 |
| `$c.str.isPhone` | `IsTel` / `IsPhone` / `fn_checkPhoneNumber` | 전화번호 형식 검증 | |
| `$c.str.isKorean` | `isHangul` | 한글 여부 | |
| `$c.str.existKorean` | `fn_DelChar4` | 한글 입력 포함/차단 | |

### 3.2 `$c.num` — 숫자

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.num.formatNumber` | `fn_NumberFormat` / `fn_ValueSetComma` / `fn_insertComma` / `moneyType` / `numOnMask*` / `setNumberTypeWithComma*` / `Add_MoneyComma` / `Add_CommaMax` / `FormatNumberEx` / `addComma` / `number_format` | 천단위 콤마(정수) 포맷 | |
| `$c.num.formatMoney` | `getMoneyType` / `getSignMoneyType` / `Add_Comma` / `Add_MoneyComma_Value` | 금액 콤마 포맷(소수/부호) | |
| `$c.num.unFormatNumber` | `fn_removeComma` / `fn_DelComma` / `getOnlyNum` / `getOnlyNumber*` / `Del_MoneyComma*` / `rtnNumber` | 콤마/부호 제거 | |
| `$c.num.isNumber` | `fn_checkNum*` / `isNum` / `fn_IsNumber*` / `Chk_Percent` / `Chk_Digit*` / `non_zero` / `isDigit` / `isNumber` | 숫자/소수 여부 검증 | |
| `$c.num.numberToKor` | `num2won` / `num2won_zero` / `fn_int2han` / `fn_ChgAmtToHan` | 숫자 → 한글 금액 | |
| `$c.num.parseFloat` | `toNum` | 숫자 변환(기본값) | 검토 |

### 3.3 `$c.date` — 날짜

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.date.formatDate` | `cGetToday` / `cGetToday2` / `getCurrentDate` / `FormatDateEx` / `todate` / `todate_slash` / `dateToyyyyMMdd` / `fn_dte2str` | 오늘/Date → 포맷 문자열 | |
| `$c.date.addDate` | `cGetPlusDate*` / `cGetMinusDate*` / `calcDate` / `fn_setDate*` / `dateAddDel` / `fn_incDte` | 일(日) 가감산 | |
| `$c.date.addMonth` | `cGetPlusMonth` / `cGetMinusMonth` / `calcMonth` / `addMonth` / `addMonth2` / `fn_incMth` | 월(月) 가감산 | |
| `$c.date.addYear` | `cGetPlusYear` / `cGetMinusYear` / `calcYear` | 년(年) 가감산 | |
| `$c.date.diffDate` | `cGetDifTodayInputday` / `getDayInterval` / `getDuration` / `fn_getPeriod` | 두 날짜 차이(일수/기간) | |
| `$c.date.dateCompare` | `validateStartDateAndToDate` / `compareFromToDate*` / `fn_checkDay` / `fn_CheckDateObj` | From/To 일자 비교 | |
| `$c.date.dateFormat` | `cal_value2` / `fn_convCalDate` / `chkDate` / `chkDate2` | 8자리 → `YYYY-MM-DD` 마스킹 | |
| `$c.date.dateUnFormat` | `fn_str2dte` / `cal_offMask*` | 마스킹 제거 / 문자열 → Date | |
| `$c.date.isDate` | `isDate` / `isDate0` | 날짜 유효성/빈 날짜 판별 | |
| `$c.date.isLeafYear` | `cIsLeafYear` | 윤년 검사 | |
| `$c.date.getLastDateOfMonth` | `cGetMaxDay` / `lastDay` | 해당 월 마지막 일수 | |

### 3.4 `$c.validate` — 검증

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.validate.isValidDate` | `fn_checkDate` / `fn_CheckDate` / `fn_CheckDateGn` / `Chk_Date*` / `chkDate2` / `fn_IsValidDateComm` | 일자 유효성 | |
| `$c.validate.setComponentProperty` | `showObj` | 컴포넌트 표시/숨김(속성 제어) | 검토 |

### 3.5 `$c.util` — 유틸/컴포넌트

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.util.isEmpty` | `fn_IsNull` / `fn_NullChk` / `cIsNull` / `isEmpty` | Null/빈값 체크 | |
| `$c.util.isNotEmpty` | `fn_IsNotNull` | Not Null 체크 | |
| `$c.util.getCookie` | `getCookie` | 쿠키 조회 | |
| `$c.util.getParameter` | `getQuery` | URL 파라미터 추출 | |
| `$c.util.getComponent` | `getObjectValue` / `setObjectValue` / `$`(jQuery 풍) | 컴포넌트 조회/값 제어 | 검토·대체 |
| `$c.util.isArray` | `isInArr` | 배열 포함 여부 | 검토 |

### 3.6 `$c.win` — 화면/팝업/네비게이션

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.win.openPopup` | `fn_PopManual` / `pop` / `historyChgName` / `openNews` / `openDisclosureView` | 팝업/업무 윈도우 오픈 | |
| `$c.win.confirm` | `fn_alertDelConfirm` | 삭제 확인 confirm | |
| `$c.win.moveUrl` | `goURL` | URL 이동 | |
| `$c.win.getProgramId` | `InfoMenuID` | 현재 메뉴/프로그램 ID | |
| `$c.win.alert` (+ `$c.data.getMessage`) | `alert_error` | 에러 객체 메시지 alert | |

### 3.7 `$c.sbm` — 서버 통신 (원시 XHR 대체)

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.sbm.execute` | `requestXMLHTTP` / `requestAsyncXMLHTTP` | XHR 요청 → 표준 submit | 대체 |
| `$c.sbm.executeDynamic` | `sendMessage` | 비동기 메시지 전송 → 동적 submit | 대체 |
| `$c.sbm.*` | `getXMLHttpRequest` / `responseTextXMLHTTP` | XHR 객체/응답 처리 → 통신모듈로 흡수 | 대체 |

> 통신 치환은 규칙 6 및 `sbm-generator.html` 를 함께 참고하여 `sbmOptions` 기반으로 재작성합니다.

### 3.8 `$c.data` · `$c.session` · `$c.print` — 데이터/세션/출력

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.data.serializeFormToQueryString` | `formData2QueryString` / `fn_ExtractParam` | 폼 → 쿼리스트링 | |
| `$c.data.getMessage` | `getMessageParam` | 메시지 파라미터 치환 조회 | |
| `$c.data.getMatchedJSON` | `fn_findRow` | 데이터셋 행 검색 | |
| `$c.session.sessionCheck` | `sessionCheck` / `startTimer` / `req4sessionExtn` / `restartTimer` / `initTime` | 세션 점검·연장 | |
| `$c.print.*` | `fn_print` | 문서 인쇄 | 검토 |

> 위 표는 대표 매핑 요약입니다. 모듈별 전체 목록과 원본 파일 단위 분류는 각 `index_transfer.html`(브라우저로 열어 검색 가능)을 SOT로 참조하세요.

---

## 4. 하이브리드 변환 파이프라인 (Python 기계 치환 → Claude Code 보강)

규칙 1~7 중 **판단이 필요 없는 단순 치환·코드 재배치**는 Python 으로 일괄(기계어) 처리하고, **판단·재설계가 필요한 부분만** Claude Code 로 보강하는 2단계 워크플로우입니다. 대량 파일을 빠르고 일관되게, 그리고 비용 효율적으로 변환하는 것이 목적입니다.

> 기준 파일 예시: `src/conversion/next-krx-lds-fil-front/ui/ULDCOM00007.xml` — `head(3~430) → script CDATA(22~429) → body(431~568)` 구조.

### 4.1 전제 — 파일을 3개 영역으로 분리

WebSquare XML 은 `head(xml) → script(JavaScript, CDATA) → body(xml)` 구조이고, 영역마다 변환 성격이 달라 **영역을 먼저 분리한 뒤 영역별 변환기**를 적용합니다.

| 영역 | 범위 | 내용 | 주요 변환 |
| --- | --- | --- | --- |
| **HEAD** (xml) | `<head>` ~ `</head>` 중 `<script>` 제외 | `meta_*`, `<w2:dataCollection>`, `<xf:submission>` | 규칙 6(submission 파싱·삭제), 메타 보존 |
| **SCRIPT** (js) | `<script ...><![CDATA[` ~ `]]></script>` 내부 | 전역변수·이벤트함수·일반함수 JavaScript | 규칙 1·2·4·5·7 의 대부분 |
| **BODY** (xml) | `<body>` ~ `</body>` | UI 컴포넌트 마크업 + `ev:on*` 핸들러 속성 | 규칙 3(핸들러명 동기화) |

* 경계 추출은 정규식/문자열 인덱스로 결정적으로 가능합니다: `<script ...><![CDATA[` 와 `]]></script>` 사이가 SCRIPT, 그 바깥의 `<head>`/`<body>`.
* **영역 인식이 핵심**입니다. SCRIPT 변환기는 CDATA 내부만, BODY 변환기는 `ev:on*` 속성만 건드립니다. body 의 `<xf:label><![CDATA[가]]></xf:label>` 같은 **한글 UI 텍스트는 절대 치환 대상이 아닙니다.**

### 4.2 단계 1 — Python 기계 치환 (결정적 변환)

"입력이 같으면 출력이 항상 같은" **결정적(deterministic)** 변환만 Python 으로 일괄 처리합니다. 판단이 필요 없는 1:1 규칙이 대상입니다.

> **참조 구현**: `src/conversion/tools/convert.py` — 영역 분리 + 규칙 1~8 결정적 치환(문자열/주석/정규식 보호)과 단계 2 리포트 출력. 규칙 7 은 `gcc_mapping.substitution_dict()` 를 단일 출처로 쓰고, 검토/대체 태그·충돌 함수는 자동 치환하지 않고 리포트로 분리합니다. 마지막에 포매팅을 적용합니다: **`//----W-Craft` 마커 주석을 맨앞(컬럼 0)으로 정렬**, **함수 단위 빈 줄 1개 삽입**, **함수 주석 맨앞(컬럼 0) 정렬**. 일괄 실행은 `src/conversion/tools/convert_all.py`.
> 실행: `python src/conversion/tools/convert.py <src.xml> [out.xml]`

| 규칙 | 처리 영역 | Python 처리 방식 | 비고 |
| --- | --- | --- | --- |
| 규칙 1 파일명 변수 | SCRIPT | 파일명 추출 → `scwin.vScrenID = "{파일명}";` 최상단 삽입(없을 때만) | 멱등 |
| 규칙 2 전역변수 이동 | SCRIPT | 최상위 `scwin.X = <리터럴>;` 만 `// 전역 변수 선언` 구역으로 이동 | 호출/참조 RHS(예: `$c.x.f()`)는 실행순서 영향으로 이동 보류·리포트 |
| 규칙 4 영역 재배치 | SCRIPT | 함수 정의를 init/event/일반 3구역으로 분류·정렬(경계 주석+doc 주석 동반). `gform_onload`→`onpageload` 병합은 안전조건에서만 | 함수 사이/뒤 최상위 실행문 있으면 보류·리포트 |
| 규칙 5 문법/API | SCRIPT | `==`/`!=` → `===`/`!==`, `X.value = v` → `X.setValue(v)` | 문자열·정규식·주석 리터럴 보호 |
| 규칙 6 Submission | HEAD+SCRIPT | 정적 action + 단순 `execute(id)` 만, 호출 앞에 `const sbmOptions = {...}` 선언 후 `executeDynamic(sbmOptions)` 로 변환 + 노드 삭제. target ID 역추적으로 body `<w2:gridView>` id 를 `gridview` 자동 삽입 | 동적 action/속성변형은 sbmOptions 스텁과 함께 리포트(`sbm-generator` 로직 이식) |
| 규칙 7 (1:1) | SCRIPT | **태그 없는** 매핑만 함수명 단어경계 치환 (`fn_Trim(` → `$c.str.trim(`) | `gcc_mapping.substitution_dict()` 사용(태그없음·무충돌) |
| 규칙 3 (동기화) | SCRIPT+BODY | 이벤트명 소문자화 + `ev:on*` 속성 ↔ 스크립트 함수명 **동시** 수정 | 이름변경 사전(dict) 공유 |
| 규칙 8 `var`→`const`/`let` | SCRIPT | 재할당 분석: 단일 할당 → `const`, 재할당·카운터 → `let` | 호이스팅·재선언 의존 시 Claude 검토 |

**기계 치환 원칙**
* **단어경계 매칭**: 함수명 치환은 `\b함수명\s*\(` 처럼 호출부만 매칭하여 부분 문자열 오치환을 막습니다. `replaceAll`·`trim` 등 흔한 이름은 특히 주의(원시 String 메서드와 충돌 가능).
* **멱등성(idempotent)**: 변환본을 다시 돌려도 결과가 동일해야 합니다 — 예: `scwin.vScrenID` 중복 삽입 금지.
    * 단, **이미 `$c.*` 로 바뀐 호출이라도 §3 매핑표의 TO-BE(gcc) 항목에 해당하는 함수라면 치환(정규화) 대상에 포함**합니다. 즉, "`$c.*` 이면 무조건 건너뛴다"가 아니라 **TO-BE 목록 기준으로 판정**합니다.
    * 이 경우에도 이미 올바른 TO-BE 형태면 동일한 결과로 수렴하므로(재치환 = 같은 함수로의 no-op) 멱등성은 유지됩니다. 비표준/구버전 `$c.*` 호출이 TO-BE 항목에 매핑되어 있다면 표준 형태로 정규화됩니다.
* **리터럴 보호**: `==`→`===` 같은 치환은 문자열/정규식/주석 내부를 건드리지 않도록 토큰 단위로 처리합니다.
* **산출물**: ① 변환본 XML, ② 변환 전/후 diff, ③ **자동 치환하지 못한 항목 리포트**(검토/대체 태그, 시그니처 불일치 의심, 매핑표 미존재 함수)를 남겨 단계 2 의 입력으로 사용합니다.

### 4.3 단계 2 — Claude Code 보강 (판단 필요 변환)

Python 이 남긴 **"추가 작업 목록"만** Claude Code 로 처리합니다. 기계가 판단하기 어려운 부분이 대상입니다.

* **검토 태그 매핑**: 시그니처·기본값·반환형이 다른 함수(`toNum`→`$c.num.parseFloat`, `showObj`→`$c.validate.setComponentProperty`, `cIsBupin`→`$c.str.isBizID` 등) — 인자 순서/개수를 확인해 조정.
* **대체 태그 매핑**: 원시 XHR/`sendMessage` → `$c.sbm.execute`/`executeDynamic` 재작성, jQuery 풍 `$()` → `$c.util.getComponent`. 콜백·응답 처리 구조 재설계.
* **인자 형태 변환**: 의미는 같아도 레거시와 gcc 함수의 인자 형태가 다른 경우(날짜 가감 방향, 포맷 문자열 규칙, 반환 타입 등).
* **모호·충돌**: 같은 이름이 파일마다 다른 의미이거나, §3 매핑표에 없는 커스텀 로직.
* **검증**: 의미 보존 확인, 잔존 레거시 호출/미사용 정의 정리, `npm run lint:xml`(`wsxml_lint`) 통과 확인.

### 4.4 권장 실행 순서

1. **(Python)** 대상 파일을 HEAD/SCRIPT/BODY 3영역으로 분리한다.
2. **(Python)** §4.2 결정적 규칙을 일괄 적용 → 변환본 + 리포트(미처리·검토 항목)를 생성한다.
3. **(Claude)** 리포트의 *검토·대체* 항목을 §3 매핑표와 `gcc/index.html` 시그니처를 기준으로 보강한다.
4. **(Claude)** 잔존 레거시 호출을 grep 으로 점검하고, 의미를 검증한 뒤 `npm run lint:xml` 로 마무리한다.

> 역할 분담 요약: **Python = 양·일관성·속도**(결정적 1:1 치환·재배치), **Claude Code = 판단·재설계·검증**(검토/대체 매핑, 통신 재작성, 최종 확인).

---

## 📄 가이드라인 추가/수정 내용

### 1. 규칙 6 (Submission 변환 매핑) 상세 업데이트

기존 가이드의 `gridview : "grd_main"`과 같은 고정 기본값 대신, 아래의 **역추적 매핑 규칙**을 적용합니다.

* **`gridview` 자동 매핑 규칙**:
1. `sbmOptions.target`에 지정된 dataCollection ID를 추출합니다. (예: `dlt_FaqList=body` 또는 `data:json,dlt_FaqList` 형태에서 순수 ID인 `dlt_FaqList`만 추출)
2. `<body>` XML 영역 전체를 스캔하여, `<w2:gridView>` 컴포넌트 중 `dataList` 속성에 해당 ID가 포함되어 있는지 찾습니다.
* *예시 매칭 조건:* `<w2:gridView ... dataList="data:dlt_FaqList" ...>` 또는 `dataList="dlt_FaqList"`


3. 일치하는 `<w2:gridView>` 컴포넌트를 찾으면, 해당 태그의 **`id` 속성 값**을 추출합니다. (예: `id="grd_jongmok"`)
4. 추출한 ID를 `sbmOptions` 객체의 **`gridview` 속성**으로 추가합니다. 만약 매핑된 `gridView`가 없다면 해당 속성은 생략하거나 가이드라인에 따라 처리합니다.



#### [치환 적용 전/후 예시]

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

## 🤖 Claude Code용 추가 프롬프트 텍스트 (영문 가이드 추가본)

기존 Claude Code 프롬프트의 **9번 항목**을 아래와 같이 구체화하여 실행하시면 Claude가 XML과 스크립트를 더 정확하게 교차 분석합니다. 기존 프롬프트에 이 내용을 덮어쓰거나 추가해 주세요.

```text
9. Advanced Submission Mapping:
   - When generating 'sbmOptions' from <xf:submission>, extract the pure DataList ID from the 'target' attribute (e.g., extract 'dlt_FaqList' from 'dlt_FaqList=body' or 'data:json,dlt_FaqList').
   - Scan the <body> XML area to find a <w2:gridView> component whose 'dataList' attribute matches this extracted DataList ID (e.g., dataList="data:dlt_FaqList").
   - If a matching <w2:gridView> is found, extract its 'id' attribute (e.g., id="grd_jongmok") and dynamically add it to 'sbmOptions' as the 'gridview' property (e.g., gridview : "grd_jongmok").
   - Finally, replace '$c.sbm.execute' with '$c.sbm.executeDynamic(sbmOptions);' and completely remove the corresponding <xf:submission> XML element nodes from the <head>.

```

---
