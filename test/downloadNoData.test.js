/**
 * 다운로드 4함수 빈 데이터 가드 회귀 테스트.
 *
 * $c.data.downloadMultipleDataList / downloadMultipleGridView 는 대상 DataList 가 전부 0건일 때,
 * downloadGridViewExcel / downloadGridViewCSV 는 gridView 에 연결된 DataList 가 없거나 0건일 때
 * com_file_0107("다운로드 할 데이터가 없습니다.") 을 $c.win.alert 로 표시하고 다운로드를 호출하지 않는다.
 * 데이터가 하나라도 있으면 alert 없이 기존 다운로드 경로를 그대로 탄다.
 * WebSquare 런타임을 mock 으로 대체한 vm 하네스로 data.xml 의 CDATA 를 실제 구동한다.
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

const MSG = "다운로드 할 데이터가 없습니다.";

function makeDataList(id, rowCount) {
  return { id, getID: () => id, getObjectType: () => "dataList", getRowCount: () => rowCount };
}

function loadHarness() {
  const comps = {};
  const $p = {
    getComponentById: (id) => comps[id] || null,
    getFrameId: () => "root",
    getParameter: () => null,
  };
  const sandbox = {
    console: { ...console, warn: jest.fn(), error: jest.fn() },
    JSON, Array, String, Object, Date, Boolean, Number, RegExp, encodeURIComponent,
    scwin: {},
    $p,
    WebSquare: {
      WebSquareLang: { com_file_0107: MSG },
      util: { multipleDataListDownload: jest.fn(), multipleExcelDownload: jest.fn(), getBoolean: (v) => v === true || v === "true" },
    },
  };
  sandbox.$c = {
    util: { isEmpty, isArray: Array.isArray },
    win: { alert: jest.fn(), getLanguage: () => "ko" },
    date: { getServerDateTime: () => "20260922000000" },
    str: { escapeToEnter: (m) => m, replaceAll: (s, a, b) => s.split(a).join(b), isFinalConsonant: () => false },
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(path.resolve("cm/gcc/data.xml")), sandbox);
  // data.xml 내부의 $c.data.* 호출을 자기 자신(scwin)으로 배선한다.
  sandbox.$c.data = sandbox.scwin;
  sandbox.scwin._commonMessageLoaded = true; // common_message.json 지연 로드 생략 → WebSquareLang 폴백
  return { sandbox, comps, $p };
}

// dataList 를 가진 gridView mock. rowCount 가 null 이면 dataList 미바인딩 상태.
function makeGrid(h, id, dltId, rowCount) {
  if (rowCount !== null) h.comps[dltId] = makeDataList(dltId, rowCount);
  const g = {
    id, getID: () => id,
    options: { dataList: rowCount === null ? "" : "data:" + dltId },
    getDataList: () => (rowCount === null ? "" : dltId),
    getScopeWindow: () => ({ $p: h.$p }),
    getPluginName: () => "gridView",
    getDataListInfo: () => ({ id: dltId }),
    // setDownloadGridViewOption 이 hidden 컬럼 계산에 쓰는 gridView API
    getColCnt: () => 0,
    getColumnCount: () => 0,
    getColumnVisible: () => true,
    getColumnID: () => "",
    advancedExcelDownload: jest.fn(),
    saveCSV: jest.fn(),
  };
  h.comps[id] = g;
  return g;
}

describe("downloadMultipleDataList 빈 데이터 가드", () => {
  test("모든 dataListId 가 0건 → alert 1회, 다운로드 미호출", () => {
    const h = loadHarness();
    h.comps.root_dlt_a = makeDataList("dlt_a", 0);
    h.comps.root_dlt_b = makeDataList("dlt_b", 0);
    h.sandbox.scwin.downloadMultipleDataList({ common: { fileName: "x.xlsx" }, excelInfo: [{ dataListId: "dlt_a" }, { dataListId: "dlt_b" }] }, []);
    expect(h.sandbox.$c.win.alert).toHaveBeenCalledTimes(1);
    expect(h.sandbox.$c.win.alert).toHaveBeenCalledWith(MSG);
    expect(h.sandbox.WebSquare.util.multipleDataListDownload).not.toHaveBeenCalled();
  });

  test("일부 dataListId 에만 데이터 → alert 없이 다운로드 호출", () => {
    const h = loadHarness();
    h.comps.root_dlt_a = makeDataList("dlt_a", 0);
    h.comps.root_dlt_b = makeDataList("dlt_b", 3);
    h.sandbox.scwin.downloadMultipleDataList({ common: { fileName: "x.xlsx" }, excelInfo: [{ dataListId: "dlt_a" }, { dataListId: "dlt_b" }] }, []);
    expect(h.sandbox.$c.win.alert).not.toHaveBeenCalled();
    expect(h.sandbox.WebSquare.util.multipleDataListDownload).toHaveBeenCalledTimes(1);
    expect(h.sandbox.WebSquare.util.multipleDataListDownload.mock.calls[0][0].excelInfo).toHaveLength(2);
  });

  test("존재하지 않는 dataListId → warn 후 종료(alert·다운로드 없음)", () => {
    const h = loadHarness();
    h.sandbox.scwin.downloadMultipleDataList({ common: { fileName: "x.xlsx" }, excelInfo: [{ dataListId: "dlt_missing" }] }, []);
    expect(h.sandbox.console.warn).toHaveBeenCalled();
    expect(h.sandbox.$c.win.alert).not.toHaveBeenCalled();
    expect(h.sandbox.WebSquare.util.multipleDataListDownload).not.toHaveBeenCalled();
  });
});

describe("downloadMultipleGridView 빈 데이터 가드", () => {
  test("모든 gridId 의 DataList 가 0건 → alert 1회, 다운로드 미호출", () => {
    const h = loadHarness();
    makeGrid(h, "root_grd_a", "dlt_a", 0);
    makeGrid(h, "root_grd_b", "dlt_b", 0);
    h.sandbox.scwin.downloadMultipleGridView({ common: { fileName: "x.xlsx" }, excelInfo: [{ gridId: "grd_a" }, { gridId: "grd_b" }] }, []);
    expect(h.sandbox.$c.win.alert).toHaveBeenCalledTimes(1);
    expect(h.sandbox.$c.win.alert).toHaveBeenCalledWith(MSG);
    expect(h.sandbox.WebSquare.util.multipleExcelDownload).not.toHaveBeenCalled();
  });

  test("일부 gridId 에만 데이터 → alert 없이 다운로드 호출", () => {
    const h = loadHarness();
    makeGrid(h, "root_grd_a", "dlt_a", 0);
    makeGrid(h, "root_grd_b", "dlt_b", 1);
    h.sandbox.scwin.downloadMultipleGridView({ common: { fileName: "x.xlsx" }, excelInfo: [{ gridId: "grd_a" }, { gridId: "grd_b" }] }, []);
    expect(h.sandbox.$c.win.alert).not.toHaveBeenCalled();
    expect(h.sandbox.WebSquare.util.multipleExcelDownload).toHaveBeenCalledTimes(1);
  });

  test("존재하지 않는 gridId → warn 후 종료(alert·다운로드 없음)", () => {
    const h = loadHarness();
    h.sandbox.scwin.downloadMultipleGridView({ common: { fileName: "x.xlsx" }, excelInfo: [{ gridId: "grd_missing" }] }, []);
    expect(h.sandbox.console.warn).toHaveBeenCalled();
    expect(h.sandbox.$c.win.alert).not.toHaveBeenCalled();
    expect(h.sandbox.WebSquare.util.multipleExcelDownload).not.toHaveBeenCalled();
  });
});

describe("downloadGridViewExcel / downloadGridViewCSV 빈 데이터 가드", () => {
  test("Excel: 0건 → alert, advancedExcelDownload 미호출", () => {
    const h = loadHarness();
    const g = makeGrid(h, "grd_main", "dlt_main", 0);
    h.sandbox.scwin.downloadGridViewExcel(g, { fileName: "a.xlsx" }, []);
    expect(h.sandbox.$c.win.alert).toHaveBeenCalledWith(MSG);
    expect(g.advancedExcelDownload).not.toHaveBeenCalled();
  });

  test("Excel: 데이터 있음 → alert 없이 advancedExcelDownload 호출", () => {
    const h = loadHarness();
    const g = makeGrid(h, "grd_main", "dlt_main", 2);
    h.sandbox.scwin.downloadGridViewExcel(g, { fileName: "a.xlsx" }, []);
    expect(h.sandbox.$c.win.alert).not.toHaveBeenCalled();
    expect(g.advancedExcelDownload).toHaveBeenCalledTimes(1);
  });

  test("Excel: dataList 미바인딩 → alert, 미호출", () => {
    const h = loadHarness();
    const g = makeGrid(h, "grd_main", "dlt_main", null);
    h.sandbox.scwin.downloadGridViewExcel(g, { fileName: "a.xlsx" }, []);
    expect(h.sandbox.$c.win.alert).toHaveBeenCalledWith(MSG);
    expect(g.advancedExcelDownload).not.toHaveBeenCalled();
  });

  test("CSV: 0건 → alert, saveCSV 미호출", () => {
    const h = loadHarness();
    const g = makeGrid(h, "grd_main", "dlt_main", 0);
    h.sandbox.scwin.downloadGridViewCSV(g, { fileName: "a.csv" });
    expect(h.sandbox.$c.win.alert).toHaveBeenCalledWith(MSG);
    expect(g.saveCSV).not.toHaveBeenCalled();
  });

  test("CSV: 데이터 있음 → alert 없이 saveCSV 호출", () => {
    const h = loadHarness();
    const g = makeGrid(h, "grd_main", "dlt_main", 5);
    h.sandbox.scwin.downloadGridViewCSV(g, { fileName: "a.csv" });
    expect(h.sandbox.$c.win.alert).not.toHaveBeenCalled();
    expect(g.saveCSV).toHaveBeenCalledTimes(1);
  });
});
