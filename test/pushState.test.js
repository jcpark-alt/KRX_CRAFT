/**
 * $c.win.pushState / changePageState(__changePageState) 회귀 테스트.
 *
 * pushState 는 메뉴 데이터를 history 에 기록하고, __changePageState 는 popstate 시
 * history.state 의 메뉴 정보로 openMenu 를 재호출한다(isHistory:false, 파라미터 보존).
 * WebSquare 런타임을 mock 으로 대체한 vm 하네스로 검증한다.
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

function loadHarness() {
  const state = { pushed: [] };
  const sandbox = {
    console, JSON, Array, String, Object, Date, Boolean, Number, Promise, Math,
    parseFloat, parseInt,
    scwin: {},
    WebSquareExternal: { contextPath: "" },
    history: {
      state: null,
      pushState: (stateObj, title, url) => { state.pushed.push({ stateObj, title, url }); },
    },
    $c: {
      util: { isEmpty },
      sbm: { getContextPath: () => "/ctx/" },
      win: {}, // 로드 후 scwin 으로 연결
    },
    $p: {},
    window: {},
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: path.basename(XML_FILE) + ".cdata.js" });
  sandbox.$c.win = sandbox.scwin;
  return { scwin: sandbox.scwin, state, sandbox };
}

describe("$c.win.pushState / __changePageState (src/gcc/win.xml)", () => {
  test("pushState: {data} state 와 contextPath(끝 슬래시 제거) URL 로 기록", () => {
    const h = loadHarness();
    const data = { menuInfo: { menuNm: "인사조회", menuCode: "010001", src: "/tmp/t.xml" }, srchKey: "A" };
    h.scwin.pushState(data);

    expect(h.state.pushed).toHaveLength(1);
    expect(h.state.pushed[0].stateObj).toEqual({ data });
    expect(h.state.pushed[0].title).toBe("인사조회");
    expect(h.state.pushed[0].url).toBe("/ctx");
  });

  test("__changePageState: state 의 메뉴 정보로 openMenu 재호출 — data 자체를 paramObj 로 전달(파라미터 보존), isHistory:false", () => {
    const h = loadHarness();
    const data = { menuInfo: { menuNm: "인사조회", menuCode: "010001", src: "/tmp/t.xml" }, srchKey: "A" };
    h.sandbox.history.state = { data };
    const calls = [];
    h.scwin.openMenu = function (menuNm, url, menuCode, paramObj, option) {
      calls.push({ menuNm, url, menuCode, paramObj, option });
    };

    h.scwin.__changePageState();

    expect(calls).toHaveLength(1);
    expect(calls[0].menuNm).toBe("인사조회");
    expect(calls[0].url).toBe("/tmp/t.xml");
    expect(calls[0].menuCode).toBe("010001");
    expect(calls[0].paramObj).toBe(data); // 화면 파라미터(srchKey 등) 유실 없음
    expect(calls[0].option).toEqual({ isHistory: false });
  });

  test("__changePageState: state 가 없거나 menuInfo 가 없으면 아무것도 하지 않음", () => {
    const h = loadHarness();
    const calls = [];
    h.scwin.openMenu = () => { calls.push(1); };

    h.sandbox.history.state = null;
    h.scwin.__changePageState();
    h.sandbox.history.state = { data: { srchKey: "A" } }; // menuInfo 없음
    h.scwin.__changePageState();

    expect(calls).toHaveLength(0);
  });

  test("changePageState: __changePageState 로 위임", () => {
    const h = loadHarness();
    const data = { menuInfo: { menuNm: "m", menuCode: "c", src: "/s.xml" } };
    h.sandbox.history.state = { data };
    const calls = [];
    h.scwin.openMenu = (...args) => { calls.push(args); };

    h.scwin.changePageState();
    expect(calls).toHaveLength(1);
  });
});
