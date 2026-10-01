# -*- coding: utf-8 -*-
"""onpageload 인라인 초기화 → scwin.init 분리(code-convention '초기화' 절 — onpageload 는 init_* 를 순차 호출만 한다).

    python conversion/tools/init_restructure.py [--dry] <xml|폴더> ...

onpageload 의 try 본문에서 뒤쪽의 '조회 호출'(4구역 함수 호출·search/list/select/*Sync 계열)은 onpageload 에 남기고,
그 앞의 초기화 문장을 scwin.init(있으면 그 본문 앞에 병합, 없으면 신설) 으로 옮긴다. 본문에 이미 init() 호출이 있으면
그 앞 문장만 옮긴다. 신설한 init 은 5구역 뒤에 두며 convert.py 규칙 4 가 2구역으로 재배치한다.

안전장치(건너뛰고 사유 출력): try/catch 골격이 아님 · 옮길 블록에 return · 옮길 블록의 const/let 을 남는 문장이 참조.
함정(2026-09-23 fil·stf 35화면): 통신 호출이 초기화 문장 중간에 있으면 순서 보존 우선으로 init 안에 같이 들어간다 —
결과를 보고 수기로 가른다. 기존 init 이 async 면 호출에 await 가 필요한데 옮긴 블록만 보고 판단하므로 사후 확인할 것.
"""
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402
import convert as c  # noqa: E402

QUERY_NAME = re.compile(r'^(search|select|list|read|load|view)|(Sync|List|Search|Select)$')


def section4_names(js):
    m = re.search(r'///////// 4\. [^\n]*\n(.*?)(?=///////// 5\. |\Z)', js, re.S)
    return set(re.findall(r'(?m)^scwin\.([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function', m.group(1))) if m else set()


def split_statements(block):
    """중괄호 깊이 0 기준으로 문장(줄 묶음)을 나눈다 — if/for 블록은 하나의 문장으로."""
    lines = block.split("\n"); stmts = []; cur = []; depth = 0; mask = c.code_mask(block); pos = 0
    for ln in lines:
        seg_mask = mask[pos:pos + len(ln)]
        cur.append(ln)
        for i, ch in enumerate(ln):
            if seg_mask[i]:
                if ch in "({[":
                    depth += 1
                elif ch in ")}]":
                    depth -= 1
        pos += len(ln) + 1
        if depth == 0 and ln.strip() and not ln.strip().startswith("//"):
            stmts.append("\n".join(cur)); cur = []
    if cur and any(l.strip() for l in cur):
        stmts.append("\n".join(cur))
    return stmts


def is_comment_only(stmt):
    return all((not l.strip()) or l.strip().startswith(("//", "*", "/*")) or l.strip() == "*/" for l in stmt.split("\n"))


def is_query_call(stmt, q4):
    s = "\n".join(re.sub(r'\s*//[^\n]*$', '', l) for l in stmt.split("\n") if not l.strip().startswith("//")).strip()
    m = re.match(r'^(?:await\s+)?scwin\.([A-Za-z_$][\w$]*)\([^;]*\);?$', s, re.S)
    if not m:
        return False
    name = m.group(1)
    return name in q4 or QUERY_NAME.search(name) is not None


def restructure(js):
    """returns (new_js | None, message)."""
    mask = c.code_mask(js)
    mo = re.search(r'(?m)^scwin\.onpageload\s*=\s*(async\s+)?function\s*\(([^)]*)\)\s*\{', js)
    if not mo:
        return None, "onpageload 없음"
    bopen = mo.end() - 1; bclose = st.match_brace(js, mask, bopen)
    if bclose < 0:
        return None, "본문 해석 실패"
    body = js[bopen + 1:bclose]
    # 들여쓰기 캡처는 [ \t]* 로 — \s* 는 본문 첫 줄바꿈까지 삼켜 빈 줄·`}};` 조립 결함을 낸다(2026-09-23 함정 3)
    tm = re.search(r'^\s*?\n?([ \t]*)try\s*\{\n(.*?)\n([ \t]*)\}\s*catch\s*\((\w+)\)\s*\{(.*)\}\s*$', body, re.S)
    if not tm:
        return None, "try/catch 골격 아님(수동)"
    indent_try, inner, indent_close, exv, catch_body = tm.groups()
    if re.search(r'scwin\.init(_[A-Za-z]+)?\(', inner) and not re.search(r'(?m)^\s*(?!(?:await\s+)?scwin\.[\w$]+\()(?!//)\S', inner):
        return None, "이미 init 호출 구조"
    stmts = split_statements(inner)
    if not stmts:
        return None, "본문 없음"
    q4 = section4_names(js)
    init_idx = next((i for i, s in enumerate(stmts) if re.match(r'^\s*(?:await\s+)?scwin\.init\(\);?\s*(//[^\n]*)?$', s.strip())), None)
    if init_idx is not None:
        move = stmts[:init_idx]; keep = stmts[init_idx + 1:]
        if not move:
            return None, "이미 init 호출 구조"
    else:
        tail_comments = []
        while stmts and is_comment_only(stmts[-1]):
            tail_comments.insert(0, stmts.pop())
        keep = []
        while stmts and is_query_call(stmts[-1], q4):
            keep.insert(0, stmts.pop())
        move = stmts + tail_comments
    if not move or all(is_comment_only(s) for s in move):
        return None, "옮길 초기화 문장 없음(호출만)"
    move_txt = "\n".join(move)
    if re.search(r'\breturn\b', st.code_only(move_txt)):
        return None, "옮길 블록에 return 존재(수동)"
    declared = set(re.findall(r'\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)', move_txt))
    keep_txt = "\n".join(keep)
    used = [d for d in declared if re.search(r'\b' + re.escape(d) + r'\b', keep_txt)]
    if used:
        return None, "옮길 블록 지역변수 %s 를 남는 문장이 참조(수동)" % used
    has_await = re.search(r'\bawait\b', st.code_only(move_txt)) is not None

    def dedent4(txt):
        out = []
        for l in txt.split("\n"):
            l = l.replace("\t", "    ")  # 탭 들여쓰기(공급사 산출·W-Craft 사본)도 같은 잣대로
            out.append(l[4:] if l.startswith("    " * 2) else l.lstrip(" ") if l.strip() else "")
        return "\n".join(out)
    moved_body = dedent4(move_txt)
    init_mo = re.search(r'(?m)^scwin\.init\s*=\s*(async\s+)?function\s*\(([^)]*)\)\s*\{\n', js)
    new_js = js
    if init_mo:
        ins = init_mo.end()
        new_js = new_js[:ins] + moved_body + "\n\n" + new_js[ins:]
        if has_await and not init_mo.group(1):
            new_js = new_js[:init_mo.start()] + new_js[init_mo.start():init_mo.end()].replace("function", "async function", 1) + new_js[init_mo.end():]
        how = "기존 init 앞에 병합"
    else:
        jsdoc = ("/**\n * @method\n * @name init\n * @description 화면 초기화 — 파라미터 수신·기본값·컴포넌트 초기 설정(onpageload 에서 순차 호출).\n"
                 " * @returns {%s}\n * @hidden N\n */\n" % ("Promise<void>" if has_await else "void"))
        init_fn = jsdoc + "scwin.init = %sfunction () {\n%s\n};\n" % ("async " if has_await else "", moved_body)
        m5 = re.search(r'(?m)^///////// 5\. [^\n]*\n', new_js)
        new_js = (new_js[:m5.end()] + init_fn + "\n" + new_js[m5.end():]) if m5 else (new_js.rstrip("\n") + "\n\n" + init_fn)
        how = "init 신설"
    call_init = ("await " if has_await else "") + "scwin.init();"
    keep_lines = "\n".join(keep)
    new_inner = indent_try + "    // 초기화함수\n" + indent_try + "    " + call_init + ("\n\n" + keep_lines if keep_lines else "")
    new_body = "\n%stry {\n%s\n%s} catch (%s) {%s}\n" % (indent_try, new_inner, indent_close, exv, catch_body)
    mo2 = re.search(r'(?m)^scwin\.onpageload\s*=\s*(async\s+)?function\s*\(([^)]*)\)\s*\{', new_js)
    b2 = mo2.end() - 1; e2 = st.match_brace(new_js, c.code_mask(new_js), b2)
    new_js = new_js[:b2 + 1] + new_body + new_js[e2:]
    if has_await and not mo2.group(1):
        new_js = new_js[:mo2.start()] + new_js[mo2.start():mo2.end()].replace("function", "async function", 1) + new_js[mo2.end():]
    last = re.sub(r'\s+', ' ', move[-1].strip())[:70]
    return new_js, "%s — 이동 %d문, 유지(조회 호출) %d문%s | 마지막 이동문: %s" % (how, len(move), len(keep), " [await]" if has_await else "", last)


def process(path, dry=False):
    raw, eol, reg = st.read_xml(path)
    if reg is None:
        return "script 영역 없음"
    new_js, msg = restructure(reg["script"])
    if new_js is None:
        return msg
    if not dry:
        head = st.set_public_info(reg["head"], st.defined_functions(new_js))
        st.write_xml(path, head, reg["script_open"], new_js, reg["script_close"], reg["body"], eol)
    return msg


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    files, fl, _op = st.parse_cli(argv if argv is not None else sys.argv[1:], flags=("--dry",), opts=())
    if not files:
        print(__doc__); return 2
    for p in files:
        print("%-22s %s" % (os.path.basename(p), process(p, dry=fl["--dry"])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
