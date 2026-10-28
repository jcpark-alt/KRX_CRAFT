/**
 * 필터로 숨긴 행 누락 점검 회귀 테스트.
 *
 * WebSquare dataList 는 정렬·필터를 화면 → 실제 행 매핑(filteredRowIndexArr)으로 처리하고,
 * getModifiedIndex 등 상태별 인덱스 API(와 이를 쓰는 저장 ref "|M"·"|C"·"|U"·"|D")는 화면 행 번호
 * 기준이라 필터로 숨긴 행을 빠뜨린다(엔진 실측). 이를 보완하는
 *  - $c.data.getHiddenRowIndexByStatus : 숨긴 행 중 지정 상태 행의 실제 번호
 *  - $c.data.isModified                : 숨긴 수정 행도 변경으로 판단
 *  - $c.data.validateGridView          : 숨긴 수정 행 미검사 경고
 *  - $c.sbm.__getRefActionItems        : ref 표현식에서 상태 action 항목 추출
 * 를 엔진 의미를 흉내 낸 mock dataList 로 검증한다.
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

// 엔진 의미를 흉내 낸 dataList — rows/status 는 실제 순서, map 은 화면 → 실제
function makeDataList(rows, status, map) {
  const dl = {
    rows, status, map: map || rows.map((r, i) => i),
    getTotalRow() { return this.rows.length; },
    getRowCount() { return this.map.length; },
    getRealRowIndex(d) { return this.map[d]; },
    getRowStatusByReal(r) { return this.status[r]; },
    getRowIndexByStatus(s) {
      const e = [];
      for (let i = 0; i < this.getTotalRow(); i++) {
        const r = this.map[i];
        if (r !== undefined && s.indexOf(this.status[r]) > -1) e.push(i);
      }
      return e;
    },
    getModifiedIndex() { return this.getRowIndexByStatus("CUD"); },
    getRowJSON(t, opt = {}) {
      const r = opt.realRowIndex ? t : this.map[t];
      const out = Object.assign({}, this.rows[r]);
      out[opt.rowStatusNodeName || "rowStatus"] = this.status[r];
      return out;
    },
  };
  return dl;
}

function loadData() {
  const warn = jest.fn();
  const sandbox = {
    console: { ...console, warn, error: jest.fn() },
    JSON, Array, String, Object, Date, Boolean, Number, RegExp,
    scwin: {},
    $c: { util: { isEmpty, isArray: Array.isArray, getObjectType: (o) => (Array.isArray(o) ? "array" : typeof o) } },
    $p: {},
    WebSquare: {},
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(path.resolve("cm/gcc/data.xml")), sandbox);
  sandbox.$c.data = sandbox.scwin;
  return { scwin: sandbox.scwin, warn, sandbox };
}

function loadSbm() {
  const sandbox = {
    console: { ...console, warn: jest.fn() },
    JSON, Array, String, Object, Boolean, Number, Promise,
    scwin: {},
    $c: { util: { isEmpty, isArray: Array.isArray, getComponent: () => null }, win: {}, data: {} },
    $p: {},
    WebSquare: { core: { getConfiguration: () => "" }, util: {}, modelUtil: {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(path.resolve("cm/gcc/sbm.xml")), sandbox);
  return sandbox.scwin;
}

// 실제 순서 0~5, 1(부산·U)·4(부산·C)만 수정, "서울" 필터로 0·2·3·5 만 보임
const rows = [0, 1, 2, 3, 4, 5].map((i) => ({ seq: i }));
const status = ["R", "U", "R", "R", "C", "R"];
const filteredMap = [5, 0, 2, 3]; // 정렬 + 필터로 순서도 바뀐 상태

describe("$c.data.getHiddenRowIndexByStatus", () => {
  test("필터 없음(정렬만) → 빈 배열", () => {
    const { scwin } = loadData();
    expect(Array.from(scwin.getHiddenRowIndexByStatus(makeDataList(rows, status, [5, 4, 3, 2, 1, 0])))).toEqual([]);
  });

  test("숨긴 수정 행의 실제 번호를 돌려준다(기본 CUD)", () => {
    const { scwin } = loadData();
    const dl = makeDataList(rows, status, filteredMap);
    expect(Array.from(dl.getModifiedIndex())).toEqual([]); // 엔진 API 는 숨긴 행을 빠뜨림
    expect(Array.from(scwin.getHiddenRowIndexByStatus(dl))).toEqual([1, 4]);
  });

  test("상태 지정 — C 는 추가 행만", () => {
    const { scwin } = loadData();
    expect(Array.from(scwin.getHiddenRowIndexByStatus(makeDataList(rows, status, filteredMap), "C"))).toEqual([4]);
  });

  test("status 가 null·빈 값이면 CUD 로 본다", () => {
    const { scwin } = loadData();
    const dl = makeDataList(rows, status, filteredMap);
    expect(Array.from(scwin.getHiddenRowIndexByStatus(dl, null))).toEqual([1, 4]);
    expect(Array.from(scwin.getHiddenRowIndexByStatus(dl, ""))).toEqual([1, 4]);
  });

  test("DataList 가 아니면 빈 배열", () => {
    const { scwin } = loadData();
    expect(Array.from(scwin.getHiddenRowIndexByStatus(null))).toEqual([]);
    expect(Array.from(scwin.getHiddenRowIndexByStatus({ getJSON: () => ({}) }))).toEqual([]);
  });

  test("데이터 컬럼명이 rowStatus 여도 상태를 정확히 읽는다", () => {
    const { scwin } = loadData();
    const dl = makeDataList(rows.map((r) => ({ ...r, rowStatus: "업무값" })), status, filteredMap);
    expect(Array.from(scwin.getHiddenRowIndexByStatus(dl))).toEqual([1, 4]);
  });
});

describe("$c.data.isModified", () => {
  test("보이는 수정 행이 있으면 true", () => {
    const { scwin } = loadData();
    expect(scwin.isModified(makeDataList(rows, status))).toBe(true);
  });

  test("수정 행이 모두 필터로 숨어도 true", () => {
    const { scwin } = loadData();
    expect(scwin.isModified(makeDataList(rows, status, filteredMap))).toBe(true);
  });

  test("수정 행이 없으면 false", () => {
    const { scwin } = loadData();
    expect(scwin.isModified(makeDataList(rows, rows.map(() => "R"), filteredMap))).toBe(false);
  });
});

describe("$c.data.validateGridView", () => {
  test("숨긴 수정 행이 있으면 검사하지 않았다고 경고한다", () => {
    const { scwin, warn, sandbox } = loadData();
    const dl = makeDataList(rows, status, filteredMap);
    const grid = { getID: () => "grd_list" };
    sandbox.$c.util.getGridViewDataList = () => dl;
    expect(scwin.validateGridView(grid, [{ id: "seq", mandatory: true }])).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("grd_list 의 필터로 숨긴 수정 행 2건(실제 행 번호 1,4)");
  });

  test("필터가 없으면 경고하지 않는다", () => {
    const { scwin, warn, sandbox } = loadData();
    sandbox.$c.util.getGridViewDataList = () => makeDataList(rows, rows.map(() => "R"));
    scwin.validateGridView({ getID: () => "grd_list" }, [{ id: "seq", mandatory: true }]);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("$c.sbm.__getRefActionItems", () => {
  const sbm = loadSbm();
  const items = (ref) => JSON.parse(JSON.stringify(sbm.__getRefActionItems(ref)));

  test.each([
    ['data:json,{"id":"dlt_menu","action":"modified"}', [{ id: "dlt_menu", action: "modified", status: "CUD" }]],
    ['data:json,{"id":"dlt_menu","key":"data","action":"inserted"}', [{ id: "dlt_menu", action: "inserted", status: "C" }]],
    ['data:json,["dma_search",{"id":"dlt_a","action":"deleted"},{"id":"dlt_b","action":"updated"}]',
      [{ id: "dlt_a", action: "deleted", status: "DV" }, { id: "dlt_b", action: "updated", status: "U" }]],
    ['data:json,{"id":"dlt_menu","action":"all"}', []],
    ["data:json,dma_search", []],
    ["data:json,{broken", []],
    ["", []],
    [undefined, []],
  ])("%s", (ref, expected) => {
    expect(items(ref)).toEqual(expected);
  });

  test("_normalizeRefTarget 결과와 연결된다", () => {
    const options = { ref: "dma_search,dlt_menu=data|M" };
    sbm._normalizeRefTarget(options);
    expect(items(options.ref)).toEqual([{ id: "dlt_menu", action: "modified", status: "CUD" }]);
  });
});
