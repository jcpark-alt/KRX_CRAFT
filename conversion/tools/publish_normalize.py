# -*- coding: utf-8 -*-
"""퍼블리싱 정규화 — 공급사(r13) body 마크업을 sample-front 가이드 골격으로 접는다(결정적·멱등, lxml 로 <body> 만 다룬다).

    python conversion/tools/publish_normalize.py [--dry] <xml|폴더> ...

규칙(P = publish). 1:1 구조 치환만 하고, 판단이 필요한 자리(안내문 분해·조건 래퍼·표형 그리드·탭 본문 병합·레거시 lybox)는 건드리지 않는다.
  P1  `xf:group.pgtbox`(제목 textbox + breadcrumb) → `<w2:pageFrame id="pfmContentHeader" src="/cm/xml/contentHeader.xml"/>`
  P2  순수 컨테이너 해제 — `xf:group#content[tagname=div]`, JSP <form> 이월 `xf:group[name=…]`(class·style 없음) 는 자식만 남긴다.
      스크립트가 그 id 를 참조하면 해제하지 않는다.
  P3  `meta_snippetCategory`·`meta_snippetName` 속성 삭제(에디터 메타)
  P4  간격 요소 삭제 — 글자·위젯이 전혀 없는 table 그룹(빈 td 만), `<br tagname="br"/>` 요소
  P5  버튼만 든 table(우측 정렬 td + xf:trigger) → `titbox > rt`(다음 형제가 그리드면) 또는 `btnbox > rt`(그 밖)
  P6  맨 `table.w2tb`(tblbox 안이 아니고 레거시 레이아웃 lybox/search_box 안도 아님) → `xf:group.tblbox` 로 감싸고 class 에 `tbl`
  P7  `w2:gridView` → `xf:group.gvwbox` 로 감싸고 `visibleRowNum=N` 을 class `gvw rowN` 으로, `style="width:100%"`·`visibleRowNumFix` 삭제
  P8  `w2:pageList` → `xf:group.pglbox` 로 감싼다(id 는 유지 — 스크립트가 참조)
  P9  th/td class 정리 — `subject w2tb_th`·`td_board_* w2tb_th` → `w2tb_th`, 중복 토큰 제거
  P10 `xf:trigger` 인라인 style 삭제, class 없으면 `btn_cm`, type 없으면 `button`
  P11 생성 id(`td_16`·`tr_63`·`colgroup_10`·`div_24`·`txt_text89`·`label_12` …) 중 스크립트가 참조하지 않는 것은 `id=""`
      (스크립트 본문에 그 id 문자열이 한 번이라도 나오면 보존 — init_attrReals 의 `td_16`·`ul_186` 류가 여기에 걸린다)

lxml 왕복으로 `<x></x>` 가 `<x/>` 로, 속성 안 `>` 가 `&gt;` 로 바뀐다(의미 동일). head·script 영역은 텍스트 그대로 둔다.
"""
import re
import sys
from pathlib import Path

from lxml import etree

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402

XH = "http://www.w3.org/1999/xhtml"
XF = "http://www.w3.org/2002/xforms"
W2 = "http://www.inswave.com/websquare"
EV = "http://www.w3.org/2001/xml-events"
NSDECL = 'xmlns="%s" xmlns:ev="%s" xmlns:w2="%s" xmlns:xf="%s"' % (XH, EV, W2, XF)
NSMAP = {"xf": XF, "w2": W2, "h": XH}
GROUP, TRIGGER, GRID, PAGELIST, PAGEFRAME, TEXTBOX = "{%s}group" % XF, "{%s}trigger" % XF, "{%s}gridView" % W2, "{%s}pageList" % W2, "{%s}pageFrame" % W2, "{%s}textbox" % W2
GEN_ID = re.compile(r'^(td|tr|th|tbody|thead|colgroup|col|br|li|ul|ol|div|span|p|txt_text|label|table|form|c_set)_\d+$')
LEGACY_WRAP = ("lybox", "search_box", "tip_box", "page_view", "pop_footer")
KEEP_CELL_TOKENS = {"w2tb_th", "w2tb_td", "tac", "tar", "tal", "in_tbl", "num", "req"}


def _referenced(gid, code):
    """스크립트(주석 제외 — 문자열 리터럴은 포함)에서 id 를 따옴표 리터럴(`'td_16'`·`"td_16"`)이나 `#td_16` 셀렉터로 참조하는가.
    `body.content` 같은 속성 접근, TODO 주석 안의 `form[name='x']` 는 참조가 아니다."""
    return re.search(r'''['"]%s['"]|#%s\b''' % (re.escape(gid), re.escape(gid)), code) is not None


def _reindent(el, base):
    """el 서브트리의 공백 전용 text/tail 을 base 들여쓰기(줄바꿈 포함) 기준으로 다시 맞춘다."""
    def walk(e, depth):
        kids = [k for k in e if isinstance(k.tag, str)]
        mixed = bool((e.text or "").strip()) or any((k.tail or "").strip() for k in kids)
        if mixed:
            return  # 글자가 섞인 요소(안내문 td 등)의 안쪽 공백은 본문의 일부 — 건드리지 않는다
        if kids:
            e.text = base + "\t" * (depth + 1)
        for i, k in enumerate(kids):
            walk(k, depth + 1)
            k.tail = base + "\t" * (depth + 1 if i < len(kids) - 1 else depth)
    walk(el, 0)


def _cls(el):
    return (el.get("class") or "").split()


def _set_cls(el, tokens):
    el.set("class", " ".join(dict.fromkeys(t for t in tokens if t)))


def _has_class(el, token):
    return token in _cls(el)


def _ancestor_has_class(el, prefixes):
    p = el.getparent()
    while p is not None:
        if any(t.startswith(prefixes) for t in _cls(p)):
            return True
        p = p.getparent()
    return False


def _indent_before(el):
    prev = el.getprevious()
    if prev is not None and prev.tail and "\n" in prev.tail:
        return prev.tail[prev.tail.rfind("\n"):]
    par = el.getparent()
    if par is not None and par.text and "\n" in par.text:
        return par.text[par.text.rfind("\n"):]
    return "\n"


def _wrap(el, cls):
    """el 을 <xf:group class=cls id="" style=""> 로 감싼다(들여쓰기 보존)."""
    ind = _indent_before(el)
    w = etree.Element(GROUP)
    w.set("class", cls); w.set("id", ""); w.set("style", "")
    par = el.getparent()
    par.replace(el, w)
    w.append(el)
    w.tail = el.tail
    _reindent(w, ind)
    return w


def _unwrap(el):
    par = el.getparent()
    idx = par.index(el)
    children = list(el)
    if el.text and el.text.strip():
        return False
    for i, ch in enumerate(children):
        par.insert(idx + i, ch)
    if children:
        children[-1].tail = (children[-1].tail or "").rstrip(" \t") + (el.tail or "")
    else:
        prev = el.getprevious()
        if prev is not None:
            prev.tail = (prev.tail or "") + (el.tail or "")
    par.remove(el)
    return True


def _remove(el):
    par = el.getparent()
    prev = el.getprevious()
    tail = el.tail or ""
    if prev is not None:
        prev.tail = (prev.tail or "").rstrip(" \t\n") + tail if tail.strip() == "" else (prev.tail or "") + tail
    else:
        par.text = (par.text or "").rstrip(" \t\n") + tail if tail.strip() == "" else (par.text or "") + tail
    par.remove(el)


def _has_content(el):
    """글자나 위젯(group·br·col 류가 아닌 요소)이 있는가."""
    for e in el.iter():
        if e is el:
            continue
        if e.tag != GROUP and e.tag != "{%s}br" % XH:
            return True
        if (e.text or "").strip():
            return True
        if (e.tail or "").strip() and e is not el:
            return True
    return bool((el.text or "").strip())


# ---------------------------------------------------------------- rules
def p1_pageframe(body, log):
    for g in body.iter(GROUP):
        if _has_class(g, "pgtbox") and (g.find(".//%s[@class='pgt_tit']" % TEXTBOX) is not None
                                        or g.find(".//%s[@class='breadcrumb']" % GROUP) is not None):
            pf = etree.Element(PAGEFRAME)
            pf.set("id", "pfmContentHeader"); pf.set("src", "/cm/xml/contentHeader.xml"); pf.set("style", "")
            pf.tail = g.tail
            g.getparent().replace(g, pf)
            log["P1_pageframe"] = 1
            return


def p2_unwrap_containers(body, script, log):
    n = 0
    for g in list(body.iter(GROUP)):
        gid = g.get("id") or ""
        if gid and _referenced(gid, script):
            continue
        if g.get("class") or (g.get("style") or "").strip():
            continue
        is_content = gid == "content" and g.get("tagname") == "div"
        is_form = bool(g.get("name")) and g.get("tagname") in (None, "form", "div") and not _cls(g)
        if (is_content or is_form) and g.getparent() is not None and _unwrap(g):
            n += 1
    log["P2_unwrapped"] = n


def p3_meta(body, log):
    n = 0
    for e in body.iter():
        for a in ("meta_snippetCategory", "meta_snippetName"):
            if a in e.attrib:
                del e.attrib[a]; n += 1
    log["P3_meta_removed"] = n


def p4_spacers(body, script, log):
    n = 0
    for g in list(body.iter(GROUP)):
        if g.get("tagname") == "table" and not _has_content(g) and g.getparent() is not None:
            gid = g.get("id") or ""
            if gid and _referenced(gid, script):
                continue
            _remove(g); n += 1
    for br in list(body.iter("{%s}br" % XH)):
        if br.get("tagname") == "br" and br.getparent() is not None:
            _remove(br); n += 1
    log["P4_spacers_removed"] = n


def _only_triggers(table):
    trig = [e for e in table.iter(TRIGGER)]
    if not trig:
        return []
    for e in table.iter():
        if e is table or e.tag == GROUP:
            if (e.text or "").strip():
                return []
            continue
        if e.tag != TRIGGER and e.getparent() is not None and not any(a is e for a in trig) and not _is_inside(e, trig):
            return []
    return trig


def _is_inside(e, trig):
    p = e.getparent()
    while p is not None:
        if any(p is t for t in trig):
            return True
        p = p.getparent()
    return False


def p5_button_rows(body, log):
    n = 0
    for g in list(body.iter(GROUP)):
        if g.get("tagname") != "table" or g.getparent() is None:
            continue
        trig = _only_triggers(g)
        if not trig:
            continue
        nxt = g.getnext()
        while nxt is not None and not isinstance(nxt.tag, str):
            nxt = nxt.getnext()
        above_grid = nxt is not None and (nxt.tag == GRID or (nxt.tag == GROUP and _has_class(nxt, "gvwbox")))
        box = etree.Element(GROUP); box.set("class", "titbox" if above_grid else "btnbox"); box.set("id", ""); box.set("style", "")
        rt = etree.SubElement(box, GROUP); rt.set("class", "rt"); rt.set("id", ""); rt.set("style", "")
        ind = _indent_before(g)
        for t in trig:
            rt.append(t)
        box.tail = g.tail
        g.getparent().replace(g, box)
        _reindent(box, ind)
        n += 1
    log["P5_button_rows"] = n


def p6_tblbox(body, log):
    n = 0
    for g in list(body.iter(GROUP)):
        if g.get("tagname") != "table" or "w2tb" not in _cls(g) or g.getparent() is None:
            continue
        par = g.getparent()
        if _has_class(par, "tblbox") or _ancestor_has_class(g, LEGACY_WRAP):
            continue
        if par.tag == GROUP and par.get("tagname") in ("td", "th", "tr"):
            continue  # 중첩 표(표형 그리드 등)는 판단 영역
        _set_cls(g, _cls(g) + ["tbl"])
        _wrap(g, "tblbox"); n += 1
    log["P6_tblbox"] = n


def p7_grid(body, log):
    n = 0
    for gv in list(body.iter(GRID)):
        par = gv.getparent()
        if par is None:
            continue
        tokens = [t for t in _cls(gv) if t != "gvw"]
        vr = gv.get("visibleRowNum")
        if vr and vr.isdigit() and not any(re.fullmatch(r'row\d+', t) for t in tokens):
            tokens.append("row" + vr)
        _set_cls(gv, ["gvw"] + tokens)
        if (gv.get("style") or "").replace(" ", "") in ("width:100%;", "width:100%"):
            gv.set("style", "")
        if "visibleRowNumFix" in gv.attrib:
            del gv.attrib["visibleRowNumFix"]
        if not _has_class(par, "gvwbox"):
            _wrap(gv, "gvwbox"); n += 1
    log["P7_gvwbox"] = n


def p8_pagelist(body, log):
    n = 0
    for pl in list(body.iter(PAGELIST)):
        par = pl.getparent()
        if par is not None and not _has_class(par, "pglbox"):
            _wrap(pl, "pglbox"); n += 1
    log["P8_pglbox"] = n


def p9_cells(body, log):
    n = 0
    for g in body.iter(GROUP):
        if g.get("tagname") not in ("th", "td"):
            continue
        toks = _cls(g)
        if not toks:
            continue
        new = [t for t in toks if t in KEEP_CELL_TOKENS]
        if not any(t.startswith("w2tb_") for t in new):
            new.append("w2tb_th" if g.get("tagname") == "th" else "w2tb_td")
        new = list(dict.fromkeys(new))
        if new != toks:
            _set_cls(g, new); n += 1
    log["P9_cells"] = n


def p10_triggers(body, log):
    n = 0
    for t in body.iter(TRIGGER):
        changed = False
        if (t.get("style") or "").strip():
            t.set("style", ""); changed = True
        if not _cls(t):
            t.set("class", "btn_cm"); changed = True
        if not t.get("type") and t.get("tagname") != "a":
            t.set("type", "button"); changed = True
        n += changed
    log["P10_triggers"] = n


def p11_blank_ids(body, script, log):
    n = 0
    for e in body.iter():
        gid = e.get("id") if isinstance(e.tag, str) else None
        if gid and GEN_ID.match(gid) and not _referenced(gid, script):
            e.set("id", ""); n += 1
    log["P11_ids_blanked"] = n


# ---------------------------------------------------------------- driver
def normalize_body(body_text, script):
    m = re.search(r'<body\b.*?</body>', body_text, re.S)
    if not m:
        return body_text, {"fatal": "body 없음"}
    parser = etree.XMLParser(strip_cdata=False, remove_blank_text=False, resolve_entities=False)
    root = etree.fromstring("<root %s>%s</root>" % (NSDECL, m.group(0)), parser)
    body = root[0]
    script = st.without_comments(script)  # id 참조 판정은 주석을 뺀 스크립트로
    log = {}
    p1_pageframe(body, log)
    p2_unwrap_containers(body, script, log)
    p3_meta(body, log)
    p4_spacers(body, script, log)
    p7_grid(body, log)        # 그리드를 먼저 감싸야 P5 가 「다음 형제가 그리드」를 볼 수 있다
    p5_button_rows(body, log)
    p6_tblbox(body, log)
    p8_pagelist(body, log)
    p9_cells(body, log)
    p10_triggers(body, log)
    p11_blank_ids(body, script, log)
    out = etree.tostring(body, encoding="unicode")
    out = re.sub(r'^<body[^>]*>', lambda mm: re.sub(r'\s+xmlns(:\w+)?="[^"]*"', '', mm.group(0)), out, count=1)
    return body_text[:m.start()] + out + body_text[m.end():], log


def apply(path, dry=False):
    raw, eol, reg = st.read_xml(path)
    if reg is None:
        return {"fatal": "script 영역 없음"}
    new_body, log = normalize_body(reg["body"], reg["script"])
    log["changed"] = new_body != reg["body"]
    if not dry and log["changed"]:
        st.write_xml(path, reg["head"], reg["script_open"], reg["script"], reg["script_close"], new_body, eol)
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
