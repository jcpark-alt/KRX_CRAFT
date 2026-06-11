# stf.xml 함수 추출/수정 내역

`src/as-is/stf/gcc/stf.xml`(`$c.stf`)에 추출·적용한 함수 내역을 정리한다.
원본 `src/as-is/stf/stf.xml`(71개 `scwin.*`)에서 **업무공통(KRX 고유) 코어** 함수만 골라
camelCase 표준화 + AS-IS 원본명 병기(`origin: stf.xml`)로 빌드했다.

## 요약

| 구분 | 함수 | 변경 유형 | 내용 |
|------|------|-----------|------|
| 데이터셋 | `copyDataSet` 외 4 + 내부 2 | **추출** | CopyDataSet 계열 그대로 이관, `cfParseFeature`/`CopyDataSetHeaderDummy`는 내부 `__` 헬퍼화 |
| 그리드/패널 | `fillGridHeaderTotalCnt(Esg)`, `panelMsg` | **수정** | `innerHTML` HTML 구성 → `setValue`/`show` 컴포넌트 API |
| 콤보 | `comboCbDataSet(Limit/Period)` | **수정** | `CBData` 문자열 → `itemArr` 객체 배열 |
| 기간/일자 | `setFromToDate`, `setButtonSetWithDate(2/Bnd)` | **수정** | `$c.ut.cGet*` → `$c.date.*`, 값 get/set → 컴포넌트 API, 숨은 전역 `buttonSet` → 파라미터화 |
| 공시뷰어 | `openDisclViewer`, `openNoDisclViewer` | **수정** | AS-IS 의 인자 수별 **중복 정의(자기재귀 버그)**를 선택적 인자 단일 정의로 통합 |
| 로그저장 | `doLogSave` 외 2 + 내부 2 | **추출** | XHR 로그 저장 그대로 이관, 상태/결과 콜백은 내부 `__` 헬퍼화 |
| 기타 | `getNewBzProcNo`/`getNewApplNo`, `getConnRsnCdNm1/2`, `getComboTextValue`, `checkDutyTimeStatus`, `openDisclAllList`/`openKindList`/`openDisclDigitalAllList` | **추출** | 채번/연결주석/콤보텍스트/당번/제출목록 — 그대로 이관 |

> 공개 **28개** + 내부(`__`) **4개** = 32개. publicInfo 에는 공개 28개만 등재.

---

## 1. 데이터셋/그리드 보조

`CopyDataSet`/`CopyDataSetHeader`/`CopyDataSetForTemp`/`CopyDataSetHeaderForTemp` 는 로직 그대로 이관(camelCase).
보조 함수 `CopyDataSetHeaderDummy`, `cfParseFeature` 는 외부 비노출 내부 헬퍼(`__copyDataSetHeaderDummy`, `__cfParseFeature`, `@hidden Y`)로 전환하고 publicInfo 에서 제외했다.
`cfParseFeature` 내부의 `scwin.trim` 호출은 `$c.str.trim` 으로 교체.

## 2. `fillGridHeaderTotalCnt` / `fillGridHeaderTotalCntEsg` / `panelMsg`

DOM `innerHTML`(HTML 테이블 문자열) 구성 방식을 WebSquare 컴포넌트 API로 교체.

```javascript
// AS-IS
var vTotalArea = "<span ...>총건수: </span><span ...>" + scwin.FormatNumberEx(vRsltCnt) + "</span>";
panelID.innerHTML = "<table ...> ... " + vTotalArea + " ... </table>";

// TO-BE
panelID.setValue(vRsltCnt);
panelID.show("");
```

> 동작 변화: 천단위 콤마·"총건수:" 라벨·HTML 레이아웃 제거, 원값만 전달. `panelID` 는 DOM 엘리먼트가 아닌 컴포넌트(`setValue`/`show` 보유)여야 한다. (mgt 의 동일 수정과 같은 방식)

## 3. `comboCbDataSet` / `comboCbDataSetLimit` / `comboCbDataSetPeriod`

콤보 데이터를 `CBData`(`라벨^값,...`) 문자열에서 `itemArr` 객체 배열로 교체. (라벨^값 매핑은 원본 CBData 와 동일)

```javascript
// AS-IS
sval.CBData = "1주일전^1,1개월전^2,3개월전^3,6개월전^4,1년전^5,2년전^6";

// TO-BE
sval.itemArr = [
    { label: "1주일전", value: 1, orgLabel: "1주일전" },
    ...
];
```

## 4. `setFromToDate` / `setButtonSetWithDate(2/Bnd)`

레거시 의존을 현대화:
- 날짜 연산 `$c.ut.cGetMinusDate2/Month/Year`, `$c.ut.cGetToday` → `$c.date.addDate/addMonth/addYear`, `$c.date.getServerDateTime().substring(0,8)`.
- 값 get/set `scwin.getObjectValue/setObjectValue` → 컴포넌트 `getValue()`/`setValue()` (+ `$c.util.isEmpty`).
- 숨은 전역 `buttonSet` 의존 → **`buttonSet` 파라미터로 명시화**(`setButtonSetWithDate(obj, includeCurDate, buttonSet)` 등). 호출부에서 해당 buttonSet 컴포넌트를 인자로 넘겨야 한다.

## 5. 공시뷰어 `openDisclViewer` / `openNoDisclViewer`

AS-IS 는 같은 이름의 함수를 **인자 수만 다르게 두 번 정의**(2인자→3인자 위임, 9인자→10인자 위임)했는데,
JS 는 오버로드가 없어 **마지막 정의만 유효**하고 2인자 버전은 `scwin.fn_OpenDisclViewer(...)` 를 자기 자신으로 재호출하는 **무한재귀 위험**이 있었다.
이를 **선택적 인자(`pScrenID` 기본값 `''`) 단일 정의**로 통합해 버그를 제거했다.
부서코드 매칭은 긴 `if (pDepCd=='2600' || ...)` 체인을 배열 + 내부 헬퍼 `__isInArr` 로 정리.

> `openDisclViewer`/`openNoDisclViewer`/`open*List` 는 전역 `gIsurCd`, 화면 `frame`, `$c.frame.*` 에 의존한다(레거시 그대로). 호출 화면에 해당 컨텍스트가 있어야 동작한다.

## 6. 로그 저장

`doLogSave`/`createXmlObj4LogSave`/`startLogSave` 는 그대로 이관(camelCase).
모듈 상태 `xmlHttp4LogSave`/`alert4LogSave` 는 `scwin.` 스코프로 보관하고, 콜백 `chkStats4LogSave`/`viewParameter4logSave` 는 내부 헬퍼(`__chkStats4LogSave`/`__viewParameter4LogSave`)로 전환.
화면처리구분코드 상수(`SCREN_PROCS_TP_CD_01`~`08`)도 `scwin.` 스코프 상수로 포함.

---

## 분리 규칙: 문서 print(인쇄/리포트) 관련 함수 → `print.xml`

공통함수 중 **인쇄/리포트(출력) 관련 함수**는 `stf.xml` 에 두지 않고
같은 폴더의 별도 파일 `print.xml`(`meta_screenId="$c.print"`)로 분리해 생성한다.

**분리 대상 판별** — 다음 중 하나라도 해당하면 print 함수로 보고 `print.xml` 로 이관한다.

- 함수명이 print/인쇄/출력/리포트 의미를 가짐 (`*print*`, `*Print*`, `fn_print*`, `fn_open_report*`, `*_print` 등).
- 브라우저 인쇄(`window.print()`) 또는 리포트/문서 출력 솔루션(`$c.rpt.*` 등)을 호출.
- 인쇄용 문서/미리보기 생성·데이터셋→리포트 변환을 목적으로 함.

**stf 의 print 후보** (마스터 리포트 §5): `report.xml`(16, `fn_open_report*`/`fn_PrintPreView`/`fn_make_dtsToJson*`),
`yearanulfee_print.xml`(6, `fn_pre_print_*`), `listInvstg.xml`/`listInvstgKonex.xml` 의 `fn_print`.

### print.xml 생성 완료 (`$c.print`)

`report.xml`(AS-IS 소비 네임스페이스 `$c.rpt.*`)의 **리포트 엔진 16개 함수**를 `src/as-is/stf/gcc/print.xml`(`$c.print`)로 분리·생성했다(camelCase 표준화 + AS-IS 병기, lint 0/0).

| AS-IS (report.xml) | TO-BE (`$c.print`) | 비고 |
|---|---|---|
| `fn_open_report_year` / `fn_open_report` | `openReportYear` / `openReport` | Rexpert preview 팝업 |
| `fn_PrintPreView` | `printPreView` | 디버그 `alert` 제거 |
| `fn_ExtractParam` | `extractParam` | form → 쿼리스트링 |
| `fn_open_report_pdf` | `openReportPdf` | Rexpert → PDF POST |
| `fn_make_dtsToArrOut` / `fn_make_dtsToArr1_wdf` | `makeDtsToArrOut` / `makeDtsToArr1Wdf` | 데이터셋 → Array |
| `fn_make_dtsToJsonOut` / `fn_make_dtsToJson1(_wdf)(_wsum)` | `makeDtsToJsonOut` / `makeDtsToJson1(Wdf)(WdfWsum)` | 데이터셋 → JSON |
| `fn_make_dtsToJson2(_wdf)` / `fn_make_dtsToJson3_wdf` | `makeDtsToJson2(Wdf)` / `makeDtsToJson3Wdf` | 헤더 매핑 변환 |
| `fn_getDtsValue` | `getDtsValue` | `$c.ut.replaceAll` → `$c.str.replaceAll` |
| `fn_dataFormatValue` | `dataFormatValue` | `$c.stf.Format*`/`$c.ut.*` → `$c.num.formatNumber`·인라인 날짜포맷(동작 동일) |

처리 내역:
- 외부 의존 정리: `$c.ut.replaceAll`→`$c.str.replaceAll`, `$c.ut.isEmpty`→`$c.util.isEmpty`, `$c.stf.FormatNumberEx`→`$c.num.formatNumber`, `$c.stf.FormatDate*`/`$c.ut.FormatTofixed`→인라인 변환(원본 substring 로직 그대로).
- 암시적 전역 루프변수(`for (i=...)`) → `var` 지역화, `fn_PrintPreView` 의 디버그 `alert` 2줄 제거.
- 의존 유지: Rexpert 전역(`rex_GetgoDictionay`/`rex_gfRexRptOpen`), `$c.frame.*` 는 런타임 주입 그대로 사용.
- 호출처 네임스페이스(`$c.rpt.*` → `$c.print.*`)는 repo 내 호출처 확인 후 전환 권장.

> **잔류:** `yearanulfee_print.xml`(`fn_pre_print_*`) 과 `listInvstg.xml`/`listInvstgKonex.xml` 의 `fn_print` 는 전역 `dts_Print` 컴포넌트·화면별 컬럼 매핑·고정 리포트 ID(RLDSTF*)에 강결합된 **화면 종속 인쇄 함수**다. 본 엔진(`$c.print.*`)을 소비하는 호출부이므로 공통 분리 대상이 아니며 각 화면 모듈에 잔류한다.
> 이후 `src/docs/api/stf/index_print.html` API 문서 생성 권장.

---

검증: `python -m wsxml_lint src/as-is/stf/gcc/stf.xml src/as-is/stf/gcc/print.xml` → `0 errors, 0 warnings`.
