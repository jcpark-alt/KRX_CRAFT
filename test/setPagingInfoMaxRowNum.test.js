/**
 * $c.sbm.setPagingInfo — maxRowNum "all" 처리 회귀 테스트.
 *
 * maxRowNum 이 "all" 이면 그리드를 전체 행 표시로 전환하고, 페이지 라인 수 변경(onviewchange)
 * 시에도 setVisibleRowNum(엔진 API, "all" 거부) 대신 $c.util.setGridVisibleRowNum 으로 적용한다.
 * 숫자 maxRowNum 상한·선택값 "all" 상한 처리도 함께 검증한다.
 * WebSquare 런타임을 mock 으로 대체한 vm 하네스로 검증한다.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILE = "src/gcc/sbm.xml";

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

function makeGrid(id, visibleRowNum = 5) {
  return {
    id,
    options: { visibleRowNum },
    htmlInfo: { head: { rowArr: [1] } },
    render: { classList: ["w2grid", "row5", "h2_row20", "rowHighlight"] }, // 행 수 클래스 + 무관 클래스 혼재
    addedClass: [], removedClass: [],
    addClass(c) { this.addedClass.push(c); },
    removeClass(c) { this.removedClass.push(c); },
    setStartRowNumber() {},
  };
}

function makePerPage(value) {
  return {
    _handler: null,
    getValue: () => value,
    unbind() {},
    bind(ev, fn) { this._handler = fn; },
  };
}

function loadHarness() {
  const state = { gridCalls: [], searchCalls: [] };
  const scopeScwin = { fnSrch: (...args) => { state.searchCalls.push(args); } };
  const sandbox = {
    console, JSON, Array, String, Object, Date, Boolean, Number, Promise, Math,
    parseFloat, parseInt,
    scwin: {},
    window: {},
    WebSquare: { core: { getConfiguration: () => "" }, ModelUtil: { abort() {} } },
    $c: {
      util: {
        isEmpty, isArray: Array.isArray,
        isMobile: () => false,
        assignDefined: (base, over) => {
          const out = Object.assign({}, base);
          for (const k in over) { if (over[k] !== undefined) { out[k] = over[k]; } }
          return out;
        },
        setGridVisibleRowNum: (grd, n) => { state.gridCalls.push([grd.id, n]); },
      },
      sbm: { resultMsg() {} },
      data: { getMessage: () => "" },
      win: { alert() {} },
      num: { formatNumber: (n) => String(n) },
    },
    $p: {
      data: { create() {} },
      getComponentById: () => null,
      getFrame: () => ({ scope: { scwin: scopeScwin } }),
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: path.basename(XML_FILE) + ".cdata.js" });
  return { scwin: sandbox.scwin, state };
}

describe("$c.sbm.setPagingInfo maxRowNum 'all' (src/gcc/sbm.xml)", () => {
  test('maxRowNum "all": 그리드를 즉시 전체 행 표시로 전환 (이미 "all" 이면 재적용 생략)', () => {
    const h = loadHarness();
    const grid = makeGrid("grd_main");
    h.scwin.setPagingInfo({ maxRowNum: "all", rowNumVisble: grid, pageFunction: "scwin.fnSrch" });
    expect(h.state.gridCalls).toEqual([["grd_main", "all"]]);
    // 행 수 제한 클래스(row{n}/h{n}_row{n})는 전부 제거, 무관 클래스(w2grid/rowHighlight)는 유지
    expect(grid.removedClass).toEqual(["row5", "h2_row20"]);

    // 그리드가 이미 "all" 이면 재도색하지 않는다 (통신 전/후 2회 호출 대비)
    grid.options.visibleRowNum = "all";
    h.scwin.setPagingInfo({ maxRowNum: "all", rowNumVisble: grid, pageFunction: "scwin.fnSrch" });
    expect(h.state.gridCalls).toHaveLength(1);
  });

  test('maxRowNum "all": 라인 수 변경(onviewchange) 시에도 "all" 적용, 행 수 클래스 미부여', () => {
    const h = loadHarness();
    const grid = makeGrid("grd_main");
    const perPage = makePerPage("10");
    h.scwin.setPagingInfo({
      maxRowNum: "all", rowNumVisble: grid, recordPerPageId: perPage, pageFunction: "scwin.fnSrch",
    });
    h.state.gridCalls.length = 0;

    perPage._handler({ newValue: "20", oldSelectedIndex: 0 });

    expect(h.state.gridCalls).toEqual([["grd_main", "all"]]);
    expect(grid.addedClass).toEqual([]); // "all" 은 행 수 클래스 미부여
    expect(grid.removedClass).toContain("row5"); // 기존 행 수 클래스는 전부 제거
    expect(grid.removedClass).toContain("h2_row20");
    expect(grid.removedClass).not.toContain("rowHighlight"); // 무관 클래스는 유지
    expect(h.state.searchCalls).toEqual([[1, 0]]); // 페이징 재조회 호출 유지
  });

  test("숫자 maxRowNum: 상한 초과 시 상한 적용, 이하면 선택값 적용", () => {
    const h = loadHarness();
    const grid = makeGrid("grd_main");
    const perPage = makePerPage("10");
    h.scwin.setPagingInfo({
      maxRowNum: 50, rowNumVisble: grid, recordPerPageId: perPage, pageFunction: "scwin.fnSrch",
    });

    perPage._handler({ newValue: "20", oldSelectedIndex: 0 });
    perPage._handler({ newValue: "100", oldSelectedIndex: 1 });

    expect(h.state.gridCalls).toEqual([["grd_main", "20"], ["grd_main", 50]]);
    expect(grid.addedClass).toEqual(["row20", "row50"]);
  });

  test('선택값이 "all" 이고 maxRowNum 이 숫자면 maxRowNum 을 상한으로 적용', () => {
    const h = loadHarness();
    const grid = makeGrid("grd_main");
    const perPage = makePerPage("10");
    h.scwin.setPagingInfo({
      maxRowNum: 50, rowNumVisble: grid, recordPerPageId: perPage, pageFunction: "scwin.fnSrch",
    });

    perPage._handler({ newValue: "all", oldSelectedIndex: 0 });

    expect(h.state.gridCalls).toEqual([["grd_main", 50]]);
  });
});
