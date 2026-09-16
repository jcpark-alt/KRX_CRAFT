/**
 * @desc : 사용자의 서비스 단위 핸들 정보를 관리 한다.
 */

var GINI_SecureKeyPad_BasePath = '';
/* 가상키패드 경로 */
var GINI_VirtualKeyPad_BasePath = '';
/* Extension PKI */
var GINI_ExtensionPKI_BasePath = '/cw/initech/extension';
	
try{
	if(crosswebexBaseDir){
		GINI_ExtensionPKI_BasePath = crosswebexBaseDir;
	}
} catch (e){
	exlog("crosswebexBaseDir error : ", e);
}


var GINI_3rd_Party_Control = (function(){
	
	/**
	* 초기화
	*/
	var initializePC = function(){
	};
	
	var initializeMobile = function(){
		try{
			// 인스웨이브 요청 20170111 : viewport초기화
			if(window["shbComm"] && !shbComm.isEasyService()){
				var viewport = requirejs("jquery")('meta[name=viewport]');
				if(viewport && viewport.length > 0){
					var clientWidth = document.documentElement.clientWidth;
					var winWidth = window.innerWidth;
					var initScale = parseInt(winWidth/clientWidth*10, 10)/10;
					viewport[0].setAttribute('content', 'width=1024, init-scale=' +initScale+ ', user-scalable=yes');			
				}		
			}
		}catch(e){
			exlog("initializeMobile error : ", e);
		}
	};
	
	/**
	 * CrossWeb EX V2
	 */
	var extensionPKI = (function() {
		var installed = false;
		
		var getInstalled = function(){
			return cwGetModuleInstallStatus() >= CW_STATUS_INSTALLED;
		};
		
		function setInstallStatus(install){
			installed = install;
		}
		
		var showInstallPage = function(){
			cwShowInstallPage();
		};
		
		return{
			showInstallPage : showInstallPage,
			getInstalled : getInstalled,
			setInstallStatus : setInstallStatus
		};
	}());
	
	/**
	 * 라온키보드 보안
	 */
	var keyboardE2E = (function() {
		var installed = false;
		
		var getInstalled = function(){
			return installed;
		};
		
		function setInstallStatus(install){
			if(install){
				installed = true;
			}
		};
		
		var showInstallPage = function(){
			//alert("keyboard show");
		};
		
		return{
			showInstallPage : showInstallPage,
			getInstalled : getInstalled,
			setInstallStatus : setInstallStatus
		}
	}());
	
	var completedRequireLoad = function(){
		try{
			if(!INI_getPlatformInfo().Mobile){
				if(window["shbComm"]){
					shbComm.hideProcessMessage();
				}	
			}
		}catch(e){
			console.log(e);
		}
	}
	
	return{
		extensionPKI : extensionPKI,
		keyboardE2E : keyboardE2E,
		initializePC : initializePC,
		initializeMobile : initializeMobile,
		completedRequireLoad : completedRequireLoad
	};
}());
