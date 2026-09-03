# -*- coding: utf-8 -*-
"""Stage 2 잔여 TODO 워크리스트 자동 집계기.

4개 모듈 ui-tobe 의 `// TODO Stage2:` / `// TO-DO` 주석을 스캔해
`src/conversion/md/stage2_todo_worklist.md` 를 재생성한다.

실행:
    python src/conversion/tools/gen_stage2_worklist.py
"""
import datetime
import glob
import io
import os
import re
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
OUT = os.path.join(ROOT, "md", "stage2_todo_worklist.md")
MODS = [
    ("fil", "next-krx-lds-fil-front"),
    ("mgt", "next-krx-lds-mgt-front"),
    ("stf", "next-krx-lds-stf-front"),
    ("tms", "next-krx-lds-tms-front"),
]

TODO_RE = re.compile(r"//\s*(TODO Stage2\s*:?[^\n]*|TO\s*-\s*DO[^\n]*)")

# (유형명, 판별 키워드, 해결 방법) — 위에서부터 첫 매칭 적용
TYPES = [
    ("응답 처리(구 submitDoneHandler)", ("sbmRtn 응답 처리", "submitDoneHandler 자리"),
     "순차 스타일 `await executeDynamic` 직후의 응답(sbmRtn) 처리 로직을 업무에 맞게 작성. 처리 불필요 시 주석 제거."),
    ("0-based 인덱스 검토", ("0-based",),
     "Gauce 1-based → WebSquare 0-based. 비정형 루프는 토큰만 치환된 상태 — 화면 실행으로 행 접근 어긋남 확인 후 `-1`/`+1` 조정."),
    ("$c.frame 프레임 재설계(형제/절대)", ("$c.frame",),
     "`../frame_head`·`/top` 등 형제/절대 프레임 접근은 대응 공통함수 없음. 프레임 구조 확정 후 재설계(부모는 `$c.win.getParent()` 전환 완료)."),
    ("Gauce 통신 재설계(DataID/KeyValue/Post)", ("Gauce 통신",),
     "trs `KeyValue`/`Post`/`SetDataHeader` 잔존 — 서버 API 확정 후 `executeDynamic` 으로 재설계(규칙 12/16)."),
    ("그리드 포커스 전환(구 Rowposition)", ("그리드 포커스",),
     "구 `ds.Rowposition = v` 쓰기 — 대상 그리드 특정 후 `setFocusedCell(row, col)` 로 재작성(유일 바인딩은 자동 전환 완료)."),
    ("필터 재설계(setColumnFilter)", ("Gauce Filter", "setColumnFilter"),
     "Gauce `Filter()`/onfilter 콜백 로직을 `setColumnFilter({type:\"row\",...})`/`removeColumnFilterAll()` 로 재구현."),
    ("조회 파라미터/세션 API 확정", ("API 확정", "조회 파라미터", "세션"),
     "조회 파라미터·세션 사용자 정보 취득 API 확정 시 반영."),
    ("팝업 파라미터/결과 처리 보강", ("팝업으로 전달할 파라미터", "result 값", "arg 값"),
     "openPopup 전환 화면의 data 파라미터 채움·result/arg 수신 후 업무 로직 작성."),
]
ETC = ("기타(개발필요)", "개별 확인 필요(원본 미구현 스텁 등).")


def classify(msg):
    for name, keys, _ in TYPES:
        if any(k in msg for k in keys):
            return name
    return ETC[0]


def main():
    per_type = defaultdict(lambda: defaultdict(list))   # type -> file -> [lines]
    per_mod = defaultdict(int)
    total = 0
    for mod, folder in MODS:
        base = os.path.join(ROOT, folder, "ui-tobe")
        for f in sorted(glob.glob(os.path.join(base, "**", "*.xml"), recursive=True)):
            t = io.open(f, "r", encoding="utf-8").read()
            rel = "[%s] %s" % (mod, os.path.relpath(f, base).replace("\\", "/"))
            for mm in TODO_RE.finditer(t):
                ln = t.count("\n", 0, mm.start()) + 1
                per_type[classify(mm.group(1))][rel].append(ln)
                per_mod[mod] += 1
                total += 1

    today = datetime.date.today().isoformat()
    L = []
    L.append("# Stage 2 잔여 TODO 워크리스트 (conversion ui-tobe)")
    L.append("")
    L.append("> W-Craft 변환 Stage 2에서 **기계가 안전하게 확정할 수 없어 보류**한 항목 목록이다. 대부분 화면 실행(런타임)·업무 로직 판단·서버 API 스펙 확정이 필요하다. 코드 내 `// TODO Stage2:` / `// TO-DO` 주석과 1:1 대응한다. 변환본은 `src/conversion/next-krx-lds-{fil,mgt,stf,tms}-front/ui-tobe/` 에 있다.")
    L.append("")
    L.append("자동 생성 문서(`python src/conversion/tools/gen_stage2_worklist.py`, 최종 집계 %s) — 항목 해결 시 코드의 주석을 제거하고 본 도구로 재집계할 것." % today)
    L.append("")
    L.append("## 요약")
    L.append("")
    L.append("| 모듈 | 항목 수 |")
    L.append("| --- | ---: |")
    for mod, _ in MODS:
        L.append("| %s | %d |" % (mod, per_mod[mod]))
    L.append("| **합계** | **%d** |" % total)
    L.append("")
    L.append("| 유형 | 항목 수 | 해결 방법 |")
    L.append("| --- | ---: | --- |")
    type_order = [name for name, _, _ in TYPES] + [ETC[0]]
    howto = {name: how for name, _, how in TYPES}
    howto[ETC[0]] = ETC[1]
    for name in type_order:
        if per_type.get(name):
            L.append("| %s | %d | %s |" % (name, sum(len(v) for v in per_type[name].values()), howto[name]))
    L.append("")
    L.append("### 추가 점검 유형 (코드에 `// TODO Stage2:` 주석을 남기면 다음 집계에 포함)")
    L.append("")
    L.append("| 유형 | 해결 방법 |")
    L.append("| --- | --- |")
    L.append("| browserPopup 부모 접근 | browserPopup 화면의 `window.opener.*`·부모 scwin 호출을 `$c.win.getOpenerScope()`/`callOpener()` 로 재작성(`getParent()` 불가). 가이드: `src/docs/popup-opener-guide.md` |")
    L.append("| 목록↔상세 복귀 상태 복원 | 목록→상세 moveUrl/setPageFrameSrc 화면에 `{isHistory:true, dataInfo}` 스냅샷 + 상세 [목록] 버튼 `{restoreData:true}` 적용, 목록 onpageload 에 `_isHistoryRestore` 자동조회 skip 관례 적용. 가이드: `src/docs/frame-history-guide.md` |")
    L.append("| 페이징 전체보기/역순 순번 대체 | AS-IS 자체 구현(전체보기 토글·내림차순 순번 계산)을 `$c.sbm.setPagingInfo` 옵션(`maxRowNum:\"all\"`, `rowNumVisble:\"{grid}|desc\"`, `rowNumColumn`)으로 대체 |")
    L.append("")
    for name in type_order:
        files = per_type.get(name)
        if not files:
            continue
        n = sum(len(v) for v in files.values())
        L.append("## %s  (%d)" % (name, n))
        L.append("")
        L.append(howto[name])
        L.append("")
        L.append("| 파일 | 라인 |")
        L.append("| --- | --- |")
        for rel in sorted(files):
            L.append("| `%s` | %s |" % (rel, ", ".join(str(x) for x in files[rel])))
        L.append("")
    io.open(OUT, "w", encoding="utf-8", newline="\n").write("\n".join(L))
    print("생성:", OUT)
    print("합계:", total, "건 /", sum(len(v) for tv in per_type.values() for v in tv), "파일 항목")
    for name in type_order:
        if per_type.get(name):
            print("  %-36s %4d건 / %d파일" % (name, sum(len(v) for v in per_type[name].values()), len(per_type[name])))


if __name__ == "__main__":
    main()
