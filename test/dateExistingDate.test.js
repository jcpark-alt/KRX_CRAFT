/**
 * $c.date 실존 날짜 검사 회귀 테스트 — __isExistingDate 단일 판정기, isDate/_checkDateFormat 위임,
 * compareFromToDate 의 dateFormat 없는 실존 검사(options.checkExists, 기본 true), checkCalendarFormat 의 실존 거부.
 *
 * WebSquare 런타임을 mock 으로 대체한 vm 하네스로 date.xml 의 CDATA 를 로드해 실제 구동한다(dateClearOnInvalid.test.js 와 같은 방식).
 * inputCalendar 는 getValue/setValue/bind/unbind/focus/setUserData 만 가진 가짜 컴포넌트로 대체하고,
 * bind 로 등록된 onviewchange 핸들러를 직접 호출해 사용자 입력 변경을 재현한다.
 * 엔진 실측: 단독 inputCalendar 는 validCheck=false(config.xml) 라 실존하지 않는 값도 그대로 확정하고 getValue() 는 ioFormat(yyyyMMdd) 값을 돌려준다.
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

describe("__isExistingDate — 단일 실존 판정기", () => {
  test("윤년 규칙(4년 주기·100년 예외·400년 재예외)과 월별 말일을 정확히 판정한다", () => {
    const d = loadHarness().date;
    expect(d.__isExistingDate(2024, 2, 29)).toBe(true);    // 윤년
    expect(d.__isExistingDate(2025, 2, 29)).toBe(false);   // 평년
    expect(d.__isExistingDate(2000, 2, 29)).toBe(true);    // 400 배수 → 윤년
    expect(d.__isExistingDate(1900, 2, 29)).toBe(false);   // 100 배수 → 평년
    expect(d.__isExistingDate(2026, 4, 31)).toBe(false);   // 30일 달
    expect(d.__isExistingDate(2026, 2, 31)).toBe(false);
    expect(d.__isExistingDate(2026, 12, 31)).toBe(true);
    expect(d.__isExistingDate(2026, 13, 1)).toBe(false);   // 월 범위
    expect(d.__isExistingDate(2026, 1, 0)).toBe(false);    // 일 범위
  });

  test("Date 왕복이 1900년대로 해석하던 두 자리 연도(0001~0099)도 실존으로 판정한다", () => {
    const d = loadHarness().date;
    expect(d.__isExistingDate(50, 1, 1)).toBe(true);
    expect(d._checkDateFormat("00500101", "yyyyMMdd")).toBe(true);
    expect(d._checkDateFormat("00500229", "yyyyMMdd")).toBe(false);   // 50년은 평년
  });

  test("정수가 아닌 인자는 실존이 아니다", () => {
    const d = loadHarness().date;
    expect(d.__isExistingDate(NaN, 1, 1)).toBe(false);
    expect(d.__isExistingDate("2026", 1, 1)).toBe(false);
    expect(d.__isExistingDate(2026, 1.5, 1)).toBe(false);
  });
});

describe("isDate / _checkDateFormat — 판정기 위임 후 결과 동일", () => {
  test("isDate 는 yyyyMMdd·yyyyMMddHHmmss 모두 실존 규칙으로 판정한다", () => {
    const d = loadHarness().date;
    expect(d.isDate("20240229")).toBe(true);
    expect(d.isDate("20250229")).toBe(false);
    expect(d.isDate("20260431")).toBe(false);
    expect(d.isDate("20240229235959")).toBe(true);
    expect(d.isDate("20240229240000", true)).toBe(true);    // 24:00:00 은 timeChk true 일 때 허용
    expect(d.isDate("20240229240000", false)).toBe(false);
    expect(d.isDate("2024022")).toBe(false);
  });

  test("_checkDateFormat 은 포맷 일치 뒤 실존까지 본다(구분자 포맷 포함)", () => {
    const d = loadHarness().date;
    expect(d._checkDateFormat("20260231", "yyyyMMdd")).toBe(false);
    expect(d._checkDateFormat("2026-02-28", "yyyy-MM-dd")).toBe(true);
    expect(d._checkDateFormat("2026-02-30", "yyyy-MM-dd")).toBe(false);
    expect(d._checkDateFormat("2026/04/31", "yyyy/MM/dd")).toBe(false);
    expect(d._checkDateFormat("20260228", "yyyy-MM-dd")).toBe(false);   // ioFormat 과 다른 포맷을 넘기면 길이 불일치
  });
});

describe("compareFromToDate — dateFormat 없이도 실존 날짜 검사(checkExists 기본 true)", () => {
  test("시작일에 실존하지 않는 날짜 → 명칭 메시지 안내, 안내 창이 닫힌 뒤 빈값 초기화·포커스, 기간 비교 생략", async () => {
    const h = loadHarness();
    const s = makeCal("s", "", h.calls.log), e = makeCal("e", "20260101");
    h.date.compareFromToDate(s, e, ["시작일", "종료일"]);
    await s.change("20260231");
    expect(h.calls.alert).toEqual(["com_valid_format_0052:시작일"]);   // "$[0]에 올바른 날짜를 입력하세요."
    expect(s.setValueCalls).toEqual([""]);
    expect(s.focused).toBe(1);
    expect(h.calls.log).toEqual(["alert:com_valid_format_0052:시작일", "alert-closed", "setValue:", "focus"]);
    expect(s.userData.onkeyup).toBe(true);
  });

  test("종료일에 실존하지 않는 날짜 → 종료일 명칭으로 안내, 기본 명칭은 검색종료일", async () => {
    const h = loadHarness();
    const s = makeCal("s", "20260101"), e = makeCal("e", "");
    h.date.compareFromToDate(s, e);
    await e.change("20250229");
    expect(h.calls.alert).toEqual(["com_valid_format_0052:검색종료일"]);
    expect(e.value).toBe("");
    expect(e.focused).toBe(1);
  });

  test("실존하는 날짜면 안내·초기화 없이 종전대로 기간 비교만 한다", async () => {
    const h = loadHarness();
    const s = makeCal("s", ""), e = makeCal("e", "20240229");
    h.date.compareFromToDate(s, e, ["시작일", "종료일"]);
    await s.change("20240301");
    expect(h.calls.alert).toEqual(["시작일을 종료일 이전으로 선택하세요."]);
    expect(s.setValueCalls).toEqual(["20240229"]);
  });

  test("checkExists:false 이면 실존 검사 없이 기간 비교만 한다(종전 동작)", async () => {
    const h = loadHarness();
    const s = makeCal("s", ""), e = makeCal("e", "20260101");
    h.date.compareFromToDate(s, e, ["시작일", "종료일"], null, { checkExists: false });
    await s.change("20260231");
    expect(h.calls.alert).toEqual(["시작일을 종료일 이전으로 선택하세요."]);   // "20260231" > "20260101" 문자열 비교
    expect(s.setValueCalls).toEqual(["20260101"]);
  });

  test("clearOnInvalid:false 이면 실존 오류 값을 남기고 안내·포커스만 한다", async () => {
    const h = loadHarness();
    const s = makeCal("s", ""), e = makeCal("e", "20260101");
    h.date.compareFromToDate(s, e, ["시작일", "종료일"], null, { clearOnInvalid: false });
    await s.change("20260231");
    expect(h.calls.alert).toEqual(["com_valid_format_0052:시작일"]);
    expect(s.setValueCalls).toEqual([]);
    expect(s.value).toBe("20260231");
    expect(s.focused).toBe(1);
  });

  test("dateFormat 을 지정하면 실존 오류도 포맷 메시지로 안내한다(포맷 검사가 실존을 포함)", async () => {
    const h = loadHarness();
    const s = makeCal("s", ""), e = makeCal("e", "20260101");
    h.date.compareFromToDate(s, e, ["시작일", "종료일"], "yyyyMMdd");
    await s.change("20260231");
    expect(h.calls.alert).toEqual(["com_valid_format_0051:yyyyMMdd"]);   // "$[0] 형식의 올바른 날짜를 입력하세요."
    expect(s.value).toBe("");
  });
});

describe("checkCalendarFormat — 실존하지 않는 날짜 거부", () => {
  test("2026-02-31 은 포맷이 맞아도 거부하고, 변경 시 안내 후 빈값 초기화·포커스한다", async () => {
    const h = loadHarness();
    const cal = makeCal("cal_a", "", h.calls.log);
    expect(h.date.checkCalendarFormat(cal, "yyyyMMdd", "기준일자")).toBe(false);   // 빈값은 호출 시점 false
    await cal.change("20260231");
    expect(h.calls.alert).toEqual(["com_valid_format_0052:기준일자"]);
    expect(cal.value).toBe("");
    expect(cal.focused).toBe(1);
    await cal.change("20240229");
    expect(h.calls.alert).toHaveLength(1);   // 실존 날짜는 추가 안내 없음
    expect(cal.value).toBe("20240229");
  });
});
