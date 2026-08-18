# 팝업에서 부모 화면 접근 가이드 (browserPopup / pageFramePopup)

`$c.win.openPopup` 으로 연 팝업 화면에서 **자신을 연 부모 화면의 `scwin` 함수·컴포넌트에 접근**하는 표준 방법을 정리한다.
KRX 운영 규약상 단순 조회·코드 선택은 `pageFramePopup`, 입력/수정/삭제/상세 등 업무 화면은 `browserPopup` 을 사용하므로
두 방식 모두에서 동일하게 동작하는 공통함수를 제공한다. (2026-08-18 추가)

## 배경 — browserPopup 은 `getParent()` 로 부모에 접근할 수 없다

| 팝업 타입 | 실체 | 부모 접근 통로 |
|-----------|------|----------------|
| `pageFramePopup` | 같은 브라우저 창 안의 WebSquare 팝업(wframe) | pageFrame 계층 — `$c.win.getParent()` 사용 가능 |
| `browserPopup` | `window.open` 으로 뜬 **별도 브라우저 창** | `window.opener` 뿐 — `$p.parent()` 는 부모 화면이 아님 |

browserPopup 자식이 opener 셸 내부 구조(`pfm_main` → 탭/MDI/single 레이아웃)를 직접 탐색하는 코드는
셸 구조 하드코딩이 화면마다 퍼지므로 **금지**하고, 아래 공통함수를 사용한다.

## 동작 원리

1. `$c.win.openPopup(url, { type: "browserPopup", ... })` 호출 시 내부(`_openPopup`)에서
   **호출 화면의 scope 를 popupId 로 등록**한다 (`$c.win` 의 `POPUP_OPENER_SCOPES` 저장소).
   `opts.id` 를 지정하지 않으면 popupId 가 자동 생성된다.
2. WebSquare 엔진은 popupId 를 자식 창 이름/`popupID` 파라미터로 전달하므로,
   자식 화면은 `$c.win.getPopupId()` 로 자기 popupId 를 알 수 있다.
3. 자식의 `$c.win.getOpenerScope()` 가 `window.opener.$c.win.getPopupOpenerScope(popupId)` 를 경유해
   **부모 화면 scope 를 복원**한다. (pageFramePopup 이면 pageFrame 계층 부모를 반환)
4. 팝업이 닫히면 등록 정보는 자동 정리된다.

## 사용법

### 부모 화면 (여는 쪽) — 추가 작업 없음

```javascript
// 기존과 동일하게 열면 된다. (등록은 공통함수가 자동 수행)
$c.win.openPopup("/fil/popup/isurSelect.xml", { type : "browserPopup", width : 800, height : 600 });

// 부모 화면에 자식이 호출할 함수를 정의해 둔다.
scwin.setSelectedIsur = function (rowJSON) {
    dma_isur.setJSON(rowJSON);
    scwin.searchList();
};
```

### 자식 팝업 화면 (열린 쪽)

```javascript
// 방법 1) callOpener — 함수 호출만 필요한 경우 (권장)
$c.win.callOpener("setSelectedIsur", dma_selected.getJSON()); // 반환값도 전달받는다

// 방법 2) getOpenerScope — 부모 컴포넌트/데이터에 직접 접근이 필요한 경우
const openerScope = $c.win.getOpenerScope();
if (!$c.util.isEmpty(openerScope)) {
    openerScope.scwin.searchList();
    const parentValue = openerScope.dma_search; // 부모 화면의 DataMap 등 컴포넌트 접근
}
```

`getOpenerScope()`/`callOpener()` 는 **pageFramePopup 에서도 동일하게 동작**한다
(내부에서 `$p.parent()` 로 폴백). 팝업 타입에 따라 코드를 분기할 필요가 없다.

## 닫기 콜백 채널과의 선택 기준

| 상황 | 사용 |
|------|------|
| 팝업을 **닫으면서 결과만** 부모에 넘기면 되는 경우 | 기존 채널 유지 — 부모: `openPopup(url, opts, { callbackFn : scwin.onPopupClose })` · 자식: `$c.win.closePopup(callbackParam)` |
| 팝업이 **떠 있는 동안** 부모 조회/갱신 등 조작이 필요한 경우 | `$c.win.callOpener()` / `getOpenerScope()` |

## 제약·주의사항

- **same-origin 전제**: browserPopup 은 `window.opener` 를 쓰므로 부모와 같은 출처여야 한다(현 구조는 동일 contextPath 라 충족).
  서버가 `Cross-Origin-Opener-Policy: same-origin` 응답 헤더를 내리면 opener 참조가 끊겨 **전부 동작하지 않는다** — 배포 서버 헤더 확인 필요.
- **부모 창 수명**: 부모 창이 닫히거나 새로고침되면 접근 불가 — 두 함수 모두 이 경우 **null / undefined 를 반환**할 뿐 예외를 던지지 않으므로,
  반환값 확인 후 사용한다. 부모 화면(탭/MDI 창)이 먼저 닫힌 경우도 동일하다.
- 자식 화면의 **onpageload 이후** 사용한다(공통 라이브러리 로딩 이후).
- 사용자가 자식 창을 X 버튼으로 직접 닫는 등 closeAction 이 타지 않는 경로에서는 등록 정보가 남을 수 있으나,
  scope 참조일 뿐이며 다음 등록/부모 새로고침 시 정리된다.

## API 요약

| 함수 | 위치 | 설명 |
|------|------|------|
| `$c.win.getOpenerScope()` | 자식 팝업 | 부모 화면 scope 반환 (불가 시 null) — browserPopup/pageFramePopup 공통 |
| `$c.win.callOpener(fnName, ...args)` | 자식 팝업 | 부모 `scwin[fnName](...args)` 호출·반환값 전달 (불가 시 undefined) |
| `$c.win.getPopupOpenerScope(popupId)` | 내부 연동용 | opener 창에서 popupId 로 등록 정보 조회 — 업무 화면 직접 사용 비권장 |

상세 시그니처는 [gcc API 문서](api/gcc/index.html) `$c.win` 절 참고. 회귀 테스트: `test/popupOpenerScope.test.js`.
