# -*- coding: utf-8 -*-
"""convert.py 규칙 23(setVisibleRowNum("all") → $c.util.setGridVisibleRowNum) 단위 테스트.

실행:
    pytest src/conversion/tools/test_convert_rule23.py

- 엔진 gridView.setVisibleRowNum 은 숫자 전용이라 "all" 인자가 조용히 거부되므로,
  gcc 공통함수 $c.util.setGridVisibleRowNum(grid, "all") 로 치환한다(수신 객체 첫 인자 승격).
- "all" 리터럴만 대상(숫자/변수 무변환), 리터럴 보호, 호출 체인 수신 보류·리포트, 멱등성을 검증한다.
"""
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import convert  # noqa: E402


def _run(code):
    report = {"rule23": [], "judgment": []}
    out = convert.rule23_grid_visible_rownum_all(code, report)
    return out, report


def test_basic_substitution():
    out, rep = _run('grd_main.setVisibleRowNum("all");')
    assert out == '$c.util.setGridVisibleRowNum(grd_main, "all");'
    assert len(rep["rule23"]) == 1


def test_single_quote_and_chain_receiver_identifier():
    out, rep = _run("scwin.grdObj.setVisibleRowNum('all');")
    assert out == '$c.util.setGridVisibleRowNum(scwin.grdObj, "all");'
    assert len(rep["rule23"]) == 1


def test_numeric_and_variable_args_untouched():
    src = "grd_main.setVisibleRowNum(20);\ngrd_main.setVisibleRowNum(cnt);"
    out, rep = _run(src)
    assert out == src
    assert rep["rule23"] == []
    assert rep["judgment"] == []


def test_literal_protection():
    src = '// grd_main.setVisibleRowNum("all");\nconst s = \'grd.setVisibleRowNum("all")\';'
    out, rep = _run(src)
    assert out == src
    assert rep["rule23"] == []


def test_call_chain_receiver_reported_not_converted():
    src = '$p.getComponentById("grd_main").setVisibleRowNum("all");'
    out, rep = _run(src)
    assert out == src  # 호출 체인 수신은 미변환
    assert rep["rule23"] == []
    assert len(rep["judgment"]) == 1
    assert "규칙23" in rep["judgment"][0]


def test_idempotent():
    once, _ = _run('grd_main.setVisibleRowNum("all");')
    twice, rep = _run(once)
    assert twice == once
    assert rep["rule23"] == []
    assert rep["judgment"] == []  # 변환 결과는 leftover 로도 잡히지 않음
