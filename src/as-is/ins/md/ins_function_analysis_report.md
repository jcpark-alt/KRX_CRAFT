# 📊 ins 폴더 함수 추출 및 분류 마스터 리포트

> `src/as-is/ins` 의 모든 화면 함수(`scwin.*`)를 추출하여 이관/삭제 여부를 분류한 마스터 문서.
> TO-BE 공통 위치: `src/gcc`(공통이관) · `src/as-is/ins/gcc`(업무공통 `$c.ins`/`$c.trk`/`$c.print`). **본 문서는 분석 가이드이며 원본 소스는 수정하지 않는다.**

## 집계 요약

- **분석 대상:** `src/as-is/ins` 39개 `.xml` 파일, **약 780개** `scwin.*` 함수(기계적 인벤토리 기준).
- **분류 규칙:** A그룹(삭제) = A1 달력 · A2 레이아웃(resize/position/키이벤트·포커스) · A3 패널 style · A4 파일·엑셀 다운로드 · A5 진행바/로딩 / + jQuery·Flash·ActiveX·서드파티·미사용 stub. B그룹 = 공통이관(기존 gcc 매핑) · 업무공통(gcc 미매핑).
- **범위 주의:** 화면 간 호출 대상인 `scwin.*` 함수만 집계한다. 내부 보조 1글자 헬퍼·prototype 확장은 이관 단위가 아니므로 제외.
- **규모 특성:** `ins`는 KRX 상장·발행·공시 업무 규모가 커 업무공통(B2)이 수백 개에 달한다. 그 중 **여러 화면에서 재사용되는 핵심 공통 함수만** `$c.ins`로 선별 이관하고(20개), 화면 전용 비즈니스 로직(업무 팝업/read/페이지 로직)은 '업무공통(별도 관리)'으로 카탈로그화한다.

| 분류 | 함수 수(약) |
| :--- | ---: |
| A그룹(삭제/제외) | 약 380 |
| B-공통이관(gcc 매핑) | 약 130 |
| B-업무공통(gcc 미매핑) | 약 270 |
| **합계** | **약 780** |

---

## 1. 순수 A그룹 파일 — 파일 단위 요약 (전체 삭제/제외)

해당 파일의 모든(또는 대부분) 함수가 A그룹(또는 프레임워크 산출물)이므로 개별 나열 대신 요약한다.

| 원본 파일명 | 함수 수 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 삭제 사유 |
| :--- | ---: | :---: | :--- | :--- |
| `calendar.xml` | 6 | **삭제 대상** | N/A | [A1] 달력 위젯 hover/click/좌표 |
| `calendar_fil.xml` | 28 | **삭제 대상** | N/A | [A1] 필링용 팝업 달력 전체(월/년 증감·휴일) |
| `filing_calendar.xml` | 27 | **삭제 대상** | N/A | [A1] `calendar_fil` per-module 복제본(+`setCalendarMode`) |
| `PopupCalendar.xml` | 27 | **삭제 대상** | N/A | [A1] 팝업 달력 위젯 전체 |
| `controlResize.xml` | 5 | **삭제 대상** | N/A | [A2] 창/그리드 리사이즈(Gauce 잔재) |
| `libRoundPanel.xml` | 3 | **삭제 대상** | N/A | [A3] 패널 라운드 style 변환 |
| `layer.xml` | 16 | **삭제 대상** | N/A | [A2/A3] 좌측메뉴/도움말 레이어 display 토글 |
| `filing_editor.xml` | 3 | **삭제 대상** | N/A | ActiveX XForm 에디터 `document.write` |
| `filing_progress.xml` | 4 | **삭제 대상** | N/A | [A5] 진행바(`togglePause` 중복정의) |
| `flashcall.xml` | 6 | **삭제 대상** | N/A | Flash `<object>/<embed>` 생성(폐기) |
| `login_flash.xml` | 1 | **삭제 대상** | N/A | Flash swf `document.write`(폐기) |
| `commonlogin.xml` | 1 | **삭제 대상** | N/A | `ArfObjectUnLappedFnc` — 레거시 ARF DOM 트릭 |
| `ShiftCrossBrowser_ver.2.4.min.xml` | 12 | **제외(프레임워크)** | N/A | 서드파티 크로스브라우저 플러그인 래퍼(min 번들) |

소계: **약 139개** 함수.

---

## 2. 공통이관(원시 통신/세션) 파일

### `filing_trans.xml` (8) — 레거시 원시 XHR → `$c.sbm`/`$c.data`

| 함수명 | 기능 설명 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 사유 |
| :--- | :--- | :---: | :--- | :--- |
| `$` | id 로 DOM 조회(jQuery 풍) | **삭제 대상** | N/A | 1줄 래퍼, 표준 DOM 대체 |
| `getXMLHttpRequest` | XHR 객체 생성 | **공통이관(대체)** | `$c.sbm.*` | 원시 XHR |
| `requestXMLHTTP` / `requestAsyncXMLHTTP` | 동기/비동기 XHR 전송 | **공통이관(대체)** | `$c.sbm.execute` | 원시 XHR |
| `responseTextXMLHTTP` | XHR 응답텍스트 | **공통이관(대체)** | `$c.sbm.*` | 원시 XHR |
| `sendMessage` | XHR open/header/send 코어 | **공통이관(대체)** | `$c.sbm.*` | 원시 통신 코어 |
| `onCompleteResponse` | 응답 핸들러(stub) | **삭제 대상** | N/A | 빈 stub |
| `formData2QueryString` | 폼 → 쿼리스트링 | **공통이관** | `$c.data.serializeFormToQueryString` | gcc/data.xml 보유 |

### `sessionTimer.xml` (4) — 세션 → `$c.session`

| 함수명 | 기능 설명 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 사유 |
| :--- | :--- | :---: | :--- | :--- |
| `startTimer` / `req4sessionExtn` / `restartTimer` / `initTime` | 세션 카운트다운·연장·재시작·초기화 | **공통이관** | `$c.session.sessionCheck` | 세션 점검/연장 (jQuery 의존 제거 필요) |

---

## 3. 혼합/업무 파일 — 함수별 분류 (요약 발췌)

> 전수 분류는 방대하므로 파일별 **대표 분류와 핵심 업무공통 함수**를 정리한다. 상세 시그니처는 [`gcc_mapping_and_biz_common.md`](./gcc_mapping_and_biz_common.md) §2 참조.

### `utils.xml` (30) — 전량 공통이관

순수 날짜/문자/검증 유틸 30개 전부 **공통이관**.

| 레거시 함수 | 매핑 대상(TO-BE) |
| :--- | :--- |
| `trim`, `cRmString`, `replaceAll` | `$c.str.trim` / `$c.str.replaceAll` |
| `lpad`, `cGetZero` | `$c.str.lpad` |
| `cGetToday(2)` | `$c.date.formatDate` / `getServerDateTime` |
| `cGetPlusDate(2)`/`cGetMinusDate(2)`/`calcDate` | `$c.date.addDate` |
| `cGetPlusMonth(2)`/`cGetMinusMonth`/`calcMonth` | `$c.date.addMonth` |
| `cGetPlusYear`/`cGetMinusYear`/`calcYear` | `$c.date.addYear` |
| `cGetDifTodayInputday` | `$c.date.diffDate` |
| `cGetMaxDay` | `$c.date.getLastDateOfMonth` |
| `cIsLeafYear` / `isDate` | `$c.date.isLeafYear` / `$c.date.isDate` |
| `cIsJumin` / `cIsResno` | `$c.str.isSSN` / `$c.str.isBizID` |
| `cIsNull` / `isNum` / `toNum` / `email_chk` | `$c.util.isEmpty` / `$c.num.isNumber` / `$c.num.parseInt` / `$c.str.isEmail` |
| `cIsBupin` (법인등록번호) | **업무공통(검토)** — gcc 부재 |

### `JCommon.xml` (92) — 공통이관 다수 + 업무공통 팝업/검증

- **공통이관:** `Trim/LTrim/RTrim/MTrim`→`$c.str.*`, `isEmpty`→`$c.util.isEmpty`, `email_chk`→`$c.str.isEmail`, `isSocialNO`→`$c.str.isSSN`, `isHangul`→`$c.str.isKorean`, `strLength`→`$c.str.getByteLength`, `getMoneyType`/`numOnMask*`/`setNumberTypeWithComma*`→`$c.num.formatNumber/formatMoney`, `getOnlyNumber*`→`$c.num.unFormatNumber`, `lastDay`→`$c.date.getLastDateOfMonth`, `calcDate`/`fn_setDate*`/`fn_setMonth*`/`fn_setFullYear*`/`dateAddDel`→`$c.date.add*`, `getDayInterval`→`$c.date.diffDate`, `fillZero`/`addZero`/`setDateMmDd`→`$c.str.lpad`, `cal_value2`→`$c.date.dateFormat`, `validateStartDateAndToDate*`→`$c.date.dateCompare`/`diffDate`.
- **삭제 대상[A]:** 키이벤트 입력제어(`onlyNum*`, `comma_value`), 포커스/탭(`focusMove*`, `tabIndexing`, `fn_numAutoFocus`), iframe 리사이즈(`frameSize*`, `frame_1Size*`), 달력 마스킹(`calOnMask`, `cal_offMask`), style 직접변경(`changeTableRowColor`, `fn_changeOnMode`), 위치지정 `win_open`/`gShowWindow`, 배열 헬퍼/빈 stub(`makeArray`, `getAt`, `extractHostAddr`), 레거시 XHR(`createXMLHttpRequest`, `handleStateChangeForHostAddr`).
- **업무공통:** 각종 업무 팝업 오픈(`companysummary_open`, `etfisusummary_open`, `openDisclsViewer*`, `find*`/`findCompanyName*`/`fnFindCorp*`/`findElwIsu`/`findEtnIsu` 등 30+), 전체기간 비즈니스(`fn_setFullDate(_future)`, `fn_setLmtFullDate`), 입력검증(컴포넌트+alert: `chkStrNull(Length)`, `chkValidChar`, `onlyChar`, `onlyNumber`, `isMoneyNumber1~5`, `chkStrLength`, `isAlpha(Numeric)`, `isFgnSocialNO`), 파일확장자 검증(`LimitAttach`), 기간 N년 검증(`chkPeriod_year`).

### `function.xml` (108) — 메뉴 라우팅 + 검증 + 업무 팝업

- **공통이관:** `fnLeg`→`$c.str.lpad`, `replaceAll`/`fn_delString`/`Del_Point`→`$c.str.replaceAll`, `Add_*Comma`/`get_addMoneyComma`→`$c.num.formatNumber/formatMoney`, `Del_MoneyComma*`→`$c.num.unFormatNumber`, `GetByte`→`$c.str.getByteLength`, `IsTel`→`$c.str.isPhone`, `CheckEmail`→`$c.str.isEmail`, `fn_int2han`→`$c.num.numberToKor`, `fn_convCalDate`→`$c.date.dateFormat`, `fn_getPeriod`→`$c.date.diffDate`, `Chk_Date*`/`Chk_Digit*`→`$c.num.isNumber`/`$c.validate.isValidDate`.
- **삭제 대상[A]:** 키이벤트 입력제어 함수군(`fn_*Check`: `fn_numCheck`/`fn_telNoCheck`/`fn_emailCheck`/`fn_engNm*`/`fn_specNotCheck` 등 다수), 깜빡임(`fn_startBlink`/`fn_doBlink`), 로딩 dialog(`blockLoading`/`blockDownLoadingShow`), DOM 직접 조작(`fn_acntcls_add/del`, `jsReturn`), 활성/포커스 제어(`fn_CompEnable`, `fn_numAutoFocus`), `popupAutoSize`, `fn_passwordModal`(showModalDialog), `GetByte` 보조 1글자 헬퍼(`IsUpper/IsLower/IsInt/IsEtc/...`).
- **업무공통:** 메뉴 라우팅(`menuLink`, `menuLinkVal`, `menuAuthLink`, `menuAuthElsDlsLink`, `returnMenuLink`), 업무 팝업(`fn_popup*` 20+, `fn_zipCd`, `fn_cntrCd`, `fn_passwordWin`), 비밀번호 보안정책(`checkPwdStr(2)`, `checkPwd(2)`), 표준코드 매핑(`get_stdcd2stdTpCd` → **`$c.ins.getStdCdToStdTpCd`**), 검증(`Chk_Percent`, `Chk_Money`, `Chk_Phone`, `Chk_Fax`, `DemicalCheck(Val/_minus)`, `checkNumUpperEnglish`, `chk_chrg_nm`), 시간마감(`checkRegTimeEnd`), 영문약명 절단(`fn_cut_spacingWords`), 패킷패딩(`padString`), KISA/CFI/SSL ajax(`fn_delayKeyup`, `getCfiCode`, `Chk_SVC`), 기간 프리셋(`fn_setToday`, `fn_appDate1/2`).

### `common.xml` (47) — 발행사검색 콜백 + 콤보 + 검증

- **공통이관:** `fn_Trim`→`$c.str.trim`, `fn_int2han`/`fn_ChgAmtToHan`→`$c.num.numberToKor`, `fn_CheckEmail`→`$c.str.isEmail`, `fn_DelPoint`/`fn_DelChar(2~5)`→`$c.str.replaceAll`, `fn_DelChar4`→`$c.str.existKorean`, `fn_checkDay`/`fn_CheckDate(Obj/Val)`→`$c.date.dateCompare`/`isDate`, `fn_IsNumber_val`→`$c.num.isNumber`, `fn_IgnoreSpaces`→`$c.str.replaceAll`, `fn_alertDelConfirm`→`$c.win.confirm`, `isNumber`→`$c.num.isNumber`(원본 로직결함).
- **삭제 대상[A]:** 로딩/상태 프레임(`ShowWin`/`ShowNoData`/`CloseWin`/`ShowTrWin`/`CloseTrWin`)[A5], 패널 라운드(`PanelToGroupBox(_01/_02)`)[A3], 엑셀/파일다운(`ExcelDown`/`ComGridToExcel`/`FileDown1/2`)[A4], 팝업 좌표계산(`*TagetPos`)[A2], 검색팝업 오픈(`IsurcdSearch*`/`submitSearch`/`ulySearch`/`ins_popupOpen*`/`ins_ELWpopupOpen` 등)[A1/A2], 버튼/변경 style(`fn_CtrlBtn(_temp)`, `fn_ChangeCheck`)[A3], `xmlDocLoad`(ActiveX).
- **업무공통:** 발행사/제출인/기초자산 검색결과 콜백(`isurSearch_Rtn`, `submitSearch_Rtn`, `uly_Rtn`, `ins_popupRtn_cdnm(2)`, `ins_popupRtn_val3/4`), 발행사 인라인 조회(`fn_com_isur(_sync)`, `fn_com_Confirm_set(2)`, `fn_com_isur_nm`, `jongmokNameSearch`), 공통코드 콤보(`ins_combo_set(2)`, `fn_ResetCdValue`, `ins_cfi_set`), 비번초기화/메일(`ins_clearPwd`), 전송마감(`fn_checkSendTime(_client)`), 메뉴ID 추출(`InfoMenuID`), ELW 발행년코드(`get_YYYY_Cd_for_elw`), 다운경로(`getExcelDownPath`), 행포커스(`fn_RowPos`).

### `list_common.xml` (62) — 상장/관리종목 업무규칙(대부분 업무공통)

- **삭제 대상[A]:** 찾기 팝업(`fn_PopFind*` 20+)[A1], 패널 readonly/활성(`fn_setPan*ReadOnly/Writable(2)`, `fn_setCtr*`, `fn_clearPanel`)[A3].
- **공통이관:** `isInArr`→`$c.util.*`.
- **업무공통:** 증권그룹 매핑(`fn_getSecuGrpNm/Id`), 심볼중복검증(`fn_chk*SymblDoubleInput`, `fn_eng_symbl_check`), 일자/시간 검증(`checkDdTm(_2)`), 데이터셋 상태/가공(`setDataSetStatusForInsert`*, `merge/divideDtsDataForDdTm`*, `fn_isNewValueForDataSet`, `fn_getRowIdx`, `fn_logDSet`), 관리종목 업무규칙(`fn_getMst(_K/_ICR_K)Status`, `fn_isValidityAdmisuRsnCd`, `fn_mst_check`), 업무메시지(`fn_isProcess`, `fn_alertMsg`, `fn_alertNoUpdate`), 세션시장/파라미터(`fn_getMktId`, `fn_encodeNSession`), 부서/담당자 콤보(`fn_list_depcd/empno`), 공시삭제/중복/영업일(`fn_check_delete_discls`, `fn_check_bz_doubleinput`, `fn_TrHoldyYn`), 공시뷰어(`fn_OpenListDisclView`). (*는 W-Craft `X` 변환 미완 — 동작 불완전)

### `stf.xml` (54) — 컴포넌트 get/set·검증·기간·로그저장(핵심 이관원)

- **공통이관:** `trim`/`replaceAll`→`$c.str.*`, `FormatNumberEx`/`addComma(Minus)`→`$c.num.formatNumber`, `FormatDateEx`→`$c.date.formatDate`, `IsValidEmail`→`$c.str.isEmail`, `getStringSize`/`fn_GetByte`→`$c.str.getByteLength`, `getQuery`→`$c.util.getParameter`.
- **삭제 대상[A]:** `showObj`/`SetWindowPos(2)`/`MoveCenterOfParent`/`fn_getModalCenterPos`[A2], `Combo_CBDataSet(Period)`/`PanelMsg`/`FillGridHeader(2)`/`FillGridHeaderTotalCnt`/`fn_SetDisableSelectBtn`[A3], `CopyDataSet(Header)`/`cfParseFeature`/`alert_*`(Gauce·미사용 stub).
- **업무공통 → `$c.ins`:** `getMessageParam`, `getObjectValue`, `setObjectValue`, `fn_setFromToDate(1)`, `compareFromToDate(2)`, `checkEmptyValue`, `checkMaxLength`, `doLogSave`/`startLogSave`/`createXMLObj4LogSave`/`chkStats4LogSave`/`viewParameter4logSave`.
- **업무공통(화면 전용):** `InfoMenuID`, `fn_getNewBzProcNo`, `fn_PopupCorpInfo`, `fn_checkDutyTimeStatus`, `fn_OpenNoDisclViewer`, `fn_OpenDisclViewer`, `fn_OpenDisclAllList`, `fn_getComboTextValue`, `setButtonSetWithDate(2)`, `fn_checkValueNullMaxlength`.

### `person.xml` (31) — 종목코드 검색 + Hex

- **공통이관:** `isDigit`→`$c.num.isNumber`, `addMonth`→`$c.date.addMonth`.
- **삭제 대상[A]:** 페이징 HTML(`pageNav(2)`, `navAnchor`)[A2], 달력(`go_cal`, `fn_openCalendar`)[A1], 로딩(`openLoading`/`closeLoading`)[A5], `win_open2`/`openCodeWin2`/`gotoPage`/`initField`.
- **업무공통:** 종목코드 검색 자료구조/로직(`jongObj`, `findcode(New)`, `getCodeSearchName`, `getCodeName`, `findcodeName(New)`, `changeFlag`, `getSameNameCnt`, `searchCode`, `beforefindCode`, `openCode`, `go_Stock`), 공시/뉴스(`viewNews`, `openDisclosure`), 기간(`setPeriod`), **Hex 인코딩(`StringToHex4`/`Hex4ToStr` → `$c.ins.toHex4`/`fromHex4`)**.

### `kosdaqonline.xml` (33) — `common.xml` 발행사검색 per-module 변형

- **삭제 대상[A]:** `common.xml`과 동일한 로딩/패널/엑셀/좌표(`ShowWin`류, `PanelToGroupBox*`, `ExcelDown`, `*TagetPos`).
- **업무공통:** 발행사/제출인/기초자산 검색팝업·콜백(`IsurcdSearch(2/_IR)`, `fn_com_isur(_sync/_nm)`, `fn_com_Confirm_set(2)`, `isurSearch_Rtn`, `submitSearch(_Rtn)`, `ulySearch`, `uly_Rtn`).
- **공통이관:** `isNumber`→`$c.num.isNumber`.

### `filing_common.xml` (29) — 검증/기간/체크박스 유틸

- **공통이관:** `fn_CheckDate(Gn)`→`$c.validate.isValidDate`, `removeChar`/`fn_IgnoreSpaces`→`$c.str.replaceAll`, `isMinusNum`/`fn_IsNumber`→`$c.num.isNumber`(원본 `X` 변환오류), `getOnlyNum`→`$c.num.unFormatNumber`, `moneyType`→`$c.num.formatNumber`, `fn_Trim`→`$c.str.trim`, `fn_IsNull`/`fn_NullChk`→`$c.util.isEmpty`, `fn_IsNotNull`→`$c.util.isNotEmpty`, `fn_CheckEmail`→`$c.str.isEmail`, `fn_IsExceedMaxLen`/`fn_CheckByte`/`fn_CalcContn`→`$c.str.getByteLength`, `fn_PopManual`→`$c.win.openPopup`.
- **삭제 대상[A]:** `fn_ReplaceKeyword`(document.write), `fn_getFileSize`(ActiveX).
- **업무공통:** 라디오/체크박스 유틸(`fn_IsChecked`, `fn_GetCheckedValue`, `fn_GetMultiCheckedValue`), 키이벤트 숫자제한(`fn_ChkNumber`), 영숫자 자리수(`fn_ChkAlphaNum`), 전화/이메일 분리세팅(`fn_SetPhoneValue`, `fn_SelEmail`, `fn_SetEmaileValue`), 기간 프리셋(`fn_ClickPeriod`, `fn_SetPeriod`).

### `elw_recv_common.xml` (25), `pre_newlisting.xml` (22), `prelist.xml` (19), `listing_iss_common.xml` (7), `hindr.xml` (14), `utils_detect.xml` (2), `uldstf92003_search.xml` (4), `protected_dep_cal.xml` (15)

화면 전용 업무공통(별도 관리). 핵심:
- `elw_recv_common`: ELW 종목/기초자산/LP/재무 서버 read 11종, 코드/체크/팝업(`fn_searchCode`, `fn_setCheckBox`, `fn_OpenDetailRecv` 등), 호수표기 가공(`fn_getArrIsuNmInfo`). 인쇄(`fn_pre_report`/`fn_listing_report`)·파일다운(`fn_filedown`)·재무바인딩은 A.
- `pre_newlisting`/`prelist`/`listing_iss_common`: 신규상장·예심 read·중복체크·그리드 초기화/저장·페이지 로직(전부 화면 전용 업무공통).
- `hindr`: 이력/뉴스/공시뷰어 팝업, 접속 로그(`fn_connStratLog/EndLog`). `fn_condUrl(2)`→`$c.str.replaceAll`(공통이관).
- `protected_dep_cal`: 보호예수 매각금지/허용기간 산출(`fn_getTrdAlwMnt`, `fn_getAlwDte`, `fn_calFbdTrm`, `fn_calCtr` 등) — 업무공통. 범용 날짜헬퍼(`fn_incMth/incDte/dte2str/str2dte`, `isInArr`, `isDate0`)는 **공통이관**(`$c.date.*`/`$c.util.*`). `debug`/`p`는 삭제.

### 단일/소형 파일

| 원본 파일명 | 함수 | 분류 | 매핑 대상(TO-BE) | 비고 |
| :--- | :--- | :---: | :--- | :--- |
| `number_format_kor.xml` | `number_format` | **공통이관** | `$c.num.formatNumber` | |
| `number_format_kor.xml` | `num2won`/`num2won_zero` | **공통이관** | `$c.num.numberToKor` | 한글금액 |
| `number_format_kor.xml` | `non_zero` | **공통이관** | `$c.num.isNumber` | |
| `report.xml` | `fn_ExtractParam` | **공통이관** | `$c.data.serializeFormToQueryString` | |
| `report.xml` | `fn_open_report*`/`fn_PrintPreView`/`fn_make_dtsToJson`/`fn_dataFormatValue` | **업무공통→`$c.print`** | `print.xml` | Rexpert 인쇄 |
| `logger_tracking.xml` | `_trk_*` (8) | **업무공통→`$c.trk`** | `trk.xml` | 분석/트래킹 |
| `stockSearch.xml` | `JongmokSearch(_Reset/_Rtn/_Rtn2)` | **업무공통→`$c.ins`** | `ins.xml` | 종목검색 |
| `stockSearch.xml` | `isNumber` | **공통이관** | `$c.num.isNumber` | 원본 로직결함 |
| `fileUpload.xml` | `fn_getFileNm(1)`/`file_browse`/`checkLineFile`/`sumAttachedFilesSize` | **업무공통** | 별도 관리 | 업로드 검증 |
| `fileUpload.xml` | `fn_addRow`/`fn_delRow`/`fn_fileAllCheck` 등 | **삭제 대상** | N/A | [A4] 업로드 컴포넌트 제어 |
| `uldstf92003_search.xml` | `getURL(2)`/`invoke(2)` | **업무공통** | 별도 관리 | 공시 URL/조회 |
| `utils_detect.xml` | `fn_get_search_taskdd`/`fn_get_trstatcd` | **업무공통** | 별도 관리 | 적출/거래상태 조회 |
| `yearanulfee_print.xml` | `fn_pre_print_stock/kosdaq` | **업무공통→`$c.print` 후보** | `print.xml` | 연부과금 인쇄 |
| `listInvstg.xml` | `changePage` | **업무공통** | 별도 관리 | 상장조사 네비 |
| `listInvstg.xml` | `fn_print` | **공통이관** | `$c.print`/`window.print` | |

---

## 4. `$c.ins`(업무공통) 선별 이관 결과 — 20개

| 도메인 | TO-BE (`$c.ins.*`) | AS-IS | origin |
| :--- | :--- | :--- | :--- |
| 종목검색 | `jongmokSearchReset`, `jongmokSearchRtn`, `jongmokSearchRtn2` | `JongmokSearch_*` | stockSearch.xml |
| 컴포넌트 값 | `getObjectValue`, `setObjectValue` | `getObjectValue`, `setObjectValue` | stf.xml |
| 입력검증 | `checkEmptyValue`, `checkMaxLength` | `checkEmptyValue`, `checkMaxLength` | stf.xml |
| 기간/일자 | `setFromToDate`, `setFromToDate1`, `compareFromToDate`, `compareFromToDate2` | `fn_setFromToDate(1)`, `compareFromToDate(2)` | stf.xml |
| 메시지 | `getMessageParam` | `getMessageParam` | stf.xml |
| 표준코드 | `getStdCdToStdTpCd` | `get_stdcd2stdTpCd` | function.xml |
| 문자열 Hex | `toHex4`, `fromHex4` | `StringToHex4`, `Hex4ToStr` | person.xml |
| 로그저장 | `createXmlObj4LogSave`, `startLogSave`, `chkStats4LogSave`, `viewParameter4LogSave`, `doLogSave` | `*4LogSave` | stf.xml |

분리 모듈: `$c.trk`(8, logger_tracking.xml) · `$c.print`(6, report.xml).

---

소계(혼합/업무 파일): 1~3절 합계가 인벤토리 총계(약 780)와 일치한다. 후속 명세는 [`gcc_mapping_and_biz_common.md`](./gcc_mapping_and_biz_common.md) 참조.
