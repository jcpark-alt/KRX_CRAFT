# gcc 공통 함수 업데이트 이력

`src/gcc/` 공통 라이브러리(`$c.*`)의 최초 반입(2026-06-08, `92a35bd`) 이후 변경 내역 정리 (최종 갱신 2026-08-21).
API 명세는 [api/gcc/index.html](api/gcc/index.html)(자동 생성, `npm run docs:gcc`) 참고. 2026-08-21 기준 **11개 모듈 / 281개 공개 메서드**.

> `src/cm/gcc/`는 CM 모듈용 사본으로 일반적 개선만 선별 반영해 왔으나(2026-06-10 병합, 2026-07-22 대규모 동기화로 11파일 체제),
> **2026-08-18 `26af3d5`에서 사용 중단으로 삭제**되어 `src/gcc/`가 유일한 canonical 라이브러리다.
> 아래에서 별도 표기가 없으면 `src/gcc/` 기준이며, "cm 동기화"로 표기된 항목은 삭제 이전 두 트리에 함께 반영되었던 것이다.

---

## 요약: 모듈별 주요 변화

| 모듈 | 주요 변화 |
|------|-----------|
| `sbm.xml` (`$c.sbm`) | 중복 제출 가드, `executeDynamic` 간소화 ref/target 문법·gridview 자동 바인딩·`autoFocus`·다중 gridview 바인딩·스피너 오버레이·message 옵션(opt-in), RESTful URL 활성화, 단건 ref(DataMap)→`requestData` 추출, 페이징(`setPagingInfo`) 개선 — `maxRowNum "all"` 전체 행 표시·`rowNumVisble desc` 내림차순 순번, 그리드 DOM `render` 참조 전환 |
| `data.xml` (`$c.data`) | 공통코드 로딩(`COMMON_CODE_INFO.ACTION` 연동, `setCommonCode` 배열 매핑 → 통합 목록+`mappingKey` 필터 개편·응답 언래핑·기본 컬럼 cdVal/cdValNm·label/valueColumn 문자열 지원·조회 url/paramName 옵션), JSON 헬퍼 8종, 프로세스 메시지, 콤보 공통코드 세팅(`comboCbDataSet*`) 계열, 업로드/리포트 헬퍼, 엑셀 다운로드 기본 옵션 개선 |
| `win.xml` (`$c.win`) | 외부망 홈(`goHomeEx`), 프로그램 열기/내비게이션 단순화, `openFormSubmit`, 인쇄(`mainPrint`/`popupPrint`), `success`/`error` 알림, `openExternalPage`, **browserPopup 부모 화면 접근**(`getOpenerScope`/`callOpener`), 히스토리 기록·복원(`pushState`/`changePageState`) 결함 수정 및 `moveUrl`/`setPageFrameSrc` 이동 복원 확장(`restoreData` [목록] 복귀 포함) |
| `util.xml` (`$c.util`) | 쿠키/웹스토리지 헬퍼 13종, 업로드(`onUploadClick`/`getUploadFiles` 등), `setTextLengthCounter`, `checkFileExtension`, 엑셀 다운로드 파일명 개선, `setGridVisibleRowNum`(gridView "all" 동적 적용) |
| `date.xml` (`$c.date`) | 날짜 포맷 검증(`checkCalendarFormat`/`compareFromToDate`), `getDateInterval` 단위 버그 수정, commonPrototype 의존 제거 |
| `str.xml` (`$c.str`) | validate 중복 검증기 통합, 목적격 조사(`attachObjectPostposition`), 바이트/포맷 함수 자체 구현 전환 |
| `session.xml` (`$c.session`) | **신설**(2026-06-09) — 세션 체크, 로그인/사용자 정보 관리 |
| `validate.xml` (`$c.validate`) | DataCollection/DataGroup 검증, `validateSiteUrl` |
| `ext.xml` | SB차트 연동(`drawSBChart`/`drawChartData`) |

---

## 2026년 6월

### 기반 구축 (06-08 ~ 06-09)
- `92a35bd` — gcc/ins/mgt/stf를 `src/` 하위로 반입(**최초 기준선**).
- `e0463bc` — API 문서 생성기(`wsxml_lint.docgen`) 도입, `src/docs/api/gcc/index.html` 자동 생성 체계 시작.
- `b220b87` — `$c.util`에 쿠키/localStorage/sessionStorage 헬퍼 13종 추가 (`getCookie`/`setCookie`/`removeCookie`, `get/set/remove/clearLocalStorage`, `get/set/remove/clearSessionStorage`, 내부 `__getWebStorage`/`__setWebStorage`).
- `5c3d6de` — `validate.xml`의 중복 검증기를 `$c.str`로 통합(단일 정의 원칙).
- `d78cc94` — `$c.data.serializeFormToQueryString` 추가.
- `1bce502` — **`session.xml`(`$c.session`) 신설** — `sessionCheck` 등 세션 관리 시작.

### 서버 통신·공통코드 정비 (06-10 ~ 06-16)
- `7da21f9` — `$c.sbm.execute`/`executeDynamic`에 **중복 제출 가드**(`__applyDuplicateGuard`) 이식(cm/gcc 체리픽).
- `c515bf1` — `$c.data` 공통코드 로딩을 `COMMON_CODE_INFO.ACTION`(cdVal/cdValNm)에 연결.
- `783059b`, `ea4f002` — `$c.win.goHomeEx`(외부망 홈 이동) 추가, 랜딩 경로를 `HOME_EX_URL` 상수로 추출.
- `1fcbd67` — `$c.sbm.executeDynamic` **간소화 ref/target 문법 + gridview 자동 바인딩**(`__normalizeRefTarget`, `__bindResponseToTargets`).
- `6196ac2` — `$c.data.showProcessMessage`/`hideProcessMessage` 추가.
- `684bd9f` — RESTful URL 활성화, gridview 행번호 기본 표시.
- `902fe60` — `$c.win` 프로그램 열기/내비게이션 로직 단순화.
- `1988999` — docgen이 async 함수를 누락하던 버그 수정 + `$c.util.downFile`/`getExcelDownPath`/`getUploadFileSize` 정비.

### 세션·업로드·데이터 헬퍼 확충 (06-17 ~ 06-29)
- `ab52155` — `$c.util.setTextLengthCounter`(입력 길이 카운터), `$c.sbm` 다중 gridview 바인딩, `$c.session.setUserInfo`/`setSampleUserInfo`.
- `e111131` — `$c.session.info` → **`getUserInfo`로 개명**.
- `3ed3850` — `$c.util.onUploadClick` 추가, `$c.data.__getChangeCheckedMainFrame` 가드 보강.
- `15aa052` — `executeDynamic` gridview **`autoFocus` 옵션** 추가(`__resolveAutoFocus`).
- `46388f9` — 일괄 정비: `$c.session.goIndex`/`goLogout`, `$c.str.attachObjectPostposition`, `$c.validate.validateDataCollection`/`validateDataGroup`, `$c.data.loadCommonMessage`, `$c.sbm.__parseGridview`.
- `ec8dc9e` — 공통 메시지를 `WebSquare.WebSquareLang`에서 소싱.
- `c94e705` — `$c.data.getDiffJSON` 추가.
- `41005a3` — `$c.data` **JSON 헬퍼 8종**: `pickJSON`/`omitJSON`/`keyByJSON`/`groupByJSON`/`deepClone`/`mergeJSON` + 내부 `__getPlainJSON`/`__getPlainArray`.
- `150e962` — `$c.win` `pfm_main` 접근을 옵셔널 체이닝으로 가드.
- `9d819e0` — `$c.sbm` 단건 ref(DataMap) → `requestData` 자동 추출, session/win 정리(`goLogin`/`isLogin`/`sessionCheck`).

## 2026년 7월

- `c63c4f5` (07-22) — **공통 라이브러리 대규모 확충 + cm/gcc 동기화**(cm이 session/validate 포함 11파일 체제로 확장):
  - `$c.data`: `comboCbDataSet`/`comboCbDataSetLimit`/`comboCbDataSetPeriod`(콤보 공통코드 세팅), `getSingleUploadFileInfo`, `bindDragDropUpload`, `openReportPdf`
  - `$c.win`: `openExternalPage` · `$c.util`: `setGridViewDelCheckBox` · `$c.validate`: `validateSiteUrl`
  - `ext.xml`: SB차트 연동 `drawSBChart`/`drawChartData`(내부 `__drawSBChart`)
- `ac82daf`, `fde0593` (07-23) — `$c.win.openFormSubmit`(폼 POST 제출 열기) 추가, JSDoc `@hidden` 위치 정리.
- `26014e4` (07-24) — `$c.util.checkFileExtension`(업로드 확장자 검사) 추가.

## 2026년 8월

- `8424047` (08-06) — 공개 함수 추가(cm 동기화):
  - `$c.date`: `checkCalendarFormat`/`compareFromToDate`(캘린더 포맷·기간 검증, 내부 `__checkDateFormat`)
  - `$c.data`: `comboCbDataSetDynamic`/`comboCbDataSetPaging` · `$c.win`: `mainPrint`/`popupPrint` · `$c.session`: `removeUserInfo`
- `d7cfd2f` (08-12) — `$c.win.success`/`error`(결과 알림), `$c.util.getUploadFiles` 추가, 페이징·공통코드·엑셀 다운로드 파일명 개선 및 결함 수정(cm 동기화).
- `0e4499c`, `dc90349` (08-12) — `$c.data.setCommonCode` **옵션 확장**: `filedArr`·`code` 배열 매핑 지원(+JSDoc 예제, Jest 회귀 테스트 `test/setCommonCode.test.js`).
- `94ccf1a`, `8746b80` (08-12) — `executeDynamic` gridview 옵션 `nomessage` → **`message`(opt-in)** 전환, gridview **스피너 오버레이** 기본 적용(내부 `__showGridSpinner`/`__hideGridSpinner`/`__gridSpinnerId`, Jest 테스트 `test/gridSpinner.test.js`·`test/parseGridviewMessage.test.js`).
- `918d0f7` (08-13) — `$c.date`/`$c.str` 오류 수정 및 **commonPrototype.js 의존 완전 제거**(cm 동기화):
  - `getDateInterval`: `"m"`(분)이 월로 처리되던 단위 버그 수정, 알 수 없는 단위 시 `NaN` 대신 `null` 반환
  - `getDateInterval`/`getWeekStartEndDay`: `String.prototype.toDate`/`Date.prototype.format` 대신 자체 헬퍼(`$c.date.fromYmd`/`formatDateTime`) 사용
  - `dateFormat`: `formatDateTime` 위임 / `dateUnFormat`: 비숫자 제거 자체 구현(format 파라미터 제거)
  - `getByteSubstring`/`stringFormat`/`stringUnFormat`: 자체 구현 전환(바이트 계산은 `WebSquare.util.getStringByteSize` 재사용, `stringFormat`의 delLength 파라미터 제거)
- `81ef0d1` (08-18) — KRX 신규 API 대응 및 결함 수정(cm 동기화):
  - `$c.data.__getCommonCodeData`: 단일 code 조회의 key 래핑 응답을 첫 key 목록으로 **언래핑** (배열 code 조회의 key 맵은 배열 매핑에서 쓰므로 제외)
  - `$c.data.downloadGridViewExcel`: 기본값 개선 — `type` "1"(보이는 데이터), `useStyle`/`useClass` "true", `bodyWordwrap` 기본 true(`|| true` 상시 참 버그를 null 병합으로 수정해 명시적 false 지원)
  - `$c.sbm.__eachGridElement`: 그리드 DOM 참조를 `getElement()` 대신 `render` 속성으로 변경
  - `$c.win`: `pushState` 단순화(contextPath 단일 URL), `openMenu` 들여쓰기·JSDoc 정리
- `26af3d5` (08-18) — **`src/cm/` 폴더 삭제** (사용 중단): `src/gcc` 단일 canonical 체제로 전환.
  Jest 테스트 대상을 gcc 단독으로 축소(34→17), CLAUDE.md·`cm-gcc-merge.md` 폐기 공지 반영.
- `0a551a2` (08-18) — **browserPopup 부모 화면 접근 공통함수** 추가(`$c.win`, 277→280 메서드):
  - `getOpenerScope`(부모 scope 복원 — browserPopup은 `window.opener`+오프너 등록 정보, pageFramePopup은 `$p.parent()` 폴백), `callOpener`(부모 scwin 함수 호출·반환값 전달), `getPopupOpenerScope`(opener 창 조회용)
  - `_openPopup`이 browserPopup 오픈 시 호출 scope를 popupId로 자동 등록(닫힘 시 정리), 엔진이 자식에 전달하는 popupId를 키로 사용
  - 가이드 문서 [popup-opener-guide.md](popup-opener-guide.md) 신설, 회귀 테스트 `test/popupOpenerScope.test.js` 9건
- `4d8d83e` (08-18) — `$c.win` **브라우저 히스토리 기록·복원 결함 3건 수정**:
  - `openMenu` 탭(T)·MDI(M) 분기의 `pushState($p, data)` 시그니처 불일치 정정 → `pushState(data)` (TypeError로 히스토리 기록이 조용히 실패하던 문제)
  - 동일 분기의 `isEmpty($p, option)`/`isEmpty($p, menuCode)` 2-인자 오호출 정정 (가드 무력화·option 미전달 시 TypeError)
  - `__changePageState`: Back/Forward 복원 시 `openMenu`에 `data.param`(undefined) 대신 저장 구조(`{...paramObj, menuInfo}`)에 맞는 `data` 자체를 전달해 **화면 파라미터 유실 수정**
  - 회귀 테스트 `test/pushState.test.js` 4건 추가
- `59274e5` (08-18) — `$c.win` **moveUrl/setPageFrameSrc 히스토리 기록·데이터 복원 지원**:
  - `option { isHistory, dataInfo }` 추가(opt-in, 기존 호출 무영향) — 메뉴 전환뿐 아니라 **프레임 내 화면 이동**(목록→상세 등)도 뒤로/앞으로 가기로 복원
  - 떠나는 화면 entry에 `replaceState`로 frameInfo+`dataInfo` 스냅샷 병합 → `setSrc` 완료 후 새 화면 entry push (`__moveFrameSrc`/`__stampFrameState`/`__pushFrameState`)
  - `__changePageState`에 frameInfo 분기: 프레임 재해석 → `setSrc` 복원(`_isHistoryRestore` 전달) → `dataInfo`를 DataCollection에 `setJSON` **자동 적용**, 프레임 소멸 시 menuInfo(`openMenu`) 폴백
  - 스냅샷 정제(`__sanitizeStateData`): 함수 제거, 1MB(`HISTORY_STATE_MAX_LENGTH`) 초과 시 제외, 재이동 시 이전 스냅샷 초기화
  - 가이드 [frame-history-guide.md](frame-history-guide.md) 신설(`_isHistoryRestore` 자동조회 skip 관례 포함), 회귀 테스트 `test/frameHistory.test.js` 7건
- `b5875c9` (08-19) — `$c.util.setGridVisibleRowNum` 추가 (280→281 메서드):
  - gridView `visibleRowNum` 동적 변경 — 엔진 `setVisibleRowNum`은 숫자 전용(`parseInt` NaN → false)이라 **"all"이 거부**되는 문제 대응
  - 숫자는 엔진 API 위임, "all"은 `options.visibleRowNum` 직접 변경 후 그리드 재구성(초기화 → tbody 비움 → `drawDataTable(0)`)으로 전체 행 재도색
  - 대량 데이터 사용 금지·엔진 버전 교체 시 재검증 필요 JSDoc 명기, 회귀 테스트 `test/setGridVisibleRowNum.test.js` 4건
- `d086e29` (08-20) — `$c.data.setCommonCode` **통합 목록 매핑 개편** 및 결함 수정:
  - 배열 code 조회를 통합 목록 응답 + `mappingKey` 컬럼 필터 방식으로 변경 (`cdEngNmList` 콤마(%2C) 구분, DataList 키 체계 `dlt_commonCode_{code}`)
  - `mappingKey` 미지정 시 TypeError 가드(미지정 시 전체 목록 바인딩), `downloadGridViewExcel` bodyWordwrap `|| true` 재회귀 수정
  - `setPagingInfo` 다중 헤더 그리드 rowClassName(`h{n}_row`) 처리 개선, 회귀 테스트 새 의미론으로 재작성(4건)
- `e25af76` (08-20) — `$c.win` **moveUrl/setPageFrameSrc `restoreData` 옵션** — [목록] 버튼 복귀 시 화면 상태 복원:
  - `FRAME_RESTORE_SNAPSHOTS` 레지스트리에 스냅샷 이중 저장(키 = 프레임 id + 정규화 src, `__normalizeFrameSrc`) — history entry 는 자기 것만 읽을 수 있는 제약의 우회
  - 대상 화면 스냅샷이 있으면 popstate 복원과 동일 계약(`_isHistoryRestore`·dataInfo 전달 + `setJSON` 자동 적용), 없으면 일반 이동
  - dataInfo `_` 접두 예약 키(`_pagingInfo` 등)는 paramData 로만 전달 — `setPagingInfo` 연동(페이지 리스트 재렌더링용), 가이드·테스트 +3건
- `031b20f` (08-20) — `$c.sbm.setPagingInfo` **maxRowNum "all" 지원**:
  - "all" 이면 `$c.util.setGridVisibleRowNum` 으로 전체 행 표시 전환(즉시 적용 + 라인 수 변경 시, 이미 "all" 이면 재도색 생략)
  - 행 수 제한 클래스(`row{n}`/`h{n}_row{n}`)는 `__removeGridRowNumClass` 로 전부 제거(정규식 매칭), 숫자일 때만 새로 부여
  - 선택값 "all" + 숫자 maxRowNum 은 상한 적용, 회귀 테스트 `test/setPagingInfoMaxRowNum.test.js` 4건
- `21d6352` (08-20) — `$c.sbm.setPagingInfo` **rowNumVisble desc 내림차순 순번 구현** (기존 TO-DO 해소):
  - `__setDescRowNum`: 그리드 연동 DataList 의 rowNum 컬럼에 "전체 건수 − ((현재 페이지−1) × 페이지당 행 수) − 행 인덱스" 순번 설정
  - 통신 후 호출(totalCnt 전달) 시점에 적용, 컬럼명 `rowNumColumn` 재정의 가능, asc 경로 무변경, 회귀 테스트 4건
- `e8dcf07` (08-20) — [연관] **2026-08 gcc 확장분을 변환(conversion) 프로세스에 반영** (`src/conversion`, gcc 라이브러리 무변경):
  - convert.py **규칙 23** 신설 — `{grid}.setVisibleRowNum("all")` → `$c.util.setGridVisibleRowNum(grid, "all")` 결정적 치환(+pytest 6건)
  - 변환 규칙·매핑표·단계 2 워크리스트에 browserPopup 부모 접근(`getOpenerScope`/`callOpener`), 목록↔상세 `restoreData` 복원, 페이징 옵션(`maxRowNum "all"`·desc) 대체, date/str 잉여 인자 정리 지침 추가
- `8e1f43a` (08-20) — [연관] **5단계 정형화 구조 컨벤션 + 서브미션 async/await 순차 변환** (`src/docs/code-convention`·`src/conversion`, gcc 라이브러리 무변경):
  - code-convention.md 정식 규약화: 5구역(선언/초기화/이벤트/**서브미션 콜백**/일반) 블록 헤더, camelCase 명명(fn_ 미사용), async/await 우선 원칙(**submitDoneHandler 를 넘기면 executeDynamic Promise 가 settle 되지 않음** 명기), Thin Event 지침
  - convert.py 규칙 2/4 를 5구역 체계로 개정(콜백 구역 자동 분류·구 주석 마이그레이션), 규칙 6/12/16 이 `const sbmRtn = await executeDynamic(...)` 순차 스타일 방출, await 포함 함수 `async` 자동 부여(+호출부 await 전파 검토 리포트), pytest 8건
- `b376f8e` (08-20) — [연관] **validate-generator 도구 구현** (`src/docs/validate-generator`, gcc 라이브러리 무변경):
  - 화면 XML 분석(dataMap key·gridView 연결 dataList 컬럼·`ref="data:"` 컴포넌트)으로 `$c.validate.validateDataCollect` options 객체·await 호출 스니펫을 생성하는 단일 HTML 도구(의존성 0·file:// 동작·DESIGN.md 준수)
  - 파싱·생성 순수 로직은 Jest 회귀 테스트 6건으로 보호(`test/validateGenerator.test.js`)
- `a9671ab` (08-20) — [연관] **5단계 섹션 헤더를 한 줄 슬래시 형식으로 변경** (`src/conversion`, gcc 무변경):
  - code-convention.md 개정(`///////// n. 영역명 /////////`)에 맞춰 convert.py 방출 형식 교체, 구(舊) 3줄 블록·한 줄 경계 주석 → 현행 헤더 자동 마이그레이션(멱등), pytest 22건
- `f52447d` (08-20) — [연관] **샘플 화면 검증 로직을 validate.xml 공통함수로 전환** (`src/conversion/sample-front`, gcc 무변경):
  - `ULDSTF07404` — 개별 if/alert/focus 검증을 `$c.validate.validateDataCollect`(async, 폼 컨테이너 `grp_mailForm`)로, 체크된 행 이메일 검증을 `$c.validate.validateDataCollection` 단건 검증으로 대체(행 선별 유지, 셀 포커스·편집모드 진입 자동)
  - 샘플 화면 6종(JLDFIL25900/25910·ULDFIL35700/52100/59400/59410) 신규 등록 포함
- `7684e1b` (08-20) — [연관] **wsxml_lint WS120 을 WebSquare 스코프 인지 규칙으로 개정** (`tools/wsxml_lint`, gcc 무변경):
  - dataMap/dataList 내부 id 는 컬렉션별, gridView 내부 `<w2:column>` 은 그리드별 네임스페이스(바인딩 dataList 컬럼 id 일치 = 정상 매핑) — 전문 필드명 재사용·그리드 컬럼 매핑 오탐 해소
  - 새 규칙은 기존 전역 규칙의 부분집합이라 기준선 유지(gcc 11·legacy 227파일 0/0), pytest +6, `ULDSTF07404` 오탐 7건 → 0건
- `7513299` (08-20) — [연관] **Claude Code 스킬·서브에이전트 활용 가이드** 추가(`src/docs/skills/skill.md`, gcc 무변경)
- `d5d377c` (08-20) — [연관] **샘플 화면 3종 추가**(`src/conversion/sample-front/ui`, gcc 무변경): `ULDINF20000`·`ULDSTF30700`·`ULDSTF30702`
- `ef3aaaf` (08-20) — `$c.data` **공통코드 기본 컬럼 cdVal/cdValNm 전환 + labelColumn/valueColumn 문자열 지원**:
  - `COMMON_CODE_INFO` 기본값 변경 — LABEL `"cdValNm"`, VALUE `"cdVal"`, FILED_ARR `["cdValNm","cdVal"]` (KRX 공통코드 API 응답 필드와 일치)
  - `setCommonCode`의 `labelColumn`/`valueColumn` 옵션이 **배열**(컴포넌트별 override, 누락 인덱스는 기본값 폴백)과 **문자열**(전체 공통 적용)을 모두 허용 — `_pickColumn` 헬퍼로 해석 통일(기존엔 문자열 전달 시 `"cdValNm"[compIndex]` 문자 하나가 컬럼명이 되던 잠재 결함)
  - JSDoc `{String|Array}` 갱신, 회귀 테스트 픽스처 cdVal/cdValNm 반영 + 신규 2건
- `714e2d0` (08-20) — `$c.data.setCommonCode` **조회 API url·paramName 옵션 추가**:
  - `url` 옵션 — 지정 시 `COMMON_CODE_INFO.URL` 대신 해당 경로로 조회 (캐시는 code 기준 공유 — 서로 다른 url 조회 시 `useLocalCache:false` 병행 권장 명기)
  - `paramName` 옵션 — 지정 시 기본 쿼리 파라미터명 대신 해당 이름 사용. 기본값은 `COMMON_CODE_INFO.PARAM`("cdEngNm")·`PARAM_LIST`("cdEngNmList") 상수로 분리(배포별 커스터마이즈 지점)
  - 기존 `action` 직접 지정 우선순위 유지, 회귀 테스트 2건 추가
- `0d912ee` (08-21) — `$c.win` **팝업 오프너 등록 키 frameId 접두 + openMenu S 분기 레이아웃 경로 정정**:
  - `POPUP_OPENER_SCOPES` 등록 키를 `${$p.getFrameId()}_${opt.id}` 로 변경 — 웹스퀘어 컴포넌트/팝업 id 는 메인프레임 접두어(`mf_`) 포함 frame id 가 접두되어 빌드되므로 자식의 `getPopupId()` **전체 id 와 등록 키가 일치**(화면 간 동일 팝업 id 충돌 방지)
  - `openMenu` S 분기 — `pfm_gnb` 접근을 `$p.main().pfm_main?.scope` 경유로 변경, `noside` 클래스 제거 대상을 `grp_wrap`(기존 오류) → `pfm_gnb` 로 정정
  - JSDoc·popup-opener-guide 에 `mf_` 접두 전체 id 체계 명기, 테스트 하니스를 실제 id 형식(`mf_frameA_{popupId}`)으로 현실화
- `81cca81` (08-21) — [연관] **UDC 공통 컴포넌트 9종 추가**(`src/udc` 신설, gcc 무변경): bulkFileSaver·codeSelectBoxBasic·fileMultiUpload·fileMultiUploadGrd·fromToCalendar·gridViewFinder·qrCode·qrCode_popup·searchBadge
- `86ab223` (08-21) — [연관] **샘플 화면 10종 갱신 + `ULDFIL52110` 추가**(`src/conversion/sample-front`, gcc 무변경)
- `61c0cfb` (08-21) — [연관] **UDC bulkFileSaver `save`/`saveMapForm` 멀티 dataList·dataMap 지원**(`src/udc`, gcc 무변경):
  - `dataMap`/`dataMapId`/`dataList`/`dataListId` 인자를 단일·배열 모두 수용(`__toArray`/`__partName` 헬퍼) — dataList 별 payload(C/U/D rowStatus 또는 sendAll), 멀티파트 파트명 `rows`/`rows2`…·`data`/`data2`… 자동 부여, 빈 payload 파트 제외 시에도 원래 인덱스 유지
  - `saveMapForm` `onValidate` 하위호환(단일=JSON 객체, 멀티=JSON 배열), 파일 매칭 `{fieldKey}_file_index`+`files` 규약으로 정리(폐기된 `{fieldKey}File` suffix 규칙 사어코드·주석 제거), save 3종·saveMapForm 2종 `@example` 추가
- `8a2973b` (08-21) — [연관] **UDC searchBadge publicInfo·JSDoc 정비 및 옵션 계약 구현**(`src/udc`, gcc 무변경):
  - `publicInfo` 중복 `getDataBindInfo` → `getDataCollectionInfo` 교체(누락 해소), `getValue`/`getText` 를 문서 계약대로 **구분자 join 문자열 반환**으로 구현(`separator` 기본 ","), `bindColumn`·`separator` 옵션 실사용, 사어 `dataMap` 옵션 제거
  - `setJSON([], false)` 전체 비우기 허용, `parseInt` radix, 내부 헬퍼 `__` 접두 리네임(`__initComponent`/`__generateSearchBadge`/`__getValuesByKey`/`__getDataCollection`) 및 오타·예제 일괄 교정
- `8e83956` (08-21) — [연관] 샘플 `ULDFIL52110` 원본 화면 설명 주석 정정(`ULDFIL52100 의무보유주식의 처분` → `ULDFIL52110 법인명 찾기 팝업`, gcc 무변경)

---

## 커밋 이력 (src/gcc)

| 일자 | 커밋 | 제목 |
|------|------|------|
| 2026-08-21 | `8e83956` | fix(sample): ULDFIL52110 원본 화면 설명 주석 정정 — [연관, gcc 무변경] |
| 2026-08-21 | `8a2973b` | refactor(udc): searchBadge publicInfo·JSDoc 정비 및 옵션 계약 구현 — [연관, gcc 무변경] |
| 2026-08-21 | `61c0cfb` | feat(udc): bulkFileSaver save/saveMapForm 멀티 dataList·dataMap 지원 + JSDoc 정비 — [연관, gcc 무변경] |
| 2026-08-21 | `86ab223` | chore(sample): 샘플 화면 10종 갱신 및 ULDFIL52110 추가 — [연관, gcc 무변경] |
| 2026-08-21 | `81cca81` | docs(gcc)+feat(udc): 이력 반영 및 UDC 공통 컴포넌트 9종 추가 — [연관, gcc 무변경] |
| 2026-08-21 | `0d912ee` | feat(win): 팝업 오프너 등록 키 frameId 접두 + openMenu S 분기 레이아웃 경로 정정 |
| 2026-08-20 | `714e2d0` | feat(data): setCommonCode 조회 API url·paramName 옵션 추가 |
| 2026-08-20 | `ef3aaaf` | feat(data): 공통코드 기본 컬럼 cdVal/cdValNm 전환 + labelColumn/valueColumn 문자열 지원 |
| 2026-08-20 | `d5d377c` | chore(sample): 샘플 화면 3종 추가 (ULDINF20000, ULDSTF30700, ULDSTF30702) — [연관, gcc 무변경] |
| 2026-08-20 | `7513299` | docs(skills): Claude Code 스킬·서브에이전트 활용 가이드 추가 — [연관, gcc 무변경] |
| 2026-08-20 | `7684e1b` | feat(lint): WS120 중복 id 검사를 WebSquare 스코프 인지 규칙으로 개정 — [연관, gcc 무변경] |
| 2026-08-20 | `f52447d` | refactor(sample): ULDSTF07404 검증 로직을 validate.xml 공통함수로 전환 — [연관, gcc 무변경] |
| 2026-08-20 | `a9671ab` | feat(conversion): 5단계 섹션 헤더를 한 줄 슬래시 형식으로 변경 — [연관, gcc 무변경] |
| 2026-08-20 | `b376f8e` | feat(docs): validate-generator 도구 구현 — validateDataCollect options 자동 생성 — [연관, gcc 무변경] |
| 2026-08-20 | `8e1f43a` | feat(conversion): 5단계 정형화 구조 + 서브미션 async/await 순차 변환 — [연관, gcc 무변경] |
| 2026-08-20 | `e8dcf07` | feat(conversion): 2026-08 gcc 확장분을 변환 프로세스에 반영 (규칙 23 신설) — [연관, gcc 무변경] |
| 2026-08-20 | `21d6352` | feat(sbm): setPagingInfo rowNumVisble desc 내림차순 순번 구현 |
| 2026-08-20 | `031b20f` | feat(sbm): setPagingInfo maxRowNum "all" 지원 — 전체 행 표시 전환 |
| 2026-08-20 | `e25af76` | feat(gcc): moveUrl/setPageFrameSrc restoreData 옵션 — [목록] 버튼 복귀 시 화면 상태 복원 |
| 2026-08-20 | `d086e29` | feat(gcc): setCommonCode 통합 목록 매핑 개편 및 결함 수정 |
| 2026-08-19 | `b5875c9` | feat(gcc): util에 setGridVisibleRowNum 추가 — gridView visibleRowNum "all" 동적 적용 |
| 2026-08-18 | `59274e5` | feat(gcc): moveUrl/setPageFrameSrc 히스토리 기록·데이터 복원 지원 |
| 2026-08-18 | `4d8d83e` | fix(gcc): 브라우저 히스토리 기록·복원 결함 3건 수정 (win.xml) |
| 2026-08-18 | `0a551a2` | feat(gcc): browserPopup 팝업의 부모 화면 접근 공통함수 추가 |
| 2026-08-18 | `26af3d5` | chore(cm): src/cm 폴더 제거 — src/gcc 단일 canonical 체제로 전환 |
| 2026-08-18 | `81ef0d1` | feat(gcc): 공통코드 응답 언래핑·엑셀 기본옵션·그리드 render 참조 개선 |
| 2026-08-13 | `918d0f7` | fix(gcc): date/str 유틸 오류 수정 및 commonPrototype 의존 제거 |
| 2026-08-12 | `8746b80` | feat(sbm): executeDynamic gridview 스피너 오버레이 추가 (기본 사용) |
| 2026-08-12 | `94ccf1a` | feat(sbm): executeDynamic gridview 옵션 nomessage → message (opt-in) |
| 2026-08-12 | `dc90349` | docs(gcc): setCommonCode JSDoc 배열 매핑 예제 추가 |
| 2026-08-12 | `0e4499c` | feat(gcc): setCommonCode 옵션 확장 (filedArr·code 배열 매핑) |
| 2026-08-12 | `d7cfd2f` | feat(gcc,cm): win success/error·util getUploadFiles 추가, 페이징·공통코드·엑셀 파일명 개선 및 결함 수정 |
| 2026-08-06 | `8424047` | feat(gcc,cm): 공통 라이브러리 공개 함수 추가 및 API 문서 재생성 |
| 2026-07-24 | `26014e4` | feat(gcc): util에 checkFileExtension 추가 및 API 문서 재생성 |
| 2026-07-23 | `fde0593` | style(gcc,cm): openFormSubmit JSDoc @hidden 위치 정리 |
| 2026-07-23 | `ac82daf` | feat(gcc,cm): win에 openFormSubmit 추가 및 API 문서 재생성 |
| 2026-07-22 | `c63c4f5` | feat(gcc,cm): 공통 라이브러리 함수 확충 및 cm/gcc 사본 동기화 |
| 2026-06-29 | `9d819e0` | feat(gcc): sbm 단건 ref(DataMap)→requestData 추출, session/win 정리 |
| 2026-06-26 | `150e962` | win: guard pfm_main access with optional chaining |
| 2026-06-26 | `41005a3` | data: add JSON helpers (pick/omit/keyBy/groupBy/deepClone/merge); regen doc |
| 2026-06-26 | `c94e705` | Import conversion ui sources; add data.getDiffJSON; regen API doc |
| 2026-06-25 | `ec8dc9e` | data: source common messages from WebSquare.WebSquareLang |
| 2026-06-25 | `46388f9` | Update gcc common library and regen API doc |
| 2026-06-24 | `15aa052` | Add executeDynamic gridview autoFocus option; regen gcc API doc |
| 2026-06-19 | `3ed3850` | Add util.onUploadClick and guard data.__getChangeCheckedMainFrame |
| 2026-06-17 | `e111131` | Rename $c.session.info to getUserInfo |
| 2026-06-17 | `ab52155` | Add util.setTextLengthCounter, multi-gridview sbm, regen gcc API doc |
| 2026-06-16 | `1988999` | Regen gcc API doc; fix docgen to capture async functions |
| 2026-06-15 | `902fe60` | Simplify $c.win program-open/navigation logic |
| 2026-06-15 | `684bd9f` | Enable RESTful URL and default row-number visibility in gcc |
| 2026-06-15 | `6196ac2` | Add showProcessMessage/hideProcessMessage to $c.data |
| 2026-06-12 | `1fcbd67` | Add executeDynamic simplified ref/target syntax + gridview auto-binding to $c.sbm |
| 2026-06-10 | `ea4f002` | Extract goHomeEx landing path into scwin.HOME_EX_URL constant |
| 2026-06-10 | `783059b` | Add $c.win.goHomeEx (external-network home) + regen gcc API doc |
| 2026-06-10 | `c515bf1` | Wire $c.data common-code loading to COMMON_CODE_INFO.ACTION (cdVal/cdValNm) |
| 2026-06-10 | `7da21f9` | Port duplicate-submission guard into $c.sbm (from cm/gcc cherry-pick) |
| 2026-06-10 | `33744c4` | Repoint doc absolute paths to D:\workspace (folder move prep) |
| 2026-06-09 | `1bce502` | Add gcc/session.xml ($c.session) with sessionCheck |
| 2026-06-09 | `d78cc94` | Add serializeFormToQueryString to gcc/data.xml |
| 2026-06-09 | `5c3d6de` | Consolidate validate.xml duplicate validators into $c.str |
| 2026-06-09 | `b220b87` | Add cookie/localStorage/sessionStorage helpers to util.xml |
| 2026-06-09 | `e0463bc` | Add gcc API doc generator (wsxml_lint.docgen) + generated docs |
| 2026-06-08 | `92a35bd` | Move gcc/ins/mgt/stf under src/ (최초 기준선) |

---

*이 문서는 git 이력에서 수작업으로 정리한 것으로, 함수 단위 상세는 각 커밋 diff 및 [API 문서](api/gcc/index.html)를 기준으로 한다.*
