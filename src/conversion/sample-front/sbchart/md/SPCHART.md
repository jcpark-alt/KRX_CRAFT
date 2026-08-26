# SBChart 문의 회신 — ULDCOM91000 (법인정보조회, 캔들스틱)

| 항목 | 내용 |
|------|------|
| 대상 화면 | `src/conversion/sample-front/sbchart/CANDLESTICK/SPCHART_CANDLESTICK.xml` (원 문의 화면: ULDCOM91000) |
| 차트 | SBChart 2.0.217 (`sbchart/sbchart.js`) |
| 엔진 | WebSquare 6.0 (libs/websquare-ai_6.0_0.1543B….jar) |
| 작성일 | 2026-08-21 (2026-08-26 Markdown 정리·샘플 반영 이력 추가) |

> - 공통소스(cm/gcc, cm/pcc, websquare)는 수정하지 않는다 — 모든 조치는 화면 XML 안에서 끝나도록 작성했다.
> - 본문 행 번호는 **원본 업무 화면(ULDCOM91000, 1000줄+) 기준**이다. 80줄 내외의 샘플에는 차트 항목만 해당한다.
> - 문의는 6건이나 차트 요청이 6개 항목이라 요약 표는 8줄로 폈다.

## 1. 요약 — 문의 처리 방법

| No | 문의 | 조치 | 수정 위치(행) |
|----|------|------|--------------|
| 1 | 목록에 없는 회사코드 입력 | 화면에 핸들러 추가 | 436, 1153 |
| 2 | 엑셀 다운로드 오류 | `fn_getGlbValue` 로 교체 | 687, 1045, 1060 |
| 3 | 차트 색상 핑크 → 빨간색 | `inColor` / `deColor` | 858 |
| 4 | 위/아래 Y축 너비 안 맞음 | `axis.y.width` 동일값 | 858, 877 |
| 5 | 차트 clear 처리 | destroy + `innerHTML=""` | 837~855 |
| 6 | 위쪽 차트 min 0 | `padding.bottom = 0` | 862 |
| 7 | 마우스오버 표시값 변경 | `tooltip.format` | 858 |
| 8 | 최고점 대신 공시일 표시 | `gongsi` 컬럼 + `fillColor` | 847 |

**결론 한 줄씩**
- 엑셀 오류: 짚으신 대로 로그저장 호출부가 맞다. 다만 `doLogSave` 가 아니라 인자로 쓴 `$c.stf.info` 가 원인 — stf-front 에 이 함수가 없다.
- 회사코드: autoComplete 속성 설정은 이미 맞다. 공통함수 `fn_com_isur` 의 엔터 핸들러가 검색 0건일 때 예외로 죽는 것이 실제 원인.
- 공시일: `marker` 옵션으로는 불가(최저/최고 2점 전용). `dlt_chartList` 에 `gongsi` 컬럼이 이미 있어 행 `fillColor` 로 해결.

## 2. 적용 절차 (STEP 1~7)

바로 고치려면 이 절만 적용하면 된다. 근거는 [3. 항목별 상세](#3-항목별-상세) 참고.
★ 표시 값은 예시 — 화면에서 확인하고 조정할 것.

| STEP | 위치(행) | 내용 |
|------|----------|------|
| 1 | 426 아래 | 차트 상수 추가 |
| 2 | 436~455 | onpageload 수정 + 회사코드 자유입력 보정 함수 추가 |
| 3 | 687 / 1045 / 1060 | 로그저장 호출 3곳 수정 |
| 4 | 837~855 | 조회 콜백 교체 + 함수 2개 추가 |
| 5 | 856~887 | fn_render 전체 교체 |
| 6 | 1153 | XML 태그 1줄 수정 (돋보기 핸들러) |
| 7 | - | wpack 재컴파일 (필수) |

### STEP 1 — 차트 상수 추가 (426행 `scwin.vScrenID` 아래)

```javascript
scwin.vScrenID = "ULDCOM91000.xml";

// ---- 차트 공통 상수 ----
scwin.CHART_Y_WIDTH    = 78;          // ★ 두 차트 공통 Y축 폭 — 가장 긴 라벨이 잘리지 않는 값으로
scwin.CHART_Y_TOP_PAD  = 5000;        // ★ 상단 차트 위쪽 여백(주가 단위)
scwin.CHART_UP_COLOR   = "#E52528";   // 상승 : 빨강
scwin.CHART_DOWN_COLOR = "#1B64DA";   // 하락 : 파랑
scwin.CHART_DSCL_COLOR = "#7B1FA2";   // 공시 제출일 캔들
```

### STEP 2 — onpageload 수정 + 회사코드 자유입력 보정 (436~455행)

onpageload 에 한 줄 추가 — **반드시 `fn_com_isur` 의 await 다음**이어야 한다(내부에서 unbind→bind 하므로).

```javascript
scwin.onpageload = async function () {
    await $c.cm.fn_com_isur(acb_isur_cd, ibx_com_abbrv);
    scwin.fn_bindIsurCdFreeInput();     // ← 추가
    scwin.fn_init();
    scwin.isDigitalCheck();
    scwin.fn_GetParentValue();
    // ...이하 기존 코드 그대로...
};

/**
 * 목록에 없는 회사코드를 직접 입력해도 값이 유지되도록 보정한다.
 * 공통 fn_com_isur 의 oneditenter 가 검색 0건일 때 예외로 중단되므로 화면에서 값을 직접 확정한다.
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
```

### STEP 3 — 로그저장 호출 3곳 (687 / 1045 / 1060행)

주석을 풀면서 `$c.stf.info` → `$c.stf.fn_getGlbValue` 로 바꾸고 3번째 인자 `""` 는 제거한다.

```javascript
// [687행] fn_print_pdf — 인쇄
$c.stf.doLogSave(scwin.vScrenID, $c.stf.fn_getGlbValue("SCREN_PROCS_TP_CD_05"));

// [1045행] btn_toExcel_onclick / [1060행] btn_toExcel2_onclick — 엑셀저장
$c.stf.doLogSave(scwin.vScrenID, $c.stf.fn_getGlbValue("SCREN_PROCS_TP_CD_07"));
```

나머지 엑셀 다운로드 코드(options, `downloadGridViewExcel`)는 손대지 않는다.

### STEP 4 — 조회 콜백 교체 + 함수 2개 추가 (837~855행)

841~846행의 요청사항 주석은 처리 완료됐으므로 지운다.

```javascript
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
 * 차트를 정리한다. (화면상 clear — resize 리스너 관련 한계는 [3-3] 참고)
 */
scwin.fn_clearCharts = function () {
    [cht_Top, cht_Vol].forEach(function (comp) {
        var el = document.getElementById(comp.getID());
        if (el) { el.innerHTML = ""; }
    });
};
```

### STEP 5 — fn_render 전체 교체 (856~887행)

차트 요청 6건(색상 / Y축 정렬 / min 0 / 툴팁 / 공시일 / 마커 제거)이 모두 반영된 코드.

```javascript
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
                // values 순서 = 아래 keys.value[0] 선언 순서 — [0]시가 [1]종가 [2]저가 [3]고가
                value: function (values, ratio, id, index) {
                    var fmt = function (v) { return $c.num.formatNumber(v) + " 원"; };
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
                value: [ { open: "open", close: "close", low: "low", high: "high" } ]
            }
        }
    });

    // ---- 하단 : 거래량 막대 ----
    $c.ext.drawChartData("bar", data, cht_Vol, {
        legend: { show: false },
        tooltip: {
            format: {
                title: scwin.fn_tooltipTitle,
                value: function (v, ratio, id, index) { return $c.num.formatNumber(v) + " 주"; }
            }
        },
        axis: {
            y: {
                width: scwin.CHART_Y_WIDTH,          // 상단 차트와 정렬
                tick: { format: function (v) { return $c.num.formatNumber(v); } }
            },
            x: { tick: { format: function () { return ""; } } }
        },
        extend: { bar: { width: { ratio: 0.5 } } },
        dataOpts: { keys: { x: "date", value: [ "admnt" ] } }
    });
};
```

### STEP 6 — 돋보기 버튼 핸들러 (1153행, XML 태그)

`scwin.img_com_srch_onclick` 은 화면 어디에도 정의되어 있지 않다(현재 검색 팝업이 뜨지 않음). 정의된 함수명은 `scwin.btn_com_srch_onclick` (1074행).

```xml
<!-- 변경 전 --> <xf:trigger ... ev:onclick="scwin.img_com_srch_onclick" id="btn_com_srch" ... >
<!-- 변경 후 --> <xf:trigger ... ev:onclick="scwin.btn_com_srch_onclick" id="btn_com_srch" ... >
```

### STEP 7 — wpack 재컴파일 (필수)

엔진은 XML 이 아니라 컴파일된 `_wpack_` 파일을 읽는다. XML 만 고치고 새로고침하면 아무것도 바뀌지 않는다.

```
src/main/webapp/ui/common/ULDCOM91000.xml          ← 수정 대상
src/main/webapp/_wpack_/ui/common/ULDCOM91000.js   ← 실제 로드되는 파일
```

### ★ 현장에서 맞춰야 하는 값 (실측 아님 — 시작점)

1. `CHART_Y_WIDTH = 78` — 두 차트 Y축 라벨 중 가장 긴 것(보통 거래량)이 잘리지 않을 만큼. 작으면 라벨 잘림, 크면 플롯 영역 축소.
2. `CHART_Y_TOP_PAD = 5000` — 상단 캔들차트 위쪽 여백(원 단위). 최고가가 상단에 붙으면 키울 것.
3. `CHART_DSCL_COLOR = "#7B1FA2"` — 공시 제출일 캔들 색. 상승 빨강/하락 파랑과 구분되면 됨(현업 확인 권장).

## 3. 항목별 상세

### [1] 회사코드(명) — 목록에 없는 코드도 직접 입력 가능하게

- **문의**: autocomplete 방식인데 목록에 없는 회사코드를 직접 입력해도 표시되도록 수정 필요.
- **답변**: 컴포넌트 속성은 이미 맞다(`noResult="keepValue"` + `valueNotInList="keepValue"` 조합이면 목록에 없는 값도 라벨에 남고 `getValue()` 로 돌아옴 — 엔진 `endEdit`/`_setValueNotInList`/`getValue` 소스로 확인. `editType` 은 select/focus 두 값뿐으로 편집모드 진입 시 텍스트 선택 방식만 정하며 입력 제한과 무관). 실제 원인은 공통 `fn_com_isur` 의 oneditenter 핸들러(cm/pcc/common.xml 1295~1306행).

```javascript
codeComp.bind("oneditenter", function () {
    const gridView = scwin.js_com_Isurcd?.itemTable.gridView;
    const isurCd = gridView.getCellData(0, "isurCd");   // ← 무방비 호출
    ...
});
```

- 목록에 없는 코드 입력 → 필터 결과 0건 → `getCellData(0, ...)` 에서 예외. `?.` 는 `js_com_Isurcd` 만 보호하고 `itemTable`/`gridView` 는 보호하지 않는다(서브레이어 미오픈 시 `itemTable` null 로 같은 자리 TypeError). 엔터 핸들러가 예외로 중단되면 뒤이은 값 확정 처리가 통째로 날아간다.
- **조치**: STEP 2 — `fn_com_isur` 은 내부에서 unbind→bind 하므로 await 종료 후 화면이 bind 하면 두 핸들러가 모두 살아있다. `fn_CheckCond`/`fn_ReadBasicInfo` 의 `getValue()` 는 보정 후 입력한 코드(`dom.label.textContent`)를 돌려주므로 조회 흐름은 그대로 두면 된다.
- **같이 고칠 것**: STEP 6 돋보기 버튼 미정의 핸들러.

### [2] 엑셀 다운로드 오류

- **문의**: `$c.stf.doLogSave(scwin.vScrenID, $c.stf.info("SCREN_PROCS_TP_CD_07"), "")` 호출부 오류 — 로그 저장 공통함수부터 확인 필요해 보임.
- **답변**: 방향이 맞다. 다만 `doLogSave` 가 아니라 인자 `$c.stf.info` 가 원인 — **인자 평가 단계에서 죽어 doLogSave 는 호출조차 안 된다**. 현재 화면에서는 687/1045/1060행이 전부 주석 처리되어 있다.
  - **원인 1**: websquare/config.xml 98행이 `$c.stf` 를 `cm/pcc/stf.xml` 로 등록하는데, stf.xml 의 publicInfo·본문 어디에도 `info()` 가 없다. `info()` 는 fil-front 의 `cm/pcc/fil.xml` 에만 있다(같은 `$c.stf` 이름, 다른 구현). → `$c.stf.info is not a function`
  - **원인 2**: 상수 위치도 다르다. stf.xml 은 `scwin.glb.SCREN_PROCS_TP_CD_07 = "07"`(46행) + `fn_getGlbValue(glbKey){ return scwin.glb[glbKey]; }`(1392행) 구조. fil 의 `info()` 는 `scwin[varName]` 를 읽으므로 그대로 이식해도 stf 에서는 `""` 를 돌려줘 화면처리구분코드가 빈 값으로 저장된다.
- **조치**: STEP 3. 3번째 인자 `""` 는 넘기지 말 것 — `doLogSave(ver1, ver2, ver3)` 의 ver3 는 결과 alert 여부(`if (ver3) scwin.alert4LogSave = true`)로만 쓰인다. `scwin.vScrenID` 는 이미 선언돼 있어 그대로 둔다.
- **남은 잠재 오류 (공통소스, 별건 보고 대상)**: `cm/pcc/stf.xml` 1001행 `__viewParameter4LogSave` — `/common/logSaveAct.jsp` 가 `Content-Type: text/xml` 로 응답하지 않으면 `responseXML` 이 null 이 되어 비동기 콜백에서 터진다. 엑셀 다운로드는 이미 시작된 뒤라 "다운로드는 되는데 콘솔 에러" 형태로 보인다. 화면에서 우회 불가 — 원인 1·2 수정 후에도 콘솔 오류가 남으면 공통 담당자에게 전달(§5).

### [3] 차트 요청사항

**공통 — 렌더링 경로**: `$c.ext.drawChartData(type, data, container, config)` → `el.innerHTML = ""` → `sb.chart.render("#"+id, config)` (cm/gcc/ext.xml 83~93행). `config.dataOpts` 는 데이터 블록(keys/types 등)으로, 나머지 키는 차트 옵션으로 분리 전달된다.

#### [3-1] 색상 핑크 → 빨간색

`auto: true` 만 주면 라이브러리 기본색이 나온다. `inColor`(상승)/`deColor`(하락)로 명시 — 툴팁 범례 타일도 같은 값을 참조하므로 함께 바뀐다. (STEP 5)

근거 (sbchart.js drawBars):
```javascript
c = conf_candlestick.auto
      ? (row.fillColor !== undefined
           ? row.fillColor
           : (d.close >= d.open
                ? conf_candlestick.inColor || candleColor[1]    // 상승
                : conf_candlestick.deColor || candleColor[0]))  // 하락
      : ...
```

#### [3-2] 위/아래 차트 Y축 너비 정렬

SBChart 는 Y축 라벨의 **실측 폭**으로 좌측 마진을 잡는다. 상단(주가 6자리)과 하단(거래량, formatNumber 로 자릿수가 더 큼)의 자동 측정값이 달라 어긋난다. 두 차트에 동일한 `axis.y.width` 를 주면 플롯 영역이 정확히 정렬된다. 우측 마진은 두 차트 모두 indexed 축이라 동일 — 추가 조치 불필요. (STEP 1·5)

근거 (sbchart.js setAxisYMargin):
```javascript
if (conf_axis.y.width > 0 && this.axisYEl) {
    this.margin.left += conf_axis.y.width;      // 고정값 분기
    return;
}
this.margin.left += this.getAxisWidth("y");     // 기본 : 라벨 폭 자동 측정
```

#### [3-3] 차트 clear 처리

현재 조회 0건이면 아무것도 하지 않아 이전 차트가 남는다("차트 클리어 필요" 주석만 있고 미구현). `$c.ext.__drawSBChart` 는 재렌더 시에만 `innerHTML=""` 를 한다. 또 SBChart 는 bindto 이름으로 `d3.select(window).on("resize."+bindto, ...)` 리스너를 걸어 두므로 **DOM 만 비우면 리사이즈 시 빈 노드를 다시 그린다**.

- 완전 정리 API 는 `sb.chart.destroy(instance)` (svg().remove() + 하위 div 제거 + 리스너 해제). 인스턴스는 `sb.chart.render()` 반환값 — **`$c.ext.drawChartData` 는 인스턴스를 돌려주지 않으므로** destroy 까지 쓰려면 render 를 직접 호출해 인스턴스를 잡아둬야 한다:

```javascript
scwin.chtTopInst = sb.chart.render("#" + cht_Top.getID(), topConfig);
// 정리 시
try { sb.chart.destroy(scwin.chtTopInst); } catch (e) { /* 이미 해제됨 */ }
scwin.chtTopInst = null;
```

- 공통함수를 계속 쓰려면 STEP 4 의 `innerHTML=""` 만으로 화면상 clear 는 된다(리스너는 남음 — 실사용상 문제 없으면 충분).
- 반드시 `comp.getID()` 를 쓸 것 — 중첩 wframe 스코프에서는 실제 DOM id 에 스코프 접두사가 붙는다.

#### [3-4] 위쪽 차트 min 0 시작

`min: 0` 은 정상 인식되지만 **값 범위의 10% 패딩이 아래로 더 붙어** domain 하한이 음수가 된다(그래서 축 첫 눈금이 0이 아님). `padding: { bottom: 0, top: N }` 으로 하한을 고정한다. **`domain.min: 0` 은 truthy 검사에 걸려 무시되므로 쓰면 안 된다.** 상하 여백을 모두 없애려면 `noUsePadding: true`(최고가가 상단에 딱 붙음). (STEP 5)

근거 (sbchart.js getYDomain):
```javascript
// isValue = function (x) { return x || 0 === x }  → min:0 정상 인식
var a = isValue(min) ? min : rm.y.min;
var h = 0.1 * Math.abs(f - a);                    // 기본 패딩 = 범위의 10%
var v = isValue(padding.bottom) ? padding.bottom : h;
p = conf.axis.y.noUsePadding ? a : a - v;         // 최종 domain 하한
if (conf.axis.y.domain.min) p = conf.axis.y.domain.min;   // 0 은 무시됨
```

> **확인 요청**: Y축 하한 0 고정 시 주가 변동폭이 상단에 얇게 눌려 보인다. "0부터 시작"이 실제 요구인지 현업 확인 권장 — 캔들차트 관례는 `min = 최저가 * 0.98` 방식.

#### [3-5] 마우스오버 표시값 변경

`tooltip.format` 은 title/name/value 세 함수를 받는다. 캔들(range 타입)의 `value` 는 `(values[], ratio, id, index)` 로 호출되고, **객체를 반환하면 open/close/low/high 키별 `{ key, value }` 가 각 행의 라벨/값을 대체**한다. `values[]` 순서 = `dataOpts.keys.value[0]` 선언 순서(현재 화면은 [0]시가 [1]종가 [2]저가 [3]고가). 하단 거래량(비 range)은 스칼라 반환. title 은 x값(인덱스)이 들어오므로 날짜 배열로 환산. (STEP 5)

그 외 옵션: `tooltip.custom`(HTML 전체 직접 생성 — 공시 제목까지 붙일 때 편함) · `grouped` · `noUseTitle` · `noUseLegendTile` · `useColorfulText` · `contentStyle.*` · `mouse = { x, y }`(위치 오프셋).

근거 (sbchart.js tooltipTemplate):
```javascript
var V = ["open","close","low","high","avg","standard"];
var W = c ? c(F, x.ratio, x.id, x.index) : x.start + " - " + x.end;   // c = tooltip.format.value
if (c && typeof W === "object") {
    var e = W[_] || {};                 // _ = "open" | "close" | ...
    z += "<tr><td>" + (e.key || _) + "</td><td>" + (e.value || x[_]) + "</td></tr>";
}
```

#### [3-6] 최고점 마크 대신 공시일 표시

`extend.candlestick.marker` 로는 불가 — 마커는 minIdx(최저 low)/maxIdx(최고 high) **2점 전용**이고 임의 인덱스를 받지 않는다(`data([c[minIdx]])` / `data([c[maxIdx]])` 두 개만 그림). 데이터에 공시 플래그가 이미 있다: `dlt_chartList` 401행 `<w2:column id="gongsi" name="공시제출여부(true/false)" dataType="text"/>`

marker 옵션 전체 (참고):
```javascript
extend.candlestick.marker = {
    show: false,                    // 기본 false
    color: "#353535",               // 삼각형 / 텍스트 색
    min: { format: function (d) {...}, position: { x, y } },   // 저점
    max: { format: function (d) {...}, position: { x, y } }    // 고점
};
```

- **방법 A (권장, 검증 완료)** — 행 단위 `fillColor`: drawBars 가 `conf.data.json[index].fillColor` 를 auto 색보다 우선 적용한다. STEP 4 의 `fn_buildChartData` + `marker: { show: false }` 조합. 툴팁에 공시 여부를 표시하려면 `tooltip.format.value` 에 한 줄 추가.
- **방법 B** — 공시일에만 값이 있는 별도 시리즈를 scatter 로 겹치기(캔들 위 점/도형). SBChart 는 키별 타입 지정(combo)을 지원한다:

```javascript
// 각 행에 dsclMark 추가 : 공시일이면 high 값, 아니면 null
dataOpts: {
    keys: {
        x: "date",
        value: [ { open: "open", close: "close", low: "low", high: "high" }, "dsclMark" ]
    },
    types: { dsclMark: "scatter" }   // types 는 데이터 블록 레벨 — dataOpts 안에 넣어야 전달됨
},
extend: { point: { r: 5 } }
```

  range 시리즈와 스칼라 시리즈를 한 배열에 섞는 형태라 적용 전 렌더 확인 필요. **A 로 요건 충족 후 별도 마크가 꼭 필요할 때 B** 를 시도할 것.

## 4. 적용 후 확인 항목

- [ ] 회사코드에 목록에 없는 5자리 코드 입력 → 탭/엔터 시 값이 남고, 콘솔에 getCellData TypeError 없음
- [ ] 돋보기 버튼 클릭 → 회사코드 검색 팝업 표시
- [ ] 엑셀다운로드 → `$c.stf.info is not a function` 소멸, logSaveAct.jsp 요청의 `SCREN_PROCS_TP_CD=07` 확인
- [ ] 공시그래프 조회 → 상승 빨강 / 하락 파랑 / 공시일 캔들 색 구분
- [ ] 두 차트의 좌측 축 시작선이 같은 x 좌표 (개발자도구에서 `.sbchart-axis-y` 의 transform 비교)
- [ ] 조회 결과 0건 → 이전 차트가 남지 않음
- [ ] 상단 차트 Y축 첫 눈금이 0
- [ ] 캔들 마우스오버 → 시가/고가/저가/종가 한글 라벨 + 천단위 콤마

## 5. 공통 담당자 전달 사항 (화면에서 해결 불가)

1. `cm/pcc/common.xml` 1295행 `fn_com_isur` 의 oneditenter — gridView/`getRowCount()` 미검사로 검색 0건 시 TypeError.
2. `cm/pcc/stf.xml` 1001행 `__viewParameter4LogSave` — `responseXML` null 검사 없음, `alert4LogSave` 가 한 번 true 면 초기화 안 됨.
3. `$c.stf` 모듈이 프로젝트마다 함수 구성이 다름 — stf-front(stf.xml): `fn_getGlbValue`/`createXmlObj4LogSave`, fil-front(fil.xml): `info`/`createXMLObj4LogSave`. 화면 코드 이식 시 TypeError 발생.
   (참고: fil.xml 은 같은 로그저장 로직을 var 선언 없는 전역(`xmlHttp4LogSave`, `alert4LogSave`)으로 쓰는 별도 결함이 있고, stf-front 는 `scwin.` 으로 정리된 버전이라 해당 문제 없음)

## 6. 샘플 반영 이력 (sbchart 갤러리)

본 회신의 **차트 옵션 항목**을 샘플 갤러리에 반영한 기록. 화면 전용 항목(회사코드·로그저장·돋보기·wpack·하단 거래량 차트)은 샘플에 대상이 없어 미적용.

| 일자 | 커밋 | 내용 |
|------|------|------|
| 2026-08-26 | `febe1e3` | `SPCHART_CANDLESTICK.xml` 에 차트 요청 6건 반영 — inColor/deColor · y.width · min 0+padding.bottom 0 · OHLC 한글 툴팁 · 마커 제거 · gongsi `fillColor`(`buildChartData`). 데이터 2행에 gongsi 플래그 추가(데모 가시화) |
| 2026-08-26 | `f2768cf` | 샘플 데이터 URL 배포 경로(`/ui/sample/SBChart/...`) 조정 |
| 2026-08-26 | `fca1d08` → `30fe04e` | 회신 원문 보존 → `sbchart/md/SPCHART.md` 이동·개명 |
| 2026-08-26 | (일괄) | sbchart 샘플 전체 컨벤션 정리 — `var`→`const`(54파일), `fn_` 접두 제거(5파일: click/xdate/render), GANTT 미정의 `fn_status` 호출 결함 수정 |

> 샘플 코드 컨벤션: `var` 금지(`const`/`let`), `fn_` 접두 금지. 본문 STEP 코드는 원본 업무 화면(레거시 스타일) 기준이라 `var`/`fn_` 표기를 유지했다 — 업무 화면 적용 시 해당 화면의 컨벤션을 따를 것.
