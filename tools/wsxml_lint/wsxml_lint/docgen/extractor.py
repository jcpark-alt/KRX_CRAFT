"""XML + JSDoc -> API 모델 추출.

기존 wsxml_lint 인프라를 재사용한다:
- WsDocument.load: lxml 파싱(+CDATA 자동 언랩)
- namespaces.q / XHTML / W2: 요소 탐색
- Linter._expand: 파일/디렉터리 수집

공개 API(<w2:publicInfo> 에 등재된 scwin.* / @hidden N)만 문서화한다.
JSDoc 태그 순서는 신뢰할 수 없고(@returns 가 @param 사이에 끼기도 함) 값이
여러 줄에 걸칠 수 있으므로, 블록을 @tag 단위 세그먼트로 토큰화해 처리한다.
"""

from __future__ import annotations

import os
import re

from ..document import WsDocument
from ..linter import Linter
from ..namespaces import W2, XHTML, q
from .model import ApiMethod, ApiModule, ApiParam, ApiReturn

# /** ... */ 블록 (첫 번째 */ 까지, 비탐욕). finditer 로 블록끼리 겹치지 않게 수집.
_JSDOC_RE = re.compile(r"/\*\*(.*?)\*/", re.DOTALL)
# 블록 직후(공백/개행 허용)에 오는 scwin.<name> = (async) function (<args>) 선언.
_ASSIGN_RE = re.compile(r"\s*scwin\.([A-Za-z0-9_$]+)\s*=\s*(?:async\s+)?function\s*\(([^)]*)\)")
# 정리된 줄에서 @tag 시작을 인식.
_TAG_RE = re.compile(r"^@(\w+)\s?(.*)$")


def extract_modules(paths) -> list[ApiModule]:
    """경로(파일/디렉터리) 목록에서 모듈 목록을 추출한다(파일명 기준 정렬)."""
    files = Linter._expand(paths)
    mods = [extract_module(f) for f in files]
    mods.sort(key=lambda m: m.file.lower())
    return mods


def extract_module(path: str) -> ApiModule:
    doc = WsDocument.load(path)
    filename = doc.filename
    stem = os.path.splitext(filename)[0]
    root = doc.root
    if root is None:
        return ApiModule(name=stem, namespace="$c." + stem, file=filename,
                         title=stem, note="파싱 실패(잘못된 XML).")

    head = root.find(q(XHTML, "head"))
    namespace = title = desc = ""
    public: set[str] = set()
    if head is not None:
        namespace = (head.get("meta_screenId") or "").strip()
        title = (head.get("meta_screenName") or "").strip()
        desc = (head.get("meta_desc") or "").strip()
        pi = head.find(q(W2, "publicInfo"))
        if pi is not None:
            for tok in (pi.get("method") or "").split(","):
                tok = tok.strip()
                if tok.startswith("scwin."):
                    tok = tok[len("scwin."):]
                if tok:
                    public.add(tok)
    if not namespace:
        namespace = "$c." + stem
    if not title:
        title = stem

    # 모든 <script> CDATA 를 합친다(lxml 이 .text 로 언랩).
    script_text = "\n".join((s.text or "") for s in root.iter(q(XHTML, "script")))

    methods: list[ApiMethod] = []
    for assign, args, body in _iter_doc_blocks(script_text):
        if assign not in public:      # 공개 API 만 (hidden/__ 는 publicInfo 에 없음)
            continue
        method = _build_method(assign, args, body)
        method.qualified = f"{namespace}.{method.name}"
        methods.append(method)

    note = ""
    if not methods:
        note = "공개 메서드가 없습니다." if not public else ""
    return ApiModule(name=stem, namespace=namespace, file=filename,
                     title=title, desc=desc, methods=methods, note=note)


# --------------------------------------------------------------------- parsing


def _iter_doc_blocks(text: str):
    """(assign_name, args, body) 를 순서대로 yield. 선언이 안 붙은 고아 블록은 건너뜀."""
    for m in _JSDOC_RE.finditer(text):
        am = _ASSIGN_RE.match(text, m.end())
        if am:
            yield am.group(1), am.group(2), m.group(1)


def _clean_line(raw: str) -> str:
    """JSDoc 의 ' * ' 장식을 제거. '*' 없는(드문) 줄은 양끝 공백만 정리."""
    m = re.match(r"^\s*\*\s?(.*)$", raw)
    return m.group(1) if m else raw.strip()


def _tokenize(body: str) -> list[tuple[str, str]]:
    """블록 본문을 (tag, value) 세그먼트로 분해. 값은 다음 @tag 전까지 여러 줄 허용."""
    segments: list[tuple[str, str]] = []
    tag: str | None = None
    buf: list[str] = []
    for raw in body.splitlines():
        line = _clean_line(raw)
        m = _TAG_RE.match(line)
        if m:
            if tag is not None:
                segments.append((tag, "\n".join(buf).strip("\n")))
            tag = m.group(1)
            buf = [m.group(2)]
        elif tag is not None:
            buf.append(line)
        # 첫 @tag 이전 줄은 무시
    if tag is not None:
        segments.append((tag, "\n".join(buf).strip("\n")))
    return segments


def _split_type(s: str) -> tuple[str, str]:
    """선행 {Type} 를 중괄호 균형으로 잘라낸다('{Promise<void>}', '{a:b}' 대응)."""
    s = s.lstrip()
    if s.startswith("{"):
        depth = 0
        for i, ch in enumerate(s):
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return s[1:i], s[i + 1:].lstrip()
    return "", s  # 타입 없음 또는 불균형


def _parse_param(val: str) -> ApiParam | None:
    val = val.strip()
    if not val:
        return None
    typ, rest = _split_type(val)
    parts = rest.split(None, 1)
    name = parts[0] if parts else ""
    pdesc = parts[1].strip() if len(parts) > 1 else ""
    if not (typ or name or pdesc):
        return None
    return ApiParam(type=typ.strip(), name=name, desc=pdesc)


def _parse_return(val: str) -> ApiReturn | None:
    val = val.strip()
    if not val:
        return None
    typ, rest = _split_type(val)
    return ApiReturn(type=typ.strip(), desc=rest.strip())


def _clean_args(args: str) -> str:
    return ", ".join(a.strip() for a in args.split(",") if a.strip())


def _build_method(assign: str, args: str, body: str) -> ApiMethod:
    name = assign
    desc_parts: list[str] = []
    params: list[ApiParam] = []
    returns: ApiReturn | None = None
    example = exception = ""
    deprecated: str | None = None

    for tag, val in _tokenize(body):
        t = tag.lower()
        if t == "name":
            toks = val.strip().split()
            if toks:
                name = toks[0]
        elif t == "description":
            if val.strip():
                desc_parts.append(val.strip())
        elif t == "param":
            p = _parse_param(val)
            if p:
                params.append(p)
        elif t in ("returns", "return"):
            if returns is None:
                returns = _parse_return(val)
        elif t == "example":
            example = val.strip("\n").rstrip()
        elif t == "exception":
            exception = val.strip()
        elif t == "deprecated":
            deprecated = val.strip()  # 빈 문자열이어도 '존재'를 의미(렌더는 is not None 로 판단)

    return ApiMethod(
        name=name,
        signature=f"{name}({_clean_args(args)})",
        description="\n".join(desc_parts).strip(),
        params=params,
        returns=returns,
        example=example,
        exception=exception,
        deprecated=deprecated,
    )
