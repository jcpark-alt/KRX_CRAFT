/**
 * executeDynamic gridview 접미사 옵션 "message" (opt-in) 회귀 테스트.
 *
 * sbm.xml 의 __parseGridview 는 gridview 문자열을 grid별 디스크립터로 파싱한다.
 * 빈 결과 메시지("조회된 데이터가 없습니다.")는 "|message" 접미사가 있을 때만 출력되며
 * (opt-in), 기본은 미출력이다. WebSquare 런타임을 mock 으로 대체한 vm 하네스로 검증하고
 * src/gcc·src/cm/gcc 두 사본 모두 대상으로 한다(사본 divergence 감지).
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILES = ["src/gcc/sbm.xml", "src/cm/gcc/sbm.xml"];

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

// sbm.xml CDATA 를 mock 런타임 위에 로드해 scwin 을 반환한다.
function loadScwin(xmlPath) {
  const sandbox = {
    console, JSON, Array, String, Object, Boolean, Number, Promise,
    scwin: {},
    $c: { util: { isEmpty, isArray: Array.isArray, getComponent: () => null }, win: {}, data: {} },
    $p: {},
    // CDATA 최상위에서 참조하는 엔진 전역(CONTEXT_PATH 등) 로드 방어용 mock
    WebSquare: { core: { getConfiguration: () => "" }, util: {}, modelUtil: {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(xmlPath), sandbox, { filename: path.basename(xmlPath) + ".cdata.js" });
  return sandbox.scwin;
}

describe.each(XML_FILES)("executeDynamic gridview message opt-in (%s)", (xmlPath) => {
  let parse;
  beforeAll(() => { parse = loadScwin(xmlPath).__parseGridview; });

  test("기본(옵션 없음)은 message=false — 빈 결과 메시지 미출력", () => {
    expect(parse("grd_main")[0].message).toBe(false);
  });

  test("'|message' 접미사 → message=true (opt-in)", () => {
    expect(parse("grd_main|message")[0].message).toBe(true);
  });

  test("단독 'message' 토큰은 직전 grid 에 이어붙는다 (continuation)", () => {
    const entries = parse("grd_main|focus,message");
    expect(entries).toHaveLength(1);
    expect(entries[0].focus).toBe(true);
    expect(entries[0].message).toBe(true);
  });

  test("다중 grid: message 는 지정된 grid 에만 적용", () => {
    const entries = parse("grd_main|message,grd_sub");
    expect(entries).toHaveLength(2);
    expect(entries[0].message).toBe(true);
    expect(entries[1].message).toBe(false);
  });

  test("배열 입력에서도 |message opt-in 동작", () => {
    const entries = parse(["grd_a|message", "grd_b"]);
    expect(entries[0].message).toBe(true);
    expect(entries[1].message).toBe(false);
  });

  test("컴포넌트 객체(문법 없음) → message=false(기본)", () => {
    expect(parse({ id: "obj" })[0].message).toBe(false);
  });
});
