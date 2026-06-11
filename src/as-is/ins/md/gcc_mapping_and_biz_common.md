# 🛠️ gcc 매핑 & 신규 업무공통 명세서 (ins 모듈)

> [`ins_function_analysis_report.md`](./ins_function_analysis_report.md) 의 B그룹(공통이관/업무공통) 함수를 실행 관점에서 정리한 명세.
> 매핑 대상 gcc 함수는 모두 해당 파일 `<w2:publicInfo>` 에 **실재함을 확인**했다(검증 완료).

---

## 1. 기존 gcc 공통함수 매핑 대상 (공통이관)

**조치 원칙: 기존 gcc 공통함수를 그대로 유지·재사용하며, 신규 함수로 치환하지 않는다.** 레거시 함수에 gcc 가 포함하지 못한 기능이 있거나 수정이 필요한 경우에 한해 **기존 gcc 함수를 보완**한다(레거시 함수는 폐기, 호출부는 gcc 함수 사용).

### 대상 파일: `src/gcc/str.xml` ($c.str)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `trim` / `lTrim` / `rTrim` | `Trim/LTrim/RTrim`, `fn_Trim`, `funcTrim/Rtrim/Ltrim`, `trim` | 유지 |
| `replaceAll` | `replaceAll`, `MTrim`, `cRmString`, `removeChar`, `fn_DelChar(2~5)`, `fn_DelPoint`, `fn_delString`, `Del_Point`, `fn_IgnoreSpaces`, `fn_condUrl(2)` | 유지(빈문자 치환·공백제거 포함) |
| `lpad` | `lpad`, `cGetZero`, `fillZero`, `addZero`, `fnLeg`, `setDateMmDd` | 유지 |
| `isEmail` | `email_chk`, `CheckEmail`, `fn_CheckEmail`, `IsValidEmail` | 유지 |
| `isSSN` | `cIsJumin`, `isSocialNO` | 유지 — 주민번호 검증 통합 |
| `isBizID` | `cIsResno`, `cIsBupin`(법인등록번호) | **보완 검토** — 법인등록번호는 사업자번호와 체계 상이 |
| `isPhone` | `IsTel` | 유지 |
| `isKorean` / `existKorean` | `isHangul`, `fn_DelChar4` | 유지 |
| `getByteLength` | `strLength`, `GetByte`, `getStringSize`, `fn_GetByte`, `fn_IsExceedMaxLen`, `fn_CheckByte`, `fn_CalcContn`, `getByteLength` | 유지 |

### 대상 파일: `src/gcc/num.xml` ($c.num)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `isNumber` | `isNum`, `isNumber`(common/stock/kosdaq, 원본 로직결함), `Chk_Digit*`, `fn_IsNumber(_val)`, `isDigit`, `non_zero`, `isMinusNum` | 유지 — 레거시 결함 대체 |
| `parseInt` / `parseFloat` | `toNum`(기본값 처리) | **보완** — 기본값 인자 처리 검토 |
| `formatNumber` | `FormatNumberEx`, `formatNumbertoString`, `numOnMask*`, `setNumberTypeWithComma*`, `applyComma`, `Add_*Comma`, `moneyType`, `number_format`, `addComma(Minus)` | 유지 |
| `formatMoney` | `getMoneyType`, `getSignMoneyType`, `numOnMask4/6`, `Add_Comma` | 유지 |
| `unFormatNumber` | `rtnNumber`, `getOnlyNumber*`, `numOffMask`, `Del_MoneyComma*`, `getOnlyNum` | 유지 |
| `numberToKor` | `fn_int2han`, `fn_ChgAmtToHan`, `num2won(_zero)` | 유지 |

### 대상 파일: `src/gcc/date.xml` ($c.date)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `isDate` / `isLeafYear` | `isDate`, `isDate0`, `cIsLeafYear` | 유지 |
| `getLastDateOfMonth` | `cGetMaxDay`, `lastDay` | 유지 |
| `addDate` | `cGetPlusDate(2)`, `cGetMinusDate(2)`, `calcDate`, `fn_setDate(_future)`, `fn_incDte`, `dateAddDel` | 유지 — 음수 offset 가감산 통합 |
| `addMonth` | `cGetPlusMonth(2)`, `cGetMinusMonth`, `calcMonth`, `fn_setMonth(_future)`, `fn_incMth`, `addMonth` | 유지 |
| `addYear` | `cGetPlusYear`, `cGetMinusYear`, `calcYear`, `fn_setFullYear(_future)` | 유지 |
| `diffDate` | `cGetDifTodayInputday`, `getDayInterval`, `fn_getPeriod`, `fn_checkMonth`, `validateStartDateAndToDateWithRange` | 유지 |
| `formatDate` | `cGetToday(2)`, `todate`, `FormatDateEx`, `fn_setSysDate`, `fn_dte2str` | 유지 — 오늘=서버시간이면 `getServerDateTime` |
| `dateFormat` / `dateUnFormat` | `cal_value2`, `fn_convCalDate`, `chkDate`, `fn_str2dte` | 유지 |
| `dateCompare` | `compareFromToDate(2)`(로직), `fn_checkDay`, `validateStartDateAndToDate`, `chkPeriod_Emedit` | 유지(단, ins 화면용 alert/focus 결합본은 `$c.ins.compareFromToDate*` 로 별도 제공) |

### 대상 파일: `src/gcc/util.xml` ($c.util)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `isEmpty` / `isNotEmpty` | `cIsNull`, `isEmpty`, `fn_IsNull`, `fn_NullChk`, `fn_IsNotNull` | 유지 |
| `getParameter` | `getQuery`, `_trk_getParameter`(검토) | 유지 |
| `getComponent` | `$`(filing_trans), DOM shorthand | 유지 |
| `setCookie` / `getCookie` | `_trk_setCookie/getCookie`(검토) | 유지 — 트래킹은 `$c.trk` 보존 |
| `isArray` | `isInArr`(배열 포함검사 보조) | 유지 |

### 대상 파일: `src/gcc/validate.xml` ($c.validate)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `isValidDate` | `fCheckDate`, `fn_CheckDate(Gn)` | 유지 |
| `setComponentProperty` | `showObj`(표시/숨김) | 유지 |

### 대상 파일: `src/gcc/win.xml` ($c.win)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `openPopup` | `pop`, `fn_PopManual`, `historyChgName`, `openNews`, `openDisclosureView`, `fn_PopupCorpChangeInfo` | 유지 |
| `moveUrl` | `goURL` | 유지 |
| `confirm` | `fn_alertDelConfirm` | 유지 |
| `getProgramId` | `InfoMenuID`(검토) | 유지 |

### 대상 파일: `src/gcc/data.xml` ($c.data)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `serializeFormToQueryString` | `formData2QueryString`, `fn_ExtractParam` | 유지 |
| `getMessage` | (KRX 고유 메시지 테이블은 `$c.ins.getMessageParam` 로 별도 보존) | 보완 검토 |
| `loadHoliday` | `fn_TrHoldyYn`(영업일 판정, 서버연동) | 보완 검토 |

### 대상 파일: `src/gcc/sbm.xml` ($c.sbm) — 레거시 원시 XHR
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `execute` / `executeDynamic` | `requestXMLHTTP`, `requestAsyncXMLHTTP`, `sendMessage`, `getXMLHttpRequest`, `responseTextXMLHTTP` | 유지 — 원시 XHR 폐기 |

### 대상 파일: `src/gcc/session.xml` ($c.session)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `sessionCheck` | `startTimer`, `req4sessionExtn`, `restartTimer`, `initTime` (sessionTimer.xml) | 유지 — jQuery 의존 제거 후 통합 |

---

## 2. 신규 업무공통함수 관리 리스트 (gcc 미매핑)

> 기존 gcc 에 동등 기능이 없어 **별도 '업무공통' 모듈로 관리/추가 구현**이 필요한 KRX 고유 기능.

### 2.0 `$c.ins` 로 선별 이관 완료 (핵심 공통, 20개)

| 함수명 (`$c.ins.*`) | 입력 파라미터 | 반환값 | 기능 요약 | AS-IS / origin |
| :--- | :--- | :--- | :--- | :--- |
| `jongmokSearchReset` | `()` | `void` | 종목검색 상태변수 초기화 | JongmokSearch_Reset / stockSearch.xml |
| `jongmokSearchRtn` | `(sval1, sval2)` | `void` | 종목검색 결과(코드/명) 반환 (주식·선물) | JongmokSearch_Rtn / stockSearch.xml |
| `jongmokSearchRtn2` | `(sval1..sval4)` | `void` | 종목검색 결과 + 발행사 반환 (ELW·수익증권) | JongmokSearch_Rtn2 / stockSearch.xml |
| `getObjectValue` | `(obj)` | `String` | 명명규칙(rdo/edt/cmb/txa)으로 컴포넌트 값 get | getObjectValue / stf.xml |
| `setObjectValue` | `(obj, value)` | `void` | 명명규칙으로 컴포넌트 값 set | setObjectValue / stf.xml |
| `checkEmptyValue` | `(obj, msg)` | `Boolean` | 공백 검사 + alert·focus | checkEmptyValue / stf.xml |
| `checkMaxLength` | `(obj, size, lbl)` | `Boolean` | 바이트 최대길이 검사(한글 2byte) | checkMaxLength / stf.xml |
| `setFromToDate` | `(pTp, pObjFrom, pObjTo)` | `void` | 기간구분(1~6)으로 From/To 일자 설정 | fn_setFromToDate / stf.xml |
| `setFromToDate1` | `(pTerm, pObjFrom, pObjTo)` | `void` | 기간문자열(3d/3m/3y)로 From/To 설정 | fn_setFromToDate1 / stf.xml |
| `compareFromToDate` | `(fromDate, toDate, fromMsg, toMsg)` | `Boolean` | From>To 비교 + alert | compareFromToDate / stf.xml |
| `compareFromToDate2` | `(objSDate, objEDate)` | `Boolean` | 검색 시작>종료 비교 + alert·focus | compareFromToDate2 / stf.xml |
| `getMessageParam` | `(key, targetMsg)` | `String` | KRX 메시지 테이블 조회 + `^` 치환 | getMessageParam / stf.xml |
| `getStdCdToStdTpCd` | `(stdCdApplContnTpCd, type2)` | `String` | 표준코드 신청구분→상세유형코드 매핑 | get_stdcd2stdTpCd / function.xml |
| `toHex4` | `(originalString)` | `String` | 문자열→4자리 Hex 인코딩 | StringToHex4 / person.xml |
| `fromHex4` | `(encodeData)` | `String` | 4자리 Hex→문자열 디코딩 | Hex4ToStr / person.xml |
| `createXmlObj4LogSave` | `()` | `void` | 로그저장 XHR 객체 생성 | createXMLObj4LogSave / stf.xml |
| `startLogSave` | `(ver1, ver2)` | `void` | 화면접근로그 비동기 전송 | startLogSave / stf.xml |
| `chkStats4LogSave` | `()` | `void` | 로그저장 XHR 상태 콜백 | chkStats4LogSave / stf.xml |
| `viewParameter4LogSave` | `()` | `void` | 로그저장 응답 확인 | viewParameter4logSave / stf.xml |
| `doLogSave` | `(ver1, ver2, ver3)` | `void` | 로그저장 전체 흐름 실행 | doLogSave / stf.xml |

### 2.1 분석/트래킹 `$c.trk` (8) — `trk.xml` (origin: logger_tracking.xml)
`trkEscape`, `trkSetCookie`, `trkGetCookie`, `trkGetParameter`, `trkMakeCode`, `trkFlashContentsView`, `trkClickTrace`, `trkAdClick`. (AS-IS `_trk_*`. 외부 트래킹 init 에서 상태/이미지 객체 주입 필요)

### 2.2 문서 인쇄 `$c.print` (6) — `print.xml` (origin: report.xml)
`openReport`, `openReportYear`, `openReportPdf`, `printPreView`, `makeDtsToJson`, `dataFormatValue`. (Rexpert 런타임 필요. `yearanulfee_print`의 `fn_pre_print_*` 도 본 모듈 편입 후보)

### 2.3 업무공통(화면 전용 / 별도 관리 대상)
> gcc·`$c.ins` 미편입. KRX 화면 도메인에 강하게 결합되어 화면(또는 도메인 모듈) 단위로 관리한다.

| 도메인 | 대표 함수 | origin |
| :--- | :--- | :--- |
| 메뉴 라우팅 | `menuLink`, `menuLinkVal`, `menuAuthLink`, `menuAuthElsDlsLink`, `returnMenuLink` | function.xml |
| 업무 팝업(검색/조회) | `fn_popup*`(20+), `find*`/`fnFindCorp*`/`findElwIsu`/`findEtnIsu`, `companysummary_open`/`etfisusummary_open`, `openDisclsViewer*` | function.xml, JCommon.xml |
| 발행사/제출인/기초자산 검색 | `fn_com_isur(_sync/_nm)`, `fn_com_Confirm_set(2)`, `isurSearch_Rtn`, `submitSearch_Rtn`, `uly_Rtn`, `ins_popupRtn_*` | common.xml, kosdaqonline.xml |
| 공통코드 콤보 | `ins_combo_set(2)`, `fn_ResetCdValue`, `ins_cfi_set` | common.xml |
| 비밀번호 보안정책 | `checkPwdStr(2)`, `checkPwd(2)`, `ins_clearPwd` | function.xml, common.xml |
| 종목코드 검색 | `jongObj`, `findcode(New)`, `getCodeName`, `searchCode`, `beforefindCode`, `go_Stock` | person.xml |
| 관리종목/상장 업무규칙 | `fn_getMst(_K/_ICR_K)Status`, `fn_isValidityAdmisuRsnCd`, `fn_mst_check`, `fn_check_bz_doubleinput`, `fn_chk*SymblDoubleInput` | list_common.xml |
| 데이터셋 가공/검증 | `fn_isNewValueForDataSet`, `fn_getRowIdx`, `mergeDtsDataForDdTm`*, `divideDtsDataForDdTm`*, `checkDdTm(_2)`, `fn_CheckGridDataset` | list_common.xml, pre_newlisting.xml |
| ELW 수신/상장 | `fn_elw*_read_sync`(11), `fn_searchCode`, `fn_setCheckBox`, `fn_OpenDetailRecv`, `fn_getArrIsuNmInfo` | elw_recv_common.xml |
| 신규상장/예심 | `fn_getCorpInfo_read_sync`, `fn_corp_read_sync`, `fn_checkDoubleInput`, `fn_createListNo`, `fn_init*GridData`, `fn_set*GridData` | pre_newlisting.xml, listing_iss_common.xml |
| 예비목록 페이지 | `fn_PrelistPageSearch`, `fn_ChangePage`, `fn_New/Edit/Delete56/789/10`, `fn_SetCheckBoxValue`, `fn_SetRadioValue` | prelist.xml |
| 보호예수 매각금지기간 | `fn_getTrdAlwMnt`, `fn_getAlwDte`, `fn_calFbdTrm`, `fn_calCtr`, `fn_difMth`, `fn_setCodCtr` | protected_dep_cal.xml |
| 접속/문서 로그 | `fn_connStratLog`, `fn_connEndLog`, `fn_getScRenLogSeq`, `WinClose(Popup)`, `fn_GetRecvDocProvider` | hindr.xml, list_common.xml |
| 파일 업로드 검증 | `fn_getFileNm(1)`, `file_browse`, `checkLineFile`, `sumAttachedFilesSize` | fileUpload.xml |
| 공시 URL/조회 | `getURL(2)`, `invoke(2)`, `fn_OpenListDisclView` | uldstf92003_search.xml, list_common.xml |
| 적출/거래상태 | `fn_get_search_taskdd`, `fn_get_trstatcd` | utils_detect.xml |
| 라디오/체크박스 유틸 | `fn_IsChecked`, `fn_GetCheckedValue`, `fn_GetMultiCheckedValue`, `fn_ChkAlphaNum`, `fn_SetPhoneValue` | filing_common.xml |

(*는 W-Craft `X` 변환 미완 — 이관 전 원본 검증 필요)

---

## 부록: 분류 기준 요약
- **삭제(A1~A5 + 폐기):** 달력 / 레이아웃(resize·position·키이벤트·포커스) / 패널 style / 파일·엑셀 다운로드 / 진행바·로딩 / jQuery·Flash·ActiveX·서드파티·미사용 stub → 이관 제외.
- **공통이관(B1):** 위 §1 — 기존 gcc 함수를 유지·재사용(필요 시 보완), 레거시 함수는 폐기. 원시 XHR→`$c.sbm`, 세션타이머→`$c.session`, 폼직렬화→`$c.data`.
- **업무공통(B2):** 위 §2 — gcc 미보유 KRX 고유 공통 기능. 핵심 20개는 `$c.ins`, 트래킹 8개는 `$c.trk`, 인쇄 6개는 `$c.print` 로 이관 완료. 그 외 화면 전용 비즈니스 로직은 별도 관리 대상으로 카탈로그화.

## 검증
- `python -m wsxml_lint src/as-is/ins/gcc` → **`3 files, 0 errors, 0 warnings`**.
