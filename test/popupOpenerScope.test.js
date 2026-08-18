/**
 * browserPopup 오프너 scope 접근 공통함수 회귀 테스트.
 *
 * $c.win._openPopup 은 browserPopup 오픈 시 호출 화면 scope 를 POPUP_OPENER_SCOPES 에
 * popupId 로 등록하고, 자식 팝업 창은 $c.win.getOpenerScope()/callOpener() 로
 * window.opener 를 경유해 부모 화면 scwin 에 접근한다. WebSquare 런타임을 mock 으로
 * 대체한 vm 하네스로 부모/자식 창 두 개의 샌드박스를 만들어 검증한다.
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

// win.xml CDATA 를 mock 런타임 위에 로드한 "창(window)" 하나를 만든다.
function loadWindow(overrides = {}) {
  const state = { openedPopup: null };
  const frameScope = { scwin: {} }; // 호출 화면의 scope window ($p.getFrame().scope)

  const sandbox = {
    console, JSON, Array, String, Object, Date, Boolean, Number, Promise, Math,
    parseFloat, parseInt, encodeURIComponent,
    scwin: {},
    WebSquareExternal: { contextPath: "" },
    document: { body: { offsetHeight: 800, offsetWidth: 1200 } },
    $: () => ({ css: () => "0", scrollTop: () => 0, scrollLeft: () => 0 }),
    $c: {
      util: { isEmpty, getJSON: (x) => x, getCallBackFunction: () => undefined, setTimeout: (fn) => fn() },
      num: { parseInt: (v) => parseInt(v, 10) },
      sbm: { getContextPath: () => "" },
      str: { serialize: (v) => JSON.stringify(v) },
      data: { getParameter: () => "" },
      win: {}, // 로드 후 scwin 으로 연결
    },
    $p: {
      id: "scopeA",
      getFrame: () => ({ scope: frameScope }),
      parent: () => ({ scwin: { fromPageFrameParent: () => "pf-parent" } }),
      getPopupId: () => null,
      openPopup: (url, options) => { state.openedPopup = { url, options }; },
      main: () => ({}),
    },
    window: null, // 아래에서 자기 참조로 설정
  };
  Object.assign(sandbox.$p, overrides.$p || {});
  sandbox.window = { opener: overrides.opener !== undefined ? overrides.opener : null, screen: { availWidth: 1920, availHeight: 1080, availTop: 0, availLeft: 0 } };

  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: path.basename(XML_FILE) + ".cdata.js" });
  sandbox.$c.win = sandbox.scwin; // $c.win.* 내부 상호 호출 연결

  return { scwin: sandbox.scwin, $c: sandbox.$c, state, frameScope, sandbox };
}

describe("browserPopup 오프너 scope 접근 (src/gcc/win.xml)", () => {
  test("_openPopup(browserPopup): 호출 scope 를 popupId 로 등록하고 id 미지정 시 자동 생성", () => {
    const parent = loadWindow();
    parent.scwin._openPopup("/tmp/pop01.xml", { type: "browserPopup" }, {}, () => true);

    const popupId = parent.state.openedPopup.options.id;
    expect(popupId).toMatch(/^popup\d+_\d+$/); // 자동 생성 id
    const info = parent.scwin.getPopupOpenerScope(popupId);
    expect(info).toBeTruthy();
    expect(info.scope).toBe(parent.frameScope);
    expect(info.scopeP.id).toBe("scopeA");
  });

  test("_openPopup(browserPopup): 명시적 id 유지 · pageFramePopup 은 등록하지 않음", () => {
    const parent = loadWindow();
    parent.scwin._openPopup("/tmp/pop01.xml", { type: "browserPopup", id: "myPopup" }, {}, () => true);
    expect(parent.scwin.getPopupOpenerScope("myPopup")).toBeTruthy();

    parent.scwin._openPopup("/tmp/pop02.xml", { type: "pageFramePopup", id: "pfPopup" }, {}, () => true);
    expect(parent.scwin.getPopupOpenerScope("pfPopup")).toBeNull();
  });

  test("closeAction: 닫힘 시 등록 정리, 닫기 거부(false) 시 유지", () => {
    const parent = loadWindow();
    parent.scwin._openPopup("/t.xml", { type: "browserPopup", id: "p1" }, {}, () => false);
    parent.state.openedPopup.options.closeAction(); // 닫기 거부
    expect(parent.scwin.getPopupOpenerScope("p1")).toBeTruthy();

    parent.scwin._openPopup("/t.xml", { type: "browserPopup", id: "p2" }, {}, () => true);
    parent.state.openedPopup.options.closeAction(); // 정상 닫힘
    expect(parent.scwin.getPopupOpenerScope("p2")).toBeNull();
  });

  test("자식 창 getOpenerScope: opener 등록 정보로 부모 scope 복원", () => {
    const parent = loadWindow();
    parent.frameScope.scwin.searchList = (arg) => "searched:" + arg;
    parent.scwin._openPopup("/t.xml", { type: "browserPopup", id: "popA" }, {}, () => true);

    const child = loadWindow({
      opener: { closed: false, $c: parent.$c },
      $p: { getPopupId: () => "popA" },
    });
    const openerScope = child.scwin.getOpenerScope();
    expect(openerScope).toBe(parent.frameScope);
  });

  test("자식 창 callOpener: 부모 scwin 함수를 인자와 함께 호출하고 반환값 전달", () => {
    const parent = loadWindow();
    const calls = [];
    parent.frameScope.scwin.setRowData = function (row, flag) { calls.push([row, flag]); return "ok"; };
    parent.scwin._openPopup("/t.xml", { type: "browserPopup", id: "popB" }, {}, () => true);

    const child = loadWindow({
      opener: { closed: false, $c: parent.$c },
      $p: { getPopupId: () => "popB" },
    });
    expect(child.scwin.callOpener("setRowData", { a: 1 }, true)).toBe("ok");
    expect(calls).toEqual([[{ a: 1 }, true]]);
  });

  test("callOpener: 부모에 없는 함수는 호출하지 않고 undefined (예외 없음)", () => {
    const parent = loadWindow();
    parent.scwin._openPopup("/t.xml", { type: "browserPopup", id: "popC" }, {}, () => true);
    const child = loadWindow({
      opener: { closed: false, $c: parent.$c },
      $p: { getPopupId: () => "popC" },
    });
    expect(child.scwin.callOpener("notExists")).toBeUndefined();
  });

  test("opener 가 닫힌 경우 null (예외 없음)", () => {
    const child = loadWindow({ opener: { closed: true } });
    expect(child.scwin.getOpenerScope()).toBeNull();
  });

  test("미등록 popupId 는 null", () => {
    const parent = loadWindow();
    const child = loadWindow({
      opener: { closed: false, $c: parent.$c },
      $p: { getPopupId: () => "unknown" },
    });
    expect(child.scwin.getOpenerScope()).toBeNull();
  });

  test("opener 없는 화면(pageFramePopup 등)은 $p.parent() 반환", () => {
    const w = loadWindow({ opener: null });
    const scope = w.scwin.getOpenerScope();
    expect(typeof scope.scwin.fromPageFrameParent).toBe("function");
    expect(w.scwin.callOpener("fromPageFrameParent")).toBe("pf-parent");
  });
});
