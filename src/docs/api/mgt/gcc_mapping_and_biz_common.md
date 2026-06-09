# 🛠️ gcc 매핑 & 신규 업무공통 명세서

> [`mgt_function_analysis_report.md`](./mgt_function_analysis_report.md) 의 B그룹(공통이관/업무공통) 함수를 실행 관점에서 정리한 명세.
> 매핑 대상 gcc 함수는 모두 해당 파일 `<w2:publicInfo>` 에 **실재함을 확인**했다(검증 완료).

---

## 1. 기존 gcc 공통함수 매핑 대상 (공통이관)

레거시 함수는 아래 기존 gcc 공통함수와 기능이 동일/유사하다. **조치 원칙: 기존 gcc 공통함수를 그대로 유지·재사용하며, 신규 함수로 치환하지 않는다.** 레거시 함수에 gcc 가 포함하지 못한 특정 기능이 있거나 수정이 필요한 경우에 한해 **기존 gcc 함수에 기능을 보완**한다(레거시 함수 자체는 폐기하고 호출부는 기존 gcc 함수를 사용).

- **유지:** 기존 gcc 함수로 충분 → 그대로 사용(레거시 함수 폐기).
- **보완:** 레거시의 특정 기능/수정 사항을 기존 gcc 함수에 추가·반영.

### 대상 파일: `src/gcc/str.xml` ($c.str)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `trim` | `utils.trim`, `mgt.trim` | 유지 |
| `lpad` | `utils.lpad`, `utils.cGetZero`(0 패딩) | 유지 |
| `replaceAll` | `utils.replaceAll`, `mgt.replaceAll`, `utils.cRmString`(문자 제거) | 유지 |
| `isEmail` | `utils.email_chk` | 유지 |
| `isSSN` | `utils.cIsJumin`, `utils.cIsResno` | 유지 — 주민/외국인 번호 검증 통합 (validate.isSecurityNumber 삭제) |
| `isBizID` | `utils.cIsBupin`(법인등록번호) | **보완** — 사업자번호와 체계 상이, 법인등록번호 검증로직 보완 검토 |

### 대상 파일: `src/gcc/num.xml` ($c.num)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `isNumber` | `utils.isNum`, `stockSearch.isNumber` | 유지 |
| `parseFloat` | `utils.toNum`(기본값 처리) | **보완** — `toNum` 의 기본값(default) 인자 처리 추가 |
| `formatNumber` | `mgt.FormatNumberEx` | 유지 |
| `unFormatNumber` | `filing_common.rtnNumber` | 유지 |

### 대상 파일: `src/gcc/date.xml` ($c.date)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `isDate` | `utils.isDate` | 유지 |
| `isLeafYear` | `utils.cIsLeafYear` | 유지 |
| `getLastDateOfMonth` | `utils.cGetMaxDay` | 유지 |
| `addDate` | `utils.cGetPlusDate(2)`, `utils.cGetMinusDate(2)`, `utils.calcDate` | 유지 — 음수 offset 으로 가감산 통합 |
| `addMonth` | `utils.cGetPlusMonth`, `utils.cGetMinusMonth`, `utils.calcMonth` | 유지 |
| `addYear` | `utils.cGetPlusYear`, `utils.cGetMinusYear`, `utils.calcYear` | 유지 |
| `diffDate` | `utils.cGetDifTodayInputday` | 유지 |
| `formatDate` | `utils.cGetToday(2)`, `mgt.todate`, `mgt.todate_slash` | 유지 — 오늘=서버시간이면 `getServerDateTime` |
| `dateFormat` | `filing_common.chkDate`, `filing_common.chkDate2` | 유지 |
| `dateUnFormat` | `filing_common.cal_offMask`, `filing_common.cal_offMask2` | 유지 |
| `dateCompare` | `mgt.compareFromToDate`, `mgt.compareFromToDate2` | 유지 |

### 대상 파일: `src/gcc/util.xml` ($c.util)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `isEmpty` | `utils.cIsNull` | 유지 |
| `getParameter` | `mgt.getQuery`, `common._trk_getParameter`(검토) | 유지 |
| `getComponent` | `mgt.getObjectValue`/`setObjectValue`, `filing_trans.$` | **보완** — 값 get/set 은 `getComponent().getValue/setValue` 로 처리(필요 시 헬퍼 보완) |
| `setCookie` | `common._trk_setCookie`(트래킹 쿠키) | 유지 — 신규 gcc 쿠키 함수, `expire`→`options.expires` |
| `getCookie` | `common._trk_getCookie`(트래킹 쿠키) | 유지 — 신규 gcc 쿠키 함수 |

> 참고: 신규로 `$c.util` 에 `localStorage`/`sessionStorage` 함수군(`set/get/remove/clear LocalStorage`, `…SessionStorage`)도 추가되었다. mgt 에는 해당 사용처가 없어 매핑 대상은 없으나, 신규/리팩토링 화면에서 영속 저장이 필요할 때 활용한다.

### 대상 파일: `src/gcc/validate.xml` ($c.validate)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `setComponentProperty` | `mgt.showObj`(표시/숨김) | 유지 — visible 속성 제어 |

### 대상 파일: `src/gcc/win.xml` ($c.win)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `openPopup` | `filing_common.pop` | 유지 |
| `moveUrl` | `filing_common.goURL` | 유지 |
| `alert` (+ `$c.data.getMessage`) | `mgt.alert_error`, `alert_error.alert_error` | 유지 — 에러객체→메시지 조합 사용 |
| `getProgramId` | `common.InfoMenuID` | 유지 |

### 대상 파일: `src/gcc/data.xml` ($c.data)
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `getMessage` | `mgt.getMessageParam` | 유지 — 파라미터 바인딩 지원 |

### 대상 파일: `src/gcc/sbm.xml` ($c.sbm) — 레거시 원시 AJAX
| gcc 함수 | 매핑되는 레거시 함수(원본) | 조치 |
| :--- | :--- | :--- |
| `execute` / `executeDynamic` | `filing_trans.requestXMLHTTP`, `sendMessage`, `getXMLHttpRequest`, `responseTextXMLHTTP` | 유지 — 원시 XHR 폐기, 기존 `$c.sbm` 표준 Submission 사용 |

---

## 2. 신규 업무공통함수 관리 리스트 (gcc 미매핑)

> 기존 gcc 에 동등 기능이 없어 **별도 '업무공통' 모듈로 관리/추가 구현**이 필요한 KRX 고유 기능. 도메인별로 묶었다.

### 2.1 종목검색 (`stockSearch.xml`)
| 함수명 | 입력 파라미터 | 반환값 | 기능 요약 및 구현 가이드 |
| :--- | :--- | :--- | :--- |
| `JongmokSearch_Reset` | `()` | `void` | 종목검색 관련 전역/상태 변수 초기화 |
| `JongmokSearch_Rtn` | `(String sval1, String sval2)` | `void` | 종목검색 결과(코드/명) 호출 화면으로 반환(콜백) |
| `JongmokSearch_Rtn2` | `(String sval1..sval4)` | `void` | 종목검색 결과 + 발행사 정보 반환 |

### 2.2 로그 저장 (`mgt.xml`)
| 함수명 | 입력 파라미터 | 반환값 | 기능 요약 및 구현 가이드 |
| :--- | :--- | :--- | :--- |
| `createXMLObj4LogSave` | `()` | `Object` | 로그저장용 XML/요청 객체 생성 |
| `startLogSave` | `(ver1, ver2)` | `void` | 로그저장 프로세스 시작 |
| `chkStats4LogSave` | `()` | `Boolean` | 로그저장 상태/조건 점검 |
| `viewParameter4logSave` | `()` | `String` | 로그저장 파라미터 확인(디버그) |
| `doLogSave` | `(ver1, ver2, ver3)` | `void` | 활동 로그 저장 실행 |

### 2.3 데이터셋/그리드 보조 (`mgt.xml`, `mgt_gauce.xml`)
| 함수명 | 입력 파라미터 | 반환값 | 기능 요약 및 구현 가이드 |
| :--- | :--- | :--- | :--- |
| `CopyDataSet` | `(oOrigin, oTarget, features)` | `void` | feature 옵션 기반 데이터셋 복사 |
| `CopyDataSetHeader` | `(oOrigin, oTarget)` | `void` | 데이터셋 헤더(컬럼) 복사 |
| `cfParseFeature` | `(features, fNameArr, fValueArr, fTypeArr)` | `void` | feature 문자열을 이름/값/타입 배열로 파싱(`CopyDataSet` 보조) |
| `Combo_CBDataSetPeriod` | `(sval)` | `DataSet` | 기간 선택 콤보용 데이터셋 구성 |
| `FillGridHeaderTotalCnt` | `(vRsltCnt, panelID)` | `void` | 그리드 헤더 패널에 결과 건수 표시 |
| `fn_findRow` | `(sval0, sval1, sval2)` | `Number` | 데이터셋에서 컬럼값 조건으로 행 인덱스 검색 |

### 2.4 UI/메시지/세션 (`mgt.xml`, `session.xml`, `commonlogin.xml`, `common.xml`)
| 함수명 | 입력 파라미터 | 반환값 | 기능 요약 및 구현 가이드 |
| :--- | :--- | :--- | :--- |
| `PanelMsg` | `(panelID, msg)` | `void` | 지정 패널 영역에 메시지 표시(토스트와 별개) |
| `fn_setFromToDate` | `(pTp, pObjFrom, pObjTo)` | `void` | 기간타입(pTp)에 따라 From/To 일자 컴포넌트 자동 설정 |
| `sessionCheck` | `()` | `Boolean` | 세션 유효성 점검 후 무효 시 리다이렉트 |
| `ArfObjectUnLappedFnc` | `(CMMT_ID)` | `void` | ARF 래퍼 엘리먼트 제거(로그인 연동 DOM 처리) |
| `MdiHelp` | `(helpType)` | `void` | 화면 도움말 뷰어 오픈 |
| `formData2QueryString` | `(docForm)` | `String` | HTML 폼을 쿼리스트링으로 직렬화 |

### 2.5 분석/트래킹 모듈 `_trk_*` (`common.xml`)
> 외부 분석/트래킹 연동 전용. 한 묶음으로 별도 모듈화 권장(개별 이관 비권장).
> 쿠키 I/O(`_trk_setCookie`/`_trk_getCookie`)는 신규 `$c.util.setCookie`/`getCookie` 로 이관(§1) → 본 목록에서 제외.

| 함수명 | 입력 파라미터 | 반환값 | 기능 요약 |
| :--- | :--- | :--- | :--- |
| `_trk_make_code` | `(_TRK_SERVER, _TRK_U)` | `String` | 트래킹 코드 생성 |
| `_trk_getParameter` | `(name)` | `String` | 트래킹 URL 파라미터 조회(`$c.util.getParameter` 검토) |
| `_trk_escape` | `(_str)` | `String` | 트래킹 문자열 escape |
| `_trk_flashContentsView` | `(_TRK_CP)` | `void` | 컨텐츠 뷰 트래킹 전송 |
| `_trk_clickTrace` | `(_TRK_CKFL, _TRK_CKDATA)` | `void` | 클릭 트래킹 전송 |
| `_trk_adClick` | `(adSvr, svcCode, adCode)` | `void` | 광고 클릭 트래킹 전송 |

### 2.6 검토 대상 (A1~A4 비해당이나 폐기 권장)
| 함수명(파일) | 입력 파라미터 | 반환값 | 비고 |
| :--- | :--- | :--- | :--- |
| `createBar` / `startBar` / `togglePause` (`filing_progress.xml`) | (다수) | `void` | 진행바 UI 컴포넌트. 표준 WebSquare 진행 표시로 대체 권장(업무공통 편입 비권장) |

---

## 부록: 분류 기준 요약
- **삭제(A1~A4):** 달력 / 레이아웃(resize·position) / 패널 style / 파일·엑셀 다운로드 → 이관 제외.
- **공통이관(B1):** 위 §1 — 기존 gcc 함수를 유지·재사용(필요 시 보완), 레거시 함수는 폐기.
- **업무공통(B2):** 위 §2 — gcc 미보유 KRX 고유 공통 기능, 별도 모듈로 관리/구현.
