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
  V16 같은 스코프 재선언 접기(`var` 중복·매개변수 동명 `var`·최상위 `const/let` 중복) — 규칙 8 의 let/const 화 구문 오류 예방
  V17 `new Array()/new Array(0)`→`[]` · `new Object()`→`{}` · `new Array(a, b)`→`[a, b]`
  V18 `$c.util.fieldEl` 호출 함수 머리 TODO · V19 `popupPrint/mainPrint`→`$c.win.print` · V20 최상위 호출식 전역 → 1구역 선언 + onpageload 선두
  V21 `$c.cm.fn_NullChk/IsNumber`→화면 로컬 헬퍼(checkRequired/isNumberInput) · `fn_IsNotNull`→`!isEmpty` · `fn_CheckEmail`→`$c.str.isEmail` · 나머지 TODO
  V22 같은 이름 함수 이중 정의 — 본문 동일이면 둘째 삭제, 다르면 `X_2` 개명 + TODO
  V23 공급사 pcc 의존 — alert_error→win.alert · get/setObjectValue→getValue/setValue · fn_setFromToDate→setFromToDate · 나머지 TODO
  V24 `$c.lc.fn_isProcess(X)`(확인창) → 화면 로컬 `scwin.confirmJob(X)`(`$c.win.confirm`, as-is 문구 보존, `scwin.lastJob` 기록) — Stage 2 수작업 1축
  V25 `$c.lc.fn_alertMsg(X)`(결과 알림 MSG-A001/0001/A002) → 화면 로컬 `scwin.alertJobResult(X)` · as-is 전역 `LastJob` → `scwin.lastJob` — 2축
  V26 `$c.fil.SCREN_PROCS_TP_CD_01~08`·`TR_JOB_*`·`$c.lc.NO_EXCEL_DATA` 등 메시지 상수(공급사 pcc 리터럴 상수) → `scwin.<상수>` + 1구역 선언(값·이름 보존) — 3축
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
        let v;
        try { v = a.fn(); } catch (e) { $c.exception.handleError(e, { notify: "none", context: "attrReal:" + a.childId }); return; }
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
        let ok;
        // 조건식이 미해결 값(unresolved throw)을 읽는 자리는 그 바인드만 건너뛴다 — 공급사 산출의 바인드별 격리 유지
        try { ok = !!b.fn(); } catch (e) { $c.exception.handleError(e, { notify: "none", context: "conds:" + b.id }); return; }
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
    r'(?P<alert>(?:[ \t]*(?!\}|return res;)[^\n]*\n)*?)[ \t]*return res;\n[ \t]*\}\n(?P<tail>\s*return res;\n)?')


def simplify_tx(script):
    """실패 알림 블록 뒤에 후처리(페이징 setCount 등)가 이어지는 변형 꼴도 같은 규칙으로 — 그때는 if 안의 `return res;` 를 남긴다."""
    def rep(m):
        ind = m.group(1)
        alert = m.group("alert")
        head = (ind + "const res = await $c.sbm.executeDynamic(sbmOptions);\n"
                + ind + "if (res && res.skipped) { return res; }  // 중복 제출 skip\n"
                + ind + "if (!(res && res.responseJSON && res.responseJSON.success === true)) {\n" + alert)
        if m.group("tail"):
            return head + ind + "}\n" + ind + "return res;\n"
        return head + ind + "    return res;\n" + ind + "}\n"
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
    """같은 스코프 재선언(as-is 관용)을 규칙 8 전에 접는다 — 그대로 두면 `let/const` 로 바뀌며 구문 오류가 된다.
    · `var X` 가 같은 함수에 두 번 이상, 또는 X 가 매개변수 이름 → 둘째부터(매개변수면 첫째부터) 선언 없이 대입.
      초기값이 없는 중복 `var X;` 는 문장을 지운다.
    · 함수 최상위(블록 깊이 0)의 `const/let X` 중복 → 둘째부터 대입(초기값 없으면 삭제).
    · `for (var i…)` 머리와 `var a, b` 다중 선언은 건드리지 않는다(전자는 블록 스코프로 합법, 후자는 단순 치환 불가)."""
    n = 0
    for name, s, b, e, _ in reversed(st.func_spans(script)):
        sig = re.match(r'^scwin\.[\w$]+\s*=\s*(?:async\s+)?function\s*\(([^)]*)\)', script[s:], re.S)
        params = set(p.strip().split("=")[0].strip() for p in sig.group(1).split(",") if p.strip()) if sig else set()
        body = script[b + 1:e]
        mask = cv.code_mask(body)
        seen_var, seen_top = set(params), set()
        edits = []  # (start, end, replacement)
        depth = 0
        pos_scan = 0
        for m in re.finditer(r'(?<![\w$.])(var|let|const)\s+([A-Za-z_$][\w$]*)([ \t]*=|[ \t]*;)', body):
            if not mask[m.start()]:
                continue
            # 선언 위치의 블록 깊이
            for i in range(pos_scan, m.start()):
                if mask[i]:
                    if body[i] == "{": depth += 1
                    elif body[i] == "}": depth -= 1
            pos_scan = m.start()
            line_start = body.rfind("\n", 0, m.start()) + 1
            if re.match(r'\s*for\s*\(', body[line_start:m.start() + 1]):
                continue
            kw, nm, tail = m.groups()
            dup = False
            if kw == "var":
                dup = nm in seen_var; seen_var.add(nm)
            elif depth == 0:
                dup = nm in seen_top or nm in params; seen_top.add(nm)
            if not dup:
                continue
            if tail.strip() == "=":
                edits.append((m.start(), m.end(), nm + tail))
            else:
                # `var X;` 한 줄 전체 삭제(줄에 그것만 있을 때), 아니면 선언만 빈 문장으로
                line_end = body.find("\n", m.end())
                line_end = len(body) if line_end < 0 else line_end + 1
                if body[line_start:line_end].strip() == body[m.start():m.end()].strip():
                    edits.append((line_start, line_end, ""))
                else:
                    edits.append((m.start(), m.end(), ""))
            n += 1
        if edits:
            for a, z, rep in reversed(edits):
                body = body[:a] + rep + body[z:]
            script = script[:b + 1] + body + script[e:]
    return script, n


def dedupe_function_defs(script):
    """같은 이름의 최상위 함수가 두 번 정의된 꼴(공급사가 같은 id 의 표 둘에 핸들러를 각각 냄 — JS 는 마지막이 이긴다).
    본문이 같으면 둘째를 지우고, 다르면 둘째를 `X_2` 로 개명하고 TODO 를 단다(어느 본문이 맞는지는 판단)."""
    spans = st.func_spans(script)
    by = {}
    for sp in spans:
        by.setdefault(sp[0], []).append(sp)
    cuts, renames = [], []
    for nm, lst in by.items():
        if len(lst) < 2:
            continue
        first = re.sub(r'\s+', ' ', script[lst[0][2]:lst[0][3] + 1])
        for k, sp in enumerate(lst[1:], start=2):
            if re.sub(r'\s+', ' ', script[sp[2]:sp[3] + 1]) == first:
                cuts.append(sp)
            else:
                renames.append((sp, "%s_%d" % (nm, k)))
    log = {"removed": [], "renamed": []}
    # 삭제·개명을 한 목록으로 모아 뒤에서부터 적용(앞의 편집이 뒤 오프셋을 흔들지 않도록)
    edits = [("cut", sp, None) for sp in cuts] + [("ren", sp, new) for sp, new in renames]
    for kind, sp, new in sorted(edits, key=lambda x: -x[1][1]):
        nm, s, b, e, _ = sp
        if kind == "cut":
            pc = re.search(r'/\*\*(?:(?!\*/).)*\*/\s*$', script[:s], re.S)
            start = pc.start() if pc else s
            end = e + 1
            if script[end:end + 1] == ";":
                end += 1
            script = script[:start].rstrip("\n") + "\n\n" + script[end:].lstrip("\n")
            log["removed"].append(nm)
        else:
            head = script[s:b].replace("scwin.%s" % nm, "scwin.%s" % new, 1)
            todo = "// TODO Stage2: 공급사 산출의 중복 정의(둘째 본문 — 첫째와 다름, 어느 쪽이 맞는지 판단) — 원이름 %s\n" % nm
            script = script[:s] + todo + head + script[b:]
            log["renamed"].append(new)
    log["removed"].reverse(); log["renamed"].reverse()
    return script, log


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
        elif not args or args == "0":
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
    # 파라미터 수신(init_recvParam) 뒤에 둔다 — 컨텍스트 값을 읽는 전역(loadTp 등)이 수신 전에 평가되면 빈값이 된다(리뷰 2026-10-02)
    rp = re.compile(r'[ \t]*(?:await\s+)?scwin\.init_recvParam\(\);[^\n]*\n').search(script, mo.end())
    at = rp.end() if rp and rp.start() < st.match_brace(script, cv.code_mask(script), mo.end() - 1 if script[mo.end() - 1] == "{" else script.rfind("{", 0, mo.end())) else mo.end()
    script = script[:at] + ins + script[at:]
    return script, [nm for nm, _ in reversed(names)]


# ---------------------------------------------------------------- V21 $c.cm.fn_* (B 그룹 잔존 — pcc/fil 에 정의 없음)
CM_HELPERS = {
    "checkRequired": '''/**
 * @method
 * @name checkRequired
 * @description 필수 입력 검사 — 값이 비면 항목명으로 알리고 포커스를 준 뒤 true(as-is fn_NullChk 의미 보존 · pcc/fil 반입 후보)
 * @param {Object} comp 입력 컴포넌트
 * @returns {Promise<Boolean>} 비어 있으면 true
 * @hidden N
 */
scwin.checkRequired = async function (comp) {
    if (!comp || !$c.util.isEmpty($c.str.trim(String(comp.getValue() ?? "")))) { return false; }
    const name = (typeof comp.getTitle === "function" && comp.getTitle()) || comp.getID();
    await $c.win.alert("'" + name + "' 항목을 입력하세요");
    comp.focus();
    return true;
};
''',
    "isNumberInput": '''/**
 * @method
 * @name isNumberInput
 * @description 숫자만 입력됐는지 검사 — 아니면 포커스를 주고 false(as-is fn_IsNumber 의미 보존 · pcc/fil 반입 후보)
 * @param {Object} comp 입력 컴포넌트
 * @returns {Boolean} 숫자(공백 제외)만이면 true
 * @hidden N
 */
scwin.isNumberInput = function (comp) {
    const v = String(comp.getValue() ?? "").replace(/\\s/g, "");
    if (!/^\\d*$/.test(v)) { comp.focus(); return false; }
    return true;
};
''',
}


def replace_cm_helpers(script):
    """`$c.cm.fn_NullChk(X)`→`scwin.checkRequired(X)`(await 는 컨벤션 단계가 전파) · `fn_IsNumber(X)`→`scwin.isNumberInput(X)` ·
    `fn_IsNotNull(X)`→`!$c.util.isEmpty(X.getValue())` · `fn_CheckEmail(S)`→`$c.str.isEmail(S)`. 쓰인 헬퍼는 5구역 끝에 정의를 넣는다.
    그 밖의 `$c.cm.fn_*` 는 그대로 두고(정의 없음 — 닿으면 오류로 드러남) 함수 머리에 TODO 1줄."""
    log = {}
    n, script = 0, script
    out, pos = [], 0
    mask = cv.code_mask(script)
    used = set()
    for m in re.finditer(r'\$c\.cm\.fn_(NullChk|IsNumber|IsNotNull|CheckEmail)\(', script):
        if m.start() < pos or not mask[m.start()]:
            continue
        cl = _balanced(script, m.end() - 1)
        if cl < 0:
            continue
        arg = script[m.end():cl]
        kind = m.group(1)
        if kind == "NullChk":
            rep = "scwin.checkRequired(%s)" % arg; used.add("checkRequired")
        elif kind == "IsNumber":
            rep = "scwin.isNumberInput(%s)" % arg; used.add("isNumberInput")
        elif kind == "IsNotNull":
            rep = "!$c.util.isEmpty((%s).getValue())" % arg
        else:
            rep = "$c.str.isEmail(%s)" % arg
        out.append(script[pos:m.start()]); out.append(rep); pos = cl + 1; n += 1
        log[kind] = log.get(kind, 0) + 1
    out.append(script[pos:])
    script = "".join(out)
    for h in sorted(used):
        if not re.search(r'(?m)^scwin\.%s\s*=' % h, script):
            m5 = re.search(r'(?m)^///////// 5\. [^\n]*\n', script)
            if m5:
                script = script.rstrip("\n") + "\n\n" + CM_HELPERS[h]
            else:
                script = script.rstrip("\n") + "\n\n///////// 5. 일반/업무 함수 영역 /////////\n\n" + CM_HELPERS[h]
    # 남은 $c.cm.fn_* → 함수 머리 TODO
    left = 0
    for name, s, b, e, _ in reversed(st.func_spans(script)):
        body = script[b + 1:e]
        known_cm = set(st.common_inventory("fil")[0].get("cm", set()))
        names = sorted({x for x in re.findall(r'\$c\.cm\.(\w+)\(', st.code_only(body)) if x not in known_cm})
        if not names or "TODO Stage2: $c.cm.fn_" in body:
            continue
        nl = script.find("\n", b) + 1
        ind = re.match(r'[ \t]*', script[nl:]).group(0) or "    "
        script = script[:nl] + ind + "// TODO Stage2: $c.cm.fn_* 정의 없음(pcc/fil 미반입 · 치환 방향 미결) — " + ", ".join(names) + "\n" + script[nl:]
        left += len(names)
    log["todo_left"] = left
    return script, log


# ---------------------------------------------------------------- V24 $c.lc.fn_isProcess (Stage 2 수작업 1축 · 2026-10-02)
CONFIRM_JOB_HELPER = '''/**
 * @method
 * @name confirmJob
 * @description 업무 처리 확인 — "[저장] 하시겠습니까?" 확인창(as-is 공통 fn_isProcess 의 의미 보존 · pcc/fil 반입 후보)
 * @param {String} gubun 처리 구분(I 저장 · U 수정 · D 삭제 · S 제출 · R 해제 · DSCL 안내문작성)
 * @returns {Promise<Boolean>} 확인이면 true
 * @hidden N
 */
scwin.confirmJob = async function (gubun) {
    const job = { I: "저장", U: "수정", D: "삭제", S: "제출", R: "해제", DSCL: "안내문작성" }[gubun] || gubun;
    scwin.lastJob = job;  // 결과 알림(alertJobResult)이 같은 처리명을 쓴다 — as-is 전역 LastJob
    return $c.win.confirm("[" + job + "] 하시겠습니까?");
};
'''
ALERT_JOB_HELPER = '''/**
 * @method
 * @name alertJobResult
 * @description 업무 처리 결과 알림 — S "[처리명] 처리 성공하였습니다." · S1 "성공적으로 처리되었습니다." · F "[처리명] 처리 실패하였습니다."
 *  (as-is 공통 fn_alertMsg · 메시지 MSG-A001/MSG-0001/MSG-A002 · 처리명은 scwin.lastJob — confirmJob 이 채운다 · pcc/fil 반입 후보)
 * @param {String} gubun 결과 구분(S 성공 · S1 성공(처리명 없음) · F 실패)
 * @returns {Promise<void>}
 * @hidden N
 */
scwin.alertJobResult = async function (gubun) {
    const job = scwin.lastJob || "";
    if (gubun === "S") { await $c.win.alert("[" + job + "] 처리 성공하였습니다."); }
    else if (gubun === "S1") { await $c.win.alert("성공적으로 처리되었습니다."); }
    else if (gubun === "F") { await $c.win.alert("[" + job + "] 처리 실패하였습니다."); }
};
'''


def _append_helper(script, name, helper):
    if re.search(r'(?m)^scwin\.%s\s*=' % name, script):
        return script
    m5 = re.search(r'(?m)^///////// 5\. [^\n]*\n', script)
    return script.rstrip("\n") + ("\n\n" if m5 else "\n\n///////// 5. 일반/업무 함수 영역 /////////\n\n") + helper


def replace_alert_msg(script):
    """V25 `$c.lc.fn_alertMsg(X)`(공급사 pcc: alert(getMessageParam(MSG-A001|0001|A002, LastJob))) → `scwin.alertJobResult(X)`.
    as-is 전역 `LastJob` 참조(`LastJob = "승인";` 꼴)는 `scwin.lastJob` 로. await 부여는 컨벤션 단계."""
    n = 0
    out, pos = [], 0
    mask = cv.code_mask(script)
    for m in re.finditer(r'\$c\.lc\.fn_alertMsg\(', script):
        if m.start() < pos or not mask[m.start()]:
            continue
        cl = _balanced(script, m.end() - 1)
        if cl < 0:
            continue
        out.append(script[pos:m.start()]); out.append("scwin.alertJobResult(%s)" % script[m.end():cl]); pos = cl + 1; n += 1
    out.append(script[pos:])
    script = "".join(out)
    # 코드 영역에서만 LastJob → scwin.lastJob
    parts, k = [], 0
    for text, is_code in cv.segments(script):
        if is_code:
            text, c = re.subn(r'(?<![\w$.])(?:window\.)?LastJob\b', 'scwin.lastJob', text); k += c
        parts.append(text)
    script = "".join(parts)
    if n:
        script = _append_helper(script, "alertJobResult", ALERT_JOB_HELPER)
    if (n or k) and not re.search(r'(?m)^scwin\.lastJob\s*=', script):
        m1 = re.search(r'(?m)^///////// 1\. [^\n]*\n', script)
        decl = 'scwin.lastJob = "";  // 업무 처리명(confirmJob 이 채우고 alertJobResult 가 읽는다 — as-is 전역 LastJob)\n'
        script = (script[:m1.end()] + decl + script[m1.end():]) if m1 else decl + script
    return script, {"calls": n, "lastJob_refs": k}


def replace_is_process(script):
    """`$c.lc.fn_isProcess(X)`(공급사 pcc: window.confirm("[저장] 하시겠습니까?")) → `scwin.confirmJob(X)`.
    await 부여·호출 함수 async 화는 컨벤션 단계(propagate_await)가 한다 — `if (!scwin.confirmJob('S'))` 는 `if (!await …)` 가 된다."""
    n = 0
    out, pos = [], 0
    mask = cv.code_mask(script)
    for m in re.finditer(r'\$c\.lc\.fn_isProcess\(', script):
        if m.start() < pos or not mask[m.start()]:
            continue
        cl = _balanced(script, m.end() - 1)
        if cl < 0:
            continue
        out.append(script[pos:m.start()]); out.append("scwin.confirmJob(%s)" % script[m.end():cl]); pos = cl + 1; n += 1
    out.append(script[pos:])
    script = "".join(out)
    if n:
        script = _append_helper(script, "confirmJob", CONFIRM_JOB_HELPER)
        if not re.search(r'(?m)^scwin\.lastJob\s*=', script):
            m1 = re.search(r'(?m)^///////// 1\. [^\n]*\n', script)
            decl = 'scwin.lastJob = "";  // 업무 처리명(confirmJob 이 채우고 alertJobResult 가 읽는다 — as-is 전역 LastJob)\n'
            script = (script[:m1.end()] + decl + script[m1.end():]) if m1 else decl + script
    return script, n


# ---------------------------------------------------------------- V26 공급사 pcc 상수 → 화면 안 선언 (Stage 2 수작업 3축)
VENDOR_CONSTS = {
    # 화면처리구분코드(SCREN_PROCES_TP_CD — 접속 로그·URL 파라미터) : 공급사 tobe-pcc 번들 3966~3973행
    "SCREN_PROCS_TP_CD_01": ('"01"', "조회"), "SCREN_PROCS_TP_CD_02": ('"02"', "입력"), "SCREN_PROCS_TP_CD_03": ('"03"', "수정"),
    "SCREN_PROCS_TP_CD_04": ('"04"', "삭제"), "SCREN_PROCS_TP_CD_05": ('"05"', "인쇄"), "SCREN_PROCS_TP_CD_06": ('"06"', "화면출력"),
    "SCREN_PROCS_TP_CD_07": ('"07"', "엑셀저장"), "SCREN_PROCS_TP_CD_08": ('"08"', "PC저장"),
    # 트랜잭션 작업 구분(fn_trs 인자) : 번들 1906~1909행
    "TR_JOB_NORMAL": ("1", "일반"), "TR_JOB_INSERT": ("2", "입력"), "TR_JOB_UPDATE": ("3", "수정"), "TR_JOB_DELETE": ("4", "삭제"),
    # 메시지 상수($c.lc) : 번들 6730~6732행
    "NO_EXCEL_DATA": ('"해당데이터가 없습니다. 조회후 다운받으십시요."', "엑셀 다운로드 데이터 없음"),
    "NO_DATA_FOUND": ('"검색조건에 해당하는 자료가 없습니다."', "조회 결과 없음"),
    "MSG_CND_ISR_REQ": ('"검색조건 중 법인코드(명) 입력되지 않아 조회할 수 없습니다."', "법인코드 조건 필수"),
}


def inline_vendor_consts(script):
    """`$c.fil.<상수>`(공급사 pcc 번들의 리터럴 상수) → `scwin.<상수>` + 1구역 선언(공급사 README 부-2 ㉢ 「as-is 공용 상수는 화면 안에
    선언」과 같은 처방). 값·이름은 번들 정의 그대로(이름 보존 — 다른 화면·pcc 와 대조 가능). 이미 선언된 이름은 선언을 더하지 않는다."""
    used = set()
    parts = []
    for text, is_code in cv.segments(script):
        if is_code:
            def rep(m):
                used.add(m.group(1))
                return "scwin." + m.group(1)
            text = re.sub(r'\$c\.(?:fil|lc)\.(%s)\b' % "|".join(VENDOR_CONSTS), rep, text)
        parts.append(text)
    script = "".join(parts)
    if not used:
        return script, {}
    decls = []
    for name in sorted(used, key=lambda n: list(VENDOR_CONSTS).index(n)):
        if not re.search(r'(?m)^scwin\.%s\s*=' % name, script):
            val, ko = VENDOR_CONSTS[name]
            decls.append("scwin.%s = %s;  // %s — as-is 공용 상수(공급사 pcc 번들, 화면 안 선언)\n" % (name, val, ko))
    if decls:
        m1 = re.search(r'(?m)^///////// 1\. [^\n]*\n', script)
        ins = "".join(decls)
        script = (script[:m1.end()] + ins + script[m1.end():]) if m1 else ins + script
    return script, {"refs": len(used), "declared": len(decls)}


# ---------------------------------------------------------------- V23 공급사 pcc 번들($c.fil/$c.lc/$c.frame/$c.utils) 의존
def _split_args(s):
    """최상위 쉼표로 인자 분리(문자열·괄호 안 쉼표 제외)."""
    out, d, cur, i, n = [], 0, [], 0, len(s)
    while i < n:
        ch = s[i]
        if ch in "\"'`":
            q = ch; j = i + 1
            while j < n and s[j] != q:
                j += 2 if s[j] == "\\" else 1
            cur.append(s[i:j + 1]); i = j + 1; continue
        if ch in "([{": d += 1
        elif ch in ")]}": d -= 1
        if ch == "," and d == 0:
            out.append("".join(cur).strip()); cur = []
        else:
            cur.append(ch)
        i += 1
    if cur or out:
        out.append("".join(cur).strip())
    return out


def replace_vendor_pcc(script):
    """공급사 pcc 번들에만 있는 호출 중 뜻이 분명한 것만 gcc/컴포넌트 API 로:
    `$c.fil.alert_error(m)`→`$c.win.alert(m)` · `$c.fil.getObjectValue(X)`→`X.getValue()` · `$c.fil.setObjectValue(X, v)`→`X.setValue(v)`
    (2026-09-30 ISIN 화면 선례) · `$c.fil.fn_setFromToDate`→`$c.fil.setFromToDate`(pcc/fil 실존) · `$c.utils.`→`$c.ut.` 오기는 두고 TODO.
    나머지 `$c.lc.*`·`$c.frame.*`·저장소 pcc/fil 에 없는 `$c.fil.*` 는 그대로 두고 함수 머리에 TODO 1줄(게이트는 todo 로 집계)."""
    log = {}
    out, pos = [], 0
    mask = cv.code_mask(script)
    for m in re.finditer(r'\$c\.fil\.(alert_error|getObjectValue|setObjectValue)\(', script):
        if m.start() < pos or not mask[m.start()]:
            continue
        cl = _balanced(script, m.end() - 1)
        if cl < 0:
            continue
        args = _split_args(script[m.end():cl])
        kind = m.group(1)
        if kind == "alert_error":
            rep = "$c.win.alert(%s)" % script[m.end():cl]
        elif kind == "getObjectValue" and len(args) == 1:
            a = args[0]
            rep = "%s.getValue()" % (a if re.fullmatch(r'[\w$.]+(?:\([^()]*\))?', a) else "(%s)" % a)
        elif kind == "setObjectValue" and len(args) == 2:
            a = args[0]
            rep = "%s.setValue(%s)" % (a if re.fullmatch(r'[\w$.]+(?:\([^()]*\))?', a) else "(%s)" % a, args[1])
        else:
            continue
        out.append(script[pos:m.start()]); out.append(rep); pos = cl + 1
        log[kind] = log.get(kind, 0) + 1
    out.append(script[pos:])
    script = "".join(out)
    script, k = re.subn(r'\$c\.fil\.fn_setFromToDate\(', '$c.fil.setFromToDate(', script)
    if k:
        log["fn_setFromToDate"] = k
    # 남은 공급사 pcc 의존 → 함수 머리 TODO
    left = 0
    known_fil = set(st.common_inventory("fil")[0].get("fil", set()))
    for name, s, b, e, _ in reversed(st.func_spans(script)):
        body = st.code_only(script[b + 1:e])
        calls = sorted({x for x in re.findall(r'\$c\.(?:lc|frame|utils)\.[\w$]+', body)}
                       | {x for x in re.findall(r'\$c\.fil\.[\w$]+', body) if x.split(".")[-1] not in known_fil})
        if not calls or "TODO Stage2: 공급사 pcc 의존" in script[b + 1:e]:
            continue
        nl = script.find("\n", b) + 1
        ind = re.match(r'[ \t]*', script[nl:]).group(0) or "    "
        script = script[:nl] + ind + "// TODO Stage2: 공급사 pcc 의존(저장소 pcc/fil 에 없음 · 반입 또는 치환 판단) — " + ", ".join(calls) + "\n" + script[nl:]
        left += len(calls)
    log["todo_left"] = left
    return script, log


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
    script, log["V22_dup_fn"] = dedupe_function_defs(script)
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
    script, log["V21_cm_fn"] = replace_cm_helpers(script)
    script, log["V24_isProcess"] = replace_is_process(script)   # V23 보다 먼저 — 남은 $c.lc 만 TODO 로 집계되게
    script, log["V25_alertMsg"] = replace_alert_msg(script)
    script, log["V26_consts"] = inline_vendor_consts(script)
    script, log["V23_vendor_pcc"] = replace_vendor_pcc(script)
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
