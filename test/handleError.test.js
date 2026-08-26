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
  const calls = { error: [], alert: [], toast: [], report: [], beacon: [], fetch: [], consoleError: 0, consoleWarn: 0 };

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
    window: { opener: null, screen: { availWidth: 1920, availHeight: 1080, availTop: 0, availLeft: 0 }, location: { href: "http://test/ui/SMP.xml" } },
    navigator: { userAgent: "jest-harness", sendBeacon: (url, body) => { calls.beacon.push({ url, body }); return true; } },
    fetch: (url, opts) => { calls.fetch.push({ url, opts }); return Promise.resolve({ ok: true }); },
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

describe("__reportError 오류 수집 훅 (src/gcc/win.xml)", () => {
  let h;
  beforeEach(() => { h = loadHarness(); });

  test("수집 URL 미설정(기본) 시 아무 것도 전송하지 않음", async () => {
    await h.scwin.handleError(new Error("boom"));
    expect(h.calls.beacon).toHaveLength(0);
    expect(h.calls.fetch).toHaveLength(0);
  });

  test("URL 설정 시 표준 페이로드를 sendBeacon 으로 전송", async () => {
    h.scwin.ERROR_REPORT_INFO.URL = "/api/common/error-report";
    await h.scwin.handleError(new Error("boom"), { context: "SMP.save" });

    expect(h.calls.beacon).toHaveLength(1);
    expect(h.calls.beacon[0].url).toBe("/api/common/error-report");
    const payload = JSON.parse(h.calls.beacon[0].body);
    expect(payload.frameId).toBe("mf_frameA");
    expect(payload.context).toBe("SMP.save");
    expect(payload.name).toBe("Error");
    expect(payload.message).toBe("boom");
    expect(payload.stack).toContain("Error: boom");
    expect(payload.pageUrl).toBe("http://test/ui/SMP.xml");
    expect(payload.userAgent).toBe("jest-harness");
    expect(payload.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test("동일 context+message 는 화면당 1회만 전송(중복 억제)", async () => {
    h.scwin.ERROR_REPORT_INFO.URL = "/api/err";
    await h.scwin.handleError(new Error("dup"), { context: "A" });
    await h.scwin.handleError(new Error("dup"), { context: "A" });
    expect(h.calls.beacon).toHaveLength(1);

    await h.scwin.handleError(new Error("dup"), { context: "B" }); // context 다르면 별건
    expect(h.calls.beacon).toHaveLength(2);
  });

  test("MAX_PER_PAGE 초과분은 전송하지 않음(폭주 방지)", async () => {
    h.scwin.ERROR_REPORT_INFO.URL = "/api/err";
    h.scwin.ERROR_REPORT_INFO.MAX_PER_PAGE = 2;
    await h.scwin.handleError(new Error("e1"));
    await h.scwin.handleError(new Error("e2"));
    await h.scwin.handleError(new Error("e3"));
    expect(h.calls.beacon).toHaveLength(2);
  });

  test("sendBeacon 미지원 환경은 fetch keepalive 로 폴백", async () => {
    h.scwin.ERROR_REPORT_INFO.URL = "/api/err";
    delete h.sandbox.navigator.sendBeacon;
    await h.scwin.handleError(new Error("fb"));

    expect(h.calls.fetch).toHaveLength(1);
    expect(h.calls.fetch[0].url).toBe("/api/err");
    expect(h.calls.fetch[0].opts.method).toBe("POST");
    expect(h.calls.fetch[0].opts.keepalive).toBe(true);
    expect(JSON.parse(h.calls.fetch[0].opts.body).message).toBe("fb");
  });

  test("동일 예외 객체는 handleError 재호출 시 1회만 수집(_errorReported 마킹)", async () => {
    h.scwin.ERROR_REPORT_INFO.URL = "/api/err";
    const ex = { errorType: "error", message: "comm fail" };
    await h.scwin.handleError(ex, { context: "sbm.sbm_a" });   // sbm 공통 계층의 수집
    await h.scwin.handleError(ex, { context: "ULDX.search" }); // 화면 catch 의 재호출
    expect(h.calls.report).toHaveLength(1); // 재수집 없음
    expect(h.calls.beacon).toHaveLength(1);
    expect(ex._errorReported).toBe(true);
  });

  test("스택은 MAX_STACK_LENGTH 로 절단", async () => {
    h.scwin.ERROR_REPORT_INFO.URL = "/api/err";
    h.scwin.ERROR_REPORT_INFO.MAX_STACK_LENGTH = 50;
    const ex = new Error("long");
    ex.stack = "x".repeat(500);
    await h.scwin.handleError(ex);
    expect(JSON.parse(h.calls.beacon[0].body).stack).toHaveLength(50);
  });
});
