# publish → publish-tobe 전환 기록

- `conversion/publish/` — KRX 퍼블리싱 산출 XML 원본(W-Craft 1차 변환 스크립트 내장, **수정 금지**). `conversion/publish/publish-tobe/` — `publish_pipeline.py` 산출물(같은 상대 경로).
- 파이프라인: convert(Stage 1) → screen_convention(jsdoc·await·reindent·unused·finalize) → 컨벤션↔convert 수렴 → gate_screen. 스크립트 없는 순수 목업은 convert 만 거친다.
- 재실행: `python conversion/tools/publish_pipeline.py` (전체) 또는 `python conversion/tools/publish_pipeline.py "conversion/publish/상장/상장처리(대내)"` (폴더·파일 단위). 화면별 상세는 `pipeline_report.json`.

## 실행 결과 (2026-10-12 10:11, 1934본, 197초)

| 폴더 | 파일 | 스크립트 영역 있음 | 게이트 OK | 게이트 FAIL | 미수렴 | WF 실패 | 치명 오류 |
|---|---|---|---|---|---|---|---|
| TMS(서식관리_대내) | 55 | 55 | 55 | 0 | 0 | 0 | 0 |
| (root) | 2 | 2 | 2 | 0 | 0 | 0 | 0 |
| 공시 | 718 | 718 | 446 | 272 | 0 | 0 | 0 |
| 상장 | 630 | 630 | 229 | 401 | 2 | 0 | 0 |
| 샘플(전환) | 4 | 4 | 0 | 4 | 0 | 0 | 0 |
| 운영자(대내) | 170 | 170 | 155 | 15 | 0 | 0 | 0 |
| 채권 | 162 | 162 | 36 | 126 | 2 | 0 | 0 |
| 표준코드 | 193 | 193 | 122 | 71 | 0 | 0 | 0 |
| **합계** | 1934 | 1934 | 1045 | 889 | 4 | 0 | 0 |

## 게이트 실패 사유(화면 수)

- `undefined_c`: 828
- `dup_defs`: 80
- `token:native alert(`: 70
- `node`: 39
- `token:loose ==/!=`: 6
- `token:var `: 3

## 미정의 `$c` 호출 상위 30 (gcc + pcc publicInfo 에 없음 — Stage 2 명부)

- `$c.ut.cGetToday`: 436화면
- `$c.libRoundPanel.PanelToGroupBox`: 257화면
- `$c.stf.compareFromToDate2`: 160화면
- `$c.bns.BnsPanelToGroupBox`: 125화면
- `$c.stf.fn_PopupCorpInfo`: 116화면
- `$c.bns.fn_SearchBns`: 108화면
- `$c.data.downloadGridViewOffice`: 95화면
- `$c.stf.fn_getModalCenterPos`: 88화면
- `$c.ut.cGetMinusDate2`: 82화면
- `$c.bns.fn_PopAttachDocSearch`: 52화면
- `$c.stf.getQuery`: 47화면
- `$c.elw.fn_searchCode`: 47화면
- `$c.ut.cGetToday2`: 45화면
- `$c.bns.fn_PopIsuDetail`: 42화면
- `$c.ut.cGetMinusMonth`: 38화면
- `$c.bns.fn_PopIsurSearch`: 34화면
- `$c.ut.cGetMinusYear`: 33화면
- `$c.stf.checkEmptyValue`: 31화면
- `$c.bns.fn_PopReturn`: 30화면
- `$c.bns.fn_CheckDateObj`: 27화면
- `$c.bns.fn_CheckModAndRet`: 27화면
- `$c.bns.fn_RowPos`: 27화면
- `$c.stockSearch.JongmokSearch`: 26화면
- `$c.bns.fn_SetBnsCombo`: 26화면
- `$c.bns.fn_CheckCmData`: 25화면
- `$c.bns.fn_PopApprovFileWrt`: 25화면
- `$c.lce.fn_isProcess`: 24화면
- `$c.bns.fn_EndConfirm`: 24화면
- `$c.stf.FormatNumberEx`: 23화면
- `$c.ut.trim`: 22화면

## 레거시 토큰 합계(게이트 집계)

- `TODO Stage2`: 3860
- `handler no try`: 1809
- `$c.frame`: 1493
- `native alert(`: 719
- `new Object/Array`: 456
- `location.href`: 138
- `loose ==/!=`: 71
- `setTimeout/Interval`: 48
- `innerHTML`: 48
- `var `: 32
- `eval/new Function`: 30
- `fn_ def`: 8
- `jQuery $(`: 1
- `backtick`: 1

## 치명 오류(산출 불가 또는 예외)

- 없음

## 미수렴(컨벤션↔convert 3회 안에 고정점 미도달)

- `상장/상장처리(대내)/ULDSTF24702.xml`
- `상장/상장처리(대내)/ULDSTF41095_1.xml`
- `채권/채권처리(대내)/ULDBNS21102.xml`
- `채권/채권처리(대내)/ULDBNS22100.xml`

## well-formed 실패

- 없음

## wsxml_lint (`python -m wsxml_lint conversion/publish/publish-tobe --ignore WS111,WS112,WS113`)

| 대상 | 파일 | 오류 | 경고 | 비고 |
|---|---|---|---|---|
| `conversion/publish/` (원본) | 1,934 | 15,249 (전부 WS120 중복 id, 674화면) | 0 | 퍼블리싱 자동생성 id·그리드 header↔gBody 동일 컬럼 id |
| `conversion/publish/publish-tobe/` (산출) | 1,934 | 334 (전부 WS120, 62화면) | 0 | finalize 의 header `_H` 접미로 612화면 해소. **새로 생긴 오류 0**. 잔여는 퍼블리싱 목업 자체의 중복 id(`template.xml` tabs1 등) — Stage 2 |

- 게이트 FAIL 889 의 주된 사유는 `undefined_c`(827) — as-is 공통 네임스페이스(`$c.ut`·`$c.bns`·`$c.libRoundPanel`·`$c.elw`·`$c.lce`·`$c.stockSearch` …)가 `cm/pcc` 에 없거나 개명 전 이름(`$c.stf.fn_PopupCorpInfo` → `openPopupCorpInfo`, `compareFromToDate2`)인 자리. next-krx-lds-*-front README 의 치환표(예: `$c.ut.cGetToday` → `$c.date.getServerDateTime()`)를 Stage 2 에서 적용한다.
- `node` 구문 실패 38 은 원본의 같은 스코프 `var` 중복 선언이 규칙 8 `let` 전환으로 드러난 것(`let str` 2회 등)과 W-Craft `X` 마커 등 원본 구문 오류 — 화면별 손작업.
- `ULDSTF05241_FILE.xml`: 원본 괄호 불균형으로 convert 규칙 4 가 예외를 내던 것을 보류 가드로 바꿔(convert.py) 산출.
- 규칙 11 보강(2026-10-08 사용자 지적 ULDSTF05603): W-Craft 20251209판의 `//★Wcraft guide★ include부분 주석처리 -> include(...)` 변형 1,062화면·6,966줄을 삭제하도록 convert.py 를 고치고 해당 화면을 원본에서 재생성(잔존 0). 이 절은 파이프라인이 README 를 다시 쓰면 사라지므로 lint 를 다시 돌린 뒤 덧붙인다.
