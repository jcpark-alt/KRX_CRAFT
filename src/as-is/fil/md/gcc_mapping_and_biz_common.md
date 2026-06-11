# 🛠️ gcc 매핑 & 신규 업무공통 명세서 (fil 모듈)

> [`fil_function_analysis_report.md`](./fil_function_analysis_report.md) 의 B그룹(공통이관/업무공통) 함수를 실행 관점에서 정리한 명세.
> 매핑 대상 gcc 함수는 모두 해당 파일 `<w2:publicInfo>` 에 **실재함을 확인**했다(검증 완료).
> `fil` 은 ins/stf 와 동일·사촌 사본을 다수 보유하므로, 공통이관 매핑과 화면 전용 업무공통 카탈로그는 ins 명세를 계승하고 중복을 피한다.

---

## 1. 기존 gcc 공통함수 매핑 대상 (공통이관)

**조치 원칙: 기존 gcc 공통함수를 그대로 유지·재사용하며, 신규 함수로 치환하지 않는다.** 레거시 함수에 gcc 가 포함하지 못한 기능이 있거나 수정이 필요한 경우에 한해 **기존 gcc 함수를 보완**한다(레거시 함수는 폐기, 호출부는 gcc 함수 사용).

### 대상 파일: `src/gcc/str.xml` ($c.str)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `trim` / `lTrim` / `rTrim` | `fn_Trim`, `Trim/LTrim/RTrim/MTrim`, `funcTrim/Rtrim/Ltrim` | 유지 |
| `replaceAll` | `removeChar`, `fn_IgnoreSpaces`, `Del_Hypen(2)`, `Del_Point(2)`, `replacePercent`, `fn_ReplaceKeyword`, `replaceAll` | 유지(빈문자 치환·공백제거 포함) |
| `lpad` | `fn_AddZero`, `fnLPAD`, `fillZero`, `addZero` | 유지 |
| `isEmail` | `fn_CheckEmail`, `fn_checkEmail`, `CheckEmail`, `fn_emailFrontCheck`/`fn_emailBackCheck`, `email_chk` | 유지 |
| `isSSN` | `fn_JuminCheck`, `isSocialNO`, `isFgnSocialNO` | 유지 — 주민번호 검증 통합 |
| `isPhone` | `fn_checkPhoneNumber`, `IsPhone`/`IsTelChar`/`IsTel` | 유지 |
| `isKorean` / `existKorean` | `isHangul` | 유지 |
| `getByteLength` | `fn_getCheckByte`, `fn_getAsciiLength`, `fn_checkLength(2/3)`, `fn_CheckStringLength`, `fn_StrCharByte`, `GetByte`/`byteCheck`/`cutMsg`/`reCount`, `fn_GetByte`/`fn_CheckByte`/`fn_CalcContn`/`fn_IsExceedMaxLen`, `getByteLength`, `fn_CheckMaxLength` | 유지 |

### 대상 파일: `src/gcc/num.xml` ($c.num)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `isNumber` | `fn_checkNumber`, `fn_checkNum(2)`, `fn_OnlyNum`, `isMinusNum`, `fn_IsNumber`, `Chk_Digit`/`Chk_Number`/`NumberCheck`, `Chk_Sosu*`/`DemicalCheck*`/`fn_minusCheck*`, `Chk_Percent`, `non_zero` | 유지 — 레거시 결함 대체 |
| `formatNumber` | `fn_NumberFormat`, `fn_ValueSetComma`, `fn_insertComma`, `moneyType`, `number_format`, `fn_checkNumFormat` | 유지(정수). **소수점·음수 보존 콤마는 `$c.fil.setComma` 로 별도 제공** |
| `formatMoney` | `Add_MoneyComma(_Value)`, `Add_Money`, `Add_Comma`, `getMoneyType` | 유지 |
| `unFormatNumber` | `getOnlyNum`, `Del_MoneyComma(_Value)`, `Del_Comma`, `fn_removeComma` | 유지 |
| `numberToKor` | `num2won(_zero)` | 유지 |

### 대상 파일: `src/gcc/date.xml` ($c.date)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `isDate` / `isLeafYear` | `chkDate2`, `Chk_Date(2)`, `isDate(YMD/MD/YM)` | 유지 |
| `addMonth` | `addMonth(2)`, `fn_setMonth(_future)`, `fn_incMth` | 유지 |
| `addDate` / `addYear` | `fn_setDate(_future)`, `fn_setFullYear(_future)`, `calcDate`, `dateAddDel` | 유지 — 음수 offset 통합 |
| `diffDate` | `getDayInterval`, `getDuration`, `fn_getPeriod`, `fn_checkMonth` | 유지 |
| `formatDate` | `getCurrentDate`, `fnToday`, `dateToyyyyMMdd`, `fn_GetCurrentTime`(시각부), `fn_setSysDate` | 유지 — 오늘=서버시간이면 `getServerDateTime` |
| `dateFormat` / `dateUnFormat` | `fn_convCalDate`, `cal_value2`, `fn_str2dte` | 유지 |

### 대상 파일: `src/gcc/util.xml` ($c.util)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `isEmpty` / `isNotEmpty` | `fn_IsNull`, `fn_NullChk`, `fn_IsNotNull`, `isEmpty` | 유지 |
| `getCookie` / `setCookie` | `getCookie`, `_trk_setCookie/getCookie`(검토 — 트래킹은 `$c.trk` 보존) | 유지 |
| `getParameter` | `getQuery`, `_trk_getParameter`(검토) | 유지 |

### 대상 파일: `src/gcc/validate.xml` ($c.validate)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `isValidDate` | `fn_CheckDate(Gn)`, `fn_checkDate`, `fn_IsValidDateComm` | 유지 |

### 대상 파일: `src/gcc/win.xml` ($c.win)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `openPopup` | `fn_PopManual`, `fn_openNotice`/`fn_openFAQ`/`fn_openBondAppInfo`/`fn_openBizForm`/`fn_openFeeInfo`/`fn_openFeeCalc`(bnf), `pop`/`openwin*` | 유지 |
| `confirm` | (처리 확인은 화면 메시지 결합본 `$c.fil.confirmProcess` 로 별도 제공) | 유지 |

### 대상 파일: `src/gcc/data.xml` ($c.data)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `serializeFormToQueryString` | `formData2QueryString` | 유지 |

### 대상 파일: `src/gcc/sbm.xml` ($c.sbm) — 레거시 원시 XHR
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `execute` / `executeDynamic` | `requestXMLHTTP`, `requestAsyncXMLHTTP`, `sendMessage`, `getXMLHttpRequest`, `responseTextXMLHTTP`, `createXMLHttpRequest` | 유지 — 원시 XHR 폐기 |

### 대상 파일: `src/gcc/session.xml` ($c.session)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `sessionCheck` | `startTimer`, `req4sessionExtn`, `restartTimer`, `initTime` (sessionTimer.xml / sessionTimerOuter.xml / bnf) | 유지 — jQuery 의존 제거 후 통합 |

---

## 2. 신규 업무공통함수 관리 리스트 (gcc 미매핑)

> 기존 gcc 에 동등 기능이 없어 **별도 '업무공통' 모듈로 관리/추가 구현**이 필요한 KRX 고유 기능.

### 2.0 `$c.fil` 로 선별 이관 완료 (핵심 공통, 7개)

| 함수명 (`$c.fil.*`) | 입력 파라미터 | 반환값 | 기능 요약 | AS-IS / origin |
| :--- | :--- | :--- | :--- | :--- |
| `setComma` | `(numstr)` | `String` | 소수점·음수 보존 천단위 콤마 | fn_SetComma / digitalNumberFormat.xml |
| `delComma` | `(numstr)` | `String` | 숫자 외 문자 제거·정규화(소수점·음수 보존) | fn_DelComma / digitalNumberFormat.xml |
| `objSetComma` | `(numObj)` | `void` | 컴포넌트 값에 콤마 적용(선행 `.`→`0.`) | fn_ObjValueSetComma / digitalNumberFormat.xml |
| `objRmComma` | `(numObj)` | `void` | 컴포넌트 값 콤마 제거 | fn_ObjValueResetRmComma / digitalNumberFormat.xml |
| `objRmComma2` | `(numObj)` | `void` | 값이 있을 때만 콤마 제거(null/빈값 보존) | fn_ObjValueResetRmComma2 / digitalNumberFormat.xml |
| `confirmProcess` | `(gubun)` | `Boolean` | 저장/수정/삭제/제출 처리 확인 다이얼로그 | fn_isProcess / digitalApplList.xml |
| `getSubmitGubun` | `(nowDate, beforeLogin, businessClosing)` | `Number` | 공시 제출 가능 시간대 판정(0~3) | timeGuBun / currentTime.xml |

내부 헬퍼: `__rmComma`(AS-IS `fn_RmComma`, @hidden Y, publicInfo 미등재) — `objRmComma`/`objRmComma2` 가 사용.

### 2.1 분석/트래킹 `$c.trk` (8) — `trk.xml` (origin: logger_tracking.xml)
`trkEscape`, `trkSetCookie`, `trkGetCookie`, `trkGetParameter`, `trkMakeCode`, `trkFlashContentsView`, `trkClickTrace`, `trkAdClick`. (AS-IS `_trk_*`. ins/stf 의 `$c.trk` 와 동일 알고리즘 — 외부 트래킹 init 에서 상태/이미지 객체 주입 필요)

### 2.2 문서 인쇄 `$c.print` (1) — `print.xml` (origin: report.xml)
`printPreView`(Rexpert 미리보기 + **상장 외부리포트용 MarkAny 위변조방지**). (Rexpert 런타임 필요. 화면별 변형 `fn_PrintPreView_DB`/`_JLDBNF*`/`_JLDINF*` 은 화면 전용으로 별도 관리)

### 2.3 `$c.ins` 재사용 (신규 빌드 없음)
> fil 은 ins 와 동일 사본을 다수 보유한다. 아래는 **새로 만들지 않고 `$c.ins` 를 재사용**한다.

| 도메인 | 재사용 `$c.ins.*` | origin(사본) |
| :--- | :--- | :--- |
| 종목검색 | `jongmokSearchReset`, `jongmokSearchRtn(2)` | stockSearch.xml |
| 컴포넌트 값 get/set | `getObjectValue`, `setObjectValue` | (JCommon/stf 계열) |
| 메시지 | `getMessageParam` | (JCommon 계열) |
| 표준코드 매핑 | `getStdCdToStdTpCd` | function.xml |
| 로그저장 | `doLogSave` 등 | (stf 계열) |

### 2.4 업무공통(화면 전용 / 별도 관리 대상)
> gcc·`$c.fil`·`$c.ins` 미편입. KRX 화면 도메인에 강하게 결합되어 화면(또는 도메인 모듈) 단위로 관리한다.

| 도메인 | 대표 함수 | origin |
| :--- | :--- | :--- |
| 필링 폼검증 오케스트레이터 | `fn_validate`, `chkLpVal`, `fn_getBzDate`, `fn_getFileNm` | digital/etn/lossLimitEtn FormValidate.xml |
| 신청목록 조회 | `fn_DigitalSelectSub`, `fn_EtnSelectSub`, `fn_procsBefIdxEarCheck` | *ApplList.xml |
| 콤마 일괄(화면 필드 하드코딩) | `fn_CommaValueAll`, `fn_RmCommaValueAll(ForKO)` | elw050xx, prelist050xx |
| ELW 발행검증 | `setElw*`, `fn_IsuCheckValues`, `LpCheckValues`, `fn_ulyCheck`, `fn_checkElw*`, `fn_setElwKoExerContnByRghtTpCd` | elwCheck.xml |
| ELW 목록/페이지/저장 | `fn_ElwPageSearch`, `fn_ElwSub`, `batchElwSubmit`, `fn_isPossibleSave`, `fn_chkElwPrc`, `fn_IsValid*` | elw.xml |
| 예심 재무/주주 계산 | `fn_Calc*`(재무제표 15), `fn_*Change`(주주현황 14), `fn_CalcPayDtCapAmt` | prelist05002~05004.xml |
| 예비목록 페이지 | `fn_PrelistPageSearch`, `fn_ChangePage`, `fn_New/Edit/Delete56/789/10`, `fn_SetCheckBoxValue`, `fn_SetRadioValue` | prelist.xml |
| 디지털/상장조사 검색 | `mkSboxOpt`, `fn_OpenIndCodeWin`, `fn_findCompany`, `findComInfo4fee`, `changePage` | digital.xml, listInvstg.xml |
| 채권 업무규칙(bnf) | `Chk_Mkt_Holdy`, `getFstIntPayDd`, `menuTmCheck`, `applTmCheck`, `fn_holdy_princ/int_onchange`, `krxYn` | bondCommon.xml, bondHeader.xml |
| 채권 코드검색(bnf) | `window_inst_cd`, `window_iss_inst_cd`, `window_sales_inst_cd`, `open_co_nm` | bondCommon.xml |
| 채권 상장/변경 검증·산식(bnf) | `CommonCheckValues`, `NewLstCheckValues`, `BulkLstCheckValues`, `add_exe_amt`, `Cal_af_iss_amt`, `Cal_af_lst_amt` | bondListing.xml, isuInfoChg.xml |
| 발행사/공시 검색·뷰어 | `findCompanyName*`, `fnFindCorpName*`, `findElwIsu`/`findEtnIsu`/`findEtfIsu`, `openDisclsViewer*`, `companysummary_open` | JCommon.xml(공통 사본, ins 카탈로그 중복) |
| 표준코드/CFI 검색(inf) | `get_stdcd2stdTpCd`, `getCfiCode`, `fn_tgtBndStdCd`, `fn_objStkStdCd`, `fn_popupInstCdSearch`, `fn_popupIsurCdSearch` | function.xml(공통 사본) |
| 비밀번호 보안정책 | `checkPwd(2)`, `checkPwdStr(2)` | function.xml(공통 사본) |
| 파일 업로드 검증 | `fn_getFileNm(1)`, `fn_fileChk`, `checkLineFile`, `sumAttachedFilesSize` | fileUpload.xml |
| 라디오/체크박스·연락처 유틸 | `fn_IsChecked`, `fn_GetCheckedValue`, `fn_GetMultiCheckedValue`, `fn_SetPhoneValue`, `fn_ChkContactpnt` | common.xml |

---

## 부록: 분류 기준 요약
- **삭제(A1~A5 + 폐기):** 달력 / 레이아웃(resize·position·키이벤트·포커스·iframe) / 패널 style / 파일·엑셀 다운로드 / 진행바·로딩 / jQuery·Flash·ActiveX·서드파티(dTree/datejs/Miya/aes/jQuery-UI)·미사용 stub → 이관 제외.
- **공통이관(B1):** 위 §1 — 기존 gcc 함수를 유지·재사용(필요 시 보완), 레거시 함수는 폐기. 원시 XHR→`$c.sbm`, 세션타이머→`$c.session`, 폼직렬화→`$c.data`.
- **업무공통(B2):** 위 §2 — gcc 미보유 KRX 고유 공통 기능. 핵심 7개는 `$c.fil`, 트래킹 8개는 `$c.trk`, 인쇄 1개는 `$c.print` 로 이관 완료. ins 동일 사본은 `$c.ins` 재사용. 그 외 화면 전용 비즈니스 로직은 별도 관리 대상으로 카탈로그화.

## 검증
- `python -m wsxml_lint src/as-is/fil/gcc` → **`3 files, 0 errors, 0 warnings`**.
- `python -m wsxml_lint src/as-is/fil --ignore WS111,WS112,WS113` → **`114 files, 0 errors, 0 warnings`** (lint:xml:legacy 편입).
