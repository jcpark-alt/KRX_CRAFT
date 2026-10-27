---
name: websquare-publishing
description: WebSquare 화면 XML 에 퍼블리싱(화면 캡처·KRX 퍼블리싱 XML 기준 레이아웃)을 반영하거나 sample-front 레퍼런스로 퍼블리싱 XML 을 생성할 때 사용한다. "퍼블리싱 반영/정비/생성", "캡처 기준으로 화면 배치", "publish XML 대로 맞춰줘" 같은 요청에 적용 — 요청 템플릿 확인, 참조 템플릿 선정, Table/gridView 매핑, 필수 마크업·금지 사항, publish_gate.py 검증까지의 하네스 절차를 담는다.
---

# WebSquare 퍼블리싱 하네스

근거: `conversion/md/report/publishing_model_detailed_report.html` §6(Table/gridView 매핑)·§7(하네스 & Skills).
목표는 **모델에 관계없이 같은 품질**이다. 참조 범위 밖의 코드를 만들지 않고, 컴포넌트 선택을 규칙대로 하고, 게이트를 통과한 결과만 반영한다.

## 절차 (① → ⑥, 건너뛰지 않는다)

### ① 요청 확인 — [request-template.md](request-template.md)
- 필수 항목: **대상 화면 파일**, **퍼블리싱 기준**(캡처 이미지 또는 `conversion/publish/...` XML), **영역별 컴포넌트**.
- 영역별로 퍼블리셔 IDE **스니펫 이름**(예: 「3_01 조회조건1행」)을 줄 수 있다(선택). 주어지면 request-template.md §스니펫 이름 목록의 대응 골격을 따르고, 컴포넌트 지정과 어긋나면 생성 전에 확인한다.
- 영역별 컴포넌트가 비어 있으면 §매핑 규칙으로 채운 표를 **먼저 보여 주고** 진행한다. 판단 신호가 엇갈리는 영역(애매 영역)은 생성 전에 요청자에게 확인한다 — 추측해서 만들지 않는다.

### ② 참조 템플릿 선정
- `conversion/md/sample_templates.md` 의 표준 템플릿 23종에서 화면 유형이 맞는 것을 고른다. 예: 대형 작성화면 → `ULDFIL59410`, 목록+페이징 → `ULDFIL59400`, 조회조건+엑셀 → `ULDINF20000`, 그리드 다건 저장 팝업 → `ULDSTF09343`, 2단 헤더 편집 그리드 → `ULDSTF05610`.
- 다단·탭 퍼블리싱 정답지: `conversion/sample-front/ui/JLDFIL05012.xml`(host) / `JLDFIL05012C.xml`·`JLDFIL05013C.xml`(탭 본문), 탭 본문 안의 탭 → `ULDSTF05927.xml`.
- 영역별 마크업 골격(조회조건·총건수·페이징·버튼 class·입력 관용구·안내 글)과 화면 유형별 마크업 정답지는 **[markup-idioms.md](markup-idioms.md)** 를 본다(sample-front 119화면 실측).
- 동적 컬럼·멀티로우 헤더 gridView: `conversion/sample-front/gridView/ULDFIS00600_수정가이드.md`.
- 카탈로그 밖 sample-front 화면은 **보조 참조**로만 쓴다(일부 stf 샘플은 colgroup 불일치 등 결함이 있다).

### ③ 생성·수정 — 아래 §필수 구조 / §금지 사항 / §매핑 규칙을 지키고, 영역 골격은 [markup-idioms.md](markup-idioms.md) 를 그대로 따른다.
- 새 class 를 쓰기 전에 `cm/css/base.css`·`contents.css` 에 정의가 있는지 확인한다(`grep -n "\.클래스명" cm/css/*.css`). 정의 없는 class 는 화면에 아무 효과가 없다.

### ④ 자동 검증 (필수)
```
PYTHONUTF8=1 python conversion/tools/publish_gate.py --rev HEAD <수정한 xml> ...
```
- 신규 화면(이전 버전 없음)은 `--rev` 없이 실행한다(보존·범위 검사는 자동 생략).
- 단계: lint(`wsxml_lint` 0/0) → gate(`gate_screen.py`) → markup(P01 colgroup·P02 속성 대소문자·P03 탭 본문 contentHeader·P04 CSS 미정의 class 경고) → preserve/scope(P10~P13 보존, P20~P24 범위).
- **FAIL 이 하나라도 있으면 반영하지 않는다.** 원인을 고쳐 다시 돌린다.
- `--allow <코드>` 는 요청자가 승인한 변경에만 쓴다(예: 캡처 문구대로 라벨 교체 → `P12`, 로직 변경 승인 → `P11,P20`). 쓴 경우 보고에 근거를 적는다.
- WARN(P04 CSS 미정의 class, P13 id 누락, P22 스크립트 변경, P23 새 컴포넌트, P24 바인딩·핸들러 추가)은 하나씩 의도된 것인지 확인하고 보고에 남긴다.

### ⑤ 리뷰
- `websquare-code-reviewer` 에이전트로 변경분을 리뷰한다.
- 캡처와 영역 순서·단 구성·제목·버튼 위치를 대조한다. 정적 게이트는 화면 렌더링을 보지 못한다.

### ⑥ 보고
- 게이트 결과(단계별 OK/FAIL, WARN 목록과 판단), `--allow` 사용 근거, 값 출처 미정 영역(`TODO` 표지)을 적는다.
- 반복해서 나온 실패 유형은 이 Skill 의 규칙에 추가하도록 제안한다.

## 필수 구조

| 대상 | 규칙 |
|---|---|
| head | `meta_screenId`·`meta_screenName` 유지, `<w2:publicInfo>` 와 정의 동기화 |
| 화면 골격 | 본화면 `xf:group.sub_contents`, 팝업 `xf:group.pop_contents` — **둘 다** 첫 자식으로 `w2:pageFrame id="pfmContentHeader" src="/cm/xml/contentHeader.xml"` (팝업도 필수, 2026-10-23 확정) |
| 조회조건 | `xf:group.schbox` > `schbox_inner` > table, 조회 버튼은 `xf:group.btn_schbox` > `btn_cm sch` (tblbox 아님) |
| 목록 머리 | `titbox` > h3 + `rt` > 총건수 `xf:group.count`(`w2:span` 총 / `w2:span.num` / `w2:span` 건) + 버튼 |
| 페이징 | `gvwbox` 바로 다음 `xf:group.pglbox` > `w2:pageList class="pgl"` |
| 스크립트 | 5단계 구역(`1. 변수 및 선언` → `2. 초기화` → `3. 컴포넌트 이벤트` → `4. 서브미션 콜백` → `5. 일반/업무 함수`), `scwin.onpageload` 는 2구역 맨 위 — 퍼블리싱 작업은 스크립트를 원칙적으로 건드리지 않는다 |
| 섹션 제목 | `xf:group.titbox` > `w2:textbox tagname="h3"` (+ 안내 `w2:textbox.txt_info`, 버튼 `xf:group.rt`) |
| 안내문 | `w2:textbox class="txt_info"` |
| 버튼 영역 | 섹션 버튼은 titbox 의 `rt`, 화면 하단 버튼은 `xf:group.btnbox` > `xf:group.rt` — 표 안 빈 tr/td 에 버튼을 두지 않는다(팝업 찾기 버튼처럼 입력칸에 붙는 것은 예외) |
| 팝업 닫기 | 팝업 하단 `btnbox` 에 **「닫기」 버튼을 넣지 않는다**(팝업 창 자체의 닫기를 쓴다, 2026-10-23 확정). 캡처에 닫기가 있어도 옮기지 않는다. 하단에 남는 버튼이 없으면 `btnbox` 자체를 두지 않는다. 기존 화면의 `btn_close`(+`ev:onclick` 핸들러)를 지우는 것은 보존 규칙(P11·P13) 대상이라 요청자 승인 후 `--allow` 로 진행한다 |
| 버튼 class | 기본 `btn_cm`, 하단 `btnbox` 의 주요 버튼 5종(취소·삭제·수정·저장·신규)은 `btn_cm pt` 를 붙여 오른쪽 끝에 [취소]-[삭제]-[수정]-[저장]-[신규] 순서, 나머지 버튼은 그 바로 왼쪽(같은 `rt` 안, 전환 규칙 41), 조회 `sch`, 엑셀·파일 `download`/`upload`, 행 `row_add`/`row_del`, 팝업 찾기 `btn_cm icon search`(읽기전용 입력칸과 같은 td) |
| 입력 | 필수 라벨 `w2:textbox class="req"`, 금액 `xf:input class="tar" dataType="number" displayFormat="#,###"`, 한 칸 여러 컨트롤 `xf:group.flex`(줄바꿈 금지 `flex flex_no`), 기간 `flex flex_no` > 달력 + `w2:span "~"` + 달력 |
| 다단 배치 | `xf:group.lybox` > `xf:group.col_N` > `xf:group.tblbox` > table |
| 표 | `xf:group tagname="table" class="w2tb tbl"` + `w2:attributes/w2:summary`, **colgroup 직속 col 수 = 각 행 실제 칸 수**(colspan/rowspan 은 `w2:attributes/w2:colspan`·`w2:rowspan`), th 는 `class="w2tb_th"` + `w2:scope row`, td 는 `class="w2tb_td"` |
| 그리드 | `xf:group.gvwbox` > `w2:gridView class="gvw rowN" dataList="data:dlt_*"` — gBody column id = dataList 컬럼 id. `rowN` 은 `row5`·`row10`·`row15`·`row20`·`row25` 만 CSS 가 있고 그 밖의 행 수는 class 없이 `visibleRowNum` |
| 탭 | host 는 `xf:group.tbcbox` > `w2:tabControl` > `w2:content` > `w2:pageFrame src`. 선택 탭 속성은 엔진 옵션명 `selectedIndex`(`selectedTabIndex` 는 엔진이 읽지 않음) |
| 탭 안의 탭 | 탭 본문(`w2:content`) 안에 다시 두는 하위 tabControl 도 상단 탭과 **같은 형태** — `xf:group.tbcbox` > `w2:tabControl class="tbc"`. `tbc_sub`(template 4_02 서브탭, 밑줄형)로 바꾸지 않는다(요청자 확정 2026-10-22). `tbcbox` 래퍼를 빼면 `.tbc::before` 테두리 오버레이가 바깥 탭 기준으로 붙어 깨진다 |
| contentHeader | windowContainer 로 여는 화면(host)과 **팝업에는 넣고**, **tabControl 탭 본문에만 넣지 않는다**(팝업 포함은 2026-10-23 변경 — 종전 "팝업 없음" 규칙 폐기) |
| 속성명 | `readOnly`(대문자 O) — `readonly` 는 무시된다 |

## 금지 사항
- 팝업 하단 「닫기」 버튼 추가, 팝업에서 contentHeader pageFrame 생략.
- 참조 템플릿·원본 화면에 없는 **컴포넌트·스크립트·스타일 추가**(새 scwin 함수, head 의 외부 script/link/style 포함).
- 기존 `ref` 바인딩, `ev:on*` 핸들러, 라벨 텍스트, 컴포넌트 id 의 삭제·변경(캡처 문구 교체는 요청자 승인 후 `--allow P12`).
- `var`, `console.log`, 원시 `alert(`, `debugger`, jQuery `$(`, `innerHTML`, 느슨한 비교(`==`/`!=`).
- gcc(`cm/gcc`)·모듈 pcc(`cm/pcc/<모듈>`)에 없는 `$c.*` 호출, 공통함수 임의 생성.
- 인라인 고정 px 남발 — 다단 배치로 좁아진 칸 조정처럼 꼭 필요한 곳만.
- 값 출처를 모르는 영역에 임의 바인딩 — `TODO` 주석으로 남기고 보고한다.
- CSS·엔진이 인식하지 않는 class·속성: `grdbox`(→ `gvwbox`), 5/10/15/20/25 외 `rowN`(→ `visibleRowNum`), `w95`·`w520` 같은 정의 없는 폭 class, `selectedTabIndex`(→ `selectedIndex`), 보조 샘플의 W-Craft 잔여 속성(`userData2`·`hierarchy`·`orgid`·`comp_par_seqId`) 복사. 목록과 발견 위치는 [markup-idioms.md](markup-idioms.md) §8.

## Table / gridView 매핑 규칙

| 판단 신호 | gridView | Table |
|---|---|---|
| 데이터 건수 | N건(가변), 서버 조회 결과 | 1건(단건), 고정 항목 |
| 배치 형태 | 컬럼 헤더 1~2단 + 같은 형식의 행 반복 | 라벨-값 쌍, colspan/rowspan 혼재 |
| 동반 기능 | 페이징, 엑셀, 행 추가/삭제, 체크박스 열, 정렬 | 조회 버튼, 입력 검증, 팝업 찾기 버튼 |
| 바인딩 | `dlt_*`(dataList) | `dma_*`(dataMap) |
| 대표 영역 | 조회 결과 목록, 다건 저장/수정/삭제, 첨부파일 목록 | 조회조건, 상세/입력 폼, 신청인·발행사 정보 |

경계 사례:
- 행이 고정된 읽기 전용 소형 표(예: 계산 결과 3행) → **Table**.
- 진입 시점에 행 수가 정해지지 않으면 건수가 적어도 → **gridView**.
- 원본이 같은 입력칸을 번호 접미사로 반복(`ipt_x_1`~`_5`)하고 서버 응답이 목록이면 gridView 통합을 **제안**만 한다 — 로직 변경(P11/P20)이 따르므로 요청자 승인 후 진행.
- 신호가 엇갈리면 생성 전에 묻는다.

## 모델별 주의 (보고서 §5)
- 공통: 요청 템플릿의 영역별 컴포넌트를 채운 뒤 생성한다.
- 참조 외 코드를 덧붙이는 경향이 관찰된 모델일수록 ④의 P20~P24 결과를 엄격히 본다.
- gridView 지정 누락이 잦은 모델은 ①에서 gridView 대상 영역을 반드시 확정한다.
