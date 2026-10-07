# -*- coding: utf-8 -*-
"""screen_scorecard.py(P1, 2026-10-07) 단위 테스트 — 편차 계수·가중 점수·주석 제외.

실행:
    pytest conversion/tools/test_screen_scorecard.py
"""
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import screen_scorecard as sc  # noqa: E402


def test_measure_counts_and_weights(tmp_path):
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<html><head meta_screenId="t">\n  <w2:publicInfo method="scwin.onpageload"/>\n'
           '  <script type="text/javascript"><![CDATA[\n'
           'scwin.screenId = "t";\n'
           '// TODO Stage2: 컨텍스트 키 출처 미확인 — a\n'
           '// TODO Stage2(규칙 19): jQuery — 힌트\n'
           '// $("#x").val(); eval("1"); 주석 안은 세지 않는다\n'
           '/**\n * @method\n * @name onpageload\n * @hidden N\n */\n'
           'scwin.onpageload = function () {\n    try { $("#a").val(); document.body.x = 1; } catch (_ex) { }\n};\n'
           'scwin.btn_a_onclick = function () {\n    const fm = (document.frm || { elements: [] });\n    fm.action = "/a.do"; eval("x"); setTimeout(f, 1); location.href = "y";\n'
           '    el.innerHTML = ""; console.log(1); if (v == null) {} $c.util.getComponent("a");\n};\n'
           'scwin.fn_old = function () {\n    alert("x");\n};\n'
           ']]></script>\n</head>\n<body>\n<!-- TODO Stage2(퍼블리싱 병합): x -->\n<xf:input id="a"/>\n</body>\n</html>\n')
    f = tmp_path / "JLDTST00001.xml"
    f.write_text(xml, encoding="utf-8")
    m = sc.measure(str(f))
    # raw_dom 2 = document.body + document.frm(폼 DOM 도 원시 DOM 으로 센다)
    assert m["jquery"] == 1 and m["form_dom"] == 1 and m["raw_dom"] == 2 and m["eval"] == 1 and m["timer"] == 1 and m["location"] == 1 and m["innerHTML"] == 1
    assert m["console"] == 1 and m["native_alert"] == 1 and m["fn_def"] == 1 and m["handler_notry"] == 1   # btn_a_onclick 에 try 없음(onpageload 는 있음)
    assert m["no_jsdoc"] == 2 and m["funcs"] == 3 and m["long_fn"] == 0
    assert m["todo_vendor"] == 1 and m["todo_rule19"] == 1 and m["todo_merge"] == 1
    assert m["nullish"] == 1 and m["getcomp"] == 1
    expected = 3 * 8 + 1 * (1 + 1 + 1 + 1 + 2) + 2 * 3
    assert m["score"] == expected
    assert sc.group_of("JLDTST00001") == "jldtst"
