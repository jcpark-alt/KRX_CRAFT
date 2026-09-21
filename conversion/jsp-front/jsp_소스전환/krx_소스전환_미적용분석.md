# jsp-front krx_소스전환 산출물 — conversion 프로세스 미적용 항목 분석

> 대상: `conversion/jsp-front/krx_소스전환/`(구 `w-craft/`) 31파일 (총 ~1MB, 함수 591개)
> 산출물 성격: **editor-web generate 자동 변환 산출물**(`meta_author="editor-web generate"`, 2026-09-03~06 생성)
> 분석 방법: ① 전 파일 규약 패턴 정적 스캔(CDATA 추출 후 정규식 카운트) ② 수작업 최종본이 있는 `jldfil25900`·`25910`(jsp_소스전환)과의 diff 대조(ground truth)
> 기준 규약: [code-convention.md](../../../cm/docs/code-convention/code-convention.md)
> 작성: 2026-09-07 · **갱신: 2026-09-07 — 본 문서가 식별한 §2 갭은 29화면 후속 정비(`a4b49ab`)로 전량 해소**, jsp-front 31화면 정비 완료(§5). §3 재설계 유형만 미결.
> **2차 갱신: 2026-09-07** — 정비본 후속 정정 반영(§5 하단 목록): 폴더 재편(`jsp_소스전환/` 2폴더 체제, `adff87d`)·규약 재감사(실위반 1건 보완)·대형 2파일 뷰티파이.
> **3차 갱신: 2026-09-21** — 원본 폴더 재생성본 반영(`0f72c7e`, 31→33화면, `meta_date` 2026-09-15) 뒤 **gcc 미존재 `$c` 함수 16종**을 전수 식별하고 치환 검토안을 §7 로 추가. 정비본(`jsp_소스전환/`)은 아직 09-06 원본 기준.
> **4차 갱신: 2026-09-21** — 정비본 31파일에 **conversion 규칙 재적용**(convert.py 단계1 제자리 + 후처리): 규칙 13 `fn_*` 개명 65건(충돌 1쌍은 `selectModifiyDate`), 5a 67·2 54·5d 8·26 6·7 2, JSDoc 옛 이름 동기화, 35700c 암묵 전역 `i`→`let` 5. 규칙 4 의 `init_*`/`initXxx` 5구역 이동은 code-convention(2구역)에 맞춰 65건 복원, 규칙 5b 는 DOM 수신(ev.target) 23건 원복·보류(52100 keyup 3건만 컴포넌트 API 전환). §5 이력 6 참조.
> **5차 갱신: 2026-09-21** — §7.1 **A 그룹 7종을 정비본 31파일에 적용**(전제: 페이지 컨텍스트는 `paramData` 파라미터 — gcc `$c.data.getParameter` 가 이 키를 고정 사용): readValue 109건(get 75·getCellData 28·래퍼 6) · recvParamData 27(치환 17·생략 10) · fieldEl 51 · evalConds 14 · copyRows 8 · applyAttrReals 6 · readSessionValue 2, `dma_pageContext` 신설 4·키 추가 19, 숫자 DOM 헬퍼 3파일 컴포넌트 API 전환(5b 보류 19건 해소)·35700c 핸들러 100개 `self`→`comp`. 보류: 59410 `entity` 3건. §5 이력 7·§7.4 참조.
> **6차 갱신: 2026-09-21** — pcc stf 업무공통 갱신본(`1b0a7a9`, `fn_` 접두 제거·camelCase: list_common 82→93·common 63→62 개명, bns_common publicInfo 56→90) 기준으로 §7.2 B 그룹을 재대조 — 정비본 59410·35706c 의 `$c.cm.fn_*` 9종은 갱신 pcc(7모듈 329메서드, `npm run docs:pcc:stf` → `cm/docs/api/stf/index.html`)에 이름·camelCase 대응 모두 없음(정의 부재 확정). `bns_common.xml` 은 `<head>` 에 `meta_screenId="$c.bns"` 가 추가돼 API 문서에 포함됨.
> **7차 갱신: 2026-09-21** — 정비본 재전환 2차: `convert.py` dry-run 은 규칙 재적용 뒤 고정점(신규 적용분 0 — 남는 차이는 규칙 4 `init_*` 이동·5b DOM 보류 4건뿐)이라 기계 패스 없음. **§7.2 B 그룹 9종을 59410·35706c 에 적용**(§5 이력 8·§7.4): `$c.cm.fn_*` 호출 잔존 0, 정비본의 gcc 미존재 `$c` 함수는 `entity` 3건(보류)만 남음.

---

## 1. 자동 프로세스가 이미 적용한 항목 (미적용 아님 — 오탐 방지용 기록)

krx_소스전환 산출물은 원시 W-Craft 출력이 아니라 code-convention 상당 부분이 **이미 반영된** 상태다.

| 항목 | 실측 |
|------|------|
| 5단계 구조 헤더(`///////// n. …`) | 29/31 파일 적용 (미적용은 layer 2파일뿐 — §2.6) |
| `scwin.onpageload` 단일 정의 + `ev:onpageload` 배선 + `init_*` 분리 | 29/31 (init_* 83개, 미적용은 layer 2파일) — IIFE 자동 실행·`__prev` 오버라이딩·`setTimeout` 예약 **0건** |
| 진입점 오류 처리 `$c.exception.handleError` | 382건 적용 |
| 엄격 비교 | 비엄격 `==`/`!=` 95건 전부 허용 관용구(`== null`/`!= null`) — **실위반 0건** |
| 통신 스타일 | `submitDoneHandler` 0건 (async/await 순차), `$c.sbm.*` 22건 |
| 레거시 잔재 | W-Craft 마커·`vScrenID`·`debugger`·자기 대입·원시 `alert`/`eval`·`window.event`·`include(` **모두 0건** |
| 들여쓰기 | 탭 라인 0 (스페이스 기반) |

---

## 2. 미적용 항목 — 자동 프로세스 갭 (전 파일 공통) `✅ 2026-09-07 전량 해소`

> **해소 내역(`a4b49ab`)**: 29화면(25900·25910 제외 전량)을 jsp_소스전환 정비본으로 변환 — 기계 패스(publicInfo 등재·JSDoc 스텁 정리 스크립트) + 판단 패스(9배치 병렬: @description 540/540 작성, let→const, `__` 개명, 과밀 분해, layer 구역 헤더). 화면별 `_수정가이드.md` 29건 동봉, 전수 node --check·wsxml_lint 0 errors. 아래 각 절의 수치는 **정비 전 실측 기록**으로 보존한다.

### 2.1 표준 JSDoc 미적용 — **591/591 함수 전부 placeholder** `⚠ 최다 갭 → 해소`
- `@description` **0건**. 전 함수가 `@name scwin.함수명`(scwin. 접두 오기)·`@author Inswave`·`@date 2026. …`(1,182건)·빈 `@param`/`@returns`(빈 @param 207건) 형태의 생성기 스텁.
- 규약: `@method`/`@name`(접두 없이)/`@description`/`@param {타입} 이름 설명`/`@returns {타입}`/`@hidden`/`@example`, placeholder 금지·빈 @param 금지.
- 수작업 정답지(25900·25910 최종본)에서는 전 함수 재작성됨.

### 2.2 publicInfo 미등재 — 공개 함수 선언 전무
- `<w2:publicInfo method="">` 빈 값 26건 + **`ipt_method` 속성명 오기** 2건(`jldfil25900`·`jldfil35706c`) — 31파일 중 28파일 해당.
- `ev:on*` 배선 함수(onpageload·이벤트 핸들러)가 등재 0 → 빌드 `$p` 주입 대상 판정·WS201 계열 검증 불능.

### 2.3 `const` 기본 규칙 미적용 — let 남발 + var 잔존
- **`let` 1,330 vs `const` 40** — 생성기가 재할당 여부 무관 `let` 을 기본 산출(규칙 8: 단일 할당 → const 미적용).
- `var` 잔존 51건: `jldfil35700c`(25) · `jldfil35700`/`35706`(각 5) · layer 2파일(각 2) · `35704`/`35708`/`59410`(각 2) · `inf20000`/`inf20000p`(각 3).

### 2.4 `__` 접두 지역변수 350건 — 컨벤션 밖 명명
- `let __pc`, `let __attrReals`, `__v` 등 생성기 특유 명명. 규약상 `__` 접두는 gcc 내부 헬퍼(`@hidden Y`) 표기이며 화면 지역변수 명명이 아님. 수작업 정답지에서는 일반 camelCase 로 정리.

### 2.5 코드 뷰티파이·식 정리 미적용
- **200자 초과 과밀 라인 179건** — `readValue` 동일 호출을 한 식 안에서 3~4회 반복하는 인라인 뭉침(예: 25900 `init_attrReals` 원본은 1줄 700자+). 수작업본은 값 캐싱(`const sysYear = …`) 후 다단 구성으로 분해.
- 4-스페이스 규약 자체는 지켜지나 라인 분해·중간 변수 추출이 없음.

### 2.6 layer 프래그먼트 2파일 — 구조 규약 전체 미적용
- `jldfil35700_layer_layer1.xml`·`layer3.xml`: 5단계 헤더 0·onpageload 0·`var` 사용. 레이어 조각이라 프로세스가 화면 규칙을 건너뛴 것으로 보임 — 편입 방식(부모 화면 병합 vs 독립 규약 적용) 결정 필요.

---

## 3. 재설계 판단 대상 (자동 치환 불가 — 단계 2 보류 유형) `⏳ 진행 — jQuery(규칙 19)·form 제출(openFormSubmit) 완료, multipart 4건·페이징·fn_* 등 잔여`

| 유형 | 건수 | 주요 파일 | 관련 규칙 |
|------|------|-----------|-----------|
| jQuery 원시 DOM 조작(`$("…")`) | ~~94~~ → **잔존 20** `✅ 규칙 19 전환(2026-09-07)` | 잔존: `25910`(12 — form 기계부·datepicker 위젯) · `35700c`(3 — layer_popup 임의 셀렉터) · `inf20000`(3~6 — 페이징 DOM 재설계) · `25900`(2 — form action) | 전환 74건+ — 컴포넌트 setValue/getValue/setReadOnly/setStyle/hide, ev:on* 이관 3건(publicInfo 등재), 파일 input 은 querySelector 전환(컴포넌트 API 부재 사유 주석). 잔존은 form 제출·페이징·외부 위젯 재설계와 결합된 보류(`// TODO 규칙19-보류` 표기, 각 가이드 「규칙 19」 절 참조) |
| JSP form 제출 잔재(`form.action`/`.submit()`) | ~~12~~ → **잔존 0(.submit) / multipart 보류 4제출** `✅ openFormSubmit 재설계(2026-09-07)` | 9파일 제출 지점 24곳 — 전환 16(`$c.win.openFormSubmit` 호출), 기계부 제거·중복 tx_* 근사 삭제 10종, multipart 파일 전송 제출만 보류(`25910` fn_register·`52100` insert/update/send·`59410` fn_Register — `// TODO form-재설계-보류`) | 페이지 전환·다운로드 의미 보존(동적 hidden 폼 POST). params 는 body 폼 필드 실측 기반 DataMap 전문/컴포넌트 값 |
| 레거시 명명 `fn_*`/`tx_fn_*` | ~~77~~ → **`fn_*` 65건 개명 완료(2026-09-21) / `tx_fn_*` 24 잔존** | `59410`(14) · `35700c`(13) · `25910`(12) … | 규칙 13 — 교차 화면 호출 0건 확인 후 일괄 개명(`fn_modifiyDate` 는 상태 변수와 충돌해 `selectModifiyDate`). `tx_fn_*` 는 submission id 와 동명이라 보류 |
| 컴포넌트 캐싱 전역(`scwin.X = $c.util.getComponent`) | 22 | 분산 | 미참조 판별 후 삭제(2026-09-04 규약) |
| `ev:ondataload` 재호출 배선 | 32 | 분산 | 데이터 재적재 시 init 재실행 설계 — 유지/정리 판단 |

---

## 4. 실측 대조 — 25900·25910 (자동 산출물 → 수작업 최종본 diff)

krx_소스전환 사본과 jsp_소스전환 최종본의 차이(각 303줄·1,013줄 변경)가 곧 **자동 프로세스가 못 채운 부분**의 정답지다:

1. **JSDoc 전면 재작성** — 스텁(`@name scwin.*`·`@author`·`@date`·빈 태그) → 표준 블록(+`@example`).
2. **publicInfo 등재**(`ipt_method` 오기 교정 포함).
3. **onpageload 정합** — 2구역 최상단 배치·init 순차 호출 번호 주석·컨텍스트 문자열 정리.
4. **let→const**·`__` 접두 제거·과밀 한 줄 분해(중복 `readValue` → 값 캐싱)·잉여 방어 코드 정리.
5. **1구역 상태값 정비** — `scwin.result`/`scwin.modifiyDate` 1벌(`""`) 통일.
6. 보류 유지 항목(§3)은 최종본에도 그대로 — jQuery(후속 규칙 19)·`fn_*` 별칭(호출자 정합).

---

## 5. 파일 인벤토리 — 후속 정비 현황 `✅ 31/31 정비 완료 (2026-09-07)`

| 구분 | 파일 | 비고 |
|------|------|------|
| **정비 완료 — 선행 정답지** (2) | `jldfil25900` · `jldfil25910` | jsp_소스전환 최종본(`6b32da3`~`7ec2732`) — 이번 일괄 정비의 규약 기준 |
| **정비 완료 — 일괄 배치** (29) | `35700c`(함수 194) · `59410`(87) · `inf20000`(57) · `52100`(36) · `35706c`(24) · `inf20000p`(23) · `52000`(20) · `59400`(20) · 소형 20파일(35700~35717·52120·inf90009·layer 2) | `a4b49ab` — jsp_소스전환 정비본 + 화면별 `_수정가이드.md` 29건. 원본 유래 결함(미해결 참조·죽은 분기 등)은 각 가이드 §3 후속 과제로 기록 |
| **ULD 대응본 존재** (6) | `35700`(ui-tobe·sample) · `35709`(ui-tobe) · `52100`(sample) · `59400`(sample) · `59410`(sample) · `inf20000`(ui-tobe·sample) | 동일 화면의 기존 W-Craft 계열 변환본이 타 트리에 존재 — jld(신규 파이프라인) ↔ ULD(기존) 정합 비교 가능 |

- `../krx_소스전환/` 사본은 자동 산출물 스냅샷으로 무변경 보존(정비 전 상태의 대조 기준).
- 정비 중 **WS120(그리드 내 중복 컬럼 id) 5건** 추가 발견(`52000`·`59400`×2·`inf20000`·`inf20000p` — 전부 원본 유래): 규칙 27대로 정비본에서 재부여(`column1_2` 등, 스크립트 참조 0건 확인). 원본 사본에는 잔존.

### 후속 정정 이력 (2026-09-07, 정비 완료 이후)

1. **폴더 재편**(`adff87d`) — jsp-front 를 2폴더 체제로 정리: `../krx_소스전환/`(원본 31) · `jsp_소스전환/`(정비본 31 + 수정가이드 31 + 보고서 + 본 분석 문서). git mv 이력 보존, 상대 링크·경로 참조 81건 보정, code-convention.md 정답지 경로 갱신.
2. **규약 재감사** — 31화면을 기계 판정 전 항목(헤더 표기/순서·onpageload 위치·IIFE·var·비엄격 비교·주석 공백·@hidden/@description 정합 등)으로 재스캔. **실위반 1건 유형**: `jldfil25910` 헬퍼 3종(`getDmaValue`·`setComponentText`·`resolveFileControlRoot`, IIFE 제거 때 신설)의 JSDoc 블록 누락 → 표준 JSDoc 보완(42/42 완비). `=== true` 류 플래그 29건은 오탐(엄격 비교, 허용) 확인.
3. **대형 2파일 뷰티파이** — 초기 정비(스크립트 일괄 변환)에서 빠졌던 js-beautify(indent 4) 재포맷을 `35700c`(다문장 한줄 320→2, 120자+ 207→21)·`59410`(38→0, 27→14)에 적용. 비공백 문자 빈도 완전 일치로 로직 보존 증명, node --check·wsxml_lint 0 errors. 잔여 파일은 포맷 지표 양호(다문장 7~24, 주로 switch-case 관용구).
4. **규칙 19 — jQuery 컴포넌트 전환** — 6파일 93건 중 **74건+ 전환·잔존 20건**(4배치 병렬). body 는 이미 WebSquare 컴포넌트(name 속성이 셀렉터와 대응, id 별도 — 예: `n_stock_count1`→`ipt_nStockCount`, 행 반복 `_r{n-1}` 접미)라 name→id 실측 매핑 후 setValue/getValue/setReadOnly/setStyle/hide 전환, 이벤트 바인딩 3건은 `ev:on*` 선언 이관(+publicInfo, 규칙 3 명명), 파일 input 은 querySelector 전환(사유 주석). 잔존 20건 = form 제출 기계부(25900 2·25910 12) + 페이징 DOM(inf20000) + layer_popup 임의 셀렉터(35700c 3) — 전부 `// TODO 규칙19-보류` 표기, form 제출·페이징 재설계와 함께 처리 예정. 25900·25910 publicInfo 도 ev 배선 전체 등재로 일관화(3·16건). 전수 검증: 31파일 node --check·wsxml_lint 0 errors.
5. **form 제출 재설계 — `$c.win.openFormSubmit` 전환** — 9파일 제출 지점 24곳(4배치 병렬): `.submit()` 잔존 **0건**, openFormSubmit 호출 16건 신설(동적 hidden 폼 POST — 페이지 전환·Content-Disposition 다운로드 의미 무손실 보존). params 는 body 폼 필드 실측(대부분 req DataMap 전문 `getJSON()`). 병존하던 AJAX 근사 `tx_*`(executeDynamic) 10종 삭제(전부 publicInfo 비등재), `scwin.form` 전역·`|| {elements:[]}` 폴백 정리, 규칙19-보류 form jQuery 10건 함께 해소. **multipart 파일 전송 제출 4건만 보류**(`// TODO form-재설계-보류` — w2:upload/파일 컨트롤을 폼으로 전송, 파일 업로드 API 재설계 필요). 전수 검증: 31파일 node --check·wsxml_lint 0 errors.

6. **conversion 규칙 재적용(2026-09-21)** — 31파일 전부 `convert.py` 단계1을 제자리 실행하고 후처리 스크립트로 보정: (a) 규칙 4 재정렬은 `init_*`/`init` 을 5구역으로 옮기지만 code-convention(2026-09-04)은 `onpageload` 아래 2구역 배치 → 65건(`init_*` 63 + camelCase `initPageIndex` 2 — 복원 정규식은 `init_` 접두뿐 아니라 `init[A-Z]` 도 잡아야 함)을 2구역으로 복원(비게 된 5구역 헤더 15건 제거; 규칙 4 보류 3파일 25910·52100·59410 은 원래 배치 유지). 블록 끝은 중괄호 개수가 아니라 0열 `};` 로 판정해야 한다(inf20000 의 문자열 `'$' + '{'` 에 개수 판정이 깨짐); (b) 규칙 5b `.value=`→`setValue` 26건 중 수신 객체가 `ev.target`(DOM)인 23건(35700c 7·35704 6·35708 6·59410 2·52100 fallback 2)은 `setValue` 가 TypeError 라 원복·보류, 52100 의 컴포넌트 id 가 확정된 keyup 3건은 `$c.util.getComponent(id).setValue(formatNumber(getValue()))` 로 정식 전환; (c) 규칙 13 개명 65건 — 교차 화면 호출 0건, body `ev:`·publicInfo 도구 동기화, JSDoc `@name`/`@example` 의 옛 이름은 도구가 남기므로 후처리 동기화, `fn_modifiyDate→modifiyDate` 는 상태 변수 `scwin.modifiyDate` 를 덮어쓰므로 `selectModifiyDate`(25900·25910); (d) 그 외 5a 67·2 54·5d 8·26 6·7 2·`let i` 5. 게이트: node --check 31/31, wsxml_lint 31 files 0/0, `ev:`·publicInfo↔정의 전수 일치, `scwin.fn_` 0(`tx_fn_` 24 유지), `$(` 18 불변, 재변환 수렴(내용 차이는 5b 보류 23줄과 빈 5구역 헤더뿐). 단계2 입력 잔여: 규칙 7 `$(` 3파일(규칙 19 보류 유형 그대로).

7. **A 그룹(운영 gcc 확장 7종) 치환 적용(2026-09-21)** — §7.1 검토안대로 31파일 제자리 적용(스크립트 `apply_a.py` 패턴): (a) `recvParamData("dma_pageContext")` 27건 → `dma_pageContext.setJSON($c.data.getParameter() || {})` 17건(gcc `getParameter` 가 `paramData` 키를 고정 사용하므로 "이름 고정 paramData" 계약과 일치), 컨텍스트 값을 읽지 않는 10파일은 수신 생략 주석; `dma_pageContext` 미정의 4파일(35702·35714~35716) 에 dataMap 신설, 기존 파일엔 사용 키 19개 추가(래퍼 `readPageParam/readCtx` 호출부 키 포함); (b) `readValue` 109건 → dataMap `get` 75·dataList `getCellData(row)` 28(행 미지정 1건은 0행)·변수 키 래퍼 6 → `.get(key)`; 보류 3건은 59410 `readValue("entity", …)`(JSP 모델 객체, dataMap 없음); 59400 의 스크립트 적재 시점 컨텍스트 읽기 2건은 `init_recvParam` 수신 직후로 이동; (c) `fieldEl` 51 → `getComponent`, `evalConds` 14 → 로컬 `forEach`(show/hide), `copyRows` 8 → `forEach`(setValue), `applyAttrReals` 6 → `forEach`(`__html`→`render.innerHTML`, `label`→`setLabel`, 그 외 `render.setAttribute`), `readSessionValue` 2 → `$c.session.getUserInfo(key)`(세션 응답 키 존재 전제); (d) `fieldEl` 치환이 DOM 숫자 헬퍼와 결합돼 있어 35700c·35704·35708 의 `unformat/numFormat/checkMax*` 를 `getValue()/setValue()` 로 전환(41줄)하고 35700c `ipt_*` 핸들러 100개의 `self`(ev.target) 를 `$c.util.getComponent('<id>')` 로 교체 — 이력 6 의 5b 보류 23건 중 19건 해소(잔여: 59410 chkObj 2·52100 fallback 2). 게이트: node --check 31/31, wsxml_lint 31 files 0/0, 코드 내 미정의 dataCollection 참조 0, A 그룹 호출 잔존 0(보류 3 제외). **실환경 확인 필요**: `paramData` 로 전달되는 키 집합, 세션 응답의 `corpUsrTpCd`·`repIdYn`, `render.innerHTML`/`setAttribute` 로 대체한 `__html`·`src` 3건.

8. **B 그룹(`$c.cm.fn_*` 9종) 치환 적용(2026-09-21)** — §7.2 검토안대로 정비본 2파일 적용: **59410** — `fn_CheckByte` 3호출(txa_remk keyup/onchange 핸들러 2개 + setData) → `$c.util.setTextLengthCounter(txa_remk, txt_byteCnt, { maxLength: 2000, checkType: "byte" })` 1회 등록(init_pageBody; 표시용 `w2:textbox id="txt_byteCnt"` 를 textarea 옆에 추가, 핸들러·`ev:onkeyup/onchange`·publicInfo 삭제); `fn_SetPhoneValue` 3·`fn_SetEmaileValue` 1 → 신설 `scwin.fillSplitFields(value, sep, ids)`(구분자 기준 뒤에서부터 분할, form DOM 의존 제거 — `scwin.form`/`document.insertForm` 참조 삭제); `fn_SelEmail` → `slc_setEmail.getValue()` 를 `ipt_apctEmail2` 에 setValue, 첫 항목이면 focus; `fn_ChkNumber` 2(법인등록번호 keyup) → 숫자 외 문자 제거 + 안내; `fn_IsExceedMaxLen`·`fn_ChkNumber2` 는 `.form_search`/`.chkNumber` 클래스 대상이 전환 마크업에 없어(실측 0건) 죽은 바인딩 2블록과 함께 삭제; `fn_Trim` 2 → `$c.str.trim`. **35706c** — `fn_CheckDate` onblur 2핸들러 → `init_dateFormat()` 에서 `$c.date.checkCalendarFormat(cal, "yyyyMMdd", 명칭)` 2건 등록(onpageload 5단계, `ev:onblur`·publicInfo 정리). 게이트: node --check 2/2, wsxml_lint 31 files 0/0, `ev:`·publicInfo↔정의 전수 일치, `$c.cm.fn_` 잔존 0. **byte 기준 주의**: 공통 카운터는 UTF-8(한글 3byte)로 재므로 as-is `fn_GetByte`(한글 2byte)보다 한글 허용량이 줄어든다 — 비고 컬럼 DB 기준으로 `maxLength` 조정.

---

## 6. 권고 후속 순서 — 진행 현황

1. ~~**기계 적용 가능(전 파일 일괄)**: publicInfo 등재(+`ipt_method` 오기 교정) → let→const → var 제거 → `__` 접두 개명 → 과밀 라인 뷰티파이~~ → **완료(2026-09-07)** — 기계 패스 스크립트로 일괄 처리. **파이프라인 개선 권고는 유효**: editor-web generate 에 동일 규칙 반영 시 신규 화면부터 재생성만으로 해소.
2. ~~**반자동(템플릿 + 내용 작성)**: JSDoc 591건~~ → **완료(2026-09-07)** — 9배치 병렬 작업으로 @description 540/540 작성(25900·25910 기작성 51 별도).
3. **판단/재설계(단계 2) — 잔여 과제**: §3 유형 — ~~jQuery 94건~~·~~form 제출 12건~~ → **규칙 19 전환·openFormSubmit 재설계 완료(2026-09-07)**. 잔여: **multipart 파일 전송 제출 4건**(25910 fn_register·52100 3제출·59410 fn_Register — 파일 업로드 API 확정 필요), 페이징 DOM 재설계(inf20000), ~~`fn_*` 개명 77건~~ → **`fn_*` 65건 개명 완료(2026-09-21, §5 이력 6)**·`tx_fn_*` 24건 보류, 규칙 5b DOM 수신 `.value=` 23건 보류(컴포넌트 API 재설계 필요), 컴포넌트 캐싱 전역 22건, layer 2파일 편입 방식, datepicker 위젯 1건 + 각 수정가이드 §3에 기록된 원본 유래 결함(35708 미해결 컴포넌트 참조, 52100 미정의 전역 호출, 20000p 숫자/문자열 비교 등).
4. **gcc 미존재 함수 16종 치환**: A(운영 gcc 확장 7종)·B(`$c.cm.fn_*` 9종) 모두 **정비본 적용 완료(2026-09-21, §5 이력 7·8, §7.4)** — 잔여 보류는 59410 `entity` 3건. 원본 `krx_소스전환/` 33화면의 동일 호출은 재생성기 개선 대상.

---

## 7. gcc 미존재 `$c` 함수 16종 — 치환 검토안 (2026-09-21)

> 대상: 재생성본 33화면(`0f72c7e`). 방법: 각 파일 CDATA 에서 `$c.<ns>.<fn>` 참조를 정규식으로 전수 추출(주석 제거 후) → `cm/gcc/*.xml` 의 `meta_screenId="$c.<ns>"` + `<w2:publicInfo method>`(13모듈 302메서드)와 대조, `cm/pcc/stf`(cm·cp·lc·print·stf) 존재 여부 병기.
> 결과: 참조 43종 중 gcc 존재 27종 · **미존재 16종**(A 7 + B 9). 정비본 `jsp_소스전환/` 도 같은 7종을 사용(readValue 114·recvParamData 27·fieldEl 51·evalConds 14·copyRows 8·applyAttrReals 6·readSessionValue 2)하므로 치환 규칙은 두 폴더에 함께 적용한다.

### 7.1 A — gcc 네임스페이스는 있으나 함수가 없는 7종 (운영 배포 gcc 확장 함수 추정, 리포 `cm/gcc` 만으로는 실행 불가)

| 함수 | 호출/파일 | 추정 역할(호출 형태 근거) | 치환안 | 판정 |
|------|-----------|---------------------------|--------|------|
| `$c.data.readValue(dc, key, opts)` | 308 / 18 | dc 값 읽기. 옵션 `row`(dataList 행) 31 · `silent`/`soft`(없으면 빈값·null) 183 · `ctx`(페이지 컨텍스트) 170 · `label`(디버그 라벨) 204 | dataMap → `dma_x.get("key")`, dataList → `dlt_x.getCellData(row, "key")` | **가능(조건부)** — 같은 파일에 정의된 dc 대상 272회는 정규식 기계 치환. 미정의 36회 선행 작업: `dma_pageContext` 미정의 4파일 22회(35702·35714~35716 — dataMap 정의 추가), `entity` 12회(59410 — JSP 모델 객체, 조회 API 응답용 dataMap 신설), `sysYear` 2회(25910 — dma_pageContext 키로 이동). `== null ? …` 삼항 16건은 `$c.util.isEmpty` 로 정리 |
| `$c.data.recvParamData("dma_pageContext")` | 29 / 29 | 화면 전환 파라미터(고정 키 `paramData`)를 dataMap 에 적재 | `dma_pageContext.setJSON($c.data.getParameter("paramData") ?? {})` | **가능** — 15파일 즉시, 14파일은 dataMap 정의 추가 후. JSP 서버 모델값(sysYear·listStatCd 등)이 파라미터로 오지 않으면 별도 조회 API 필요 |
| `$c.data.copyRows([{childId, fn}])` | 8 / 8 | 자식 요소에 계산값 채움 | 대상 47건(applyAttrReals 포함) 전부 컴포넌트(textbox 13·input 12·trigger 10·calendar 4·textarea 3·group 3·select 1·tag 1) → `comp.setValue(fn())` | **가능** — group 3건(`__html` 주입)은 textbox 컴포넌트로 마크업 교체 권장 |
| `$c.util.applyAttrReals([{childId, attr, fn}])` | 6 / 6 | 속성 동적 설정(`__html` 3 · `label` 3 · `src` 1) | label → `setValue`, src → `setBackgroundImage`(규칙 5c), `__html` → copyRows 와 동일 | **가능** |
| `$c.data.readSessionValue(key, "session.user.key")` | 5 / 2 | 세션 사용자 값 | `$c.session.getUserInfo("corpUsrTpCd")` | **가능(확인 1건)** — 운영 세션 응답(`userInfoJson.body`)에 `corpUsrTpCd`·`repIdYn` 키 존재 여부(gcc/pcc 에 언급 없음) |
| `$c.util.fieldEl(id, name)` | 103 / 3 | id 로 컴포넌트, 없으면 name 폴백 | `$c.util.getComponent(id)` | **가능** — 단순 49건 직접 치환, 복합 6건은 `setValue && getValue` 존재 삼항 제거. 치환 전 id 존재 여부 전수 확인 |
| `$c.util.evalConds([{id, fn}])` | 14 / 14 | JSP `c:if/otherwise` 표시 조건 재평가(대상 71건: group 35·textbox 20·trigger 15·select 1, id 접두 if/tr/c/btn/txt) | `fn() ? comp.show() : comp.hide()`, 버튼은 `$c.util.setButtonState` | **가능** — 원본의 "즉시 + setTimeout 4회" 재평가를 조회 `await` 직후 1회 호출로 정리. 조건식 안의 `readValue` 는 위 치환에 종속 |

**권고 순서**: `recvParamData` + `dma_pageContext` 정의(14파일 보강) 확정 → `readValue` → `fieldEl` → `copyRows`/`applyAttrReals` → `evalConds`. **선행 확인 3건**: 페이지 컨텍스트 값의 출처(파라미터 vs 조회 API), 세션 응답 키, byte 산정 기준(§7.2).

### 7.2 B — pcc `$c.cm` 네임스페이스의 옛 `fn_*` 9종 (정의 없음 — as-is `cm/as-is/fil/common.xml` 에만 존재, 갱신 pcc 에 camelCase 대응도 없음)

> 2026-09-21 재대조: pcc stf 갱신본(`1b0a7a9`) API 문서 `cm/docs/api/stf/index.html`(7모듈 329메서드 — lc 87·cm 72·stf 52·print 16·bns 90·cp 8·main 4) 기준으로도 아래 9종은 옛 이름·camelCase 이름 어느 쪽도 없다. 즉 gcc 대체 또는 pcc 신규 정의가 필요하며, 정비본에도 같은 호출이 있다(59410 8종 24회 · 35706c 1종 4회 — 규칙 재적용 뒤 호출 수).

59410 에 8종, 35706c 에 1종. 전부 gcc 공통·`setValue()` 로 치환 가능(59410 약 20줄 + 마크업 소폭, 35706c 핸들러 2개 → 등록 1회).

| 함수 | 호출 | 치환안 | 비고 |
|------|------|--------|------|
| `fn_CheckByte(obj, '2000', 'byteCnt')` | 3 | `$c.util.setTextLengthCounter(txa_remk, 표시컴포넌트, { maxLength: 2000, checkType: "byte" })` 를 onpageload 1회 등록, onkeyup/onchange 핸들러 2개 삭제 | 표시 대상 `byteCnt` 가 body 에 없어 textbox 추가 필요. 한글 byte 기준(as-is `fn_GetByte` 2byte vs gcc 검증 3byte)을 DB 컬럼 기준으로 확정 |
| `fn_SetPhoneValue('telNo', v, scwin.form)` | 3 | `v.split("-")` → `ipt_telNo1/2/3.setValue()` (faxNo·apctTelNo 동일) | id 3벌 존재 확인. `scwin.form = document.insertForm` DOM 폼 의존 제거 |
| `fn_SetEmaileValue('apctEmail', v, scwin.form)` | 1 | `v.split("@")` → `ipt_apctEmail1/2.setValue()` | id 존재 확인 |
| `fn_SelEmail(sel, document.insertForm.apctEmail2)` | 1 | `ipt_apctEmail2.setValue(slc_setEmail.getValue())`, 첫 항목이면 `focus()` | DOM 폼 참조 제거 |
| `fn_Trim(str)` | 2 | `$c.str.trim` | 그대로 치환 |
| `fn_ChkNumber()` / `fn_ChkNumber2(this)` | 3 | 입력 컴포넌트 속성(`inputType="number"` 또는 허용문자 옵션)으로 엔진 위임. 코드 유지 시 `$c.num.isNumber(v)` 실패 → `setValue(v.replace(/[^0-9]/g, ""))` | 전역 `event.keyCode` 의존과 jQuery `.chkNumber` keyup 바인딩 제거 |
| `fn_IsExceedMaxLen(this)` | 1 | 컴포넌트 `maxByteLength`/`maxLength` 속성으로 엔진 위임, 또는 `$c.str.getByteLength(v) > max` | 현재 두 속성 사용 0건 → 마크업 추가. jQuery `.form_search` focusout 제거 |
| `fn_CheckDate(selfVar)` | 2 | `$c.date.checkCalendarFormat(cal_startDate, "yyyyMMdd", "시작일")`(종료일 동일) 1회 등록, onblur 핸들러 2개 삭제 | 원본의 `-`/`/` 제거는 ioFormat 이 yyyyMMdd 라 불필요 |

### 7.3 검증 게이트(치환 시)

- 치환 후 `$c` 참조 ↔ gcc publicInfo 재대조(위 방법)로 미존재 0종 확인 · `python -m wsxml_lint <폴더> --ignore WS111,WS112,WS113` 0 errors · CDATA `node --check`.
- `readValue`/`fieldEl` 기계 치환은 대상 dc·컴포넌트 id 가 같은 파일에 정의된 경우로 한정하고, 미정의 건은 별도 목록으로 남긴다.
- 브라우저 확인: 파라미터 수신(`getParameter("paramData")`)과 세션 키는 실환경에서만 검증 가능.

### 7.4 적용 결과 (2026-09-21, 정비본 `jsp_소스전환/`)

| 함수 | 검토안 | 적용 | 잔여 |
|------|--------|------|------|
| `readValue` | get/getCellData | 109건 (get 75 · getCellData 28 · 변수 키 래퍼 6) | 59410 `entity` 3건 보류 |
| `recvParamData` | getParameter + setJSON | 17건 치환, 10건 수신 생략(컨텍스트 미사용 화면), dataMap 신설 4·키 추가 19 | 파라미터 키 집합 실환경 확인 |
| `copyRows` / `applyAttrReals` | setValue / 속성 | 8 + 6 (로컬 forEach) | `__html`·`src` 3건 DOM 직접 반영 확인 |
| `readSessionValue` | `$c.session.getUserInfo` | 2 | 세션 키 존재 확인 |
| `fieldEl` | `getComponent` | 51 (+ 숫자 헬퍼 3파일 컴포넌트 API 전환, 35700c 핸들러 100개) | — |
| `evalConds` | show/hide | 14 (로컬 forEach) | — |
| **B** `$c.cm.fn_*` 9종 | gcc / `setValue()` | 59410 8종(CheckByte→setTextLengthCounter 등록, SetPhone/SetEmaile→`fillSplitFields`, SelEmail→setValue, ChkNumber→숫자 필터, Trim→`$c.str.trim`, IsExceedMaxLen/ChkNumber2 죽은 바인딩 삭제) · 35706c 1종(CheckDate→`checkCalendarFormat` 등록) | byte 기준(UTF-8 3byte) DB 대조 |

원본 폴더 `krx_소스전환/` 은 editor-web 재생성 산출물 보존 원칙에 따라 손대지 않았다(원본 33화면의 동일 호출은 재생성기 개선으로 해소).
