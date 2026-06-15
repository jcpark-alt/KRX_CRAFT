# WebSquare Submission 객체 분석

> 분석 대상: `websquare/engine/websquare-engine.beautified.js` (약 6MB, ~105,000 라인, vendored 엔진 소스 — 편집 금지)
> 라인 번호는 위 beautified 파일 기준입니다.

## 개요

엔진 내부에서 이 객체는 `WebSquare.uiplugin.Submission`이라는 이름이 아니라 **`w.Submission` 생성자**(`_pluginName: "submission"`)로 정의되어 있습니다. XML의 `<w2:submission>` 태그가 파싱되면 이 생성자로 인스턴스가 생성되고, 실제 생성·실행·삭제는 `WebSquare.ModelUtil.*Submission` 정적 함수들이 담당합니다.

## 정의 위치

| 항목 | 위치 |
|---|---|
| 생성자 `w.Submission` | `websquare-engine.beautified.js:88954` |
| 팩토리 `ModelUtil.createSubmission` | `:5030` |
| XML 파서 `parseSubmission` | `:88369` |

생성자는 인자 `t`(파싱된 설정 객체) 하나를 받아 모든 속성을 인스턴스에 복사합니다.

## 1. 인스턴스 속성

### 설정 속성 (XML `@`속성 또는 config 기본값에서 주입)

| 분류 | 속성 |
|---|---|
| 식별 | `id`, `org_id`, `xmlNode`, `parentElement`, `_pluginName`("submission") |
| 요청 대상 | `action`, `method`(POST), `mode`(asynchronous), `mediatype`, `accept`, `encoding`(UTF-8), `timeout` |
| 데이터 바인딩 | `bind`, `ref`, `target`, `replace`, `instance`, `singleMode` |
| 핸들러/UI | `customHandler`, `errorHandler`, `preSubmitFunction`, `processMsg`, `hideProcessMsg`, `useModal` |
| 기타 | `soapaction`, `useLocale`, `localeRef`, `abortTrigger`, `withCredentials`, `scope_id`, `msaName`, `requestHeader`({}), `formData`, `formDataKey`, `webtopRef`, `userData1`, `userData2` |

### 런타임 속성

| 속성 | 초기값 | 용도 |
|---|---|---|
| `startTime` / `endTime` | `null` | 시작/종료 타임스탬프 |
| `processStatus` | `0` | 0=idle, 1=실행 중 |
| `linkedObj` | `[]` | 실행 중 비활성화할 UI 컴포넌트 |
| `requestData` | undefined | 요청 본문 데이터 (`setRequestData`로 설정) |
| `obfuscator_http` | undefined | 진행 중인 XMLHttpRequest |

### 이벤트 핸들러 속성 (존재 시에만 설정)

`submitHandler`, `submitDoneHandler`, `submitErrorHandler`, `submitTimeoutHandler`

## 2. 인스턴스 메서드

생성자 내부에 클로저로 직접 정의됩니다 (`:88957`~`:88978`). **prototype이 아니라 매 인스턴스마다 새로 할당**되므로 `Submission.prototype`을 grep해도 나오지 않습니다.

| 메서드 | 동작 |
|---|---|
| `setRequestData(data)` | `this.requestData = data` |
| `setRequestHeader(k, v)` | 문자열 키면 헤더 1개 설정, 객체면 헤더 전체 교체 |
| `getScope()` | `scope_id`로 wframe 컴포넌트 반환 (없으면 null) |
| `getScopeWindow()` | scope window 또는 전역 `window` 반환 |
| `_getMsaOption()` | `{frameObj: getScope(), msaName}` — MSA(다중서버) URL 생성용 |

## 3. 실행 라이프사이클

진입점: `ModelUtil.executeSubmission(id, reqData, linkedObj, cb, errCb)` (`:5005`)

```
executeSubmission(id, reqData, linkedObj, cb, errCb)         :5005
  ├─ setSubmissionStart()                                    :5158  startTime 기록, processStatus=1, linkedObj UI 비활성화
  ├─ customHandler 있으면 그쪽으로, 없으면 ↓
  └─ defaultSubmissionHandler()                              :5175
       ├─ [step1] fireEvent "xforms-submit"                  :5182  ← false 반환 시 취소(cancellable)
       │          doSubmitPreFunc() → getReqData() → XHR 생성/전송
       ├─ [step2] commonResponseHandler()                    :5368  HTTP 상태 확인, Content-Type별 파싱(JSON/XML/text)
       │          오류 시 fireEvent "xforms-submit-error"    :5405
       └─ [step3]                                            :5462  errorHandler 호출 → target/instance에 응답 반영
                  성공: fireEvent "xforms-submit-done"       :5498
                  오류: fireEvent "xforms-submit-error"      :5480
  └─ setSubmissionEnd()                                      :5140  endTime 기록, processStatus=0, UI 재활성화
```

**타임아웃**(async + timeout 설정 시): XHR abort 후 `xforms-submit-timeout` 이벤트 발생 (`:5246`).

## 4. 발생 이벤트

| 이벤트 | 시점 | 취소 가능 |
|---|---|---|
| `xforms-submit` | 요청 전송 직전 (`:5182`) | ✅ false 반환 시 중단 |
| `xforms-submit-done` | 성공 응답 후 (`:5498`) | ❌ |
| `xforms-submit-error` | HTTP 오류 / errorHandler 오류 (`:5405`, `:5480`) | ❌ |
| `xforms-submit-timeout` | 타임아웃 (`:5246`) | ❌ |

XML에서는 `ev:submit` / `ev:submitdone` / `ev:submiterror` / `ev:submittimeout` 속성으로 연결되거나, 인스턴스의 `submitHandler` 등 속성으로 등록됩니다.

## 5. 주요 정적(ModelUtil) API

| 함수 | 위치 | 용도 |
|---|---|---|
| `getSubmission(id, modelId, opts)` | `:4975` | ID로 submission 조회 |
| `getSubmissionList(opts)` | `:4993` | 전체 submission 목록 (scope/model 필터) |
| `executeSubmission(...)` | `:5005` | 실행/트리거 |
| `createSubmission(config, modelId)` | `:5030` | 신규 생성 (팩토리) |
| `deleteSubmission(id, modelId, opts)` | `:5075` | 삭제 |
| `abort(id, scopeId)` | `:5104` | 요청 강제 중단 |
| `defaultSubmissionHandler(...)` | `:5175` | 기본 실행 핸들러 |
| `setSubmissionStart / setSubmissionEnd` | `:5158` / `:5140` | 시작/종료 처리 (UI 비활성/재활성) |
| `getReqData(submission)` | `:5294` | ref/instance에서 요청 페이로드 구성 |
| `commonResponseHandler(...)` | `:5368` | 응답 처리 (step2~3) |
| `executeWorkFlowSubmission(...)` | `:5813` | 워크플로우 submission 실행 |

## 6. XML 설정 속성 매핑

`parseSubmission` (`:88369`~`:88422`)에서 `<w2:submission>`의 속성을 인스턴스 속성으로 매핑합니다.

| XML 속성 | Submission 속성 | config Fallback | 기본값 |
|---|---|---|---|
| `@id` | `id` | (필수) | — |
| `@action` | `action` | `/WebSquare/submission/action/@value` | (필수) |
| `@method` | `method` | `/WebSquare/submission/method/@value` | POST |
| `@mode` | `mode` | `/WebSquare/submission/mode/@value` | asynchronous |
| `@mediatype` | `mediatype` | `/WebSquare/submission/mediatype/@value` | 자동 (POST 시 application/xml) |
| `@accept` | `accept` | `/WebSquare/submission/accept/@value` | — |
| `@encoding` | `encoding` | `/WebSquare/submission/encoding/@value` | UTF-8 |
| `@ref` | `ref` | — | "" |
| `@target` | `target` | — | — |
| `@replace` | `replace` | — | — |
| `@instance` | `instance` | — | — |
| `@bind` | `bind` | — | null |
| `@customHandler` | `customHandler` | — | "" |
| `@errorHandler` | `errorHandler` | `/WebSquare/submission/errorHandler/@value` | — |
| `@preSubmitFunction` | `preSubmitFunction` | `/WebSquare/submission/preSubmitFunction/@value` | "" |
| `@processMsg` | `processMsg` | `/WebSquare/submission/processMsg/@value` | — |
| `@useLocale` | `useLocale` | `/WebSquare/useLocale/@value` | false |
| `@localeRef` | `localeRef` | — | "" |
| `@soapaction` | `soapaction` | — | "" |
| `@timeout` | `timeout` | `/WebSquare/submission/timeout/@value` | — |
| `@singleMode` | `singleMode` | — | false |
| `@hideProcessMsg` | `hideProcessMsg` | `/WebSquare/submission/hideProcessMsg/@value` | false |
| `@abortTrigger` | `abortTrigger` | `/WebSquare/submission/abortTrigger/@value` | true |
| `@withCredentials` | `withCredentials` | — | false |
| `@useModal` | `useModal` | `/WebSquare/submission/useModal/@value` | false |
| `@webtopRef` | `webtopRef` | — | "" |
| `@userData1` / `@userData2` | `userData1` / `userData2` | — | "" |
| `@msaName` | `msaName` | — | — |
| `ev:submit` | `submitHandler` | — | — |
| `ev:submitdone` | `submitDoneHandler` | — | — |
| `ev:submiterror` | `submitErrorHandler` | — | — |
| `ev:submittimeout` | `submitTimeoutHandler` | — | — |
