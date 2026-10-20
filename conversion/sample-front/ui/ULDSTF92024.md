# ULDSTF92024 공시안내문작성 — 업무 분석 및 전환 내역

| 항목 | 내용 |
|---|---|
| 원본 | `/listingcommon/ULDSTF92024.gfm` (Gauce/X-Internet, 730×785 모달 창) — 반입 `KRX_웹스퀘어_전환/반입/20261020/2026.10.20_전환/` |
| 영문 짝 | `ULDSTF92024_EN.gfm` (영문공시안내문 미리보기, 같은 구조의 영문판) |
| 전환본 | `conversion/sample-front/ui/ULDSTF92024.xml` (퍼블리싱 736f185e → 이 문서 기준 스크립트 전환) |
| 화면 캡처 | `2026-10-20 17 03 59.png`(정정공시 체크) · `2026-10-20 17 03 33.png`(미체크) — 유가 신규상장 안내문 |
| 업무공통 | `$c.stf`(getMessageParam) · `$c.print`(openReportPdf) — `cm/pcc/stf`. 게이트는 `--pcc stf` 로 돌린다 |

## 1. 업무 개요

상장처리 화면(신규상장·추가상장·상장폐지·관리종목·매매거래정지 등)에서 **시장조치 공시안내문**을 만들어 공시검토 단계로 넘기는 공용 팝업이다.

1. 호출 화면이 서식코드·업무처리번호·발행기관코드·시장구분과 공시 원천 자료(종목·회사·사유 등 dataset 최대 15개)를 넘긴다.
2. 서버(`generateDisclosureTotal`)가 서식에 원천 자료를 채워 **국문·영문 공시원문**과 **공시명**을 만든다.
3. 담당자는 원문을 확인하고(유가는 고칠 수 있음), 제목·정정공시 여부·첨부파일을 붙여 **공시검토전송**(`sendDisclosureTotal`)한다.
4. 유가증권시장 담당자는 결재란이 있는 내부 기안 형식으로 **인쇄**(PDF)할 수 있다.

### 호출 화면 (75본)

`conversion/publish` 기준 75개 화면이 `/listingcommon/ULDSTF92024.gfm` 를 연다. 대부분 상장처리(대내) `ULDSTF05xxx`(신규·추가·변경상장), `ULDSTF08xxx`(상장폐지·관리종목), `ULDSTF09xxx`, `ULDSTF70030/70034/70036`(공시), `ULDSTF92021`.

### 호출 규약 (부모 → 팝업)

부모는 팝업을 열기 직전 `getPar`/`setPar` 를 자기 함수로 바꿔 두고, 팝업은 로딩 시 부모의 `getPar` 를 부른다.

```
getPar(arr, dts_Isu, dts_Mst, dts_2, dts_3, dts_4, dts_Isu_Eng, dts_Mst_Eng, dts_Dtl_Eng, dts_Rsn_All_Eng, dts_Rsn_Rel_Eng, dts_5, dts_6, dts_7, dts_8, dts_9)
```

| arr | 의미 | 비고 |
|---|---|---|
| `arr[0]` | 서식코드 (`FORM_CD`) | 예: 신규상장 서식, `68052A` 관리종목지정 |
| `arr[1]` | 업무처리번호 | 여러 종목이면 쉼표로 이어 붙임 |
| `arr[2]` | 발행기관코드 (`ISUR_CD`) | |
| `arr[3]` | 시장구분 (1 유가 / 2 코스닥 / 6 코넥스) | 없거나 그 밖의 값이면 원공시의 시장구분 사용 |
| `arr[4]` | 생성하지 않는 서식의 본문 문구 | **배열 길이가 5 이상이면 `isNoGen`**(값이 빈 문자열이어도). 단 서식 `73033*`(BDC BB 신규상장)은 예외로 생성 |
| `arr[5]` | 공시제목 기본값 | 제목칸(`txb_frmTit`)에 넣음 |

dataset 인수는 **팝업 쪽 dataset** 이고, 부모가 `CopyDataSet` 으로 자기 자료를 복사해 채운다. 서식마다 쓰는 dataset·컬럼이 다르며 팝업은 내용을 보지 않고 그대로 서버에 넘긴다(단 `dts_Mst`·`dts_2`·`dts_3` 의 행 유무로 생성 가능 여부를 판단).

## 2. 화면 구성

| 영역 | 원본 컴포넌트 | 전환본 | 설명 |
|---|---|---|---|
| 인쇄 | `panel_PRINT` > `btn_Print` | `btn_Print` | 유가 사용자만 노출. HTML 변환 서식이면 숨김 |
| 영문공시 미리보기 | `btn_engdiscls_view`, `lbl_engdiscls_view` | (옮기지 않음) | 버튼은 항상 숨김, 라벨은 텍스트 없는 투명 라벨 더블클릭 → 사실상 진입 불가 |
| 정정공시 | `chk_CorrctYn` | `chk_CorrctYn` (checkboxgroup, `dma_disclsInf.CORRCT_YN`) | 신규공시면 비활성 |
| 정정공시 정보입력 | `pan_btn` > `btn_crt` | `btn_crt` | 유가 신규공시에서 숨김, 정정공시로 진입하면 노출. 코스닥은 항상 노출 |
| 공시검토전송 | `btn_send` | `btn_send` | |
| 닫기 | `btn_close` | `btn_close` | |
| 제목 | `txb_frmNam`(읽기전용) `(` `txb_frmTit` `)` | 같은 id, `dma_disclsInf.DISCLS_NM / DISCLS_TITLE` | 공시명은 서버 생성, 공시제목은 입력 |
| 본문 | `tar`(mxtextarea, 텍스트) + `pan`(panel, HTML) 겹침 | `edt_contn` (w2:editor) | 시장·서식에 따라 둘 중 하나만 보였다 → editor 하나로 통합 |
| 첨부파일 | `grd_Fil`(순번·화일명) + `btn_ins`(폴더) `btn_del` + `fil`(파일 컨트롤) | `grd_Fil` + `btn_ins` `btn_del` + `mpd_Fil`(multiupload, 숨김) | |
| 디버그 | `log` (폭 0 textarea) | (옮기지 않음) | 응답 원문을 담던 보이지 않는 영역 |

## 3. 데이터셋

| 원본 | 전환본 | 내용 |
|---|---|---|
| `dts_Inf`, `dts_Inf_Eng` | `dlt_Inf`, `dlt_InfEng` | 공시 기본정보 1행: `ISUR_CD`, `BZ_PROCS_NO`, `ACPT_NO`(원공시번호), `SPOT_ISU_TRD_MKT_TP_CD`, `DISCLS_TITLE`, `FORM_CD`(영문은 `_EN` 접미), `CORRCT_YN`. 헤더는 전문 `INF_INOUT`. 정정공시정보입력 팝업이 여기에 정정 정보를 채운다 |
| `dts_Rst`, `dts_Rst_Eng` | `dlt_Rst`, `dlt_RstEng` | 공시원문 — **한 행이 원문 한 줄**(`HTML_CONTN`). 전문 `RESULT_HTML_INOUT` |
| `dts_Tit` | `dlt_Tit` | 공시명(`DISCLS_TITLE`). 전문 `RESULT_TITLE_INOUT` |
| `dts_Ori` | `dlt_Ori` | 원공시: `ACPT_NO`, `SPOT_ISU_TRD_MKT_TP_CD`, `MOD_YN`(Y = 이미 공시됨). 전문 `GENDISCLS_ORI_DISCLS_ACPT_INOUT` |
| `dts_Fil` | `dlt_Fil` | 첨부파일: 원본 `fileInfo:String, fileUrl:URL`(URL 형 컬럼이 파일 본문을 실어 보냄) → 전환 `fileInfo`, `fileSz` + 파일 본문은 `mpd_Fil` |
| `dts_Isu`, `dts_Mst`, `dts_2`~`dts_9`, `*_Eng` 5종 | `dlt_Isu`, `dlt_Mst`, `dlt_2`~`dlt_9`, `dlt_IsuEng`·`dlt_MstEng`·`dlt_DtlEng`·`dlt_RsnAllEng`·`dlt_RsnRelEng` | 부모가 채우는 원천 자료. 컬럼 미정(부모 복사 시 헤더 함께) |
| `dts_Print` | (응답 값 직접 사용) | 인쇄용 회사명 `COM_NM` |
| `dts_Print_BODY` | (삭제) | 쓰지 않음(주석 처리된 코드에서만 참조) |

## 4. 처리 흐름

### 4.1 로딩 (`gform onload` → `scwin.init`)

1. 사용자 소속시장(`js_market`)이 2·6 이면 인쇄 버튼을 숨긴다(1 이면 보임).
2. 각 결과 dataset 헤더를 전문 정의로 초기화(`getGauceDataHeader`) — 전환본은 dataCollection 선언으로 대신한다.
3. 부모의 `fn_GetPar`(전환 호출부는 `scwin.getPar`)가 없으면 **아무것도 하지 않는다**(빈 화면).
4. `arr` 로 키를 받고, 서식코드가 **HTML 변환 대상 서식**(§6.1)인지 확인한다.
5. 업무처리번호로 **원공시 조회**(동기).
6. 상장시장 결정: `arr[3]` 이 1·2·6 이면 그 값, 아니면 원공시의 `SPOT_ISU_TRD_MKT_TP_CD`.
7. 시장별 화면 모드:

| 조건 | 본문 | 인쇄 | 정정공시 정보입력 | 이미 공시됨(`MOD_YN=Y`) | 신규공시 |
|---|---|---|---|---|---|
| 유가(1), 또는 코스닥·코넥스(2·6)의 **기타시장안내 `70837*`** — HTML 변환 서식 아님 | 텍스트(`tar`), **수정 가능** | 보임(유가 사용자) | 숨김 | MSG-0907 확인 → 체크 + 정정공시정보입력 팝업 + 버튼 노출 | 체크박스 비활성 |
| 위와 같으나 HTML 변환 서식 | HTML(`pan`) | **숨김** | 숨김 | 위와 같음 | 비활성 |
| 코스닥·코넥스(2·6) | HTML(`pan`) | (사용자 시장 기준) | 보임 | MSG-0907 확인 → 체크 + 정정공시정보입력 팝업 | 비활성 |
| 그 밖 | 둘 다 보임(원본 결함, 본문 비어 있음) | — | 보임 | — | — |

8. 영문공시 대상 서식(§6.3)이면 영문 미리보기 라벨을 보이게 하지만, 라벨에 텍스트가 없어 실제로는 보이지 않는다.
9. 공시안내문 생성(§4.2).

### 4.2 공시안내문 생성 (`fn_genDisclsTotal` → `scwin.genDiscls`)

- 서식코드·발행기관코드·업무처리번호 중 하나라도 비면 **MSG-0908**.
- `dts_Mst`·`dts_2`·`dts_3` 중 행이 있으면:
  1. `dts_Inf`/`dts_Inf_Eng` 1행에 키·원공시번호·시장구분·공시제목·서식코드(영문 `_EN`)·정정구분을 채운다.
  2. `generateDisclosureTotal` 호출 → `dts_Rst`·`dts_Rst_Eng`·`dts_Tit` 수신.
  3. 성공 시(`OnSuccessAfterSearch`) `dts_Rst` 각 행을 줄바꿈으로 이어 본문에 넣는다 — 텍스트 모드는 `tar.text`, HTML 모드는 `pan.innerHTML`. 공시명을 `txb_frmNam` 에.
- 행이 없고 `isNoGen` 이면: 공시명만 조회(`dsclname.select`, 오늘·서식코드)하고, 본문에 `arr[4]` 문구를 넣는다.
- 둘 다 아니면 **MSG-0908**.
- `arr[5]`(공시제목)가 있으면 제목칸에 넣는다.

재생성 시점: 로딩 직후, 정정공시 체크 클릭, 정정공시 정보입력 팝업 종료 후.

### 4.3 정정공시 정보입력 (`fn_getCrtInfo` → `scwin.openCrtInfo`)

`ULDSTF92019.gfm`(정정공시정보입력, 735×270 모달)을 연다. 하위 팝업은 이 화면의 `fn_getPar(arr)` 로 `arr[0]=dts_Inf`, `arr[1]=dts_Inf_Eng` 를 받아 정정 정보를 기록한다(`fn_setPar` 는 빈 함수). 닫히면 안내문을 다시 생성한다.

### 4.4 공시검토전송 (`btn_send` → `fn_sendDisclsTotal` → `scwin.sendDisclsTotal`)

1. 유가 **관리종목지정**(`68052`~`68052F`) 서식이면 확인절차 대상법인 지정 안내, **관리종목지정해제**(`68053`~`68053F`)면 지정해제예정일 확인 안내를 띄운다.
2. **MSG-0024** "공시검토단계로 전송하시겠습니까?" 확인.
3. `dts_Rst`·`dts_Rst_Eng` 1행을 XHTML 1.0 Transitional DOCTYPE 선언으로 바꾼다.
4. `isNoGen` 이거나 기본정보의 시장이 유가(1)이고 HTML 변환 서식이 아니면, **화면 텍스트를 줄 단위로 `dts_Rst` 에 다시 담는다**(`txt2dts`, 줄 끝 CR 제거) — 담당자가 고친 내용이 전송되는 경로.
5. `dts_Rst` 가 비어 있거나 키가 없으면 "원본 DATASET이 존재하지 않아 공시문서를 생성할 수 없습니다."
6. 기본정보 재설정 후 `sendDisclosureTotal` 호출(기본정보·원문·첨부·종목·영문 기본정보·영문 원문).
7. 성공 시 **MSG-0001** 후 창 닫기, 실패 시 **MSG-0002**.

### 4.5 인쇄 (`fn_print` → `scwin.printDiscls`)

- 보고서: ELW 상장폐지예고·상장폐지(`68956C`, `68955C`) → `RLDSTF00004_1`(결재란 없음), 그 밖 → `RLDSTF00004`.
- 결재란(로그인 부서코드 `js_dep_cd`):

| 부서 | DEP_NM_1 | DEP_NM_2 |
|---|---|---|
| `2B*` 유가증권 상품상장팀 | 확인 | 팀장 |
| `2615` 기업심사팀 | 팀장 | 상장부장 |
| `26*` (2615 제외) | 팀장 | 공시총괄팀 |
| `25*` | 팀장 | 상장부장 |
| 그 밖 | 팀장 | 공시총괄팀 |

- 회사명: `inner.draft.print.condition` 쿼리(발행기관코드)의 `COM_NM`.
- 제목: 공시명, 공시제목이 있으면 `공시명 (공시제목)`.
- 본문: 텍스트 영역의 줄바꿈 → `<br>`, 공백 → `&nbsp;`. 빈 값은 `&nbsp;`.
- `fn_open_report_pdf(보고서, [DEP_NM_1, DEP_NM_2, ISUR_CD, COM_NM, TITLE, BODY])`.

### 4.6 첨부파일

- 폴더 버튼: 행 추가 → 파일 컨트롤 열기 → 고르면 `fileInfo` 에 경로, 취소하면 행 삭제.
- 삭제 버튼: 현재 행 삭제.
- 전송 시 `pFil=dts_Fil` 로 함께 보낸다(URL 형 컬럼으로 파일 본문 전송).

## 5. 서버 통신

| 용도 | AS-IS | 입력 | 출력 | 전환본 (TODO: API 확정) |
|---|---|---|---|---|
| 원공시 조회 | `listingCommon.do?method=listGeneral` `queryId=lds.stf.lstproc.marketaction.oridiscls.select` `{P}P1~P3=업무처리번호` | | `GENDISCLS_ORI_DISCLS_ACPT_INOUT` → dts_Ori | `scwin.selectOriDiscls` GET `/api/listing/listingcommon/disclosure/ori-discls` |
| 공시명 조회 | `listGeneral` `queryId=lds.stf.lstproc.marketaction.dsclname.select` `{P}1=오늘 {P}2=서식코드` | | `RESULT_TITLE_INOUT` → dts_Tit | `scwin.selectDisclsName` GET `.../discls-name` |
| 공시 생성 | `listingCommon.do?method=generateDisclosureTotal` | `pInf, pIn0~pIn14, pInfEng` | `pOut`(Rst), `pRstEng`, `pTit` | `scwin.generateDisclsTotal` POST JSON `.../generate` (요청 키 = 원본 파라미터명) |
| 공시 전송 | `listingCommon.do?method=sendDisclosureTotal` | `pInf, pRst, pFil, pIsu, pInfEng, pRstEng` | | `scwin.sendDisclsTotal` multiupload `.../send` (`sendDisclosureRequestDto` JSON + 파일) |
| 인쇄 조건 | `listGeneral` `outputMessageId=INSIDE_DRAFT_PRINT_OUT` `queryId=lds.stf.lstproc.lstlst.select.inner.draft.print.condition` `{P}param01=발행기관코드` | | `COM_NM` | `scwin.selectPrintCondition` GET `.../print-condition` |

AS-IS 는 모든 호출에 `SCREN_ID=ULDSTF92024.gfm` 과 화면처리구분(`01` 조회 / `02` 입력 / `05` 인쇄)을 붙이고 `fn_encodeNSession` 으로 세션 정보(사번·부서·시장·증권그룹 등)를 URL 에 덧붙였다. 전환본은 세션 정보를 서버가 인증 세션에서 얻는다고 보고 넘기지 않는다 — 접근로그용 화면처리구분이 필요하면 API 확정 때 함께 정한다.

## 6. 서식코드 목록

### 6.1 HTML 변환 대상 (유가 서식이지만 HTML 로 보여 주고 인쇄 불가) — 2011.08.16

매매거래정지·해제 `68060` `68061` `68061C` `68054` · 수익증권 `68918` `68919A` `68919B` `68920` · 신주인수권증권 `68921` `68922A` `68922B` `68923` · 신주인수권증서 `68924` `68925A` `68925B` `68916` · 관리종목지정 `68052`~`68052F` · 사유변경 `68055`~`68055F` · 지정해제 `68053`~`68053F` · ETF `99350` `99351` `99352` · 상장형 수익증권 `69805` `69806` `69807` · `68059` `68056` `68064` `68065` · 상장폐지 `68051A` `68051B` `68913` `68917` `68909` `68909A` · 결산기·분배기준일 변경 `68212A` `68212B` `68212C` · 업종변경 `68058` · 존립기간변경 `68066` · ETN LP 보유량 `68377`

### 6.2 전송 전 안내 대상

- 관리종목지정(유): `68052` `68052A`~`68052F` → 확인절차 대상법인 지정 조치 확인
- 관리종목지정해제(유): `68053` `68053A`~`68053F` → 지정해제예정일 확인

### 6.3 영문공시 대상 (미리보기 라벨 노출 조건 — 실제로는 보이지 않음)

`68051A/B`, `68052*`, `68053*`, `68055*`, `68060`, `68054`, `70769`, `70746*`, `70750*`, `70747*`, `70748*`, `70749*`, `70797`~`70799`, `32007`, `32010`~`32012`, `68065` `68064` `68059`, `99350`~`99352`, `69805`~`69807`. 영문 원문 자체는 서식과 무관하게 항상 함께 생성·전송된다.

### 6.4 기타 분기 서식

- `70837*`: 코스닥·코넥스 기타시장안내 — 유가처럼 텍스트 수정 가능
- `73033*`: BDC BB 신규상장 — `arr[4]` 가 있어도 서버 생성
- `68955C` `68956C`: ELW 상장폐지 — 결재란 없는 보고서

## 7. 원본 특이사항·결함

| # | 내용 | 전환본 처리 |
|---|---|---|
| 1 | `stKeyTit` 미선언(선언은 `sKeyTit`) — 암묵 전역으로 동작 | `scwin.keyTit` 로 선언 |
| 2 | `btn_send` 가 이미지 경로 `btn_send_dscl_d.gif` 로 중복전송을 막으려 했으나 그 경로로 바꾸는 코드가 주석 처리됨 → 가드 무효 | 가드 삭제(전송 성공 시 창이 닫히므로 중복전송 경로 없음) |
| 3 | 시장이 1·2·6 어느 것도 아니면 `tar`·`pan` 이 겹쳐 보이고 본문을 채우지 않음 | 기본 텍스트 모드, 본문 비움(원본과 같이 채우지 않음) |
| 4 | 영문공시 미리보기 진입점이 사실상 없음(§2) | 옮기지 않음. 필요하면 `ULDSTF92024_EN` 전환 후 버튼 추가 |
| 5 | `fn_print` 의 본문은 `tar.text` 기준이라 HTML 모드에서는 빈 본문으로 인쇄됨 — 단 HTML 변환 서식은 인쇄 버튼을 숨기고, 코스닥 사용자는 인쇄 버튼이 없으므로 실사용 경로는 텍스트 모드뿐 | editor 텍스트 기준으로 같게 처리 |
| 6 | 전송 시 원문 1행을 DOCTYPE 으로 **덮어씀** — 텍스트 모드는 직후 `txt2dts` 가 다시 채워 영향 없음, HTML 모드는 서버 생성 원문 첫 줄이 DOCTYPE 이라는 전제 | 그대로 유지 |
| 7 | 정정공시 체크박스 클릭은 재생성만 하고 `정정공시 정보입력` 버튼 노출은 바꾸지 않음 | 그대로 유지(버튼 노출은 로딩 시 결정) |

## 8. 전환 내역 (AS-IS → TO-BE)

| AS-IS | TO-BE |
|---|---|
| `gform onload` | `scwin.onpageload` → `scwin.init` |
| `frame.Provider("../").fn_GetPar` | `$c.win.getParent()?.scwin.getPar` (전환된 호출부 이름) |
| `stKey*`, `isNoGen`, `formTrnsCodeYN` | `scwin.key*`, `scwin.isNoGen`, `scwin.isHtmlTrnsForm` |
| `tar` / `pan` + `style.display` | `edt_contn` + `scwin.contentMode`(text/html) — 텍스트는 `scwin.setContentText`/`getContentText`(문단·nbsp 변환) |
| `tar.text = s` / `pan.innerHTML = s` | `scwin.setContentText(s)` / `edt_contn.setHTML(s)` |
| `fn_genDisclsTotal` / `OnSuccessAfterSearch` | `scwin.genDiscls` / `scwin.showDiscls` |
| `fn_sendDisclsTotal` / `OnSuccessAfterSave` | `scwin.sendDisclsTotal` / `scwin.mpd_Fil_onComplete` |
| `trs.Post()` + `OnSuccessAfter` 함수 포인터 | `await $c.sbm.executeDynamic` (생성), `mpd_Fil.startUpload` (전송) |
| `trs OnFail` → MSG-0002 | 조회·생성은 공통 오류 핸들러, 전송은 `scwin.mpd_Fil_onerror` |
| `dts_*.DataID + reset()` (동기 조회) | `await $c.sbm.executeDynamic` |
| `fn_getCrtInfo` (모달) + 이어서 재생성 | `await scwin.openCrtInfo()`(`$c.win.openPopup`, pageFramePopup) → `scwin.genDiscls` |
| `fn_getParCrt` / `fn_setParCrt` | `scwin.fn_getPar` / `scwin.fn_setPar` — 하위 팝업이 부르는 이름이라 원본 이름 유지(게이트 `fn_ def` 보고 2건은 의도) |
| `txt2dts` | `scwin.textToRows` |
| `fn_print`, `js_dep_cd` 분기 | `scwin.printDiscls` + `scwin.getApprovalNames($c.session.getUserInfo("depCd"))` |
| `fn_open_report_pdf` | `$c.print.openReportPdf` |
| `js_market` | `$c.session.getUserInfo("market")` |
| `getMessageParam` | `$c.stf.getMessageParam` |
| `alert` / `confirm` | `await $c.win.alert` / `await $c.win.confirm` |
| `frame.CloseFrame()` | `$c.win.closePopup()` |
| `fil.open()` + `dts_Fil(fileUrl:URL)` | `$c.util.onUploadClick(mpd_Fil)` + `scwin.mpd_Fil_selectCallback` (ULDSTF07404 패턴) |
| `cGetToday2()` | `$c.date.getServerDateTime()` |
| `fnSplitString` | 삭제 — 정의만 있고 호출 없음 |
| `log.Text = dts_Rst.Text` | 삭제 — 보이지 않는 디버그 영역 |

## 9. 남은 작업 (TODO)

1. **서버 API 확정** — §5 의 5개 경로·요청/응답 구조(`target` 의 `body.pOut` 등)는 가정이다. 확정되면 `action`·`target`·요청 키를 바꾼다.
2. **호출부 계약 확인** — 전환된 호출 화면은 `scwin.getPar` 를 팝업을 연 직후 원래 함수로 되돌린다(`scwin.getPar = OldGet`). Gauce 모달은 창이 닫힐 때까지 멈췄지만 `openPopup` 은 멈추지 않으므로, 팝업이 로딩되며 부르는 시점에는 이미 되돌아가 있을 수 있다. 호출부를 `await $c.win.openPopup(...)` 뒤에 되돌리도록 고치거나, 인수를 `openPopup` 의 data 로 넘기는 방식으로 바꿔야 한다.
3. **`$c.stf.copyDataSet` 은 아직 Gauce API**(`ClearData`/`ImportData`/`ExportData`) 기반이라 WebSquare dataList 에서 동작하지 않는다 — 호출부가 원천 자료를 팝업 dataList 로 넘기는 경로 전체가 이 공통함수에 달려 있다.
4. **ULDSTF92019(정정공시정보입력) 전환** — 경로(`/ui/lst/common/ULDSTF92019.xml` 가정)와, 하위 팝업이 `$c.win.getParent().scwin.fn_getPar` 로 dlt_Inf 를 받아 정정 정보 컬럼을 채우는 규약을 맞춰야 한다. 정정 정보 컬럼이 `INF_INOUT` 에 더 있으면 `dlt_Inf`/`dlt_InfEng` 에 추가한다.
5. **HTML 모드 editor 읽기전용** — 원본 `pan` 은 보기 전용이었다. HTML 모드에서 editor 를 고쳐도 전송에 반영되지 않으므로, editor 의 읽기전용 API 를 확인해 HTML 모드에서 잠그는 것이 맞다(이 저장소 엔진 번들에 editor 플러그인이 없어 확인 못 함).
6. **텍스트 왕복 확인** — 텍스트 모드는 원문을 `<p>` + `&nbsp;` 로 넣고 꺼낼 때 문단을 줄바꿈으로 되돌린다. CKEditor 가 빈 문단·연속 공백을 어떻게 저장하는지 실화면에서 원문과 전송 원문이 같은지 확인한다.
7. **화면처리구분·세션 파라미터** — §5 끝 참조.
8. **영문공시 미리보기** — 필요하면 `ULDSTF92024_EN` 전환 후 진입 버튼 추가(§7-4).
