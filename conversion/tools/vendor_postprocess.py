# -*- coding: utf-8 -*-
"""공급사(editor-web generate r13) 산출 전용 후처리 — convert.py 가 모르는 공급사 관용구를 우리 규약으로 접는다.

    python conversion/tools/vendor_postprocess.py [--dry] <xml|폴더> ...   (제자리 적용; 파이프라인에서는 모듈로 호출)

규칙(V = vendor). 전부 결정적 치환이며 화면 동작은 바꾸지 않는다. 판단이 필요한 자리는 `TODO Stage2` 주석으로 남긴다.
  V1  head 의 `<script src="/_commons/…">` 삭제 — 공급사 공용 모듈 참조(우리 배포는 config.xml 모듈 등록)
  V2  head meta_screenName 이 화면 id 그대로면 body 의 `pgt_tit` 라벨(한글 제목)로 채움
  V3  `init_attrReals` 의 범용 실현 루프(60줄) → 데이터 목록(attrRealsList)은 두고 몸통만 표준 forEach 로(정비본 꼴). 동기 함수화
  V4  `init_conds` 의 범용 평가 루프 → `b.fn() ? comp.show() : comp.hide()` forEach 로. 동기 함수화
  V5  빈값 래퍼 `((cv) => (…) ? cv : "")(X)` → `(X ?? "")` (의미 동일: ""·null·undefined → "")
      경고 래퍼 `((cv) => … (console.warn("[sdd] 컨텍스트 키 미충전 — KEY …"), ""))(X)` → `(X ?? "")` + 키를 TODO 주석에 기록
      세션 래퍼 `((sv) => … throw { bizMessage: "세션 값을 읽지 못했습니다 — session.user.KEY" …})($c.session.getUserInfo("KEY"))`
      → `$c.session.getUserInfo("KEY")` + TODO(정비본 59400 선례). `String(String(X))` → `String(X)`
  V6  tx_* 의 `let res = null; try { res = await executeDynamic } catch { handleError; return null }` 보일러플레이트
      → `const res = await executeDynamic` (진입점이 아닌 함수의 try/catch 금지 — 통신 오류는 sbm/handleError 몫) + `skipped` 가드
  V7  핸들러 머리의 미사용 `const ev = e; const event = ev; const selfVar = …;` 삭제 · `/* sdd-asis-lifecycle:begin|end … */` 마커 삭제
  V8  `if (typeof scwin.X === 'function') { 호출 } else { console.error('[sdd] 행 동작 미정의…'); alert }`
      → X 가 이 파일에 정의돼 있으면 호출만, 없으면 TODO + alert(드러남 유지)
  V9  `console.warn|error("[sdd] …");` 문장 → `/* TODO Stage2: [sdd] … */` (블록 주석 — 한 줄 `{ …; return; }` 안에서도 안전)
  V10 `throw { bizMessage: … }` 줄 위에 `// TODO Stage2: 전환 미완(공급사 드러냄)` 주석(던지기는 유지 — 사용자에게 사유가 보인다)
  V11 `$("form[name='F']").attr("action", "U");` → TODO 블록 주석(tx 전환으로 사문; 규칙 19 축)
  V12 `// as-is 흐름 보존 — … \n scwin.a = undefined; scwin.b = undefined;` → 이미 선언된 이름은 삭제, 나머지는 `scwin.a = null;` 각 줄로
      (규칙 2 가 1구역으로 옮긴다 — 함수 사이 최상위 실행문 때문에 규칙 4 가 보류되던 원인)
  V13 `scwin.fn_X` 정의의 camelCase 결과가 같은 파일의 전역/함수와 충돌하면 먼저 개명(기본 `exec<X>`, 알려진 것은 RENAME 표 — 25900/25910
      `fn_modifiyDate` → `selectModifiyDate`(상태 변수 `scwin.modifiyDate` 와 충돌, 정비본 선례)). 규칙 13 이 못 보는 충돌
  V14 JSDoc 바로 위의 `//` 설명 줄 → JSDoc `@description` 으로(규칙 4 재정렬 때 `//` 줄만 고아가 되는 것을 막는다)
  V15 `{ const nr = await scwin.tx_x(); if (nr && … success === true) { 이동 } };` 한 줄 블록 → 여러 줄 문장(함수당 1개일 때만)
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402
import convert as cv  # noqa: E402

RENAME = {"fn_modifiyDate": "selectModifiyDate"}

ATTR_REALS_BODY = '''    attrRealsList.forEach(function (a) {
        const comp = $c.util.getComponent(a.childId);
        if (!comp) { return; }
        const v = a.fn();
        if (a.attr === "style") {
            String(v).split(";").forEach(function (decl) {
                const kv = decl.split(":");
                if (kv.length === 2 && kv[0].trim()) { comp.setStyle(kv[0].trim(), kv[1].trim()); }
            });
        } else if (a.attr === "label" || a.attr === "__value") {
            if (typeof comp.setValue === "function") { comp.setValue(v); } else if (comp.render) { comp.render.textContent = v; }
        } else if (a.attr === "__items") {
            if (typeof comp.addItem === "function" && v && v.length) {
                if (typeof comp.removeAll === "function") { comp.removeAll(); }
                v.forEach(function (it) { comp.addItem(String(it[0] || ""), String(it[1] || "")); });
            }
        } else if (a.attr === "class") {
            if (comp.render) { comp.render.className = v; }
        } else if (a.attr === "__html") {
            if (comp.render) { comp.render.innerHTML = v; }
        } else if (comp.render) {
            comp.render.setAttribute(a.attr, v);
        }
    });
'''
CONDS_BODY = '''    binds.forEach(function (b) {
        const comp = $c.util.getComponent(b.id);
        if (!comp) { return; }
        const ok = !!b.fn();
        if (ok) { comp.show(); } else { comp.hide(); }
        if (ok && b.grids) {
            b.grids.forEach(function (gid) {
                const gc = $c.util.getComponent(gid);
                if (gc && gc.refreshGridView) { gc.refreshGridView(); }
            });
        }
    });
'''


# ---------------------------------------------------------------- helpers
def _balanced(text, open_pos):
    """text[open_pos] 가 '(' 일 때 짝 ')' 위치(없으면 -1). 문자열 리터럴은 건너뛴다."""
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


def _replace_wrapper(script, prefix_re, make, log, key_group=None):
    """prefix_re 가 끝나는 자리의 '(' 부터 균형 괄호로 인자 X 를 잡아 make(X, m) 로 치환."""
    out, pos = [], 0
    for m in re.finditer(prefix_re, script):
        if m.start() < pos:
            continue
        op = m.end() - 1
        if script[op] != "(":
            continue
        cl = _balanced(script, op)
        if cl < 0:
            continue
        out.append(script[pos:m.start()])
        x = script[op + 1:cl]
        out.append(make(x, m))
        if key_group:
            log.append(m.group(key_group))
        pos = cl + 1
    out.append(script[pos:])
    return "".join(out)


def _func_body(script, name):
    for n, s, b, e, is_async in st.func_spans(script):
        if n == name:
            return s, b, e, is_async
    return None


# ---------------------------------------------------------------- V1 / V2 head
def strip_commons_scripts(head):
    return re.subn(r'[ \t]*<script src="/_commons/[^"]*"[^>]*>\s*</script>\s*\n', '', head)


def fill_screen_name(head, body):
    sid = re.search(r'meta_screenId="([^"]*)"', head)
    sn = re.search(r'meta_screenName="([^"]*)"', head)
    if not sid or not sn or sn.group(1) != sid.group(1):
        return head, None
    t = re.search(r'class="pgt_tit"[^>]*\slabel="([^"]+)"', body) or re.search(r'\slabel="([^"]+)"[^>]*class="pgt_tit"', body)
    if not t or not t.group(1).strip():
        return head, None
    title = t.group(1).strip()
    return head.replace(sn.group(0), 'meta_screenName="%s"' % title, 1), title


# ---------------------------------------------------------------- V3 / V4 loops
def _rewrite_loop(script, fname, data_var, new_body):
    fb = _func_body(script, fname)
    if not fb:
        return script, False
    s, b, e, is_async = fb
    body = script[b + 1:e]
    m = re.search(r'^[ \t]*const %s = \[' % data_var, body, re.M)
    if not m or "applied" not in body:
        return script, False
    # 데이터 목록은 `[` … 짝 `]` `;` 까지(여러 줄일 수 있다) — 문자열 안 괄호는 건너뛴다
    mask = cv.code_mask(body)
    d, j = 0, m.end() - 1
    while j < len(body):
        if mask[j]:
            if body[j] == "[":
                d += 1
            elif body[j] == "]":
                d -= 1
                if d == 0:
                    break
        j += 1
    if j >= len(body):
        return script, False
    k = body.find(";", j)
    data_line = body[m.start():k + 1].rstrip() if k >= 0 else body[m.start():j + 1].rstrip() + ";"
    new = "\n" + data_line + "\n" + new_body
    script = script[:b + 1] + new + script[e:]
    # 동기 함수화 + 호출부 await 제거 (새 몸통에 await 없음)
    script = script[:s] + script[s:].replace("= async function", "= function", 1)
    script = st.sub_code(script, r'await\s+(scwin\.%s\s*\()' % fname, r'\1')
    return script, True


def simplify_attr_reals(script):
    return _rewrite_loop(script, "init_attrReals", "attrRealsList", ATTR_REALS_BODY)


def simplify_conds(script):
    return _rewrite_loop(script, "init_conds", "binds", CONDS_BODY)


# ---------------------------------------------------------------- V5 wrappers
CV_PLAIN = r'\(\(cv\) => \(cv !== undefined && cv !== null && cv !== ""\) \? cv : ""\)\('
CV_WARN = (r'\(\(cv\) => \(cv !== undefined && cv !== null && cv !== ""\) \? cv : \(console\.warn\("\[sdd\] 컨텍스트 키 미충전 — " \+ "'
           r'(?P<key>[^"]*)" \+ " \(as-is EL 부재 = 빈값이라 진행합니다\)"\), ""\)\)\(')
SV_THROW = (r'\(\(sv\) => \(sv !== undefined && sv !== null\) \? sv : \(\(\) => \{ throw \{ bizMessage: "세션 값을 읽지 못했습니다 — " \+ "'
            r'(?P<key>[^"]*)", unresolved: "session:" \+ "[^"]*" \}; \}\)\(\)\)\(')


def unwrap_values(script):
    """returns (script, {"context": [keys], "session": [keys]})."""
    ctx, ses = [], []
    script = _replace_wrapper(script, CV_PLAIN, lambda x, m: "(%s ?? \"\")" % x, [])
    script = _replace_wrapper(script, CV_WARN, lambda x, m: "(%s ?? \"\")" % x, ctx, "key")
    script = _replace_wrapper(script, SV_THROW, lambda x, m: x, ses, "key")
    for _ in range(5):
        new = re.sub(r'String\(String\(([^()]*(?:\([^()]*\)[^()]*)*)\)\)', r'String(\1)', script)
        if new == script:
            break
        script = new
    todo = []
    if ctx:
        todo.append("// TODO Stage2: 컨텍스트 키 출처 미확인(as-is EL · 회신 A-3) — " + ", ".join(dict.fromkeys(ctx)))
    if ses:
        todo.append("// TODO Stage2: 세션 키 실환경 확인(회신 11항) — " + ", ".join(dict.fromkeys(ses)))
    if todo:
        # 컨텍스트/세션 값을 읽는 함수(init_conds·init_attrReals)가 있으면 그 정의 바로 위, 없으면 2구역 헤더 뒤
        anchor = re.search(r'(?m)^(?:/\*\*(?:(?!\*/).)*\*/\n)?scwin\.init_(?:conds|attrReals) = ', script, re.S)
        ins = "\n".join(todo) + "\n"
        if anchor:
            script = script[:anchor.start()] + ins + script[anchor.start():]
        else:
            m2 = re.search(r'(?m)^///////// 2\. [^\n]*\n', script)
            script = (script[:m2.end()] + "\n" + ins + script[m2.end():]) if m2 else ins + script
    return script, {"context": ctx, "session": ses}


# ---------------------------------------------------------------- V6 tx boilerplate
TX_RE = re.compile(
    r'[ \t]*let res = null;\n[ \t]*try \{ res = await \$c\.sbm\.executeDynamic\(sbmOptions\); \}\n'
    r'[ \t]*catch \(_e\) \{ await \$c\.exception\.handleError\(_e, \{ context: "[^"]*" \}\); return null; \}\n'
    r'([ \t]*)if \(!\(res && res\.responseJSON && res\.responseJSON\.success === true\)\) \{\n'
    r'(?P<alert>(?:[ \t]*(?!\}|return res;)[^\n]*\n)*?)[ \t]*return res;\n[ \t]*\}\n\s*return res;\n')


def simplify_tx(script):
    def rep(m):
        ind = m.group(1)
        alert = m.group("alert")
        return (ind + "const res = await $c.sbm.executeDynamic(sbmOptions);\n"
                + ind + "if (res && res.skipped) { return res; }  // 중복 제출 skip\n"
                + ind + "if (!(res && res.responseJSON && res.responseJSON.success === true)) {\n"
                + alert + ind + "}\n" + ind + "return res;\n")
    return TX_RE.subn(rep, script)


# ---------------------------------------------------------------- V7 handlers / markers
def clean_handler_heads(script):
    n = 0
    for name, s, b, e, _ in reversed(st.func_spans(script)):
        body = script[b + 1:e]
        orig = body
        for var, pat in (("selfVar", r'^[ \t]*const selfVar = \(ev && \(ev\.element \|\| ev\.target \|\| ev\.srcElement\)\) \|\| this;\n'),
                         ("event", r'^[ \t]*const event = ev;\n'),
                         ("ev", r'^[ \t]*const ev = e;\n')):
            m = re.search(pat, body, re.M)
            if m and not re.search(r'\b%s\b' % var, st.code_only(body[:m.start()] + body[m.end():])):
                body = body[:m.start()] + body[m.end():]
        if body != orig:
            script = script[:b + 1] + body + script[e:]
            n += 1
    # 마커가 코드와 한 줄에 붙은 꼴(`*/scwin.result = …`)은 들여쓰기를 남기고, 홀로 선 줄은 통째로 지운다
    script, k1 = re.subn(r'^([ \t]*)/\* sdd-asis-lifecycle:(?:begin[^*]*|end) \*/[ \t]*(?=\S)', r'\1', script, flags=re.M)
    script, k2 = re.subn(r'^[ \t]*/\* sdd-asis-lifecycle:(?:begin[^*]*|end) \*/[ \t]*\n', '', script, flags=re.M)
    script, k3 = re.subn(r'[ \t]*/\* sdd-asis-lifecycle:(?:begin[^*]*|end) \*/', '', script)
    return script, n + k1 + k2 + k3


# ---------------------------------------------------------------- V14 / V15
def fold_comment_into_jsdoc(script):
    """JSDoc(`/**`) 바로 위의 `//` 설명 줄을 JSDoc 안 `@description` 으로 옮긴다(@description 이 없을 때만).
    convert 규칙 4 가 함수를 재배치할 때 `//` 줄은 함께 가지 않아 고아가 되므로 재정렬 전에 접는다."""
    n = 0

    def rep(m):
        nonlocal n
        lines, jsdoc = m.group(1), m.group(2)
        if "@description" in jsdoc:
            return m.group(0)
        txt = " ".join(re.sub(r'^[ \t]*//[ \t]?', '', l).strip() for l in lines.strip("\n").split("\n"))
        if not txt or st.looks_like_code(txt) or "TODO" in txt or len(txt) > 200:
            return m.group(0)
        n += 1
        return re.sub(r'(\n[ \t]*\* @name[^\n]*\n)', r'\1 * @description %s\n' % txt.replace("\\", "\\\\"), jsdoc, 1)
    script = re.sub(r'((?:^[ \t]*//(?!/)[^\n]*\n)+)(^/\*\*\n(?:(?!\*/).)*?\*/\n)', rep, script, flags=re.M | re.S)
    return script, n


def dedupe_var_in_function(script):
    """같은 함수 안에서 같은 이름을 `var` 로 두 번 이상 선언한 꼴(as-is 관용) → 둘째부터는 선언 없이 대입.
    규칙 8 이 `let` 으로 바꾸면 `Identifier has already been declared` 구문 오류가 되므로 convert 보다 먼저 접는다.
    (블록 스코프가 달라지는 꼴 — `for (var i…)` 둘 — 은 `let` 로 가도 합법이라 그대로 둔다.)"""
    n = 0
    for name, s, b, e, _ in reversed(st.func_spans(script)):
        body = script[b + 1:e]
        mask = cv.code_mask(body)
        seen = set()
        out, pos = [], 0
        for m in re.finditer(r'(?<![\w$.])var\s+([A-Za-z_$][\w$]*)(\s*=)', body):
            if not mask[m.start()]:
                continue
            # for(…) 머리의 var 는 제외
            line_start = body.rfind("\n", 0, m.start()) + 1
            if re.match(r'\s*for\s*\(', body[line_start:m.start() + 1]):
                continue
            nm = m.group(1)
            if nm in seen:
                out.append(body[pos:m.start()]); out.append(nm + m.group(2)); pos = m.end(); n += 1
            else:
                seen.add(nm)
        if pos:
            out.append(body[pos:])
            script = script[:b + 1] + "".join(out) + script[e:]
    return script, n


def literal_constructors(script):
    """`new Array()`→`[]` · `new Object()`→`{}` · `new Array(a, b, …)`(인자 2개 이상 또는 문자열 인자) → `[a, b, …]`.
    `new Array(n)`(숫자 하나 = 길이 지정)은 뜻이 다르므로 두고, 문자열·주석 안은 건드리지 않는다."""
    n = 0
    out, pos = [], 0
    mask = cv.code_mask(script)
    for m in re.finditer(r'\bnew (Array|Object)\(', script):
        if m.start() < pos or not mask[m.start()]:
            continue
        cl = _balanced(script, m.end() - 1)
        if cl < 0:
            continue
        args = script[m.end():cl].strip()
        if m.group(1) == "Object":
            rep = "{}" if not args else None
        elif not args:
            rep = "[]"
        elif "," in args or args[:1] in "\"'`":
            rep = "[" + args + "]"
        else:
            rep = None
        if rep is None:
            continue
        out.append(script[pos:m.start()]); out.append(rep); pos = cl + 1; n += 1
    out.append(script[pos:])
    return "".join(out), n


def fieldel_todo(script):
    """`$c.util.fieldEl(id, name)`(공급사 확장 — DOM 요소 반환) 호출이 있는 함수 머리에 TODO 1줄. 호출은 남긴다(2차 컴포넌트 계약 전환)."""
    n = 0
    for name, s, b, e, _ in reversed(st.func_spans(script)):
        body = script[b + 1:e]
        if "$c.util.fieldEl(" not in st.code_only(body) or "TODO Stage2(규칙19): fieldEl" in body:
            continue
        nl = script.find("\n", b) + 1
        ind = re.match(r'[ \t]*', script[nl:]).group(0) or "    "
        script = script[:nl] + ind + "// TODO Stage2(규칙19): fieldEl(DOM 요소 계약) → 컴포넌트 getValue/setValue 계약으로 전환 필요\n" + script[nl:]
        n += 1
    return script, n


def unwrap_tx_then_move(script):
    """`{ const nr = await scwin.tx_x(); if (nr && … success === true) { … } };` 한 줄 블록 → 여러 줄 문장.
    같은 함수 안에 이 블록이 둘 이상이면 `nr` 재선언이 되므로 그대로 둔다."""
    n = 0
    for name, s, b, e, _ in reversed(st.func_spans(script)):
        body = script[b + 1:e]
        pat = re.compile(r'^([ \t]*)\{ const nr = (await scwin\.tx_[\w$]+\(\)); if \((nr && nr\.responseJSON && nr\.responseJSON\.success === true)\) \{ (.*?) \} \};[ \t]*$', re.M)
        hits = list(pat.finditer(body))
        if len(hits) != 1:
            continue
        m = hits[0]
        ind = m.group(1)
        new = ("%sconst nr = %s;\n%sif (%s) {\n%s    %s\n%s}" % (ind, m.group(2), ind, m.group(3), ind, m.group(4).strip(), ind))
        body = body[:m.start()] + new + body[m.end():]
        script = script[:b + 1] + body + script[e:]
        n += 1
    return script, n


# ---------------------------------------------------------------- V8 / V9 / V10 / V11
TYPEOF_RE = re.compile(r"if \(typeof scwin\.(\w+) === 'function'\) \{ (.*?) \} else \{ console\.error\('\[sdd\] ([^']*)'\); (await \$c\.win\.alert\('[^']*'\);) \}")


def fold_typeof_guards(script):
    defined = set(st.defined_functions(script))

    def rep(m):
        fn, call, msg, alert = m.groups()
        if fn in defined:
            return call
        return "/* TODO Stage2: %s */ %s" % (msg, alert)
    return TYPEOF_RE.subn(rep, script)


def sdd_console_to_todo(script):
    n = 0
    out, pos = [], 0
    mask = cv.code_mask(script)
    for m in re.finditer(r'console\.(?:warn|error)\(', script):
        if m.start() < pos or not mask[m.start()]:
            continue
        cl = _balanced(script, m.end() - 1)
        if cl < 0 or script[cl + 1:cl + 2] != ";":
            continue
        arg = script[m.end():cl]
        if not re.match(r'''\s*['"]\[sdd\]''', arg):
            continue
        text = re.sub(r'''['"]\s*\+\s*|\s*\+\s*['"]''', ' ', arg).strip().strip("'\"").replace("*/", "* /")
        out.append(script[pos:m.start()])
        out.append("/* TODO Stage2: %s */" % text)
        pos = cl + 2
        n += 1
    out.append(script[pos:])
    return "".join(out), n


def bizmessage_todo(script):
    lines = script.split("\n")
    out, n = [], 0
    for i, l in enumerate(lines):
        if "throw { bizMessage" in l and not (i > 0 and "TODO Stage2" in lines[i - 1]) and "TODO Stage2" not in l:
            ind = re.match(r'[ \t]*', l).group(0)
            bm = re.search(r'bizMessage: ("[^"]*")', l)
            out.append(ind + "// TODO Stage2: 전환 미완(공급사 드러냄 — 사유 알림 유지) " + (bm.group(1) if bm else ""))
            n += 1
        out.append(l)
    return "\n".join(out), n


def jquery_form_action(script):
    return re.subn(r'''(\$\("form\[name=['"][^'"]*['"]\]"\)\.attr\("action", "[^"]*"\));''',
                   r'/* TODO Stage2(규칙19): 폼 action 지정은 tx 로 대체되어 사문 — \1 */', script)


# ---------------------------------------------------------------- V12 flow globals
def flow_globals(script):
    m = re.search(r'(?m)^// as-is 흐름 보존[^\n]*\n((?:scwin\.[\w$]+ = undefined;[ \t]*)+)\n', script)
    if not m:
        return script, []
    names = re.findall(r'scwin\.([\w$]+) = undefined;', m.group(1))
    rest = script[:m.start()] + script[m.end():]
    keep = [n for n in names if not re.search(r'(?m)^scwin\.%s\s*=' % re.escape(n), rest)]
    repl = "".join("scwin.%s = null;\n" % n for n in keep)
    return script[:m.start()] + repl + script[m.end():], names


LITERAL_RHS = re.compile(r'^(?:"[^"\n]*"|\'[^\'\n]*\'|-?\d+(?:\.\d+)?|true|false|null|undefined|\[[^\n]*\]|\{[^\n]*\})\s*;?\s*$')


def hoist_call_globals(script):
    """최상위 `scwin.X = <호출식>;`(리터럴이 아닌 전역 초기화 — `$c.util.getComponent('ex')` 등) → 1구역에 `scwin.X = null;` 선언,
    대입문은 onpageload 의 try 첫 줄로. 스크립트 로드 시점의 컴포넌트 조회는 렌더 전이라 틀린 자리이고, 규칙 2 는 리터럴만 옮기므로
    규칙 4 재정렬이 보류되던 원인이다(2026-09-22 fil 10화면 선례와 같은 처방)."""
    mask = cv.code_mask(script)
    depth = 0
    moves = []
    for m in re.finditer(r'(?m)^(scwin\.([\w$]+)\s*=\s*)([^\n]*)$', script):
        if not mask[m.start()]:
            continue
        depth = sum(1 for i in range(m.start()) if mask[i] and script[i] == "{") - sum(1 for i in range(m.start()) if mask[i] and script[i] == "}")
        if depth != 0:
            continue
        rhs = m.group(3)
        if re.match(r'\s*(?:async\s+)?function\b', rhs) or LITERAL_RHS.match(rhs) or not rhs.rstrip().endswith(";"):
            continue
        moves.append((m.start(), m.end(), m.group(2), m.group(0).strip()))
    if not moves:
        return script, []
    mo = re.search(r'(?m)^scwin\.onpageload\s*=\s*(?:async\s+)?function\s*\([^)]*\)\s*\{\s*\n([ \t]*)try\s*\{\s*\n', script)
    if not mo:
        return script, []
    names = []
    for s, e, nm, stmt in reversed(moves):
        script = script[:s] + "scwin.%s = null;" % nm + script[e:]
        names.append((nm, stmt))
    mo = re.search(r'(?m)^scwin\.onpageload\s*=\s*(?:async\s+)?function\s*\([^)]*\)\s*\{\s*\n([ \t]*)try\s*\{\s*\n', script)
    ind = mo.group(1) + "    "
    ins = "".join(ind + stmt + "\n" for nm, stmt in reversed(names))
    script = script[:mo.end()] + ins + script[mo.end():]
    return script, [nm for nm, _ in reversed(names)]


# ---------------------------------------------------------------- V13 fn_ collisions
def _camel(fn):
    base = fn[3:] if fn.startswith("fn_") else fn
    return base[0].lower() + base[1:] if base else base


def rename_fn_collisions(script, head, body):
    renamed = {}
    for fn in sorted(set(re.findall(r'^scwin\.(fn_[\w$]+)\s*=', script, re.M))):
        cam = _camel(fn)
        if re.search(r'(?m)^scwin\.%s\s*=' % re.escape(cam), script):
            renamed[fn] = RENAME.get(fn, "exec" + cam[0].upper() + cam[1:])
    for old, new in renamed.items():
        pat = r'scwin\.%s\b' % re.escape(old)
        script = re.sub(pat, "scwin." + new, script)
        head = re.sub(pat, "scwin." + new, head)
        body = re.sub(pat, "scwin." + new, body)
    return script, head, body, renamed


# ---------------------------------------------------------------- driver
def apply_regions(head, script, body):
    log = {}
    head, log["V1_commons"] = strip_commons_scripts(head)
    head, log["V2_title"] = fill_screen_name(head, body)
    script, head, body, log["V13_renamed"] = rename_fn_collisions(script, head, body)
    script, log["V14_fold_comment"] = fold_comment_into_jsdoc(script)  # TODO 주석 삽입(V5)보다 먼저
    script, log["V3_attrReals"] = simplify_attr_reals(script)
    script, log["V4_conds"] = simplify_conds(script)
    script, keys = unwrap_values(script)
    log["V5_ctx_keys"], log["V5_session_keys"] = len(keys["context"]), len(keys["session"])
    script, log["V6_tx"] = simplify_tx(script)
    script, log["V7_handlers"] = clean_handler_heads(script)
    script, log["V15_unwrap_nr"] = unwrap_tx_then_move(script)
    script, log["V16_dup_var"] = dedupe_var_in_function(script)
    script, log["V17_literals"] = literal_constructors(script)
    script, log["V18_fieldEl_todo"] = fieldel_todo(script)
    # V19 공급사 gcc 스냅샷(08-04)에만 있던 인쇄 함수 → 현재 gcc 의 $c.win.print(메인·팝업 통합, 2026-09-30)
    script, log["V19_print"] = st.sub_code(script, r'\$c\.win\.(?:popupPrint|mainPrint)\(', '$c.win.print('), len(re.findall(r'\$c\.win\.(?:popupPrint|mainPrint)\(', script))
    script, log["V8_typeof"] = fold_typeof_guards(script)
    script, log["V9_sdd"] = sdd_console_to_todo(script)
    script, log["V10_biz"] = bizmessage_todo(script)
    script, log["V11_jq_action"] = jquery_form_action(script)
    script, log["V12_flow"] = flow_globals(script)
    script, log["V20_hoisted"] = hoist_call_globals(script)
    return head, script, body, log


def apply(path, dry=False):
    raw, eol, reg = st.read_xml(path)
    if reg is None:
        return {"fatal": "script 영역 없음"}
    head, script, body, log = apply_regions(reg["head"], reg["script"], reg["body"])
    new = st.join_regions(reg, script=script, head=head, body=body)
    log["changed"] = new != raw
    if not dry and log["changed"]:
        st.write_xml(path, head, reg["script_open"], script, reg["script_close"], body, eol)
    return log


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    files, fl, _ = st.parse_cli(argv if argv is not None else sys.argv[1:], flags=("--dry",), opts=())
    if not files:
        print(__doc__); return 2
    for f in files:
        print("%-22s %s" % (Path(f).stem, apply(f, dry=fl["--dry"])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
