# 버튼 상태 일괄 제어 가이드 (`$c.util.setButtonState`)

화면의 버튼 그룹을 업무 상태(신규/수정/오류 등)에 따라 한 줄로 일괄 활성/비활성하는 방법을 정리한다. (2026-08-26 추가)
담당 함수는 `src/gcc/util.xml` 의 `setButtonState`(적용)·`registerButtonState`(전용 상태 등록)다.

화면마다 버튼 id가 제각각이어도, **역할(role)→버튼 id 매핑 한 번만 선언**하면 상태명 하나로 그룹 전체 버튼이 정책대로 제어된다.
상태별 활성 정책은 공통(`BTN_STATE_MAP`)이 보유하므로 화면에 정책 코드를 복사할 필요가 없다.

## API

```javascript
$c.util.setButtonState(groupId, status, btnMap, opt)
```

| 인자 | 타입 | 설명 |
|------|------|------|
| `groupId` | String | 버튼 그룹 요소 id (로그 식별용, 예: `"grpBtnBox"`) |
| `status` | String \| Object | 상태명 또는 즉석 상태 객체 `{ enable: [역할..]\|"*", disable: [역할..] }` |
| `btnMap` | Object | 역할→버튼 id 매핑 (일부 역할만 선언 가능) |
| `opt` | Object(선택) | `{ override: { 역할: true\|false } }` — 화면별 최종 예외 |
| 반환 | Boolean | 적용 수행 여부 (미정의 상태 등 방어 실패 시 `false`) |

```javascript
$c.util.registerButtonState(name, stateDef)   // 전용 상태 등록: ("printReady", { enable: ["new","print"] })
```

## 표준 상태 6종

| 상태 | 정책 | 비고 |
|------|------|------|
| `insert` | [신규]·[저장]만 활성 | |
| `update` | 전체 활성, [저장]만 비활성 | `"*"` + 예외 방식 |
| `disabled` | 전부 비활성 | |
| `enabled` | 전부 활성 | |
| `error` | [기안]만 활성 | |
| `insertReady` | [신규]만 활성 | |

**표준 역할 키**: `new`(신규) · `save`(저장) · `modify`(수정) · `delete`(삭제) · `guide`(안내문) · `draft`(기안)
※ `"new"`·`"delete"`는 예약어이므로 객체 키에 **따옴표 표기** 필수.

**동적 역할**: 표준 외 역할(`print` 등)을 매핑에 자유롭게 추가할 수 있다. 목록형 상태(insert 등)에서는 **자동 비활성**(안전 기본값),
`"*"` 상태(update·enabled)에서는 자동 활성된다 — 상태 정의를 수정할 필요가 없다.

**판정 우선순위**: `override[역할]` > `state.disable` > `state.enable("*"|목록)` > 기본 `false`

## 샘플 코드 (화면 적용 전체 흐름)

```javascript
///////// 1. 변수 및 선언 영역 /////////

// 이 화면의 역할→버튼 매핑 — 버튼 id 는 화면마다 달라도 된다.
scwin.BTN_MAP = {
    "new"    : "btn_add",       // [신규]
    save     : "btnSv01",       // [저장]
    modify   : "btn_edit",      // [수정]
    "delete" : "btnRemove",     // [삭제]
    guide    : "btn_notice2",   // [안내문]
    draft    : "btnGian",       // [기안]
    print    : "btn_prt"        // [출력] — 동적 추가 역할
};

///////// 2. 초기화 영역 /////////

scwin.onpageload = function () {
    try {
        // (선택) 화면 전용 상태 등록 — 신규·출력만 활성
        $c.util.registerButtonState("printReady", { enable: ["new", "print"] });

        // 초기 상태 적용
        $c.util.setButtonState("grpBtnBox", "insertReady", scwin.BTN_MAP);
    } catch (ex) {
        $c.exception.handleError(ex, { context : "화면ID.onpageload" });
    }
};

///////// 4. 서브미션 콜백 영역 /////////

// 조회 결과에 따라 상태 전환 — 실무의 대표 사용 지점
scwin.sbm_select_submitdone = function (e) {
    if (dlt_list.getTotalRow() > 0) {
        $c.util.setButtonState("grpBtnBox", "update", scwin.BTN_MAP);
    } else {
        $c.util.setButtonState("grpBtnBox", "insert", scwin.BTN_MAP);
    }
};

///////// 5. 일반/업무 함수 영역 /////////

// 화면별 예외 — update 상태지만 이 화면은 [삭제] 항상 잠금
$c.util.setButtonState("grpBtnBox", "update", scwin.BTN_MAP, { override: { "delete": false } });

// 등록해 둔 전용 상태 사용
$c.util.setButtonState("grpBtnBox", "printReady", scwin.BTN_MAP);

// 즉석 상태 — 등록 없이 1회성 정책
$c.util.setButtonState("grpBtnBox", { enable: ["print"] }, scwin.BTN_MAP);

// 오류 발생 시 — catch 안에서 error 상태 전환 예
try {
    await scwin.save();
} catch (ex) {
    $c.util.setButtonState("grpBtnBox", "error", scwin.BTN_MAP);
    await $c.exception.handleError(ex, { context : "화면ID.save" });
}
```

## 동작 규칙·주의사항

1. **매핑에 없는 버튼은 건드리지 않는다** — 그룹 내 다른 버튼에 부작용이 없다.
2. 매핑된 버튼이 화면에 없거나 `setDisabled` 미지원이면 **콘솔 경고 후 건너뛰고 나머지는 정상 적용**된다.
3. 미정의 상태명을 넘기면 **아무 것도 적용하지 않고 `false` 반환**(콘솔 경고) — 반환값으로 방어 확인이 가능하다.
4. 상태 정책 변경 시: 전사 공통이면 `BTN_STATE_MAP` 수정, 화면/프로젝트 한정이면 `registerButtonState`, 1회성이면 즉석 객체 — 이 순서로 좁은 범위를 택한다.
5. 동일 버튼 id가 화면 내 중복되는 구조에서는 전역 조회(`getComponent`) 특성상 오적용 가능성이 있다 — 해당 사례가 있으면 공통 담당(gcc)에 그룹 하위 탐색 보강을 요청한다.

## 참고

- 실행 가능한 데모: `src/conversion/sample-front/ui/SMPBTN10000.xml` ([샘플 카탈로그](../conversion/md/sample_templates.md) "상태별 버튼 제어가 있는 화면" 유형)
- API 명세: [api/gcc/index.html](api/gcc/index.html) ($c.util 모듈, `npm run docs:gcc` 자동 생성)
- 도입 이력: [gcc_update_history.md](gcc_update_history.md) 2026-08-26 항목(`d0f21d9`·`ef9628d`)
