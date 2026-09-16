var CROSSWEBEX;

var crosswebexInfo = {
	"exPluginCallName": "CROSSWEBEX",		// 제품명
	"exPluginName": "CROSSWEBEX",			// exinterface.js 최상단에 정의한 객체명
	"exPluginInfo": "crosswebexInfo",		// exinterface.js 정의한 protocolInfo 객체명
	"exModuleName": "crosswebex",			// 모듈명
	"exErrFunc": "crosswebInterface.exCommonError",
	"exErrSpec": "crosswebInterface.exSpecError",

	////////////////////////////////////////////////////////////////
	// License				"demo.initech.com","127.0.0.1","localhost"
	////////////////////////////////////////////////////////////////
	"lic": "eyJ2ZXJzaW9uIjoiMS4wIiwiaXNzdWVfZGF0ZSI6IjIwMTYwMzAyMTEzNTM3IiwicHJvdG9jb2xfbmFtZSI6ImNyb3Nzd2ViZXgiLCJ1dWlkIjoiYjI0MDZjZDhhMDZhNDNjZGI5NjIyZjQ2NDczODMxYzkiLCJsaWNlbnNlIjoiOWhESUZYQ2lQNjNpUk5HencxQ09tRURBTlF1M0ZsV09kQWZFSXFZRVNtenNWdUtqY1hvakIrSnNLY2NaRThaY2JrbDZmdTVycHBtVGpLd1c2SFFSS1I5bGxnSEZIbk1wM2JmUFVRLzZ3RmE4THFNcVMveDBMVEljdENRbXpSQU15REQrTEczY1NMQ2NPZEJPd3MrU0drcmRNYmRPSEhRZkxxd204Q3NXMG9rPSJ9",
	"lic_64bit": "NVQpAHgwsj08ZUHayoHuFKG%2fyu5KSN4sYqI%2bG%2f51FgI5AjrVgkI9NjXa2XV4FygN",
    
	//n-dev-engkind.krx.co.kr;n-dev-filing.krx.co.kr;n-idev-filing.krx.co.kr;n-test1-filing.krx.co.kr;n-test-filing.krx.co.kr;n-dr-filing.krx.co.kr;n-filing.krx.co.kr;filing.krx.co.kr;localhost:8080;localhost:8081;
	//"lic_domain":"FsNDQ35v7ico184ZWoDN6FvlO4MUjUfU2hbnBz9YO2kvC/A2vjrB3f1UbyLSKBySE02WavvIqELhFU3+qmXBJn28ptWFfP17rpx9AuFU9ODXxuQu2WdE1MAtxDIXZ71kD0URAml/eSNuAF5y+1U8mKmBv581+nmWsc68iYhYb8bNPrF4Ggq8joJtkYX8f7odBixjRoNaEuVvA3xhkBo1hk8OKtB8F0sJKVmSMwqUrup9kJUT0swJNwrf28qcmi+ABa6j3U5EdcLWhxN9W/ZUkQmpuWSk5PyPf0qUSYW8NliiMaWZE+AtT7FvVbuYQ0OVWZz3HJ/6y6V1dqXy25GSZg==",
	"lic_domain":"U3p/H6KxKQr+aJXoX5YoDouOXmFODIOX4i7aR2cHH8qJz7G/h6ndnkgBCyQCiIc1eTQnEEdijsOacPIOcM4KR4qCrKNzuPjxGzzyLayohaZN/4NEHnlxQTaVaMRDHKo131mDBPKx6bRx+cPf6K8YRBZsf7ubOq/MQgdyZdgeR4DXj8HYT5L7+9LnvxmaIVTuvvUqWm94kuIvaHOrD5C1RWJRFbT1HaYvf+d+iMWo569B6VLppUyb6Rom5uOHqo6orfCsjfsV9gFPIuaIOatUQSCUUBVx4If+roCY2JMEjwuiipCFUMqLtk7ecW4Jl/d+WnCfzpQZzJ3f88wxedWx9A==",

	// Module Info, 플러그인 설치파일 경로
	"moduleInfo": {
		"exWinVer": "3.3.2.3",
		"exWinClient": crosswebexBaseDir + "/down/INIS_EX_SHA2.exe",
		"exWin64Ver": "3.3.2.3",
		"exWin64Client": crosswebexBaseDir + "/down/INIS_EX_SHA2_64bit.exe",
		"exMacVer": "3.3.2.3",
		"exMacClient": crosswebexBaseDir + "/down/CrossWebEX.pkg",
		"exLinuxVer": "3.3.2.3",
		"exUbuntu32Client": crosswebexBaseDir + "/down/CrossWebEX_i386.deb",
		"exUbuntu64Client": crosswebexBaseDir + "/down/CrossWebEX_amd64.deb",
		"exFedora32Client": crosswebexBaseDir + "/down/CrossWebEX_i386.rpm",
		"exFedora64Client": crosswebexBaseDir + "/down/CrossWebEX_x86_64.rpm"
	},

	// EX Protocol Info, EX를 포함한 플러그인 클라이언트 파일 경로
	"exProtocolInfo": {
		"exWinProtocolVer": "1.0.1.1021",
		"exWinProtocolBeforeVistaDownURL": crosswebexBaseDir + "/down/INIS_EX_SHA1.exe",
		"exWinProtocolDownURL": crosswebexBaseDir + "/down/INIS_EX_SHA2.exe",
		"exWin64ProtocolDownURL": crosswebexBaseDir + "/down/INIS_EX_SHA2_64bit.exe",
		"exMacProtocolVer": "1.0.1.1013",
		"exMacProtocolDownURL": crosswebexBaseDir + "/down/CrossWebEX.pkg",
		"exLinuxProtocolVer": "1.0.1.1013",
		"exUbuntu32ProtocolDownURL": crosswebexBaseDir + "/down/CrossWebEX_i386.deb",
		"exUbuntu64ProtocolDownURL": crosswebexBaseDir + "/down/CrossWebEX_amd64.deb",
		"exFedora32ProtocolDownURL": crosswebexBaseDir + "/down/CrossWebEX_i386.rpm",
		"exFedora64ProtocolDownURL": crosswebexBaseDir + "/down/CrossWebEX_x86_64.rpm"
	},

	// 로컬데몬 정보
	"exEdgeInfo": {
		"addScript": crosswebexBaseDir + "/common/js/exproto_ext_daemon.js",
		"localhost": "127.0.0.1",
		"edgeStartPort": 4441,
		"portChkCnt": 5,
		"daemonVer": "1.0.1.1"
	},

	//////////////////////////////////////////////////////////////
	//////       CrossEX AREA DO NOT EDIT !!
	//////////////////////////////////////////////////////////////
	"isInstalled": false,				// 제품 정상 설치 여부
	"exProtocolName": "crosswebex",
	"exExtHeader": "crosswebex",
	"exNPPluginId": "crosswebexPlugin",
	"exNPMimeType": "application/x-iniline-crosswebex",

	// Extension Info
	"exExtensionInfo": {
		// Extension info
		"exChromeExtVer": "1.0.0.1",
		"exChromeExtDownURL": "https://chrome.google.com/webstore/detail/dheimbmpmkbepjjcobigjacfepohombn",
		"exFirefoxExtVer": "1.0.2.4",
		"exFirefoxExtDownURL": crosswebexBaseDir + "/down/crosswebex_firefox.xpi",
		"exFirefoxExtIcon": "",
		"exFirefoxJpmExtVer": "1.0.1.12",
		"exFirefoxJpmExtDownURL": crosswebexBaseDir + "/down/crosswebex_firefox_jpm.xpi",
		"exOperaExtVer": "1.0.1.12",
		"exOperaExtDownURL": crosswebexBaseDir + "/down/crosswebex_opera.nex"
	},

	// TODO min spec
	// minimum module specification
	// PASS, ALL, NO
	"checkSpec": true,
	"reqSpec": {
		"OS": {
			"WINDOWS": "5.1",	// XP=5.1, XP(x64)=5.2, VISTA=6.0, Win7=6.1, Win8=6.2, Win8.1=6.3, Win10=10.0
			"MACOSX": "10.7",	// Leopard=10.5, Snow Leopard=10.6, Lion=10.7, Mountain Lion=10.8, Mavericks=10.9, Yosemite=10.10, El Capitan=10.11
			"LINUX": "PASS"
		},
		"Browser": {
			"MSIE": "6",
			"EDGE": "ALL",
			"CHROME": "38",
			"FIREFOX": "36",
			"OPERA": "27",
			"SAFARI_WIN": "5",
			"SAFARI_MAC": "6"
		}
	}
};

/****************************
** edge condition
** include exproto_ext_daemon.js
****************************/
function crosswebexIsUseDaemon() {
	if (CROSSWEBEX_CONST.exUseDaemon)
		return true;
	else
		return CROSSWEBEX_UTIL.typeDaemon();
}


if (crosswebexIsUseDaemon()) {

	if (CROSSWEBEX_UTIL.isMac()) {
		crosswebexInfo.exEdgeInfo.localhost = "https://localhost";
	} else {
		crosswebexInfo.exEdgeInfo.localhost = "https://127.0.0.1";
	}
	
	document.write("<script type='text/javascript' src='" + crosswebexInfo.exEdgeInfo.addScript + "'></script>");
}

var crosswebInterface = {

	exCommonError: function (response) { },

	exSpecError: function (type, reqSpec) {
		if (type == "OS") {
			var printOS = "";
			if (CROSSWEBEX_UTIL.isWin()) {
				var winName = "";
				if (reqSpec.WINDOWS == "5.1") winName = "XP";
				else if (reqSpec.WINDOWS == "5.2") winName = "XP";
				else if (reqSpec.WINDOWS == "6.0") winName = "VISTA";
				else if (reqSpec.WINDOWS == "6.1") winName = "Win7";
				else if (reqSpec.WINDOWS == "6.2") winName = "Win8";
				else if (reqSpec.WINDOWS == "6.3") winName = "Win8.1";
				else if (reqSpec.WINDOWS == "10.0") winName = "Win10";
				printOS = "WINDOWS " + winName + CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_014; // "이상"
			} else if (CROSSWEBEX_UTIL.isMac()) {
				printOS = "MACOSX " + reqSpec.MACOSX + CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_014; // "이상"
			} else if (CROSSWEBEX_UTIL.isLinux()) {
				printOS = "LINUX " + reqSpec.LINUX + CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_014; // "이상"
			} else {
				printOS = "UNDEFINED OS";
			}

			if ("undefined" !== typeof INI_ALERT) {
				INI_ALERT(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_013, "INFO"); // "지원하지 않는 운영체제입니다."
			} else {
				alert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_013); // "지원하지 않는 운영체제입니다."
			}

		} else if (type == "BROWSER") {
			var printBrowser = "";
			if (CROSSWEBEX_UTIL.isIE()) printBrowser = "IE " + reqSpec.MSIE + CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_014; // "이상"
			else if (CROSSWEBEX_UTIL.isEdge()) printBrowser = "Edge " + reqSpec.EDGE + CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_014; // "이상"
			else if (CROSSWEBEX_UTIL.isChrome()) printBrowser = "Chrome " + reqSpec.CHROME + CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_014; // "이상"
			else if (CROSSWEBEX_UTIL.isFirefox()) printBrowser = "Firefox " + reqSpec.FIREFOX + CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_014; // "이상"
			else if (CROSSWEBEX_UTIL.isOpera()) printBrowser = "Opera " + reqSpec.OPERA + CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_014; // "이상"
			else if (CROSSWEBEX_UTIL.isSafari() && CROSSWEBEX_UTIL.isWin()) printBrowser = "Safari " + reqSpec.SAFARI_WIN + CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_014; // "이상"
			else if (CROSSWEBEX_UTIL.isSafari() && CROSSWEBEX_UTIL.isMac()) printBrowser = "Safari " + reqSpec.SAFARI_MAC + CROSSWEBEX_UTIL.loadStringTable().TEXT.C_T_014; // "이상"
			else printBrowser = "UNDEFINED BROWSER";

			if ("undefined" !== typeof INI_ALERT) {
				INI_ALERT(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_014, "INFO"); // "지원하지 않는 브라우저입니다."
			} else {
				alert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_014); // "지원하지 않는 브라우저입니다."
			}
		}
	},

	//////////////////////////////
	// 6, 7 common function
	crosswebexSigFail: false,
	CommonCallback: function (result) {
		try {
			var strSerial = JSON.stringify(result);
			exlog("CommonCallback", result);
			if (result.reply && (typeof result.reply == "string" && result.reply.indexOf("BLOCK:SIGN:") != -1)) {
				if (!crosswebInterface.crosswebexSigFail) {
					crosswebInterface.crosswebexSigFail = true;
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_015, "ERROR"); // "CrossWebEX 프로그램 서명 검증이 실패하였습니다.\n프로그램을 재설치하여 주십시오."
					} else {
						alert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_015); // "CrossWebEX 프로그램 서명 검증이 실패하였습니다.\n프로그램을 재설치하여 주십시오."
					}

				}
				return;
			}

			try {
				if (result.reply && typeof result.reply == "string")
					result.reply = JSON.parse(result.reply);
			} catch (e) {
				exlog("crosswebInterface.CommonCallback [exception] JSON.parse : ", result.reply);
			}

			if (result.callback && typeof result.callback == "function") {
				//eval(result.callback)(result.reply);
				result.callback(result.reply);
			}
			else{
				var fn = ( new Function( 'return ' + result.callback ) )(); 
				fn(result.reply);
			}	
		} catch (e) {
			exlog("crosswebInterface.CommonCallback [exception] result", result);
			exalert("crosswebInterface.CommonCallback", CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_001); // "콜백 함수 동작 중 오류가 발생하였습니다."
		}
	},

	SetProperty: function (name, value, callback) {
		exlog("SetProperty", name + "::" + value + "::" + callback);
		CROSSWEBEX.Invoke("SetProperty", [name, value], this.CommonCallback, callback);
	},

	SetPropertyEX: function (params, callback) {
		exlog("SetPropertyEX", params + "::" + callback);
		CROSSWEBEX.Invoke("SetPropertyEX", [params], this.CommonCallback, callback);
	},

	GetProperty: function (name, callback) {
		exlog("GetProperty", name + "::" + callback);
		CROSSWEBEX.Invoke("GetProperty", [name], this.CommonCallback, callback);
	},

	URLEncode: function (param, callback) {
		exlog("URLEncode", param + "::" + callback);
		CROSSWEBEX.Invoke("URLEncode", [param], this.CommonCallback, callback);
	},

	URLDecode: function (param, callback) {
		exlog("URLDecode", param + "::" + callback);
		CROSSWEBEX.Invoke("URLDecode", [param], this.CommonCallback, callback);
	},

	ManageCert: function (callback) {
		exlog("ManageCert", "");
		CROSSWEBEX.Invoke("ManageCert", [], this.CommonCallback, callback);
	},

	ICCSetOption: function (name, value, callback) {
		exlog("ICCSetOption", name + "::" + value);
		CROSSWEBEX.Invoke("ICCSetOption", [name, value], this.CommonCallback, callback);
	},

	ICCSendCert: function (url, callback) {
		exlog("ICCSendCert", url);
		CROSSWEBEX.Invoke("ICCSendCert", [url], this.CommonCallback, callback);
	},

	ICCRecvCert: function (url, callback) {
		exlog("ICCRecvCert", url);
		CROSSWEBEX.Invoke("ICCRecvCert", [url], this.CommonCallback, callback);
	},

	//////////////////////////////
	// 6 function

	InitCache: function (callback) {
		exlog("InitCache", callback);
		CROSSWEBEX.Invoke("InitCache", [], this.CommonCallback, callback);
	},

	ReSession: function (callback) {
		exlog("ReSession", callback);
		CROSSWEBEX.Invoke("ReSession", [], this.CommonCallback, callback);
	},

	InstallModule: function (url, callback) {
		exlog("InstallModule", url + "::" + callback);
		CROSSWEBEX.Invoke("InstallModule", [url], this.CommonCallback, callback);
	},

	SetVerifyNegoTime: function (time1, time2, callback) {
		exlog("SetVerifyNegoTime", time1 + "::" + time2);
		CROSSWEBEX.Invoke("SetVerifyNegoTime", [time1, time2], this.CommonCallback, callback);
	},

	ErasePolicy: function (callback) {
		exlog("ErasePolicy");
		CROSSWEBEX.Invoke("ErasePolicy", this.CommonCallback, callback);
	},

	LoadCACert: function (cert, callback) {
		exlog("LoadCACert", "cacert load....");
		CROSSWEBEX.Invoke("LoadCACert", [cert], this.CommonCallback, callback);
	},

	SetLogoPath: function (url, callback) {
		exlog("SetLogoPath", url);
		CROSSWEBEX.Invoke("SetLogoPath", [url], this.CommonCallback, callback);
	},

	SetCacheTime: function (gap, callback) {
		exlog("SetCacheTime", gap);
		CROSSWEBEX.Invoke("SetCacheTime", [gap], this.CommonCallback, callback);
	},

	EnableCheckCRL: function (check, callback) {
		exlog("EnableCheckCRL", check);
		CROSSWEBEX.Invoke("EnableCheckCRL", [check], this.CommonCallback, callback);
	},

	DisableInvalidCert: function (check, callback) {
		exlog("DisableInvalidCert", check);
		CROSSWEBEX.Invoke("DisableInvalidCert", [check], this.CommonCallback, callback);
	},

	ViewCert: function (cert, callback) {
		exlog("ViewCert", cert + "::" + callback);
		CROSSWEBEX.Invoke("ViewCert", [cert], this.CommonCallback, callback);
	},

	FilterCert: function (storage, issuerAndSerial, callback) {
		exlog("FilterCert", storage + "::" + issuerAndSerial + "::" + callback);
		CROSSWEBEX.Invoke("FilterCert", [storage, issuerAndSerial], this.CommonCallback, callback);
	},

	FilterUserCert: function (storage, issuerAndSerial, callback) {
		exlog("FilterUserCert", storage + "::" + issuerAndSerial + "::" + callback);
		CROSSWEBEX.Invoke("FilterUserCert", [storage, issuerAndSerial], this.CommonCallback, callback);
	},

	IsCachedCert: function (callback) {
		exlog("IsCachedCert", callback);
		CROSSWEBEX.Invoke("IsCachedCert", [], this.CommonCallback, callback);
	},

	GetCachedCert: function (name, callback) {
		exlog("GetCachedCert", name + "::" + callback);
		CROSSWEBEX.Invoke("GetCachedCert", [name], this.CommonCallback, callback);
	},

	LoadCert: function (cert, callback) {
		exlog("LoadCert", "loadcert..." + "::" + callback);
		CROSSWEBEX.Invoke("LoadCert", [cert], this.CommonCallback, callback);
	},

	Decrypt: function (cipher, data, callback) {
		exlog("Decrypt", cipher + "::" + data + "::" + callback);
		CROSSWEBEX.Invoke("Decrypt", [cipher, data], this.CommonCallback, callback);
	},

	SetSharedAttribute: function (name, value, callback) {
		exlog("SetSharedAttribute", name + "::" + value + "::" + callback);
		CROSSWEBEX.Invoke("setSharedAttribute", [name, value], this.CommonCallback, callback);
	},

	GetSharedAttribute: function (name, callback) {
		exlog("GetSharedAttribute", name + "::" + callback);
		CROSSWEBEX.Invoke("getSharedAttribute", [name], this.CommonCallback, callback);
	},

	ExtendMethod: function (name, value, callback) {
		exlog("ExtendMethod", name + "::" + value);
		CROSSWEBEX.Invoke("ExtendMethod", [name, value], this.CommonCallback, callback);
	},

	MakeINIpluginData: function (encFlag, cipher, data, rurl, callback) {
		exlog("MakeINIpluginData", encFlag + "::" + cipher + "::" + data + "::" + rurl + "::" + callback);
		CROSSWEBEX.Invoke("MakeINIpluginData", [encFlag, cipher, data, rurl], this.CommonCallback, callback);
	},

	PKCS1SignData: function (hashalg, data, callback) {
		exlog("PKCS1SignData", hashalg + "::" + data + "::" + callback);
		CROSSWEBEX.Invoke("PKCS1SignData", [hashalg, data], this.CommonCallback, callback);
	},

	PKCS7SignData: function (hashalg, data, turl, confirm, callback) {
		exlog("PKCS7SignData", hashalg + "::" + data + "::" + turl + "::" + confirm + "::" + callback);
		CROSSWEBEX.Invoke("PKCS7SignData", [hashalg, data, turl, confirm], this.CommonCallback, callback);
	},

	PKCS7SignDataWithMD: function (hashalg, data, turl, callback) {
		exlog("PKCS7SignDataWithMD", hashalg + "::" + data + "::" + turl + "::" + callback);
		CROSSWEBEX.Invoke("PKCS7SignDataWithMD", [hashalg, data, turl], this.CommonCallback, callback);
	},

	PKCS7SignDataWithMDMulti: function (hashalg, data, turl, isVid, callback) {
		exlog("PKCS7SignDataWithMDMulti", hashalg + "::" + data + "::" + turl + "::" + isVid + "::" + callback);
		CROSSWEBEX.Invoke("PKCS7SignDataWithMDMulti", [hashalg, data, turl, isVid], this.CommonCallback, callback);
	},

	PKCS7SignDataWithRandom: function (data, turl, confirm, callback) {
		exlog("PKCS7SignDataWithRandom", data + "::" + turl + "::" + confirm + "::" + callback);
		CROSSWEBEX.Invoke("PKCS7SignDataWithRandom", [data, turl, confirm, ""], this.CommonCallback, callback);
	},

	AddSignerSignedData: function (hashalg, data, turl, isVid, callback) {
		exlog("AddSignerSignedData", hashalg + "::" + data + "::" + turl + "::" + isVid + "::" + callback);
		CROSSWEBEX.Invoke("AddSignerSignedData", [hashalg, data, turl, isVid], this.CommonCallback, callback);
	},	

	CertRequest: function (pkg, storage, dn, pswd, callback) {
		exlog("CertRequest", pkg + "::" + storage + "::" + dn + "::" + pswd + "::" + callback);
		CROSSWEBEX.Invoke("CertRequest", [pkg, storage, dn, pswd], this.CommonCallback, callback);
	},

	CertReissue: function (pkg, storage, dn, pswd, callback) {
		exlog("CertReissue", pkg + "::" + storage + "::" + dn + "::" + pswd + "::" + callback);
		CROSSWEBEX.Invoke("CertReissue", [pkg, storage, dn, pswd], this.CommonCallback, callback);
	},

	CertUpdate: function (pkg, storage, data, callback) {
		exlog("CertUpdate", pkg + "::" + storage + "::" + data + "::" + callback + "::" + callback);
		CROSSWEBEX.Invoke("CertUpdate", [pkg, storage, data], this.CommonCallback, callback);
	},

	DeleteUserCert: function (pkg, storage, cert, callback) {
		exlog("DeleteUserCert", pkg + "::" + storage + "::" + cert + "::" + callback);
		CROSSWEBEX.Invoke("DeleteUserCert", [pkg, storage, cert], this.CommonCallback, callback);
	},

	InsertUserCert: function (pkg, storage, cert, callback) {
		exlog("InsertUserCert", pkg + "::" + storage + "::" + cert + "::" + callback);
		CROSSWEBEX.Invoke("InsertUserCert", [pkg, storage, cert], this.CommonCallback, callback);
	},

	InsertCertToMS: function (callback) {
		exlog("InsertCertToMS", callback);
		CROSSWEBEX.Invoke("InsertCertToMS", [], this.CommonCallback, callback);
	},

	InsertCACert: function (system, cert, callback) {
		exlog("InsertCACert", callback);
		CROSSWEBEX.Invoke("InsertCACert", [system, cert], this.CommonCallback, callback);
	},

	MakeSessionKeyInfo: function (scert, alg, callback) {
		exlog("MakeSessionKeyInfo", scert + "::" + alg + "::" + callback);
		CROSSWEBEX.Invoke("MakeSessionKeyInfo", [scert, alg], this.CommonCallback, callback);
	},

	EncryptWithSKInfo2: function (encSK, value, callback) {
		exlog("EncryptWithSKInfo2", encSK + "::" + value + "::" + callback);
		CROSSWEBEX.Invoke("EncryptWithSKInfo2", [encSK, value], this.CommonCallback, callback);
	},

	SelectFile: function (callback) {
		exlog("SelectFile", callback);
		CROSSWEBEX.Invoke("SelectFile", [], this.CommonCallback, callback);
	},

	UploadEncryptFile: function (url, vf, cipher, filetmp, timeurl, callback) {
		exlog("UploadEncryptFile", url + "::" + vf + "::" + cipher + "::" + timeurl + "::" + callback);
		CROSSWEBEX.Invoke("UploadEncryptFile", [url, vf, cipher, filetmp, timeurl], this.CommonCallback, callback);
	},

	DownloadEncryptFile: function (url, vf, cipher, args, timeurl, callback) {
		exlog("DownloadEncryptFile", url + "::" + vf + "::" + cipher + "::" + timeurl + "::" + callback);
		CROSSWEBEX.Invoke("DownloadencryptFile", [url, vf, cipher, args, timeurl], this.CommonCallback, callback);
	},

	//////////////////////////////
	// 7 function

	SF_CertProcess: function (params, callback) {
		exlog("SF_CertProcess", params + "::" + callback);
		CROSSWEBEX.Invoke("SF_CertProcessPolicy", params, this.CommonCallback, callback);
	},

	//////////////////////////////
	// HTML5 function

	CWEXRequestCmd: function (params, callback) {
		exlog("CWEXRequestCmd", params + "::" + callback);
		CROSSWEBEX.Invoke("CWEXRequestCmd", [params], this.CommonCallback, callback);
	},

	GetVersion: function (callback) {
		exlog("GetVersion", callback);
		CROSSWEBEX.Invoke("GetVersion", [], this.CommonCallback, function(version) {
			const versionArray = version.replaceAll(',', '.').split('.').map(Number); 
			version = versionArray.join('.');
			callback(version);
		});
	},

};
