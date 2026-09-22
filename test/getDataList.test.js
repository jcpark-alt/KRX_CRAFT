/**
 * $c.data.getDataList 회귀 테스트.
 *
 * dataList 속성을 가진 컴포넌트(gridView, cardView, listView 등)에서 연결된 DataList 객체를
 * 반환한다. gridView 처럼 getDataList() 를 제공하면 그 값을, 아니면 options.dataList("data:" 접두어
 * 제거)를 사용하고, 컴포넌트가 속한 scope 의 $p.getComponentById 로 조회한다.
 * 컴포넌트가 아니거나 dataList 미설정·미존재이면 null 을 반환한다.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

function extractCdata(xmlPath) {
  const xml = fs.readFileSync(xmlPath, "utf8");
  const m = xml.match(/<script[^>]*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/script>/);
  if (!m) throw new Error("CDATA script block not found: " + xmlPath);
  return m[1];
}

const isEmpty = (v) =>
  v === undefined || v === null || v === "" ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

function makeDataList(id, type = "dataList") {
  return { id, getID: () => id, getObjectType: () => type };
}

function loadHarness() {
  const state = { root: {}, scoped: {} };
  const makeP = (store) => ({ getComponentById: (id) => store[id] || null, getFrameId: () => "root" });
  const sandbox = {
    console: { ...console, warn: jest.fn(), error: jest.fn() },
    JSON, Array, String, Object, Date, Boolean, Number, RegExp,
    scwin: {},
    $c: { util: { isEmpty, isArray: Array.isArray } },
    $p: makeP(state.root),
    WebSquare: {},
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(path.resolve("cm/gcc/data.xml")), sandbox);
  state.sandbox = sandbox;
  state.scopedP = makeP(state.scoped);
  return state;
}

function makeComp(id, opts) {
  const c = { id, getID: () => id, options: { dataList: opts.dataList }, getScopeWindow: () => ({ $p: opts.scopeP }) };
  if (opts.getDataList) c.getDataList = opts.getDataList;
  return c;
}

describe("$c.data.getDataList", () => {
  let h;
  beforeEach(() => { h = loadHarness(); });

  test("gridView: getDataList() 가 준 id 로 DataList 객체를 반환한다", () => {
    const dlt = makeDataList("dlt_main");
    h.root.dlt_main = dlt;
    const grd = makeComp("grd_main", { dataList: "data:dlt_main", getDataList: () => "dlt_main", scopeP: h.sandbox.$p });
    expect(h.sandbox.scwin.getDataList(grd)).toBe(dlt);
  });

  test("getDataList() 없는 컴포넌트: options.dataList 의 data: 접두어를 제거해 조회한다", () => {
    const dlt = makeDataList("dlt_card");
    h.root.dlt_card = dlt;
    const cdv = makeComp("cdv_main", { dataList: "data:dlt_card", scopeP: h.sandbox.$p });
    expect(h.sandbox.scwin.getDataList(cdv)).toBe(dlt);
  });

  test("컴포넌트 scope 의 $p 로 조회한다(wframe 등 다른 scope)", () => {
    const dlt = makeDataList("dlt_sub");
    h.scoped.dlt_sub = dlt;
    const grd = makeComp("grd_sub", { dataList: "data:dlt_sub", scopeP: h.scopedP });
    expect(h.sandbox.scwin.getDataList(grd)).toBe(dlt);
  });

  test("dataList 미설정 → null + warn", () => {
    const btn = makeComp("btn_x", { dataList: "", scopeP: h.sandbox.$p });
    expect(h.sandbox.scwin.getDataList(btn)).toBeNull();
    expect(h.sandbox.console.warn).toHaveBeenCalled();
  });

  test("존재하지 않는 DataList 또는 DataMap 이면 null", () => {
    h.root.dlt_missing = undefined;
    h.root.dmp_x = makeDataList("dmp_x", "dataMap");
    expect(h.sandbox.scwin.getDataList(makeComp("g1", { dataList: "data:dlt_missing", scopeP: h.sandbox.$p }))).toBeNull();
    expect(h.sandbox.scwin.getDataList(makeComp("g2", { dataList: "dmp_x", scopeP: h.sandbox.$p }))).toBeNull();
  });

  test("컴포넌트 객체가 아니면 null (undefined/문자열)", () => {
    expect(h.sandbox.scwin.getDataList(undefined)).toBeNull();
    expect(h.sandbox.scwin.getDataList("grd_main")).toBeNull();
  });
});
