/**
 * executeDynamic ref 간소화 문법의 "|action" 접미사 회귀 테스트.
 *
 * sbm.xml 의 _normalizeRefTarget 은 "id[=key][|action]" 을 WebSquare 표준 ref 표현식
 * (data:json,{"id":..,"key":..,"action":..}) 으로 변환한다. action 은 약어(M/C/D/U/A)와
 * 전체 이름(modified/inserted/deleted/updated/all)을 대소문자 구분 없이 허용하고,
 * 알 수 없는 값은 경고 후 무시한다. WebSquare 런타임을 mock 으로 대체한 vm 하네스로 검증한다.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILES = ["cm/gcc/sbm.xml"];

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

function loadScwin(xmlPath, warn) {
  const sandbox = {
    console: { ...console, warn },
    JSON, Array, String, Object, Boolean, Number, Promise,
    scwin: {},
    $c: { util: { isEmpty, isArray: Array.isArray, getComponent: () => null }, win: {}, data: {} },
    $p: {},
    WebSquare: { core: { getConfiguration: () => "" }, util: {}, modelUtil: {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(xmlPath), sandbox, { filename: path.basename(xmlPath) + ".cdata.js" });
  return sandbox.scwin;
}

describe.each(XML_FILES)("executeDynamic ref |action (%s)", (xmlPath) => {
  let scwin;
  let warn;
  const refOf = (ref) => {
    const options = { ref };
    scwin._normalizeRefTarget(options);
    return options.ref;
  };

  beforeEach(() => {
    warn = jest.fn();
    scwin = loadScwin(xmlPath, warn);
  });

  test.each([
    ["dlt_menu|M", "modified"],
    ["dlt_menu|C", "inserted"],
    ["dlt_menu|D", "deleted"],
    ["dlt_menu|U", "updated"],
    ["dlt_menu|A", "all"],
  ])("약어 %s → action %s", (ref, action) => {
    expect(refOf(ref)).toBe('data:json,{"id":"dlt_menu","action":"' + action + '"}');
  });

  test.each(["modified", "inserted", "deleted", "updated", "all"])("전체 이름 |%s 허용", (name) => {
    expect(refOf("dlt_menu|" + name)).toBe('data:json,{"id":"dlt_menu","action":"' + name + '"}');
  });

  test("대소문자 무관 (|m, |Modified)", () => {
    expect(refOf("dlt_menu|m")).toBe('data:json,{"id":"dlt_menu","action":"modified"}');
    expect(refOf("dlt_menu|Modified")).toBe('data:json,{"id":"dlt_menu","action":"modified"}');
  });

  test("key 와 action 조합 (id=key|C)", () => {
    expect(refOf("dlt_menu=data|C")).toBe('data:json,{"id":"dlt_menu","key":"data","action":"inserted"}');
  });

  test("다중 항목에서 action 은 지정한 항목에만 적용", () => {
    expect(refOf("dma_search, dlt_menu|D")).toBe('data:json,["dma_search",{"id":"dlt_menu","action":"deleted"}]');
  });

  test("알 수 없는 action 은 경고 후 무시 (all 로 보내지 않음)", () => {
    expect(refOf("dlt_menu|X")).toBe("data:json,dlt_menu");
    expect(warn).toHaveBeenCalledTimes(1);
  });

  test("빈 action('id|') 은 경고 없이 무시", () => {
    expect(refOf("dlt_menu|")).toBe("data:json,dlt_menu");
    expect(warn).not.toHaveBeenCalled();
  });

  test("기존 문법 하위 호환 (id, id=key, data: 표현식)", () => {
    expect(refOf("dma_search")).toBe("data:json,dma_search");
    expect(refOf("dma_search=body")).toBe('data:json,{"id":"dma_search","key":"body"}');
    expect(refOf('data:json,{"id":"dlt_x","action":"modified"}')).toBe('data:json,{"id":"dlt_x","action":"modified"}');
  });
});
