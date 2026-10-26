# Gauce(.gfm) 화면 업무 분석 md 작성 가이드

Gauce/X-Internet 화면 원본(`.gfm`)을 읽고 업무를 분석해 **업무 분석 md** 를 쓴 뒤, 그 md 를 근거로
`conversion/sample-front/ui/` 의 샘플 화면과 같은 꼴의 WebSquare XML 로 전환하는 작업의 **분석 단계 지침**이다.

| 항목 | 내용 |
|---|---|
| 입력 | `conversion/sample-front/as-is/{화면ID}.gfm` (UTF-8 BOM XML — `<gform>` 루트) |
| 산출 1 (이 가이드) | `conversion/sample-front/ui/{화면ID}.md` — 업무 분석 및 전환 내역 |
| 산출 2 (다음 단계) | `conversion/sample-front/ui/{화면ID}.xml` — md 를 근거로 전환한 화면 |
| 정답지 | `ui/ULDSTF92024.md` ↔ `as-is/ULDSTF92024.gfm` ↔ `ui/ULDSTF92024.xml` (공시안내문작성 팝업, a5714970·71797409) |
| 관련 규칙 | [conversion_rules.md](conversion_rules.md)(규칙 0·16·17·21·29) · [substitution_map.md](substitution_map.md) · [createdialogframe_popup_guide.md](createdialogframe_popup_guide.md) · [dynamic_submission_guide.md](dynamic_submission_guide.md) · [sample_templates.md](sample_templates.md) |

> **왜 md 를 먼저 쓰는가** — gfm 은 동기 통신·모달 대기·1-base dataset·암묵 전역에 기대고 있어서, 줄 단위로 바꾸면
> 동작이 깨지는데 겉보기엔 맞아 보인다. 업무 규칙(분기 조건·서식코드·메시지·서버 계약)을 먼저 **사람이 읽을 수 있는 형태로
> 고정**해 두면, 전환본을 검토할 때 "원본이 실제로 무엇을 했는가"를 md 와 대조해 확인할 수 있다. md 는 전환본 head 의
> `meta_desc` 에 `업무 분석 {화면ID}.md` 로 연결한다.

---

## 1. 작업 흐름

```
0. 자료 수집      gfm + 짝 화면(_EN 등) + 하위 팝업 gfm + 호출 화면 + 퍼블리싱 XML + 화면 캡처
1. gfm 해부       <gform> 속성 · <model> · <components> · <script> · <events> 를 목록화 (§3)
2. 업무 재구성    이벤트 → 함수 → 통신 → 분기를 따라가며 "무엇을 왜" 하는지 문장으로 정리
3. md 작성        §4 의 표준 9장 구성으로 작성 (원본 이름 그대로, 전환 이름은 옆 칸)
4. 자체 검토      §6 함정 목록 · §7 완료 체크리스트
5. 전환 진입      md §8(전환 내역) 대로 XML 작성 → 게이트 (§7.2)
```

md 는 한 번에 완성하지 않는다. 1~3단계로 §1~§7 을 먼저 쓰고, 전환하면서 §8(전환 내역)·§9(TODO)를 채우며,
리뷰에서 바뀐 결정은 md 에도 반영한다(정답지도 리뷰 반영 커밋 71797409 에서 md·xml 을 함께 고쳤다).

---

## 2. 자료 수집 (0단계)

| 자료 | 찾는 곳 / 방법 | md 에서 쓰는 곳 |
|---|---|---|
| 원본 gfm | `sample-front/as-is/` (반입 경로도 기록: `KRX_웹스퀘어_전환/반입/{날짜}/…`) | 헤더 표 `원본` |
| 짝 화면 | `{ID}_EN.gfm`(영문판), `_KOSDAQ` 등 같은 구조 변형 | 헤더 표 `영문 짝`, §7 |
| `#include` JS | gfm `<script>` 첫머리 `#include("../js/xxx.js")` — `list_common.js`·`stf.js`·`session.js`·`report.js` 등 | §8 공통함수 대응 |
| 하위 팝업 | `CreateDialogFrame`/`ShowModalDialog`/`OpenFrame` 의 대상 gfm | §4 흐름, §9 TODO(미전환이면) |
| 호출 화면 | 이 화면을 여는 화면 — `conversion/publish`·`as-is` 에서 화면ID grep | §1 호출 화면·호출 규약 |
| 퍼블리싱 XML | `conversion/publish/**/{ID}.xml` 또는 이미 퍼블리싱된 `ui/{ID}.xml` | §2 전환본 id |
| 화면 캡처 | 요청자 제공 png (분기별 상태 — 예: 체크/미체크) | 헤더 표 `화면 캡처` |
| 업무공통 | `cm/pcc/{fil|stf|mgt|tms}` 의 `publicInfo` ([pcc 모듈 규칙](../../cm/pcc)) | 헤더 표 `업무공통`, 게이트 `--pcc` |

```sh
# 이 화면을 여는 화면 찾기 (호출 화면 수 · 대표 목록)
grep -rl "ULDSTF92024" conversion/publish cm/as-is --include=*.xml --include=*.gfm | wc -l
# 하위 팝업 · include 목록
grep -n "#include\|CreateDialogFrame\|ShowModalDialog\|OpenFrame\|\.gfm" conversion/sample-front/as-is/{ID}.gfm
```

---

## 3. gfm 해부 (1단계)

gfm 은 다섯 덩어리다. 위에서부터 차례로 목록을 뽑으면 md §2·§3·§4·§5 의 뼈대가 된다.

```xml
<gform version="1.5" width="730" height="785" …>   ← 창 크기: 팝업 여부·크기 (헤더 표)
  <style> @import … </style>                         ← 무시 (CSS 는 퍼블리싱 기준)
  <model>                                            ← §3 데이터셋 · §5 통신 객체
    <mxdataset id="dts_*">  <mxlogicaltr id="trs">  <mxbinder id="bnd_*">
  </model>
  <components>                                       ← §2 화면 구성
    <panel> <image> <textbox> <checkbox> <mxgrid> <mxtextarea> <mxfilecontrol> …
  </components>
  <script><![CDATA[ #include … 전역 변수 … function … ]]></script>   ← §4 흐름 · §6 상수
  <events><event for="{id}" eventname="{이벤트}"><![CDATA[ … ]]></event> …</events>  ← §4 진입점
</gform>
```

### 3.1 덩어리별 추출 항목

| 덩어리 | 뽑을 것 | 주의 |
|---|---|---|
| `<gform>` | `width`·`height` → 창 크기, 팝업이면 "W×H 모달 창" | 호출부의 `CreateDialogFrame` 인자 크기와 대조 |
| `<mxdataset>` | id, `syncload`(동기 로딩), `usechangeinfo` | **컬럼은 gfm 에 없다** — 스크립트의 `NameString(row,"COL")`·`getGauceDataHeader("전문ID")`·그리드 `<column id>`·서버 전문 정의에서 모은다 |
| `<mxlogicaltr>` | id(`trs`), `keyname` | 실제 URL·입출력은 스크립트의 `trs.Action`/`KeyValue`/`Parameters` 에 있다 |
| `<mxbinder>` | 컬럼 ↔ 컨트롤 ↔ 속성(`param`) | 전환본의 `ref="data:…"` 바인딩 근거 |
| `<components>` | id, 종류, 읽기전용·maxlength·`text`(라벨), 부모 panel | **폭/높이 0, 항상 숨김, 겹친 컴포넌트**는 "보이지 않음"으로 따로 표시 (§6) |
| `<mxgrid>` `<format>` | 컬럼 이름(헤더)·`id`(데이터 컬럼)·`value="{CurRow}"`(순번)·폭·정렬 | `<ref dataid>` 로 dataset 연결 확인 |
| `<script>` 전역 | `var` 상수(메시지·화면ID)·상태 변수·함수 포인터(`OnSuccessAfter`) | **선언 오타/미선언 사용**(예 `stKeyTit` vs `sKeyTit`)을 찾아 둔다 |
| `<script>` 함수 | 이름, 호출자, 통신 여부, 분기 | 정의만 있고 호출 없는 함수 → §8 "삭제" 후보 |
| `<events>` | `for` × `eventname` 전부 | `gform onload` = 진입점, `trs OnSuccess/OnFail` = 통신 콜백, `ds OnLoadCompleted` = 조회 후처리 |

```sh
F=conversion/sample-front/as-is/{ID}.gfm
grep -n '<mx\(dataset\|logicaltr\|binder\|grid\)' $F                # 모델·그리드
grep -no '<[a-z]* id="[^"]*"' $F | sed -n '/components/,$p'         # 컴포넌트 id
grep -n 'function \|<event for=' $F                                  # 함수·이벤트 목차
grep -n 'NameString\|NameValue\|getGauceDataHeader' $F               # dataset 컬럼 수집
grep -n 'Action\|DataID\|method=\|queryId\|outputMessageId' $F       # 서버 통신
grep -n 'MSG-[0-9]*\|alert(\|confirm(' $F                            # 메시지
grep -no '"[0-9A-Z]\{5,7\}"' $F | sort -u                            # 서식·코드 상수 후보
```

### 3.2 업무 재구성 (2단계) 순서

1. **진입점부터** — `gform onload` 를 한 줄씩 따라가 "로딩 시 무엇을 결정하는가"(파라미터 수신 → 조회 → 모드 결정 → 최초 생성)를 번호 목록으로 적는다.
2. **사용자 동작별** — 버튼·체크·그리드 이벤트마다 "확인 메시지 → 검증 → 통신 → 성공/실패 처리 → 화면 변화"를 적는다.
3. **분기 조건은 표로** — 시장구분·서식코드·권한·상태(`MOD_YN` 등) 조합이 둘 이상 얽히면 조건 × 결과 표로 정리한다(정답지 §4.1 의 시장별 모드 표).
4. **통신은 계약으로** — URL·method·queryId·입력 dataset·출력 전문 ID 를 한 행에 모은다(§5).
5. **원본의 실제 동작을 기록** — 의도와 다르게 동작하는 부분(주석 처리된 가드, 도달 불가 분기)은 고치지 말고 그대로 적은 뒤 §7 로 보낸다.

---

## 4. 업무 분석 md 표준 구성 (3단계)

정답지 `ULDSTF92024.md` 의 장 구성을 표준으로 한다. 해당 사항이 없는 장은 지우지 말고 "해당 없음" 한 줄을 남긴다
(빠뜨린 것인지 없는 것인지 구분하기 위해).

### 제목 · 헤더 표

```markdown
# {화면ID} {화면명} — 업무 분석 및 전환 내역

| 항목 | 내용 |
|---|---|
| 원본 | `/{원본경로}/{ID}.gfm` (Gauce/X-Internet, {W}×{H} 모달 창 | 메인 화면) — 반입 `{반입 경로}` |
| 영문 짝 | `{ID}_EN.gfm` (…) — 없으면 행 삭제 |
| 전환본 | `conversion/sample-front/ui/{ID}.xml` (퍼블리싱 {커밋} → 이 문서 기준 스크립트 전환) |
| 화면 캡처 | `{파일명}.png`({상태}) · … |
| 업무공통 | `$c.{ns}`({사용 함수}) — `cm/pcc/{ns}`. 게이트는 `--pcc {ns}` 로 돌린다 |
```

### §1 업무 개요

- 첫 문단: **누가, 어느 화면에서, 무엇을 하려고** 이 화면을 쓰는가(한두 문장).
- 번호 목록: 업무 처리 단계 3~5개(입력 → 서버 처리 → 확인 → 저장/전송 → 부가 기능).
- **호출 화면**: 이 화면을 여는 화면 수와 대표 화면ID 군(§2 grep 결과).
- **호출 규약 (부모 → 팝업)** — 팝업이면 필수. 부모가 넘기는 함수 시그니처를 코드 블록으로, 배열 인수는 인덱스별 표로:

  | arr | 의미 | 비고 |
  |---|---|---|
  | `arr[0]` | … | 값 예시, 빈 값·길이에 따른 분기(예: "길이 5 이상이면 `isNoGen`") |

  dataset 인수는 누가 채우는지(`CopyDataSet`), 팝업이 내용을 해석하는지 그대로 넘기는지 적는다.

### §2 화면 구성

| 영역 | 원본 컴포넌트 | 전환본 | 설명 |
|---|---|---|---|
| (사용자가 보는 영역 이름) | `부모panel` > `컴포넌트id` | 전환 id (바인딩) 또는 **(옮기지 않음)** | 노출 조건·읽기전용·용도 |

- 영역은 화면 위→아래, 왼→오른 순서.
- 원본 컴포넌트 두 개를 하나로 합치면(예: `tar`+`pan` → `edt_contn`) 그 이유를 설명 칸에 적는다.
- 보이지 않는 컴포넌트(폭 0 디버그 영역, 항상 숨김 버튼)도 행을 만들고 "(옮기지 않음)" + 근거.

### §3 데이터셋

| 원본 | 전환본 | 내용 |
|---|---|---|
| `dts_Xxx` | `dlt_Xxx` / `dma_xxx` / (삭제) / (응답 값 직접 사용) | 행 수(1행/다건), **컬럼 목록**, 서버 전문 ID(`XXX_INOUT`), 누가 채우는가 |

- 1행짜리 조건·입력 dataset 은 전환본에서 `dataMap`(`dma_`)이 맞는지 판단해 적는다.
- 컬럼 출처가 서로 다르면(스크립트·그리드·전문) 모두 합친 목록을 쓰고, 미확정이면 "컬럼 미정(…)"이라고 쓴다.
- 쓰이지 않는 dataset(주석 코드에서만 참조)은 "(삭제) 쓰지 않음" — 규칙 0 에 따라 주석 속 코드는 근거로 삼지 않는다.

### §4 처리 흐름

하위 절 하나 = 진입점 하나. 제목에 **원본 함수 → 전환 함수**를 함께 쓴다.

```markdown
### 4.1 로딩 (`gform onload` → `scwin.init`)
### 4.2 {업무 동작} (`fn_xxx` → `scwin.xxx`)
### 4.n {버튼} (`btn_xxx` → `fn_xxx` → `scwin.xxx`)
```

- 번호 목록으로 순서대로. 메시지는 **MSG 코드 + 문구**(`MSG-0024` "공시검토단계로 전송하시겠습니까?"), 하드코딩 문구는 그대로 인용.
- 동기 조회는 "(동기)"라고 표시한다 — 전환 시 `await` 순서를 정하는 근거다.
- 조건 조합은 표, 부서·권한별 값 매핑(결재란 등)도 표.
- "재생성 시점", "닫힌 뒤 다시 조회" 처럼 **같은 함수가 여러 곳에서 불리는 시점**을 모아 적는다.

### §5 서버 통신

| 용도 | AS-IS | 입력 | 출력 | 전환본 (TODO: API 확정) |
|---|---|---|---|---|
| 원공시 조회 | `listingCommon.do?method=listGeneral` `queryId=…` `{P}P1=…` | dataset·파라미터 | 전문 ID → dataset | `scwin.selectXxx` GET `/api/…` |

- AS-IS 는 `trs.Action`·`ds.DataID` 문자열을 분해해 **method / queryId / outputMessageId / {P}파라미터**를 따로 적는다.
- `trs.KeyValue` 의 `pXxx=dts_Xxx` 쌍은 입력/출력 칸으로 나눈다.
- 공통 부가 파라미터(`SCREN_ID`, `SCREN_PROCES_TP_CD`, `fn_encodeNSession` 세션 정보)는 표 아래 문단으로 한 번만 설명하고 전환본의 처리 방침을 적는다.
- 전환본 API 경로는 확정 전이면 **가정임을 표 제목에 명시**하고 §9 에 TODO 로 올린다.

### §6 업무 코드 · 상수 목록

서식코드·상태코드·부서코드처럼 **분기 조건으로 하드코딩된 값**을 용도별 하위 절로 모은다.

- 하위 절 제목 = 용도(예: "HTML 변환 대상", "전송 전 안내 대상"), 주석에 날짜가 있으면 함께(`— 2011.08.16`).
- 코드는 의미 단위로 묶고(`관리종목지정 68052~68052F`), 접두 비교(`substr(0,5)`)는 `70837*` 처럼 표기.
- "조건은 있으나 실제 효과 없음"(예: 영문 미리보기 라벨)도 그 사실을 적는다.

코드가 없는 단순 화면이면 "해당 없음".

### §7 원본 특이사항·결함

| # | 내용 | 전환본 처리 |
|---|---|---|
| 1 | 원본에서 실제로 일어나는 일(근거 줄·변수명) | 그대로 유지 / 고침(어떻게) / 옮기지 않음 |

- **원본 결함을 고칠지 유지할지는 반드시 칸에 결정으로 적는다.** 업무 결과가 달라지는 수정은 "그대로 유지"를 기본으로 하고 TODO 로 확인을 올린다.
- 유형: 미선언 변수, 주석 처리돼 무효인 가드, 도달 불가 분기, 겹친 컴포넌트, 진입점 없는 기능, 숨은 덮어쓰기.

### §8 전환 내역 (AS-IS → TO-BE)

| AS-IS | TO-BE |
|---|---|
| `fn_xxx` / `OnSuccessAfterXxx` | `scwin.xxx` / `scwin.afterXxx` |

전환하면서 채운다. 아래 유형을 빠짐없이 한 행씩:

- 진입점(`gform onload` → `scwin.onpageload` → `scwin.init`)
- 함수 개명(`fn_` 제거 + camelCase — 규칙 13). **하위 팝업이 원본 이름으로 부르는 함수는 원본 이름 유지**하고 이유를 적는다(게이트 `fn_ def` 보고가 의도임을 남김).
- 전역 변수 → `scwin.*`
- 통신(`trs.Post()` + 함수 포인터 콜백 → `await $c.sbm.executeDynamic` — 규칙 16)
- 팝업(`CreateDialogFrame` → `$c.win.openPopup` — 규칙 17), 부모 접근(`frame.Provider("../")` → `$c.win.getParent()` — 규칙 21)
- dataset/그리드 API(규칙 29), 컴포넌트 API(`tar.text`/`innerHTML` → `setValue`/`setHTML`)
- 공통함수(`#include` JS 함수 → `$c.*` / `$c.{pcc}.*` — [substitution_map.md](substitution_map.md))
- `alert`/`confirm` → `await $c.win.alert`/`await $c.win.confirm`, `frame.CloseFrame()` → `$c.win.closePopup()`
- 세션 변수(`js_market`, `js_dep_cd`) → `$c.session.getUserInfo(...)`
- 삭제 항목(호출 없는 함수, 디버그 영역)과 근거

### §9 남은 작업 (TODO)

번호 목록. 각 항목은 **무엇이 미확정인지 + 확정되면 무엇을 바꾸는지 + 관련 장 번호**.
대표 항목: 서버 API 확정, 호출부 계약(모달 대기 차이), 미전환 하위 팝업, Gauce API 기반으로 남은 업무공통 함수,
실화면에서만 확인 가능한 엔진 동작(editor 왕복, 팝업 차단 등).

---

## 5. Gauce → WebSquare 대응 요약 (분석 시 참고)

분석 단계에서 "전환본" 칸을 채울 때 쓰는 요약이다. 상세·정본은 [conversion_rules.md](conversion_rules.md) 와 [substitution_map.md](substitution_map.md).

| Gauce (gfm) | WebSquare (sample-front 꼴) | 분석 시 확인할 것 |
|---|---|---|
| `<mxdataset>` 다건 | `<w2:dataList id="dlt_*">` + `columnInfo` | 컬럼 출처 수집(§3.1) |
| `<mxdataset>` 1행 조건/입력 | `<w2:dataMap id="dma_*">` | 1행 고정인가 |
| `<mxbinder>` | 컴포넌트 `ref="data:dma_x.COL"` | 양방향 여부(`readonly`) |
| `<mxlogicaltr>` + `trs.Post()` | `await $c.sbm.executeDynamic(sbmOptions)` (규칙 16) | 입력/출력 dataset 쌍 |
| `ds.DataID = url; ds.reset()` (동기 조회) | `await $c.sbm.executeDynamic` (GET) | 뒤 코드가 결과에 의존하는가 |
| `trs OnSuccess` + `OnSuccessAfter` 포인터 | `await` 직후 후처리 / 명시 함수 | 포인터를 바꾸는 곳 전부 |
| `trs OnFail` | 공통 오류 핸들러 또는 응답 `success:false` 처리 | 실패 메시지 코드 |
| `ds.CountRow` / `NameString(i,col)` (1-base) | `getRowCount()` / `getCellData(i,col)` (0-base) — 규칙 29 | 루프 경계 |
| `<mxgrid>` `<format><column>` | `<w2:gridView>` 헤더/본문 컬럼 | `{CurRow}` → 순번 표현 |
| `<image>` 버튼 | `<w2:anchor>`/`<xf:trigger>` 버튼 (퍼블리싱 기준) | 이미지 경로로 상태 표시하던 로직 |
| `<mxtextarea>` / `<panel>` innerHTML | `xf:textarea` / `w2:editor` / `w2:textbox` | 텍스트·HTML 모드 |
| `<checkbox>` `.checked` | `xf:select` (checkboxgroup) `ref` 값 `Y/N` | `onclick` → `onviewchange` |
| `<mxfilecontrol>` + `fileUrl:URL` 컬럼 | `w2:multiupload`(숨김) + `$c.util.onUploadClick` | 파일 본문 전송 경로 |
| `frame.Provider("../").fn_GetPar` | `$c.win.getParent()?.scwin.getPar` (규칙 21) | 부모가 언제 되돌리는가 |
| `frame.CreateDialogFrame(id, gfm, 제목, x, y, w, h, type)` | `await $c.win.openPopup(...)` (규칙 17, 타입별 수신 규약) | 모달 대기에 기댄 후속 코드 |
| `frame.CloseFrame()` | `$c.win.closePopup()` | |
| `alert` / `confirm` | `await $c.win.alert` / `await $c.win.confirm` | 메시지 코드 |
| `getMessageParam("MSG-…")` | `$c.{pcc}.getMessageParam` | |
| `js_market`, `js_dep_cd` 등 세션 전역 | `$c.session.getUserInfo("market" \| "depCd" …)` | |
| `cGetToday2()` 등 날짜 | `$c.date.getServerDateTime()` 등 | 서버/클라이언트 시각 |
| `fn_open_report_pdf` | `$c.print.openReportPdf` | |
| `#include("../js/*.js")` | 삭제(규칙 11) — 필요한 함수만 `$c.*` 로 대응 | 호출되는 함수만 추림 |
| `vScrenID` | 삭제(규칙 1) | |

---

## 6. 분석 함정 체크리스트

gfm 을 읽을 때 놓치기 쉬운 것들. 해당하면 md §4·§7·§9 중 맞는 곳에 반드시 적는다.

| # | 함정 | 왜 문제인가 | 적는 곳 |
|---|---|---|---|
| 1 | **동기 통신**(`syncload="True"`, `DataID+reset()`) | 전환본은 비동기 — `await` 를 빠뜨리면 다음 줄이 빈 데이터를 읽는다 | §4 "(동기)" |
| 2 | **모달 대기 전제** | Gauce 모달은 닫힐 때까지 멈추지만 `openPopup` 은 그렇지 않을 수 있다 — 부모가 함수 포인터를 되돌리는 시점이 달라진다 | §1 호출 규약, §9 |
| 3 | **함수 포인터 재대입**(`OnSuccessAfter = …`, `fn_getPar = …`) | 같은 `OnSuccess` 이벤트가 상황마다 다른 후처리를 한다 | §4, §8 |
| 4 | **1-base 행 인덱스** | `for (i=1; i<=CountRow; …)` 그대로 옮기면 첫 행 누락·끝 행 초과 | §8 |
| 5 | **느슨한 비교**(`==`, 숫자/문자 혼용) | 전환본 `===` 에서 분기가 바뀐다 → `String()` 정규화 근거 기록 | §8 |
| 6 | **미선언·오타 전역** | 원본은 암묵 전역으로 우연히 동작 | §7 |
| 7 | **주석 처리된 코드** | 근거로 쓰지 않는다(규칙 0) — 다만 "주석 처리돼 가드가 무효"인 사실은 §7 에 적는다 | §7 |
| 8 | **보이지 않는 컴포넌트**(폭 0, 항상 `display:none`, 텍스트 없는 라벨) | 진입점 없는 기능을 옮기는 낭비 | §2 "(옮기지 않음)", §7 |
| 9 | **겹친 컴포넌트**(같은 좌표의 textarea+panel) | 모드별로 하나만 보인다 → 전환본에서 통합 여부 판단 | §2, §4 모드 표 |
| 10 | **배열 길이·빈 문자열 분기**(`arr.length >= 5`) | 값이 아닌 길이로 판단하는 분기는 호출부마다 다르게 걸린다 | §1 호출 규약 |
| 11 | **URL 형 dataset 컬럼**(`fileUrl:URL`) | 파일 본문 전송 경로 — 전환본은 업로드 컴포넌트로 분리 | §3, §4 |
| 12 | **세션 정보 URL 첨부**(`fn_encodeNSession`) | 전환본은 서버 인증 세션 사용이 전제 — 방침 명시 | §5 |
| 13 | **원문 덮어쓰기·재채움**(전송 직전 dataset 1행 교체 등) | 순서를 바꾸면 사용자가 고친 내용이 사라진다 | §4, §7 |
| 14 | **연속 클릭·중복 전송** | 원본 동기 처리로 막히던 것이 비동기에서 열린다 | §7, §8 |
| 15 | **window.open 계열(인쇄 등) 앞의 조회** | `await` 뒤 열면 팝업 차단될 수 있다 | §9 |
| 16 | **같은 이름 함수의 다른 사본** | include JS 마다 같은 이름이 다르게 구현될 수 있다 — 실제 include 된 파일 기준으로 판단 | §8 |

---

## 7. 완료 기준

### 7.1 md 완료 체크리스트

- [ ] 헤더 표: 원본 경로·창 크기·반입 경로·캡처·업무공통 ns 가 채워졌다.
- [ ] §1: 팝업이면 호출 규약(시그니처 + 인수 표)이 있고, 호출 화면 수를 grep 으로 셌다.
- [ ] §2: `<components>` 의 **모든 id** 가 표 어딘가에 있거나 "(옮기지 않음)" 사유가 있다(라벨·장식 panel 제외 가능).
- [ ] §3: `<model>` 의 **모든 dataset** 이 표에 있고, 각 컬럼 목록과 출처가 있다.
- [ ] §4: `<events>` 의 **모든 `for`×`eventname`** 이 어떤 하위 절의 진입점으로 설명된다.
- [ ] §4: 모든 `MSG-` 코드와 하드코딩 문구가 등장 위치와 함께 적혔다.
- [ ] §5: 모든 `Action`/`DataID` 가 한 행씩 있고 method·queryId·입출력이 분해됐다.
- [ ] §6: 분기에 쓰인 하드코딩 코드 값이 빠짐없이 용도별로 모였다.
- [ ] §7: 각 결함에 "유지/고침/옮기지 않음" 결정이 적혔다.
- [ ] §8: 전환 후 — 원본 함수 전부가 TO-BE 이름 또는 "삭제(사유)"로 대응됐다.
- [ ] §9: 가정으로 둔 것(API 경로·응답 구조·하위 팝업 경로)이 전부 TODO 로 올라갔다.
- [ ] 문체: 한국어, id·함수·코드 값은 백틱, 원본 이름을 바꾸지 않고 인용했다.

```sh
# 누락 점검 — gfm 의 이벤트/함수/dataset 이 md 에 모두 언급됐는지
F=conversion/sample-front/as-is/{ID}.gfm; M=conversion/sample-front/ui/{ID}.md
for k in $(grep -o '<mxdataset id="[^"]*"' $F | cut -d'"' -f2) \
         $(grep -o 'function [A-Za-z_0-9]*' $F | cut -d' ' -f2) \
         $(grep -o '<event for="[^"]*"' $F | cut -d'"' -f2 | sort -u); do
  grep -q "$k" $M || echo "md 미언급: $k"
done
```

### 7.2 전환(5단계)으로 넘길 때

md §8 대로 `ui/{ID}.xml` 을 쓴 뒤 아래를 통과시킨다(샘플은 `convert.py` 고정점이 아니므로 수기 작성 + 게이트가 기준).

```sh
PYTHONUTF8=1 python conversion/tools/gate_screen.py --pcc {fil|stf|mgt|tms} conversion/sample-front/ui/{ID}.xml
PYTHONUTF8=1 python conversion/tools/publish_gate.py --rev HEAD conversion/sample-front/ui/{ID}.xml   # 퍼블리싱본 위에 전환했으면
python -m wsxml_lint conversion/sample-front/ui/{ID}.xml
```

- 전환본 head: `meta_screenId`·`meta_screenName`·`meta_desc`(끝에 `(원본 /…/{ID}.gfm, 업무 분석 {ID}.md)`)·`meta_author`·`meta_date`.
- 게이트가 보고하지만 의도한 것(예: 하위 팝업 호환을 위해 남긴 `fn_` 정의)은 md §8 에 사유를 적어 둔다.
- 새 샘플이면 [sample_templates.md](sample_templates.md) 샘플 목록·유형 매칭에 한 행 추가한다.

---

## 8. 복사용 빈 템플릿

````markdown
# {화면ID} {화면명} — 업무 분석 및 전환 내역

| 항목 | 내용 |
|---|---|
| 원본 | `/{경로}/{화면ID}.gfm` (Gauce/X-Internet, {W}×{H} {모달 창/메인 화면}) — 반입 `{반입 경로}` |
| 전환본 | `conversion/sample-front/ui/{화면ID}.xml` |
| 화면 캡처 | `{파일}.png`({상태}) |
| 업무공통 | `$c.{ns}`({함수}) — `cm/pcc/{ns}`. 게이트는 `--pcc {ns}` 로 돌린다 |

## 1. 업무 개요

{누가 어느 화면에서 무엇을 하려고 쓰는가.}

1. …
2. …

### 호출 화면 ({n}본)

### 호출 규약 (부모 → 팝업)

```
{시그니처}
```

| arr | 의미 | 비고 |
|---|---|---|

## 2. 화면 구성

| 영역 | 원본 컴포넌트 | 전환본 | 설명 |
|---|---|---|---|

## 3. 데이터셋

| 원본 | 전환본 | 내용 |
|---|---|---|

## 4. 처리 흐름

### 4.1 로딩 (`gform onload` → `scwin.init`)

1. …

### 4.2 {동작} (`fn_xxx` → `scwin.xxx`)

## 5. 서버 통신

| 용도 | AS-IS | 입력 | 출력 | 전환본 (TODO: API 확정) |
|---|---|---|---|---|

## 6. 업무 코드 · 상수 목록

### 6.1 {용도}

## 7. 원본 특이사항·결함

| # | 내용 | 전환본 처리 |
|---|---|---|

## 8. 전환 내역 (AS-IS → TO-BE)

| AS-IS | TO-BE |
|---|---|
| `gform onload` | `scwin.onpageload` → `scwin.init` |

## 9. 남은 작업 (TODO)

1. **서버 API 확정** — …
````
