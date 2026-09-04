# jldfil25900 스크립트 실행 구조 개선 가이드

> 대상: `src/conversion/jsp-front/jldfil25900.xml` (2구역 초기화 영역)
> 목적: **즉시실행함수(IIFE) 제거 + `scwin.onpageload` 오버라이딩 래핑 제거** → 명명 함수로 분리하고 `scwin.onpageload` 진입 시 순차 호출.

---

## 1. 현재 구조의 문제점

2구역(초기화 영역, L167~207)에 **자동 실행 IIFE 4개**와 **onpageload 오버라이딩 래핑 1개**가 섞여 있어, 실행 시점이 스크립트 로딩 시점과 `onpageload` 시점으로 분산되어 있습니다.

| # | 위치 | 형태 | 하는 일 |
|---|------|------|---------|
| A | L167~173 | 동기 IIFE | `td_16` 동적 HTML 속성 설정(`applyAttrReals`)을 `setTimeout` 950/2400/5000ms 로 예약 |
| B | L178~184 | async IIFE | `dma_pageContext.sysYear` 없으면 서버 연도로 충전(`__fillNow`) |
| C | L187~192 | async IIFE | `btn_goWrite` 런타임 표시 조건 평가(`evalConds`)를 즉시+setTimeout 4회 실행, `scwin.init_conds` 정의 |
| D | L200~207 | 오버라이딩 IIFE | `var __prev = scwin.onpageload;` 로 기존 onpageload 를 래핑해 `init_recvParam`·`init_conds` 를 앞에 끼워 넣음 |

- **로딩 시점 자동 실행**(A·B·C 본문)과 **onpageload 시점 실행**(D)이 뒤섞여 실행 순서를 코드만 보고 파악하기 어렵습니다.
- A·C 는 컴포넌트 렌더링을 기다리려 `setTimeout` 다중 예약에 의존 — 화면 생명주기와 무관한 임의 지연이라 취약합니다.
- D 의 `__prev` 래핑은 `scwin.onpageload` 가 이미 정의됐다는 가정(L194 스텁)에 의존하는 우회 패턴입니다.

---

## 2. 개선 방향

1. **IIFE 4개를 모두 명명 함수(`scwin.init_*`)로 분리** — 정의만 하고 자동 실행하지 않는다.
2. **`scwin.onpageload` 를 단일 정의**로 작성하고, 그 안에서 `init_*` 를 **순차 호출**한다(오버라이딩·`__prev` 제거).
3. **`scwin.onpageload` 는 2구역 최상단에 정의**한다(code-convention 초기화 절 — `init_*` 보다 앞).
4. `body` 의 `ev:onpageload="scwin.onpageload"` 바인딩은 그대로 두면 진입점이 된다(L265).
5. 화면 진입점이므로 규칙 26에 맞춰 `try/catch + $c.exception.handleError` 로 감싼다.

---

## 3. 변경 후 코드 (2구역 전체 교체)

기존 L167~207 을 아래로 교체합니다.

각 함수에는 표준 JSDoc(`@method`/`@name`/`@description`/`@returns`/`@hidden`/`@example`)을 붙인다(아래는 JSDoc 생략 요약).

```javascript
///////// 2. 초기화 영역 /////////

// D. 화면 진입점 — 2구역 최상단에 정의, init_* 순차 실행 (오버라이딩·__prev·setTimeout 제거)
scwin.onpageload = function () {
    try {
        scwin.init_recvParam();  // 1) 파라미터 수신 (sysYear/listStatCd 확보)
        scwin.init_fillNow();    // 2) sysYear 미수신 시 서버 연도 충전
        scwin.init_attrReals();  // 3) 안내 문구 동적 렌더 (sysYear 확정 후)
        scwin.init_conds();      // 4) 버튼 표시 조건 평가
    } catch (ex) {
        $c.exception.handleError(ex, { context: "jldfil25900.onpageload" });
    }
};

// A. td_16 동적 HTML 속성 설정 (구 __attrReals IIFE)
scwin.init_attrReals = function () {
    const attrReals = [{
        childId: "td_16",
        attr: "__html",
        fn: function () {
            const sysYear = String($c.data.readValue("dma_pageContext", "sysYear", { silent: true }));
            if (sysYear.trim() === "") return "";
            return "『배당기준일자 신고』작성하는 화면입니다.<br/> <span style=\"color:red\">" + sysYear
                + "</span>년도 배당기준일 신고는 반드시 <span style=\"color:red\">작성하기</span> 버튼을 눌러서 제출해주시기 바랍니다. (※ "
                + (Number(sysYear) - 1) + "년도 신고내용 수정·제출 금지)";
        }
    }];
    $c.util.applyAttrReals(attrReals);
};

// B. dma_pageContext.sysYear 서버 연도 충전 (구 __fillNow IIFE)
scwin.init_fillNow = function () {
    const pc = $c.util.getComponent("dma_pageContext");
    if (pc && pc.set && !pc.get("sysYear")) {
        pc.set("sysYear", $c.date.getServerDateTime("yyyy"));
    }
};

// 화면 전환 파라미터 수신 (공용 $c.data.recvParamData, 이름 고정 "paramData")
scwin.init_recvParam = function () {
    $c.data.recvParamData("dma_pageContext");
};

// C. btn_goWrite 런타임 표시 조건 평가 (구 evalConds IIFE) — 엄격 비교(===)
scwin.init_conds = function () {
    const binds = [{
        id: "btn_goWrite",
        fn: function () {
            return $c.data.readValue("dma_pageContext", "listStatCd", { ctx: true, label: "listStatCd" }) === "Y";
        }
    }];
    $c.util.evalConds(binds);
};
```

또한 L196~197 의 잔재 선언(`scwin.result = undefined; scwin.modifiyDate = undefined;`)과 L162 의 `scwin.modifiyDate = "N";` 는 5구역 `fn_modifiyDate` 가 실제로 값을 채우므로, **1구역에 `scwin.result = "";` `scwin.modifiyDate = "";` 한 벌만 남기고** 2구역 잔재 재선언은 삭제합니다. L194 의 onpageload 빈 스텁(`if (typeof scwin.onpageload !== 'function')`)도 불필요하므로 제거합니다.

---

## 4. 핵심 변경 요약

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| IIFE | `(function(){…})()` / `(async function(){…})()` 4개 자동 실행 | `scwin.init_attrReals`/`init_fillNow`/`init_conds` 명명 함수 (자동 실행 없음) |
| onpageload | `var __prev = scwin.onpageload;` 래핑 + 스텁 생성 | `scwin.onpageload` 단일 정의, `init_*` 순차 호출 |
| 실행 시점 | 로딩 시점 자동 실행 + onpageload 혼재 | 전부 `onpageload` 진입 시 순차 |
| 지연 처리 | `setTimeout` 950/2400/5000ms 등 다중 예약 | 순차 호출로 순서 보장 (임의 지연 제거) |
| 오류 처리 | IIFE별 개별 try/catch 산재 | 진입점 단일 try/catch + `handleError` (규칙 26) |

---

## 5. 실행 순서 근거

`init_*` 호출 순서는 **데이터 의존성**을 따릅니다:

1. `init_recvParam` — 부모 화면에서 `sysYear`·`listStatCd` 를 `dma_pageContext` 로 수신
2. `init_fillNow` — 위에서 `sysYear` 가 안 왔으면 서버 연도로 폴백 충전 (안내 문구·연도 계산의 선행 조건)
3. `init_attrReals` — 확정된 `sysYear` 로 `td_16` 안내 문구 렌더 (구 코드가 setTimeout 으로 데이터를 기다리던 것을 순서 보장으로 대체)
4. `init_conds` — 수신된 `listStatCd` 로 `작성하기` 버튼 표시 여부 평가

> 참고: 구 코드의 `setTimeout` 다중 예약은 "데이터가 언젠가 채워질 것"을 기다리는 취약한 패턴이었습니다. 파라미터 수신(`recvParamData`)이 동기적으로 완료된 뒤 렌더/조건 평가를 호출하면 지연이 불필요합니다. 만약 `recvParamData` 가 비동기라면 `init_recvParam`/`onpageload` 를 `async`/`await` 로 전환하고 나머지 `init_*` 를 그 뒤에 `await` 순차 배치하세요.

---

## 6. code-convention 규약 적용 (3·4·5구역 전반)

2구역 초기화 개선과 함께, `code-convention.md` 의 나머지 규약을 3·4·5구역에도 적용한다.

### 6.1 오류 처리 (오류 처리 절·규칙 26)
- **진입점(3구역 이벤트 핸들러)만** `try/catch` 로 받고, `catch` 는 `await $c.exception.handleError(ex, { context: "화면ID.함수명" })` **한 줄로 통일**한다.
- **빈 catch·이중 중첩 catch 금지**: `try { if (typeof $c...) {...} } catch (_ehx) {}` 형태의 방어적 이중 래핑을 제거한다.
- **내부 업무 함수(4·5구역)는 예외를 전파**한다 — 서브미션 함수(`tx_fn_modifiyDate`)의 `executeDynamic` 자체 try/catch, 업무 함수(`fn_modifiyDate`)의 파싱 try/catch 를 제거해 진입점으로 올린다.
- `console.warn`/`console.log` 로 오류를 삼키고 종료하지 않는다.

### 6.2 변수·문법 (변수·문법 규칙)
- **엄격 비교**: `success == true` → `=== true`, `listStatCd == "Y"` → `=== "Y"`. (단 `!= null` null/undefined 동시 판별 관용구는 유지)
- **`const` 기본**: 재할당 없는 `let res`/`let dl`/`let r` → `const`.
- **미사용 변수 삭제**: 이벤트 핸들러의 미사용 지역변수(`let ev = e; let event = ev; let __self = …`) 제거.
- **미사용 `scwin` 전역 삭제**: W-Craft 잔재 재선언(`scwin.result = undefined; scwin.modifiyDate = undefined;`)을 제거하고 1구역 1벌(`""`)로 정리.
- **미참조 컴포넌트 캐싱 전역 삭제(44개)**: W-Craft 변환기가 body 컴포넌트를 전부 `scwin.X = $c.util.getComponent('X')` 로 자동 캐싱했으나 스크립트에서 `scwin.X` 로 쓰지 않는 것(`table_9`·`col_11`·`td_15` 등 body 부재 죽은 참조 포함)은 삭제한다. 함수는 `$c.util.getComponent(...)` 직접 조회 방식이라 무영향. 실사용 캐싱·상태값(`result`·`modifiyDate`)·`screenId` 는 유지.

### 6.3 주석 (JSDoc 표준)
- **전 함수에 표준 JSDoc**(`@method`/`@name`/`@description`/`@returns`(+`@param`)/`@hidden`/`@example`)을 부여한다. placeholder(`@description desc`·빈 `@description`) 금지.

### 6.4 명명 (명명 규칙)
- 5구역 업무 함수는 `scwin.${camelCase}`. 이 파일은 외부 계약(`fn_modifiyDate`/`tx_fn_modifiyDate` 는 호출자 정합용 as-is 별칭)이 있어 개명 보류이나, 신규 5구역 함수는 camelCase 로 명명한다.

### 6.5 중복 제거
- 무의미한 자기 대입(`scwin.goWrite = scwin.goWrite;`·`scwin.goView = scwin.goView;`) 삭제.
- `fn_modifiyDate` 의 중첩 IIFE(JSON.stringify→parse 왕복) 파서를 평탄한 `body` 추출로 단순화(로직 동등).

---

## 7. 검토 체크리스트

- [ ] IIFE(`(function`, `(async function`) 자동 실행 잔존 0건
- [ ] `__prev` / `var __prev = scwin.onpageload` 오버라이딩 잔존 0건
- [ ] `setTimeout(` 예약 호출 제거 (순차 호출로 대체)
- [ ] `scwin.onpageload` 정의 1건, **2구역 최상단 배치**, `body ev:onpageload` 바인딩 유지
- [ ] `scwin.result`/`scwin.modifiyDate` 선언 1구역 1벌로 정리(2구역 재선언 삭제)
- [ ] 빈 catch·이중 중첩 try/catch 0건, 내부 함수 예외 전파
- [ ] 비엄격 `==`/`!=` (코드) 0건(관용구 `!= null` 제외), 재할당 없는 `let` 0건, 미사용 지역변수 0건
- [ ] 전 함수 JSDoc 완비(placeholder 0), 자기 대입 0건
- [ ] 미참조 `scwin.X = getComponent('X')` 캐싱 전역 0건(실사용·상태값·screenId 제외)
- [ ] Node 구문검사 + `wsxml_lint` 통과
```
