# jsp-front — KRX 상장공시 제출시스템(JSP) 전환 작업 폴더

JSP 원본 화면을 WebSquare 로 옮기는 작업의 두 갈래가 한 폴더에 있다.

| 폴더 | 무엇 | 상태 |
|---|---|---|
| `ui/` | **공급사 13차 최종 전달본(2026-09-30, `16bf420e194` · `dep20260930_095541`)의 원본** — `jld*`/`uld*` 접두 화면 1,677본. 내용 무수정(반입 커밋 그대로) | 원본. **손대지 않는다** |
| `ui-tobe/` | `ui/` 를 우리 규칙(퍼블리싱·conversion·code convention)으로 전환한 산출 | 1,677본 전량(기계 단계 완료 2026-10-02, Stage 2 판단 보강 전) |
| `r13/` | 공급사 전달 문서 — `README.md`(13차 안내서) · `MD5SUMS.txt` · `_meta/`(치환 대응표 `krx-tobe.yaml`, `fn_*` 재고, 규약 계수표, forward 판별표) | 참고 자료 |
| `krx_소스전환/` | 2026-09 초 공급사 자동 산출 33화면(옛 판) | 역사. 정비 기준 비교용 |
| `jsp_소스전환/` | 위 31화면을 우리가 손으로 정비한 **정비본 + 화면별 수정가이드 + conversion-report** | **파일럿 정답지** |

전달본에서 뺀 것(2,216 → 1,677): `pop*`·`sub*`·`menu*`·`top*`·`login*` 등 셸·팝업 조각 539본과 `_commons/` 공용 자산 8본
(공급사 gcc 번들은 우리 `cm/gcc` 의 2026-08-04 스냅샷 — 정본은 `cm/gcc`). 필요하면 원본 zip(`krx-prod-full-20260930-r13.zip`)에서 꺼낸다.

## 전환 규칙(이 폴더에 고정)

- **pcc 참조**: `jld*`·`uld*` 화면은 `cm/pcc/fil`, `uldmgt*` 는 `cm/pcc/mgt` 만 참조한다(사용자 지시 2026-09-21).
  pcc/fil 에 없는 `$c.lc`·`$c.frame`·`$c.cm.fn_*` 류는 gcc 치환 우선, 남는 것은 화면 로컬 헬퍼 + `// TODO Stage2:`.
  pcc/fil 반입은 보류 지시(2026-09-30)가 있어 사용자가 열기 전에는 하지 않는다. 도구 쪽 매핑은 `screen_tools.PCC_BY_PREFIX`.
- **공급사 "드러냄" 표지**(`[sdd]` 콘솔 · `throw { bizMessage }` · `unresolved:` 주석)는 결함이 아니라 전환 미완 자리의
  표식이다. 지우지 않고 `// TODO Stage2:` + `conversion/md/stage2_todo_worklist.md` 집계로 흡수한다.
- **원본 보존**: `ui/` 는 git 에 반입 커밋돼 있다. 전환은 반드시 `ui-tobe/` 에 쓴다(`convert_all.py jsp-front`).
  제자리 변환으로 원본 복구 수단을 잃었던 교훈(2026-09-22 fil 10화면)의 재발 방지.

## 파이프라인 — `python conversion/tools/jspfront_pipeline.py <name|폴더> ...`

```
ui/<name>.xml
  1 vendor_postprocess.py  공급사 관용구 접기 V1~V20 (규칙 33)  ← convert 보다 먼저(규칙 13 충돌 개명·규칙 4 보류 원인 제거)
  2 convert.convert        Stage 1 기계 치환(규칙 1~32)
  3 screen_convention.py   jsdoc·await·reindent·unused·finalize
  4 convert 수렴            결과가 안 바뀔 때까지(최대 3회) — 3 이 규칙 4 보류를 풀면 다음 회차에 재정렬된다
  5 publish_normalize.py   body 퍼블리싱 정규화 P1~P11 (규칙 34, lxml)
  6 convert 수렴
  7 gate_screen.py         정적 게이트(node --check·publicInfo↔정의·ev:on↔정의·컴포넌트 참조↔id·미정의 $c·미사용 전역·레거시 토큰)
→ ui-tobe/<name>.xml
```

보조 도구: `scan_mixed_compare.py`(규칙 5a 회귀 후보) · `init_restructure.py`(onpageload 인라인 초기화 분리 — 공급사 산출은 이미 init_* 구조라 대개 불필요) ·
`python -m wsxml_lint conversion/jsp-front/ui-tobe`(strict) · `pytest conversion/tools`. 규칙 본문은 각 도구의 머리 주석과
`conversion/md/conversion_rules.md` 규칙 33·34.

## 1단계 파일럿 결과(2026-10-01, 33화면 = `krx_소스전환/` 명부)

| 잣대 | 값 |
|---|---|
| 파이프라인 | 33/33 완주 · 게이트 **33/33 OK** · convert 수렴 1회 이내 · `wsxml_lint` strict **0 errors / 0 warnings** |
| 테스트 | `pytest conversion/tools` 104 passed(신규: `test_screen_tools.py` 7 · `test_jspfront_tools.py` 4) |
| 정답지 대조 | jldfil25900 ↔ 정비본·가이드 샘플: 스크립트는 정비본과 같은 꼴(init_* 동기화·tx 단순화·selectModifiyDate 개명·TODO 명부), body 는 pageFrame·tblbox·titbox/rt·gvwbox 까지 기계로 도달. 남는 차이는 전부 판단 영역(아래) |

**Stage 2 잔여 명부(ui-tobe 33본 실측)** — 기계가 닫지 못해 화면별 판단이 필요한 자리:

| 축 | 규모 | 무엇 |
|---|---|---|
| `TODO Stage2` 주석 | 69자리 / 29화면 | 컨텍스트 키 출처(A-3) 12 · 파라미터 수신 대상 없음 10 · 부모 스코프 없음 9 · 행 복사 대상 부재 8 · 공급사 bizMessage 7 · 미실현 동작(set_visible/label/focus) 10 · 세션 키 2 · 폼 action 사문 2 … |
| jQuery `$(` | 48(35700c) · 24(20000) · 14(25910) · 3·3·2·1 | 규칙 19 — name→id 실측 매핑(09-07 지식 재사용) |
| `document.` | 39자리 / 10화면 | 규칙 19 |
| `$c.util.fieldEl` | 32자리 / 1화면(35700c) | DOM 요소 계약 → 컴포넌트 계약(README §2-2 fieldEl 잔존) |
| `#if_*` 조건 래퍼 | 32 / 12화면 | 스크립트 show/hide 로 재설계 |
| `#c_choose_*` 래퍼 | 29 / 4화면(59410 에 21) | 같음 |
| `lybox` 레거시 레이아웃 | 3화면 | 표형 그리드·레이아웃 재구성 |
| 안내문(`td_16` 류 `__html`) | 화면별 | `msgbox/txt_list` 분해 + 연도 값 `txt_thisYear` 식 추출(가이드 샘플 꼴) |
| hidden `ipt_*` | 25900 3 · 35700c ~200 … | 스크립트가 DOM 으로 쥔 입력 — dataMap 접근으로 옮긴 뒤 삭제 |

**유형별 기계 처리율(파일럿)**: 단순 조회+그리드(25900·59400·52110·52120)와 탭 본문 소형(357xx 대부분)은 TODO 1~4 로 거의 닫힘,
입력폼(25910·52100·59410)은 조건 래퍼·hidden 입력·jQuery 가 남고, 대형 계산 화면(35700c 5.5k 줄)은 fieldEl·jQuery 80건이 남는다.
2단계 전량 적용 순서(계획서 §3)는 이 분포 그대로 유효하다.

## 2단계 전량 결과(2026-10-02, 1,677화면 = 파일럿 33 + 나머지 1,644)

| 잣대 | 값 |
|---|---|
| 파이프라인 | 접두별 7배치 + 재처리, 1,677/1,677 완주 · 게이트 **1,677/1,677 OK** · 수렴 실패 0 · fatal 0 · 약 3.4초/화면(총 ≈ 95분) |
| `wsxml_lint` strict | **1,677 files, 0 errors, 0 warnings** |
| 테스트 | `pytest conversion/tools` 107 passed |
| 배치 중 보강한 규칙 | V16 확장(재선언)·V21(`$c.cm` 헬퍼)·V22(이중 정의)·V23(공급사 pcc 의존)·head 키 중복 제거(WS120)·게이트 todo 분류(`$c.cm/lc/frame/utils/fil`·`refs_missing`·`fn_ def`·`new Array(n)` 은 보고만) |
| 배치별 1차 통과율 | jldods 88% → jldinf 96% → jlddst 99.5% → jldstf 75%(공급사 pcc 의존 집중) → jldbnf 100% → uldmgt 97% → jldfil 99.7%; 실패 유형마다 규칙을 넓혀 재처리로 전부 닫음 |

**Stage 2 잔여 명부(ui-tobe 1,677본 실측 — 화면별 판단이 필요한 자리)**

| 축 | 자리 / 화면 | 무엇 |
|---|---|---|
| `TODO Stage2` 주석 | 5,673 / 1,475 | 상위: 부모 화면 스코프 없음 1,154 · 전환 미완(공급사 bizMessage) 769 · 행 복사 대상 부재 671 · 미실현 set_focus 591 · 파라미터 수신 대상 없음 528 · 컨텍스트 키 출처(A-3) 515 · 공급사 pcc 의존 427 · `$c.cm.fn_*` 83 · 세션 키 59 · 폼 action 사문 37 |
| jQuery `$(` | 7,322 / 516 | 규칙 19 — jldinf 2,470 · jldfil 1,828 · jlddst 1,559 · jldods 755 |
| `document.` | 3,733 / 872 | 규칙 19 — jldfil 2,345 |
| hidden `xf:input` | 4,485 / 833 | 스크립트가 DOM 으로 쥔 입력 → dataMap 접근 전환 후 삭제 |
| `#c_choose_*` 래퍼 | 3,007 / 316 | JSTL 조건 이월 → 스크립트 show/hide |
| `#if_*` 래퍼 | 2,631 / 373 | 같음 |
| `lybox` 레거시 레이아웃 | 575 / 319 | 표형 그리드·레이아웃 재구성(jldfil 494) |
| `$c.util.fieldEl` | 239 / 33 | DOM 요소 계약 → 컴포넌트 계약(jldfil 213) |
| 미정의 `$c`(todo) | — | `$c.lc.fn_isProcess` 92화면 · `$c.frame.CreateDialogFrame` 19 · `$c.fil.SCREN_PROCS_TP_CD_*` 25 · `$c.cm.fn_CheckDateGn` 15 · `fn_ChkZipCd` 14 · `$c.lc.fn_alertMsg` 12 · `$c.fil.doLogSave` 9 · `$c.frame.Provider("../../"|"/top")` 9 |
| body 에 없는 참조 | 39 / 26 | 서버 렌더 hidden·동적 조립(공급사 README 「화면에 없는 필드」) |

접두별 밀도: jldinf 가 jQuery 비중이 가장 높고(2,470), jldfil 이 `document.`·조건 래퍼·lybox·fieldEl 의 대부분, jldstf 는 공급사 pcc 의존(`$c.lc`·`$c.fil` 상수)이 집중된다.
공급사 "드러냄" 표지는 전부 TODO 로 남아 있으며 화면 알림은 유지된다(삭제 0).

## 3단계 검증·인계(2026-10-02)

| 항목 | 결과 |
|---|---|
| `wsxml_lint` strict, `ui-tobe` 1,677본 | 0 errors / 0 warnings |
| `pytest conversion/tools` · `pytest tools/wsxml_lint` | 107 passed · 28 passed |
| CI 기준선(`cm/gcc` strict · `cm/as-is` 3규칙 무시) | 13 files 0/0 · 227 files 0/0 — 영향 없음 |
| `ui/` 무변경 | 반입 커밋(48743b9) 대비 diff 0 |
| 샘플 대비 스팟 체크 | jldfil25900 ↔ JLDFIL25900/정비본(1단계) · jldfil59400·jldfil25910 을 읽기 전용 리뷰 에이전트가 원본·정비본과 대조 — **파이프라인 회귀 4건** 발견 후 도구를 고쳐 전량 재생성(아래) |
| 브라우저 표본 확인 | **보류** — 공급사 README 기준 489화면은 서버 렌더 값 없이는 비어 보이고, 저장소에는 서버가 없다. 실서버 연결 환경에서 `websquare.html?w2xPath=/shell/entry.xml&page=/<화면>/<화면>.xml` 로 유형별 대표 화면(25900·59400·25910·35700·52110·20000)부터 확인할 것 |
| Stage 2 워크리스트 | `conversion/md/stage2_todo_worklist.md` 에 jsp-front 유형별 집계 절 추가(`gen_stage2_worklist.py` 가 블록 주석 TODO 도 센다) |

**리뷰에서 잡힌 파이프라인 회귀와 처방(2026-10-02)**

| # | 회귀 | 원인 | 처방 |
|---|---|---|---|
| 1 | 페이징 건수가 `NaN`(59400), 파일 미선택 저장 실패(25910) | convert 규칙 5a 가 `!= null` 을 `!== null` 로 바꿔 `undefined` 가 가드를 통과 | `convert(keep_nullish=True)` — 파이프라인은 `== null`/`!= null` 관용구를 보존(라이브러리 프로파일과 같은 처리). 게이트의 느슨 비교 토큰도 nullish 는 제외 |
| 2 | `init_conds`/`init_attrReals` 의 바인드 하나가 throw 하면 onpageload 전체 중단 | V3/V4 가 바인드별 try/catch 를 걷어냄 | 표준 forEach 몸통에 바인드별 try/catch 복원(`handleError(notify:"none")`, 동기) |
| 3 | 호이스팅한 컨텍스트 전역(`loadTp`)이 파라미터 수신 전에 빈값 | V20 이 onpageload try 선두에 삽입 | `scwin.init_recvParam();` 뒤에 삽입 |
| 4 | 실패 블록 뒤에 후처리가 있는 tx(`tx_viewDetail`)는 옛 try/catch + skipped 가드 없음 | V6 정규식이 `return res;` 로 끝나는 꼴만 매칭 | 변형 꼴도 매칭(if 안 `return res;` 유지, 후처리 보존) |

리뷰가 함께 적은 **원본 유래(공급사) 결함** — 우리 회귀가 아니라 Stage 2 명부: 25910 `init_conds` 의 `registerBtn/registerBtn_2` 중복 항목(뒤가 앞을 덮음), 59400 `slc_pageSize` 가 `dma_viewDetailReq` 에 바인딩됐는데 조회는 `dma_SearchReq` 로 나감, `setCount(…/10)` 이 선택한 페이지 크기를 무시, `editStatus` 실패가 호출부 `notify:'none'` 때문에 조용함.

**인계 — 다음 사람이 할 일(권장 순서)**: ① 규칙 하나로 묶이는 축부터 — `$c.lc.fn_isProcess`(92화면, executeDynamic `skipped` 가드로 대체 후보)·폼 action 사문 주석 삭제·`$c.cm.fn_*` 치환 방향 결정 ② 회신 의존 축(컨텍스트 키 A-3·세션 키·bizMessage 목적지) ③ 화면별 재설계 축(jQuery/`document.`→규칙 19, 조건 래퍼→show/hide, hidden 입력→dataMap, lybox 표형 그리드, fieldEl 계약 전환). 변환 도구를 고쳐 전량 재생성하는 것이 원칙이며(`ui-tobe` 는 수기 보강 전까지 재생성 가능), 수기 보강을 시작한 화면은 `convert_all.py` 의 "기존 산출물 건너뜀" 규약대로 보호한다.

**알아 둘 함정(1단계에서 확인)**: 규칙 13 이 `fn_modifiyDate→modifiyDate` 로 상태 변수를 덮는다(V13 선개명) · 공급사 `var` 중복 선언이 규칙 8 로
`let` 중복이 된다(V16) · 최상위 `getComponent` 호출 전역이 규칙 4 를 보류시킨다(V20) · lxml 왕복은 `<x></x>`→`<x/>`·속성 `>`→`&gt;` 만 바꾼다 ·
PowerShell 5.1 `Out-File` 의 BOM 이 커밋 제목에 섞인다.

## 기준선(2026-10-01, `ui/` 1,677본)

| 잣대 | 값 |
|---|---|
| `wsxml_lint ui` (strict) | 1,677 files · **1,179 errors / 320 warnings** — errors 는 전부 **WS120**(gridView·dataList 안 중복 id, 162화면 — 규칙 27 대상). warnings: WS112 214 · WS113 101 · WS201 5 |
| `convert.py` 단건 dry-run(jldfil25900) | 78줄 변경(규칙 5a 3 · 규칙 13 1 · 규칙 2 3) — Stage 1 은 거의 고정점 |
| 공급사 확장 7종 호출 | `fieldEl` 239자리/33화면만 잔존, 나머지 6종 0 |
| `$c.cm.fn_*` | 909자리/56화면(`fn_NullChk` 516 · `fn_IsNumber` 228) |
| jQuery `$(` / `document.` / `var` | 517 / 883 / 499화면 |
| head `/_commons` script 참조 | 1,564화면(전부 제거 대상) |

## 이력

- 2026-09-07 `jsp_소스전환` 31화면 정비 종결(브라우저 확인까지). 2026-09-21 규칙 재적용 + 공급사 확장 7종·`$c.cm.fn_*` 9종 치환.
- 2026-10-01 r13 전달본 반입(`ui/`·`r13/`), `convert_all.py` 등록, 잡 tmp 도구 5종 `conversion/tools` 승격
  (`screen_tools` · `gate_screen` · `scan_mixed_compare` · `screen_convention` · `init_restructure`) — 0단계.
- 2026-10-01 1단계 파일럿 — `vendor_postprocess.py`(규칙 33)·`publish_normalize.py`(규칙 34)·`jspfront_pipeline.py` 신설, 33화면 `ui-tobe/` 착지.
- 2026-10-02 2단계 전량 — 1,677화면 `ui-tobe/` 착지(게이트 전건·lint 0/0), 규칙 V16 확장·V21~V23, `jspfront_summary.py`(배치 로그 집계) 신설.
