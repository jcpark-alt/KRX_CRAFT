/**
 * WebSquare 셸에서 이니텍(INISAFE Sign, crosswebex6)·라온(TransKey) 벤더 스크립트를 config.xml <engine><module> 로
 * 정적 로드할 때 필요한 보정 두 가지를 한 파일에 모았다. **벤더 그룹 맨 앞(transkey_config.js 보다 먼저)에 1회 로드한다.**
 *
 * 1. 전역 Promise 보호
 *    crosswebex6.js 가 비동기로 끌어오는 bluebird-3.5.0 브라우저 번들은 window.Promise 를 자기 구현으로 덮어쓴다.
 *    bluebird 에는 Promise.allSettled / Promise.any 가 없어서 WebSquare 엔진의 프로젝트 공통 로드
 *    (_loadWebSquareCommon → Promise.allSettled)가 "TypeError: Promise.allSettled is not a function" 으로 실패한다.
 *    이니텍 코드가 실제로 쓰는 API 는 new Promise / Promise.all / Promise.resolve 뿐이라 네이티브로 그대로 동작하므로,
 *    전역 Promise 를 접근자 속성으로 바꿔 네이티브를 고정하고 덮어쓰기 대입은 예외 없이 무시한다(window.__replacedPromise 에 보관).
 *
 * 2. document.write 캡처 + 자동 재생
 *    transkey.js(SHA2 분기의 jsbn)와 crosswebex6.js(cw_web6_adt · exproto · exinstall · exinterface · crosswebexInit,
 *    IE8/9 는 json2)는 로드 직후 document.write("<script src='…'>") 로 하위 스크립트를 끌어오고, exinterface.js 도
 *    데몬 모드면 exproto_ext_daemon.js 를 같은 방식으로 추가한다. 엔진은 engine 모듈을 비동기 외부 스크립트로 로드하므로
 *    브라우저가 이 document.write 를 무시하고("A call to document.write() from an asynchronously-loaded external script
 *    was ignored"), crosswebexInit.js 가 없어 인증서 팝업에서 "cwGetModuleInstallStatus is not defined" 가 난다.
 *    document.write 를 가로채 <script src> 를 큐에 담고, 그 스크립트가 끝난 직후(마이크로태스크)에 큐를 기록 순서대로
 *    동기 XHR + 인라인 script 로 실행한다 — 원래 파서가 현재 스크립트 직후에 삽입하던 순서와 같고, 엔진이 다음 모듈을
 *    비동기로 로드하기 전에 끝난다. 재생 중 스크립트가 다시 document.write 를 부르면(exinterface → exproto_ext_daemon)
 *    남은 큐의 앞에 끼워 넣는다. 벤더의 조건부 로직(데몬 모드·SHA2·IE 분기)이 그대로 살고 하위 파일 목록을 하드코딩하지 않는다.
 *    가로채기는 세션 내내 유지한다(WebSquare 엔진·gcc 는 document.write 를 쓰지 않음). <script src> 가 아닌
 *    document.write 는 실행하지 않고 진단 목록(ignored)에만 남긴다 — 문서 로드 후의 원본 document.write 는 페이지를 지운다.
 *
 * 확인: 콘솔에서 typeof Promise.allSettled === "function", window.__replacedPromise.version === "3.5.0",
 *       window.__initechDocWrite.loaded / .failed. 동기 XHR deprecation 경고는 정상이며 기동 시 1회.
 */
(function (w, d) {
    "use strict";

    // ─────────────────────────────────────────────────────────────────────────
    // 1. 전역 Promise 보호
    // ─────────────────────────────────────────────────────────────────────────
    const nativePromise = w.Promise;

    if (typeof nativePromise === "function" && typeof nativePromise.allSettled === "function") {
        const desc = Object.getOwnPropertyDescriptor(w, "Promise");

        // 이미 접근자로 바꿔 두었으면(중복 로드) 다시 정의하지 않는다.
        if (!desc || typeof desc.get !== "function") {
            Object.defineProperty(w, "Promise", {
                configurable: true,
                enumerable: false,
                get: function () {
                    return nativePromise;
                },
                set: function (replacement) {
                    // bluebird 등 대체 구현의 전역 덮어쓰기는 무시한다. 필요 시 확인용으로만 보관한다.
                    if (replacement !== nativePromise) {
                        w.__replacedPromise = replacement;
                    }
                }
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. document.write 캡처 + 자동 재생
    // ─────────────────────────────────────────────────────────────────────────
    if (w.__initechDocWrite) {
        return; // 중복 로드 방지
    }

    const state = w.__initechDocWrite = {
        original: d.write,   // 원본(네이티브) document.write — 진단·복구용
        queue: [],           // 재생 대기 스크립트 URL (기록 순서 = 실행 순서)
        sink: null,          // 캡처 대상 배열 — 평소에는 queue, 재생 중에는 실행 중 스크립트의 중첩 쓰기 모음
        ignored: [],         // <script src> 가 아닌 document.write 인자 (진단용)
        loaded: [],
        failed: [],
        scheduled: false,
        replaying: false
    };
    state.sink = state.queue;

    function fetchSync(url) {
        const xhr = new XMLHttpRequest();

        xhr.open("GET", url, false);
        xhr.send(null);

        if (xhr.status === 200 || xhr.status === 0) {
            return xhr.responseText;
        }
        throw new Error("HTTP " + xhr.status);
    }

    function runInline(url, code) {
        const el = d.createElement("script");

        el.type = "text/javascript";
        // 디버거에서 원래 파일명으로 보이도록 sourceURL 을 붙인다
        el.text = code + "\n//# sourceURL=" + url;
        d.head.appendChild(el);   // 인라인 script 는 appendChild 시점에 동기 실행된다
    }

    function replay() {
        state.scheduled = false;
        if (state.replaying) {
            return;
        }
        state.replaying = true;

        try {
            while (state.queue.length > 0) {
                const url = state.queue.shift();
                const nested = [];

                state.sink = nested;   // 이 스크립트가 부르는 document.write 는 nested 로 모은다

                try {
                    runInline(url, fetchSync(url));
                    state.loaded.push(url);
                } catch (e) {
                    state.failed.push(url);
                    console.error("[initech-shell-guard] 벤더 하위 스크립트 로드 실패 : " + url, e);
                }

                if (nested.length > 0) {
                    state.queue = nested.concat(state.queue);   // 현재 스크립트 직후에 끼워 넣는다
                }
                state.sink = state.queue;
            }
        } finally {
            state.sink = state.queue;
            state.replaying = false;
        }
    }

    function scheduleReplay() {
        if (state.scheduled || state.replaying) {
            return;
        }
        state.scheduled = true;
        // 현재 실행 중인 벤더 스크립트가 끝난 직후, 엔진이 다음 모듈을 (비동기로) 로드하기 전에 실행된다.
        nativePromise.resolve().then(replay);
    }

    d.write = function (html) {
        const m = /<script\b[^>]*\bsrc\s*=\s*['"]([^'"]+)['"]/i.exec(String(html));

        if (m) {
            state.sink.push(m[1]);
            scheduleReplay();
        } else {
            state.ignored.push(String(html).slice(0, 200));
        }
    };

    state.replay = replay;   // 진단·테스트용 수동 재생
})(window, document);
