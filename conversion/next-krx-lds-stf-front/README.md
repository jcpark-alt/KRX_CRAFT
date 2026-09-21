# next-krx-lds-stf-front 전환 기록

- `ui/` — W-Craft 1차 변환 원본(수정 금지), `ui-tobe/` — Stage 1(`convert.py`) + Stage 2 보강 산출물 101화면.
- 업무공통은 **`cm/pcc/stf/`** 만 참조한다(`$c.stf`·`$c.lc`·`$c.cm`·`$c.bns`·`$c.print`·`$c.cp`; 모듈별 pcc 트리 규칙 — [conversion_playbook.md §0](../md/conversion_playbook.md)). gcc(`cm/gcc`)는 공통.

## 2026-09-21 — pcc/stf 갱신본(`1b0a7a9`, `fn_` 접두 제거·camelCase) 기준 재전환 (43파일)

`convert.py` dry-run 은 고정점(4파일 CDATA 첫 줄·빈 줄 차이만)이라 기계 패스 없음. gcc 13모듈 + pcc/stf 7모듈 publicInfo 와 대조한 미정의 `$c` 호출 **215회(52종) → 28회(8종, 전부 재설계 보류)**.

| 구분 | 치환 | 건수 |
|------|------|------|
| pcc/stf 개명 반영 | `$c.cm.ins_popupOpen→insPopupOpen`, `fn_com_isur→comIsur`, `fn_com_isur_nm→comIsurNm`, `fn_CtrlBtn→ctrlBtn`, `IsurcdSearch/_IR/Bond→isurcdSearch…`, `fn_DelChar/3→delChar/3`, `InfoMenuID→infoMenuID`, `ins_combo_set→insComboSet`, `ins_popupRtn_val4→insPopupRtnVal4`, `ins_isuNmpopupOpen→insIsuNmpopupOpen`, `ins_popupRtn_cdnm→insPopupRtnCdNm`, `fn_com_Confirm_set→comConfirmSet`, `isurSearch_Rtn→isurSearchRtn`, `submitSearch_Rtn→submitSearchRtn`, `$c.bns.fn_PopIsurSearch→popIsurSearch`, `$c.lc.fn_getMktId→getMktId`, `fn_PopFindCorpChrg→popFindCorpChrg`, `$c.stf.fn_PopupCorpInfo→openPopupCorpInfo` | 62 |
| 네임스페이스 이동 | `$c.cm.setColumnProp/getColumnProp` → **`$c.cp`**(cp.xml 정의); `$c.lce.fn_isProcess` → **`await $c.lc.isProcess`**(async 라 호출 함수 `save/update/delete` 를 async 화, 07401·07405); `$c.lce.fn_PopFindZipCd` → `$c.lc.popFindZipCd` | 26 |
| 세션 정보(gcc) | `$c.session.info(k)`·`$c.stf.info(k)`·`$c.stf.getUserInfo([$p,] k)` → `$c.session.getUserInfo(k)` | 56 |
| 삭제된 `$c.utils`/`$c.ut` → gcc(매핑표 `cm/docs/api/stf/index_transfer.html`) | `cGetToday("yyyymmdd")→$c.date.getServerDateTime()`, `("yyyymmddhhmmss")→getServerDateTime("yyyyMMddHHmmss")`, `cGetPlusYear→addYear`, `cGetMinusDate2(d,n)→addDate(d,-n)`, `cGetMinusMonth(y,m,d,1)→addMonth(ymd,-1)`, `cGetDifTodayInputday(a.Text,b.Text)→diffDate(a.getValue(),b.getValue())`, `trim→$c.str.trim`, `email_chk/IsValidEmail→$c.str.isEmail`, `isDate→$c.date.isDate`, `$c.stf.replaceAll→$c.str.replaceAll`, `$c.stf.getQuery(frame.srcUrl,k)→$c.util.getParameter(k)`, `$c.data.downloadGridViewOffice(grd,title,…)→downloadGridViewExcel(grd,{fileName:title})` | 29 |
| 대응 공통 없음 → 화면 로컬 헬퍼(gcc 기반) | `$c.lce.fn_alertMsg('S'/'S1'/'F')` → `scwin.alertJobMsg`(TR_JOB 작업명 + `$c.stf.getMessageParam` MSG-A001/0001/A002, 07401·07403·07405·07407); `$c.stf.compareFromToDate2(s,e)` → `scwin.checkFromTo`(`$c.date.dateCompare` + 안내·포커스, 30403·15000·21340·00201) | 15 |
| 규칙 14 | `$c.stf.showObj(comp, flag)` → `(flag) ? comp.show() : comp.hide()` (30342·07401) | 3 |

### 보류(재설계 필요 — 28회/26파일)
- `$c.frame.path("…").fn_*()`(9)·`$c.frame.CreateDialogFrame`(7)·`$c.frame.srcUrl`(2)·`$c.frame.CreateFrame`(1): `frame.xml` 은 2026-09-01 삭제(`$c.frame` 사용 금지) — 형제/부모 프레임 접근·MDI 창 생성은 `$c.win.getParent`/`openPopup` 수신 규약으로 화면별 재설계.
- `$c.en.fn_CheckForm`(3)·`$c.en.fn_filedown`(2)·`$c.elw.fn_searchCode`(3): ETN/ELW 모듈 공통이 `cm/pcc/stf` 에 없음(as-is `list_common_etn`·ELW 계열) — pcc/stf 반입 또는 화면 내 구현 결정 필요.
- `$c.stf.FillGridHeader(pageNoCnt, pageSize, total, panel, width)`(1): pcc/stf 에는 건수 표시 전용 `fillGridHeaderTotalCnt(vRsltCnt, panel)` 만 있음 — 페이징 헤더는 `$c.sbm.setPagingInfo` 로 재설계.
- 기존 결함(이번 미변경): body `ev:` 핸들러·publicInfo 미정의 32파일, WS120 그리드 컬럼 id 중복 2파일(ULDINS21340·ULDSTF07406).
- 의미 확인: `insPopupOpen` 첫 인자로 문자열 `"KIS_CD"` 를 넘기는 호출 2건(그리드 객체 계약과 불일치, as-is 그대로), `$c.util.getParameter` 는 현재 창 URL 기준(원본은 `frame.srcUrl`), `alertJobMsg` 는 `scwin.TR_JOB`/전역 `TR_JOB` 이 없는 화면(07403·07407)에서 작업명이 빈 문자열.

### 검증
`python -m wsxml_lint conversion/next-krx-lds-stf-front/ui-tobe --ignore WS111,WS112,WS113` 101 files 0 warnings(오류 2 = 기존 WS120) · CDATA `node --check` 101/101 · `ev:`·publicInfo↔정의 문제 파일 HEAD 32 → 32(신규 0) · 미정의 `$c` 호출 28회(보류 목록과 일치).
