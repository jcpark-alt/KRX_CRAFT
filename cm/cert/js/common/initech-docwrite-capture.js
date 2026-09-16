/**
 * 벤더 스크립트의 document.write 캡처 (1/2 — 대상 벤더 스크립트 바로 앞에 로드, 짝은 initech-docwrite-replay.js).
 *
 * 라온 transkey.js(SHA2 분기의 jsbn 스크립트)와 이니텍 crosswebex6.js(cw_web6_adt · exproto · exinstall · exinterface ·
 * crosswebexInit, IE8/9 는 json2)는 로드 직후 document.write("<script src='…'>") 로 하위 스크립트를 끌어오고,
 * exinterface.js 도 데몬 모드면 같은 방식으로 exproto_ext_daemon.js 를 추가한다.
 * WebSquare 엔진은 config.xml <engine><module> 을 비동기 외부 스크립트로 로드하므로 브라우저가 이 document.write 를
 * 무시하고("A call to document.write() from an asynchronously-loaded external script was ignored"),
 * crosswebexInit.js 가 없어 인증서 팝업에서 "cwGetModuleInstallStatus is not defined" 가 난다.
 *
 * 이 파일은 document.write 를 가로채 <script src> 를 큐(state.sink)에 담기만 한다. 실제 로드·실행은 짝인
 * initech-docwrite-replay.js 가 기록 순서대로 동기 수행하고 document.write 를 원복한다. 재생 뒤 다시 로드하면
 * 다음 벤더 스크립트를 위해 캡처를 재장착한다(config 에서 "캡처 → 벤더 → 재생" 쌍을 벤더마다 둔다).
 * 벤더의 조건부 로직(데몬 모드·SHA2·IE 분기)이 그대로 살고, 하위 파일 목록을 여기에 하드코딩하지 않는다.
 */
(function (w, d) {
    "use strict";

    const state = w.__initechDocWrite || (w.__initechDocWrite = {
        original: d.write,   // 원본(네이티브) document.write — 최초 캡처 시점에만 보관
        queue: [],           // 재생 대기 스크립트 URL (기록 순서 = 실행 순서)
        sink: null,          // 캡처 대상 배열 — 평소에는 queue, 재생 중에는 실행 중 스크립트의 중첩 쓰기 모음
        ignored: [],         // <script src> 가 아닌 document.write 인자 (진단용)
        loaded: [],
        failed: [],
        installed: false
    });

    if (state.installed) {
        return; // 이미 캡처 중
    }

    state.sink = state.queue;

    d.write = function (html) {
        const m = /<script\b[^>]*\bsrc\s*=\s*['"]([^'"]+)['"]/i.exec(String(html));

        if (m) {
            state.sink.push(m[1]);
        } else {
            state.ignored.push(String(html).slice(0, 200));
        }
    };

    state.installed = true;
})(window, document);
