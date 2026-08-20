/**
 * $c.sbm.setPagingInfo — rowNumVisble asc/desc 순번 처리 회귀 테스트.
 *
 * asc 는 그리드 setStartRowNumber(시작 인덱스)로, desc 는 연동 DataList 의 rowNum 컬럼에
 * "전체 건수 - ((현재 페이지-1) × 페이지당 행 수) - 행 인덱스" 내림차순 순번을 설정한다
 * (전체 건수가 필요하므로 통신 후 totalCnt 전달 시점에 적용).
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

function makeDlt(rowCount) {
  return {
    _cells: [],
    getRowCount: () => rowCount,
    setCellData(row, col, value) { this._cells.push([row, col, value]); },
  };
}

function makeGrid(id, dlt) {
  return {
    id,
    _dlt: dlt,
    options: { visibleRowNum: 5 },
    htmlInfo: { head: { rowArr: [1] } },
    render: { classList: [] },
    startRowNumbers: [],
    addClass() {}, removeClass() {},
    setStartRowNumber(n) { this.startRowNumbers.push(n); },
  };
}

function loadHarness() {
  const state = { comps: {} };
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
        setGridVisibleRowNum: () => {},
        getGridViewDataList: (grd) => grd._dlt || null,
      },
      sbm: { resultMsg() {} },
      data: { getMessage: () => "" },
      win: { alert() {} },
      num: { formatNumber: (n) => String(n) },
    },
    $p: {
      data: { create() {} },
      getComponentById: (id) => state.comps[id] || null,
      getFrame: () => ({ scope: { scwin: {} } }),
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: path.basename(XML_FILE) + ".cdata.js" });
  return { scwin: sandbox.scwin, state };
}

describe("$c.sbm.setPagingInfo rowNumVisble asc/desc (src/gcc/sbm.xml)", () => {
  test("desc + totalCnt: DataList rowNum 컬럼에 페이지별 내림차순 순번 설정 (전체 100건·10건/2페이지 → 90,89,88)", () => {
    const h = loadHarness();
    const dlt = makeDlt(3);
    h.state.comps.grd_main = makeGrid("grd_main", dlt);

    h.scwin.setPagingInfo(
      { rowNumVisble: "grd_main|desc", currentPage: 2, recordCountPerPage: 10, pageFunction: "scwin.fnSrch" },
      null, 100
    );

    expect(dlt._cells).toEqual([
      [0, "rowNum", 90],
      [1, "rowNum", 89],
      [2, "rowNum", 88],
    ]);
  });

  test("desc without totalCnt(통신 전 호출): 순번 설정하지 않음", () => {
    const h = loadHarness();
    const dlt = makeDlt(3);
    h.state.comps.grd_main = makeGrid("grd_main", dlt);

    h.scwin.setPagingInfo({ rowNumVisble: "grd_main|desc", currentPage: 2, pageFunction: "scwin.fnSrch" });

    expect(dlt._cells).toEqual([]);
  });

  test("desc + rowNumColumn 재정의: 지정 컬럼에 순번 설정", () => {
    const h = loadHarness();
    const dlt = makeDlt(1);
    h.state.comps.grd_main = makeGrid("grd_main", dlt);

    h.scwin.setPagingInfo(
      { rowNumVisble: "grd_main|desc", rowNumColumn: "SEQ_NO", currentPage: 1, recordCountPerPage: 10, pageFunction: "scwin.fnSrch" },
      null, 55
    );

    expect(dlt._cells).toEqual([[0, "SEQ_NO", 55]]);
  });

  test("asc: setStartRowNumber 로 시작 인덱스 설정 (1페이지 0, 2페이지 (page-1)×행수) — 기존 동작 회귀", () => {
    const h = loadHarness();
    const grid = makeGrid("grd_main", makeDlt(0));
    h.state.comps.grd_main = grid;

    h.scwin.setPagingInfo({ rowNumVisble: "grd_main|asc", currentPage: 1, recordCountPerPage: 10, pageFunction: "scwin.fnSrch" });
    h.scwin.setPagingInfo({ rowNumVisble: "grd_main|asc", currentPage: 3, recordCountPerPage: 10, pageFunction: "scwin.fnSrch" });

    expect(grid.startRowNumbers).toEqual([0, 20]);
  });
});
