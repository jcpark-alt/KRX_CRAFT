/**
 * cm/cert/js/common/initech-docwrite-capture.js + initech-docwrite-replay.js 회귀 테스트.
 *
 * 재현 시나리오(2026-09-16 실환경): WebSquare 엔진이 config.xml engine 모듈을 비동기 외부 스크립트로 로드하므로
 * crosswebex6.js 의 document.write("<script src='.../crosswebexInit.js'>") 가 무시되어
 * 인증서 팝업에서 "cwGetModuleInstallStatus is not defined" 가 났다.
 * 캡처/재생 쌍은 document.write 로 요청된 <script src> 를 기록 순서대로 동기 실행해야 하며,
 * 실행 중 스크립트의 중첩 document.write 는 파서 의미대로 현재 스크립트 직후에 끼어들어야 한다.
 */
const fs = require("fs");
const vm = require("vm");

const CAPTURE = "cm/cert/js/common/initech-docwrite-capture.js";
const REPLAY = "cm/cert/js/common/initech-docwrite-replay.js";

// 가짜 브라우저: document.write 원본, head.appendChild 가 인라인 script 를 즉시 실행, 동기 XHR 은 files 맵에서 응답
function makeBrowser(files) {
  const sandbox = { console: { log() {}, warn() {}, error(...a) { sandbox.__errors.push(a[0]); } }, __errors: [], __ran: [] };
  vm.createContext(sandbox);
  vm.runInContext(`
    this.window = this; this.self = this;
    const nativeWrite = function () { this.__nativeWriteCalls = (this.__nativeWriteCalls || 0) + 1; }.bind(this);
    this.document = {
      write: nativeWrite,
      __nativeWrite: nativeWrite,
      createElement(tag) { return { tagName: tag.toUpperCase() }; },
      head: { appendChild: (el) => { if (el.tagName === "SCRIPT" && typeof el.text === "string") { this.__ran.push(el.text.split("\\n//# sourceURL=")[1]); (0, eval)(el.text); } } },
    };
    this.XMLHttpRequest = function () {
      this.open = (m, url) => { this.url = url; };
      this.send = () => { const body = this.__files[this.url]; this.status = body === undefined ? 404 : 200; this.responseText = body || ""; };
    };
  `, sandbox);
  sandbox.XMLHttpRequest.prototype.__files = files;
  return sandbox;
}

function run(sandbox, file) {
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
}

const write = (sandbox, src) => vm.runInContext(`document.write("<script type='text/javascript' src='${src}'></script>");`, sandbox);

describe("벤더 document.write 캡처/재생", () => {
  test("crosswebex6 가 document.write 한 스크립트를 기록 순서대로 동기 실행하고, 중첩 document.write 는 현재 스크립트 직후에 끼어든다", () => {
    const files = {
      "/ext/cw_web6_adt.js?dt=1": "window.order = (window.order || []); window.order.push('adt');",
      "/ext/common/exinterface.js?dt=1": "window.order.push('exinterface'); document.write(\"<script type='text/javascript' src='/ext/common/js/exproto_ext_daemon.js'></script>\");",
      "/ext/common/js/exproto_ext_daemon.js": "window.order.push('daemon');",
      "/ext/crosswebexInit.js?dt=1": "window.order.push('init'); window.cwGetModuleInstallStatus = function () { return 1; };",
    };
    const b = makeBrowser(files);
    run(b, CAPTURE);
    write(b, "/ext/cw_web6_adt.js?dt=1");
    write(b, "/ext/common/exinterface.js?dt=1");
    write(b, "/ext/crosswebexInit.js?dt=1");
    expect(b.__initechDocWrite.queue).toHaveLength(3);
    expect(b.__nativeWriteCalls).toBeUndefined();   // 원본 document.write 는 호출되지 않았다(페이지 초기화 위험 없음)

    run(b, REPLAY);
    expect(vm.runInContext("window.order", b)).toEqual(["adt", "exinterface", "daemon", "init"]);
    expect(vm.runInContext("typeof cwGetModuleInstallStatus", b)).toBe("function");
    expect(b.__initechDocWrite.loaded).toEqual(["/ext/cw_web6_adt.js?dt=1", "/ext/common/exinterface.js?dt=1", "/ext/common/js/exproto_ext_daemon.js", "/ext/crosswebexInit.js?dt=1"]);
    expect(b.__initechDocWrite.failed).toHaveLength(0);
    expect(vm.runInContext("document.write === document.__nativeWrite", b)).toBe(true);   // 원복
    expect(b.__initechDocWrite.installed).toBe(false);
  });

  test("캡처→벤더→재생 쌍을 벤더마다 반복할 수 있다(라온 transkey 쌍 뒤에 이니텍 쌍) — 원본 로드 순서 보존", () => {
    const files = {
      "/tk/jsbn-sha2-min.js": "window.order = (window.order || []); window.order.push('jsbn');",
      "/ext/crosswebexInit.js": "window.order.push('init');",
    };
    const b = makeBrowser(files);
    run(b, CAPTURE); write(b, "/tk/jsbn-sha2-min.js"); run(b, REPLAY);          // transkey.js 구간
    expect(vm.runInContext("document.write === document.__nativeWrite", b)).toBe(true);
    run(b, CAPTURE); write(b, "/ext/crosswebexInit.js"); run(b, REPLAY);          // crosswebex6.js 구간
    expect(vm.runInContext("window.order", b)).toEqual(["jsbn", "init"]);
    expect(b.__initechDocWrite.loaded).toHaveLength(2);
  });

  test("로드 실패한 파일은 console.error 로 남기고 다음 파일을 계속 진행한다", () => {
    const b = makeBrowser({ "/ok.js": "window.okRan = true;" });
    run(b, CAPTURE);
    write(b, "/missing.js");
    write(b, "/ok.js");
    run(b, REPLAY);
    expect(b.__initechDocWrite.failed).toEqual(["/missing.js"]);
    expect(b.__initechDocWrite.loaded).toEqual(["/ok.js"]);
    expect(vm.runInContext("window.okRan", b)).toBe(true);
    expect(b.__errors).toHaveLength(1);
  });

  test("<script src> 가 아닌 document.write 는 실행하지 않고 진단 목록에만 남긴다", () => {
    const b = makeBrowser({});
    run(b, CAPTURE);
    vm.runInContext(`document.write("<div>hello</div>");`, b);
    run(b, REPLAY);
    expect(b.__initechDocWrite.queue).toHaveLength(0);
    expect(b.__initechDocWrite.ignored).toEqual(["<div>hello</div>"]);
    expect(b.__ran).toHaveLength(0);
  });

  test("캡처를 연속 두 번, 재생을 연속 두 번 로드해도 스크립트는 한 번만 실행된다", () => {
    const b = makeBrowser({ "/a.js": "window.aCount = (window.aCount || 0) + 1;" });
    run(b, CAPTURE);
    run(b, CAPTURE);
    write(b, "/a.js");
    run(b, REPLAY);
    run(b, REPLAY);
    expect(vm.runInContext("window.aCount", b)).toBe(1);
    expect(vm.runInContext("document.write === document.__nativeWrite", b)).toBe(true);
  });
});
