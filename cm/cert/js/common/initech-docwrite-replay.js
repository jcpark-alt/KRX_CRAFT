/**
 * 벤더 스크립트의 document.write 재생 (2/2 — 대상 벤더 스크립트 바로 뒤에 로드, 짝은 initech-docwrite-capture.js).
 *
 * 캡처가 큐에 담은 <script src> 를 기록 순서대로 동기 XHR 로 받아 인라인 script 로 실행한다.
 * 실행 중인 스크립트가 다시 document.write 를 부르면(예: exinterface.js → exproto_ext_daemon.js) 그 요청들을 모아
 * 남은 큐의 **앞**에 끼워 넣는다 — 원래 파서가 현재 스크립트 직후에 삽입하던 순서와 같다(뒤에 붙이면 crosswebexInit 보다
 * 늦게 실행되어 순서가 뒤바뀐다). 큐가 비면 document.write 를 원본으로 되돌리고 캡처를 해제한다.
 *
 * 동기 XHR 은 메인 스레드에서 deprecated 경고가 나지만 허용되며, 앱 기동 시 1회(같은 출처 벤더 파일 수 개)만 수행한다.
 * 실패한 파일은 console.error 로 남기고 다음 파일을 계속 진행한다(부분 로드 상태를 숨기지 않기 위함).
 */
(function (w, d) {
    "use strict";

    const state = w.__initechDocWrite;

    if (!state || !state.installed) {
        return;
    }

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

    while (state.queue.length > 0) {
        const url = state.queue.shift();
        const nested = [];

        state.sink = nested;   // 이 스크립트가 부르는 document.write 는 nested 로 모은다

        try {
            runInline(url, fetchSync(url));
            state.loaded.push(url);
        } catch (e) {
            state.failed.push(url);
            console.error("[initech-docwrite-replay] 벤더 하위 스크립트 로드 실패 : " + url, e);
        }

        state.sink = state.queue;
        if (nested.length > 0) {
            state.queue = nested.concat(state.queue);   // 현재 스크립트 직후에 끼워 넣는다
            state.sink = state.queue;
        }
    }

    d.write = state.original;
    state.installed = false;
})(window, document);
