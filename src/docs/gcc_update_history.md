# gcc 공통 함수 업데이트 이력

`src/gcc/` 공통 라이브러리(`$c.*`)의 최초 반입(2026-06-08, `92a35bd`) 이후 변경 내역 정리 (최종 갱신 2026-08-26).
API 명세는 [api/gcc/index.html](api/gcc/index.html)(자동 생성, `npm run docs:gcc`) 참고. 2026-08-26 기준 **12개 모듈 / 287개 공개 메서드**.

> `src/cm/gcc/`는 CM 모듈용 사본으로 일반적 개선만 선별 반영해 왔으나(2026-06-10 병합, 2026-07-22 대규모 동기화로 11파일 체제),
> **2026-08-18 `26af3d5`에서 사용 중단으로 삭제**되어 `src/gcc/`가 유일한 canonical 라이브러리다.
> 아래에서 별도 표기가 없으면 `src/gcc/` 기준이며, "cm 동기화"로 표기된 항목은 삭제 이전 두 트리에 함께 반영되었던 것이다.

---

## 요약: 모듈별 주요 변화

| 모듈 | 주요 변화 |
|------|-----------|
| `sbm.xml` (`$c.sbm`) | 중복 제출 가드, `executeDynamic` 간소화 ref/target 문법·gridview 자동 바인딩·`autoFocus`·다중 gridview 바인딩·스피너 오버레이·message 옵션(opt-in), RESTful URL 활성화, 단건 ref(DataMap)→`requestData` 추출, 페이징(`setPagingInfo`) 개선 — `maxRowNum "all"` 전체 행 표시·`rowNumVisble desc` 내림차순 순번, 그리드 DOM `render` 참조 전환 |
| `data.xml` (`$c.data`) | 공통코드 로딩(`COMMON_CODE_INFO.ACTION` 연동, `setCommonCode` 배열 매핑 → code별 키잉 응답 매핑(`mappingKey` = 응답 조회 key) 개편·응답 언래핑·기본 컬럼 cdVal/cdValNm·조회 URL 이원화(url/paramName 옵션은 추가 후 제거)), JSON 헬퍼 8종, 프로세스 메시지, 콤보 공통코드 세팅(`comboCbDataSet*`) 계열, 업로드/리포트 헬퍼, 엑셀 다운로드 기본 옵션 개선 |
| `win.xml` (`$c.win`) | 외부망 홈(`goHomeEx`), 프로그램 열기/내비게이션 단순화, `openFormSubmit`, 인쇄(`mainPrint`/`popupPrint`), `success`/`error` 알림, `openExternalPage`, **browserPopup 부모 화면 접근**(`getOpenerScope`/`callOpener`), 히스토리 기록·복원(`pushState`/`changePageState`) 결함 수정 및 `moveUrl`/`setPageFrameSrc` 이동 복원 확장(`restoreData` [목록] 복귀 포함), 프레임 초기화 `reinitialize` |
| `exception.xml` (`$c.exception`) | **신설**(2026-08-26, win.xml 에서 분리) — 화면 try/catch 공통 오류 처리기 `handleError`(예외 분류·이중 알림 방지), 오류 수집 훅 `__reportError`(`ERROR_REPORT_INFO.URL` 설정 시 활성화) |
| `util.xml` (`$c.util`) | 쿠키/웹스토리지 헬퍼 13종, 업로드(`onUploadClick`/`getUploadFiles` 등), `setTextLengthCounter`, `checkFileExtension`, 엑셀 다운로드 파일명 개선, `setGridVisibleRowNum`(gridView "all" 동적 적용), 버튼 상태 일괄 제어 `setButtonState`/`registerButtonState` |
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
- `71c4f68` (08-21) — [연관] **최종 샘플 카탈로그 `sample_templates.md` 신설**(`src/conversion/md`, gcc 무변경):
  - 샘플 11종 목록(소스·원본·배포 경로 `/ui/sample/template/`)·화면 유형→샘플 매칭 가이드·표준 패턴 7항 — 단계 2 보강의 "정답지" 규약화
  - `ULDSTF30700` 3구역 헤더 슬래시 오타 교정, `ULDSTF30702` 배포명(`ULDSTF30710.xml`) 주의 명기
- `d113354` (08-21) — [연관] **conversion 프로세스 현행화 + 적용 플레이북 신설**(gcc 무변경):
  - `conversion_playbook.md` — 다른 전환 프로젝트 착수 절차(전제 조건·작업 공간 규격·실행·검증 체크리스트·산출물 인계·규칙 개정 순서)
  - overview/pipeline 에 단계 2 "샘플 매칭 보강(⑧)" 추가, `convert_all.py` **`--force` 재생성 옵션**(수기 보강 유실 경고 명기)
- `2d1ec59`, `406d1dd` (08-21) — [연관] **convert.py 결함 3건 수정**(gcc 무변경, pytest 26건):
  - 규칙4 `gform_onload→onpageload` 병합으로 이동한 await 가 1회차에 async 를 못 받던 순서 결함(`mark_async_functions` 재호출), 다중 빈 줄 비수렴(`collapse_blank_runs`), `convert()` 고정점 수렴 래퍼
  - 규칙2 선언 블록 앵커를 **최상위 vScrenID 대입으로 한정** — 함수 내부에만 vScrenID 가 있는 파일에서 전역 선언이 함수 몸통 안으로 삽입되던 기존 결함 해소
- `d8d1fed`, `53a416f`, `7d9675b`, `6ec313e` (+재수렴 `a3d94f1`, `e766a03`) (08-21) — [연관] **next-krx-lds 4개 모듈 전환 재실행**(gcc 무변경):
  - `convert_all --force` 로 fil 34·tms 36·stf 101·mgt 165 = **336화면 전체를 5단계 정형화 구조 + async/await 순차 스타일로 재생성**, 전 모듈 WF·IDEM OK
  - `ULDTMS03150` 원본 ui 결함 승계분(label 속성 내 원시 span)은 엔티티 이스케이프로 수기 정정
- `a16c35c`, `b59e201`, `ed6a75f`, `80e64f5` (08-21) — [연관] **overview HTML 정비**(gcc 무변경): 개정 md 동기화, 구조도 `sample-front/ui` 설명 추가, 8번 배경 절 제거 후 **gcc 업데이트 이력 전문을 8절로 수록**(`history:begin/end` 마커 구간 — 이력 갱신 시 구간 교체)
- `10ee305` (08-21) — [연관] **UDC bulkFileSaver `save` 빈 변경분 차단 가드 비활성화**(`src/udc`, gcc 무변경): 변경 행 0건 조기 반환을 주석 처리 — 데이터 변경 없이 파일 첨부만으로도 저장 요청 가능
- `c636f0c` (08-25) — `$c.data.setCommonCode` **기본 "선택" firstRow 자동 삽입 제거** + JSDoc 정비:
  - `__applyCommonCodeFirstRow`: firstRow 미지정 시 기본 `["", "선택"]` 선두 삽입을 비활성화 — **명시 `firstRow` 옵션일 때만 삽입**(회귀 테스트 새 의미론 갱신 + 명시 경로 테스트 1건 추가)
  - `$c.util.getComponent` JSDoc 예제 오타 정정, `$c.win.getPopupOpenerScope`/`POPUP_OPENER_SCOPES` 주석 간소화(등록 코드 무변경), API 문서 재생성
- `c9aa3ba` (08-25) — `$c.data.setCommonCode` **공통코드 조회 URL 이원화 및 옵션 정리**:
  - `COMMON_CODE_INFO`: `URL_LIST`(`/api/common/common-codes`) 추가, `LABEL`/`VALUE` 삭제 — 단일 code 는 `URL`+`PARAM`(cdEngNm), 배열 code 는 `URL_LIST`+`PARAM_LIST`(cdEngNmList) **고정 라우팅**
  - `url`·`action`·`labelColumn`·`valueColumn` 옵션 제거 — label/value 컬럼은 `filedArr[0]/[1]` 고정(`_pickColumn` 삭제), action 은 내부 로컬 변수로 조립(`paramName` 만 유지)
  - 회귀 테스트 새 계약으로 재작성(8건), API 문서 재생성
- `eb13261` (08-25) — `$c.validate` **validateDataCollect 결함 수정 및 검증 규칙 대폭 확장** (281→283 메서드):
  - 결함 수정: `finally` 의 return 이 `catch` 를 덮어 **예외 시 true 반환** 가능하던 구조 해소(컴포넌트 수집도 try 내부로 — 예외 시 항상 false), 그리드 경로 FORMAT 체인의 `phone`/`email` 누락 보강
  - JSDoc 에만 있고 조용히 무시되던 규칙 실제 구현(`__getExtendedRuleMessage`): `ignoreChar`·`min/maxLengthB`(byte)·`maxLengthF`(정수.소수 자리수)·`num`(n/i/f)·`from/toNum`·`format:bizNum` — 빈 값 통과(required 소관), 문서 목록 현행화(`comparelength`→`fixLength`)
  - 조건부·그룹 규칙 신설(`__getConditionalRuleMessage`): `checked`(체크박스 필수 — "0"/false 도 실패), `emptyIf`/`requiredIf`(조건 객체 `equals|notEquals|in|notEmpty` — 국가코드 410 외 = 외국국적 판별, 참조 값 빈 경우 조건 불충족), `duplicate`(그리드 행 간 중복)·`duplicateGroup`(폼 그룹 중복)
  - `format:corpNum`(**`$c.str.isCorpNum` 신설** — 13자리+가중치 1,2 체크섬)·`format:urlNoProtocol` 추가, `validateSiteUrl` `forbidProtocol` 옵션
  - **`$c.util.checkFileTotalSize` 신설** — 첨부 총용량 검사(기본 100MB, 업로드 컴포넌트/File 객체 혼용 배열)
  - `validateDataCollect` JSDoc 을 전체 옵션 샘플로 교체, 회귀 테스트 `test/validateDataCollect.test.js` 12건 신설
- `cbbdf88` (08-25) — [연관] **validate-generator 를 확장된 검증 규칙에 맞춰 갱신**(`src/docs/validate-generator`, gcc 무변경):
  - 필드 규칙 표 `compareLen`→`fixLength` 교체 + `checked`/`emptyIf`/`requiredIf`/`duplicate`/`dupGroup` 고급 열, format 선택지 `securityNumber`·`corpNum`·`urlNoProtocol` 확장
  - `VG.buildCode` 에 BOOL_RULES(true 출력)·RAW_RULES(조건 객체 원문) 분류 신설, README 동기화, 생성 테스트 +1건
- `653b080` (08-25) — [연관] **통합 입력 검증 가이드 샘플 `SMPVAL10000` 신설**(`src/conversion/sample-front`, gcc 무변경):
  - 발행기관 등록 시나리오 합성 가이드 — `validateDataCollect` 전 규칙 한 벌 시연(필수/byte/형식/조건부 `emptyIf` 외국국적·`requiredIf` 선행조건/`duplicateGroup`·그리드 `duplicate`/약관 `checked`) + `checkFileTotalSize` 총용량
  - 샘플 카탈로그 12번째 등록, overview·playbook·pipeline 샘플 개수 표기 12종 동기화
- `db1dbc9` (08-25) — **코드리뷰(websquare-code-reviewer) 지적 3건 수정**:
  - `$c.util.getUploadFileSize`: 파일 미선택 시 `files[0].size` 접근 예외를 옵셔널 체이닝+`-1` 로 교정 — JSDoc 계약("-1 반환")과 일치, `checkFileTotalSize` 경유 첨부 없는 저장 경로 정상화
  - `SMPVAL10000` 샘플: 미존재 API `getSelectedRowIndex` → `getFocusedRowIndex` 교체, `executeDynamic` 응답에 `skipped` 가드 추가(중복 제출을 저장 실패로 오탐하던 문제 방지)
- `fd2f1c8` (08-25) — [연관] **미사용 UDC 4종 삭제**(`src/udc`, gcc 무변경): codeSelectBoxBasic·fromToCalendar·qrCode·qrCode_popup 제거 — 잔여 UDC 는 bulkFileSaver·fileMultiUpload·fileMultiUploadGrd·gridViewFinder·searchBadge 5종
- `4c5768c` (08-25) — [연관] **SB차트 샘플 갤러리·업로드 샘플 추가**(`src/conversion/sample-front`, gcc 무변경): `sbchart/` — SBChart 라이브러리(js·css)와 차트 유형별 샘플 XML 47종·데이터·이미지 리소스, `upload/` — 업로드 샘플 6종(BulkFileUpload·gridViewUploadSample/UDC·multiUploadSample·saveBulkFileUpload·upload1)
- `a3a40fd` (08-25) — [연관] **validate-generator UI 개선**(`src/docs/validate-generator`, gcc 무변경): 고급 규칙 열(조건부·중복·checked) 기본 표시, 필드 규칙 표·생성 결과를 입력 카드 하단 전체 폭으로 배치
- `95d7994` (08-25) — [연관] **SB차트 샘플 주석 URL 36건 교정 + HEATMAP 빈 데이터 수정**(`src/conversion/sample-front/sbchart`, gcc 무변경)
- `b1f9fdf` (08-25) — `$c.data.setCommonCode` **code별 응답 매핑 개편·paramName 제거** + `$c.win.reinitialize` 추가 (283→284 메서드):
  - 배열 code 응답(body)을 code별 목록으로 분리 저장 — `mappingKey[i]` 를 응답 JSON 에서 목록을 찾을 key 로 사용(미지정/null 인덱스는 code 값 폴백), 캐시·DataList·`codeData` 키는 code 기준 유지(소비부 키 계약 불변)
  - `paramName` 옵션 제거 — 쿼리 파라미터명은 `PARAM`("cdEngNm")·`PARAM_LIST`("cdEngNmList") 상수 고정, `useLocalCache:false` 캐시 삭제 키를 실제 저장 키(code)로 정합, 죽은 `mapKey` 표현식(`null ?? code`) 정리
  - `win.xml`: 현재 프레임 초기화 `scwin.reinitialize`(`$p.reinitialize` 래퍼) 공개 추가
  - 회귀 테스트 신 계약 재작성(setCommonCode 8건), API 문서 재생성
- `49efe07` (08-25) — [연관] **sample-front 벤더 JS를 ESLint 대상에서 제외**(`eslint.config.js`, gcc 무변경): SBChart 배포본(sbchart.js 압축본)의 no-undef 에러로 실패하던 Node lint CI 잡 복구
- `cc7c67c` (08-25) — `$c.data.setCommonCode` **바인딩 블록 죽은 코드 정리**(동작 무변경): 미사용 `mapKey` 선언·낡은 매핑 주석 제거(mappingKey 해석은 `__getCommonCodeData` 로 일원화), 중복 `bodyObj` 조회 제거·`sourceList` 폴백 `[]` 정상화
- `8cc25d0` (08-26) — `$c.data.setCommonCode` **캐시 히트 시 서버 재조회 생략**: 요청 code 가 모두 `commonCodeList` 캐시에 있으면 `executeDynamic` 호출 생략(배열 code 일부 미보유 시 그룹 재조회, `useLocalCache:false` 는 캐시 삭제 후 재조회) — JSDoc 기술과 실동작 일치화, 캐시 회귀 테스트 2건 신설
- `a00ab33` (08-26) — `$c.win` **화면 try/catch 공통 오류 처리기 `handleError` 추가** (284→285 메서드):
  - 예외 분류 규약 — sbm 중복 제출 skip(`ex.skipped`)은 완전 무시, sbm 이 이미 알린 통신 오류(`ex.errorType`)는 로그·수집만(이중 알림 방지), 업무 예외(`ex.bizMessage`)는 해당 문구로 alert, 그 외 시스템 예외는 기본 문구로 error 알림
  - 옵션 — `message`(공통 메시지 ID 지원)·`notify`("error"|"alert"|"toast"|"none")·`context`(로그 식별자)·`rethrow`·`callback`
  - `scwin.__reportError` 수집 훅(hidden, 현재 no-op) — 추후 오류 수집 API 신설 시 연동 지점, try/catch 격리로 수집 실패가 화면 흐름을 깨지 않음
  - 빈 예외 가드는 명시적 null 체크 — `$c.util.isEmpty` 가 열거 키 없는 `Error` 인스턴스를 빈 객체로 오판하는 함정 회피, 회귀 테스트 11건 신설(`test/handleError.test.js`)
- `3bed6e5` (08-26) — [연관] **화면 try/catch 오류 처리 규약 신설 및 샘플 적용**(gcc 무변경): `code-convention.md` 오류 처리 절(진입점 한정 try/catch + `$c.win.handleError` 한 줄 통일·내부 함수 예외 전파·`bizMessage` 업무 예외 표준·빈 catch 금지), `SMPVAL10000` 두 진입점 적용(Stage 2 정답지), `sample_templates.md` 표준 패턴 8번 추가
- `67fc919` (08-26) — `$c.win` **`__reportError` 오류 수집 로직 본구현**(URL 설정 전까지 비활성):
  - `ERROR_REPORT_INFO` 설정 상수(URL 기본 빈값=비활성·화면당 상한 10건·스택 절단 4000자) — 수집 API 신설 시 URL 한 곳만 지정하면 `handleError` 사용 전 화면에 수집 활성화
  - 표준 페이로드(frameId·context·예외명/메시지/스택·pageUrl·userAgent·occurredAt), 동일 context+message 화면당 1회 중복 억제
  - 전송은 `sendBeacon`(폴백 `fetch keepalive`)로 `$c.sbm` 우회 — 수집 실패가 resultMsg 사용자 알림 파이프라인을 재귀적으로 타는 부작용 차단, 회귀 테스트 +6건(총 17건)
- `4e4bbd4` (08-26) — `$c.sbm`·`$c.win` **sbm 오류 경로를 handleError 수집 파이프라인에 합류 + 결함 3건 수정**:
  - sbm E 경로(연결 불가 `__callbackSubmitFunction`·500 `__submitErrorHandler`)에서 resultMsg 알림 유지 + `$c.win.handleError(notify:"none", context:"sbm.<id>")` 호출 — 통신 오류도 콘솔 로그·`__reportError` 수집 합류(사용자 알림 UX 무변경)
  - `handleError` 가 수집한 예외 객체에 `_errorReported` 마킹 — sbm(공통 계층)·화면 catch 중복 호출 시에도 수집 1회 보장
  - 결함 수정: ① 연결 불가 시 promise 핸들러 연결 전 조기 return 으로 `executeDynamic` Promise 영구 pending → reject 종결(+`errorType` 표식 보장), ② action 누락 시 문자열 reject 로 화면 handleError 이중 알림 → `{errorType:"invalid-option"}` 객체 reject, ③ 500 응답 본문 비JSON 시 `resBody.errors.code` 접근으로 핸들러 사망·알림 누락 → 안전 접근
  - 회귀 테스트 `test/sbmErrorFlow.test.js` 4건 신설 + handleError 재수집 방지 1건(총 96건)
- `57de52d` (08-26) — **예외 처리 체계를 `exception.xml`(`$c.exception`)로 분리** (11→12 모듈, 285 메서드 불변):
  - `handleError`(공개)·`__reportError`(hidden)·`ERROR_REPORT_INFO`·`__errorReportState` 를 win.xml 에서 신설 exception.xml 로 이동(`__errorHandler` 는 WebSquare 설정의 이름 참조 가능성으로 win 잔류)
  - 참조 일괄 변경(위임 래퍼 없음) — sbm.xml 수집 합류 가드 2곳·`SMPVAL10000` 2곳·code-convention.md·sample_templates.md → `$c.exception.handleError`
  - CLAUDE.md gcc 모듈 표·lint 기준선(12 files) 현행화, handleError 테스트 하니스를 exception.xml 로드로 전환
  - **배포 주의**: 배포 환경에 `$c.exception` 공통 XML 등록과 함께 반영 필요 — 사용법·등록 구문은 **[exception-handling-guide.md](exception-handling-guide.md)** 참고
- `febe1e3` (08-26) — [연관] **SBChart 캔들스틱 샘플에 문의 회신 차트 요청 6건 반영**(`src/conversion/sample-front/sbchart`, gcc 무변경): 상승/하락 색 명시(inColor/deColor)·Y축 width 고정·min 0+padding.bottom 0·OHLC 한글 툴팁(제목 날짜 환산)·고점/저점 마커 제거·공시일(gongsi) 캔들 fillColor 강조(`buildChartData`), 데이터 2행 gongsi 플래그 추가, var→const·fn_ 접두 제거
- `681f4bb` (08-26) — [연관] **sbchart 샘플 전체 코드 컨벤션 정리**(gcc 무변경): 54개 샘플 var→const 전환(node --check 전수 검증), fn_ 접두 제거 5파일, GANTT_SCHEDULE 미정의 `fn_status` 호출 결함 수정. 회신 문서도 표준 Markdown 6절 구조로 정리(`sbchart/md/SPCHART.md`, `82ec860`)
- `c89b556` (08-26) — [연관] **sbchart 샘플에 회신 3항목(색상·clear·툴팁 포맷) 일반화 적용**(gcc 무변경): 색상 팔레트(52)·clearChart 헬퍼 전수·툴팁 천단위 콤마(47)+STOCK OHLC 한글 라벨, range 계열·기존 tooltip 보유 파일은 사유 명시 스킵, 헤더 반영 주석·FEATURE §9 참조 추가
- `2708d14` (08-26) — [연관] **SBChart 속성·기능 정의 문서 신설**(`sbchart/md/SBCHART_OPTIONS.md`, gcc 무변경): 샘플 55종 사용 빈도 실측 + sbchart.js 근거 — 옵션 그룹별 정의·기능 패턴·함정 8건·FEATURE 검증 고급 기능 9종(§9)
- `d0f21d9` (08-26) — `$c.util` **버튼 상태 일괄 제어 `setButtonState`/`registerButtonState` 추가** (285→287 메서드):
  - `BTN_STATE_MAP` — 상태를 "활성 역할 목록(enable) 또는 전체(*)+예외(disable)"로 선언, 미정의 역할 기본 비활성이라 **화면별 동적 역할 추가에 안전**. 상태 6종(insert·update·disabled·enabled·error·insertReady)
  - 화면은 역할→버튼id 매핑만 선언(버튼 id 비통일 대응), 판정 우선순위 override > state.disable > enable > 기본 false, 즉석 상태 객체·`registerButtonState` 등록 확장, 매핑 밖 버튼 미접촉·미존재 버튼/미정의 상태 방어
  - 회귀 테스트 9건(`test/setButtonState.test.js`) — 사용법·샘플 코드는 **[button-state-guide.md](button-state-guide.md)** 참고
- `ef9628d` (08-26) — [연관] **버튼 상태 제어 가이드 샘플 `SMPBTN10000` 신설**(`src/conversion/sample-front`, gcc 무변경): `setButtonState` 전체 옵션 시연(표준 상태 6종·override·registerButtonState·즉석 상태·동적 역할), 버튼 id 비통일 대응 데모, 샘플 카탈로그 13번째 등록 + 개수 표기 13종 동기화
- `2c90237` (08-26) — [연관] **SBChart 공시그래프 샘플(SPCHART_NOTICE) 신설**(`sbchart/CANDLESTICK`, gcc 무변경): 캔들+거래량+공시목록 GridView 3단, crosshair 커스텀 동기화(반대편 점선 미러), 공시일 다트형 화살표 SVG 오버레이(scatter combo 는 라이브러리 null 오인 크래시로 미사용), 커스텀 툴팁(상단 OHLC·하단 거래량), `TOOLTIP_TRIGGER`(band/shape) 옵션 — 전 기능 헤드리스(puppeteer) 검증, 미리보기 하네스·데이터·참고 이미지 포함
- `0340ce1` (08-27) — [연관] **SPCHART_NOTICE crosshair 날짜 라벨·최고/최저가 마커 추가**(`sbchart/CANDLESTICK`, gcc 무변경): crosshair 세로선 하단 MM-DD 날짜 라벨(HTML 오버레이 — 상단 네이티브 세로선·하단 hover 시 상단 미러선 모두), 상단 미러선 길이를 x축 실좌표(plotBottom) 기준으로 보정, 최고가(수치+▼)·최저가(▲+수치) 회색(`#637381`) 마커를 SVG 루트 오버레이(getCTM 변환)로 표시(최저가 캔들이 공시일이면 민트 화살표 아래로 이동) — 헤드리스 검증·미리보기 하네스 동일 반영

---

## 커밋 이력 (src/gcc)

| 일자 | 커밋 | 제목 |
|------|------|------|
| 2026-08-27 | `0340ce1` | feat(sample): SPCHART_NOTICE crosshair 날짜 라벨·최고/최저가 마커 추가 — [연관, gcc 무변경] |
| 2026-08-26 | `ef9628d` | feat(sample): 버튼 상태 제어 가이드 샘플 SMPBTN10000 신설 (setButtonState 전체 옵션) — [연관, gcc 무변경] |
| 2026-08-26 | `d0f21d9` | feat(util): 버튼 상태 일괄 제어 공통함수 setButtonState/registerButtonState 추가 |
| 2026-08-26 | `2c90237` | feat(sample): SBChart 공시그래프 샘플(SPCHART_NOTICE) 신설 — 캔들+거래량+공시목록 3단 — [연관, gcc 무변경] |
| 2026-08-26 | `2708d14` | docs(sample): SBChart 자주 쓰는 속성·기능 정의 문서(SBCHART_OPTIONS.md) 신설 — [연관, gcc 무변경] |
| 2026-08-26 | `c89b556` | feat(sample): sbchart 샘플에 SPCHART.md 3항목(색상·clear·툴팁 포맷) 일반화 적용 — [연관, gcc 무변경] |
| 2026-08-26 | `82ec860` | docs(sample): SPCHART.md 회신 문서를 표준 Markdown 구조로 정리 — [연관, gcc 무변경] |
| 2026-08-26 | `681f4bb` | refactor(sample): sbchart 샘플 전체 코드 컨벤션 정리 (var→const, fn_ 접두 제거) — [연관, gcc 무변경] |
| 2026-08-26 | `febe1e3` | fix(sample): SBChart 캔들스틱 샘플에 문의 회신(md) 차트 요청 6건 반영 — [연관, gcc 무변경] |
| 2026-08-26 | `57de52d` | refactor(gcc): 예외 처리 체계를 exception.xml($c.exception)로 분리 |
| 2026-08-26 | `4e4bbd4` | feat(sbm,win): sbm 오류 경로를 handleError 수집 파이프라인에 합류 + 결함 3건 수정 |
| 2026-08-26 | `67fc919` | feat(win): __reportError 오류 수집 로직 본구현 — URL 설정 전까지 비활성 |
| 2026-08-26 | `3bed6e5` | docs(convention)+refactor(sample): 화면 try/catch 오류 처리 규약 신설 및 샘플 적용 — [연관, gcc 무변경] |
| 2026-08-26 | `a00ab33` | feat(win): 화면 try/catch 공통 오류 처리기 handleError 추가 |
| 2026-08-26 | `8cc25d0` | feat(data): setCommonCode 캐시 히트 시 서버 재조회 생략 |
| 2026-08-25 | `cc7c67c` | refactor(data): setCommonCode 바인딩 블록 죽은 코드 정리 |
| 2026-08-25 | `49efe07` | fix(ci): sample-front 벤더 JS를 ESLint 대상에서 제외 — [연관, gcc 무변경] |
| 2026-08-25 | `b1f9fdf` | feat(gcc): setCommonCode code별 응답 매핑 개편·paramName 제거 + win.reinitialize 추가 |
| 2026-08-25 | `95d7994` | fix(sample): SB차트 샘플 주석 URL 36건 교정 + HEATMAP 빈 데이터 수정 — [연관, gcc 무변경] |
| 2026-08-25 | `a3a40fd` | feat(docs): validate-generator 고급 열 기본 표시 + 결과 영역 하단 전체 폭 배치 — [연관, gcc 무변경] |
| 2026-08-25 | `4c5768c` | chore(sample): SB차트 샘플 갤러리·업로드 샘플 추가 — [연관, gcc 무변경] |
| 2026-08-25 | `fd2f1c8` | chore(udc): 미사용 UDC 컴포넌트 4종 삭제 — [연관, gcc 무변경] |
| 2026-08-25 | `db1dbc9` | fix(gcc,sample): 코드리뷰 지적 3건 수정 — getUploadFileSize 미선택 예외·행삭제 API·skipped 가드 |
| 2026-08-25 | `653b080` | feat(sample): 통합 입력 검증 가이드 SMPVAL10000 신설 (validateDataCollect 전체 옵션) — [연관, gcc 무변경] |
| 2026-08-25 | `cbbdf88` | feat(docs): validate-generator 를 확장된 검증 규칙에 맞춰 갱신 — [연관, gcc 무변경] |
| 2026-08-25 | `eb13261` | feat(validate): validateDataCollect 결함 수정 및 검증 규칙 대폭 확장 |
| 2026-08-25 | `c9aa3ba` | feat(data): setCommonCode 공통코드 조회 URL 이원화 및 옵션 정리 |
| 2026-08-25 | `c636f0c` | feat(gcc): setCommonCode 기본 '선택' firstRow 자동 삽입 제거 + JSDoc 정비 |
| 2026-08-21 | `10ee305` | fix(udc): bulkFileSaver save의 빈 변경분 차단 가드 비활성화 — [연관, gcc 무변경] |
| 2026-08-21 | `80e64f5` | docs(conversion): overview HTML 8번 절로 gcc 업데이트 이력 전문 수록 — [연관, gcc 무변경] |
| 2026-08-21 | `ed6a75f` | docs(conversion): overview HTML에서 8번 배경 절 제거 — [연관, gcc 무변경] |
| 2026-08-21 | `b59e201` | docs(conversion): 시스템 구조도에 sample-front/ui 최종 샘플 폴더 설명 추가 — [연관, gcc 무변경] |
| 2026-08-21 | `a16c35c` | docs(conversion): overview HTML을 개정 md와 동기화 — [연관, gcc 무변경] |
| 2026-08-21 | `e766a03` | feat(conversion): rule2 앵커 수정 반영 재수렴 (mgt 1·tms 30파일) — [연관, gcc 무변경] |
| 2026-08-21 | `406d1dd` | fix(conversion): rule2 선언 블록 앵커를 최상위 vScrenID 대입으로 한정 — [연관, gcc 무변경] |
| 2026-08-21 | `6ec313e` | feat(conversion): mgt 모듈 ui-tobe 최신 프로세스 재변환 (165화면) — [연관, gcc 무변경] |
| 2026-08-21 | `7d9675b` | feat(conversion): stf 모듈 ui-tobe 최신 프로세스 재변환 (101화면) — [연관, gcc 무변경] |
| 2026-08-21 | `53a416f` | feat(conversion): tms 모듈 ui-tobe 최신 프로세스 재변환 (36화면) — [연관, gcc 무변경] |
| 2026-08-21 | `a3d94f1` | feat(conversion): fil 모듈 ui-tobe 멱등성 수정판 재수렴 (15파일) — [연관, gcc 무변경] |
| 2026-08-21 | `2d1ec59` | fix(conversion): 변환기 멱등성 결함 2건 수정 + 고정점 수렴 래퍼 — [연관, gcc 무변경] |
| 2026-08-21 | `d8d1fed` | feat(conversion): fil 모듈 ui-tobe 최신 프로세스 재변환 (34화면) — [연관, gcc 무변경] |
| 2026-08-21 | `d113354` | docs(conversion)+feat(tools): 프로세스 현행화·플레이북 신설 및 convert_all --force 재생성 옵션 — [연관, gcc 무변경] |
| 2026-08-21 | `71c4f68` | docs(conversion): 최종 샘플 카탈로그 sample_templates.md 신설 — [연관, gcc 무변경] |
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
