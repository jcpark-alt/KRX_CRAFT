/**
 * RAON TransKey 암호화 데이터를 서버로 전송하여 복호화 요청을 수행한다.
 *
 * 전달받은 입력 필드(id)들의 암호화 정보(hidden, hmac, keyboardType,
 * keyIndex, fieldType, ExE2E 등)를 수집한 후, seedKey 및 초기화 정보를
 * 함께 서버에 전송한다.
 *
 * 서버에서 복호화된 결과(JSON)를 반환하면 callback 함수를 호출한다.
 *
 * @param {string} url
 *        복호화 요청을 처리할 서버 URL
 *
 * @param {Function} callback
 *        서버 응답(JSON)을 전달받아 처리할 콜백 함수
 *
 * @param {...string} ids
 *        TransKey가 적용된 input 요소의 id 목록
 *
 * @example
 * raonTranskeyDecode(
 *     "/api/common/transkey/decode",
 *     "callbackFuntion 이름"
 *     "userId",
 *     "password"
 * );
 */
function raonTranskeyDataSand(url, callback, ...ids) {

    // Form ID 사용 여부에 따라 suffix 생성
    var frmId = use_form_id ? "_" + document.getElementById("hidfrmId").value : "";
    var params = [];

    // 전달받은 모든 입력 필드의 암호화 데이터 수집
    ids.forEach(function(id) {

        var input = document.getElementById(id);
        var values = tk.inputFillEncData(input);

        // 복호화 대상 ID
        params.push("ids=" + encodeURIComponent(id));

        // TransKey 암호화 데이터
        params.push("transkey_" + id + "_" + frmId + "=" + encodeURIComponent(values.hidden));

        // HMAC 검증 데이터
        params.push("transkey_HM_" + id + "_" + frmId + "=" + encodeURIComponent(values.hmac));

        // 키보드 타입
        params.push("keyboardType_" + id + "_" + frmId + "=" + encodeURIComponent(transkey[id].keyboard));

        // 키 인덱스
        params.push("keyIndex_" + id + "_" + frmId + "=" + encodeURIComponent(transkey[id].keyIndex));

        // 입력 필드 타입
        params.push("fieldType_" + id + "_" + frmId + "=" + encodeURIComponent(transkey[id].fieldType));

        // ExE2E 사용 시 추가 정보 전송
        if (transkey[id].exE2E != "false") {
            params.push("transkey_ExE2E_" + id + "_" + frmId + "=" + encodeURIComponent(transkey[id].exE2E));
        }
    });

    // TransKey 복호화에 필요한 공통 정보
    params.push("seedKey_" + frmId + "=" + encodeURIComponent(document.getElementById("seedKey" + frmId).value));
    params.push("initTime_" + frmId + "=" + encodeURIComponent(initTime));
    params.push("hidfrmId=" + encodeURIComponent(frmId));

    // 복호화 요청
    $.ajax({
        url: url,
        type: "POST",
        data: params.join("&"),
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        dataType: "json",

        // 복호화 성공 시 콜백 실행
        success: function(jsonData) {
            if (typeof callback === "function") {
                callback(jsonData);
            }
        },

        // 요청 실패
        error: function(xhr, status, error) {
            console.error("raonTranskeyDecode error:", status, error);
            alert("요청을 실패했습니다.");
        }
    });

}