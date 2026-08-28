/**
 * $c.data.setCommonCode 배열 매핑 회귀 테스트.
 *
 * setCommonCode 는 WebSquare 런타임($c/$p/컴포넌트 API)에 의존하므로, 런타임을 mock 으로
 * 대체한 vm 하네스로 data.xml 의 CDATA 를 로드해 실제 구동한다.
 * 단일 code 는 COMMON_CODE_INFO.URL + PARAM(cdEngNm), 배열 code 는 URL_LIST + PARAM_LIST(cdEngNmList,
 * 콤마 구분)로 조회한다. 배열 code 응답 body 는 key 별로 목록이 담긴 객체({ key: [rows], ... })이며,
 * 각 code 의 목록은 mappingKey[i](미지정 시 code 값) key 로 찾아 대응 compID 에 바인딩한다.
 * label/value 컬럼은 FILED_ARR([label, value]) 고정(filedArr 로 재정의).
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
  const state = { comps: {}, dls: {}, lastServer: null, serverBody: {}, serverCalls: 0 };

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
          state.serverCalls += 1;
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
  sandbox.$c.data = sandbox.scwin;   // 실환경 네임스페이스 배선 — 내부 호출이 $c.data.* 경유(빌드 $p 주입 규칙)

  return { scwin: sandbox.scwin, state, makeComp };
}

const vals = (rows, col) => rows.map((r) => r[col]);

describe.each(XML_FILES)("setCommonCode 배열 매핑 (%s)", (xmlPath) => {
  let h;
  beforeEach(() => { h = loadHarness(xmlPath); }); // 매 테스트 fresh (캐시/상태 격리)

  test("code 배열 → code별 키잉된 응답 목록을 병렬 compID 에 매핑", async () => {
    h.state.comps = { sbx_A: h.makeComp("sbx_A"), sbx_B: h.makeComp("sbx_B") };
    h.state.serverBody = {
      "00001": [
        { cdVal: "A1", cdValNm: "A-one" },
        { cdVal: "A2", cdValNm: "A-two" },
      ],
      "00005": [{ cdVal: "B1", cdValNm: "B-one" }],
    };
    await h.scwin.setCommonCode([{
      code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"],
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

  test("mappingKey 지정 시 응답 body 에서 mappingKey[i] key 의 목록을 각 code 에 매핑", async () => {
    h.state.comps = { sbx_A: h.makeComp("sbx_A"), sbx_B: h.makeComp("sbx_B") };
    h.state.serverBody = {
      grpA: [{ cdVal: "A1", cdValNm: "A-one" }],
      grpB: [{ cdVal: "B1", cdValNm: "B-one" }],
    };
    await h.scwin.setCommonCode([{
      code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"], mappingKey: ["grpA", "grpB"],
    }]);

    // DataList/조회 키는 code 기준 유지, 목록만 mappingKey 로 찾는다.
    const rowsA = h.state.dls["dlt_commonCode_00001___sbx_A"]._rows;
    const rowsB = h.state.dls["dlt_commonCode_00005___sbx_B"]._rows;
    expect(vals(rowsA, "cdVal")).toContain("A1");
    expect(vals(rowsB, "cdVal")).toContain("B1");
    expect(vals(rowsB, "cdVal")).not.toContain("A1");
  });

  test("mappingKey 일부만 지정(null) 시 나머지는 code 값을 key 로 사용", async () => {
    h.state.comps = { sbx_A: h.makeComp("sbx_A"), sbx_B: h.makeComp("sbx_B") };
    h.state.serverBody = {
      grpA: [{ cdVal: "A1", cdValNm: "A-one" }],
      "00005": [{ cdVal: "B1", cdValNm: "B-one" }],
    };
    await h.scwin.setCommonCode([{
      code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"], mappingKey: ["grpA", null],
    }]);

    expect(vals(h.state.dls["dlt_commonCode_00001___sbx_A"]._rows, "cdVal")).toContain("A1");
    expect(vals(h.state.dls["dlt_commonCode_00005___sbx_B"]._rows, "cdVal")).toContain("B1");
  });

  test("단일 code(문자열)는 cdEngNm 사용 — 기존 동작 유지", async () => {
    h.state.comps = { sbx_S: h.makeComp("sbx_S") };
    h.state.serverBody = [{ cdVal: "S1", cdValNm: "single-one" }]; // 단일은 body 가 배열
    await h.scwin.setCommonCode([{ code: "00009", compID: "sbx_S" }]);

    expect(h.state.lastServer.action).toMatch(/cdEngNm=00009/);
    expect(h.state.lastServer.action).not.toMatch(/cdEngNmList/);
    expect(vals(h.state.dls["dlt_commonCode_00009___sbx_S"]._rows, "cdVal")).toContain("S1");
  });

  test("filedArr 지정 시 [label, value] 컬럼으로 바인딩 (미지정 시 FILED_ARR 기본)", async () => {
    h.state.comps = { sbx_A: h.makeComp("sbx_A"), sbx_B: h.makeComp("sbx_B") };
    h.state.serverBody = {
      "00001": [{ custCd: "A1", custNm: "A-one", cdVal: "A1", cdValNm: "A-one" }],
      "00005": [{ custCd: "B1", custNm: "B-one", cdVal: "B1", cdValNm: "B-one" }],
    };
    await h.scwin.setCommonCode([{
      code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"],
      filedArr: ["custNm", "custCd"], // [label, value] 재정의
    }]);

    expect(h.state.comps.sbx_A._bound.label).toBe("custNm");
    expect(h.state.comps.sbx_A._bound.value).toBe("custCd");
    expect(h.state.comps.sbx_B._bound.label).toBe("custNm");
    expect(vals(h.state.dls["dlt_commonCode_00005___sbx_B"]._rows, "custCd")).toContain("B1");

    // 미지정 시 기본 FILED_ARR(["cdValNm", "cdVal"])
    h.state.comps.sbx_C = h.makeComp("sbx_C");
    await h.scwin.setCommonCode([{ code: "00013", compID: "sbx_C" }]);
    expect(h.state.comps.sbx_C._bound.label).toBe("cdValNm");
    expect(h.state.comps.sbx_C._bound.value).toBe("cdVal");
  });

  test("단일 code 는 URL(cdEngNm), 배열 code 는 URL_LIST(cdEngNmList) 로 조회", async () => {
    h.state.comps = { sbx_S: h.makeComp("sbx_S") };
    h.state.serverBody = [{ cdVal: "U1", cdValNm: "url-one" }];
    await h.scwin.setCommonCode([{ code: "00011", compID: "sbx_S" }]);

    expect(h.state.lastServer.action).toBe("/api/common/common-code?cdEngNm=00011");
    expect(vals(h.state.dls["dlt_commonCode_00011___sbx_S"]._rows, "cdVal")).toContain("U1");

    // 배열 code 는 통합 목록 API(URL_LIST) 사용
    h.state.serverBody = {
      "00001": [{ cdVal: "A1", cdValNm: "A-one" }],
      "00005": [{ cdVal: "B1", cdValNm: "B-one" }],
    };
    h.state.comps.sbx_A = h.makeComp("sbx_A");
    h.state.comps.sbx_B = h.makeComp("sbx_B");
    await h.scwin.setCommonCode([{
      code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"],
    }]);
    expect(h.state.lastServer.action).toBe("/api/common/common-codes?cdEngNmList=00001%2C00005");
  });

  test("동일 code 재호출 시 캐시 히트로 서버 재조회를 생략하고, useLocalCache:false 는 재조회", async () => {
    h.state.comps = { sbx_S: h.makeComp("sbx_S") };
    h.state.serverBody = [{ cdVal: "C1", cdValNm: "cache-one" }];
    await h.scwin.setCommonCode([{ code: "00030", compID: "sbx_S" }]);
    expect(h.state.serverCalls).toBe(1);

    await h.scwin.setCommonCode([{ code: "00030", compID: "sbx_S" }]);
    expect(h.state.serverCalls).toBe(1); // 캐시 히트 — 재조회 없음
    expect(vals(h.state.dls["dlt_commonCode_00030___sbx_S"]._rows, "cdVal")).toContain("C1");

    await h.scwin.setCommonCode([{ code: "00030", compID: "sbx_S", useLocalCache: false }]);
    expect(h.state.serverCalls).toBe(2); // 캐시 무효화 — 재조회
  });

  test("배열 code 는 전부 캐시일 때만 생략, 일부 미보유 시 재조회", async () => {
    h.state.comps = { sbx_A: h.makeComp("sbx_A"), sbx_B: h.makeComp("sbx_B") };
    h.state.serverBody = {
      "00001": [{ cdVal: "A1", cdValNm: "A-one" }],
      "00005": [{ cdVal: "B1", cdValNm: "B-one" }],
    };
    await h.scwin.setCommonCode([{ code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"] }]);
    expect(h.state.serverCalls).toBe(1);

    await h.scwin.setCommonCode([{ code: ["00001", "00005"], compID: ["sbx_A", "sbx_B"] }]);
    expect(h.state.serverCalls).toBe(1); // 전부 캐시 — 생략

    h.state.serverBody = {
      "00001": [{ cdVal: "A1", cdValNm: "A-one" }],
      "00007": [{ cdVal: "D1", cdValNm: "D-one" }],
    };
    await h.scwin.setCommonCode([{ code: ["00001", "00007"], compID: ["sbx_A", "sbx_B"] }]);
    expect(h.state.serverCalls).toBe(2); // 00007 미보유 — 재조회
    expect(vals(h.state.dls["dlt_commonCode_00007___sbx_B"]._rows, "cdVal")).toContain("D1");
  });

  test("단일 code 의 key 래핑 응답은 첫 key 목록으로 언래핑", async () => {
    h.state.comps = { sbx_S: h.makeComp("sbx_S") };
    h.state.serverBody = { codeList: [{ cdVal: "W1", cdValNm: "wrapped-one" }] }; // key 래핑 응답
    await h.scwin.setCommonCode([{ code: "00010", compID: "sbx_S" }]);

    expect(vals(h.state.dls["dlt_commonCode_00010___sbx_S"]._rows, "cdVal")).toContain("W1");
  });
});
