# ULDFIS00600.xml 수정 가이드 — gridView 동적 컬럼 구현

> 재무 조건검색 화면(W-Craft 변환 잔재)을 **JSON 데이터 기준 동적 컬럼 gridView 샘플**로 재구성.
> 데이터: `ULDFIS00600.json` (상장사 49건 × 고정 4컬럼 + 2009~2012 × 재무 5지표 = 20컬럼).

## 1. 원본의 문제점

- **W-Craft 변환 잔재**: `include(...)` 6건·`//----W-Craft ... ----//` 마커 다수·`X = ...` 로 깨진 대입문(Gauce `NameString(r,c) = v` 변환 실패).
- **서버·프레임 의존**: 축(기준/가로/세로) pivot 로직이 `trs_save.Post()`·`dts_List.DataID`·`frame.CreateDialogFrame` 등 백엔드/레거시 프레임에 의존 → 로컬에서 동작 불가.
- **DataCollection 미정의**: `dts_List`/`dataList1` 을 gridView 가 참조하나 **실제 `<w2:dataList>` 정의가 없음**(스크립트 `SetDataHeader` 잔재만). `xf:model` 은 `workflowCollection` 만.
- **gridView 2개 혼재**: `dataList1` 바인딩(디자인 잔재, 2단 헤더 예시)·`grd_List`(`display:none`, 정적 `ACCNT_VAL1~10` + `ColumnProp Show` 토글).

## 2. 재구성 방향 (사용자 확정)

| 결정 | 선택 |
|------|------|
| 구현 범위 | **순수 동적그리드 샘플로 재구성** (축 pivot·서버 통신 잔재 제거) |
| 헤더 형태 | **연도 2단 그룹 헤더** (상위=연도, 하위=지표 + 고정 4컬럼 rowSpan) |
| 데이터 로딩 | **`$c.sbm.executeDynamic` 서버 동적 조회** (async/await 수신) |

## 3. 동적 구현 방식 — `setGridStyle` 전체 재생성 (2단 헤더) + dataList `insertColumn` 동기화

> **2026-09-04 정정**: 당초 `setColumns` 의 colDef `group` 자동 병합 스펙을 가정했으나, **최신 엔진 소스 확인 결과 `setColumns` 는 멀티로우 헤더를 지원하지 않는다** — colDef 에서 `{ id, header, width, inputType, defaultValue }` 만 읽고(`group`·`align` 무시), 헤더는 **마지막 1개 행만 남기고 전 셀을 `colSpan="1" rowSpan="1"` 로 강제**해 항상 평면 단일 헤더가 된다. 2단 그룹 헤더는 **`setGridStyle`(gridView 전체 XML 재생성 API)** 로 구현한다.

| API (최신 엔진 실측) | 기능 | 멀티로우 헤더 |
|-----|------|------|
| `addColumn(colDef, atIndex)` / `removeColumn(target)` | 컬럼 1개 추가/제거(그리드 재생성 없음) | ✗ (단일 헤더 전제) |
| `setColumns(columns, options)` | 전체 컬럼 일괄 재구성 — colDef `{id,header,width,inputType,defaultValue}` | **✗ 단일 헤더 행 강제** |
| **`setGridStyle(xml)`** | **gridView 전체 XML(또는 JSON)로 제자리 재생성** — `remove()` 후 controlFactory 재생성, 정렬/필터 상태 승계 | **○ 헤더 행 임의 구성 — 본 화면에서 사용** |
| dataList `insertColumn(id, opts)` / `removeColumn(id)` | dataList 컬럼 추가(기존 id skip·멱등)/제거 | (데이터 축) |

### 구현 흐름 (colDef 는 내부 모델로 유지)
colDef `{ id, header, width, align[, group] }` 배열을 내부 모델로 만들고(`buildColumnDefs`), 이를 두 갈래로 전개한다:
1. **`syncDataListColumns(cols)`** — dltFisList 에 `insertColumn`(신규)·`removeColumn`(잔존) 으로 컬럼 동기화. setColumns 가 내부에서 하던 dataList 연동을 직접 수행.
2. **`buildGridStyleXml(cols)`** — `<w2:gridView>` 전체 XML 문자열 생성 후 `grdFis.setGridStyle(xml)`:
   - 상단 헤더 행: `group` 없는 고정 컬럼 `rowSpan="2"` + 연속 동일 `group` 을 `colSpan=지표수` 로 병합("YYYY년").
   - 하단 헤더 행: `group` 컬럼의 지표 헤더 셀.
   - `group` 이 하나도 없으면(빈 메타) 단일 헤더 행.
   - gBody 행: 컬럼 id·`textAlign`(colDef `align`) 바인딩. 라벨은 `escapeXml` 로 이스케이프.
```js
scwin.syncDataListColumns(cols);
$c.util.getComponent("grdFis").setGridStyle(scwin.buildGridStyleXml(cols));
dltFisList.setJSON(rows);
```
→ **연도 그룹 슬롯도, 연도당 지표 슬롯도 사전 정의 없이 데이터에서 도출한 목록 그대로 생성**된다(슬롯/hidden 토글 불필요).
> `setGridStyle` 은 컴포넌트를 제거 후 재생성하므로, 이후 그리드 참조는 로드 시점 전역이 아니라 **호출 시점 `$c.util.getComponent("grdFis")` 재조회**로 접근한다(btnExcel_onclick 등). dataList 는 재생성되지 않으므로 bare 참조 유지.

## 4. 구현 구조

### 4.1 골격 (컬럼 미정의 — 런타임 구성)
- **dataList `dltFisList`**: `<w2:columnInfo></w2:columnInfo>`(비움). 컬럼은 `setColumns` 로 구성되는 그리드에 맞춰지고 데이터는 `setJSON` 으로 적재.
- **gridView `grdFis`**: `<w2:header>`/`<w2:gBody>` 각 `<w2:row>` 를 **비운 상태**의 자리표시자로 두고, 런타임 `setGridStyle` 로 전체(헤더 2행 + 바디)를 재생성.
- 슬롯 사전 정의(`y1m1`… 하드코딩)·`colSpan`/`rowSpan` XML 고정 없음.

### 4.2 동적 로직 (스크립트 구역, code-convention 준수)
1. **2구역** `onpageload`(async) → `await loadFisData()` — 진입점 try/catch + `await $c.exception.handleError`, 내부 함수는 예외 전파.
2. **4구역(서브미션 콜백)** `loadFisData`(async): `const rtn = await $c.sbm.executeDynamic({ id, action, isProcessMsg })` 로 서버 동적 조회. **`submitDoneHandler` 를 넘기지 않아야** sbm 이 `_promise_submitDoneHandler → resolve(rtn)`(성공)·`reject`(실패)로 Promise 를 settle 하므로 `await` 로 응답을 수신(에러는 진입점으로 전파). 이후 `buildDynamicGrid(rtn.responseJSON)`.
3. `buildDynamicGrid`: 메타는 응답 `json.meta`(years/metrics) 우선, 없으면 `extractMeta(body[0])` 폴백, 빈 body 면 빈 메타.
   - `buildColumnDefs(meta)` → `syncDataListColumns(cols)`(dataList 동기화) → `$c.util.getComponent("grdFis").setGridStyle(buildGridStyleXml(cols))`(2단 헤더 재생성) → `dltFisList.setJSON(buildRows(body, meta))`.
4. `extractMeta(rec)`(폴백): 키를 `/^(20\d\d)_(.+)$/` 로 분해 → `{fixed, years, metrics}`(연도 오름차순). 괄호 지표명(`(당좌자산대손충당금(계))`)도 정상.
5. `buildColumnDefs(meta)`: 고정 4(`isurCd`/`comNm`/`lstDt`/`spacYn`, header 는 `meta.fixed` 라벨) + **연도(`group="YYYY년"`) × 지표(`header=지표명`)** colDef 배열 생성 — 연도·지표 개수 모두 데이터 기반.
6. `buildRows(body, meta)`: 각 레코드를 컬럼 id(고정 + `y{연}m{지표}`) 스키마로 매핑.
7. 값 결측(`"-"`)·콤마 천단위 문자열은 원본 그대로 표시(`pick` 으로 undefined/null → `""`).

### 4.3 리뷰 반영 (websquare-code-reviewer)
초기 슬롯 버전 리뷰 지적을 반영한 뒤 setColumns 방식으로 전환:
- **통신 방식**: `fetch` → gcc 표준 `$c.sbm.executeDynamic`(**async/await**) — `submitDoneHandler` 를 넘기지 않아 Promise 가 settle 되므로 `await` 로 응답 수신, 실패는 reject → 진입점 try/catch 로 전파.
- **첫 행 결측 의존 해소**: `json.meta` 우선 사용.
- **빈 body**: 빈 메타 → 고정 4컬럼·단일 헤더 행의 `setGridStyle` + `setJSON([])`(잔존 없음, dataList 잔존 컬럼은 `syncDataListColumns` 가 제거).
- **`<w2:publicInfo>` 등록**: 배선 4함수.
- (유지) `grdFis`/`dltFisList` bare 전역 참조 — WebSquare id 전역 등록 관용.

### 4.4 이번 데이터 적용 결과
- 연도 4개(2009~2012) → `group` 4개("2009년"~"2012년") 그룹 헤더 생성.
- 지표 5종(자산총계·유동자산(계)·당좌자산(계)·(당좌자산대손충당금(계))·현금및현금등가물) → 각 연도 하위 5컬럼.
- 총 컬럼 = 고정 4 + 4×5 = **24** (슬롯·hidden 없이 정확히 데이터 수만큼). 연도/지표 수가 바뀌면 `setGridStyle` 재생성 결과가 그대로 반영(vm 하니스 실측: 헤더 2행 — 상단 rowSpan="2" ×4 + colSpan="5" ×4, 하단 20셀, 바디 24셀; 빈 메타 시 단일 헤더 행).

## 5. 데이터/응답 규약
- 서버 응답(`rtn.responseJSON`)은 `{ meta:{fixed,years,metrics}, body:[...] }` 구조로 가정(원본 `ULDFIS00600.json` 과 동일 형태 — 응답 모킹/참고 데이터로 유지).
- `action`(`scwin.SERVICE_ACTION = "/uld/fis/ULDFIS00600/selectFisList.do"`)·`id`(`sbmFisList`)는 샘플 경로. 실제 서비스/queryId 로 교체 필요.
- 조회 조건이 필요하면 요청 파라미터 DataMap 을 `options.ref` 로 지정한다(현재는 무조건 전체 조회라 생략).

## 6. 유지/제외 항목
- 축(기준/가로/세로) 팝업·조건 저장·`queryId`/`tableName` 분기 등 **원본 서버·프레임 의존 로직 전면 제거**(순수 샘플 목적).
- 페이지리스트(`pageList`)·조건 입력 테이블 등 원본 UI 잔재 제거.
- 통신은 gcc 표준 `$c.sbm.executeDynamic`(비동기, **async/await**)로 표준화 — 서버 미배포 시 그리드는 빈 상태.

## 7. 검토 체크리스트
- [x] XML well-formed · JS 구문 OK
- [x] 화면 인라인 IIFE 0 · script 탭 0 · 4-스페이스
- [x] gridView/dataList 컬럼 골격 비움 → `setGridStyle` 재생성 + `insertColumn`/`removeColumn` 동기화로 런타임 재구성(슬롯 사전정의·hidden 토글 없음)
- [x] 연도(`group`)·지표(`header`) 모두 데이터 기반 동적 생성 — colDef `{id,header,width,align,group}` 를 `buildGridStyleXml` 이 2단 헤더 XML 로 전개
- [x] **멀티로우 헤더 실측 검증** — 생성 XML well-formed(lxml)·헤더 2행 구조 vm 하니스 확인(`setColumns` 는 단일 헤더 강제라 미사용)
- [x] 전 함수 표준 JSDoc · 진입점 `$c.exception.handleError`
- [x] 엄격 비교(`===`/`!==`) · `const`/`let` · `ev:onclick` 배선
- [x] JSON 유효화(한글 키 보존)
