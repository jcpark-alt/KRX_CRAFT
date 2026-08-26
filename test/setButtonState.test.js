/**
 * $c.util.setButtonState / registerButtonState 회귀 테스트.
 *
 * 상태를 "활성 역할 목록(enable) 또는 전체(*)+예외(disable)" 로 선언하는 동적 역할 모델:
 * 정의에 없는 역할은 비활성이 기본이라 화면에 새 역할이 추가되어도 안전하다.
 * 판정 우선순위: override > state.disable > state.enable("*"|목록) > 기본 false.
 * WebSquare 런타임을 mock 으로 대체한 vm 하네스로 util.xml 의 CDATA 를 실구동한다.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILE = "src/gcc/util.xml";

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

function loadHarness() {
  const sandbox = {
    console: { log: () => {}, warn: () => {}, error: () => {} },
    JSON, Array, String, Object, Date, Boolean, Number, Promise, Math,
    parseFloat, parseInt,
    scwin: {},
    window: {},
    WebSquare: { util: {}, cookie: {} },
    navigator: { userAgent: "test" },
    $c: { util: { isEmpty }, win: {}, str: {}, data: {}, sbm: {} },
    $p: {},
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: path.basename(XML_FILE) + ".cdata.js" });
  const scwin = sandbox.scwin;
  sandbox.$c.util = Object.assign({ isEmpty }, scwin); // $c.util.* 내부 상호 호출 연결

  // 버튼 mock — setDisabled 호출을 기록. getComponent 는 mock 레지스트리 조회로 대체
  const comps = {};
  const makeBtn = (id) => (comps[id] = { id, disabled: null, setDisabled(v) { this.disabled = v; } });
  sandbox.$c.util.getComponent = (id) => comps[id] || null;

  return { scwin, comps, makeBtn };
}

// 표준 6역할 매핑 (버튼 id 는 화면마다 다르다는 요건 반영 — 제각각 명명)
const BTN_MAP = {
  "new": "btn_add", save: "btnSv01", modify: "btn_edit",
  "delete": "btnRemove", guide: "btn_notice2", draft: "btnGian",
};

function enabledOf(h) {
  // disabled=false → 활성. 역할명 기준으로 정리
  const out = {};
  Object.keys(BTN_MAP).forEach((role) => {
    const c = h.comps[BTN_MAP[role]];
    out[role] = c ? !c.disabled : undefined;
  });
  return out;
}

describe("$c.util.setButtonState (src/gcc/util.xml)", () => {
  let h;
  beforeEach(() => {
    h = loadHarness();
    Object.values(BTN_MAP).forEach(h.makeBtn);
  });

  test("insert: 신규·저장만 활성", () => {
    expect(h.scwin.setButtonState("grpBtnBox", "insert", BTN_MAP)).toBe(true);
    expect(enabledOf(h)).toEqual({ "new": true, save: true, modify: false, "delete": false, guide: false, draft: false });
  });

  test("update: 전체 활성(*) + 저장만 예외(disable)", () => {
    h.scwin.setButtonState("grpBtnBox", "update", BTN_MAP);
    expect(enabledOf(h)).toEqual({ "new": true, save: false, modify: true, "delete": true, guide: true, draft: true });
  });

  test("disabled/enabled: 전부 비활성 / 전부 활성", () => {
    h.scwin.setButtonState("grpBtnBox", "disabled", BTN_MAP);
    expect(Object.values(enabledOf(h)).every((v) => v === false)).toBe(true);

    h.scwin.setButtonState("grpBtnBox", "enabled", BTN_MAP);
    expect(Object.values(enabledOf(h)).every((v) => v === true)).toBe(true);
  });

  test("error: 기안만 활성 / insertReady: 신규만 활성", () => {
    h.scwin.setButtonState("grpBtnBox", "error", BTN_MAP);
    expect(enabledOf(h)).toEqual({ "new": false, save: false, modify: false, "delete": false, guide: false, draft: true });

    h.scwin.setButtonState("grpBtnBox", "insertReady", BTN_MAP);
    expect(enabledOf(h)).toEqual({ "new": true, save: false, modify: false, "delete": false, guide: false, draft: false });
  });

  test("동적 역할: 목록형 상태에서는 기본 비활성, '*' 상태에서는 자동 활성", () => {
    const map = Object.assign({ print: "btn_prt", copy: "btnCopy2" }, BTN_MAP);
    h.makeBtn("btn_prt"); h.makeBtn("btnCopy2");

    h.scwin.setButtonState("grpBtnBox", "insert", map);   // 목록형 — 신규 역할 자동 비활성
    expect(h.comps.btn_prt.disabled).toBe(true);
    expect(h.comps.btnCopy2.disabled).toBe(true);

    h.scwin.setButtonState("grpBtnBox", "update", map);   // "*" — 신규 역할 자동 활성
    expect(h.comps.btn_prt.disabled).toBe(false);
    expect(h.comps.btnCopy2.disabled).toBe(false);
  });

  test("override 가 상태 정책보다 우선한다", () => {
    h.scwin.setButtonState("grpBtnBox", "update", BTN_MAP, { override: { "delete": false, save: true } });
    const r = enabledOf(h);
    expect(r["delete"]).toBe(false);   // 상태는 활성이지만 override 로 비활성
    expect(r.save).toBe(true);         // 상태는 disable 예외지만 override 로 활성
  });

  test("즉석 상태 객체 지원", () => {
    h.makeBtn("btn_prt");
    h.scwin.setButtonState("grpBtnBox", { enable: ["new", "print"] }, Object.assign({ print: "btn_prt" }, BTN_MAP));
    expect(enabledOf(h)["new"]).toBe(true);
    expect(h.comps.btn_prt.disabled).toBe(false);
    expect(enabledOf(h).save).toBe(false);
  });

  test("registerButtonState 로 등록한 상태를 사용할 수 있다", () => {
    expect(h.scwin.registerButtonState("printReady", { enable: ["print"] })).toBe(true);
    h.makeBtn("btn_prt");
    h.scwin.setButtonState("grpBtnBox", "printReady", Object.assign({ print: "btn_prt" }, BTN_MAP));
    expect(h.comps.btn_prt.disabled).toBe(false);
    expect(enabledOf(h)["new"]).toBe(false);
  });

  test("방어: 알 수 없는 상태는 false 반환·미적용, 없는 버튼은 건너뛰고 나머지 적용", () => {
    expect(h.scwin.setButtonState("grpBtnBox", "noSuchState", BTN_MAP)).toBe(false);
    expect(h.comps.btn_add.disabled).toBeNull();   // 미적용

    const map = Object.assign({ ghost: "btn_notExists" }, BTN_MAP);
    expect(h.scwin.setButtonState("grpBtnBox", "insert", map)).toBe(true);
    expect(enabledOf(h)["new"]).toBe(true);        // 나머지는 정상 적용

    expect(h.scwin.registerButtonState("", { enable: [] })).toBe(false);   // 잘못된 등록
    expect(h.scwin.registerButtonState("x", {})).toBe(false);
  });
});
