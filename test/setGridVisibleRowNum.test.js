/**
 * $c.util.setGridVisibleRowNum 회귀 테스트.
 *
 * 숫자는 엔진 API setVisibleRowNum 에 위임하고, "all" 은 엔진이 거부(parseInt NaN)하므로
 * options.visibleRowNum 직접 변경 + 그리드 재구성(초기화 → tbody 비움 → drawDataTable(0))으로
 * 적용한다. WebSquare 런타임을 mock 으로 대체한 vm 하네스로 검증한다.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILE = "src/gcc/util.xml";

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

// mock gridView: 엔진 setVisibleRowNum(숫자 전용) 동작 재현 + 재구성 호출 기록
function makeGrid(id) {
  const kids = [{ n: 1 }, { n: 2 }];
  const tbody = {
    get firstChild() { return kids[0] || null; },
    removeChild(c) { kids.splice(kids.indexOf(c), 1); },
    _kids: kids,
  };
  const grid = {
    id,
    options: { visibleRowNum: 5 },
    calls: [],
    focusedCell: [{ f: 1 }],
    dataRowList: [{ r: 1 }],
    drawedRowLength: 2,
    lastDisplayedRow: 1,
    _tbody: tbody,
    setVisibleRowNum(v) {
      const n = parseInt(v, 10);
      if (isNaN(n) || n <= 0) return false; // 엔진과 동일: "all" 거부
      grid.options.visibleRowNum = n;
      grid.calls.push(["setVisibleRowNum", n]);
    },
    initializeDrawController() { grid.calls.push(["initializeDrawController"]); },
    getElementById(elId) { return elId === id + "_body_tbody" ? tbody : null; },
    drawDataTable(idx) { grid.calls.push(["drawDataTable", idx]); },
  };
  return grid;
}

function loadHarness() {
  const sandbox = {
    console, JSON, Array, String, Object, Date, Boolean, Number, Promise, Math,
    parseFloat, parseInt,
    scwin: {},
    window: {},
    WebSquare: { util: {}, cookie: {} },
    navigator: { userAgent: "test" },
    $c: { util: { isEmpty }, win: {}, str: {}, data: {}, sbm: {} },
    $p: {},
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: path.basename(XML_FILE) + ".cdata.js" });
  const scwin = sandbox.scwin;
  sandbox.$c.util = Object.assign({ isEmpty }, scwin); // $c.util.* 내부 상호 호출 연결
  return { scwin };
}

describe("$c.util.setGridVisibleRowNum (src/gcc/util.xml)", () => {
  test("숫자: 엔진 setVisibleRowNum 에 위임", () => {
    const h = loadHarness();
    const grid = makeGrid("grd_main");

    expect(h.scwin.setGridVisibleRowNum(grid, 20)).toBe(true);
    expect(grid.options.visibleRowNum).toBe(20);
    expect(grid.calls).toEqual([["setVisibleRowNum", 20]]);
  });

  test('"all": options 직접 변경 + 재구성(초기화 → tbody 비움 → drawDataTable(0))', () => {
    const h = loadHarness();
    const grid = makeGrid("grd_main");

    expect(h.scwin.setGridVisibleRowNum(grid, "all")).toBe(true);
    expect(grid.options.visibleRowNum).toBe("all");
    expect(grid.focusedCell).toEqual([]);
    expect(grid.dataRowList).toEqual([]);
    expect(grid.drawedRowLength).toBe(0);
    expect(grid.lastDisplayedRow).toBe(-1);
    expect(grid._tbody._kids).toHaveLength(0); // tbody 비움
    expect(grid.calls).toEqual([["initializeDrawController"], ["drawDataTable", 0]]);
  });

  test("빈 인자·잘못된 grid 는 false (예외 없음)", () => {
    const h = loadHarness();

    expect(h.scwin.setGridVisibleRowNum(null, "all")).toBe(false);
    expect(h.scwin.setGridVisibleRowNum(makeGrid("g"), "")).toBe(false);
    expect(h.scwin.setGridVisibleRowNum({}, "all")).toBe(false); // grid 아님 → catch → false
  });

  test('숫자 0/음수는 엔진과 동일하게 거부(false)', () => {
    const h = loadHarness();
    const grid = makeGrid("grd_main");

    expect(h.scwin.setGridVisibleRowNum(grid, 0)).toBe(false);
    expect(grid.options.visibleRowNum).toBe(5); // 미변경
  });
});
