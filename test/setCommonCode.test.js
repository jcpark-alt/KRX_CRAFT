/**
 * $c.data.setCommonCode 배열 매핑 회귀 테스트.
 *
 * setCommonCode 는 WebSquare 런타임($c/$p/컴포넌트 API)에 의존하므로, 런타임을 mock 으로
 * 대체한 vm 하네스로 data.xml 의 CDATA 를 로드해 실제 구동한다. code/compID 배열 매핑,
 * mappingKey override, 단일 code 회귀를 검증한다. src/gcc 와 src/cm/gcc 두 사본 모두 대상
 * (사본 divergence 도 감지).
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILES = ["src/gcc/data.xml", "src/cm/gcc/data.xml"];

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

// data.xml CDATA 를 mock 런타임 위에 로드하고, 테스트가 조작할 핸들을 반환한다.
function loadHarness(xmlPath) {
  const state = { comps: {}, dls: {}, lastServer: null, serverBody: {} };

  function makeComp(id) {
    const c = {
      id,
      getPluginName: () => "selectbox",
      setNodeSet: (src, label, value) => { c._bound = { src, label, value }; },
      setColumnNodeSet: (col, src, label, value) => { c._boundCol = { col, src, label, value }; },
      setValue: (v) => { c._value = v; },
      _bound: null,
    };
    return c;
  }
  function makeDataList(id) {
    const d = {
      id, initializeType: "dataList", _rows: [],
      setJSON: (j) => { d._rows = j; },
      getRowCount: () => d._rows.length,
      getCellData: (i, col) => (d._rows[i] ? d._rows[i][col] : undefined),
      setCellData: (i, col, v) => { d._rows[i][col] = v; },
    };
    return d;
  }

  const sandbox = {
    console, JSON, Array, String, Object, Date, Boolean, Number, Promise, encodeURIComponent,
    scwin: {},
    $c: {
      util: { isEmpty, getComponent: (id) => state.comps[id], getJSON: (x) => x },
      str: { escapeToChar: (s) => s },
      sbm: {
        executeDynamic: async (opts) => {
          state.lastServer = opts;
          return { responseJSON: { body: state.serverBody } };
        },
      },
      data: {},
    },
    $p: {
      data: { create: (opt) => { state.dls[opt.id] = makeDataList(opt.id); } },
      getComponentById: (id) => state.dls[id],
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(xmlPath), sandbox, { filename: path.basename(xmlPath) + ".cdata.js" });

  return { scwin: sandbox.scwin, state, makeComp };
}

const vals = (rows, col) => rows.map((r) => r[col]);

describe.each(XML_FILES)("setCommonCode 배열 매핑 (%s)", (xmlPath) => {
  let h;
  beforeEach(() => { h = loadHarness(xmlPath); }); // 매 테스트 fresh (캐시/상태 격리)

  test("code 배열 → body[code]별로 병렬 compID 에 매핑 (기본 key=code)", async () => {
    h.state.comps = { sbx_A: h.makeComp("sbx_A"), sbx_B: h.makeComp("sbx_B") };
    h.state.serverBody = {
      "00001": [{ value: "A1", text: "A-one" }, { value: "A2", text: "A-two" }],
      "00005": [{ value: "B1", text: "B-one" }],
    };
    await h.scwin.setCommonCode([{ code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"] }]);

    expect(h.state.lastServer.action).toMatch(/cdEngNmList=00001%2000005/); // 공백 encode
    const rowsA = h.state.dls["dlt_commonCode00001___sbx_A"]._rows;
    const rowsB = h.state.dls["dlt_commonCode00005___sbx_B"]._rows;
    expect(vals(rowsA, "value")).toEqual(expect.arrayContaining(["A1", "A2"]));
    expect(vals(rowsB, "value")).toContain("B1");
    expect(vals(rowsB, "value")).not.toContain("A1"); // 교차오염 없음
    expect(h.state.comps.sbx_A._bound.src).toBe("data:dlt_commonCode00001___sbx_A");
    expect(rowsA[0].text).toBe("선택"); // 기본 firstRow 선두 삽입
  });

  test("mappingKey 로 body key 재정의", async () => {
    h.state.comps = { sbx_A: h.makeComp("sbx_A"), sbx_B: h.makeComp("sbx_B") };
    h.state.serverBody = {
      grpA: [{ value: "GA", text: "grpA-item" }],
      grpB: [{ value: "GB", text: "grpB-item" }],
    };
    await h.scwin.setCommonCode([{
      code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"], mappingKey: ["grpA", "grpB"],
    }]);

    expect(vals(h.state.dls["dlt_commonCode00001___sbx_A"]._rows, "value")).toContain("GA");
    expect(vals(h.state.dls["dlt_commonCode00005___sbx_B"]._rows, "value")).toContain("GB");
  });

  test("단일 code(문자열)는 cdEngNm 사용 — 기존 동작 유지", async () => {
    h.state.comps = { sbx_S: h.makeComp("sbx_S") };
    h.state.serverBody = [{ value: "S1", text: "single-one" }]; // 단일은 body 가 배열
    await h.scwin.setCommonCode([{ code: "00009", compID: "sbx_S" }]);

    expect(h.state.lastServer.action).toMatch(/cdEngNm=00009/);
    expect(h.state.lastServer.action).not.toMatch(/cdEngNmList/);
    expect(vals(h.state.dls["dlt_commonCode00009___sbx_S"]._rows, "value")).toContain("S1");
  });
});
