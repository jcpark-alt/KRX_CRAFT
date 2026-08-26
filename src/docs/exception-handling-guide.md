# 화면 예외 처리 가이드 (`$c.exception.handleError`)

업무 화면 스크립트의 try/catch 오류 처리를 공통 함수 한 줄로 표준화하는 방법을 정리한다. (2026-08-26 도입)
담당 모듈은 `src/gcc/exception.xml`(`$c.exception`) — 처리기 `handleError`(공개)와 수집 훅 `__reportError`(내부)로 구성된다.

도입 전에는 화면마다 처리 방식이 제각각이었다: 빈 catch(오류 은폐), 원시 `alert()`(문구·로그 비표준),
미처리 reject(await 실패 시 화면이 조용히 멈춤). 이 가이드의 패턴을 따르면 세 문제가 모두 해소된다.

## 표준 사용법

**try/catch 는 사용자 액션 진입점(3구역 이벤트 핸들러·`onpageload`)에만** 두고, catch 는 아래 한 줄로 통일한다.
내부 업무 함수(4·5구역)는 자체 try/catch 없이 예외를 위로 전파한다 — **빈 catch 금지**.

```javascript
scwin.btn_save_onclick = async function (e) {
    try {
        await scwin.save();
    } catch (ex) {
        await $c.exception.handleError(ex, { context : "ULDXXX00100.save" });
    }
};
```

- `context` 는 `"화면ID.함수명"` 형식을 권장한다 — 콘솔 로그와 서버 수집의 식별자로 쓰인다.
- 적용 예시는 샘플 `SMPVAL10000`(`src/conversion/sample-front/ui/`)의 `onpageload`·`btn_save_onclick` 참고.

## 예외 분류 규약 — 이중 알림은 자동으로 방지된다

handleError 는 받은 예외를 아래 순서로 분류하므로, 화면 코드는 예외 종류를 신경 쓸 필요가 없다.

| 예외 형태 | 의미 | 처리 |
|-----------|------|------|
| `ex.skipped === true` | sbm 중복 제출 skip/abort (정상 흐름) | 완전 무시 (로그·수집·알림 없음) |
| `ex.errorType` 보유 | sbm 이 이미 사용자에게 알린 통신 오류 | 콘솔 로그·수집만 (알림 생략) |
| `ex.bizMessage` 보유 | 업무 중단 예외 | `console.warn` + 해당 문구로 alert |
| 그 외 (`Error` 등) | 시스템 예외 | `console.error` + 기본 문구로 error 알림 |

같은 예외 객체가 공통 계층(sbm)과 화면 catch 에서 두 번 handleError 를 거쳐도
`_errorReported` 마킹으로 **서버 수집은 1회만** 수행된다.

## 업무 중단 예외 (`bizMessage`)

업무 로직에서 흐름을 끊고 사용자에게 문구를 보여야 할 때는 표준 형태로 던진다.

```javascript
if (stockQty < reqQty) {
    throw { bizMessage : "재고가 부족합니다." };   // 문구 대신 공통 메시지 ID 도 가능
}
```

단순 검증 실패는 예외가 아니라 `return false`/조기 return 으로 처리한다(예외는 "흐름 중단"에만).

## 옵션

```javascript
await $c.exception.handleError(ex, {
    message : "조회에 실패했습니다.",   // 사용자 문구 또는 공통 메시지 ID (기본 "처리 중 오류가 발생했습니다.")
    notify  : "toast",                  // "error"(기본) | "alert" | "toast" | "none" — 명시 시 자동 분류보다 우선
    context : "ULDXXX00100.search",     // 로그·수집 식별자
    rethrow : true,                     // 처리 후 재-throw 로 상위 흐름 중단 (기본 false)
    callback: "scwin.afterErrorClose"   // 알림 창 닫힘 후 콜백 함수명
});
```

## sbm 통신 오류와의 관계

- 통신 오류(연결 불가·500)의 **사용자 알림은 `$c.sbm`(resultMsg)이 담당**한다 — handleError 로 재-alert 하지 않는다(분류 규약이 자동으로 걸러준다).
- sbm 은 같은 오류를 `handleError(notify:"none", context:"sbm.<id>")` 로 호출해 **로그·수집에만 합류**시킨다.
- `await $c.sbm.executeDynamic(...)` 은 통신 실패 시 `errorType` 표식이 있는 응답 객체로 reject 되므로, 진입점 catch 의 handleError 가 조용히 걸러 이중 알림이 없다. 중복 제출로 건너뛴 호출(`skipped`)도 마찬가지다.

## 서버 오류 수집 (`__reportError`)

수집 로직(표준 페이로드·중복 억제·화면당 상한)은 구현돼 있고, `exception.xml` 의 설정이 비어 있는 동안 **비활성**이다.

```javascript
scwin.ERROR_REPORT_INFO = {
    URL: "",                 // 수집 API 신설 시 지정 — 예: "/api/common/error-report"
    MAX_PER_PAGE: 10,        // 화면당 최대 전송 건수 (오류 폭주 시 서버 보호)
    MAX_STACK_LENGTH: 4000   // 스택 절단 길이
};
```

- **URL 한 곳만 지정하면** handleError 를 쓰는 전 화면(화면 예외 + 통신 오류)에 수집이 활성화된다.
- 페이로드: frameId · context · 예외명/메시지/스택(절단) · 화면 URL · userAgent · 발생 시각(ISO).
- 전송은 `navigator.sendBeacon`(폴백 `fetch keepalive`)로 **`$c.sbm` 을 경유하지 않는다** — 수집 요청 실패가 resultMsg 사용자 알림 파이프라인을 다시 타는 부작용을 차단하기 위함(발사 후 망각).

## 배포 설정 (필수)

`$c.exception` 은 배포 환경 WebSquare `config.xml` 에 공통 모듈로 등록되어야 로드된다(저장소에는 config.xml 없음).
**등록 없이 배포되면 화면에서 `$c.exception` 이 undefined** 가 되므로 반드시 함께 반영한다.

```xml
<projectCommon>
    <module name="$c.exception" src="/cm/gcc/exception.xml"/>
</projectCommon>
```

## 주의 — `$c.util.isEmpty` 와 Error 객체

`$c.util.isEmpty` 는 열거 가능한 키가 없는 `Error` 인스턴스를 "빈 객체"로 판정한다(`Object.keys` 검사).
예외 유무 판단에 isEmpty 를 쓰면 Error 가 조용히 삼켜지므로 **명시적 null 체크**를 사용한다(handleError 내부도 동일).

## 관련 문서

- 규약: [code-convention.md §오류 처리](code-convention/code-convention.md) — 5단계 구조에서의 배치 규칙
- API 명세: [api/gcc/index.html](api/gcc/index.html) (`$c.exception` 모듈, `npm run docs:gcc` 자동 생성)
- 도입 이력: [gcc_update_history.md](gcc_update_history.md) 2026-08-26 항목(a00ab33 ~ 57de52d), 작업 보고서 `작업확인/예외처리_작업내역_20260826.html`
- 회귀 테스트: `test/handleError.test.js`(처리기·수집 훅) · `test/sbmErrorFlow.test.js`(sbm 합류)
