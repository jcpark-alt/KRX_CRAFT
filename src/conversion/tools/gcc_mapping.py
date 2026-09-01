# -*- coding: utf-8 -*-
"""
레거시 → gcc 공통함수 치환 매핑 로더.

단일 출처(SOT): src/docs/api/{fil,ins,mgt}/index_transfer.html 의 `const DATA = [ ... ];` 배열.
이 모듈은 그 DATA 배열을 파싱해서 변환기(websquare_conversion_guide.md §4.2 규칙 7)가
바로 쓸 수 있는 형태로 제공한다. 별도 사본을 두지 않으므로 매핑이 늘어도 이 파일은 수정 불필요.

stdlib 만 사용(의존성 0).

사용 예:
    from gcc_mapping import load_mappings, substitution_dict, lookup
    sub = substitution_dict()          # {asis_fn: tobe}  (규칙 7 자동 1:1 치환용, 태그 없는 순수 식별자만)
    entry = lookup("fn_Trim")          # 해당 함수의 매핑 항목
    rows = load_mappings()             # 전체 항목(모듈/파일/asis/tobe/desc/tag)

CLI:
    python gcc_mapping.py              # 요약(건수/충돌/샘플) 출력
"""
import re
import sys
import io
from pathlib import Path

DEFAULT_MODULES = ("fil", "ins", "mgt", "stf")

# 순수 JS 식별자(자동 1:1 치환 가능한 함수명) 판정. 와일드카드(*), 범위(~), 주석((mgt)) 등은 제외된다.
_IDENT_RE = re.compile(r"^[A-Za-z_$][\w$]*$")
# 객체 내부의 key:"value" 추출 (key 는 식별자, value 는 큰따옴표 문자열)
_FIELD_RE = re.compile(r'([A-Za-z_]\w*)\s*:\s*"((?:\\.|[^"\\])*)"')


def _api_base(base_dir=None):
    """index_transfer.html 들이 위치한 src/docs/api 경로를 돌려준다."""
    if base_dir is not None:
        return Path(base_dir)
    # 이 파일: src/conversion/tools/gcc_mapping.py → parents[2] == src
    return Path(__file__).resolve().parents[2] / "docs" / "api"


def _extract_data_block(html):
    """HTML 문자열에서 `const DATA = [ ... ];` 의 대괄호 내부를 추출(괄호 매칭)."""
    m = re.search(r"const\s+DATA\s*=\s*\[", html)
    if not m:
        return None
    i = m.end() - 1  # '[' 위치
    depth, j, n = 0, i, len(html)
    while j < n:
        c = html[j]
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                return html[i + 1:j]
        j += 1
    return None


def _iter_objects(block):
    """DATA 배열 본문에서 최상위 객체 `{ ... }` 들을 순회. (객체 중첩 없음 전제, 주석은 자연히 무시)"""
    depth, start = 0, None
    for idx, c in enumerate(block):
        if c == "{":
            if depth == 0:
                start = idx
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0 and start is not None:
                yield block[start:idx + 1]
                start = None


def _split_asis(raw):
    """asis 원본 문자열을 개별 토큰으로 분해. ('a / b / c' → ['a','b','c'])"""
    return [t.strip() for t in raw.split("/") if t.strip()]


def load_mappings(modules=DEFAULT_MODULES, base_dir=None):
    """
    모듈별 index_transfer.html 의 DATA 를 파싱해 매핑 항목 리스트를 반환한다.
    각 항목: {module, file, tobe, desc, tag, asis_raw, asis_names, pure_names}
      - asis_names : '/' 로 분해한 모든 토큰
      - pure_names : 그중 순수 JS 식별자만(자동 치환 후보)
    """
    base = _api_base(base_dir)
    out = []
    for mod in modules:
        path = base / mod / "index_transfer.html"
        if not path.exists():
            continue
        html = io.open(path, "r", encoding="utf-8").read()
        block = _extract_data_block(html)
        if block is None:
            continue
        for obj in _iter_objects(block):
            fields = {k: v for k, v in _FIELD_RE.findall(obj)}
            if "asis" not in fields or "tobe" not in fields:
                continue
            names = _split_asis(fields["asis"])
            out.append({
                "module": mod,
                "file": fields.get("file", ""),
                "tobe": fields["tobe"].strip(),
                "desc": fields.get("desc", ""),
                "tag": fields.get("tag") or None,
                "asis_raw": fields["asis"],
                "asis_names": names,
                "pure_names": [n for n in names if _IDENT_RE.match(n)],
            })
    return out


def _aggregate(modules, base_dir):
    """
    순수 식별자별로 집계한다.
      name -> {"tobes": set(전체 tobe), "untagged": set(태그없는 tobe), "tagged": bool(어느 항목이든 태그 존재)}
    """
    agg = {}
    for e in load_mappings(modules, base_dir):
        for name in e["pure_names"]:
            a = agg.setdefault(name, {"tobes": set(), "untagged": set(), "tagged": False})
            a["tobes"].add(e["tobe"])
            if e["tag"]:
                a["tagged"] = True
            else:
                a["untagged"].add(e["tobe"])
    return agg


def substitution_dict(no_tag_only=True, modules=DEFAULT_MODULES, base_dir=None):
    """
    규칙 7 자동 1:1 치환용 사전 {asis_fn: tobe} 를 만든다.
      - 순수 식별자(pure_names)만 포함 (와일드카드/주석/패턴 표기는 제외)
      - no_tag_only=True : **어느 모듈에서든** 검토/대체 태그가 붙은 이름은 제외 → 안전한 기계 치환만
      - 같은 이름이 서로 다른 tobe 로 매핑되면(충돌) 제외 (conflicts() 로 확인)
    """
    out = {}
    for name, a in _aggregate(modules, base_dir).items():
        if no_tag_only:
            if a["tagged"]:
                continue
            cand = a["untagged"]
        else:
            cand = a["tobes"]
        if len(cand) == 1:
            out[name] = next(iter(cand))
    return out


_MODULE_FN_CACHE = {}


def module_fn_dict(base_dir=None):
    """
    이미 `$c.<ns>.` 네임스페이스가 붙었지만 함수명이 레거시인 호출을 gcc 정규명으로
    정규화하기 위한 사전 { "$c.<ns>.<asis>": "$c.<ns>.<tobe>" } 를 만든다.

    단일 출처(SOT): src/as-is/{fil,ins,mgt,stf}/gcc/*.xml 각 함수의 JSDoc
    `(AS-IS: <원본명>, origin: ...)` 주석 + 바로 뒤의 `scwin.<tobe> = function` 정의.
    네임스페이스는 파일의 `meta_screenId="$c.<ns>"` 에서 읽는다(substitution_map.md §9 와 동일).
      - asis == tobe(이름 동일)·내부 헬퍼(tobe 가 `__` 시작)·비식별자(와일드카드 등)는 제외.
      - 같은 키가 서로 다른 tobe 로 갈리면(충돌) 제외.
    """
    base = (Path(base_dir) if base_dir else Path(__file__).resolve().parents[2]) / "as-is"
    cache_key = str(base)
    if cache_key in _MODULE_FN_CACHE:
        return _MODULE_FN_CACHE[cache_key]
    raw = {}   # key -> set(tobe full)
    for path in sorted(base.glob("*/gcc/*.xml")):
        text = io.open(path, "r", encoding="utf-8", errors="replace").read()
        m = re.search(r'meta_screenId="\$c\.([A-Za-z_][\w]*)"', text)
        if not m:
            continue
        ns = m.group(1)
        for am in re.finditer(r'\(AS-IS:\s*([^,)]+?)\s*(?:,[^)]*)?\)', text):
            fm = re.search(r'scwin\.([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function',
                           text[am.end():am.end() + 600])
            if not fm:
                continue
            tobe = fm.group(1)
            if tobe.startswith("__"):          # 내부 헬퍼는 외부 호출 정규화 대상 아님
                continue
            for asis in re.split(r'[\/,]', am.group(1)):
                asis = asis.strip()
                if not _IDENT_RE.match(asis) or asis == tobe:
                    continue
                raw.setdefault("$c.%s.%s" % (ns, asis), set()).add("$c.%s.%s" % (ns, tobe))
    out = {k: next(iter(v)) for k, v in raw.items() if len(v) == 1}
    _MODULE_FN_CACHE[cache_key] = out
    return out


def conflicts(no_tag_only=True, modules=DEFAULT_MODULES, base_dir=None):
    """같은 asis 식별자가 2개 이상 다른 tobe 로 매핑되는 충돌 목록 {name: [tobe, ...]}."""
    out = {}
    for name, a in _aggregate(modules, base_dir).items():
        cand = a["untagged"] if no_tag_only else a["tobes"]
        if len(cand) > 1:
            out[name] = sorted(cand)
    return out


def lookup(name, modules=DEFAULT_MODULES, base_dir=None):
    """asis 함수명으로 매핑 항목들을 찾는다(여러 모듈에 존재할 수 있어 리스트 반환)."""
    return [e for e in load_mappings(modules, base_dir) if name in e["asis_names"]]


def _main():
    rows = load_mappings()
    sub = substitution_dict()
    conf = conflicts()
    by_mod = {}
    for e in rows:
        by_mod[e["module"]] = by_mod.get(e["module"], 0) + 1
    print("== gcc_mapping 로더 요약 ==")
    print("총 매핑 항목 :", len(rows), "(" + ", ".join("%s=%d" % (m, by_mod[m]) for m in sorted(by_mod)) + ")")
    print("자동 1:1 치환 사전(태그없음·순수식별자·무충돌) :", len(sub), "개")
    print("충돌(같은 이름 → 다른 tobe) :", len(conf), "건")
    for name, tobes in sorted(conf.items()):
        print("   ! %-22s -> %s" % (name, " | ".join(tobes)))
    print("\n샘플 치환 사전 (앞 12개):")
    for k in sorted(sub)[:12]:
        print("   %-22s -> %s" % (k, sub[k]))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    _main()
