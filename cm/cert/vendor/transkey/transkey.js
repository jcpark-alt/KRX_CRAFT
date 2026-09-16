/*
 * Transkey
 * (C) 2013. RAONSECURE,Inc. All rights reserved.
 * Version 4.6.15.5
 * 2025-05-14
 */


function addScript(src, param) {
	var exist = document.querySelector('script[src*="'+src+'"]');
	if(exist != undefined) {
		return;
	}
	
	if(param == undefined) {
		param = "";
	}
	
	var script = document.createElement("script");
    script.src = src + param;
    script.type = "text/javascript";
    document.head.appendChild(script);
}

addScript(transkey_url+'/TranskeyLibPack_op.js');
addScript(transkey_url+'/rsa_oaep_files/rsa_oaep-min.js');
if(useSha2) {
	if(typeof useBizSha2 != "undefined" && useBizSha2 == false) {
		document.write('<script type="text/javascript" src="'+transkey_url+'/jsbn/jsbn-min.js"></script>');
	}
	document.write('<script type="text/javascript" src="'+transkey_url+'/jsbn/jsbn-sha2-min.js"></script>');
} else {
	addScript(transkey_url+'/jsbn/jsbn-min.js');
}
addScript(transkey_url+'/typedarray.js')
if(transkey_apiuse){
	addScript(transkey_apiurl+'service/token?', new Date().getTime()+tk_origin);
	addScript(transkey_apiurl+'service/inittime?', tk_origin);
	addScript(transkey_apiurl+'service/getkeyboardhash?', tk_origin);
}else{
	addScript(transkey_surl+'?op=getToken&', new Date().getTime()+tk_origin);
	addScript(transkey_surl+'?op=getInitTime', tk_origin);
	addScript(transkey_surl+'?op=getKeyboardHash', tk_origin);
}

var transkey=[];

var tk=null;

var tk_btn_arr=[];

var reset_count=0;

function initTranskey(){

	setMaxDigits(131);
	
	checkCookie();
	
	if(tk!=null) {
		var inputs = document.getElementsByTagName("input");
		for(var i = 0; i < inputs.length; i++){
			var input = inputs.item(i);
			if(input.getAttribute("data-tk-kbdType")!=null&&transkey[input.id]!=null){
				tk.remove(inputs.item(i));
			}
		}
		tk=null;
	}
	
	if(tk==null){
		transkey.objs= new Array();
		tk = new Transkey();
		if(transkey_apiuse){
			tk.getPublicKey(transkey_apiurl);
		}
		else{
			tk.getPublicKey(transkey_surl);
		}
		
		if(useCheckTranskey){
			//checkTranskey for not detect drag
			if (document.addEventListener) {
		    	document.addEventListener("mousedown", checkTransKey, false);
			} else if (document.attachEvent) {
		    	document.attachEvent("onmousedown", checkTransKey);
			}
			
			//checkTranskey for detect drag
//			var moved;
//			
//			function downListener (nsEvent) {
//			    moved = false;
//			}
//			
//			if (document.addEventListener) {
//				document.addEventListener("mousedown", downListener, false)
//				,moveListener = function(event) {
//				    moved = true;
//				}
//				document.addEventListener("mousemove", moveListener, false)
//				,upListener = function(event) {
//				    if (!moved)
//				    	checkTransKey(event);
//				}
//				document.addEventListener("mouseup", upListener, false)
//			} else {
//				document.attachEvent("onmousedown", downListener)
//				,moveListener = function(event) {
//				    moved = true;
//				}
//				document.attachEvent("onmousemove", moveListener)
//				,upListener = function(event) {
//				    if (!moved)
//				    	checkTransKey(event);
//				}
//				document.attachEvent("onmouseup", upListener)
//			}
		}
	}

	return true;
}

function initCallback() {
	
}

if (typeof XMLHttpRequest == "undefined") {
	XMLHttpRequest = function() {
    	try { 
    		return new ActiveXObject("Msxml2.XMLHTTP.6.0"); 
		} catch(e) {
			console.log("[transkey Error] : Msxml2.XMLHTTP.6.0 init fail");
		};
		
    	try { 
    		return new ActiveXObject("Msxml2.XMLHTTP.3.0"); 
		} catch(e) {
			console.log("[transkey Error] : Msxml2.XMLHTTP.3.0 init fail");
		};
		
    	try { 
    		return new ActiveXObject("Msxml2.XMLHTTP"); 
		} catch(e) {
			console.log("[transkey Error] : Msxml2.XMLHTTP init fail");
		};
		
    	try { 
    		return new ActiveXObject("Microsoft.XMLHTTP"); 
		}  catch(e) {
			console.log("[transkey Error] : Microsoft.XMLHTTP init fail");
		};
 
    	throw new Error("This browser does not support XMLHttpRequest or XMLHTTP.");
	};
};


function TranskeyObj(inputObj, div, keyType, keyboardType, isMultiC, useT){
	this.isMultiCursor = isMultiC;
	this.isMultiMode=false;
	this.allocate=false;
	this.id=inputObj.id;
	this.keyboardType=keyboardType;
	this.width=0;
	this.div=div;
	this.mainDiv=div.children[this.id+"_mainDiv"];
	this.lowerDiv=div.children[this.id+"_layoutLower"];
	this.upperDiv=div.children[this.id+"_layoutUpper"];
	this.singleDiv=div.children[this.id+"_layoutSingle"];
	this.fakeMouseDiv=div.children[this.id+"_fakeMouseDiv"];
	this.osMouseDiv=div.children[this.id+"_osMouseDiv"];
	this.blankDiv=div.children[this.id+"_blankDiv"];
	this.blankOverDiv=div.children[this.id+"_blankOverDiv"];
	this.multiMouseTypeDiv=div.children[this.id+"_multiMouseTypeDiv"];
	this.singleMouseTypeDiv=div.children[this.id+"_singleMouseTypeDiv"];
	this.talkBack=useTalkBack;
	this.dragDiv=this.talkBack?div.firstChild.firstChild.children[this.id+"_dragDiv"]:div.children[this.id+"_dragDiv"];
	this.keyTypeIndex=""; // "l ","u ",""
	this.keyType=keyType;
	this.cap=false;
	this.useTranskey=useT;
	this.dki=new Array();
	this.useButton=false;
	this.button=null;
	this.inputObj=inputObj;
	this.frmId="";
	if(use_form_id)
		this.frmId = "_"+inputObj.form.id;
	this.hidden=document.getElementById("transkey_"+inputObj.id+this.frmId);
	this.hmac=document.getElementById("transkey_HM_"+inputObj.id+this.frmId);
	this.ExE2E=document.getElementById("transkey_ExE2E_"+inputObj.id+this.frmId);
	this.exE2E=inputObj.getAttribute("data-tk-ExE2E")==null?"false":inputObj.getAttribute("data-tk-ExE2E");
	this.parentKeyboard=inputObj.getAttribute("data-tk-parentKbd")==null?"false":inputObj.getAttribute("data-tk-parentKbd");
	this.checkValue=document.getElementById("Tk_"+inputObj.id+"_checkbox_value"+this.frmId);
	this.fieldType=inputObj.type;
	this.isCrt=false;
	this.btnType;
	this.keyboard = inputObj.getAttribute("data-tk-keyboard");
	this.nextFocus=null;
	this.allocationIndex = new GenKey().tk_getrnd_int();
	this.tk_Special_Mask_StartPos = inputObj.getAttribute("data-tk_hkStart_pos");
	this.tk_Special_Mask_EndPos = inputObj.getAttribute("data-tk_hkEnd_pos");
	this.tk_Special_Mask = inputObj.getAttribute("data-tk_hk_mask")==null?"*":inputObj.getAttribute("data-tk_hk_mask");
	this.tk_onKeyFlag = false; 
	if(inputObj.getAttribute("data-tk-nextFocusId")!=null)
		this.nextFocus = inputObj.getAttribute("data-tk-nextFocusId");
	if(this.keyboard==null)
		this.keyboard = this.keyboardType;
	if(!useSession){
		this.keyIndex = document.getElementById("keyIndex_"+inputObj.id+this.frmId).value;
		document.getElementById("keyboardType_"+inputObj.id+this.frmId).value = this.keyboardType;
		document.getElementById("fieldType_"+inputObj.id+this.frmId).value = this.fieldType;
	}
	
	var self = this;
	
	
	this.allocationCallback = function(){
		if (this.readyState == 4 && this.status == 200) {
			if(this.responseText.indexOf("SessionError")>-1){
				var errCodes = this.responseText.split("=");
				if(errCodes[1]=="1"){
					if(reset_count>2){
						return false;
					}
					tk_alert("세션이 만료되었습니다.");
					if(transkey_apiuse){
						tk.resetToken(transkey_apiurl);
						tk.resetSessionKey(transkey_apiurl);
					}else{
						tk.resetToken(transkey_surl);
						tk.resetSessionKey(transkey_surl);	
					}
					if(!useSession&&limitTime>0)
						self.getInitTime();
					reset_count++;
					self.allocation();
				}
			}else{
				if(useSession) 
					self.setUrl();
				 else 
					self.setKeyIndex(inputObj);
				reset_count = 0;
			}

		}
	};
	
	this.allocation = function(){
		if(onKeyboard_allocate||!self.allocate) {
			self.allocate=false;
			self.allocationIndex = new GenKey().tk_getrnd_int();
		}
		
		var request = new XMLHttpRequest();
		if(transkey_apiuse){
			request.open("GET", getUrlRestApi("service/allocation", this, this.keyType, this.allocationIndex)+tk_origin, useAsyncTranskey);
		} else{
			request.open("POST", transkey_surl, useAsyncTranskey);
			request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		}
		
		if(useCORS)
			request.withCredentials = true; 
		request.onreadystatechange = this.allocationCallback;
		
		try {
			if(transkey_apiuse){
				request.send();
			}else{
				request.send(getUrlPost("allocation", this, this.keyType, this.allocationIndex)+tk_origin);	
			}
		} catch(e) {
			tk_alert("[transkey Error] : Cannot load TransKey. Network is not available.");
			return false;
		}

	};
	
	this.setUrl = function(){
		
		var url = null;
		
		if(this.keyboardType=="number"){
			var numberImg = new Image();
			numberImg.onload = function(){
				self.allocate=true;
				self.tk_onKeyFlag = false;
				if(useTalkBack)
					self.getDummy();
			};
			numberImg.onerror = function(){
				self.tk_onKeyFlag = false;
				if(transkey_apiuse){
					tk.resetToken(transkey_apiurl);
					tk.resetSessionKey(transkey_apiurl);
				}else{
					tk.resetToken(transkey_surl);
					tk.resetSessionKey(transkey_surl);
				}
				if(!useSession&&limitTime>0)
					self.getInitTime();
//				self.allocation();
				if(useSession)
					self.setUrl();
				else
					self.setKeyIndex(self.inputObj);
			};
			if(transkey_apiuse){
				numberImg.src = getUrlRestApi("service/key", this, "single", this.allocationIndex);	
			}else{
				numberImg.src = getUrl("getKey", this, "single", this.allocationIndex);
			}
			this.singleDiv.style.backgroundImage="url('"+checkTag(numberImg.src)+"')";
			//this.singleDiv.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader( src='"+url+"', sizingMethod='scale')";
		}else{
			var quertyImg = new Image();
			quertyImg.onload = function(){
				if(transkey_apiuse){
					url = getUrlRestApi("service/key", self, "upper", self.allocationIndex);
				}else{
					url = getUrl("getKey", self, "upper", self.allocationIndex);
				}
				self.upperDiv.style.backgroundImage="url('"+checkTag(url)+"')";
				self.allocate=true;
				self.tk_onKeyFlag = false;
				if(useTalkBack)
					self.getDummy();
			};
			quertyImg.onerror = function(){
				self.tk_onKeyFlag = false;
				if(transkey_apiuse){
					tk.resetToken(transkey_apiurl);
					tk.resetSessionKey(transkey_apiurl);
				}else{
					tk.resetToken(transkey_surl);
					tk.resetSessionKey(transkey_surl);
				}
				if(!useSession&&limitTime>0)
					self.getInitTime();
//				self.allocation();
				if(useSession)
					self.setUrl();
				else
					self.setKeyIndex(self.inputObj);
			};
			if(transkey_apiuse){
				quertyImg.src = getUrlRestApi("service/key", this, "lower", this.allocationIndex);
			}else{
				quertyImg.src = getUrl("getKey", this, "lower", this.allocationIndex);
			}
			this.lowerDiv.style.backgroundImage="url('"+checkTag(quertyImg.src)+"')";		 
		}
	};
	
	function convertBinarytoFile (value) {
		let input = value.replace(/[^A-Fa-f0-9]/g, "");
		if (input.length % 2) {
			console.log("cleaned hex string length is odd.");
			return;
		}

		let binary = new Array();
		for (let i = 0; i < input.length / 2; i++) {
			let h = input.substr(i * 2, 2);
			binary[i] = parseInt(h, 16);
		}

		let byteArray = new Uint8Array(binary);
		var urlCreator = window.URL || window.webkitURL;
	
		return urlCreator.createObjectURL(new Blob([byteArray], { type: 'application/octet-stream' }));
	}

	this.setUrlUseBlob = function(){
		
		var url = null;
		
		var request = new XMLHttpRequest();
		
		if(this.keyboardType=="number"){
		
			if(transkey_apiuse){
				request.open("GET", getUrlRestApi("service/key", this, "single", this.allocationIndex)+"&talkBack="+this.talkBack+tk_origin, true);
			} else {
				request.open("GET", getUrl("getKey", this, "single", this.allocationIndex)+"&talkBack="+this.talkBack+tk_origin, true);
			}
			
			if(useCORS)
				request.withCredentials = true; 
			
			request.onreadystatechange = function(){
				if (request.readyState == 4 && request.status == 200) {
					var imageUrl = convertBinarytoFile(request.response);
					var numberImg = new Image();
					
						numberImg.onload = function(){
							self.allocate=true;
							self.tk_onKeyFlag = false;
							if(useTalkBack)
								self.getDummy();
						};
						numberImg.onerror = function(){
							self.tk_onKeyFlag = false;
							if(transkey_apiuse){
								tk.resetToken(transkey_apiurl);
								tk.resetSessionKey(transkey_apiurl);
							}else{
								tk.resetToken(transkey_surl);
								tk.resetSessionKey(transkey_surl);
							}
							if(!useSession&&limitTime>0)
								self.getInitTime();
			//				self.allocation();
							if(useSession)
								self.setUrl();
							else
								self.setKeyIndex(self.inputObj);
						};
					
					numberImg.src = imageUrl
					self.singleDiv.style.backgroundImage="url('"+checkTag(numberImg.src)+"')";
					self.singleDiv.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader( src='"+numberImg.src+"', sizingMethod='scale')";
				}
			};
			
			
			try {
				request.send();
			} catch(e) {
				alert("TransKey error: Cannot load TransKey. Network is not available.");
				return false;
			}
			
		}else{
		
			if(transkey_apiuse){
				request.open("GET", getUrlRestApi("service/key", this, "lower", this.allocationIndex)+"&talkBack="+this.talkBack+tk_origin, true);
			} else {
				request.open("GET", getUrl("getKey", this, "lower", this.allocationIndex)+"&talkBack="+this.talkBack+tk_origin, true);
			}
			
			if(useCORS)
				request.withCredentials = true; 
			
			request.onreadystatechange = function(){
				if (request.readyState == 4 && request.status == 200) {	
					var imageUrl = convertBinarytoFile(request.response);
					var quertyImg = new Image();

					quertyImg.onload = function(){
						self.allocate=true;
						
						var upper_request = new XMLHttpRequest();
						
						if(transkey_apiuse){
							upper_request.open("GET", getUrlRestApi("service/key", self, "upper", self.allocationIndex)+"&talkBack="+self.talkBack+tk_origin, true);
						} else {
							upper_request.open("GET", getUrl("getKey", self, "upper", self.allocationIndex)+"&talkBack="+self.talkBack+tk_origin, true);
						}
						
						if(useCORS)
							upper_request.withCredentials = true; 

						upper_request.onreadystatechange = function(){
							if (upper_request.readyState == 4 && upper_request.status == 200) {
								var upper_imageUrl = convertBinarytoFile(upper_request.response);
								self.upperDiv.style.backgroundImage="url('"+checkTag(upper_imageUrl)+"')";
								self.upperDiv.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader( src='"+upper_imageUrl+"', sizingMethod='scale')";
							}
						};
						
						try {
							upper_request.send();
						} catch(e) {
							alert("TransKey error: Cannot load TransKey. Network is not available.");
							return false;
						}
						
						self.tk_onKeyFlag = false;
						if(useTalkBack)
							self.getDummy();
					};
					quertyImg.onerror = function(){
						self.tk_onKeyFlag = false;
						if(transkey_apiuse){
							tk.resetToken(transkey_apiurl);
							tk.resetSessionKey(transkey_apiurl);
						}else{
							tk.resetToken(transkey_surl);
							tk.resetSessionKey(transkey_surl);
						}
						if(!useSession&&limitTime>0)
							self.getInitTime();
		//				self.allocation();
						if(useSession)
							self.setUrl();
						else
							self.setKeyIndex(self.inputObj);
					};
					quertyImg.src = imageUrl;
					self.lowerDiv.style.backgroundImage="url('"+checkTag(quertyImg.src)+"')";
					self.lowerDiv.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader( src='"+quertyImg.src+"', sizingMethod='scale')";
			
				}
			};
				
			try {
				request.send();
			} catch(e) {
				alert("TransKey error: Cannot load TransKey. Network is not available.");
				return false;
			} 
		}
	};
	
	this.getDummy = function(){
		var request = new XMLHttpRequest();
		if(transkey_apiuse)
			request.open("POST", transkey_apiurl + "service/dummy", useAsyncTranskey);
		else
			request.open("POST", transkey_surl, useAsyncTranskey);
		
		if(useCORS)
			request.withCredentials = true; 
		
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		
		request.onreadystatechange = function(){
			if (request.readyState == 4 && request.status == 200) {
				if(request.responseText.indexOf("SessionError")>-1){
					var errCodes = request.responseText.split("=");
					if(errCodes[1]=="1"){
						tk_alert("SessionError");
						if(transkey_apiuse){
							tk.resetToken(transkey_apiurl);
							tk.resetSessionKey(transkey_apiurl);
						}else{
							tk.resetToken(transkey_surl);
							tk.resetSessionKey(transkey_surl);
						}
						if(!useSession&&limitTime>0)
							self.getInitTime();
					}
				}else{
					self.allocate=true;
					if(self.talkBack){
							if(self.keyboardType=="number"){
								self.talkBackNumberText=this.responseText.split(",");
								self.talkBackNumberText.splice(12, 3);
							}else{
								self.dki = this.responseText.split(",");
							}

						tk.setTalkBackKeys(self);
						tk.setTalkBackText(self);
					}
				}
			}
		};
		
		try {
			if(transkey_apiuse){
				request.send(getUrlRestApiPost(self, this.keyType, this.allocationIndex)+"&talkBack="+self.talkBack+tk_origin);
			}else{
				request.send(getUrlPost("getDummy", self, this.keyType ,this.allocationIndex)+"&talkBack="+self.talkBack+tk_origin);
			}
		} catch(e) {
			tk_alert("[transkey Error] : Cannot load TransKey. Network is not available.");
			return false;
		}
	}
	
	this.setKeyIndex = function(inputObj) {
		var request = new XMLHttpRequest();
		if(transkey_apiuse)
			request.open("POST", transkey_apiurl+"service/keyindex", useAsyncTranskey);
		else
			request.open("POST", transkey_surl, useAsyncTranskey);
		
		if(useCORS)
			request.withCredentials = true; 
		
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		
		request.onreadystatechange = function(){
			if (request.readyState == 4 && request.status == 200) {
				var hidKeyIndex = document.getElementById("keyIndex_"+inputObj.id+self.frmId);
				hidKeyIndex.setAttribute("value", this.responseText);
				self.keyIndex = hidKeyIndex.value;
				if(isNode){
					self.setUrlUseBlob();
				} else{
					self.setUrl();
				}
			}
		};
		
		try {
			if(transkey_apiuse){
				request.send(getUrlRestApiPost(self, this.keyType, this.allocationIndex)+"&talkBack="+self.talkBack+tk_origin);
			}else{
				request.send(getUrlPost("getKeyIndex", self, this.keyType ,this.allocationIndex)+"&talkBack="+self.talkBack+tk_origin);
			}
		} catch(e) {
			tk_alert("[mTranskey Error] : Cannot load TransKey. Network is not available.");
			return false;
		}
	}
	
	this.getInitTime = function() {
		var request = new XMLHttpRequest();
		if(transkey_apiuse){
			request.open("GET", transkey_apiurl+"service/inittime?"+new Date().getTime()+tk_origin, false);
		}else{
			request.open("GET", transkey_surl+"?op=getInitTime&"+new Date().getTime()+tk_origin, false);
		}
		request.onreadystatechange = function(){
			if (request.readyState == 4 && request.status == 200) {
				initTime = request.responseText.split(";")[0];
				initTime = initTime.split("=")[1];
				initTime = initTime.replace("'","");
				initTime = initTime.replace("'","");
			}
			
		};
		try {
			request.send();
		} catch(e) {
			tk_alert("[transkey Error] : Cannot load TransKey. Network is not available.");
			return false;
		}
		document.getElementById("initTime"+this.frmId).value = initTime;
	}
	
	this.setCursorStyle = function(style){
		if(style=="none"){
			if(tk.isMSIE)
				style="url('" + transkey_url + "/images/invisible.cur'),auto";
			else if(tk.isSafari)
				style="url('" + transkey_url + "/images/invisible.gif'),auto";
		}
		this.div.style.cursor=style;
		this.mainDiv.style.cursor=style;
		this.fakeMouseDiv.style.cursor=style;
		this.osMouseDiv.style.cursor=style;
		this.blankDiv.style.cursor=style;
		this.blankOverDiv.style.cursor=style;
		
		if(useTalkBack) {
			var childNodes = this.div.firstChild.childNodes;
	
			for(var i=0;i<childNodes.length;i++){
				var child = childNodes[i];
				if(child.id==this.id+"_mainDiv"){
					continue;
				}
				if(child.tagName=="DIV"||child.tagName=="div"){
					for(var k=0;k<child.childNodes.length;k++){
						var key = child.childNodes[k];
						if(key.tagName=="A"||key.tagName=="a"){
							key.style.cursor=style;
						}
					}
				}
			}
		}
	};
	
	this.setExE2E = function(ExE2E){
		this.ExE2E.value=ExE2E;
	};
	
	function getUrl(op, o, keyType, allocationIndex){
		if(!useSession){
			return transkey_surl+"?op="+op+"&name="+o.id+"&keyType="+keyType+"&keyboardType="+o.keyboard+"&fieldType="
			+o.fieldType+"&inputName="+o.inputObj.name+"&parentKeyboard="+o.parentKeyboard+"&transkeyUuid="+tk.transkeyUuid+"&exE2E="+o.exE2E
			+"&TK_requestToken="+TK_requestToken+"&isCrt="+o.isCrt+"&allocationIndex="+allocationIndex+"&keyIndex="+o.keyIndex+"&initTime="+initTime+tk_origin;
		}
		else {
			return transkey_surl+"?op="+op+"&name="+o.id+"&keyType="+keyType+"&keyboardType="+o.keyboard+"&fieldType="
			+o.fieldType+"&inputName="+o.inputObj.name+"&parentKeyboard="+o.parentKeyboard+"&transkeyUuid="+tk.transkeyUuid+"&exE2E="+o.exE2E
			+"&TK_requestToken="+TK_requestToken+"&isCrt="+o.isCrt+"&allocationIndex="+allocationIndex+tk_origin;
		}
	}
	
	function getUrlPost(op, o, keyType, allocationIndex){
		if(!useSession){
			return "op="+op+"&name="+o.id+"&keyType="+keyType+"&keyboardType="+o.keyboard+"&fieldType="
			+o.fieldType+"&inputName="+o.inputObj.name+"&parentKeyboard="+o.parentKeyboard+"&transkeyUuid="+tk.transkeyUuid+"&exE2E="+o.exE2E+
			"&TK_requestToken="+TK_requestToken+"&isCrt="+o.isCrt+"&allocationIndex="+allocationIndex+"&keyIndex="+o.keyIndex+"&initTime="+initTime+tk_origin;
		} else {
			return "op="+op+"&name="+o.id+"&keyType="+keyType+"&keyboardType="+o.keyboard+"&fieldType="
			+o.fieldType+"&inputName="+o.inputObj.name+"&parentKeyboard="+o.parentKeyboard+"&transkeyUuid="+tk.transkeyUuid+"&exE2E="+o.exE2E+
			"&TK_requestToken="+TK_requestToken+"&isCrt="+o.isCrt+"&allocationIndex="+allocationIndex+tk_origin;
		}
	}
	
	function getUrlRestApi(op, o, keyType, allocationIndex){
		if(!useSession){
			//세션 미사용시
			return transkey_apiurl+op+"?name="+o.id+"&keyType="+keyType+"&keyboardType="+o.keyboard+"&fieldType="
			+o.fieldType+"&inputName="+o.inputObj.name+"&parentKeyboard="+o.parentKeyboard+"&transkeyUuid="+tk.transkeyUuid+"&exE2E="+o.exE2E
			+"&TK_requestToken="+TK_requestToken+"&isCrt="+o.isCrt+"&allocationIndex="+allocationIndex+"&keyIndex="+o.keyIndex+"&initTime="+initTime+tk_origin;
		}else{
			//세션 사용시
			return transkey_apiurl+op+"?name="+o.id+"&keyType="+keyType+"&keyboardType="+o.keyboard+"&fieldType="
			+o.fieldType+"&inputName="+o.inputObj.name+"&parentKeyboard="+o.parentKeyboard+"&transkeyUuid="+tk.transkeyUuid+"&exE2E="+o.exE2E
			+"&TK_requestToken="+TK_requestToken+"&isCrt="+o.isCrt+"&allocationIndex="+allocationIndex+tk_origin;
		}
	}
	
	function getUrlRestApiPost(o, keyType, allocationIndex){
		if(!useSession){
			//세션 미사용시
			return "name="+o.id+"&keyType="+keyType+"&keyboardType="+o.keyboard+"&fieldType="
			+o.fieldType+"&inputName="+o.inputObj.name+"&parentKeyboard="+o.parentKeyboard+"&transkeyUuid="+tk.transkeyUuid+"&exE2E="+o.exE2E
			+"&TK_requestToken="+TK_requestToken+"&isCrt="+o.isCrt+"&allocationIndex="+allocationIndex+"&keyIndex="+o.keyIndex+"&initTime="+initTime+tk_origin;
		}else{
			//세션 사용시
			return "name="+o.id+"&keyType="+keyType+"&keyboardType="+o.keyboard+"&fieldType="
			+o.fieldType+"&inputName="+o.inputObj.name+"&parentKeyboard="+o.parentKeyboard+"&transkeyUuid="+tk.transkeyUuid+"&exE2E="+o.exE2E
			+"&TK_requestToken="+TK_requestToken+"&isCrt="+o.isCrt+"&allocationIndex="+allocationIndex+tk_origin;
		}
	}

	function checkTag(value){
		return value.replace(/</gi,"&lt;").replace(/>/gi,"&gt;").replace(/'/gi, "&#39;").replace(/"/gi, "&#34;");
	}
		
	this.setKeyType(keyType);


}

TranskeyObj.prototype.setButton = function(useB){

	
	this.useButton=useB;

	if(useB){
		if(document.getElementById(this.id+"_tk_btn")==null)
			return false;
		
		var btnType = document.getElementById(this.id+"_tk_btn").getAttribute("data-tk-btnType");
		if(btnType==null)
			btnType="checkbox";
		this.btnType = btnType;
		if(btnType=="checkbox"){		
			var btn = document.createElement("button");
			btn.type="button";
			btn.style.cssText = "border: none; background: none; padding: 0 0 0 0;";
			btn.id="Tk_"+this.id+"_checkbox";
			btn.name="Tk_"+this.id+"_checkbox";
			
			var chkBox = document.createElement("input");
			chkBox.type="checkbox";
			chkBox.className = "transkey_checkbox";
			chkBox.style.cssText = "cursor: not-allowed; pointer-events:none;";
			chkBox.id="Tk_"+this.id+"_checkbox_input";
			btn.appendChild(chkBox);
			
			var label = document.createElement("label");
			label.htmlFor="Tk_"+this.id+"_checkbox_input";
			btn.appendChild(label);
			
			var btnText = document.getElementById(this.id+"_tk_btn").textContent;
			btn.appendChild(document.createTextNode(btnText));
			document.getElementById(this.id+"_tk_btn").textContent = "";
			
			document.getElementById(this.id+"_tk_btn").appendChild(btn);
			
			this.button = document.getElementById("Tk_"+this.id+"_checkbox");
			this.checkbox = document.getElementById("Tk_"+this.id+"_checkbox").children[0];
			tk_btn_arr[this.button.id]=this.id;
			if(tk_useTranskey){
				this.checkbox.checked=true;
			}else{
				this.checkbox.checked=false;
			}
			 var obj = this.inputObj.form;
			 if(obj==null)
				 obj = this.inputObj.parentNode;
			 if(obj==null)
				 obj = document.body;
			var checkValue = document.createElement("input");
			checkValue.setAttribute("type", "hidden");
			checkValue.setAttribute("id", "Tk_"+this.id+"_checkbox_value"+this.frmId);
			checkValue.setAttribute("name", "Tk_"+this.id+"_checkbox_value"+this.frmId);
			checkValue.setAttribute("value", this.useTranskey?"transkey":"e2e");
			obj.appendChild(checkValue);
			this.checkValue = checkValue;
		}else if(btnType=="img"){
			var btn = document.createElement("button");
			btn.type="button";
			btn.style.cssText = "border: none; background: none; padding: 0 0 0 0;";
			btn.id="Tk_"+this.id+"_checkbox";
			btn.name="Tk_"+this.id+"_checkbox";
			
			var img = document.createElement('img');
			img.alt="가상키보드실행버튼";
			img.src="";
			img.style.cssText = "cursor: not-allowed; pointer-events:none; vertical-align:middle;";
			btn.appendChild(img);
			
			var btnText = document.getElementById(this.id+"_tk_btn").textContent;
			document.getElementById(this.id+"_tk_btn").textContent = "";
			btn.appendChild(document.createTextNode(btnText));
			
			document.getElementById(this.id+"_tk_btn").appendChild(btn);
			
			this.button =  document.getElementById("Tk_"+this.id+"_checkbox");
			this.image = document.getElementById("Tk_"+this.id+"_checkbox").children[0];
			tk_btn_arr[this.button.id]=this.id;
			if(tk_useTranskey){				
				if(useCustomButton) {
					this.image.src = customOnButton;
				} else {
					this.image.src = transkey_url+'/images/on.png';
				}
			}else{
				if(useCustomButton) {
					this.image.src = customOffButton;
				} else {
					this.image.src = transkey_url+'/images/off.png';
				}
			}
			 var obj = this.inputObj.form;
			 if(obj==null)
				 obj = this.inputObj.parentNode;
			 if(obj==null)
				 obj = document.body;
			var checkValue = document.createElement("input");
			checkValue.setAttribute("type", "hidden");
			checkValue.setAttribute("id", "Tk_"+this.id+"_checkbox_value"+this.frmId);
			checkValue.setAttribute("name", "Tk_"+this.id+"_checkbox_value"+this.frmId);
			checkValue.setAttribute("value", this.useTranskey?"transkey":"e2e");
			obj.appendChild(checkValue);
			this.checkValue = checkValue;
		}
		
		if(this.button.addEventListener ){
			this.button.addEventListener("click", tk.buttonListener, false);
		}else{
			this.button.attachEvent("onclick", tk.buttonListener);
		}
	}
};

TranskeyObj.prototype.setKeyType = function(keyT){
	this.keyType = keyT;
	if(keyT=="single"){
		this.keyTypeIndex = "";
	}else{
		this.keyTypeIndex = keyT.charAt(0)+" ";
		
		if(keyT=="upper")
			this.cap=true;

	}


};


TranskeyObj.prototype.setQwertyKey = function(key){
	this.lowerDiv.style.display="block";			
	this.upperDiv.style.display="block";
	if(key=="upper"){
		this.lowerDiv.style.display="none";	
	}else{
		this.lowerDiv.style.display="block";
	}
};

TranskeyObj.prototype.setDrag = function(boolean){
	if(boolean){
		this.dragDiv.style.display="inline";
	}else{
		this.dragDiv.style.display="none";
	}
};

TranskeyObj.prototype.clear = function(){
	
	this.inputObj.value = "";		
	 
	this.hidden.value = "";
	
	this.hmac.value = "";
};

TranskeyObj.prototype.getCipherDataCallback = function(aCipher){
	
}

TranskeyObj.prototype.getCipherData = function(xecureRandomData, crtType){
	var v = tk.inputFillEncData(this.inputObj);
	var aCipher = null;
	var aCipherArray = null;
	var aInputValue = null;
	var aInputHMValue = null;
	var encXecureRanData = null;
	var aRequest = null;
	var now = this;
	
	aInputValue = v.hidden;
	
	if (aInputValue == null || aInputValue == "") {
		aCipher = "";
		return aCipher;
	}
	
	aInputHMValue = v.hmac;	
	
	var PKey = tk.getPKey();

	encXecureRanData = tk.phpbb_encrypt2048(xecureRandomData, PKey.k, PKey.e, PKey.n);
	
	var rsaPubKey="";
	
	var crtTypeParam = crtType;
	if(crtType=="initech"){
		rsaPubKey = tk.getCertPublicKey();
		crtTypeParam = "yettie";
	}
	
	var sPort = location.port;
	if(sPort.length<=0)
		sPort = '80';

	aRequest = new XMLHttpRequest();
	
	if(transkey_apiuse)
		aRequest.open("POST", transkey_apiurl+ "service/plaintext", useAsyncTranskey);
	else
		aRequest.open("POST", transkey_surl, useAsyncTranskey);
	
	
	if(useCORS)
		aRequest.withCredentials = true;
	else
		aRequest.setRequestHeader("Cache-Control", "no-cache");
	
	aRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	try{
		if(transkey_apiuse){
			if(!useSession) {
				var seedKey = document.getElementById("seedKey"+this.frmId).value;
				aRequest.send("name=" + this.id + "&value=" + aInputValue + "&hmac=" 
						+ aInputHMValue + "&crtType=" + crtTypeParam + "&encXecureRanData=" + encXecureRanData 
						+ "&sPort=" + sPort+"&pubKey=" + rsaPubKey+"&keyIndex=" + this.keyIndex+"&fieldType="
						+ this.fieldType+"&keyboardType=" + this.keyboardType + "&encSeedKey=" + seedKey +"&initTime="+initTime+tk_origin);
			}else{
				aRequest.send("name=" + this.id + "&value=" + aInputValue + "&hmac=" 
					+ aInputHMValue + "&crtType=" + crtTypeParam + "&encXecureRanData=" + encXecureRanData 
					+ "&transkeyUuid=" + tk.transkeyUuid + "&sPort=" + sPort + "&pubKey="+ rsaPubKey +"&TK_requestToken="+TK_requestToken+tk_origin);
			}
		}else{
			if(!useSession) {
				var seedKey = document.getElementById("seedKey"+this.frmId).value;
				aRequest.send("op=getPlainText&name=" + this.id + "&value=" + aInputValue + "&hmac=" 
						+ aInputHMValue + "&crtType=" + crtTypeParam + "&encXecureRanData=" + encXecureRanData 
						+ "&sPort=" + sPort+"&pubKey=" + rsaPubKey+"&keyIndex=" + this.keyIndex+"&fieldType="
						+ this.fieldType+"&keyboardType=" + this.keyboardType + "&encSeedKey=" + seedKey +"&initTime="+initTime+tk_origin);
			} else {
				aRequest.send("op=getPlainText&name=" + this.id + "&value=" + aInputValue + "&hmac=" 
						+ aInputHMValue + "&crtType=" + crtTypeParam + "&encXecureRanData=" + encXecureRanData 
						+ "&transkeyUuid=" + tk.transkeyUuid + "&sPort=" + sPort + "&pubKey="+ rsaPubKey +"&TK_requestToken="+TK_requestToken+tk_origin);
			}
		}
	} catch(e) {
		tk_alert("[transkey Error] : Cannot load TransKey. Network is not available.");
		return false;
	}
	
	if(useAsyncTranskey) {
		aRequest.onreadystatechange = function(){
			if (aRequest.readyState == 4 && aRequest.status == 200) {
				 if(aRequest.responseText.indexOf("LimitTimeOver")>-1){
					tk_alert("시간이 만료되었습니다.");
					tk.now.clear();
					if(transkey_apiuse){
						tk.resetToken(transkey_apiurl);
						tk.resetSessionKey(transkey_apiurl);
					}else{
						tk.resetToken(transkey_surl);
						tk.resetSessionKey(transkey_surl);	
					}
					if(!useSession&&limitTime>0)
						tk.now.getInitTime();
//					tk.now.allocation();
					if(useSession)
						tk.now.setUrl();
					else
						tk.now.setKeyIndex(tk.now.inputObj);
				} else if(aRequest.responseText.indexOf("Integrity verification failed")>-1){
					tk_alert("데이터 무결성 검증에 실패하였습니다.");
					tk.now.clear();
					if(transkey_apiuse){
						tk.resetToken(transkey_apiurl);
						tk.resetSessionKey(transkey_apiurl);
					}else{
						tk.resetToken(transkey_surl);
						tk.resetSessionKey(transkey_surl);	
					}
					if(!useSession&&limitTime>0)
						tk.now.getInitTime();
//					tk.now.allocation();
					if(useSession)
						tk.now.setUrl();
					else
						tk.now.setKeyIndex(tk.now.inputObj);
				} else {				
					aCipher = aRequest.responseText.replace(/\n/gi, '');
					if(crtType=="initech"){
						now.getCipherDataCallback(aCipher);
						return aRequest.responseText;
					}
					aCipherArray = aCipher.split(',');
	
					aCipher = "";
					for ( var i = 0; i < aCipherArray.length - 1; i++) {
						if (aCipherArray[i].length == 1) {
							aCipher += '0';
						}
	
						aCipher += aCipherArray[i];
					}
	
					now.getCipherDataCallback(aCipher);
	
					return aCipher;
				}
			} else {
				aCipher = "";
				return aCipher;
			}
		}
	} else {
		if (aRequest.readyState == 4 && aRequest.status == 200) {
			 if(aRequest.responseText.indexOf("LimitTimeOver")>-1){
				tk_alert("시간이 만료되었습니다.");
				tk.now.clear();
				if(transkey_apiuse){
					tk.resetToken(transkey_apiurl);
					tk.resetSessionKey(transkey_apiurl);
				}else{
					tk.resetToken(transkey_surl);
					tk.resetSessionKey(transkey_surl);	
				}
				if(!useSession&&limitTime>0)
					tk.now.getInitTime();
//				tk.now.allocation();
				if(useSession)
					tk.now.setUrl();
				else
					tk.now.setKeyIndex(tk.now.inputObj);
			} else if(aRequest.responseText.indexOf("Integrity verification failed")>-1){
				tk_alert("데이터 무결성 검증에 실패하였습니다.");
				tk.now.clear();
				if(transkey_apiuse){
					tk.resetToken(transkey_apiurl);
					tk.resetSessionKey(transkey_apiurl);
				}else{
					tk.resetToken(transkey_surl);
					tk.resetSessionKey(transkey_surl);	
				}
				if(!useSession&&limitTime>0)
					tk.now.getInitTime();
//				tk.now.allocation();
				if(useSession)
					tk.now.setUrl();
				else
					tk.now.setKeyIndex(tk.now.inputObj);
			} else {				
				aCipher = aRequest.responseText.replace(/\n/gi, '');
				if(crtType=="initech"){
					now.getCipherDataCallback(aCipher);
					return aRequest.responseText;
				}
				aCipherArray = aCipher.split(',');

				aCipher = "";
				for ( var i = 0; i < aCipherArray.length - 1; i++) {
					if (aCipherArray[i].length == 1) {
						aCipher += '0';
					}

					aCipher += aCipherArray[i];
				}

				now.getCipherDataCallback(aCipher);

				return aCipher;
			}
		} else {
			aCipher = "";
			return aCipher;
		}
	}
};

TranskeyObj.prototype.done = function(){
	if (tk.now.nextFocus==null&&useTalkBack&&useRefocus)
		document.getElementById(tk.now.id).focus();
};

function Transkey(){
	this.offsetX=0;
	this.offsetY=0;
	this.startX=0;
	this.startY=0;
	this.scrollY=0;
	this.scrollX=0;
	
	this.dragStart=false;
	var sessionKey = [, , , , , , , , , , , , , , , ];
	var genKey = new GenKey();
	var useCert = "true";	
	//P lic
//	var cert_pub = "-----BEGIN CERTIFICATE-----MIIDQzCCAiugAwIBAgIJAOYjCX4wgWNoMA0GCSqGSIb3DQEBCwUAMGcxCzAJBgNVBAYTAktSMR0wGwYDVQQKExRSYW9uU2VjdXJlIENvLiwgTHRkLjEaMBgGA1UECxMRUXVhbGl0eSBBc3N1cmFuY2UxHTAbBgNVBAMTFFJhb25TZWN1cmUgQ28uLCBMdGQuMB4XDTE2MDcxOTA5MDYxNloXDTQ2MDcxMjA5MDYxNlowPzELMAkGA1UEBhMCS1IxDTALBgNVBAoTBFJORDMxITAfBgNVBAMUGFQ9UCZEPVsqLnJhb25zZWN1cmUuY29tXTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMtaq7IBKFodF527juYjDIduoTRozWiUQXFgv1jY5I9ZmPxKzVQor1vdezRf1QXHMfKTp1c4/Xv/OmVDPw2gtNcsks2+SbKGVpaF6WwWGqnEfaJW3niPd9mxqNIbAj49aAeQD3HHoz/nNsv1oxpkn4VbsqVrKug6hqykO5nz/wqcWbb8wsJ2K3ogbJ5lcjf54d+oBzskupEvGf11OY4+0MGNC8FaXn8xtLe/7i9ej0yqZ1B5lwDfzuTvecLIS9AQwQN7dlg3DRo/ceYdR7BkJM21SEwfRGUmA22zMDdAfYHFFCa9K/sSFnF+zPaMcySkXuMaIqZ6o2SJSSw0Alkc6Z8CAwEAAaMaMBgwCQYDVR0TBAIwADALBgNVHQ8EBAMCBeAwDQYJKoZIhvcNAQELBQADggEBAB8POkPF95mHq8mP+/xHf6V4m4njvpMEUXK/bKtCQOUxqwUI84Lf9BuvMtXCOTbR7T6g35y5lKHaKFu2S4pi9u3wiZfXck76YpImrLGllvvviXgs4XLwaaewvsRTFCRSD8DpeMU/jf1q6+VqMa+wThJGXQ0e8bSdBXru0h7yCTjgW/E1OCBjz2WT9JecjqpCoDBneglLMU/krm1cDWTXEIWJm0hZM6EDSuAh15sp4AikxIE/AoZO1TKQjlGIG+87qc35hOJEbJQdDIVUuD46cUjO41oI0pcdSLrigc8D4QDD8bBih4LZbkZpAc/uvimOvij/m0GglpCFQjm8jkyZxkc=-----END CERTIFICATE-----";
	var cert_pub = "";
	//T lic
	var cert_ca = "-----BEGIN CERTIFICATE-----MIIEHjCCAwagAwIBAgIJALcMNEp1tPYgMA0GCSqGSIb3DQEBCwUAMGcxCzAJBgNVBAYTAktSMR0wGwYDVQQKExRSYW9uU2VjdXJlIENvLiwgTHRkLjEaMBgGA1UECxMRUXVhbGl0eSBBc3N1cmFuY2UxHTAbBgNVBAMTFFJhb25TZWN1cmUgQ28uLCBMdGQuMB4XDTEzMDIwNzA5MDYyNVoXDTQzMDEzMTA5MDYyNVowZzELMAkGA1UEBhMCS1IxHTAbBgNVBAoTFFJhb25TZWN1cmUgQ28uLCBMdGQuMRowGAYDVQQLExFRdWFsaXR5IEFzc3VyYW5jZTEdMBsGA1UEAxMUUmFvblNlY3VyZSBDby4sIEx0ZC4wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCqB0MsUuAi7pWVmRWaCS7kAactycMghmOM7RiMbmXyHmatXJbrtOlNrGH8Xl4fdkCJjyUE2829zQy+lTJ2O3Uo3Nn7zK3+3Um9nDQXN2tapambthOXs0aHjnRCtuLMOSPlAx06o0yHP1nOGaV7hfY9PyJjIVh9Lk/oFp5A+wsi0wiQ+INMDrm/6xZrooEY7/TLMnE4v+nr+cpIf3hSrvI1gGTykFtGCy2Le1huqaTKkE9K0CF/Sd8Kvebj6R+MhlieDXiMZXZD++pRmd4cAmGAmnGn4YdJMyh16TCccPjT60KkMv84uNVjXBvnar8ZlzRQSgIhwp1KkRiMErMbVWCnAgMBAAGjgcwwgckwHQYDVR0OBBYEFPzIDKwqK4PCklaP6Mq4YXdq8McyMIGZBgNVHSMEgZEwgY6AFPzIDKwqK4PCklaP6Mq4YXdq8McyoWukaTBnMQswCQYDVQQGEwJLUjEdMBsGA1UEChMUUmFvblNlY3VyZSBDby4sIEx0ZC4xGjAYBgNVBAsTEVF1YWxpdHkgQXNzdXJhbmNlMR0wGwYDVQQDExRSYW9uU2VjdXJlIENvLiwgTHRkLoIJALcMNEp1tPYgMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAHBRlEB4nu/gHwVFRzqbFOloR7aB0xIaMDykMWtovXHUQcTmmGyYQn0bMWaGVCD7SgRh1FisfciJzLP7f8OI5f7rA2tiBZD1PBtLMU7MytGIYlV/gcfWPbnqBVsKDm15AEUqH7ZahOm7np4d5Fr87r1bj2baXQPKSNd9yjh89fl6LthWLEQRYKKwhPYAA/QkeB2RE9MftmuOXJ6MnYyyx5xEZK2ofqwrRBvDmV/PjwdCSxhloiJVFHrp8lKPCsZywJ3v9IPpudjgBQ7SWqhDcPNo2diGB2dQ252g36K1H7u3aT9Xha33MFQXTTEDzVDhaXzaGk7X6T9v25dsOyOaLAo=-----END CERTIFICATE-----";
	var rng = new SecureRandom();
	var mKey = new Array();
	for(var i=0; keyboardLayouts.length>i; i++){
		mKey[keyboardLayouts[i]] = new Array();
	}
	this.now = null;
	this.browser = null;
	this.isPause = false;
	this.transkeyUuid;
	this.isMobile=false;
	this.isMSIE=false;
	this.isFirefox=false;
	this.isOpera=false;
	this.isSafari=false;
	this.isMSIE6=false;
	this.groupObjs = [];
	this.groupBtns = [];
	this.licenseType ="";
	this.licExpiredDate = "";
	this.licClassification = "";
	this.crtPublicKey="";
	var genSessionKey = "";
	var userAgent = navigator.userAgent;
	if(userAgent.indexOf('Macintosh') > 0||userAgent.indexOf('Linux') > 0||userAgent.indexOf('Windows') > 0)
		this.isMobile = false;
	else
		this.isMobile = true;
	if (userAgent.indexOf("iPad") > 0 ||userAgent.indexOf("iPhone") > 0 || userAgent.indexOf("Android") > 0)
		this.isMobile = true;
	if (navigator.appName == 'Opera'){
		this.isOpera = true;
		this.browser = 1;
	}
	if (userAgent.indexOf("MSIE") > 0){
		this.isMSIE = true;
		this.browser = 3;
	}
	else if(navigator.appName == "Netscape" && navigator.userAgent.toLowerCase().indexOf('trident')!=-1){
		this.browser = 2;
		this.isMSIE = true;
	}
	if (userAgent.indexOf("Safari") > 0){
		this.isSafari=true;
		this.browser = 1;
	}
	if (userAgent.indexOf("Firefox") > 0){
		this.isFirefox=true;
		this.browser = 1;
	}
	if(userAgent.indexOf("Chrome") > 0){
		this.isSafari=false;
		this.browser = 1;
	}
	if(userAgent.indexOf("MSIE 6") > 0){
		this.isMSIE6=true;
		this.browser = 3;
	}
	if(this.isiPad || this.isiPhone && !this.isSafari) {
		this.browser = 3;
	}
	
	this.talkBackLowerText = ['어금기호','1','2','3','4','5','6','7','8','9','0','q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','z','x','c','v','b','n','m','l','빼기','등호','원기호','왼쪽대괄호','오른쪽대괄호','스페이스바','세미콜론','작은따옴표','쉼표','마침표','슬래시'];
	this.talkBackUpperText = ['물결표시','느낌표','골뱅이','우물정','달러기호','퍼센트','꺽쇠','엠퍼샌드','별표','왼쪽괄호','오른쪽괄호','대문자Q','대문자W','대문자E','대문자R','대문자T','대문자Y','대문자U','대문자I','대문자O','대문자P','대문자A','대문자S','대문자D','대문자F','대문자G','대문자H','대문자J','대문자K','대문자Z','대문자X','대문자C','대문자V','대문자B','대문자N','대문자M','대문자L','밑줄','더하기','수직막대','왼쪽중괄호','오른쪽중괄호','스페이스바','콜론','따옴표','왼쪽꺽쇠괄호','오른쪽꺽쇠괄호','물음표'];
	
	this.getPKey = function(){
		if(useGenKey)
			var pKey = cert_pub.split(transkey_delimiter);
		else
			var pKey = _x509_getPublicKeyHexArrayFromCertPEM(cert_pub);
		
		var PKey = new Array();

		PKey["n"] = pKey[0];
		PKey["k"] = 256; // length of n in bytes
		PKey["e"] = pKey[1];
		
		return PKey;
	};
	
	this.getCertPublicKey = function(){
		return encodeURIComponent(this.crtPublicKey);
	};
	
	this.getPublicKey = function(url){
		var operation = "getPublicKey";
		if(transkey_apiuse)
			operation = "publickey";
		var request = new XMLHttpRequest();
		
		if(transkey_apiuse){
			request.open("GET", url+"service/" + operation +"?TK_requestToken="+TK_requestToken+tk_origin, useAsyncTranskey);	
		} else{
			request.open("POST", url, useAsyncTranskey);
			request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		}
		
		if(useCORS)
			request.withCredentials = true; 
		
		request.onreadystatechange = function(){
			if (request.readyState == 4 && request.status == 200) {
				if (request.responseText) {
					cert_pub = request.responseText;
					if(transkey_apiuse){
						tk.generateSessionKey(transkey_apiurl);
					}else{
						tk.generateSessionKey(transkey_surl);	
					}
				}
			}
		};
		
		try {
			if(transkey_apiuse){
				request.send();
			}else{
				request.send("op=" + operation +"&TK_requestToken="+TK_requestToken+tk_origin);
			}
		} catch(e) {
			tk_alert("[transkey Error] : Cannot load TransKey. Network is not available.");
			return false;
		}
	};

	this.generateSessionKey = function(url) {
		
		if(genSessionKey.length>0)
			return;
		
		if(useGenKey){
			if(cert_pub.indexOf("Error")>-1) {
				tk_alert("[transkey Error] : Cannot load TransKey. Network is not available.");
				return false;
			}
		} else {
			if( verifyCA() == false ){
				tk_alert("CA 검증이 실패 하였습니다. 프로그램이 정상작동 하지 않을 수 있습니다.");
				return false;
			}
		}
		
		var PKey = this.getPKey();
		
		this.transkeyUuid = genKey.tk_sh1prng();
		
		genSessionKey = genKey.GenerateKey(128);
		
		for(var i=0; i<16; i++)	{
			sessionKey[i] = Number("0x0" + genSessionKey.charAt(i));
		}
		
		var encSessionKey = this.phpbb_encrypt2048(genSessionKey, PKey.k, PKey.e, PKey.n);
		
		var licType = 0;
		
		if(!useSession){
			var operation = "getKeyInfo";
			if(transkey_apiuse)
				operation = "keyinfo";
		}
		else{
			var operation = "setSessionKey";
			if(transkey_apiuse)
				operation = "sessionkey";
		}
		
		var request = new XMLHttpRequest();
		
		if(transkey_apiuse){
			request.open("GET", url+"service/" + operation + "?key=" + encSessionKey + "&transkeyUuid=" + this.transkeyUuid+ "&useCert=" + useCert+ "&mode=common"+"&TK_requestToken="+TK_requestToken+tk_origin, useAsyncTranskey);	
		} else{
			request.open("POST", url, useAsyncTranskey);	
			request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		}
		
		if(useCORS)
			request.withCredentials = true; 
		request.onreadystatechange = function(){
			if (request.readyState == 4 && request.status == 200) {
				if(request.responseText.indexOf("LicenseError")>-1){
					var errMessage =  request.responseText.split(",");
					var errCodes = errMessage[0].split("=");
					var classification = errMessage[1].split("=");
					if(classification[1] == "r")
						tk.licClassification = "rsl";
					else if (classification[1] == "c")
						tk.licClassification = "crt";
					else 
						tk.licClassification = "undefined";
					tk.alert(errCodes[1]);
					tk= null;
					return false;
				}
				if (request.responseXML) {
					var result = request.responseXML.firstChild;					
					var res = null;
					var returns = "return [";
					for(var i=0; keyboardLayouts.length>i; i++){
						if(i==keyboardLayouts.length-1){
							returns += keyboardLayouts[i]+",";
						}else{
							returns += keyboardLayouts[i]+",";
						}	
					}
					returns += "]";
					for ( var i = 0; i < result.childNodes.length; i++) {
						var node = result.childNodes[i];
						if (node.tagName == "script") {
							for ( var j = 0; j < node.childNodes.length; j++) {
								if(node.childNodes[j].nodeValue.length>10){
									//csp 정책으로 unsafe-eval 발생 시, new function 사용 불가로 하단 함수 사용  2022.03.17			
									getKeyArray(node.childNodes[j].nodeValue);
									licType = getLicType(node.childNodes[j].nodeValue);
									tk.licExpiredDate = getLicExpiredDate(node.childNodes[j].nodeValue);
								}
							}
						}
					}
					
					var year = tk.licExpiredDate.substr(0,4);
					var month = tk.licExpiredDate.substr(5,2);
					var day = tk.licExpiredDate.substr(8,2);
					tk.licExpiredDate = "만료 날짜 : " + year + "년" + month + "월" + day + "일"
					
					if(licType == 1) {
						tk.licenseType = "임시 라이선스";
					}
					
					var inputs = document.getElementsByTagName("input");
					
					for(var i = 0; i < inputs.length; i++){
						var input = inputs.item(i);
						if(input.getAttribute("data-tk-kbdType")!=null&&transkey[input.id]==null){
							tk.setKeyboard(inputs.item(i), transkey_isMultiCursor, tk_useButton, tk_useTranskey);
						}
					}
						
					for(var i = 0; i < inputs.length; i++){
						var input = inputs.item(i);
						if(input.getAttribute("data-tk-groupId")!=null&&tk.groupObjs[input.getAttribute("data-tk-groupId")]==null)
							tk.setGroup(input.getAttribute("data-tk-groupId"));
					}
					//tk.checkCSS();
					//tk.checkKeyVer();

					//CSP 정책으로 unsafe-inline발생 시 사용 2022.03.17
					var exitVal = useSpace?61:60;
					var lEnterVal = useSpace?60:59;
					var rEnterVal = useSpace?59:58;
					var lCapVal = useSpace?56:55;
					var rCapVal = useSpace?57:56;
					var closeVal = useSpace?58:57;
					
					for(var i = 0; i < transkey.objs.length; i++){
						var index = 0;
						var keypad = document.getElementById(transkey.objs[i]+"_mainDiv");				
						var isQwerty = document.getElementById(transkey.objs[i]).getAttribute("data-tk-kbdtype").indexOf("qwerty")>-1? true:false;
						if(!tk.isMobile){
							if (document.addEventListener) {
								keypad.addEventListener( "mousemove" , function(){tk.showCursor(event,false)});
								keypad.addEventListener( "mouseout" , function(){tk.hideCursor(event)});
								keypad.addEventListener( "mouseover" , function(){tk.visibleCursor()});
							}else{
								keypad.attachEvent( "onmousemove" , function(){tk.showCursor(event,false)});	
								keypad.attachEvent( "onmouseout" , function(){tk.hideCursor(event)});	
								keypad.attachEvent( "onmouseover" , function(){tk.visibleCursor()});	
							}
							if (!useTalkBack) {
								if (document.addEventListener) {
									keypad.addEventListener( "click" , function(){tk.start(event)});
								}else{
									keypad.attachEvent( "onclick" , function(){tk.start(event)});	
								}
							}
						}
						for(var j = 0; j < keypad.childNodes.length ; j++){
							var keypadChild = keypad.childNodes[j];
							(function(j, keypad, keypadChild){
								if(j == 0){
									if(useTalkBack){ //useTalkback일 때만, tk_close 생성
										if (isQwerty){
											if (document.addEventListener) {
												keypadChild.childNodes[2].addEventListener( "click" , function(){tk.start(event, closeVal)});
											}else{
												keypadChild.childNodes[2].attachEvent( "onclick" , function(){tk.start(event, closeVal)});	
											}
										}else{
											if (document.addEventListener) {
												keypadChild.childNodes[2].addEventListener( "click" , function(){tk.start(event, 12)});
											}else{
												keypadChild.childNodes[2].attachEvent( "onclick" , function(){tk.start(event, 12)});	
											}
										}
									}
								}else{
									for(var k = 0; k < keypadChild.childNodes.length; k++){
										if (isQwerty){
											if (j == 1 && k == 13){// qwerty 삭제
												if (document.addEventListener) {
													keypadChild.childNodes[k].addEventListener( "click" , function(){tk.start(event, exitVal)});
												}else{
													keypadChild.childNodes[k].attachEvent( "onclick" , function(){tk.start(event, exitVal)});	
												}
												continue;
											}
											if (j == 4 && k == 0){// qwerty 왼쪽 Enter
												if (document.addEventListener) {
													keypadChild.childNodes[k].addEventListener( "click" , function(){tk.start(event, lEnterVal)});
												}else{
													keypadChild.childNodes[k].attachEvent( "onclick" , function(){tk.start(event, lEnterVal)});	
												}
												continue;									
											}
											if (j == 4 && k == keypadChild.childNodes.length-1 && isQwerty){// qwerty 오른쪽 Enter
												if (document.addEventListener) {
													keypadChild.childNodes[k].addEventListener( "click" , function(){tk.start(event, rEnterVal)});
												}else{
													keypadChild.childNodes[k].attachEvent( "onclick" , function(){tk.start(event, rEnterVal)});	
												}
												continue;									
											}
											if (j == 5 && k == 0){ // qwerty 왼쪽 cap
												if (document.addEventListener) {
													keypadChild.childNodes[k].addEventListener( "click" , function(){tk.start(event, lCapVal)});
												}else{
													keypadChild.childNodes[k].attachEvent( "onclick" , function(){tk.start(event, lCapVal)});	
												}
												continue;									
											}
											if (j == 5 && k == keypadChild.childNodes.length-1){ // qwerty 오른쪽 cap
												if (document.addEventListener) {
													keypadChild.childNodes[k].addEventListener( "click" , function(){tk.start(event, rCapVal)});
												}else{
													keypadChild.childNodes[k].attachEvent( "onclick" , function(){tk.start(event, rCapVal)});	
												}
												continue;									
											}
										}else{
											if(j == 1){
												if(k == 0){ // number 왼쪽 enter
													if (document.addEventListener) {
														keypadChild.childNodes[0].addEventListener( "click" , function(){tk.start(event, 13)});
													}else{
														keypadChild.childNodes[0].attachEvent( "onclick" , function(){tk.start(event, 13)});	
													}
												}else{// number 왼쪽 del
													if (document.addEventListener) {
														keypadChild.childNodes[1].addEventListener( "click" , function(){tk.start(event, 15)});
													}else{
														keypadChild.childNodes[1].attachEvent( "onclick" , function(){tk.start(event, 15)});	
													}
												}
												continue;
											}
											if(j == 2){
												if(k == 0){ // number 왼쪽 enter
													if (document.addEventListener) { // number 오른쪽 enter
														keypadChild.childNodes[0].addEventListener( "click" , function(){tk.start(event, 14)});
													}else{
														keypadChild.childNodes[0].attachEvent( "onclick" , function(){tk.start(event, 14)});	
													}
												}else{// number 왼쪽 del
													if (document.addEventListener) { // number 오른쪽 enter
														keypadChild.childNodes[1].addEventListener( "click" , function(){tk.start(event, 16)});
													}else{
														keypadChild.childNodes[1].attachEvent( "onclick" , function(){tk.start(event, 16)});	
													}
												}
												continue;
											}
										}
										(function(k, index){
											if (document.addEventListener) {											
												keypadChild.childNodes[k].addEventListener( "click" , function(){tk.start(event, index)});
											} else{
												keypadChild.childNodes[k].attachEvent( "onclick" , function(){tk.start(event, index)});
											}
										})(k, index);
									index++;		
									}
								}
							})(j,keypad, keypadChild);
						}
						
						//draggable 설정
						if(transkey_isDraggable){
							if (document.addEventListener) {		
								document.getElementById(transkey.objs[i]+"_dragDiv").addEventListener("mousedown", function(){tk.dragstart(event)});
								document.getElementById(transkey.objs[i]+"_dragDiv").addEventListener("mousewheel", function(){tk.dragend(event)});
								document.getElementById(transkey.objs[i]+"_dragDiv").addEventListener("mouseup", function(){tk.dragend(event)});
							}else{
								document.getElementById(transkey.objs[i]+"_dragDiv").attachEvent("onmousedown", function(){tk.dragstart(event)});
								document.getElementById(transkey.objs[i]+"_dragDiv").attachEvent("onmousewheel", function(){tk.dragend(event)});
								document.getElementById(transkey.objs[i]+"_dragDiv").attachEvent("onmouseup", function(){tk.dragend(event)});
							}
						}
						
						//멀티마우스 설정
						if(transkey_isMultiCursor && !(tk.isMobile || tk.isOpera)){
							if (document.addEventListener) {			
								if(!isQwerty){
									document.getElementById(transkey.objs[i]+"_osMouseDiv").addEventListener("mousedown", function(){tk.start(event,-1,true)});
								}else{
									document.getElementById(transkey.objs[i]+"_osMouseDiv").childNodes[0].addEventListener("mousemove", function(){tk.showCursor(event,true)});
									document.getElementById(transkey.objs[i]+"_osMouseDiv").childNodes[0].addEventListener("mouseout", function(){tk.hideCursor(event)});												
								}
								document.getElementById(transkey.objs[i]+"_singleMouseTypeDiv").addEventListener("click", function(){tk.setMultiCursor(false)});
								document.getElementById(transkey.objs[i]+"_blankOverDiv").addEventListener("click", function(){tk.pauseKeyboard(false)});
								document.getElementById(transkey.objs[i]+"_blankOverDiv").addEventListener("mouseover", function(){tk.pauseKeyboard(false)});
								document.getElementById(transkey.objs[i]+"_multiMouseTypeDiv").addEventListener("click", function(){tk.setMultiCursor(true)});						
							} else{
								if(!isQwerty){
									document.getElementById(transkey.objs[i]+"_osMouseDiv").attachEvent("onmousedown", function(){tk.start(event,-1,true)});
								}else{
									document.getElementById(transkey.objs[i]+"_osMouseDiv").childNodes[0].attachEvent("onmousemove", function(){tk.showCursor(event,true)});
									document.getElementById(transkey.objs[i]+"_osMouseDiv").childNodes[0].attachEvent("onmouseout", function(){tk.hideCursor(event)});
								}
								document.getElementById(transkey.objs[i]+"_singleMouseTypeDiv").attachEvent("onclick", function(){tk.setMultiCursor(false)});
								document.getElementById(transkey.objs[i]+"_blankOverDiv").attachEvent("onclick", function(){tk.pauseKeyboard(false)});
								document.getElementById(transkey.objs[i]+"_blankOverDiv").attachEvent("onmouseover", function(){tk.pauseKeyboard(false)});
								document.getElementById(transkey.objs[i]+"_multiMouseTypeDiv").attachEvent("onclick", function(){tk.setMultiCursor(true)});						
							}
						}
						
						//talkback 설정
						if(useTalkBack){ 
							if (document.addEventListener) {	
								document.getElementById(transkey.objs[i]+"_loop_last").addEventListener("focus", function(){document.getElementById(tk.now.id+"_loop_first").nextSibling.focus();});
							}else{
								document.getElementById(transkey.objs[i]+"_loop_last").attachEvent("onfocus", function(){document.getElementById(tk.now.id+"_loop_first").nextSibling.focus();});
							}	
						}
						
						
						var qwertyClickedButtons = ['_pKey', 'q_p_backKey', 'q_p_shiftkey_sp', 'q_p_enterKey_L', 'q_p_enterKey_R', 'q_p_shiftKey_L', 'q_p_shiftKey_R', '_blankImg', '_blankOverImg','_slngleMouseTypeImg','_multiMouseTypeImg'];
						var numberClickedButtons = ['_pKey', 'n_p_enterKey_L', 'n_p_enterKey_R', 'n_p_backKey_L', 'n_p_backKey_R', '_blankImg', '_blankOverImg','_slngleMouseTypeImg','_multiMouseTypeImg'];
						
						if(!useTalkBack){
							qwertyClickedButtons = ['_imgTwin', '_blankImg', '_blankOverImg','_slngleMouseTypeImg','_multiMouseTypeImg'];
							numberClickedButtons = ['_imgSingle', '_blankImg', '_blankOverImg','_slngleMouseTypeImg','_multiMouseTypeImg'];
						}
						
						(useSpace)? qwertyClickedButtons.push('q_p_space') : qwertyClickedButtons;//qwerty
						(showLicense&&tk.licenseType!="")? qwertyClickedButtons.push('q_licenseType') : qwertyClickedButtons;//qwerty
						
						if(!transkey_isMultiCursor || (tk.isMobile || tk.isOpera)){
							var elementsToRemove = ['_blankOverImg', '_slngleMouseTypeImg', '_multiMouseTypeImg'];

							qwertyClickedButtons = qwertyClickedButtons.filter(function(item) {
								return elementsToRemove.indexOf(item) === -1;
							});
							numberClickedButtons = numberClickedButtons.filter(function(item) {
								return elementsToRemove.indexOf(item) === -1;
							});
						}
						
						var clickedButtons = isQwerty? qwertyClickedButtons : numberClickedButtons;
						
						
						for(j = 0; j < clickedButtons.length; j++){
							if (document.addEventListener) {	
								document.getElementById(transkey.objs[i]+clickedButtons[j]).addEventListener("contextmenu", function(event){event.preventDefault();}, false);
								document.getElementById(transkey.objs[i]+clickedButtons[j]).addEventListener("dragstart", function(event){event.preventDefault();}, false);
								document.getElementById(transkey.objs[i]+clickedButtons[j]).addEventListener("selectstart", function(event){event.preventDefault();}, false);
							}else{
								document.getElementById(transkey.objs[i]+clickedButtons[j]).attachEvent("oncontextmenu", function(event){event.preventDefault();}, false);
								document.getElementById(transkey.objs[i]+clickedButtons[j]).attachEvent("ondragstart", function(event){event.preventDefault();}, false);
								document.getElementById(transkey.objs[i]+clickedButtons[j]).attachEvent("onselectstart", function(event){event.preventDefault();}, false);
							}
						}
					}
				
					initCallback();
				}
			}
		};
		try {
			if(transkey_apiuse){
				request.send();
			}else{
				request.send("op=" + operation + "&key=" + encSessionKey + "&transkeyUuid=" + this.transkeyUuid+ "&useCert=" + useCert+ "&mode=common"+"&TK_requestToken="+TK_requestToken+tk_origin);	
			}
		} catch(e) {
			tk_alert("[transkey Error] : Cannot load TransKey. Network is not available.");
			return false;
		}
	};
	
	function getKeyArray(func){
		var funcArr = func.split("\n");
		var key;
		var cnt=0;
		
		for(var i = 0; i< funcArr.length; i++){
			if(funcArr[i].indexOf("new Key")>-1){
				key = new Key;
				continue;
			}
			if(funcArr[i].indexOf(".name")>-1){
				var nameArr = funcArr[i].split("\"");
				key.name = nameArr[1];
				continue;
			}
			if(funcArr[i].indexOf(".addPoint")>-1){
				var pointArr = funcArr[i].split(",");
				var firstPoint = parseInt(pointArr[0].substr(pointArr[0].indexOf("(")+1));
				var secondPoint = parseInt(pointArr[1].substr(1,pointArr[1].indexOf(")")-1));
				key.addPoint(firstPoint, secondPoint);
				continue;
			}
			if(funcArr[i].indexOf(".push")>-1){
				var keyboard = funcArr[i].split(".")[0]
				if(keyboardLayouts.indexOf(keyboard) != -1) {
					mKey[keyboard].push(key);
				}

				continue;
			}
		}
	}
	
	function getLicType(func){
		var funcArr = func.split("\n");
		var licTypeArr = funcArr[funcArr.length-3].split("=");
		return parseInt(licTypeArr[1].replace(";",""));
	}
	
	function getLicExpiredDate(func){
		var funcArr = func.split("\n");
		var expiredDateArr = funcArr[funcArr.length-2].split("=");
		return expiredDateArr[1].replace(";","").replace(/\"/gi,"");
	}
	
	this.keyboardCheck = function(keyboard) {
		if(mKey[keyboard]!=null && mKey[keyboard].length>0) {
			return true;
		}else {
			return false;
		}
	}
	
	this.resetToken = function(url){
		if(!useSession)
			return;
			
		var request = new XMLHttpRequest();
		if(useCORS)
			request.withCredentials = true; 
		if(transkey_apiuse){
			request.open("GET", url+"service/token?"+new Date().getTime()+tk_origin, false);
		} else{
			request.open("GET", url+"?op=getToken&"+new Date().getTime()+tk_origin, false);
		}
		request.onreadystatechange = function(){
			if (request.readyState == 4 && request.status == 200) {
				TK_requestToken = request.responseText.split("=")[1];
				TK_requestToken = TK_requestToken.replace(";","");
				if(transkey_apiuse){
					tk.resetSessionKey(transkey_apiurl);
				}else{
					tk.resetSessionKey(transkey_surl);	
				}
			}
			
		};
		
		try {
			request.send();
		} catch(e) {
			tk_alert("[transkey Error] : Cannot load TransKey. Network is not available.");
			return false;
		}
	}
	
	this.resetSessionKey = function(url){
		
		if(!useGenKey){
			if( verifyCA() == false ){
				tk_alert("CA 검증이 실패 하였습니다. 프로그램이 정상작동 하지 않을 수 있습니다.");
				return false;
			}
		}
		
		var PKey = this.getPKey();
		
		var encSessionKey = this.phpbb_encrypt2048(genSessionKey, PKey.k, PKey.e, PKey.n);
		
		if(!useSession){
			var operation = "getKeyInfo";
			if(transkey_apiuse == true){
				operation = "keyinfo";
			}			
		} else {
			var operation = "setSessionKey";
			if(transkey_apiuse == true){
				operation = "sessionkey";
			}
		}
		var request = new XMLHttpRequest();
		if(useCORS)
			request.withCredentials = true; 
		if(transkey_apiuse){
			request.open("GET", url+"service/" + operation + "?key=" + encSessionKey + "&transkeyUuid=" + this.transkeyUuid+ "&useCert=" + useCert+ "&mode=common"+"&TK_requestToken="+TK_requestToken+tk_origin, useAsyncTranskey);
		} else{
			request.open("POST", url, useAsyncTranskey);
			request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		}
		
		request.onreadystatechange = function(){
			if (request.readyState == 4 && request.status == 200) {
				if(request.responseText.indexOf("LicenseError")>-1){
					var errMessage =  request.responseText.split(",");
					var errCodes = errMessage[0].split("=");
					var classification = errMessage[1].split("=");
					if(classification[1] == "r")
						tk.licClassification = "rsl";
					else if (classification[1] == "c")
						tk.licClassification = "crt";
					else 
						tk.licClassification = "undefined";
					tk.alert(errCodes[1]);
					tk= null;
					return false;
				}
			}
		};
		
		try {
			if(transkey_apiuse){
				request.send();
			}else{
				request.send("op=" + operation + "&key=" + encSessionKey + "&transkeyUuid=" + this.transkeyUuid+ "&useCert=" + useCert+ "&mode=common"+"&TK_requestToken="+TK_requestToken+tk_origin);
			}
		} catch(e) {
			tk_alert("[transkey Error] : Cannot load TransKey. Network is not available.");
			return false;
		}
	};
	
	this.inputFillEncData = function(input){
		var tkObj = transkey[input.id];
		var hidden = tkObj.hidden.value;
		var hmac = "";

		var maxSize = input.value.length+genKey.tk_getrnd_int()%10;			
		
		var geo = "d 0 0";
		
		for(var j=input.value.length; j<maxSize; j++)
		{	
			var encrypted = SeedEnc(geo);
			hidden += transkey_delimiter + encrypted;
		}

		hmac = CryptoJS.HmacSHA256(hidden, genSessionKey);
		
		var value = new Array();
		value["hidden"]=hidden;
		value["hmac"]=hmac;
		
		return value;
		
	};
	
	this.fillEncData = function()
	{
		try{
			for(var i=0;transkey.objs.length>i;i++){
				var tko = transkey[transkey.objs[i]];
				if(tko==null)
					continue;
				var hidden = tko.hidden;
				var HM = tko.hmac;
				var input = tko.inputObj;
				if(HM.value.length==0){
					var maxSize = input.value.length+genKey.tk_getrnd_int()%10;
					
					var geo = "d 0 0";

					for(var j=input.value.length; j<maxSize; j++)
					{	
						var encrypted = SeedEnc(geo);
						hidden.value += transkey_delimiter + encrypted;
					}
					
					if(!useSession){
						var PKey = this.getPKey();
						var encSessionKey = this.phpbb_encrypt2048(genSessionKey, PKey.k, PKey.e, PKey.n);
						document.getElementById("seedKey"+tko.frmId).value = encSessionKey;
					}
					
					HM.value = CryptoJS.HmacSHA256(hidden.value, genSessionKey);
				}			
			}
		}catch(e){
			console.error("transkey error : "+e.message);
			return false;
		}
		return true;
	};
	
	this.getEncData = function(x, y){
		var encrypted = "";
		var geo = this.now.keyTypeIndex + x + " " + y;
		
		encrypted = SeedEnc(geo);
		
		return encrypted;
	};
	
	this.removeTranskeys = function(inputIds){
		for(var i=0;i<inputIds.length;i++){
			var inputId = inputIds[i];
			try{
				this.remove(document.getElementById(inputId));
			}catch(e){
				console.log("[transkey Error] : Msxml2.XMLHTTP.6.0 init fail");
			}
		}
	};
	
	this.remove = function(inputObj){
		var div = transkey[inputObj.id].div;
		if(div==null)
			return;
		div.parentNode.removeChild(div);
		var hidden = transkey[inputObj.id].hidden;
		var hmac = transkey[inputObj.id].hmac;
		var checkValue = transkey[inputObj.id].checkValue;

		if(hidden!=null)
			hidden.parentNode.removeChild(hidden);
		if(hmac!=null)
			hmac.parentNode.removeChild(hmac);
		if(checkValue!=null)
			checkValue.parentNode.removeChild(checkValue);

		if (tk_useButton) {
			if (document.getElementById(inputObj.id + "_tk_btn") != undefined && document.getElementById(inputObj.id + "_tk_btn").childNodes.length>0){
				document.getElementById(inputObj.id + "_tk_btn").removeChild(document.getElementById(inputObj.id + "_tk_btn").firstChild);
				if (inputObj.readOnly == true) {
					inputObj.readOnly = false;
				}
			}
		}

		removeArray(transkey.objs, inputObj.id);
		
		transkey[inputObj.id]= null;
	};
	 
	this.setPosition = function(){
		var div = this.now.div;	 
		var inputObj = this.now.inputObj;
		var xy = inputObj.getAttribute("data-tk-kbdxy");
		if(xy == undefined){
			var point = getOffsetPoint(inputObj);
			
			var divWidth = document.getElementById(inputObj.id+"_mainDiv").offsetWidth;
            var rightPosition = inputObj.getAttribute("data-tk-rightPosition");
            var left=0;

			if (typeof jQuery == "undefined") {
				div.style.top = point.y+inputObj.offsetHeight+"px";
				left = point.x;
			} else {
				div.style.top = $('#'+inputObj.id).offset().top + inputObj.offsetHeight + "px";
				left = $('#'+inputObj.id).offset().left;
			}
			
			if(rightPosition == undefined || rightPosition == "true") {
                div.style.left = left + "px";
            }else {
                left = left - (divWidth - inputObj.offsetWidth);
                div.style.left = left + "px";
                if(div.getBoundingClientRect().x < document.body.offsetLeft) {
                    div.style.left = left + document.body.offsetLeft - div.getBoundingClientRect().x + "px";
                }
            }
		}else{
			var point = new Array();
			point = xy.split(" ");
			div.style.top = point[1]+"px";
			div.style.left = point[0]+"px";
		}
	};
	
	 this.setHiddenField = function(inputObj, ExE2E){
		 var obj = inputObj.form;
		 if(obj==null)
			 obj = inputObj.parentNode;
		 if(obj==null)
			 obj = document.body;
		 var frmId="";
		 if(use_form_id)
			 frmId = "_"+inputObj.form.id;
		 try{
			if(use_form_id){
				var hidfrmId = document.getElementById("hidfrmId");
				if(hidfrmId==null) {
					hidfrmId = document.createElement("input");
					hidfrmId.setAttribute("type", "hidden");
					hidfrmId.setAttribute("id", "hidfrmId");
					hidfrmId.setAttribute("name", "hidfrmId");
					hidfrmId.setAttribute("value", frmId.replace("_",""));
					obj.appendChild(hidfrmId);
				} else {
					hidfrmId.setAttribute("value", frmId.replace("_",""));
				}
			}
			if(!useSession) {
				var PKey = this.getPKey();
				var encSessionKey = this.phpbb_encrypt2048(genSessionKey, PKey.k, PKey.e, PKey.n);
				
				var seedKey = document.getElementById("seedKey"+frmId);
				if(seedKey==null){
					seedKey = document.createElement("input");
					seedKey.setAttribute("type", "hidden");
					seedKey.setAttribute("id", "seedKey"+frmId);
					seedKey.setAttribute("name", "seedKey"+frmId);
					seedKey.setAttribute("value", encSessionKey);
					obj.appendChild(seedKey);
				} else {
					seedKey.setAttribute("value", encSessionKey);
				}
				
				var hidInitTime = document.getElementById("initTime"+frmId);
				if(hidInitTime==null){
					hidInitTime = document.createElement("input");
					hidInitTime.setAttribute("type", "hidden");
					hidInitTime.setAttribute("id", "initTime"+frmId);
					hidInitTime.setAttribute("name", "initTime"+frmId);
					hidInitTime.setAttribute("value", initTime);
					obj.appendChild(hidInitTime);
				} else {
					hidInitTime.setAttribute("value", initTime);
				}
				
				var hidKeyIndex = document.getElementById("keyIndex_"+inputObj.id+frmId);
				if(hidKeyIndex==null){
					hidKeyIndex = document.createElement("input");
					hidKeyIndex.setAttribute("type", "hidden");
					hidKeyIndex.setAttribute("id", "keyIndex_"+inputObj.id+frmId);
					hidKeyIndex.setAttribute("name", "keyIndex_"+inputObj.id+frmId);
					hidKeyIndex.setAttribute("value", "");
					obj.appendChild(hidKeyIndex);
				} else {
					hidKeyIndex.setAttribute("value", "");
				}
				
				var hidkeyboardType = document.getElementById("keyboardType_"+inputObj.id+frmId);
				if(hidkeyboardType==null){
					hidkeyboardType = document.createElement("input");
					hidkeyboardType.setAttribute("type", "hidden");
					hidkeyboardType.setAttribute("id", "keyboardType_"+inputObj.id+frmId);
					hidkeyboardType.setAttribute("name", "keyboardType_"+inputObj.id+frmId);
					hidkeyboardType.setAttribute("value", "");
					obj.appendChild(hidkeyboardType);
				} else {
					hidkeyboardType.setAttribute("value", "");
				}
				
				var hidfieldType = document.getElementById("fieldType_"+inputObj.id+frmId);
				if(hidfieldType==null){
					hidfieldType = document.createElement("input");
					hidfieldType.setAttribute("type", "hidden");
					hidfieldType.setAttribute("id", "fieldType_"+inputObj.id+frmId);
					hidfieldType.setAttribute("name", "fieldType_"+inputObj.id+frmId);
					hidfieldType.setAttribute("value", "");
					obj.appendChild(hidfieldType);
				} else {
					hidfieldType.setAttribute("value", "");
				}
			}
			
			var uuid;
			if(use_form_id)
				uuid = document.getElementById("transkeyUuid"+frmId);
			else
				uuid = obj.children.transkeyUuid;
			if(uuid==null){
				uuid = document.createElement("input");
				uuid.setAttribute("type", "hidden");
				uuid.setAttribute("id", "transkeyUuid"+frmId);
				uuid.setAttribute("name", "transkeyUuid"+frmId);
				uuid.value=this.transkeyUuid;
				obj.appendChild(uuid);
			} else {
				uuid.value=this.transkeyUuid;
			}
			
			var hidden = document.getElementById("transkey_"+inputObj.id+frmId);
			if(hidden==null){
				hidden = document.createElement("input");
				hidden.setAttribute("type", "hidden");
				hidden.setAttribute("id", "transkey_"+inputObj.id+frmId);
				hidden.setAttribute("name", "transkey_"+inputObj.id+frmId);
				hidden.setAttribute("value", "");
				obj.appendChild(hidden);
			} else {
				hidden.setAttribute("value", "");
			}
			
			var hmac = document.getElementById("transkey_HM_"+inputObj.id+frmId);
			if(hmac==null){
				hmac = document.createElement("input");
				hmac.setAttribute("type", "hidden");
				hmac.setAttribute("id", "transkey_HM_"+inputObj.id+frmId);
				hmac.setAttribute("name", "transkey_HM_"+inputObj.id+frmId);
				hmac.setAttribute("value", "");
				obj.appendChild(hmac);
			} else {
				hmac.setAttribute("value", "");
			}

			if(ExE2E!=null){
				var e2e = document.getElementById("transkey_ExE2E_"+inputObj.id+frmId);
				if(e2e==null){
					e2e = document.createElement("input");
					e2e.setAttribute("type", "hidden");
					e2e.setAttribute("id", "transkey_ExE2E_"+inputObj.id+frmId);
					e2e.setAttribute("name", "transkey_ExE2E_"+inputObj.id+frmId);
					e2e.setAttribute("value", ExE2E);
					obj.appendChild(e2e);
				} else {
					e2e.setAttribute("value", ExE2E);
				}
			}

		 }catch(e){
			 tk_alert("[transkey error] setHiddenField : "+ e);
		 }
	};
	
	this.getText = function(encrypted){
		var request = new XMLHttpRequest();
		
		if(!useSession)
			var seedKey = document.getElementById("seedKey"+this.now.frmId).value;
		
		if(transkey_apiuse)
			request.open("POST", transkey_apiurl+"service/letter", useAsyncTranskey);
		else
			request.open("POST", transkey_surl, useAsyncTranskey);
		
		
		if(useCORS)
			request.withCredentials = true;
		else
			request.setRequestHeader("Cache-Control", "no-cache");

		request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		
		request.onreadystatechange = function(){
			if (request.readyState == 4 && request.status == 200) {
				if(request.responseText.indexOf("SessionError")>-1){
					var errCodes = request.responseText.split("=");
					if(errCodes[1]=="1"){
						tk_alert("세션이 만료되었습니다.");
						tk.now.clear();
						if(transkey_apiuse){
							tk.resetToken(transkey_apiurl);
							tk.resetSessionKey(transkey_apiurl);
						}else{
							tk.resetToken(transkey_surl);
							tk.resetSessionKey(transkey_surl);	
						}
						if(!useSession&&limitTime>0)
							tk.now.getInitTime();
//						tk.now.allocation();
						if(useSession)
							tk.now.setUrl();
						else
							tk.now.setKeyIndex(tk.now.inputObj);
					}
				} else if(request.responseText.indexOf("LimitTimeOver")>-1){
					tk_alert("시간이 만료되었습니다.");
					tk.now.clear();
					if(transkey_apiuse){
						tk.resetToken(transkey_apiurl);
						tk.resetSessionKey(transkey_apiurl);
					}else{
						tk.resetToken(transkey_surl);
						tk.resetSessionKey(transkey_surl);	
					}
					if(!useSession&&limitTime>0)
						tk.now.getInitTime();
//					tk.now.allocation();
					if(useSession)
						tk.now.setUrl();
					else
						tk.now.setKeyIndex(tk.now.inputObj);
				} else if(request.responseText.indexOf("Integrity verification failed")>-1){
					tk_alert("데이터 무결성 검증에 실패하였습니다.");
					tk.now.clear();
					if(transkey_apiuse){
						tk.resetToken(transkey_apiurl);
						tk.resetSessionKey(transkey_apiurl);
					}else{
						tk.resetToken(transkey_surl);
						tk.resetSessionKey(transkey_surl);	
					}
					if(!useSession&&limitTime>0)
						tk.now.getInitTime();
//					tk.now.allocation();
					if(useSession)
						tk.now.setUrl();
					else
						tk.now.setKeyIndex(tk.now.inputObj);
				} else {
					tk.now.inputObj.value = tk.now.inputObj.value + request.responseText;
					tk.now.hidden.value += transkey_delimiter + encrypted;
					if(tk.now.isMultiMode){
						tk.now.blankOverDiv.focus();
					}
					if(tk.now.inputObj.maxLength>0){
						if (tk.now.inputObj.value.length >= tk.now.inputObj.maxLength) {
							tk.close();
							return;
						}
					}
				}
				
			}
		}
		
		try {
			if(transkey_apiuse){
				if(!useSession){
					request.send("name="+this.now.id+"&value=" +encrypted+"&keyIndex=" +this.now.keyIndex+"&fieldType=" +this.now.fieldType+"&keyboardType=" +this.now.keyboard+"&encSeedKey="+seedKey+"&initTime="+initTime+ tk_origin);
				}else{
					request.send("transkeyUuid="+this.transkeyUuid+"&name="+this.now.id+"&value=" +encrypted+"&TK_requestToken="+TK_requestToken+tk_origin);
				}
			}else{
				if(!useSession) {
					request.send("op=letter&name="+this.now.id+"&value=" +encrypted+"&keyIndex=" +this.now.keyIndex+"&fieldType=" +this.now.fieldType+"&keyboardType=" +this.now.keyboard+"&encSeedKey="+seedKey+"&initTime="+initTime+ tk_origin);
				}
				else{
					request.send("op=letter&transkeyUuid="+this.transkeyUuid+"&name="+this.now.id+"&value=" +encrypted+"&TK_requestToken="+TK_requestToken+tk_origin);	
				}
			}
		} catch(e) {
			tk_alert("[transkey Error] : Cannot load TransKey. Network is not available.");
			return false;
		}
	};
	
	
    function getRandomValue(range) {
    	return new GenKey().tk_getrnd_int() % range;
    }
	
	this.setQwertyLayout = function(id, div, isMultiCursor, _cssName){
		qwertyLayout_noinline(id, div, isMultiCursor, _cssName);
	};
	
	this.setNumberLayout = function(id, div, isMultiCursor, _cssName){
		numberLayout_noinline(id, div, isMultiCursor, _cssName);
	};
	
	this.getKey = function(x, y, type) {
		var keys = mKey[type];
		for ( var i = 0; i < keys.length; i++) {
			if (keys[i].contains(x, y)) {
				return keys[i];
			}
		}
		return null;
	};
	
	this.getKeyByIndex = function(index, type){
		return mKey[type][index];		
	};
	
	this.checkCSS = function() {
		var check_result;
	    var ss = document.styleSheets;
	    for (var i = 0, max = ss.length; i < max; i++) {
	        if (ss[i].href == (window.location.origin + transkey_url+"/transkey.css"))
	        	check_result = true;
	    }
	    
		if(typeof(document.querySelector) != "undefined") {
			var element = document.querySelector('.transkey_divLayout');
			if(typeof(getComputedStyle) != "undefined") {
				var style = getComputedStyle(element);
				if(style == null) {
		        	check_result = false;
				} else if (style.zIndex != 1008) {
		        	check_result = false;
				} else {
		        	check_result = true;
				}
			} else {
				return;
			}
		} else {
			return;
		}
		
	    if(!check_result) {
	    	tk_alert("css를 load하는데 실패했습니다");
	    	//try reload css
//		    var link = document.createElement("link");
//		    link.rel = "stylesheet";
//		    link.href = "/transkey_mobile/transkey.css"
//		    document.getElementsByTagName("head")[0].appendChild(link);
	    }
		
	
		
	};
	
	this.checkKeyVer = function() {
		if(typeof qwertyHash == "undefined" || typeof numberHash == "undefined") {
			tk_alert("[transkey Error] : Keyboard version check fail.");
		} else {
			if(setQwertyHash != qwertyHash)
				tk_alert("[transkey Error] : Qwerty Keyboard version check fail.");
			if(setNumberHash != numberHash)
				tk_alert("[transkey Error] : Number Keyboard version check fail.");
		}
	};
	
	function createTranskeyMap(id, keyboardType){
		
		var keyboard = document.getElementById(id).getAttribute("data-tk-keyboard");
		if(keyboard==null){
			keyboard = keyboardType;
		}

		var keyArray = mKey[keyboard];

		var map = document.createElement('map');
		map.id = "tk_map_"+id;
		map.name = "tk_map_"+id;
		map.className = "transkey_map";

		for (var i = 0; i < keyArray.length; i++) {
			(function(index) {
				var key = keyArray[index];
				var coords = "";
				for (var k = 0; k < key.npoints; k++) {
					coords += key.xpoints[k] + "," + key.ypoints[k] + ",";
				}
				coords = coords.substring(0, coords.length - 1);
				var area = document.createElement('area');
				area.className = 'transkey_area';
				area.shape = 'poly';
				area.alt = '';
				area.coords = coords;

				area.onmousedown = function(event) {
					tk.start(event, index);
				};

				map.appendChild(area);
			})(i);
		}

		return map;
	}
	
	function offsetPoint() {
		this.x = 0;
		this.y = 0;
	}

	function getOffsetPoint(Element) {

        var point = new offsetPoint();

        point.x = 0;
        point.y = 0;

        var is_sibling = Element.getAttribute("data-tk-nextSibling")
        if(is_sibling == undefined || is_sibling == false) {        
	        while (Element) {
	            point.x += Element.offsetLeft;
	            point.y += Element.offsetTop;
	
	            Element = Element.offsetParent;
	
	            if(Element==null)
	                break;
	        }
        } else {
            point.x = Element.offsetLeft;
            point.y = Element.offsetTop;
        }

        return point;
	}
	
	function SeedEnc(geo) {
		var iv = [0x4d, 0x6f, 0x62, 0x69, 0x6c, 0x65, 0x54, 0x72, 0x61, 0x6e, 0x73, 0x4b, 0x65, 0x79, 0x31, 0x30];
		var tsize = 64;
		var inData = new Array(tsize);		
		var outData = new Array(tsize);
		var roundKey = new Array(32);
		var i = 0; 
	  
		for(i=0; i<geo.length; i++)
		{			
			if(geo.charAt(i) == "l" || geo.charAt(i) == "u" || geo.charAt(i) == "d")
			{
				inData[i] = Number(geo.charCodeAt(i));
				continue;
			}
			else if(geo.charAt(i) == " ")
			{ 
				inData[i] = Number(geo.charCodeAt(i));
				continue;
			}
			inData[i] = Number(geo.charAt(i).toString(16));
		}
		
		if(!useSession&&limitTime>0) {
			inData[i++] = 32;
			for(var k = 0 ; k<initTime.length; k++)
			{
				if(initTime.charAt(k) == "-")
					inData[i++] = Number(initTime.charCodeAt(k));
				else
					inData[i++] = initTime[k];
			}
		}
				
		inData[i++] = 32;
		inData[i++] = 101;
		
		for( ;i <tsize; i++){
			var rndInt = genKey.tk_getrnd_int();		
			inData[i] = rndInt % 100;
		}
		 
		Seed.SeedSetKey(roundKey, sessionKey);	
		Seed.SeedEncryptCbc(roundKey, iv, inData, tsize, outData);
		
		var encodedData = new Array(tsize);
		var encodedDataString = "";
	
		for(var k=0; k<tsize; k++)
		{
			if(transkey_encDelimiter == null)
				encodedData[k] = Number(outData[k]).toString(16);
			else
				encodedDataString += Number(outData[k]).toString(16)+transkey_encDelimiter;
		}
			
		if(transkey_encDelimiter == null)
			return encodedData;
		else
			return encodedDataString.substring(0, encodedDataString.length-1);
	}
	
	function Key() {
		this.name = "";
		this.npoints = 0;
		this.xpoints = new Array();
		this.ypoints = new Array();
		this.addPoint = function(x, y) {
			this.npoints++;
			this.xpoints.push(x);
			this.ypoints.push(y);
		};

		this.contains = function(x, y) {
			var hits = 0;
			var lastx = this.xpoints[this.npoints - 1];
			var lasty = this.ypoints[this.npoints - 1];
			var curx = 0;
			var cury = 0;
			for ( var i = 0; i < this.npoints; lastx = curx, lasty = cury, i++) {
				curx = this.xpoints[i];
				cury = this.ypoints[i];
				if (cury == lasty) {
					continue;
				}
				var leftx = 0;
				if (curx < lastx) {
					if (x >= lastx) {
						continue;
					}
					leftx = curx;
				} else {
					if (x >= curx) {
						continue;
					}
					leftx = lastx;
				}

				var test1 = 0;
				var test2 = 0;
				if (cury < lasty) {
					if (y < cury || y >= lasty) {
						continue;
					}
					if (x < leftx) {
						hits++;
						continue;
					}
					test1 = x - curx;
					test2 = y - cury;
				} else {
					if (y < lasty || y >= cury) {
						continue;
					}
					if (x < leftx) {
						hits++;
						continue;
					}
					test1 = x - lastx;
					test2 = y - lasty;
				}
				if (test1 < (test2 / (lasty - cury) * (lastx - curx))) {
					hits++;
				}
			}
			return ((hits & 1) != 0);
		};
	}

	function qwertyLayout_noinline(id, parentDiv, isMultiCursor, _cssName){
		
		var mainDiv = createDiv(id + '_mainDiv',  'transkey_' + _cssName + 'qwertyMainDiv');
		
		
		var vk_alt = "가상키보드입니다";
		if(userAgent.indexOf("MSIE 7"))
			vk_alt = "";

		var exitVal = useSpace?61:60;
		var lEnterVal = useSpace?60:59;
		var rEnterVal = useSpace?59:58;
		
		
		if(useTalkBack) {
			var innerDiv1 = document.createElement("div");
			innerDiv1.style.cssText = "width:560px; height: 28px; margin-left:10px; margin-top:2px;";
			
			var innerDiv2 = createDiv(id + "_dragDiv", "transkey_" + _cssName + "qwertyDragDiv");
			innerDiv2.setAttribute('tabIndex', 0);

			if(transkey_isDraggable){

			}else{
				innerDiv2.style.cursor = "default";
			}
			innerDiv1.appendChild(innerDiv2);
			
			var innerDiv3 = createDiv(id+"_loop_first");
			innerDiv3.setAttribute('role', 'button');
			innerDiv3.setAttribute('tabIndex', 0);
			innerDiv1.appendChild(innerDiv3);
			
			var a = createA("tk_close", null, "닫기");
			a.style.cssText = "position: absolute; width: 30px; height: 30px; left:545px; font-size:0;";
			innerDiv1.appendChild(a);
			
			mainDiv.appendChild(innerDiv1);
			
			var firstLineDiv = createDiv(null, "transkey_"+_cssName+"div_2");
			for(var i=0; i< 14; i++){
				var keyA = "";
				if(i != 13){
					keyA = createA(null,"transkey_"+_cssName+"div_2_2", "키버튼" );
				} else {
					keyA = createA("tk_del","transkey_"+_cssName+"div_2_2", "키버튼" );
				}
				firstLineDiv.appendChild(keyA);
			}
			mainDiv.appendChild(firstLineDiv);
			
			var secondLineDiv = createDiv(null, "transkey_"+_cssName+"div_2");
			for(var i=0; i< 12; i++){
				var keyA = "";
				if(i == 5){
					keyA = createA(null,"transkey_"+_cssName+"div_2_3", "키버튼" );
				} else {
					keyA= createA(null,"transkey_"+_cssName+"div_2_2", "키버튼" );
				}

				secondLineDiv.appendChild(keyA);
			}
			mainDiv.appendChild(secondLineDiv);
			
			var thirdLineDiv = createDiv(null, "transkey_"+_cssName+"div_2");
			for(var i=0; i< 10; i++){
				var keyA = "";
				if(i == 0){
					keyA = createA(null,"transkey_"+_cssName+"div_2_2_2", "키버튼" );
					keyA.style.marginLeft = "40px";
				} else if(i == 4) {
					keyA = createA(null,"transkey_"+_cssName+"div_2_3", "키버튼" );
				} else if(i == 9) {
					keyA = createA(null,"transkey_"+_cssName+"div_2_2_2", "키버튼" );
				} else {
					keyA = createA(null,"transkey_"+_cssName+"div_2_2", "키버튼" );
				}

				thirdLineDiv.appendChild(keyA);
			}
			mainDiv.appendChild(thirdLineDiv);
			
			var fourthLineDiv = createDiv(null, "transkey_"+_cssName+"div_2");
			for(var i=0; i< 12; i++){
				var keyA = "";
				if(i == 0){
					keyA = createA("tk_enter_l","transkey_q_l_enterKey", "키버튼" );
				} else if(i == 1) {
					keyA = createA(null,"transkey_"+_cssName+"div_2_2", "키버튼" );
					keyA.style.cssText = "margin-left:80px;";
				} else if(i == 11) {
					keyA = createA("tk_enter_r","transkey_q_r_enterKey", "키버튼" );
				} else {
					keyA = createA(null,"transkey_"+_cssName+"div_2_2", "키버튼" );
				}

				fourthLineDiv.appendChild(keyA);
			}
			mainDiv.appendChild(fourthLineDiv);

			var fifthLineDiv = createDiv(null, "transkey_"+_cssName+"div_2");
			if(useSpace) {
				for(var i=0; i< 13; i++){
					var keyA = "";
					if(i == 0){
						keyA = createA("tk_cp_l","transkey_"+_cssName+"div_2_2", "키버튼" );
					} else if(i == 6) {
						keyA = createA(null,"transkey_"+_cssName+"div_2_4", "키버튼" );
					} else if(i == 12) {
						keyA = createA("tk_cp_r","transkey_"+_cssName+"div_2_2", "키버튼" );
					} else {
						keyA = createA(null,"transkey_"+_cssName+"div_2_2", "키버튼" );
					}
	
					fifthLineDiv.appendChild(keyA);
				}
			}else {
				for(var i=0; i< 12; i++){
					var keyA = "";
					if(i == 0){
						keyA = createA("tk_cp_l","transkey_"+_cssName+"div_2_4", "키버튼" );
					} else if(i == 11) {
						keyA = createA("tk_cp_r","transkey_"+_cssName+"div_2_4", "키버튼" );
					} else {
						keyA = createA(null,"transkey_"+_cssName+"div_2_2", "키버튼" );
					}
	
					fifthLineDiv.appendChild(keyA);
				}
			}
			
			if(!isMultiCursor) {
				var loop = createDiv(id+"_loop_last", null);
				loop.setAttribute('role', 'button');
				loop.setAttribute('tabindex', 0);
				fifthLineDiv.appendChild(loop);
			}
			mainDiv.appendChild(fifthLineDiv);
			
			parentDiv.appendChild(mainDiv);

		} else {
			if(!tk.isMSIE6) {
				var a = createA(null, null, null);
				a.style.cssText = "width:1px; height:1px; position:absolute;";
				var img = document.createElement('img');
				img.alt = vk_alt;
				img.src = transkey_url + '/images/back.png';
				img.style.cssText = "width:1px;height:1px;";

				a.appendChild(img);
				mainDiv.appendChild(a);
				
				var img = document.createElement('img');
				img.id = id + "_imgTwin";
				img.alt = vk_alt;
				img.src = transkey_url + '/images/back.png';
				img.style.cssText = "width:100%;height:100%;";

				if(tk.isMobile){
					img.setAttribute("usemap", "#tk_map_"+id);
				}
				mainDiv.appendChild(img);
				
				parentDiv.appendChild(mainDiv);
				
				var dragDiv = createDiv(id+"_dragDiv", "transkey_"+_cssName+"qwertyDragDiv");
				if(!transkey_isDraggable) {
					dragDiv.style.cursor = "default";
				}
				
				if(!tk.isMSIE6) {
					var backPNGImg = document.createElement("img");
					backPNGImg.alt = "";
					backPNGImg.src = transkey_url + "/images/back.png";
					backPNGImg.style.cssText = "width:100%;height:100%;";
					
					dragDiv.appendChild(backPNGImg);
				}
				
				parentDiv.appendChild(dragDiv);
			}
		}
		
		var upperDiv = createDiv(id+"_layoutUpper", "transkey_"+_cssName+"upper");
		if(tk.isMobile) {
			var map = createTranskeyMap(id, "qwerty");
			upperDiv.appendChild(map);
		}
		parentDiv.appendChild(upperDiv);
		
		var lowerDiv = createDiv(id+"_layoutLower", "transkey_"+_cssName+"lower");
		if(tk.isMobile) {
			var map = createTranskeyMap(id, "qwerty");
			lowerDiv.appendChild(map);
		}
		parentDiv.appendChild(lowerDiv);
		
		if(useSpace) {
			var spaceKeyDiv = createImgDiv(id+"q_p_space", "transkey_"+_cssName+"q_p_spacekey", null, "스페이스바",  '/images/q_p_space.png');
			parentDiv.appendChild(spaceKeyDiv);
		}
		
		var imgDiv1 = createImgDiv(id+"_pKey", "transkey_"+_cssName+"pKey", null, "버튼 배경",  '/images/p_key.png');
		var imgDiv2 = createImgDiv(id+"q_p_backKey", "transkey_"+_cssName+"pKey", null, "삭제",  '/images/q_p_backkey.png');
		var imgDiv3 = createImgDiv(id+"q_p_shiftkey_sp", "transkey_"+_cssName+"pKey", null, "쉬프트",  '/images/q_p_shiftkey_sp.png');
		var imgDiv4 = createImgDiv(id+"q_p_enterKey_L", "transkey_"+_cssName+"q_p_enterKey", null, "왼쪽 엔터",  '/images/q_p_enterkey_l.png');
		var imgDiv5 = createImgDiv(id+"q_p_enterKey_R", "transkey_"+_cssName+"q_p_enterKey", null, "오른쪽 엔터",  '/images/q_p_enterkey_r.png');
		var imgDiv6 = createImgDiv(id+"q_p_shiftKey_L", "transkey_"+_cssName+"q_p_shiftKey", null, "왼쪽 쉬프트",  '/images/q_p_shiftkey_l.png');
		var imgDiv7 = createImgDiv(id+"q_p_shiftKey_R", "transkey_"+_cssName+"q_p_shiftKey", null, "오른쪽 쉬프트",  '/images/q_p_shiftkey_r.png');
		parentDiv.appendChild(imgDiv1);
		parentDiv.appendChild(imgDiv2);
		parentDiv.appendChild(imgDiv3);
		parentDiv.appendChild(imgDiv4);
		parentDiv.appendChild(imgDiv5);
		parentDiv.appendChild(imgDiv6);
		parentDiv.appendChild(imgDiv7);
		
		if(showLicense&&tk.licenseType!=""){
			var licenseTypeDiv = createDiv(id+"q_licenseType", "transkey_"+_cssName +"q_licenseType");
			licenseTypeDiv.style.cssText = "font-size: 0.8em; color : red;";
			licenseTypeDiv.textContent = tk.licenseType + " (" + tk.licExpiredDate + ")";
			
			parentDiv.appendChild(licenseTypeDiv);
		}
		
		if(isMultiCursor) {
			var fakeMouseDiv = createImgDiv(id+"_fakeMouseDiv", "transkey_fakeMouse", "fakeMouseImg", "멀티마우스 커서",  "/images/fake.gif");
			var onMousDiv = createImgDiv(id+"_osMouseDiv", "transkey_osMouse", "osMouseImg", "멀티마우스 커서",  "/images/fake.gif");
			
			parentDiv.appendChild(fakeMouseDiv);
			parentDiv.appendChild(onMousDiv);
			
			if(useTalkBack) {
				var btn = document.createElement("button");
				btn.id = id+"_blankOverDiv";
				btn.className = "transkey_"+_cssName+"qwertyBlankOver";
				btn.setAttribute("tabindex",0);
				var blankOverImg = createImg(id+"_blankOverImg", "마우스를 가운데로 이동 또는 클릭해주세요.", "/images/"+_cssName+"blank_over.gif");
				blankOverImg.ariaLabel = "마우스를 가운데로 이동 또는 클릭해주세요.";
				btn.appendChild(blankOverImg);
				parentDiv.appendChild(btn);
				
				btn = document.createElement("button");
				btn.id = id+"_singleMouseTypeDiv";
				btn.className = "transkey_"+_cssName+"qwertySingleMouseType";
				btn.setAttribute("tabindex",0);
				var singleMouseImg = createImg(id+"_slngleMouseTypeImg", "클릭하시면 다시 기본마우스로 전환됩니다.", "/images/"+_cssName+"single.png");
				btn.appendChild(singleMouseImg);
				parentDiv.appendChild(btn);

				btn = document.createElement("button");
				btn.id = id+"_multiMouseTypeDiv";
				btn.className = "transkey_"+_cssName+"qwertyMultiMouseType";
				btn.setAttribute("tabindex",0);
				var multiMouseImg = createImg(id+"_multiMouseTypeImg", "멀티마우스를 사용합니다. 사용하시려면 키보드 클릭 후 마우스를 가운데로 이동 또는 클릭해주세요.", "/images/"+_cssName+"multi.png");
				btn.appendChild(multiMouseImg);
				parentDiv.appendChild(btn);
				
				var loopLastDiv = createDiv(id+"_loop_last", null);
				loopLastDiv.setAttribute('role', 'button');
				loopLastDiv.setAttribute('tabindex', 0);
				parentDiv.appendChild(loopLastDiv);
			} else {
				var singleMouseTypeDiv = createImgDiv(id+"_singleMouseTypeDiv", "transkey_"+_cssName+"qwertySingleMouseType", id+"_slngleMouseTypeImg", "멀티마우스를 해제합니다.",  "/images/"+_cssName+"single.png");
				var blankOverDiv = createImgDiv(id+"_blankOverDiv", "transkey_"+_cssName+"qwertyBlankOver", id+"_blankOverImg", null,  "/images/"+_cssName+"blank_over.gif");
				var multiMouseTypeDiv = createImgDiv(id+"_multiMouseTypeDiv", "transkey_"+_cssName+"qwertyMultiMouseType", id+"_multiMouseTypeImg",null,  "/images/"+_cssName+"multi.png");
				parentDiv.appendChild(singleMouseTypeDiv);
				parentDiv.appendChild(blankOverDiv);
				parentDiv.appendChild(multiMouseTypeDiv);
			}
		}
		
		var blankDiv = createImgDiv(id+"_blankDiv", "transkey_"+_cssName+"qwertyBlank", id+"_blankImg", "로고",  "/images/"+_cssName+"blank.png");
		parentDiv.appendChild(blankDiv);
		
	}
	
	function numberLayout_noinline(id, parentDiv, isMultiCursor, _cssName){
		var useMap='';
		if(tk.isMobile){
			useMap="#tk_map_"+id;
		}	
			
		var mainDiv = createDiv(id + '_mainDiv',  'transkey_' + _cssName + 'numberMainDiv');
		
		var vk_alt = "가상키보드입니다";
		if(userAgent.indexOf("MSIE 7"))
			vk_alt = "";
		
		if(useTalkBack) {
			var div = document.createElement("div");
			div.style.cssText = "width:240px; height: 24px; margin-left:4px;";
			mainDiv.appendChild(div);
			
			var dragDiv = createDiv(id+"_dragDiv", "transkey_"+_cssName+"numberDragDiv");
			dragDiv.setAttribute('role', 'button');
			dragDiv.setAttribute('tabindex', 0);
			if(!transkey_isDraggable) {
				dragDiv.style.cursor="default";
			}
			div.appendChild(dragDiv);
			
			var loopDiv = createDiv(id+"_loop_first", null);
			loopDiv.setAttribute('role', 'button');
			loopDiv.setAttribute('tabindex', 0);
			div.appendChild(loopDiv);
			
			var closeA = createA("tk_close", null, "닫기");
			closeA.style.cssText = "position: absolute; width: 25px; height: 25px; left:220px; font-size:0;";
			div.appendChild(closeA);
			
			var div1 =  createDiv(null, "transkey_"+_cssName+"div_3");
			div1.style.cssText = "height:160px; left:4px;";
			var enterLA = createA("tk_enter_l", "transkey_"+_cssName+"div_3_4", "키버튼");
			var delA = createA("tk_del", "transkey_"+_cssName+"div_3_4", "키버튼");
			div1.appendChild(enterLA);
			div1.appendChild(delA);
			mainDiv.appendChild(div1);
			
			var div2 =  createDiv(null, "transkey_"+_cssName+"div_3");
			div2.style.cssText = "height:160px; left:204px;";
			var enterRA = createA("tk_enter_r", "transkey_"+_cssName+"div_3_4", "키버튼");
			var delA = createA("tk_del", "transkey_"+_cssName+"div_3_4", "키버튼");
			div2.appendChild(enterRA);
			div2.appendChild(delA);
			mainDiv.appendChild(div2);
			
			var div3 =  createDiv(null, "transkey_"+_cssName+"div_3");
			div3.style.cssText = "height: 80px; left:124px;";
			var aBtn = createA(null, "transkey_"+_cssName+"div_3_2", "키버튼");
			div3.appendChild(aBtn);
			mainDiv.appendChild(div3);
			
			var div4 =  createDiv(null, "transkey_"+_cssName+"div_3");
			div4.style.cssText = "height:160px; left:164px;";

			for(var i=0;i<4; i++){
				var aBtn = createA(null, "transkey_"+_cssName+"div_3_2", "키버튼");
				div4.appendChild(aBtn);
			}
			mainDiv.appendChild(div4);
			
			var div5 =  createDiv(null, "transkey_"+_cssName+"div_3");
			div5.style.cssText = "height: 80px; left:124px; top:104px;";
			var aBtn = createA(null, "transkey_"+_cssName+"div_3_3", "키버튼");
			aBtn.style.cssText = "bottom:0px";
			div5.appendChild(aBtn);
			mainDiv.appendChild(div5);
			
			var div6 =  createDiv(null, "transkey_"+_cssName+"div_3");
			div6.style.cssText = "height: 80px; left:84px; top:104px;";
			aBtn = createA(null, "transkey_"+_cssName+"div_3_3", "키버튼");
			aBtn.style.cssText = "bottom:0px";
			div6.appendChild(aBtn);
			mainDiv.appendChild(div6);
			
			var div7 =  createDiv(null, "transkey_"+_cssName+"div_3");
			div7.style.cssText = "height:160px; left:44px;";

			var bottom = 0;
			for(var i=0;i<4; i++){
				var aBtn = createA(null, "transkey_"+_cssName+"div_3_3", "키버튼");
				aBtn.style.bottom = bottom + "px";
				div7.appendChild(aBtn);
				bottom += 40;
			}
			mainDiv.appendChild(div7);
			
			var div8 =  createDiv(null, "transkey_"+_cssName+"div_3");
			div8.style.cssText = "height: 80px; left:84px;";
			aBtn = createA(null, "transkey_"+_cssName+"div_3_2", "키버튼");
			div8.appendChild(aBtn);
			
			if(!isMultiCursor) {
				var loopLastDiv = createDiv(id+"_loop_last", null);
				loopLastDiv.setAttribute('role', 'button');
				loopLastDiv.setAttribute('tabIndex', 0);
				div8.appendChild(loopLastDiv);
			}
			mainDiv.appendChild(div8);
			
			parentDiv.appendChild(mainDiv);
		} else {
			if(!tk.isMSIE6) {
				var imgA = document.createElement("a");
				if(useCSP) {
					imgA.href="#none";					
				} else {
					imgA.hrdf="javascript:;"
				}
				imgA.style.cssText = "width:1px; height:1px; position:absolute;";
				
				var backImg = createImg(null, vk_alt, "/images/back.png");
				backImg.style.cssText = "width:1px;height:1px;";
				imgA.appendChild(backImg);
				mainDiv.appendChild(imgA);
				
				var backImg2 = createImg(id+"_imgSingle", vk_alt, "/images/back.png");
				backImg2.style.cssText = "width:100%;height:100%;";
				backImg2.setAttribute("usemap", useMap);
				mainDiv.appendChild(backImg2);
			}
			
			parentDiv.appendChild(mainDiv);
			
			var numberDragDiv = createDiv(id+"_dragDiv", "transkey_"+_cssName+"numberDragDiv");
			var backPNG = createImg(null, "", "/images/back.png");
			backPNG.style.cssText = "width:100%;height:100%;";	
			if(transkey_isDraggable){
				if(!tk.isMSIE6) numberDragDiv.appendChild(backPNG);
			}else{
				numberDragDiv.style.cursor = "default";
				if(!tk.isMSIE6) numberDragDiv.appendChild(backPNG);
			}
			parentDiv.appendChild(numberDragDiv);
			
		}
		
		var layoutSingleDiv = createDiv(id+"_layoutSingle", "transkey_"+_cssName+"single");
		if(tk.isMobile){
			var map = createTranskeyMapByAppend(id, "number");
			layoutSingleDiv.appendChild(map);
		}
		parentDiv.appendChild(layoutSingleDiv);
		
		
		var pKeyDiv = createImgDiv(id+"_pKey", "transkey_"+_cssName+"pKey", null, "버튼 배경", "/images/p_key.png");
		parentDiv.appendChild(pKeyDiv);

		var enterLDiv = createImgDiv(id+"n_p_enterKey_L", "transkey_"+_cssName+"n_p_enterKey", null, "왼쪽 엔터", "/images/n_p_enterkey_l.png");
		parentDiv.appendChild(enterLDiv);

		var enterRDiv = createImgDiv(id+"n_p_enterKey_R", "transkey_"+_cssName+"n_p_enterKey", null, "오른쪽 엔터", "/images/n_p_enterkey_r.png");
		parentDiv.appendChild(enterRDiv);

		var backLDiv = createImgDiv(id+"n_p_backKey_L", "transkey_"+_cssName+"n_p_backKey", null, "삭제", "/images/n_p_backkey_l.png");
		parentDiv.appendChild(backLDiv);

		var backRDiv = createImgDiv(id+"n_p_backKey_R", "transkey_"+_cssName+"n_p_backKey", null, "삭제", "/images/n_p_backkey_r.png");
		parentDiv.appendChild(backRDiv);
		
		if(showLicense&&tk.licenseType!=""){
			var licenseTypeDiv = createDiv(id+"n_licenseType", "transkey_"+_cssName +"n_licenseType");
			licenseTypeDiv.style.cssText = "font-size: 0.8em; color : red;";
			licenseTypeDiv.textContent = tk.licenseType + " (" + tk.licExpiredDate + ")";
			parentDiv.appendChild(licenseTypeDiv);
		}
		
		if(isMultiCursor) {
			var fakeMouseDiv = createDiv(id+"_fakeMouseDiv", "transkey_fakeMouse");
			var fakeImg = createImg("fakeMouseImg", "멀티마우스 커서",  "/images/fake.gif");
			fakeMouseDiv.appendChild(fakeImg);
			parentDiv.appendChild(fakeMouseDiv);

			var osMouseDiv = createDiv(id+"_osMouseDiv", "transkey_osMouse");
			var osImg = createImg("osMouseImg", "멀티마우스 커서",  "/images/fake.gif");
			osMouseDiv.appendChild(osImg);
			parentDiv.appendChild(osMouseDiv);
			
			if(useTalkBack) {
				var btn = document.createElement("button");
				btn.id = id+"_blankOverDiv";
				btn.className = "transkey_"+_cssName+"numberBlankOver";
				btn.setAttribute("tabindex",0);
				var blankOverImg = createImg(id+"_blankOverImg", "마우스를 가운데로 이동 또는 클릭해주세요.", "/images/"+_cssName+"blank_over.gif");
				blankOverImg.ariaLabel = "마우스를 가운데로 이동 또는 클릭해주세요.";
				btn.appendChild(blankOverImg);
				parentDiv.appendChild(btn);

				btn = document.createElement("button");
				btn.id = id+"_singleMouseTypeDiv";
				btn.className = "transkey_"+_cssName+"numberSingleMouseType";
				btn.setAttribute("tabindex",0);
				var singleMouseImg = createImg(id+"_slngleMouseTypeImg", "멀티마우스를 해제합니다.", "/images/"+_cssName+"single_s.png");
				singleMouseImg.ariaLabel = "클릭하시면 다시 기본마우스로 전환됩니다.";
				btn.appendChild(singleMouseImg);
				parentDiv.appendChild(btn);

				btn = document.createElement("button");
				btn.id = id+"_multiMouseTypeDiv";
				btn.className = "transkey_"+_cssName+"numberMultiMouseType";
				btn.setAttribute("tabindex",0);
				var multiMouseImg = createImg(id+"_multiMouseTypeImg", "멀티마우스를 사용합니다. 사용하시려면 키보드 클릭 후 마우스를 가운데로 이동 또는 클릭해주세요.", "/images/"+_cssName+"multi_s.png");
				btn.appendChild(multiMouseImg);
				parentDiv.appendChild(btn);

				var loopLastDiv = createDiv(id+"_loop_last", null);
				loopLastDiv.setAttribute('role', 'button');
				loopLastDiv.setAttribute('tabindex', 0);
				parentDiv.appendChild(loopLastDiv);
				
			} else {
				var singleMouseDiv = createDiv(id+"_singleMouseTypeDiv", "transkey_"+_cssName+"numberSingleMouseType");
				var singleMouseImg = createImg(id+"_slngleMouseTypeImg", "멀티마우스를 해제합니다.", "/images/"+_cssName+"single_s.png");
				singleMouseDiv.appendChild(singleMouseImg);
				parentDiv.appendChild(singleMouseDiv);

				var blankOverDiv = createDiv(id+"_blankOverDiv", "transkey_"+_cssName+"numberBlankOver");
				var blankOverImg = createImg(id+"_blankOverImg", null, "/images/"+_cssName+"blank_over.gif");
				blankOverDiv.appendChild(blankOverImg);
				parentDiv.appendChild(blankOverDiv);

				var multiMouseTypeDiv = createDiv(id+"_multiMouseTypeDiv", "transkey_"+_cssName+"numberMultiMouseType");
				var multiMouseTypeImg = createImg(id+"_multiMouseTypeImg", null, "/images/"+_cssName+"multi_s.png");
				multiMouseTypeDiv.appendChild(multiMouseTypeImg);
				parentDiv.appendChild(multiMouseTypeDiv);
			}
		}
		
		var blankDiv = createDiv(id+"_blankDiv", "transkey_"+_cssName+"numberBlank");
		var blankImg = createImg(id+"_blankImg", "로고", "/images/"+_cssName+"blank.png");
		blankDiv.appendChild(blankImg);
		parentDiv.appendChild(blankDiv);
	}
	
	
	function pack(source)
	{
	   var temp = "";
	   for (var i = 0; i < source.length; i+=2)
	   {
	      temp+= String.fromCharCode(parseInt(source.substring(i, i + 2), 16));
	   }
	   return temp;
	}

	function char2hex(source)
	{
	   var hex = "";
	   for (var i = 0; i < source.length; i+=1)
	   {
	      var temp = source[i].toString(16);
	      switch (temp.length)
	      {
	         case 1:
	            temp = "0" + temp;
	            break;
	         case 0:
	           temp = "00";
	      }
	      hex+= temp;
	   }
	   return hex;
	}

	function xor(a, b)
	{
	   var length = Math.min(a.length, b.length);
	   var temp = "";
	   for (var i = 0; i < length; i++)
	   {
	      temp+= String.fromCharCode(a.charCodeAt(i) ^ b.charCodeAt(i));
	   }
	   length = Math.max(a.length, b.length) - length;
	   for (var i = 0; i < length; i++)
	   {
	      temp+= "\x00";
	   }
	   return temp;
	}

	function mgf1(mgfSeed, maskLen, biz)
	{
	   var t = "";
	   var digest_s2 = useSha2;
	   if(biz != undefined) {
		   digest_s2 = biz;
	   }
	   
	   if(digest_s2) {
	      var hLen = 32;
	   } else {
	      var hLen = 20;
	   }
	   var count = Math.ceil(maskLen / hLen);
	   for (var i = 0; i < count; i++)
	   {
	      var c = String.fromCharCode((i >> 24) & 0xFF, (i >> 16) & 0xFF, (i >> 8) & 0xFF, i & 0xFF);
	      if(digest_s2) {
			t+= pack(sha2Hash(mgfSeed + c));
		  } else {
	         t+= pack(sha1Hash(mgfSeed + c));
		  }
	   }

	   return t.substring(0, maskLen);
	}
	
	function xorb(a, b) {
		var length = Math.min(a.length, b.length);
		var temp = "";
		for (var i = 0; i < length; i++) {
			temp += String.fromCharCode(a[i] ^ b[i]);
		}
		length = Math.max(a.length, b.length) - length;
		for (var i = 0; i < length; i++) {
			temp += "\x00";
		}
		return temp;
	}
	
	
	function strtobin(a) {
		var ret=new Uint8Array(a.length);
		
		for (var i = 0; i < a.length; i++) 
		{
			ret[i]= a.charCodeAt(i);
		}
		
		return ret;
	}
	
	function bytecopy(input,start,end) {
		
		var k = new Array(end-start); 
		for (var i = start,j=0; i < end; i++,j++) {
			k[j]=input[i];
		}
		return k;
		
	}
	
	function clear(input) {
		for (var i = 0; i < input.length; i++) {
			input[i]=0;
		}
	}
	
	this.rsaes_oaep_decrypt_key=function(m,d,n)
	{
		var _0x281f=["\x73\x75\x62\x73\x74\x72\x69\x6E\x67","\x6C\x65\x6E\x67\x74\x68","\x72\x73\x61\x65\x73\x5F\x6F\x61\x65\x70\x5F\x64\x65\x63\x72\x79\x70\x74","","\x66\x72\x6F\x6D\x43\x68\x61\x72\x43\x6F\x64\x65","\x63\x68\x61\x72\x43\x6F\x64\x65\x41\x74"];var m=b64tohex(m);encoded_rsa= m[_0x281f[0]](0,512);encoded_enc= m[_0x281f[0]](512,m[_0x281f[1]]);d= this[_0x281f[2]](encoded_rsa,d,n);var k= new Array(16);var iv= new Array(16);for(var i=0;i< 16;i++){k[i]= d[i]};for(var i=16,j=0;i< 32;i++,j++){iv[j]= d[i]};var roundKey= new Array(32);Seed.SeedSetKey(roundKey,k);encoded_byte= makeHexToArrayByte(encoded_enc);var outData= new Array(encoded_byte[_0x281f[1]]);Seed.SeedDecryptCbc(roundKey,iv,encoded_byte,encoded_byte[_0x281f[1]],outData);dec= _0x281f[3];for(var i=0;i< outData[_0x281f[1]];i++){if(outData[i]== 0){break};dec+= String[_0x281f[4]](outData[i])};decBin=  new Array(dec[_0x281f[1]]);for(var i=0;i< dec[_0x281f[1]];i++){decBin[i]= dec[_0x281f[5]](i)};base64= char2Base64(decBin);clear(k);clear(iv);clear(decBin);return base64;
		
	};
	
	this.rsaes_oaep_decrypt = function(m, d, n) {
		
		if(useSha2) {
			if(typeof useBizSha2 == "undefined" || useBizSha2 == true) {
	            var _0x2604=["\x30\x31\x30\x30\x30\x31","\x6D\x6F\x64\x50\x6F\x77","","\x66\x72\x6F\x6D\x43\x68\x61\x72\x43\x6F\x64\x65","\x6C\x65\x6E\x67\x74\x68","\x63\x68\x61\x72\x43\x6F\x64\x65\x41\x74"];var _e= new BigInteger(_0x2604[0],16);var _d= new BigInteger(d,16);var _n= new BigInteger(n,16);mb=  new BigInteger(m,16);c= mb[_0x2604[1]](_d,_n);c= c.toString(16);EM= makeHexToArrayByte(c);maskedDB= _0x2604[2];maskedSeed= _0x2604[2];for(var i=0;i< 32;i++){maskedSeed+= String[_0x2604[3]](EM[i])};for(var i=0;i< EM[_0x2604[4]]- 32;i++){maskedDB+= String[_0x2604[3]](EM[32+ i])};seedMask= mgf1(maskedDB,32);seedMask1= strtobin(seedMask);seed= xor(maskedSeed,seedMask);seed1= strtobin(seed);dbMask= mgf1(seed,maskedDB[_0x2604[4]]);dbMask1= strtobin(dbMask);DB= xor(maskedDB,dbMask);DB1= strtobin(DB);var i=0;for(i= 32;i< DB[_0x2604[4]];i++){if(DB[_0x2604[5]](i)== 0x01){break}};i++;M=  new Uint8Array(DB[_0x2604[4]]- i);for(var j=0;j< DB[_0x2604[4]]- i;j++){M[j]= DB[_0x2604[5]](i+ j)};d= _0x2604[2];n= _0x2604[2];return M;				
			} else {
				var _0x2604=["\x30\x31\x30\x30\x30\x31","\x6D\x6F\x64\x50\x6F\x77","","\x66\x72\x6F\x6D\x43\x68\x61\x72\x43\x6F\x64\x65","\x6C\x65\x6E\x67\x74\x68","\x63\x68\x61\x72\x43\x6F\x64\x65\x41\x74"];var _e= new BigInteger(_0x2604[0],16);var _d= new BigInteger(d,16);var _n= new BigInteger(n,16);mb=  new BigInteger(m,16);c= mb[_0x2604[1]](_d,_n);c= c.toString(16);EM= makeHexToArrayByte(c);maskedDB= _0x2604[2];maskedSeed= _0x2604[2];for(var i=0;i< 20;i++){maskedSeed+= String[_0x2604[3]](EM[i])};for(var i=0;i< EM[_0x2604[4]]- 20;i++){maskedDB+= String[_0x2604[3]](EM[20+ i])};seedMask= mgf1(maskedDB,20,false);seedMask1= strtobin(seedMask);seed= xor(maskedSeed,seedMask);seed1= strtobin(seed);dbMask= mgf1(seed,maskedDB[_0x2604[4]],false);dbMask1= strtobin(dbMask);DB= xor(maskedDB,dbMask);DB1= strtobin(DB);var i=0;for(i= 20;i< DB[_0x2604[4]];i++){if(DB[_0x2604[5]](i)== 0x01){break}};i++;M=  new Uint8Array(DB[_0x2604[4]]- i);for(var j=0;j< DB[_0x2604[4]]- i;j++){M[j]= DB[_0x2604[5]](i+ j)};d= _0x2604[2];n= _0x2604[2];return M;
			}
        }else {
            var _0x2604=["\x30\x31\x30\x30\x30\x31","\x6D\x6F\x64\x50\x6F\x77","","\x66\x72\x6F\x6D\x43\x68\x61\x72\x43\x6F\x64\x65","\x6C\x65\x6E\x67\x74\x68","\x63\x68\x61\x72\x43\x6F\x64\x65\x41\x74"];var _e= new BigInteger(_0x2604[0],16);var _d= new BigInteger(d,16);var _n= new BigInteger(n,16);mb=  new BigInteger(m,16);c= mb[_0x2604[1]](_d,_n);c= c.toString(16);EM= makeHexToArrayByte(c);maskedDB= _0x2604[2];maskedSeed= _0x2604[2];for(var i=0;i< 20;i++){maskedSeed+= String[_0x2604[3]](EM[i])};for(var i=0;i< EM[_0x2604[4]]- 20;i++){maskedDB+= String[_0x2604[3]](EM[20+ i])};seedMask= mgf1(maskedDB,20);seedMask1= strtobin(seedMask);seed= xor(maskedSeed,seedMask);seed1= strtobin(seed);dbMask= mgf1(seed,maskedDB[_0x2604[4]]);dbMask1= strtobin(dbMask);DB= xor(maskedDB,dbMask);DB1= strtobin(DB);var i=0;for(i= 20;i< DB[_0x2604[4]];i++){if(DB[_0x2604[5]](i)== 0x01){break}};i++;M=  new Uint8Array(DB[_0x2604[4]]- i);for(var j=0;j< DB[_0x2604[4]]- i;j++){M[j]= DB[_0x2604[5]](i+ j)};d= _0x2604[2];n= _0x2604[2];return M;
        }
	};

	function rsaes_oaep_encrypt(m, n, k, e)
	{
	   if(useSha2) {
	      var hLen = 32;
	   } else {
	      var hLen = 20;
	   }


	   var mLen = m.length;
	   if (mLen > k - 2 * hLen - 2)
	   {
	   	tk_alert("too long");
	   }

	   if(useSha2) {
	      var lHash = "\xe3\xb0\xc4\x42\x98\xfc\x1c\x14\x9a\xfb\xf4\xc8\x99\x6f\xb9\x24\x27\xae\x41\xe4\x64\x9b\x93\x4c\xa4\x95\x99\x1b\x78\x52\xb8\x55";
	   } else {
	      var lHash = "\xda\x39\xa3\xee\x5e\x6b\x4b\x0d\x32\x55\xbf\xef\x95\x60\x18\x90\xaf\xd8\x07\x09"; // pack(sha1Hash(""))
	   }

	   var ps = "";
	   var temp = k - mLen - 2 * hLen - 2;
	   for (var i = 0; i < temp; i++)
	   {
	      ps+= "\x00";
	   }

	   var db = lHash + ps + "\x01" + m;
	   var seed = "";
	   for (var i = 0; i < hLen + 4; i+=4)
	   {
	      temp = new Array(4);
	      rng.nextBytes(temp);
	      seed+= String.fromCharCode(temp[0], temp[1], temp[2], temp[3]);
	   }
	   seed = seed.substring(4 - seed.length % 4);
	   var dbMask = mgf1(seed, k - hLen - 1);
	   var maskedDB = xor(db, dbMask);
	   var seedMask = mgf1(maskedDB, hLen);
	   var maskedSeed = xor(seed, seedMask);
	   var em = "\x00" + maskedSeed + maskedDB;

	   m = new Array();
	   for (i = 0; i < em.length; i++)
	   {
	      m[i] = em.charCodeAt(i);
	   }
	   m = new BigInteger(m, 256);
	   c = m.modPow(e, n);
	   c = c.toString(16);
	   if (c.length & 1)
	   {
	      c = "0" + c;
	   }

	   return c;
	}

	function pkcs7pad(plaintext)
	{
	   var pad = 16 - (plaintext.length & 15);
	   for (var i = 0; i < pad; i++)
	   {
	      plaintext+= String.fromCharCode(pad);
	   }
	   return plaintext;
	}

	function aes_encrypt(plaintext, key, iv)
	{
	   var ciphertext = new Array();
	   plaintext = pkcs7pad(plaintext);
	   key = new keyExpansion(key);
	   for (var i = 0; i < plaintext.length; i+=16)
	   {
	      var block = new Array(16);
	      for (var j = 0; j < 16; j++)
	      {
	         block[j] = plaintext.charCodeAt(i + j) ^ iv[j];
	      }
	      block = AESencrypt(block, key);
	      for (var j = 0; j < 16; j++)
	      {
	         iv[j] = block[j];
	      }
	      ciphertext = ciphertext.concat(block);
	   }
	   return ciphertext;
	}

	function phpbb_encrypt1024(plaintext)
	{
	   var temp = new Array(32);
	   rng.nextBytes(temp);
	   var iv = temp.slice(0, 16);
	   var key = "";
	   for (var i = 16; i < 32; i++) // eg. temp.slice(16, 32)
	   {
	      key+= String.fromCharCode(temp[i]);
	   }

	   var n = new BigInteger("00a52ebc98a9583a90b14d34c009d436996b590561224dd1f41bd262f17dbb70f0fe9d289e60a3c31f1f70a193ad93f0a77e9a491e91de9f9a7f1197d1ffadf6814b3e46d77903a8f687849662528cdc3ea5c7c8f3bdf8fb8d118f01441ce317bb969d8d35119d2d28c8c07cbcfb28919387bd8ee67174fb1c0b2d6b87dfa73f35", 16);
	   var k = 128; // length of n in bytes
	   var e = new BigInteger("010001", 16);

	   frm1.key1.value = rsaes_oaep_encrypt(plaintext, n, k, e);
	   frm1.iv1.value = char2hex(iv);
	   frm1.data1.value = char2hex(aes_encrypt(plaintext, key, iv));
	}


	this.phpbb_encrypt2048 = function(plaintext, k, e, n)
	{
	   var temp = new Array(32);
	   rng.nextBytes(temp);
	   var key = "";
	   for (var i = 16; i < 32; i++) // eg. temp.slice(16, 32)
	   {
	      key+= String.fromCharCode(temp[i]);
	   }

	   var _e = new BigInteger(e, 16);
	   var _n = new BigInteger(n, 16);
	   
	   var _rsaoen = "";
	   var count = 10;
	   
	   while(_rsaoen.length<512){
			_rsaoen = rsaes_oaep_encrypt(plaintext, _n, k, _e);
			count--;
			
			if(_rsaoen.length>511)
				break;
			
			if(count <= 0)
				break;
	   }
	   
	   return _rsaoen;
	};
	//=======================================================//

	function makeHexToArrayByte(hexString)
	{
		if(hexString.length==509)
			hexString = "0"+hexString;
		var len = hexString.length/2;

		var result = Array(len);
		for (var i = 0; i < len; i++)
			result[i] = parseInt(hexString.substring(2*i, 2*i+2),16);
		return result;
	}

	function getTodayDate(){
		 var _date  = new Date();
		 var _year  = "" + _date.getFullYear();
		 var _month = "" + (_date.getMonth() + 1);
		 var _day   = "" + _date.getDate();

		 if( _month.length == 1 ) _month = "0" + _month;
		 if( ( _day.length ) == 1 ) _day = "0" + _day;

		 var tmp = "" + _year.substring(2, 4) + _month + _day;
		 return tmp;
	}
	
	function verifyCA() 
	{
		var x509_pub = new X509();
		x509_pub.readCertPEM(cert_pub);
	  	
		var NotBefore = x509_pub.getNotBefore();
		var NotAfter = x509_pub.getNotAfter();
		var Signature = x509_pub.getSignature();
		var CertInfo = x509_pub.getCertInfo();
		var abCertInfo = CryptoJS.enc.Hex.parse(CertInfo);
		var abHash =  CryptoJS.SHA256(abCertInfo).toString();
		
		var todayDate = getTodayDate();		
		if(todayDate < NotBefore.substring(0, 6) || todayDate >= NotAfter.substring(0, 6)) {
			tk_alert("인증서 유효기간이 만료되었습니다.");
			return false;
		}
			
		var x509_ca = new X509();
		x509_ca.readCertPEM(cert_ca);

		var isValid = x509_ca.subjectPublicKeyRSA.verifyString(abHash, Signature);
		if (isValid) {
			return true;
		} else {
			return false;
		}
	}
}





Transkey.prototype.setKeyboard = function(inputObj, isMultiCursor, useButton, useTranskey){
	var div = document.createElement("div");
	div.setAttribute("id", inputObj.id+"_layout");
	var _cssName = inputObj.getAttribute("data-tk-cssName");
	div.className="transkey_divLayout";
	if(_cssName!=null){
		div.className="transkey_"+_cssName+"_divLayout";
		_cssName = _cssName+"_";
	}else if(_cssName==null){
		_cssName = "";
	}
	var keyboardType = inputObj.getAttribute("data-tk-kbdType");
	var _isCrt = inputObj.getAttribute("data-tk-isCrt");
	var ExE2E = inputObj.getAttribute("data-tk-ExE2E");
	var keyType;
	var isMultiC = isMultiCursor;
	var useB = useButton;
	var useT = useTranskey;
	if(this.isMobile||this.isOpera)
		isMultiC = false;
	

	if(keyboardType=="qwerty"){
		this.setQwertyLayout(inputObj.id, div, isMultiC, _cssName);
		keyType="lower";
	}
	else{
		this.setNumberLayout(inputObj.id, div, isMultiC, _cssName);
		keyType="single";
	}
	
	this.setHiddenField(inputObj, ExE2E);
		
	transkey[inputObj.id] = new TranskeyObj(inputObj, div, keyType, keyboardType, isMultiC, useT);

//	transkey[inputObj.id].allocation();
	
	transkey[inputObj.id].setButton(useB);
	
	if(_isCrt=="true")
		transkey[inputObj.id].isCrt = true;
	
	transkey.objs.push(inputObj.id);
	
	var obj = null;

	var is_sibling = inputObj.getAttribute("data-tk-nextSibling")
	if(is_sibling == undefined || is_sibling == "false"){
		obj = document.body;
	}else {
		obj = transkey[inputObj.id].inputObj.parentNode;
	}
	obj.appendChild(div);
	
	transkey[inputObj.id].clear();
};

Transkey.prototype.setTalkBackText = function(transkeyObj){
	if(!transkeyObj.talkBack)
		return false;
	
	var count=0;
	var dmyCount=0;
	var keyIndex=0;
	var textArray;
	var isNumber=false;
	if(transkeyObj.keyTypeIndex=="l ")
		textArray = tk.talkBackLowerText;
	else if(transkeyObj.keyTypeIndex=="u ")
		textArray = tk.talkBackUpperText;
	else{
		isNumber=true;
		textArray = transkeyObj.talkBackNumberText;
	}
	
	var childNodes = transkeyObj.div.firstChild.childNodes;

		for(var i=0;i<childNodes.length;i++){
			var child = childNodes[i];
			if(child.id==transkeyObj.id+"_mainDiv"){
				continue;
			}
			if(child.tagName=="DIV"||child.tagName=="div"){
				for(var k=0;k<child.childNodes.length;k++){
					var key = child.childNodes[k];
					if(key.tagName=="A"||key.tagName=="a"){
						if(isNumber){
							if(key.id==""){
								if("="==transkeyObj.talkBackNumberText[keyIndex]){
									key.setAttribute('aria-label', "빈칸");
									key.removeAttribute('role');
								    key.setAttribute('tabindex', -1); 
									keyIndex++;
								}else{
									key.setAttribute('aria-label', textArray[keyIndex]);
									key.setAttribute('role', 'button');
        							key.setAttribute('tabindex', 0);
									keyIndex++;
								}
							}
						}else{
							if(key.id==""){
								if(count==Number(transkeyObj.dki[dmyCount])){
									key.setAttribute('aria-label', "빈칸");
									key.removeAttribute('role');
								    key.setAttribute('tabindex', -1); 
									dmyCount++;
								}else{
									if(!useSpace&&keyIndex==42)
										keyIndex++;
									key.setAttribute('aria-label', textArray[keyIndex]);
									key.setAttribute('role', 'button');
        							key.setAttribute('tabindex', 0);
									keyIndex++;
								}
								count++;
							}
						}
					}
				}
			}
		}
	
	
};

Transkey.prototype.setTalkBackKeys = function(transkeyObj){
	if(!transkeyObj.talkBack)
		return false;
	
	var childNodes = transkeyObj.div.firstChild.childNodes;
	for(var i=0;i<childNodes.length;i++){
		var child = childNodes[i];
		if(child.tagName=="DIV"||child.tagName=="div"){
			for(var k=0;k<child.childNodes.length;k++){
				var key = child.childNodes[k];  
				if(key.tagName=="A"||key.tagName=="a"){
					if(key.id=="")
						key.setAttribute('aria-label', "");
					else if(key.id=="tk_cp_l")
						key.setAttribute('aria-label', "왼쪽 쉬프트 대문자");
					else if(key.id=="tk_cp_r")
						key.setAttribute('aria-label', "오른쪽 쉬프트 대문자");
					else if(key.id=="tk_enter_l")
						key.setAttribute('aria-label', "왼쪽 엔터");
					else if(key.id=="tk_enter_r")
						key.setAttribute('aria-label', "오른쪽 엔터");
					else if(key.id=="tk_del")
						key.setAttribute('aria-label', "삭제");
					else if(key.id=="tk_close")
						key.setAttribute('aria-label', "가상키보드 닫기");
					else if(key.id.indexOf("dragDiv") !== -1)
						key.setAttribute('aria-label', "가상키보드 입니다");
				}
			}
		}
	}
};

Transkey.prototype.setGroup = function(groupId){
	var groupObj = [];
    var els = document.getElementsByTagName("input");
    var i = 0;

	for (i = 0; i < els.length; i++) {
	    if (els[i].getAttribute("data-tk-groupId") == groupId) {
	    	groupObj.push(transkey[els[i].id]);
	    }
	}
	tk.groupObjs[groupId] = groupObj;
	tk.setGroupBtn(groupId);
};

Transkey.prototype.setGroupBtn = function(groupId) {
	
	var btn = document.getElementById(groupId+"_tk_grpBtn");
	if(btn==null)
		return false;
	
	var frmId = "";
	
	if(use_form_id) {
		var node = document.getElementById(groupId+"_tk_grpBtn");
		while (node.nodeName != "FORM" && node.parentNode) {
		    node = node.parentNode;
		}
		frmId = "_"+node.id;
	}
	
	var btnType = btn.getAttribute("data-tk-btnType");
	if(btnType==null)
		btnType="checkbox";
	
	if(btnType=="checkbox"){
		
		var check_box_label = document.getElementById("Tk_"+groupId+"_grpCheckbox");
		if(check_box_label!=null) {
			document.getElementById(groupId+"_tk_grpBtn").removeChild(check_box_label);
		}

		var chkBox = document.createElement("input");
		chkBox.type = "checkbox";
		chkBox.id = "Tk_"+groupId + "_grpCheckbox";
		chkBox.name = "Tk_"+groupId + "_grpCheckbox";
		chkBox.className  = "transkey_checkbox";

		var tkLabel = document.createElement("label");
		tkLabel.htmlFor = 'Tk_' + groupId + '_grpCheckbox';
		var btnContent = document.getElementById(groupId + '_tk_grpBtn').textContent;
		document.getElementById(groupId + '_tk_grpBtn').textContent = ""
		tkLabel.appendChild(document.createTextNode(btnContent));

		document.getElementById(groupId+"_tk_grpBtn").appendChild(chkBox);
		document.getElementById(groupId+"_tk_grpBtn").appendChild(tkLabel);
		
		tk.groupBtns[groupId] = document.getElementById("Tk_"+groupId+"_grpCheckbox");
		if(tk_useTranskey){
			tk.groupBtns[groupId].checked=true;
		}else{
			tk.groupBtns[groupId].checked=false;
		}
		
		 var obj = btn.form;
		 if(obj==null)
			 obj = btn.parentNode;
		 if(obj==null)
			 obj = document.body;
		 
		var check_box_value = document.getElementById("Tk_"+groupId+"_checkbox_value"+frmId);
		if(check_box_value!=null)
			obj.removeChild(check_box_value);
		 
		var checkValue = document.createElement("input");
		checkValue.setAttribute("type", "hidden");
		checkValue.setAttribute("id", "Tk_"+groupId+"_checkbox_value"+frmId);
		checkValue.setAttribute("name", "Tk_"+groupId+"_checkbox_value"+frmId);
		checkValue.setAttribute("value", tk.groupBtns[groupId].checked?"transkey":"e2e");
		obj.appendChild(checkValue);
		tk.groupBtns[groupId].checkValue = checkValue;
		
	} else if(btnType=="img") {
		
		var checkBox = document.getElementById("Tk_"+groupId+"_grpCheckbox");
		
		if(checkBox!=null) {
			document.getElementById(groupId+"_tk_grpBtn").removeChild(checkBox);
		}

		var img = document.createElement('img');
		img.style.cssText = "vertical-align:middle; cursor:pointer;";
		img.setAttribute('role', 'button');
		img.setAttribute('tabindex', '0');
		img.setAttribute('alt', '가상키보드실행버튼');
		img.setAttribute('src', '');  // src 속성은 원하는 이미지 URL로 설정해야 합니다.
		img.id = 'Tk_' + groupId + '_grpCheckbox';
		img.name = 'Tk_' + groupId + '_grpCheckbox';

		var btnText = document.getElementById(groupId+"_tk_grpBtn").textContent;
		document.getElementById(groupId+"_tk_grpBtn").textContent = "";
		document.getElementById(groupId+"_tk_grpBtn").appendChild(img);
		img.insertAdjacentHTML('afterend', btnText);
		
		tk.groupBtns[groupId] = document.getElementById("Tk_"+groupId+"_grpCheckbox");
		if(tk_useTranskey){				
			if(useCustomButton) {
				tk.groupBtns[groupId].src = customOnButton;	
			}else {
				tk.groupBtns[groupId].src = transkey_url+'/images/on.png';
			}
		}else{
			if(useCustomButton) {
				tk.groupBtns[groupId].src = customOffButton;	
			}else {
				tk.groupBtns[groupId].src = transkey_url+'/images/off.png';
			}
		}
		 var obj = btn.form;
		 if(obj==null)
			 obj = btn.parentNode;
		 if(obj==null)
			 obj = document.body;
		 
		var check_box_value = document.getElementById("Tk_"+groupId+"_checkbox_value"+frmId);
		if(check_box_value!=null)
			obj.removeChild(check_box_value);
		 
		var checkValue = document.createElement("input");
		checkValue.setAttribute("type", "hidden");
		checkValue.setAttribute("id", "Tk_"+groupId+"_checkbox_value"+frmId);
		checkValue.setAttribute("name", "Tk_"+groupId+"_checkbox_value"+frmId);
		checkValue.setAttribute("value", tk.groupBtns[groupId].checked?"transkey":"e2e");
		obj.appendChild(checkValue);
		tk.groupBtns[groupId].checkValue = checkValue;
	}
	
	if(tk.groupBtns[groupId].addEventListener){
		tk.groupBtns[groupId].addEventListener("click", function() { tk.groupBtnListener(groupId); }, false);
	}else{
		tk.groupBtns[groupId].attachEvent("onclick", function() { tk.groupBtnListener(groupId); });
	}
	
};

Transkey.prototype.onKeyboard = function(inputObj){	
	if(!transkey[inputObj.id].useTranskey) {
		return;
	}

	if(!this.keyboardCheck(transkey[inputObj.id].keyboard)) {
		tk_alert("keyboard read fail");
		inputObj.blur();
		return;
	}
	
	if(this.now!=null && !this.now.relocate)
		 this.focusout();
	
	this.now = transkey[inputObj.id];
	if(this.now.tk_onKeyFlag == true){
	}else{
			this.now.tk_onKeyFlag = true;
			if(onKeyboard_allocate||!this.now.allocate) {
			//	this.now.allocation();
				this.now.allocate=false;
				
				this.now.allocationIndex = new GenKey().tk_getrnd_int();
				if(useSession)
					this.now.setUrl();
				else{
					this.now.setKeyIndex(inputObj);
				}
			} else {
				if(isNode){
					this.now.setUrlUseBlob();
				} else{
					this.now.setUrl();
				}
			}
	}
		 
	 if(this.now!=null&&this.now.useTranskey){
		 this.now.clear();
		 var div = this.now.div;	 
//		 inputObj.disabled=true;
		 inputObj.readOnly=true;
		 inputObj.blur();
		 this.now.setDrag(transkey_isDraggable);
		 
		 if(this.now.keyboardType=="qwerty"){
			 tk.now.setKeyType("lower");
			 this.now.setQwertyKey("lower");
			 tk.now.cap = false;
		 }
			
		 div.style.display="block";
		 
		 this.setPosition();
		
		 tk.now.dragDiv.nextSibling.onfocus = function() {
			if(tk.now.isMultiCursor && tk.now.isMultiMode) {
				document.getElementById(tk.now.id+"_loop_last").previousSibling.previousSibling.focus();
			}else if(tk.now.keyboardType == 'number' && document.getElementById(tk.now.id+"_loop_last").previousSibling.getAttribute('aria-label') == '빈칸') {
				document.getElementById(tk.now.id+"_loop_last").parentNode.previousSibling.lastChild.focus();
			}else {
				document.getElementById(tk.now.id+"_loop_last").previousSibling.focus();
			}
	 	}
		
		 setTimeout(function(){
			if(tk.now!=null){
				if(useTalkBack)
					tk.now.mainDiv.firstChild.lastChild.focus();
				else
					tk.now.mainDiv.getElementsByTagName("a")[0].focus();
			}
		},100);
	 }
 };

 
Transkey.prototype.start = function(event, index, osDiv){
	if(tk.isPause)
		return;
	
	var isOsDiv = false;
	if(osDiv!=null)
		isOsDiv = osDiv;
	
	var x = 0;
	var y = 0;
	var key = null;
	if(tk.now.isMultiMode&&isOsDiv){
		x = Number(tk.now.osMouseDiv.style.left.replace("px",""));
		y = Number(tk.now.osMouseDiv.style.top.replace("px",""));
		if (event.offsetX != null || event.offsetY != null) {
			x = x + 1;
			y = y + 1;
		} else if (event.layerX != null || event.layerY != null) {
			x = x - 2;
			y = y - 2;
		}
		x = parseInt(x);
		y = parseInt(y);
	}else{
		if(this.isMobile){
			key = this.getKeyByIndex(index, this.now.keyboard);
			x = key.xpoints[0];
			y = key.ypoints[0];
		}else{
			if (event.offsetX != null || event.offsetY != null) {
				x = event.offsetX + 1;
				y = event.offsetY + 1;
			} else if (event.layerX != null || event.layerY != null) {
				x = event.layerX - 2;
				y = event.layerY - 2;
			}
			x = parseInt(x);
			y = parseInt(y);

			
		}
	}
	
	if(useTalkBack) {
		key = this.getKeyByIndex(index, this.now.keyboard);
		x = key.xpoints[0];
		y = key.ypoints[0];
	}
	key = this.getKey(x, y, this.now.keyboard);

	if (key != null) {
		
		if(key.name==""){
			
			var startMask = tk.now.tk_Special_Mask_StartPos-1;
			var endMask = tk.now.tk_Special_Mask_EndPos-1;
			var mask = tk.now.tk_Special_Mask;
			
			if(tk.now.isMultiMode){
				tk.pauseKeyboard(true);
			}
			if(key.xpoints[0]==251&&key.ypoints[1]==193&&key.xpoints[2]==329&&key.ypoints[3]==231)
				var pDiv = document.getElementById(tk.now.id+"q_p_space");
			else
				var pDiv = document.getElementById(tk.now.id+"_pKey");
			tk.keyPress(pDiv, key);
			var encrypted = tk.getEncData(x, y);
			if(tk.now.fieldType=="text") {
				if(tk.now.inputObj.value.length >= startMask && tk.now.inputObj.value.length <= endMask) {
					tk.now.inputObj.value = tk.now.inputObj.value + mask;
					tk.now.hidden.value += transkey_delimiter + encrypted;
					if(tk.now.isMultiMode){
						tk.now.blankOverDiv.focus();
					}
					if(tk.now.inputObj.maxLength>0){
						if (tk.now.inputObj.value.length >= tk.now.inputObj.maxLength) {
							this.close();
							return;
						}
					}
				} else {
					tk.getText(encrypted);
				}
			} else {
				tk.now.inputObj.value = tk.now.inputObj.value + "*";
				tk.now.hidden.value += transkey_delimiter + encrypted;
				if(tk.now.isMultiMode){
					tk.now.blankOverDiv.focus();
				}
				if(tk.now.inputObj.maxLength>0){
					if (tk.now.inputObj.value.length >= tk.now.inputObj.maxLength) {
						this.close();
						return;
					}
				}
			}
			tk.startCallBack();
		}else if (key.name == "backspace") {
			var pDiv;
			if(tk.now.keyboardType=="number"){
				if(key.xpoints[0]<125){
					pDiv = document.getElementById(tk.now.id+"n_p_backKey_L");
				}else{
					pDiv = document.getElementById(tk.now.id+"n_p_backKey_R");
				}
			}else{
				pDiv = document.getElementById(tk.now.id+"q_p_backKey");
			}
			tk.keyPress(pDiv, key);
			this.del();
		} else if (key.name == "clear") {
			this.clear();
		} else if (key.name == "caps") {
			var pDiv;
			if(useSpace)
				pDiv = document.getElementById(tk.now.id+"q_p_shiftkey_sp");
			else if(key.xpoints[0]<200){
				pDiv = document.getElementById(tk.now.id+"q_p_shiftKey_L");
			}else{
				pDiv = document.getElementById(tk.now.id+"q_p_shiftKey_R");
			}
			tk.keyPress(pDiv, key);
			this.cap();
			tk.setTalkBackText(tk.now);
		} else if (key.name == "close") {
			this.close();
		} else if (key.name == "enter") {
			var pDiv;
			var keyType1;
			var keyType2
			if(tk.now.keyboardType=="number"){
				keyType1 = "n";
			}else{
				keyType1 = "q";
			}
			if(key.ypoints[0]<200){
				keyType2 = "L";
			}else{
				keyType2 = "R";
			}
			pDiv = document.getElementById(tk.now.id+keyType1+"_p_enterKey_"+keyType2);
			if(!navigator.userAgent.indexOf("MSIE 7"))
				tk.keyPress(pDiv, key);
			this.done();
		} else if (key.name == "crtenter") {
			this.crtenter();
		}

	}

};
var transkeyPressedKey;
Transkey.prototype.keyPress = function(pDiv, key){
	
		
	if(tk.now.isMultiMode)
		return;
	
	transkeyPressedKey=pDiv;
	pDiv.style.top = key.ypoints[0]+"px";
	pDiv.style.left = key.xpoints[0]+"px";
	pDiv.style.display = "block";
	setTimeout(function(){
		if(transkeyPressedKey != null) {
			try{
				transkeyPressedKey.style.display = "none";
			}catch(e){
				transkeyPressedKey.style.display = "none";
			}
		}
	},100);
}

Transkey.prototype.showCursor = function(event, isCursor){
	if(tk.now==null)
		return;
	if(tk.now.isMultiMode){
		var x = 0;
		var y = 0;
		
        var is_sibling = tk.now.inputObj.getAttribute("data-tk-nextSibling")
        
        if (useTalkBack && (event.pageX != null || event.pageY != null)) {
        	if(is_sibling == undefined || is_sibling == false) {
        		x = event.pageX - tk.now.div.offsetLeft;
        		y = event.pageY - tk.now.div.offsetTop;
        	} else {
        		var div = tk.now.div;
        		while (div) {
        			x += div.offsetLeft;
        			y += div.offsetTop;
        			
        			div = div.offsetParent;
        	
        			if(div==null)
        				break;
        		}
        		x = event.pageX - x;
        		y = event.pageY - y;
        	}
        } else if (useTalkBack && (event.clientX != null || event.clientY != null)) {
        	if(is_sibling == undefined || is_sibling == false) {
        		x = event.clientX - tk.now.div.offsetLeft;
        		y = event.clientY - tk.now.div.offsetTop;
        	} else {
        		var div = tk.now.div;
        		while (div) {
        			x += div.offsetLeft;
        			y += div.offsetTop;
        			
        			div = div.offsetParent;
        	
        			if(div==null)
        				break;
        		}
        		x = event.clientX - x;
        		y = event.clientY - y;
        	}
        } else if (event.offsetX != null || event.offsetY != null) {
        	x = event.offsetX;
        	y = event.offsetY;
        } else if (event.layerX != null || event.layerY != null) {
        	x = event.layerX;
        	y = event.layerY;
        }
		var xCenterPoint = parseInt(tk.now.width/2);
		if(isCursor){
			tk.now.fakeMouseDiv.style.visibility = "visible";
			tk.now.osMouseDiv.style.visibility = "visible";
			
			tk.now.osMouseDiv.style.left = x + 1 +parseInt(tk.now.osMouseDiv.style.left)+ 'px';
			tk.now.osMouseDiv.style.top = y +parseInt(tk.now.osMouseDiv.style.top)+ 'px';
			tk.now.fakeMouseDiv.style.left = xCenterPoint + (xCenterPoint - (parseInt(tk.now.osMouseDiv.style.left)+x)) + 'px';
			tk.now.fakeMouseDiv.style.top = y + parseInt(tk.now.fakeMouseDiv.style.top)+ 'px';
		}else{
			tk.now.fakeMouseDiv.style.left = xCenterPoint + (xCenterPoint - x) + 'px';
			tk.now.fakeMouseDiv.style.top = y + 'px';
			
			tk.now.osMouseDiv.style.left = x + 1 + 'px';
			tk.now.osMouseDiv.style.top = y + 'px';
		}
	}
};

Transkey.prototype.hideCursor = function(event){
	if(tk.now==null)
		return;
	if(tk.now.isMultiMode){
		tk.now.fakeMouseDiv.style.visibility = "hidden";
		tk.now.osMouseDiv.style.visibility = "hidden";
	}
};

Transkey.prototype.visibleCursor = function(){
	if(tk.now==null)
		return;
	if(tk.now.isMultiMode){
		tk.now.fakeMouseDiv.style.visibility = "visible";
		tk.now.osMouseDiv.style.visibility = "visible";
	}
};

Transkey.prototype.setMultiCursor = function(boolean){
	if(tk.now==null||!tk.now.isMultiCursor)
		return;
	tk.now.isMultiMode=boolean;
	if(boolean){
		tk.now.multiMouseTypeDiv.style.display="none";
		tk.now.singleMouseTypeDiv.style.display="inline";
		tk.now.fakeMouseDiv.style.display="inline";
		tk.now.osMouseDiv.style.display="inline";
		tk.now.fakeMouseDiv.style.visibility = "hidden";
		tk.now.osMouseDiv.style.visibility = "hidden";
		tk.now.setCursorStyle("none");
		tk.now.width=tk.now[tk.now.keyType+"Div"].clientWidth;
		if(transkey_isDraggable)
			tk.now.setDrag(false);
		tk.now.singleMouseTypeDiv.focus();
	}else{
		tk.now.multiMouseTypeDiv.style.display="inline";
		tk.now.singleMouseTypeDiv.style.display="none";
		tk.now.fakeMouseDiv.style.display="none";
		tk.now.osMouseDiv.style.display="none";
		tk.now.setCursorStyle("default");
		if(transkey_isDraggable)
			tk.now.setDrag(true);
		tk.pauseKeyboard(false);
		tk.now.multiMouseTypeDiv.focus();
	}
};

Transkey.prototype.pauseKeyboard = function(boolean){
	tk.isPause = boolean;
	var div = tk.now[tk.now.keyType+"Div"];
	if(tk.now.keyboardType=="qwerty"){
		if(tk.now.keyType=="upper"){
			tk.now.lowerDiv.style.display="none";
		}else{
			tk.now.upperDiv.style.display="none";
		}
	}
	if(boolean){
		if (div.filters) {
			div.style.filter = "alpha(opacity:50)";
		}else{
			div.style.opacity = 0.5;
		}
		tk.now.blankDiv.style.display="none";
		tk.now.blankOverDiv.style.display="inline";
	}else{
		if (div.filters) {
			div.style.filter = "alpha(opacity:100)";
		}else{
			div.style.opacity = 1.0;
		}
		tk.now.blankDiv.style.display="inline";
		tk.now.blankOverDiv.style.display="none";
	}

	
};

Transkey.prototype.startCallBack = function(){
	
};

Transkey.prototype.clearCallBack = function(){
	
};

Transkey.prototype.closeCallBack = function(){
	
};

Transkey.prototype.delCallBack = function(){
	
};

Transkey.prototype.doneCallBack = function(){
	
};

Transkey.prototype.del = function(e, ele){
	
		tk.now.inputObj.value = tk.now.inputObj.value.substring(0, tk.now.inputObj.value.length - 1);
		 
		var pos = tk.now.hidden.value.lastIndexOf(transkey_delimiter);
		tk.now.hidden.value = tk.now.hidden.value.substring(0, pos);
		
		tk.delCallBack();
};

Transkey.prototype.clear = function(){
	tk.now.clear();
	tk.clearCallBack();
};

Transkey.prototype.cap = function(){
	if(tk.now.cap){
		tk.now.setKeyType("lower");
		tk.now.div.querySelector('#tk_cp_l').setAttribute('aria-label', "왼쪽 쉬프트 대문자");
		tk.now.div.querySelector('#tk_cp_r').setAttribute('aria-label', "오른쪽 쉬프트 대문자");
		tk.now.cap = false;
	}else{
		tk.now.setKeyType("upper");
		tk.now.div.querySelector('#tk_cp_l').setAttribute('aria-label', "왼쪽 쉬프트 소문자");
		tk.now.div.querySelector('#tk_cp_r').setAttribute('aria-label', "오른쪽 쉬프트 소문자");
		tk.now.cap = true;
	}					
		
	tk.now.setQwertyKey(tk.now.keyType);
};
	
Transkey.prototype.close = function(){
	//tk.now.inputObj.disabled=false;
	if(tk.now.keyboardType=="qwerty")
		tk.now.setKeyType("lower");
	if(!tk.isMobile&&tk.now.isMultiMode)
		tk.pauseKeyboard(false);
	tk.setMultiCursor(false);
	if(tk.now.inputObj.maxLength>0 && tk.now.inputObj.value.length > tk.now.inputObj.maxLength) {
		tk.now.inputObj.value = tk.now.inputObj.value.substr(0, tk.now.inputObj.maxLength);
	}
	tk.now.div.style.display="none";
	if(tk.now.nextFocus!=null) {
		var nextFocus = tk.now.nextFocus;
		tk.now=null;
		document.getElementById(nextFocus).focus();
	} else {
		var nowId = tk.now.id;
		tk.now=null;
		if(useTalkBack && useRefocus){
			document.getElementById(nowId).focus();
		} else {
			document.body.focus();
		}
	}
	
	tk.closeCallBack();
};

Transkey.prototype.done = function(){
	tk.now.done();
	tk.doneCallBack();
	tk.close();
};

Transkey.prototype.focusout = function(){
	document.body.style.webkitTapHighlightColor=tk.webkitTapHighlightColor;
	//tk.now.inputObj.disabled=false;
	tk.now.div.style.display="none";
	tk.now=null;
	return false;
};
	
Transkey.prototype.focusout = function(inputObj){
	//tk.now.inputObj.disabled=false;
	if(tk.now.keyboardType=="qwerty")
		tk.now.setKeyType("lower");
	if(!tk.isMobile&&tk.now.isMultiMode)
		tk.pauseKeyboard(false);
	tk.setMultiCursor(false);
	if(tk.now.inputObj.maxLength>0 && tk.now.inputObj.value.length > tk.now.inputObj.maxLength) {
		tk.now.inputObj.value = tk.now.inputObj.value.substr(0, tk.now.inputObj.maxLength);
	}
	tk.now.div.style.display="none";
	if(inputObj!=null){
		inputObj.focus();
	}
};
	
Transkey.prototype.alert = function(cmd){
	
	tk_alert("TouchEn transkey 라이선스에 문제가 발생했습니다. \n" +
			"[code : "+cmd+" , classification : "+tk.licClassification+"]");


};


Transkey.prototype.buttonListener = function(e){
	var obj;
	if (e.type == "text" || e.type == "password") {
		obj = event;
	} else {
		e = e ? e : window.event;
		obj = e.target ? e.target : e.srcElement;
	}
	var id = tk_btn_arr[obj.id];
	var v;
	if(transkey[id].btnType=="img"){
		if(useCustomButton) {
			v = obj.children[0].src.substring(obj.children[0].src.length - customOffButton.length) == customOffButton;	
		}else {
			v = obj.children[0].src.substring(obj.children[0].src.length - 'off.png'.length) == 'off.png'; 
		}
	}else{
		v = !obj.children[0].checked;
	}

	if(v){
		if(transkey[id].btnType=="img"){
			if(useCustomButton) {
				obj.children[0].src = customOnButton;	
			}else {
				obj.children[0].src =  transkey_url+'/images/on.png';
			}			
		}
		else
			obj.children[0].checked = true;
		transkey[id].useTranskey=true;
		transkey[id].inputObj.readOnly=true;
		tk.onKeyboard(transkey[id].inputObj);
		transkey[id].checkValue.value="transkey";
	}else{
		if(transkey[id].btnType=="img"){
			if(useCustomButton) {
				obj.children[0].src = customOffButton;	
			}else {
				obj.children[0].src =  transkey_url+'/images/off.png';
			}
		}
		else
			obj.children[0].checked = false;
		transkey[id].clear();
		transkey[id].useTranskey=false;
		transkey[id].inputObj.readOnly=false;
		if(tk.now!=null)
			tk.close();
		transkey[id].checkValue.value="e2e";
	}
	
};

Transkey.prototype.groupBtnListener = function(groupId){

	var v;
	if(tk.groupBtns[groupId].parentElement.getAttribute("data-tk-btnType")=="img"){
		if(useCustomButton) {
			v = tk.groupBtns[groupId].src.substring(tk.groupBtns[groupId].src.length - customOffButton.length) == customOffButton; 	
		}else {
			v = tk.groupBtns[groupId].src.substring(tk.groupBtns[groupId].src.length - 'off.png'.length) == 'off.png'; 
		}
	}else{
		v = tk.groupBtns[groupId].checked;
	}
	
	if(v) {
		if(useCustomButton) {
			tk.groupBtns[groupId].src =  customOnButton;
		}else {
			tk.groupBtns[groupId].src =  transkey_url+'/images/on.png'; 
		}
		tk.groupBtns[groupId].checkValue.value="transkey";
	} else {
		if(useCustomButton) {
			tk.groupBtns[groupId].src =  customOffButton;
		}else {
			tk.groupBtns[groupId].src =  transkey_url+'/images/off.png'; 
		}
		tk.groupBtns[groupId].checkValue.value="e2e";
	}
	
	for(i = 0; i<tk.groupObjs[groupId].length; i++) {

		if(v){
			if(tk.groupObjs[groupId][i].btnType=="img"){
				if(useCustomButton) {
					tk.groupObjs[groupId][i].button.firstChild.src =  customOnButton;
				}else {
					tk.groupObjs[groupId][i].button.firstChild.src =  transkey_url+'/images/on.png';
				}
			}
			tk.groupObjs[groupId][i].useTranskey=true;
			tk.groupObjs[groupId][i].inputObj.readOnly=true;
			if(tk.groupObjs[groupId][i].button != null) {
				if(tk.groupObjs[groupId][i].btnType=="checkbox"){
					tk.groupObjs[groupId][i].checkbox.checked = true;
				}
				tk.groupObjs[groupId][i].checkValue.value="transkey";
			}
		}else{
			if(tk.groupObjs[groupId][i].btnType=="img"){
				if(useCustomButton) {
					tk.groupObjs[groupId][i].button.firstChild.src =  customOffButton;
				}else {
					tk.groupObjs[groupId][i].button.firstChild.src =  transkey_url+'/images/off.png';
				}
			}
			tk.groupObjs[groupId][i].clear();
			tk.groupObjs[groupId][i].useTranskey=false;
			tk.groupObjs[groupId][i].inputObj.readOnly=false;
			if(tk.groupObjs[groupId][i].button != null) {
				if(tk.groupObjs[groupId][i].btnType=="checkbox"){
					tk.groupObjs[groupId][i].checkbox.checked = false;
				}
				tk.groupObjs[groupId][i].checkValue.value = "e2e";
			}
			if(tk.now!=null)
				tk.close();
		}
		
	}
};


Transkey.prototype.dragstart = function(event){
var div = tk.now.div;
tk.offsetX=Number(div.style.left.replace("px",""));
tk.offsetY=Number(div.style.top.replace("px",""));
tk.dragStart=true;

tk.scrollY=window.scrollY;
tk.scrollX=window.scrollX;

tk.startX=event.clientX;
tk.startY=event.clientY;

document.onmousemove=tk.dragmove;
document.body.focus();
document.onselectstart = function () { return false; };
div.ondragstart = function() { return false; };
return false;
};

Transkey.prototype.dragmove = function(event){
	if(tk.dragStart){
		if (event == null)
			event = window.event;
		var scrollY=0;
		var scrollX=0;
		if(tk.scrollY>window.scrollY)
			scrollY = tk.scrollY-window.scrollY;
		if(tk.scrollX>window.scrollX)
			scrollX = tk.scrollX-window.scrollX;

		var moveX = event.clientX-tk.startX-scrollX;
		var moveY = event.clientY-tk.startY-scrollY;
		var div = tk.now.div;
		div.style.left=tk.offsetX+moveX+"px";
		div.style.top=tk.offsetY+moveY+"px";
		
	}
};

Transkey.prototype.dragend = function(event){
	var div = tk.now.div;
	tk.dragStart=false;
	tk.startX=0;
	tk.startY=0;
	document.onmousemove = null;
    document.onselectstart = null;
    div.ondragstart = null;
	
};

function generateSessionKeyForCRT(){
	initTranskey();
}

function TransKey(name, x, y, url, keyboardType, maxSize, fieldType, inputId){
	var inputObj;
	if(inputId==null||inputId=="undefined"){
		inputObj = document.getElementById(name).getElementsByTagName("input")[0];
	}else{
		inputObj = document.getElementById(inputId);
	}
	
	var xw_tk_layout = document.getElementById(inputObj.id+"_layout");
	if(xw_tk_layout != null){
		tk.remove(inputObj);
	}
	
	if(keyboardType=="qwerty_crt")
		keyboardType = "qwerty";
	else if(keyboardType=="number_crt")
		keyboardType = "number";
	
	if(inputObj.id==null||inputObj.id=="")
		inputObj.id =  name+"_input";
	
	inputObj.setAttribute("data-tk-kbdType", keyboardType);
	tk.setKeyboard(inputObj, transkey_isMultiCursor, false, true);
	this.name = inputObj.id;
	
	if(transkey[this.name]!=null){
		transkey[this.name].useTranskey = false;
		transkey[this.name].isCrt = true;
		transkey[this.name].fieldType = "password";
	}
	
	if (inputObj.addEventListener) {
		inputObj.addEventListener("click", function(e){
			var obj;
			if (e.type == "text" || e.type == "password") {
				obj = event;
			} else {
				e = e ? e : window.event;
				obj = e.target ? e.target : e.srcElement;
			}
			tk.onKeyboard(obj);}, false);
	} else if (inputObj.attachEvent) {
		inputObj.attachEvent("onclick", function(e){
			var obj;
			if (e.type == "text" || e.type == "password") {
				obj = event;
			} else {
				e = e ? e : window.event;
				obj = e.target ? e.target : e.srcElement;
			}
			tk.onKeyboard(obj);});
	}

	var divObj = inputObj.parentNode;
	if(document.getElementById(inputObj.id+"_button") == null) {
		var btn = document.createElement("span");
		btn.id = inputObj.id+"_button";
		var onClick = "transkey."+this.name+".buttonListener(this, \""+inputObj.id+"\")";
		var srcUrl = transkey_url+"/images/off.png";
		if(useCustomButton) {
			srcUrl = customOffButton;
		}
			
		var img = createImg(inputObj.id+"_toggle", "가상키보드실행버튼", null);
		img.src = srcUrl;
		img.style.cssText = "vertical-align:middle; cursor:pointer;";
		img.name = inputObj.id+"_toggle";
		img.border = 0;
		img.onclick = function(){
			onClick;
		}
		btn.appendChild(img);
		
		divObj.insertBefore(btn, inputObj.nextSibling);
		transkey[this.name].button = document.getElementById(inputObj.id+"_toggle");
		tk_btn_arr[btn.id]=inputObj.id;
		
		var isButton = false;
		
		for(var i = 0;i<divObj.childNodes.length;i++){
			if(divObj.childNodes[i].id == btn.id)
				isButton = true;
		}
		if(!isButton)
			divObj.insertBefore(btn, inputObj.nextSibling);
		
		transkey[this.name].button = document.getElementById(inputObj.id+"_toggle");
		tk_btn_arr[btn.id]=inputObj.id;
		
	}
	var obj = inputObj.form;
	if(obj==null)
		 obj = inputObj.parentNode;
	if(obj==null)
		 obj = document.body;
	
	if(document.getElementById("Tk_"+inputObj.id+"_check")==null) {
		var checkValue = document.createElement("input");
		checkValue.setAttribute("type", "hidden");
		checkValue.setAttribute("id", "Tk_"+inputObj.id+"_check");
		checkValue.setAttribute("name", "Tk_"+inputObj.id+"_check");
		checkValue.setAttribute("value", transkey[this.name].useTranskey?"transkey":"e2e");
		obj.appendChild(checkValue);
	}
	transkey[this.name].checkValue = checkValue;
	
	this.clear = function(){
		transkey[this.name].clear();
	};
	this.close = function(){
		tk.close();
	};
	this.getHiddenData = function(){
		return transkey[this.name].hidden.value;
	};
	
	this.getCipherData = function(xecureRandomData, crtType){
		if(crtType==null)
			crtType = "xecure";
		return transkey[this.name].getCipherData(xecureRandomData, crtType);
	};
	
	transkey[this.name].crtObj = this;
	
	transkey[this.name].done = function(){
		if(typeof tk.now.crtObj.onCompleteInput  != "undefined"){
			if(tk.now.keyboardType == "qwerty"){
				if (tk.now.crtObj.onCompleteInput () == false)
				{
					return false;
				}
			}else if(tk.now.keyboardType == "number"){
				if (tk.now.crtObj.onCompleteClose () == false)
				{
					return false;
				}
			}
		}
	};
	
	transkey[this.name].tk_btnOnClick = function(inputId){
		var id = inputId;
		if(transkey[id]!=null){
			transkey[id].useTranskey=true;
			tk.onKeyboard(transkey[id].inputObj);
			transkey[id].checkValue.value="transkey";
		}
	};
	
	transkey[this.name].buttonListener = function(btnObj, inputId){
		var obj = btnObj;
		var id = inputId;
		
		
		if(useCustomButton) {
			var isChecked = obj.src.substring(obj.src.length - customOffButton.length) == customOffButton; 
			obj.src = isChecked ? customOnButton : customOffButton; 
		} else {
			var isChecked = obj.src.substring(obj.src.length - 'off.png'.length) == 'off.png'; 
			obj.src = isChecked ? transkey_url+'/images/on.png' : transkey_url+'/images/off.png'; 
		}
		
		if(isChecked){
			transkey[id].useTranskey=true;
			transkey[id].inputObj.readOnly=true;
			transkey[id].clear();
			tk.onKeyboard(transkey[id].inputObj);
			transkey[id].checkValue.value="transkey";
		}else{
			transkey[id].clear();
			transkey[id].useTranskey=false;
			transkey[id].inputObj.readOnly=false;
			transkey[id].checkValue.value="e2e";
			if(tk.now!=null)
				tk.close();
		}
	};
	
	
	
	
}
function tk_contains(parent, child, deep)

{
    if (parent == child)
          return true;

    var items = parent.children;
    var count = items.length;

    for ( var i = 0; i < count; i++) {
          if (items[i] == child)
                 return true;
          if (deep == true && tk_contains(items[i], child, deep))
                 return true;
    }
    return false;
}

function checkTransKey(nsEvent) {

    var inputObj;

    if (nsEvent.type == "text" || nsEvent.type == "password") {
          inputObj = event;
    } else {
          nsEvent = nsEvent ? nsEvent : window.event;
          inputObj = nsEvent.target ? nsEvent.target : nsEvent.srcElement;
    }
    
    if(tk.now!=null){
    	if(tk.now.div.style.display=="block") {
	        var transkeyDiv = tk.now.div;
	        var transkeyObj = tk.now;
				
	        if(inputObj.tagName == "INPUT" && inputObj.id == transkeyObj.id) {
	        	tk.focusout(inputObj);
	        } else if (tk_contains(transkeyDiv, inputObj, true) == false) {
	        	if(tk.now.crtObj!=null){
	        		tk.now.crtObj.close();
	        	}else{
	        		tk.close();
	        	}
	        }
        }
    }
}

function checkCookie() {
	   var cookieEnabled;
	   if (document.all)
	       cookieEnabled = navigator.cookieEnabled;
	   else {
	       var cookieName = 'checkCookie' + (new Date().getTime());
	       document.cookie = cookieName + '=cookieValue';
	       cookieEnabled = document.cookie.indexOf(cookieName) != -1;
	       document.cookie = cookieName + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
	   }
	   if (!cookieEnabled){
		     tk_alert("브라우저에서 쿠키가 차단되어있습니다. 설정에서 쿠키를 허용해주세요.");
		   cookie_check_val = false;
	   }
}

function removeArray(arr, item) {
	if(!Array.prototype.indexOf) {
	    Array.prototype.indexOf = function(arg, i) {
	        i = i || 0;
	        var len = this.length;
	        while (i < len) {
	            if(this[i] === arg) return i;
	            ++i;
	        }
	        return -1;
	    };
	}
	
    var a = arguments;
    var len = a.length;
    var index;
    
    while (len > 1 && arr.length) {
    	item = a[--len];
        while ((index= arr.indexOf(item)) !== -1) {
            arr.splice(index, 1);
        }
    }
    
    return arr;
}

//chrome92로 alert => div로 변환(popup형식)
var alertCnt=0;
function getChromeVersion(){

	var userAgent = navigator.userAgent;
	var reg = null;
	var browser = {
	 name: null,
	 version: null
	 };
	userAgent = userAgent.toLowerCase();
	if(userAgent.indexOf("chrome")!= -1){
		reg = /chrome\/(\S+)/;
		browser.name = "Chrome";
		browser.version = reg.exec(userAgent)[1];		
		}
	else
		browser.version=null;
	return browser.version;
		
	}
	

function tk_alert(tk_popup_comment) {
	
	this.isiPad = navigator.userAgent.indexOf("iPad")>-1;
	this.isiPhone = navigator.userAgent.indexOf("iPhone")>-1;
	this.isAndroid = navigator.userAgent.indexOf("Android")>-1;
		
	if(this.isAndroid){
		var chromeVer = getChromeVersion();
		if(chromeVer!=null) {
			if(tkAlert.useDivAlert==true && chromeVer.split(".")[0] >= tkAlert.EngineVer)
				create_alert(tk_popup_comment);
			else
				alert(tk_popup_comment);
		} else {
			if(tkAlert.useDivAlert==true)
				create_alert(tk_popup_comment);
			else
				alert(tk_popup_comment);
		}
	}
	else{
		if(tkAlert.useDivAlert==true)
			create_alert(tk_popup_comment);
		else
			alert(tk_popup_comment);
	}
}

function create_alert(tk_popup_comment){
	   alertCnt++;
	   var div1 = document.getElementById("tk_alert")
	   if(!div1) {
	      div1 = document.createElement("DIV");
	      div1.id = "tk_alert";
	      div1.style.position = "absolute";
	      div1.style.height = document.body.clientHeight + 100 + "px";
	      div1.style.width = document.body.clientWidth + 100 + "px";
	      div1.style.top = "0";
	      div1.style.left = "0";
	      div1.style.opacity = "0.4";
	      div1.style.filter = "alpha(opacity=40)";
	   }

	   var div2 = document.createElement("DIV");      //글자 들어가는 부분(닫기)
	   div2.id = "tk_alert_popupmessage"+alertCnt;
	   
	   div2.style.cssText = "color:grey;width: 200px;z-index: 10001;border: 1px solid gray;border-radius: 11px;background: white;font-family:monospace; position: fixed; white-space:pre-wrap; word-break:break-all;";
	   
	   var div2_2 = document.createElement('div');
	   div2_2.style.cssText="margin: 5px;margin-top: 15px;";
	   
	   var btnSpan = document.createElement('span');
	   btnSpan.id="tk_LayerText1";
	   btnSpan.setAttribute("role", "button");
	   btnSpan.setAttribute("tabindex", 0);
	   btnSpan.ariaLabel = tk_popup_comment;
	   btnSpan.textContent = tk_popup_comment;
	   
	   div2_2.appendChild(btnSpan);
	   div2.appendChild(div2_2);
	   
	   var div2_3 = document.createElement('div');
	   div2_3.style.margin = "5px";
	   
	   var closeSpan = document.createElement('span');
	   closeSpan.id ="layerClose";
	   
	   var closeBtn = document.createElement("button");
	   closeBtn.style.cssText = "font-size: medium;background: #9d9d9d;border-radius: 15px;margin: 10px;height:30px;width: 80px;border: 3px solid #9d9d9d;font-family: monospace;";
	   closeBtn.setAttribute("role", "button");
	   closeBtn.setAttribute("tabindex", 0);
	   closeBtn.ariaLabel = "닫기";
	   closeBtn.textContent = "닫기";
	   closeBtn.onclick = function(){
		   tk_alertLayerClose();
	   }
	   
	   closeSpan.appendChild(closeBtn);
	   div2_3.appendChild(closeSpan);
	   div2.appendChild(div2_3);
	   
	   var div3 = document.createElement("DIV");
	   div3.id = "tk_alert_popup"+alertCnt;
	   div3.style.cssText = "position:absolute;  display: table-cell;text-align: center; vertical-align: middle; color: white;z-index: 10000;";  
	   div3.appendChild(div2);

	   document.body.appendChild(div1);
	   document.body.appendChild(div3);
	   
	   setTimeout(function(){
	   	div2.firstChild.firstChild.focus();
	   },100);
	   
	   tk_alertLayerResize();
	   disableScrolling();
	   window.onresize = function(event) {
	      tk_alertLayerResize();
	   };
	}


function tk_alertLayerResize() {
	var div2 = document.getElementById("tk_alert_popup"+alertCnt);
	for(var i=0; i<=alertCnt; i++) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
		var div2 = document.getElementById("tk_alert_popup"+i);
	   if (div2) {
		   div2.style.top = (window.innerHeight / 2) - (div2.children[0].clientHeight / 2) + "px";
	       div2.style.left = (window.innerWidth / 2) - (div2.children[0].clientWidth / 2) + "px";
	   }
	}
}

function tk_alertLayerClose() {
                                                                                                                                                                                                                                                                                                                                                                                                                          
	var div1 = document.getElementById("tk_alert");
	var div2 = document.getElementById("tk_alert_popup"+alertCnt);

	if(alertCnt>1){		
		document.body.removeChild(div2); 
	      }
	else{
    	document.body.removeChild(div2); 
    	document.body.removeChild(div1);
    	enableScrolling();
	    }
	alertCnt--; 
}

function disableScrolling(){
	document.body.style.overflow = "hidden";
}
function enableScrolling(){
	document.body.style.overflow = "auto";
}

function Key() {
	this.name = "";
	this.npoints = 0;
	this.xpoints = new Array();
	this.ypoints = new Array();
	this.addPoint = function(x, y) {
		this.npoints++;
		this.xpoints.push(x);
		this.ypoints.push(y);
	};

	this.contains = function(x, y) {
		var hits = 0;
		var lastx = this.xpoints[this.npoints - 1];
		var lasty = this.ypoints[this.npoints - 1];
		var curx = 0;
		var cury = 0;
		for ( var i = 0; i < this.npoints; lastx = curx, lasty = cury, i++) {
			curx = this.xpoints[i];
			cury = this.ypoints[i];
			if (cury == lasty) {
				continue;
			}
			var leftx = 0;
			if (curx < lastx) {
				if (x >= lastx) {
					continue;
				}
				leftx = curx;
			} else {
				if (x >= curx) {
					continue;
				}
				leftx = lastx;
			}

			var test1 = 0;
			var test2 = 0;
			if (cury < lasty) {
				if (y < cury || y >= lasty) {
					continue;
				}
				if (x < leftx) {
					hits++;
					continue;
				}
				test1 = x - curx;
				test2 = y - cury;
			} else {
				if (y < lasty || y >= cury) {
					continue;
				}
				if (x < leftx) {
					hits++;
					continue;
				}
				test1 = x - lastx;
				test2 = y - lasty;
			}
			if (test1 < (test2 / (lasty - cury) * (lastx - curx))) {
				hits++;
			}
		}
		return ((hits & 1) != 0);
	};
}

function createDiv(id, classNm){
	var div = document.createElement('div');
	if(id != null) div.id = id;
	if(classNm != null) div.className = classNm;

	return div;
}

function createA(id, classNm, innerText){
	var a = document.createElement('a');
	if(useCSP) {
		a.href="#none";
	}else {
		a.href="javascript:;";		
	}
	if(id != null) a.id = id;
	if(classNm != null) a.className = classNm;
	a.setAttribute('role', 'button');
	a.setAttribute('tabIndex', '0');
	a.textContent = innerText;
	return a;
}

function createIframe(id){
	var iframe = document.createElement('iframe');
	iframe.id=id+"_block";
	iframe.title="가상키보드";
	iframe.style.cssText = "z-index:-1; position:absolute; visibility: hidden; left: 0px; top: 0px; width: 100%; height: 100%;";
	iframe.frameBorder = "10";
	return iframe;
}

function createImgDiv(id, classNm, imgId, alt, src){
	var div = createDiv(id, classNm);
	var img = createImg(imgId, alt, src);
	div.appendChild(img);
	return div;
}

function createImg(id, alt, src){
	var img = document.createElement('img');
	if(id != null) img.id = id;
	if(alt != null) img.alt = alt;
	if(src != null) img.src = transkey_url + src;
	return img;
}
