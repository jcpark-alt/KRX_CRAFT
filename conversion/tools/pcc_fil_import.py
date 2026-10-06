# -*- coding: utf-8 -*-
"""pcc/fil 반입(2026-10-06) — 화면 로컬 헬퍼로 두었던 as-is 업무공통을 `cm/pcc/fil/fil.xml`($c.fil) 로 옮기고, 화면은 `$c.fil.*` 를 부른다.

    python conversion/tools/pcc_fil_import.py [--dry] <xml|폴더> ...     (ui-tobe 제자리, 멱등)

하는 일(스크립트 영역, 코드 부분만):
  · 반입된 로컬 헬퍼 정의(JSDoc 포함) 삭제 — IMPORTED 의 `scwin.<name> = [async ]function …};` 블록
  · 호출 `scwin.<name>(` → `$c.fil.<name>(`
  · 상수 `scwin.<CONST>` → `$c.fil.<CONST>`, 1구역의 `scwin.<CONST> = …;  // … as-is 공용 상수` 선언 삭제
  · `scwin.lastJob = X;` → `$c.fil.setLastJob(X);`, 그 밖의 `scwin.lastJob` → `$c.fil.getLastJob()`, 1구역 `scwin.lastJob = "";` 선언 삭제
  · head publicInfo 에서 삭제된 함수 제거
화면에 남는 로컬 헬퍼(화면 스코프에 묶여 pcc 로 못 가는 것): getMktId(as-is 전역 js_market·TODO) · setSearchPeriod/setPeriodDates(화면의 cal_sdate/edate·search()) ·
opener/openerScwin/openerComp(부모 화면 스코프).
파이프라인(vendor_postprocess V21·V24~V26, vendor_stage2 V29·V30)은 반입 뒤 처음부터 `$c.fil.*` 를 내므로, 이 도구는 이미 전환된 ui-tobe 를 제자리에서 옮길 때 쓴다.
"""
import collections
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402
import convert as cv  # noqa: E402

IMPORTED = ("confirmJob", "alertJobResult", "checkRequired", "isNumberInput", "getFieldName", "getSecuGrpNm", "showObj", "showTotalCount",
            "getModalCenterPos", "checkDateParts", "isZipCodeInput", "getByteLength2", "truncateByBytes", "checkByteLimit", "isMinusNumber",
            "checkNotOnlyNumber", "checkAlphaNum", "isGroupChecked")
CONSTS = ("SCREN_PROCS_TP_CD_01", "SCREN_PROCS_TP_CD_02", "SCREN_PROCS_TP_CD_03", "SCREN_PROCS_TP_CD_04", "SCREN_PROCS_TP_CD_05", "SCREN_PROCS_TP_CD_06",
          "SCREN_PROCS_TP_CD_07", "SCREN_PROCS_TP_CD_08", "TR_JOB_NORMAL", "TR_JOB_INSERT", "TR_JOB_UPDATE", "TR_JOB_DELETE",
          "NO_EXCEL_DATA", "NO_DATA_FOUND", "MSG_CND_ISR_REQ")


def _drop_definitions(script, names):
    """`scwin.<name> = function…};` 블록(바로 앞 JSDoc 포함)을 지운다."""
    n = 0
    for name, s, b, e, _ in reversed(st.func_spans(script)):
        if name not in names:
            continue
        # 블록 끝: 닫는 중괄호 뒤의 `;` 와 줄끝
        end = e + 1
        m = re.match(r'\s*;?[ \t]*\n?', script[end:])
        end += m.end() if m else 0
        # 앞 JSDoc
        start = s
        pre = script[:s]
        mj = re.search(r'(?s)/\*\*(?:(?!\*/).)*\*/\s*$', pre)
        if mj:
            start = mj.start()
        # 앞의 빈 줄 하나 정리
        while start > 0 and script[start - 1] == "\n" and script[start - 2:start] == "\n\n":
            start -= 1
        script = script[:start] + script[end:]
        n += 1
    return script, n


def rewrite(script, head):
    log = collections.Counter()
    defined = {name for name, *_ in st.func_spans(script)}
    drop = {d for d in defined if d in IMPORTED}
    if drop:
        script, log["defs_dropped"] = _drop_definitions(script, drop)
    parts = []
    for text, is_code in cv.segments(script):
        if is_code:
            text, c = re.subn(r'(?<![\w$.])scwin\.(%s)\s*\(' % "|".join(IMPORTED), r'$c.fil.\1(', text); log["calls"] += c
            text, c = re.subn(r'(?<![\w$.])scwin\.(%s)\b(?!\s*=[^=])' % "|".join(CONSTS), r'$c.fil.\1', text); log["consts"] += c
        parts.append(text)
    script = "".join(parts)
    # lastJob — 대입의 우변에 문자열이 오므로(segments 가 문자열을 쪼갠다) 코드 마스크로 원문에서 다룬다
    mask = cv.code_mask(script)
    out, pos = [], 0
    for m in re.finditer(r'(?<![\w$.])scwin\.lastJob\b(\s*=(?!=)\s*)?', script):
        if m.start() < pos or not mask[m.start()]:
            continue
        if m.group(1):
            end = script.find(";", m.end())
            if end < 0 or "\n" in script[m.end():end]:
                continue
            out.append(script[pos:m.start()]); out.append("$c.fil.setLastJob(%s);" % script[m.end():end].strip()); pos = end + 1; log["lastJob_set"] += 1
        else:
            out.append(script[pos:m.start()]); out.append("$c.fil.getLastJob()"); pos = m.end(); log["lastJob_get"] += 1
    out.append(script[pos:])
    script = "".join(out)
    # 1구역 선언 삭제(상수·lastJob)
    script, c = re.subn(r'(?m)^scwin\.(?:%s) = [^\n]*//[^\n]*as-is 공용 상수[^\n]*\n' % "|".join(CONSTS), "", script); log["const_decls_dropped"] += c
    script, c = re.subn(r'(?m)^\$c\.fil\.setLastJob\(""\);[ \t]*//[^\n]*\n', "", script); log["lastJob_decl_dropped"] += c
    # publicInfo
    if drop:
        m = re.search(r'<w2:publicInfo method="([^"]*)"', head)
        if m:
            keep = [x for x in m.group(1).split(",") if x.strip() and x.strip().replace("scwin.", "") not in drop]
            head = head.replace(m.group(0), '<w2:publicInfo method="%s"' % ",".join(keep))
    # 5구역 머리만 남고 비면 그대로 둔다(컨벤션 단계가 정리)
    return script, head, {k: v for k, v in log.items() if v}


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    files, fl, _ = st.parse_cli(argv if argv is not None else sys.argv[1:], flags=("--dry",), opts=())
    if not files:
        print(__doc__); return 2
    tot = collections.Counter(); changed = 0
    for f in files:
        raw, eol, reg = st.read_xml(f)
        if reg is None:
            continue
        script, head, log = rewrite(reg["script"], reg["head"])
        if log:
            tot.update(log); changed += 1
            print("%-18s %s" % (Path(f).stem, dict(log)))
            if not fl["--dry"]:
                st.write_xml(f, head, reg["script_open"], script, reg["script_close"], reg["body"], eol)
    print("변경 화면 %d · 합계 %s" % (changed, dict(tot)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
