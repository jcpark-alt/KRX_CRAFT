# resources — 공동인증서(이니텍 INISAFE Sign) · 라온 가상키보드(TransKey) 정적 리소스

백엔드 정적 폴더(`src/main/resources/static/resources`)의 사본이며 배포 URL 은 **`/resources/**`** 다. 폴더명·URL 은 원본과 같다.
(2026-09-16 에 `cm/cert/` + `/cm/cert/**` 로 옮겨 봤으나, 벤더가 파일 안에 기준 경로를 하드코딩해 업그레이드마다 76건을 재적용해야 하는 비용이 커서
같은 날 되돌렸다. 벤더 파일은 경로 면에서 원본 그대로이고, 저장소 폴더와 배포 URL 의 1:1 원칙은 우리 파일(`cm/**`)에만 적용한다.)
WebSquare 화면에서는 이 폴더의 스크립트를 직접 쓰지 않고 gcc 공통 **`$c.cert`**(`cm/gcc/cert.xml`)를 통해 호출한다.

> 여기서 고친 파일은 백엔드 정적 폴더에 복사해야 배포에 반영된다. 벤더 패키지를 업그레이드하면 §5 의 `[KRX 수정]` 목록을 재적용한다.

## 1. 폴더 구성

| 경로 | 내용 | 출처 |
|---|---|---|
| `js/common/initech-shell-guard.js` | 셸 보정 1파일: 전역 `Promise` 네이티브 고정(bluebird 덮어쓰기 차단) + 벤더 `document.write` 캡처·자동 동기 재생 (§4) | 프로젝트 |
| `js/common/initech-common.js` | 전자서명 호출 래퍼 `fnInitechAuth` / `fnInitechAuthWithParams`(FormData POST, 2xx 콜백) | 프로젝트 |
| `js/common/raon-transkey-common.js` | 라온 키패드용 공통 래퍼 | 프로젝트 |
| `js/lib/jquery-4.0.0.min.js` | 정적 HTML 샘플 전용 jQuery(WebSquare 셸에서는 로드하지 않음 — §3) | 라이브러리 |
| `sample/initech-cert-sample.html`, `initech-cert-sample2.html` | WebSquare 없이 연동을 확인하는 정적 HTML 샘플 | 프로젝트 |
| `sample/startbootstrap-sb-admin-gh-pages/` | 샘플 화면용 부트스트랩 템플릿 | 라이브러리 |
| `vendor/transkey/` | 라온 TransKey(`transkey_config.js`·`transkey.js`·`transkey.css`, jsbn·rsa 라이브러리) | 벤더 |
| `vendor/SW/initech/extension/` | 이니텍 CrossWeb EX(`crosswebex6.js`·`crosswebexInit.js`·`cw_web6_adt.js`, `common/`, 설치 파일 `down/`) | 벤더 |
| `vendor/SW/initech/webui/` | 이니텍 인증서 UI(cwui)·설정(`conf/customerConf.json`)·크로스도메인 저장소 iframe(`crossd_iframe.html`) | 벤더 |

## 2. WebSquare 셸 로드 순서 (`websquare/config.xml` · `config.js` `<engine><module>`)

```
initech-shell-guard.js          ← 벤더 그룹 맨 앞에 1회
transkey_config.js → transkey.js
crosswebex6.js?dt=…
initech-common.js
(stylesheet earlyImportList: /resources/vendor/transkey/transkey.css)
```

이 순서는 아래 §4 의 세 가지 함정을 피하기 위한 것이며 **바꾸면 안 된다.** 벤더 스크립트는 셸에서 한 번만 정적으로 로드하고, 화면(`$c.cert`)은 동적 로드를 하지 않는다 — `crosswebex6.js` 가 로드 즉시 `document.write` 로 하위 스크립트를 끌어오기 때문에 화면에서 동적 주입하면 하위 파일이 빠진다.

## 3. jQuery 정책

벤더 코드(`initech-common.js` 의 `$.ajax`, `crosswebex6.js` 의 `($ || jQuery).ajax`·`$("#ajax").remove()`, `transkey.js` 의 `offset()`)가 쓰는 jQuery API 는 1.9+ 어느 버전에서든 동작한다(`xhr.responseJSON` 은 1.9+). WebSquare 셸에는 gcc(`win.xml`·`data.xml`)가 이미 의존하는 전역 jQuery 가 있으므로 **jQuery 4 를 추가 등록하지 않는다.** jQuery 4 는 `isFunction`·`isArray`·`parseJSON`·`trim` 등을 제거해 레거시 fil/ins 화면을 깨뜨릴 수 있다. `js/lib/jquery-4.0.0.min.js` 는 정적 HTML 샘플 전용이다.

## 4. 셸 연동에서 만난 문제와 해결 (2026-09-16)

### 4.1 `TypeError: Promise.allSettled is not a function` — 메인 레이아웃 진입 실패
- **원인**: `crosswebex6.js` 가 비동기로 끌어오는 `bluebird-3.5.0` 이 `window.Promise` 를 자기 구현으로 덮어쓴다. bluebird 에는 `allSettled`/`any` 가 없는데 WebSquare 엔진은 프로젝트 공통 로드에서 `Promise.allSettled`(14곳)·`Promise.any`(3곳)를 쓴다.
- **해결**: `initech-shell-guard.js` §1 — 전역 `Promise` 를 접근자 속성으로 바꿔 네이티브를 고정하고 덮어쓰기 대입은 예외 없이 무시(`window.__replacedPromise` 에 보관). 이니텍 코드가 실제로 쓰는 것은 `new Promise`/`Promise.all`/`Promise.resolve` 뿐이라 네이티브로 동작한다.
- **회귀**: `test/initechShellGuard.test.js`(실제 bluebird 번들로 재현).

### 4.2 `SyntaxError: "[object Object]" is not valid JSON` — 인증서 iframe 클릭마다 발생
- **원인**: WebSquare 엔진이 iframe 클릭·마우스다운·키업 전파용 `{_wq_type: …}` 객체를 모든 iframe 에 postMessage 하는데, 이니텍 `webui/crossd_iframe.html` 의 핸들러는 출처만 검증하고 모든 메시지를 JSON 문자열로 가정해 `JSON.parse` 한다. 동작은 깨지지 않는 콘솔 노이즈.
- **해결**: 문자열이 아닌 메시지는 무시, JSON 이 아닌 문자열은 try/catch 로 무시(`[KRX 수정 2026-09-16]` 주석, CRLF 유지).

### 4.3 `ReferenceError: cwGetModuleInstallStatus is not defined` — 인증서 팝업 열기 실패
- **원인**: 정의처 `crosswebexInit.js` 는 `crosswebex6.js` 가 `document.write("<script src=…>")` 로 끌어오는 하위 5파일 중 하나다. WebSquare 엔진은 engine 모듈을 **비동기 외부 스크립트**로 로드하므로 브라우저가 그 `document.write` 를 무시한다("A call to document.write() from an asynchronously-loaded external script was ignored"). `transkey.js` 도 SHA2 기본 설정(`useSha2 = true`)에서 jsbn 을 같은 방식으로 로드한다. `$c.cert.initModule` 이 조용히 실패하던 원인도 동일.
- **해결**: `initech-shell-guard.js` §2 — `document.write` 를 가로채 `<script src>` 를 큐에 담고, 그 스크립트가 끝난 직후(마이크로태스크, 엔진이 다음 모듈을 비동기로 로드하기 전)에 동기 XHR 로 받아 인라인 script 로 기록 순서대로 실행한다. 중첩 쓰기는 파서 의미대로 현재 스크립트 직후에 삽입. 가로채기는 세션 내내 유지(엔진·gcc 는 `document.write` 를 쓰지 않음). 정적 목록 등록 대신 이 방식을 택한 이유는 벤더의 조건부 로직(데몬 모드일 때만 `exproto_ext_daemon.js`, SHA2, IE8/9 json2)을 보존하고 하위 파일 목록을 하드코딩하지 않기 위해서다.
- **회귀**: `test/initechShellGuard.test.js`(순서·중첩 직후 삽입·연속 벤더·실패 건너뜀·비스크립트 무시·멱등).
- **확인**: 브라우저 콘솔에서 `window.__initechDocWrite.loaded` / `.failed`. 동기 XHR deprecation 경고는 정상이며 기동 시 1회.

## 5. 프로젝트가 손댄 벤더·공통 파일 (`[KRX 수정]` — 업그레이드 시 재적용)

| 파일 | 변경 |
|---|---|
| `js/common/initech-common.js` | `window.onload` 초기화 블록·토스트·`initechLoad` 제거 — 매 페이지 로드마다 토스트가 뜨고 다른 onload 핸들러를 덮어쓰던 문제. 초기화는 `$c.cert.initModule` 이 유일한 지점 |
| `vendor/SW/initech/webui/crossd_iframe.html` | §4.2 메시지 가드 |
| `sample/initech-cert-sample2.html` | 등록 API 주석 정합(업무 API `/info/cert/insert`)·콜백 담당자 필드·오타·전화번호/이메일 형식 검증 |

정적 HTML 샘플 2종은 onload 블록 제거로 자동 초기화를 잃었다. 계속 쓰려면 ready 핸들러에서 `cwModuleInstallWaitWithNoPopup` 을 직접 한 번 호출한다.

## 6. 화면에서 쓰는 법

`cm/conversion/sample-front/ui/SMPCRT10000.xml`(가이드 샘플)과 `cm/gcc/cert.xml` 머리 주석을 기준으로 한다.

```js
await $c.cert.loadModule({ onStatus : function (msg, done) { /* 진행 안내 */ } });   // onpageload 에서 1회
await $c.cert.auth(url, callback, { params : dma_chrgInfo.getJSON(), useTranskey : true });
```

- 콜백은 서버 2xx 에서만 호출된다. 4xx/5xx·팝업 취소는 벤더 알림창(INI_ALERT)만 뜨고 콜백이 오지 않으므로 **콜백을 Promise 로 감싸 기다리지 않는다**(영구 pending).
- 통신은 벤더의 `$.ajax`(FormData) 라 `$c.sbm` 을 타지 않는다. API 경로의 프리픽스(`app.api.prefix`)를 바꾸면 벤더 스크립트의 하드코딩 경로도 함께 고친다.
- 가상키보드 사용 여부는 `auth` 의 `useTranskey` 옵션이 팝업 직전에 `cwui_conf` 에 반영한다. 첫 팝업의 키패드 선택은 이니텍 UI 가 캐시하므로 팝업을 연 뒤 바꾸면 새로고침이 필요하다.

## 6a. 로컬 에이전트 포트 탐색 — `securePortScan`

개발자 도구 Network 탭에 `127.0.0.1:4441~4445` 로 가는 요청이 여러 건 보이고 일부가 `ERR_CONNECTION_REFUSED` 로 찍히는 것은
이니텍 CrossWeb EX 가 **PC 에 설치된 로컬 에이전트(데몬)를 찾는 정상 동작**이다. 서버 API 가 아니라 브라우저에서 사용자 PC 로 직접
보내는 요청이므로 WebtoB·백엔드 라우팅과 무관하고, `/resources/**` 경로 변경의 영향도 받지 않는다.
코드: `vendor/SW/initech/extension/common/js/exproto_ext_daemon.js` 의 `dmPortCheckStart`(472~479행 부근).

| 채널 | URL | 비고 |
|---|---|---|
| HTTPS | `https://127.0.0.1:{포트}?securePortScan{타임스탬프}={lic_domain}` | 기본. 쿼리 키 뒤에 현재 시각을 붙여 캐시를 피하고, 값으로 라이선스 도메인 토큰을 보낸다 |
| WebSocket | `wss://127.0.0.1:{포트}/securePortScan` | `localhost` 설정이 `wss://` 로 시작할 때. 연결이 열리면 `securePortScan={lic_domain}` 을 메시지로 다시 보낸다 |

- **호스트**: `common/exinterface.js` 가 데몬 모드일 때 `https://127.0.0.1`(Mac 은 `https://localhost`)로 설정.
- **포트**: `exEdgeInfo.edgeStartPort`(4441)부터 `portChkCnt`(5)개 — 4441~4445 를 100ms 간격으로 차례로 시도.
- **lic_domain**: `exinterface.js` 의 라이선스 도메인 암호문. `crosswebexInit.js` 가 정책(`crosswebexPolicy.lic_domain`)이 있으면 덮어쓴다. 에이전트는 이 값으로 현재 사이트가 라이선스된 도메인인지 확인한다.

동작 흐름:
1. `sessionStorage` 의 `crosswebex_wsport` 에 이미 찾아 둔 포트가 있으면 탐색을 건너뛰고 바로 통신한다.
2. 없으면 포트마다 위 URL 로 요청한다. 응답 코드 200 이면 그 포트를 `crosswebex_wsport` 에 저장하고 곧바로 `GetVersion` 요청(`sendWS`)으로 에이전트 버전을 확인한다.
3. 응답 코드 400 이면 라이선스 도메인 불일치로 판단해 경고창(`C_W_033`)을 한 번 띄운다.
4. 5개 포트가 모두 실패하면 `setDaemonStatus(…, false, true)` 로 "에이전트 미설치" 상태가 되어 설치 안내 흐름으로 넘어간다.

점검 포인트:
- 탐색 요청이 **아예 보이지 않으면** `exproto_ext_daemon.js` 가 로드되지 않은 것이다. 이 파일은 데몬 모드일 때 `exinterface.js` 가 `document.write` 로 끌어오므로 `initech-shell-guard.js` 의 재생(§4.3)이 먼저 동작해야 한다 — `window.__initechDocWrite.loaded` 에 포함됐는지 확인.
- 다섯 포트가 **전부 실패**하면 에이전트 미설치·미실행이거나 방화벽/보안 프로그램이 로컬 포트를 막는 경우다.
- **400 경고**가 뜨면 라이선스 도메인과 접속 도메인이 다른 것이다(개발용 호스트명 등). `lic_domain` 정책을 확인한다.
- 포트를 바꾼 뒤 탐색이 계속 옛 포트로 가면 `sessionStorage` 의 `crosswebex_wsport` 를 지운다.

## 7. 배포 체크리스트

1. 백엔드 정적 매핑은 원본 그대로 `/resources/**` 다(변경 불필요).
2. `js/common/*.js`, `crossd_iframe.html` 등 §5 의 수정 파일을 백엔드 정적 폴더에 복사한다.
3. 셸에서 확인: 메인 레이아웃 진입 시 콘솔 오류 없음 → `typeof Promise.allSettled === "function"`, `window.__replacedPromise.version === "3.5.0"`, `window.__initechDocWrite.failed.length === 0` → 인증서 팝업 열림·설치 상태 확인 → 전자서명 후 2xx 콜백 수신.
4. 설치 안내 페이지(`extension/install/install.html`)도 열리는지 확인한다.

## 8. 검증 명령

```
npm test                      # Jest — initechShellGuard·cert 회귀 포함
npm run lint                  # ESLint — resources/** 는 ignore(벤더 번들), jest coverage 도 !resources/**
npm run lint:xml              # WebSquare XML lint (gcc 13 files 0/0 · legacy 227 files 0/0)
```

## 9. 이력

| 일자 | 커밋 | 내용 |
|---|---|---|
| 2026-09-15 | `bcd1d06` | `cm/gcc/cert.xml`(`$c.cert`) 신설, SMPCRT10000 가이드 샘플, `$c.util` DOM 로더·웹스토리지 보강 |
| 2026-09-16 | `ccc7cc8` | 루트 `resources/` 를 `cm/cert/` 로 반입, `initech-common.js` onload 블록 제거, 샘플2 수정 4건 |
| 2026-09-16 | `5166689` | 배포 경로 `/resources/**` → `/cm/cert/**` 통일(14파일 76건) — 이후 되돌림 |
| 2026-09-16 | `6c8a807` | `promise-guard.js` — bluebird 전역 Promise 덮어쓰기 차단 (§4.1, 이후 shell-guard 로 병합) |
| 2026-09-16 | `6eba4b8` | `crossd_iframe.html` 메시지 가드 (§4.2) |
| 2026-09-16 | `45abc9d` | `initech-docwrite-capture/replay.js` — 벤더 document.write 캡처·동기 재생 (§4.3, 이후 shell-guard 로 병합) |
| 2026-09-16 | `8a4d452` | 위 3파일을 `initech-shell-guard.js` 1파일로 병합(재생을 스크립트 종료 직후 마이크로태스크로 자동화), 테스트 통합 |
| 2026-09-16 | (미커밋) | 폴더를 루트 `resources/` 로, 배포 URL 을 `/resources/**` 로 원복 — 벤더 파일 경로 수정 76건 제거(업그레이드 시 재적용 불필요) |
