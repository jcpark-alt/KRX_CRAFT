# jldfil25910 스크립트 실행 구조 개선 가이드

> 대상: `src/conversion/jsp-front/jldfil25910.xml` (배당기준일자 신고 저장·수정 화면)
> 목적: `code-convention.md` 규약 준수 — **IIFE·onpageload 오버라이딩 제거**, **초기화 순차 호출**, 오류 처리·문법·명명·주석 규약 전반 적용.
> 자매 화면 [jldfil25900_수정가이드.md](jldfil25900_수정가이드.md) 와 동일 변환 패턴(규모 확대판).

---

## 1. 현재 구조의 문제점

2구역(초기화 영역)에 **자동 실행 IIFE 4개**와 **onpageload 오버라이딩 래핑 1개**가 있고, 3·4·5구역에 오류 처리·문법 규약 위반이 산재해 있었다.

| 구역 | 위반 | 건수 |
|------|------|------|
| 2 | 자동 실행 IIFE(`__attrReals`·`__rowCopies`·`__fillNow`·`evalConds`) | 4 |
| 2 | `var __prev = scwin.onpageload;` 오버라이딩 래핑 + `setTimeout` 다중 예약 | 1 + 8 |
| 2 | 미사용 전역 재선언(`scwin.result = undefined; scwin.modifiyDate = undefined;`) | 1 |
| 3 | 이벤트 핸들러의 미사용 지역변수(`ev`/`event`/`__self`) + 빈 catch·이중 중첩 try/catch | 14 |
| 4 | 서브미션 함수의 `executeDynamic` 자체 try/catch(예외 삼킴) + `== true` | 3 |
| 5 | 무의미한 자기 대입(`scwin.fn_x = scwin.fn_x;`) | 14 |
| 5 | 비엄격 비교(`== ''`·`== "Y"`)·미선언 루프변수(`for (i = …`)·`fn_modifiyDate` 중첩 IIFE 파서 | 다수 |
| 전체 | 함수 JSDoc 부재 | 39 |

---

## 2. 개선 방향 (code-convention 규약)

1. **초기화 절**: IIFE 4개를 명명 함수(`scwin.init_*`)로 분리, 자동 실행 제거.
2. `scwin.onpageload` 를 **2구역 최상단**에 단일 정의하고 `init_*` 를 **데이터 의존성 순서**로 순차 호출(오버라이딩·`__prev`·`setTimeout` 제거).
3. **오류 처리 절**: 진입점(3구역 이벤트 핸들러·onpageload)만 `try/catch + $c.exception.handleError` **한 줄**, 빈 catch·이중 중첩 제거, 내부 함수(4·5구역)는 예외 전파.
4. **변수·문법 절**: 엄격 비교(`===`/`!==`, `== null`/`!= null` 관용구 제외), `const` 기본, 미사용 지역변수·전역 삭제, `for (let i …`.
5. **주석 절**: 전 함수 표준 JSDoc.

---

## 3. 2구역 변경 후 구조 (요약)

`onpageload` 를 최상단에 두고 `init_*` 6개를 순차 호출한다(JSDoc 생략 표기).

```javascript
///////// 2. 초기화 영역 /////////

// 화면 진입점 — 2구역 최상단 정의, init_* 순차 실행(래핑 없이 단일 정의)
scwin.onpageload = function () {
  try {
    scwin.init_recvParam();   // 1) 파라미터 수신
    scwin.init_fillNow();     // 2) sysYear 미수신 시 서버 연도 충전
    scwin.init_attrReals();   // 3) textarea 라벨 동적 렌더
    scwin.init_rowCopies();   // 4) 기준년도·결산월 표시 행 복사
    scwin.init_conds();       // 5) 조건부 표시 영역 평가
    scwin.init_radio();       // 6) 배당기준일 라디오 초기 표시·change 바인딩
  } catch (ex) {
    $c.exception.handleError(ex, { context: "jldfil25910.onpageload" });
  }
};

scwin.init_attrReals = function () { /* applyAttrReals(주주명부·이익배당 라벨) */ };
scwin.init_rowCopies = function () { /* copyRows(기준년도·결산월) */ };
scwin.init_fillNow   = function () { /* sysYear 폴백 충전 */ };
scwin.init_recvParam = function () { $c.data.recvParamData("dma_pageContext"); };
scwin.init_conds     = function () { /* isEditable/isReadonly/hasBzProcsNo 로 조건부 영역 평가 */ };
scwin.init_radio     = function () { scwin.basDRadio(); /* divBasDdYn change 바인딩 */ };
```

> **evalConds 정리**: 구 코드는 17개 조건 바인딩이 동일한 `checkModifiyDate/listStatCd` 비교식을 인라인 반복했다. `isEditable`(수정 가능)·`isReadonly`(읽기전용)·`hasBzProcsNo`(등록 여부) 헬퍼로 추출해 중복을 제거했다.

---

## 4. 구역별 변경 요약

### 4.1 3구역 이벤트 핸들러 (14개)
- `try { let ev = e; let event = ev; let __self = …; BODY } catch (_ex) { try {…} catch (_ehx) {} }` → 진입점 표준형으로 통일.
- 미사용 `ev`/`event` 제거, `__self` 실사용 핸들러(`txa_*_onkeyup`/`_onblur` 4개)만 `const __self = …` 복원.
- catch 는 `[await] $c.exception.handleError(ex, { context: "jldfil25910.함수명" })` 한 줄, 빈 catch·이중 중첩 제거.

### 4.2 4구역 서브미션 함수 (3개)
- `tx_fn_register`·`tx_fn_modifiyDate`: `executeDynamic` 자체 try/catch 제거 → 예외 전파(진입점에서 처리), `success == true` → `=== true`, 응답 실패 메시지 표시는 유지.
- `tx_fn_FileDown`: `downFile` 감싸던 이중 try/catch·빈 catch 제거 → 전파.

### 4.3 5구역 업무 함수
- 무의미한 자기 대입(`scwin.fn_list = scwin.fn_list;` 등 14건) 삭제.
- `fn_modifiyDate`: 중첩 IIFE(JSON.stringify→parse 왕복) 파서 → 평탄한 `body` 추출로 단순화(로직 동등).
- 엄격 비교: `== ''` → `=== ''`(fn_validation 5건), `+ "" == "Y"`/`== ""` → `===`(basDRadio), `isFileType[i] == fileType`·`typeChkCnt == 0`·`modifiyDate == "N"`·`delck == "Y"`·`escape(...) == '%0A'` → `===`. (`== null`/`!= null` 관용구는 유지)
- 미선언 루프변수 `for (i = 0; …` → `for (let i = 0; …`(fn_fileTypeChk).

### 4.4 미참조 컴포넌트 캐싱 전역 삭제 (96개)
- W-Craft 변환기가 body 컴포넌트를 전부 `scwin.X = $c.util.getComponent('X')` 로 자동 캐싱했으나, 스크립트에서 `scwin.X` 로 참조하지 않는 것(`table_17`·`col_32`·`td_19` 등 body 부재 죽은 참조 포함)은 삭제한다.
- 함수는 `$c.util.getComponent(...)` 직접 조회 방식이라 무영향. **실사용 캐싱만 유지**: `ex`(onMover/onMout 의 `scwin.ex.setStyle`)·`filebox`(fn_fileDel 의 `scwin.filebox.setStyle`).
- 상태값(`result`·`modifiyDate`·`delck`·`screenId`)·특수 초기화(`upd_attachFile` = `__krxFileControl`)는 유지.

### 4.5 주석 (전 구역)
- 함수 39개에 표준 JSDoc(`@method`/`@name`/`@description`/`@param`/`@returns`/`@hidden`) 부여, placeholder 0.

---

## 5. 유지(변환 제외) 항목

- **인라인 IIFE 4건**: `btn_FileDown_onclick`·`btn_FileDown_2_onclick` 의 `dma_dividendDate` 값 추출용 `(function(){…})()` 은 **로딩 시점 자동 실행이 아니라 호출 시점 값 계산**이므로 초기화 IIFE 금지 규약 대상이 아니다(유지).
- **`== null`/`!= null`**: null·undefined 동시 판별 관용구라 엄격화하지 않는다.
- **jQuery DOM 조작**(`$("input[name=…]").val(…)`·form action 설정): 규칙 19(원시 jQuery→컴포넌트) 재설계 대상으로, code-convention 직접 규약 밖이라 이번 범위에서 제외. body 에 `dma_*Req` 바인딩 hidden input 이 있어 후속 전환 가능.
- **`fn_*`/`tx_fn_*` 명명**: 호출자 정합용 as-is 별칭(`fn_modifiyDate`·`tx_fn_*`)이라 개명 보류. 신규 5구역 함수는 camelCase.

---

## 6. 검토 체크리스트

- [x] 자동 실행 IIFE(`)()`) 0건 (인라인 값 추출 IIFE 제외)
- [x] `__prev` / `var __prev = scwin.onpageload` 0건
- [x] `setTimeout(` 예약 호출 0건
- [x] `scwin.onpageload` 정의 1건, **2구역 최상단 배치**, `body ev:onpageload` 바인딩 유지
- [x] 빈 catch·이중 중첩 try/catch 0건, 내부 함수 예외 전파
- [x] 비엄격 `==`/`!=` (코드) 0건(관용구 `== null`/`!= null` 제외)
- [x] 자기 대입 0건, 미선언 루프변수 0건
- [x] 미참조 `scwin.X = getComponent('X')` 캐싱 전역 삭제(96개, 실사용 `ex`·`filebox`·상태값 유지)
- [x] 전 함수 JSDoc 완비(39개, placeholder 0)
- [x] XML well-formed + JS 구문 OK
```
