# -*- coding: utf-8 -*-
"""jsp-front(공급사 r13) 화면 전환 파이프라인 — ui/<name>.xml → ui-tobe/<name>.xml

    python conversion/tools/jspfront_pipeline.py [--no-publish] [--no-gate] <name|xml|폴더> ...
    (name 은 jldfil25900 처럼 파일명 줄기. 폴더를 주면 그 안의 *.xml 전부)

단계(순서 고정):
  1 vendor_postprocess   공급사 관용구 접기(V1~V13) — 규칙 13 충돌 개명은 convert 보다 먼저
  2 convert.convert      Stage 1 기계 치환(규칙 1~32)
  3 screen_convention    jsdoc·await·reindent·unused·finalize
  4 convert.convert      재실행(고정점 확인 — 3 의 출력이 포매터와 호환되는지)
  5 publish_normalize    body 퍼블리싱 정규화(있을 때)
  6 convert.convert      재실행 → 5 의 결과가 다시 바뀌면 IDEM FAIL 로 보고
  5b publish_merge       KRX 퍼블리싱 XML 이 있는 화면은 퍼블리싱 body 에 공급사 id·이벤트·바인딩을 옮겨 심는다(규칙 35) — 판정 auto/todo/manual 이면
                         병합 결과를 쓰고(남은 jQuery 문장엔 규칙 19 힌트 TODO), review/mismatch 면 병합 전 본을 그대로 둔다. 리포트 행 갱신
  7 gate_screen          정적 게이트(--no-gate 로 생략)

원본(ui/)은 읽기만 한다. 결과는 ui-tobe/ 에 같은 이름으로 쓴다(기존 산출물은 덮어쓴다).
**frozen**(publish_merge_overrides.json 의 `frozen` 지시, 손으로 고친 화면)은 파이프라인이 통째로 건너뛴다 — ui-tobe 파일이 정본.
"""
import io
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402
import convert as cv  # noqa: E402
import vendor_postprocess as vp  # noqa: E402
import screen_convention as sc  # noqa: E402
import gate_screen  # noqa: E402
try:
    import publish_normalize as pn  # noqa: E402
except ImportError:  # 1단계에서 신설 — 없으면 건너뛴다
    pn = None
import publish_merge as pm  # noqa: E402

_PUB_IDX = None
_OVERRIDES = None


def _merge_ctx():
    global _PUB_IDX, _OVERRIDES
    if _PUB_IDX is None:
        _PUB_IDX = pm.publish_index(); _OVERRIDES = pm.load_overrides()
    return _PUB_IDX, _OVERRIDES

UI = st.ROOT / "conversion" / "jsp-front" / "ui"
TOBE = st.ROOT / "conversion" / "jsp-front" / "ui-tobe"


def _converge(dst, name, max_passes=3):
    """convert 를 결과가 안 바뀔 때까지 재실행. returns (실제 변경이 있었던 회차 수, 수렴 여부)."""
    text = io.open(dst, "r", encoding="utf-8").read()
    changed = 0
    for _ in range(max_passes):
        text2, _r = cv.convert(text, name + ".xml", keep_nullish=True)
        if text2 == text:
            io.open(dst, "w", encoding="utf-8", newline="").write(text)
            return changed, True
        changed += 1
        text = text2
    io.open(dst, "w", encoding="utf-8", newline="").write(text)
    return changed, False


def run(name, publish=True, gate=True, inventory=None, merge=True):
    src = UI / (name + ".xml")
    dst = TOBE / (name + ".xml")
    rep = {"name": name}
    idx, overrides = _merge_ctx()
    ov = overrides.get(name) or {}
    if ov.get("frozen") and dst.exists():
        rep["frozen"] = ov["frozen"]
        if gate:
            ok, g = gate_screen.gate_file(str(dst), inventory or st.common_inventory(st.pcc_for(name)))
            rep["gate"] = "OK" if ok else {k: v for k, v in g.items() if v and k not in ("name", "node")} | {"node": g.get("node")}
        return rep
    raw, eol, reg = st.read_xml(src)
    if reg is None:
        rep["fatal"] = "script 영역 없음"; return rep
    # 1 vendor
    head, script, body, vlog = vp.apply_regions(reg["head"], reg["script"], reg["body"])
    rep["vendor"] = {k: v for k, v in vlog.items() if v}
    text = st.join_regions(reg, script=script, head=head, body=body)
    # 2 convert
    text, crep = cv.convert(text, name + ".xml", keep_nullish=True)
    rep["convert"] = {"r13": len(crep["rule13"]), "r8": crep["rule8"], "r5a": crep["rule5a"], "r4": crep["rule4"],
                      "judgment": len(crep["judgment"])}
    TOBE.mkdir(parents=True, exist_ok=True)
    io.open(dst, "w", encoding="utf-8", newline="").write(text)
    # 3 convention
    rep["convention"] = sc.apply(str(dst), pcc=st.pcc_for(name), async_common=(inventory or st.common_inventory(st.pcc_for(name)))[1])
    rep["convention"].pop("name", None)
    # 4 convert again — 컨벤션 단계가 규칙 4 보류 원인(함수 사이 최상위 실행문·미사용 전역)을 치우면 다음 회차에서야
    #   재정렬이 일어나므로 안정될 때까지 돌린다(최대 3회). 3회 안에 수렴하지 않으면 FAIL.
    rep["convert_passes"], rep["idem_after_convention"] = _converge(dst, name)
    # 5 publish
    if publish and pn is not None:
        rep["publish"] = pn.apply(str(dst))
        _, rep["idem_after_publish"] = _converge(dst, name)
    # 5b publish_merge — 퍼블리싱 XML 이 있는 화면은 병합 결과를 ui-tobe 에 쓴다(판정이 닫힘일 때만)
    if merge and name.lower() in idx and not ov.get("skip"):
        pub_path, ambiguous = pm.pick_publish(idx[name.lower()])
        _raw2, eol2, reg2 = st.read_xml(dst)
        mrep = pm.merge_screen(name, pub_path, TOBE, False, overrides, vendor=(reg2, eol2))
        mrep["ambiguous"] = ambiguous; mrep["pub"] = str(pub_path)
        rep["merge"] = {"verdict": mrep["verdict"], "matched": mrep["matched"], "pub_items": mrep["pub_items"], "todo": mrep.get("todo", 0), "jquery": mrep.get("jquery", 0)}
        rep["merge_rep"] = mrep
        if mrep["verdict"] in ("auto", "todo", "manual"):
            _, rep["idem_after_merge"] = _converge(dst, name)
    elif merge and name.lower() in idx:
        rep["merge"] = {"verdict": "mismatch", "skip": ov["skip"]}
        rep["merge_rep"] = {"name": name, "verdict": "mismatch", "matched": 0, "pub_items": 0, "missing_refs": [], "unmatched_vendor": [], "todo": 0, "log": ["override skip: " + ov["skip"]], "ambiguous": False}
    # 7 gate
    if gate:
        ok, g = gate_screen.gate_file(str(dst), inventory or st.common_inventory(st.pcc_for(name)))
        rep["gate"] = "OK" if ok else {k: v for k, v in g.items() if v and k not in ("name", "node")} | {"node": g.get("node")}
        rep["todo"] = {k: v for k, v in (("todo_c", g.get("todo_c")), ("refs_missing", g.get("refs_missing")),
                                          ("TODO Stage2", g.get("tokens", {}).get("TODO Stage2"))) if v}
    return rep


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    args = argv if argv is not None else sys.argv[1:]
    publish = "--no-publish" not in args
    gate = "--no-gate" not in args
    merge = "--no-merge" not in args
    names = []
    for a in args:
        if a.startswith("--"):
            continue
        p = Path(a)
        if p.is_dir():
            names += sorted(x.stem for x in p.glob("*.xml"))
        else:
            names.append(p.stem)
    if not names:
        print(__doc__); return 2
    inv = {}
    ok_all = True
    merge_reps = []
    for n in names:
        pcc = st.pcc_for(n)
        if pcc not in inv:
            inv[pcc] = st.common_inventory(pcc)
        r = run(n, publish=publish, gate=gate, inventory=inv[pcc], merge=merge)
        g = r.get("gate")
        ok_all &= (g == "OK") and r.get("idem_after_convention", True) and r.get("idem_after_publish", True) and r.get("idem_after_merge", True)
        if "merge_rep" in r:
            merge_reps.append(r["merge_rep"])
        elif "frozen" in r and n.lower() in _merge_ctx()[0]:
            merge_reps.append({"name": n, "verdict": "frozen", "matched": 0, "pub_items": 0, "missing_refs": [], "unmatched_vendor": [],
                               "todo": io.open(TOBE / (n + ".xml"), encoding="utf-8").read().count("TODO Stage2(퍼블리싱 병합)"), "log": ["override frozen: " + r["frozen"]], "ambiguous": False})
        print("=== %s" % n)
        for k in ("fatal", "frozen", "vendor", "convert", "convention", "convert_passes", "idem_after_convention", "publish", "idem_after_publish", "merge", "idem_after_merge", "gate", "todo"):
            if k in r:
                print("  %-24s %s" % (k, r[k]))
    if merge_reps:
        print("\n퍼블리싱 병합 리포트 행 갱신: %d (표 전체 %d)" % (len(merge_reps), pm.update_report(merge_reps)))
    print("\nALL:", "OK" if ok_all else "FAIL")
    return 0 if ok_all else 1


if __name__ == "__main__":
    sys.exit(main())
