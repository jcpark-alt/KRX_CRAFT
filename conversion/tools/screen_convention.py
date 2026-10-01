# -*- coding: utf-8 -*-
"""code-convention 후처리 — convert.py 산출물에 없는 컨벤션 항목을 채운다(fil/stf/bnsnew 파이프라인의 컨벤션 단계 승격).

    python conversion/tools/screen_convention.py [--dry] [--pcc fil|stf|mgt|tms] [--steps a,b,c] <xml|폴더> ...

단계(--steps 생략 시 전부, 순서 고정):
  jsdoc     전 함수 JSDoc 스캐폴딩/보강 — @method/@name/@description/@param{타입}/@returns/@hidden N.
            직전 일반 주석(`//` 줄·`/* */` 블록·레거시 박스 주석)을 @description 으로 이관하고 지운다.
            기존 JSDoc 은 빈 @description 만 채우고 명시 @returns 는 보존. 이벤트 핸들러는 body 라벨(「버튼」)로 문구 생성.
            ⚠ 직전 주석은 함수 정의 끝에서 **역방향으로만** 탐색한다(앞에서 search 하면 파일 첫 블록 주석을 통째로 잡는다).
            ⚠ 주석 처리된 코드(`// scwin.x = …`)·`@` 가 든 텍스트·`////` 섹션 헤더는 설명으로 쓰지 않는다.
  await     같은 파일 async 함수 + async 공통($c.ns.fn) 호출에 await 부여 → 소속 함수 async 부여 … 고정점까지.
            async 함수의 catch 안 handleError 에도 await(규칙 26 규약).
  reindent  4-스페이스 재들여쓰기(탭→4칸, 4의 배수 반올림, JSDoc `*` 줄은 블록 시작열+1) + 후행 공백 제거.
            다중행 문자열/템플릿 리터럴 안은 건드리지 않는다.
  unused    정의 뒤 아무 데서도 안 읽는 scwin 전역 삭제(body 에서 참조하는 이름은 보존).
  finalize  head: meta_screenId 보강·layoutInfo·publicInfo 를 정의 함수 전부로 재생성. body/head: 정의 없는
            ev:on*/customFormatter 속성 제거. gridView header↔gBody 같은 컬럼 id → header 쪽 `_H` 접미(WS120).

파일을 제자리에서 바꾼다(--dry 는 리포트만). 바꾼 뒤 convert.py 를 다시 돌려 고정점(2회 실행 0 diff)을 확인할 것 —
이 도구의 출력은 convert 포매터와 호환되도록 맞춰져 있다(2026-09-22 fil 10화면 검증).
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402
import convert as cv  # noqa: E402

STEPS = ("jsdoc", "await", "reindent", "unused", "finalize")

EVENT_KO = {"onclick": "클릭", "oncellclick": "셀 클릭", "oncelldblclick": "셀 더블클릭", "onrowpositionchange": "행 위치 변경",
            "ontabclick": "탭 클릭", "onviewchange": "값 변경", "onchange": "변경", "onblur": "포커스 이탈", "onkeyup": "키 입력",
            "onkeydown": "키 입력", "onfocus": "포커스", "ondblclick": "더블클릭", "onpageload": "페이지 로드",
            "onpageunload": "페이지 언로드", "ondataload": "데이터 로드"}
PARAM_DESC = {
    "e": "이벤트 객체", "info": "이벤트 정보 객체", "rowIndex": "행 인덱스", "columnIndex": "열 인덱스", "columnId": "컬럼 id",
    "oldRow": "이전 행 인덱스", "oldRowIndex": "이전 행 인덱스", "tabId": "탭 id", "index": "index",
    "data": "셀 원본 값", "formattedData": "포맷된 값", "arrPar": "팝업 파라미터 배열(참조 채움)", "comp": "입력 컴포넌트",
    "obj": "컴포넌트", "msg": "항목명", "rowcount": "조회 건수", "row": "행 인덱스", "screnId": "화면 ID", "ex": "예외 객체",
}
DEFAULT_OVERRIDES = {
    "onpageload": "화면 로딩 시 초기 처리 — init 순차 호출",
    "onpageunload": "화면 언로드 시 정리 처리",
    "init": "화면 초기화 — 파라미터 수신·기본값·컴포넌트 초기 설정(onpageload 에서 순차 호출)",
}


# ---------------------------------------------------------------- jsdoc
def label_of(body, comp_id):
    m = re.search(r'<[\w:]+[^>]*\sid="%s"[^>]*>' % re.escape(comp_id), body)
    if not m:
        return None
    tag = m.group(0)
    for attr in ("label", "title", "alt", "value"):
        a = re.search(r'\s%s="([^"]*)"' % attr, tag)
        if a and a.group(1).strip():
            return a.group(1).strip()
    after = body[m.end():m.end() + 300]
    lab = re.match(r'\s*<xf:label><!\[CDATA\[([^\]]*)\]\]>', after)
    return lab.group(1).strip() if lab and lab.group(1).strip() else None


def camel_words(name):
    name = re.sub(r'^(fn_|sbm_|trs_|dts_|dlt_|dma_|tx_)', '', name)
    return " ".join(re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', name.replace("_", " ")).split())


def describe(name, params, body_xml, fallback_log, overrides):
    if name in overrides:
        return overrides[name]
    m = re.match(r'^([\w$]+)_(on[a-z]+)$', name)
    if m:
        comp, ev = m.group(1), m.group(2)
        lbl = label_of(body_xml, comp)
        evk = EVENT_KO.get(ev, ev)
        return ("「%s」 %s 이벤트" % (lbl, evk)) if lbl else ("%s %s 이벤트" % (comp, evk))
    m = re.match(r'^(?:sbm|tx)_(\w+)_submitdone$', name)
    if m:
        return "%s 통신 후처리" % m.group(1)
    m = re.match(r'^tx_(\w+)$', name)
    if m:
        return "%s 서버 호출" % camel_words(m.group(1))
    m = re.match(r'^init_(\w+)$', name)
    if m:
        return "초기화 — %s" % camel_words(m.group(1))
    m = re.match(r'^(\w+)_(OnSelChange2?|OnKillFocus|OnKey|OnLoadCompleted|OnLoadError|OnClick|OnDblClick)$', name)
    if m:
        suf = {"OnSelChange": "선택 변경 처리", "OnSelChange2": "선택 변경 처리(2)", "OnKillFocus": "포커스 이탈 처리",
               "OnKey": "키 입력 처리", "OnLoadCompleted": "로드 완료 후처리", "OnLoadError": "로드 오류 처리",
               "OnClick": "클릭 처리", "OnDblClick": "더블클릭 처리"}[m.group(2)]
        return "%s %s(레거시 Gauce 이벤트명 — 화면 내부 호출용)" % (m.group(1), suf)
    fallback_log.append(name)
    return camel_words(name) + " 처리"


def ptype(p):
    if re.search(r'(Dd|Cd|Id|Nm|Yn|Tp|Url|Msg|Str|Gp|CD|NM|ID|DD|_cfi|flag|Flag|title)$', p) or \
            p in ("msg", "url", "str", "label", "lbl", "screnId", "mflag", "width", "height", "screenId"):
        return "String"
    if p in ("rowIndex", "columnIndex", "index", "row", "rowcount", "rowCount", "cnt", "idx", "i", "n", "size", "oldRow", "oldRowIndex"):
        return "Number"
    if p in ("e", "info", "obj", "comp", "options", "res", "ex", "param", "opt", "sbmRtn"):
        return "Object"
    if p in ("arrPar", "arr", "list", "rows"):
        return "Array"
    return "*"


def returns_of(body_code, is_async):
    rets = re.findall(r'\breturn\s+([^;\n]+)', body_code)
    if not rets:
        return "{Promise<void>}" if is_async else "{void}"
    vals = " ".join(rets)
    if re.fullmatch(r'[\s\d]+', vals):
        t = "Number"
    elif all(re.fullmatch(r'(true|false)', r.strip()) for r in rets):
        t = "Boolean"
    elif all(re.search(r'arrPar|\[\s*\{', r) for r in rets):
        t = "Array"
    else:
        t = "*"
    return "{Promise<%s>}" % t if is_async else "{%s}" % t


def parse_box(block):
    """레거시 박스/자유 블록 주석 → (description, {param: desc}) 또는 None(JSDoc 꼴이면)."""
    lines = [re.sub(r'^\s*\*+\s?', '', l).rstrip() for l in block.split("\n")]
    lines = [l for l in lines if l.strip() and not re.fullmatch(r'[\s*/]+', l)]
    desc, params, extra = [], {}, []
    for l in lines:
        m = re.match(r'^(함수명|설명|argument|param|포맷|return)\s*[:：]\s*(.*)$', l, re.I)
        if m:
            k, v = m.group(1).lower(), m.group(2).strip()
            if k == "함수명":
                continue
            if k in ("argument", "param"):
                for p in re.split(r'[,\s]+', v):
                    if p:
                        params[p] = ""
            elif k == "설명":
                if v:
                    desc.append(v)
            else:
                extra.append("%s: %s" % (m.group(1), v))
        elif l.strip().startswith("@"):
            return None
        elif re.search(r'[;=(){}\[\]]', l) or re.match(r'^\s*-\s*\[', l):
            continue
        else:
            extra.append(l.strip())
    text = " ".join(desc) if desc else " ".join(extra)
    if desc and extra:
        text = " ".join(desc) + " (" + " / ".join(extra) + ")"
    return (text.strip(), params)


def build_jsdoc(name, params, desc, pdesc, ret):
    out = ["/**", " * @method", " * @name %s" % name, " * @description %s" % desc]
    for p in params:
        out.append(" * @param {%s} %s %s" % (ptype(p), p, pdesc.get(p, "") or PARAM_DESC.get(p, p)))
    out.append(" * @returns %s" % ret)
    out.append(" * @hidden N")
    out.append(" */")
    return "\n".join(out)


def preceding_comment(pre):
    """pre(함수 정의 직전까지) 끝에 붙은 주석 블록 → (block_text, start_offset) 또는 None. 끝에서 역방향으로만."""
    tail = pre.rstrip(" \t\n")
    if not tail:
        return None
    if tail.endswith("*/"):
        k = tail.rfind("/*")
        if k < 0:
            return None
        ls = tail.rfind("\n", 0, k) + 1
        return pre[ls:len(tail)] + "\n", ls
    lines = tail.split("\n")
    j = len(lines) - 1
    while j >= 0 and lines[j].lstrip().startswith("//") and not lines[j].lstrip().startswith("////"):
        j -= 1
    if j == len(lines) - 1:
        return None
    start = len("\n".join(lines[:j + 1])) + (1 if j >= 0 else 0)
    return pre[start:len(tail)] + "\n", start


def convention_jsdoc(script, body_xml, fallback_log=None, overrides=None):
    fallback_log = fallback_log if fallback_log is not None else []
    overrides = dict(DEFAULT_OVERRIDES, **(overrides or {}))
    for name, s, b, e, is_async in reversed(st.func_spans(script)):
        sig = re.match(r'^scwin\.[\w$]+\s*=\s*(?:async\s+)?function\s*\(([^)]*)\)', script[s:], re.S)
        if sig is None:
            raise RuntimeError("signature parse failed: %s :: %r" % (name, script[s:s + 120]))
        params = [p.strip().split("=")[0].strip() for p in sig.group(1).split(",") if p.strip()]
        ret = returns_of(script[b:e], is_async)
        mm = preceding_comment(script[:s])
        desc, pdesc, cut_from = None, {}, s
        if mm:
            block, start = mm
            if block.lstrip().startswith("/**") and re.search(r'@(method|name|description|param)', block):
                d = re.search(r'@description\s*:?\s*([^\n]*)', block)
                desc = d.group(1).strip() if d else ""
                if name in overrides:
                    desc = overrides[name]
                if not desc or desc.lower() in ("desc", "description"):
                    desc = describe(name, params, body_xml, fallback_log, overrides)
                for pm in re.finditer(r'@param\s*(?:\{[^}]*\})?\s*(\w+)\s*([^\n]*)', block):
                    pdesc[pm.group(1)] = pm.group(2).strip()
                rm = re.search(r'@returns?\s*(\{[^}]*\}[^\n]*)', block)
                if rm and rm.group(1).strip() not in ("{*}", "{void}"):
                    ret = rm.group(1).strip()
                cut_from = start
            elif block.lstrip().startswith("/*"):
                parsed = parse_box(block)
                if parsed is not None:
                    desc, pdesc = parsed
                    if not desc:
                        desc = describe(name, params, body_xml, fallback_log, overrides)
                    cut_from = start
            else:
                txt = " ".join(re.sub(r'^\s*//\s?', '', l).strip() for l in block.strip().split("\n"))
                code_like = re.search(r'scwin\.|\(|;|=|\$c\.|@', txt) or txt.startswith("TODO")
                if txt and not code_like and len(txt) < 200:
                    desc = txt
                    cut_from = start
        if desc is None:
            desc = describe(name, params, body_xml, fallback_log, overrides)
        desc = desc.replace("\n", " ").strip()
        jsdoc = build_jsdoc(name, params, desc, pdesc, ret)
        script = script[:cut_from].rstrip("\n") + "\n\n" + jsdoc + "\n" + script[s:]
    return script


# ---------------------------------------------------------------- await
def propagate_await(script, async_common):
    """같은 파일 async 함수 + async 공통 호출에 await 부여 → 소속 함수 async … 고정점. returns (script, n)."""
    rep = cv._new_report("screen")
    total = 0
    common = set(async_common) - {("exception", "handleError")}
    for _ in range(20):
        asyncs = set(re.findall(r'^scwin\.([\w$]+)\s*=\s*async\s+function', script, re.M))
        mask = cv.code_mask(script)
        ins = []
        for m in re.finditer(r'(?<![\w.$])scwin\.([\w$]+)\s*\(', script):
            if mask[m.start()] and m.group(1) in asyncs and not re.search(r'\bawait\s*$', script[:m.start()]):
                ins.append(m.start())
        for m in re.finditer(r'\$c\.(\w+)\.(\w+)\s*\(', script):
            if mask[m.start()] and (m.group(1), m.group(2)) in common and not re.search(r'\bawait\s*$', script[:m.start()]):
                ins.append(m.start())
        ins = sorted(set(ins))
        if not ins:
            break
        for p in reversed(ins):
            script = script[:p] + "await " + script[p:]
        total += len(ins)
        script = cv.mark_async_functions(script, rep)
    return script, total


def fix_catch_await(script):
    n = 0
    for name, s, b, e, is_async in reversed(st.func_spans(script)):
        if not is_async:
            continue
        seg2, k = re.subn(r'(\}\s*catch\s*\(\w+\)\s*\{\s*\n\s*)(\$c\.exception\.handleError\()', r'\1await \2', script[b:e])
        if k:
            script = script[:b] + seg2 + script[e:]
            n += k
    return script, n


# ---------------------------------------------------------------- reindent / unused
def reindent(script):
    """4-스페이스 재들여쓰기 + 후행 공백 제거. 다중행 문자열·템플릿 리터럴 내부 줄은 그대로 둔다."""
    mask = cv.code_mask(script)
    out, in_block, block_col, pos = [], False, 0, 0
    for line in script.split("\n"):
        start = pos
        pos += len(line) + 1
        stripped = line.lstrip(" \t")
        if not stripped:
            out.append(""); continue
        lead = len(line) - len(stripped)
        # 줄 머리가 비코드(문자열/템플릿 리터럴 안)이고 주석도 아니면 보존
        if lead < len(line) and not mask[start + lead] and not stripped.startswith(("//", "/*", "*")):
            out.append(line.rstrip()); continue
        col = sum(4 if ch == "\t" else 1 for ch in line[:lead])
        if in_block:
            if stripped.startswith("*"):
                new = " " * (block_col + 1) + stripped.rstrip().replace("\t", "    ")
            else:
                new = " " * (round(col / 4) * 4) + stripped.rstrip().replace("\t", "    ")
            if "*/" in stripped:
                in_block = False
            out.append(new); continue
        new_col = round(col / 4) * 4
        new = " " * new_col + stripped.rstrip()
        if stripped.startswith("//"):
            new = new.replace("\t", "    ")
        if stripped.startswith("/*") and "*/" not in stripped:
            in_block, block_col = True, new_col
        out.append(new)
    return "\n".join(out)


KEEP_GLOBALS = ("screenId",)  # 1구역 표준 선언 — 샘플은 정의만 하고 대개 읽지 않는다


def remove_unused_globals(script, body_xml, keep=KEEP_GLOBALS):
    code = st.code_only(script)
    removed = []
    for m in list(re.finditer(r'^scwin\.([\w$]+)\s*=\s*(?!\s*(?:async\s+)?function)[^\n]*\n', script, re.M))[::-1]:
        nm = m.group(1)
        if nm in keep:
            continue
        refs = len(re.findall(r'scwin\.%s\b' % re.escape(nm), code)) - 1
        if refs <= 0 and ("scwin." + nm) not in body_xml:
            script = script[:m.start()] + script[m.end():]
            removed.append(nm)
    return script, removed


# ---------------------------------------------------------------- finalize
def finalize_head_body(head, script, body, name):
    log = {}
    funcs = st.defined_functions(script)
    if 'meta_screenId=' not in head:
        head = re.sub(r'(meta_screenName="[^"]*")', r'\1 meta_screenId="%s"' % name, head, 1)
    head = st.set_public_info(head, funcs)
    if "<w2:layoutInfo" not in head:
        head = re.sub(r'(<w2:buildDate\s*/>)', r'\1\n\t\t<w2:layoutInfo/>', head, 1)
    defined = set(funcs)

    def drop(m):
        return "" if m.group(2) not in defined else m.group(0)
    body, _ = re.subn(r'\s(ev:on\w+|customFormatter|displayFormatter)="scwin\.([\w$]+)"', drop, body)
    head, _ = re.subn(r'\s(ev:on\w+)="scwin\.([\w$]+)"', drop, head)
    log["dangling_attr_left"] = len([h for h in re.findall(r'(?:ev:on\w+|customFormatter|displayFormatter)="scwin\.([\w$]+)"', body + head)
                                     if h not in defined])
    renamed = [0]

    def fix_grid(gm):
        g = gm.group(0)
        gb = re.search(r'<w2:gBody.*?</w2:gBody>', g, re.S)
        hd = re.search(r'<w2:header.*?</w2:header>', g, re.S)
        if not gb or not hd:
            return g
        body_ids = set(re.findall(r'<w2:column[^>]*\sid="([^"]+)"', gb.group(0)))

        def ren(cm):
            tag = cm.group(0)
            idm = re.search(r'\sid="([^"]+)"', tag)
            if idm and idm.group(1) in body_ids:
                renamed[0] += 1
                return tag.replace('id="%s"' % idm.group(1), 'id="%s_H"' % idm.group(1), 1)
            return tag
        new_hd = re.sub(r'<w2:column\b[^>]*>', ren, hd.group(0))
        return g[:hd.start()] + new_hd + g[hd.end():]
    body = re.sub(r'<w2:gridView\b.*?</w2:gridView>', fix_grid, body, flags=re.S)
    log["header_id_renamed"] = renamed[0]
    return head, script, body, log


# ---------------------------------------------------------------- driver
def apply(path, steps=STEPS, pcc=None, async_common=None, dry=False, overrides=None):
    raw, eol, reg = st.read_xml(path)
    name = Path(path).stem
    if reg is None:
        return {"name": name, "fatal": "script 영역 없음"}
    head, script, body = reg["head"], reg["script"], reg["body"]
    log = {"name": name}
    if "jsdoc" in steps:
        fb = []
        script = convention_jsdoc(script, body, fb, overrides)
        log["jsdoc_fallback"] = fb
    if "await" in steps:
        if async_common is None:
            async_common = st.common_inventory(pcc or st.pcc_for(name))[1]
        script, n1 = propagate_await(script, async_common)
        script, n2 = fix_catch_await(script)
        log["await_added"] = n1 + n2
    if "reindent" in steps:
        script = reindent(script)
    if "unused" in steps:
        script, removed = remove_unused_globals(script, body)
        log["unused_removed"] = removed
    if "finalize" in steps:
        head, script, body, l2 = finalize_head_body(head, script, body, name)
        log.update(l2)
    new = st.join_regions(reg, script=script, head=head, body=body)
    log["changed"] = new != raw
    if not dry and log["changed"]:
        st.write_xml(path, head, reg["script_open"], script, reg["script_close"], body, eol)
    return log


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    files, fl, op = st.parse_cli(argv if argv is not None else sys.argv[1:], flags=("--dry",), opts=("--pcc", "--steps"))
    if not files:
        print(__doc__); return 2
    steps = tuple(op["--steps"].split(",")) if op["--steps"] else STEPS
    bad = [s for s in steps if s not in STEPS]
    if bad:
        print("알 수 없는 단계:", bad); return 2
    cache = {}
    for f in files:
        pcc = op["--pcc"] or st.pcc_for(f)
        if pcc not in cache:
            cache[pcc] = st.common_inventory(pcc)[1]
        log = apply(f, steps, pcc, cache[pcc], dry=fl["--dry"])
        print("%-22s %s" % (log.pop("name"), log))
    return 0


if __name__ == "__main__":
    sys.exit(main())
