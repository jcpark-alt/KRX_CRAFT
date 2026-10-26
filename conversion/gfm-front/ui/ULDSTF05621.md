# ULDSTF05621 (팝업)분배기준일변경관리 — 업무 분석 및 전환 내역

| 항목 | 내용 |
|---|---|
| AS-IS | `/lstproc/ULDSTF05621.gfm` (Gauce/X-Internet, 610×680 모달 창 — 부모가 615×710 `window` 로 연다) — 반입 `conversion/gfm-front/ui/ULDSTF05621.gfm` |
| 신규 API 명세 | `conversion/gfm-front/ui/ULDSTF05621_API.txt` (`/api/listing/lstproc/fund/dist-pay-basdd-change/*` 6종) |
| TO-BE | `conversion/gfm-front/ui-tobe/ULDSTF05621.xml` (배포 경로 `/ui/lst/lstproc/ULDSTF05621.xml` — 가정, §10) |
| 퍼블리싱 | `conversion/publish/상장/상장처리(대내)/ULDSTF05621.xml` — 컴포넌트 id 는 AS-IS 와 같고, 날짜는 `w2:inputCalendar`, 사유는 `xf:select1`, 달력 이미지 버튼은 없음 |
| 화면 캡처 | 없음 |
| 업무공통 | `$c.stf`(`getNewBzProcNo`·`getMessageParam`·`checkMaxLength`·`setButtonSetWithDate`)·`$c.lc`(`isProcess`·`getSecuGrpNm`·`glb.*` 상수) — `cm/pcc/stf`. 게이트는 `--pcc stf` 로 돌린다 |
| 작성 | Inswave / 2026-10-26 |

참고 양식: [websquare_gfm_conversion.md](../../md/websquare_gfm_conversion.md). Gauce 대응은 [gfm_business_analysis_guide.md](../../md/gfm_business_analysis_guide.md) §5·§6 을 함께 따랐다.

---

## 1. 화면 개요

상장 담당자가 **분배기준일변경 목록(ULDSTF05620)** 에서 회사를 고른 뒤, 선박투자회사 등 집합투자형 상장법인의 **수입분배기준일(월·일) 변경**을 신규 등록하거나, 등록한 건을 수정·삭제하는 팝업이다. 공시안내문을 작성하고 기안문을 띄우는 일도 이 화면에서 한다.

1. 부모가 회사(발행기관)와 업무처리번호를 넘겨 팝업을 연다. 업무처리번호가 없으면 신규, 있으면 수정이다.
2. 신규이면 그 회사의 **현재 수입분배기준일 목록**을 "변경전"에 채운다. "변경후" 그리드에는 입력할 빈 행을 깔아 둔다.
3. 변경후 월·일, 변경일, 시장조치시행일, 변경 후 최초 사업연도, 변경사유, 기타를 입력해 저장한다. 저장하기 전에 확인을 받고, 현재일 이후의 예약 건이 있는지 확인하고, 업무처리번호를 새로 받는다.
4. 수정이면 업무처리번호로 마스터와 변경전·변경후 목록을 조회한다. 시장조치시행일이 이미 지났으면 기안만 할 수 있다.
5. 저장·수정에 성공하면 다시 조회하고, 삭제에 성공하면 팝업을 닫는다. 부모는 팝업이 닫히면 스스로 목록을 다시 조회한다.

### 1.1 호출 화면 (1본)

- `ULDSTF05620` 분배기준일변경 목록 — 퍼블리싱본 `conversion/publish/상장/상장처리(대내)/ULDSTF05620.xml`(W-Craft 1차 스크립트 포함, 아직 TO-BE 전환 전).
  - [등록] 버튼(`img_Regist_onclick`) → 신규. 회사를 먼저 고르지 않으면 `MSG-0013` 안내.
  - 목록 더블클릭(`grd_List_OnDblClick`) → 수정.
  - 창 제목: `$c.lc.getSecuGrpNm(증권그룹ID) + " 분배기준일변경관리"`. 예: 증권그룹 `SC` 이면 "선박투자 분배기준일변경관리".
  - 팝업이 닫히면 부모가 `fn_search()` 로 다시 조회한다(모달 대기 전제).

### 1.2 호출 규약 (부모 → 이 화면) / 반환 규약

AS-IS 는 부모가 `fn_GetPar` 를 자기 함수로 바꿔 두면, 팝업이 로딩 때 `frame.Provider("../").fn_GetPar(arrPar)` 로 부모 함수를 불러 배열을 채워 받는다.

| arr | TO-BE 키 (제안) | 의미 | 빈 값일 때 / 분기 |
|---|---|---|---|
| `arr[0]` | `isurCd` | 발행기관코드 | 신규 시 현재 기준일 조회 조건, 저장 전문 회사코드 |
| `arr[1]` | `isurNm` | 발행기관명 | 회사명 표시 |
| `arr[2]` | `secugrpId` | 증권그룹ID | 이 화면에서는 쓰지 않음 |
| `arr[3]` | `mktId` | 시장구분코드 | 이 화면에서는 쓰지 않음(안내문은 `'1'` 고정 — §8 #11) |
| `arr[4]` | `bzProcsNo` | 업무처리번호 | **비면 신규**, 있으면 수정 |
| `arr[5]` | `fiscyyDistrBasddTpCd` | 결산기분배기준일구분코드 (1 결산기 / 2 분배기준일) | 부모는 항상 `"2"`. 화면은 이 값을 읽지 않고 저장 때 `"2"` 를 직접 넣음(원본 변수명 `haltTpCd`) |

- **TO-BE 제안**: 부모가 `$c.win.openPopup(url, options, { isurCd, isurNm, secugrpId, mktId, bzProcsNo, fiscyyDistrBasddTpCd })` 로 넘기고, 이 화면은 `$c.data.getParameter()` 로 받는다. 부모(05620)가 아직 전환 전이라 키 이름은 제안이다(§10 #6).
- **반환**: 없음. 원본은 `frame.CloseFrame()` 만 하고 값을 돌려주지 않는다. 부모는 닫힌 뒤 다시 조회한다.

### 1.3 이 화면이 여는 하위 팝업

| 팝업 | AS-IS 호출 | 넘기는 값 |
|---|---|---|
| `ULDSTF92024` 공시안내문작성 (735×815 `window`) | `frame.CreateDialogFrame("ULDSTF92024", "/listingcommon/ULDSTF92024.gfm", …)` | `fn_GetPar(arr, dts_isu, dts_mst, dts2, dts3)` — §6.4 |
| `ULDSTF92004` 기안문작성 | `fn_PopFindDraft()` (공통) | `fn_GetPar(arr)` 에 `arr[0]` = 업무처리번호 — §6.5 |

---

## 2. 화면 구성 및 데이터 정의

### 2.1 화면 구성

| 영역 | AS-IS 요소 | TO-BE 컴포넌트 (바인딩) | 설명 |
|---|---|---|---|
| 1. 회사코드(명) | `txb_ISUR_CD`·`txb_COM_NM` (readonly) | `txb_ISUR_CD` (`w2:autoComplete`, `dma_mst.isurCd`) · `txb_COM_NM` (`xf:input`, `dma_mst.isurNm`) | 읽기 전용 |
| 2. 수입분배기준일 가. 변경전 | `grd_DIST_PAY_BF` (편집 불가, 월·일) | `grd_DIST_PAY_BF` (`dlt_dtlBf`, `readOnly="true"`) | 신규: 현재 기준일, 수정: 등록된 변경전 |
| 2. 나. 변경후 (*) | `grd_DIST_PAY_AF` (편집, 월·일) | `grd_DIST_PAY_AF` (`dlt_dtlAf`) | 빈 행을 깔아 두고 입력 — §3 |
| 3. 변경일 (*) | `edt_CHG_DD` + `img_CHG_DD` | `edt_CHG_DD` (`inputCalendar`, `dma_mst.chgDd`) | 달력 이미지 **(옮기지 않음)** — inputCalendar 내장 달력 |
| 4. 시장조치시행일 (*) | `edt_MKTACT_ENFORCE_DD` + `img_MKTACT_ENFORCE_DD` | `edt_MKTACT_ENFORCE_DD` (`dma_mst.mktactEnforceDd`) | "(시스템 반영일자를 입력)" 안내 라벨 유지. 수정 모드 버튼 상태의 기준일 |
| 5. 변경 후 최초 사업연도 (*) | `edt_ChgStatDd`·`edt_ChgEndDd` + `img_ChgStatDd`·`img_ChgEndDd` | `edt_ChgStatDd` (`dma_mst.fiscyyChgStrtDd`) · `edt_ChgEndDd` (`dma_mst.fiscyyChgEndDd`) | 필수 표시가 있으나 원본은 검증하지 않음 — §8 #9 |
| 6. 변경사유 (*) | `cmb_FISCYY_CHG_RSN_CD` (고정 목록) | `cmb_FISCYY_CHG_RSN_CD` (`xf:select1`, `dma_mst.fiscyyChgRsnCd`) | 1 임시주주총회에서 결의 / 2 정기주주총회에서 결의 / 9 기타 — §7 |
| 7. 기타 | `txa_REMK` | `txa_REMK` (`dma_mst.remk`) | 2000 byte 제한 |
| 버튼 | `btn_Save`·`btn_Update`·`btn_Delete`·`btn_Drft`·`btn_Dscl`·`btn_Close` (이미지) | 같은 id `xf:trigger` (`grpBtnBox`) | 활성 상태는 `buttonSet` → `$c.util.setButtonState` — §4 |
| (장식) | `panel_3` + `PanelToGroupBox` | **(옮기지 않음)** | 퍼블리싱 마크업이 대신함 |

### 2.2 데이터 정의

| AS-IS | TO-BE | 종류 | 키(컬럼) | 출처 / 용도 |
|---|---|---|---|---|
| `dts_Mst` (1행) | `dma_mst` | dataMap | `bzProcsNo`, `isurCd`, `isurNm`, `comNm`, `fiscyyDistrBasddTpCd`, `chgDd`, `mktactEnforceDd`, `fiscyyChgRsnCd`, `fiscyyChgRsnNm`, `remk`, `fiscyyChgStrtDd`, `fiscyyChgEndDd`, `disclsYn`, `draftYn` | 상세 조회 응답(`select-one` 의 `dma_resultDetail`) + 저장 전문(`dma_reqSave`/`dma_reqUpdate`). 신규는 빈 1행(원본 `FSCCHG_MST_INOUT` 헤더) |
| `dts_DtlBf` | `dlt_dtlBf` | dataList | `bzProcsNo`, `bybzprocsSeq`(number), `isurCd`, `chgBfafTpCd`, `basMmdd`, `basMm`, `basDd` | 신규: `select-current-dist-pay-basdd` 응답 / 수정: `select-one` 의 변경전 목록. 저장 시 `chgBfafTpCd="1"` |
| `dts_DtlAf` | `dlt_dtlAf` | dataList | (위와 같음) | 수정: `select-one` 의 변경후 목록 + 빈 행 보충. 저장 시 `chgBfafTpCd="2"` |
| `dts_BzProcsNo` | (삭제) | — | — | 채번 결과는 `$c.stf.getNewBzProcNo()` 반환값을 바로 쓴다 |
| `dts_Mst_Check` | (삭제) | — | — | 예약 건 확인 응답은 boolean 하나 — 응답 값을 바로 쓴다(§5.3) |
| `trs` | (삭제) | — | — | 저장·수정·삭제 통신 → `executeDynamic` |

- AS-IS 컬럼은 대문자(`ISUR_CD`·`BAS_MM`…)이다. TO-BE 키는 API 명세의 camelCase 를 쓴다. 매핑: `ISUR_CD→isurCd`, `ISUR_NM→isurNm`, `MKTACT_ENFORCE_DD→mktactEnforceDd`, `CHG_DD→chgDd`, `REMK→remk`, `FISCYY_CHG_RSN_CD→fiscyyChgRsnCd`, `FISCYY_CHG_STRT_DD→fiscyyChgStrtDd`, `FISCYY_CHG_END_DD→fiscyyChgEndDd`, `BAS_MM/BAS_DD/BAS_MMDD→basMm/basDd/basMmdd`, `BYBZPROCS_SEQ→bybzprocsSeq`, `CHG_BFAF_TP_CD→chgBfafTpCd`, `FISCYY_DISTR_BASDD_TP_CD→fiscyyDistrBasddTpCd`.
- 그리드 컬럼 id 는 `basMm`(월)·`basDd`(일) 두 개다. 퍼블리싱본의 대문자 컬럼 id(`BAS_MM`/`BAS_DD`, 헤더 `h_BAS_MM`/`h_BAS_DD`)는 dataList 키에 맞춰 바꾼다.

---

## 3. 로딩 (`gform onload` → `scwin.onpageload` → `scwin.init_*`)

원본 `gform onload` 순서(모든 조회는 **동기**):

1. **파라미터 수신** (`scwin.init_recvParam`)
   - AS-IS: `frame.Provider("../").fn_GetPar(arrPar)` → `Isur_cd`·`Isur_nm`·`Secugrp_id`·`Mkt_id`·`fr_bz_procs_no`·`haltTpCd`.
   - TO-BE: `const param = $c.data.getParameter() ?? {};` → `scwin.isurCd`·`scwin.isurNm`·`scwin.bzProcsNo` (§1.2). 쓰지 않는 `secugrpId`·`mktId` 는 받지 않아도 된다.
2. **버튼 매핑** — AS-IS `buttonSet.setSaveInfo(btn_Save, fn_save)` 등 5종. TO-BE 는 `ev:onclick` 바인딩(§4) + 역할 매핑:
   `scwin.BTN_MAP = { save : "btn_Save", modify : "btn_Update", "delete" : "btn_Delete", draft : "btn_Drft", guide : "btn_Dscl" }`.
3. **신규·수정 분기**
   - 업무처리번호 있음 → **수정 조회** `await scwin.selectOne()` (§5.2).
   - 없음 → **신규 준비** `await scwin.init_newForm()`:
     1. `dma_mst.setEmptyValue()` (원본: 헤더만 받은 뒤 `OnLoadCompleted` 에서 `AddRow`), `dlt_dtlAf.removeAll()`.
     2. 현재 수입분배기준일 조회 → `dlt_dtlBf` (§5.1, 원본 `TRS_IDX_NEWSEL2`).
     3. 변경후 빈 행 채우기(§6.2 `scwin.fillAfRows`).
     4. 버튼 상태 `insert` (원본 `buttonSet.setInsertStatus()`).
4. **회사코드·명 설정** — AS-IS 는 조회 뒤 `dts_Mst` 에 `ISUR_CD`·`ISUR_NM` 을 부모 값으로 덮어쓴다(수정 모드도). TO-BE 는 신규일 때만 부모 값을 넣고, 수정은 조회 응답(`isurCd`·`isurNm`)을 그대로 쓴다(§8 #8).
5. `PanelToGroupBox(panel_3)` — 삭제(퍼블리싱 마크업).

```javascript
scwin.onpageload = async function () {
    try {
        scwin.init_recvParam();
        if ($c.util.isEmpty(scwin.bzProcsNo)) {
            await scwin.init_newForm();
        } else {
            await scwin.selectOne();
        }
    } catch (ex) {
        await $c.exception.handleError(ex, { context : "ULDSTF05621.onpageload" });
    }
};
```

---

## 4. 컴포넌트 이벤트

| TO-BE 컴포넌트 | 이벤트 | TO-BE 핸들러 | 동작 (호출 함수) | AS-IS |
|---|---|---|---|---|
| `btn_Save` (저장) | `onclick` | `scwin.btn_Save_onclick` | `scwin.save()` — §6.6 | `buttonSet.setSaveInfo(btn_Save, fn_save)` |
| `btn_Update` (수정) | `onclick` | `scwin.btn_Update_onclick` | `scwin.update()` — §6.7 | `fn_update` |
| `btn_Delete` (삭제) | `onclick` | `scwin.btn_Delete_onclick` | `scwin.remove()` — §6.8 | `fn_delete` |
| `btn_Dscl` (안내문작성) | `onclick` | `scwin.btn_Dscl_onclick` | `scwin.writeDscl()` — §6.4 | `fn_dscl` |
| `btn_Drft` (기안) | `onclick` | `scwin.btn_Drft_onclick` | `scwin.writeDraft()` — §6.5 | `fn_drft` |
| `btn_Close` (닫기) | `onclick` | `scwin.btn_Close_onclick` | `$c.win.closePopup()` | `frame.CloseFrame()` |
| `grd_DIST_PAY_AF` (변경후) | `onafteredit` | `scwin.grd_DIST_PAY_AF_onafteredit` | 월 > 12, 일 > 31 이면 "입력월을 확인하세요." / "입력일을 확인하세요." 안내 후 그 칸을 비움 — §6.3 | `OnExit(row, colid, olddata)` |
| `img_*` 달력 4종 | `onclick` | **(옮기지 않음)** | inputCalendar 내장 달력 | `popUpCalendar2(edt_…)` |
| `grd_DIST_PAY_AF` | — | **(옮기지 않음)** | 항상 `true` 를 돌려줄 뿐이라 동작 없음 | `CanColumnPosChange` |

**버튼 상태 (모드 × 버튼)** — 원본 `buttonSet` 은 이미지 버튼의 활성을 바꾼다.

| 상태 | 저장 | 수정 | 삭제 | 기안 | 안내문작성 | TO-BE |
|---|---|---|---|---|---|---|
| 신규 | O | | | | | `setButtonState("grpBtnBox", "insert", BTN_MAP)` |
| 수정 (시장조치시행일 > 오늘) | | O | O | O | O | `$c.stf.setButtonSetWithDate(edt_MKTACT_ENFORCE_DD, false, "grpBtnBox", BTN_MAP)` → `update` |
| 수정 (시장조치시행일 ≤ 오늘) | | | | O | | 같은 함수 → `error`(기안만) |

- 닫기 버튼은 `BTN_MAP` 에 넣지 않는다(항상 활성).
- `insert` 상태의 활성 목록은 `["new", "save"]` 이다. 이 화면에 `new` 버튼은 없으므로 결과적으로 [저장]만 켜진다.

---

## 5. 서버 통신

공통: AS-IS 는 모든 URL 에 `SCREN_ID=ULDSTF05621.gfm`·`SCREN_PROCES_TP_CD`(01 조회 / 02 입력 / 03 수정 / 04 삭제)를 붙이고, 저장 `trs.Action` 은 `fn_encodeNSession` 으로 세션 정보를 붙인다. 신규 API 명세에는 이 파라미터가 없으므로 **TO-BE 는 넘기지 않는다**(화면 이력·세션은 서버 처리 전제 — §10 #10). 모든 통신은 응답을 쓰기 전에 `if (result?.skipped) return;` 을 둔다. 통신 함수는 4구역이다.

| # | 용도 | AS-IS | TO-BE |
|---|---|---|---|
| 5.1 | 신규: 현재 수입분배기준일 | `/fiscalYearChange.do?method=searchFiscalYearChange&DIV_IDX=3(DTL_DIST_BF)&TRS_IDX=5(NEWSEL2)&ISUR_CD=` → `dts_DtlBf` | `GET …/select-current-dist-pay-basdd` (`isurCd`) |
| 5.2 | 수정: 상세 조회 | 같은 URL `DIV_IDX` 0(FSC_MST)·3·4 로 3번 → `dts_Mst`·`dts_DtlBf`·`dts_DtlAf` | `GET …/select-one` (`bzProcsNo`) 1번 |
| 5.3 | 예약(미래일자) 중복 확인 | `fn_mst_check(dts_Mst_Check, "2")` (공통, `DIV_IDX=0&TRS_IDX=NEWSEL&GUBUN_CD=2`) | `GET …/select-mst-check` (`isurCd`) → boolean |
| 5.4 | 채번 | `fn_getNewBzProcNo(dts_BzProcsNo)` | `$c.stf.getNewBzProcNo()` (`GET /api/listing/lstproc/stock/chglisting/new-bzprocsno`) — §10 #2 |
| 5.5 | 신규 저장 | `trs` `/fiscalYearChange.do?method=saveFiscalYearChange` `TRS_IDX=1` `KeyValue: dtsParm1=dts_Mst, dtsParm2=dts_DtlAf, dtsParm3=dts_DtlBf` | `POST …/insert` |
| 5.6 | 수정 | 같은 `trs` `TRS_IDX=2` | `POST …/update` |
| 5.7 | 삭제 | 같은 `trs` `TRS_IDX=3` (데이터셋 3개를 그대로 전송) | `POST …/delete` (`bzProcsNo`) |

(`…` = `/api/listing/lstproc/fund/dist-pay-basdd-change`)

AS-IS `trs.Parameters`: `TRS_IDX`, `BZ_PROCS_NO`, `COUNT=3`, `LIST_BZ_TP_CD=232`(분배기준일변경), `DIV_IDX[0]=0`·`DIV_IDX[1]=4`·`DIV_IDX[2]=3`. TO-BE 는 API 마다 경로가 나뉘므로 `TRS_IDX`·`DIV_IDX`·`COUNT` 는 필요 없다. `LIST_BZ_TP_CD` 는 요청 명세에 없으므로 서버가 정하는 것으로 본다(§10 #3).

### 5.1 현재 수입분배기준일 조회 (`scwin.selectCurrentBasdd`)

| 항목 | 내용 |
|---|---|
| `id` | `sbm_selectCurrentBasdd` |
| `method` / `action` | `get` / `…/select-current-dist-pay-basdd` |
| `requestData` | `{ isurCd : scwin.isurCd }` |
| `target` / `gridview` | `dlt_dtlBf=body` / `grd_DIST_PAY_BF` — 명세의 응답이 `dma_std`(dataMap)로 적혀 있으나 그리드는 여러 행이다 → 목록인지 확인(§10 #1) |
| 선행 / 순서 | 신규 로딩 중. 빈 행 채우기(§6.2)보다 먼저 |
| 후처리 | 없음 (원본 `dts_DtlBf OnLoadCompleted` 는 빈 함수) |
| 실패 처리 | 공통 오류 핸들러. 화면 처리 없음 |
| 중복 실행 | 기본(건너뜀) |

### 5.2 상세 조회 (`scwin.selectOne`)

| 항목 | 내용 |
|---|---|
| `id` | `sbm_selectOne` |
| `method` / `action` | `get` / `…/select-one` |
| `requestData` | `{ bzProcsNo : scwin.bzProcsNo }` |
| `target` | `dma_mst=body`, `dlt_dtlBf=body.dtlBfList`, `dlt_dtlAf=body.dtlAfList` — 명세 이름(`dma_resultDetail`·`dlt_resultDetail_dtlBfList`·`…_dtlAfList`)에서 추정한 **가정**(§10 #1) |
| 후처리 | ① 변경후 빈 행 채우기(§6.2) ② 버튼 상태 `$c.stf.setButtonSetWithDate(edt_MKTACT_ENFORCE_DD, false, "grpBtnBox", scwin.BTN_MAP)` (원본 `dts_Mst OnLoadCompleted`) |
| 실패 처리 | `success:false` 이면 버튼을 모두 잠근다(`disabled`) — XML 기본값(전부 활성)이 남지 않게 |
| 중복 실행 | 기본(건너뜀) |

### 5.3 예약(미래일자) 중복 확인 (`scwin.checkMst`)

| 항목 | 내용 |
|---|---|
| `id` / `method` / `action` | `sbm_checkMst` / `get` / `…/select-mst-check` |
| `requestData` | `{ isurCd : scwin.isurCd }` — 원본의 `GUBUN_CD=2`(분배기준일)는 명세에 없음 |
| Return | `Promise<Boolean>` — 진행해도 되면 true |
| 후처리 | 이미 예약 건이 있으면 `MSG-0011` "현재일 이후에 이미 변경할 업무가 있습니다." 안내 후 false. **boolean 의 뜻(true = 중복 있음?)은 명세에 없다** → §10 #4 |
| 비고 | pcc `$c.lc.mstCheck` 는 AS-IS URL·미선언 전역 `Isur_cd`·1-base `getCellData(1, …)` 를 쓰므로 쓰지 않는다(§8 #13) |

### 5.4 업무처리번호 채번

- `const res = await $c.stf.getNewBzProcNo();` — 이 함수는 응답 봉투(`responseJSON`)를 그대로 돌려줄 수 있다. 화면에서 `res?.body ?? res` 를 꺼내 `String()` 으로 바꾼 뒤 14자리인지 본다. 아니면 `MSG-0010` "업무처리번호생성실패" 안내 후 중단.
- 신규 저장 API 명세는 `bzProcsNo` 를 "수정 시에만 전달"이라고 적고 있다. 채번을 화면이 하는지 서버가 하는지 확인이 필요하다(§10 #2).

### 5.5 / 5.6 신규 저장·수정 (`scwin.saveTrs(trJob)`)

| 항목 | 내용 |
|---|---|
| `id` | `sbm_saveTrs` |
| `method` / `action` | `post` / `…/insert` (I) · `…/update` (U), `mediatype : "application/json"` |
| `requestData` | `{ ...dma_mst 의 저장 키, dtlBfList : [...], dtlAfList : [...] }` — 저장 키는 `bzProcsNo`(수정 시)·`isurCd`·`chgDd`·`mktactEnforceDd`·`fiscyyChgRsnCd`·`remk`·`fiscyyChgStrtDd`·`fiscyyChgEndDd`. 목록 키 이름은 **가정**(§10 #1) |
| 목록 가공 (원본 `fn_save_trs`) | 변경전: 각 행에 `bzProcsNo`·`bybzprocsSeq = 행번호(1부터)`·`isurCd`·`chgBfafTpCd = "1"`. 변경후: `basMmdd` 가 빈 행을 빼고, 각 행에 `bzProcsNo`·`bybzprocsSeq = 행번호 + 12`·`isurCd`·`chgBfafTpCd = "2"`. **그리드의 dataList 는 고치지 않고 복사본으로 만든다**(§8 #5) |
| 후처리 | 성공: `MSG-A001` "[저장/수정] 처리 성공하였습니다." → `await scwin.selectOne()` 다시 조회(신규는 이때 수정 모드가 됨) |
| 실패 처리 | `success:false`: `MSG-A002` "[…] 처리 실패하였습니다." 신규 실패면 `scwin.bzProcsNo` 를 비워 신규 상태를 유지한다 |
| 중복 실행 | 기본(건너뜀) — 결과가 `skipped` 이면 안내 없이 끝 |

### 5.7 삭제 (`scwin.deleteTrs`)

| 항목 | 내용 |
|---|---|
| `id` / `method` / `action` | `sbm_deleteTrs` / `post` / `…/delete` |
| `requestData` | `{ bzProcsNo : scwin.bzProcsNo }` |
| 후처리 | 성공: `MSG-A001` "[삭제] 처리 성공하였습니다." → `$c.win.closePopup()` (원본 `buttonSet.status == "D"` 분기) |
| 실패 처리 | `MSG-A002` "[삭제] 처리 실패하였습니다." |
| 중복 실행 | 기본(건너뜀) |

---

## 6. 일반 함수

### 6.1 입력 검증 (`scwin.validate`) — 원본 `fn_CheckForm`

- **Return:** `Promise<Boolean>`
- **순서 (원본 그대로):**
  1. 변경후 각 행 `basMmdd = basMm + basDd`. 값이 있는데 4자리가 아니면 "입력한 항목중 [변경후(월,일)]을 정확히 입력해주세요.\n\n예 : 5월1일 -> 0501" 안내 후 false. 월·일을 두 자리씩 입력해야 한다.
  2. 변경일 8자리 아니면 "[변경일]을 정확히 입력하세요." + 포커스.
  3. 시장조치시행일: 8자리 아니면 "[시장조치시행일]을 정확히 입력하세요.", **서버 현재일 이하이면 "[시장조치시행일]을 익일 이후로 입력하세요."** (원본 `checkDdTm("DD", …, "시장조치시행", false)`).
  4. 변경사유 미선택이면 "[변경사유]를  선택해주세요" + 포커스.
  5. 기타 2000 byte 초과면 `$c.stf.checkMaxLength(txa_REMK, 2000, "기타")` 안내.
- **공통 검증으로 옮길 항목** (`$c.validate.validateDataCollect`, 규칙 24): 변경일(필수·날짜), 시장조치시행일(필수·날짜), 변경사유(필수), 기타(최대 2000 byte). 이름은 화면 라벨과 같게 적는다.
- **업무 검증으로 남길 항목**: 1(그리드 행 단위 4자리), 3 의 "익일 이후"(서버 현재일 비교).
- pcc `$c.lc.checkDdTm` 은 Gauce 속성 `obj.text` 를 읽으므로 그대로 부르면 inputCalendar 에서 길이 검사가 깨진다 → 화면에서 `getValue()` 로 비교한다(§8 #13).

### 6.2 변경후 빈 행 채우기 (`scwin.fillAfRows`)

- 원본 `dts_DtlAf OnLoadCompleted`: `for (i = CountRow; i < 13; i++) AddRow()` — 주석은 "항상 12개"지만 **실제로는 13행**이 된다(§8 #1).
- TO-BE: `while (dlt_dtlAf.getRowCount() < 13) dlt_dtlAf.insertRow();` — 행 수는 원본 동작(13)을 유지하고 §10 #11 에서 확인한다. 반복 안에서 행을 넣으므로 `setBroadcast(false)` … `setBroadcast(true, true)` 로 감싼다(규칙 28).

### 6.3 변경후 월·일 즉시 검사 (`grd_DIST_PAY_AF_onafteredit` 안)

- `basMm` 칸: `Number(값) > 12` 이면 "입력월을 확인하세요." 후 비움. `basDd` 칸: `Number(값) > 31` 이면 "입력일을 확인하세요." 후 비움.
- 원본은 `eval(문자열) > 12` 로 비교한다. 월별 말일(예: 0231) 검사는 없다 — 원본 동작 유지(§8 #4).

### 6.4 공시안내문작성 (`scwin.writeDscl`) + 부모 계약 (`scwin.getPar`)

- 원본 `fn_dscl`: `fn_GetPar` 를 잠깐 바꿔 끼우고 `CreateDialogFrame("ULDSTF92024", "/listingcommon/ULDSTF92024.gfm", "공시안내문작성", 중앙, 735, 815, "window")` 로 연 다음, 바로 원래 함수로 되돌린다(모달 대기 전제).
- 92024 전환본(`sample-front/ui/ULDSTF92024.xml`)은 로딩 때 **부모의 `scwin.getPar(arr, dlt_Isu, dlt_Mst, dlt_2, dlt_3, …)` 를 이름으로 찾아** 부른다. 따라서 TO-BE 는 함수를 바꿔 끼우지 않고, 이 화면에 `scwin.getPar` 를 고정으로 정의한다. 이 함수는 하위 팝업이 원래 이름 그대로 부르는 계약이라 개명하지 않는다.
  - `arr[0] = "68212C"` (서식코드 — 분배기준일변경 안내공시), `arr[1] = scwin.bzProcsNo`, `arr[2] = scwin.isurCd`, `arr[3] = "1"` (시장구분 유가 고정).
  - `dlt_Mst` ← `dma_mst` 1행, `dlt_2` ← `dlt_dtlBf`, `dlt_3` ← `dlt_dtlAf` 에서 월·일이 모두 빈 행을 뺀 것. 원본 `CopyDataSet` → `$c.stf.copyDataSet` 또는 `setJSON(getAllJSON())`.
  - `return arr.length;`
- 열기: `await $c.win.openPopup("/ui/listingcommon/ULDSTF92024.xml", { id : "ULDSTF92024", popupName : "공시안내문작성", width : 735, height : 815, type : "pageFramePopup" })` (규칙 17). 경로는 **가정**이다(§10 #7). 원본 `fn_getModalCenterPos` 중앙 배치는 openPopup 기본 동작에 맡긴다.
- 92024 가 받는 dataset 컬럼 이름(대문자 AS-IS vs camelCase)은 서식 `68212C` 서버 계약에 달려 있다(§10 #7).

### 6.5 기안 (`scwin.writeDraft`)

- 원본 `fn_drft`: `fn_GetPar` 를 `arr[0] = 업무처리번호` 로 바꿔 끼우고 공통 `fn_PopFindDraft()` 를 부른 다음 되돌린다.
- pcc `$c.lc.popFindDraft()` 는 `ULDSTF92004.gfm` 을 `browserPopup` + 콜백(`scwin.popupCallback`)으로 열고 **업무처리번호를 넘기지 않는다** → 그대로 쓰면 기안 대상이 빠진다. 기안 팝업의 TO-BE 계약이 정해질 때까지 TODO 로 둔다(§10 #8). 두 팝업이 모두 `getPar` 이름을 쓰면 충돌하므로, 기안 쪽은 `openPopup` data 로 넘기는 방식을 권한다.

### 6.6 저장 (`scwin.save`) — 원본 `fn_save`

1. `await scwin.validate()` 실패면 끝.
2. `await $c.lc.isProcess("I")` — `MSG-A006` "[저장] 처리를 하시겠습니까?" 확인. 취소면 끝.
3. `await scwin.checkMst()` (§5.3) — 예약 건이 있으면 끝.
4. 채번(§5.4). 실패면 `MSG-0010` 후 끝.
5. `dma_mst` 에 `bzProcsNo`·`isurCd` 를 넣는다. 원본은 `FISCYY_DISTR_BASDD_TP_CD = "2"`(1 결산기 / 2 수입분배기준일)도 넣지만, 신규 API 요청 명세에는 이 키가 없다(§10 #3).
6. `await scwin.saveTrs("I")`.

- 순서(확인 → 중복 확인 → 채번)는 원본을 유지한다. 채번이 확인보다 뒤라서 취소한 건에는 번호가 소비되지 않는다.

### 6.7 수정 (`scwin.update`) — 원본 `fn_update`

1. `await scwin.validate()` 실패면 끝.
2. 마스터나 변경후 목록이 바뀌었는지 확인한다(원본 `dts_Mst.IsUpdated || dts_DtlAf.IsUpdated`). 바뀌지 않았으면 원본 `fn_alertNoUpdate()` 안내 후 끝. pcc/stf 에는 대응 함수가 없으므로 문구 리터럴을 쓴다(§7.2). dataMap 변경 여부는 조회 직후 `getJSON()` 스냅숏과 비교하는 방식을 권한다. dataList 는 `getModifiedIndex()` 로 본다.
3. `await $c.lc.isProcess("U")` 확인.
4. `await scwin.saveTrs("U")`.

### 6.8 삭제 (`scwin.remove`) — 원본 `fn_delete`

1. `await $c.lc.isProcess("D")` 확인.
2. `await scwin.deleteTrs()` (§5.7). 원본의 `buttonSet.setDeleteStatus()` 는 응답 이벤트에서 삭제 여부를 가르기 위한 것이다. TO-BE 는 함수가 나뉘므로 필요 없다.

---

## 7. 업무 코드 · 메시지 목록

### 7.1 코드

| 용도 | 값 | 출처 |
|---|---|---|
| 결산기분배기준일구분 | `1` 결산기, `2` 수입분배기준일 (이 화면은 항상 `2`) | 원본 저장, 부모 `arr[5]`. API 명세 `select-one` 은 TO-BE 컬럼 `CHG_LIST_MKTACT_TP_CD`, 분배기준일 = `'14'` |
| 변경전후구분 `chgBfafTpCd` | `1` 변경전, `2` 변경후 | 저장 가공 |
| 업무처리별일련번호 | 변경전 1~n, 변경후 13~(12+n) | 저장 가공(`i`, `i + 12`) |
| 변경사유 `fiscyyChgRsnCd` | `1` 임시주주총회에서 결의, `2` 정기주주총회에서 결의, `9` 기타 | 원본 콤보 `cbdata` (API 명세 주석도 같음). TO-BE 사유명은 `TBLD_LIST_BZ_RSN_C`(`LIST_BZ_RSN_TP_CD='03'`) |
| 상장업무유형 | `LIST_BZ_TP_CD_232` = `"232"` 분배기준일변경 | `$c.lc.glb` |
| 안내공시 서식 | `68212C` | `fn_dscl` |
| 화면처리구분 | `01` 조회, `02` 입력, `03` 수정, `04` 삭제 | `SCREN_PROCS_TP_CD_0x` (TO-BE 미전송) |
| 처리구분 `TRS_IDX` | `1` 입력, `2` 수정, `3` 삭제, `5` 신규조회2 | `$c.lc.glb` (TO-BE 는 API 경로로 대체) |

### 7.2 메시지

| 코드 / 문구 | 등장 위치 | TO-BE |
|---|---|---|
| `MSG-A006` "[^] 처리를 하시겠습니까?" | 저장·수정·삭제 확인 (`fn_isProcess`) | `$c.lc.isProcess("I"/"U"/"D")` |
| `MSG-0011` "현재일 이후에 이미 변경할 업무가 있습니다." | 예약 건 확인 (`fn_mst_check`) | `$c.stf.getMessageParam("MSG-0011", "")` |
| `MSG-0010` "업무처리번호생성실패" | 채번 실패 | `$c.stf.getMessageParam("MSG-0010", "")` |
| `fn_alertMsg('S'/'F')` | `trs OnSuccess`/`OnFail` | pcc/stf 에 없음 → `$c.stf.getMessageParam("MSG-A001"/"MSG-A002", 처리명)` 로 대체 |
| `fn_alertNoUpdate()` | 수정할 내용 없음 | pcc/stf 에 없음 → 문구 리터럴 "변경된 내용이 없습니다."(**가정**, §10 #12) |
| "입력한 항목중 [변경후(월,일)]을 정확히 입력해주세요.\n\n예 : 5월1일 -> 0501" | 검증 1 | 그대로 |
| "[변경일]을 정확히 입력하세요." | 검증 2 | 그대로 |
| "[시장조치시행일]을 정확히 입력하세요." / "[시장조치시행일]을 익일 이후로 입력하세요." | 검증 3 (`checkDdTm` 문구) | 그대로 |
| "[변경사유]를  선택해주세요" | 검증 4 | 그대로(공통 검증으로 옮기면 공통 문구) |
| "[ 기타 ] 항목의 최대입력은 [ 2000 ] byte 입니다. …" | 검증 5 | `$c.stf.checkMaxLength` 문구 |
| "입력월을 확인하세요." / "입력일을 확인하세요." | 그리드 편집 | 그대로 |

---

## 8. 원본 특이사항 · 결함

| # | 원본에서 실제로 일어나는 일 (근거) | 전환본 처리 |
|---|---|---|
| 1 | 변경후 빈 행 루프 `for (i = CountRow; i < 13; i++) AddRow()` 는 주석("항상 12개")과 달리 13행을 만든다 | 그대로 유지(13행) + §10 #11 확인 |
| 2 | `fn_CheckForm` 과 `fn_save_trs` 첫 루프의 `i` 가 선언 없이 쓰인다(암묵 전역) | 고침 — `let` 지역 변수 |
| 3 | 모든 행 루프가 1-base(`i = 1; i <= CountRow`) | 고침 — `0 ≤ i < getRowCount()` (규칙 29) |
| 4 | 월·일 검사가 `eval(문자열) > 12` / `> 31` 뿐이라 0월·0일·월별 말일(0231)은 통과한다 | 그대로 유지(`Number()` 비교로만 바꿈) |
| 5 | `fn_save_trs` 가 전송 전에 빈 변경후 행을 **그리드 dataset 에서 지운다** → 저장이 실패하면 그리드에 빈 입력 행이 사라진 채 남는다 | 고침 — 요청 목록은 복사본으로 만들고 dataList 는 건드리지 않음 |
| 6 | 수정 판정은 `dts_Mst`·`dts_DtlAf` 의 `IsUpdated` 만 본다(변경전은 읽기 전용이라 맞음) | 그대로 유지 |
| 7 | 신규 저장이 실패해도 채번한 `fr_bz_procs_no` 가 남아, 다시 [저장]하면 새로 채번하지만 다른 분기(안내문 등)는 실패한 번호를 쓴다 | 고침 — 성공한 뒤에만 `scwin.bzProcsNo` 확정 |
| 8 | 로딩 끝에 수정 모드에서도 `ISUR_CD`·`ISUR_NM` 을 부모 값으로 덮어쓴다 | 고침 — 신규만 부모 값, 수정은 조회 응답 |
| 9 | "5. 변경 후 최초 사업연도" 시작·종료일, "변경후(월,일)" 에 필수 표시(*)가 있지만 검증하지 않는다(변경후 0건도 저장됨) | 그대로 유지 + §10 #9 확인 |
| 10 | 쓰지 않는 것: 전역 `Secugrp_id`·`Mkt_id`·`haltTpCd`·`vScrenID`, 빈 함수 `fn_makt`, 빈 이벤트 `dts_DtlBf OnLoadCompleted`, 항상 `true` 인 `CanColumnPosChange`, 주석 처리된 `CHG_DD = MKTACT_ENFORCE_DD` 대입 | 옮기지 않음 (`vScrenID` 규칙 1, 주석 코드 규칙 0) |
| 11 | 안내문 시장구분이 부모의 `Mkt_id` 와 무관하게 `'1'`(유가) 고정 | 그대로 유지 + §10 #7 |
| 12 | `fn_dscl`·`fn_drft` 가 `fn_GetPar` 를 바꿔 끼웠다가 `CreateDialogFrame` 바로 뒤에 되돌린다 — 모달 대기를 전제한다 | 고침 — `scwin.getPar` 를 고정 정의(§6.4). 기안은 data 전달(§6.5) |
| 13 | pcc 대응 함수에 Gauce 잔재: `$c.lc.mstCheck` 는 AS-IS URL·미선언 `Isur_cd`·`getCellData(1, …)`, `$c.lc.checkDdTm` 은 `obj.text` | 쓰지 않음 — 신규 API 직접 호출(§5.3), 날짜 비교는 화면에서 `getValue()` |
| 14 | 원본은 동기 처리라 연속 클릭이 막혔다. 비동기 전환본은 저장이 두 번 나갈 수 있다 | 고침 — `executeDynamic` 중복 실행 건너뜀 + `skipped` 확인 |

---

## 9. 전환 내역 (AS-IS → TO-BE)

| AS-IS | TO-BE |
|---|---|
| `gform onload` | `scwin.onpageload` → `scwin.init_recvParam` / `scwin.init_newForm` 또는 `scwin.selectOne` |
| `frame.Provider("../").fn_GetPar(arrPar)` | `$c.data.getParameter()` (§1.2) |
| 전역 `Isur_cd`·`Isur_nm`·`fr_bz_procs_no`·`trsIdx`·`vScrenTpCD` | `scwin.isurCd`·`scwin.isurNm`·`scwin.bzProcsNo`·`scwin.trJob` (`vScrenTpCD` 삭제) |
| `fn_new_onload` | `scwin.init_newForm` + `scwin.selectCurrentBasdd` |
| `fn_search` (동기 3회) | `scwin.selectOne` (`select-one` 1회) |
| `dts_Mst OnLoadCompleted` | `scwin.selectOne` / `init_newForm` 의 후처리(버튼 상태) |
| `dts_DtlAf OnLoadCompleted` | `scwin.fillAfRows` |
| `fn_CheckForm` | `scwin.validate` (+ `validateDataCollect`) |
| `fn_save` / `fn_update` / `fn_delete` | `scwin.save` / `scwin.update` / `scwin.remove` |
| `fn_save_trs` + `trs.Post()` + `OnSuccess`/`OnFail` | `scwin.saveTrs(trJob)` / `scwin.deleteTrs` — `await $c.sbm.executeDynamic` + await 뒤 후처리 (규칙 16) |
| `fn_mst_check(dts_Mst_Check, "2")` | `scwin.checkMst` (신규 API) |
| `fn_getNewBzProcNo(dts_BzProcsNo)` | `$c.stf.getNewBzProcNo()` + 봉투 `body` 추출 |
| `fn_isProcess('I'/'U'/'D')` | `await $c.lc.isProcess(...)` |
| `fn_alertMsg('S'/'F')` | `$c.win.alert($c.stf.getMessageParam("MSG-A001"/"MSG-A002", 처리명))` |
| `fn_alertNoUpdate()` | `$c.win.alert("변경된 내용이 없습니다.")` (가정) |
| `checkDdTm("DD", edt, "시장조치시행", false)` | 화면 업무 검증 (`getValue()` 와 서버 현재일 비교) |
| `checkMaxLength(txa_REMK, 2000, "기타")` | `$c.stf.checkMaxLength(txa_REMK, 2000, "기타")` 또는 `validateDataCollect` 최대 byte |
| `buttonSet.set*Info` / `setInsertStatus` | `ev:onclick` + `$c.util.setButtonState("grpBtnBox", "insert", scwin.BTN_MAP)` |
| `setButtonSetWithDate(edt_MKTACT_ENFORCE_DD, false)` | `$c.stf.setButtonSetWithDate(edt_MKTACT_ENFORCE_DD, false, "grpBtnBox", scwin.BTN_MAP)` |
| `fn_dscl` + `fn_GetPar` 바꿔 끼우기 + `CreateDialogFrame` | `scwin.writeDscl` + 고정 `scwin.getPar`(원래 이름 유지 — 92024 계약) + `$c.win.openPopup` (규칙 17) |
| `fn_drft` + `fn_PopFindDraft` | `scwin.writeDraft` (TODO — §10 #8) |
| `CopyDataSet(a, b)` | `$c.stf.copyDataSet` / `setJSON(getAllJSON())` |
| `grd_DIST_PAY_AF OnExit` | `scwin.grd_DIST_PAY_AF_onafteredit` |
| `btn_Close onclick` → `frame.CloseFrame()` | `scwin.btn_Close_onclick` → `$c.win.closePopup()` |
| `popUpCalendar2(...)` 4종, `img_*` 달력 | 삭제 (inputCalendar 내장) |
| `alert(...)` | `await $c.win.alert(...)` |
| `ds.NameString(i, "COL")` / `CountRow` / `AddRow` / `DeleteRow` | `getCellData`·`setCellData` / `getRowCount` / `insertRow` / `removeRow` (규칙 29) |
| `#include(...)` 7종, `PanelToGroupBox`, `vScrenID` | 삭제 (규칙 11·1) |
| `fn_makt`, `CanColumnPosChange`, `dts_DtlBf OnLoadCompleted` | 삭제 (동작 없음) |

---

## 10. 남은 작업 (TODO)

1. **응답·요청 구조 확정** — `select-current-dist-pay-basdd` 응답이 명세에는 `dma_std`(dataMap)로 적혀 있지만 그리드는 여러 행이다. 목록인지 확인하고 §5.1 target 을 정한다. `select-one` 응답과 `insert`/`update` 요청의 목록 키(`dtlBfList`/`dtlAfList` 가정)도 확정되면 §5.2·§5.5 를 고친다.
2. **업무처리번호 채번 주체** — 원본은 화면이 채번해 보낸다(§5.4). 신규 API 명세는 `bzProcsNo` 를 "수정 시에만 전달"이라 적고 `insert` 응답도 비어 있다. 서버가 채번한다면 응답으로 번호를 받아야 저장 뒤 다시 조회할 수 있다(§5.5 후처리).
3. **서버가 정하는 값** — `fiscyyDistrBasddTpCd`(원본 `"2"`, TO-BE 컬럼은 `'14'`)와 `LIST_BZ_TP_CD 232` 는 요청 명세에 없다. 서버에서 넣는지 확인한다(§6.6 5).
4. **`select-mst-check` boolean 의 뜻** — true 가 "예약 건 있음"인지 "진행 가능"인지 확인한다. 원본의 `GUBUN_CD=2` 를 서버가 쓰는지도 확인한다(§5.3).
5. **update·delete 성공 판정** — 응답이 비어 있다. `responseJSON.success` 만으로 판정할지, 업무 결과 코드가 있는지 확인한다(§5.5~5.7).
6. **부모(ULDSTF05620) 계약** — 부모 전환 때 `fn_GetParNew`/`fn_GetParUpdate` 의 배열을 §1.2 의 data 객체로 바꾼다. 팝업이 닫힌 뒤 다시 조회하는 흐름(`await openPopup` 뒤 `search`)도 함께 맞춘다.
7. **공시안내문(ULDSTF92024) 연동** — TO-BE 경로(`/ui/listingcommon/ULDSTF92024.xml` 가정)와 팝업 타입. 서식 `68212C` 가 받는 dataset 컬럼 이름(대문자 AS-IS / camelCase)을 확인한다. 시장구분 `'1'` 고정을 유지할지도 정한다(§6.4, §8 #11).
8. **기안(ULDSTF92004) 연동** — pcc `popFindDraft` 는 업무처리번호를 넘기지 않는다. 기안 팝업 전환본의 수신 계약이 정해지면 `scwin.writeDraft` 를 완성한다(§6.5).
9. **필수 표시와 검증 불일치** — 변경 후 최초 사업연도 시작·종료일과 변경후 기준일(0건)을 필수로 검증할지 업무 확인. 결정되면 §6.1 에 추가한다(§8 #9).
10. **화면 이력·세션 파라미터** — AS-IS 의 `SCREN_ID`·`SCREN_PROCES_TP_CD`·`fn_encodeNSession` 을 서버가 대신 처리하는지 확인한다(§5 공통).
11. **변경후 빈 행 수** — 원본은 13행이다(주석은 12). 업무상 몇 행이 맞는지 확인한다(§6.2, §8 #1).
12. **"수정할 내용 없음" 문구** — 원본 공통 `fn_alertNoUpdate` 의 정확한 문구를 확인해 §7.2 를 고친다.
13. **변경사유 목록 출처** — 고정 3종(1·2·9)을 유지할지, 상장업무사유코드(`LIST_BZ_RSN_TP_CD='03'`) 공통코드로 받을지 정한다.
14. **TO-BE 배포 경로·창 크기** — `/ui/lst/lstproc/ULDSTF05621.xml`(가정), 부모가 여는 크기 615×710.
