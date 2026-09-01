/**
 * $c.validate.validateDataMap 회귀 테스트 (src/gcc/validate.xml).
 *
 * DataMap 값 검사 공통함수 — 규칙 배열을 선언 순서대로 검사해 key 값이 equals 와 일치하면 위반:
 * - type "alert"(기본): 알림 후 즉시 해당 규칙의 code 반환 (code 미지정 시 규칙 순번+1)
 * - type "confirm": 확인창에서 취소한 경우에만 code 반환, 확인 시 다음 규칙 계속
 * - 모두 통과 시 0. DataMap/규칙 배열이 유효하지 않으면 console.error 후 0(통과 취급)
 *
 * WebSquare 런타임 의존은 vm 하네스 mock 으로 격리한다($c.validate = scwin 배선 — 빌드 $p 주입 규칙).
 */
const fs = require("fs");
const vm = require("vm");

const XML_FILE = "src/gcc/validate.xml";

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

function loadHarness({ confirmResult = true } = {}) {
  const state = { alerts: [], confirms: [], comps: {} };
  const sandbox = {
    console, JSON, Array, String, Object, Date, Boolean, Number, Promise, RegExp,
    scwin: {},
    $c: {
      util: { isEmpty, isArray: Array.isArray, getComponent: (id) => state.comps[id] },
      str: {},
      win: {
        alert: async (msg) => { state.alerts.push(msg); },
        confirm: async (msg) => { state.confirms.push(msg); return confirmResult; },
      },
      num: {},
    },
    $p: { getComponentById: (id) => state.comps[id] || null },
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: "validate.xml.cdata.js" });
  sandbox.$c.validate = sandbox.scwin;   // 실환경 네임스페이스 배선 — 내부 호출이 $c.validate.* 경유(빌드 $p 주입 규칙)
  return { scwin: sandbox.scwin, state };
}

const makeDataMap = (data) => ({ get: (key) => data[key] });

describe("validateDataMap (src/gcc/validate.xml)", () => {
  test("모든 규칙 통과(플래그 불일치) 시 0 반환, 알림 없음", async () => {
    const h = loadHarness();
    const rtn = await h.scwin.validateDataMap(makeDataMap({ VALID_BND: "N" }), [
      { key: "VALID_BND", equals: "Y", message: "마감처리 종목", code: 4 },
    ]);
    expect(rtn).toBe(0);
    expect(h.state.alerts).toHaveLength(0);
  });

  test("alert 규칙 위반 시 알림 후 해당 code 반환 — 후속 규칙 미검사", async () => {
    const h = loadHarness();
    const rtn = await h.scwin.validateDataMap(makeDataMap({ VALID_STRT_DD: "Y", VALID_CLS_DD: "Y" }), [
      { key: "VALID_STRT_DD", equals: "Y", message: "적용일이 현재일자보다 작습니다.", code: 1 },
      { key: "VALID_CLS_DD", equals: "Y", message: "마감처리가 종료된 일자입니다.", code: 3 },
    ]);
    expect(rtn).toBe(1);
    expect(h.state.alerts).toEqual(["적용일이 현재일자보다 작습니다."]);
  });

  test("confirm 규칙 — 확인 시 다음 규칙 계속, 취소 시 code 반환", async () => {
    const ok = loadHarness({ confirmResult: true });
    const rules = [
      { key: "VALID_BF_DD", equals: "Y", type: "confirm", message: "익영업일이 아닙니다. 처리하시겠습니까?", code: 4 },
      { key: "VALID_CLS_DD", equals: "Y", message: "마감처리가 종료된 일자입니다.", code: 3 },
    ];
    expect(await ok.scwin.validateDataMap(makeDataMap({ VALID_BF_DD: "Y", VALID_CLS_DD: "N" }), rules)).toBe(0);
    expect(ok.state.confirms).toHaveLength(1);

    const cancel = loadHarness({ confirmResult: false });
    expect(await cancel.scwin.validateDataMap(makeDataMap({ VALID_BF_DD: "Y" }), rules)).toBe(4);
  });

  test("code 미지정 시 규칙 순번+1 반환, 빈 규칙/키 없는 규칙은 건너뜀", async () => {
    const h = loadHarness();
    const rtn = await h.scwin.validateDataMap(makeDataMap({ B: "Y" }), [
      { key: "A", equals: "Y", message: "a" },
      null,
      { equals: "Y", message: "no key" },
      { key: "B", equals: "Y", message: "b" },
    ]);
    expect(rtn).toBe(4);   // 0-based 3번째 규칙 → 순번+1
  });

  test("DataMap/규칙 배열이 유효하지 않으면 0 반환(통과 취급)", async () => {
    const h = loadHarness();
    expect(await h.scwin.validateDataMap(null, [{ key: "A", equals: "Y" }])).toBe(0);
    expect(await h.scwin.validateDataMap(makeDataMap({}), "not-array")).toBe(0);
  });

  test("컴포넌트 ID 문자열 전달 시 $p.getComponentById 로 조회", async () => {
    const h = loadHarness();
    h.state.comps["dma_rtn"] = makeDataMap({ VALID_BND: "Y" });
    const rtn = await h.scwin.validateDataMap("dma_rtn", [
      { key: "VALID_BND", equals: "Y", message: "마감처리 종목", code: 4 },
    ]);
    expect(rtn).toBe(4);
  });
});
