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
  7 gate_screen          정적 게이트(--no-gate 로 생략)

원본(ui/)은 읽기만 한다. 결과는 ui-tobe/ 에 같은 이름으로 쓴다(기존 산출물은 덮어쓴다 — 파일럿 단계 전용).
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


def run(name, publish=True, gate=True, inventory=None):
    src = UI / (name + ".xml")
    dst = TOBE / (name + ".xml")
    raw, eol, reg = st.read_xml(src)
    rep = {"name": name}
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
    for n in names:
        pcc = st.pcc_for(n)
        if pcc not in inv:
            inv[pcc] = st.common_inventory(pcc)
        r = run(n, publish=publish, gate=gate, inventory=inv[pcc])
        g = r.get("gate")
        ok_all &= (g == "OK") and r.get("idem_after_convention", True) and r.get("idem_after_publish", True)
        print("=== %s" % n)
        for k in ("fatal", "vendor", "convert", "convention", "convert_passes", "idem_after_convention", "publish", "idem_after_publish", "gate", "todo"):
            if k in r:
                print("  %-24s %s" % (k, r[k]))
    print("\nALL:", "OK" if ok_all else "FAIL")
    return 0 if ok_all else 1


if __name__ == "__main__":
    sys.exit(main())
