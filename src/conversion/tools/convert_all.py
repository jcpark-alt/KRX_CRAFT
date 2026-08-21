# -*- coding: utf-8 -*-
"""
일괄 변환 드라이버 — websquare_conversion_guide.md 규칙(convert.py)으로
모듈별 ui/*.xml 을 변환해 ui-tobe/ 에 동일 파일명으로 생성한다.

- 원본(ui)은 수정하지 않는다.
- 각 산출물의 XML well-formed / 멱등성(2회 변환 동일)을 검증한다.
- 소스 폴더가 없거나 비어 있으면 건너뛰고 사유를 출력한다.

- ui 폴더를 재귀 탐색하여 하위폴더 구조를 ui-tobe 에 미러링한다.
- 이미 존재하는 산출물(수기 보강 가능)은 덮어쓰지 않고 건너뛴다. (--force 로 재생성)

CLI: python convert_all.py                                  # 아래 MAPPINGS 전체 변환
     python convert_all.py next-krx-lds-fil-front           # 지정 모듈만 변환
     python convert_all.py --force [module]                 # 기존 산출물도 덮어쓰며 재생성
                                                            # (수기 단계2 보강이 있으면 유실 — 사전 확인 필수)
"""
import sys
import io
import os
import glob
import xml.dom.minidom as minidom
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import convert  # noqa: E402

BASE = Path(__file__).resolve().parents[1]  # src/conversion

MAPPINGS = [
    ("next-krx-lds-fil-front/ui", "next-krx-lds-fil-front/ui-tobe"),
    ("next-krx-lds-mgt-front/ui", "next-krx-lds-mgt-front/ui-tobe"),
    ("next-krx-lds-stf-front/ui", "next-krx-lds-stf-front/ui-tobe"),
    ("next-krx-lds-tms-front/ui", "next-krx-lds-tms-front/ui-tobe"),
]


def convert_dir(src_rel, dst_rel, force=False):
    src, dst = BASE / src_rel, BASE / dst_rel
    if not src.is_dir():
        return {"status": "소스 폴더 없음", "files": 0}
    files = sorted(glob.glob(str(src / "**" / "*.xml"), recursive=True))
    if not files:
        return {"status": "소스 비어있음", "files": 0}
    dst.mkdir(parents=True, exist_ok=True)
    agg = {"files": len(files), "ok": 0, "skipped": [], "wf_fail": [], "idem_fail": [],
           "r2": 0, "r3": 0, "r4_done": 0, "r4_defer": 0, "r5a": 0, "r5b": 0, "r5c": 0, "r5d": 0,
           "r6": 0, "r7": 0, "r7m": 0, "r7n": 0, "r8c": 0, "r8l": 0, "r12": 0, "r13": 0, "r14": 0, "r15": 0, "judgment": 0, "errors": []}
    for f in files:
        name = os.path.basename(f)
        rel = Path(f).relative_to(src)
        out_path = dst / rel
        # 이미 변환된 산출물(수기 단계2 보강 가능)은 덮어쓰지 않고 건너뛴다. 재생성은 --force.
        if out_path.exists() and not force:
            agg["skipped"].append(str(rel)); continue
        raw = io.open(f, "r", encoding="utf-8").read()
        try:
            result, rep = convert.convert(raw, name)
        except Exception as e:
            agg["errors"].append("%s: %s" % (rel, e)); continue
        out_path.parent.mkdir(parents=True, exist_ok=True)
        io.open(out_path, "w", encoding="utf-8", newline="").write(result)
        try:
            minidom.parseString(result.encode("utf-8"))
        except Exception:
            agg["wf_fail"].append(str(rel))
        result2, _ = convert.convert(result, name)
        if result2 != result:
            agg["idem_fail"].append(str(rel))
        agg["ok"] += 1
        agg["r2"] += rep["rule2"]
        agg["r3"] += len(rep["rule3"])
        agg["r4_done"] += 1 if rep["rule4"] else 0
        agg["r4_defer"] += 1 if rep["rule4"] is None else 0
        agg["r5a"] += rep["rule5a"]
        agg["r5b"] += len(rep["rule5b"])
        agg["r5c"] += len(rep["rule5c"])
        agg["r5d"] += len(rep["rule5d"])
        agg["r6"] += len(rep["rule6"]["converted"])
        agg["r7"] += len(rep["rule7"])
        agg["r7m"] += len(rep["rule7m"])
        agg["r7n"] += len(rep["rule7n"])
        agg["r8c"] += rep["rule8"]["const"]
        agg["r8l"] += rep["rule8"]["let"]
        agg["r12"] += len(rep["rule12"]["converted"])
        agg["r13"] += len(rep["rule13"])
        agg["r14"] += len(rep["rule14"])
        agg["r15"] += len(rep["rule15"])
        agg["judgment"] += len(rep["judgment"])
    agg["status"] = "변환완료"
    return agg


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    args = sys.argv[1:]
    force = "--force" in args  # 기존 산출물 덮어쓰기(수기 보강 유실 주의)
    only = [a for a in args if a != "--force"]  # 선택: 지정한 모듈 폴더명만 변환(미지정 시 MAPPINGS 전체)
    mappings = [m for m in MAPPINGS if not only or m[0].split("/")[0] in only]
    print("== 일괄 변환 (ui → ui-tobe)%s ==\n" % (" [--force 재생성]" if force else ""))
    total = 0
    for src_rel, dst_rel in mappings:
        mod = src_rel.split("/")[0]
        r = convert_dir(src_rel, dst_rel, force=force)
        if r["status"] != "변환완료":
            print("[%s] %s" % (mod, r["status"]))
            continue
        total += r["ok"]
        wf = "OK" if not r["wf_fail"] else ("FAIL " + ",".join(r["wf_fail"]))
        idem = "OK" if not r["idem_fail"] else ("DIFF " + ",".join(r["idem_fail"]))
        print("[%s] %d개 변환 (기존 산출물 %d개 건너뜀)  WF=%s  IDEM=%s" % (mod, r["ok"], len(r["skipped"]), wf, idem))
        print("     규칙2=%d r3=%d r4(적용%d/보류%d) r5a=%d r5b=%d r5c=%d r5d=%d r6=%d r7=%d r7m=%d r7n=%d r8(c%d/l%d) r12=%d r13=%d r14=%d r15=%d  판단필요=%d"
              % (r["r2"], r["r3"], r["r4_done"], r["r4_defer"], r["r5a"], r["r5b"], r["r5c"], r["r5d"],
                 r["r6"], r["r7"], r["r7m"], r["r7n"], r["r8c"], r["r8l"], r["r12"], r["r13"], r["r14"], r["r15"], r["judgment"]))
        if r["errors"]:
            for e in r["errors"]:
                print("     ! 오류:", e)
    print("\n총 변환 파일:", total)


if __name__ == "__main__":
    main()
