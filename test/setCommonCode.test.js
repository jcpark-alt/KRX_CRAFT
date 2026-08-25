/**
 * $c.data.setCommonCode 배열 매핑 회귀 테스트.
 *
 * setCommonCode 는 WebSquare 런타임($c/$p/컴포넌트 API)에 의존하므로, 런타임을 mock 으로
 * 대체한 vm 하네스로 data.xml 의 CDATA 를 로드해 실제 구동한다.
 * 배열 code 는 한 번의 통합 목록 조회(cdEngNmList, 콤마 구분) 후 mappingKey[i] 컬럼 값이
 * code 와 같은 행만 추출해 병렬 compID 에 바인딩한다(미지정 시 전체 목록). 단일 code 회귀 포함.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILES = ["src/gcc/data.xml"];

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
      util: { isEmpty, isArray: Array.isArray, getComponent: (id) => state.comps[id], getJSON: (x) => x },
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

  test("code 배열 → 통합 목록을 mappingKey 컬럼 값으로 분리해 병렬 compID 에 매핑", async () => {
    h.state.comps = { sbx_A: h.makeComp("sbx_A"), sbx_B: h.makeComp("sbx_B") };
    h.state.serverBody = [
      { grpCd: "00001", cdVal: "A1", cdValNm: "A-one" },
      { grpCd: "00001", cdVal: "A2", cdValNm: "A-two" },
      { grpCd: "00005", cdVal: "B1", cdValNm: "B-one" },
    ];
    await h.scwin.setCommonCode([{
      code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"], mappingKey: ["grpCd", "grpCd"],
    }]);

    expect(h.state.lastServer.action).toMatch(/cdEngNmList=00001%2C00005/); // 콤마(%2C) 구분
    const rowsA = h.state.dls["dlt_commonCode_00001___sbx_A"]._rows;
    const rowsB = h.state.dls["dlt_commonCode_00005___sbx_B"]._rows;
    expect(vals(rowsA, "cdVal")).toEqual(expect.arrayContaining(["A1", "A2"]));
    expect(vals(rowsB, "cdVal")).toContain("B1");
    expect(vals(rowsB, "cdVal")).not.toContain("A1"); // 교차오염 없음
    expect(h.state.comps.sbx_A._bound.src).toBe("data:dlt_commonCode_00001___sbx_A");
    expect(rowsA[0].cdValNm).toBe("A-one"); // 기본 firstRow("선택") 자동 삽입 없음 — 명시 옵션일 때만
  });

  test("firstRow 명시 시에만 선두 항목이 삽입된다", async () => {
    h.state.comps = { sbx_F: h.makeComp("sbx_F") };
    h.state.serverBody = [{ cdVal: "F1", cdValNm: "F-one" }];
    await h.scwin.setCommonCode([{ code: "00011", compID: "sbx_F", firstRow: ["", "선택"] }]);

    const rows = h.state.dls["dlt_commonCode_00011___sbx_F"]._rows;
    expect(rows[0].cdValNm).toBe("선택");
    expect(rows[0].cdVal).toBe("");
    expect(vals(rows, "cdVal")).toContain("F1");
  });

  test("mappingKey 미지정 시 전체 목록을 각 compID 에 바인딩 (예외 없음)", async () => {
    h.state.comps = { sbx_A: h.makeComp("sbx_A"), sbx_B: h.makeComp("sbx_B") };
    h.state.serverBody = [
      { grpCd: "00001", cdVal: "A1", cdValNm: "A-one" },
      { grpCd: "00005", cdVal: "B1", cdValNm: "B-one" },
    ];
    await h.scwin.setCommonCode([{ code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"] }]);

    const rowsA = h.state.dls["dlt_commonCode_00001___sbx_A"]._rows;
    const rowsB = h.state.dls["dlt_commonCode_00005___sbx_B"]._rows;
    expect(vals(rowsA, "cdVal")).toEqual(expect.arrayContaining(["A1", "B1"]));
    expect(vals(rowsB, "cdVal")).toEqual(expect.arrayContaining(["A1", "B1"]));
  });

  test("단일 code(문자열)는 cdEngNm 사용 — 기존 동작 유지", async () => {
    h.state.comps = { sbx_S: h.makeComp("sbx_S") };
    h.state.serverBody = [{ cdVal: "S1", cdValNm: "single-one" }]; // 단일은 body 가 배열
    await h.scwin.setCommonCode([{ code: "00009", compID: "sbx_S" }]);

    expect(h.state.lastServer.action).toMatch(/cdEngNm=00009/);
    expect(h.state.lastServer.action).not.toMatch(/cdEngNmList/);
    expect(vals(h.state.dls["dlt_commonCode_00009___sbx_S"]._rows, "cdVal")).toContain("S1");
  });

  test("labelColumn/valueColumn 문자열 지정 시 전체 컴포넌트 공통 적용", async () => {
    h.state.comps = { sbx_A: h.makeComp("sbx_A"), sbx_B: h.makeComp("sbx_B") };
    h.state.serverBody = [
      { grpCd: "00001", custCd: "A1", custNm: "A-one" },
      { grpCd: "00005", custCd: "B1", custNm: "B-one" },
    ];
    await h.scwin.setCommonCode([{
      code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"], mappingKey: ["grpCd", "grpCd"],
      labelColumn: "custNm", valueColumn: "custCd", // 문자열 — 두 컴포넌트 모두 동일 컬럼
    }]);

    expect(h.state.comps.sbx_A._bound.label).toBe("custNm");
    expect(h.state.comps.sbx_A._bound.value).toBe("custCd");
    expect(h.state.comps.sbx_B._bound.label).toBe("custNm");
    expect(vals(h.state.dls["dlt_commonCode_00005___sbx_B"]._rows, "custCd")).toContain("B1");
  });

  test("labelColumn/valueColumn 배열 지정 시 컴포넌트별 override (누락 인덱스는 기본값)", async () => {
    h.state.comps = { sbx_A: h.makeComp("sbx_A"), sbx_B: h.makeComp("sbx_B") };
    h.state.serverBody = [
      { grpCd: "00001", custCd: "A1", custNm: "A-one", cdVal: "A1", cdValNm: "A-one" },
      { grpCd: "00005", custCd: "B1", custNm: "B-one", cdVal: "B1", cdValNm: "B-one" },
    ];
    await h.scwin.setCommonCode([{
      code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"], mappingKey: ["grpCd", "grpCd"],
      labelColumn: ["custNm"], valueColumn: ["custCd"], // 배열 — 첫 컴포넌트만 override
    }]);

    expect(h.state.comps.sbx_A._bound.label).toBe("custNm");
    expect(h.state.comps.sbx_B._bound.label).toBe("cdValNm"); // 누락 인덱스 → 기본(COMMON_CODE_INFO.LABEL)
    expect(h.state.comps.sbx_B._bound.value).toBe("cdVal");
  });

  test("url 옵션 지정 시 기본 API(COMMON_CODE_INFO.URL) 대신 해당 경로로 조회", async () => {
    h.state.comps = { sbx_S: h.makeComp("sbx_S") };
    h.state.serverBody = [{ cdVal: "U1", cdValNm: "url-one" }];
    await h.scwin.setCommonCode([{ code: "00011", compID: "sbx_S", url: "/api/mgt/custom-code" }]);

    expect(h.state.lastServer.action).toBe("/api/mgt/custom-code?cdEngNm=00011");
    expect(vals(h.state.dls["dlt_commonCode_00011___sbx_S"]._rows, "cdVal")).toContain("U1");

    // 배열 code + url 조합도 동일 경로 사용
    h.state.serverBody = [
      { grpCd: "00001", cdVal: "A1", cdValNm: "A-one" },
      { grpCd: "00005", cdVal: "B1", cdValNm: "B-one" },
    ];
    h.state.comps.sbx_A = h.makeComp("sbx_A");
    h.state.comps.sbx_B = h.makeComp("sbx_B");
    await h.scwin.setCommonCode([{
      code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"], mappingKey: ["grpCd", "grpCd"],
      url: "/api/mgt/custom-code",
    }]);
    expect(h.state.lastServer.action).toBe("/api/mgt/custom-code?cdEngNmList=00001%2C00005");
  });

  test("paramName 옵션 지정 시 기본 쿼리 파라미터명(cdEngNm/cdEngNmList) 대신 해당 이름으로 조회", async () => {
    h.state.comps = { sbx_S: h.makeComp("sbx_S") };
    h.state.serverBody = [{ cdVal: "P1", cdValNm: "param-one" }];
    await h.scwin.setCommonCode([{ code: "00012", compID: "sbx_S", paramName: "grpCd" }]);
    expect(h.state.lastServer.action).toBe("/api/common/common-code?grpCd=00012");

    // 배열 code + paramName + url 조합
    h.state.serverBody = [
      { grpCd: "00001", cdVal: "A1", cdValNm: "A-one" },
      { grpCd: "00005", cdVal: "B1", cdValNm: "B-one" },
    ];
    h.state.comps.sbx_A = h.makeComp("sbx_A");
    h.state.comps.sbx_B = h.makeComp("sbx_B");
    await h.scwin.setCommonCode([{
      code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"], mappingKey: ["grpCd", "grpCd"],
      url: "/api/mgt/custom-code", paramName: "grpCdList",
    }]);
    expect(h.state.lastServer.action).toBe("/api/mgt/custom-code?grpCdList=00001%2C00005");
  });

  test("단일 code 의 key 래핑 응답은 첫 key 목록으로 언래핑", async () => {
    h.state.comps = { sbx_S: h.makeComp("sbx_S") };
    h.state.serverBody = { codeList: [{ cdVal: "W1", cdValNm: "wrapped-one" }] }; // key 래핑 응답
    await h.scwin.setCommonCode([{ code: "00010", compID: "sbx_S" }]);

    expect(vals(h.state.dls["dlt_commonCode_00010___sbx_S"]._rows, "cdVal")).toContain("W1");
  });
});
