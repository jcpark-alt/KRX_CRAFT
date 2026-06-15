# WebSquare Submission → executeDynamic Generator

WebSquare IDE 에서 작성된 `<xf:submission>` XML 을 붙여넣으면, `$c.sbm.executeDynamic` 호출 스크립트를 자동으로 생성해주는 단일 HTML 페이지(Generator)입니다.

- **파일**: `sbm-generator.html` (같은 폴더)
- **형태**: 외부 라이브러리·CDN 의존성 0 인 단일 HTML (Vanilla JS). `file://` 에서 그대로 동작.
- **디자인**: `src/docs/DESIGN.md` 디자인 시스템(색상 토큰·2분할 레이아웃·Toast·Copy) 준수.

---

## 1. 개요 및 목적

- **목적**: submission XML 의 `ref` / `target` 은 보통 `data:json,{"id":...,"key":...}` 같은 **WebSquare 표준 표현식**으로 작성된다. 이를 `$c.sbm.executeDynamic` 의 **간소화 문법**(`id[=key][|append]`)으로 손으로 옮기는 번거로움을 줄인다.
- **근거**: 변환 규칙은 `src/gcc/sbm.xml` 의 `scwin.__normalizeRefTarget` / `scwin.__bindResponseToTargets` / `scwin.executeDynamic` JSDoc 주석을 그대로 반영한다.

---

## 2. UI/UX 및 입력 항목

### 2.1 입력 (좌측 카드)

1. **Submission XML (Textarea)**
   - `<xf:submission ... />` 태그 전체를 붙여넣는다. 작은따옴표/큰따옴표 속성 모두 인식한다.
2. **호출 스타일 (Radio)**
   - `기본` : `$c.sbm.executeDynamic(sbmOptions);`
   - `Promise .then` : `.then(function (res) { if (res && res.skipped) return; ... })`
   - `async / await` : `const res = await ...; if (res && res.skipped) return; ...`
3. **gridview ID (Text, 선택)**
   - 입력 시 옵션에 `gridview : "..."` 가 추가된다. (통신 성공 시 `initGrid()` / 데이터 로드 시 `refresh()`)
4. **중복 실행 제어 (Select, 선택)**
   - `없음`
   - `onDuplicate: "abort"` (후행 우선 — 진행 중 요청 취소 후 재실행)
   - `allowDuplicate: false` (더블클릭 방지 — 진행 중이면 무시)
5. **Generator 버튼** : 파싱 및 스크립트 생성 실행.

### 2.2 출력 (우측 카드)

1. **결과 표시 (Read-only Textarea)** : 생성된 스크립트. 내용 양에 맞춰 높이 자동 조정.
2. **Copy 버튼** : 클립보드 복사 + Toast 안내. (`navigator.clipboard` 실패 시 `execCommand` 폴백)
3. **meta** : 파싱된 id, ref/target 개수, append 개수, 핸들러 개수 요약.

---

## 3. 파싱 규칙 (submission 속성 → options)

| submission 속성 | 생성되는 options 키 | 비고 |
| --- | --- | --- |
| `id` | `id` | 필수. 없으면 에러 표시. |
| `action` | `action` | 서버 URI |
| `ref` | `ref` | §4 간소화 변환 |
| `target` | `target` | §4 간소화 변환 |
| `method` | `method` | `post`(기본값)면 **생략** |
| `mode` | `mode` | `asynchronous`(기본값)면 생략, `synchronous`만 출력 |
| `mediatype` | `mediatype` | `application/json`(기본값)면 **생략** |
| `processMsg` | `processMsg` | 값이 있으면 출력 |
| `ev:submit` | `submitHandler` | |
| `ev:submitdone` | `submitDoneHandler` | |
| `ev:submiterror` | `submitErrorHandler` | |
| *(processMsg 없음)* | `isProcessMsg : false` | 문서 예제 관례에 맞춤 |

- **기본값 생략**: `method=post` / `mode=asynchronous` / `mediatype=application/json` 은 `$c.sbm.create` 의 기본값(`DEFAULT_OPTIONS_MODE`, `DEFAULT_OPTIONS_MEDIATYPE`)이므로 출력하지 않아 코드를 깔끔하게 유지한다.
- **핸들러 표기**: `scwin.xxx` 같은 식별자/멤버경로는 **함수 참조**(따옴표 없이), 그 외 값은 문자열로 출력한다.

---

## 4. ref / target 간소화 변환 규칙 (Core Logic)

표준 표현식 `data:json,...` 의 접두어를 제거하고 JSON 으로 파싱한 뒤, 각 항목을 `id[=key][|append]` 토큰으로 변환해 콤마로 결합한다. (`data:` 접두어가 없는 단일 문자열은 ID 로 간주)

### 4.1 ref (요청 측 — append 개념 없음)

| 표준 표현식 (XML) | 간소화 결과 |
| --- | --- |
| `data:json,dma_a` | `dma_a` |
| `data:json,{"id":"dma_a","key":"body"}` | `dma_a=body` |
| `data:json,["dma_a","dlt_b"]` | `dma_a,dlt_b` |

### 4.2 target (응답 측 — append 지원)

| 표준 표현식 (XML) | 간소화 결과 |
| --- | --- |
| `data:json,dlt_a` | `dlt_a` |
| `data:json,{"id":"dlt_a","key":"body.content"}` | `dlt_a=body.content` |
| `data:json,{"action":"append","id":"dlt_a"}` | `dlt_a\|append` |
| `data:json,["dlt_a","dlt_b"]` | `dlt_a,dlt_b` |

- `id=key` : 응답 경로 지정 (점(`.`) 경로 허용, 예: `body.content`).
- `|append` : 기존 데이터를 유지하며 누적 적재(`setJSON(data, true)`). 표준 표현식의 `{"action":"append", ...}` 또는 `{"append":true, ...}` 를 인식한다.

---

## 5. 테스트 케이스

### 테스트 케이스 A — 단일 객체(`id=key`)

**[입력]**

```xml
<xf:submission id="sbm_commonGroup" ref='data:json,{"id":"dma_search","key":"body"}' target='data:json,{"id":"dlt_commonGrp","key":"body.content"}'
	action="/common/selectCommonGroup" method="post" mediatype="application/json" encoding="UTF-8" instance="" replace="" errorHandler=""
	customHandler="" mode="asynchronous" processMsg="" ev:submit="" ev:submitdone="scwin.sbm_commonGroup_submitdone" ev:submiterror=""
	abortTrigger="">
</xf:submission>
```

**[기대 출력 — 기본 스타일]**

```javascript
const sbmOptions = {
    id : "sbm_commonGroup",
    action : "/common/selectCommonGroup",
    ref : "dma_search=body",
    target : "dlt_commonGrp=body.content",
    submitDoneHandler : scwin.sbm_commonGroup_submitdone,
    isProcessMsg : false
};

$c.sbm.executeDynamic(sbmOptions);
```

### 테스트 케이스 B — 배열 + append

**[입력]**

```xml
<xf:submission id="submission1" action="/action/url" method="post" mediatype="application/json"
	ref='data:json,["dma_search","dlt_common"]'
	target='data:json,["dlt_commonGrp","dlt_commonCode",{"action":"append","id":"dlt_commonSearchItem"}]' encoding="UTF-8" instance=""
	replace="" errorHandler="" customHandler="" mode="asynchronous" processMsg="ProcessMessage" ev:submit="" ev:submitdone=""
	ev:submiterror="" abortTrigger="">
</xf:submission>
```

**[기대 출력 — 기본 스타일]**

```javascript
const sbmOptions = {
    id : "submission1",
    action : "/action/url",
    ref : "dma_search,dlt_common",
    target : "dlt_commonGrp,dlt_commonCode,dlt_commonSearchItem|append",
    processMsg : "ProcessMessage"
};

$c.sbm.executeDynamic(sbmOptions);
```

> `target` 의 세 번째 항목 `{"action":"append","id":"dlt_commonSearchItem"}` 가 `dlt_commonSearchItem|append` 로 변환된다. `processMsg` 값이 있으므로 `isProcessMsg : false` 대신 `processMsg : "ProcessMessage"` 가 출력된다.

---

## 6. 구현 메모

- `parseSubmissionAttrs(xml)` : 정규식으로 `<xf:submission>` 여는 태그의 속성을 추출. 작은/큰따옴표 모두 지원.
- `parseDataExpr(expr)` : `data:json|xml,` 접두어 제거 → `JSON.parse` → `[{id, key, append}]` 배열. 파싱 실패 시 단일 ID 문자열로 처리.
- `toSimplifiedRef` / `toSimplifiedTarget` : 항목 배열을 간소화 문자열로 직렬화 (target 만 `|append`).
- `buildSnippet(attrs)` : 옵션 객체 라인 + 호출 스타일별 호출부 조립.
- 출력 시 문자열 값은 `JSON.stringify` 로 안전하게 이스케이프.

---

## 7. 참고

- 변환 규칙 원본: `src/gcc/sbm.xml` — `scwin.executeDynamic`, `scwin.__normalizeRefTarget`, `scwin.__bindResponseToTargets`.
- 디자인 가이드: `src/docs/DESIGN.md`.
- 자매 도구: `src/docs/data-generator/` (DataCollection XML 생성기).
