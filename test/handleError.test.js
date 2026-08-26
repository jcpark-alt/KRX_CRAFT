/**
 * $c.win.handleError 화면 try/catch 공통 오류 처리기 회귀 테스트.
 *
 * WebSquare 런타임을 mock 으로 대체한 vm 하네스로 win.xml 의 CDATA 를 로드해 실제 구동한다.
 * 분류 규약: sbm 중복 제출 skip(ex.skipped)은 완전 무시, sbm 이 이미 알린 통신 오류(ex.errorType)는
 * 로그·수집만(이중 알림 방지), 업무 예외(ex.bizMessage)는 해당 문구로 alert, 그 외는 error 알림.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILE = "src/gcc/win.xml";

const isEmpty = (v) =>
  v === undefined || v === null || v === "" ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

function extractCdata(xmlPath) {
  const xml = fs.readFileSync(xmlPath, "utf8");
  const m = xml.match(/<script[^>]*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/script>/);
  if (!m) throw new Error("CDATA script block not found: " + xmlPath);
  return m[1];
}

// win.xml CDATA 를 mock 런타임 위에 로드하고, 알림/로그 기록 핸들을 반환한다.
function loadHarness() {
  const calls = { error: [], alert: [], toast: [], report: [], consoleError: 0, consoleWarn: 0 };

  const sandbox = {
    console: {
      log: () => {},
      warn: (...args) => { calls.consoleWarn += 1; calls.lastWarnArgs = args; },
      error: (...args) => { calls.consoleError += 1; calls.lastErrorArgs = args; },
    },
    JSON, Array, String, Object, Date, Boolean, Number, Promise, Math,
    parseFloat, parseInt, encodeURIComponent,
    scwin: {},
    WebSquareExternal: { contextPath: "" },
    document: { body: { offsetHeight: 800, offsetWidth: 1200 } },
    $: () => ({ css: () => "0", scrollTop: () => 0, scrollLeft: () => 0 }),
    $c: {
      util: { isEmpty, getJSON: (x) => x, getCallBackFunction: () => undefined, setTimeout: (fn) => fn() },
      num: { parseInt: (v) => parseInt(v, 10) },
      sbm: { getContextPath: () => "", MESSAGE_CODE: { STATUS_ERROR: "E" } },
      str: { serialize: (v) => JSON.stringify(v) },
      data: { getParameter: () => "" },
      win: {}, // 로드 후 scwin 으로 연결
    },
    $p: {
      id: "scopeA",
      getFrameId: () => "mf_frameA",
      getFrame: () => ({ scope: { scwin: {} } }),
      parent: () => ({ scwin: {} }),
      getPopupId: () => null,
      openPopup: () => {},
      main: () => ({}),
    },
    window: { opener: null, screen: { availWidth: 1920, availHeight: 1080, availTop: 0, availLeft: 0 } },
  };

  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: path.basename(XML_FILE) + ".cdata.js" });
  sandbox.$c.win = sandbox.scwin; // $c.win.* 내부 상호 호출 연결

  // 알림 함수는 기록용 mock 으로 대체 (messageBox 는 실제 팝업 런타임 의존)
  sandbox.scwin.error = (msg, cb) => { calls.error.push({ msg, cb }); return Promise.resolve(); };
  sandbox.scwin.alert = (msg, cb) => { calls.alert.push({ msg, cb }); return Promise.resolve(); };
  sandbox.scwin.showToastMessage = (type, msg) => { calls.toast.push({ type, msg }); };
  const origReport = sandbox.scwin.__reportError;
  sandbox.scwin.__reportError = (ex, context) => { calls.report.push({ ex, context }); return origReport(ex, context); };

  return { scwin: sandbox.scwin, calls, sandbox };
}

describe("handleError 공통 오류 처리 (src/gcc/win.xml)", () => {
  let h;
  beforeEach(() => { h = loadHarness(); });

  test("sbm 중복 제출 skip(ex.skipped) 은 로그·수집·알림 없이 완전 무시", async () => {
    await h.scwin.handleError({ skipped: true });
    expect(h.calls.consoleError).toBe(0);
    expect(h.calls.report).toHaveLength(0);
    expect(h.calls.error).toHaveLength(0);
    expect(h.calls.alert).toHaveLength(0);
  });

  test("빈 예외(null/undefined) 도 무시", async () => {
    await h.scwin.handleError(null);
    await h.scwin.handleError(undefined);
    expect(h.calls.consoleError).toBe(0);
    expect(h.calls.error).toHaveLength(0);
  });

  test("sbm 이 이미 알린 통신 오류(ex.errorType) 는 로그·수집만 하고 알림 생략", async () => {
    await h.scwin.handleError({ errorType: "error", responseStatusCode: 500 });
    expect(h.calls.consoleError).toBe(1);
    expect(h.calls.report).toHaveLength(1);
    expect(h.calls.error).toHaveLength(0); // 이중 알림 방지
    expect(h.calls.alert).toHaveLength(0);
  });

  test("일반 예외는 console.error + 기본 문구로 error 알림", async () => {
    const ex = new Error("boom");
    await h.scwin.handleError(ex, { context: "ULDXXX00100.search" });
    expect(h.calls.consoleError).toBe(1);
    expect(h.calls.lastErrorArgs[0]).toBe("[ULDXXX00100.search]");
    expect(h.calls.lastErrorArgs[1]).toBe(ex);
    expect(h.calls.report).toHaveLength(1);
    expect(h.calls.report[0].context).toBe("ULDXXX00100.search");
    expect(h.calls.error).toHaveLength(1);
    expect(h.calls.error[0].msg).toBe("처리 중 오류가 발생했습니다.");
  });

  test("opt.message·notify:'alert' 지정 시 해당 문구/방식으로 알림", async () => {
    await h.scwin.handleError(new Error("x"), { message: "조회에 실패했습니다.", notify: "alert" });
    expect(h.calls.alert).toHaveLength(1);
    expect(h.calls.alert[0].msg).toBe("조회에 실패했습니다.");
    expect(h.calls.error).toHaveLength(0);
  });

  test("업무 예외(ex.bizMessage) 는 console.warn + 해당 문구로 alert", async () => {
    await h.scwin.handleError({ bizMessage: "재고가 부족합니다." });
    expect(h.calls.consoleWarn).toBe(1);
    expect(h.calls.consoleError).toBe(0);
    expect(h.calls.alert).toHaveLength(1);
    expect(h.calls.alert[0].msg).toBe("재고가 부족합니다.");
  });

  test("notify:'toast' 는 STATUS_ERROR 타입 토스트로 알림", async () => {
    await h.scwin.handleError(new Error("x"), { notify: "toast", message: "임시 오류" });
    expect(h.calls.toast).toHaveLength(1);
    expect(h.calls.toast[0]).toEqual({ type: "E", msg: "임시 오류" });
    expect(h.calls.error).toHaveLength(0);
  });

  test("notify:'none' 은 로그·수집만", async () => {
    await h.scwin.handleError(new Error("x"), { notify: "none" });
    expect(h.calls.consoleError).toBe(1);
    expect(h.calls.report).toHaveLength(1);
    expect(h.calls.error).toHaveLength(0);
    expect(h.calls.toast).toHaveLength(0);
  });

  test("rethrow:true 는 알림 후 동일 예외를 다시 던진다", async () => {
    const ex = new Error("stop");
    await expect(h.scwin.handleError(ex, { rethrow: true })).rejects.toBe(ex);
    expect(h.calls.error).toHaveLength(1);
  });

  test("callback 지정 시 알림에 콜백 함수명을 전달하고 즉시 resolve", async () => {
    await h.scwin.handleError(new Error("x"), { callback: "scwin.afterErrorClose" });
    expect(h.calls.error).toHaveLength(1);
    expect(h.calls.error[0].cb).toBe("scwin.afterErrorClose");
  });

  test("__reportError 가 예외를 던져도 사용자 알림은 정상 수행", async () => {
    h.sandbox.scwin.__reportError = () => { throw new Error("report down"); };
    await h.scwin.handleError(new Error("x"));
    expect(h.calls.error).toHaveLength(1); // 수집 실패가 흐름을 깨지 않음
  });
});
