# -*- coding: utf-8 -*-
"""화면 XML 후처리 도구 공용 헬퍼 (gate_screen / scan_mixed_compare / screen_convention / init_restructure 가 공유).

- 저장소 루트·공통 네임스페이스 재고(gcc + 모듈 pcc)·스크립트 함수 span·코드 영역 한정 치환 등
  잡 tmp 에 흩어져 있던 파이프라인 스크립트(2026-09-22 ~ 09-30)의 공통부를 모았다.
- convert.py 의 스캐너(segments / code_mask / split_regions / _func_body_open)를 그대로 쓴다 — 문자열·주석·정규식
  리터럴 안은 코드로 취급하지 않는다.
"""
import io
import os
import re
import glob
import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE))
import convert as cv  # noqa: E402

ROOT = _HERE.parents[1]  # 저장소 루트 (conversion/tools → conversion → 루트)

# 모듈(ui 폴더) → 참조 가능한 pcc 폴더. 사용자 지시(2026-09-21): jsp-front·fil-front 는 pcc/fil, stf-front 는 pcc/stf,
# mgt-front 는 pcc/mgt, tms-front 는 pcc/tms 만 참조한다. jsp-front 의 uldmgt* 화면은 pcc/mgt.
PCC_BY_PREFIX = {"jld": "fil", "uld": "fil", "uldmgt": "mgt"}


def pcc_for(name):
    """화면 파일명(jldfil25900 / uldmgt76101 / ULDSTF05403 …) → pcc 폴더명. 모르면 None."""
    n = Path(name).stem.lower()
    for k in sorted(PCC_BY_PREFIX, key=len, reverse=True):
        if n.startswith(k):
            return PCC_BY_PREFIX[k]
    return None


def read_xml(path):
    """(raw_text(LF 정규화), eol, regions) — regions 는 convert.split_regions 결과(없으면 None)."""
    b = io.open(path, "rb").read()
    eol = "\r\n" if b"\r\n" in b else "\n"
    text = b.decode("utf-8").replace("\r\n", "\n")
    return text, eol, cv.split_regions(text)


def write_xml(path, head, script_open, script, script_close, body, eol="\n"):
    text = head + script_open + script + script_close + body
    io.open(path, "wb").write(text.replace("\n", eol).encode("utf-8"))


def join_regions(reg, script=None, head=None, body=None):
    return ((head if head is not None else reg["head"]) + reg["script_open"]
            + (script if script is not None else reg["script"]) + reg["script_close"]
            + (body if body is not None else reg["body"]))


# ---------------------------------------------------------------- 공통 네임스페이스 재고
def common_inventory(pcc=None):
    """gcc(+ 모듈 pcc) 공개 함수 재고.
    returns (public: {ns: set(fn)}, async_fns: set((ns, fn)))
    """
    files = glob.glob(str(ROOT / "cm" / "gcc" / "*.xml"))
    if pcc:
        files += glob.glob(str(ROOT / "cm" / "pcc" / pcc / "*.xml"))
    public, async_fns = {}, set()
    for f in files:
        t = io.open(f, "r", encoding="utf-8").read()
        sid = re.search(r'meta_screenId="([^"]*)"', t)
        pi = re.search(r'publicInfo method="([^"]*)"', t)
        if not sid or not pi:
            continue
        ns = sid.group(1).replace("$c.", "")
        public.setdefault(ns, set()).update(x.strip().replace("scwin.", "") for x in pi.group(1).split(",") if x.strip())
        reg = cv.split_regions(t)
        if reg:
            for m in re.finditer(r'^scwin\.(\w+)\s*=\s*async\s+function', reg["script"], re.M):
                async_fns.add((ns, m.group(1)))
    return public, async_fns


# ---------------------------------------------------------------- 스크립트 분석
def without_comments(script):
    """주석(`//`·`/* */`)만 공백으로 바꾼 같은 길이의 문자열 — 문자열 리터럴은 남긴다(id 참조 판정용)."""
    out = []
    for text, is_code in cv.segments(script):
        if not is_code and text.startswith(("//", "/*")):
            out.append("".join("\n" if ch == "\n" else " " for ch in text))
        else:
            out.append(text)
    return "".join(out)


def code_only(script):
    """비코드(문자열·주석·정규식) 자리를 공백으로 바꾼 같은 길이의 문자열 — 줄 번호가 보존된다."""
    mask = cv.code_mask(script)
    return "".join(ch if mask[i] else " " for i, ch in enumerate(script))


def sub_code(script, pattern, repl, flags=0):
    """코드 영역에만 re.sub (주석·문자열 안은 그대로)."""
    parts = []
    for text, is_code in cv.segments(script):
        parts.append(re.sub(pattern, repl, text, flags=flags) if is_code else text)
    return "".join(parts)


def match_brace(script, mask, open_pos):
    """open_pos 의 '{' 에 대응하는 '}' 위치. 없으면 -1."""
    d, j = 0, open_pos
    n = len(script)
    while j < n:
        if mask[j]:
            if script[j] == "{":
                d += 1
            elif script[j] == "}":
                d -= 1
                if d == 0:
                    return j
        j += 1
    return -1


def func_spans(script):
    """[(name, def_start, body_open, body_close, is_async)] — 최상위 `scwin.X = [async ]function`."""
    mask = cv.code_mask(script)
    spans = []
    for m in re.finditer(r'^scwin\.([\w$]+)\s*=\s*(async\s+)?function\b', script, re.M):
        if not mask[m.start()]:
            continue
        b = cv._func_body_open(script, mask, m.end())
        if b < 0:
            continue
        e = match_brace(script, mask, b)
        if e < 0:
            continue
        spans.append((m.group(1), m.start(), b, e, bool(m.group(2))))
    return spans


def defined_functions(script):
    """정의 순서대로 중복 없이."""
    return list(dict.fromkeys(re.findall(r'^scwin\.([\w$]+)\s*=\s*(?:async\s+)?function', script, re.M)))


def public_info(head):
    m = re.search(r'publicInfo method="([^"]*)"', head)
    return set(x.strip().replace("scwin.", "") for x in m.group(1).split(",") if x.strip()) if m else set()


def set_public_info(head, names):
    """publicInfo 를 names 로 재생성(자기닫힘·열고닫힘 둘 다 지원). 태그가 없으면 buildDate 뒤에 layoutInfo 와 함께 삽입."""
    public = ",".join("scwin." + n for n in names)
    pat = r'<w2:publicInfo\b[^>]*?(?:/>|>\s*</w2:publicInfo>)'
    if re.search(pat, head):
        return re.sub(pat, '<w2:publicInfo method="%s"/>' % public, head, 1)
    ins = '<w2:layoutInfo/>' if "<w2:layoutInfo" not in head else ""
    tag = '<w2:publicInfo method="%s"/>' % public
    if re.search(r'<w2:buildDate\s*/>', head):
        return re.sub(r'(<w2:buildDate\s*/>)', r'\1' + ('\n\t\t' + ins if ins else '') + '\n\t\t' + tag, head, 1)
    # buildDate 가 없는 head(레이어 분리 문서 등) — </xf:model> 뒤, 없으면 head 끝(script 직전)에 둔다
    m = re.search(r'</xf:model>', head)
    pos = m.end() if m else len(head.rstrip())
    indent = "\n" + (re.search(r'\n([ \t]*)<', head[pos:]) or re.search(r'\n([ \t]*)\S', head)).group(1) if head[pos:].strip() or "\n" in head else "\n\t"
    return head[:pos] + (indent + ins if ins else "") + indent + tag + head[pos:]


def looks_like_code(txt):
    """주석 텍스트가 사실은 주석 처리된 코드인지 — 설명 문장(괄호·한글 포함)은 통과, 문장 부호·키워드 꼴은 코드."""
    return bool(re.search(r'scwin\.|\$c\.|[;{}]|\s=\s|\w+\s*\([^)]*\)\s*$|^\s*(if|for|while|return|const|let|var|else|try|catch)\b|^\s*//', txt))


def strip_for_scan(code):
    """게이트용 단순 제거판 — 주석·문자열을 지운 코드(길이 비보존)."""
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.S)
    code = re.sub(r'//[^\n]*', '', code)
    code = re.sub(r'"(?:\\.|[^"\\\n])*"|\'(?:\\.|[^\'\\\n])*\'|`(?:\\.|[^`\\])*`', '""', code)
    return code


def parse_cli(argv, flags=("--dry",), opts=("--pcc",)):
    """간단한 CLI 파서 → (files, {flag: bool}, {opt: value}). 디렉터리 인자는 *.xml 로 펼친다."""
    fl = {f: False for f in flags}
    op = {o: None for o in opts}
    files, i = [], 0
    while i < len(argv):
        a = argv[i]
        if a in fl:
            fl[a] = True
        elif a in op:
            i += 1
            op[a] = argv[i]
        elif a.startswith("--") and "=" in a and a.split("=")[0] in op:
            op[a.split("=")[0]] = a.split("=", 1)[1]
        elif os.path.isdir(a):
            files += sorted(glob.glob(os.path.join(a, "**", "*.xml"), recursive=True))
        else:
            files += sorted(glob.glob(a)) or [a]
        i += 1
    return files, fl, op
