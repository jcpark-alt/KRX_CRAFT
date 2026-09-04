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

## 3. 동적 구현 방식 — gridView 표준 런타임 컬럼 API `setColumns`

인스턴스를 보존한 채 컬럼 수에 의존하는 레이아웃만 다시 산출하는 **정식 런타임 컬럼 조작 API**(XPlatform → WebSquare 전환용으로 GridView 에 보강)를 사용한다.

| API | 기능 |
|-----|------|
| `addColumn(colDef, atIndex)` | 컬럼 1개 추가(그리드 재생성 없음) — 끝/지정 위치/병합 그룹 합류 |
| `removeColumn(target, options)` | 컬럼 1개 제거(id 또는 인덱스) |
| **`setColumns(columns, options)`** | **전체 컬럼 일괄 재구성(목표 목록으로 한 번에 교체)** — 본 화면에서 사용 |

> ⚠️ 이 3종 API 는 현재 리포의 엔진 스냅샷(`src/engine/websquare-engine.beautified.js`)에는 아직 없는 **보강 API**(운영 엔진 기준). 소스 검증 불가 구간이며, `colDef` 스키마는 사용자 확정 스펙을 따른다.

### colDef 스키마 (확정)
평면 배열, 각 컬럼은 `{ id, header, width, align[, group] }`. **같은 `group` 문자열끼리 상위 헤더가 자동 병합**(2단 그룹 헤더). `group` 없으면 단일 헤더.
```js
grdFis.setColumns([
    { id: "comNm", header: "회사명", width: 160, align: "left" },
    { id: "y1m1", header: "자산총계", width: 110, align: "right", group: "2009년" },
    { id: "y1m2", header: "유동자산(계)", width: 110, align: "right", group: "2009년" },
    { id: "y2m1", header: "자산총계", width: 110, align: "right", group: "2010년" }
    /* ... */
]);
```
→ **연도 그룹 슬롯도, 연도당 지표 슬롯도 사전 정의 없이 데이터에서 도출한 목록 그대로 생성**된다(슬롯/hidden 토글 불필요).

## 4. 구현 구조

### 4.1 골격 (컬럼 미정의 — 런타임 구성)
- **dataList `dltFisList`**: `<w2:columnInfo></w2:columnInfo>`(비움). 컬럼은 `setColumns` 로 구성되는 그리드에 맞춰지고 데이터는 `setJSON` 으로 적재.
- **gridView `grdFis`**: `<w2:header>`/`<w2:gBody>` 각 `<w2:row>` 를 **비운 상태**로 두고, 런타임 `setColumns` 로 전체 컬럼을 구성.
- 슬롯 사전 정의(`y1m1`… 하드코딩)·`colSpan`/`rowSpan` XML 고정 없음.

### 4.2 동적 로직 (스크립트 구역, code-convention 준수)
1. **2구역** `onpageload`(async) → `await loadFisData()` — 진입점 try/catch + `await $c.exception.handleError`, 내부 함수는 예외 전파.
2. **4구역(서브미션 콜백)** `loadFisData`(async): `const rtn = await $c.sbm.executeDynamic({ id, action, isProcessMsg })` 로 서버 동적 조회. **`submitDoneHandler` 를 넘기지 않아야** sbm 이 `_promise_submitDoneHandler → resolve(rtn)`(성공)·`reject`(실패)로 Promise 를 settle 하므로 `await` 로 응답을 수신(에러는 진입점으로 전파). 이후 `buildDynamicGrid(rtn.responseJSON)`.
3. `buildDynamicGrid`: 메타는 응답 `json.meta`(years/metrics) 우선, 없으면 `extractMeta(body[0])` 폴백, 빈 body 면 빈 메타.
   - `grdFis.setColumns(buildColumnDefs(meta))` 로 컬럼 통째 재구성 → `dltFisList.setJSON(buildRows(body, meta))`.
4. `extractMeta(rec)`(폴백): 키를 `/^(20\d\d)_(.+)$/` 로 분해 → `{fixed, years, metrics}`(연도 오름차순). 괄호 지표명(`(당좌자산대손충당금(계))`)도 정상.
5. `buildColumnDefs(meta)`: 고정 4(`isurCd`/`comNm`/`lstDt`/`spacYn`, header 는 `meta.fixed` 라벨) + **연도(`group="YYYY년"`) × 지표(`header=지표명`)** colDef 배열 생성 — 연도·지표 개수 모두 데이터 기반.
6. `buildRows(body, meta)`: 각 레코드를 컬럼 id(고정 + `y{연}m{지표}`) 스키마로 매핑.
7. 값 결측(`"-"`)·콤마 천단위 문자열은 원본 그대로 표시(`pick` 으로 undefined/null → `""`).

### 4.3 리뷰 반영 (websquare-code-reviewer)
초기 슬롯 버전 리뷰 지적을 반영한 뒤 setColumns 방식으로 전환:
- **통신 방식**: `fetch` → gcc 표준 `$c.sbm.executeDynamic`(**async/await**) — `submitDoneHandler` 를 넘기지 않아 Promise 가 settle 되므로 `await` 로 응답 수신, 실패는 reject → 진입점 try/catch 로 전파.
- **첫 행 결측 의존 해소**: `json.meta` 우선 사용.
- **빈 body**: 빈 메타 → 컬럼 없이 `setColumns([고정4])` + `setJSON([])`(잔존 없음).
- **`<w2:publicInfo>` 등록**: 배선 4함수.
- (유지) `grdFis`/`dltFisList` bare 전역 참조 — WebSquare id 전역 등록 관용.

### 4.4 이번 데이터 적용 결과
- 연도 4개(2009~2012) → `group` 4개("2009년"~"2012년") 그룹 헤더 생성.
- 지표 5종(자산총계·유동자산(계)·당좌자산(계)·(당좌자산대손충당금(계))·현금및현금등가물) → 각 연도 하위 5컬럼.
- 총 컬럼 = 고정 4 + 4×5 = **24** (슬롯·hidden 없이 정확히 데이터 수만큼). 연도/지표 수가 바뀌면 `setColumns` 결과가 그대로 반영.

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
- [x] gridView/dataList 컬럼 골격 비움 → `setColumns` 로 런타임 재구성(슬롯 사전정의·hidden 토글 없음)
- [x] 연도(`group`)·지표(`header`) 모두 데이터 기반 동적 생성 — colDef `{id,header,width,align,group}`
- [x] 전 함수 표준 JSDoc · 진입점 `$c.exception.handleError`
- [x] 엄격 비교(`===`/`!==`) · `const`/`let` · `ev:onclick` 배선
- [x] JSON 유효화(한글 키 보존)
