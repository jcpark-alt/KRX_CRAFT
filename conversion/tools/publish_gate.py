# -*- coding: utf-8 -*-
"""퍼블리싱 XML 생성 하네스 게이트 — AI/수작업으로 퍼블리싱을 반영한 화면이 통과해야 하는 검사 묶음.

    python conversion/tools/publish_gate.py [--rev <git-rev> | --before <xml>] [--pcc fil|stf|mgt|tms]
                                            [--host <xml> ...] [--allow P12,P20] [--no-node] [--no-lint] [--no-gate] <xml> ...

근거: conversion/md/report/publishing_model_detailed_report.html §7(하네스 & Skills) — 규칙 원문은
.claude/skills/websquare-publishing/SKILL.md. 검사 단계(화면마다):

  [1] lint      python -m wsxml_lint <xml>                       — 오류·경고 0
  [2] gate      gate_screen.gate_file                            — 구문·핸들러·id 참조·미정의 $c·레거시 토큰
  [3] markup    P01 colgroup 열 수 = 행의 실제 칸 수(colspan/rowspan 점유 격자)
                P02 속성명 대소문자(readonly → readOnly)
                P03 tabControl 탭 본문에 contentHeader 금지(host 의 w2:content>pageFrame src 로 판정)
                P04 body 의 class 가 cm/css/*.css 에 정의 없음 — 경고(화면 효과 없는 class·오타 감지,
                    스크립트 훅 class 처럼 의도된 것이면 리뷰 후 그대로 둔다)
  [4] preserve  (--rev/--before 가 있을 때) 작업 전 대비
                P10 ref 바인딩 누락 · P11 ev:on* 핸들러 누락 · P12 라벨 텍스트 누락 — 실패
                P13 컴포넌트 id 누락 — 경고
  [5] scope     (--rev/--before 가 있을 때) 참조 외 코드 삽입 감지
                P20 scwin 함수 추가·삭제 — 실패(퍼블리싱은 로직을 바꾸지 않는다)
                P21 head 에 외부 script/style/link 추가 — 실패
                P22 스크립트 본문 변경 · P23 새 요소 종류 · ref/핸들러 추가 — 경고(리뷰 대상)

--rev 는 각 파일의 같은 경로를 git 에서 꺼내 비교한다(예: --rev HEAD, --rev 91ff2e6b^).
--before 는 단일 파일일 때 비교 대상 파일을 직접 준다.
탭 본문 판정은 같은 폴더의 XML 과 --host 로 준 파일을 host 후보로 본다.
--allow 는 요청자가 승인한 변경(예: 캡처 문구대로 라벨 교체 → P12, 로직 변경 승인 → P11,P20)의 실패를
경고("허용")로 낮춘다. 근거 없이 쓰지 않는다 — 허용한 코드는 결과에 그대로 남는다.
종료 코드: 실패 0건이면 0(경고는 허용), 하나라도 실패면 1.
"""
import os
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

from lxml import etree

_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE))
import screen_tools as st  # noqa: E402

NS = {"xf": "http://www.w3.org/2002/xforms", "w2": "http://www.inswave.com/websquare",
      "ev": "http://www.w3.org/2001/xml-events", "h": "http://www.w3.org/1999/xhtml"}
EV_NS = "{%s}" % NS["ev"]
W2 = "{%s}" % NS["w2"]
XF = "{%s}" % NS["xf"]
# 소문자로 잘못 쓰면 엔진이 무시하는 속성명 → 올바른 표기(정비 이력 91ff2e6b readonly→readOnly)
ATTR_CASE = {"readonly": "readOnly"}
FN_DEF_RE = re.compile(r'^\s*scwin\.([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function\b', re.M)
CONTENT_HEADER_RE = re.compile(r'contentHeader\.xml$', re.I)
# P23(새 요소 종류)에서 빼는 레이아웃·표 마크업 — 퍼블리싱 재배치로 늘어나는 게 정상인 요소
LAYOUT_KINDS = {"group", "attributes", "summary", "scope", "colspan", "rowspan", "caption", "textbox", "label"}
MARKUP_CODES = ("P01", "P02", "P03")
CSS_DIR = st.ROOT / "cm" / "css"
CSS_CLASS_RE = re.compile(r'\.(-?[A-Za-z_][\w-]*)')
_CSS_CACHE = {}
PRESERVE_CODES = ("P10", "P11", "P12", "P20", "P21")


# ---------------------------------------------------------------- 파싱
def parse(text):
    parser = etree.XMLParser(remove_blank_text=False, recover=False, huge_tree=True)
    return etree.fromstring(text.encode("utf-8"), parser)


def read_text(path):
    return open(path, "rb").read().decode("utf-8").replace("\r\n", "\n")


def git_show(rev, path):
    rel = Path(path).resolve().relative_to(st.ROOT).as_posix()
    r = subprocess.run(["git", "show", "%s:%s" % (rev, rel)], cwd=str(st.ROOT), capture_output=True)
    if r.returncode != 0:
        return None
    return r.stdout.decode("utf-8").replace("\r\n", "\n")


def tagname(el):
    return el.get("tagname") if el.tag == XF + "group" else None


def _attr_int(cell, name):
    v = cell.find("w2:attributes/w2:%s" % name, NS)
    try:
        return max(1, int((v.text or "1").strip())) if v is not None else 1
    except ValueError:
        return 1


def script_text(root):
    return "\n".join(s.text or "" for s in root.iter("{%s}script" % NS["h"], "script") if s.get("src") is None)


# ---------------------------------------------------------------- [3] markup
def _own_rows(table):
    """table 에 속한 tr — 중첩 table 안의 tr 은 제외(thead/tbody 그룹은 통과)."""
    rows = []

    def walk(el):
        for ch in el:
            tn = tagname(ch)
            if tn == "table":
                continue
            if tn == "tr":
                rows.append(ch)
            else:
                walk(ch)
    walk(table)
    return rows


def _col_count(table):
    """(직속 col 수, colgroup 안에서 다른 그룹에 싸인 col 수) — 싸인 col 은 브라우저가 적용하지 않는다."""
    for ch in table:
        if tagname(ch) == "colgroup":
            direct = sum(_attr_int(c, "span") for c in ch if tagname(c) == "col")
            wrapped = sum(1 for c in ch.iter(XF + "group") if tagname(c) == "col") - sum(1 for c in ch if tagname(c) == "col")
            return direct, wrapped
    return None


HIDDEN_RE = re.compile(r'display\s*:\s*none', re.I)


def row_widths(table, skip_hidden=False):
    """rowspan 까지 반영한 점유 격자로 각 행의 실제 칸 수를 센다(skip_hidden: display:none 칸 제외)."""
    occupied = {}  # (row, col) → True
    widths = []
    for r, tr in enumerate(_own_rows(table)):
        c = 0
        for cell in tr:
            if tagname(cell) not in ("th", "td"):
                continue
            if skip_hidden and HIDDEN_RE.search(cell.get("style") or ""):
                continue
            while occupied.get((r, c)):
                c += 1
            cs, rs = _attr_int(cell, "colspan"), _attr_int(cell, "rowspan")
            for dr in range(rs):
                for dc in range(cs):
                    occupied[(r + dr, c + dc)] = True
            c += cs
        width = max([cc + 1 for (rr, cc) in occupied if rr == r] or [0])
        widths.append((tr.sourceline, width))
    return widths


def check_colgroup(root):
    """P01 — (실패 목록, 경고 목록). 숨김(display:none) 칸을 빼면 맞는 표는 토글 구조로 보고 경고만 낸다."""
    fails, warns = [], []
    for table in root.iter(XF + "group"):
        if tagname(table) != "table":
            continue
        cc = _col_count(table)
        if cc is None:
            continue
        cols, wrapped = cc
        rows = list(zip(row_widths(table), row_widths(table, skip_hidden=True)))
        bad = [(ln, w) for (ln, w), _ in rows if w and w != cols]
        if not bad:
            continue
        # 전체 칸 또는 보이는 칸 중 하나가 맞으면 토글(숨김 칸 교대) 구조 — 경고만
        hard = [ln for (ln, w), (_, v) in rows if w and w != cols and v != cols]
        summ = table.find("w2:attributes/w2:summary", NS)
        name = (summ.text or "").strip() if summ is not None else (table.get("id") or "")
        msg = "P01 L%d table[%s] colgroup %d열 ≠ 실제 칸 %s" % (
            table.sourceline, name, cols, ", ".join("L%d:%d" % b for b in bad[:4]) + (" …" if len(bad) > 4 else ""))
        if wrapped:
            msg += " (colgroup 안 col %d개가 다른 그룹에 싸여 적용 안 됨)" % wrapped
        if not hard:
            warns.append(msg + " — 숨김(display:none) 칸 포함 시에만 불일치, 토글 구조 확인")
        else:
            fails.append(msg)
    return fails, warns


def check_attr_case(root):
    fails = []
    for el in root.iter():
        if not isinstance(el.tag, str):
            continue
        for a in el.attrib:
            if a in ATTR_CASE:
                fails.append("P02 L%d %s 속성 '%s' → '%s'" % (el.sourceline, etree.QName(el).localname, a, ATTR_CASE[a]))
    return fails


def tab_body_names(hosts):
    """host 후보 XML 들의 tabControl 안 pageFrame src 파일명 집합."""
    names = set()
    for h in hosts:
        try:
            root = parse(read_text(h))
        except (OSError, etree.XMLSyntaxError, UnicodeDecodeError):
            continue
        for tc in root.iter(W2 + "tabControl"):
            for pf in tc.iter(W2 + "pageFrame"):
                src = pf.get("src") or ""
                if src:
                    names.add(os.path.basename(src).lower())
    return names


def check_tab_content_header(root, path, tab_bodies):
    if os.path.basename(path).lower() not in tab_bodies:
        return []
    return ["P03 L%d 탭 본문에 contentHeader(%s) — tabControl 탭 본문은 넣지 않음" % (pf.sourceline, pf.get("id") or "")
            for pf in root.iter(W2 + "pageFrame") if CONTENT_HEADER_RE.search(pf.get("src") or "")]


def css_classes(css_dir=CSS_DIR):
    """css_dir 의 *.css 에서 선택자로 쓰인 class 이름 집합(주석 제외). 폴더가 없으면 None(검사 생략)."""
    key = str(css_dir)
    if key not in _CSS_CACHE:
        files = sorted(Path(css_dir).glob("*.css")) if Path(css_dir).is_dir() else []
        if not files:
            _CSS_CACHE[key] = None
        else:
            text = "".join(f.read_text(encoding="utf-8", errors="replace") for f in files)
            _CSS_CACHE[key] = set(CSS_CLASS_RE.findall(re.sub(r'/\*.*?\*/', "", text, flags=re.S)))
    return _CSS_CACHE[key]


def check_css_classes(root, defined=None):
    """P04 — body 요소의 class 중 CSS 정의가 없는 것(경고). class 마다 한 줄, 줄 번호를 모아 보인다."""
    defined = css_classes() if defined is None else defined
    body = root.find("h:body", NS)
    if defined is None or body is None:
        return []
    lines = {}
    for el in body.iter():
        if not isinstance(el.tag, str):
            continue
        for c in (el.get("class") or "").split():
            if c not in defined:
                lines.setdefault(c, []).append(el.sourceline)
    return ["P04 class '%s' — cm/css 에 정의 없음(화면 효과 없음) %s" % (
        c, ", ".join("L%d" % ln for ln in ls[:6]) + (" …(+%d)" % (len(ls) - 6) if len(ls) > 6 else ""))
        for c, ls in sorted(lines.items())]


# ---------------------------------------------------------------- [4][5] 작업 전 대비
def inventory(root):
    refs, handlers, labels, ids, kinds, ext = Counter(), Counter(), Counter(), set(), set(), []
    body = root.find("h:body", NS)
    head = root.find("h:head", NS)
    for el in root.iter():
        if not isinstance(el.tag, str):
            continue
        for a, v in el.attrib.items():
            if a.startswith(EV_NS) and v.strip():
                handlers[v.strip()] += 1
    if body is not None:
        for el in body.iter():
            if not isinstance(el.tag, str):
                continue
            kinds.add(etree.QName(el).localname if el.tag.startswith(XF) or el.tag.startswith(W2) else el.tag)
            if el.get("ref"):
                refs[el.get("ref")] += 1
            if el.get("id"):
                ids.add(el.get("id"))
            lb = el.get("label")
            if lb and lb.strip():
                labels[lb.strip()] += 1
            if el.tag == XF + "label" and (el.text or "").strip():
                labels[el.text.strip()] += 1
            if el.tag == W2 + "column" and el.getparent() is not None and el.get("value"):
                if any(a.tag == W2 + "header" for a in el.iterancestors()):
                    labels[el.get("value").strip()] += 1
    if head is not None:
        for el in head.iter():
            if not isinstance(el.tag, str):
                continue
            ln = etree.QName(el).localname
            if (ln == "script" and el.get("src")) or ln in ("link", "style"):
                ext.append(el.get("src") or el.get("href") or ln)
    return {"refs": refs, "handlers": handlers, "labels": labels, "ids": ids, "kinds": kinds,
            "ext": ext, "fns": set(FN_DEF_RE.findall(script_text(root))), "script": script_text(root)}


def _missing(before, after):
    return sorted(k for k in before if after[k] < before[k])


def _added(before, after):
    return sorted(k for k in after if after[k] > before[k])


def _fmt(items, n=6):
    items = list(items)
    return ", ".join(items[:n]) + (" … (+%d)" % (len(items) - n) if len(items) > n else "")


def compare(before_root, after_root):
    b, a = inventory(before_root), inventory(after_root)
    fails, warns = [], []
    for code, key, what in (("P10", "refs", "ref 바인딩"), ("P11", "handlers", "ev:on* 핸들러"), ("P12", "labels", "라벨")):
        miss = _missing(b[key], a[key])
        if miss:
            fails.append("%s %s 누락 %d: %s" % (code, what, len(miss), _fmt(miss)))
    lost_ids = sorted(b["ids"] - a["ids"])
    if lost_ids:
        warns.append("P13 컴포넌트 id 누락 %d: %s" % (len(lost_ids), _fmt(lost_ids)))
    add_fn, del_fn = sorted(a["fns"] - b["fns"]), sorted(b["fns"] - a["fns"])
    if add_fn:
        fails.append("P20 scwin 함수 추가 %d: %s" % (len(add_fn), _fmt(add_fn)))
    if del_fn:
        fails.append("P20 scwin 함수 삭제 %d: %s" % (len(del_fn), _fmt(del_fn)))
    new_ext = [x for x in a["ext"] if x not in b["ext"]]
    if new_ext:
        fails.append("P21 head 외부 리소스 추가: %s" % _fmt(new_ext))
    norm = lambda s: re.sub(r'\s+', ' ', s).strip()  # noqa: E731
    if norm(a["script"]) != norm(b["script"]):
        warns.append("P22 스크립트 본문 변경 — 퍼블리싱 범위인지 리뷰")
    new_kinds = sorted(a["kinds"] - b["kinds"] - LAYOUT_KINDS)
    if new_kinds:
        warns.append("P23 새 요소 종류: %s" % _fmt(new_kinds))
    for key, what in (("refs", "ref 바인딩"), ("handlers", "ev:on* 핸들러")):
        add = _added(b[key], a[key])
        if add:
            warns.append("P24 %s 추가 %d: %s" % (what, len(add), _fmt(add)))
    return fails, warns


# ---------------------------------------------------------------- 실행
def run_lint(path):
    r = subprocess.run([sys.executable, "-m", "wsxml_lint", str(path)], cwd=str(st.ROOT), capture_output=True,
                       env=dict(os.environ, PYTHONUTF8="1"))
    out = r.stdout.decode("utf-8", "replace").strip().splitlines()
    summary = out[-1] if out else r.stderr.decode("utf-8", "replace").strip()[-200:]
    ok = r.returncode == 0 and re.search(r'\b0 errors, 0 warnings\b', summary or "") is not None
    return ok, summary, [ln for ln in out[:-1] if ln.strip()]


def check_file(path, before_text=None, tab_bodies=(), lint=True, gate=True, node=True, pcc=None, inv_cache=None,
               allow=()):
    res = {"file": str(path), "fails": [], "warns": [], "stages": {}}
    if lint:
        ok, summary, detail = run_lint(path)
        res["stages"]["lint"] = "OK" if ok else "FAIL"
        if not ok:
            res["fails"].append("lint: %s" % summary)
            res["fails"].extend("  " + d for d in detail[:10])
    if gate:
        import gate_screen
        pcc = pcc or st.pcc_for(path)
        cache = inv_cache if inv_cache is not None else {}
        if pcc not in cache:
            cache[pcc] = st.common_inventory(pcc)
        ok, r = gate_screen.gate_file(str(path), cache[pcc], node=node)
        res["stages"]["gate"] = "OK" if ok else "FAIL"
        if not ok:
            res["fails"].append("gate_screen 실패 — python conversion/tools/gate_screen.py %s 로 상세 확인" % path)
    try:
        root = parse(read_text(path))
    except etree.XMLSyntaxError as e:
        res["fails"].append("XML 파싱 실패: %s" % e)
        return res
    cg_fails, cg_warns = check_colgroup(root)
    res["fails"].extend(cg_fails + check_attr_case(root) + check_tab_content_header(root, str(path), tab_bodies))
    res["warns"].extend(cg_warns + check_css_classes(root))
    if before_text is not None:
        f, w = compare(parse(before_text), root)
        res["fails"].extend(f)
        res["warns"].extend(w)
    if allow:
        kept = [x for x in res["fails"] if x[:3] not in allow]
        res["warns"].extend("허용 " + x for x in res["fails"] if x[:3] in allow)
        res["fails"] = kept
    if before_text is not None:
        res["stages"]["preserve/scope"] = "OK" if not any(x[:3] in PRESERVE_CODES for x in res["fails"]) else "FAIL"
    res["stages"]["markup"] = "OK" if not any(x[:3] in MARKUP_CODES for x in res["fails"]) else "FAIL"
    return res


def print_result(res):
    print("== %s" % res["file"])
    print("  stages: %s" % ", ".join("%s=%s" % kv for kv in res["stages"].items()))
    for f in res["fails"]:
        print("  FAIL  %s" % f)
    for w in res["warns"]:
        print("  WARN  %s" % w)
    print("  PUBLISH GATE: %s" % ("OK" if not res["fails"] else "FAIL"))


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    argv = list(argv if argv is not None else sys.argv[1:])
    hosts = []
    while "--host" in argv:
        i = argv.index("--host")
        hosts.append(argv[i + 1])
        del argv[i:i + 2]
    files, fl, op = st.parse_cli(argv, flags=("--no-node", "--no-lint", "--no-gate"), opts=("--pcc", "--rev", "--before", "--allow"))
    if not files:
        print(__doc__)
        return 2
    if op["--before"] and len(files) != 1:
        print("--before 는 파일 1개일 때만 쓸 수 있습니다(여러 파일은 --rev).")
        return 2
    dirs = {str(Path(f).resolve().parent) for f in files}
    cands = set(os.path.abspath(h) for h in hosts)
    for d in dirs:
        cands.update(str(p) for p in Path(d).glob("*.xml"))
    tab_bodies = tab_body_names(sorted(cands))
    allow = tuple(c.strip().upper() for c in (op["--allow"] or "").split(",") if c.strip())
    cache, ok_all = {}, True
    for f in files:
        before = None
        if op["--before"]:
            before = read_text(op["--before"])
        elif op["--rev"]:
            before = git_show(op["--rev"], f)
            if before is None:
                print("== %s\n  NOTE  %s 에 같은 경로가 없어 보존/범위 검사를 건너뜀(신규 화면)" % (f, op["--rev"]))
        res = check_file(f, before, tab_bodies, lint=not fl["--no-lint"], gate=not fl["--no-gate"],
                         node=not fl["--no-node"], pcc=op["--pcc"], inv_cache=cache, allow=allow)
        print_result(res)
        ok_all &= not res["fails"]
    print("ALL PUBLISH GATES:", "OK" if ok_all else "FAIL")
    return 0 if ok_all else 1


if __name__ == "__main__":
    sys.exit(main())
