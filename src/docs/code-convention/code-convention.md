# WebSquare 업무 화면 코드 컨벤션 — 5단계 정형화 구조

업무 화면 스크립트의 가독성·유지보수성을 위한 표준 구조 규약이다. **변환(conversion) 산출물과 신규 작성 화면**에 적용하며,
변환 파이프라인(convert.py 규칙 2·4)이 구조 재배치와 헤더 삽입을 자동 수행한다. (2026-08-21 확정)

- **적용 범위**: 업무 화면(`ui-tobe` 신규 변환분·신규 작성 화면). `src/gcc` 공통 라이브러리는 대상이 아니다(별도 구조).
- **기존 변환분(302파일) 소급 없음** — 재변환 시 자동 마이그레이션되도록 도구가 구(舊) 한 줄 경계 주석을 블록 헤더로 교체한다.

---

## 5단계 구조

스크립트는 아래 5개 영역을 **이 순서대로** 배치하고, 각 영역은 표준 블록 헤더로 구분한다.

```javascript
///////// 1. 변수 및 선언 영역 /////////
```

| # | 영역 | 역할 | 배치 대상 |
|---|------|------|-----------|
| 1 | **변수 및 선언 영역** | 페이지 전역 변수·상태값·전달 파라미터 | `scwin.param = {};`, `scwin.pageNum = 1;` 등 리터럴 전역(규칙 2가 자동 이동) |
| 2 | **초기화 영역** | 페이지 라이프사이클·초기 세팅 | `scwin.onpageload`, `scwin.onpageunload` |
| 3 | **컴포넌트 이벤트 영역** | 사용자 액션 이벤트 핸들러 | `scwin.{컴포넌트ID}_{이벤트명소문자}` (예: `scwin.btn_search_onclick` — 규칙 3) |
| 4 | **서브미션 콜백 영역** | 통신 실행·후처리·팝업 콜백 함수 | `$c.sbm.executeDynamic` 을 호출하는 통신 실행 함수(`scwin.searchList` 등 — 2026-09-01 확정), `scwin.sbm_{업무명}_submitdone`, `scwin.*_submiterror`, `scwin.popupCallback` — 이름 패턴·`submitDoneHandler` 옵션 참조·본문 `executeDynamic` 호출로 자동 분류 |
| 5 | **일반/업무 함수 영역** | 비즈니스 로직·데이터 가공·유효성 검사 | `scwin.validateInput`, `scwin.calcFee` 등 (통신하지 않는 함수) |

- 비어 있는 영역의 헤더는 생략한다(도구 동작 동일).
- 헤더 텍스트(번호·명칭)는 도구의 멱등 판정 기준이므로 임의 변형하지 않는다.
- **`scwin.vScrenID` 관련 코드는 사용하지 않으므로 삭제한다**(선언·대입·참조 모두 제거 — 규칙 1, 2026-09-02 확정).
  화면 ID 가 필요한 곳은 `$p.getFrameId()` 등 런타임 API 를 사용한다.

## 명명 규칙

- **일반/업무 함수는 camelCase** — `scwin.searchList`, `scwin.calcFee`. `fn_` 접두는 **사용하지 않는다**
  (변환 규칙 13이 레거시 `scwin.fn_*`를 camelCase 로 정규화하며, gcc 라이브러리·기존 변환 302파일과 일관).
- 이벤트: `scwin.{컴포넌트ID}_{이벤트명 소문자}` (규칙 3).
- 서브미션 콜백: `scwin.sbm_{업무명}_submitdone` / `_submiterror`, 팝업 콜백: `scwin.popupCallback` 계열.

## 주석 규칙

- **라인 주석은 `// `(슬래시 2개 + 공백 1개)로 시작**한다 — `//주석`(X) → `// 주석`(O). 주석 처리한 코드도 동일하게 `// scwin.foo();` 형태로 쓴다. (2026-09-01 확정)
- **예외(형식 그대로 유지)**: 섹션 헤더(`/////////`)·구분선(`//----`, `//====`, `//****` 등)·W-Craft 마커(`//----W-Craft`)처럼 `//` 뒤가 기호로 이어지는 장식/마커 주석.
- 변환 도구가 자동 적용한다(convert.py 포매팅 단계 `format_comment_space` — 문자열 내부 보호·멱등).

## 서브미션 — async/await 순차 실행 우선

통신 코드는 **콜백(submitDoneHandler) 대신 async/await 순차 스타일을 우선**한다.

```javascript
scwin.searchList = async function () {
    const sbmOptions = {
        id : "sbm_selectList",
        action : "/api/x/select-list",
        ref : "dma_req",
        target : "dlt_list=body",
        isProcessMsg : false
        // submitDoneHandler 는 넣지 않는다 — 넘기면 executeDynamic 의 Promise 가 settle 되지 않음
    };
    const sbmRtn = await $c.sbm.executeDynamic(sbmOptions);
    // 응답 후처리 (sbmRtn = 응답 resObj — responseJSON 등)
    scwin.sbm_selectList_submitdone(sbmRtn); // 후처리가 크면 4구역 콜백 함수로 분리해 호출
};
```

- **배치**: `$c.sbm.executeDynamic` 을 호출하는 통신 실행 함수는 **4구역(서브미션 콜백 영역)** 에 배치한다(2026-09-01 확정).
  `ev:on*` 에 연결된 이벤트 핸들러가 직접 호출하는 경우는 예외 — 3구역을 우선한다.
- **원리**: `$c.sbm.executeDynamic` 은 `submitDoneHandler` 가 **비어 있을 때만** Promise 가 응답(resObj)으로 resolve 된다
  (오류 시 reject — 필요하면 try-catch). 옵션에 핸들러를 넘기면 Promise 는 pending 으로 남는 콜백 전용 모드다.
- `await` 를 쓰는 함수는 `async function` 으로 선언한다(변환 도구가 자동 부여). **async 로 바뀐 함수를 호출하는 쪽**에서
  순차 보장이 필요하면 `await` 를 전파한다(단계 2 검토 항목).
- **콜백 스타일 유지 예외**: `submitErrorHandler` 기반 오류 흐름, 의도적 비동기(응답을 기다리지 않는 발사 후 망각),
  기존 변환분(소급 없음)은 콜백 스타일을 유지해도 된다. gridview 스피너·메시지 등 gcc 부가 기능은 훅 기반이라 두 스타일 모두 동작.

## 오류 처리 — 진입점 try/catch + `$c.exception.handleError`

예외는 **사용자 액션 진입점(3구역 이벤트 핸들러·`onpageload`)에서만** try/catch 로 받고, catch 는 공통 처리기 한 줄로 통일한다.
내부 업무 함수(4·5구역)는 예외를 삼키지 말고 위로 전파한다 — **자체 try/catch·빈 catch 금지**.

```javascript
scwin.btn_save_onclick = async function (e) {
    try {
        await scwin.save();
    } catch (ex) {
        await $c.exception.handleError(ex, { context : "ULDXXX00100.save" });
    }
};
```

- **handleError 분류 규약** (이미 처리된 예외는 조용히 지나가므로 이중 알림이 없다):
  - `ex.skipped === true` (sbm 중복 제출 skip/abort) → 완전 무시
  - `ex.errorType` 보유 (sbm 이 이미 사용자에게 알린 통신 오류) → 콘솔 로그·수집만
  - `ex.bizMessage` 보유 (업무 예외) → 해당 문구로 alert
  - 그 외 시스템 예외 → 기본 문구("처리 중 오류가 발생했습니다.")로 error 알림
- **업무 중단 예외**는 `throw { bizMessage : "재고가 부족합니다." };` 표준 형태로 던진다(문구는 공통 메시지 ID 가능).
  단순 검증 실패는 예외가 아니라 `return false`/조기 return 으로 처리한다.
- 옵션: `message`(문구/메시지 ID) · `notify`("error" 기본 | "alert" | "toast" | "none") · `context`("화면ID.함수명" 권장) ·
  `rethrow`(상위 흐름 중단) · `callback`(알림 닫힘 후 콜백 함수명).
- **금지**: 빈 catch, catch 에서 원시 `alert()`·`console.log` 만 남기고 종료, 통신 오류 재-alert(sbm 이 이미 알림).
- 변환 도구가 자동 적용한다(convert.py **규칙 26** — 규칙 4 섹션 기준 2·3구역 진입점 래핑, 본문에 `try` 가 이미 있으면 보존·멱등).
- 오류 수집: `handleError` 가 내부 훅(`reportError`)을 호출한다 — 수집 로직(표준 페이로드·중복 억제·화면당 상한·sendBeacon 전송)은 구현돼 있고,
  `exception.xml` 의 `ERROR_REPORT_INFO.URL` 이 비어 있는 동안 비활성이다. 수집 API 신설 시 **URL 한 곳만 지정**하면 전 화면에 적용된다.
- 상세 사용법·sbm 관계·배포 설정(config.xml 등록): [exception-handling-guide.md](../exception-handling-guide.md)

## 팝업 호출 — 타입별 데이터 수신 방식

`$c.win.openPopup` 으로 팝업을 열고 호출원 화면으로 데이터를 리턴받을 때는 **`options.type` 별 수신 방식**을 준수한다. (2026-09-01 확정)

```javascript
// pageFramePopup — async/await 로 리턴값을 동기 수신
const resultData = await $c.win.openPopup("/ui/samplePopup.xml", { type : "pageFramePopup", ... }, data);

// browserPopup — options.callbackFn 콜백으로 비동기 수신 (await 미사용)
$c.win.openPopup("/ui/samplePopup.xml", { type : "browserPopup", callbackFn : "scwin.popupCallback", ... });
scwin.popupCallback = function (resultData) { /* 리턴 데이터 처리 */ };
```

- `data`(3번째 인자) 페이로드 전달은 **pageFramePopup 전용** — browserPopup 은 콜백/부모 접근 공통함수(`getOpenerScope`/`callOpener`)로 대체한다.
- 변환 도구가 자동 적용한다(convert.py **규칙 17** — 팝업 타입별 수신 형태로 산출, [createdialogframe_popup_guide.md](../../conversion/md/createdialogframe_popup_guide.md) §1b).

## 반복문 내 Map/List 데이터 수정 시 UI 갱신 제어

반복문(for/while/forEach) 안에서 dataMap/dataList 를 반복 변경하면 매 변경마다 UI 갱신이 발생해 성능 저하·화면 깜빡임이 생긴다.
**반복 시작 전 `{DC}.setBroadcast(false);` 로 갱신을 중단하고, 종료 후 `{DC}.setBroadcast(true, true);` 로 누적 변경을 일괄 반영**한다. (2026-09-01 확정)

```javascript
dlt_list.setBroadcast(false);                 // 1. 반복 시작 전: UI 갱신 중단
dlt_list.forEach(function (item) {
    item.set("status", "processed");          // 2. 데이터 반복 수정
});
dlt_list.setBroadcast(true, true);            // 3. 반복 종료 후: 일괄 갱신 반영
```

- 루프 본문에서 조기 이탈(`return`/`throw`)할 수 있으면 복원 누락으로 화면이 갱신되지 않으므로 try/finally 등으로 복원을 보장한다.
- 변환 도구가 자동 적용한다(convert.py **규칙 28** — 본문 `return`/`throw` 시 보류·리포트, 멱등).

## 이벤트-로직 분리 (Thin Event, 권장)

컴포넌트 이벤트 핸들러(3구역)에는 파라미터 수집과 일반 함수 호출만 두고, 비즈니스 로직은 5구역 함수로 분리한다.

```javascript
scwin.btn_search_onclick = function () {
    scwin.searchList(dma_req.getJSON());
};
```

- 자동 변환(결정적 치환) 대상이 아니다 — **신규 작성·대규모 수정 화면에 적용**하고, 기존 핸들러의 로직 추출은
  동작 변경 위험이 있어 리뷰 판단으로만 수행한다.

## 도구 연동 (convert.py)

| 규칙 | 담당 |
|------|------|
| 규칙 1 | `vScrenID` 관련 코드(선언·대입·참조) **삭제** — 미사용 (2026-09-02 변경, 종전 "1구역 이동") |
| 규칙 2 | 리터럴 전역을 1구역으로 모으고 헤더 삽입 |
| 규칙 4 | 함수를 2~5구역으로 분류·재배치, 슬래시 섹션 헤더 삽입, 구(舊) 형식(한 줄 주석·3줄 블록 헤더) 마이그레이션 (멱등) |
| 규칙 6·12·16 | 서브미션을 await 순차 스타일로 생성(핸들러 정의 존재 시 직접 호출 연결, 부재 시 `// TODO Stage2`) |
| async 부여 | await 포함 함수에 `async` 자동 삽입 + 호출부 await 전파 검토 리포트 |

상세: [conversion_rules.md](../../conversion/md/conversion_rules.md) §규칙 4·6, [conversion_pipeline.md](../../conversion/md/conversion_pipeline.md)
