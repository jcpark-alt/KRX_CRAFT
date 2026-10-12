# -*- coding: utf-8 -*-
"""KRX 퍼블리싱 산출 XML(`conversion/publish/**`, W-Craft 1차 변환 스크립트 내장) 전환 파이프라인 — publish/<폴더>/<name>.xml → publish-tobe/<폴더>/<name>.xml

    python conversion/tools/publish_pipeline.py [--no-gate] [--jobs N] [<xml|폴더> ...]
    (인자가 없으면 publish/ 전체. 폴더를 주면 그 안의 *.xml 전부. 원본(publish/)은 읽기만 하고 결과는 publish-tobe/ 에 같은 상대 경로로 쓴다 — 기존 산출물은 덮어쓴다)

단계(순서 고정 — jspfront_pipeline 과 같은 수렴 규약, 공급사(r13) 전용 단계 vendor_postprocess·publish_normalize·publish_merge 는 없음):
  1 convert.convert      Stage 1 기계 치환(규칙 1~32) — W-Craft 원본이라 screen 프로파일 기본(keep_nullish 없음, next-krx-lds-* 모듈과 동일)
  2 screen_convention    jsdoc·await·reindent·unused·finalize (스크립트 영역이 없는 순수 퍼블리싱 목업은 건너뛴다)
  3 _settle              컨벤션 ↔ convert 를 둘 다 안 바뀔 때까지(convert 의 async 승격 뒤 JSDoc·await 가 따라오도록)
  4 gate_screen          정적 게이트(--no-gate 로 생략). 결과는 리포트에만 적는다(실패해도 산출물은 쓴다 — Stage 2 명부)

pcc(업무공통 재고 — await 전파·미정의 $c 판정): 화면 접두로 정하고(uldstf/jldstf/uldfis/uldins/uldbns/uldbnf/uldcom → stf, uldfil/jldfil/*ods → fil,
  uldmgt → mgt, uldtms → tms), 접두가 없으면 업무 폴더로(공시 → fil, 상장·채권·표준코드·샘플(전환) → stf, 운영자(대내) → mgt, TMS → tms).
리포트: `conversion/publish-tobe/README.md`(폴더별 집계 + 게이트 실패 분류 + 치명 오류 목록), `conversion/publish-tobe/pipeline_report.json`(화면별).
"""
import collections
import glob
import io
import json
import os
import sys
import time
import xml.dom.minidom as minidom
from multiprocessing import Pool
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402
import convert as cv  # noqa: E402
import screen_convention as sc  # noqa: E402
import gate_screen  # noqa: E402

SRC = st.ROOT / "conversion" / "publish"
DST = st.ROOT / "conversion" / "publish-tobe"
PCC_BY_PREFIX = {"uldstf": "stf", "jldstf": "stf", "uldfis": "stf", "uldins": "stf", "uldbns": "stf", "uldbnf": "stf", "uldcom": "stf",
                 "uldfil": "fil", "jldfil": "fil", "uldods": "fil", "jldods": "fil", "uldmgt": "mgt", "uldtms": "tms", "uldinf": "fil", "jldinf": "fil"}
PCC_BY_FOLDER = {"공시": "fil", "상장": "stf", "채권": "stf", "표준코드": "stf", "샘플(전환)": "stf", "운영자(대내)": "mgt", "TMS(서식관리_대내)": "tms"}
_INV = {}


def pcc_of(rel):
    """publish/ 기준 상대 경로 → pcc 폴더명(None 이면 gcc 만)."""
    stem = Path(rel).stem.lower()
    for k in sorted(PCC_BY_PREFIX, key=len, reverse=True):
        if stem.startswith(k):
            return PCC_BY_PREFIX[k]
    top = Path(rel).parts[0] if len(Path(rel).parts) > 1 else ""
    return PCC_BY_FOLDER.get(top)


def inventory(pcc):
    if pcc not in _INV:
        _INV[pcc] = st.common_inventory(pcc)
    return _INV[pcc]


def _converge(text, name, max_passes=3):
    changed = 0
    for _ in range(max_passes):
        text2, _r = cv.convert(text, name)
        if text2 == text:
            return text, changed, True
        changed += 1
        text = text2
    return text, changed, False


def _settle(dst, name, pcc, max_rounds=3):
    """컨벤션 → convert 수렴을 둘 다 안 바뀔 때까지(jspfront_pipeline._settle 과 같은 규약). returns (convert 변경 회차 합, 수렴 여부, 컨벤션 로그)."""
    total, log = 0, None
    async_common = inventory(pcc)[1]
    for _ in range(max_rounds):
        before = io.open(dst, "r", encoding="utf-8").read()
        l = sc.apply(str(dst), pcc=pcc, async_common=async_common)
        log = log or l  # 첫 회차 로그가 실제 컨벤션 적용량(이후 회차는 수렴 확인)
        text = io.open(dst, "r", encoding="utf-8").read()
        conv_changed = text != before
        text2, changed, ok = _converge(text, name)
        if text2 != text:
            io.open(dst, "w", encoding="utf-8", newline="").write(text2)
        total += changed
        if not conv_changed and changed == 0:
            return total, True, log
        if not ok:
            return total, False, log
    before = io.open(dst, "r", encoding="utf-8").read()
    sc.apply(str(dst), pcc=pcc, async_common=async_common)
    return total, io.open(dst, "r", encoding="utf-8").read() == before, log


def run(src_path, gate=True):
    src = Path(src_path).resolve()
    rel = src.relative_to(SRC.resolve())
    dst = DST / rel
    name = src.name
    pcc = pcc_of(rel)
    rep = {"rel": str(rel).replace("\\", "/"), "pcc": pcc, "t0": time.time()}
    try:
        raw = io.open(src, "r", encoding="utf-8").read()
        reg = cv.split_regions(raw)
        rep["scripted"] = bool(reg and len(reg["script"].strip()) > 0)
        # 1 convert
        text, rep["convert_passes"], rep["convert_converged"] = _converge(raw, name)
        r1 = cv.convert(raw, name)[1]
        rep["convert"] = {k: (len(v) if hasattr(v, "__len__") and not isinstance(v, str) else v) for k, v in r1.items()
                          if v and k not in ("profile",)}
        dst.parent.mkdir(parents=True, exist_ok=True)
        io.open(dst, "w", encoding="utf-8", newline="").write(text)
        # 2·3 convention + settle
        if rep["scripted"]:
            rep["convert_passes_settle"], rep["settled"], clog = _settle(dst, name, pcc)
            clog.pop("name", None)
            rep["convention"] = {k: (len(v) if hasattr(v, "__len__") and not isinstance(v, str) else v) for k, v in clog.items() if v}
        else:
            rep["settled"] = True
            rep["convention"] = "skip(script 없음)"
        # well-formed
        try:
            minidom.parseString(io.open(dst, "rb").read())
            rep["wf"] = True
        except Exception as e:
            rep["wf"] = False
            rep["wf_error"] = str(e)[:200]
        # 4 gate
        if gate and rep["scripted"]:
            ok, g = gate_screen.gate_file(str(dst), inventory(pcc), node=True)
            g.pop("name", None)
            rep["gate"] = "OK" if ok else "FAIL"
            rep["gate_detail"] = {k: v for k, v in g.items() if v and v not in ("OK",)}
    except Exception as e:  # 한 화면의 예외가 전체를 멈추지 않게
        rep["fatal"] = "%s: %s" % (type(e).__name__, str(e)[:300])
    rep["sec"] = round(time.time() - rep.pop("t0"), 1)
    return rep


def _worker(args):
    return run(*args)


def summarize(reps, elapsed):
    by = collections.OrderedDict()
    for r in reps:
        top = r["rel"].split("/")[0] if "/" in r["rel"] else "(root)"
        d = by.setdefault(top, collections.Counter())
        d["files"] += 1
        d["scripted"] += 1 if r.get("scripted") else 0
        d["fatal"] += 1 if r.get("fatal") else 0
        d["wf_fail"] += 1 if r.get("wf") is False else 0
        d["not_settled"] += 1 if (r.get("settled") is False or r.get("convert_converged") is False) else 0
        if r.get("gate") == "OK":
            d["gate_ok"] += 1
        elif r.get("gate") == "FAIL":
            d["gate_fail"] += 1
    fail_kinds = collections.Counter()
    undefined_c = collections.Counter()
    tokens = collections.Counter()
    for r in reps:
        g = r.get("gate_detail") or {}
        if r.get("gate") == "FAIL":
            for k in ("dup_defs", "public_only", "defined_only", "handlers_undefined", "undefined_c", "unused_globals"):
                if g.get(k):
                    fail_kinds[k] += 1
            if g.get("node", "OK") != "OK" and str(g.get("node", "")).startswith("FAIL"):
                fail_kinds["node"] += 1
            for k in (g.get("tokens") or {}):
                if k in gate_screen.FAIL_TOKENS:
                    fail_kinds["token:" + k] += 1
        for u in g.get("undefined_c", []):
            undefined_c[u] += 1
        for k, n in (g.get("tokens") or {}).items():
            tokens[k] += n
    lines = ["# publish → publish-tobe 전환 기록", "",
             "- `conversion/publish/` — KRX 퍼블리싱 산출 XML 원본(W-Craft 1차 변환 스크립트 내장, **수정 금지**). `conversion/publish-tobe/` — `publish_pipeline.py` 산출물(같은 상대 경로).",
             "- 파이프라인: convert(Stage 1) → screen_convention(jsdoc·await·reindent·unused·finalize) → 컨벤션↔convert 수렴 → gate_screen. 스크립트 없는 순수 목업은 convert 만 거친다.",
             "- 재실행: `python conversion/tools/publish_pipeline.py` (전체) 또는 `python conversion/tools/publish_pipeline.py \"conversion/publish/상장/상장처리(대내)\"` (폴더·파일 단위). 화면별 상세는 `pipeline_report.json`.",
             "", "## 실행 결과 (%s, %d본, %.0f초)" % (time.strftime("%Y-%m-%d %H:%M"), len(reps), elapsed), "",
             "| 폴더 | 파일 | 스크립트 영역 있음 | 게이트 OK | 게이트 FAIL | 미수렴 | WF 실패 | 치명 오류 |", "|---|---|---|---|---|---|---|---|"]
    tot = collections.Counter()
    for top, d in by.items():
        tot.update(d)
        lines.append("| %s | %d | %d | %d | %d | %d | %d | %d |" % (top, d["files"], d["scripted"], d["gate_ok"], d["gate_fail"], d["not_settled"], d["wf_fail"], d["fatal"]))
    lines.append("| **합계** | %d | %d | %d | %d | %d | %d | %d |" % (tot["files"], tot["scripted"], tot["gate_ok"], tot["gate_fail"], tot["not_settled"], tot["wf_fail"], tot["fatal"]))
    lines += ["", "## 게이트 실패 사유(화면 수)", ""]
    lines += ["- `%s`: %d" % (k, n) for k, n in fail_kinds.most_common()] or ["- 없음"]
    lines += ["", "## 미정의 `$c` 호출 상위 30 (gcc + pcc publicInfo 에 없음 — Stage 2 명부)", ""]
    lines += ["- `%s`: %d화면" % (k, n) for k, n in undefined_c.most_common(30)] or ["- 없음"]
    lines += ["", "## 레거시 토큰 합계(게이트 집계)", ""]
    lines += ["- `%s`: %d" % (k, n) for k, n in tokens.most_common()] or ["- 없음"]
    fat = [r for r in reps if r.get("fatal")]
    lines += ["", "## 치명 오류(산출 불가 또는 예외)", ""]
    lines += ["- `%s`: %s" % (r["rel"], r["fatal"]) for r in fat] or ["- 없음"]
    ns = [r["rel"] for r in reps if r.get("settled") is False or r.get("convert_converged") is False]
    lines += ["", "## 미수렴(컨벤션↔convert 3회 안에 고정점 미도달)", ""]
    lines += ["- `%s`" % x for x in ns] or ["- 없음"]
    wf = [("%s: %s" % (r["rel"], r.get("wf_error", ""))) for r in reps if r.get("wf") is False]
    lines += ["", "## well-formed 실패", ""]
    lines += ["- `%s`" % x for x in wf] or ["- 없음"]
    return "\n".join(lines) + "\n"


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    argv = list(sys.argv[1:] if argv is None else argv)
    gate = "--no-gate" not in argv
    jobs = 1
    if "--jobs" in argv:
        i = argv.index("--jobs"); jobs = int(argv[i + 1]); del argv[i:i + 2]
    argv = [a for a in argv if a != "--no-gate"]
    files, _fl, _op = st.parse_cli(argv, flags=(), opts=())
    if not argv:
        files = sorted(glob.glob(str(SRC / "**" / "*.xml"), recursive=True))
    files = [f for f in files if Path(f).resolve().is_relative_to(SRC.resolve())]
    if not files:
        print(__doc__); return 2
    t0 = time.time()
    print("== publish → publish-tobe: %d본 (jobs=%d, gate=%s) ==" % (len(files), jobs, gate), flush=True)
    reps = []
    if jobs > 1:
        with Pool(jobs) as pool:
            for i, r in enumerate(pool.imap_unordered(_worker, [(f, gate) for f in files]), 1):
                reps.append(r)
                if i % 50 == 0 or i == len(files):
                    print("  %d/%d  (%.0fs)" % (i, len(files), time.time() - t0), flush=True)
    else:
        for i, f in enumerate(files, 1):
            reps.append(run(f, gate))
            if i % 50 == 0 or i == len(files):
                print("  %d/%d  (%.0fs)" % (i, len(files), time.time() - t0), flush=True)
    # 부분 재실행이면 기존 리포트와 병합(이번에 돈 화면만 갈아 끼움) — README 집계는 항상 전체 기준
    DST.mkdir(parents=True, exist_ok=True)
    prev_path = DST / "pipeline_report.json"
    if argv and prev_path.exists():
        done = {r["rel"] for r in reps}
        reps += [r for r in json.load(io.open(prev_path, encoding="utf-8")) if r["rel"] not in done]
    reps.sort(key=lambda r: r["rel"])
    io.open(DST / "pipeline_report.json", "w", encoding="utf-8", newline="").write(json.dumps(reps, ensure_ascii=False, indent=1))
    io.open(DST / "README.md", "w", encoding="utf-8", newline="").write(summarize(reps, time.time() - t0))
    n_fatal = sum(1 for r in reps if r.get("fatal"))
    n_fail = sum(1 for r in reps if r.get("gate") == "FAIL")
    n_ok = sum(1 for r in reps if r.get("gate") == "OK")
    print("완료: %d본, 게이트 OK %d / FAIL %d, 치명 %d, %.0f초 → %s" % (len(reps), n_ok, n_fail, n_fatal, time.time() - t0, DST / "README.md"))
    return 0 if n_fatal == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
