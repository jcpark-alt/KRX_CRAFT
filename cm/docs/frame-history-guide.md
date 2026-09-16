# 화면 이동 히스토리·데이터 복원 가이드 (moveUrl / setPageFrameSrc)

`$c.win.moveUrl`(현재 Frame 이동)·`$c.win.setPageFrameSrc`(특정 PageFrame 이동)로 화면을 이동할 때
브라우저 **뒤로/앞으로 가기**로 이전 화면과 그 화면의 DataCollection 데이터를 복원하는 방법을 정리한다. (2026-08-18 추가)

기존 히스토리 관리는 메뉴 전환(`openMenu` + `pushState`/`changePageState`)만 지원했다.
이번 확장으로 **프레임 내 화면 이동**(목록→상세 등)도 같은 popstate 흐름에서 관리된다.

## 사용법

### 화면 이동 (떠나는 화면에서)

```javascript
// 기본 — 히스토리 기록 없음 (기존과 동일)
$c.win.moveUrl("/fil/detail.xml", { docId : "00001" });

// 히스토리 기록 + 뒤로가기 시 현재 화면 데이터 자동 복원
$c.win.moveUrl("/fil/detail.xml", { docId : "00001" }, {
    isHistory : true,
    dataInfo : {
        dma_search : dma_search.getJSON(),  // 조회조건 dataMap
        dlt_list   : dlt_list.getJSON()     // 목록 dataList (크기 주의 — 아래 참고)
    }
});

// 특정 pageFrame 이동도 동일
$c.win.setPageFrameSrc(pfm_content, "/fil/detail.xml", param, { isHistory : true, dataInfo : {...} });
```

- `isHistory : true` — 이동을 브라우저 히스토리에 기록한다(opt-in, 기본 false — 기존 호출 무영향).
- `dataInfo` — **떠나는 화면**의 DataCollection JSON 스냅샷 `{ 컴포넌트ID : JSON }`.
  뒤로가기로 이 화면에 돌아오면 각 id 의 컴포넌트에 `setJSON` 으로 자동 적용된다.
  `_` 로 시작하는 키(`_pagingInfo` 등)는 **예약 키** — 컴포넌트에 적용하지 않고 paramData 로만 전달된다.

### [목록] 버튼 등 명시적 복귀 이동 — `restoreData` 옵션 (2026-08-20 추가)

브라우저 뒤로가기가 아니라 상세 화면의 **[목록] 버튼**으로 돌아가는 경우 `restoreData : true` 를 지정한다.
이동 대상 화면의 스냅샷(이 화면을 떠날 때 `isHistory` 이동으로 저장된 것)이 있으면 동일한 복원이 수행되고,
없으면 일반 이동으로 동작한다(첫 진입 등).

```javascript
// detail.xml — [목록] 버튼
scwin.btn_list_onclick = function () {
    $c.win.moveUrl("/board/list.xml", null, { restoreData : true });
};
```

### 페이징 상태 복원 — `_pagingInfo` 예약 키 ($c.sbm.setPagingInfo 연동)

`$c.sbm.setPagingInfo` 는 `currentPage`/`recordCountPerPage` 를 **조회 DataMap 에 기록**하므로
조회 DataMap 스냅샷만으로 페이징 위치가 복원된다. 다만 **페이지 리스트 컴포넌트 렌더링**에는
`pagingInfo` 옵션과 `totalCnt` 가 필요하므로 `_pagingInfo` 예약 키로 함께 싣는다:

```javascript
// list.xml — 상세 이동
$c.win.moveUrl("/board/detail.xml", { docId : rowData.docId }, {
    isHistory : true,
    dataInfo : {
        dma_search  : dma_search.getJSON(),   // 조회조건 (currentPage/recordCountPerPage 포함)
        dlt_list    : dlt_list.getJSON(),     // 조회 목록
        _pagingInfo : Object.assign({}, scwin.pagingInfo, { totalCnt : scwin.totalCnt })
    }
});
```

### 복원 진입 처리 (돌아오는 화면에서) — 필수 관례

복원으로 진입한 화면(뒤로가기·`restoreData` 공통)의 `paramData` 에는 **`_isHistoryRestore : true`** 와
`dataInfo` 가 전달된다. 초기 자동조회가 있는 화면은 이를 확인해 조회를 생략해야 복원 데이터가
서버 응답으로 덮어써지지 않으며, 페이지 리스트는 `_pagingInfo` 로 재렌더링한다.

```javascript
scwin.onpageload = function () {
    if ($c.data.getParameter("_isHistoryRestore") === true) {
        // 복원 진입 — 자동조회 생략 (dataMap/dataList 는 자동 적용됨)
        const dataInfo = $c.data.getParameter("dataInfo") || {};
        if (!$c.util.isEmpty(dataInfo._pagingInfo)) {
            scwin.pagingInfo = dataInfo._pagingInfo;
            // 페이지 리스트 컴포넌트 재렌더링 (totalCnt 기반)
            $c.sbm.setPagingInfo(scwin.pagingInfo, "dataM=dma_search", scwin.pagingInfo.totalCnt);
        }
        return;
    }
    scwin.searchList(); // 일반 진입 — 기존 초기조회
};
```

## 동작 원리

`isHistory` 이동 시 공통함수가 3단계를 자동 수행한다:

1. **replaceState** — 떠나는 화면(X)의 현재 history entry 에 `frameInfo`(프레임 id·현재 src)와
   `dataInfo` 스냅샷을 병합한다. *뒤로가기 때 브라우저가 주는 entry 는 X 진입 시점에 만든 것이라,
   떠나는 시점의 데이터를 실으려면 entry 를 갱신(replace)해야 한다 — 이 설계의 핵심.*
2. `setSrc` — 실제 이동 (Promise 완료 대기).
3. **pushState** — 새 화면(Y)의 entry 를 기록 (`paramObj` + frameInfo).

뒤로/앞으로 가기(popstate) 시 `changePageState` → `__changePageState` 가 entry 를 판별한다:
`frameInfo` entry 는 해당 프레임을 기록된 src 로 `setSrc` 복원 후 `dataInfo` 를 적용하고,
프레임이 소멸했으면(레이아웃 전환 등) `menuInfo` entry 로 `openMenu` 폴백한다.

**명시적 복귀(`restoreData`)의 동작**: history entry 는 자기 entry 만 읽을 수 있어 전방 이동으로는
이전 화면 entry 의 스냅샷에 접근할 수 없다. 그래서 1번(replaceState) 시점에 동일 스냅샷을
셸 메모리 레지스트리(`FRAME_RESTORE_SNAPSHOTS`, 키 = 프레임 id + 정규화된 src)에도 이중 저장하고,
`restoreData` 이동 시 대상 src 의 스냅샷을 찾아 popstate 복원과 **동일한 계약**(_isHistoryRestore·
dataInfo 전달 + `setJSON` 자동 적용)으로 처리한다. src 매칭은 contextPath·쿼리스트링을 제거해
정규화하며, 같은 화면에서 다시 떠나면 스냅샷은 최신 것으로 대체된다.

## 제약·주의사항

- **자동조회 관례 필수** — 위 `_isHistoryRestore` 확인이 없으면 화면 초기조회가 복원 데이터를 덮어쓸 수 있다.
- **스냅샷 크기** — history state 는 브라우저 한도가 있다. 직렬화 1MB(`HISTORY_STATE_MAX_LENGTH`) 초과 시
  경고 후 해당 데이터는 기록에서 제외된다(이동 자체는 정상). **대량 그리드는 스냅샷 대신 조회조건(dataMap)만 싣고,
  복원 화면에서 조건 기반 재조회를 권장**한다(이 경우 `_isHistoryRestore` 시에도 조회 수행하되 조건은 복원값 사용).
- 스냅샷은 JSON 라운드트립으로 정제된다 — 함수 등 비직렬화 값은 제거된다.
- **새로고침은 범위 외** — history state 는 남지만 셸이 재부팅되어 프레임 복원 흐름이 성립하지 않는다.
- 스냅샷은 **이동 시점 상태만 유지**된다. 같은 화면에서 다시 이동하면 이전 스냅샷은 새 스냅샷으로 대체된다.
- 프레임 id 재해석(`$c.util.getComponent`)은 셸 scope 기준이다 — 중첩 레이아웃에서의 동작은 실서버 검증 후
  필요 시 id 저장 방식을 보강한다(복원 실패 시 openMenu 폴백 + 콘솔 경고로 방어됨).

## API 요약

| 함수 | 구분 | 설명 |
|------|------|------|
| `$c.win.moveUrl(url, paramObj, option)` | 공개 | 현재 Frame 이동. `option = { isHistory, dataInfo }` |
| `$c.win.setPageFrameSrc(frameObj, url, paramObj, option)` | 공개 | 특정 PageFrame 이동. option 동일 |
| `__moveFrameSrc` / `__stampFrameState` / `__pushFrameState` / `__restoreFrameState` / `__applyRestoreData` / `__sanitizeStateData` | 내부 | 히스토리 기록·복원 구현 (`@hidden Y`) |

메뉴 전환 히스토리(`openMenu`/`pushState`/`changePageState`)와 같은 state 체계를 공유한다.
회귀 테스트: `test/frameHistory.test.js` · 관련 가이드: [popup-opener-guide.md](popup-opener-guide.md)
