# -*- coding: utf-8 -*-
"""신규 API 명세(`{화면ID}_API.txt`) ↔ TO-BE 화면 통신 대조 게이트.

    python conversion/tools/api_spec_check.py [--spec <API.txt>] [--allow-unused <path,...>] <TO-BE xml> ...

업무 분석 가이드(conversion/md/websquare_gfm_conversion.md §5 「API 명세 적용」) 의 "API 명세가 있으면 그 API 로 바꾼다" 를 검사한다.
--spec 을 생략하면 TO-BE 파일명의 화면ID 로 `../ui/{화면ID}/{화면ID}_API.txt`(gfm-front 화면별 폴더 배치),
`../ui/{화면ID}_API.txt`, 같은 폴더의 `{화면ID}_API.txt` 를 차례로 찾는다. 명세가 없으면 검사를 건너뛴다(SKIP, 종료 코드 0).

명세 형식 (블록 반복):
    [화면ID][업무][제목]
    GET|POST|PUT|DELETE|PATCH /api/...
    REQUEST
        키 …  또는  <w2:dataMap>/<w2:dataList> 정의
    RESPONSE
        …

검사 (화면마다):
  A01 FAIL  TO-BE 의 executeDynamic action 이 명세에 없는 경로
  A02 FAIL  같은 경로인데 method 가 명세와 다름
  A03 FAIL  이 화면ID 의 명세 API 를 TO-BE 가 부르지 않음 (--allow-unused 로 낮춤)
  A04 FAIL  스크립트 코드에 AS-IS 서버 URL(`*.do`) 이 남음
  A05 WARN  action·saveUrl·listUrl 을 정적으로 풀 수 없음(변수만으로 조립) — 리뷰
  A06 INFO  다른 화면ID 블록(부모·형제 화면용) — 이 화면 대상 아님
action 해석: `action : "…"`, `action : scwin.API + "…"`, `scwin.API + (조건 ? "a" : "b")` 처럼 한 줄 안의 문자열 리터럴을
모두 후보로 보고, `scwin.API` 가 있으면 `scwin.API = "…"` 값을 앞에 붙인다.
종료 코드: FAIL 0건이면 0, 하나라도 있으면 1.
"""
import io
import os
import re
import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE))
import screen_tools as st  # noqa: E402

METHOD_LINE = re.compile(r"^\s*(GET|POST|PUT|DELETE|PATCH)\s+(\S+)", re.I)
BLOCK_HEAD = re.compile(r"^\s*\[([A-Za-z0-9_]+)\]")
SCREEN_ID = re.compile(r"([A-Za-z]{3}[A-Za-z0-9]*?\d{5}[A-Za-z0-9_]*)")


def parse_spec(text):
    """명세 텍스트 → [{screen, title, method, path}] (블록 순서대로)."""
    apis = []
    cur = None
    for line in text.replace("\r\n", "\n").split("\n"):
        h = BLOCK_HEAD.match(line)
        if h:
            cur = {"screen": h.group(1), "title": line.strip(), "method": None, "path": None}
            apis.append(cur)
            continue
        m = METHOD_LINE.match(line)
        if m and cur is not None and cur["path"] is None:
            cur["method"] = m.group(1).upper()
            cur["path"] = m.group(2)
    return [a for a in apis if a["path"]]


def _option_object(script, pos):
    """pos 를 감싸는 가장 가까운 `{ … }` (옵션 객체) 의 본문."""
    s = script.rfind("{", 0, pos)
    e = script.find("}", pos)
    return script[s if s >= 0 else 0:e if e >= 0 else len(script)]


def extract_actions(script):
    """스크립트 → [{line, paths, method, raw}] — executeDynamic 옵션의 action."""
    code = st.without_comments(script)
    api_base = ""
    m = re.search(r'scwin\.API\s*=\s*"([^"]*)"', code)
    if m:
        api_base = m.group(1)
    out = []
    # executeDynamic 의 action 외에 UDC 일괄 저장(bulkFileSaver)의 saveUrl(POST)·listUrl(GET)도 서버 호출이다.
    for am in re.finditer(r"\b(action|saveUrl|listUrl)\s*:\s*([^\n,][^\n]*)", code):
        key, expr = am.group(1), am.group(2)
        # 조건식의 비교값(`trJob === "I" ? … : …` 의 "I")은 경로 조각이 아니다.
        lits = re.findall(r'"([^"]*)"', re.sub(r'(?:[!=]==?|[<>]=?)\s*"[^"]*"', "", expr))
        uses_base = "scwin.API" in expr
        paths = [(api_base + lit) if uses_base else lit for lit in lits]
        if key == "action":
            mm = re.search(r'\bmethod\s*:\s*"(\w+)"', _option_object(code, am.start()))
            method = mm.group(1).upper() if mm else "POST"       # executeDynamic 기본 method 는 post
        else:
            method = "POST" if key == "saveUrl" else "GET"       # bulkFileSaver: save 는 XHR POST, loadList 는 GET
        out.append({
            "line": code.count("\n", 0, am.start()) + 1,
            "paths": paths,
            "method": method,
            "raw": expr.strip().rstrip(","),
        })
    return out


def find_spec(xml_path):
    p = Path(xml_path)
    sid = SCREEN_ID.match(p.stem)
    sid = sid.group(1) if sid else p.stem
    for cand in (p.parent.parent / "ui" / sid / f"{sid}_API.txt",   # gfm-front 화면별 폴더 배치
                 p.parent.parent / "ui" / f"{sid}_API.txt",
                 p.parent / f"{sid}_API.txt"):
        if cand.is_file():
            return cand, sid
    return None, sid


def check(xml_path, spec_path=None, allow_unused=()):
    """→ (fails, warns, infos, spec_path) — 각 항목은 (코드, 메시지)."""
    sid = Path(xml_path).stem
    if spec_path is None:
        spec_path, sid = find_spec(xml_path)
    if spec_path is None:
        return [], [], [("SKIP", f"API 명세 없음({sid}_API.txt) — 검사 생략")], None

    apis = parse_spec(io.open(spec_path, encoding="utf-8-sig").read())
    mine = [a for a in apis if a["screen"] == sid]
    others = [a for a in apis if a["screen"] != sid]

    _raw, _eol, reg = st.read_xml(xml_path)
    script = reg["script"] if reg else ""
    actions = extract_actions(script)

    fails, warns, infos = [], [], []
    by_path = {}
    for a in apis:
        by_path.setdefault(a["path"], []).append(a)
    used = set()

    for act in actions:
        cands = [p for p in act["paths"] if p.startswith("/")]
        if not cands:
            warns.append(("A05", f"L{act['line']} action 을 정적으로 풀 수 없음: {act['raw']}"))
            continue
        for path in cands:
            spec = by_path.get(path)
            if not spec:
                fails.append(("A01", f"L{act['line']} 명세에 없는 API: {act['method']} {path}"))
                continue
            used.add(path)
            if all(s["method"] != act["method"] for s in spec):
                fails.append(("A02", f"L{act['line']} method 불일치: {path} — TO-BE {act['method']}, 명세 {spec[0]['method']}"))

    for a in mine:
        if a["path"] not in used:
            entry = ("A03", f"명세 API 를 부르지 않음: {a['method']} {a['path']} — {a['title']}")
            (warns if a["path"] in allow_unused else fails).append(entry)

    code = st.code_only(script)
    for dm in re.finditer(r'"[^"\n]*\.do\b[^"\n]*"', st.without_comments(script)):
        if code[dm.start() + 1:dm.end() - 1].strip() == "":   # 문자열 리터럴 안(=코드가 아님)
            line = script.count("\n", 0, dm.start()) + 1
            fails.append(("A04", f"L{line} AS-IS 서버 URL 이 남음: {dm.group(0)}"))

    for a in others:
        infos.append(("A06", f"다른 화면 대상: [{a['screen']}] {a['method']} {a['path']}"))
    return fails, warns, infos, spec_path


def main(argv):
    spec = None
    allow = ()
    files = []
    i = 0
    while i < len(argv):
        if argv[i] == "--spec":
            spec = Path(argv[i + 1]); i += 2
        elif argv[i] == "--allow-unused":
            allow = tuple(x.strip() for x in argv[i + 1].split(",") if x.strip()); i += 2
        else:
            files.append(argv[i]); i += 1
    if not files:
        print(__doc__)
        return 2

    total = 0
    for f in files:
        fails, warns, infos, sp = check(f, spec, allow)
        print(f"== {f}" + (f"  (spec: {sp})" if sp else ""))
        for code, msg in fails:
            print(f"  FAIL {code} {msg}")
        for code, msg in warns:
            print(f"  WARN {code} {msg}")
        for code, msg in infos:
            print(f"  {code if code == 'SKIP' else 'INFO ' + code} {msg}")
        print("  API SPEC: " + ("FAIL" if fails else "OK"))
        total += len(fails)
    print("ALL API SPEC CHECKS: " + ("FAIL" if total else "OK"))
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
