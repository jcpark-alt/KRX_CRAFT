# WebSquare URL/DataID 패턴 기반 동적 Submission 변환 지침

> 이 문서는 [websquare_conversion_guide.md](websquare_conversion_guide.md) 에서 분리된 독립 지침입니다. 통신 치환(규칙 6)·`sbmOptions` 명명 규칙은 [conversion_rules.md](conversion_rules.md) 의 규칙 6 보충과 함께 참조하세요.
>
> **범위 안내**: 본 문서는 **규칙 12(동적 Submission)** 만 다룹니다. 컴포넌트 속성 대입 → setter API 치환(규칙 5b `.value`→`setValue`, 규칙 5c `.src`→`setBackgroundImage`)은 본 패턴과 무관하게 `convert.py` 가 독립적으로 처리하며, 변환 대상 스코프에 그런 대입(예: 아래 샘플의 `txb_jongmokName.setValue("")` 인접 코드)이 있으면 함께 적용됩니다. 상세는 [conversion_rules.md](conversion_rules.md) §규칙 5 · [substitution_map.md](substitution_map.md) §10 을 참조하세요.

본 문서는 `{dataCollection}.DataID = encode({url})` 및 `{dataCollection}.reset();` 패턴의 레거시 코드를 발굴하여, 신규 GCC 표준인 `$c.sbm.executeDynamic` 공통함수 체계로 안전하게 전환하기 위한 상세 변환 규칙 및 샘플 코드 결과물입니다.

---

## 1. 세부 변환 규칙 (Rules)

### 규칙 1: 대상 코드 판별 및 범위

* 동일한 함수(Scope) 내부에서 `{dataCollection}.DataID = encodeURI({url})` (또는 주석 처리된 형태)과 `{dataCollection}.reset();` 코드가 한 쌍으로 존재하는지 스캔합니다.
* 해당 조건이 만족되면 기존 관련 코드 및 W-Craft 변환 확인 주석을 **전부 삭제**하고 `$c.sbm.executeDynamic` 구조로 전환합니다.

### 규칙 2: URL 및 GET 파라미터 분리 (Action / Ref JSON 구조화)

* **`action` 속성**: URL 문자열에서 쿼리스트링(`?` 이후 파라미터)을 제외한 **순수 순방향 URI 경로**만 추출하여 매핑합니다.
* **GET 파라미터 처리 (`ref`)**:
* 본래 가이드의 기본 스타일 구조를 따르되, URL 뒤에 붙은 Key-Value 파라미터(예: `method`, `CD_ID`, `LIST_STAT_CD` 등)들은 내부적으로 데이터객체(DataMap 등)에 담겨 전달되어야 하므로 `ref` 속성은 요구사항에 따라 명시적으로 `""` 문자열로 지정하거나 필요시 규격화합니다. (※ 지침 요구사항에 의거하여 **`ref : ""`** 로 고정 세팅합니다.)



### 규칙 3: sbmOptions 객체 자동 생성 명명 규칙 및 async/await 순차 실행

* **`id`**: `"sbm_{dataCollection}"` 형태로 지정합니다. (예: `dts_jongmok` $\rightarrow$ `sbm_dts_jongmok`)
* **`ref`**: `""` (빈 문자열 고정)
* **`target`**: `"{dataCollection}=body.content"` 형태로 지정합니다. (예: `dts_jongmok=body.content`)
* **`isProcessMsg`**: 기본값 `false`로 지정합니다.
* **호출 형태 — async/await 순차 실행 우선**([code-convention.md](../../docs/code-convention/code-convention.md)):
  `submitDoneHandler` 옵션은 **넣지 않고**(핸들러를 넘기면 `executeDynamic` 의 Promise 가 settle 되지 않음)
  `const sbmRtn = await $c.sbm.executeDynamic(sbmOptions);` 로 호출합니다.
  - 파일에 `scwin.sbm_{dataCollection}_submitdone` 함수가 **정의되어 있으면** await 뒤에 `scwin.sbm_{dataCollection}_submitdone(sbmRtn);` 직접 호출로 순차 실행을 보존합니다.
  - 정의가 없으면 `// TODO Stage2: sbmRtn 응답 처리 로직 작성` 주석을 남깁니다(단계 2 보강).
  - await 이 삽입된 함수에는 `async` 키워드가 자동 부여되며, 호출부 await 전파는 단계 2 검토 항목입니다.
  - 결과 변수는 옵션 변수와 짝으로 명명합니다(`sbmOptions`→`sbmRtn`, `sbmOptions2`→`sbmRtn2`, …).

### 규칙 4: 주석 처리된 레거시 코드 처리

* 샘플 3번과 같이 코드 자체가 이미 `////` 등으로 주석 처리되어 있더라도 변환 규칙 대상에 해당한다면, 레거시 주석을 방치하지 않고 **신규 공통함수 코드로 완전히 변환 및 교체**하고 기존 주석은 제거합니다.

---

## 2. 샘플 코드 변환 결과 (Before & After)

### 📌 샘플 1 변환

* **기존 코드**:

```javascript
//----W-Craft WebSquare 변환 확인: NameValue----//
const url = "/submitperson.do?method=searchSubmitPerson&inputMessageId=submitperson&outputMessageId=submitperson&DISCLS_SUBMITPRN_TP_CD=" + MxDataSet_code1.NameValue(combo_market.Index + 1, "CD_VAL");
//alert(url); 
txb_jongmokName.setValue("");
dts_jongmok.DataID = encodeURI(url);

//----W-Craft WebSquare 변환 확인: reset----//
dts_jongmok.reset();

```

* **기대 출력 (변환 후)**:

```javascript
txb_jongmokName.setValue("");

const sbmOptions = {
    id : "sbm_dts_jongmok",
    action : "/submitperson.do",
    ref : "",
    target : "dts_jongmok=body.content",
    isProcessMsg : false
};

const sbmRtn = await $c.sbm.executeDynamic(sbmOptions);
scwin.sbm_dts_jongmok_submitdone(sbmRtn); // 파일에 핸들러 정의가 있는 경우 — 없으면 TODO Stage2 주석

```

---

### 📌 샘플 2 변환

* **기존 코드**:

```javascript
const url1 = "/tbmccdval.do?method=searchTbmcCdval&inputMessageId=tbmccdval&outputMessageId=tbmccdval&CD_ID=00967";
MxDataSet_code1.DataID = encodeURI(url1);

//----W-Craft WebSquare 변환 확인: reset----//
MxDataSet_code1.reset();

```

* **기대 출력 (변환 후)**:

```javascript
const sbmOptions = {
    id : "sbm_MxDataSet_code1",
    action : "/tbmccdval.do",
    ref : "",
    target : "MxDataSet_code1=body.content",
    isProcessMsg : false
};

const sbmRtn = await $c.sbm.executeDynamic(sbmOptions);
// TODO Stage2: sbmRtn 응답 처리 로직 작성 (구 submitDoneHandler 자리)

```

---

### 📌 샘플 3 변환 (주석 처리된 코드 포함 패턴)

* **기존 코드**:

```javascript
const url = "/ui/dsclsrch/data/isurCode.jsp?method=searchIsurCd&inputMessageId=isurcd&outputMessageId=isurcd" + "&LIST_STAT_CD=" + scwin.stat + "&SPOT_ISU_TRD_MKT_TP_CD=" + scwin.tpcd + "&SCREN_ID=" + scwin.vScrenID + "&SCREN_PROCES_TP_CD=" + $c.stf.info("SCREN_PROCS_TP_CD_01");
////dts_jongmok.DataID = encodeURI(url);

//----W-Craft WebSquare 변환 확인: reset----//
////dts_jongmok.reset();

```

* **기대 출력 (변환 후)**:

```javascript
const sbmOptions = {
    id : "sbm_dts_jongmok",
    action : "/ui/dsclsrch/data/isurCode.jsp",
    ref : "",
    target : "dts_jongmok=body.content",
    isProcessMsg : false
};

const sbmRtn = await $c.sbm.executeDynamic(sbmOptions);
// TODO Stage2: sbmRtn 응답 처리 로직 작성 (구 submitDoneHandler 자리)

```

---

## 🤖 Claude Code용 추가 자동화 프롬프트 지침 (Prompt Add-on)

Claude Code가 해당 소스 코드 블록을 탐색할 때 인식할 수 있도록 정형화한 영문 Rule셋 프롬프트입니다.

```text
10. Dynamic Submission Conversion for DataID & Reset Pattern:
    - Scan for the pattern where `{dataCollection}.DataID = encodeURI({url})` (or its commented-out variants like `////{dataCollection}.DataID`) and `{dataCollection}.reset()` coexist within the same function scope.
    - Extract the core `action` path from the URL string by stripping out all GET parameters after the '?' character.
    - Generate a new `const sbmRtn = await $c.sbm.executeDynamic(sbmOptions);` code block (sequential async/await style) using the following properties:
      * id: "sbm_{dataCollection}"
      * action: Extract pure URI path (e.g., "/submitperson.do")
      * ref: "" (Strictly empty string as requested)
      * target: "{dataCollection}=body.content"
      * isProcessMsg: false
      * Do NOT set submitDoneHandler (passing it prevents the executeDynamic Promise from settling).
    - After the await line: if `scwin.sbm_{dataCollection}_submitdone` is defined in the file, call it directly with `sbmRtn`; otherwise leave a `// TODO Stage2:` comment for response handling.
    - Mark the enclosing function `async` (the pipeline does this automatically) and report callers that may need `await` propagation for Stage 2 review.
    - Completely purge the old legacy URL assignment statements, `.reset()` calls, and any associated "W-Craft WebSquare" verification comments.

```
