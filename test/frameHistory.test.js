/**
 * moveUrl/setPageFrameSrc 히스토리 기록·복원(frameInfo) 회귀 테스트.
 *
 * isHistory 옵션 지정 시: 떠나는 화면 entry 에 replaceState 로 frameInfo+dataInfo 를 병합하고,
 * setSrc 완료 후 새 화면 entry 를 push 한다. popstate(__changePageState) 시 frameInfo entry 는
 * 해당 프레임을 기록된 화면으로 setSrc 복원하고 dataInfo 를 DataCollection 에 자동 적용한다.
 * WebSquare 런타임을 mock 으로 대체한 vm 하네스로 검증한다.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILE = "src/gcc/win.xml";

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

// setJSON 기록용 mock DataCollection
function makeDc() {
  const dc = { applied: [], setJSON: (j) => { dc.applied.push(j); } };
  return dc;
}

// mock pageFrame: async setSrc(항상 성공), getSrc, getWindow(컴포넌트 scope)
function makeFrame(id, src, comps) {
  const scopeWin = Object.assign({}, comps);
  scopeWin.$p = { getComponentById: (cid) => scopeWin[cid] };
  return {
    id,
    _src: src,
    setSrcCalls: [],
    getSrc() { return this._src; },
    getWindow() { return scopeWin; },
    setSrc(url, param) {
      this.setSrcCalls.push({ url, param });
      this._src = url;
      return Promise.resolve(true);
    },
  };
}

function loadHarness(contextPath = "") {
  const state = { frames: {}, pushed: [], replaced: [] };
  const sandbox = {
    console, JSON, Array, String, Object, Date, Boolean, Number, Promise, Math,
    parseFloat, parseInt,
    scwin: {},
    WebSquareExternal: { contextPath: "" },
    history: {
      state: null,
      pushState: (stateObj, title, url) => { state.pushed.push({ stateObj, url }); },
      replaceState: (stateObj) => { state.replaced.push(stateObj); sandbox.history.state = stateObj; },
    },
    $c: {
      util: { isEmpty, getComponent: (id) => state.frames[id] || null },
      sbm: { getContextPath: () => contextPath },
      win: {}, // 로드 후 scwin 으로 연결
    },
    $p: { getFrame: () => state.frames.pfm_current },
    window: {},
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: path.basename(XML_FILE) + ".cdata.js" });
  sandbox.$c.win = sandbox.scwin;
  return { scwin: sandbox.scwin, state, sandbox };
}

const flush = () => new Promise((r) => setImmediate(r));

describe("moveUrl/setPageFrameSrc 히스토리 기록·복원 (src/gcc/win.xml)", () => {
  test("moveUrl 기본(옵션 없음): setSrc 만 수행, 히스토리 기록 없음 — 기존 동작 유지", async () => {
    const h = loadHarness();
    h.state.frames.pfm_current = makeFrame("pfm_current", "/list.xml");

    await h.scwin.moveUrl("/detail.xml", { docId: 7 });

    expect(h.state.frames.pfm_current.setSrcCalls).toHaveLength(1);
    expect(h.state.frames.pfm_current.setSrcCalls[0].url).toBe("/detail.xml");
    expect(h.state.frames.pfm_current.setSrcCalls[0].param.dataObject.data).toEqual({ docId: 7 });
    expect(h.state.pushed).toHaveLength(0);
    expect(h.state.replaced).toHaveLength(0);
  });

  test("moveUrl isHistory: 떠나는 entry 에 frameInfo+dataInfo 병합(기존 menuInfo 유지) 후 새 entry push", async () => {
    const h = loadHarness();
    h.state.frames.pfm_current = makeFrame("pfm_current", "/list.xml");
    // X 화면은 메뉴로 진입한 상태 (menu entry)
    h.sandbox.history.state = { data: { srchKey: "A", menuInfo: { menuNm: "목록", menuCode: "C1", src: "/list.xml" } } };

    await h.scwin.moveUrl("/detail.xml", { docId: 7 }, {
      isHistory: true,
      dataInfo: { dma_search: { k: "A" }, dlt_list: [{ r: 1 }] },
    });

    // 1) replaceState — 떠나는(X) entry: menuInfo 보존 + frameInfo(이동 전 src) + dataInfo
    expect(h.state.replaced).toHaveLength(1);
    const stamped = h.state.replaced[0].data;
    expect(stamped.menuInfo.menuCode).toBe("C1");
    expect(stamped.frameInfo).toEqual({ frameId: "pfm_current", src: "/list.xml" });
    expect(stamped.dataInfo).toEqual({ dma_search: { k: "A" }, dlt_list: [{ r: 1 }] });

    // 2) pushState — 새(Y) entry: paramObj + frameInfo(이동 후 src)
    expect(h.state.pushed).toHaveLength(1);
    const pushed = h.state.pushed[0].stateObj.data;
    expect(pushed.docId).toBe(7);
    expect(pushed.frameInfo).toEqual({ frameId: "pfm_current", src: "/detail.xml" });
  });

  test("dataInfo 정제: 함수 등 비직렬화 값 제거, 크기 초과 시 기록 제외", async () => {
    const h = loadHarness();
    h.state.frames.pfm_current = makeFrame("pfm_current", "/list.xml");

    await h.scwin.moveUrl("/a.xml", {}, {
      isHistory: true,
      dataInfo: { dma: { k: "A", fn: function () {} } }, // 함수는 JSON 라운드트립으로 제거
    });
    expect(h.state.replaced[0].data.dataInfo).toEqual({ dma: { k: "A" } });

    await h.scwin.moveUrl("/b.xml", {}, {
      isHistory: true,
      dataInfo: { big: "x".repeat(1024 * 1024 + 10) }, // 최대 크기 초과 → dataInfo 미기록
    });
    expect(h.state.replaced[1].data.dataInfo).toBeUndefined();
    expect(h.state.pushed).toHaveLength(2); // entry push 자체는 정상
  });

  test("setPageFrameSrc isHistory: 지정 프레임 기준으로 동일 동작", async () => {
    const h = loadHarness();
    const pfm = makeFrame("pfm_body", "/x.xml");
    h.state.frames.pfm_body = pfm;

    await h.scwin.setPageFrameSrc(pfm, "/y.xml", { p: 1 }, { isHistory: true });

    expect(h.state.replaced[0].data.frameInfo).toEqual({ frameId: "pfm_body", src: "/x.xml" });
    expect(h.state.pushed[0].stateObj.data.frameInfo).toEqual({ frameId: "pfm_body", src: "/y.xml" });
  });

  test("__changePageState(frameInfo entry): 프레임을 기록된 화면으로 setSrc 복원 + dataInfo 자동 적용", async () => {
    const h = loadHarness();
    const dma = makeDc(); const dlt = makeDc();
    const pfm = makeFrame("pfm_body", "/detail.xml", { dma_search: dma, dlt_list: dlt });
    h.state.frames.pfm_body = pfm;
    h.sandbox.history.state = {
      data: {
        srchKey: "A",
        frameInfo: { frameId: "pfm_body", src: "/list.xml" },
        dataInfo: { dma_search: { k: "A" }, dlt_list: [{ r: 1 }] },
      },
    };

    h.scwin.__changePageState();
    await flush();

    expect(pfm.setSrcCalls).toHaveLength(1);
    expect(pfm.setSrcCalls[0].url).toBe("/list.xml");
    const paramData = pfm.setSrcCalls[0].param.dataObject.data;
    expect(paramData._isHistoryRestore).toBe(true); // 복원 진입 표식 (자동조회 skip 용)
    expect(paramData.srchKey).toBe("A");
    expect(dma.applied).toEqual([{ k: "A" }]);
    expect(dlt.applied).toEqual([[{ r: 1 }]]);
  });

  test("__changePageState: 프레임 미발견 시 menuInfo 로 openMenu 폴백", async () => {
    const h = loadHarness();
    const calls = [];
    h.scwin.openMenu = (menuNm, url, menuCode, paramObj, option) => { calls.push({ menuCode, option }); };
    h.sandbox.history.state = {
      data: {
        frameInfo: { frameId: "pfm_gone", src: "/list.xml" },
        menuInfo: { menuNm: "목록", menuCode: "C1", src: "/list.xml" },
      },
    };

    h.scwin.__changePageState();
    await flush();

    expect(calls).toHaveLength(1);
    expect(calls[0].menuCode).toBe("C1");
    expect(calls[0].option).toEqual({ isHistory: false });
  });

  test("restoreData: 스냅샷이 있으면 복원 이동 — paramData 계약 + dataInfo 자동 적용 (컨텍스트패스·쿼리 정규화 포함)", async () => {
    const h = loadHarness("/ctx");
    const dma = makeDc(); const dlt = makeDc();
    const frame = makeFrame("pfm_current", "/ctx/board/list.xml?menu=1", { dma_search: dma, dlt_list: dlt });
    h.state.frames.pfm_current = frame;
    h.sandbox.history.state = { data: { srchKey: "A" } };

    // 목록 → 상세 (스냅샷 stamp: 키는 컨텍스트패스·쿼리 제거된 "/board/list.xml")
    await h.scwin.moveUrl("/board/detail.xml", { docId: "7" }, {
      isHistory: true,
      dataInfo: { dma_search: { k: "A" }, _pagingInfo: { currentPage: 3, totalCnt: 135 } },
    });

    // 상세 → [목록] 버튼 (복원 이동)
    await h.scwin.moveUrl("/board/list.xml", null, { restoreData: true });

    const back = frame.setSrcCalls[1];
    expect(back.url).toBe("/ctx/board/list.xml");
    const paramData = back.param.dataObject.data;
    expect(paramData._isHistoryRestore).toBe(true);
    expect(paramData.srchKey).toBe("A"); // 원래 entry 파라미터 유지
    expect(paramData.dataInfo._pagingInfo).toEqual({ currentPage: 3, totalCnt: 135 }); // 예약 키 전달
    expect(dma.applied).toEqual([{ k: "A" }]); // 컴포넌트 자동 적용
    expect(dlt.applied).toEqual([]); // 스냅샷에 없던 컴포넌트는 미적용, _pagingInfo 는 적용 시도 안 함
  });

  test("restoreData: 스냅샷이 없으면 일반 이동 (paramObj 그대로, _isHistoryRestore 없음)", async () => {
    const h = loadHarness();
    const frame = makeFrame("pfm_current", "/a.xml");
    h.state.frames.pfm_current = frame;

    await h.scwin.moveUrl("/board/list.xml", { p: 1 }, { restoreData: true });

    expect(frame.setSrcCalls[0].param.dataObject.data).toEqual({ p: 1 });
    expect(h.state.pushed).toHaveLength(0);
  });

  test("restoreData: 명시적 paramObj 가 스냅샷 값보다 우선", async () => {
    const h = loadHarness();
    const frame = makeFrame("pfm_current", "/list.xml", { dma_search: makeDc() });
    h.state.frames.pfm_current = frame;
    h.sandbox.history.state = { data: { srchKey: "A" } };

    await h.scwin.moveUrl("/detail.xml", {}, { isHistory: true, dataInfo: { dma_search: { k: "A" } } });
    await h.scwin.moveUrl("/list.xml", { srchKey: "B" }, { restoreData: true });

    expect(frame.setSrcCalls[1].param.dataObject.data.srchKey).toBe("B");
  });

  test("복원 대상 컴포넌트 미존재 시 warn 만 하고 예외 없음", async () => {
    const h = loadHarness();
    const pfm = makeFrame("pfm_body", "/d.xml", {}); // 컴포넌트 없음
    h.state.frames.pfm_body = pfm;
    h.sandbox.history.state = {
      data: { frameInfo: { frameId: "pfm_body", src: "/l.xml" }, dataInfo: { dma_none: { k: 1 } } },
    };

    expect(() => h.scwin.__changePageState()).not.toThrow();
    await flush();
    expect(pfm.setSrcCalls).toHaveLength(1); // 화면 복원 자체는 수행
  });
});
