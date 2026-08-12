# -*- coding: utf-8 -*-
"""
gcc 공통이관 매핑 통합 문서(index_transfer.html) 자동 생성기.

단일 출처(SOT):
  - RAW(파일별 AS-IS→TO-BE 매핑) : src/docs/api/{fil,ins,mgt}/index_transfer.html 의
    `const DATA = [...]` 배열 — gcc_mapping.load_mappings() 로 읽어 통합·중복제거한다.
  - CONV_RULES(객체/컴포넌트 단위 직접 치환 규칙) : 아래 CONV_RULES 상수
    (conversion_rules.md 규칙 14·15 계열과 수동 동기화).

이 스크립트는 두 데이터를 `index_transfer.template.html`(CSS/JS 셸)의 플레이스홀더에
주입해 `src/docs/api/gcc/index_transfer.html` 한 파일을 생성한다. 생성물은 손으로 편집하지 않는다.

stdlib 만 사용(의존성 0). gcc_mapping 을 같은 디렉터리에서 import 한다.

사용 예:
    python -m gen_index_transfer                         # 기본 경로로 생성
    python gen_index_transfer.py -o <out.html>           # 출력 경로 지정
"""
from __future__ import annotations

import argparse
import io
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gcc_mapping  # noqa: E402

_HERE = os.path.dirname(os.path.abspath(__file__))
_TEMPLATE = os.path.join(_HERE, "index_transfer.template.html")
# src/conversion/tools → src
_SRC = os.path.abspath(os.path.join(_HERE, "..", ".."))
_DEFAULT_OUT = os.path.join(_SRC, "docs", "api", "gcc", "index_transfer.html")

# 공통 변환 규칙 — 객체/컴포넌트 단위 직접 치환 패턴(파일 무관). conversion_rules.md 규칙 14·15 계열과 동기화.
CONV_RULES = [
    {"asis": '$c.{객체명}.showObj({컴포넌트}, true)',
     "tobe": '{컴포넌트}.show("");',
     "note": '인자로 ""을 추가하고 호출하여야 이전 display 속성을 유지'},
    {"asis": '$c.{객체명}.showObj({컴포넌트}, false)',
     "tobe": '{컴포넌트}.hide();',
     "note": ''},
    {"asis": '$c.{객체명}.alert_error',
     "tobe": '$c.win.alert  또는  $c.win.messageBox($p, "alert", "{보낼 메시지}", {callbackFunction});',
     "note": '단순 알림은 $c.win.alert, 콜백이 필요하면 $c.win.messageBox 사용'},
    {"asis": '$c.{객체명}.getObjectValue({컴포넌트})',
     "tobe": '{컴포넌트}.getValue();',
     "note": ''},
    {"asis": '$c.{객체명}.setObjectValue({컴포넌트}, value)',
     "tobe": '{컴포넌트}.setValue(value);',
     "note": ''},
]


def _js(s: str) -> str:
    """문자열을 JS(=JSON) 리터럴로 안전 인코딩(한글 보존)."""
    return json.dumps(s or "", ensure_ascii=False)


def build_raw(modules=gcc_mapping.DEFAULT_MODULES, base_dir=None) -> list[dict]:
    """fil/ins/mgt 의 DATA 를 통합하고 (file, asis, tobe, desc, tag) 기준 중복제거."""
    out, seen = [], set()
    for e in gcc_mapping.load_mappings(modules, base_dir):
        row = {"file": e["file"], "asis": e["asis_raw"], "desc": e["desc"],
               "tobe": e["tobe"], "tag": e["tag"]}
        key = (row["file"], row["asis"], row["tobe"], row["desc"], row["tag"] or "")
        if key in seen:
            continue
        seen.add(key)
        out.append(row)
    return out


def _render_raw(rows: list[dict]) -> str:
    lines = []
    for r in rows:
        parts = ["file:" + _js(r["file"]), "asis:" + _js(r["asis"]),
                 "desc:" + _js(r["desc"]), "tobe:" + _js(r["tobe"])]
        if r.get("tag"):
            parts.append("tag:" + _js(r["tag"]))
        lines.append("  { " + ", ".join(parts) + " },")
    return "\n".join(lines)


def _render_rules(rules: list[dict]) -> str:
    lines = []
    for r in rules:
        parts = ["asis:" + _js(r["asis"]), "tobe:" + _js(r["tobe"]), "note:" + _js(r.get("note", ""))]
        lines.append("  { " + ", ".join(parts) + " },")
    return "\n".join(lines)


def render(modules=gcc_mapping.DEFAULT_MODULES, base_dir=None, template=_TEMPLATE) -> tuple[str, int]:
    rows = build_raw(modules, base_dir)
    html = io.open(template, "r", encoding="utf-8").read()
    html = html.replace("/*__RAW__*/", _render_raw(rows))
    html = html.replace("/*__CONV_RULES__*/", _render_rules(CONV_RULES))
    return html, len(rows)


def main(argv=None) -> int:
    p = argparse.ArgumentParser(prog="gen_index_transfer",
                                description="gcc 공통이관 매핑 통합 문서(index_transfer.html) 생성기")
    p.add_argument("-o", "--out", default=_DEFAULT_OUT, help="출력 HTML 경로")
    p.add_argument("--base-dir", default=None, help="src/docs/api 경로(테스트용)")
    p.add_argument("--as-is-base", default=None, help="(미사용) 호환용")
    args = p.parse_args(argv)

    html, n = render(base_dir=args.base_dir)
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    io.open(args.out, "w", encoding="utf-8", newline="\n").write(html)
    print("생성 완료: %s  (%d 매핑, %d 규칙)" % (args.out, n, len(CONV_RULES)))
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
