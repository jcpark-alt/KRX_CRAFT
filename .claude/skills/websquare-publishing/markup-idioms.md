# 퍼블리싱 마크업 관용구 (sample-front 실측)

`conversion/sample-front/ui/**` 119화면을 집계해(2026-10-22) **여러 화면이 같은 방식으로 쓰는 마크업**만 골라 정리했다.
괄호 안 숫자는 그 관용구를 쓰는 샘플 파일 수이고, `「n_nn 이름」` 은 퍼블리셔 IDE 스니펫 이름(`meta_snippetName`)이다.
퍼블리싱 생성·수정 시 SKILL.md §필수 구조와 함께 이 골격을 그대로 따른다. 골격의 `…` 는 화면마다 채우는 자리다.

## 0. 어느 샘플을 보고 베끼나

- **정답지** : `conversion/md/sample_templates.md` 카탈로그 23종 + `JLDFIL05012`(탭 host)·`JLDFIL05012C`·`JLDFIL05013C`(탭 본문) + `ULDSTF05927`(탭 안의 탭).
- **보조 참조** : 그 밖의 `ui/stf/**`·`ui/fil/**` 화면. W-Craft 잔여 속성(`userData2`·`hierarchy`·`orgid`)과 CSS 없는 class 가 섞여 있어 구조만 참고하고 속성은 옮기지 않는다.

| 화면 유형 | 마크업 정답지 |
|---|---|
| 목록 + 페이징 (본화면) | `ULDFIL59400` |
| 조회 팝업 + 페이징 | `ULDFIL52110` |
| 조회조건 + 기간검색 + 엑셀 | `ULDINF20000` |
| 대형 작성화면(다구역·상태별 버튼) | `ULDFIL59410` |
| 입력폼 + 팝업조회 + 첨부 | `ULDFIL52100` |
| 그리드 다건 저장 팝업 | `ULDSTF09343` |
| 2단 헤더 편집 그리드 | `ULDSTF05610` |
| 탭 host / 탭 본문(pageFrame) | `JLDFIL05012` / `JLDFIL05012C` |
| 탭 본문 안의 탭(인라인) | `ULDSTF05927` |
| 다단 배치(lybox) | `JLDFIL05012C` |

## 1. 화면 골격 「0_01 페이지시작」「0_02 팝업페이지시작」

```xml
<!-- 본화면 (40) : contentHeader 필수 -->
<xf:group class="sub_contents" id="" meta_componentContainer="true" style="">
	<w2:pageFrame id="pfmContentHeader" src="/cm/xml/contentHeader.xml" style="" />
	…
</xf:group>

<!-- 팝업 (54) : contentHeader 없음 -->
<xf:group class="pop_contents" id="" meta_componentContainer="true" style="">
	…
	<xf:group class="btnbox" id="" style="">…</xf:group>   <!-- 3절 팝업 하단 버튼 -->
</xf:group>
```

- 팝업에 contentHeader 를 넣은 샘플 18본은 표준(본화면 필수·팝업 없음, tabControl 탭 본문은 넣지 않음)과 어긋난 것이다. 베끼지 않는다.

## 2. 조회조건 「3_01 조회조건1행」「3_02 조회조건2행」 (38)

```xml
<xf:group class="schbox" id="" style="">
	<xf:group class="schbox_inner" id="" style="">
		<xf:group adaptive="layout" adaptiveThreshold="768" class="w2tb tbl" id="" style="" tagname="table">
			<w2:attributes><w2:summary>조회조건</w2:summary></w2:attributes>
			<xf:group tagname="colgroup">…</xf:group>
			<xf:group tagname="tr">… th/td …</xf:group>
		</xf:group>
	</xf:group>
	<xf:group class="btn_schbox" id="" style="">
		<xf:trigger class="btn_cm sch" id="btn_search" type="button"><xf:label><![CDATA[조회]]></xf:label></xf:trigger>
		<!-- 엑셀 버튼이 조회 옆에 있으면 -->
		<xf:trigger class="btn_cm download" id="btn_excel" type="button"><xf:label><![CDATA[엑셀다운로드]]></xf:label></xf:trigger>
	</xf:group>
</xf:group>
```

- 조회조건은 `tblbox` 가 아니라 `schbox` > `schbox_inner` 다. 조회 버튼을 표 안 빈 칸에 두지 않는다.

## 3. 버튼

### 3.1 버튼 class 사전

| class | 용도 | 예 |
|---|---|---|
| `btn_cm` | 모든 텍스트 버튼의 기본 (108) | 닫기, 취소 |
| `btn_cm pt` | 주요 동작 — 저장·확인·등록·접수 (62) | 저장 |
| `btn_cm sch` | 조회조건의 조회 버튼 (36) | 조회 |
| `btn_cm download` / `upload` | 엑셀·파일 내려받기 / 올리기 (25 / 9) | 엑셀다운로드 |
| `btn_cm row_add` / `row_del` | 그리드 행 추가 / 삭제 (14) | 행추가 |
| `btn_cm icon search` | 입력칸 옆 돋보기(팝업 찾기) — 라벨은 화면에 안 보임 (43) | 4.3 |
| `btn_cm delete icon` | 첨부·행의 아이콘 삭제 「8_03 아이콘삭제버튼」 | 첨부 삭제 |

### 3.2 버튼 영역

```xml
<!-- 화면·팝업 하단 「8_04 전체제어버튼」「8_05 팝업전체제어버튼」 : 주요 버튼(pt)을 맨 오른쪽(마지막)에 -->
<xf:group class="btnbox" id="" style="">
	<xf:group class="lt" id="" style="">…</xf:group>          <!-- 왼쪽 버튼이 있을 때만 -->
	<xf:group class="rt" id="" style="">
		<xf:trigger class="btn_cm" id="btn_close" type="button"><xf:label><![CDATA[닫기]]></xf:label></xf:trigger>
		<xf:trigger class="btn_cm pt" id="btn_save" type="button"><xf:label><![CDATA[저장]]></xf:label></xf:trigger>
	</xf:group>
</xf:group>

<!-- 섹션 버튼 : 제목줄 오른쪽 -->
<xf:group class="titbox" id="" style="">
	<w2:textbox id="" label="…" style="" tagname="h3" />
	<xf:group class="rt" id="" style="">…버튼…</xf:group>
</xf:group>
```

## 4. 입력 관용구

### 4.1 필수 항목 (40)
- 라벨(th 안의 textbox)에 `class="req"` 를 붙인다: `<w2:textbox class="req" id="" label="종목명" style="" />`.
- 입력 컴포넌트에도 `class="req"` 를 붙이는 화면이 있다(22). 라벨 `req` 가 우선이다.

### 4.2 금액·수량 「10_12 금액」 (21)
```xml
<xf:input class="tar" dataType="number" displayFormat="#,###" id="…" ref="data:…" style="width:150px;" />
```
- 오른쪽 정렬 `tar` + `dataType="number"`. 소수 자리 표시·입력 제한은 `SMPFMT10000`(소수 데이터 표시 가이드)을 따른다.

### 4.3 팝업 찾기 「10_10 InputBox_조회버튼」 (43)
```xml
<xf:group class="w2tb_td" style="" tagname="td">
	<xf:input id="ipt_isuCd" readOnly="true" ref="data:…" style="width:120px;" />
	<xf:trigger class="btn_cm icon search" id="btn_isuCd" type="button"><xf:label><![CDATA[종목 찾기]]></xf:label></xf:trigger>
</xf:group>
```
- 읽기전용 입력칸과 돋보기 버튼을 같은 td 에 둔다. 표 안 버튼 금지(SKILL.md)의 예외가 이 경우다.

### 4.4 한 칸에 여러 컨트롤 (44)
- `xf:group class="flex"` 로 감싼다. 줄바꿈하면 안 되면 `class="flex flex_no"`.
- 단위·괄호 같은 짧은 글자는 `<w2:textbox tagname="span" … />` 또는 `<w2:span label="…" />`.

### 4.5 기간 「10_11 기간조회」 (60 사용)
```xml
<xf:group class="flex flex_no" id="" style="">
	<w2:inputCalendar id="cal_fromDt" ref="data:…" style="" />
	<w2:span id="" label="~" style="" />
	<w2:inputCalendar id="cal_toDt" ref="data:…" style="" />
	<!-- 기간 버튼이 있으면 이어서 btn_cm -->
	<xf:trigger class="btn_cm" id="btn_1m" type="button"><xf:label><![CDATA[1개월]]></xf:label></xf:trigger>
</xf:group>
```

## 5. 목록 영역

### 5.1 제목줄 + 총건수 「총건수」 (33)
```xml
<xf:group class="titbox" id="" style="">
	<w2:textbox id="" label="…목록" style="" tagname="h3" />
	<xf:group class="rt" id="" style="">
		<xf:group class="count" id="" style="">
			<w2:span id="" label="총" style="" />
			<w2:span class="num" id="spn_totCnt" label="0" style="" />
			<w2:span id="" label="건" style="" />
		</xf:group>
		<xf:trigger class="btn_cm download" id="btn_excel" type="button"><xf:label><![CDATA[엑셀다운로드]]></xf:label></xf:trigger>
	</xf:group>
</xf:group>
```
- 총건수는 `titbox` > `rt` 안, 버튼 앞이다. 제목이 없는 목록이면 h3 없이 `titbox` > `rt` 만 둔다(`ULDFIL59400`).

### 5.2 그리드 「6_01 그리드」「6_02 그리드_순번_상태」 (95)
```xml
<xf:group class="gvwbox" id="" style="">
	<w2:gridView autoFit="allColumn" class="gvw row10" dataList="data:dlt_…" focusMode="row" id="grd_…"
		rowNumVisible="true" style="" visibleRowNum="10">
		<w2:caption id="" style="" value="…목록" />
		<w2:header id="…_hd" style="">…</w2:header>
		<w2:gBody id="…_bd" style="">…</w2:gBody>
	</w2:gridView>
</xf:group>
```
- 높이 class `rowN` 은 **`row5`·`row10`·`row15`·`row20`·`row25` 만** CSS 가 있고(`cm/css/base.css` `.gvwbox .w2grid.rowN`), `gvwbox` 안에서만 먹는다. 그 밖의 행 수는 class 없이 `visibleRowNum` 으로 맞춘다.
- 감싸는 group 은 `gvwbox` 다. `grdbox` 는 CSS 가 없다(SMPDLT10000·SMPFMT10000·SMPVAL10000 에 있던 것을 2026-10-22 정정).
- 컬럼 id 는 dataList 컬럼 id 와 같게, 날짜 컬럼은 `dataType="date" displayFormat="yyyy-MM-dd"`, 숫자 컬럼은 `textAlign="right"` + `displayFormat`.

### 5.3 페이징 「6_03 페이지리스트」 (11)
```xml
<xf:group class="pglbox" id="" style="">
	<w2:pageList class="pgl" displayButtonType="display" displayFormat="#" id="pgl_…" pageSize="10" pagingType="0" style="" />
</xf:group>
```
- `gvwbox` 바로 다음에 둔다.

## 6. 제목·안내 글

| 용도 | 마크업 |
|---|---|
| 섹션 제목 「2_02 서브타이틀(h3)」 (45) | `xf:group.titbox` > `w2:textbox tagname="h3"` |
| 섹션 안 소제목 「2_03 서브타이틀(h4)」 (13) | `xf:group.titbox` > `w2:textbox tagname="h4"` |
| 한 줄 안내 「11_03 정보제공메시지」 (25) | `w2:textbox class="txt_info"` |
| 여러 줄 안내 | `xf:group tagname="ul" class="txt_list"` > `xf:group tagname="li"` > `w2:textbox` (19) |
| 안내 박스 | `xf:group.infobox` > `w2:textbox.txt_info_gray` + `ul.txt_list` (`SMPPRT10000`) |
| 메시지 박스 「11_05 에러메시지박스」 | `xf:group.msgbox` > `w2:textbox.txt_con` (8) |
| 강조 글자 | `w2:textbox` 의 `blue`·`red`·`bold` |

- `h2`(페이지 제목)는 샘플 화면에서 쓰지 않는다(`template.xml` 견본에만 있음). 화면 제목은 본화면 contentHeader 영역의 몫이다.

## 7. 표 칸 보조 class

| class | 위치 | 용도 |
|---|---|---|
| `tac` / `tar` / `tal` | th·td | 칸 가운데 / 오른쪽 / 왼쪽 정렬 (기간 비교표 머리행 등) |
| `in_tbl` | td | 칸 안에 표·그리드를 다시 넣을 때 (11) |
| `tar` | xf:input | 숫자·금액 입력칸 오른쪽 정렬 (4.2) |

## 8. 쓰지 않는 class·속성 (CSS·엔진이 인식하지 않음)

| 쓰지 말 것 | 대신 | 있던 위치 (2026-10-22 정정 완료) |
|---|---|---|
| `grdbox` | `gvwbox` | SMPDLT10000·SMPFMT10000·SMPVAL10000 |
| `row3`·`row4`·`row6` 등 5/10/15/20/25 외 `rowN` | class 없이 `visibleRowNum` | ULDSTF05927~29·ULDSTF92024 |
| `w95`·`w520` 같은 폭 class (CSS 에 `wNN` 폭 class 없음) | 인라인 `style="width:…"` 또는 colgroup 폭 | JLDFIL05013C(→ 120px, 같은 표 입력칸 폭)·JLDFIL05012C(→ 100%, 같은 표 위 칸 폭) |
| `selectedTabIndex` | `selectedIndex` | JLDFIL05012·JLDFIL05012C |
| `readonly`(소문자) | `readOnly` | (P02 가 차단) |
| `userData2`·`hierarchy`·`orgid`·`comp_par_seqId` | 옮기지 않음(W-Craft 잔여) | stf·fil 보조 샘플 다수 |

- 새 class 를 쓰기 전에 `cm/css/base.css`·`contents.css` 에 정의가 있는지 확인한다: `grep -n "\.클래스명" cm/css/*.css`.
