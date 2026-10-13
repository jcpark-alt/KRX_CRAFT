# -*- coding: utf-8 -*-
"""ui_restyle(V49 · body 를 sample-front 꼴로) 단위 테스트.

실행:
    pytest conversion/tools/test_ui_restyle.py

픽스처는 JLDFIL01030/00003(대상회사 선택 화면)의 꼴을 축약한 것 — hidden input(참조/미참조/value), 숨김 iframe, lybox 아이콘 안내표,
생 텍스트 칸, img_N 아이콘 버튼 + 배치 테이블(한 칸짜리 행), 2단 표의 [th, 입력, 조회버튼] 행과 colspan=2, 공통 접두 th 라벨.
"""
import os
import re
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import ui_restyle as ur  # noqa: E402

HEAD = ('<html xmlns="http://www.w3.org/1999/xhtml" xmlns:ev="http://www.w3.org/2001/xml-events" xmlns:w2="http://www.inswave.com/websquare" xmlns:xf="http://www.w3.org/2002/xforms">\n'
        '<head meta_screenId="JLDFIL99999">\n  <w2:publicInfo method="scwin.onpageload,scwin.img_1_onclick,scwin.__ev_2_img_2_onclick,scwin.img_2_onclick,scwin.setCorpInfo"/>\n')

SCRIPT = '''
scwin.onpageload = function () { $c.util.getComponent("ipt_keep").setValue("1"); };
/**
 * @name img_1_onclick
 * @description img_1 클릭 이벤트
 */
scwin.img_1_onclick = async function (e) {
    try { await scwin.findCompany(); } catch (_ex) { $c.exception.handleError(_ex, { context: 'jldfil99999.img_1_onclick' }); }
};
scwin.img_2_onclick = function (e) { /* 고아 정의 */ };
scwin.__ev_2_img_2_onclick = async function (e) {
    try { await scwin.goWrite(); } catch (_ex) { $c.exception.handleError(_ex, { context: 'jldfil99999.__ev_2_img_2_onclick' }); }
};
scwin.setCorpInfo = function (a, b) {
    $c.util.getComponent("ipt_txtisurCd").setValue(a);
    $c.util.getComponent("ipt_txtcomNm").setValue(b);
};
'''

BODY = '''</head>
<body ev:onpageload="scwin.onpageload">
  <xf:group class="sub_contents">
    <w2:pageFrame id="pfmContentHeader" src="/cm/xml/contentHeader.xml" style=""/>
    <w2:tag id="iframe_8" tagname="iframe" style="display:none;width:0px;height:0px" src="about:blank" name="tempSaveFrame"/>
    <!-- hidden 'formCd' 유지 — 스크립트가 DOM 으로 참조합니다. -->
    <xf:input id="ipt_formCd" tagname="input" style="display:none;" inputType="hidden" name="formCd" ref="data:dma_req.formCd"/>
    <xf:input id="ipt_keep" tagname="input" style="display:none;" inputType="hidden" name="keep" ref="data:dma_req.keep"/>
    <xf:input id="ipt_method" tagname="input" style="display:none;" inputType="hidden" value="loadInitPage" name="method" ref="data:dma_req.method"/>
    <xf:group class="tblbox" id="">
      <xf:group adaptive="layout" adaptiveThreshold="768" class="w2tb tbl" tagname="table">
        <w2:attributes>
          <w2:summary/>
        </w2:attributes>
        <xf:group tagname="colgroup">
          <xf:group tagname="col" style="width:150px;"/>
          <xf:group tagname="col"/>
        </xf:group>
        <xf:group id="" tagname="tr">
          <xf:group id="" tagname="td" class="w2tb_td">
            <xf:group class="tblbox" id="">
              <xf:group adaptive="layout" adaptiveThreshold="768" class="w2tb tbl" tagname="table">
                <w2:attributes>
                  <w2:summary/>
                </w2:attributes>
                <xf:group tagname="colgroup">
                  <xf:group tagname="col" style="width:150px;"/>
                  <xf:group tagname="col"/>
                </xf:group>
                <xf:group id="" tagname="tr">
                  <xf:group tagname="th" class="w2tb_th">
                    <w2:textbox label="대상회사 거래소고유번호" style="" id=""/>
                  </xf:group>
                  <xf:group id="" tagname="td" class="w2tb_td">
                    <xf:input id="ipt_txtisurCd" tagname="input" style="width:10ch;" inputType="text" name="txtisurCd" ref="data:dma_req.txtisurCd"/>
                  </xf:group>
                  <xf:group id="" tagname="td" class="w2tb_td">
                    <xf:trigger id="img_1" class="btn_cm search icon" style="" ev:onclick="scwin.img_1_onclick" type="button"/>
                  </xf:group>
                </xf:group>
                <xf:group id="" tagname="tr">
                  <xf:group tagname="th" class="w2tb_th">
                    <w2:textbox label="대상회사 금감원고유번호" style="" id=""/>
                  </xf:group>
                  <xf:group id="" tagname="td" class="w2tb_td"><w2:attributes><w2:colspan>2</w2:colspan></w2:attributes>
                    <xf:input id="ipt_txtcomNm" tagname="input" style="width:30ch;" inputType="text" name="txtcomNm" ref="data:dma_req.txtcomNm"/>
                  </xf:group>
                </xf:group>
                <xf:group id="" tagname="tr">
                  <xf:group id="" tagname="td" class="w2tb_td">
                    조회된 결과값이 없습니다.
                    <w2:attributes>
                      <w2:colspan>2</w2:colspan>
                    </w2:attributes>
                  </xf:group>
                </xf:group>
              </xf:group>
            </xf:group>
            <xf:group tagname="table" class="lybox w2tb">
              <xf:group id="" tagname="tr">
                <xf:group class="w2tb_td" id="" tagname="td" style="width:14px">
                  <xf:image id="img_9" tagname="img" src="/img/submission/main/icon_3.gif"/>
                </xf:group>
                <xf:group class="w2tb_td" id="" tagname="td">
                  대상회사를 선택하십시요.
                </xf:group>
              </xf:group>
            </xf:group>
          </xf:group>
        </xf:group>
        <xf:group id="" tagname="tr">
          <xf:group id="" tagname="td" class="w2tb_td">
            <xf:trigger id="img_2" class="btn_cm save icon" style="" ev:onclick="scwin.__ev_2_img_2_onclick" type="button"/>
          </xf:group>
        </xf:group>
      </xf:group>
    </xf:group>
  </xf:group>
</body>
</html>
'''


def _run(head=HEAD, script=SCRIPT, body=BODY):
    return ur.apply(head, script, body)


def test_hidden_and_iframe_removed_only_when_unreferenced():
    head, script, body, log = _run()
    assert 'id="ipt_formCd"' not in body and "hidden 'formCd'" not in body   # 미참조 → 삭제(주석 포함)
    assert 'id="ipt_keep"' in body                                            # 스크립트 참조 → 유지
    assert 'id="ipt_method"' in body and 'value="loadInitPage"' in body       # value 보유 → 유지
    assert 'tagname="iframe"' not in body                                     # tempSaveFrame 미참조 → 삭제
    assert log["U2_hidden"] == 1 and log["U3_iframe"] == 1


def test_buttons_renamed_by_handler_target_and_orphan_kept():
    head, script, body, log = _run()
    assert 'id="btn_findCompany"' in body and 'ev:onclick="scwin.btn_findCompany_onclick"' in body
    assert "scwin.btn_findCompany_onclick = async function" in script
    assert "context: 'jldfil99999.btn_findCompany_onclick'" in script
    # 실제 연결 핸들러(__ev_2_img_2_onclick)만 개명, 고아 img_2_onclick 정의는 그대로
    assert 'id="btn_goWrite"' in body and 'ev:onclick="scwin.btn_goWrite_onclick"' in body
    assert "scwin.btn_goWrite_onclick = async function" in script and "scwin.img_2_onclick = function" in script
    pub = re.search(r'publicInfo method="([^"]*)"', head).group(1)
    assert "scwin.btn_findCompany_onclick" in pub and "scwin.btn_goWrite_onclick" in pub and "scwin.img_1_onclick" not in pub
    assert "scwin.img_2_onclick" in pub
    # 아이콘 전용 버튼에 라벨 — search 는 아이콘 이름, goWrite 는 '문서작성'
    assert "<xf:label><![CDATA[search]]></xf:label>" in body and "<xf:label><![CDATA[문서작성]]></xf:label>" in body


def test_layout_flattened_and_two_col_normalized():
    head, script, body, log = _run()
    # 배치 테이블(한 칸짜리 행 2개)은 걷히고 버튼 행은 btnbox > rt 로
    assert body.count('tagname="table"') == 1
    assert re.search(r'<xf:group class="btnbox"[^>]*>\s*<xf:group class="rt"[^>]*>\s*<xf:trigger id="btn_goWrite" class="btn_cm pt"', body)
    # [th, 입력, 조회버튼] → 입력 칸에 버튼 합침, 그 아래 th+td 행의 colspan=2 는 제거, 한 칸짜리 안내 행의 colspan 은 유지
    assert re.search(r'<xf:input id="ipt_txtisurCd"[^>]*/>\s*<xf:trigger id="btn_findCompany"', body)
    assert body.count("<w2:colspan>2</w2:colspan>") == 1
    assert "조회된 결과값이 없습니다." in body                       # 생 텍스트 앞의 attributes 제거로 텍스트가 사라지지 않는다
    assert body.count("<w2:scope>row</w2:scope>") == 2
    assert 'readOnly="true"' in body and body.count('readOnly="true"') == 2   # setCorpInfo 가 채우는 두 입력
    assert 'inputType="text"' not in body and 'style="width:120px;"' in body


def test_notice_and_title():
    head, script, body, log = _run()
    assert 'class="lybox' not in body
    assert '<w2:textbox class="txt_info" id="" label="대상회사를 선택하십시요." style=""/>' in body
    assert 'label="대상회사" style="" tagname="h3"' in body
    assert 'label="거래소고유번호"' in body and 'label="금감원고유번호"' in body
    # 순서: 제목 → 안내 → 표
    assert body.index('tagname="h3"') < body.index('class="txt_info"') < body.index('class="tblbox"')


def test_idempotent():
    head, script, body, log = _run()
    head2, script2, body2, log2 = ur.apply(head, script, body)
    assert log2 == {} and (head2, script2, body2) == (head, script, body)


def test_shared_handler_not_renamed_and_wrapper_with_id_kept():
    body = BODY.replace('ev:onclick="scwin.img_1_onclick"', 'ev:onclick="scwin.commonSearch"').replace('<xf:group class="tblbox" id="">\n      <xf:group adaptive', '<xf:group class="tblbox" id="grd_wrap">\n      <xf:group adaptive', 1)
    script = SCRIPT + "\nscwin.commonSearch = function (e) {};\n"
    head, script2, body2, log = _run(script=script, body=body)
    assert 'ev:onclick="scwin.commonSearch"' in body2 and "scwin.commonSearch = function" in script2   # 공용 핸들러는 그대로
    assert 'id="grd_wrap"' in body2                                                                  # id 있는 래퍼는 걷지 않는다
