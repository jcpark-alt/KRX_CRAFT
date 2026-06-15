# -*- coding: utf-8 -*-
"""
WebSquare XML 변환기 — websquare_conversion_guide.md §4.2 결정적(기계) 치환.

파일을 HEAD / SCRIPT(CDATA) / BODY 3영역으로 분리한 뒤, SCRIPT 에 문자열/주석/정규식을
보호하며 결정적 규칙을 적용한다. 규칙 7(레거시→gcc 공통함수)은 gcc_mapping 로더의
substitution_dict() 를 단일 출처로 사용한다.

적용 규칙(결정적):
  · 규칙 1 : scwin.vScrenID 멱등 삽입
  · 규칙 3 : ev:on* 바인딩 핸들러명 이벤트부 소문자화 + body/script 동기화
  · 규칙 5a: == / != -> === / !==   (>=,<=,=> 및 기존 ===,!== 제외)
  · 규칙 5b: X.value = RHS; -> X.setValue(RHS);  (단일라인 대입만, 읽기 제외)
  · 규칙 7 : substitution_dict() 의 (태그없음·무충돌·순수식별자) 함수 호출부 단어경계 치환

판단 필요 항목(규칙 6 submission, 레거시 dataset API, 검토/대체·충돌 매핑 등)은 리포트로 출력.

CLI:
    python convert.py <src.xml> [out.xml]
    (out 생략 시 <src>.converted.xml)
"""
import re
import sys
import io
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gcc_mapping  # noqa: E402


# ---------- 영역 분리 ----------
def split_regions(raw):
    # 1) <script ...><![CDATA[ ... ]]></script> (표준)
    m = re.search(r'(<script[^>]*?>\s*<!\[CDATA\[)(.*?)(\]\]>\s*</script>)', raw, re.S)
    # 2) CDATA 래퍼 없는 <script ...> ... </script> (W-Craft 변환 편차)
    if not m:
        m = re.search(r'(<script[^>]*?>)(.*?)(</script>)', raw, re.S)
    if not m:
        return None
    return {
        "head": raw[:m.start()],
        "script_open": m.group(1),
        "script": m.group(2),
        "script_close": m.group(3),
        "body": raw[m.end():],
    }


# ---------- JS 코드/비코드(문자열·주석·정규식) 스캐너 ----------
def segments(code):
    segs, i, n, buf = [], 0, len(code), []
    def flush(is_code):
        if buf:
            segs.append(("".join(buf), is_code)); buf.clear()
    prev = ""
    while i < n:
        c, c2 = code[i], code[i:i+2]
        if c2 == "//":
            flush(True); j = code.find("\n", i); j = n if j < 0 else j
            segs.append((code[i:j], False)); i = j; continue
        if c2 == "/*":
            flush(True); j = code.find("*/", i+2); j = n if j < 0 else j+2
            segs.append((code[i:j], False)); i = j; continue
        if c in "\"'`":
            flush(True); q = c; j = i+1
            while j < n:
                if code[j] == "\\": j += 2; continue
                if code[j] == q: j += 1; break
                j += 1
            segs.append((code[i:j], False)); i = j; prev = "str"; continue
        if c == "/" and prev not in ("ident", ")", "]", "num", "str"):
            flush(True); j = i+1; incls = False
            while j < n:
                if code[j] == "\\": j += 2; continue
                if code[j] == "[": incls = True
                elif code[j] == "]": incls = False
                elif code[j] == "/" and not incls: j += 1; break
                elif code[j] == "\n": break
                j += 1
            segs.append((code[i:j], False)); i = j; prev = "str"; continue
        if c.isalnum() or c in "_$": prev = "ident"
        elif c in ")]": prev = c
        elif not c.isspace(): prev = c
        buf.append(c); i += 1
    flush(True)
    return segs


def code_mask(code):
    mask = bytearray(len(code)); pos = 0
    for txt, is_code in segments(code):
        if is_code:
            for k in range(pos, pos+len(txt)): mask[k] = 1
        pos += len(txt)
    return mask


# ---------- 규칙별 변환 ----------
def rule1_vscrenid(code, filename, report):
    if re.search(r'scwin\.vScrenID\s*=', code):
        report["rule1"] = "존재 → 생략(멱등)"
        return code
    report["rule1"] = '삽입'
    return '\nscwin.vScrenID = "%s";\n' % filename + code


def rule5a_strict_eq(code, report):
    cnt = [0]
    def sub_seg(s):
        s = re.sub(r'(?<![=!<>])==(?!=)', lambda m: (cnt.__setitem__(0, cnt[0]+1) or "==="), s)
        s = re.sub(r'(?<![<>])!=(?!=)', lambda m: (cnt.__setitem__(0, cnt[0]+1) or "!=="), s)
        return s
    out = [sub_seg(t) if c else t for t, c in segments(code)]
    report["rule5a"] = cnt[0]
    return "".join(out)


def rule5b_setvalue(code, report):
    mask = code_mask(code)
    pat = re.compile(r'(\b[\w$]+(?:\.[\w$]+)*)\.value\s*=\s*(?!=)([^;\n]+);')
    res, last = [], 0
    for mo in pat.finditer(code):
        if not mask[mo.start()]:
            continue
        report["rule5b"].append(mo.group(0).strip())
        res.append(code[last:mo.start()])
        res.append(mo.group(1) + ".setValue(" + mo.group(2).strip() + ");")
        last = mo.end()
    res.append(code[last:])
    return "".join(res)


def rule3_handlers(script, body, report):
    names = set(re.findall(r'ev:on[\w-]+="\s*scwin\.([\w$]+)\s*"', body))
    for nm in names:
        idx = nm.lower().rfind("_on")
        if idx < 0:
            continue
        new = nm[:idx] + nm[idx:].lower()
        if new == nm:
            continue
        body = re.sub(r'(scwin\.)' + re.escape(nm) + r'\b', r'\1' + new, body)
        script = re.sub(r'(scwin\.)' + re.escape(nm) + r'\b', r'\1' + new, script)
        report["rule3"].append("%s -> %s" % (nm, new))
    return script, body


def rule7_gcc_substitute(code, report):
    """substitution_dict() 의 함수 호출부를 단어경계로 치환(코드 세그먼트만, 메서드 호출 .fn() 제외)."""
    sub = gcc_mapping.substitution_dict()
    mask = code_mask(code)
    # 길이가 긴 이름부터(부분 겹침 방지)
    names = sorted(sub, key=len, reverse=True)
    # 호출부: 앞에 . \w $ 없고(=메서드/부분식별자 아님) 이름 뒤에 ( 가 오는 경우
    pat = re.compile(r'(?<![.\w$])(' + "|".join(re.escape(n) for n in names) + r')(\s*\()') if names else None
    if not pat:
        return code
    res, last = [], 0
    for mo in pat.finditer(code):
        if not mask[mo.start()]:
            continue
        name = mo.group(1)
        res.append(code[last:mo.start()])
        res.append(sub[name] + mo.group(2))
        report["rule7"].append("%s -> %s" % (name, sub[name]))
        last = mo.end()
    res.append(code[last:])
    return "".join(res)


# ---------- 판단 필요 항목 리포트 ----------
def collect_judgment(script, head, body, report):
    subs = re.findall(r'<xf:submission\s+id="([^"]+)"', head)
    if subs:
        report["judgment"].append("규칙6 Submission(%d): %s → sbmOptions/executeDynamic 재작성 + 노드 삭제" % (len(subs), ", ".join(subs)))
    execs = re.findall(r'\$c\.sbm\.execute\(([^)]*)\)', script)
    if execs:
        report["judgment"].append("$c.sbm.execute %d건 → executeDynamic 검토: %s" % (len(execs), ", ".join(s.strip() for s in execs)))

    # gcc_mapping 연동: 스크립트에서 발견된 '검토/대체' 태그 / 충돌 함수 → 단계2(Claude) 대상
    rows = gcc_mapping.load_mappings()
    conf = gcc_mapping.conflicts()
    tagged_hits, conflict_hits = [], []
    seen_t, seen_c = set(), set()
    for e in rows:
        if not e["tag"]:
            continue
        for name in e["pure_names"]:
            if name in seen_t:
                continue
            if re.search(r'(?<![.\w$])' + re.escape(name) + r'\s*\(', script):
                tagged_hits.append("%s→%s(%s)" % (name, e["tobe"], e["tag"])); seen_t.add(name)
    for name, tobes in conf.items():
        if name in seen_c:
            continue
        if re.search(r'(?<![.\w$])' + re.escape(name) + r'\s*\(', script):
            conflict_hits.append("%s→{%s}" % (name, " | ".join(tobes))); seen_c.add(name)
    if tagged_hits:
        report["judgment"].append("규칙7 검토/대체 태그 함수 사용: " + ", ".join(tagged_hits))
    if conflict_hits:
        report["judgment"].append("규칙7 충돌(이름→다중 tobe) 함수 사용: " + ", ".join(conflict_hits))

    legacy = sorted(set(re.findall(r'\.(NameValue|NameString|countrow|UseFilter|Filter|SortExpr|Sort|Redraw|Rowposition|RowPosition|ValueOfIndex|Index|setDisabled|bindColVal)\b', script)))
    if legacy:
        report["judgment"].append("레거시 Gauce 데이터셋/컴포넌트 API(매핑표 외): " + ", ".join("." + a for a in legacy))
    if re.search(r'window\.event\.keyCode', script):
        report["judgment"].append("window.event.keyCode (IE 레거시) → 표준 이벤트 인자 검토")
    if re.search(r'\bdebugger\b', script):
        report["judgment"].append("debugger; 잔존 → 제거 검토")
    if re.search(r'\bvar\b', script):
        report["judgment"].append("규칙8 var 선언 → const/let (재할당 분석 필요, Claude 검토)")


# ---------- 파이프라인 ----------
def convert(raw, filename):
    report = {"rule1": "", "rule3": [], "rule5a": 0, "rule5b": [], "rule7": [], "judgment": []}
    reg = split_regions(raw)
    if reg is None:
        raise ValueError("SCRIPT(CDATA) 영역을 찾지 못했습니다.")
    s = reg["script"]
    s = rule1_vscrenid(s, filename, report)
    s = rule5a_strict_eq(s, report)
    s = rule5b_setvalue(s, report)
    s = rule7_gcc_substitute(s, report)
    s, reg["body"] = rule3_handlers(s, reg["body"], report)
    collect_judgment(s, reg["head"], reg["body"], report)
    result = reg["head"] + reg["script_open"] + s + reg["script_close"] + reg["body"]
    return result, report


def print_report(rep, filename):
    print("==== [단계1] Python 기계 치환 리포트 :", filename, "====")
    print("규칙1 vScrenID :", rep["rule1"])
    print("규칙5a ==/!= → ===/!== :", rep["rule5a"], "건")
    print("규칙5b .value= → .setValue() :", len(rep["rule5b"]), "건")
    for s in rep["rule5b"]:
        print("   -", s)
    print("규칙3 ev:on 핸들러 동기화 :", len(rep["rule3"]), "건")
    for s in rep["rule3"]:
        print("   -", s)
    print("규칙7 레거시→gcc 치환 :", len(rep["rule7"]), "건")
    for s in rep["rule7"]:
        print("   -", s)
    print("\n==== [단계2 입력] Claude Code 보강 필요 항목 ====")
    for s in rep["judgment"]:
        print(" * " + s)


def main():
    if len(sys.argv) < 2:
        print("usage: python convert.py <src.xml> [out.xml]", file=sys.stderr); sys.exit(2)
    src = Path(sys.argv[1])
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix(".converted.xml")
    raw = io.open(src, "r", encoding="utf-8").read()
    result, report = convert(raw, src.name)
    io.open(out, "w", encoding="utf-8", newline="").write(result)
    sys.stdout.reconfigure(encoding="utf-8")
    print_report(report, src.name)
    print("\n생성:", out)


if __name__ == "__main__":
    main()
