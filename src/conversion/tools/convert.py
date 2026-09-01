# -*- coding: utf-8 -*-
"""
WebSquare XML 변환기 — websquare_conversion_guide.md §4.2 결정적(기계) 치환.

파일을 HEAD / SCRIPT(CDATA) / BODY 3영역으로 분리한 뒤, SCRIPT 에 문자열/주석/정규식을
보호하며 결정적 규칙을 적용한다. 규칙 7(레거시→gcc 공통함수)은 gcc_mapping 로더의
substitution_dict() 를 단일 출처로 사용한다.

적용 규칙(결정적):
  · 규칙 1 : scwin.vScrenID 멱등 삽입
  · 규칙 3 : ev:on* 바인딩 핸들러명 이벤트부 소문자화 + body/script 동기화
  · 규칙 5a: == / != -> === / !==   (>=,<=,=> 및 기존 ===,!== 제외)
  · 규칙 5b: X.value = RHS; -> X.setValue(RHS);  (단일라인 대입만, 읽기 제외)
  · 규칙 5c: X.src = RHS;   -> X.setBackgroundImage(RHS);  (단일라인 대입만, 읽기 제외)
  · 규칙 5d: X.getTotalRow() -> X.getRowCount()  (메서드명 치환, 수신 객체·인자 보존)
  · 규칙 7 : substitution_dict() 의 (태그없음·무충돌·순수식별자) 함수 호출부 단어경계 치환
  · 규칙 7m: 레거시 메서드 호출 {객체}.CloseFrame() -> $c.win.closePopup() (수신 객체 제거, 무인자만)
  · 규칙 7n: 이미 $c.<ns>. 붙은 레거시명 정규화 $c.stf.fn_setFromToDate( -> $c.stf.setFromToDate( (인자 보존)
  · 규칙 14: $c.<ns>.showObj/getObjectValue/setObjectValue/removeRow(컴포넌트,…) -> 컴포넌트.show("")/hide()/getValue()/setValue(…)/removeRows(…)
            (첫 인자=컴포넌트를 수신 객체로 승격; showObj 는 2번째 불리언 리터럴로 분기; removeRow→removeRows)
  · 규칙 15: $c.<ns>.alert_error(…) -> $c.win.alert(…)  (네임스페이스+이름 변경, 인자 보존)
  · 규칙 13: scwin.fn_* 정의 함수의 fn_ 제거 + camelCase 정규화, 정의·호출부(head/script/body) 동기화
  · 규칙 12: 같은 스코프의 {DC}.DataID = encode({url})|"리터럴" + {DC}.reset()|{DC}.Reset() 쌍을
            $c.sbm.executeDynamic(sbmOptions) 로 전환(주석 변형 포함, action=URL의 ? 앞 경로.
            Gauce 대문자 .Reset() 및 직접 문자열 리터럴 DataID 포함)
  · 규칙 17: [await] {recv}.CreateDialogFrame(id,url,title,left,top,width,height,type) ->
            $c.win.openPopup(url, options, data). type="window"→browserPopup(콜백 추가)/그 외→pageFramePopup.
            options.id=url 파일명(확장자 제거), left/top 드롭, 정수 width/height→"Npx". 윗줄 row 인자 호출 삭제.

판단 필요 항목(규칙 6 submission, 레거시 dataset API, 검토/대체·충돌 매핑 등)은 리포트로 출력.

CLI:
    python convert.py <src.xml> [out.xml]
    (out 생략 시 <src>.converted.xml)
"""
import re
import sys
import io
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gcc_mapping  # noqa: E402


# ---------- 영역 분리 ----------
def split_regions(raw):
    # 1) <script ...><![CDATA[ ... ]]></script> (표준)
    m = re.search(r'(<script[^>]*?>\s*<!\[CDATA\[)(.*?)(\]\]>\s*</script>)', raw, re.S)
    # 2) CDATA 래퍼 없는 <script ...> ... </script> (W-Craft 변환 편차)
    if not m:
        m = re.search(r'(<script[^>]*?>)(.*?)(</script>)', raw, re.S)
    if not m:
        return None
    return {
        "head": raw[:m.start()],
        "script_open": m.group(1),
        "script": m.group(2),
        "script_close": m.group(3),
        "body": raw[m.end():],
    }


# ---------- JS 코드/비코드(문자열·주석·정규식) 스캐너 ----------
def segments(code):
    segs, i, n, buf = [], 0, len(code), []
    def flush(is_code):
        if buf:
            segs.append(("".join(buf), is_code)); buf.clear()
    prev = ""
    while i < n:
        c, c2 = code[i], code[i:i+2]
        if c2 == "//":
            flush(True); j = code.find("\n", i); j = n if j < 0 else j
            segs.append((code[i:j], False)); i = j; continue
        if c2 == "/*":
            flush(True); j = code.find("*/", i+2); j = n if j < 0 else j+2
            segs.append((code[i:j], False)); i = j; continue
        if c in "\"'`":
            flush(True); q = c; j = i+1
            while j < n:
                if code[j] == "\\": j += 2; continue
                if code[j] == q: j += 1; break
                j += 1
            segs.append((code[i:j], False)); i = j; prev = "str"; continue
        if c == "/" and prev not in ("ident", ")", "]", "num", "str"):
            flush(True); j = i+1; incls = False
            while j < n:
                if code[j] == "\\": j += 2; continue
                if code[j] == "[": incls = True
                elif code[j] == "]": incls = False
                elif code[j] == "/" and not incls: j += 1; break
                elif code[j] == "\n": break
                j += 1
            segs.append((code[i:j], False)); i = j; prev = "str"; continue
        if c.isalnum() or c in "_$": prev = "ident"
        elif c in ")]": prev = c
        elif not c.isspace(): prev = c
        buf.append(c); i += 1
    flush(True)
    return segs


def format_comment_space(script, report=None):
    """라인 주석 `//` 바로 뒤에 공백 1개를 보장한다(code-convention 주석 규칙, 2026-09-01).
    섹션 헤더/구분선/마커(`///`, `//-`, `//=`, `//*`, `//#`, `//!` 등)와 문자열 내부는 제외. 멱등."""
    out = []
    cnt = 0
    for txt, is_code in segments(script):
        if (not is_code) and txt.startswith("//") and len(txt) > 2 and txt[2] not in " \t/*-=#!+~^|":
            txt = "// " + txt[2:]
            cnt += 1
        out.append(txt)
    if report is not None:
        report["fmt_comment_space"] = cnt
    return "".join(out)


def code_mask(code):
    mask = bytearray(len(code)); pos = 0
    for txt, is_code in segments(code):
        if is_code:
            for k in range(pos, pos+len(txt)): mask[k] = 1
        pos += len(txt)
    return mask


def depth_array(code):
    """각 위치 직전의 괄호 중첩 깊이. (코드 영역만 카운트, 문자열/주석 무시)"""
    mask = code_mask(code)
    depth = [0] * (len(code) + 1)
    d = 0
    for i, ch in enumerate(code):
        depth[i] = d
        if mask[i]:
            if ch in "([{":
                d += 1
            elif ch in ")]}":
                d -= 1
    depth[len(code)] = d
    return depth


# 이동 가능한 전역 변수의 RHS(순수 리터럴만). 호출/참조/연산식은 제외(실행순서 영향).
_LITERAL_RE = re.compile(r'^(?:"[^"]*"|\'[^\']*\'|-?\d+(?:\.\d+)?|true|false|null|undefined|\[\s*\]|\{\s*\})$')

# 규칙 4 영역 경계 — 5단계 정형화 구조 한 줄 슬래시 헤더 (src/docs/code-convention/code-convention.md)
def _sec_header(num, title):
    bar = "/" * 9
    return "%s %d. %s %s" % (bar, num, title, bar)


_SEC1_DECL = _sec_header(1, "변수 및 선언 영역")
_SEC2_INIT = _sec_header(2, "초기화 영역")
_SEC3_EVENT = _sec_header(3, "컴포넌트 이벤트 영역")
_SEC4_CALLBACK = _sec_header(4, "서브미션 콜백 영역")
_SEC5_GENERAL = _sec_header(5, "일반/업무 함수 영역")

# 구(舊) 한 줄 경계 주석 — 기존 변환분 재변환 시 블록 헤더로 마이그레이션(제거 후 재삽입)
_LEGACY_SEC = ("// 전역 변수 선언", "// scwin.onpageload, scwin.onpageunload 함수",
               "// WebSquare 컴포넌트 이벤트 함수", "// 일반 함수")

def _strip_section_headers(text, nums="2345", legacy=_LEGACY_SEC[1:]):
    """섹션 헤더(현행 한 줄 슬래시 형식 + 구(舊) 3줄 블록 형식)와 구 한 줄 경계 주석을 제거한다
    (재삽입 전 정리 → 멱등·형식 마이그레이션). 기본값은 규칙 4 소관인 2~5구역만 제거한다
    (1구역 선언 헤더는 규칙 2 소관이라 보존)."""
    # 현행: ///////// n. {영역명} /////////
    line_pat = re.compile(r'(?m)^[ \t]*/{5,}[ \t]*[' + nums + r']\.[^\n]*영역[^\n]*?/{5,}[ \t]*\r?\n?')
    # 구(舊) 3줄 블록: /**** \n * n. {영역명} \n ****/
    block_pat = re.compile(r'(?m)^[ \t]*/\*{10,}[ \t]*\n[ \t]*\*[ \t]*[' + nums
                           + r']\.[^\n]*영역[^\n]*\n[ \t]*\*{10,}/[ \t]*\r?\n?')
    text = block_pat.sub("", text)
    text = line_pat.sub("", text)
    return "\n".join(ln for ln in text.splitlines() if ln.strip() not in legacy)


# ---------- 규칙별 변환 ----------
def rule1_vscrenid(code, filename, report):
    if re.search(r'scwin\.vScrenID\s*=', code):
        report["rule1"] = "존재 → 생략(멱등)"
        return code
    report["rule1"] = '삽입'
    return '\nscwin.vScrenID = "%s";\n' % filename + code


def rule2_globals(code, report):
    """
    최상위(depth 0) 전역 변수 선언 `scwin.X = <리터럴>;` 을 vScrenID 하단
    `// 전역 변수 선언` 구역으로 모은다. 호출/참조 RHS 는 이동하지 않고 리포트로 분리.
    """
    if not re.search(r'scwin\.vScrenID\s*=', code):
        return code  # 규칙1 선행 필요
    depth = depth_array(code)
    decl = re.compile(r'(?m)^[ \t]*scwin\.([A-Za-z_$][\w$]*)\s*=\s*(.+?);[ \t]*(?://[^\n]*)?[ \t]*\r?\n?')
    moved, spans, skipped = [], [], []
    for mo in decl.finditer(code):
        name, rhs = mo.group(1), mo.group(2).strip()
        if name == "vScrenID" or depth[mo.start()] != 0:
            continue
        if not _LITERAL_RE.match(rhs):
            if "function" not in rhs and "=>" not in rhs:   # 함수정의는 전역변수 아님(무시)
                skipped.append("scwin.%s = %s" % (name, rhs[:48]))
            continue
        moved.append(mo.group(0).strip())
        spans.append((mo.start(), mo.end()))

    if skipped:
        report["rule2_skip"] = skipped
    if not moved:
        return code

    res = code
    for s, e in sorted(spans, reverse=True):
        res = res[:s] + res[e:]
    # 기존 경계 주석/1구역 헤더(현행 슬래시·구 블록 형식) 제거(중복 방지) 후 vScrenID 바로 아래에 재삽입
    res = re.sub(r'(?m)^[ \t]*//[ \t]*전역 변수 선언[ \t]*\r?\n?', '', res)
    res = re.sub(r'(?m)^[ \t]*/{5,}[ \t]*1\.[^\n]*영역[^\n]*?/{5,}[ \t]*\r?\n?', '', res)
    res = re.sub(r'(?m)^[ \t]*/\*{10,}[ \t]*\n[ \t]*\*[ \t]*1\.[^\n]*영역[^\n]*\n[ \t]*\*{10,}/[ \t]*\r?\n?', '', res)
    # 앵커는 "최상위" vScrenID 대입만 — 원본이 onpageload 등 함수 내부에서만 설정하는 파일에서
    # 함수 몸통 안으로 선언 블록이 삽입되던 결함 방지. 최상위 대입이 없으면 스크립트 최상단에 둔다.
    res_depth = depth_array(res)
    at = None
    for a in re.finditer(r'scwin\.vScrenID\s*=\s*[^;\n]*;[ \t]*(?://[^\n]*)?\r?\n?', res):
        if res_depth[a.start()] == 0:
            at = a.end()
            break
    block = _SEC1_DECL + "\n" + "\n".join(moved) + "\n"
    if at is None:
        lead = re.match(r'\s*', res).group(0)   # 선두 개행 유지
        res = lead + block + res[len(lead):]
    else:
        res = res[:at] + block + res[at:]
    report["rule2"] = len(moved)
    return res


def rule5a_strict_eq(code, report):
    cnt = [0]
    def sub_seg(s):
        s = re.sub(r'(?<![=!<>])==(?!=)', lambda m: (cnt.__setitem__(0, cnt[0]+1) or "==="), s)
        s = re.sub(r'(?<![<>])!=(?!=)', lambda m: (cnt.__setitem__(0, cnt[0]+1) or "!=="), s)
        return s
    out = [sub_seg(t) if c else t for t, c in segments(code)]
    report["rule5a"] = cnt[0]
    return "".join(out)


def rule5e_neg_compare(code, report):
    """`!X === Y` 연산자 우선순위 버그를 `X !== Y` 로 교정한다(규칙 5 보강).
    (!X 가 boolean 으로 평가된 뒤 Y 와 비교되어, 의도한 "불일치 비교"와 다르게 동작하는 실수 패턴)
    X 는 식별자 체인만 대상(호출·괄호식 제외 — 보수적). 코드 세그먼트만 치환하고 건별 리포트한다."""
    mask = code_mask(code)
    pat = re.compile(r'!\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*===(?!=)')
    res, last = [], 0
    for mo in pat.finditer(code):
        if not mask[mo.start()]:
            continue
        report.setdefault("rule5e", []).append(mo.group(0).strip() + " → " + mo.group(1) + " !==")
        res.append(code[last:mo.start()])
        res.append(mo.group(1) + " !==")
        last = mo.end()
    res.append(code[last:])
    return "".join(res)


def rule5b_setvalue(code, report):
    mask = code_mask(code)
    pat = re.compile(r'(\b[\w$]+(?:\.[\w$]+)*)\.value\s*=\s*(?!=)([^;\n]+);')
    res, last = [], 0
    for mo in pat.finditer(code):
        if not mask[mo.start()]:
            continue
        report["rule5b"].append(mo.group(0).strip())
        res.append(code[last:mo.start()])
        res.append(mo.group(1) + ".setValue(" + mo.group(2).strip() + ");")
        last = mo.end()
    res.append(code[last:])
    return "".join(res)


def rule5c_setbgimage(code, report):
    mask = code_mask(code)
    pat = re.compile(r'(\b[\w$]+(?:\.[\w$]+)*)\.src\s*=\s*(?!=)([^;\n]+);')
    res, last = [], 0
    for mo in pat.finditer(code):
        if not mask[mo.start()]:
            continue
        report["rule5c"].append(mo.group(0).strip())
        res.append(code[last:mo.start()])
        res.append(mo.group(1) + ".setBackgroundImage(" + mo.group(2).strip() + ");")
        last = mo.end()
    res.append(code[last:])
    return "".join(res)


# 레거시 메서드명 → 표준 메서드명(수신 객체·인자 보존). 규칙 7m(수신 객체 제거)과 다름.
_METHOD_RENAME_MAP = {
    "getTotalRow": "getRowCount",   # {dataCollection}.getTotalRow() → .getRowCount()
}


def rule5d_method_rename(code, report):
    """`{객체}.getTotalRow()` 같은 메서드명을 표준 메서드명(`getRowCount`)으로 치환한다.
    수신 객체와 인자는 보존하고 메서드명만 바꾼다. 코드 세그먼트(문자열/주석/정규식 제외)만 치환."""
    if not _METHOD_RENAME_MAP:
        return code
    mask = code_mask(code)
    nm = "|".join(re.escape(n) for n in sorted(_METHOD_RENAME_MAP, key=len, reverse=True))
    pat = re.compile(r'\.(' + nm + r')(\s*\()')
    res, last = [], 0
    for mo in pat.finditer(code):
        if not mask[mo.start()]:
            continue
        old = mo.group(1)
        res.append(code[last:mo.start()])
        res.append("." + _METHOD_RENAME_MAP[old] + mo.group(2))
        report["rule5d"].append("%s() -> %s()" % (old, _METHOD_RENAME_MAP[old]))
        last = mo.end()
    res.append(code[last:])
    return "".join(res)


def rule3_handlers(script, body, report):
    names = set(re.findall(r'ev:on[\w-]+="\s*scwin\.([\w$]+)\s*"', body))
    for nm in names:
        idx = nm.lower().rfind("_on")
        if idx < 0:
            continue
        new = nm[:idx] + nm[idx:].lower()
        if new == nm:
            continue
        body = re.sub(r'(scwin\.)' + re.escape(nm) + r'\b', r'\1' + new, body)
        script = re.sub(r'(scwin\.)' + re.escape(nm) + r'\b', r'\1' + new, script)
        report["rule3"].append("%s -> %s" % (nm, new))
    return script, body


def _camel_strip_fn(name):
    """'fn_' 접두어를 제거하고 camelCase 로 변환. (fn_setFromToDate→setFromToDate,
    fn_OpenRecvDetail→openRecvDetail, fn_in_charge→inCharge) 변환 불가/무변화면 None."""
    if not name.startswith("fn_"):
        return None
    parts = [p for p in name[3:].split("_") if p]
    if not parts:
        return None
    new = (parts[0][0].lower() + parts[0][1:]) + "".join(p[0].upper() + p[1:] for p in parts[1:])
    return new if new and new != name else None


def rule13_rename_scwin_fn(head, script, body, report):
    """scwin.fn_* 로 '정의'된 함수의 fn_ 접두어를 제거하고 camelCase 로 정규화한 뒤,
    정의·호출부(head publicInfo/submission, script, body ev:on*)를 모두 갱신한다.
    - 같은 파일에 정의된 함수만 대상(로컬 정의 우선).
    - 대상명이 (개명되지 않는) 기존 함수명과 겹치거나 둘 이상이 같은 이름으로 수렴하면 보류·리포트(충돌 방지)."""
    defined = list(dict.fromkeys(re.findall(
        r'scwin\.(fn_[A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function', script)))
    if not defined:
        return head, script, body
    all_defs = set(re.findall(r'scwin\.([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function', script))
    cand = {}
    for old in defined:
        new = _camel_strip_fn(old)
        if new:
            cand[old] = new
    keep_names = all_defs - set(cand)              # 이번에 바뀌지 않는 기존 함수명
    newcount = {}
    for v in cand.values():
        newcount[v] = newcount.get(v, 0) + 1
    rename, skipped = {}, []
    for old, new in cand.items():
        if newcount[new] > 1 or new in keep_names:
            skipped.append("%s → %s" % (old, new))
            continue
        rename[old] = new
    if rename:
        pat = re.compile(r'(scwin\.)(' + "|".join(re.escape(o) for o in rename) + r')\b')
        script = _replace_in_code(script, pat, lambda m: m.group(1) + rename[m.group(2)])
        head = pat.sub(lambda m: m.group(1) + rename[m.group(2)], head)
        body = pat.sub(lambda m: m.group(1) + rename[m.group(2)], body)
        # bare 참조 동기화 — 접두 없는 잔존 참조(`scwin.fn_GetPar = fn_GetReturn;` 의 RHS 등)를 scwin.{신이름} 으로 교정
        bare = re.compile(r'(?<![.\w$])(' + "|".join(re.escape(o) for o in rename) + r')\b')
        script = _replace_in_code(script, bare, lambda m: "scwin." + rename[m.group(1)])
        report["rule13"] = ["%s → %s" % (o, n) for o, n in rename.items()]
    if skipped:
        report["judgment"].append("규칙13 scwin.fn_* 정규화 보류(충돌): " + ", ".join(skipped))
    return head, script, body


def _is_reassigned(code, mask, name):
    """name 이 선언 이후 재할당/증감되는지(코드 영역에서). 불확실하면 True(=let) 쪽으로 보수적."""
    esc = re.escape(name)
    # 대입(=, +=, -=, ...) — 선언의 'name =' 한 건은 정상이므로 2건 이상이면 재할당
    eq = re.compile(r'(?<![.\w$])' + esc + r'\s*(?:=(?!=)|[-+*/%&|^]=|<<=|>>=)')
    inc = re.compile(r'(?<![.\w$])' + esc + r'\s*(?:\+\+|--)|(?:\+\+|--)\s*' + esc + r'(?![\w$])')
    eq_n = inc_n = 0
    pos = 0
    for txt, is_code in segments(code):
        if is_code:
            eq_n += len(eq.findall(txt))
            inc_n += len(inc.findall(txt))
        pos += len(txt)
    return (eq_n > 1) or (inc_n > 0)


def rule8_var(code, report):
    """var → const/let. 단일·초기화·미재할당만 const, 그 외(다중/구조분해/무초기화/재할당/for) 는 let."""
    mask = code_mask(code)
    n = len(code)
    edits = []  # (start, end, keyword)
    for mo in re.finditer(r'(?<![.\w$])var(?![\w$])', code):
        if not mask[mo.start()]:
            continue
        # for (var ...) 루프 변수 → let
        in_for = re.search(r'\bfor\s*\(\s*$', code[:mo.start()]) is not None
        # var 뒤 첫 토큰 분석
        i = mo.end()
        while i < n and (not mask[i] or code[i].isspace()):
            i += 1
        if i >= n:
            continue
        if code[i] in "{[":          # 구조분해 → let
            edits.append((mo.start(), mo.end(), "let")); continue
        nm = re.match(r'[A-Za-z_$][\w$]*', code[i:])
        if not nm:
            continue
        name = nm.group(0)
        j = i + len(name)
        # 이름 뒤 첫 의미 문자로 초기화(=) 여부 판정
        while j < n and (not mask[j] or code[j].isspace()):
            j += 1
        has_init = (j < n and code[j] == "=" and code[j:j+2] != "==")
        # 다중 선언 여부: 문장 끝(;)까지 최상위 콤마 존재?
        depth, k, multi = 0, j, False
        while k < n:
            if not mask[k]:
                k += 1; continue
            c = code[k]
            if c in "([{":
                depth += 1
            elif c in ")]}":
                if depth == 0:
                    break
                depth -= 1
            elif c == ";" and depth == 0:
                break
            elif c == "," and depth == 0:
                multi = True; break
            k += 1
        if in_for or multi or (not has_init):
            kw = "let"
        else:
            kw = "let" if _is_reassigned(code, mask, name) else "const"
        edits.append((mo.start(), mo.end(), kw))

    if not edits:
        return code
    res, last, c_n, l_n = [], 0, 0, 0
    for s, e, kw in edits:
        res.append(code[last:s]); res.append(kw); last = e
        if kw == "const": c_n += 1
        else: l_n += 1
    res.append(code[last:])
    report["rule8"] = {"const": c_n, "let": l_n}
    return "".join(res)


_OBSOLETE_CM = "ShowWin|ShowNoData|CloseWin|ShowTrWin|CloseTrWin"


def rule9_remove_obsolete(code, report):
    """
    불필요 공통함수 호출($c.cm.ShowWin/ShowNoData/CloseWin/ShowTrWin/CloseTrWin)을
    단독 statement 라인 단위로 제거(활성 코드 + 주석처리된 W-Craft 흔적 모두).
    - 활성 호출은 문자열 내부면 스킵(리터럴 보호).
    - 직전 줄이 중괄호 없는 제어문 헤더(if/for/while/else …)) 이면 본문 손상 방지를 위해 보류·리포트.
    """
    mask = code_mask(code)
    pat = re.compile(r'(?m)^[ \t]*(/+[ \t]*)?\$c\.cm\.(?:' + _OBSOLETE_CM + r')\b[^\n]*\n?')
    spans, removed, skipped = [], 0, []
    for mo in pat.finditer(code):
        commented = bool(mo.group(1))
        cpos = mo.start() + mo.group(0).index("$c.cm.")
        if not commented:
            if not mask[cpos]:
                continue  # 문자열/비코드 내부
            prev_lines = [l for l in code[:mo.start()].splitlines() if l.strip() != ""]
            prevline = prev_lines[-1].strip() if prev_lines else ""
            braceless = (prevline == "else"
                         or (re.match(r'^(if|for|while|else\s+if|else)\b', prevline)
                             and prevline.endswith(")") and not prevline.endswith("{")))
            if braceless:
                skipped.append(prevline[:40])
                continue
        spans.append((mo.start(), mo.end()))
        removed += 1
    for s, e in sorted(spans, reverse=True):
        code = code[:s] + code[e:]
    report["rule9"] = removed
    if skipped:
        report["judgment"].append("규칙9 제거 보류(중괄호 없는 제어문 본문): " + ", ".join(skipped))
    return code


def _defined_function_names(code):
    """스크립트에서 함수로 '선언/정의'된 이름 집합. (이 이름들은 rule7 gcc 치환에서 제외)"""
    names = set()
    patterns = [
        r'(?<![.\w$])([A-Za-z_$][\w$]*)\s*[:=]\s*(?:async\s+)?function\b',     # NAME = function / NAME: function
        r'\bscwin\.([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function\b',          # scwin.NAME = function
        r'(?<![.\w$])([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^()]*\)\s*=>',   # NAME = (..) =>
        r'\bscwin\.([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^()]*\)\s*=>',     # scwin.NAME = (..) =>
        r'\bfunction\s+([A-Za-z_$][\w$]*)\s*\(',                               # function NAME(
    ]
    for pat in patterns:
        for m in re.finditer(pat, code):
            names.add(m.group(1))
    return names


def rule11_remove_include(code, report):
    """스크립트 영역에서 `include(...)` 로 시작하는 라인을 삭제(활성 + 주석 처리 모두). 문자열 내부 보호."""
    mask = code_mask(code)
    pat = re.compile(r'(?m)^[ \t]*(/+[ \t]*)?include\b\s*\([^\n]*\r?\n?')
    spans, removed = [], 0
    for mo in pat.finditer(code):
        commented = bool(mo.group(1))
        cpos = mo.start() + mo.group(0).index("include")
        if not commented and not mask[cpos]:
            continue   # 문자열/비코드 내부
        spans.append((mo.start(), mo.end()))
        removed += 1
    for s, e in sorted(spans, reverse=True):
        code = code[:s] + code[e:]
    report["rule11"] = removed
    return code


# 레거시 메서드 호출(수신 객체 보유) → gcc 공통함수 매핑. 규칙 7(순수 식별자 호출)과 달리
# `{객체}.method()` 형태 전체를 인자 없는 gcc 호출로 치환(수신 객체 제거).
_METHOD_CALL_MAP = {
    "CloseFrame": "$c.win.closePopup",   # {객체}.CloseFrame() → $c.win.closePopup()
}


def rule7m_method_substitute(code, report):
    """`{객체}.CloseFrame()` 등 레거시 메서드 호출을 gcc 공통함수 호출로 치환(수신 객체 제거).
    - 수신 객체는 식별자 체인(`frame`, `$c.frame` 등)을 포괄하며 인자 없는 호출만 대상.
    - 코드 세그먼트(문자열/주석/정규식 제외)만 치환. `await` 등 선행 토큰은 보존.
    - 변환된 호출 바로 위의 W-Craft 검수 마커(메서드명 언급)는 함께 제거(규칙 12 동일 원칙).
    - 인자가 있는 동일 메서드 호출은 동작 차이 가능성으로 보류·리포트."""
    if not _METHOD_CALL_MAP:
        return code
    mask = code_mask(code)
    nm = "|".join(re.escape(n) for n in sorted(_METHOD_CALL_MAP, key=len, reverse=True))
    pat = re.compile(r'(?<![.\w$])([\w$]+(?:\.[\w$]+)*)\.(' + nm + r')\s*\(([^()]*)\)')
    res, last = [], 0
    for mo in pat.finditer(code):
        if not mask[mo.start()]:
            continue
        recv, method, args = mo.group(1), mo.group(2), mo.group(3).strip()
        if args:
            report["judgment"].append("규칙7m 메서드 치환 보류(인자 있음): " + mo.group(0).strip())
            continue
        prefix = code[last:mo.start()]
        ls = code.rfind("\n", 0, mo.start()) + 1            # 호출 라인 시작
        if ls > last:                                        # 바로 위 라인 검사(메서드명 언급 W-Craft 마커)
            p_ls = code.rfind("\n", 0, ls - 1) + 1
            prevline = code[p_ls:ls]
            if p_ls >= last and _WCRAFT_MARK.match(prevline) and method in prevline:
                prefix = code[last:p_ls] + code[ls:mo.start()]
        res.append(prefix)
        res.append(_METHOD_CALL_MAP[method] + "()")
        report["rule7m"].append("%s.%s() -> %s()" % (recv, method, _METHOD_CALL_MAP[method]))
        last = mo.end()
    res.append(code[last:])
    return "".join(res)


def rule7n_normalize_module_fn(code, report):
    """이미 `$c.<ns>.` 네임스페이스가 붙었지만 함수명이 레거시인 호출
    (`$c.stf.fn_setFromToDate(` 등)을 gcc 정규명(`$c.stf.setFromToDate(`)으로 정규화한다.
    매핑은 gcc_mapping.module_fn_dict()(src/as-is/*/gcc/*.xml 의 JSDoc AS-IS↔@name)가 단일 출처.
    인자는 보존(이름만 정규화)하고, 코드 세그먼트(문자열/주석/정규식 제외)만 치환한다."""
    fmap = gcc_mapping.module_fn_dict()
    if not fmap:
        return code
    mask = code_mask(code)
    keys = sorted(fmap, key=len, reverse=True)   # 긴 키 우선(부분 겹침 방지)
    pat = re.compile(r'(?<![.\w$])(' + "|".join(re.escape(k) for k in keys) + r')(\s*\()')
    res, last = [], 0
    for mo in pat.finditer(code):
        if not mask[mo.start()]:
            continue
        key = mo.group(1)
        res.append(code[last:mo.start()])
        res.append(fmap[key] + mo.group(2))
        report["rule7n"].append("%s() -> %s()" % (key, fmap[key]))
        last = mo.end()
    res.append(code[last:])
    return "".join(res)


def _scan_call(code, mask, open_idx):
    """open_idx 는 호출의 '(' 위치. 최상위(콤마) 인자 리스트와 닫는 ')' 다음 인덱스를
    (args, end) 로 반환한다. 문자열/주석/정규식(mask==0)은 무시. 괄호 불균형이면 None."""
    n, depth, i = len(code), 0, open_idx
    args, cur = [], open_idx + 1
    while i < n:
        if mask[i]:
            c = code[i]
            if c in "([{":
                depth += 1
            elif c in ")]}":
                depth -= 1
                if depth == 0:
                    last = code[cur:i].strip()
                    if last != "" or args:
                        args.append(last)
                    return args, i + 1
            elif c == "," and depth == 1:
                args.append(code[cur:i].strip())
                cur = i + 1
        i += 1
    return None


# 규칙 14: 컴포넌트를 첫 인자로 받던 레거시 모듈 공통함수 → 컴포넌트 네이티브 메서드(수신 객체 승격)
_COMPONENT_METHODS = ("showObj", "getObjectValue", "setObjectValue", "removeRow")


def _rule14_build(method, args, snippet, report):
    """매핑 치환 문자열을 만든다. 인자 개수/형태가 매핑과 안 맞으면 None(보류·리포트)."""
    if method == "showObj":
        if len(args) != 2:
            report["judgment"].append("규칙14 showObj 보류(인자 %d개): %s" % (len(args), snippet))
            return None
        comp, flag = args[0], args[1]
        if flag == "true":      # 인자 ""을 넘겨 이전 display 속성 유지
            report["rule14"].append('showObj(%s, true) -> %s.show("")' % (comp, comp))
            return '%s.show("")' % comp
        if flag == "false":
            report["rule14"].append("showObj(%s, false) -> %s.hide()" % (comp, comp))
            return "%s.hide()" % comp
        report["judgment"].append("규칙14 showObj 2번째 인자 비리터럴(동적) 보류: " + snippet)
        return None
    if method == "getObjectValue":
        if len(args) != 1:
            report["judgment"].append("규칙14 getObjectValue 보류(인자 %d개): %s" % (len(args), snippet))
            return None
        comp = args[0]
        report["rule14"].append("getObjectValue(%s) -> %s.getValue()" % (comp, comp))
        return "%s.getValue()" % comp
    if method == "removeRow":   # $c.cp.removeRow(comp, row) -> comp.removeRows(row)
        if len(args) != 2:
            report["judgment"].append("규칙14 removeRow 보류(인자 %d개): %s" % (len(args), snippet))
            return None
        comp, row = args[0], args[1]
        report["rule14"].append("removeRow(%s, …) -> %s.removeRows(…)" % (comp, comp))
        return "%s.removeRows(%s)" % (comp, row)
    # setObjectValue
    if len(args) != 2:
        report["judgment"].append("규칙14 setObjectValue 보류(인자 %d개): %s" % (len(args), snippet))
        return None
    comp, val = args[0], args[1]
    report["rule14"].append("setObjectValue(%s, …) -> %s.setValue(…)" % (comp, comp))
    return "%s.setValue(%s)" % (comp, val)


def rule14_component_method(code, report):
    """`$c.<ns>.showObj/getObjectValue/setObjectValue/removeRow(컴포넌트, …)` 를 컴포넌트 네이티브
    메서드 호출로 치환(첫 인자=컴포넌트를 수신 객체로 승격). 인자 안의 중첩 호출도 재귀로 함께 변환한다.
    showObj 는 2번째 불리언 리터럴(true/false)일 때만 show("")/hide() 로 분기.
    removeRow(comp, row) 는 comp.removeRows(row) 로 승격. 리터럴 내부 보호."""
    pat = re.compile(r'\$c\.[A-Za-z_$][\w$]*\.(' + "|".join(_COMPONENT_METHODS) + r')\s*\(')
    mask = code_mask(code)
    res, last = [], 0
    for mo in pat.finditer(code):
        if mo.start() < last or not mask[mo.start()]:
            continue
        scanned = _scan_call(code, mask, mo.end() - 1)
        if scanned is None:
            continue
        args, end = scanned
        args = [rule14_component_method(a, report) for a in args]   # 중첩 호출 선처리
        repl = _rule14_build(mo.group(1), args, code[mo.start():end], report)
        if repl is None:
            continue
        res.append(code[last:mo.start()])
        res.append(repl)
        last = end
    res.append(code[last:])
    return "".join(res)


def rule15_alert_error(code, report):
    """`$c.<ns>.alert_error(...)` 를 `$c.win.alert(...)` 로 치환(네임스페이스+이름 변경, 인자 보존).
    문구 지정/콜백이 필요하면 $c.win.messageBox 로 수동 보강(리포트 안내). 리터럴 내부 보호."""
    mask = code_mask(code)
    pat = re.compile(r'\$c\.[A-Za-z_$][\w$]*\.alert_error(\s*\()')
    res, last = [], 0
    for mo in pat.finditer(code):
        if not mask[mo.start()]:
            continue
        res.append(code[last:mo.start()])
        res.append("$c.win.alert" + mo.group(1))
        report["rule15"].append(code[mo.start():mo.end()].strip() + " -> $c.win.alert(")
        last = mo.end()
    res.append(code[last:])
    code = "".join(res)
    if report["rule15"]:
        report["judgment"].append(
            "규칙15 alert_error→$c.win.alert 적용(%d건): 에러 문구·콜백 필요 시 $c.win.messageBox 로 수동 보강 검토"
            % len(report["rule15"]))
    return code


def rule20_grid_excel_download(code, report):
    """`{gridView}.advancedExcelDownload(options[, infoArr])` 그리드 엑셀 다운로드 메서드 호출을
    공통함수 `$c.data.downloadGridViewExcel({gridView}, options[, infoArr])` 로 치환한다.
    - 수신 객체(그리드 id/식별자 체인)를 첫 인자로 승격하고 기존 인자는 그대로 유지한다.
    - 인자 안의 중첩 괄호/객체 리터럴(`{fileName:...}`)도 _scan_call 로 정확히 파싱한다.
    - 코드 세그먼트(문자열/주석/정규식 제외)만 치환하고 `await` 등 선행 토큰은 보존한다.
    - 변환된 호출 바로 위의 W-Craft 검수 마커(메서드명 언급)는 함께 제거(규칙 7m/12 동일 원칙).
    - 결과 호출에는 `.advancedExcelDownload` 가 없으므로 재변환 시 no-op(멱등)."""
    mask = code_mask(code)
    pat = re.compile(r'(?<![.\w$])([\w$]+(?:\.[\w$]+)*)\.advancedExcelDownload\s*\(')
    res, last = [], 0
    for mo in pat.finditer(code):
        if mo.start() < last or not mask[mo.start()]:
            continue
        scanned = _scan_call(code, mask, mo.end() - 1)
        if scanned is None:
            continue
        args, end = scanned
        recv = mo.group(1)
        new_args = ", ".join([recv] + args)
        prefix = code[last:mo.start()]
        ls = code.rfind("\n", 0, mo.start()) + 1            # 호출 라인 시작
        if ls > last:                                        # 바로 위 라인 검사(메서드명 언급 W-Craft 마커)
            p_ls = code.rfind("\n", 0, ls - 1) + 1
            prevline = code[p_ls:ls]
            if p_ls >= last and _WCRAFT_MARK.match(prevline) and "advancedExcelDownload" in prevline:
                prefix = code[last:p_ls] + code[ls:mo.start()]
        res.append(prefix)
        res.append("$c.data.downloadGridViewExcel(" + new_args + ")")
        report["rule20"].append("%s.advancedExcelDownload(...) -> $c.data.downloadGridViewExcel(%s, ...)" % (recv, recv))
        last = end
    res.append(code[last:])
    return "".join(res)


_EMPTY_ARG = ('""', "''", "")


def rule20b_normalize_excel_positional(code, report):
    """레거시 위치인자 형태 `$c.data.downloadGridViewExcel(grid, fileName, sheetName, type)`(정확히 4인자)를
    공통함수 객체 시그니처 `$c.data.downloadGridViewExcel(grid, {fileName:…[, sheetName:…][, type:…]})` 로 정규화한다.
    - 2번째(파일명)→options.fileName, 4번째(0/1/2/8 등)→options.type, 3번째(시트명)는 비어있으면 생략·아니면 sheetName.
    - 객체 시그니처(2~3인자) 호출은 인자 수가 4가 아니므로 건드리지 않는다(멱등). 인자 토큰은 원형 보존.
    - 코드 세그먼트(문자열/주석/정규식 제외)만 치환. 결과는 2인자라 재변환 시 no-op."""
    mask = code_mask(code)
    pat = re.compile(r'(?<![.\w$])\$c\.data\.downloadGridViewExcel\s*\(')
    res, last = [], 0
    for mo in pat.finditer(code):
        if mo.start() < last or not mask[mo.start()]:
            continue
        scanned = _scan_call(code, mask, mo.end() - 1)
        if scanned is None:
            continue
        args, end = scanned
        if len(args) != 4:        # 위치인자 레거시 형태만(객체형 2~3인자는 제외)
            continue
        grid, fname, sheet, typ = args
        opts = ["fileName: " + fname]
        if sheet not in _EMPTY_ARG:
            opts.append("sheetName: " + sheet)
        if typ not in _EMPTY_ARG:
            opts.append("type: " + typ)
        res.append(code[last:mo.start()])
        res.append("$c.data.downloadGridViewExcel(%s, {%s})" % (grid, ", ".join(opts)))
        report["rule20"].append("downloadGridViewExcel(%s, 위치인자) -> 객체형 {%s}" % (grid, ", ".join(opts)))
        last = end
    res.append(code[last:])
    return "".join(res)


def rule21_frame_provider(code, report):
    """레거시 Gauce 프레임 접근 `{recv}.Provider("../")`(부모 1단계)를 gcc 공통함수 `$c.win.getParent()` 로 치환한다.
    - `$c.win.getParent()` 는 `$p.parent()`(부모 pageFrame)를 반환하며 `Provider("../")` 와 동일 의미.
    - **정확히 `"../"`/`'../'` 리터럴 인자만** 대상. `/top`(상위)·`../../`·동적경로(`"../"+x`)·형제프레임(`../name`)은 대응 공통함수가 없어 미변환·리포트.
    - 수신 객체(`frame` 등)는 제거. 반환된 부모 pageFrame 에서 데이터셋/컴포넌트는 직접(`getParent().dlt_x`), scwin 변수/함수는 `.scwin` 경유(JSDoc) — 후속 멤버 접근 형태는 단계 2 검토.
    - 코드 세그먼트(문자열/주석/정규식 제외)만 치환. 결과에 `.Provider(` 없어 재변환 no-op(멱등)."""
    mask = code_mask(code)
    pat = re.compile(r'(?<![.\w$])[\w$]+(?:\.[\w$]+)*\.Provider\(\s*(?:"\.\./"|\'\.\./\')\s*\)')
    res, last = [], 0
    for mo in pat.finditer(code):
        if mo.start() < last or not mask[mo.start()]:
            continue
        res.append(code[last:mo.start()])
        res.append("$c.win.getParent()")
        report["rule21"].append(mo.group(0).strip() + " -> $c.win.getParent()")
        last = mo.end()
    res.append(code[last:])
    out = "".join(res)
    # 미변환 Provider(비-"../": /top·../../·동적·형제프레임)는 대응 공통함수 없음 → 단계 2 검토 리포트
    leftover = re.compile(r'(?<![.\w$])[\w$]+(?:\.[\w$]+)*\.Provider\(')
    omask = code_mask(out)
    for mo in leftover.finditer(out):
        if omask[mo.start()]:
            snippet = out[mo.start():out.find(")", mo.start()) + 1]
            report["judgment"].append("규칙21 Provider 미변환(대응 공통함수 없음, 단계2 검토): " + snippet.strip())
    return out


def rule23_grid_visible_rownum_all(code, report):
    """그리드 전체 행 표시 `{grid}.setVisibleRowNum("all")` 을 `$c.util.setGridVisibleRowNum({grid}, "all")` 로 치환한다.
    - 엔진 gridView.setVisibleRowNum 은 숫자 전용(parseInt NaN → false 반환)이라 "all" 인자는 **조용히 거부**됨 —
      gcc 공통함수 $c.util.setGridVisibleRowNum 이 "all"(전체 행 재도색)을 지원한다.
    - **정확히 "all"/'all' 리터럴 인자만** 대상. 숫자/변수 인자는 엔진 API 로 유효하므로 무변환.
    - 수신 객체(그리드)를 첫 인자로 승격(규칙 20 동일 방향). 식별자 체인 수신만 대상이며,
      호출 체인 수신(`$p.getComponentById("x").setVisibleRowNum("all")`)은 보류·리포트(단계 2).
    - 코드 세그먼트(문자열/주석/정규식 제외)만 치환. 결과에 `.setVisibleRowNum("all")` 없어 재변환 no-op(멱등)."""
    mask = code_mask(code)
    pat = re.compile(r'(?<![.\w$])([\w$]+(?:\.[\w$]+)*)\.setVisibleRowNum\(\s*(?:"all"|\'all\')\s*\)')
    res, last = [], 0
    for mo in pat.finditer(code):
        if mo.start() < last or not mask[mo.start()]:
            continue
        recv = mo.group(1)
        res.append(code[last:mo.start()])
        res.append('$c.util.setGridVisibleRowNum(%s, "all")' % recv)
        report["rule23"].append(mo.group(0).strip() + ' -> $c.util.setGridVisibleRowNum(%s, "all")' % recv)
        last = mo.end()
    res.append(code[last:])
    out = "".join(res)
    # 호출 체인 수신 등 미변환 "all" 호출은 엔진이 거부하는 죽은 코드 → 단계 2 검토 리포트
    leftover = re.compile(r'\.setVisibleRowNum\(\s*(?:"all"|\'all\')\s*\)')
    omask = code_mask(out)
    for mo in leftover.finditer(out):
        if omask[mo.start()]:
            line_start = out.rfind("\n", 0, mo.start()) + 1
            snippet = out[line_start:mo.end()]
            report["judgment"].append("규칙23 setVisibleRowNum(\"all\") 미변환(호출 체인 수신 등, 단계2 검토): " + snippet.strip())
    return out


def rule7_gcc_substitute(code, report):
    """substitution_dict() 의 함수 호출부를 단어경계로 치환(코드 세그먼트만, 메서드 호출 .fn() 제외).
    파일 내에 함수로 선언/정의된 이름은 치환에서 제외한다(로컬 정의 우선, 선언부 손상 방지)."""
    sub = gcc_mapping.substitution_dict()
    defined = _defined_function_names(code)
    excluded = sorted(n for n in sub if n in defined)
    if excluded:
        sub = {k: v for k, v in sub.items() if k not in defined}
        report["rule7_excluded"] = excluded
    mask = code_mask(code)
    # 길이가 긴 이름부터(부분 겹침 방지)
    names = sorted(sub, key=len, reverse=True)
    # 호출부: 앞에 . \w $ 없고(=메서드/부분식별자 아님) 이름 뒤에 ( 가 오는 경우
    pat = re.compile(r'(?<![.\w$])(' + "|".join(re.escape(n) for n in names) + r')(\s*\()') if names else None
    if not pat:
        return code
    res, last = [], 0
    for mo in pat.finditer(code):
        if not mask[mo.start()]:
            continue
        name = mo.group(1)
        res.append(code[last:mo.start()])
        res.append(sub[name] + mo.group(2))
        report["rule7"].append("%s -> %s" % (name, sub[name]))
        last = mo.end()
    res.append(code[last:])
    return "".join(res)


def _only_comment_blank(text):
    for ln in text.splitlines():
        s = ln.strip()
        if s == "" or s.startswith(("//", "/*", "*", "*/")):
            continue
        return False
    return True


def _clean_lead(text):
    """함수 앞 주석 블록에서 규칙4 경계 주석(구 한 줄·신 블록 헤더)을 제거하고 앞뒤 빈줄 정리."""
    return _strip_section_headers(text).strip("\n")


def rule4_structure(script, body, report):
    """
    최상위 함수 정의를 초기화/이벤트/서브미션 콜백/일반 4구역으로 분류·재배치하고
    5단계 정형화 구조 블록 헤더(2~5구역)를 붙인다. (1구역 헤더는 규칙 2 소관)
    - 서브미션 콜백: 이름 패턴(*_submitdone/*_submiterror/*callback) 또는 submitDoneHandler 등 옵션 참조 기반.
      본문에서 $c.sbm.executeDynamic 을 호출하는(통신 실행) 함수도 콜백 구역으로 분류한다(이벤트 핸들러는 3구역 우선).
    - 함수 사이/뒤에 최상위 실행문이 섞여 있으면 재정렬 보류(리포트).
    - gform_onload 는 onpageload 가 'scwin.gform_onload();' 단일 호출이고 참조가 1건일 때만 병합.
    - doc 주석(경계 주석 제외)은 해당 함수와 함께 이동. 구 한 줄 경계 주석은 블록 헤더로 마이그레이션. 멱등.
    """
    mask = code_mask(script)
    depth = depth_array(script)
    n = len(script)
    fpat = re.compile(r'(?m)^[ \t]*scwin\.([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function\b')
    funcs = []
    for mo in fpat.finditer(script):
        if depth[mo.start()] != 0:
            continue
        b = script.find("{", mo.end())
        if b < 0:
            continue
        d, j = 0, b
        while j < n:
            if mask[j]:
                if script[j] == "{":
                    d += 1
                elif script[j] == "}":
                    d -= 1
                    if d == 0:
                        break
            j += 1
        end = j + 1
        k = end
        while k < n and script[k] in " \t":
            k += 1
        if k < n and script[k] == ";":
            end = k + 1
        if end < n and script[end] == "\n":
            end += 1
        funcs.append({"name": mo.group(1), "start": mo.start(), "end": end, "bstart": b, "bend": j})

    if len(funcs) < 2:
        return script, body

    preamble = script[:funcs[0]["start"]]
    tail = script[funcs[-1]["end"]:]
    leads = [""]
    for idx in range(1, len(funcs)):
        leads.append(script[funcs[idx - 1]["end"]:funcs[idx]["start"]])

    # 함수 사이/뒤에 실행문이 섞이면 보류
    if any(not _only_comment_blank(g) for g in leads) or not _only_comment_blank(tail):
        report["judgment"].append("규칙4 재정렬 보류: 함수 사이/뒤에 최상위 실행문 존재(수동 검토)")
        return script, body

    for f in funcs:
        f["text"] = script[f["start"]:f["end"]].rstrip("\n")
    names = {f["name"]: i for i, f in enumerate(funcs)}
    removed = [False] * len(funcs)

    # gform_onload → onpageload 병합 (안전 조건에서만)
    merged = False
    if "gform_onload" in names and "onpageload" in names:
        gi, oi = names["gform_onload"], names["onpageload"]
        obody = script[funcs[oi]["bstart"] + 1:funcs[oi]["bend"]]
        refs = len(re.findall(r'(?<![.\w$])scwin\.gform_onload\s*\(', script))
        if re.sub(r'\s+', '', obody) == "scwin.gform_onload();" and refs == 1:
            gbody = script[funcs[gi]["bstart"] + 1:funcs[gi]["bend"]]
            ot = funcs[oi]["text"]
            bs = funcs[oi]["bstart"] - funcs[oi]["start"]
            be = funcs[oi]["bend"] - funcs[oi]["start"]
            funcs[oi]["text"] = ot[:bs + 1] + gbody + ot[be:]
            removed[gi] = True
            merged = True
            report["rule4_merge"] = "gform_onload→onpageload"

    evon = set(re.findall(r'ev:on[\w-]+="\s*scwin\.([\w$]+)\s*"', body))
    # 서브미션 옵션(submitHandler/submitDoneHandler/submitErrorHandler)이 참조하는 함수 → 콜백 구역
    handler_refs = set(re.findall(r'submit(?:Done|Error)?Handler\s*:\s*scwin\.([\w$]+)', script))

    def _masked_text(f):
        # 문자열/주석을 공백으로 치운 함수 원문(주석 속 호출 오분류 방지)
        return "".join(script[k] if mask[k] else " " for k in range(f["start"], f["end"]))

    def category(f):
        name = f["name"]
        if name in ("onpageload", "onpageunload"):
            return "init"
        if name == "gform_onload":
            return "general"   # 병합 안 된 경우 일반으로
        if name in handler_refs or re.search(r'_submitdone$|_submiterror$|[Cc]allback$', name):
            return "callback"
        if name in evon or re.search(r'_[Oo]n[A-Za-z]', name):
            return "event"
        # $c.sbm.executeDynamic 호출(통신 실행) 함수도 서브미션 콜백 구역으로 분류
        if re.search(r'\$c\.sbm\.executeDynamic\s*\(', _masked_text(f)):
            return "callback"
        return "general"

    buckets = {"init": [], "event": [], "callback": [], "general": []}
    for i, f in enumerate(funcs):
        if removed[i]:
            continue
        buckets[category(f)].append(i)

    def emit(cat):
        out = []
        for i in buckets[cat]:
            cl = _clean_lead(leads[i])
            if i == 0 and first_doc:
                cl = (cl + "\n" if cl else "") + first_doc
            block = (cl + "\n" if cl else "") + funcs[i]["text"]
            out.append(block)
        return out

    # preamble/tail 에서 규칙4 경계 주석(구 한 줄·신 블록 헤더) 제거(재실행 시 중복 방지 → 멱등)
    preamble_clean = _strip_section_headers(preamble).rstrip("\n")
    tail_clean = _strip_section_headers(tail).strip("\n")

    # preamble 끝의 블록 주석(첫 함수의 doc 주석)은 섹션 헤더 아래 첫 함수와 함께 이동
    first_doc = ""
    mdoc = re.search(r"(?s)\n?(/\*(?:[^*]|\*(?!/))*\*/)[ \t]*\Z", preamble_clean)
    if mdoc:
        first_doc = mdoc.group(1)
        preamble_clean = preamble_clean[:mdoc.start()].rstrip("\n")

    parts = [preamble_clean]
    for cat, header in (("init", _SEC2_INIT), ("event", _SEC3_EVENT),
                        ("callback", _SEC4_CALLBACK), ("general", _SEC5_GENERAL)):
        blocks = emit(cat)
        if not blocks:
            continue
        parts.append("")
        parts.append(header)
        parts.extend(blocks)
    result = "\n".join(parts) + "\n"
    if tail_clean:
        result += tail_clean + "\n"
    report["rule4"] = {"init": len(buckets["init"]), "event": len(buckets["event"]),
                       "callback": len(buckets["callback"]),
                       "general": len(buckets["general"]), "merged": merged}
    return result, body


def align_wcraft(script, report=None):
    """`//----W-Craft ...` 마커 주석을 **바로 아래 코드 라인의 들여쓰기**에 맞춰 정렬. 문자열 내부는 보호. 멱등."""
    mask = code_mask(script)
    lines = script.split("\n")
    offs, p = [], 0
    for ln in lines:
        offs.append(p); p += len(ln) + 1
    marker_re = re.compile(r'^([ \t]*)(//-+\s*W-Craft.*)$')

    def indent_of(s):
        return s[:len(s) - len(s.lstrip())]

    cnt = 0
    for i, ln in enumerate(lines):
        m = marker_re.match(ln)
        if not m:
            continue
        st = offs[i]
        if st - 1 >= 0 and st - 1 < len(mask) and not mask[st - 1]:
            continue   # 직전 개행이 비코드(문자열 내부) → 스킵
        # 바로 아래의 비공백·비마커 코드 라인 들여쓰기를 따른다
        target = None
        for k in range(i + 1, len(lines)):
            s = lines[k]
            if s.strip() == "" or marker_re.match(s):
                continue
            target = indent_of(s)
            break
        if target is None:
            continue
        new = target + m.group(2)
        if new != ln:
            lines[i] = new
            cnt += 1
    if report is not None:
        report["wcraft"] = cnt
    return "\n".join(lines)


def collapse_blank_runs(script):
    """연속 빈 줄(개행 3개 이상)을 빈 줄 1개로 축소한다. 문자열/블록주석 내부는 보호. 멱등.
    규칙 2/4 재배치·헤더 삽입이 남긴 다중 빈 줄을 최종 수렴시켜 1·2회차 출력 차이를 없앤다."""
    mask = code_mask(script)
    out, last = [], 0
    for m in re.finditer(r'\n(?:[ \t]*\n){2,}', script):
        if all(mask[i] for i in range(m.start(), m.end())):
            out.append(script[last:m.start()])
            out.append("\n\n")
            last = m.end()
    out.append(script[last:])
    return "".join(out)


def format_script(script):
    """
    변환 후 스크립트 정리: 최상위 함수 정의마다
    - 함수(및 그 앞 주석) 앞에 빈 줄 1개를 둔다(함수 단위 구분).
    - 함수에 붙은 주석 블록을 맨앞(컬럼 0)으로 정렬한다(공통 들여쓰기 제거).
    재정렬(규칙4)이 보류된 파일에도 적용되며, 함수 사이 실행문은 그대로 둔다. 멱등.
    """
    depth = depth_array(script)
    lines = script.split("\n")
    offs, p = [], 0
    for ln in lines:
        offs.append(p); p += len(ln) + 1
    N = len(lines)
    fre = re.compile(r'^[ \t]*scwin\.[A-Za-z_$][\w$]*\s*=\s*(?:async\s+)?function\b')

    def is_cb(s):
        t = s.strip()
        return t == "" or t.startswith(("//", "/*", "*", "*/"))

    def dedent(block):
        nb = [l for l in block if l.strip() != ""]
        if not nb:
            return []
        m = min(len(l) - len(l.lstrip()) for l in nb)
        ded = [(l[m:] if l.strip() != "" else "") for l in block]
        while ded and ded[0].strip() == "":
            ded.pop(0)
        while ded and ded[-1].strip() == "":
            ded.pop()
        return ded

    out, buf, i = [], [], 0
    while i < N:
        at = offs[i]
        ln = lines[i]
        if at < len(depth) and depth[at] == 0 and fre.match(ln):
            j = i + 1
            while j < N and offs[j] < len(depth) and depth[offs[j]] != 0:
                j += 1
            lead = dedent(buf); buf = []
            while out and out[-1].strip() == "":
                out.pop()
            if out:
                out.append("")          # 함수 앞 빈 줄 1개
            out.extend(lead)            # 맨앞 정렬된 주석
            out.extend(lines[i:j])      # 함수 본문(그대로)
            i = j
            continue
        if is_cb(ln):
            buf.append(ln); i += 1
            continue
        out.extend(buf); buf = []
        out.append(ln); i += 1
    out.extend(buf)
    return "\n".join(out)


# ---------- 규칙 6 : Submission → executeDynamic (sbm-generator 로직 이식) ----------
def _sbm_parse_attrs(open_tag):
    attrs = {}
    for m in re.finditer(r'([\w:.-]+)\s*=\s*("([^"]*)"|\'([^\']*)\')', open_tag):
        attrs[m.group(1)] = m.group(3) if m.group(3) is not None else m.group(4)
    return attrs


def _sbm_parse_data_expr(expr):
    if not expr:
        return []
    expr = expr.strip()
    m = re.match(r'^data:(?:json|xml)\s*,\s*([\s\S]*)$', expr, re.I)
    payload = (m.group(1).strip() if m else expr)
    try:
        parsed = json.loads(payload)
    except Exception:
        return [{"id": payload.strip('"\'').strip(), "key": "", "append": False}]
    items = parsed if isinstance(parsed, list) else [parsed]
    out = []
    for it in items:
        if isinstance(it, str):
            out.append({"id": it, "key": "", "append": False})
        elif isinstance(it, dict):
            out.append({"id": it.get("id"), "key": it.get("key") or "",
                        "append": (it.get("action") == "append" or it.get("append") is True)})
    return [o for o in out if o.get("id")]


def _sbm_simpl(items, with_append):
    parts = []
    for i in items:
        s = (i["id"] + "=" + i["key"]) if i["key"] else i["id"]
        if with_append and i["append"]:
            s += "|append"
        parts.append(s)
    return ",".join(parts)


def _sbm_handler(v):
    v = v.strip()
    if re.match(r'^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$', v):
        return v
    return json.dumps(v, ensure_ascii=False)


def _gridview_map(body):
    """body XML 의 <w2:gridView> 에서 {dataCollection ID: gridView id} 매핑을 만든다."""
    m = {}
    for tag in re.finditer(r'<w2:gridView\b[^>]*>', body):
        t = tag.group(0)
        gid = re.search(r'\bid="([^"]+)"', t)
        dl = re.search(r'\bdataList="([^"]+)"', t)
        if not gid or not dl:
            continue
        dc = re.sub(r'^data:(?:json|xml)?\s*,?\s*', '', dl.group(1)).strip()
        dc = dc.split(",")[0].strip().strip('"\'')
        if dc:
            m[dc] = gid.group(1)
    return m


def _gridview_for(attrs, gridmap):
    """submission 의 target dataCollection ID 를 역추적해 매칭되는 gridView id 를 찾는다."""
    if not gridmap:
        return None
    for t in _sbm_parse_data_expr(attrs.get("target", "")):
        if t["id"] in gridmap:
            return gridmap[t["id"]]
    return None


def _sbm_option_parts(attrs, gridview=None):
    """sbmOptions 의 'key : value' 항목 리스트(샘플 스타일)."""
    p = ['id : %s' % json.dumps(attrs.get("id", ""), ensure_ascii=False)]
    if attrs.get("action"):
        p.append('action : %s' % json.dumps(attrs["action"], ensure_ascii=False))
    if attrs.get("method") and attrs["method"].lower() != "post":
        p.append('method : %s' % json.dumps(attrs["method"], ensure_ascii=False))
    if attrs.get("mode") and attrs["mode"].lower() == "synchronous":
        p.append('mode : "synchronous"')
    if attrs.get("mediatype") and attrs["mediatype"].lower() != "application/json":
        p.append('mediatype : %s' % json.dumps(attrs["mediatype"], ensure_ascii=False))
    ref = _sbm_parse_data_expr(attrs.get("ref", ""))
    if ref:
        p.append('ref : %s' % json.dumps(_sbm_simpl(ref, False), ensure_ascii=False))
    tgt = _sbm_parse_data_expr(attrs.get("target", ""))
    if tgt:
        p.append('target : %s' % json.dumps(_sbm_simpl(tgt, True), ensure_ascii=False))
    if attrs.get("ev:submit"):
        p.append('submitHandler : %s' % _sbm_handler(attrs["ev:submit"]))
    if attrs.get("ev:submitdone"):
        p.append('submitDoneHandler : %s' % _sbm_handler(attrs["ev:submitdone"]))
    if attrs.get("ev:submiterror"):
        p.append('submitErrorHandler : %s' % _sbm_handler(attrs["ev:submiterror"]))
    if gridview:
        p.append('gridview : %s' % json.dumps(gridview, ensure_ascii=False))
    if attrs.get("processMsg"):
        p.append('processMsg : %s' % json.dumps(attrs["processMsg"], ensure_ascii=False))
    else:
        p.append('isProcessMsg : false')
    return p


def _build_sbm_options(attrs, gridview=None):
    """인라인 한 줄 표기(리포트 스텁용)."""
    return "{ " + ", ".join(_sbm_option_parts(attrs, gridview)) + " }"


def rule6_submission(head, body, script, report):
    """
    정적 action + 단순 `$c.sbm.execute(id)` 호출만 `$c.sbm.executeDynamic(sbmOptions)` 로 변환하고
    해당 `<xf:submission>` 노드를 삭제. 동적 action(런타임 설정)/속성 변형은 변환하지 않고 스텁과 함께 리포트.
    target dataCollection ID 를 역추적해 body 의 <w2:gridView> id 를 gridview 로 자동 삽입한다.
    """
    node_re = re.compile(r'<xf:submission\b[\s\S]*?(?:/>|</xf:submission>)')
    gridmap = _gridview_map(body)
    smask = code_mask(script)
    depth = depth_array(script)

    def block_key(pos):
        d = depth[pos]
        i = pos
        while i > 0 and depth[i] >= d:
            i -= 1
        return i

    converted, judged, del_spans, edits = [], [], [], []
    block_used = {}   # block_key -> 사용된 sbmOptions 개수(같은 블록 충돌 방지)

    for mo in node_re.finditer(head):
        attrs = _sbm_parse_attrs(mo.group(0).split(">", 1)[0])
        sid = attrs.get("id")
        if not sid:
            continue
        call_re = re.compile(r'\$c\.sbm\.execute\s*\(\s*(?:' + re.escape(sid)
                             + r'|"' + re.escape(sid) + r'"|\'' + re.escape(sid) + r'\')\s*\)')
        calls = [m for m in call_re.finditer(script) if smask[m.start()]]
        if not calls:
            continue
        dynamic = (('getComponentById("%s")' % sid) in script
                   or re.search(r'(?<![.\w$])' + re.escape(sid) + r'\.action\b', script) is not None
                   or not attrs.get("action"))
        gridview = _gridview_for(attrs, gridmap)
        if dynamic:
            judged.append((sid, _build_sbm_options(attrs, gridview)))
            continue
        # async/await 순차 스타일 우선(code-convention.md) — submitErrorHandler 가 있으면
        # 오류 흐름이 콜백 기반이므로 기존 콜백 스타일을 유지하고 단계 2 검토로 리포트한다.
        awaitable = not attrs.get("ev:submiterror")
        parts = _sbm_option_parts(attrs, gridview)
        if awaitable:
            parts = [pt for pt in parts if not pt.startswith("submitDoneHandler")]
            done_expr = _sbm_handler(attrs["ev:submitdone"]) if attrs.get("ev:submitdone") else ""
            if done_expr and not re.match(r'^[A-Za-z_$][\w$.]*$', done_expr):
                done_expr = ""   # 문자열 핸들러명 등은 직접 호출로 못 옮김 → TODO 로 대체
        else:
            report["judgment"].append("규칙6 %s: submitErrorHandler 존재 — 콜백 스타일 유지(단계2 검토)" % sid)
        for m in calls:
            ls = script.rfind("\n", 0, m.start()) + 1
            prefix = script[ls:m.start()]
            indent = prefix[:len(prefix) - len(prefix.lstrip())]
            bk = block_key(m.start())
            cnt = block_used.get(bk, 0)
            name = "sbmOptions" if cnt == 0 else "sbmOptions%d" % (cnt + 1)
            block_used[bk] = cnt + 1
            body = ",\n".join(indent + "    " + pt for pt in parts)
            const_block = "%sconst %s = {\n%s\n%s};\n" % (indent, name, body, indent)
            _, le = _line_bounds(script, m.start())
            suffix = script[m.end():le]
            stmt = prefix.strip() == "" and re.match(r'^\s*;', suffix) is not None
            if awaitable and stmt:
                # 단독 문장: 라인 전체를 `const sbmRtn = await ...;` + 후처리(핸들러 직접 호출/TODO)로 교체
                rtn = name.replace("sbmOptions", "sbmRtn")
                rest = suffix.split(";", 1)[1]   # 세미콜론 뒤 꼬리(주석·개행) 보존
                block = const_block + "\n%sconst %s = await $c.sbm.executeDynamic(%s);%s" % (indent, rtn, name, rest)
                if not rest.endswith("\n"):
                    block += "\n"
                if done_expr:
                    block += "%s%s(%s);\n" % (indent, done_expr, rtn)
                else:
                    block += "%s// TODO Stage2: %s 응답 처리 로직 작성 (구 submitDoneHandler 자리)\n" % (indent, rtn)
                edits.append((ls, le, block))
            elif awaitable:
                # 표현식 내 호출: rtn 캡처 없이 await 만 부여(응답 사용 여부는 단계 2 검토)
                edits.append((ls, ls, const_block))
                edits.append((m.start(), m.end(), "await $c.sbm.executeDynamic(%s)" % name))
                report["judgment"].append("규칙6 %s: 표현식 내 호출 — await 전환했으나 응답(rtn) 캡처 없음(단계2 검토)" % sid)
            else:
                edits.append((ls, ls, const_block))                                   # 옵션 변수 선언 삽입
                edits.append((m.start(), m.end(), "$c.sbm.executeDynamic(%s)" % name))  # 호출부 치환
        converted.append(sid)
        del_spans.append((mo.start(), mo.end()))

    # script 편집 적용(위치 역순 → 오프셋 보존)
    for s, e, t in sorted(edits, key=lambda x: x[0], reverse=True):
        script = script[:s] + t + script[e:]

    # 변환된 submission 노드 삭제(라인 단위로 정리)
    for s, e in sorted(del_spans, reverse=True):
        ls = head.rfind("\n", 0, s) + 1
        le = e
        if head[ls:s].strip() == "":           # 앞이 들여쓰기뿐이면 라인 시작부터
            s = ls
        while le < len(head) and head[le] in " \t":
            le += 1
        if le < len(head) and head[le] == "\n":
            le += 1
        head = head[:s] + head[le:]

    report["rule6"] = {"converted": converted, "deleted": len(del_spans)}
    for sid, opts in judged:
        report["judgment"].append("규칙6 수동 변환: %s (동적 action/속성) → sbmOptions: %s" % (sid, opts))
    return head, script


def mark_async_functions(script, report):
    """await 를 포함하는 function 정의에 async 키워드를 부여한다(멱등).
    - 규칙 6/12/16(await executeDynamic)·규칙 17(await openPopup)이 만든 await 의 최내곽 함수가 대상.
    - 화살표 함수는 탐지 대상이 아니다(레거시 소스는 function 위주) — 소속 함수를 못 찾으면 리포트.
    - async 로 바뀐 함수는 반환값이 Promise 로 변하므로 호출부 await 필요 여부를 단계 2 검토로 리포트."""
    mask = code_mask(script)
    n = len(script)
    funcs = []
    for mo in re.finditer(r'\bfunction\b', script):
        if not mask[mo.start()]:
            continue
        b = script.find("{", mo.end())
        if b < 0:
            continue
        d, j = 0, b
        while j < n:
            if mask[j]:
                if script[j] == "{":
                    d += 1
                elif script[j] == "}":
                    d -= 1
                    if d == 0:
                        break
            j += 1
        funcs.append((mo.start(), b, j))

    need, orphan = {}, 0
    for am in re.finditer(r'\bawait\b', script):
        if not mask[am.start()]:
            continue
        inner = None
        for f in funcs:
            if f[1] < am.start() < f[2] and (inner is None or f[1] > inner[1]):
                inner = f
        if inner is None:
            orphan += 1
        else:
            need[inner[0]] = inner

    marked, ins = [], []
    for kw in sorted(need, reverse=True):
        if re.search(r'\basync\s+$', script[:kw]):
            continue   # 이미 async — 멱등
        nm = re.search(r'scwin\.([\w$]+)\s*=\s*$', script[:kw])
        marked.append("scwin." + nm.group(1) if nm else "(무명 함수)")
        ins.append(kw)
    for kw in ins:   # ins 는 이미 위치 역순 — 오프셋 보존
        script = script[:kw] + "async " + script[kw:]

    # 파이프라인에서 2회 호출(규칙4 병합 후 재탐지)되므로 누적·중복 방지
    report["async_marked"] = report.get("async_marked", []) + marked
    for name in marked:
        if name.startswith("scwin."):
            report["judgment"].append("async 전환: %s — 호출부에서 await 필요 여부 검토(단계2)" % name)
    if orphan:
        msg = "await 소속 함수 탐지 실패 %d건(함수 밖/화살표 함수) — async 부여 수동 확인" % orphan
        if msg not in report["judgment"]:
            report["judgment"].append(msg)
    return script


def _replace_in_code(script, pattern, repl):
    """코드 영역(문자열/주석 제외)에서만 pattern 을 repl(mo)->str 로 치환."""
    mask = code_mask(script)
    res, last = [], 0
    for mo in pattern.finditer(script):
        if not mask[mo.start()]:
            continue
        res.append(script[last:mo.start()]); res.append(repl(mo)); last = mo.end()
    res.append(script[last:])
    return "".join(res)


def rule10_remove_events(xml, report):
    """XML 영역에서 <xf:events>...</xf:events> 블록과 <xf:event .../> 요소를 모두 삭제(주석 블록 포함)."""
    total = 0
    # 1) 주석 처리된 events 블록  <!-- <xf:events ...> ... -->
    xml, n = re.subn(r'(?s)[ \t]*<!--\s*<xf:events?\b.*?-->[ \t]*\r?\n?', '', xml); total += n
    # 2) 짝 태그 컨테이너  <xf:events ...> ... </xf:events>
    xml, n = re.subn(r'(?s)[ \t]*<xf:events\b[^>]*>.*?</xf:events>[ \t]*\r?\n?', '', xml); total += n
    # 3) 단독 self-closing  <xf:event .../>
    xml, n = re.subn(r'[ \t]*<xf:event\b[^>]*/>[ \t]*\r?\n?', '', xml); total += n
    # 4) 짝 태그 단독  <xf:event ...> ... </xf:event>
    xml, n = re.subn(r'(?s)[ \t]*<xf:event\b[^>]*>.*?</xf:event>[ \t]*\r?\n?', '', xml); total += n
    report["rule10"] = report.get("rule10", 0) + total
    return xml


# ---------- 규칙 12 : DataID/reset 패턴 → executeDynamic (동적 submission) ----------
# 같은 함수 스코프에서 `{DC}.DataID = encodeURI({url})`(또는 `////` 주석 변형)과
# `{DC}.reset();` 이 한 쌍으로 존재하면 $c.sbm.executeDynamic(sbmOptions) 로 전환한다.
# DataID 우변은 encodeURI(url) 래퍼·식별자 역추적뿐 아니라 **직접 문자열 리터럴**도 허용한다
# (예: dts.DataID = "/gauceSystemierAdaptor.do?method=getGauceDataHeader&..."; → action=경로).
# 짝 reset 은 WebSquare 소문자 `.reset()` 와 Gauce 레거시 대문자 `.Reset()` 를 모두 인식한다.
# (websquare_conversion_guide.md "URL/DataID 패턴 기반 동적 Submission 변환 지침")
_DATAID_RE = re.compile(
    r'(?m)^[ \t]*(/+[ \t]*)?([A-Za-z_$][\w$]*)\.DataID\s*=(?!=)\s*([^\n;]+);[^\n]*$')
_RESET_RE = re.compile(
    r'(?m)^[ \t]*(/+[ \t]*)?([A-Za-z_$][\w$]*)\.[Rr]eset\s*\(\s*\)\s*;[^\n]*$')
_ENCODE_WRAP = re.compile(
    r'^(?:encodeURIComponent|encodeURI|encode)\s*\(\s*([\s\S]*?)\s*\)\s*$')
_STR_LIT = re.compile(r'''(["'])(.*?)\1''')
_WCRAFT_MARK = re.compile(r'^[ \t]*//-+\s*W-Craft')


def _line_bounds(text, pos):
    ls = text.rfind("\n", 0, pos) + 1
    le = text.find("\n", pos)
    le = len(text) if le < 0 else le + 1
    return ls, le


def _find_url_literal(expr, loose=False):
    """expr 안에서 action 으로 쓸 URL 경로를 찾는다(쿼리스트링 '?' 이후 제거).
    우선 '/'·'http' 로 시작하는 경로 리터럴을 찾고, loose=True 면 첫 문자열 리터럴로 폴백."""
    for m in _STR_LIT.finditer(expr):
        s = m.group(2)
        if s.startswith("/") or s.startswith("http"):
            return s.split("?", 1)[0]
    if loose:
        m = _STR_LIT.search(expr)
        if m:
            return m.group(2).split("?", 1)[0]
    return None


def _dyn_options_block(indent, name, dc, action, ref="", handler_defined=False):
    """sbmOptions 선언 + async/await 순차 실행 블록을 생성(끝에 개행 포함).
    - 콜백(submitDoneHandler) 대신 `const sbmRtn = await executeDynamic(...)` 순차 스타일을 우선한다
      (code-convention.md — submitDoneHandler 를 넘기면 Promise 가 settle 되지 않으므로 옵션에서 제외).
    - handler_defined=True(파일에 scwin.sbm_{dc}_submitdone 정의 존재)면 await 후 해당 함수를 직접
      호출해 순차 실행을 보존하고, 없으면 TODO Stage2 주석을 남긴다.
    - ref 기본값은 "" (규칙 12). 규칙 16(trs)은 KeyValue 에서 추출한 데이터셋명을 넘긴다."""
    parts = [
        'id : "sbm_%s"' % dc,
        'action : "%s"' % action,
        'ref : "%s"' % ref,
        'target : "%s=body.content"' % dc,
        'isProcessMsg : false',
    ]
    inner = ",\n".join(indent + "    " + p for p in parts)
    rtn = name.replace("sbmOptions", "sbmRtn")
    out = ("%sconst %s = {\n%s\n%s};\n\n%sconst %s = await $c.sbm.executeDynamic(%s);\n"
           % (indent, name, inner, indent, indent, rtn, name))
    if handler_defined:
        out += "%sscwin.sbm_%s_submitdone(%s);\n" % (indent, dc, rtn)
    else:
        out += "%s// TODO Stage2: %s 응답 처리 로직 작성 (구 submitDoneHandler 자리)\n" % (indent, rtn)
    return out


def rule12_dynamic_submission(script, report):
    depth = depth_array(script)
    defined_fns = _defined_function_names(script)

    def block_range(pos):
        d = depth[pos]
        i = pos
        while i > 0 and depth[i] >= d:
            i -= 1
        j = pos
        while j < len(script) and depth[j] >= d:
            j += 1
        return i, j

    resets = [{"dc": mo.group(2), "bk": block_range(mo.start())[0],
               "start": mo.start(), "end": mo.end(), "used": False}
              for mo in _RESET_RE.finditer(script)]

    # 스코프(블록)별 sbmOptions 명명: 같은 블록에서만 2,3… 부여. 블록 내 기존
    # sbmOptions(예: 규칙6 산출) 개수로 시작값을 시드해 같은 스코프 충돌을 막는다.
    block_state = {}

    def next_name(bk, pos):
        if bk not in block_state:
            i, j = block_range(pos)
            block_state[bk] = len(re.findall(r'\bsbmOptions\d*\b', script[i:j]))
        c = block_state[bk]
        block_state[bk] = c + 1
        return "sbmOptions" if c == 0 else "sbmOptions%d" % (c + 1)

    edits = {}   # start -> (end, repl)

    def add_del(s, e):
        if s not in edits:
            edits[s] = (e, "")

    converted, skipped = [], []
    for mo in _DATAID_RE.finditer(script):
        dc, rhs = mo.group(2), mo.group(3).strip()
        bk = block_range(mo.start())[0]
        # 같은 블록·같은 dc 의 reset 짝(미사용) 찾기 — 뒤쪽 reset 우선
        pair = None
        for r in resets:
            if r["used"] or r["dc"] != dc or r["bk"] != bk:
                continue
            pair = r
            if r["start"] > mo.start():
                break
        if pair is None:
            skipped.append("%s.DataID (짝 reset 없음)" % dc)
            continue
        # URL/action 해석: encode() 래퍼 제거 → 리터럴 직접 또는 식별자 역추적
        inner = rhs
        wm = _ENCODE_WRAP.match(rhs)
        if wm:
            inner = wm.group(1).strip()
        url_decl = None
        action = _find_url_literal(inner, loose=False)
        if not action and re.match(r'^[A-Za-z_$][\w$]*$', inner):
            ident = inner
            for dm in re.finditer(
                    r'(?m)^[ \t]*(?:/+[ \t]*)?(?:var|let|const)?[ \t]*' + re.escape(ident)
                    + r'\s*=(?!=)\s*([^\n;]+);', script):
                if dm.start() < mo.start():
                    url_decl = (dm.start(), dm.end(), ident, dm.group(1))
            if url_decl:
                action = _find_url_literal(url_decl[3], loose=True)
        if not action:
            skipped.append("%s.DataID (action URL 해석 실패)" % dc)
            continue
        pair["used"] = True
        # DataID 라인 → 블록 치환
        d_ls, d_le = _line_bounds(script, mo.start())
        line = script[d_ls:d_le]
        indent = line[:len(line) - len(line.lstrip())]
        name = next_name(bk, mo.start())
        edits[d_ls] = (d_le, _dyn_options_block(indent, name, dc, action,
                                                handler_defined=("sbm_%s_submitdone" % dc) in defined_fns))
        # reset 라인 삭제
        add_del(pair["start"], pair["end"])
        # url-const 라인 + 그 아래 url 참조 주석(예: //alert(url);) 삭제
        if url_decl:
            u_ls, u_le = _line_bounds(script, url_decl[0])
            add_del(u_ls, u_le)
            ref = re.compile(r'(?<![.\w$])' + re.escape(url_decl[2]) + r'(?![\w$])')
            for lm in re.finditer(r'(?m)^[ \t]*//[^\n]*\n', script[u_le:d_ls]):
                if ref.search(lm.group(0)):
                    add_del(u_le + lm.start(), u_le + lm.end())
        # W-Craft 마커 주석(핵심 라인 직전) 삭제
        anchors = [d_ls, _line_bounds(script, pair["start"])[0]]
        if url_decl:
            anchors.append(_line_bounds(script, url_decl[0])[0])
        for a in anchors:
            if a <= 0:
                continue
            p_ls, _ = _line_bounds(script, a - 1)
            if _WCRAFT_MARK.match(script[p_ls:a]):
                add_del(p_ls, a)
        converted.append("%s → sbm_%s (action=%s)" % (dc, dc, action))

    for s in sorted(edits, reverse=True):
        e, repl = edits[s]
        script = script[:s] + repl + script[e:]
    report["rule12"] = {"converted": converted}
    for s in skipped:
        report["judgment"].append("규칙12 동적 submission 미변환: " + s)
    return script


# ---------- 규칙 16 : Gauce 트랜잭션(trs) Action/KeyValue/Parameters/Post → executeDynamic ----------
# 같은 블록 스코프에서 레거시 Gauce 트랜잭션 객체의
#   {trs}.Action = {url};  {trs}.KeyValue = "JSP(...)";  [{trs}.Parameters = {qs};]  {trs}.Post();
# 패턴을 $c.sbm.executeDynamic(sbmOptions) 로 전환한다.
#   · Action     → sbmOptions.action  (URL 의 ? 앞 경로, 규칙 12 와 동일 _find_url_literal)
#   · KeyValue   → sbmOptions.ref      ("JSP(I:pInput=A,I:pFile=B)" → "A,B" : '=' 우변 데이터셋명들)
#   · Parameters → 쿼리스트링 연결식을 JSON 객체로 변환해 주석으로 첨부(검토용, 미실행)
#   · Post()     → $c.sbm.executeDynamic(sbmOptions);
# id/target/submitDoneHandler/isProcessMsg 는 규칙 12 와 동일 규약(객체명 기반)으로 생성한다
# (target/submitDoneHandler 는 응답 처리 규약상 단계 2 에서 검토 보강 대상).
_TRS_POST_RE = re.compile(
    r'(?m)^[ \t]*([A-Za-z_$][\w$]*)\.Post\s*\(\s*\)\s*;[^\n]*$')
_TRS_ASSIGN_RE = re.compile(
    r'(?m)^[ \t]*([A-Za-z_$][\w$]*)\.(Action|KeyValue|Parameters)\s*=(?!=)\s*([^\n;]+);[^\n]*$')


def _keyvalue_to_ref(rhs):
    """KeyValue 우변("JSP(I:pInput=A,I:pFile=B)")에서 '=' 우변 데이터셋명들을 콤마결합."""
    m = _STR_LIT.search(rhs)
    inner = m.group(2) if m else rhs
    return ",".join(re.findall(r'=\s*([A-Za-z_$][\w$]*)', inner))


def _split_top_plus(expr):
    """문자열/괄호 보호하며 최상위 '+' 로 분할(빈 토큰 제거)."""
    parts, buf, i, n = [], [], 0, len(expr)
    depth, quote = 0, None
    while i < n:
        c = expr[i]
        if quote:
            buf.append(c)
            if c == "\\" and i + 1 < n:
                buf.append(expr[i + 1]); i += 2; continue
            if c == quote:
                quote = None
            i += 1; continue
        if c in "\"'":
            quote = c; buf.append(c); i += 1; continue
        if c in "([{":
            depth += 1; buf.append(c); i += 1; continue
        if c in ")]}":
            depth -= 1; buf.append(c); i += 1; continue
        if c == "+" and depth == 0:
            parts.append("".join(buf).strip()); buf = []; i += 1; continue
        buf.append(c); i += 1
    parts.append("".join(buf).strip())
    return [p for p in parts if p != ""]


def _params_to_pairs(rhs):
    """Parameters 우변(쿼리스트링 연결식)을 [(key, [(종류, 값)...])] 로 파싱."""
    pairs, state = [], {"key": None, "val": []}

    def flush():
        if state["key"] is not None:
            pairs.append((state["key"], list(state["val"])))

    for p in _split_top_plus(rhs):
        sm = re.fullmatch(r"""(["'])([\s\S]*)\1""", p)
        if sm:
            text = sm.group(2)
            kms = list(re.finditer(r'(?:^|,)\s*([A-Za-z_$][\w$]*)\s*=', text))
            if not kms:
                if text:
                    state["val"].append(("lit", text))
                continue
            pre = text[:kms[0].start()]
            if pre:
                state["val"].append(("lit", pre))
            for ki, km in enumerate(kms):
                flush()
                state["key"], state["val"] = km.group(1), []
                vend = kms[ki + 1].start() if ki + 1 < len(kms) else len(text)
                vtext = text[km.end():vend]
                if vtext:
                    state["val"].append(("lit", vtext))
        else:
            state["val"].append(("expr", p))
    flush()
    return pairs


def _render_param_value(parts):
    if not parts:
        return '""'
    rendered = ['"%s"' % v if k == "lit" else v for k, v in parts]
    return rendered[0] if len(rendered) == 1 else " + ".join(rendered)


def rule16_trs_submission(script, report):
    depth = depth_array(script)
    defined_fns = _defined_function_names(script)

    def block_range(pos):
        d = depth[pos]
        i = pos
        while i > 0 and depth[i] >= d:
            i -= 1
        j = pos
        while j < len(script) and depth[j] >= d:
            j += 1
        return i, j

    block_state = {}

    def next_name(bk, pos):
        if bk not in block_state:
            i, j = block_range(pos)
            block_state[bk] = len(re.findall(r'\bsbmOptions\d*\b', script[i:j]))
        c = block_state[bk]
        block_state[bk] = c + 1
        return "sbmOptions" if c == 0 else "sbmOptions%d" % (c + 1)

    assigns = {}   # (obj, prop) -> [mo, ...]
    for mo in _TRS_ASSIGN_RE.finditer(script):
        assigns.setdefault((mo.group(1), mo.group(2)), []).append(mo)

    def latest_before(obj, prop, bk, pos):
        best = None
        for mo in assigns.get((obj, prop), []):
            if block_range(mo.start())[0] != bk or mo.start() >= pos:
                continue
            if best is None or mo.start() > best.start():
                best = mo
        return best

    edits = {}
    converted, skipped = [], []
    for pm in _TRS_POST_RE.finditer(script):
        obj = pm.group(1)
        bk = block_range(pm.start())[0]
        am = latest_before(obj, "Action", bk, pm.start())
        if am is None:
            skipped.append("%s.Post (짝 Action 없음)" % obj)
            continue
        action = _find_url_literal(am.group(3).strip(), loose=False)
        if not action:
            skipped.append("%s.Post (action URL 해석 실패)" % obj)
            continue
        km = latest_before(obj, "KeyValue", bk, pm.start())
        ref = _keyvalue_to_ref(km.group(3).strip()) if km else ""
        prm = latest_before(obj, "Parameters", bk, pm.start())

        p_ls, p_le = _line_bounds(script, pm.start())
        line = script[p_ls:p_le]
        indent = line[:len(line) - len(line.lstrip())]
        name = next_name(bk, pm.start())
        block = _dyn_options_block(indent, name, obj, action, ref=ref,
                                   handler_defined=("sbm_%s_submitdone" % obj) in defined_fns)
        if prm:
            pairs = _params_to_pairs(prm.group(3).strip())
            cmt = [indent + "// [전환검토] %s.Parameters → 동적 파라미터(필요 시 sbmOptions 에 반영)" % obj,
                   indent + "// const sbmParams = {"]
            for ki, (k, v) in enumerate(pairs):
                tail = "," if ki < len(pairs) - 1 else ""
                cmt.append(indent + "//     %s : %s%s" % (k, _render_param_value(v), tail))
            cmt.append(indent + "// };")
            block = "\n".join(cmt) + "\n" + block
        edits[p_ls] = (p_le, block)
        for mo in (am, km, prm):
            if mo is None:
                continue
            a_ls, a_le = _line_bounds(script, mo.start())
            edits.setdefault(a_ls, (a_le, ""))
        converted.append("%s.Post → executeDynamic (sbm_%s, action=%s, ref=%s)"
                         % (obj, obj, action, ref or "''"))

    for s in sorted(edits, reverse=True):
        e, repl = edits[s]
        script = script[:s] + repl + script[e:]
    report["rule16"] = {"converted": converted, "skipped": skipped}
    for s in skipped:
        report["judgment"].append("규칙16 trs 트랜잭션 미변환: " + s)
    return script


# ---------- 규칙 17 : $c.frame.CreateDialogFrame(...) → $c.win.openPopup(...) ----------
# AS-IS: [await] {recv}.CreateDialogFrame(id, url, title, left, top, width, height, type)
#   · type === "window" → "browserPopup", 그 외/없음 → "pageFramePopup"
#   · left, top 인자는 사용하지 않음(드롭)
#   · options.id 는 url 의 파일명(확장자 제거)을 사용(AS-IS 첫 인자는 무시)
#   · width/height : 정수 리터럴은 "{n}px", 그 외(표현식/변수)는 원형 유지
#   · 팝업 타입별 수신 규약(2026-09-01): pageFramePopup 은 await 로 리턴값 수신(result),
#     browserPopup 은 options.callbackFn 콜백으로 수신(await 없음) + scwin.popupCallback 정의 추가
#   · CreateDialogFrame 바로 윗줄이 인자에 row 를 넘기는 함수 호출이면 삭제
# data 객체는 pageFramePopup 전용(레거시 호출에 페이로드가 없어 TO-DO 플레이스홀더로 생성, 검토 보강).
_CDF_RE = re.compile(r'(?:await\s+)?(?:\$c\.)?frame\.CreateDialogFrame\s*\(')
_ROW_CALL_RE = re.compile(r'^[ \t]*[\w$.]+\s*\([^()]*\brow\b[^()]*\)\s*;[ \t]*$')
_INT_LIT_RE = re.compile(r'^\d+$')
_POPUP_CALLBACK_DEF = (
    "\n"
    "/**\n"
    " * @method\n"
    " * @name popupCallback\n"
    " * @description browserPopup 팝업의 callback 함수. 부모창에서 팝업 결과 값을 처리한다.\n"
    " * @param {String | Number} arg 팝업에서 전달받은 값\n"
    " */\n"
    "scwin.popupCallback = function (arg) {\n"
    "    // TO-DO : arg 값 확인 후 업무 로직 추가\n"
    "};\n"
)


def _url_to_id(url_arg):
    """url 인자(문자열 리터럴)에서 파일명(확장자 제거)을 추출. 리터럴이 아니면 None."""
    m = re.fullmatch(r'''(["'])([\s\S]*)\1''', url_arg.strip())
    if not m:
        return None
    base = re.split(r'[\\/]', m.group(2))[-1]
    return base.rsplit(".", 1)[0] if base else None


def _popup_dim(arg):
    """width/height 인자 → 정수 리터럴이면 "Npx", 그 외(표현식/변수)는 원형 유지."""
    a = arg.strip()
    return '"%spx"' % a if _INT_LIT_RE.match(a) else a


def rule17_create_dialog_frame(code, report):
    mask = code_mask(code)
    depth = depth_array(code)

    def block_range(pos):
        d = depth[pos]
        i = pos
        while i > 0 and depth[i] >= d:
            i -= 1
        j = pos
        while j < len(code) and depth[j] >= d:
            j += 1
        return i, j

    block_state = {}

    def names(bk, pos):
        if bk not in block_state:
            i, j = block_range(pos)
            block_state[bk] = len(re.findall(r'\bconst +options\d*\b', code[i:j]))
        c = block_state[bk]
        block_state[bk] = c + 1
        sfx = "" if c == 0 else str(c + 1)
        return "options" + sfx, "data" + sfx, "result" + sfx

    edits = {}
    converted, skipped = [], []
    need_callback = [False]

    for mo in _CDF_RE.finditer(code):
        if not mask[mo.start()]:
            continue
        scanned = _scan_call(code, mask, mo.end() - 1)
        if scanned is None:
            continue
        args, end = scanned
        if len(args) != 8:
            skipped.append("CreateDialogFrame 인자 %d개(8개 아님): %s" % (len(args), code[mo.start():end][:60]))
            continue
        _id, url, title, _left, _top, width, height, ptype = args
        popup_id = _url_to_id(url)
        if popup_id is None:
            skipped.append("CreateDialogFrame url 비리터럴(파일명 추출 불가): %s" % url.strip())
            continue
        is_browser = ptype.strip() in ('"window"', "'window'")
        popup_type = "browserPopup" if is_browser else "pageFramePopup"

        ls, le = _line_bounds(code, mo.start())
        line = code[ls:le]
        indent = line[:len(line) - len(line.lstrip())]
        bk = block_range(mo.start())[0]
        opt, dat, res = names(bk, mo.start())

        blk = [
            indent + "const %s = {" % opt,
            indent + '    id: "%s",' % popup_id,
            indent + "    title: %s," % title.strip(),
            indent + '    type: "%s",' % popup_type,
            indent + "    width: %s," % _popup_dim(width),
        ]
        if is_browser:
            # browserPopup 수신 규약 — options.callbackFn 콜백으로 비동기 수신(await 미사용)
            blk.append(indent + "    height: %s," % _popup_dim(height))
            blk.append(indent + '    callbackFn: "scwin.popupCallback"')
            blk.append(indent + "};")
            blk.append("")
            blk.append(indent + "$c.win.openPopup(%s, %s);" % (url.strip(), opt))
            need_callback[0] = True
        else:
            # pageFramePopup 수신 규약 — await 로 리턴값(result) 동기 수신
            blk.append(indent + "    height: %s" % _popup_dim(height))
            blk.append(indent + "};")
            blk.append("")
            blk.append(indent + "const %s = {" % dat)
            blk.append(indent + "    // TO-DO : 팝업으로 전달할 파라미터 설정")
            blk.append(indent + "};")
            blk.append("")
            blk.append(indent + "const %s = await $c.win.openPopup(%s, %s, %s);" % (res, url.strip(), opt, dat))
            blk.append(indent + "// TO-DO : result 값 확인 후 업무 로직 추가")
        repl = "\n".join(blk) + "\n"

        stmt_ls, _ = _line_bounds(code, mo.start())
        stmt_le = code.find("\n", end)
        stmt_le = len(code) if stmt_le < 0 else stmt_le + 1
        edits[stmt_ls] = (stmt_le, repl)

        if stmt_ls > 0:
            prev_ls, prev_le = _line_bounds(code, stmt_ls - 1)
            if _ROW_CALL_RE.match(code[prev_ls:prev_le].rstrip("\n")):
                edits.setdefault(prev_ls, (prev_le, ""))

        converted.append("CreateDialogFrame → openPopup (id=%s, type=%s)" % (popup_id, popup_type))

    for s in sorted(edits, reverse=True):
        e, repl = edits[s]
        code = code[:s] + repl + code[e:]

    if need_callback[0] and not re.search(r'scwin\.popupCallback\s*=', code):
        code = code.rstrip("\n") + "\n" + _POPUP_CALLBACK_DEF
    report["rule17"] = {"converted": converted, "skipped": skipped}
    for s in skipped:
        report["judgment"].append("규칙17 CreateDialogFrame 미변환: " + s)
    return code


# ---------- 판단 필요 항목 리포트 ----------
def collect_judgment(script, head, body, report):
    # 규칙6 미변환으로 남은 submission 노드(실행 호출 없음 등)
    remain = re.findall(r'<xf:submission\s+id="([^"]+)"', head)
    if remain:
        report["judgment"].append("미변환 submission 노드(실행 호출 없음/동적): " + ", ".join(remain))

    # gcc_mapping 연동: 스크립트에서 발견된 '검토/대체' 태그 / 충돌 함수 → 단계2(Claude) 대상
    rows = gcc_mapping.load_mappings()
    conf = gcc_mapping.conflicts()
    tagged_hits, conflict_hits = [], []
    seen_t, seen_c = set(), set()
    for e in rows:
        if not e["tag"]:
            continue
        for name in e["pure_names"]:
            if name in seen_t:
                continue
            if re.search(r'(?<![.\w$])' + re.escape(name) + r'\s*\(', script):
                tagged_hits.append("%s→%s(%s)" % (name, e["tobe"], e["tag"])); seen_t.add(name)
    for name, tobes in conf.items():
        if name in seen_c:
            continue
        if re.search(r'(?<![.\w$])' + re.escape(name) + r'\s*\(', script):
            conflict_hits.append("%s→{%s}" % (name, " | ".join(tobes))); seen_c.add(name)
    if tagged_hits:
        report["judgment"].append("규칙7 검토/대체 태그 함수 사용: " + ", ".join(tagged_hits))
    if conflict_hits:
        report["judgment"].append("규칙7 충돌(이름→다중 tobe) 함수 사용: " + ", ".join(conflict_hits))

    legacy = sorted(set(re.findall(r'\.(NameValue|NameString|countrow|UseFilter|Filter|SortExpr|Sort|Redraw|Rowposition|RowPosition|ValueOfIndex|Index|setDisabled|bindColVal)\b', script)))
    if legacy:
        report["judgment"].append("레거시 Gauce 데이터셋/컴포넌트 API(매핑표 외): " + ", ".join("." + a for a in legacy))
    if re.search(r'window\.event\.keyCode', script):
        report["judgment"].append("window.event.keyCode (IE 레거시) → 표준 이벤트 인자 검토")
    if re.search(r'\bdebugger\b', script):
        report["judgment"].append("debugger; 잔존 → 제거 검토")
    # 규칙8 후속: var 없이 대입되는 암묵적 전역(예: for (i = ...))은 명시 선언 검토 대상
    implicit = sorted(set(re.findall(r'\bfor\s*\(\s*([A-Za-z_$][\w$]*)\s*=(?!=)', script)))
    if implicit:
        report["judgment"].append("암묵적 전역 루프변수(var 없음) → let 명시 선언 검토: " + ", ".join(implicit))


# ---------- 파이프라인 ----------
def _match_brace(code, mask, bpos):
    """bpos 의 '{' 와 짝이 되는 '}' 인덱스(코드 영역 기준). 못 찾으면 -1."""
    d, j, n = 0, bpos, len(code)
    while j < n:
        if mask[j]:
            if code[j] == "{":
                d += 1
            elif code[j] == "}":
                d -= 1
                if d == 0:
                    return j
        j += 1
    return -1


def rule25_sequential_submission(script, report):
    """수기 변환분 정규화(규칙 25) — 옵션 객체 안의 `submitDoneHandler : scwin.X` 를 제거하고
    순차 스타일(`const sbmRtn = await $c.sbm.executeDynamic(옵션); await scwin.X(sbmRtn);`)로 전환한다.
    (핸들러를 옵션으로 넘기면 executeDynamic 의 Promise 가 settle 되지 않아 await 이 영구 대기 — code-convention §서브미션)
    - submitErrorHandler 가 함께 있으면 콜백 스타일 유지 규약이므로 보류·리포트.
    - 핸들러가 파일에 정의돼 있지 않으면 직접 호출 대신 `// TODO Stage2` 주석을 남긴다.
    - 호출이 대입형(const r = await ...)이면 핸들러 속성만 제거(기존 반환값 사용 유지)하고 리포트한다.
    멱등 — 결과 옵션에는 submitDoneHandler 가 남지 않는다."""
    mask = code_mask(script)
    defined_fns = set(re.findall(r'scwin\.([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function', script))
    conv, skip = [], []
    edits = []  # (start, end, replacement)

    for lit in re.finditer(r'(?:const|let|var)\s+([\w$]+)\s*=\s*\{', script):
        if not mask[lit.start()]:
            continue
        var = lit.group(1)
        bopen = script.index("{", lit.end() - 1)
        bclose = _match_brace(script, mask, bopen)
        if bclose < 0:
            continue
        seg = script[bopen:bclose + 1]
        hm = re.search(r'submitDoneHandler\s*:\s*scwin\.([\w$]+)', seg)
        if not hm or not mask[bopen + hm.start()]:
            continue
        handler = hm.group(1)
        if re.search(r'submitErrorHandler\s*:', seg):
            skip.append("%s (submitErrorHandler 공존 — 콜백 유지)" % var)
            continue

        # 1) 핸들러 속성 제거 — 「속성 + 뒤따르는 콤마」 우선, 마지막 속성이면 「앞 콤마 + 속성」
        pm = re.search(r'submitDoneHandler\s*:\s*scwin\.' + re.escape(handler) + r'\s*,\s*(?=\S)', seg)
        if pm:
            edits.append((bopen + pm.start(), bopen + pm.end(), ""))
        else:
            pm = re.search(r',\s*submitDoneHandler\s*:\s*scwin\.' + re.escape(handler), seg)
            if pm:
                edits.append((bopen + pm.start(), bopen + pm.end(), ""))
            else:
                skip.append("%s (핸들러 속성 형태 인식 실패)" % var)
                continue

        # 2) 호출부 순차 스타일 전환 — 옵션 리터럴 뒤 첫 executeDynamic({var}) 단독 문장
        call = re.compile(r'(?m)^([ \t]*)(?:(const|let|var)\s+([\w$]+)\s*=\s*)?(await\s+)?\$c\.sbm\.executeDynamic\(\s*' + re.escape(var) + r'\s*\)\s*;[ \t]*$')
        cm = call.search(script, bclose)
        if cm is None or not mask[cm.start(0) + len(cm.group(1))]:
            skip.append("%s (executeDynamic 호출부 미탐지 — 핸들러 속성만 제거)" % var)
            continue
        if cm.group(2):
            # 대입형 — 반환값 사용 중이므로 핸들러 속성 제거만 수행(Promise settle 정상화)
            conv.append("%s: 핸들러 속성만 제거(대입형 호출 유지, 핸들러 %s)" % (var, handler))
            continue
        indent = cm.group(1)
        rtn = "sbmRtn" + (var[len("sbmOptions"):] if var.startswith("sbmOptions") else "")
        line = indent + "const " + rtn + " = await $c.sbm.executeDynamic(" + var + ");\n"
        if handler in defined_fns:
            line += indent + "await scwin." + handler + "(" + rtn + ");"
        else:
            line += indent + "// TODO Stage2: " + rtn + " 응답 처리 로직 작성 (구 submitDoneHandler scwin." + handler + " 미정의)"
        edits.append((cm.start(), cm.end(), line))
        conv.append("%s → 순차 스타일(%s)" % (var, handler))

    for st, en, rep_txt in sorted(edits, reverse=True):
        script = script[:st] + rep_txt + script[en:]
    report.setdefault("rule25", {"converted": [], "skipped": []})
    report["rule25"]["converted"].extend(conv)
    report["rule25"]["skipped"].extend(skip)
    if skip:
        report.setdefault("judgment", []).append("규칙25 순차 전환 보류: " + "; ".join(skip))
    return script


def rule26_entry_trycatch(script, report, screen_id):
    """진입점 오류 처리(규칙 26) — 2구역(onpageload)·3구역(이벤트 핸들러) 함수 본문을 try/catch 로 감싸고
    catch 를 `$c.exception.handleError(ex, { context : "{화면ID}.{함수명}" })` 한 줄로 통일한다
    (code-convention §오류 처리). 본문에 try 가 이미 있거나 실행문이 없으면 건너뛴다.
    2구역은 라이프사이클 진입점(onpageload/onpageunload)만 대상 — 그 밖의 초기화 헬퍼(init 등)는
    onpageload 가 감싸는 내부 함수이므로 래핑하지 않는다. 들여쓰기 단위(탭/4칸)는 본문에서 감지. 멱등."""
    mask = code_mask(script)
    # 2·3구역 범위 산출 — 규칙 4 가 삽입한 섹션 헤더 기준(헤더가 없으면 미적용)
    heads = [(m.start(), m.group(0)) for m in re.finditer(r'(?m)^/{9} (\d)\. [^\n]*? /{9}[ \t]*$', script)]
    ranges = []
    for i, (pos, txt) in enumerate(heads):
        num = int(re.search(r'/{9} (\d)\.', txt).group(1))
        if num in (2, 3):
            end = heads[i + 1][0] if i + 1 < len(heads) else len(script)
            ranges.append((num, pos, end))
    if not ranges:
        report["rule26"] = 0
        return script
    fpat = re.compile(r'(?m)^scwin\.([A-Za-z_$][\w$]*)\s*=\s*(async\s+)?function\b[^\n{]*\{')
    edits = []
    cnt = 0
    for sec, st, en in ranges:
        for mo in fpat.finditer(script, st, en):
            if sec == 2 and mo.group(1) not in ("onpageload", "onpageunload"):
                continue   # 2구역 내부 헬퍼(init 등)는 진입점이 아님 — onpageload 의 catch 로 수렴
            bopen = script.index("{", mo.end() - 1)
            bclose = _match_brace(script, mask, bopen)
            if bclose < 0:
                continue
            body = script[bopen + 1:bclose]
            code_txt = "".join(t for t, c in segments(body) if c)
            if not code_txt.strip():
                continue   # 실행문 없는 본문(onpageunload 등)
            if re.search(r'(?<![.\w$])try(?![\w$])', code_txt):
                continue   # 이미 try 존재 — 수기 적용분 보존(멱등)
            is_async = bool(mo.group(2))
            body_lines = body.strip("\n").split("\n")
            unit = "\t" if body_lines and body_lines[0].startswith("\t") else "    "   # 파일 들여쓰기 단위 감지
            inner = "\n".join(((unit + ln) if ln.strip() else ln) for ln in body_lines)
            call = ("await " if is_async else "") + '$c.exception.handleError(ex, { context : "%s.%s" });' % (screen_id, mo.group(1))
            new_body = ("\n" + unit + "try {\n" + inner + "\n" + unit + "} catch (ex) {\n"
                        + unit + unit + call + "\n" + unit + "}\n")
            edits.append((bopen + 1, bclose, new_body))
            cnt += 1
    for st, en, rep_txt in sorted(edits, reverse=True):
        script = script[:st] + rep_txt + script[en:]
    report["rule26"] = cnt
    return script


_GRID_CHILD_TAGS = ("w2:caption", "w2:header", "w2:gBody")


def rule27_dedup_grid_child_ids(body, report):
    """그리드 표준 자식 요소(caption/header/gBody)의 문서 전체 중복 id 를 순번으로 재부여한다(규칙 27).
    W-Craft 변환기가 그리드마다 caption1/header1/gBody1 을 복제 생성해 wsxml_lint WS120 이 발생하는 문제 해소.
    첫 등장은 유지, 이후 중복은 "{base}{n}" 의 미사용 순번으로 개명(표시 전용 id 만 대상). 멱등."""
    changes = []
    for tag in _GRID_CHILD_TAGS:
        base = tag.split(":")[1]
        pat = re.compile(r'(<' + tag + r'\b[^>]*\bid=")([^"]+)(")')
        used = set(m.group(2) for m in pat.finditer(body))
        seen = set()

        def sub(m, base=base, used=used, seen=seen, tag=tag):
            cur = m.group(2)
            if cur not in seen:
                seen.add(cur)
                return m.group(0)
            n = 1
            while base + str(n) in used:
                n += 1
            new = base + str(n)
            used.add(new)
            changes.append("%s id=%s → %s" % (tag, cur, new))
            return m.group(1) + new + m.group(3)

        body = pat.sub(sub, body)
    report["rule27"] = changes
    return body


# 반복문 내 DataCollection 변경으로 판정하는 뮤테이터 메서드(규칙 28)
_DC_MUTATORS = r'(?:set|setCellData|setColumnData|insertRow|addRow|removeRow|deleteRow|insertJSON|appendJSON)'


def rule28_broadcast_guard(script, head, report):
    """반복문 내 Map/List 데이터 수정 시 UI 갱신 제어(규칙 28) — for/while/forEach 문장의 본문이
    DataCollection(head 선언 dataMap/dataList id 또는 dma_/dlt_/dts_ 접두 식별자)을 반복 변경하면
    반복 전 `{dc}.setBroadcast(false);`, 반복 후 `{dc}.setBroadcast(true, true);` 를 삽입한다.
    - 본문에 return/throw 가 있으면 복원 누락 위험이 있어 보류·리포트(단계 2 검토).
    - 직전 줄들에 이미 해당 dc 의 setBroadcast(false) 가 있으면 건너뜀 → 멱등.
    - 다른 감지 루프 내부에 중첩된 루프는 바깥 루프만 처리한다."""
    mask = code_mask(script)
    n = len(script)
    dc_ids = set(re.findall(r'<w2:data(?:Map|List)\b[^>]*\bid="([\w$]+)"', head))

    def is_dc(name):
        return name in dc_ids or re.match(r'^(?:dma_|dlt_|dts_)', name) is not None

    def match_paren(p):
        d, j = 0, p
        while j < n:
            if mask[j]:
                if script[j] == "(":
                    d += 1
                elif script[j] == ")":
                    d -= 1
                    if d == 0:
                        return j
            j += 1
        return -1

    def code_only(text):
        return "".join(t for t, c in segments(text) if c)

    loops = []
    # for / while 루프 (문장 시작 위치, 중괄호 본문만)
    for mo in re.finditer(r'(?m)^([ \t]*)(for|while)\s*\(', script):
        if not mask[mo.start(2)]:
            continue
        p = script.index("(", mo.end(2) - 1)
        rp = match_paren(p)
        if rp < 0:
            continue
        b = script.find("{", rp)
        if b < 0 or script[rp + 1:b].strip():
            continue   # 중괄호 없는 단문 루프는 대상 외
        bc = _match_brace(script, mask, b)
        if bc < 0:
            continue
        body = code_only(script[b + 1:bc])
        dcs = sorted(set(m for m in re.findall(r'([\w$]+)\.' + _DC_MUTATORS + r'\s*\(', body) if is_dc(m)))
        if dcs:
            loops.append({"indent": mo.group(1), "start": mo.start(), "end": bc + 1, "body": body, "dcs": dcs,
                          "label": "%s 루프" % mo.group(2)})
    # {DC}.forEach(...) 문장 — 수신 DataCollection 자체를 순회 변경
    for mo in re.finditer(r'(?m)^([ \t]*)([\w$]+)\.forEach\s*\(', script):
        if not mask[mo.start(2)] or not is_dc(mo.group(2)):
            continue
        p = script.index("(", mo.end() - 1)
        rp = match_paren(p)
        if rp < 0:
            continue
        e = rp + 1
        while e < n and script[e] in " \t":
            e += 1
        if e < n and script[e] == ";":
            e += 1
        body = code_only(script[p + 1:rp])
        if not re.search(r'\.' + _DC_MUTATORS + r'\s*\(', body):
            continue
        loops.append({"indent": mo.group(1), "start": mo.start(), "end": e, "body": body, "dcs": [mo.group(2)],
                      "label": "%s.forEach" % mo.group(2)})

    # 감지 루프끼리 중첩되면 바깥 루프만 처리
    loops = [lp for lp in loops
             if not any(o is not lp and o["start"] < lp["start"] and lp["end"] <= o["end"] for o in loops)]

    applied, edits = [], []
    for lp in loops:
        if re.search(r'(?<![.\w$])(?:return|throw)(?![\w$])', lp["body"]):
            report.setdefault("judgment", []).append(
                "규칙28 setBroadcast 보류(%s — 본문 return/throw 로 복원 누락 위험, 수동 적용 검토)" % lp["label"])
            continue
        prev = "\n".join(script[:lp["start"]].split("\n")[-6:])   # 직전 줄들에서 기적용 여부 판정(멱등)
        dcs = [dc for dc in lp["dcs"] if not re.search(re.escape(dc) + r'\.setBroadcast\(\s*false\s*\)', prev)]
        if not dcs:
            continue
        pre = "".join("%s%s.setBroadcast(false);\n" % (lp["indent"], dc) for dc in dcs)
        post = "".join("\n%s%s.setBroadcast(true, true);" % (lp["indent"], dc) for dc in dcs)
        edits.append((lp["start"], lp["start"], pre))
        edits.append((lp["end"], lp["end"], post))
        applied.append("%s → setBroadcast 제어(%s)" % (lp["label"], ", ".join(dcs)))

    for st, en, rep_txt in sorted(edits, reverse=True):
        script = script[:st] + rep_txt + script[en:]
    report["rule28"] = applied
    return script


def convert(raw, filename):
    """단계 1 변환 진입점 — 규칙 파이프라인(_convert_once)을 고정점까지 반복 적용한다.
    개별 규칙은 멱등이지만 재배치·헤더 삽입·공백 정리의 상호작용으로 1회차에 미세 공백이
    남는 사례가 있어, 출력이 더 이상 변하지 않을 때까지(최대 2회 추가) 재적용해 수렴시킨다.
    리포트는 실질 변환이 일어난 1회차 것을 반환한다. a↔b 진동은 수렴하지 않으므로
    convert_all 의 IDEM 검사에 그대로 검출된다."""
    result, report = _convert_once(raw, filename)
    for _ in range(2):
        again, _rep = _convert_once(result, filename)
        if again == result:
            break
        result = again
    return result, report


def _convert_once(raw, filename):
    report = {"rule1": "", "rule2": 0, "rule2_skip": [], "rule3": [], "rule4": None, "rule4_merge": None, "rule5a": 0, "rule5b": [], "rule5c": [], "rule5d": [], "rule6": {"converted": [], "deleted": 0}, "rule7": [], "rule7m": [], "rule7n": [], "rule8": {"const": 0, "let": 0}, "rule9": 0, "rule10": 0, "rule11": 0, "rule12": {"converted": []}, "rule13": [], "rule14": [], "rule15": [], "rule16": {"converted": [], "skipped": []}, "rule17": {"converted": [], "skipped": []}, "rule20": [], "rule21": [], "rule23": [], "async_marked": [], "wcraft": 0, "judgment": []}
    reg = split_regions(raw)
    if reg is None:
        raise ValueError("SCRIPT(CDATA) 영역을 찾지 못했습니다.")
    s = reg["script"]
    s = rule1_vscrenid(s, filename, report)
    s = rule2_globals(s, report)
    s = rule5a_strict_eq(s, report)
    s = rule5e_neg_compare(s, report)   # !X === Y 우선순위 버그 교정(5a 로 === 통일 후)
    s = rule5b_setvalue(s, report)
    s = rule5c_setbgimage(s, report)
    s = rule5d_method_rename(s, report)
    reg["head"], s = rule6_submission(reg["head"], reg["body"], s, report)
    s = rule12_dynamic_submission(s, report)
    s = rule16_trs_submission(s, report)
    s = rule17_create_dialog_frame(s, report)
    s = rule25_sequential_submission(s, report)   # submitDoneHandler 옵션형(수기 변환분) → 순차 스타일 정규화
    s = mark_async_functions(s, report)   # 규칙 6/12/16/17/25 가 만든 await 의 소속 함수 async 부여
    s = rule9_remove_obsolete(s, report)
    s = rule11_remove_include(s, report)
    s = rule8_var(s, report)
    s = rule7_gcc_substitute(s, report)
    s = rule7m_method_substitute(s, report)
    s = rule7n_normalize_module_fn(s, report)
    s = rule14_component_method(s, report)
    s = rule15_alert_error(s, report)
    s = rule20_grid_excel_download(s, report)
    s = rule20b_normalize_excel_positional(s, report)
    s = rule21_frame_provider(s, report)
    s = rule23_grid_visible_rownum_all(s, report)
    reg["head"], s, reg["body"] = rule13_rename_scwin_fn(reg["head"], s, reg["body"], report)
    s, reg["body"] = rule3_handlers(s, reg["body"], report)
    s, reg["body"] = rule4_structure(s, reg["body"], report)
    s = mark_async_functions(s, report)   # 규칙4 병합(gform_onload→onpageload)으로 이동한 await 재탐지
    s = rule26_entry_trycatch(s, report, filename.rsplit(".", 1)[0])   # 진입점 try/catch + handleError(규칙4 섹션 기준)
    s = rule28_broadcast_guard(s, reg["head"], report)   # 반복문 내 DC 수정 시 setBroadcast 제어
    s = align_wcraft(s, report)   # //----W-Craft 마커 주석 정렬
    s = format_comment_space(s, report)   # // 주석 뒤 공백 1개(code-convention 주석 규칙)
    s = format_script(s)          # 함수 단위 빈 줄 + 주석 맨앞 정렬
    s = collapse_blank_runs(s)    # 잔존 다중 빈 줄 수렴(멱등성 보장)
    reg["head"] = rule10_remove_events(reg["head"], report)   # <xf:events>/<xf:event> 삭제
    reg["body"] = rule10_remove_events(reg["body"], report)
    reg["body"] = rule27_dedup_grid_child_ids(reg["body"], report)   # caption/header/gBody 중복 id 재부여(WS120)
    collect_judgment(s, reg["head"], reg["body"], report)
    result = reg["head"] + reg["script_open"] + s + reg["script_close"] + reg["body"]
    return result, report


def print_report(rep, filename):
    print("==== [단계1] Python 기계 치환 리포트 :", filename, "====")
    print("규칙1 vScrenID :", rep["rule1"])
    print("규칙2 전역변수 이동 :", rep["rule2"], "건", ("(이동보류 %d건)" % len(rep["rule2_skip"])) if rep["rule2_skip"] else "")
    for s in rep["rule2_skip"]:
        print("   (보류) -", s)
    print("규칙5a ==/!= → ===/!== :", rep["rule5a"], "건")
    print("규칙5b .value= → .setValue() :", len(rep["rule5b"]), "건")
    for s in rep["rule5b"]:
        print("   -", s)
    print("규칙5c .src= → .setBackgroundImage() :", len(rep["rule5c"]), "건")
    for s in rep["rule5c"]:
        print("   -", s)
    print("규칙5d .getTotalRow() → .getRowCount() :", len(rep["rule5d"]), "건")
    for s in rep["rule5d"]:
        print("   -", s)
    print("규칙6 Submission→executeDynamic :", len(rep["rule6"]["converted"]), "건 변환, 노드삭제", rep["rule6"]["deleted"])
    for sid in rep["rule6"]["converted"]:
        print("   -", sid)
    print("규칙3 ev:on 핸들러 동기화 :", len(rep["rule3"]), "건")
    for s in rep["rule3"]:
        print("   -", s)
    if rep["rule4"]:
        r4 = rep["rule4"]
        print("규칙4 재정렬 : init %d, event %d, callback %d, 일반 %d%s" % (
            r4["init"], r4["event"], r4.get("callback", 0), r4["general"],
            (" + gform_onload 병합" if r4["merged"] else "")))
    else:
        print("규칙4 재정렬 : 보류/미적용")
    print("규칙7 레거시→gcc 치환 :", len(rep["rule7"]), "건")
    for s in rep["rule7"]:
        print("   -", s)
    print("규칙7m 레거시 메서드→gcc 치환 :", len(rep["rule7m"]), "건")
    for s in rep["rule7m"]:
        print("   -", s)
    print("규칙7n 모듈 네임스페이스 레거시명 정규화 :", len(rep["rule7n"]), "건")
    for s in rep["rule7n"]:
        print("   -", s)
    print("규칙14 컴포넌트 메서드 승격(show/hide/getValue/setValue) :", len(rep["rule14"]), "건")
    for s in rep["rule14"]:
        print("   -", s)
    print("규칙15 alert_error → $c.win.alert :", len(rep["rule15"]), "건")
    for s in rep["rule15"]:
        print("   -", s)
    print("규칙20 advancedExcelDownload → $c.data.downloadGridViewExcel :", len(rep["rule20"]), "건")
    for s in rep["rule20"]:
        print("   -", s)
    print("규칙21 frame.Provider(\"../\") → $c.win.getParent() :", len(rep["rule21"]), "건")
    for s in rep["rule21"]:
        print("   -", s)
    print("규칙23 setVisibleRowNum(\"all\") → $c.util.setGridVisibleRowNum :", len(rep["rule23"]), "건")
    for s in rep["rule23"]:
        print("   -", s)
    print("규칙8 var→const/let : const %d, let %d" % (rep["rule8"]["const"], rep["rule8"]["let"]))
    print("규칙9 불필요 $c.cm.* 호출 제거 :", rep["rule9"], "건")
    print("규칙10 <xf:events>/<xf:event> 삭제 :", rep["rule10"], "건")
    print("규칙11 include(...) 라인 삭제 :", rep["rule11"], "건")
    print("규칙12 DataID/reset → executeDynamic :", len(rep["rule12"]["converted"]), "건")
    for s in rep["rule12"]["converted"]:
        print("   -", s)
    print("규칙16 trs Action/KeyValue/Parameters/Post → executeDynamic :", len(rep["rule16"]["converted"]), "건")
    for s in rep["rule16"]["converted"]:
        print("   -", s)
    print("규칙17 CreateDialogFrame → openPopup :", len(rep["rule17"]["converted"]), "건")
    for s in rep["rule17"]["converted"]:
        print("   -", s)
    print("async 함수 전환(await 포함 함수) :", len(rep.get("async_marked", [])), "건")
    print("규칙5e !X === Y 우선순위 교정 :", len(rep.get("rule5e", [])), "건")
    for s in rep.get("rule5e", []):
        print("   -", s)
    r25 = rep.get("rule25", {"converted": [], "skipped": []})
    print("규칙25 submitDoneHandler 옵션 → 순차 스타일 :", len(r25["converted"]), "건", ("(보류 %d건)" % len(r25["skipped"])) if r25["skipped"] else "")
    for s in r25["converted"]:
        print("   -", s)
    print("규칙26 진입점 try/catch + handleError 래핑 :", rep.get("rule26", 0), "건")
    print("규칙27 그리드 자식 중복 id 재부여 :", len(rep.get("rule27", [])), "건")
    print("규칙28 반복문 setBroadcast 제어 :", len(rep.get("rule28", [])), "건")
    for s in rep.get("rule28", []):
        print("   -", s)
    print("포맷 // 주석 뒤 공백 삽입 :", rep.get("fmt_comment_space", 0), "건")
    for s in rep.get("async_marked", []):
        print("   -", s)
    print("규칙13 scwin.fn_* → camelCase 정규화 :", len(rep["rule13"]), "건")
    for s in rep["rule13"]:
        print("   -", s)
    print("\n==== [단계2 입력] Claude Code 보강 필요 항목 ====")
    for s in rep["judgment"]:
        print(" * " + s)


def main():
    if len(sys.argv) < 2:
        print("usage: python convert.py <src.xml> [out.xml]", file=sys.stderr); sys.exit(2)
    src = Path(sys.argv[1])
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix(".converted.xml")
    raw = io.open(src, "r", encoding="utf-8").read()
    result, report = convert(raw, src.name)
    io.open(out, "w", encoding="utf-8", newline="").write(result)
    sys.stdout.reconfigure(encoding="utf-8")
    print_report(report, src.name)
    print("\n생성:", out)


if __name__ == "__main__":
    main()
