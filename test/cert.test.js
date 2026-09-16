/**
 * $c.cert 공동인증서 연동 공통 + $c.util DOM 로더(loadScript/loadCss/addStyle) 회귀 테스트.
 *
 * WebSquare 런타임과 벤더 전역(fnInitechAuthWithParams·cwui_conf·cwModuleInstallWaitWithNoPopup)을 mock 으로 대체한
 * vm 하네스로 cert.xml / util.xml 의 CDATA 를 로드해 실제 구동한다.
 * 규약: auth 는 콜백 수신을 기다리지 않는다(벤더가 실패·취소 시 콜백을 부르지 않으므로 Promise 로 감싸면 영구 pending).
 */
const fs = require("fs");
const vm = require("vm");

const CERT_XML = "cm/gcc/cert.xml";
const UTIL_XML = "cm/gcc/util.xml";

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

// 최소 DOM mock — head 에 붙는 script/link/style 을 배열로 기록하고, script 는 appendChild 직후 onload 를 호출한다.
function makeFakeDocument(opts) {
  opts = opts || {};
  const head = { children: [] };
  const doc = {
    head,
    createElement(tag) {
      return { tagName: tag.toUpperCase(), textContent: "" };
    },
    getElementById(id) {
      return head.children.find((el) => el.id === id) || null;
    },
    querySelector(sel) {
      const m = sel.match(/^(script|link)\[(src|href)="(.*)"\]$/);
      if (!m) return null;
      return head.children.find((el) => el.tagName === m[1].toUpperCase() && el[m[2]] === m[3]) || null;
    },
  };
  head.appendChild = (el) => {
    head.children.push(el);
    if (el.tagName === "SCRIPT") {
      if (opts.failSrc && el.src === opts.failSrc) el.onerror && el.onerror();
      else el.onload && el.onload();
    }
  };
  return doc;
}

function loadHarness(opts) {
  opts = opts || {};
  const calls = { vendorAuth: [], installWait: [], openManager: [] };
  const document = makeFakeDocument(opts);
  const window = { jQuery: opts.jQuery };

  const sandbox = {
    console: { log() {}, warn() {}, error() {} },
    JSON, Array, String, Object, Date, Boolean, Number, Promise, Math, Error,
    document,
    window,
    scwin: {},
    $c: { util: null, cert: null },
    $p: {},
  };
  vm.createContext(sandbox);

  // util.xml 로드 (loadScript/loadCss/addStyle/isEmpty 실제 구현 사용)
  vm.runInContext(extractCdata(UTIL_XML), sandbox, { filename: "util.xml.cdata.js" });
  sandbox.$c.util = sandbox.scwin;
  sandbox.$c.util.isEmpty = isEmpty; // __getUserAgent 등 브라우저 의존 없이 순수 검사만 쓴다

  // cert.xml 로드 (별도 scwin 스코프)
  const certScope = {};
  sandbox.scwin = certScope;
  vm.runInContext(extractCdata(CERT_XML), sandbox, { filename: "cert.xml.cdata.js" });
  sandbox.$c.cert = certScope;

  // 벤더 전역 주입 헬퍼
  const vendor = {
    installReady() {
      window.fnInitechAuthWithParams = (url, params, cb, options) => calls.vendorAuth.push({ url, params, cb, options });
      sandbox.fnInitechAuthWithParams = window.fnInitechAuthWithParams;
      window.cwModuleInstallWaitWithNoPopup = (cb) => calls.installWait.push(cb);
      sandbox.cwModuleInstallWaitWithNoPopup = window.cwModuleInstallWaitWithNoPopup;
      window.INIWEBEX = { openCertManager: (option) => calls.openManager.push(option) };
      sandbox.INIWEBEX = window.INIWEBEX;
      window.cwui_conf = {
        defaultConf: { KeyStrokeSecurity: { KeyStrokeSecurityList: [
          { KEYPAD_NAME: "AHNLAB_KEY", USE: "N" },
          { KEYPAD_NAME: "TRANS_KEY", USE: "N" },
        ] } },
      };
    },
  };

  return { cert: certScope, util: sandbox.$c.util, calls, document, window, vendor };
}

describe("$c.util DOM 로더 (cm/gcc/util.xml)", () => {
  test("loadScript 는 script 태그를 head 에 붙이고 onload 에 resolve, 같은 src 는 재삽입하지 않는다", async () => {
    const h = loadHarness();
    await h.util.loadScript("/a.js");
    await h.util.loadScript("/a.js");
    const scripts = h.document.head.children.filter((el) => el.tagName === "SCRIPT");
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toBe("/a.js");
  });

  test("loadScript 는 로드 실패 시 src 를 담은 Error 로 reject 한다", async () => {
    const h = loadHarness({ failSrc: "/bad.js" });
    await expect(h.util.loadScript("/bad.js")).rejects.toThrow("/bad.js");
  });

  test("loadCss 는 link 태그를 1회만 붙인다", () => {
    const h = loadHarness();
    h.util.loadCss("/a.css");
    h.util.loadCss("/a.css");
    const links = h.document.head.children.filter((el) => el.tagName === "LINK");
    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({ rel: "stylesheet", href: "/a.css" });
  });

  test("addStyle 은 같은 id 면 style 태그를 재사용하고 내용을 교체한다(멱등)", () => {
    const h = loadHarness();
    h.util.addStyle("s1", "a{}");
    h.util.addStyle("s1", "b{}");
    const styles = h.document.head.children.filter((el) => el.tagName === "STYLE");
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toBe("b{}");
  });
});

describe("$c.cert 공동인증서 연동 (cm/gcc/cert.xml)", () => {
  test("isReady 는 벤더 함수 유무를 반환한다", () => {
    const h = loadHarness();
    expect(h.cert.isReady()).toBe(false);
    h.vendor.installReady();
    expect(h.cert.isReady()).toBe(true);
  });

  test("loadModule 은 벤더 스크립트가 셸에 없으면 동적 로드 대신 등록 안내 오류를 던진다(crosswebex6 document.write 회피)", async () => {
    const h = loadHarness();
    await expect(h.cert.loadModule()).rejects.toThrow("config.xml");
    expect(h.document.head.children.filter((el) => el.tagName === "SCRIPT")).toHaveLength(0);
    expect(h.document.head.children.filter((el) => el.tagName === "LINK")).toHaveLength(0);
  });

  test("loadModule 은 벤더가 준비돼 있으면 키패드 style 을 넣고 모듈 초기화만 한다(onStatus 진행/완료)", async () => {
    const h = loadHarness();
    h.vendor.installReady();
    const status = [];
    await h.cert.loadModule({ onStatus: (msg, done) => status.push({ msg, done }) });
    expect(h.document.head.children.filter((el) => el.tagName === "SCRIPT")).toHaveLength(0);
    const style = h.document.getElementById(h.cert.INITECH_INFO.KEYPAD_STYLE_ID);
    expect(style.textContent).toContain("#ini_cert_pwd_layout");
    expect(style.textContent).toContain("z-index: 7002 !important");
    expect(h.calls.installWait).toHaveLength(1);
    expect(status).toEqual([{ msg: "공동인증서 모듈 초기화 중입니다.", done: false }]);
    h.calls.installWait[0]();
    expect(status[1]).toEqual({ msg: "공동인증서 모듈 초기화가 완료되었습니다.", done: true });
  });

  test("setTranskeyUse 는 TRANS_KEY 항목의 USE 만 바꾸고, 설정이 없으면 false", () => {
    const h = loadHarness();
    expect(h.cert.setTranskeyUse(true)).toBe(false);
    h.vendor.installReady();
    expect(h.cert.setTranskeyUse(true)).toBe(true);
    const list = h.window.cwui_conf.defaultConf.KeyStrokeSecurity.KeyStrokeSecurityList;
    expect(list.find((k) => k.KEYPAD_NAME === "TRANS_KEY").USE).toBe("Y");
    expect(list.find((k) => k.KEYPAD_NAME === "AHNLAB_KEY").USE).toBe("N");
    h.cert.setTranskeyUse(false);
    expect(list.find((k) => k.KEYPAD_NAME === "TRANS_KEY").USE).toBe("N");
  });

  test("auth 는 useTranskey 를 팝업 직전에 반영하고 params·callback 을 벤더에 그대로 넘긴다(콜백 대기 없음)", async () => {
    const h = loadHarness();
    h.vendor.installReady();
    const cb = () => {};
    await h.cert.auth("/api/x", cb, { params: { chrgNm: "홍길동" }, useTranskey: true, popupOptions: { vid: true } });
    expect(h.calls.vendorAuth).toHaveLength(1);
    expect(h.calls.vendorAuth[0]).toEqual({ url: "/api/x", params: { chrgNm: "홍길동" }, cb, options: { vid: true } });
    const list = h.window.cwui_conf.defaultConf.KeyStrokeSecurity.KeyStrokeSecurityList;
    expect(list.find((k) => k.KEYPAD_NAME === "TRANS_KEY").USE).toBe("Y");
  });

  test("auth 는 params 생략 시 null 을 넘기고, useTranskey 미지정이면 키패드 설정을 건드리지 않는다", async () => {
    const h = loadHarness();
    h.vendor.installReady();
    await h.cert.auth("/api/y", () => {});
    expect(h.calls.vendorAuth[0].params).toBeNull();
    const list = h.window.cwui_conf.defaultConf.KeyStrokeSecurity.KeyStrokeSecurityList;
    expect(list.find((k) => k.KEYPAD_NAME === "TRANS_KEY").USE).toBe("N");
  });

  test("openManager 는 useTranskey 를 반영하고 INIWEBEX.openCertManager 에 isHtml5·langType·taskNm·processCallback 을 넘긴다", async () => {
    const h = loadHarness();
    h.vendor.installReady();
    const cb = () => {};
    await h.cert.openManager({ taskNm: "cert_change_password", callback: cb, useTranskey: true, popupOptions: { langType: "ENG" } });
    expect(h.calls.openManager).toHaveLength(1);
    expect(h.calls.openManager[0]).toEqual({ isHtml5: true, langType: "ENG", taskNm: "cert_change_password", processCallback: cb });   // popupOptions 가 기본값을 덮는다
    const list = h.window.cwui_conf.defaultConf.KeyStrokeSecurity.KeyStrokeSecurityList;
    expect(list.find((k) => k.KEYPAD_NAME === "TRANS_KEY").USE).toBe("Y");
  });

  test("openManager 는 옵션 생략 시 전체 관리 메뉴(taskNm undefined)·KOR 로 호출하고, 벤더 미로드면 예외를 던진다", async () => {
    const h = loadHarness();
    await expect(h.cert.openManager()).rejects.toThrow("로드되지 않았습니다");
    h.vendor.installReady();
    await h.cert.openManager();
    expect(h.calls.openManager[0]).toEqual({ isHtml5: true, langType: "KOR", taskNm: undefined, processCallback: undefined });
  });

  test("auth 는 벤더 미로드 상태를 예외로 던진다(화면 진입점 handleError 로 수렴)", async () => {
    const h = loadHarness();
    await expect(h.cert.auth("/api/z", () => {})).rejects.toThrow("로드되지 않았습니다");
    expect(h.calls.vendorAuth).toHaveLength(0);
  });
});
