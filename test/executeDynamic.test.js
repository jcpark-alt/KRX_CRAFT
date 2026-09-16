/**
 * $c.sbm.executeDynamic 회귀 테스트 (cm/gcc/sbm.xml).
 *
 * executeDynamic 의 전체 흐름 — 간소화 ref/target 정규화 → 중복 실행 가드 → submission 생성/재생성
 * → gridview/자동 바인딩 디스크립터 부착 → execute(Promise) → 공통 콜백(__callbackSubmitFunction)에서
 * Promise settle·응답 자동 적재·grid 처리 — 를 WebSquare 엔진($p.createSubmission/executeSubmission 등)을
 * mock 으로 대체한 vm 하네스로 검증한다. 통신 완료는 엔진 대신 테스트가 __callbackSubmitFunction 을 직접 호출해 재현한다.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILE = "cm/gcc/sbm.xml";

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

// DataCollection mock — setJSON 호출과 ondataload 바인딩을 기록한다.
function makeDc(id, type) {
  const dc = {
    id, _type: type || "dataList", _setJSON: [], _handlers: {}, _rows: 0, _json: { key: "v" },
    getObjectType() { return dc._type; },
    getJSON() { return dc._json; },
    setJSON(data, append) { dc._setJSON.push({ data, append }); },
    bind(ev, fn) { dc._handlers[ev] = fn; },
    getRowCount() { return dc._rows; },
  };
  return dc;
}
function makeGrid(id) {
  return { id, _calls: [], initGrid() { this._calls.push("initGrid"); }, refresh() { this._calls.push("refresh"); }, setFocusedCell(r, c) { this._calls.push("focus:" + r + "," + c); } };
}

function loadHarness() {
  const state = { subs: {}, comps: {}, created: [], executed: [], deleted: [], aborted: [], alerts: [], resultMsgs: [] };
  const scopeP = { getComponentById: (id) => state.comps[id] || null };
  const $p = {
    id: "scope_",
    createSubmission(obj) {
      const sub = Object.assign({}, obj, {
        processStatus: 0,
        scope_id: "scope",
        getScopeWindow: () => ({ $p: scopeP }),
      });
      state.subs[obj.id] = sub;
      state.comps[obj.id] = sub;
      state.created.push(sub);
    },
    getSubmission: (id) => state.subs[id] || null,
    deleteSubmission(id) { state.deleted.push(id); delete state.subs[id]; delete state.comps[id]; },
    executeSubmission(sub, requestData, comp) {
      sub.processStatus = 1;                       // 비동기 통신 진행 중 (엔진 동작 재현)
      state.executed.push({ sub, requestData, comp });
    },
    getComponentById: (id) => state.comps[id] || null,
  };
  const sandbox = {
    console, JSON, Array, String, Object, Boolean, Number, Promise, Math,
    scwin: {},
    $c: {
      util: { isEmpty, isArray: Array.isArray, getComponent: (id) => state.comps[id] || null, isJSON: () => true },
      data: { getMessage: (id, arg) => `${id}:${arg || ""}` },
      win: { alert: (msg) => { state.alerts.push(msg); return Promise.resolve(); } },
      exception: { handleError: () => Promise.resolve() },
      sbm: { resultMsg: (m) => { state.resultMsgs.push(m); } },
    },
    $p,
    WebSquare: {
      core: { getConfiguration: () => "" },
      ModelUtil: { abort: (id, scopeId) => { state.aborted.push({ id, scopeId }); }, getSubmission: () => null },
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: path.basename(XML_FILE) + ".cdata.js" });
  sandbox.$c.sbm = Object.assign(sandbox.scwin, sandbox.$c.sbm);   // 실환경 네임스페이스 배선 — 내부 호출이 $c.sbm.* 경유
  return { scwin: sandbox.scwin, state, scopeP };
}

const baseOptions = () => ({ id: "sbm_search", action: "/api/search", ref: "dma_search", target: "dlt_a,dlt_b|append", isProcessMsg: false });
const okRes = (json) => ({ responseStatusCode: 200, errorType: "", responseJSON: json });

describe("$c.sbm.executeDynamic (cm/gcc/sbm.xml)", () => {
  let h;
  beforeEach(() => {
    h = loadHarness();
    h.state.comps.dma_search = makeDc("dma_search", "dataMap");
    h.state.comps.dlt_a = makeDc("dlt_a");
    h.state.comps.dlt_b = makeDc("dlt_b");
    h.state.comps.grd_main = makeGrid("grd_main");
    h.state.comps.grd_sub = makeGrid("grd_sub");
  });

  describe("submission 생성·재생성", () => {
    test("신규: 간소화 ref/target 정규화 후 createSubmission → 디스크립터 부착 → executeSubmission", () => {
      const opt = baseOptions();
      opt.submitDoneHandler = "scwin.onDone";
      h.scwin.executeDynamic(opt);

      expect(h.state.created).toHaveLength(1);
      const sub = h.state.created[0];
      expect(sub.ref).toBe("data:json,dma_search");            // 간소화 ref → 표준 표현식
      expect(sub.target).toBe("");                              // 간소화 target 은 비움(엔진 double-bind 방지)
      expect(sub._autoBindTargets).toEqual([{ id: "dlt_a" }, { id: "dlt_b", append: true }]);
      expect(sub.action).toBe("/api/search");
      expect(sub.mode).toBe(h.scwin.DEFAULT_OPTIONS_MODE);
      expect(sub.mediatype).toBe(h.scwin.DEFAULT_OPTIONS_MEDIATYPE);
      expect(sub.method).toBe("post");
      expect(sub.processMsg).toBe("");                          // isProcessMsg:false
      expect(sub.submitDoneHandler).toBe("scope_scwin.onDone"); // "scwin." 문자열 핸들러는 scope id 접두
      expect(sub.options).toEqual({});                          // 엔진 options 미존재 시 빈 객체 초기화
      expect(h.state.executed).toHaveLength(1);
      expect(h.state.executed[0].sub).toBe(sub);
    });

    test("재호출: 기존 submission 을 deleteSubmission 후 재생성해 실행 (통신 완료 후)", () => {
      h.scwin.executeDynamic(baseOptions());
      h.state.created[0].processStatus = 0;                     // 통신 완료 상태
      h.scwin.executeDynamic(baseOptions());

      expect(h.state.deleted).toEqual(["sbm_search"]);
      expect(h.state.created).toHaveLength(2);
      expect(h.state.executed).toHaveLength(2);
      expect(h.state.executed[1].sub).toBe(h.state.created[1]);
    });

    test("ref 'id=key'/다중 id 는 각각 객체/배열 표현식, 'data:' 접두 ref/target 은 그대로(하위 호환)", () => {
      h.scwin.executeDynamic(Object.assign(baseOptions(), { id: "s1", ref: "dma_search=body", target: "dlt_a=body.content" }));
      h.scwin.executeDynamic(Object.assign(baseOptions(), { id: "s2", ref: "dma_a,dlt_b" }));
      h.scwin.executeDynamic(Object.assign(baseOptions(), { id: "s3", ref: "data:json,dma_x", target: "data:json,dlt_x" }));

      const [s1, s2, s3] = h.state.created;
      expect(s1.ref).toBe('data:json,{"id":"dma_search","key":"body"}');
      expect(s1._autoBindTargets).toEqual([{ id: "dlt_a", key: "body.content" }]);
      expect(s2.ref).toBe('data:json,["dma_a","dlt_b"]');
      expect(s3.ref).toBe("data:json,dma_x");
      expect(s3.target).toBe("data:json,dlt_x");                // 엔진 직접 바인딩
      expect(s3._autoBindTargets).toBeUndefined();
    });

    test("gridview 지정 시 _gridview 부착·gridSpinner 기본 true, gridSpinner:false 면 false", () => {
      h.scwin.executeDynamic(Object.assign(baseOptions(), { id: "g1", gridview: "grd_main" }));
      h.scwin.executeDynamic(Object.assign(baseOptions(), { id: "g2", gridview: "grd_main", gridSpinner: false }));
      expect(h.state.created[0]._gridview).toBe("grd_main");
      expect(h.state.created[0]._gridSpinner).toBe(true);
      expect(h.state.created[1]._gridSpinner).toBe(false);
    });

    test("requestData 미전달 + 단건 DataMap ref 면 DataMap 의 JSON 을 requestData 로 전달", () => {
      h.scwin.executeDynamic(baseOptions());
      expect(h.state.executed[0].requestData).toEqual({ key: "v" });
    });

    test("requestData 전달 시 그대로 사용, 전송중 disable 컴포넌트도 전달", () => {
      const comp = { id: "btn" };
      h.scwin.executeDynamic(baseOptions(), { q: 1 }, comp);
      expect(h.state.executed[0].requestData).toEqual({ q: 1 });
      expect(h.state.executed[0].comp).toBe(comp);
    });
  });

  describe("Promise settle 과 응답 자동 바인딩 (__callbackSubmitFunction 경유)", () => {
    test("성공: 배열 본문을 target 순서대로 setJSON(append 반영) 후 resolve(resObj)", async () => {
      const p = h.scwin.executeDynamic(baseOptions());
      const sub = h.state.created[0];
      const res = okRes({ body: [[{ a: 1 }], [{ b: 2 }]] });
      h.scwin.__callbackSubmitFunction(res, sub);

      await expect(p).resolves.toBe(res);
      expect(h.state.comps.dlt_a._setJSON).toEqual([{ data: [{ a: 1 }], append: false }]);
      expect(h.state.comps.dlt_b._setJSON).toEqual([{ data: [{ b: 2 }], append: true }]);
    });

    test("성공: 단일 객체 본문은 첫 target 에만 적재, key 지정 target 은 responseJSON.<key> 적재", async () => {
      const p = h.scwin.executeDynamic(Object.assign(baseOptions(), { target: "dlt_a,dlt_b=meta.total" }));
      const sub = h.state.created[0];
      h.scwin.__callbackSubmitFunction(okRes({ body: { x: 1 }, meta: { total: 7 } }), sub);

      await p;
      expect(h.state.comps.dlt_a._setJSON).toEqual([{ data: { x: 1 }, append: false }]);
      expect(h.state.comps.dlt_b._setJSON).toEqual([{ data: 7, append: false }]);
    });

    test("성공: body 래퍼가 없으면 평면 responseJSON 을 본문으로 사용 — 객체는 첫 target, 배열은 원소별 순차 매핑", async () => {
      const p1 = h.scwin.executeDynamic(Object.assign(baseOptions(), { id: "s1", target: "dlt_a" }));
      h.scwin.__callbackSubmitFunction(okRes({ r: 1 }), h.state.created[0]);
      await p1;
      expect(h.state.comps.dlt_a._setJSON[0].data).toEqual({ r: 1 });

      // 평면 배열 응답은 "본문이 배열" 규칙을 따라 target 순서대로 원소를 적재한다(배열 통째 적재가 아님).
      const p2 = h.scwin.executeDynamic(Object.assign(baseOptions(), { id: "s2", target: "dlt_a,dlt_b" }));
      h.scwin.__callbackSubmitFunction(okRes([[{ r: 1 }], [{ r: 2 }]]), h.state.created[1]);
      await p2;
      expect(h.state.comps.dlt_a._setJSON[1].data).toEqual([{ r: 1 }]);
      expect(h.state.comps.dlt_b._setJSON[0].data).toEqual([{ r: 2 }]);
    });

    test("gridview: 바인딩 직전 initGrid, ondataload 시 refresh — |focus 는 데이터 있을 때만 첫 셀 포커스", async () => {
      const p = h.scwin.executeDynamic(Object.assign(baseOptions(), { target: "dlt_a", gridview: "grd_main|focus,grd_sub", gridSpinner: false }));
      const sub = h.state.created[0];
      h.scwin.__callbackSubmitFunction(okRes({ body: [[{ a: 1 }]] }), sub);
      await p;

      const [gm, gs] = [h.state.comps.grd_main, h.state.comps.grd_sub];
      expect(gm._calls).toEqual(["initGrid"]);
      expect(gs._calls).toEqual(["initGrid"]);
      // target DataCollection 데이터 로드 이벤트 → grid refresh / focus
      h.state.comps.dlt_a._rows = 1;
      h.state.comps.dlt_a._handlers.ondataload();
      expect(gm._calls).toEqual(["initGrid", "refresh", "focus:0,0"]);
      expect(gs._calls).toEqual(["initGrid", "refresh"]);       // focus 미지정
      expect(h.state.alerts).toHaveLength(0);                   // message 미지정 → 빈 결과 알림 없음
    });

    test("gridview |message: 로드된 데이터가 없으면 빈 결과 메시지 alert", async () => {
      const p = h.scwin.executeDynamic(Object.assign(baseOptions(), { target: "dlt_a", gridview: "grd_main|message", gridSpinner: false }));
      h.scwin.__callbackSubmitFunction(okRes({ body: [[]] }), h.state.created[0]);
      await p;
      h.state.comps.dlt_a._rows = 0;
      h.state.comps.dlt_a._handlers.ondataload();
      expect(h.state.alerts).toEqual(["com_search_0011:"]);
      expect(h.state.comps.grd_main._calls).toEqual(["initGrid", "refresh"]);   // 데이터 없음 → 포커스 없음
    });

    test("실패(errorType): reject(resObj), 자동 적재·initGrid 없음", async () => {
      const p = h.scwin.executeDynamic(Object.assign(baseOptions(), { gridview: "grd_main", gridSpinner: false }));
      const res = { responseStatusCode: 200, errorType: "E", responseJSON: { body: [[{ a: 1 }]] } };
      h.scwin.__callbackSubmitFunction(res, h.state.created[0]);

      await expect(p).rejects.toBe(res);
      expect(h.state.comps.dlt_a._setJSON).toHaveLength(0);
      expect(h.state.comps.grd_main._calls).toEqual([]);
    });

    test("연결 불가(status 0): resultMsg 알림 + errorType 표식 + reject", async () => {
      const p = h.scwin.executeDynamic(baseOptions());
      const res = { responseStatusCode: 0, resourceUri: "/api/search" };
      h.scwin.__callbackSubmitFunction(res, h.state.created[0]);

      await expect(p).rejects.toBe(res);
      expect(res.errorType).toBe("error");
      expect(h.state.resultMsgs[0].statusCode).toBe("E");
    });

    test("사용자 submitDoneHandler 지정 시 Promise 핸들러를 걸지 않는다(문서화된 동작 — Promise 는 settle 되지 않음)", () => {
      h.scwin.executeDynamic(Object.assign(baseOptions(), { submitDoneHandler: () => {} }));
      const sub = h.state.created[0];
      expect(sub._promise_submitDoneHandler).toBeUndefined();
      expect(typeof sub._promise_submitErrorHandler).toBe("function");   // error 핸들러 미지정 → reject 는 연결
    });
  });

  describe("중복 실행 제어 (execOptions)", () => {
    test("ignore(기본): 진행 중이면 재생성/실행 없이 { skipped:true } 로 resolve", async () => {
      h.scwin.executeDynamic(baseOptions());               // executeSubmission → processStatus 1
      const p2 = h.scwin.executeDynamic(baseOptions());

      await expect(p2).resolves.toEqual({ skipped: true, reason: "duplicate", id: "sbm_search" });
      expect(h.state.created).toHaveLength(1);
      expect(h.state.executed).toHaveLength(1);
      expect(h.state.deleted).toHaveLength(0);
    });

    test("abort: 진행 중 요청 abort + 직전 Promise reject({aborted}) 후 재생성·실행", async () => {
      const p1 = h.scwin.executeDynamic(baseOptions());
      const p2 = h.scwin.executeDynamic(baseOptions(), null, null, { onDuplicate: "abort" });

      await expect(p1).rejects.toEqual({ aborted: true, reason: "duplicate-abort", id: "sbm_search" });
      expect(h.state.aborted).toEqual([{ id: "sbm_search", scopeId: "scope" }]);
      expect(h.state.created).toHaveLength(2);
      expect(h.state.executed).toHaveLength(2);
      // 새 요청은 정상 settle
      const res = okRes({ body: [[{ a: 1 }], []] });
      h.scwin.__callbackSubmitFunction(res, h.state.created[1]);
      await expect(p2).resolves.toBe(res);
    });

    test("allowDuplicate:true 면 진행 중이어도 재생성·동시 실행 (onDuplicate 무시)", () => {
      h.scwin.executeDynamic(baseOptions());
      h.scwin.executeDynamic(baseOptions(), null, null, { allowDuplicate: true, onDuplicate: "abort" });
      expect(h.state.aborted).toHaveLength(0);
      expect(h.state.created).toHaveLength(2);
      expect(h.state.executed).toHaveLength(2);
    });
  });

  describe("입력 오류", () => {
    test("action 누락: alert 후 { errorType:'invalid-option' } 로 reject, 실행 없음", async () => {
      const p = h.scwin.executeDynamic(Object.assign(baseOptions(), { action: "" }));
      await expect(p).rejects.toMatchObject({ errorType: "invalid-option" });
      expect(h.state.alerts).toEqual(["MSG_CM_00002:action"]);
      expect(h.state.executed).toHaveLength(0);
    });
  });
});
