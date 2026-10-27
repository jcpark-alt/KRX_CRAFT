# -*- coding: utf-8 -*-
"""초기화 바인딩 게이트 — 달력 검사·조회 영역 Enter 키 바인딩이 `scwin.init` 에 있는지 대조한다.

    python conversion/tools/init_binding_check.py [--warn-only] <TO-BE xml> ...

전환 규칙 22(조회 영역 Enter 키)·37(달력 init 바인딩) 의 검사 도구다. 마크업(body)에서 대상을 찾고,
스크립트의 `scwin.init`(없으면 `scwin.onpageload`) 와 그 함수가 부르는 scwin 함수(재귀) 안에 아래 호출이 있는지 본다.

  단일 달력   : $c.date.checkCalendarFormat(cal, "yyyyMMdd");
  기간 달력   : $c.date.compareFromToDate(calStart, calEnd, ["시작 명칭", "종료 명칭"]);
  조회 영역   : $c.win.setEnterKeyEvent(tbl_search, scwin.{조회 버튼}_onclick);

판정 대상
  - 달력: `w2:inputCalendar` 중 날짜형(calendarValueType 없음 또는 yearMonthDate). 시분초형 등은 INFO 로만 알린다.
  - 기간 쌍: ① 같은 부모(기간 관용구 `xf:group.flex` > 달력 + "~" + 달력)에 날짜형 달력이 정확히 2개,
            ② id 에서 시작/종료 토큰(Strt·Start·Stat·Str·Fr·From·Frm·Bgn·Begin·Beg ↔ End·To·Ed)만 다른 두 달력.
  - 조회 영역: class 에 `schbox` 가 있거나 id 가 `tbl_search`/`tbl_Search` 인 그룹 중 조회 버튼
            (`xf:trigger` class 에 `sch` 또는 id `btn_search*`/`btnSearch*`)을 가진 것. 바깥 schbox 와 안쪽 tbl_search 는 한 영역이다.

검사 (화면마다):
  B01 FAIL  단일 달력에 checkCalendarFormat 없음
  B02 FAIL  기간 쌍에 compareFromToDate 없음(또는 시작·종료 순서가 바뀜)
  B03 FAIL  조회 영역에 setEnterKeyEvent 없음(영역·하위 그룹에 id 가 없으면 id 부여 필요)
  B04 FAIL  기간 쌍 달력에 checkCalendarFormat 도 걸림 — 두 함수 모두 onviewchange 를 unbind 후 bind 하므로 나중 호출이 앞 바인딩을 지운다
  B05 WARN  setEnterKeyEvent 의 핸들러가 영역 조회 버튼의 ev:onclick 과 다름 / 조회 버튼에 ev:onclick 없음
  B06 WARN  바인딩이 init 밖(init 에서 닿지 않는 함수)에만 있음
  B07 WARN  마크업에 ev:onviewchange 가 있는 달력 — init 바인딩의 unbind 가 그 핸들러를 지운다(바인딩 콜백 안으로 옮길 것)
  B08 INFO  날짜형이 아닌 달력(검사 생략)
종료 코드: FAIL 0건이면 0(--warn-only 면 항상 0).
"""
import re
import sys
from pathlib import Path

from lxml import etree

_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE))
import screen_tools as st  # noqa: E402

W2 = "http://www.inswave.com/websquare"
XF = "http://www.w3.org/2002/xforms"
EV = "http://www.w3.org/2001/xml-events"
DATE_TYPES = ("", "yearMonthDate")

START = ("Strt", "Start", "Stat", "Str", "From", "Frm", "Fr", "Begin", "Bgn", "Beg")
END = ("End", "To", "Ed")
_TOKEN = re.compile(r"(%s)" % "|".join(sorted(START + END, key=len, reverse=True)), re.I)


def _id(el):
    return (el.get("id") or "").strip()


def _classes(el):
    return (el.get("class") or "").split()


def _role_stem(cid):
    """id → [(role, stem)] — 토큰 경계(맨 앞·'_' 뒤·대문자 시작 / 뒤는 끝·'_'·숫자·대문자)에 있는 시작·종료 토큰마다."""
    out = []
    for m in _TOKEN.finditer(cid):
        s, e = m.span()
        tok = m.group(1)
        before_ok = s == 0 or cid[s - 1] == "_" or tok[0].isupper()
        after_ok = e == len(cid) or cid[e] == "_" or cid[e].isdigit() or cid[e].isupper()
        if not (before_ok and after_ok):
            continue
        role = "start" if tok.lower() in (x.lower() for x in START) else "end"
        out.append((role, (cid[:s] + "§" + cid[e:]).lower()))
    return out


def find_calendars(root):
    """→ (date_cals[{id, el}], other_cals[id]) 문서 순서."""
    dates, others = [], []
    for el in root.iter("{%s}inputCalendar" % W2):
        cid = _id(el)
        if not cid:
            continue
        if (el.get("calendarValueType") or "") in DATE_TYPES:
            dates.append({"id": cid, "el": el})
        else:
            others.append(cid)
    return dates, others


def find_pairs(dates):
    """→ [(start_id, end_id)] — 같은 부모 2개 우선, 그다음 id 토큰."""
    pairs, used = [], set()
    by_parent = {}
    for c in dates:
        by_parent.setdefault(c["el"].getparent(), []).append(c["id"])
    for ids in by_parent.values():
        if len(ids) == 2:
            pairs.append((ids[0], ids[1]))
            used.update(ids)
    rest = [c["id"] for c in dates if c["id"] not in used]
    stems = {}
    for cid in rest:
        for role, stem in _role_stem(cid):
            stems.setdefault(stem, {}).setdefault(role, []).append(cid)
    for stem, roles in stems.items():
        s, e = roles.get("start", []), roles.get("end", [])
        if len(s) == 1 and len(e) == 1 and s[0] not in used and e[0] not in used and s[0] != e[0]:
            pairs.append((s[0], e[0]))
            used.update((s[0], e[0]))
    order = {c["id"]: i for i, c in enumerate(dates)}
    return sorted(pairs, key=lambda p: order[p[0]])


def _is_search_button(el):
    cls = _classes(el)
    return "sch" in cls or re.match(r"btn_?search", _id(el), re.I) is not None


def find_search_areas(root):
    """→ [{ids: [영역과 하위 그룹 id], buttons: [(btn_id, handler)], label}] — 조회 버튼이 있는 영역만."""
    cands = [el for el in root.iter()
             if isinstance(el.tag, str) and ("schbox" in _classes(el) or _id(el) in ("tbl_search", "tbl_Search"))]
    # 안쪽 후보는 바깥 후보와 한 영역
    tops = [el for el in cands if not any(o is not el and el in o.iterdescendants() for o in cands)]
    areas = []
    for top in tops:
        buttons = [(_id(b), (b.get("{%s}onclick" % EV) or "").strip())
                   for b in top.iter("{%s}trigger" % XF) if _is_search_button(b)]
        if not buttons:
            continue
        ids = [i for i in [_id(top)] + [_id(g) for g in top.iterdescendants() if isinstance(g.tag, str)
                                        and g.tag in ("{%s}group" % XF, "{%s}group" % W2)] if i]
        label = _id(top) or ("." + "schbox" if "schbox" in _classes(top) else top.tag)
        areas.append({"ids": ids, "buttons": buttons, "label": label})
    return areas


def _reachable(script, code):
    """init(없으면 onpageload)에서 닿는 scwin 함수 이름 집합과 함수 spans."""
    spans = st.func_spans(script)
    bodies = {name: code[b:e] for name, _s, b, e, _a in spans}
    roots = [n for n in ("init", "onpageload") if n in bodies]
    seen, todo = set(), list(roots)
    while todo:
        n = todo.pop()
        if n in seen or n not in bodies:
            continue
        seen.add(n)
        todo.extend(re.findall(r"\bscwin\.(\w+)\s*\(", bodies[n]))
    return seen, spans


def _owner(spans, pos):
    for name, s, _b, e, _a in spans:
        if s <= pos <= e:
            return name
    return None


def extract_calls(script):
    """→ {"ccf": [(id, owner)], "cft": [(start, end, owner)], "enter": [(grp, handler, owner)]}."""
    code = st.without_comments(script)
    _seen, spans = _reachable(script, code)
    out = {"ccf": [], "cft": [], "enter": []}
    for m in re.finditer(r"\$c\.date\.checkCalendarFormat\(\s*[\"']?(\w+)", code):
        out["ccf"].append((m.group(1), _owner(spans, m.start())))
    for m in re.finditer(r"\$c\.date\.compareFromToDate\(\s*(\w+)\s*,\s*(\w+)", code):
        out["cft"].append((m.group(1), m.group(2), _owner(spans, m.start())))
    for m in re.finditer(r"\$c\.win\.setEnterKeyEvent\(\s*[\"']?(\w+)[\"']?\s*,\s*([\w.$]+)", code):
        out["enter"].append((m.group(1), m.group(2), _owner(spans, m.start())))
    return out, _seen


def check(xml_path):
    """→ (fails, warns, infos) — 각 항목은 (코드, 메시지)."""
    raw, _eol, reg = st.read_xml(xml_path)
    root = etree.fromstring(raw.encode("utf-8"), etree.XMLParser(strip_cdata=False, recover=True))
    script = reg["script"] if reg else ""
    calls, reach = extract_calls(script)

    fails, warns, infos = [], [], []
    dates, others = find_calendars(root)
    for cid in others:
        infos.append(("B08", f"날짜형이 아닌 달력 — 검사 생략: {cid}"))

    def in_init(owner):
        return owner in reach

    pairs = find_pairs(dates)
    paired = {i for p in pairs for i in p}
    for cid in [c["id"] for c in dates if c["id"] not in paired]:
        hits = [o for i, o in calls["ccf"] if i == cid]
        if not hits:
            fails.append(("B01", f"단일 달력에 checkCalendarFormat 없음: {cid} → $c.date.checkCalendarFormat({cid}, \"yyyyMMdd\");"))
        elif not any(in_init(o) for o in hits):
            warns.append(("B06", f"checkCalendarFormat({cid}) 가 init 밖({', '.join(sorted(set(str(o) for o in hits)))})에만 있음"))
    for s, e in pairs:
        hits = [o for a, b, o in calls["cft"] if (a, b) == (s, e)]
        rev = [o for a, b, o in calls["cft"] if (a, b) == (e, s)]
        if not hits:
            fails.append(("B02", f"기간 달력에 compareFromToDate 없음: {s} ~ {e}"
                          + (" (시작·종료 순서가 바뀜)" if rev else
                             f" → $c.date.compareFromToDate({s}, {e}, [\"시작일자\", \"종료일자\"]);")))
        elif not any(in_init(o) for o in hits):
            warns.append(("B06", f"compareFromToDate({s}, {e}) 가 init 밖에만 있음"))
        for cid in (s, e):
            if any(i == cid for i, _o in calls["ccf"]):
                fails.append(("B04", f"기간 달력 {cid} 에 checkCalendarFormat 도 걸림 — onviewchange 바인딩이 서로 지워진다(compareFromToDate 만 둔다)"))
    for c in dates:
        if c["el"].get("{%s}onviewchange" % EV):
            warns.append(("B07", f"달력 {c['id']} 에 ev:onviewchange={c['el'].get('{%s}onviewchange' % EV)} — init 바인딩의 unbind 가 지운다"))

    for area in find_search_areas(root):
        handlers = [h for _b, h in area["buttons"] if h]
        hits = [(g, h, o) for g, h, o in calls["enter"] if g in area["ids"]]
        if not hits:
            if not area["ids"]:
                fails.append(("B03", f"조회 영역 {area['label']} 에 id 가 없어 setEnterKeyEvent 를 걸 수 없음 — 영역(또는 안쪽 표 그룹)에 id(tbl_search) 부여"))
            else:
                h = handlers[0] if handlers else "scwin.{조회 버튼}_onclick"
                fails.append(("B03", f"조회 영역 {area['label']} 에 setEnterKeyEvent 없음 → $c.win.setEnterKeyEvent({area['ids'][0]}, {h});"))
            continue
        if not handlers:
            warns.append(("B05", f"조회 영역 {area['label']} 의 조회 버튼({', '.join(b for b, _h in area['buttons'])})에 ev:onclick 없음"))
        for g, h, o in hits:
            if handlers and h not in handlers:
                warns.append(("B05", f"setEnterKeyEvent({g}, {h}) — 조회 버튼 핸들러는 {', '.join(handlers)}"))
        if not any(in_init(o) for _g, _h, o in hits):
            warns.append(("B06", f"setEnterKeyEvent({hits[0][0]}) 가 init 밖에만 있음"))
    return fails, warns, infos


def main(argv):
    warn_only = "--warn-only" in argv
    files = [a for a in argv if not a.startswith("--")]
    if not files:
        print(__doc__)
        return 2
    total = 0
    for f in files:
        fails, warns, infos = check(f)
        print(f"== {f}")
        for code, msg in fails:
            print(f"  FAIL {code} {msg}")
        for code, msg in warns:
            print(f"  WARN {code} {msg}")
        for code, msg in infos:
            print(f"  INFO {code} {msg}")
        print("  INIT BINDING: " + ("FAIL" if fails else "OK"))
        total += len(fails)
    print("ALL INIT BINDING CHECKS: " + ("FAIL" if total else "OK"))
    return 0 if (warn_only or not total) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
