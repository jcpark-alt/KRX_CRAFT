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
    n = 0
    lines = script.split("\n")
    mask_all = cv.code_mask(script)
    pos = 0
    for i, l in enumerate(lines):
        s = l.strip()
        if s.startswith("$c.fil.doLogSave(") and s.endswith(";") and mask_all[pos + len(l) - len(l.lstrip())]:
            ind = l[:len(l) - len(l.lstrip())]
            lines[i] = ind + "/* TODO Stage2: 접속 로그 저장 보류(공급사 doLogSave — 운영 필요 여부 회신 ㉤ 뒤 결정) " + s.replace("*/", "* /") + " */"
            n += 1
        pos += len(l) + 1
    return "\n".join(lines), n


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


# ---------------------------------------------------------------- 진입
def apply(head, script, body):
    log = {}
    script, log["V27_dialog"] = create_dialog_frame(script)
    script, log["V28_logsave"] = hold_log_save(script)
    script, log["V29_30_helpers"] = replace_pcc_and_cm(script)
    head, script, log["V31_pagecontext"] = ensure_page_context(head, script)
    return head, script, body, {k: v for k, v in log.items() if v}
