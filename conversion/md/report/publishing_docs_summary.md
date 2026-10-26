# 퍼블리싱 관련 문서 요약

작성 2026-10-26. 저장소에 흩어진 퍼블리싱(KRX 퍼블리싱 XML·화면 캡처 반영) 관련 md 문서의 내용을 한곳에 요약한다.
세부 규칙·수치는 각 원문이 정본이며, 이 문서는 원문이 바뀌어도 자동으로 갱신되지 않는다.

| # | 문서 | 성격 | 최종 수정 |
|---|---|---|---|
| 1 | [SKILL.md](../../../.claude/skills/websquare-publishing/SKILL.md) | 퍼블리싱 작업 하네스(절차·필수 구조·금지 사항·매핑 규칙) | 2026-10-23 |
| 2 | [markup-idioms.md](../../../.claude/skills/websquare-publishing/markup-idioms.md) | sample-front 119화면 실측 마크업 관용구 | 2026-10-23 |
| 3 | [request-template.md](../../../.claude/skills/websquare-publishing/request-template.md) | 퍼블리싱 생성·반영 요청 양식 + 스니펫 목록 | 2026-10-22 |
| 4 | [conversion_rules.md](../conversion_rules.md) 규칙 34·35 | 퍼블리싱 정규화(`publish_normalize.py`)·병합(`publish_merge.py`) 규칙 | — |
| 5 | [publish-tobe/README.md](../../publish-tobe/README.md) | publish → publish-tobe 일괄 전환 실행 기록 | 2026-10-12 |
| 6 | [publish_merge_report.md](../../jsp-front/publish_merge_report.md) | jsp-front 퍼블리싱 병합 화면별 판정표 | 2026-10-07 |

관련 HTML 보고서: [publishing_model_detailed_report.html](publishing_model_detailed_report.html)(하네스 근거 §5~§7), [publishing_model_comparison_report.html](publishing_model_comparison_report.html).

---

## 1. SKILL.md — WebSquare 퍼블리싱 하네스

**목표**: 어떤 모델이 작업해도 같은 품질이 나오게 한다. 참조 범위 밖의 코드를 만들지 않고, 컴포넌트는 규칙대로 고르고, 게이트를 통과한 결과만 반영한다.

### 절차 ①~⑥ (건너뛰지 않음)

| 단계 | 내용 |
|---|---|
| ① 요청 확인 | 필수 항목은 대상 파일, 퍼블리싱 기준(캡처 또는 `conversion/publish/...` XML), 영역별 컴포넌트다. 영역별 컴포넌트가 비어 있으면 매핑 규칙으로 채운 표를 먼저 보여 준다. 판단이 엇갈리는 영역은 생성 전에 묻는다. |
| ② 참조 템플릿 선정 | `sample_templates.md` 23종에서 고른다(예: 대형 작성화면 `ULDFIL59410`, 목록+페이징 `ULDFIL59400`, 조회조건+엑셀 `ULDINF20000`). 탭 화면은 `JLDFIL05012`(host)·`05012C`/`05013C`(탭 본문), 탭 안의 탭은 `ULDSTF05927`을 참조한다. |
| ③ 생성·수정 | 필수 구조·금지 사항·매핑 규칙과 markup-idioms.md 골격을 따른다. 새 class는 `cm/css/*.css`에 정의가 있는지 먼저 확인한다. |
| ④ 자동 검증 | `PYTHONUTF8=1 python conversion/tools/publish_gate.py --rev HEAD <xml>`를 실행한다. 신규 화면은 `--rev` 없이 돌린다. 단계는 lint → gate_screen → markup(P01~P04) → preserve/scope(P10~P13, P20~P24)이다. **FAIL이 하나라도 있으면 반영하지 않는다.** `--allow`는 요청자가 승인한 경우에만 쓴다. |
| ⑤ 리뷰 | `websquare-code-reviewer`로 리뷰하고, 캡처와 영역 순서·단 구성·제목·버튼 위치를 대조한다. |
| ⑥ 보고 | 게이트 결과, WARN 판단, `--allow` 근거, 값 출처가 정해지지 않은 TODO 영역을 적는다. 반복해서 나온 실패는 규칙 추가로 제안한다. |

### 게이트 코드

| 코드 | 검사 | 등급 |
|---|---|---|
| P01 | colgroup col 수와 행 실제 칸 수 일치 | FAIL |
| P02 | `readonly` → `readOnly` 대소문자 | FAIL |
| P03 | 탭 본문 안 contentHeader 금지 | FAIL |
| P04 | CSS에 정의 없는 class | WARN |
| P10~P13 | ref·핸들러·라벨·id 보존 (P13 id 누락은 WARN) | FAIL/WARN |
| P20~P24 | 함수·리소스·컴포넌트 추가 범위 (P22 스크립트 변경, P23 새 컴포넌트, P24 바인딩·핸들러 추가는 WARN) | FAIL/WARN |

### 필수 구조 (핵심)

- **화면 골격**: 본화면은 `sub_contents`, 팝업은 `pop_contents`이고, **둘 다** 첫 자식으로 `w2:pageFrame id="pfmContentHeader" src="/cm/xml/contentHeader.xml"`을 둔다. 팝업도 필수다(2026-10-23 확정). contentHeader를 넣지 않는 곳은 tabControl 탭 본문뿐이다.
- **조회조건**: `schbox` > `schbox_inner` > table 구조이고, 조회 버튼은 `btn_schbox` > `btn_cm sch`에 둔다.
- **목록 머리**: `titbox` > h3 + `rt` > 총건수(`count`: 총 / `num` / 건) + 버튼 구조이고, 페이징은 `gvwbox` 바로 다음 `pglbox` > `pageList.pgl`에 둔다.
- **버튼**: 섹션 버튼은 titbox의 `rt`, 하단 버튼은 `btnbox` > `rt`에 두고 주요 동작 `btn_cm pt`를 맨 오른쪽에 놓는다. 표 안 빈 칸에는 버튼을 두지 않는다(입력칸에 붙는 팝업 찾기 버튼은 예외).
- **팝업 닫기**: 하단 「닫기」 버튼은 넣지 않는다(2026-10-23 확정). 남는 버튼이 없으면 `btnbox`도 생략한다. 기존 `btn_close`를 지우려면 요청자 승인 후 `--allow`가 필요하다.
- **표**: `w2tb tbl` + `w2:summary`로 구성하고, **colgroup col 수는 각 행의 실제 칸 수와 같아야 한다**. th는 `w2tb_th` + `scope row`, td는 `w2tb_td`를 쓴다.
- **그리드**: `gvwbox` > `gridView class="gvw rowN"` 구조다. `rowN`은 5·10·15·20·25만 정의돼 있고, 그 밖의 행 수는 `visibleRowNum`으로 지정한다.
- **탭**: `tbcbox` > `tabControl`이고, 선택 탭 속성은 `selectedIndex`다. 탭 안의 탭도 `tbcbox` > `tbc`를 쓴다(`tbc_sub` 금지, 2026-10-22).
- **다단**: `lybox` > `col_N` > `tblbox` > table 구조다.
- **스크립트**: 5단계 구역 구조이고, 퍼블리싱 작업에서는 원칙적으로 건드리지 않는다.

### 금지 사항

- 참조 템플릿·원본에 없는 컴포넌트·스크립트·스타일 추가
- 기존 ref·`ev:on*`·라벨·id의 삭제·변경
- `var`, `console.log`, 원시 `alert(`, `debugger`, jQuery, `innerHTML`, `==`/`!=`
- gcc·모듈 pcc에 없는 `$c.*` 호출
- 인라인 px 남발
- 값 출처를 모르는 영역의 임의 바인딩(TODO로 남긴다)
- 인식되지 않는 class·속성(`grdbox`, 정의 없는 `rowN`·`wNN`, `selectedTabIndex`, W-Craft 잔여 속성)

### Table / gridView 매핑

| 신호 | gridView | Table |
|---|---|---|
| 건수 | N건(가변) | 1건(고정) |
| 형태 | 헤더 1~2단 + 같은 형식의 행 반복 | 라벨-값 쌍, colspan/rowspan |
| 동반 기능 | 페이징·엑셀·행 추가/삭제·체크·정렬 | 조회 버튼·검증·팝업 찾기 |
| 바인딩 | `dlt_*` | `dma_*` |

경계 사례는 다음과 같다.
- 고정 소형 읽기 전용 표는 Table로 한다.
- 진입 시점에 행 수가 정해지지 않으면 건수가 적어도 gridView로 한다.
- 번호 접미사로 반복되는 입력칸을 gridView로 통합하는 것은 제안만 한다(로직 변경이 따르므로 승인이 필요하다).

---

## 2. markup-idioms.md — 퍼블리싱 마크업 관용구 (sample-front 실측)

`conversion/sample-front/ui/**` 119화면을 집계해(2026-10-22) 여러 화면이 같은 방식으로 쓰는 마크업만 골라 정리한 것이다. 각 절에 사용 파일 수와 퍼블리셔 IDE 스니펫 이름이 붙어 있다.

| 절 | 내용 |
|---|---|
| §0 참조 대상 | 정답지는 `sample_templates.md` 23종 + JLDFIL05012 계열 + ULDSTF05927이다. 그 밖의 stf·fil 샘플은 보조 참조이며 구조만 보고 속성은 옮기지 않는다. 화면 유형별 정답지 표가 있다(목록+페이징 `ULDFIL59400`, 조회 팝업 `ULDFIL52110`, 그리드 다건 저장 팝업 `ULDSTF09343` 등). |
| §1 화면 골격 | 본화면(40)·팝업(54) 모두 contentHeader pageFrame이 필수이고, 팝업 하단 「닫기」는 없다. contentHeader가 없는 옛 팝업 샘플 약 36본은 그 부분을 베끼지 않는다. |
| §2 조회조건 (38) | `schbox` > `schbox_inner` > `w2tb tbl` + `btn_schbox`(`sch`·`download`) 구조다. |
| §3 버튼 | class 사전: `btn_cm`(108), `pt`(62, 저장·확인), `sch`(36), `download`/`upload`, `row_add`/`row_del`, `icon search`(43), `delete icon`. 하단은 `btnbox`(> `lt`) > `rt`이고 주요 버튼을 마지막에 둔다. |
| §4 입력 | 필수 라벨 `req`(40). 금액은 `tar` + `dataType="number"` + `#,###`(21). 팝업 찾기는 읽기전용 입력과 돋보기 버튼을 같은 td에 둔다(43). 한 칸에 여러 컨트롤은 `flex` / `flex flex_no`(44). 기간은 달력 + `~` + 달력(60). |
| §5 목록 | 총건수 `titbox` > `rt` > `count`(33). 그리드는 `gvwbox` > `gvw rowN`이고, 날짜·숫자 컬럼 서식 규칙이 있다(95). 페이징은 `pglbox` > `pageList.pgl`(11)이다. |
| §6 제목·안내 | h3·h4 `titbox`, 안내 `txt_info`, 여러 줄은 `ul.txt_list`, 안내 박스 `infobox`, 메시지 박스 `msgbox`를 쓴다. h2는 쓰지 않는다(화면 제목은 contentHeader 몫). |
| §7 표 칸 보조 class | `tac`/`tar`/`tal`, 칸 안 중첩 `in_tbl` |
| §8 쓰지 않는 것 | `grdbox`→`gvwbox`, 비표준 `rowN`→`visibleRowNum`, `wNN`→인라인 폭, `selectedTabIndex`→`selectedIndex`, `readonly`→`readOnly`, W-Craft 잔여 속성은 옮기지 않는다. 2026-10-22에 해당 샘플을 정정했다. P04가 정의 없는 class를 경고한다. |

---

## 3. request-template.md — 요청 양식

- **필수(★)**: 대상 화면, 대상 파일(신규면 `신규: <경로>`), 퍼블리싱 기준(캡처 또는 publish XML), 영역별 컴포넌트.
- **선택**: 참조 템플릿, 탭 구성, 영역별 퍼블리셔 IDE 스니펫 이름, 애매 영역.
- **허용 범위**: 기본은 모두 「아니오」다. 라벨을 캡처대로 교체하면 `--allow P12`, 스크립트·이벤트를 변경하면 `--allow P11,P20`이 필요하다.
- **완료 조건**: `publish_gate.py`가 `ALL PUBLISH GATES: OK`를 내고, 캡처 대조 리뷰를 마치고, TODO 영역을 보고한다.
- **작성 요령**:
  - 영역 이름은 캡처의 섹션 제목을 그대로 쓴다.
  - 컴포넌트는 `Table` / `gridView` / `Table + lybox N단` / `gridView (행 추가/삭제)` / `gridView (페이징·엑셀)` 중에서 고른다.
  - 스니펫과 컴포넌트가 어긋나면 생성 전에 확인한다.
  - `meta_snippet*`은 작업자가 새로 달지 않는다(원본에 있으면 보존).
- **스니펫 이름 목록**: 화면 시작(0_xx), 분할(1_xx), 제목(2_xx), 조회조건(3_xx), 탭(4_xx, 서브탭도 `tbc`), 표(5_01~5_04, N단 = th/td 쌍 N개), 그리드(6_xx·총건수), 버튼(8_xx), 아코디언(9_01, 관용구 미정), 입력폼(10_xx), 메시지(11_xx)와 각 대응 골격이 정리돼 있다. 사용 횟수는 2026-10-22 집계다.

---

## 4. conversion_rules.md — 규칙 34·35

### 규칙 34: 퍼블리싱 정규화 `publish_normalize.py` (lxml, body만)

sample-front 가이드 골격으로 바꾸는 1:1 구조 치환만 한다.

| 코드 | 내용 |
|---|---|
| P1 | `pgtbox`(제목+breadcrumb)를 `pfmContentHeader` pageFrame으로 바꾼다. 본화면과 팝업 모두 첫 자식으로 보장한다(2026-10-23부터 팝업 포함, `P1_pageframe_removed` 폐기). |
| P2 | 순수 컨테이너(`#content` div, JSP form 이월 그룹)를 해제한다. |
| P3 | `meta_snippet*`을 삭제한다. |
| P4 | 간격 표와 `<br>`을 삭제한다. |
| P5 | 버튼만 든 표를 `titbox/rt`(다음 형제가 그리드일 때) 또는 `btnbox/rt`로 바꾼다. |
| P6 | 맨 `table.w2tb`를 `tblbox` + `tbl`로 바꾼다. |
| P7 | gridView를 `gvwbox` + `gvw rowN`으로 바꾼다. |
| P8 | pageList를 `pglbox`로 감싼다. |
| P9 | th/td class를 정리한다. |
| P10 | trigger의 인라인 style을 삭제하고 `btn_cm`/`type`을 붙인다. |
| P11 | 스크립트가 참조하지 않는 생성 id(`td_16` 등)를 비운다. |
| P12 | 팝업 「닫기」·「창닫기」 버튼을 삭제한다(2026-10-23). 순수 닫기 핸들러이거나 핸들러가 없을 때만 지운다. 부모 갱신·opener 표지·제목줄 닫기·스크립트가 참조하는 닫기는 유지한다. 실측: ui-tobe 팝업 128본 중 삭제 72·유지 19. |

- **판단 영역(손대지 않음)**: msgbox 분해, `#if_*`/`#c_choose_*` 조건 래퍼, 표형 그리드, 레거시 `lybox`/`search_box`/`tip_box`, 탭 본문 병합, DOM으로 참조되는 hidden 입력.
- **id 참조 판정**: 스크립트의 문자열 리터럴·`#id` 셀렉터를 기준으로 한다(주석은 제외).

### 규칙 35: 퍼블리싱 병합 `publish_merge.py` (퍼블리싱 body ← 공급사 전환본 id·이벤트·바인딩)

- **배경**: KRX 퍼블리싱 XML은 시각 목업(자동생성 id, 글자 라벨 버튼)이다. 퍼블리싱 id와 스크립트 참조가 겹치는 비율은 0%이므로, 공급사 의미 id를 퍼블리싱 body로 **옮긴다**. 기계로 만든 정답지 사례는 JLDFIL25900이다.
- **정합 키**:
  - 버튼: 정규화한 라벨(동의어 조회↔검색 등, 아이콘 `icon:<x>`)
  - 입력류: (종류, 같은 tr의 앞 th 라벨)
  - 그리드: 헤더 라벨 집합
  - pageList: 1:1
  - 같은 라벨이 여러 개면 양쪽 개수가 같을 때만 순서대로 잇는다.
- **옮기는 것**: id·`ev:*`·ref·dataList·formatter·allowChar·maxLength·mandatory·readOnly 등. 그리드는 헤더 value 짝으로 컬럼 id를 잇는다. select는 공급사 choices를 쓴다. **퍼블리싱의 class·style·폭·순서는 그대로 둔다(디자인이 정답).**
- **정합 순서 ①~⑨**:
  1. 같은 키·같은 개수
  2. 그리드 1:1
  3. 버튼 뜻 토큰
  4. 닫기 여럿↔하나, 개수가 다른 키, 그리드 순서, 헤더 자카드 ≥ 0.5
  5. override(`publish_merge_overrides.json`)
  6. 퍼블리싱 전용 공통 버튼
  7. 스크립트가 쓰는 공급사 요소 옮겨 넣기
  8. 남은 공급사 요소 옮겨 넣기
  9. 남은 퍼블리싱 요소 유지

  ⑦~⑨에는 `TODO Stage2(퍼블리싱 병합)` 표지를 단다(값을 지어내지 않고 드러낸다).
- **판정**:
  - `auto`: 전부 이음
  - `todo`: TODO 표지가 있음
  - `manual`: override로 닫음
  - `review`: 자리표뿐이거나 참조를 못 채움
  - `mismatch`: override skip
  - `frozen`: 손작업 정본으로 재생성을 건너뜀
- **승격(2026-10-06)**: 병합은 `jspfront_pipeline.py` 5b 단계가 하고 `ui-tobe/`에 바로 쓴다(별도 `ui-pub/` 없음).
- **jQuery 힌트**: 남은 jQuery 문장에 `// TODO Stage2(규칙 19)` 힌트를 단다.

- **헤더 표준**: 본화면·팝업 모두 `pfmContentHeader` pageFrame을 첫 자식으로 둔다(팝업은 2026-10-23 변경). 탭 본문에만 넣지 않으며, 규칙 34 P1이 보장한다. 종전 "팝업은 헤더 없음" 문구는 2026-10-26에 정정했다.

---

## 5. publish-tobe/README.md — publish → publish-tobe 전환 기록

- **대상**: `conversion/publish/`(KRX 퍼블리싱 원본 1,934본, W-Craft 1차 스크립트 내장, **수정 금지**)를 같은 상대 경로의 `conversion/publish-tobe/`로 산출한다.
- **파이프라인** `publish_pipeline.py`: convert(Stage 1) → screen_convention(jsdoc·await·reindent·unused·finalize) → convert 수렴(최대 3회) → gate_screen. 스크립트가 없는 목업은 convert만 거친다. 폴더·파일 단위로 재실행할 수 있고, 상세는 `pipeline_report.json`에 있다.
- **실행 결과 (2026-10-12, 1,934본, 197초)**:

| 폴더 | 파일 | 게이트 OK | FAIL | 미수렴 |
|---|---:|---:|---:|---:|
| TMS(서식관리_대내) | 55 | 55 | 0 | 0 |
| 공시 | 718 | 446 | 272 | 0 |
| 상장 | 630 | 229 | 401 | 2 |
| 채권 | 162 | 36 | 126 | 2 |
| 표준코드 | 193 | 122 | 71 | 0 |
| 운영자(대내) | 170 | 155 | 15 | 0 |
| 샘플(전환)·(root) | 6 | 2 | 4 | 0 |
| **합계** | **1,934** | **1,045** | **889** | **4** |

- **FAIL 사유**: `undefined_c` 828, `dup_defs` 80, 원시 `alert(` 70, `node` 구문 39, 느슨한 비교 6, `var` 3. 주된 원인은 as-is 공통 네임스페이스(`$c.ut`·`$c.bns`·`$c.libRoundPanel`·`$c.elw`·`$c.lce`·`$c.stockSearch` …)가 pcc에 없거나 개명 전 이름이라는 점이다. Stage 2에서 next-krx-lds-*-front 치환표로 처리한다.
- **미정의 `$c` 상위**: `$c.ut.cGetToday` 436화면, `$c.libRoundPanel.PanelToGroupBox` 257, `$c.stf.compareFromToDate2` 160, `$c.bns.BnsPanelToGroupBox` 125, `$c.stf.fn_PopupCorpInfo` 116 …
- **레거시 토큰**: `TODO Stage2` 3,860, try 없는 핸들러 1,809, `$c.frame` 1,493, 원시 alert 719 …
- **치명 오류·well-formed 실패 0**. 미수렴 4본(ULDSTF24702, ULDSTF41095_1, ULDBNS21102, ULDBNS22100).
- **wsxml_lint**: 원본은 WS120(중복 id) 15,249건/674화면이고, 산출본은 334건/62화면이다. finalize가 header에 `_H` 접미를 붙여 612화면을 해소했고 새 오류는 0이다.
- **보강 기록**: 규칙 11의 W-Craft 20251209판 include 주석 변형을 삭제했다(1,062화면·6,966줄). README는 파이프라인이 다시 쓰므로 이 절은 lint 뒤에 덧붙인다.

---

## 6. publish_merge_report.md — jsp-front 퍼블리싱 병합 리포트

- `jspfront_pipeline.py` 5b 병합이 화면마다 행을 갱신하는 판정표다(퍼블리싱 ↔ 공급사 전환본).
- **현재 집계**: 화면 260 · auto 79 · todo 151(표지 1,701건) · manual 9 · frozen 19 · review 0 · mismatch 2 · error 0.
- **열**:
  - 화면, 판정
  - 정합/퍼블리싱 항목 수, TODO 수
  - 스크립트 참조 누락
  - 공급사 미대응(옮겨 넣음): 예 `trigger:icon:guide`, `select:#1`
  - 메모: 동의어 정합 근거, 퍼블리싱 전용 공통 버튼 등

---

## 7. 그 밖에 퍼블리싱을 언급하는 문서

| 문서 | 관련 내용 |
|---|---|
| [jsp-front/README.md](../../jsp-front/README.md) | 「현재 상태 — 기계 축 종료, 잔여는 회신·퍼블리싱 의존」(퍼블리싱 언급 31곳) |
| [jsp-front/scorecard.md](../../jsp-front/scorecard.md) | §4 다음 손작업 배치 제안 — 디자인 확정된 퍼블리싱 병합 화면 중 점수 순 40건 |
| [gfm_business_analysis_guide.md](../gfm_business_analysis_guide.md) | gfm 업무 분석 md 작성 가이드 중 퍼블리싱 대응 항목(8곳) |
| reply_request.md · form_dep_worklist.md · conversion_playbook.md · sample-front/ui/ULDSTF92024.md | 각 1회 언급 |

## 작업별 읽는 순서

- **화면에 퍼블리싱 반영·생성**: request-template.md → SKILL.md → markup-idioms.md → `publish_gate.py`
- **퍼블리싱 XML 일괄 전환·병합 도구 수정**: conversion_rules.md 규칙 34·35 → publish-tobe/README.md → publish_merge_report.md
