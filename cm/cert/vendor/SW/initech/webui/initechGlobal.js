/*************************************************************************************
 # Copyright(c) Initech
 # 설명 : 스크립트 Global 함수 js
 # 이력
  - [2016-12-21] : 최초 구현
  - [2019-06-21] : 업데이트
*************************************************************************************/
var GINI_HTML5_CONFIG_PATH = INI_html5BasePath+"/conf/customerConf.json?bust=" + new Date().getTime();
var GINI_HTML5_BASE_PATH = INI_html5BasePath;
var GINI_HTML5_SCRIPT_BASE_PATH = INI_html5BasePath;

var J ='';		// initech jquery 지시자
var GINI_selectedCertificateRow = 1;
var GINI_External_Response_Factory;
var GINI_certificateListSortStatus = [];

// String trim 함수정의(ie8)
(function() {
	if(typeof String.prototype.trim !== 'function') {
	    String.prototype.trim = function() {
	        return this.replace(/^\s+|\s+$/g, '');
	    };
	}
}());


function iniGDebugLog(msg) {
	if ( sessionStorage ) {
		if ( sessionStorage.INITECHGLOBAL_LOG === 'true' ) {
			console.log(msg);
		}
	}
}

/* GINI_OPTION Parameter 항목
 * 1. 전자서명
 *  - HASH_ALG : 해시 알고리즘
 *  - SIGN_KIND : PKCS7, PKCS1
 *  - SERVER_TIME : yyyymmddhhMMss
 *  - SERVER_TIMEURL : 서버url주소
 *  - YESSIGN_TYPE : true(금결원포맷), false
 *  - IN_VID : true(unauthenticatedAttributes에 VIDRandom포함), false
 *  - SECURE_NONCE : SFilter프로토콜 인증
 *  - UNAUTH_ATTR : 추가정보
 *  - USIM_FILTER_INFO : 스마트인증 필터 정보
 *  - CHAR_SET : 문자
 *  - RSA_PSS_SIGN : true(RSA PSS서명), false
 *  - REMOVE_CONTENT : true(원문제거), false
 *  - REMOVE_CERTIFICATE : true(인증서제거), false
 * 2. 인증서
 *  - CERT_VIEW_TYPE :
 *  - USE_SESSION : true(세션스토리지 사용), false
 */
var getDialogSubForm = function(contentUrl, handleInfo) {

	J.ajax({
        'url': contentUrl,
        tryCount :0
		,retryLimit :1
		,'error': function(xhr, status, error){
			this.tryCount++;
			if(this.tryCount <= this.retryLimit){
				J.ajax(this);
				return;
			}
			console.error(
					"code:"		+xhr.status+"\n"+
					"message:"	+xhr.responseText+"\n"+
					"status:"	+status+"\n"+
					"error:"	+error);
			return;
		},
        'success': function success(data, textStatus, xhr) {
        	J("#INI_subModalDialog").removeData("GINI_handleInfo");
        	J("<div id='INI_subModalDialog'>" + data + "</div>").data("GINI_handleInfo", handleInfo).dialog({
            	"modal": true,
                "width": '318px',
                "height": 'auto',
                "resizable":false,
                "closeOnEscape": false,
                "stack": false,
                "show" :{
                	effect:"puff",
                    duration:400,
                    complete:function() {
                    }
                },
                "position": {
                	my: "center",
                	at: "center",
                	of: window,
                	collision: "none"
                },
                "create": function(event, ui){
                    J(event.target).parent().css('position', 'fixed');
                },
                "open": function(event, ui){
                	J(".ini-ui-dialog-titlebar").hide();
                	setSecondDialogStyle( "INI_subModalDialog" );
                },
                "close": function (e, ui) {
                	J("#INI_subModalDialog").dialog('close');
                	J("#INI_subModalDialog").removeData("GINI_handleInfo");
                	J(this).remove();
            	}
            });
        }
    });
};


var GINI_IndicatorWatcher = (function(){
	var indicatorIsRun = false;
	var indicatorWaitTime = 0;
	var IndicatorIDList = {};

	var initializeIndicator = function(){
		indicatorWaitTime = 0;
		try{
			if(indicatorIsRun){
				indicatorIsRun = false;
				GINI_LoadingIndicatorStop();
			}
		}catch(e){
			exlog("GINI_IndicatorWatcher", "initializeIndicator : " + e);
		}

	};

	var monitoringIndicator = function(watching){
		function watchIndicator(){
			indicatorWaitTime++;
			if(indicatorIsRun && (indicatorWaitTime>watching)){
				//var ok = confirm("["+indicatorIsRun+"]인증서 발급이 지연되고 있습니다. 계속 기다리시겠습니까?");
				var ok = false;
				if (ok == true) {
					indicatorWaitTime = 0;
					setTimeout(watchIndicator, 100);
				} else {
					initializeIndicator();
					//alert("인증서 발급이 취소 되었습니다. 다시 시도하여 주세요.");
				}
			}else if(indicatorIsRun){
				setTimeout(watchIndicator, 100);
			}else {
				initializeIndicator();
			}
		};

		if(!indicatorIsRun){
			indicatorIsRun = true;
			setTimeout(watchIndicator, 100);
		}
	};

	var isRunning = function(){
		return indicatorIsRun;
	};

	var CheckDefaultID = function(id) {
		if ( typeof id === "undefined" || id === null ) {
			return "default";		
		}
		return id;
	}

	var CheckStopIndicator = function(StopId) {
		
		var checkID = CheckDefaultID(StopId);

		if ( StopId === 'all') {
			for ( id in IndicatorIDList ) {
				IndicatorIDList[id] = false;
			}
			return true;
		}

		for ( id in IndicatorIDList ) {
			if ( checkID !== id && IndicatorIDList[id] === true ) {
				IndicatorIDList[checkID] = false;
				return false;
			}
		}

		IndicatorIDList[checkID] = false;
		return true;
	}

	var SetIndicatorID = function(id, isrun){
		var IndicatorID = CheckDefaultID(id);

		if ( typeof isrun !== "undefined" ){
			IndicatorIDList[IndicatorID] = isrun;
		} else {
			IndicatorIDList[IndicatorID] = true;
		}
	}

	return {
		monitoringIndicator : monitoringIndicator,
		initializeIndicator : initializeIndicator,
		isRunning : isRunning,
		CheckStopIndicator : CheckStopIndicator,
		SetIndicatorID : SetIndicatorID
	}
}());

var GINI_loadingIndicatorStartInterceptor;
var GINI_loadingIndicatorStopInterceptor;

function GINI_loadingIndicatorInit(start, end){
	GINI_loadingIndicatorStartInterceptor = start; ;
	GINI_loadingIndicatorStopInterceptor = end; ;
}



function GINI_LoadingIndicatorStart(text, watching, id){
	
	if (GINI_loadingIndicatorStartInterceptor) GINI_loadingIndicatorStartInterceptor();
	if( text == undefined || text == "" )
	text = 'Loading...';

	// native javascript
	var mm = null;

	if( document.getElementById("resultLoading") != null ){
		mm = document.getElementById("resultLoading").getAttribute('id');
	}

	if( mm == undefined || mm != 'resultLoading'){
		/* 메세지 처리 공통 처리 */

		var subText = "Please wait...";	// 잠시만 기다려주시기 바랍니다

		var html = "";
		html += '<div id="resultLoading" style="display:none">';
		html += 	'<div class="ini_cert_loading"><img alt="Loading..." src="' + GINI_HTML5_BASE_PATH + '/res/img/color_identity_blue/img_loading.gif">';
		html += 	'<p><b><em style="color:rgba(43, 64, 170, 1); font-weight:bold; font-size:16px;">'+text+'</em></b></p>'
		html += 	'<p><b><em style="font-size:11px;">'+subText+'</em></b></p> </div>'
		html += 	'<div class="ini_bg"></div>';
		html +=	 '</div>';

		var divNode = document.createElement("div");
		divNode.innerHTML = html;

		try{
			document.body.appendChild(divNode);
			
		}catch(e){
			exlog("GINI_LoadingIndicatorStart", "appendChild : " + e);
		}
	}

	GINI_createMask();

	var m1 = document.getElementById("resultLoading"), c1 = m1.style;
	c1.width = "50%";
	c1.height = "50%";
	c1.position = "fixed";
	c1.zIndex = '10000000';
	c1.margin = 'auto';
	c1.top = '0';
	c1.left = '0';
	c1.right = '0';
	c1.bottom = '0';

	var m3 = document.querySelectorAll("#resultLoading>div");
	var c3 = m3[0].style;

	c3.width = "238px";
	c3.height = "97px";
	c3.textAlign = 'center';
	c3.position = "fixed";
	c3.top = '0';

	c3.left = '0';
	c3.right = '0';
	c3.bottom = '0';
	c3.margin = 'auto';
	c3.zIndex = '10000001';

	c3.fontSize = '15px';
	c3.fontFamily  = '맑은 고딕';
	c3.lineHeight = '25px';
	c3.backgroundColor = '#fff';
	c3.opacity = '0.9';

	c3.border	='1px solid';
	c3.borderColor='rgba(35, 132, 217, 1)';

    m1.style.display = 'block';
	document.body.style.cursor = "wait";
	
	GINI_IndicatorWatcher.SetIndicatorID(id, true);
	
	if( (typeof watching !== "undefined" && watching > 0 ) && 
		!GINI_IndicatorWatcher.isRunning()){
		iniGDebugLog("watching indicator start");
    	setTimeout(
    			function (){
    				GINI_IndicatorWatcher.monitoringIndicator(watching, id)
    			}
    	, 10);
	}
	
}

function GINI_LoadingIndicatorStop(id){

	if ( ! GINI_IndicatorWatcher.CheckStopIndicator(id)) {
		iniGDebugLog("Skip indicator stop : " + id);
		return ;
	}
	

	if (GINI_loadingIndicatorStopInterceptor) GINI_loadingIndicatorStopInterceptor();
	GINI_IndicatorWatcher.initializeIndicator();

	J('#resultLoading .bg').height('100%');
	J('#resultLoading').hide();
	J('body').css('cursor', 'default');
	J("#initech_loading_mask").fadeOut('fast','swing');
	
}

/**
 * @description indicator 표시 상태에서 버튼 클릭 방기 하기 위한 masking div 생성 및 관리
 */
function GINI_createMask() {
	
	var main_width = J('#initech_certificate_wrap').width();
	var main_height = J('#initech_certificate_wrap').height();
	var mask = J("#initech_loading_mask");
	
	// masking div가 존재할 경우
	if (mask.length > 0) {
		mask.css({'width': main_width, 'height':main_height});
		mask.show();
	} else {
		var html = '<div id="initech_loading_mask" class="loading_mask">';
		J(html).appendTo('#initech_certificate_wrap');

		mask = J("#initech_loading_mask");
		if(mask.length > 0) {
			mask.css({
				'width':main_width, 
				'height':main_height, 
				'position': 'absolute', 
				'z-index':9999, 
				'background-color': '#ffffff', 
				'opacity': 0
			});
		}

	}
}

/**
 * @description indicator 발생 시 저장소 버튼 및 관리 버튼 disabled 처리 
 * @param {*} status / true 이면 disabled false 이면 enable 처리
 */
function GINI_setElement(status) {

	// 저장매체 버튼 관리
	var storage = J('#INI_storage_list').find('li').not('.list_select');
	if (status) {
		storage.each(function(index){
			J(this).addClass('data_disabled');
		})	 
	} else {
		storage.each(function(index){
			var tagA = J(this).find('a');
			if (tagA.css('pointer-events')) {
				J(this).removeClass('data_disabled');	
			}
		})
	}
	
	//인증서 관리 버튼 관리
	var cert_manage = J("#certificate_manage").find('li');
	iniGDebugLog("cert_manage :" , cert_manage);
	if (status) {
		cert_manage.each(function(index){
			J(this).click(false);
			J(this).addClass('data_disabled');

		})
	} else {
		cert_manage.each(function(index){
			J(this).click(true);
			J(this).removeClass('data_disabled');
		})
	}
}

/*
 * DESC	:	메세지 출력 공통 msg_type 별 디자인이 변경됨.
 * TYPE	:	CERT	- 인증서 발급 완료 시.
 * 			NOIT	- 공지시 사용.
 * 			CONF	- 확인 처리시.
 * 			ERROR	- 에러 발생시.
 * DATE	: 2016.12.07
 */
function INI_ALERT(output_msg, msg_type, INI_popupHandleInfo){
	return cwui.INI_ALERT(output_msg, msg_type, INI_popupHandleInfo);
}

function INI_DOWNLOAD_CONFIRM(output_msg, downloadUrl){
	return cwui.INI_DOWNLOAD_CONFIRM(output_msg, downloadUrl);
}

function INI_CONFIRM(output_msg, msg_type, INI_popupHandleInfo){
	return cwui.INI_CONFIRM(output_msg, msg_type, INI_popupHandleInfo);
}

// 기본적인 언어셋팅
var INI_LANGUAGE_HANDLE = (function(){

//	var language = "eng";
	var language = "kor";

	var setSystemLanguage = function(_language){
		language = _language;
		cwui.defaultConf.System.Language = _language;
	};

	var getSystemLanguage = function(){
		return language;
	};

	return {
		setSystemLanguage : setSystemLanguage,
		getSystemLanguage : getSystemLanguage,
	}
}());

var INI_INIHUB_HANDLE = (function (){
	var setUseInihub = function (flag) {
		cwui.defaultConf.System.UseInihub = flag;
	};
	var setContanierRect = function (rect) {
		if(cwui.defaultConf.System.iniHubInfo) {
			cwui.defaultConf.System.iniHubInfo.contanerRect = {
				left: rect.left,
				top: rect.top,
				height: rect.height,
				width: rect.width,
			};
		}
	};

	return {
		setUseInihub : setUseInihub,
		setContanierRect: setContanierRect
	}
}());

var INI_HANDLE = (function() {

	/**
	 * @desc : Exception 처리
	 */
	// [18.11.07] Namsu change - 세번째 파라미터를 추가하여 메시창 버튼 처리 Handler를 지정할 수 있도록 변경
	function handleMessage(ex, message, msgPopupHandler){
		var console = window.console || {log:function(){}};
		GINI_LoadingIndicatorStop('all');
		if(message!==undefined){
			if ( msgPopupHandler ) {
				INI_ALERT(message, ex.type, msgPopupHandler);
			}
			else {
				INI_ALERT(message);
			}
		} else {
			if(ex){
				switch(ex.type){
				case 'error' :
					break;
				case 'warn' :
					break;
				case 'info' :
					break;
				}
				if(ex.message){
					if (ex.message.indexOf("null") < 0 ) INI_ALERT(ex.message);
				}
			}
		}
	}

	/**
	 * @desc : 비동기 알림 메시지
	 */
	var infoMessage = function(message, msgPoupHandler){
		var ex = {};
		ex['type'] = 'info';
		handleMessage(ex, message, msgPoupHandler);
	};

	/**
	 * @desc : 비동기 알림 메시지
	 */
	// [18.11.07] Namsu change - 두번째 파라미터를 추가하여 메시지 버튼 처리 Handler를 같이 지정할 수 있도록 변경
	var warnMessage = function(message, msgPoupHandler){
		var ex = {};
		ex['type'] = 'warn';
		handleMessage(ex, message, msgPoupHandler);
	};

	/**
	 * @desc : 비동기 오류 처리
	 */
	var errorMessage = function(ex, msg, detail){
		if(detail !== undefined){
			msg = msg + '\n' + detail;
		}
		handleMessage(ex, msg);
	};

	return {
		infoMessage : infoMessage,
		warnMessage : warnMessage,
		errorMessage : errorMessage,
		handleMessage : handleMessage
	};
}());

var GINI_ProtectMgr = {};

//#############################################################################################################
/**
 * @desc : 제품 연동을 위한 콜백 처리 함수
 */
var GINI_StandbyCallBack = (function(){
	/* 콜백 저장 객체*/
	var _callback = {};
	var _exceptionCallback = {};

	/**
	 * @desc : transaction단위 콜백 보관
	 */
	var setCallback = function(transactionId, callback){
		_callback[transactionId] = callback;
	};

	/**
	 * @desc : 콜백 제공
	 */
	var getCallback = function(transactionId){
		return _callback[transactionId];
	};

	/**
	 * @desc : transaction단위 후처리 함수 보관
	 */
	var setExceptionCallback = function(transactionId, exceptionCallback){
		_exceptionCallback[transactionId] = exceptionCallback;
	};

	/**
	 * @desc : 후처리 함수 제공
	 */
	var getExceptionCallback = function(transactionId){
		return _exceptionCallback[transactionId];
	};

	return{
		setCallback : setCallback,
		getCallback : getCallback,
		setExceptionCallback : setExceptionCallback,
		getExceptionCallback : getExceptionCallback
	};
}());

/**
 * 키보드 보안 초기화
 */
var GINI_KeyboardEX_Initialize = function(callback){
};

//스크롤
var INI_mScroll;

function INI_msLoad () {
	INI_mScroll = new IScroll('#m_ini_cert_wrap', {
		scrollbars: true,
		mouseWheel: true,
		interactiveScrollbars: true,
		shrinkScrollbars: 'scale',
		fadeScrollbars: true
	});
}

function INI_maxLengthCheck(object){
	if(object.value.length > object.maxLength){
		object.value = object.value.slice(0, object.maxLength);
	}
}

function INI_onlyNumber(event){
	event = event || window.event;
	var keyID = (event.witch) ? event.witch : event.keyCode;
if((keyID >= 48 && keyID <= 57) ||
		(keyID >= 96 && keyID <= 105) ||
		keyID == 8 ||
		keyID == 9 ||
		keyID == 46 ||
		keyID == 37 ||
		keyID == 39 ||
		keyID == 13){
		return;
	}
	else {
		return false;
	}
}

function INI_removeChar(event){
	event = event || window.event;
	var keyID = (event.witch) ? event.witch : event.keyCode;
	if(keyID == 8 ||
		keyID == 9 ||
		keyID == 46 ||
		keyID == 37 ||
		keyID == 39){
		return;
	}
	else {
		event.target.value = event.target.value.replace(/[^0-9]/g,"");
	}
}

var INI_SESSION_STORAGE_HANDLER = (function(){
	var sessionInfo;
	function getSessionStorageInfo(){
		if(sessionStorage && sessionStorage.SELECTED_CERT_INFO){
			sessionInfo = JSON.parse(sessionStorage.SELECTED_CERT_INFO);
		}
		return sessionInfo;
	}

	var getLoginDevice = function(){
		if(!getSessionStorageInfo()){
			return;
		}
		return sessionInfo.deviceId;
	};

	var getLoginCertId = function(){
		if(!getSessionStorageInfo()){
			return;
		}
		return sessionInfo.certId;
	};

	return {
		getLoginDevice : getLoginDevice,
		getLoginCertId : getLoginCertId,
	}
}());

//전자서명 창 컨트롤
var INI_PLAINTEXT_VIEW_HANDLER = (function(){

//	안보임 :: NONE
//	그리드 타입 :: GRID
//	텍스트 타입 :: TEXT
	var plaintextViewType = undefined;

	var setPlaintextViewType = function(_plaintextViewType){
		plaintextViewType = _plaintextViewType;
	};

	var getPlaintextViewType = function(){
		return plaintextViewType;
	};

	return {
		setPlaintextViewType : setPlaintextViewType,
		getPlaintextViewType : getPlaintextViewType,
	}
}());

var isInputPWEmpty = function( val){
	if(val =="" || val == null || val ==undefined){
		return true;
	}else{
		return false;
	}
};

function showCertImminentDay( certObj , certImmiText,  preText , sufixText ){
	// 기존 툴팁 선제거
	J(".data_finish_message").remove();

	//인증서 임박 tooltip 표출
	var certStatusText	= certObj.find(".ico").text();
	var expiredDay		= certObj.find("td:eq(2)").text();
	var arrEx				= expiredDay.split("-");
	var nowDate			= new Date();
	var expiredDate		= new Date(arrEx[0],arrEx[1]-1,arrEx[2]);
	var gap					= expiredDate.getTime() - nowDate.getTime();
	var imminentDay		= Math.floor( gap / ( 1000 * 60 * 60*24) );

	if( certStatusText === certImmiText ){
		var certImminentHtml = "<div style ='z-index : 9999; position:fixed' class='data_finish_message' id='data_finish_message' tabindex='0'>"
			+ preText + expiredDay
			+ sufixText
			+" <i class='arr add_rotate'></i>"
			+"</div>";
		var tdObj =certObj.find("td:eq(1)");
		tdObj.append(certImminentHtml );
		var xpos = tdObj.offset().left;
		var ypos = tdObj.offset().top;
		var height = tdObj.height();
		var width = tdObj.width();
		//J("body").append(certImminentHtml);

		try{
			J("#data_finish_message").show();
			J("#data_finish_message").offset({left : xpos    , top : ypos + height + 1});
		}catch(e){
			exlog("showCertImminentDay", "data_finish_message : " + e);
		}
	}
}
function hideCertImminentDay(){

	J(".data_finish_message").remove();
}

function showCapsLockAlert( inputObj, Text){
	// 기존 툴팁 선제거
	J(".capslock_message").remove();

	var certImminentHtml = "<div style ='z-index : 9999; position:fixed' class='capslock_message' id='capslock_message' tabindex='0'>"
			+ Text
			+"</div>";
	var tdObj = inputObj;
	tdObj.append(certImminentHtml );
	var xpos = tdObj.offset().left;
	var ypos = tdObj.offset().top;
	var height = tdObj.height();

	try{
		J("#capslock_message").show();
		J("#capslock_message").offset({left : xpos    , top : ypos - height - 2});
	}catch(e){
		exlog("showCapsLockAlert", "capslock_message : " + e);
	}
}
function hideCapsLockAlert(){

	J(".capslock_message").remove();
}

//----------------------------------------정범교SORT---------------------------------------
var INI_sort_dvs = "";
var INI_sort_state = "";
function CertGridKeyDown(e, value, headerArr, ascTxt, dscTxt) {
	if(e.keyCode == 13) {
		certGridSolt(value, headerArr, ascTxt, dscTxt);
	}
}
function certGridSolt(value, headerArr, ascTxt, dscTxt){

	//정렬상태 치환 및 아이콘 변경
	if(INI_sort_dvs == value){
		if(INI_sort_state == "desc" || INI_sort_state == ""){
			INI_sort_state = "asc";
			J("#INI_sort_span_" + value).html('<img width="8" src="' + GINI_HTML5_BASE_PATH + '/res/img/icon/btn_grid_sort_up.png" alt="' + ascTxt + '">');
		}else{
			INI_sort_state = "desc";
			J("#INI_sort_span_" + value).html('<img width="8" src="' + GINI_HTML5_BASE_PATH + '/res/img/icon/btn_grid_sort_down.png" alt="' + dscTxt + '">');
		}
	}else{
		if(INI_sort_dvs != ""){
			J("#INI_sort_span_" + INI_sort_dvs).html('<img width="8" src="' + GINI_HTML5_BASE_PATH + '/res/img/icon/btn_grid_sort_cancel.png" alt="">');
		}
		J("#INI_sort_span_" + value).html('<img width="8" src="' + GINI_HTML5_BASE_PATH + '/res/img/icon/btn_grid_sort_up.png" alt="' + ascTxt + '">');
		INI_sort_dvs = value;
		INI_sort_state = "asc";
	}

	var headerList = [];
	var tempArr = headerArr.split(','); //설정된 테이블 헤더값 순서
	for(var k in tempArr)
	{
		headerList.push(tempArr[k]);
	}

	var sortList = []; //정렬할 대상 리스트

	J("#INI_certList tbody tr").each(function(index) {
		J(this).removeClass("active");//전체 포커스 삭제
		var eachTrRow = J("#INI_certList tbody>tr").get(index);
		var eachTrId = eachTrRow.id;
		var eachTrRowHtml = eachTrRow.outerHTML;
		var sortTrTdText = "";

		if(value == "gubun"){
			sortTrTdText = J(this).find("td:eq("+headerList.indexOf(value)+")").find("span:eq(1)").text();
		}else{
			sortTrTdText = J(this).find("td:eq("+headerList.indexOf(value)+")").find("a").text();
		}

		//id당 정렬할 대상을 리스트에 넣음
		var sObj = {};
		sObj["id"] = eachTrId;
		sObj["value"] = sortTrTdText;
		sObj["html"] = eachTrRowHtml;
		sortList.push(sObj);

	});

	if(INI_sort_state == "asc"){ // 오름차순
		sortList.sort(function(a, b) {
		    return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
		});
	}else{ // 내림차순
		sortList.sort(function(a, b) {
		    return a.value > b.value ? -1 : a.value < b.value ? 1 : 0;
		});
	}

	var html = "";
	for(var i in sortList)
	{
		html += sortList[i].html;
	}
	J("#INI_certList tbody").html(html);
	J('#INI_certList tbody').find("tr:eq(0)").addClass("active");//첫번째줄 포커스
}
