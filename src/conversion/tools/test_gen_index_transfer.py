# -*- coding: utf-8 -*-
"""gen_index_transfer(gcc 이관매핑 문서 생성기) 단위 테스트.

실행:
    pytest src/conversion/tools/test_gen_index_transfer.py
    npm run test:transfer

- 합성 픽스처(임시 fil/ins/mgt DATA)로 통합·중복제거·필드보존·멱등성을 검증하고,
- 실데이터로 커밋된 index_transfer.html 이 SOT 와 동기화돼 있는지(드리프트 없음) 확인한다.
"""
import io
import os
import sys

import pytest

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import gen_index_transfer as gen  # noqa: E402

_REPO = os.path.abspath(os.path.join(_HERE, "..", "..", ".."))
_COMMITTED = os.path.join(_REPO, "src", "docs", "api", "gcc", "index_transfer.html")


def _write_module(api_dir, mod, rows):
    """api_dir/<mod>/index_transfer.html 에 최소 HTML(const DATA=[...])을 쓴다."""
    d = os.path.join(api_dir, mod)
    os.makedirs(d, exist_ok=True)
    lines = []
    for r in rows:
        parts = ['file:"%s"' % r["file"], 'asis:"%s"' % r["asis"],
                 'desc:"%s"' % r.get("desc", ""), 'tobe:"%s"' % r["tobe"]]
        if r.get("tag"):
            parts.append('tag:"%s"' % r["tag"])
        lines.append("  { " + ", ".join(parts) + " },")
    html = "<html><body><script>\nconst DATA = [\n%s\n];\n</script></body></html>" % "\n".join(lines)
    io.open(os.path.join(d, "index_transfer.html"), "w", encoding="utf-8").write(html)


@pytest.fixture
def fake_api(tmp_path):
    api = tmp_path / "api"
    _write_module(str(api), "fil", [
        {"file": "common.xml", "asis": "fn_Trim / trim", "desc": "공백 제거", "tobe": "$c.str.trim"},
        {"file": "common.xml", "asis": "fn_IsNull", "desc": "빈값 체크", "tobe": "$c.util.isEmpty"},
    ])
    _write_module(str(api), "ins", [
        # fil 과 완전히 동일한 행 → 중복제거 대상
        {"file": "common.xml", "asis": "fn_Trim / trim", "desc": "공백 제거", "tobe": "$c.str.trim"},
        {"file": "form.xml", "asis": "chkNum", "desc": "숫자 검증", "tobe": "$c.num.isNumber", "tag": "검토"},
    ])
    _write_module(str(api), "mgt", [
        {"file": "grid.xml", "asis": "showObj", "desc": "표시", "tobe": "$c.validate.setComponentProperty", "tag": "대체"},
    ])
    return str(api)


def test_build_raw_dedup(fake_api):
    rows = gen.build_raw(base_dir=fake_api)
    # fil 2 + ins 2 + mgt 1 = 5, 그중 fn_Trim 행 1건 중복 → 4
    assert len(rows) == 4
    keys = [(r["file"], r["asis"], r["tobe"], r["desc"], r["tag"] or "") for r in rows]
    assert len(set(keys)) == len(keys), "중복이 남아있음"


def test_build_raw_preserves_fields(fake_api):
    rows = gen.build_raw(base_dir=fake_api)
    by_asis = {r["asis"]: r for r in rows}
    # asis 원본(슬래시 토큰) 보존
    assert "fn_Trim / trim" in by_asis
    # tag 보존
    assert by_asis["chkNum"]["tag"] == "검토"
    assert by_asis["showObj"]["tag"] == "대체"
    # tag 없는 행은 None
    assert by_asis["fn_IsNull"]["tag"] is None


def test_module_order(fake_api):
    # fil → ins → mgt 순서로 통합(중복 제외 후 첫 등장 순서 유지)
    rows = gen.build_raw(base_dir=fake_api)
    order = [r["asis"] for r in rows]
    assert order == ["fn_Trim / trim", "fn_IsNull", "chkNum", "showObj"]


def test_render_fills_placeholders(fake_api):
    html, n = gen.render(base_dir=fake_api)
    assert n == 4
    assert "/*__RAW__*/" not in html
    assert "/*__CONV_RULES__*/" not in html
    assert "const RAW = [" in html
    assert "const CONV_RULES = [" in html
    # 합성 데이터가 주입됐는지
    assert "$c.validate.setComponentProperty" in html


def test_render_idempotent(fake_api):
    a, _ = gen.render(base_dir=fake_api)
    b, _ = gen.render(base_dir=fake_api)
    assert a == b


def test_conv_rules_all_rendered(fake_api):
    html, _ = gen.render(base_dir=fake_api)
    for rule in gen.CONV_RULES:
        # asis 패턴 텍스트가 그대로 출력에 존재(JSON 이스케이프는 큰따옴표만 영향)
        needle = rule["asis"]
        assert needle in html, "CONV_RULES 누락: %s" % needle


def test_committed_doc_in_sync():
    """커밋된 index_transfer.html 이 SOT 재생성 결과와 동일해야 한다(드리프트 감지).

    어긋나면 `npm run docs:transfer` 재생성 후 커밋 필요.
    """
    if not os.path.exists(_COMMITTED):
        pytest.skip("생성물 없음")
    fresh, _ = gen.render()  # 실제 fil/ins/mgt DATA 사용
    committed = io.open(_COMMITTED, "r", encoding="utf-8").read()
    norm = lambda s: s.replace("\r\n", "\n").rstrip("\n")
    assert norm(fresh) == norm(committed), \
        "index_transfer.html 이 SOT 와 어긋남 → `npm run docs:transfer` 재생성 후 커밋하세요."
