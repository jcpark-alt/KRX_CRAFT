/*Create transkey_config.js by TranskeySupporter
2024-03-11*/

var transkey_url = '/cm/cert/vendor/transkey';
//var transkey_surl = '/api/transkeyServlet'; 추후 상대경로가 api 추가 될 경우
// 서버의 raon.transkey.url-mappings(= ${app.api.prefix}/vendor/raon/transkey-servlet)와 같은 값이어야 한다.
// app.api.prefix 를 바꾸면 이 값도 함께 고칠 것.
var transkey_surl = '/api/discls/vendor/raon/transkey-servlet';
var transkey_apiurl = '/transkey/api/';
var transkey_delimiter = '$';
var transkey_encDelimiter = ',';
var keyboardLayouts = ["qwerty", "number"];
var tk_blankEvent = "onmouseover";

//function config
var useCheckTranskey = true;
var useAsyncTranskey = false;
var transkey_apiuse = false;
var transkey_isMultiCursor = true;
var transkey_isDraggable = true;
var tk_useButton = false;
var tk_useTranskey = true;
var onKeyboard_allocate = false;
var use_form_id = false;
var useCSP = false;
var isNode = false;
var useRefocus = true;
var useSha2 = true;
var useBizSha2 = false;

//cors
var useCORS = false;
var tk_origin = "";

//ui
var showLicense = true;
var tkAlert = {};
tkAlert.useDivAlert = false;
tkAlert.EngineVer = 93;
var useCustomButton = false;
var customOnButton = "";
var customOffButton = "";

//SHA-256 Hash Value for check keyboard version
var setQwertyHash = "c9aca3c8dd5f45959ab7d335c42605b24515b5a2b844da6eb54b2ba6397cb7f5";
var setNumberHash = "264051901014bb0062c359efd18a4eaac869d5ab84811714f0f11c0bf476c674";
