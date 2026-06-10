# 📊 mgt 폴더 함수 추출 및 분류 마스터 리포트

> `src/as-is/mgt` 의 모든 화면 함수(`scwin.*`)를 추출하여 이관/삭제 여부를 분류한 마스터 문서.
> TO-BE 공통 위치: `src/gcc`. **본 문서는 분석 가이드이며 소스는 수정하지 않는다.**

## 집계 요약

- **분석 대상:** `src/as-is/mgt` 18개 `.xml` 파일, **196개** `scwin.*` 함수(기계적 인벤토리 기준).
- **분류 규칙:** A그룹(삭제) = A1 달력 · A2 레이아웃(resize/position) · A3 패널 style · A4 파일/엑셀 다운로드 · A5 진행바(Progress) / B그룹 = 공통이관(기존 gcc 매핑) · 업무공통(gcc 미매핑).
- **범위 주의:** 화면 간 호출 대상인 `scwin.*` 함수만 집계한다. 화면 내부 지역 `function foo()` 헬퍼(예: 달력 내부 보조 함수, `common.xml` 의 `fn_OpenDisclViewer_MGT` 등)는 이관 단위가 아니므로 제외.

| 분류 | 함수 수 |
| :--- | ---: |
| A그룹(삭제/제외) | 약 116 |
| B-공통이관(gcc 매핑) | 약 48 |
| B-업무공통(gcc 미매핑) | 약 32 |
| **합계** | **196** |

---

## 1. 순수 A그룹 파일 — 파일 단위 요약 (전체 삭제/제외)

해당 파일의 모든 함수가 A그룹(또는 프레임워크 산출물)이므로 개별 나열 대신 요약한다.

| 원본 파일명 | 함수 수 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 삭제 사유 |
| :--- | ---: | :---: | :--- | :--- |
| `filing_calendar.xml` | 26 | **삭제 대상** | N/A | [A1] 달력 컴포넌트 제어 전체 (월/년 네비게이션, 휴일, 렌더링) |
| `filing_calendar2.xml` | 26 | **삭제 대상** | N/A | [A1] `filing_calendar` 의 날짜포맷 변형판(YYYY-MM-DD) — 중복 달력 |
| `PopupCalendar.xml` | 26 | **삭제 대상** | N/A | [A1] 팝업 달력 컴포넌트 전체 |
| `controlResize.xml` | 4 | **삭제 대상** | N/A | [A2] `OnSized`/`OnSizedMax`/`OnWinStat`/`GauceObjResize` — 창/그리드 리사이즈 |
| `libRoundPanel.xml` | 3 | **삭제 대상** | N/A | [A3] `KRX_PanelToGroupBox*` — 패널 라운드 style 제어 |
| `libRoundPanel2.xml` | 3 | **삭제 대상** | N/A | [A3] `libRoundPanel` 의 이미지경로 변형판 — 중복 패널 style |
| `ShiftCrossBrowser_ver.2.4.min.xml` | 12 | **제외(프레임워크)** | N/A | 서드파티 크로스브라우저 플러그인 래퍼(min 번들). 업무공통 아님 |

소계: **100개** 함수.

---

## 2. 혼합/업무 파일 — 함수별 분류

### `common.xml` (15)

| 함수명 | 기능 설명 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 사유 |
| :--- | :--- | :---: | :--- | :--- |
| `PanelToGroupBox` | 패널 className 따라 라운드 style 분기 | **삭제 대상** | N/A | [A3] 패널 style |
| `PanelToGroupBox_01` | TopCondition_01 패널 라운드 처리 | **삭제 대상** | N/A | [A3] 패널 style |
| `PanelToGroupBox_02` | Description_01 패널 라운드 처리 | **삭제 대상** | N/A | [A3] 패널 style |
| `FileDown1` | 버튼1 파일 다운로드 | **삭제 대상** | N/A | [A4] 파일 다운로드 |
| `FileDown2` | 버튼2 파일 다운로드 | **삭제 대상** | N/A | [A4] 파일 다운로드 |
| `MdiHelp` | 화면 도움말 뷰어 오픈 | **업무공통** | 별도 관리 | gcc 미매핑(도움말 연동) |
| `InfoMenuID` | 현재 메뉴 ID 반환 | **공통이관** | `$c.win.getProgramId` | 프로그램/메뉴 식별 |
| `_trk_escape` | 트래킹 문자열 escape | **업무공통** | 별도 관리 | 분석/트래킹 모듈군 |
| `_trk_setCookie` | 트래킹 쿠키 설정 | **업무공통** | 별도 관리 | 분석/트래킹 모듈군 |
| `_trk_getCookie` | 트래킹 쿠키 조회 | **업무공통** | 별도 관리 | 분석/트래킹 모듈군 |
| `_trk_getParameter` | 트래킹 파라미터 조회 | **업무공통** | 별도 관리 | 분석/트래킹 모듈군 |
| `_trk_make_code` | 트래킹 코드 생성 | **업무공통** | 별도 관리 | 분석/트래킹 모듈군 |
| `_trk_flashContentsView` | 컨텐츠 뷰 트래킹 | **업무공통** | 별도 관리 | 분석/트래킹 모듈군 |
| `_trk_clickTrace` | 클릭 트래킹 | **업무공통** | 별도 관리 | 분석/트래킹 모듈군 |
| `_trk_adClick` | 광고 클릭 트래킹 | **업무공통** | 별도 관리 | 분석/트래킹 모듈군 |

### `utils.xml` (29) — 대부분 기존 gcc 와 중복(공통이관)

| 함수명 | 기능 설명 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 사유 |
| :--- | :--- | :---: | :--- | :--- |
| `trim` | 양끝 공백 제거 | **공통이관** | `$c.str.trim` | 중복 |
| `lpad` | 좌측 패딩 | **공통이관** | `$c.str.lpad` | 중복 |
| `cGetZero` | 0 패딩 | **공통이관** | `$c.str.lpad` | 중복 |
| `replaceAll` | 문자열 전체 치환 | **공통이관** | `$c.str.replaceAll` | 중복 |
| `cRmString` | 특정 문자 제거 | **공통이관** | `$c.str.replaceAll` | 빈문자 치환 |
| `email_chk` | 이메일 형식 검증 | **공통이관** | `$c.str.isEmail` | 중복 |
| `isNum` | 숫자 여부 | **공통이관** | `$c.num.isNumber` | 중복 |
| `toNum` | 숫자 변환(기본값) | **공통이관** | `$c.num.parseFloat` | 중복 |
| `cIsNull` | null/빈문자 검사 | **공통이관** | `$c.util.isEmpty` | 중복 |
| `isDate` | 날짜 유효성 | **공통이관** | `$c.date.isDate` | 중복 |
| `cIsLeafYear` | 윤년 검사 | **공통이관** | `$c.date.isLeafYear` | 중복 |
| `cGetMaxDay` | 해당 월 최대 일수 | **공통이관** | `$c.date.getLastDateOfMonth` | 중복 |
| `cGetToday` | 오늘 날짜(포맷) | **공통이관** | `$c.date.formatDate` | 서버시간은 `$c.date.getServerDateTime` |
| `cGetToday2` | 오늘 날짜 | **공통이관** | `$c.date.formatDate` | 중복 |
| `cGetPlusDate` / `cGetPlusDate2` | 일 가산 | **공통이관** | `$c.date.addDate` | 중복 |
| `cGetPlusMonth` | 월 가산 | **공통이관** | `$c.date.addMonth` | 중복 |
| `cGetPlusYear` | 년 가산 | **공통이관** | `$c.date.addYear` | 중복 |
| `cGetMinusDate` / `cGetMinusDate2` | 일 감산 | **공통이관** | `$c.date.addDate` | 음수 가산 |
| `cGetMinusMonth` | 월 감산 | **공통이관** | `$c.date.addMonth` | 음수 가산 |
| `cGetMinusYear` | 년 감산 | **공통이관** | `$c.date.addYear` | 음수 가산 |
| `calcDate` | 일 연산 | **공통이관** | `$c.date.addDate` | 중복 |
| `calcMonth` | 월 연산 | **공통이관** | `$c.date.addMonth` | 중복 |
| `calcYear` | 년 연산 | **공통이관** | `$c.date.addYear` | 중복 |
| `cGetDifTodayInputday` | 두 날짜 차이 | **공통이관** | `$c.date.diffDate` | 중복 |
| `cIsJumin` | 주민등록번호 검증 | **공통이관** | `$c.str.isSSN` | 중복 |
| `cIsResno` | 주민/외국인 번호 검증 | **공통이관** | `$c.str.isSSN` | 중복 (validate.isSecurityNumber 통합·삭제됨) |
| `cIsBupin` | 법인등록번호 검증 | **공통이관(검토)** | `$c.str.isBizID` | 사업자번호와 상이 — 별도 검토 |

### `mgt.xml` (25)

| 함수명 | 기능 설명 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 사유 |
| :--- | :--- | :---: | :--- | :--- |
| `trim` | 공백 제거 | **공통이관** | `$c.str.trim` | 중복 |
| `replaceAll` | 문자열 치환 | **공통이관** | `$c.str.replaceAll` | 중복 |
| `FormatNumberEx` | 천단위 숫자 포맷 | **공통이관** | `$c.num.formatNumber` | 중복 |
| `getMessageParam` | 메시지 파라미터 치환 조회 | **공통이관** | `$c.data.getMessage` | 중복 |
| `getQuery` | URL 파라미터 추출 | **공통이관** | `$c.util.getParameter` | 중복 |
| `todate` / `todate_slash` | 오늘 날짜 포맷 | **공통이관** | `$c.date.formatDate` | 중복 |
| `compareFromToDate` | From/To 일자 비교 | **공통이관** | `$c.date.dateCompare` | 중복 |
| `compareFromToDate2` | From/To 일자 비교(obj) | **공통이관** | `$c.date.dateCompare` | 중복 |
| `getObjectValue` | 컴포넌트 값 조회 | **공통이관(검토)** | `$c.util.getComponent` | 값 get 래퍼 |
| `setObjectValue` | 컴포넌트 값 설정 | **공통이관(검토)** | `$c.util.getComponent` | 값 set 래퍼 |
| `showObj` | 컴포넌트 표시/숨김 | **공통이관(검토)** | `$c.validate.setComponentProperty` | visible 제어 |
| `alert_error` | 에러 객체 메시지 alert | **공통이관** | `$c.win.alert` + `$c.data.getMessage` | 조합 대체 |
| `PanelMsg` | 패널 영역 메시지 표시 | **업무공통** | 별도 관리 | (`$c.win.showToastMessage` 검토) |
| `fn_setFromToDate` | From/To 일자 쌍 설정 | **업무공통** | 별도 관리 | 날짜범위 UI 헬퍼 |
| `FillGridHeaderTotalCnt` | 그리드 헤더 건수 표시 | **업무공통** | 별도 관리 | gcc 미매핑 |
| `Combo_CBDataSetPeriod` | 기간 콤보 데이터셋 구성 | **업무공통** | 별도 관리 | gcc 미매핑 |
| `CopyDataSet` | 데이터셋 복사 | **업무공통** | 별도 관리 | gcc 미매핑 |
| `CopyDataSetHeader` | 데이터셋 헤더 복사 | **업무공통** | 별도 관리 | gcc 미매핑 |
| `cfParseFeature` | feature 플래그 파싱 | **업무공통** | 별도 관리 | `CopyDataSet` 보조 |
| `createXMLObj4LogSave` | 로그저장 XML 객체 생성 | **업무공통** | 별도 관리 | 로그저장 모듈군 |
| `startLogSave` | 로그저장 시작 | **업무공통** | 별도 관리 | 로그저장 모듈군 |
| `chkStats4LogSave` | 로그저장 상태 점검 | **업무공통** | 별도 관리 | 로그저장 모듈군 |
| `viewParameter4logSave` | 로그저장 파라미터 확인 | **업무공통** | 별도 관리 | 로그저장 모듈군 |
| `doLogSave` | 로그저장 실행 | **업무공통** | 별도 관리 | 로그저장 모듈군 |

### `filing_common.xml` (7)

| 함수명 | 기능 설명 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 사유 |
| :--- | :--- | :---: | :--- | :--- |
| `chkDate` | 날짜 마스킹(YYYY-MM-DD) | **공통이관** | `$c.date.dateFormat` | 중복 |
| `chkDate2` | 시간 마스킹(HH:MM:SS) | **공통이관** | `$c.date.dateFormat` | 중복 |
| `cal_offMask` | 날짜 마스킹 제거 | **공통이관** | `$c.date.dateUnFormat` | 중복 |
| `cal_offMask2` | 시간 마스킹 제거 | **공통이관** | `$c.date.dateUnFormat` | 중복 |
| `rtnNumber` | 문자열에서 숫자만 추출 | **공통이관** | `$c.num.unFormatNumber` | 중복 |
| `pop` | 팝업 윈도우 오픈 | **공통이관** | `$c.win.openPopup` | 중복 |
| `goURL` | URL 이동 | **공통이관** | `$c.win.moveUrl` | 중복 |

### `filing_trans.xml` (7) — 레거시 원시 AJAX(→ `$c.sbm` 대체)

| 함수명 | 기능 설명 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 사유 |
| :--- | :--- | :---: | :--- | :--- |
| `$` | id 로 DOM 엘리먼트 조회(jQuery 풍) | **공통이관(대체)** | `$c.util.getComponent` | DOM shorthand |
| `getXMLHttpRequest` | XHR 객체 생성 | **공통이관(대체)** | `$c.sbm.*` | 원시 XHR |
| `requestXMLHTTP` | XHR 요청 | **공통이관(대체)** | `$c.sbm.execute` | 원시 XHR |
| `responseTextXMLHTTP` | XHR 응답 텍스트 | **공통이관(대체)** | `$c.sbm.*` | 원시 XHR |
| `sendMessage` | 비동기 메시지 전송 | **공통이관(대체)** | `$c.sbm.executeDynamic` | 원시 XHR |
| `onCompleteResponse` | 응답 핸들러(stub) | **삭제 대상** | N/A | stub/미사용 |
| `formData2QueryString` | 폼 → 쿼리스트링 변환 | **공통이관** | `$c.data.serializeFormToQueryString` | gcc/data.xml 로 이관·리팩토링 완료 |

### `filing_progress.xml` (4)
> 전체가 [A5] 진행바 삭제 대상.

| 함수명 | 기능 설명 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 사유 |
| :--- | :--- | :---: | :--- | :--- |
| `createBar` | 진행바 컴포넌트 생성 | **삭제 대상** | N/A | [A5] 진행바 UI 생성 함수 |
| `startBar` | 진행바 애니메이션 | **삭제 대상** | N/A | [A5] 진행바 애니메이션 제어 |
| `togglePause` | 진행바 일시정지 토글 | **삭제 대상** | N/A | [A5] 진행바 제어 (본문 2회 중복 정의) |

### `session.xml` (2)

| 함수명 | 기능 설명 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 사유 |
| :--- | :--- | :---: | :--- | :--- |
| `sessionCheck` | 세션 유효성 점검/리다이렉트 | **공통이관** | `$c.session.sessionCheck` | 신규 공통 모듈 gcc/session.xml 로 이관·리팩토링 완료 |
| `getExcelDownPath` | 엑셀 다운로드 경로 반환 | **삭제 대상** | N/A | [A4] 엑셀 다운로드 보조 |

### `stockSearch.xml` (4)

| 함수명 | 기능 설명 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 사유 |
| :--- | :--- | :---: | :--- | :--- |
| `isNumber` | 숫자 문자열 검증 | **공통이관** | `$c.num.isNumber` | 중복 |
| `JongmokSearch_Reset` | 종목검색 변수 초기화 | **업무공통** | 별도 관리 | KRX 종목검색 |
| `JongmokSearch_Rtn` | 종목검색 결과 반환 | **업무공통** | 별도 관리 | KRX 종목검색 |
| `JongmokSearch_Rtn2` | 종목검색 결과 반환(발행사) | **업무공통** | 별도 관리 | KRX 종목검색 |

### 단일 함수 파일

| 원본 파일명 | 함수명 | 기능 설명 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 사유 |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `alert_error.xml` | `alert_error` | 에러 객체 메시지 alert | **공통이관** | `$c.win.alert` + `$c.data.getMessage` | `mgt.xml` 동명 함수와 동일 |
| `commonlogin.xml` | `ArfObjectUnLappedFnc` | ARF 래퍼 엘리먼트 제거 | **삭제 대상** | N/A | 레거시 ARF(리포트 플러그인) 연동 DOM 처리 — 미사용/폐기 |
| `mgt_gauce.xml` | `fn_findRow` | 데이터셋 행 검색 | **공통이관** | `$c.data.getMatchedJSON` | 조건 매칭 행 검색을 gcc 공통함수로 대체 |

---

소계(혼합/업무 파일): **96개** 함수 → 1번 소계(100) + 본 소계(96) = **196개** (인벤토리 총계 일치).

후속 명세는 [`gcc_mapping_and_biz_common.md`](./gcc_mapping_and_biz_common.md) 참조.
