# 레거시 → gcc 공통함수 치환 매핑표 (Substitution Map)

> 이 문서는 [websquare_conversion_guide.md](websquare_conversion_guide.md) 의 **규칙 7(레거시 공통함수 → gcc 공통함수 치환)** 에서 참조하는 대표 매핑표입니다.

`src/docs/api/{fil,ins,mgt}/index_transfer.html` 의 `DATA` 배열을 namespace 기준으로 통합한 대표 매핑입니다. (AS-IS = 레거시 함수 / TO-BE = gcc 표준 `$c.*`) 동일 의미의 사본 함수는 슬래시(`/`)로 묶었습니다.

> **프로그램 접근**: 이 표는 사람이 읽는 요약이고, 변환기는 `src/conversion/tools/gcc_mapping.py` 로더로 위 `DATA`(SOT)를 직접 파싱해 사용합니다. `substitution_dict()` 는 **태그 없는 순수 식별자·무충돌** 항목만 담은 자동 1:1 치환 사전(규칙 7)을, `conflicts()` 는 동일 이름이 다른 `$c.*` 로 갈리는 충돌 항목을 돌려줍니다. (`python src/conversion/tools/gcc_mapping.py` 로 요약 확인)

## 1. `$c.str` — 문자열

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.str.trim` | `trim` / `Trim` / `LTrim` / `RTrim` / `MTrim` / `fn_Trim` | 앞뒤(양끝) 공백 제거 | |
| `$c.str.lpad` | `lpad` / `cGetZero` / `fnLeg` / `fnLPAD` / `fillZero` / `addZero` / `setDateMmDd` / `fn_AddZero` | 좌측(0) 패딩 | |
| `$c.str.replaceAll` | `replaceAll` / `cRmString` / `removeChar` / `fn_IgnoreSpaces` / `fn_delString` / `fn_DelChar2~5` / `fn_DelPoint` / `Del_Hypen*` / `Del_Point*` / `replacePercent` / `fn_condUrl` | 문자/공백 치환·제거 | |
| `$c.str.isEmail` | `email_chk` / `CheckEmail` / `fn_CheckEmail` / `IsValidEmail` / `fn_emailFrontCheck` / `fn_emailBackCheck` | 이메일 형식 검증 | |
| `$c.str.getByteLength` | `strLength` / `GetByte` / `getStringSize` / `fn_GetByte` / `fn_CheckByte` / `fn_getCheckByte` / `fn_getAsciiLength` / `fn_StrCharByte` / `fn_ChkStrLenb` / `byteCheck` / `cutMsg` / `fn_IsExceedMaxLen` | 바이트 길이 계산/초과 검사 | |
| `$c.str.isSSN` | `cIsJumin` / `isSocialNO` / `fn_JuminCheck` / `cIsResno`(mgt) | 주민/외국인 등록번호 검증 | |
| `$c.str.isBizID` | `cIsResno`(ins) / `cIsBupin` | 사업자/법인 등록번호 검증 | 검토 |
| `$c.str.isPhone` | `IsTel` / `IsPhone` / `fn_checkPhoneNumber` | 전화번호 형식 검증 | |
| `$c.str.isKorean` | `isHangul` | 한글 여부 | |
| `$c.str.existKorean` | `fn_DelChar4` | 한글 입력 포함/차단 | |

## 2. `$c.num` — 숫자

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.num.formatNumber` | `fn_NumberFormat` / `fn_ValueSetComma` / `fn_insertComma` / `moneyType` / `numOnMask*` / `setNumberTypeWithComma*` / `Add_MoneyComma` / `Add_CommaMax` / `FormatNumberEx` / `addComma` / `number_format` | 천단위 콤마(정수) 포맷 | |
| `$c.num.formatMoney` | `getMoneyType` / `getSignMoneyType` / `Add_Comma` / `Add_MoneyComma_Value` | 금액 콤마 포맷(소수/부호) | |
| `$c.num.unFormatNumber` | `fn_removeComma` / `fn_DelComma` / `getOnlyNum` / `getOnlyNumber*` / `Del_MoneyComma*` / `rtnNumber` | 콤마/부호 제거 | |
| `$c.num.isNumber` | `fn_checkNum*` / `isNum` / `fn_IsNumber*` / `Chk_Percent` / `Chk_Digit*` / `non_zero` / `isDigit` / `isNumber` | 숫자/소수 여부 검증 | |
| `$c.num.numberToKor` | `num2won` / `num2won_zero` / `fn_int2han` / `fn_ChgAmtToHan` | 숫자 → 한글 금액 | |
| `$c.num.parseFloat` | `toNum` | 숫자 변환(기본값) | 검토 |

## 3. `$c.date` — 날짜

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.date.formatDate` | `cGetToday` / `cGetToday2` / `getCurrentDate` / `FormatDateEx` / `todate` / `todate_slash` / `dateToyyyyMMdd` / `fn_dte2str` | 오늘/Date → 포맷 문자열 | |
| `$c.date.addDate` | `cGetPlusDate*` / `cGetMinusDate*` / `calcDate` / `fn_setDate*` / `dateAddDel` / `fn_incDte` | 일(日) 가감산 | |
| `$c.date.addMonth` | `cGetPlusMonth` / `cGetMinusMonth` / `calcMonth` / `addMonth` / `addMonth2` / `fn_incMth` | 월(月) 가감산 | |
| `$c.date.addYear` | `cGetPlusYear` / `cGetMinusYear` / `calcYear` | 년(年) 가감산 | |
| `$c.date.diffDate` | `cGetDifTodayInputday` / `getDayInterval` / `getDuration` / `fn_getPeriod` | 두 날짜 차이(일수/기간) | |
| `$c.date.dateCompare` | `validateStartDateAndToDate` / `compareFromToDate*` / `fn_checkDay` / `fn_CheckDateObj` | From/To 일자 비교 | |
| `$c.date.dateFormat` | `cal_value2` / `fn_convCalDate` / `chkDate` / `chkDate2` | 8자리 → `YYYY-MM-DD` 마스킹 | |
| `$c.date.dateUnFormat` | `fn_str2dte` / `cal_offMask*` | 마스킹 제거 / 문자열 → Date | |
| `$c.date.isDate` | `isDate` / `isDate0` | 날짜 유효성/빈 날짜 판별 | |
| `$c.date.isLeafYear` | `cIsLeafYear` | 윤년 검사 | |
| `$c.date.getLastDateOfMonth` | `cGetMaxDay` / `lastDay` | 해당 월 마지막 일수 | |
| `$c.date.getServerDateTime` | `getSysDate` | 시스템(서버) 현재 일자 — 인자 없으면 기본 `yyyyMMdd` (규칙 18) | |

## 4. `$c.validate` — 검증

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.validate.isValidDate` | `fn_checkDate` / `fn_CheckDate` / `fn_CheckDateGn` / `Chk_Date*` / `chkDate2` / `fn_IsValidDateComm` | 일자 유효성 | |
| `$c.validate.setComponentProperty` | `showObj` | 컴포넌트 표시/숨김(속성 제어) | 검토 |

## 5. `$c.util` — 유틸/컴포넌트

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.util.isEmpty` | `fn_IsNull` / `fn_NullChk` / `cIsNull` / `isEmpty` | Null/빈값 체크 | |
| `$c.util.isNotEmpty` | `fn_IsNotNull` | Not Null 체크 | |
| `$c.util.getCookie` | `getCookie` | 쿠키 조회 | |
| `$c.util.setCookie` | `setCookie` | 쿠키 저장 (규칙 18) | |
| `$c.util.removeCookie` | `removeCookie` | 쿠키 삭제 (규칙 18) | |
| `$c.util.setLocalStorage` / `getLocalStorage` / `removeLocalStorage` / `clearLocalStorage` | `setLocalStorage` / `getLocalStorage` / `removeLocalStorage` / `clearLocalStorage` | localStorage 저장/조회/삭제/전체삭제 — 함수명 동일, 네임스페이스만 `$c.util` 로 변경 (규칙 18) | |
| `$c.util.setSessionStorage` / `getSessionStorage` / `removeSessionStorage` / `clearSessionStorage` | `setSessionStorage` / `getSessionStorage` / `removeSessionStorage` / `clearSessionStorage` | sessionStorage 저장/조회/삭제/전체삭제 — 함수명 동일, 네임스페이스만 `$c.util` 로 변경 (규칙 18) | |
| `$c.util.getParameter` | `getQuery` | URL 파라미터 추출 | |
| `$c.util.getComponent` | `getObjectValue` / `setObjectValue` / `$`(jQuery 풍) | 컴포넌트 조회/값 제어 | 검토·대체 |
| `$c.util.isArray` | `isInArr` | 배열 포함 여부 | 검토 |

## 6. `$c.win` — 화면/팝업/네비게이션

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.win.openPopup` | `fn_PopManual` / `pop` / `historyChgName` / `openNews` / `openDisclosureView` | 팝업/업무 윈도우 오픈 | |
| `$c.win.closePopup` | `{객체명}.CloseFrame` | 팝업/프레임 닫기 — 메서드 호출 `{객체명}.CloseFrame()` 전체를 인자 없는 `$c.win.closePopup()` 로 치환(수신 객체 제거) | 검토 |
| `$c.win.confirm` | `fn_alertDelConfirm` | 삭제 확인 confirm | |
| `$c.win.moveUrl` | `goURL` | URL 이동 | |
| `$c.win.getProgramId` | `InfoMenuID` | 현재 메뉴/프로그램 ID | |
| `$c.win.alert` (+ `$c.data.getMessage`) | `alert_error` | 에러 객체 메시지 alert | |

## 7. `$c.sbm` — 서버 통신 (원시 XHR 대체)

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.sbm.execute` | `requestXMLHTTP` / `requestAsyncXMLHTTP` | XHR 요청 → 표준 submit | 대체 |
| `$c.sbm.executeDynamic` | `sendMessage` | 비동기 메시지 전송 → 동적 submit | 대체 |
| `$c.sbm.*` | `getXMLHttpRequest` / `responseTextXMLHTTP` | XHR 객체/응답 처리 → 통신모듈로 흡수 | 대체 |

> 통신 치환은 규칙 6 및 `sbm-generator.html` 를 함께 참고하여 `sbmOptions` 기반으로 재작성합니다.

## 8. `$c.data` · `$c.session` · `$c.print` — 데이터/세션/출력

| TO-BE (gcc) | AS-IS 대표 함수 | 설명 | 태그 |
| --- | --- | --- | --- |
| `$c.data.serializeFormToQueryString` | `formData2QueryString` / `fn_ExtractParam` | 폼 → 쿼리스트링 | |
| `$c.data.getMessage` | `getMessageParam` | 메시지 파라미터 치환 조회 | |
| `$c.data.getMatchedJSON` | `fn_findRow` | 데이터셋 행 검색 | |
| `$c.session.sessionCheck` | `sessionCheck` / `startTimer` / `req4sessionExtn` / `restartTimer` / `initTime` | 세션 점검·연장 | |
| `$c.print.*` | `fn_print` | 문서 인쇄 | 검토 |

> 위 표는 대표 매핑 요약입니다. 모듈별 전체 목록과 원본 파일 단위 분류는 각 `index_transfer.html`(브라우저로 열어 검색 가능)을 SOT로 참조하세요.

## 9. 모듈 업무 공통 함수 — 변환 1:1 매핑 (`$c.fil`/`$c.ins`/`$c.mgt`/`$c.stf`/`$c.trk`/`$c.print`)

이 표는 위 1~8장(레거시 유틸 → `$c.<core>` 대표 치환)과 달리, **모듈별 업무공통(KRX 고유) 함수의 AS-IS 레거시 원본 → 변환된 `$c.<모듈>` 함수 1:1 매핑**이다. `src/as-is/{fil,ins,mgt,stf}/gcc/*.xml` 각 함수 JSDoc 의 `(AS-IS: 원본명, origin: 원본.xml)` 주석을 취합한 것으로, 변환 추적성(traceability) 규칙은 [stf/md/CONVERSION.md](../../as-is/stf/md/CONVERSION.md) 를 따른다.

- TO-BE 는 변환된 `$c.<ns>.<함수>` (파일 `meta_screenId` + JSDoc `@name`), AS-IS 는 레거시 원본명, origin 은 원본 화면 파일이다.
- `(internal)` 은 `@hidden Y` 내부 헬퍼(`publicInfo` 미노출)이며 공개 래퍼가 위임한다.
- `$c.trk`(분석/트래킹)·`$c.print`(인쇄/리포트)는 여러 모듈이 공유하므로 **모듈** 열로 출처를 구분한다.

### 9.1 `$c.fil` — 필링 업무 공통 (origin: `fil` 모듈 화면들)

| TO-BE (`$c.fil.*`) | AS-IS 원본 | origin |
| --- | --- | --- |
| `setComma` | `fn_SetComma` | digitalNumberFormat.xml |
| `delComma` | `fn_DelComma` | digitalNumberFormat.xml |
| `__rmComma` (internal) | `fn_RmComma` | digitalNumberFormat.xml |
| `objSetComma` | `fn_ObjValueSetComma` | digitalNumberFormat.xml |
| `objRmComma` | `fn_ObjValueResetRmComma` | digitalNumberFormat.xml |
| `objRmComma2` | `fn_ObjValueResetRmComma2` | digitalNumberFormat.xml |
| `confirmProcess` | `fn_isProcess` | digitalApplList.xml |
| `getSubmitGubun` | `timeGuBun` | currentTime.xml |

### 9.2 `$c.ins` — ins 업무 공통 (origin 다양)

| TO-BE (`$c.ins.*`) | AS-IS 원본 | origin |
| --- | --- | --- |
| `__byteLength` (internal) | `getStringSize` | stf.xml |
| `jongmokSearchReset` | `JongmokSearch_Reset` | stockSearch.xml |
| `jongmokSearchRtn` | `JongmokSearch_Rtn` | stockSearch.xml |
| `jongmokSearchRtn2` | `JongmokSearch_Rtn2` | stockSearch.xml |
| `getObjectValue` | `getObjectValue` | stf.xml |
| `setObjectValue` | `setObjectValue` | stf.xml |
| `checkEmptyValue` | `checkEmptyValue` | stf.xml |
| `checkMaxLength` | `checkMaxLength` | stf.xml |
| `setFromToDate` | `fn_setFromToDate` | stf.xml |
| `setFromToDate1` | `fn_setFromToDate1` | stf.xml |
| `compareFromToDate` | `compareFromToDate` | stf.xml |
| `compareFromToDate2` | `compareFromToDate2` | stf.xml |
| `getMessageParam` | `getMessageParam` | stf.xml |
| `getStdCdToStdTpCd` | `get_stdcd2stdTpCd` | function.xml |
| `toHex4` | `StringToHex4` | person.xml |
| `fromHex4` | `Hex4ToStr` | person.xml |
| `createXmlObj4LogSave` | `createXMLObj4LogSave` | stf.xml |
| `startLogSave` | `startLogSave` | stf.xml |
| `chkStats4LogSave` | `chkStats4LogSave` | stf.xml |
| `viewParameter4LogSave` | `viewParameter4logSave` | stf.xml |
| `doLogSave` | `doLogSave` | stf.xml |

### 9.3 `$c.mgt` — mgt 업무 공통 (origin: `mgt.xml` / `stockSearch.xml` / `common.xml`)

| TO-BE (`$c.mgt.*`) | AS-IS 원본 | origin |
| --- | --- | --- |
| `jongmokSearchReset` | `JongmokSearch_Reset` | stockSearch.xml |
| `jongmokSearchRtn` | `JongmokSearch_Rtn` | stockSearch.xml |
| `jongmokSearchRtn2` | `JongmokSearch_Rtn2` | stockSearch.xml |
| `createXmlObj4LogSave` | `createXMLObj4LogSave` | mgt.xml |
| `startLogSave` | `startLogSave` | mgt.xml |
| `chkStats4LogSave` | `chkStats4LogSave` | mgt.xml |
| `viewParameter4LogSave` | `viewParameter4logSave` | mgt.xml |
| `doLogSave` | `doLogSave` | mgt.xml |
| `cfParseFeature` | `cfParseFeature` | mgt.xml |
| `copyDataSetHeader` | `CopyDataSetHeader` | mgt.xml |
| `copyDataSet` | `CopyDataSet` | mgt.xml |
| `comboCbDataSetPeriod` | `Combo_CBDataSetPeriod` | mgt.xml |
| `fillGridHeaderTotalCnt` | `FillGridHeaderTotalCnt` | mgt.xml |
| `panelMsg` | `PanelMsg` | mgt.xml |
| `setFromToDate` | `fn_setFromToDate` | mgt.xml |
| `mdiHelp` | `MdiHelp` | common.xml |

### 9.4 `$c.stf` — stf 업무 공통 (origin: `stf.xml`)

| TO-BE (`$c.stf.*`) | AS-IS 원본 | 비고 |
| --- | --- | --- |
| `copyDataSet` | `CopyDataSet` | |
| `copyDataSetHeader` | `CopyDataSetHeader` | |
| `copyDataSetForTemp` | `CopyDataSetForTemp` | |
| `copyDataSetHeaderForTemp` | `CopyDataSetHeaderForTemp` | |
| `__copyDataSetHeaderDummy` (internal) | `CopyDataSetHeaderDummy` | |
| `__cfParseFeature` (internal) | `cfParseFeature` | |
| `fillGridHeaderTotalCnt` | `FillGridHeaderTotalCnt` | |
| `fillGridHeaderTotalCntEsg` | `FillGridHeaderTotalCntESG` | |
| `comboCbDataSet` | `Combo_CBDataSet` | CBData 문자열 → itemArr 교체 |
| `comboCbDataSetLimit` | `Combo_CBDataSetLimit` | CBData 문자열 → itemArr 교체 |
| `comboCbDataSetPeriod` | `Combo_CBDataSetPeriod` | CBData 문자열 → itemArr 교체 |
| `getComboTextValue` | `fn_getComboTextValue` | |
| `panelMsg` | `PanelMsg` | innerHTML → setValue/show 교체 |
| `setFromToDate` | `fn_setFromToDate` | |
| `setButtonSetWithDate` | `setButtonSetWithDate` | |
| `setButtonSetWithDate2` | `setButtonSetWithDate2` | |
| `setButtonSetWithDateBnd` | `setButtonSetWithDateBnd` | |
| `getNewBzProcNo` | `fn_getNewBzProcNo` | |
| `getNewApplNo` | `fn_getNewApplNo` | |
| `checkDutyTimeStatus` | `fn_checkDutyTimeStatus` | |
| `openDisclViewer` | `fn_OpenDisclViewer` | 2/3인자 중복정의 → 단일 통합 |
| `openNoDisclViewer` | `fn_OpenNoDisclViewer` | 9/10인자 중복정의 → 단일 통합 |
| `openDisclAllList` | `fn_OpenDisclAllList` | |
| `openKindList` | `fn_OpenKINDList` | |
| `openDisclDigitalAllList` | `fn_OpenDisclDigitalAllList` | |
| `doLogSave` | `doLogSave` | |
| `createXmlObj4LogSave` | `createXMLObj4LogSave` | |
| `startLogSave` | `startLogSave` | |
| `__chkStats4LogSave` (internal) | `chkStats4LogSave` | |
| `__viewParameter4LogSave` (internal) | `viewParameter4logSave` | |
| `getConnRsnCdNm1` | `fn_GetConnRsnCdNm1` | |
| `getConnRsnCdNm2` | `fn_GetConnRsnCdNm2` | |

### 9.5 `$c.trk` — 분석/트래킹 (fil·ins·mgt 공유, 동일 알고리즘)

origin 은 fil·ins = `logger_tracking.xml`, mgt = `common.xml` (동일 `_trk_*` 함수셋).

| TO-BE (`$c.trk.*`) | AS-IS 원본 | origin | 모듈 |
| --- | --- | --- | --- |
| `trkEscape` | `_trk_escape` | logger_tracking.xml / common.xml | fil/ins/mgt |
| `trkSetCookie` | `_trk_setCookie` | logger_tracking.xml / common.xml | fil/ins/mgt |
| `trkGetCookie` | `_trk_getCookie` | logger_tracking.xml / common.xml | fil/ins/mgt |
| `trkGetParameter` | `_trk_getParameter` | logger_tracking.xml / common.xml | fil/ins/mgt |
| `trkMakeCode` | `_trk_make_code` | logger_tracking.xml / common.xml | fil/ins/mgt |
| `trkFlashContentsView` | `_trk_flashContentsView` | logger_tracking.xml / common.xml | fil/ins/mgt |
| `trkClickTrace` | `_trk_clickTrace` | logger_tracking.xml / common.xml | fil/ins/mgt |
| `trkAdClick` | `_trk_adClick` | logger_tracking.xml / common.xml | fil/ins/mgt |

### 9.6 `$c.print` — 인쇄/리포트 (fil·ins·stf 공유, 모듈별 함수셋 상이, origin: `report.xml`)

**모듈** 열은 해당 함수가 정의된 `print.xml` 의 출처 모듈이다. stf 는 데이터셋→JSON 변환을 세분화(`makeDtsToJson1/2/3*`)했고, ins 는 단일 `makeDtsToJson` 으로 통합했다.

| TO-BE (`$c.print.*`) | AS-IS 원본 | 모듈 |
| --- | --- | --- |
| `openReport` | `fn_open_report` | ins/stf |
| `openReportYear` | `fn_open_report_year` | ins/stf |
| `openReportPdf` | `fn_open_report_pdf` | ins/stf |
| `printPreView` | `fn_PrintPreView` | fil/ins/stf |
| `extractParam` | `fn_ExtractParam` | stf |
| `makeDtsToArrOut` | `fn_make_dtsToArrOut` | stf |
| `makeDtsToArr1Wdf` | `fn_make_dtsToArr1_wdf` | stf |
| `makeDtsToJsonOut` | `fn_make_dtsToJsonOut` | stf |
| `makeDtsToJson1` | `fn_make_dtsToJson1` | stf |
| `makeDtsToJson1Wdf` | `fn_make_dtsToJson1_wdf` | stf |
| `makeDtsToJson1WdfWsum` | `fn_make_dtsToJson1_wdf_wsum` | stf |
| `makeDtsToJson2` | `fn_make_dtsToJson2` | stf |
| `makeDtsToJson2Wdf` | `fn_make_dtsToJson2_wdf` | stf |
| `makeDtsToJson3Wdf` | `fn_make_dtsToJson3_wdf` | stf |
| `makeDtsToJson` | `fn_make_dtsToJson` | ins |
| `getDtsValue` | `fn_getDtsValue` | stf |
| `dataFormatValue` | `fn_dataFormatValue` | ins/stf |

> 본 9장은 각 gcc XML 의 JSDoc `(AS-IS: …, origin: …)` 주석에서 자동 취합한 표다. 함수 추가/이름변경 시 해당 XML 의 `@name`·`publicInfo`·JSDoc 과 함께 이 표도 동기화한다.

## 10. 규칙 5 컴포넌트 API 치환 (규칙 7 과 별개)

이 표는 1~9장(레거시 **함수명** → gcc 함수 치환, 규칙 7)과 성격이 다른 **규칙 5(코드 문법·컴포넌트 API 최적화)** 의 컴포넌트 API 치환이다 — 속성 직접 대입(`{컴포넌트}.속성 = v;`)을 표준 setter 호출로, 레거시 메서드명을 표준 메서드명으로 바꾼다. `gcc_mapping.py`(규칙 7 SOT) 가 파싱하는 대상이 아니며, 변환기 `convert.py` 가 결정적으로 처리한다.

| AS-IS | TO-BE | 처리 | 비고 |
| --- | --- | --- | --- |
| `{컴포넌트}.value = v;` | `{컴포넌트}.setValue(v);` | convert.py 규칙 5b | 대입만 치환(읽기 `x = obj.value` 제외), 문자열·주석·정규식 리터럴 보호 |
| `{컴포넌트}.src = v;` | `{컴포넌트}.setBackgroundImage(v);` | convert.py 규칙 5c | 대입만 치환(읽기 `x = obj.src` 제외), 문자열·주석·정규식 리터럴 보호 |
| `{dataCollection}.getTotalRow()` | `{dataCollection}.getRowCount()` | convert.py 규칙 5d | 메서드명만 치환(수신 객체·인자 보존), 리터럴 보호. 맵 `_METHOD_RENAME_MAP` 으로 확장 가능 |

> 규칙 정의는 [conversion_rules.md](conversion_rules.md) §규칙 5, 파이프라인상 위치는 [conversion_pipeline.md](conversion_pipeline.md) 단계 1 표를 참조한다.

## 11. 규칙 19 원시 JSP/jQuery 페이지 → WebSquare/gcc (대체·재설계, 단계 2)

이 표는 WebSquare 가 아닌 **원시 HTML·JSP·jQuery 레거시 페이지**(예: `inf/srch/ULDINF20000`, `inf/comm/ULDINF90400`)의 DOM/jQuery/JSP 호출을 WebSquare 컴포넌트 메서드·`$c.*` 로 옮기는 매핑이다. **전 항목 단계 2(Claude) 판단·재설계** 이며 `convert.py` 결정적 치환 대상이 아니다. **선행조건**: HTML `<input>/<select>/<form>` 을 `<w2:*>` 컴포넌트로 재구성한 뒤 적용한다(`#id` → 컴포넌트 id 일치 전제). 컴포넌트 참조는 id 직접 사용 또는 `$c.util.getComponent("id")`.

| AS-IS (jQuery/DOM/JSP) | TO-BE (WebSquare/gcc) | 비고 |
| --- | --- | --- |
| `$("#id").val()` | `id.getValue()` | |
| `$("#id").val(v)` | `id.setValue(v)` | |
| `$("#id").focus()` | `id.setFocus()` | |
| `$("#id").show()` / `.attr("style","display:;")` | `id.show("")` | 규칙 14 인자 규약 |
| `$("#id").hide()` / `…display:none…` | `id.hide()` | |
| `$("#id").css(p, v)` / 표시제어 외 `.attr("style", …)` | `id.setStyle(p, v)` | |
| `$("#id").text(v)` / `$("#id").html(v)` | `id.setValue(v)` | 출력 컴포넌트 |
| `$("#id").attr("disabled"\|"readonly", …)` | `id.setReadOnly(true/false)` | 컴포넌트 속성에 맞춤 |
| `$(sel).bind/on("click"\|"change"…, fn)` | 컴포넌트 `ev:on*="scwin.{comp}_{event}"` | 규칙 3 계열, 스크립트 바인딩 제거 |
| `document.{폼}.{필드}.value` (읽기/쓰기) | `{필드}.getValue()` / `{필드}.setValue(v)` | |
| `document.{폼}.submit()` / `$.ajax`·`$.post(…)` | `$c.sbm.executeDynamic(sbmOptions)` | 규칙 6/16 계열(대체), 응답·콜백 재설계 |
| `$.parseJSON(x)` | `$c.util.getJSON(x)` (또는 `JSON.parse(x)`) | |
| `window.open(url, …)` | `$c.win.openPopup(url, options, data)` | 규칙 17 계열 |
| `new Date(…)` / 수기 날짜연산(`getFullYear`/`substr`) | `$c.date.*` (`getServerDateTime`/`addDate`/`formatDate`) | 규칙 18 의 `date.xml` 소속 |
| `<c:out value='${x}'/>` / `${x}` (JSP EL) | submission 응답(DataMap/DataList) 또는 `$c.util.getParameter` | 서버주입값 — 단순 치환 불가, 재설계 |

> 규칙 정의·식별 신호·선행조건은 [conversion_rules.md](conversion_rules.md) §규칙 19 를 참조한다. 마크업 재구성 없이 스크립트만 바꾸면 참조가 깨지므로 마크업·스크립트를 함께 변환한다. 문자열/주석/리터럴·HTML UI 텍스트(한글 라벨)는 보호한다.
