/**
 * executeDynamic gridview 스피너 오버레이 회귀 테스트.
 *
 * gridview 옵션 지정 시 통신 실행 전 gridView DOM 하단에 스피너 오버레이
 * (spinner_wrap > spinner_cont > grid_spinner)를 삽입하고, 완료(성공/실패) 시 제거한다.
 * WebSquare 런타임 + 경량 가짜 DOM 을 mock 으로 대체한 vm 하네스로 검증한다.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILES = ["src/gcc/sbm.xml"];

const isEmpty = (v) =>
  v === undefined || v === null || v === "" ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

function makeDoc() {
  const registry = {};
  const doc = {
    createElement() { return makeEl(doc); },
    getElementById(id) { return registry[id] || null; },
    _registry: registry,
  };
  return doc;
}
function makeEl(doc, id) {
  const el = {
    tagName: "DIV", id: id || "", className: "", ownerDocument: doc,
    children: [], parentNode: null,
    appendChild(child) {
      child.parentNode = el; el.children.push(child);
      if (child.id) { doc._registry[child.id] = child; }
      return child;
    },
    removeChild(child) {
      const i = el.children.indexOf(child);
      if (i >= 0) { el.children.splice(i, 1); }
      child.parentNode = null;
      if (child.id) { delete doc._registry[child.id]; }
    },
  };
  if (id) { doc._registry[id] = el; }
  return el;
}
function makeGrid(doc, id) {
  const el = makeEl(doc, id);
  return { id, _el: el, render: el, initGrid() {}, refresh() {}, setFocusedCell() {} };
}

function loadHarness(xmlPath) {
  const xml = fs.readFileSync(xmlPath, "utf8");
  const cdata = xml.match(/<script[^>]*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/script>/)[1];
  const doc = makeDoc();
  const grids = { grd_main: makeGrid(doc, "grd_main"), grd_sub: makeGrid(doc, "grd_sub") };
  const scopeP = { getComponentById: (id) => grids[id] || null };
  const sandbox = {
    console, JSON, Array, String, Object, Boolean, Number, Promise,
    scwin: {},
    $c: {
      util: { isEmpty, isArray: Array.isArray, getComponent: () => null },
      sbm: { resultMsg() {} },
      data: { getMessage: () => "" },
      win: { alert() {} },
    },
    $p: {},
    WebSquare: { core: { getConfiguration: () => "" }, ModelUtil: { abort() {} } },
  };
  vm.createContext(sandbox);
  vm.runInContext(cdata, sandbox, { filename: path.basename(xmlPath) + ".cdata.js" });
  sandbox.$c.sbm = Object.assign(sandbox.scwin, sandbox.$c.sbm);   // 실환경 네임스페이스 배선(기존 mock 유지) — 내부 호출이 $c.sbm.* 경유
  return { scwin: sandbox.scwin, doc, grids, scopeP };
}

const spinnerOf = (doc, grid) => doc.getElementById(grid.id + "_gridSpinner");

describe.each(XML_FILES)("executeDynamic gridview spinner (%s)", (xmlPath) => {
  let h;
  beforeEach(() => { h = loadHarness(xmlPath); });

  test("show: gridView 하단에 spinner_wrap>spinner_cont>grid_spinner 삽입", () => {
    h.scwin.__showGridSpinner(h.scopeP, "grd_main");
    const wrap = spinnerOf(h.doc, h.grids.grd_main);
    expect(wrap).toBeTruthy();
    expect(wrap.className).toBe("spinner_wrap");
    expect(wrap.children[0].className).toBe("spinner_cont");
    expect(wrap.children[0].children[0].className).toBe("grid_spinner");
    const kids = h.grids.grd_main._el.children;
    expect(kids.indexOf(wrap)).toBe(kids.length - 1); // 마지막 자식(하단)
  });

  test("show 재호출 시 중복 삽입 없음(멱등)", () => {
    h.scwin.__showGridSpinner(h.scopeP, "grd_main");
    h.scwin.__showGridSpinner(h.scopeP, "grd_main");
    const wraps = h.grids.grd_main._el.children.filter((c) => c.className === "spinner_wrap");
    expect(wraps).toHaveLength(1);
  });

  test("hide: 스피너 제거", () => {
    h.scwin.__showGridSpinner(h.scopeP, "grd_main");
    h.scwin.__hideGridSpinner(h.scopeP, "grd_main");
    expect(spinnerOf(h.doc, h.grids.grd_main)).toBeNull();
  });

  test("다중 grid 각각 삽입/제거", () => {
    h.scwin.__showGridSpinner(h.scopeP, "grd_main,grd_sub");
    expect(spinnerOf(h.doc, h.grids.grd_main)).toBeTruthy();
    expect(spinnerOf(h.doc, h.grids.grd_sub)).toBeTruthy();
    h.scwin.__hideGridSpinner(h.scopeP, "grd_main,grd_sub");
    expect(spinnerOf(h.doc, h.grids.grd_main)).toBeNull();
    expect(spinnerOf(h.doc, h.grids.grd_sub)).toBeNull();
  });

  test("미존재 grid 는 무시(예외 없음)", () => {
    expect(() => h.scwin.__showGridSpinner(h.scopeP, "grd_none")).not.toThrow();
  });

  test.each(["성공", "실패"])("__callbackSubmitFunction(%s) 완료 시 스피너 자동 제거", (kind) => {
    h.scwin.__showGridSpinner(h.scopeP, "grd_main");
    const sbmObj = { _gridview: "grd_main", _gridSpinner: true, getScopeWindow: () => ({ $p: h.scopeP }) };
    const resObj = (kind === "성공")
      ? { responseStatusCode: 200, errorType: "", responseJSON: null }
      : { responseStatusCode: 200, errorType: "E", responseJSON: null };
    try { h.scwin.__callbackSubmitFunction(resObj, sbmObj); } catch { /* 후속 로직 무관 */ }
    expect(spinnerOf(h.doc, h.grids.grd_main)).toBeNull();
  });

  test("__gridSpinnerId = '{gridId}_gridSpinner'", () => {
    expect(h.scwin.__gridSpinnerId({ id: "grd_x" }, "grd_x")).toBe("grd_x_gridSpinner");
  });
});
