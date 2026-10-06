# jsp-front — KRX 상장공시 제출시스템(JSP) 전환 작업 폴더

JSP 원본 화면을 WebSquare 로 옮기는 작업의 두 갈래가 한 폴더에 있다.

| 폴더 | 무엇 | 상태 |
|---|---|---|
| `ui/` | **공급사 13차 최종 전달본(2026-09-30, `16bf420e194` · `dep20260930_095541`)의 원본** — `jld*`/`uld*` 접두 화면 1,677본. 내용 무수정(반입 커밋 그대로) | 원본. **손대지 않는다** |
| `ui-tobe/` | `ui/` 를 우리 규칙(퍼블리싱·conversion·code convention)으로 전환한 산출 | 1,677본 전량(기계 단계 완료 2026-10-02, Stage 2 판단 보강 전) |
| `r13/` | 공급사 전달 문서 — `README.md`(13차 안내서) · `MD5SUMS.txt` · `_meta/`(치환 대응표 `krx-tobe.yaml`, `fn_*` 재고, 규약 계수표, forward 판별표) | 참고 자료 |
| `krx_소스전환/` | 2026-09 초 공급사 자동 산출 33화면(옛 판) | 역사. 정비 기준 비교용 |
| `ui-pub/` | **퍼블리싱 병합 산출**(`publish_merge.py` 판정 `auto`·`todo`·`manual`) — KRX 퍼블리싱 XML body 에 `ui-tobe/` 의 id·이벤트·바인딩을 옮겨 심은 것. head·script 는 `ui-tobe` 와 같다. `todo` 본은 body 에 `<!-- TODO Stage2(퍼블리싱 병합): … -->` 표지(자리·기능 확인 거리) | 252본(2026-10-06: auto 89 · todo 160 · manual 3; mismatch 8 은 override skip 으로 미착지). 리포트 `publish_merge_report.md`, 화면별 지시 `publish_merge_overrides.json` |
| `publish/` | 사용자가 둔 **KRX 퍼블리싱 산출 XML** 1,934본(미추적 — 커밋하지 않는다). 시각 목업이라 id 는 자동생성(`column8`·`row3` …), 버튼 라벨은 글자 | 퍼블리싱 재설계 축의 정답지 |
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
     (1 안에서 vendor_stage2.py V27~V36 — V36 = dom_rules.py 규칙 19 기계 가능분)
  6 convert 수렴
  7 gate_screen.py         정적 게이트(node --check·publicInfo↔정의·ev:on↔정의·컴포넌트 참조↔id·미정의 $c·미사용 전역·레거시 토큰)
→ ui-tobe/<name>.xml
```

보조 도구: `publish_merge.py`(퍼블리싱 XML ↔ ui-tobe 병합 → `ui-pub/`, 규칙 35) · `scan_mixed_compare.py`(규칙 5a 회귀 후보) · `init_restructure.py`(onpageload 인라인 초기화 분리 — 공급사 산출은 이미 init_* 구조라 대개 불필요) ·
`python -m wsxml_lint conversion/jsp-front/ui-tobe`(strict) · `pytest conversion/tools`. 규칙 본문은 각 도구의 머리 주석과
`conversion/md/conversion_rules.md` 규칙 33·34·35.

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

## Stage 2 수작업 이력

| 날짜 | 축 | 처방 | 결과 |
|---|---|---|---|
| 2026-10-02 | `$c.lc.fn_isProcess` (92화면 · 188자리) | 공급사 pcc 정의를 보니 중복 제출 가드가 아니라 **확인창**(`window.confirm("[저장] 하시겠습니까?")`, 구분 I/U/D/S/R/DSCL)이었다. 규칙 V24: `scwin.confirmJob(gubun)` 화면 로컬 헬퍼(`$c.win.confirm`, as-is 문구 보존)로 치환, await·async 전파는 컨벤션 단계. 저장소 pcc/stf 에 같은 뜻의 `isProcess`(MSG-A006)가 있으나 jsp-front 는 pcc/fil 만 참조하므로 로컬 헬퍼(반입 후보) | 92화면 재생성 · 게이트 92/92 · await 누락 0 · lint 0/0 · 잔여 호출 0 |
| 2026-10-02 | `$c.lc.fn_alertMsg` (12화면 · 25자리) + as-is 전역 `LastJob` (4화면) | 공급사 정의: 구분 S/S1/F 로 `alert(getMessageParam(MSG-A001 "[^] 처리 성공하였습니다." / MSG-0001 "성공적으로 처리되었습니다." / MSG-A002 "[^] 처리 실패하였습니다.", LastJob))` — `fn_isProcess` 가 채운 전역 처리명을 읽는다. 규칙 V25: `scwin.alertJobResult(gubun)` 로컬 헬퍼(`$c.win.alert`, 문구 보존) + 전역 `LastJob` → `scwin.lastJob`(1구역 선언, `confirmJob` 이 기록). 메시지 코드 표는 저장소 pcc/stf 에만 있어 문구 리터럴로 둠(pcc/fil 반입 시 `getMessageParam` 으로 교체) | 두 헬퍼가 닿는 101화면 재생성 · 게이트 101/101 · await 누락 0 · lint 0/0 · 잔여 호출·bare `LastJob` 0 |
| 2026-10-02 | `$c.fil.SCREN_PROCS_TP_CD_01~08`·`TR_JOB_*`·`$c.lc.NO_EXCEL_DATA` 등 상수 (23화면 · 136자리) | 공급사 번들 정의는 전부 **리터럴 상수**(화면처리구분코드 "01" 조회 … "08" PC저장 · 트랜잭션 작업 구분 1~4 · 메시지 문구 3종). 규칙 V26: `scwin.<같은 이름>` 으로 바꾸고 1구역에 값·한글 뜻과 함께 선언 — 공급사 README 부-2 ㉢ 「as-is 공용 상수는 화면 안에 선언」과 같은 처방이라 이름이 보존돼 pcc 반입 시 한 줄 치환으로 되돌릴 수 있다. 같은 줄의 `$c.fil.doLogSave`(접속 로그 저장 함수)는 상수가 아니라 다음 축 | 23화면 재생성 · 게이트 23/23 · 잔여 참조 0 · 선언 39건 · lint 0/0 |
| 2026-10-02 | **A 축 일괄(A-1~A-7)** — `vendor_stage2.py` 규칙 V27~V31 + V11·V22 교정 | **A-1** `CreateDialogFrame` 공급사 5인자 꼴(규칙 17 은 8인자만) → `$c.win.openPopup(url, {id, type:"pageFramePopup", title, width, height}, {})`; url 이 공급사 드러냄 IIFE 면 그대로. **A-2** `doLogSave` 접속 로그 문장 → 보류 블록 주석(운영 필요 여부 회신 ㉤). **A-3** pcc 함수 5종 → 로컬 헬퍼(`getMktId` 는 as-is 전역 `js_market`·서버 렌더 값이라 TODO 동반, `getSecuGrpNm` 코드표, `showObj`, `showTotalCount`, `getModalCenterPos`). **A-4** `$c.cm.*` 13종 → 로컬 헬퍼/인라인(`setSearchPeriod`/`setPeriodDates` 는 `$c.date`+`cal_sdate/edate`+`search()`, `checkDateParts`, `isZipCodeInput`, `checkByteLimit`+바이트 계산 2종은 as-is 2byte 계산 보존, `isMinusNumber`, `checkNotOnlyNumber`, `checkAlphaNum`, `isGroupChecked`, `fn_IsNull`→`checkRequired(comp, name)`, `fn_IgnoreSpaces`/`fn_ChkContactpnt` 인라인; `fn_getFileSize` 는 IE ActiveX 전용이라 TODO 유지). **A-5** 사문 폼 action 문장 삭제. **A-6** 이중 정의는 **마지막 정의가 이긴다** — 앞 정의를 `_1` 로 두고 TODO(종전 `_2` 처리는 as-is 와 반대). **A-7** 공급사 `init_recvParam` 스텁 528화면 → head 에 `dma_pageContext` 추가 + 표준 수신(나머지 1,036화면과 같은 꼴, 빈 `keyInfo` lint 통과 확인) | 전량 1,677 재생성 · 게이트 1,677/1,677 · lint 0/0 · 잔여: `CreateDialogFrame` 0(규칙 17 이 건너뛴 8인자·`Provider("/top")` 꼴 포함) · `doLogSave` 보류 17 · pcc 함수 5종 0 · `$c.cm.*` 1(`fn_getFileSize`) · 폼 action 0 · 이중 정의 `_1` 13 · 수신 스텁 0(`dma_pageContext` 1,564화면) · TODO 5,421 → **4,719건 / 1,213화면** · 공급사 pcc 의존 216 → **137**(남은 것은 `$c.frame.Provider("../../")`·`CloseFrame`·`srcUrl`·`Width/Height` 프레임 재설계와 `fieldEl` 33) |
| 2026-10-06 | **B 축(회신 의존)** — 기계로 닫을 수 있는 것 + 회신 요청 명부 | **V32** 이동 목적지 드러냄 래퍼 356자리 중 같은 함수에서 url 이 내부 `.xml` 리터럴로 정해지는 166자리는 정적 확정이라 래퍼를 걷음(남은 190 = `.do` 121·조립 전·외부·미상). **V5 보강** 세션 키 TODO 는 user-info 계약에 없는 키만(저장소가 쓰는 14종 제외 — `usrTpCd`·`corpUsrTpCd`·`sndlocTpCd` 등 9종이 미확인). **`jspfront_reply_request.py`** 신설 → `conversion/jsp-front/reply_request.md`: B-1 컨텍스트 키 368종/522화면(화면 안 같은 이름의 dataMap 키·body 컴포넌트·세션 키 수를 근거로 — 예 `stdCdApctTpCdList` 27화면 중 dataMap 24·컴포넌트 27 → 조회 전문 후보) · B-2 세션 키 9종 · B-3 이동 목적지 145자리(.do 가 대부분) · B-4 제출 주소 115종 · B-5 query_param 81종(`SCREN_PROCES_TP_CD`·`SCREN_ID`·세션 키는 화면 상수·`screenId`·세션으로 채울 후보) | 250화면 재생성 · 게이트 250/250 · lint 0/0 · TODO 4,719 → **4,543건 / 1,201화면** · bizMessage 777 → 603 · 세션 TODO 59 → 57. 나머지는 회신 뒤 규칙 반영 |
| 2026-10-06 | **C 축(화면별 재설계) 중 기계 가능분** | **V33** 「부모 화면 스코프 없음」 1,154건은 공급사 인라인 폴백 객체(`getOpenerScope()` 없으면 `console.error`+null 을 돌려주는 가짜 scope) 안의 표식이었다 — 로컬 `scwin.opener()`(+`openerScwin`·`openerComp`)로 접고 폴백 안 TODO 를 없앤다(실행 의미 동일, 가이드 `popup-opener-guide.md` 의 `getOpenerScope` 계약). 그 위의 메서드 존재 검사 131가지 꼴은 as-is DOM 접근의 보수적 가드라 유지. **V34** 미실현 `set_focus` 591자리 중 앞 4줄이 가리키는 body 컴포넌트가 하나뿐인 240자리는 그 컴포넌트 `focus()` 로(추정 주석 동반), 나머지 351 은 TODO 유지. **V35** `init_rowCopy` 범용 루프 670화면 → 표준 forEach(대상 부재 경고는 산출에 없는 칸 건너뛰기라 TODO 아님). jQuery 잔여 1,221건 중 body id 가 있는 917건도 `find/empty/attr/bind/contents` 등 구조 조작이라 기계화하지 않음(규칙 19 화면별) | 874화면 재생성 · 게이트 874/874 · lint 1,677본 0/0 · 부모 스코프 TODO 1,154 → **0**(헬퍼 153화면) · set_focus 591 → 351(240 해소) · 행 복사 671 → 1 · TODO 4,543 → **2,479건 / 986화면**. 첫 171본 배치에서 괄호 짝이 어긋난 치환(구문 오류 114화면)을 게이트가 잡아 정규식을 고치고 테스트에 괄호 균형 검사를 넣었다 |
| 2026-10-06 | C 축 `set_visible`(70)·`set_label`(24)·잔여 `set_focus`(351) | 공급사 마커가 `{target}.setStyle({args})`·`{target}.setLabel({args})` 처럼 **대상·인자 모두 비어 있고**, 저장소에 as-is JSP 원문이 없어(공급사가 받은 "반입 소스"는 KRX 보관) 값을 지어낼 수 없다 — 코드는 손대지 않고 `reply_request.md` **B-6** 절에 자리별 명부(화면·함수·줄·다음 문장 단서)를 만들었다. 요청: as-is JSP 해당 함수 원문, 또는 공급사 마커에 as-is 표현식을 싣도록. 함께 확인: 사용자가 둔 `conversion/jsp-front/publish/`(미추적, 1,934본)는 **KRX 퍼블리싱 산출 XML**(JLDFIL 208·ULDSTF 860 …)이라 조건 래퍼·hidden 입력·lybox 같은 퍼블리싱 재설계 축의 정답지로 쓸 수 있다 | 코드 변경 0 · B-6 명부 94+351자리 |
| 2026-10-06 | **퍼블리싱 재설계** — `publish_merge.py` 신설(규칙 35) | 공급사 body 는 as-is JSP 마크업을 그대로 옮긴 것이고 KRX 퍼블리싱 XML(`publish/`)은 새 디자인의 시각 목업이라 둘을 **합쳐야** 가이드 샘플(JLDFIL25900) 꼴이 된다. 이름이 겹치는 260화면(JLDFIL 전부)을 대상으로 퍼블리싱 body 에 공급사 컴포넌트의 id·`ev:*`·`ref`·`dataList`·포맷터·입력 제약을 옮긴다 — 버튼은 라벨(정규화: `■`·`※`·`*`·「필수」·공백 제거, 조회↔검색·등록↔저장 동의어, 공급사 아이콘 버튼 `btn_cm search icon` 류 16종 ↔ 글자 라벨), 입력류는 같은 tr 의 th 라벨+종류, 그리드는 헤더 라벨 집합(번호·선택 컬럼 제외) 또는 1:1, 같은 라벨이 같은 개수면 순서대로(기간 from/to). select 는 목업 `new row` 항목을 버리고 공급사 choices 를, 그리드 목업 캡션·행 id 는 공급사 것 또는 빈 id(퍼블리싱 파일 안에서 되풀이되는 `caption2`·`row3` 가 WS120). 판정 `auto` = 스크립트 참조 id 전부 자리잡음 + 양쪽 상호작용 컴포넌트 전부 대응 → `ui-pub/`. `review` 는 리포트 사유로 손으로 잇는다(퍼블리싱에만 있는 버튼·select, 전화번호 3분할 입력, 라벨 없는 컨트롤 여러 개, EL `${…}` 라벨 버튼, 공급사 보조 그리드). 퍼블리싱 헤더는 `pgtbox`+breadcrumb+즐겨찾기 꼴이라 sample-front `pageFrame(contentHeader)` 와 다르다 — 병합본은 규칙 34 P1 대로 pageFrame 으로(표준은 다음 행에서 확정) | 260화면 중 **auto 68 / review 192**(헤더 표준 적용 뒤 66/194) · `ui-pub` 게이트 전건 · lint 0/0 · 재실행 고정점 · 단위 테스트 2건(총 118). 퍼블리싱 id 는 스크립트 참조와 0% 겹치므로(자동생성) 공급사 id 를 옮기는 것 말고는 길이 없다 |
| 2026-10-06 | **헤더 표준 확정 + `ui-pub` 재정렬** | 사용자 결정: 헤더는 **pageFrame 으로 통일**. 측정 — 퍼블리싱 1,934본은 본화면(`sub_contents`) 658 pgtbox / 648 없음, 팝업(`pop_contents`) 607 없음 / 5 pgtbox, sample-front 도 양쪽 혼재. 해석: 본화면은 `<w2:pageFrame id="pfmContentHeader" src="/cm/xml/contentHeader.xml"/>` 를 첫 자식으로 **반드시**(없으면 넣는다), 팝업은 헤더 **없음**(제목은 팝업 프레임이 그린다 — 있으면 뺀다). 규칙 34 P1 확장(`P1_pageframe_added`·`P1_pageframe_removed`, 멱등)으로 `ui-tobe` 재생성 때도 같은 표준이 적용된다(현재 `ui-tobe` 본화면 966본이 헤더 없음 — 다음 재생성 때 채워진다). 함께 고친 것: 퍼블리싱 본문이 자리표뿐(`pop_contents` 빈 그룹)인 화면이 `auto` 로 새던 것 → `review`(jldfil35200·uldmgt50014) | `ui-pub` **auto 66 / review 194** · 본화면 54 전부 pageFrame 첫 자식 · 팝업 12 전부 헤더 없음 · 게이트 66/66 · lint 0/0 · 고정점 · 테스트 +1(총 119). 교훈: Bash heredoc 안 파이썬의 `\b` 가 백스페이스 문자로 파일에 박혀 정규식이 조용히 죽었다(게이트가 아니라 결과 수치로 발견) |
| 2026-10-06 | **퍼블리싱 병합 review 194본 손작업** — 정합기 재구성 + TODO 표지 + override | 손으로 XML 을 고치면 재실행에 사라지므로 **도구 규칙 + 화면별 지시(`publish_merge_overrides.json`)** 로 했다. 정합 순서: ① 같은 키·같은 개수(순서대로) ② 그리드 1:1 ③ 버튼 뜻 토큰(`CANON`: 조회↔검색↔icon:search, 등록↔저장, 엑셀다운↔엑셀다운로드 …)·같은 개수 ④ 닫기 여럿↔하나(첫째 id+이벤트, 나머지 이벤트만) ④b 같은 키 개수 다름 → 앞에서부터(전화번호 3분할↔1칸) ④c 그리드 개수 같음 → 순서대로 ④d 그리드 헤더 자카드 ≥ 0.5 ⑤ override(pair/keep/drop/vendor_skip/insert) ⑥ 퍼블리싱 전용 공통 버튼(인쇄·도움말·닫기) ⑦ 스크립트가 쓰는 공급사 요소 옮겨 넣음 ⑧ 남은 공급사 요소 옮겨 넣음(버튼은 마지막 btnbox/titbox rt) ⑨ 남은 퍼블리싱 요소는 둠 — ⑦~⑨ 는 **값·자리를 지어내지 않고 TODO 표지로 드러낸다**. 정리: 퍼블리싱 목업 핸들러(스크립트에 정의 없는 `ev:*`) 제거, 목업 중복 id(`panelTitle1`×10) 비움, 같은 헤더 value 여럿은 공급사 컬럼 순서대로 소비(`h_x` 5중 복사 결함). 닫힘 판정은 게이트와 같은 잣대(공급사 body 에도 없던 참조는 report-only). **review 9 는 양쪽에 항목이 있는데 하나도 못 이은 것**(퍼블리싱 파일이 다른 구조·빈 자리표) | 260화면 → **auto 89 · todo 160(표지 1,701건) · manual 2 · review 9** · `ui-pub` 251본 게이트 전건 · lint 0/0 · 고정점 · 테스트 +2(총 121). 남은 손작업은 `ui-pub` 안의 TODO 표지(공급사 요소 옮겨 넣음 711 · 퍼블리싱 대응 없음 721 · 참조 옮김 18 ≈ 자리·디자인 확인)와 review 9 |
| 2026-10-06 | review 9본 override 작성 | 화면마다 퍼블리싱 파일과 공급사 본문을 대조했다. **같은 이름에 다른 화면**이 6본(jldfil21103 안내↔탈퇴신청 · jldfil40200 분류 select 5↔8+회사코드 재설계 · jldinf92500 투자계약증권 상세↔'ETN 상세정보 변경' 수정 폼 · jldods20010 업무해설↔키워드목록 · uldmgt50002 mgt 용 의미 id 파일↔프레임 셸 · uldmgt50316 그리드↔정적 표 14행 목업), **퍼블리싱 빈 자리표** 2본(jldfil35200 '디자인필요' · uldmgt50014 `${htmlContent}` 뷰어) → `skip`(판정 `mismatch`, 병합하지 않음, 사유를 지시 파일에). jldinf91100 은 공급사 상호작용 요소가 상환방법 그리드 하나뿐이라 TODO 표지 결과를 `accept`. 도구에 `skip`·`accept` 지시 추가, 공통 버튼(닫기·인쇄·도움말)은 닫힘 판정의 항목 수에서 제외 | 260화면 → **auto 89 · todo 160(표지 1,576) · manual 3 · mismatch 8 · review 0** · `ui-pub` 252본 게이트 전건 · lint 0/0 · 고정점 · 테스트 +1(총 122). mismatch 8 은 퍼블리셔·기획 회신 항목 |
| 2026-10-06 | **jQuery·원시 폼 DOM 전환(규칙 19) 기계 가능분 — V36 `dom_rules.py`** | 집계: jQuery 호출 6,897자리/514화면, 원시 폼 DOM 430자리/144화면(`fm.action` 217·`target` 107 — 대부분 B-4 제출 주소 회신 대상). **body 의 입력 컴포넌트 하나로 확정되는 셀렉터만** 바꿨다(`#id`·`[id=X]`·`[name=X]` 접미 없음 → `.val()`/`.val(v)`/`.attr|prop('disabled'|'readonly', v)`/`.removeAttr`/`.show/.hide/.focus`, `$(document).find("select[id=X]").val()`, `fm.X.value`·`getElementsByName("X")[0].value`). **바꾸지 않은 이유**: 공급사가 라디오 한 칸마다 `select1` 을 따로 그려 같은 `name` 이 여럿(`:checked` 280자리는 병합 뒤 그룹 컴포넌트에서), body 에 없는 id(그리드 헤더 체크·서버 렌더), `.find/.each/.append/.empty/.bind/.submit` 구조 조작은 화면별 재작성. 잔여는 `reply_request.md` **B-7**(셀렉터 유형 × 메서드 × 처방) 명부로, 게이트에 report-only 토큰 `jQuery $(`·`form DOM` 추가 | 89화면 재생성(치환 949 = jQuery 734 + document.find 215) · 게이트 89/89 · lint 1,677본 0/0 · V36 dry 재실행 0(고정점) · 테스트 +1(총 123). 잔여 jQuery **5,948자리/510화면**, 원시 폼 DOM 430자리/144화면 — 화면별 손작업은 `ui-pub` 착지 화면부터 |
| 2026-10-06 | **`ui-pub` jQuery 화면별 재작성 1차(손작업)** | 대상 `ui-pub` 56화면·261자리. 퍼블리싱 컴포넌트로 **확정되는 자리만** 손으로 고쳤다(15화면·26자리): ETN 선택 제출 7화면 `$("[name='checkSub']").is(':checked')` → `grd_pageList.getCheckedIndex("checkSub").length === 0`(sample-front 관용구), jldfil20500 체크박스 8개 `is/attr/removeAttr` → `getValue()==="Y"`/`setValue("Y"|"")`(항목 값 Y 확인), jldfil72100 체크 헬퍼 인자·판정 → 컴포넌트, jldfil25100 change 바인딩 → `ev:onchange`+핸들러, jldfil11000 엔터 keydown → `ev:onkeydown`+핸들러, jldinf35000 동적 id `$("#"+id).val()/[0]` → `getComponent(id)`, jldfil40300·40400 `attr(alt)`+DOM 인자 → `checkRequired(comp, name)`, jldinf92300 빈 `ready` 제거. **손본 ui-pub 파일은 override `frozen` 으로 재생성에서 보호**(ui-pub 파일이 정본). 전체선택 `#ipt_checkAll` 3화면은 병합본 그리드에 헤더 체크 컬럼이 없어 보류. 남은 자리에는 `publish_merge` 가 **규칙 19 힌트 TODO**(`// TODO Stage2(규칙 19): jQuery — …`, 폼 제출→B-4 · 파일 입력→upload 재설계 · 서버 렌더→B-1 · 라디오/체크 그룹 · 바인딩→ev:on* · DOM 탐색/조립 · 표시/스타일)를 문장마다 단다(재생성마다 같은 결과) | `ui-pub` 252본: auto 79 · todo 155 · manual 3 · **frozen 15** · mismatch 8 · 게이트 전건 · lint 0/0 · 고정점. jQuery 잔여 261 → **235자리/42화면**(힌트 230건: 참조 재작성 81 · 폼 제출 27 · 표시/스타일 25 · DOM 조립 25 · 파일 입력 20 · 라디오/체크 18 · DOM 탐색 17 · 바인딩 13 · 서버 렌더 4). 테스트 +1(총 124) |
| 2026-10-06 | `ui-pub` jQuery 화면별 재작성 2차 | '퍼블리싱 컴포넌트 참조로 재작성' 힌트 81자리를 화면별 컴포넌트 목록과 대조해 **실재하는 자리만** 손작업(4화면·25자리): jldstf70010 as-is 공통 `setBtnDisable/Enable`(정의 없는 전역 — 호출 자체가 오류)+span 래퍼 id → 안의 버튼 컴포넌트 `setDisabled`(공급사 body 로 래퍼↔버튼 확인: duplChkSpan→ipt_duplChk · formDelSpan→input_44 · upBtn→input_209 · downBtn→input_211), `option:selected` → `getValue()`(jldstf70010 chargInstId · jldfil11010 disclsChrg ×3), jQuery UI tooltip 사문 제거(11010·22110), uldmgt76101 option disabled → `setDisabled`. 남은 56자리는 퍼블리싱에 없는 요소(as-is 숨은 입력 integSrchNm·동적 행 modBtn/chgKeywrdNm·읽기 전용 팝업의 입력 ipt_isuAmt 류·#koList·이메일 행 접미) | `ui-pub` frozen 15 → **19** · 게이트 전건 · lint 0/0 · 고정점. jQuery 잔여 235 → **210자리/42화면**(힌트: 참조 재작성 56 · 폼 제출 27 · 표시/스타일 25 · DOM 조립 25 · 파일 입력 20 · 라디오/체크 18 · DOM 탐색 17 · 바인딩 13 · 서버 렌더 4) |
| 2026-10-06 | 헤더 표준 **`ui-tobe` 전량 적용** | `python conversion/tools/publish_normalize.py conversion/jsp-front/ui-tobe` 제자리 재실행(P 규칙은 멱등이라 P1 추가 외 변경 0 — dry-run 으로 먼저 확인). 본화면 966본에 `pfmContentHeader` pageFrame 1줄씩 추가(989줄 추가·삭제 0), 팝업 79본·골격 없는 5본은 그대로 | 본화면 1,593/1,593 pageFrame · 게이트 1,677/1,677 · lint 0/0 · dry 재실행 변경 0(고정점) |

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
- 2026-10-06 퍼블리싱 재설계 축 — `publish_merge.py`(규칙 35) 신설, `publish/` ↔ `ui-tobe/` 260화면 병합 → `ui-pub/` 68본(auto) + `publish_merge_report.md`.
- 2026-10-06 헤더 표준 확정(사용자) — 본화면 `pageFrame(contentHeader)` 필수·팝업 헤더 없음(규칙 34 P1 확장), `ui-pub/` 재생성 66본, `ui-tobe/` 본화면 966본 제자리 적용.
- 2026-10-06 퍼블리싱 병합 review 손작업 — 정합기 ①~⑨ 재구성 + TODO 표지 + `publish_merge_overrides.json`, `ui-pub/` 251본(auto 89 · todo 160 · manual 2), review 9.
- 2026-10-06 review 9본 override — skip 8(다른 화면 6·빈 자리표 2) · accept 1, review 0, `ui-pub/` 252본.
- 2026-10-06 규칙 19 기계 가능분 V36 `dom_rules.py` — jQuery·원시 폼 DOM 중 body 로 확정되는 949자리 컴포넌트 API 로(89화면 재생성), 잔여 B-7 명부.
- 2026-10-06 `ui-pub` jQuery 화면별 재작성 1차 — 15화면 손작업(override `frozen`), 잔여 235자리에 규칙 19 힌트 TODO.
- 2026-10-06 `ui-pub` jQuery 화면별 재작성 2차 — 4화면·25자리(frozen 19), 잔여 210자리/42화면.
