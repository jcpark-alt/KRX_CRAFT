/**
 * 화면(메인 content·레이어 팝업 공통) 인쇄·PDF 저장 공통함수($c.win.print) 회귀 테스트.
 *
 * print 는 window.print 대신 html2canvas 로 호출 화면의 frame DOM(메인이면 content, 팝업이면 팝업 페이지)만 캡처해
 * 숨김 iframe 에서 인쇄하거나(type print) html2pdf 로 PDF 를 저장한다(type pdf).
 * 라이브러리는 config.xml 의 engine module 로 정적 로드된 전역(window.html2canvas / window.html2pdf)을
 * 쓰며 동적 로드는 하지 않는다 — 전역이 없으면 등록 안내 Error 를 던진다.
 * WebSquare 런타임·DOM·라이브러리를 mock 으로 대체한 vm 하네스로 검증한다.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILE = "cm/gcc/win.xml";

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

// win.xml CDATA 를 mock 런타임 위에 로드한 "창(window)" 하나를 만든다.
// libs: { html2canvas, html2pdf } — false 로 주면 그 전역을 심지 않는다(미등록 상황 재현). 기본은 둘 다 로드된 상태.
function loadWindow(overrides = {}) {
  const libs = Object.assign({ html2canvas: true, html2pdf: true }, overrides.libs || {});
  const calls = { loadScript: [], html2canvas: [], pdfSet: [], pdfFrom: [], pdfSave: 0, print: 0, appended: [], removed: [], written: "" };

  const canvasMock = { toDataURL: () => "data:image/png;base64,AAA" };
  const frameRender = { id: "mf_frame_render", nodeType: 1, scrollWidth: 800, scrollHeight: 1200 };
  const elements = {
    mf_frame_grp_area: { id: "mf_frame_grp_area", nodeType: 1, scrollWidth: 300, scrollHeight: 400 },
  };

  const iframeDoc = {
    open() {}, close() {},
    write(html) { calls.written += html; },
    querySelector: () => ({ complete: true }),
  };
  const iframeWin = { document: iframeDoc, addEventListener() {}, focus() {}, print() { calls.print++; } };
  const iframe = { style: {}, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, contentWindow: iframeWin, parentNode: null };

  const body = {
    nodeType: 1,
    appendChild(el) { calls.appended.push(el); el.parentNode = body; },
    removeChild(el) { calls.removed.push(el); el.parentNode = null; },
  };

  const pdfChain = {
    from(el) { calls.pdfFrom.push(el); return pdfChain; },
    set(o) { calls.pdfSet.push(o); return pdfChain; },
    save() { calls.pdfSave++; return Promise.resolve(); },
  };

  // 최대화된 windowContainer 창(.w2window.w2window_maximized.w2window_selected) — overrides.maximizedWin 으로 주입.
  // 캡처 시점의 inline width 를 기록해 "캡처 중에만 px 고정, 끝나면 복원" 을 검증한다.
  const maximizedWin = overrides.maximizedWin || null;
  // 출력 대상은 element.closest(".w2window.w2window_maximized") 로 자기가 속한 최대화 창을 찾는다 — 주입된 창을 돌려주는 closest 를 심는다
  const closest = (sel) => (sel === ".w2window.w2window_maximized" ? maximizedWin : null);
  frameRender.closest = closest; body.closest = closest;
  Object.values(elements).forEach((el) => { el.closest = closest; });
  calls.widthAtCapture = [];
  const noteWidth = () => { if (maximizedWin) calls.widthAtCapture.push(maximizedWin.style.width); };

  // config.xml engine module 로 로드된 전역을 흉내 낸다
  const win = { screen: { availWidth: 1920, availHeight: 1080, availTop: 0, availLeft: 0 }, opener: null };
  if (libs.html2canvas) win.html2canvas = async (el, o) => {
    noteWidth();
    if (overrides.captureError) throw new Error(overrides.captureError);
    calls.html2canvas.push({ el, o }); return canvasMock;
  };
  if (libs.html2pdf) win.html2pdf = () => pdfChain;
  const pdfFromOrig = pdfChain.from;
  pdfChain.from = (el) => { noteWidth(); return pdfFromOrig(el); };

  const sandbox = {
    console, JSON, Array, String, Object, Date, Boolean, Number, Promise, Math, Error,
    parseFloat, parseInt, encodeURIComponent,
    setTimeout: () => 0,
    scwin: {},
    WebSquareExternal: { contextPath: "" },
    document: {
      title: "테스트 화면",
      body,
      createElement: () => iframe,
      getElementById: (id) => elements[id] || null,
    },
    $: () => ({ css: () => "0", scrollTop: () => 0, scrollLeft: () => 0 }),
    $c: {
      util: {
        isEmpty, getJSON: (x) => x, getCallBackFunction: () => undefined, setTimeout: (fn) => fn(),
        loadScript: async (src) => { calls.loadScript.push(src); },   // 호출되면 안 된다(동적 로드 제거)
      },
      num: { parseInt: (v) => parseInt(v, 10) },
      sbm: { getContextPath: () => "" },
      str: { serialize: (v) => JSON.stringify(v) },
      data: { getParameter: () => "" },
      win: {},
    },
    $p: {
      id: "scopeA",
      getFrameId: () => "mf_frame",
      getFrame: () => ({ scope: { scwin: {} }, render: frameRender }),
      parent: () => ({ scwin: {} }),
      getPopupId: () => null,
      openPopup: () => {},
      main: () => ({}),
    },
    window: win,
  };
  Object.assign(sandbox.$p, overrides.$p || {});

  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: path.basename(XML_FILE) + ".cdata.js" });
  sandbox.$c.win = sandbox.scwin;

  return { scwin: sandbox.scwin, calls, frameRender, elements, iframe, body, win, maximizedWin };
}

describe("화면 인쇄·PDF 저장 $c.win.print — 메인·팝업 공통 (cm/gcc/win.xml)", () => {
  // 최대화된 windowContainer 창은 폭이 % 라 html2canvas 가 폭을 잘못 재므로 캡처 중에만 px 로 고정하고 끝나면 복원한다.
  const makeMaximized = () => ({ clientWidth: 1280, style: { width: "" } });

  test("최대화 창: print 캡처 중에는 폭이 clientWidth px 로 고정되고, 끝나면 원래 inline width 로 복원된다", async () => {
    const w = loadWindow({ maximizedWin: makeMaximized() });
    await w.scwin.print();
    expect(w.calls.widthAtCapture).toEqual(["1280px"]);
    expect(w.maximizedWin.style.width).toBe("");
  });

  test("최대화 창: pdf 경로도 캡처 중 고정·완료 후 복원(기존 inline width 유지)", async () => {
    const w = loadWindow({ maximizedWin: { clientWidth: 1024, style: { width: "50%" } } });
    await w.scwin.print({ type: "pdf" });
    expect(w.calls.widthAtCapture).toEqual(["1024px"]);
    expect(w.maximizedWin.style.width).toBe("50%");
  });

  test("최대화 창: 캡처가 실패해도 폭은 복원된다(try/finally)", async () => {
    const w = loadWindow({ maximizedWin: makeMaximized(), captureError: "canvas fail" });
    await expect(w.scwin.print()).rejects.toThrow("canvas fail");
    expect(w.maximizedWin.style.width).toBe("");
  });

  test("최대화 창이 없으면(일반 화면) 폭 조작 없이 그대로 캡처한다", async () => {
    const w = loadWindow();
    await w.scwin.print();
    expect(w.calls.widthAtCapture).toEqual([]);
    expect(w.calls.html2canvas).toHaveLength(1);
  });

  test("최대화 창은 출력 대상(element)이 속한 창에서 closest 로 찾는다 — closest 가 없는 요소(구형 DOM)면 조작 없이 진행", async () => {
    const w = loadWindow({ maximizedWin: makeMaximized() });
    const bare = { id: "bare", nodeType: 1, scrollWidth: 100, scrollHeight: 100 };   // closest 없음
    await w.scwin.print({ target: bare });
    expect(w.calls.widthAtCapture).toEqual([""]);                                   // 캡처 시점에도 폭이 그대로(px 고정 없음) — 대상이 최대화 창 안이 아니면 건드리지 않는다
    expect(w.maximizedWin.style.width).toBe("");
  });

  test("기본(print): 현재 frame DOM 캡처 → 숨김 iframe 에 이미지를 써서 인쇄 (동적 로드 없음)", async () => {
    const w = loadWindow();
    await w.scwin.print();

    expect(w.calls.loadScript).toEqual([]);                                   // config.xml 정적 로드 전제 — 동적 로드하지 않는다
    expect(w.calls.html2canvas).toHaveLength(1);
    expect(w.calls.html2canvas[0].el).toBe(w.frameRender);                    // 팝업 페이지 frame DOM
    expect(w.calls.html2canvas[0].o.scale).toBe(2);
    expect(w.calls.html2canvas[0].o.height).toBe(1200);                       // 스크롤 영역까지 캡처
    expect(w.calls.appended).toEqual([w.iframe]);
    expect(w.iframe.attrs["aria-hidden"]).toBe("true");
    expect(w.calls.written).toContain("<title>테스트 화면</title>");
    expect(w.calls.written).toContain("data:image/png;base64,AAA");
    expect(w.calls.print).toBe(1);
    expect(w.calls.pdfSave).toBe(0);
  });

  test("print: options.title 이 인쇄 문서 제목이 되고 HTML 특수문자는 이스케이프된다", async () => {
    const w = loadWindow();
    await w.scwin.print({ title: "안내문 <A&B>" });
    expect(w.calls.written).toContain("<title>안내문 &lt;A&amp;B&gt;</title>");
  });

  test("pdf: 파일명·방향·여백을 html2pdf 옵션으로 전달하고 저장 (동적 로드 없음)", async () => {
    const w = loadWindow();
    await w.scwin.print({ type: "pdf", fileName: "공시안내문.pdf", orientation: "landscape", margin: 5 });

    expect(w.calls.loadScript).toEqual([]);
    expect(w.calls.pdfFrom).toEqual([w.frameRender]);
    const opt = w.calls.pdfSet[0];
    expect(opt.filename).toBe("공시안내문.pdf");
    expect(opt.jsPDF).toEqual({ unit: "mm", format: "a4", orientation: "landscape" });
    expect(opt.margin).toBe(5);
    expect(opt.html2canvas.scale).toBe(2);
    expect(w.calls.pdfSave).toBe(1);
    expect(w.calls.print).toBe(0);                                             // 인쇄 대화상자는 띄우지 않는다
    expect(w.calls.appended).toEqual([]);
  });

  test("pdf: 파일명 미지정 시 print_yyyyMMddHHmmss.pdf", async () => {
    const w = loadWindow();
    await w.scwin.print({ type: "pdf" });
    expect(w.calls.pdfSet[0].filename).toMatch(/^print_\d{14}\.pdf$/);
  });

  test("target: 컴포넌트 객체(getID) / DOM id / DOM 요소 모두 출력 영역으로 해석", async () => {
    const comp = { getID: () => "mf_frame_grp_area" };
    let w = loadWindow();
    await w.scwin.print({ target: comp });
    expect(w.calls.html2canvas[0].el).toBe(w.elements.mf_frame_grp_area);

    w = loadWindow();
    await w.scwin.print({ target: "mf_frame_grp_area" });
    expect(w.calls.html2canvas[0].el).toBe(w.elements.mf_frame_grp_area);

    w = loadWindow();
    const el = { nodeType: 1, scrollWidth: 10, scrollHeight: 20 };
    await w.scwin.print({ target: el });
    expect(w.calls.html2canvas[0].el).toBe(el);
    expect(w.calls.html2canvas[0].o.width).toBe(10);
  });

  test("target 을 지정했으나 찾지 못하면 Error (frame 으로 조용히 대체하지 않는다)", async () => {
    const w = loadWindow();
    await expect(w.scwin.print({ target: "not_exists" })).rejects.toThrow("출력 영역(target)을 찾을 수 없습니다");
    expect(w.calls.html2canvas).toEqual([]);
  });

  test("frame 이 없는 화면(getFrame → null)은 document.body 를 출력", async () => {
    const w = loadWindow({ $p: { getFrame: () => null } });
    await w.scwin.print();
    expect(w.calls.html2canvas[0].el).toBe(w.body);
  });

  test("전역 html2canvas 가 없으면 config.xml 등록 안내 Error — 인쇄·저장·동적 로드 모두 하지 않는다", async () => {
    const w = loadWindow({ libs: { html2canvas: false } });
    await expect(w.scwin.print()).rejects.toThrow("websquare/config.xml");
    await expect(w.scwin.print()).rejects.toThrow("/cm/js/html2canvas.min.js");
    expect(w.calls.loadScript).toEqual([]);
    expect(w.calls.print).toBe(0);
    expect(w.calls.appended).toEqual([]);
  });

  test("pdf 는 html2pdf 전역도 필요 — 없으면 그 경로를 안내, print 는 html2pdf 없이도 된다", async () => {
    const w = loadWindow({ libs: { html2pdf: false } });
    await expect(w.scwin.print({ type: "pdf" })).rejects.toThrow("/cm/js/html2pdf.bundle.min.js");
    expect(w.calls.pdfSave).toBe(0);

    await w.scwin.print();                                                 // print 경로는 정상
    expect(w.calls.print).toBe(1);
  });

  test("상수: 라이브러리 경로는 /cm/js 아래(config.xml engine module 과 일치), 기본 옵션은 print/세로/여백 10/배율 2", () => {
    const w = loadWindow();
    expect(w.scwin.PRINT_LIB_INFO).toEqual({
      html2canvas: "/cm/js/html2canvas.min.js",
      jspdf: "/cm/js/jspdf.umd.min.js",
      html2pdf: "/cm/js/html2pdf.bundle.min.js",
    });
    expect(w.scwin.PRINT_DEFAULT_OPTIONS).toMatchObject({ type: "print", orientation: "portrait", margin: 10, scale: 2 });

    // config.xml / config.js 의 engine module 등록과 경로가 같아야 한다
    const configXml = fs.readFileSync("websquare/config.xml", "utf8");
    const configJs = fs.readFileSync("websquare/config.js", "utf8");
    Object.values(w.scwin.PRINT_LIB_INFO).forEach((src) => {
      expect(configXml).toContain('<module src="' + src + '"/>');
      expect(configJs).toContain('"@src": "' + src + '"');
      expect(fs.existsSync(path.join("cm", "js", path.basename(src)))).toBe(true);
    });
  });

  test("종전 mainPrint·popupPrint 는 제거되고 print 하나로 통합 (publicInfo 도 print 만)", () => {
    const w = loadWindow();
    expect(typeof w.scwin.print).toBe("function");
    expect(w.scwin.mainPrint).toBeUndefined();
    expect(w.scwin.popupPrint).toBeUndefined();
    const xml = fs.readFileSync(XML_FILE, "utf8");
    const pub = xml.match(/publicInfo method="([^"]*)"/)[1].split(",");
    expect(pub).toContain("scwin.print");
    expect(pub).not.toContain("scwin.mainPrint");
    expect(pub).not.toContain("scwin.popupPrint");
  });
});
