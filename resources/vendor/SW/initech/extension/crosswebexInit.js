//////////////////////////////
// common vaiable
//////////////////////////////

var CW_STATUS_NOT_CHECKED = 0;			// 체크 안됨
var CW_STATUS_NOT_INSTALLED = 1;		// 설치 안됨
var CW_STATUS_INSTALLED = 2;			// 설치 됨
var CW_STATUS_NOT_INITIALIZED = 3;		// 초기화 안됨
var CW_STATUS_INITIALIZED = 4;			// 초기화 됨

var crosswebexInstallPath = crosswebexBaseDir + "/install/install.html";
var InstallModuleURL = window.location.protocol + "//" + window.location.host + crosswebexBaseDir + "/dll/INIS60.vcs";
var InstallModuleURL64 = window.location.protocol + "//" + window.location.host + crosswebexBaseDir + "/dll_64/INIS60.vcs";
var cwInitStatus = CW_STATUS_NOT_CHECKED;
var cwPCInfo = "";

/************************************************************
 * @brief		설치 체크 대기 (설치 체크 - 미설치시 팝업)
 * @param[in]	callback		설치 체크 대기 콜백 함수
 ************************************************************/
function cwModuleInstallCheck(callback) {
	exlog("cwModuleInstallCheck", "start");

	// 설치 체크 대기
	if (cwInitStatus < CW_STATUS_NOT_INSTALLED) {
		exlog("cwModuleInstallCheck", "waiting for checking installation");
		setTimeout(function () {
			cwModuleInstallCheck(callback);
		}, 1000);

	// 설치 체크 완료
	} else {
		// 설치 안됨
		if (cwInitStatus == CW_STATUS_NOT_INSTALLED) {
			exlog("cwModuleInstallCheck", "not installed");
			if ('function' === typeof callback) {
				callback(false);
			} else {
				//eval(callback)(false);
				var fn = ( new Function( 'return ' + callback ) )(); 
				fn(false);
			}
			cwShowInstallPage();
			// 설치 됨
		} else {
			exlog("cwModuleInstallCheck", "installed");

			if ('function' === typeof callback) {
				callback(true);
			} else {
				//eval(callback)(true);
				var fn = ( new Function( 'return ' + callback ) )(); 
				fn(true);
			}
		}
	}

	exlog("cwModuleInstallCheck", "end");
}

/************************************************************
 * @brief		설치 체크 대기 (설치 체크 - 미설치시 팝업 없음)
 * @param[in]	callback		설치 체크 대기 콜백 함수
 ************************************************************/
function cwModuleInstallCheckWithNoPopup(callback) {
	exlog("cwModuleInstallCheckWithNoPopup", "start");

	// 설치 체크 대기
	if (cwInitStatus < CW_STATUS_NOT_INSTALLED) {
		exlog("cwModuleInstallCheckWithNoPopup", "waiting for checking installation");
		setTimeout(function () {
			cwModuleInstallCheckWithNoPopup(callback);
		}, 1000);

	// 설치 체크 완료
	} else {
		// 설치 안됨
		if (cwInitStatus == CW_STATUS_NOT_INSTALLED) {
			exlog("cwModuleInstallCheck", "not installed");
			if ('function' === typeof callback) {
				callback(false);
			} else {
				//eval(callback)(false);
				var fn = ( new Function( 'return ' + callback ) )(); 
				fn(false);
			}
		// 설치 됨
		} else {
			exlog("cwModuleInstallCheck", "installed");
			if ('function' === typeof callback) {
				callback(true);
			} else {
				//eval(callback)(true);
				var fn = ( new Function( 'return ' + callback ) )(); 
				fn(true);
			}
		}
	}

	exlog("cwModuleInstallCheckWithNoPopup", "end");
}

/************************************************************
 * @brief		설치 체크 대기 (설치 체크 - 미설치시 팝업)
 * @param[in]	callback		설치 체크 대기 콜백 함수
 ************************************************************/
function cwModuleInstallWait(callback) {
	cwModuleInstallCheck(callback);
}

/************************************************************
 * @brief		설치 체크 대기 (설치 체크 - 미설치시 팝업 없음)
 * @param[in]	callback		설치 체크 대기 콜백 함수
 ************************************************************/
function cwModuleInstallWaitWithNoPopup(callback) {
	cwModuleInstallCheckWithNoPopup(callback);
}

// 정책 설정 진행 중 플래그
var cwSetPropertyInProgress = false;

/************************************************************
 * @brief		설치 체크 및 정책 설정 대기  (설치 체크 및 정책 설정, 미설치시 팝업)
 * @param[in]	callback		설치 체크 및 정책 설정 콜백 함수
 ************************************************************/
function cwModuleSetPropertyWait(callback) {
	exlog("cwModuleSetPropertyWait", "start");

	// 모듈 설치 체크 대기
	cwModuleInstallCheck(function (result) {
		// 모듈 설치 체크 오류
		if (!result) {
			return;
		}

		// 정책 설정 진행 중인 경우
		if (cwSetPropertyInProgress) {
			// 정책 설정 대기
			if (cwInitStatus < CW_STATUS_NOT_INITIALIZED) {
				setTimeout(function () {
					cwModuleSetPropertyWait(callback);
				}, 1000);
			} else {
				// 정책 설정 성공
				if (cwInitStatus == CW_STATUS_INITIALIZED) {
					if ('function' === typeof callback) {
						callback();
					} else {
						//eval(callback);
						var fn = ( new Function( 'return ' + callback ) )(); 
						fn();
					}
				}
			}
			return;
		}

		// 정책 설정 진행 중으로 설정
		cwSetPropertyInProgress = true;

		// 정책 설정
		cwInitSetProperty(function (result) {
			// 정책 설정 실패
			if (!result) {
				exlog("cwModuleSetPropertyWait", "not initialized");
				cwInitStatus = CW_STATUS_NOT_INITIALIZED;
				cwShowInstallPage();
			// 정책 설정 성공
			} else {
				exlog("cwModuleSetPropertyWait", "initialized");
				cwInitStatus = CW_STATUS_INITIALIZED;
				if ('function' === typeof callback) {
					callback();
				} else {
					//eval(callback);
					var fn = ( new Function( 'return ' + callback ) )(); 
					fn();
				}
			}
		});
	});

	exlog("cwModuleSetPropertyWait", "end");
}

/************************************************************
 * @brief		모듈 설치 상태 취득
 * @retval		CW_STATUS_NOT_CHECKED		체크 안됨
 * @retval		CW_STATUS_NOT_INSTALLED		설치 안됨
 * @retval		CW_STATUS_INSTALLED			설치 됨
 * @retval		CW_STATUS_NOT_INITIALIZED	초기화 안됨
 * @retval		CW_STATUS_INITIALIZED		초기화 됨
 ************************************************************/
function cwGetModuleInstallStatus() {
	return cwInitStatus;
}

var openedWindow = null;

/************************************************************
 * @brief		설치 페이지 표시
 ************************************************************/
function cwShowInstallPage() {
	exlog("cwShowInstallPage", "start");

	// 오픈하지 않은 경우
	if (openedWindow == null || openedWindow.closed) {
		var width = 600;
		var height = 400
		openedWindow = window.open(crosswebexInstallPath, "_blank", "toolbar=no, scrollbars=no, resizable=no," + 'top=' + (screen.availHeight - height) / 2 + ', left=' + (screen.availWidth - width) / 2 + ',width=' + width + ',height=' + height);

	// 오픈한 경우
	} else {
		openedWindow.focus();
	}

	exlog("cwShowInstallPage", "end");
}

/************************************************************
 * @brief		설치 확인
 ************************************************************/
function ModuleInstallCheck() {
	return cwInitStatus >= CW_STATUS_INSTALLED;
}

/************************************************************
 * @brief		초기화 비활성화
 ************************************************************/
function cwOnloadDisable() {
	exlog("cwOnloadDisable", "cwOnloadDisable is deprecated.");
}

// 초기화 진행 중 플래그
var cwInitializationInProgress = false;

/************************************************************
 * @brief		초기화 - 설치 체크
 ************************************************************/
function cwInitInstallCheck(callback) {
	// 설치 체크
	var promiseCheckInstall = function () {
		return new Promise(function (resolve, reject) {
			if (CROSSWEBEX_UTIL.getBrowserInfo().bit == "64") {
				crosswebexInfo.exModuleName = "crosswebex64";
			}
			CROSSWEBEX_CHECK.check([crosswebexInfo], function (check) {
				if (check.status) {
					resolve();
				} else {
					reject();
				}
			});
		});
	} 

	// 로딩
	var promiseLoading = function () {
		return new Promise(function (resolve, reject) {
			CROSSWEBEX_LOADING(function (result) {
				if (result) {
					resolve();
				} else {
					reject();
				}
			});
		});
	};

	// 정책 설정 - 인증서 캐쉬 공통 도메인 설정
	var promiseSetCacheUrl = function () {
		return new Promise(function (resolve, reject) {
			if (CROSSWEBEX_CS_POLICY.CACHE_URL) {
				CrossWebExWeb6.SetProperty("CACHE_URL", CROSSWEBEX_CS_POLICY.CACHE_URL, resolve);
			} else {
				resolve();
			}
		});
	};

	// 설치 체크
	promiseCheckInstall().then(function () {
		// 로딩
		return promiseLoading();
	}).then(function () {
		// 정책 설정 - 인증서 캐쉬 공통 도메인 설정
		return promiseSetCacheUrl();
	}).then(function () {
		// 설치 체크 성공
		if ('function' === typeof callback) {
			callback(true);
		} else {
			//eval(callback)(true);
			var fn = ( new Function( 'return ' + callback ) )(); 
			fn(true);
		}
	})["catch"](function () {
		// 설치 체크 오류
		if ('function' === typeof callback) {
			callback(false);
		} else {
			//eval(callback)(false);
			var fn = ( new Function( 'return ' + callback ) )(); 
			fn(false);
		}
	});
}

/************************************************************
 * @brief		초기화 - 정책 설정
 ************************************************************/
function cwInitSetProperty(callback) {
	// 모듈 설치
	var promiseInstallModule = function () {
		return new Promise(function (resolve, reject) {
			var callback = function (result) {
				if (result && result == "1") {
					resolve();
				} else {
					reject();
				}
			}
			if (CROSSWEBEX_UTIL.typeDaemon()) {
				CrossWebExWeb6.InstallModule(InstallModuleURL, callback);
			} else {
				if (CROSSWEBEX_UTIL.getBrowserBit() == "64") {
					CrossWebExWeb6.InstallModule(InstallModuleURL64, callback);
				} else {
					CrossWebExWeb6.InstallModule(InstallModuleURL, callback);
				}
			}
		});
	}

	// 정책 설정 - 64bit 라이선스 설정
	var promiseSetDomainLicence = function () {
		return new Promise(function (resolve, reject) {
			if (!CROSSWEBEX_UTIL.typeDaemon() && CROSSWEBEX_UTIL.getBrowserBit() == "64") {
				CrossWebExWeb6.SetProperty("DomainLicence", crosswebexInfo.lic_64bit, resolve);
			} else {
				resolve();
			}
		});
	};

	// 정책 설정 - 공인인증서 고도화 여부 default (0)
	var promiseSetUseCertMode = function () {
		return new Promise(function (resolve, reject) {
			CrossWebExWeb6.SetProperty("UseCertMode", CROSSWEBEX_CS_POLICY.UseCertMode, resolve);
		});
	};

	// 정책 설정 - 인증서 선택창의 이미지 변경
	var promiseSetLogoPath = function () {
		return new Promise(function (resolve, reject) {
			CrossWebExWeb6.SetLogoPath(CROSSWEBEX_CS_POLICY.logoPath, resolve);
		});
	};

	// 정책 설정 - 로그인창에서 페기/만료된인증서 표시여부 default (false)
	var promiseDisableInvalidCert = function () {
		return new Promise(function (resolve, reject) {
			CrossWebExWeb6.DisableInvalidCert(CROSSWEBEX_CS_POLICY.disableInvalidCert, resolve);
		});
	};

	// 정책 설정 - CA 인증서 로드 (CA 인증서 필터링)
	var promiseLoadCACert = function () {
		return new Promise(function (resolve, reject) {
			CrossWebExWeb6.LoadCACert(CROSSWEBEX_CS_POLICY.loadCACert, resolve);
		});
	};

	// 정책 설정 - 서버 인증서 로드
	var promiseLoadCert = function () {
		return new Promise(function (resolve, reject) {
			// [22.05.18] Namsu change - CROSSWEBEX_CS_POLICY.loadCert 값이 설정된 경우만 LoadCert 함수를 호출하도록 수정
			if ( CROSSWEBEX_CS_POLICY.loadCert ) {
				CrossWebExWeb6.LoadCert(CROSSWEBEX_CS_POLICY.loadCert, resolve);
			}
			else {
				resolve();
			}
		});
	}

	// 정책 설정
	var promiseSetPropertyEX = function () {
		return new Promise(function (resolve, reject) {
			var property = CROSSWEBEX_CS_POLICY.property;
			for (var prop in property) {
				CrossWebExWeb6.SetPropertyAdd(prop, property[prop]);
			}
			CrossWebExWeb6.SetPropertyEX(resolve);
		});
	};

	// 복호화
	var promiseIdecrypt = function () {
		return new Promise(function (resolve, reject) {
			// 암호화 블록이 있는 경우
			if (CrossWebExWeb6.getSpanEncElement()) {
				CrossWebExWeb6.IdecryptBlock(resolve);
			} else {
				resolve();
			}
		});
	};

	// 모듈 설치
	promiseInstallModule().then(function () {
		// 64bit 라이선스 설정
		return promiseSetDomainLicence();
	}).then(function () {
		// 공인인증서 고도화 여부
		return promiseSetUseCertMode();
	}).then(function () {
		// 인증서 선택창의 이미지 변경
		return promiseSetLogoPath();
	}).then(function () {
		// 로그인창에서 페기/만료된인증서 표시여부
		return promiseDisableInvalidCert();
	}).then(function () {
		// CA 인증서 로드
		return promiseLoadCACert();
	}).then(function () {
		// 서버 인증서 로드
		return promiseLoadCert();
	}).then(function () {
		// 정책 설정
		return promiseSetPropertyEX();
	}).then(function () {
		// 복호화
		return promiseIdecrypt();
	}).then(function () {
		// 정책 설정 완료
		if ('function' === typeof callback) {
			callback(true);
		} else {
			//eval(callback)(true);
			var fn = ( new Function( 'return ' + callback ) )(); 
			fn(true);
		}
	})["catch"](function () {
		// 정책 설정 에러
		if ('function' === typeof callback) {
			callback(false);
		} else {
			//eval(callback)(false);
			var fn = ( new Function( 'return ' + callback ) )(); 
			fn(false);
		}
	});
}


/************************************************************
 * @brief		초기화
 ************************************************************/
function cwInit(callback) {
	exlog("cwInit", "start");

	// inihub에서 정책 설정이 있는 경우 정책 설정을 한다.
	if ((typeof crosswebexPolicy !== "undefined") && crosswebexPolicy && crosswebexPolicy.lic_domain) {
		crosswebexInfo.lic_domain = crosswebexPolicy.lic_domain;
	}

	// 초기화 대기
	if (callback) {
		// 초기화는 본 스크립트 마지막에서 진행 중이므로
		// 초기화 완료 이벤트를 받아야 하는 업무에서 callback 을 지정해 주었을 경우에는
		// 초기화 완료 대기 후 해당 callback 을 호출하여 준다.
		cwModuleInstallWait(callback);

	// 초기화
	} else {
		// 초기화는 본 스크립트 마지막에서 진행 중이므로
		// 초기화 완료 이벤트를 받아야 하는 업무에서 callback 을 지정해 주지 않았을 경우에는
		// 초기화를 무시하도록 한다.

		// 초기화 진행 중인 경우 초기화 수행하지 않음
		if (cwInitializationInProgress) {
			exlog("cwInit in progress", "end");
			return;
		}

		// 초기화 진행 중으로 설정
		cwInitializationInProgress = true;

		// 설치 체크
		cwInitInstallCheck(function(result) {
			if (result) {
				cwInitStatus = CW_STATUS_INSTALLED;
			} else {
				cwInitStatus = CW_STATUS_NOT_INSTALLED;
			}
		});

		// ※ 초기화에서는 설치 체크만 하고 정책 설정은 하지 않는다.
		// ※ 클라이언트 함수 실행 시 정책 설정이 되어 있지 않은 경우 정책 설정을 하도록 한다.
	}

	exlog("cwInit", "end");
}

/************************************************************
 * @brief		에러 발생시 초기화
 ************************************************************/
function cwInitOnError(result) {
	exlog("cwInitOnError", "start");

	// [설치 안됨] 으로 설정
	cwInitStatus = CW_STATUS_NOT_INSTALLED;

	// 설치 페이지 표시
	cwShowInstallPage();

	exlog("cwInitOnError", "end");
}

// 에러 핸들러 설정
crosswebInterface.exCommonError = cwInitOnError;

/************************************************************
 * @brief		초기화 수행
 ************************************************************/
setTimeout(cwInit, 100);
