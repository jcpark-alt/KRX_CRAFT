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
  // 실제 화면 DOM 은 건드리지 않는다 — 캡처 보정은 모두 복제본(onclone)에서 한다.
  // 종전의 "최대화 windowContainer 창 폭을 캡처 동안 px 고정"(1528412)은 복제본 보정 도입 후 실화면 확인 결과 불필요해 제거(2026-10-01).
  test("최대화 창 안에서 print/pdf 를 해도 창의 inline width 는 캡처 중·후 모두 그대로다 (실제 DOM 무조작)", async () => {
    let w = loadWindow({ maximizedWin: { clientWidth: 1280, style: { width: "50%" } } });
    await w.scwin.print();
    expect(w.calls.widthAtCapture).toEqual(["50%"]);                                // 캡처 시점에도 px 고정 없음
    expect(w.maximizedWin.style.width).toBe("50%");

    w = loadWindow({ maximizedWin: { clientWidth: 1024, style: { width: "" } } });
    await w.scwin.print({ type: "pdf" });
    expect(w.calls.widthAtCapture).toEqual([""]);
    expect(w.maximizedWin.style.width).toBe("");
  });

  test("캡처 실패는 그대로 전파되고(삼킴 없음) 일반 화면은 폭 조작 없이 캡처한다", async () => {
    let w = loadWindow({ captureError: "canvas fail" });
    await expect(w.scwin.print()).rejects.toThrow("canvas fail");

    w = loadWindow();
    await w.scwin.print();
    expect(w.calls.widthAtCapture).toEqual([]);
    expect(w.calls.html2canvas).toHaveLength(1);
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

  // ---- 스크롤된 화면 전체 캡처 — 캡처용 복제본에서만 대상의 스크롤·overflow 클리핑을 푼다 (헤드리스 실측으로 검증한 보정) ----
  // html2canvas 는 대상 자체의 overflow:auto 로 클리핑하고 scrollTop 까지 복제본에 복원하므로, 대상이 스크롤 컨테이너면
  // 스크롤된 뷰포트 부분만 밀린 위치에 그려지고 나머지는 흰 여백이 된다. onclone 에서 복제본을 보정해 전체를 그린다.
  const makeCloneNode = (id, opts = {}) => Object.assign({ id, nodeType: 1, scrollTop: 0, scrollLeft: 0, style: {}, parentNode: null }, opts);
  const makeCloneChain = (targetId) => {
    // html(복제 루트) > body > content(스크롤된 조상) > target(스크롤 컨테이너 자신)
    const html = makeCloneNode("", { scrollTop: 0 });
    const body = makeCloneNode("", { parentNode: html, style: { overflow: "hidden" } });
    const content = makeCloneNode("content", { parentNode: body, scrollTop: 400, style: { overflow: "auto", height: "740px" } });
    const target = makeCloneNode(targetId, { parentNode: content, scrollTop: 400, scrollLeft: 30, style: { overflow: "auto", height: "500px", maxHeight: "500px" } });
    html.parentNode = { nodeType: 9 };                                      // Document — 체인 종료
    return { html, body, content, target };
  };

  test("print: html2canvas 옵션에 onclone 이 있고, 복제본의 대상을 내용 높이로 펼치며 대상→루트의 스크롤 0·overflow visible 로 보정한다 (실제 DOM 은 그대로)", async () => {
    const w = loadWindow();
    await w.scwin.print();
    const o = w.calls.html2canvas[0].o;
    expect(typeof o.onclone).toBe("function");
    expect(o.height).toBe(1200);                                             // 캡처 크기는 여전히 scroll 크기

    const c = makeCloneChain("mf_frame_render");
    const clonedDoc = { querySelectorAll: () => { throw new Error("clonedElement 가 있으면 문서 검색을 하지 않는다"); } };
    o.onclone(clonedDoc, c.target);                                          // html2canvas 1.3.2: (복제 문서, 복제 대상)

    expect(c.target.style).toMatchObject({ height: "auto", maxHeight: "none", overflow: "visible" });
    expect(c.target.scrollTop).toBe(0);
    expect(c.target.scrollLeft).toBe(0);
    expect(c.content.scrollTop).toBe(0);                                     // 스크롤된 조상도 되돌린다
    expect(c.content.style.overflow).toBe("visible");
    expect(c.content.style.height).toBe("740px");                            // 조상의 높이는 건드리지 않는다
    expect(c.body.style.overflow).toBe("visible");
    expect(c.html.style.overflow).toBe("visible");
    expect(w.frameRender.style).toBeUndefined();                             // 실제 화면 DOM 은 손대지 않는다
  });

  test("pdf: html2pdf 내장 html2canvas 는 onclone 에 복제 문서만 넘기고 같은 id 가 둘(원본·사본)이므로 마지막 것(사본)을 보정한다", async () => {
    const w = loadWindow();
    await w.scwin.print({ type: "pdf" });
    const o = w.calls.pdfSet[0].html2canvas;
    expect(typeof o.onclone).toBe("function");

    const original = makeCloneChain("mf_frame_render");                     // 원본(화면 안)
    const copy = makeCloneChain("mf_frame_render");                          // html2pdf 사본(body 끝 오버레이 안)
    const clonedDoc = { querySelectorAll: (sel) => (sel === '[id="mf_frame_render"]' ? [original.target, copy.target] : []) };
    o.onclone(clonedDoc);                                                    // html2pdf 0.9.2: (복제 문서) 1인자

    expect(copy.target.style).toMatchObject({ height: "auto", overflow: "visible" });
    expect(copy.target.scrollTop).toBe(0);
    expect(original.target.style.height).toBe("500px");                      // 원본 쪽은 그대로
  });

  test("pdf: 화면 요소의 폭·높이를 html2pdf 쪽 html2canvas 에 강제하지 않는다 (A4 폭 재배치와 충돌해 오른쪽 여백·축소 발생)", async () => {
    const w = loadWindow();
    await w.scwin.print({ type: "pdf" });
    const o = w.calls.pdfSet[0].html2canvas;
    expect(o).not.toHaveProperty("width");
    expect(o).not.toHaveProperty("height");
    expect(o).not.toHaveProperty("windowWidth");
    expect(o).not.toHaveProperty("windowHeight");
    expect(o).toMatchObject({ scale: 2, useCORS: true, backgroundColor: "#FFFFFF" });

    const p = w.calls.html2canvas;                                           // print 경로는 종전대로 scroll 크기를 준다
    await w.scwin.print();
    expect(p[0].o).toMatchObject({ width: 800, height: 1200, windowWidth: 800, windowHeight: 1200 });
  });

  // ---- input 버튼 value 텍스트 상단 쏠림 — 복제본의 input[type=button|submit|reset] 을 계산 스타일을 복사한 <button> 으로 치환 ----
  // html2canvas 는 input 의 value 를 content box 상단에 직접 찍어 세로 가운데 정렬이 무시된다(1.4.1 도 동일, 실측).
  // <button> 의 텍스트 노드는 실제 배치대로 그린다. class 만 옮기면 input.w2trigger 류 타입 선택자 스타일이 빠지므로 계산 스타일 전 속성을 복사한다.
  const makeComputed = (props) => {
    const keys = Object.keys(props);
    const cs = { length: keys.length, getPropertyValue: (p) => props[p], getPropertyPriority: (p) => (p === "color" ? "important" : "") };
    keys.forEach((k, i) => { cs[i] = k; });
    return cs;
  };
  const makeStyle = () => { const s = { props: {}, setProperty(p, v, prio) { this.props[p] = [v, prio]; } }; return s; };
  const makeClonedDocWithInputs = (inputs) => {
    const created = [];
    const doc = {
      defaultView: { getComputedStyle: (el) => el.computed },
      querySelectorAll: (sel) => (sel.includes('input[type="button"]') ? inputs : []),
      createElement: (tag) => { const el = { tag, style: makeStyle() }; created.push(el); return el; },
    };
    return { doc, created };
  };

  test("onclone: 복제본의 input 버튼을 같은 value·id·class 의 <button> 으로 바꾸고 계산 스타일 전 속성(우선순위 포함)과 border-box 폭·높이를 옮긴다", async () => {
    const w = loadWindow();
    await w.scwin.print();
    const o = w.calls.html2canvas[0].o;

    const replaced = [];
    const parent = { replaceChild: (nu, old) => replaced.push([nu, old]) };
    const trigger = { id: "mf_frame_btn_search", className: "w2trigger btn_primary", value: "조회", disabled: false, parentNode: parent,
      getBoundingClientRect: () => ({ width: 80.5, height: 40 }),
      computed: makeComputed({ "background-color": "rgb(200, 230, 255)", "border-top-width": "2px", color: "rgb(0, 0, 0)", "font-size": "14px" }) };
    const disabledBtn = { id: "mf_frame_btn_save", className: "w2trigger", value: "저장", disabled: true, parentNode: parent,
      getBoundingClientRect: () => ({ width: 60, height: 30 }), computed: makeComputed({ opacity: "0.5" }) };
    const { doc, created } = makeClonedDocWithInputs([trigger, disabledBtn]);

    o.onclone(doc, { id: "mf_frame_render", nodeType: 1, style: {}, parentNode: null });

    expect(created.map((b) => b.tag)).toEqual(["button", "button"]);
    expect(replaced).toEqual([[created[0], trigger], [created[1], disabledBtn]]);
    const b = created[0];
    expect(b).toMatchObject({ type: "button", id: "mf_frame_btn_search", className: "w2trigger btn_primary", textContent: "조회" });
    expect(b.style.props["background-color"]).toEqual(["rgb(200, 230, 255)", ""]);   // 타입 선택자 스타일도 계산값으로 보존
    expect(b.style.props["color"]).toEqual(["rgb(0, 0, 0)", "important"]);
    expect(b.style.props["font-size"]).toEqual(["14px", ""]);
    expect(b.style).toMatchObject({ boxSizing: "border-box", width: "80.5px", height: "40px" });
    expect(b.disabled).toBeUndefined();
    expect(created[1].disabled).toBe(true);
    expect(created[1].style.props["opacity"]).toEqual(["0.5", ""]);
  });

  test("onclone: 부모가 없는 input 은 건너뛰고, 렌더되지 않은 문서(getComputedStyle 없음)·html2pdf 1인자 호출에서도 예외 없이 동작", async () => {
    const w = loadWindow();
    await w.scwin.print({ type: "pdf" });
    const o = w.calls.pdfSet[0].html2canvas;

    const orphan = { id: "x", className: "", value: "고아", parentNode: null, getBoundingClientRect: () => ({ width: 1, height: 1 }), computed: makeComputed({}) };
    const { doc, created } = makeClonedDocWithInputs([orphan]);
    expect(() => o.onclone(doc)).not.toThrow();                              // html2pdf: (복제 문서) 1인자
    expect(created).toEqual([]);

    expect(() => o.onclone({ querySelectorAll: () => [] })).not.toThrow();   // defaultView 없음 → 치환 생략
    expect(() => w.calls.html2canvas).not.toThrow();
  });

  test("id 없는 대상(document.body)·clonedElement 없음(html2pdf) 조합이면 보정 없이 조용히 넘어간다", async () => {
    const w = loadWindow({ $p: { getFrame: () => null } });
    await w.scwin.print({ type: "pdf" });
    const o = w.calls.pdfSet[0].html2canvas;
    expect(() => o.onclone({ querySelectorAll: () => [] })).not.toThrow();

    await w.scwin.print();                                                   // print 경로: clonedElement 가 있으면 그것을 보정
    const el = makeCloneNode("", { style: {} });
    w.calls.html2canvas[0].o.onclone({}, el);
    expect(el.style.overflow).toBe("visible");
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
