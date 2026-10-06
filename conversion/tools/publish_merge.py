# -*- coding: utf-8 -*-
"""퍼블리싱 병합 — KRX 퍼블리싱 XML(`conversion/jsp-front/publish/**`, 시각 목업·id 자동생성)의 body 에 공급사 전환본(ui-tobe)의
의미 id·이벤트·바인딩을 옮겨 심어 스크립트가 그대로 도는 화면을 만든다(가이드 샘플 JLDFIL25900 이 같은 방법으로 만들어졌다).

    python conversion/tools/publish_merge.py [--report-only] [--out conversion/jsp-front/ui-pub] <name|폴더> ...
    (폴더를 주면 그 안의 ui-tobe 화면 중 퍼블리싱 XML 이 있는 것만)

정합 규칙(퍼블리싱 요소 ← 공급사 컴포넌트):
  · 버튼  xf:trigger            라벨(xf:label CDATA 또는 label 속성) 이 같은 것(화면 안에서 유일할 때)
  · 그리드 w2:gridView          화면에 하나씩이면 1:1, 여럿이면 헤더 라벨 집합이 같은 것 — id·dataList·ev:*·속성 복사, 헤더 컬럼은 value 로,
                                본문 컬럼은 같은 위치의 헤더로 짝지어 id·displayFormatter·customFormatter·inputType 복사
  · 입력류 xf:input/xf:select1/xf:select/w2:inputCalendar/w2:textarea/w2:upload
                                같은 tr 의 앞 th 라벨(「필수」 표식 제거) 이 같은 것 — 공급사 쪽은 같은 th 라벨 아래 **같은 종류** 컴포넌트
  · 페이저 w2:pageList           화면에 하나씩이면 1:1
복사하는 속성: id · ev:* · ref · dataList · displayFormatter · customFormatter · customFormatterRealRowIndex · allowChar · maxLength · maxByteLength ·
  mandatory · readOnly · disabled · inputType(그리드 컬럼만). 퍼블리싱의 class·style·폭·순서는 그대로.

판정: 스크립트가 참조하는 body id(게이트와 같은 잣대)가 전부 병합 본문에 있고 공급사 쪽 **대응 못 한 상호작용 컴포넌트가 없으면** `auto` —
  병합 결과를 `--out` 폴더에 쓴다(head·script 는 ui-tobe 그대로 + 병합 body → publish_normalize 로 pageFrame 헤더 치환). 아니면 `review` 로 사유만 적는다.
리포트: `conversion/jsp-front/publish_merge_report.md` (화면 · 판정 · 정합률 · 못 맞춘 항목). `--detail <json>` 은 review 화면의 남은 항목을 기계 형식으로.

정합 순서: ① 같은 키·같은 개수(순서대로) ② 그리드 1:1 ③ 버튼 뜻 토큰(CANON: 조회↔검색↔icon:search …)·같은 개수 ④ 닫기 여럿↔하나
  ④b 같은 키 개수 다름 → 적은 쪽만큼 순서대로 ④c 그리드 개수 같음 → 순서대로 ⑤ 화면별 override(`conversion/jsp-front/publish_merge_overrides.json`)
  ⑥ 퍼블리싱 전용 공통 버튼(인쇄·도움말) ⑦ 스크립트가 쓰는 공급사 요소가 없으면 옮겨 넣음 ⑧ 남은 공급사 요소 옮겨 넣음(버튼은 마지막 btnbox/titbox rt)
  ⑨ 남은 퍼블리싱 요소는 둠 — ⑦~⑨ 는 본문에 `<!-- TODO Stage2(퍼블리싱 병합): … -->` 표지(판정 `todo`).
override 형식(화면 이름 → 객체; 항목 지정은 'kind:label' 또는 같은 키가 여럿이면 'kind:label#n', 공급사 쪽은 id 도 됨):
  {"jldfil00013": {"note": "왜", "pair": {"trigger:제출": "btn_submit"}, "keep": ["pageList:"], "drop": ["select:시장구분"],
                   "vendor_skip": ["grd_subEditCla"], "insert": [{"vendor": "ipt_hidden1", "at": "end|after:<spec>|before:<spec>|into:<spec>"}]}}
  pair = 퍼블리싱 요소 ← 공급사 요소 · keep = 대응 없이 둔다(공통 처리·디자인 추가분) · drop = 퍼블리싱 요소 삭제 · vendor_skip = 공급사 요소를 안 옮긴다(스크립트가
  안 쓸 때만 닫힌다) · insert = 공급사 요소를 그대로 옮겨 넣는다(hidden 입력 등). override 로 닫힌 화면은 판정 `manual`.
"""
import collections
import copy
import glob
import io
import os
import re
import sys
from pathlib import Path

from lxml import etree

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402
import gate_screen as g  # noqa: E402
import publish_normalize as pn  # noqa: E402

ROOT = st.ROOT
PUB_DIR = ROOT / "conversion" / "jsp-front" / "publish"
TOBE = ROOT / "conversion" / "jsp-front" / "ui-tobe"
XF, W2, EV = pn.XF, pn.W2, pn.EV
T = lambda ns, n: "{%s}%s" % (ns, n)  # noqa: E731
CONTROLS = {T(XF, "input"), T(XF, "select1"), T(XF, "select"), T(W2, "inputCalendar"), T(W2, "textarea"), T(W2, "upload")}
SYNONYM = {"조회": ("검색",), "검색": ("조회",), "등록": ("저장",), "저장": ("등록",), "닫기": ("취소",)}
OVERRIDES_PATH = ROOT / "conversion" / "jsp-front" / "publish_merge_overrides.json"
# 버튼 뜻(action) 표 — 라벨이 달라도 같은 뜻이면 잇는다(양쪽 개수가 같을 때만, 순서대로). 공급사 아이콘 버튼 icon:<x> 도 같은 토큰.
CANON = {"조회": "search", "검색": "search", "search": "search", "닫기": "close", "취소": "close", "저장": "save", "등록": "save",
         "엑셀다운로드": "download", "엑셀다운": "download", "엑셀": "download", "다운로드": "download", "도움말": "guide", "이전": "prev",
         "다음": "next", "삭제": "delete", "목록": "list_more", "더보기": "list_more", "행추가": "row_add", "추가": "row_add",
         "행삭제": "row_del", "초기화": "refresh", "새로고침": "refresh", "주소검색": "address", "주소": "address", "메일": "mail", "복사": "copy",
         "인쇄": "print", "확인": "confirm", "제출": "submit", "수정": "modify"}
PUB_CHROME = {"인쇄", "도움말", "닫기", "Close", "close"}  # 공급사 대응이 없으면 공통 처리(인쇄·도움말·팝업 닫기)  # 퍼블리싱이 넣은 공통 버튼 — 공급사 대응이 없어도 auto 를 막지 않는다(공통 처리)
# 공급사 라벨 없는 아이콘 버튼(class="btn_cm <icon> icon") ← 퍼블리싱 글자 버튼 라벨
ICON_OF = {"조회": "search", "검색": "search", "닫기": "close", "취소": "close", "저장": "save", "등록": "save", "도움말": "guide", "이전": "prev",
           "다음": "next", "삭제": "delete", "다운로드": "download", "엑셀다운로드": "download", "엑셀": "download", "목록": "list_more",
           "더보기": "list_more", "행추가": "row_add", "추가": "row_add", "행삭제": "row_del", "초기화": "refresh", "새로고침": "refresh",
           "주소검색": "address", "주소": "address", "메일": "mail", "복사": "copy"}
ICON_RE = re.compile(r'(?<![\w-])btn_cm\s+([a-z_]+)\s+icon(?![\w-])')
GEN_GRID_ID = re.compile(r'^(caption|row|column|col|gridView|header|gBody)\d*$')
GRID_SKIP_HEAD = {"번호", "", "선택"}  # 그리드 키 비교에서 빼는 헤더(퍼블리싱은 rowNum·체크 컬럼으로 처리)
COPY_ATTRS = ("id", "ref", "dataList", "displayFormatter", "customFormatter", "customFormatterRealRowIndex", "allowChar", "maxLength",
              "maxByteLength", "mandatory", "readOnly", "disabled")


def publish_index():
    idx = {}
    for f in glob.glob(str(PUB_DIR / "**" / "*.xml"), recursive=True):
        idx.setdefault(os.path.basename(f)[:-4].lower(), []).append(f)
    return idx


def pick_publish(cands):
    """같은 이름이 둘이면 대외(제출) 폴더 우선(jsp-front = 대외 제출 시스템)."""
    cands = sorted(cands, key=lambda p: (0 if "대외" in p else 1, p))
    return cands[0], len(cands) > 1


def parse_body(text):
    m = re.search(r'<body\b.*?</body>', text, re.S)
    root = etree.fromstring("<root %s>%s</root>" % (pn.NSDECL, m.group(0)), etree.XMLParser(strip_cdata=False, remove_blank_text=False))
    return root, root[0]


def norm_label(txt):
    """비교용 라벨: 앞머리 표식(■·※·*·:)·「필수」·공백 제거 — '■ 제목'='제목', '이 름'='이름', '회사명 *'='회사명'."""
    txt = re.sub(r'<[^>]*>|</>', '', txt or "")  # 라벨에 섞인 <br/>·'</>' 조각
    txt = re.sub(r'^[\s■※·*:：\-]+|[\s■※·*:：\-]+$', '', txt)
    txt = txt.replace("필수", "")
    return re.sub(r'\s+', '', txt) or None


def text_label(el):
    """버튼·텍스트박스의 보이는 글자(정규화)."""
    lab = el.get("label") or el.get("value")
    if lab and lab.strip():
        return norm_label(lab)
    x = el.find(T(XF, "label"))
    if x is not None and (x.text or "").strip():
        return norm_label(x.text)
    return None


def th_label(el):
    """같은 tr 의 앞쪽 th 라벨(마지막 th). 「필수」 표식·'*' 제거."""
    td = el
    while td is not None and td.get("tagname") not in ("td", "th"):
        td = td.getparent()
    if td is None:
        return None
    tr = td.getparent()
    th = None
    for sib in tr:
        if sib is td:
            break
        if sib.get("tagname") == "th":
            th = sib
    if th is None:
        return None
    parts = []
    for tb in th.iter():
        if tb.tag == T(W2, "textbox"):
            lab = tb.get("label") or ""
            if lab.strip() and lab.strip() not in ("필수", "*"):
                parts.append(lab.strip())
    txt = " ".join(parts) or (th.text or "").strip()
    return norm_label(txt)


def kind(el):
    if el.tag == T(XF, "input"):
        return "input"
    if el.tag in (T(XF, "select1"), T(XF, "select")):
        return "select"
    return etree.QName(el).localname


def collect(body):
    """정합 대상 요소 목록: [(key, element)] — key = (종류, 라벨)."""
    items = []
    for el in body.iter():
        if not isinstance(el.tag, str):
            continue
        if el.tag == T(XF, "trigger"):
            lab = text_label(el)
            if not lab:
                mi = ICON_RE.search(el.get("class") or "")
                lab = ("icon:" + mi.group(1)) if mi else None
            if lab:
                items.append((("trigger", lab), el))
        elif el.tag == T(W2, "gridView"):
            heads = tuple(sorted({norm_label(c.get("value")) or "" for c in el.iter(T(W2, "column")) if c.getparent().getparent().tag == T(W2, "header")} - GRID_SKIP_HEAD))
            items.append((("grid", heads), el))
        elif el.tag == T(W2, "pageList"):
            items.append((("pageList", ""), el))
        elif el.tag in CONTROLS:
            if (el.get("inputType") or "") == "hidden" or "display:none" in (el.get("style") or ""):
                continue
            lab = th_label(el)
            items.append(((kind(el), lab or ""), el))  # 표 밖 컨트롤은 라벨 '' — 종류별로 하나씩이면 1:1
    return items


def unique_map(items):
    by = collections.defaultdict(list)
    for k, el in items:
        by[k].append(el)
    return {k: v[0] for k, v in by.items() if len(v) == 1}, {k: v for k, v in by.items() if len(v) > 1}


def copy_attrs(dst, src, grid_col=False):
    for a in COPY_ATTRS + (("inputType",) if grid_col else ()):
        if src.get(a) is not None:
            dst.set(a, src.get(a))
    for k, v in src.attrib.items():
        if k.startswith("{%s}" % EV):
            dst.set(k, v)
    if dst.tag in (T(XF, "select1"), T(XF, "select")):
        # 목업 항목(new row …)은 버리고 공급사 choices/itemset 을 그대로 가져온다
        for ch in list(dst):
            if ch.tag in (T(XF, "choices"), T(XF, "itemset")):
                dst.remove(ch)
        for ch in src:
            if ch.tag in (T(XF, "choices"), T(XF, "itemset")):
                dst.append(copy.deepcopy(ch))


def merge_grid(pel, vel, log):
    copy_attrs(pel, vel)
    pel.set("id", vel.get("id") or pel.get("id"))
    for a in ("visibleRowNum", "rowNumVisible", "focusMode", "autoFit"):
        if vel.get(a) is not None:
            pel.set(a, vel.get(a))
    vhead = [c for c in vel.iter(T(W2, "column")) if c.getparent().getparent().tag == T(W2, "header")]
    vbody = [c for c in vel.iter(T(W2, "column")) if c.getparent().getparent().tag == T(W2, "gBody")]
    phead = [c for c in pel.iter(T(W2, "column")) if c.getparent().getparent().tag == T(W2, "header")]
    pbody = [c for c in pel.iter(T(W2, "column")) if c.getparent().getparent().tag == T(W2, "gBody")]
    vh = collections.defaultdict(list)
    for c in vhead:
        vh[norm_label(c.get("value"))].append(c)
    used = set()
    pending = []
    for i, pc in enumerate(phead):
        cands = vh.get(norm_label(pc.get("value")))
        vc = cands.pop(0) if cands else None
        if vc is None:
            log.append("그리드 헤더 '%s' 공급사 쪽 없음" % pc.get("value")); pending.append(i); continue
        pc.set("id", vc.get("id") or pc.get("id")); used.add(pc.get("id"))
        j = vhead.index(vc)
        if i < len(pbody) and j < len(vbody):
            copy_attrs(pbody[i], vbody[j], grid_col=True); used.add(pbody[i].get("id"))
    # 대응 없는 퍼블리싱 컬럼(목업 id column8 …)이 복사해 온 공급사 id 와 겹치면 뒤에 _pub 을 붙여 유일하게(WS120)
    for i in pending:
        for col in (phead[i],) + ((pbody[i],) if i < len(pbody) else ()):
            cid = col.get("id") or ""
            if cid in used:
                col.set("id", cid + "_pub")
            used.add(col.get("id"))
    cap, vcap = pel.find(T(W2, "caption")), vel.find(T(W2, "caption"))
    if cap is not None:
        if vcap is not None and (vcap.get("value") or "").strip():
            cap.set("value", vcap.get("value"))
        elif "grid caption" in (cap.get("value") or ""):
            cap.set("value", "")  # 목업 문구는 비운다(값을 지어내지 않음)
        if vcap is not None and vcap.get("id"):
            cap.set("id", vcap.get("id"))
        elif GEN_GRID_ID.match(cap.get("id") or ""):
            cap.set("id", "")
    # 목업 id(caption2·row3 …)는 퍼블리싱 파일 안에서도 그리드마다 되풀이돼 WS120 — 공급사 row id 가 있으면 그것, 없으면 빈 id
    for sub in (T(W2, "header"), T(W2, "gBody")):
        ps, vs = pel.find(sub), vel.find(sub)
        prow = list(ps.iter(T(W2, "row"))) if ps is not None else []
        vrow = list(vs.iter(T(W2, "row"))) if vs is not None else []
        for i, r in enumerate(prow):
            if i < len(vrow) and vrow[i].get("id"):
                r.set("id", vrow[i].get("id"))
            elif GEN_GRID_ID.match(r.get("id") or ""):
                r.set("id", "")
    for sub in (T(W2, "header"), T(W2, "gBody")):
        ps, vs = pel.find(sub), vel.find(sub)
        if ps is not None and vs is not None and vs.get("id"):
            ps.set("id", vs.get("id"))


def key_str(k):
    return "%s:%s" % (k[0], "/".join(k[1]) if k[0] == "grid" else k[1])


def canon(k):
    """trigger 키 → 뜻 토큰(없으면 None)."""
    if k[0] != "trigger":
        return None
    lab = k[1]
    if lab.startswith("icon:"):
        return lab[5:]
    return CANON.get(lab) or CANON.get(lab.lower())


def load_overrides():
    if OVERRIDES_PATH.exists():
        import json
        return json.load(io.open(OVERRIDES_PATH, encoding="utf-8"))
    return {}


def numbered(items):
    """[(key, el)] → [(spec, key, el)] — spec = 'kind:label' 또는 같은 키가 여럿이면 'kind:label#n'(1부터)."""
    cnt = collections.Counter(k for k, _ in items)
    seen = collections.Counter()
    out = []
    for k, el in items:
        seen[k] += 1
        spec = key_str(k) + ("#%d" % seen[k] if cnt[k] > 1 else "")
        out.append((spec, k, el))
    return out


def resolve(entries, spec, by_id=False):
    """override 의 한쪽 지정을 요소로. 공급사 쪽은 id 로도 찾는다(body 전체가 아니라 정합 대상 목록 안에서)."""
    for sp, k, el in entries:
        if sp == spec or (by_id and el.get("id") == spec):
            return (sp, k, el)
    return None


def pair(pel, vel, k, log, why=""):
    if k[0] == "grid" or vel.tag == T(W2, "gridView"):
        merge_grid(pel, vel, log)
    else:
        copy_attrs(pel, vel)
    if why:
        log.append(why)


def match(pitems, vitems, ov, log):
    """다단계 정합. 돌려주는 것: matched 수, 남은 퍼블리싱 항목, 남은 공급사 항목, 막지 않는 항목 수."""
    P, V = numbered(pitems), numbered(vitems)
    matched = 0
    used_p, used_v = set(), set()

    def take(groups_p, groups_v, why):
        nonlocal matched
        for gk, ps in groups_p.items():
            vs = groups_v.get(gk)
            if not vs or len(vs) != len(ps):
                continue
            for (ps_, pk, pel), (vs_, vk, vel) in zip(ps, vs):
                pair(pel, vel, pk, log, why(ps_, vs_, vel) if (ps_ != vs_ or pk != vk) else "")
                used_p.add(ps_); used_v.add(vs_); matched += 1

    def left(entries, used):
        return [e for e in entries if e[0] not in used]

    def group(entries, fn):
        g = collections.OrderedDict()
        for e in entries:
            gk = fn(e[1])
            if gk is not None:
                g.setdefault(gk, []).append(e)
        return g

    # 1 같은 키, 같은 개수 → 순서대로(1:1 포함)
    take(group(P, lambda k: k), group(V, lambda k: k), lambda a, b, vel: "%s %s개 ← 같은 개수, 순서대로" % (a.split("#")[0], a.split("#")[1]) if "#" in a else "")
    # 2 그리드가 양쪽에 하나씩 남으면 헤더가 달라도 1:1
    pg = [e for e in left(P, used_p) if e[1][0] == "grid"]; vg = [e for e in left(V, used_v) if e[1][0] == "grid"]
    if len(pg) == 1 and len(vg) == 1:
        pair(pg[0][2], vg[0][2], pg[0][1], log, "그리드 1:1(헤더 다름)"); used_p.add(pg[0][0]); used_v.add(vg[0][0]); matched += 1
    # 3 버튼 뜻 토큰이 같고 개수가 같으면 → 순서대로(조회↔검색↔icon:search …)
    take(group(left(P, used_p), canon), group(left(V, used_v), canon), lambda a, b, vel: "버튼 '%s' ← 공급사 '%s'(%s, 같은 뜻)" % (a, b, vel.get("id")))
    # 4 닫기류: 퍼블리싱에 닫기가 여럿(상단 X + 하단 버튼)이고 공급사가 하나면 — 첫째에 id·이벤트, 나머지는 이벤트만
    pc = [e for e in left(P, used_p) if canon(e[1]) == "close"]; vc = [e for e in left(V, used_v) if canon(e[1]) == "close"]
    if len(pc) > 1 and len(vc) == 1:
        for i, (ps_, pk, pel) in enumerate(pc):
            if i == 0:
                copy_attrs(pel, vc[0][2])
            else:
                for a, v in vc[0][2].attrib.items():
                    if a.startswith("{%s}" % EV):
                        pel.set(a, v)
            used_p.add(ps_)
        used_v.add(vc[0][0]); matched += 1
        log.append("닫기 %d개 ← 공급사 닫기 1개(%s): 첫째 id+이벤트, 나머지 이벤트만" % (len(pc), vc[0][2].get("id")))
    # 4b 같은 키인데 개수가 다르면(라벨 있는 것만) 적은 쪽만큼 순서대로 — 나머지는 TODO 로 남는다(전화번호 3분할 ↔ 1칸 등)
    gp, gv = group(left(P, used_p), lambda k: k if k[1] else None), group(left(V, used_v), lambda k: k if k[1] else None)
    for gk, ps in gp.items():
        vs = gv.get(gk)
        if not vs or gk[0] == "grid":
            continue
        for (ps_, pk, pel), (vs_, vk, vel) in zip(ps, vs):
            pair(pel, vel, pk, log); used_p.add(ps_); used_v.add(vs_); matched += 1
        log.append("%s 퍼블리싱 %d개 ↔ 공급사 %d개: 앞에서부터 %d개 이음(나머지 TODO)" % (key_str(gk), len(ps), len(vs), min(len(ps), len(vs))))
    # 4c 그리드 개수가 같으면 헤더가 달라도 순서대로
    pg = [e for e in left(P, used_p) if e[1][0] == "grid"]; vg = [e for e in left(V, used_v) if e[1][0] == "grid"]
    if pg and len(pg) == len(vg):
        for (ps_, pk, pel), (vs_, vk, vel) in zip(pg, vg):
            pair(pel, vel, pk, log, "그리드 순서대로: %s ← %s" % (ps_[:40], vel.get("id"))); used_p.add(ps_); used_v.add(vs_); matched += 1
    # 4d 그리드 개수가 달라도 헤더 집합이 닮으면(자카드 ≥ 0.5, 큰 것부터) 잇는다 — 퍼블리싱 그룹 헤더·공급사 번호 컬럼 차이 흡수
    pg = [e for e in left(P, used_p) if e[1][0] == "grid"]; vg = [e for e in left(V, used_v) if e[1][0] == "grid"]
    if pg and vg:
        cands = []
        for pe in pg:
            for ve in vg:
                a, b = set(pe[1][1]), set(ve[1][1])
                if a and b:
                    cands.append((len(a & b) / len(a | b), pe, ve))
        for score, pe, ve in sorted(cands, key=lambda x: -x[0]):
            if score < 0.5 or pe[0] in used_p or ve[0] in used_v:
                continue
            pair(pe[2], ve[2], pe[1], log, "그리드 닮음 %.2f: %s ← %s" % (score, pe[0][:40], ve[2].get("id"))); used_p.add(pe[0]); used_v.add(ve[0]); matched += 1
    # 5 화면별 override
    nonblock = 0
    for pspec, vspec in (ov.get("pair") or {}).items():
        pe = resolve(left(P, used_p), pspec); ve = resolve(left(V, used_v), vspec, by_id=True)
        if pe is None or ve is None:
            log.append("override pair 못 찾음: %s ← %s" % (pspec, vspec)); continue
        pair(pe[2], ve[2], pe[1], log, "override: %s ← %s" % (pspec, vspec)); used_p.add(pe[0]); used_v.add(ve[0]); matched += 1
    for pspec in ov.get("keep") or []:
        pe = resolve(left(P, used_p), pspec)
        if pe is None:
            log.append("override keep 못 찾음: %s" % pspec); continue
        used_p.add(pe[0]); nonblock += 1; log.append("override keep: %s(대응 없이 둠)" % pspec)
    for pspec in ov.get("drop") or []:
        pe = resolve(left(P, used_p), pspec)
        if pe is None:
            log.append("override drop 못 찾음: %s" % pspec); continue
        el = pe[2]
        if el.getparent() is not None:
            el.getparent().remove(el)
        used_p.add(pe[0]); nonblock += 1; log.append("override drop: %s" % pspec)
    for vspec in ov.get("vendor_skip") or []:
        ve = resolve(left(V, used_v), vspec, by_id=True)
        if ve is None:
            log.append("override vendor_skip 못 찾음: %s" % vspec); continue
        used_v.add(ve[0]); nonblock += 1; log.append("override vendor_skip: %s(새 디자인에 자리 없음)" % vspec)
    # 6 퍼블리싱 전용 공통 버튼(인쇄)은 막지 않는다
    for ps_, pk, pel in left(P, used_p):
        if pk[0] == "trigger" and (pk[1] in PUB_CHROME or canon(pk) in ("print", "guide")):
            used_p.add(ps_); nonblock += 1; log.append("퍼블리싱 전용 버튼 '%s'(공통 처리 대상)" % pk[1])
    return matched, left(P, used_p), left(V, used_v), nonblock


def apply_inserts(pbody, vbody, P_left, ov, log):
    """override insert: 공급사 요소를 퍼블리싱 body 에 그대로 옮긴다(새 디자인에 자리 없는데 스크립트가 쓰는 것 — hidden 입력 등)."""
    for ins in ov.get("insert") or []:
        vid, at = ins.get("vendor"), ins.get("at", "end")
        vel = next((e for e in vbody.iter() if isinstance(e.tag, str) and e.get("id") == vid), None)
        if vel is None:
            log.append("override insert 못 찾음: %s" % vid); continue
        node = copy.deepcopy(vel)
        if at == "end":
            top = next((gq for gq in pbody.iter(T(XF, "group")) if "sub_contents" in (gq.get("class") or "") or "pop_contents" in (gq.get("class") or "")), pbody)
            append_pretty(top, node)
        else:
            where, _, spec = at.partition(":")
            tgt = next((el for sp, k, el in numbered(collect(pbody)) if sp == spec), None)
            if tgt is None:
                log.append("override insert 자리 못 찾음: %s" % at); continue
            if where == "into":
                tgt.append(node)
            elif where == "before":
                tgt.addprevious(node)
            else:
                tgt.addnext(node)
        log.append("override insert: %s @ %s" % (vid, at))


TODO_TAG = " TODO Stage2(퍼블리싱 병합): "


def todo_before(el, text):
    c = etree.Comment(TODO_TAG + text + " ")
    prev = el.getprevious()
    indent = prev.tail if prev is not None else el.getparent().text
    el.addprevious(c)
    c.tail = indent if indent and indent.strip() == "" else "\n"


def button_area(pbody):
    """공급사 버튼을 넣을 자리: 마지막 btnbox/titbox 의 rt 그룹, 없으면 None."""
    cands = [gq for gq in pbody.iter(T(XF, "group")) if re.search(r'(^|\s)(btnbox|titbox)(\s|$)', gq.get("class") or "")]
    if not cands:
        return None
    box = cands[-1]
    rt = [gq for gq in box.iter(T(XF, "group")) if re.search(r'(^|\s)rt(\s|$)', gq.get("class") or "")]
    return rt[-1] if rt else box


def append_pretty(container, node):
    inner = container.text if (container.text or "").strip() == "" and container.text else "\n"
    if len(container):
        last = container[-1]
        node.tail = last.tail; last.tail = inner
    else:
        node.tail = inner
    container.append(node)


def place_leftovers(pbody, vbody, p_left, v_left, refs, log):
    """⑦ 스크립트가 쓰는 공급사 요소가 병합 본문에 없으면 옮겨 넣고 ⑧ 남은 공급사 요소도 옮겨 넣고(버튼은 버튼 자리) ⑨ 남은 퍼블리싱 요소는 두되 —
    전부 TODO 표지를 단다(값·자리를 지어내지 않고 드러낸다). 돌려주는 것: TODO 수."""
    top = next((gq for gq in pbody.iter(T(XF, "group")) if re.search(r'(^|\s)(sub_contents|pop_contents)(\s|$)', gq.get("class") or "")), pbody)
    todo = 0
    placed = set()
    for sp, k, vel in v_left:
        node = copy.deepcopy(vel)
        tgt = button_area(pbody) if k[0] == "trigger" else None
        append_pretty(tgt if tgt is not None else top, node)
        todo_before(node, "공급사 %s(%s) 를 옮겨 넣음 — 퍼블리싱에 대응 요소 없음, 자리·디자인 확인" % (sp, vel.get("id") or "-"))
        placed.add(vel.get("id")); todo += 1
        log.append("공급사 %s(%s) 옮겨 넣음(TODO)" % (sp[:40], vel.get("id") or "-"))
    have = {e.get("id") for e in pbody.iter() if isinstance(e.tag, str) and e.get("id")}
    for rid in sorted(refs):
        if rid in have or rid in placed:
            continue
        vel = next((e for e in vbody.iter() if isinstance(e.tag, str) and e.get("id") == rid), None)
        if vel is None:
            continue
        # 부모 안에 이미 옮긴 요소가 있으면 중복
        if any(a.get("id") in placed for a in vel.iterancestors()):
            continue
        node = copy.deepcopy(vel)
        append_pretty(top, node)
        todo_before(node, "스크립트가 쓰는 공급사 %s#%s 를 옮겨 넣음 — 퍼블리싱에 없음, 자리 확인" % (etree.QName(vel).localname, rid))
        placed.add(rid); have |= {e.get("id") for e in node.iter() if isinstance(e.tag, str) and e.get("id")}; todo += 1
        log.append("참조 %s 옮겨 넣음(TODO)" % rid)
    for sp, k, pel in p_left:
        todo_before(pel, "퍼블리싱 %s 에 공급사 대응 없음 — 핸들러·바인딩 없이 둠(디자인 추가분이면 기능 확인)" % sp)
        todo += 1
    return todo


def tidy_mock(pbody, script, log):
    """퍼블리싱 목업이 남긴 것 정리: ① 스크립트에 정의 없는 `ev:*="scwin.x"`(퍼블리셔가 적어 둔 가짜 핸들러) 제거
    ② 같은 id 가 되풀이되면(panelTitle1 ×10 같은 목업) 첫째만 두고 비운다."""
    defined = set(re.findall(r'^scwin\.(\w+)\s*=\s*(?:async\s+)?function', script, re.M))
    n_ev = 0
    for el in pbody.iter():
        if not isinstance(el.tag, str):
            continue
        for a, v in list(el.attrib.items()):
            if a.startswith("{%s}" % EV):
                m = re.match(r'^\s*scwin\.(\w+)\s*(?:\(|$)', v)
                if m and m.group(1) not in defined:
                    del el.attrib[a]; n_ev += 1
    if n_ev:
        log.append("퍼블리싱 목업 핸들러 %d개 제거(스크립트에 정의 없음)" % n_ev)
    seen = set(); n_id = 0
    for el in pbody.iter():
        if not isinstance(el.tag, str):
            continue
        i = el.get("id")
        if not i:
            continue
        if i in seen:
            el.set("id", ""); n_id += 1
        seen.add(i)
    if n_id:
        log.append("퍼블리싱 목업 중복 id %d개 비움" % n_id)


def merge_screen(name, pub_path, out_dir, report_only, overrides=None):
    ov = (overrides or {}).get(name) or {}
    raw, eol, reg = st.read_xml(TOBE / (name + ".xml"))
    pub_text = io.open(pub_path, encoding="utf-8").read()
    proot, pbody = parse_body(pub_text)
    vroot, vbody = parse_body(reg["body"])
    pitems, vitems = collect(pbody), collect(vbody)
    log = []
    matched, p_left, v_left, nonblock = match(pitems, vitems, ov, log)
    apply_inserts(pbody, vbody, p_left, ov, log)
    code = st.strip_for_scan(reg["script"])
    refs = set(re.findall(g.ID_PREFIX, code)) - set(re.findall(r'<w2:(?:dataMap|dataList)[^>]*\sid="([^"]+)"', reg["head"]))
    todo = place_leftovers(pbody, vbody, p_left, v_left, refs, log)
    tidy_mock(pbody, reg["script"], log)
    # 결과 body → publish_normalize(헤더 pageFrame 등) 적용
    out = etree.tostring(pbody, encoding="unicode")
    out = re.sub(r'^<body[^>]*>', lambda mm: re.sub(r'\s+xmlns(:\w+)?="[^"]*"', '', mm.group(0)), out, count=1)
    body_text = re.sub(r'<body\b.*?</body>', lambda _m: out, reg["body"], count=1, flags=re.S)
    body_text, _plog = pn.normalize_body(body_text, reg["script"])
    # 스크립트 참조 검사 — 공급사 body 에 있던 것이 병합 본문에 없으면 막는다. 공급사 body 에도 없던 참조(서버 렌더·동적 조립)는 게이트처럼 보고만
    ids_new = set(re.findall(r'\sid="([^"]+)"', body_text))
    vendor_ids = set(re.findall(r'\sid="([^"]+)"', reg["body"]))
    missing = sorted((refs & vendor_ids) - ids_new)
    missing_both = sorted(refs - vendor_ids - ids_new)
    if missing_both:
        log.append("참조 %d개는 공급사 body 에도 없음(게이트 report-only): %s" % (len(missing_both), ", ".join(missing_both[:4])))
    # 퍼블리싱 본문이 자리표뿐(그룹 말고 위젯이 없음)이면 아직 안 그린 화면 — 병합할 게 없다
    pub_widgets = re.findall(r'<(?:xf|w2):(?!group\b|attributes\b|summary\b|pageFrame\b)[A-Za-z]+', body_text)
    if not pub_widgets:
        log.append("퍼블리싱 본문 비어 있음(자리표만)")
    # 닫힘: 정합이 하나라도 있거나, 공급사에 이을 것이 없거나, 퍼블리싱에 이을 것이 없고 공급사 것이 적어(5개 미만) 옮겨 넣어도 되는 경우.
    # 양쪽에 항목이 있는데 하나도 못 이으면(구조가 다른 디자인·잘못 짝지어진 퍼블리싱 파일) review.
    closed = bool(pub_widgets) and not missing and (matched or not vitems or (not pitems and len(vitems) < 5))
    verdict = ("manual" if ov else ("todo" if todo else "auto")) if closed else "review"
    rep = {"name": name, "verdict": verdict, "matched": matched, "pub_items": len(pitems), "missing_refs": missing, "todo": todo,
           "unmatched_vendor": ["%s(%s)" % (sp, el.get("id") or "-") for sp, k, el in v_left][:8], "log": log[:8],
           "detail": {"pub_left": [sp for sp, k, el in p_left], "ven_left": [[sp, el.get("id") or "", {a.split("}")[1]: v for a, v in el.attrib.items() if a.startswith("{%s}" % EV)}] for sp, k, el in v_left],
                      "missing_refs": missing, "pub_items": [sp for sp, k, el in numbered(pitems)], "ven_items": [[sp, el.get("id") or ""] for sp, k, el in numbered(vitems)]}}
    if closed and not report_only:
        out_dir.mkdir(parents=True, exist_ok=True)
        st.write_xml(out_dir / (name + ".xml"), reg["head"], reg["script_open"], reg["script"], reg["script_close"], body_text, eol)
    return rep


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    args = argv if argv is not None else sys.argv[1:]
    report_only = "--report-only" in args
    out_dir = ROOT / "conversion" / "jsp-front" / "ui-pub"
    if "--out" in args:
        out_dir = Path(args[args.index("--out") + 1])
    names = []
    for a in args:
        if a.startswith("--") or (args.index(a) > 0 and args[args.index(a) - 1] in ("--out", "--detail")):
            continue
        p = Path(a)
        names += sorted(x.stem for x in p.glob("*.xml")) if p.is_dir() else [p.stem]
    detail_path = Path(args[args.index("--detail") + 1]) if "--detail" in args else None
    idx = publish_index()
    names = [n for n in names if n.lower() in idx]
    overrides = load_overrides()
    reps = []
    for n in names:
        pub_path, ambiguous = pick_publish(idx[n.lower()])
        try:
            rep = merge_screen(n, pub_path, out_dir, report_only, overrides)
        except Exception as e:  # noqa: BLE001
            rep = {"name": n, "verdict": "error", "matched": 0, "pub_items": 0, "missing_refs": [], "unmatched_vendor": [], "log": [str(e)[:120]], "detail": {}, "todo": 0}
        rep["ambiguous"] = ambiguous; rep["pub"] = os.path.relpath(pub_path, ROOT).replace("\\", "/")
        reps.append(rep)
        print("%-16s %-6s 정합 %d/%d · 참조 누락 %d · 공급사 미대응 %d %s" % (n, rep["verdict"], rep["matched"], rep["pub_items"], len(rep["missing_refs"]), len(rep["unmatched_vendor"]), "(이름 중복)" if ambiguous else ""))
    # 리포트
    L = ["# 퍼블리싱 병합 리포트 (publish ↔ ui-tobe)", "", "> `python conversion/tools/publish_merge.py conversion/jsp-front/ui-tobe` 가 만든다. "
         "`auto` 는 `conversion/jsp-front/ui-pub/` 에 병합 결과를 썼다(스크립트 참조 전부 자리잡음·공급사 상호작용 컴포넌트 전부 대응). "
         "`todo` 는 닫혔지만 본문에 `TODO Stage2(퍼블리싱 병합)` 표지가 있는 것(공급사 요소를 옮겨 넣었거나 퍼블리싱 요소에 대응이 없음 — 자리·기능 확인). "
         "`manual` 은 `publish_merge_overrides.json` 의 화면별 지시(pair/keep/drop/vendor_skip/insert)로 닫은 것. `review` 는 스크립트 참조를 못 채웠거나 퍼블리싱 본문이 비어 있다.", "",
         "| 화면 | 판정 | 정합/퍼블리싱 항목 | TODO | 스크립트 참조 누락 | 공급사 미대응(옮겨 넣음) | 메모 |", "| --- | --- | ---: | ---: | --- | --- | --- |"]
    for r in reps:
        L.append("| %s%s | %s | %d/%d | %d | %s | %s | %s |" % (r["name"], " ⚠중복" if r["ambiguous"] else "", r["verdict"], r["matched"], r["pub_items"], r.get("todo", 0),
                                                           ", ".join(r["missing_refs"][:6]), "; ".join(r["unmatched_vendor"][:4]), "; ".join(r["log"][:4]).replace("|", "\\|")))
    c = collections.Counter(r["verdict"] for r in reps)
    L.insert(4, "화면 %d · auto %d · todo %d(표지 %d건) · manual(override) %d · review %d · error %d" % (len(reps), c["auto"], c["todo"], sum(r.get("todo", 0) for r in reps), c["manual"], c["review"], c["error"]))
    L.insert(5, "")
    io.open(ROOT / "conversion" / "jsp-front" / "publish_merge_report.md", "w", encoding="utf-8", newline="\n").write("\n".join(L) + "\n")
    if detail_path:
        import json
        json.dump({r["name"]: dict(r["detail"], verdict=r["verdict"], todo=r.get("todo", 0), log=r["log"]) for r in reps if r["verdict"] in ("review", "todo")}, io.open(detail_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("\n화면 %d · auto %d · todo %d(표지 %d건) · manual %d · review %d · error %d → publish_merge_report.md" % (len(reps), c["auto"], c["todo"], sum(r.get("todo", 0) for r in reps), c["manual"], c["review"], c["error"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
