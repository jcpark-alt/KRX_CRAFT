<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@ page import="krx.lds.bnf.common.util.CodeUtil" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib uri="/tags/krx-page" prefix="krxpage" %>
<script language="JavaScript" src="/js/fileUpload.js"></script>
<c:if test="${param.modifyComplete == 'Y'}">
	<script>alert('요청하신 작업을 완료하였습니다.');</script>
</c:if>
<style>
	tr.on{
		background-color: #F2CE98;
	}
</style>
<!-- 발행기관담당자정보수정 -->
<script language="javascript">
//menu init
var dmenus={
	"bmenu":7
	,"mmenu":0
};

(function($){
	$(document).ready(function(){
        //$("#dtlInfo").hide();
        $("#fileList").hide();

	});
})(jQuery);

// 데이터 수정
function fn_Update() {

    // 필수항목 체크
	if ( !fn_chkData() ){
		return false;
	}

    // 전화번호 등을 세팅. 하나로 합침.
    setCellphoneNoEtc();

	var SendForm = document.SendForm;
	if(confirm("변경하시겠습니까?")) {

	    const addNew = $("input[name='addNew']").val();
	    if( addNew == "ADD" ){
            $("input[name='doc_bdchrg_tp_cd']").each(function (index) {
                $(this).val($("#bdchrg_tp_cd").val());
            });
	        // 담당자가 변경되는 경우..
            SendForm.action = "/register/registerNew.do?method=changeBdchrg";
	    } else {
	        // 담당자 정보가 변경되는 경우..
	        SendForm.action = "/register/registerNew.do?method=updateBdchrgInfo";
	    }
	    SendForm.target = "_self";
	    SendForm.submit();
	}
}

function fn_GetChrgNm(index){
    const table = document.getElementById("chgrList");
    const row = table.rows[index];
    var name = "";
    if( row ){
        const rowData = Array.from(row.cells).map(cell => cell.textContent);
        name = rowData[1];
    }
    return name;
}

function fn_GetSelectedIndex(){
    const rows = document.querySelectorAll("#chgrList tr");
    var selectedIndex = -1;

    rows.forEach((row, index) => {
        if(row.classList.contains("on")){
            selectedIndex = index;
        }
    });
    return selectedIndex;
}

// 담당자를 다른사람으로 변경.
function fn_AddNewBdchrg(){

    var selectedIndex = fn_GetSelectedIndex();
    if( selectedIndex < 0 ){
        alert("변경 대상 담당자를 선택하세요.");
        return;
    }

    // 선택한 row의 담당자명을 구한다.
    const name = fn_GetChrgNm(selectedIndex);
    const message = "[" + name + "] 을(를) 다른 사람으로 변경하시겠습니까?";
    if( !confirm(message) ){
        return;
    }

    $("#fileList").show();
    initBdchrgInfo();
    initFileList();

    // initBdchrgInfo()에 addNew의 값을 초기화하는 부분이 있기 때문에 이후에 값을 설정해줘야 한다.
    $("input[name='chrg_nm']").attr("readonly", false);
    $("input[name='belng_inst_nm']").attr("readonly", false);
    $("input[name='addNew']").val("ADD");
}

function fnReset(){
	document.SendForm.reset();
}


function focus_tr(obj){
    var i;
    var tabNum = obj.parentNode.children.length;//tr의갯수

    for(i = 0; i < tabNum; i++){
        obj.parentNode.children[i].className = '';
    }
    obj.className = 'on';

    $("#fileList").hide();
    initFileList();
    initBdchrgInfo();

    fn_SelectBdchrgDtlInfo(obj.rowIndex -1, obj.parentNode.children.length);
}

// 채권신고담당자 상세정보 조회
function fn_SelectBdchrgDtlInfo(rowIdx, rownum)
{
    var fm = document.SendForm;
    if(rownum == 1){
        fm.snd_chrg_id.value = fm.chrg_id.value;
    }else if(rownum > 1){
        fm.snd_chrg_id.value = fm.chrg_id[rowIdx].value;
    }

    $.ajax({
        type    : "POST",
        async  : false,
        url       : "/account/userInfo.do?method=selectBdchrgDtlInfo",
        data    : $("#SendForm").serialize(),
        success: function(data) {
			var result = $.parseJSON(data);

            $("input[name='bf_bdchrg_tp_cd']").val(result.bdchrg_tp_cd);
			$("#bdchrg_tp_cd").val(result.bdchrg_tp_cd).prop("selected", true);
			$("input[name='chrg_nm']").val(result.chrg_nm);
			$("input[name='jobpos_nm']").val(result.jobpos_nm);
			$("input[name='belng_inst_nm']").val(result.belng_inst_nm);
			$("input[name='belng_dep_nm']").val(result.belng_dep_nm);

            // 전화번호
            setTelNo(result.tel_no);
			setCellphoneNo(result.cellphone_no);
			setEmail(result.email);
			setFaxNo(result.fax_no);
        },
        error : function(request, status, error) {
            //통신 에러 발생시 처리
            alert("현재 서버에서 채권신고담당자 정보를 가져올 수 없습니다. 관리자에게 문의하세요.");
            return;
        },
        complete: function() {
            //통신이 완료된 후 처리
            //result = $.parseJSON(data);
            //alert(result.sendResult);
            //return result.sendResult;
        }
    });
}
function initBdchrgInfo(){
    const inputs = document.querySelectorAll("#dtlInfo input[type='text']");
    inputs.forEach(input => {
        input.value = "";
    });

    const selects = document.querySelectorAll("#dtlInfo select");
    selects.forEach(select => {
        selects.selectedIndex = -1;
    });

    // 이름, 소속기관은 수정불가.
    $("input[name='chrg_nm']").attr("readonly", true);
    $("input[name='belng_inst_nm']").attr("readonly", true);
    $("input[name='addNew']").val("");
}

function initFileList(){
    const inputs = document.querySelectorAll("#dtlInfo input[type='text']");
    inputs.forEach(input => {
        input.value = "";
    });
    const files = document.querySelectorAll("#dtlInfo input[type='file']");
    files.forEach(file => {
        file.value = "";
    });
}

/**
 * 채권신고담당자신청문서코드(BDCHRG_APPL_DOC_CD) 서식다운로드
 * 01 상장계약서
 * 02 회사개황
 * 03 법인인감증명서
 * 04 상장채권신고권한위임장
 * 05 개인정보동의서
 * 06 재직증명서
 */
function fn_downloadDoc(docCd, fileNm){
    if( !confirm(fileNm + " 다운로드 하시겠습니까?") ){
        return;
    }
    var fm = document.fileDownForm;

    fm.contnId.value = docCd;
    fm.action = '/main/notice.do?method=downloadFile';
    fm.submit();
    return;
}

</script>

<form name="SendForm" id="SendForm" method="post" enctype="multipart/form-data">
<!-- 중복등록 방지를 위한 토큰 -->
<input type="hidden" name="org.apache.struts.taglib.html.TOKEN" value="${sessionScope['org.apache.struts.action.TOKEN']}"/> 
<input type="hidden" name="method"/>
<input type="hidden" name="check_svc" id="check_svc" />
<input type="hidden" name="addNew"/>
<input type="hidden" name="isur_cd" id="isur_cd" value="<c:out value='${companyInfoVO.isurCd}' escapeXml='true' />" />
<input type="hidden" name="snd_chrg_id" id="snd_chrg_id" />
<!-- 변경 전 담당자구분코드. 담당자구분의 변경여부를 알기위해. 이것이 변경되면 나머지 담당자의 담당자구분도 변경해야함 -->
<!-- 정과 부는 한명씩.... -->
<input type="hidden" name="bf_bdchrg_tp_cd" id="bf_bdchrg_tp_cd" />
<input type="hidden" id="bdchrgRegNoFileInstYn" name="bdchrgRegNoFileInstYn" value="<c:out value='${bdchrgRegNoFileInstYn}' escapeXml='true' />" />

	<div class="contents section">
		<div class="article-header">
			<h1>채권신고담당자 정보변경</h1>
			<ul class="map"><li class="home">Home</li><li>계정관리</li><li>담당자정보 변경</li></ul>
			<div class="clear"></div>
		</div>

		<div class="article contents">

			<table summary="상세" class="type-00 detail mt12">
				<caption>상세</caption>
				<colgroup>
					<col style="width: 170px;">
					<col style="width: *;">
					<col style="width: 170px;">
					<col style="width: *;">
				</colgroup>
				<tbody>
					<tr class="last">
						<th>발행기관코드</th>
						<td>
						    <c:out value='${companyInfoVO.isurCd}' escapeXml='true' />
						</td>
						<th>발행기관명</th>
						<td class="last">
							<c:out value='${companyInfoVO.comNm}' escapeXml='true' />
						</td>
					</tr>
				</tbody>
			</table>

			<div class="clear"></div>
			<div class="fright pt15">
				<a href="javascript:void(0)" onclick="fn_AddNewBdchrg();" class="btn-sprite type-01 mt15"><span>담당자 변경</span></a>
			</div>
			<div class="clear"></div>
			<table summary="목록" class="type-00 list mt5" id="chgrList">
				<caption>목록</caption>
				<colgroup>
					<col style="width: 110px;">
					<col style="width: 100px;">
					<col style="width: 100px;">
					<col style="width: 100px;">
					<col style="width: 80px;">
					<col style="width: 130px;">
					<col style="width: 130px;">
					<col style="width: *;">
					<col style="width: 130px;">
				</colgroup>
				<thead>
					<tr>
						<th class="first">구분</th><th>담당자명</th><th>소속기관</th><th>소속부서</th><th>직책</th><th>전화번호</th><th>휴대전화번호</th><th>이메일</th><th>팩스번호</th>
					</tr>
				</thead>
				<tbody>
					<c:choose>
						<c:when test="${!empty result}">
							<c:forEach var="entity" items="${result}" varStatus="status">
							<tr class="first" onclick="focus_tr(this);">
								<td class="first txc" >
                                    ${entity.bdchrg_tp_nm}
                                    <input type="hidden" id="chrg_id" name="chrg_id" value="${entity.chrg_id}" />
								</td>
								<td class="txc">${entity.chrg_nm}</td>
								<td class="txc">${entity.belng_inst_nm}  ${entity.charIsuNm}</td>
								<td class="txc">${entity.belng_dep_nm}</td>
								<td class="txc">${entity.jobpos_nm}</td>
								<td class="txc">${entity.tel_no}</td>
								<td class="txc">${entity.cellphone_no}</td>
								<td class="txl">${entity.email}</td>
								<td class="txc last">${entity.fax_no}</td>
							</tr>
							</c:forEach>
						</c:when>
						<c:otherwise>
							<tr class="first">
								<td class="first txc" colspan="9">데이터가 없습니다.</td>
							</tr>
						</c:otherwise>
					</c:choose>
				</tbody>
			</table>
            <div class="clear" style="height: 10px"></div>
            <h2 class="ttl type-00">담당자정보 수정 <span style="color: red; font-size: 15px; float: right;">※ 국고채의 업무를 대행하는 한국은행 및 정부·지방자치단체에 한해 신고담당자 등록 필수 서류제출을 면제합니다.</span></h2>
            <div id="dtlInfo">
			<table summary="상세" class="type-00 input mt5">
				<caption>조회</caption>
				<colgroup>
					<col style="width: 120px;" />
					<col style="width: *;" />
					<col style="width: 120px;" />
					<col style="width: *;" />
				</colgroup>
				<tbody>
					<tr>
						<th><strong>담당자구분</strong></th>
						<td class="last" colspan="3">
                            <select id ="bdchrg_tp_cd" name ="bdchrg_tp_cd">
                                <option value="M">신고담당자(정)</option>
                                <option value="S">신고담당자(부)</option>
                            </select>
						</td>
					</tr>
					<tr>
						<th><strong>이름</strong></th>
						<td>
							<input type="text" name="chrg_nm" value="" class="txt middle" maxlength="20" onkeyup="byteCheck(this, 40)" style="ime-mode:active" readonly />
						</td>
						<th><strong>직책</strong></th>
						<td class="last">
						    <input type="text" name="jobpos_nm" value="" class="txt middle" maxlength="20" style="ime-mode:active"/>
						</td>
					</tr>
					<tr>
						<th><strong>소속기관</strong></th>
						<td>
							<input type="text" name="belng_inst_nm" value="" class="txt middle" maxlength="20" style="ime-mode:active" readonly />
						</td>
						<th><strong>소속부서</strong></th>
						<td class="last">
						    <input type="text" name="belng_dep_nm" value="" class="txt middle" maxlength="20" style="ime-mode:active"/>
						</td>
					</tr>
					<tr>
						<th><strong>전화번호</strong></th>
						<td>
							<input type="hidden" name="tel_no" value="" />
							<input type="text" name="tel_no1" value="" class="txt sshort" maxlength="6" style="text-align: right;IME-MODE:disabled;" onkeypress="NumberCheck(this)" onpaste="return false;" /> &nbsp;-&nbsp;
							<input type="text" name="tel_no2" value="" class="txt sshort" maxlength="4" style="text-align: left;IME-MODE:disabled;" onkeypress="NumberCheck(this)" onkeyup="fnNextFeild(this, 'tel_no3');" onpaste="return false;" /> &nbsp;-&nbsp;
							<input type="text" name="tel_no3" value="" class="txt sshort" maxlength="4" style="text-align: left;IME-MODE:disabled;" onkeypress="NumberCheck(this)" onkeyup="fnNextFeild(this, 'encryp_cellphone_no1');" onpaste="return false;" />
						</td>
						<th><strong>휴대폰번호</strong></th>
						<td class="last">
						    <input type="hidden" name="encryp_cellphone_no" value="" />
							<input type="text" name="encryp_cellphone_no1" value="" class="txt sshort" maxlength="6" style="text-align: right;IME-MODE:disabled;" onkeypress="NumberCheck(this)" onpaste="return false;" /> &nbsp;-&nbsp;
							<input type="text" name="encryp_cellphone_no2" value="" class="txt sshort" maxlength="4" style="text-align: left;IME-MODE:disabled;" onkeypress="NumberCheck(this)" onkeyup="fnNextFeild(this, 'encryp_cellphone_no3');" onpaste="return false;" /> &nbsp;-&nbsp;
							<input type="text" name="encryp_cellphone_no3" value="" class="txt sshort" maxlength="4" style="text-align: left;IME-MODE:disabled;" onkeypress="NumberCheck(this)" onkeyup="fnNextFeild(this, 'encryp_email1');" onpaste="return false;" />
						</td>
					</tr>
					<tr class="last">
                        <th><strong>이메일</strong></th>
                        <td>
                            <input type="hidden" name="encryp_email" value="" />
                            <input type="text" name="encryp_email1" value="" class="txt short"  style="text-align: right;IME-MODE:disabled;" onkeypress="fn_emailFrontCheck()" onkeyup="byteCheck(this, 40)" maxlength="40" onpaste="return false;"> &nbsp;@&nbsp;
                            <input type="text" name="encryp_email2" value="" class="txt middle" style="text-align: left;IME-MODE:disabled;" onkeypress="fn_emailBackCheck()" onkeyup="byteCheck(this, 40)" maxlength="40" onpaste="return false;">
                        </td>
						<th>팩스번호</th>
						<td class="last">
							<input type="hidden" name="fax_no" value="" />
							<input type="text" name="fax_no1" value="" class="txt sshort" maxlength="6" style="text-align: right;IME-MODE:disabled;" onkeypress="NumberCheck(this)" onpaste="return false;" /> &nbsp;-&nbsp;
							<input type="text" name="fax_no2" value="" class="txt sshort" maxlength="4" style="text-align: left;IME-MODE:disabled;" onkeypress="NumberCheck(this)" onkeyup="fnNextFeild(this, 'fax_no3');" onpaste="return false;" /> &nbsp;-&nbsp;
							<input type="text" name="fax_no3" value="" class="txt sshort" maxlength="4" style="text-align: left;IME-MODE:disabled;" onkeypress="NumberCheck(this)" onpaste="return false;" />
						</td>
					</tr>
				</tbody>
			</table>
            </div>
            <div id="fileList">
            <table summary="목록" class="input type-00 list mt5">
                <caption>목록</caption>
                <colgroup>
                    <col style="width: 250px;">
                    <col style="width: 590px;">
                    <col style="width: *;">
                </colgroup>
                <thead>
                    <tr>
                        <th class="first">파일구분</th>
                        <th class="txc" colspan="2">파일명</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="first">
                        <td class="first"><input type="hidden" name="bdchrg_appl_doc_cd" value="04" /><input type="hidden" name="doc_bdchrg_tp_cd" value="" />
                          <img src="/images/btn_a1.png" alt="필수" style="vertical-align: top;" />&nbsp;
                          <font size="3">상장채권 신고권한 위임장</font>
                        </td>
                        <td class="last"><input type="text" name="attach_file_nm[0]" readonly style="width: 300px; height:20px; vertical-align: 6px;" class="file_input_textbox" />
                            <div style="display:flex;">
                                <div class="file_input_div"><img src="/images/btn_find.gif" name="file_1" class="file_input_img_btn" style="margin-top: -5px" alt="open" />
                                <input type="file" name="attachFiles[0]" style="width:91px; height:20px;" onchange="fn_getFileNm(0);" class="file_input_hidden" /></div>
                                &nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="fn_downloadDoc('122', '상장채권 신고권한 위임장');" class="btn-sprite type-10 vmiddle"><span>서식다운로드</span></a>
                            </div>
                        </td>
                        <td class="last" rowspan="3">
				            <ul class="msg type-00">
				                <li style="font-size: 14px;"><b>재직증명서 등에 <font color="red">"주소", "주민등록번호"</font> 등 불필요한 개인정보가 있다면 반드시<br />이를 <font color="red">가린(마스킹) 후 첨부</font>하여 주시기 바랍니다.</b></li>
				            </ui>
                        </td>
                    </tr>
                    <tr>
                        <td class="first"><input type="hidden" name="bdchrg_appl_doc_cd" value="05" /><input type="hidden" name="doc_bdchrg_tp_cd" value="" />
                          <img src="/images/btn_a1.png" alt="필수" style="vertical-align: top;" />&nbsp;&nbsp;
                          <font size="3">개인정보동의서</font>
                        </td>
                        <td class="last"><input type="text" name="attach_file_nm[1]" readonly style="width: 300px; height:20px; vertical-align: 6px;" class="file_input_textbox" />
                            <div style="display:flex;">
                                <div class="file_input_div" style="vertical-align: top;"><img src="/images/btn_find.gif" name="file_1" class="file_input_img_btn" style="margin-top: -5px" alt="open" />
                                <input type="file" name="attachFiles[1]" style="width:91px; height:20px;" onchange="fn_getFileNm(1);" class="file_input_hidden" /></div>
                                &nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="fn_downloadDoc('123', '개인정보동의서');" class="btn-sprite type-10 vmiddle"><span>서식다운로드</span></a>
                            </div>
                        </td>
                    </tr>
                    <tr class="last">
                        <td class="first"><input type="hidden" name="bdchrg_appl_doc_cd" value="06" /><input type="hidden" name="doc_bdchrg_tp_cd" value="" />
                          <img src="/images/btn_a1.png" alt="필수" style="vertical-align: middle;" />&nbsp;&nbsp;
                          <font size="3">재직증명서</font>
                        </td>
                        <td class="last"><input type="text" name="attach_file_nm[2]" readonly style="width: 300px; height:20px; vertical-align: 6px;" class="file_input_textbox" />
                            <div class="file_input_div"><img src="/images/btn_find.gif" name="file_1" class="file_input_img_btn" style="margin-top: -5px" alt="open" />
                            <input type="file" name="attachFiles[2]" style="width:91px; height:20px;" onchange="fn_getFileNm(2);" class="file_input_hidden" /></div>
                        </td>
                    </tr>
                </tbody>
            </table>
            </div>

			<div class="btn-group type-00">
				<a href="javascript:void(0);" onclick="fn_Update();" class="btn-sprite type-02 vmiddle"><span>수 정</span></a>&nbsp;&nbsp;
				<!-- <a href="javascript:void(0);" onclick="fnReset();" class="btn-sprite type-02 vmiddle"><span>취 소</span></a> -->
			</div>

		</div>
	</div>
</form>
<form name="fileDownForm" method="post">
    <input type="hidden" name="contnId" value="" />
    <input type="hidden" name="cmNotiClssCd" value="4" />
</form>

<script language="javascript">
    function setTelNo(pTelNo){
        if(pTelNo != null && pTelNo != ''){
            var pTelNoArr = pTelNo.split('-');
            if(pTelNoArr.length == 3){
                //전화번호의 국번필드는 입력하지 않을경우 '00'으로 자동저장
                if(pTelNoArr[0] == "00"){
                    $("input[name='tel_no1']").val("");
                }else{
                    $("input[name='tel_no1']").val(pTelNoArr[0]);
                }
                $("input[name='tel_no2']").val(pTelNoArr[1]);
                $("input[name='tel_no3']").val(pTelNoArr[2]);
            } else {
            }
        }
    }
    function setCellphoneNo(pCellphoneNo){
        if(pCellphoneNo != null && pCellphoneNo != ''){
            var pCellphoneNoArr = pCellphoneNo.split('-');
            if(pCellphoneNoArr.length == 3){
                $("input[name='encryp_cellphone_no1']").val(pCellphoneNoArr[0]);
                $("input[name='encryp_cellphone_no2']").val(pCellphoneNoArr[1]);
                $("input[name='encryp_cellphone_no3']").val(pCellphoneNoArr[2]);
            } else {
            }
        }
    }
    function setEmail(pEmail){
        if(pEmail != null && pEmail != ''){
            var pEmailArr = pEmail.split('@');
            if(pEmailArr.length == 2){
                $("input[name='encryp_email1']").val(pEmailArr[0]);
                $("input[name='encryp_email2']").val(pEmailArr[1]);
            }else{
            }
        }
    }
    function setFaxNo(pFaxNo){
        if(pFaxNo != null && pFaxNo != ''){
            var pFaxNoArr = pFaxNo.split('-');
            if(pFaxNoArr.length == 3){
                //전화번호의 국번필드는 입력하지 않을경우 '00'으로 자동저장
                if(pFaxNoArr[0] == "00"){
                    $("input[name='fax_no1']").val("");
                }else{
                    $("input[name='fax_no1']").val(pFaxNoArr[0]);
                }
                $("input[name='fax_no2']").val(pFaxNoArr[1]);
                $("input[name='fax_no3']").val(pFaxNoArr[2]);
            } else {
            }
        }
    }

    function fn_chkData()
    {
        var SendForm = document.SendForm;

        if ( SendForm.chrg_nm.value.trim() == "" ){
            alert("이름을 입력하세요.");
            SendForm.chrg_nm.focus();
            return false;
        }
        if ( SendForm.jobpos_nm.value.trim() == "" ){
            alert("직책을 입력하세요.");
            SendForm.jobpos_nm.focus();
            return false;
        }
        if ( SendForm.belng_inst_nm.value.trim() == "" ){
            alert("소속기관을 입력하세요.");
            SendForm.belng_inst_nm.focus();
            return false;
        }
        if ( SendForm.belng_dep_nm.value.trim() == "" ){
            alert("소속부서를 입력하세요.");
            SendForm.belng_dep_nm.focus();
            return false;
        }
        if ( SendForm.tel_no2.value == "" ){
            alert("전화번호를 입력하세요.");
            SendForm.tel_no2.focus();
            return false;
        }
        if ( SendForm.tel_no3.value == "" ){
            alert("전화번호를 입력하세요.");
            SendForm.tel_no3.focus();
            return false;
        }
        if ( SendForm.encryp_cellphone_no1.value == "" ){
            alert("휴대전화번호를 입력하세요.");
            SendForm.encryp_cellphone_no1.focus();
            return false;
        }
        if ( SendForm.encryp_cellphone_no2.value == "" ){
            alert("휴대전화번호를 입력하세요.");
            SendForm.encryp_cellphone_no2.focus();
            return false;
        }
        if ( SendForm.encryp_cellphone_no3.value == "" ){
            alert("휴대전화번호를 입력하세요.");
            SendForm.encryp_cellphone_no3.focus();
            return false;
        }
        if ( SendForm.encryp_email1.value == "" ){
            alert("이메일을 입력하세요.");
            SendForm.encryp_email1.focus();
            return false;
        }
        if ( SendForm.encryp_email2.value == "" ){
            alert("이메일을 입력하세요.");
            SendForm.encryp_email2.focus();
            return false;
        }

	    const addNew = $("input[name='addNew']").val();
	    if( addNew == "ADD" ){
            // 담당자가 다른이로 변경되는 경우는 담당자구분은 수정할 수 없다.
            if( SendForm.bf_bdchrg_tp_cd.value != SendForm.bdchrg_tp_cd.value ){
                alert("담당자구분은 변경할 수 없습니다.");
                $("#bdchrg_tp_cd").val(endForm.bf_bdchrg_tp_cd.value).prop("selected", true);
                return false;
            }

            if( "Y" != SendForm.bdchrgRegNoFileInstYn.value ){
                // 첨부파일 입력여부 체크
                const attach_file = document.getElementsByName("bdchrg_appl_doc_cd");
                for(var i=0; i < attach_file.length; i++){
                    if( $("input[name='attach_file_nm["+i+"]']").val() == "" ){
                        alert("필수 첨부파일을 입력하세요.");
                        $("input[name='attach_file_nm["+i+"]']").focus();
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // 전화번호 등을 세팅
    function setCellphoneNoEtc(){
        var SendForm = document.SendForm;

        // 국번은 필수항목에서 제외하고, 미입력 시 00 세팅
        if ( GetByte(SendForm.tel_no1.value) == 0 ){
            SendForm.tel_no1.value = "00";
        }
        if( SendForm.fax_no1.value != "" || SendForm.fax_no2.value != "" || SendForm.fax_no3.value != ""){
            SendForm.fax_no.value = SendForm.fax_no1.value + '-' + SendForm.fax_no2.value + '-' + SendForm.fax_no3.value;
        }

	    SendForm.tel_no.value = SendForm.tel_no1.value + '-' + SendForm.tel_no2.value + '-' + SendForm.tel_no3.value;
	    SendForm.encryp_email.value = SendForm.encryp_email1.value + '@' + SendForm.encryp_email2.value;
	    SendForm.encryp_cellphone_no.value = SendForm.encryp_cellphone_no1.value + "-" + SendForm.encryp_cellphone_no2.value + "-" + SendForm.encryp_cellphone_no3.value;
    }

</script>