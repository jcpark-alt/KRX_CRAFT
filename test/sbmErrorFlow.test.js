/**
 * $c.sbm 오류 경로 ↔ $c.exception.handleError 부분 통합 회귀 테스트.
 *
 * 알림 주체는 기존 resultMsg 를 유지하고, E 경로(연결 불가·500 서버 오류)에서
 * handleError(notify:"none") 로 로그·수집 파이프라인에만 합류한다.
 * 함께 수정한 결함: 연결 불가 시 Promise 영구 pending(reject 로 종결),
 * action 누락 시 문자열 reject 로 인한 화면 이중 알림(errorType 표식 객체로 교체).
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILE = "src/gcc/sbm.xml";

const isEmpty = (v) =>
  v === undefined || v === null || v === "" ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

function loadHarness() {
  const xml = fs.readFileSync(XML_FILE, "utf8");
  const cdata = xml.match(/<script[^>]*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/script>/)[1];
  const calls = { resultMsg: [], handleError: [], alert: [] };

  const sandbox = {
    console: { log: () => {}, warn: () => {}, error: () => {} },
    JSON, Array, String, Object, Boolean, Number, Promise,
    scwin: {},
    $c: {
      util: { isEmpty, isArray: Array.isArray, getComponent: () => null },
      sbm: { resultMsg: (msgObj) => { calls.resultMsg.push(msgObj); } },
      data: { getMessage: (id, arg) => `${id}:${arg}` },
      win: {
        alert: (msg) => { calls.alert.push(msg); return Promise.resolve(); },
        __getScope: () => ({ scwin: { $w: {} } }),
      },
      exception: {
        handleError: (ex, opt) => { calls.handleError.push({ ex, opt }); return Promise.resolve(); },
      },
    },
    $p: {},
    WebSquare: { core: { getConfiguration: () => "" }, ModelUtil: { abort() {} } },
  };
  vm.createContext(sandbox);
  vm.runInContext(cdata, sandbox, { filename: path.basename(XML_FILE) + ".cdata.js" });
  return { scwin: sandbox.scwin, calls };
}

describe("sbm 오류 경로의 handleError 합류 (src/gcc/sbm.xml)", () => {
  let h;
  beforeEach(() => { h = loadHarness(); });

  test("연결 불가(status 0): resultMsg 알림 + handleError(notify:none) 수집 + Promise reject 종결", () => {
    const resObj = { responseStatusCode: 0, resourceUri: "/api/x" };
    let rejectedWith = null;
    const sbmObj = { id: "sbm_test", _promise_submitErrorHandler: (rtn) => { rejectedWith = rtn; } };

    h.scwin.__callbackSubmitFunction(resObj, sbmObj);

    // 사용자 알림은 기존 resultMsg 경로 그대로
    expect(h.calls.resultMsg).toHaveLength(1);
    expect(h.calls.resultMsg[0].statusCode).toBe("E");

    // 수집 합류 — 알림 없이(notify:none) handleError 호출
    expect(h.calls.handleError).toHaveLength(1);
    expect(h.calls.handleError[0].opt).toEqual({ notify: "none", context: "sbm.sbm_test" });
    expect(h.calls.handleError[0].ex).toBe(resObj);

    // 결함 수정 — Promise 가 pending 으로 남지 않도록 reject 로 종결, errorType 표식 보장
    expect(rejectedWith).toBe(resObj);
    expect(resObj.errorType).toBe("error");
  });

  test("500 서버 오류(__submitErrorHandler): 서버 메시지 alert + handleError 수집 합류", () => {
    const resObj = {
      id: "sbm_save",
      responseStatusCode: 500,
      responseReasonPhrase: "Internal Server Error",
      resourceUri: "/api/save",
      responseBody: JSON.stringify({ message: "저장 중 서버 오류", errors: { code: "E500" } }),
    };
    h.scwin.__submitErrorHandler(resObj);

    expect(h.calls.resultMsg).toHaveLength(1);
    expect(h.calls.resultMsg[0].message).toBe("저장 중 서버 오류");
    expect(h.calls.resultMsg[0].errorCode).toBe("E500");
    expect(h.calls.handleError).toHaveLength(1);
    expect(h.calls.handleError[0].opt).toEqual({ notify: "none", context: "sbm.sbm_save" });
  });

  test("500 응답 본문이 JSON 이 아니어도 기본 문구로 알림·수집 수행(경화)", () => {
    const resObj = { id: "sbm_x", responseStatusCode: 500, responseReasonPhrase: "ISE", resourceUri: "/api/x", responseBody: "<html>oops</html>" };
    h.scwin.__submitErrorHandler(resObj);

    expect(h.calls.resultMsg).toHaveLength(1);
    expect(h.calls.resultMsg[0].message).toBe("서버 오류입니다. 자세한 내용은 관리자에게 문의하시기 바랍니다.");
    expect(h.calls.resultMsg[0].errorCode).toBe("");
    expect(h.calls.handleError).toHaveLength(1);
  });

  test("action 누락: alert 1회 + errorType 표식 객체로 reject(화면 handleError 이중 알림 방지)", async () => {
    const p = h.scwin.execute({ id: "sbm_noAction", action: "" });
    await expect(p).rejects.toEqual({ errorType: "invalid-option", message: "MSG_CM_00002:action" });
    expect(h.calls.alert).toHaveLength(1);
  });
});
