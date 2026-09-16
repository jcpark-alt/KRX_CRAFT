/**
 * resources/js/common/initech-shell-guard.js 회귀 테스트 (전역 Promise 보호 + document.write 캡처·자동 재생).
 *
 * 재현 시나리오(2026-09-16 실환경):
 *  - crosswebex6.js 가 끌어오는 bluebird-3.5.0 이 window.Promise 를 덮어써 엔진의 Promise.allSettled 가 TypeError.
 *  - 엔진이 engine 모듈을 비동기 외부 스크립트로 로드해 crosswebex6.js 의 document.write("<script src='.../crosswebexInit.js'>")
 *    가 무시되어 인증서 팝업에서 "cwGetModuleInstallStatus is not defined".
 * 가드는 전역 Promise 를 네이티브로 고정하고, document.write 로 요청된 <script src> 를 그 스크립트 직후(마이크로태스크)에
 * 기록 순서대로 동기 실행해야 하며, 중첩 document.write 는 현재 스크립트 직후에 끼어들어야 한다.
 */
const fs = require("fs");
const vm = require("vm");

const GUARD = "resources/js/common/initech-shell-guard.js";
const BLUEBIRD = "resources/vendor/SW/initech/extension/common/js/bluebird-3.5.0.min.js";

// 가짜 브라우저: window === globalThis, document.write 원본, head.appendChild 가 인라인 script 를 즉시 실행, 동기 XHR 은 files 맵 응답
function makeBrowser(files) {
  const sandbox = { console: { log() {}, warn() {}, error(...a) { sandbox.__errors.push(a[0]); } }, __errors: [], __ran: [], setTimeout, clearTimeout };
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
  sandbox.XMLHttpRequest.prototype.__files = files || {};
  return sandbox;
}

const run = (b, file) => vm.runInContext(fs.readFileSync(file, "utf8"), b, { filename: file });
const write = (b, src) => vm.runInContext(`document.write("<script type='text/javascript' src='${src}'></script>");`, b);
const tick = () => new Promise((r) => setTimeout(r, 0));   // 마이크로태스크(자동 재생)가 돌도록 한 틱 양보

describe("initech-shell-guard — 전역 Promise 보호", () => {
  test("재현: 가드 없이 bluebird 를 로드하면 전역 Promise 가 교체되고 allSettled 가 사라진다", () => {
    const b = makeBrowser();
    const native = vm.runInContext("Promise", b);
    run(b, BLUEBIRD);
    const after = vm.runInContext("Promise", b);
    expect(after).not.toBe(native);
    expect(typeof after.allSettled).toBe("undefined");
  });

  test("가드 후 bluebird 를 로드해도 전역 Promise 는 네이티브 그대로이고 allSettled/any 가 남는다", async () => {
    const b = makeBrowser();
    const native = vm.runInContext("Promise", b);
    run(b, GUARD);
    run(b, BLUEBIRD);
    const after = vm.runInContext("Promise", b);
    expect(after).toBe(native);
    expect(typeof after.allSettled).toBe("function");
    expect(typeof after.any).toBe("function");
    expect(vm.runInContext("window.__replacedPromise.version", b)).toBe("3.5.0");   // bluebird 는 로드됐으나 전역을 차지하지 못함
    const results = await vm.runInContext("Promise.allSettled([Promise.resolve(1), Promise.reject(new Error('x'))])", b);
    expect(results.map((r) => r.status)).toEqual(["fulfilled", "rejected"]);
    const v = await vm.runInContext("Promise.all([new Promise(function (r) { r(1); }), Promise.resolve(2)])", b);   // 이니텍이 쓰는 API
    expect(v).toEqual([1, 2]);
  });
});

describe("initech-shell-guard — document.write 캡처·자동 재생", () => {
  test("벤더 스크립트가 document.write 한 하위 스크립트를 그 직후에 기록 순서대로 실행하고, 중첩 쓰기는 현재 스크립트 직후에 끼어든다", async () => {
    const b = makeBrowser({
      "/ext/cw_web6_adt.js?dt=1": "window.order = (window.order || []); window.order.push('adt');",
      "/ext/common/exinterface.js?dt=1": "window.order.push('exinterface'); document.write(\"<script type='text/javascript' src='/ext/common/js/exproto_ext_daemon.js'></script>\");",
      "/ext/common/js/exproto_ext_daemon.js": "window.order.push('daemon');",
      "/ext/crosswebexInit.js?dt=1": "window.order.push('init'); window.cwGetModuleInstallStatus = function () { return 1; };",
    });
    run(b, GUARD);
    // crosswebex6.js 가 하던 일을 흉내낸다 (한 스크립트 안에서 document.write 3건)
    write(b, "/ext/cw_web6_adt.js?dt=1");
    write(b, "/ext/common/exinterface.js?dt=1");
    write(b, "/ext/crosswebexInit.js?dt=1");
    expect(b.__initechDocWrite.queue).toHaveLength(3);
    expect(b.__ran).toHaveLength(0);                    // 같은 스크립트 안에서는 아직 실행되지 않는다(파서 의미: 스크립트 직후)
    expect(b.__nativeWriteCalls).toBeUndefined();       // 원본 document.write 는 호출되지 않았다(페이지 초기화 위험 없음)

    await tick();                                       // 스크립트 종료 직후의 마이크로태스크
    expect(vm.runInContext("window.order", b)).toEqual(["adt", "exinterface", "daemon", "init"]);
    expect(vm.runInContext("typeof cwGetModuleInstallStatus", b)).toBe("function");
    expect(b.__initechDocWrite.loaded).toEqual(["/ext/cw_web6_adt.js?dt=1", "/ext/common/exinterface.js?dt=1", "/ext/common/js/exproto_ext_daemon.js", "/ext/crosswebexInit.js?dt=1"]);
    expect(b.__initechDocWrite.failed).toHaveLength(0);
    expect(b.__initechDocWrite.queue).toHaveLength(0);
  });

  test("벤더 스크립트가 여러 개 순서대로 로드되어도(라온 → 이니텍) 각 스크립트 직후에 재생되어 원본 순서를 보존한다", async () => {
    const b = makeBrowser({
      "/tk/jsbn-sha2-min.js": "window.order = (window.order || []); window.order.push('jsbn');",
      "/ext/crosswebexInit.js": "window.order.push('init');",
    });
    run(b, GUARD);
    write(b, "/tk/jsbn-sha2-min.js");   // transkey.js
    await tick();
    expect(vm.runInContext("window.order", b)).toEqual(["jsbn"]);
    write(b, "/ext/crosswebexInit.js");  // crosswebex6.js (다음 모듈)
    await tick();
    expect(vm.runInContext("window.order", b)).toEqual(["jsbn", "init"]);
    expect(b.__initechDocWrite.loaded).toHaveLength(2);
  });

  test("로드 실패한 파일은 console.error 로 남기고 다음 파일을 계속 진행한다", async () => {
    const b = makeBrowser({ "/ok.js": "window.okRan = true;" });
    run(b, GUARD);
    write(b, "/missing.js");
    write(b, "/ok.js");
    await tick();
    expect(b.__initechDocWrite.failed).toEqual(["/missing.js"]);
    expect(b.__initechDocWrite.loaded).toEqual(["/ok.js"]);
    expect(vm.runInContext("window.okRan", b)).toBe(true);
    expect(b.__errors).toHaveLength(1);
  });

  test("<script src> 가 아닌 document.write 는 실행하지 않고 진단 목록에만 남긴다(원본 document.write 미호출)", async () => {
    const b = makeBrowser();
    run(b, GUARD);
    vm.runInContext(`document.write("<div>hello</div>");`, b);
    await tick();
    expect(b.__initechDocWrite.queue).toHaveLength(0);
    expect(b.__initechDocWrite.ignored).toEqual(["<div>hello</div>"]);
    expect(b.__ran).toHaveLength(0);
    expect(b.__nativeWriteCalls).toBeUndefined();
  });

  test("가드를 두 번 로드해도 멱등이다(가로채기 1회 설치, 스크립트 1회 실행, Promise 접근자 재정의 없음)", async () => {
    const b = makeBrowser({ "/a.js": "window.aCount = (window.aCount || 0) + 1;" });
    run(b, GUARD);
    const stateRef = b.__initechDocWrite;
    expect(() => run(b, GUARD)).not.toThrow();
    expect(b.__initechDocWrite).toBe(stateRef);
    write(b, "/a.js");
    await tick();
    expect(vm.runInContext("window.aCount", b)).toBe(1);
    const native = vm.runInContext("Promise", b);
    vm.runInContext("window.Promise = function Fake() {};", b);
    expect(vm.runInContext("Promise", b)).toBe(native);
  });
});
