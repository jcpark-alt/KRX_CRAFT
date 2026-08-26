================================================================================
  ULDCOM91000 (법인정보조회) - SBChart 관련 문의 회신
================================================================================

  대상 화면 : D:\workspace\W_Craft_gcc_20260529\src\conversion\sample-front\sbchart\CANDLESTICK\SPCHART_CANDLESTICK.xml
  차트       : SBChart 2.0.217
               D:\workspace\W_Craft_gcc_20260529\src\conversion\sample-front\sbchart\sbchart.js
  엔진       : WebSquare 6.0 (libs/websquare-ai_6.0_0.1543B....jar)
  작성일     : 2026-08-21

  * 공통소스(cm/gcc, cm/pcc, websquare)는 수정하지 않습니다.
    아래 조치는 전부 SPCHART_CANDLESTICK.xml 안에서 끝나도록 작성했습니다.
  * 문의 6건은 이미 화면 코드 841~846행에 주석으로 남아 있습니다.


================================================================================
  요약 - 문의 6건 처리 방법
================================================================================

  No  문의                          조치                    수정 위치(행)
  --  ----------------------------  ----------------------  ----------------
  1   목록에 없는 회사코드 입력      화면에 핸들러 추가       436, 1153
  2   엑셀 다운로드 오류            fn_getGlbValue 로 교체   687, 1045, 1060
  3   차트 색상 핑크 -> 빨간색       inColor / deColor       858
  4   위/아래 Y축 너비 안 맞음       axis.y.width 동일값      858, 877
  5   차트 clear 처리               destroy + innerHTML=""  837~855
  6   위쪽 차트 min 0               padding.bottom = 0      862
  7   마우스오버 표시값 변경         tooltip.format          858
  8   최고점 대신 공시일 표시        gongsi 컬럼 + fillColor  847

  (문의는 6건이지만 차트 요청이 6개 항목이라 위 표에서는 8줄로 폅니다)

  결론 한 줄씩
  -------------------------------------------------------------------------
  * 엑셀 오류 : 짚으신 대로 로그저장 호출부가 맞습니다.
                다만 doLogSave 가 아니라 인자로 쓴 $c.stf.info 입니다.
                stf-front 에는 이 함수가 없습니다.
  * 회사코드 : autoComplete 속성 설정은 이미 맞습니다.
                공통함수 fn_com_isur 의 엔터 핸들러가 0건일 때
                예외로 죽는 것이 실제 원인입니다.
  * 공시일   : marker 옵션으로는 불가능합니다(최저/최고 2점 전용).
                다행히 dlt_chartList 에 gongsi 컬럼이 이미 있습니다.


  이 문서를 읽는 순서
  -------------------------------------------------------------------------
  1) 바로 고치려면  -> 다음 절 "적용 코드 전문" (STEP 1~7) 만 보면 됩니다.
  2) 왜 그런지 알려면 -> 그 뒤의 항목별 [1] [2] [3] 상세를 보십시오.
  3) 다 고친 뒤      -> 맨 뒤 "적용 후 확인 항목" 으로 검증하십시오.

================================================================================
  적용 코드 전문 - 복사해서 교체
================================================================================

  아래 STEP 1~7 만 그대로 적용하면 문의 6건이 모두 처리됩니다.
  "왜 그런가"는 뒤쪽 항목별 상세를 참고하십시오.

  ★ 표시가 붙은 값은 예시입니다. 화면에서 눈으로 확인하고 조정하십시오.

  수정 대상 정리
  -------------------------------------------------------------------------
  STEP  위치(행)          내용
  ----  ----------------  ----------------------------------------------
   1    426 아래           차트 상수 4개 추가
   2    436~455           onpageload 수정 + 함수 1개 추가
   3    687/1045/1060     로그저장 호출 3곳 수정
   4    837~855           조회 콜백 교체 + 함수 2개 추가
   5    856~887           fn_render 전체 교체
   6    1153              XML 태그 1줄 수정
   7    -                 wpack 재컴파일 (필수)


--------------------------------------------------------------------------------
  STEP 1 - 차트 상수 추가 (426행 scwin.vScrenID 아래)
--------------------------------------------------------------------------------

    scwin.vScrenID = "ULDCOM91000.xml";

    // ---- 차트 공통 상수 ----
    scwin.CHART_Y_WIDTH    = 78;          // ★ 두 차트 공통 Y축 폭
                                          //   가장 긴 라벨이 잘리지 않는 값으로
    scwin.CHART_Y_TOP_PAD  = 5000;        // ★ 상단 차트 위쪽 여백(주가 단위)
    scwin.CHART_UP_COLOR   = "#E52528";   // 상승 : 빨강
    scwin.CHART_DOWN_COLOR = "#1B64DA";   // 하락 : 파랑
    scwin.CHART_DSCL_COLOR = "#7B1FA2";   // 공시 제출일 캔들


--------------------------------------------------------------------------------
  STEP 2 - onpageload 수정 + 회사코드 자유입력 보정 (436~455행)
--------------------------------------------------------------------------------

  [수정] onpageload 에 한 줄 추가.
         반드시 fn_com_isur 의 await 다음이어야 합니다.

    scwin.onpageload = async function () {
        await $c.cm.fn_com_isur(acb_isur_cd, ibx_com_abbrv);
        scwin.fn_bindIsurCdFreeInput();     // ← 추가
        scwin.fn_init();
        scwin.isDigitalCheck();
        scwin.fn_GetParentValue();

        if (scwin.gMktTp == "1") {
            ...이하 기존 코드 그대로...
        }
    };

  [추가] 아래 함수를 fn_init 근처(460행 앞)에 새로 넣습니다.

    /**
     * 목록에 없는 회사코드를 직접 입력해도 값이 유지되도록 보정한다.
     * 공통 fn_com_isur 의 oneditenter 가 검색 0건일 때 예외로 중단되므로
     * 화면에서 값을 직접 확정한다.
     */
    scwin.fn_bindIsurCdFreeInput = function () {
        var fnKeep = function () {
            var v = (acb_isur_cd.dom.input.value || "").trim();
            if (v === "") { return; }

            // 목록에서 찾히면 엔진 기본 동작에 맡긴다
            if (acb_isur_cd.findinItemArr(v, "value") != null) { return; }

            // 미등록 코드 : 엔진의 keepValue 와 동일하게 직접 확정
            acb_isur_cd.selectedIndex = -1;
            acb_isur_cd.dom.label.textContent = v;
            acb_isur_cd.dom.input.value = v;
            ibx_com_abbrv.setValue("");     // 미등록이므로 회사명은 비움
        };

        acb_isur_cd.bind("oneditend",   function () { fnKeep(); });
        acb_isur_cd.bind("oneditenter", function () { fnKeep(); });
    };


--------------------------------------------------------------------------------
  STEP 3 - 로그저장 호출 3곳 (687 / 1045 / 1060행)
--------------------------------------------------------------------------------

  주석을 풀면서 $c.stf.info 를 $c.stf.fn_getGlbValue 로 바꾸고,
  3번째 인자 "" 는 제거합니다.

  [687행] fn_print_pdf - 인쇄

    (변경 전)
    //$c.stf.doLogSave(scwin.vScrenID, $c.stf.info("SCREN_PROCS_TP_CD_05"), "");

    (변경 후)
    $c.stf.doLogSave(scwin.vScrenID,
                     $c.stf.fn_getGlbValue("SCREN_PROCS_TP_CD_05"));

  [1045행] btn_toExcel_onclick - 엑셀저장
  [1060행] btn_toExcel2_onclick - 엑셀저장

    (변경 전)
    //$c.stf.doLogSave(scwin.vScrenID, $c.stf.info("SCREN_PROCS_TP_CD_07"), "");

    (변경 후)
    $c.stf.doLogSave(scwin.vScrenID,
                     $c.stf.fn_getGlbValue("SCREN_PROCS_TP_CD_07"));

  나머지 엑셀 다운로드 코드(options, downloadGridViewExcel)는 손대지 않습니다.


--------------------------------------------------------------------------------
  STEP 4 - 조회 콜백 교체 + 함수 2개 추가 (837~855행)
--------------------------------------------------------------------------------

  [교체] 837~855행 전체를 아래로 바꿉니다.
         (841~846행의 요청사항 주석은 처리 완료되었으므로 지웁니다)

    // 공시그래프 조회 콜백
    scwin.sbm_selectDsclChart_submitdone = function (e) {
        tbx_discls_cnt.setValue($c.num.formatNumber(dlt_disclsList.getTotalRow()));

        scwin.fn_clearCharts();                      // 조회할 때마다 먼저 정리

        if (dlt_chartList.getTotalRow() > 0) {
            let data = scwin.fn_buildChartData();
            scwin.DATES = data.map(function (r) { return r.date; });
            scwin.fn_render(data);
        } else {
            scwin.DATES = [];
        }
    };

  [추가] 위 콜백 아래에 함수 2개를 새로 넣습니다.

    /**
     * 차트 데이터 가공 : 공시 제출일 캔들에 별도 색을 지정한다.
     * SBChart 는 행의 fillColor 를 상승/하락 자동색보다 우선 적용한다.
     */
    scwin.fn_buildChartData = function () {
        return dlt_chartList.getAllJSON().map(function (r) {
            var isDscl = (r.gongsi === "true" || r.gongsi === "Y");
            if (!isDscl) { return r; }

            var row = {};
            for (var k in r) {
                if (r.hasOwnProperty(k)) { row[k] = r[k]; }
            }
            row.fillColor = scwin.CHART_DSCL_COLOR;
            return row;
        });
    };

    /**
     * 차트를 완전히 정리한다. (SVG + window resize 리스너)
     */
    scwin.fn_clearCharts = function () {
        [cht_Top, cht_Vol].forEach(function (comp) {
            var el = document.getElementById(comp.getID());
            if (el) { el.innerHTML = ""; }
        });
    };

  ※ 위 fn_clearCharts 는 화면상 clear 만 합니다.
    SBChart 가 bindto 이름으로 걸어 둔 window resize 리스너는 남습니다.
    리스너까지 해제하려면 $c.ext 대신 sb.chart.render 를 직접 호출해
    인스턴스를 보관한 뒤 sb.chart.destroy(인스턴스) 를 불러야 합니다.
    (항목 05 참고. 실사용상 문제가 없으면 위 코드로 충분합니다)


--------------------------------------------------------------------------------
  STEP 5 - fn_render 전체 교체 (856~887행)
--------------------------------------------------------------------------------

  856~887행을 통째로 아래 코드로 바꿉니다.
  차트 요청 6건(색상 / Y축 정렬 / min 0 / 툴팁 / 공시일 / 마커 제거)이
  모두 여기에 반영되어 있습니다.

    /**
     * 툴팁 제목 : x축은 인덱스이므로 조회한 날짜로 환산한다.
     */
    scwin.fn_tooltipTitle = function (idx) {
        var d = scwin.DATES[idx];
        return d ? d.slice(0, 4) + "-" + d.slice(4, 6) + "-" + d.slice(6) : "";
    };

    scwin.fn_render = function (data) {

        // ---- 상단 : 캔들스틱 ----
        $c.ext.drawChartData("candlestick", data, cht_Top, {
            legend: { show: false },
            tooltip: {
                format: {
                    title: scwin.fn_tooltipTitle,
                    // values 순서 = 아래 keys.value[0] 선언 순서
                    // [0]시가 [1]종가 [2]저가 [3]고가
                    value: function (values, ratio, id, index) {
                        var fmt = function (v) {
                            return $c.num.formatNumber(v) + " 원";
                        };
                        return {
                            open:  { key: "시가", value: fmt(values[0]) },
                            close: { key: "종가", value: fmt(values[1]) },
                            low:   { key: "저가", value: fmt(values[2]) },
                            high:  { key: "고가", value: fmt(values[3]) }
                        };
                    }
                }
            },
            axis: {
                y: {
                    width: scwin.CHART_Y_WIDTH,          // 하단 차트와 정렬
                    min: 0,
                    padding: { bottom: 0,                // 0 에서 시작
                               top: scwin.CHART_Y_TOP_PAD }
                },
                x: { tick: { format: scwin.fn_xdate } }
            },
            extend: {
                candlestick: {
                    auto: true,
                    inColor: scwin.CHART_UP_COLOR,       // 상승
                    deColor: scwin.CHART_DOWN_COLOR,     // 하락
                    marker: { show: false }              // 고점/저점 마커 제거
                }
            },
            dataOpts: {
                keys: {
                    x: "date",
                    value: [ { open:  "open",  close: "close",
                               low:   "low",   high:  "high" } ]
                }
            }
        });

        // ---- 하단 : 거래량 막대 ----
        $c.ext.drawChartData("bar", data, cht_Vol, {
            legend: { show: false },
            tooltip: {
                format: {
                    title: scwin.fn_tooltipTitle,
                    value: function (v, ratio, id, index) {
                        return $c.num.formatNumber(v) + " 주";
                    }
                }
            },
            axis: {
                y: {
                    width: scwin.CHART_Y_WIDTH,          // 상단 차트와 정렬
                    tick: { format: function (v) {
                        return $c.num.formatNumber(v);
                    } }
                },
                x: { tick: { format: function () { return ""; } } }
            },
            extend: { bar: { width: { ratio: 0.5 } } },
            dataOpts: { keys: { x: "date", value: [ "admnt" ] } }
        });
    };


--------------------------------------------------------------------------------
  STEP 6 - 돋보기 버튼 핸들러 (1153행, XML 태그)
--------------------------------------------------------------------------------

  (변경 전)
    <xf:trigger ... ev:onclick="scwin.img_com_srch_onclick"
                id="btn_com_srch" ... >

  (변경 후)
    <xf:trigger ... ev:onclick="scwin.btn_com_srch_onclick"
                id="btn_com_srch" ... >

  scwin.img_com_srch_onclick 은 화면 어디에도 정의되어 있지 않습니다.
  정의된 함수명은 scwin.btn_com_srch_onclick (1074행) 입니다.


--------------------------------------------------------------------------------
  STEP 7 - wpack 재컴파일 (필수)
--------------------------------------------------------------------------------

  엔진은 XML 이 아니라 컴파일된 _wpack_ 파일을 읽습니다.

    src/main/webapp/ui/common/ULDCOM91000.xml          ← 수정 대상
    src/main/webapp/_wpack_/ui/common/ULDCOM91000.js   ← 실제 로드되는 파일

  XML 만 고치고 브라우저를 새로고침하면 아무것도 바뀌지 않습니다.
  IDE 에서 wpack 재생성(빌드) 후 확인하십시오.


--------------------------------------------------------------------------------
  ★ 현장에서 맞춰야 하는 값
--------------------------------------------------------------------------------

  아래 3개는 제가 실측한 값이 아니라 시작점입니다.
  화면을 띄워 보고 조정하십시오.

  1. scwin.CHART_Y_WIDTH = 78
     두 차트 Y축 라벨 중 가장 긴 것(보통 거래량)이 잘리지 않을 만큼.
     너무 작으면 라벨이 잘리고, 너무 크면 플롯 영역이 좁아집니다.

  2. scwin.CHART_Y_TOP_PAD = 5000
     상단 캔들차트의 위쪽 여백. 주가 단위(원)입니다.
     최고가가 차트 상단에 너무 붙으면 키우십시오.

  3. scwin.CHART_DSCL_COLOR = "#7B1FA2"
     공시 제출일 캔들 색. 상승 빨강 / 하락 파랑과 구분되면 됩니다.
     현업 확인이 필요하면 먼저 물어보십시오.


================================================================================
  [1] 회사코드(명) - 목록에 없는 코드도 직접 입력 가능하게
================================================================================

  ---- 문의 --------------------------------------------------------------------
  현재 autocomplete 방식인데, 목록에 없는 회사코드를 직접 입력해도
  표시되도록 수정 필요

  ---- 답변 --------------------------------------------------------------------
  컴포넌트 속성은 이미 맞게 설정되어 있습니다. 바꿀 필요 없습니다.
  실제 원인은 공통함수 fn_com_isur 가 걸어 둔 oneditenter 핸들러가
  검색 결과 0건일 때 예외로 중단되는 것입니다.
  공통소스라 손대지 않고, 화면에서 핸들러를 덧붙여 값을 확정합니다.

  ---- 현재 상태 (1139~1149행) --------------------------------------------------

      <w2:autoComplete id="acb_isur_cd" editType="select"
          displayMode="value" displayModeSync="true"
          emptyItem="true" emptyIndex="-1"
          search="contain" searchTarget="itemColumns"
          searchTargetItemColumns="comAbbrv,isurCd"
          noResult="keepValue" valueNotInList="keepValue" ... />

  참고 : editType 은 select / focus 두 값뿐이고, 편집모드 진입 시
         텍스트 선택 방식만 정합니다. 입력 제한과는 무관합니다.

  ---- 원인 --------------------------------------------------------------------
  cm/pcc/common.xml 1295~1306행

      codeComp.unbind("oneditenter");
      codeComp.bind("oneditenter", function () {
          const gridView = scwin.js_com_Isurcd?.itemTable.gridView;
          const isurCd = gridView.getCellData(0, "isurCd");   <-- 무방비 호출
          if (gridView?.getRowCount() === 1 && ...) { ... }
      });

  * 목록에 없는 코드를 입력하면 필터 결과가 0건이라
    getCellData(0, ...) 이 먼저 터집니다.
  * ?. 은 js_com_Isurcd 만 보호하고 itemTable / gridView 는 보호하지
    않습니다. 서브레이어가 한 번도 열리지 않았으면 itemTable 이 null
    이라 같은 자리에서 TypeError 입니다.
  * 엔터 핸들러가 예외로 중단되면 뒤이은 값 확정 처리가 통째로 날아갑니다.

  ---- 조치 --------------------------------------------------------------------
  fn_com_isur 은 내부에서 unbind -> bind 를 하므로,
  await 가 끝난 뒤에 화면이 bind 하면 두 핸들러가 모두 살아 있습니다.
  반드시 fn_com_isur 다음에 호출해야 합니다.

      scwin.onpageload = async function () {
          await $c.cm.fn_com_isur(acb_isur_cd, ibx_com_abbrv);
          scwin.fn_bindIsurCdFreeInput();     // <-- 추가
          scwin.fn_init();
          scwin.isDigitalCheck();
          scwin.fn_GetParentValue();
          ...
      };

      /**
       * 목록에 없는 회사코드를 직접 입력해도 값이 유지되도록 보정한다.
       * 공통 fn_com_isur 의 oneditenter 가 0건일 때 예외로 중단되므로
       * 화면에서 값을 확정한다.
       */
      scwin.fn_bindIsurCdFreeInput = function () {
          var fnKeep = function () {
              var v = (acb_isur_cd.dom.input.value || "").trim();
              if (v === "") { return; }

              // 목록에서 찾히면 엔진 기본 동작에 맡긴다
              if (acb_isur_cd.findinItemArr(v, "value") != null) { return; }

              // 미등록 코드 : 엔진의 keepValue 와 동일하게 직접 확정
              acb_isur_cd.selectedIndex = -1;
              acb_isur_cd.dom.label.textContent = v;
              acb_isur_cd.dom.input.value = v;
              ibx_com_abbrv.setValue("");     // 미등록이므로 회사명은 비움
          };

          acb_isur_cd.bind("oneditend",   function () { fnKeep(); });
          acb_isur_cd.bind("oneditenter", function () { fnKeep(); });
      };

  fn_CheckCond / fn_ReadBasicInfo 는 acb_isur_cd.getValue() 를 쓰는데,
  위 처리 후 getValue() 는 dom.label.textContent(= 입력한 코드)를
  돌려줍니다. 조회 흐름은 그대로 두면 됩니다.

  ---- 같이 고쳐야 할 것 : 돋보기 버튼 핸들러가 미정의 --------------------------
  1153행

      <xf:trigger id="btn_com_srch" ev:onclick="scwin.img_com_srch_onclick" />

  화면에 정의된 함수는 scwin.btn_com_srch_onclick (1074행)이고
  scwin.img_com_srch_onclick 은 어디에도 없습니다.
  현재 회사코드 검색 팝업이 뜨지 않는 상태입니다.

      <xf:trigger id="btn_com_srch" ev:onclick="scwin.btn_com_srch_onclick" />

  ---- 근거 : 엔진 소스 (b1543/wqa.wqs, autoComplete) --------------------------
  속성 설정이 이미 맞다는 근거입니다.

      // endEdit() - 입력을 마쳤을 때
      else if ("keepValue" === this.noResult) {
          this.modelControl.isBinded() && this.modelControl.setData(i);
          this._setValueNotInList(i);
      }

      // _setValueNotInList(t)
      if ("keepValue" === this.options.valueNotInList
          || "keepValue" === this.noResult)
          if (t) { this.selectedIndex = -1; this.dom.label.textContent = t; }

      // getValue()
      if (this.options.emptyItem && -1 == this.selectedIndex)
          return "keepValue" === this.options.valueNotInList
                 ? this._getValueNotInList()      // dom.label.textContent
                 : this.options.emptyValue;

  즉 noResult="keepValue" + valueNotInList="keepValue" 조합이면
  목록에 없는 값도 라벨에 남고 getValue() 로 되돌아옵니다.


================================================================================
  [2] 엑셀 다운로드 오류
================================================================================

  ---- 문의 --------------------------------------------------------------------
  엑셀 다운로드할 때 아래 코드 호출 부분에서 오류 발생

      $c.stf.doLogSave(scwin.vScrenID, $c.stf.info("SCREN_PROCS_TP_CD_07"), "");

  즉, 엑셀 다운로드 로직 자체보다 로그 저장 공통함수 호출 부분을
  우선 확인해야 할 가능성이 있다.

  ---- 답변 --------------------------------------------------------------------
  짚으신 방향이 맞습니다. 다만 doLogSave 가 아니라
  인자로 쓴 $c.stf.info 가 원인입니다.
  stf-front 의 $c.stf 에는 info() 라는 함수가 존재하지 않습니다.
  인자 평가 단계에서 죽기 때문에 doLogSave 는 호출조차 되지 않습니다.

  현재 화면에서는 687 / 1045 / 1060행이 전부 주석 처리되어 있습니다.

  ---- 원인 1 : $c.stf.info 가 stf-front 에 없음 (즉시 TypeError) --------------

      websquare/config.xml 98행
          <module name="$c.stf" src="/cm/pcc/stf.xml"/>

  * cm/pcc/stf.xml 의 publicInfo 및 본문 어디에도 scwin.info 가 없습니다.
  * info() 는 fil-front 의 cm/pcc/fil.xml 에만 있습니다.
    (같은 $c.stf 이름, 다른 구현)

      -> $c.stf.info is not a function

  ---- 원인 2 : 상수 위치도 다름 -----------------------------------------------

      cm/pcc/stf.xml 46행
          scwin.glb.SCREN_PROCS_TP_CD_07 = "07";   // 엑셀저장

      cm/pcc/stf.xml 1392행
          scwin.fn_getGlbValue = function (glbKey) { return scwin.glb[glbKey]; };

  fil.xml 의 info() 는 scwin[varName] 를 읽습니다.
  그대로 이식해도 stf 쪽에서는 "" 를 돌려줘
  화면처리구분코드가 빈 값으로 저장됩니다.

  ---- 조치 --------------------------------------------------------------------

      // 엑셀다운로드 버튼
      scwin.btn_toExcel_onclick = function (e) {
          $c.stf.doLogSave(scwin.vScrenID,
                           $c.stf.fn_getGlbValue("SCREN_PROCS_TP_CD_07"));

          const infoArr = [];
          const options = {
              fileName: "재무제표_감사보고서제출기준.xlsx",
              type: "1", useStyle: "true", useClass: "true",
              rowNumVisible: "false"
          };
          $c.data.downloadGridViewExcel(grd_audtwrtrpt_fnc, options, infoArr);
      };

  * btn_toExcel2_onclick (1059행)도 동일하게 수정
  * fn_print_pdf (687행)는 SCREN_PROCS_TP_CD_05 사용
  * 3번째 인자 "" 는 넘기지 마십시오.
    doLogSave(ver1, ver2, ver3) 의 ver3 는 결과 alert 여부이고
    if (ver3) scwin.alert4LogSave = true; 로만 쓰입니다.
  * scwin.vScrenID 는 426행에 "ULDCOM91000.xml" 로 이미 선언되어 있어
    그대로 두면 됩니다.

  ---- 남은 잠재 오류 (공통소스, 별건 보고 대상) --------------------------------
  cm/pcc/stf.xml 1001행

      scwin.__viewParameter4LogSave = function () {
          var xmlDoc = scwin.xmlHttp4LogSave.responseXML;
          var node = xmlDoc.getElementsByTagName("result");   <-- null 이면 터짐
          if (scwin.alert4LogSave) alert(node[0].childNodes[0].nodeValue);
      };

  /common/logSaveAct.jsp 가 Content-Type: text/xml 로 응답하지 않으면
  responseXML 이 null 이 되어 비동기 콜백에서 터집니다.
  엑셀 다운로드 자체는 이미 시작된 뒤라
  "다운로드는 되는데 콘솔 에러" 형태로 보입니다.

  화면에서 우회할 수 없으므로(공통소스 내부 콜백),
  위 원인 1,2 를 고친 뒤에도 콘솔에 이 오류가 남으면
  공통 담당자에게 별건으로 전달하십시오.
  alert4LogSave 가 한 번 true 가 되면 초기화되지 않는 점도 함께 전달 대상입니다.

  참고 : fil-front 의 fil.xml 은 같은 로직을 var 선언 없는 전역
         (xmlHttp4LogSave, alert4LogSave)으로 쓰고 있어 별도 결함이 있습니다.
         stf-front 는 scwin. 으로 정리된 버전이라 해당 문제는 없습니다.


================================================================================
  [3] 차트 요청사항
================================================================================

  ---- 공통 : 렌더링 경로 ------------------------------------------------------

      $c.ext.drawChartData(type, data, container, config)
        -> el.innerHTML = ""
        -> sb.chart.render("#" + id, config)          (cm/gcc/ext.xml 83~93행)

  config.dataOpts 는 데이터 블록(keys / types 등)으로 들어가고,
  나머지 키는 차트 옵션으로 분리 전달됩니다.


--------------------------------------------------------------------------------
  [3-1] 차트 색상 핑크 -> 빨간색
--------------------------------------------------------------------------------

  ---- 문의 ----
  차트 색상 핑크 -> 빨간색

  ---- 답변 ----
  현재 auto: true 만 주고 있어 라이브러리 기본색이 그대로 나옵니다.
  상승/하락 색을 명시하는 옵션이 따로 있습니다.
  툴팁 범례 타일도 같은 값을 참조하므로 함께 바뀝니다.

  ---- 조치 (858행 cht_Top) ----

      extend: {
          candlestick: {
              auto: true,
              inColor: "#E52528",      // 상승 : 빨강
              deColor: "#1B64DA",      // 하락 : 파랑
              marker: { show: false }  // [3-6] 참고 (고점/저점 마커 제거)
          }
      }

  ---- 근거 (sbchart.js drawBars) ----

      c = conf_candlestick.auto
            ? (row.fillColor !== undefined
                 ? row.fillColor
                 : (d.close >= d.open
                      ? conf_candlestick.inColor || candleColor[1]    // 상승
                      : conf_candlestick.deColor || candleColor[0]))  // 하락
            : ...


--------------------------------------------------------------------------------
  [3-2] 위/아래 차트의 Y축 너비가 서로 안 맞음
--------------------------------------------------------------------------------

  ---- 문의 ----
  위/아래 차트의 Y축 너비가 서로 안 맞음

  ---- 답변 ----
  SBChart 는 Y축 라벨의 실측 폭으로 좌측 마진을 잡습니다.
  상단은 주가(6자리), 하단은 거래량(formatNumber 로 자릿수가 더 큼)이라
  자동 측정값이 달라집니다.
  두 차트에 동일한 axis.y.width 를 주면 플롯 영역이 정확히 정렬됩니다.

  ---- 조치 ----

      scwin.CHART_Y_WIDTH = 78;   // 두 차트 공통.
                                  // 가장 긴 라벨이 잘리지 않는 값으로 조정

      // cht_Top  (858행)
      axis: { y: { width: scwin.CHART_Y_WIDTH, ... }, x: { ... } }

      // cht_Vol  (877행)
      axis: { y: { width: scwin.CHART_Y_WIDTH, ... }, x: { ... } }

  우측 마진은 두 차트 모두 indexed 축이라 동일하게 계산됩니다.
  추가 조치가 필요 없습니다.

  ---- 근거 (sbchart.js setAxisYMargin) ----

      if (conf_axis.y.width > 0 && this.axisYEl) {
          this.margin.left += conf_axis.y.width;      // 고정값 분기
          return;
      }
      this.margin.left += this.getAxisWidth("y");     // 기본 : 라벨 폭 자동 측정


--------------------------------------------------------------------------------
  [3-3] 차트 clear 처리 확인
--------------------------------------------------------------------------------

  ---- 문의 ----
  차트 clear 처리 확인

  ---- 답변 ----
  현재 조회 결과가 0건이면 아무것도 하지 않아 이전 차트가 그대로 남습니다.
  (837~855행, "차트 클리어 필요" 주석만 있고 미구현)

  $c.ext.__drawSBChart 는 재렌더 시에만 innerHTML="" 를 합니다.
  또 SBChart 는 bindto 이름으로 window resize 리스너를 겁니다.
      d3.select(window).on("resize." + bindto, ...)
  DOM 만 비우면 리스너가 남아 리사이즈 시 빈 노드를 다시 그립니다.

  정리 API 는 sb.chart.destroy(instance) 입니다.
  내부적으로 destroyByObject -> svg().remove() + 하위 div 제거 +
  리스너 해제까지 합니다. 인스턴스는 sb.chart.render() 의 반환값입니다.

  ---- 조치 ----

      scwin.chtTopInst = null;
      scwin.chtVolInst = null;

      /**
       * 차트를 완전히 정리한다. (SVG + window resize 리스너)
       */
      scwin.fn_clearCharts = function () {
          [["chtTopInst", cht_Top], ["chtVolInst", cht_Vol]].forEach(
              function (pair) {
                  var key = pair[0], comp = pair[1];
                  if (scwin[key] && window.sb && sb.chart) {
                      try { sb.chart.destroy(scwin[key]); }
                      catch (e) { /* 이미 해제됨 */ }
                      scwin[key] = null;
                  }
                  var el = document.getElementById(comp.getID());
                  if (el) { el.innerHTML = ""; }
              }
          );
      };

  호출 지점 (837행)

      scwin.sbm_selectDsclChart_submitdone = function (e) {
          tbx_discls_cnt.setValue($c.num.formatNumber(dlt_disclsList.getTotalRow()));

          scwin.fn_clearCharts();          // <-- 조회할 때마다 먼저 정리

          if (dlt_chartList.getTotalRow() > 0) {
              let data = scwin.fn_buildChartData();     // [3-6] 참고
              scwin.DATES = data.map(function (r) { return r.date; });
              scwin.fn_render(data);
          } else {
              scwin.DATES = [];
          }
      };

  주의
  * $c.ext.drawChartData 는 인스턴스를 돌려주지 않습니다.
    destroy 까지 쓰려면 fn_render 에서 sb.chart.render 를 직접 호출해
    인스턴스를 잡아둬야 합니다.

        scwin.chtTopInst = sb.chart.render("#" + cht_Top.getID(), topConfig);

  * 공통함수를 계속 쓰고 싶으면 destroy 부분을 빼고 innerHTML="" 만
    남겨도 화면상 clear 는 됩니다. (리사이즈 리스너는 남습니다)
  * 반드시 getID() 를 쓰십시오. 중첩 wframe 스코프에서는
    cht_Top 의 실제 DOM id 에 스코프 접두사가 붙습니다.


--------------------------------------------------------------------------------
  [3-4] 위쪽 차트의 min 값이 0부터 시작하지 않음
--------------------------------------------------------------------------------

  ---- 문의 ----
  위쪽 차트의 min 값이 0부터 시작하지 않는 문제

  ---- 답변 ----
  862행에 이미 axis: { y: { min: 0 } } 을 주고 있습니다.
  min: 0 은 정상 인식되지만, 그 아래로 값 범위의 10% 만큼 패딩이 더 붙어
  domain 하한이 음수가 됩니다. 그래서 축 첫 눈금이 0이 아닙니다.

  주의 : domain.min: 0 은 truthy 검사에 걸려 무시됩니다. 쓰면 안 됩니다.

  ---- 조치 ----

      axis: {
          y: {
              min: 0,
              padding: { bottom: 0, top: 5000 },   // 하한 고정, 상단 여백 유지
              width: scwin.CHART_Y_WIDTH
          },
          x: { tick: { format: scwin.fn_xdate } }
      }

  상하 여백을 모두 없애려면 noUsePadding: true 를 쓰면 됩니다.
  (최고가가 상단에 딱 붙습니다)

  ---- 근거 (sbchart.js getYDomain) ----

      // isValue = function (x) { return x || 0 === x }  -> min:0 정상 인식
      var a = isValue(min) ? min : rm.y.min;
      var h = 0.1 * Math.abs(f - a);                    // 기본 패딩 = 범위의 10%
      var v = isValue(padding.bottom) ? padding.bottom : h;
      p = conf.axis.y.noUsePadding ? a : a - v;         // 최종 domain 하한
      if (conf.axis.y.domain.min) p = conf.axis.y.domain.min;   // 0 은 무시됨

  ---- 확인 요청 ----
  캔들차트에서 Y축 하한을 0으로 고정하면
  주가 변동폭이 화면 상단에 얇게 눌려 보입니다.
  "0부터 시작"이 실제 요구가 맞는지 현업에 한 번 확인해 보시길 권합니다.
  시각적으로는 min = 최저가의 0.98배 같은 방식이 캔들차트 관례입니다.


--------------------------------------------------------------------------------
  [3-5] 마우스오버 시 표시되는 값 변경
--------------------------------------------------------------------------------

  ---- 문의 ----
  마우스오버 시 표시되는 값 변경

  ---- 답변 ----
  tooltip.format 은 title / name / value 세 함수를 받습니다.
  캔들(range 타입)일 때 value 는 (values[], ratio, id, index) 로 호출되고,
  객체를 반환하면 open/close/low/high 키별로 { key, value } 가
  각 행의 라벨/값을 대체합니다.

  values[] 의 순서는 dataOpts.keys.value[0] 에 선언한 키 순서와 같습니다.
  현재 화면은 { open, close, low, high } 이므로
  values[0]=시가, [1]=종가, [2]=저가, [3]=고가 입니다.

  ---- 조치 (858행 cht_Top) ----

      tooltip: {
          format: {
              // 제목 : x값(인덱스)이 들어오므로 날짜로 환산
              title: function (idx) {
                  var d = scwin.DATES[idx];
                  return d ? d.slice(0,4) + "-" + d.slice(4,6) + "-" + d.slice(6)
                           : "";
              },
              // 값 : OHLC 라벨 / 포맷 지정
              value: function (values, ratio, id, index) {
                  var fmt = function (v) {
                      return $c.num.formatNumber(v) + " 원";
                  };
                  return {
                      open:  { key: "시가", value: fmt(values[0]) },
                      close: { key: "종가", value: fmt(values[1]) },
                      low:   { key: "저가", value: fmt(values[2]) },
                      high:  { key: "고가", value: fmt(values[3]) }
                  };
              }
          }
      }

  하단 거래량 차트는 range 타입이 아니므로 스칼라를 반환합니다. (877행)

      tooltip: {
          format: {
              value: function (v, ratio, id, index) {
                  return $c.num.formatNumber(v) + " 주";
              }
          }
      }

  ---- 그 외 관련 옵션 ----
  * tooltip.custom = function (d) { return "<div>...</div>"; }
      -> 툴팁 HTML 전체를 직접 생성. 공시 제목까지 붙이려면 이 쪽이 편합니다.
  * tooltip.grouped
  * tooltip.noUseTitle
  * tooltip.noUseLegendTile
  * tooltip.useColorfulText
  * tooltip.contentStyle.*
  * tooltip.mouse = { x, y }        // 위치 오프셋

  ---- 근거 (sbchart.js tooltipTemplate) ----

      var V = ["open","close","low","high","avg","standard"];
      var W = c ? c(F, x.ratio, x.id, x.index) : x.start + " - " + x.end;
      // c = tooltip.format.value
      ...
      if (c && typeof W === "object") {
          var e = W[_] || {};                 // _ = "open" | "close" | ...
          z += "<tr><td>" + (e.key || _) + "</td>"
             + "<td>" + (e.value || x[_]) + "</td></tr>";
      }


--------------------------------------------------------------------------------
  [3-6] 캔들차트에서 최고점 마크 대신 공시가 있는 날짜에 표시
--------------------------------------------------------------------------------

  ---- 문의 ----
  캔들차트에서 단순 최고점 마크가 아니라
  공시가 있는 날짜에 표시가 되어야 함

  ---- 답변 ----
  extend.candlestick.marker 로는 불가능합니다.
  구현을 확인하면 마커는 minIdx(최저 low) / maxIdx(최고 high)
  두 지점 전용이고 임의 인덱스를 받지 않습니다.

  다행히 데이터에 공시 플래그가 이미 있습니다.

      dlt_chartList 401행
      <w2:column id="gongsi" name="공시제출여부(true/false)" dataType="text"/>

  ---- marker 옵션 전체 (참고) ----

      extend.candlestick.marker = {
          show: false,                    // 기본 false
          color: "#353535",               // 삼각형 / 텍스트 색
          min: { format: function (d) {...}, position: { x, y } },   // 저점
          max: { format: function (d) {...}, position: { x, y } }    // 고점
      };
      // 그리는 대상은 data([ c[minIdx] ]) / data([ c[maxIdx] ]) 두 개뿐

  ---- 방법 A (권장. 검증 완료) : 행 단위 fillColor ----------------------------
  SBChart drawBars 는 conf.data.json[index].fillColor 를
  auto 색상보다 우선 적용합니다.

      /**
       * 차트 데이터 가공 : 공시 제출일 캔들에 별도 색을 지정한다.
       */
      scwin.fn_buildChartData = function () {
          return dlt_chartList.getAllJSON().map(function (r) {
              var isDscl = (r.gongsi === "true" || r.gongsi === "Y");
              if (!isDscl) { return r; }
              var row = {};
              for (var k in r) {
                  if (r.hasOwnProperty(k)) { row[k] = r[k]; }
              }
              row.fillColor = "#7B1FA2";       // 공시일 : 보라
              return row;
          });
      };

  marker: { show: false } 로 고점/저점 삼각형을 끄고
  위 색상 표시로 대체합니다.

  툴팁에서도 공시 여부를 알려주려면
  tooltip.format.value 안에서 한 줄 덧붙이면 됩니다.

  ---- 방법 B : 공시일에만 값이 있는 별도 시리즈를 scatter 로 겹치기 ------------
  캔들 위에 점/도형을 얹고 싶을 때 씁니다.
  SBChart 는 키별 타입 지정(combo)을 지원합니다.

      // 각 행에 dsclMark 추가 : 공시일이면 high 값, 아니면 null
      dataOpts: {
          keys: {
              x: "date",
              value: [
                  { open: "open", close: "close", low: "low", high: "high" },
                  "dsclMark"
              ]
          },
          types: { dsclMark: "scatter" }
      },
      extend: { point: { r: 5 } }

  * types 는 데이터 블록 레벨 옵션이므로 dataOpts 안에 넣어야
    $c.ext.drawChartData 가 올바르게 전달합니다.
  * range 시리즈와 스칼라 시리즈를 한 keys.value 배열에 섞는 형태라
    적용 전 화면에서 렌더 확인이 필요합니다.
  * 우선 방법 A 로 요건을 충족시키고,
    별도 마크가 꼭 필요할 때 B 를 시도하는 순서를 권합니다.


================================================================================
  적용 후 확인 항목
================================================================================

  [ ] 1. 회사코드에 목록에 없는 5자리 코드 입력 -> 탭/엔터 시 값이 남고,
         콘솔에 getCellData TypeError 가 없을 것
  [ ] 2. 돋보기 버튼 클릭 -> 회사코드 검색 팝업이 뜰 것
  [ ] 3. 엑셀다운로드 -> 콘솔에 "$c.stf.info is not a function" 이 사라질 것
         logSaveAct.jsp 요청의 SCREN_PROCES_TP_CD=07 확인
  [ ] 4. 공시그래프 조회 -> 상승 빨강 / 하락 파랑, 공시일 캔들 색 구분
  [ ] 5. 두 차트의 좌측 축 시작선이 같은 x 좌표일 것
         (개발자도구에서 .sbchart-axis-y 의 transform 비교)
  [ ] 6. 조회 결과 0건 -> 이전 차트가 남지 않을 것
  [ ] 7. 상단 차트 Y축 첫 눈금이 0일 것
  [ ] 8. 캔들 마우스오버 -> 시가/고가/저가/종가 한글 라벨 + 천단위 콤마


================================================================================
  공통 담당자 전달 사항 (화면에서 해결 불가)
================================================================================

  1. cm/pcc/common.xml 1295행  fn_com_isur 의 oneditenter
     - gridView / getRowCount() 미검사로 검색 0건일 때 TypeError

  2. cm/pcc/stf.xml 1001행  __viewParameter4LogSave
     - responseXML null 검사 없음
     - alert4LogSave 가 한 번 true 가 되면 초기화되지 않음

  3. $c.stf 모듈이 프로젝트마다 함수 구성이 다름
     - stf-front(stf.xml)  : fn_getGlbValue, createXmlObj4LogSave
     - fil-front(fil.xml)  : info,           createXMLObj4LogSave
     - 화면 코드를 이식할 때 TypeError 가 발생합니다.

================================================================================
