# -*- coding: utf-8 -*-
"""convert.py 규칙 31(eval 제거 → 일반 코드 전환) 단위 테스트.

실행:
    pytest conversion/tools/test_convert_rule31.py

- 숫자 변환(Number / 연산식 괄호 유지 / 중복 변환 제거), 동적 컴포넌트 참조($p.getComponentById),
  JSON 파싱(JSON.parse), 동적 속성 접근(obj[key]) 의 결정적 치환과
  보류·리포트(문장 단독 실행, 상수 코드 문자열, 코드 조각 결합, DOM 속성 접근), 리터럴 보호, 멱등성을 검증한다.
"""
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import convert  # noqa: E402


def _run(code):
    report = {"rule31": [], "judgment": []}
    out = convert.rule31_remove_eval(code, report)
    return out, report


# ── 숫자 변환 ──────────────────────────────────────────────────────────
def test_identifier_and_member_to_number():
    out, rep = _run("tot_list = eval(tot_list) + eval(dataArr[i].list_amt);")
    assert out == "tot_list = Number(tot_list) + Number(dataArr[i].list_amt);"
    assert len(rep["rule31"]) == 2
    assert rep["judgment"] == []


def test_row_index_argument_to_number():
    out, _ = _run('scwin.gAcptNo = dts_List.getCellData(eval(obj), "ACPT_NO");')
    assert out == 'scwin.gAcptNo = dts_List.getCellData(Number(obj), "ACPT_NO");'


def test_call_argument_to_number():
    out, _ = _run("list_comm_sum_add = list_comm_sum_add + eval(delComma(dataArr[i].list_amt));")
    assert out == "list_comm_sum_add = list_comm_sum_add + Number(delComma(dataArr[i].list_amt));"


def test_arithmetic_expression_keeps_parens_without_number():
    out, _ = _run("const overLen = eval($c.str.getByteLength(obj.value) - size);")
    assert out == "const overLen = ($c.str.getByteLength(obj.value) - size);"


def test_comparison_of_two_evals():
    out, _ = _run("if (eval(a) < eval(b)) { x(); }")
    assert out == "if (Number(a) < Number(b)) { x(); }"


def test_redundant_numeric_wrapper_is_dropped():
    out, _ = _run("t = eval(parseInt(delComma(x))) + eval(Number(y)) + eval(parseFloat(z));")
    assert out == "t = parseInt(delComma(x)) + Number(y) + parseFloat(z);"


def test_partial_numeric_wrapper_is_arithmetic():
    # parseInt(...) + 1 전체가 인자 → 연산식이므로 괄호 유지
    out, _ = _run("t = eval(parseInt(i) + 1);")
    assert out == "t = (parseInt(i) + 1);"


# ── 동적 컴포넌트 참조 ─────────────────────────────────────────────────
def test_string_prefix_concat_to_get_component_by_id():
    out, rep = _run('const txbFileOb = eval("txb_FILE_NM" + fileDiv);')
    assert out == 'const txbFileOb = $p.getComponentById("txb_FILE_NM" + fileDiv);'
    assert "동적 컴포넌트 참조" in rep["rule31"][0]


def test_string_variable_prefix_concat_to_get_component_by_id():
    src = 'const fileDelIcon = "file_delete";\nconst deleteIcon = eval(fileDelIcon + i);'
    out, _ = _run(src)
    assert out == 'const fileDelIcon = "file_delete";\nconst deleteIcon = $p.getComponentById(fileDelIcon + i);'


def test_variable_concat_without_string_assignment_is_arithmetic():
    # 문자열 대입 근거가 없는 변수끼리의 + 는 산술식으로 본다
    out, _ = _run("t = eval(a + b);")
    assert out == "t = (a + b);"


def test_eval_result_member_call_to_get_component_by_id():
    out, _ = _run('eval(sdateVal).setValue("");\neval(ctlId).getValue();')
    assert out == '$p.getComponentById(sdateVal).setValue("");\n$p.getComponentById(ctlId).getValue();'


# ── JSON 파싱 / 동적 속성 접근 ─────────────────────────────────────────
def test_paren_wrapped_json_to_json_parse():
    out, rep = _run('this.json = eval("(" + jsonText + ")");')
    assert out == "this.json = JSON.parse(jsonText);"
    assert "JSON 파싱" in rep["rule31"][0]


def test_property_path_prefix_to_bracket_access():
    out, _ = _run('return eval("this.json." + attr);')
    assert out == "return this.json[attr];"


# ── 보류·리포트 ────────────────────────────────────────────────────────
def test_statement_alone_is_reported_not_converted():
    src = "eval(t.action);"
    out, rep = _run(src)
    assert out == src
    assert rep["rule31"] == []
    assert len(rep["judgment"]) == 1 and "문장 단독" in rep["judgment"][0]


def test_constant_code_string_is_reported():
    src = 'eval("try{ tdu=top.document.location.href }catch(e){}");'
    out, rep = _run(src)
    assert out == src
    assert len(rep["judgment"]) == 1


def test_code_fragment_concat_is_reported():
    src = 'eval("fm.attach_chk" + i + "[0]").focus();'
    out, rep = _run(src)
    assert out == src
    assert len(rep["judgment"]) == 1 and "코드 문자열 실행" in rep["judgment"][0]


def test_regex_literal_build_is_reported():
    src = 'const reg = eval("/^[a-z]{" + s + "," + e + "}$/");'
    out, rep = _run(src)
    assert out == src
    assert len(rep["judgment"]) == 1


def test_dom_member_access_is_reported():
    src = 'eval(spanid).innerHTML = "";'
    out, rep = _run(src)
    assert out == src
    assert len(rep["judgment"]) == 1 and "innerHTML" in rep["judgment"][0]


# ── 리터럴 보호 / 대상 외 / 멱등 ──────────────────────────────────────
def test_literal_and_window_eval_untouched():
    src = '// eval(x)\nconst s = "eval(y)";\nwindow.eval(z);\nobj.eval(w);'
    out, rep = _run(src)
    assert out == src
    assert rep["rule31"] == [] and rep["judgment"] == []


def test_idempotent():
    src = 'a = eval(b) + eval("txb_" + i).getValue() + eval(c - 1);\nthis.j = eval("(" + t + ")");'
    once, rep1 = _run(src)
    twice, rep2 = _run(once)
    assert once == twice
    assert len(rep1["rule31"]) == 4
    assert rep2["rule31"] == [] and rep2["judgment"] == []


def test_full_pipeline_registers_rule31():
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:w2="http://www.inswave.com/websquare" '
        'xmlns:xf="http://www.w3.org/2002/xforms" xmlns:ev="http://www.w3.org/2001/xml-events">\n'
        "<head>\n<xf:model>\n</xf:model>\n"
        '<script type="text/javascript"><![CDATA[\n'
        "scwin.onpageload = function () {\n"
        "    const n = eval(scwin.cnt) + 1;\n"
        "};\n"
        "]]></script>\n</head>\n<body>\n</body>\n</html>\n"
    )
    out, report = convert.convert(xml, "ULDTEST00001.xml")
    assert "Number(scwin.cnt)" in out
    assert "eval(" not in out
    assert len(report["rule31"]) == 1
