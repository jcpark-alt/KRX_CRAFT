# -*- coding: utf-8 -*-
"""화면 스코어카드 — jsp-front ui-tobe 의 conversion·code convention 잔여 편차를 화면마다 재서 업무군별 집계와 손작업 배치 순서를 낸다 (P1, 2026-10-07).

    python conversion/tools/screen_scorecard.py [--tsv <파일>] [--top N] [<폴더>]     (기본 폴더 conversion/jsp-front/ui-tobe)

재는 것(스크립트는 주석 제외 코드만, body 는 마크업):
  손작업 축(가중 3)  jquery        jQuery `$(` 호출                              form_dom     `fm.*`·`document.<form>.*` 원시 폼 접근
                    raw_dom       `window.`·`document.` 원시 DOM(location 제외)   eval         eval / new Function
                    location      location.href/replace 이동                     timer        setTimeout / setInterval
                    innerHTML     innerHTML 대입/읽기                             long_fn      4,000자 넘는 함수
  기계 축(가중 1)    handler_notry 핸들러(`scwin.<id>_on<ev>`)에 try/catch 없음      fn_def       `scwin.fn_*` 레거시 이름 정의
                    console       console.* 호출                                 native_alert alert( / confirm( 네이티브
                    no_jsdoc      JSDoc 없는 함수
  회신 축(가중 2)    todo_vendor   TODO Stage2(전환 미완·컨텍스트 키·세션 키·pcc 의존·중복 정의 …)
                    todo_merge    body 의 TODO Stage2(퍼블리싱 병합) 표지          todo_rule19  TODO Stage2(규칙 19) jQuery 힌트
  정보(점수 제외)    nullish       `== null`/`!= null` 관용구(정책상 보존)         getcomp      `$c.util.getComponent(` 참조 수

점수 = Σ 가중 × 건수. 리포트는 업무군(파일명 앞 6글자: jldfil·jldstf·uldmgt …)별 합계와 상위 화면, 그리고 **다음 손작업 배치 제안**
(퍼블리싱 병합 화면 — 디자인이 확정된 것 — 가운데 점수가 높은 순)을 싣는다. `--tsv` 는 화면별 전 수치.
"""
import collections
import glob
import io
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402

ROOT = st.ROOT
TOBE = ROOT / "conversion" / "jsp-front" / "ui-tobe"
OUT = ROOT / "conversion" / "jsp-front" / "scorecard.md"

WEIGHTS = {
    "jquery": 3, "form_dom": 3, "raw_dom": 3, "eval": 3, "location": 3, "timer": 3, "innerHTML": 3, "long_fn": 3,
    "handler_notry": 1, "fn_def": 1, "console": 1, "native_alert": 1, "no_jsdoc": 1,
    "todo_vendor": 2, "todo_merge": 2, "todo_rule19": 2,
}
INFO = ("nullish", "getcomp")
ORDER = ["jquery", "form_dom", "raw_dom", "eval", "location", "timer", "innerHTML", "long_fn",
         "handler_notry", "fn_def", "console", "native_alert", "no_jsdoc", "todo_vendor", "todo_merge", "todo_rule19"]
LABEL = {"jquery": "jQuery", "form_dom": "폼 DOM", "raw_dom": "원시 DOM", "eval": "eval", "location": "location 이동", "timer": "타이머",
         "innerHTML": "innerHTML", "long_fn": "긴 함수", "handler_notry": "try 없는 핸들러", "fn_def": "fn_ 정의", "console": "console",
         "native_alert": "네이티브 alert", "no_jsdoc": "JSDoc 없음", "todo_vendor": "TODO(회신)", "todo_merge": "TODO(병합)", "todo_rule19": "TODO(규칙19)",
         "nullish": "== null(정보)", "getcomp": "getComponent(정보)"}

RX = {
    "jquery": re.compile(r'(?<![\w$.])\$\('),
    "form_dom": re.compile(r'(?<![\w$.])(?:fm|document\.[A-Za-z_]\w*)\.(?:\w+\.)?(?:value|checked|submit|action|target|elements)\b'),
    "raw_dom": re.compile(r'(?<![\w$.])(?:window|document)\.(?!location\b)'),
    "eval": re.compile(r'(?<![\w$.])(?:eval|new Function)\('),
    "location": re.compile(r'location\.(?:href|replace)'),
    "timer": re.compile(r'(?<![\w$.])set(?:Timeout|Interval)\('),
    "innerHTML": re.compile(r'\.innerHTML\b'),
    "fn_def": re.compile(r'^scwin\.fn_\w+\s*=', re.M),
    "console": re.compile(r'console\.\w+\('),
    "native_alert": re.compile(r'(?<![\w$.])(?:alert|confirm)\('),
    "nullish": re.compile(r'[!=]=\s*(?:null|undefined)\b'),
    "getcomp": re.compile(r'\$c\.util\.getComponent\('),
}
HANDLER_NOTRY = re.compile(r'^scwin\.\w+_on\w+\s*=\s*(?:async\s+)?function[^\n]*\n(?![\s\S]{0,160}?\btry\s*\{)', re.M)
TODO_VENDOR = re.compile(r'// TODO Stage2(?!\(규칙 ?19\))')
TODO_RULE19 = re.compile(r'// TODO Stage2\(규칙 ?19\)')
TODO_MERGE = re.compile(r'TODO Stage2\(퍼블리싱 병합\)')


def measure(path):
    raw, _eol, reg = st.read_xml(path)
    if reg is None:
        return None
    script, body = reg["script"], reg["body"]
    code = st.without_comments(script)
    m = {k: len(rx.findall(code)) for k, rx in RX.items() if k != "fn_def"}
    m["fn_def"] = len(RX["fn_def"].findall(script))
    m["handler_notry"] = len(HANDLER_NOTRY.findall(script))
    m["todo_vendor"] = len(TODO_VENDOR.findall(script))
    m["todo_rule19"] = len(TODO_RULE19.findall(script))
    m["todo_merge"] = len(TODO_MERGE.findall(body))
    spans = st.func_spans(script)
    m["long_fn"] = sum(1 for _n, s, b, e, _ in spans if e - b > 4000)
    m["no_jsdoc"] = sum(1 for _n, s, b, e, _ in spans if not re.search(r'\*/\s*$', script[:s]))
    m["funcs"] = len(spans)
    m["lines"] = script.count("\n")
    m["score"] = sum(WEIGHTS[k] * m[k] for k in WEIGHTS)
    return m


def group_of(name):
    return name[:6].lower()


def render(rows, pub_names, top):
    total = collections.Counter(); groups = collections.defaultdict(collections.Counter); gcount = collections.Counter()
    for name, m in rows:
        for k in ORDER + list(INFO) + ["score", "funcs", "lines"]:
            total[k] += m[k]; groups[group_of(name)][k] += m[k]
        gcount[group_of(name)] += 1
    zero = sum(1 for _n, m in rows if m["score"] == 0)
    L = ["# 화면 스코어카드 (jsp-front ui-tobe · conversion/code convention 잔여 편차)", "",
         "> `python conversion/tools/screen_scorecard.py` 가 만든다(P1, 2026-10-07). 점수 = Σ 가중(손작업 축 3 · 회신 축 2 · 기계 축 1) × 건수. "
         "`== null` 과 `getComponent` 는 정책상 보존이라 정보로만 싣는다. 화면별 전 수치는 `--tsv`.", "",
         "화면 %d · 함수 %s · 스크립트 %s줄 · 점수 합 %s · 점수 0 화면 %d" % (len(rows), format(total["funcs"], ","), format(total["lines"], ","), format(total["score"], ","), zero), "",
         "## 1. 항목별 합계", "", "| 항목 | 축 | 가중 | 자리 | 화면 |", "| --- | --- | ---: | ---: | ---: |"]
    axis = {k: ("손작업" if WEIGHTS[k] == 3 else "회신" if WEIGHTS[k] == 2 else "기계") for k in WEIGHTS}
    for k in ORDER:
        L.append("| %s | %s | %d | %s | %d |" % (LABEL[k], axis[k], WEIGHTS[k], format(total[k], ","), sum(1 for _n, m in rows if m[k])))
    for k in INFO:
        L.append("| %s | 정보 | — | %s | %d |" % (LABEL[k], format(total[k], ","), sum(1 for _n, m in rows if m[k])))
    L += ["", "## 2. 업무군별 합계", "", "| 업무군 | 화면 | 점수 | jQuery | 폼 DOM | 원시 DOM | eval | 긴 함수 | try 없는 핸들러 | fn_ | console | TODO(회신) | TODO(병합) | TODO(규칙19) |",
          "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |"]
    for g in sorted(groups, key=lambda x: -groups[x]["score"]):
        c = groups[g]
        L.append("| %s | %d | %s | %d | %d | %d | %d | %d | %d | %d | %d | %d | %d | %d |" % (
            g, gcount[g], format(c["score"], ","), c["jquery"], c["form_dom"], c["raw_dom"], c["eval"], c["long_fn"], c["handler_notry"], c["fn_def"], c["console"],
            c["todo_vendor"], c["todo_merge"], c["todo_rule19"]))
    L += ["", "## 3. 점수 상위 화면 (%d)" % top, "", "| 화면 | 점수 | 줄 | 주된 편차 |", "| --- | ---: | ---: | --- |"]
    for name, m in sorted(rows, key=lambda r: -r[1]["score"])[:top]:
        main = ", ".join("%s %d" % (LABEL[k], m[k]) for k in sorted(ORDER, key=lambda k: -WEIGHTS[k] * m[k]) if m[k])[:120]
        L.append("| %s | %s | %s | %s |" % (name, format(m["score"], ","), format(m["lines"], ","), main))
    merged = [(n, m) for n, m in rows if n.lower() in pub_names and m["score"] > 0]
    L += ["", "## 4. 다음 손작업 배치 제안 — 퍼블리싱 병합 화면(디자인 확정) 중 점수 순 (%d)" % min(top, len(merged)), "",
          "> 병합 화면은 컴포넌트가 확정돼 B-7 처방(jQuery·폼 DOM 재작성)을 바로 적용할 수 있다. 손본 화면은 `publish_merge_overrides.json` 에 `frozen` 을 적어 보호한다.", "",
          "| 순서 | 화면 | 점수 | 주된 편차 |", "| ---: | --- | ---: | --- |"]
    for i, (name, m) in enumerate(sorted(merged, key=lambda r: -r[1]["score"])[:top], 1):
        main = ", ".join("%s %d" % (LABEL[k], m[k]) for k in sorted(ORDER, key=lambda k: -WEIGHTS[k] * m[k]) if m[k])[:120]
        L.append("| %d | %s | %s | %s |" % (i, name, format(m["score"], ","), main))
    L.append("")
    return "\n".join(L) + "\n"


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    args = argv if argv is not None else sys.argv[1:]
    tsv = Path(args[args.index("--tsv") + 1]) if "--tsv" in args else None
    top = int(args[args.index("--top") + 1]) if "--top" in args else 40
    folder = next((Path(a) for i, a in enumerate(args) if not a.startswith("--") and (i == 0 or args[i - 1] not in ("--tsv", "--top"))), TOBE)
    rows = []
    for f in sorted(glob.glob(str(folder / "*.xml"))):
        m = measure(f)
        if m is not None:
            rows.append((os.path.basename(f)[:-4], m))
    try:
        import publish_merge as pm
        pub_names = set(pm.publish_index())
    except Exception:  # noqa: BLE001
        pub_names = set()
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(render(rows, pub_names, top))
    if tsv:
        cols = ["name", "score", "lines", "funcs"] + ORDER + list(INFO)
        with io.open(tsv, "w", encoding="utf-8", newline="\n") as fh:
            fh.write("\t".join(cols) + "\n")
            for name, m in rows:
                fh.write("\t".join([name] + [str(m[c]) for c in cols[1:]]) + "\n")
    tot = sum(m["score"] for _n, m in rows)
    print("화면 %d · 점수 합 %s · 점수 0 화면 %d → %s" % (len(rows), format(tot, ","), sum(1 for _n, m in rows if m["score"] == 0), OUT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
