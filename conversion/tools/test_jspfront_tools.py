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
import vendor_stage2 as vs  # noqa: E402
import publish_normalize as pn  # noqa: E402
import screen_tools as st  # noqa: E402

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

scwin.doSubmit = function () {
    if (!$c.lc.fn_isProcess('S')) { return; }
    if( !$c.lc.fn_isProcess(scwin.TR_JOB) )  return;
    return 1;
};

scwin.trs_Save_onfail = function () {
    LastJob = "승인";
    $c.lc.fn_alertMsg('F');
    const s = "LastJob = 'x'";  // 문자열 안은 그대로
};
scwin.trs_Save_onsuccess = async function () {
    $c.lc.fn_alertMsg('S1');
    await scwin.listSync();
};

scwin.logAndTrs = function () {
    let url = "a.do?SCREN_PROCES_TP_CD=" + $c.fil.SCREN_PROCS_TP_CD_01;
    $c.fil.doLogSave("X.gfm", $c.fil.SCREN_PROCS_TP_CD_07);
    scwin.fn_trs($c.fil.TR_JOB_INSERT);
    if (!url) { $c.win.alert($c.lc.NO_EXCEL_DATA); }
    const s = "$c.fil.SCREN_PROCS_TP_CD_01";  // 문자열 안은 그대로
    return url + $c.fil.SCREN_PROCS_TP_CD_01;
};

scwin.init_recvParam = function () { console.warn("[sdd] 전환 파라미터 수신 대상 없음: dma_pageContext — 읽는 자리 0"); }

scwin.init_rowCopy = async function () {
    const rows = [{ childId: "ipt_a", fn: function () { return String(dma_pageContext.get("a")); } }];
    let copied = 0;
    for (let i = 0; i < rows.length; i++) {
        const it = rows[i];
        const c = $c.util.getComponent(it.childId);
        if (!c || typeof c.setValue !== "function") { console.warn("[sdd] 행 복사 대상 부재: " + it.childId); continue; }
        try {
            const v = it.fn();
            if (v !== undefined && v !== null && String(v).trim() !== "") { c.setValue(String(v)); copied++; }
        } catch (e) { await $c.exception.handleError(e, { notify: "none", context: "rowCopy:" + it.childId }); }
    }
    return copied;
};

scwin.checkCurr = async function () {
    if ($c.util.isEmpty($c.util.getComponent('ipt_method').getValue())) {
        await $c.win.alert("발행통화를 입력하십시오.");
        console.error("[sdd] 미실현 동작: set_focus (대상 미해석) — 전환 미완"); /* unresolved-target intent:set_focus — {target}.focus({args}) */
        return false;
    }
    if (ipt_method.getValue() === "" || $c.util.getComponent('btn_goWrite').getValue() === "") {
        await $c.win.alert("둘 다 입력하십시오.");
        console.error("[sdd] 미실현 동작: set_focus (대상 미해석) — 전환 미완"); /* unresolved-target intent:set_focus — {target}.focus({args}) */
        return false;
    }
    await scwin.init_rowCopy();
};

scwin.sendToOpener = function () {
    const v = ((($c.win && $c.win.getOpenerScope ? $c.win.getOpenerScope() : null) || { getComponentById: function (id) { console.error('[sdd] 부모 화면 스코프 없음 — ' + id + ' 를 못 읽는다(단독 진입이거나 부모가 닫혔다)'); return null; }, scwin: {} }).getComponentById("ipt_a") || {}).getValue ? (($c.win && $c.win.getOpenerScope ? $c.win.getOpenerScope() : null) || { getComponentById: function (id) { console.error('[sdd] 부모 화면 스코프 없음 — ' + id + ' 를 못 읽는다(단독 진입이거나 부모가 닫혔다)'); return null; }, scwin: {} }).getComponentById("ipt_a").getValue() : "";
    ((($c.win && $c.win.getOpenerScope ? $c.win.getOpenerScope() : null) || { getComponentById: function (id) { console.error('[sdd] 부모 화면 스코프 없음 — ' + id + ' 를 못 읽는다(단독 진입이거나 부모가 닫혔다)'); return null; }, scwin: {} }).scwin || {}).setCorpInfo(v);
    const p = ((($c.win && $c.win.getOpenerScope) ? $c.win.getOpenerScope() : null) || {});
    const parentfm = (((($c.win && $c.win.getOpenerScope) ? $c.win.getOpenerScope() : null) || {}).scwin || {})["SendForm"] !== undefined ? 1 : 2;
};

scwin.goStatic = function () {
    let url = '/jldfil00033/jldfil00033.xml?method=loadInitPage&ldMktTpCd=' + dma_a.get("x");
    url += "&preKonex=Y";
    $c.win.openPopup((function (__u) { const __s = String(__u == null ? "" : __u); if (!/\\.xml(\\?|#|$)/.test(__s)) { throw { bizMessage: "이 화면의 이동 목적지를 아직 정하지 못했습니다(전환 미완) — " + __s, unresolved: "nav:" + __s }; } return __u; })(url), { id: "p" }, {});
    const doUrl = "/listbloc/blocListing.do?method=popupMonthIssuePlan";
    $c.win.moveUrl((function (__u) { const __s = String(__u == null ? "" : __u); if (!/\\.xml(\\?|#|$)/.test(__s)) { throw { bizMessage: "이 화면의 이동 목적지를 아직 정하지 못했습니다(전환 미완) — " + __s, unresolved: "nav:" + __s }; } return __u; })(doUrl), {});
};

scwin.openGuides = function () {
    $c.frame.CreateDialogFrame('JLDFIL55330', "/jldfil55330/jldfil55330.xml", "종목명 입력안내", { width: 750, height: 300 }, {});
    $c.frame.CreateDialogFrame("", (function (__u) { let __s = String(__u == null ? "" : __u); if (!/\\.xml(\\?|#|$)/.test(__s)) { throw { bizMessage: "x — " + __s, unresolved: "nav:" + __s }; } return __u; })(url), "서식조회팝업", { width: 1000, height: 800 }, {});
    $c.fil.doLogSave("X.gfm", $c.fil.SCREN_PROCS_TP_CD_05);
    $c.frame.Provider("/top").CreateDialogFrame("NEW_LISTING", url, winTitle, { width: 1400, height: 835 }, {});
    $c.frame.CreateDialogFrame("STOCK_LISTING", (function (__u) { return __u; })(url), nm + " 관리", 220, 0, 1020, hight, "window");
    scwin.fr_MktId = $c.lc.fn_getMktId();
    const nm = $c.lc.fn_getSecuGrpNm(scwin.fr_SecuGrpId) + "x";
    $c.fil.FillGridHeaderTotalCnt(rowcount, scwin.panel_page);
    const pt = $c.fil.fn_getModalCenterPos(frame, wth, hgt);
};

scwin.periodAndChecks = function () {
    $c.cm.fn_ClickPeriod('document.searchForm',3);
    $c.cm.fn_SetPeriod('document.searchForm','20260101','20260131');
    if (!$c.cm.fn_CheckDateGn($c.util.getComponent('ipt_y'), $c.util.getComponent('ipt_m'), $c.util.getComponent('ipt_d'), true)) { return false; }
    $c.cm.fn_CheckByte($c.util.getComponent("txa_contn"), '100', 'byteCnt');
    if (v !== '' && !$c.cm.isMinusNum(v)) { return false; }
    if (!$c.cm.fn_ChkNoneNum(usrIdObj) || !$c.cm.fn_ChkAlphaNum(usrIdObj, 6, 20)) { return false; }
    if (!$c.cm.fn_IsChecked($c.util.getComponent('rd_tp'))) { return false; }
    if ($c.cm.fn_IsNull($c.util.getComponent('ipt_isurCd'), scwin.isurCdTitle)) { return false; }
    x.setValue($c.cm.fn_IgnoreSpaces(x.getValue()));
    if ($c.cm.fn_ChkContactpnt(y.getValue()) === false) { return false; }
    _obj.setValue($c.cm.fn_CalcContn(contnValue, standardByte));
    const fileSize = $c.cm.fn_getFileSize(fileFullNm);
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
    assert '$c.session.getUserInfo("repIdYn") === ' in script and "세션 값을 읽지 못했습니다" not in script  # 세션 래퍼 → 호출만
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
    assert "form[name='f']" not in script and "폼 action" not in script and "$c.win.print();" in script  # 사문 문장 삭제(A-5)
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
    # 마지막 정의가 이긴다 — 앞의 것이 _1 로, 뒤의 것이 원이름(A-6)
    assert "scwin.td_2_oncellclick_1 = async function (rowIndex) { await scwin.goView(rowIndex); };" in script
    # 살아 있는 정의는 V37(V22 뒤) 이 try/catch 로 감싼다; 죽은 `_1` 본문은 그대로
    assert "scwin.td_2_oncellclick = async function (rowIndex) {\n    try {\n        await scwin.goView(rowIndex + 1);\n    } catch (ex) {" in script
    assert log["V22_dup_fn"]["renamed"] == ["td_2_oncellclick_1"] and "뒤 정의에 덮여 호출되지 않던 본문" in script


def test_review_regressions_2026_10_02():
    """리뷰(jldfil59400·25910)에서 잡힌 파이프라인 회귀 4건의 재발 방지."""
    import convert as cv
    head, script, body, log = _post()
    # 바인드별 격리: 조건식 throw 가 onpageload 를 끊지 않는다
    assert 'try { ok = !!b.fn(); } catch (e) { $c.exception.handleError(e, { notify: "none", context: "conds:" + b.id }); return; }' in script
    assert 'try { v = a.fn(); } catch (e) { $c.exception.handleError(e, { notify: "none", context: "attrReal:" + a.childId }); return; }' in script
    # 호이스팅 전역은 init_recvParam 뒤
    s2 = SCRIPT.replace("        await scwin.init_attrReals();", "        scwin.init_recvParam();\n        await scwin.init_attrReals();")
    _, out, _, _ = vp.apply_regions(HEAD, s2, BODY)
    assert "scwin.init_recvParam();\n        scwin.ex = $c.util.getComponent('ex');\n" in out
    # tx 변형(실패 블록 뒤 후처리) — if 안 return 유지, 후처리 보존
    tx = ('scwin.tx_v = async function () {\n    const sbmOptions = { id: "x" };\n    let res = null;\n'
          '    try { res = await $c.sbm.executeDynamic(sbmOptions); }\n'
          '    catch (_e) { await $c.exception.handleError(_e, { context: "a.tx_v" }); return null; }\n'
          '    if (!(res && res.responseJSON && res.responseJSON.success === true)) {\n'
          '        const m = "x";\n        await $c.win.alert(m);\n        return res;\n    }\n\n'
          '    const tot = res.responseJSON.total;\n    return res;\n};\n')
    out2, n = vp.simplify_tx(tx)
    assert n == 1 and "if (res && res.skipped) { return res; }" in out2
    assert "        await $c.win.alert(m);\n        return res;\n    }\n\n    const tot = res.responseJSON.total;\n    return res;\n" in out2
    # 규칙 5a: 파이프라인은 nullish 비교를 보존
    src = HEAD + '\t<script lazy="false" type="text/javascript"><![CDATA[\nscwin.f = function (a) { if (a != null && a.b == null) { return a == 1; } return false; };\n]]></script>\n</head>\n' + BODY
    conv, rep = cv.convert(src, "jldfil00002.xml", keep_nullish=True)
    assert "a != null && a.b == null" in conv and "a === 1" in conv and rep["rule5a_nullish_kept"] == 2


def test_is_process_to_confirm_job():
    import screen_convention as sc
    head, script, body, log = _post()
    assert log["V24_isProcess"] == 3  # doSubmit 2 + legacyPcc 1
    assert "if (!$c.fil.confirmJob('S')) { return; }" in script and "!$c.fil.confirmJob(scwin.TR_JOB) )" in script
    assert "scwin.confirmJob = " not in script  # pcc/fil 반입 — 로컬 헬퍼 없음
    # 실호출은 0 (헬퍼 JSDoc 의 "fn_isProcess" 언급만 남는다) · legacyPcc 의 TODO 도 더 이상 나열하지 않는다
    assert "$c.lc.fn_isProcess" not in script
    # 컨벤션 단계가 await 를 붙이고 호출 함수를 async 로 만든다
    import screen_tools as st
    s2, _ = sc.propagate_await(script, st.common_inventory("fil")[1])  # $c.fil.confirmJob 은 pcc 재고에서 async
    assert "if (!await $c.fil.confirmJob('S')) { return; }" in s2 and "scwin.doSubmit = async function" in s2


def test_alert_msg_to_alert_job_result():
    import screen_convention as sc
    head, script, body, log = _post()
    assert log["V25_alertMsg"] == {"calls": 2, "lastJob_refs": 1}
    assert '$c.fil.setLastJob("승인");' in script and "const s = \"LastJob = 'x'\";" in script
    assert "$c.fil.alertJobResult('F');" in script and "$c.fil.alertJobResult('S1');" in script and "$c.lc.fn_alertMsg" not in script
    assert "scwin.alertJobResult = " not in script and "scwin.lastJob" not in script  # pcc/fil 반입
    import screen_tools as st
    s2, _ = sc.propagate_await(script, st.common_inventory("fil")[1])
    assert "scwin.trs_Save_onfail = async function" in s2 and "await $c.fil.alertJobResult('F');" in s2


def test_vendor_consts_inlined():
    head, script, body, log = _post()
    # doLogSave 줄은 V28 이 먼저 주석으로 접으므로 그 안의 SCREN_PROCS_TP_CD_07 은 세지 않는다(코드 영역만). 반입 뒤엔 $c.fil.<상수>(화면 선언 없음)
    assert log["V26_consts"] == {"refs": 1}  # $c.lc.NO_EXCEL_DATA 만 바꾼다($c.fil.<상수> 2곳은 이미 pcc)
    assert "$c.win.alert($c.fil.NO_EXCEL_DATA);" in script and "scwin.NO_EXCEL_DATA" not in script
    assert '+ $c.fil.SCREN_PROCS_TP_CD_01;' in script and 'scwin.fn_trs($c.fil.TR_JOB_INSERT);' in script
    assert 'const s = "$c.fil.SCREN_PROCS_TP_CD_01";' in script
    sec1 = script.split("///////// 1. ")[1].split("///////// 2. ")[0]
    assert "SCREN_PROCS_TP_CD" not in sec1 and "TR_JOB_INSERT = " not in sec1
    # V23 의 TODO 는 상수·보류된 doLogSave 를 나열하지 않는다
    assert "— $c.fil.doLogSave" not in script
    _, s2, _, log2 = vp.apply_regions(head, script, body)
    assert log2["V26_consts"] == {} and s2 == script


def test_stage2_c_focus_and_rowcopy():
    head, script, body, log = _post()
    assert log["V34_focus"] == 1  # 후보 1개인 자리만
    assert '$c.util.getComponent("ipt_method").focus();  // 포커스 대상' in script
    assert script.count("미실현 동작: set_focus") == 1  # 후보 2개(ipt_method·ipt_status)는 TODO 유지
    assert log["V35_rowcopy"] == 1
    assert "scwin.init_rowCopy = function () {" in script and "rows.forEach(function (it) {" in script
    assert "행 복사 대상 부재" not in script and "let copied" not in script
    assert "    scwin.init_rowCopy();" in script and "await scwin.init_rowCopy" not in script


def test_stage2_c_opener():
    head, script, body, log = _post()
    assert log["V33_opener"] == {"scope": 5, "scwin": 2, "comp": 1}
    assert "부모 화면 스코프 없음" not in script and "getOpenerScope ?" not in script
    assert 'const v = scwin.openerComp("ipt_a").getValue ? scwin.opener().getComponentById("ipt_a").getValue() : "";' in script
    assert "\n    scwin.openerScwin().setCorpInfo(v);" in script and "const p = scwin.opener();" in script
    assert 'const parentfm = scwin.openerScwin()["SendForm"] !== undefined ? 1 : 2;' in script
    # 괄호 짝 보존(c1 배치에서 구문 오류 114화면을 낸 결함의 재발 방지)
    fn = script[script.index("scwin.sendToOpener = "):script.index("scwin.goStatic = ")]
    assert fn.count("(") == fn.count(")")
    for h in ("opener", "openerScwin", "openerComp"):
        assert script.count("scwin.%s = function" % h) == 1, h


def test_stage2_b_rules():
    head, script, body, log = _post()
    # V32 내부 .xml 리터럴로 정해지는 이동 목적지는 래퍼를 걷는다, .do 는 그대로(회신 A-15)
    assert log["V32_static_nav"] == 1
    assert '$c.win.openPopup(url, { id: "p" }, {});' in script
    assert 'unresolved: "nav:" + __s }; } return __u; })(doUrl)' in script
    # V5 세션 키 — 계약에 있는 키(repIdYn 은 없음)만 TODO
    assert "// TODO Stage2: 세션 키 실환경 확인(회신 11항 · user-info 계약에 없는 키) — session.user.repIdYn" in script
    s2 = SCRIPT.replace('"session.user.repIdYn"', '"session.user.empNo"').replace('getUserInfo("repIdYn")', 'getUserInfo("empNo")')
    _, out, _, _ = vp.apply_regions(HEAD, s2, BODY)
    assert "세션 키 실환경 확인" not in out and '$c.session.getUserInfo("empNo") === ' in out


def test_stage2_a_rules():
    head, script, body, log = _post()
    # V27 CreateDialogFrame 5인자 → openPopup(id 는 첫 인자, 없으면 url 파일명; IIFE url 은 그대로)
    assert log["V27_dialog"] == 4 and "CreateDialogFrame" not in script
    assert ('$c.win.openPopup((function (__u) { return __u; })(url), { id: "STOCK_LISTING", type: "browserPopup", title: nm + " 관리", width: "1020px", '
            'height: hight, callbackFn: "scwin.popupCallback" });') in script and script.count("scwin.popupCallback = function") == 1
    assert '$c.win.openPopup(url, { id: "NEW_LISTING", type: "pageFramePopup", title: winTitle, width: "1400px", height: "835px" }, {});' in script
    assert ('$c.win.openPopup("/jldfil55330/jldfil55330.xml", { id: "JLDFIL55330", type: "pageFramePopup", title: "종목명 입력안내", '
            'width: "750px", height: "300px" }, {});') in script
    assert '})(url), { id: "popup", type: "pageFramePopup", title: "서식조회팝업", width: "1000px", height: "800px" }, {});' in script
    # V28 doLogSave 보류 주석(상수는 V26 이 먼저 바꾸지 않는다 — stage2 가 앞서므로 원문 그대로 주석 안에)
    assert log["V28_logsave"] == 2 and "doLogSave" not in st.code_only(script)  # 사용자 결정(2026-10-06): 사용하지 않는 코드 — 문장 삭제
    # V29 pcc 함수 → 로컬 헬퍼
    h = log["V29_30_helpers"]
    assert "scwin.fr_MktId = scwin.getMktId();" in script and "$c.fil.getSecuGrpNm(scwin.fr_SecuGrpId)" in script
    assert "$c.fil.showTotalCount(rowcount, scwin.panel_page);" in script and "$c.fil.getModalCenterPos(frame, wth, hgt)" in script
    assert script.count("scwin.getMktId = function") == 1  # 화면 스코프(as-is 전역)라 로컬
    for hname in ("getSecuGrpNm", "showTotalCount", "getModalCenterPos", "showObj"):
        assert ("scwin.%s = function" % hname) not in script, hname  # pcc/fil 반입
    # V30 $c.cm.* → 로컬 헬퍼/인라인
    assert "scwin.setSearchPeriod(3);" in script and "scwin.setPeriodDates('20260101', '20260131');" in script
    assert "!$c.cm.fn_CheckDateGn" not in script and "$c.fil.checkDateParts($c.util.getComponent('ipt_y'), $c.util.getComponent('ipt_m'), $c.util.getComponent('ipt_d'), true)" in script
    assert '$c.fil.checkByteLimit($c.util.getComponent("txa_contn"), \'100\', \'byteCnt\');' in script
    assert "!$c.fil.isMinusNumber(v)" in script and "!$c.fil.checkNotOnlyNumber(usrIdObj) || !$c.fil.checkAlphaNum(usrIdObj, 6, 20)" in script
    assert "!$c.fil.isGroupChecked($c.util.getComponent('rd_tp'))" in script
    assert "$c.fil.checkRequired($c.util.getComponent('ipt_isurCd'), scwin.isurCdTitle)" in script
    assert 'x.setValue(String(x.getValue()).replace(/\\s/g, ""));' in script and "if (/^[0-9-]*$/.test(y.getValue()) === false)" in script
    assert "_obj.setValue($c.fil.truncateByBytes(contnValue, standardByte));" in script
    assert "$c.cm.fn_getFileSize(fileFullNm)" in script and "— fn_getFileSize" in script  # 못 옮기는 것은 TODO 로 남는다
    for hname in ("setSearchPeriod", "setPeriodDates"):
        assert script.count("scwin.%s = " % hname) == 1, hname  # 화면 스코프(cal_sdate/edate·search) 라 로컬
    for hname in ("checkDateParts", "isZipCodeInput", "checkByteLimit", "getByteLength2", "truncateByBytes", "isMinusNumber", "checkNotOnlyNumber", "checkAlphaNum", "isGroupChecked", "getFieldName"):
        assert ("scwin.%s = " % hname) not in script, hname  # pcc/fil 반입
    assert h["fn_ClickPeriod"] == 1 and h["fn_IgnoreSpaces"] == 1 and h["fn_ChkZipCd"] == 1
    # V31 공급사 스텁 → dma_pageContext 표준 수신
    assert log["V31_pagecontext"] == 1
    assert head.count('id="dma_pageContext"') == 1  # 픽스처 head 에 이미 있으면 더하지 않는다
    assert "scwin.init_recvParam = function () { dma_pageContext.setJSON($c.data.getParameter() ?? {}); }\n" in script  # `;` 는 뒤 단계가 붙인다
    assert "전환 파라미터 수신 대상 없음" not in script
    # head 에 없으면 dataCollection 첫머리에 넣는다
    h3, s3, n3 = vs.ensure_page_context(HEAD.replace('<w2:dataMap baseNode="map" id="dma_pageContext"><w2:keyInfo/></w2:dataMap>', ""), SCRIPT)
    assert n3 == 1 and h3.index('id="dma_pageContext"') < h3.index('id="dlt_list"') and "<w2:keyInfo/>" in h3
    # 멱등
    h2, s2, b2, log2 = vp.apply_regions(head, script, body)
    assert s2.count("scwin.checkDateParts = ") == 0 and "V27_dialog" not in log2 and "V31_pagecontext" not in log2 and h2 == head


def test_vendor_pcc_rules():
    head, script, body, log = _post()
    assert '$c.win.alert("x" + 1);' in script
    assert "const v = $c.util.getComponent('ipt_a').getValue() + ipt_b.getValue();" in script
    assert "$c.util.getComponent('ipt_a').setValue(fn(1, 2));" in script
    assert "$c.fil.setFromToDate(a, b);" in script
    assert "$c.frame.CloseFrame()" in script and "$c.fil.showObj('x', true)" in script and "scwin.showObj" not in script  # 반입된 pcc 함수
    assert "// TODO Stage2: 공급사 pcc 의존(저장소 pcc/fil 에 없음 · 반입 또는 치환 판단) — $c.frame.CloseFrame\n" in script
    assert log["V23_vendor_pcc"] == {"alert_error": 1, "getObjectValue": 2, "setObjectValue": 1, "fn_setFromToDate": 1, "todo_left": 1}  # CloseFrame 만(doLogSave 는 보류 주석)


def test_cm_helpers():
    head, script, body, log = _post()
    assert log["V21_cm_fn"] == {"NullChk": 2, "IsNumber": 1, "IsNotNull": 1, "CheckEmail": 1, "todo_left": 1}  # fn_getFileSize 만 남는다
    assert "$c.fil.checkRequired($c.util.getComponent('ipt_method')) || $c.fil.checkRequired($c.util.getComponent([\"a\", \"b\"][0]))" in script
    assert "!$c.fil.isNumberInput($c.util.getComponent('ipt_status'))" in script
    assert "!$c.util.isEmpty(($c.util.getComponent('ipt_status')).getValue()) && $c.str.isEmail($c.util.getComponent('ipt_status').getValue())" in script
    assert "scwin.checkRequired = " not in script and "scwin.isNumberInput = " not in script  # pcc/fil 반입
    assert "if ($c.fil.isZipCodeInput($c.util.getComponent('ipt_status'))) { return true; }" in script and "$c.cm.fn_ChkZipCd" not in script
    assert "const z = [];" in script
    # 재실행 멱등(헬퍼 중복 삽입 없음)
    _, script2, _, log2 = vp.apply_regions(head, script, body)
    assert script2 == script and log2["V21_cm_fn"].get("NullChk") is None


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


# ---------------------------------------------------------------------------------------------------------------------
# publish_merge — 퍼블리싱 XML(목업 id) ← 공급사 전환본 정합
# ---------------------------------------------------------------------------------------------------------------------
import publish_merge as pm  # noqa: E402

PUB_BODY = '''<body><xf:group class="sub_contents" id="">
<xf:group class="titbox" id=""><xf:group class="rt" id="">
<xf:trigger class="btn_cm" id="" type="button"><xf:label><![CDATA[조회]]></xf:label></xf:trigger>
<xf:trigger class="btn_cm" id="" type="button"><xf:label><![CDATA[도움말]]></xf:label></xf:trigger>
<xf:select1 id="" appearance="minimal"><xf:choices><xf:item><xf:label><![CDATA[new row]]></xf:label><xf:value><![CDATA[]]></xf:value></xf:item></xf:choices></xf:select1>
</xf:group></xf:group>
<xf:group id="" tagname="table" class="w2tbl"><xf:group id="" tagname="tbody"><xf:group id="" tagname="tr">
<xf:group id="" tagname="th"><w2:textbox id="" label="■ 기간"/><w2:textbox id="" label="필수"/></xf:group>
<xf:group id="" tagname="td"><w2:inputCalendar id="" /><w2:inputCalendar id="" /></xf:group>
<xf:group id="" tagname="th"><w2:textbox id="" label="이 름"/></xf:group>
<xf:group id="" tagname="td"><xf:input id="" /></xf:group>
</xf:group></xf:group></xf:group>
<w2:gridView id="gridView1" class="gvw"><w2:caption id="caption2" value="this is a grid caption."/>
<w2:header id="header1"><w2:row id="row3"><w2:column id="column1" value="번호"/><w2:column id="column2" value="법인명"/><w2:column id="column8" value="비고"/></w2:row></w2:header>
<w2:gBody id="gBody1"><w2:row id="row4"><w2:column id="column3" value=""/><w2:column id="column4" value=""/><w2:column id="column9" value=""/></w2:row></w2:gBody></w2:gridView>
</xf:group></body>'''
VEN_BODY = '''<body>
<xf:trigger id="img_12" class="btn_cm search icon" ev:onclick="scwin.img_12_onclick" type="button"/>
<xf:trigger id="img_13" class="btn_cm guide icon" ev:onclick="scwin.img_13_onclick" type="button"/>
<xf:select1 id="slc_pageSize" ev:onchange="scwin.slc_pageSize_onchange" ref="data:dma_req.pageSize"><xf:choices><xf:item><xf:label><![CDATA[15개]]></xf:label><xf:value><![CDATA[15]]></xf:value></xf:item></xf:choices></xf:select1>
<xf:group id="" tagname="table"><xf:group id="" tagname="tbody"><xf:group id="" tagname="tr">
<xf:group id="" tagname="th"><w2:textbox id="" label="기간"/></xf:group>
<xf:group id="" tagname="td"><w2:inputCalendar id="cal_from" ref="data:dma_req.from"/><w2:inputCalendar id="cal_to" ref="data:dma_req.to"/></xf:group>
<xf:group id="" tagname="th"><w2:textbox id="" label="이름"/></xf:group>
<xf:group id="" tagname="td"><xf:input id="ipt_name" ref="data:dma_req.name" maxLength="20"/></xf:group>
</xf:group></xf:group></xf:group>
<w2:gridView id="grd_list" dataList="data:dlt_list" ev:oncellclick="scwin.grd_list_oncellclick"><w2:header id="grd_list_hd"><w2:row id="row1"><w2:column id="column8" value="법인명"/><w2:column id="h_etc" value="기타"/></w2:row></w2:header>
<w2:gBody id="grd_list_bd"><w2:row id="row2"><w2:column id="corpNm" value="" inputType="text"/><w2:column id="etc" value=""/></w2:row></w2:gBody></w2:gridView>
</body>'''


def test_publish_merge_labels_and_keys():
    assert pm.norm_label("■ 제목") == "제목" and pm.norm_label("이 름") == "이름" and pm.norm_label("회사명 *") == "회사명"
    _, pb = pm.parse_body(PUB_BODY)
    _, vb = pm.parse_body(VEN_BODY)
    pk = [k for k, _ in pm.collect(pb)]
    vk = [k for k, _ in pm.collect(vb)]
    assert ("trigger", "조회") in pk and ("trigger", "icon:search") in vk and ("trigger", "icon:guide") in vk
    assert ("select", "") in pk and ("select", "") in vk  # 표 밖 컨트롤은 라벨 ''
    assert pk.count(("inputCalendar", "기간")) == 2 and vk.count(("inputCalendar", "기간")) == 2  # '■ 기간'+'필수' → '기간'
    assert ("input", "이름") in pk and ("input", "이름") in vk
    # 그리드 키는 번호 컬럼을 뺀 헤더 집합
    assert ("grid", ("법인명", "비고")) in pk and ("grid", ("기타", "법인명")) in vk


def test_publish_merge_grid_unique_ids_and_select_choices():
    _, pb = pm.parse_body(PUB_BODY)
    _, vb = pm.parse_body(VEN_BODY)
    pg = pb.find(".//" + pm.T(pm.W2, "gridView")); vg = vb.find(".//" + pm.T(pm.W2, "gridView"))
    log = []
    pm.merge_grid(pg, vg, log)
    from lxml import etree
    out = etree.tostring(pg, encoding="unicode")
    ids = re.findall(r'\sid="([^"]*)"', out)
    assert pg.get("id") == "grd_list" and pg.get("dataList") == "data:dlt_list" and pg.get("{%s}oncellclick" % pm.EV) == "scwin.grd_list_oncellclick"
    assert ids.count("column8") == 1 and "corpNm" in ids              # 헤더는 value 로(공급사 id column8 복사), 본문은 같은 자리로
    assert "column8_pub" in ids                                       # 대응 없는 퍼블리싱 column8 은 공급사 id 와 안 겹치게(WS120)
    assert "grd_list_hd" in ids and "row1" in ids and "row2" in ids   # 헤더/본문/행 id 는 공급사 것
    assert pg.find(pm.T(pm.W2, "caption")).get("value") == "" and pg.find(pm.T(pm.W2, "caption")).get("id") == ""  # 목업 캡션은 비움
    assert any("'비고'" in l for l in log)
    nonempty = [i for i in ids if i]
    assert len(nonempty) == len(set(nonempty))
    # select 는 목업 choices 를 버리고 공급사 choices 를 가져온다
    ps = pb.find(".//" + pm.T(pm.XF, "select1")); vs = vb.find(".//" + pm.T(pm.XF, "select1"))
    pm.copy_attrs(ps, vs)
    s = etree.tostring(ps, encoding="unicode")
    assert "new row" not in s and "15개" in s and ps.get("id") == "slc_pageSize" and ps.get("ref") == "data:dma_req.pageSize"
    assert ps.get("appearance") == "minimal"  # 퍼블리싱 모양 속성은 그대로


def test_p1_header_standard():
    """헤더 표준(2026-10-06): 본화면 sub_contents 는 pageFrame 첫 자식 보장, 팝업 pop_contents 는 pageFrame 없음."""
    main_no = '<body><xf:group class="sub_contents" id=""><xf:group class="step_list" id=""/></xf:group></body>'
    out, log = pn.normalize_body(main_no, "")
    assert out.index('<w2:pageFrame id="pfmContentHeader"') < out.index('class="step_list"') and log.get("P1_pageframe_added") == 1
    out2, log2 = pn.normalize_body(out, "")
    assert out2 == out and not log2.get("P1_pageframe_added")  # 멱등
    pop_pf = ('<body><xf:group class="pop_contents" id=""><w2:pageFrame id="pfmContentHeader" src="/cm/xml/contentHeader.xml" style=""/>'
              '<xf:group class="tblbox" id=""/></xf:group></body>')
    out3, log3 = pn.normalize_body(pop_pf, "")
    assert "pfmContentHeader" not in out3 and log3.get("P1_pageframe_removed") == 1
    pgt = ('<body><xf:group class="sub_contents" id=""><xf:group class="pgtbox" id=""><w2:textbox class="pgt_tit" id="" label="제목"/>'
           '<xf:group class="breadcrumb" id=""/></xf:group><xf:group class="tblbox" id=""/></xf:group></body>')
    out4, _ = pn.normalize_body(pgt, "")
    assert out4.count("pfmContentHeader") == 1 and "pgtbox" not in out4


def test_publish_merge_match_canon_and_grid_similarity():
    """뜻 토큰(조회↔icon:search)·그리드 닮음(번호 컬럼 차이)·같은 키 개수 다름(앞에서부터) 으로 잇는다."""
    pub = ('<body><xf:group class="sub_contents" id=""><xf:group class="titbox" id=""><xf:group class="rt" id="">'
           '<xf:trigger id="" type="button"><xf:label><![CDATA[조회]]></xf:label></xf:trigger></xf:group></xf:group>'
           '<xf:group id="" tagname="table"><xf:group id="" tagname="tbody"><xf:group id="" tagname="tr">'
           '<xf:group id="" tagname="th"><w2:textbox id="" label="유선전화번호"/></xf:group>'
           '<xf:group id="" tagname="td"><xf:input id=""/><xf:input id=""/><xf:input id=""/></xf:group></xf:group></xf:group></xf:group>'
           '<w2:gridView id="gridView1"><w2:header id="h1"><w2:row id="r1"><w2:column id="c1" value="번호"/><w2:column id="c2" value="법인명"/><w2:column id="c3" value="비고"/></w2:row></w2:header>'
           '<w2:gBody id="b1"><w2:row id="r2"><w2:column id="c4" value=""/><w2:column id="c5" value=""/><w2:column id="c6" value=""/></w2:row></w2:gBody></w2:gridView>'
           '<w2:gridView id="gridView2"><w2:header id="h2"><w2:row id="r3"><w2:column id="c7" value="파일명"/><w2:column id="c8" value="크기"/></w2:row></w2:header>'
           '<w2:gBody id="b2"><w2:row id="r4"><w2:column id="c9" value=""/><w2:column id="c10" value=""/></w2:row></w2:gBody></w2:gridView>'
           '</xf:group></body>')
    ven = ('<body><xf:trigger id="img_1" class="btn_cm search icon" ev:onclick="scwin.img_1_onclick" type="button"/>'
           '<xf:group id="" tagname="table"><xf:group id="" tagname="tbody"><xf:group id="" tagname="tr">'
           '<xf:group id="" tagname="th"><w2:textbox id="" label="유선전화번호"/></xf:group>'
           '<xf:group id="" tagname="td"><xf:input id="ipt_tel" ref="data:dma.tel"/></xf:group></xf:group></xf:group></xf:group>'
           '<w2:gridView id="grd_list" dataList="data:dlt_list"><w2:header id="grd_list_hd"><w2:row id="row1"><w2:column id="h_corpNm" value="법인명"/><w2:column id="h_rmk" value="비고"/><w2:column id="h_etc" value="기타"/></w2:row></w2:header>'
           '<w2:gBody id="grd_list_bd"><w2:row id="row2"><w2:column id="corpNm" value=""/><w2:column id="rmk" value=""/><w2:column id="etc" value=""/></w2:row></w2:gBody></w2:gridView>'
           '</body>')
    _, pb = pm.parse_body(pub); _, vb = pm.parse_body(ven)
    log = []
    matched, p_left, v_left, nonblock = pm.match(pm.collect(pb), pm.collect(vb), {}, log)
    assert matched == 3 and not v_left                                  # 조회←icon:search · 전화 1칸 · 그리드 닮음(법인명·비고 공통 2/3, 번호 제외)
    assert [sp for sp, k, el in p_left] == ["input:유선전화번호#2", "input:유선전화번호#3", "grid:크기/파일명"]
    trig = pb.find(".//" + pm.T(pm.XF, "trigger"))
    assert trig.get("id") == "img_1" and trig.get("{%s}onclick" % pm.EV) == "scwin.img_1_onclick"
    assert pb.find(".//" + pm.T(pm.XF, "input")).get("id") == "ipt_tel"
    assert pb.find(".//" + pm.T(pm.W2, "gridView")).get("id") == "grd_list"


def test_publish_merge_todo_placement_and_tidy():
    """남은 공급사 버튼은 버튼 자리에 TODO 표지와 함께, 남은 퍼블리싱 요소는 TODO 표지만; 목업 핸들러·중복 id 정리; override pair 는 manual."""
    from lxml import etree
    pub = ('<body><xf:group class="sub_contents" id="">\n  <xf:group class="btnbox" id="">\n    <xf:group class="rt" id="">\n'
           '      <xf:trigger id="btn_Close" type="button" ev:onclick="scwin.btn_Close_onclick"><xf:label><![CDATA[제출]]></xf:label></xf:trigger>\n'
           '    </xf:group>\n  </xf:group>\n  <xf:group id="panels1" tagname="div"/><xf:group id="panels1" tagname="div"/>\n</xf:group></body>')
    ven = ('<body><xf:trigger id="btn_modify" class="btn_cm" ev:onclick="scwin.btn_modify_onclick" type="button"><xf:label><![CDATA[수정]]></xf:label></xf:trigger>'
           '<xf:input id="ipt_hidden" style="display:none"/></body>')
    _, pb = pm.parse_body(pub); _, vb = pm.parse_body(ven)
    log = []
    matched, p_left, v_left, nonblock = pm.match(pm.collect(pb), pm.collect(vb), {}, log)
    assert matched == 0 and [sp for sp, k, el in p_left] == ["trigger:제출"] and [sp for sp, k, el in v_left] == ["trigger:수정"]
    todo = pm.place_leftovers(pb, vb, p_left, v_left, {"ipt_hidden"}, log)
    pm.tidy_mock(pb, "scwin.btn_modify_onclick = function(){};", log)
    out = etree.tostring(pb, encoding="unicode")
    assert todo == 3
    rt = pb.find(".//" + pm.T(pm.XF, "group") + "[@class='rt']")
    assert [etree.QName(e).localname if isinstance(e.tag, str) else "comment" for e in rt] == ["comment", "trigger", "comment", "trigger"]
    assert rt[3].get("id") == "btn_modify"                                                 # 공급사 버튼은 버튼 자리로
    assert "TODO Stage2(퍼블리싱 병합): 퍼블리싱 trigger:제출" in out and "스크립트가 쓰는 공급사 input#ipt_hidden" in out
    assert pb.find(".//" + pm.T(pm.XF, "input")).get("id") == "ipt_hidden"                  # 참조 요소 옮겨 넣음
    assert rt[1].get("{%s}onclick" % pm.EV) is None                                         # 목업 핸들러(정의 없음) 제거
    assert [gq.get("id") for gq in pb.iter(pm.T(pm.XF, "group")) if gq.get("tagname") == "div"] == ["panels1", ""]  # 중복 id 비움
    # override pair: 퍼블리싱 '제출' ← 공급사 btn_modify
    _, pb2 = pm.parse_body(pub); _, vb2 = pm.parse_body(ven)
    log2 = []
    matched2, p_left2, v_left2, _ = pm.match(pm.collect(pb2), pm.collect(vb2), {"pair": {"trigger:제출": "btn_modify"}}, log2)
    assert matched2 == 1 and not p_left2 and not v_left2 and pb2.find(".//" + pm.T(pm.XF, "trigger")).get("id") == "btn_modify"


def test_publish_merge_override_skip_and_accept(tmp_path, monkeypatch):
    """skip 은 병합하지 않고 mismatch, accept 는 정합 0 이어도 TODO 결과를 받아들여 manual."""
    pub = tmp_path / "JLDTEST00001.xml"
    pub.write_text('<?xml version="1.0"?><html><head/><body><xf:group class="pop_contents" id=""><xf:trigger id="" type="button"><xf:label><![CDATA[닫기]]></xf:label></xf:trigger>'
                   '<w2:textbox id="" label="상세"/></xf:group></body></html>', encoding="utf-8")
    tobe = tmp_path / "tobe"; tobe.mkdir()
    (tobe / "JLDTEST00001.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<xf:xforms xmlns:xf="http://www.w3.org/2002/xforms" xmlns:w2="http://www.inswave.com/websquare" xmlns:ev="http://www.w3.org/2001/xml-events">\n<html>\n<head meta_screenId="jldtest00001" meta_screenName="t" meta_desc="t" meta_author="t">\n'
        '  <xf:model><w2:dataCollection baseNode="map"><w2:dataMap baseNode="map" id="dma_pageContext"><w2:keyInfo/></w2:dataMap></w2:dataCollection></xf:model>\n'
        '  <w2:publicInfo method="scwin.onpageload"></w2:publicInfo>\n  <script type="text/javascript"><![CDATA[\nscwin.onpageload = function(){};\n]]></script>\n</head>\n'
        '<body ev:onpageload="scwin.onpageload">\n<xf:group class="sub_contents">\n<w2:gridView id="grd_list" dataList="data:dlt_list"><w2:header id="grd_list_hd"><w2:row id="row1"><w2:column id="h_a" value="가"/></w2:row></w2:header>'
        '<w2:gBody id="grd_list_bd"><w2:row id="row2"><w2:column id="a" value=""/></w2:row></w2:gBody></w2:gridView>\n</xf:group>\n</body>\n</html>\n</xf:xforms>\n', encoding="utf-8")
    monkeypatch.setattr(pm, "TOBE", tobe); monkeypatch.setattr(pm, "VENDOR_DIR", tobe)
    out = tmp_path / "out"
    rep = pm.merge_screen("jldtest00001", str(pub), out, False, {"jldtest00001": {"skip": "다른 화면"}})
    assert rep["verdict"] == "mismatch" and not out.exists()
    rep = pm.merge_screen("jldtest00001", str(pub), out, False, {"jldtest00001": {"accept": "그리드는 끝에 TODO"}})
    assert rep["verdict"] == "manual" and rep["todo"] == 1 and (out / "JLDTEST00001.xml").exists()  # 파일명은 대문자 줄기
    text = (out / "JLDTEST00001.xml").read_text(encoding="utf-8")
    assert "TODO Stage2(퍼블리싱 병합)" in text and 'id="grd_list"' in text and "pfmContentHeader" not in text  # 팝업은 헤더 없음
    rep = pm.merge_screen("jldtest00001", str(pub), out, True, {})
    assert rep["verdict"] == "todo"  # 닫기는 공통 버튼이라 항목 수에서 제외 → 퍼블 0·공급사 1(<5) → override 없이도 TODO 로 닫힌다


def test_dom_rules_v36():
    """규칙 19 기계 가능분: body 로 하나로 확정되는 jQuery·원시 폼 접근만 컴포넌트 API 로. 확정 안 되는 것(:checked·라디오 여러 칸·구조 조작)은 그대로."""
    import dom_rules as dr
    body = ('<body><xf:input id="ipt_name" name="corpNm" ref="data:dma.corpNm"/><w2:inputCalendar id="cal_from" name="pubofrDd"/>'
            '<xf:select1 id="slc_curr" name="currTpCd"/><xf:select1 id="ipt_rd1" name="reqDivCd" appearance="full"/><xf:select1 id="ipt_rd2" name="reqDivCd" appearance="full"/>'
            '<xf:group id="SendForm" tagname="div"/></body>')
    src = '''
const a = $("input[name=corpNm]").val();
$('input[name="pubofrDd"]').val("20260101");
const b = $("#slc_curr").val();
$('#ipt_name').attr("disabled", true); $("input[name=corpNm]").prop('disabled', ''); $("#slc_curr").removeAttr("disabled");
$("#ipt_name").attr("readonly", flag); $("#cal_from").show(); $("#ipt_name").focus();
const c = $(document).find("select[id=slc_curr]").val();
const d = $("input[name=reqDivCd]:checked").val();      // 라디오 여러 칸 — 그대로
const e = $("input[name=reqDivCd]").val();              // name 이 둘 — 그대로
$("#SendForm").find("input").val("");                   // 구조 조작 — 그대로
$("#nope").val();                                       // body 에 없음 — 그대로
const fm = (document.searchForm || { elements: [] });
fm.corpNm.value = "x";
if (fm.corpNm.value === "") {}
const g = document.getElementsByName("currTpCd")[0].value;
fm.action = "/a.do";
// $("#ipt_name").val()  주석은 그대로
'''
    out, log = dr.apply(src, body)
    assert 'const a = $c.util.getComponent("ipt_name").getValue();' in out
    assert '$c.util.getComponent("cal_from").setValue("20260101");' in out
    assert 'const b = $c.util.getComponent("slc_curr").getValue();' in out
    assert '$c.util.getComponent("ipt_name").setDisabled(true); $c.util.getComponent("ipt_name").setDisabled(false); $c.util.getComponent("slc_curr").setDisabled(false);' in out
    assert '$c.util.getComponent("ipt_name").setReadOnly(Boolean(flag)); $c.util.getComponent("cal_from").show(); $c.util.getComponent("ipt_name").focus();' in out
    assert 'const c = $c.util.getComponent("slc_curr").getValue();' in out
    assert 'const d = $("input[name=reqDivCd]:checked").val();' in out and 'const e = $("input[name=reqDivCd]").val();' in out
    assert '$("#SendForm").find("input").val("");' in out and '$("#nope").val();' in out
    assert '$c.util.getComponent("ipt_name").setValue("x");' in out and 'if ($c.util.getComponent("ipt_name").getValue() === "") {}' in out
    assert 'const g = $c.util.getComponent("slc_curr").getValue();' in out and 'fm.action = "/a.do";' in out
    assert '// $("#ipt_name").val()  주석은 그대로' in out
    assert log == {"J_jquery": 9, "J3_document_find": 1, "D1_form_field": 2, "D1_byname": 1}
    out2, log2 = dr.apply(out, body)
    assert out2 == out and not log2  # 멱등


def test_publish_merge_mark_jquery_todo():
    """병합 결과를 쓰기 전 남은 jQuery 문장마다 규칙 19 힌트 TODO 한 줄(멱등, 주석·문자열 제외)."""
    src = '''scwin.a = function () {
    $("#frm").attr("action", "x.do");
    const f = $('[type=file]');
    // $("#c").val()  주석
    $("input[name=x]:checked").val();
    const s = "$(not code)";
};'''
    out, n = pm.mark_jquery_todo(src)
    assert n == 3
    lines = out.split("\n")
    assert lines[1].strip() == "// TODO Stage2(규칙 19): jQuery — 폼 제출 → $c.sbm 서브미션(규칙 6, B-4 제출 주소 회신)"
    assert lines[3].strip().startswith("// TODO Stage2(규칙 19): jQuery — 파일 입력")
    assert "라디오/체크 그룹" in lines[6]
    assert out.count("TODO Stage2(규칙 19)") == 3 and '"$(not code)"' in out
    out2, n2 = pm.mark_jquery_todo(out)
    assert out2 == out and n2 == 0


def test_v37_handler_trycatch():
    """P2 V37: 공급사 페이저 한 줄 핸들러 → 표준 try/catch 다중행, try 없는 핸들러 래핑, 이미 try 있음·빈 본문·tx_·주석만은 그대로. 멱등."""
    head = '<head meta_screenId="jldfil00002">'
    src = '''scwin.krxpage_pagenavigator_48_onclick = function (index) { const pi = (index && typeof index === 'object') ? index.newSelectedIndex : index; try { $c.util.getComponent('dma_req').set('pageIndex', pi); } catch (e) { $c.exception.handleError(e, { notify: 'none', context: 'krxpage_pagenavigator_48.page' }); } scwin.searchList(); };
scwin.krxpage_pagenavigator_197_onclick = async function (index) { const pi = (index && typeof index === 'object') ? index.newSelectedIndex : index; await scwin.search(index); };
scwin.btn_a_onclick = function (e) {
    scwin.doA();
    return false;
};
scwin.btn_b_onclick = async function (e) {
    try {
        await scwin.doB();
    } catch (_ex) { await $c.exception.handleError(_ex, { context: 'x.btn_b_onclick' }); }
};
scwin.grd_x_oneditend = function (e) {
};
scwin.dts_y_onloadcompleted = function () {
    // alert(1);
};
scwin.tx_onPopupCode = async function () {
    const sbmOptions = { id: "tx_onPopupCode" };
};
scwin.btn_close_onclick = function () {
    const id = 'p';
    try { scwin.close(id); } catch (e) { scwin.fallback(); }
};
'''
    out, log = vs.wrap_handler_trycatch(src, head)
    assert log == {"pager": 2, "wrapped": 1}
    assert ('scwin.krxpage_pagenavigator_48_onclick = function (index) {\n    try {\n'
            "        const pi = (index && typeof index === 'object') ? index.newSelectedIndex : index;\n"
            "        $c.util.getComponent('dma_req').set('pageIndex', pi);\n        scwin.searchList();\n"
            '    } catch (ex) {\n        $c.exception.handleError(ex, { context : "jldfil00002.krxpage_pagenavigator_48_onclick" });\n    }\n};') in out
    assert ('scwin.krxpage_pagenavigator_197_onclick = async function (index) {\n    try {\n'
            "        const pi = (index && typeof index === 'object') ? index.newSelectedIndex : index;\n        await scwin.search(index);\n"
            '    } catch (ex) {\n        await $c.exception.handleError(ex, { context : "jldfil00002.krxpage_pagenavigator_197_onclick" });\n    }\n};') in out
    assert "notify: 'none'" not in out
    assert ('scwin.btn_a_onclick = function (e) {\n    try {\n        scwin.doA();\n        return false;\n    } catch (ex) {\n'
            '        $c.exception.handleError(ex, { context : "jldfil00002.btn_a_onclick" });\n    }\n};') in out
    # 그대로인 것
    for keep in ("scwin.btn_b_onclick = async function (e) {\n    try {\n        await scwin.doB();", "scwin.grd_x_oneditend = function (e) {\n};",
                 "scwin.dts_y_onloadcompleted = function () {\n    // alert(1);\n};", 'scwin.tx_onPopupCode = async function () {\n    const sbmOptions',
                 "scwin.btn_close_onclick = function () {\n    const id = 'p';\n    try { scwin.close(id); }"):
        assert keep in out, keep[:40]
    out2, log2 = vs.wrap_handler_trycatch(out, head)
    assert out2 == out and log2 == {"pager": 0, "wrapped": 0}


def test_v38_fn_alias_inline():
    """P2 V38: `scwin.fn_X = null;` + onpageload 단일 대입 `scwin.fn_X = scwin.T;` → 별칭 제거·호출을 T 로. 대입 2회·타깃 정의 없음은 보류. 멱등."""
    head = '<head><w2:publicInfo method="scwin.onpageload"/>'
    body = '<body><xf:trigger id="b" ev:onclick="scwin.b_onclick"/></body>'
    src = '''scwin.fn_chk = null;
scwin.fn_two = null;
scwin.fn_noDef = null;

scwin.onpageload = async function () {
    try {
        scwin.init_recvParam();
        scwin.fn_chk = scwin.tx_fn_chk;
        scwin.fn_two = scwin.tx_a;
        scwin.fn_noDef = scwin.tx_missing;
    } catch (ex) { }
};
scwin.b_onclick = async function () {
    if (cond) { scwin.fn_two = scwin.tx_b; }
    await scwin.fn_chk();
    const h = "scwin.fn_chk()";
    scwin.fn_two();
};
scwin.tx_fn_chk = async function () {};
scwin.tx_a = async function () {};
scwin.tx_b = async function () {};
'''
    h2, s2, b2, log = vs.inline_fn_aliases(head, src, body)
    assert log["inlined"] == ["fn_chk → scwin.tx_fn_chk"]
    assert log["skipped"] == ["fn_two(대입 2)", "fn_noDef(타깃 tx_missing 정의 없음)"]
    assert "scwin.fn_chk" not in s2 and "await scwin.tx_fn_chk();" in s2 and 'const h = "scwin.tx_fn_chk()";' in s2
    assert "scwin.fn_two = null;" in s2 and "scwin.fn_two = scwin.tx_a;" in s2 and "scwin.fn_noDef = scwin.tx_missing;" in s2
    assert s2.count("scwin.init_recvParam();\n        scwin.fn_two = scwin.tx_a;") == 1   # 삭제한 줄 자리가 깨끗이 닫힘
    h3, s3, b3, log3 = vs.inline_fn_aliases(h2, s2, b2)
    assert s3 == s2 and log3.get("inlined") is None


def test_v39_sdd_guards_and_typeof_context():
    """P2 V39: 실존 컴포넌트의 [sdd] 가드 삼항 → 직접 호출, checked-read 가드 → 본식; 없는 컴포넌트·변수 id 는 그대로. typeof 꼴 컨텍스트 키 가드 → (scwin.X ?? "") + TODO 키."""
    head = '<head><xf:model><w2:dataCollection><w2:dataMap baseNode="map" id="dma_hiddenStore"/></w2:dataCollection></xf:model>'
    body = '<body><xf:input id="ipt_a"/><xf:group id="layer1"/></body>'
    src = '''scwin.f = function () {
    ($c.util.getComponent('ipt_a') && $c.util.getComponent('ipt_a').setValue ? $c.util.getComponent('ipt_a').setValue(v, "x") : console.warn('[sdd] 값 쓰기 미지원 컴포넌트: ipt_a'));
    (($c.util.getComponent('layer1')) && ($c.util.getComponent('layer1')).addClass ? ($c.util.getComponent('layer1')).addClass("active") : console.error('[sdd] addClass 미지원: layer1'));
    ($c.util.getComponent('dma_hiddenStore') && $c.util.getComponent('dma_hiddenStore').set ? $c.util.getComponent('dma_hiddenStore').set('k', page) : console.warn('[sdd] hiddenStore 부재 (k)'));
    ($c.util.getComponent('ipt_none') && $c.util.getComponent('ipt_none').hide ? $c.util.getComponent('ipt_none').hide() : console.warn('[sdd] hide 대상 미해결: ipt_none'));
    ($c.util.getComponent(layer) && $c.util.getComponent(layer).show ? $c.util.getComponent(layer).show() : console.warn('[sdd] show 대상 미해결: ' + layer));
    if (((!$c.util.getComponent('ipt_a') || typeof $c.util.getComponent('ipt_a').getValue !== 'function') ? (console.warn('[sdd] .checked 대상 미해결: ipt_a'), false) : ($c.util.getComponent('ipt_a').getValue() != null && String($c.util.getComponent('ipt_a').getValue()) === "Y"))) { x(); }
};
'''
    out, log = vs.simplify_sdd_guards(src, head, body)
    assert log == {"call": 3, "read": 1}
    assert '''    $c.util.getComponent('ipt_a').setValue(v, "x");\n''' in out
    assert '''    $c.util.getComponent('layer1').addClass("active");\n''' in out
    assert '''    $c.util.getComponent('dma_hiddenStore').set('k', page);\n''' in out
    assert "console.warn('[sdd] hide 대상 미해결: ipt_none')" in out and "console.warn('[sdd] show 대상 미해결: ' + layer)" in out
    assert '''    if (($c.util.getComponent('ipt_a').getValue() != null && String($c.util.getComponent('ipt_a').getValue()) === "Y")) { x(); }''' in out
    out2, log2 = vs.simplify_sdd_guards(out, head, body)
    assert out2 == out and log2 == {}
    # typeof 꼴 컨텍스트 키 가드(V5 확장)
    src2 = '''///////// 2. 초기화 영역 /////////
scwin.init_conds = function () {
    const a = (typeof scwin.flag !== "undefined" && scwin.flag !== null ? scwin.flag : (console.warn("[sdd] 컨텍스트 키 미충전 — " + "flag" + " (as-is EL 부재 = 빈값이라 진행합니다)"), ""));
    const b = (typeof scwin.keyword !== "undefined" && scwin.keyword !== null ? scwin.keyword : (console.warn("[sdd] 컨텍스트 키 미충전 — " + "param.keyword" + " (as-is EL 부재 = 빈값이라 진행합니다)"), ""));
};
'''
    s3, keys = vp.unwrap_values(src2)
    assert 'const a = (scwin.flag ?? "");' in s3 and 'const b = (scwin.keyword ?? "");' in s3 and "console.warn" not in s3
    assert keys["context"] == ["flag", "param.keyword"]
    assert "// TODO Stage2: 컨텍스트 키 출처 미확인(as-is EL · 회신 A-3) — flag, param.keyword" in s3


def test_v40_innerhtml():
    """P2 V40: textbox 대상의 setValue/innerHTML 가드 삼항 → setValue 직접; 그룹 대상 getComponent('id').innerHTML → .render.innerHTML; 그룹 대상 가드·없는 id·td.innerHTML 은 그대로. 멱등."""
    body = '<body><w2:textbox id="txt_docs"/><xf:group id="isuList"/><xf:group id="attachForm"/></body>'
    src = '''scwin.f = function () {
    (($c.util.getComponent("txt_docs")) && ($c.util.getComponent("txt_docs")).setValue ? ($c.util.getComponent("txt_docs")).setValue(scwin.chkTitle.join("<br/>")) : (($c.util.getComponent("txt_docs")) ? (($c.util.getComponent("txt_docs")).innerHTML = scwin.chkTitle.join("<br/>")) : void (scwin.chkTitle.join("<br/>"))));
    (($c.util.getComponent("attachForm")) && ($c.util.getComponent("attachForm")).setValue ? ($c.util.getComponent("attachForm")).setValue(h) : (($c.util.getComponent("attachForm")) ? (($c.util.getComponent("attachForm")).innerHTML = h) : void (h)));
    $c.util.getComponent('isuList').innerHTML = returnVal;
    const t = $c.util.getComponent('isuList').innerHTML + $c.util.getComponent('nope').innerHTML;
    td.innerHTML = "x";
};
'''
    out, log = vs.simplify_innerhtml(src, "", body)
    assert log == {"guard": 1, "render": 2}
    assert '''    $c.util.getComponent("txt_docs").setValue(scwin.chkTitle.join("<br/>"));\n''' in out
    assert '(($c.util.getComponent("attachForm")) && ($c.util.getComponent("attachForm")).setValue ?' in out      # 그룹: innerHTML 갈래가 실제 동작 — 그대로
    assert "$c.util.getComponent('isuList').render.innerHTML = returnVal;" in out
    assert "const t = $c.util.getComponent('isuList').render.innerHTML + $c.util.getComponent('nope').innerHTML;" in out
    assert 'td.innerHTML = "x";' in out
    out2, log2 = vs.simplify_innerhtml(out, "", body)
    assert out2 == out and log2 == {}
