var debugLog = false;

var Html5Adaptor = (function(){
	var eventWatchDog;
	var countWatchDog = 0;
	var eventCheck = false;
	var initializeEventCheck = function(){
		countWatchDog = 0;
		eventCheck = false;
	};

	var monitoringEvent = function(){

		function initEvent(){
			countWatchDog++;
			if(countWatchDog==10){
				initializeEventCheck();
				clearInterval(eventWatchDog);
			}
//			console.log('[WatchDog]event initialize : ' + countWatchDog);
		};

		if(eventCheck){
			eventWatchDog = setInterval(initEvent, 100);
		}
	};

	function performExcute(excuteFunc){
		if(!eventCheck){
			eventCheck = true;
			// 일정 시간 이 후 초기화를 시킨다.
			setTimeout(monitoringEvent, 1000);

			if(GINI_DYNAMIC_LOAD.isCompleted()){
				excuteFunc();
			}else{
				var intervalId;
				var cnt = 0;
				var step = function() {
					// step key-generation, run algorithm for 100 ms, repeat
					if(!GINI_DYNAMIC_LOAD.isCompleted()) {
						if(cnt == 100){
							if(intervalId){
								clearInterval(intervalId);
								excuteFunc();
							}
//							console.log("--- script loading : time out");
						}
//						console.log("-- script loading : " + cnt);
				    } else {
				    	if(intervalId){
				    		clearInterval(intervalId);
				    	}
//				    	console.log("--- load success : " + GINI_DYNAMIC_LOAD.isCompleted());
				    	excuteFunc();
				    }
					cnt += 1;
				};
				intervalId = setInterval(step, 100);
			}
		}
	};

	var web6Adaptor = (function () {
		var params = {};
		var adCallback;
		var executorPolicy;

		function perfomCertPolicy(policyName){
			executorPolicy(policyName);
		}

		var setParam = function(key, value){
			params[key] = value;
		};

		var getParam = function(key){
			return params[key];
		};

		var setCallback = function(callback){
			adCallback = callback;
		};

		var getCallback = function(){
			return adCallback;
		};

		var setExecutorPolicy = function(executor){
			executorPolicy = executor;
		};

		var clear = function(){
			params = {};
			adCallback = undefined;
			executorPolicy = undefined;
		};
		return {
			clear : clear,
			setParam : setParam,
			getParam : getParam,
			setCallback : setCallback,
			getCallback : getCallback,
			setExecutorPolicy : setExecutorPolicy,
			perfomCertPolicy : perfomCertPolicy
		};
	}());

	var TemporaryInfo = (function () {
		var preserve = {};

		var clear = function(){
			preserve = {};
		};

		var setPreserve = function(key, val){
			preserve[key] = val;
		};

		var getPreserve = function(key){
			return preserve[key];
		};

		return {
			clear : clear,
			setPreserve : setPreserve,
			getPreserve : getPreserve
		};
	}());


	/************************************************************
	 * @brief
	 * @param[in]	data
	 * @param[in]	callback
	 * @param[in]	postdata
	 ************************************************************/
	var PKCS7SignedData = function(data, callback, postdata) {

//		signInfo.type = "value";
//		signInfo.data = data;
//		if (callback) {
//			signInfo.callback = callback;
//		} else {
//			exalert("PKCS7SignedData", "callback function not defined");
//			return;
//		}
//		if (postdata) {
//			signInfo.postdata = postdata;
//		} else {
//			signInfo.postdata = "";
//		}
//
//		crosswebInterface.PKCS7SignData(hashalg, data, turl, false, "CrossWebExWeb6.post_PKCS7SignedData", true);
	};


	/************************************************************
	 * @brief
	 * @param[in]	form
	 * @param[in]	callback
	 * @param[in]	postdata
	 ************************************************************/
	var EncFormVerify = function(form, callback, postdata) {

//		cwui.inipluginAdt.encInfo.vf = 11;//VerifyFlag;
//		encInfo.type = "form1";
//		encInfo.form = form;
//		encInfo.postdata = postdata;
//		if (callback) {
//			encInfo.callback = callback;
//		} else {
//			alert("EncFormVerify : callback function not defined");
//			return;
//		}
//		var elementStr = GatherValue(form, 0, true);
//		crosswebInterface.MakeINIpluginData(encInfo.vf, cipher, elementStr, rurl, "CrossWebExWeb6.post_MakeINIpluginData");
	};

	/************************************************************
	 * @brief
	 * @param[in]	readForm
	 * @param[in]	sendForm
	 * @param[in]	callback
	 * @param[in]	postdata
	 * @param[in]	isNoViewSign
	 ************************************************************/
	var EncFormVerify2 = function (readForm, sendForm, callback, postData, isNoViewSign, defaultStorage) {
		var excuteForm = function(){
			web6Adaptor.clear();

			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}

			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				if(debugLog) console.log("-Web6 EncFormVerify2 Sign Result");
				if(debugLog) console.log(result);

				if(!result){
					result = false;
					
					if ( 'function' === typeof web6Adaptor.getCallback() ) {
						web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true);
					}
					
				}else{
						cwui.inipluginAdt.makeIniPluginData(
				    			RandomURL, 							//고정
				    			cwui.inipluginAdt.encInfo.plantext,		//원문								// 원문
				    			cwui.inipluginAdt.encInfo.vf,			// 버전
				    			vidAttr.VID_CERTIFICATE, 			// 인증서
				    			vidAttr.SIGNATURE, 					// 원문에 대한 PKCS1
				    			vidAttr.VID_RANDOM,					// VID Random
				    			cwui.inipluginAdt.post_MakeINIpluginData
				    	);
				}
				eventCheck = false;
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
				function (policy){
					if(debugLog) console.log("#WEB6 EncFormVerify2 Sign policy : " + policy);

						cwui.inipluginAdt.encInfo.vf = 11;//VerifyFlag;
						cwui.inipluginAdt.encInfo.type = "form2";
						cwui.inipluginAdt.encInfo.readForm = readForm;
						cwui.inipluginAdt.encInfo.sendForm = sendForm;
						cwui.inipluginAdt.encInfo.postdata = postData;
						cwui.inipluginAdt.encInfo.callback = callback;

					    var elementStr = cwui.inipluginAdt.GatherValue(readForm, 0, false);

					    cwui.inipluginAdt.encInfo.plantext = elementStr;

						var selected = cwui.Certs.getSelectedCertInfo();
						// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
						// barosign으로 전자서명을 진행한다.
						if(selected && selected.deviceId === 'BAROSIGN'){
							try{
								cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, elementStr);
							}catch(e){
								INI_HANDLE.handleMessage(e);
							}
						} else {
							var option = {};
							option["SIGN_KIND"] = "PKCS1";
							option["SIGN_PADDING"] = "PKCS1_15";
							// 금결원 포맷 함수는 EUC-KR로 서명 해야 함.
							option["CONTENT_ENCODE"] = {
									"ORIGIRAL_CHAR_SET" : "UTF-8",
									"ORIGIRAL_URL_ENCODE" : false,
									"SIGN_URL_ENCODE" : false,
									"SIGN_CHAR_SET" : "UTF-8"
									};

							option["DEFAULT_STORAGE"] = defaultStorage;
							option["PROPERTY_LIST"] = [];

							if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
								option["NOVIEW_SIGN"] = true;
							} 

							if(readForm.PKCS7SignedData){
								cwui.IniSafeNeo.openCachedLogin(web6Mapping, elementStr, option);
							} else{
								cwui.IniSafeNeo.openMainLoginForm(web6Mapping, elementStr, option);
							}
						}
				}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("EncFormVerify2");
		};

		performExcute(excuteForm);
	};


	var NoCertVerify2 = function( readForm, sendForm, callback, postData ){

		var excuteForm = function(){
		    	cwui.inipluginAdt.encInfo.vf = 11;//VerifyFlag;
		    	cwui.inipluginAdt.encInfo.type = "form2";
		    	cwui.inipluginAdt.encInfo.readForm = readForm;
		    	cwui.inipluginAdt.encInfo.sendForm = sendForm;
		    	cwui.inipluginAdt.encInfo.postdata = postData;

			    if(callback) {
			    	cwui.inipluginAdt.encInfo.callback = callback;
			    } else {
			    	cwalert("NoCertVerify2", "callback function not defined");
					return;
			    }

			    var elementStr = cwui.inipluginAdt.GatherValue(readForm, 0, false);

		    	cwui.inipluginAdt.makeIniPluginData(
		    			rurl,
		    			elementStr,										// 원문
		    			cwui.inipluginAdt.encInfo.vf, 									// 버전
		    			TemporaryInfo.getPreserve("VID_CERTIFICATE"), 	// 인증서
		    			TemporaryInfo.getPreserve("PKCS1SIGNATURE"), 	// 원문에 대한 PKCS1
		    			TemporaryInfo.getPreserve("VID_RANDOM"),		// VID Random
		    			"post_MakeINIpluginData"
		    	);
		    	eventCheck = false;
		};

	    performExcute(excuteForm);
	};

	var EncForm2 = function(readForm, sendForm, callback, postData){
		var excuteForm = function(){
				cwui.inipluginAdt.encInfo.vf = EncFlag;
				cwui.inipluginAdt.encInfo.type = "form2";
				cwui.inipluginAdt.encInfo.readForm = readForm;
				cwui.inipluginAdt.encInfo.sendForm = sendForm;
				cwui.inipluginAdt.encInfo.postdata = postData;
				if(callback) {
					cwui.inipluginAdt.encInfo.callback = callback;
				} else {
					cwalert("EncForm2", "callback function not defined");
					return;
				}

				var elementStr = cwui.inipluginAdt.GatherValue(readForm, 0, false);




	    		cwui.inipluginAdt.makeIniPluginData(
		    			rurl,
		    			elementStr,
		    			CrossWebExWeb6.encInfo.vf,
		    			"",//TemporaryInfo.getPreserve("VID_CERTIFICATE"),
		    			"",//TemporaryInfo.getPreserve("PKCS1SIGNATURE"),
		    			"",//TemporaryInfo.getPreserve("VID_RANDOM"),
		    			"CrossWebExWeb6.post_MakeINIpluginData"
		    	);
	    		eventCheck = false;
		};

		performExcute(excuteForm);
	};

	function removePkcs7Tag(pkcs7){
		pkcs7 = pkcs7.replace("-----BEGIN PKCS7-----", "");
		pkcs7 = pkcs7.replace("-----END PKCS7-----", "");
		pkcs7 = pkcs7.replace("\n", "");

		return pkcs7.trim();
	}

	/**
	 * data : 원문
	 * postdata : 업무에 넘기는 데이터
	 */
	var PKCS7SignVIDFormLogin = function (form, orgData, callback, postData, isCmp, isNoViewSign, defaultStorage) {
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			if(form){
				web6Adaptor.setParam("FORM", form);
			}

			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				//[참고]기존 callback소스 : RunCertPolicyResult(URL, postData, result)
				if(debugLog) console.log("-Web6 Sign Result");
				if(debugLog) console.log(result);

				if(!result){
					result = false;
				}else{

					//TemporaryInfo.setPreserve("PKCS7", removePkcs7Tag(vidAttr.SIGNATURE));
					TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);
					TemporaryInfo.setPreserve("VID_CERTIFICATE", vidAttr.VID_CERTIFICATE);
					TemporaryInfo.setPreserve("VID_RANDOM", vidAttr.VID_RANDOM);

	//				var readForm = web6Adaptor.getParam("FORM");
	//				if(readForm){
	//					readForm.PKCS7SignedData.value = removePkcs7Tag(vidAttr.SIGNATURE);
	//				}

					result = true;
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true);
				}
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
				function (policy){
					function dataSignatureCallback(vidAttr){
						//Step01. PKCS7 필트 저장
						var readForm = web6Adaptor.getParam("FORM");
						if(readForm){
							readForm.PKCS7SignedData.value = removePkcs7Tag(vidAttr.SIGNATURE);
						}

						// Step02. form input data 전체를 서명 하기 위해 리턴
						return CrossWebExWeb6.GatherValue(readForm, 0, false);
					};

					if(debugLog) console.log("#WEB6 policy : " + policy);

					var option = {};
					option["SIGN_KIND"] = "PKCS7";
					option["IN_VID"] = "TRUE";
					option["PKCS7DATA_TO_PKCS1"] = dataSignatureCallback;
					option["DEFAULT_STORAGE"] = defaultStorage;
					option["PROPERTY_LIST"] = [];

					var behavior =  "LOGIN";
					if(isCmp){
						behavior = "CMP";
					}

					if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
						option["NOVIEW_SIGN"] = true;
					} 

					cwui.IniSafeNeo.openMainLoginForm(web6Mapping, orgData, option, behavior);
				}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_LOGIN");
		};
		performExcute(excuteForm);
	};

	var PKCS7SignedLogin = function (data, callback, postData, isCmp, isNoViewSign, subaction, defaultStorage,vid) {
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요

			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				if(debugLog) console.log("-Web6 Sign Result");
				if(debugLog) console.log(result);

				if(!result){
					result = false;
				}else{

					TemporaryInfo.setPreserve("PKCS7", removePkcs7Tag(vidAttr.SIGNATURE));
					TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);
					TemporaryInfo.setPreserve("VID_CERTIFICATE", vidAttr.VID_CERTIFICATE);
					TemporaryInfo.setPreserve("VID_RANDOM", vidAttr.VID_RANDOM);

					result = removePkcs7Tag(vidAttr.SIGNATURE);;
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true);
				}
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
				function (policy){
					if(debugLog) console.log("#WEB6 policy : " + policy);

						var selected = cwui.Certs.getSelectedCertInfo();
						// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
						// barosign으로 전자서명을 진행한다.
						if(selected && selected.deviceId === 'BAROSIGN'){
							try{
								cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, signData);
							}catch(e){
								INI_HANDLE.handleMessage(e);
							}
						} else { 
							var option = {};
							option["SIGN_KIND"] = "PKCS7";

							if ( vid != undefined && vid == true) {
								option["IN_VID"] = "TRUE"
							} else {
								option["IN_VID"] = "FALSE"
							}

							option["PROPERTY_LIST"] = [ ];
							option["SUBACTION"] = subaction;
							option["DEFAULT_STORAGE"] = defaultStorage;

							var behavior = "LOGIN";
							if(isCmp){
								behavior = "CMP";
							}

							if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
								option["NOVIEW_SIGN"] = true;
							} 

							cwui.IniSafeNeo.openMainLoginForm(web6Mapping, data, option, behavior);
						}
				}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_SIGN");
		};
		performExcute(excuteForm);
	};

	// 금결원 포맷
	var PKCS7YesSignData = function (signData, callback, postData, isNoViewSign) {
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요

			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				if(debugLog) console.log("-Web6 YesSign Sign Result");
				if(debugLog) console.log(result);

				if(!result){
					result = false;
				}else{
					TemporaryInfo.setPreserve("PKCS7", removePkcs7Tag(vidAttr.SIGNATURE));
					//TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);

					result = removePkcs7Tag(vidAttr.SIGNATURE);;
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true);
				}
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
				function (policy){
					if(debugLog) console.log("#WEB6 YesSign Sign policy : " + policy);

						var selected = cwui.Certs.getSelectedCertInfo();
						// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
						// barosign으로 전자서명을 진행한다.
						if(selected && selected.deviceId === 'BAROSIGN'){
							try{
								cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, signData);
							}catch(e){
								INI_HANDLE.handleMessage(e);
							}
						} else {
							var option = {};
							option["SIGN_KIND"] = "PKCS7";
							option["YESSIGN_TYPE"] = "TRUE";
							option["SIGN_CHAR_SET"] = "TRUE";

							// 금결원 포맷 함수는 EUC-KR로 서명 해야 함.
							option["CONTENT_ENCODE"] = {
									"ORIGIRAL_CHAR_SET" : "UTF-8",
									"ORIGIRAL_URL_ENCODE" : false,
									"SIGN_URL_ENCODE" : false,
									"SIGN_CHAR_SET" : "EUC-KR",
									};

							option["PROPERTY_LIST"] = [];

							if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
								option["NOVIEW_SIGN"] = true;
							} 

							cwui.IniSafeNeo.openMainSignForm(web6Mapping, signData, option);
						}
				}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_SIGN");
		};
		performExcute(excuteForm);
	};
	
	// 금결원 포맷
	var PKCS7YesSignDataMulti = function (form, signData, callback, postData, isNoViewSign, defaultStorage) {
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요

			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				if(debugLog) console.log("-Web6 YesSign Sign Result");
				if(debugLog) console.log(result);

				if(!result){
					result = false;
				}else{
					TemporaryInfo.setPreserve("PKCS7", removePkcs7Tag(vidAttr.SIGNATURE));
					//TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);

					var allSignature = vidAttr.SIGNATURE;					
					var arrSignature = allSignature.split(cwui.defaultConf.Signature.MultiDelimiter);

					if ( 1 === arrSignature.length ) {
						var removePkcs7TagVal = removePkcs7Tag(arrSignature[0]);
						
						form.elements["PKCS7SignedData0"].value = removePkcs7TagVal;
						form.elements["PKCS7SignedData"].value  = removePkcs7TagVal;
						
					} else {
						for ( var i=0; i<arrSignature.length; i++ ) {
							var fieldName = "PKCS7SignedData";

							if ( arrSignature.length-1 != i ) {
								fieldName += i;
							}
							form.elements[fieldName].value = removePkcs7Tag(arrSignature[i]);
						}
					}
					
					result = true;
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true);
				}
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
				function (policy){
					if(debugLog) console.log("#WEB6 YesSign Sign policy : " + policy);

						var selected = cwui.Certs.getSelectedCertInfo();
						// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
						// barosign으로 전자서명을 진행한다.
						if(selected && selected.deviceId === 'BAROSIGN'){
							try{
								cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, signData);
							}catch(e){
								INI_HANDLE.handleMessage(e);
							}
						} else {
							var option = {};
							option["SIGN_KIND"] = "PKCS7";
							option["YESSIGN_TYPE"] = "TRUE";
							option["SIGN_CHAR_SET"] = "TRUE";

							// 금결원 포맷 함수는 EUC-KR로 서명 해야 함.
							option["CONTENT_ENCODE"] = {
									"ORIGIRAL_CHAR_SET" : "UTF-8",
									"ORIGIRAL_URL_ENCODE" : false,
									"SIGN_URL_ENCODE" : false,
									"SIGN_CHAR_SET" : "EUC-KR",
									};

							option["DEFAULT_STORAGE"] = defaultStorage;
							option["PROPERTY_LIST"] = [];

							if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
								option["NOVIEW_SIGN"] = true;
							} 

							cwui.IniSafeNeo.openMainSignForm(web6Mapping, signData, option);
						}
				}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_SIGN");
		};
		performExcute(excuteForm);
	};

	// PDF 원본없는 전자서명
	var PKCS7PDFSignData = function (signData, callback, postData, isMultiSign, isNoViewSign, defaultStorage, vid) {
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요

			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				if(debugLog) console.log("-Web6 YesSign Sign Result");
				if(debugLog) console.log(result);

				if(!result){
					result = false;
				}else{

					TemporaryInfo.setPreserve("PKCS7", removePkcs7Tag(vidAttr.SIGNATURE));
					//TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);

					result = removePkcs7Tag(vidAttr.SIGNATURE);;
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true);
				}
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
					function (policy){
						if(debugLog) console.log("#WEB6 YesSign Sign policy : " + policy);

							var selected = cwui.Certs.getSelectedCertInfo();
							// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
							// barosign으로 전자서명을 진행한다.
							if(selected && selected.deviceId === 'BAROSIGN'){
								try{
									cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, signData);
								}catch(e){
									INI_HANDLE.handleMessage(e);
								}
							} else {

								var option = {};
								option["SIGN_KIND"] = "PKCS7";		//서명종류
								option["CONTENT_HASH"] = "FALSE";	//원문 해쉬 여부
								option["SIGN_CHAR_SET"] = "TRUE";
								if ( isMultiSign )
									option["PDF_SIGN_TYPE"] = "MULTI";
								else
									option["PDF_SIGN_TYPE"] = "TRUE";

								if ( vid != undefined && vid == true) {
									option["IN_VID"] = "TRUE"
								} else {
									option["IN_VID"] = "FALSE"
								}
								
								option["DEFAULT_STORAGE"] = defaultStorage;

								option["CONTENT_ENCODE"] = {
										"ORIGIRAL_CHAR_SET" : "UTF-8",
										"ORIGIRAL_URL_ENCODE" : false,
										"SIGN_URL_ENCODE" : false,
										"SIGN_CHAR_SET" : "EUC-KR",
										};

								option["PROPERTY_LIST"] = [];

								if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
									option["NOVIEW_SIGN"] = true;
								} 

								cwui.IniSafeNeo.openMainSignForm(web6Mapping, signData, option);
							}
					}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_SIGN");
		};
		performExcute(excuteForm);
	};

	var PKCS7SignedDataForm = function (form, signData, callback, postData, isInnerView, isNoViewSign, defaultStorage) {
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			if(form){
				web6Adaptor.setParam("FORM", form);
			}

			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				//[참고]기존 callback소스 : RunCertPolicyResult(URL, postData, result)
				if(debugLog) console.log("-Web6 Sign Result");
				if(debugLog) console.log(result);

				if(!result){
					result = false;
				}else{

					TemporaryInfo.setPreserve("PKCS7", removePkcs7Tag(vidAttr.SIGNATURE));
					TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);
					TemporaryInfo.setPreserve("VID_CERTIFICATE", vidAttr.VID_CERTIFICATE);
					TemporaryInfo.setPreserve("VID_RANDOM", vidAttr.VID_RANDOM);

					var readForm = web6Adaptor.getParam("FORM");
					if(readForm){
						readForm.PKCS7SignedData.value = removePkcs7Tag(vidAttr.SIGNATURE);
					}

					//result = true;
					result = removePkcs7Tag(vidAttr.SIGNATURE)
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true);
				}
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
				function (policy){
					function dataSignatureCallback(vidAttr){
						//Step01. PKCS7 필트 저장
						var readForm = web6Adaptor.getParam("FORM");
						if(readForm){
							readForm.PKCS7SignedData.value = removePkcs7Tag(vidAttr.SIGNATURE);
						}

						// Step02. form input data 전체를 서명 하기 위해 리턴
						return CrossWebExWeb6.GatherValue(readForm, 0, false);
					};

					if(debugLog) console.log("#WEB6 policy : " + policy);

						var selected = cwui.Certs.getSelectedCertInfo();
						// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
						// barosign으로 전자서명을 진행한다.
						if(selected && selected.deviceId === 'BAROSIGN'){
							try{
								cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, signData);
							}catch(e){
								INI_HANDLE.handleMessage(e);
							}
						} else {
							var option = {};
							option["SIGN_KIND"] = "PKCS7";
							option["IN_VID"] = "TRUE";
							// 전자서명 데이터에 대한 PKCS1서명이 필요 함.
							//option["PKCS7DATA_TO_PKCS1"] = dataSignatureCallback;
							option["DEFAULT_STORAGE"] = defaultStorage;
							option["PROPERTY_LIST"] = [];

							if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
								option["NOVIEW_SIGN"] = true;
							} 

							if(isInnerView){
								cwui.IniSafeNeo.openInnerSignForm(web6Mapping, signData, option);
							} else{
								cwui.IniSafeNeo.openMainSignForm(web6Mapping, signData, option);
							}
						}
				}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_SIGN");
		};
		performExcute(excuteForm);
	};

	// [21.11.16] Namsu change - base64Dec 파라미터를 추가해서 base64 인코딩된 원문을 내부에서 디코딩해서 처리할 수 있도록 지원
	var PKCS7SignedDataSign = function (signData, callback, postData, isInnerView, isNoViewSign, defaultStorage, vid, base64Dec, subaction) {
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				var issuerO = "";

				if(debugLog) console.log("-Web6 Sign Result");
				if(debugLog) console.log(result);

				if(!result){
					result = false;
				}else{
					//TemporaryInfo.setPreserve("PKCS7", removePkcs7Tag(vidAttr.SIGNATURE));
					TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);
					TemporaryInfo.setPreserve("VID_CERTIFICATE", vidAttr.VID_CERTIFICATE);
					TemporaryInfo.setPreserve("VID_RANDOM", vidAttr.VID_RANDOM);

					result = removePkcs7Tag(vidAttr.SIGNATURE);
					issuerO = vidAttr.ISSUER_O;
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					// [21.11.16] Namsu change - 지정된 콜백 함수에 추출한 인증서 발급 기관 정보를 넘겨주도록 수정
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true, issuerO);
				}
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
					function (policy){
						if(debugLog) console.log("#WEB6 policy : " + policy);

							var selected = cwui.Certs.getSelectedCertInfo();
							// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
							// barosign으로 전자서명을 진행한다.
							if(selected && selected.deviceId === 'BAROSIGN'){
								try{
									cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, signData);
								}catch(e){
									INI_HANDLE.handleMessage(e);
								}
							} else {
								var option = {};
								option["SIGN_KIND"] = "PKCS7";
								
								if ( vid != undefined && vid == true) {
									option["IN_VID"] = "TRUE";
								} else {
									option["IN_VID"] = "FALSE";
								}

	//							option["PKCS7DATA_TO_PKCS1"] = dataSignatureCallback;
								option["DEFAULT_STORAGE"] = defaultStorage;
								option["PROPERTY_LIST"] = [];
								
								// [21.11.16] Namsu add - 다음과 같이 인코딩 정보를 설정해서 CS에서 전자서명하기 전까지 인코딩한 값이 변경되지 않도록 유지시킨다.
								if ( base64Dec !== undefined && base64Dec === true ) {
									option["BASE64_DEC"] = "TRUE";
									// 아래와 같은 Encode 값을 설정하지 않으면 전달하는 base64 encoding된 값이 변환된다.
									option["CONTENT_ENCODE"] = {
										"ORIGIRAL_CHAR_SET" : "UTF-8",
										"ORIGIRAL_URL_ENCODE" : false,
										"SIGN_URL_ENCODE" : false,
										"SIGN_CHAR_SET" : "UTF-8"
									};	
								}
								else {
									option["BASE64_DEC"] = "FALSE";
								}
								
								option["SUBACTION"] = subaction;

								if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
									option["NOVIEW_SIGN"] = true;
								} 

								if(isInnerView){
									cwui.IniSafeNeo.openInnerSignForm(web6Mapping, signData, option);
								} else{
									cwui.IniSafeNeo.openMainSignForm(web6Mapping, signData, option);
								}
							}
					}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_SIGN");
		};
		performExcute(excuteForm);
	};

	// [21.11.16] Namsu change - base64Dec 파라미터를 추가해서 base64 인코딩한 원문을 전자서명 직전에 디코딩해서 처리할 수 있도록 지원
	var PKCS7SignedDataSignMulti = function (form, signData, callback, postData, isInnerView, options, isNoViewSign, defaultStorage, vid, base64Dec) {
		if ( typeof options === "undefined" || options === null ) {
			options = {};
		}
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			var web6Mapping = function (result, vidAttr) {
				
				var useForm = true;
				var signedData = {};
				var issuerO = "";

				if(debugLog) console.log("-Web6 Sign Result");
				if(debugLog) console.log(result);

				if ( typeof form === "undefined" || form === null || form === "" ) {
					useForm = false;
				}

				if(!result){
					result = false;
				}else{
					
					//TemporaryInfo.setPreserve("PKCS7", removePkcs7Tag(vidAttr.SIGNATURE));
					TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);
					TemporaryInfo.setPreserve("VID_CERTIFICATE", vidAttr.VID_CERTIFICATE);
					TemporaryInfo.setPreserve("VID_RANDOM", vidAttr.VID_RANDOM);

					var allSignature = vidAttr.SIGNATURE;
					var arrSignature = allSignature.split(cwui.defaultConf.Signature.MultiDelimiter);

					if ( 1 === arrSignature.length ) {
						var removePkcs7TagVal = removePkcs7Tag(arrSignature[0]);
						
						if (useForm) {
							form.elements["PKCS7SignedData0"].value = removePkcs7TagVal;
							form.elements["PKCS7SignedData"].value  = removePkcs7TagVal;
						} else {
							signedData["PKCS7SignedData0"] = removePkcs7TagVal;
							signedData["PKCS7SignedData"] = removePkcs7TagVal;
						}

					} else {
						for ( var i=0; i<arrSignature.length; i++ ) {
							var fieldName = "PKCS7SignedData";

							if ( arrSignature.length-1 != i ) {
								fieldName += i;
							}
							if (useForm) {
								form.elements[fieldName].value = removePkcs7Tag(arrSignature[i]);
							} else {
								signedData[fieldName] = removePkcs7Tag(arrSignature[i]);;
							}
						}
					}
					
					issuerO = vidAttr.ISSUER_O;
					result = true;
					//result = removePkcs7Tag(vidAttr.SIGNATURE);
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					// [21.11.16] Namsu change - 지정된 콜백 함수에 추출한 인증서 발급 기관 정보를 넘겨주도록 수정
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), issuerO, true, signedData);
					
				}
			};


			var web6MappingExtOption = function (result, vidAttr) {

				if(debugLog) console.log("-Web6 Sign Result");
				if(debugLog) console.log(result);

				if(!result){
					result = false;
				}else{
					if ( typeof options.useExtandOption !== "undefined" && 
						 options.useExtandOption ) {

					}
					//TemporaryInfo.setPreserve("PKCS7", removePkcs7Tag(vidAttr.SIGNATURE));
					TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);
					TemporaryInfo.setPreserve("VID_CERTIFICATE", vidAttr.VID_CERTIFICATE);
					TemporaryInfo.setPreserve("VID_RANDOM", vidAttr.VID_RANDOM);

					var signresults2Array = function(SignResult) {
						var retarr = [];
						if ( typeof SignResult !== "undefined" && SignResult != null ) {
							retarr = SignResult.split(cwui.defaultConf.Signature.MultiDelimiter);
						}
						return retarr;
					}

					var allSignature = vidAttr.SIGNATURE;
					var allVIDRandom = vidAttr.VID_RANDOM;
					var allKISAVID = vidAttr.KISA_VID;
					var allVidCertificate = vidAttr.VID_CERTIFICATE;
					var allPKCS1Sig = vidAttr.PKCS1_SIGNATURE;
					
					var arrSignature = signresults2Array(allSignature);
					var arrVIDRandom = signresults2Array(allVIDRandom);
					var arrKISAVID = signresults2Array(allKISAVID);
					var arrVidCertificate = signresults2Array(allVidCertificate);
					var arrPKCS1Sig = signresults2Array(allPKCS1Sig);
					
					var arrMultiSigData = [];
					var SetObjKeyValue = function (Obj, arrAttr, key) {
						if ( arrAttr.length >= i+1 )
						{
							Obj[key] = arrAttr[i];
						}
					}
					for ( var i=0; i < arrSignature.length; i++ ) {
						var Obj = {};
						SetObjKeyValue(Obj, arrSignature, "SIGNATURE");
						SetObjKeyValue(Obj, arrVIDRandom, "VID_RANDOM");
						SetObjKeyValue(Obj, arrKISAVID, "KISA_VID");
						SetObjKeyValue(Obj, arrVidCertificate, "VID_CERTIFICATE");
						SetObjKeyValue(Obj, arrPKCS1Sig, "PKCS1_SIGNATURE");
						
						arrMultiSigData.push(Obj);
					}

					if ( 1 === arrMultiSigData.length ) {
						var sigResult = arrSignature[0];
						
						form.elements["PKCS7SignedData0"].value = JSON.stringify(arrMultiSigData[0]);
						form.elements["PKCS7SignedData"].value  = JSON.stringify(arrMultiSigData[0]);
						
					} else {
						for ( var i=0; i<arrMultiSigData.length; i++ ) {
							var fieldName = "PKCS7SignedData";
							
							if ( (arrMultiSigData.length - 1) != i ) {
								fieldName += i;
							}
							form.elements[fieldName].value = JSON.stringify(arrMultiSigData[i]);
						}
					}
					
					result = true;
					//result = removePkcs7Tag(vidAttr.SIGNATURE);
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true);
				}
			};

			if ( typeof options.useExtandOption !== "undefined" && 
				 options.useExtandOption ) {
				web6Mapping = web6MappingExtOption;
			}			

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
					function (policy){
						if(debugLog) console.log("#WEB6 policy : " + policy);

							var selected = cwui.Certs.getSelectedCertInfo();
							// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
							// barosign으로 전자서명을 진행한다.
							if(selected && selected.deviceId === 'BAROSIGN'){
								try{
									cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, signData);
								}catch(e){
									INI_HANDLE.handleMessage(e);
								}
							} else {
								var option = {};
								var SetExtandOption = function (signOption, argOption) {
									if ( typeof argOption === "undefined" ) {
										return ;
									}
									
									if ( typeof argOption.extandOption === "undefined" ) {
										return ;
									}

									if ( typeof argOption.useExtandOption !== "undefined" && 
										argOption.useExtandOption ) {
										signOption["USE_MULTISIGN_EXTAND_OPTION"] = "TRUE";
									}

									if ( typeof argOption.extandOption.removeContent !== "undefined" && 
										argOption.extandOption.removeContent ) {
										signOption["REMOVE_CONTENT"] = "TRUE";
									}

									if ( typeof argOption.extandOption.removeTimestamp !== "undefined" && 
										argOption.extandOption.removeTimestamp ) {
										signOption["REMOVE_TIME_STAMP"] = "TRUE";
									}

									if ( typeof argOption.extandOption.removeSignedAttribute !== "undefined" && 
										argOption.extandOption.removeSignedAttribute ) {
										signOption["REMOVE_SIGNED_ATTRIBUTE"] = "TRUE";
									}

									if ( typeof argOption.extandOption.encSrvCert !== "undefined" && 
										argOption.extandOption.encSrvCert ) {
										signOption["ENC_SRVCERT"] = options.extandOption.encSrvCert;
									}
								}

								option["SIGN_KIND"] = "PKCS7";

								if ( vid != undefined && vid == true) {
									option["IN_VID"] = "TRUE"
								} else {
									option["IN_VID"] = "FALSE"
								}

								//option["PKCS7DATA_TO_PKCS1"] = dataSignatureCallback;
								option["DEFAULT_STORAGE"] = defaultStorage;
								SetExtandOption(option, options);
								option["PROPERTY_LIST"] = [];

								if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
									option["NOVIEW_SIGN"] = true;
								}

								// [21.11.16] Namsu add - 다음과 같이 인코딩 정보를 설정해서 CS에서 전자서명하기 전까지 인코딩한 값이 변경되지 않도록 유지시킨다.
								if ( base64Dec !== undefined && base64Dec === true ) {
									option["BASE64_DEC"] = "TRUE";
									// 아래와 같은 Encode 값을 설정하지 않으면 전달하는 base64 encoding된 값이 변환된다.
									option["CONTENT_ENCODE"] = {
										"ORIGIRAL_CHAR_SET" : "UTF-8",
										"ORIGIRAL_URL_ENCODE" : false,
										"SIGN_URL_ENCODE" : false,
										"SIGN_CHAR_SET" : "UTF-8"
									};
								}
								else {
									option["BASE64_DEC"] = "FALSE";
								}

								if(isInnerView){
									cwui.IniSafeNeo.openInnerSignForm(web6Mapping, signData, option);
								} else{
									cwui.IniSafeNeo.openMainSignForm(web6Mapping, signData, option);
								}
							}
					}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_SIGN");
		};
		performExcute(excuteForm);
	};

	var PKCS7SignedDataWithOption = function (signData, callback, postData, options, isNoViewSign) {
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				if(debugLog) console.log("-Web6 Sign Result");
				if(debugLog) console.log(result);

				var reponses = [];

				if(!result){
					reponses["RESULT"] = false;
				}else{
					TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);
					TemporaryInfo.setPreserve("VID_CERTIFICATE", vidAttr.VID_CERTIFICATE);
					TemporaryInfo.setPreserve("VID_RANDOM", vidAttr.VID_RANDOM);
					TemporaryInfo.setPreserve("KISA_VID", vidAttr.KISA_VID);
					TemporaryInfo.setPreserve("PKCS1_SIGNATURE", vidAttr.PKCS1_SIGNATURE);

					reponses["RESULT"] = true;
					reponses["SIGNATURE"] = removePkcs7Tag(vidAttr.SIGNATURE);
					reponses["VID_RANDOM"] = vidAttr.VID_RANDOM;
					reponses["KISA_VID"] = vidAttr.KISA_VID;
					reponses["VID_CERTIFICATE"] = vidAttr.VID_CERTIFICATE;
					reponses["PKCS1_SIGNATURE"] = vidAttr.PKCS1_SIGNATURE;
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(reponses, web6Adaptor.getParam("POST_DATA"), true);
				}
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
					function (policy){
						if(debugLog) console.log("#WEB6 policy : " + policy);

							var selected = cwui.Certs.getSelectedCertInfo();
							// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
							// barosign으로 전자서명을 진행한다.
							if(selected && selected.deviceId === 'BAROSIGN'){
								try{
									cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, signData);
								}catch(e){
									INI_HANDLE.handleMessage(e);
								}
							} else {
								var option = {};
								option["SIGN_KIND"] = "PKCS7";
								option["IN_VID"] = "TRUE";

								if(true == options.extandOption.removeContent) {
									option["REMOVE_CONTENT"] = "TRUE";
								}

								if(true == options.extandOption.removeTimestamp) {
									option["REMOVE_TIME_STAMP"] = "TRUE";
								}

								if(true == options.extandOption.removeSignedAttribute) {
									option["REMOVE_SIGNED_ATTRIBUTE"] = "TRUE";
								}

								if(options.extandOption.encSrvCert) {
									option["ENC_SRVCERT"] = options.extandOption.encSrvCert;
								}

								if(options.defaultStorage) {
									option["DEFAULT_STORAGE"] = options.defaultStorage;
								}
								
								option["PROPERTY_LIST"] = [];

								if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
									option["NOVIEW_SIGN"] = true;
								} 

								if(options.isInnerView){
									cwui.IniSafeNeo.openInnerSignForm(web6Mapping, signData, option);
								} else{
									cwui.IniSafeNeo.openMainSignForm(web6Mapping, signData, option);
								}
							}
					}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_SIGN");
		};
		performExcute(excuteForm);
	};

	var PKCS7SignKoreaData = function (signData, callback, postData, isInnerView, isNoViewSign, defaultStorage) {
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				if(debugLog) console.log("-Web6 Sign Result");
				if(debugLog) console.log(result);

				if(!result){
					result = false;
				}else{
					//TemporaryInfo.setPreserve("PKCS7", removePkcs7Tag(vidAttr.SIGNATURE));
					TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);
					TemporaryInfo.setPreserve("VID_CERTIFICATE", vidAttr.VID_CERTIFICATE);
					TemporaryInfo.setPreserve("VID_RANDOM", vidAttr.VID_RANDOM);

					result = removePkcs7Tag(vidAttr.SIGNATURE);
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true);
				}
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
					function (policy){
						if(debugLog) console.log("#WEB6 policy : " + policy);

							var selected = cwui.Certs.getSelectedCertInfo();
							// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
							// barosign으로 전자서명을 진행한다.
							if(selected && selected.deviceId === 'BAROSIGN'){
								try{
									cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, signData);
								}catch(e){
									INI_HANDLE.handleMessage(e);
								}
							} else {
								var option = {};
								option["SIGN_KIND"] = "PKCS7";
								option["IN_VID"] = "FALSE";
								option["REMOVE_SIGNED_ATTRIBUTE"] = "TRUE";
								option["DEFAULT_STORAGE"] = defaultStorage;
								option["PROPERTY_LIST"] = [];

								if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
									option["NOVIEW_SIGN"] = true;
								} 

								if(isInnerView){
									cwui.IniSafeNeo.openInnerSignForm(web6Mapping, signData, option);
								} else{
									cwui.IniSafeNeo.openMainSignForm(web6Mapping, signData, option);
								}
							}
					}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_SIGN");
		};
		performExcute(excuteForm);
	};

	var PKCS7SignKoreaLogin = function (data, callback, postData, isCmp, isNoViewSign) {
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요

			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				if(debugLog) console.log("-Web6 Sign Result");
				if(debugLog) console.log(result);

				if(!result){
					result = false;
				}else{

					TemporaryInfo.setPreserve("PKCS7", removePkcs7Tag(vidAttr.SIGNATURE));
					TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);
					TemporaryInfo.setPreserve("VID_CERTIFICATE", vidAttr.VID_CERTIFICATE);
					TemporaryInfo.setPreserve("VID_RANDOM", vidAttr.VID_RANDOM);

					result = removePkcs7Tag(vidAttr.SIGNATURE);;
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true);
				}
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
				function (policy){
					if(debugLog) console.log("#WEB6 policy : " + policy);

						var selected = cwui.Certs.getSelectedCertInfo();
						// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
						// barosign으로 전자서명을 진행한다.
						if(selected && selected.deviceId === 'BAROSIGN'){
							try{
								cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, signData);
							}catch(e){
								INI_HANDLE.handleMessage(e);
							}
						} else {
							var option = {};
							option["SIGN_KIND"] = "PKCS7";
							option["IN_VID"] = "FALSE";
							option["REMOVE_SIGNED_ATTRIBUTE"] = "TRUE";
							option["PROPERTY_LIST"] = [];

							var behavior =  "LOGIN";
							if(isCmp){
								behavior = "CMP";
							}

							if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
								option["NOVIEW_SIGN"] = true;
							} 

							cwui.IniSafeNeo.openMainLoginForm(web6Mapping, data, option, behavior);
						}
				}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_SIGN");
		};
		performExcute(excuteForm);
	};

	var PKCS1SignedDataSign = function (signData, callback, postData, isInnerView, isNoViewSign, defaultStorage) {
		var excuteForm = function(){
			web6Adaptor.clear();
			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				if(debugLog) console.log("-Web6 Sign Result");
				if(debugLog) console.log(result);

				if(!result){
					result = false;
				}else{
					TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);
					TemporaryInfo.setPreserve("VID_CERTIFICATE", vidAttr.VID_CERTIFICATE);
					TemporaryInfo.setPreserve("VID_RANDOM", vidAttr.VID_RANDOM);

					result = vidAttr.SIGNATURE;
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true);
				}
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
					function (policy){
						if(debugLog) console.log("#WEB6 policy : " + policy);

							var selected = cwui.Certs.getSelectedCertInfo();
							// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
							// barosign으로 전자서명을 진행한다.
							if(selected && selected.deviceId === 'BAROSIGN'){
								try{
									cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, signData);
								}catch(e){
									INI_HANDLE.handleMessage(e);
								}
							} else {
								var option = {};
								option["SIGN_KIND"] = "PKCS1";
								option["SIGN_PADDING"] = "PKCS1_15";
								option["DEFAULT_STORAGE"] = defaultStorage;
								option["PROPERTY_LIST"] = [];

								if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
									option["NOVIEW_SIGN"] = true;
								} 

								if(isInnerView){
									cwui.IniSafeNeo.openInnerSignForm(web6Mapping, signData, option);
								} else{
									cwui.IniSafeNeo.openMainSignForm(web6Mapping, signData, option);
								}
							}
					}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_SIGN");
		};
		performExcute(excuteForm);
	};

	var PKCS1SignedDataForm = function (form, signData, callback, postData, isInnerView, isNoViewSign, defaultStorage) {
		var excuteForm = function(){
			web6Adaptor.clear();
			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			if(form){
				web6Adaptor.setParam("FORM", form);
			}

			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				if(debugLog) console.log("-Web6 Sign Result");
				if(debugLog) console.log(result);

				if(!result){
					result = false;
				}else{
					TemporaryInfo.setPreserve("PKCS1SIGNATURE", vidAttr.PKCS7DATA_FROM_PKCS1);
					TemporaryInfo.setPreserve("VID_CERTIFICATE", vidAttr.VID_CERTIFICATE);
					TemporaryInfo.setPreserve("VID_RANDOM", vidAttr.VID_RANDOM);

					var readForm = web6Adaptor.getParam("FORM");
					if(readForm){
						readForm.PKCS1SignedData.value = vidAttr.PKCS7DATA_FROM_PKCS1;
					}

					result = true;
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true);
				}
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
					function (policy){
						if(debugLog) console.log("#WEB6 policy : " + policy);

							var selected = cwui.Certs.getSelectedCertInfo();
							// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
							// barosign으로 전자서명을 진행한다.
							if(selected && selected.deviceId === 'BAROSIGN'){
								try{
									cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, signData);
								}catch(e){
									INI_HANDLE.handleMessage(e);
								}
							} else {
								var option = {};
								option["SIGN_KIND"] = "PKCS1";
								option["SIGN_PADDING"] = "PKCS1_15";
								option["DEFAULT_STORAGE"] = defaultStorage;
								option["PROPERTY_LIST"] = [];

								if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
									option["NOVIEW_SIGN"] = true;
								} 

								if(isInnerView){
									cwui.IniSafeNeo.openInnerSignForm(web6Mapping, signData, option);
								} else{
									cwui.IniSafeNeo.openMainSignForm(web6Mapping, signData, option);
								}
							}
					}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_SIGN");
		};
		performExcute(excuteForm);
	};

	var AddSignerSignedData = function (signData, callback, postData, options, isNoViewSign) {
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			if(postData){
				web6Adaptor.setParam("POST_DATA", postData);
			}
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, vidAttr){
				if(debugLog) console.log("-Web6 Sign Result");
				if(debugLog) console.log(result);

				var reponses = [];

				if(!result){
					result = false;
				}else{
					result = removePkcs7Tag(vidAttr.SIGNATURE);
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, web6Adaptor.getParam("POST_DATA"), true);
				}
			};

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
					function (policy){
						if(debugLog) console.log("#WEB6 policy : " + policy);

							var selected = cwui.Certs.getSelectedCertInfo();
							// 로그인을 barosign으로 한 경우 html5창 및 qr없이 push를 이용하여
							// barosign으로 전자서명을 진행한다.
							if(selected && selected.deviceId === 'BAROSIGN'){
								try{
									cwui.StorageManage.getBaroSignPolicy(cwui.constants.WebForm.ACTION_SIGN, signData);
								}catch(e){
									INI_HANDLE.handleMessage(e);
								}
							} else {
								var option = {};
								option["SIGN_KIND"] = "PKCS7";
								option["IN_VID"] = "TRUE";

								if(options.defaultStorage) {
									option["DEFAULT_STORAGE"] = options.defaultStorage;
								}

								if(true == options.addPKCS7Sign) {
									option["ADD_PKCS7_SIGN"] = "TRUE";
									option["SIGNED_PKCS7_DATA"] = options.pkcs7SignedData;
								}
								
								option["PROPERTY_LIST"] = [];

								if ((isNoViewSign != undefined) && (isNoViewSign == true)) {
									option["NOVIEW_SIGN"] = true;
								} 

								if(options.isInnerView){
									cwui.IniSafeNeo.openInnerSignForm(web6Mapping, signData, option);
								} else{
									cwui.IniSafeNeo.openMainSignForm(web6Mapping, signData, option);
								}
							}
					}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_SIGN");
		};
		performExcute(excuteForm);
	};

	var CertManagerWithForm = function (taskNm, ProcessCallback, defaultStorage){
		var excuteForm = function(){
				cwui.IniSafeNeo.openMainCertManageForm(taskNm, ProcessCallback, defaultStorage);
			eventCheck = false;
		};
		performExcute(excuteForm);
	};

	var CertImportV13WithForm = function(option, callback) {
		var excuteForm = function(){
				cwui.IniSafeNeo.openCertImportV13Form(option, callback);
			eventCheck = false;
		};
		performExcute(excuteForm);
	};

	var CertExportV13WithForm = function(option, callback) {
		var excuteForm = function(){
				cwui.IniSafeNeo.openCertExportV13Form(option, callback);
			eventCheck = false;
		};
		performExcute(excuteForm);
	};

	var CertExportInihubWithForm = function(option, callback) {
		var excuteForm = function(){
				cwui.IniSafeNeo.openCertExportInihubForm(option, callback);
			eventCheck = false;
		};
		performExcute(excuteForm);
	};

	var CertImportV12WithForm = function(option, callback) {
		var excuteForm = function(){
				cwui.IniSafeNeo.openCertImportV12Form(option, callback);
			eventCheck = false;
		};
		performExcute(excuteForm);
	};

	var CertExportV12WithForm = function(option, callback) {
		var excuteForm = function(){
				cwui.IniSafeNeo.openCertExportV12Form(option, callback);
			eventCheck = false;
		};
		performExcute(excuteForm);
	};

	var CertImportV11WithForm = function() {
		var excuteForm = function(){
				cwui.IniSafeNeo.openCertImportV11Form();
			eventCheck = false;
		};
		performExcute(excuteForm);
	};

	var CertExportV11WithForm = function() {
		var excuteForm = function(){
				cwui.IniSafeNeo.openCertExportV11Form();
			eventCheck = false;
		};
		performExcute(excuteForm);
	};

	var CertExportBrowserV12WithForm = function(option, callback) {
		var excuteForm = function() {
			cwui.IniSafeNeo.openBrowserCertExportV12Form(option, callback);
			eventCheck = false;
		};
		performExcute(excuteForm);
	};

	var CertImportBrowserV12WithForm = function(option, callback) {
		var excuteForm = function() {
			cwui.IniSafeNeo.openBrowserCertImportV12Form(option, callback);
			eventCheck = false;
		};
		performExcute(excuteForm);
	};

	var CertExportInihubV12WithForm = function(pubKey, callback) {
		var excuteForm = function(){
			cwui.IniSafeNeo.openInihubCertExportV12Form(pubKey, callback);
			eventCheck = false;
		};
		performExcute(excuteForm);
	};

	/**
	 * 클라우드 인증서 가져오기 
	 * @param {function} ProcessCallback 콜백함수
	 */
	var ImportCloudCert = function(ProcessCallback) {
		var excuteForm = function() {
			cwui.IniSafeNeo.openImportCloudCertForm(ProcessCallback);
			eventCheck = false;
		};
		performExcute(excuteForm);
	}

	/**
	 * 클라우드 인증서 내보내기
	 * @param {function} ProcessCallback 콜백함수
	 */
	var ExportCloudCert = function(ProcessCallback) {
		var excuteForm = function() {
			cwui.IniSafeNeo.openExportCloudCertForm(ProcessCallback);
			eventCheck = false;
		};
		performExcute(excuteForm);
	}

	/**
	 * 클라우드 서비스 사용여부 설정
	 * @param {function} use 사용여부
	 */
	var setUseOpenstorage = function(use){
		var excuteForm = function() {
			cwui.IniSafeNeo.setUseOpenstorage(use);
			eventCheck = false;
		};
		performExcute(excuteForm);

	}

	/**
	 * 비밀번호 재시도 회수 초과된 인증서 정보 획득
	 * @param {function} callback
	 */
	var getOverRetryCertInfo = function(callback){
		var excuteForm = function() {
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			web6Adaptor.setCallback(callback);

			if ( 'function' === typeof web6Adaptor.getCallback() ) {
				web6Adaptor.getCallback()(JSON.parse(sessionStorage.getItem("WRONG_PW_CERT_INFO")));
			}

			eventCheck = false;
		};
		performExcute(excuteForm);

	}

	function IssueCertificate_INITECH(option, callback){
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, param){
				if(debugLog) console.log("-WEB6_ISSUE Result");
				if(debugLog) console.log(result);
				//[참고] 기존 callback소스 : CertProcessResult(URL, postData, result)
				if(result || (result.STATE && result.STATE == "SUCCEEDED")){
					result = "true";
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, true);
				}
				
			}

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
				function (policy){
					if(debugLog) console.log("#WEB6_ISSUE policy : " + policy);
					
						var issureInfo = {};
						issureInfo.CA_NAME = "INITECH";
						//issureInfo.DEFAULT_STORAGE = option.defaultStorage;
						cwui.IniSafeNeo.openMainCertIssueForm(issureInfo, web6Mapping, option);
				}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_ISSUE");
		};
		performExcute(excuteForm);
		
		
		
		
	};
	
	function IssueCertificate(caName, szRef, szCode, callback, certId, defaultStorage){
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, param){
				if(debugLog) console.log("-WEB6_ISSUE Result");
				if(debugLog) console.log(result);
				//[참고] 기존 callback소스 : CertProcessResult(URL, postData, result)
				if(result || (result.STATE && result.STATE == "SUCCEEDED")){
					result = "true";
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, true);
				}
				
			}

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
				function (policy){
					if(debugLog) console.log("#WEB6_ISSUE policy : " + policy);
					/*var caIp;
					var caPort;
					if(caName == YessignPackage) {
						caIp = YessignCAIP;
						caPort = YessignCMPPort;
					} else if (caName == CrossCertPackage) {
						caIp = CrossCertCAIP;
						caPort = CrossCertCMPPort;
					} else if (caName == SignKoreaPackage) {
						caIp = SignKoreaCAIP;
						caPort = SignKoreaCMPPort;
					} else if (caName == SignGatePackage) {
						caIp = SignGateCAIP;
						caPort = SignGateCMPPort;
					} else {
						if(INI_ALERT){
							INI_ALERT("정의되지 않은 CA기관입니다.", "NOIT");
						}else{
							alert("정의되지 않은 CA기관입니다.");
						}

						if(callback) eval(callback)(false);
						return;
					}*/


						var issureInfo = {};
						issureInfo.CA_NAME = caName;
						issureInfo.REF_VALUE = szRef;
						issureInfo.AUTH_CODE = szCode;
						issureInfo.CERT_ID = certId;
						issureInfo.IS_ISSUE = true;
						issureInfo.DEFAULT_STORAGE = defaultStorage;

						cwui.IniSafeNeo.openMainCertIssueForm(issureInfo, web6Mapping);
				}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_ISSUE");
		};
		performExcute(excuteForm);
	};

	function ReIssueCertificate(caName, szRef, szCode, callback, certId, defaultStorage){
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, param){
				if(debugLog) console.log("-WEB6_REISSUE Result");
				if(debugLog) console.log(result);
				//[참고] 기존 callback소스 : CertProcessResult(URL, postData, result)
				if(result || (result.STATE && result.STATE == "SUCCEEDED")){
					result = "true";
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, true);
				}
			}

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
				function (policy){
					if(debugLog) console.log("#WEB6_REISSUE policy : " + policy);
					/*var caIp;
					var caPort;
					if(caName == YessignPackage) {
						caIp = YessignCAIP;
						caPort = YessignCMPPort;
					} else if (caName == CrossCertPackage) {
						caIp = CrossCertCAIP;
						caPort = CrossCertCMPPort;
					} else if (caName == SignKoreaPackage) {
						caIp = SignKoreaCAIP;
						caPort = SignKoreaCMPPort;
					} else if (caName == SignGatePackage) {
						caIp = SignGateCAIP;
						caPort = SignGateCMPPort;
					} else {
						if(INI_ALERT){
							INI_ALERT("정의되지 않은 CA기관입니다.", "NOIT");
						}else{
							alert("정의되지 않은 CA기관입니다.");
						}

						if(callback) eval(callback)(false);
						return;
					}*/


						var issureInfo = {};
						issureInfo.CA_NAME = caName;
						issureInfo.REF_VALUE = szRef;
						issureInfo.AUTH_CODE = szCode;
						issureInfo.CERT_ID	 = certId;
						issureInfo.IS_ISSUE = false;
						issureInfo.DEFAULT_STORAGE = defaultStorage;
						cwui.IniSafeNeo.openMainCertReIssueForm(issureInfo, web6Mapping);
				}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_REISSUE");
		};
		performExcute(excuteForm);
	};



	function UpdateCertificate( caName, callback, certId, defaultStorage){
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, param){
				if(debugLog) console.log("-WEB6_RENEW Result");
				if(debugLog) console.log(result);
				//[참고] 기존 callback소스 : CertProcessResult(URL, postData, result)
				if(result || (result.STATE && result.STATE == "SUCCEEDED")){
					result = "true";
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, true);
				}
			}

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
				function (policy){
					if(debugLog) console.log("#WEB6_RENEW policy : " + policy);
					/*var caIp;
					var caPort;
					if(caName == YessignPackage) {
						caIp = YessignCAIP;
						caPort = YessignCMPPort;
					} else if (caName == CrossCertPackage) {
						caIp = CrossCertCAIP;
						caPort = CrossCertCMPPort;
					} else if (caName == SignKoreaPackage) {
						caIp = SignKoreaCAIP;
						caPort = SignKoreaCMPPort;
					} else if (caName == SignGatePackage) {
						caIp = SignGateCAIP;
						caPort = SignGateCMPPort;
					} else {
						if(INI_ALERT){
							INI_ALERT("정의되지 않은 CA기관입니다.", "NOIT");
						}else{
							alert("정의되지 않은 CA기관입니다.");
						}

						if(callback) eval(callback)(false);
						return;
					}*/


					var caInfo = cwui.defaultConf.CAInfo.getCAInfo(caName);
					var reNewInfo = {};
					reNewInfo.CA_NAME = caName;
					reNewInfo.CA_IP = caInfo.IP;
					reNewInfo.CA_PORT = caInfo.PORT;
					reNewInfo.CERT_ID	 = certId;
					reNewInfo.DEFAULT_STORAGE = defaultStorage;
					cwui.IniSafeNeo.openMainCertUpdateForm(reNewInfo, web6Mapping);
				}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_RENEW");
		};
		performExcute(excuteForm);
	};

	function UpdateCertificate_INITECH( options, callback ){
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, param){
				if(debugLog) console.log("-WEB6_RENEW Result");
				if(debugLog) console.log(result);
				//[참고] 기존 callback소스 : CertProcessResult(URL, postData, result)
				if(result || (result.STATE && result.STATE == "SUCCEEDED")){
					result = "true";
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, true);
				}
			}

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
				function (policy){
					if(debugLog) console.log("#WEB6_RENEW policy : " + policy);

					console.log("options :" , options);

					var reNewInfo = {
						isHtml5 		: options.isHtml5,
						processCallback : options.processCallback,
						REGNO			: options.REGNO,
						USERID			: options.USERID,
						DETAILNAME		: options.DETAILNAME,
						USERMAIL        : options.USERMAIL,
						KEYBITS			: options.KEYBITS,
						CASTATUS		: options.CASTATUS,
						CA_NAME 		: options.caName
					};
					
					cwui.IniSafeNeo.openMainCertUpdateForm(reNewInfo, web6Mapping);
				}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_RENEW");
		};
		performExcute(excuteForm);
	};


	function RevokeCertificate(caName, serial, callback, defaultStorage){
		var excuteForm = function(){
			web6Adaptor.clear(); // 필요 한지 테스트 필요
			// Step01 : 파라메터 세팅
			web6Adaptor.setCallback(callback);

			// Step02 : Html5 결과에 대한 SFilter 맵핑 함수 정의
			function web6Mapping(result, param){
				if(debugLog) console.log("-WEB6_REVOKE Result");
				if(debugLog) console.log(result);
				//[참고] 기존 callback소스 : CertProcessResult(URL, postData, result)
				if(result || (result.STATE && result.STATE == "SUCCEEDED")){
					result = "true";
				}
				eventCheck = false;
				
				if ( 'function' === typeof web6Adaptor.getCallback() ) {
					web6Adaptor.getCallback()(result, true);
				}
			}

			// Step03 : 정책에 의해 수행되는 함수 정의
			web6Adaptor.setExecutorPolicy(
				function (policy){
					if(debugLog) console.log("#WEB6_REVOKE policy : " + policy);

						var revokeInfo = {};
						revokeInfo.CA_NAME = caName;
						revokeInfo.CERT_SERIAL = serial;
						revokeInfo.DEFAULT_STORAGE = defaultStorage;

						cwui.IniSafeNeo.openMainCertRevokeForm(revokeInfo, web6Mapping);
				}
			);

			// Step04 : URL 정책 세팅
			web6Adaptor.perfomCertPolicy("WEB6_REVOKE");
		};
		performExcute(excuteForm);

	};

	function InitCache(callback) {
		return cwui.Certs.initCertInfo(callback);
	};
	
	function Filter_IssuerDN(issuerDN, callback) {
		return cwui.Certs.setIssuerDNFilterInfo(issuerDN, callback);
	};
	
	function Filter_OIDAlias(OIDAlias, callback) {
		return cwui.Certs.setOIDAliasFilterInfo(OIDAlias, callback);
	};

	function Filter_OID(OID, callback) {
		return cwui.Certs.setOIDFilterInfo(OID, callback);
	};

	function Filter_SerialNo(serialNo, callback) {
		return cwui.Certs.setSerialNoFilterInfo(serialNo, callback);
	};

	function Filter_OU(ouList, callback) {
		return cwui.Certs.setOUFilterInfo(ouList, callback);
	};
	
	var isHtml5Service = function(){
		// 클라이언트 설치 여부에 따라 HTML5 사용 여부
		return false;
	};
	var isIstalledExteral = function(){
		// 클라이언트 설치 여부에 따라 HTML5 사용 여부
		return SFinitializeFlag;
	};

	/**
	 * 정책 적용
	 */
	var ApplyPolicy = function(policyName) {
		cwui.defaultConf.ApplyPolicy(policyName);
	}

	/**
	 * 정책 취득
	 */
	var GetDefaultConf = function() {
		return cwui.defaultConf;
	}

	return {
		PKCS7SignVIDFormLogin : PKCS7SignVIDFormLogin,
		PKCS7SignedDataForm : PKCS7SignedDataForm,
		PKCS7SignedDataSign : PKCS7SignedDataSign,
		PKCS7SignedDataSignMulti : PKCS7SignedDataSignMulti,
		PKCS7SignedDataWithOption : PKCS7SignedDataWithOption,
		PKCS7SignedLogin : PKCS7SignedLogin,
		PKCS7YesSignData : PKCS7YesSignData,
		PKCS7YesSignDataMulti : PKCS7YesSignDataMulti,
		PKCS7PDFSignData : PKCS7PDFSignData,
		PKCS7SignKoreaData : PKCS7SignKoreaData,
		PKCS7SignKoreaLogin : PKCS7SignKoreaLogin,
		AddSignerSignedData : AddSignerSignedData,
		PKCS1SignedDataSign : PKCS1SignedDataSign,
		PKCS1SignedDataForm : PKCS1SignedDataForm,
		NoCertVerify2 : NoCertVerify2,

		PKCS7SignedData : PKCS7SignedData,
		EncFormVerify : EncFormVerify,
		EncFormVerify2 : EncFormVerify2,

		EncForm2 : EncForm2,
		CertManagerWithForm : CertManagerWithForm,
		CertImportV13WithForm : CertImportV13WithForm,
		CertExportV13WithForm : CertExportV13WithForm,
		CertExportInihubWithForm : CertExportInihubWithForm,
		CertImportV12WithForm : CertImportV12WithForm,
		CertExportV12WithForm : CertExportV12WithForm,
		CertImportV11WithForm : CertImportV11WithForm,
		CertExportV11WithForm : CertExportV11WithForm,
		CertImportBrowserV12WithForm : CertImportBrowserV12WithForm,
		CertExportBrowserV12WithForm : CertExportBrowserV12WithForm,
		CertExportInihubV12WithForm : CertExportInihubV12WithForm,
		ImportCloudCert: ImportCloudCert,
		ExportCloudCert: ExportCloudCert,
		setUseOpenstorage : setUseOpenstorage,
		getOverRetryCertInfo : getOverRetryCertInfo,
		IssueCertificate : IssueCertificate,
		ReIssueCertificate : ReIssueCertificate,
		UpdateCertificate : UpdateCertificate,
		RevokeCertificate : RevokeCertificate,


		IssueCertificate_INITECH : IssueCertificate_INITECH,
		UpdateCertificate_INITECH : UpdateCertificate_INITECH,
		
		InitCache : InitCache,
		Filter_IssuerDN : Filter_IssuerDN,
		Filter_OIDAlias : Filter_OIDAlias,
		Filter_OID : Filter_OID,
		Filter_SerialNo : Filter_SerialNo,
		Filter_OU : Filter_OU,

		isHtml5Service : isHtml5Service,
		isIstalledExteral : isIstalledExteral,
		initializeEventCheck : initializeEventCheck,
		ApplyPolicy : ApplyPolicy,
		GetDefaultConf : GetDefaultConf
	};
}());
