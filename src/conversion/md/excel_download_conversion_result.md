# 그리드 엑셀 다운로드 공통함수 변환 결과 (규칙 20 / 20b)

> conversion 트리(`src/conversion/next-krx-lds-{mgt,stf,tms}-front/ui-tobe/`)의 그리드 엑셀 다운로드 호출을 gcc 공통함수 `$c.data.downloadGridViewExcel` 의 객체 시그니처로 통일한 결과 보고서. 규칙 정의는 [conversion_rules.md](conversion_rules.md) §규칙 20·20b, 매핑표는 [substitution_map.md](substitution_map.md) §10 참조.

## 개요

| 규칙 | 변환 내용 | 파일 | 건수 | 커밋 |
| --- | --- | ---: | ---: | --- |
| **규칙 20** | `{gridView}.advancedExcelDownload(…)` → `$c.data.downloadGridViewExcel({gridView}, …)` (메서드→공통함수, 수신 객체 첫 인자 승격) | 19 | 19 | `29ad123` |
| **규칙 20b** | `$c.data.downloadGridViewExcel(grid, fileName, sheetName, type)` (위치인자 4개) → `…(grid, {fileName[, sheetName], type})` (위치인자→객체 정규화) | 28 | 31 | `6b5d50f` |

변환은 모두 **이미 완성된 ui-tobe 파일에 해당 규칙만 외과적으로 적용**(원본 `ui/` 재생성 안 함 → Stage 2 수작업 보존)했다.

## 최종 상태

전체 `$c.data.downloadGridViewExcel` 호출 **55건 전수 인자 파싱** 결과:

| 호출 형태 | 건수 |
| --- | ---: |
| 객체 변수형 `(grid, options, infoArr)` (규칙 20 출신) | 21 |
| 객체 리터럴형 `(grid, {fileName: …, …})` (규칙 20/20b 출신) | 34 |
| **위치인자 잔존** | **0** |

- 전 파일 **XML well-formed**, 규칙 20+20b **멱등**(재변환 no-op), CI **success**.
- 잔존 레거시 `advancedExcelDownload` **0건**, 위치인자 4개 형태 **0건**.

## 규칙 20 — advancedExcelDownload → 공통함수 (19건)

수신 그리드를 첫 인자로 승격하고 기존 인자(options/infoArr 또는 인라인 리터럴)는 순서대로 유지.

```javascript
// AS-IS
grd_relComStat.advancedExcelDownload(options, infoArray);
// TO-BE
$c.data.downloadGridViewExcel(grd_relComStat, options, infoArray);

// AS-IS (1인자 인라인 리터럴)
grd_grid.advancedExcelDownload({fileName: "", sheetName: "기술평가신청"});
// TO-BE
$c.data.downloadGridViewExcel(grd_grid, {fileName: "", sheetName: "기술평가신청"});
```

대상 파일(전부 `next-krx-lds-stf-front`): `lst/fis/ULDFIS00202~00208,00211,00214~00219,00400_01~03,00500`, `lst/lstinvstg/ULDSTF07400,07403` — 19개.

## 규칙 20b — 위치인자 → 객체 시그니처 정규화 (31건)

공통함수 시그니처는 `(grdObj, options, infoArr)` 이라, 원본에 있던 위치인자 호출은 문자열을 `options` 자리에 넘겨 **기본옵션으로 무시**(다운로드명 `excel.xls`, type 0)되던 깨진 상태였다. 객체 시그니처로 정규화해 의도를 복원.

**인자 매핑**: 2번째(파일명)→`options.fileName`, 4번째(0/1/2/8)→`options.type`, 3번째(시트명)는 비어있으면 생략.

```javascript
// AS-IS                                          // TO-BE
(grd_List_2, "소속부변경목록", "", "8")     →  (grd_List_2, {fileName: "소속부변경목록", type: "8"})
(grd_Excel,  "배당",         "", "1")      →  (grd_Excel,  {fileName: "배당", type: "1"})
(MxGrid_1,   "배포시스템_이용자제안","","2") →  (MxGrid_1,   {fileName: "배포시스템_이용자제안", type: "2"})
```

토큰 원형 보존 — 표현식 인자, 미따옴표 숫자, trailing 주석 모두 유지:

```javascript
(grd_isu, MxCombo_chrg_cd.text + " 법인담당리스트", "", "8")
   → (grd_isu, {fileName: MxCombo_chrg_cd.text + " 법인담당리스트", type: "8"})
(grd_Grid, "기본정보맵핑항목", '', 8); //16
   → (grd_Grid, {fileName: "기본정보맵핑항목", type: 8}); //16
```

대상 파일(28개):

| 모듈 | 파일 |
| --- | --- |
| mgt (15) | `mgt/ULDMGT40002,40004,40008,40220,41000,50002,80000,80206,80208,80209,80220,80300,80400,80700,95010` |
| stf (13) | `dis/bizspt/ULDSTF30304`, `dis/dsclsrch/ULDSTF15000`, `lst/fis/ULDFIS00206,00220,00221,00302,00304,00305,00306,00307,00308,00312`, `lstproc/ULDSTF05234` |

> `ULDMGT40008`·`ULDSTF15000`·`ULDFIS00206` 은 파일당 2건이라 파일 28개 / 호출 31건.

## 검증 방법

- WF: `xml.dom.minidom` 전수 파싱 (0 실패).
- 잔존 위치인자: `convert.rule20b_normalize_excel_positional` 재적용 시 0건 + 전 호출 `_scan_call` 인자 파싱으로 비객체형 0건 확인.
- 멱등성: 규칙 20+20b 재적용 결과 무변화.
- 매핑 근거: gcc `src/gcc/data.xml` 의 `downloadGridViewExcel` JSDoc 시그니처(`grdObj, options{}, infoArr[]`)와 손작성 객체형 선례(`ULDTMS04010`: `option.fileName`/`option.type`).
