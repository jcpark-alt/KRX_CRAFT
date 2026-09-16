/**
 * cm/cert/js/common/promise-guard.js 회귀 테스트.
 *
 * 재현 시나리오: 이니텍 crosswebex6.js 가 끌어오는 bluebird-3.5.0 브라우저 번들이 window.Promise 를 덮어써
 * WebSquare 엔진의 Promise.allSettled 호출이 TypeError 로 실패한다(2026-09-16 실환경 발생).
 * 가드를 bluebird 보다 먼저 로드하면 전역 Promise 가 네이티브로 고정되어야 한다.
 */
const fs = require("fs");
const vm = require("vm");

const GUARD = "cm/cert/js/common/promise-guard.js";
const BLUEBIRD = "cm/cert/vendor/SW/initech/extension/common/js/bluebird-3.5.0.min.js";

function makeWindow() {
  // 브라우저처럼 전역 객체 자신이 window 이고 Promise 는 쓰기 가능한 데이터 속성이다.
  const sandbox = { console: { log() {}, warn() {}, error() {} }, setTimeout, clearTimeout };
  vm.createContext(sandbox);
  vm.runInContext("this.window = this; this.self = this;", sandbox);
  return sandbox;
}

function run(sandbox, file) {
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
}

describe("promise-guard — bluebird 의 전역 Promise 덮어쓰기 차단", () => {
  test("재현: 가드 없이 bluebird 를 로드하면 전역 Promise 가 교체되고 allSettled 가 사라진다", () => {
    const w = makeWindow();
    const native = vm.runInContext("Promise", w);
    run(w, BLUEBIRD);
    const after = vm.runInContext("Promise", w);
    expect(after).not.toBe(native);
    expect(typeof after.allSettled).toBe("undefined");
  });

  test("가드 후 bluebird 를 로드해도 전역 Promise 는 네이티브 그대로이고 allSettled/any 가 남는다", async () => {
    const w = makeWindow();
    const native = vm.runInContext("Promise", w);
    run(w, GUARD);
    run(w, BLUEBIRD);
    const after = vm.runInContext("Promise", w);
    expect(after).toBe(native);
    expect(typeof after.allSettled).toBe("function");
    expect(typeof after.any).toBe("function");
    // bluebird 는 로드 자체는 성공해 확인용 슬롯에 보관된다(내부 참조로 정상 동작)
    const replaced = vm.runInContext("window.__replacedPromise", w);
    expect(typeof replaced).toBe("function");
    expect(replaced.version).toBe("3.5.0");
    // 엔진이 쓰는 형태 그대로 동작
    const results = await vm.runInContext("Promise.allSettled([Promise.resolve(1), Promise.reject(new Error('x'))])", w);
    expect(results.map((r) => r.status)).toEqual(["fulfilled", "rejected"]);
  });

  test("이니텍 스크립트가 쓰는 API(new Promise / Promise.all / Promise.resolve)는 가드 상태에서 그대로 동작한다", async () => {
    const w = makeWindow();
    run(w, GUARD);
    run(w, BLUEBIRD);
    const v = await vm.runInContext("Promise.all([new Promise(function (r) { r(1); }), Promise.resolve(2)])", w);
    expect(v).toEqual([1, 2]);
  });

  test("가드를 두 번 로드해도 예외 없이 멱등이다", () => {
    const w = makeWindow();
    run(w, GUARD);
    expect(() => run(w, GUARD)).not.toThrow();
    const native = vm.runInContext("Promise", w);
    vm.runInContext("window.Promise = function Fake() {};", w);
    expect(vm.runInContext("Promise", w)).toBe(native);
  });
});
