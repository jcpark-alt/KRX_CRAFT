# -*- coding: utf-8 -*-
"""Stage 2 수작업 A 축(2026-10-02) — 규칙 하나로 닫히는 공급사 pcc 의존을 기계로 접는다. vendor_postprocess.apply_regions 가 부른다.

  V27 `$c.frame.CreateDialogFrame(id, url, title, {width, height}, {})`(공급사 5인자 꼴 — convert 규칙 17 은 as-is 8인자만)
      → `$c.win.openPopup(url, { id, type: "pageFramePopup", title, width, height }, {})`. url 이 공급사 드러냄 IIFE(.xml 검사 throw)면 그대로 둔다.
      await·async 는 컨벤션 단계(openPopup 은 gcc async).
  V28 `$c.fil.doLogSave(…);` 문장(접속 로그 저장 — 운영 필요 여부는 공급사 회신 ㉤ 미결) → 블록 주석 + TODO. 호출은 지우지 않고 보류.
  V29 공급사 pcc 함수 → 화면 로컬 헬퍼(번들 정의를 그대로 옮김, pcc/fil 반입 후보)
      fn_getMktId → getMktId(as-is 전역 js_market · 서버 렌더 값, TODO) · fn_getSecuGrpNm → getSecuGrpNm(증권그룹 코드표) ·
      showObj → showObj(id 또는 컴포넌트) · FillGridHeaderTotalCnt → showTotalCount(총건수 표시) · fn_getModalCenterPos → getModalCenterPos
  V30 `$c.cm.*`(as-is fil/common.xml 정의, 저장소 pcc/fil 미반입) → 화면 로컬 헬퍼 또는 인라인
      fn_ClickPeriod(폼, type) → setSearchPeriod(type) · fn_SetPeriod(폼, s, e) → setPeriodDates(s, e) · fn_CheckDateGn → checkDateParts ·
      fn_ChkZipCd → isZipCodeInput · fn_CheckByte → checkByteLimit(+getByteLength2·truncateByBytes) · fn_CalcContn → truncateByBytes ·
      isMinusNum → isMinusNumber · fn_ChkNoneNum → checkNotOnlyNumber · fn_ChkAlphaNum → checkAlphaNum · fn_IsChecked → isGroupChecked ·
      fn_IsNull(obj, msg) → checkRequired(obj, msg) · fn_IgnoreSpaces(x) → String(x).replace(/\\s/g, "") · fn_ChkContactpnt(x) → /^[0-9-]*$/.test(x)
      (fn_getFileSize 는 IE ActiveX 전용이라 못 옮긴다 — TODO 유지)
  V31 `init_recvParam` 이 공급사 스텁(「전환 파라미터 수신 대상 없음: dma_pageContext — 읽는 자리 0」)이면 head 에 `dma_pageContext`
      dataMap 을 넣고 표준 수신(`dma_pageContext.setJSON($c.data.getParameter() ?? {})`)으로 — 나머지 1,036화면과 같은 꼴.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402
import convert as cv  # noqa: E402
import dom_rules  # noqa: E402


# ---------------------------------------------------------------- 공통
def _balanced(text, open_pos):
    d, i, n = 0, open_pos, len(text)
    while i < n:
        ch = text[i]
        if ch in "\"'`":
            q = ch; i += 1
            while i < n and text[i] != q:
                i += 2 if text[i] == "\\" else 1
        elif ch == "(":
            d += 1
        elif ch == ")":
            d -= 1
            if d == 0:
                return i
        i += 1
    return -1


def _split_args(s):
    out, d, cur, i, n = [], 0, [], 0, len(s)
    while i < n:
        ch = s[i]
        if ch in "\"'`":
            q = ch; j = i + 1
            while j < n and s[j] != q:
                j += 2 if s[j] == "\\" else 1
            cur.append(s[i:j + 1]); i = j + 1; continue
        if ch in "([{":
            d += 1
        elif ch in ")]}":
            d -= 1
        if ch == "," and d == 0:
            out.append("".join(cur).strip()); cur = []
        else:
            cur.append(ch)
        i += 1
    if cur or out:
        out.append("".join(cur).strip())
    return out


def _replace_calls(script, pattern, make):
    """pattern(…`(` 로 끝남) 의 코드 영역 매치마다 인자 목록을 잡아 make(args, m) 로 치환. None 반환이면 그대로."""
    out, pos, n = [], 0, 0
    mask = cv.code_mask(script)
    for m in re.finditer(pattern, script):
        if m.start() < pos or not mask[m.start()]:
            continue
        cl = _balanced(script, m.end() - 1)
        if cl < 0:
            continue
        rep = make(_split_args(script[m.end():cl]), m)
        if rep is None:
            continue
        out.append(script[pos:m.start()]); out.append(rep); pos = cl + 1; n += 1
    out.append(script[pos:])
    return "".join(out), n


def _append_helpers(script, names, table):
    for name in names:
        if not re.search(r'(?m)^scwin\.%s\s*=' % name, script):
            m5 = re.search(r'(?m)^///////// 5\. [^\n]*\n', script)
            script = script.rstrip("\n") + ("\n\n" if m5 else "\n\n///////// 5. 일반/업무 함수 영역 /////////\n\n") + table[name]
    return script


def _popup_dim(a):
    a = a.strip()
    return '"%spx"' % a if re.fullmatch(r'\d+', a) else a


# ---------------------------------------------------------------- V27
def create_dialog_frame(script):
    need_cb = [False]

    def make(args, m):
        if len(args) == 8:
            # as-is 8인자 꼴인데 url 이 비리터럴(공급사 IIFE)이라 규칙 17 이 건너뛴 자리 — id 는 첫 인자, type "window" 는 browserPopup(콜백 수신)
            pid, url, title, _l, _t, w, h, ptype = args
            lit = re.fullmatch(r'''(["'])([\s\S]*)\1''', pid.strip())
            popup_id = (lit.group(2) if lit and lit.group(2) else None) or "popup"
            if ptype.strip() in ('"window"', "'window'"):
                need_cb[0] = True
                return ('$c.win.openPopup(%s, { id: "%s", type: "browserPopup", title: %s, width: %s, height: %s, callbackFn: "scwin.popupCallback" })'
                        % (url, popup_id, title, _popup_dim(w), _popup_dim(h)))
            return ('$c.win.openPopup(%s, { id: "%s", type: "pageFramePopup", title: %s, width: %s, height: %s }, {})'
                    % (url, popup_id, title, _popup_dim(w), _popup_dim(h)))
        if len(args) != 5:
            return None
        pid, url, title, opts, data = args
        om = re.search(r'width\s*:\s*([^,}]+)', opts); hm = re.search(r'height\s*:\s*([^,}]+)', opts)
        if not om or not hm:
            return None
        lit = re.fullmatch(r'''(["'])([\s\S]*)\1''', pid.strip())
        popup_id = lit.group(2) if lit and lit.group(2) else None
        if not popup_id:
            ul = re.fullmatch(r'''(["'])([\s\S]*)\1''', url.strip())
            popup_id = re.split(r'[\\/]', ul.group(2))[-1].rsplit(".", 1)[0] if ul else "popup"
        return ('$c.win.openPopup(%s, { id: "%s", type: "pageFramePopup", title: %s, width: %s, height: %s }, %s)'
                % (url, popup_id, title, _popup_dim(om.group(1)), _popup_dim(hm.group(1)), data or "{}"))
    # `$c.frame.Provider("/top"|"../").CreateDialogFrame(…)` — 다른 프레임에서 열던 팝업도 같은 openPopup(현재 창 기준)으로 연다
    script, n1 = _replace_calls(script, r'\$c\.frame\.CreateDialogFrame\(', make)
    script, n2 = _replace_calls(script, r'''\$c\.frame\.Provider\(["'](?:/top|\.\./(?:\.\./)*)["']\)\.CreateDialogFrame\(''', make)
    if need_cb[0] and not re.search(r'(?m)^scwin\.popupCallback\s*=', script):
        script = _append_helpers(script, ["popupCallback"], {"popupCallback": POPUP_CALLBACK})
    return script, n1 + n2


POPUP_CALLBACK = '''/**
 * @method
 * @name popupCallback
 * @description browserPopup 팝업의 결과 수신 콜백(규칙 17 수신 규약 — browserPopup 은 await 가 아니라 콜백으로 받는다)
 * @param {String|Number|Object} arg 팝업이 넘긴 값
 * @returns {void}
 * @hidden N
 */
scwin.popupCallback = function (arg) {
    // TODO Stage2: 팝업 결과(arg) 처리 — as-is 는 별도 창(window)이라 결과를 받지 않았다
};
'''


# ---------------------------------------------------------------- V28
def hold_log_save(script):
    """V28 `$c.fil.doLogSave(...)` 접속 로그 저장 문장 삭제 — 사용자 결정(2026-10-06): 사용하지 않는 코드. 종전(2026-10-02~)에는 운영 필요 여부 회신 ㉤ 까지
    블록 주석으로 보류했다. 이미 보류 주석으로 접힌 줄도 함께 지운다."""
    n = 0
    lines = script.split("\n")
    mask_all = cv.code_mask(script)
    pos = 0
    keep = []
    for l in lines:
        s = l.strip()
        is_code_call = s.startswith("$c.fil.doLogSave(") and s.endswith(";") and mask_all[pos + len(l) - len(l.lstrip())]
        is_held = s.startswith("/* TODO Stage2: 접속 로그 저장 보류(공급사 doLogSave") and s.endswith("*/")
        pos += len(l) + 1
        if is_code_call or is_held:
            n += 1
            continue
        keep.append(l)
    return "\n".join(keep), n


# ---------------------------------------------------------------- V29 / V30 헬퍼 본문
HELPERS = {
    "getFieldName": '''/**
 * @method
 * @name getFieldName
 * @description 알림 문구에 쓸 항목명 — 컴포넌트 title(as-is alt) 이 없으면 id
 * @param {Object} comp 입력 컴포넌트
 * @returns {String} 항목명
 * @hidden N
 */
scwin.getFieldName = function (comp) {
    return (comp && typeof comp.getTitle === "function" && comp.getTitle()) || (comp && comp.getID && comp.getID()) || "";
};
''',
    "getMktId": '''/**
 * @method
 * @name getMktId
 * @description 시장 ID — as-is 전역 js_market(서버가 렌더 때 넣던 값)을 읽는다
 * @returns {String} 시장 ID(없으면 빈 문자열)
 * @hidden N
 */
scwin.getMktId = function () {
    // TODO Stage2: 컨텍스트 키 출처 미확인(as-is 전역 js_market · 회신 A-3) — 서버 응답/세션에서 받도록 연결
    return (typeof js_market !== "undefined" && js_market != null) ? String(js_market) : "";
};
''',
    "getSecuGrpNm": '''/**
 * @method
 * @name getSecuGrpNm
 * @description 증권그룹 ID → 증권그룹명(as-is 공통 fn_getSecuGrpNm 코드표 · pcc/fil 반입 후보)
 * @param {String} sid 증권그룹 ID
 * @returns {String} 증권그룹명(없으면 빈 문자열)
 * @hidden N
 */
scwin.getSecuGrpNm = function (sid) {
    const names = { ST: "주권", MF: "투자", RT: "부동산투자", SC: "선박투자", IF: "사회간접자본투융자회사", DR: "주식예탁증서",
                    SW: "신주인수권증권", SR: "신주인수권증서", EW: "ELW", EF: "ETF", BC: "수익증권", FE: "외국ETF", FS: "외국주권" };
    return names[sid] || "";
};
''',
    "showObj": '''/**
 * @method
 * @name showObj
 * @description 컴포넌트 표시/숨김(as-is 공통 showObj — id 문자열 또는 컴포넌트)
 * @param {String|Object} obj 컴포넌트 id 또는 컴포넌트
 * @param {Boolean} flag true 표시 · false 숨김
 * @returns {void}
 * @hidden N
 */
scwin.showObj = function (obj, flag) {
    const comp = (typeof obj === "string") ? $c.util.getComponent(obj) : obj;
    if (!comp) { return; }
    if (flag) { comp.show(); } else { comp.hide(); }
};
''',
    "showTotalCount": '''/**
 * @method
 * @name showTotalCount
 * @description 목록 총건수 표시(as-is 공통 FillGridHeaderTotalCnt — 패널 안에 「총건수: N」)
 * @param {Number|String} count 건수
 * @param {String|Object} panel 표시할 그룹 id 또는 컴포넌트
 * @returns {void}
 * @hidden N
 */
scwin.showTotalCount = function (count, panel) {
    const comp = (typeof panel === "string") ? $c.util.getComponent(panel) : panel;
    if (comp && comp.render) {
        comp.render.innerHTML = '<span class="count">총건수: <strong>' + $c.num.formatNumber(count) + "</strong></span>";
    }
};
''',
    "getModalCenterPos": '''/**
 * @method
 * @name getModalCenterPos
 * @description 모달 창을 화면 중앙에 놓을 좌표(as-is 공통 fn_getModalCenterPos)
 * @param {Object} opnFrm 여는 창(window)
 * @param {Number} frmWth 창 너비
 * @param {Number} frmHgt 창 높이
 * @returns {Object} { x, y }
 * @hidden N
 */
scwin.getModalCenterPos = function (opnFrm, frmWth, frmHgt) {
    return { x: window.screen.width / 2 - opnFrm.screenLeft - frmWth / 2, y: window.screen.height / 2 - opnFrm.screenTop - frmHgt / 2 };
};
''',
    "setSearchPeriod": '''/**
 * @method
 * @name setSearchPeriod
 * @description 조회 기간 버튼 — 오늘을 종료일로, 구분에 따라 시작일을 계산해 넣고 조회(as-is 공통 fn_ClickPeriod)
 * @param {Number} type 1 1주 · 2 1개월 · 3 3개월 · 4 6개월 · 5 1년 · 6 2년 · 7 3년
 * @returns {Promise<void>}
 * @hidden N
 */
scwin.setSearchPeriod = async function (type) {
    const edate = $c.date.getServerDateTime("yyyyMMdd");
    const offsets = { 1: ["addDate", -7], 2: ["addMonth", -1], 3: ["addMonth", -3], 4: ["addMonth", -6], 5: ["addYear", -1], 6: ["addYear", -2], 7: ["addYear", -3] };
    const o = offsets[Number(type)];
    const sdate = o ? $c.date[o[0]](edate, o[1]) : edate;
    await scwin.setPeriodDates(sdate, edate);
};
''',
    "setPeriodDates": '''/**
 * @method
 * @name setPeriodDates
 * @description 조회 기간(시작일·종료일)을 달력에 넣고 바로 조회(as-is 공통 fn_SetPeriod → fn_Search)
 * @param {String} sdate 시작일(yyyyMMdd)
 * @param {String} edate 종료일(yyyyMMdd)
 * @returns {Promise<void>}
 * @hidden N
 */
scwin.setPeriodDates = async function (sdate, edate) {
    $c.util.getComponent("cal_sdate").setValue(sdate);
    $c.util.getComponent("cal_edate").setValue(edate);
    await scwin.search();
};
''',
    "checkDateParts": '''/**
 * @method
 * @name checkDateParts
 * @description 년·월·일 입력칸 3개로 나뉜 날짜 검사(as-is 공통 fn_CheckDateGn — 공백 제거·숫자·월/일 범위, 실패 시 알림+포커스)
 * @param {Object} yyyy 년 입력 컴포넌트
 * @param {Object} mm 월 입력 컴포넌트
 * @param {Object} dd 일 입력 컴포넌트
 * @param {Boolean} flag true 면 빈 값도 검사
 * @returns {Promise<Boolean>} 유효하면 true(빈 값·flag 없음이면 undefined — as-is 동일)
 * @hidden N
 */
scwin.checkDateParts = async function (yyyy, mm, dd, flag) {
    [yyyy, mm, dd].forEach(function (c) { c.setValue($c.str.trim(String(c.getValue() ?? ""))); });
    const ymd = yyyy.getValue() + mm.getValue() + dd.getValue();
    if (yyyy.getValue() === "" || yyyy.getValue().length < 4) { await $c.win.alert("년을 제대로 입력해주세요."); yyyy.focus(); return false; }
    if (ymd === "" && !flag) { return; }
    for (const c of [yyyy, mm, dd]) {
        if (!/^\\d*$/.test(String(c.getValue()).replace(/\\s/g, ""))) { await $c.win.alert("숫자만 입력하셔야 합니다."); c.focus(); return false; }
    }
    const year = Number(yyyy.getValue()), month = Number(mm.getValue()), day = Number(dd.getValue());
    if (month < 1 || month > 12) { await $c.win.alert("존재하지 않는 월입니다."); mm.focus(); return false; }
    if (year <= 0) { await $c.win.alert("존재하지 않는 년도입니다."); dd.focus(); return false; }
    if (day > new Date(year, month, 0).getDate()) { await $c.win.alert("존재하지 않는 날짜입니다."); dd.focus(); return false; }
    return true;
};
''',
    "isZipCodeInput": '''/**
 * @method
 * @name isZipCodeInput
 * @description 우편번호 입력 검사 — 공백·'-' 를 뺀 나머지가 숫자만인지(as-is 공통 fn_ChkZipCd, 아니면 포커스)
 * @param {Object} comp 입력 컴포넌트
 * @returns {Boolean} 숫자만이면 true
 * @hidden N
 */
scwin.isZipCodeInput = function (comp) {
    if (!comp || typeof comp.getValue !== "function") { return true; }
    const v = String(comp.getValue() ?? "").replace(/\\s/g, "").replace("-", "");
    if (!/^\\d*$/.test(v)) { comp.focus(); return false; }
    return true;
};
''',
    "getByteLength2": '''/**
 * @method
 * @name getByteLength2
 * @description 바이트 수(as-is 공통 fn_GetByte 계산 — 한글 2byte · 줄바꿈 2byte · 그 밖 1byte)
 * @param {String} value 문자열
 * @returns {Number} 바이트 수
 * @hidden N
 */
scwin.getByteLength2 = function (value) {
    const s = String(value ?? "");
    let n = 0;
    for (let i = 0; i < s.length; i++) {
        const ch = s.charAt(i);
        n += (ch === "\\n" || ch.charCodeAt(0) > 127) ? 2 : 1;
    }
    return n;
};
''',
    "truncateByBytes": '''/**
 * @method
 * @name truncateByBytes
 * @description 바이트 상한을 넘는 뒷부분을 잘라낸다(as-is 공통 fn_CalcContn 계산 — 한글 2 · '<' '>' 4 · 줄바꿈 1)
 * @param {String} value 문자열
 * @param {Number} maximum 바이트 상한
 * @returns {String} 잘린 문자열
 * @hidden N
 */
scwin.truncateByBytes = function (value, maximum) {
    const s = String(value ?? "");
    let out = "", bytes = 0;
    for (let i = 0; i < s.length; i++) {
        const ch = s.charAt(i);
        let inc = 1;
        if (ch === "\\n") { inc = (s.charAt(i - 1) !== "\\r") ? 1 : 0; }
        else if (ch.charCodeAt(0) > 127) { inc = 2; }
        else if (ch === "<" || ch === ">") { inc = 4; }
        bytes += inc;
        if (bytes > Number(maximum)) { break; }
        out += ch;
    }
    return out;
};
''',
    "checkByteLimit": '''/**
 * @method
 * @name checkByteLimit
 * @description 입력 바이트 상한 검사 — 카운터 표시, 초과분은 알린 뒤 자동 삭제(as-is 공통 fn_CheckByte)
 * @param {Object} comp 입력 컴포넌트
 * @param {Number|String} standardByte 바이트 상한
 * @param {String} counterId 카운터 표시 컴포넌트 id
 * @returns {Promise<void>}
 * @hidden N
 */
scwin.checkByteLimit = async function (comp, standardByte, counterId) {
    const limit = Number(standardByte);
    let bytes = scwin.getByteLength2(comp.getValue());
    if (bytes > limit) {
        await $c.win.alert((bytes - limit) + "바이트가 초과되었습니다. 초과된 내용은 자동삭제됩니다.");
        comp.setValue(scwin.truncateByBytes(comp.getValue(), limit));
        bytes = scwin.getByteLength2(comp.getValue());
    }
    const counter = $c.util.getComponent(counterId);
    if (counter) { counter.setValue("(" + bytes + "/" + limit + " byte)"); }
};
''',
    "isMinusNumber": '''/**
 * @method
 * @name isMinusNumber
 * @description 음수를 포함한 숫자 문자열인지(as-is 공통 isMinusNum — 첫 글자 숫자·'-'·'.', 나머지 숫자·'.')
 * @param {String} value 문자열
 * @returns {Boolean}
 * @hidden N
 */
scwin.isMinusNumber = function (value) {
    return /^[-0-9.][0-9.]*$/.test(String(value ?? ""));
};
''',
    "checkNotOnlyNumber": '''/**
 * @method
 * @name checkNotOnlyNumber
 * @description 숫자만으로 된 입력을 거부(as-is 공통 fn_ChkNoneNum — 알림·값 삭제·포커스)
 * @param {Object} comp 입력 컴포넌트
 * @returns {Promise<Boolean>} 통과면 true
 * @hidden N
 */
scwin.checkNotOnlyNumber = async function (comp) {
    if (/^\\d+$/.test(String(comp.getValue() ?? ""))) {
        await $c.win.alert("'" + scwin.getFieldName(comp) + "' 항목은 숫자만으로 구성할 수 없습니다.");
        comp.setValue(""); comp.focus();
        return false;
    }
    return true;
};
''',
    "checkAlphaNum": '''/**
 * @method
 * @name checkAlphaNum
 * @description 영문·숫자 조합 자릿수 검사(as-is 공통 fn_ChkAlphaNum — 실패 시 알림·값 삭제·포커스)
 * @param {Object} comp 입력 컴포넌트
 * @param {Number} minLen 최소 자릿수
 * @param {Number} maxLen 최대 자릿수
 * @returns {Promise<Boolean>} 통과면 true
 * @hidden N
 */
scwin.checkAlphaNum = async function (comp, minLen, maxLen) {
    const re = new RegExp("^[a-zA-Z0-9]{" + minLen + "," + maxLen + "}$");
    if (!re.test(String(comp.getValue() ?? ""))) {
        await $c.win.alert("'" + scwin.getFieldName(comp) + "' 항목은 영문과 숫자의 조합으로 " + minLen + "~" + maxLen + "자리내에서 입력하세요");
        comp.setValue(""); comp.focus();
        return false;
    }
    return true;
};
''',
    "isGroupChecked": '''/**
 * @method
 * @name isGroupChecked
 * @description 라디오·체크박스 그룹에 선택이 있는지(as-is 공통 fn_IsChecked)
 * @param {Object} comp 라디오/체크박스 그룹 컴포넌트
 * @returns {Boolean}
 * @hidden N
 */
scwin.isGroupChecked = function (comp) {
    return !!comp && !$c.util.isEmpty(comp.getValue());
};
''',
}
HELPER_DEPS = {"setSearchPeriod": ["setPeriodDates"], "checkByteLimit": ["getByteLength2", "truncateByBytes"],
               "checkNotOnlyNumber": ["getFieldName"], "checkAlphaNum": ["getFieldName"]}
# pcc/fil 반입(2026-10-06, cm/pcc/fil/fil.xml) — 이 이름들은 로컬 헬퍼를 넣지 않고 `$c.fil.<name>(` 를 부른다. 화면 스코프에 묶인 getMktId·setSearchPeriod·setPeriodDates 만 로컬.
import pcc_fil_import  # noqa: E402
IMPORTED_FIL = set(pcc_fil_import.IMPORTED)

# (호출 패턴, 치환 생성기, 필요한 헬퍼)
PCC_MAP = {
    "fn_getMktId": ("getMktId", None), "fn_getSecuGrpNm": ("getSecuGrpNm", None), "showObj": ("showObj", None),
    "FillGridHeaderTotalCnt": ("showTotalCount", None), "fn_getModalCenterPos": ("getModalCenterPos", None),
}
CM_MAP = {
    "fn_ClickPeriod": ("setSearchPeriod", lambda a: a[-1:]), "fn_SetPeriod": ("setPeriodDates", lambda a: a[1:3]),
    "fn_CheckDateGn": ("checkDateParts", None), "fn_ChkZipCd": ("isZipCodeInput", None), "fn_CheckByte": ("checkByteLimit", None),
    "fn_CalcContn": ("truncateByBytes", None), "isMinusNum": ("isMinusNumber", None), "fn_ChkNoneNum": ("checkNotOnlyNumber", None),
    "fn_ChkAlphaNum": ("checkAlphaNum", None), "fn_IsChecked": ("isGroupChecked", None), "fn_IsNull": ("checkRequired", None),
}


def replace_pcc_and_cm(script):
    used, log = [], {}

    def mk(table, prefix):
        def make(args, m):
            name = m.group(1)
            new, argfn = table[name]
            if argfn:
                args = argfn(args)
            if new in IMPORTED_FIL:
                log[name] = log.get(name, 0) + 1
                return "$c.fil.%s(%s)" % (new, ", ".join(args))
            if new in HELPERS:
                used.append(new)
            log[name] = log.get(name, 0) + 1
            return "scwin.%s(%s)" % (new, ", ".join(args))
        return make
    script, _ = _replace_calls(script, r'\$c\.(?:lc|fil)\.(%s)\(' % "|".join(PCC_MAP), mk(PCC_MAP, "pcc"))
    script, _ = _replace_calls(script, r'\$c\.cm\.(%s)\(' % "|".join(CM_MAP), mk(CM_MAP, "cm"))
    # 인라인 치환 2종
    def ignore_spaces(args, m):
        log["fn_IgnoreSpaces"] = log.get("fn_IgnoreSpaces", 0) + 1
        return 'String(%s).replace(/\\s/g, "")' % ", ".join(args)
    def contact(args, m):
        log["fn_ChkContactpnt"] = log.get("fn_ChkContactpnt", 0) + 1
        return "/^[0-9-]*$/.test(%s)" % ", ".join(args)
    script, _ = _replace_calls(script, r'\$c\.cm\.(fn_IgnoreSpaces)\(', ignore_spaces)
    script, _ = _replace_calls(script, r'\$c\.cm\.(fn_ChkContactpnt)\(', contact)
    # 헬퍼 삽입(의존 포함, 정의 순서 = HELPERS 순서)
    want = set()
    for u in used:
        want.add(u); want.update(HELPER_DEPS.get(u, []))
    script = _append_helpers(script, [h for h in HELPERS if h in want], HELPERS)
    return script, log


# ---------------------------------------------------------------- V31
STUB_RE = re.compile(r'scwin\.init_recvParam = function \(\) \{ console\.warn\("\[sdd\] 전환 파라미터 수신 대상 없음: dma_pageContext[^"]*"\); \}')
PAGE_CONTEXT_XML = ('\n      <w2:dataMap baseNode="map" id="dma_pageContext">\n        <w2:keyInfo/>\n        <w2:data use="true"/>\n      </w2:dataMap>')


def ensure_page_context(head, script):
    if not STUB_RE.search(script):
        return head, script, 0
    if 'id="dma_pageContext"' not in head:
        m = re.search(r'<w2:dataCollection\b[^>]*>', head)
        if not m:
            return head, script, 0  # dataCollection 자체가 없는 뼈대 화면 — 스텁은 두고 TODO 로 남긴다
        head = head[:m.end()] + PAGE_CONTEXT_XML + head[m.end():]
    # 원문 스텁은 `}` 로 끝나고 뒤 단계(함수 대입식 `}`→`};` 보정)가 `;` 를 붙이므로 여기서는 붙이지 않는다(`};;` 방지)
    script = STUB_RE.sub('scwin.init_recvParam = function () { dma_pageContext.setJSON($c.data.getParameter() ?? {}); }', script)
    return head, script, 1


# ---------------------------------------------------------------- V32 (B 축) 이동 목적지 정적 확정
NAV_IIFE = re.compile(r'\(function \(__u\) \{ (?:let|const|var) __s = String\(__u == null \? "" : __u\);.*?unresolved: "nav:" \+ __s \}; \} return __u; \}\)\(([^()]*)\)')


def resolve_static_nav(script):
    """공급사 드러냄 IIFE(`(function (__u) { … if (!/\\.xml…/.test(__s)) throw … })(url)`)는 실행 시 url 이 .xml 이 아니면 던진다.
    같은 함수 안에서 url 이 내부 `.xml` 리터럴(또는 그 리터럴로 시작하는 조립)로 정해지면 정적으로 통과가 확정이므로 래퍼를 걷고
    인자만 남긴다(TODO 도 사라진다). `.do`·`.jsp`·외부 http·조립 전 빈 문자열은 그대로 둔다(회신 A-15 명부)."""
    n = 0
    for name, s, b, e, _ in reversed(st.func_spans(script)):
        body = script[b:e]
        out, pos, changed = [], 0, False
        for m in NAV_IIFE.finditer(body):
            arg = m.group(1).strip()
            lit = re.fullmatch(r'''(["'])([^"']*)\1''', arg)
            if lit:
                v = lit.group(2)
            else:
                am = re.search(r'(?:let|const|var)?\s*%s\s*=\s*(["\'])([^"\']*)\1' % re.escape(arg), body) if re.fullmatch(r'[\w$.]+', arg) else None
                v = am.group(2) if am else None
            if v and v.startswith("/") and re.search(r'\.xml(\?|#|$)', v):
                out.append(body[pos:m.start()]); out.append(arg); pos = m.end(); n += 1; changed = True
        if changed:
            out.append(body[pos:])
            script = script[:b] + "".join(out) + script[e:]
    return script, n


# ---------------------------------------------------------------- V33 (C 축) 부모 화면 스코프 — 공급사 인라인 폴백 → 로컬 헬퍼
# 괄호 짝을 정확히 — 꼴 1 `(( cond ? x : null ) || { 폴백 })` 는 여는 괄호 2, 꼴 2 `((( cond ) ? x : null ) || {})` 는 3 (2026-10-06 c1 배치 114화면 구문 오류 교훈)
OPENER_FALLBACK = re.compile(
    r"\(\(\$c\.win && \$c\.win\.getOpenerScope \? \$c\.win\.getOpenerScope\(\) : null\) \|\| "
    r"\{ getComponentById: function \((?:id|__id)\) \{ console\.error\('\[sdd\] 부모 화면 스코프 없음 — ' \+ (?:id|__id) \+ ' 를 못 읽는다\(단독 진입이거나 부모가 닫혔다\)'\); return null; \}, scwin: \{\} \}\)"
    r"|\(\(\(\$c\.win && \$c\.win\.getOpenerScope\) \? \$c\.win\.getOpenerScope\(\) : null\) \|\| \{\}\)")
OPENER_HELPER = '''/**
 * @method
 * @name opener
 * @description 부모 화면 scope(browserPopup/pageFramePopup 공통 — $c.win.getOpenerScope). 단독 진입이거나 부모가 닫혀 없으면
 *  빈 scope(getComponentById → null · scwin {})를 돌려 호출부가 null/빈 값으로 처리하게 한다(as-is 는 console.error 뒤 null)
 * @returns {Object} 부모 화면 scope 또는 빈 scope
 * @hidden N
 */
scwin.opener = function () {
    const scope = ($c.win && $c.win.getOpenerScope) ? $c.win.getOpenerScope() : null;
    return scope || { getComponentById: function () { return null; }, scwin: {} };
};
'''
OPENER_SUB_HELPERS = {
    "openerScwin": '''/**
 * @method
 * @name openerScwin
 * @description 부모 화면의 scwin(함수·전역 접근용). 부모가 없으면 빈 객체
 * @returns {Object} 부모 scwin 또는 {}
 * @hidden N
 */
scwin.openerScwin = function () {
    return scwin.opener().scwin || {};
};
''',
    "openerComp": '''/**
 * @method
 * @name openerComp
 * @description 부모 화면 컴포넌트(as-is opener.document.<폼>.<필드>). 부모·컴포넌트가 없으면 빈 객체(메서드 존재 검사로 건너뛴다)
 * @param {String} id 부모 화면 컴포넌트 id
 * @returns {Object} 컴포넌트 또는 {}
 * @hidden N
 */
scwin.openerComp = function (id) {
    return scwin.opener().getComponentById(id) || {};
};
''',
}


def simplify_opener(script):
    """공급사 인라인 폴백 `((($c.win && $c.win.getOpenerScope ? … : null) || { getComponentById: …console.error… }))` → `scwin.opener()`
    (TODO 는 폴백 안에 있어 함께 사라진다) · `(scwin.opener().scwin || {})` → `scwin.openerScwin()` · `(scwin.opener().getComponentById(ID) || {})`
    → `scwin.openerComp(ID)`. 그 위의 메서드 존재 검사(`X.setValue ? X.setValue(v) : void("")` 류, 131가지 꼴)는 공급사가 as-is DOM 접근을
    옮긴 보수적 가드라 뜻이 같으므로 그대로 둔다."""
    script, n1 = OPENER_FALLBACK.subn("scwin.opener()", script)
    if not n1:
        return script, {}
    script, n2 = re.subn(r'\(scwin\.opener\(\)\.scwin \|\| \{\}\)', "scwin.openerScwin()", script)
    script, n3 = re.subn(r'''\(scwin\.opener\(\)\.getComponentById\((['"][^'"]*['"])\) \|\| \{\}\)''', r"scwin.openerComp(\1)", script)
    helpers = dict(OPENER_SUB_HELPERS, opener=OPENER_HELPER)
    want = ["opener"] + (["openerScwin"] if n2 else []) + (["openerComp"] if n3 else [])
    script = _append_helpers(script, want, helpers)
    return script, {"scope": n1, "scwin": n2, "comp": n3}


# ---------------------------------------------------------------- V34 (C 축) 미실현 포커스 — 앞 문장이 가리키는 컴포넌트가 하나뿐이면 그 컴포넌트로
FOCUS_MARK = re.compile(r'(?m)^([ \t]*)/\* TODO Stage2: \[sdd\] 미실현 동작: set_focus \(대상 미해석\) — 전환 미완 \*/ /\* unresolved-target intent:set_focus[^\n]*\*/[ \t]*$')
FOCUS_MARK_RAW = re.compile(r'(?m)^([ \t]*)console\.error\("\[sdd\] 미실현 동작: set_focus \(대상 미해석\) — 전환 미완"\); /\* unresolved-target intent:set_focus[^\n]*\*/[ \t]*$')
COMP_PREFIX = r'(?:ipt|txb|txt|cal|slc|cmb|rd|rdo|chk|txa|edt|sel|ibx|sbx|upl)_[A-Za-z0-9_]+'


def resolve_focus(script, body_ids):
    """as-is `form.<필드>.focus()` 를 공급사가 못 옮긴 자리. 바로 앞 4줄(같은 블록)에서 body 컴포넌트가 **하나만** 언급되면
    그 컴포넌트를 대상으로 본다(검증 실패 알림 뒤 그 입력칸으로 커서 — as-is 관용). 둘 이상이거나 없으면 TODO 유지."""
    n = 0
    lines = script.split("\n")
    for i, l in enumerate(lines):
        m = FOCUS_MARK_RAW.match(l) or FOCUS_MARK.match(l)
        if not m:
            continue
        ctx = "\n".join(lines[max(0, i - 4):i])
        ids = set(re.findall(r"getComponent\(['\"]([^'\"]+)['\"]\)", ctx)) | set(re.findall(r'(?<![\w$.])(%s)' % COMP_PREFIX, ctx))
        ids = {x for x in ids if x in body_ids}
        if len(ids) == 1:
            cid = ids.pop()
            lines[i] = m.group(1) + "$c.util.getComponent(\"%s\").focus();  // 포커스 대상: 앞 문장이 가리키는 입력칸(as-is <폼>.<필드>.focus())" % cid
            n += 1
    return "\n".join(lines), n


# ---------------------------------------------------------------- V35 (C 축) 행 복사 루프 표준화(init_rowCopy)
ROWCOPY_RE = re.compile(
    r'(?s)(    let copied = 0;\n    for \(let i = 0; i < rows\.length; i\+\+\) \{\n        const it = rows\[i\];\n        const c = \$c\.util\.getComponent\(it\.childId\);\n'
    r'        if \(!c \|\| typeof c\.setValue !== "function"\) \{ console\.warn\("\[sdd\] 행 복사 대상 부재: " \+ it\.childId\); continue; \}\n'
    r'        try \{\n            const v = it\.fn\(\);\n            if \(v !== undefined && v !== null && String\(v\)\.trim\(\) !== ""\) \{ c\.setValue\(String\(v\)\); copied\+\+; \}\n'
    r'        \} catch \(e\) \{ await \$c\.exception\.handleError\(e, \{ notify: "none", context: "rowCopy:" \+ it\.childId \}\); \}\n    \}\n    return copied;\n)')
ROWCOPY_BODY = '''    rows.forEach(function (it) {
        const c = $c.util.getComponent(it.childId);
        if (!c || typeof c.setValue !== "function") { return; }  // as-is 가 서버 렌더로 그리던 반복 행 — 산출에 없는 칸은 건너뛴다
        let v;
        try { v = it.fn(); } catch (e) { $c.exception.handleError(e, { notify: "none", context: "rowCopy:" + it.childId }); return; }
        if (v !== undefined && v !== null && String(v).trim() !== "") { c.setValue(String(v)); }
    });
'''


def standardize_rowcopy(script):
    """공급사 `init_rowCopy` 의 범용 루프(대상 부재 경고·카운터·await) → 표준 forEach(동기). 경고 자리는 손실이 아니라 산출에 없는 칸의
    건너뛰기이므로 TODO 로 남기지 않는다(V3/V4 와 같은 처방). 호출부 await 는 propagate 가 다루지 않으므로 여기서 같이 뗀다."""
    script, n = ROWCOPY_RE.subn(ROWCOPY_BODY, script)
    if n:
        script = re.sub(r'scwin\.init_rowCopy = async function', 'scwin.init_rowCopy = function', script)
        script = st.sub_code(script, r'await\s+(scwin\.init_rowCopy\s*\()', r'\1')
    return script, n


# ---------------------------------------------------------------- 진입
# ---------------------------------------------------------------- V37 핸들러 try/catch 표준 래핑 (P2 기계 축 · 2026-10-07)
# 공급사 페이저 한 줄 핸들러: `scwin.krxpage_pagenavigator_N_onclick = function (index) { const pi = (index && typeof index === 'object') ? index.newSelectedIndex : index;
#   try { X.set('pageIndex', pi); } catch (e) { $c.exception.handleError(e, { notify: 'none', … }); } scwin.F(); };`  (set 이 없는 변형·convert 뒤 async/await 꼴 포함)
PAGER_ONE_RE = re.compile(
    r"^(?P<ind>[ \t]*)scwin\.(?P<name>\w+_on\w+)\s*=\s*(?P<asy>async\s+)?function\s*\((?P<args>[^)]*)\)\s*\{[ \t]*"
    r"(?P<pi>const pi = \(index && typeof index === 'object'\) \? index\.newSelectedIndex : index;)[ \t]*"
    r"(?:try \{[ \t]*(?P<set>[^{}]*?;)[ \t]*\} catch \(e\) \{(?:[^{}]|\{[^{}]*\})*\}[ \t]*)?"   # catch 안의 { notify: … } 한 단계 허용
    r"(?P<call>(?:await )?scwin\.\w+\([^;]*\);)[ \t]*\};[ \t]*$", re.M)
HANDLER_NAME_RE = re.compile(r'^(?!tx_)\w+_on[a-z]+$')   # `_on<이벤트>` 로 끝나는 것만 — V22 의 `_1` 접미 중복 정의·tx_ 콜백은 제외


def _screen_id_of(head):
    m = re.search(r'meta_screenId="([^"]*)"', head or "")
    return (m.group(1) if m else "").lower()


def _wrap_body(body, unit, is_async, screen_id, fname):
    lines = body.strip("\n").split("\n")
    if len(lines) == 1:                          # 한 줄 본문 `{ stmt; }` — 앞뒤 공백을 걷고 기본 들여쓰기 한 단을 준다
        lines = [unit + lines[0].strip()]
    inner = "\n".join(((unit + ln) if ln.strip() else ln) for ln in lines)
    call = ("await " if is_async else "") + '$c.exception.handleError(ex, { context : "%s.%s" });' % (screen_id, fname)
    return "\n" + unit + "try {\n" + inner + "\n" + unit + "} catch (ex) {\n" + unit + unit + call + "\n" + unit + "}\n"


def wrap_handler_trycatch(script, head=""):
    """V37. ① 공급사 페이저 한 줄 핸들러를 표준 다중행 try/catch 꼴로(안쪽 `notify:'none'` try 는 걷는다 — dataMap.set 은 던지지 않으므로 바깥 try 하나로 충분),
    ② 그 밖의 이벤트 핸들러(`scwin.<id>_on<ev>`, `tx_` 제외) 중 실행문이 있는데 try 가 없는 본문을 규칙 26 꼴로 감싼다.
    본문에 try 가 이미 있으면(어디든) 건너뛴다 — 수기 오류 처리 보존·멱등. 실행문 없는 본문(빈/주석만)도 건너뛴다."""
    sid = _screen_id_of(head)
    n_pager = 0
    unit_default = "\t" if re.search(r'(?m)^\t+scwin\.', script) else "    "

    def pager(m):
        nonlocal n_pager
        n_pager += 1
        unit = unit_default
        stmts = [m.group("pi")] + ([m.group("set").strip()] if m.group("set") else []) + [m.group("call").strip()]
        body = "\n".join(unit + x for x in stmts)   # 본문 기본 들여쓰기(한 단) — _wrap_body 가 try 안으로 한 단 더 넣는다
        is_async = bool(m.group("asy")) or m.group("call").startswith("await ")
        return "%sscwin.%s = %sfunction (%s) {%s};" % (m.group("ind"), m.group("name"), "async " if is_async else "", m.group("args"),
                                                    _wrap_body(body, unit, is_async, sid, m.group("name")))
    script = PAGER_ONE_RE.sub(pager, script)
    # ② 일반 핸들러
    edits = []
    for name, s, b, e, _ in st.func_spans(script):
        if not HANDLER_NAME_RE.match(name):
            continue
        body = script[b + 1:e]
        code = st.code_only(body)
        if not code.strip() or re.search(r'(?<![.\w$])try(?![\w$])', code):
            continue
        header = script[script.rfind("\n", 0, s) + 1:b]
        is_async = bool(re.search(r'=\s*async\s+function', header))
        unit = "\t" if body.strip("\n").startswith("\t") else "    "
        edits.append((b + 1, e, _wrap_body(body, unit, is_async, sid, name)))
    for b1, e1, rep in sorted(edits, reverse=True):
        script = script[:b1] + rep + script[e1:]
    return script, {"pager": n_pager, "wrapped": len(edits)}


# ---------------------------------------------------------------- V38 fn_ 별칭 인라인 (P2 기계 축 · 2026-10-07, 사용자 결정: 충돌 없는 것만 기계로)
# 규칙 13 이 못 바꾼 `scwin.fn_*` 152자리 중 150 은 함수가 아니라 **함수 포인터 별칭**이었다: 1구역 `scwin.fn_X = null;` 전방 선언 + onpageload 안
# `scwin.fn_X = scwin.tx_fn_X;`(무조건, 단 한 번) + 호출 `scwin.fn_X()`. 별칭을 걷고 호출을 타깃으로 바꾸면 fn_ 이름이 사라진다.
# 대입이 둘 이상·타깃이 scwin 함수가 아님·타깃 정의 없음이면 건드리지 않고 로그(충돌). 숫자로 시작하는 `fn_70000Table_*` 함수 2건도 규칙 13 과 같이 보류.
ALIAS_DECL_RE = re.compile(r'(?m)^scwin\.(fn_[A-Za-z_$][\w$]*)\s*=\s*null;[ \t]*(?://[^\n]*)?\n')


def inline_fn_aliases(head, script, body):
    log = {"inlined": [], "skipped": []}
    for m in list(ALIAS_DECL_RE.finditer(script)):
        v = m.group(1)
        if m.group(0) not in script:
            continue
        code = st.code_only(script)
        assigns = re.findall(r'(?m)^[ \t]*scwin\.%s\s*=\s*(scwin\.[A-Za-z_$][\w$]*);' % re.escape(v), code)
        n_assign = len(re.findall(r'(?<![\w$.])scwin\.%s\s*=(?!=)' % re.escape(v), code))   # null 선언 + 대입
        if len(assigns) != 1 or n_assign != 2:
            log["skipped"].append("%s(대입 %d)" % (v, n_assign - 1)); continue
        target = assigns[0]
        tname = target.split(".", 1)[1]
        if not re.search(r'(?m)^scwin\.%s\s*=\s*(?:async\s+)?function' % re.escape(tname), script):
            log["skipped"].append("%s(타깃 %s 정의 없음)" % (v, tname)); continue
        # 선언·대입 줄 삭제
        script = script.replace(m.group(0), "", 1)
        script = re.sub(r'(?m)^[ \t]*scwin\.%s\s*=\s*%s;[ \t]*(?://[^\n]*)?\n' % (re.escape(v), re.escape(target)), "", script, count=1)
        # 참조 → 타깃 (scwin. 접두 꼴은 문자열 리터럴 안까지 — 규칙 13 과 같은 이유; head/body 도)
        pat = re.compile(r'scwin\.%s\b' % re.escape(v))
        script = pat.sub(target, script); head = pat.sub(target, head); body = pat.sub(target, body)
        log["inlined"].append("%s → %s" % (v, target))
    return head, script, body, {k: v for k, v in log.items() if v}


# ---------------------------------------------------------------- V39 [sdd] 컴포넌트 가드 정리 (P2 기계 축 · 2026-10-07)
# 공급사 드러냄 가드: `(G && G.m ? G.m(args) : console.warn('[sdd] m 대상 미해결: id'))` (G = $c.util.getComponent('id')) — 컴포넌트가 body/head 에
# 실존하면 가드는 늘 참이라 `G.m(args)` 로 줄인다. `((!G || typeof G.getValue !== 'function') ? (console.warn(…), false) : (EXPR))` 도 `(EXPR)` 로.
# 실존하지 않거나 id 가 변수인 가드, 컨텍스트 키·opener·라벨 갈래·hiddenStore 부재 등 회신 의존 표식은 그대로 둔다(스코어카드 console_sdd 로 집계).
_G = r"\$c\.util\.getComponent\(\s*(?P<q>['\"])(?P<id>[^'\"]+)(?P=q)\s*\)"
GUARD_HEAD_RE = re.compile(r"\(\(?" + _G + r"\)?\s*&&\s*\(?\$c\.util\.getComponent\(\s*(?P=q)(?P=id)(?P=q)\s*\)\)?\.(?P<m>\w+)\)?\s*\?\s*"
                           r"\(?\$c\.util\.getComponent\(\s*(?P=q)(?P=id)(?P=q)\s*\)\)?\.(?P=m)\(")
READ_HEAD_RE = re.compile(r"\(\(!" + _G + r"\s*\|\|\s*typeof \$c\.util\.getComponent\(\s*(?P=q)(?P=id)(?P=q)\s*\)\.getValue !== 'function'\)\s*\?\s*\(console\.warn\(")


def simplify_sdd_guards(script, head="", body=""):
    ids = set(re.findall(r'\sid="([^"]+)"', body or "")) | set(re.findall(r'<w2:(?:dataMap|dataList)[^>]*\sid="([^"]+)"', head or ""))
    n_call = n_read = 0
    mask = cv.code_mask(script)
    out, pos = [], 0
    for m in GUARD_HEAD_RE.finditer(script):
        if m.start() < pos or not mask[m.start()] or m.group("id") not in ids:
            continue
        a_close = _balanced(script, m.end() - 1)                     # m(args) 의 ')'
        if a_close < 0:
            continue
        tail = re.match(r"\s*:\s*console\.(?:warn|error)\(", script[a_close + 1:])
        if not tail:
            continue
        w_open = a_close + 1 + tail.end() - 1
        w_close = _balanced(script, w_open)
        if w_close < 0 or script[w_close + 1:w_close + 2] != ")":
            continue
        args = script[m.end():a_close]
        out.append(script[pos:m.start()])
        out.append("$c.util.getComponent(%s%s%s).%s(%s)" % (m.group("q"), m.group("id"), m.group("q"), m.group("m"), args))
        pos = w_close + 2; n_call += 1
    out.append(script[pos:]); script = "".join(out)
    mask = cv.code_mask(script)
    out, pos = [], 0
    for m in READ_HEAD_RE.finditer(script):
        if m.start() < pos or not mask[m.start()] or m.group("id") not in ids:
            continue
        w_close = _balanced(script, m.end() - 1)                      # console.warn(...) 의 ')'
        if w_close < 0:
            continue
        tail = re.match(r"\s*,\s*(?:false|''|\"\")\s*\)\s*:\s*\(", script[w_close + 1:])
        if not tail:
            continue
        e_open = w_close + 1 + tail.end() - 1
        e_close = _balanced(script, e_open)
        if e_close < 0 or script[e_close + 1:e_close + 2] != ")":
            continue
        out.append(script[pos:m.start()]); out.append(script[e_open:e_close + 1]); pos = e_close + 2; n_read += 1
    out.append(script[pos:]); script = "".join(out)
    return script, {k: v for k, v in (("call", n_call), ("read", n_read)) if v}


# ---------------------------------------------------------------- V40 innerHTML (P2 기계 축 · 2026-10-07)
# (A) `((G) && (G).setValue ? (G).setValue(EXPR) : ((G) ? ((G).innerHTML = EXPR2) : void (EXPR3)))` — G 가 setValue 를 가진 컴포넌트(w2:textbox 등)로 실존하면
#     늘 setValue 갈래이므로 `G.setValue(EXPR)` 로 줄인다. xf:group(setValue 없음) 대상은 innerHTML 갈래가 실제 동작이라 그대로(B-7 DOM 조립).
# (B) `$c.util.getComponent('id').innerHTML`(쓰기/읽기) — 컴포넌트 객체의 프로퍼티라 아무 효과가 없던 as-is 이월. 실존 컴포넌트면 `.render.innerHTML` 로 DOM 에 닿게 한다.
#     `init_attrReals` 템플릿의 `__html` 실현(comp.render.innerHTML)과 `td.innerHTML` 류 DOM 조립은 손대지 않는다(스코어카드 innerHTML_tpl / innerHTML).
SETVALUE_TAGS = ("w2:textbox", "xf:input", "xf:output", "w2:textarea", "xf:select1", "xf:select", "w2:span")
_GQ = r"\(\$c\.util\.getComponent\(\s*(?P<q>['\"])(?P<id>[^'\"]+)(?P=q)\s*\)\)"
INNERHTML_GUARD_RE = re.compile(r"\(" + _GQ + r"\s*&&\s*\(\$c\.util\.getComponent\(\s*(?P=q)(?P=id)(?P=q)\s*\)\)\.setValue\s*\?\s*"
                                r"\(\$c\.util\.getComponent\(\s*(?P=q)(?P=id)(?P=q)\s*\)\)\.setValue\(")
DIRECT_INNERHTML_RE = re.compile(r"\$c\.util\.getComponent\(\s*(?P<q>['\"])(?P<id>[^'\"]+)(?P=q)\s*\)\.innerHTML\b")


def simplify_innerhtml(script, head="", body=""):
    tag = {m.group(2): m.group(1) for m in re.finditer(r'<(\w+:\w+)\b[^>]*\sid="([^"]+)"', body or "")}
    n_guard = n_direct = 0
    mask = cv.code_mask(script)
    out, pos = [], 0
    for m in INNERHTML_GUARD_RE.finditer(script):
        if m.start() < pos or not mask[m.start()] or tag.get(m.group("id")) not in SETVALUE_TAGS:
            continue
        a_close = _balanced(script, m.end() - 1)
        if a_close < 0:
            continue
        rest = script[a_close + 1:]
        t = re.match(r"\s*:\s*\(", rest)
        if not t:
            continue
        e_open = a_close + 1 + t.end() - 1
        e_close = _balanced(script, e_open)
        if e_close < 0 or script[e_close + 1:e_close + 2] != ")" or "innerHTML" not in script[e_open:e_close]:
            continue
        out.append(script[pos:m.start()])
        out.append("$c.util.getComponent(%s%s%s).setValue(%s)" % (m.group("q"), m.group("id"), m.group("q"), script[m.end():a_close]))
        pos = e_close + 2; n_guard += 1
    out.append(script[pos:]); script = "".join(out)
    mask = cv.code_mask(script)
    out, pos = [], 0
    for m in DIRECT_INNERHTML_RE.finditer(script):
        if m.start() < pos or not mask[m.start()] or m.group("id") not in tag:
            continue
        out.append(script[pos:m.start()])
        out.append("$c.util.getComponent(%s%s%s).render.innerHTML" % (m.group("q"), m.group("id"), m.group("q")))
        pos = m.end(); n_direct += 1
    out.append(script[pos:]); script = "".join(out)
    return script, {k: v for k, v in (("guard", n_guard), ("render", n_direct)) if v}


# ---------------------------------------------------------------- V41 폼 action → tx 인자 (P3 첫 배치에서 발견 · 2026-10-07)
# as-is `form.action = URL; form.submit();` 를 공급사가 `(document.F || { elements: [] }).action = URL; await scwin.tx_X();` 로 옮기면서 tx_X 의 sbmOptions.action 은
# 고정 리터럴 하나만 넣었다 — 분기마다 다른 URL 로 제출하던 화면(JLDFIL00000 goWrite 7갈래 등)은 전부 같은 주소로 가는 결함. 폼 문장을 걷고 URL 을 tx 인자로 넘긴다:
#   `(document.F || …).action = U;` 또는 지역 폼 변수 `frm.action = U;` [`.target|method = …;` · `$c.util.getComponent('dma_…').set(…)` 몇 줄] `await scwin.tx_X();`(대입형·return·한 줄 블록형 포함)
#   → `await scwin.tx_X(U);` + `scwin.tx_X = async function (action) { … action: action ?? "<고정>", … }` (+ JSDoc @param).
# tx 가 sbmOptions 꼴이거나 `$c.data.downFile("<고정>", …)` 꼴일 때만(그 밖의 꼴·⛔ 미해결 스텁은 그대로). 호출부 action 이 고정값과 같고 하나뿐이면 폼 문장만 지운다.
# 폼 참조: `(document.F || { elements: [] })` 직접 꼴, 또는 같은 스크립트에 `const V = (document.F || { elements: [] });` 로 선언된 지역 변수 V
FORM_DECL_RE = re.compile(r"^(?P<ind>[ \t]*)(?:const|let|var) (?P<v>\w+) = \(document\.(?P<f>\w+) \|\| \{ elements: \[\] \}\);[ \t]*$", re.M)
FORM_REASSIGN_RE = re.compile(r"^[ \t]*(?P<v>\w+) = \(document\.\w+ \|\| \{ elements: \[\] \}\);[ \t]*$")
# 공급사가 as-is <form> 대신 둔 폼 객체: `scwin.form_X = { action: "", method: 'post', target: '' };` — 참조는 scwin.form_X.action/target/method 뿐
FORM_OBJ_RE = re.compile(r"^scwin\.(?P<v>form_\w+) = \{ action: \"\", method: '\w+', target: '' \};[ \t]*$", re.M)
_FORM_REF = r"(?:\(document\.\w+ \|\| \{ elements: \[\] \}\)|(?P<v>(?:scwin\.)?\w+))"
FORM_ACTION_RE = re.compile(r"^(?P<ind>[ \t]*)" + _FORM_REF + r"\.action = (?P<u>.+?);[ \t]*$")
FORM_OTHER_RE = re.compile(r"^[ \t]*" + _FORM_REF + r"\.(?:target|method|encoding|enctype) = .+?;[ \t]*$")
DMA_SET_RE = re.compile(r"^[ \t]*\$c\.util\.getComponent\(['\"]dma_\w+['\"]\)\.set\(.*\);[ \t]*$")
# tx 호출: `await scwin.tx_X();` · `const nr = await scwin.tx_X();` · `return await scwin.tx_X();` · `{ const __nr = await scwin.tx_X(); if (…) {…} };` (한 줄 블록)
TX_CALL_RE = re.compile(r"^(?P<ind>[ \t]*)(?P<pre>(?:\{ )?(?:const \w+ = |return )?)(?P<aw>await )?scwin\.(?P<tx>tx_\w+)\(\)(?P<post>;.*)$")
# tx 정의의 고정 주소: sbmOptions.action 리터럴 또는 `$c.data.downFile("<고정>", …)` 첫 인자(같은 함수 안, `\n};` 전까지)
TX_FIXED_RE = re.compile(r'(?m)^scwin\.(tx_\w+) = async function \((?:action)?\) \{\n(?:(?!\n\};)[\s\S])*?(?:const sbmOptions = \{(?:(?!\n\};)[\s\S])*?\n[ \t]*action: |\$c\.data\.downFile\()(?:action \?\? )?(?P<a>"[^"\n]*"|\'[^\'\n]*\'),')


def form_action_to_tx(script):
    lines = script.split("\n")
    tx_fixed = {}
    for m in re.finditer(TX_FIXED_RE, script):
        tx_fixed[m.group(1)] = m.group("a")
    form_vars = {m.group("v") for m in FORM_DECL_RE.finditer(script)} | {"scwin." + m.group("v") for m in FORM_OBJ_RE.finditer(script)}

    def _is_form(m):
        return m.group("v") is None or m.group("v") in form_vars
    uses = {}        # tx → set(action 리터럴/식)
    edits = []       # (start, end, replacement lines)
    i = 0
    while i < len(lines):
        m = FORM_ACTION_RE.match(lines[i])
        if not m or not _is_form(m):
            i += 1; continue
        j = i + 1; drop = [i]
        while j < len(lines) and j <= i + 8:
            t = lines[j]
            if not t.strip():
                j += 1; continue
            mo = FORM_OTHER_RE.match(t)
            if mo and _is_form(mo):
                drop.append(j); j += 1; continue
            if DMA_SET_RE.match(t):
                j += 1; continue
            break
        c = TX_CALL_RE.match(lines[j]) if j < len(lines) else None
        if not c or c.group("tx") not in tx_fixed:
            i += 1; continue
        tx, u = c.group("tx"), m.group("u").strip()
        uses.setdefault(tx, set()).add(u)
        edits.append((drop, j, c, u))
        i = j + 1
    # 둘째 패스: tx 가 8줄 안에 없는 폼 action 줄 — 같은 함수 안 뒤쪽의 tx 호출이 하나 이상이고 전부 그 주소를 고정 주소로 가지면(인자 없이도 같은 곳) 폼 줄만 지운다
    far = 0
    taken = {d for drop, _j, _c, _u in edits for d in drop}
    for i, l in enumerate(lines):
        if i in taken:
            continue
        m = FORM_ACTION_RE.match(l)
        if not m or not _is_form(m):
            continue
        u = m.group("u").strip()
        if not re.match(r"""^(?:"[^"]*"|'[^']*')$""", u):
            continue
        j = i + 1; called = []
        while j < len(lines) and not re.match(r"^\};?\s*$", lines[j]) and not re.match(r"^scwin\.\w+ = ", lines[j]):
            called += re.findall(r"(?<![\w$])scwin\.(tx_\w+)\(", lines[j]); j += 1
        if called and all(tx in tx_fixed and tx_fixed[tx][1:-1] == u[1:-1] for tx in called):
            drop = [i]; k = i + 1
            while k < len(lines) and k <= i + 3:
                mo = FORM_OTHER_RE.match(lines[k])
                if mo and _is_form(mo) and (mo.group("v") or "") == (m.group("v") or ""):
                    drop.append(k); k += 1; continue
                break
            edits.append((drop, None, None, u)); far += 1
    # 셋째 패스(branch): 함수 안 폼 action 대입이 전부 리터럴이고(분기 안 포함), 첫 대입~마지막 대입 사이에 tx 호출이 없고, 마지막 대입 뒤 tx 호출이 정확히 하나(고정 주소 tx)면
    # `let action;` 을 함수 첫 줄에 두고 대입을 `action = U;` 로, 그 호출을 `tx(action)` 으로 — 분기별 제출 주소를 변수로 모은다(JLDFIL00000 손작업과 같은 꼴). 함수 안에 이미 `action` 식별자가 있으면 건드리지 않는다.
    branch = 0
    taken = {d for drop, _j, _c, _u in edits for d in drop}
    fn_bounds = []
    for i, l in enumerate(lines):
        if re.match(r"^scwin\.\w+ = (?:async )?function\b.*\{\s*$", l) or re.match(r"^(?:async )?function \w+\(.*\{\s*$", l):
            fn_bounds.append(i)
    for fi, start in enumerate(fn_bounds):
        end = len(lines)
        for k in range(start + 1, len(lines)):
            if re.match(r"^\};?\s*$", lines[k]):
                end = k; break
        acts = []
        for i in range(start + 1, end):
            if i in taken or lines[i] is None:
                continue
            m = FORM_ACTION_RE.match(lines[i])
            if m and _is_form(m):
                acts.append((i, m))
        if not acts or not all(re.match(r"""^(?:"[^"]*"|'[^']*')$""", m.group("u").strip()) for _i, m in acts):
            continue
        first, last = acts[0][0], acts[-1][0]
        between = [c for i in range(first + 1, last) for c in re.findall(r"(?<![\w$])scwin\.(tx_\w+)\(", lines[i] or "")]
        after = [(i, c) for i in range(last + 1, end) for c in re.findall(r"(?<![\w$])scwin\.(tx_\w+)\(", lines[i] or "")]
        if between or len(after) != 1 or after[0][1] not in tx_fixed:
            continue
        j, tx = after[0]
        c = TX_CALL_RE.match(lines[j])
        if not c or c.group("tx") != tx:
            continue
        body_text = "\n".join(lines[k] or "" for k in range(start + 1, end))
        if re.search(r"(?<![\w$.])action(?![\w$])", body_text):
            continue
        ind = re.match(r"[ \t]*", lines[start + 1] or "").group(0) or "    "
        for i, m in acts:
            lines[i] = m.group("ind") + "action = " + m.group("u").strip() + ";"
            k = i + 1
            while k < end and k <= i + 3:
                mo = FORM_OTHER_RE.match(lines[k] or "")
                if mo and _is_form(mo) and (mo.group("v") or "") == (m.group("v") or ""):
                    lines[k] = None; k += 1; continue
                break
        for k in range(last + 1, j):            # 마지막 대입과 호출 사이의 같은 폼 target/method 줄도 사문
            mo = FORM_OTHER_RE.match(lines[k] or "")
            if mo and _is_form(mo) and (mo.group("v") or "") == (acts[-1][1].group("v") or ""):
                lines[k] = None
        lines[start + 1] = ind + "let action;\n" + lines[start + 1]
        uses.setdefault(tx, set()).add("action")
        edits.append(([], j, c, "action")); branch += 1
    if not edits:
        return script, {}
    param_tx = set()
    for drop, j, c, u in edits:
        if c is None:
            continue
        tx = c.group("tx")
        if len(uses[tx]) > 1 or u != tx_fixed[tx] or u == "action":
            param_tx.add(tx)
    for drop, j, c, u in edits:
        tx = c.group("tx") if c is not None else None
        if tx in param_tx:
            lines[j] = "%s%s%sscwin.%s(%s)%s" % (c.group("ind"), c.group("pre"), c.group("aw") or "", tx, u, c.group("post"))
        for d in drop:
            lines[d] = None
    script = "\n".join(l for l in lines if l is not None)
    # tx 정의: 시그니처·action 폴백·JSDoc
    for tx in sorted(param_tx):
        fixed = tx_fixed[tx]
        script = re.sub(r'(?m)^scwin\.%s = async function \(\) \{' % re.escape(tx), 'scwin.%s = async function (action) {' % tx, script, count=1)
        pat = re.compile(r'(scwin\.%s = async function \(action\) \{\n(?:(?!\n\};)[\s\S])*?(?:const sbmOptions = \{(?:(?!\n\};)[\s\S])*?\n[ \t]*action: |\$c\.data\.downFile\())%s,' % (re.escape(tx), re.escape(fixed)))
        script = pat.sub(lambda mm: mm.group(1) + "action ?? " + fixed + ",", script, count=1)
        # JSDoc @param — @returns 바로 앞에
        doc = re.search(r'(/\*\*(?:(?!\*/).)*?)(\n \* @returns[^\n]*\n(?:(?!\*/).)*\*/\nscwin\.%s = async function \(action\))' % re.escape(tx), script, re.S)
        if doc and not re.search(r"@param \{[^}]*\} action\b", doc.group(1)):
            script = script[:doc.start()] + doc.group(1) + "\n * @param {String} action 제출 주소(호출부가 as-is form.action 으로 정하던 분기별 URL · 생략 시 기본 주소)" + doc.group(2) + script[doc.end():]
    log = {"calls": len(edits) - far - branch, "tx_param": len(param_tx), "form_lines": sum(len(d) for d, _j, _c, _u in edits)}
    if far:
        log["far"] = far
    if branch:
        log["branch"] = branch
    return script, {k: v for k, v in log.items() if v}


# ---------------------------------------------------------------- V42 eval 동적 멤버 접근 (P3 첫 배치 · 2026-10-07)
# as-is 의 `eval("document.all.span" + month)` · `eval('form.isurCd' + obj1)` · `eval('obj.x_' + idx + '.value')` 는 이름을 문자열로 조립한 멤버 접근이라
# 대괄호 접근과 의미가 같다: `document.all["span" + month]` · `form['isurCd' + obj1]` · `obj['x_' + idx].value`. eval 만 걷고 DOM 참조(document.all 등)는 그대로 둔다(B-7).
# 첫 조각이 "경로.접두" 꼴 문자열이고, 마지막 조각이 `.식별자(.식별자)*` 꼴 문자열이면 꼬리 속성, 그 밖의 조각에 `.`·`[`·`(` 가 든 문자열이 있으면 손대지 않는다.
EVAL_CALL_RE = re.compile(r"(?<![\w.$])eval\(")
_PATH_PREFIX_RE = re.compile(r"^(?P<path>[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\.(?P<prefix>[A-Za-z_$]?[\w$]*)$")
_TAIL_RE = re.compile(r"^(?:\.[A-Za-z_$][\w$]*)+$")
_QUOTED_RE = re.compile(r"^(?P<q>['\"])(?P<v>.*)(?P=q)$", re.S)


def _split_plus(expr):
    """최상위 `+` 로 분할(괄호·문자열 안은 건너뜀)."""
    parts, depth, q, cur = [], 0, None, []
    i = 0
    while i < len(expr):
        ch = expr[i]
        if q:
            cur.append(ch)
            if ch == "\\" and i + 1 < len(expr):
                cur.append(expr[i + 1]); i += 2; continue
            if ch == q:
                q = None
        elif ch in "'\"":
            q = ch; cur.append(ch)
        elif ch in "([{":
            depth += 1; cur.append(ch)
        elif ch in ")]}":
            depth -= 1; cur.append(ch)
        elif ch == "+" and depth == 0:
            parts.append("".join(cur).strip()); cur = []
        else:
            cur.append(ch)
        i += 1
    parts.append("".join(cur).strip())
    return parts


def de_eval_member(script):
    mask = cv.code_mask(script)
    out, pos, n = [], 0, 0
    for m in EVAL_CALL_RE.finditer(script):
        if m.start() < pos or not mask[m.start()]:
            continue
        close = _balanced(script, m.end() - 1)
        if close < 0:
            continue
        parts = _split_plus(script[m.end():close])
        if len(parts) < 2:
            continue
        q0 = _QUOTED_RE.match(parts[0])
        pp = q0 and _PATH_PREFIX_RE.match(q0.group("v"))
        if not pp:
            continue
        tail = ""
        qt = _QUOTED_RE.match(parts[-1])
        if qt and _TAIL_RE.match(qt.group("v")):
            tail = qt.group("v"); parts = parts[:-1]
            if len(parts) < 2:
                continue
        bad = False
        for part in parts[1:]:
            qq = _QUOTED_RE.match(part)
            if qq and re.search(r"[.\[(]", qq.group("v")):
                bad = True; break
        if bad:
            continue
        name = parts[1:]
        if pp.group("prefix"):
            name = [q0.group("q") + pp.group("prefix") + q0.group("q")] + name
        out.append(script[pos:m.start()])
        out.append("%s[%s]%s" % (pp.group("path"), " + ".join(name), tail))
        pos = close + 1; n += 1
    out.append(script[pos:])
    return "".join(out), ({"member": n} if n else {})


# ---------------------------------------------------------------- V43 미사용 폼 변수 선언 삭제 (P3 둘째 배치 · 2026-10-07)
# `const frm = (document.F || { elements: [] });` 가 같은 함수 안에서 한 번도 쓰이지 않으면(V41 이 `.action/.target` 을 걷은 뒤 흔한 꼴) 선언 줄을 지운다.
# 함수 끝은 선언보다 얕은 들여쓰기의 `}` 줄. 변수명이 그 범위 안에 식별자로 남아 있으면(필드 접근 `frm.x.value` 등 — B-7 DOM) 그대로 둔다.
def drop_unused_form_vars(script):
    lines = script.split("\n")
    n = 0
    for i, l in enumerate(lines):
        m = FORM_DECL_RE.match(l) if l is not None else None
        if not m:
            continue
        ind = len(m.group("ind")); v = m.group("v")
        j = i + 1; body = []
        while j < len(lines):
            t = lines[j] or ""
            if t.strip() and (len(t) - len(t.lstrip())) < ind and t.lstrip().startswith("}"):
                break
            body.append(t); j += 1
        rest = [t for t in body if not (FORM_REASSIGN_RE.match(t) and FORM_REASSIGN_RE.match(t).group("v") == v)]
        if not re.search(r"(?<![\w$.])%s(?![\w$])" % re.escape(v), "\n".join(rest)):
            lines[i] = None; n += 1
            for k in range(i + 1, j):
                mr = FORM_REASSIGN_RE.match(lines[k] or "")
                if mr and mr.group("v") == v:
                    lines[k] = None; n += 1
    script = "\n".join(l for l in lines if l is not None)
    # 공급사 폼 객체 선언 — 스크립트 어디서도 scwin.form_X 를 다시 쓰지 않으면 삭제
    for m in list(FORM_OBJ_RE.finditer(script)):
        v = m.group("v")
        if len(re.findall(r"(?<![\w$])scwin\.%s(?![\w$])" % re.escape(v), script)) == 1:
            script = script.replace(m.group(0) + "\n", "", 1); n += 1
    return script, ({"dropped": n} if n else {})


# ---------------------------------------------------------------- V44 as-is 공통 fn_SelEmail (P3 둘째 배치 · 2026-10-07)
# 공급사가 그대로 둔 전역 호출 `fn_SelEmail($c.util.getComponent("slc_selEmail<sfx>"), (document.F || { elements: [] }).email2)` —
# as-is 공통(cm/as-is/fil/common.xml)을 pcc/fil `$c.fil.selEmail(selComp, targetComp)` 로 반입했고, 둘째 인자는 퍼블리싱 입력 `ipt_email2<sfx>` 로 잇는다
# (같은 접미 규약: slc_selEmail_r1 ↔ ipt_email2_r1; 한 폼에 반복 입력인 `.email2[N]` 꼴도 select 접미로 잇는다). 그 id 가 body 에 없으면 호출을 그대로 두고 B-7 표지를 단다.
SEL_EMAIL_RE = re.compile(r"(?<![\w$.])fn_SelEmail\(\$c\.util\.getComponent\((?P<q>['\"])slc_selEmail(?P<sfx>\w*)(?P=q)\), \(document\.\w+ \|\| \{ elements: \[\] \}\)\.email2(?:\[\d+\])?\)")
SEL_EMAIL_TODO = "// TODO Stage2(B-7): 퍼블리싱에 ipt_email2%s 입력 없음 — as-is 공통 fn_SelEmail 대상 미확정"


def sel_email(script, head, body):
    ids = set(re.findall(r'\sid="([^"]+)"', body or ""))
    n = todo = 0
    mask = cv.code_mask(script)
    out, pos = [], 0
    for m in SEL_EMAIL_RE.finditer(script):
        if not mask[m.start()]:
            continue
        sfx, q = m.group("sfx"), m.group("q")
        out.append(script[pos:m.start()])
        if "ipt_email2" + sfx in ids:
            out.append("$c.fil.selEmail($c.util.getComponent(%sslc_selEmail%s%s), $c.util.getComponent(%sipt_email2%s%s))" % (q, sfx, q, q, sfx, q))
            n += 1
        else:
            out.append(m.group(0))
            eol = script.find("\n", m.end())
            if eol < 0:
                eol = len(script)
            if "TODO Stage2(B-7): 퍼블리싱에 ipt_email2" not in script[m.end():eol]:
                tail = script[m.end():eol]
                out.append(tail + "  " + SEL_EMAIL_TODO % sfx)
                pos = eol; todo += 1
                continue
        pos = m.end()
    out.append(script[pos:])
    return "".join(out), {k: v for k, v in (("calls", n), ("todo", todo)) if v}


# ---------------------------------------------------------------- V45 formatNumber($('#id')[0]) (P3 셋째 배치 · 2026-10-07)
# as-is `fn_ObjValueSetComma(obj)`(입력값에 콤마를 넣어 되돌려 쓴다)를 공급사가 `$c.num.formatNumber($('#id')[0]);` 로 옮겼다 — formatNumber 는 값을 받아 문자열을
# 돌려줄 뿐이라 DOM 요소를 넘긴 결과는 버려진다(아무 효과 없음). 실존 컴포넌트면 `comp.setValue($c.num.formatNumber(comp.getValue()));` 로 되돌린다.
FORMAT_NUMBER_DOM_RE = re.compile(r"^(?P<ind>[ \t]*)\$c\.num\.formatNumber\(\$\((?P<q>['\"])#(?P<id>[\w\-]+)(?P=q)\)\[0\]\);[ \t]*$", re.M)


def fix_format_number(script, head="", body=""):
    ids = set(re.findall(r'\sid="([^"]+)"', body or ""))
    n = 0

    def repl(m):
        nonlocal n
        if m.group("id") not in ids:
            return m.group(0)
        n += 1
        g = "$c.util.getComponent(%s%s%s)" % (m.group("q"), m.group("id"), m.group("q"))
        return "%s%s.setValue($c.num.formatNumber(%s.getValue()));" % (m.group("ind"), g, g)
    script = FORMAT_NUMBER_DOM_RE.sub(repl, script)
    if n:
        # 바로 위의 jQuery 힌트 줄은 더는 맞지 않으니 걷는다
        script = re.sub(r"(?m)^[ \t]*// TODO Stage2\(규칙 19\): jQuery[^\n]*\n(?=[ \t]*\$c\.util\.getComponent\([^\n]*\.setValue\(\$c\.num\.formatNumber\()", "", script)
    return script, ({"fixed": n} if n else {})


# ---------------------------------------------------------------- V46 미정의 as-is 전역 함수 호출 (pcc/fil 반입 2차 · 2026-10-07)
# 공급사가 전역 호출로 남긴 as-is 공통 `fn_X(…)`(화면에 정의 없음) 143종·1,360자리·311화면. ① 순수 헬퍼 7종은 pcc/fil `$c.fil.*` 로 반입했고 ② fn_print 는 gcc `$c.win.print()`,
# ③ 같은 화면에 공급사가 개명해 둔 `scwin.<camel>` 이 있으면 그것을 부르고 ④ 나머지(폼/DOM 의존·JSP 팝업·키 입력 필터·외부 리포트·동기 ajax·as-is 정의 없음)는 그대로 두되
# 줄 끝에 `// TODO Stage2(pcc 반입 2차): …` 사유 표지를 단다(한 번만). 화면 안에 같은 이름 정의가 있으면 손대지 않는다.
IMPORT2_FIL = {"fn_ObjValueSetComma": "setComma", "fn_ObjValueResetRmComma2": "removeComma", "fn_boardCheck": "checkSearchWord", "fn_checkNum2": "stripNonDigits",
               "fn_minusCheck": "confirmMinusValue", "fn_showMsgForRemind": "alertRemind", "fn_checkLength": "checkByteLength"}
IMPORT2_GCC = {"fn_print": "$c.win.print"}
IMPORT2_REASON = {
    "폼·DOM 의존(B-7)": ("fn_validate", "fn_getFileNm", "fn_delRow", "fn_chkSaveElwPrc", "fn_IsValidDate", "fn_IsValidArrDate", "fn_IsValidArr", "fn_UserCheckValues",
                        "fn_clearTransTbl", "fn_setMainPage", "fn_Edit56", "fn_UpdateLastPage", "fn_getFileNmCheck", "fn_DigitalSelectSub", "fn_DigitalExcelDownload",
                        "fn_CalcOrdProfit", "fn_CalcCorpTaxDeductProfit", "fn_CalcAshInde", "fn_CalcBusiProfit", "fn_Over5Change", "fn_Over1Change", "fn_VcChange", "fn_InstInvstChange", "fn_chkElwPrc"),
    "JSP 팝업(window.open+폼 제출 — 회신)": ("fn_passwordWin", "fn_popupCorpSearch", "fn_downInfoWin", "fn_stdCdDelWin", "fn_EtnExcelUploadPop", "fn_DigitalExcelUploadPop",
                                        "fn_findCompany", "fn_OpenIndCodeWin", "fn_popupCorpUpdReq"),
    "키 입력 필터(window.event — xf:input allowChar 속성 권장)": ("fn_numPointCheck_minus", "fn_etcNumNotCheck", "fn_etcNotCheck", "fn_telNoCheck", "fn_numPointCheck",
                                                   "fn_engNumNotSpecCheck_ID", "fn_engNmCheck"),
    "외부 리포트 도구(rexpert)": ("fn_PrintPreView_DB",),
    "동기 ajax(tx 전환 필요)": ("fn_getBzDate",),
    "타 모듈 as-is 공통(stf/ods·ins/hindr) — 반입 범위 밖": ("fn_newTextToString", "fn_delTextToString", "fn_condUrl2", "fn_connStratLog", "fn_connEndLog"),
}
IMPORT2_REASON["JSP 팝업(window.open+폼 제출 — 회신)"] += ("fn_popupCorpView", "fn_popupCorpSearch2", "fn_openNotice", "fn_openFAQ", "fn_openBondAppInfo", "fn_openBizForm", "fn_openFeeInfo")
IMPORT2_SKIP = ("fn_SelEmail",)      # V44 몫
IMPORT2_ABSENT = ("fn_ViewManualKeyWord", "fn_FileDown", "fn_Disclsviewer", "fn_Search", "fn_examViewer", "fn_search", "fn_goPrint", "fn_pubofrYn", "fn_NumberFormat2",
                  "fn_varCondSatisfactYn", "fn_sum", "fn_dutyHdCmitYn", "fn_reload", "fn_isu_methd_onclick", "fn_searchList", "fn_setDocumentForm", "fn_preSubmit",
                  "fn_publicFormList", "fn_selectStockDutyExer", "fn_openPopup", "fn_findCompany2", "fn_Register", "fn_toList", "fn_delete", "fn_cancel", "fn_close",
                  "fn_register", "fn_lpContrtTrdYn", "fn_basExpYn", "fn_findKeywrd", "fn_popRelLawDtl")
_REASON_BY_NAME = {n: r for r, names in IMPORT2_REASON.items() for n in names}
IMPORT2_TODO = "// TODO Stage2(pcc 반입 2차): as-is 공통 %s — %s"
GLOBAL_FN_CALL_RE = re.compile(r"(?<![\w$.])(fn_[A-Za-z0-9_]+)\(")


def _camel(name):
    base = name[3:] if name.startswith("fn_") else name
    return base[:1].lower() + base[1:]


def import_globals(script, head="", body=""):
    defined = set(re.findall(r"^scwin\.(\w+) = (?:async )?function", script, re.M)) | set(re.findall(r"^\s*(?:async )?function (\w+)\(", script, re.M)) \
        | set(re.findall(r"^\s*(?:const|let|var) (\w+) = (?:async )?function", script, re.M))
    log = {}
    mask = cv.code_mask(script)
    out, pos = [], 0
    todo_lines = set()
    for m in GLOBAL_FN_CALL_RE.finditer(script):
        if m.start() < pos or not mask[m.start()]:
            continue
        name = m.group(1)
        if name in defined or name in IMPORT2_SKIP:
            continue
        if name in IMPORT2_FIL:
            rep = "$c.fil.%s(" % IMPORT2_FIL[name]; key = "fil"
        elif name in IMPORT2_GCC:
            rep = IMPORT2_GCC[name] + "("; key = "gcc"
        elif _camel(name) in defined:
            rep = "scwin.%s(" % _camel(name); key = "local"
        else:
            eol = script.find("\n", m.end())
            if eol < 0:
                eol = len(script)
            if eol in todo_lines or "TODO Stage2(pcc 반입 2차)" in script[m.end():eol]:
                continue
            reason = _REASON_BY_NAME.get(name) or ("as-is 정의 없음(원본 JS 미제공 — 회신)" if name in IMPORT2_ABSENT else "as-is 공통(폼 전역 의존) — 반입 보류")
            out.append(script[pos:eol]); out.append("  " + IMPORT2_TODO % (name, reason)); pos = eol
            todo_lines.add(eol); log["todo"] = log.get("todo", 0) + 1
            continue
        out.append(script[pos:m.start()]); out.append(rep); pos = m.end()
        log[key] = log.get(key, 0) + 1
    out.append(script[pos:])
    return "".join(out), log


# ---------------------------------------------------------------- V47 키 입력 필터 → allowChar/ignoreChar (pcc 반입 2차 후속 · 2026-10-07)
# as-is 공통 fn_numPointCheck_minus() 류는 window.event.keyCode 로 키를 거르는 onkeydown/onkeypress 핸들러 본문이다. WebSquare 에서는 xf:input 의 allowChar(허용 문자)·
# ignoreChar(차단 문자) 속성이 같은 일을 선언적으로 한다(퍼블리싱도 allowChar="0-9-" 꼴을 쓴다). 핸들러 본문이 그 호출 하나뿐이고(try/catch·selfVar 프렐류드 허용) 대상이 실존 xf:input 이면
# 속성을 달고 핸들러 함수·ev:on<키이벤트>·publicInfo 항목을 지운다. 이미 다른 값의 같은 속성이 있으면 그대로(표지 유지).
_KEY_SPECIALS = " !&quot;#$%&amp;'()*+,-./:;&lt;=&gt;?@[\\]^_`{|}~"
KEY_FILTER_ATTR = {"fn_numPointCheck_minus": ("allowChar", "0-9.-"), "fn_numPointCheck": ("allowChar", "0-9."), "fn_telNoCheck": ("allowChar", "0-9-"),
                   "fn_engNumNotSpecCheck_ID": ("allowChar", "a-zA-Z0-9 -"), "fn_engNmCheck": ("allowChar", "a-zA-Z @().,_-"),
                   "fn_etcNotCheck": ("ignoreChar", _KEY_SPECIALS), "fn_etcNumNotCheck": ("ignoreChar", _KEY_SPECIALS + "0123456789")}
KEY_HANDLER_RE = re.compile(r"^(?P<comp>\w+)_on(?P<ev>keydown|keypress|keyup)$")
_KEY_TRY_RE = re.compile(r"^\s*try\s*\{(?P<inner>[\s\S]*?)\}\s*catch\s*\(\w+\)\s*\{[\s\S]*\}\s*$")
_KEY_PRELUDE_RE = re.compile(r"^\s*(?:const ev = e|const selfVar = \(ev && \(ev\.element \|\| ev\.target \|\| ev\.srcElement\)\) \|\| this);?\s*$")


def key_filter_to_allowchar(head, script, body):
    n = 0; todo = []
    for name, s, b, e, _ in reversed(st.func_spans(script)):
        hm = KEY_HANDLER_RE.match(name)
        if not hm:
            continue
        code = st.code_only(script[b + 1:e]).strip()
        tm = _KEY_TRY_RE.match(code)
        inner = tm.group("inner") if tm else code
        stmts = [t.strip() for t in re.split(r"[;\n]", inner) if t.strip() and not _KEY_PRELUDE_RE.match(t)]
        if len(stmts) != 1:
            continue
        cm = re.match(r"^(fn_\w+)\((?:selfVar)?\)$", stmts[0])
        if not cm or cm.group(1) not in KEY_FILTER_ATTR:
            continue
        attr, val = KEY_FILTER_ATTR[cm.group(1)]
        comp, ev = hm.group("comp"), hm.group("ev")
        tag = re.search(r'<xf:input\b[^>]*\sid="%s"[^>]*>' % re.escape(comp), body)
        if not tag:
            continue
        t = tag.group(0)
        has = re.search(r'\s%s="([^"]*)"' % attr, t)
        if has and has.group(1).replace("\\", "") != val.replace("\\", ""):     # 퍼블리싱의 "0-9.\-" 는 "0-9.-" 와 같은 집합
            # 퍼블리싱 디자인(기준)과 as-is 허용 문자가 다르다 — 어느 쪽도 임의로 고르지 않고 드러낸다
            seg = script[b + 1:e]
            cm2 = re.search(r"(?m)^([ \t]*%s\((?:selfVar)?\);?)[ \t]*$" % re.escape(cm.group(1)), seg)
            if cm2 and "TODO Stage2(pcc 반입 2차)" not in seg:
                note = '  // TODO Stage2(pcc 반입 2차): 키 입력 필터 %s — 퍼블리싱 %s="%s" ≠ as-is 허용 "%s"(확인 필요)' % (cm.group(1), attr, has.group(1), val)
                script = script[:b + 1 + cm2.end()] + note + script[b + 1 + cm2.end():]
                todo.append(name)
            continue
        t2 = re.sub(r'\sev:on%s="scwin\.%s"' % (ev, re.escape(name)), "", t)
        if not has:
            t2 = t2[:-2] + ' %s="%s"/>' % (attr, val) if t2.endswith("/>") else t2[:-1] + ' %s="%s">' % (attr, val)
        body = body[:tag.start()] + t2 + body[tag.end():]
        script, _d = pcc_fil_import._drop_definitions(script, {name})
        head = re.sub(r"(publicInfo method=\"[^\"]*?)(?:,scwin\.%s\b|scwin\.%s,|scwin\.%s\b)" % ((re.escape(name),) * 3), r"\1", head)
        n += 1
    log = {}
    if n:
        log["attr"] = n
    if todo:
        log["conflict"] = len(todo)
    return head, script, body, log


def apply(head, script, body):
    log = {}
    body_ids = set(re.findall(r'\sid="([^"]+)"', body))
    script, log["V34_focus"] = resolve_focus(script, body_ids)
    script, log["V35_rowcopy"] = standardize_rowcopy(script)
    script, log["V33_opener"] = simplify_opener(script)
    script, log["V32_static_nav"] = resolve_static_nav(script)
    script, log["V27_dialog"] = create_dialog_frame(script)
    script, log["V28_logsave"] = hold_log_save(script)
    script, log["V29_30_helpers"] = replace_pcc_and_cm(script)
    head, script, log["V31_pagecontext"] = ensure_page_context(head, script)
    script, log["V36_dom"] = dom_rules.apply(script, body)  # 규칙 19 기계 가능분(jQuery·원시 폼 → 컴포넌트 API, body 로 확정되는 것만)
    return head, script, body, {k: v for k, v in log.items() if v}


def main(argv=None):
    """제자리 적용 CLI(frozen 화면 등): python conversion/tools/vendor_stage2.py --v37|--v38|--v39|--v40|--v41|--v42|--v43|--v44|--v45|--v46|--v47 [--dry] <xml|폴더> ..."""
    sys.stdout.reconfigure(encoding="utf-8")
    args = argv if argv is not None else sys.argv[1:]
    files, fl, _ = st.parse_cli([a for a in args if a not in ("--v37", "--v38", "--v39", "--v40", "--v41", "--v42", "--v43", "--v44", "--v45", "--v46", "--v47")], flags=("--dry",), opts=())
    which = next((w for w in ("--v47", "--v46", "--v45", "--v44", "--v43", "--v42", "--v41", "--v40", "--v39", "--v38", "--v37") if w in args), None)
    if not which or not files:
        print(main.__doc__); return 2
    changed = 0; tot = {}
    for f in files:
        raw, eol, reg = st.read_xml(f)
        if reg is None:
            continue
        head, body = reg["head"], reg["body"]
        if which == "--v37":
            new, log = wrap_handler_trycatch(reg["script"], reg["head"])
        elif which == "--v39":
            new, log = simplify_sdd_guards(reg["script"], reg["head"], reg["body"])
        elif which == "--v40":
            new, log = simplify_innerhtml(reg["script"], reg["head"], reg["body"])
        elif which == "--v41":
            new, log = form_action_to_tx(reg["script"])
        elif which == "--v42":
            new, log = de_eval_member(reg["script"])
        elif which == "--v43":
            new, log = drop_unused_form_vars(reg["script"])
        elif which == "--v44":
            new, log = sel_email(reg["script"], reg["head"], reg["body"])
        elif which == "--v45":
            new, log = fix_format_number(reg["script"], reg["head"], reg["body"])
        elif which == "--v46":
            new, log = import_globals(reg["script"], reg["head"], reg["body"])
        elif which == "--v47":
            head, new, body, log = key_filter_to_allowchar(reg["head"], reg["script"], reg["body"])
        else:
            head, new, body, log = inline_fn_aliases(reg["head"], reg["script"], reg["body"])
        if new != reg["script"] or head != reg["head"] or body != reg["body"]:
            changed += 1
            for k, v in log.items():
                tot[k] = tot.get(k, 0) + (len(v) if isinstance(v, list) else v)
            print("%-18s %s" % (Path(f).stem, log))
            if not fl["--dry"]:
                st.write_xml(f, head, reg["script_open"], new, reg["script_close"], body, eol)
    print("변경 화면 %d · %s" % (changed, tot))
    return 0


if __name__ == "__main__":
    sys.exit(main())
