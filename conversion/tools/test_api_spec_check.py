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

GOOD = '''scwin.selectOne = async function () {
    const sbmOptions = { id : "sbm_a", method : "get", action : "/api/x/select-one" };
};
scwin.saveTrs = async function (trJob) {
    const sbmOptions = {
        id : "sbm_b",
        method : "post",
        action : (trJob === "I") ? "/api/x/insert" : "/api/x/update"
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
    script = GOOD.replace('(trJob === "I") ? "/api/x/insert" : "/api/x/update"', '"/api/x/insert"')
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
    # conversion-front 배치: ui/{화면ID}/{화면ID}_API.txt ↔ ui-tobe/{화면ID}.xml
    (tmp_path / "ui" / "ULDTST00001").mkdir(parents=True)
    (tmp_path / "ui-tobe").mkdir()
    (tmp_path / "ui" / "ULDTST00001" / "ULDTST00001_API.txt").write_text(SPEC, encoding="utf-8")
    x = tmp_path / "ui-tobe" / "ULDTST00001.xml"
    x.write_text(DOC.format(script=GOOD), encoding="utf-8")
    fails, _, _, spec = ac.check(str(x))
    assert spec is not None and spec.parent.name == "ULDTST00001" and fails == []


def test_spec_found_in_completed_folder_layout(tmp_path):
    # 전환 완료 화면: ui/completed/{화면ID}/{화면ID}_API.md ↔ ui-tobe/{화면ID}.xml
    (tmp_path / "ui" / "completed" / "ULDTST00001").mkdir(parents=True)
    (tmp_path / "ui-tobe").mkdir()
    (tmp_path / "ui" / "completed" / "ULDTST00001" / "ULDTST00001_API.md").write_text(SPEC_MD, encoding="utf-8")
    x = tmp_path / "ui-tobe" / "ULDTST00001.xml"
    x.write_text(DOC.format(script=GOOD), encoding="utf-8")
    fails, _, _, spec = ac.check(str(x))
    assert spec is not None and spec.parent.parent.name == "completed" and fails == []


def test_udc_save_url_counts_as_post_call(tmp_path):
    # UDC bulkFileSaver 의 saveUrl 은 POST 호출로 본다 — insert 를 udcSaver.save 로 부르는 화면
    script = GOOD.replace('(trJob === "I") ? "/api/x/insert" : "/api/x/update"', '"/api/x/update"') + \
        'scwin.c = async function () { await udcSaver.save({ dataMap : dma_a, saveUrl : $c.sbm.getContextPath() + "/api/x/insert" }); };\n'
    fails, warns, _ = run(tmp_path, script)
    assert fails == [] and warns == []


# ── 규칙 38: action 은 전체 경로 리터럴 (A07) ──
def _a07(tmp_path, action_expr, key="action"):
    script = GOOD + 'scwin.k = async function () { const o = { method : "post", %s : %s }; };\n' % (key, action_expr)
    fails, _, _ = run(tmp_path, script)
    return fails.count("A07")


def test_a07_global_base_concat_fails(tmp_path):
    assert _a07(tmp_path, 'scwin.API + "insert"') == 1


def test_a07_global_base_with_ternary_fails(tmp_path):
    assert _a07(tmp_path, 'scwin.API + ((trJob === "I") ? "insert" : "update")') == 1


def test_a07_relative_literal_fails(tmp_path):
    assert _a07(tmp_path, '"insert"') == 1


def test_a07_plain_concat_fails(tmp_path):
    assert _a07(tmp_path, '"/api/x/" + "insert"') == 1


def test_a07_ternary_condition_may_use_scwin(tmp_path):
    assert _a07(tmp_path, '(scwin.mode === "I") ? "/api/x/insert" : "/api/x/update"') == 0


def test_a07_ternary_branch_global_fails(tmp_path):
    assert _a07(tmp_path, '(scwin.mode === "I") ? scwin.URL_INS : "/api/x/update"') == 1


def test_a07_save_url_context_path_prefix_ok(tmp_path):
    assert _a07(tmp_path, '$c.sbm.getContextPath() + "/api/x/insert"', key="saveUrl") == 0
    assert _a07(tmp_path, '$c.sbm.getContextPath() + scwin.API + "insert"', key="saveUrl") == 1


def test_a07_local_variable_is_a05_not_a07(tmp_path):
    script = GOOD + 'scwin.w = function (u) { const o = { action : u }; };\n'
    fails, warns, _ = run(tmp_path, script)
    assert "A07" not in fails and "A05" in warns


def test_a07_runs_without_spec(tmp_path):
    x = tmp_path / "ULDTST00009.xml"
    x.write_text(DOC.format(script='scwin.a = function () { const o = { action : scwin.API + "x" }; };'), encoding="utf-8")
    fails, _w, infos, spec = ac.check(str(x))
    assert spec is None and [c for c, _ in fails] == ["A07"] and infos[0][0] == "SKIP"


def test_a07_multiline_ternary_is_joined(tmp_path):
    script = GOOD + ('scwin.m = async function () {\n    await mud.saveMapForm({\n        saveUrl : scwin.aplcNo\n'
                     '            ? "/api/x/update"\n            : "/api/x/insert",\n        onSuccess : null\n    });\n};\n')
    fails, _, _ = run(tmp_path, script)
    assert "A07" not in fails


# ── 규칙 39 (conversion-front): getContextPath 접두 금지 (A08) ──
def _a08(tmp_path, expr, key="saveUrl", folder="conversion-front", no_ctx=False):
    d = tmp_path / folder / "ui-tobe"
    d.mkdir(parents=True, exist_ok=True)
    x = d / "ULDTST00009.xml"
    x.write_text(DOC.format(script='scwin.a = async function () { await udcSaver.save({ %s : %s }); };' % (key, expr)),
                 encoding="utf-8")
    fails, _w, _i, _s = ac.check(str(x), None, (), no_ctx)
    return [c for c, _ in fails]


def test_a08_context_path_prefix_fails_in_gfm_front(tmp_path):
    assert _a08(tmp_path, '$c.sbm.getContextPath() + "/api/x/insert"') == ["A08"]
    assert _a08(tmp_path, '$c.sbm.getContextPath() + "/api/x/insert"', key="action") == ["A08"]


def test_a08_full_literal_ok_in_gfm_front(tmp_path):
    assert _a08(tmp_path, '"/api/x/insert"') == []


def test_a08_prefix_with_global_also_a07(tmp_path):
    assert sorted(_a08(tmp_path, '$c.sbm.getContextPath() + scwin.API + "insert"')) == ["A07", "A08"]


def test_a08_global_save_url_is_a07_in_gfm_front(tmp_path):
    assert _a08(tmp_path, 'scwin.API + "insert"') == ["A07"]


def test_a08_off_outside_gfm_front_unless_flag(tmp_path):
    assert _a08(tmp_path, '$c.sbm.getContextPath() + "/api/x/insert"', folder="sample-front") == []
    assert _a08(tmp_path, '$c.sbm.getContextPath() + "/api/x/insert"', folder="sample-front", no_ctx=True) == ["A08"]


# ── md 명세 (2026-10-27) ──
SPEC_MD = """```markdown
# 업무 API 명세

## 1. [ULDTST00001][업무][상세 조회]

**1) AS-IS → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `GET /api/x/select-one.do`
*   **TO-BE** : `GET /api/x/select-one`

**[REQUEST]**
```javascript
const requestData = { bzProcsNo : bzProcsNo };
[ULDTST09999] 코드 블록 안의 대괄호 줄은 블록 머리가 아니다
```

## 2. [ULDTST00001][업무][저장]
* **AS-IS** : `POST /api/x/insert.do`
* **TO-BE** : `POST /api/x/insert`

## 3. [ULDTST00001][업무][수정]
POST /api/x/update

## 4. [ULDTST00000][업무][목록 조회 — 부모 화면]
* **TO-BE** : `GET /api/x/select-list`
```
"""


def test_parse_md_spec_uses_tobe_line_and_heading_blocks():
    apis = ac.parse_spec(SPEC_MD, "md")
    assert [(a["screen"], a["method"], a["path"]) for a in apis] == [
        ("ULDTST00001", "GET", "/api/x/select-one"),
        ("ULDTST00001", "POST", "/api/x/insert"),
        ("ULDTST00001", "POST", "/api/x/update"),       # TO-BE 줄이 없으면 블록 안 첫 method 줄
        ("ULDTST00000", "GET", "/api/x/select-list"),
    ]


def test_parse_spec_detects_md_by_content():
    assert len(ac.parse_spec(SPEC_MD)) == 4
    assert len(ac.parse_spec(SPEC)) == 4                 # txt 형식은 그대로


def test_md_spec_found_in_screen_folder_and_checked(tmp_path):
    (tmp_path / "ui" / "ULDTST00001").mkdir(parents=True)
    (tmp_path / "ui-tobe").mkdir()
    (tmp_path / "ui" / "ULDTST00001" / "ULDTST00001_API.md").write_text(SPEC_MD, encoding="utf-8")
    x = tmp_path / "ui-tobe" / "ULDTST00001.xml"
    x.write_text(DOC.format(script=GOOD), encoding="utf-8")
    fails, warns, infos, spec = ac.check(str(x))
    assert spec.suffix == ".md" and fails == [] and warns == []
    assert [c for c, _ in infos] == ["A06"]


def test_md_spec_flags_unused_and_unknown(tmp_path):
    (tmp_path / "ui" / "ULDTST00001").mkdir(parents=True)
    (tmp_path / "ui-tobe").mkdir()
    (tmp_path / "ui" / "ULDTST00001" / "ULDTST00001_API.md").write_text(SPEC_MD, encoding="utf-8")
    x = tmp_path / "ui-tobe" / "ULDTST00001.xml"
    script = GOOD.replace('"/api/x/select-one"', '"/api/x/select-one.do"')
    x.write_text(DOC.format(script=script), encoding="utf-8")
    codes = [c for c, _ in ac.check(str(x))[0]]
    assert "A01" in codes and "A03" in codes            # AS-IS .do 경로는 명세에 없는 경로, select-one 미사용


def test_txt_spec_wins_over_md_in_same_folder(tmp_path):
    (tmp_path / "ULDTST00001_API.txt").write_text(SPEC, encoding="utf-8")
    (tmp_path / "ULDTST00001_API.md").write_text(SPEC_MD, encoding="utf-8")
    x = tmp_path / "ULDTST00001.xml"
    x.write_text(DOC.format(script=GOOD), encoding="utf-8")
    assert ac.check(str(x))[3].suffix == ".txt"


# ── 화면ID 묶음 블록 [A/B] (2026-10-27) ──
SPEC_MULTI = """## 1. [ULDTST00001/ULDTST00002][업무][공용 인쇄]
* **AS-IS** : ``
* **TO-BE** : `GET /api/x/print`

## 2. [ULDTST00000/ULDTST00001][업무][목록·상세 조회]
* **TO-BE** : `GET /api/x/select-one`

## 3. [ULDTST00002][업무][다른 화면 전용]
* **TO-BE** : `POST /api/x/other`
"""


def test_multi_screen_block_head_parsed():
    apis = ac.parse_spec(SPEC_MULTI, "md")
    assert [a["screen"] for a in apis] == ["ULDTST00001/ULDTST00002", "ULDTST00000/ULDTST00001", "ULDTST00002"]
    assert ac.screens_of(apis[0]) == ["ULDTST00001", "ULDTST00002"]
    txt = "[ULDTST00001/ULDTST00002][업무][x]\nGET /api/x/print\n"
    assert ac.parse_spec(txt, "txt")[0]["path"] == "/api/x/print"


def test_multi_screen_block_counts_as_mine(tmp_path):
    (tmp_path / "ULDTST00001_API.md").write_text(SPEC_MULTI, encoding="utf-8")
    x = tmp_path / "ULDTST00001.xml"
    script = ('scwin.a = async function () { const o = { method : "get", action : "/api/x/print" }; };\n'
              'scwin.b = async function () { const o = { method : "get", action : "/api/x/select-one" }; };\n')
    x.write_text(DOC.format(script=script), encoding="utf-8")
    fails, warns, infos, _ = ac.check(str(x))
    assert fails == [] and warns == []
    assert [c for c, _ in infos] == ["A06"]          # [ULDTST00002] 전용 블록만 다른 화면


def test_multi_screen_block_unused_is_a03(tmp_path):
    (tmp_path / "ULDTST00001_API.md").write_text(SPEC_MULTI, encoding="utf-8")
    x = tmp_path / "ULDTST00001.xml"
    x.write_text(DOC.format(script='scwin.a = function () { const o = { method : "get", action : "/api/x/print" }; };'), encoding="utf-8")
    codes = [c for c, _ in ac.check(str(x))[0]]
    assert codes == ["A03"]                             # 묶음 블록의 select-one 을 부르지 않음


def test_screens_of_range_and_comma_heads():
    # 공유 명세 머리글: `[A~B]` 범위(뒤쪽 숫자 꼬리 약식 포함)·`[A, B]` 쉼표 묶음(2026-10-28 ULDSTF08301~08305)
    assert ac.screens_of({"screen": "ULDSTF08301~08305"}) == [f"ULDSTF0830{n}" for n in range(1, 6)]
    assert ac.screens_of({"screen": "ULDSTF08301~305"}) == [f"ULDSTF0830{n}" for n in range(1, 6)]
    assert ac.screens_of({"screen": "ULDSTF08304, ULDSTF08305"}) == ["ULDSTF08304", "ULDSTF08305"]
    apis = ac.parse_spec("## 1. [ULDSTF08301~08305][업무][제목]\n* **TO-BE** : `GET /api/x/select-one`\n"
                         "## 2. [ULDSTF08304, ULDSTF08305][업무][제목]\n* **TO-BE** : `GET /api/x/select-fst`\n", "md")
    assert [a["path"] for a in apis] == ["/api/x/select-one", "/api/x/select-fst"]
    assert "ULDSTF08303" in ac.screens_of(apis[0]) and "ULDSTF08303" not in ac.screens_of(apis[1])


def test_head_without_system_prefix_is_same_screen():
    # 명세 머리에 시스템 접두 없이 `[STF08200]` 으로 적혀도 ULDSTF08200 의 블록(2026-10-28) — 아니면 조용히 A06 처리돼 대조가 빠진다
    api = {"screen": "STF08200"}
    assert ac.is_screen_of(api, "ULDSTF08200")
    assert not ac.is_screen_of(api, "ULDSTF08201")
    assert not ac.is_screen_of({"screen": "ULDSTF08200"}, "XXXSTF08200")
    assert ac.is_screen_of({"screen": "ULDSTF08301~08305"}, "ULDSTF08303")


def test_md_first_block_without_hash_heading():
    # md 명세 첫 블록이 `## 1.` 없이 `[화면ID][…]` 로 시작해도 첫 블록으로 읽는다(2026-10-28 ULDSTF05950) — 중간의 `[` 줄은 여전히 무시
    text = ("[ULDTST00001][업무][콤보 조회]\n* **TO-BE** : get /api/x/select-combo\n"
            "## 2. [ULDTST00001][업무][목록 조회]\n* **TO-BE** : `GET /api/x/select-list`\n"
            "```\n[ULDTST00009][코드 블록 안]\nGET /api/x/not-a-block\n```\n")
    apis = ac.parse_spec(text, "md")
    assert [a["path"] for a in apis] == ["/api/x/select-combo", "/api/x/select-list"]


def test_md_first_block_without_hash_heading():
    # md 명세 첫 블록이 `## 1.` 없이 `[화면ID][…]` 로 시작해도 첫 블록으로 읽는다(2026-10-28 ULDSTF05950) — 중간의 `[` 줄은 여전히 무시
    text = ("[ULDTST00001][업무][콤보 조회]\n* **TO-BE** : get /api/x/select-combo\n"
            "## 2. [ULDTST00001][업무][목록 조회]\n* **TO-BE** : `GET /api/x/select-list`\n"
            "```\n[ULDTST00009][코드 블록 안]\nGET /api/x/not-a-block\n```\n")
    apis = ac.parse_spec(text, "md")
    assert [a["path"] for a in apis] == ["/api/x/select-combo", "/api/x/select-list"]


def test_group_head_numeric_tail_inherits_prefix():
    # 공용 명세 머리 `[ULDSTF08032/08032_new/08033]` — 숫자로 시작하는 꼬리는 앞 화면ID 의 접두를 이어받는다(2026-10-30 ULDSTF08031~08037)
    api = {"screen": "ULDSTF08032/08032_new/08033/08033_new/08034"}
    assert ac.screens_of(api) == ["ULDSTF08032", "ULDSTF08032_new", "ULDSTF08033", "ULDSTF08033_new", "ULDSTF08034"]
    assert ac.is_screen_of(api, "ULDSTF08033_new")
    assert not ac.is_screen_of(api, "ULDSTF08037")
    assert ac.screens_of({"screen": "ULDSTF08301~305, 08306"}) == [f"ULDSTF0830{n}" for n in range(1, 7)]


def test_shared_spec_file_found_by_listed_name(tmp_path):
    # 파일명이 화면ID 를 쉼표로 나열한 공용 명세 — ui/ 아래 어느 하위 폴더에 있어도 그 화면의 명세로 찾는다
    ui = tmp_path / "ui" / "ULDTST00001"
    ui.mkdir(parents=True)
    spec = ui / "ULDTST00001,ULDTST00002_new,ULDTST00003_API.md"
    spec.write_text("## 1. [ULDTST00001/00002_new][업무][x]\n* **TO-BE** : `GET /api/x/select-one`\n", encoding="utf-8")
    tobe = tmp_path / "ui-tobe"
    tobe.mkdir()
    x = tobe / "ULDTST00002_new.xml"
    x.write_text(DOC.format(script='scwin.a = async function () { const o = { method : "get", action : "/api/x/select-one" }; };'), encoding="utf-8")
    found, sid = ac.find_spec(str(x))
    assert found == spec and sid == "ULDTST00002_new"
    fails, warns, _infos, _ = ac.check(str(x))
    assert fails == [] and warns == []
    assert ac.find_spec(str(tobe / "ULDTST00004.xml"))[0] is None
