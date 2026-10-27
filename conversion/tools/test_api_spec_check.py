# -*- coding: utf-8 -*-
"""api_spec_check(신규 API 명세 ↔ TO-BE 통신 대조) 단위 테스트.

실행:
    pytest conversion/tools/test_api_spec_check.py
"""
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import api_spec_check as ac  # noqa: E402

SPEC = """[ULDTST00001][업무][상세 조회]
GET /api/x/select-one
REQUEST
\tbzProcsNo
RESPONSE
<w2:dataMap id="dma_x" baseNode="map"></w2:dataMap>

[ULDTST00001][업무][저장]
POST /api/x/insert
REQUEST
RESPONSE

[ULDTST00001][업무][수정]
POST /api/x/update

[ULDTST00000][업무][목록 조회 — 부모 화면]
GET /api/x/select-list
"""

DOC = ('<?xml version="1.0" encoding="UTF-8"?>\n<html xmlns="http://www.w3.org/1999/xhtml"'
       ' xmlns:w2="http://www.inswave.com/websquare" xmlns:xf="http://www.w3.org/2002/xforms">\n'
       '<head><script type="text/javascript"><![CDATA[\n{script}\n]]></script></head>\n<body></body></html>\n')

GOOD = '''scwin.API = "/api/x/";
scwin.selectOne = async function () {
    const sbmOptions = { id : "sbm_a", method : "get", action : scwin.API + "select-one" };
};
scwin.saveTrs = async function (trJob) {
    const sbmOptions = {
        id : "sbm_b",
        method : "post",
        action : scwin.API + ((trJob === "I") ? "insert" : "update")
    };
};
'''


def run(tmp_path, script, spec=SPEC, allow=()):
    x = tmp_path / "ULDTST00001.xml"
    x.write_text(DOC.format(script=script), encoding="utf-8")
    s = tmp_path / "ULDTST00001_API.txt"
    s.write_text(spec, encoding="utf-8")
    fails, warns, infos, _ = ac.check(str(x), None, allow)
    return [c for c, _ in fails], [c for c, _ in warns], [c for c, _ in infos]


def test_parse_spec_blocks():
    apis = ac.parse_spec(SPEC)
    assert [(a["screen"], a["method"], a["path"]) for a in apis] == [
        ("ULDTST00001", "GET", "/api/x/select-one"),
        ("ULDTST00001", "POST", "/api/x/insert"),
        ("ULDTST00001", "POST", "/api/x/update"),
        ("ULDTST00000", "GET", "/api/x/select-list"),
    ]


def test_all_spec_apis_used_ok_and_ternary_compare_ignored(tmp_path):
    fails, warns, infos = run(tmp_path, GOOD)
    assert fails == [] and warns == []
    assert infos == ["A06"]          # 부모 화면 블록은 정보만


def test_unknown_path_fails(tmp_path):
    fails, _, _ = run(tmp_path, GOOD + 'scwin.z = function () { const o = { method : "get", action : "/api/x/other" }; };\n')
    assert "A01" in fails


def test_method_mismatch_fails(tmp_path):
    fails, _, _ = run(tmp_path, GOOD.replace('method : "get"', 'method : "post"'))
    assert "A02" in fails


def test_unused_spec_api_fails_unless_allowed(tmp_path):
    script = GOOD.replace('((trJob === "I") ? "insert" : "update")', '"insert"')
    fails, _, _ = run(tmp_path, script)
    assert "A03" in fails
    fails, warns, _ = run(tmp_path, script, allow=("/api/x/update",))
    assert "A03" not in fails and "A03" in warns


def test_legacy_do_url_fails_but_comment_ok(tmp_path):
    fails, _, _ = run(tmp_path, GOOD + '// AS-IS "/user/list.do"\nscwin.u = "/user/list.do";\n')
    assert fails.count("A04") == 1


def test_unresolvable_action_warns(tmp_path):
    fails, warns, _ = run(tmp_path, GOOD + 'scwin.w = function (u) { const o = { action : u }; };\n')
    assert "A05" in warns


def test_no_spec_skips(tmp_path):
    x = tmp_path / "ULDTST00009.xml"
    x.write_text(DOC.format(script=GOOD), encoding="utf-8")
    fails, warns, infos, spec = ac.check(str(x))
    assert spec is None and fails == [] and infos[0][0] == "SKIP"


def test_spec_found_in_screen_folder_layout(tmp_path):
    # gfm-front 배치: ui/{화면ID}/{화면ID}_API.txt ↔ ui-tobe/{화면ID}.xml
    (tmp_path / "ui" / "ULDTST00001").mkdir(parents=True)
    (tmp_path / "ui-tobe").mkdir()
    (tmp_path / "ui" / "ULDTST00001" / "ULDTST00001_API.txt").write_text(SPEC, encoding="utf-8")
    x = tmp_path / "ui-tobe" / "ULDTST00001.xml"
    x.write_text(DOC.format(script=GOOD), encoding="utf-8")
    fails, _, _, spec = ac.check(str(x))
    assert spec is not None and spec.parent.name == "ULDTST00001" and fails == []


def test_udc_save_url_counts_as_post_call(tmp_path):
    # UDC bulkFileSaver 의 saveUrl 은 POST 호출로 본다 — insert 를 udcSaver.save 로 부르는 화면
    script = GOOD.replace('((trJob === "I") ? "insert" : "update")', '"update"') + \
        'scwin.c = async function () { await udcSaver.save({ dataMap : dma_a, saveUrl : scwin.API + "insert" }); };\n'
    fails, warns, _ = run(tmp_path, script)
    assert fails == [] and warns == []
