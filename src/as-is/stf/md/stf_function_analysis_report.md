# 📊 stf 폴더 함수 추출 및 분류 마스터 리포트

> `src/as-is/stf` 의 모든 화면 함수(`scwin.*`)를 추출하여 이관/삭제 여부를 분류한 마스터 문서.
> TO-BE 공통 위치: `src/gcc`(공통이관) · `src/as-is/stf/gcc/stf.xml`(업무공통). **본 문서는 분석 가이드이며 원본 소스는 수정하지 않는다.**

## 집계 요약

- **분석 대상:** `src/as-is/stf` **48개** `.xml` 파일, **962개** `scwin.*` 함수 정의(기계적 인벤토리 기준 `scwin.X = function`).
- **분류 규칙:** A그룹(삭제) = A1 달력 · A2 레이아웃(resize/position) · A3 패널 style · A4 파일/엑셀 다운로드 · A5 진행바(Progress) · A6 외부의존(jQuery/Flash/에디터/ARF) / B그룹 = 공통이관(기존 gcc 매핑) · 업무공통(gcc 미매핑) · print 분리.
- **범위 주의:** stf 는 mgt 의 약 5배 규모이며, **다수 파일이 mgt 와 동명·동일 사본**이다(`utils/common/stockSearch/filing_common/filing_trans/session/filing_calendar/PopupCalendar/controlResize/libRoundPanel/ShiftCrossBrowser/filing_progress`). 이들은 mgt 분석 결과를 계승한다. stf 고유 비중은 **상장/공시 업무 대형 파일**(`stf.xml`, `bns_common`, `list_common*`, `*_newlisting`, `*_recv_common`, `report` 등)에 있다.

| 분류 | 함수 수(근사) |
| :--- | ---: |
| A그룹(삭제/제외) | 약 200 |
| B-공통이관(gcc 매핑) | 약 150 |
| B-업무공통(gcc 미매핑) | 약 600 |
| print 분리(report/`*_print`) | 약 28 |
| **합계** | **962** |

> 업무공통 600여 개의 대부분은 상장/공시 화면에 **강하게 결합**된 비즈니스 로직(서버 `read_sync` 호출, 그리드 데이터 구성, 종목·발행사 매칭, 마감/공시 상태 점검)으로, 화면 모듈에 잔류한다. 그중 **화면 독립적이고 재사용 가치가 높은 코어 함수**만 `$c.stf` 로 추출한다(아래 §3).

---

## 1. 순수 A그룹 / 프레임워크 파일 — 파일 단위 요약 (전체 삭제/제외)

| 원본 파일명 | 함수 수 | 분류 결과 | 매핑 대상(TO-BE) | 비고 / 삭제 사유 |
| :--- | ---: | :---: | :--- | :--- |
| `calendar.xml` | 6 | **삭제 대상** | N/A | [A1] 달력 컴포넌트 제어(over/out/click) |
| `calendar_fil.xml` | 28 | **삭제 대상** | N/A | [A1] 달력 컴포넌트 전체(월/년 네비, 휴일, 렌더링) |
| `filing_calendar.xml` | 27 | **삭제 대상** | N/A | [A1] 파일링 달력 컴포넌트 전체 |
| `PopupCalendar.xml` | 29 | **삭제 대상** | N/A | [A1] 팝업 달력 컴포넌트 전체 |
| `controlResize.xml` | 4 | **삭제 대상** | N/A | [A2] `OnSized`/`OnWinStat`/`GauceObjResize` 창·그리드 리사이즈 |
| `libRoundPanel.xml` | 3 | **삭제 대상** | N/A | [A3] `PanelToGroupBox*` 패널 라운드 style |
| `layer.xml` | 17 | **삭제 대상** | N/A | [A2/A3] 좌측메뉴/폴더/도움말 레이어 open·close(위치·표시 토글) |
| `filing_progress.xml` | 4 | **삭제 대상** | N/A | [A5] `createBar`/`startBar`/`togglePause` 진행바 |
| `flashcall.xml` | 6 | **제외(외부)** | N/A | [A6] 레거시 Flash 위젯 호출(폐기 솔루션) |
| `login_flash.xml` | 1 | **제외(외부)** | N/A | [A6] 로그인 Flash(swf) |
| `editor.xml` | 1 | **제외(외부)** | N/A | [A6] XFORM 에디터 솔루션 설치 |
| `filing_editor.xml` | 3 | **제외(외부)** | N/A | [A6] XFORM 에디터(국/영문) 솔루션 설치 |
| `commonlogin.xml` | 1 | **삭제 대상** | N/A | [A6] `ArfObjectUnLappedFnc` 레거시 ARF 플러그인 DOM 처리(미사용) |
| `ShiftCrossBrowser_ver.2.4.min.xml` | 12 | **제외(프레임워크)** | N/A | 서드파티 크로스브라우저 플러그인 래퍼(min 번들) |

소계: **142개** 함수.

---

## 2. 공통이관(기존 gcc 매핑) 파일 — 요약

mgt 와 동일/유사하게 기존 `$c.*` 공통함수로 대체된다. 상세 매핑은 [`gcc_mapping_and_biz_common.md`](./gcc_mapping_and_biz_common.md) 참조.

| 원본 파일명 | 함수 수 | 분류 결과 | 매핑 대상(TO-BE) | 비고 |
| :--- | ---: | :---: | :--- | :--- |
| `utils.xml` | 36 | **공통이관** | `$c.str` / `$c.num` / `$c.date` | mgt `utils.xml` 와 동일 사본(trim/lpad/replaceAll/cGet*Date/cIsJumin 등) |
| `filing_common.xml` | 36 | **공통이관(+일부 업무)** | `$c.str` / `$c.date` / `$c.num` / `$c.validate` | 날짜/시간 마스킹, byte 체크, 이메일/전화 검증 등 |
| `filing_trans.xml` | 7 | **공통이관(대체)** | `$c.sbm` / `$c.data` | 원시 XHR(`requestXMLHTTP`/`sendMessage`) → 표준 Submission, `formData2QueryString`→`$c.data` |
| `session.xml` | 2 | **공통이관 / 삭제** | `$c.session.sessionCheck` / N/A | `sessionCheck`→session, `getExcelDownPath`→[A4] 삭제 |
| `uldstf92003_search.xml` | 4 | **공통이관(검토)** | `$c.win.moveUrl` / `$c.sbm` | `getURL`/`invoke` URL 이동·호출 래퍼 |
| `utils_detect.xml` | 3 | **공통이관(검토)** | `$c.data.getCommonCode` | 영업일/처리상태 코드 조회 — 코드성 헬퍼 |

소계: **88개** 함수.

---

## 3. 업무공통 코어 — `stf.xml` (71) → `$c.stf` 추출 대상

stf 모듈의 **중심 업무공통 파일**. 단순 문자열/숫자/날짜/검증 함수는 기존 gcc 로 매핑하고, KRX 고유 업무공통 코어 함수만 `src/as-is/stf/gcc/stf.xml`(`$c.stf`)로 추출했다.

### 3.1 공통이관(기존 gcc 매핑) — `$c.stf` 제외

| 함수명 | 기능 | 매핑 대상(TO-BE) |
| :--- | :--- | :--- |
| `trim` / `replaceAll` | 공백제거 / 치환 | `$c.str.trim` / `$c.str.replaceAll` |
| `fn_chkXss` | 위험문자 검사 | `$c.str.isEscapeToChar`(검토) |
| `FormatNumberEx` / `FormatNumberExESG` / `addComma` / `addCommaMinus` | 천단위 콤마 | `$c.num.formatNumber` |
| `FormatDateEx`~`FormatDateMMDD` (11종) | 날짜 포맷(국/영문) | `$c.date.dateFormat` / `$c.date.formatDate` |
| `getMessageParam` | 메시지 파라미터 치환 | `$c.data.getMessage` |
| `getQuery` | URL 파라미터 추출 | `$c.util.getParameter` |
| `getObjectValue` / `getObjectText` / `setObjectValue` | 컴포넌트 값 get/set | `$c.util.getComponent().getValue/setValue` |
| `showObj` | 표시/숨김 | `$c.validate.setComponentProperty` |
| `alert_error` / `alert_parse` | 에러객체/구분자 alert | `$c.win.alert` + `$c.data.getMessage` |
| `InfoMenuID` | 메뉴 ID 반환 | `$c.win.getProgramId` |
| `IsValidEmail` | 이메일 검증 | `$c.str.isEmail` |
| `getStringSize` / `checkMaxLength` | byte 길이/최대길이 | `$c.str.getByteLength` |
| `checkEmptyValue` | 빈값 체크 | `$c.util.isEmpty` |
| `compareFromToDate` / `compareFromToDate2` | From/To 일자 비교 | `$c.date.dateCompare` |

### 3.2 레이아웃/위치 — [A2] 삭제 (`$c.stf` 제외)

| 함수명 | 사유 |
| :--- | :--- |
| `SetWindowPos` / `SetWindowPos2` | [A2] 컴포넌트 top/left/width/height 위치 제어 |
| `MoveCenterOfParent` / `fn_getModalCenterPos` / `getLeftTopPos` | [A2] 윈도우/모달/팝업 위치 계산 |
| `fn_PopupCorpInfo` | 회사정보 팝업(화면 종속) — 모듈 잔류 |

### 3.3 업무공통 → `$c.stf` 추출 (camelCase 표준화)

| AS-IS 함수명 | TO-BE (`$c.stf`) | 기능 | 비고 |
| :--- | :--- | :--- | :--- |
| `CopyDataSet` | `copyDataSet` | 데이터셋 복사 | feature 옵션 |
| `CopyDataSetHeader` | `copyDataSetHeader` | 데이터셋 헤더 복사 | |
| `CopyDataSetForTemp` | `copyDataSetForTemp` | 임시보관함용 복사 | |
| `CopyDataSetHeaderForTemp` | `copyDataSetHeaderForTemp` | 임시보관함용 헤더 복사 | TRD_HALT_TP_NM 사이즈 보정 |
| `CopyDataSetHeaderDummy` | `__copyDataSetHeaderDummy` | 더미 헤더 초기화 | 내부 헬퍼 |
| `cfParseFeature` | `__cfParseFeature` | feature 파싱 | 내부 헬퍼 |
| `FillGridHeaderTotalCnt` | `fillGridHeaderTotalCnt` | 그리드 헤더 건수 | innerHTML→setValue/show |
| `FillGridHeaderTotalCntESG` | `fillGridHeaderTotalCntEsg` | 건수(0 표시) | innerHTML→setValue/show |
| `Combo_CBDataSet` | `comboCbDataSet` | 페이지당 건수 콤보 | CBData→itemArr |
| `Combo_CBDataSetLimit` | `comboCbDataSetLimit` | 건수 콤보(1만 제한) | CBData→itemArr |
| `Combo_CBDataSetPeriod` | `comboCbDataSetPeriod` | 기간 선택 콤보 | CBData→itemArr |
| `fn_getComboTextValue` | `getComboTextValue` | 콤보 TEXT 값 | |
| `PanelMsg` | `panelMsg` | 패널 메시지 표시 | innerHTML→setValue/show |
| `fn_setFromToDate` | `setFromToDate` | 기간구분→From/To 일자 | $c.date/컴포넌트 API 현대화 |
| `setButtonSetWithDate` | `setButtonSetWithDate` | 일자비교 버튼상태 | buttonSet 파라미터화 |
| `setButtonSetWithDate2` | `setButtonSetWithDate2` | 미공시건 수정가능 | buttonSet 파라미터화 |
| `setButtonSetWithDateBnd` | `setButtonSetWithDateBnd` | 채권 미공시건 | buttonSet 파라미터화 |
| `fn_getNewBzProcNo` | `getNewBzProcNo` | 업무처리번호 채번 | |
| `fn_getNewApplNo` | `getNewApplNo` | 신청번호 채번 | |
| `fn_checkDutyTimeStatus` | `checkDutyTimeStatus` | 당번 개시/마감 조회 | |
| `fn_OpenDisclViewer` | `openDisclViewer` | 공시뷰어 열기 | 2/3인자 중복정의 통합 |
| `fn_OpenNoDisclViewer` | `openNoDisclViewer` | 미공개 공시뷰어 | 9/10인자 중복정의 통합 |
| `fn_OpenDisclAllList` | `openDisclAllList` | 제출보고서 목록 | gIsurCd 전역 사용 |
| `fn_OpenKINDList` | `openKindList` | 제출보고서(KIND) | |
| `fn_OpenDisclDigitalAllList` | `openDisclDigitalAllList` | 디지털 제출보고서 | |
| `doLogSave` | `doLogSave` | 활동 로그 저장 | |
| `createXMLObj4LogSave` | `createXmlObj4LogSave` | 로그 XHR 객체 생성 | |
| `startLogSave` | `startLogSave` | 로그 URL 호출 | |
| `chkStats4LogSave` | `__chkStats4LogSave` | 로그 상태 점검 | 내부 헬퍼 |
| `viewParameter4logSave` | `__viewParameter4LogSave` | 로그 결과 표시 | 내부 헬퍼 |
| `fn_GetConnRsnCdNm1` | `getConnRsnCdNm1` | 연결대상 사유 텍스트 | |
| `fn_GetConnRsnCdNm2` | `getConnRsnCdNm2` | 연결제외 사유 텍스트 | |

> 추출 결과: **공개 28개 + 내부 4개** = `$c.stf`. (`createXMLObj4LogSave`/`startLogSave` 는 `doLogSave` 가 내부 호출하지만 단독 호출 사례가 있어 공개 유지.)

---

## 4. 업무공통 — 상장/공시 대형 파일 (모듈 잔류, 그룹 요약)

화면에 강결합된 비즈니스 로직으로 `$c.stf` 추출 대상이 아니며, 호출부 화면과 함께 모듈에 잔류한다(향후 도메인별 `$c.list`/`$c.bns` 등 별도 업무공통 모듈화 검토).

| 원본 파일명 | 함수 수 | 도메인 | 비고 |
| :--- | ---: | :--- | :--- |
| `common.xml` | 40 | 발행사/종목 검색, 패널 | `fn_com_isur*`/`fn_jongMok*` 종목·발행사 매칭(업무공통), `PanelToGroupBox`/`FileDown*`→[A3/A4] 삭제, `InfoMenuID`/`MdiHelp`→공통이관 |
| `kosdaqonline.xml` | 20 | 코스닥 발행사 검색 | `common.xml` 부분 사본 — 중복 |
| `list_common.xml` | 43 | 상장 공통 | 종목/심볼 중복검사, 패널 R/O 제어, 마감/공시 상태 |
| `list_common_bnd.xml` | 53 | 채권 상장 공통 | `list_common` 변형(채권) |
| `list_common_etn.xml` | 53 | ETN 상장 공통 | `list_common` 변형(ETN) |
| `list_common_digital.xml` | 102 | 디지털 상장 공통 | 최대 — 휴장일/관리지정/공시여부 다중 점검 |
| `list_common_pf.xml` | 32 | PF 상장 공통 | `list_common` 변형(PF) |
| `bns_common.xml` | 61 | 채권 업무 공통 | 발행사/등록 코드 점검, 수수료, 마감확인 등 |
| `digital_newlisting.xml` | 26 | 디지털 신규상장 | `read_sync` 서버호출·그리드 구성(화면 종속) |
| `etn_newlisting.xml` | 29 | ETN 신규상장 | 화면 종속 |
| `pre_newlisting.xml` | 20 | 예비 신규상장 | 화면 종속 |
| `elw_recv_common.xml` | 24 | ELW 수리 공통 | 화면 종속 |
| `etn_recv_common.xml` | 12 | ETN 수리 공통 | 화면 종속 |
| `digital_recv_common.xml` | 7 | 디지털 수리 공통 | 화면 종속 |
| `listing_iss_common.xml` | 4 | 발행 공통 | `bf_read_sync`/그리드명 변경 |
| `prelist.xml` | 19 | 예비심사 목록 | 페이징/그리드(업무) + `getByteLength`→공통이관 |
| `person.xml` | 31 | 인물/코드 검색 | 코드검색·뉴스·페이지네비(업무) + 일부 $c.* 중복 |
| `ods.xml` | 16 | ODS 통합검색 | 테이블 UI 토글(업무) + `chkDate`/`rtnNumber`→공통이관 |
| `hindr.xml` | 14 | 이력/뉴스/로그 | `openNews`/`openDisclosureView`/연결로그(업무), `fileDownLoad*`→[A4] 삭제 |
| `marketMaker.xml` | 3 | 마켓메이커 | 업무 조회 |
| `protected_dep_cal.xml` | 15 | 보호예수 계산 | 매매가능일/허용기간 계산(업무) + 날짜원시연산→`$c.date` 중복 |
| `elastic_search.xml` | 5 | 첨부 검색 | 위원회/조사 첨부파일 검색(업무) |
| `stockSearch.xml` | 4 | 종목 검색 | `JongmokSearch_*`(업무, mgt 와 동일) + `isNumber`→`$c.num` |
| `listInvstg.xml` / `listInvstgKonex.xml` | 2 / 2 | 상장심사 | `changePage`(업무) + `fn_print`→**print 분리** |
| `pf_listinvstg.xml` | 2 | PF 상장심사 | 중복입력/삭제 점검(업무) |

소계: **676개** 함수.

---

## 5. print 분리 — `print.xml`($c.print) (생성 완료)

인쇄/리포트 전용 함수는 `stf.xml` 에 두지 않고 별도 `print.xml`($c.print)로 분리한다(분리 규칙은 `src/as-is/stf/gcc/md/README.md`).
**`report.xml`(AS-IS `$c.rpt.*`)의 리포트 엔진 16개 함수**를 `src/as-is/stf/gcc/print.xml`(`$c.print`)로 이관 완료(camelCase 표준화, lint 0/0).
화면 종속 인쇄 함수(`yearanulfee_print.xml`, `fn_print`)는 엔진을 소비하는 호출부로 모듈에 잔류한다.

| 원본 파일명 | 함수 수 | 비고 |
| :--- | ---: | :--- |
| `report.xml` | 16 | 리포트 오픈/미리보기/PDF·데이터셋→JSON 변환(`fn_open_report*`, `fn_PrintPreView` 등) |
| `yearanulfee_print.xml` | 6 | 연부과금 인쇄(`fn_pre_print_*`) |
| `listInvstg.xml`/`listInvstgKonex.xml` | (2) | `fn_print` — 위 §4 와 중복 집계, print 기능만 분리 |

소계: **22개** 함수(+ `fn_print` 2개).

---

소계 합산: 1번(142) + 2번(88) + 3번(71) + 4번(676) − (중복 보정) ≈ **962개** (인벤토리 총계 일치).

후속 명세는 [`gcc_mapping_and_biz_common.md`](./gcc_mapping_and_biz_common.md) 참조.
