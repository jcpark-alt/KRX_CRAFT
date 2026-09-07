/**
 * $c.util.syncDataListColumns / $c.util.buildGridStyleXml 회귀 테스트.
 *
 * 동적 컬럼 그리드 구성 공통함수 — 엔진 setColumns 는 헤더를 단일 행으로 강제(group 미지원)하므로
 * 멀티로우(2단 그룹) 헤더는 buildGridStyleXml 이 생성한 전체 XML 을 setGridStyle 로 재생성해 구현한다.
 * dataList 는 insertColumn(기존 id skip·멱등)/removeColumn 으로 동기화한다.
 * WebSquare 런타임을 mock 으로 대체한 vm 하네스로 검증한다. (정답지: ULDFIS00600.xml)
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILE = "src/gcc/util.xml";

function extractCdata(xmlPath) {
  const xml = fs.readFileSync(xmlPath, "utf8");
  const m = xml.match(/<script[^>]*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/script>/);
  if (!m) throw new Error("CDATA script block not found: " + xmlPath);
  return m[1];
}

// mock dataList: 엔진 insertColumn(기존 id skip)/removeColumn/getTotalCol/getColumnID 동작 재현
function makeDataList(initialIds) {
  const ids = (initialIds || []).slice();
  return {
    _ids: ids,
    insertColumn(id) { // (id, opts) — mock 은 opts(name/defaultValue) 미사용
      if (ids.indexOf(id) !== -1) return; // 엔진과 동일: 기존 컬럼 skip
      ids.push(id);
    },
    removeColumn(id) {
      const i = ids.indexOf(id);
      if (i !== -1) ids.splice(i, 1);
    },
    getTotalCol() { return ids.length; },
    getColumnID(i) { return ids[i]; },
  };
}

function loadHarness(components) {
  const sandbox = {
    console, JSON, Array, String, Object, Date, Boolean, Number, Promise, Math,
    parseFloat, parseInt,
    scwin: {},
    window: {},
    WebSquare: { util: {}, cookie: {} },
    navigator: { userAgent: "test" },
    $c: { util: {}, win: {}, str: {}, data: {}, sbm: {} },
    $p: { getComponentById: (id) => (components || {})[id] },
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: path.basename(XML_FILE) + ".cdata.js" });
  sandbox.$c.util = sandbox.scwin; // $c.util.* 내부 상호 호출 연결
  return { scwin: sandbox.scwin };
}

const COLS = [
  { id: "comNm", header: "회사명", width: 160, align: "left" },
  { id: "y1m1", header: "자산총계", width: 110, align: "right", group: "2009년" },
  { id: "y1m2", header: "유동자산(계)", width: 110, align: "right", group: "2009년" },
  { id: "y2m1", header: "자산총계", width: 110, align: "right", group: "2010년" },
];

describe("$c.util.syncDataListColumns (src/gcc/util.xml)", () => {
  test("신규 컬럼 insert + 잔존 컬럼 remove", () => {
    const h = loadHarness();
    const dlt = makeDataList(["comNm", "oldCol"]);

    const r = h.scwin.syncDataListColumns(dlt, COLS);
    expect(r).toEqual({ inserted: 3, removed: 1 }); // y1m1·y1m2·y2m1 추가, oldCol 제거
    expect(dlt._ids).toEqual(["comNm", "y1m1", "y1m2", "y2m1"]);
  });

  test("재호출 멱등: 동일 cols 재적용 시 변경 없음", () => {
    const h = loadHarness();
    const dlt = makeDataList([]);

    h.scwin.syncDataListColumns(dlt, COLS);
    const r2 = h.scwin.syncDataListColumns(dlt, COLS);
    expect(r2).toEqual({ inserted: 0, removed: 0 });
    expect(dlt._ids).toEqual(["comNm", "y1m1", "y1m2", "y2m1"]);
  });

  test("아이디 문자열 인자: $p.getComponentById 로 조회", () => {
    const dlt = makeDataList([]);
    const h = loadHarness({ dlt_list: dlt });

    const r = h.scwin.syncDataListColumns("dlt_list", COLS);
    expect(r.inserted).toBe(4);
    expect(dlt._ids).toHaveLength(4);
  });

  test("인자 오류: 미존재 DataList·빈 cols 는 null (예외 없음)", () => {
    const h = loadHarness();
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(h.scwin.syncDataListColumns("noSuchDlt", COLS)).toBeNull();
    expect(h.scwin.syncDataListColumns(makeDataList([]), [])).toBeNull();
    expect(h.scwin.syncDataListColumns(makeDataList([]), null)).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("$c.util.buildGridStyleXml (src/gcc/util.xml)", () => {
  test("group 컬럼 → 2단 헤더(고정 rowSpan=2 + 그룹 colSpan 병합 + 하단 지표 행)", () => {
    const h = loadHarness();
    const xml = h.scwin.buildGridStyleXml({ id: "grdFis", dataList: "dltFisList" }, COLS);

    const header = xml.match(/<w2:header[^>]*>([\s\S]*?)<\/w2:header>/)[1];
    expect((header.match(/<w2:row>/g) || [])).toHaveLength(2);
    expect((xml.match(/rowSpan="2"/g) || [])).toHaveLength(1); // 고정 comNm
    expect(xml).toContain('colSpan="2"'); // 2009년 (y1m1·y1m2)
    expect(xml).toContain('colSpan="1"'); // 2010년 (y2m1)
    expect(xml).toContain('value="2009년"');
    const row2 = header.match(/<w2:row>([\s\S]*?)<\/w2:row>/g)[1];
    expect((row2.match(/<w2:column/g) || [])).toHaveLength(3); // group 컬럼 3개의 지표 헤더
    const gbody = xml.match(/<w2:gBody[^>]*>([\s\S]*?)<\/w2:gBody>/)[1];
    expect((gbody.match(/<w2:column/g) || [])).toHaveLength(4);
    expect(gbody).toContain('textAlign="right"');
  });

  test("group 없으면 단일 헤더 행 (rowSpan 없음)", () => {
    const h = loadHarness();
    const xml = h.scwin.buildGridStyleXml({ id: "grd", dataList: "dlt" },
      [{ id: "a", header: "A" }, { id: "b" }]);

    const header = xml.match(/<w2:header[^>]*>([\s\S]*?)<\/w2:header>/)[1];
    expect((header.match(/<w2:row>/g) || [])).toHaveLength(1);
    expect(xml).not.toContain("rowSpan");
    expect(xml).toContain('value="b"'); // header 생략 시 id 폴백
    expect(xml).toContain('width="100"'); // width 생략 시 기본값
  });

  test("gridOptions: 기본값·caption 생략·style/readOnly 반영", () => {
    const h = loadHarness();
    const basic = h.scwin.buildGridStyleXml({ id: "grd", dataList: "dlt" }, [{ id: "a" }]);
    expect(basic).toContain('class="gvw"');
    expect(basic).toContain('autoFit="allColumn"');
    expect(basic).toContain('focusMode="row"');
    expect(basic).toContain('readOnly="true"');
    expect(basic).toContain('dataList="data:dlt"');
    expect(basic).not.toContain("<w2:caption");
    expect(basic).not.toContain("style=");

    const full = h.scwin.buildGridStyleXml(
      { id: "grd", dataList: "dlt", caption: "캡션", style: "height: 420px;", readOnly: false }, [{ id: "a" }]);
    expect(full).toContain('<w2:caption id="grd_caption" value="캡션">');
    expect(full).toContain('style="height: 420px;"');
    expect(full).toContain('readOnly="false"');
  });

  test("특수문자 라벨 이스케이프 (& < > \")", () => {
    const h = loadHarness();
    const xml = h.scwin.buildGridStyleXml({ id: "grd", dataList: "dlt" },
      [{ id: "a", header: 'A&B <C> "D"', group: "G&G" }]);

    expect(xml).toContain("A&amp;B &lt;C&gt; &quot;D&quot;");
    expect(xml).toContain('value="G&amp;G"');
    expect(xml).not.toMatch(/value="[^"]*&B/); // 원문 & 잔존 없음
  });

  test("필수 옵션 누락·빈 cols 는 null (예외 없음)", () => {
    const h = loadHarness();
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(h.scwin.buildGridStyleXml(null, COLS)).toBeNull();
    expect(h.scwin.buildGridStyleXml({ id: "grd" }, COLS)).toBeNull(); // dataList 누락
    expect(h.scwin.buildGridStyleXml({ dataList: "dlt" }, COLS)).toBeNull(); // id 누락
    expect(h.scwin.buildGridStyleXml({ id: "grd", dataList: "dlt" }, [])).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
