# -*- coding: utf-8 -*-
"""convert.py 라이브러리 프로파일(--profile lib) 단위 테스트 — cm/pcc 업무공통 파일용 규칙 화이트리스트.

실행:
    pytest conversion/tools/test_convert_profile_lib.py

- 적용: ==→===(단, == null/undefined 관용구 보존), var→const/let, getTotalRow→getRowCount, eval 제거, W-Craft 주석 삭제
- 미적용: vScrenID 파라미터 치환(규칙 1), 섹션 헤더·함수 재배치(2/4), DOM .value/.src 대입 변환(5b/5c),
  서브미션 전환·async 부여(6/12/16), 진입점 try/catch(26), JSDoc ` */` 컬럼 0 이동(format_script), CDATA 선두 개행 보존
- publicInfo 불변, 멱등, CLI 인자 파싱
"""
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import convert  # noqa: E402

_HEAD = ('<?xml version="1.0" encoding="UTF-8"?>\n'
         '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:w2="http://www.inswave.com/websquare" '
         'xmlns:xf="http://www.w3.org/2002/xforms" xmlns:ev="http://www.w3.org/2001/xml-events">\n'
         '<head meta_screenId="$c.tst" meta_screenName="테스트 공통">\n'
         '<w2:type>COMMON</w2:type>\n<xf:model>\n</xf:model>\n'
         '<w2:publicInfo method="scwin.zeta,scwin.alpha,scwin.insComboSet"/>\n'
         '\t\t<script type="text/javascript" lazy="false"><![CDATA[')
_TAIL = ']]></script>\n</head>\n<body>\n</body>\n</html>\n'

_SCRIPT = '''
/* ★Wcraft guide★
스크립트 수작업 유의사항
*/
scwin.gCount = 0;

/**
 * @method
 * @name zeta
 * @description 뒤에 정의된 함수(재배치 대상 아님을 검증)
 */
scwin.zeta = function (obj) {
    if (obj == null) { return; }
    if (obj.value == undefined) { return; }
    var n = eval(obj.cnt) + 1;
    var total = dlt.getTotalRow();
    if (n == 3) { obj.dom.input.value = ""; }
    btn_x.src = "../img/a.gif";
    return total;
};

/**
 * @method
 * @name insComboSet
 * @description vScrenID 는 화면ID 파라미터 — 파일명으로 치환되면 안 된다
 */
scwin.insComboSet = function (dtsObj, vScrenID, cdId) {
    var url = "/CodeAction.do?SCREN_ID=" + vScrenID + "&CD_ID=" + cdId;
    dtsObj.DataID = encodeURI(url);
    dtsObj.reset();
};

/**
 * @method
 * @name alpha
 */
scwin.alpha = function () {
    //----W-Craft WebSquare 변환 확인: reset----//
    if (scwin.gCount != 0) { return true; }
    return false;
};
'''


def _lib(script=_SCRIPT, name="tst.xml"):
    return convert.convert(_HEAD + script + _TAIL, name, profile="lib")


def test_whitelisted_rules_apply():
    out, rep = _lib()
    assert "if (n === 3)" in out and "scwin.gCount !== 0" in out          # 5a
    assert "Number(obj.cnt) + 1" in out and "eval(" not in out             # 31
    assert "dlt.getRowCount()" in out                                      # 5d
    assert "const n = Number(obj.cnt) + 1" in out and "const total = " in out   # 8 (재할당 없음 → const)
    assert "Wcraft" not in out and "W-Craft" not in out                    # 30
    assert rep["profile"] == "lib" and rep["rule5a"] >= 2 and len(rep["rule31"]) == 1


def test_nullish_comparisons_are_preserved_and_reported():
    out, rep = _lib()
    assert "obj == null" in out and "obj.value == undefined" in out
    assert "=== null" not in out and "=== undefined" not in out
    assert rep["rule5a_nullish_kept"] == 2


def test_screen_only_rules_do_not_apply():
    out, rep = _lib()
    assert "vScrenID" in out and 'SCREN_ID=" + vScrenID' in out           # 규칙 1 미적용(파라미터 보존)
    assert "///////// " not in out                                         # 규칙 2/4 섹션 헤더 없음
    assert 'obj.dom.input.value = ""' in out                              # 5b 미적용
    assert 'btn_x.src = "../img/a.gif"' in out                            # 5c 미적용
    assert "executeDynamic" not in out and "async" not in out              # 12/16/async 미적용
    assert "dtsObj.DataID = encodeURI(url)" in out
    assert "handleError" not in out                                        # 26 미적용
    # 함수 정의 순서 보존(zeta → insComboSet → alpha), JSDoc ` */` 들여쓰기 보존
    assert out.index("scwin.zeta = function") < out.index("scwin.insComboSet = function") < out.index("scwin.alpha = function")
    assert "\n */\n" in out and "\n*/\n" not in out.replace("\n */\n", "")
    # CDATA 선두 개행 보존
    assert "<![CDATA[\n" in out


def test_public_info_and_head_untouched():
    out, _ = _lib()
    assert '<w2:publicInfo method="scwin.zeta,scwin.alpha,scwin.insComboSet"/>' in out
    assert out.startswith(_HEAD.split("\t\t<script")[0])


def test_idempotent():
    once, _ = _lib()
    twice, rep2 = convert.convert(once, "tst.xml", profile="lib")
    assert once == twice
    assert rep2["rule5a"] == 0 and rep2["rule31"] == [] and rep2["rule8"] == {"const": 0, "let": 0}


def test_screen_profile_default_unchanged():
    # 기본 profile 은 화면용 — 같은 입력에서 규칙 1/4 가 동작한다(회귀 방지)
    out, rep = convert.convert(_HEAD + _SCRIPT + _TAIL, "ULDTST00001.xml")
    assert rep["profile"] == "screen"
    assert "///////// " in out


def test_unknown_profile_rejected():
    try:
        convert.convert(_HEAD + _SCRIPT + _TAIL, "tst.xml", profile="mobile")
    except ValueError as e:
        assert "profile" in str(e)
    else:
        raise AssertionError("ValueError expected")


def test_cli_parse():
    assert convert._parse_cli(["a.xml"]) == ("a.xml", None, "screen")
    assert convert._parse_cli(["a.xml", "b.xml", "--profile", "lib"]) == ("a.xml", "b.xml", "lib")
    assert convert._parse_cli(["--profile=lib", "a.xml", "a.xml"]) == ("a.xml", "a.xml", "lib")
    for bad in (["a.xml", "--profile"], ["a.xml", "--profile", "x"], ["--profile", "lib"]):
        try:
            convert._parse_cli(bad)
        except ValueError:
            pass
        else:
            raise AssertionError("ValueError expected for %r" % bad)
