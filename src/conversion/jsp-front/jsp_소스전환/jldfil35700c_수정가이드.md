# jldfil35700c 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `../krx_소스전환/jldfil35700c.xml` → 정비본: `jsp-front/jldfil35700c.xml` (2026-09-07)
> 기준: [code-convention.md](../../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc @description | 194 | 전 함수(핸들러 158·초기화 4·서브미션 1·업무 31)에 함수명·본문 기반 한국어 설명 부여, placeholder 0. `@param {타입} 이름 설명`·`@returns {타입}` 명시, 닫는 `*/` → ` */` 정규화 |
| var → const/let | 25 | `rt_rate`/`rt_rate2` 10건·`ch` 2건 → `let`(재할당), for 초기식 9건 → `let`, `colName`/`colName2` 4건 → `const` (전부 블록 지역 — 스코프 동등 확인 후 전환) |
| let → const | 492 | 핸들러 관용구 `let ev/event/self` 474건 + 일반 지역변수 18건(함수 스코프 내 재할당 부재 보수 판정). 재할당 존재·다중 선언자·판정 애매 건은 `let` 유지 |
| `__` 접두 지역변수 개명 | 158 | `__self` → `self` (전 파일에서 bare `self` 미사용 확인 후 일괄 개명, 스킵 0건) |
| 과밀 한 줄 분해 | 21 | 200자 초과 라인 전량 분해 — 상세는 아래. 동일 호출식 반복은 `const` 캐싱(`cpCheckGubun1`·`gubun1Checked`·`cpMathTp`·`popupOptions`·`corpUsrTpCd`) |
| 2구역 재구성 | 1 | `scwin.onpageload` 를 2구역 최상단으로 이동, `init_recvParam → init_conds → init_pageBody` 순번 주석(1)~3)) 부여. 정의 순서도 호출 순서와 일치시킴 |

### 과밀 분해 21건 상세
- `fn_taxCalc_trust` — `dataArr_trust[0..9]` 수집 객체 리터럴 10건 멀티라인 분해
- `fn_print`/`fn_print_trust` — 결과 객체 `dataArr[10]/[11]`·`dataArr_trust[10]` 3건 분해(200자 미만 동형인 `dataArr_trust[11]` 도 일관성 위해 함께 분해)
- `fn_taxCalc` — 유가(mkt "1") 루프의 `ipt_checkGubun1` 체크 판정식 1건 → `const cpCheckGubun1`/`gubun1Checked` 캐싱 후 조건 단순화
- `fnCheckGubun` — 동일 판정식 2건 → 함수 상단 `const` 캐싱 1벌로 통합
- `fn_checkValue` — `mathTp` 컴포넌트 삼항 체인 1건 → `const cpMathTp` 캐싱 + 멀티라인 삼항
- `fn_rules`·`fn_print`·`fn_print_trust` — `openPopup` 옵션 reduce 원라이너 3건 → `const popupOptions` 분리(내부 `let p/k/v` → `const`)
- `init_conds` — `binds` 원라이너 1건 → 멀티라인 + `readSessionValue` 중복 호출 `const corpUsrTpCd` 캐싱

### 로직 동등성 비고
- `typeof x !== 'undefined' ? x : ''` 가드는 항상 초기화되는 지역변수(`optionCom`/`popupNm`)·`scwin` 프로퍼티(`scwin.dataArr`) 대상이라 제거해도 값 동일(증명 가능한 동등 변환).
- `'' ? Object.assign(...) : base` 죽은 분기는 `base` 리터럴로 평탄화, `Object.assign(base, {id})` 는 `id` 포함 리터럴로 등가 치환.
- 판정식 `const` 캐싱으로 진단용 `console.warn`(컴포넌트 미해결 시에만 발화)의 실행 횟수만 달라질 수 있음 — 기능·값 동일.
- `fn_print` 뒤의 `(Promise.resolve(...).then(...), { closed... })` 콤마 표현식(W-Craft 잔재)은 구조 유지한 채 포맷만 분해.

## 2. 화면 개요

상장수수료 계산 화면. 시장구분(유가증권·코스닥·수익증권·코넥스·기타) 라디오와 상장유형·계산구분 선택에 따라 최대 10행의 입력 영역(`divType1~10`)을 전환하고, 행별 상장주식수×액면가(종가)로 상장금액·구간별 수수료(`rate_*` 9종)·최저/추가 수수료를 계산해 표시한다. 계산원칙 팝업(jldfil35701~35717)·인쇄 팝업(jldfil35704/35708)·신규상장 안내 레이어 오픈과 `listFee.do` 서브미션(`tx_fn_goTab1`)을 포함한다. 함수 194개 중 158개가 입력행별 onclick/onfocus/onblur 핸들러다.

## 3. 보류(유지) 항목

- **jQuery `$("...")` 46건 유지** — `fn_reset`·`changeType`·`fnCheckGubun`·`layer_popup` 등의 DOM 직접 제어. 규칙 19(WebSquare API 재설계) 대상으로 이관 보류.
- **`fn_*`/`tx_fn_*` 함수명 13개 유지** — `fn_taxCalc(_trust)`·`fn_checkValue(Mkt)`·`fn_reset`·`fn_rules`·`fn_print(_trust)`·`fn_goTab1/2`·`fn_kosdaqNewListChk`·`fn_multInputChk`·`tx_fn_goTab1`. 호출자 정합용 as-is 계약.
- **`== null`/`!= null` 관용구 유지** — null/undefined 동시 판별(`gubun1Checked` 판정식 등).
- **`ev:ondataload`** — 이 화면에는 해당 바인딩 없음(해당 없음).
- **`__` 개명 스킵 목록** — 없음(`__self` 158건 전량 개명 완료).
- **`init_pageBody` 내부 try/catch** — 원본 유지(진입점 이중 catch 정리는 동작 변경 소지로 보류), context 문자열 `'jldfil35700.onpageload'`(원본 값)도 유지.
- **전역 `i` 미선언 루프**(`for (i = 0; ...)` in `fn_taxCalc(_trust)`) — 선언 추가 시 스코프 변화 소지로 원본 유지.
- **`scwin.screenId = "jldfil35700"`** — 원본 값 유지(파일명 35700c 와 상이하나 as-is 계약).

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0) — 194/194
- [x] const 기본(보수 판정)·var 0
- [x] __ 접두 지역변수 0(스킵 제외 — 스킵 0건)
- [x] 로직 동등(동작 변경 없음 — §1 비고의 등가 변환만 수행)
- [x] node --check 통과
- [x] 200자 초과 스크립트 라인 0건, `@author`/`@date` 0건, publicInfo 159건 유지, XML well-formed

## 5. 후속 정정 — 코드 뷰티파이 적용 (2026-09-07)

- 초기 정비(스크립트 일괄 변환)에서 빠졌던 **js-beautify(indent 4) 재포맷**을 script CDATA 전체에 적용 (jldfil25900·25910 선례 5a75a16 동일).
- 결과: 다문장 한 줄 320→2, 120자 초과 라인 207→21(정규식·긴 문자열 등 단일 식 잔존), 코드 라인 2,188→3,691 전개.
- 검증: 비공백 문자 빈도 완전 일치(로직 보존), node --check 통과, wsxml_lint 0 errors.