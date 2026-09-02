# -*- coding: utf-8 -*-
"""convert.convert() 전체 파이프라인 멱등성 회귀 테스트.

2026-08-21 4개 모듈 --force 재변환에서 드러난 두 결함의 재발 방지:
1. 규칙4 gform_onload→onpageload 병합으로 이동한 await 가 1회차에 async 를 못 받던 순서 결함
   (mark_async_functions 를 규칙4 이후 재호출로 해소)
2. 규칙 2/4 재배치가 남긴 다중 빈 줄이 2회차에야 접히던 공백 수렴 문제
   (collapse_blank_runs 최종 정규화로 해소)

실행: pytest src/conversion/tools/test_convert_idempotency.py
"""
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import convert  # noqa: E402


def _xml(script, body='<w2:button id="btn_search" ev:onclick="scwin.btn_search_onclick"/>'):
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<html xmlns:w2="http://www.inswave.com/websquare" '
        'xmlns:xf="http://www.w3.org/2002/xforms" xmlns:ev="http://www.w3.org/2001/xml-events">\n'
        '<head>\n'
        '<script type="text/javascript"><![CDATA[' + script + ']]></script>\n'
        '</head>\n'
        '<body>\n' + body + '\n</body>\n</html>\n'
    )


def _convert_twice(xml, name="TEST0001.xml"):
    r1, rep1 = convert.convert(xml, name)
    r2, rep2 = convert.convert(r1, name)
    return r1, r2, rep1


def test_idempotent_blank_lines():
    """재배치 잔여 다중 빈 줄이 1회차에 수렴해 2회차와 동일해야 한다."""
    script = '''
// ID 순번
var seq = 1;

// 선택된 DP ID
var selDpId = "";



scwin.onpageload = function () {
    scwin.searchList();
};

scwin.btn_search_onclick = function () {
    scwin.searchList();
};

scwin.searchList = function () {
    console.log("search");
};
'''
    r1, r2, _ = _convert_twice(_xml(script))
    assert r1 == r2
    assert "\n\n\n" not in r1  # 빈 줄 2개 이상 잔존 금지


def test_idempotent_gform_merge_async():
    """gform_onload(await 포함) 병합 시 1회차에 onpageload 가 async 로 전환되어야 한다."""
    script = '''
var vScrenID = "TEST0001";

scwin.onpageload = function () {
    scwin.gform_onload();
};

scwin.gform_onload = function () {
    var opt = { id: "sbm_list" };
    const sbmRtn = await $c.sbm.executeDynamic(opt);
    console.log(sbmRtn);
};

scwin.btn_search_onclick = function () {
    console.log("click");
};
'''
    r1, r2, rep1 = _convert_twice(_xml(script))
    assert r1 == r2
    assert "scwin.onpageload = async function" in r1
    assert rep1["rule4_merge"] == "gform_onload→onpageload"


def test_rule2_anchor_toplevel_only():
    """함수 내부의 vScrenID 대입도 삭제(규칙 1)되고, 선언 블록은 스크립트 최상단에 놓여야 한다
    (함수 몸통 안으로 들어가면 안 된다)."""
    script = '''
scwin.onpageload = function() {
    scwin.vScrenID = "TEST0001";
    scwin.searchList();
};

scwin.skw = "";

scwin.searchList = function () {
    console.log(scwin.skw);
};
'''
    r1, r2, _ = _convert_twice(_xml(script, body='<w2:gridView id="grd_list"/>'))
    assert r1 == r2
    m = __import__("re").search(r"<!\[CDATA\[(.*?)\]\]>", r1, __import__("re").S)
    js = m.group(1)
    # vScrenID 관련 코드는 삭제(규칙 1 — 2026-09-02 변경)
    assert "vScrenID" not in js
    # 선언 블록(1구역 헤더 + skw)이 onpageload 정의보다 앞(최상위)에 있어야 한다
    assert js.index("scwin.skw") < js.index("scwin.onpageload = ")
    assert "1. 변수 및 선언 영역" in js.split("scwin.onpageload")[0]


def test_collapse_blank_runs_protects_strings():
    """collapse_blank_runs 는 문자열/블록주석 내부의 빈 줄은 보존한다."""
    code = 'const t = `a\n\n\n\nb`;\n\n\n\nconst u = 1;\n/**\n *\n *\n */\nconst v = 2;\n'
    out = convert.collapse_blank_runs(code)
    assert "`a\n\n\n\nb`" in out          # 템플릿 리터럴 내부 보존
    assert "const t" in out and "\n\nconst u" in out
    assert out.count("\n\n\n") == 1       # 문자열 내부 것만 남는다
    assert convert.collapse_blank_runs(out) == out  # 멱등
