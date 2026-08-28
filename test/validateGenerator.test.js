/**
 * validate-generator.html 순수 로직(VG.parse / VG.buildCode) 회귀 테스트.
 *
 * 도구의 <script id="vg-core"> 블록(파싱·코드 생성 — DOM 미사용)을 vm 으로 로드해,
 * 실제 conversion ui-tobe 화면 XML 과 합성 픽스처로 추출·코드 생성·이스케이프를 검증한다.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const HTML = path.join(__dirname, "..", "src", "docs", "validate-generator", "validate-generator.html");
const REAL_XML = path.join(__dirname, "..", "src", "conversion",
  "next-krx-lds-fil-front", "ui-tobe", "dis", "account", "JLDFIL00356.xml");

function loadVG() {
  const html = fs.readFileSync(HTML, "utf8");
  const m = html.match(/<script id="vg-core">([\s\S]*?)<\/script>/);
  if (!m) throw new Error("vg-core script block not found");
  const sandbox = { module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(m[1], sandbox, { filename: "vg-core.js" });
  return sandbox.module.exports;
}

const VG = loadVG();

describe("VG.parse — WebSquare XML 추출", () => {
  test("실화면(JLDFIL00356): dataMap key·dataList 컬럼·gridView 연결 추출", () => {
    const xml = fs.readFileSync(REAL_XML, "utf8");
    const p = VG.parse(xml);

    const dma = p.dataMaps.find((d) => d.id === "dma_Req");
    expect(dma).toBeTruthy();
    expect(dma.keys).toEqual(expect.arrayContaining([{ id: "thisYear", name: "조회연도" }]));

    const dlt = p.dataLists.find((d) => d.id === "dlt_Res");
    expect(dlt).toBeTruthy();
    expect(dlt.cols.length).toBeGreaterThan(0);
    expect(dlt.cols[0]).toHaveProperty("id");
    expect(dlt.cols[0]).toHaveProperty("name");

    // gridView 가 dlt_Res 를 참조 (data: 접두 제거)
    expect(p.gridViews.some((g) => g.dataList === "dlt_Res")).toBe(true);
  });

  test("ref 컴포넌트 추출 + dataMap key name 으로 라벨 해석 + 중복 제거", () => {
    const xml = `
<w2:dataMap id="dma_search"><w2:keyInfo>
  <w2:key id="srchKey" name="검색어"></w2:key>
</w2:keyInfo></w2:dataMap>
<xf:input id="ibx_srch" ref="data:dma_search.srchKey"></xf:input>
<xf:input id="ibx_srch" ref="data:dma_search.srchKey"></xf:input>
<xf:select1 id="sbx_type" ref="data:dma_search.typeCd"></xf:select1>
<xf:input ref="data:dma_search.noId"></xf:input>`;
    const p = VG.parse(xml);
    expect(p.refComps).toHaveLength(2); // 중복 id·id 없는 컴포넌트 제외
    expect(p.refComps[0]).toEqual({ id: "ibx_srch", tag: "xf:input", ref: "dma_search.srchKey", name: "검색어" });
    expect(p.refComps[1].name).toBe(""); // 매칭 key 없으면 빈 라벨
  });

  test("CDATA 스크립트 내부 마크업 유사 문자열은 추출에서 제외", () => {
    const xml = `
<script type="text/javascript"><![CDATA[
  const s = '<w2:dataMap id="dma_fake"><w2:key id="x" name="가짜"/></w2:dataMap>';
]]></script>
<w2:dataMap id="dma_real"><w2:key id="y" name="진짜"></w2:key></w2:dataMap>`;
    const p = VG.parse(xml);
    expect(p.dataMaps.map((d) => d.id)).toEqual(["dma_real"]);
  });
});

describe("VG.buildCode — options 코드 생성", () => {
  const common = { validateType: "alert", checkType: "single", focus: true, editMode: true };

  test("gcc JSDoc 규약 형태로 생성 (문자열/숫자 구분, name 마지막, await 호출 스니펫)", () => {
    const code = VG.buildCode(common, [
      { id: "ipbAge", rules: { required: true, maxLength: "3", allowChar: "0-9", name: "나이" } },
      { id: "ipbName", rules: { required: true, maxLength: "10", name: "사원명" } },
    ], "dma_Req");

    expect(code).toContain('validateType : "alert"');
    expect(code).toContain('checkType : "single"');
    expect(code).not.toContain("focus :");    // 기본값(true)은 미출력
    expect(code).not.toContain("editMode :");
    expect(code).toContain('ipbAge : { required : true, allowChar : "0-9", maxLength : 3, name : "나이" }');
    expect(code).toContain('ipbName : { required : true, maxLength : 10, name : "사원명" }');
    expect(code).toContain("const validateResult = await $c.validate.validateDataCollect(dma_Req, options);");
    expect(code).toContain("if (!validateResult) {");
  });

  test("focus/editMode false 시 출력 + 대상 미지정 시 TODO", () => {
    const code = VG.buildCode({ validateType: "mark", checkType: "multi", focus: false, editMode: false },
      [{ id: "a", rules: { required: true } }], "");
    expect(code).toContain("focus : false");
    expect(code).toContain("editMode : false");
    expect(code).toContain("validateDataCollect(/* TODO: 검증 대상 id */, options)");
  });

  test('식별자가 아닌 필드 키·따옴표 포함 값은 안전하게 인용', () => {
    const code = VG.buildCode(common, [
      { id: "COL-1", rules: { format: "email", name: '별칭"테스트"' } },
    ], "grd_main");
    expect(code).toContain('"COL-1" : { format : "email", name : "별칭\\"테스트\\"" }');
  });

  test("신규 규칙 — checked/duplicate 는 true, emptyIf/requiredIf 는 조건 객체 원문, duplicateGroup 은 문자열", () => {
    const code = VG.buildCode(common, [
      { id: "chkAgree", rules: { checked: true, name: "개인정보 처리방침 동의" } },
      { id: "ipbZip", rules: { emptyIf: '{ compID : "sbx_nation", notEquals : "410" }', name: "우편번호" } },
      { id: "calChgDt1", rules: { requiredIf: '{ compID : "ipb_chgNm2", notEmpty : true }', name: "변경일1" } },
      { id: "sbxMonth1", rules: { duplicateGroup: "settleMonth", name: "결산월1" } },
      { id: "MONTH", rules: { duplicate: true, fixLength: "2" } },
    ], "grp_form");

    expect(code).toContain('chkAgree : { checked : true, name : "개인정보 처리방침 동의" }');
    expect(code).toContain('ipbZip : { emptyIf : { compID : "sbx_nation", notEquals : "410" }, name : "우편번호" }');
    expect(code).toContain('calChgDt1 : { requiredIf : { compID : "ipb_chgNm2", notEmpty : true }, name : "변경일1" }');
    expect(code).toContain('sbxMonth1 : { duplicateGroup : "settleMonth", name : "결산월1" }');
    expect(code).toContain("MONTH : { fixLength : 2, duplicate : true }");
  });

  test("명세 v3 신규 규칙 — compare/matchValue 원문, focus/message 문자열, maxLengthB 객체형", () => {
    const code = VG.buildCode(common, [
      { id: "ipt_newYn", rules: {
          matchValue: '{ value : "Y", message : "아이디 중복확인 여부를 확인하십시오." }',
          focus: "ipt_integUsrId", name: "중복확인" } },
      { id: "ipt_corpNm", rules: { maxLengthB: '{ value : 80, msgType : "korEng" }', name: "발행기관명" } },
      { id: "acntClsMm1", rules: {
          compare: '{ compareTarget : "acntClsMm2", compareType : "NOT_EQUAL" }',
          message: "동일한 결산월이 존재합니다.", name: "결산월1" } },
    ], "grp_form");

    expect(code).toContain('matchValue : { value : "Y", message : "아이디 중복확인 여부를 확인하십시오." }');
    expect(code).toContain('focus : "ipt_integUsrId"');
    expect(code).toContain('maxLengthB : { value : 80, msgType : "korEng" }');   // 객체 리터럴 원문 통과
    expect(code).toContain('compare : { compareTarget : "acntClsMm2", compareType : "NOT_EQUAL" }');
    expect(code).toContain('message : "동일한 결산월이 존재합니다."');
  });
});
