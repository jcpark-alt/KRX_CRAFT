# -*- coding: utf-8 -*-
"""회신 의존 축(B) 요청 명부 생성 — ui-tobe 에 남은 「회신이 와야 닫히는」 자리를 키·화면·근거로 묶어 KRX/공급사에 물을 표를 만든다.

    python conversion/tools/jspfront_reply_request.py [--out conversion/jsp-front/reply_request.md]

B-1 컨텍스트 키(회신 A-3) — `TODO Stage2: 컨텍스트 키 출처 미확인 … — k1, k2` 의 키별 화면 수와, 화면 안에 같은 이름이 있는지
    (dataMap 키 · dataList 컬럼 · body 컴포넌트 id 접미 · 세션 키) 를 후보 근거로 적는다 — 회신이 「조회 전문/세션/상수」 중 무엇인지 고를 때 참고.
B-2 세션 키(회신 11항) — user-info 계약에 없는 키(저장소가 쓰지 않는 키)와 화면.
B-3 이동 목적지(회신 A-15) — 공급사 드러냄 IIFE 가 남은 자리의 url 리터럴을 종류(.do/.jsp/외부/조립 전/미상)로 묶는다.
B-4 제출 주소(action)·B-5 보낼 입력값(query_param) — `throw { bizMessage … unresolved: "action:…" | "query_param:…" }` 의 값·화면.

리포트 전용(파일을 바꾸지 않는다).
"""
import collections
import glob
import io
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import screen_tools as st  # noqa: E402
import vendor_postprocess as vp  # noqa: E402
import vendor_stage2 as vs  # noqa: E402

ROOT = st.ROOT
TOBE = ROOT / "conversion" / "jsp-front" / "ui-tobe"


def collect():
    ctx = collections.defaultdict(set)          # key -> screens
    ctx_evidence = collections.defaultdict(collections.Counter)  # key -> evidence kind -> screens
    ses = collections.defaultdict(set)
    nav = collections.defaultdict(lambda: collections.defaultdict(set))   # kind -> literal -> screens
    act = collections.defaultdict(set)
    qp = collections.defaultdict(set)
    for f in sorted(glob.glob(str(TOBE / "*.xml"))):
        name = Path(f).stem
        raw, _eol, reg = st.read_xml(f)
        if reg is None:
            continue
        head, sc, body = reg["head"], reg["script"], reg["body"]
        keys_in_head = set(re.findall(r'<w2:(?:key|column)\b[^>]*\sid="([^"]+)"', head))
        ids_in_body = set(re.findall(r'\sid="([^"]+)"', body))
        for m in re.finditer(r'TODO Stage2: 컨텍스트 키 출처 미확인[^\n]*— ([^\n*]*)', sc):
            for k in [x.strip() for x in m.group(1).split(",") if x.strip()]:
                ctx[k].add(name)
                leaf = k.split(".")[-1]
                if leaf in keys_in_head:
                    ctx_evidence[k]["같은 이름의 dataMap 키/dataList 컬럼"] += 1
                if any(i.lower().endswith("_" + leaf.lower()) or i == leaf for i in ids_in_body):
                    ctx_evidence[k]["같은 이름의 body 컴포넌트"] += 1
                if leaf in vp.KNOWN_SESSION_KEYS:
                    ctx_evidence[k]["세션(user-info) 키와 같은 이름"] += 1
        for m in re.finditer(r'세션 키 실환경 확인[^\n]*— ([^\n*]*)', sc):
            for k in [x.strip() for x in m.group(1).split(",") if x.strip()]:
                ses[k].add(name)
        for fname, s, b, e, _ in st.func_spans(sc):
            fbody = sc[b:e]
            for m in vs.NAV_IIFE.finditer(fbody):
                arg = m.group(1).strip()
                lit = re.fullmatch(r'''(["'])([^"']*)\1''', arg)
                v = lit.group(2) if lit else None
                if v is None and re.fullmatch(r'[\w$.]+', arg):
                    am = re.search(r'(?:let|const|var)?\s*%s\s*=\s*(["\'])([^"\']*)\1' % re.escape(arg), fbody)
                    v = am.group(2) if am else None
                if v is None:
                    kind, lit_v = "미상(변수 — 리터럴 대입 없음)", arg
                elif v == "":
                    kind, lit_v = "조립 전 빈 문자열", arg
                elif v.startswith("http") or v.startswith("kakaolink"):
                    kind, lit_v = "외부 주소(openExternalPage 후보)", v
                elif ".do" in v:
                    kind, lit_v = ".do(JSP 액션 — 화면 HTML 인지 JSON 인지)", v.split("?")[0]
                elif ".jsp" in v or ".gfm" in v:
                    kind, lit_v = ".jsp/.gfm(전환 범위 확인)", v.split("?")[0]
                else:
                    kind, lit_v = "기타", v
                nav[kind][lit_v].add(name)
        for m in re.finditer(r'unresolved: "action:([^"]*)"', sc):
            act[m.group(1)].add(name)
        for m in re.finditer(r'unresolved: "query_param:([^"]*)"', sc):
            for k in m.group(1).split(","):
                if k.strip():
                    qp[k.strip()].add(name)
    return ctx, ctx_evidence, ses, nav, act, qp


def render(ctx, ctx_evidence, ses, nav, act, qp):
    L = ["# jsp-front(r13 전환본) 회신 요청 명부 — B 축(회신 의존)", "",
         "> `python conversion/tools/jspfront_reply_request.py` 가 `ui-tobe` 를 읽어 만든다. 회신이 오면 규칙(convert/vendor_postprocess)에 반영해 전량 재생성한다.", ""]
    L += ["## B-1 컨텍스트 키 — as-is EL 이 서버 렌더로 채우던 값의 출처(회신 A-3)", "",
          "키 %d종 · 화면 %d. 근거 열은 화면 안에 같은 이름이 있는 화면 수(조회 전문 후보 / 입력 컴포넌트 후보 / 세션 후보)." % (len(ctx), len(set().union(*ctx.values())) if ctx else 0), "",
          "| 키 | 화면 수 | dataMap/dataList 같은 이름 | body 컴포넌트 같은 이름 | 세션 키 같은 이름 | 화면(최대 5) |", "| --- | ---: | ---: | ---: | ---: | --- |"]
    for k, screens in sorted(ctx.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        ev = ctx_evidence[k]
        L.append("| `%s` | %d | %d | %d | %d | %s |" % (k, len(screens), ev["같은 이름의 dataMap 키/dataList 컬럼"], ev["같은 이름의 body 컴포넌트"],
                                                   ev["세션(user-info) 키와 같은 이름"], ", ".join(sorted(screens)[:5])))
    L += ["", "## B-2 세션 키 — user-info 응답 계약에 없는 키(회신 11항)", "",
          "저장소(sample-front·pcc)가 이미 쓰는 키(%s)는 계약에 있는 것으로 보고 뺐다." % ", ".join(sorted(vp.KNOWN_SESSION_KEYS)), "",
          "| 키 | 화면 수 | 화면(최대 8) |", "| --- | ---: | --- |"]
    for k, screens in sorted(ses.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        L.append("| `%s` | %d | %s |" % (k, len(screens), ", ".join(sorted(screens)[:8])))
    L += ["", "## B-3 이동 목적지 — 공급사 드러냄 래퍼가 남은 자리(회신 A-15)", "",
          "내부 `.xml` 리터럴로 정해지는 자리는 V32 가 이미 걷었다. 남은 것은 아래 종류별이다.", ""]
    for kind, lits in sorted(nav.items(), key=lambda kv: -sum(len(v) for v in kv[1].values())):
        L += ["### %s — 자리 %d · 대상 %d종" % (kind, sum(len(v) for v in lits.values()), len(lits)), "", "| 대상 | 화면 수 | 화면(최대 6) |", "| --- | ---: | --- |"]
        for lit, screens in sorted(lits.items(), key=lambda kv: (-len(kv[1]), kv[0])):
            L.append("| `%s` | %d | %s |" % (lit, len(screens), ", ".join(sorted(screens)[:6])))
        L.append("")
    L += ["## B-4 제출 주소(action) — 자기 화면 제출의 목적지를 못 정한 자리", "", "| action | 화면 수 | 화면(최대 6) |", "| --- | ---: | --- |"]
    for k, screens in sorted(act.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        L.append("| `%s` | %d | %s |" % (k, len(screens), ", ".join(sorted(screens)[:6])))
    L += ["", "## B-5 보낼 입력값(query_param) — as-is 가 URL 에 싣던 값을 정적으로 못 읽은 자리", "",
          "`SCREN_PROCES_TP_CD`·`SCREN_ID`·`DEP_CD`·`MKT_ID`·`INTEG_USR_ID` 는 화면 상수(V26)·`scwin.screenId`·세션 키로 채울 수 있는 후보다 — 통신별 처리구분 값만 확정하면 된다.", "",
          "| 키 | 화면 수 | 화면(최대 8) |", "| --- | ---: | --- |"]
    for k, screens in sorted(qp.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        L.append("| `%s` | %d | %s |" % (k, len(screens), ", ".join(sorted(screens)[:8])))
    return "\n".join(L) + "\n"


def main(argv=None):
    sys.stdout.reconfigure(encoding="utf-8")
    args = argv if argv is not None else sys.argv[1:]
    out = ROOT / "conversion" / "jsp-front" / "reply_request.md"
    if "--out" in args:
        out = Path(args[args.index("--out") + 1])
    ctx, ev, ses, nav, act, qp = collect()
    io.open(out, "w", encoding="utf-8", newline="\n").write(render(ctx, ev, ses, nav, act, qp))
    print("생성:", out)
    print("B-1 컨텍스트 키 %d종 · B-2 세션 키 %d종 · B-3 이동 목적지 %d자리 · B-4 action %d종 · B-5 query_param 키 %d종"
          % (len(ctx), len(ses), sum(len(s) for l in nav.values() for s in l.values()), len(act), len(qp)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
