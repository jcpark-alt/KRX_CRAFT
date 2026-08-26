# SBChart 자주 쓰는 속성·기능 정의

SBChart 2.0.217 (`sbchart/sbchart.js`, c3/d3 계열) 기준.
본 저장소 샘플 55종의 **실사용 빈도 집계**와 문의 회신([SPCHART.md](SPCHART.md))의 라이브러리 소스 분석을 근거로 정리했다.
각 속성의 실제 사용 예는 `sbchart/<TYPE>/SPCHART_<TYPE>.xml` 샘플 참고.

| 옵션 그룹 | 샘플 사용 빈도 | 용도 |
|-----------|--------------|------|
| `tooltip` | 60회 | 마우스오버 표시값 |
| `color` | 52회 | 시리즈 색상 |
| `extend.<type>` | 43회 | 차트 타입별 전용 옵션 |
| `dataOpts` | 27회 | 데이터 필드 매핑·시리즈 구성 |
| `global` | 15회 | 전역 설정·이벤트 콜백 |
| `axis` | 12회 | 축(범위·눈금·폭) |
| `grid`/`legend`/`title`/`size` | 각 2~4회 | 보조 표시 요소 |

## 1. 렌더링 경로와 기본 골격

```javascript
// 화면 표준 골격 — 데이터/옵션 분리 (JSON 은 순수 데이터, 옵션은 스크립트 보유)
scwin.CHART_TYPE = "line";
scwin.CHART_DATA_URL = "/ui/sample/SBChart/COLUMNS/data/COLUMNS.json";   // 배포 경로 기준
scwin.CHART_CONFIG = { ... };

scwin.onpageload = async function () {
    const res = await $c.sbm.executeDynamic({ id: "sbm_sbchart", action: scwin.CHART_DATA_URL,
        method: "get", mediatype: "application/json", mode: "asynchronous", isProcessMsg: false });
    scwin.clearChart(chartWrap);                    // 재조회 대비 이전 차트 정리 (§10)
    $c.ext.drawChartData(scwin.CHART_TYPE, res.responseJSON, chartWrap, scwin.CHART_CONFIG);
};
```

- **`$c.ext.drawChartData(type, data, comp, config)`** — 타입·데이터·옵션을 조합해 렌더. 내부에서 `el.innerHTML=""` 후 `sb.chart.render("#"+id, config)` 호출 (cm/gcc/ext.xml).
- **`$c.ext.drawSBChart(comp, data, config)`** — 데이터 블록에 `type`/`types` 가 이미 포함된 완성형 config 렌더(복합차트 COMBO·MULTIDONUT 등).
- 컨테이너는 `w2:group` + **`comp.getID()`** — 중첩 wframe 스코프에서는 DOM id 에 스코프 접두사가 붙으므로 id 문자열 하드코딩 금지.
- `config.dataOpts` 는 데이터 블록(keys/types/labels)으로, 나머지 키는 차트 옵션으로 **분리 전달**된다.

## 2. `dataOpts` — 데이터 필드 매핑

| 속성 | 정의 | 예 |
|------|------|-----|
| `keys.x` | x축 필드명 | `"x": "date"` |
| `keys.value` | 시리즈 값 필드 배열. 스칼라는 문자열, **range 계열(candlestick 등)은 객체** | `["trdvolume"]` / `[{ open:"openprc", close:"closeprc", low:"lowprc", high:"highprc" }]` |
| `labels` | 데이터 라벨 표시 | `"labels": true` |
| `types` | **시리즈별 타입 지정(combo)** — 반드시 dataOpts 안에 | `"types": { dsclMark: "scatter" }` |
| `xs` | 시리즈별 x 필드(서로 다른 x축 조합) | COMBO 샘플 |
| `groups` | 스택 그룹 | STACKBAR 샘플 |
| `json` | 데이터 직접 지정(조회 결합 대신) | drawSBChart 형 |

- range 계열의 `keys.value[0]` **객체 키 선언 순서**가 툴팁 `values[]` 순서를 결정한다(§4).

## 3. `axis` — 축

| 속성 | 정의 |
|------|------|
| `x.type` | `"category"` \| `"indexed"` \| `"timeseries"` — 샘플 대부분 category/indexed |
| `x.tick.format` | 눈금 라벨 포맷 함수. **indexed 축은 인덱스가 들어오므로** 날짜 배열로 환산(§10 DATES 패턴) |
| `y.min` / `y.max` | 축 범위. `min: 0` 은 정상 인식되지만 아래 padding 주의 |
| `y.padding` | **기본 패딩 = 값 범위의 10%** 가 상·하한에 추가된다. 0에서 시작하려면 `padding: { bottom: 0 }` 필수 |
| `y.width` | Y축 폭 고정. 미지정 시 **라벨 실측 폭**으로 좌측 마진 자동 계산 — 상하 2단 차트는 동일값으로 플롯 정렬 |
| `y.tick.format` | 값 포맷(예: `$c.num.formatNumber`, 만 단위 환산) |
| `show` / `height` | 축 표시 여부 / 높이 |

> **함정**: `axis.y.domain.min: 0` 은 라이브러리의 truthy 검사(`if (conf.axis.y.domain.min)`)에 걸려 **무시**된다 — `min` + `padding.bottom: 0` 조합을 쓸 것. 상하 여백 전부 제거는 `noUsePadding: true`.

## 4. `tooltip` — 마우스오버 표시값

| 속성 | 정의 |
|------|------|
| `format.title` | 제목 함수 — indexed 축은 **인덱스**가 인자로 오므로 날짜 환산 필요 |
| `format.value` | 값 함수. **스칼라 차트**: `(v, ratio, id, index)` → 문자열 반환. **range 차트**: `(values[], ratio, id, index)` → `{ open:{key,value}, close:{...}, ... }` **객체 반환 시 키별 라벨/값 대체** |
| `format.name` | 시리즈명 대체 |
| `custom` | 툴팁 HTML 전체를 직접 생성 `function (d) { return "<div>...</div>"; }` — 부가 정보(공시 제목 등)까지 붙일 때 |
| `width` | 툴팁 너비 |
| `grouped` | 동일 x 의 시리즈를 한 툴팁에 묶기 |
| 기타 | `noUseTitle` · `noUseLegendTile` · `useColorfulText` · `contentStyle.*` · `mouse:{x,y}`(위치 오프셋) |

```javascript
// 스칼라 차트 표준 — 천단위 콤마
"tooltip": { "format": { "value": function (v) { return $c.num.formatNumber(v); } } }

// 캔들스틱(range) — OHLC 한글 라벨 (values 순서 = keys.value[0] 선언 순서)
tooltip: { format: {
    title: function (idx) { return scwin.DATES[idx] || ""; },
    value: function (values) {
        const fmt = function (v) { return $c.num.formatNumber(v) + " 원"; };
        return { open:  { key: "시가", value: fmt(values[0]) },
                 close: { key: "종가", value: fmt(values[1]) },
                 low:   { key: "저가", value: fmt(values[2]) },
                 high:  { key: "고가", value: fmt(values[3]) } };
    } } }
```

> **함정**: range 계열(candlestick·areaRange·barrange·boxplot)에 스칼라 포맷터를 넣으면 `values[]` 배열이 그대로 문자열화되어 깨진다. 타입 표기 대소문자 주의(`"areaRange"` 카멜).

## 5. 색상

| 방법 | 정의 |
|------|------|
| `color: { pattern: [...] }` | **일반 차트 시리즈 팔레트** — 선언 순서대로 시리즈에 배정 |
| `extend.candlestick.inColor` / `deColor` | 캔들 상승/하락 색 (`auto: true` 와 함께). 미지정 시 라이브러리 기본색(핑크 계열). 툴팁 범례 타일도 동일 값 참조 |
| **행 단위 `fillColor`** | 데이터 행에 `fillColor` 를 넣으면 **auto 색보다 우선 적용** — 특정 날짜(공시일 등) 강조에 사용. `marker` 로는 임의 지점 표시가 불가(최저/최고 2점 전용) |

```javascript
scwin.CHART_COLORS = ["#E52528", "#1B64DA", "#0A8060", "#F5A623", "#7B1FA2"];
"color": { "pattern": scwin.CHART_COLORS }
```

## 6. `extend.<type>` — 타입 전용 옵션 (샘플 사용 상위)

| 타입 | 자주 쓰는 옵션 | 샘플 |
|------|----------------|------|
| `candlestick` | `auto`(상승/하락 자동색), `inColor`/`deColor`, `marker:{show,color,min,max}`(고점/저점 2점 전용) | CANDLESTICK, FEATURE/STOCK |
| `bar` | `width: { ratio: 0.5 }`(막대 폭 비율) | 거래량·BAR 계열 |
| `donut` | `multiDatas`(다중 중첩 도넛), `title` | CIRCLE, FEATURE/MULTIDONUT |
| `gantt` | `header.headerJson`(헤더 셀 구성), `useWheelScrollY`, `useFreeYPosition`, `labelFormat` | GANTT |
| `map` | 지도 리소스·지역 매핑 | MAP |
| `pie`/`gauge`/`gaugeNew`/`pointer` | 라벨·범위·바늘 옵션 | CIRCLE |
| `bell`/`boxplot`/`areaRange`/`histogram` | 분포·범위 표현 옵션 | 각 폴더 |

## 7. `global` — 전역 설정·이벤트

| 속성 | 정의 |
|------|------|
| `bUserConf: true` | 사용자 설정 우선 적용 플래그(전용 옵션 차트에서 사용) |
| `onclick: function (d) { ... }` | 데이터 요소 클릭 콜백 — `d.label`/`d.value`/`d.index` 등 전달 (RICH_* 샘플: 클릭 시 `$c.win.alert`) |

## 8. 보조 요소

- `legend: { show: false }` — 범례 숨김(캔들·단일 시리즈에서 흔용)
- `grid` — 보조선, `title` — 차트 제목, `size: { width, height }` — 크기(기본은 컨테이너 추종)

## 9. 고급 기능 — FEATURE 샘플 검증 9종

`sbchart/FEATURE/` 폴더의 기능 샘플로 동작이 검증된 옵션. 일반 업무 차트에서 수요가 잦은 순서로 정리한다.

| 기능 | 옵션 | 일반 활용 | 샘플 |
|------|------|----------|------|
| X축 확대/이동 | `axis.x.zoom: { type: "drag" \| "wheel" }` | 대용량 시계열 구간 탐색 (drag=드래그 구간 확대, wheel=휠 줌) | `SPCHART_ZOOM` |
| 십자선 | `global.crosshair: { show: true }` | 마우스 위치 십자선 — `tooltip.grouped: true` 와 조합해 다중 시리즈 정밀 비교 | `SPCHART_CROSSHAIR` |
| 가로형 차트 | `axis.rotated: true` | 막대를 눕혀 순위/카테고리 비교(긴 항목명에 유리) | `SPCHART_ROTATEDBAR` |
| 임계값 기준 색 | `extend.bar.reference` | 값이 임계값을 넘으면 막대 색 변경(위험/경고/정상) | `SPCHART_REFLINE` |
| 값 구간별 스타일 | `extend.line.sections` | 값 구간(start~end)별 선/영역/마커 스타일 변경 | `SPCHART_SECTIONS` |
| Y축 구간 생략(물결) | `global.broken` | 이상치 탓에 눌린 차트의 중간 구간을 접어 압축 표시 | `SPCHART_BROKEN` |
| 범위 선택 슬라이더 | `dataOpts.datarange` | 차트 하단 드래그 핸들로 표시 구간 필터 | `SPCHART_DATARANGE` |
| 반원 파이 | `extend.pie.fullCircle: false` | 180° 반원 파이 — 달성률 게이지형 위젯 | `SPCHART_HALFPIE` |
| 색상 테마 | `global.color.theme: "a11y"` | 내장 팔레트 테마 적용(접근성 팔레트 등) — `color.pattern` 대신 테마 일괄 지정 | `SPCHART_HALFPIE` |

**임계값 기준 막대 색 (`extend.bar.reference`)** — condition/value/color 는 병렬 배열(높은 임계값부터):
```javascript
extend: {
    bar: {
        reference: {
            use: true,
            condition: [">", ">", ">"],                        // 구간별 비교 연산
            value: [250, 150, 80],                             // 임계값 (높은 → 낮은)
            color: ["#e74c3c", "#f1c40f", "#2ecc71"]           // 초과 시 색 (위험/경고/정상)
        }
    }
}
```

**값 구간별 스타일 (`extend.line.sections`)** — 구간마다 line/area/marker 를 개별 지정:
```javascript
extend: {
    line: {
        sections: [
            { start: 0,   end: 100, line: { fillColor: "#2ecc71", strokeColor: "#2ecc71" } },   // 정상
            { start: 100, end: 200, line: { strokeStyle: "dashed", strokeColor: "#f1c40f" } },  // 경고(점선)
            { start: 200, end: 400,
              line:   { fillColor: "#e74c3c", strokeColor: "#e74c3c" },                          // 위험
              area:   { fillColor: "#f7c6c0" },
              marker: { radius: 6, fillColor: "#fff", strokeColor: "#e74c3c", strokeWidth: 3 } }
        ]
    }
}
```

**Y축 구간 생략 (`global.broken`)** — brokenMinValue~brokenMaxValue 구간이 물결로 접힘:
```javascript
global: {
    broken: { show: true, brokenMinValue: { y: 130 }, brokenMaxValue: { y: 230 } }
}
```

**범위 선택 슬라이더 (`dataOpts.datarange`)** — 데이터 블록 레벨 옵션이므로 dataOpts 안에 선언:
```javascript
dataOpts: {
    datarange: {
        show: true,
        initValue: { min: 1, max: 4 },     // 초기 표시 구간(카테고리 인덱스)
        drMin: { color: "gray", opacity: 0.6, strokeColor: "black", strokeWidth: 1 },   // 좌측 핸들
        drMax: { color: "gray", opacity: 0.6, strokeColor: "black", strokeWidth: 1 }    // 우측 핸들
    }
}
```

## 10. 자주 쓰는 기능 패턴

**① 인덱스→날짜 환산 (`DATES` 패턴)** — indexed x축에서 tick/tooltip 이 인덱스를 주므로 조회 시 날짜 배열을 보관:
```javascript
scwin.DATES = [];
// 조회 후
scwin.DATES = rows.map(function (r) { return r.date; });
// tick: 과밀 방지로 n개당 1개만
scwin.xdate = function (v) { const d = scwin.DATES[v]; return d && v % 3 === 0 ? d.slice(5) : ""; };
```

**② 차트 clear** — 재조회 렌더 전 컨테이너 정리(0건 조회 시 이전 차트 잔존 방지):
```javascript
scwin.clearChart = function (comp) {
    const el = document.getElementById(comp.getID());
    if (el) { el.innerHTML = ""; }
};
```
> `innerHTML=""` 는 화면상 clear 만 한다. SBChart 는 bindto 이름으로 `d3.select(window).on("resize."+bindto, ...)` 리스너를 걸므로, **리스너까지 해제하려면** `sb.chart.render()` 를 직접 호출해 인스턴스를 보관한 뒤 `sb.chart.destroy(instance)` 를 사용해야 한다(`drawChartData` 는 인스턴스를 반환하지 않음).

**③ 행 단위 강조 (`fillColor`)** — 조회 데이터 가공으로 특정 행 캔들/막대 색 지정 (CANDLESTICK 의 `buildChartData` 참고).

**④ 상수화(★ 현장 조정값)** — 색상 팔레트·Y축 폭·여백 등은 `scwin.CHART_*` 상수로 선언하고 ★ 주석으로 조정 지점 표시.

## 11. 함정 요약

1. `domain.min: 0` 무시(truthy 검사) → `min` + `padding.bottom: 0` 사용.
2. y축 기본 패딩 = 값 범위 10% → "0부터 시작"은 `padding.bottom: 0` 필수.
3. range 계열 툴팁은 `values[]`+객체 반환 규약 — 스칼라 포맷터 금지. 타입 표기 카멜 주의(`areaRange`).
4. `marker` 는 최저/최고 2점 전용 — 임의 지점 표시는 행 `fillColor` 또는 scatter 겹치기.
5. `innerHTML=""` clear 는 resize 리스너가 남음 — 완전 해제는 `sb.chart.destroy`.
6. 컨테이너 DOM 접근은 반드시 `comp.getID()`(wframe 스코프 접두사).
7. `types`(combo) 는 `dataOpts` 안에 넣어야 데이터 블록으로 전달된다.
8. 상하 2단 차트 Y축 정렬은 `axis.y.width` 동일 고정값(라벨 실측 자동폭은 차트마다 다름).

## 관련 문서

- 문의 회신·근거 소스 분석: [SPCHART.md](SPCHART.md)
- 렌더 공통함수: `src/gcc/ext.xml` (`$c.ext.drawChartData`/`drawSBChart`)
- 샘플 카탈로그: `src/conversion/md/sample_templates.md`
