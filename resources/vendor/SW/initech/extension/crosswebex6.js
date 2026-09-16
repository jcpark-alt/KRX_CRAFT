/**
 * INITECH INISAFE CrossWeb EX v3.1.18
 * Date : 2018-02-05
 * @copyright Initech Co., Ltd. All rights reserved.
*/

/************************************************************
 * @brief		기반 경로 설정
 ************************************************************/
var crosswebexBaseDir = "/resources/vendor/SW/initech/extension";
var INI_html5BasePath = "/resources/vendor/SW/initech/webui";
var inihubPagePath = "";

var IniSafeCrossWebEx = {};
var isInihubOndemand = false;
var inihubVersion = "";

function isParentInihubIframe() {
	try {
		// self와 top이 다른 경우 iframe이다.
		if (window.self !== window.top) {
			var currentPath = window.location.pathname || "";
			if (currentPath.indexOf("/client/inihub_iframe.html") !== -1) {
				inihubPagePath = "webui";
				inihubVersion = "V2";
			} else if (currentPath.indexOf("/ui/inihub_iframe.html") !== -1) {
				inihubPagePath = "/ui/webui";
				inihubVersion = "V1";
			} else {
				inihubVersion = "";
				return false;
			}

			crosswebexBaseDir = inihubPagePath + crosswebexBaseDir;
			INI_html5BasePath = inihubPagePath + INI_html5BasePath;
			return true;
		}
		
		inihubVersion = "";
		return false;
	} catch (e) {
		return false;
	}
}

isInihubOndemand = isParentInihubIframe();

/**
 * JS 로더
 * 
 * @private
 * @param {*} url				URL
 * @param {*} callback			콜백 함수
 * @param {*} charset			문자열 형식
 * @param {*} attribute			속성
 * @returns 리턴 없음.
 */
function jsloader(url, callback, charset, attribute) {
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = "text/javascript";

	if (!charset) {
		script.charset = "utf-8";
	};

	script.src = url;

	if (attribute && (attribute.length > 0)) {
		for (var aint = 0; aint < attribute.length; aint++) {
			script.setAttribute(attribute[aint].key, attribute[aint].value);
		}
	}

	if (callback && typeof (callback) === typeof (Function)) {
		//Modern browsers (IE9+)
		if (script.addEventListener) {
			script.addEventListener('load', callback, false);
		}
		else//(IE8-)
		{
			script.onreadystatechange = function () {
				if (script.readyState in { loaded: 1, complete: 1 }) {
					script.onreadystatechange = null;
					callback();
				}
			};
		}
	}

	head.appendChild(script);
}

/**
 * JS 로더, promise
 * 
 * @private
 * @param {*} url			URL
 * @param {*} charset		문자열 형식
 * @param {*} attribute		속성
 * @returns					리턴 없음.
 */
function jsloaderWithPromise(url, charset, attribute) {
	return new Promise(function (jsloaderResolve, reject) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = "text/javascript";

		if (!charset) {
			script.charset = "utf-8";
		};

		script.src = url;

		if (attribute && (attribute.length > 0)) {
			for (var aint = 0; aint < attribute.length; aint++) {
				script.setAttribute(attribute[aint].key, attribute[aint].value);
			}
		}


		//Modern browsers (IE9+)
		if (script.addEventListener) {
			script.addEventListener('load', jsloaderResolve, false);
		}
		else//(IE8-)
		{
			script.onreadystatechange = function () {
				if (script.readyState in { loaded: 1, complete: 1 }) {
					script.onreadystatechange = null;
					jsloaderResolve();

				}
			};
		}

		head.appendChild(script);
	});
}

/**
 * CSS 로더
 *
 * @private
 * @param {*} url			URL
 * @param {*} callback		콜백함수
 * @param {*} charset		문자열 형식
 * @returns 리턴 없음.
 */
function cssloader(url, callback, charset) {
	var head = document.getElementsByTagName('head')[0];
	var css = document.createElement('link');
	css.rel = "stylesheet";
	css.type = "text/css";
	if (!charset) {
		css.charset = "utf-8";
	};
	css.href = url;
	head.appendChild(css);
	if (callback) {
		callback();
	}
}

/**
 * CSS 로더, promise
 *
 * @private
 * @param {*} url			URL
 * @param {*} charset		문자열 형식
 * @returns 리턴 없음.
 */
function cssloaderWithPromise(url, charset) {
	return new Promise(function (cssloaderResolve, cssloaderReject) {
		var head = document.getElementsByTagName('head')[0];
		var css = document.createElement('link');
		css.rel = "stylesheet";
		css.type = "text/css";
		if (!charset) {
			css.charset = "utf-8";
		};
		css.href = url;
		head.appendChild(css);
		cssloaderResolve();
	});
}

/**
 * 플랫폼 정보 취득
 *
 * @export
 * @returns platformInfo 플랫폼 정보
 */
function INI_getPlatformInfo() {
	var platformInfo = {
		Windows: false, Linux: false, Ubuntu: false, Fedora: false, Mac: false, iOS: false, Android: false,
		Mobile: false, x64: false,
		type: "unknown", name: "unknown"
	};
	platformInfo.name = navigator.platform;
	if (navigator.appVersion.match("WOW64")) platformInfo.name = "WOW64";

	if (platformInfo.name.match(/Win32/i) || platformInfo.name.match(/WOW64/i)) {
		platformInfo.Windows = true;
		platformInfo.type = "Windows";
		if (navigator.appVersion.match(/Win64/i)) {
			platformInfo.name = "Win64";
			platformInfo.x64 = true;
			platformInfo.type = "Windows64";
		}
	} else if (platformInfo.name.match("Win64")) {
		platformInfo.Windows = true;
		platformInfo.x64 = true;
		platformInfo.type = "Windows64";
	} else if (platformInfo.name.match("Linux armv")) {
		platformInfo.Mobile = true;
		platformInfo.Android = true;
		platformInfo.type = "Android";
	} else if (platformInfo.name.match(/Linux/i)) {
		platformInfo.Linux = true;
		platformInfo.type = "Linux";
		if (platformInfo.name.match(/x86_64/i)) {
			platformInfo.x64 = true;
			platformInfo.type = "Linux64";
		} else if (navigator.userAgent.match(/x86_64/i)) { //Opera
			platformInfo.x64 = true;
			platformInfo.type = "Linux64";
		}
		if (navigator.userAgent.match(/Fedora/i)) {
			platformInfo.Fedora = true;
			platformInfo.type = "Fedora";
			if (platformInfo.x64) platformInfo.type = "Fedora64";
		} else if (navigator.userAgent.match(/Ubuntu/i)) {
			platformInfo.Ubuntu = true;
			platformInfo.type = "Ubuntu";
			if (platformInfo.x64) platformInfo.type = "Ubuntu64";
		} else if (navigator.userAgent.match(/Android/i)) { //modify 20150903: Samsung Galaxy Edge
			platformInfo.Linux = false;
			platformInfo.Mobile = true;
			platformInfo.Android = true;
			platformInfo.type = "Android";
		}
	} else if (platformInfo.name.match(/MacIntel/i)) {
		platformInfo.Mac = true;
		platformInfo.type = "Mac";
	} else if (platformInfo.name == "iPad"
		|| platformInfo.name == "iPhone"
		|| platformInfo.name == "iPod"
		|| platformInfo.name == "iOS") {
		platformInfo.Mobile = true;
		platformInfo.iOS = true;
		platformInfo.type = "iOS";
	}

	if ((navigator.userAgent.match(/iPhone/i)) ||
		(navigator.userAgent.match(/iPod/i)) ||
		(navigator.userAgent.match(/iPad/i)) ||
		(navigator.userAgent.match(/Android/i))) {
		platformInfo.Mobile = true;
	}
	if ((navigator.userAgent.match(/Windows Phone/i)) ||
		(navigator.userAgent.match(/Windows CE/i)) ||
		(navigator.userAgent.match(/Symbian/i)) ||
		(navigator.userAgent.match(/BlackBerry/i))) {
		platformInfo.Mobile = true;
	}

	//modify/remove system type
	if (navigator.userAgent.match("Android") && navigator.userAgent.match("Opera Mini")) {
		platformInfo.Mobile = true;
		platformInfo.Android = true;
		platformInfo.type = "Android";
	}
	return platformInfo;
}

/**
 * HTML5 지원 여부
 * 
 * @private
 * @returns {boolean}	true: HTML5 지원, false: HTML5 지원 안함
 */
var GINI_supportHtml5 = function () {

	if (INI_getPlatformInfo().Mobile) {
		return true;
	}

	var agentInfo = navigator.userAgent.toLowerCase();
	var app, ver;

	// IE 6
	if (agentInfo.indexOf("msie 6") != -1) {
		// HTML5 지원 안함
		return false;
	// IE 7
	} else if (agentInfo.indexOf("msie 7") != -1) {
		// HTML5 지원 안함
		return false;
	// IE 8
	} else if (agentInfo.indexOf("msie 8") != -1) {
		// HTML5 지원 안함
		return false;
	// IE 9
	} else if (agentInfo.indexOf("msie 9") != -1) {
		// HTML5 지원 안함
		return false;
	// IE 10
	} else if (agentInfo.indexOf("msie 10") != -1) {
		// HTML5 지원 안함
		return true;
	} else if (agentInfo.indexOf("edge") != -1) {
		ver = getInternetVersion("Edge");
		console.log('Browser : Edge version: ' + ver);
		// HTML5 지원 안함
		if (ver < 13) {
			return false;
		}

	//Non IE	
	} else {
		
		// OPERA
		if (agentInfo.indexOf("opr") != -1) {
			ver = getInternetVersion("OPR");
			console.log('Browser : OPR version: ' + ver);
			if (ver < 27) {
				return false;
			}

		// OPERA
		} else if (agentInfo.indexOf("opera") != -1) {
			if (agentInfo.indexOf("Version") != -1) {
				ver = getInternetVersion("Version");
			}
			else {
				ver = getInternetVersion("Opera");
			}	
			console.log('Browser : Opera version: ' + ver);
			if (ver < 27) {
				return false;
			}
		 
		// CHROME
		} else if (agentInfo.indexOf("chrome") != -1) {
			ver = getInternetVersion("Chrome");
			console.log('Browser : Chrome version: ' + ver);
			if (ver < 38) {
				return false;
			}
		 
		// FIREFOX
		} else if (agentInfo.indexOf("firefox") != -1) {
			ver = getInternetVersion("Firefox");
			console.log('Browser : Firefox version: ' + ver);
			if (ver < 37) {
				return false;
			}
		 
		// SAFARI
		} else if (agentInfo.indexOf("safari") != -1) {
			if (agentInfo.indexOf("Version") != -1) {
				ver = getInternetVersion("Version");
			}
			else {
				ver = getInternetVersion("Safari");
			}
			
			console.log('Browser : Safari version: ' + ver);
			if (ver < 6) {
				return false;
			}
		   }

	}	

	return true;
}

/**
 * 브라우저별 버전 정보 취득
 *
 * @private
 * @param {string} ver		브라우저별 버전을 구분하는 키워드(ex. Chrome, Firefox, Version, Safari, etc)
 * @returns {int}			정수형 버전 정보		
 */
function getInternetVersion(ver) {
	var rv = -1; // Return value assumes failure.
	var ua = navigator.userAgent;
	var re = null;
   
	if (ver == "MSIE") {
	 re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	} else if (ver == "Edge") {
		re = new RegExp(ver + "/([0-9]{1,})(\\.{0,}[0-9]{0,1})");
	}
	else {
		re = new RegExp(ver + "/([0-9]{1,}[\.0-9]{0,})");
	 	  
	}
   
	if (re.exec(ua) != null) {
	 rv = parseFloat(RegExp.$1);
	}
	return rv;
   }

/**
 * 구간 암호화 지원 여부
 *
 * @private
 * @returns {boolean} 	true: 구간 암호화 적용, false: 구간 암호화 적용 안함.
 */
var GINI_supportEncryptHtml5 = function () {
	return true;
}

/************************************************************
 * @brief		스크립트 로드
 ************************************************************/
var GINI_DYNAMIC_LOAD = (function () {
	var customerConf = undefined;
	var externalFunc = undefined;

	var dummyTime = "?dt=" + (new Date()).getTime();
	var loadCSSAndScript = function () {

		// Mobile 로드
		if (INI_getPlatformInfo().Mobile) {
			var afterLoadPromise = function () {
				// css
				var loadCss = function () {
					return new Promise(function (loadCssResolve, loadCssReject) {
						cssloaderWithPromise(INI_html5BasePath + "/res/css/jqueryui/jquery-ui.css", "utf-8")
							.then(function () {
								return cssloaderWithPromise(INI_html5BasePath + "/res/css/jqueryui/jquery-ui.theme.css", "utf-8");
							}).then(function () {
								return cssloaderWithPromise(INI_html5BasePath + "/res/css/initechBlueCommon.css", "utf-8");
							}).then(function () {
								if (INI_getPlatformInfo().iOS) {
									return cssloaderWithPromise(INI_html5BasePath + "/res/css/mobile/m_certificate_ios.css", "utf-8");
								} else {
									return cssloaderWithPromise(INI_html5BasePath + "/res/css/mobile/m_certificate.css", "utf-8");
								}
							}).then(function () {
								return cssloaderWithPromise(INI_html5BasePath + "/res/css/mobile/m_color_blue.css", "utf-8");
							}).then(function () {
								loadCssResolve();
							})
					});
				};

				// 라온키패드
				var loadTransKey = function () {
					return new Promise(function (loadTransKeyResolve, loadTransKeyReject) {
						jsloaderWithPromise("/SW/vender/mTranskey/rsa_oaep_files/rsa_oaep-min.js" + dummyTime, "utf-8")
							.then(function () {
								return jsloaderWithPromise("/SW/vender/mTranskey/jsbn/jsbn-min.js" + dummyTime, "utf-8");
							}).then(function () {
								return jsloaderWithPromise("/SW/vender/mTranskey/TranskeyLibPack_op.js" + dummyTime, "utf-8");
							}).then(function () {
								return jsloaderWithPromise("/transkeyServlet?op=getToken&" + new Date().getTime(), "utf-8");
							}).then(function () {
								return jsloaderWithPromise("/SW/vender/mTranskey/transkey.js" + dummyTime, "utf-8");
							}).then(function () {
								return cssloaderWithPromise("/SW/vender/mTranskey/transkey.css", "utf-8");
							}).then(function () {
								loadTransKeyResolve();
							});
					});
				};

				// 안랩키패드
				var loadAhnlabKey = function () {
					return new Promise(function (loadAhnlabKeyResolve, loadAhnlabKeyReject) {
						jsloaderWithPromise("/SW/vender/ahnlab/astx2.min.js" + dummyTime, "utf-8")
							.then(function () {
								return jsloaderWithPromise("/SW/vender/ahnlab/astx2_custom.js" + dummyTime, "utf-8");
							}).then(function () {
								loadAhnlabKeyResolve();
							});
					});
				};

				// 유니키패드
				var loadUniwebKey = function () {
					return new Promise(function (loadUniwebKeyResolve, loadUniwebKeyReject) {
						jsloaderWithPromise("/SW/vender/unikey/keypad/uniwebkey/js/uniwebkey_sp_20161214.min.js" + dummyTime, "utf-8")
							.then(function () {
								return jsloaderWithPromise("/SW/vender/unikey/keypad/uniwebkey/js/uniwebkey_can_debug_20160812.min.js" + dummyTime, "utf-8");
							}).then(function () {
								return cssloaderWithPromise("/SW/vender/unikey/keypad/uniwebkey/css/uniwebkey_w2ui.css" + dummyTime, "utf-8");
							}).then(function () {
								loadUniwebKeyResolve();
							});
					});
				};

				// manifest
				var loadManifest = function () {
					return new Promise(function (loadManifestResolve, loadManifestReject) {
						($ || jQuery).ajax({
							dataType: "json",
							url: INI_html5BasePath+"/manifest.json?bust=" + new Date().getTime(),
							async: false,
							success: function (response) {
								window["GINI_MANIFEST"] = response;
								loadManifestResolve();
							}
						});
					});
				};

				
				// CrossKey manifest
				var loadCrossKeyManifest = function () {
					return new Promise(function (loadManifestResolve, loadManifestReject) {
						($ || jQuery).ajax({
							dataType: "json",
							url: "/SW/vender/CrossKey/manifest.json?bust=" + new Date().getTime(),
							async: false,
							success: function (response) {
								window["GCROSSKEY_MANIFEST"] = response;
								loadManifestResolve();
							}
						});
					});
				};

				// CrossKey
				var loadCrossKey = function () {
					return new Promise(function (loadCrossKeyResolve, loadCrossKeyReject) {
						loadCrossKeyManifest().then(function(){
							return jsloaderWithPromise(GCROSSKEY_MANIFEST["CrossKey.js"], "utf-8");
						}).then(function () {
							return jsloaderWithPromise("/SW/vender/CrossKey/CrossKeyIntf.js" + dummyTime, "utf-8");
						}).then( function() {
							loadCrossKeyResolve();
						});
					});
				};
				/*
				var loadCrossKey = function () {
					return new Promise(function (loadCrossKeyResolve, loadCrossKeyReject) {
						jsloaderWithPromise("/CrossKey/CrossKey.js" + dummyTime, "utf-8")
						.then(function () {
							return jsloaderWithPromise("/CrossKey/CrossKeyIntf.js" + dummyTime, "utf-8");
						}).then( function() {
							loadCrossKeyResolve();
						});
					});
				};
				*/
				
				var loadRelayJS = function () {
					return new Promise(function (resolve, reject) {
						if (Html5Adaptor.GetDefaultConf().OpenStorage && Html5Adaptor.GetDefaultConf().OpenStorage.USE == "Y"
						&& INI_getPlatformInfo().iOS) {
							jsloader(Html5Adaptor.GetDefaultConf().OpenStorage.RELAY_CERT_URL + dummyTime, resolve, "utf-8");
						} else {
							resolve();
						}
					});
				};

				var loadcwui = function() {
					return new Promise(function(loadcwuiRelove, loaccwuiReject) {
						loadManifest().then(function(){
							Promise.all([
								jsloaderWithPromise(GINI_MANIFEST["INIforgeCrypto.js"]),
								jsloaderWithPromise(GINI_MANIFEST["cwui_conf.js"]),
								jsloaderWithPromise(GINI_MANIFEST["cwui_core.js"]),
								jsloaderWithPromise(GINI_MANIFEST["cwui.js"])
							]).then(function(){
								console.log("cwui load");
								var wait_cwui = function() {
									if ( cwui.isReady === true ) {
										loadcwuiRelove();
									} else {
										setTimeout(wait_cwui, 5);
									}
								};
								setTimeout(wait_cwui, 0); 
							});
						})
					});
				}

				Promise.all([
					//loadCrossKey()
					//, loadTransKey()
					//, loadUniwebKey()
					jsloaderWithPromise(INI_html5BasePath + "/cw_web6_neo_adt.js" + dummyTime, "utf-8")
					, jsloaderWithPromise(INI_html5BasePath + "/initechGlobal.js" + dummyTime, "utf-8")
					, loadCss()
				]).then(function () {
					return loadcwui();
				}).then(function () {
					return loadRelayJS();
				}).then(function () {
					return jsloaderWithPromise(INI_html5BasePath + "/3rd_interface.js" + dummyTime, "utf-8");
				}).then(function () {
					changeThirdPartyCompleted();
				});
			};

			// promise 라이브러리가 완전히 로드된 후에 진행한다.
			//document.write("<script type='text/javascript' src='https://fidoweb.yessign.or.kr:3100/v2/opencert.js'></script>");
			jsloader(crosswebexBaseDir + "/common/js/bluebird-3.5.0.min.js" + dummyTime, afterLoadPromise, "utf-8");
			//jsloader(INI_html5BasePath + "/lib/promise/bluebird-3.5.0.min.js" + dummyTime, afterLoadPromise, "utf-8");

			// PC 로드
		} else {
			/************************************************************
			 * CrossWeb EX JavaScript 로딩
			 ************************************************************/
			//document.write("<script type='text/javascript' src='https://fidoweb.yessign.or.kr:3100/v2/opencert.js'></script>");

			var afterLoadPromise = function () {
				// 라온키패드
				var loadTransKey = function () {
					/*
					return new Promise(function (loadTransKeyResolve, loadTransKeyReject) {
						jsloaderWithPromise("/resources/vendor/transkey/rsa_oaep_files/rsa_oaep-min.js" + dummyTime, "utf-8")
							.then(function () {
								return jsloaderWithPromise("/resources/vendor/transkey/jsbn/jsbn-min.js" + dummyTime, "utf-8");
							}).then(function () {
								return jsloaderWithPromise("/resources/vendor/transkey/TranskeyLibPack_op.js" + dummyTime, "utf-8");
							}).then(function () {
								return jsloaderWithPromise("/api/discls/vendor/raon/transkey-servlet?op=getToken&" + new Date().getTime(), "utf-8");
							}).then(function () {
								return jsloaderWithPromise("/resources/vendor/transkey/transkey.js" + dummyTime, "utf-8");
							}).then(function () {
								return cssloaderWithPromise("/resources/vendor/transkey/transkey.css", "utf-8");
							}).then(function () {
								loadTransKeyResolve();
							});
					});
					*/

					return new Promise(function (loadTransKeyResolve, loadTransKeyReject) {
						// transkey.js, transkey_config.js, transkey.css는
						// HTML에서 이미 로드되었으므로 바로 완료 처리
						loadTransKeyResolve();
					});

				};

				// 안랩키보드
				var loadAhnlabKey = function () {
					return new Promise(function (loadAhnlabKeyResolve, loadAhnlabKeyReject) {
						jsloaderWithPromise("/SW/vendor/ahnlab/astx2.min.js" + dummyTime, "utf-8")
							.then(function () {
								return jsloaderWithPromise("/SW/vender/ahnlab/astx2_custom.js" + dummyTime, "utf-8");
							}).then(function () {
								loadAhnlabKeyResolve();
							});
					});
				};

				// 유니키패드
				var loadUniwebKey = function () {
					return new Promise(function (loadUniwebKeyResolve, loadUniwebKeyReject) {
						jsloaderWithPromise("/SW/vender/unikey/keypad/uniwebkey/js/uniwebkey_sp_20161214.min.js" + dummyTime, "utf-8")
							.then(function () {
								return jsloaderWithPromise("/SW/vender/unikey/keypad/uniwebkey/js/uniwebkey_can_debug_20160812.min.js" + dummyTime, "utf-8");
							}).then(function () {
								return cssloaderWithPromise("/SW/vender/unikey/keypad/uniwebkey/css/uniwebkey_w2ui.css" + dummyTime, "utf-8");
							}).then(function () {
								loadUniwebKeyResolve();
							});
					});
				};

				// manifest
				var loadManifest = function () {
					return new Promise(function (loadManifestResolve, loadManifestReject) {
						($ || jQuery).ajax({
							dataType: "json",
							url: INI_html5BasePath+"/manifest.json?bust=" + new Date().getTime(),
							async: false,
							success: function (response) {
								window["GINI_MANIFEST"] = response;
								loadManifestResolve();
							}
						});
					});
				};

				// css
				var loadCss = function () {
					return new Promise(function (loadCssResolve, loadCssReject) {
						cssloaderWithPromise(INI_html5BasePath + "/res/css/jqueryui/jquery-ui.css", "utf-8")
							.then(function () {
								return cssloaderWithPromise(INI_html5BasePath + "/res/css/jqueryui/jquery-ui.theme.css", "utf-8");
							}).then(function () {
								return cssloaderWithPromise(INI_html5BasePath + "/res/css/pc_certificate.css", "utf-8");
							}).then(function () {
								loadCssResolve();
							})
					});
				};
				
				// CrossKey manifest
				var loadCrossKeyManifest = function () {
					return new Promise(function (loadManifestResolve, loadManifestReject) {
						($ || jQuery).ajax({
							dataType: "json",
							url: "/SW/vender/CrossKey/manifest.json?bust=" + new Date().getTime(),
							async: false,
							success: function (response) {
								window["GCROSSKEY_MANIFEST"] = response;
								loadManifestResolve();
							}
						});
					});
				};

				// CrossKey
				var loadCrossKey = function () {
					return new Promise(function (loadCrossKeyResolve, loadCrossKeyReject) {
						loadCrossKeyManifest().then(function(){
							return jsloaderWithPromise(GCROSSKEY_MANIFEST["CrossKey.js"], "utf-8");
						}).then(function () {
							return jsloaderWithPromise("/SW/vender/CrossKey/CrossKeyIntf.js" + dummyTime, "utf-8");
						}).then( function() {
							loadCrossKeyResolve();
						});
					});
				};
				/*
				var loadCrossKey = function () {
					return new Promise(function (loadCrossKeyResolve, loadCrossKeyReject) {
						jsloaderWithPromise("/CrossKey/CrossKey.js" + dummyTime, "utf-8")
						.then(function () {
							return jsloaderWithPromise("/CrossKey/CrossKeyIntf.js" + dummyTime, "utf-8");
						}).then( function() {
							loadCrossKeyResolve();
						});
					});
				};
				*/
				var loadIniPattern = function() {
					return new Promise(function(loadIniPatternResolve, loadIniPatternReject) {
						jsloaderWithPromise("/SW/vender/inipattern/inipattern_v1.0.5.ie.min.js" + dummyTime, "utf-8")
						.then(function() {
							return cssloaderWithPromise("/SW/vender/inipattern/fontium/css/fontium.css" + dummyTime, "utf-8");
						}).then(function() {
							return cssloaderWithPromise("/SW/vender/inipattern/css/inipattern_popup.css" + dummyTime, "utf-8");
						}).then(function() {
							loadIniPatternResolve();
						});
					});
				};

				var loadcwui = function() {
					return new Promise(function(loadcwuiRelove, loaccwuiReject) {
						loadManifest().then(function(){
							Promise.all([
								jsloaderWithPromise(GINI_MANIFEST["INIforgeCrypto.js"]),
								jsloaderWithPromise(GINI_MANIFEST["cwui_conf.js"]),
								jsloaderWithPromise(GINI_MANIFEST["cwui_core.js"]),
								jsloaderWithPromise(GINI_MANIFEST["cwui.js"])
							]).then(function(){
								console.log("cwui load");
								var wait_cwui = function() {
									if ( cwui.isReady === true ) {
										loadcwuiRelove();
									} else {
										setTimeout(wait_cwui, 5);
									}
								};
								setTimeout(wait_cwui, 0); 
							});
						})
					});
				}

				if (true === GINI_supportHtml5() && false === useOnlyCS) {
					Promise.all([
						//loadCrossKey()
						//, loadTransKey()
						//, loadAhnlabKey()
						//, loadUniwebKey()
						//, loadIniPattern()
						loadTransKey()
						, jsloaderWithPromise(INI_html5BasePath + "/cw_web6_neo_adt.js" + dummyTime, "utf-8")
						, jsloaderWithPromise(INI_html5BasePath + "/initechGlobal.js" + dummyTime, "utf-8")
						, loadCss()
					]).then(function () {
						return loadcwui();
					}).then(function () {
						return jsloaderWithPromise(INI_html5BasePath + "/3rd_interface.js" + dummyTime, "utf-8");
					}).then(function () {
						changeThirdPartyCompleted();
					});
				} else {
					changeCompleted();
					changeThirdPartyCompleted();
				}
			};

			// promise 라이브러리가 완전히 로드된 후에 진행한다.
			jsloader(crosswebexBaseDir + "/common/js/bluebird-3.5.0.min.js" + dummyTime, afterLoadPromise, "utf-8");
			//jsloader(INI_html5BasePath + "/lib/promise/bluebird-3.5.0.min.js" + dummyTime, afterLoadPromise, "utf-8");

			// ie8/9인 경우, JSON을 브라우저가 기본 제공하지 않기 때문에 무조건 앞단에서 로드하도록 변경
			if ( (navigator.userAgent.match(/msie 8/i)) || (navigator.userAgent.match(/msie 9/i)) ) {
				JSON = {};
				// jsloader(CROSSWEBEX_CONST.json2Path, function () { return false; }, "utf-8");
				document.write("<script type='text/javascript' src='" + crosswebexBaseDir + "/common/js/json2.js" + "'></script>");
			}

			document.write("<script type='text/javascript' src='" + crosswebexBaseDir + "/cw_web6_adt.js" + dummyTime + "'></script>");
			document.write("<script type='text/javascript' src='" + crosswebexBaseDir + "/common/js/exproto.js" + dummyTime + "'></script>");
			document.write("<script type='text/javascript' src='" + crosswebexBaseDir + "/common/exinstall.js" + dummyTime + "'></script>");
			document.write("<script type='text/javascript' src='" + crosswebexBaseDir + "/common/exinterface.js" + dummyTime + "'></script>");
			document.write("<script type='text/javascript' src='" + crosswebexBaseDir + "/crosswebexInit.js" + dummyTime + "'></script>");
		}
	};


	// CS만 사용할 경우 true // promise(bluebird)라이브러리는 로드해야 한다.
	var useOnlyCS = false;

	var completed = false;
	var thirdPartyCompleted = false;

	var moduleLoad = function (loadList) {
		if(isInihubOndemand) {
			var LoadListScripts = function(ScriptList) {
				var callback_fail = function (source) {
					$("#ajax").remove();
					alert("CrossWeb EX 모듈 다운로드에 실패했습니다.");
					return;
				};

				var LoadCSSScripts = function() {
					Load.createCssTag(ScriptList.PC_CSS, function () {
						if (true === GINI_supportHtml5() && false === useOnlyCS) {
							changeThirdPartyCompleted();
						}
						else {
							changeCompleted();
							changeThirdPartyCompleted();
						}
					}, callback_fail);
				}

				var LoadPCScripts = function() {
					Load.createScriptTag(ScriptList.PC, function () {
						LoadCSSScripts();
					}, callback_fail);
				}

				var LoadPCOptionScript = function() {
					var tkstatus = {
						UNKNOWN: "unknown",
						YES: "yes"
					};
					var OptStatus = {
						UseTouchEnNx: tkstatus.UNKNOWN,
						completeLoadTouchEnNx: false,	
					};

					var OptionChecker = function() {
						// 라온키보드 보안이 사용되는 것이 확인되고, 라온키보드보안 스크립트가 모두 완료 되었을 때 PC Script의 로드를 시작할 수 있도록 한다.
						if (OptStatus.UseTouchEnNx === tkstatus.YES &&
								OptStatus.completeLoadTouchEnNx === true) {
							// 콜백함수의 빠른 반환을 위해 setTimeout에서 실행.
							setTimeout(LoadPCScripts, 0);
						}
					}

					window.IHUB_CheckTouchEnNXJSLoad = function() {
						// 라온키보드보안(TouchEnNx) 사용시 키보드보안 스크립트가 모두 로드된 후 
						// IHUB_CheckTouchEnNXJSLoad() 함수를 호출됨
						OptStatus.completeLoadTouchEnNx = true;
						OptionChecker();
					};

					Load.createScriptTag(ScriptList.PC_OPTIONS, function () {
						if ( typeof TouchEnNxConfig === "undefined" ) {
							// PC_OPTIONS 스크립트에 라온 사용하지 않는다면 곧바로 PC Script 로드시작.	
							LoadPCScripts();
							return ;
						}

						OptStatus.UseTouchEnNx = tkstatus.YES;
						OptionChecker();
					});
				};

				LoadPCOptionScript();
			};

			if (inihubVersion === "V1") {
				// INIHub V1 동적 로드
				loadCSSAndScript = function () {
					if (INI_getPlatformInfo().Mobile) {
						// Mobile 로드
						// 자바스크립트 로드 후 CSS 로드 한다.
						$.ajax({
							url : "/gw/provider/webui/conf/loadlist?bust=" + new Date().getTime(),
							dataType: "json",
							async: false,
							success : function(responseData){
								$("#ajax").remove();
								var List = responseData;
								var callback_fail = function (source) {
									$("#ajax").remove();
									alert("CrossWeb EX 모듈 다운로드에 실패했습니다.");
									return;
								}
								var callback = function () {
									var callback_css = function () {
										changeThirdPartyCompleted();
									}
						
									if (INI_getPlatformInfo().iOS){
										Load.createCssTag(List.IOS_CSS, callback_css, callback_fail);
									}
									else{
										Load.createCssTag(List.ANDROID_CSS, callback_css, callback_fail);
									}
								}
								Load.createScriptTag(List.MOBILE, callback, callback_fail);
							},
							error : function(){
								$("#ajax").remove();
								alert('Loadlist.json 다운로드 실패했습니다.');
							}
						})
					} else {
						// PC 로드
						/************************************************************
									 * CrossWeb EX JavaScript 및 CSS 로딩
						 ************************************************************/

						$.ajax({
							url : "/gw/provider/webui/conf/loadlist?bust=" + new Date().getTime(),
							dataType: "json",
							async: false,
							success : function(responseData){
								$("#ajax").remove();
								LoadListScripts(responseData);
							},
							error : function(){
								$("#ajax").remove();
								alert('Loadlist.json 다운로드 실패했습니다.');
							}
						})
					}
				};
			} else {
				// inihub V2 동적 로드
				loadCSSAndScript = function (List) {
					if (INI_getPlatformInfo().Mobile) {
						// Mobile 로드
						// 자바스크립트 로드 후 CSS 로드 한다.
						var callback_fail = function (source) {
							$("#ajax").remove();
							alert("CrossWeb EX 모듈 다운로드에 실패했습니다.");
							return;
						}
						var callback = function () {
							var callback_css = function () {
								changeThirdPartyCompleted();
							}
		
							if (INI_getPlatformInfo().iOS) {
								Load.createCssTag(List.IOS_CSS, callback_css, callback_fail);
							}
							else {
								Load.createCssTag(List.ANDROID_CSS, callback_css, callback_fail);
							}
						}
						Load.createScriptTag(List.MOBILE, callback, callback_fail);
					} else {
						// PC 로드

						LoadListScripts(List);
					}
				};

				// INIHub V2 동적 로드 시 loadCSSAndScript는 INIHub에서 호출한다.
				return;
			}
		}

		loadCSSAndScript(loadList);
	};

	var changeCompleted = function () {
		completed = true;
	};

	var isCompleted = function () {
		return completed;
	};

	var changeThirdPartyCompleted = function () {
		thirdPartyCompleted = true;
	};

	var isThirdPartyCompleted = function () {
		return thirdPartyCompleted;
	};

	var isUseOnlyCS = function () {
		return useOnlyCS;
	};

	// customerConf 설정시 해당 정책으로 defaultConf 초기화 
	var setCustomerConf = function (policy) {
		customerConf = policy;
	};

	var getCustomerConf = function () {
		return customerConf;
	};

	// 외부에서 지정한 함수 ex) 스토리지 - 외부 저장소 데이터를 받아와 사용
	var setExternalFunc = function (func) {
		externalFunc = func;
	};

	var getExternalFunc = function () {
		return externalFunc;
	};

	return {
		getCustomerConf: getCustomerConf,
		setCustomerConf: setCustomerConf,
		setExternalFunc: setExternalFunc,
		getExternalFunc: getExternalFunc,
		moduleLoad: moduleLoad,
		changeCompleted: changeCompleted,
		isCompleted: isCompleted,
		isThirdPartyCompleted: isThirdPartyCompleted,
		isUseOnlyCS: isUseOnlyCS
	}
})();

// INIHub V2는 동적 로드를 재정의만 한다. 호출은 이니허브에서 한다.
if (!isInihubOndemand || inihubVersion === "V1") {
	GINI_DYNAMIC_LOAD.moduleLoad();
}


/************************************************************
 * @brief		CrossWeb EX 클라이언트 변수
 ************************************************************/
var importURL = window.location.protocol + "//" + window.location.host + inihubPagePath + "/resources/vendor/SW/initech/webui/certRelay/GetCertificate_v12.jsp";
var exportURL = window.location.protocol + "//" + window.location.host + inihubPagePath +"/resources/vendor/SW/initech/webui/certRelay/GetCertificate_v12.jsp";

var importV13URL = window.location.protocol + "//" + window.location.host + "/CertRelay/GetCertificate_v13.jsp";
var exportV13URL = window.location.protocol + "//" + window.location.host + "/CertRelay/GetCertificate_v13.jsp";

// 서블릿으로 수정 (InitechSignController)
// 경로에 app.api.prefix 가 포함된다 — 프리픽스 변경 시 이 값과 customerConf.json 의 SYNCHRONISE_TIME 도 함께 고칠 것
var TimeURL = window.location.protocol + "//" + window.location.host + "/api/discls/vendor/SW/initech/extension/common/tools/RpSync";
var RandomURL = window.location.protocol + "//" + window.location.host + crosswebexBaseDir + "/common/tools/Random.jsp";
var PCRandomURL = window.location.protocol + "//" + window.location.host + crosswebexBaseDir + "/common/tools/PCRandom.jsp";
var E2ERandomURL = window.location.protocol + "//" + window.location.host + crosswebexBaseDir + "/common/tools/E2E_Random.jsp";
var SSIDNonceURL = window.location.protocol + "//" + window.location.host + crosswebexBaseDir + "/common/tools/SSIDNonce.jsp";
var LogoURL = window.location.protocol + "//" + window.location.host + crosswebexBaseDir + '/img/logo.demo.initech.com_TRUSTWEX.jpg';
var TrustBannerURL = window.location.protocol + "//" + window.location.host + crosswebexBaseDir + '/img/voice.demo.initech.com..jpg';
var InitechPrivateIssueURL = window.location.protocol + "//" + window.location.host + "/initech/demo/pc/crossweb_ex_web6/cert_center_private/issue_json_result.jsp";
var EncFlag = 10;
var VerifyFlag = 11;
var CrossWebSpanTag = "CrossWeb_Extension";

var cipher = "SEED-CBC";
var hashalg = "SHA256";

var turl = TimeURL;
var rurl = RandomURL;

var CAIPInfo = {
	//인증서 발급/갱신/폐기 관련 CA 정보(리얼)
	real: {
		yessign: "203.233.91.71",			// 금결원 리얼 CA 서버
		crosscert: "211.192.169.90",		// 전자인증 리얼 CA 서버
		signkorea: "210.207.195.100",		// 코스콤 리얼 CA 서버
		signgate: "211.35.96.43",			// 정보인증 리얼 CA 서버
		inipass: "220.90.214.15",			// INIPASS 리얼 CA 서버
		initech: "211.219.156.139"             //INITECH 테스트 CA 서버
	},
	//인증서 발급/갱신/폐기 관련 CA 정보(2048용 테스트)
	test: {
		yessign: "203.233.91.231",			// 금결원 테스트 CA 서버
		crosscert: "211.180.234.201",		// 전자인증 테스트 CA 서버 ( 201 서버가 안될 경우, 205 서버로 접속 211.180.234.205 )
		signkorea: "211.175.81.101",		// 코스콤 테스트 CA 서버
		signgate: "114.108.187.156",		// 정보인증 테스트 CA 서버 ( 156 서버가 안될 경우, 61.72.247.156로 변경 )
		inipass: "220.90.214.135",			// INIPASS 테스트 CA 서버
		initech: "211.219.156.139"             //INITECH 테스트 CA 서버
	}
};

var YessignCAIP;		//금결원 CA 서버
var CrossCertCAIP;		//전자인증 CA 서버
var SignKoreaCAIP;		//코스콤 CA 서버
var SignGateCAIP;		//정보인증 CA 서버
var INIPassCAIP;		//INIPASS CA 서버
var InitechCAIP;        //이니텍 사설인증서 CA서버

var YessignCMPPort = "4512";
var CrossCertCMPPort = "4512";
var SignKoreaCMPPort = "4099";
var SignGateCMPPort = "4502";
var INIPassCMPPort = "4512";
var InitechCAPort = "4007";

var InitechPackage = "INITECH";
var YessignPackage = "YESSIGN";
var CrossCertPackage = "CROSSCERT";
var SignKoreaPackage = "SIGNKOREA";
var SignGatePackage = "SIGNGATE";
var INIPassPackage = "INIPASS";

// INITECH CA
var Initech_CAPackage = "INITECH_CA";
var Initech_CAIP = "dev.initech.com";
var Initech_CMPPort = "28088";	// HTTP
//var Initech_CMPPort = "28089";	// TCP
//var Initech_CMPPort = "8200";
var CANAME = "INITECHCA";

// 고객사 적용시 아래 HOST 를 반드시 수정해 주세요.

// 고객사 개발 HOST
var CW_DEV_HOST = window.location.host;
// 고객사 테스트 HOST
var CW_TEST_HOST = window.location.host;
// 고객사 운영 HOST
var CW_REAL_HOST = window.location.host;

// 서버 인증서 (default.initech.com 2022.05.18~2042.05.18)
var SCert = "-----BEGIN CERTIFICATE-----\nMIIDtDCCApygAwIBAgIDAhOCMA0GCSqGSIb3DQEBCwUAMFMxCzAJBgNVBAYTAktS\nMRAwDgYDVQQKEwdJTklURUNIMREwDwYDVQQLEwhQbHVnaW5DQTEfMB0GA1UEAxMW\nSU5JVEVDSCBQbHVnaW4gUm9vdCBDQTAeFw0yMjA1MTgwNTMyMzdaFw00MjA1MTgw\nNTMyMzZaMD8xCzAJBgNVBAYTAktSMRIwEAYDVQQKEwlJTklURUNIQ0ExHDAaBgNV\nBAMTE2RlZmF1bHQuaW5pdGVjaC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw\nggEKAoIBAQCBZ5bD/o/qCKSZE7saWEZ8BCV6L3wLiBQ3ST5erNgjuM1ptzOQLNwe\nTX25J+1SCb/4zyArOj05UAcs2dCdrf2dA/F9v+jXy+mwEvz6kbW41ekNfOurxlOq\nAKMlvpZaG61PV18WXZYpnk8+9oFQHOzDC8ZVypI2Hbh8lxGxOEtZHdgEGTDNSH2O\nNvUGPfEk3O6DuaKE7bl3vcWv+SG+8+FMNbbL3FR+E+npUzZ73DJBlJKdaMekEYfC\nFxjBSVumcUhXfT6UVa36gQVuZpMCsVK11YBibphahqnrhN+XEQBw6DRIRRBpca0P\niQ97hcY26VH0okuZqcNls5AEQGmc4dbZAgMBAAGjgaQwgaEwHwYDVR0jBBgwFoAU\ndZHynOrUueejpV93hNuhGg0Yi6UwHQYDVR0OBBYEFO5/jqjGh57IkM5MNt61b9vA\na8UWMA4GA1UdDwEB/wQEAwIB/jAMBgNVHRMBAf8EAjAAMEEGA1UdHwQ6MDgwNqA0\noDKGMGh0dHA6Ly9kZXYuaW5pdGVjaC5jb206NDgyMDAvQ1JML0lOSVRFQ0hDQTEz\nLmNybDANBgkqhkiG9w0BAQsFAAOCAQEAX/1TsVD9E+ZNmstHLnmaYRijdluVWIcx\nmUNA5OMn4o/au9x5SbyO++1kpmvodE8v12KIx0q/eXO72UpeSfzlTu/8qBGC+ajw\nUmt0+Ik60aQRFVvq/7Dcilj2Xh1DMRK2mXL76hiZJZTR0KOygzWFMha0eEfkcklH\ndR7/5eQ93s6vE+/5zm7CIq/R9mpWn0xgxaOv93TMK5Z83dmpIOuoB+WBwSN2zTc5\nybr6SUtHeJepGoYYsWbpkI3LjcP+oq5LbexkeKTknDSHa1lPpKIGjCAleubBeQhS\nSClqPQ9bRDCPhA6W9nm4e5bhc74HoCkdLXSXIMuydbXVUvHwzPWHZA==\n-----END CERTIFICATE-----\n";

// Real-CA 인증서
var realInitech_ca = "-----BEGIN CERTIFICATE-----\nMIIEBDCCAuygAwIBAgIBAzANBgkqhkiG9w0BAQsFADBTMQswCQYDVQQGDAJLUjEW\nMBQGA1UECgwNSU5JVEVDSF9JTklDQTEbMBkGA1UECwwSSU5JVEVDSF9JTklDQV9S\nT09UMQ8wDQYDVQQDDAZUU19QS0kwHhcNMjEwMTE3MTUwMDAwWhcNMzAwMTE4MTQ1\nOTU5WjBRMQswCQYDVQQGDAJLUjEWMBQGA1UECgwNSU5JVEVDSF9JTklDQTEZMBcG\nA1UECwwQSU5JVEVDSF9JTklDQV9DQTEPMA0GA1UEAwwGVFNfUEtJMIIBITANBgkq\nhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBo9fi8np1t+BU471l9HR+Pu6zLM1r0tZQ7\nJPhrB8NBPJyp2SNZHTa7bUGUAOH6NyBwzjHOy0XM1ErJOf4CXU4vmKDPQvDTEDCi\nKVvI5/CU5Ck6kju/1NUsRoX6knN+AiC4vcQBsH67aM3C2CIO0EpPpf5n/6If1Yoo\na6IbLHauxip189G8YBaCwrIty55eGgfhyEz2WpyV+NiXrDh6HWhpiG+0Tns/h33o\nbCYHws8Y/rEybdYT/N/ba44Jwph0KXjydfwGqgaA7AT0fSqvDxkGwXclJPaOlSwl\nHvo19bqHCxTh5Gbab1PzFX3ejlEJTblZP4IkyhHieN8abu23O7cdAgMBAAGjgeUw\ngeIwHQYDVR0OBBYEFGOAzpROjVDdtzist4Y/Z5WvXCA8MHsGA1UdIwR0MHKAFHFs\nbcMZgaOFXH/pl0Ok7bgVDBByoVekVTBTMQswCQYDVQQGDAJLUjEWMBQGA1UECgwN\nSU5JVEVDSF9JTklDQTEbMBkGA1UECwwSSU5JVEVDSF9JTklDQV9ST09UMQ8wDQYD\nVQQDDAZUU19QS0mCAQEwDgYDVR0PAQH/BAQDAgHGMCAGA1UdJQEB/wQWMBQGCCsG\nAQUFBwMBBggrBgEFBQcDAzASBgNVHRMBAf8ECDAGAQH/AgEAMA0GCSqGSIb3DQEB\nCwUAA4IBAQACnbdihIyBMHTHdgkOT6UDTLJlFEp/LD+bWUH2z29vA57eg3WnjB2w\nmKi7JmCSLBvr55UuZ2K1oT4fNpHpRtdDCvs75rTiZPDeEdTImkaqlQRKoGU2NJVw\nPUmcuhqz9bBsaYtr+ra63nUoa58UI73mZFSx+LHDmYSw7jMVcvfKHQOrzDr4ioRy\nKSfeuAqxameG0TCnuUB7HL7liMxOEtL8AUEDFPFs80Efe12lEPznfOg/Wu3KsiCa\nv7y/DBSLX+1dOET51yS7kGO+Ok8tlyW3DKxzgdzKV84XBnPt8dG1dv+qaJKDVlWf\n3l1KJypMU08rTltrYHInYAoi6UpAeTmy\n-----END CERTIFICATE-----";

var realYessignClass3_2048 = "-----BEGIN CERTIFICATE-----\nMIIGDjCCBPagAwIBAgICECgwDQYJKoZIhvcNAQELBQAwZDELMAkGA1UEBhMCS1Ix\nDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0\naG9yaXR5IENlbnRyYWwxFjAUBgNVBAMMDUtJU0EgUm9vdENBIDQwHhcNMjAwNTE1\nMDcyNTIxWhcNMzAwNTE1MDcyNTIxWjBSMQswCQYDVQQGEwJrcjEQMA4GA1UECgwH\neWVzc2lnbjEVMBMGA1UECwwMQWNjcmVkaXRlZENBMRowGAYDVQQDDBF5ZXNzaWdu\nQ0EgQ2xhc3MgMzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKRTJ8DQ\nty6KyIhZJIWm5Nc5Ye2HWHo1nZNYuBNUCUNPuHvsjDvVg0IpJwq60RcL8rDX2ird\nxBBz2HYSZAL5kNPWeADjD3vrE+1pwqSSTlaofGQMEqcHgsGeaYznh2kUSWC/Wu5H\nq3W/NW5tSq+Bgqz9KgBt7jbHKV7NdapVDAwwbwj5DoFJRXRpgUWuJdGOxQTHgmzG\n2ksOAtQ0phjkb7MOK1k8gLOh0hONUv/CpEoxEEfHJ74A+Ysw9kAVUjTitrESYpPy\n6gBYGQoqwplAEFSsEvQgD0Hj+iPr6Chyrrqfl7uesYvzidZLSUooXkt1v+pkQ970\n9kX4+fEOUbl1YGECAwEAAaOCAtowggLWMIGOBgNVHSMEgYYwgYOAFMjQjsdJrh8g\nQrJLfxPJd1gMoc3BoWikZjBkMQswCQYDVQQGEwJLUjENMAsGA1UECgwES0lTQTEu\nMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgQ2VudHJhbDEW\nMBQGA1UEAwwNS0lTQSBSb290Q0EgNIIBATAdBgNVHQ4EFgQU8oej5tleFhZyTtjC\nvIU5AzdZkMQwDgYDVR0PAQH/BAQDAgEGMIIBMQYDVR0gAQH/BIIBJTCCASEwggEd\nBgRVHSAAMIIBEzAwBggrBgEFBQcCARYkaHR0cDovL3d3dy5yb290Y2Eub3Iua3Iv\ncmNhL2Nwcy5odG1sMIHeBggrBgEFBQcCAjCB0R6Bzsd0ACDHeMmdwRyylAAgrPXH\neMd4yZ3BHMeFssiy5AAoAFQAaABpAHMAIABjAGUAcgB0AGkAZgBpAGMAYQB0AGUA\nIABpAHMAIABhAGMAYwByAGUAZABpAHQAZQBkACAAdQBuAGQAZQByACAARQBsAGUA\nYwB0AHIAbwBuAGkAYwAgAFMAaQBnAG4AYQB0AHUAcgBlACAAQQBjAHQAIABvAGYA\nIAB0AGgAZQAgAFIAZQBwAHUAYgBsAGkAYwAgAG8AZgAgAEsAbwByAGUAYQApMCsG\nA1UdEQQkMCKgIAYJKoMajJpECgEBoBMwEQwP6riI7Jy16rKw7KCc7JuQMBIGA1Ud\nEwEB/wQIMAYBAf8CAQAwDwYDVR0kAQH/BAUwA4ABADCBjAYDVR0fBIGEMIGBMH+g\nfaB7hnlsZGFwOi8vZHMueWVzc2lnbi5vci5rcjozODkvQ049S0lTQS1Sb290Q0Et\nNCxPVT1Lb3JlYS1DZXJ0aWZpY2F0aW9uLUF1dGhvcml0eS1DZW50cmFsLE89S0lT\nQSxDPUtSP2F1dGhvcml0eVJldm9jYXRpb25MaXN0MA0GCSqGSIb3DQEBCwUAA4IB\nAQBExsytYNrlX1MuAo2Zvl1Wjh0JPFRXz1mQ8pB+ZHEM85RPw+unql9bax29NDqj\nIRQfUxlukv0HcLJ4IgJhowSipIcdKsPo5cIZ55svimJROclLTy8HYnjqk+3tVwy0\nMm181XDr48FBsmhGK79TlBOvfVmH2AEGwuD7e+1dSKpPPVqDp7mLS33UfAzKpL7P\n9wM1ZV15HuoTXQ9M6yMAik7eJRL7Nh8X8kCbxenH9p3adPNwYbqhn0HIQWCOLdra\nijWgfi03ykHagdtVA5VOdnrAKitWd9WOPHQc3Yxbi9xMyrgAOP2hNG7ehSkyeETh\n4TljL8xojH3Q+xOMkJUnZSb1\n-----END CERTIFICATE-----\n";
var realCrossCertCA4 = "-----BEGIN CERTIFICATE-----\nMIIGEDCCBPigAwIBAgICEDgwDQYJKoZIhvcNAQELBQAwZDELMAkGA1UEBhMCS1Ix\nDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0\naG9yaXR5IENlbnRyYWwxFjAUBgNVBAMMDUtJU0EgUm9vdENBIDQwHhcNMjIwNzE0\nMDQ0MTI3WhcNMzAwNjAyMDYzODM3WjBPMQswCQYDVQQGEwJLUjESMBAGA1UECgwJ\nQ3Jvc3NDZXJ0MRUwEwYDVQQLDAxBY2NyZWRpdGVkQ0ExFTATBgNVBAMMDENyb3Nz\nQ2VydENBNDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMk5R99pFBKB\nniJ/P0Dk1XFOs2WdxJQUAMhHZlJozv6W5wFPNJe0A2ga+oNtq2FDOwzs/D2zCAyi\nCCgHAq4NaqsMXcd7KHlgDp4SfODhzdvCg/4GS0i0Q1FFysqbVr/cJ1yPZeYPgft7\nXd9nQm1SbKvmFOskc6PSQZ9wGUs7iSWnX667vCALqPJvSbUJKyP0FFjQH42nbE7s\nTba+vBI1zrPxja7Hxvw7L4uCu9kMGryp7xQGvs1UuPWTPZzG9KZjlhr32NTOdxN3\nqJ9Wib8Cgu0dPCmqIqDxFZ5ILb+LmY73wuNTfD7APA3W+Bd9Mp+homxO3Fldqmmp\nPELim2dPYUkCAwEAAaOCAt8wggLbMIGOBgNVHSMEgYYwgYOAFMjQjsdJrh8gQrJL\nfxPJd1gMoc3BoWikZjBkMQswCQYDVQQGEwJLUjENMAsGA1UECgwES0lTQTEuMCwG\nA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgQ2VudHJhbDEWMBQG\nA1UEAwwNS0lTQSBSb290Q0EgNIIBATAdBgNVHQ4EFgQUur9I6ZcqqbHuXCMquL5j\nB57q92AwDgYDVR0PAQH/BAQDAgEGMIIBMQYDVR0gAQH/BIIBJTCCASEwggEdBgRV\nHSAAMIIBEzAwBggrBgEFBQcCARYkaHR0cDovL3d3dy5yb290Y2Eub3Iua3IvcmNh\nL2Nwcy5odG1sMIHeBggrBgEFBQcCAjCB0R6Bzsd0ACDHeMmdwRyylAAgrPXHeMd4\nyZ3BHMeFssiy5AAoAFQAaABpAHMAIABjAGUAcgB0AGkAZgBpAGMAYQB0AGUAIABp\nAHMAIABhAGMAYwByAGUAZABpAHQAZQBkACAAdQBuAGQAZQByACAARQBsAGUAYwB0\nAHIAbwBuAGkAYwAgAFMAaQBnAG4AYQB0AHUAcgBlACAAQQBjAHQAIABvAGYAIAB0\nAGgAZQAgAFIAZQBwAHUAYgBsAGkAYwAgAG8AZgAgAEsAbwByAGUAYQApMC4GA1Ud\nEQQnMCWgIwYJKoMajJpECgEBoBYwFAwS7ZWc6rWt7KCE7J6Q7J247KadMBIGA1Ud\nEwEB/wQIMAYBAf8CAQAwDwYDVR0kAQH/BAUwA4ABADCBjgYDVR0fBIGGMIGDMIGA\noH6gfIZ6bGRhcDovL2Rpci5jcm9zc2NlcnQuY29tOjM4OS9DTj1LSVNBLVJvb3RD\nQS00LE9VPUtvcmVhLUNlcnRpZmljYXRpb24tQXV0aG9yaXR5LUNlbnRyYWwsTz1L\nSVNBLEM9S1I/YXV0aG9yaXR5UmV2b2NhdGlvbkxpc3QwDQYJKoZIhvcNAQELBQAD\nggEBAAttrbbp7o0Zv2ZyyAl/+oRVKuDcb9O2Hip+Rp9IjeaxsHYZIVKcnCYdS9cE\nFs9CXGPQfc3nIGu1N/nYNeRDmay7+JLLL1yfbOOw0lW3hXRIidIK/lF4nRIf6KjD\nvQm5T0R15IPm+BjMoV0KqK20Vj0xC6rrdVv16HZOB0dx5ejk2kIeb2ySnDWGp/Ju\n6D/1VVPRMnh9WLrp+RsJD+dfVeHrZVFhynOGvSlMFlk+pmE5GJQK0JHrnUdi5x7t\nJ9LqPxGV1F8VJ7ELI4eTsHrzl3m+WyetDpjQRMVscHGOwVKhYyFjfwFRL6DBySqR\nXmGxZhGyxxTDTk9weqHvm9O1wGI=\n-----END CERTIFICATE-----\n";
var realSignGate_CA6 = "-----BEGIN CERTIFICATE-----\nMIIGCzCCBPOgAwIBAgICEDEwDQYJKoZIhvcNAQELBQAwZDELMAkGA1UEBhMCS1Ix\nDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0\naG9yaXR5IENlbnRyYWwxFjAUBgNVBAMMDUtJU0EgUm9vdENBIDQwHhcNMjAwNjEx\nMDI0MTIzWhcNMzAwNjExMDI0MTIzWjBKMQswCQYDVQQGEwJLUjENMAsGA1UECgwE\nS0lDQTEVMBMGA1UECwwMQWNjcmVkaXRlZENBMRUwEwYDVQQDDAxzaWduR0FURSBD\nQTYwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCzqGeQzoq+XrtzbLHh\ndeFT1dPJDWSPv7jmyROyI6cUyhk1S4jTzl/cdNguEW/NrlVUM1Wfp09y7F5jKrqn\nY6d2UMemrEt3dPAr7wHv+rJ5lWxxOJDliZEBTTvMPLgt2oBd/K5p/XMn6as5jAZ8\nhgPvGDF1D8+Zx4FWpC5DmkTSNKHOxkJR78yAtpu6m/PNGnhTWp/4Nw9L539AQ20k\nRJ1lGbILQ5LQ1NThLa9RFDu6LeeZ1YxidAzZyQjHAa7aUh2FrEeGln9WXr2ByJu2\ndG57m3bKKkpu20dOqw4VcWxuH8rlIXSUoMM207EFGdReIMdjh9eQN4Jo9lv+4R5Q\nSTqHAgMBAAGjggLfMIIC2zCBjgYDVR0jBIGGMIGDgBTI0I7HSa4fIEKyS38TyXdY\nDKHNwaFopGYwZDELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsM\nJUtvcmVhIENlcnRpZmljYXRpb24gQXV0aG9yaXR5IENlbnRyYWwxFjAUBgNVBAMM\nDUtJU0EgUm9vdENBIDSCAQEwHQYDVR0OBBYEFEElAdvtDsgzK4nvSmrcEAXSyaJv\nMA4GA1UdDwEB/wQEAwIBBjCCATEGA1UdIAEB/wSCASUwggEhMIIBHQYEVR0gADCC\nARMwMAYIKwYBBQUHAgEWJGh0dHA6Ly93d3cucm9vdGNhLm9yLmtyL3JjYS9jcHMu\naHRtbDCB3gYIKwYBBQUHAgIwgdEegc7HdAAgx3jJncEcspQAIKz1x3jHeMmdwRzH\nhbLIsuQAKABUAGgAaQBzACAAYwBlAHIAdABpAGYAaQBjAGEAdABlACAAaQBzACAA\nYQBjAGMAcgBlAGQAaQB0AGUAZAAgAHUAbgBkAGUAcgAgAEUAbABlAGMAdAByAG8A\nbgBpAGMAIABTAGkAZwBuAGEAdAB1AHIAZQAgAEEAYwB0ACAAbwBmACAAdABoAGUA\nIABSAGUAcAB1AGIAbABpAGMAIABvAGYAIABLAG8AcgBlAGEAKTAuBgNVHREEJzAl\noCMGCSqDGoyaRAoBAaAWMBQMEu2VnOq1reygleuztOyduOymnTASBgNVHRMBAf8E\nCDAGAQH/AgEAMA8GA1UdJAEB/wQFMAOAAQAwgY4GA1UdHwSBhjCBgzCBgKB+oHyG\nemxkYXA6Ly9sZGFwLnNpZ25nYXRlLmNvbTozODkvQ049S0lTQS1Sb290Q0EtNCxP\nVT1Lb3JlYS1DZXJ0aWZpY2F0aW9uLUF1dGhvcml0eS1DZW50cmFsLE89S0lTQSxD\nPUtSP2F1dGhvcml0eVJldm9jYXRpb25MaXN0MA0GCSqGSIb3DQEBCwUAA4IBAQDD\nWdLsHlcg5lT0E/3NCCzWZujfszm3L0Q5gPOzPbinK8/2S7bielgFuSVhJEf2aV02\nhHVedIcFxsX6ny+QDzdtsljZ63JoxP8u+KHs/5Hsv4k7XqZjkKqR643v7L8V/7fb\nf4c+7ZIm9wJFt79GyhODVToF4Hijc4bj35AlDhlkqz31nAOjLkFRxHXawtBQdO4/\nBbsyIiwbB9d6LfOfErf2yPC/+cFGtlAZk0mzjM2Lsq4dxHQe7DYGXvSBcbAQnjp9\n6vpbERjTyME5k8AqbloLbOh7/8YCvuD9tlx22YW9e5746BE91c6sZbs4kjPWWHW/\nbPDojcbXj+AlvB0l0T4A\n-----END CERTIFICATE-----\n";
var realSignKorea_CA4 = "-----BEGIN CERTIFICATE-----\nMIIGDTCCBPWgAwIBAgICECswDQYJKoZIhvcNAQELBQAwZDELMAkGA1UEBhMCS1Ix\nDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0\naG9yaXR5IENlbnRyYWwxFjAUBgNVBAMMDUtJU0EgUm9vdENBIDQwHhcNMjAwNjAy\nMDYxOTMwWhcNMzAwNjAyMDYxOTMwWjBQMQswCQYDVQQGEwJLUjESMBAGA1UECgwJ\nU2lnbktvcmVhMRUwEwYDVQQLDAxBY2NyZWRpdGVkQ0ExFjAUBgNVBAMMDVNpZ25L\nb3JlYSBDQTQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDARNdlcghT\nWjhctA7zqjW09m+mFAPNl+3efYCkbsvlWJj9DmAGwv6Hsz+1bb+QnZdUZki0Tx19\nZSi1Ev71s2NJVkRRwx27qp3Me03ZGfO0jeDEbPjy8KrJZL2O1mhEAgyCIjFaDJWx\nBOL2agLTX/lJd0+aLT2m3GlSegaqSiw7NZVHPmJul7QQDlOGv1BRnT6XDlMNMsNd\nNr450VhXfj/xMT5lcM/jomJ7e4l6x9OJVQHfmd44EVs5MPR0WYlJT+Sk6NQzKFIp\nqauyF9w8N5StbEeVCkhS8BphBvD/alKobAnYqYvylLvzPl1/DVuQQM6dA+srbqRx\nfFu5gREiiiEZAgMBAAGjggLbMIIC1zCBjgYDVR0jBIGGMIGDgBTI0I7HSa4fIEKy\nS38TyXdYDKHNwaFopGYwZDELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAs\nBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0aG9yaXR5IENlbnRyYWwxFjAU\nBgNVBAMMDUtJU0EgUm9vdENBIDSCAQEwHQYDVR0OBBYEFDgeYY9sVT3n8YZk/ilJ\nSpmh4/EhMA4GA1UdDwEB/wQEAwIBBjCCATEGA1UdIAEB/wSCASUwggEhMIIBHQYE\nVR0gADCCARMwMAYIKwYBBQUHAgEWJGh0dHA6Ly93d3cucm9vdGNhLm9yLmtyL3Jj\nYS9jcHMuaHRtbDCB3gYIKwYBBQUHAgIwgdEegc7HdAAgx3jJncEcspQAIKz1x3jH\neMmdwRzHhbLIsuQAKABUAGgAaQBzACAAYwBlAHIAdABpAGYAaQBjAGEAdABlACAA\naQBzACAAYQBjAGMAcgBlAGQAaQB0AGUAZAAgAHUAbgBkAGUAcgAgAEUAbABlAGMA\ndAByAG8AbgBpAGMAIABTAGkAZwBuAGEAdAB1AHIAZQAgAEEAYwB0ACAAbwBmACAA\ndABoAGUAIABSAGUAcAB1AGIAbABpAGMAIABvAGYAIABLAG8AcgBlAGEAKTAqBgNV\nHREEIzAhoB8GCSqDGoyaRAoBAaASMBAMDijso7wp7L2U7Iqk7L2kMBIGA1UdEwEB\n/wQIMAYBAf8CAQAwDwYDVR0kAQH/BAUwA4ABADCBjgYDVR0fBIGGMIGDMIGAoH6g\nfIZ6bGRhcDovL2Rpci5zaWdua29yZWEuY29tOjM4OS9DTj1LSVNBLVJvb3RDQS00\nLE9VPUtvcmVhLUNlcnRpZmljYXRpb24tQXV0aG9yaXR5LUNlbnRyYWwsTz1LSVNB\nLEM9S1I/YXV0aG9yaXR5UmV2b2NhdGlvbkxpc3QwDQYJKoZIhvcNAQELBQADggEB\nAH3+suM/nwukdYug4OilFAvXaCQ85sByMMj9S9vgWydmu7TRKxWHg/8O6QNhgxWc\n2Vf2Lmp55d0G/GyNNjgcurPaflk+WgVZmDNtfK5Nm8s8YwVDeUYPi4zMgR72tlXS\nCAqx2+Jvia5BTqvPsEEMnlgWnGtDdNHadp4JiGoDlAZUuUPUy2mPBmAQRu9ggAk5\nXbOXniBMdjv2ZWaEAOD0KdtZ/Cd3BymnekyQkN7P9++ef5rE+sG/QKmWn+j8MDMZ\nQ5+QUE4VIeYPzrxfkcGH2uD07uAI6+88i935JXEvJRW1UZYUUjNmH2CPXBGdPRIM\nxJMv80AqOMW8qToIApMH8Kw=\n-----END CERTIFICATE-----\n";
var realTradeSignCA4 = "-----BEGIN CERTIFICATE-----\nMIIGFzCCBP+gAwIBAgICEDUwDQYJKoZIhvcNAQELBQAwZDELMAkGA1UEBhMCS1Ix\nDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0\naG9yaXR5IENlbnRyYWwxFjAUBgNVBAMMDUtJU0EgUm9vdENBIDQwHhcNMjAwNjEx\nMDMxNDA0WhcNMzAwNjExMDMxNDA0WjBPMQswCQYDVQQGEwJLUjESMBAGA1UECgwJ\nVHJhZGVTaWduMRUwEwYDVQQLDAxBY2NyZWRpdGVkQ0ExFTATBgNVBAMMDFRyYWRl\nU2lnbkNBNDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMPdpkvG22aU\nCN6GPdIbbqtRPtdilU2varcEKRfU6edi4p4618WS4slzLu/2w4s6ofcNwLC4w1Lz\nFoHEeMUqNOtFYZ+0RzwSMc/MUkftxS7Rvy4CoCJKLV3XqGfFyNp4ziUuECBaqHva\nuNQKg/Yt++gB5nDb9jD4LDXwsVR6E6+6vd2Fv3KYx210GwUbQKCNpLHJHoYiCMwG\nIa24jKFVL3tEK0RzG77fN8CWVWRT1K/hKpwOndAhNO1y5AQPGD9HxYciwMOLSVVJ\nqqgZ+nNpyj9AZT3ESKgsnLXPn/iKIlHoYpW3dP43cUgb3x8JAEy6x/QROAS6IAAK\n3WBiu7tfc/kCAwEAAaOCAuYwggLiMIGOBgNVHSMEgYYwgYOAFMjQjsdJrh8gQrJL\nfxPJd1gMoc3BoWikZjBkMQswCQYDVQQGEwJLUjENMAsGA1UECgwES0lTQTEuMCwG\nA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgQ2VudHJhbDEWMBQG\nA1UEAwwNS0lTQSBSb290Q0EgNIIBATAdBgNVHQ4EFgQUobHHY+Gp9NKZS0H0UkRn\n0rFwdjQwDgYDVR0PAQH/BAQDAgEGMIIBMQYDVR0gAQH/BIIBJTCCASEwggEdBgRV\nHSAAMIIBEzAwBggrBgEFBQcCARYkaHR0cDovL3d3dy5yb290Y2Eub3Iua3IvcmNh\nL2Nwcy5odG1sMIHeBggrBgEFBQcCAjCB0R6Bzsd0ACDHeMmdwRyylAAgrPXHeMd4\nyZ3BHMeFssiy5AAoAFQAaABpAHMAIABjAGUAcgB0AGkAZgBpAGMAYQB0AGUAIABp\nAHMAIABhAGMAYwByAGUAZABpAHQAZQBkACAAdQBuAGQAZQByACAARQBsAGUAYwB0\nAHIAbwBuAGkAYwAgAFMAaQBnAG4AYQB0AHUAcgBlACAAQQBjAHQAIABvAGYAIAB0\nAGgAZQAgAFIAZQBwAHUAYgBsAGkAYwAgAG8AZgAgAEsAbwByAGUAYQApMDQGA1Ud\nEQQtMCugKQYJKoMajJpECgEBoBwwGgwY7ZWc6rWt66y07Jet7KCV67O07Ya17Iug\nMBIGA1UdEwEB/wQIMAYBAf8CAQAwDwYDVR0kAQH/BAUwA4ABADCBjwYDVR0fBIGH\nMIGEMIGBoH+gfYZ7bGRhcDovL2xkYXAudHJhZGVzaWduLm5ldDozODkvQ049S0lT\nQS1Sb290Q0EtNCxPVT1Lb3JlYS1DZXJ0aWZpY2F0aW9uLUF1dGhvcml0eS1DZW50\ncmFsLE89S0lTQSxDPUtSP2F1dGhvcml0eVJldm9jYXRpb25MaXN0MA0GCSqGSIb3\nDQEBCwUAA4IBAQBdylJKMNYVmMXcoxiGGPfmeV2UDZGwBtftdSO4a494PBsLVYBY\nCo0i1p9C18BTnh4uxfl3Hz13Fq3n1V1BWzK9oviCpmgBHQkQGHy57FeHNz54Ax7M\n0m8dWc//Iijcuf6ZSA5wL+vSCYqoE4cncWUNQk/PfCzT5S0j3Vuh64UPG7aJblSx\nwtb+80XG+CcdEsnvYWfMbTH1CWs2LUP+ptgHhzPR59iSN52DIv0tpzjHAG8Hk+Ln\n+7jz/xGfFIFh7PDY/ltD8zfQ36EbPhy17dVKEU1MRKtYNcB0kZqDBIUnw7yLYNiq\n03MkeZbAmaevFSAl6LA4c1mVHDouVROjCR7F\n-----END CERTIFICATE-----\n";

// Real 3072 CA Cert
var realYessignClass4_3072 = "-----BEGIN CERTIFICATE-----\nMIIHGzCCBYOgAwIBAgIIEvVyqt8qfPMwDQYJKoZIhvcNAQELBQAwZDELMAkGA1UE\nBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRp\nb24gQXV0aG9yaXR5IENlbnRyYWwxFjAUBgNVBAMMDUtJU0EgUm9vdENBIDUwHhcN\nMjYwNDI0MDQwMDAwWhcNMzYwNDI0MDQwMDAwWjBSMQswCQYDVQQGEwJLUjEQMA4G\nA1UECgwHeWVzc2lnbjEVMBMGA1UECwwMQWNjcmVkaXRlZENBMRowGAYDVQQDDBF5\nZXNzaWduQ0EgQ2xhc3MgNDCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGB\nAK5OSQeMQx9OGHb2t5P+svV5AGy4EBDTTN6oQ1sV2vqHaNFXRazDrYyXQKagbGlV\nPAs6ygOTfWG13RSxq98d5zE3nUGzmDNwWGF2xi+0QKNDFvY6lfY8lc3adXosoyc4\nynQG9ia8Dt/iwaY+3u+Ka21pr6jk5dh8QdLBvDWSPRGA8o8pX3Tas10eyAUzWx0b\nta7ifRk5kYNswEFj9eRyhqMCX7C3w0NIUZlNrPyC1Zs0aebFlLVi6bwlzdSdzxjW\n74DVhmyG2W4vCkKGMu0CmFdfa2PGXopYztYCM25Z3aIEceB0Ss+Q0QKWANe6kTZK\nFZBMHIt4czN/t9aYYF+v3jIBGPsjopW9yQBbzbvOOQuabRLDj2qkmHGfTIYi1QjN\nsHB6Z29q7vC9RhBLGSZC18oG3bcsD7lmiwj0VB6bY9v0z1FnVIbUzhjJCwgKitEO\nVZAvjKVMFB22qP6rvGj4LsSBUXPOB+V9PfE5nHk/PMsp89XUDnNM7rE/3xiJ1t/u\ngwIDAQABo4IC4TCCAt0wgZUGA1UdIwSBjTCBioAUXTU+q6vBJOt63WcadiNMA6pj\nbuahaKRmMGQxCzAJBgNVBAYTAktSMQ0wCwYDVQQKDARLSVNBMS4wLAYDVQQLDCVL\nb3JlYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50cmFsMRYwFAYDVQQDDA1L\nSVNBIFJvb3RDQSA1gggVps1TX8X0NjAdBgNVHQ4EFgQUrtPaOyLKt4QpGfbRGdls\nnfQHOIAwDgYDVR0PAQH/BAQDAgEGMIIBMQYDVR0gAQH/BIIBJTCCASEwggEdBgRV\nHSAAMIIBEzAwBggrBgEFBQcCARYkaHR0cDovL3d3dy5yb290Y2Eub3Iua3IvcmNh\nL2Nwcy5odG1sMIHeBggrBgEFBQcCAjCB0R6Bzsd0ACDHeMmdwRyylAAgrPWz2cd4\nyZ3BHMeFssiy5AAoAFQAaABpAHMAIABjAGUAcgB0AGkAZgBpAGMAYQB0AGUAIABp\nAHMAIABhAGMAYwByAGUAZABpAHQAZQBkACAAdQBuAGQAZQByACAARQBsAGUAYwB0\nAHIAbwBuAGkAYwAgAFMAaQBnAG4AYQB0AHUAcgBlACAAQQBjAHQAIABvAGYAIAB0\nAGgAZQAgAFIAZQBwAHUAYgBsAGkAYwAgAG8AZgAgAEsAbwByAGUAYQApMCsGA1Ud\nEQQkMCKgIAYJKoMajJpECgEBoBMwEQwP6riI7Jy16rKw7KCc7JuQMBIGA1UdEwEB\n/wQIMAYBAf8CAQAwDwYDVR0kAQH/BAUwA4ABADCBjAYDVR0fBIGEMIGBMH+gfaB7\nhnlsZGFwOi8vZHMueWVzc2lnbi5vci5rcjozODkvQ049S0lTQS1Sb290Q0EtNSxP\nVT1Lb3JlYS1DZXJ0aWZpY2F0aW9uLUF1dGhvcml0eS1DZW50cmFsLE89S0lTQSxD\nPUtSP2F1dGhvcml0eVJldm9jYXRpb25MaXN0MA0GCSqGSIb3DQEBCwUAA4IBgQCi\n4ZZ8qiAV+3wLgmPjB2r4lvxs45SKa2yRzzv/VReE74j3rQLrCGIty7JFzbrq5yI+\n4fST2n7jyEUTNF6w/zVs31BumtVYYtrrBA0AI4146ls5rnIQFneJVGp4t8v03KMN\nryVYwitMWskVLiRZf0hTFnLv/StresV9KskdSpKu8TpLGAb3laTy/nJvZT24XYhz\nTm91nKBWEXiQ1ZvdYD17vrkFb+mi9m2xveF7cPHNIqKeH8YPYpXIUXgO6yBkUnNa\nj3bJREFHrQ5LxAiC0a1abGvrvOkETrH2wDOi7UVwkCnyd3plwDtLSASP38rrUjqK\nwGyEWTk4o9TggZlEPJOK+vi/rSxCCfRsjNg9cAPgSZy96ZTi0e0J6AYLkacNyVGw\nhQr4NddYx48Rxc27Epopel+AlYt/A798WE7my/31/js4YJEA9PzZpT3IScwv9XDt\nkfJY8KQP/TGyE2t+N32yFE5dH0LtQvmvInCik/bkH1scHhP5q98XTxiZTUpUqA4=\n-----END CERTIFICATE-----\n";
var realCrossCertCA5_3072 = "-----BEGIN CERTIFICATE-----\nMIIHIjCCBYqgAwIBAgIIM5VPwi0z1okwDQYJKoZIhvcNAQELBQAwZDELMAkGA1UE\nBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRp\nb24gQXV0aG9yaXR5IENlbnRyYWwxFjAUBgNVBAMMDUtJU0EgUm9vdENBIDUwHhcN\nMjYwNDI0MDQwMDAwWhcNMzYwNDI0MDQwMDAwWjBPMQswCQYDVQQGEwJLUjESMBAG\nA1UECgwJQ3Jvc3NDZXJ0MRUwEwYDVQQLDAxBY2NyZWRpdGVkQ0ExFTATBgNVBAMM\nDENyb3NzQ2VydENBNTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAMP7\nqkCN78NmDAQ1c/WsWurQzoHW/4UUw3FX0ulVphI1SzI6njFwChO7fFngtGqOHJA9\nRmLLuBdDkS9rC9YGeINAolj51y4eGRAppUQ73OPQ5mo1jGpmXy6dcO04EW5wzSht\n3xeI2mcZsueeUbljp6FWvhJa8/9bDeu/t369wwKq9qI12j6H93duoOJff+5GtVua\nZus9Q8usX32BVY4H+QAxTh2iGzgFzk4mJ41TKKbmHQ+KE8OdY/tzReeBZKgmQf4B\ngQoxeUVvGa11jR94rT5mf8TVHV+97aqI+mPKPcNxAda1L8XpwYxp9mbpk9/VXoa2\nh5V+yAitlnelNQp/ZekbpXUdfmvf2z/uYmX0O3m+dy3w26mar1DZr3D2BNyJYw5Q\nibAzO0RfEeKeQO6vsd0cql+PgEuFxB1244d1nPFi8SK7vHiWiXC+A+xY29LX7gSP\nID45WwqCToLIsz7DbzHQfHXDw58WpjzQRI9NDIkZkc5E5oBtp0z795R75I7rUQID\nAQABo4IC6zCCAucwgZUGA1UdIwSBjTCBioAUXTU+q6vBJOt63WcadiNMA6pjbuah\naKRmMGQxCzAJBgNVBAYTAktSMQ0wCwYDVQQKDARLSVNBMS4wLAYDVQQLDCVLb3Jl\nYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50cmFsMRYwFAYDVQQDDA1LSVNB\nIFJvb3RDQSA1gggVps1TX8X0NjAdBgNVHQ4EFgQUmNyNS/tx2jnFIYgpl00B98qA\nVeMwDgYDVR0PAQH/BAQDAgEGMIIBMQYDVR0gAQH/BIIBJTCCASEwggEdBgRVHSAA\nMIIBEzAwBggrBgEFBQcCARYkaHR0cDovL3d3dy5yb290Y2Eub3Iua3IvcmNhL2Nw\ncy5odG1sMIHeBggrBgEFBQcCAjCB0R6Bzsd0ACDHeMmdwRyylAAgrPWz2cd4yZ3B\nHMeFssiy5AAoAFQAaABpAHMAIABjAGUAcgB0AGkAZgBpAGMAYQB0AGUAIABpAHMA\nIABhAGMAYwByAGUAZABpAHQAZQBkACAAdQBuAGQAZQByACAARQBsAGUAYwB0AHIA\nbwBuAGkAYwAgAFMAaQBnAG4AYQB0AHUAcgBlACAAQQBjAHQAIABvAGYAIAB0AGgA\nZQAgAFIAZQBwAHUAYgBsAGkAYwAgAG8AZgAgAEsAbwByAGUAYQApMDMGA1UdEQQs\nMCqgKAYJKoMajJpECgEBoBswGQwX7ZWc6rWt7KCE7J6Q7J247KadKOyjvCkwEgYD\nVR0TAQH/BAgwBgEB/wIBADAPBgNVHSQBAf8EBTADgAEAMIGOBgNVHR8EgYYwgYMw\ngYCgfqB8hnpsZGFwOi8vZGlyLmNyb3NzY2VydC5jb206Mzg5L0NOPUtJU0EtUm9v\ndENBLTUsT1U9S29yZWEtQ2VydGlmaWNhdGlvbi1BdXRob3JpdHktQ2VudHJhbCxP\nPUtJU0EsQz1LUj9hdXRob3JpdHlSZXZvY2F0aW9uTGlzdDANBgkqhkiG9w0BAQsF\nAAOCAYEAGgThcN8s0iAh/FL7bihh+b7Ez+m6Gd5g2ZZ3WC03V2b3pHmqxd1r5A3n\nBlC0Z7z9LxRAjzIlcS3NrevfkXdlt1qjlO0HDYpbomlx9FHNqm1/dv90Alke9mEw\nuo3iDAsb51PcbcQqCPgYdMDP7SbwatOayiQ0wBx3HfSRtxd/KuaRalXSJmrE/BZr\n6e1Njf3MbJt6cOqnTWCaC6ShVQ5T1/28wKDCq8M2lk3qySBmVRwbs4cYhKNDfeqj\nTzlTRqJMWzXAQ2ntBb4y3AwR+EftBjUnJM72cpiUKwzhh9EO884qR3TcKHgNImod\n4bU9Ms3XTHdCB/RI+XPctuUHuj62dgrLrvOWGBDps+OlHnlEMJ2OK94dJ6Cn1wdS\nEGFwnuwLeVG3tBbBXyMv0ljuoP3zFhbAswxs0+DF2V/qbij6C+R19fqoCyk1Msqc\n1l8Z637RBgdtVMimazcnl+zcjbv3VSvlNRsIAXBJArPhZ47yoT7hC9clsjVjr1Af\nbL/24wQR\n-----END CERTIFICATE-----\n";
var realSignKoreaCA5_3072 = "-----BEGIN CERTIFICATE-----\nMIIHFzCCBX+gAwIBAgIIEV+4Vft+hz0wDQYJKoZIhvcNAQELBQAwZDELMAkGA1UE\nBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRp\nb24gQXV0aG9yaXR5IENlbnRyYWwxFjAUBgNVBAMMDUtJU0EgUm9vdENBIDUwHhcN\nMjYwNDI0MDQwMDAwWhcNMzYwNDI0MDQwMDAwWjBQMQswCQYDVQQGEwJLUjESMBAG\nA1UECgwJU2lnbktvcmVhMRUwEwYDVQQLDAxBY2NyZWRpdGVkQ0ExFjAUBgNVBAMM\nDVNpZ25Lb3JlYSBDQTUwggGiMA0GCSqGSIb3DQEBAQUAA4IBjwAwggGKAoIBgQD0\nxvnwguO6gm981w+SAcPjLRvw+yhIG1VUvDGrH5WO6R7WtHOUWKPi0TZBJLiKeOVI\nbLOWzRpQrSRfqdalwZ8ii8o5kdVCJA+cIawUzq2ZAinFp8cpc7eSeI69q/3lnPc7\nWUvq+iYtqxXCFhIuZH0UC1xvBTT84khIpGA2lx/a+zSxk5nl6ow4NUOlk6drtNAE\nrAl0raiL3hsIEC+khNBdWoQ2SK02fJULlyRJ9yJO6qw2e2YkshhAjmk0EvugRQAf\nEbMUMl4/MlPh4WGSbBprp2Z0uYfI28IRKXNb6ByyawJkHEhuGTHGnkCd5DoMv8Pb\n7dg4SOR9LaGkROmY+vAIFSIDI13w3+rFZGa8vz3Cdu/EYFhWljz6yv2Z9gPtetkd\nUETpTWuqLz+KiCouX7cZgFXWL7a8N8GeIguza6twoVerWtb3paDfcrrZaJwB+ekO\n2ePyIwc2u9H30s/ET78TOneM5UJysk1kx6Vvezuo3QKShdv1haU8iYnsMcXsPB8C\nAwEAAaOCAt8wggLbMIGVBgNVHSMEgY0wgYqAFF01PqurwSTret1nGnYjTAOqY27m\noWikZjBkMQswCQYDVQQGEwJLUjENMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29y\nZWEgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgQ2VudHJhbDEWMBQGA1UEAwwNS0lT\nQSBSb290Q0EgNYIIFabNU1/F9DYwHQYDVR0OBBYEFLP0ixKPkGIS5IF0XdbMILYK\n+j/VMA4GA1UdDwEB/wQEAwIBBjCCATEGA1UdIAEB/wSCASUwggEhMIIBHQYEVR0g\nADCCARMwMAYIKwYBBQUHAgEWJGh0dHA6Ly93d3cucm9vdGNhLm9yLmtyL3JjYS9j\ncHMuaHRtbDCB3gYIKwYBBQUHAgIwgdEegc7HdAAgx3jJncEcspQAIKz1s9nHeMmd\nwRzHhbLIsuQAKABUAGgAaQBzACAAYwBlAHIAdABpAGYAaQBjAGEAdABlACAAaQBz\nACAAYQBjAGMAcgBlAGQAaQB0AGUAZAAgAHUAbgBkAGUAcgAgAEUAbABlAGMAdABy\nAG8AbgBpAGMAIABTAGkAZwBuAGEAdAB1AHIAZQAgAEEAYwB0ACAAbwBmACAAdABo\nAGUAIABSAGUAcAB1AGIAbABpAGMAIABvAGYAIABLAG8AcgBlAGEAKTAqBgNVHREE\nIzAhoB8GCSqDGoyaRAoBAaASMBAMDijso7wp7L2U7Iqk7L2kMA8GA1UdEwEB/wQF\nMAMBAf8wDwYDVR0kAQH/BAUwA4ABADCBjgYDVR0fBIGGMIGDMIGAoH6gfIZ6bGRh\ncDovL2Rpci5zaWdua29yZWEuY29tOjM4OS9DTj1LSVNBLVJvb3RDQS01LE9VPUtv\ncmVhLUNlcnRpZmljYXRpb24tQXV0aG9yaXR5LUNlbnRyYWwsTz1LSVNBLEM9S1I/\nYXV0aG9yaXR5UmV2b2NhdGlvbkxpc3QwDQYJKoZIhvcNAQELBQADggGBAKmqJU2H\n0gWUl6DmOKn1a0G4rvpKMmH549LGsrn92DwVQwVhF0GecwvsWLFJcYt62BBnqTzP\nUWUS9aPJcSFhVhbFEffEG7I9CtQtRTk7pWwT/uL8gxd70CzhnDy6kSFURn660WNZ\nRLdsrhMvSaQQu6YTJWHwNVyrFHrHgqkIztOq4AqzjAET7l+drTWfmSrST6aUb7zB\n8KMn/Yum+Q0k3gBPb9OJlijEZMOB4BRGmG/JB63TwXr1dHyxxUkJB163r3QAaQAl\nm/mKBgkPIvqC9rRMOp/7Ub8qHhgvFzECLH6h9lmcxwMaqHh/AxwBFi6rWO43SjJs\nWoNsMq90KRmAaZQv3lMtevAcw1Ih77gT9TtyBlSAPTgKzUjOdsKoL41CZw0y5GCt\nnA2kVs++lxw4F+ZMcjs5L7RxFybrUFC2lyTelia26hooHati+X8yxg7ToVP1V48I\n6GKvM9QqVwcoesVsyzApNUqhnSvZbf+jVYdM3QkkyzLAvl47VmsihrdIPA==\n-----END CERTIFICATE-----\n";
var realSignGATECA7_3072 = "-----BEGIN CERTIFICATE-----\nMIIHGDCCBYCgAwIBAgIIY2PgXYtVxiQwDQYJKoZIhvcNAQELBQAwZDELMAkGA1UE\nBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRp\nb24gQXV0aG9yaXR5IENlbnRyYWwxFjAUBgNVBAMMDUtJU0EgUm9vdENBIDUwHhcN\nMjYwNDI0MDQwMDAwWhcNMzYwNDI0MDQwMDAwWjBKMQswCQYDVQQGEwJLUjENMAsG\nA1UECgwES0lDQTEVMBMGA1UECwwMQWNjcmVkaXRlZENBMRUwEwYDVQQDDAxzaWdu\nR0FURSBDQTcwggGiMA0GCSqGSIb3DQEBAQUAA4IBjwAwggGKAoIBgQCN+iA66EjE\noNJfptFz6rfxFAqIQK9ggbMQRmmONzIYfyFxFaA55WF3qxuNC6geSjcf8/wChHJV\nkKZ3BokXPOyte5dLThRtqDym6Ycu8kwadIIbNFwsdCGSqNgc7B73k250HOmt2RlM\nj5fTm0QqHRKx2sxfRjCgIeMyPqWVVc1D+4luxH4k3U63FNjfNMIgRu9VTIzqRh2Y\n4nFSagB8WA1Ah3BpWYRrW9nYebKoIV6Kvo7FnoQNf85Rz9fDVT9qPcjA0y8VkW1w\nvoU/4SUikluoF/KTIdGu1q6IHBLP9v11Muw93vmF0wlqcXcp/UcgkEnwB/DeyOqN\n7XM+Li2xXvQ9XxoI5sOfDniXtwMnh/RjxBPEYVORl9kMOSqMVL12WOu/4k/F0IHc\n8u2wOW7kqcI6YcDRjzrcg1MuafndENEwMPJhVqIOIRqxjMWsTQTU9jV4wQSOW/NS\nJc42a+ZbhaT6ZghLIFTO5XAQBur9Dkhp+yCgYJOYnxyf1uyAtejpXykCAwEAAaOC\nAuYwggLiMIGVBgNVHSMEgY0wgYqAFF01PqurwSTret1nGnYjTAOqY27moWikZjBk\nMQswCQYDVQQGEwJLUjENMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2Vy\ndGlmaWNhdGlvbiBBdXRob3JpdHkgQ2VudHJhbDEWMBQGA1UEAwwNS0lTQSBSb290\nQ0EgNYIIFabNU1/F9DYwHQYDVR0OBBYEFLuhqdheXLySz4tqgHfseTFO5YdMMA4G\nA1UdDwEB/wQEAwIBBjCCATEGA1UdIAEB/wSCASUwggEhMIIBHQYEVR0gADCCARMw\nMAYIKwYBBQUHAgEWJGh0dHA6Ly93d3cucm9vdGNhLm9yLmtyL3JjYS9jcHMuaHRt\nbDCB3gYIKwYBBQUHAgIwgdEegc7HdAAgx3jJncEcspQAIKz1s9nHeMmdwRzHhbLI\nsuQAKABUAGgAaQBzACAAYwBlAHIAdABpAGYAaQBjAGEAdABlACAAaQBzACAAYQBj\nAGMAcgBlAGQAaQB0AGUAZAAgAHUAbgBkAGUAcgAgAEUAbABlAGMAdAByAG8AbgBp\nAGMAIABTAGkAZwBuAGEAdAB1AHIAZQAgAEEAYwB0ACAAbwBmACAAdABoAGUAIABS\nAGUAcAB1AGIAbABpAGMAIABvAGYAIABLAG8AcgBlAGEAKTAuBgNVHREEJzAloCMG\nCSqDGoyaRAoBAaAWMBQMEu2VnOq1reygleuztOyduOymnTASBgNVHRMBAf8ECDAG\nAQH/AgEAMA8GA1UdJAEB/wQFMAOAAQAwgY4GA1UdHwSBhjCBgzCBgKB+oHyGemxk\nYXA6Ly9sZGFwLnNpZ25nYXRlLmNvbTozODkvQ049S0lTQS1Sb290Q0EtNSxPVT1L\nb3JlYS1DZXJ0aWZpY2F0aW9uLUF1dGhvcml0eS1DZW50cmFsLE89S0lTQSxDPUtS\nP2F1dGhvcml0eVJldm9jYXRpb25MaXN0MA0GCSqGSIb3DQEBCwUAA4IBgQC35roJ\nVWD/Qg/i/bwzHFZnmW03EKYbZ4nONtRF3fWAjv51cyMgF+V+T9M7WsOImUkFuAp6\n7VInE4LkMSX+PkG1wjyxXfAQR9ddcw4c+FXzD7Ym0nwiCijkbFjna60TWwe38mSC\npxYysJrFKHR++GiYqfsufT7zGR4xpwQ5bztQcFhMcLHz0rqUH9Mbre9CV5uZV2ZC\nltaM30PsvBbqDykcSmllz2ZfucTyb5oroCA4SFAIWeHE9KbI0o07KLp5x7QEg6XB\nPn1/q8D95po2Nf8cu83dXUKFAeAQxq3fDoVGOgpqf4v62ZXCnCy0HndBiFKEdmmK\ngANRAK8iZIb/FL9VQknjCYI/4I6TRaAyx33GmXXUJVQeFTi0Q7yp+r3361KgKFqn\njoiZvqxBBnuqKQg0eDu3jtPSmaYcR5VQhUCWKQS6wfg66/I6L4nFtUB/z9UVJIKB\niYOAiiDV3nV3det+LgsO6e2kA06G4xUhxX+SxydNTbhZxapgFVtABivOmnA=\n-----END CERTIFICATE-----\n";
var realTradeSignCA5_3072 = "-----BEGIN CERTIFICATE-----\nMIIHKTCCBZGgAwIBAgIIenu1+Qf0440wDQYJKoZIhvcNAQELBQAwZDELMAkGA1UE\nBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRp\nb24gQXV0aG9yaXR5IENlbnRyYWwxFjAUBgNVBAMMDUtJU0EgUm9vdENBIDUwHhcN\nMjYwNDI0MDQwMDAwWhcNMzYwNDI0MDQwMDAwWjBPMQswCQYDVQQGEwJLUjESMBAG\nA1UECgwJVHJhZGVTaWduMRUwEwYDVQQLDAxBY2NyZWRpdGVkQ0ExFTATBgNVBAMM\nDFRyYWRlU2lnbkNBNTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBALV+\n5DUaE+0pQdZBx7sCX61LaAcXY69lAxT0Wrm4Cf8FUlNIpWRUL0ybDzhF+hs5i4r5\nrD3dDfxbicp3zUHdZ9Z/z6fGbFJmoiIUHfu8+doo9LwX+TO+JUojui3PPYmafSUj\nO4Sw2EAKTIit8Hjm9jKoBg5yFP/BpOd2oRG/SxGaAHIRtDXItZ8ZSo17sWbOx3au\nb92DCjF5iHEz7T8D2QZCaiKkdK8cyo3tFcwgqGSzXZAtQJCSAerfJfWUEY8JOOkl\nJu5sKM+IMmNTp94LtbPTS9D1/GfClAKMEYAqxK5SGxyDxWwCpCsM7fBWOcufwpfG\nhf+5tKeqTRywUzEvwKLvS1JEwq4+GvmnEGDVxcyI9KCEb9qwi7ds7+NAhxA85Z8d\nDFtJCgwz1PNIyv8c4Whs0xNMkpGJWwxM1sbnqpsMYZzrFgVub1Eo+8EqJWYluQvG\nTUo1KmUW115+mJAjEhSDuVqqe666aO0uEFHB61UGN+hk3vkHDd7/v9HfKqNK6QID\nAQABo4IC8jCCAu4wgZUGA1UdIwSBjTCBioAUXTU+q6vBJOt63WcadiNMA6pjbuah\naKRmMGQxCzAJBgNVBAYTAktSMQ0wCwYDVQQKDARLSVNBMS4wLAYDVQQLDCVLb3Jl\nYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50cmFsMRYwFAYDVQQDDA1LSVNB\nIFJvb3RDQSA1gggVps1TX8X0NjAdBgNVHQ4EFgQUzaleSCBQypAt6qQ3mjVzk2dO\nIQkwDgYDVR0PAQH/BAQDAgEGMIIBMQYDVR0gAQH/BIIBJTCCASEwggEdBgRVHSAA\nMIIBEzAwBggrBgEFBQcCARYkaHR0cDovL3d3dy5yb290Y2Eub3Iua3IvcmNhL2Nw\ncy5odG1sMIHeBggrBgEFBQcCAjCB0R6Bzsd0ACDHeMmdwRyylAAgrPWz2cd4yZ3B\nHMeFssiy5AAoAFQAaABpAHMAIABjAGUAcgB0AGkAZgBpAGMAYQB0AGUAIABpAHMA\nIABhAGMAYwByAGUAZABpAHQAZQBkACAAdQBuAGQAZQByACAARQBsAGUAYwB0AHIA\nbwBuAGkAYwAgAFMAaQBnAG4AYQB0AHUAcgBlACAAQQBjAHQAIABvAGYAIAB0AGgA\nZQAgAFIAZQBwAHUAYgBsAGkAYwAgAG8AZgAgAEsAbwByAGUAYQApMDkGA1UdEQQy\nMDCgLgYJKoMajJpECgEBoCEwHwwdKOyjvCntlZzqta3rrLTsl63soJXrs7TthrXs\ni6AwEgYDVR0TAQH/BAgwBgEB/wIBADAPBgNVHSQBAf8EBTADgAEAMIGPBgNVHR8E\ngYcwgYQwgYGgf6B9hntsZGFwOi8vbGRhcC50cmFkZXNpZ24ubmV0OjM4OS9DTj1L\nSVNBLVJvb3RDQS01LE9VPUtvcmVhLUNlcnRpZmljYXRpb24tQXV0aG9yaXR5LUNl\nbnRyYWwsTz1LSVNBLEM9S1I/YXV0aG9yaXR5UmV2b2NhdGlvbkxpc3QwDQYJKoZI\nhvcNAQELBQADggGBAITqGPG/af4SWq6boteMuaOcGt+tsrHTxUCrrftU752Nrdy8\nEUd967JX96wLaxW7yLvqVStVQ3WGEX3jmsOD7VNWiKruvctOxn/XCIx+QuHklCkq\nSNOjmPjINhXvhWnNKJTUtLrUgF8iFYjD5vWVfWaDFOeA9/HurQdoyhdKdfj0ib9J\nGrXgnC9B0wbuxtvNpXcth0ViEI0m/4PTJSrNxMvi/QSmxcO/Bfbr8DjUFcVTd4wc\nGGzUr4tcYKLRVPt4iV2xRJKDbVK6hRv3cX/EJdNqHg+U2P3eBPyiBl7x+d6lExO6\n3a2uz9BxtlEypnZ8b2Ww5h065w/InJG0OSuOtnmCiXq5jU9aImOS22hRhO1MW2eR\nCBhn5oFVRG2EK8+HecwPfK1Ntxkgbme8uQJ6fWhBM839jPj+07136gKiQDwcAps6\nzbinhkq0wlbA6TWYMHWrMZZrkP8kaHJM6Zl/tde10SodDQTWwa1q0mEorEs3R2jS\nhQMzwOHg1Pm4XTGSCg==\n-----END CERTIFICATE-----\n";

// Test-CA 인증서
var testYessignClass5_2048 = "-----BEGIN CERTIFICATE-----\nMIIFSTCCBDGgAwIBAgIBGTANBgkqhkiG9w0BAQsFADBpMQswCQYDVQQGEwJLUjEN\nMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRo\nb3JpdHkgQ2VudHJhbDEbMBkGA1UEAwwSS2lzYSBUZXN0IFJvb3RDQSA3MB4XDTIw\nMDcxNjAyMDAzM1oXDTMwMDcxNjAyMDAzM1owVzELMAkGA1UEBhMCa3IxEDAOBgNV\nBAoMB3llc3NpZ24xFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEfMB0GA1UEAwwWeWVz\nc2lnbkNBLVRlc3QgQ2xhc3MgNTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC\nggEBAMMQokHrWGK5VJxp/m4hVsiw9fjp98mbae/qXVUN6uDeP/gFXknIqLAyycky\n3rFvHBUtLEJbcQTH+2sxge/xTKBLYuQXLMZTvaQv7GewoQXg0b2vXKmSn5OQBhR/\nB4vaM3riP2d9ZC9zrgXfjCd/i6whB/7mvMzywvc3Va/4ZqqVkyyecuSSwAjGEW63\ngfsz85fbqSz+eNRenfQI0uIAyciSzFx5aTvKp4E4rkXcRZBgNqZ1X1Y0ATY8/1TE\nNR16pxxUNXeuHZ8TcORhaBz/fCT9VcZBTYST7iXFYHEfaU9NOdF8Z/KnPcJB/7+d\nd8UtZ5rKkgOT8Scq6qyZd1s0W/cCAwEAAaOCAgwwggIIMIGTBgNVHSMEgYswgYiA\nFFjKF4mwhfh43NN6vwHyoEA89cHYoW2kazBpMQswCQYDVQQGEwJLUjENMAsGA1UE\nCgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkg\nQ2VudHJhbDEbMBkGA1UEAwwSS2lzYSBUZXN0IFJvb3RDQSA3ggEBMB0GA1UdDgQW\nBBSj1Tk2MRU2T7JRwNoIOzN4gTDPjzAOBgNVHQ8BAf8EBAMCAQYwfAYDVR0gAQH/\nBHIwcDBuBgRVHSAAMGYwMAYIKwYBBQUHAgEWJGh0dHA6Ly93d3cucm9vdGNhLm9y\nLmtyL3JjYS9jcHMuaHRtbDAyBggrBgEFBQcCAjAmHiTHdAAgx3jJncEcspQAIMLc\n1djGqQAgx3jJncEcx4WyyLLkAC4wKwYDVR0RBCQwIqAgBgkqgxqMmkQKAQGgEzAR\nDA/quIjsnLXqsrDsoJzsm5AwEgYDVR0TAQH/BAgwBgEB/wIBADAPBgNVHSQBAf8E\nBTADgAEAMHEGA1UdHwRqMGgwZqBkoGKGYGxkYXA6Ly9zbm9vcHkueWVzc2lnbi5v\nci5rcjo2MDIwL2NuPUtJU0EtVEVTVC1BUkw3LG91PVJPT1RDQSxvPUtJU0EsYz1L\nUj9hdXRob3JpdHlSZXZvY2F0aW9uTGlzdDANBgkqhkiG9w0BAQsFAAOCAQEAjvo2\neuBwqCnmFHpkdzmKbfuttbm4D2hxXLKQmzJg4TTVH2uLn2J98l/A4SfuAhv25bKd\nwEdMKos21wcPpEpu5TtKVBxtP0eU2hRAcpDdSxHC8RDkUjys//AL14jQb1WBoCVc\nkS2YRlWGbHFqRXW9HY/IM7yWjGR/f5Pbbn3oT817WCynpZUq3sGrR8MMJN/Usonq\nk9OWLTsR0pEXi1W/Y45Z2r1TLVbc7oj3Lr+nCMEDCfQ0g+60YXSet15BG8WuIlMU\ngVO31SSLYc8KhzVxkspw+9GemDrR4hsIXsZLDaSiFb3ZfLusmOp+WrOJnwDPoguP\nhediWuvynIiPjn+lHg==\n-----END CERTIFICATE-----\n";
var testCrossCertCA5 = "-----BEGIN CERTIFICATE-----\nMIIFdzCCBF+gAwIBAgIBDjANBgkqhkiG9w0BAQsFADBpMQswCQYDVQQGEwJLUjEN\nMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRo\nb3JpdHkgQ2VudHJhbDEbMBkGA1UEAwwSS2lzYSBUZXN0IFJvb3RDQSA3MB4XDTE4\nMDExNzAwNTg1NFoXDTI4MDExNzAwNTg1NFowUzELMAkGA1UEBhMCS1IxEjAQBgNV\nBAoMCUNyb3NzQ2VydDEVMBMGA1UECwwMQWNjcmVkaXRlZENBMRkwFwYDVQQDDBBD\ncm9zc0NlcnRUZXN0Q0E1MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\nwxP+xcgXdyjh96BEZSWeKXa7V/QzwgKkt6tl1AyTpjET0bmmH8RJDCBNCUuq/zML\n8euR1B6B1XsJmLT1l75srMN30uAMilVKfT33kjucBRsf8ST8hSjazmx1R+KjKX+F\n0wNeMi9hCgzaK03upukY9JEIhZU+FbpbG41yHtNfYOooy7sG/pFcgVGFthjJe/9B\n9HLalk81j2u9+DdHLPD+/9676/1K0v09/O44yUYl5mg6mWZr2z15O+lR2YZYzFdD\nurEI3rG9TwxB1/TfYXHnkpDL/4VT79Vh1VWfoU2oCHgURc1WsDTTVDi1NVaLcbkh\nplv5IBgfQXj9YfGz9KRP8wIDAQABo4ICPjCCAjowgZMGA1UdIwSBizCBiIAUWMoX\nibCF+Hjc03q/AfKgQDz1wdihbaRrMGkxCzAJBgNVBAYTAktSMQ0wCwYDVQQKDARL\nSVNBMS4wLAYDVQQLDCVLb3JlYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50\ncmFsMRswGQYDVQQDDBJLaXNhIFRlc3QgUm9vdENBIDeCAQEwHQYDVR0OBBYEFIHV\nOZnNIv6dxkaYS1CUdi7A5x4/MA4GA1UdDwEB/wQEAwIBBjB8BgNVHSABAf8EcjBw\nMG4GBFUdIAAwZjAwBggrBgEFBQcCARYkaHR0cDovL3d3dy5yb290Y2Eub3Iua3Iv\ncmNhL2Nwcy5odG1sMDIGCCsGAQUFBwICMCYeJMd0ACDHeMmdwRyylAAgwtzV2Map\nACDHeMmdwRzHhbLIsuQALjAzBgNVHREELDAqoCgGCSqDGoyaRAoBAaAbMBkMF+2V\nnOq1reyghOyekOyduOymnSjso7wpMBIGA1UdEwEB/wQIMAYBAf8CAQAwDwYDVR0k\nAQH/BAUwA4ABADCBmgYDVR0fBIGSMIGPMIGMoIGJoIGGhoGDbGRhcDovL3Rlc3Rk\naXIuY3Jvc3NjZXJ0LmNvbTozODkvY249S2lzYS1UZXN0LVJvb3RDQS03LG91PUtv\ncmVhLUNlcnRpZmljYXRpb24tQXV0aG9yaXR5LUNlbnRyYWwsbz1LSVNBLGM9S1I/\nYXV0aG9yaXR5UmV2b2NhdGlvbkxpc3QwDQYJKoZIhvcNAQELBQADggEBAEAPpWTt\nQ7Qs6lLMGmI6GPxLVBuQ09UaCJZnZC3qiExqBbWjXg/wafVdo/KTm03bfomPpnLh\nhucYh+in8q/iKCMD6XZlpdTb9UdFLUjWx77e/VEtRrSZLQ3Gwy9uD+8KN9NOITHs\nEHNfOBwL2FKVNtbOIob5bpa94UWFSUvaufXRrn0oVSDPx18Za9L9LqGmtpyApAeJ\nqklK8Idpkahad0qSTqnMnW0QifF+no1TqQoDH0FrRyLryrcIW2PVxaaArGCVpIv5\nRKQdS6K0JzoTyaVCYBQZJUAAsFsqs2wpHngZfGv4VSBcbq8+mdl5jN8YI6v7NogN\n3YjUGdBycEpanw0=\n-----END CERTIFICATE-----\n";
var testSignGateFTCA6 = "-----BEGIN CERTIFICATE-----\nMIIFaTCCBFGgAwIBAgIBCzANBgkqhkiG9w0BAQsFADBpMQswCQYDVQQGEwJLUjEN\nMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRo\nb3JpdHkgQ2VudHJhbDEbMBkGA1UEAwwSS2lzYSBUZXN0IFJvb3RDQSA3MB4XDTE4\nMDExNzAwMzg0M1oXDTI4MDExNzAwMzg0M1owTTELMAkGA1UEBhMCS1IxDTALBgNV\nBAoMBEtJQ0ExFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEYMBYGA1UEAwwPc2lnbkdB\nVEUgRlRDQTA2MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlgnaBDKq\nybVMXfefY1fpHHy33OkdjmN/1m+N/pioWD0Fl6zKCNafda02m9S9JMLiDkaHo7Y1\nbarR98XitI9bmvhCsEduidbwFusvXnJQH2Bo12ZN4MBv7rSFYJa5JX1Vpr7i7Zgy\nVLtxm3cXZrIARVqteu24vMXNC/ntCV+4K+qlof3FAGuGn5ixTkYpF4SSrRZKwgg6\nINR8NO5wvyW1lPE/tUvCQRU+IVpqo9xaQbq47OrzWC7fDf+1F7jr2gz54Nx25TVN\nuaqplRfVpqaqta83vf+UnPZbVHA392B/VsNWOW9CEtUOsik+32wD+Ls4qye+IW7L\nTtS7UUGfW+JQWwIDAQABo4ICNjCCAjIwgZMGA1UdIwSBizCBiIAUWMoXibCF+Hjc\n03q/AfKgQDz1wdihbaRrMGkxCzAJBgNVBAYTAktSMQ0wCwYDVQQKDARLSVNBMS4w\nLAYDVQQLDCVLb3JlYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50cmFsMRsw\nGQYDVQQDDBJLaXNhIFRlc3QgUm9vdENBIDeCAQEwHQYDVR0OBBYEFI9v9uiJcWoC\nA9t6Ko5VqFPn0MwzMA4GA1UdDwEB/wQEAwIBBjB8BgNVHSABAf8EcjBwMG4GBFUd\nIAAwZjAwBggrBgEFBQcCARYkaHR0cDovL3d3dy5yb290Y2Eub3Iua3IvcmNhL2Nw\ncy5odG1sMDIGCCsGAQUFBwICMCYeJMd0ACDHeMmdwRyylAAgwtzV2MapACDHeMmd\nwRzHhbLIsuQALjAuBgNVHREEJzAloCMGCSqDGoyaRAoBAaAWMBQMEu2VnOq1reyg\nleuztOyduOymnTASBgNVHRMBAf8ECDAGAQH/AgEAMA8GA1UdJAEB/wQFMAOAAQAw\ngZcGA1UdHwSBjzCBjDCBiaCBhqCBg4aBgGxkYXA6Ly9jYXRlc3Quc2lnbmdhdGUu\nY29tOjM4OS9jbj1LaXNhIFRlc3RSb290Q0EgNyxvdT1Lb3JlYSBDZXJ0aWZpY2F0\naW9uIEF1dGhvcml0eSBDZW50cmFsLG89S0lTQSxjPUtSP2F1dGhvcml0eVJldm9j\nYXRpb25MaXN0MA0GCSqGSIb3DQEBCwUAA4IBAQBHmQLyeJSmzIDFRFP6FRfU5pCi\nVJgpv8jU+kW7j07OtFP12zSjO2zGJUg5OgvyA0em83G07z3ncREGPcwvO9BT5J5H\n3wujOHDmnyC/yL1G9wwPmh5TicMHL56T7nlKLZm4szM+/qj9j7/j2yoZ5Qo4igaV\nH+MdPkeVjtEyNwaMORAYQeoqRtZIfG/FVpEfkfSjX+GXir4f3vdqoUH/DdHDzLVV\n9ykhePLyahiCcuKFUQHgtNu/M2paQGSLI2O6PzPrTmShGdJkaOJQy2smbQXjnWGU\nARvQMue93TnLHPzrOzDNRL55bJerO7pSvehBToYut5rPd7S1bzYsSVaaiQ8d\n-----END CERTIFICATE-----\n"
var testSignGateFTCA7= "-----BEGIN CERTIFICATE-----\nMIIFaTCCBFGgAwIBAgIBFjANBgkqhkiG9w0BAQsFADBpMQswCQYDVQQGEwJLUjEN\nMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRo\nb3JpdHkgQ2VudHJhbDEbMBkGA1UEAwwSS2lzYSBUZXN0IFJvb3RDQSA3MB4XDTIw\nMDYxMTAyNTY0MVoXDTMwMDYxMTAyNTY0MVowTTELMAkGA1UEBhMCS1IxDTALBgNV\nBAoMBEtJQ0ExFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEYMBYGA1UEAwwPc2lnbkdB\nVEUgRlRDQTA3MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoQDTamXs\n18RaKjEsY7W/ceRwPCyxivNVTdLOU2ImyLlmacf4+mgxCLFO0ojpYyK+i11Dro+R\nUlonuCVCfagOyx2zsID/3+raFZiP2kUZTlMIqVJ8UGUcEW38RFUuzBo9OcxkH+kp\nKx2CErPqnZGx4fG0TBwxgri31fw/lGmnCZsjvmyaqTWg+L25uw5qw/PRdK1cxaOQ\nYodx7ZCJCgz/bS2xWBeRC28NvLAn0dRzQUmKhSDa/LUXy4ajdxtteuFJIVNc76Gd\nXcVFO0yBp3olxGtvd6lvKDJlO4V0NVnXWxCluIT8KkgamCQjLKvSmP0aHWMyBPIg\nnLHpaDkPt8bx1QIDAQABo4ICNjCCAjIwgZMGA1UdIwSBizCBiIAUWMoXibCF+Hjc\n03q/AfKgQDz1wdihbaRrMGkxCzAJBgNVBAYTAktSMQ0wCwYDVQQKDARLSVNBMS4w\nLAYDVQQLDCVLb3JlYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50cmFsMRsw\nGQYDVQQDDBJLaXNhIFRlc3QgUm9vdENBIDeCAQEwHQYDVR0OBBYEFPcBlJFfKbZM\noXLKEUkLXK/P2H4MMA4GA1UdDwEB/wQEAwIBBjB8BgNVHSABAf8EcjBwMG4GBFUd\nIAAwZjAwBggrBgEFBQcCARYkaHR0cDovL3d3dy5yb290Y2Eub3Iua3IvcmNhL2Nw\ncy5odG1sMDIGCCsGAQUFBwICMCYeJMd0ACDHeMmdwRyylAAgwtzV2MapACDHeMmd\nwRzHhbLIsuQALjAuBgNVHREEJzAloCMGCSqDGoyaRAoBAaAWMBQMEu2VnOq1reyg\nleuztOyduOymnTASBgNVHRMBAf8ECDAGAQH/AgEAMA8GA1UdJAEB/wQFMAOAAQAw\ngZcGA1UdHwSBjzCBjDCBiaCBhqCBg4aBgGxkYXA6Ly9jYXRlc3Quc2lnbmdhdGUu\nY29tOjM4OS9jbj1LaXNhIFRlc3RSb290Q0EgNyxvdT1Lb3JlYSBDZXJ0aWZpY2F0\naW9uIEF1dGhvcml0eSBDZW50cmFsLG89S0lTQSxjPUtSP2F1dGhvcml0eVJldm9j\nYXRpb25MaXN0MA0GCSqGSIb3DQEBCwUAA4IBAQAa0HR7ukEwhW0Oc5uJiCjZFNPu\nN0Ai5gD8jf6WYX4ecg/WRoLOLdlzx0smljWawHXOlCp5bYOufhPXIvmCuoaqJy6L\nmcJeSYgVkshNrGLQVDVL4UoxIfPp5xZOn+Xgn7Lrf1VO1TxU+f1pDwBWo8idPjM3\nizaLWmISaoeZAUmmPBWjHTqy1cY4TTpNX4meibXCYGYLUtX78p9gL2/RqHfKuqd6\nPKfQJVf6nmLosvvonI9Ms5InxstyKWiWXnrkeXKWwVCFG68GaJIG8BB71tO74EjR\nWNI9519g+R0vXVSRMoUCzrL0WIhNXrrpN3VplLpb+ueIditEgqTHxLl2HG7x\n-----END CERTIFICATE-----\n";
var testTradeSign_08 = "-----BEGIN CERTIFICATE-----\nMIIFfzCCBGegAwIBAgIBCDANBgkqhkiG9w0BAQsFADBpMQswCQYDVQQGEwJLUjEN\nMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRo\nb3JpdHkgQ2VudHJhbDEbMBkGA1UEAwwSS2lzYSBUZXN0IFJvb3RDQSA3MB4XDTE4\nMDExNjAxNTU0MFoXDTI4MDExNjAxNTU0MFowVjELMAkGA1UEBhMCS1IxEjAQBgNV\nBAoMCVRyYWRlU2lnbjEVMBMGA1UECwwMQWNjcmVkaXRlZENBMRwwGgYDVQQDDBNU\ncmFkZVNpZ25DQTIwMThUZXN0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC\nAQEAoXO3YcgktesGEIIBVTpy+uM5g0hEOXAdjwb19d8jmn4O8ZzTStl6zURROT5G\npGLLhLxj3hSfzcvxr+0TRVyPij/ocgXziMYIiMUXSVMndN5je6A3QqDCEwa0+gLU\nXbDGcKVmWjHD+8rJtsXj8cBRQNGWul+ZaCChoIOtVWwvpSbevr94+t7ChG/EEaD1\n57kQPqS528DKNlyKl9V+vW4LoKosnKHeWB/1POHb7LrD5tyi2N9QZY5p8OZaicz0\nSouwEtjBI8GRkKHzLFys5pTZTTCWjhMoCBjrYO92GVgWbiEEdH49u2HYJP94+SHV\nXa+t52cQ/HVrJLsxwyYhH97x8wIDAQABo4ICQzCCAj8wgZMGA1UdIwSBizCBiIAU\nWMoXibCF+Hjc03q/AfKgQDz1wdihbaRrMGkxCzAJBgNVBAYTAktSMQ0wCwYDVQQK\nDARLSVNBMS4wLAYDVQQLDCVLb3JlYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBD\nZW50cmFsMRswGQYDVQQDDBJLaXNhIFRlc3QgUm9vdENBIDeCAQEwHQYDVR0OBBYE\nFLpQF1kCoj5O4f7c810rzp6KhI0MMA4GA1UdDwEB/wQEAwIBBjB8BgNVHSABAf8E\ncjBwMG4GBFUdIAAwZjAwBggrBgEFBQcCARYkaHR0cDovL3d3dy5yb290Y2Eub3Iu\na3IvcmNhL2Nwcy5odG1sMDIGCCsGAQUFBwICMCYeJMd0ACDHeMmdwRyylAAgwtzV\n2MapACDHeMmdwRzHhbLIsuQALjA5BgNVHREEMjAwoC4GCSqDGoyaRAoBAaAhMB8M\nHSjso7wp7ZWc6rWt66y07Jet7KCV67O07Ya17IugMBIGA1UdEwEB/wQIMAYBAf8C\nAQAwDwYDVR0kAQH/BAUwA4ABADCBmQYDVR0fBIGRMIGOMIGLoIGIoIGFhoGCbGRh\ncDovL3Rlc3RjYS50cmFkZXNpZ24ubmV0OjM4OS9DTj1LaXNhLVRlc3QtUm9vdENB\nLTcsT1U9S29yZWEtQ2VydGlmaWNhdGlvbi1BdXRob3JpdHktQ2VudHJhbCxPPUtJ\nU0EsQz1LUj9hdXRob3JpdHlSZXZvY2F0aW9uTGlzdDANBgkqhkiG9w0BAQsFAAOC\nAQEAT+i4wIbIyrOW4r7QVGigmtcZHhxuIBYFU/5083boENoY54MPe2872EH2pLwO\nV7OkjxTTKyd7cbOzqYhGKLbnPfI8yqyCwiGj+SOE4qQ2BmA+2cNr3BLmEuokR9tn\ntMQXFyTLwNMWznIJEnKrhQSgNAjDmSz+j3fnx8+A5dbZlCzSwtQR8kVJPd2HJK1U\nNw445S3s92QCYW9WRhx23KV8134VBKI4uwnnUdiZZIYFMh9aWdX/fEdvEqz1mUJp\n6uwxz+IyQK6HK1ZffXeSvA8cuT316v8bDk/+tC6PV1tFS1jNJkWv4IRtSKXzR1T1\n8naThVU9/QKSkuRdSTqMEoNCPQ==\n-----END CERTIFICATE-----\n";
var testSignKoreaCA5 = "-----BEGIN CERTIFICATE-----\nMIIFQzCCBCugAwIBAgIBBTANBgkqhkiG9w0BAQsFADBpMQswCQYDVQQGEwJLUjEN\nMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRo\nb3JpdHkgQ2VudHJhbDEbMBkGA1UEAwwSS2lzYSBUZXN0IFJvb3RDQSA3MB4XDTE4\nMDExNTA3MTUzOVoXDTI4MDExNTA3MTUzOVowVTELMAkGA1UEBhMCS1IxEjAQBgNV\nBAoMCVNpZ25Lb3JlYTEVMBMGA1UECwwMQWNjcmVkaXRlZENBMRswGQYDVQQDDBJT\naWduS29yZWEgVGVzdCBDQTUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB\nAQC3FscnYFsEPWmWUdvdqp++bsri3gGpE+cHLeeVrnyXBpsq4X1P+LbLw1yGKrwK\nsn+RxoYawmCc6n6FddWmm2P4x858xZ9aC68cz57eSYyIBfDgbUlnaZBv6+wh4k45\nVt5vxecOwbM2Egx+iBgcoqEXtngK9R1xKV1JBf8+IBu/PNmCWgi1KuB88JeGJ9qU\nKJCZrtBPnKtoGhvQENgVbuBugMNgo7JoGsp6OaSZIfwyRqL743+z2m7PJyIw+cXT\n/u5RQq4II1FZb37hsntgaR4sQtnFXFWqSH5FRgeD8tjBMg1ASfWVOWi8TUV2nG22\nqnoUm6m62AEA/VdRX6Teas1JAgMBAAGjggIIMIICBDCBkwYDVR0jBIGLMIGIgBRY\nyheJsIX4eNzTer8B8qBAPPXB2KFtpGswaTELMAkGA1UEBhMCS1IxDTALBgNVBAoM\nBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0aG9yaXR5IENl\nbnRyYWwxGzAZBgNVBAMMEktpc2EgVGVzdCBSb290Q0EgN4IBATAdBgNVHQ4EFgQU\n8XCpr2/PnYusgYXMFvR82YVcDMQwDgYDVR0PAQH/BAQDAgEGMHwGA1UdIAEB/wRy\nMHAwbgYEVR0gADBmMDAGCCsGAQUFBwIBFiRodHRwOi8vd3d3LnJvb3RjYS5vci5r\nci9yY2EvY3BzLmh0bWwwMgYIKwYBBQUHAgIwJh4kx3QAIMd4yZ3BHLKUACDC3NXY\nxqkAIMd4yZ3BHMeFssiy5AAuMCoGA1UdEQQjMCGgHwYJKoMajJpECgEBoBIwEAwO\nKOyjvCnsvZTsiqTsvaQwEgYDVR0TAQH/BAgwBgEB/wIBADAPBgNVHSQBAf8EBTAD\ngAEAMG4GA1UdHwRnMGUwY6BhoF+GXWxkYXA6Ly8yMTEuMTc1LjgxLjEwMjo2ODkv\nY249VEVTVC1ST09ULVJTQS1DUkw3LG91PVJPT1RDQSxvPUtJU0EsYz1LUj9hdXRo\nb3JpdHlSZXZvY2F0aW9uTGlzdDANBgkqhkiG9w0BAQsFAAOCAQEAgtmcXdraZHQJ\nWfpvG6c1xNLzt+A855pwAEmt4EJZxpsckKFgRha44KZdaOy36RE8kB8CFoVChlek\nAEx4a+jspT9W2Lzp67sJ92A/NBGMmlWtl1dAfmmCYYmpCW6i6EID132jeK7fXa1J\n/q+DXWVWhalY3CaLV/Utqca+FIzKtRtJ6mcx3A6PXkuKHkq0muO/Go8Ut/I1BVrL\ncMYrLwNyznXBXjXn7oaETKGXRRwHeYE6aKW/714IFKePhMEA/ZMTCHOlI+c+TZYg\n6JkzpqcSXxAuoovAaSs0TUveL0a1WDa/v+cUgxAiVBqhnRGJDAw3ZSMpGo+1Ogsv\ngQiB4kVgmA==\n-----END CERTIFICATE-----\n";
var testSignKoreaCA6 = "-----BEGIN CERTIFICATE-----\nMIIFQzCCBCugAwIBAgIBHDANBgkqhkiG9w0BAQsFADBpMQswCQYDVQQGEwJLUjEN\nMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRo\nb3JpdHkgQ2VudHJhbDEbMBkGA1UEAwwSS2lzYSBUZXN0IFJvb3RDQSA3MB4XDTI0\nMTIyMzEwMTkyMloXDTM0MTIyMzEwMTkyMlowVTELMAkGA1UEBhMCS1IxEjAQBgNV\nBAoMCVNpZ25Lb3JlYTEVMBMGA1UECwwMQWNjcmVkaXRlZENBMRswGQYDVQQDDBJT\naWduS29yZWEgVGVzdCBDQTYwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB\nAQC/OyMNObcMwu5iOXL09f1Rm0U7mIqoXTKyVG4RLoeugTwDwn360nVTZKfJUqdo\n8NdK7ii/kJ7PXHt5K6d7s+O8guNbK/1eJoSUEmfbfkTobZl4uNZ1MKkNmPQVqfD3\nkvNXR6rPOHVsX3yVRsqNs8qByqKNIz1hEJurF766NSIFi/u1NA+PU0qs+xADZr3n\nZVqtftBmBp3zLhKK3gHWrKInucCFJ0RDkGIOkHbqS7OkVcR/ImF6lBHaFBV9l0PQ\nDDySnyo3On9RqRk/DYWCoVzJV6MlktRf3bJ9kb5Dl/uFiPp3J4/c16OlDRm1icMI\nYu6BzCcYBVboY6Kfsqma8iunAgMBAAGjggIIMIICBDCBkwYDVR0jBIGLMIGIgBRY\nyheJsIX4eNzTer8B8qBAPPXB2KFtpGswaTELMAkGA1UEBhMCS1IxDTALBgNVBAoM\nBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0aG9yaXR5IENl\nbnRyYWwxGzAZBgNVBAMMEktpc2EgVGVzdCBSb290Q0EgN4IBATAdBgNVHQ4EFgQU\n8r7vLtC1+QXYKjeTYcWN0Cdnl0swDgYDVR0PAQH/BAQDAgEGMHwGA1UdIAEB/wRy\nMHAwbgYEVR0gADBmMDAGCCsGAQUFBwIBFiRodHRwOi8vd3d3LnJvb3RjYS5vci5r\nci9yY2EvY3BzLmh0bWwwMgYIKwYBBQUHAgIwJh4kx3QAIMd4yZ3BHLKUACDC3NXY\nxqkAIMd4yZ3BHMeFssiy5AAuMCoGA1UdEQQjMCGgHwYJKoMajJpECgEBoBIwEAwO\nKOyjvCnsvZTsiqTsvaQwEgYDVR0TAQH/BAgwBgEB/wIBADAPBgNVHSQBAf8EBTAD\ngAEAMG4GA1UdHwRnMGUwY6BhoF+GXWxkYXA6Ly8yMTEuMTc1LjgxLjEwMjo2ODkv\nY249VEVTVC1ST09ULVJTQS1DUkw3LG91PVJPT1RDQSxvPUtJU0EsYz1LUj9hdXRo\nb3JpdHlSZXZvY2F0aW9uTGlzdDANBgkqhkiG9w0BAQsFAAOCAQEAQ6/aSa9T6E1W\n9df6oX3qbvD/XYlNObs/SdIfqcxr+rWWWEh4l4mShsWIX+8rI6z/eLGQUxeldmeF\nhLQwH+lAdW9JFRsZbv1terRlirv6jbPaQt4RcQZTQkdJBIiyX50twr++WWDwqTq5\neIpIDtRH5Gi0KdbfhKD0eD3xc1twxgGVxV5SxXx6TNHTLex2E4yNG0Mk3JXJfz+h\nXVUzuJG2ZCugTzmeGoJzj0xybZfYQSedishScSJgPNqdchWA15ux/O/XtW1tpskn\nG1Oj5xM6hU+lDGd8RtDMnz4Gqm0tHFN3C4Sezp/bFFn0wBeE37xuYiGsY8mPJqzb\nrWEYZCkDug==\n-----END CERTIFICATE-----\n";

var initech_ca_internal = "-----BEGIN CERTIFICATE-----\nMIID3TCCAsWgAwIBAgIBAjANBgkqhkiG9w0BAQsFADBuMQswCQYDVQQGDAJrcjEO\nMAwGA1UEBwwFc2VvdWwxEDAOBgNVBAoMB2luaXRlY2gxDTALBgNVBAsMBHJvb3Qx\nDTALBgNVBAMMBHJvb3QxHzAdBgkqhkiG9w0BCQEMEHJvb3RAaW5pdGVjaC5jb20w\nHhcNMTcwOTAzMTUwMDAwWhcNMjQwOTAzMTQ1OTU5WjBoMQswCQYDVQQGDAJrcjEO\nMAwGA1UEBwwFc2VvdWwxEDAOBgNVBAoMB2luaXRlY2gxCzAJBgNVBAsMAmNhMQsw\nCQYDVQQDDAJjYTEdMBsGCSqGSIb3DQEJAQwOY2FAaW5pdGVjaC5jb20wggEhMA0G\nCSqGSIb3DQEBAQUAA4IBDgAwggEJAoIBAH9r7QLwORFfihinTbWKzjmEyeDHS6Yb\nn98xCuo2jA9PxfCJVpuDR0MFxad2cDAPVnLQjBu7HQm26piWcHRS1fS0BJp+1krE\neU6tWCPLAyAU4Fv+t1GUfoormxc5YS8ZAjJCwTlOBEMpRQ5wUd6EaUcJjXBNEb1F\npYFlRgEZDWkD+Nyd+PQg2Vk4mdHI5syCXYXiTcJE8LVRSDCgQ4jBGXt4G0buhfSB\noWN0cl1Jqh5HF3WWJcvKreDjT9O/MIeMPfBir7M5dZz44qng/vmBOLA+bqp2yeYE\ngt/f0ZRXmst67Gcs6HuVLI12rXbJzsRmcPvY0ZUrQTNzc1tfvQfguYsCAwEAAaOB\njDCBiTAdBgNVHQ4EFgQUDSnlpltTR5BYiE6qutp01MZTZ8AwIgYDVR0jBBswGYAU\nXqtULzVK+pmSFI5eG6i4SblPOoqCAQEwDgYDVR0PAQH/BAQDAgDGMCAGA1UdJQEB\n/wQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAzASBgNVHRMBAf8ECDAGAQH/AgEAMA0G\nCSqGSIb3DQEBCwUAA4IBAQADKya4SEKaYCaRz3ZsXvWwkt7zLgywr0BirOuodRDf\nwpFLAoWNg4GbrjRaMJWKtd+VmRrPV4ehemwIaFpNudMaj52/EpVrzPCG+8flxeTt\nugC42LGkf1m7J1aVGLG3IWUIp7sTbBBqah+sOj5mBUbicU7xHQsISWFoSDtC4QOb\nixqKW0xCi9AW4kvs4YzTVuWTo5Ed4n4GhrGxk9QiCyj0XWbWwtLJR71yPkqVg0ae\neAXEKEP1FXjppaKT2LBscH4iSRDgbn7pMI3wLXU/FjvuUh9Zdjr0gMzcjpQBfaDf\n1wCT84cSdPD3Nc+PyHsX00JxtubFKyB5NhWZRbs/rvfj\n-----END CERTIFICATE-----\n";
var initech_ca = "-----BEGIN CERTIFICATE-----\nMIIDsTCCApmgAwIBAgIBAjANBgkqhkiG9w0BAQsFADBWMQswCQYDVQQGDAJLUjEV\nMBMGA1UECgwMSU5JVEVDSF9ERU1PMRowGAYDVQQLDBFJTklURUNIX0RFTU9fUk9P\nVDEUMBIGA1UEAwwLVFNfUEtJX0RFTU8wHhcNMTkwOTE0MTUwMDAwWhcNMzkwOTE1\nMTQ1OTU5WjBUMQswCQYDVQQGDAJLUjEVMBMGA1UECgwMSU5JVEVDSF9ERU1PMRgw\nFgYDVQQLDA9JTklURUNIX0RFTU9fQ0ExFDASBgNVBAMMC1RTX1BLSV9ERU1PMIIB\nITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBWPyQ0hzwlxe3iyAiOg1Es7Cet\nK/yZ/MguQMNcpB6csBFs94h8amTXDwtpX0dXh9XLCntL9HYDU/iRZApZcH1lS3E/\nSAzIVYRNnmQqMTbOB2sNRqlUL6Px5gHwRH0Cjuus3nUw755WHciWt54l9q+j+5/2\nouY/8g/2eSd5ykUmYcEHFTOXEwtbgQKAdNO3GBYM6sutxuV+aaCwJrDpLB//eRFO\nVj8NbY4wtMsyJFDK7zs1BeZNL2Bpb6X1ejjbd4SrIQMsgpAEECDhJk6Tx7vufVO6\nvjpt31heaibXO43JDuuc98wD35j13R/CtG0nYXMfCzn2zBQ9wmdDdNVP+9ULAgMB\nAAGjgYwwgYkwHQYDVR0OBBYEFJSghgQ8IILy3qBPCHMdiEM9l2XOMCIGA1UdIwQb\nMBmAFLI5F23QLt9CvzuW3YlPMwWW+hFyggEBMA4GA1UdDwEB/wQEAwIAxjAgBgNV\nHSUBAf8EFjAUBggrBgEFBQcDAQYIKwYBBQUHAwMwEgYDVR0TAQH/BAgwBgEBAAIB\nADANBgkqhkiG9w0BAQsFAAOCAQEAovVrkADHO913e3kxUhE2Ooe10F/v41wv83j5\n9KP7tw/lzfJuBkhr4039TXHkTMwlrUWvCl5mR7k1bozHUQa0BMagrNLp2Q9Z2F7S\nom9Tnx/N2ZhyrJj47LDbywSYIiwD7KVS+P5JWXdfNqS12r6A9X3ewMYFBEo6xgSO\ntQz0+rpTqKiq8CJBOe85XlgoG4StguaYazMEJPehKYkqTMv1BDYwmdHK23NREZZ/\ni3FZkOPWRPhPge/oDA2N0t9tTKZqCxTmvsJb1ByR7+H1pd9uFJeNYOqLL9HYJnan\nIn7/df2DsDLGHiZfpuLvxUa3Mwe9TXdNOg1DcdD7gBSXWtK8Uw==\n-----END CERTIFICATE-----\n";

// Test 3072 CA Cert
var testYessignClass6_3072 = "-----BEGIN CERTIFICATE-----\nMIIGVzCCBL+gAwIBAgIIPDss5TxJv5QwDQYJKoZIhvcNAQELBQAwaTELMAkGA1UE\nBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRp\nb24gQXV0aG9yaXR5IENlbnRyYWwxGzAZBgNVBAMMEktpc2EgVGVzdCBSb290Q0Eg\nODAeFw0yNjAzMTgwNzExMTVaFw0zNjAzMTgwNzExMTVaMFcxCzAJBgNVBAYTAktS\nMRAwDgYDVQQKDAd5ZXNzaWduMRUwEwYDVQQLDAxBY2NyZWRpdGVkQ0ExHzAdBgNV\nBAMMFnllc3NpZ25DQS1UZXN0IENsYXNzIDYwggGiMA0GCSqGSIb3DQEBAQUAA4IB\njwAwggGKAoIBgQCsoMKeNqHC6fl7ua0545Y6ZUp7bRv/yX3TCtFZUKJjkNBI+YxY\nqTu96BS48wRCzXJSCI3agXu6ttHzZPxsN1l2jNHHES8jZz9BG5xz67IcDmdZwqbx\n8uiCu72SMOp+NRWqNX4LCsGW3/7fuUb0ouKyWWbwFsn7pxNfYY/A8pEenkLqHrKk\njhKhp05+3AzQltixWSnTVJxJPUCQjW44mw4ulhlzuhIvom1KNVYH7s2K0F4/KbKG\n1lkzh+V2BBaOBUFtic20Ezc2uBdmL3IxQi2XeAl1mBZMexi3WJ/M2gH5cvV/zDEn\n+i+gaz5IIKeKElmNmBp54XrPkkltquAX+68aeNczqknKbfcYpNGuFkCXzTBSEsv+\n3rjHme0YnBWSftGvcu+WUZ243BptXPGWVesmVBUP4YWzc7jFBssKGAZ06af8QFAZ\nWo38+et96+UCj29qhDNcvWCLcq5baLOwoqcaxthXWgg84nP33o5SDJWdo62I3r/W\nCjWT2cfcnXnj9McCAwEAAaOCAhMwggIPMIGaBgNVHSMEgZIwgY+AFKLiw03lDIGR\n/r/DtlfyxbVYCDnvoW2kazBpMQswCQYDVQQGEwJLUjENMAsGA1UECgwES0lTQTEu\nMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgQ2VudHJhbDEb\nMBkGA1UEAwwSS2lzYSBUZXN0IFJvb3RDQSA4gghMcRKk0+cV7jAdBgNVHQ4EFgQU\nI0cvew8KK0r+5mVKiY7rvtlDALUwDgYDVR0PAQH/BAQDAgEGMHwGA1UdIAEB/wRy\nMHAwbgYEVR0gADBmMDAGCCsGAQUFBwIBFiRodHRwOi8vd3d3LnJvb3RjYS5vci5r\nci9yY2EvY3BzLmh0bWwwMgYIKwYBBQUHAgIwJh4kx3QAIMd4yZ3BHLKUACDC3NXY\nxqkAIMd4yZ3BHMeFssiy5AAuMCsGA1UdEQQkMCKgIAYJKoMajJpECgEBoBMwEQwP\n6riI7Jy16rKw7KCc7JuQMBIGA1UdEwEB/wQIMAYBAf8CAQAwDwYDVR0kAQH/BAUw\nA4ABADBxBgNVHR8EajBoMGagZKBihmBsZGFwOi8vc25vb3B5Lnllc3NpZ24ub3Iu\na3I6NjAyMC9jbj1LSVNBLVRFU1QtQVJMOCxvdT1ST09UQ0Esbz1LSVNBLGM9S1I/\nYXV0aG9yaXR5UmV2b2NhdGlvbkxpc3QwDQYJKoZIhvcNAQELBQADggGBAKx3G5ag\n72qW42jgYdrMotokMcfVwgXqXE6+kwSVeblHFZf5OiRNCnWnRJY609Me5+zaJz9T\ns4jc4oUw90Vklek4fVFkWaTCxEi5bg6L63/9HyWnSWCWUgem8g70Rhy5zB2s5lxT\nVezRYjaLK0uSh+XlDR8NxWPsSJlSphgKNWCApWLnW67JUI6XPXTanTqaqqF/vGxX\nFKMDXHI3tcA/aenxH+J7b2SYXt/hh55xbjSUl1fTXNzrmakF890t8SZ6FHdDL6Ms\ndGv3HGkaPpaMOd70pLd5GjjPzy1Ut82Yr1MoJ6FEZP1/cf68eyKPhf9LWD+hWJlW\nSekc4h6bsDV7IL2rlLLHlhWOGTV8qjysCVwCUl3jBeTQwR/huGuw/U7INg3kcyKo\nEpyCril8bjtz6Stm201BjW2+fLcmd9CE6s1wUYPNwsaN5EMz3F5Hel3r+LE25h3Z\n2KVFgWlaw9NbNOyhDxDdbweatOoFO4a7wfhQYdbb/gv3n/Q+j7oon86D9w==\n-----END CERTIFICATE-----\n";
var testCrossCertCA7_3072 = "-----BEGIN CERTIFICATE-----\nMIIGhTCCBO2gAwIBAgIINmEplBK9y5EwDQYJKoZIhvcNAQELBQAwaTELMAkGA1UE\nBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRp\nb24gQXV0aG9yaXR5IENlbnRyYWwxGzAZBgNVBAMMEktpc2EgVGVzdCBSb290Q0Eg\nODAeFw0yNjAzMTgwNzA4MTFaFw0zNjAzMTgwNzA4MTFaMFMxCzAJBgNVBAYTAktS\nMRIwEAYDVQQKDAlDcm9zc0NlcnQxFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEZMBcG\nA1UEAwwQQ3Jvc3NDZXJ0VGVzdENBNzCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC\nAYoCggGBALIARtZOC1i7qI1XeMShBDMQiXzSlAyZs7vvYIruLUZl+hLYiMXYbSR6\nytbKShGhs7w+uAhw4VlpkRRKOVGAKAHOhrJoYSSb4DzAnTLd9RsD4y6IirFlTsXN\nBraA6eZQMSgOQwG+CdufthKlSxIj+HkGt8pIP8SWHUjHSF9tKZNX3znto59Mdh2f\n0auiUXkBJnSqPgXvFkEG2/sDtFMjAMZeegEGnfPjzdFBsdFIBYO8eiPtsCeSooC3\nHr/Hk/LkG1cP9BqE0PQYPQss14ZloYptqqkS2rkeb7KcjwPq+ZLhpA99UCCOgWlc\nG4kL4RjqvR5Ma13p4kdfuRyWyJFk6iVUA83HqGYEqtnBAl0OVo13QSM7wS1dDIYC\nDA8KD/Kq6NJEQbYDs2r93oBKonHJR0eRIy8ynzd8Olji+cq5OssBR8Vjb79ktQ3g\nS2IacMi0ppqwK/FDaiGefr83+wclvfuxHdfOY0GWp6T0V6dF2UXDGdNfkqnUqFu4\nbxSV8cx9VQIDAQABo4ICRTCCAkEwgZoGA1UdIwSBkjCBj4AUouLDTeUMgZH+v8O2\nV/LFtVgIOe+hbaRrMGkxCzAJBgNVBAYTAktSMQ0wCwYDVQQKDARLSVNBMS4wLAYD\nVQQLDCVLb3JlYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50cmFsMRswGQYD\nVQQDDBJLaXNhIFRlc3QgUm9vdENBIDiCCExxEqTT5xXuMB0GA1UdDgQWBBRLKyod\n8pPsL6mrkLq59wAirOnjxTAOBgNVHQ8BAf8EBAMCAQYwfAYDVR0gAQH/BHIwcDBu\nBgRVHSAAMGYwMAYIKwYBBQUHAgEWJGh0dHA6Ly93d3cucm9vdGNhLm9yLmtyL3Jj\nYS9jcHMuaHRtbDAyBggrBgEFBQcCAjAmHiTHdAAgx3jJncEcspQAIMLc1djGqQAg\nx3jJncEcx4WyyLLkAC4wMwYDVR0RBCwwKqAoBgkqgxqMmkQKAQGgGzAZDBftlZzq\nta3soITsnpDsnbjspp0o7KO8KTASBgNVHRMBAf8ECDAGAQH/AgEAMA8GA1UdJAEB\n/wQFMAOAAQAwgZoGA1UdHwSBkjCBjzCBjKCBiaCBhoaBg2xkYXA6Ly90ZXN0ZGly\nLmNyb3NzY2VydC5jb206Mzg5L2NuPUtpc2EtVGVzdC1Sb290Q0EtOCxvdT1Lb3Jl\nYS1DZXJ0aWZpY2F0aW9uLUF1dGhvcml0eS1DZW50cmFsLG89S0lTQSxjPUtSP2F1\ndGhvcml0eVJldm9jYXRpb25MaXN0MA0GCSqGSIb3DQEBCwUAA4IBgQBqlU5vtto/\nOee/oQUvkOo9wYLgh1t0kmj+GoH18apgSgknUNZy2Mi45F+NcscbFkkuafLNP/NS\nMTRMf890rLG9b8n9zO1UICMpWCvdkINQkPtFA1MHByv+sfpcAZdxUdQQLlxBOjgi\nd7HIzNel1qpgUPQ1EWLiRha44bB4LgeX+ESu4Oq2JxTDj2thElRjdwUHUXawIM4x\n4zHntVhomHRHHEfxZ+rKHRdFxHykMrFalzDRnCEOB6xOwCxOMBgLLzWHsfx4FAA1\ne9Zm6FCzUopIynIc072YNwUMLrnyGvs2JjBprjMGxoYOnaV8AbJrPURLZfITHDTn\notYu+n8Yfe3XlthKJmKjV06WqIyph/jBkw2+qE3UDBjGSeJwkryOm+6nN7JsWjvz\n5+r3jYBAlslwedzQi1pvg6Oc5jWcLbDcuGwtq1wByMqj4/8sUlyuR2jJRwUF95GX\nNrzZxRlPO42VaRFLFBtLaP59heKGfBVDeDkdO7xIAWD0WPp8BXieiFA=\n-----END CERTIFICATE-----\n";
var testSignGateFTCA08_3072 = "-----BEGIN CERTIFICATE-----\nMIIGdzCCBN+gAwIBAgIIQqZSjG0kwekwDQYJKoZIhvcNAQELBQAwaTELMAkGA1UE\nBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRp\nb24gQXV0aG9yaXR5IENlbnRyYWwxGzAZBgNVBAMMEktpc2EgVGVzdCBSb290Q0Eg\nODAeFw0yNjAzMzAwMTM5MTZaFw0zNjAzMzAwMTM5MTZaME0xCzAJBgNVBAYTAktS\nMQ0wCwYDVQQKDARLSUNBMRUwEwYDVQQLDAxBY2NyZWRpdGVkQ0ExGDAWBgNVBAMM\nD3NpZ25HQVRFIEZUQ0EwODCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGB\nAKayr44Vc62GH1DOxVAflo7sxg/u7RdN9pqHc3TNGpUbd0is8Cy74SM065dC/4D/\nHHMRlHZy+m/fDqckmLFBs8T7VY15hoq/Njod0AFEcTk6vA8oGdVJqXiWcd/4He1O\nedVP2R7neaEf30q77h6hwrDPn2RwANHtWJQ1tuQOl4pCjrxFc53DPl3DAk1af+PN\nqjlL2i9AQl4rX7tZhF6I+ETYdiV9/9EbsK1tw+nwUqUxr40+XUYaNZ2u16MUPKtg\nusPUd7odgE9cDW1v9Jd7tRjfUJ1XifNsn4JCwgUpF7aelh1462fb07AoYQ6XDwEn\n/iq1pBqZVTfwZQacyemgQy/ZwGvLdx/rbsXSZT8wCIsDlZL7R7DfpvcP3nlg+vag\nScn2duTEsep2/WTPVZ/ztDVmh9+2Q9AnZ1TrDEeF2jneD7foj5tgYv2xoyjDte5G\n0HnpIDlqwX+ALFlmsRRgJ55NSNocPHGd/xivSITJI33YpViJZTuFb/sSRZ82Q9px\npwIDAQABo4ICPTCCAjkwgZoGA1UdIwSBkjCBj4AUouLDTeUMgZH+v8O2V/LFtVgI\nOe+hbaRrMGkxCzAJBgNVBAYTAktSMQ0wCwYDVQQKDARLSVNBMS4wLAYDVQQLDCVL\nb3JlYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50cmFsMRswGQYDVQQDDBJL\naXNhIFRlc3QgUm9vdENBIDiCCExxEqTT5xXuMB0GA1UdDgQWBBQAhGVbeyOBPzbd\n76ZVqVxZFNBMpTAOBgNVHQ8BAf8EBAMCAQYwfAYDVR0gAQH/BHIwcDBuBgRVHSAA\nMGYwMAYIKwYBBQUHAgEWJGh0dHA6Ly93d3cucm9vdGNhLm9yLmtyL3JjYS9jcHMu\naHRtbDAyBggrBgEFBQcCAjAmHiTHdAAgx3jJncEcspQAIMLc1djGqQAgx3jJncEc\nx4WyyLLkAC4wLgYDVR0RBCcwJaAjBgkqgxqMmkQKAQGgFjAUDBLtlZzqta3soJXr\ns7Tsnbjspp0wEgYDVR0TAQH/BAgwBgEB/wIBADAPBgNVHSQBAf8EBTADgAEAMIGX\nBgNVHR8EgY8wgYwwgYmggYaggYOGgYBsZGFwOi8vY2F0ZXN0LnNpZ25nYXRlLmNv\nbTozODkvY249S0lTQSBUZXN0Um9vdENBIDgsb3U9S29yZWEgQ2VydGlmaWNhdGlv\nbiBBdXRob3JpdHkgQ2VudHJhbCxvPUtJU0EsYz1LUj9hdXRob3JpdHlSZXZvY2F0\naW9uTGlzdDANBgkqhkiG9w0BAQsFAAOCAYEAkT16+gg5fTBHrWDAAeQLXib/jalL\nugRP/JaDWBTyG2qT2FpHXJr+6hKEy9ipBCc5n6OSKyRFU1iAYUPrPAeoi0TzthnB\nqwshAieEbEqteZLulr581XVsP0HOBJIDvAWIJLw+aNt/6Wdn3vb7lWTHHAASpVus\n62SZNesmOhh1T9JNxxaX6Vjazp9fjYBs9vulUkC0bOzjX4JV6lDMrBn2jPxWgc5g\n79Y4D/MYOrtO50uD7Gslpik24hhkJ6t3D4hRj8bM0m2PLFD8NY0hk4DI3lPqoxnW\njPIk81kcU/BZVqHP16ReSTDnNdBc5xgMGCYmdz88/OHi1kyv48S5s6XTit+8qNKl\nvBR9mohEu5+dL0IhnR7FHnWKMJ317KuPxpPqA/jEdUrp6FLj56tntSp+HWHm9B6F\nZpttmeZewtdGmGJPHVpFUkSzrkT7YxH0hV8J0SUdVuXdzU71m/xvLT/CoWZz8RKV\nlOecSjGQWNniKXWxFyQcmRTU22tq4cunZXIv\n-----END CERTIFICATE-----\n";
var testSignKoreaCA7_3072 = "-----BEGIN CERTIFICATE-----\nMIIGUTCCBLmgAwIBAgIIYPHsQi5S38EwDQYJKoZIhvcNAQELBQAwaTELMAkGA1UE\nBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRp\nb24gQXV0aG9yaXR5IENlbnRyYWwxGzAZBgNVBAMMEktpc2EgVGVzdCBSb290Q0Eg\nODAeFw0yNjAzMTgwNjU5NTZaFw0zNjAzMTgwNjU5NTZaMFUxCzAJBgNVBAYTAktS\nMRIwEAYDVQQKDAlTaWduS29yZWExFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEbMBkG\nA1UEAwwSU2lnbktvcmVhIFRlc3QgQ0E3MIIBojANBgkqhkiG9w0BAQEFAAOCAY8A\nMIIBigKCAYEAqfKQzsaU+e1wGdglKGSuDLZ990YkYZlhvOc13E+VT6oBCdigYPsR\nCOyRGZM5NhKokRrow3RMg0iqNTfu/st9ZjDQ0PjxiGH+U349wvf7HtMcW3W0G2wC\ng7nMu3Up1XuEcng0HJKeplJyqRbu8vH3cHLa0BBD7PvAcy6PryTNcwPFCUGLjVbx\nmkseRKWveRu4n1DN9VzmMioZpdNU/rrg9jDseOOLmLr3wUi3RR7naSlIwk4RYS4j\n15EEKt63t+LZ1ULO2r4N1Tk6wKGqcTiDk5D77KEuUQhdJ8Pqli97XHUwauO2SrfR\nFy/CbVZcVSBpQGPvVLdFCi7Bf95Q4Sk81AEQp3o1Q1uheeMc47b5iJBsNUtSqgS7\ng5c5HhdSMnJTyMicRfUXjZvBSCw/iQpo1zU3sWR9zW/JBLeR7wzcIgdXCbV5x1+O\nf7BYXezsRDfmIeSwtw0HSoYVaBXjRfZkFpb97W+FcFd0LaS66ZN34olTBIpw3oPv\nF4ieHx4u0gyfAgMBAAGjggIPMIICCzCBmgYDVR0jBIGSMIGPgBSi4sNN5QyBkf6/\nw7ZX8sW1WAg576FtpGswaTELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAs\nBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0aG9yaXR5IENlbnRyYWwxGzAZ\nBgNVBAMMEktpc2EgVGVzdCBSb290Q0EgOIIITHESpNPnFe4wHQYDVR0OBBYEFNoB\nhD/fXfwOLg14x8oPI6eusrlzMA4GA1UdDwEB/wQEAwIBBjB8BgNVHSABAf8EcjBw\nMG4GBFUdIAAwZjAwBggrBgEFBQcCARYkaHR0cDovL3d3dy5yb290Y2Eub3Iua3Iv\ncmNhL2Nwcy5odG1sMDIGCCsGAQUFBwICMCYeJMd0ACDHeMmdwRyylAAgwtzV2Map\nACDHeMmdwRzHhbLIsuQALjAqBgNVHREEIzAhoB8GCSqDGoyaRAoBAaASMBAMDijs\no7wp7L2U7Iqk7L2kMBIGA1UdEwEB/wQIMAYBAf8CAQAwDwYDVR0kAQH/BAUwA4AB\nADBuBgNVHR8EZzBlMGOgYaBfhl1sZGFwOi8vMjExLjE3NS44MS4xMDI6Njg5L2Nu\nPVRFU1QtUk9PVC1SU0EtQ1JMOCxvdT1ST09UQ0Esbz1LSVNBLGM9S1I/YXV0aG9y\naXR5UmV2b2NhdGlvbkxpc3QwDQYJKoZIhvcNAQELBQADggGBAEoiGzYjNgPhEJaf\nDkkP0cKXgIODMIXYsw1LaoNJVA4i+Zc8dF828Q70UkWK6NQXmpmF0zqW2T9Hi+sT\nSZwZhyp3T7tufzmItgGc4WvvzazJ8ar1WUtrY1Vxj0jWDRQ/3k3EC84lrP2yUfa8\nTr4GFKtKGqcKsav9F+XWsDAWX4evbjLjTNa+HSep1wOBqdfrwuNceAo88HOkSdjP\nehjZh35N6pTd4pGcdSFIguNFQ9yafF4s+k102WMimO3FoDt65cU+IuCLxjY4WomK\n9AEWznTSjz9c79ILbt3upRTng+EH2KWFmp1dR312NTE8A7dxXNpO0QpOGU4sh1zV\nZA93vWpavyi6ieEqPDjZqSnojpyTjXoGRqRgxObZC1EBVdWopOKgdBftloJmCsCb\nwFoNtVh+k2a+chk6ASPxIgRxoJrlZzdvJkXUM3+uNGMputmtHWYPMF9Mt03O9zTZ\nPUS9s279T2h/0p6fdh30fcWpCl9BcN6nixvBkPQ9Oy5M5Ru2+A==\n-----END CERTIFICATE-----\n";
var testTradeSignCA2026_3072 = "-----BEGIN CERTIFICATE-----\nMIIGjzCCBPegAwIBAgIIU1qhB0fV6towDQYJKoZIhvcNAQELBQAwaTELMAkGA1UE\nBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRp\nb24gQXV0aG9yaXR5IENlbnRyYWwxGzAZBgNVBAMMEktpc2EgVGVzdCBSb290Q0Eg\nODAeFw0yNjAzMTgwNjUyNDlaFw0zNjAzMTgwNjUyNDlaMFYxCzAJBgNVBAYTAktS\nMRIwEAYDVQQKDAlUcmFkZVNpZ24xFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEcMBoG\nA1UEAwwTVHJhZGVTaWduQ0EyMDI2VGVzdDCCAaIwDQYJKoZIhvcNAQEBBQADggGP\nADCCAYoCggGBANIAOJe9heTRkqTIYu0jE+PQNYh1sydioop/LufqJGizZ7/Dgi3L\nyidQyN6FUOrlM7P85j6W12LJEfzjkwYwE38qLXgpK/+Eks/t0+UhYRn9z+Z6fPZG\n8g39AeqSsbuJ9//CUYGiCQ6j63njjcFDh4XYhlcuWFRU8jQx8KL02mPqBv5AR1c+\n0bcdge7uUzhJEBeikogqiCzHlGkI3c9H9YssDLBZeeaCb+QwskUaBMrLv6haDVxk\nl+Lg9Kr7LFB4riHYVQTQ94zSyPI5u5O+tAo11KJ7nxPCwi0M5cJWi6ELnJTahnqH\nrJsRgIxzoNBTRudNek9ozY+Buse8/zC6m566TvoswbNzCX2/tjBoNG/DdVCToJij\niTXeg3YcNBVFLuU6eG5Hz0sp2yPGoqxFv1P1hM0NI360paqatZ7qEeN9XAmYEDnN\nOV37zCWK/Wf4HxgQFrTpn7DW3o2KSQCaN6dw8PJNTZfwSaIy9TEkhQdV6vCisrBh\nnKx8Ez96fkQgyQIDAQABo4ICTDCCAkgwgZoGA1UdIwSBkjCBj4AUouLDTeUMgZH+\nv8O2V/LFtVgIOe+hbaRrMGkxCzAJBgNVBAYTAktSMQ0wCwYDVQQKDARLSVNBMS4w\nLAYDVQQLDCVLb3JlYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50cmFsMRsw\nGQYDVQQDDBJLaXNhIFRlc3QgUm9vdENBIDiCCExxEqTT5xXuMB0GA1UdDgQWBBRu\nLQF68WJCUnD9R7AXZhwIoXxbKjAOBgNVHQ8BAf8EBAMCAQYwfAYDVR0gAQH/BHIw\ncDBuBgRVHSAAMGYwMAYIKwYBBQUHAgEWJGh0dHA6Ly93d3cucm9vdGNhLm9yLmty\nL3JjYS9jcHMuaHRtbDAyBggrBgEFBQcCAjAmHiTHdAAgx3jJncEcspQAIMLc1djG\nqQAgx3jJncEcx4WyyLLkAC4wOQYDVR0RBDIwMKAuBgkqgxqMmkQKAQGgITAfDB0o\n7KO8Ke2VnOq1reustOyXreygleuztO2GteyLoDASBgNVHRMBAf8ECDAGAQH/AgEA\nMA8GA1UdJAEB/wQFMAOAAQAwgZsGA1UdHwSBkzCBkDCBjaCBiqCBh4aBhGxkYXA6\nLy90ZXN0bGRhcC50cmFkZXNpZ24ubmV0OjM4OS9DTj1LaXNhLVRlc3QtUm9vdENB\nLTgsT1U9S29yZWEtQ2VydGlmaWNhdGlvbi1BdXRob3JpdHktQ2VudHJhbCxPPUtJ\nU0EsQz1LUj9hdXRob3JpdHlSZXZvY2F0aW9uTGlzdDANBgkqhkiG9w0BAQsFAAOC\nAYEAFoUU8eTRKf0OGhDhpkdNrSrRitjN5SauPRLSMJT168Nc46ZGyuGH7Ylw9Aa0\nfEw82A/GjBm72kOfJR1nOPT+5W5MNQTmmFCaknN37CsoJsoBoUmfn5m8AscGUAOw\nSKBC3ktcnYGKoNM/WRNwdCdqdOo/ktC13F2mmEEtoD5Q+b5Su9YsDz6VMYkP8gMR\nwdCDZs+ElQOX5TkcKI8yO+LVOb4HC4prQmiuR5ERlGeniWwaN45Qu1aE6xjqWCcz\nO45ZCzVD9bf8GS3SlXuEkdVB8BTSbPj0ktwNpoBElTSQXeUuPuVHFa9oh6kiGayp\nwVznlRUxx042tyoaWZUF9BfO26wNmdI06zFtscFM/wD2apu9eWgZ8l/Tj2nH55Du\nUvn9JKHMeLxWpwERm7aXTJmc6tKNbktGzOikO9+9GwmC+Xx+mEgChnU72Bgg6NCr\nRVKVKMgqMne7aYxfc/i54ofaOrDXuYJwQRyhsvY6PGuwHzmg9mkqNDS57NW+x/Jr\nMnHe\n-----END CERTIFICATE-----\n";

// Real-CA 인증서 목록 (2048)
var real2048CACert = "";
real2048CACert += initech_ca_internal;
real2048CACert += initech_ca;
real2048CACert += realInitech_ca;
real2048CACert += realYessignClass3_2048;
real2048CACert += realCrossCertCA4;
real2048CACert += realSignGate_CA6;
real2048CACert += realSignKorea_CA4;
real2048CACert += realTradeSignCA4;

// Real-CA 인증서 목록 (3072)
var real3072CACert = "";
real3072CACert += realYessignClass4_3072;
real3072CACert += realCrossCertCA5_3072;
real3072CACert += realSignKoreaCA5_3072;
real3072CACert += realSignGATECA7_3072;
real3072CACert += realTradeSignCA5_3072;

// Test-CA 인증서 목록 (2048)
var test2048CACert = "";
test2048CACert += initech_ca_internal;
test2048CACert += initech_ca;
test2048CACert += testYessignClass5_2048;
test2048CACert += testCrossCertCA5;
test2048CACert += testSignGateFTCA6;
test2048CACert += testSignGateFTCA7;
test2048CACert += testTradeSign_08;
test2048CACert += testSignKoreaCA5;
test2048CACert += testSignKoreaCA6;

// Test-CA 인증서 목록 (3072)
var test3072CACert = "";
test3072CACert += testYessignClass6_3072;
test3072CACert += testCrossCertCA7_3072;
test3072CACert += testSignGateFTCA08_3072;
test3072CACert += testSignKoreaCA7_3072;
test3072CACert += testTradeSignCA2026_3072;

// FilterCert Real 인증서 IssuerDN
var realIssuerYessignCAClass3 = "IssuerDN=CN=yessignCA Class 3,OU=AccreditedCA,O=yessign,C=kr";
var realIssuerCrossCertCA4 = "IssuerDN=CN=CrossCertCA4,OU=AccreditedCA,O=CrossCert,C=KR";
var realIssuerSignGATECA6 = "IssuerDN=CN=signGATE CA6,OU=AccreditedCA,O=KICA,C=KR";
var realIssuerSignKoreaCA4 = "IssuerDN=CN=SignKorea CA4,OU=AccreditedCA,O=SignKorea,C=KR";
var realIssuerTradeSignCA4 = "IssuerDN=CN=TradeSignCA4,OU=AccreditedCA,O=TradeSign,C=KR";

// 3072 Real CA 인증서 IssuerDN
var realIssuerCrossCertCA5 = "IssuerDN=CN=CrossCertCA5,OU=AccreditedCA,O=CrossCert,C=KR";
var realIssuerSignGATECA7 = "IssuerDN=CN=signGATE CA7,OU=AccreditedCA,O=KICA,C=KR";
var realIssuerSignKoreaCA5 = "IssuerDN=CN=SignKorea CA5,OU=AccreditedCA,O=SignKorea,C=KR";
var realIssuerTradeSignCA5 = "IssuerDN=CN=TradeSignCA5,OU=AccreditedCA,O=TradeSign,C=KR";
var realIssuerYessignCAClass4 = "IssuerDN=CN=yessignCA Class 4,OU=AccreditedCA,O=yessign,C=KR";

// FilterCert Test 인증서 IssuerDN
var testIssuerCrossCertCA5 = "IssuerDN=CN=CrossCertTestCA5,OU=AccreditedCA,O=CrossCert,C=KR";
var testIssuerSignGateFTCA6 = "IssuerDN=CN=signGATE FTCA06,OU=AccreditedCA,O=KICA,C=KR";
var testIssuerSignGateFTCA7 = "IssuerDN=CN=signGATE FTCA07,OU=AccreditedCA,O=KICA,C=KR";
var testIssuerSignKoreaCA5 = "IssuerDN=CN=SignKorea Test CA5,OU=AccreditedCA,O=SignKorea,C=KR";
var testIssuerSignKoreaCA6 = "IssuerDN=CN=SignKorea Test CA6,OU=AccreditedCA,O=SignKorea,C=KR";
var testIssuerTradeSign = "IssuerDN=CN=TradeSignCA2018Test,OU=AccreditedCA,O=TradeSign,C=KR";
var testYessignClass5 = "IssuerDN=CN=yessignCA-Test Class 5,OU=AccreditedCA,O=yessign,C=kr";

// 3072 Test CA 인증서 IssuerDN
var testIssuerCrossCertCA7 = "IssuerDN=CN=CrossCertTestCA7,OU=AccreditedCA,O=CrossCert,C=KR";
var testIssuerSignGATEFTCA8 = "IssuerDN=CN=signGATE FTCA08,OU=AccreditedCA,O=KICA,C=KR";
var testIssuerSignKoreaCA7 = "IssuerDN=CN=SignKorea Test CA7,OU=AccreditedCA,O=SignKorea,C=KR";
var testIssuerTradeSignCA2026 = "IssuerDN=CN=TradeSignCA2026Test,OU=AccreditedCA,O=TradeSign,C=KR";
var testIssuerYessignClass6 = "IssuerDN=CN=yessignCA-Test Class 6,OU=AccreditedCA,O=yessign,C=KR";

var pipe = "|";

var realIssuerDN = "";
realIssuerDN += realIssuerYessignCAClass3 + pipe;
realIssuerDN += realIssuerCrossCertCA4 + pipe;
realIssuerDN += realIssuerSignGATECA6 + pipe;
realIssuerDN += realIssuerSignKoreaCA4 + pipe;
realIssuerDN += realIssuerTradeSignCA4 + pipe;
realIssuerDN += realIssuerCrossCertCA5 + pipe;
realIssuerDN += realIssuerSignGATECA7 + pipe;
realIssuerDN += realIssuerSignKoreaCA5 + pipe;
realIssuerDN += realIssuerTradeSignCA5 + pipe;
realIssuerDN += realIssuerYessignCAClass4;

var testIssuerDN = "";
testIssuerDN += testIssuerCrossCertCA5 + pipe;
testIssuerDN += testIssuerSignGateFTCA6 + pipe;
testIssuerDN += testIssuerSignGateFTCA7 + pipe;
testIssuerDN += testIssuerSignKoreaCA5 + pipe;
testIssuerDN += testIssuerSignKoreaCA6 + pipe;
testIssuerDN += testIssuerTradeSign + pipe;
testIssuerDN += testYessignClass5 + pipe;
testIssuerDN += testIssuerCrossCertCA7 + pipe;
testIssuerDN += testIssuerSignGATEFTCA8 + pipe;
testIssuerDN += testIssuerSignKoreaCA7 + pipe;
testIssuerDN += testIssuerTradeSignCA2026 + pipe;
testIssuerDN += testIssuerYessignClass6;

var realCA = {
	//금결원
	'NPKI': {
		realYessignClass3: realYessignClass3_2048,
		realCrossCert4: realCrossCertCA4,
		realSignGate6: realSignGate_CA6,
		realSignKorea4: realSignKorea_CA4,
		realTradeSign4: realTradeSignCA4,
		realYessignClass4: realYessignClass4_3072,
		realCrossCert5: realCrossCertCA5_3072,
		realSignGate7: realSignGATECA7_3072,
		realSignKorea5: realSignKoreaCA5_3072,
		realTradeSign5: realTradeSignCA5_3072
	},

	//행자부
	'GPKI': {
	},

	// 국방부
	'MPKI': {
	},

	// 교육부
	'EPKI': {
	},
	//
	'PPKI': {
	}
};


var testCA = {
	// 금결원
	'NPKI': {
		testYessignClass5: testYessignClass5_2048,
		testCrossCert5: testCrossCertCA5,
		testSignGate6: testSignGateFTCA6,
		testSignGate7: testSignGateFTCA7,
		testTradeSign: testTradeSign_08,
		testSignKorea5: testSignKoreaCA5,
		testSignKorea6: testSignKoreaCA6,
		testYessignClass5: testYessignClass6_3072, 
		tesstCrossCert7: testCrossCertCA7_3072,
		testSignGate8: testSignGateFTCA08_3072,
		testSignKorea7: testSignKoreaCA7_3072,
		testTradeSign2026: testTradeSignCA2026_3072
	},
	//행자부
	'GPKI': {
	},

	// 국방부
	'MPKI': {
	},

	// 교육부
	'EPKI': {
	},
	//
	'PPKI': {
	}
};


var CACert;				// CA 인증서 목록
var IssuerDNFilter;		// IssuerDN 필터 목록


// 고객사 개발 HOST 인 경우
if (window.location.host == CW_DEV_HOST) {
	//개발 서버 (Real + Test)
	CACert = real2048CACert + test2048CACert + real3072CACert + test3072CACert;
	IssuerDNFilter = realIssuerDN + pipe + testIssuerDN;
	// 테스트 CA
	YessignCAIP = CAIPInfo.test.yessign;
	CrossCertCAIP = CAIPInfo.test.crosscert;
	SignKoreaCAIP = CAIPInfo.test.signkorea;
	SignGateCAIP = CAIPInfo.test.signgate;
	INIPassCAIP = CAIPInfo.test.inipass;
	InitechCAIP = CAIPInfo.test.initech;

// 고객사 테스트 HOST 인 경우
} else if (window.location.host == CW_TEST_HOST) {
	//테스트 서버 (Real + Test)
	CACert = real2048CACert + test2048CACert + real3072CACert + test3072CACert;
	IssuerDNFilter = realIssuerDN + testIssuerDN;
	// 테스트 CA
	YessignCAIP = CAIPInfo.test.yessign;
	CrossCertCAIP = CAIPInfo.test.crosscert;
	SignKoreaCAIP = CAIPInfo.test.signkorea;
	SignGateCAIP = CAIPInfo.test.signgate;
	INIPassCAIP = CAIPInfo.test.inipass;
	InitechCAIP = CAIPInfo.test.initech;

// 고객사 운영 HOST 인 경우
} else if (window.location.host == CW_REAL_HOST) {
	// 운영 서버 (Real)
	CACert = real2048CACert + real3072CACert;
	IssuerDNFilter = realIssuerDN;
	// 리얼 CA
	YessignCAIP = CAIPInfo.real.yessign;
	CrossCertCAIP = CAIPInfo.real.crosscert;
	SignKoreaCAIP = CAIPInfo.real.signkorea;
	SignGateCAIP = CAIPInfo.real.signgate;
	INIPassCAIP = CAIPInfo.real.inipass;
	InitechCAIP = CAIPInfo.real.initech;

// 고객사 기타 HOST 인 경우
} else {
	//기타 (Real + Test)
	CACert = real2048CACert + test2048CACert + real3072CACert + test3072CACert;
	IssuerDNFilter = realIssuerDN + testIssuerDN;
	// 리얼 CA
	YessignCAIP = CAIPInfo.real.yessign;
	CrossCertCAIP = CAIPInfo.real.crosscert;
	SignKoreaCAIP = CAIPInfo.real.signkorea;
	SignGateCAIP = CAIPInfo.real.signgate;
	INIPassCAIP = CAIPInfo.real.inipass;
	InitechCAIP = CAIPInfo.test.initech;
}

/************************************************************
 * @brief		CrossWeb EX 클라이언트 초기화 설정정보
 ************************************************************/
var CROSSWEBEX_CS_POLICY = {

	// 개별 API를 이용하여 설정하는 값
	logoPath: LogoURL,								// 정책 설정 - 인증서 선택창의 이미지 변경
	disableInvalidCert: false,						// 정책 설정 - 만료된 인증서 표시여부 (true: 만료된 인증서 표시하지 않음 / false: 만료된 인증서 표시)
	loadCACert: CACert,							    // 정책 설정 - CA 인증서 로드 (CA 인증서 필터링)
	loadCert: SCert,								// 정책 설정 - 서버 인증서 로드
	CACHE_URL: "localhost",							// 정책 설정 - 인증서 캐쉬 공통 도메인 설정
	UseCertMode: 1,								    // 정책 설정 - 공인인증서 고도화 여부 default (0)
	// PcInfo: {										// 정책 설정 - PC 정보 취득
	// 	Use: false,									// 정책 설정 - PC 정보 취득 - 사용 유무 (true: 사용 / false: 사용안함)
	// 	SiteName: "NONGHYUP",						// 정책 설정 - PC 정보 취득 - 사이트 이름 (CITIBANK / HANA / NONGHYUP / SHINHAN)
	// 	PcInfoUse: "2",								// 정책 설정 - PC 정보 취득 - PC 정보 수집시 암호화 여부 (1: 평문 / 2: 암호화)
	// 	ServerIP: "61.37.254.133",					// 정책 설정 - PC 정보 취득 - 서버 IP
	// 	ServerPort: "80",							// 정책 설정 - PC 정보 취득 - 서버 PORT
	// 	RetryCnt: "2",								// 정책 설정 - PC 정보 취득 - 재시도 횟수
	// 	Replace: "1",								// 정책 설정 - PC 정보 취득 - 정보 교체 (0: 정보 교체 안함 / 1: 정보 교체 사용)
	// 	FdsUse: "1"									// 정책 설정 - PC 정보 취득 - FDS 사용  (0: FDS 정보 수집 안함 / 1: FDS 정보 수집 사용)
	// },

	// setPropertyAdd, setPropertyEX를 이용하여 한번에 설정하는 값
	property: {
		URLEncodeConv: "NO",						// 정책 설정 - urlencode를 euc-kr로 변경
		GetExhibitionCertStoreInfo: "TRUE",		    // 정책 설정 - 인증서 제출한 스토리지를 서버로 전달 default (FALSE)
		certmanui_hsm: "yes",						// 정책 설정 - 보안토큰 활성화
		YessignCertPasswordPolicy: "1",			    // 정책 설정 - 비밀변호 체계 강화 설정
		certmanui_topmost: "yes",					// 정책 설정 - 인증서나 제출창을 맨 위로 띄우는 함수
		certmanui_language: "OFF",					// 정책 설정 - 인증서창 언어설정 (KOR, ENG)
		certmanui_SelectCertUIMode: "list",		    // 정책 설정 - 전자서명 내역 표시여부 (list, text, no)
		OldCertNotSafeMsg: "1",					    // 정책 설정 - 1024 bit 인증서 보안경고창 출력여부
		certmanui_showalertbanner: "yes",			// 정책 설정 - 보이스피싱 경고문구 표시
		certmanui_alertbannerurl: TrustBannerURL,	// 정책 설정 - 보이스피싱 경고문구 URL

		// 정책 설정 - 휴대폰 서비스 활성화
		certmanui_phoneServiceList: "infovine|mobisign",

		// Infovine 설정
		// 정책 설정 - Infovine - 모듈 버전
		certmanui_phoneVer: "1,4,1,3",
		// 정책 설정 - Infovine - 정책 설정
		certmanui_phone: "KJBANK|" + window.location.protocol + "//" + window.location.host + "/resource/product/infovine/DownloadList&INITECH|AHNLABST",
		// 정책 설정 - Infovine - 다운로드 URL
		certmanui_phoneURL: window.location.protocol + "//" + window.location.host + "/resource/product/infovine/infovine/download.html",

		// 정책 설정 - 신규 OID가 추가 되는 경우 'OID|한글표시명|영문표시명;' 구조로 입력
		// certmanui_newCertOIDs: "1.2.410.200005.1.1.4|테스트1|test1;1.2.410.200005.1.1.4.8|테스트2|test2;",

		// 가상키보드 설정
		// 정책 설정 - 가상키보드 (업체코드 라온 : lumen)
		// certmanui_screenkeyboardprovider: "lumen",
		// 정책 설정 - url부분은 URLEncoding 하여 입력(경로는 가상키보드 업체에 확인 필요)
		// certmanui_screenkeyboardprovideroption: "url=http://localhost:8080/SW/vender/initech_crt/tk_crt.jsp&width=810&height=340",
		// 정책 설정 - 가상키보드 사용여부(-1 또는 설정 안함 : 사용안함, 버튼보이지 않음 / 0:사용안함, 비활성화 / 1:사용, 사용자가 버튼 클릭시 가상키보드 표시, 물리 키보드 입력가능 / 2: 사용, 사용자가 버튼 클릭시 가상키보드 표시, 입력란을 비활성화 하여 물리키보드 입력 불가능)
		// certmanui_screenkeyboardcheckmode: "1",
		// 정책 설정 - 인증서 발급/재발급/갱신 후 이동식 저장매체에 인증서 추가 저장(YES: 추가저장 함, NO: 추가저장하지 않음)
		PopupSaveCertMsgToMovableMedia: "NO",
		// 정책 설정 - 사설 인증서 발급 키 길이 (키 길이: 1024, 2048)
		SetBitPKCS10CertRequest: "2048",
		IssueSkipOKAlertUI: "no",
		// 정책 설정 - EVID 암호화용 CA 인증서
		EvidCACertPKCS10CertRequest: window.location.protocol + "//" + window.location.host + "/initech/demo/pc/crossweb_ex_web6/cert_center_private/evid_ca_cert.jsp"
	}
};


/************************************************************
 * @brief		CrossWeb EX 인터페이스
 ************************************************************/
IniSafeCrossWebEx = function () {

	/************************************************************
	 * @brief		기본 옵션
	 ************************************************************/
	var baseOption = {
		isHtml5: !GINI_DYNAMIC_LOAD.isUseOnlyCS() && GINI_supportHtml5(),
		urlEnc: true,		// 필수
		iniCache: false,
		viewType: "GRID",	// "GRID", "TEXT", "PAGE", "NONE"
		useOnlyCS: GINI_DYNAMIC_LOAD.isUseOnlyCS()
	};

	/************************************************************
	 * @brief		'name'='value' 형태의 data배열 생성
	 * @param		option.targetFormName
	 * @param		option.targetFieldCss
	 * @retval		'name'='value' 형태의 data배열
	 ************************************************************/
	function makeData(option) {

		if (typeof option !== "object" || typeof option === "undefined")
			return null;

		if (typeof option.targetFormName === "undefined" || typeof option.targetFieldCss === "undefined") {
			if ("undefined" === typeof option.data)
				return null;

			return option.data;
		}

		var targetForm = document.getElementsByName(option.targetFormName)[0];

		if (!targetForm) return;

		var targetElems = targetForm.getElementsByClassName(option.targetFieldCss);
		var postDataArr = [];

		for (var i = 0; i <= targetElems.length - 1; i++) {

			if (targetElems[i].tagName !== "INPUT" && targetElems[i].tagName !== "SELECT") continue;

			if (targetElems[i].tagName === "INPUT" && targetElems[i].type === "file") {
				/*
				 * 파일의 경우 처리 방식이 업무 쪽과 연동되기 때문에  논의 필요
				 * (예) 파일을 읽어들인 후 base64 인코딩한 후, 원문 데이타에 포함
				 */
			} else {
				if (targetElems[i].getAttribute("name")) {
					postDataArr.push(targetElems[i].getAttribute("name") + "=" + targetElems[i].getAttribute("value"));
				}
			}
		}

		if (postDataArr.length > 0) {
			return option.urlEnc ? encodeURIComponent(postDataArr.join('&')) : postDataArr.join('&');
		} else {
			return null;
		}
	}

	/************************************************************
	 * @brief		기본옵션값에 추가된 옵션값을 merge한다.
	 * @param		addOption	추가된 옵션값
	 * @retval		merge 된 옵션값
	 ************************************************************/
	function mergeOption(addOption) {

		var retOption = clone(baseOption);

		for (var prop in addOption) {
			if (addOption.hasOwnProperty(prop)) {
				if ('isHtml5' === prop)
					retOption[prop] = retOption[prop] && addOption[prop];
				else if('langType' === prop){
					//모바일 경우에만 셋팅해준다
					if (INI_getPlatformInfo().Mobile){
						sessionStorage.setItem("lang",addOption[prop]);
					}
					retOption[prop] = addOption[prop];
				}
				else
					retOption[prop] = addOption[prop];
			}
		}

		return retOption;
	}

	/************************************************************
	 * @brief		정책 병합
	 * @param policy				정책
	 * @param overlap				오버랩 정책
	 * @retval						병합된 정책
	 ************************************************************/
	function MergePolicy(policy, overlap) {
		var jsonMerged = {};

		for (var key in policy) {
			jsonMerged[key] = policy[key];
		}

		for (var key in overlap) {
			jsonMerged[key] = overlap[key];
		}

		return jsonMerged;
	}

	/************************************************************
	 * @brief		모듈로드대기(html5, thirdParty)
	 ************************************************************/
	function promiseWaitModuleLoad (option) {
		return new Promise(function (resolve, reject) {
			var waitLoad = function () {
				if (true === GINI_DYNAMIC_LOAD.isCompleted() && true === GINI_DYNAMIC_LOAD.isThirdPartyCompleted()) {
					if (option.readyCallback)
						option.readyCallback();
					resolve();
				} else {
					setTimeout(function () {
						waitLoad();
					}, 100);
				}
			};
			waitLoad();
		});
	};

	/************************************************************
	 * @brief		정책 다운로드
	 ************************************************************/
	function promiseDownloadCertPolicy (option) {
		return new Promise(function (resolve, reject) {
			if (option.isHtml5) {
				// 정책 URL 이 존재하는 경우
				if (option.policy_url) {
					Html5Adaptor.ApplyPolicy(option.policy_url);
				}
				resolve();

			} else {
				// 정책 URL 이 존재하는 경우
				if (option.policy_url) {
					CROSSWEBEX_UTIL.DownloadText(option.policy_url, function (result) {
						if (result) {
							// 다운로드된 정책 파싱
							var policyParsed = JSON.parse(result);
							// 다운로드된 정책 URL Decode
							policyParsed.policy = CROSSWEBEX_UTIL.URLDecodeJSONValue(policyParsed.policy);
							// 다운로드된 정책과 오버랩 정책을 머지
							option.policy = MergePolicy(policyParsed.policy, option.policy_overlap);
							// 콜백 함수가 있는 경우 콜백 함수를 호출
							if (option.policy_callback) {
								option.policy_callback(option.policy);
							}
							resolve();
						} else {
							reject("Failed to download policy");
						}
					});
					// 정책 URL 이 존재하지 않는 경우
				} else {
					// 오버랩 정책을 정책으로 설정
					// [18.09.27] Namsu change - policy_overlap이 설정되지 않은 상태에서 option.policy을 무조건 덮어쓰면 정책 설정된 데이터가 날아가는 문제가 발생하여
					//							 if 문으로 조건 검사하도록 수정
					if ( option.policy_overlap ) {
						option.policy = option.policy_overlap;
					} 
					resolve();
				}
			}
		});
	};

	/************************************************************
	 * @brief		캐쉬초기화
	 ************************************************************/
	function promiseInitCache (option) {
		return new Promise(function (resolve, reject) {
			if (option.iniCache) {
				if (option.isHtml5) {
					Html5Adaptor.InitCache(resolve);
				} else {
					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.InitCache(resolve);
					});
				}
			} else {
				resolve();
			}
		});
	};

	/************************************************************
	 * @brief		IssuerDN 필터 설정
	 ************************************************************/
	function promiseFilterIssuerDN (option) {
		return new Promise(function (resolve, reject) {
			if (option.filterCertByIssuer && option.filterCertByIssuer.enable) {

				var issuerDNList = IssuerDNFilter;

				if (option.filterCertByIssuer.list) {
					issuerDNList = option.filterCertByIssuer.list;
				}

				if (option.isHtml5) {
					Html5Adaptor.Filter_IssuerDN(issuerDNList, resolve);
				} else {
					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.FilterCert('', issuerDNList, resolve);
					});
				}
			} else {
				resolve();
			}
		});
	};

	/************************************************************
	 * @brief		Serial 필터 설정
	 ************************************************************/
	function promiseFilterSerialNo (option) {
		return new Promise(function (resolve, reject) {
			if (option.filterCertBySerialNo) {

				if (option.isHtml5) {
					Html5Adaptor.Filter_SerialNo(option.filterCertBySerialNo, resolve);
				} else {
					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.FilterCert('', option.filterCertBySerialNo, resolve);
					});
				}
			} else {
				resolve();
			}
		});
	};

	/************************************************************
	 * @brief		OID-Alias 필터 설정
	 ************************************************************/
	function promiseFilterOIDAlias (option) {
		return new Promise(function (resolve, reject) {
			if (option.filterCertByOIDAlias && option.filterCertByOIDAlias.enable) {

				var OIDAliasList = option.filterCertByOIDAlias.list;

				if (option.isHtml5) {
					Html5Adaptor.Filter_OIDAlias(OIDAliasList, resolve);
				} else {
					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.SetProperty("certmanui_oid", OIDAliasList, resolve);
					});
				}
			} else {
				resolve();
			}
		});
	};

	/************************************************************
	 * @brief		OU 필터 설정
	 ************************************************************/
	function promiseFilterOU (option) {
		return new Promise(function (resolve, reject) {
			if (option.filterCertByOU && option.filterCertByOU.enable) {
				var OUList = option.filterCertByOU.list;
				if (option.isHtml5) {
					Html5Adaptor.Filter_OU(OUList, resolve);
				} else {
					//CWEX에는 OU필터 설정하지 않는다
						resolve();
				}
			} else {
				resolve();
			}
		});
	};

	/************************************************************
	 * @brief		언어 설정
	 ************************************************************/
	function promiseSetLang (option) {
		return new Promise(function (resolve, reject) {
			var html5Lang = "", csLang = "";

			if (option.langType) {
				html5Lang = option.langType.toLowerCase();
				csLang = option.langType.toLowerCase();
			}

			if (option.html5Lang) {
				html5Lang = option.html5Lang.toLowerCase();
			}

			if (option.csLang) {
				csLang = option.csLang.toLowerCase();
			}

			if (option.isHtml5) {
				if ("kor" === html5Lang ||
					"eng" === html5Lang) {
					INI_LANGUAGE_HANDLE.setSystemLanguage(html5Lang);
				}
			} else {
				if ("off" === csLang ||
					"kor" === csLang ||
					"chn" === csLang ||
					"eng" === csLang) {
					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.SetProperty("certmanui_language", csLang, resolve);
					});
				}
			}
			resolve();
		});
	};

	/************************************************************
	 * @brief		전자서명 원문영역 view 스타일
	 ************************************************************/
	function promiseSetPlaintextViewType (option) {
		return new Promise(function (resolve, reject) {
			var htmlViewType = "", csViewType = "";

			if (option.viewType) {
				htmlViewType = option.viewType.toUpperCase();
				csViewType = option.viewType.toUpperCase();

				//CS UI의 경우 값을 setproperty에 맞게 치환
				if ("NONE" === csViewType) {
					csViewType = "no";
				} else if ("GRID" === csViewType || "PAGE" === csViewType) {
					csViewType = "list";
				} else {
					csViewType = "text";
				}
			}

			if (option.plainTextViewType) {
				htmlViewType = option.plainTextViewType.toUpperCase();
			}

			if (option.certUIMode) {
				csViewType = option.certUIMode.toLowerCase();
			}

			if (option.isHtml5) {
				if ("NONE" === htmlViewType || "GRID" === htmlViewType || "PAGE" === htmlViewType || "TEXT" === htmlViewType) {
					INI_PLAINTEXT_VIEW_HANDLER.setPlaintextViewType(htmlViewType);
				}
			} else {
				if ("no" === csViewType || "list" === csViewType || "text" === csViewType) {
					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.SetProperty("certmanui_SelectCertUIMode", csViewType, resolve);
					});
				}
			}

			resolve();
		});
	};

	/************************************************************
	 * @brief		정책 설정 - 인증서 선택창의 이미지 변경
	 ************************************************************/
	function promiseSetLogoPath (option) {
		return new Promise(function (resolve, reject) {
			if (!option.isHtml5 && option.policy && option.policy.TitleLogoPath)
				CrossWebExWeb6.SetLogoPath(option.policy.TitleLogoPath, resolve);
			else
				resolve();
		});
	};

	/************************************************************
	 * @brief		정책 설정 - 로그인창에서 페기/만료된인증서 표시여부 default (false)
	 ************************************************************/
	function promiseDisableInvalidCert (option) {
		return new Promise(function (resolve, reject) {
			if (!option.isHtml5 && option.policy && option.policy.DisableInvalidCert)
				CrossWebExWeb6.DisableInvalidCert(option.policy.DisableInvalidCert, resolve);
			else
				resolve();
		});
	};

	/************************************************************
	 * @brief		정책 설정 - CA 인증서 로드 (CA 인증서 필터링)
	 ************************************************************/
	function promiseLoadCACert (option) {
		return new Promise(function (resolve, reject) {
			if (!option.isHtml5 && option.policy && option.policy.CACerts)
				CrossWebExWeb6.LoadCACert(option.policy.CACerts, resolve);
			else
				resolve();
		});
	};

	/************************************************************
	 * @brief		정책 설정 - OID 필터 설정
	 ************************************************************/
	function promiseFilterOID (option) {
		return new Promise(function (resolve, reject) {
			if (option.policy && option.policy.CertOIDs) {
				if (option.isHtml5) {
					Html5Adaptor.Filter_OID(option.policy.CertOIDs, resolve);
				} else {
					CrossWebExWeb6.SetProperty("certmanui_realoidfilter", option.policy.CertOIDs, resolve);
				}
			} else {
				resolve();
			}
		});
	};

	/************************************************************
	 * @brief		정책 설정 - 기타 정책
	 ************************************************************/
	function promiseSetProperty (option) {
		return new Promise(function (resolve, reject) {
			if (!option.isHtml5 && option.policy) {
				if (Object.keys(option.policy).length) {
					for (var prop in option.policy) {
						if (option.policy.hasOwnProperty(prop)) {
							CrossWebExWeb6.SetPropertyAdd(prop, option.policy[prop]);
						}
					}
					CrossWebExWeb6.SetPropertyEX(resolve);
				} else {
					resolve();
				}
			} else {
				resolve();
			}
		});
	};

	/************************************************************
	 * @brief		전자서명 원문 Encoding
	 ************************************************************/
	function promiseSetPlainEncoding (option) {
		return new Promise(function (resolve, reject) {

			// 원문 Encoding 옵션이 설정되지 않은 경우
			if (typeof option.plainCharEncoding === 'undefined' || typeof option.plainURLEncoding === 'undefined') {
				resolve();
				return;
			}

			// 원문 Encoding
			var plainCharEncoding = option.plainCharEncoding.toUpperCase();
			var plainURLEncoding = option.plainURLEncoding;

			// HTML5 인 경우
			if (option.isHtml5) {
				var defaultConf = Html5Adaptor.GetDefaultConf();
				// Character Encoding
				if (plainCharEncoding === "UTF-8") {
					defaultConf.Signature.UrlEncodeCharSet.ORIGIRAL_CHAR_SET = "UTF-8";
					defaultConf.Signature.UrlEncodeCharSet.SIGN_CHAR_SET = "UTF-8";
				} else if (plainCharEncoding === "EUC-KR") {
					defaultConf.Signature.UrlEncodeCharSet.ORIGIRAL_CHAR_SET = "UTF-8";
					defaultConf.Signature.UrlEncodeCharSet.SIGN_CHAR_SET = "EUC-KR";
				}
				// URL Encoding
				if (plainURLEncoding) {
					defaultConf.Signature.UrlEncodeCharSet.ORIGIRAL_URL_ENCODE = true;
					defaultConf.Signature.UrlEncodeCharSet.SIGN_URL_ENCODE = true;
				} else {
					defaultConf.Signature.UrlEncodeCharSet.ORIGIRAL_URL_ENCODE = false;
					defaultConf.Signature.UrlEncodeCharSet.SIGN_URL_ENCODE = false;
				}
				resolve();
			// cs 인 경우
			} else {
				resolve();
				// Character Encoding: UTF-8
				// if (plainCharEncoding === "UTF-8") {
				// 	// URL Encoding
				// 	if (plainURLEncoding) {
				// 		CrossWebExWeb6.SetProperty("URLEncodeConv", "NONE", resolve);
				// 	} else {
				// 		CrossWebExWeb6.SetProperty("URLEncodeConv", "NONE", resolve);
				// 	}
				// // Character Encoding: EUC-KR
				// } else if (plainCharEncoding === "EUC-KR") {
				// 	// URL Encoding
				// 	if (plainURLEncoding) {
				// 		CrossWebExWeb6.SetProperty("URLEncodeConv", "EUCKR", resolve);
				// 	} else {
				// 		CrossWebExWeb6.SetProperty("URLEncodeConv", "NONE", resolve);
				// 	}
				// }
			}
		});
	};

	/************************************************************
	 * @brief		설정값에 따른 필요함수 호출
	 * @param		option.isHtml5
	 * @param		option.iniCache
	 * @param		option.filterCertByIssuer
	 * @param		option.langType
	 * @param		option.html5Lang
	 * @param		option.csLang
	 * @param		option.viewType
	 * @param		option.plainTextViewType
	 * @param		option.certUIMode
	 * @param		option.customBannerURL
	 * @param		option.useBanner
	 * @param		option.readyCallback
	 ************************************************************/
	function promiseSetPreEnv(option) {
		return new Promise(function (mainResolve, mainReject) {
			promiseWaitModuleLoad(option).then(function () {
				return promiseDownloadCertPolicy(option);
			}).then(function () {
				return promiseInitCache(option);
			}).then(function () {
				return promiseFilterIssuerDN(option);
			}).then(function () {
				return promiseFilterSerialNo(option);
			}).then(function () {
				return promiseFilterOIDAlias(option);
			}).then(function () {
				return promiseSetLang(option);
			}).then(function () {
				return promiseSetPlaintextViewType(option);
			}).then(function () {
				return promiseSetLogoPath(option);
			}).then(function () {
				return promiseDisableInvalidCert(option);
			}).then(function () {
				return promiseLoadCACert(option);
			}).then(function () {
				return promiseFilterOID(option);
			}).then(function () {
				return promiseSetProperty(option);
			}).then(function () {
				return promiseSetPlainEncoding(option);
			}).then(function () {
				return promiseFilterOU(option);
			}).then(function () {
				mainResolve();
			});
		});
	}

	/************************************************************
	 * @brief		deep copy
	 * @param		object
	 * @retval		deep copy 된 object
	 ************************************************************/
	function clone(obj) {

		if (null === obj || 'object' !== typeof obj)
			return obj;

		var cloneObj = obj.constructor();

		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				cloneObj[prop] = clone(obj[prop]);
			}
		}

		return cloneObj;
	}

	/************************************************************
	 * @brief		인증서 캐쉬가 되어 있어도 비밀번호 입력창을 표시하도록 설정
	 * @param		option		옵션
	 ************************************************************/
	var promiseExtInitCache = function (option) {
		return new Promise(function (resolve, reject) {

			if (option.isHtml5) {
				resolve();
				} else {
				// 옵션을 먼저 설정
				if (option.extInitCache) {
					CrossWebExWeb6.ExtendMethod("InitCache", option.extInitCache, resolve);
				// 옵션이 없는 경우 정책으로 설정
				} else if (option.policy && option.policy.InitCache) {
					CrossWebExWeb6.ExtendMethod("InitCache", option.policy.InitCache, resolve);
				// 기타
			} else {
					CrossWebExWeb6.ExtendMethod("InitCache", "on", resolve);
				}
			}
		});
	};

	/************************************************************
	 * @brief		서명 형식 설정
	 * @param		option		옵션
	 ************************************************************/
	var promiseSetSignType = function (option) {
		return new Promise(function (resolveSignType, rejectSignType) {

			// HTML5 인 경우
			if (option.isHtml5) {
				resolveSignType();
				return;
			}

			// 금결원 전자서명 형식 설정 및 해제
			var promiseBTInitP7Msg = function () {
				return new Promise(function (resolve, reject) {
					var BTInitP7MsgValue = "0";

					if ("yessignP7" === option.signType)
						BTInitP7MsgValue = "1";

					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.setSharedAttribute("BTInitP7Msg", BTInitP7MsgValue, resolve);
					});
				});
			}

			// 전자서명 형식 설정
			var promiseP7SignDataBase64Dec = function () {
				return new Promise(function (resolve, reject) {

					if ("noplainP7" === option.signType) {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.SetProperty("P7SignDataNoPlain", "true", resolve);
						});
					} else if ("base64decP7" === option.signType) {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.SetProperty("P7SignDataBase64Dec", "true", resolve);
						});
					} else {
						resolve();
					}
				});
			};

			promiseBTInitP7Msg().then(function () {
				return promiseP7SignDataBase64Dec();
			}).then(function () {
				resolveSignType();
			});
		});
	};

	/************************************************************
	 * @brief		CrossWeb EX 함수
	 ************************************************************/
	/**
	 * INISAFE CrossWeb EX 인터페이스 함수
	 * @exports IniSafeCrossWebEx
	 * @namespace IniSafeCrossWebEx
	 */
	var Func = function () { }

	Func.prototype = {

		/**
		 * 언어설정
		 * @memberOf! IniSafeCrossWebEx#
		 * @param {Object} option	언어 설정 옵션 Object
		 * @param {Stirng} option.langType			"kor","eng", "chn"
		 * @param {Boolean} option.isHtml5			HTML5 모드
		 * @param {Function} option.processCallback	콜백 함수
		 * @returns		리턴 없음
		 */
		setLanguage: function (option) {

			var html5Lang = "", csLang = "";

			if ('undefined' !== typeof langType) {
				html5Lang = langType.toLowerCase();
				csLang = langType.toLowerCase();

				if ('undefined' === typeof isHtml5) {
					isHtml5 = baseOption.isHtml5;
				}

				if (isHtml5) {
					if ("kor" === html5Lang ||
						"eng" === html5Lang) {
						INI_LANGUAGE_HANDLE.setSystemLanguage(html5Lang);

						if ('function' === typeof callback) {
							callback(true);
							return;
						}
					}
				} else {
					if ("off" === csLang ||
						"kor" === csLang ||
						"chn" === csLang ||
						"eng" === csLang) {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.SetProperty("certmanui_language", csLang, callback);
						});
						return;
					}
				}
			}

			if ('function' === typeof callback) {
				callback(false);
				return;
			}
		},

		/**
		 * 로그인 함수
		 *
		 * @memberOf! IniSafeCrossWebEx#
		 * @param {Object}		option 					로그인 옵션 Object
		 * @param {String}		option.loginType		"sign" : 전자서명, "enc" : 암호화
		 * @param {String}		option.data				로그인 서명에 사용될 임의의 입력 값
		 * @param {String}		option.readForm			loginType : "enc" 일때 필수 입력
		 * @param {String}		option.sendForm			loginType : "enc" 일때 필수 입력
		 * @param {Function}	option.processCallback	콜백함수
		 * @param {Boolean}		option.isCmp 			인증서 갱신/폐기인지 로그인인지 확인용
		 * @param {Boolean}		option.isInnerView		인증서 제출 창을 메인 화면에 삽입할 지 여부(현재 사용 안함)
		 * @param {Boolean}		option.isNoViewSign		로그인 시 인증서 제출창 표시 여부
		 * @param {String}		option.defaultStorage	인증서 제출창 출력 시 기본으로 표시 될 저장소
		 * @param {Boolean}		option.vid				loginType : "sign" 일때 필수 입력(true/false)
		 * @returns 리턴 없음
		 */
		login: function (option) {

			if ('undefined' === typeof option.loginType) {
				return;
			}

			if ("sign" === option.loginType && 'undefined' === typeof option.vid) {
				return;
			}

			option = mergeOption(option);
			var data = makeData(option);

			var doLogin = function () {
				if ("sign" === option.loginType) {
					if (option.isHtml5) {
						//모비스처럼 사설인증서만 사용하는 경우에는 data에 "login"으로 설정해줘야 하고 아래 주석되어 있는 부분을 풀고 if(true===option.vid){ 부분을 주석처리
						//if ("login" === data) {
						  if(true === option.vid){
							Html5Adaptor.PKCS7SignedLogin(
								data,
								option.processCallback,
								data,
								option.isCmp,
								option.isNoViewSign,
								option.subaction,
								option.defaultStorage,
								option.vid
							);
						} else {
							Html5Adaptor.PKCS7SignedDataSign(
								data,
								option.processCallback,
								data,
								option.isInnerView,
								option.isNoViewSign,
								option.defaultStorage,
								option.vid,
								false,	// base64Dec
								option.subaction
							);
						}
					} else {
						if (true === option.vid) {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								CrossWebExWeb6.PKCS7SignVID(
									data,
									option.processCallback,
									data
								);
							});
						} else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								CrossWebExWeb6.PKCS7SignedData(
									data,
									option.processCallback,
									data,
									option.encodeCharSet
								);
							});
						}
					}
				}
				else if ("enc" === option.loginType) {
					if (option.isHtml5) {
						Html5Adaptor.EncFormVerify2(
							option.readForm,
							option.sendForm,
							option.processCallback,
							data,
							option.isNoViewSign
						);
					} else {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.EncFormVerify2(
								option.readForm,
								option.sendForm,
								option.processCallback,
								data
							);
						});
					}
				}
				else if ("signkorea_sign" === option.loginType) {
					if (option.isHtml5) {
						if (true === option.vid) {
							Html5Adaptor.PKCS7SignKoreaLogin(
								data,
								option.processCallback,
								data,
								option.isCmp,
								option.isNoViewSign,
								option.defaultStorage
							);
						} else {
							Html5Adaptor.PKCS7SignKoreaData(
								data,
								option.processCallback,
								data,
								option.isInnerView,
								option.isNoViewSign,
								option.defaultStorage
							);
						}
					} else {
						if (true === option.vid) {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								CrossWebExWeb6.PKCS7SignVID(
									data,
									option.processCallback,
									data
								);
							});
						} else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								CrossWebExWeb6.PKCS7SignedData(
									data,
									option.processCallback,
									data,
									option.encodeCharSet
								);
							});
						}
					}
				}
			};

			promiseSetPreEnv(option).then(function () {
				return promiseSetSignType(option);
			}).then(function () {
				doLogin();
			});
		},

		/**
		 * 전자서명 (전자서명+암호화는 API 내에서 해결하지 않고, API 조합하여 사용해야 함)
		 * 
		 * @memberOf! IniSafeCrossWebEx#
		 *
		 * @param {Object} option				전자서명 설정 옵션 Object
		 * @param {String}	option.signType			전자서명 타입 : "P7", "yessignP7", "noplainP7", "base64decP7", "pdf"
		 * @param {String}	option.targetType		전자서명 원문 타입 : "data", "form"
		 * @param {Object}	option.form				targetType이 "form" 인 경우 서명할 원문 데이터
 		 * @param {String}	option.data			전자서명 원문 데이터
		 * @param {Function}	option.processCallback	전자서명 처리 결과를 받기 위한 콜백 함수
		 * @param {Boolean}	option.isInnerView		인증서 제출 창을 메인 화면에 삽입할 지 여부(현재 사용 안함)
 		 * @param {Boolean}	option.vid			본인확인 검증 사용 유/무
		 * @param {Boolean}	option.isCmp		인증서 갱신/폐기 여부
		 * @returns 리턴없음
		 */
		sign: function (option) {

			// 필수 option 체크
			if ('undefined' === typeof option.signType ||
				'undefined' === typeof option.targetType) {
				return;
			}

			option = mergeOption(option);
			var data = makeData(option);

			var doSign = function () {
				if ("data" === option.targetType) {
					if (("P7" === option.signType && 'undefined' !== typeof option.vid && false === option.vid) ||
						"noplainP7" === option.signType) {
						if (option.isHtml5) {
							if ('undefined' !== typeof option.useExtandOption && true === option.useExtandOption &&
								'undefined' !== typeof option.extandOption) {
								Html5Adaptor.PKCS7SignedDataWithOption(
									data,
									option.processCallback,
									data,
									option,
									option.isNoViewSign
								);
							}
							else {
								if(option.addPKCS7Sign == true) {
									Html5Adaptor.AddSignerSignedData(
										data,
										option.processCallback,
										data,
										option,
										option.isNoViewSign
									);	
								} else {
									Html5Adaptor.PKCS7SignedDataSign(
										data,
										option.processCallback,
										data,
										option.isInnerView,
										option.isNoViewSign,
										option.defaultStorage,
										option.vid,
										false	// base64Dec
									);
								}
							}
						} else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								if(option.addPKCS7Sign == true) {
									CrossWebExWeb6.AddSignerSignedData(
										option.pkcs7SignedData,										
										option.vid,
										option.processCallback
									);
								} else {
									CrossWebExWeb6.PKCS7SignedData(
										data,
										option.processCallback,
										data,
										option.encodeCharSet
									);
								}
							});
						}
					}
					else if ("P7" === option.signType && 'undefined' !== typeof option.vid && true === option.vid) {
						if (option.isHtml5) {

							if ('undefined' !== typeof option.useExtandOption && true === option.useExtandOption &&
								'undefined' !== typeof option.extandOption) {
								Html5Adaptor.PKCS7SignedDataWithOption(
									data,
									option.processCallback,
									data,
									option,
									option.isNoViewSign
								);
							}
							else {
								if(option.addPKCS7Sign == true) {
									Html5Adaptor.AddSignerSignedData(
										data,
										option.pkcs7SignedData,
										option.processCallback,
										data,
										option,
										option.isNoViewSign
									);
								} else {
									Html5Adaptor.PKCS7SignedDataSign(
										data,
										option.processCallback,
										data,
										option.isInnerView,
										option.isNoViewSign,
										option.defaultStorage,
										option.vid,
										false	// base64Dec
									);
								}
							}

						} else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								if(option.addPKCS7Sign == true) {
									CrossWebExWeb6.AddSignerSignedData(
										option.pkcs7SignedData,										
										option.vid,
										option.processCallback
									);
								} else {
									CrossWebExWeb6.PKCS7SignVID(
										data,
										option.processCallback,
										data
									);
								}
							});
						}
					}
					else if ("yessignP7" === option.signType) {
						if (option.isHtml5) {
							Html5Adaptor.PKCS7YesSignData(
								data,
								option.processCallback,
								data,
								option.isNoViewSign,
								option.defaultStorage
							);
						} else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								CrossWebExWeb6.PKCS7SignedData(
									data,
									option.processCallback,
									data,
									option.encodeCharSet
								);
							});
						}
					}
					else if ("pdf" === option.signType) {
						if (option.isHtml5) {
							Html5Adaptor.PKCS7PDFSignData(
								data,
								option.processCallback,
								data,
								false,
								option.isNoViewSign,
								option.defaultStorage,
								option.vid
							);
						} else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								CrossWebExWeb6.PKCS7SignedDataWithMD(
									data,
									option.processCallback,
									data,
									option.encodeCharSet
								);
							});
						}
					}
					else if ("multipdf" === option.signType) {
						if (option.isHtml5) {
							Html5Adaptor.PKCS7PDFSignData(
								data,
								option.processCallback,
								data,
								true,
								option.isNoViewSign,
								option.defaultStorage,
								option.vid
							);
						} else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								CrossWebExWeb6.PKCS7SignedDataWithMDMulti(
									data,
									option.processCallback,
									data,
									option.vid,
									option.encodeCharSet
								);
							});
						}
					}
					else if ("signkoreaP7" === option.signType) {
						if (option.isHtml5) {
							Html5Adaptor.PKCS7SignKoreaData(
								data,
								option.processCallback,
								data,
								option.isInnerView,
								option.isNoViewSign,
								option.defaultStorage
							);
						} else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								CrossWebExWeb6.PKCS7SignedData(
									data,
									option.processCallback,
									data,
									option.encodeCharSet
								);
							});
						}
					}
					else if ("P1" === option.signType) {
						if (option.isHtml5) {
							Html5Adaptor.PKCS1SignedDataSign(
								data,
								option.processCallback,
								data,
								option.isInnerView,
								option.isNoViewSign,
								option.defaultStorage
							);
						} else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								CrossWebExWeb6.PKCS1SignedData(
										data,
										option.processCallback,
										data,
										option.plainCharEncoding
									);
							});
						}
					}
					// [21.11.16] Namsu change - 'base64decP7' 설정을 WebUI에서도 처리할 수 있도록 수정
					else if ("base64decP7" === option.signType) {
						if (option.isHtml5) {
							if(option.addPKCS7Sign == true) {
								Html5Adaptor.AddSignerSignedData(
									data,
									option.processCallback,
									data,
									option,
									option.isNoViewSign
								);	
							} else {
								Html5Adaptor.PKCS7SignedDataSign(
									data,
									option.processCallback,
									data,
									option.isInnerView,
									option.isNoViewSign,
									option.defaultStorage,
									option.vid,
									true	// base64Dec
								);
							}
						}
						else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								if(option.addPKCS7Sign == true) {
									CrossWebExWeb6.AddSignerSignedData(
										option.pkcs7SignedData,										
										option.vid,
										option.processCallback
									);
								} else {
									CrossWebExWeb6.PKCS7SignedData(
										data,
										option.processCallback,
										data,
										option.encodeCharSet
									);
								}
							});
						}
					}
				}
				else if ("form" === option.targetType) {
					if (("P7" === option.signType && 'undefined' !== typeof option.vid && false === option.vid) ||
						"yessignP7" === option.signType ||
						"noplainP7" === option.signType ||
						"base64decP7" === option.signType) {
						if (option.isHtml5) {
							Html5Adaptor.PKCS7SignedDataForm(
								option.form,
								data,
								option.processCallback,
								data,
								option.isInnerView,
								option.isNoViewSign,
								option.defaultStorage
							);
						} else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								CrossWebExWeb6.PKCS7SignedDataForm(
									option.form,
									data,
									option.processCallback,
									data,
									option.isNoViewSign,
									option.encodeCharSet
								);
							});
						}
					}
					else if ("P7" === option.signType && 'undefined' !== typeof option.vid && true === option.vid) {
						if (option.isHtml5) {
							Html5Adaptor.PKCS7SignVIDFormLogin(
								option.form,
								data,
								option.processCallback,
								data,
								option.isCmp,
								option.isNoViewSign,
								option.defaultStorage
							);
						} else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								CrossWebExWeb6.PKCS7SignVIDForm(
									option.form,
									data,
									option.processCallback,
									data
								);
							});
						}
					}
					else if ("pdf" === option.signType) {
						if (option.isHtml5) {
							// 없음
						} else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								CrossWebExWeb6.PKCS7SignedDataWithMDForm(
									option.form,
									data,
									option.processCallback,
									data,
									option.encodeCharSet
								);
							});
						}
					}
					else if ("P1" === option.signType) {
						if (option.isHtml5) {
							Html5Adaptor.PKCS1SignedDataForm(
								option.form,
								data,
								option.processCallback,
								data,
								option.isInnerView,
								option.isNoViewSign,
								option.defaultStorage
							);
						} else {
							// 설치 체크 및 정책 설정 대기
							cwModuleSetPropertyWait(function () {
								CrossWebExWeb6.PKCS1SignedDataForm(
									option.form,
									data,
									option.processCallback,
									data,
									option.plainCharEncoding
								);
							});
						}
					}
				}
			};

			promiseSetPreEnv(option).then(function () {
				return promiseExtInitCache(option);
			}).then(function () {
				return promiseSetSignType(option);
			}).then(function () {
				doSign();
			});
		},

		/**
		 * 다건 전자서명
 		 * @memberOf! IniSafeCrossWebEx#
		 *
		 * @param {Object} option	다건 전자서명 옵션 Object
		 * @param {String}		option.signType			전자서명 타입
		 * @param {String}		option.form				서명 대상 Form 명(Form에 PKCS7SignedData를 전송 할 필드로 일반적으로 사용함)
		 * @param {String}		option.dataArr			배열 형식의 서명 대상 원문
		 * @param {Function}		option.processCallback	전자서명 처리 결과를 받기 위한 콜백 함수
		 * @param {Boolean}		option.vid				본인확인 검증 사용 유/무
		 * @param {Boolean}		option.isInnerView		인증서 제출 창을 메인 화면에 삽입할 지 여부(현재 사용 안함)
		 * @returns 리턴없음
		 */
		multiSign: function (option) {

			// 필수 option 체크
			if ('undefined' === typeof option.signType) {
				return;
			}

			option = mergeOption(option);

			var doMultiSign = function () {
				// cs로 동작하는 경우 cwui를 로드하지 않기 때문에 아래 선언은 사용불가
				//var MULTI_DELIMITER = cwui.defaultConf.Signature.MultiDelimiter;

				// customerConf.Signature.MultiDelimiter와 동일해야 한다.
				var MULTI_DELIMITER = "-----------------------------------------";

				if (option.isHtml5) {
					// 문자열
					var data = '';

					if ('string' !== typeof option.dataArr) {
						var temp = '';

						for (var i = 0; i < option.dataArr.length; i++) {
							if ('' === temp) {
								temp = option.dataArr[i];
							} else {
								temp += MULTI_DELIMITER + option.dataArr[i];
							}
						}

						if ('' !== temp) {
							data = temp;
						}
					} else {
						data = option.dataArr;
					}

					if ("P7" === option.signType) {
						if ('undefined' !== typeof option.useExtandOption && true === option.useExtandOption &&
							'undefined' !== typeof option.extandOption) {
							Html5Adaptor.PKCS7SignedDataSignMulti(
								option.form,
								data,	// String
								option.processCallback,
								data,
								option.isInnerView,
								option,
								option.isNoViewSign,
								option.defaultStorage,
								option.vid,
								false	// base64Dec
							);
						} else {
							Html5Adaptor.PKCS7SignedDataSignMulti(
								option.form,
								data,	// String
								option.processCallback,
								data,
								option.isInnerView,
								null,
								option.isNoViewSign,
								option.defaultStorage,
								option.vid,
								false	// base64Dec
							);
						}
					} else if ("yessignP7" === option.signType) {
						Html5Adaptor.PKCS7YesSignDataMulti(
							option.form,
							data,	// String
							option.processCallback,
							data,
							option.isNoViewSign,
							option.defaultStorage
						);
					// [21.11.16] Namsu add - 'base64decP7' 설정을 처리할 수 있도록 추가
					} else if ("base64decP7" === option.signType) {
						Html5Adaptor.PKCS7SignedDataSignMulti(
							option.form,
							data,	// String
							option.processCallback,
							data,
							option.isInnerView,
							null,
							option.isNoViewSign,
							option.defaultStorage,
							option.vid,
							true	// base64Dec
						);
					}

				} else {
					// 배열
					var dataArr;

					if ('string' === typeof option.dataArr) {
						dataArr = option.dataArr.split(MULTI_DELIMITER);

					} else {
						dataArr = option.dataArr;
					}

					var viewStr = '';

					for (var i = 0; i < dataArr.length; i++) {
						if ('' !== viewStr) {
							viewStr += '&';
						}

						viewStr += '#' + parseInt(i + 1) + '= &';	// 각 원문을 구분한다.(변경가능)
						viewStr += dataArr[i];
					}

					dataArr.unshift(viewStr);	// 맨 앞에 조립된 원문을 넣어준다.(CS 화면표시용)

					if (true === option.vid) {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.PKCS7SignedDataWithVIDMultiFormV2(
								option.form,
								dataArr,	// Array
								option.processCallback
							);
						});
					} else if (false === option.vid) {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.PKCS7SignedDataMultiFormV2(
								option.form,
								dataArr,	// Array
								option.processCallback
							);
						});
					}
				}
			};

			promiseSetPreEnv(option).then(function () {
				return promiseExtInitCache(option);
			}).then(function () {
				return promiseSetSignType(option);
			}).then(function () {
				doMultiSign();
			});
		},

		/************************************************************
		 * @brief		암호화
		 * @param		option.targetType			["data", "form"]
		 * @param		option.readForm
		 * @param		option.sendForm
		 * @param		option.processCallback

		 * @param		option.targetFormName
		 * @param		option.targetFieldCss
		 * 			or
		 * @param		option.data
		 ************************************************************/
		enc: function (option) {

			if ('undefined' === typeof option.targetType) {
				return;
			}

			option = mergeOption(option);
			var data = makeData(option);

			var doEnc = function () {
				if ("data" === option.targetType) {
					if (option.isHtml5) {
						// 없음
					} else {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.EncParams(
								data,
								option.processCallback,
								data
							);
						});
					}
				}
				else if ("form" === option.targetType) {
					if (option.isHtml5) {
						Html5Adaptor.EncForm2(
							option.readForm,
							option.sendForm,
							option.processCallback,
							data
						);
					} else {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.EncForm2(
								option.readForm,
								option.sendForm,
								option.processCallback,
								data
							);
						});
					}
				}
			};

			promiseSetPreEnv(option).then(function () {
				doEnc();
			});
		},

		/**
		 * 공인인증서 발급 함수
		 * @memberOf! IniSafeCrossWebEx#
		 * 
		 * @param {Object}		option						공인인증서 발급 시 사용되는 옵션 Object
		 * @param {String}		option.caName				발급기관
		 * @param {String}		option.szRef       			참조코드
		 * @param {String}		option.szCode        		인가코드
		 * @param {Fucntion}	option.processCallback    	인증서 발급 결과를 처리하기 위한 콜백 함수
		 * @returns 리턴없음
		 */
		issueCertificate: function (option) {

			option = mergeOption(option);
			var doIssueCertificate = function () {
				if (option.isHtml5) {
					Html5Adaptor.IssueCertificate(
						option.caName,
						option.szRef,
						option.szCode,
						option.processCallback,
						option.certId,
						option.defaultStorage
					);
				} else {
					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.IssueCertificate(
							option.caName,
							option.szRef,
							option.szCode,
							option.processCallback
						);
					});

				}
			};

			promiseSetPreEnv(option).then(function () {
				doIssueCertificate();
			});
		},

		/**
		 * 사설 인증서 발급 함수
		 * @memberOf! IniSafeCrossWebEx#
		 * 
		 * @param {Object} 			option						사설인증서 발급 시 사용되는 옵션 Object
		 * @param {Function}		option.processCallback    	인증서 발급 결과를 처리하기 위한 콜백함수
		 * @returns 리턴없음
		 */
		issueCertificate_INITECH: function (option) {

			option = mergeOption(option);

			var doIssueCertificate_INITECH = function () {
				if (option.isHtml5) {
					Html5Adaptor.IssueCertificate_INITECH(
						option,
						option.processCallback
					);
				} else {
					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.INITECHCA_IssueCertificate_v7(
							option,
							option.processCallback
						);
					});
				}
			};

			promiseSetPreEnv(option).then(function () {
				doIssueCertificate_INITECH();
			});
		},

		/**
		 * 공인인증서 재발급 함수
		 * @memberOf! IniSafeCrossWebEx#
		 *
		 * @param {Object} 		option						인증서 재발급에 사용되는 옵션 Object
		 * @param {String}		option.caName				발급기관
		 * @param {String}		option.szRef       			참조코드
		 * @param {String}		option.szCode        		인가코드
		 * @param {Function}	option.processCallback    	인증서 재발급 콜백함수
		 * @returns 리턴없음
		 */
		reissueCertificate: function (option) {

			option = mergeOption(option);

			var doReissueCertificate = function () {
				if (option.isHtml5) {
					Html5Adaptor.ReIssueCertificate(
						option.caName,
						option.szRef,
						option.szCode,
						option.processCallback,
						option.certId,
						option.defaultStorage
					);
				} else {
					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.ReIssueCertificate(
							option.caName,
							option.szRef,
							option.szCode,
							option.processCallback
						);
					});
				}
			};

			promiseSetPreEnv(option).then(function () {
				doReissueCertificate();
			});
		},

		/**
		 * 사설인증서 갱신 함수
		 * @memberOf! IniSafeCrossWebEx#
		 * 
		 * @param {Object} 		option						사설 인증서 갱신에 사용되는 옵션 Object
		 * @param {String}		option.caName				발급기관
		 * @param {Function}	option.processCallback    	인증서 갱신 콜백함수
		 * @param {String}		option.REGNO				주민번호
		 * @param {String}		option.USERID				사이트 아이디
		 * @param {String}		option.DETAILNAME			고객명
		 * @param {Number}		option_KEYBITS				key_bits
		 * @param {String}		option.ACTIONCODE			동작 타입
		 * @returns 리턴없음
		 */
		updateCertificate_INITECH: function (option) {

			option = mergeOption(option);

			var doUpdateCertificate = function () {
				if (option.isHtml5) {
					Html5Adaptor.UpdateCertificate_INITECH(
						option,
						option.processCallback
					);
				} else {
					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.INITECHCA_IssueCertificate_v7(
							option,
							option.processCallback
						);
					});
				}
			};

			promiseSetPreEnv(option).then(function () {
				doUpdateCertificate();
			});
		},

		/**
		 * 공인인증서 갱신 함수
		 * @memberOf! IniSafeCrossWebEx#
		 *
		 * @param {Object} 		option						공인인증서 갱신에 사용되는 옵션 Object
		 * @param {String}		option.caName				발급기관
		 * @param {Function}	option.processCallback    	인증서 갱신 콜백함수
		 * @returns 리턴없음
		 */
		updateCertificate: function (option) {

			option = mergeOption(option);

			var doUpdateCertificate = function () {
				if (option.isHtml5) {
					Html5Adaptor.UpdateCertificate(
						option.caName,
						option.processCallback,
						option.certId,
						option.defaultStorage
					);
				} else {
					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.UpdateCertificate(
							option.caName,
							option.processCallback
						);
					});
				}
			};

			promiseSetPreEnv(option).then(function () {
				doUpdateCertificate();
			});
		},

		/**
		 * 공인/사설 인증서 폐기 함수
		 * @memberOf! IniSafeCrossWebEx#
		 * @param {Object}		option						인증서 폐기 시 사용되는 옵션 Object
		 * @param {String}		option.serial				인증서 시리얼 번호
		 * @param {Function}	option.processCallback    	인증서 폐기 콜백함수
		 * @returns 리턴없음
		 */
		revokeCertificate: function (option) {

			option = mergeOption(option);

			var doRevokeCertificate = function () {
				if (option.isHtml5) {
					Html5Adaptor.RevokeCertificate(
						option.caName,
						option.serial,
						option.processCallback,
						option.defaultStorage
					);
				} else {
					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.RevokeCertificate(
							option.caName,
							option.serial,
							option.processCallback
						);
					});
				}
			};

			promiseSetPreEnv(option).then(function () {
				doRevokeCertificate();
			});
		},

		/**
		 * 공인/사설 인증서를 관리 하는 함수
		 * @memberOf! IniSafeCrossWebEx#
		 * @param {Object}		option		인증서 관리에 사용될 옵션 Object
		 * @param {String}		option.taskNm				인증서 관리 메뉴 개별 선택 (only html5)
		 * @param {Function}	option.processCallback    	인증서 관리 처리 결과를 받는 콜백함수
		 * @returns 리턴없음
		 */
		openCertManager: function (option) {

			option = mergeOption(option);

			var doOpenCertManager = function () {
				if (option.isHtml5) {
					Html5Adaptor.CertManagerWithForm(option.taskNm, option.processCallback, option.defaultStorage);
				} else {
					// 설치 체크 및 정책 설정 대기
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.ManageCert(option.processCallback);
					});
				}
			};

			promiseSetPreEnv(option).then(function () {
				doOpenCertManager();
			});
		},

		/**
		 * 기기간 인증서 가져오기
		 * @memberOf! IniSafeCrossWebEx#
		 *
		 * @param {Object}		option			인증서 가져오기 시 사용되는 옵션 Object
		 * @param {String}		option.version	중계 서버 버전
		 * @param {function}	callback		결과 콜백 (version 1.2 only)
		 * 
		 * @returns 리턴없음
		 */
		importCert: function (option, callback) {

			option = mergeOption(option);

			if ('undefined' === typeof option.version)
				return;

			var doImportCert = function () {
				if ("1.1" === option.version) {

					if (option.isHtml5) {
						Html5Adaptor.CertImportV11WithForm();
					} else {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.CertImportV11WithForm();
						});
					}
				} else if ("1.2" === option.version) {

					if (option.isHtml5) {
						Html5Adaptor.CertImportV12WithForm(option, callback);
					} else {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.CertImportV12WithForm();
						});
					}
				} else if ("1.3" === option.version) {
					if (option.isHtml5) {
						Html5Adaptor.CertImportV13WithForm(option, callback);
					} else {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.CertImportV13WithForm();
						});
					}
				}
			};

			promiseSetPreEnv(option).then(function () {
				doImportCert();
			});
		},

		/**
		 * 기기간 인증서 내보내기
		 * @memberOf! IniSafeCrossWebEx#
		 * 
		 * @param {Object}		option			기기간 인증서 내보내기 시 사용되는 옵션 Object
		 * @param {String}		option.version	버전
		 * @param {function}	callback		결과 콜백 (version 1.2 only)
		 * 
		 * @returns 리턴없음
		 */
		exportCert: function (option, callback) {

			option = mergeOption(option);

			if ('undefined' === typeof option.version)
				return;

			var doExportCert = function () {
				if ("1.1" === option.version) {

					if (option.isHtml5) {
						Html5Adaptor.CertExportV11WithForm();
					} else {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.CertExportV11WithForm();
						});
					}
				} else if ("1.2" === option.version) {
					if (option.isHtml5) {
						Html5Adaptor.CertExportV12WithForm(option, callback);
					} else {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.CertExportV12WithForm();
						});
					}
				} else if ("1.3" === option.version) {
					if (option.isHtml5) {
						Html5Adaptor.CertExportV13WithForm(option, callback);
					} else {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.CertExportV13WithForm();
						});
					}
				}
			};

			promiseSetPreEnv(option).then(function () {
				doExportCert();
			});
		},

		/**
		 * QR Code를 이용하여 INIHUB APP으로 인증서 내보내기
		 * @memberOf! IniSafeCrossWebEx#
		 *
		 * @param {Object}		option			인증서 내보내기 시 사용되는 옵션 Object
		 * @param {function}	callback		결과 콜백
		 * 
		 * @returns 리턴없음
		 */
		exportToInihub: function (option, callback) {
			if (option.isHtml5 !== true) {
				// inihub로 인증서 내보내기는 QR을 생성해야 하므로 HTML5만 지원한다.
				alert("Not support");
				return;
			}

			var doExportCertToInihub = function () {
				Html5Adaptor.CertExportInihubWithForm(option, callback);
			}

			var dummyTime = "?dt=" + (new Date()).getTime();
			if (typeof QRCode === 'undefined') {
				utils.Transfer.loadjs(Html5Adaptor.GetDefaultConf().InihubStorage.qr_url + dummyTime, function (qrcode_res) {
					if (qrcode_res) {
						// success
						promiseSetPreEnv(option).then(function () {
							doExportCertToInihub();
						});
					} else {
						utils.Log.error("Failed to load: qrcode.min.js");
						messageDialog.INI_ALERT(msgFactory.getMessageFactory().Error.ERR_2009);
					}
				});
			} else {
				promiseSetPreEnv(option).then(function () {
					doExportCertToInihub();
				});
			}
		},

		/**
		 * 브라우저간 인증서 가져오기
		 * @memberOf! IniSafeCrossWebEx#
		 *
		 * @param {Object}		option			브라우저간 인증서 가져오기 시 사용되는 옵션 Object
		 * @param {String}		option.version	버전
		 * @param {function}	callback		결과 콜백 (version 1.2 only)
		 * 
		 * @returns 리턴없음
		 */
		importBrowserWebCert: function (option, callback) {

			option = mergeOption(option);

			if ('undefined' === typeof option.version)
				return;

			var doImportCert = function () {
				if ("1.1" === option.version) {

					if (option.isHtml5) {
						Html5Adaptor.CertImportV11WithForm();
					} else {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.CertImportV11WithForm();
						});
					}
				} else if ("1.2" === option.version) {

					if (option.isHtml5) {
						Html5Adaptor.CertImportBrowserV12WithForm(option, callback);
					} else {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.CertImportV12WithForm();
						});
					}
				}
			};

			promiseSetPreEnv(option).then(function () {
				doImportCert();
			});
		},

		/**
		 * 브라우저간 인증서 내보내기
		 * @memberOf! IniSafeCrossWebEx#
		 *
		 * @param {Object}		option			브라우저간 인증서 내보내기 시 사용되는 옵션 Object
		 * @param {String}		option.version	버전
		 * @param {function}	callback		결과 콜백 (version 1.2 only)
		 * 
		 * @returns 리턴없음
		 */
		exportBrowserWebCert: function (option, callback) {

			option = mergeOption(option);

			if ('undefined' === typeof option.version)
				return;

			var doExportCert = function () {
				if ("1.1" === option.version) {

					if (option.isHtml5) {
						Html5Adaptor.CertExportV11WithForm();
					} else {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.CertExportV11WithForm();
						});
					}
				} else if ("1.2" === option.version) {

					if (option.isHtml5) {
						Html5Adaptor.CertExportBrowserV12WithForm(option, callback);
					} else {
						// 설치 체크 및 정책 설정 대기
						cwModuleSetPropertyWait(function () {
							CrossWebExWeb6.CertExportV12WithForm();
						});
					}
				}
			};

			promiseSetPreEnv(option).then(function () {
				doExportCert();
			});
		},

		/**
		 * INI-HuB APP or Mobile Web에서 PC로 인증서 내보내기 구현시 호출
		 * @memberOf! IniSafeCrossWebEx#
		 * 
		 * @param {String}		pubKey			INI-HuB APP 인증서 내보내기 시 사용되는 공개 키
		 * @param {function}	callback		결과 콜백 (version 1.2 only)
		 * @returns 리턴없음
		 */
		exportInihubCert: function (pubKey, callback) {
			Html5Adaptor.CertExportInihubV12WithForm(pubKey, callback);
		},

		/**
		 * 금결원(yessign) 클라우드에 저장된 인증서 가져오기 (클라우드 > 로컬)
		 * @memberOf! IniSafeCrossWebEx#
		 *
		 * @param {Object}		option						클라우드에서 인증서 가져오기 시 사용되는 옵션 Object
		 * @param {Object}		option.filterCertOU			금결원 3년짜리 인증서만 리스트 창에 보이게 하는 설정
		 * @param {Boolean}		option.filterCertOU.enable	필터 사용 여부		
		 * @param {String}		option.filterCertOU.list	"personalB|corporation4ECB"
		 * @param {Function}	option.processCallback		클라우드에서 인증서 가져오기 처리 결과를 받는 콜백함수
		 * @returns 리턴없음
		 */
		importCloudCert: function (option) {
			// 옵션 머지
			option = mergeOption(option);
			// 클라우드 인증서 가져오기
			promiseSetPreEnv(option).then(function () {
				Html5Adaptor.ImportCloudCert(option.processCallback);
			});
			
		},

		/**
		 * 금결원(yessign) 클라우드로 인증서 내보내기 (로컬 > 클라우드)
		 * @memberOf! IniSafeCrossWebEx#
		 *
		 * @param {Objet}	 	option					클라우드로 인증서를 내보낼 때 사용되는 옵션 Object
		 * @param {Function}	option.processCallback	클라우드에 인증서 내보낸 처리 결과를 받는 콜백함수
		 * 
		 * @returns 리턴없음
		 */
		exportCloudCert: function (option) {
			// 옵션 머지
			option = mergeOption(option);
			// 클라우드 인증서 내보내기
			promiseSetPreEnv(option).then(function () {
				Html5Adaptor.ExportCloudCert(option.processCallback);
			});
		},

		/**
		 * 금결원(yessign) 클라우드 서비스 사용 설정
		 * @memberOf! IniSafeCrossWebEx#
		 *
		 * @param {String} use	클라우드 서비스 사용 여부 설정 : "Y", "N", (설정 값 없으면 '사용함'으로 설정 됨)
		 * @returns 리턴없음
		 */
		setUseCloudservice: function (use) {
			if(use){
				Html5Adaptor.setUseOpenstorage(use);
			}
			else{
				Html5Adaptor.setUseOpenstorage("Y");
			}
			
		},

		/**
		 * 비밀번호 재입력 제한 횟수가 초과 된 인증서 정보를 취득하는 함수
		 * @memberOf! IniSafeCrossWebEx#
		 *
		 * @param {Object}		option	옵션 Object
		 * @param {Function}	option.processCallback		재시도 횟수 초과 된 인증서를 처리하기 위한 콜백함수
		 * @returns 리턴없음
		 */
		getOverRetryCertInfo: function (option) {
			option = mergeOption(option);

			var doGetOverRetryCertInfo = function () {
				if(option.isHtml5) {
					Html5Adaptor.getOverRetryCertInfo(option.processCallback);
				} else {
					cwModuleSetPropertyWait(function () {
						CrossWebExWeb6.ExtendMethod("GetLastWrongPasswordCount", "", function(result) {
							var wrongCnt = result;
							CrossWebExWeb6.ExtendMethod("GetOverWrongCertInfo","", function(result) {
								var wrongCert = {};
								wrongCert[result] = wrongCnt;

								option.processCallback(wrongCert);
							});
						});
					});
				}
			};

			promiseSetPreEnv(option).then(function () {
				doGetOverRetryCertInfo();
			});
		},

		/************************************************************
		 * @brief		정책 설정
		 * @param		option.name					이름
		 * @param		option.value				값
		 * @param		option.processCallback		콜백함수
		 ************************************************************/
		setProperty: function (option) {

			option = mergeOption(option);

			if (false == option.isHtml5) {
				// 설치 체크 및 정책 설정 대기
				cwModuleSetPropertyWait(function () {
					CrossWebExWeb6.SetProperty(option.name, option.value, option.processCallback);
				});
			}
		},

		/************************************************************
		 * @brief		프로세스 공유 속성 설정
		 * @param		option.name					이름
		 * @param		option.value				값
		 * @param		option.processCallback		콜백함수
		 ************************************************************/
		setSharedAttribute: function (option) {

			option = mergeOption(option);

			if (false == option.isHtml5) {
				// 설치 체크 및 정책 설정 대기
				cwModuleSetPropertyWait(function () {
					CrossWebExWeb6.setSharedAttribute(option.name, option.value, option.processCallback);
				});
			}
		},

		/************************************************************
		 * @brief		확장 함수
		 * @param		option.name					이름
		 * @param		option.value				값
		 * @param		option.processCallback		콜백함수
		 ************************************************************/
		extendMethod: function (option) {

			option = mergeOption(option);

			if (false === option.isHtml5) {
				// 설치 체크 및 정책 설정 대기
				cwModuleSetPropertyWait(function () {
					CrossWebExWeb6.ExtendMethod(option.name, option.value, option.processCallback);
				});
			}
		},

		/************************************************************
		 * @brief		파일 선택
		 * @param		option.filePath				선택 파일 경로
		 ************************************************************/
		selectFile: function (option) {

			option = mergeOption(option);

			if (false === option.isHtml5) {
				// 설치 체크 및 정책 설정 대기
				cwModuleSetPropertyWait(function () {
					CrossWebExWeb6.SelFile(option.filePath);
				});
			}
		},

		/************************************************************
		 * @brief		암호화 파일 업로드
		 * @param		option.url					업로드 URL
		 * @param		option.form					?
		 * @param		option.processCallback		콜백함수
		 ************************************************************/
		uploadEncFile: function (option) {

			option = mergeOption(option);

			if (false === option.isHtml5) {
				// 설치 체크 및 정책 설정 대기
				cwModuleSetPropertyWait(function () {
					CrossWebExWeb6.EncFile(
						option.url,
						option.form,
						option.processCallback
					);
				});
			}
		},

		/************************************************************
		 * @brief		암호화 파일 다운로드
		 * @param		option.url					다운로드 URL
		 * @param		option.args					?
		 * @param		option.processCallback		콜백함수
		 ************************************************************/
		downloadEncFile: function (option) {

			option = mergeOption(option);

			if (false === option.isHtml5) {
				// 설치 체크 및 정책 설정 대기
				cwModuleSetPropertyWait(function () {
					CrossWebExWeb6.EncDown(
						option.url,
						option.args,
						option.processCallback
					);
				});
			}
		},

		/************************************************************
		 * @brief		사설 인증서 발급 v6
		 * @param		option.frm					?
		 * @param		option.processCallback		콜백함수
		 ************************************************************/
		 issueCertificate_INITECHv6: function (option) {

			option = mergeOption(option);

			
			if (false === option.isHtml5) {
				// 설치 체크 및 정책 설정 대기
				cwModuleSetPropertyWait(function () {
					CrossWebExWeb6.INITECHCA_IssueCertificate_v6(
						option.frm,
						option.processCallback
					);
				});
			}
			
		},

		/************************************************************
		 * @brief		사설 인증서 발급
		 * @param		option.frm					?
		 * @param		option.processCallback		콜백함수
		 ************************************************************/
		requestCert: function (option) {

			option = mergeOption(option);

			if (false === option.isHtml5) {
				// 설치 체크 및 정책 설정 대기
				cwModuleSetPropertyWait(function () {
					CrossWebExWeb6.CertRequest(
						option.frm,
						option.processCallback
					);
				});
			}
		},

		/************************************************************
		 * @brief		사용자 인증서 추가
		 * @param		option.cert					?
		 * @param		option.processCallback		콜백함수
		 ************************************************************/
		insertUserCert: function (option) {

			option = mergeOption(option);

			if (false === option.isHtml5) {
				// 설치 체크 및 정책 설정 대기
				cwModuleSetPropertyWait(function () {
					CrossWebExWeb6.InsertUserCert(
						option.cert,
						option.processCallback
					);
				});
			}
		},

		/************************************************************
		 * @brief		사용자 인증서 삭제
		 * @param		option.cert					?
		 * @param		option.processCallback		콜백함수
		 ************************************************************/
		deleteUserCert: function (option) {

			option = mergeOption(option);

			if (false === option.isHtml5) {
				// 설치 체크 및 정책 설정 대기
				cwModuleSetPropertyWait(function () {
					CrossWebExWeb6.DeleteUserCert(
						option.cert,
						option.processCallback
					);
				});
			}
		},

		/************************************************************
		 * @brief		인증서 추가
		 * @param		option.processCallback		콜백함수
		 ************************************************************/
		insertCertToMS: function (option) {

			option = mergeOption(option);

			if (false === option.isHtml5) {
				// 설치 체크 및 정책 설정 대기
				cwModuleSetPropertyWait(function () {
					CrossWebExWeb6.InsertCerttoMS(
						option.processCallback
					);
				});
			}
		},

		/************************************************************
		 * @brief		HTML5 인터페이스 호출
		 * @param		option.params				HTML5 인터페이스 파라미터
		 * @param		option.processCallback		콜백함수
		 ************************************************************/
		requestCmd: function (option) {

			// 설치 체크 대기
			cwModuleInstallCheck(function () {
				CrossWebExWeb6.CWEXRequestCmd(
					option.params,
					option.processCallback
				);
			});
		},

		/************************************************************
		 * @brief		버전 취득
		 * @param		option.processCallback		콜백함수
		 ************************************************************/
		getVersion: function (option) {

			// 설치 체크 대기
			cwModuleInstallCheck(function () {
				CrossWebExWeb6.GetVersion(
					option.processCallback
				);
			});
		},

		/************************************************************
		 * @brief		INIWEBEX 모듈로드 확인
		 * @param		callback		콜백함수
		 ************************************************************/
		/**
		 * IniSafeCrossWebEx 관련 스크립트 및 3rd party 모듈 로드 완료 확인 함수
		 * @memberOf! IniSafeCrossWebEx#
		 *
		 * @param {Function} callback	IniSafeCrossWebEx 모듈 로드가 완료되면 처리 할 콜백 함수
		 * @returns 리턴없음
		 */
		isReady: function (callback) {

			var waitLoad = function () {
				if (true === GINI_DYNAMIC_LOAD.isCompleted() && true === GINI_DYNAMIC_LOAD.isThirdPartyCompleted()) {
					if (callback)
						callback();
				} else {
					setTimeout(function () {
						waitLoad();
					}, 100);
				}
			};
			waitLoad();
		}

	};

	return Func;

}();

var INIWEBEX = new IniSafeCrossWebEx();
