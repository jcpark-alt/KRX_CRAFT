# -*- coding: utf-8 -*-
"""V49 ui_restyle(2026-10-13) — 공급사 body 를 sample-front 규약(titbox h3 · txt_info 안내 · tblbox 2단 테이블 · 입력+아이콘조회버튼 한 칸 · btnbox rt)으로
기계 정리한다. 정답지는 ui-tobe/JLDFIL01030(손 재작성, 2026-10-13). body 는 lxml 로 파싱해 요소 단위로 고치고 본문 이외(head·script)는 버튼 개명에
한해 함께 맞춘다. 모든 규칙은 스크립트 참조 검사로 지켜지며 멱등이다.

  U1 sub_contents 그룹 속성(id=""·style="") 보강.
  U2 hidden input(`inputType="hidden"`) — 스크립트가 id 를 참조하지 않고 `value` 도 없으면 삭제(앞의 「hidden 'x' 유지」 주석 포함).
     값은 바인딩된 dataMap 키가 그대로 지닌다. 참조·value 있는 것은 그대로.
  U3 숨김 iframe(`w2:tag tagname="iframe"` display:none) — id·name 모두 미참조면 삭제(as-is 임시저장 프레임 흔적).
  U4 lybox 아이콘 안내표(`table.lybox` 1행 · 첫 칸 icon_N.gif) → `w2:textbox.txt_info`. 버튼 칸이 있으면 titbox(p.txt_info + rt 버튼).
  U5 컴포넌트 밖 생 텍스트(td·li·p·div·span 안 텍스트만) → `w2:textbox label`.
  U6 `img_N` 버튼 → `btn_<핸들러가 부르는 함수>`(없으면 라벨·아이콘 class) — body id·ev:onclick, script 정의·문자열 참조·JSDoc·context, publicInfo 함께.
     span 꼴 textbox 버튼(class btn_cm + onclick)은 스크립트가 컴포넌트를 달리 안 쓰면 `xf:trigger` 로. 아이콘 전용 trigger 에는 `xf:label` 보강.
  U7 빈 간격 테이블(`table.w2tb` 1행 1빈칸) 삭제.
  U8 배치 테이블 평탄화 — 모든 행이 th 없는 td 한 칸이고 그 칸이 블록(tblbox·table·lybox·버튼)만 품으면 테이블을 걷고 칸 내용만 남긴다.
     버튼만 있는 칸은 `btnbox > rt` 로.
  U9 2단 테이블 정규화(colgroup col 2개) — [th, td(입력), td(아이콘조회버튼)] 행은 버튼을 입력 칸에 합치고 colspan=2 제거,
     th 에 scope=row, 입력의 tagname/inputType/name 제거, width Nch → px.
 U10 2단 테이블 th 라벨 공통 접두("대상회사 거래소고유번호"/"대상회사 금감원고유번호" …) → titbox h3 제목으로 올리고 라벨에서 뗀다(남는 글자 3자 미만이면 라벨 유지).
 U11 팝업 회신으로만 채우는 입력(setCorpInfo* 함수 안 setValue 대상) → readOnly="true".

CLI(제자리): python conversion/tools/ui_restyle.py [--dry] <xml|폴더> ...   (vendor_stage2 --v49 와 같다)
"""
import io
import re
import sys
from pathlib import Path

from lxml import etree

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402

NS = {"xf": "http://www.w3.org/2002/xforms", "w2": "http://www.inswave.com/websquare", "ev": "http://www.w3.org/2001/xml-events", "h": "http://www.w3.org/1999/xhtml"}
XF, W2, EV = "{%s}" % NS["xf"], "{%s}" % NS["w2"], "{%s}" % NS["ev"]
ICON_WORD = {"search": "search", "save": "저장", "guide": "guide", "download": "download", "print": "인쇄", "close": "닫기", "upload": "찾아보기", "excel": "엑셀", "add": "추가", "del": "삭제", "delete": "삭제"}
LABEL_BY_FN = {"goWrite": "문서작성", "goList": "목록", "goBack": "이전", "documentWrite": "문서작성", "closeWindow": "닫기", "closePopup": "닫기", "goPrint": "인쇄"}


# ---------------------------------------------------------------- 트리 유틸
def _cls(el):
    return (el.get("class") or "").split()


def _is(el, tag, tagname=None, cls=None):
    if not isinstance(el.tag, str) or el.tag != tag:
        return False
    if tagname is not None and el.get("tagname") != tagname:
        return False
    if cls is not None and cls not in _cls(el):
        return False
    return True


def _kids(el):
    return [c for c in el if isinstance(c.tag, str)]


def _cells(tr):
    return [c for c in _kids(tr) if c.tag == XF + "group" and c.get("tagname") in ("th", "td")]


def _rows(table):
    rows = []
    for c in _kids(table):
        if c.tag == XF + "group" and c.get("tagname") == "tr":
            rows.append(c)
        elif c.tag == XF + "group" and c.get("tagname") in ("tbody", "thead"):
            rows += [r for r in _kids(c) if r.tag == XF + "group" and r.get("tagname") == "tr"]
    return rows


def _has_text(el):
    return bool((el.text or "").strip()) or any((c.tail or "").strip() for c in el)


def _indent(el):
    """el 이 놓인 줄의 들여쓰기(앞 형제 tail 또는 부모 text 의 마지막 줄)."""
    prev = el.getprevious()
    s = prev.tail if prev is not None else el.getparent().text if el.getparent() is not None else ""
    s = s or ""
    return s[s.rfind("\n") + 1:] if "\n" in s else ""


def _remove(el):
    """el 을 지운다. el 앞의 줄바꿈+들여쓰기(prev.tail 또는 parent.text) 는 el.tail 로 바꿔 줄 하나만 사라지게 한다."""
    parent = el.getparent()
    prev = el.getprevious()
    tail = el.tail or ""
    before = (prev.tail if prev is not None else parent.text) or ""
    if before.strip():
        # 앞에 생 텍스트가 있으면 그대로 두고 el 의 공백 tail 만 버린다(텍스트 소실 방지)
        new = before + (tail if tail.strip() else "")
    else:
        new = tail if "\n" in tail else before + tail
    if prev is not None:
        prev.tail = new
    else:
        parent.text = new
    parent.remove(el)


def _reindent(el, old, new):
    """서브트리의 모든 text/tail 줄 들여쓰기를 old → new 로 바꾼다(바뀌는 것만 대입해 CDATA 를 지킨다)."""
    def fix(s):
        if not s or "\n" not in s:
            return s
        return re.sub(r"\n" + re.escape(old), "\n" + new, s) if old else re.sub(r"\n([ \t]*)", lambda m: "\n" + new + m.group(1), s)
    for d in el.iter():
        if not isinstance(d.tag, str):
            continue
        t = d.text
        if isinstance(t, str) and fix(t) != t:
            d.text = fix(t)
        if d is not el and isinstance(d.tail, str) and fix(d.tail) != d.tail:
            d.tail = fix(d.tail)


def _mk(tag, attrs=None, text=None):
    e = etree.Element(tag, nsmap=None)
    for k, v in (attrs or {}).items():
        e.set(k, v)
    if text is not None:
        e.text = text
    return e


def _label_el(text):
    lab = _mk(XF + "label")
    lab.text = etree.CDATA(text)
    return lab


def _pretty(el, base, step="    "):
    """새로 만든 서브트리에 들여쓰기 text/tail 을 채운다(el.tail 은 호출자가)."""
    kids = _kids(el)
    if not kids:
        return
    el.text = "\n" + base + step
    for i, k in enumerate(kids):
        _pretty(k, base + step, step)
        k.tail = "\n" + base + (step if i < len(kids) - 1 else "")


def _replace_with(el, new_list):
    """el 을 new_list 요소들로 바꾼다(같은 들여쓰기, el.tail 은 마지막 요소에)."""
    parent = el.getparent()
    base = _indent(el)
    idx = list(parent).index(el)
    tail = el.tail
    parent.remove(el)
    for j, n in enumerate(new_list):
        _pretty(n, base)
        n.tail = tail if j == len(new_list) - 1 else "\n" + base
        parent.insert(idx + j, n)


def _move_into(el, new_parent, base):
    """기존 요소 el 을 new_parent 끝에 옮기고 들여쓰기를 base 로 맞춘다."""
    old = _indent(el)
    el.getparent().remove(el)
    _reindent(el, old, base)
    el.tail = "\n" + base
    kids = _kids(new_parent)
    if kids:
        kids[-1].tail = "\n" + base
    else:
        new_parent.text = "\n" + base
    new_parent.append(el)


def _referenced(script_nc, name):
    return re.search(r"(?<![\w$])" + re.escape(name) + r"(?![\w$])", script_nc) is not None


# ---------------------------------------------------------------- 규칙
def u1_sub_contents(body):
    n = 0
    for g in body.iter(XF + "group"):
        if "sub_contents" in _cls(g):
            for k in ("id", "style"):
                if g.get(k) is None:
                    g.set(k, ""); n += 1
            break
    return n


def u2_hidden_inputs(body, script_nc):
    n = 0
    for inp in list(body.iter(XF + "input")):
        if inp.get("inputType") != "hidden" or inp.get("value") is not None:
            continue
        i = inp.get("id") or ""
        if i and _referenced(script_nc, i):
            continue
        prev = inp.getprevious()
        if prev is not None and not isinstance(prev.tag, str) and "hidden '" in (prev.text or ""):
            _remove(prev)
        _remove(inp); n += 1
    return n


def u3_hidden_iframe(body, script_nc):
    n = 0
    for t in list(body.iter(W2 + "tag")):
        if t.get("tagname") != "iframe" or "display:none" not in (t.get("style") or "").replace(" ", ""):
            continue
        names = [x for x in (t.get("id"), t.get("name")) if x]
        if any(_referenced(script_nc, x) for x in names):
            continue
        _remove(t); n += 1
    return n


def _text_of_cell(td):
    """칸의 안내 문구(생 텍스트 + textbox label) — 없으면 None."""
    parts = []
    if (td.text or "").strip():
        parts.append(td.text.strip())
    for c in _kids(td):
        if c.tag == W2 + "textbox" and c.get("label"):
            parts.append(c.get("label"))
        elif c.tag == W2 + "span" and c.get("label"):
            parts.append(c.get("label"))
        else:
            return None
        if (c.tail or "").strip():
            parts.append(c.tail.strip())
    return " ".join(parts) if parts else None


def u4_lybox_notice(body):
    n = 0
    for tb in list(body.iter(XF + "group")):
        if tb.getparent() is None or tb.get("tagname") != "table" or "lybox" not in _cls(tb):
            continue
        rows = _rows(tb)
        if len(rows) != 1:
            continue
        cells = _cells(rows[0])
        if len(cells) < 2:
            continue
        first = _kids(cells[0])
        if len(first) != 1 or _has_text(cells[0]):
            continue
        ic = first[0]
        is_icon = (ic.tag == XF + "image" and re.search(r"icon_\d+\.gif$", ic.get("src") or "")) or \
                  (ic.tag == W2 + "textbox" and ic.get(EV + "onclick") is None and (ic.get("label") or "") in ("아이콘 이미지", "") and re.fullmatch(r"img_\d+", ic.get("id") or ""))
        if not is_icon:
            continue
        texts, btn_wrappers = [], []
        ok = True
        for td in cells[1:]:
            t = _text_of_cell(td)
            if t is not None:
                texts.append(t); continue
            kids = _kids(td)
            if not _has_text(td) and kids and all(k.tag == XF + "trigger" or (k.tag == XF + "group" and all(x.tag == XF + "trigger" for x in _kids(k))) for k in kids):
                btn_wrappers += kids; continue
            ok = False; break
        # 버튼 칸이 if_* 그룹에 싸여 td 밖에 놓인 변형(JLDFIL00015)
        for extra in _kids(rows[0]):
            if extra.tag == XF + "group" and extra.get("tagname") is None and extra.get("id"):
                inner = [c for c in _kids(extra) if c.get("tagname") == "td"]
                if inner and all(not _has_text(c) and _kids(c) and all(k.tag == XF + "trigger" for k in _kids(c)) for c in inner):
                    btn_wrappers.append(extra)
                else:
                    ok = False
        if not ok or not texts:
            continue
        label = " ".join(texts)
        esc = "false" if ("&" in label or "<" in label) else None
        if btn_wrappers:
            box = _mk(XF + "group", {"class": "titbox", "id": "", "style": ""})
            tx = _mk(W2 + "textbox", {"class": "txt_info", "id": "", "label": label, "style": "", "tagname": "p"})
            if esc:
                tx.set("escape", esc)
            box.append(tx)
            rt = _mk(XF + "group", {"class": "rt", "id": "", "style": ""})
            box.append(rt)
            new = [box]
        else:
            tx = _mk(W2 + "textbox", {"class": "txt_info", "id": "", "label": label, "style": ""})
            if esc:
                tx.set("escape", esc)
            new = [tx]
        target = tb
        p = tb.getparent()
        if p is not None and p.tag == XF + "group" and "tblbox" in _cls(p) and not p.get("id") and len(_kids(p)) == 1 and not _has_text(p):
            target = p
        base = _indent(target)
        # 버튼을 먼저 떼어 둔다(테이블 삭제 전)
        moved = []
        for w in btn_wrappers:
            if w.tag == XF + "group" and w.get("tagname") is None:
                # if_* 래퍼: 안의 td 를 풀고 trigger 만 래퍼에 남긴다
                trigs = [k for c in _kids(w) for k in _kids(c)]
                for c in list(w):
                    w.remove(c)
                w.text = None
                for k in trigs:
                    w.append(k)
                moved.append(w)
            else:
                moved.append(w)
        for w in moved:
            w.getparent().remove(w)
        # 안내문은 바로 앞의 입력 테이블(tblbox) 위에 둔다 — 샘플(JLDFIL25900)·정답지(JLDFIL01030) 순서
        prev = target.getprevious()
        while prev is not None and not isinstance(prev.tag, str):
            prev = prev.getprevious()
        _replace_with(target, new)
        if prev is not None and prev.tag == XF + "group" and "tblbox" in _cls(prev):
            parent = prev.getparent()
            for e in new:
                parent.remove(e)
            idx = list(parent).index(prev)
            for j, e in enumerate(new):
                e.tail = "\n" + base
                parent.insert(idx + j, e)
        if btn_wrappers:
            rt = new[0][-1]
            for w in moved:
                for d in w.iter():
                    if not isinstance(d.tag, str):
                        continue
                    if isinstance(d.text, str) and not d.text.strip():
                        d.text = None
                    if isinstance(d.tail, str) and not d.tail.strip():
                        d.tail = None
                rt.append(w)
            keep_tail = new[0].tail
            _pretty(new[0], base)
            new[0].tail = keep_tail or "\n" + base
        n += 1
    return n


def u5_raw_text(body):
    n = 0
    for g in list(body.iter(XF + "group")):
        tn = g.get("tagname")
        if tn not in ("td", "th", "li", "p", "div", "span") and "w2tb_td" not in _cls(g) and "w2tb_th" not in _cls(g):
            continue
        if _kids(g) or not (g.text or "").strip():
            continue
        text = re.sub(r"\s+", " ", g.text.strip())
        base = _indent(g)
        tx = _mk(W2 + "textbox", {"class": "", "id": "", "label": text, "style": ""})
        if "&" in text:
            tx.set("escape", "false")
        g.text = "\n" + base + "    "
        tx.tail = "\n" + base
        g.append(tx); n += 1
    return n


def _handler_calls(script, name):
    """scwin.<name> 핸들러 본문이 부르는 scwin.X 목록(코드 영역만)."""
    for fn, s, b, e, _a in st.func_spans(script):
        if fn == name:
            code = st.code_only(script)[b:e]
            calls = re.findall(r"scwin\.([\w$]+)\s*\(", code)
            return [c for c in calls if c not in ("handleError",)], code
    return [], ""


def _camel(s):
    s = re.sub(r"[^0-9A-Za-z]+", " ", s).strip()
    if not s:
        return ""
    parts = s.split()
    return parts[0][0].lower() + parts[0][1:] + "".join(p[:1].upper() + p[1:] for p in parts[1:])


def u6_buttons(body, head, script):
    log = {"rename": 0, "span2trigger": 0, "label": 0}
    script_nc = st.without_comments(script)
    body_ids = set(x for x in (e.get("id") for e in body.iter() if isinstance(e.tag, str)) if x)
    taken = set(body_ids)
    renames = {}
    cands = [e for e in body.iter() if isinstance(e.tag, str) and re.fullmatch(r"img_\d+", e.get("id") or "") and e.get(EV + "onclick")]
    for e in cands:
        old = e.get("id")
        m = re.fullmatch(r"scwin\.([\w$]+)", e.get(EV + "onclick") or "")
        handler = m.group(1) if m else None
        calls, code = _handler_calls(script, handler) if handler else ([], "")
        stem = ""
        for c in calls:
            if c in ("swapImage", "init_recvParam"):
                continue
            stem = re.sub(r"^(fn_|tx_fn_)", "", c); break
        if not stem and code:
            if "closePopup" in code or "window.close" in code:
                stem = "close"
            elif "moveUrl" in code or "history.back" in code:
                stem = "move"
        if not stem:
            lab = e.findtext(XF + "label") if e.tag == XF + "trigger" else e.get("label")
            if lab and re.fullmatch(r"[0-9A-Za-z _-]+", lab.strip()):
                stem = _camel(lab)
        if not stem:
            cl = _cls(e)
            if "icon" in cl:
                for w in cl:
                    if w in ICON_WORD:
                        stem = w; break
        if not stem:
            stem = "click"
        new = "btn_" + stem[:1].lower() + stem[1:] if not stem.startswith("btn") else stem
        renames[old] = [new, handler, e]
    if not renames:
        return head, script, log
    # 같은 줄기가 여럿이면(ㄱㄴㄷ 색인 버튼 등) name 속성(ASCII)으로, 없으면 번호로 가른다
    by_stem = {}
    for old, r in renames.items():
        by_stem.setdefault(r[0], []).append(old)
    for stem_new, olds in by_stem.items():
        if len(olds) == 1 and stem_new not in taken:
            taken.add(stem_new); continue
        for i, old in enumerate(olds):
            e = renames[old][2]
            suffix = e.get("name") if re.fullmatch(r"[A-Za-z][A-Za-z0-9]*", e.get("name") or "") else None
            if suffix:
                cand = "%s_%s" % (stem_new, suffix)
            elif i == 0 and stem_new not in taken:
                cand = stem_new
            else:
                cand = "%s_%d" % (stem_new, i + 1)
            k = 2
            while cand in taken:
                cand = "%s_%d" % (stem_new, k); k += 1
            taken.add(cand)
            renames[old][0] = cand
    renames = {old: tuple(r) for old, r in renames.items()}
    # 핸들러 개명은 body 가 실제로 가리키는 핸들러가 이 버튼 전용(이름에 old id 포함: img_99_onclick · __ev_5_img_99_onclick)일 때만.
    # 공용 핸들러(여러 버튼이 같은 함수)는 그대로 둔다. 새 핸들러명이 이미 정의돼 있으면(고아 정의 등) id 에 번호를 더 붙인다.
    defined = set(st.defined_functions(script))
    for old in list(renames):
        new, handler, e = renames[old]
        if handler and old in handler:
            k = 2
            while new + "_onclick" in defined and new + "_onclick" != handler:
                new = re.sub(r"_\d+$", "", renames[old][0]) + "_%d" % k; k += 1
            renames[old] = (new, handler, e)
            defined.add(new + "_onclick")
    # body
    for old, (new, handler, e) in renames.items():
        e.set("id", new)
        if handler and old in handler:
            e.set(EV + "onclick", "scwin." + new + "_onclick")
    # script: 핸들러 정의·호출·문자열 참조·context·JSDoc
    hmap = {}
    for old, (new, handler, e) in renames.items():
        if handler and old in handler:
            script = re.sub(r"(?<![\w$])" + re.escape(handler) + r"(?![\w$])", new + "_onclick", script)
            hmap[handler] = new + "_onclick"
        script = re.sub(r"(?<![\w$])" + re.escape(old) + r"(?![\w$])", new, script)
        log["rename"] += 1
    names = []
    for nm in st.public_info(head):
        names.append(hmap.get(nm, nm))
    order = {n: i for i, n in enumerate(st.defined_functions(script))}
    names = sorted(set(names), key=lambda n: order.get(n, 10 ** 6))
    head = st.set_public_info(head, names)
    script_nc = st.without_comments(script)
    # span textbox → trigger / 아이콘 전용 trigger 라벨
    for old, (new, handler, e) in renames.items():
        if e.tag == W2 + "textbox" and e.get("tagname") == "span" and "btn_cm" in _cls(e):
            # 스크립트가 이 컴포넌트를 쓰더라도 보이기/숨기기·활성 제어(init_conds binds · show/hide/setVisible/setDisabled)만이면 trigger 로 바꿔도 같다
            refs = re.findall(r"(?<![\w$])" + re.escape(new) + r"(?![\w$_])", script_nc)
            benign = re.findall(r"id:\s*[\"']" + re.escape(new) + r"[\"']|getComponent\(\s*[\"']" + re.escape(new) + r"[\"']\s*\)\s*\.(?:show|hide|setVisible|setDisabled|setStyle|focus|addClass|removeClass)\b", script_nc)
            other = len(refs) - len(benign)
            if other <= 0:
                t = _mk(XF + "trigger")
                for k, v in e.attrib.items():
                    if k in ("tagname", "label"):
                        continue
                    t.set(k, v)
                t.set("type", "button")
                t.set("class", e.get("class") or "btn_cm")
                t.set("style", e.get("style") or "")
                lab = _label_el(e.get("label") or "")
                t.append(lab)
                _replace_with(e, [t])
                log["span2trigger"] += 1
                renames[old] = (new, handler, t)
    for old, (new, handler, e) in renames.items():
        if e.tag == XF + "trigger" and e.find(XF + "label") is None and not (e.text or "").strip():
            cl = _cls(e)
            word = None
            stem = new[4:] if new.startswith("btn_") else new
            word = LABEL_BY_FN.get(re.sub(r"_\d+$", "", stem))
            if not word:
                for w in cl:
                    if w in ICON_WORD:
                        word = ICON_WORD[w]; break
            if word:
                base = _indent(e)
                e.text = "\n" + base + "    "
                lab = _label_el(word)
                lab.tail = "\n" + base
                e.append(lab)
                log["label"] += 1
    return head, script, log


def u7_spacer_tables(body):
    n = 0
    for tb in list(body.iter(XF + "group")):
        if tb.getparent() is None or tb.get("tagname") != "table" or "lybox" in _cls(tb) or "w2tb" not in _cls(tb):
            continue
        rows = _rows(tb)
        if len(rows) != 1 or len(_kids(tb)) != 1:
            continue
        cells = _cells(rows[0])
        if len(cells) != 1 or _kids(cells[0]) or _has_text(cells[0]) or len(_kids(rows[0])) != 1:
            continue
        p = tb.getparent()
        target = p if (p.tag == XF + "group" and "tblbox" in _cls(p) and not p.get("id") and len(_kids(p)) == 1 and not _has_text(p)) else tb
        _remove(target); n += 1
    return n


BLOCK_OK = (XF + "group", XF + "trigger", W2 + "textbox")


def u8_flatten_layout(body, script_nc):
    n = 0
    changed = True
    while changed:
        changed = False
        for tb in list(body.iter(XF + "group")):
            if tb.getparent() is None or tb.get("tagname") != "table" or "w2tb" not in _cls(tb) or "lybox" in _cls(tb):
                continue
            if tb.get("ref") or tb.get("id"):
                continue  # id 가 있는 표(스크립트·CSS 가 겨눌 수 있다)는 걷지 않는다
            wrap = tb.getparent()
            if wrap.tag == XF + "group" and "tblbox" in _cls(wrap) and wrap.get("id"):
                continue
            rows = _rows(tb)
            if not rows:
                continue
            # 테이블 직계가 행·colgroup·attributes 뿐이어야 한다(c_choose 같은 조건 그룹을 품은 테이블은 손대지 않는다)
            if any(not (c.tag == XF + "group" and c.get("tagname") in ("tr", "tbody", "thead", "colgroup", "col")) and c.tag != W2 + "attributes" for c in _kids(tb)):
                continue
            if any(re.match(r"c_(choose|when|otherwise)_", d.get("id") or "") for d in tb.iter(XF + "group")):
                continue
            # 행·칸에 id 가 있으면(스크립트가 보이기/숨기기로 겨누는 tr_N·formTd 등) 걷지 않는다
            if any(r.get("id") or any(c.get("id") for c in _cells(r)) for r in rows):
                continue
            ok = True
            tds = []
            for r in rows:
                cells = _cells(r)
                if len(cells) != 1 or cells[0].get("tagname") != "td" or _has_text(cells[0]) or len(_kids(r)) != 1:
                    ok = False; break
                kids = _kids(cells[0])
                if not kids or not all(k.tag in BLOCK_OK for k in kids):
                    ok = False; break
                # 칸이 블록 컨테이너(xf:group)를 하나는 품거나 버튼만 품어야 배치 칸이다 — 텍스트박스만 있는 칸은 내용 행
                if not (any(k.tag == XF + "group" for k in kids) or all(k.tag == XF + "trigger" for k in kids)):
                    ok = False; break
                if any(k.tag == W2 + "textbox" and k.get("ref") for k in kids):
                    ok = False; break
                tds.append(cells[0])
            if not ok:
                continue
            target = tb
            p = tb.getparent()
            if p.tag == XF + "group" and "tblbox" in _cls(p) and not p.get("id") and len(_kids(p)) == 1 and not _has_text(p):
                target = p
            base = _indent(target)
            new = []
            for td in tds:
                kids = _kids(td)
                if all(k.tag == XF + "trigger" for k in kids):
                    box = _mk(XF + "group", {"class": "btnbox", "id": "", "style": ""})
                    rt = _mk(XF + "group", {"class": "rt", "id": "", "style": ""})
                    box.append(rt)
                    for k in kids:
                        td.remove(k)
                        if "pt" not in _cls(k) and "icon" in _cls(k) and "save" in _cls(k):
                            k.set("class", "btn_cm pt")
                        rt.append(k)
                    new.append(box)
                else:
                    for k in kids:
                        old = _indent(k)
                        td.remove(k)
                        _reindent(k, old, base)
                        k.tail = None
                        new.append(k)
            parent = target.getparent()
            idx = list(parent).index(target)
            tail = target.tail
            parent.remove(target)
            for j, e in enumerate(new):
                if e.get("class") == "btnbox":
                    _pretty(e, base)
                    for t in e.iter(XF + "trigger"):
                        for lab in t.findall(XF + "label"):
                            lab.tail = "\n" + _indent(t)
                e.tail = tail if j == len(new) - 1 else "\n" + base
                parent.insert(idx + j, e)
            n += 1; changed = True
            break
    return n


def _two_col_tables(body):
    for tb in body.iter(XF + "group"):
        if tb.get("tagname") != "table" or "w2tb" not in _cls(tb) or "lybox" in _cls(tb):
            continue
        cg = [c for c in _kids(tb) if c.get("tagname") == "colgroup"]
        cols = [c for g in cg for c in _kids(g) if c.get("tagname") == "col"] if cg else [c for c in _kids(tb) if c.get("tagname") == "col"]
        if len(cols) == 2:
            yield tb


def _th_label(th):
    for c in _kids(th):
        if c.tag == W2 + "textbox" and c.get("label") is not None:
            return c
    return None


def u9_two_col(body):
    n = 0
    for tb in list(_two_col_tables(body)):
        rows = _rows(tb)
        if not rows:
            continue
        touched = False
        for r in rows:
            cells = _cells(r)
            if len(cells) == 3 and cells[0].get("tagname") == "th" and cells[1].get("tagname") == "td" and cells[2].get("tagname") == "td":
                k2 = _kids(cells[2])
                k1 = _kids(cells[1])
                if k2 and all(x.tag == XF + "trigger" for x in k2) and not _has_text(cells[2]) and k1 and any(x.tag in (XF + "input", XF + "select1", XF + "select", W2 + "inputCalendar") for x in k1):
                    base = _indent(k1[-1])
                    for x in k2:
                        _move_into(x, cells[1], base)
                    _kids(cells[1])[-1].tail = "\n" + _indent(cells[1])  # 마지막 자식 tail 은 td 닫힘 들여쓰기
                    _remove(cells[2]); touched = True
        # colspan=2 제거 — 3열(th·입력·버튼)이던 표가 2열이 되었을 때, th+td 두 칸 행의 td 만(한 칸짜리 행의 colspan 은 두 열을 합치는 것이라 둔다)
        if all(len(_cells(r)) <= 2 for r in rows):
            for r in rows:
                cells = _cells(r)
                if len(cells) != 2 or cells[0].get("tagname") != "th":
                    continue
                td = cells[1]
                at = td.find(W2 + "attributes")
                if at is None:
                    continue
                cs = at.find(W2 + "colspan")
                if cs is not None and (cs.text or "").strip() == "2":
                    at.remove(cs); touched = True
                    if not _kids(at):
                        _remove(at)
                    else:
                        _pretty(at, _indent(at))
        for r in rows:
            for c in _cells(r):
                if c.get("tagname") == "th":
                    at = c.find(W2 + "attributes")
                    if at is None:
                        at = _mk(W2 + "attributes")
                        sc = _mk(W2 + "scope", text="row")
                        at.append(sc)
                        base = _indent(c)
                        _pretty(at, base + "    ")
                        old_text = c.text if isinstance(c.text, str) and c.text.strip() else ""
                        at.tail = "\n" + base + "    " + (old_text.strip() + "\n" + base + "    " if old_text else "")
                        c.text = "\n" + base + "    "
                        c.insert(0, at); touched = True
                    elif at.find(W2 + "scope") is None:
                        sc = _mk(W2 + "scope", text="row")
                        base = _indent(at)
                        kids = _kids(at)
                        at.insert(0, sc)
                        if kids:
                            sc.tail = "\n" + base + "    "
                        else:
                            at.text = "\n" + base + "    "; sc.tail = "\n" + base
                        touched = True
        for inp in tb.iter(XF + "input"):
            if inp.get("inputType") == "hidden":
                continue
            for k in ("tagname", "name"):
                if inp.get(k) is not None:
                    del inp.attrib[k]; touched = True
            if inp.get("inputType") == "text":
                del inp.attrib["inputType"]; touched = True
            m = re.search(r"width:\s*(\d+)ch", inp.get("style") or "")
            if m:
                inp.set("style", re.sub(r"width:\s*\d+ch", "width:%dpx" % (int(m.group(1)) * 12), inp.get("style"))); touched = True
            if inp.get("class") is None:
                inp.set("class", ""); touched = True
        if touched:
            n += 1
    return n


def u10_section_title(body):
    n = 0
    for tb in list(_two_col_tables(body)):
        ths = [_th_label(c) for r in _rows(tb) for c in _cells(r) if c.get("tagname") == "th"]
        ths = [t for t in ths if t is not None and t.get("label")]
        if len(ths) < 2:
            continue
        labels = [t.get("label") for t in ths]
        lcp = labels[0]
        for l in labels[1:]:
            i = 0
            while i < min(len(lcp), len(l)) and lcp[i] == l[i]:
                i += 1
            lcp = lcp[:i]
        lcp = lcp.rstrip()
        if len(lcp) < 2 or re.search(r"[^\w가-힣 ]", lcp):
            continue
        # 접두가 낱말 경계에서 끝나야 한다("대상종목 …"/"대상 ETF…" 의 공통 "대상" 은 제목이 아니다): 뒤가 공백이거나 라벨 거의 전부("대상회사명")
        if any(not (l[len(lcp):len(lcp) + 1] == " " or len(l) - len(lcp) <= 2) for l in labels):
            continue
        strips = [t for t in ths if len(t.get("label")[len(lcp):].strip()) >= 3]
        if len(strips) < 2:
            continue
        wrapper = tb.getparent()
        target = wrapper if (wrapper.tag == XF + "group" and "tblbox" in _cls(wrapper)) else tb
        prev = target.getprevious()
        while prev is not None and not isinstance(prev.tag, str):
            prev = prev.getprevious()
        # 이미 제목이 있으면(안내문 txt_info 를 사이에 두고라도) 건너뛴다 — 멱등
        chk = prev
        if chk is not None and chk.tag == W2 + "textbox" and "txt_info" in _cls(chk):
            chk = chk.getprevious()
            while chk is not None and not isinstance(chk.tag, str):
                chk = chk.getprevious()
        if chk is not None and chk.tag == XF + "group" and "titbox" in _cls(chk):
            continue
        title = lcp.strip()
        for t in strips:
            t.set("label", t.get("label")[len(lcp):].strip())
        box = _mk(XF + "group", {"class": "titbox", "id": "", "style": ""})
        box.append(_mk(W2 + "textbox", {"class": "", "id": "", "label": title, "style": "", "tagname": "h3"}))
        # 바로 앞에 안내문(txt_info)이 있으면 그 위에 제목을 둔다(정답지 순서: 제목 → 안내 → 테이블)
        if prev is not None and prev.tag == W2 + "textbox" and "txt_info" in _cls(prev):
            target = prev
        base = _indent(target)
        parent = target.getparent()
        idx = list(parent).index(target)
        _pretty(box, base)
        box.tail = "\n" + base
        parent.insert(idx, box)
        n += 1
    return n


def u11_readonly(body, script):
    n = 0
    ids = set()
    for fn, s, b, e, _a in st.func_spans(script):
        if fn.startswith("setCorpInfo"):
            for m in re.finditer(r"getComponent\(\s*[\"']([\w$]+)[\"']\s*\)\s*\.setValue\(", script[b:e]):
                ids.add(m.group(1))
    if not ids:
        return 0
    for inp in body.iter(XF + "input"):
        if inp.get("id") in ids and inp.get("inputType") != "hidden" and inp.get("readOnly") is None:
            inp.set("readOnly", "true"); n += 1
    return n


# ---------------------------------------------------------------- 진입점
def apply(head, script, body_text):
    """(head, script, body, log) — body_text 는 split_regions 의 body(`</head>…<body>…</html>`)."""
    m = re.search(r"<body\b", body_text)
    if not m:
        return head, script, body_text, {}
    pre = body_text[:m.start()]
    doc = (head.split("<head", 1)[0] if "<head" in head else "") + "<head/>" + body_text[m.start():]
    # head 의 xmlns 선언만 쓰고 모델은 버린다(파싱 비용·CDATA 회피)
    root_open = re.search(r"<html\b[^>]*>", head)
    if not root_open:
        return head, script, body_text, {}
    doc = root_open.group(0) + body_text[m.start():]
    parser = etree.XMLParser(strip_cdata=False, remove_blank_text=False, resolve_entities=False)
    try:
        root = etree.fromstring(doc.encode("utf-8"), parser)
    except etree.XMLSyntaxError as ex:
        return head, script, body_text, {"error": str(ex)[:120]}
    body = root.find("{%s}body" % NS["h"])
    if body is None:
        body = root.find("body")
    if body is None:
        return head, script, body_text, {}
    script_nc = st.without_comments(script)
    log = {}
    log["U1_sub_contents"] = u1_sub_contents(body)
    log["U2_hidden"] = u2_hidden_inputs(body, script_nc)
    log["U3_iframe"] = u3_hidden_iframe(body, script_nc)
    log["U4_lybox"] = u4_lybox_notice(body)
    log["U5_rawtext"] = u5_raw_text(body)
    head, script, blog = u6_buttons(body, head, script)
    log["U6_btn"] = blog["rename"]; log["U6_span2trigger"] = blog["span2trigger"]; log["U6_label"] = blog["label"]
    script_nc = st.without_comments(script)
    log["U7_spacer"] = u7_spacer_tables(body)
    log["U8_flatten"] = u8_flatten_layout(body, script_nc)
    log["U9_twocol"] = u9_two_col(body)
    log["U10_title"] = u10_section_title(body)
    log["U11_readonly"] = u11_readonly(body, script)
    log = {k: v for k, v in log.items() if v}
    if not log:
        return head, script, body_text, {}
    out = etree.tostring(body, encoding="unicode", with_tail=False)
    out = re.sub(r"^(<body\b[^>]*?)((?:\s+xmlns(?::\w+)?=\"[^\"]*\")+)", r"\1", out, count=1)
    # body 뒤(</html>) 복원
    after = body_text[m.start():]
    tail = after[after.rfind("</body>") + len("</body>"):]
    return head, script, pre + out + tail, log


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    args = argv if argv is not None else sys.argv[1:]
    files, fl, _ = st.parse_cli(args, flags=("--dry",), opts=())
    if not files:
        print(__doc__); return 2
    changed, tot = 0, {}
    for f in files:
        raw, eol, reg = st.read_xml(f)
        if reg is None:
            continue
        head, script, body, log = apply(reg["head"], reg["script"], reg["body"])
        if log:
            changed += 1
            for k, v in log.items():
                tot[k] = tot.get(k, 0) + (v if isinstance(v, int) else 1)
            print("%-18s %s" % (Path(f).stem, log))
            if not fl["--dry"] and "error" not in log:
                st.write_xml(f, head, reg["script_open"], script, reg["script_close"], body, eol)
    print("변경 화면 %d · %s" % (changed, tot))
    return 0


if __name__ == "__main__":
    sys.exit(main())
