# WebSquare 변환 프로세스 설명서 (구조도 포함)

W-Craft 로 1차 변환된 레거시 WebSquare XML(Gauce/X-Internet 유래)을 **GCC 공통함수 체계(`$c.*`)와 표준 JS 규칙**으로 자동 변환하는 전체 프로세스를 한눈에 설명하는 문서입니다.

> 이 문서는 **개요·구조도** 문서입니다. 규칙·매핑·도구의 세부는 아래 문서를 참조하세요.
>
> | 문서 | 내용 |
> | --- | --- |
> | [websquare_conversion_guide.md](websquare_conversion_guide.md) | 변환 목표·규칙 인덱스 |
> | [conversion_pipeline.md](conversion_pipeline.md) | 2단계 하이브리드 파이프라인 본문(규칙별 Python 처리 방식) |
> | [conversion_rules.md](conversion_rules.md) | 규칙 1~23 상세 정의 |
> | [substitution_map.md](substitution_map.md) | 레거시 → gcc 치환 매핑표 |
> | [dynamic_submission_guide.md](dynamic_submission_guide.md) | 규칙 12 동적 Submission 상세 |
> | [createdialogframe_popup_guide.md](createdialogframe_popup_guide.md) | 규칙 17 팝업 변환 상세 |
> | [stage2_todo_worklist.md](stage2_todo_worklist.md) | 단계 2 잔여 TODO 집계 |
> | [sample_templates.md](sample_templates.md) | 최종 샘플 11종 카탈로그 + 화면 유형 매칭 가이드 (단계 2 정답지) |
> | [conversion_playbook.md](conversion_playbook.md) | 다른 전환 프로젝트 적용 절차(착수 체크리스트) |

---

## 1. 한눈에 보는 전체 흐름

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     W-Craft 변환 프로세스 (End-to-End)                     │
└──────────────────────────────────────────────────────────────────────────┘

   [ 원본 ]              [ 단계 0 ]           [ 단계 1 ]              [ 단계 2 ]           [ 산출물 ]
  Gauce/X-Internet   →   W-Craft 변환   →   Python 기계 치환   →   Claude Code 보강   →   운영 반영
   레거시 화면             (외부 도구)         (결정적/일괄)          (판단/재설계)         WebSquare 화면

        │                     │                    │                       │                   │
        ▼                     ▼                    ▼                       ▼                   ▼
   구 플랫폼 소스        ui/*.xml            ui-tobe/*.xml           ui-tobe/*.xml        src/as-is/**
   (본 저장소 밖)      (1차 변환 결과)      + 미처리 리포트          (규칙 검증 완료)     (배포 대상 트리)
```

* **단계 0 (W-Craft, 외부 도구)** — 구 플랫폼(Gauce/X-Internet) 화면을 WebSquare XML 골격으로 1차 변환. 결과물은 `ui/` 에 놓이며, 스크립트 최상단에 `/* ★Wcraft guide★ 스크립트 수작업 유의사항 */` 마커가 붙어 **수작업 검토 대상**임을 표시합니다. 이 저장소는 이 단계의 **출력물부터** 다룹니다.
* **단계 1 (Python)** — `ui/` 를 입력받아 판단이 필요 없는 결정적 규칙(1~23)을 일괄 적용해 `ui-tobe/` 를 생성하고, 자동 치환하지 못한 항목을 **리포트**로 분리합니다.
* **단계 2 (Claude Code)** — 리포트의 검토/대체 항목, 원시 JSP/jQuery 재설계, 통신 콜백 로직 등 **판단이 필요한 부분만** 보강하고 `npm run lint:xml` 로 검증합니다.

---

## 2. 시스템 구조도 (디렉터리 · 도구 · 단일 출처)

```
src/conversion/
│
├── md/                              ← 프로세스·규칙 문서 (본 문서 포함)
│   ├── conversion_process_overview.md   (본 문서)
│   ├── websquare_conversion_guide.md    (규칙 인덱스)
│   ├── conversion_pipeline.md           (2단계 파이프라인 본문)
│   ├── conversion_rules.md              (규칙 1~23 상세)
│   ├── substitution_map.md              (치환 매핑표)
│   ├── dynamic_submission_guide.md      (규칙 12)
│   ├── createdialogframe_popup_guide.md (규칙 17)
│   ├── stage2_todo_worklist.md          (단계 2 TODO)
│   ├── sample_templates.md              (최종 샘플 카탈로그 — 단계 2 정답지)
│   └── conversion_playbook.md           (다른 프로젝트 적용 절차)
│
├── tools/                           ← 변환 엔진 (Python, 무의존성 stdlib)
│   ├── convert.py       ── 단계 1 핵심 변환기(영역 분리 + 규칙 1~23 + 리포트)
│   ├── convert_all.py   ── 배치 드라이버(모듈 순회 · 멱등성/well-formed 검증 · 집계, --force 재생성)
│   └── gcc_mapping.py   ── 치환 매핑 로더(SOT 파싱)
│
├── sample-front/                    ← 최종 샘플 작업 공간
│   └── ui/          ← gcc 공통함수 활용 최종 샘플 11종 (화면 유형별 표준 템플릿 — 단계 2 정답지)
│
└── next-krx-lds-{fil,mgt,stf,tms}-front/   ← 모듈별 변환 작업 공간
    ├── ui/          ← 입력: W-Craft 1차 변환 원본 (단계 0 산출)
    └── ui-tobe/     ← 출력: 단계 1 기계 치환본 → 단계 2 보강본

         [ 단일 출처(SOT) — 도구가 참조 ]
         ├── src/docs/api/{fil,ins,mgt}/index_transfer.html  → gcc_mapping.substitution_dict()
         ├── src/as-is/{fil,ins,mgt,stf}/gcc/*.xml (JSDoc)    → gcc_mapping.module_fn_dict()
         └── src/docs/api/gcc/index.html                       → 치환 함수 시그니처 확인(단계 2)
```

**대상 모듈 4종**

| 모듈 | 작업 공간 | 업무 영역 |
| --- | --- | --- |
| **fil** | `next-krx-lds-fil-front` | 파일링(ELW/ETN/디지털/예비상장), `bnf`(채권) · `inf`(발행사/코드설정) 하위 트리 |
| **mgt** | `next-krx-lds-mgt-front` | 상장·파일링 관리 화면 |
| **stf** | `next-krx-lds-stf-front` | 증권/상장 플로우(신규상장·ETN/ELW/채권/디지털 접수) — 최대 모듈 |
| **tms** | `next-krx-lds-tms-front` | TMS 화면 |

**최종 샘플 폴더 (`sample-front/ui/`)**

- gcc 공통함수(`$c.*`)만으로 화면을 구성한 **최종 샘플 11종**을 보관한다 — 목록 조회+페이징, 작성(등록·수정), 탭+입력 계산, 입력폼+팝업조회+첨부저장, 조회 팝업, 메일 발송 팝업, 엑셀 다운로드 등 **화면 유형별 표준 템플릿**.
- 모든 샘플은 5단계 정형화 구조와 서브미션 async/await 순차 실행 규약을 따르는 **단계 2 보강의 도달 목표(정답지)**다. 전환 대상 화면의 유형을 샘플에 매칭해 구조·공통함수 사용을 정렬한다.
- WebSquare 서버 배포 경로는 `/ui/sample/template/*.xml`. 파일 목록·원본 화면·유형 매칭 표·표준 패턴 상세는 [sample_templates.md](sample_templates.md) 참조.

---

## 3. 단계 1 상세 — 영역 분리 후 규칙 적용

WebSquare XML 은 `head → script(CDATA) → body` 구조이며, 영역마다 변환 성격이 달라 **먼저 3영역으로 분리한 뒤 영역별 변환기**를 적용합니다.

```
                     ┌─────────────────────────────────────────────┐
   ui/화면.xml  ───▶ │  영역 분리 (정규식/문자열 인덱스 · 결정적)   │
                     └─────────────────────────────────────────────┘
                        │                │                │
              ┌─────────┘        ┌───────┘        └────────┐
              ▼                  ▼                         ▼
      ┌──────────────┐   ┌──────────────┐         ┌──────────────┐
      │  HEAD (xml)  │   │ SCRIPT (js)  │         │  BODY (xml)  │
      │ meta_* /     │   │ CDATA 내부   │         │ UI 마크업 +  │
      │ dataCollection│  │ 전역·함수 JS │         │ ev:on* 속성  │
      │ submission   │   │              │         │              │
      └──────┬───────┘   └──────┬───────┘         └──────┬───────┘
             │ 규칙 6           │ 규칙 1·2·4·5·7·8·9      │ 규칙 3·10
             │                  │ 11·12·13·14·16·17       │ (핸들러명 동기화,
             │                  │ 20·20b·21               │  이벤트요소 삭제)
             └──────────┬───────┴─────────────────────────┘
                        ▼
              ┌───────────────────────┐
              │  규칙 1~23 결정적 치환 │  ← 문자열/주석/정규식 리터럴 보호
              │  (판단 불필요 1:1)     │  ← 단어경계 매칭 · 멱등성 보장
              └───────────┬───────────┘
                          ▼
              ┌───────────────────────┐
              │  포매팅 후처리         │  W-Craft 마커 정렬 · 함수 빈 줄 · 주석 컬럼0
              └───────────┬───────────┘
                          ▼
         ┌────────────────┴────────────────┐
         ▼                                 ▼
  ui-tobe/화면.xml                   미처리 리포트
  (변환본)                           (검토/대체 태그 · 시그니처 불일치 ·
                                      매핑표 미존재 · 충돌 함수)
                                              │
                                              └──▶ 단계 2 입력
```

**핵심 원칙**

* **결정적(deterministic)**: 입력이 같으면 출력이 항상 같은 1:1 규칙만 Python 이 처리.
* **단어경계 매칭**: `\b함수명\s*\(` 로 호출부만 매칭 — 부분 문자열 오치환 방지.
* **멱등성(idempotent)**: 변환본을 다시 돌려도 결과 동일(예: `scwin.vScrenID` 중복 삽입 금지). `convert_all.py` 가 2-pass 동일성으로 검증.
* **리터럴 보호**: `==`→`===` 등은 문자열/정규식/주석 내부를 건드리지 않음. body 의 한글 UI 텍스트(`<xf:label>`)는 절대 치환 대상 아님.
* **산출물 3종**: ① 변환본 XML ② 전/후 diff ③ **미처리 리포트**(단계 2 입력).

---

## 4. 변환 규칙 요약 (규칙 1~23)

각 규칙의 상세 정의는 [conversion_rules.md](conversion_rules.md), Python 처리 방식은 [conversion_pipeline.md](conversion_pipeline.md) 참조.

| 규칙 | 영역 | AS-IS → TO-BE |
| --- | --- | --- |
| 1 | SCRIPT | 파일명 변수 `scwin.vScrenID = "{파일명}";` 최상단 삽입 |
| 2 | SCRIPT | 전역 리터럴 변수를 `// 전역 변수 선언` 구역으로 이동 |
| 3 | BODY+SCRIPT | 이벤트 핸들러명 소문자화 + `ev:on*` ↔ 스크립트 함수 동시 동기화 |
| 4 | SCRIPT | **5단계 정형화 구조** 재배치(1 선언 → 2 초기화 → 3 이벤트 → 4 서브미션 콜백 → 5 일반) + 블록 헤더, `gform_onload`→`onpageload` 병합 |
| 5 | SCRIPT | `==`→`===`, `.value=`→`.setValue()`, `.src=`→`.setBackgroundImage()`, `getTotalRow()`→`getRowCount()` |
| 6 | HEAD+SCRIPT | `<xf:submission>` + `execute(id)` → `sbmOptions` + `const sbmRtn = await executeDynamic()`(async/await 순차) + 노드 삭제 |
| 7 | SCRIPT | 태그 없는 레거시 함수 1:1 치환 `fn_Trim(`→`$c.str.trim(` |
| 7m | SCRIPT | 레거시 메서드 `{obj}.CloseFrame()` → `$c.win.closePopup()` (수신 객체 제거) |
| 7n | SCRIPT | 같은 ns 이름 정규화 `$c.stf.fn_setFromToDate(`→`$c.stf.setFromToDate(` |
| 8 | SCRIPT | `var` → `const`/`let` (재할당 분석) |
| 9 | SCRIPT | `$c.cm.ShowWin/CloseWin/ShowNoData` 등 불필요 단독 호출 삭제 |
| 10 | BODY | `<xf:events>…</xf:events>` 블록 삭제(규칙 3 로 대체됨) |
| 11 | SCRIPT | `include(...)` 라인 삭제 (gcc 는 `$c.*` 로 제공) |
| 12 | SCRIPT | `{DC}.DataID=url` + `{DC}.reset()` → `sbmOptions` + `await executeDynamic()`(순차) |
| 13 | HEAD+SCRIPT+BODY | `scwin.fn_*` 정의 정규화(`fn_` 제거 + camelCase) + 정의·호출·publicInfo 동기화 |
| 14 | SCRIPT | `$c.ns.showObj/getObjectValue/setObjectValue/removeRow` → `.show()/.getValue()/.setValue()/.removeRows()` |
| 15 | SCRIPT | `$c.ns.alert_error` → `$c.win.alert` |
| 16 | SCRIPT | Gauce trs `Action/KeyValue/Parameters/Post()` → `sbmOptions` + `await executeDynamic()`(순차) |
| 17 | SCRIPT | `CreateDialogFrame(8인자)` → `$c.win.openPopup(url, options, data)` (window→browserPopup / 그 외→pageFramePopup) |
| 18 | SCRIPT | `$c.ns.getSysDate/getCookie` 등 → `$c.date/util.*` (네임스페이스 재배치) |
| 19 | SCRIPT+BODY | (단계 2) 원시 JSP/jQuery DOM → WebSquare 컴포넌트 재설계 |
| 20 | SCRIPT | `{grid}.advancedExcelDownload(opts)` → `$c.data.downloadGridViewExcel(grid, opts)` (수신 객체 첫 인자 승격) |
| 20b | SCRIPT | `downloadGridViewExcel(grid, name, sheet, type)` 위치인자 → `(grid, {fileName, type})` 객체 정규화 |
| 21 | SCRIPT | `{frame}.Provider("../")` → `$c.win.getParent()` |
| 22 | SCRIPT+BODY | `tbl_search`/`tbl_Search` 검색테이블에 Enter 키 → 검색 핸들러 자동 바인딩(onpageload) |
| 23 | SCRIPT | `{grid}.setVisibleRowNum("all")` → `$c.util.setGridVisibleRowNum(grid, "all")` (엔진은 숫자 전용 — "all" 거부) |

> 규칙 6·12·16·17 은 **정적/단순 케이스만** 자동 변환하고, 동적 action·비리터럴 URL·표현식 인자 등은 **미변환 리포트 → 단계 2** 로 넘깁니다. 규칙 15·18·19 는 판단 비중이 커 주로 단계 2 대상입니다.

---

## 5. 단계 2 상세 — Claude Code 보강

Python 이 남긴 **"추가 작업 목록"만** 사람/AI 판단으로 처리합니다.

```
   미처리 리포트  +  // TODO Stage2: 주석
          │
          ▼
   ┌──────────────────────────────────────────────────────────┐
   │ ① 검토 태그 매핑  : 시그니처·기본값·반환형 다른 함수 조정   │
   │    (toNum→$c.num.parseFloat, cIsBupin→$c.str.isBizID …)   │
   │ ② 대체 태그 매핑  : 원시 XHR/sendMessage → $c.sbm.execute  │
   │    jQuery $() → $c.util.getComponent · 콜백 구조 재설계     │
   │ ③ 규칙 19 재설계  : 원시 JSP/jQuery 페이지 → <w2:*> 컴포넌트│
   │ ④ 인자 형태 변환  : 날짜 가감 방향·포맷 규칙·반환 타입 차이 │
   │ ⑤ 모호·충돌 해소  : 파일마다 다른 의미·커스텀 로직 판정     │
   │ ⑥ 팝업/통신 보강  : popup data 채움·result 처리·submitDone │
   │ ⑦ 0-based 인덱스  : Gauce 1-based → WebSquare 0-based 조정  │
   │ ⑧ 샘플 매칭 보강  : 화면 유형을 최종 샘플 11종에 매칭해     │
   │    구조·공통함수 사용을 샘플 수준으로 정렬 (sample_templates)│
   └──────────────────────────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 검증: 의미 보존 확인 · 잔존 레거시 grep 점검               │
   │       npm run lint:xml (wsxml_lint) 통과                   │
   └──────────────────────────────────────────────────────────┘
          │
          ▼
   운영 반영 대상 ui-tobe/*.xml
```

**잔여 TODO 추적** — 화면 실행(런타임)·업무 로직 판단이 필요해 보류한 항목은 코드에 `// TODO Stage2:` 주석으로 남기고 모듈·유형·파일·라인별로 [stage2_todo_worklist.md](stage2_todo_worklist.md) 에 집계합니다(자동 생성). 항목 해결 시 코드 주석 제거 + 워크리스트 갱신.

**샘플 기준 보강(⑧)** — 단계 2 보강의 도달 목표는 [sample_templates.md](sample_templates.md) 의 최종 샘플 11종입니다. 전환 대상 화면의 유형(목록+페이징, 작성, 팝업, 탭, 엑셀 등)을 매칭 표에서 찾아 해당 샘플의 5단계 구조·async/await 서브미션·검증(`$c.validate.*`)·페이징(`setPagingInfo`) 사용 방식과 일치하도록 정렬합니다.

---

## 6. 역할 분담 요약

```
┌────────────────────────┬────────────────────────────────────────────┐
│  Python (단계 1)        │  Claude Code (단계 2)                       │
├────────────────────────┼────────────────────────────────────────────┤
│  양 · 일관성 · 속도     │  판단 · 재설계 · 검증                        │
│  결정적 1:1 치환·재배치 │  검토/대체 매핑 · 통신 재작성 · 최종 확인    │
│  규칙 1~23 자동 처리    │  리포트/TODO 해소 · 규칙 19 재설계 · lint    │
└────────────────────────┴────────────────────────────────────────────┘
```

---

## 7. 실행 방법 (권장 순서)

```powershell
# 단계 1 — 단일 파일 변환
python src/conversion/tools/convert.py <src.xml> [out.xml]

# 단계 1 — 모듈 일괄 변환 (fil / mgt / stf / tms, 인자 생략 시 전체)
python src/conversion/tools/convert_all.py [module]

# 단계 1 — 규칙 개정 후 전체 재생성 (기존 산출물 덮어씀 — 수기 보강 유무 사전 확인)
python src/conversion/tools/convert_all.py --force [module]

# 단계 2 — 리포트/TODO 보강 후 검증
npm run lint:xml        # src/gcc 엄격 + src/as-is 레거시(WS111~113 무시) 모두 0 경고 유지
```

1. **(Python)** 대상 파일을 HEAD/SCRIPT/BODY 3영역으로 분리.
2. **(Python)** 단계 1 결정적 규칙 일괄 적용 → 변환본 + 미처리 리포트 생성.
3. **(Claude)** 리포트의 검토·대체 항목을 [substitution_map.md](substitution_map.md) 와 `gcc/index.html` 시그니처 기준으로 보강.
4. **(Claude)** 잔존 레거시 호출을 grep 으로 점검, 의미 검증 후 `npm run lint:xml` 로 마무리.

> `convert_all.py` 는 이미 존재하는 `ui-tobe/` 출력은 **건너뛰어 단계 2 수작업을 보존**합니다. 새 규칙을 반영할 때는 기존 정리본 위에 규칙을 적용하는 것이 원칙이며, `--force` 재생성은 **수기 보강이 없음을 확인한 경우에만** 사용하세요(2026-08-21 4개 모듈 전체 재생성이 그 사례 — 당시 ui-tobe 는 구버전 기계 산출물뿐이었음).

---

## 8. 배경 — UI 공통 프레임워크·공통함수·공통개발자의 필요성

본 변환 프로세스가 레거시 호출을 gcc 공통함수(`$c.*`) 체계로 수렴시키는 이유이기도 합니다. 웹스퀘어(WebSquare) 기반의 UI/UX 프로젝트에서 **UI 공통 프레임워크의 도입과 이를 관리할 공통개발자의 존재는 프로젝트의 성공과 직결되는 핵심 요소**입니다. 이는 화면 개발자뿐만 아니라 **공통개발자 자체의 생산성 및 품질 체계화**를 위해서도 절실히 필요합니다.

### 8.1 UI 공통 프레임워크가 절실히 필요한 이유

프로젝트 초기에 공통 프레임워크를 바닥부터(Scratch) 새로 만들 경우, 구조 설계 및 검증에 막대한 시간과 리소스가 소모됩니다. 따라서 이미 정형화되고 검증된 **UI 공통 프레임워크 도입이 절실한 이유**는 다음과 같습니다.

**① 공통개발자의 개발 생산성 향상 및 초반 프로젝트 일정 준수**

* **공통개발자의 재발명(re-invent) 방지**: 공통개발자라 하더라도 매 프로젝트마다 통신, 세션, 권한, 메시지 처리, 그리드 제어 등의 기본 구조를 새로 구현하는 것은 비효율적입니다.
* **초기 구축 공수 대폭 단축**: 정형화되고 체계화된 UI 공통 프레임워크를 활용하면 공통 개발진이 **프로젝트 초기에 공통 아키텍처를 구축하는 기간을 획기적으로 단축**할 수 있습니다. 이를 통해 화면 개발자들이 조기에 개발에 착수할 수 있는 기반을 마련해 줍니다.

**② 공통 영역의 체계화 및 향후 유지보수의 극대화 (Single Point of Management)**

* **공통 코드의 표준화**: 공통개발자가 작성하는 코드 역시 프레임워크라는 표준화된 틀 안에서 관리되므로, 공통 코드 자체의 가독성과 구조적 완성도가 높아집니다.
* **유지보수 용이성**: 향후 엔진 업데이트, 웹 표준 변경, 공통 정책 변경(보안, 통신 암호화, 로그 정책 등)이 발생하더라도 **체계화된 공통 프레임워크 및 공통함수 단 한 곳만 수정**하면 프로젝트 전체에 안정적으로 일괄 적용됩니다.

### 8.2 공통함수 위주의 개발 환경을 구성해야 하는 이유

**① 개발자 역량 격차 극복 및 표준화된 품질 보장 (템플릿화)**

* **현실적인 인력 구조 반영**: 프로젝트 현장에는 모든 개발자의 숙련도가 높지 않으며, 초/중급 등 상대적으로 역량이 낮은 개발자의 비중이 훨씬 높습니다.
* **템플릿을 통한 품질 제어**: 데이터 조회/저장, 그리드 연동, 팝업, Validation 등 자주 쓰이는 패턴을 공통함수로 템플릿화하여 제공해야 합니다. 개발자는 복잡한 스크립트를 직접 작성하지 않고 정해진 공통 API를 호출함으로써 **개발자의 역량 수준과 상관없이 일정한 고품질의 결과물**을 도출할 수 있습니다.

**② 화면 간 코드의 일관성 유지**

* 개발자 개인의 취향이나 작성 스타일에 따라 코드가 파편화되는 것을 방지합니다. 수백 개의 화면 코드가 동일한 패턴과 일관성을 유지하므로, 타 개발자가 만든 화면을 인수받더라도 즉시 이해하고 수정할 수 있습니다.

**③ 신규 기능 추가 및 수정의 효율성 (단일점 수정)**

* 기능 추가나 로직 변경 시 개별 화면을 찾아다니며 수정하는 것이 아니라, **공통함수 내부만 수정하여 모든 화면에 일괄 반영**할 수 있어 개발 및 테스트 공수가 대폭 감소합니다.

### 8.3 공통개발자의 역할 및 책임 (R&R)

체계화된 UI 공통 프레임워크 위에서 공통개발자는 단순한 코드 작성을 넘어 프로젝트 전체 UI 아키텍처를 리드하는 핵심 역할을 수행합니다.

1. **UI 공통 프레임워크 기반의 공통 API 구축** — 체계화된 프레임워크를 바탕으로 프로젝트 맞춤형 공통 라이브러리(통신, 그리드 제어, 데이터 변환, 팝업, 파일 처리, 공통 콤보 등)를 신속하게 커스텀 및 확장 개발합니다.
2. **개발 표준 템플릿 및 가이드 제공** — 역량이 낮은 화면 개발자도 쉽게 활용할 수 있도록 **표준 패턴별 샘플 화면(Snippet, CRUD 템플릿)** 및 공통함수 사용 가이드 문서를 작성하여 배포합니다.
3. **공통 영역 일괄 유지보수 및 릴리즈 관리** — 화면 수정 없이 **공통함수/프레임워크 수준에서 이슈 수정 및 개선 작업을 일괄 수행**하여 프로젝트 전체의 안정성을 유지합니다.
4. **화면 개발자 기술 지원 및 성능 최적화** — 화면 개발자가 겪는 웹스퀘어 특화 이슈, 스크립트 오류, 통신 장애 등을 해결하는 멘토링을 수행하고, 대량 데이터 처리 시 발생하는 그리드 렌더링 지연, 메모리 누수 등 성능 이슈를 공통 차원에서 분석·가이드합니다.

### 8.4 결론 요약

> **"체계적인 UI 공통 프레임워크와 공통개발자의 조합은 프로젝트 성공의 필수 보증수표입니다."**
>
> 1. **공통개발자**는 검증된 **UI 공통 프레임워크**를 사용하여 **프로젝트 초기 구축 일정을 획기적으로 단축**하고 공통 구조의 안정성을 확보합니다.
> 2. 이를 바탕으로 제공되는 **공통함수 및 템플릿**은 **개발자 역량 편차에 영향을 받지 않는 일정한 고품질 화면**을 생산하게 합니다.
> 3. 결과적으로 신규 기능 추가나 수정 시 **공통함수 한 곳만 수정함으로써 향후 유지보수의 용이성을 극대화**할 수 있습니다.
