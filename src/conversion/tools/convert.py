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
  · 규칙 7 : substitution_dict() 의 (태그없음·무충돌·순수식별자) 함수 호출부 단어경계 치환

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

# 규칙 4 영역 경계 주석
_SEC_GLOBAL = "// 전역 변수 선언"
_SEC_INIT = "// scwin.onpageload, scwin.onpageunload 함수"
_SEC_EVENT = "// WebSquare 컴포넌트 이벤트 함수"
_SEC_GENERAL = "// 일반 함수"
_BOUNDARIES = (_SEC_GLOBAL, _SEC_INIT, _SEC_EVENT, _SEC_GENERAL)
_RULE4_BOUNDARIES = (_SEC_INIT, _SEC_EVENT, _SEC_GENERAL)  # 규칙4가 직접 관리(전역 주석은 규칙2 소관)


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
    # 기존 '// 전역 변수 선언' 주석 제거(중복 방지) 후 vScrenID 바로 아래에 재삽입
    res = re.sub(r'(?m)^[ \t]*//[ \t]*전역 변수 선언[ \t]*\r?\n?', '', res)
    a = re.search(r'scwin\.vScrenID\s*=\s*[^;\n]*;[ \t]*(?://[^\n]*)?\r?\n?', res)
    at = a.end()
    block = "// 전역 변수 선언\n" + "\n".join(moved) + "\n"
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


def rule7_gcc_substitute(code, report):
    """substitution_dict() 의 함수 호출부를 단어경계로 치환(코드 세그먼트만, 메서드 호출 .fn() 제외)."""
    sub = gcc_mapping.substitution_dict()
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
    """함수 앞 주석 블록에서 규칙4 경계 주석을 제거하고 앞뒤 빈줄 정리."""
    out = [ln for ln in text.splitlines() if ln.strip() not in _RULE4_BOUNDARIES]
    return "\n".join(out).strip("\n")


def rule4_structure(script, body, report):
    """
    최상위 함수 정의를 init / event / 일반 3구역으로 분류·재배치하고 경계 주석을 붙인다.
    - 함수 사이/뒤에 최상위 실행문이 섞여 있으면 재정렬 보류(리포트).
    - gform_onload 는 onpageload 가 'scwin.gform_onload();' 단일 호출이고 참조가 1건일 때만 병합.
    - doc 주석(경계 주석 제외)은 해당 함수와 함께 이동. 멱등.
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

    def category(name):
        if name in ("onpageload", "onpageunload"):
            return "init"
        if name == "gform_onload":
            return "general"   # 병합 안 된 경우 일반으로
        if name in evon or re.search(r'_[Oo]n[A-Za-z]', name):
            return "event"
        return "general"

    buckets = {"init": [], "event": [], "general": []}
    for i, f in enumerate(funcs):
        if removed[i]:
            continue
        buckets[category(f["name"])].append(i)

    def emit(cat):
        out = []
        for i in buckets[cat]:
            cl = _clean_lead(leads[i])
            block = (cl + "\n" if cl else "") + funcs[i]["text"]
            out.append(block)
        return out

    # preamble/tail 에서 규칙4 경계 주석 제거(재실행 시 중복 방지 → 멱등)
    preamble_clean = "\n".join(ln for ln in preamble.splitlines() if ln.strip() not in _RULE4_BOUNDARIES).rstrip("\n")
    tail_clean = "\n".join(ln for ln in tail.splitlines() if ln.strip() not in _RULE4_BOUNDARIES).strip("\n")

    parts = [preamble_clean]
    for cat, header in (("init", _SEC_INIT), ("event", _SEC_EVENT), ("general", _SEC_GENERAL)):
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
                       "general": len(buckets["general"]), "merged": merged}
    return result, body


def align_wcraft(script, report=None):
    """`//----W-Craft ...` 마커 주석을 맨앞(컬럼 0)으로 정렬(앞 들여쓰기 제거). 문자열 내부는 보호. 멱등."""
    mask = code_mask(script)
    pat = re.compile(r'(?m)^([ \t]+)(//-+\s*W-Craft[^\n]*)$')
    out, last, cnt = [], 0, 0
    for mo in pat.finditer(script):
        if not mask[mo.start(1)]:   # 문자열/비코드 영역이면 스킵
            continue
        out.append(script[last:mo.start()]); out.append(mo.group(2)); last = mo.end()
        cnt += 1
    out.append(script[last:])
    if report is not None:
        report["wcraft"] = cnt
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
        parts = _sbm_option_parts(attrs, gridview)
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
def convert(raw, filename):
    report = {"rule1": "", "rule2": 0, "rule2_skip": [], "rule3": [], "rule4": None, "rule4_merge": None, "rule5a": 0, "rule5b": [], "rule6": {"converted": [], "deleted": 0}, "rule7": [], "rule8": {"const": 0, "let": 0}, "wcraft": 0, "judgment": []}
    reg = split_regions(raw)
    if reg is None:
        raise ValueError("SCRIPT(CDATA) 영역을 찾지 못했습니다.")
    s = reg["script"]
    s = rule1_vscrenid(s, filename, report)
    s = rule2_globals(s, report)
    s = rule5a_strict_eq(s, report)
    s = rule5b_setvalue(s, report)
    reg["head"], s = rule6_submission(reg["head"], reg["body"], s, report)
    s = rule8_var(s, report)
    s = rule7_gcc_substitute(s, report)
    s, reg["body"] = rule3_handlers(s, reg["body"], report)
    s, reg["body"] = rule4_structure(s, reg["body"], report)
    s = align_wcraft(s, report)   # //----W-Craft 마커 주석 맨앞 정렬
    s = format_script(s)          # 함수 단위 빈 줄 + 주석 맨앞 정렬
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
    print("규칙6 Submission→executeDynamic :", len(rep["rule6"]["converted"]), "건 변환, 노드삭제", rep["rule6"]["deleted"])
    for sid in rep["rule6"]["converted"]:
        print("   -", sid)
    print("규칙3 ev:on 핸들러 동기화 :", len(rep["rule3"]), "건")
    for s in rep["rule3"]:
        print("   -", s)
    if rep["rule4"]:
        r4 = rep["rule4"]
        print("규칙4 재정렬 : init %d, event %d, 일반 %d%s" % (
            r4["init"], r4["event"], r4["general"],
            (" + gform_onload 병합" if r4["merged"] else "")))
    else:
        print("규칙4 재정렬 : 보류/미적용")
    print("규칙7 레거시→gcc 치환 :", len(rep["rule7"]), "건")
    for s in rep["rule7"]:
        print("   -", s)
    print("규칙8 var→const/let : const %d, let %d" % (rep["rule8"]["const"], rep["rule8"]["let"]))
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
