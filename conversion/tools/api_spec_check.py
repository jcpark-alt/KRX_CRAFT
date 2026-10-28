# -*- coding: utf-8 -*-
"""신규 API 명세(`{화면ID}_API.txt` 또는 `{화면ID}_API.md`) ↔ TO-BE 화면 통신 대조 게이트.

    python conversion/tools/api_spec_check.py [--spec <API.txt|API.md>] [--allow-unused <path,...>] [--no-context-path] <TO-BE xml> ...

업무 분석 가이드(conversion/md/websquare_gfm_conversion.md §5 「API 명세 적용」) 의 "API 명세가 있으면 그 API 로 바꾼다" 를 검사한다.
--spec 을 생략하면 TO-BE 파일명의 화면ID 로 `../ui/{화면ID}/{화면ID}_API.{txt,md}`(conversion-front 화면별 폴더 배치),
`../ui/{화면ID}_API.{txt,md}`, 같은 폴더의 `{화면ID}_API.{txt,md}` 를 차례로 찾는다(같은 자리면 txt 우선).
명세가 없으면 명세 대조를 건너뛴다(SKIP — A07·A08 형식 검사만, FAIL 없으면 종료 코드 0).

명세 형식 1 — txt (블록 반복):
    [화면ID][업무][제목]
    GET|POST|PUT|DELETE|PATCH /api/...
    REQUEST
        키 …  또는  <w2:dataMap>/<w2:dataList> 정의
    RESPONSE
        …

명세 형식 2 — md (블록 반복, 2026-10-27):
    ## 1. [화면ID][업무][제목]                       ← `#` 머리글(번호 생략 가능)이 블록 시작
    *   **AS-IS** : `GET /api/....do`               ← AS-IS 줄은 대조하지 않는다
    *   **TO-BE** : `GET /api/...`                  ← TO-BE 줄의 method·경로
    **[REQUEST]** / **[RESPONSE]** …               ← 코드 블록 안 내용은 블록 머리로 보지 않는다
  TO-BE 줄이 없으면 블록 안 첫 `GET|POST… /경로`(백틱·목록 기호 허용, `.do` 제외)를 쓴다.
  executeDynamic 옵션 ref·target 은 [REQUEST] 아래 `{ ref: "", target: "…" }` 코드 블록으로 적는다(이 게이트는 읽지 않는다).

검사 (화면마다):
  A01 FAIL  TO-BE 의 executeDynamic action 이 명세에 없는 경로
  A02 FAIL  같은 경로인데 method 가 명세와 다름
  A03 FAIL  이 화면ID 의 명세 API 를 TO-BE 가 부르지 않음 (--allow-unused 로 낮춤)
  A04 FAIL  스크립트 코드에 AS-IS 서버 URL(`*.do`) 이 남음
  A05 WARN  action·saveUrl·listUrl 을 정적으로 풀 수 없음(변수만으로 조립) — 리뷰
  A06 INFO  다른 화면ID 블록(부모·형제 화면용) — 이 화면 대상 아님
            (블록 머리가 `[ULDSTF05710/ULDSTF05801]` 처럼 `/` 로 묶은 여러 화면ID 면, 그중에 이 화면이 있으면 이 화면 대상)
  A07 FAIL  action·saveUrl·listUrl 이 전체 경로 리터럴이 아님 — 전역 변수(`scwin.*`) 조립·`+` 이어 붙이기·상대 경로
            (규칙 38. 분기는 가지마다 전체 경로 리터럴이면 통과, saveUrl·listUrl 의 `$c.sbm.getContextPath() +` 접두는 허용.
             명세가 없어도 이 형식 검사는 돈다)
  A08 FAIL  action·saveUrl·listUrl 에 `$c.sbm.getContextPath()` 가 붙음 (규칙 39 — conversion-front 전용.
            파일 경로에 `conversion-front` 가 있으면 자동, 그 밖은 --no-context-path 로 켠다. contextRoot "/" 라 UDC 는 "//api/…" 가 된다)
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
# 화면ID 는 하나(`[ULDSTF05621]`) 또는 `/` 로 묶은 여러 개(`[ULDSTF05710/ULDSTF05801]` — 여러 화면이 같이 쓰는 API)
BLOCK_HEAD = re.compile(r"^\s*\[([A-Za-z0-9_]+(?:\s*/\s*[A-Za-z0-9_]+)*)\]")
# md 명세: `## 1. [화면ID][…]` 머리글, `* **TO-BE** : `GET /api/…`` 줄
MD_BLOCK_HEAD = re.compile(r"^\s*#{1,6}\s*(?:\d+[.)]\s*)?\[([A-Za-z0-9_]+(?:\s*/\s*[A-Za-z0-9_]+)*)\]")
MD_TOBE_LINE = re.compile(r"TO-?BE\W*?:?\s*`?\s*(GET|POST|PUT|DELETE|PATCH)\s+([^`\s]+)", re.I)
MD_METHOD_LINE = re.compile(r"^\s*(?:[*-]\s+)?`?\s*(GET|POST|PUT|DELETE|PATCH)\s+(/[^`\s]+)", re.I)
SCREEN_ID = re.compile(r"([A-Za-z]{3}[A-Za-z0-9]*?\d{5}[A-Za-z0-9_]*)")


def screens_of(api):
    """블록 머리의 화면ID 목록 — `[A/B]` 묶음이면 둘 다."""
    return [s.strip() for s in api["screen"].split("/") if s.strip()]


def parse_spec(text, fmt=None):
    """명세 텍스트 → [{screen, title, method, path}] (블록 순서대로). fmt: "txt"|"md"|None(내용으로 판별)."""
    if fmt is None:
        fmt = "md" if any(MD_BLOCK_HEAD.match(l) for l in text.split("\n")) else "txt"
    if fmt == "md":
        return _parse_spec_md(text)
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


def _value_expr(expr):
    """`action : …` 뒤 한 줄에서 값 식만 — 문자열·괄호 밖의 첫 `,`·`}`·`;` 앞까지."""
    depth, quote, i = 0, None, 0
    while i < len(expr):
        ch = expr[i]
        if quote:
            if ch == "\\":
                i += 1
            elif ch == quote:
                quote = None
        elif ch in "\"'`":
            quote = ch
        elif ch in "([":
            depth += 1
        elif ch in ")]":
            if depth == 0:
                break
            depth -= 1
        elif ch in ",};" and depth == 0:
            break
        i += 1
    return expr[:i].strip()


def _top_level_plus(expr):
    depth, quote, i = 0, None, 0
    while i < len(expr):
        ch = expr[i]
        if quote:
            if ch == "\\":
                i += 1
            elif ch == quote:
                quote = None
        elif ch in "\"'`":
            quote = ch
        elif ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        elif ch == "+" and depth == 0:
            return True
        i += 1
    return False


def full_path_problem(key, expr):
    """규칙 38 — 전체 경로 리터럴이 아니면 사유 문자열, 맞으면 None."""
    e = expr.strip()
    if key != "action":
        e = re.sub(r"^\$c\.sbm\.getContextPath\(\)\s*\+\s*", "", e)
    # 괄호·문자열 밖의 `+` = 이어 붙이기(`scwin.API + (c ? "a" : "b")` 도 여기서 걸린다)
    if _top_level_plus(e):
        return "전역 변수 조립" if "scwin." in e else "`+` 이어 붙이기"
    # 삼항이면 조건은 보지 않고 가지(값)만 본다
    branches = re.split(r"\s[?:]\s", e.split("?", 1)[1]) if "?" in e else [e]
    for b in branches:
        b = b.strip().strip("()").strip()
        if "scwin." in b:
            return "전역 변수 사용"
        m = re.fullmatch(r"\"([^\"]*)\"|'([^']*)'", b)
        if not m:
            return None     # 지역 변수·함수 인자 — 정적으로 못 풀면 A05(WARN) 몫
        lit = m.group(1) if m.group(1) is not None else m.group(2)
        if not lit.startswith("/"):
            return "상대 경로"
    return None


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
        key, line = am.group(1), am.group(2)
        # 여러 줄 식 — 다음 줄이 `?`·`:`·`+` 로 시작하거나 이번 줄이 그것으로 끝나면 이어 붙인다
        pos = am.end()
        while True:
            nl = code.find("\n", pos)
            if nl < 0:
                break
            nxt_end = code.find("\n", nl + 1)
            nxt = code[nl + 1:nxt_end if nxt_end >= 0 else len(code)]
            if not (nxt.strip().startswith(("?", ":", "+")) or line.rstrip().endswith(("?", ":", "+"))) or not nxt.strip():
                break
            line = line.rstrip() + " " + nxt.strip()
            pos = nxt_end if nxt_end >= 0 else len(code)
        expr = _value_expr(line)
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
            "key": key,
            "form": full_path_problem(key, expr),
        })
    return out


def _parse_spec_md(text):
    """md 명세 → [{screen, title, method, path}]. 블록 머리는 `#` 머리글만(코드 블록 안 `[` 줄과 섞이지 않게)."""
    apis = []
    cur = None
    fallback = None
    for line in text.replace("\r\n", "\n").split("\n"):
        h = MD_BLOCK_HEAD.match(line)
        if h:
            if cur is not None and cur["path"] is None and fallback:
                cur["method"], cur["path"] = fallback
            cur = {"screen": h.group(1), "title": line.strip().lstrip("#").strip(), "method": None, "path": None}
            fallback = None
            apis.append(cur)
            continue
        if cur is None or cur["path"] is not None:
            continue
        m = MD_TOBE_LINE.search(line)
        if m:
            cur["method"], cur["path"] = m.group(1).upper(), m.group(2)
            continue
        if fallback is None and "AS-IS" not in line.upper():
            m = MD_METHOD_LINE.match(line)
            if m and not m.group(2).split("?")[0].endswith(".do"):
                fallback = (m.group(1).upper(), m.group(2))
    if cur is not None and cur["path"] is None and fallback:
        cur["method"], cur["path"] = fallback
    return [a for a in apis if a["path"]]


def find_spec(xml_path):
    p = Path(xml_path)
    sid = SCREEN_ID.match(p.stem)
    sid = sid.group(1) if sid else p.stem
    for base in (p.parent.parent / "ui" / sid,    # conversion-front 화면별 폴더 배치
                 p.parent.parent / "ui",
                 p.parent):
        for ext in ("txt", "md"):
            cand = base / f"{sid}_API.{ext}"
            if cand.is_file():
                return cand, sid
    return None, sid


def check(xml_path, spec_path=None, allow_unused=(), no_context_path=False):
    """→ (fails, warns, infos, spec_path) — 각 항목은 (코드, 메시지)."""
    sid = Path(xml_path).stem
    _raw, _eol, reg = st.read_xml(xml_path)
    script = reg["script"] if reg else ""
    actions = extract_actions(script)
    # 규칙 39(conversion-front): getContextPath 접두 금지 — 접두는 A08 로만 알리고 A07 은 접두를 뗀 식으로 본다
    no_ctx = no_context_path or "conversion-front" in Path(xml_path).resolve().as_posix()
    form_fails = []
    for a in actions:
        prob = a["form"]
        if no_ctx and "getContextPath" in a["raw"]:
            form_fails.append(("A08", f"L{a['line']} {a['key']} 에 getContextPath() 가 붙음: {a['raw']} — 규칙 39(접두 없이 전체 경로)"))
            prob = full_path_problem("saveUrl", a["raw"])
        if prob:
            form_fails.append(("A07", f"L{a['line']} {a['key']} 이 전체 경로 리터럴이 아님({prob}): {a['raw']} — 규칙 38"))

    if spec_path is None:
        spec_path, sid = find_spec(xml_path)
    if spec_path is None:
        return form_fails, [], [("SKIP", f"API 명세 없음({sid}_API.txt|md) — 명세 대조 생략(A07·A08 형식 검사만)")], None

    apis = parse_spec(io.open(spec_path, encoding="utf-8-sig").read(),
                      "md" if Path(spec_path).suffix.lower() == ".md" else "txt")
    mine = [a for a in apis if sid in screens_of(a)]
    others = [a for a in apis if sid not in screens_of(a)]

    fails, warns, infos = list(form_fails), [], []
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
    no_ctx = False
    files = []
    i = 0
    while i < len(argv):
        if argv[i] == "--spec":
            spec = Path(argv[i + 1]); i += 2
        elif argv[i] == "--no-context-path":
            no_ctx = True; i += 1
        elif argv[i] == "--allow-unused":
            allow = tuple(x.strip() for x in argv[i + 1].split(",") if x.strip()); i += 2
        else:
            files.append(argv[i]); i += 1
    if not files:
        print(__doc__)
        return 2

    total = 0
    for f in files:
        fails, warns, infos, sp = check(f, spec, allow, no_ctx)
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
