# -*- coding: utf-8 -*-
"""규칙 5a(`==`→`===`) 적용 화면의 회귀 후보 스캔 — 혼합 타입 비교와 await 없는 async 공통 호출.

    python conversion/tools/scan_mixed_compare.py [--pcc fil|stf|mgt|tms] <xml|폴더> ...

A  숫자 리터럴 엄격 비교 — `getValue() === 1` / `getCellData(...) !== 0` / `dma.get("x") === 2` 처럼
   왼쪽이 문자열을 돌려주는 자리(엔진 값은 문자열)와 숫자 리터럴의 `===` 는 영영 거짓이다(2026-09-30 bnsnew 리뷰).
   왼쪽 꼴별로 묶어 건수·첫 위치를 보여 준다. `A-rev` 는 리터럴이 왼쪽인 꼴.
B  await 없는 async 공통 호출 — `$c.ns.fn(` 이 async 로 선언돼 있는데 앞에 await 가 없는 자리
   (Promise 를 값으로 비교하면 항상 참/거짓). `$c.exception.handleError` 는 동기 진입점 catch 에서 await 없이
   부르는 것이 규약(규칙 26)이라 제외한다.

리포트 전용(파일을 바꾸지 않는다). 교정은 화면별 판단 — bnsnew 선례: 상태값 `String(index + 1)`, 리터럴 인용 `'1'`,
`Number(listAmt) !== fndAmt`.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402

LHS = r'([A-Za-z_$][\w$.()\'", \[\]]*?)\s*(===|!==)\s*(-?\d+)\b'


def scan_file(path, async_fns):
    raw, _eol, reg = st.read_xml(path)
    if reg is None:
        return {"name": Path(path).stem, "fatal": "script 영역 없음"}
    sc = reg["script"]
    code = st.code_only(sc)
    out = {"name": Path(path).stem, "A": {}, "A_rev": [], "B": {}}
    for m in re.finditer(LHS, code):
        # 왼쪽 피연산자만 남긴다 — `if (` · `while (` · `return ` · `(` · `&&` · `||` · `!` 접두는 뗀다
        lhs = re.sub(r'^(?:(?:if|while|return|else if)\s*\(?|\(|&&|\|\||!|\s)+', '', m.group(1).strip())
        key = re.sub(r'\(.*\)', '()', lhs)
        key = key if key.startswith("scwin.") else re.sub(r'^[\w$]+\.', 'X.', key)
        out["A"].setdefault(key, []).append((sc[:m.start()].count("\n") + 1, "%s %s %s" % (lhs, m.group(2), m.group(3))))
    for m in re.finditer(r'(?<![\w.])(-?\d+)\s*(===|!==)\s*([A-Za-z_$][\w$.]*)', code):
        out["A_rev"].append((sc[:m.start()].count("\n") + 1, m.group(0)))
    for m in re.finditer(r'\$c\.(\w+)\.(\w+)\s*\(', code):
        key = (m.group(1), m.group(2))
        if key in async_fns and key != ("exception", "handleError") and not re.search(r'\bawait\s*$', code[:m.start()]):
            out["B"]["$c.%s.%s" % key] = out["B"].get("$c.%s.%s" % key, 0) + 1
    return out


def print_result(r):
    print("=== %s ===" % r["name"])
    if "fatal" in r:
        print("  FATAL:", r["fatal"]); return
    for k, v in sorted(r["A"].items(), key=lambda kv: -len(kv[1])):
        print("  A %-45s x%d  e.g. L%d %s" % (k, len(v), v[0][0], v[0][1][:70]))
    for ln, txt in r["A_rev"]:
        print("  A-rev L%d %s" % (ln, txt))
    print("  B un-awaited async common:", r["B"])


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    files, _fl, op = st.parse_cli(argv if argv is not None else sys.argv[1:], flags=(), opts=("--pcc",))
    if not files:
        print(__doc__); return 2
    cache = {}
    total_a = total_b = 0
    for f in files:
        pcc = op["--pcc"] or st.pcc_for(f)
        if pcc not in cache:
            cache[pcc] = st.common_inventory(pcc)[1]
        r = scan_file(f, cache[pcc])
        print_result(r)
        if "fatal" not in r:
            total_a += sum(len(v) for v in r["A"].values()) + len(r["A_rev"])
            total_b += sum(r["B"].values())
    print("\n합계: A(숫자 리터럴 엄격 비교) %d · B(await 없는 async 공통 호출) %d" % (total_a, total_b))
    return 0


if __name__ == "__main__":
    sys.exit(main())
