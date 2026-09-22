# -*- coding: utf-8 -*-
"""convert.py 규칙 11/30 보강(2026-09-22) 단위 테스트 — W-Craft 주석·include 주석 전부 삭제.

실행:
    pytest conversion/tools/test_convert_rule30.py

- 규칙 11: `// #include(...)`, `// //#include(...)` 등 다중 주석 접두·`#` 변형 include 삭제
- 규칙 30: `// \t//----W-Craft …----//` 다중 접두 마커 삭제(끝 `----/` 결손 허용), `★Wcraft guide★` 블록 삭제,
  guide 안내 문장은 judgment 리포트로 이관(상용구만이면 리포트 없음), 멱등, 파이프라인 결과에 W-Craft 흔적 0.
- 긴 `////…` 구분선에서 정규식이 선형 시간에 끝나는지(파국적 역추적 회귀) 검증.
"""
import os
import sys
import time

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import convert  # noqa: E402


def _run(src):
    rep = {"rule11": 0, "judgment": []}
    out = convert.remove_wcraft_markers(convert.rule11_remove_include(src, rep), rep)
    return out, rep


def test_double_commented_include_variants_removed():
    src = ('// //#include("../js/PopupCalendar.js");\n'
           '// #include("../js/session.js");\n'
           '//     //include("../js/a.js");\n'
           'include("../js/b.js");\n'
           'scwin.keep = 1;\n')
    out, rep = _run(src)
    assert "include(" not in out
    assert rep["rule11"] == 4
    assert "scwin.keep = 1;" in out


def test_double_prefixed_markers_removed_including_truncated_tail():
    src = ('//     //----W-Craft WebSquare 변환 확인: include----//\n'
           '// \t//----W-Craft WebSquare 변환 확인: include----/\n'
           '    // //----W-Craft WebSquare 변환 확인: CreateDialogFrame----//\n'
           '    //----W-Craft WebSquare 변환 확인: reset----//\n'
           'scwin.a = 1;\n')
    out, rep = _run(src)
    assert "W-Craft" not in out
    assert rep["wcraft"] == 4
    assert out.strip() == "scwin.a = 1;"


def test_guide_block_boilerplate_only_deleted_without_report():
    src = ('/* ★Wcraft guide★    \n'
           '스크립트 수작업 유의사항\n'
           '1. include 제거\n'
           '2.\n'
           '\n'
           '*/\n'
           'scwin.a = 1;\n')
    out, rep = _run(src)
    assert "Wcraft guide" not in out and "/*" not in out
    assert rep["wcraft_guide"] == 1
    assert rep["judgment"] == []


def test_guide_block_notes_moved_to_judgment():
    src = ('/* ★Wcraft guide★\n'
           '스크립트 수작업 유의사항\n'
           'eval함수는 자동변환에 제약이 많습니다. ASIS소스 확인 후 변환해주세요.\n'
           'eval함수 사용 수: 2\n'
           '\n'
           '*/\n'
           'scwin.a = 1;\n')
    out, rep = _run(src)
    assert "Wcraft guide" not in out
    assert len(rep["judgment"]) == 1
    j = rep["judgment"][0]
    assert j.startswith("규칙30 ★Wcraft guide★ 안내 삭제") and "eval함수 사용 수: 2" in j


def test_guide_block_x_note_moved_to_judgment_and_dashes_dropped():
    src = ('/* ★Wcraft guide★    \n'
           '스크립트 수작업 유의사항\n'
           ' ASIS에서 문법에 어긋난 문장이 발견되었습니다. 이는 WCRAFT에서 X 로 변환합니다.  \n'
           '----------------------------------------------------\n'
           '[0] 기존 문법 오류\n'
           '----------------------------------------------------\n'
           '*/\n')
    out, rep = _run(src)
    assert out.strip() == ""
    assert len(rep["judgment"]) == 1
    assert "X 로 변환합니다" in rep["judgment"][0]
    assert "----" not in rep["judgment"][0]


def test_other_block_comments_and_strings_untouched():
    src = ('/**\n * @method\n * @name a\n */\n'
           'scwin.a = function () {\n'
           '    const s = "//----W-Craft WebSquare 변환 확인----//";\n'
           '    const t = "include(x)";\n'
           '};\n')
    out, rep = _run(src)
    assert out == src
    assert rep["wcraft"] == 0 and rep["wcraft_guide"] == 0 and rep["rule11"] == 0


def test_idempotent():
    src = ('/* ★Wcraft guide★\n스크립트 수작업 유의사항\n*/\n'
           '//     //----W-Craft WebSquare 변환 확인: include----//\n'
           '// //#include("../js/PopupCalendar.js");\n'
           'scwin.a = 1;\n')
    once, _ = _run(src)
    twice, rep2 = _run(once)
    assert once == twice
    assert rep2["wcraft"] == 0 and rep2["wcraft_guide"] == 0 and rep2["rule11"] == 0


def test_full_pipeline_leaves_no_wcraft_trace():
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:w2="http://www.inswave.com/websquare" '
        'xmlns:xf="http://www.w3.org/2002/xforms" xmlns:ev="http://www.w3.org/2001/xml-events">\n'
        "<head>\n<xf:model>\n</xf:model>\n"
        '<script type="text/javascript"><![CDATA[\n'
        "/* ★Wcraft guide★    \n스크립트 수작업 유의사항\n\n*/\n"
        "\n//     //----W-Craft WebSquare 변환 확인: include----//\n"
        '// //#include("../js/PopupCalendar.js");\n'
        "scwin.onpageload = function () {\n"
        "    // //----W-Craft WebSquare 변환 확인: reset----//\n"
        "    scwin.cnt = 1;\n"
        "};\n"
        "]]></script>\n</head>\n<body>\n</body>\n</html>\n"
    )
    out, report = convert.convert(xml, "ULDTEST00002.xml")
    assert "W-Craft" not in out and "Wcraft" not in out and "include(" not in out
    assert "scwin.cnt = 1;" in out
    assert report["wcraft"] >= 2 and report["wcraft_guide"] == 1 and report["rule11"] == 1


def test_long_slash_divider_lines_do_not_backtrack():
    # (?:/+[ \t]*)* 류 중첩 수량자는 60자 이상의 '////…' 구분선에서 2^n 역추적으로 멈춘다(bns_common.xml 사례).
    # 규칙 11/30 정규식은 선형 시간에 끝나야 하며 구분선 자체는 보존되어야 한다.
    divider = ("/" * 120 + "\n" + "// " + "/" * 90 + " 구분선\n" + "/" * 200 + "\n") * 20
    src = (divider
           + '// //#include("../js/a.js");\n'
           + '//     //----W-Craft WebSquare 변환 확인: include----//\n'
           + 'scwin.a = 1;\n')
    t0 = time.time()
    out, rep = _run(src)
    assert time.time() - t0 < 2.0
    assert rep["rule11"] == 1 and rep["wcraft"] == 1
    assert "scwin.a = 1;" in out
    assert out.count("\n" + "/" * 200 + "\n") == 20   # 구분선 보존
