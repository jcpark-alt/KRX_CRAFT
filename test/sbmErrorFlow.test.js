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
  const calls = { resultMsg: [], handleError: [], alert: [], goLogin: 0, usrId: "user01" };

  const sandbox = {
    console: { log: () => {}, warn: () => {}, error: () => {} },
    JSON, Array, String, Object, Boolean, Number, Promise,
    scwin: {},
    $c: {
      util: { isEmpty, isArray: Array.isArray, getComponent: () => null },
      sbm: { resultMsg: (msgObj) => { calls.resultMsg.push(msgObj); } },
      data: { getMessage: (id, arg) => `${id}:${arg}` },
      session: { getUserInfo: () => calls.usrId, goLogin: () => { calls.goLogin += 1; } },
      win: {
        // 알림 닫힘 콜백(2번째 인자)이 있으면 즉시 실행해 후속 이동을 재현한다.
        alert: (msg, cb) => { calls.alert.push(msg); if (typeof cb === "function") { cb(); } return Promise.resolve(); },
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

describe("resultMsg 인증 오류 코드 처리 (src/gcc/sbm.xml)", () => {
  let h;
  beforeEach(() => { h = loadHarness(); });

  test("UNAUTHENTICATED(401): 로그인했던 사용자면 세션 만료 안내 후 로그인 화면 이동", () => {
    h.scwin.resultMsg({ statusCode: "E", errorCode: "UNAUTHENTICATED", message: "인증 필요" });
    expect(h.calls.alert).toEqual(["com_complete_0056:undefined"]);
    expect(h.calls.goLogin).toBe(1);
  });

  test("UNAUTHENTICATED(401): 미로그인 상태(usrId 없음)면 종전대로 알림 없이 무시", () => {
    h.calls.usrId = "";
    h.scwin.resultMsg({ statusCode: "E", errorCode: "UNAUTHENTICATED", message: "인증 필요" });
    expect(h.calls.alert).toHaveLength(0);
    expect(h.calls.goLogin).toBe(0);
  });

  test("SESSION_EXPIRED: 기존 동작 유지 — 안내 후 로그인 이동", () => {
    h.scwin.resultMsg({ statusCode: "E", errorCode: "SESSION_EXPIRED" });
    expect(h.calls.alert).toHaveLength(1);
    expect(h.calls.goLogin).toBe(1);
  });

  test("기타 오류 코드: 서버 메시지 alert, 로그인 이동 없음", () => {
    h.scwin.resultMsg({ statusCode: "E", errorCode: "E500", message: "저장 실패" });
    expect(h.calls.alert).toEqual(["저장 실패"]);
    expect(h.calls.goLogin).toBe(0);
  });
});
