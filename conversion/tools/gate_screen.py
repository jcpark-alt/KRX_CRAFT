# -*- coding: utf-8 -*-
"""화면 XML 범용 게이트 — 전환·컨벤션 적용 뒤 반드시 통과해야 하는 정적 검사 묶음.

    python conversion/tools/gate_screen.py [--pcc fil|stf|mgt|tms] [--no-node] <xml|폴더> ...

검사 항목(화면마다):
  node --check        CDATA 스크립트 구문(공급사 11차 `var class;` 백지 화면 류)
  dup defs            같은 이름의 scwin 함수 2회 정의(JS 는 마지막이 이김)
  publicInfo ↔ 정의   등재만 있음(WS201)·정의만 있음(화면 밖에서 못 부름)
  ev:on* ↔ 정의       body/head 가 가리키는 핸들러·customFormatter 가 정의돼 있는가
  컴포넌트 참조 ↔ id   스크립트가 쓰는 접두 id(btn_/grd_/dma_ …)가 body/head 에 있는가
  미정의 $c           gcc + 모듈 pcc publicInfo 에 없는 $c.ns.fn 호출
  미사용 전역         정의 뒤 아무 데서도 안 읽는 scwin 전역
  레거시 토큰         console.log · var · fn_ 정의 · 느슨 비교 · $c.frame · 원시 alert · debugger · 탭 · 후행 공백 등

--pcc 를 생략하면 파일명 접두(jld*/uld* → fil, uldmgt* → mgt)로 정한다(screen_tools.pcc_for).
종료 코드: 전부 통과 0, 하나라도 실패 1.
"""
import io
import re
import sys
import shutil
import subprocess
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402

ID_PREFIX = (r'(?<![\w.$])((?:btn|txb|txt|edt|ipt|cmb|slc|sel|grd|tab|tbc|pnl|grp|dma|dlt|ica|cal|sbx|ibx|chk|rdo|rad|'
             r'tbl|spn|img|lbl|label|upl|frm|ifr|pgl|wfm)_[A-Za-z0-9_]+)')
TOKENS = {
    "console.log": (r'console\.log', True), "var ": (r'(?<![\w.])var\s', True),
    "fn_ def": (r'^scwin\.fn_\w*\s*=\s*(?:async\s+)?function', True), "loose ==/!=": (r'(?<![=!<>])[=!]=(?!=)', True),
    "$c.frame": (r'\$c\.frame', False), "native alert(": (r'(?<![\w.])alert\(', True), "debugger": (r'debugger', True),
    "tab char": (r'\t', True), "trailing ws": (r'[ \t]+$', False), "new Object/Array": (r'new (Object|Array)\(', True),
    "TODO Stage2": (r'TODO Stage2', False), "backtick": (r'`', True), "/_commons script": (r'/_commons/', False),
}
# 샘플 규약상 정의만 하고 안 읽어도 되는 전역 — scwin.screenId 는 1구역 표준 선언(샘플 18화면 정의 / 2화면 참조)
KEEP_GLOBALS = {"screenId"}
# 공급사 확장 중 2차(컴포넌트 계약 전환)로 미룬 것 — 호출은 남고 TODO Stage2 로 집계한다(r13 README §2-2 fieldEl 199~239자리)
KNOWN_TODO_C = {"$c.util.fieldEl"}
# 정의가 어디에도 없는 as-is 공통(`$c.cm.fn_*`, 공급사 README §2-2 B 그룹 잔존·목록 밖 19종) — 닿으면 오류로 드러나는 자리, TODO 집계
KNOWN_TODO_RE = re.compile(r'^\$c\.(cm\.|lc\.|frame\.|utils\.|fil\.)')
# $c.lc/$c.frame/$c.utils 는 공급사 pcc 번들·Gauce 프레임 의존(저장소에 정의 없음), $c.fil 은 저장소 pcc/fil 이 부분 반입(2종)이라
# 재고에 없는 호출은 결함이 아니라 「반입 또는 치환 판단」 명부다(2026-10-02 2단계 jldstf 배치)
FAIL_TOKENS = ("console.log", "var ", "loose ==/!=", "native alert(", "debugger", "tab char", "trailing ws",
               "/_commons script")
# 보고만 하는 토큰: `new Array(n)`(길이 지정) · `fn_ def`(규칙 13 이 못 바꾸는 정의 — 숫자 시작 `fn_70000Table_*`·예약어·동명 전역, 공급사 README 52자리)
# · `$c.frame`(todo_c 로 집계)


def node_check(script, name):
    if not shutil.which("node"):
        return None, "node 없음(SKIP)"
    with tempfile.TemporaryDirectory() as d:
        p = Path(d) / (name + ".check.js")
        io.open(p, "w", encoding="utf-8").write("const scwin={}, $c={}, $p={};\n" + script)
        r = subprocess.run(["node", "--check", str(p)], capture_output=True, text=True)
    return r.returncode == 0, (r.stderr or "")[:800]


def gate_file(path, inventory=None, node=True):
    """returns (ok, result dict)."""
    raw, _eol, reg = st.read_xml(path)
    name = Path(path).stem
    res = {"name": name}
    if reg is None:
        res["fatal"] = "script 영역 없음"
        return False, res
    head, script, body = reg["head"], reg["script"], reg["body"]
    public = inventory[0] if inventory else st.common_inventory(st.pcc_for(name))[0]
    bad = False
    if node:
        ok, msg = node_check(script, name)
        res["node"] = "SKIP " + msg if ok is None else ("OK" if ok else "FAIL " + msg)
        bad |= ok is False
    defined_all = re.findall(r'^scwin\.([\w$]+)\s*=\s*(?:async\s+)?function', script, re.M)
    res["dup_defs"] = sorted({d for d in defined_all if defined_all.count(d) > 1})
    defined = set(defined_all)
    pub = st.public_info(head)
    res["public_only"] = sorted(pub - defined)
    res["defined_only"] = sorted(defined - pub)
    handlers = (set(re.findall(r'(?:ev:on\w+|customFormatter|displayFormatter)="scwin\.([\w$]+)"', body))
                | set(re.findall(r'ev:on\w+="scwin\.([\w$]+)"', head)))
    res["handlers_undefined"] = sorted(handlers - defined)
    code = st.strip_for_scan(script)
    ids = set(re.findall(r'\sid="([^"]+)"', body)) | set(re.findall(r'<w2:(?:dataMap|dataList)[^>]*\sid="([^"]+)"', head))
    refs = set(re.findall(ID_PREFIX, code))
    res["refs_missing"] = sorted(refs - ids)
    calls = re.findall(r'\$c\.(\w+)\.(\w+)', code)
    undef = {"$c.%s.%s" % (a, b) for a, b in calls if b not in public.get(a, set())}
    todo = {u for u in undef if u in KNOWN_TODO_C or KNOWN_TODO_RE.match(u)}
    res["todo_c"] = sorted(todo)      # 전환 미완으로 합의된 자리(공급사 확장·정의 없는 $c.cm.fn_*) — 실패시키지 않고 따로 센다
    res["undefined_c"] = sorted(undef - todo)
    globs = re.findall(r'^scwin\.(\w+)\s*=\s*(?!\s*(?:async\s+)?function)', script, re.M)
    res["unused_globals"] = [g for g in sorted(set(globs)) if g not in KEEP_GLOBALS
                             and len(re.findall(r'scwin\.%s\b' % re.escape(g), code)) <= 1 and ("scwin." + g) not in body]
    tok = {}
    for k, (pat, on_code) in TOKENS.items():
        n = len(re.findall(pat, code if on_code else script, re.M))
        if n:
            tok[k] = n
    res["tokens"] = tok
    # refs_missing(스크립트가 쥐는데 body 에 없는 id — 서버 렌더 hidden·동적 조립, 공급사 README 「화면에 없는 필드」 221자리)은
    # 실패가 아니라 Stage 2 명부다 — 결과에 남겨 집계한다
    bad |= bool(res["dup_defs"] or res["public_only"] or res["defined_only"] or res["handlers_undefined"]
                or res["undefined_c"] or res["unused_globals"]
                or any(k in tok for k in FAIL_TOKENS))
    return not bad, res


def print_result(ok, r):
    print("=== %s ===" % r["name"])
    if "fatal" in r:
        print("  FATAL:", r["fatal"]); return
    if "node" in r:
        print("  node --check:", r["node"])
    print("  dup defs:", r["dup_defs"])
    print("  publicInfo-only:", r["public_only"], "| defined-only:", r["defined_only"])
    print("  handlers not defined:", r["handlers_undefined"])
    print("  comp refs not in body/head:", r["refs_missing"])
    print("  undefined $c:", r["undefined_c"], ("| todo $c: %s" % r["todo_c"]) if r.get("todo_c") else "")
    print("  unused globals:", r["unused_globals"])
    print("  tokens:", r["tokens"])
    print("  GATE:", "OK" if ok else "FAIL")


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    files, fl, op = st.parse_cli(argv if argv is not None else sys.argv[1:], flags=("--no-node",), opts=("--pcc",))
    if not files:
        print(__doc__); return 2
    cache = {}
    ok_all = True
    for f in files:
        pcc = op["--pcc"] or st.pcc_for(f)
        if pcc not in cache:
            cache[pcc] = st.common_inventory(pcc)
        ok, r = gate_file(f, cache[pcc], node=not fl["--no-node"])
        print_result(ok, r)
        ok_all &= ok
    print("ALL GATES:", "OK" if ok_all else "FAIL")
    return 0 if ok_all else 1


if __name__ == "__main__":
    sys.exit(main())
