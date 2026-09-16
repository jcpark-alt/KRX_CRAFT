/**
 * 공동인증서(INISAFE Sign) 전자서명 호출 공통 래퍼.
 *
 * - 모듈 초기화(cwModuleInstallWaitWithNoPopup)는 이 파일이 하지 않는다. WebSquare 공통 $c.cert.initModule 이
 *   화면 로딩 시점에 호출한다(2026-09-16: 매 페이지 로드마다 토스트를 띄우고 다른 onload 핸들러를 덮어쓰던
 *   window.onload 블록을 제거). 진행 안내는 $c.cert.loadModule({ onStatus }) 로 화면이 표시한다.
 * - 이 파일은 config.xml engine 모듈로 셸이 정적 로드한다(transkey → crosswebex6 → initech-common 순서).
 * - jQuery 는 셸의 전역 $ 를 사용한다($.ajax 만 쓴다).
 */

/** 인증 요청 URL */
var sendFormUrl = "";

/** 인증 완료 후 호출할 Callback 함수 */
var sendFormCallBackFn;

/** 전자서명과 함께 전송할 추가 파라미터 ({파라미터명: 값} 형태, 없으면 null) */
var sendFormParams = null;

/**
 * 공동인증서 인증을 시작한다.
 *
 * @param sendUrl 공동인증서 인증 요청 URL
 * @param callBackFn 인증 완료 후 실행할 Callback 함수
 * @param options 인증서 팝업 옵션(선택)
 */
function fnInitechAuth(sendUrl, callBackFn, options){
    fnInitechAuthWithParams(sendUrl, null, callBackFn, options);
}

/**
 * 화면 입력값을 함께 보내는 공동인증서 인증을 시작한다.
 *
 * 전자서명 데이터(PKCS7SignedData)와 같은 요청에 params 의 항목들이 함께 전송된다.
 *
 * <pre>
 * fnInitechAuthWithParams(url, { comNm : "한국거래소", regNm : "홍길동" }, callback);
 * </pre>
 *
 * @param sendUrl 공동인증서 인증 요청 URL
 * @param params 함께 전송할 파라미터 ({파라미터명: 값} 형태, 없으면 null)
 * @param callBackFn 인증 완료 후 실행할 Callback 함수
 * @param options 인증서 팝업 옵션(선택)
 */
function fnInitechAuthWithParams(sendUrl, params, callBackFn, options){
    sendFormUrl = sendUrl;
    sendFormParams = params;
    sendFormCallBackFn = callBackFn;
    fnInitechAuthOpenPopup(options);
}

/**
 * 공동인증서 선택 팝업을 호출한다.
 *
 * 인증서 필터, UI 타입, 언어 등의 옵션을 설정한 후
 * INIWEBEX 로그인 모듈을 실행한다.
 */
function fnInitechAuthOpenPopup(options){

    options = options || {};

    // 기본 옵션
    var defaultOptions = {
        isHtml5: true,
        issuerDNFilter: false,
        OIDAliasFilter: false,
        vid: false,
        loginType: "sign",
        data: "login",
        processCallback: sendForm,
        viewType: "NONE",
        iniCache: true,
        langType: "KOR",
        issuerDN:
            "IssuerDN=CN=yessignCA Class 1,OU=AccreditedCA,O=yessign,C=kr|" +
            "IssuerDN=CN=yessignCA Class 2,OU=AccreditedCA,O=yessign,C=kr|" +
            "IssuerDN=CN=yessignCA-Test Class 3,OU=AccreditedCA,O=yessign,C=kr",
        OIDAlias:
            "a1|a2|a4|a5|b1|b2|b4|c1|c2|d1|d2|d4|e1|e2|e4|f2|f3|f4|p1",
        OUFilter: false,
        OUList: "personalB|corporation4ECB"
    };

    // 전달받은 옵션이 있으면 기본 옵션을 덮어쓴다
    var config = Object.assign({}, defaultOptions, options);

    // 공동인증서 로그인 팝업 실행
    INIWEBEX.login({

        // 로그인 방식
        loginType : config.loginType,

        // 전자서명 원문
        data : config.data,

        // 전자서명 완료 후 Callback
        processCallback : config.processCallback,

        // HTML5 UI 사용 여부
        isHtml5 : config.isHtml5,

        // 원문 표시 방식
        viewType : config.viewType,

        // 인증서 캐시 사용
        iniCache : config.iniCache,

        // VID 사용 여부
        vid : config.vid,

        // 언어
        langType : config.langType,

        // IssuerDN 필터
        filterCertByIssuer : {
            enable : config.issuerDNFilter,
            list : config.issuerDN
        },

        // OID Alias 필터
        filterCertByOIDAlias : {
            enable : config.OIDAliasFilter,
            list : config.OIDAlias
        },

        // OU 필터
        filterCertByOU : {
            enable : config.OUFilter,
            list : config.OUList
        }

    });

}

/**
 * 공동인증서 전자서명 완료 후 호출되는 Callback 함수
 *
 * @param result PKCS#7 전자서명 데이터
 * @param postData 이니텍에서 전달하는 추가 데이터(현재 미사용)
 */
function sendForm(result, postData){

    console.log(result);

    // 전자서명 실패
    if (!result) {

        if (INI_ALERT) {
            INI_ALERT("전자서명에 실패하였습니다.");
        } else {
            alert("전자서명에 실패하였습니다.");
        }

        return;
    }

    // 서버 전송용 FormData 생성
    const formData = new FormData();

    // PKCS#7 전자서명 데이터 추가
    formData.append("PKCS7SignedData", result);

    // 주민등록번호가 필요한 경우 추가 전송
    // formData.append("juminNO", "");

    // 화면에서 전달한 추가 파라미터를 같은 요청에 담는다 (fnInitechAuthWithParams)
    if (sendFormParams) {
        Object.keys(sendFormParams).forEach(function (key) {
            formData.append(key, sendFormParams[key]);
        });
    }

    // 공동인증서 로그인 요청
    $.ajax({

        url: sendFormUrl,

        type: "POST",

        data: formData,

        // FormData 그대로 전송
        processData: false,

        contentType: false,

        // 인증 성공
        success: function(res) {

            console.log(res);

            // 호출한 화면으로 결과 전달
            sendFormCallBackFn(res);

        },

        // 인증 실패
        error: function(xhr) {

            console.error(xhr);

            const message = xhr.responseJSON?.message || "공동인증서 로그인에 실패하였습니다.";

            // INI_ALERT 은 이니텍에서 제공하는 레이어팝업 메세지창
            if (INI_ALERT) {
                INI_ALERT(message);
            } else {
                alert(message);
            }

        }

    });

}