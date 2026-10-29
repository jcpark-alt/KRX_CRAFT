# ULDSTF05103 (팝업)주권 종류주식 상장심사관리 — 업무 분석 및 전환 내역

| 항목 | 내용 |
|---|---|
| AS-IS 원본 | `ULDSTF05103.xml` — W-Craft 1차 변환본(`meta_asisFileNm="ULDSTF05103.gfm"`, 원본 gfm 은 저장소에 없음)에 **API 적용까지 마친 개발 사본**(작성 배성우, 2026-08-18). 업무 로직은 이 스크립트와 남은 옛 코드 주석으로 분석했다 — 반입 `conversion/conversion-front/ui/ULDSTF05103/ULDSTF05103.xml` (kindstk 묶음, 부모 05102 가 1280×935 로 연다) |
| 신규 API 명세 | 없음 — **화면에 적용된 `/api/...` 경로·method·dataCollection keyInfo 를 명세로 간주**(사용자 결정 2026-10-29). §5 는 "화면 적용 API ↔ AS-IS(주석에 남은 옛 호출)" 대응표로 쓴다. `api_spec_check` 는 SKIP |
| TO-BE | `conversion/conversion-front/ui-tobe/ULDSTF05103.xml` (배포 경로 `/ui/lst/kindstk/ULDSTF05103.xml` — 부모 05102 의 원본 리터럴) |
| 퍼블리싱 | 화면 폴더 `ULDSTF05103.xml` 의 body(이미 퍼블리싱 반영)를 1단계 기준으로 정비했다(선례 ULDBNS30400 「캡처 없음, 기존 마크업 정비」). `conversion/publish/상장/상장처리(대내)/ULDSTF05103.xml` 은 참고만 했고 라벨은 같다(publish 원본에만 있던 「결산기」 라벨은 스크립트가 `label_40` 문구를 바꿔 대신한다 — §6.3) |
| 화면 캡처 | 없음 |
| 업무공통 | `$c.stf`(`getMessageParam`·`getNewBzProcNo`)·`$c.lc`(`isProcess`·`getGlbValue`·`getSecuGrpNm`) — `cm/pcc/stf`. 게이트는 `--pcc stf` 로 돌린다 |
| 공통 계약 | kindstk 13본 공통 계약서(부모·팝업 data/반환 키, 경로, 미정의 호출 대체) — 05102 → 05103, 05103 → 05112·05105·05113·92024 계약을 그대로 따른다 |
| 작성 | Inswave / 2026-10-29 |

참고 양식: [websquare_gfm_conversion.md](../../../md/websquare_gfm_conversion.md) — 특히 §1.4 업무 프로세스 흐름, §6.5 getPar/setPar 전환. Gauce 대응은 [gfm_business_analysis_guide.md](../../../md/gfm_business_analysis_guide.md) §5·§6 을 함께 따랐다. 짝 화면은 ULDSTF05104(외국주권·주식예탁증권) — 구조가 같아 함수 이름과 절 번호를 맞췄다. 선례: ULDSTF05232(92024 호환 `getPar`)·ULDSTF05806(응답 판정 `checkResult`).

---

## 1. 화면 개요

상장심사 담당자가 **종류주식 상장심사 화면(ULDSTF05102)** 에서 주권(증권그룹 ST) 종류주식의 **신규상장 회사정보**를 등록하고, 그 회사의 **종류주식 종목**(상장종목현황)을 등록·조회하며 공시안내문을 작성하는 팝업이다. 회사 법인정보는 보통주 상장심사 때 등록된 값을 읽어 보여 주기만 하고(전부 읽기 전용), 이 화면에서 직접 고치는 값은 **상장일**과 **상장번호(생성)** 뿐이다.

1. 부모가 선택 행의 업무처리번호·회사코드·회사명·상장일과 신규 증권그룹을 넘겨 연다. 업무처리번호가 있으면 기존 건, 없으면 신규다.
2. 신규: [회사코드 찾기]로 신규상장 법인 선택 팝업(ULDSTF05112)을 열어 회사를 고르면 법인정보와 상장종목현황을 받는다.
3. 상장일을 넣고 [저장]하면 확인 → 업무처리번호 채번 → 등록 후, 그 번호로 다시 조회한다. 저장 뒤에야 [상장종목신규]·[안내문작성]이 켜진다.
4. 기존 건은 법인정보·상장종목현황을 조회하고, 회사 찾기와 저장을 잠근다(상장일 전에도 저장 버튼뿐이라 수정 불가). 보통주 상장심사·금감원코드가 없거나 심사 부서가 아니면 처리 불가 상태가 된다.
5. [상장번호생성]은 사용자 시장의 새 상장번호를 받아 채운다(이미 있으면 잠김).
6. [상장종목신규]·상장종목현황 더블클릭은 종목 등록 팝업 — 유가 사용자는 보호예수 포함(ULDSTF05105), 그 밖은 비포함(ULDSTF05113) — 을 열고, 닫히면 다시 조회한다.
7. [안내문작성]은 상장종목이 있을 때 공시안내문작성(ULDSTF92024)을 연다.

### 1.1 호출 화면 (1본)

- `ULDSTF05102` 종류주식 상장심사(메뉴 본화면, 같은 kindstk 묶음) — `fn_OpenDetail` 이 증권그룹 ST 면 이 화면을, DR·FS 면 ULDSTF05104 를 연다(05102:283-328). 크기 1280×935, `frameModal:"top"`.
  - [신규] → 업무처리번호 `""` 와 신규 증권그룹(`sbx_newSecugrpId`).
  - 목록 더블클릭 → 선택 행의 업무처리번호·회사코드·회사명·상장일.
  - 원본 팝업은 저장 뒤 `$c.win.getParent().scwin.fn_list_sync()` 로 부모 목록을 다시 조회했고(`fn_parentRefresh`), 부모 그리드 행 포커스를 직접 옮겼다.

### 1.2 호출 규약 (부모 → 이 화면) / 반환 규약

개발 사본은 이미 `$c.data.getParameter()` 로 받지만 키가 `clickBzProcsNo`·`rowPos` 였다. 공통 계약대로 정리한다.

| TO-BE 키 | 의미 (부모 05102 값) | AS-IS | 빈 값일 때 / 분기 |
|---|---|---|---|
| `bzProcsNo` | 회사 업무처리번호 — 신규 `""`, 기존은 선택 행 | `clickBzProcsNo`(개명) | **비면 신규**, 있으면 기존 건 조회 |
| `isurCd` | 선택 행 회사코드 | 같음 | 기존 건 조회 조건(회사코드) |
| `comNm` | 선택 행 회사명 | 같음 | 조회 전 검색 칸 표시 |
| `listDd` | 선택 행 상장일 | 같음 | 기존 건 조회 조건(상장일) |
| `newSecugrpId` | 부모의 신규 증권그룹 콤보 값 | 같음 | 신규 건 증권그룹, 회사 조회 응답에 증권그룹이 없을 때 보충 |
| (넘기지 않음) | — | `rowPos`(부모가 행 객체를 넘기고 이 화면이 행 번호로 씀) | 결함 — 행 포커스 복원은 부모가 한다(§8 #3) |

- **반환**: 이 화면에는 스스로 닫는 경로가 없다(하단 [닫기] 금지 규칙, 원본의 삭제 후 닫기 분기는 도달 불가 — §8 #4). X·ESC 로 닫히면 `{ isCloseButtonClick : true }` 가 가므로 부모는 공통 계약대로 **다시 조회하고 기억한 행으로 돌아간다**.

```javascript
// 부모 ULDSTF05102 (공통 계약)
const res = await $c.win.openPopup("/ui/lst/kindstk/ULDSTF05103.xml",
    { id : "ULDSTF05103", popupName : …, width : 1280, height : 935, frameModal : "top" },
    { bzProcsNo, newSecugrpId, isurCd, comNm, listDd });
if (res?.isSaved === true || res?.isCloseButtonClick === true) { /* 목록 재조회 + 행 복원 */ }
```

### 1.3 이 화면이 여는 하위 팝업

| 팝업 | AS-IS 호출 | 넘기는 `data` (TO-BE) | 받는 결과 / 취소 판정 |
|---|---|---|---|
| `ULDSTF05112` 신규상장 법인 선택 (880×700) | `fn_PopFindKindStkExamCorp` — 개발 사본이 이미 openPopup data 로 열었으나 결과를 대문자 `res.ISUR_CD`·`res.COM_NM` 으로 읽음. 옛 방식은 `fn_GetParIsur`/`fn_SetParIsur` | `{ isurCd, isurNm, secugrpId, mktTpCd, searchType : getGlbValue("SEARCH_TYP_SLC") }` — §6.9 | `{ isurCd, comNm, listDd, prelmInvstgBzProcsNo, dbClickYn }` — `isCloseButtonClick` 이거나 `isurCd` 가 비면 취소 |
| `ULDSTF05105` 종류주식 신규상장 종목등록(보호예수 포함) (1180×880) | `fn_OpenKindStkDetailCorpIsu_protect` — data `{}`, 팝업이 이 화면의 `scwin.vBzProcsNo`·`clickBzProcsNo`·컴포넌트를 직접 읽음 | `getIsuPopupData(row)` 11키 — §6.10 | `{ isSaved }` / X 닫기 `{ isCloseButtonClick }` → 다시 조회 + 행 복원 |
| `ULDSTF05113` 종류주식 신규상장 종목등록(보호예수 비포함) (1350×900) | `fn_OpenKindStkDetailCorpIsu` — 위와 같음 | 위와 같음 | 위와 같음 |
| `ULDSTF92024` 종류주식 공시안내문작성 (735×815, pageFramePopup) | `fn_dscl` — 개발 사본은 `alert("공시안내문"); return;` 으로 막혀 있음. 옛 방식은 임시 `fn_GetPar` + `CreateDialogFrame("…/ULDSTF92024.gfm", …, "window")` | `getDsclData()` + **호환용 `scwin.getPar`** — §6.11 | 반환 없음(닫힐 때까지 `await`, 원본도 재조회 안 함) |

### 1.4 업무 프로세스 흐름

| # | 업무 | 시작 (사용자 동작·진입 조건) | 끝 (결과) | 주요 함수 | 관련 절 |
|---|---|---|---|---|---|
| 1 | 로딩·기존 건 조회 | 팝업 열림 | 기존 건: 법인정보·상장종목현황 표시, 버튼 상태 / 신규: 입력 대기 | `init` → `selectCode`·`selectMaintradeBank` → `readSync` → `selectDetail` → `applyCorpState` | §3, §5.1~5.4, §6.4 |
| 2 | 신규 회사 선택 | [회사코드 찾기] | 고른 회사의 법인정보·상장종목현황 | `btn_coSearch_onclick` → `openCorpPopup` → `selectCorpInfo` → `readSync` | §5.3·5.4, §6.9 |
| 3 | 회사정보 저장 | [저장] | 등록 성공 → 새 업무처리번호로 재조회, [상장종목신규] 활성 | `save` → `validate` → `$c.lc.isProcess` → `getNewBzProcsNo` → `saveTrs` → `readSync` | §5.6, §6.7·6.8 |
| 4 | 상장번호 생성 | [상장번호생성] | 상장번호 채움 | `selectNewListNo` | §5.5 |
| 5 | 종목 등록 | [상장종목신규] / 상장종목현황 더블클릭 | 팝업이 닫히면 재조회·행 복원 | `openIsuPopup` → `getIsuPopupData` | §6.6, §6.10 |
| 6 | 공시안내문작성 | [안내문작성] | 92024 팝업 | `writeDscl` → `checkBiz` → `getDsclData`(+ `getPar`) | §6.11 |

#### 화면 간 흐름

```mermaid
flowchart LR
    P["ULDSTF05102<br/>종류주식 상장심사"] -- "신규 / 목록 더블클릭<br/>data: bzProcsNo · isurCd · comNm · listDd · newSecugrpId" --> M["ULDSTF05103<br/>주권 종류주식 상장심사관리"]
    M -- "X 닫기 → 부모 재조회·행 복원" --> P
    M -- "회사코드 찾기<br/>data: isurCd · isurNm · secugrpId · mktTpCd · searchType" --> C[["ULDSTF05112<br/>신규상장 법인 선택"]]
    C -- "isurCd · comNm · listDd · prelmInvstgBzProcsNo" --> M
    M -- "상장종목신규 / 더블클릭 (유가 사용자)<br/>data: getIsuPopupData" --> R5[["ULDSTF05105<br/>종목등록(보호예수 포함)"]]
    M -- "상장종목신규 / 더블클릭 (그 밖)" --> R13[["ULDSTF05113<br/>종목등록(보호예수 비포함)"]]
    R5 -- "isSaved / X → 재조회·행 복원" --> M
    R13 -- "isSaved / X → 재조회·행 복원" --> M
    M -- "안내문작성<br/>data + 호환 getPar" --> D[["ULDSTF92024<br/>공시안내문작성"]]
```

#### 업무 1: 로딩·기존 건 조회

```mermaid
flowchart TD
    S(["팝업 열림"]) --> V["사용자 시장별 화면<br/>applyMktView"]
    V --> C[/"공통 코드 6종 §5.1 · 주거래은행 §5.2"/]
    C --> P["파라미터 수신 · 달력 바인딩 · 버튼(setIsuNewButton)"]
    P --> B{"업무처리번호?"}
    B -- "없음(신규)" --> N["SPAC 패널 숨김 · 증권그룹=newSecugrpId · 시장=사용자 시장 · 저장 활성"] --> E1(["끝: 입력 대기"])
    B -- "있음" --> R[/"select-one §5.4<br/>isuDetail + corpInfo"/]
    R --> F{"성공?"}
    F -- "아니오" --> E2(["끝: 공통 오류 안내"])
    F -- "예" --> ST["applyCorpState §6.4"]
    ST --> SP["SPAC 이면 존립기간 표시"] --> E3(["끝: 조회 상태"])
```

| # | 단계 | 주체 | 내용 | 분기 · 메시지 | 관련 절 |
|---|---|---|---|---|---|
| 1 | 시장별 화면 | 화면 | 세션 market 1 → 영문회사심볼(KSE) / 2 → 소속부·기업구분(KOSDAQ). 지주회사코드 칸 숨김 | 그 밖 시장: 신규 시장구분 "A" | §6.2 |
| 2 | 코드 목록 | 서버 | 공통 코드 6종·주거래은행 — 콤보가 조회 값을 표시하도록 먼저 await | 실패는 공통 안내 | §5.1·5.2 |
| 3 | 파라미터 | 화면 | `bzProcsNo`·`isurCd`·`comNm`·`listDd`·`newSecugrpId` | 비면 신규 | §1.2 |
| 4 | 기존 건 조회 | 서버 | 회사코드·상장일·업무처리번호로 select-one → 상장종목현황·법인정보 | — | §5.4 |
| 5 | 상태 | 화면 | 회사 찾기 잠금, 상장일 기준 저장 잠금, 보통주·금감원코드·부서 검사 | "보통주 상장심사가 선행되어야 합니다", MSG-0025 | §6.4 |

#### 업무 2: 신규 회사 선택

```mermaid
flowchart TD
    S(["회사코드 찾기 클릭"]) --> G{"증권그룹 있음?"}
    G -- "아니오" --> A1["'[유가증권]을 선택하세요.'"] --> E1(["끝"])
    G -- "예" --> O[["await openPopup ULDSTF05112"]]
    O --> X{"취소·닫기 또는 isurCd 빈 값?"}
    X -- "예" --> E2(["끝: 변화 없음"])
    X -- "아니오" --> K["검색 칸에 회사코드·명"]
    K --> Q[/"select-corpinfo-byisurcd §5.3"/]
    Q --> Y{"성공?"}
    Y -- "아니오" --> E3(["끝: 공통 오류 안내"])
    Y -- "예" --> ST["applyCorpState §6.4<br/>(신규: 저장·회사찾기 가능)"]
    ST --> L[/"select-one §5.4 (종목만)"/] --> E4(["끝: 법인정보·상장종목현황"])
```

| # | 단계 | 주체 | 내용 | 분기 · 메시지 | 관련 절 |
|---|---|---|---|---|---|
| 1 | 검사 | 화면 | 증권그룹이 비면 안내 | "[유가증권]을 선택하세요." | §4 |
| 2 | 팝업 | 화면 | 05112 를 data 로 열고 await | 취소 판정 `isCloseButtonClick`·`isurCd` | §6.9 |
| 3 | 법인정보 | 서버 | 회사코드로 법인정보(dma_corpInfoRes 전체) | 응답에 증권그룹이 없으면 부모 신규 증권그룹으로 보충 | §5.3, §6.4 |
| 4 | 상장종목 | 서버 | 업무처리번호 없이 select-one — 상장종목현황만 받는다(법인정보는 덮지 않음) | — | §5.4 |

#### 업무 3: 회사정보 저장

```mermaid
flowchart TD
    S(["저장 클릭"]) --> V{"상장일·회사코드 입력?"}
    V -- "아니오" --> A1["MSG-A005 '[^] 을(를) 입력하셔야 합니다.'"] --> E1(["끝"])
    V -- "예" --> C{"isProcess('I') 확인?"}
    C -- "취소" --> E2(["끝"])
    C -- "확인" --> N[/"채번 $c.stf.getNewBzProcNo"/]
    N --> L{"14자리?"}
    L -- "아니오" --> A2["MSG-0010 '업무처리번호생성실패'"] --> E3(["끝"])
    L -- "예" --> R[/"register §5.6"/]
    R --> OK{"success · completeYn?"}
    OK -- "아니오" --> A3["MSG-A002 '[저장] 처리 실패하였습니다.'"] --> E4(["끝"])
    OK -- "예" --> U["업무처리번호 반영 · MSG-A001 · 상장종목신규/안내문작성 활성"]
    U --> RS[/"select-one §5.4 (법인정보 포함)"/] --> E5(["끝: 기존 건 상태"])
```

| # | 단계 | 주체 | 내용 | 분기 · 메시지 | 관련 절 |
|---|---|---|---|---|---|
| 1 | 필수 입력 | 화면 | 상장일·회사코드 — 원본은 채번 뒤에 검사했으나 채번 전으로 옮김 | MSG-A005 | §6.7 |
| 2 | 확인 | 화면 | `$c.lc.isProcess("I")` "[저장] 처리를 하시겠습니까?" | 취소 시 끝 | §6.8 |
| 3 | 채번 | 서버 | 14자리가 아니면 중단 | MSG-0010 | §6.8 |
| 4 | 등록 | 서버 | dma_registerReq 6키 POST | MSG-A002 | §5.6 |
| 5 | 후처리 | 화면 | 성공 뒤에만 `scwin.vBzProcsNo` 반영, MSG-A001, 버튼, 재조회 | 기존 건 상태가 되어 저장 잠김 | §6.8 |

#### 업무 4: 상장번호 생성

```mermaid
flowchart TD
    S(["상장번호생성 클릭"]) --> Q[/"select-new-listno §5.5<br/>spotIsuTrdMktTpCd = 사용자 시장"/]
    Q --> Y{"성공?"}
    Y -- "아니오" --> E1(["끝: 공통 오류 안내"])
    Y -- "예" --> F["dma_corpInfoRes.listNo = 응답 listNo"] --> E2(["끝"])
```

| # | 단계 | 주체 | 내용 | 분기 · 메시지 | 관련 절 |
|---|---|---|---|---|---|
| 1 | 생성 | 서버 | 사용자 시장(세션 market)으로 새 상장번호 | 상장번호가 있으면 버튼이 잠겨 있다(§6.4) | §5.5 |
| 2 | 반영 | 화면 | 상장번호 칸에 채움 — 등록 요청에는 상장번호 키가 없다 | §10 #3 | §5.5 |

#### 업무 5: 종목 등록

```mermaid
flowchart TD
    S(["상장종목신규 / 더블클릭"]) --> P{"보호예수 포함? isProtectReg"}
    P -- "예 (유가 사용자 · ST/DR/FS)" --> O5[["await openPopup ULDSTF05105"]]
    P -- "아니오" --> O13[["await openPopup ULDSTF05113"]]
    O5 --> R{"isSaved 또는 X 닫기?"}
    O13 --> R
    R -- "아니오" --> E1(["끝"])
    R -- "예" --> Q[/"select-one §5.4"/] --> F["보던 행으로 포커스"] --> E2(["끝"])
```

| # | 단계 | 주체 | 내용 | 분기 · 메시지 | 관련 절 |
|---|---|---|---|---|---|
| 1 | 화면 선택 | 화면 | [상장종목신규]는 유가(1)·전체(9), 더블클릭은 유가(1) 사용자만 보호예수 포함(원본 그대로) | §8 #7 | §6.6 |
| 2 | 팝업 | 화면 | 선택 행(신규 -1)의 종목 업무처리번호와 회사·법인 값 11키 | — | §6.10 |
| 3 | 재조회 | 서버 | 저장했거나 X 로 닫혔으면 재조회, 행 번호가 남아 있으면 포커스 | — | §6.10 |

#### 업무 6: 공시안내문작성

```mermaid
flowchart TD
    S(["안내문작성 클릭"]) --> B{"상장종목 있음?"}
    B -- "아니오" --> A1["'[상장종목]을 입력하세요.'"] --> E1(["끝"])
    B -- "예" --> D["getDsclData — 서식(시장별)·업무처리번호 목록·회사·시장·제목(유가)·종목·마스터"]
    D --> O[["await openPopup ULDSTF92024<br/>(92024 가 부모 getPar 호출)"]] --> E2(["끝"])
```

| # | 단계 | 주체 | 내용 | 분기 · 메시지 | 관련 절 |
|---|---|---|---|---|---|
| 1 | 확인 | 화면 | 상장종목이 0건이면 중단 | "[상장종목]을 입력하세요." | §6.11 |
| 2 | 팝업 | 화면 | data + 호환 `scwin.getPar`(arr 길이: 유가 6, 코스닥 4) | — | §6.11 |

#### 화면 모드 상태 전이

```mermaid
stateDiagram-v2
    [*] --> 신규: bzProcsNo 없음
    [*] --> 기존: bzProcsNo 있음
    신규 --> 신규: 회사 선택(05112) — 저장 가능
    신규 --> 기존: 저장 성공(새 업무처리번호)
    기존 --> 처리불가: 상장일 지남 · 보통주 없음 · 금감원코드 없음 · 심사 부서 아님
    기존 --> 기존: 종목 등록 팝업 닫힘 → 재조회
```

- **신규**: 저장 활성, 회사 찾기 가능, [상장종목신규]·[안내문작성] 잠금.
- **기존**(상장일 전): 저장 잠금(`update` 상태 — 원본 `buttonSet.setUpdateStatus`, 저장 버튼뿐), 회사 찾기 잠금, [상장종목신규]·[안내문작성] 활성.
- **처리불가**: 저장 잠금(`error`).

## 2. 화면 구성 및 데이터 정의

### 2.1 화면 구성

영역 순서는 원본과 같다 — 회사코드(명)·유가증권 검색 줄(`panel_Top`) → 필수 표시 안내 → 법인정보 4단 표(`panel_Item`, 안쪽에 유가 전용 `panel_KSE`·코스닥 전용 `panel_KOSDAQ`·`panel_KOSDAQ1`·SPAC 존립기간 `panel_spac`) → 「상장종목현황」 제목·저장 안내 문구·[상장종목신규] → 상장종목현황 그리드 → 하단 [안내문작성]·[저장](규칙 41: 주요 버튼 `btn_cm pt` 오른쪽). 팝업이라 contentHeader 를 두고 하단 [닫기]는 없다.

1단계 마크업 정비(퍼블리싱 게이트 통과): W-Craft 잔여 속성(`userData2`·이미지 `src`·`cursor`·`hierarchy`·`orgid`·`item`)과 `xf:events` 블록·`bnd_Isu.undefined` 바인딩 삭제, 그리드 머리글 id 를 `h_` + 열 id 로, 그리드 `readOnly`·`focusMode="row"`, 기본 캡션(`caption1` "this is a grid caption.") 삭제, contentHeader pageFrame 정리. 그리드 내부 id(`header1`·`gBody1`)와 표 구조 태그(`tagname` `table`·`colgroup`·`tr`·`th`·`td`, 제목 `h3`)는 그대로 둔다. 2단계에서 `ref`·`ev:on*`·itemset 을 얹었다.

| AS-IS 요소 | 라벨 | TO-BE 컴포넌트 (바인딩 · 이벤트) |
|---|---|---|
| `pfmContentHeader` 공통 머리 | - | `pfmContentHeader` |
| `panel_Top` 영역 | - | `panel_Top` |
| `label_2_top` 라벨 | 회사코드(명) | `label_2_top` |
| `ibx_searchCd` 입력 | - | `ibx_searchCd` |
| `ibx_searchNm` 입력 | - | `ibx_searchNm` |
| `btn_coSearch` 버튼 | - | `btn_coSearch` · `scwin.btn_coSearch_onclick` |
| `label_15` 라벨 | 유가증권 | `label_15` |
| `sbx_secugrpId` 콤보 | - | `sbx_secugrpId` (`dma_corpInfoRes.secugrpId`) |
| `label_45` 라벨 | - 항목 앞에 * 표시는 필수 항목 입니다. | `label_45` |
| `panel_Item` 영역 | - | `panel_Item` |
| `label_7` 라벨 | 회사코드 | `label_7` |
| `ibx_isurCd` 입력 (`dma_corpInfoRes.isurCd`) | - | `ibx_isurCd` (`dma_corpInfoRes.isurCd`) |
| `label_47` 라벨 | 금감원코드 | `label_47` |
| `ibx_fssUnqNo` 입력 (`dma_corpInfoRes.fssUnqNo`) | - | `ibx_fssUnqNo` (`dma_corpInfoRes.fssUnqNo`) |
| `label_8` 라벨 | 한글회사명 | `label_8` |
| `ibx_comNm` 입력 (`dma_corpInfoRes.comNm`) | - | `ibx_comNm` (`dma_corpInfoRes.comNm`) |
| `label_2` 라벨 | 영문회사명 | `label_2` |
| `ibx_comEngNm` 입력 (`dma_corpInfoRes.comEngNm`) | - | `ibx_comEngNm` (`dma_corpInfoRes.comEngNm`) |
| `label_9` 라벨 | 한글회사약명 | `label_9` |
| `ibx_comAbbrv` 입력 (`dma_corpInfoRes.comAbbrv`) | - | `ibx_comAbbrv` (`dma_corpInfoRes.comAbbrv`) |
| `label_10` 라벨 | 영문회사약명 | `label_10` |
| `ibx_comEngAbbrv` 입력 (`dma_corpInfoRes.comEngAbbrv`) | - | `ibx_comEngAbbrv` (`dma_corpInfoRes.comEngAbbrv`) |
| `panel_KSE` 영역 | - | `panel_KSE` |
| `label_54` 라벨 | 영문회사심볼 | `label_54` |
| `ibx_isurSymbl` 입력 (`dma_corpInfoRes.isurSymbl`) | - | `ibx_isurSymbl` (`dma_corpInfoRes.isurSymbl`) |
| `label_34` 라벨 | 대표이사 | `label_34` |
| `ibx_ceoNm` 입력 (`dma_corpInfoRes.ceoNm`) | - | `ibx_ceoNm` (`dma_corpInfoRes.ceoNm`) |
| `label_44` 라벨 | 상장번호 | `label_44` |
| `ibx_listNo` 입력 (`dma_corpInfoRes.listNo`) | - | `ibx_listNo` (`dma_corpInfoRes.listNo`) |
| `btn_listNo` 버튼 | 상장번호생성 | `btn_listNo` · `scwin.btn_listNo_onclick` |
| `label_33` 라벨 | 회사등록번호 | `label_33` |
| `ibx_corpRegNo` 입력 (`dma_corpInfoRes.corpRegNo`) | - | `ibx_corpRegNo` (`dma_corpInfoRes.corpRegNo`) |
| `label_42` 라벨 | *사업자등록번호 | `label_42` |
| `ibx_bzRegNo` 입력 (`dma_corpInfoRes.bzRegNo`) | - | `ibx_bzRegNo` (`dma_corpInfoRes.bzRegNo`) |
| `label_22` 라벨 | 상장구분 | `label_22` |
| `sbx_listClssCd` 콤보 (`dma_corpInfoRes.listClssCd`) | - | `sbx_listClssCd` (`dma_corpInfoRes.listClssCd`) |
| `label_11` 라벨 | 설립일 | `label_11` |
| `cal_foundDd` 달력 (`dma_corpInfoRes.foundDd`) | - | `cal_foundDd` (`dma_corpInfoRes.foundDd`) |
| `label_49` 라벨 | *상장승인일 | `label_49` |
| `cal_stkcertListApprovDd` 달력 (`dma_corpInfoRes.stkcertListApprovDd`) | - | `cal_stkcertListApprovDd` (`dma_corpInfoRes.stkcertListApprovDd`) |
| `label_37` 라벨 | 지주회사 소속 자회사여부 | `label_37` |
| `sbx_subcomYn` 콤보 (`dma_corpInfoRes.subcomYn`) | - | `sbx_subcomYn` (`dma_corpInfoRes.subcomYn`) |
| `label_38` 라벨 | 지주회사명 | `label_38` |
| `ibx_hdcomIsurNm` 입력 (`dma_corpInfoRes.hdcomIsurNm`) | - | `ibx_hdcomIsurNm` (`dma_corpInfoRes.hdcomIsurNm`) |
| `label_48` 라벨 | 시장구분 | `label_48` |
| `sbx_spotIsuTrdMktTpCd` 콤보 (`dma_corpInfoRes.spotIsuTrdMktTpCd`) | - | `sbx_spotIsuTrdMktTpCd` (`dma_corpInfoRes.spotIsuTrdMktTpCd`) |
| `label_12` 라벨 | 이전시장 | `label_12` |
| `sbx_oldSpotIsuTrdMktTpCd` 콤보 (`dma_corpInfoRes.oldSpotIsuTrdMktTpCd`) | - | `sbx_oldSpotIsuTrdMktTpCd` (`dma_corpInfoRes.oldSpotIsuTrdMktTpCd`) |
| `label_4` 라벨 | 명의개서대행기관 | `label_4` |
| `sbx_transstkAgntCd` 콤보 (`dma_corpInfoRes.transstkAgntCd`) | - | `sbx_transstkAgntCd` (`dma_corpInfoRes.transstkAgntCd`) |
| `panel_HDCOM_ISUR_CD` 영역 | - | `panel_HDCOM_ISUR_CD` |
| `ibx_hdcomIsurCd` 입력 (`dma_corpInfoRes.hdcomIsurCd`) | - | `ibx_hdcomIsurCd` (`dma_corpInfoRes.hdcomIsurCd`) |
| `label_46` 라벨 | 상장일 | `label_46` |
| `cal_listDd` 달력 (`dma_corpInfoRes.listDd`) | - | `cal_listDd` (`dma_corpInfoRes.listDd`) |
| `label_14` 라벨 | 이전상장일 | `label_14` |
| `cal_oldListDd` 달력 (`dma_corpInfoRes.oldListDd`) | - | `cal_oldListDd` (`dma_corpInfoRes.oldListDd`) |
| `label_27` 라벨 | 외부감사인 | `label_27` |
| `sbx_extAudtrCd` 콤보 (`dma_corpInfoRes.extAudtrCd`) | - | `sbx_extAudtrCd` (`dma_corpInfoRes.extAudtrCd`) |
| `label_16` 라벨 | 이전상장폐지일 | `label_16` |
| `cal_oldDelistDd` 달력 (`dma_corpInfoRes.oldDelistDd`) | - | `cal_oldDelistDd` (`dma_corpInfoRes.oldDelistDd`) |
| `label_36` 라벨 | 회사전화번호 | `label_36` |
| `ibx_corpTelNo` 입력 (`dma_corpInfoRes.corpTelNo`) | - | `ibx_corpTelNo` (`dma_corpInfoRes.corpTelNo`) |
| `label_35` 라벨 | 회사팩스번호 | `label_35` |
| `ibx_headqtrFaxNo` 입력 (`dma_corpInfoRes.headqtrFaxNo`) | - | `ibx_headqtrFaxNo` (`dma_corpInfoRes.headqtrFaxNo`) |
| `label_51` 라벨 | 업종 | `label_51` |
| `ibx_stdIndCd` 입력 (`dma_corpInfoRes.stdIndCd`) | - | `ibx_stdIndCd` (`dma_corpInfoRes.stdIndCd`) |
| `ibx_stdIndNm` 입력 (`dma_corpInfoRes.stdIndNm`) | - | `ibx_stdIndNm` (`dma_corpInfoRes.stdIndNm`) |
| `label_3` 라벨 | 홈페이지 | `label_3` |
| `ibx_hpage` 입력 (`dma_corpInfoRes.hpage`) | - | `ibx_hpage` (`dma_corpInfoRes.hpage`) |
| `label_1` 라벨 | 우편번호 | `label_1` |
| `ibx_zipcd` 입력 (`dma_corpInfoRes.zipcd`) | - | `ibx_zipcd` (`dma_corpInfoRes.zipcd`) |
| `ibx_addr` 입력 (`dma_corpInfoRes.addr`) | - | `ibx_addr` (`dma_corpInfoRes.addr`) |
| `label_26` 라벨 | 주요제품 | `label_26` |
| `ibx_majProdNm` 입력 (`dma_corpInfoRes.majProdNm`) | - | `ibx_majProdNm` (`dma_corpInfoRes.majProdNm`) |
| `label_56` 라벨 | 나머지 주소 | `label_56` |
| `ibx_dtlAddr` 입력 (`dma_corpInfoRes.dtlAddr`) | - | `ibx_dtlAddr` (`dma_corpInfoRes.dtlAddr`) |
| `label_40` 라벨 | 결산월 | `label_40` |
| `ibx_acntclsMm1` 입력 (`dma_corpInfoRes.acntclsMmdd1`) | - | `ibx_acntclsMm1` (`dma_corpInfoRes.acntclsMmdd1`) |
| `panel_KOSDAQ` 영역 | - | `panel_KOSDAQ` |
| `label_24` 라벨 | 소속부 | `label_24` |
| `sbx_sectTpCd` 콤보 (`dma_corpInfoRes.sectTpCd`) | - | `sbx_sectTpCd` (`dma_corpInfoRes.sectTpCd`) |
| `label_23` 라벨 | *SPAC여부 | `label_23` |
| `sbx_spacYn` 콤보 (`dma_corpInfoRes.spacYn`) | - | `sbx_spacYn` (`dma_corpInfoRes.spacYn`) |
| `label_25` 라벨 | 주거래은행 | `label_25` |
| `sbx_maintrBkCd` 콤보 (`dma_corpInfoRes.maintrBkCd`) | - | `sbx_maintrBkCd` (`dma_corpInfoRes.maintrBkCd`) |
| `label_5` 라벨 | 직상장법인여부 | `label_5` |
| `sbx_dirctlistCorpYn` 콤보 (`dma_corpInfoRes.dirctlistCorpYn`) | - | `sbx_dirctlistCorpYn` (`dma_corpInfoRes.dirctlistCorpYn`) |
| `panel_spac` 영역 | - | `panel_spac` |
| `label_28` 라벨 | 존립기간 | `label_28` |
| `cal_exstStrtDd` 달력 (`dma_corpInfoRes.exstStrtDd`) | - | `cal_exstStrtDd` (`dma_corpInfoRes.exstStrtDd`) |
| `label_30` 라벨 | ~ | `label_30` |
| `cal_exstEndDd` 달력 (`dma_corpInfoRes.exstEndDd`) | - | `cal_exstEndDd` (`dma_corpInfoRes.exstEndDd`) |
| `label_29` 라벨 | 존립기간비고 | `label_29` |
| `txa_exstDeadlineRemk` 여러 줄 입력 (`dma_corpInfoRes.exstDeadlineRemk`) | - | `txa_exstDeadlineRemk` (`dma_corpInfoRes.exstDeadlineRemk`) |
| `label_31` 라벨 | 비고 | `label_31` |
| `label_13` 라벨 | 주거래은행지점명 | `label_13` |
| `ibx_maintrBkBrnNm` 입력 (`dma_corpInfoRes.maintrBkBrnNm`) | - | `ibx_maintrBkBrnNm` (`dma_corpInfoRes.maintrBkBrnNm`) |
| `label_6` 라벨 | 조건부상장여부 | `label_6` |
| `sbx_condListYn` 콤보 (`dma_corpInfoRes.condListYn`) | - | `sbx_condListYn` (`dma_corpInfoRes.condListYn`) |
| `label_60` 라벨 | 상장주선인 | `label_60` |
| `ibx_leadcomMbrNmStr` 입력 (`dma_corpInfoRes.leadcomMbrNmStr`) | - | `ibx_leadcomMbrNmStr` (`dma_corpInfoRes.leadcomMbrNmStr`) |
| `label_18` 라벨 | 벤처기업여부 | `label_18` |
| `sbx_ventbzYn` 콤보 (`dma_corpInfoRes.ventbzYn`) | - | `sbx_ventbzYn` (`dma_corpInfoRes.ventbzYn`) |
| `label_39` 라벨 | 부실기재건수 | `label_39` |
| `sbx_confpnt` 콤보 (`dma_corpInfoRes.confPnt`) | - | `sbx_confpnt` (`dma_corpInfoRes.confPnt`) |
| `label_19` 라벨 | 중소기업여부 | `label_19` |
| `sbx_smeYn` 콤보 (`dma_corpInfoRes.smeYn`) | - | `sbx_smeYn` (`dma_corpInfoRes.smeYn`) |
| `panel_KOSDAQ1` 영역 | - | `panel_KOSDAQ1` |
| `label_43` 라벨 | 기업구분 | `label_43` |
| `sbx_prelmInvstgComTpCd` 콤보 (`dma_corpInfoRes.prelmInvstgComTpCd`) | - | `sbx_prelmInvstgComTpCd` (`dma_corpInfoRes.prelmInvstgComTpCd`) |
| `label_20` 라벨 | 국민주여부 | `label_20` |
| `sbx_peplstkYn` 콤보 (`dma_corpInfoRes.peplstkYn`) | - | `sbx_peplstkYn` (`dma_corpInfoRes.peplstkYn`) |
| `label_52` 라벨 | 주요주주관련 | `label_52` |
| `label_21` 라벨 | (주식분포상황) | `label_21` |
| `txa_majshrhdContn` 여러 줄 입력 (`dma_corpInfoRes.majshrhdContn`) | - | `txa_majshrhdContn` (`dma_corpInfoRes.majshrhdContn`) |
| `label_41` 라벨 | 비고 | `label_41` |
| `txa_remk` 여러 줄 입력 (`dma_corpInfoRes.remk`) | - | `txa_remk` (`dma_corpInfoRes.remk`) |
| `label_17` 라벨 | 상장종목현황 | `label_17` |
| `lab_btn` 라벨 | 저장버튼을 클릭하면 '상장종목신규' 버튼이 활성화 됩니다. | `lab_btn` |
| `btn_isuNew` 버튼 | 상장종목신규 | `btn_isuNew` · `scwin.btn_isuNew_onclick` |
| `grd_issList` 그리드 | - | `grd_issList` · `scwin.grd_issList_oncelldblclick` (`dlt_isuDetailRes`) |
| `grp_btnBox` 영역 | - | `grp_btnBox` |
| `btn_dscl` 버튼 | 안내문작성 | `btn_dscl` · `scwin.btn_dscl_onclick` |
| `btn_save` 버튼 | 저장 | `btn_save` · `scwin.btn_save_onclick` |

상장종목현황 그리드(`grd_issList`, `dlt_isuDetailRes`):

| AS-IS 머리글 id | 머리글 | TO-BE 열 / 머리글 id | 표시 형식 |
|---|---|---|---|
| `STKCERT_KIND_NM` | 주식종류 | `stkcertKindNm` / `h_stkcertKindNm` | - |
| `ISU_RND` | 발행회차 | `isuRnd` / `h_isuRnd` | - |
| `STK_ISU_RSN_NM` | 발행사유 | `stkIsuRsnNm` / `h_stkIsuRsnNm` | - |
| `LIST_METHD_TP_NM` | 상장방식 | `listMethdTpNm` / `h_listMethdTpNm` | - |
| `LIST_DD` | 상장일 | `listDd` / `h_listDd` | 날짜 `yyyy-MM-dd`(규칙 46, AS-IS mask XXXX-XX-XX) |
| `ISU_DD` | 발행일 | `isuDd` / `h_isuDd` | 날짜 `yyyy-MM-dd`(규칙 46, AS-IS mask XXXX-XX-XX) |
| `ISU_PRC` | 발행가 | `isuPrc` / `h_isuPrc` | 숫자 `#,##0.###` |
| `NPARVALSTK_YN` | 무액면주식여부 | `nparvalstkYn` / `h_nparvalstkYn` | - |
| `PARVAL` | 액면가/개별주당자본금 | `parval` / `h_parval` | 숫자 `#,##0.###` |
| `ISU_SHRS` | 증감주식수 | `isuShrs` / `h_isuShrs` | 숫자 `#,###` |
| `CMSTK_ISU_SHRS` | 총발행 보통주식수 | `cmstkIsuShrs` / `h_cmstkIsuShrs` | 숫자 `#,###` |
| `PREFSTK_ISU_SHRS` | 총발행 우선주식수 | `prefstkIsuShrs` / `h_prefstkIsuShrs` | 숫자 `#,###` |
| `ACC_ISU_SHRS` | 총발행 주식수 | `accIsuShrs` / `h_accIsuShrs` | 숫자 `#,###` |
| `ISU_CAP` | 종목별 증감 상장자본금 | `isuCap` / `h_isuCap` | 숫자 `#,##0.###` |
| `ACC_ISU_CAP` | 종목별 변경후 상장자본금 | `accIsuCap` / `h_accIsuCap` | 숫자 `#,##0.###` |
| `DIV_RECK_DD1` | 배당기산일 | `divReckDd1` / `h_divReckDd1` | 날짜 `yyyy-MM-dd`(규칙 46, AS-IS mask XXXX-XX-XX) |
| `PREFSTK_TP_NM` | 신형우선주여부 | `prefstkTpNm` / `h_prefstkTpNm` | - |
| `SKTAMT_PAYLOC_NM` | 주금납입처 | `sktamtPaylocNm` / `h_sktamtPaylocNm` | - |
| `REMK` | 비고 | `remk` / `h_remk` | - |
| `ISU_CD` | 종목코드 | `isuCd` / `h_isuCd` | - |
| `ISU_KOR_NM` | 종목명 | `isuKorNm` / `h_isuKorNm` | - |

- 금액 열(발행가·액면가·증감/변경후 상장자본금)은 AS-IS `Decao:3`(소수 셋째 자리) → `#,##0.###`. 주식수 열은 개발 사본의 `#,###` 유지.
- 시장구분·이전시장 콤보는 고정 항목(1 유가증권시장, 2 코스닥시장) 대신 이미 받던 공통 코드 `dlt_spotIsuTrdMktTpCd` 로 바인딩했다(비활성 표시 전용).
- 증권그룹 콤보(`sbx_secugrpId`)를 `dma_corpInfoRes.secugrpId` 에 바인딩했다(05104 와 같게) — 기존 건은 회사의 증권그룹, 신규는 부모 값.

### 2.2 데이터 정의

화면에 적용된 keyInfo 를 명세로 간주한다. 키는 이미 camelCase 다.

| AS-IS(=TO-BE) id | 종류 | TO-BE | 키(컬럼) — `id`(AS-IS name) |
|---|---|---|---|
| `dma_codReq` | dataMap | 유지 | `codeList`(코드정보 List) |
| `dlt_transstkAgntCd` | dataList | 유지 | `value`(name1), `text`(name2), `cdId`(name3), `cdEngNm`(name4) |
| `dlt_spotIsuTrdMktTpCd` | dataList | 유지 | `value`(name1), `text`(name2), `cdId`(name3), `cdEngNm`(name4) |
| `dlt_extAudtrCd` | dataList | 유지 | `value`(name1), `text`(name2), `cdId`(name3), `cdEngNm`(name4) |
| `dlt_sectTpCd` | dataList | 유지 | `value`(name1), `text`(name2), `cdId`(name3), `cdEngNm`(name4) |
| `dlt_listClssCd` | dataList | 유지 | `value`(name1), `text`(name2), `cdId`(name3), `cdEngNm`(name4) |
| `dlt_prelmInvstgComTpCd` | dataList | 유지 | `value`(name1), `text`(name2), `cdId`(name3), `cdEngNm`(name4) |
| `dma_selectOneReq` | dataMap | 유지 | `bzProcsNo`(업무처리번호), `isurCd`(발행회사코드), `listDd`(상장일) |
| `dlt_isuDetailRes` | dataList | 유지 | `bzProcsNo`(name1), `isurCd`(name2), `isuCd`(name3), `prefstkTpCd`(name4), `stkcertIsuSeq`(name5), `listDd`(name6), `stkcertKindCd`(name7), `stkIsuRsnCd`(name8), `listMethdTpCd`(name9), `prefstkTpNm`(name10), `stkIsuRsnNm`(name11), `stkcertKindNm`(name12), `listMethdTpNm`(name13), `isuDd`(name14), `isuRnd`(name15), `parval`(name16), `isuPrc`(name17), `isuShrs`(name18), `cmstkIsuShrs`(name19), `prefstkIsuShrs`(name20), `accIsuShrs`(name21), `isuCap`(name22), `accIsuCap`(name23), `errCorrctCapDiffamt`(name24), `sktamtPaylocNm`(name25), `divReckDd1`(name26), `divReckDd2`(name27), `divReckDd3`(name28), `divReckDd4`(name29), `stkcertMixFlowStrtDd`(name30), `stkcertMixFlowEndDd`(name31), `stkcertSinglFlowStrtDd`(name32), `remk`(name33), `prefstkDivRt`(name34), `prefstkContinDeadlineYys`(name35), `prefstkContinDeadlineMm`(name36), `prefstkContinDeadlineDys`(name37), `prefstkEndDd`(name38), `indefinpdYn`(name39), `partctpYn`(name40), `acctpYn`(name41), `ndivtmVoterghtYn`(name42), `prefstkRemk`(name43), `mktactEnforceDd`(name44), `isuKorNm`(name45), `isuEngNm`(name46), `isuKorAbbrv`(name47), `isuEngAbbrv`(name48), `isuEngSymbl`(name49), `isuSrtCd`(name50), `nparvalstkYn`(name51) |
| `dma_corpInfoRes` | dataMap | 유지 | `bzProcsNo`(name1), `isurCd`(name2), `prelmInvstgBzProcsNo`(name3), `secugrpId`(name4), `spotIsuTrdMktTpCd`(name5), `fssUnqNo`(name6), `comNm`(name7), `comAbbrv`(name8), `comEngNm`(name9), `comEngAbbrv`(name10), `isurSymbl`(name11), `ceoNm`(name12), `bzRegNo`(name13), `corpRegNo`(name14), `foundDd`(name15), `listNo`(name16), `stkcertListApprovDd`(name17), `listDd`(name18), `oldSpotIsuTrdMktTpCd`(name19), `oldListDd`(name20), `oldDelistDd`(name21), `stdIndCd`(name22), `stdIndNm`(name23), `zipcdSeq`(name24), `zipcd`(name25), `addr`(name26), `dtlAddr`(name27), `hpage`(name28), `corpTelNo`(name29), `headqtrFaxNo`(name30), `majProdNm`(name31), `sectTpCd`(name32), `transstkAgntCd`(name33), `fornTransstkAgntNm`(name34), `extAudtrCd`(name35), `maintrBkCd`(name36), `maintrBkNm`(name37), `maintrBkBrnNm`(name38), `acntclsMmdd1`(name39), `acntclsMmdd2`(name40), `acntclsMmdd3`(name41), `acntclsMmdd4`(name42), `parTpCd`(name43), `reitsKindCd`(name44), `exstStrtDd`(name45), `exstEndDd`(name46), `inprospctsExstStrtDd`(name47), `inprospctsExstEndDd`(name48), `asstcomNm`(name49), `asstcustdNm`(name50), `asstsellNm`(name51), `transagntNm`(name52), `shipcomNm`(name53), `shipmngcomNm`(name54), `majagntComNm`(name55), `smeYn`(name56), `capInroadYn`(name57), `dirctlistCorpYn`(name58), `condListYn`(name59), `ventbzYn`(name60), `per1drFornstkRto`(name61), `listFornExchNm1`(name62), `listFornExchNm2`(name63), `listFornExchListDd1`(name64), `listFornExchListDd2`(name65), `fornstkYn`(name66), `fornstkStorgInstNm`(name67), `applExchrt`(name68), `cntrIsoCd`(name69), `cntrIsoNm`(name70), `currIsoCd`(name71), `currIsoCdDscl`(name72), `newListTpCd`(name73), `invstorgTpCd`(name74), `listClssCd`(name75), `peplstkYn`(name76), `majshrhdContn`(name77), `remk`(name78), `parval`(name79), `isuCap`(name80), `sectTpNm`(name81), `transstkAgntNm`(name82), `exstDeadlineRemk`(name83), `proftDistrPayTmContn`(name84), `valuPrc`(name85), `hgstOrdPrc`(name86), `lwstOrdPrc`(name87), `leadcomMbrNoStr`(name88), `leadcomMbrNmStr`(name89), `regsYn`(name90), `regsRemk`(name91), `spacYn`(name92), `subcomYn`(name93), `hdcomIsurCd`(name94), `hdcomIsurNm`(name95), `confPnt`(name96), `earngDistrBasMmdd1`(name97), `earngDistrBasMmdd2`(name98), `earngDistrBasMmdd3`(name99), `earngDistrBasMmdd4`(name100), `prelmInvstgComTpCd`(name101) |
| `dma_newListIsuSelectOneReq` | dataMap | 삭제(쓰지 않음) | `bzProcsNo`(업무처리번호) |
| `dma_newListIsuSelectOneRes` | dataList | 삭제(쓰지 않음) | `bzProcsNo`(name1), `isurCd`(name2), `isuCd`(name3), `prefstkTpCd`(name4), `stkcertIsuSeq`(name5), `listDd`(name6), `stkcertKindCd`(name7), `stkIsuRsnCd`(name8), `listMethdTpCd`(name9), `prefstkTpNm`(name10), `stkIsuRsnNm`(name11), `stkcertKindNm`(name12), `listMethdTpNm`(name13), `isuDd`(name14), `isuRnd`(name15), `parval`(name16), `per1stkCap`(name17), `isuPrc`(name18), `isuShrs`(name19), `bfAccIsuShrs`(name20), `accIsuShrs`(name21), `isuCap`(name22), `bfAccIsuCap`(name23), `accIsuCap`(name24), `sktamtPaylocNm`(name25), `divReckDd1`(name26), `divReckDd2`(name27), `divReckDd3`(name28), `divReckDd4`(name29), `stkcertMixFlowStrtDd`(name30), `stkcertMixFlowEndDd`(name31), `stkcertSinglFlowStrtDd`(name32), `remk`(name33), `prefstkIsuDd`(name34), `prefstkDivRt`(name35), `prefstkContinDeadlineYys`(name36), `prefstkContinDeadlineMm`(name37), `prefstkContinDeadlineDys`(name38), `prefstkEndDd`(name39), `indefinpdYn`(name40), `partctpYn`(name41), `acctpYn`(name42), `newprefstkRemk`(name43), `filelawstDd`(name44), `newstkRelLawstYn`(name45), `isuKorNm`(name46), `isuEngNm`(name47), `isuKorAbbrv`(name48), `isuEngAbbrv`(name49), `isuEngSymbl`(name50), `isuSrtCd`(name51), `draftYn`(name52), `disclsYn`(name53), `mktactYn`(name54), `fnlEmpNm`(name55), `currIsoCd`(name56), `corpbndIsuRnd`(name57), `paidcapincIsuTpCd`(name58), `sktamtPayDd`(name59), `nparvalstkYn`(name60) |
| `dlt_listMaintradeBank` | dataList | 유지 | `value`(name1), `text`(name2) |
| `dma_registerReq` | dataMap | 유지 | `bzProcsNo`(name1), `listClssCd`(name2), `listDd`(name3), `prelmInvstgBzProcsNo`(name4), `isurCd`(name5), `spotIsuTrdMktTpCd`(name6) |
| `dma_selectNewListNoReq` | dataMap | 유지 | `spotIsuTrdMktTpCd`(시장구분코드) |
| `dma_selectNewListNoRes` | dataMap | 유지 | `listNo`(name1) |

- 추가: `dma_corpInfoReq` { `isurCd` } — 회사코드로 법인정보 조회(§5.3) 요청. 개발 사본은 GET query string 으로 붙였다(`?isurCd=`·requestData).
- 삭제: `dma_newListIsuSelectOneReq`·`dma_newListIsuSelectOneRes` — 주석 처리된 옛 조회(`fn_readKindStkNewList`, "이 api가 아닌거같다")만 쓰던 정의. 이름은 `dma_` 이지만 실제는 dataList 였다.
- `dma_corpInfoRes` 에는 `listProcsStatCd` 키가 없다 — 원본이 저장 때 `'20'` 을 넣던 값은 등록 요청에도 없어 옮기지 않았다(§10 #4).

## 3. 로딩 (`scwin.onpageload` → `scwin.init`)

`onpageload` 는 `scwin.init()` 만 부른다(try/catch → `$c.exception.handleError`).

1. **사용자 시장별 화면** — `scwin.userMkt` = 세션 market, `applyMktView()`(§6.2).
2. **코드 목록** — `await selectCode()`(§5.1), `await selectMaintradeBank()`(§5.2). 콤보 목록이 먼저 있어야 조회 값이 표시되므로 순서대로 기다린다(개발 사본 05103 은 await, 05104 는 await 없음).
3. **파라미터 수신** — `$c.data.getParameter()` → `vBzProcsNo`·`isurCd`·`comNm`·`listDd`·`newSecugrpId`(§1.2).
4. **달력 바인딩(규칙 37)** — 단일 `checkCalendarFormat`: `cal_foundDd`·`cal_stkcertListApprovDd`·`cal_listDd`·`cal_oldListDd`·`cal_oldDelistDd`; 기간 쌍 `compareFromToDate(cal_exstStrtDd, cal_exstEndDd, ["존립기간 시작일", "존립기간 종료일"])`. 읽기 전용 달력도 선례(05923·05807)대로 건다. 조회 영역(`schbox`·`tbl_search`)이 없어 `setEnterKeyEvent` 대상은 없다.
5. **버튼** — `setIsuNewButton()`(§6.5).
6. **기존 건** — 검색 칸에 부모 값 → `dma_corpInfoRes` 의 회사코드·상장일에 부모 값 → `await readSync()`(§6.1) → 검색 칸을 조회 값으로 → SPAC 이면 `panel_spac` 표시, 아니면 숨김.
   **신규** — `panel_spac` 숨김, `dma_corpInfoRes.secugrpId` = `newSecugrpId`, `spotIsuTrdMktTpCd` = `newMktTpCd`, 버튼 `insert`.
7. **결산 칸 이름** — `applyMktLabel()`(§6.3).

## 4. 컴포넌트 이벤트

| TO-BE 컴포넌트 | 이벤트 | TO-BE 핸들러 | 동작 (호출 함수) | AS-IS |
|---|---|---|---|---|
| `btn_coSearch` | onclick | `scwin.btn_coSearch_onclick` | 증권그룹 검사 → `openCorpPopup`(§6.9) | `btn_coSearch_onclick` → `fn_PopFindKindStkExamCorp` |
| `btn_isuNew` | onclick | `scwin.btn_isuNew_onclick` | `openIsuPopup(-1, isProtectReg(true))`(§6.10) | `btn_isuNew_onclick` → `fn_OpenKindStkDetailCorpIsu(_protect)(-9999)` |
| `grd_issList` | oncelldblclick | `scwin.grd_issList_oncelldblclick` | `openIsuPopup(rowIndex, isProtectReg(false))` | `grd_issList_oncelldblclick` (원본 `OnDblClick(row, colid)`) |
| `btn_listNo` | onclick | `scwin.btn_listNo_onclick` | `selectNewListNo`(§5.5) | `btn_listNo_onclick` + `sbm_selectNewListNo_submitdone` |
| `btn_save` | onclick | `scwin.btn_save_onclick` | `save`(§6.8) | `btn_save_onclick` → `fn_save` |
| `btn_dscl` | onclick | `scwin.btn_dscl_onclick` | `writeDscl`(§6.11) | `btn_dscl_onclick` → `fn_dscl` |
| `ibx_acntclsMm1` | displayFormatter | `scwin.acntclsMmFormatter` | 결산월(일) 표시(§6.3) | 같음 |
| `sbx_spotIsuTrdMktTpCd` | (onchange 삭제) | — | 비활성 콤보라 사용자가 바꿀 수 없다 → 조회 뒤 `applyMktLabel()` 로 처리 | `sbx_spotIsuTrdMktTpCd_OnSelChange` |
| body | onpageunload (삭제) | — | 빈 함수 | `onpageunload` |

AS-IS `xf:events` 블록의 `btn_Close`·`img_LIST_DD`·`dts_DoubleChk`·`dts_Discls_Isu`·`dts_Corp`·`trs_Save`·`gform` 항목은 W-Craft 가 남긴 Gauce 이벤트 목록으로 화면에 그 컴포넌트가 없다 — 옮기지 않는다.

## 5. 서버 통신

| # | 용도 | AS-IS (주석에 남은 옛 호출 / 개발 사본) | TO-BE (화면 적용 API — 명세 간주) |
|---|---|---|---|
| 5.1 | 공통 코드 6종 | 개발 사본 `fn_searchCode` | `GET /api/listing/common/code/list-code-value` |
| 5.2 | 주거래은행 목록 | `fn_SetComboCode` (옛 `/CodeAction.do?method=listInstCd`) | `GET /api/listing/common/code/list-maintrade-bank` |
| 5.3 | 회사코드로 법인정보 | `fn_readKindStkNewRegNewList` (옛 `/KindStk.do?method=readKindStkNewRegNewList`) | `GET /api/listing/lstproc/realship/newlisting/select-corpinfo-byisurcd` |
| 5.4 | 상장종목현황(+법인정보) | `fn_read_sync` → `fn_kindStkIsuDtl` (옛 `readKindStkNewList` + `readKindStkIsuDtlList`) | `GET /api/listing/lstproc/kind/listing-review/stock/select-one` |
| 5.5 | 새 상장번호 | `btn_listNo_onclick` | `GET /api/listing/lstproc/listinvstg-common/select-new-listno` |
| 5.6 | 회사정보 등록 | `fn_trs` (옛 `/KindStk.do?method=saveKindStkNewList`, `trs_Save`) | `POST /api/listing/lstproc/kind/listing-review/stock/register` |
| — | 채번 | `$c.stf.getNewBzProcNo` | pcc 함수 그대로(§6.8) |
| — | 공시용 종목 | `fn_readKindStkCorpisuDiscls` (옛 `readDisclsData`, 개발 사본은 본문 주석) | **API 없음** — 상장종목현황으로 대신(§10 #6) |
| — | 옛 조회 | `fn_readKindStkNewList` → `/api/listing/lstproc/kind/listing-review/new-list-isu/select-one`(주석, "이 api가 아닌거같다") | 쓰지 않음 — select-one(§5.4)이 법인정보를 함께 준다 |

### 5.1 공통 코드 (`scwin.selectCode`)

| 항목 | 내용 |
|---|---|
| `id` | `sbm_listCodeValue` |
| `method` / `action` | `get` `/api/listing/common/code/list-code-value` |
| `ref` | `dma_codReq` — `codeList` = `"TRANSSTK_AGNT_CD, SPOT_ISU_TRD_MKT_TP_CD, EXT_AUDTR_CD, SECT_TP_CD, LIST_CLSS_CD, PRELM_INVSTG_COM_TP_CD"` |
| `target` | `dlt_transstkAgntCd=body.TRANSSTK_AGNT_CD, dlt_spotIsuTrdMktTpCd=body.SPOT_ISU_TRD_MKT_TP_CD, dlt_extAudtrCd=body.EXT_AUDTR_CD, dlt_sectTpCd=body.SECT_TP_CD, dlt_listClssCd=body.LIST_CLSS_CD, dlt_prelmInvstgComTpCd=body.PRELM_INVSTG_COM_TP_CD` (공통 계약 §4.5 B 형태) |
| 선행 / 순서 | 로딩 2단계, 조회보다 먼저 await |
| 후처리 | 없음 — 콤보 itemset(`label=text`, `value=value`) |
| 실패 처리 | 공통 오류 처리. `skipped`·`success` 로 결과만 돌려준다 |
| 중복 실행 | 로딩 때 한 번 |

### 5.2 주거래은행 (`scwin.selectMaintradeBank`)

| 항목 | 내용 |
|---|---|
| `id` | `sbm_listMaintradeBank` |
| `method` / `action` | `get` `/api/listing/common/code/list-maintrade-bank` |
| `ref` | 없음 |
| `target` | `dlt_listMaintradeBank=body` → `sbx_maintrBkCd` itemset |
| 선행 / 순서 | §5.1 뒤 |
| 실패 처리 | 공통 |

### 5.3 회사코드로 법인정보 (`scwin.selectCorpInfo`)

| 항목 | 내용 |
|---|---|
| `id` | `sbm_selectCorpInfo` (개발 사본 `sbm_selectComInfo`) |
| `method` / `action` | `get` `/api/listing/lstproc/realship/newlisting/select-corpinfo-byisurcd` |
| `ref` | `dma_corpInfoReq` { `isurCd` } — 개발 사본은 05103 이 requestData(`reqMap`), 05104 가 query string 으로 보냈다 |
| `target` | `dma_corpInfoRes=body` |
| 선행 / 순서 | 05112 에서 회사를 고른 뒤. 이어서 §5.4(종목만) |
| 후처리 | `applyCorpState()`(§6.4) — 원본 `dts_Corp OnLoadCompleted` |
| 실패 처리 | 공통 오류 처리, `false` 반환 → §5.4 를 부르지 않는다 |
| 중복 실행 | 공통 `skipped` |

### 5.4 상장종목현황(+법인정보) (`scwin.selectDetail`)

| 항목 | 내용 |
|---|---|
| `id` | `sbm_selectOne` |
| `method` / `action` | `get` `/api/listing/lstproc/kind/listing-review/stock/select-one` |
| `ref` | `dma_selectOneReq` { `bzProcsNo` = 회사 업무처리번호, `isurCd`, `listDd` } — `readSync()` 는 `dma_corpInfoRes` 의 회사코드·상장일을 넘긴다 |
| `target` | 업무처리번호가 있으면 `dlt_isuDetailRes=body.isuDetail, dma_corpInfoRes=body.corpInfo`, 없으면(신규) `dlt_isuDetailRes=body.isuDetail` 만 — 신규 건의 법인정보를 빈 corpInfo 로 덮지 않게 한다(§8 #5) |
| 선행 / 순서 | 로딩(기존 건), 회사 선택 뒤, 저장 뒤, 종목 등록 팝업 닫힘 뒤 |
| 후처리 | 업무처리번호가 있을 때 `applyCorpState()`(§6.4) — 원본 `fn_read_sync` 가 `dts_Corp` 를 다시 읽어 `OnLoadCompleted` 가 돌던 것 |
| 실패 처리 | 공통, `false` |

### 5.5 새 상장번호 (`scwin.selectNewListNo`)

| 항목 | 내용 |
|---|---|
| `id` | `sbm_selectNewListNo` |
| `method` / `action` | `get` `/api/listing/lstproc/listinvstg-common/select-new-listno` |
| `ref` | `dma_selectNewListNoReq` { `spotIsuTrdMktTpCd` = 세션 market } |
| `target` | `dma_selectNewListNoRes=body` |
| 후처리 | `dma_corpInfoRes.listNo` = 응답 `listNo` (원본 `sbm_selectNewListNo_submitdone`) |
| 실패 처리 | 공통 |

### 5.6 회사정보 등록 (`scwin.saveTrs`)

| 항목 | 내용 |
|---|---|
| `id` | `sbm_register` |
| `method` / `action` | `post` `/api/listing/lstproc/kind/listing-review/stock/register` |
| `ref` | `dma_registerReq` { `bzProcsNo`(새 번호), `listClssCd`, `listDd`, `prelmInvstgBzProcsNo`, `isurCd`, `spotIsuTrdMktTpCd` } ← `dma_corpInfoRes` |
| `target` | 없음(응답 정의 없음) |
| 선행 / 순서 | 검증 → 확인 → 채번(§6.8) |
| 후처리 | `checkResult(result, "저장")` — `success === true` 이고 `completeYn` 이 없거나 `"true"` 면 성공. 성공 뒤 `save` 가 MSG-A001·재조회 |
| 실패 처리 | MSG-A002 "[저장] 처리 실패하였습니다." (원본 `trs_Save OnFail` 의 `fn_alertMsg('F')` + `alert_error`) |
| 중복 실행 | 공통 `skipped` → `false` |

## 6. 일반 함수

### 6.1 다시 조회 (`scwin.readSync`)

* **Return:** 성공 여부
* **로직:** `selectDetail(dma_corpInfoRes.isurCd, dma_corpInfoRes.listDd)`. 원본 `fn_read_sync` 는 `ibx_isurCd`·`cal_listDd` 값을 읽었는데 둘 다 `dma_corpInfoRes` 바인딩이라 같다.

### 6.2 사용자 시장별 화면 (`scwin.applyMktView`)

* **로직:** `panel_HDCOM_ISUR_CD` 숨김(원본 주석 "미사용?"). 세션 market 1 → `panel_KOSDAQ`·`panel_KOSDAQ1` 숨김, `panel_KSE` 표시, 신규 시장 "1" / 2 → 반대, "2" / 그 밖 → 신규 시장 "A"(원본 `pJsMarket = 'A'`, §8 #6).

### 6.3 결산 칸 이름·표시 (`scwin.applyMktLabel` · `scwin.acntclsMmFormatter`)

* **applyMktLabel:** 회사 시장구분이 2(코스닥)면 `label_40` = "결산월", 그 밖은 "결산기". 원본 `sbx_spotIsuTrdMktTpCd_OnSelChange` 는 비활성 콤보의 사용자 변경 이벤트라 실제로 돌지 않았다 — 로딩·법인정보 수신 뒤 부른다.
* **acntclsMmFormatter(value):** 2자리 "MM월", 4자리 "MM월 DD일", 그 밖은 원값. 원본 `getDisplayFormatter("MM월 DD일")` 호출은 서식을 바꾸지 못하는 잘못된 API 사용이었다(§8 #8).

### 6.4 법인정보 수신 후 상태 (`scwin.applyCorpState`)

* **로직:** (원본 `dma_corpInfoRes_OnLoadCompleted` + `fn_kindStkIsuDtl` 뒷부분 — 개발 사본에 같은 로직이 두 번 있었다)
  1. 응답에 증권그룹이 없으면 `newSecugrpId` 로 보충, `applyMktLabel()`.
  2. 업무처리번호 없음 → 버튼 `insert`, 회사 찾기 활성 / 있음 → 회사 찾기 잠금, 상장일 > 서버 오늘이면 `update`(저장 잠금), 아니면 `error`.
  3. 회사코드가 비면 "보통주 상장심사가 선행되어야 합니다" → `error`, 끝.
  4. 상장번호가 있으면 [상장번호생성] 잠금.
  5. 금감원코드가 비면 MSG-0025 "금감원코드가 없어 입력하실수 없습니다." → `error`.
  6. 세션 부서코드가 `scwin.EXAM_DEP_CDS`(2500·2520·2540·3300·3320·3330·3E00·3E10·3E20·3E30·3E40·2615·3G20) 밖이면 `error`.
* 상태 → 버튼: 공통 `$c.util.setButtonState("grp_btnBox", 상태, { save : "btn_save" })` — `insert` 는 저장 활성, `update`·`error` 는 저장 잠금.

### 6.5 버튼 (`scwin.setCoSearchEnabled` · `scwin.setIsuNewButton`)

* **setCoSearchEnabled(enabled):** `btn_coSearch` 활성(원본 `fn_initForm('C'|'X')`, 이미지 교체는 삭제).
* **setIsuNewButton():** 회사 업무처리번호가 있으면 `btn_isuNew`·`btn_dscl` 활성, `lab_btn` 숨김 / 없으면 반대(원본 `fn_btnShow`, 20100910 (2616)).

### 6.6 보호예수 포함 판단 (`scwin.isProtectReg`)

* **파라미터:** `withAllMkt` — 전체(9) 사용자도 포함으로 볼지. **Return:** 05105 로 열지 여부.
* **로직:** (유가 1 이거나 `withAllMkt` 이고 9) 이고 증권그룹이 ST·DR·FS. [상장종목신규]는 `true`, 더블클릭은 `false`(원본 그대로, §8 #7). 증권그룹 콤보 항목이 ST·FS·DR 뿐이라 증권그룹 조건은 늘 참이다.

### 6.7 저장 전 검증 (`scwin.validate`)

* **로직:** 상장일·회사코드가 비면 MSG-A005 "[^] 을(를) 입력하셔야 합니다." 후 포커스(회사코드는 읽기 전용이라 [회사코드 찾기]에). 원본 메시지는 `$c.data.getMessage("com_req_input", …)` 였으나 메시지 정의가 저장소에 없어 pcc 메시지로 통일했다(05104 와 같게).

### 6.8 저장 (`scwin.save` · `scwin.getNewBzProcsNo` · `scwin.checkResult`)

* **save:** `trJob = "I"` → `validate` → `$c.lc.isProcess("I")` → `getNewBzProcsNo()` 14자리 검사(MSG-0010) → `saveTrs(번호)` → 성공이면 `vBzProcsNo` 반영 → MSG-A001 "[저장] 처리 성공하였습니다." → `setIsuNewButton()` → `readSync()`.
  * 원본은 채번 즉시 `vBzProcsNo` 를 바꿔, 등록이 실패해도 화면이 업무처리번호를 가진 상태가 됐다 — 성공 뒤로 옮겼다(§8 #9).
  * 원본 `fn_trs` 의 `TR_JOB == "U"`(부모 행 포커스)·`"D"`(닫기) 분기는 `TR_JOB` 이 늘 `'I'` 라 도달하지 않는다 — 옮기지 않는다(§8 #4).
* **getNewBzProcsNo:** 선례 05232 — 응답 봉투에서 body 를 꺼내 문자열/`{ bzProcsNo }` 모두 받는다(§10 #5).
* **checkResult:** 선례 05806 (§5.6).

### 6.9 신규상장 법인 선택 (`scwin.openCorpPopup`) — getPar/setPar → `openPopup` data + `await`

* **data:** `{ isurCd : ibx_searchCd, isurNm : ibx_searchNm, secugrpId : sbx_secugrpId, mktTpCd : sbx_spotIsuTrdMktTpCd, searchType : $c.lc.getGlbValue("SEARCH_TYP_SLC") }` — 원본 `fn_GetParIsur` arr[0]~[4].
* **옵션:** `{ id : "ULDSTF05112", popupName : getSecuGrpNm(증권그룹) + " 종류주식 신규상장 법인 선택", width : 880, height : 700, frameModal : "top" }` (05103·05104 크기가 달라 공통 계약대로 880×700).
* **반환:** `isCloseButtonClick === true` 이거나 `isurCd` 가 비면 끝. 아니면 검색 칸 → `await selectCorpInfo(isurCd)` → 성공이면 `await readSync()`. 원본 `fn_SetParIsur` 의 `DBCLICKYN == "Y"` 판정은 `isurCd` 판정으로 바꿨다(취소는 `{ isCloseButtonClick }` 객체가 온다).

### 6.10 종목 등록 (`scwin.getIsuPopupData` · `scwin.openIsuPopup`)

* **getIsuPopupData(row):** 공통 계약 11키 — `bzProcsNo`(선택 행 종목 업무처리번호, 신규 ""), `coBzProcsNo`(회사 업무처리번호), `secugrpId`, `prelmInvstgBzProcsNo`, `spotIsuTrdMktTpCd`, `isurCd`, `comNm`, `listDd`, `listClssCd`, `isurSymbl`, `comAbbrv`. 원본은 팝업이 `parentWin.scwin.vBzProcsNo`·`clickBzProcsNo`(`fn_setBzProcsNo`/`fn_getBzProcsNo`)와 이 화면 컴포넌트를 직접 읽었다.
* **openIsuPopup(row, isProtect):** 05105(1180×880) 또는 05113(1350×900 — 공통 계약 통일 크기). 결과가 `isSaved === true` 이거나 `isCloseButtonClick === true` 면 `readSync()` 뒤 그 행(`row` 가 남아 있으면)에 포커스. 원본은 팝업이 `parentWin.fn_read_sync()`·`parentWin.grd_issList.setFocusedCell` 을 직접 불렀다.

### 6.11 공시안내문작성 (`scwin.checkBiz` · `scwin.getDsclTitle` · `scwin.getDsclData` · `scwin.writeDscl` · `scwin.getPar` · `scwin.fillDataList`)

* **checkBiz:** 상장종목 0건이면 "[상장종목]을 입력하세요."(원본 `fn_CheckBiz`).
* **getDsclTitle(comNm, listDd):** `"{회사명} 종류주식,  상장일 yyyy.MM.dd"`(원본 `fn_getKindStkDsclsTitle`, 공백 두 칸 그대로).
* **getDsclData():**

  | AS-IS | TO-BE 키 | 값 |
  |---|---|---|
  | `arr[0]` | `formCd` | 시장 1 → `"68157"`, 2 → `"70735"` (`scwin.DSCL_FORM_CD`) |
  | `arr[1]` | `bzProcsNo` | 회사 업무처리번호 + 종목 업무처리번호들을 콤마로(원본 누적 방식 그대로) |
  | `arr[2]` | `isurCd` | `dma_corpInfoRes.isurCd` (원본 `dma_corpInfoRes.get("ISUR_CD")` 대문자 결함) |
  | `arr[3]` | `mktId` | `dma_corpInfoRes.spotIsuTrdMktTpCd` |
  | `arr[5]` | `title` | `getDsclTitle(회사명, 상장일)` — **유가(1)만** arr 에 넣는다 |
  | `CopyDataSet(dts_Discls_Isu, param_dts_isu)` | `isu` | `dlt_isuDetailRes.getAllJSON()` — 공시용 종목 조회 API 가 없어 대신(§10 #6) |
  | `CopyDataSet(dma_corpInfoRes, param_dts_mst)` + 종목 루프 | `mst` | `[{ ...dma_corpInfoRes, divReckDd1, isuPrc, isuCd, isuSrtCd, isuDd(마지막 종목), listClssNm : sbx_listClssCd.getText() }]` |

* **writeDscl:** `checkBiz` → `await openPopup("/ui/listingcommon/ULDSTF92024.xml", { id : "ULDSTF92024", popupName : "종류주식 공시안내문작성", width : 735, height : 815, type : "pageFramePopup" }, getDsclData())`. 개발 사본의 `alert("공시안내문"); return;` 막음은 풀었다(공통 계약 §3).
* **getPar(arr, dltIsu, dltMst):** [호환용 · 임시] 92024 전환본(sample-front)이 부모 `scwin.getPar` 를 이름으로 불러 받는다 — 선례 05232·05918. arr[0]~[3] + 유가면 arr[5]. **원본 arr 길이 재현**: 유가 6, 코스닥 4 — 92024 는 길이 5 이상이면 본문을 생성하지 않는다(`isNoGen`). arr[4] 는 원본처럼 비운다.
* **fillDataList:** 92024 원천 dataList 에 첫 행 키로 컬럼을 만든 뒤 `setJSON`.

## 7. 업무 코드 · 메시지 목록

| 구분 | 값 | 쓰는 곳 |
|---|---|---|
| 세션 market | 1 유가증권, 2 코스닥, 9 전체(종목 등록 화면 선택만) | §6.2, §6.6 |
| 증권그룹 | ST 주권, FS 외국주권, DR 주식예탁증권 | `sbx_secugrpId`, §6.6 |
| 검색 구분 | `SEARCH_TYP_SLC` (`$c.lc.getGlbValue`) | 05112 data |
| 공시 서식코드 | 68157(유가), 70735(코스닥) | §6.11 |
| 심사 부서코드 | 2500·2520·2540·3300·3320·3330·3E00·3E10·3E20·3E30·3E40·2615·3G20 | §6.4 |
| 버튼 상태 | `insert`(저장 활성)·`update`·`error`(저장 잠금) — 공통 `BTN_STATE_MAP` | §6.4 |
| MSG-A005 | "[^] 을(를) 입력하셔야 합니다." (상장일·회사코드) | §6.7 |
| MSG-A006 | "[저장] 처리를 하시겠습니까?" (`$c.lc.isProcess`) | §6.8 |
| MSG-0010 | "업무처리번호생성실패" | §6.8 |
| MSG-A001 / MSG-A002 | "[저장] 처리 성공하였습니다." / "[저장] 처리 실패하였습니다." | §6.8, §5.6 |
| MSG-0025 | "금감원코드가 없어 입력하실수 없습니다." | §6.4 |
| 화면 문구 | "보통주 상장심사가 선행되어야 합니다" · "[유가증권]을 선택하세요." · "[상장종목]을 입력하세요." · "저장버튼을 클릭하면 '상장종목신규' 버튼이 활성화 됩니다."(`lab_btn`) | §6.4, §4, §6.11, §6.5 |

## 8. 원본 특이사항 · 결함

| # | 원본에서 실제로 일어나는 일 (근거) | 전환본 처리 |
|---|---|---|
| 1 | 공시안내문작성이 `await $c.win.alert("공시안내문"); return;` 으로 막혀 있고, 아래 옛 코드는 없는 객체(`dts_Discls_Isu`)·대문자 키(`BZ_PROCS_NO`·`ISUR_CD`)·`frame` 을 쓴다 | **고침** — 공통 계약대로 data + 호환 `getPar` 로 연다(§6.11) |
| 2 | 저장 뒤 `$c.win.getParent().scwin.fn_list_sync()` 로 부모 목록을 직접 재조회(`fn_parentRefresh`) | **고침** — 부모가 팝업 결과(X 닫기)로 재조회(§1.2) |
| 3 | 부모가 `rowPos` 자리에 행 객체(`getRowJSON`)를 넘기고, 이 화면은 그것을 `parentWin.grd_list.setFocusedCell(rowPos, 0)` 의 행 번호로 씀 | **옮기지 않음** — 행 복원은 부모 몫(공통 계약) |
| 4 | `fn_trs` 의 `TR_JOB == "U"`·`"D"` 분기 — `TR_JOB` 은 `fn_save` 에서만 `'I'` 로 정해져 도달하지 않음 | **옮기지 않음** |
| 5 | 신규 회사를 고른 뒤 업무처리번호 없이 select-one 을 불러 `dma_corpInfoRes=body.corpInfo` 로 받는다 — 서버가 빈 corpInfo 를 주면 방금 받은 법인정보가 지워진다(`fn_PopFindKindStkExamCorp` 가 `fn_readKindStkNewRegNewList` 를 await 하지 않고 바로 `fn_read_sync`) | **고침** — 법인정보 조회를 await 한 뒤, 업무처리번호가 없으면 종목만 받는다(§5.4) |
| 6 | 유가·코스닥 외 사용자의 신규 시장구분 `pJsMarket = 'A'` — 시장구분 코드에 없는 값 | **유지** + TODO(§10 #8) |
| 7 | 보호예수 포함 판단이 [상장종목신규](시장 1·9)와 더블클릭(시장 1)에서 다름 | **유지**(원본 그대로) |
| 8 | 시장구분 변경 시 `ibx_acntclsMm1.getDisplayFormatter("MM월 DD일")` — 서식을 바꾸지 않는 getter 호출 | **고침** — 길이 기준 `acntclsMmFormatter`(§6.3) |
| 9 | 채번 즉시 `vBzProcsNo` 를 바꿔, 등록 실패 뒤에도 [상장종목신규] 판단 등이 새 번호 기준이 됨 | **고침** — 등록 성공 뒤 반영 |
| 10 | 개발 사본이 기존 건(상장일 전) 버튼을 `insert` 로 바꿔 저장을 열어 둠("저장버튼 하나로통합?") — 기존 건에 저장하면 새 번호로 또 등록된다. 짝 화면 05104 는 원본 `buttonSet.setUpdateStatus()` 를 남김 | **고침** — 원본 의미(`update`, 저장 잠금)로 통일(§6.4) |
| 11 | `fn_getLeadComNoStr`·`fn_setLeadComNMStr`(상장주선인) — 이 화면에서 상장주선인 팝업을 열지 않고 하위 팝업도 부르지 않음 | **옮기지 않음**(잔재) |
| 12 | `btn_listNo.src = "../img/btn_LstNoCrt_d.gif"` 등 이미지 교체, `$c.data.getParameter("com_complete_0150", "저장")`(getMessage 오용) | **삭제/고침** — `setDisabled` 만, MSG-A001 |
| 13 | 원본 저장이 `dma_corpInfoRes.set("listProcsStatCd", '20')` — 키가 없고 등록 요청에도 없음 | **옮기지 않음** + TODO(§10 #4) |

## 9. 전환 내역 (AS-IS → TO-BE)

| AS-IS (개발 사본 함수) | TO-BE |
|---|---|
| `onpageload` · `init` | `scwin.onpageload`(try/catch) → `scwin.init`(§3) |
| `onpageunload` | 삭제(빈 함수) |
| `fn_initForm` | `scwin.setCoSearchEnabled` |
| `fn_SetComboCode` | `scwin.selectMaintradeBank` |
| `fn_searchCode` | `scwin.selectCode` |
| `fn_getLeadComNoStr` · `fn_setLeadComNMStr` | 삭제(§8 #11) |
| `fn_GetParIsur` · `fn_SetParIsur` | `scwin.openCorpPopup` data / 반환(§6.9) |
| `fn_readKindStkNewRegNewList` | `scwin.selectCorpInfo` |
| `fn_read_sync` | `scwin.readSync` |
| `fn_readKindStkNewList` (주석) | 삭제 — select-one 이 대신 |
| `fn_kindStkIsuDtl` | `scwin.selectDetail` (뒷부분 상태 로직은 `scwin.applyCorpState`) |
| `fn_save` | `scwin.save` + `scwin.getNewBzProcsNo` |
| `fn_trs` | `scwin.validate` + `scwin.saveTrs` + `scwin.checkResult` |
| `fn_CheckBiz` | `scwin.checkBiz` |
| `fn_getKindStkDsclsTitle` | `scwin.getDsclTitle` |
| `fn_readKindStkCorpisuDiscls` | 삭제 — API 없음(§10 #6) |
| `fn_dscl` (+ 임시 `fn_GetPar`/`fn_SetPar`) | `scwin.writeDscl` + `scwin.getDsclData` + 호환 `scwin.getPar`·`scwin.fillDataList` |
| `fn_parentRefresh` | 삭제 — 부모가 팝업 결과로 재조회 |
| `fn_setBzProcsNo` · `fn_getBzProcsNo` | 삭제 — `scwin.getIsuPopupData` 의 `bzProcsNo` |
| `fn_btnShow` | `scwin.setIsuNewButton` |
| `fn_PopFindKindStkExamCorp` | `scwin.openCorpPopup` |
| `fn_OpenKindStkDetailCorpIsu_protect` · `fn_OpenKindStkDetailCorpIsu` | `scwin.openIsuPopup(row, isProtect)` + `scwin.getIsuPopupData` + `scwin.isProtectReg` |
| `btn_coSearch_onclick` · `btn_isuNew_onclick` · `btn_save_onclick` · `btn_dscl_onclick` · `grd_issList_oncelldblclick` · `btn_listNo_onclick` | 같은 이름(try/catch, async) |
| `dma_corpInfoRes_OnLoadCompleted` | `scwin.applyCorpState` |
| `sbx_spotIsuTrdMktTpCd_OnSelChange` | `scwin.applyMktLabel`(이벤트 대신 조회 뒤 호출) |
| `sbm_selectNewListNo_submitdone` | `scwin.selectNewListNo` 안으로 |
| `acntclsMmFormatter` | 같은 이름(값 인자 기준으로 고침) |
| (gform onload 시장 분기) | `scwin.applyMktView` |
| 전역 `fn_GetPar, fn_SetPar`·`clickBzProcsNo`·`TR_JOB`·`rowPos`·`pJsMarket`·`vScrenID` | `scwin.trJob`·`scwin.newMktTpCd`·`scwin.userMkt` 등 1구역 선언, 나머지 삭제 |

## 10. 남은 작업 (TODO)

1. **select-one 의 업무처리번호 없는 호출** — 신규 회사 선택 뒤 `bzProcsNo=""` 로 상장종목현황만 받는다. 서버가 회사코드·상장일만으로 종목을 주는지 확인(§5.4).
2. **등록 응답 구조** — `completeYn` 이 오는지, 실패 시 `success:false` 인지(§5.6).
3. **상장번호 저장** — 등록 요청(`dma_registerReq`)에 `listNo` 키가 없다. [상장번호생성]으로 받은 번호를 서버가 언제 저장하는지 확인(§5.5).
4. **상장처리상태 20** — 원본이 넣던 `listProcsStatCd='20'` 을 서버가 정하는지 확인(§8 #13).
5. **채번 응답 모양** — `$c.stf.getNewBzProcNo` 응답이 문자열인지 `{ bzProcsNo }` 인지(§6.8).
6. **공시용 종목 조회 API** — 원본 `readDisclsData`(공시문 생성용 종목·회사명) 대체 API 가 없어 상장종목현황·법인정보로 넘긴다. 92024 가 기대하는 컬럼과 같은지 확인(§6.11).
7. **ULDSTF92024 계약** — 경로 `/ui/listingcommon/ULDSTF92024.xml` 은 가정. 92024 수신부가 `getParameter()` 로 바뀌면 호환 `getPar`·`fillDataList` 삭제.
8. **유가·코스닥 외 사용자의 신규 시장구분** — 원본 `"A"` 는 코드에 없다. 그 사용자에게 이 화면을 열어 주는지, 기본값을 무엇으로 할지 확인(§8 #6).
9. **기존 건 수정** — 기존 건은 저장이 잠긴다(§8 #10). 상장일을 바꿔야 하면 수정 API 가 필요하다(현재 화면 API 에 없음).
10. **세션 부서코드 키** — `$c.session.getUserInfo("depCd")` 키 이름 확인(개발 사본은 `getUserInfo().depCd`).
