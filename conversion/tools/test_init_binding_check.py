# -*- coding: utf-8 -*-
"""init_binding_check(달력·조회 Enter 키 init 바인딩 게이트 — 규칙 22·37) 단위 테스트.

실행:
    pytest conversion/tools/test_init_binding_check.py
"""
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _HERE)

import init_binding_check as ib  # noqa: E402

DOC = ('<?xml version="1.0" encoding="UTF-8"?>\n<html xmlns="http://www.w3.org/1999/xhtml"'
       ' xmlns:ev="http://www.w3.org/2001/xml-events"'
       ' xmlns:w2="http://www.inswave.com/websquare" xmlns:xf="http://www.w3.org/2002/xforms">\n'
       '<head><script type="text/javascript"><![CDATA[\n{script}\n]]></script></head>\n'
       '<body ev:onpageload="scwin.onpageload"><xf:group class="sub_contents" id="">{body}</xf:group></body></html>\n')

ONLOAD = 'scwin.onpageload = async function () {\n    await scwin.init();\n};\n'

SINGLE = '<w2:inputCalendar calendarValueType="yearMonthDate" id="cal_applDd" />'
PERIOD = ('<xf:group class="flex flex_no" id="">'
          '<w2:inputCalendar calendarValueType="yearMonthDate" id="cal_start1" />'
          '<w2:span label="~" />'
          '<w2:inputCalendar calendarValueType="yearMonthDate" id="cal_end1" />'
          '</xf:group>')
SCHBOX = ('<xf:group class="schbox" id=""><xf:group class="schbox_inner" id="">'
          '<xf:group class="w2tb tbl" id="tbl_search" tagname="table"><xf:input id="ipt_nm" /></xf:group>'
          '</xf:group><xf:group class="btn_schbox" id="">'
          '<xf:trigger class="btn_cm sch" ev:onclick="scwin.btn_search_onclick" id="btn_search" type="button" />'
          '</xf:group></xf:group>')


def _run(tmp_path, body, init_body, extra=""):
    script = ONLOAD + "scwin.init = async function () {\n" + init_body + "\n};\n" + extra
    p = tmp_path / "ULDTST00001.xml"
    p.write_text(DOC.replace("{script}", script).replace("{body}", body), encoding="utf-8")
    fails, warns, infos = ib.check(str(p))
    return [c for c, _m in fails], [c for c, _m in warns], [c for c, _m in infos], fails


def test_single_calendar_requires_check_calendar_format(tmp_path):
    f, _w, _i, _ = _run(tmp_path, SINGLE, "")
    assert f == ["B01"]
    f, w, _i, _ = _run(tmp_path, SINGLE, '    $c.date.checkCalendarFormat(cal_applDd, "yyyyMMdd");')
    assert f == [] and w == []


def test_string_id_form_is_accepted(tmp_path):
    f, _w, _i, _ = _run(tmp_path, SINGLE, '    $c.date.checkCalendarFormat("cal_applDd", "yyyyMMdd");')
    assert f == []


def test_period_pair_in_same_flex_requires_compare(tmp_path):
    f, _w, _i, _ = _run(tmp_path, PERIOD, "")
    assert f == ["B02"]
    f, _w, _i, _ = _run(tmp_path, PERIOD, '    $c.date.compareFromToDate(cal_start1, cal_end1, ["시작", "종료"]);')
    assert f == []


def test_period_pair_reversed_order_fails(tmp_path):
    f, _w, _i, fails = _run(tmp_path, PERIOD, '    $c.date.compareFromToDate(cal_end1, cal_start1);')
    assert f == ["B02"] and "순서" in fails[0][1]


def test_period_pair_with_single_check_conflicts(tmp_path):
    init = ('    $c.date.compareFromToDate(cal_start1, cal_end1);\n'
            '    $c.date.checkCalendarFormat(cal_start1, "yyyyMMdd");')
    f, _w, _i, _ = _run(tmp_path, PERIOD, init)
    assert f == ["B04"]


def test_period_pair_by_id_tokens_across_rows(tmp_path):
    body = ('<xf:group tagname="tr"><w2:inputCalendar id="edt_ChgStatDd" /></xf:group>'
            '<xf:group tagname="tr"><w2:inputCalendar id="edt_ChgEndDd" /></xf:group>'
            '<xf:group tagname="tr"><w2:inputCalendar id="ica_FST_BZYY_STRT_DD" /></xf:group>'
            '<xf:group tagname="tr"><w2:inputCalendar id="ica_FST_BZYY_END_DD" /></xf:group>')
    f, _w, _i, fails = _run(tmp_path, body, "")
    assert f == ["B02", "B02"]
    assert "edt_ChgStatDd ~ edt_ChgEndDd" in fails[0][1]
    assert "ica_FST_BZYY_STRT_DD ~ ica_FST_BZYY_END_DD" in fails[1][1]


def test_token_inside_word_is_not_a_pair(tmp_path):
    # "Total"·"Story" 의 To/Str 은 토큰 경계가 아니다 → 단일 달력 2개
    body = ('<xf:group tagname="tr"><w2:inputCalendar id="cal_totalDd" /></xf:group>'
            '<xf:group tagname="tr"><w2:inputCalendar id="cal_storyDd" /></xf:group>')
    f, _w, _i, _ = _run(tmp_path, body, "")
    assert f == ["B01", "B01"]


def test_search_area_requires_enter_key_with_button_handler(tmp_path):
    f, _w, _i, _ = _run(tmp_path, SCHBOX, "")
    assert f == ["B03"]
    f, w, _i, _ = _run(tmp_path, SCHBOX, "    $c.win.setEnterKeyEvent(tbl_search, scwin.btn_search_onclick);")
    assert f == [] and w == []
    f, w, _i, _ = _run(tmp_path, SCHBOX, "    $c.win.setEnterKeyEvent(tbl_search, scwin.btn_Search_onclick);")
    assert f == [] and w == ["B05"]


def test_search_area_without_id_asks_for_id(tmp_path):
    body = SCHBOX.replace('id="tbl_search"', 'id=""')
    f, _w, _i, fails = _run(tmp_path, body, "")
    assert f == ["B03"] and "id" in fails[0][1]


def test_search_area_without_button_is_not_target(tmp_path):
    body = '<xf:group class="schbox" id="grp_search"><xf:input id="ipt_nm" /></xf:group>'
    f, _w, _i, _ = _run(tmp_path, body, "")
    assert f == []


def test_binding_in_function_called_from_init_counts(tmp_path):
    extra = 'scwin.setUi = function () {\n    $c.date.checkCalendarFormat(cal_applDd, "yyyyMMdd");\n};\n'
    f, w, _i, _ = _run(tmp_path, SINGLE, "    scwin.setUi();", extra)
    assert f == [] and w == []


def test_binding_outside_init_warns(tmp_path):
    extra = 'scwin.btn_x_onclick = function () {\n    $c.date.checkCalendarFormat(cal_applDd, "yyyyMMdd");\n};\n'
    f, w, _i, _ = _run(tmp_path, SINGLE, "", extra)
    assert f == [] and w == ["B06"]


def test_commented_binding_does_not_count(tmp_path):
    f, _w, _i, _ = _run(tmp_path, SINGLE, '    // $c.date.checkCalendarFormat(cal_applDd, "yyyyMMdd");')
    assert f == ["B01"]


def test_markup_onviewchange_warns(tmp_path):
    body = SINGLE.replace("/>", 'ev:onviewchange="scwin.cal_applDd_onviewchange" />')
    _f, w, _i, _ = _run(tmp_path, body, '    $c.date.checkCalendarFormat(cal_applDd, "yyyyMMdd");')
    assert w == ["B07"]


def test_non_date_calendar_is_info_only(tmp_path):
    body = '<w2:inputCalendar calendarValueType="yearMonthDateTimeSec" id="cal_regDtm" />'
    f, _w, i, _ = _run(tmp_path, body, "")
    assert f == [] and i == ["B08"]
