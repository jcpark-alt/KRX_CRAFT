/**
 * $c.date.checkCalendarFormat / compareFromToDate — 포맷 검증 실패 시 빈값 초기화(clearOnInvalid, 기본 true) 회귀 테스트.
 *
 * WebSquare 런타임을 mock 으로 대체한 vm 하네스로 date.xml 의 CDATA 를 로드해 실제 구동한다.
 * inputCalendar 는 getValue/setValue/bind/unbind/focus/setUserData 만 가진 가짜 컴포넌트로 대체하고,
 * bind 로 등록된 onviewchange 핸들러를 직접 호출해 사용자 입력 변경을 재현한다.
 */
const fs = require("fs");
const vm = require("vm");

const XML_FILE = "cm/gcc/date.xml";

const isEmpty = (v) =>
  v === undefined || v === null || v === "" ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

function extractCdata(xmlPath) {
  const m = fs.readFileSync(xmlPath, "utf8").match(/<script[^>]*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/script>/);
  if (!m) throw new Error("CDATA script block not found: " + xmlPath);
  return m[1];
}

// 가짜 inputCalendar
function makeCal(id, value, log) {
  const cal = {
    id, value, handlers: {}, setValueCalls: [], focused: 0, userData: {},
    getValue() { return cal.value; },
    setValue(v) { cal.setValueCalls.push(v); cal.value = v; if (log) log.push("setValue:" + v); },
    bind(ev, fn) { cal.handlers[ev] = fn; },
    unbind(ev) { delete cal.handlers[ev]; },
    focus() { cal.focused += 1; if (log) log.push("focus"); },
    setUserData(k, v) { cal.userData[k] = v; },
    getUserData(k) { return cal.userData[k]; },
    // 사용자 입력 변경 재현
    async change(v) { cal.value = v; return cal.handlers.onviewchange && cal.handlers.onviewchange({}); },
  };
  return cal;
}

function loadHarness() {
  const calls = { alert: [], log: [] };
  const comps = {};
  const sandbox = {
    console: { log() {}, warn() {}, error() {} },
    JSON, Array, String, Object, Date, Boolean, Number, Promise, Math, isNaN, parseInt, parseFloat,
    scwin: {},
    $c: {
      util: { isEmpty },
      str: { isFinalConsonant: (s) => { const c = s.charCodeAt(s.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0; } },
      data: { getMessage: (id, arg) => id + ":" + arg },
      // 실제 $c.win.alert 는 안내 창이 닫힐 때 resolve 된다 — 닫힘 시점을 로그에 남겨 순서를 검증한다
      win: { alert: (msg) => { calls.alert.push(msg); calls.log.push("alert:" + msg); return Promise.resolve().then(() => { calls.log.push("alert-closed"); }); } },
    },
    $p: { getComponentById: (id) => comps[id] },
    window: {},
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: "date.xml.cdata.js" });
  sandbox.$c.date = sandbox.scwin;
  return { date: sandbox.scwin, calls, comps };
}

describe("checkCalendarFormat — clearOnInvalid", () => {
  test("기본값: 잘못된 포맷을 입력하면 안내 창이 닫힌 뒤 빈값으로 초기화하고 포커스를 준다(순서 보장)", async () => {
    const h = loadHarness();
    const cal = makeCal("cal_a", "", h.calls.log);
    h.date.checkCalendarFormat(cal, "yyyy-MM-dd", "기준일자");
    await cal.change("2026-13-99");
    expect(h.calls.alert).toEqual(["com_valid_format_0052:기준일자"]);
    expect(cal.setValueCalls).toEqual([""]);
    expect(cal.value).toBe("");
    expect(cal.focused).toBe(1);
    expect(h.calls.log).toEqual(["alert:com_valid_format_0052:기준일자", "alert-closed", "setValue:", "focus"]);
  });

  test("clearOnInvalid:false 이면 안내 창을 닫은 뒤 값을 남기고 포커스만 준다(종전 동작)", async () => {
    const h = loadHarness();
    const cal = makeCal("cal_b", "", h.calls.log);
    h.date.checkCalendarFormat(cal, "yyyyMMdd", "", { clearOnInvalid: false });
    await cal.change("20261399");
    expect(h.calls.alert).toEqual(["com_valid_format_0051:yyyyMMdd"]);
    expect(cal.setValueCalls).toEqual([]);
    expect(cal.value).toBe("20261399");
    expect(h.calls.log).toEqual(["alert:com_valid_format_0051:yyyyMMdd", "alert-closed", "focus"]);
  });

  test("정상 포맷이면 안내·초기화가 없고, 빈값(초기화 재진입 포함)은 형식 오류로 보지 않는다", async () => {
    const h = loadHarness();
    const cal = makeCal("cal_c", "");
    h.date.checkCalendarFormat(cal, "yyyy-MM-dd");
    await cal.change("2026-09-16");
    expect(h.calls.alert).toHaveLength(0);
    expect(cal.setValueCalls).toHaveLength(0);
    await cal.change("");                     // 초기화로 재진입한 상황
    expect(h.calls.alert).toHaveLength(0);
  });

  test("컴포넌트 ID 로 전달해도 동작하고, 반환값은 호출 시점의 현재 값 기준이다", () => {
    const h = loadHarness();
    h.comps.cal_d = makeCal("cal_d", "2026-02-30");
    expect(h.date.checkCalendarFormat("cal_d", "yyyy-MM-dd")).toBe(false);   // 2월 30일 — 실존하지 않음
    h.comps.cal_d.value = "2026-02-28";
    expect(h.date.checkCalendarFormat("cal_d", "yyyy-MM-dd")).toBe(true);
    expect(h.comps.cal_d.setValueCalls).toHaveLength(0);                     // 호출 시점 검사는 초기화하지 않는다
  });
});

describe("compareFromToDate — dateFormat 검증 실패 시 clearOnInvalid", () => {
  test("기본값: 시작일 포맷 오류 → 안내 창이 닫힌 뒤 빈값 초기화·포커스, 기간 비교는 건너뛴다(순서 보장)", async () => {
    const h = loadHarness();
    const s = makeCal("s", "", h.calls.log), e = makeCal("e", "20260930");
    h.date.compareFromToDate(s, e, ["시작일", "종료일"], "yyyyMMdd");
    await s.change("2026099");
    expect(h.calls.alert).toEqual(["com_valid_format_0051:yyyyMMdd"]);   // "$[0] 형식의 올바른 날짜를 입력하세요." 메시지 코드
    expect(s.setValueCalls).toEqual([""]);
    expect(s.focused).toBe(1);
    expect(h.calls.log).toEqual(["alert:com_valid_format_0051:yyyyMMdd", "alert-closed", "setValue:", "focus"]);
    expect(s.userData.onkeyup).toBe(true);   // setUserData(false) → setValue → setUserData(true) 순서로 복원
  });

  test("clearOnInvalid:false 이면 종료일의 잘못된 값을 남기고 포커스만 준다", async () => {
    const h = loadHarness();
    const s = makeCal("s", "20260901"), e = makeCal("e", "");
    h.date.compareFromToDate(s, e, ["시작일", "종료일"], "yyyyMMdd", { clearOnInvalid: false });
    await e.change("2026-09-30");
    expect(h.calls.alert).toHaveLength(1);
    expect(e.setValueCalls).toEqual([]);
    expect(e.value).toBe("2026-09-30");
    expect(e.focused).toBe(1);
  });

  test("포맷이 맞으면 종전대로 기간 비교(시작일 > 종료일 → 종료일로 원복)만 수행한다", async () => {
    const h = loadHarness();
    const s = makeCal("s", ""), e = makeCal("e", "20260910");
    h.date.compareFromToDate(s, e, ["시작일", "종료일"], "yyyyMMdd");
    await s.change("20260920");
    expect(h.calls.alert).toEqual(["시작일을 종료일 이전으로 선택하세요."]);
    expect(s.setValueCalls).toEqual(["20260910"]);
  });

  test("dateFormat 생략 + checkExists:false 이면 포맷·실존 검증·초기화 없이 기간 비교만 한다(종전 동작 옵트아웃)", async () => {
    const h = loadHarness();
    const s = makeCal("s", "20260901"), e = makeCal("e", "");
    h.date.compareFromToDate(s, e, null, null, { checkExists: false });   // 기본(checkExists:true)의 실존 검사는 dateExistingDate.test.js 참조
    await e.change("garbage");
    expect(h.calls.alert).toHaveLength(0);
    expect(e.setValueCalls).toHaveLength(0);
  });
});
