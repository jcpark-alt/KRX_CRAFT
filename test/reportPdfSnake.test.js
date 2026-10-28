/**
 * 리포트 PDF 출력 공통함수 회귀 테스트.
 *
 * - $c.str.toUpperSnakeCase: camelCase → UPPER_SNAKE_CASE (문자열 / 객체 키 / 배열 행 키, exclude 옵션, 원본 불변).
 * - $c.data.openReportPdf: 응답 처리 결함 수정 — 중복 실행(skipped)·통신 실패(responseJSON 없음)에서
 *   TypeError 없이 false 를 돌려주고, 서버 errorMsg 는 안내만, 정상이면 pdfFileShortPath 로 창을 연다.
 * WebSquare 런타임을 mock 으로 대체한 vm 하네스로 str.xml·data.xml 의 CDATA 를 실제 구동한다.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

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

function loadScope(xmlRelPath, $c) {
  const sandbox = {
    console: { ...console, log: jest.fn(), warn: jest.fn(), error: jest.fn() },
    JSON, Array, String, Object, Date, Boolean, Number, RegExp, Promise, encodeURIComponent,
    scwin: {},
    $p: { getComponentById: () => null, getFrameId: () => "root", getParameter: () => null },
    WebSquare: { WebSquareLang: {}, util: { getBoolean: (v) => v === true || v === "true" } },
    $c,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(path.resolve(xmlRelPath)), sandbox);
  return sandbox.scwin;
}

describe("$c.str.toUpperSnakeCase", () => {
  const str = loadScope("cm/gcc/str.xml", { util: { isEmpty } });

  test("문자열: camelCase → UPPER_SNAKE_CASE", () => {
    expect(str.toUpperSnakeCase("isuKorAbbrv")).toBe("ISU_KOR_ABBRV");
    expect(str.toUpperSnakeCase("comNm")).toBe("COM_NM");
    expect(str.toUpperSnakeCase("subsrghtEpContn")).toBe("SUBSRGHT_EP_CONTN");
    expect(str.toUpperSnakeCase("isu")).toBe("ISU");
  });

  test("이미 대문자 스네이크·스네이크면 대문자만", () => {
    expect(str.toUpperSnakeCase("COM_NM")).toBe("COM_NM");
    expect(str.toUpperSnakeCase("pdf_rptname")).toBe("PDF_RPTNAME");
  });

  test("숫자 뒤 대문자 앞에 _ (숫자 앞에는 넣지 않음)", () => {
    expect(str.toUpperSnakeCase("chg1prefstkShrs")).toBe("CHG1PREFSTK_SHRS");
    expect(str.toUpperSnakeCase("jsonData1")).toBe("JSON_DATA1");
  });

  test("null·undefined 는 빈 문자열", () => {
    expect(str.toUpperSnakeCase(null)).toBe("");
    expect(str.toUpperSnakeCase(undefined)).toBe("");
  });

  test("객체: 키만 바꾸고 값은 그대로, 원본은 바꾸지 않음", () => {
    const src = { comNm: "가나", listShrs: "1,000", nested: { isuCd: "A" } };
    const out = str.toUpperSnakeCase(src);
    expect(out).toEqual({ COM_NM: "가나", LIST_SHRS: "1,000", NESTED: { isuCd: "A" } });
    expect(src).toEqual({ comNm: "가나", listShrs: "1,000", nested: { isuCd: "A" } });
    expect(out).not.toBe(src);
  });

  test("exclude 키는 그대로 둔다 (pdf_rptname)", () => {
    const out = str.toUpperSnakeCase({ isuCd: "A", pdf_rptname: "RLDSTF00029" }, { exclude: ["pdf_rptname"] });
    expect(out).toEqual({ ISU_CD: "A", pdf_rptname: "RLDSTF00029" });
  });

  test("배열: 행마다 키를 바꾸고 객체가 아닌 요소는 그대로", () => {
    const out = str.toUpperSnakeCase([{ prtdepoShrs: "10" }, { prtdepoShrs: "20" }, "x"]);
    expect(out).toEqual([{ PRTDEPO_SHRS: "10" }, { PRTDEPO_SHRS: "20" }, "x"]);
  });
});

describe("$c.data.openReportPdf", () => {
  function load(response) {
    const $c = {
      util: { isEmpty, isArray: Array.isArray },
      win: { alert: jest.fn(() => Promise.resolve()), openExternalPage: jest.fn(), getLanguage: () => "ko" },
      sbm: { executeDynamic: jest.fn(() => Promise.resolve(response)) },
      date: { getServerDateTime: () => "20261028000000" },
      str: { escapeToEnter: (m) => m, replaceAll: (s, a, b) => s.split(a).join(b), isFinalConsonant: () => false },
    };
    const data = loadScope("cm/gcc/data.xml", $c);
    $c.data = data;
    return { data, $c };
  }

  test("정상: pdfFileShortPath 로 창을 열고 true", async () => {
    const { data, $c } = load({ responseJSON: { body: { pdfFileShortPath: "/pdf/a.pdf" } } });
    const param = { url: "/api/listing/common/report/pdf-download", reqParam: { pdf_rptname: "R1" } };
    await expect(data.openReportPdf(param)).resolves.toBe(true);
    expect($c.sbm.executeDynamic).toHaveBeenCalledWith(
      expect.objectContaining({ action: "/api/listing/common/report/pdf-download", method: "post" }), param);
    expect($c.win.openExternalPage).toHaveBeenCalledWith("/pdf/a.pdf");
    expect($c.win.alert).not.toHaveBeenCalled();
  });

  test("url 생략 시 공시 리포트 다운로드 경로", async () => {
    const { data, $c } = load({ responseJSON: { body: { pdfFileShortPath: "/pdf/b.pdf" } } });
    await data.openReportPdf({ cmitTpCd: "20" });
    expect($c.sbm.executeDynamic.mock.calls[0][0].action).toBe("/api/discls/common/report/pdf-download");
  });

  test("서버 errorMsg: 안내만 하고 창을 열지 않음", async () => {
    const { data, $c } = load({ responseJSON: { body: { errorMsg: "리포트 생성 실패" } } });
    await expect(data.openReportPdf({})).resolves.toBe(false);
    expect($c.win.alert).toHaveBeenCalledWith("리포트 생성 실패");
    expect($c.win.openExternalPage).not.toHaveBeenCalled();
  });

  test("중복 실행(skipped): TypeError 없이 false", async () => {
    const { data, $c } = load({ skipped: true });
    await expect(data.openReportPdf({})).resolves.toBe(false);
    expect($c.win.openExternalPage).not.toHaveBeenCalled();
    expect($c.win.alert).not.toHaveBeenCalled();
  });

  test("통신 실패(responseJSON 없음): TypeError 없이 false", async () => {
    const { data, $c } = load({ responseJSON: undefined });
    await expect(data.openReportPdf({})).resolves.toBe(false);
    expect($c.win.openExternalPage).not.toHaveBeenCalled();
  });

  test("응답이 undefined 여도 TypeError 없이 false", async () => {
    const { data } = load(undefined);
    await expect(data.openReportPdf({})).resolves.toBe(false);
  });

  test("pdfFileShortPath 가 없으면 창을 열지 않음", async () => {
    const { data, $c } = load({ responseJSON: { body: { other: 1 } } });
    await expect(data.openReportPdf({})).resolves.toBe(false);
    expect($c.win.openExternalPage).not.toHaveBeenCalled();
  });
});
