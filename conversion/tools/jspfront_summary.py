# -*- coding: utf-8 -*-
"""jspfront_pipeline 출력 로그(run_*.txt) 집계 — 배치별 게이트 통과율·실패 유형·Stage 2 잔여(todo) 명부.

    python conversion/tools/jspfront_summary.py <run_log> ...   [--tsv out.tsv]

로그 한 화면 블록은 `=== <name>` 으로 시작하고 `  <key>  <python repr>` 줄이 따른다(파이프라인 main 의 출력 형식).
"""
import ast
import collections
import re
import sys


def parse(path):
    rows, cur = [], None
    for line in open(path, encoding="utf-8-sig"):
        line = line.rstrip("\n")
        if line.startswith("=== "):
            cur = {"name": line[4:].strip()}; rows.append(cur)
        elif cur is not None and line.startswith("  ") and not line.startswith("   "):
            m = re.match(r'  (\S+)\s+(.*)$', line)
            if m:
                val = m.group(2)
                try:
                    val = ast.literal_eval(val)
                except Exception:
                    pass
                cur[m.group(1)] = val
    return rows


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    args = argv if argv is not None else sys.argv[1:]
    tsv = None
    if "--tsv" in args:
        i = args.index("--tsv"); tsv = args[i + 1]; args = args[:i] + args[i + 2:]
    rows = []
    for p in args:
        rows += parse(p)
    n = len(rows)
    ok = sum(1 for r in rows if r.get("gate") == "OK")
    idem_bad = [r["name"] for r in rows if r.get("idem_after_convention") is False or r.get("idem_after_publish") is False]
    fatal = [r["name"] for r in rows if "fatal" in r]
    kinds = collections.Counter()
    for r in rows:
        g = r.get("gate")
        if isinstance(g, dict):
            for k, v in g.items():
                if k == "node" and isinstance(v, str) and v.startswith("FAIL"):
                    kinds["node FAIL"] += 1
                elif k == "tokens":
                    for t in v:
                        if t != "TODO Stage2":
                            kinds["token:" + t] += 1
                elif k in ("undefined_c", "refs_missing", "handlers_undefined", "public_only", "defined_only", "unused_globals", "dup_defs"):
                    kinds[k] += 1
    todo_c = collections.Counter(); todo_screens = 0; todo_sites = 0; refs_screens = 0; refs_sites = 0
    for r in rows:
        t = r.get("todo") or {}
        for c in t.get("todo_c", []):
            todo_c[c] += 1
        if t.get("TODO Stage2"):
            todo_screens += 1; todo_sites += t["TODO Stage2"]
        if t.get("refs_missing"):
            refs_screens += 1; refs_sites += len(t["refs_missing"])
    print("화면 %d · 게이트 OK %d (%.1f%%) · 수렴 실패 %d · fatal %d" % (n, ok, 100.0 * ok / n if n else 0, len(idem_bad), len(fatal)))
    if kinds:
        print("실패 유형(화면 수):", dict(kinds.most_common()))
    print("TODO Stage2 주석: %d자리 / %d화면 · 미정의 $c(todo): %s · body 에 없는 참조: %d자리 / %d화면"
          % (todo_sites, todo_screens, dict(todo_c.most_common(8)), refs_sites, refs_screens))
    if idem_bad:
        print("수렴 실패:", idem_bad[:20])
    if fatal:
        print("fatal:", fatal[:20])
    bad = [r for r in rows if r.get("gate") != "OK"]
    for r in bad[:40]:
        print("  FAIL %-26s %s" % (r["name"], str(r.get("gate"))[:200]))
    if tsv:
        with open(tsv, "w", encoding="utf-8") as f:
            f.write("name\tgate\ttodo_sites\ttodo_c\trefs_missing\tconvert_passes\n")
            for r in rows:
                t = r.get("todo") or {}
                f.write("%s\t%s\t%s\t%s\t%s\t%s\n" % (r["name"], "OK" if r.get("gate") == "OK" else "FAIL",
                                                       t.get("TODO Stage2", 0), ",".join(t.get("todo_c", [])),
                                                       ",".join(t.get("refs_missing", [])), r.get("convert_passes", "")))
    return 0 if ok == n and not idem_bad and not fatal else 1


if __name__ == "__main__":
    sys.exit(main())
