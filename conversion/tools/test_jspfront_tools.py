# -*- coding: utf-8 -*-
"""vendor_postprocess(공급사 r13 관용구 접기) + publish_normalize(퍼블리싱 정규화) 단위 테스트.

실행:
    pytest conversion/tools/test_jspfront_tools.py

픽스처는 jldfil25900 의 꼴을 축약한 것 — 공급사 산출의 특징(init_attrReals/init_conds 범용 루프, cv 래퍼, tx 보일러플레이트,
lifecycle 마커, typeof 가드, [sdd] 콘솔, pgtbox 헤더, 맨 w2tb 표, 버튼 td, gridView, meta_snippet, 간격 표)을 한 벌씩 담는다.
"""
import os
import re
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import vendor_postprocess as vp  # noqa: E402
import publish_normalize as pn  # noqa: E402

HEAD = ('<head meta_screenId="jldfil00002" meta_screenName="jldfil00002" meta_desc="x" meta_author="editor-web generate">\n'
        '  <script src="/_commons/modules.builtin.tobe-pcc/script.js" type="text/javascript"></script>\n'
        '  <xf:model><w2:dataCollection baseNode="map"><w2:dataMap baseNode="map" id="dma_pageContext"><w2:keyInfo/></w2:dataMap>'
        '<w2:dataList baseNode="list" repeatNode="map" id="dlt_list"><w2:columnInfo/></w2:dataList></w2:dataCollection></xf:model>\n'
        '  <w2:publicInfo method="scwin.onpageload"></w2:publicInfo>\n')
SCRIPT = '''
scwin.screenId = "jldfil00002";

///////// 1. 변수 및 선언 영역 /////////

scwin.modifiyDate = "N";
scwin.ex = $c.util.getComponent('ex');


///////// 2. 초기화 영역 /////////

// 속성 EL 실현 — 진입점에서 1회.
/**
 * @method
 * @name scwin.init_attrReals
 * @author Inswave
 * @param
 * @returns
 * @hidden N
*/
scwin.init_attrReals = async function () {
    const attrRealsList = [{ childId: "td_16", attr: "__html", fn: function () { return String(String(((cv) => (cv !== undefined && cv !== null && cv !== "") ? cv : "")(dma_pageContext.get("sysYear")))); } }];
    const root = null;
    let applied = 0;
    for (let i = 0; i < attrRealsList.length; i++) { applied++; }
    return applied;
};

/**
 * @method
 * @name scwin.init_conds
 * @hidden N
*/
scwin.init_conds = async function () {
    const binds = [{ id: "btn_goWrite", fn: function(){ return (((cv) => (cv !== undefined && cv !== null && cv !== "") ? cv : (console.warn("[sdd] 컨텍스트 키 미충전 — " + "listStatCd" + " (as-is EL 부재 = 빈값이라 진행합니다)"), ""))(dma_pageContext.get("listStatCd")) ==='Y'); } },
                   { id: "if_rep", fn: function(){ return (((sv) => (sv !== undefined && sv !== null) ? sv : (() => { throw { bizMessage: "세션 값을 읽지 못했습니다 — " + "session.user.repIdYn", unresolved: "session:" + "repIdYn" }; })())($c.session.getUserInfo("repIdYn")) === 'Y'); } }];
    let applied = 0;
    for (let i = 0; i < binds.length; i++) { applied++; }
    return applied;
};

// as-is 흐름 보존 — 스켈레톤이 대체한 함수가 쓰던 전역 선언
scwin.result = undefined; scwin.modifiyDate = undefined;

scwin.onpageload = async function () {
    try {
        await scwin.init_attrReals();
        await scwin.init_conds();
    } catch (e) {
        $c.exception.handleError(e, { context: 'jldfil00002.onpageload' });
    }
};

///////// 3. 컴포넌트 이벤트 영역 /////////

scwin.btn_goWrite_onclick = async function(e){
    try {
        const ev = e;
        const event = ev;
        const selfVar = (ev && (ev.element || ev.target || ev.srcElement)) || this;
        /* sdd-asis-lifecycle:begin btn_goWrite_onclick — as-is 원문 본문 */
        await scwin.goWrite()
        /* sdd-asis-lifecycle:end */
    } catch (_ex) { await $c.exception.handleError(_ex, { context: 'x' }); }
};

scwin.grd_list_oncellclick = async function (rowIndex) {
    const dl = $c.util.getComponent('dlt_list');
    if (!dl) { console.error('[sdd] 행 동작 대상 목록 없음: dlt_list'); return; }
    if (typeof scwin.goView === 'function') { await scwin.goView(1); } else { console.error('[sdd] 행 동작 미정의: scwin.goView (열 ?)'); await $c.win.alert('이 행 동작을 아직 정하지 못했습니다 — scwin.goView'); } return;
    if (typeof scwin.nope === 'function') { await scwin.nope(1); } else { console.error('[sdd] 행 동작 미정의: scwin.nope (열 ?)'); await $c.win.alert('없음'); } return;
};

///////// 4. 서브미션 콜백 영역 /////////

scwin.tx_fn_goWrite = async function () {
    const sbmOptions = { id: "tx_fn_goWrite", method: "post", action: "/a.do", ref: "dma_req", isProcessMsg: false };
    let res = null;
    try { res = await $c.sbm.executeDynamic(sbmOptions); }
    catch (_e) { await $c.exception.handleError(_e, { context: "jldfil00002.tx_fn_goWrite" }); return null; }
    if (!(res && res.responseJSON && res.responseJSON.success === true)) {
        const m = (res && res.responseJSON && res.responseJSON.message) || $c.sbm.getStatusMessage(res) || ('서버 응답 오류 (' + $c.sbm.getResultCode(res) + ')');
        await $c.win.alert(m);
        return res;
    }

    return res;
};

///////// 5. 일반/업무 함수 영역 /////////

scwin.goWrite = async function () {
    await scwin.fn_modifiyDate();
    const arr = new Array("a", "b");
    const len = new Array(5);
    $("form[name='f']").attr("action", "a.do");
    { const nr = await scwin.tx_fn_goWrite(); if (nr && nr.responseJSON && nr.responseJSON.success === true) { $c.win.moveUrl("/x.xml", {}); } };
    $c.win.popupPrint();
};

scwin.goView = function (a) {
    /* sdd-asis-lifecycle:begin fn_goView */scwin.result = a;
    var i = 1;
    var i = 2;
    for (var k = 0; k < 1; k++) {}
    for (var k = 0; k < 2; k++) {}
    /* sdd-asis-lifecycle:end */
};

scwin.fn_modifiyDate = async function () { return 1; };

scwin.sendForm = function (fm) {
    var fm = (document.F || { elements: [] });
    var kind = "";
    var kind;
    const isurCd = 1;
    const isurCd = 2;
    if (fm) { const isurCd = 3; }
    return kind + isurCd;
};

scwin.td_1_oncellclick = async function (rowIndex) { await scwin.goView(rowIndex); };
scwin.td_1_oncellclick = async function (rowIndex) { await scwin.goView(rowIndex); };
scwin.td_2_oncellclick = async function (rowIndex) { await scwin.goView(rowIndex); };
scwin.td_2_oncellclick = async function (rowIndex) { await scwin.goView(rowIndex + 1); };

scwin.checkForm = function () {
    if ($c.cm.fn_NullChk($c.util.getComponent('ipt_method')) || $c.cm.fn_NullChk($c.util.getComponent(["a", "b"][0]))) { return false; }
    if (!$c.cm.fn_IsNumber($c.util.getComponent('ipt_status'))) { return false; }
    if ($c.cm.fn_IsNotNull($c.util.getComponent('ipt_status')) && $c.cm.fn_CheckEmail($c.util.getComponent('ipt_status').getValue())) { return true; }
    if ($c.cm.fn_ChkZipCd($c.util.getComponent('ipt_status'))) { return true; }
    const z = new Array(0);
    return true;
};

scwin.legacyPcc = function () {
    $c.fil.alert_error("x" + 1);
    const v = $c.fil.getObjectValue($c.util.getComponent('ipt_a')) + $c.fil.getObjectValue(ipt_b);
    $c.fil.setObjectValue($c.util.getComponent('ipt_a'), fn(1, 2));
    $c.fil.fn_setFromToDate(a, b);
    if ($c.lc.fn_isProcess()) { return; }
    $c.frame.CloseFrame();
    return $c.fil.checkMaxLength(v) + $c.fil.showObj('x', true);
};
'''
BODY = '''<body ev:onpageload="scwin.onpageload">
  <xf:group class="sub_contents">
  <xf:group class="pgtbox">
    <w2:textbox class="pgt_tit" label="배당기준일자 신고" id="" style=""/>
    <xf:group class="breadcrumb" id="" style=""><xf:group tagname="ul" id="" style=""><xf:group class="home" tagname="li" id="" style=""><w2:anchor id="" outerDiv="false" style=""><xf:label><![CDATA[Home]]></xf:label></w2:anchor></xf:group></xf:group></xf:group>
  </xf:group>
			<xf:group id="content" tagname="div">
				<xf:group id="dividendDateForm" name="dividendDateForm">
					<xf:input id="ipt_method" tagname="input" style="display:none;" inputType="hidden" name="method" ref="data:dma_req.method" meta_snippetCategory="10_입력폼" meta_snippetName="10_01 InputBox"/>
					<xf:group tagname="table" class="w2tb">
						<xf:group id="tr_14" tagname="tr">
							<xf:group id="td_15" tagname="td" class="subject w2tb_th"/>
							<xf:group id="td_16" tagname="td">안내</xf:group>
						</xf:group>
					</xf:group>
					<xf:group tagname="table" class="w2tb">
						<xf:group id="tr_19" tagname="tr">
							<xf:group id="td_20" tagname="td" style="text-align:right;height:50px">
									<xf:trigger id="btn_goWrite" style="display:inline-block;background:#1393c5" ev:onclick="scwin.btn_goWrite_onclick" meta_snippetCategory="08_버튼" meta_snippetName="8_01 기본버튼">
										<xf:label><![CDATA[작성하기]]></xf:label>
									</xf:trigger>
							</xf:group>
						</xf:group>
					</xf:group>
					<w2:gridView id="grd_list" class="gvw" dataList="data:dlt_list" style="width:100%;" ev:oncellclick="scwin.grd_list_oncellclick" autoFit="allColumn" visibleRowNum="10" visibleRowNumFix="true">
						<w2:header id="grd_list_hd"><w2:row><w2:column id="h_a" inputType="text" displayMode="label" value="A" width="100"/></w2:row></w2:header>
						<w2:gBody id="grd_list_bd"><w2:row><w2:column id="a" inputType="text" displayMode="label" width="100"/></w2:row></w2:gBody>
					</w2:gridView>
					<br id="br_59" tagname="br"/>
					<xf:group tagname="table" class="w2tb">
						<xf:group id="tr_61" tagname="tr">
							<xf:group id="td_62" tagname="td"/>
						</xf:group>
					</xf:group>
				</xf:group>
			</xf:group>
  </xf:group>
</body>
</html>
'''


def _post():
    return vp.apply_regions(HEAD, SCRIPT, BODY)


def test_head_rules():
    head, script, body, log = _post()
    assert "/_commons/" not in head and log["V1_commons"] == 1
    assert 'meta_screenName="배당기준일자 신고"' in head


def test_loops_wrappers_and_flow_globals():
    head, script, body, log = _post()
    assert log["V3_attrReals"] and log["V4_conds"]
    assert "scwin.init_attrReals = function ()" in script and "scwin.init_conds = function ()" in script
    assert "attrRealsList.forEach(" in script and "binds.forEach(" in script and "applied" not in script
    assert 'String((dma_pageContext.get("sysYear") ?? ""))' in script           # cv 래퍼 → ?? "" · String(String()) 접힘
    assert '(dma_pageContext.get("listStatCd") ?? "") ===' in script           # 경고 래퍼 → ?? ""
    assert '$c.session.getUserInfo("repIdYn") === ' in script and "bizMessage" not in script  # 세션 래퍼 → 호출만
    assert "TODO Stage2: 컨텍스트 키 출처 미확인" in script and "listStatCd" in script and "TODO Stage2: 세션 키" in script
    assert "scwin.init_attrReals();" in script and "await scwin.init_attrReals" not in script  # 동기화 + await 제거
    assert "// as-is 흐름 보존" not in script and "scwin.result = null;" in script and script.count("scwin.modifiyDate = ") == 1


def test_handlers_tx_typeof_sdd_and_literals():
    head, script, body, log = _post()
    assert "const ev = e" not in script and "selfVar" not in script and "sdd-asis-lifecycle" not in script
    assert "    scwin.result = a;" in script                                      # 마커가 붙은 줄의 들여쓰기 복원
    assert "let res = null" not in script and "const res = await $c.sbm.executeDynamic(sbmOptions);" in script
    assert "if (res && res.skipped) { return res; }" in script and "catch (_e)" not in script
    assert "await scwin.goView(1); return;" in script and "typeof scwin.goView" not in script   # 정의된 함수 → 호출만
    assert "/* TODO Stage2: 행 동작 미정의: scwin.nope (열 ?) */ await $c.win.alert('없음');" in script
    assert "if (!dl) { /* TODO Stage2: [sdd] 행 동작 대상 목록 없음: dlt_list */ return; }" in script
    assert 'const arr = ["a", "b"];' in script and "new Array(5)" in script
    assert "TODO Stage2(규칙19): 폼 action 지정" in script and "$c.win.print();" in script
    assert "const nr = await scwin.tx_fn_goWrite();\n    if (nr && nr.responseJSON && nr.responseJSON.success === true) {" in script
    assert log["V13_renamed"] == {"fn_modifiyDate": "selectModifiyDate"} and "scwin.fn_modifiyDate" not in script
    assert "var i = 1;\n    i = 2;" in script and script.count("for (var k") == 2             # 같은 함수 var 중복 → 대입, for 머리는 유지
    assert log["V20_hoisted"] == ["ex"] and "scwin.ex = null;" in script
    assert "try {\n        scwin.ex = $c.util.getComponent('ex');\n        scwin.init_attrReals();" in script
    assert " * @description 속성 EL 실현 — 진입점에서 1회." in script             # JSDoc 위 // 설명 → @description


def test_redeclaration_and_duplicate_functions():
    head, script, body, log = _post()
    assert "    fm = (document.F || { elements: [] });" in script           # 매개변수 동명 var → 대입
    assert 'var kind = "";' in script and "var kind;" not in script       # 초기값 없는 중복 → 삭제
    assert "const isurCd = 1;\n    isurCd = 2;\n    if (fm) { const isurCd = 3; }" in script  # 최상위 const 중복만
    assert script.count("scwin.td_1_oncellclick = ") == 1 and log["V22_dup_fn"]["removed"] == ["td_1_oncellclick"]
    assert "scwin.td_2_oncellclick_2 = async function" in script and log["V22_dup_fn"]["renamed"] == ["td_2_oncellclick_2"]
    assert "// TODO Stage2: 공급사 산출의 중복 정의" in script


def test_vendor_pcc_rules():
    head, script, body, log = _post()
    assert '$c.win.alert("x" + 1);' in script
    assert "const v = $c.util.getComponent('ipt_a').getValue() + ipt_b.getValue();" in script
    assert "$c.util.getComponent('ipt_a').setValue(fn(1, 2));" in script
    assert "$c.fil.setFromToDate(a, b);" in script
    assert "$c.lc.fn_isProcess()" in script and "$c.frame.CloseFrame()" in script and "$c.fil.showObj('x', true)" in script
    assert "// TODO Stage2: 공급사 pcc 의존(저장소 pcc/fil 에 없음 · 반입 또는 치환 판단) — $c.fil.showObj, $c.frame.CloseFrame, $c.lc.fn_isProcess" in script
    assert log["V23_vendor_pcc"] == {"alert_error": 1, "getObjectValue": 2, "setObjectValue": 1, "fn_setFromToDate": 1, "todo_left": 3}


def test_cm_helpers():
    head, script, body, log = _post()
    assert log["V21_cm_fn"] == {"NullChk": 2, "IsNumber": 1, "IsNotNull": 1, "CheckEmail": 1, "todo_left": 1}
    assert "scwin.checkRequired($c.util.getComponent('ipt_method')) || scwin.checkRequired($c.util.getComponent([\"a\", \"b\"][0]))" in script
    assert "!scwin.isNumberInput($c.util.getComponent('ipt_status'))" in script
    assert "!$c.util.isEmpty(($c.util.getComponent('ipt_status')).getValue()) && $c.str.isEmail($c.util.getComponent('ipt_status').getValue())" in script
    assert script.count("scwin.checkRequired = async function") == 1 and script.count("scwin.isNumberInput = function") == 1
    assert "// TODO Stage2: $c.cm.fn_* 정의 없음(pcc/fil 미반입 · 치환 방향 미결) — fn_ChkZipCd" in script
    assert "const z = [];" in script
    # 재실행 멱등(헬퍼 중복 삽입 없음)
    _, script2, _, log2 = vp.apply_regions(head, script, body)
    assert script2.count("scwin.checkRequired = async function") == 1 and log2["V21_cm_fn"].get("NullChk") is None


def test_publish_normalize_body():
    head, script, body, log = _post()
    new_body, plog = pn.normalize_body(body, script)
    assert plog["P1_pageframe"] == 1 and '<w2:pageFrame id="pfmContentHeader" src="/cm/xml/contentHeader.xml"' in new_body
    assert "pgtbox" not in new_body and "breadcrumb" not in new_body
    assert plog["P2_unwrapped"] == 2 and 'id="content"' not in new_body and 'name="dividendDateForm"' not in new_body
    assert "meta_snippet" not in new_body
    assert plog["P4_spacers_removed"] == 2 and 'id="br_59"' not in new_body and 'id="td_62"' not in new_body
    assert '<xf:group class="titbox" id="" style="">' in new_body and '<xf:group class="rt" id="" style="">' in new_body
    assert re.search(r'<xf:trigger id="btn_goWrite"[^>]*class="btn_cm"[^>]*type="button"', new_body) and "#1393c5" not in new_body
    assert '<xf:group class="tblbox" id="" style="">' in new_body and 'class="w2tb tbl"' in new_body
    assert '<xf:group class="gvwbox" id="" style="">' in new_body and 'class="gvw row10"' in new_body
    assert 'visibleRowNumFix' not in new_body and 'style="width:100%;"' not in new_body
    assert 'class="w2tb_th"' in new_body and "subject" not in new_body
    assert 'id="td_16"' in new_body and 'id="ipt_method"' in new_body            # 스크립트 참조 id 보존
    assert 'id="tr_14"' not in new_body                                             # 생성 id 는 비움
    # 멱등
    again, plog2 = pn.normalize_body(new_body, script)
    assert again == new_body
