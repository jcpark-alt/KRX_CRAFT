var pendingXDR = [];

function addXDR(xdr) {
	if (pendingXDR.indexOf) {
		pendingXDR.push(xdr);
	}
}

function removeXDR(xdr) {
	if (pendingXDR.indexOf) {
		var index = pendingXDR.indexOf(xdr);
		if (index >= 0) {
			pendingXDR.splice(index, 1);
		}
	}
}



// 이 exproto_ext_daemon.js에서는 JSON을 사용하지 않고 iniJSON을 직접 구현해서 대신 사용한다
if (typeof iniJSON !== 'object') {
    iniJSON = {};
}

(function () {
	var cx,
        escapable,
        gap,
        indent,
        meta,
		rep;


	var f = function (n) {

		return n < 10 ? '0' + n : n;
	}


	if (typeof Date.prototype.toJSON !== 'function') {

		Date.prototype.toJSON = function () {
	
			return isFinite(this.valueOf()) ? this.getUTCFullYear()     + '-' +
						f(this.getUTCMonth() + 1) + '-' +
						f(this.getUTCDate())      + 'T' +
						f(this.getUTCHours())     + ':' +
						f(this.getUTCMinutes())   + ':' +
						f(this.getUTCSeconds())   + 'Z'
					: null;
		};
	
		String.prototype.toJSON =
			Number.prototype.toJSON  =
			Boolean.prototype.toJSON = function () {

					return this.valueOf();
			};
	}


	var quote = function (string) {
	
		escapable.lastIndex = 0;
		
		return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
		
			var c = meta[a];
		
			return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		
			}) + '"' : '"' + string + '"';
	}


	var str = function (key, holder) {
		
		var i,          // The loop counter.
			k,          // The member key.
			v,          // The member value.
			length,
			mind = gap,
			partial,
			value = holder[key];
	

		if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
	
			value = value.toJSON(key);
	
		}
	
		if (typeof rep === 'function') {
	
			value = rep.call(holder, key, value);
	
		}

	
		switch (typeof value) {
	
			case 'string':
				return quote(value);
	
			case 'number':
				return isFinite(value) ? String(value) : 'null';
	
			case 'boolean':
			case 'null':
				return String(value);

			case 'object':	
				if (!value) {
					return 'null';
				}
	
				gap += indent;
				partial = [];
	
				if (Object.prototype.toString.apply(value) === '[object Array]') {
	
					length = value.length;
	
					for (i = 0; i < length; i += 1) {
	
						partial[i] = str(i, value) || 'null';
					}
	
					v = partial.length === 0
	
						? '[]'
	
						: gap
	
						? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
	
						: '[' + partial.join(',') + ']';
	
					gap = mind;
	
					return v;
				}
	
				if (rep && typeof rep === 'object') {
	
					length = rep.length;
	
					for (i = 0; i < length; i += 1) {
	
						if (typeof rep[i] === 'string') {
	
							k = rep[i];
							v = str(k, value);
	
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				} 
				else {

					for (k in value) {

						if (Object.prototype.hasOwnProperty.call(value, k)) {
	
							v = str(k, value);
	
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				}
	
				v = partial.length === 0
	
					? '{}'
	
					: gap
	
					? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
	
					: '{' + partial.join(',') + '}';
	
				gap = mind;
	
				return v;
		}
	}


	if (typeof iniJSON.stringify !== 'function') {
		escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

        meta = {    // table of character substitutions

            '\b': '\\b',

            '\t': '\\t',

            '\n': '\\n',

            '\f': '\\f',

            '\r': '\\r',

            '"' : '\\"',

            '\\': '\\\\'

		};


		iniJSON.stringify = function (value, replacer, space) {

			var i;
			gap = '';
			indent = '';


			if (typeof space === 'number') {

				for (i = 0; i < space; i += 1) {

					indent += ' ';
				}

			} 
			else if (typeof space === 'string') {

				indent = space;
			}

				
			rep = replacer;

			if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {

					throw new Error('iniJSON.stringify');
			}

				
			return str('', {'': value});
		}
	}


	if (typeof iniJSON.parse !== 'function') {

        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

        iniJSON.parse = function (text, reviver) {

            var j;

            function walk(holder, key) {

				var k, v, value = holder[key];

                if (value && typeof value === 'object') {

                    for (k in value) {

                        if (Object.prototype.hasOwnProperty.call(value, k)) {

                            v = walk(value, k);

                            if (v !== undefined) {

                                value[k] = v;
                            } else {

                                delete value[k];
                            }
                        }
                    }
                }

                return reviver.call(holder, key, value);

            }


            text = String(text);

            cx.lastIndex = 0;

            if (cx.test(text)) {

                text = text.replace(cx, function (a) {
                    return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);

                });
            }


            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
							
				//j = eval('(' + text + ')');
				j = JSON.parse(text);
				//var str = '(' + text + ')';
				//j = str;


                return typeof reviver === 'function' ? walk({'': j}, '') : j;
            }

            throw new SyntaxError('iniJSON.parse');

        };
    }
	
}());



CROSSWEBEX_UTIL.typeDaemon = function () {
	return true;
};


CROSSWEBEX_UTIL.getSessionKey = function() {
	function generateId( len ){
		const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		var retStr = "";
		if (window.crypto && window.crypto.getRandomValues) {
			const val = new Uint32Array(len);
			window.crypto.getRandomValues(val);

			for (var i = 0; i < len; i++) {
				retStr += charset[val[i] % charset.length];
			}
		}
		else { // IE10 이하..
			while( retStr.length<len && len > 0 ){
				var r = Math.random();
				retStr += String.fromCharCode( Math.floor(r*26) + (r>0.5?97:65) );
			}
		}
		return retStr;
	}
	
	var idKey = window.sessionStorage.getItem( 'idKey' );
	if( idKey == '' || idKey == null || idKey == 'undefined' ){
		idKey = generateId(64);
		window.sessionStorage.setItem('idKey',idKey);			
	}
		
	return idKey;	
}

var CROSSWEBEX_WORKER = {
	works: [],
	work: null,

	AddWork: function (work) {
		CROSSWEBEX_WORKER.works.push(work);

		function runWorkerAsyc () {
			setTimeout(function () {
				if (CROSSWEBEX_WORKER.work) {
					if (!CROSSWEBEX_WORKER.work.isWorkCompleted) {
						runWorkerAsyc();
						return;
					}
				}

				if (!CROSSWEBEX_WORKER.works.length) {
					return;
				}

				CROSSWEBEX_WORKER.work = CROSSWEBEX_WORKER.works.shift();
				CROSSWEBEX_WORKER.work.isWorkCompleted = false;
				CROSSWEBEX_WORKER.work();
			}, 0);
		}

		runWorkerAsyc();
	}
};

var CROSSWEBEX_DAEMON = {
	thisObj: null,
	request: "",
	callback: "",
	domainCheckErrorFirst: true,

	moduleCheck: function (currPluginCnt) {
		exlog("_DAEMON.moduleCheck", currPluginCnt);
		
		if (!CROSSWEBEX_CONST.id) {
			CROSSWEBEX_CONST.id = CROSSWEBEX_UTIL.createId();
		}
		
		// generate tab id
		if (!CROSSWEBEX_CONST.extabid) {
			CROSSWEBEX_CONST.extabid = CROSSWEBEX_UTIL.createId();
		}

		// CrossWeb EX 는 Plugin 이 하나이므로 주석처리
		//CROSSWEBEX_CHECK.chkCurrPluginCnt = currPluginCnt;

		if (currPluginCnt >= CROSSWEBEX_CONST.pluginCount) {
			var chk = true;
			for (var i = 0; i < CROSSWEBEX_CONST.pluginCount; i++) {
				var currInstalled = true;
				var currStatus = CROSSWEBEX_CHECK.chkInfoStatus.info[i];
				if (!currStatus.daemon) {
					chk = false;
					currInstalled = false;
				}
				if (!currStatus.client) {
					chk = false;
					currInstalled = false;
				}
				currStatus.isInstalled = currInstalled;
			}
			CROSSWEBEX_CHECK.chkInfoStatus.status = chk;
			exlog("_DAEMON.moduleCheck.chkInfoStatus", CROSSWEBEX_CHECK.chkInfoStatus);
			CROSSWEBEX_CHECK.chkCallback(CROSSWEBEX_CHECK.chkInfoStatus);
			//eval(CROSSWEBEX_CHECK.chkCallback)(CROSSWEBEX_CHECK.chkInfoStatus);
			return;
		}

		var pluginInfo = CROSSWEBEX_CONST.pluginInfo[currPluginCnt];

		var checkCallback = "CROSSWEBEX_CHECK.daemonVersionCheck";
		var request = {};

		request.id = CROSSWEBEX_CONST.id;
		request.tabid = CROSSWEBEX_CONST.extabid;
		request.cmd = "native";
		request.origin = location.origin != undefined ? location.origin : location.host;
		request.origin += '_';
		request.origin += CROSSWEBEX_UTIL.getSessionKey();
		
		request.callback = "";
		request.exfunc = {};
		request.exfunc.fname = "GetVersion";
		request.exfunc.args = "";

		request.init = "get_versions";
		request.m = pluginInfo.exModuleName;
		request.lic = pluginInfo.lic;		

		try {
			if (sessionStorage.getItem("crosswebex_wsport")) {
				exlog("_DAEMON.moduleCheck.portCheck.getSession.crosswebex_wsport", sessionStorage.getItem("crosswebex_wsport"));
				var localHost = crosswebexInfo.exEdgeInfo.localhost;
				CROSSWEBEX_UTIL.sendWS(localHost, request, checkCallback);
			} else {
				var wsPortError = 0;
				var wsPortMax = pluginInfo.exEdgeInfo.portChkCnt;
				var wsPortCurr = pluginInfo.exEdgeInfo.edgeStartPort;
				var wsPortLast = pluginInfo.exEdgeInfo.edgeStartPort + pluginInfo.exEdgeInfo.portChkCnt - 1;
				var wsPortSucceed = false;

				function dmPortCheckStart(dmPort) {

					// 연속적으로 포트 체크를 할 경우 포트 체크가 제대로 되지 않아 100ms 간격으로 포트 체크를 하도록 수정
					setTimeout(function () {

						if (sessionStorage.getItem("crosswebex_wsport")) {
							return;
						}

						// 접속 도메인 관리가 필요한 경우
						var url = pluginInfo.exEdgeInfo.localhost + ":" + dmPort + "?securePortScan" + (new Date()).getTime() + "=" + crosswebexInfo.lic_domain;
						var xmlHttp = null;
						var useXDomain = false;
						var useWSS = false;
			
						if(url.indexOf("wss://") === 0) {
							// 웹소켓은 생성자에 url을 넘겨 줘야 HS를 시작한다.
							url = pluginInfo.exEdgeInfo.localhost + ":" + dmPort + "/securePortScan";
							xmlHttp = new WebSocket(url);
							useWSS = true;
						} else if (window.XDomainRequest && CROSSWEBEX_UTIL.documentMode == null) {
							useXDomain = true;
							xmlHttp = new XDomainRequest();
						} else if (window.XDomainRequest && CROSSWEBEX_UTIL.documentMode != null && CROSSWEBEX_UTIL.documentMode < 10) {
							useXDomain = true;
							xmlHttp = new XDomainRequest();
						} else if (window.XMLHttpRequest) {
							xmlHttp = new XMLHttpRequest();
						} else if (window.ActiveXObject) {
							try {
								xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");//IE 상위 버젼 
							} catch (e1) {
								try {
									xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");//IE 하위 버젼 
								} catch (e2) {
									xmlHttp = null;
								}
							}
						}

						if (xmlHttp) {
							if (useWSS) {
								xmlHttp.addEventListener("open", () => {
									// WebSocket 생성자에서 securePortScan 경로를 주었지만 기존 HTTP 프로토콜과 형식을 맞추기 위해 다시 전달한다.
									xmlHttp.send(encodeURIComponent("securePortScan=" + crosswebexInfo.lic_domain));
								});
		
								xmlHttp.addEventListener("message", (event) => {
									var result = iniJSON.parse(event.data);
									if (result.code === 200 && !wsPortSucceed) {
										exlog("dmPortCheckStart", result.responseText);
										wsPortSucceed = true;
										sessionStorage.setItem('crosswebex_wsport', dmPort);
										// xmlHttp.close(1000); // 정상

										CROSSWEBEX_UTIL.sendWS(pluginInfo.exEdgeInfo.localhost, request, checkCallback);
									} else if ((result.code === 400) && (CROSSWEBEX_DAEMON.domainCheckErrorFirst === true)) {
										CROSSWEBEX_DAEMON.domainCheckErrorFirst = false;
										alert(crosswebexInfo.exPluginName + " " + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_033);
										xmlHttp.close(1007); // 잘못된 데이터
									} else {
										exlog("dmPortCheckStart :: onerror :: " + wsPortError, url);
										wsPortError++;
										if (wsPortError == wsPortMax) {
											exlog("dmPortCheckStart :: onerror", "Failed to check port");
											CROSSWEBEX_CHECK.setDaemonStatus("", false, true);
										}
										// xmlHttp.close(1000); // 정상
									}
								});

								// xmlHttp.addEventListener("close", (event) => {});
		
								xmlHttp.addEventListener("error", (error) => {
									exlog("dmPortCheckStart :: WebSocket :: " + wsPortError, error);
									wsPortError++;
									if (wsPortError == wsPortMax) {
										exlog("dmPortCheckStart :: onerror", "Failed to check port");
										CROSSWEBEX_CHECK.setDaemonStatus("", false, true);
									}
								});
							} else if (useXDomain) {
								xmlHttp.onload = function () {
									exlog("dmPortCheckStart :: onopen", url);
									removeXDR(xmlHttp);
									wsPortSucceed = true;
									sessionStorage.setItem('crosswebex_wsport', dmPort);
									CROSSWEBEX_UTIL.sendWS(pluginInfo.exEdgeInfo.localhost, request, checkCallback);
								};

								xmlHttp.onerror = function () {
									exlog("dmPortCheckStart :: onerror :: " + wsPortError, url);
									removeXDR(xmlHttp);
									wsPortError++;
									if (wsPortError == wsPortMax) {
										exlog("dmPortCheckStart :: onerror", "Failed to check port");
										CROSSWEBEX_CHECK.setDaemonStatus("", false, true);
									}
								};

							} else {
								xmlHttp.onreadystatechange = function () {
									if (xmlHttp.readyState == 4 /* READYSTATE_COMPLETE */) {
										exlog("dmPortCheckStart xmlHttp.readyState: " + xmlHttp.readyState + ", xmlHttp.status: " + xmlHttp.status + ", port: " + dmPort);
										if (xmlHttp.status == 200 && !wsPortSucceed) {
											exlog("dmPortCheckStart", iniJSON.stringify(xmlHttp.responseText));
											wsPortSucceed = true;
											sessionStorage.setItem('crosswebex_wsport', dmPort);
											CROSSWEBEX_UTIL.sendWS(pluginInfo.exEdgeInfo.localhost, request, checkCallback);
										} else {
											if ((xmlHttp.status === 400) && (CROSSWEBEX_DAEMON.domainCheckErrorFirst === true)) {
												CROSSWEBEX_DAEMON.domainCheckErrorFirst = false;
												alert(crosswebexInfo.exPluginName + " " + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_033);
											}
											exlog("dmPortCheckStart :: onerror :: " + wsPortError, url);
											wsPortError++;
											if (wsPortError == wsPortMax) {
												exlog("dmPortCheckStart :: onerror", "Failed to check port");
												CROSSWEBEX_CHECK.setDaemonStatus("", false, true);
											}
										}
									}
								};
							}

							if (!useWSS) {
								// 웹소켓은 open 콜백에서 처리한다.
								try {
								
									xmlHttp.open("GET", url);
									xmlHttp.timeout = 5 * 1000;	// pending timeout 5s
									xmlHttp.send();
	
									if (useXDomain) {
										addXDR(xmlHttp);
									}
									
								} catch (e) {
									exlog( "_DAEMON.dmPortCheckStart :: http open failed :: ", e );
								}
							}
						} else {
							exlog("_DAEMON.dmPortCheckStart", "XMLHTTP not supported.");
						}

						// 다음 포트 체크
						wsPortCurr++;

						// 체크할 포트가 남아 있는 경우
						if (wsPortCurr <= wsPortLast) {
							// 성공한 경우 더 이상 포트 체크를 하지 않음
							if (!wsPortSucceed) {
								// 포트 체크
								dmPortCheckStart(wsPortCurr);
							}
						}

					}, 100);
				}

				// 포트 체크
				exlog("dmPortCheckStart");
				dmPortCheckStart(wsPortCurr);
			
			}

		} catch (e) {
			exlog("_DAEMON.moduleCheck.portCheck", e);
			CROSSWEBEX_CHECK.setDaemonStatus("", false, true);
		}
	},

	daemonVersionCheck: function (updateInfo) {

		var pluginInfo = CROSSWEBEX_CONST.pluginInfo[CROSSWEBEX_CHECK.chkCurrPluginCnt];

		if (updateInfo) {
			exlog("_DAEMON.daemonVersionCheck.updateInfo", updateInfo);
			if (updateInfo == "-1") {
				sessionStorage.removeItem("crosswebex_wsport");
				CROSSWEBEX_CHECK.setDaemonStatus("", false, true);
				return;
			}

			exlog("_DAEMON.daemonVersionCheck", "daemon version check");
			// CrossWeb EX Daemon 버전 체크
			var exDaemonSvrVer = pluginInfo.exEdgeInfo.daemonVer;
			if (CROSSWEBEX_UTIL.diffVersion(updateInfo.daemon, exDaemonSvrVer)) {
				CROSSWEBEX_CHECK.setDaemonStatus(updateInfo.daemon, true, false);
				exlog("_DAEMON.daemonVersionCheck", "EX version check");
				var exEXSvrVer = pluginInfo.exProtocolInfo.exWinProtocolVer;
				// CrossWeb EX Extension 은 항상 설치로 설정
				CROSSWEBEX_CHECK.setStatus("EX", updateInfo.ex, true, false);

				// CrossWeb EX Client 버전 취득
				var currModuleInfoArr = updateInfo.m;
				var currModuleVer;
				for (var i = 0; i < currModuleInfoArr.length; i++) {
					var cm = currModuleInfoArr[i];
					if (cm.name == pluginInfo.exModuleName) {
						currModuleVer = cm.version;
						break;
					}
				}

				if (pluginInfo.exModuleName == updateInfo.m.name)
					currModuleVer = updateInfo.m.version;

				exlog("_DAEMON.EXVersionCheck", "Client version check");
				var exModuleSvrVer;
				if (CROSSWEBEX_UTIL.isWin()) {
					exModuleSvrVer = pluginInfo.moduleInfo.exWinVer;
				} else if (CROSSWEBEX_UTIL.isMac()) {
					exModuleSvrVer = pluginInfo.moduleInfo.exMacVer;
				} else if (CROSSWEBEX_UTIL.isLinux()) {
					exModuleSvrVer = pluginInfo.moduleInfo.exLinuxVer;
				}
				// CrossWeb EX Client 버전 체크
				if (CROSSWEBEX_UTIL.diffVersion(currModuleVer, exModuleSvrVer)) {
					CROSSWEBEX_CHECK.setStatus("client", currModuleVer, true, true);
				} else {
					sessionStorage.removeItem("crosswebex_wsport");
					CROSSWEBEX_CHECK.setStatus("client", currModuleVer, false, true);
				}
			} else {
				CROSSWEBEX_CHECK.setDaemonStatus(updateInfo.daemon, false, true);
			}
		} else {
			exlog("_DAEMON.daemonVersionCheck", pluginInfo.exPluginName + " updateInfo Error");
			sessionStorage.removeItem("crosswebex_wsport");
			CROSSWEBEX_CHECK.setDaemonStatus("", false, true);
		}
	},

	sendWS: function (host, request, callback) {
		try {
			CROSSWEBEX_WORKER.AddWork(function () {

				//if (request.origin.match(/http:/)) {
				//	if(!request.origin.match(/localhost:/)) {
				//		sessionStorage.removeItem("crosswebex_wsport");
				//
				//		alert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_032);
				//
				//		if (typeof CROSSWEBEX != "undefined"){
				//			CROSSWEBEX.exDefaultCallbackName({ "NAME": CROSSWEBEX.exPluginName, "ERR": "BLOCK:CLIENT" });
				//			//eval(CROSSWEBEX.exDefaultCallbackName)({ "NAME": CROSSWEBEX.exPluginName, "ERR": "BLOCK:CLIENT" });
				//		}
				//		else
				//			CROSSWEBEX_CHECK.setDaemonStatus("", false, true);
				//
				//		CROSSWEBEX_WORKER.work.isWorkCompleted = true;
				//		
				//		throw new Error('Not Supported domain.');
				//	}
				//}

				var storagePort = sessionStorage.getItem("crosswebex_wsport");

				/**
				 * fortify 검출에 의한 수정 
				 * getItem함수로 sessionStorage의 포트를 얻어 url을 생성하는 경우
				 * sessionStorage의 내용을 수정하여 악의적으로 사용할 수 있다는 내용.
				 * 
				 * 사용가능한 port array를 만들고 array내에 이미 저장된 port를 사용하면
				 * 이를 회피할 수 있다는 가이드 대로 사용하려는 port list를 생성하고
				 * 생성된 리스트 내의 포트를 사용하여 url을 만들어 낼 수 있도록 변경함.
				 */
				var port_list = [];
				var portIdx = 0;
				
				for ( portIdx = 0; portIdx < crosswebexInfo.exEdgeInfo.portChkCnt; portIdx++ ) {
					port_list[portIdx] = crosswebexInfo.exEdgeInfo.edgeStartPort + portIdx;
				}

				for ( portIdx = 0; portIdx < crosswebexInfo.exEdgeInfo.portChkCnt; portIdx++ ) {
					if ( port_list[portIdx] === parseInt(storagePort) ) {
						break;
					}
				}

				if ( portIdx >= crosswebexInfo.exEdgeInfo.portChkCnt ) {
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(crosswebexInfo.exPluginName + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_026, "WARN"); // "실행중 오류가 발생하였습니다.(EX)"
					} else {
						alert(crosswebexInfo.exPluginName + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_026); // "실행중 오류가 발생하였습니다.(EX)"
					}
					CROSSWEBEX_WORKER.work.isWorkCompleted = true;
					return;
				}

				var url = host + ":" + port_list[portIdx];
				var xmlHttp = null;
				var useXDomain = false;
				var useWSS = false;

				// wss로 시작해야 웹소켓이다
				if(url.indexOf("wss://") === 0) {
					// 웹소켓은 생성자에 url을 넘겨 줘야 HS를 시작한다.
					xmlHttp = new WebSocket(url + "/request");
					useWSS = true;
				} else if (window.XDomainRequest && CROSSWEBEX_UTIL.documentMode == null) {
					useXDomain = true;
					xmlHttp = new XDomainRequest();
				} else if (window.XDomainRequest && CROSSWEBEX_UTIL.documentMode != null && CROSSWEBEX_UTIL.documentMode < 10 ) {
					useXDomain = true;
					xmlHttp = new XDomainRequest();
				} else if (window.XMLHttpRequest) {
					xmlHttp = new XMLHttpRequest();
				} else if (window.ActiveXObject) {
					try {
						xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");//IE 상위 버젼 
					} catch (e1) {
						try {
							xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");//IE 하위 버젼 
						} catch (e2) {
							xmlHttp = null;
						}
					}
				}

				if (xmlHttp) {
					if (useWSS) {
						xmlHttp.addEventListener("open", () => {
							xmlHttp.send("request=" + encodeURIComponent(iniJSON.stringify(request)));
							if (request && request.exfunc && request.exfunc.args) {
								request.exfunc.args = {};
							}
						});

						xmlHttp.addEventListener("message", (event) => {
							var result = iniJSON.parse(event.data);
							if (result.code === 200) {
								var response = result.responseText;
								// xmlHttp.close(1000); // 정상

								if (response.response.status == "TRUE") {
									if (callback) {
										var sendWSCallbackFn = CROSSWEBEX_DAEMON.executeFunctionByName(callback);
										sendWSCallbackFn.apply(CROSSWEBEX_DAEMON.thisObj, [response]);
									}
								}
							} else {
								exlog("_DAEMON.sendWS.message", "Can not connected to local DAEMON Server!");
								sessionStorage.removeItem("crosswebex_wsport");
								if (typeof CROSSWEBEX != "undefined"){
									//eval(CROSSWEBEX.exDefaultCallbackName)({ "NAME": CROSSWEBEX.exPluginName, "ERR": "BLOCK:CLIENT" });
									CROSSWEBEX.exDefaultCallbackName({ "NAME": CROSSWEBEX.exPluginName, "ERR": "BLOCK:CLIENT" });

								}
								else
									CROSSWEBEX_CHECK.setDaemonStatus("", false, true);

								// xmlHttp.close(1007); // 잘못된 데이터
							}
							CROSSWEBEX_WORKER.work.isWorkCompleted = true;
						});

						// xmlHttp.addEventListener("close", () => {});

						xmlHttp.addEventListener("error", (error) => {
							removeXDR(xmlHttp);
							exlog("Disconnected WebSocket", error);
							sessionStorage.removeItem("crosswebex_wsport");
							if (typeof CROSSWEBEX != "undefined"){
								//eval(CROSSWEBEX.exDefaultCallbackName)({ "NAME": CROSSWEBEX.exPluginName, "ERR": "BLOCK:CLIENT" });
								CROSSWEBEX.exDefaultCallbackName({ "NAME": CROSSWEBEX.exPluginName, "ERR": "BLOCK:CLIENT" });
							}
							else
								CROSSWEBEX_CHECK.setDaemonStatus("", false, true);

							CROSSWEBEX_WORKER.work.isWorkCompleted = true;
						});
					} else if (useXDomain) {
						xmlHttp.onload = function () {
							removeXDR(xmlHttp);
							exlog("_DAEMON.sendWS.onload", iniJSON.stringify(xmlHttp.responseText));
							var response = iniJSON.parse(xmlHttp.responseText);
							if (response.response.status == "TRUE") {
								if (callback) {
									var sendWSCallbackFn = CROSSWEBEX_DAEMON.executeFunctionByName(callback);
									sendWSCallbackFn.apply(CROSSWEBEX_DAEMON.thisObj, [response]);
								}
							}
							CROSSWEBEX_WORKER.work.isWorkCompleted = true;
						};

						xmlHttp.onerror = function () {
							removeXDR(xmlHttp);
							exlog("_DAEMON.sendWS.onerror", "Can not connected to local DAEMON Server!");
							sessionStorage.removeItem("crosswebex_wsport");
							if (typeof CROSSWEBEX != "undefined"){
								//eval(CROSSWEBEX.exDefaultCallbackName)({ "NAME": CROSSWEBEX.exPluginName, "ERR": "BLOCK:CLIENT" });
								CROSSWEBEX.exDefaultCallbackName({ "NAME": CROSSWEBEX.exPluginName, "ERR": "BLOCK:CLIENT" });

							}
							else
								CROSSWEBEX_CHECK.setDaemonStatus("", false, true);
							CROSSWEBEX_WORKER.work.isWorkCompleted = true;
						};

					} else {
						xmlHttp.onreadystatechange = function () {
							if (xmlHttp.readyState == 4) {
								exlog("_DAEMON.sendWS.onreadystatechange :: xmlHttp.readyState: " + xmlHttp.readyState + ", xmlHttp.status: " + xmlHttp.status + ", port: " + port_list[portIdx]);
								if (xmlHttp.status == 200) {
									exlog("_DAEMON.sendWS.onreadystatechange", iniJSON.stringify(xmlHttp.responseText));
									var response = iniJSON.parse(xmlHttp.responseText);
									if (response.response.status == "TRUE") {
										if (callback) {
											var sendWSCallbackFn = CROSSWEBEX_DAEMON.executeFunctionByName(callback);
											sendWSCallbackFn.apply(CROSSWEBEX_DAEMON.thisObj, [response]);
										}
									}
								} else {
									if ((xmlHttp.status === 400) && (CROSSWEBEX_DAEMON.domainCheckErrorFirst === true)) {
										CROSSWEBEX_DAEMON.domainCheckErrorFirst = false;
										alert(crosswebexInfo.exPluginName + " " + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_033);
									}
									exlog("_DAEMON.sendWS.onreadystatechange", "Can not connected to local DAEMON Server!");
									sessionStorage.removeItem("crosswebex_wsport");
									if (typeof CROSSWEBEX != "undefined"){
										//eval(CROSSWEBEX.exDefaultCallbackName)({ "NAME": CROSSWEBEX.exPluginName, "ERR": "BLOCK:CLIENT" });
										CROSSWEBEX.exDefaultCallbackName({ "NAME": CROSSWEBEX.exPluginName, "ERR": "BLOCK:CLIENT" });

									}
									else
										CROSSWEBEX_CHECK.setDaemonStatus("", false, true);
								}
								CROSSWEBEX_WORKER.work.isWorkCompleted = true;
							}
						};
					}

					// WS는 open 콜백에서 처리한다.
					if (!useWSS) {
						try{
							xmlHttp.open("POST", url);
	
							if (useXDomain) {
								xmlHttp.send("request=" + encodeURIComponent(iniJSON.stringify(request)));
								addXDR(xmlHttp);
							} else {
								xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
								xmlHttp.send("request=" + encodeURIComponent(iniJSON.stringify(request)));
							}
						} catch(e) {
							// open 시 exception 발생하는 경우가 있다. 이 경우 완료처리 하지 않으면 queue가 소모되지 않고 계속 대기하게 됨.
							CROSSWEBEX_WORKER.work.isWorkCompleted = true;
							exlog( "_DAEMON.sendWS :: http open failed :: ", e );
						// [22.03.14] Namsu add - 메모리에 패스워드 남는 문제 때문에 초기화
						} finally {
							if (request && request.exfunc && request.exfunc.args) {
								request.exfunc.args = {};
							}
						}
					}

				} else {
					CROSSWEBEX_WORKER.work.isWorkCompleted = true;
					exlog("_DAEMON.sendWS", "XMLHTTP not supported.");
				}
			});

		} catch (e) {
			CROSSWEBEX_WORKER.work.isWorkCompleted = true;
			exlog("_DAEMON.sendWS", "sendWS Daemon not load");
		}
	},

	setDaemonStatus: function (localVer, status, isNext) {
		// Extension 과 CrossEX 는 모두 설치 상태로 설정
		CROSSWEBEX_CHECK.chkInfoStatus.info[CROSSWEBEX_CHECK.chkCurrPluginCnt].extension = true;
		CROSSWEBEX_CHECK.chkInfoStatus.info[CROSSWEBEX_CHECK.chkCurrPluginCnt].EX = true;
		CROSSWEBEX_CHECK.chkInfoStatus.info[CROSSWEBEX_CHECK.chkCurrPluginCnt].daemonVer = localVer;
		CROSSWEBEX_CHECK.chkInfoStatus.info[CROSSWEBEX_CHECK.chkCurrPluginCnt].daemon = status;

		if (isNext) {
			CROSSWEBEX_CHECK.moduleCheck(CROSSWEBEX_CHECK.chkCurrPluginCnt + 1);
		}
	},

	executeFunctionByName: function (functionName) {
		var args = Array.prototype.slice.call(arguments, 2);
		var namespaces = functionName.split(".");
		var func = namespaces.pop();
		var funcArr;
		for (var i = 0; i < namespaces.length; i++) {
			if (i == 0) {
				funcArr = window[namespaces[i]];
				this.thisObj = funcArr;
			} else {
				funcArr = funcArr[namespaces[i]];
			}
		}
		return funcArr[func];
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
	this.host = property.exEdgeInfo.localhost;
	this.exDefaultCallbackName = property.exPluginName + ".exDefaultDaemonCallback";

	dummyDomain = property.dummyDomain ? property.dummyDomain : location.host;
	hostid = property.hostid ? property.hostid : location.host;

	this.initEXInfoArr = [];
	this.exInterfaceArr = [];
	this.exEcho = false;
	this.setEcho = function (status) {
		this.exEcho = status;
	};
	this.alertInfo = { "BLOCK": false, "EX": false, "CLIENT": false, "INTERNAL": false };

	// default callback
	this.exDefaultDaemonCallback = function (response) {
		exlog("exDefaultCallback", response);
		if (response) {
			var resPluginObj;
			if (response.NAME) {
				if (response.NAME != crosswebexInfo.exProtocolName) {
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(crosswebexInfo.exPluginName + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_026, "WARN"); // "실행중 오류가 발생하였습니다.(EX)"
					} else {
						alert(crosswebexInfo.exPluginName + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_026); // "실행중 오류가 발생하였습니다.(EX)"
					}
					return;
				}
				resPluginObj = response(response.NAME);//eval(response.NAME);
			}

			if (response.ERR == "BLOCK") {
				if (!resPluginObj.alertInfo.BLOCK) {
					resPluginObj.alertInfo.BLOCK = true;
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_023, "WARN"); // " 라이센스를 확인하세요."
					} else {
						exalert(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_023); // " 라이센스를 확인하세요."
					}
					try {
						if (resPluginObj.exErrFunc) {
							resPluginObj.exErrFunc(response);
							//eval(resPluginObj.exErrFunc)(response);
						}
					} catch (e) {
						exlog("exDefaultDaemonCallback:BLOCK", "exErrFunc error");
					}
				}
			} else if (response.ERR == "BLOCK:EX") {
				if (!resPluginObj.alertInfo.EX) {
					resPluginObj.alertInfo.EX = true;
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_024, "WARN"); // " 프로그램이 정상적으로 설치되지 않았습니다.\n재설치 후 진행하여주십시오."
					} else {
						exalert(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_024); // " 프로그램이 정상적으로 설치되지 않았습니다.\n재설치 후 진행하여주십시오."
					}
					try {
						if (resPluginObj.exErrFunc) {
							resPluginObj.exErrFunc(response);
							//eval(resPluginObj.exErrFunc)(response);
						}
					} catch (e) {
						exlog("exDefaultDaemonCallback:BLOCK:EX", "exErrFunc error");
					}
				}
			} else if (response.ERR == "BLOCK:CLIENT") {
				if (!resPluginObj.alertInfo.CLIENT) {
					resPluginObj.alertInfo.CLIENT = true;
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_024, "WARN"); // " 프로그램이 정상적으로 설치되지 않았습니다.\n재설치 후 진행하여주십시오."
					} else {
						exalert(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_024); // " 프로그램이 정상적으로 설치되지 않았습니다.\n재설치 후 진행하여주십시오."
					}
					try {
						if (resPluginObj.exErrFunc) {
							//eval(resPluginObj.exErrFunc)(response);
							resPluginObj.exErrFunc(response)
						}
					} catch (e) {
						exlog("exDefaultDaemonCallback:BLOCK:CLIENT", "exErrFunc error");
					}
				}
			} else if (response.ERR == "BLOCK:INTERNAL") {
				if (!resPluginObj.alertInfo.INTERNAL) {
					resPluginObj.alertInfo.INTERNAL = true;
					if ("undefined" !== typeof INI_ALERT) {
						INI_ALERT(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_025, "WARN"); // " 프로그램이 중단되었습니다.\n페이지를 새로고침하세요."
					} else {
						exalert(response.NAME + CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_025); // " 프로그램이 중단되었습니다.\n페이지를 새로고침하세요."
					}
					try {
						if (resPluginObj.exErrFunc) {
							//eval(resPluginObj.exErrFunc)(response);
							resPluginObj.exErrFunc(response)
						}
					} catch (e) {
						exlog("exDefaultDaemonCallback:BLOCK:INTERNAL", "exErrFunc error");
					}
				}
			} else {
				exalert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_026, response); // "실행중 오류가 발생하였습니다.(EX)"
			}
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

		var cmd = "native";
		this.InvokeDaemon(id, cmd, fname, args, exCallback);
	};

	this.InvokeDaemon = function (id, cmd, fname, args, callback) {

		var request = {};
		request.id = id;
		request.tabid = CROSSWEBEX_CONST.extabid;
		request.module = this.exModuleName;
		request.cmd = cmd;
		request.origin = location.origin != undefined ? location.origin : location.host;
		request.origin += '_';
		request.origin += CROSSWEBEX_UTIL.getSessionKey();
		
		request.exfunc = {};
		request.exfunc.fname = fname;
		request.exfunc.args = args;
		request.callback = callback;
		if (this.exEcho) request.echo = true;

		try {
			exlog(this.exPluginName + ".InvokeDaemon.request", request);
			CROSSWEBEX_UTIL.sendWS(this.host, request, "CROSSWEBEX.InvokeCallback");
		} catch (e) {
			exalert(CROSSWEBEX_UTIL.loadStringTable().WARN.C_W_029); // "파라미터 생성중 오류가 발생하였습니다."
			exalert(e);
		}
	};

	this.InvokeCallback = function (response) {
		if (response) {
			try {
				exlog(this.exPluginName + ".InvokeCallback.response", response);
				if (typeof response == "object") {
					var strSerial = iniJSON.stringify(response);
				} else if (typeof response == "string") {
					response = iniJSON.parse(response);
				}
				response = response.response;

				var status = response.status;

				// success
				if (status == "TRUE") {
					var id = response.id;
					var funcInfo = {};
					for (var i = 0; i < this.exInterfaceArr.length; i++) {
						if (this.exInterfaceArr[i]) {
							var arrObj = this.exInterfaceArr[i];
							if (arrObj.id == id) {
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
								str = str.replace(/\\r/g, "\r");
								str = str.replace(/\\n/g, "\n");
								replyArr += "'" + str + "',";
							}
							replyArr += "]";
							param.reply = replyArr;

						} else if (typeof reply == 'string') {
							param.callback = funcInfo.pageCallback;
							param.reply = reply.replace(/\\r/g, "\r").replace(/\\n/g, "\n");

						} else if (typeof reply == 'object') {
							reply.callback = funcInfo.pageCallback;
							if (reply.status == "_CROSSWEBEX_BLOCK_") {
								var err = reply.err;
								//eval(this.exDefaultCallbackName)({ "NAME": this.exPluginName, "ERR": err });
								this.exDefaultCallbackName({ "NAME": this.exPluginName, "ERR": err });
							} else {
								param = reply;
							}
						}

						setTimeout(function () { callback(param) }, 5);
					}
				} else if (status == "BLOCK") {
					exlog(this.exPluginName + ".InvokeCallback.response", response);
					exlog(this.exPluginName + ".InvokeCallback", "license not valid");
					//eval(this.exDefaultCallbackName)({ "NAME": this.exPluginName, "ERR": "BLOCK" });
					this.exDefaultCallbackName({ "NAME": this.exPluginName, "ERR": "BLOCK" });
				} else if (status == "BLOCK:EX") {
					exlog(this.exPluginName + ".InvokeCallback.response", response);
					exlog(this.exPluginName + ".InvokeCallback", "CrossEX sig check fail");
					//eval(this.exDefaultCallbackName)({ "NAME": this.exPluginName, "ERR": "BLOCK:EX" });
					this.exDefaultCallbackName({ "NAME": this.exPluginName, "ERR": "BLOCK:EX" });
				} else if (status == "BLOCK:CLIENT") {
					exlog(this.exPluginName + ".InvokeCallback.response", response);
					exlog(this.exPluginName + ".InvokeCallback", "Client sig check fail");
					//eval(this.exDefaultCallbackName)({ "NAME": this.exPluginName, "ERR": "BLOCK:CLIENT" });
					this.exDefaultCallbackName({ "NAME": this.exPluginName, "ERR": "BLOCK:CLIENT" });
				} else if (status == "BLOCK:INTERNAL") {
					exlog(this.exPluginName + ".InvokeCallback.response", response);
					exlog(this.exPluginName + ".InvokeCallback", "CrossEXClient fail");
					//eval(this.exDefaultCallbackName)({ "NAME": this.exPluginName, "ERR": "BLOCK:INTERNAL" });
					this.exDefaultCallbackName({ "NAME": this.exPluginName, "ERR": "BLOCK:INTERNAL" });
				} else {
					exlog(this.exPluginName + ".InvokeCallback.response", response);
					exlog(this.exPluginName + ".InvokeCallback", "native response status not TRUE");
					//eval(this.exDefaultCallbackName)(response);
					this.exDefaultCallbackName(response);
				}
			} catch (e) {
				exlog(this.exPluginName + ".InvokeCallback [exception]", e);
				exlog(this.exPluginName + ".InvokeCallback [exception]", "native response process exception");
				//eval(this.exDefaultCallbackName)(response);
				this.exDefaultCallbackName(response);
			}
		} else {
			exlog(this.exPluginName + ".InvokeCallback", "native call not response");
			//eval(this.exDefaultCallbackName)();
			this.exDefaultCallbackName();
		}
	};
};

// Static variable function set..
CROSSWEBEX_CHECK.moduleCheck = CROSSWEBEX_DAEMON.moduleCheck;
CROSSWEBEX_CHECK.daemonVersionCheck = CROSSWEBEX_DAEMON.daemonVersionCheck;
CROSSWEBEX_CHECK.setDaemonStatus = CROSSWEBEX_DAEMON.setDaemonStatus;
CROSSWEBEX_UTIL.sendWS = CROSSWEBEX_DAEMON.sendWS;
CROSSWEBEX_UTIL.executeFunctionByName = CROSSWEBEX_DAEMON.executeFunctionByName;
CROSSWEBEX_UTIL.documentMode = document.documentMode;
