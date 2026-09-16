/**
 * {@link CROSSWEBEX} 구동을 위해 사용하는 전역 환경설정
 * @namespace
 * @property {boolean} debug - console log 출력여부
 * @property {boolean} debugAlert - crossex 구동중 발생하는 alert 실행 여부
 * @property {string} exEXObjName - 설치 확인 후 생성하는 객체명<br>CROSSWEBEX_EX 인터페이스로 CROSSWEBEX 객체를 생성한다.<br>{@link CROSSWEBEX_LOADING}
 * @property {string} frameName - top으로부터 현재 프레임 위치. top인 경우는 빈문자열
 * @property {object} browserInfo - 접속 브라우저 정보. 확인된 내용만 값을 갖는다.
 * @property {string} browserInfo.bit - 접속 브라우저 bit
 * @property {string} browserInfo.browser - 접속 브라우저 명
 * @property {string} browserInfo.version - 접속 브라우저 버전
 * @property {object} OSInfo - 접속 OS 정보. 확인된 내용만 값을 갖는다.
 * @property {string} OSInfo.bit - 접속 OS bit
 * @property {string} OSInfo.name - 접속 OS 명
 * @property {string} OSInfo.platform - 접속 OS 플랫폼 (Win, Mac, Linux)
 * @property {string} OSInfo.version - 접속 OS 버전
 * @property {array<object>} pluginInfo - 구동하는 플러그인정보
 * @property {string} extabid - IE/Safari/Edge 브라우저에서 사용되는 tabid. <br>document마다 고유의 tabid를 갖는다.
 * @property {number} pluginCount - 구동하는 플러그인수
 * @property {boolean} isInstalled - 플러그인 모두 설치 확인이 된 경우 true를 갖는다.
 * @property {array<object>} tmpExtArr - extension을 사용하는 브라우저에서 임시로 통신값을 저장하는 배열 
 * @property {string} json2Path - IE8이하 브라우저에서 JSON 사용을 위해 로드하는 json2.js 경로
 * @property {string} blankPath - IE 브라우저에서 iframe 초기화를 위해 로드하는 blank.html 경로<br>IE8이하에서는 iframe 구동을 위하여 필수
 */
var CROSSWEBEX_CONST = {
	"debug": false,
	"debugAlert": false,
	"exEXObjName": "CROSSWEBEX",
	"frameName": "",
	"browserInfo": "",
	"OSInfo": "",
	"pluginInfo": [],
	"extabid": "",
	"pluginCount": 0,
	"isInstalled": false,
	"tmpExtArr": [],
	"json2Path": crosswebexBaseDir + "/common/js/json2.js",
	"blankPath": crosswebexBaseDir + "/common/blank.html",
	"exLang": "KOR",						// KOR, ENG, CHN
	"exUseDaemon": true
};

var isLegacyIeOnHttp = function(){
	
		var documentMode = document.documentMode;
		if( location.protocol == "http:" ){
				if( documentMode != null && documentMode <= 9 )
					return true;
		}
		return false;
}

if(  isLegacyIeOnHttp() ){
		CROSSWEBEX_CONST.exUseDaemon = false;
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
	Object.keys = (function () {
		'use strict';
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function (obj) {
			if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [], prop, i;

			for (prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (i = 0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	}());
}

/**
 * CROSSWEBEX 객체를 생성한다.
 * 설치 확인이 끝난 이후 document에서 CrossEX를 사용하기 위하여 CROSSWEBEX 객체를 생성한다.
 * {@link CROSSWEBEX_EX}인터페이스가 {@link CROSSWEBEX} 객체로 implement된다.
 * @param {string|object} callback - loading후 결과를 리턴할 callback 함수명<br>callback argument : {@link CROSSWEBEX_LOADING_callback}
 */
var CROSSWEBEX_LOADING = function (callback) {

	if (CROSSWEBEX_CONST.pluginInfo.length <= 0) {
		if ("undefined" !== typeof INI_ALERT) {
			INI_ALERT(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_016, "WARN"); // "플러그인 체크를 실행하십시오."
		} else {
			alert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_016); // "플러그인 체크를 실행하십시오."
		}
		return;
	} else {
		if (CROSSWEBEX_CHECK.chkInfoStatus.status) {
			var chk = true;
			for (var i = 0; i < CROSSWEBEX_CONST.pluginInfo.length; i++) {
				var pluginInfo = CROSSWEBEX_CONST.pluginInfo[i];
				try {
					//eval(pluginInfo.exPluginName + " = new " + CROSSWEBEX_CONST.exEXObjName + "_EX(pluginInfo);");
					window[pluginInfo.exPluginName] = new window[CROSSWEBEX_CONST.exEXObjName + "_EX"](pluginInfo);
					exlog("_LOADING", pluginInfo.exPluginName + " = new " + CROSSWEBEX_CONST.exEXObjName + "_EX(" + pluginInfo.exPluginInfo + ");");
					//exlog("_LOADING." + pluginInfo.exPluginName, eval(pluginInfo.exPluginName));
				} catch (e) {
					exlog("_LOADING [exception]", e);
					//exalert("_LOADING [exception]", pluginInfo.exPluginName + "초기화에 실패하였습니다.");
					exalert("_LOADING [exception]");
					chk = false;
					break;
				}
			}
			CROSSWEBEX_CONST.isInstalled = chk;
			if (callback) {
				if (CROSSWEBEX_UTIL.typeEX() && window.location.protocol == "https:") {
					var cbTimeout = 100;
					setTimeout(function () { callback(chk); }, cbTimeout);
				} else {
					callback(chk);
				}
			}
		} else {
			if ("undefined" !== typeof INI_ALERT) {
				INI_ALERT(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_017, "ERROR"); // "플러그인이 모두 설치되지 않았습니다."
			} else {
				alert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_017); // "플러그인이 모두 설치되지 않았습니다."
			}

			if (callback) callback(false);
		}
	}
};
/**
 * CROSSWEBEX_LOADING_callback 함수의 콜백
 * @callback CROSSWEBEX_LOADING_callback
 * @param {boolean} isInstalled - DEVCORSSEX_CONST.isInstalled
 */

/**
 * CROSSWEBEX 프로토콜의 로컬 설치여부를 확인한다.
 * 
 */
var CROSSWEBEX_CHECK = {

	chkCallback: "",
	chkInfoStatus: { "status": false, info: [] },
	chkCurrPluginCnt: 0,

	check: function (pluginInfoArr, callback) {

		// CROSSWEBEX_CONST Initialize
		CROSSWEBEX_CONST.frameName = CROSSWEBEX_UTIL.findPath(self);
		CROSSWEBEX_CONST.OSInfo = CROSSWEBEX_UTIL.getOSInfo();
		CROSSWEBEX_CONST.browserInfo = CROSSWEBEX_UTIL.getBrowserInfo();
		exlog("_CONST.frameName", CROSSWEBEX_CONST.frameName);
		exlog("_CONST.OSInfo", CROSSWEBEX_CONST.OSInfo);
		exlog("_CONST.browserInfo", CROSSWEBEX_CONST.browserInfo);

		// generate IE tab id
		if (!CROSSWEBEX_CONST.extabid && (CROSSWEBEX_UTIL.typeEX() || CROSSWEBEX_UTIL.typePlugin())) {
			CROSSWEBEX_CONST.extabid = CROSSWEBEX_UTIL.createId();
		}

		exlog("_CHECK.check", pluginInfoArr);
		this.chkInfoStatus = { "status": false, info: [] };
		this.chkCurrPluginCnt = 0;

		if (pluginInfoArr && pluginInfoArr.length > 0) {
			var infoCnt = pluginInfoArr.length;
			CROSSWEBEX_CONST.pluginInfo = [];

			for (var i = 0; i < infoCnt; i++) {
				//firefox v53 이하일 경우 기존 xpi 파일을 설치한다.
				if(CROSSWEBEX_UTIL.isFirefox() && (Number(CROSSWEBEX_UTIL.getBrowserVer()) < 53)){
					pluginInfoArr[i].exExtensionInfo.exFirefoxExtVer = pluginInfoArr[i].exExtensionInfo.exFirefoxJpmExtVer;
					pluginInfoArr[i].exExtensionInfo.exFirefoxExtDownURL = pluginInfoArr[i].exExtensionInfo.exFirefoxJpmExtDownURL;
				}

				CROSSWEBEX_CONST.pluginInfo.push(pluginInfoArr[i]);
				var tmpInfo = { "name": pluginInfoArr[i].exPluginName };
				if (CROSSWEBEX_UTIL.typeExtension()) {
					tmpInfo.extension = false;
				}
				tmpInfo.EX = false;
				tmpInfo.client = false;
				//tmpInfo.module = pluginInfoArr[i].exModuleName;
				this.chkInfoStatus.info.push(tmpInfo);

				// check spec
				if (pluginInfoArr[i].checkSpec) {
					// check OS
					if (!CROSSWEBEX_UTIL.chkOS(CROSSWEBEX_CONST.OSInfo, pluginInfoArr[i].reqSpec.OS)) {
						exlog("_CHECK.check", "not support OS");
						if (pluginInfoArr[i].exErrSpec) pluginInfoArr[i].exErrSpec('OS', pluginInfoArr[i].reqSpec.OS);
						return;
					}
					// check Browser
					if (!CROSSWEBEX_UTIL.chkBrowser(CROSSWEBEX_CONST.browserInfo, pluginInfoArr[i].reqSpec.Browser)) {
						exlog("_CHECK.check", "not support Browser");
						if (pluginInfoArr[i].exErrSpec) pluginInfoArr[i].exErrSpec('BROWSER', pluginInfoArr[i].reqSpec.Browser);
						return;
					}
				}
			}
		} else {
			if (CROSSWEBEX_CONST.pluginInfo.length <= 0) {
				if ("undefined" !== typeof INI_ALERT) {
					INI_ALERT(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_018, "WARN"); // "플러그인 정보가 필요합니다."
				} else {
					alert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_018); // "플러그인 정보가 필요합니다."
				}
				return;
			}
		}

		if (callback) {
			this.chkCallback = callback;
		} else {
			if ("undefined" !== typeof INI_ALERT) {
				INI_ALERT(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_019, "WARN"); // "콜백이 필요합니다."
			} else {
				alert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_019); // "콜백이 필요합니다."
			}
			return;
		}

		CROSSWEBEX_CONST.pluginCount = CROSSWEBEX_CONST.pluginInfo.length;
		exlog("_CONST.pluginInfo", CROSSWEBEX_CONST.pluginInfo);
		exlog("_CONST.pluginCount", CROSSWEBEX_CONST.pluginCount);

		// generate exDiv
		CROSSWEBEX_UTIL.chkCrossEXDiv(CROSSWEBEX_CONST);
		this.moduleCheck(0);
	},

	moduleCheck: function (currPluginCnt) {

		this.chkCurrPluginCnt = currPluginCnt;

		if (currPluginCnt >= CROSSWEBEX_CONST.pluginCount) {
			var chk = true;
			for (var i = 0; i < CROSSWEBEX_CONST.pluginCount; i++) {
				var currInstalled = true;
				var currStatus = this.chkInfoStatus.info[i];
				if (CROSSWEBEX_UTIL.typeExtension()) {
					if (!currStatus.extension) {
						chk = false;
						currInstalled = false;
					}
				}
				if (!currStatus.EX) {
					chk = false;
					currInstalled = false;
				}
				if (!currStatus.client) {
					chk = false;
					currInstalled = false;
				}
				currStatus.isInstalled = currInstalled;
			}
			this.chkInfoStatus.status = chk;
			exlog("_CHECK.moduleCheck.chkInfoStatus", this.chkInfoStatus);
			CROSSWEBEX_CHECK.chkCallback(this.chkInfoStatus);
			return;
		}

		var pluginInfo = CROSSWEBEX_CONST.pluginInfo[currPluginCnt];
		//exlog("_CHECK.moduleCheck.currPluginCnt", currPluginCnt);

		if (CROSSWEBEX_UTIL.typeEX()) {

			var checkCallback = "CROSSWEBEX_CHECK.EXVersionCheck";
			var url = pluginInfo.exProtocolName + "://" + location.host + "/GetVersions";
			url += "?callback=" + checkCallback;
			url += "&m=" + pluginInfo.exModuleName;
			url += "&tabid=" + CROSSWEBEX_CONST.extabid;
			url += "&hostid=" + encodeURIComponent(location.host);
			url += "&lic=" + encodeURIComponent(pluginInfo.lic);

			// iframe 선언이 document.write인 경우에 한하여 i=1 값을 추가한다.
			if (window.location.protocol == "https:") url += "&i=1&s=1";

			// getVersion을 재실행시에 n값을 전송
			if (CROSSWEBEX_CONST.isInstalled) {
				url += "&n=true";
			}
			exlog("_CHECK.moduleCheck.url", url);
			this.loadScript(url);

		} else if (CROSSWEBEX_UTIL.typeExtension()) {

			var nativecall;
			try {
				// [2022.09.30] Namsu change - eval로 실행되는 함수를 Function 생성자를 사용해서 호출하도록 변경
				// eval(pluginInfo.exExtHeader + "_nativecall")
				nativecall = ( new Function( 'return ' + pluginInfo.exExtHeader + '_nativecall') )(); 
			} catch (e) {
				exlog("_CHECK.moduleCheck error : ", e);
			}

			var url = { "cmd": "init", "exfunc": "get_extension_version", "callback": "" };
			exlog("_CHECK.moduleCheck.nativecall.param", url);
			if (typeof nativecall == 'function') {
				nativecall(url, function (version) {
					CROSSWEBEX_CHECK.extensionVersionCheck(version);
				});
			} else {
				exlog("_CHECK.moduleCheck.nativecall", "nativecall retry");
				setTimeout(function () {
					try {
						nativecall = pluginInfo.exExtHeader["_nativecall"];
					} catch (e) {
						exlog("_CHECK.moduleCheck _nativecall except ", _nativecall);
					}
					if (typeof nativecall == 'function') {
						nativecall(url, function (version) {
							CROSSWEBEX_CHECK.extensionVersionCheck(version);
						});
					} else {
						exlog("_CHECK.moduleCheck.nativecall [exception]", "extension not load");
						CROSSWEBEX_CHECK.extensionVersionCheck("-1");
					}
				}, 300);
			}

		} else if (CROSSWEBEX_UTIL.typePlugin()) {

			navigator.plugins.refresh(false);
			var EXNP = navigator.mimeTypes[pluginInfo.exNPMimeType];

			if (EXNP && EXNP.enabledPlugin) {
				// np plugin embed
				if (!document.getElementById(pluginInfo.exNPPluginId)) {
					var exPlugin = document.createElement("embed");
					exPlugin.setAttribute("id", pluginInfo.exNPPluginId);
					exPlugin.setAttribute("type", pluginInfo.exNPMimeType);
					exPlugin.setAttribute("tabid", CROSSWEBEX_CONST.extabid);
					exPlugin.setAttribute("width", "0");
					exPlugin.setAttribute("height", "0");
					document.body.appendChild(exPlugin);
				}

				var verJSON = {
					"init": "get_versions",
					"m": pluginInfo.exModuleName,
					"origin": location.origin,
					"lic": pluginInfo.lic
				};
				exlog("_CHECK.moduleCheck.nativecall.param", verJSON);
				var npObj = document.getElementById(pluginInfo.exNPPluginId);
				if (npObj) {
					var npVersionInfo = {};
					try {
						if (typeof npObj.nativeCall == "function") {
							npVersionInfo = npObj.nativeCall(JSON.stringify(verJSON));
							CROSSWEBEX_CHECK.npVersionCheck(npVersionInfo);
						} else {
							exlog("_CHECK.moduleCheck.nativeCall [exception]", "nativeCall retry");
							setTimeout(function () {
								npObj = document.getElementById(pluginInfo.exNPPluginId);
								if (typeof npObj.nativeCall == "function") {
									npVersionInfo = npObj.nativeCall(JSON.stringify(verJSON));
									CROSSWEBEX_CHECK.npVersionCheck(npVersionInfo);
								} else {
									if (CROSSWEBEX_UTIL.isWin()) {
										location.reload();
									} else {
										exlog("_CHECK.moduleCheck.nativeCall [exception]", "nativeCall cannot run retry");
										setTimeout(function () {
											npObj = document.getElementById(pluginInfo.exNPPluginId);
											if (typeof npObj.nativeCall == "function") {
												npVersionInfo = npObj.nativeCall(JSON.stringify(verJSON));
												CROSSWEBEX_CHECK.npVersionCheck(npVersionInfo);
											} else {
												exlog("_CHECK.moduleCheck.nativeCall [exception]", "nativeCall cannot run fail");
												//location.reload();
											}
										}, 3000);
									}
								}
							}, 300);
						}
					} catch (e) {
						exalert("_CHECK.moduleCheck nativaCall getversion [exception]");
						return;
					}
				} else {
					exalert("_CHECK.moduleCheck [exception]", CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_020); // "embed 태그 생성 실패"
					return;
				}
			} else {
				this.npVersionCheck("-1");
			}
		} else {
			if (pluginInfo.exErrSpec) pluginInfo.exErrSpec('BROWSER', pluginInfo.reqSpec.Browser);
			return;
		}
	},

	EXVersionCheck: function (updateInfo) {

		var pluginInfo = CROSSWEBEX_CONST.pluginInfo[this.chkCurrPluginCnt];

		if (updateInfo) {
			exlog("_CHECK.EXVersionCheck.updateInfo", updateInfo);

			// license check
			if (typeof updateInfo.status !== "undefined" && updateInfo.status == false) {
				exlog("_CHECK.EXVersionCheck [license check]", pluginInfo.exPluginName + " license check FAIL");
				CROSSWEBEX_CHECK.setStatus("license", "", false, false);
			} else {
				exlog("_CHECK.EXVersionCheck [license check]", pluginInfo.exPluginName + " license check SUCCESS");
				CROSSWEBEX_CHECK.setStatus("license", "", true, false);
			}

			// EX Version Diff
			var exEXSvrVer;
			exlog("_CHECK.EXVersionCheck", "EX version check");
			exEXSvrVer = pluginInfo.exProtocolInfo.exWinProtocolVer;

			if (CROSSWEBEX_UTIL.diffVersion(updateInfo.ex, exEXSvrVer)) {

				CROSSWEBEX_CHECK.setStatus("EX", updateInfo.ex, true, false);

				// Client Version Diff
				var currModuleInfoArr = updateInfo.m;
				var currModuleVer;
				for (var i = 0; i < currModuleInfoArr.length; i++) {
					var cm = currModuleInfoArr[i];
					if (cm.name == pluginInfo.exModuleName) {
						currModuleVer = cm.version;
						break;
					}
				}
				var exModuleSvrVer;
				if (CROSSWEBEX_UTIL.isWin()) {
					if (CROSSWEBEX_UTIL.getBrowserBit() == "64") {
						exModuleSvrVer = pluginInfo.moduleInfo.exWin64Ver;
					} else {
						exModuleSvrVer = pluginInfo.moduleInfo.exWinVer;
					}
				} else if (CROSSWEBEX_UTIL.isMac()) {
					exModuleSvrVer = pluginInfo.moduleInfo.exMacVer;
				} else if (CROSSWEBEX_UTIL.isLinux()) {
					exModuleSvrVer = pluginInfo.moduleInfo.exLinuxVer;
				}
				exlog("_CHECK.EXVersionCheck", "Client version check");
				if (CROSSWEBEX_UTIL.diffVersion(currModuleVer, exModuleSvrVer)) {

					// set installed
					CROSSWEBEX_CHECK.setStatus("client", currModuleVer, true, true);

				} else {
					CROSSWEBEX_CHECK.setStatus("client", currModuleVer, false, true);
				}
			} else {
				CROSSWEBEX_CHECK.setStatus("EX", updateInfo.ex, false, true);
			}
		} else {
			exlog("_CHECK.EXVersionCheck", pluginInfo.exPluginName + " updateInfo Error");
			CROSSWEBEX_CHECK.setStatus("EX", "", false, true);
		}
	},

	extensionVersionCheck: function (updateInfo) {

		var pluginInfo = CROSSWEBEX_CONST.pluginInfo[this.chkCurrPluginCnt];
		exlog("_CHECK.extensionVersionCheck.updateInfo", updateInfo);

		if (!window[pluginInfo.exProtocolName + "_extension_listener"]) {
			window[pluginInfo.exProtocolName + "_extension_listener"] = function (event) {
				if ("undefined" !== typeof INI_ALERT) {
					INI_ALERT(pluginInfo.exPluginName + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_021, "INFO"); // " 확장 기능 설치를 완료 하였습니다."
				} else {
					alert(pluginInfo.exPluginName + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_021); // " 확장 기능 설치를 완료 하였습니다."
				}
			}
		}

		if (updateInfo == "-1") {
			window.addEventListener('__' + pluginInfo.exProtocolName + '_extension_installed__', window[pluginInfo.exProtocolName + "_extension_listener"]);
			exlog("_CHECK.extensionVersionCheck", pluginInfo.exPluginName + " EX Extension not install");
			CROSSWEBEX_CHECK.setStatus("extension", "", false, true);
			return;
		}

		var extensionVersion = "";
		if (CROSSWEBEX_UTIL.isChrome()) extensionVersion = pluginInfo.exExtensionInfo.exChromeExtVer;
		else if (CROSSWEBEX_UTIL.isFirefox()) extensionVersion = pluginInfo.exExtensionInfo.exFirefoxExtVer;
		else if (CROSSWEBEX_UTIL.isOpera()) extensionVersion = pluginInfo.exExtensionInfo.exOperaExtVer;

		// Extension Version Diff
		exlog("_CHECK.extensionVersionCheck", "Extension version check");
		if (CROSSWEBEX_UTIL.diffVersion(updateInfo, extensionVersion)) {
			CROSSWEBEX_CHECK.setStatus("extension", updateInfo, true, false);
			window.removeEventListener('__' + pluginInfo.exProtocolName + '_extension_installed__', window[pluginInfo.exProtocolName + "_extension_listener"]);
			this.extensionNativeVersionCheck();
		} else {
			// chrome은 자동업데이트 되므로 예외처리
			if (CROSSWEBEX_UTIL.isChrome()) {
				CROSSWEBEX_CHECK.setStatus("extension", updateInfo, false, false);
				window.removeEventListener('__' + pluginInfo.exProtocolName + '_extension_installed__', window[pluginInfo.exProtocolName + "_extension_listener"]);
				this.extensionNativeVersionCheck();
			} else {
				window.addEventListener('__' + pluginInfo.exProtocolName + '_extension_installed__', window[pluginInfo.exProtocolName + "_extension_listener"]);
				CROSSWEBEX_CHECK.setStatus("extension", updateInfo, false, true);
			}
		}
	},

	extensionNativeVersionCheck: function () {

		var pluginInfo = CROSSWEBEX_CONST.pluginInfo[this.chkCurrPluginCnt];
		
		// [2022.09.30] Namsu change - eval로 실행되는 함수를 Function 생성자를 사용해서 호출하도록 변경
		// var nativecall = eval(pluginInfo.exExtHeader + "_nativecall");
		var nativecall = ( new Function( 'return ' + pluginInfo.exExtHeader + '_nativecall') )();

		var pv = "";
		if (CROSSWEBEX_UTIL.isWin()) {
			pv = pluginInfo.exProtocolInfo.exWinProtocolVer;
		} else if (CROSSWEBEX_UTIL.isMac()) {
			pv = pluginInfo.exProtocolInfo.exMacProtocolVer;
		} else if (CROSSWEBEX_UTIL.isLinux()) {
			pv = pluginInfo.exProtocolInfo.exLinuxProtocolVer;
		}

		var nativecallData = {
			"cmd": "init", "exfunc": "get_versions",
			"m": pluginInfo.exModuleName,
			"origin": pluginInfo.hostid ? pluginInfo.hostid : location.origin,
			"pv": pv,
			"lic": pluginInfo.lic,
			"callback": ""
		};

		// Firefox WebExtension Addon Parameter
		if(CROSSWEBEX_UTIL.isFirefox()) nativecallData.ffPatch = true;

		exlog("_CHECK.extensionNativeVersionCheck.nativecall.param", nativecallData);

		var chkExtVerChkInterval;
		var chkExtRetry = 0;
		function chkVersionNativeCall() {
			if (chkExtRetry > 1)
				exlog("_CHECK.extensionNativeVersionCheck.retry", chkExtRetry);
			chkExtRetry++;

			nativecall(nativecallData,
				function (response) {
					exlog("_CHECK.extensionNativeVersionCheck", "clearInterval");
					clearInterval(chkExtVerChkInterval);
					exlog("_CHECK.extensionNativeVersionCheck.response", response);
					if (response) {
						// type 0 - check version
						// type 1 - need to install
						// type 2 - native host error
						if (response.status == "INTERNAL_ERROR") {

							exlog("_CHECK.extensionNativeVersionCheck", pluginInfo.exPluginName + " internal error :: " + response.reply);
							CROSSWEBEX_CHECK.setStatus("EX", "", false, true);

						} else if (response.status == "TRUE") {

							// license check
							if (typeof response.reply.status !== "undefined" && response.reply.status == false) {
								exlog("_CHECK.extensionNativeVersionCheck [license check]", pluginInfo.exPluginName + " license check FAIL");
								CROSSWEBEX_CHECK.setStatus("license", "", false, false);
							} else {
								exlog("_CHECK.extensionNativeVersionCheck [license check]", pluginInfo.exPluginName + " license check SUCCESS");
								CROSSWEBEX_CHECK.setStatus("license", "", true, false);
							}

							// EX Version Diff
							var exEXSvrVer;
							if (CROSSWEBEX_UTIL.isWin()) {
								exEXSvrVer = pluginInfo.exProtocolInfo.exWinProtocolVer;
							} else if (CROSSWEBEX_UTIL.isMac()) {
								exEXSvrVer = pluginInfo.exProtocolInfo.exMacProtocolVer;
							} else if (CROSSWEBEX_UTIL.isLinux()) {
								exEXSvrVer = pluginInfo.exProtocolInfo.exLinuxProtocolVer;
							}
							exlog("_CHECK.extensionNativeVersionCheck", "EX version check");
							if (CROSSWEBEX_UTIL.diffVersion(response.reply.ex, exEXSvrVer)) {

								CROSSWEBEX_CHECK.setStatus("EX", response.reply.ex, true, false);

								// Client Version Diff
								var currModuleInfoArr = response.reply.m;
								var currModuleVer;
								for (var i = 0; i < currModuleInfoArr.length; i++) {
									var cm = currModuleInfoArr[i];
									if (cm.name == pluginInfo.exModuleName) {
										currModuleVer = cm.version;
										break;
									}
								}
								var exModuleSvrVer;
								if (CROSSWEBEX_UTIL.isWin()) {
									exModuleSvrVer = pluginInfo.moduleInfo.exWinVer;
								} else if (CROSSWEBEX_UTIL.isMac()) {
									exModuleSvrVer = pluginInfo.moduleInfo.exMacVer;
								} else if (CROSSWEBEX_UTIL.isLinux()) {
									exModuleSvrVer = pluginInfo.moduleInfo.exLinuxVer;
								}
								exlog("_CHECK.extensionNativeVersionCheck", "Client version check");
								if (CROSSWEBEX_UTIL.diffVersion(currModuleVer, exModuleSvrVer)) {

									// Set isInstalled
									CROSSWEBEX_CHECK.setStatus("client", currModuleVer, true, true);
								} else {
									exlog("_CHECK.extensionNativeVersionCheck", pluginInfo.exPluginName + " client not installed or need upgrade");
									CROSSWEBEX_CHECK.setStatus("client", currModuleVer, false, true);
								}
							} else {
								exlog("_CHECK.extensionNativeVersionCheck", pluginInfo.exPluginName + " client not installed or need upgrade");
								CROSSWEBEX_CHECK.setStatus("EX", response.reply.ex, false, true);
							}
						} else {
							exlog("_CHECK.extensionNativeVersionCheck", pluginInfo.exPluginName + " status not TRUE");
							CROSSWEBEX_CHECK.setStatus("EX", "", false, true);
						}
					} else {
						exlog("_CHECK.extensionNativeVersionCheck", pluginInfo.exPluginName + "response not exist");
						exalert("_CHECK.extensionNativeVersionCheck", CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_022); // "Extension의 설치를 확인해주세요."
						CROSSWEBEX_CHECK.setStatus("extension", "", false, true);
					}
				}
			);
		}
		chkVersionNativeCall();
		chkExtVerChkInterval = setInterval(function () {
			exlog("_CHECK.extensionNativeVersionCheck", "setIntervalCall");
			if (chkExtRetry > 0) {
				exlog("_CHECK.extensionNativeVersionCheck", "retry!!!");
				chkVersionNativeCall();
			} else {
				exlog("_CHECK.extensionNativeVersionCheck", "pass!!!");
				clearInterval(chkExtVerChkInterval);
			}
		}, 3000);
	},

	npVersionCheck: function (updateInfo) {

		updateInfo = JSON.parse(updateInfo);
		exlog("_CHECK.npVersionCheck.updateInfo", updateInfo);

		var pluginInfo = CROSSWEBEX_CONST.pluginInfo[this.chkCurrPluginCnt];
		if (updateInfo == "-1") {
			exlog("_CHECK.npVersionCheck", pluginInfo.exPluginName + " not install");
			CROSSWEBEX_CHECK.setStatus("EX", "", false, true);
			return;
		}

		// license check
		if (typeof updateInfo.status !== "undefined" && updateInfo.status == false) {
			exlog("_CHECK.extensionNativeVersionCheck [license check]", pluginInfo.exPluginName + " license check FAIL");
			CROSSWEBEX_CHECK.setStatus("license", "", false, false);
		} else {
			exlog("_CHECK.extensionNativeVersionCheck [license check]", pluginInfo.exPluginName + " license check SUCCESS");
			CROSSWEBEX_CHECK.setStatus("license", "", true, false);
		}

		// EX Version Diff
		var exEXSvrVer;
		if (CROSSWEBEX_UTIL.isWin()) {
			exEXSvrVer = pluginInfo.exProtocolInfo.exWinProtocolVer;
		} else if (CROSSWEBEX_UTIL.isMac()) {
			exEXSvrVer = pluginInfo.exProtocolInfo.exMacProtocolVer;
		} else if (CROSSWEBEX_UTIL.isLinux()) {
			exEXSvrVer = pluginInfo.exProtocolInfo.exLinuxProtocolVer;
		}
		exlog("_CHECK.npVersionCheck", "EX version check");
		if (CROSSWEBEX_UTIL.diffVersion(updateInfo.ex, exEXSvrVer)) {

			CROSSWEBEX_CHECK.setStatus("EX", updateInfo.ex, true, false);

			// Client Version Diff
			var currModuleInfoArr = updateInfo.m;
			var currModuleVer;
			for (var i = 0; i < currModuleInfoArr.length; i++) {
				var cm = currModuleInfoArr[i];
				if (cm.name == pluginInfo.exModuleName) {
					currModuleVer = cm.version;
					break;
				}
			}
			var exModuleSvrVer;
			if (CROSSWEBEX_UTIL.isWin()) {
				exModuleSvrVer = pluginInfo.moduleInfo.exWinVer;
			} else if (CROSSWEBEX_UTIL.isMac()) {
				exModuleSvrVer = pluginInfo.moduleInfo.exMacVer;
			} else if (CROSSWEBEX_UTIL.isLinux()) {
				exModuleSvrVer = pluginInfo.moduleInfo.exLinuxVer;
			}
			exlog("_CHECK.npVersionCheck", "Client version check");
			if (CROSSWEBEX_UTIL.diffVersion(currModuleVer, exModuleSvrVer)) {
				// Set isInstalled
				CROSSWEBEX_CHECK.setStatus("client", currModuleVer, true, true);
			} else {
				CROSSWEBEX_CHECK.setStatus("client", currModuleVer, false, true);
			}
		} else {
			CROSSWEBEX_CHECK.setStatus("EX", updateInfo.ex, false, true);
		}
	},

	loadScript: function (url) {

		var newScript = document.createElement("script");
		newScript.id = CROSSWEBEX_CONST.exScriptName;
		newScript.type = "text/javascript";

		if (newScript.readyState) { // IE8 under
			newScript.onreadystatechange = function () {
				exlog("_UTIL.loadScript.readyState", newScript.readyState);
				if (newScript.readyState == 'loading' || newScript.readyState == 'loaded') {
					newScript.onreadystatechange = null;
					exlog("_UTIL.loadScript", "loadScript load error");
					CROSSWEBEX_CHECK.setStatus("EX", "", false, true);
				}
			};
		} else {
			newScript.onerror = function () {
				exlog("_UTIL.loadScript", "loadScript load error");
				CROSSWEBEX_CHECK.setStatus("EX", "", false, true);
			};
		}

		try {
			newScript.src = url;
		} catch (e) {
			exlog("_UTIL.loadscript", "LoadScript not https load error");
			CROSSWEBEX_CHECK.setStatus("EX", "", false, true);
		}
		//eval(CROSSWEBEX_CONST.exDivName).appendChild(newScript);
		window[CROSSWEBEX_CONST.exDivName].appendChild(newScript);
	},

	setStatus: function (type, localVer, status, isNext) {
		var currPlugin = CROSSWEBEX_CONST.pluginInfo[this.chkCurrPluginCnt];
		try {
			if (type == "license") {
				this.chkInfoStatus.info[this.chkCurrPluginCnt].license = status;
			} else if (type == "extension") {
				this.chkInfoStatus.info[this.chkCurrPluginCnt].extensionVer = localVer;
				this.chkInfoStatus.info[this.chkCurrPluginCnt].extension = status;
			} else if (type == "EX") {
				this.chkInfoStatus.info[this.chkCurrPluginCnt].EXVer = localVer;
				this.chkInfoStatus.info[this.chkCurrPluginCnt].EX = status;
			} else if (type == "client") {
				this.chkInfoStatus.info[this.chkCurrPluginCnt].clientVer = localVer;
				this.chkInfoStatus.info[this.chkCurrPluginCnt].client = status;
				if (status) {
					currPlugin.isInstalled = true;
				}
			}

			if (isNext) {
				//this.chkInfoStatus.info[this.chkCurrPluginCnt].check = true;
				//exlog("_CHECK.setStatus", this.chkInfoStatus);
				this.moduleCheck(this.chkCurrPluginCnt + 1);
			} else {
				//exlog("_CHECK.setStatus", this.chkInfoStatus);
			}
		} catch (e) {
			exlog("_UTIL.setStatus", "moduleCheck error");
		}
	}
};


/* 
 * CrossEX Construct
 * CROSSWEBEX_EX
 */
var CROSSWEBEX_EX = function (property) {

	this.isInstalled = property.isInstalled;
	this.exPluginName = property.exPluginName;
	this.exModuleName = property.exModuleName ? property.exModuleName : property.exProtocolName;
	this.exProtocolName = property.exProtocolName;
	this.exExtHeader = property.exExtHeader;
	this.exNPPluginId = property.exNPPluginId;
	this.exErrFunc = property.exErrFunc;
	this.lic = property.lic;
	this.exDefaultCallbackName = property.exDefaultCallback ? property.exDefaultCallback : property.exPluginName + ".exDefaultCallback";

	this.exDivName = CROSSWEBEX_CONST.exDivName;
	this.exFormName = CROSSWEBEX_CONST.exFormName;
	this.exFormDataName = CROSSWEBEX_CONST.exFormDataName;
	this.exIframeName = CROSSWEBEX_CONST.exIframeName;
	this.exScriptName = CROSSWEBEX_CONST.exScriptName;

	dummyDomain = property.dummyDomain ? property.dummyDomain : location.host;
	hostid = property.hostid ? property.hostid : location.host;

	this.initEXInfoArr = [];
	this.exInterfaceArr = [];
	this.exEcho = false;
	this.setEcho = function (status) {
		this.exEcho = status;
	};
	this.alertInfo = { "BLOCK": false, "EX": false, "CLIENT": false };

	// default callback
	this.exDefaultCallback = function (response) {
		exlog("exDefaultCallback", response);
		if (response) {
			var resPluginObj;
			if (response.NAME) {
				if (response.NAME != crosswebexInfo.exPluginName) {
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(crosswebexInfo.exPluginName + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_026, "WARN"); // "실행중 오류가 발생하였습니다.(EX)"
					} else {
						alert(crosswebexInfo.exPluginName + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_026); // "실행중 오류가 발생하였습니다.(EX)"
					}
					return;
				}
				//resPluginObj = eval(response.NAME);
				resPluginObj = response(response.NAME);
			}

			if (response.ERR == "BLOCK") {
				if (!resPluginObj.alertInfo.BLOCK) {
					resPluginObj.alertInfo.BLOCK = true;
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_023, "WARN"); // " 라이센스를 확인하세요."
					} else {
						alert(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_023); // " 라이센스를 확인하세요."
					}
				}
			} else if (response.ERR == "BLOCK:EX") {
				if (!resPluginObj.alertInfo.EX) {
					resPluginObj.alertInfo.EX = true;
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_024, "WARN"); // " 프로그램이 정상적으로 설치되지 않았습니다.\n재설치 후 진행하여주십시오."
					} else {
						alert(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_024); // " 프로그램이 정상적으로 설치되지 않았습니다.\n재설치 후 진행하여주십시오."
					}
				}
			} else if (response.ERR == "BLOCK:CLIENT") {
				if (!resPluginObj.alertInfo.CLIENT) {
					resPluginObj.alertInfo.CLIENT = true;
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_024, "WARN"); // " 프로그램이 정상적으로 설치되지 않았습니다.\n재설치 후 진행하여주십시오."
					} else {
						alert(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_024); // " 프로그램이 정상적으로 설치되지 않았습니다.\n재설치 후 진행하여주십시오."
					}
				}
			} else if (response.ERR == "BLOCK:DISCONNECTED") {
				exlog("exDefaultCallback.msg", response.MSG);
				if (!resPluginObj.alertInfo.BLOCK) {
					resPluginObj.alertInfo.BLOCK = true;
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_025, "WARN"); // " 프로그램이 중단되었습니다.\n페이지를 새로고침하세요."
					} else {
						alert(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_025); // " 프로그램이 중단되었습니다.\n페이지를 새로고침하세요."
					}
				}
			} else if (response.ERR == "BLOCK:INTERNAL") {
				exlog("exDefaultCallback.msg", response.MSG);
				if (!resPluginObj.alertInfo.BLOCK) {
					resPluginObj.alertInfo.BLOCK = true;
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_025, "WARN"); // " 프로그램이 중단되었습니다.\n페이지를 새로고침하세요."
					} else {
						alert(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_025); // " 프로그램이 중단되었습니다.\n페이지를 새로고침하세요."
					}
				}
			} else {
				exalert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_026, response); // "실행중 오류가 발생하였습니다.(EX)"
			}

			try {
				if (resPluginObj.exErrFunc) {
					resPluginObj.exErrFunc(response);
				}
			} catch (e) {
				exlog("exDefaultCallback error ", e);
			}
			return;

		} else {
			exalert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_026, "InvokeCallback not response"); // "실행중 오류가 발생하였습니다.(EX)"
		}
	};

	/*
	 * Invoke
	 */
	this.Invoke = function (fname, args, exCallback, pageCallback) {

		var id = CROSSWEBEX_UTIL.createId();
		var obj = {};
		obj.id = id;
		obj.EXCallback = exCallback ? exCallback : null;
		obj.pageCallback = pageCallback ? pageCallback : null;
		obj.pluginName = this.exPluginName;
		this.exInterfaceArr.push(obj);
		exlog(this.exPluginName + ".Invoke.exInterfaceArr.id", id);
		//exlog(this.exPluginName + ".Invoke.exInterfaceArr.push", obj);
		//exlog(this.exPluginName + ".Invoke.exInterfaceArr.length", this.exInterfaceArr.length);

		var cmd = "native";
		if (CROSSWEBEX_UTIL.typeEX()) {
			this.InitEX(id, cmd, fname, args, exCallback);
		} else if (CROSSWEBEX_UTIL.typeExtension()) {
			this.InvokeExtension(id, cmd, fname, args, exCallback);
		} else if (CROSSWEBEX_UTIL.typePlugin()) {
			this.InvokePlugin(id, cmd, fname, args, exCallback);
		} else {
			return;
		}
	};

	this.InitEX = function (id, cmd, fname, funcArgsArray, callback) {

		var initUrl = this.createInitEXURL(id, this.exPluginName + ".InitEXCallback");
		var request = {};
		request.id = id;
		request.tabid = CROSSWEBEX_CONST.extabid;
		request.module = this.exModuleName;
		request.cmd = cmd;
		request.origin = location.origin != undefined ? location.origin : (location.protocol + "//" + hostid);
		request.exfunc = {};
		request.exfunc.fname = fname;
		request.callback = callback;
		if (this.exEcho) request.echo = true;

		var exfunc = request.exfunc;
		if (funcArgsArray) {
			if (funcArgsArray instanceof Array) {
				exfunc.args = funcArgsArray;
			} else {
				var arr = [funcArgsArray];
				exfunc.args = arr;
			}
		} else {
			exfunc.args = [];
		}
		var initEXInfo = { "id": id, "json": request, "callback": callback };
		this.initEXInfoArr.push(initEXInfo);
		//exlog(this.exPluginName + ".InitEX.initEXInfoArr.push", initEXInfo);
		//exlog(this.exPluginName + ".InitEX.initEXInfoArr.length", this.initEXInfoArr.length);
		exlog(this.exPluginName + ".InitEX.loadScript.url", initUrl);
		CROSSWEBEX_UTIL.loadScript(initUrl);
	};

	this.InitEXCallback = function (id) {

		//exlog(this.exPluginName + ".InitEXCallback.id", id);
		var
			callback,
			reqJSON;

		if (this.initEXInfoArr) {
			for (var i = 0; i < this.initEXInfoArr.length; i++) {
				initExObj = this.initEXInfoArr[i];
				if (initExObj.id == id) {
					//exlog(this.exPluginName + ".InitEXCallback.initEXInfoArr["+ i + "].delete", initExObj.json);
					reqJSON = initExObj.json;
					callback = initExObj.json.callback;
					this.initEXInfoArr.splice(i, 1);
					//exlog(this.exPluginName + ".InitEXCallback.initEXInfoArr.length", this.initEXInfoArr.length);
					break;
				}
			}
		} else {
			exlog(this.exPluginName + ".InitEXCallback [exception]", CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_027); // "initEXInfoArr는 존재하지 않습니다."
			exalert(this.exPluginName + ".InitEXCallback [exception]", CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_027); // "initEXInfoArr는 존재하지 않습니다."
			return;
		}

		this.InvokeEX(id, callback, reqJSON);
	};

	this.InvokeEX = function (id, callback, reqJSON) {

		var frm = document.getElementById(CROSSWEBEX_CONST.exFormName);
		frm.target = CROSSWEBEX_CONST.exIframeName;
		frm.action = this.createEXURL(id, this.exPluginName + ".InvokeCallback");

		if (frm.elements.length > 1) {
			for (var i = 0; i < frm.elements.length;) {
				var chkElement = frm.elements[i];
				var chkId = chkElement.id ? chkElement.id : "";
				var chkName = chkElement.name ? chkElement.name : "";

				if (chkId != CROSSWEBEX_CONST.exFormDataName || chkName != CROSSWEBEX_CONST.exFormDataName) {
					exlog(this.exPluginName + ".InvokeEX.form remove garbage param", chkId + "::" + chkName);
					chkElement.parentElement.removeChild(chkElement);
				} else {
					i++;
				}
			}
		}

		var node = frm.elements[0];
		node.value = JSON.stringify(reqJSON);

		exlog(this.exPluginName + ".InvokeEX." + frm.id + ".action", frm.action);
		exlog(this.exPluginName + ".InvokeEX." + node.name + ".value", node.value);

		frm.submit();
	};

	this.InvokeExtension = function (id, cmd, fname, args, callback) {

		var request = {};
		request.id = id;
		request.module = this.exModuleName;
		request.cmd = cmd;
		request.origin = location.origin != undefined ? location.origin : (location.protocol + "//" + location.host);
		request.exfunc = {};
		request.exfunc.fname = fname;
		request.exfunc.args = args;
		request.callback = callback;
		if (this.exEcho) request.echo = true;
		exlog(this.exPluginName + ".InvokeExtension.request", request);

		CROSSWEBEX_CONST.tmpExtArr.push({ "id": id, "name": this.exPluginName });
		// [2022.09.30] Namsu change - eval로 실행되는 함수를 Function 생성자를 사용해서 호출하도록 변경
		// var invokeCallbackFn = eval(this.exPluginName + ".InvokeExtensionCallback");
		var invokeCallbackFn = ( new Function( 'return ' + this.exPluginName + '.InvokeExtensionCallback') )();
		var nativecall = ( new Function( 'return ' + this.exExtHeader + '_nativecall') )();
		// if (typeof eval(this.exExtHeader+"_nativecall") == "function") {
		if (typeof nativecall == "function") {
			// eval(this.exExtHeader+"_nativecall")(request, invokeCallbackFn);
			nativecall(request, invokeCallbackFn);
		} else {
			//eval(this.exDefaultCallbackName)("extension not installed");
			var fn = ( new Function( 'return ' + this.exDefaultCallbackName) )(); 
			fn("extension not installed");
		}
	};

	this.InvokeExtensionCallback = function (response) {
		var tmpPluginName;
		for (var i = 0; i < CROSSWEBEX_CONST.tmpExtArr.length; i++) {
			var tmpObj = CROSSWEBEX_CONST.tmpExtArr[i];
			if (response.id == tmpObj.id) {
				tmpPluginName = tmpObj.name;
				CROSSWEBEX_CONST.tmpExtArr.splice(i, 1);
				break;
			}
		}
		if (tmpPluginName) {
			// [2022.09.30] Namsu change - eval로 실행되는 함수를 Function 생성자를 사용해서 호출하는 경우,
			// 호출되는 함수 안에서 this 연산자가 지칭하는 객체가 변경되어 사용할 수 없다.
			// 직접 객체와 함수 이름을 지정해서 호출하도록 변경
			// eval(tmpPluginName).InvokeCallback(response);
			CROSSWEBEX.InvokeCallback(response);
		}
	};

	this.InvokePlugin = function (id, cmd, fname, args, callback) {

		var request = {};
		request.id = id;
		request.tabid = CROSSWEBEX_CONST.extabid;
		request.module = this.exModuleName;
		request.cmd = cmd;
		request.origin = location.origin != undefined ? location.origin : location.host;
		request.exfunc = {};
		request.exfunc.fname = fname;
		request.exfunc.args = args;
		request.callback = callback;
		if (this.exEcho) request.echo = true;

		exlog(this.exPluginName + ".InvokePlugin.request", JSON.stringify(request));
		var plugin = this.exNPPluginId;
		if (typeof plugin.nativeCall == "function") {
			var response = plugin.nativeCall(JSON.stringify(request));
			this.InvokeCallback(response);
		} else {
			this.exDefaultCallbackName("plugin not installed");
			return;
		}
	};

	this.InvokeCallback = function (response) {
		if (response) {
			try {
				exlog(this.exPluginName + ".InvokeCallback.response", response);
				if (typeof response == "object") {
					var strSerial = JSON.stringify(response);
				} else if (typeof response == "string") {
					response = JSON.parse(response);
				}

				if (CROSSWEBEX_UTIL.typeEX() || CROSSWEBEX_UTIL.typePlugin()) {
					response = response.response;
				} else {
					response = response;
				}

				var status = response.status;
				if (status == "TRUE") {	// success
					var id = response.id;
					var funcInfo = {};
					for (var i = 0; i < this.exInterfaceArr.length; i++) {
						if (this.exInterfaceArr[i]) {
							var arrObj = this.exInterfaceArr[i];
							if (arrObj.id == id) {
								//exlog(this.exPluginName + ".InvokeCallback remove exInterfaceArr info", arrObj);
								funcInfo = arrObj;
								this.exInterfaceArr.splice(i, 1);
								break;
							}
						}
					}
					var callback = funcInfo.EXCallback;
					var reply = response.reply.reply;
					var param = {};

					// run callback
					if (callback) {
						if (reply instanceof Array) {
							param.callback = funcInfo.pageCallback;
							var replyArr;
							replyArr = "[";
							for (var i in reply) {
								var str = reply[i];
								str = str.replace("\\r", "\r");
								str = str.replace("\\n", "\n");
								replyArr += "'" + str + "',";
							}
							replyArr += "]";
							param.reply = replyArr;

						} else if (typeof reply == 'string') {
							param.callback = funcInfo.pageCallback;
							param.reply = reply.replace("\\r", "\r").replace("\\n", "\n");

						} else if (typeof reply == 'object') {
							reply.callback = funcInfo.pageCallback;
							if (reply.status == "_CROSSWEBEX_BLOCK_") {
								var err = reply.err;
								this.exDefaultCallbackName({ "NAME": this.exPluginName, "ERR": err });
							} else {
								param = reply;
							}
						}

						if (!CROSSWEBEX_UTIL.typePlugin() && !CROSSWEBEX_UTIL.typeEX())
							callback(param);
						else
							setTimeout(function () { callback(param) }, 5);
					}

				} else if (status == "BLOCK") {
					exlog(this.exPluginName + ".InvokeCallback", "license not valid");
					this.exDefaultCallbackName({ "NAME": this.exPluginName, "ERR": "BLOCK" });
				} else if (status == "BLOCK:EX") {
					exlog(this.exPluginName + ".InvokeCallback", "CrossEX sig check fail");
					this.exDefaultCallbackName({ "NAME": this.exPluginName, "ERR": "BLOCK:EX" });
				} else if (status == "BLOCK:CLIENT") {
					exlog(this.exPluginName + ".InvokeCallback", "Client sig check fail");
					this.exDefaultCallbackName({ "NAME": this.exPluginName, "ERR": "BLOCK:CLIENT" });
				} else if (status == "INTERNAL_ERROR") {
					if (response.reply && response.reply.match(/disconnected/gi).length > 0) {
						exlog(this.exPluginName + ".InvokeCallback", "CrossEXClient disconnect");
						this.exDefaultCallbackName({ "NAME": this.exPluginName, "ERR": "BLOCK:DISCONNECTED", "MSG": response.reply });
					} else {
						exlog(this.exPluginName + ".InvokeCallback", "CrossEXClient Internal Error");
						this.exDefaultCallbackName({ "NAME": this.exPluginName, "ERR": "BLOCK:INTERNAL", "MSG": response.reply });
					}
				} else {
					exlog(this.exPluginName + ".InvokeCallback", "native response status not TRUE");
					this.exDefaultCallbackName(response);
				}
			} catch (e) {
				exlog(this.exPluginName + ".InvokeCallback [exception]", e);
				exlog(this.exPluginName + ".InvokeCallback [exception]", "native response process exception");
				this.exDefaultCallbackName(response);
			}
		} else {
			exlog(this.exPluginName + ".InvokeCallback", "native call not response");
			this.exDefaultCallbackName();
		}
	};

	this.createInitEXURL = function (id, callback) {
		var param = "hostid=" + encodeURIComponent(hostid)
			+ "&id=" + encodeURIComponent(id)
			+ "&callback=" + encodeURIComponent(CROSSWEBEX_CONST.frameName + callback);
		url = this.createProtocolURL("Init", param);
		//exlog(this.exPluginName + ".createInitEXURL", url);
		return url;
	};

	this.createEXURL = function (id, callback) {
		var param = "hostid=" + encodeURIComponent(hostid)
			+ "&id=" + encodeURIComponent(id)
			+ "&callback=" + encodeURIComponent(CROSSWEBEX_CONST.frameName + callback);
		url = this.createProtocolURL("Call", param);
		//exlog(this.exPluginName + ".createEXURL", url);
		return url;
	};

	this.createProtocolURL = function (cmd, param) {
		var url = this.exProtocolName + "://" + dummyDomain + "/" + cmd + "?";
		if (param) {
			url += param;
			if (window.location.protocol == "https:") url += "&i=1&s=1";
		} else {
			if (window.location.protocol == "https:") url += "i=1&s=1";
		}

		//exlog(this.exPluginName + ".createProtocolURL", url);
		return url;
	};
};


/* 
 * CrossEX Util
 * CROSSWEBEX_UTIL
 */
var CROSSWEBEX_UTIL = {

	exlog: function (func, value) {

		if (CROSSWEBEX_CONST.debug) {
			//if(!window.console) console = {log:function(msg){alert(msg);}};
			if (!window.console) console = { log: function (msg) { } };

			var strlog;
			try {
				if (typeof value == "undefined") {
					strlog = "[undefined]";
				} else {
					if (typeof value == "function") {
						strlog = "[function] " + value;
					} else if (typeof value == "object") {
						try {
							strlog = "[json] " + JSON.stringify(value);
						} catch (e) {
							strlog = "[object] " + value;
						}
					} else if (typeof value == "number") {
						strlog = "[number] " + value;
					} else if (typeof value == "string") {
						strlog = "[string] " + value;
					} else if (typeof value == "boolean") {
						strlog = "[boolean] " + value;
					} else {
						strlog = "[other] " + value.toString();
					}
				}
			} catch (e) {
				strlog = " [exlog exception] " + typeof value;
			}

			console.log("[exlog] " + CROSSWEBEX_CONST.frameName + func + " : " + strlog);
			return;
		}
	},
	exalert: function (func, value) {

		if (CROSSWEBEX_CONST.debugAlert) {
			var msg;
			try {
				if (value) {
					if (typeof value == "object") {
						msg = JSON.stringify(value);
					} else if (typeof value == "function") {
						msg = value;
					} else if (typeof value == "number") {
						msg = value;
					} else if (typeof value == "string") {
						msg = value;
					} else if (typeof value == "boolean") {
						msg = value;
					} else {
						msg = value.toString();
					}
				}
			} catch (e) {
				msg = "[exception] " + value;
			}

			if (func) {
				if ("undefined" !== typeof INI_ALERT) {
					INI_ALERT(func + " : " + msg, "WARN");
				} else {
					alert(func + " : " + msg);
				}
			} else {
				if ("undefined" !== typeof INI_ALERT) {
					INI_ALERT(msg, "WARN");
				} else {
					alert(msg);
				}
			}
			return;
		}
	},
	findPath: function (currentFrame, tmpPath) {

		if (currentFrame == top) return "";

		var path, pathObj;
		if (!tmpPath) {
			pathObj = top;
			path = "top";
		} else {
			pathObj = tmpPath;
			path = tmpPath;
		}

		var frameCnt = pathObj.frames.length;
		for (var i = 0; i < frameCnt; i++) {
			var fr = pathObj.frames[i];
			if (currentFrame == fr) {
				return path + ".frames[" + i + "].";
			}
			try {
				if (fr.frames.length > 0) {
					var resultPath = CROSSWEBEX_UTIL.findPath(currentFrame, path + ".frames[" + i + "]");
					if (resultPath) {
						return resultPath;
					}
				}
			} catch (e) {
				exlog("_UTIL.findPath", "frame check error : " + path + "[" + i + "]");
				return;
			}
		}
		return;
	},
	getOSInfo: function () {
		var
			tp = navigator.platform,
			ua = navigator.userAgent,
			tem;

		//exlog("platform", tp);
		//exlog("userAgent", ua);
		var result = {};

		// platform
		if (tp == "Win32" || tp == "Win64") {
			if (ua.search("Windows Phone") >= 0) {
				result.platform = "Windows Phone";
				result.name = "Windows Phone";
			} else {
				result.platform = "WINDOWS";
			}
		} else if (tp == "MacIntel") {
			if ((ua.search("iPhone") >= 0) || (ua.search("iPad") >= 0) || (ua.search("iPod") >= 0)) {
				result.platform = "iOS";
				result.name = "iOS";
			} else {
				result.platform = "MACOSX";
			}
		} else if (tp.search("Linux") >= 0) {
			if (ua.search("Android") >= 0) {
				result.platform = "Android";
				result.name = "Android";
			} else {
				result.platform = "LINUX";
			}
		} else if (tp == "iPhone Simulator") {
			result.platform = "iOS";
			result.name = "iPhone Simulator";
		} else if (tp == "iPhone") {
			result.platform = "iOS";
			result.name = "iPhone";
		} else if (tp == "iPad") {
			result.platform = "iOS";
			result.name = "iPad";
		} else if (tp == "iPod") {
			result.platform = "iOS";
			result.name = "iPod";
		} else {
			result.platform = "UNKNOWN";
		}

		// version, bit
		if (result.platform == "WINDOWS") {
			if (ua.indexOf("Windows NT 5.1") != -1) { result.version = "5.1"; result.name = "XP"; }
			else if (ua.indexOf("Windows NT 5.2") != -1) { result.version = "5.2"; result.name = "XP"; }
			else if (ua.indexOf("Windows NT 6.0") != -1) { result.version = "6.0"; result.name = "VISTA"; }
			else if (ua.indexOf("Windows NT 6.1") != -1) { result.version = "6.1"; result.name = "7"; }
			else if (ua.indexOf("Windows NT 6.2") != -1) { result.version = "6.2"; result.name = "8"; }
			else if (ua.indexOf("Windows NT 6.3") != -1) { result.version = "6.3"; result.name = "8.1"; }
			else if (ua.indexOf("Windows NT 10.0") != -1) { result.version = "10.0"; result.name = "10"; }
			else if (ua.indexOf("Windows NT") != -1) {
				result.version = "UNKNOWN"; result.name = "UNKNOWN";
			} else {
				result.version = "UNKNOWN"; result.name = "UNKNOWN";
			}

			if (ua.indexOf("WOW64") != -1 || ua.indexOf("Win64") != -1) result.bit = "64";
			else result.bit = "32";

		} else if (result.platform == "MACOSX") {
			var ParseMacOSVersion = function (uaStr) {
				var version = null;
				var macver = uaStr.match(/Mac OS X [0-9]+[\.|_][0-9]+/);
				if (macver && macver !== null) {
					var data = macver[0].match(/[0-9]+/g);
					if ( data !== null && data[0] && data[1]) {
						version = {}
						version.major = parseInt(data[0]);
						version.minor = parseInt(data[1]);
						version.str = data[0] + "." + data[1];
					}
				}
				return version;
			};

			var parseVersion = ParseMacOSVersion(ua);

			result.version = "UNKNOWN"; result.name = "UNKNOWN";

			if ( parseVersion !== null ) {
				if		(parseVersion.str === "10.5" ) { result.version = parseVersion.str; result.name = "Leopard"; }
				else if (parseVersion.str === "10.6" ) { result.version = parseVersion.str; result.name = "Snow Leopard"; }
				else if (parseVersion.str === "10.7" ) { result.version = parseVersion.str; result.name = "Lion"; }
				else if (parseVersion.str === "10.8" ) { result.version = parseVersion.str; result.name = "Mountain Lion"; }
				else if (parseVersion.str === "10.9" ) { result.version = parseVersion.str; result.name = "Mavericks"; }
				else if (parseVersion.str === "10.10") { result.version = parseVersion.str; result.name = "Yosemite"; }
				else if (parseVersion.str === "10.11") { result.version = parseVersion.str; result.name = "El Capitan"; }
				else if (parseVersion.str === "10.12") { result.version = parseVersion.str; result.name = "Sierra"; }
				else if (parseVersion.str === "10.13") { result.version = parseVersion.str; result.name = "High Sierra"; }
				else if (parseVersion.str === "10.14") { result.version = parseVersion.str; result.name = "Mojave"; }
				else if (parseVersion.str === "10.15") { result.version = parseVersion.str; result.name = "Catalina"; }
				else if (parseVersion.major === 11) { result.version = parseVersion.str; result.name = "BigSur"; }
				else if (parseVersion.major === 12) { result.version = parseVersion.str; result.name = "Monterey"; }
				else if (parseVersion.major > 12 )  { result.version = parseVersion.str; result.name = "NewVersion"; }
			}
			result.bit = "64";

		} else if (result.platform == "LINUX") {
			result.version = "UNKNOWN"; result.name = "UNKNOWN";
		} else {
			result.version = "UNKNOWN"; result.name = "UNKNOWN";
		}

		//exlog("CROSSWEBEX_UTIL.getOSInfo.result", result);
		return result;
	},
	isWin: function () {
		var OSInfo = CROSSWEBEX_CONST.OSInfo.platform;
		if (!OSInfo) OSInfo = CROSSWEBEX_UTIL.getOSInfo().platform;
		if (OSInfo == "WINDOWS") return true;
		return false;
	},
	isMac: function () {
		var OSInfo = CROSSWEBEX_CONST.OSInfo.platform;
		if (!OSInfo) OSInfo = CROSSWEBEX_UTIL.getOSInfo().platform;
		if (OSInfo == "MACOSX") return true;
		return false;
	},
	isLinux: function () {
		var OSInfo = CROSSWEBEX_CONST.OSInfo.platform;
		if (!OSInfo) OSInfo = CROSSWEBEX_UTIL.getOSInfo().platform;
		if (OSInfo == "LINUX") return true;
		return false;
	},
	isMobile: function () {
		var OSInfo = CROSSWEBEX_CONST.OSInfo.platform;
		if (!OSInfo) OSInfo = CROSSWEBEX_UTIL.getOSInfo().platform;
		if (OSInfo == "iOS" || OSInfo == "Android" || OSInfo == "Windows Phone") return true;
		return false;
	},
	getBrowserInfo: function () {
		var
			tp = navigator.platform,
			N = navigator.appName,
			ua = navigator.userAgent,
			tem;
		var result, M;

		//exlog("appName", N);
		//exlog("userAgent", ua);

		// if Edge
		M = ua.match(/(edge)\/?\s*(\.?\d+(\.\d+)*)/i);
		M = M ? { "browser": "Edge", "version": M[2] } : M;

		// if opera
		if (!M) {
			M = ua.match(/(opera|opr)\/?\s*(\.?\d+(\.\d+)*)/i);
			if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) M[2] = tem[1];
			M = M ? { "browser": "Opera", "version": M[2] } : M;
		}

		// if IE7 under
		/**
		if(!M) {
			M = ua.match(/MSIE ([67].\d+)/);
			if(M) M = {"browser":"MSIE", "version":M[1]};
		}
		**/
		// others
		if (!M) {
			M = ua.match(/(msie|trident|chrome|safari|firefox)\/?\s*(\.?\d+(\.\d+)*)/i);
			if (M) {
				if ((tem = ua.match(/rv:([\d]+)/)) != null) {
					M[2] = tem[1];
				} else if ((tem = ua.match(/version\/([\.\d]+)/i)) != null) {
					M[2] = tem[1];
				}
				if (M[1] == "Trident") M[1] = "MSIE";
				M = M ? { "browser": M[1], "version": M[2] } : { "browser": N, "version1": navigator.appVersion, "other": '-?' };
			}
		}

		if (!M) {
			if (typeof Proxy) {
				M = { "browser": "Edge", "version": "" };
			}
		}

		if (!M) {
			return { "browser": "UNDEFINED", "version": "" };
		}

		if (M.version) {
			var verArr = (M.version).split(".");
			M.version = verArr[0];
		}

		// bit
		if (tp) {
			if (tp.toLowerCase().indexOf("win64") != -1) {
				M.bit = "64";
			} else if (tp.toLowerCase().indexOf("win32") != -1) {
				M.bit = "32";
			} else {
				M.bit = "";
			}
		}

		result = M;
		//exlog("CrossEXUtil.getBrowserInfo", result);
		return result;
	},
	getBrowserVer: function () {
		var browserInfo = CROSSWEBEX_CONST.browserInfo;
		if (!browserInfo) browserInfo = CROSSWEBEX_UTIL.getBrowserInfo();
		return browserInfo.version;
	},
	getBrowserBit: function () {
		var browserInfo = CROSSWEBEX_CONST.browserInfo;
		if (!browserInfo) browserInfo = CROSSWEBEX_UTIL.getBrowserInfo();
		return browserInfo.bit;
	},
	isIE: function () {
		var browserInfo = CROSSWEBEX_CONST.browserInfo;
		if (!browserInfo) browserInfo = CROSSWEBEX_UTIL.getBrowserInfo();
		if (browserInfo.browser.toLowerCase().indexOf("msie") != -1) {
			return true;
		} else {
			return false;
		}
	},
	isEdge: function () {
		var browserInfo = CROSSWEBEX_CONST.browserInfo;
		if (!browserInfo) browserInfo = CROSSWEBEX_UTIL.getBrowserInfo();
		if (browserInfo.browser.toLowerCase().indexOf("edge") != -1) {
			return true;
		} else {
			return false;
		}
	},
	isChrome: function () {
		// Chrome 1+
		//return !!window.chrome;
		var browserInfo = CROSSWEBEX_CONST.browserInfo;
		if (!browserInfo) browserInfo = CROSSWEBEX_UTIL.getBrowserInfo();
		if (browserInfo.browser.toLowerCase().indexOf("chrome") != -1) {
			return true;
		} else {
			return false;
		}
	},
	isFirefox: function () {
		// Firefox 1.0+
		//return typeof InstallTrigger !== 'undefined';
		var browserInfo = CROSSWEBEX_CONST.browserInfo;
		if (!browserInfo) browserInfo = CROSSWEBEX_UTIL.getBrowserInfo();
		if (browserInfo.browser.toLowerCase().indexOf("firefox") != -1) {
			return true;
		} else {
			return false;
		}
	},
	isOpera: function () {
		// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
		//return !!window.opera || navigator.userAgent.indexOf('Opera') >= 0  || navigator.userAgent.indexOf('OPR') >= 0;
		var browserInfo = CROSSWEBEX_CONST.browserInfo;
		if (!browserInfo) browserInfo = CROSSWEBEX_UTIL.getBrowserInfo();
		if (browserInfo.browser.toLowerCase().indexOf("opera") != -1) {
			return true;
		} else {
			return false;
		}
	},
	isSafari: function () {
		// At least Safari 3+: "[object HTMLElementConstructor]"
		//return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
		var browserInfo = CROSSWEBEX_CONST.browserInfo;
		if (!browserInfo) browserInfo = CROSSWEBEX_UTIL.getBrowserInfo();
		if ((browserInfo.browser).toLowerCase().indexOf("safari") != -1) {
			return true;
		} else {
			return false;
		}
	},
	typeEX: function () {
		if (CROSSWEBEX_CONST.exUseDaemon) return false;
		if (CROSSWEBEX_UTIL.isWin() && CROSSWEBEX_UTIL.isIE()) return true;
		return false;
	},
	typeExtension: function () {
		if (CROSSWEBEX_CONST.exUseDaemon) return false;
		if ((CROSSWEBEX_UTIL.isWin() || CROSSWEBEX_UTIL.isMac() || CROSSWEBEX_UTIL.isLinux()) &&
			(CROSSWEBEX_UTIL.isChrome() || CROSSWEBEX_UTIL.isFirefox() || (CROSSWEBEX_UTIL.isOpera() && CROSSWEBEX_UTIL.getBrowserVer() > 26))) return true;
		return false;
	},
	typePlugin: function () {
		if (CROSSWEBEX_CONST.exUseDaemon) return false;
		if ((CROSSWEBEX_UTIL.isWin() || CROSSWEBEX_UTIL.isMac()) && (CROSSWEBEX_UTIL.isSafari())) return true;
		return false;
	},
	typeDaemon: function () {
		if (CROSSWEBEX_CONST.exUseDaemon) return true;
		if (typeof CROSSWEBEX_UTIL.isEdge == "function") {
			if (CROSSWEBEX_UTIL.isEdge()) return true;
		}

		if (CROSSWEBEX_UTIL.isMac() && CROSSWEBEX_UTIL.isSafari() &&  CROSSWEBEX_UTIL.getBrowserVer() >= 12) return true;

		// CrossEX는 edge에 브라우저에 한하여 동작을 정식으로 지원
		// 복수개의 모듈을 구동하는 경우 솔루션 속성에 맞게 daemon 동작을 위한 조정이 필요함 
		// "max supportBrowser": ["EDGE","CHROME","FIREFOX","OPERA","MSIE"]
		if (CROSSWEBEX_UTIL.getOSInfo().platform == "WINDOWS" && CROSSWEBEX_UTIL.getOSInfo().name == "10") {
			if (typeof crosswebexInfo != "undefined") {
				var daemonInfo = crosswebexInfo.exEdgeInfo;
				var browserType = CROSSWEBEX_UTIL.getBrowserInfo().browser;
				if (daemonInfo && daemonInfo.isUse
					&& daemonInfo.supportBrowser instanceof Array
					&& daemonInfo.supportBrowser.length > 0) {
					for (var i = 0; i < daemonInfo.supportBrowser.length; i++) {
						var reqBrowser = daemonInfo.supportBrowser[i];
						if (browserType.toUpperCase() == reqBrowser.toUpperCase()) {
							return true;
						}
					}
				}
			}
		}
		return false;
	},
	chkOS: function (localOS, reqOS) {
		//exlog("_UTIL.chkOS.localOS", localOS);
		//exlog("_UTIL.chkOS.reqOS", reqOS);
		var os = localOS.platform.toUpperCase();
		var ver = localOS.version;
		if (os == "WINDOWS" || os == "MACOSX" || os == "LINUX") {
			var reqVer = reqOS[os];
			if (reqVer) {
				if (reqVer == "PASS" || reqVer == "ALL") {
					return true;
				} else if (reqVer == "NO") {
					return false;
				} else {
					if (ver == "UNKNOWN") return false;
					if (this.diffVersionOS(ver, reqVer)) {
						return true;
					} else {
						if (this.isWin() && this.isSafari()) {
							// windows safari는 win8 이상은 모두 6.2로 표시
							if (ver == "6.2" && (reqVer == "6.2" || reqVer == "6.3" || reqVer == "10.0")) {
								return true;
							}
						}
					}
				}
			}
		}
		return false;
	},
	chkBrowser: function (localBrowser, reqBrowser) {
		//exlog("_UTIL.chkBrowser.localBrowser", localBrowser);
		//exlog("_UTIL.chkBrowser.reqBrowser", reqBrowser);
		var browser = localBrowser.browser;
		var ver = parseInt(localBrowser.version);
		var reqVer = reqBrowser[browser.toUpperCase()];
		if (!reqVer) {
			if (this.isWin() && this.isSafari()) {
				reqVer = reqBrowser.SAFARI_WIN;
			} else if (this.isMac() && this.isSafari()) {
				reqVer = reqBrowser.SAFARI_MAC;
			} else {
				return false;
			}
		}

		if (reqVer) {
			if (reqVer == "PASS" || reqVer == "ALL") {
				return true;
			} else if (reqVer == "NO") {
				return false;
			} else {
				reqVer = parseInt(reqVer);
				if (ver >= reqVer) {
					return true;
				}
			}
		}
		return false;
	},
	createId: function () {
		var id = new Date().getTime() + "_" + CROSSWEBEX_UTIL.random();
		//exlog("CROSSWEBEX_UTIL.createId.id", id);
		return id;
	},
	/**
	 * true : 기존 설치된 모듈이 버전 더 높거나 같음
	 * false : 기존 설치된 모듈이 버전이 낮음. 업그레이드가 필요함.
	 */
	diffVersion: function (curVersion, svrVersion) {

		//exlog("_UTIL.diffVersion.client version", curVersion);
		//exlog("_UTIL.diffVersion.server version", svrVersion);
		var index;
		try {
			index = curVersion.indexOf('version:', 0);
		} catch (e) {
			return false;
		}

		if (index >= 0) {
			curVersion = curVersion.substring(index + 8, curVersion.length);
			var arrayOldVersion = curVersion.split('.');
			if (arrayOldVersion.length < 4) arrayOldVersion = curVersion.split(',');
			if (arrayOldVersion.length < 4) return false;
			var arrayNewVersion = svrVersion.split('.');

			for (var i = 0; i < 4; i++) {
				if (parseInt(arrayOldVersion[i], 10) > parseInt(arrayNewVersion[i], 10)) {
					return true;
				} else if (parseInt(arrayOldVersion[i], 10) < parseInt(arrayNewVersion[i], 10)) {
					return false;
				}
			}
			return true;
		} else {
			var arrayOldVersion = curVersion.split('.');
			if (arrayOldVersion.length < 4) arrayOldVersion = curVersion.split(',');
			if (arrayOldVersion.length < 4) return false;
			var arrayNewVersion = svrVersion.split('.');

			for (var i = 0; i < 4; i++) {
				if (parseInt(arrayOldVersion[i], 10) > parseInt(arrayNewVersion[i], 10)) {
					return true;
				} else if (parseInt(arrayOldVersion[i], 10) < parseInt(arrayNewVersion[i], 10)) {
					return false;
				}
			}
			return true;
		}
	},
	diffVersionOS: function (curVersion, svrVersion) {
        var arrayOldVersion = curVersion.split('.');
        var arrayNewVersion = svrVersion.split('.');
        if (isNaN(parseInt(arrayOldVersion[0], 10))) return false;
        for (var i = 0; i < arrayNewVersion.length; i++) {
			if (parseInt(arrayOldVersion[i], 10) > parseInt(arrayNewVersion[i], 10)) {
				return true;
			} else if (parseInt(arrayOldVersion[i], 10) < parseInt(arrayNewVersion[i], 10)) {
				return false;
			}
        }
        return true;
	},
	chkCrossEXDiv: function () {
		if (CROSSWEBEX_UTIL.typeEX()) {
			// div, iframe, form, script name _CONST set...
			CROSSWEBEX_CONST.exDivName = "crossexDiv";
			CROSSWEBEX_CONST.exIframeName = "crossexIfr";
			CROSSWEBEX_CONST.exScriptName = "crossexScr";
			CROSSWEBEX_CONST.exFormName = "__CROSSEX_FORM__";
			CROSSWEBEX_CONST.exFormDataName = "__CROSSEX_DATA__";

			var chk = document.getElementById(CROSSWEBEX_CONST.exDivName);
			if (!chk) {
				var exDiv = document.createElement("div");
				exDiv.id = CROSSWEBEX_CONST.exDivName;
				exDiv.style.display = "none";

				if (document.body) {
					document.body.appendChild(exDiv);
				} else {
					exalert("_UTIL.chkCrossEXDiv", CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_028); // "body 태그를 생성해 주십시오"
					return;
				}

				var exIframe = "<iframe ";
				exIframe += "title='" + CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_015 + "' "; // "CrosswebEx 선언"
				exIframe += "name='" + CROSSWEBEX_CONST.exIframeName + "' ";
				exIframe += "id='" + CROSSWEBEX_CONST.exIframeName + "' ";
				exIframe += "src='" + CROSSWEBEX_CONST.blankPath + "' ";
				exIframe += "width=0 height=0 border=0";
				exIframe += "></iframe>";
				chk = document.getElementById(CROSSWEBEX_CONST.exDivName);
				chk.innerHTML = exIframe;

				var exForm = document.createElement("form");
				exForm.method = "POST";
				exForm.id = CROSSWEBEX_CONST.exFormName;
				exForm.name = CROSSWEBEX_CONST.exFormName;

				var exNode = document.createElement("input");
				exNode.type = "hidden";
				exNode.id = CROSSWEBEX_CONST.exFormDataName;
				exNode.name = CROSSWEBEX_CONST.exFormDataName;

				exForm.appendChild(exNode);
				exDiv.appendChild(exForm);
			}
		}
		return;
	},
	loadScript: function (url) {

		var newScript = document.createElement("script");
		newScript.id = CROSSWEBEX_CONST.exScriptName;
		newScript.type = "text/javascript";
		if (newScript.readyState) { // IE8 under
			newScript.onreadystatechange = function () {
				exlog("_UTIL.loadScript.readyState", newScript.readyState);
				if (newScript.readyState == 'loading' || newScript.readyState == 'loaded') {
					newScript.onreadystatechange = null;
					exlog("_UTIL.loadScript", "loadScript load error");
					//exalert("_UTIL.loadScript", "loadScript load error");
				}
			};
		} else {
			newScript.onerror = function () {
				exlog("_UTIL.loadScript", "loadScript load error");
				//exalert("_UTIL.loadScript", "loadScript load error");
			};
		}

		try {
			newScript.src = url;
		} catch (e) {
			exlog("_UTIL.loadscript", "LoadScript not https load error");
			//exalert("_UTIL.loadScript", "LoadScript not https load error");
		}
		//exlog("CROSSWEBEX_UTIL.loadScript", url);
		//document.getElementsByTagName("head")[0].appendChild(newScript);
		window[CROSSWEBEX_CONST.exDivName].appendChild(newScript);
		//eval(CROSSWEBEX_CONST.exDivName).appendChild(newScript);
	},
	random: function () {
		try {
			if (!window['_ex_m_w']) window['_ex_m_w'] = 123456789;
			if (!window['_ex_m_z']) window['_ex_m_z'] = 987654321;
			if (!window['_ex_mask']) window['_ex_mask'] = 0xffffffff;

			_ex_m_z = (36969 * (_ex_m_z & 65535) + (_ex_m_z >> 16)) & _ex_mask;
			_ex_m_w = (18000 * (_ex_m_w & 65535) + (_ex_m_w >> 16)) & _ex_mask;
			var result = ((_ex_m_z << 16) + _ex_m_w) & _ex_mask;
			result /= 4294967296;
			return parseInt((result + 0.5) * 1000000).toString();
		} catch (e) {
			exlog("_UTIL.random", "random error");
		}
	},
	loadStringTable: function () {
		if (CROSSWEBEX_CONST.exLang == "KOR")	// KOREAN
			return CROSSWEBEX_STRINGTABLE.KOR;
		else if (CROSSWEBEX_CONST.exLang == "ENG")	// ENGLISH
			return CROSSWEBEX_STRINGTABLE.ENG;
		else if (CROSSWEBEX_CONST.exLang == "CHN")	// CHINESE
			return CROSSWEBEX_STRINGTABLE.CHN;
		else
			return CROSSWEBEX_STRINGTABLE.KOR;	// DEFAULT KOREAN
	},

	/************************************************************
	 * @brief		Name=Value 형식의 문자열을 JSON Object 로 변경
	 * @param nameValue				Name=Value&Name=Value 문자열
	 * @retval						JSON Object
	 ************************************************************/
	ConvertNameValueToJson: function (nameValue) {
		var jsonObject = {};
		if (nameValue) {
			var arrNameValue = nameValue.split("&");
			for (var i = 0; i < arrNameValue.length; i++) {
				var xa = arrNameValue[i].split("=");
				var name = xa[0];
				var value = xa[1];
				jsonObject[name] = value;
			}
		}
		return jsonObject;
	},

	/************************************************************
	 * @brief		JSON Object 의 value 값을 URL Decoding 함
	 * @param jsonObject			JSON Object
	 ************************************************************/
	URLDecodeJSONValue: function (jsonObject) {
		var jsonDecoded = {};
		for (var key in jsonObject) {
			if (jsonObject.hasOwnProperty(key)) {
				jsonDecoded[key] = decodeURIComponent(jsonObject[key].replace(/\+/g, '%20'));
			}
		}
		return jsonDecoded;
	},

	/************************************************************
	 * @brief		TEXT 다운로드
	 * @param url					다운로드 URL
	 * @param callback				콜백 함수
	 ************************************************************/
	DownloadText: function (url, callback) {
		var xml;
		if (window.XMLHttpRequest) {
			xml = new XMLHttpRequest();
		} else {
			xml = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xml.onreadystatechange = function () {
			if (xml.readyState == 4) {
				if (xml.status == 200) {
					callback(xml.responseText);
				} else {
					callback("");
				}
			}
		};
		xml.open("post", url, true);
		xml.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
		xml.send();
	},
	
	/************************************************************
	 * @brief		서버시간 취득
	 * @param url					서버시간 URL
	 * @param callback				콜백 함수
	 ************************************************************/
	GetServerTime: function (url, callback) {

		// 서버시간 URL 이 RpSync (Replay Attack 데이터) 가 아닌경우
		if (url.toLowerCase().indexOf('rpsync') === -1) {
			// 서버시간 URL 을 그대로 넘겨주도록 한다.
			callback(url);
			return;
		}

		// 서버시간 취득
		CROSSWEBEX_UTIL.DownloadText(url, callback);
	},

	/************************************************************
	 * @brief		JSON DATA 전송
	 * @param url					다운로드 URL
	 * @param jsonData				JSON DATA
	 * @param callback				콜백 함수
	 ************************************************************/
	PostDataWithJson: function (url, jsonData, callback) {
		$.ajax({
			type :"POST",
			url  : url,
			dataType:"json",
			data : jsonData,
			success: function (response) {
                try {
					if(response[0].CODE === "000"){
						callback(response);
					} else {
						callback("");
					}
                } catch (e) {
					callback("");
                }
            },
            error: function (request, status, error) {
				callback("");
            }
		})
	}

};

var CROSSWEBEX_STRINGTABLE = {
	"KOR": {
		"WARN": {
			"C_W_001": "콜백 함수 동작 중 오류가 발생하였습니다.",
			"C_W_002": "정책을 가져오지 못했습니다.",
			"C_W_003": "소스 복호화에 실패하였습니다",
			"C_W_004": "정의되지 않은 CA기관입니다.",
			"C_W_005": "초기화에 실패하였습니다.",
			"C_W_006": "현재 브라우저는 daemon 설치를 지원하지 않습니다.",
			"C_W_007": "chrome://extensions/ 에 접속하여 INISAFE CrossWeb EX 를 삭제하고 재설치하세요.",
			"C_W_008": "CrossWeb EX 부가기능을 설치하기 위하여 웹스토어에 접속합니다.",
			"C_W_009": "우측 상단 팝업차단을 확인해주세요.",
			"C_W_010": "CrossWeb EX 부가기능을 업데이트 합니다.",
			"C_W_011": "CrossWeb EX 부가기능을 설치합니다.",
			"C_W_012": "현재 브라우저는 extension 설치를 지원하지 않습니다.",
			"C_W_013": "지원하지 않는 운영체제입니다.",
			"C_W_014": "지원하지 않는 브라우저입니다.",
			"C_W_015": "CrossWeb EX 프로그램 서명 검증이 실패하였습니다.\n프로그램을 재설치하여 주십시오.",
			"C_W_016": "플러그인 체크를 실행하십시오.",
			"C_W_017": "플러그인이 모두 설치되지 않았습니다.",
			"C_W_018": "플러그인 정보가 필요합니다.",
			"C_W_019": "콜백이 필요합니다.",
			"C_W_020": "embed 태그 생성 실패",
			"C_W_021": " 확장 기능 설치를 완료 하였습니다.",
			"C_W_022": "Extension의 설치를 확인해주세요.",
			"C_W_023": " 라이센스를 확인하세요.",
			"C_W_024": " 프로그램이 정상적으로 설치되지 않았습니다.\n재설치 후 진행하여주십시오.",
			"C_W_025": " 프로그램이 중단되었습니다.\n페이지를 새로고침하세요.",
			"C_W_026": "실행중 오류가 발생하였습니다.(EX)",
			"C_W_027": "initEXInfoArr는 존재하지 않습니다.",
			"C_W_028": "body 태그를 생성해 주십시오",
			"C_W_029": "파라미터 생성중 오류가 발생하였습니다.",
			"C_W_030": "설치가 완료 되었습니다.\n이전 페이지로 돌아갑니다.",
			"C_W_031": "기능오류입니다. 관리자에게 문의 하기시 바랍니다!",
			"C_W_032": "INISAFE CrossWeb EX Client 에서 지원하지 않는 프로토콜을 사용 하였습니다.",
			"C_W_033": "허용하지 않는 도메인입니다."
		},

		"TEXT": {
			"C_T_001": "인증서 발급시 오류가 발생하여 인증서 발급에 실패하였습니다.",
			"C_T_002": "공동인증서 발급시 오류가 발생하여 인증서 발급에 실패하였습니다.",
			"C_T_003": "아래의 참조번호와 인가코드를 참조하시여 ",
			"C_T_004": "에서 발급 받으시기 바랍니다.",
			"C_T_005": "아래의 참조번호와 인가코드를 참조하시여 발급 받으시기 바랍니다.",
			"C_T_006": "참조번호 : ",
			"C_T_007": "인가코드 : ",
			"C_T_008": "CrossWeb EX 설치 안내",
			"C_T_009": " 브라우저별, OS별로 설명을 작성하는 부분....",
			"C_T_010": "<strong>[실행]버튼을 클릭</strong>하여 실행합니다.",
			"C_T_011": "<strong>[예]버튼을 클릭</strong>해주세요.",
			"C_T_012": "서비스 설치가 진행됩니다.",
			"C_T_013": "설치 완료 시, <strong>결제를 진행</strong>해 주십시오.",
			"C_T_014": "이상",
			"C_T_015": "CrossWeb EX 선언",
			"C_T_016": "새로고침",
			"C_T_017": "CrossWeb EX 확장기능 다운로드/설치 : ",
			"C_T_018": "CrossWeb EX 다운로드/설치 : ",
			"C_T_019": "CrossWeb EX 다운로드/설치(리눅스) : ",
			"C_T_020": "INISAFE CrossWeb EX 보안 프로그램 설치",
			"C_T_021": "하드/이동식 디스크 사용을 원하시면 아래의 프로그램을 설치 하시기바랍니다.",
			"C_T_022": "프로그램은 OS(맥 , 윈도우)에 맞게 다운로드 바랍니다.",
			"C_T_023": "확장기능 다운로드",
			"C_T_024": "통합 설치 가기",
			"C_T_025": "CrossWeb EX 다운로드/설치 ",
			"C_T_026": "고객센터"
		}
	},

	"ENG": {
		"WARN": {
			"C_W_001": "An error has occurred during operation of callback function.",
			"C_W_002": "Policy loading failed.",
			"C_W_003": "Source decryption failed.",
			"C_W_004": "Certification authority is undefined.",
			"C_W_005": "Initialization failed.",
			"C_W_006": "Current browser does not support installation of Daemon.",
			"C_W_007": "Open chrome://extensions/ to delete and reinstall INISAFE CrossWeb EX.",
			"C_W_008": "Connect to Web Store and install the CrossWeb EX extension.",
			"C_W_009": "Check pop-up block in the top right corner.",
			"C_W_010": "Update the CrossWeb EX extension.",
			"C_W_011": "Install the CrossWeb EX extension.",
			"C_W_012": "Current browser does not support installation of extensions.",
			"C_W_013": "This operating system is not supported.",
			"C_W_014": "This web browser is not supported.",
			"C_W_015": "Signature verification of the CrossWeb EX program has failed.\nPlease reinstall the program.",
			"C_W_016": "Run plugin check.",
			"C_W_017": "Plugins are not installed completely.",
			"C_W_018": "Plugin information is required.",
			"C_W_019": "Callback is necessary.",
			"C_W_020": "Failed to create embed tag",
			"C_W_021": " Installation of the extension is complete.",
			"C_W_022": "Check installation of the extension.",
			"C_W_023": " Check the license.",
			"C_W_024": " The program was not installed properly.\nPlease reinstall the program.",
			"C_W_025": " The program has stopped.\nRefresh the page.",
			"C_W_026": "An error has occurred during execution. (EX)",
			"C_W_027": "initEXInfoArr does not exist.",
			"C_W_028": "Create a body tag.",
			"C_W_029": "An error has occurred while creating parameter.",
			"C_W_030": "Intallation is complete.\nYou will be redirected to the previous page.",
			"C_W_031": "A function error has occurred. Please contact the administrator!",
			"C_W_032": "This protocol is not supported in INISAFE CrossWeb EX Client.",
			"C_W_033": "The domain is not accepted."
		},

		"TEXT": {
			"C_T_001": "Issuance of certificate failed because of an error.",
			"C_T_002": "Issuance of certificate failed because of an error during issuance of public key certificate.",
			"C_T_003": "Refer to reference number and authorization code below for issuance from ",
			"C_T_004": ".",
			"C_T_005": "Refer to reference number and authorization code below for issuance.",
			"C_T_006": "Reference number : ",
			"C_T_007": "Authorization code : ",
			"C_T_008": "CrossWeb EX installation guide",
			"C_T_009": "Description for each web browser and OS",
			"C_T_010": "<strong>Click [Run] button</strong> to run.",
			"C_T_011": "<strong>Click [Yes] button.</strong>",
			"C_T_012": "The service will be installed.",
			"C_T_013": "<strong>Proceed with payment</strong> after completing installation.",
			"C_T_014": "after",
			"C_T_015": "CrossWeb EX declaration",
			"C_T_016": "Refresh",
			"C_T_017": "Downloading / installation of the CrossWeb EX extension: ",
			"C_T_018": "Downloading / installation of the CrossWeb EX : ",
			"C_T_019": "Downloading / installation of the CrossWeb EX(Linux) : ",
			"C_T_020": "Installation of the INISAFE CrossWeb EX",
			"C_T_021": "Install the following program to use a hard disk or removable disk.",
			"C_T_022": "Download the program appropriate for your OS (Mac, Windows).",
			"C_T_023": "Extension download",
			"C_T_024": "Combined installation",
			"C_T_025": "Downloading / installation of the CrossWeb EX ",
			"C_T_026": "Contact Us"
		}
	},

	"CHN": {
		"WARN": {
			"C_W_001": "回调函数执行时发生错误.",
			"C_W_002": "无法导入政策.",
			"C_W_003": "资源解码失败.",
			"C_W_004": "该CA机构未定义.",
			"C_W_005": "初始化失败.",
			"C_W_006": "当前浏览器不支持安装daemon.",
			"C_W_007": "请访问chrome://extensions/，删除INISAFE CrossWeb EX后重新安装.",
			"C_W_008": "访问网上商店，安装CrossWeb EX的附加功能.",
			"C_W_009": "请查看右上方的屏蔽弹窗.",
			"C_W_010": "更新CrossWeb EX附加功能.",
			"C_W_011": "安装CrossWeb EX附加功能.",
			"C_W_012": "当前浏览器不支持安装extension.",
			"C_W_013": "不支持该操作系统.",
			"C_W_014": "不支持该浏览器",
			"C_W_015": "CrossWeb EX程序签名验证失败.\n请重新安装程序.",
			"C_W_016": "请运行检查插件.",
			"C_W_017": "所有插件均未安装.",
			"C_W_018": "需要插件信息.",
			"C_W_019": "需要回调.",
			"C_W_020": "embed标签创建失败",
			"C_W_021": " 扩展功能已安装.",
			"C_W_022": "请确认Extension的安装.",
			"C_W_023": " 请查看许可证.",
			"C_W_024": " 程序安装异常.\n请重新安装后再进行.",
			"C_W_025": " 程序中断.\n请刷新页面.",
			"C_W_026": "运行时发生错误.(EX)",
			"C_W_027": "initEXInfoArr不存在.",
			"C_W_028": "请创建body标签.",
			"C_W_029": "创建参数时发生错误.",
			"C_W_030": "安装已完成.\n将跳转至上一页面.",
			"C_W_031": "功能错误.请咨询管理员！",
			"C_W_032": "使用了INISAFE CrossWeb EX Client不支持的协议.",
			"C_W_033": "不允许使用此域."
		},

		"TEXT": {
			"C_T_001": "颁发证书时发生错误，证书颁发失败.",
			"C_T_002": "颁发公认证书时发生错误，证书颁发失败.",
			"C_T_003": "请参照参考号和许可号在 ",
			"C_T_004": "接受颁发.",
			"C_T_005": "请参照参考号和许可号接受颁发.",
			"C_T_006": "参考号 : ",
			"C_T_007": "许可号 : ",
			"C_T_008": "CrossWeb EX安装说明",
			"C_T_009": " 按照不同的浏览器及操作系统来编写说明的部分....",
			"C_T_010": "点击<strong>[运行]</strong>按钮运行.",
			"C_T_011": "请点击<strong>[是]</strong>.",
			"C_T_012": "将安装服务.",
			"C_T_013": "安装完毕后请<strong>进行结算</strong>.",
			"C_T_014": "以上",
			"C_T_015": "声明CrossWeb EX",
			"C_T_016": "更新",
			"C_T_017": "下载/安装CrossWeb EX扩展功能：",
			"C_T_018": "下载/安装CrossWeb EX：",
			"C_T_019": "下载/安装CrossWeb EX（Linux）：",
			"C_T_020": "安装INISAFE CrossWeb EX安全软件",
			"C_T_021": "若您想使用硬盘或移动硬盘，请安装以下程序.",
			"C_T_022": "请根据操作系统（MAC、WINDOWS）下载相应程序.",
			"C_T_023": "下载扩展功能",
			"C_T_024": "前往统一安装",
			"C_T_025": "下载/安装CrossWeb EX ",
			"C_T_026": "顾客服务"
		}
	}
};

window.exlog = CROSSWEBEX_UTIL.exlog;
window.exalert = CROSSWEBEX_UTIL.exalert;

