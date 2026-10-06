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
리포트: `conversion/jsp-front/publish_merge_report.md` (화면 · 판정 · 정합률 · 못 맞춘 항목).
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
PUB_CHROME = {"인쇄"}  # 퍼블리싱이 넣은 공통 버튼 — 공급사 대응이 없어도 auto 를 막지 않는다(공통 처리)
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
    txt = re.sub(r'^[\s■※·*:：\-]+|[\s■※·*:：\-]+$', '', txt or "")
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
    vh = {norm_label(c.get("value")): c for c in vhead}
    used = set()
    pending = []
    for i, pc in enumerate(phead):
        vc = vh.get(norm_label(pc.get("value")))
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


def merge_screen(name, pub_path, out_dir, report_only):
    raw, eol, reg = st.read_xml(TOBE / (name + ".xml"))
    pub_text = io.open(pub_path, encoding="utf-8").read()
    proot, pbody = parse_body(pub_text)
    vroot, vbody = parse_body(reg["body"])
    pitems, vitems = collect(pbody), collect(vbody)
    pmap, pdup = unique_map(pitems)
    vmap, vdup = unique_map(vitems)
    log, matched = [], 0
    # 그리드가 양쪽에 하나씩이면 헤더가 달라도 1:1
    pg = [el for k, el in pitems if k[0] == "grid"]; vg = [el for k, el in vitems if k[0] == "grid"]
    if len(pg) == 1 and len(vg) == 1:
        merge_grid(pg[0], vg[0], log); matched += 1
        pmap = {k: v for k, v in pmap.items() if k[0] != "grid"}; vmap = {k: v for k, v in vmap.items() if k[0] != "grid"}
    for k, pel in pmap.items():
        vel = vmap.get(k)
        if vel is None and k[0] == "trigger":
            alts = [a for a in SYNONYM.get(k[1], ()) if ("trigger", a) in vmap and ("trigger", a) not in pmap]
            if len(alts) == 1:
                vel = vmap[("trigger", alts[0])]; log.append("버튼 '%s' ← 공급사 '%s'(동의어)" % (k[1], alts[0]))
                vmap = {kk: vv for kk, vv in vmap.items() if kk != ("trigger", alts[0])}; vmap[k] = vel
        if vel is None and k[0] == "trigger" and ("trigger", "icon:" + ICON_OF.get(k[1], "?")) in vmap:
            ik = ("trigger", "icon:" + ICON_OF[k[1]])
            vel = vmap[ik]; log.append("버튼 '%s' ← 공급사 아이콘 %s(%s)" % (k[1], ICON_OF[k[1]], vel.get("id")))
            vmap = {kk: vv for kk, vv in vmap.items() if kk != ik}; vmap[k] = vel
        if vel is None and k[0] == "trigger" and k[1] in PUB_CHROME:
            log.append("퍼블리싱 전용 버튼 '%s'(공통 처리 대상)" % k[1]); continue
        if vel is None:
            log.append("퍼블리싱 %s '%s' ↔ 공급사 대응 없음" % (k[0], k[1] if k[0] != "grid" else "/".join(k[1])[:40])); continue
        if k[0] == "grid":
            merge_grid(pel, vel, log)
        else:
            copy_attrs(pel, vel)
        matched += 1
    for k in pdup:
        if k in vdup and len(vdup[k]) == len(pdup[k]) and k[0] != "grid":
            for pel, vel in zip(pdup[k], vdup[k]):
                copy_attrs(pel, vel)
            matched += len(pdup[k]); log.append("%s '%s' %d개 ← 같은 개수, 순서대로" % (k[0], k[1], len(pdup[k]))); continue
        log.append("퍼블리싱 %s '%s' 가 %d개(라벨 중복)" % (k[0], k[1], len(pdup[k])))
    unmatched_vendor = [k for k in vmap if k not in pmap and not (k[0] == "grid" and len(pg) == 1 and len(vg) == 1)]
    unmatched_vendor += [k for k in vdup if not (k in pdup and len(pdup[k]) == len(vdup[k]) and k[0] != "grid")]
    # 결과 body → publish_normalize(헤더 pageFrame 등) 적용
    out = etree.tostring(pbody, encoding="unicode")
    out = re.sub(r'^<body[^>]*>', lambda mm: re.sub(r'\s+xmlns(:\w+)?="[^"]*"', '', mm.group(0)), out, count=1)
    body_text = re.sub(r'<body\b.*?</body>', lambda _m: out, reg["body"], count=1, flags=re.S)
    body_text, _plog = pn.normalize_body(body_text, reg["script"])
    # 스크립트 참조 검사
    code = st.strip_for_scan(reg["script"])
    ids_new = set(re.findall(r'\sid="([^"]+)"', body_text)) | set(re.findall(r'<w2:(?:dataMap|dataList)[^>]*\sid="([^"]+)"', reg["head"]))
    refs = set(re.findall(g.ID_PREFIX, code))
    missing = sorted(refs - ids_new)
    pub_unmatched = [l for l in log if l.startswith("퍼블리싱") and "전용 버튼" not in l]
    # auto = 스크립트 참조 전부 자리잡음 · 공급사 상호작용 컴포넌트 전부 대응 · 퍼블리싱 상호작용 요소도 전부 대응(라벨 중복 없음)
    # 퍼블리싱 본문이 자리표뿐(그룹 말고 위젯이 없음)이면 아직 안 그린 화면 — 병합할 게 없다
    pub_widgets = re.findall(r'<(?:xf|w2):(?!group\b|attributes\b|summary\b|pageFrame\b)[A-Za-z]+', body_text)  # 정규화 뒤(간격 표·br 삭제 뒤) 기준
    if not pub_widgets:
        log.append("퍼블리싱 본문 비어 있음(자리표만)")
    verdict = "auto" if pub_widgets and not missing and not unmatched_vendor and not pub_unmatched and (matched or not pitems) else "review"
    total = len(pitems)
    rep = {"name": name, "verdict": verdict, "matched": matched, "pub_items": total, "missing_refs": missing,
           "unmatched_vendor": ["%s '%s'" % (k[0], k[1] if k[0] != "grid" else "grid") for k in unmatched_vendor][:8], "log": log[:8]}
    if verdict == "auto" and not report_only:
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
        if a.startswith("--") or (args.index(a) > 0 and args[args.index(a) - 1] == "--out"):
            continue
        p = Path(a)
        names += sorted(x.stem for x in p.glob("*.xml")) if p.is_dir() else [p.stem]
    idx = publish_index()
    names = [n for n in names if n.lower() in idx]
    reps = []
    for n in names:
        pub_path, ambiguous = pick_publish(idx[n.lower()])
        try:
            rep = merge_screen(n, pub_path, out_dir, report_only)
        except Exception as e:  # noqa: BLE001
            rep = {"name": n, "verdict": "error", "matched": 0, "pub_items": 0, "missing_refs": [], "unmatched_vendor": [], "log": [str(e)[:120]]}
        rep["ambiguous"] = ambiguous; rep["pub"] = os.path.relpath(pub_path, ROOT).replace("\\", "/")
        reps.append(rep)
        print("%-16s %-6s 정합 %d/%d · 참조 누락 %d · 공급사 미대응 %d %s" % (n, rep["verdict"], rep["matched"], rep["pub_items"], len(rep["missing_refs"]), len(rep["unmatched_vendor"]), "(이름 중복)" if ambiguous else ""))
    # 리포트
    L = ["# 퍼블리싱 병합 리포트 (publish ↔ ui-tobe)", "", "> `python conversion/tools/publish_merge.py conversion/jsp-front/ui-tobe` 가 만든다. "
         "`auto` 는 `conversion/jsp-front/ui-pub/` 에 병합 결과를 썼다(스크립트 참조 전부 자리잡음·공급사 상호작용 컴포넌트 전부 대응). `review` 는 사유를 보고 손으로 잇는다.", "",
         "| 화면 | 판정 | 정합/퍼블리싱 항목 | 스크립트 참조 누락 | 공급사 미대응 | 메모 |", "| --- | --- | ---: | --- | --- | --- |"]
    for r in reps:
        L.append("| %s%s | %s | %d/%d | %s | %s | %s |" % (r["name"], " ⚠중복" if r["ambiguous"] else "", r["verdict"], r["matched"], r["pub_items"],
                                                      ", ".join(r["missing_refs"][:6]), "; ".join(r["unmatched_vendor"][:4]), "; ".join(r["log"][:3]).replace("|", "\\|")))
    c = collections.Counter(r["verdict"] for r in reps)
    L.insert(4, "화면 %d · auto %d · review %d · error %d" % (len(reps), c["auto"], c["review"], c["error"]))
    L.insert(5, "")
    io.open(ROOT / "conversion" / "jsp-front" / "publish_merge_report.md", "w", encoding="utf-8", newline="\n").write("\n".join(L) + "\n")
    print("\n화면 %d · auto %d · review %d · error %d → publish_merge_report.md" % (len(reps), c["auto"], c["review"], c["error"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
