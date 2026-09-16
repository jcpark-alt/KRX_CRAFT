/************************************************************
 * @brief		CrossWeb EX Web6 서버 인터페이스
 ************************************************************/
var CrossWebExWeb6 = (function () {

	/************************************************************
	 * @brief		초기화 및 모듈 설치
	 * @param[in]	url				VCS URL
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function InstallModule(url, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (CROSSWEBEX_UTIL.isWin()) {
			crosswebInterface.InstallModule(url, callback);
		} else {
			if (callback) callback("1");
		}
	}

	/************************************************************
	 * @brief		인증서 캐쉬 초기화
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function InitCache(callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.InitCache(callback);
	}

	/************************************************************
	 * @brief		세션 재설정
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function ReSession(callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.ReSession(callback);
	}

	/************************************************************
	 * @brief
	 * @param[in]	time1
	 * @param[in]	time2
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function SetVerifyNegoTime(time1, time2, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (CROSSWEBEX_UTIL.isWin()) {
			crosswebInterface.SetVerifyNegoTime(time1, time2, callback);
		} else {
			if (callback) callback();
		}
	}
	
	/************************************************************
	 * @brief		정책 삭제 함수
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function ErasePolicy(callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (CROSSWEBEX_UTIL.isWin()) {
			crosswebInterface.ErasePolicy(callback);
		} else {
			if (callback) callback();
		}
	}

	/************************************************************
	 * @brief		CA 인증서 로드
	 * @param[in]	cert			CA 인증서
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function LoadCACert(cert, callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.LoadCACert(cert, callback);
	}

	/************************************************************
	 * @brief		로고 이미지 설정
	 * @param[in]	logoUrl			로고 이미지 URL
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function SetLogoPath(logoUrl, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (CROSSWEBEX_UTIL.isWin()) {
			crosswebInterface.SetLogoPath(logoUrl, callback);
		} else {
			crosswebInterface.SetProperty("SetLogoPath", logoUrl, callback);
		}
	}

	/************************************************************
	 * @brief
	 * @param[in]	gap
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function SetCacheTime(gap, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (CROSSWEBEX_UTIL.isWin()) {
			crosswebInterface.SetCacheTime(gap, callback);
		} else {
			crosswebInterface.SetProperty("SetCacheTime", gap, callback);
		}
	}

	/************************************************************
	 * @brief
	 * @param[in]	check
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function EnableCheckCRL(check, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (CROSSWEBEX_UTIL.isWin()) {
			crosswebInterface.EnableCheckCRL(check, callback);
		} else {
			var val;
			if (check) val = "true";
			else val = "false";
			crosswebInterface.SetProperty("EnableCheckCRL", val, callback);
		}
	}

	/************************************************************
	 * @brief
	 * @param[in]	check
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function DisableInvalidCert(check, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (CROSSWEBEX_UTIL.isWin()) {
			crosswebInterface.DisableInvalidCert(check, callback);
		} else {
			var val;
			if (check) val = "true";
			else val = "false";
			crosswebInterface.SetProperty("DisableInvalidCert", val, callback);
		}
	}

	/************************************************************
	 * @brief		정책 설정
	 * @param[in]	name			이름
	 * @param[in]	value			값
	 * @param[in]	callback		콜백함수
	 ************************************************************/
	function SetProperty(name, value, callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.SetProperty(name, value, callback);
	}

	/************************************************************
	 * @brief		정책 추가
	 * @param[in]	name			이름
	 * @param[in]	value			값
	 ************************************************************/
	var SetPropertyInfo = [];
	function SetPropertyAdd(name, value) {
		exlog("SetPropertyAdd", "[" + name + "," + value + "]");
		SetPropertyInfo.push([name, value]);
	}

	/************************************************************
	 * @brief		정책 실행
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function SetPropertyEX(callback) {
		if (SetPropertyInfo && SetPropertyInfo.length > 0) {
			SetPropertyArr(SetPropertyInfo, callback);
			SetPropertyInfo = [];
		} else {
			exlog("SetPropertyEX", "need array");
			exalert("SetPropertyEX", "need array");
		}
	}

	/************************************************************
	 * @brief		정책 실행
	 * @param[in]	params			파라미터
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function SetPropertyArr(params, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (!params) {
			exlog("SetPropertyArr", "params not exist");
			exalert("SetPropertyArr", "params not exist");
		} else {
			if (!params instanceof Array) {
				exlog("SetPropertyArr", "params Array type");
				exalert("SetPropertyArr", "params Array type");
			} else {
				crosswebInterface.SetPropertyEX(params, callback);
			}
		}
	}

	/************************************************************
	 * @brief		정책 취득
	 * @param[in]	name			이름
	 * @param[in]	callback		콜백함수
	 ************************************************************/
	function GetProperty(name, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (callback) {
			crosswebInterface.GetProperty(name, callback);
		} else {
			exalert("GetProperty", "callback function not defined");
		}
	}

	/************************************************************
	 * @brief		URL 인코드
	 * @param[in]	data			데이터
	 ************************************************************/
	function URLEncode(data) {
		if (!data) return "";
		if (!crosswebexInfo.isInstalled) {
			return encodeURI(data);
		}
		//crosswebInterface.URLEncode(data, callback);
		return encodeURIComponent(data);
	}

	/************************************************************
	 * @brief		URL 디코드
	 * @param[in]	data			데이터
	 * @param[in]	callback		콜백함수
	 ************************************************************/
	function URLDecode(data, callback) {
		if (!data) return "";
		if (!crosswebexInfo.isInstalled) return;
		if (callback) {
			if (CROSSWEBEX_UTIL.isWin()) {
				crosswebInterface.ExtendMethod("URLDecode", data, callback);
			} else {
				crosswebInterface.URLDecode(data, callback);
			}
		} else {
			exalert("URLDecode", "callback function not defined");
		}
	}

	/************************************************************
	 * @brief
	 * @param[in]	name			이름
	 * @param[in]	value			값
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function ICCSetOption(name, value, callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.ICCSetOption(name, value, callback);
	}

	/************************************************************
	 * @brief		인증서 내보내기
	 * @param[in]	url				인증서 내보내기 URL
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function ICCSendCert(url, callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.ICCSendCert(url, callback);
	}

	/************************************************************
	 * @brief		인증서 가져오기
	 * @param[in]	url				인증서 가져오기 URL
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function ICCRecvCert(url, callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.ICCRecvCert(url, callback);
	}

	/************************************************************
	 * @brief
	 * @param[in]	form
	 * @param[in]	start
	 * @param[in]	bErase
	 ************************************************************/
	function GatherValue(form, start, bErase) {

		var strResult = "";
		var len = form.elements.length;
		for (i = start; i < len; i++) {
			try {
				var element = form.elements[i];
				var name, value;

				if (!element.name && !element.id) continue;
				if (element.name == "INIpluginData") continue;
				if (element.name == "filedata") continue;
				if ((element.type == "button") || (element.type == "reset") || (element.type == "submit")) continue;
				if (((element.type == "radio") || (element.type == "checkbox")) && (element.checked != true)) continue;
				if (element.name.indexOf('file_', 0) >= 0) continue;
				if (element.name.indexOf('_shttp_client_', 0) >= 0) continue;
				if (element.name.indexOf('Encrypted_', 0) >= 0) continue;
				if (element.type == "select-one") {
					var sel = element.selectedIndex;
					if (sel < 0) continue;
					value = element.options[sel].value;
					if (bErase) element.selectedIndex = -1;
				} else {
					value = element.value;
					if (bErase) element.value = "";
				}
				if ((element.type == "checkbox") && (bErase)) element.checked = false;

				name = element.name ? element.name : element.id;
				if (name) {
					if (strResult != "") strResult += "&";
					strResult += URLEncode(name);
					strResult += "=";
					strResult += URLEncode(value);
				}
			} catch (e) {
				exlog("GatherValue error : ", e);
			}
		}
		return strResult;
	}

	/************************************************************
	 * @brief
	 * @param[in]	form
	 * @param[in]	start
	 * @param[in]	bErase
	 ************************************************************/
	function GatherFileValue(form, start, bErase) {
		var strResult = "";
		var len = form.elements.length;

		for (i = start; i < len; i++) {
			try {
				var element = form.elements[i];
				var name, value;

				if (!element.name && !element.id) continue;
				if (element.name == "INIpluginData") continue;
				if (element.name == "filedata") continue;
				if ((element.type == "button") || (element.type == "reset") || (element.type == "submit")) continue;
				if (((element.type == "radio") || (element.type == "checkbox")) && (element.checked != true)) continue;
				if (element.name.indexOf('_shttp_client_', 0) >= 0) continue;
				if (element.name.indexOf('Encrypted_', 0) >= 0) continue;

				value = element.value;
				if (bErase) element.value = "";

				name = element.name ? element.name : element.id;

				if (name.indexOf('file_', 0) >= 0) {
					if (strResult != "") strResult += "&";
					strResult += URLEncode(name);
					strResult += "=";
					strResult += URLEncode(value);
				}

			} catch (e) {
				exlog("GatherFileValue error : ", e);
			}
		}

		return strResult;
	}

	/************************************************************
	 * @brief
	 * @param[in]	data
	 * @param[in]	delimiter
	 ************************************************************/
	function SplitValue(data, delimiter) {

		var strResult = "";
		var paramArr = [];
		var dataSplitArr;
		if (!delimiter) {
			dataSplitArr = data.split("&");
		} else {
			cwDelimiter = delimiter;
			dataSplitArr = data.split(delimiter);
		}

		if (dataSplitArr.length > 0) {
			for (var i = 0; i < dataSplitArr.length; i++) {
				var divideParam = dataSplitArr[i].split("=");
				if (strResult != "") strResult += "&";
				strResult += URLEncode(divideParam[0]);
				strResult += "=";
				strResult += URLEncode(divideParam[1]);
			}
			return strResult;
		} else {
			if ("undefined" !== typeof INI_ALERT) {
				INI_ALERT("input data not formed get data", "ERROR");
			}
			else {
				alert("input data not formed get data");
			}
		}
	}

	/************************************************************
	 * @brief		UTF-8 decoding params -> euc-kr encoding params
	 * @param[in]	str
	 * @param[in]	exceptStr
	 ************************************************************/
	function iniConvert(str, exceptStr) {
		var result = "";
		var strArr = str.split("&");
		for (var i = 0; i < strArr.length; i++) {
			var decTmpStr = "";
			var tmpStr = strArr[i];
			var tmpStrArr = tmpStr.split("=");
			if (tmpStrArr.length > 1) {
				if (exceptStr && tmpStrArr[0] == exceptStr) {
					decTmpStr = "";
				} else {
					decTmpStr = iniURLEncode(decodeURIComponent(tmpStrArr[0])) + "=";
					decTmpStr += iniURLEncode(decodeURIComponent(tmpStrArr[1]));
				}
			} else {
				decTmpStr = iniURLEncode(decodeURIComponent(tmpStrArr[0]));
			}

			if (i == 0) {
				result = decTmpStr;
			} else {
				if (result) {
					result += "&" + decTmpStr;
				} else {
					result = decTmpStr;
				}
			}
		}
		return result;
	}

	/************************************************************
	 * @brief		euc-kr parameter split encoding
	 * @param[in]	data
	 ************************************************************/
	function iniSplitEncode(data) {
		var strResult = "";
		var dataSplitArr = data.split("&");
		for (var i = 0; i < dataSplitArr.length; i++) {
			var divideParam = dataSplitArr[i].split("=");
			if (strResult != "") strResult += "&";
			strResult += iniURLEncode(divideParam[0]);
			strResult += "=";
			strResult += iniURLEncode(divideParam[1]);
		}
		return strResult;
	}

	/************************************************************
	 * @brief		utf-8 encoding params -> euc-kr encoding params convert
	 * @param[in]	signData
	 * @param[in]	signParamName
	 ************************************************************/
	function convertEncode7(signData, signParamName) {
		exlog("convertEncode7.signData", signData);
		var decSignData = iniConvert(signData, signParamName);
		exlog("convertEncode7.decSignData", decSignData);

		var signParamValue = "";
		if (signParamName) {
			var decSignDataArr = signData.split("&");
			for (var i = 0; i < decSignDataArr.length; i++) {
				var tmpStr = decSignDataArr[i];
				var tmpStrArr = tmpStr.split("=");
				if (tmpStrArr.length > 1) {
					if (tmpStrArr[0] == signParamName) {
						signParamValue = iniConvert(decodeURIComponent(tmpStrArr[1]));
						break;
					}
				}
			}
			exlog("convertEncode7." + signParamName, signParamName + "=" + signParamValue);
		}

		var encSignData = "";
		if (signParamName) {
			encSignData = signParamName + "=" + iniURLEncode(signParamValue);
			encSignData = encSignData + "&" + decSignData;
		} else {
			encSignData = decSignData;
		}
		exlog("convertEncode7.encSignData", encSignData);
		return encSignData;
	}

	/************************************************************
	 * @brief
	 * @param[in]	cert
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function ViewCert(cert, callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.ViewCert(cert, callback);
	}

	/************************************************************
	 * @brief		서버 인증서 로드
	 * @param[in]	cert			서버 인증서
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function LoadCert(cert, callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.LoadCert(cert, callback);
	}

	/************************************************************
	 * @brief		데이터 복호화
	 * @param[in]	data			데이터
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	var iDecryptCallbackFn = [];
	function Idecrypt(data, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (callback) {
			iDecryptCallbackFn.push(callback);
			crosswebInterface.Decrypt(cipher, data, "CrossWebExWeb6.IdecryptCallback");
		} else {
			exalert("Idecrypt", "callback function not defined");
		}
	}

	/************************************************************
	 * @brief		데이터 복호화 콜백 함수
	 * @param[in]	data			데이터
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function IdecryptCallback(result) {
		if (iDecryptCallbackFn.length > 0) {
			try {
				var retCb = iDecryptCallbackFn[0];
				iDecryptCallbackFn.splice(0, 1);
				retCb(result);
			} catch (e) {
				exlog("IdecryptCallback", "Idecrypt exception : " + e);
			}
		}
	}

	/************************************************************
	 * @brief		암호화된 SPAN 요소 취득
	 * @retval		object			암호화된 SPAN 요소
	 ************************************************************/
	function getSpanEncElement() {
		var spans = document.getElementsByTagName("span");
		var encSpans = [];
		for (var i = 0; i < spans.length; i++) {
			var spanObj = spans[i];
			if (spanObj.getAttribute("name") == CrossWebSpanTag) {
				return spanObj;
			}
		}
		return null;
	}

	/************************************************************
	 * @brief		블록 복호화
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	var idecInfo = {};
	function IdecryptBlock(callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (callback) idecInfo.callback = callback;

		var spanObj = getSpanEncElement();
		if (spanObj) {
			var encData = spanObj.innerHTML;
			encData = encData.replace(/\n/g, "");
			encData = encData.replace("//<!--[CDATA[", "");
			encData = encData.replace("//]]-->", "");
			encData = encData.replace(/\\n/gi, "\n");
			crosswebInterface.Decrypt(cipher, encData, "CrossWebExWeb6.IdecryptBlockCallback");
		}
	}

	/************************************************************
	 * @brief		블록 복호화 콜백 함수
	 * @param[in]	result			블록 복호화 결과
	 ************************************************************/
	function IdecryptBlockCallback(result) {
		if (result) {
			var jsBlock = null;
			var jsLoadFiles = [];

			result = result.replace(/\r\n/gm, '<cwjsjs>');
			result = result.replace(/\t/gm, '');
			var commentMatchCond = /<!--(.*?)-->/igm;
			jsBlock = result.match(commentMatchCond);
			if (jsBlock) {
				for (var i = 0; i < jsBlock.length; i++) {
					var jsStr = jsBlock[i];
					var tmpChk = jsStr.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gim);
					if (tmpChk && tmpChk.length > 0) {
						exlog('IdecryptBlockCallback.html comment inner javascript remove', jsStr);
						result = result.replace(jsStr, '');
					}
				}
			}
			result = result.replace(/<cwjsjs>/gim, '\r\n');

			// .js file import
			jsBlock = null;
			commentMatchCond = /<script\b[^>]+src[ =](.*?)>(.*?)<\/script>/gim;
			jsBlock = result.match(commentMatchCond);
			if (jsBlock) {
				for (var i = 0; i < jsBlock.length; i++) {
					var jsStr = jsBlock[i].replace(/ /gm, '');
					jsStr = jsStr.match(/src=['"](.*?)['"]/gim);
					jsStr = jsStr[0].match(/['"](.*?)['"]/gim);
					jsStr = jsStr[0].replace(/['"]/gm, '');
					if (jsStr.toLowerCase().indexOf("crosswebex6.js") < 0) {
						jsLoadFiles.push(jsStr);
						exlog('IdecryptBlockCallback.javascript src push', jsStr);
					} else {
						exlog('IdecryptBlockCallback.javascript crosswebex6.js except', jsStr);
					}
				}
				result = result.replace(commentMatchCond, '');
			}

			// <script> block grep
			jsBlock = null;
			commentMatchCond = /<script\b[^>]*>([\s\S]*?)<\/script>/gim;
			jsBlock = result.match(commentMatchCond);
			var jsStr = '';
			if (jsBlock) {
				for (var i = 0; i < jsBlock.length; i++) {
					var jsStrTmp = jsBlock[i];
					jsStrTmp = jsStrTmp.replace(/<script\b[^>]*>/gim, '');
					jsStrTmp = jsStrTmp.replace(/<\/script>/gim, '');
					jsStr += jsStrTmp;
				}
				result = result.replace(commentMatchCond, '');
			}

			// html write
			try {
				if (getSpanEncElement())
					getSpanEncElement().outerHTML = result;
			} catch (e) {
				alert(e);
			}

			if (jsLoadFiles.length > 0) {
				if (typeof _EXUtil == 'object') {
					_EXUtil.loader(jsLoadFiles, function (jsStr) {
						// <script> run..
						if (jsStr) {
							exlog('IdecryptBlockCallback.javascript run 1', jsStr);
							var jsObj = document.createElement("script");
							jsObj.type = 'text/javascript';
							jsObj.text = jsStr;
							var jsNode = document.getElementsByTagName('script')[0];
							jsNode.parentNode.insertBefore(jsObj, jsNode);
						}

						if (getSpanEncElement()) {
							if (idecInfo.callback) {
								IdecryptBlock(idecInfo.callback);
							} else {
								IdecryptBlock();
							}
							return;
						} else {
							try {
								if (idecInfo.callback) {
									idecInfo.callback(true);
									idecInfo = {};
									return;
								}
							} catch (e) {
								exlog("IdecryptBlockCallback [exception] pageCallback load error", e);
								cwalert("IdecryptBlockCallback", "콜백 함수 동작 중 오류가 발생하였습니다.\n" + e);
								idecInfo = {};
								return;
							}
						}
						idecInfo = {};

					}, function (filename) {
						exlog('IdecryptBlockCallback.javascript file load', filename);
					}, jsStr);
					return;
				} else {
					// <script> run..
					for (var i = 0; i < jsLoadFiles.length; i++) {
						var jsStr = jsLoadFiles[i];
						var jsObj = document.createElement("script");
						jsObj.type = 'text/javascript';
						jsObj.src = jsStr;
						exlog('IdecryptBlockCallback.javascript src load', jsStr);
						var jsNode = document.getElementsByTagName('script')[0];
						jsNode.parentNode.insertBefore(jsObj, jsNode);
					}
				}
			} else {
				// <script> run..
				if (jsStr) {
					exlog('IdecryptBlockCallback.javascript run 2', jsStr);
					var jsObj = document.createElement("script");
					jsObj.type = 'text/javascript';
					jsObj.text = jsStr;
					var jsNode = document.getElementsByTagName('script')[0];
					jsNode.parentNode.insertBefore(jsObj, jsNode);
				}
			}
		} else {
			alert("소스 복호화에 실패하였습니다.");
			if (idecInfo.callback) idecInfo.callback(false);
			return;
		}

		if (getSpanEncElement()) {
			if (idecInfo.callback) {
				exlog("IdecryptBlockCallback.idecInfo.callback", idecInfo.callback);
				IdecryptBlock(idecInfo.callback);
			} else {
				IdecryptBlock();
			}
			return;
		} else {
			try {
				if (idecInfo.callback) {
					idecInfo.callback(true);
					idecInfo = {};
					return;
				}
			} catch (e) {
				exlog("IdecryptBlockCallback [exception] pageCallback load error", e);
				cwalert("IdecryptBlockCallback", "콜백 함수 동작 중 오류가 발생하였습니다.\n" + e);
				idecInfo = {};
				return;
			}
		}
		idecInfo = {};
	}

	/************************************************************
	 * @brief		프로세스 공유 속성 설정
	 * @param[in]	name			이름
	 * @param[in]	value			값
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function setSharedAttribute(name, value, callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.SetSharedAttribute(name, value, callback);
	}

	/************************************************************
	 * @brief		프로세스 공유 속성 취득
	 * @param[in]	name			이름
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function getSharedAttribute(name, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (callback) {
			crosswebInterface.GetSharedAttribute(name, callback);
		} else {
			exalert("getSharedAttribute", "callback function not defined");
		}
	}

	/************************************************************
	 * @brief		확장 함수
	 * @param[in]	name			이름
	 * @param[in]	value			값
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function ExtendMethod(name, value, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (CROSSWEBEX_UTIL.isWin()) {
			crosswebInterface.ExtendMethod(name, value, callback);
		} else {
			crosswebInterface.SetProperty(name, value, callback);
		}
	}

	/************************************************************
	 * @brief		인증서 필터
	 * @param[in]	storage			인증서 저장소
	 * @param[in]	issuerAndSerial	인증서 발급자 및 시리얼 번호
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function FilterCert(storage, issuerAndSerial, callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.FilterCert(storage, issuerAndSerial, callback);
	}

	/************************************************************
	 * @brief		사용자 인증서 필터
	 * @param[in]	storage			인증서 저장소
	 * @param[in]	issuerAndSerial	인증서 발급자 및 시리얼 번호
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function FilterUserCert(storage, issuerAndSerial, callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.FilterUserCert(storage, issuerAndSerial, callback);
	}

	/************************************************************
	 * @brief		인증서 캐쉬 여부 취득
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function IsCachedCert(callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (callback) {
			if (CROSSWEBEX_UTIL.isWin()) {
				crosswebInterface.IsCachedCert(callback);
			} else {
				callback("");
			}
		} else {
			exalert("IsCachedCert", "callback function not defined");
		}
	}

	/************************************************************
	 * @brief		캐쉬 인증서 취득
	 * @param[in]	name			이름
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function GetCachedCert(name, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (callback) {
			if (CROSSWEBEX_UTIL.isWin()) {
				crosswebInterface.GetCachedCert(name, callback);
			} else {
				callback("");
			}
		} else {
			exalert("GetCachedCert", "callback function not defined");
		}
	}

	///////////////////////////////Enc / Cert//////////////////////////////////////

	/************************************************************
	 * @brief		구간 암호화
	 * @param[in]	vf
	 * @param[in]	data
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 ************************************************************/
	var encInfo = {};
	function MakeINIpluginData(vf, data, callback, postdata) {
		if (!crosswebexInfo.isInstalled) return;
		encInfo.type = "origin";
		encInfo.postdata = postdata;
		if (callback) {
			encInfo.callback = callback;
		} else {
			exalert("MakeINIpluginData", "callback function not defined");
			return;
		}
		crosswebInterface.MakeINIpluginData(vf, cipher, data, rurl, "CrossWebExWeb6.post_MakeINIpluginData");
	}

	/************************************************************
	 * @brief
	 * @param[in]	data
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 ************************************************************/
	function EncParams(data, callback, postdata) {
		if (!crosswebexInfo.isInstalled) return;
		encInfo.vf = EncFlag;
		encInfo.type = "params";
		encInfo.postdata = postdata;
		if (callback) {
			encInfo.callback = callback;
		} else {
			exalert("EncParams", "callback function not defined");
			return;
		}
		crosswebInterface.MakeINIpluginData(encInfo.vf, cipher, data, rurl, "CrossWebExWeb6.post_MakeINIpluginData");
	}

	/************************************************************
	 * @brief
	 * @param[in]	form
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 ************************************************************/
	function EncForm(form, callback, postdata) {
		if (!crosswebexInfo.isInstalled) return;
		encInfo.vf = EncFlag;
		encInfo.type = "form1";
		encInfo.form = form;
		encInfo.postdata = postdata;
		if (callback) {
			encInfo.callback = callback;
		} else {
			exalert("EncForm", "callback function not defined");
			return;
		}
		var elementStr = GatherValue(form, 0, true);
		crosswebInterface.MakeINIpluginData(encInfo.vf, cipher, elementStr, rurl, "CrossWebExWeb6.post_MakeINIpluginData");
	}

	/************************************************************
	 * @brief
	 * @param[in]	readForm
	 * @param[in]	sendForm
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 ************************************************************/
	function EncForm2(readForm, sendForm, callback, postdata) {
		if (!crosswebexInfo.isInstalled) return;
		encInfo.vf = EncFlag;
		encInfo.type = "form2";
		encInfo.readForm = readForm;
		encInfo.sendForm = sendForm;
		encInfo.postdata = postdata;
		if (callback) {
			encInfo.callback = callback;
		} else {
			exalert("EncForm2", "callback function not defined");
			return;
		}
		var elementStr = GatherValue(readForm, 0, false);
		crosswebInterface.MakeINIpluginData(encInfo.vf, cipher, elementStr, rurl, "CrossWebExWeb6.post_MakeINIpluginData");
	}

	/************************************************************
	 * @brief
	 * @param[in]	url
	 * @param[in]	data
	 * @param[in]	target
	 * @param[in]	style
	 ************************************************************/
	function EncLink(url, data, target, style) {
		if (!crosswebexInfo.isInstalled) return;
		encInfo.vf = EncFlag;
		encInfo.type = "link";
		encInfo.url = url;
		encInfo.target = target;
		encInfo.style = style;

		crosswebInterface.MakeINIpluginData(encInfo.vf, cipher, data, rurl, "CrossWebExWeb6.post_MakeINIpluginData");
	}

	/************************************************************
	 * @brief
	 * @param[in]	indata
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 ************************************************************/
	function EncLocation(indata, callback, postdata) {
		if (!crosswebexInfo.isInstalled) return;

		var s = indata.indexOf('?');
		if (s <= -1) s = indata.length;
		var url = indata.substring(0, s) + "?INIpluginData=";
		var data = indata.substring(s + 1);

		encInfo.vf = EncFlag;
		encInfo.type = "location";
		encInfo.url = url;
		encInfo.postdata = postdata;
		if (callback) {
			encInfo.callback = callback;
		} else {
			exalert("EncLocation", "callback function not defined");
			return;
		}

		crosswebInterface.MakeINIpluginData(encInfo.vf, cipher, data, rurl, "CrossWebExWeb6.post_MakeINIpluginData");
	}

	/************************************************************
	 * @brief
	 * @param[in]	form
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 ************************************************************/
	function EncFormVerify(form, callback, postdata) {
		if (!crosswebexInfo.isInstalled) return;
		encInfo.vf = VerifyFlag;
		encInfo.type = "form1";
		encInfo.form = form;
		encInfo.postdata = postdata;
		if (callback) {
			encInfo.callback = callback;
		} else {
			exalert("EncFormVerify", "callback function not defined");
			return;
		}
		var elementStr = GatherValue(form, 0, true);
		crosswebInterface.MakeINIpluginData(encInfo.vf, cipher, elementStr, rurl, "CrossWebExWeb6.post_MakeINIpluginData");
	}

	/************************************************************
	 * @brief
	 * @param[in]	readForm
	 * @param[in]	sendForm
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 ************************************************************/
	function EncFormVerify2(readForm, sendForm, callback, postdata) {
		if (!crosswebexInfo.isInstalled) return;
		encInfo.vf = VerifyFlag;
		encInfo.type = "form2";
		encInfo.readForm = readForm;
		encInfo.sendForm = sendForm;
		encInfo.postdata = postdata;
		if (callback) {
			encInfo.callback = callback;
		} else {
			exalert("EncFormVerify2", "callback function not defined");
			return;
		}
		var elementStr = GatherValue(readForm, 0, false);
		crosswebInterface.MakeINIpluginData(encInfo.vf, cipher, elementStr, rurl, "CrossWebExWeb6.post_MakeINIpluginData");
	}

	/************************************************************
	 * @brief
	 * @param[in]	form
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 ************************************************************/
	function NoCertVerify(form, callback, postdata) {
		if (!crosswebexInfo.isInstalled) return;
		encInfo.vf = VerifyFlag;
		encInfo.type = "form1";
		encInfo.form = form;
		encInfo.postdata = postdata;
		if (callback) {
			encInfo.callback = callback;
		} else {
			exalert("NoCertVerify", "callback function not defined");
			return;
		}
		var elementStr = GatherValue(form, 0, true);
		crosswebInterface.MakeINIpluginData(encInfo.vf, cipher, elementStr, rurl, "CrossWebExWeb6.post_MakeINIpluginData");
	}

	/************************************************************
	 * @brief
	 * @param[in]	readForm
	 * @param[in]	sendForm
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 ************************************************************/
	function NoCertVerify2(readForm, sendForm, callback, postdata) {
		if (!crosswebexInfo.isInstalled) return;
		encInfo.vf = VerifyFlag;
		encInfo.type = "form2";
		encInfo.readForm = readForm;
		encInfo.sendForm = sendForm;
		encInfo.postdata = postdata;
		if (callback) {
			encInfo.callback = callback;
		} else {
			exalert("NoCertVerify2", "callback function not defined");
			return;
		}
		var elementStr = GatherValue(readForm, 0, false);
		crosswebInterface.MakeINIpluginData(encInfo.vf, cipher, elementStr, rurl, "CrossWebExWeb6.post_MakeINIpluginData");
	}

	/************************************************************
	 * @brief
	 * @param[in]	INIdata
	 ************************************************************/
	function post_MakeINIpluginData(INIdata) {
		try {
			var returnInfo = encInfo;
			encInfo = {};

			if (returnInfo.type == "origin") {
				returnInfo.callback(INIdata, returnInfo.postdata);
			} else if (returnInfo.type == "form1") {
				if (returnInfo.form.INIpluginData) {
					if (INIdata && INIdata != "CANCEL" && INIdata != "FALSE") {
						returnInfo.form.INIpluginData.value = INIdata;
						returnInfo.callback(true, returnInfo.postdata);
					} else {
						returnInfo.callback(false, returnInfo.postdata);
					}
				} else {
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT("INIpluginData param not found", "ERROR");
					} else {
						alert("INIpluginData param not found");
					}

					returnInfo.callback(false, returnInfo.postdata);
				}
			} else if (returnInfo.type == "form2") {
				if (returnInfo.sendForm.INIpluginData) {
					if (INIdata && INIdata != "CANCEL" && INIdata != "FALSE") {
						returnInfo.sendForm.INIpluginData.value = INIdata;
						returnInfo.callback(true, returnInfo.postdata);
					} else {
						returnInfo.callback(false, returnInfo.postdata);
					}
				} else {
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT("INIpluginData param not found", "ERROR");
					} else {
						alert("INIpluginData param not found");
					}

					returnInfo.callback(false, returnInfo.postdata);
				}
			} else if (returnInfo.type == "link") {
				var encINIData = URLEncode(INIdata);
				var queryString = "INIpluginData=" + encINIData;

				url = returnInfo.url;
				target = returnInfo.target;
				style = returnInfo.style;

				if (url.indexOf('?', 0) < 0) url += "?";
				if ((url.charAt(url.length - 1) != '?') && (url.charAt(url.length - 1) != '&')) url += "&";
				url += queryString;
				exlog("EncLink_cb", url);
				var openWin = window.open(url, target, style);
			} else if (returnInfo.type == "location") {
				var encINIData = URLEncode(INIdata);
				url = returnInfo.url + encINIData;
				returnInfo.callback(url, returnInfo.postdata);
			} else if (returnInfo.type == "params") {
				returnInfo.callback(INIdata, returnInfo.postdata);
			}
		} catch (e) {
			exlog("post_MakeINIpluginData [exception]", e);
		}
		encInfo = {};
	}

	///////////////////////////////Sign//////////////////////////////////////
	var signInfo = {};

	/************************************************************
	 * @brief		전자서명 (PKCS#1)
	 * @param[in]	data			전자서명 원문 (Base64인코딩)
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata		콜백 함수 호출 시 전달될 데이터
	 * @param[in]	charsetEncode	서명 원문 char-set
	 ************************************************************/
	function PKCS1SignedData(data, callback, postdata, charsetEncode) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.type = "value";
		signInfo.data = data;
		if (callback) {
			signInfo.callback = callback;
		} else {
			exalert("PKCS1SignedData", "callback function not defined");
			return;
		}
		if (postdata) {
			signInfo.postdata = postdata;
		} else {
			signInfo.postdata = "";
		}

		if(charsetEncode) {
			crosswebInterface.PKCS1SignData(hashalg + "|" + charsetEncode, data, "CrossWebExWeb6.post_PKCS1SignedData");
		} else {
			crosswebInterface.PKCS1SignData(hashalg, data, "CrossWebExWeb6.post_PKCS1SignedData");
		}
	}

	/************************************************************
	 * @brief		전자서명 (PKCS#1)
	 * @param[in]	form			전자서명 결과 설정 폼
	 * @param[in]	data			전자서명 원문 (Base64인코딩)
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata		콜백 함수 호출 시 전달될 데이터
	 * @param[in]	charsetEncode	서명 원문 char-set
	 ************************************************************/
	function PKCS1SignedDataForm(form, data, callback, postdata, charsetEncode) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.type = "form";
		signInfo.form = form;
		signInfo.data = data;
		if (callback) {
			signInfo.callback = callback;
		} else {
			exalert("PKCS1SignedDataForm", "callback function not defined");
			return;
		}
		if (postdata) {
			signInfo.postdata = postdata;
		} else {
			signInfo.postdata = "";
		}

		if(charsetEncode) {
			crosswebInterface.PKCS1SignData(hashalg + "|" + charsetEncode, data, "CrossWebExWeb6.post_PKCS1SignedData");
		} else {
			crosswebInterface.PKCS1SignData(hashalg, data, "CrossWebExWeb6.post_PKCS1SignedData");
		}
	}

	/************************************************************
	 * @brief		전자서명 콜백 (PKCS#1)
	 * @param[in]	signData	전자서명 결과 데이터
	 ************************************************************/
	function post_PKCS1SignedData(signData) {
		try {
			var returnInfo = signInfo;
			signInfo = {};
			if (signData && signData != "" && signData != "CANCEL" && signData != "FALSE") {
				if (returnInfo.type == "form") {
					returnInfo.form.PKCS1SignedData.value = signData;
					returnInfo.callback(true, returnInfo.postdata);
				} else {
					returnInfo.callback(signData, returnInfo.postdata);
				}
			} else {
				if (returnInfo.type == "form") {
					returnInfo.callback(false, returnInfo.postdata);
				} else {
					returnInfo.callback("", returnInfo.postdata);
				}
			}
		} catch (e) {
			signInfo = {};
			exlog("post_PKCS1SignedData [exception]", e);
		}
	}

	/************************************************************
	 * @brief		전자서명
	 * @param[in]	data
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 * @param[in]	encodeCharSet	서명 원문 char-set
	 ************************************************************/
	function PKCS7SignedData(data, callback, postdata, encodeCharSet) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.type = "value";
		signInfo.data = data;
		if (callback) {
			signInfo.callback = callback;
		} else {
			exalert("PKCS7SignedData", "callback function not defined");
			return;
		}
		if (postdata) {
			signInfo.postdata = postdata;
		} else {
			signInfo.postdata = "";
		}

		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			if(encodeCharSet) {
				crosswebInterface.PKCS7SignData(hashalg + "|" + encodeCharSet, data, time, false, "CrossWebExWeb6.post_PKCS7SignedData");
			} else {
				crosswebInterface.PKCS7SignData(hashalg, data, time, false, "CrossWebExWeb6.post_PKCS7SignedData");
			}
		});
	}

	/************************************************************
	 * @brief		전자서명
	 * @param[in]	form
	 * @param[in]	data
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 * @param[in]	encodeCharSet	서명 원문 char-set
	 ************************************************************/
	function PKCS7SignedDataForm(form, data, callback, postdata, encodeCharSet) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.type = "form";
		signInfo.form = form;
		signInfo.data = data;
		if (callback) {
			signInfo.callback = callback;
		} else {
			exalert("PKCS7SignedDataForm", "callback function not defined");
			return;
		}
		if (postdata) {
			signInfo.postdata = postdata;
		} else {
			signInfo.postdata = "";
		}

		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			if(encodeCharSet) {
				crosswebInterface.PKCS7SignData(hashalg + "|" + encodeCharSet, data, time, false, "CrossWebExWeb6.post_PKCS7SignedData");
			} else {
				crosswebInterface.PKCS7SignData(hashalg, data, time, false, "CrossWebExWeb6.post_PKCS7SignedData");
			}
		});
	}

	/************************************************************
	 * @brief
	 * @param[in]	data
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 ************************************************************/
	function PKCS7SignVID(data, callback, postdata) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.type = "value";
		signInfo.data = data;
		if (callback) {
			signInfo.callback = callback;
		} else {
			exalert("PKCS7SignVID", "callback function not defined");
			return;
		}
		if (postdata) {
			signInfo.postdata = postdata;
		} else {
			signInfo.postdata = "";
		}

		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			if (CROSSWEBEX_UTIL.isWin()) {
				crosswebInterface.PKCS7SignDataWithRandom(data, time, false, "CrossWebExWeb6.post_PKCS7SignedData");
			} else {
				crosswebInterface.PKCS7SignDataWithRandom(data, time, true, "CrossWebExWeb6.post_PKCS7SignedData");
			}
		});
	}

	/************************************************************
	 * @brief
	 * @param[in]	form
	 * @param[in]	data
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 ************************************************************/
	function PKCS7SignVIDForm(form, data, callback, postdata) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.type = "form";
		signInfo.form = form;
		signInfo.data = data;
		if (callback) {
			signInfo.callback = callback;
		} else {
			exalert("PKCS7SignVIDForm", "callback function not defined");
			return;
		}
		if (postdata) {
			signInfo.postdata = postdata;
		} else {
			signInfo.postdata = "";
		}

		/*CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			crosswebInterface.PKCS7SignDataWithRandom(data, time, true, "CrossWebExWeb6.post_PKCS7SignedData");
		});*/
		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			if (CROSSWEBEX_UTIL.isWin()) {
				crosswebInterface.PKCS7SignDataWithRandom(data, time, false, "CrossWebExWeb6.post_PKCS7SignedData");
			} else {
				crosswebInterface.PKCS7SignDataWithRandom(data, time, true, "CrossWebExWeb6.post_PKCS7SignedData");
			}
		});
	}

	/************************************************************
	 * @brief		전자서명 (PDF)
	 * @param[in]	data
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 * @param[in]	encodeCharSet	서명 원문 char-set
	 ************************************************************/
	function PKCS7SignedDataWithMD(data, callback, postdata, encodeCharSet) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.type = "value";
		signInfo.data = data;
		if (callback) {
			signInfo.callback = callback;
		} else {
			exalert("PKCS7SignedDataWithMD", "callback function not defined");
			return;
		}
		if (postdata) {
			signInfo.postdata = postdata;
		} else {
			signInfo.postdata = "";
		}

		
		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			if(encodeCharSet) {
				crosswebInterface.PKCS7SignDataWithMD(hashalg + "|" + encodeCharSet, data, time, "CrossWebExWeb6.post_PKCS7SignedData");
			} else {
				crosswebInterface.PKCS7SignDataWithMD(hashalg, data, time, "CrossWebExWeb6.post_PKCS7SignedData");
			}
		});
	}

	/************************************************************
	 * @brief		PDF 다건전자서명
	 * @param[in]	data
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 * @param[in]	encodeCharSet	서명 원문 char-set
	 ************************************************************/
	function PKCS7SignedDataWithMDMulti(data, callback, postdata, isVid, encodeCharSet) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.type = "value";
		signInfo.data = data;
		if (callback) {
			signInfo.callback = callback;
		} else {
			exalert("PKCS7SignedDataWithMDMulti", "callback function not defined");
			return;
		}
		if (postdata) {
			signInfo.postdata = postdata;
		} else {
			signInfo.postdata = "";
		}

		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			if(encodeCharSet) {
				crosswebInterface.PKCS7SignDataWithMDMulti(hashalg + "|" + encodeCharSet, data, time, isVid, "CrossWebExWeb6.post_PKCS7SignedData");
			} else {
				crosswebInterface.PKCS7SignDataWithMDMulti(hashalg, data, time, isVid, "CrossWebExWeb6.post_PKCS7SignedData");
			}
		});
	}

	/************************************************************
	 * @brief		전자서명 (PDF)
	 * @param[in]	form
	 * @param[in]	data
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 * @param[in]	encodeCharSet	서명 원문 char-set
	 ************************************************************/
	function PKCS7SignedDataWithMDForm(form, data, callback, postdata, encodeCharSet) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.type = "form";
		signInfo.form = form;
		signInfo.data = data;
		if (callback) {
			signInfo.callback = callback;
		} else {
			exalert("PKCS7SignedDataWithMDForm", "callback function not defined");
			return;
		}
		if (postdata) {
			signInfo.postdata = postdata;
		} else {
			signInfo.postdata = "";
		}

		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			if(encodeCharSet) {
				crosswebInterface.PKCS7SignDataWithMD(hashalg + "|" + encodeCharSet, data, time, "CrossWebExWeb6.post_PKCS7SignedData");
			} else {
				crosswebInterface.PKCS7SignDataWithMD(hashalg, data, time, "CrossWebExWeb6.post_PKCS7SignedData");
			}
		});
	}

	/************************************************************
	 * @brief
	 * @param[in]	signData
	 ************************************************************/
	function post_PKCS7SignedData(signData) {
		try {
			var returnInfo = signInfo;
			signInfo = {};
			if (signData && signData != "" && signData != "CANCEL" && signData != "FALSE") {
				if (returnInfo.type == "form") {
					returnInfo.form.PKCS7SignedData.value = signData;
					returnInfo.callback(true, returnInfo.postdata);
				} else {
					returnInfo.callback(signData, returnInfo.postdata);
				}
			} else {
				if (returnInfo.type == "form") {
					returnInfo.callback(false, returnInfo.postdata);
				} else {
					returnInfo.callback("", returnInfo.postdata);
				}
			}
		} catch (e) {
			signInfo = {};
			exlog("post_PKCS7SignedData [exception]", e);
		}
	}

	/************************************************************
	 * @brief		다건 전자서명
	 * @param[in]	form
	 * @param[in]	dataArr
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function PKCS7SignedDataMultiForm(form, dataArr, callback) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.multiSignLen = dataArr.length;
		signInfo.form = form;
		signInfo.dataArr = dataArr;
		signInfo.callback = callback;
		signInfo.multiSignCurr = 0;

		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			signInfo.timeData = time;
			crosswebInterface.PKCS7SignData(hashalg, signInfo.dataArr[0], time, false, "CrossWebExWeb6.post_PKCS7SignedDataMulti");
		});
	}

	/************************************************************
	 * @brief		다중 전자서명
	 * @param[in]	data
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 ************************************************************/
	function AddSignerSignedData(data, isVid, callback) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.type = "form";
		signInfo.data = data;
		if (callback) {
			signInfo.callback = callback;
		} else {
			exalert("PKCS7SignedDataForm", "callback function not defined");
			return;
		}
		
		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			crosswebInterface.AddSignerSignedData(hashalg, data, time, isVid, callback);
		});		
	}

	/************************************************************
	 * @brief		다건 전자서명
	 * @param[in]	curr
	 ************************************************************/
	function PKCS7SignedDataMultiFormShadow(curr) {
		if (curr == 0) {
			CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
				signInfo.timeData = time;
				crosswebInterface.PKCS7SignData(hashalg, signInfo.dataArr[curr], signInfo.timeData, false, "CrossWebExWeb6.post_PKCS7SignedDataMulti");
			});
		} else {
			crosswebInterface.PKCS7SignData(hashalg, signInfo.dataArr[curr], signInfo.timeData, false, "CrossWebExWeb6.post_PKCS7SignedDataMulti");
		}
	}

	/************************************************************
	 * @brief		다건 전자서명 콜백
	 * @param[in]	signData
	 ************************************************************/
	function post_PKCS7SignedDataMulti(signData) {
		try {
			if (signData && signData != "" && signData != "CANCEL" && signData != "FALSE") {
				var currSignName = "PKCS7SignedData" + signInfo.multiSignCurr;
				//eval("signInfo.form." + currSignName).value = signData;
				signInfo.form[currSignName].value = signData;
				if (signInfo.multiSignCurr == signInfo.multiSignLen - 1) {
					signInfo.callback(true);
					signInfo = {};
				} else {
					signInfo.multiSignCurr++;
					CrossWebExWeb6.PKCS7SignedDataMultiFormShadow(signInfo.multiSignCurr);
				}
			} else {
				signInfo.callback(false);
				signInfo = {};				
			}
		} catch (e) {
			signInfo = {};
			exlog("post_PKCS7SignedDataMulti [exception]", e);
		}
	}

	/************************************************************
	 * @brief		전자서명 (VID)
	 * @param[in]	form
	 * @param[in]	dataArr
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function PKCS7SignedDataWithVIDMultiForm(form, dataArr, callback) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.multiSignLen = dataArr.length;
		signInfo.form = form;
		signInfo.dataArr = dataArr;
		signInfo.callback = callback;
		signInfo.multiSignCurr = 0;

		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			signInfo.timeData = time;
			if (CROSSWEBEX_UTIL.isWin()) {
				crosswebInterface.PKCS7SignDataWithRandom(signInfo.dataArr[0], time, false, "CrossWebExWeb6.post_PKCS7SignedDataMultiWithRandom");
			} else {
				crosswebInterface.PKCS7SignDataWithRandom(signInfo.dataArr[0], time, true, "CrossWebExWeb6.post_PKCS7SignedDataMultiWithRandom");
			}
		});
	}

	/************************************************************
	 * @brief		전자서명 (VID)
	 * @param[in]	form
	 * @param[in]	dataArr
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function PKCS7SignedDataWithVIDMultiFormV2(form, dataArr, callback) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.multiSignLen = dataArr.length;
		signInfo.form = form;
		signInfo.dataArr = dataArr;
		signInfo.callback = callback;
		signInfo.multiSignCurr = 0;

		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			signInfo.timeData = time;
			if (CROSSWEBEX_UTIL.isWin()) {
				crosswebInterface.PKCS7SignDataWithRandom(signInfo.dataArr[0], time, false, "CrossWebExWeb6.post_PKCS7SignedDataMultiWithRandomV2");
			} else {
				crosswebInterface.PKCS7SignDataWithRandom(signInfo.dataArr[0], time, true, "CrossWebExWeb6.post_PKCS7SignedDataMultiWithRandomV2");
			}
		});			
	}

	/************************************************************
	 * @brief		다건 전자서명
	 * @param[in]	form
	 * @param[in]	dataArr
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function PKCS7SignedDataMultiFormV2(form, dataArr, callback) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.multiSignLen = dataArr.length;
		signInfo.form = form;
		signInfo.dataArr = dataArr;
		signInfo.callback = callback;
		signInfo.multiSignCurr = 0;

		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			signInfo.timeData = time;
			crosswebInterface.PKCS7SignData(hashalg, signInfo.dataArr[0], signInfo.timeData, false, "CrossWebExWeb6.post_PKCS7SignedDataMultiV2");
		});			
	}

	/************************************************************
	 * @brief		다건 전자서명
	 * @param[in]	curr
	 ************************************************************/
	function PKCS7SignedDataMultiFormShadowV2(curr) {
		if (curr == 0) {
			CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
				signInfo.timeData = time;
				crosswebInterface.PKCS7SignData(hashalg, signInfo.dataArr[curr], signInfo.timeData, false, "CrossWebExWeb6.post_PKCS7SignedDataMultiV2");
			});
		} else {
			crosswebInterface.PKCS7SignData(hashalg, signInfo.dataArr[curr], signInfo.timeData, false, "CrossWebExWeb6.post_PKCS7SignedDataMultiV2");
		}
	}

	/************************************************************
	 * @brief		다건 전자서명 콜백
	 * @param[in]	signData
	 ************************************************************/
	function post_PKCS7SignedDataMultiV2(signData) {
		try {
			if (signData && signData != "" && signData != "CANCEL" && signData != "FALSE") {
				var currSignName = "PKCS7SignedData";

				if ( parseInt(signInfo.multiSignCurr) != 0 ) {
					currSignName += (signInfo.multiSignCurr-1);
				}

				signInfo.form[currSignName].value = signData;

				if (signInfo.multiSignCurr == signInfo.multiSignLen - 1) {
					signInfo.callback(true);
					signInfo = {};
				} else {
					signInfo.multiSignCurr++;
					CrossWebExWeb6.PKCS7SignedDataMultiFormShadowV2(signInfo.multiSignCurr);
				}
			} else {				
				signInfo.callback(false);
				signInfo = {};				
			}
		} catch (e) {
			signInfo = {};
			exlog("post_PKCS7SignedDataMultiV2 [exception]", e);
		}
	}

	/************************************************************
	 * @brief		전자서명 (VID)
	 * @param[in]	curr
	 ************************************************************/
	function PKCS7SignedDataWithVIDMultiFormShadow(curr) {		
		if (curr == 0) {
			CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
				signInfo.timeData = time;
				if (CROSSWEBEX_UTIL.isWin()) {
					crosswebInterface.PKCS7SignDataWithRandom(signInfo.dataArr[curr], signInfo.timeData, false, "CrossWebExWeb6.post_PKCS7SignedDataMultiWithRandom");
				} else {
					crosswebInterface.PKCS7SignDataWithRandom(signInfo.dataArr[curr], signInfo.timeData, true, "CrossWebExWeb6.post_PKCS7SignedDataMultiWithRandom");
				}
			});
		} else {
			if (CROSSWEBEX_UTIL.isWin()) {
				crosswebInterface.PKCS7SignDataWithRandom(signInfo.dataArr[curr], signInfo.timeData, false, "CrossWebExWeb6.post_PKCS7SignedDataMultiWithRandom");
			} else {
				crosswebInterface.PKCS7SignDataWithRandom(signInfo.dataArr[curr], signInfo.timeData, true, "CrossWebExWeb6.post_PKCS7SignedDataMultiWithRandom");
			}
		}
	}

	/************************************************************
	 * @brief		전자서명 (VID)
	 * @param[in]	curr
	 ************************************************************/
	function PKCS7SignedDataWithVIDMultiFormShadowV2(curr) {
		if (curr == 0) {
			CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
				signInfo.timeData = time;
				if (CROSSWEBEX_UTIL.isWin()) {
					crosswebInterface.PKCS7SignDataWithRandom(signInfo.dataArr[curr], signInfo.timeData, false, "CrossWebExWeb6.post_PKCS7SignedDataMultiWithRandomV2");
				} else {
					crosswebInterface.PKCS7SignDataWithRandom(signInfo.dataArr[curr], signInfo.timeData, true, "CrossWebExWeb6.post_PKCS7SignedDataMultiWithRandomV2");
				}
			});
		} else {
			if (CROSSWEBEX_UTIL.isWin()) {
				crosswebInterface.PKCS7SignDataWithRandom(signInfo.dataArr[curr], signInfo.timeData, false, "CrossWebExWeb6.post_PKCS7SignedDataMultiWithRandomV2");
			} else {
				crosswebInterface.PKCS7SignDataWithRandom(signInfo.dataArr[curr], signInfo.timeData, true, "CrossWebExWeb6.post_PKCS7SignedDataMultiWithRandomV2");
			}
		}
	}

	/************************************************************
	 * @brief		전자서명 (VID) 콜백
	 * @param[in]	signData
	 ************************************************************/
	function post_PKCS7SignedDataMultiWithRandom(signData) {
		try {
			if (signData && signData != "" && signData != "CANCEL" && signData != "FALSE") {
				var currSignName = "PKCS7SignedData" + signInfo.multiSignCurr;
				//eval("signInfo.form." + currSignName).value = signData;
				signInfo.form[currSignName].value = signData;
				if (signInfo.multiSignCurr == signInfo.multiSignLen - 1) {
					signInfo.callback(true);
					signInfo = {};
				} else {
					signInfo.multiSignCurr++;
					CrossWebExWeb6.PKCS7SignedDataWithVIDMultiFormShadow(signInfo.multiSignCurr);
				}
			} else {				
				signInfo.callback(false);
				signInfo = {};				
			}
		} catch (e) {
			signInfo = {};
			exlog("post_PKCS7SignedDataMultiWithRandom [exception]", e);
		}
	}

	/************************************************************
	 * @brief		전자서명 (VID) 콜백
	 * @param[in]	signData
	 ************************************************************/
	function post_PKCS7SignedDataMultiWithRandomV2(signData) {
		try {
			if (signData && signData != "" && signData != "CANCEL" && signData != "FALSE") {
				var currSignName = "PKCS7SignedData";

				if ( parseInt(signInfo.multiSignCurr) != 0 )
					currSignName += (signInfo.multiSignCurr-1);
				//eval("signInfo.form." + currSignName).value = signData;
				signInfo.form[currSignName].value = signData;
				if (signInfo.multiSignCurr == signInfo.multiSignLen - 1) {
					signInfo.callback(true);
					signInfo = {};
				} else {
					signInfo.multiSignCurr++;
					CrossWebExWeb6.PKCS7SignedDataWithVIDMultiFormShadowV2(signInfo.multiSignCurr);
				}
			} else {				
				signInfo.callback(false);
				signInfo = {};				
			}
		} catch (e) {
			signInfo = {};
			exlog("post_PKCS7SignedDataMultiWithRandomV2 [exception]", e);
		}
	}

	/************************************************************
	 * @brief		다건 전자서명 (PDF)
	 * @param[in]	form
	 * @param[in]	dataArr
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function PKCS7SignedDataWithMDMultiForm(form, dataArr, callback) {
		if (!crosswebexInfo.isInstalled) return;
		signInfo.multiSignLen = dataArr.length;
		signInfo.form = form;
		signInfo.dataArr = dataArr;
		signInfo.callback = callback;
		signInfo.multiSignCurr = 0;

		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			signInfo.timeData = time;
			crosswebInterface.PKCS7SignDataWithMD(hashalg, signInfo.dataArr[0], time, "CrossWebExWeb6.post_PKCS7SignedDataWithMDMulti");
		});			
	}

	/************************************************************
	 * @brief		다건 전자서명 (PDF)
	 * @param[in]	curr
	 ************************************************************/
	function PKCS7SignedDataWithMDMultiFormShadow(curr) {	
		if (curr == 0) {
			CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
				signInfo.timeData = time;
				crosswebInterface.PKCS7SignDataWithMD(hashalg, signInfo.dataArr[curr], signInfo.timeData, "CrossWebExWeb6.post_PKCS7SignedDataWithMDMulti");
			});
		} else {
			crosswebInterface.PKCS7SignDataWithMD(hashalg, signInfo.dataArr[curr], signInfo.timeData, "CrossWebExWeb6.post_PKCS7SignedDataWithMDMulti");
		}
	}

	/************************************************************
	 * @brief		다건 전자서명 (PDF) 콜백
	 * @param[in]	signData
	 ************************************************************/
	function post_PKCS7SignedDataWithMDMulti(signData) {
		try {
			if (signData && signData != "" && signData != "CANCEL" && signData != "FALSE") {
				var currSignName = "PKCS7SignedData" + signInfo.multiSignCurr;
				//eval("signInfo.form." + currSignName).value = signData;
				signInfo.form[currSignName].value = signData;
				if (signInfo.multiSignCurr == signInfo.multiSignLen - 1) {
					signInfo.callback(true);
					signInfo = {};
				} else {
					signInfo.multiSignCurr++;
					CrossWebExWeb6.PKCS7SignedDataWithMDMultiFormShadow(signInfo.multiSignCurr);
				}
			} else {				
				signInfo.callback(false);
				signInfo = {};				
			}
		} catch (e) {
			signInfo = {};
			exlog("post_PKCS7SignedDataWithMDMulti [exception]", e);
		}
	}

	///////////////////////////////File Encrypt/Decrypt//////////////////////////////////////
	var fileEncDecInfo = {};

	/************************************************************
	 * @brief		파일 선택
	 * @param[in]	field
	 ************************************************************/
	function SelFile(field) {
		if (!crosswebexInfo.isInstalled) return;
		fileEncDecInfo = {};
		fileEncDecInfo.field = field;

		crosswebInterface.SelectFile("CrossWebExWeb6.post_SelFile");
	}

	/************************************************************
	 * @brief		파일 선택 콜백 함수
	 * @param[in]	filePath		선택 파일 경로
	 ************************************************************/
	function post_SelFile(filePath) {
		var resultInfo = fileEncDecInfo;
		if (resultInfo.field)
			resultInfo.field.value = filePath
	}

	/************************************************************
	 * @brief		암호화 파일 업로드
	 * @param[in]	url				업로드 URL
	 * @param[in]	form
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function EncFile(url, form, callback) {
		if (!crosswebexInfo.isInstalled) return;
		var filetemp = GatherFileValue(form, 0, true);
		if (filetemp) {
			fileEncDecInfo.form = form;
			fileEncDecInfo.callback = callback;
			CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
				crosswebInterface.UploadEncryptFile(url, EncFlag, cipher, filetemp, time, "CrossWebExWeb6.UploadEncryptFile_cb");
			});					
		}
	}

	/************************************************************
	 * @brief		암호화 파일 업로드 콜백함수
	 * @param[in]	retValue
	 ************************************************************/
	function UploadEncryptFile_cb(retValue) {
		var eletemp = "";
		if (!retValue || retValue == "") {
			if (fileEncDecInfo.callback) {
				fileEncDecInfo.callback(false);
				return;
			}
		}

		if (fileEncDecInfo.form)
			fileEncDecInfo.form.INIfileData.value = retValue;

		eletemp = GatherValue(fileEncDecInfo.form, 0, true);
		crosswebInterface.MakeINIpluginData(EncFlag, cipher, eletemp, rurl, "CrossWebExWeb6.post_EncFile");
	}

	/************************************************************
	 * @brief		암호화 파일 업로드 콜백함수
	 * @param[in]	retValue
	 ************************************************************/
	function post_EncFile(retValue) {
		if (retValue) {
			fileEncDecInfo.form.INIpluginData.value = retValue;
			if (fileEncDecInfo.callback) {
				fileEncDecInfo.callback(true);
			}
		} else {
			if (fileEncDecInfo.callback) {
				fileEncDecInfo.callback(false);
			}
		}
	}

	/************************************************************
	 * @brief		암호화 파일 다운로드
	 * @param[in]	url				다운로드 URL
	 * @param[in]	args
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function EncDown(url, args, callback) {
		if (!crosswebexInfo.isInstalled) return;
		fileEncDecInfo.callback = callback;
		CROSSWEBEX_UTIL.GetServerTime(turl, function (time) {
			crosswebInterface.DownloadEncryptFile(url, EncFlag, cipher, args, time, "CrossWebExWeb6.post_EncDown");
		});		
	}

	/************************************************************
	 * @brief		암호화 파일 다운로드 콜백 함수
	 * @param[in]	retValue
	 ************************************************************/
	function post_EncDown(retValue) {
		if (fileEncDecInfo.callback) {
			fileEncDecInfo.callback(retValue);
		} else {
			fileEncDecInfo.callback("");
		}
	}

	///////////////////////////////Cert Center//////////////////////////////////////
	var caInfo = {};

	/************************************************************
	 * @brief		인증서 발급
	 * @param[in]	caName			발급 기관
	 * @param[in]	szRef			참조 코드
	 * @param[in]	szCode			인가 코드
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function IssueCertificate(caName, szRef, szCode, callback) {
		if (!crosswebexInfo.isInstalled) return;

		caInfo = {};
		caInfo.caName = caName;
		caInfo.szRef = szRef;
		caInfo.szCode = szCode;
		caInfo.challenge = "1111";
		caInfo.callback = callback;

		var Arg = "";
		Arg += "REF=" + URLEncode(szRef);
		Arg += "&CODE=" + URLEncode(szCode);
		//Arg += "&CANAME=" + caName;

		if (caName == YessignPackage) {
			Arg += "&CAIP=" + URLEncode(YessignCAIP);
			Arg += "&CAPORT=" + URLEncode(YessignCMPPort);
		} else if (caName == CrossCertPackage) {
			Arg += "&CAIP=" + URLEncode(CrossCertCAIP);
			Arg += "&CAPORT=" + URLEncode(CrossCertCMPPort);
		} else if (caName == SignKoreaPackage) {
			Arg += "&CAIP=" + URLEncode(SignKoreaCAIP);
			Arg += "&CAPORT=" + URLEncode(SignKoreaCMPPort);
		} else if (caName == SignGatePackage) {
			Arg += "&CAIP=" + URLEncode(SignGateCAIP);
			Arg += "&CAPORT=" + URLEncode(SignGateCMPPort);
		} else if (caName == INIPassPackage) {
			Arg += "&CAIP=" + URLEncode(INIPassCAIP);
			Arg += "&CAPORT=" + URLEncode(INIPassCMPPort);
		} else {
			if ("undefined" !== typeof INI_ALERT) {
				INI_ALERT(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_004, "ERROR");	// "정의되지 않은 CA기관입니다."
			} else {
				alert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_004); // "정의되지 않은 CA기관입니다."
			}
			if (callback) callback(false);
			return;
		}

		try {
			crosswebInterface.CertRequest(caInfo.caName, "", Arg, caInfo.challenge, "CrossWebExWeb6.post_CertRequest");
		} catch (e) {
			exlog("IssueCertificate [exception]", e);
			if (callback) callback(false);
		}
	}

	/************************************************************
	 * @brief		인증서 재발급
	 * @param[in]	caName			발급 기관
	 * @param[in]	szRef			참조 코드
	 * @param[in]	szCode			인가 코드
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function ReIssueCertificate(caName, szRef, szCode, callback) {
		if (!crosswebexInfo.isInstalled) return;

		caInfo = {};
		caInfo.caName = caName;
		caInfo.szRef = szRef;
		caInfo.szCode = szCode;
		caInfo.challenge = "1111";
		caInfo.callback = callback;

		var Arg = "";
		Arg += "REF=" + URLEncode(szRef);
		Arg += "&CODE=" + URLEncode(szCode);
		//Arg += "&CANAME=" + caName;

		if (caName == YessignPackage) {
			Arg += "&CAIP=" + URLEncode(YessignCAIP);
			Arg += "&CAPORT=" + URLEncode(YessignCMPPort);
		} else if (caName == CrossCertPackage) {
			Arg += "&CAIP=" + URLEncode(CrossCertCAIP);
			Arg += "&CAPORT=" + URLEncode(CrossCertCMPPort);
		} else if (caName == SignKoreaPackage) {
			Arg += "&CAIP=" + URLEncode(SignKoreaCAIP);
			Arg += "&CAPORT=" + URLEncode(SignKoreaCMPPort);
		} else if (caName == SignGatePackage) {
			Arg += "&CAIP=" + URLEncode(SignGateCAIP);
			Arg += "&CAPORT=" + URLEncode(SignGateCMPPort);
		} else if (caName == INIPassPackage) {
			Arg += "&CAIP=" + URLEncode(INIPassCAIP);
			Arg += "&CAPORT=" + URLEncode(INIPassCMPPort);
		} else {
			if ("undefined" !== typeof INI_ALERT) {
				INI_ALERT(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_004, "ERROR");	// "정의되지 않은 CA기관입니다."
			} else {
				alert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_004); // "정의되지 않은 CA기관입니다."
			}
			if (callback) callback(false);
			return;
		}

		try {
			if (caInfo.caName != SignGatePackage) {
				crosswebInterface.CertRequest(caInfo.caName, "", Arg, caInfo.challenge, "CrossWebExWeb6.post_CertRequest");
			} else {
				crosswebInterface.CertReissue(caInfo.caName, "", Arg, caInfo.challenge, "CrossWebExWeb6.post_CertRequest");
			}
		} catch (e) {
			exlog("ReIssueCertificate [exception]", e);
			if (callback) callback(false);
		}
	}

	/************************************************************
	 * @brief
	 * @param[in]	result
	 ************************************************************/
	function post_CertRequest(result) {
		if (!result || result == "" || result == "CANCEL" || result == "FALSE") {
			var caName = "";
			if (caInfo.caName == YessignPackage) {
				caName = "금결원";
			} else if (caInfo.caName == CrossCertPackage) {
				caName = "전자인증";
			} else if (caInfo.caName == SignKoreaPackage) {
				caName = "코스콤";
			} else if (caInfo.caName == SignGatePackage) {
				caName = "정보인증";
			} else if (caInfo.caName == CANAME) {
				caName = "이니텍";
			}

			var msg = "";
			if (caInfo.caName != CANAME) {
				msg += CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_002 + "\n";	// "공인인증서 발급시 오류가 발생하여 인증서 발급에 실패하였습니다.\n"
				msg += CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_003 + caName + CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_004 + "\n\n"; // "아래의 참조번호와 인가코드를 참조하시여 " + caName + "에서 발급 받으시기 바랍니다.\n\n";
			} else {
				msg += CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_001 + "\n";		// "인증서 발급시 오류가 발생하여 인증서 발급에 실패하였습니다.\n"
				msg += CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_005 + "\n\n";		// "아래의 참조번호와 인가코드를 참조하시여 발급 받으시기 바랍니다.\n\n"
			}
			msg += CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_006 + caInfo.szRef;	// "참조번호 : "
			msg += "\t" + CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_007 + caInfo.szCode;	// "인가코드 : "
			if ("undefined" !== typeof INI_ALERT) {
				INI_ALERT(msg, "WARN");
			} else {
				alert(msg);
			}
			if (caInfo.callback) caInfo.callback(false);
		} else {
			if (caInfo.callback) caInfo.callback(true);
		}
		caInfo = {};
	}

	/************************************************************
	 * @brief		인증서 갱신
	 * @param[in]	caName			발급 기관
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function UpdateCertificate(caName, callback) {
		if (!crosswebexInfo.isInstalled) return;

		caInfo = {};
		caInfo.caName = caName;
		caInfo.challenge = "1111";
		caInfo.callback = callback;

		var Arg = "";
		if (caName == YessignPackage) {
			Arg += "CAIP=" + URLEncode(YessignCAIP);
			Arg += "&CAPORT=" + URLEncode(YessignCMPPort);
		} else if (caName == CrossCertPackage) {
			Arg += "CAIP=" + URLEncode(CrossCertCAIP);
			Arg += "&CAPORT=" + URLEncode(CrossCertCMPPort);
		} else if (caName == SignKoreaPackage) {
			Arg += "CAIP=" + URLEncode(SignKoreaCAIP);
			Arg += "&CAPORT=" + URLEncode(SignKoreaCMPPort);
		} else if (caName == SignGatePackage) {
			Arg += "CAIP=" + URLEncode(SignGateCAIP);
			Arg += "&CAPORT=" + URLEncode(SignGateCMPPort);
		} else if (caName == INIPassPackage) {
			Arg += "CAIP=" + URLEncode(INIPassCAIP);
			Arg += "&CAPORT=" + URLEncode(INIPassCMPPort);
		} else if (caName == InitechPackage) {
			Arg += "CAIP=" + URLEncode(InitechCAIP);
			Arg += "&CAPORT=" + URLEncode(InitechCAPort);
		}else {
			if ("undefined" !== typeof INI_ALERT) {
				INI_ALERT(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_004, "ERROR");	//"정의되지 않은 CA기관입니다."
			} else {
				alert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_004); // "정의되지 않은 CA기관입니다."
			}
			if (callback) callback(false);
			return;
		}

		try {
			crosswebInterface.CertUpdate(caInfo.caName, "", Arg, "CrossWebExWeb6.post_CertUpdate");
		} catch (e) {
			exlog("UpdateCertificate [exception]", e);
			if (callback) callback(false);
		}
	}

	/************************************************************
	 * @brief
	 * @param[in]	result
	 ************************************************************/
	function post_CertUpdate(result) {
		var resultInfo = caInfo;
		caInfo = {};
		if (!result || result == "" || result == "CANCEL" || result == "FALSE") {
			if (resultInfo.callback) resultInfo.callback(false);
		} else {
			if (resultInfo.callback) resultInfo.callback(true);
		}
	}

	/************************************************************
	 * @brief		인증서 폐기
	 * @param[in]	caName			발급 기관
	 * @param[in]	serial			인증서 시리얼 번호
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function RevokeCertificate(caName, serial, callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.DeleteUserCert(caName, "", serial, callback);
	}

	///////////////////////////////INITECH CertCenter v5//////////////////////////////////////

	/************************************************************
	 * @brief		인증서 발급 (INITECH)
	 * @param[in]	szRef			참조 코드
	 * @param[in]	szCode			인가 코드
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function INITECHCA_IssueCertificate(szRef, szCode, callback) {
		if (!crosswebexInfo.isInstalled) return;

		caInfo = {};
		caInfo.szRef = szRef;
		caInfo.szCode = szCode;
		caInfo.caName = CANAME;
		caInfo.challenge = "1111";
		caInfo.callback = callback;

		var Arg = "";
		Arg += "REF=" + URLEncode(szRef);
		Arg += "&CODE=" + URLEncode(szCode);
		Arg += "&CAIP=" + URLEncode(Initech_CAIP);
		Arg += "&CAPORT=" + URLEncode(Initech_CMPPort);
		Arg += "&CANAME=" + URLEncode(CANAME);

		try {
			crosswebInterface.CertRequest(caInfo.caName, "", Arg, caInfo.challenge, "CrossWebExWeb6.post_CertRequest");
		} catch (e) {
			exlog("INITECHCA_IssueCertificate [exception]", e);
			if (callback) callback(false);
		}
	}

	///////////////////////////////INITECH CertCenter v7//////////////////////////////////////

	/************************************************************
	 * @brief		인증서 발급 (INITECH)
	 * @param[in]	options			옵션
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function INITECHCA_IssueCertificate_v7(options, callback) {
		if (!crosswebexInfo.isInstalled) return;

		caInfo = {};
		// caInfo.frm = frm;
		if (callback) {
			caInfo.callback = callback;
		} else {
			exalert("CertRequest", "callback function not defined");
			return;
		}
		caInfo.option = options;
		caInfo.challenge = "1111";

		var dn = "";
		dn += "C=null&L=null&OU=null&CN=" + URLEncode(options.DETAILNAME) + "&EMAIL=" + URLEncode(options.USERMAIL) + "&";

		try {
			crosswebInterface.CertRequest(caInfo.option.caName, "", dn, caInfo.challenge, "CrossWebExWeb6.post_INITECHCA_CertRequest");
		} catch (e) {
			exlog("INITECHCA_IssueCertificate_v7 [exception]", e);
			if (callback) callback(false);
		}
	}

	///////////////////////////////INITECH CertCenter v6//////////////////////////////////////
	function INITECHCA_IssueCertificate_v6(frm, callback) {
		if (!crosswebexInfo.isInstalled) return;
	
		caInfo = {};
		caInfo.frm = frm;
		if (callback) {
			caInfo.callback = callback;
		} else {
			exalert("CertRequest", "callback function not defined");
			return;
		}
		caInfo.challenge = frm.challenge.value;
	
		var dn = "";
		var len = frm.elements.length;
		frm.req.value = "";
	
		// for (i = 0; i < len; i++) {
		// 	var name = frm.elements[i].name.toUpperCase();
		// 	var temp = frm.elements[i].value;
		// 	if (name == "C") dn += "C=" + URLEncode(temp) + "&";
		// 	if (name == "L") dn += "L=" + URLEncode(temp) + "&";
		// 	if (name == "O") dn += "O=" + URLEncode(temp) + "&";
		// 	if (name == "OU") dn += "OU=" + URLEncode(temp) + "&";
		// 	if (name == "CN") dn += "CN=" + URLEncode(temp) + "&";
		// 	if (name == "EMAIL") {
		// 		if (temp == "") temp = " ";
		// 		dn += "EMAIL=" + URLEncode(temp);
		// 	}	
		// }
		
		for (i = 0; i < len; i++) {
			var name = frm.elements[i].name.toUpperCase();
			var temp = frm.elements[i].value;
			if (name == "C") dn += "C=" + iniURLEncode(decodeURIComponent(temp)) + "&";
			if (name == "L") dn += "L=" + iniURLEncode(decodeURIComponent(temp)) + "&";
			if (name == "O") dn += "O=" + iniURLEncode(decodeURIComponent(temp)) + "&";
			if (name == "OU") dn += "OU=" + iniURLEncode(decodeURIComponent(temp)) + "&";
			if (name == "CN") dn += "CN=" + iniURLEncode(decodeURIComponent(temp)) + "&";
			if (name == "EMAIL") {
				if (temp == "") temp = " ";
				dn += "EMAIL=" + iniURLEncode(decodeURIComponent(temp));
			}
		}

		try {
			crosswebInterface.CertRequest(InitechPackage, "", dn, caInfo.challenge, "CrossWebExWeb6.post_INITECHCAv6_CertRequest");
		} catch (e) {
			exlog("INITECHCA_IssueCertificate_v6 [exception]", e);
			if (callback) callback(false);
		}
	}
	
	function post_INITECHCAv6_CertRequest(result) {
		exlog("post_INITECHCAv6_CertRequest.result", result);
		var resultInfo = caInfo;
		caInfo = {};
		if (!result || result == "" || result == "CANCEL" || result == "FALSE") {
			var msg = "";
			msg += "인증서 발급시 오류가 발생하여 인증서 발급에 실패하였습니다.\n";
			exalert(msg);
			if (resultInfo.callback) resultInfo.callback(false);
		} else {
			resultInfo.frm.req.value = result;
			if (resultInfo.callback) resultInfo.callback(true);
		}
	}

	///////////////////////////////INITECH CertCenter v7//////////////////////////////////////

	/************************************************************
	 * @brief
	 * @param[in]	frm
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function CertRequest(frm, callback) {
		if (!crosswebexInfo.isInstalled) return;

		caInfo = {};
		caInfo.frm = frm;
		if (callback) {
			caInfo.callback = callback;
		} else {
			exalert("CertRequest", "callback function not defined");
			return;
		}
		caInfo.challenge = frm.challenge.value;

		var dn = "";
		var len = frm.elements.length;
		frm.req.value = "";

		for (i = 0; i < len; i++) {
			var name = frm.elements[i].name.toUpperCase();
			var temp = frm.elements[i].value;
			if (name == "C") dn += "C=" + URLEncode(temp) + "&";
			if (name == "L") dn += "L=" + URLEncode(temp) + "&";
			if (name == "O") dn += "O=" + URLEncode(temp) + "&";
			if (name == "OU") dn += "OU=" + URLEncode(temp) + "&";
			if (name == "CN") dn += "CN=" + URLEncode(temp) + "&";
			if (name == "EMAIL") {
				if (temp == "") temp = " ";
				dn += "EMAIL=" + URLEncode(temp);
			}
		}

		try {
			crosswebInterface.CertRequest(InitechPackage, "", dn, caInfo.challenge, "CrossWebExWeb6.post_INITECHCA_CertRequest");
		} catch (e) {
			exlog("CertRequest [exception]", e);
			if (callback) callback(false);
		}
	}

	/************************************************************
	 * @brief
	 * @param[in]	result
	 ************************************************************/
	function post_INITECHCA_CertRequest(result) {
		exlog("post_INITECHCA_CertRequest.result", result);
		var resultInfo = caInfo;
		caInfo = {};
		if (!result || result == "" || result == "CANCEL" || result == "FALSE") {
			var msg = "";
			msg += CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_001 + "\n";	// "인증서 발급시 오류가 발생하여 인증서 발급에 실패하였습니다.\n";
			if ("undefined" !== typeof INI_ALERT) {
				INI_ALERT(msg, "ERROR");
			} else {
				alert(msg);
			}

			if (resultInfo.callback) resultInfo.callback(false);
		} else {
			var option = {};
			option = resultInfo.option;
			option["PKCS10MSG"] = result;
			CROSSWEBEX_UTIL.PostDataWithJson(InitechPrivateIssueURL, option, function(resp) {
				if (!resp || resp == "") {
					var msg = "";
					msg += CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_001 + "\n";	// "인증서 발급시 오류가 발생하여 인증서 발급에 실패하였습니다.\n";
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(msg, "ERROR");
					} else {
						alert(msg);
					}
				} else if (resp[0].CODE !== "000") {
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(resp[0].MESSAGE, "ERROR");
					} else {
						alert(resp[0].MESSAGE);
					}
				} else {
					// if(resultInfo.CASTATUS === "C8") {
					// 	crosswebInterface.DeleteUserCert()
					// }
					var decode_cert = decodeURIComponent(decodeURIComponent(resp[0].CERT));
					var taged_cert = "-----BEGIN CERTIFICATE-----" +
										decode_cert +
										"-----END CERTIFICATE-----\r\n";
					InsertUserCert(taged_cert, resultInfo.callback);
				}
			});
		}
	}

	/************************************************************
	 * @brief
	 * @param[in]	cert
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function InsertUserCert(cert, callback) {
		if (!crosswebexInfo.isInstalled) return;
		caInfo = {};
		caInfo.callback = callback;

		crosswebInterface.InsertUserCert(InitechPackage, "", cert, "CrossWebExWeb6.InsertUserCert_cb");
	}

	/************************************************************
	 * @brief
	 * @param[in]	result
	 ************************************************************/
	function InsertUserCert_cb(result) {
		var resultInfo = caInfo;
		caInfo = {};
		if (resultInfo.callback) {
			if (!result || result == "" || result == "CANCEL" || result == "FALSE") {
				resultInfo.callback(false);
			} else {
				resultInfo.callback(true);
			}
		}
	}

	/************************************************************
	 * @brief
	 * @param[in]	cert
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function DeleteUserCert(cert, callback) {
		if (!crosswebexInfo.isInstalled) return;
		caInfo = {};
		caInfo.callback = callback;

		crosswebInterface.DeleteUserCert(InitechPackage, "", cert, "CrossWebExWeb6.DeleteUserCert_cb");
	}

	/************************************************************
	 * @brief
	 * @param[in]	result
	 ************************************************************/
	function DeleteUserCert_cb(result) {
		var resultInfo = caInfo;
		caInfo = {};
		if (resultInfo.callback) {
			if (!result || result == "" || result == "CANCEL" || result == "FALSE") {
				resultInfo.callback(false);
			} else {
				resultInfo.callback(true);
			}
		}
	}

	///////////////////////////////Windows Only Function//////////////////////////////////////

	/************************************************************
	 * @brief
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function InsertCerttoMS(callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (CROSSWEBEX_UTIL.isWin()) {
			if (!callback) callback = "";
			crosswebInterface.InsertCertToMS(callback);
		} else {
			return false;
		}
		return true;
	}

	/************************************************************
	 * @brief
	 * @param[in]	cert			인증서
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function InsertCACertToSystem(cert, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (CROSSWEBEX_UTIL.isWin()) {
			if (!callback) callback = "";
			crosswebInterface.InsertCACert("system", cert, callback);
		} else {
			return false;
		}
		return true;
	}

	/************************************************************
	 * @brief
	 * @param[in]	BSCert
	 * @param[in]	form
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	var makeSKInfo = {};
	function makeSK(BSCert, form, callback) {
		if (!crosswebexInfo.isInstalled) return;
		if (CROSSWEBEX_UTIL.isWin()) {
			makeSKInfo = {};
			makeSKInfo.form = form;
			makeSKInfo.callback = callback;

			if (typeof form.INIencSK == "undefined") {
				alert("INIecnSK(form.name)가 필요합니다.");
				return false;
			}
			crosswebInterface.MakeSessionKeyInfo(BSCert, "SEED-CBC", "CrossWebExWeb6.makeSK_cb");
		} else {
			alert("해당 OS에서는 기능을 지원하지 않습니다.(makeSK)");
			return false;
		}
	}

	/************************************************************
	 * @brief
	 * @param[in]	result
	 ************************************************************/
	function makeSK_cb(result) {
		var resultInfo = makeSKInfo;
		makeSKInfo = {};
		if (result) {
			resultInfo.form.INIencSK.value = result;
			if (resultInfo.callback) resultInfo.callback(true);
		} else {
			if (resultInfo.callback) resultInfo.callback(false);
		}
	}

	/************************************************************
	 * @brief
	 * @param[in]	name
	 * @param[in]	form
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	var encToSKInfo = {};
	function EncryptToSK(name, form, callback) {
		if (!ModuleInstallCheck()) return;
		if (CROSSWEBEX_UTIL.isWin()) {
			if (!form.INIencSK.value) {
				alert("INIencSK 값이 없습니다.");
				return false;
			}
			encToSKInfo = {};
			encToSKInfo.name = name;
			encToSKInfo.form = form;
			encToSKInfo.callback = callback;
			if (form[name] != "undefined") {
				var nameObj = form[name];
				crosswebInterface.EncryptWithSKInfo2(form.INIencSK.value, nameObj.value, "CrossWebExWeb6.EncryptToSK_cb");
			} else {
				alert("이중암호화할 form.name(" + name + ")을 찾을수가 없습니다.");
				return false;
			}
		} else {
			alert("해당 OS에서는 기능을 지원하지 않습니다.(EncryptToSK)");
			return false;
		}
	}

	/************************************************************
	 * @brief
	 * @param[in]	result
	 ************************************************************/
	function EncryptToSK_cb(result) {
		exlog("EncryptToSK_cb.result", result);
		var resultInfo = encToSKInfo;
		encToSKInfo = {};
		if (result) {
			resultInfo.form[resultInfo.name].value = result;
			if (resultInfo.callback) resultInfo.callback(true);
		} else {
			if (resultInfo.callback) resultInfo.callback(false);
		}
	}

	/************************************************************
	 * @brief
	 * @param[in]	BSCert
	 * @param[in]	nameArr
	 * @param[in]	form
	 * @param[in]	callback		콜백 함수
	 * @param[in]	postdata
	 ************************************************************/
	var EncryptAfterMakeSKInfo = {};
	function EncryptAfterMakeSK(BSCert, nameArr, form, callback, postdata) {
		if (!ModuleInstallCheck()) return;
		if (CROSSWEBEX_UTIL.isWin()) {
			EncryptAfterMakeSKInfo = {};
			if (!BSCert) {
				alert("SCert값이 없습니다.(EncryptAfterMakeSK)");
				return;
			}
			if (!nameArr) {
				alert("form name을 정의하여 주십시오.(EncryptAfterMakeSK)");
				return;
			}
			if (!form) {
				alert("선언된 form이 없습니다.(EncryptAfterMakeSK)");
				return;
			}
			if (typeof nameArr == "string") {
				nameArr = [nameArr];
			}

			EncryptAfterMakeSKInfo.nameArr = nameArr;
			EncryptAfterMakeSKInfo.form = form;
			EncryptAfterMakeSKInfo.callback = callback;
			EncryptAfterMakeSKInfo.postdata = postdata;
			EncryptAfterMakeSKInfo.cnt = 0;

			makeSK(BSCert, form, function (result) {
				if (result) {
					EncryptAfterMakeSKInfo.nameLength = EncryptAfterMakeSKInfo.nameArr.length;
					EncryptToSK(EncryptAfterMakeSKInfo.nameArr[0], EncryptAfterMakeSKInfo.form, "CrossWebExWeb6.EncryptAfterMakeSK_cb");
				} else {
					if (EncryptAfterMakeSKInfo.callback) EncryptAfterMakeSKInfo.callback(false);
					return;
				}
			});
		} else {
			alert("해당 OS에서는 기능을 지원하지 않습니다.(EncryptAfterMakeSK)");
			return false;
		}
	}

	/************************************************************
	 * @brief
	 ************************************************************/
	function EncryptAfterMakeSK_shadow() {
		var name = EncryptAfterMakeSKInfo.nameArr[EncryptAfterMakeSKInfo.cnt];
		EncryptToSK(name, EncryptAfterMakeSKInfo.form, "CrossWebExWeb6.EncryptAfterMakeSK_cb");
	}

	/************************************************************
	 * @brief
	 * @param[in]	result
	 ************************************************************/
	function EncryptAfterMakeSK_cb(result) {
		EncryptAfterMakeSKInfo.cnt++;
		if (result) {
			if (EncryptAfterMakeSKInfo.cnt >= EncryptAfterMakeSKInfo.nameLength) {
				if (EncryptAfterMakeSKInfo.callback) {
					if (EncryptAfterMakeSKInfo.postdata) {
						EncryptAfterMakeSKInfo.callback(true, EncryptAfterMakeSKInfo.postdata);
					} else {
						EncryptAfterMakeSKInfo.callback(true);
					}
				}
				EncryptAfterMakeSKInfo = {};
			} else {
				EncryptAfterMakeSK_shadow();
			}
		} else {
			if (EncryptAfterMakeSKInfo.callback) {
				if (EncryptAfterMakeSKInfo.postdata) {
					EncryptAfterMakeSKInfo.callback(false, postdata);
				} else {
					EncryptAfterMakeSKInfo.callback(false);
				}
			}
			EncryptAfterMakeSKInfo = {};
		}
	}

	/************************************************************
	 * @brief		인증서 가져오기 (v1.1)
	 ************************************************************/
	function CertImportV11WithForm() {
		if (!crosswebexInfo.isInstalled) return;

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("MakePluginData", "FALSE");

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("TimeURL", TimeURL);

		/**
		 * 인증서 이동 프로토콜 버전 설정
		 */
		crosswebInterface.ICCSetOption("SetProtocolVersion", "1.1");

		/**
		 * 인증번호 자리 입력수. 스마트폰에서 설정한 자릿수와 일치하여야 한다.
		 */
		crosswebInterface.ICCSetOption("SetAuthenticationNumber", "8");

		/**
		 * 내보내기할 인증서의 비밀번호를 재설정할것인지의 여부.(기본값:"TRUE")
		 * (즉 스마트폰에 저장될 인증서 암호결정)
		 * "FALSE"로 지정하면 재설정하지 않고 바로 전송되며 지정하지 않을 시
		 * 사용자에게 재설정 여부를 알린다.
		 */
		crosswebInterface.ICCSetOption("SetUseCertPwd", "FALSE");

		/**
		 * 인증서 가져오기 처리 시작
		 */
		crosswebInterface.ICCRecvCert(importURL);
	}

	/************************************************************
	 * @brief		인증서 내보내기 (v1.1)
	 ************************************************************/
	function CertExportV11WithForm() {
		if (!crosswebexInfo.isInstalled) return;

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("SetLogoPath", LogoURL);

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("MakePluginData", "FALSE");

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("TimeURL", TimeURL);

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("SetLanguage", "KOR");

		/**
		 * 인증서 선택창에 폐기목록 표시여부
		 */
		crosswebInterface.ICCSetOption("DisableExpiredCert", "TRUE");

		/**
		 * GPKI 인증서 출력 여부
		 */
		crosswebInterface.ICCSetOption("Setproperty", "certmanui_gpki&all");

		/**
		 * 인증서 이동 프로토콜 버전 설정
		 */
		crosswebInterface.ICCSetOption("SetProtocolVersion", "1.1");

		/**
		 * 인증번호 자리 입력수. 스마트폰에서 설정한 자릿수와 일치하여야 한다.
		 */
		crosswebInterface.ICCSetOption("SetAuthenticationNumber", "8");

		/**
		 * 내보내기할 인증서의 비밀번호를 재설정할것인지의 여부.(기본값:"TRUE")
		 * (즉 스마트폰에 저장될 인증서 암호결정)
		 * "FALSE"로 지정하면 재설정하지 않고 바로 전송되며 지정하지 않을 시
		 * 사용자에게 재설정 여부를 알린다.
		 */
		crosswebInterface.ICCSetOption("SetUseCertPwd", "FALSE");

		/**
		 * 인증서 내보내기 처리 시작
		 */
		crosswebInterface.ICCSendCert(exportURL);
	}

	/************************************************************
	 * @brief		인증서 가져오기 (v1.2)
	 ************************************************************/
	function CertImportV12WithForm() {
		if (!crosswebexInfo.isInstalled) return;

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("MakePluginData", "FALSE");

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("TimeURL", TimeURL);

		/**
		 * 인증서 이동 프로토콜 버전 설정
		 */
		crosswebInterface.ICCSetOption("SetProtocolVersion", "1.2");

		/**
		 * 인증번호 자리 입력수. 스마트폰에서 설정한 자릿수와 일치하여야 한다.
		 */
		crosswebInterface.ICCSetOption("SetAuthenticationNumber", "8");

		/**
		 * 내보내기할 인증서의 비밀번호를 재설정할것인지의 여부.(기본값:"TRUE")
		 * (즉 스마트폰에 저장될 인증서 암호결정)
		 * "FALSE"로 지정하면 재설정하지 않고 바로 전송되며 지정하지 않을 시
		 * 사용자에게 재설정 여부를 알린다.
		 */
		crosswebInterface.ICCSetOption("SetUseCertPwd", "FALSE");

		/**
		 * 인증서 가져오기 처리 시작
		 */
		crosswebInterface.ICCRecvCert(importURL);
	}

	/************************************************************
	 * @brief		인증서 내보내기 (v1.2)
	 ************************************************************/
	function CertExportV12WithForm() {
		if (!crosswebexInfo.isInstalled) return;

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("SetLogoPath", LogoURL);

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("MakePluginData", "FALSE");

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("TimeURL", TimeURL);

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("SetLanguage", "KOR");

		/**
		 * 인증서 선택창에 폐기목록 표시여부
		 */
		crosswebInterface.ICCSetOption("DisableExpiredCert", "TRUE");

		/**
		 * GPKI 인증서 출력 여부
		 */
		crosswebInterface.ICCSetOption("Setproperty", "certmanui_gpki&all");

		/**
		 * 인증서 이동 프로토콜 버전 설정
		 */
		crosswebInterface.ICCSetOption("SetProtocolVersion", "1.2");

		/**
		 * 인증번호 자리 입력수. 스마트폰에서 설정한 자릿수와 일치하여야 한다.
		 */
		crosswebInterface.ICCSetOption("SetAuthenticationNumber", "8");

		/**
		 * 내보내기할 인증서의 비밀번호를 재설정할것인지의 여부.(기본값:"TRUE")
		 * (즉 스마트폰에 저장될 인증서 암호결정)
		 * "FALSE"로 지정하면 재설정하지 않고 바로 전송되며 지정하지 않을 시
		 * 사용자에게 재설정 여부를 알린다.
		 */
		crosswebInterface.ICCSetOption("SetUseCertPwd", "FALSE");

		/**
		 * 인증서 내보내기 처리 시작
		 */
		crosswebInterface.ICCSendCert(exportURL);
	}

	/************************************************************
	 * @brief		인증서 가져오기 (v1.3)
	 ************************************************************/
	function CertImportV13WithForm() {
		if (!crosswebexInfo.isInstalled) return;

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("MakePluginData", "FALSE");

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("TimeURL", TimeURL);

		/**
		 * 인증서 이동 프로토콜 버전 설정
		 */
		crosswebInterface.ICCSetOption("SetProtocolVersion", "1.3");

		/**
		 * 인증번호 자리 입력수. 스마트폰에서 설정한 자릿수와 일치하여야 한다.
		 */
		crosswebInterface.ICCSetOption("SetAuthenticationNumber", "8");

		/**
		 * 내보내기할 인증서의 비밀번호를 재설정할것인지의 여부.(기본값:"TRUE")
		 * (즉 스마트폰에 저장될 인증서 암호결정)
		 * "FALSE"로 지정하면 재설정하지 않고 바로 전송되며 지정하지 않을 시
		 * 사용자에게 재설정 여부를 알린다.
		 */
		crosswebInterface.ICCSetOption("SetUseCertPwd", "FALSE");

		/**
		 * 인증서 가져오기 처리 시작
		 */
		crosswebInterface.ICCRecvCert(importV13URL);
	}

	/************************************************************
	 * @brief		인증서 내보내기 (v1.3)
	 ************************************************************/
	function CertExportV13WithForm() {
		if (!crosswebexInfo.isInstalled) return;

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("SetLogoPath", LogoURL);

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("MakePluginData", "FALSE");

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("TimeURL", TimeURL);

		/**
		 *
		 */
		crosswebInterface.ICCSetOption("SetLanguage", "KOR");

		/**
		 * 인증서 선택창에 폐기목록 표시여부
		 */
		crosswebInterface.ICCSetOption("DisableExpiredCert", "TRUE");

		/**
		 * GPKI 인증서 출력 여부
		 */
		crosswebInterface.ICCSetOption("Setproperty", "certmanui_gpki&all");

		/**
		 * 인증서 이동 프로토콜 버전 설정
		 */
		crosswebInterface.ICCSetOption("SetProtocolVersion", "1.3");

		/**
		 * 인증번호 자리 입력수. 스마트폰에서 설정한 자릿수와 일치하여야 한다.
		 */
		crosswebInterface.ICCSetOption("SetAuthenticationNumber", "8");

		/**
		 * 내보내기할 인증서의 비밀번호를 재설정할것인지의 여부.(기본값:"TRUE")
		 * (즉 스마트폰에 저장될 인증서 암호결정)
		 * "FALSE"로 지정하면 재설정하지 않고 바로 전송되며 지정하지 않을 시
		 * 사용자에게 재설정 여부를 알린다.
		 */
		crosswebInterface.ICCSetOption("SetUseCertPwd", "FALSE");

		/**
		 * 인증서 내보내기 처리 시작
		 */
		crosswebInterface.ICCSendCert(exportV13URL);
	}

	/************************************************************
	 * @brief		인증서 관리
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function ManageCert(callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.ManageCert(callback);
	}

	/************************************************************
	 * @brief		HTML5 인터페이스 호출
	 * @param[in]	params			파라미터
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function CWEXRequestCmd(params, callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.CWEXRequestCmd(params, callback);
	}

	/************************************************************
	 * @brief		버전 취득
	 * @param[in]	callback		콜백 함수
	 ************************************************************/
	function GetVersion(callback) {
		if (!crosswebexInfo.isInstalled) return;
		crosswebInterface.GetVersion(callback);
	}

	return {
		InstallModule: InstallModule,
		InitCache: InitCache,
		ReSession: ReSession,
		SetVerifyNegoTime: SetVerifyNegoTime,
		ErasePolicy: ErasePolicy,
		LoadCACert: LoadCACert,
		SetLogoPath: SetLogoPath,
		SetCacheTime: SetCacheTime,
		EnableCheckCRL: EnableCheckCRL,
		DisableInvalidCert: DisableInvalidCert,
		SetProperty: SetProperty,
		SetPropertyAdd: SetPropertyAdd,
		SetPropertyEX: SetPropertyEX,
		SetPropertyArr: SetPropertyArr,
		GetProperty: GetProperty,
		URLEncode: URLEncode,
		URLDecode: URLDecode,
		ICCSetOption: ICCSetOption,
		ICCSendCert: ICCSendCert,
		ICCRecvCert: ICCRecvCert,
		GatherValue: GatherValue,
		GatherFileValue: GatherFileValue,
		SplitValue: SplitValue,
		iniConvert: iniConvert,
		iniSplitEncode: iniSplitEncode,
		convertEncode7: convertEncode7,
		ViewCert: ViewCert,
		LoadCert: LoadCert,
		Idecrypt: Idecrypt,
		IdecryptCallback: IdecryptCallback,
		getSpanEncElement: getSpanEncElement,
		IdecryptBlock: IdecryptBlock,
		IdecryptBlockCallback: IdecryptBlockCallback,
		setSharedAttribute: setSharedAttribute,
		getSharedAttribute: getSharedAttribute,
		ExtendMethod: ExtendMethod,
		FilterCert: FilterCert,
		FilterUserCert: FilterUserCert,
		IsCachedCert: IsCachedCert,
		GetCachedCert: GetCachedCert,
		MakeINIpluginData: MakeINIpluginData,
		EncParams: EncParams,
		EncForm: EncForm,
		EncForm2: EncForm2,
		EncLink: EncLink,
		EncLocation: EncLocation,
		EncFormVerify: EncFormVerify,
		EncFormVerify2: EncFormVerify2,
		NoCertVerify: NoCertVerify,
		NoCertVerify2: NoCertVerify2,
		post_MakeINIpluginData: post_MakeINIpluginData,
		PKCS1SignedData: PKCS1SignedData,
		PKCS1SignedDataForm: PKCS1SignedDataForm,
		post_PKCS1SignedData: post_PKCS1SignedData,
		PKCS7SignedData: PKCS7SignedData,
		PKCS7SignedDataForm: PKCS7SignedDataForm,
		PKCS7SignVID: PKCS7SignVID,
		PKCS7SignVIDForm: PKCS7SignVIDForm,
		PKCS7SignedDataWithMD: PKCS7SignedDataWithMD,
		PKCS7SignedDataWithMDMulti: PKCS7SignedDataWithMDMulti,
		PKCS7SignedDataWithMDForm: PKCS7SignedDataWithMDForm,
		post_PKCS7SignedData: post_PKCS7SignedData,
		PKCS7SignedDataMultiForm: PKCS7SignedDataMultiForm,
		PKCS7SignedDataMultiFormShadow: PKCS7SignedDataMultiFormShadow,
		post_PKCS7SignedDataMulti: post_PKCS7SignedDataMulti,
		PKCS7SignedDataWithVIDMultiForm: PKCS7SignedDataWithVIDMultiForm,
		PKCS7SignedDataWithVIDMultiFormShadow: PKCS7SignedDataWithVIDMultiFormShadow,
		post_PKCS7SignedDataMultiWithRandom: post_PKCS7SignedDataMultiWithRandom,

		// 다건서명 출력 필드를 html5와 맞추기 위해 추가함.
		PKCS7SignedDataMultiFormV2: PKCS7SignedDataMultiFormV2,
		PKCS7SignedDataMultiFormShadowV2: PKCS7SignedDataMultiFormShadowV2,
		post_PKCS7SignedDataMultiV2: post_PKCS7SignedDataMultiV2,
		PKCS7SignedDataWithVIDMultiFormV2: PKCS7SignedDataWithVIDMultiFormV2,
		PKCS7SignedDataWithVIDMultiFormShadowV2: PKCS7SignedDataWithVIDMultiFormShadowV2,
		post_PKCS7SignedDataMultiWithRandomV2: post_PKCS7SignedDataMultiWithRandomV2,

		PKCS7SignedDataWithMDMultiForm: PKCS7SignedDataWithMDMultiForm,
		PKCS7SignedDataWithMDMultiFormShadow: PKCS7SignedDataWithMDMultiFormShadow,
		post_PKCS7SignedDataWithMDMulti: post_PKCS7SignedDataWithMDMulti,
		AddSignerSignedData: AddSignerSignedData,
		SelFile: SelFile,
		post_SelFile: post_SelFile,
		EncFile: EncFile,
		UploadEncryptFile_cb: UploadEncryptFile_cb,
		post_EncFile: post_EncFile,
		EncDown: EncDown,
		post_EncDown: post_EncDown,
		IssueCertificate: IssueCertificate,
		ReIssueCertificate: ReIssueCertificate,
		post_CertRequest: post_CertRequest,
		UpdateCertificate: UpdateCertificate,
		post_CertUpdate: post_CertUpdate,
		RevokeCertificate: RevokeCertificate,
		INITECHCA_IssueCertificate: INITECHCA_IssueCertificate,
		INITECHCA_IssueCertificate_v7: INITECHCA_IssueCertificate_v7,
		INITECHCA_IssueCertificate_v6:INITECHCA_IssueCertificate_v6,
		CertRequest: CertRequest,
		post_INITECHCA_CertRequest: post_INITECHCA_CertRequest,
		post_INITECHCAv6_CertRequest: post_INITECHCAv6_CertRequest,
		InsertUserCert: InsertUserCert,
		InsertUserCert_cb: InsertUserCert_cb,
		DeleteUserCert: DeleteUserCert,
		DeleteUserCert_cb: DeleteUserCert_cb,
		InsertCerttoMS: InsertCerttoMS,
		InsertCACertToSystem: InsertCACertToSystem,
		makeSK: makeSK,
		makeSK_cb: makeSK_cb,
		EncryptToSK: EncryptToSK,
		EncryptToSK_cb: EncryptToSK_cb,
		EncryptAfterMakeSK: EncryptAfterMakeSK,
		EncryptAfterMakeSK_shadow: EncryptAfterMakeSK_shadow,
		EncryptAfterMakeSK_cb: EncryptAfterMakeSK_cb,
		CertImportV11WithForm: CertImportV11WithForm,
		CertExportV11WithForm: CertExportV11WithForm,
		CertImportV12WithForm: CertImportV12WithForm,
		CertExportV12WithForm: CertExportV12WithForm,
		CertImportV13WithForm: CertImportV13WithForm,
		CertExportV13WithForm: CertExportV13WithForm,
		ManageCert: ManageCert,
		CWEXRequestCmd: CWEXRequestCmd,
		GetVersion: GetVersion
	};

} ());
