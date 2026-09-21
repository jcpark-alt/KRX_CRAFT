# next-krx-lds-tms-front 전환 기록

- `ui/` — 원본(수정 금지; TMS 는 Gauce 가 아닌 WebSquare 소스 프로젝트라 이미 `$c.win/util/sbm/data` 와 모듈 공통 `$c.tms` 를 부른다), `ui-tobe/` — Stage 1(`convert.py`) + Stage 2 보강 산출물 36화면(`TMS/` 34 + `common/` 2).
- 업무공통은 **`cm/pcc/tms/`**(tms.xml `$c.tms`·main.xml) 를 참조한다(사용자 확정 2026-09-21, 트리 반입 직후 — [conversion_playbook.md §0](../md/conversion_playbook.md)). 아래 09-21 재전환 시점에는 트리가 없어 `$c.tms` 를 보류했으나, pcc/tms 대조 결과 113회 중 106회가 정의돼 있고 **`delKeyword`(7화면)** 만 없다. 공용 팝업 `common/ULDCOM00008` 의 `$c.cm.submitSearchRtn` 도 pcc/tms 에 없다.

## 2026-09-21 — 재전환 (22파일)

| 구분 | 내용 | 파일 |
|------|------|------|
| `convert.py` 제자리 재실행 | 21화면이 고정점이 아니었음 — 규칙 26(핸들러 try/catch + `$c.exception.handleError`, 140개소)과 1구역 헤더(6) 누락. 출력은 추가만이고 삭제되는 줄은 CDATA 첫 줄 결합(publicInfo 줄)뿐임을 확인한 뒤 채택 | 21 |
| pcc/stf 개명 | `common/ULDCOM00008`: `$c.cm.submitSearch_Rtn` → `$c.cm.submitSearchRtn` | 1 |

gcc 13모듈 + pcc/stf publicInfo 와 대조한 미정의 `$c` 호출 **114회(12종) → 113회(11종, 전부 `$c.tms`)**.

### 보류 — 모듈 공통 `$c.tms` 11종 113회 (미반입)
원본 프로젝트의 TMS 공통 파일을 `cm/pcc/tms/` 로 반입해 대조하는 것이 정석이다. 반입 전까지 호출은 유지하고, gcc 로 대체 가능해 보이는 후보만 적어 둔다(시그니처를 알 수 없어 미적용).

| `$c.tms` 함수 | 호출 | 사용 형태 | gcc 후보(확인 필요) |
|---|---|---|---|
| `setSelectData(body, comp, labelCol, valueCol, groupCd, engCol)` | 38 / 13화면 | 공통코드 응답을 radio/select 에 바인딩 | `$c.data.setCommonCode` 계열 — 인자 계약 다름 |
| `disableBlockKor(comp)` | 15 / 8 | 영문 입력란 한글 입력 차단 | gcc 에 입력 차단 공통 없음(`$c.str.existKorean` 은 판정만) |
| `setDataListFilter(dlt, [cols], keyword)` | 14 / 7 | dataList 키워드 필터 | 없음(엔진 `dataList.setFilter` 직접 사용 검토) |
| `setKeywordSave(pageId, grd, dma)` / `getKeywordSave(id, dma)` / `delKeyword(pageId)` | 11+10+7 | 검색조건·스크롤 위치 저장/복원/삭제 | `$c.util.setSessionStorage/getSessionStorage/removeSessionStorage` 로 재구성 가능 |
| `validateGroupTms("grp_input")` | 8 / 8 | 입력 그룹 검증 | `$c.data.validateGroup(grpObj, valInfoArr, …)` — 검증 규칙 배열을 받는 계약이라 1인자 호출과 다름; `$c.validate.validateDataCollect` 도 후보 |
| `downloadProc(url, params)` | 5 / 4 | 서버 파일 다운로드 | gcc 는 그리드/dataList 엑셀 다운로드만(`$c.data.downloadGridViewExcel` 등) |
| `setGridButton(grd, options)` | 2 / 2 | 그리드 버튼 스타일 일괄 적용 | 없음 |
| `chkDecimal(comp, n)` | 2 / 1 | 소수 자릿수 제한 | 없음(`$c.num` 에 포맷만) |
| `sendFileUpload(comp, url, name, cb)` | 1 / 1 | 서식 파일 업로드 후 콜백 | `$c.util.getUploadFiles`/`bindDragDropUpload` 계열 — 콜백 계약 확인 |

- 기존 결함(이번 미변경): body `ev:`·publicInfo↔정의·0열 여닫힘 문제 파일 HEAD 16 → 16(신규 0).

### 검증
`python -m wsxml_lint conversion/next-krx-lds-tms-front/ui-tobe --ignore WS111,WS112,WS113` 36 files 0/0 · CDATA `node --check` 36/36 · 변경 22파일 `convert.py` 재실행 내용 변화 0 · 미정의 `$c` 호출 = 보류 목록과 일치(113).
