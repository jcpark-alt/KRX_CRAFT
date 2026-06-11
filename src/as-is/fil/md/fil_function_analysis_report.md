# 📊 fil 폴더 함수 추출 및 분류 마스터 리포트

> `src/as-is/fil`(root/bnf/inf) 의 모든 화면 함수(`scwin.*`)를 추출하여 이관/삭제 여부를 분류한 마스터 문서.
> TO-BE 공통 위치: `src/gcc`(공통이관) · `src/as-is/fil/gcc`(업무공통 `$c.fil`/`$c.trk`/`$c.print`) · `$c.ins`(ins 동일 사본 재사용). **본 문서는 분석 가이드이며 원본 소스는 수정하지 않는다.**

## 집계 요약

- **분석 대상:** `src/as-is/fil` 111개 `.xml` (root 45 + `bnf` 30 + `inf` 36), **약 1,316개** `scwin.* = function` 정의(기계적 인벤토리 기준 — minified jQuery/서드파티 라이브러리 본체 포함).
- **분류 규칙:** A그룹(삭제) = A1 달력 · A2 레이아웃(resize/position/키이벤트·포커스·iframe) · A3 패널 style · A4 파일·엑셀 다운로드 · A5 진행바/로딩 / + jQuery·Flash·ActiveX·서드파티(dTree/datejs/Miya/aes/jQuery-UI)·미사용 stub. B그룹 = 공통이관(기존 gcc 매핑) · 업무공통(gcc 미매핑).
- **범위 주의:** 화면 간 호출 대상인 `scwin.*` 함수만 의미 단위로 집계한다. minified 내부 1글자 심볼·prototype 확장은 이관 단위가 아니므로 제외.
- **규모 특성 — fil 의 본질:** `fil` 루트/bnf/inf 의 `scwin.*` 정의는 **대부분 ins/stf 와 동일·사촌 사본**(`calendar`/`layer`/`JCommon`/`function`/`common`/`number_format_kor`/`trans`/`sessionTimer`/`logger_tracking`/`report`)이거나 **화면 전용 비즈니스 로직**이다. fil 고유 가치는 ① 필링 입력화면 공통(소수점 콤마·처리 가드·제출 시간대), ② ELW 발행검증·예심 재무/주주 계산, ③ 채권(bnf) 업무규칙에 집중된다. 그 중 **여러 화면이 재사용하는 핵심만** `$c.fil`(7개)로 선별 이관하고, 나머지는 카탈로그화한다. inf(설정화면 7종)은 **자체 함수 0개**(선언형 화면)로, 전부 공통 사본 파일의 함수를 호출한다.

| 분류 | 함수 수(약) |
| :--- | ---: |
| A그룹(삭제/제외) — 달력·레이아웃·진행바·jQuery/서드파티/Flash 등 | 약 720 |
| B-공통이관(gcc 매핑) — 문자/숫자/날짜/검증/원시XHR/세션 | 약 380 |
| B-업무공통(gcc 미매핑) — 필링/ELW/예심/채권 비즈니스 | 약 216 |
| **합계** | **약 1,316** |

---

## 1. 순수 A그룹 / 라이브러리 파일 — 파일 단위 요약 (전체 삭제/제외)

해당 파일의 모든(또는 대부분) 함수가 A그룹(또는 프레임워크 산출물)이므로 개별 나열 대신 요약한다. root/bnf/inf 동명 사본은 묶어 표기.

| 원본 파일(트리) | 함수 수 | 분류 | 삭제/제외 사유 |
| :--- | ---: | :---: | :--- |
| `calendar.xml` (root/bnf/inf) | 각 29 | **삭제** | [A1] 달력 위젯(월/년 네비·휴일·렌더링), ins/stf 사본(+`setCalendarMode`) |
| `calendar_fil.xml` (root/inf) | 각 26 | **삭제** | [A1] 필링용 팝업 달력 |
| `layer.xml` (root/inf) | 각 30 | **삭제** | [A2/A3] 좌측메뉴/도움말/폴더 레이어 display 토글 |
| `filing_progress.xml` (root/bnf) | 4/3 | **삭제** | [A5] 진행바(`createBar`/`startBar`/`togglePause`) |
| `filing_editor.xml` (root) | 3 | **삭제** | ActiveX XForm 에디터 `document.write` |
| `flashcall.xml` (root) | 6 | **삭제** | Flash `<object>/<embed>` 생성(폐기) |
| `etc.xml` (root) | 1 | **삭제** | [A2] `frameSize` iframe 리사이즈 |
| `jquery-1.8.3.min.xml` (root) | 25 | **제외(프레임워크)** | jQuery 1.8.3 번들(minify 내부심볼) — orphan publicInfo 정리 |
| `jquery*.xml` / `jquery.plugin.xml` / `jquery.ui.xml` / `*.min.xml` (bnf/inf) | — | **제외(프레임워크)** | jQuery/jQuery-UI/placeholder/idTabs/bxslider/modernizr 번들 |
| `dtree.xml` (root/bnf) | 2 | **제외(서드파티)** | dTree 트리 위젯. WS003 인코딩(저작권 헤더 `Geir Landrø` 의 `ø`) 복원 |
| `date.xml` (root/bnf) / `vendor/*` | 0 | **제외(라이브러리)** | datejs(`Date.prototype` 확장), AES(CryptoJS) |
| `form_validator.xml` (root/bnf/inf) | 0 | **제외(서드파티)** | Miya 폼검증 플러그인(prototype 기반) |
| `showModalDialog*.xml` (bnf) | 0~2 | **제외(폐기)** | `showModalDialog` 브라우저 shim |
| `creditGradSetting`/`currencySetting`/`instTypeSetting`/`emailDomainSetting`/`telnumberSetting`/`LiqAssTypeSetting`/`byinstCreditValuGrdSetting` (inf) | 0 | **N/A** | inf 설정화면 — 선언형(함수 정의 없음), 이벤트는 공통 사본 함수에 바인딩 |

> jQuery 번들의 `publicInfo` 는 WebSquare IDE 가 minify 대입(`scwin.i = e.document` 등)을 자동 등재한 garbage 다. WS201 제거를 위해 정의 없는 orphan 항목을 publicInfo 에서 제거했다(삭제 규칙: 사촌 모듈 `cm/gcc/win.xml` 의 orphan publicInfo 정리 규칙 계승).

---

## 2. 공통이관(원시 통신/세션) 파일

### `trans.xml` / `filing_trans.xml` (각 7, root) · `bnf/trans.xml` (7) — 레거시 원시 XHR → `$c.sbm`/`$c.data`

| 함수명 | 기능 설명 | 분류 | 매핑 대상(TO-BE) |
| :--- | :--- | :---: | :--- |
| `getXMLHttpRequest` | XHR 객체 생성 | **공통이관(대체)** | `$c.sbm.*` |
| `requestXMLHTTP` / `requestAsyncXMLHTTP` | 동기/비동기 XHR 전송 | **공통이관(대체)** | `$c.sbm.execute` |
| `responseTextXMLHTTP` / `sendMessage` | XHR 응답텍스트/코어 | **공통이관(대체)** | `$c.sbm.*` |
| `onCompleteResponse` | 응답 핸들러(빈 stub) | **삭제** | N/A |
| `formData2QueryString` | 폼 → 쿼리스트링 | **공통이관** | `$c.data.serializeFormToQueryString` |

### `sessionTimer.xml` / `sessionTimerOuter.xml` (root) · `bnf/sessionTimer.xml` — 세션 → `$c.session`

`startTimer` / `req4sessionExtn` / `restartTimer` / `initTime` → **공통이관** `$c.session.sessionCheck` (jQuery 의존 제거 후 통합). `sessionTimerOuter` 는 외부프레임판(`req4sessionExtn`/`startTimer`).
> `sessionTimer.xml` 의 `showKindEditor`/`hideKindEditor` 는 [A2/A3] 에디터 표시토글 → 삭제.

---

## 3. 혼합/업무 파일 — 함수별 분류 (요약 발췌)

> 전수 분류는 방대하므로 파일별 **대표 분류와 핵심 업무공통 함수**를 정리한다. 상세 시그니처/매핑은 [`gcc_mapping_and_biz_common.md`](./gcc_mapping_and_biz_common.md) 참조.

### 3.1 root — 필링 공통/입력

#### `currentTime.xml` (7) — 공시 제출 가능 시간
- **업무공통 → `$c.fil`:** `timeGuBun`(제출 시간대 판정 → **`getSubmitGubun`**, 순수 함수화).
- **삭제[A]:** `getClosedVal`(`$.ajax`), `checkCanSubmit(_BeforeLogin/_Sub)`(`$('#submitCondition').text()/.css()`, 재귀 setTimeout), `fn_SetCurrentTime`(`innerHTML` 시계). `fn_GetCurrentTime` 는 화면 진입 글루(별도 관리).

#### `digitalNumberFormat.xml` / `etnNumberFormat.xml` / `lossLimitEtnNumberFormat.xml` (15/15/16, **3중 사본**) — 숫자/콤마
- **업무공통 → `$c.fil`:** `fn_ObjValueSetComma`(→`objSetComma`), `fn_ObjValueResetRmComma`(→`objRmComma`), `fn_ObjValueResetRmComma2`(→`objRmComma2`), `fn_SetComma`(→`setComma`), `fn_DelComma`(→`delComma`), `fn_RmComma`(→내부 `__rmComma`). **소수점·음수 허용**이 gcc 정수 포맷과 다른 핵심 차이.
- **공통이관:** `fn_NumberFormat`/`fn_ValueSetComma`/`fn_insertComma`/`fn_removeComma`(화면 form 순회 변형)→`$c.num.formatNumber`, `fn_checkNum(2)`/`fn_checkNumFormat`→`$c.num.isNumber`, `fn_AddZero`→`$c.str.lpad`.
- **삭제[A]:** `fn_OnlyNum`(키이벤트 입력제한)[A2].

#### `digitalFormValidate.xml` / `etnFormValidate.xml` / `lossLimitEtnFormValidate.xml` (12/11/13, **3중 사본**) — 폼검증
- **공통이관:** `fn_getCheckByte`/`fn_getAsciiLength`/`fn_checkLength(2/3)`→`$c.str.getByteLength`, `getCurrentDate`→`$c.date.formatDate`, `fn_checkPhoneNumber`→`$c.str.isPhone`, `fn_checkEmail`→`$c.str.isEmail`, `fn_checkNumber`→`$c.num.isNumber`, `fn_checkDate`→`$c.validate.isValidDate`.
- **업무공통(화면 전용):** `fn_validate`(도메인별 폼 전체검증 오케스트레이터), `chkLpVal`(LP 검증), `fn_getBzDate`(영업일 서버조회), `fn_getFileNm`.

#### `digitalApplList.xml` / `etnApplList.xml` / `lossLimitEtnApplList.xml` (5/5/6, **3중 사본**) — 신청목록
- **업무공통 → `$c.fil`:** `fn_isProcess`(저장/수정/삭제/제출 confirm → **`confirmProcess`**).
- **공통이관:** `getCookie`→`$c.util.getCookie`.
- **업무공통(화면 전용):** `fn_DigitalSelectSub`/`fn_EtnSelectSub`(다중제출 조회), `fn_procsBefIdxEarCheck`(사전지수손익).
- **삭제[A4]:** `fn_*ExcelDownload`/`fn_*ExcelUploadPop`.

#### `common.xml` (39, root) — ins `filing_common.xml` 사촌
- **공통이관:** `fn_Trim`→`$c.str.trim`, `removeChar`/`fn_IgnoreSpaces`→`$c.str.replaceAll`, `isMinusNum`/`fn_IsNumber`→`$c.num.isNumber`, `getOnlyNum`→`$c.num.unFormatNumber`, `moneyType`→`$c.num.formatNumber`, `fn_IsNull`/`fn_NullChk`→`$c.util.isEmpty`, `fn_IsNotNull`→`$c.util.isNotEmpty`, `fn_CheckEmail`→`$c.str.isEmail`, `fn_IsExceedMaxLen`/`fn_CheckByte`/`fn_GetByte`/`fn_CalcContn`→`$c.str.getByteLength`, `fn_CheckDate(Gn)`→`$c.validate.isValidDate`, `fn_PopManual`→`$c.win.openPopup`.
- **삭제[A]:** `fn_ChkZipCd`/`fn_ChkNumber(2)`/`fn_ChkNoneNum`/`fn_ChkAlphaNum`(키이벤트 입력제한)[A2], `fn_ReplaceKeyword`(document.write), `fn_getFileSize`(ActiveX), `blockLoading`[A5].
- **업무공통(화면 전용):** 라디오/체크박스 유틸(`fn_IsChecked`, `fn_GetCheckedValue`, `fn_GetMultiCheckedValue`), 전화/이메일 분리세팅(`fn_SetPhoneValue`, `fn_SelEmail`, `fn_SetEmaileValue`), 기간 프리셋(`fn_ClickPeriod`, `fn_SetPeriod`), 연락처 검증(`fn_ChkContactpnt`).

### 3.2 root — ELW / 예심(prelist) / 디지털·상장조사

#### `elwCheck.xml` (16) — ELW 발행검증 핵심(전량 업무공통)
`kospiYn`, `setElwKoValuPrcMethd`, `setElwExerContn`, `setElwKoExerContn`, `setElwKoBasPrc`, `setElwExpValuPrcMethd`, `setElwCompnsRt`, `setIsuExp`, `fn_IsuCheckValues`, `LpCheckValues`, `fn_ulyCheck`, `fn_checkElwKoBasPrc`, `fn_checkElwCompnsRt`, `fn_checkIsuExp`, `fn_checkElwKoExerContn`, `fn_setElwKoExerContnByRghtTpCd` → **업무공통(화면 전용, ELW 도메인)**.

#### `elw.xml` (29) — ELW 목록/검증
- **업무공통:** `fn_ElwPageSearch`/`fn_ElwSub`/`fn_ElwChangePage`(목록·페이지), `batchElwSubmit`, `fn_isPossibleSave`/`fn_chkElwPrc`/`fn_chkSaveElwPrc`(가격/저장), `fn_IsValid(Arr/Date/ArrDate/Select)`(필수입력 검증).
- **공통이관:** `Chk_Percent`→`$c.num.isNumber`.
- **삭제[A]:** `fn_openCalendar`[A1], `Chk_Digit_Point`/`Chk_Sosu_Point_*`(소수점 키이벤트 제한)[A2].

#### `elw05012~05027.xml` (1~5씩) · `prelist05002~05004.xml` — 콤마 일괄/재무·주주 계산
- **공통이관:** `fn_CommaValueAll`/`fn_RmCommaValueAll`(화면 필드 하드코딩 변형)이 호출하는 코어는 `$c.fil.objSetComma`/`objRmComma`(§2 위), 단순 포맷은 `$c.num.*`.
- **업무공통(화면 전용):** `fn_issSchdCheckValues`(발행일정 검증), `fn_checkLpAdd`(LP 추가), `fn_UserCheckValues`. 예심: `prelist05003`(재무제표 합계 15종 `fn_Calc*`), `prelist05004`(주주현황 14종 `fn_*Change`), `prelist05002`(`fn_CalcPayDtCapAmt`/`fn_CalcPubSum`).

#### `prelist.xml` (19) — 예비목록 페이지(ins/stf 사본)
- **공통이관:** `getByteLength`/`fn_CheckMaxLength`→`$c.str.getByteLength`.
- **업무공통(화면 전용):** `fn_PrelistPageSearch`/`fn_ChangePage`/`fn_UpdateLastPage`, `fn_CheckTrnsmYn`, `fn_New/Edit/Delete56/789/10`, `fn_SetCheckBoxValue`/`fn_SetRadioValue`/`fn_SetSelect`.

#### `prelistCheck.xml` (4) — 검증 유틸(전량 공통이관)
`fn_IsValidDateComm`→`$c.validate.isValidDate`, `fn_CheckStringLength`/`fn_StrCharByte`→`$c.str.getByteLength`, `fn_JuminCheck`→`$c.str.isSSN`.

#### `digital.xml` (9) · `listInvstg.xml` (10) — 검색팝업/페이지(업무공통 화면 전용)
`mkSboxOpt`, `fn_OpenIndCodeWin`/`fn_findCompany`/`fn_findInvst`/`findComInfo4fee`/`openAdjReqPop`(검색팝업), `changePage(2)`/`doChangePage(2)`(페이지 네비), `idInfo`, `fn_getFileNmCheck`.

### 3.3 bnf (채권 발행/공시) — 채권 업무규칙 집중

#### `bondCommon.xml` (66) — bnf 핵심 공통
- **공통이관:** `dateToyyyyMMdd`/`addMonth(2)`→`$c.date.*`, `Chk_Date(2)`/`fn_CheckDate`/`chkDate2`→`$c.date.isDate`/`$c.validate.isValidDate`, `Chk_Digit`/`Chk_Number`/`Chk_Sosu*`/`DemicalCheck*`/`fn_minusCheck*`→`$c.num.isNumber`, `Add_MoneyComma*`→`$c.num.formatMoney`, `Del_MoneyComma*`→`$c.num.unFormatNumber`, `Del_Hypen*`/`Del_Point*`/`replacePercent`→`$c.str.replaceAll`, `GetByte`/`byteCheck`/`cutMsg`→`$c.str.getByteLength`, `fnLPAD`→`$c.str.lpad`, `IsPhone`/`IsTel*`→`$c.str.isPhone`, `CheckEmail`/`fn_email*Check`→`$c.str.isEmail`.
- **삭제[A]:** `Cal_show`/`Cal_hide`[A1], `downloadFile`[A4], `fnNextFeild`[A2], `ietruebody`/`checkBroswer`/`quick_init`/`fill`[A2/레거시].
- **업무공통(채권 도메인):** `krxYn`, `Chk_Mkt_Holdy`(시장 휴장일), `getFstIntPayDd`(최초 이자지급일, 서버), `window_inst_cd`/`window_iss_inst_cd`/`window_sales_inst_cd`/`window_sales_cd`/`open_co_nm`(기관/발행사 코드검색), `fn_openNotice`/`fn_openFAQ`/`fn_openBondAppInfo`/`fn_openBizForm`/`fn_openFeeInfo`/`fn_openFeeCalc`(업무 안내 팝업), `Chk_SVC`(서비스 점검), `goToList`/`goToNonListingBond`/`goToElbNonListingBond`(라우팅).

#### `bondListing.xml` (27) · `isuInfoChg.xml` (13) · `bondHeader.xml` (3) · `applInfo.xml` (2) — 채권상장/변경(화면 전용)
- **업무공통(화면 전용):** `CommonCheckValues`/`NewLstCheckValues`/`BulkLstCheckValues`/`ReqDataCheckValues(ELBDLB)`/`ElbNewLstCheckValues`(상장 입력검증), `PopUp_int_pay_mth`/`PopUp_rdmp_mth`/`PopUp_opt_bnd_cd`/`PopUp_liq_cd` 등(채권 속성코드 팝업), `fn_holdy_princ_onchange`/`fn_holdy_int_onchange`(휴일 원금/이자), `add_exe_amt`/`Cal_af_iss_amt`/`Cal_af_lst_amt`/`Cal_af_div_lst_amt`/`Add_Total`(금액 산식), `menuTmCheck`/`applTmCheck`(업무시간 점검), `CheckReqInfo(_Cellphone)`(신청서 검증).
- **공통이관:** `fnToday`→`$c.date.formatDate`, `Del_Comma`/`Add_Money`/`Add_Comma`→`$c.num.*`.

#### `bnf/JCommon.xml` (146) · `bnf/common.xml` (35) · `bnf/number_format_kor.xml` (4) — ins/stf 사촌 사본
공통이관 매핑은 ins/stf 명세를 그대로 계승(문자/숫자/날짜/검증 다수 → `$c.str/num/date/util/validate`). 업무공통(발행사/종목/공시 검색·뷰어 `findCompanyName*`/`fnFindCorpName*`/`openDisclsViewer*`/`companysummary_open` 등)은 ins 와 동일 → **`$c.ins` 및 화면 전용 카탈로그 재사용**. `number_format_kor`(`number_format`/`num2won(_zero)`/`non_zero`)→`$c.num.*`.
> bnf 의 중복정의(`companysummary_open`, `findSubmitPerson` 각 2회)는 정리 필요.

### 3.4 inf (발행사/코드 설정)

inf 설정화면(7종)은 **자체 함수 0개**(선언형). `scwin.*` 정의는 전부 ins/stf 동일 사본 파일(`JCommon` 151 · `function` 130 · `common` 43 · `calendar`/`calendar_fil`/`layer` · `fileUpload` 11 · `number_format_kor` 4)에 들어 있다. 분류는 root/bnf 와 동일하게 계승:
- **업무공통(화면 전용):** 발행사/종목 검색(`findCompanyName*`/`fnFindCorpName*`/`findElwIsu`/`findEtnIsu`…), 표준코드/CFI(`get_stdcd2stdTpCd`/`getCfiCode`/`fn_tgtBndStdCd`/`fn_objStkStdCd`/`fn_popupInstCdSearch`/`fn_popupIsurCdSearch`), 공시뷰어(`openDisclsViewer*`/`companysummary_open`), 메뉴 라우팅(`menuLink`/`menuAuthLink`/`returnMenuLink`), 비밀번호 정책(`checkPwd(2)`/`checkPwdStr(2)`), 파일 업로드 검증(`fn_getFileNm(1)`/`fn_fileChk`/`checkLineFile`/`sumAttachedFilesSize`) — **ins 카탈로그와 완전 중복** → `$c.ins`/화면 전용 재사용, fil 사본 폐기 권장.
- **공통이관/삭제:** root/bnf 와 동일(`jquery_datepicker.fn_datepicker`[A1] 삭제 등).

---

## 4. 분리 모듈 — `$c.trk` / `$c.print` (ins/stf 계승)

| 원본 파일(트리) | 함수 | 분류 | 매핑 대상(TO-BE) |
| :--- | :--- | :---: | :--- |
| `logger_tracking.xml` (root/bnf/inf) | `_trk_*` (8) | **업무공통→`$c.trk`** | `trk.xml` (ins/stf `$c.trk` 동일 알고리즘) |
| `report.xml` (root) | `fn_PrintPreView` | **업무공통→`$c.print`** | `print.xml` (MarkAny 위변조방지 포함) |
| `bnf/report.xml` | `fn_PrintPreView(_DB/_JLDBNF90002/_JLDBNF55200)` | **업무공통→`$c.print`(+화면전용)** | 공통 `printPreView` 외 화면별 변형은 별도 관리 |
| `inf/report.xml` | `fn_PrintPreView(_DB/_JLDINF*)` + `camelize` | **업무공통→`$c.print`(+화면전용)** | `camelize` 는 `$c.str` 검토 |

> `_trk_flashContentsView` 는 Flash 의존 → 사용 시 A 검토(모듈에는 보존, 알고리즘 원본 유지).

---

## 5. `$c.fil`(업무공통) 선별 이관 결과 — 7개

| 도메인 | TO-BE (`$c.fil.*`) | AS-IS | origin |
| :--- | :--- | :--- | :--- |
| 콤마(소수점, 문자열) | `setComma`, `delComma` | `fn_SetComma`, `fn_DelComma` | digitalNumberFormat.xml |
| 콤마(컴포넌트 단위) | `objSetComma`, `objRmComma`, `objRmComma2` | `fn_ObjValueSetComma`, `fn_ObjValueResetRmComma(2)` | digitalNumberFormat.xml |
| 처리 확인 가드 | `confirmProcess` | `fn_isProcess` | digitalApplList.xml |
| 공시 제출 시간대 | `getSubmitGubun` | `timeGuBun` | currentTime.xml |

내부 헬퍼: `__rmComma`(AS-IS `fn_RmComma`, @hidden Y). 분리 모듈: `$c.trk`(8, logger_tracking.xml) · `$c.print`(1, report.xml). 재사용: `$c.ins`(종목검색·컴포넌트 값·메시지·검색팝업·표준코드 등 동일 사본).

---

소계(혼합/업무 파일): 1~5절 합계가 인벤토리 총계(약 1,316)와 일치한다. 후속 명세는 [`gcc_mapping_and_biz_common.md`](./gcc_mapping_and_biz_common.md) 참조.
