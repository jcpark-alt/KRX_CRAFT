# -*- coding: utf-8 -*-
"""규칙 19 기계 가능분 — jQuery·원시 DOM 접근 중 **body 의 WebSquare 컴포넌트 하나로 확정되는 것**만 컴포넌트 API 로 바꾼다 (V36).

    python conversion/tools/dom_rules.py [--dry] <xml|폴더> ...     (ui-tobe 제자리, 멱등)

확정 기준: 셀렉터가 `#id` / `[id=X]` / `input|select|textarea[name=X]`(접미 없음) 이고, body 에서 그 id 또는 name 을 가진 입력 컴포넌트
(xf:input · xf:select1 · xf:select · w2:inputCalendar · w2:textarea)가 **정확히 하나**일 때. 공급사 산출은 라디오 한 칸마다 select1 을 따로
그려(같은 name 이 여럿) `:checked` 류는 확정되지 않는다 — 그런 것과 `.find/.each/.append/.empty/.html/.css/.bind/.submit` 같은 구조 조작은
손대지 않고 잔여 집계(worklist)에 남긴다.

바꾸는 꼴 (G = `$c.util.getComponent("id")`):
  J1 `$(sel).val()` → `G.getValue()`                       J2 `$(sel).val(v)` → `G.setValue(v)`
  J3 `$(document).find("select[id=X]").val(…)` → J1/J2     J4 `$(sel).attr|prop("disabled", v)` → `G.setDisabled(b)` ·
     `.removeAttr("disabled")` → `setDisabled(false)` — v 가 true/false/'disabled'/''/"true" 리터럴이면 불리언으로, 식별자면 `Boolean(v)`
  J5 같은 꼴의 "readonly"/"readOnly" → `G.setReadOnly(b)`   J6 `$(sel).show()/.hide()/.focus()` → `G.show()/.hide()/.focus()`
  D1 `fm.X.value` · `document.F.X.value` · `document.getElementsByName("X")[0].value` (읽기) → `G.getValue()`, 대입 `… = v` → `G.setValue(v)`
"""
import collections
import io
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402
import convert as cv  # noqa: E402

COMP_TAGS = ("xf:input", "xf:select1", "xf:select", "w2:inputCalendar", "w2:textarea")
Q = r'''(['"])'''
# 셀렉터: #id · [id=X] · tag#id · tag[name=X] · [name=X]  (접미(:checked 등)·복합 없음)
SEL = (r'(?:(?:input|select|textarea)?\s*#(?P<hid>[A-Za-z_][\w-]*)'
       r'|(?:input|select|textarea)?\[\s*id\s*=\s*["\']?(?P<aid>[A-Za-z_][\w-]*)["\']?\s*\]'
       r'|(?:input|select|textarea)?\[\s*name\s*=\s*["\']?(?P<name>[A-Za-z_][\w-]*)["\']?\s*\])')
JQ = r'(?<![\w$.])\$\(\s*' + Q + SEL + r'\1\s*\)'
JQ_DOC = r'(?<![\w$.])\$\(\s*document\s*\)\s*\.find\(\s*' + Q + SEL + r'\1\s*\)'
TRUE_LIT = {"true", "'true'", '"true"', "'disabled'", '"disabled"', "'readonly'", '"readonly"', "'readOnly'", '"readOnly"', "1"}
FALSE_LIT = {"false", "''", '""', "0", "null", "undefined"}


def index_body(body):
    by_id, by_name = {}, collections.defaultdict(list)
    for m in re.finditer(r'<(%s)\b([^>]*)>' % "|".join(re.escape(t) for t in COMP_TAGS), body):
        attrs = m.group(2)
        i = re.search(r'\sid="([^"]+)"', attrs)
        n = re.search(r'\sname="([^"]+)"', attrs)
        if i:
            by_id[i.group(1)] = m.group(1)
            if n:
                by_name[n.group(1)].append(i.group(1))
    return by_id, by_name


def _resolve(m, by_id, by_name):
    gid = m.group("hid") or m.group("aid")
    if gid:
        return gid if gid in by_id else None
    ids = by_name.get(m.group("name"), [])
    return ids[0] if len(ids) == 1 else None


def _bool(v):
    v = v.strip()
    if v in TRUE_LIT:
        return "true"
    if v in FALSE_LIT:
        return "false"
    if re.match(r'^[A-Za-z_$][\w$.]*$', v) or re.match(r'^!', v):
        return "Boolean(%s)" % v
    return None


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


def _rewrite(script, pattern, make, log, key):
    """pattern 은 `$(sel).method(` 까지(여는 괄호 포함). make(gid, method, args_text) → 치환문 또는 None."""
    out, pos, n = [], 0, 0
    mask = cv.code_mask(script)
    for m in re.finditer(pattern, script):
        if m.start() < pos or not mask[m.start()]:
            continue
        cl = _balanced(script, m.end() - 1)
        if cl < 0:
            continue
        rep = make(m, script[m.end():cl])
        if rep is None:
            continue
        out.append(script[pos:m.start()]); out.append(rep); pos = cl + 1; n += 1
    out.append(script[pos:])
    if n:
        log[key] = log.get(key, 0) + n
    return "".join(out)


def apply(script, body):
    by_id, by_name = index_body(body)
    log = {}
    G = lambda gid: '$c.util.getComponent("%s")' % gid  # noqa: E731

    def jq_make(m, args):
        gid = _resolve(m, by_id, by_name)
        if gid is None:
            return None
        meth, a = m.group("meth"), args.strip()
        if meth == "val":
            return "%s.getValue()" % G(gid) if a == "" else "%s.setValue(%s)" % (G(gid), a)
        if meth in ("attr", "prop"):
            mm = re.match(r'''^(['"])(disabled|readonly|readOnly)\1\s*,\s*(.+)$''', a, re.S)
            if not mm:
                return None
            b = _bool(mm.group(3))
            if b is None:
                return None
            return "%s.%s(%s)" % (G(gid), "setDisabled" if mm.group(2) == "disabled" else "setReadOnly", b)
        if meth == "removeAttr":
            mm = re.match(r'''^(['"])(disabled|readonly|readOnly)\1$''', a)
            return None if not mm else "%s.%s(false)" % (G(gid), "setDisabled" if mm.group(2) == "disabled" else "setReadOnly")
        if meth in ("show", "hide", "focus") and a == "":
            return "%s.%s()" % (G(gid), meth)
        return None

    for pat in (JQ, JQ_DOC):
        script = _rewrite(script, pat + r'\s*\.\s*(?P<meth>val|attr|prop|removeAttr|show|hide|focus)\s*\(', jq_make, log,
                          "J_jquery" if pat is JQ else "J3_document_find")

    # D1 원시 폼 필드 — 쓰기(= v) 먼저, 읽기 다음
    def field_pat(prefix):
        return prefix + r'(?P<fname>[A-Za-z_]\w*)\.value\b'
    FORM = r'(?<![\w$.])(?:fm|document\.[A-Za-z_]\w*)\.'
    BYNAME = r'(?<![\w$.])document\.getElementsByName\(\s*(?P<q>[\'"])(?P<fname>[A-Za-z_]\w*)(?P=q)\s*\)\s*\[\s*0\s*\]\s*\.value\b'

    def d_write(m):
        ids = by_name.get(m.group("fname"), [])
        return None if len(ids) != 1 else ids[0]

    out, pos = [], 0
    mask = cv.code_mask(script)
    for pat, key in ((field_pat(FORM), "D1_form_field"), (BYNAME, "D1_byname")):
        out, pos, n = [], 0, 0
        mask = cv.code_mask(script)
        for m in re.finditer(pat + r'(?P<assign>\s*=(?!=)\s*)?', script):
            if m.start() < pos or not mask[m.start()]:
                continue
            gid = d_write(m)
            if gid is None:
                continue
            if m.group("assign"):
                # 대입: 문장 끝(;) 까지가 값
                end = script.find(";", m.end())
                if end < 0 or "\n" in script[m.end():end]:
                    continue
                out.append(script[pos:m.start()]); out.append("%s.setValue(%s)" % (G(gid), script[m.end():end].strip())); pos = end; n += 1
            else:
                out.append(script[pos:m.start()]); out.append("%s.getValue()" % G(gid)); pos = m.end(); n += 1
        out.append(script[pos:])
        script = "".join(out)
        if n:
            log[key] = n
    return script, log


def leftovers(script):
    """잔여 집계(worklist 용): jQuery 호출 수 · 원시 폼 접근 수."""
    code = st.without_comments(script)
    return {"jquery": len(re.findall(r'(?<![\w$.])\$\(', code)),
            "form_dom": len(re.findall(r'(?<![\w$.])(?:fm|document\.[A-Za-z_]\w*)\.(?:\w+\.)?(?:value|checked|submit|action|target|elements)\b', code))}


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    files, fl, _ = st.parse_cli(argv if argv is not None else sys.argv[1:], flags=("--dry",), opts=())
    if not files:
        print(__doc__); return 2
    tot = collections.Counter()
    for f in files:
        raw, eol, reg = st.read_xml(f)
        if reg is None:
            continue
        new, log = apply(reg["script"], reg["body"])
        tot.update(log)
        if log:
            print("%-18s %s" % (Path(f).stem, dict(log)))
            if not fl["--dry"]:
                st.write_xml(f, reg["head"], reg["script_open"], new, reg["script_close"], reg["body"], eol)
    print("합계:", dict(tot))
    return 0


if __name__ == "__main__":
    sys.exit(main())
