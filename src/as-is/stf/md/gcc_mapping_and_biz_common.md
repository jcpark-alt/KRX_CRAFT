# 🛠️ gcc 매핑 & 신규 업무공통 명세서

> [`stf_function_analysis_report.md`](./stf_function_analysis_report.md) 의 B그룹(공통이관/업무공통) 함수를 실행 관점에서 정리한 명세.
> 매핑 대상 gcc 함수는 모두 해당 파일 `<w2:publicInfo>` 에 **실재함을 확인**했다(검증 완료).

---

## 1. 기존 gcc 공통함수 매핑 대상 (공통이관)

레거시 함수는 아래 기존 gcc 공통함수와 기능이 동일/유사하다. **조치 원칙: 기존 gcc 공통함수를 그대로 유지·재사용하며, 신규 함수로 치환하지 않는다.** 레거시 함수에 gcc 가 포함하지 못한 특정 기능이 있는 경우에 한해 **기존 gcc 함수에 기능을 보완**한다(레거시 함수 자체는 폐기, 호출부는 기존 gcc 함수 사용).

### 대상 파일: `src/gcc/str.xml` ($c.str)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `trim` | `stf.trim`, `utils.trim`, `filing_common.fn_Trim` | 유지 |
| `replaceAll` | `stf.replaceAll`, `utils.replaceAll`, `utils.cRmString` | 유지 |
| `lpad` | `utils.lpad`, `utils.cGetZero` | 유지 |
| `getByteLength` | `stf.getStringSize`, `stf.checkMaxLength`, `filing_common.fn_GetByte`/`fn_CheckByte`, `prelist.getByteLength` | 유지 — byte 길이/최대길이 검증 |
| `isEmail` | `stf.IsValidEmail`, `utils.email_chk`, `filing_common.fn_CheckEmail` | 유지 |
| `isSSN` | `utils.cIsJumin`, `utils.cIsResno` | 유지 |
| `isBizID` | `utils.cIsBupin`(법인등록번호) | **보완** — 사업자번호와 체계 상이, 검증 보완 검토 |
| `escapeToChar` / `isEscapeToChar` | `stf.fn_chkXss` | **보완(검토)** — 위험문자(`\&!=`) 검사 통합 검토 |

### 대상 파일: `src/gcc/num.xml` ($c.num)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `formatNumber` | `stf.FormatNumberEx`, `stf.FormatNumberExESG`, `stf.addComma`, `stf.addCommaMinus` | 유지 — 음수/소수/0 표시 옵션 검토 |
| `unFormatNumber` | `filing_common.removeChar`/`getOnlyNum`, `ods.rtnNumber` | 유지 |
| `isNumber` | `utils.isNum`, `stockSearch.isNumber`, `common.isNumber`, `filing_common.fn_IsNumber` | 유지 |
| `parseFloat` | `utils.toNum` | **보완** — 기본값(default) 인자 처리 |

### 대상 파일: `src/gcc/date.xml` ($c.date)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `dateFormat` / `dateUnFormat` | `stf.FormatDateEx`~`FormatDateMMDD`(11종), `filing_common.fn_CheckDate`, `ods.chkDate`/`cal_offMask` | 유지 — 마스킹/언마스킹 |
| `formatDate` | `utils.cGetToday(2)`, `utils.fn_get_nowDate` | 유지 — 오늘=서버시간이면 `getServerDateTime` |
| `addDate` | `utils.cGetPlusDate(2)`/`cGetMinusDate(2)`/`calcDate`, `protected_dep_cal.fn_incDte` | 유지 — 음수 offset 가감산 통합 |
| `addMonth` | `utils.cGetPlusMonth`/`cGetMinusMonth`/`calcMonth`, `protected_dep_cal.fn_incMth` | 유지 |
| `addYear` | `utils.cGetPlusYear`/`cGetMinusYear`/`calcYear` | 유지 |
| `diffDate` | `utils.cGetDifTodayInputday(Bnd)`, `protected_dep_cal.fn_difMth` | 유지 |
| `isDate` / `isLeafYear` / `getLastDateOfMonth` | `utils.isDate`/`protected_dep_cal.isDate0`, `utils.cIsLeafYear`, `utils.cGetMaxDay` | 유지 |
| `dateCompare` | `stf.compareFromToDate`/`compareFromToDate2`, `filing_common.fn_chkDateCompare` | 유지 |

### 대상 파일: `src/gcc/util.xml` ($c.util)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `isEmpty` | `utils.cIsNull`/`isEmpty`, `stf.checkEmptyValue`, `filing_common.fn_IsNull`/`fn_NullChk` | 유지 |
| `getParameter` | `stf.getQuery` | 유지 |
| `getComponent` | `stf.getObjectValue`/`getObjectText`/`setObjectValue`, `filing_trans.$` | **보완** — 값 get/set 은 `getComponent().getValue/setValue` |

### 대상 파일: `src/gcc/validate.xml` ($c.validate)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `setComponentProperty` | `stf.showObj`(표시/숨김) | 유지 — visible 속성 제어 |

### 대상 파일: `src/gcc/win.xml` ($c.win)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `alert` (+ `$c.data.getMessage`) | `stf.alert_error`, `stf.alert_parse` | 유지 — 에러객체→메시지 조합 |
| `getProgramId` | `stf.InfoMenuID`, `common.InfoMenuID` | 유지 |
| `openPopup` / `moveUrl` | `common.win_open2`/`uldstf92003_search.getURL`, `person.gotoPage` | 유지 |

### 대상 파일: `src/gcc/data.xml` ($c.data)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `getMessage` | `stf.getMessageParam` (+ `stf.messageKeys` 메시지셋) | 유지 — 파라미터 바인딩. 공통 메시지는 `$c.data` 메시지셋으로 통합 검토 |
| `serializeFormToQueryString` | `filing_trans.formData2QueryString` | 유지 — gcc/data.xml 로 이관 완료 |
| `getCommonCode` | `utils_detect.fn_get_*`(영업일/처리상태 코드) | 유지(검토) — 코드 조회 통합 |

### 대상 파일: `src/gcc/sbm.xml` ($c.sbm) — 레거시 원시 AJAX
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `execute` / `executeDynamic` | `filing_trans.requestXMLHTTP`/`sendMessage`/`getXMLHttpRequest`/`responseTextXMLHTTP` | 유지 — 원시 XHR 폐기, 표준 Submission 사용 |

### 대상 파일: `src/gcc/session.xml` ($c.session)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `sessionCheck` | `session.sessionCheck` | 유지 — gcc/session.xml(세션 점검·미로그인 시 로그인 이동) |

---

## 2. 신규 업무공통함수 — `src/as-is/stf/gcc/stf.xml` ($c.stf)

> 기존 gcc 에 동등 기능이 없는 KRX 고유 **업무공통 코어** 함수. `stf.xml` 에서 추출하여 camelCase 표준화 + AS-IS 병기로 빌드 완료(lint 0/0).

### 2.1 데이터셋/그리드 보조
| TO-BE(`$c.stf`) | 입력 | 반환 | 기능 |
| :--- | :--- | :--- | :--- |
| `copyDataSet` | `(oOrigin, oTarget, features)` | `void` | feature 옵션 기반 데이터셋 복사 |
| `copyDataSetHeader` | `(oOrigin, oTarget)` | `void` | 데이터셋 컬럼 헤더 복사 |
| `copyDataSetForTemp` | `(oOrigin, oTarget, features)` | `void` | 매매거래정지 임시보관함 전송용 복사 |
| `copyDataSetHeaderForTemp` | `(oOrigin, oTarget)` | `void` | 임시보관함용 헤더 복사(컬럼 사이즈 보정) |
| `__copyDataSetHeaderDummy` | `(oTarget)` | `void` | (내부) 더미 헤더 초기화 |
| `__cfParseFeature` | `(features, names, values, types)` | `void` | (내부) feature 문자열 파싱 |
| `fillGridHeaderTotalCnt` | `(vRsltCnt, panelID)` | `void` | 그리드 헤더 건수 표시(컴포넌트 API) |
| `fillGridHeaderTotalCntEsg` | `(vRsltCnt, panelID)` | `void` | 건수 표시(0 포함) |

### 2.2 콤보 데이터셋
| TO-BE(`$c.stf`) | 입력 | 반환 | 기능 |
| :--- | :--- | :--- | :--- |
| `comboCbDataSet` | `(sval)` | `void` | 페이지당 건수 콤보(10~전체) itemArr |
| `comboCbDataSetLimit` | `(sval)` | `void` | 건수 콤보(최대 1만 제한) |
| `comboCbDataSetPeriod` | `(sval)` | `void` | 기간 선택 콤보(1주일~2년) |
| `getComboTextValue` | `(obj)` | `String` | 콤보 선택 항목 TEXT 값 |

### 2.3 UI/메시지·기간 일자
| TO-BE(`$c.stf`) | 입력 | 반환 | 기능 |
| :--- | :--- | :--- | :--- |
| `panelMsg` | `(panelID, msg)` | `void` | 패널 영역 메시지 표시(컴포넌트 API) |
| `setFromToDate` | `(pTp, pObjFrom, pObjTo)` | `void` | 기간구분 → From/To 일자 자동 설정 |
| `setButtonSetWithDate` | `(obj, includeCurDate, buttonSet)` | `void` | 기준일 비교 → buttonSet 상태 |
| `setButtonSetWithDate2` | `(gDisclsCd, buttonSet)` | `void` | 미공시건 수정 가능 |
| `setButtonSetWithDateBnd` | `(gDisclsCd, buttonSet)` | `void` | 채권 미공시건 수정 가능 |

### 2.4 업무번호 생성
| TO-BE(`$c.stf`) | 입력 | 반환 | 기능 |
| :--- | :--- | :--- | :--- |
| `getNewBzProcNo` | `(param_Dts)` | `String` | 업무처리번호(BZ_PROCS_NO) 채번 |
| `getNewApplNo` | `(param_Dts)` | `String` | 신청번호(APPL_NO) 채번 |

### 2.5 공시뷰어
| TO-BE(`$c.stf`) | 입력 | 반환 | 기능 |
| :--- | :--- | :--- | :--- |
| `checkDutyTimeStatus` | `(pEmpNo, pAcptNo, pDtsObj)` | `void` | 당번 개시/마감 등록정보 조회 |
| `openDisclViewer` | `(pAcptNo, pViewerStat[, pScrenID])` | `void` | 공시뷰어 열기 |
| `openNoDisclViewer` | `(pAcptNo, pViewerStat, pEmpNo, pDepCd, pJobtitl, pDuty, pDutyChrg, pScrnTpCd, pDtsObj[, pScrenID])` | `void` | 당번 권한 점검 후 미공개 공시뷰어 |
| `openDisclAllList` | `()` | `void` | 제출보고서 전체 목록(전역 gIsurCd) |
| `openKindList` | `()` | `void` | 제출보고서 목록(KIND, 비공개 비표시) |
| `openDisclDigitalAllList` | `()` | `void` | 디지털 제출보고서 목록 |

### 2.6 로그 저장 (Action 미경유 활동 로그)
| TO-BE(`$c.stf`) | 입력 | 반환 | 기능 |
| :--- | :--- | :--- | :--- |
| `doLogSave` | `(ver1, ver2[, ver3])` | `void` | 활동 로그 저장 실행 |
| `createXmlObj4LogSave` | `()` | `void` | 로그 XHR 객체 생성 |
| `startLogSave` | `(ver1, ver2)` | `void` | 로그 저장 URL 호출 |
| `__chkStats4LogSave` | `()` | `void` | (내부) 응답 상태 점검 |
| `__viewParameter4LogSave` | `()` | `void` | (내부) 결과 표시 |

### 2.7 연결주석 사유 텍스트
| TO-BE(`$c.stf`) | 입력 | 반환 | 기능 |
| :--- | :--- | :--- | :--- |
| `getConnRsnCdNm1` | `(pCode)` | `String` | 연결대상종속회사 연결구분 툴팁 텍스트 |
| `getConnRsnCdNm2` | `(pCode)` | `String` | 연결제외종속회사 연결구분 툴팁 텍스트 |

---

## 3. 모듈 잔류 업무공통 (도메인별 향후 모듈화 검토)

상장/공시 화면에 강결합된 업무 로직(`common`/`list_common*`/`bns_common`/`*_newlisting`/`*_recv_common`/`person`/`ods`/`hindr` 등)은 화면과 함께 모듈에 잔류한다. 재사용 가치가 충분히 확인되면 도메인 단위(예: `$c.list`, `$c.bns`, `$c.isur`)로 분리하는 것을 권장하나, 본 단계의 `$c.stf` 추출 범위에는 포함하지 않는다.

---

## 부록: 분류 기준 요약
- **삭제(A1~A6):** 달력 / 레이아웃(resize·position) / 패널 style / 파일·엑셀 다운로드 / 진행바 / 외부의존(jQuery·Flash·에디터·ARF) → 이관 제외.
- **공통이관(B1):** §1 — 기존 gcc 함수 유지·재사용(필요 시 보완), 레거시 함수 폐기.
- **업무공통(B2):** §2 — gcc 미보유 KRX 고유 코어 기능 → `$c.stf` 추출. 화면 강결합 업무 로직은 §3 모듈 잔류.
- **print 분리:** 인쇄/리포트(`report.xml`, `*_print.xml`, `fn_print`) → `print.xml`($c.print) 별도 모듈.
