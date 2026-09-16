/************************************************************
 * @brief		설치 체크		
 ************************************************************/
var CROSSWEBEX_INSTALL = {
	installWindow: null,
	cwInstallCallback: "",

	/************************************************************
	 * @brief		설치 체크		
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	cwInstallCheck: function (callback) {
		exlog("cwInstallCheck", "start");
		CROSSWEBEX_INSTALL.cwInstallCallback = callback;
		if (CROSSWEBEX_UTIL.getBrowserInfo().bit == "64") {
			crosswebexInfo.exModuleName = "crosswebex64";
		}
		CROSSWEBEX_CHECK.check([crosswebexInfo], CROSSWEBEX_INSTALL.cwInstallCheckCallback);
		exlog("cwInstallCheck", "end");
	},

	/************************************************************
	 * @brief		설치 체크 콜백
	 * @param[in]	check			설치 체크 결과
	 ************************************************************/
	cwInstallCheckCallback: function (check) {
		exlog("cwInstallCheckCallback", "start");
		if (check.status) {
			if (CROSSWEBEX_INSTALL.cwInstallCallback) {
				var callback = CROSSWEBEX_INSTALL.cwInstallCallback;
				CROSSWEBEX_INSTALL.cwInstallCallback = "";
				callback(true);
			}
		} else {
			if (CROSSWEBEX_INSTALL.cwInstallCallback) {
				CROSSWEBEX_INSTALL.cwInstallCallback(false);
			}
			setTimeout(function() {
				CROSSWEBEX_CHECK.check([crosswebexInfo], CROSSWEBEX_INSTALL.cwInstallCheckCallback)
			}, 1000);
		}
		exlog("cwInstallCheckCallback", "end");
	},

	/************************************************************
	 * @brief		모듈 다운로드
	 * @param[in]	moduleName		모듈 이름
	 * @param[in]	type			모듈 타입
	 * @param[in]	url				모듈 다운로드 URL
	 ************************************************************/
	download: function (moduleName, type, url) {
		exlog("download", "start");

		var pluginInfo = {};
		for (var i = 0; i < CROSSWEBEX_CONST.pluginInfo.length; i++) {
			if (CROSSWEBEX_UTIL.getBrowserInfo().bit == "64") {
				if (moduleName == "crosswebex") moduleName = "crosswebex64";
			}
			if (CROSSWEBEX_CONST.pluginInfo[i].exModuleName == moduleName) {
				pluginInfo = CROSSWEBEX_CONST.pluginInfo[i];
				break;
			}
		}

		var dummyParam;

		// Extension
		if (type == "extension") {

			// 크롬
			if (CROSSWEBEX_UTIL.isChrome()) {
				if (!this.installWindow || this.installWindow.closed) {
					this.installWindow = window.open(pluginInfo.exExtensionInfo.exChromeExtDownURL);
					if (this.installWindow == null) {
						if ("undefined" !== typeof INI_ALERT) {
							INI_ALERT(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_009, "INFO"); // "우측 상단 팝업차단을 확인해주세요."
						} else {
							alert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_009); // "우측 상단 팝업차단을 확인해주세요."
						}
					}
				}

			// 파이어 폭스
			} else if (CROSSWEBEX_UTIL.isFirefox()) {
				if(CROSSWEBEX_UTIL.getBrowserVer() < 100) { 
					var params = {};
					dummyParam = "ver=" + pluginInfo.exExtensionInfo.exFirefoxExtVer;

					params[pluginInfo.exProtocolName + "_firefox"] = {
						URL: pluginInfo.exExtensionInfo.exFirefoxExtDownURL + "?" + dummyParam,
						IconURL: pluginInfo.exExtensionInfo.exFirefoxExtIcon
					};
					InstallTrigger.install(params);
				// [22.06.10] Namsu add - 이니라인 가이드에 따라서 firefox 100 이상 버전은 아래 코드로 대응	
				} else {
					dummyParam = "ver=" + pluginInfo.exExtensionInfo.exFirefoxExtVer; 
        			window.open(pluginInfo.exExtensionInfo.exFirefoxExtDownURL + "?" + dummyParam, "_self");
				} 

			// 오페라
			} else if (CROSSWEBEX_UTIL.isOpera()) {
				dummyParam = "ver=" + pluginInfo.exExtensionInfo.exOperaExtVer;
				window.open(pluginInfo.exExtensionInfo.exOperaExtDownURL + "?" + dummyParam, "_self");

			// 기타
			} else {
				if ("undefined" !== typeof INI_ALERT) {
					INI_ALERT(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_012, "INFO"); // "현재 브라우저는 extension 설치를 지원하지 않습니다."
				} else {
					alert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_012); // "현재 브라우저는 extension 설치를 지원하지 않습니다."
				}
			}
		}

		// Client
		if (type == "client") {
			var downURL = "";

			if (url) {
				downURL = url;
				window.open(downURL, "_self");
				return;
			}

			// 윈도우즈
			if (CROSSWEBEX_UTIL.isWin()) {
				var OSver = parseFloat(CROSSWEBEX_UTIL.getOSInfo().version);

				// 데몬 방식
				if (CROSSWEBEX_UTIL.typeDaemon()) {
					if(OSver <= 6) {
						// before vista
						downURL = pluginInfo.exProtocolInfo.exWinProtocolBeforeVistaDownURL;
					} else {
						// after Win7
						downURL = pluginInfo.exProtocolInfo.exWinProtocolDownURL;
					}

				// 확장 방식
				} else {
					if (CROSSWEBEX_UTIL.getBrowserBit() == "64") {
						downURL = pluginInfo.exProtocolInfo.exWin64ProtocolDownURL;
					} else {
						if(OSver <= 6) {
							// before vista
							downURL = pluginInfo.exProtocolInfo.exWinProtocolBeforeVistaDownURL;
						} else {
							// after Win7
							downURL = pluginInfo.exProtocolInfo.exWinProtocolDownURL;
						}
					}
				}

			// 맥
			} else if (CROSSWEBEX_UTIL.isMac()) {
				downURL = pluginInfo.exProtocolInfo.exMacProtocolDownURL;

			// 리눅스
			} else if (CROSSWEBEX_UTIL.isLinux()) {
				return;
			}

			// 다운로드 (IFrame 방식) 
			var CROSSWEBEX_FRAME = document.createElement("iframe");
			CROSSWEBEX_FRAME.setAttribute("name", "CROSSWEBEX_INSFRM");
			CROSSWEBEX_FRAME.setAttribute("id", "CROSSWEBEX_INSFRM");
			CROSSWEBEX_FRAME.setAttribute("title", "CROSSWEBEX_INSFRM");
			CROSSWEBEX_FRAME.setAttribute("style", "visibility:hidden;display:none");
			document.body.appendChild(CROSSWEBEX_FRAME);

			if (!CROSSWEBEX_UTIL.isIE()) {
				dummyParam = "ver=" + pluginInfo.exProtocolInfo.exWinProtocolVer;
				CROSSWEBEX_INSFRM.location.href = downURL + "?" + dummyParam;
			} else {
				CROSSWEBEX_INSFRM.location.href = downURL;
			}
		}

		exlog("download", "end");
	}
};
