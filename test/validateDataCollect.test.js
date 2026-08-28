/**
 * $c.validate.validateDataCollect 회귀 테스트 (src/gcc/validate.xml).
 *
 * 2026-08-25 수정 3건의 재발 방지:
 * 1. finally 의 return 이 catch 의 return false 를 덮어쓰던 결함 — 예외 시 항상 false 반환
 * 2. JSDoc 에만 있던 확장 규칙(ignoreChar/byte 길이/num/범위/bizNum) 실제 구현 — 조용한 무시 해소
 * 3. 그리드 경로 FORMAT 체인의 phone/email 누락 보강
 *
 * WebSquare 런타임 의존(컴포넌트 탐색·DataList)은 vm 하네스에서 scwin 내부 함수를
 * 직접 대체(monkey-patch)해 격리한다.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const XML_FILE = "src/gcc/validate.xml";

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

const byteLen = (s) => [...String(s)].reduce((n, ch) => n + (ch.charCodeAt(0) > 127 ? 2 : 1), 0);

function loadHarness() {
  const state = { alerts: [], comps: {} };
  const sandbox = {
    console, JSON, Array, String, Object, Date, Boolean, Number, Promise, RegExp,
    scwin: {},
    $c: {
      util: { isEmpty, getComponent: (id) => state.comps[id] },
      str: {
        attachPostposition: (s) => s + "은(는)",
        getByteLength: byteLen,
        isEmail: (s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s),
        isBizID: (s) => /^\d{10}$/.test(s),
        isCorpNum: (s) => /^\d{13}$/.test(String(s).replace(/-/g, "")),
        isPhone: (s) => /^\d{2,3}-\d{3,4}-\d{4}$/.test(s),
        isMobilePhone: (s) => /^01\d-\d{3,4}-\d{4}$/.test(s),
        isSSN: (s) => /^\d{6}-\d{7}$/.test(s),
      },
      win: { alert: (msg, cb, opts) => { state.alerts.push(msg); } },
      num: {},
    },
    $p: { getComponentById: (id) => null },
  };
  vm.createContext(sandbox);
  vm.runInContext(extractCdata(XML_FILE), sandbox, { filename: "validate.xml.cdata.js" });
  return { scwin: sandbox.scwin, state };
}

// 폼 컨테이너 경로용 mock — getChildrenComponent/getDataCollection 을 대체하고 컴포넌트 레지스트리에 등록한다.
function mockFormPath(h, comps) {
  comps.forEach((c) => { h.state.comps[c.comp.getOriginalID()] = c.comp; });
  h.scwin.getChildrenComponent = () => comps.map((c) => c.comp);
  h.scwin.getDataCollection = (valObj) => {
    const found = comps.find((c) => c.comp === valObj);
    return { columnId: found.columnId, columnName: found.columnName };
  };
}

const makeComp = (id, value, plugin = "input") => {
  const comp = {
    focused: false,
    getPluginName: () => plugin,
    getOriginalID: () => id,
    getValue: () => value,
    addClass: () => {},
    removeClass: () => {},
  };
  comp.focus = () => { comp.focused = true; };
  return comp;
};

const container = { getPluginName: () => "group" };
const OPTS = { validateType: "alert", checkType: "multi", focus: false };

describe("validateDataCollect (src/gcc/validate.xml)", () => {
  test("내부 예외 발생 시 false 반환 (finally 가 catch 반환을 덮어쓰지 않음)", async () => {
    const h = loadHarness();
    h.scwin.getChildrenComponent = () => { throw new Error("boom"); };
    const result = await h.scwin.validateDataCollect(container, {
      ...OPTS, fields: { ipbAge: { required: true } },
    });
    expect(result).toBe(false);
  });

  test("확장 규칙 num:i — 실수 입력 시 실패, 정수 입력 시 통과", async () => {
    const h = loadHarness();
    mockFormPath(h, [{ comp: makeComp("ipbAge", "12.5"), columnId: "AGE", columnName: "나이" }]);
    expect(await h.scwin.validateDataCollect(container, {
      ...OPTS, fields: { ipbAge: { num: "i", name: "나이" } },
    })).toBe(false);
    expect(h.state.alerts.join("")).toContain("정수 형식");

    const h2 = loadHarness();
    mockFormPath(h2, [{ comp: makeComp("ipbAge", "42"), columnId: "AGE", columnName: "나이" }]);
    expect(await h2.scwin.validateDataCollect(container, {
      ...OPTS, fields: { ipbAge: { num: "i", name: "나이" } },
    })).toBe(true);
  });

  test("확장 규칙 maxLengthB/ignoreChar/fromNum — 위반 시 실패", async () => {
    const h = loadHarness();
    mockFormPath(h, [
      { comp: makeComp("ipbNm", "한글한글한글"), columnId: "NM", columnName: "이름" },   // 12byte
      { comp: makeComp("ipbCd", "AB#12"), columnId: "CD", columnName: "코드" },
      { comp: makeComp("ipbCnt", "3"), columnId: "CNT", columnName: "수량" },
    ]);
    const result = await h.scwin.validateDataCollect(container, {
      ...OPTS, fields: {
        ipbNm: { maxLengthB: 10, name: "이름" },
        ipbCd: { ignoreChar: "#", name: "코드" },
        ipbCnt: { fromNum: 5, name: "수량" },
      },
    });
    expect(result).toBe(false);
    const joined = h.state.alerts.join("");
    expect(joined).toContain("10byte");
    expect(joined).toContain("입력할 수 없는 문자");
    expect(joined).toContain("5 이상");
  });

  test("확장 규칙은 빈 값을 통과시킨다 (required 소관)", async () => {
    const h = loadHarness();
    mockFormPath(h, [{ comp: makeComp("ipbBiz", ""), columnId: "BIZ", columnName: "사업자번호" }]);
    expect(await h.scwin.validateDataCollect(container, {
      ...OPTS, fields: { ipbBiz: { format: "bizNum", name: "사업자번호" } },
    })).toBe(true);

    const h2 = loadHarness();
    mockFormPath(h2, [{ comp: makeComp("ipbBiz", "123"), columnId: "BIZ", columnName: "사업자번호" }]);
    expect(await h2.scwin.validateDataCollect(container, {
      ...OPTS, fields: { ipbBiz: { format: "bizNum", name: "사업자번호" } },
    })).toBe(false);
    expect(h2.state.alerts.join("")).toContain("사업자등록번호");
  });

  test("checked 규칙 — 미체크(빈 값·'0')는 실패, 체크('1')는 통과", async () => {
    const h = loadHarness();
    mockFormPath(h, [{ comp: makeComp("chk_agree", "0"), columnId: "AGREE", columnName: "약관동의" }]);
    expect(await h.scwin.validateDataCollect(container, {
      ...OPTS, fields: { chk_agree: { checked: true, name: "개인정보 처리방침 동의" } },
    })).toBe(false);
    expect(h.state.alerts.join("")).toContain("동의 해주세요");   // 문구 변경 — 명세 §6

    const h2 = loadHarness();
    mockFormPath(h2, [{ comp: makeComp("chk_agree", "1"), columnId: "AGREE", columnName: "약관동의" }]);
    expect(await h2.scwin.validateDataCollect(container, {
      ...OPTS, fields: { chk_agree: { checked: true, name: "개인정보 처리방침 동의" } },
    })).toBe(true);
  });

  test("emptyIf(notEquals) 규칙 — 국가코드가 대한민국(410)이 아니면 외국국적으로 판단해 입력 금지", async () => {
    const rule = {
      emptyIf: { compID: "sbx_nation", notEquals: "410", message: "외국국적은 우편번호를 입력할 수 없습니다." },
      name: "우편번호",
    };
    const h = loadHarness();
    h.state.comps.sbx_nation = makeComp("sbx_nation", "840"); // 외국(미국)
    mockFormPath(h, [{ comp: makeComp("ipb_zip", "12345"), columnId: "ZIP", columnName: "우편번호" }]);
    expect(await h.scwin.validateDataCollect(container, { ...OPTS, fields: { ipb_zip: rule } })).toBe(false);
    expect(h.state.alerts.join("")).toContain("외국국적은 우편번호");

    const h2 = loadHarness();
    h2.state.comps.sbx_nation = makeComp("sbx_nation", "410"); // 대한민국
    mockFormPath(h2, [{ comp: makeComp("ipb_zip", "12345"), columnId: "ZIP", columnName: "우편번호" }]);
    expect(await h2.scwin.validateDataCollect(container, { ...OPTS, fields: { ipb_zip: rule } })).toBe(true);

    const h3 = loadHarness();
    h3.state.comps.sbx_nation = makeComp("sbx_nation", ""); // 미선택 — 판단 불가(조건 불충족, required 소관)
    mockFormPath(h3, [{ comp: makeComp("ipb_zip", "12345"), columnId: "ZIP", columnName: "우편번호" }]);
    expect(await h3.scwin.validateDataCollect(container, { ...OPTS, fields: { ipb_zip: rule } })).toBe(true);
  });

  test("requiredIf 규칙 — 상호변경내역2 입력 시 내역1 변경일 필수", async () => {
    const h = loadHarness();
    h.state.comps.ipb_chgNm2 = makeComp("ipb_chgNm2", "새상호"); // 내역2 입력됨
    mockFormPath(h, [{ comp: makeComp("cal_chgDt1", ""), columnId: "CHG_DT1", columnName: "변경일1" }]);
    expect(await h.scwin.validateDataCollect(container, {
      ...OPTS, fields: {
        cal_chgDt1: { requiredIf: { compID: "ipb_chgNm2", notEmpty: true, message: "상호변경내역1 변경일을 먼저 입력해주세요." }, name: "변경일1" },
      },
    })).toBe(false);
    expect(h.state.alerts.join("")).toContain("먼저 입력");
  });

  test("duplicateGroup 규칙 — 결산월 중복 시 실패", async () => {
    const h = loadHarness();
    mockFormPath(h, [
      { comp: makeComp("sbx_month1", "03"), columnId: "M1", columnName: "결산월1" },
      { comp: makeComp("sbx_month2", "03"), columnId: "M2", columnName: "결산월2" },
    ]);
    expect(await h.scwin.validateDataCollect(container, {
      ...OPTS, fields: {
        sbx_month1: { duplicateGroup: "settleMonth", name: "결산월1" },
        sbx_month2: { duplicateGroup: "settleMonth", name: "결산월2" },
      },
    })).toBe(false);
    expect(h.state.alerts.join("")).toContain("중복된 값");
  });

  test("format:corpNum / format:urlNoProtocol — 형식 위반 실패", async () => {
    const h = loadHarness();
    mockFormPath(h, [
      { comp: makeComp("ipb_corp", "123"), columnId: "CORP", columnName: "법인등록번호" },
      { comp: makeComp("ipb_url", "http://www.krx.co.kr"), columnId: "URL", columnName: "홈페이지" },
    ]);
    expect(await h.scwin.validateDataCollect(container, {
      ...OPTS, fields: {
        ipb_corp: { format: "corpNum", name: "법인등록번호" },
        ipb_url: { format: "urlNoProtocol", name: "홈페이지" },
      },
    })).toBe(false);
    const joined = h.state.alerts.join("");
    expect(joined).toContain("법인등록번호");
    expect(joined).toContain("프로토콜");
  });

  test("그리드 duplicate 규칙 — 컬럼 값 행 간 중복 실패", async () => {
    const h = loadHarness();
    const rows = [{ MONTH: "03" }, { MONTH: "03" }];
    const grid = {
      getPluginName: () => "gridView",
      getCellData: (r, c) => rows[r].MONTH,
      setCellClass: () => {},
      addClass: () => {},
    };
    h.scwin.getGridViewDataList = async () => ({
      getAllJSON: () => rows,
      getColumnName: () => "결산월",
    });
    expect(await h.scwin.validateDataCollect(grid, {
      ...OPTS, fields: { MONTH: { duplicate: true, name: "결산월" } },
    })).toBe(false);
    expect(h.state.alerts.join("")).toContain("중복된 값");
  });

  // ==== includeUnbound — DataCollection 미바인딩 컴포넌트 처리 ====

  test("미바인딩 컴포넌트는 기본(includeUnbound 미지정) 건너뜀 — 규칙이 있어도 통과", async () => {
    const h = loadHarness();
    const comp = makeComp("ipt_telNo1", "");
    h.state.comps.ipt_telNo1 = comp;
    h.scwin.getChildrenComponent = () => [comp];
    h.scwin.getDataCollection = () => null;   // 미바인딩 — getDataCollection 이 빈 값 반환
    expect(await h.scwin.validateDataCollect(container, {
      ...OPTS, fields: { ipt_telNo1: { required: true, name: "대표전화" } },
    })).toBe(true);   // 하위호환: 조용히 skip (console.info 로만 알림)
  });

  test("includeUnbound:true — 미바인딩 컴포넌트도 컴포넌트 ID 규칙으로 검증(name 미지정 시 ID 표시)", async () => {
    const h = loadHarness();
    const comp = makeComp("ipt_telNo1", "");
    h.state.comps.ipt_telNo1 = comp;
    h.scwin.getChildrenComponent = () => [comp];
    h.scwin.getDataCollection = () => null;
    expect(await h.scwin.validateDataCollect(container, {
      ...OPTS, includeUnbound: true,
      fields: { ipt_telNo1: { required: true, name: "대표전화" } },
    })).toBe(false);
    expect(h.state.alerts.join("")).toContain("대표전화은(는) 입력하세요");

    // name 미지정 — 컴포넌트 ID 로 표시명 폴백
    const h2 = loadHarness();
    const comp2 = makeComp("ipt_x1", "");
    h2.scwin.getChildrenComponent = () => [comp2];
    h2.scwin.getDataCollection = () => null;
    expect(await h2.scwin.validateDataCollect(container, {
      ...OPTS, includeUnbound: true, fields: { ipt_x1: { required: true } },
    })).toBe(false);
    expect(h2.state.alerts.join("")).toContain("ipt_x1은(는)");
  });

  // ==== 명세 v3 신규 기능 (WebSquare6_Validation_Module_Specification-v3.md) ====

  test("§3 required 문구 유형 분기 — 선택형은 '선택하세요', 입력형은 '입력하세요'", async () => {
    const h = loadHarness();
    mockFormPath(h, [
      { comp: makeComp("sbx_month", "", "selectbox"), columnId: "M", columnName: "결산월" },
      { comp: makeComp("ipb_nm", "", "input"), columnId: "NM", columnName: "사원명" },
    ]);
    expect(await h.scwin.validateDataCollect(container, {
      ...OPTS, fields: {
        sbx_month: { required: true, name: "결산월" },
        ipb_nm: { required: true, name: "사원명" },
      },
    })).toBe(false);
    const joined = h.state.alerts.join("");
    expect(joined).toContain("결산월은(는) 선택하세요");
    expect(joined).toContain("사원명은(는) 입력하세요");
  });

  test("§5 required message 재정의 + §1 focus 지정 컴포넌트로 포커스 이동", async () => {
    const h = loadHarness();
    const focusTarget = makeComp("ipt_corpRegNo1", "");
    h.state.comps.ipt_corpRegNo1 = focusTarget;
    mockFormPath(h, [{ comp: makeComp("ipt_corpRegNo", ""), columnId: "CORP", columnName: "법인등록번호" }]);
    expect(await h.scwin.validateDataCollect(container, {
      validateType: "all", checkType: "multi", focus: true,   // MARK 경로에서 즉시 setFocus
      fields: {
        ipt_corpRegNo: { required: true, message: "법인등록번호를 다시 확인하십시오.", focus: "ipt_corpRegNo1", name: "법인등록번호" },
      },
    })).toBe(false);
    expect(h.state.alerts.join("")).toContain("법인등록번호를 다시 확인하십시오.");
    expect(focusTarget.focused).toBe(true);   // 실패 컴포넌트가 아닌 focus 지정 컴포넌트로 이동
  });

  test("§5 matchValue — 미입력/불일치 실패(커스텀 메시지), 일치 통과", async () => {
    const rule = { matchValue: { value: "Y", message: "아이디 중복확인 여부를 확인하십시오." }, name: "중복확인" };
    const h = loadHarness();
    mockFormPath(h, [{ comp: makeComp("ipt_newYn", ""), columnId: "YN", columnName: "중복확인" }]);
    expect(await h.scwin.validateDataCollect(container, { ...OPTS, fields: { ipt_newYn: rule } })).toBe(false);
    expect(h.state.alerts.join("")).toContain("아이디 중복확인 여부");

    const h2 = loadHarness();
    mockFormPath(h2, [{ comp: makeComp("ipt_newYn", "Y"), columnId: "YN", columnName: "중복확인" }]);
    expect(await h2.scwin.validateDataCollect(container, { ...OPTS, fields: { ipt_newYn: rule } })).toBe(true);
  });

  test("§4 compare(NOT_EQUAL) — 대상과 동일 값이면 실패, 다르면 통과", async () => {
    const rule = {
      compare: { compareTarget: "acntClsMm2", compareType: "NOT_EQUAL", message: "동일한 결산월이 존재합니다." },
      name: "결산월1",
    };
    const h = loadHarness();
    h.state.comps.acntClsMm2 = makeComp("acntClsMm2", "03");
    mockFormPath(h, [{ comp: makeComp("acntClsMm1", "03"), columnId: "M1", columnName: "결산월1" }]);
    expect(await h.scwin.validateDataCollect(container, { ...OPTS, fields: { acntClsMm1: rule } })).toBe(false);
    expect(h.state.alerts.join("")).toContain("동일한 결산월");

    const h2 = loadHarness();
    h2.state.comps.acntClsMm2 = makeComp("acntClsMm2", "06");
    mockFormPath(h2, [{ comp: makeComp("acntClsMm1", "03"), columnId: "M1", columnName: "결산월1" }]);
    expect(await h2.scwin.validateDataCollect(container, { ...OPTS, fields: { acntClsMm1: rule } })).toBe(true);
  });

  test("§2 maxLengthB — UTF-8(한글 3byte) 계산 + korEng 옵션 문구", async () => {
    // 한글 4자 = 12byte > 11 — 한글 2byte 계산(8byte)이면 통과했을 케이스로 3byte 계산을 검증
    const h = loadHarness();
    mockFormPath(h, [{ comp: makeComp("ipb_nm", "한글한글"), columnId: "NM", columnName: "이름" }]);
    expect(await h.scwin.validateDataCollect(container, {
      ...OPTS, fields: { ipb_nm: { maxLengthB: 11, name: "이름" } },
    })).toBe(false);
    expect(h.state.alerts.join("")).toContain("11byte");

    // 객체형 + korEng — 한도 18byte, 한글 7자(21byte) 실패 → "한글 6자 영문 18자" 문구
    const h2 = loadHarness();
    mockFormPath(h2, [{ comp: makeComp("ipb_corpNm", "한글한글한글한"), columnId: "CN", columnName: "발행기관명" }]);
    expect(await h2.scwin.validateDataCollect(container, {
      ...OPTS, fields: { ipb_corpNm: { maxLengthB: { value: 18, msgType: "korEng" }, name: "발행기관명" } },
    })).toBe(false);
    expect(h2.state.alerts.join("")).toContain("한글 6자 영문 18자");
  });

  test("composition — 프리셋 engNum: 조합 위반 실패, 충족 통과, 빈 값 통과", async () => {
    const rule = { composition: "engNum", name: "아이디" };
    const h = loadHarness();
    mockFormPath(h, [{ comp: makeComp("ipt_id", "abcdef"), columnId: "ID", columnName: "아이디" }]);
    expect(await h.scwin.validateDataCollect(container, { ...OPTS, fields: { ipt_id: rule } })).toBe(false);
    expect(h.state.alerts.join("")).toContain("아이디은(는) 영문+숫자 조합으로 입력해주세요");

    const h2 = loadHarness();
    mockFormPath(h2, [{ comp: makeComp("ipt_id", "abc123"), columnId: "ID", columnName: "아이디" }]);
    expect(await h2.scwin.validateDataCollect(container, { ...OPTS, fields: { ipt_id: rule } })).toBe(true);

    const h3 = loadHarness();
    mockFormPath(h3, [{ comp: makeComp("ipt_id", ""), columnId: "ID", columnName: "아이디" }]);
    expect(await h3.scwin.validateDataCollect(container, { ...OPTS, fields: { ipt_id: rule } })).toBe(true);   // 빈 값 통과(required 소관)
  });

  test("composition — 객체형 message 재정의·배열형 토큰(special 포함)", async () => {
    const h = loadHarness();
    mockFormPath(h, [{ comp: makeComp("ipt_id", "123456"), columnId: "ID", columnName: "아이디" }]);
    expect(await h.scwin.validateDataCollect(container, {
      ...OPTS, fields: { ipt_id: { composition: { value: "engNum", message: "아이디는 영문+숫자의 조합이어야 합니다." }, name: "아이디" } },
    })).toBe(false);
    expect(h.state.alerts.join("")).toContain("아이디는 영문+숫자의 조합이어야 합니다.");

    const h2 = loadHarness();
    mockFormPath(h2, [{ comp: makeComp("ipt_pwd", "abc123"), columnId: "PWD", columnName: "비밀번호" }]);
    expect(await h2.scwin.validateDataCollect(container, {
      ...OPTS, fields: { ipt_pwd: { composition: ["eng", "num", "special"], name: "비밀번호" } },
    })).toBe(false);   // 특수문자 미포함
    expect(h2.state.alerts.join("")).toContain("영문+숫자+특수문자 조합");

    const h3 = loadHarness();
    mockFormPath(h3, [{ comp: makeComp("ipt_pwd", "abc123!"), columnId: "PWD", columnName: "비밀번호" }]);
    expect(await h3.scwin.validateDataCollect(container, {
      ...OPTS, fields: { ipt_pwd: { composition: ["eng", "num", "special"], name: "비밀번호" } },
    })).toBe(true);
  });

  test("§7 allowChar 조합별 세부 문구 — 숫자만/영문+숫자", async () => {
    const h = loadHarness();
    mockFormPath(h, [
      { comp: makeComp("ipb_cnt", "12a"), columnId: "CNT", columnName: "수량" },
      { comp: makeComp("ipb_cd", "AB-1"), columnId: "CD", columnName: "코드" },
    ]);
    expect(await h.scwin.validateDataCollect(container, {
      ...OPTS, fields: {
        ipb_cnt: { allowChar: "0-9", name: "수량" },
        ipb_cd: { allowChar: "a-zA-Z0-9", name: "코드" },
      },
    })).toBe(false);
    const joined = h.state.alerts.join("");
    expect(joined).toContain("수량은(는) 숫자만 입력이 가능합니다");
    expect(joined).toContain("코드은(는) 영문+숫자만 입력이 가능합니다");
  });

  test("그리드 경로 format:email — 잘못된 이메일 셀 실패 (기존 누락 보강)", async () => {
    const h = loadHarness();
    const grid = {
      getPluginName: () => "gridView",
      getCellData: (r, c) => "bad-email",
      setCellClass: () => {},
      addClass: () => {},
    };
    h.scwin.getGridViewDataList = async () => ({
      getAllJSON: () => [{ EMAIL: "bad-email" }],
      getColumnName: () => "이메일",
    });
    const result = await h.scwin.validateDataCollect(grid, {
      ...OPTS, fields: { EMAIL: { format: "email", name: "이메일" } },
    });
    expect(result).toBe(false);
    expect(h.state.alerts.join("")).toContain("이메일 형식");
  });
});
