# next-krx-lds-fil-front 전환 기록

- `ui/` — W-Craft 1차 변환 원본(수정 금지), `ui-tobe/` — Stage 1(`convert.py`) + Stage 2 보강 산출물 34화면.
- 업무공통은 **`cm/pcc/fil/`** 만 참조한다(`$c.fil`·`$c.cm`·`$c.cp`·`$c.dis`; 모듈별 pcc 트리 규칙 — [conversion_playbook.md §0](../md/conversion_playbook.md)). gcc(`cm/gcc`, `$c.util/str/date/validate/session/…`)는 공통.

## 2026-09-21 — pcc/fil 기준 재전환 (10파일)

`convert.py` dry-run 은 규칙 26 래핑(17301 11건)·구역 헤더 위치(91100) 외 고정점이라 기계 패스는 그 2건만 반영하고, 나머지는 pcc/fil·gcc 공통으로의 판단 치환이다. 적용 후 34파일 전부 `convert.py` 고정점(재변환 내용 변화 0).

| 화면 | 변경 | 근거 |
|------|------|------|
| `dis/support/JLDFIL17301` | as-is common.js 사본 5함수(`isNull/nullChk/checkByte/getByte/calcContn`) 삭제 → 필수 검증은 `$c.validate.validateDataCollect(grp_form, …)`, 질의내용 byte 상한은 **`$c.fil.checkMaxLength(ipt_quesContn, 2000, "질의내용")`**, 실시간 카운트·초과 차단은 `$c.util.setTextLengthCounter`(`init_byteCounter`, 표시용 `txt_quesContnCnt` textbox 추가·`txt_byteCnt` 라벨은 "질의내용"만). `ipt_quesContn_onkeyup` 핸들러·`ev:onkeyup` 삭제, `$c.session.info`→`getUserInfo`, `await await` 정리, 규칙 26 래핑 반영 | TODO "추후 common.js 사용으로 변경" |
| `dis/support/JLDFIL17300` | 달력 onblur 2핸들러(빈 TODO) → `init_dateCheck()` 에서 `$c.date.compareFromToDate(ipt_startDate, ipt_endDate, ["조회시작일","조회종료일"], "yyyyMMdd")` 등록(포맷·실존·선후 검증) | TODO "공통 적용 예정" |
| `dis/account/JLDFIL25103` | 주석 처리돼 있던 검증 → `validateDataCollect(grp_form)` — dataMap 컬럼 id 규칙(법인등록번호 13자리 숫자·사업자등록번호 10자리 숫자·필수 11항목·내선 숫자), 이메일 분할 입력은 `includeUnbound`, 조합 이메일은 `$c.str.isEmail` | TODO "공통 적용 예정"(as-is fn_NullChk/fn_IsNumber/fn_CheckEmail) |
| `dis/account/JLDFIL25111` · `JLDFIL25101` | 주석 처리돼 있던 행(idx)별 검증 → 컴포넌트 id 를 idx 로 조합한 동적 `fields` 로 `validateDataCollect(grp_form)`(성명은 신규만, 25101 은 공시책임자 idx 1 부서 제외) + `$c.str.isEmail`·`$c.date.isDate`(지정일 yyyy+mm+dd) | TODO "공통 적용 예정"(`$c.cm.fn_*` 17·13건) |
| `dis/register/JLDFIL40300` | `confirm()` 의 주석 검증 → `validateDataCollect(grp_form)`(사용자구분·회사코드·사업자등록번호 10자리 숫자·신청자·이메일 분할) + 조합 이메일 `isEmail` 후 `dma_UsrInfoReq.set`; 버튼 핸들러의 임시 이메일 조합 코드 삭제 | TODO "common.js 공통전환 완료 후 적용" |
| `dis/account/JLDFIL25101` · `dis/support/JLDFIL17302` | `$c.session.info(key)` → `$c.session.getUserInfo(key)` | gcc 에 `info` 없음 |
| `inf/srch/ULDINF20000` · `inf/corp/ULDINF05800` | 기간 버튼 3/6개월·1년 → **`$c.fil.setFromToDate("3"/"4"/"5", 시작, 종료)`**(종료일 기준 월 단위), 3년은 구분값이 없어 `$c.date.addYear(-3)` | pcc/fil 기간 공통 — as-is 는 90/181/365일 가산이었음(월 단위로 의미 변경) |
| `inf/srch/ULDINF91100` | `convert.py` 출력 반영(2구역 헤더 위치) | 고정점 정렬 |

### 보류·확인 필요
- `lst/lstinvstg/ULDFIL52810`: 스크립트가 Q&A 화면(17301) 사본인데 마크업은 상장심사 화면이라 참조 컴포넌트가 전무 — 원본(`ui/`)부터 동일한 결함. 화면 정체 확정 후 재작성(as-is common.js 사본 5함수도 함께 정리).
- `$c.dis.openPopupZipCode` 는 pageFramePopup 을 열되 결과(Promise)를 반환하지 않아, 콜백으로 우편번호를 받는 25101·25111 의 직접 `openPopup` 호출은 유지. 공통이 `return $c.win.openPopup(...)` 으로 바뀌면 치환 가능.
- `JLDFIL25101` "메뉴공통 include 하기 전까지 사용"(menuInfo → 메뉴명 표시)은 `cm/pcc/fil/main.xml`(`setHeaderMenu`) 편입 방식 확정 후 처리.
- 기존 결함(이번 미변경): `ULDINF90400`(`ibx_searchWord_onclick`)·`ULDFIL35700`(`rdo_gubun1~3_onviewchange`)·`ULDFIL54000`(`grd_listedFee_oncellclick`) 의 body `ev:` 핸들러가 스크립트에 정의돼 있지 않다.
- byte 기준: `$c.fil.checkMaxLength`/`$c.util.setTextLengthCounter` 는 `$c.str.getByteLength` 기준으로 잰다 — DB 컬럼 byte 기준과 대조.

### 검증
`python -m wsxml_lint conversion/next-krx-lds-fil-front/ui-tobe --ignore WS111,WS112,WS113` 34 files 0/0 · CDATA `node --check` 34/34 · body `ev:`·publicInfo ↔ 정의(기존 결함 3파일 제외) · `$c.session.info`/`$c.cm.fn_`/"공통 적용 예정" TODO 잔존 0 · `convert.py` 재실행 내용 변화 0.
