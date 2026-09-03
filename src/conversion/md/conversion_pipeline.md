# 하이브리드 변환 파이프라인 (Python 기계 치환 → Claude Code 보강)

> 이 문서는 [websquare_conversion_guide.md](websquare_conversion_guide.md) 의 **§4 하이브리드 변환 파이프라인** 본문입니다. 규칙 정의는 [conversion_rules.md](conversion_rules.md), 규칙 7 치환 매핑표는 [substitution_map.md](substitution_map.md) 를 참조하세요.

규칙 1~7 중 **판단이 필요 없는 단순 치환·코드 재배치**는 Python 으로 일괄(기계어) 처리하고, **판단·재설계가 필요한 부분만** Claude Code 로 보강하는 2단계 워크플로우입니다. 대량 파일을 빠르고 일관되게, 그리고 비용 효율적으로 변환하는 것이 목적입니다.

> 기준 파일 예시: `src/conversion/next-krx-lds-fil-front/ui/ULDCOM00007.xml` — `head(3~430) → script CDATA(22~429) → body(431~568)` 구조.

## 전제 — 파일을 3개 영역으로 분리

WebSquare XML 은 `head(xml) → script(JavaScript, CDATA) → body(xml)` 구조이고, 영역마다 변환 성격이 달라 **영역을 먼저 분리한 뒤 영역별 변환기**를 적용합니다.

| 영역 | 범위 | 내용 | 주요 변환 |
| --- | --- | --- | --- |
| **HEAD** (xml) | `<head>` ~ `</head>` 중 `<script>` 제외 | `meta_*`, `<w2:dataCollection>`, `<xf:submission>` | 규칙 6(submission 파싱·삭제), 메타 보존 |
| **SCRIPT** (js) | `<script ...><![CDATA[` ~ `]]></script>` 내부 | 전역변수·이벤트함수·일반함수 JavaScript | 규칙 1·2·4·5·7 의 대부분 |
| **BODY** (xml) | `<body>` ~ `</body>` | UI 컴포넌트 마크업 + `ev:on*` 핸들러 속성 | 규칙 3(핸들러명 동기화) |

* 경계 추출은 정규식/문자열 인덱스로 결정적으로 가능합니다: `<script ...><![CDATA[` 와 `]]></script>` 사이가 SCRIPT, 그 바깥의 `<head>`/`<body>`.
* **영역 인식이 핵심**입니다. SCRIPT 변환기는 CDATA 내부만, BODY 변환기는 `ev:on*` 속성만 건드립니다. body 의 `<xf:label><![CDATA[가]]></xf:label>` 같은 **한글 UI 텍스트는 절대 치환 대상이 아닙니다.**

## 단계 1 — Python 기계 치환 (결정적 변환)

"입력이 같으면 출력이 항상 같은" **결정적(deterministic)** 변환만 Python 으로 일괄 처리합니다. 판단이 필요 없는 1:1 규칙이 대상입니다.

> **참조 구현**: `src/conversion/tools/convert.py` — 영역 분리 + 규칙 1~12 결정적 치환(문자열/주석/정규식 보호)과 단계 2 리포트 출력. 규칙 7 은 `gcc_mapping.substitution_dict()` 를 단일 출처로 쓰고, 검토/대체 태그·충돌 함수는 자동 치환하지 않고 리포트로 분리합니다. 마지막에 포매팅을 적용합니다: **`//----W-Craft` 변환 확인 마커 주석 전부 삭제**(규칙 30 — 2026-09-03 변경, 종전 "정렬 유지" 폐기·빈 블록 주석 껍데기 동반 제거), **함수 단위 빈 줄 1개 삽입**, **함수 주석 맨앞(컬럼 0) 정렬**. 일괄 실행은 `src/conversion/tools/convert_all.py`.
> 실행: `python src/conversion/tools/convert.py <src.xml> [out.xml]`

| 규칙 | 처리 영역 | Python 처리 방식 | 비고 |
| --- | --- | --- | --- |
| 규칙 1 vScrenID 삭제 | SCRIPT | `scwin.vScrenID`/`var vScrenID` 선언·대입 삭제(함수 내부 포함) + 잔존 참조는 대입값(없으면 파일명) 리터럴 치환 — 미사용(2026-09-02 변경, 종전 "파일명 변수 삽입" 폐기) | 멱등. 치환 불가 잔존은 리포트(수동 확인) |
| 규칙 2 전역변수 이동 | SCRIPT | 최상위 `scwin.X = <리터럴>;` 을 **1. 변수 및 선언 영역**(`///////// 1. … /////////` 헤더)으로 이동 | 호출/참조 RHS(예: `$c.x.f()`)는 실행순서 영향으로 이동 보류·리포트 |
| 규칙 4 영역 재배치 | SCRIPT | 함수 정의를 **5단계 정형화 구조**(2 초기화 / 3 이벤트 / 4 서브미션 콜백 / 5 일반)로 분류·정렬 + 슬래시 섹션 헤더 삽입([code-convention.md](../../docs/code-convention/code-convention.md)). 콜백은 이름 패턴+핸들러 옵션 참조+본문 `$c.sbm.executeDynamic` 호출(통신 실행 함수, 이벤트 핸들러 제외)로 분류. `gform_onload`→`onpageload` 병합은 안전조건에서만 | 함수 사이/뒤 최상위 실행문 있으면 보류·리포트. 구 형식(한 줄 경계 주석·3줄 블록 헤더)은 현행 헤더로 마이그레이션(멱등) |
| 규칙 5 문법/API | SCRIPT | `==`/`!=` → `===`/`!==`, `X.value = v` → `X.setValue(v)`, `X.src = v` → `X.setBackgroundImage(v)`, `X.getTotalRow()` → `X.getRowCount()`, `!X === Y` → `X !== Y`(5e 우선순위 버그 교정·건별 리포트) | 문자열·정규식·주석 리터럴 보호. 속성 대입은 읽기 제외, 메서드명 치환은 수신 객체·인자 보존 |
| 규칙 6 Submission | HEAD+SCRIPT | 정적 action + 단순 `execute(id)` 만, `const sbmOptions = {...}`(submitDoneHandler 제외) + `const sbmRtn = await executeDynamic(sbmOptions)` **async/await 순차 스타일**로 변환 + 노드 삭제. ev:submitdone 핸들러 존재 시 await 뒤 직접 호출 연결. target ID 역추적으로 body `<w2:gridView>` id 를 `gridview` 자동 삽입 | 동적 action/속성변형은 sbmOptions 스텁과 함께 리포트. **ev:submiterror 존재 시 콜백 스타일 유지**(단계2 검토) |
| 규칙 7 (1:1) | SCRIPT | **태그 없는** 매핑만 함수명 단어경계 치환 (`fn_Trim(` → `$c.str.trim(`) | `gcc_mapping.substitution_dict()` 사용(태그없음·무충돌) |
| 규칙 7m 메서드 치환 | SCRIPT | 레거시 메서드 호출 `{객체}.CloseFrame()` 전체를 인자 없는 `$c.win.closePopup()` 로 치환(수신 객체 제거, `await` 보존) | `_METHOD_CALL_MAP` 사용. 인자 있는 호출은 보류·리포트, 직전 W-Craft 마커 함께 제거. 매핑은 [substitution_map.md](substitution_map.md) §10·§6 |
| 규칙 7n 모듈명 정규화 | SCRIPT | 이미 `$c.<ns>.` 붙은 레거시명 정규화 `$c.stf.fn_setFromToDate(` → `$c.stf.setFromToDate(` (같은 ns, 이름만, 인자 보존) | `gcc_mapping.module_fn_dict()`(SOT: `src/as-is/*/gcc/*.xml` JSDoc, [substitution_map.md](substitution_map.md) §9) 사용. 네임스페이스 변경/태그 매핑·미정의 함수는 제외(단계 2) |
| 규칙 3 (동기화) | SCRIPT+BODY | 이벤트명 소문자화 + `ev:on*` 속성 ↔ 스크립트 함수명 **동시** 수정 | 이름변경 사전(dict) 공유 |
| 규칙 8 `var`→`const`/`let` | SCRIPT | 재할당 분석: 단일 할당 → `const`, 재할당·카운터 → `let` | 호이스팅·재선언 의존 시 Claude 검토 |
| 규칙 9 불필요 호출 제거 | SCRIPT | `$c.cm.ShowWin/ShowNoData/CloseWin/ShowTrWin/CloseTrWin` 단독 statement 삭제(주석 흔적 포함) | 중괄호 없는 제어문 본문은 보류·리포트 |
| 규칙 10 이벤트요소 삭제 | BODY(XML) | `<xf:events>...</xf:events>` 블록 및 `<xf:event .../>` 요소 전부 삭제(주석 블록 포함) | `ev:on*` 속성으로 대체됨(규칙 3) |
| 규칙 11 include 삭제 | SCRIPT | `include(...)` 로 시작하는 라인 삭제(주석 형태 + **블록 주석 내부 포함** — 2026-09-03 보강) | gcc 는 `$c.*` 로 제공되어 불필요 |
| 규칙 30 W-Craft 마커 삭제 | SCRIPT | `//----W-Craft 변환 확인----//` 마커 주석 라인 전부 삭제(블록 주석 내부 포함, 빈 블록 주석 껍데기 동반 제거 — 2026-09-03 확정, 종전 "정렬 유지" 폐기) | `★Wcraft guide★` 파일 헤더 블록은 유지. 멱등 |
| 규칙 13 `scwin.fn_*` 함수명 정규화 | HEAD+SCRIPT+BODY | 정의된 `scwin.fn_*` 함수의 `fn_` 제거 + camelCase(`fn_setFromToDate`→`setFromToDate`) 후 정의·호출부(script 호출 + **bare 참조**(`= fn_GetReturn` 등), body `ev:on*`, head publicInfo/submission) 동기화 | 같은 파일 정의 함수만(로컬 우선). 외부 호출(`fn_GetPar` 등)·이름 충돌(`fn_search`/`fn_Search`→`search`)은 보류·리포트 |
| 규칙 12 DataID/reset → executeDynamic | SCRIPT | 같은 스코프의 `{DC}.DataID = encodeURI({url})`(주석 변형 포함) **또는 직접 문자열 리터럴**(`{DC}.DataID = "/gauceSystemierAdaptor.do?..."`) + `{DC}.reset()` **또는 Gauce 대문자 `{DC}.Reset()`** 쌍을 `const sbmOptions = {...}` + `executeDynamic(sbmOptions)` 로 전환. action 은 URL 의 `?` 앞 경로, `ref:""`/`target:"{DC}=body.content"`/`isProcessMsg:false` 자동 생성 후 `const sbmRtn = await executeDynamic(...)` **순차 스타일**로 방출(파일에 `scwin.sbm_{DC}_submitdone` 정의가 있으면 await 뒤 직접 호출, 없으면 `// TODO Stage2`). url 변수·`.reset()`/`.Reset()`·W-Craft 주석 제거 | action URL(또는 url 변수) 해석 실패·짝 reset 없음은 미변환·리포트. 스코프별 `sbmOptions`/`sbmRtn`/`2`… 명명. 상세는 [dynamic_submission_guide.md](dynamic_submission_guide.md) |
| 규칙 16 trs 트랜잭션 Post → executeDynamic | SCRIPT | 같은 블록의 Gauce 트랜잭션 `{trs}.Action = {url};` + `{trs}.KeyValue = "JSP(...)";` + (선택)`{trs}.Parameters = {qs};` + `{trs}.Post();` 묶음을 `const sbmOptions = {...}` + `executeDynamic(sbmOptions)` 로 전환. **Action→action**(`?` 앞 경로), **KeyValue→ref**(`JSP(I:pInput=A,I:pFile=B)`→`"A,B"`, `=` 우변 데이터셋명), **Parameters→주석 JSON**(쿼리스트링 연결식을 `// const sbmParams = {...}` 객체로 변환·주석화), **Post()→`const sbmRtn = await executeDynamic(...)`**(순차 스타일 — 규칙 12 동일 규약: 핸들러 정의 존재 시 직접 호출/부재 시 TODO). id/target/isProcessMsg 는 객체명 기반 생성 | `target`·응답 처리는 규약상 단계 2 검토 보강 대상. Action URL 해석 실패·짝 Action 없는 Post 는 미변환·리포트 |
| 규칙 17 CreateDialogFrame → openPopup | SCRIPT | `[await] {recv}.CreateDialogFrame(id,url,title,left,top,width,height,type)` 8인자 호출을 `const options={...}` + `const data={...}` + `await $c.win.openPopup(url, options, data)` 로 전환. **type="window"→browserPopup**(`data.callbackFn`+`scwin.popupCallback(result)`+콜백 정의 1회 추가)/**그 외→pageFramePopup**. `options.id`=url 파일명(확장자 제거), `left`/`top` 드롭, 정수 width/height→`"Npx"`, 윗줄 `row` 인자 호출 삭제 | 인자 8개 아님·url 비리터럴(동적 결합)은 미변환·리포트. `data` 채움·`result` 처리·표현식 width/height 정리는 단계 2 보강. 상세는 [createdialogframe_popup_guide.md](createdialogframe_popup_guide.md) |
| 규칙 20 그리드 엑셀다운로드 → 공통함수 | SCRIPT | `{gridView}.advancedExcelDownload(options[, infoArr])` 를 `$c.data.downloadGridViewExcel({gridView}, options[, infoArr])` 로 치환. 수신 객체(그리드)를 첫 인자로 승격, 기존 인자 순서 유지(규칙 14 반대 방향). `_scan_call` 로 중첩 괄호/객체 리터럴 인자 정확 파싱, 윗줄 W-Craft 마커 제거 | 인라인 객체 리터럴 인자도 보존(infoArr 임의 생성 안 함). 결과에 `.advancedExcelDownload` 없어 멱등. 상세는 [conversion_rules.md](conversion_rules.md) §규칙 20 |
| 규칙 20b 엑셀다운로드 위치인자 → 객체 정규화 | SCRIPT | `$c.data.downloadGridViewExcel(grid, fileName, sheetName, type)`(정확히 4인자)를 `$c.data.downloadGridViewExcel(grid, {fileName[, sheetName], type})` 로 정규화. 2번째→fileName, 4번째→type, 3번째(빈값) 생략. 토큰 원형·trailing 주석 보존 | 인자 수 4개로 형태 판별(객체형 2~3인자 제외). 결과 2인자라 멱등. 상세는 [conversion_rules.md](conversion_rules.md) §규칙 20b |
| 규칙 21 프레임 접근 → 공통함수 | SCRIPT | `{recv}.Provider("../")`(부모 프레임)를 `$c.win.getParent()` 로 치환(수신 객체 제거). 정확히 `"../"` 리터럴만 | `/top`·`../../`·동적경로(`"../"+x`)·형제프레임은 대응 공통함수 없어 미변환·리포트(단계2). 후속 scwin 멤버는 `.scwin` 경유 검토. **browserPopup 화면은 `getOpenerScope`/`callOpener` 사용(단계2)**. 결과에 `.Provider(` 없어 멱등. 상세는 [conversion_rules.md](conversion_rules.md) §규칙 21 |
| 규칙 25 submitDoneHandler 옵션형 → 순차 스타일 | SCRIPT | 옵션 객체의 `submitDoneHandler : scwin.X` 제거 + 단독 호출문을 `const sbmRtn = await executeDynamic(옵션)` + `await scwin.X(sbmRtn)` 로 정규화(수기 선변환분 정상화 — 핸들러 옵션은 Promise 가 settle 안 됨) | 핸들러 미정의 시 `// TODO Stage2`, `submitErrorHandler` 공존 시 콜백 유지·보류, 대입형 호출은 속성만 제거. 상세는 [conversion_rules.md](conversion_rules.md) §규칙 25 |
| 규칙 26 진입점 try/catch | SCRIPT | 규칙 4 섹션 기준 2구역(`onpageload`)·3구역(이벤트 핸들러) 본문을 `try/catch + $c.exception.handleError(ex, {context:"화면ID.함수명"})` 로 래핑(code-convention §오류 처리 자동 적용) | 본문에 `try` 존재·빈 본문은 건너뜀(멱등). 규칙 4 보류 파일엔 미적용(재정렬 해소 후 재변환). 상세는 [conversion_rules.md](conversion_rules.md) §규칙 26 |
| 규칙 27 그리드 자식 중복 id 재부여 | BODY(XML) | `<w2:caption>`/`<w2:header>`/`<w2:gBody>` 의 문서 전체 중복 id 를 `{base}{n}` 미사용 순번으로 재부여(WS120 해소 — W-Craft 가 그리드마다 caption1 등 복제) | 첫 등장 유지·표시 전용 id 만 대상(스크립트 참조 없음). 상세는 [conversion_rules.md](conversion_rules.md) §규칙 27 |
| 규칙 28 반복문 setBroadcast 제어 | SCRIPT | for/while/`{DC}.forEach` 본문이 DataCollection(head 선언 id·`dma_`/`dlt_`/`dts_` 접두)을 반복 변경하면 반복 앞뒤에 `{DC}.setBroadcast(false)` / `{DC}.setBroadcast(true, true)` 삽입(UI 일괄 갱신 — 성능·깜빡임 개선) | 본문 `return`/`throw` 는 복원 누락 위험으로 보류·리포트, 단문 루프 제외, 중첩은 바깥만. 상세는 [conversion_rules.md](conversion_rules.md) §규칙 28 |
| (후처리) async 함수 부여 | SCRIPT | 규칙 6/12/16/17/25 가 만든 `await` 의 최내곽 `function` 에 `async` 키워드 자동 삽입 (`mark_async_functions`, 멱등) | async 로 바뀐 함수의 **호출부 await 전파 여부는 단계 2 검토** 리포트. 화살표 함수 내 await 는 탐지 제외·리포트 |
| 규칙 23 그리드 전체 행 표시 → 공통함수 | SCRIPT | `{grid}.setVisibleRowNum("all")` 을 `$c.util.setGridVisibleRowNum({grid}, "all")` 로 치환(수신 객체 첫 인자 승격). 엔진 API 는 숫자 전용이라 "all" 이 조용히 거부됨 | `"all"`/`'all'` 리터럴만 대상(숫자/변수 무변환). 호출 체인 수신은 보류·리포트(단계2). 페이징 화면은 `setPagingInfo maxRowNum:"all"` 우선 검토. 결과에 `.setVisibleRowNum("all")` 없어 멱등. 상세는 [conversion_rules.md](conversion_rules.md) §규칙 23 |

**기계 치환 원칙**
* **단어경계 매칭**: 함수명 치환은 `\b함수명\s*\(` 처럼 호출부만 매칭하여 부분 문자열 오치환을 막습니다. `replaceAll`·`trim` 등 흔한 이름은 특히 주의(원시 String 메서드와 충돌 가능).
* **멱등성(idempotent)**: 변환본을 다시 돌려도 결과가 동일해야 합니다 — 예: 섹션 헤더 중복 삽입 금지, 규칙 1 재실행 시 무변경.
    * 단, **이미 `$c.*` 로 바뀐 호출이라도 치환 매핑표([substitution_map.md](substitution_map.md))의 TO-BE(gcc) 항목에 해당하는 함수라면 치환(정규화) 대상에 포함**합니다. 즉, "`$c.*` 이면 무조건 건너뛴다"가 아니라 **TO-BE 목록 기준으로 판정**합니다.
    * 이 경우에도 이미 올바른 TO-BE 형태면 동일한 결과로 수렴하므로(재치환 = 같은 함수로의 no-op) 멱등성은 유지됩니다. 비표준/구버전 `$c.*` 호출이 TO-BE 항목에 매핑되어 있다면 표준 형태로 정규화됩니다.
* **리터럴 보호**: `==`→`===` 같은 치환은 문자열/정규식/주석 내부를 건드리지 않도록 토큰 단위로 처리합니다.
* **산출물**: ① 변환본 XML, ② 변환 전/후 diff, ③ **자동 치환하지 못한 항목 리포트**(검토/대체 태그, 시그니처 불일치 의심, 매핑표 미존재 함수)를 남겨 단계 2 의 입력으로 사용합니다.

## 단계 2 — Claude Code 보강 (판단 필요 변환)

Python 이 남긴 **"추가 작업 목록"만** Claude Code 로 처리합니다. 기계가 판단하기 어려운 부분이 대상입니다.

> **잔여 TODO 추적**: 단계 2에서도 화면 실행(런타임)·업무 로직 판단이 필요해 보류한 항목은 코드에 `// TODO Stage2:` 주석으로 남기고, 모듈·유형·파일·라인별로 [stage2_todo_worklist.md](stage2_todo_worklist.md) 에 집계합니다(자동 생성). mgt·stf·tms 변환분 기준 0-based 인덱스 검토·submitdone 핸들러 미정의·팝업 콜백·필터 재구현 등이 주요 유형입니다. 항목 해결 시 코드 주석 제거 + 워크리스트 갱신.

* **검토 태그 매핑**: 시그니처·기본값·반환형이 다른 함수(`toNum`→`$c.num.parseFloat`, `showObj`→`$c.validate.setComponentProperty`, `cIsBupin`→`$c.str.isBizID` 등) — 인자 순서/개수를 확인해 조정.
* **대체 태그 매핑**: 원시 XHR/`sendMessage` → `$c.sbm.execute`/`executeDynamic` 재작성, jQuery 풍 `$()` → `$c.util.getComponent`. 콜백·응답 처리 구조 재설계.
* **원시 JSP/jQuery 페이지 재설계(규칙 19)**: WebSquare 가 아닌 HTML·JSP·jQuery 레거시 페이지(예: `inf/srch/ULDINF20000`, `inf/comm/ULDINF90400`)는 **단계 1(Python) 대상이 아니다**(`==`→`===`·`var`→`const/let` 등 표면 치환만 적용되고 DOM/jQuery 블록은 잔존). UI 마크업을 `<w2:*>` 컴포넌트로 재구성한 뒤 `$("#id").val()/.show()`·`document.{폼}.{필드}`·`window.open`·`new Date`·`<c:out>/${…}` 등을 컴포넌트 메서드(`getValue`/`setValue`/`setFocus`/`show`/`hide`)·`$c.*`(`sbm.executeDynamic`/`win.openPopup`/`date.*`/`util.getParameter`)로 옮긴다. 매핑표는 [substitution_map.md](substitution_map.md) §11, 식별 신호·선행조건은 [conversion_rules.md](conversion_rules.md) §규칙 19 참조.
* **인자 형태 변환**: 의미는 같아도 레거시와 gcc 함수의 인자 형태가 다른 경우(날짜 가감 방향, 포맷 문자열 규칙, 반환 타입 등). ※ 2026-08 gcc 개편으로 `$c.date.dateUnFormat`(format 파라미터 제거)·`$c.str.stringFormat`(delLength 파라미터 제거)은 잉여 인자를 무시하므로 치환 시 인자를 정리한다.
* **browserPopup 부모 접근 보강**: browserPopup 으로 열리는 팝업 화면의 `window.opener.*`·부모 scwin 호출은 `$c.win.getOpenerScope()`/`$c.win.callOpener()` 로 재작성한다(`getParent()` 불가 — `src/docs/popup-opener-guide.md`).
* **목록↔상세 복귀 상태 복원**: 목록→상세 이동(moveUrl/setPageFrameSrc) 화면은 `{isHistory:true, dataInfo}` 스냅샷과 상세의 [목록] 버튼 `{restoreData:true}` 패턴을 적용해 조회조건·목록·페이징을 복원한다(`src/docs/frame-history-guide.md`, `_pagingInfo` 예약 키).
* **페이징 전체보기/내림차순 순번**: AS-IS 자체 구현(전체보기 토글·역순 순번 계산)은 `$c.sbm.setPagingInfo` 의 `maxRowNum:"all"`·`rowNumVisble:"{grid}|desc"`(+`rowNumColumn`) 옵션으로 대체한다.
* **모호·충돌**: 같은 이름이 파일마다 다른 의미이거나, 치환 매핑표([substitution_map.md](substitution_map.md))에 없는 커스텀 로직.
* **수동 검증 나열 통합(규칙 24)**: 레거시 검증 함수의 "빈값 체크→alert→focus→return false" 반복 패턴을 `await $c.validate.validateDataCollect(container, { fields })` 한 건으로 통합한다(required/format/길이/compare 등 규칙 매핑, async 전파, 미바인딩·이관 불가 유형 유의) — [conversion_rules.md](conversion_rules.md) §규칙 24.
* **Gauce 데이터셋/그리드 API 전환(규칙 29)**: `countrow`/`NameValue`/`NameString`/`RowPosition`/`UseFilter·Filter()·OnFilter`/`SortExpr·Sort()`/`Redraw`/`*_OnLoadCompleted` 잔존 화면을 WebSquare DataList·gridView 표준 API(`getRowCount`/`getCellData`/`getRowPosition`/`setFocusedCell`/`setColumnFilter`/`sort`/`setBroadcast`)로 재설계한다 — DataCollection 미선언 시 DataList 선언 생성(어댑터 더미 로드 삭제), 1-base→0-base 전환, userData2 잔재 이벤트의 `ev:on*` 재배선, 미정의 `$c` 네임스페이스 정의 오기 교정 포함. 정답지: `ULDCOM00008`(mgt)·`ULDCOM00007_KOSDAQ_IR`(stf) — [conversion_rules.md](conversion_rules.md) §규칙 29.
* **표준 JSDoc 주석 생성**: 전 함수에 샘플 표준 형식(`@method`/`@name scwin.함수명`/`@author`/`@date`/`@description`/`@param {타입} 이름 설명`/`@returns`/`@hidden N`)의 주석을 생성하고, 레거시 박스형(`/**** 함수명 ****/`) 주석은 제거한다. 설명·체크 함수의 반환 규약(`0: 진행, 1: 중단` 등) 기재는 판단 작업(단계 2).
* **불용 코드·미정의 참조 정리**: 어디서도 호출/바인딩되지 않는 함수(구 Gauce 콜백 `trs_*` 등)·핸들러, 존재하지 않는 컴포넌트/DataCollection/전역 함수 참조(`dts_*` 잔재, `popUpCalendar*`, body 의 죽은 `ev:on*` 속성), Gauce 전용 속성 대입(`RightMargin` 등)을 제거한다. 단, 외부 계약(`scwin.fn_GetPar`/`fn_SetPar` — `$c.bns` 팝업이 이름으로 참조)은 미참조라도 유지. `scwin.vScrenID` 관련 코드는 규칙 1(2026-09-02 변경)이 삭제한다.
* **샘플 매칭 보강**: 화면 유형(목록+페이징/작성/팝업/탭/엑셀 등)을 [sample_templates.md](sample_templates.md) 매칭 표에서 찾아, 해당 최종 샘플의 5단계 구조·async/await 서브미션·검증·페이징 사용 방식과 일치하도록 정렬한다 — **샘플 13종이 단계 2 의 도달 목표(정답지)**다.
* **검증**: 의미 보존 확인, 잔존 레거시 호출/미사용 정의 정리, `npm run lint:xml`(`wsxml_lint`) 통과 확인.

## 권장 실행 순서

1. **(Python)** 대상 파일을 HEAD/SCRIPT/BODY 3영역으로 분리한다.
2. **(Python)** 단계 1 결정적 규칙을 일괄 적용 → 변환본 + 리포트(미처리·검토 항목)를 생성한다.
3. **(Claude)** 리포트의 *검토·대체* 항목을 치환 매핑표([substitution_map.md](substitution_map.md))와 `gcc/index.html` 시그니처를 기준으로 보강한다.
4. **(Claude)** 화면 유형을 [sample_templates.md](sample_templates.md) 최종 샘플에 매칭해 구조·공통함수 사용을 샘플 수준으로 정렬한다.
5. **(Claude)** 잔존 레거시 호출을 grep 으로 점검하고, 의미를 검증한 뒤 `npm run lint:xml` 로 마무리한다.

> 역할 분담 요약: **Python = 양·일관성·속도**(결정적 1:1 치환·재배치), **Claude Code = 판단·재설계·검증**(검토/대체 매핑, 통신 재작성, 최종 확인).
