# -*- coding: utf-8 -*-
"""convert.py 규칙 0(2026-10-07) 단위 테스트 — 주석 처리된 구문은 변환하지 않는다.

실행:
    pytest conversion/tools/test_convert_rule0_comment_guard.py

- `//` 줄 주석·`/* */` 블록 주석 안의 옛 구문(==, var, .value=, comFunc, CreateDialogFrame, eval, scwin.fn_ 호출)은 그대로
- 같은 줄의 코드 부분은 변환된다(마스킹이 문자 단위)
- 문서 주석(JSDoc)의 @name 은 규칙 13 개명을 따라간다(문서는 보호 대상이 아니다)
- W-Craft 검수 마커는 여전히 삭제된다(규칙 30), 멱등
"""
import os
import re
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import convert  # noqa: E402

HEAD = ('<?xml version="1.0" encoding="UTF-8"?>\n<html><head meta_screenId="t" meta_screenName="t" meta_desc="t" meta_author="t">\n'
        '  <xf:model><w2:dataCollection baseNode="map"></w2:dataCollection></xf:model>\n'
        '  <w2:publicInfo method="scwin.onpageload,scwin.fn_doIt"></w2:publicInfo>\n  <script type="text/javascript"><![CDATA[\n')
TAIL = ']]></script>\n</head>\n<body ev:onpageload="scwin.onpageload">\n<xf:input id="ipt_a"/>\n</body>\n</html>\n'
SRC = '''
scwin.screenId = "t";

///////// 1. 변수 및 선언 영역 /////////

// var oldA = x == 1;  옛 구문(주석) — 바꾸지 않는다
// ipt_a.value = "x"; comFunc.alert_error("m"); eval("1+1"); scwin.fn_doIt();
/* var oldB = y != 2;
   CreateDialogFrame("p", "x.xml", "t", 10, 10, 100, 100, "window"); */
//----W-Craft 변환 확인(alert_error)----//

///////// 2. 초기화 영역 /////////

/**
 * @method
 * @name onpageload
 * @description x
 * @returns {void}
 * @hidden N
 */
scwin.onpageload = function () {
    var real = 1;                       // var live = 2;  주석 쪽 var 는 그대로
    if (real == 1) { /* if (a == b) */ scwin.fn_doIt(); }
};

/**
 * @method
 * @name fn_doIt
 * @description y
 * @returns {void}
 * @hidden N
 */
scwin.fn_doIt = function () {
    comFunc.alert_error("live");
};
'''


def _script(xml):
    return re.search(r'<!\[CDATA\[(.*?)\]\]>', xml, re.S).group(1)


def test_commented_statements_untouched_but_code_converted():
    out, rep = convert.convert(HEAD + SRC + TAIL, "t.xml", keep_nullish=True)
    s = _script(out)
    # 주석 안은 그대로
    assert '// var oldA = x == 1;' in s
    assert '// ipt_a.value = "x"; comFunc.alert_error("m"); eval("1+1"); scwin.fn_doIt();' in s
    assert '/* var oldB = y != 2;\n   CreateDialogFrame("p", "x.xml", "t", 10, 10, 100, 100, "window"); */' in s
    assert '// var live = 2;' in s and '/* if (a == b) */' in s
    # 같은 줄·같은 블록의 코드는 변환
    assert 'let real = 1;' in s or 'const real = 1;' in s
    assert 'if (real === 1)' in s
    # 규칙 13 개명은 코드·JSDoc·publicInfo 에 적용되고 주석 안 호출은 그대로
    assert 'scwin.doIt = function' in s and 'scwin.doIt();' in s   # JSDoc @name 은 컨벤션 단계(screen_convention)가 맞춘다
    assert 'scwin.fn_doIt();' in s.split("///////// 2.")[0]            # 1구역의 주석 줄
    assert 'method="scwin.onpageload,scwin.doIt"' in out
    # W-Craft 마커는 여전히 삭제
    assert 'W-Craft' not in s
    # 멱등
    out2, _ = convert.convert(out, "t.xml", keep_nullish=True)
    assert out2 == out


def test_mask_roundtrip_and_protection_scope():
    code = 'a == 1; // x == 2\n/* y != 3 */ b != 4; /** doc == */ c == 5; ///////// 1. 변수 및 선언 영역 /////////\n//----W-Craft m----//\n'
    masked, store = convert.mask_comments(code)
    assert len(store) == 2 and '/*@CMT0@*/' in masked and '/*@CMT1@*/' in masked
    assert '/** doc == */' in masked and '///////// 1.' in masked and 'W-Craft' in masked   # 문서·헤더·마커는 보호 안 함
    assert convert.restore_comments(masked, store) == code
