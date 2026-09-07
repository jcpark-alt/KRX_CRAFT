# gcc 공통 함수 업데이트 이력

`src/gcc/` 공통 라이브러리(`$c.*`)의 최초 반입(2026-06-08, `92a35bd`) 이후 변경 내역 정리 (최종 갱신 2026-09-07).
API 명세는 [api/gcc/index.html](api/gcc/index.html)(자동 생성, `npm run docs:gcc`) 참고. 2026-09-07 기준 **12개 모듈 / 317개 공개 메서드**.

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
| `util.xml` (`$c.util`) | 쿠키/웹스토리지 헬퍼 13종, 업로드(`onUploadClick`/`getUploadFiles` 등), `setTextLengthCounter`, `checkFileExtension`, 엑셀 다운로드 파일명 개선, `setGridVisibleRowNum`(gridView "all" 동적 적용), 버튼 상태 일괄 제어 `setButtonState`/`registerButtonState`, 동적 컬럼 그리드 `syncDataListColumns`/`buildGridStyleXml`(setGridStyle 2단 그룹 헤더) |
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
- `be13515` (08-27) — [연관] **SPCHART_NOTICE 표준 골격 재구성 + formatDate 공통함수 전환**(`sbchart/CANDLESTICK`, gcc 무변경): ULDSTF30700 가이드 골격 적용 — 화면 동작/구성/담긴 패턴 헤더 주석, 5단계 코드 영역 주석, `onpageload` 초기화 영역(최상단) 이동, 전 함수 ULDSTF 형식 JSDoc. 로컬 `formatDate` 삭제 → `$c.date.formatDateTime(value, "yyyy-MM-dd")` 공통함수 사용(미리보기는 동일 시그니처 스텁) — 로직 무변경, 헤드리스·lint 검증
- `9995fa6` (08-27) — [연관] **SPCHART_NOTICE init/서브미션 분리 + 미리보기 5단계 영역 정리**(`sbchart/CANDLESTICK`, gcc 무변경): XML 호출 흐름을 `onpageload` → `init`(§2 상태 초기화) → `selectChartData`(§4 — executeDynamic 조회+바인딩+렌더+상호작용 초기화, 재조회 재호출 구조)로 분리(ULDSTF init/list 패턴). 미리보기도 동일 5단계 영역 재배치(`window.onload` §2·`loadData` §4), `TOOLTIP_TRIGGER` 주석 기본값 표기 shape 로 정정 — 로직 무변경, 헤드리스·lint 검증
- `e520ee5` (08-27) — [연관] **SPCHART_NOTICE 리사이즈 시 crosshair·툴팁 복구 + x축 라벨 간격 2**(`sbchart/CANDLESTICK`, gcc 무변경): 리사이즈 시 라이브러리가 svg 를 재생성해 커스텀 오버레이 소실·hit-test 캐시 구좌표 잔존(헤드리스 실측) — 디바운스(250ms) 후 오버레이·hit-test·동기화 재적용(`init` 리스너 등록) + 그리기 함수 정리 가드 5곳으로 해결. x축 날짜 tick 간격 3→2 — 2회 리사이즈 헤드리스 검증
- `7f2ab7b` (08-27) — [연관] **SPCHART_NOTICE 실무 골격 마크업·총건수·데이터 보강 + 얇은 막대 hit 보정**(`sbchart/CANDLESTICK`, gcc 무변경): body 를 실무 화면 골격(sub_contents+pageFrame·titbox/chartbox/gvwbox)으로 재구성, 공시목록 "총 N건" 카운트(`tbx_discls_cnt`) 신설. `chart_data.json` 보강(chartList 26행·disclsList 26건 — 참고 이미지 밀도). 보강으로 드러난 결함 수정 — 저거래량 막대(~1px) shape 툴팁 hover 불가 → `setupShapeHit` 최소 hit 높이 10px 보정(밑변 고정·위로 확장) — 헤드리스 검증
- `7e50d0b` (08-27) — `$c.ext` **SBChart 고아 resize 리스너 정리 체계 — `destroyChart` 신설** (287→288 메서드):
  - 실화면 보고 결함: 브라우저 리사이즈 시 라이브러리 resize 핸들러가 제거된 차트 DOM 접근 → `null.style` 크래시. 원인은 `sb.chart.render` 가 등록하는 window resize 리스너가 해제 불가 — ① `$c.ext` 인스턴스 미보관 ② **라이브러리 `destroy()` 도 리스너 미해제(실측)**
  - `__drawSBChart` 가 render 중 동기 등록되는 resize 리스너를 캡처해 인스턴스와 함께 보관, 재렌더 시 이전 차트 자동 정리(리스너 직접 제거+destroy). 공개 `$c.ext.destroyChart(container)` 신설 — 차트 화면 `onpageunload` 에서 호출
  - SPCHART_NOTICE 적용: `clearChart` 위임 전환 + `onpageunload` 신설 — 화면 이탈+리사이즈 재현 오류 → 수정 후 무오류(헤드리스 3시나리오)
  - **배포 주의**: 배포 환경 gcc(`ext.xml`) 반영 필요 — 실화면 오류는 배포 반영 후 해소
- `72b0536` (08-27) — `$c.ext` **var 선언 const/let 전환**: 함수 내 var 14곳 → const(재할당 `inst` 만 let), JSDoc `@example` 2곳 포함. 코드 컨벤션 — 이후 신규/수정 코드는 var 미사용(const 기본·재할당 시 let)
- `d8c0780` (08-27) — [연관] **SPCHART_NOTICE 미리보기 공시목록 총 건수 표시**(`sbchart/CANDLESTICK`, gcc 무변경): 표 상단 우측 "총 N 건" 카운트 — XML `tbx_discls_cnt` 대응, `renderDisclsTable` 에서 세팅
- `ad4228c` (08-28) — `$c.validate` **검증 모듈 명세 v3 반영 — focus/compare/matchValue 등 7항목** (명세 원본 `WebSquare6_Validation_Module_Specification-v3.md` 동봉):
  - 신규 옵션: 필드 `focus`(실패 시 지정 컴포넌트 포커스 — 분리 입력 대응) · `message`(required 문구 재정의) · `compare`(두 컴포넌트 값 비교 EQUAL/NOT_EQUAL) · `matchValue`(특정 값 확인 — 미입력도 실패) · `maxLengthB` 객체형(`korEng` — "한글 N자 영문 M자" 문구, **한글 3byte 환산**)
  - byte 계산을 UTF-8 기준(한글 3byte) 자체 헬퍼로 통일(기존 `getByteLength` 는 한글 2byte), required 문구 선택형/입력형 자동 분기, checked "동의 해주세요" 문구, allowChar 조합별 세부 문구 5종
  - 구조 개선: 폼/그리드 규칙별 중복 보일러플레이트 → 공통 `fail()` 통합(~360줄 축소), 그리드 required 마킹 실패 셀 `setCellClass` 통일
  - 테스트 115건(신규 7건) · SMPVAL10000 샘플·validate-generator 신규 규칙 동기화
- `2208793` (08-28) — [연관] **validate-generator 필드 테이블 "컴포넌트 ID" 열 추가**(`src/docs`, gcc 무변경): ID·name 사이에 표시 전용 열 신설 — dataMap key 별 바인딩 컴포넌트(`ref="data:dmaX.key"`) 매핑(미바인딩 `-`), ref 그룹 대상은 바인딩 정보(dma.key) 표기 — 생성 코드 무영향, 헤드리스 검증
- `0c4b9da` (08-28) — `$c.validate` **includeUnbound 옵션·composition 규칙 추가**:
  - `includeUnbound`(기본 false): DataCollection **미바인딩 컴포넌트**(분리 입력 칸 등)도 컴포넌트 ID 규칙으로 검증 — 기본값에서는 기존대로 건너뛰되 규칙 선언 시 `console.info` 로 가시화(조용한 무시 해소). 하위호환 100%
  - `composition`: 문자 클래스 **조합 필수** 규칙(각 1자 이상) — 토큰 eng/num/kor/special/upper/lower, 프리셋 `"engNum"`/`"engNumSpecial"`·배열형·객체형 `{value,message}`, 빈 값 통과. allowChar(문자 제한)와 상호보완(포함 강제) — 아이디/비밀번호류 반복 패턴 공통화
  - generator 동기화(옵션 체크박스·규칙 열)·테스트 +5건(120)
- `360d563` (08-28) — `$c.validate` **빌드 $p 주입 규칙 적용 — $c 사용 함수 공개 전환·$c.validate 호출 통일** (288→292 메서드):
  - **규칙(신규 확립)**: 빌드 시 `$c` 공통함수 호출은 첫 인자에 `$p` 가 주입됨 — **`$c` 를 사용하는 함수는 공개 선언 + `$c.네임스페이스` 호출**(같은 파일 내부라도 scwin 직접 호출 금지). `$c` 미사용 순수 함수만 `__` 내부 유지
  - 공개 전환 4종: `resolveFocusObj`·`getRequiredMessage`·`getExtendedRuleMessage`·`getConditionalRuleMessage`, 내부 호출 11곳 `$c.validate.*` 통일, 테스트 하니스 `$c.validate = scwin` 배선(120건 통과)
- `ff296d8`·`3ca9bfa` (08-28) — **빌드 $p 주입 규칙 gcc 전체 소급 적용 (1~3단계, 292→314 메서드)**:
  - 1단계(`ff296d8`) util/exception/date: `setGridViewRowCheckBox`·`deleteGridViewRow`·`reportError`·`checkDateFormat` 공개 전환, `__formatDate`("$p 미전달용" 구 우회 패턴) 를 `formatDate` 에 병합 — 관련 문서 3종(CLAUDE.md 등) 참조 갱신
  - 2·3단계(`3ca9bfa`) data/sbm/win: data 는 commonCode 헬퍼 5종 개명 공개, **sbm 의 기존 선례(`__` 이름 그대로 publicInfo 등록된 콜백 훅 4종)를 따라 sbm/win 은 개명 없이 "등록+`$c.ns.__X` 호출" 방식** — sbm 6종·win frame state 체인 7종 등록, 내부 호출 26곳 `$c` 화
  - **보류(빌드 담당 확인 필요)**: 스코프 워킹 래퍼쌍 3쌍(`getParameter`·`getChangeCheckedMainFrame`·`getProgramId` — `const $p = scopeApi` 의도 설계), $p 강의존(`_openPopup`/`_closePopup`/`__applyRestoreData`/`__bindResponseToTargets`), 런타임 콜백(`__errorHandler`·hkey 전체)
- `7c0c78b` (08-28) — [연관] **ULDINF05000 발행기관등록 가이드 화면 신설**(`sample-front/ui`, gcc 무변경): 코드 컨벤션 전면 적용(5단계·JSDoc·진입점 handleError·camelCase·엄격 비교 43곳) + 결함 4건 수정. **수작업 검증 약 47건 → validateDataCollect 규칙 50건 전환** — 정적 규칙 + 복합 조건(법인/사업자 3중 조건·팩스 all-or-none)은 `options.fields` 동적 구성, `includeUnbound`·`matchValue`·`composition`·korEng 등 신규 옵션 실사용 예. 잔여 수작업은 구조적 이관 불가분(동적 결산월·OR·그리드 안내)만

---

## 2026년 9월

### getMessage 개선·conversion 도구 연동 (09-01)
- `53991e1` (09-01) — `$c.data`/`$c.date` **getMessage 배열 인자 지원·checkCalendarFormat 메시지 코드 전환**:
  - `getMessage`: 치환 인자 하나를 **배열**로 전달하면 원소를 `$[0]`, `$[1]`… 값으로 사용(인라인 조사 마커 포함) — 배열 전달 시 `isFinalConsonant` 오류 해소, 나열 방식 하위호환 유지. vm 하니스로 빌드 후 런타임 인자 레이아웃(`[$p, msgId, …]`) 재현 검증
  - `checkCalendarFormat`: 메시지 출력용 `objName` 파라미터 추가, 오류 알림을 공통 메시지 코드(`com_valid_format_0051`/`0052`) 기반으로 전환 (+ `return` 뒤 백틱 오타·들여쓰기 정리)
  - **$p 주입 규칙 적용 조건 확인(사용자 재확인)**: 호출부 첫 인자 `$p` 자동 추가는 해당 XML 의 `<w2:publicInfo>` 에 정의된 함수만 대상 — `arguments` 직접 사용 함수는 `[$p, 선언인자, 추가인자…]` 레이아웃 기준 인덱싱
- `ba06e21` (09-01) — [연관] **conversion 변환 규칙 확장**(`src/conversion`·`src/docs`, gcc 무변경): convert.py 규칙 5e(`!X === Y` 우선순위 교정)·25(submitDoneHandler 옵션형→async/await 순차 스타일)·26(진입점 try/catch+`$c.exception.handleError`)·27(그리드 자식 중복 id 재부여, WS120)·28(반복문 내 DC 수정 `setBroadcast` 제어) 신설, 규칙 13 bare 참조 동기화·규칙 4 `$c.sbm.executeDynamic` 호출 함수 4구역 분류·라인 주석 `// ` 공백 포맷 추가. 규칙 24(수동 검증 나열→`$c.validate.validateDataCollect` 통합, 단계 2 판단) 문서화. 매핑 갱신 — `fn_CheckDateObj`→`$c.date.checkCalendarFormat`·`fn_CheckDateVal`→`$c.date.isDate` 분리(index_transfer 재생성 182 매핑). 테스트 39건
- `bae7a2a` (09-01) — [연관] **ULDBNS15000 표면이자율변경 가이드 화면 신설**(`sample-front/ui`, gcc 무변경): 탭+입력 화면 W-Craft 원본의 단계 1+2 전체 변환 — 서브미션 9건 순차 스타일, 진입점 handleError 12곳(타이머·팝업 콜백 자체 처리 포함), 전 함수(45개) 표준 JSDoc, `inputCheck` validateDataCollect 통합(규칙 24 실사용 예), 결함 수정(시그니처 불일치·`!x === 200`·bare `fn_*` 참조·`dts_DtlInfo` 잔재 등) — convert.py 재변환 멱등·lint 0/0
- `bd1d208` (09-01) — `$c.validate` **DataMap 값 검사 공통함수 `validateDataMap` 신설** (314→315 메서드):
  - 서버 체크 응답 플래그 등 "dma 키 값이 `equals` 와 일치하면 alert/confirm 후 중단 code 반환" 나열 패턴(`fn_CheckCmData` 류)의 공통화 — rules 선언 순서대로 검사, alert형은 즉시 code 반환, **confirm형은 취소 시만 code**(확인 시 다음 규칙 계속), 모두 통과 시 0(code 미지정 시 규칙 순번+1)
  - ULDBNS15000 `checkModAndRet`(1규칙)·`checkCmData`(4규칙) 전환 적용 — 검사 순서·메시지·중단 코드 동일 보존, 매핑표(§4)·규칙 24 유의사항 반영, Jest 6케이스(126건 통과)
- `1782df6` (09-01) — [연관] **SMPVAL10000 에 validateDataMap 데모 추가**(`sample-front/ui`, gcc 무변경): 서버 체크 플래그 DataMap(`dma_svrCheck`)+체크박스 토글+「플래그 검사」 버튼 섹션 — alert 형 2건(code 1·3)·confirm 형 1건(code 4, 취소 시에만 중단) 시연, 진입점 handleError 규약 적용, 샘플 카탈로그 항목 동기화
- `f519466` (09-01) — [연관] **규칙 26 보완 + 샘플 15종 진입점 try/catch 소급 적용**(`src/conversion`, gcc 무변경): 변환 규칙 26(진입점 try/catch + `$c.exception.handleError`)을 2구역 라이프사이클 진입점(onpageload/onpageunload) 한정·들여쓰기 단위(탭/4칸) 감지로 보완하고, sample-front/ui 샘플 15종의 이벤트 핸들러·onpageload **총 123건**을 소급 래핑(기존 수기 적용분 보존, context "화면ID.함수명") — 샘플(정답지) 전 진입점이 오류 처리 규약 준수, 파일별 멱등·lint 0/0
- `e83f7b3` (09-01) — `$c.date` **isDate 에 objName 인자·실패 시 공통 메시지 알림 추가**: `isDate(sDate, timeChk, objName)` — objName 전달 시 검증 실패에서 `com_valid_format_0052`("$[0]에 올바른 날짜를 입력하세요.")로 `$c.win.alert`(checkCalendarFormat 동일 규약, 2인자 호출 하위호환). pcc bns_common 의 레거시 날짜 검증(checkDateObj) 전환에 사용
- `d6baae5` (09-01) — [연관] **pcc stf 업무공통 정비**(`src/pcc`, gcc 무변경): `$c.frame` 의존 제거·gcc 전환(CreateDialogFrame 79건→openPopup 수신 규약, 어댑터 정리), 미사용 함수 20종 삭제(패널 조정 15·PanelToGroupBox 5 등), 규칙 13 개명 90건·박스 주석→@description 91건·argument 라인 79건 정리 — Node 구문검사 10파일 OK·lint 0 errors
- `8e0f903` (09-01) — [연관] **utils.xml($c.utils) gcc 이관 매핑 stf SOT 신설**(`src/docs`·`src/conversion`, gcc 무변경): 23행(1:1 12·검토 11) 등재·모듈 등록으로 통합본 182→202 매핑, **cGetToday/cGetToday2 매핑 정정**(formatDate→`getServerDateTime` — 현재 일자 취득은 서버 기준, 기존 ins/mgt SOT 동일 오류 정정)
- `4fe8607` (09-01) — [연관] **pcc frame.xml·utils.xml·stf_old.xml 최종 삭제**(`src/pcc`, gcc 무변경): `$c.frame`/`$c.utils` 사용 중단 방침 — 호출부 gcc 전환 완료 후 정의 파일 삭제(잔존 $c.utils 2건은 `getServerDateTime`/`addDate` 치환), $c.frame 미정의 호출 10건(MDI/WinOpen/PDF 창)은 재설계 대기. pcc/stf 7파일 체제
- `6c95493` (09-01) — [연관] **$c.frame 미정의 호출 10건 정리**(`src/pcc`, gcc 무변경): common MdiHelp·FileDown1/2 삭제·`InfoMenuID`→`$c.win.getProgramId()` 위임, stf 뷰어/목록 4함수 톱 WinOpen→`$c.win.openPopup(browserPopup)` 전환(+`frame.FrameID`→`$p.getFrameId()`), print PDF 창 `window.open` 직접 호출 — pcc 에서 $c.frame/$c.utils 실행 참조 0건 달성
- `ce3c500` (09-01) — [연관] **common.xml($c.cm) 함수 주석·gcc 치환 정리**(`src/pcc`, gcc 무변경): 박스 주석 22건→@description 이관, 미사용 매핑확정 15개 정의 삭제(85→70 함수)·`fn_Trim` 호출 11건(내부 7·ui-tobe 4) `$c.str.trim` 치환 — 1:1 불가 4종(fn_CheckEmail alert 내장·fn_IsNumber_val 정수 전용·fn_DelChar/3 업무 로직) 유지·검토
- `6232c44` (09-07) — `$c.util` **동적 컬럼 그리드 공통함수 `syncDataListColumns`·`buildGridStyleXml` 신설** (315→317 메서드):
  - ULDFIS00600 에서 검증(런타임 화면 확인 09-07)된 로직의 승격 — `syncDataListColumns(dataList, cols)`: DataList 객체/id 수용, `insertColumn`(기존 id 엔진 skip·멱등)/잔존 `removeColumn` 동기화, `{inserted, removed}` 반환. `buildGridStyleXml(gridOptions, cols)`: `setGridStyle` 용 gridView 전체 XML 생성 — colDef `group` 연속 구간 colSpan 병합 + 고정 컬럼 rowSpan=2 의 **2단 그룹 헤더**(엔진 `setColumns` 는 단일 헤더 강제·group 미지원이라 setGridStyle 재생성이 표준), 옵션 `{id, dataList}` 필수·caption·기본값(gvw/allColumn/row/readOnly), `__escapeXmlAttr` 내부 헬퍼
  - ULDFIS00600 화면은 로컬 구현 제거 후 호출만 위임(정답지 유지), Jest `dynamicGridColumns.test.js` 9케이스(총 136건)·lint 0/0
- `2a987d1` (09-07) — [연관] **validate-generator 전체 폭 레이아웃 전환**(`src/docs`, gcc 무변경): `.wrap` 고정폭(1500px)·가운데 정렬 제거 → `width:100%`
- `963ceb0`·`78a29d9` (09-04) — [연관] **엔진 스냅샷 최신화 + ULDFIS00600 멀티로우 헤더 수정**(`src/engine`·`src/conversion`, gcc 무변경): 운영 최신 엔진(10.2MB, setColumns/setGridStyle 포함) 교체·beautified 재생성(js-beautify, 12.4MB). 엔진 실측으로 `setColumns` 는 colDef `{id,header,width,inputType,defaultValue}` 만 읽고 헤더 단일 행 강제(**group·align 미지원**) 확인 — b0ddf06 의 가정 스펙 정정, 2단 그룹 헤더를 `setGridStyle`(전체 XML 재생성) 전환으로 구현(vm 하니스·lxml 검증, 09-07 실화면 표시 확인)
- `0c2230c` (09-04) — [연관] **jsp-front 변환작업 보고서 HTML 신설**(`src/conversion`, gcc 무변경): jldfil25900·25910 변환 내용(공통 패턴·화면별 건수·커밋 4건)+사용 파일 목록(규약 SOT·가이드·gcc 공통 6파일·검증 도구) — DESIGN.md 토큰 준수 무의존 단일 HTML
- `b0ddf06` (09-04) — [연관] **sample-front gridView 동적 컬럼 샘플(ULDFIS00600) 신설**(`src/conversion`, gcc 무변경): 재무 조건검색 W-Craft 잔재를 JSON 데이터 기준 동적 컬럼 gridView 샘플로 재구성(축 pivot·서버통신·프레임 의존 전면 제거). 컬럼은 gridView 표준 `setColumns` API 로 데이터 도출 colDef(연도 `group` 병합 × 지표) 통째 재구성 — **연도 그룹·연도당 지표 슬롯 모두 데이터 기반**(사전정의·hidden 토글 없음, colDef `{id,header,width,align,group}` 스키마 확정). 통신은 `$c.sbm.executeDynamic` **async/await**(submitDoneHandler 미지정→Promise settle, `loadFisData` 4.서브미션 콜백 영역 배치), 데이터는 `ULDFIS00600.json` 유효 JSON 정규화(`meta{fixed,years,metrics}`+body, 한글키 보존). code-convention 준수(진입점 handleError·엄격비교·IIFE 0·4스페이스·publicInfo)+수정가이드 동봉, websquare-code-reviewer 교차검증. 엔진 근거: `setHeaderValue`(L39639)·`setColumnVisible`(L27502)·`setColumns`(운영 보강 API, 리포 스냅샷 미포함)
- `fc3b94f`·`5a75a16`·`7ec2732` (09-04) — [연관] **code-convention 들여쓰기·화면 IIFE 전면 금지 규약 + jsp-front 후속 정비**(`src/docs`·`src/conversion`, gcc 무변경): 규약 신설 — 스크립트 CDATA 4-스페이스 들여쓰기(탭·2-스페이스 혼용 금지·body XML 제외)·**화면 페이지 IIFE 전면 금지**(값 계산·값 쓰기용 인라인 IIFE 포함, `src/gcc`·`src/pcc` 모듈 패턴 IIFE 만 예외). `jldfil25900`·`25910` 들여쓰기 4-스페이스 통일+js-beautify 재포맷, `jldfil25910` 화면 인라인 IIFE 8건(값 추출 6·값 쓰기 1·파일컨트롤 폴백 1)→ 명명 헬퍼 3종(`getDmaValue`·`setComponentText`·`resolveFileControlRoot`) 전환·수정 가이드 §4.5 반영(`jldfil25900` 은 IIFE 0 재확인) — 화면 IIFE 잔존 0·XML WF·JS 구문 OK·CI green
- `d59962e`·`6b32da3` (09-04) — [연관] **code-convention 초기화·명명·변수 규약 추가 + jsp-front 2화면 변환**(`src/docs`·`src/conversion`, gcc 무변경): 규약 신설(IIFE·onpageload 오버라이딩 금지·init_* 순차·onpageload 2구역 최상단·미사용 scwin 전역 삭제·5구역 camelCase), jsp-front `jldfil25900`·`jldfil25910` 을 규약 준수 변환(IIFE→명명함수·오류처리 통일·엄격비교·미참조 캐싱 전역 44+96 삭제·JSDoc 11+39)+화면별 수정 가이드 md 동봉
- `7bf7c83` (09-04) — [연관] **필터 재설계 TODO 5건 처리**(`src/conversion`, gcc 무변경): ULDMGT10200 발송결과 필터·42045 퀵메뉴 검색 필터를 `setColumnFilter` 재설계+호출 배선(allCnt→getRowCount·사어 onfilter 토큰 제거), 40008 주석 블록 내 죽은 필터 3건 TODO 제거 — 워크리스트 42→37건
- `51dabaa` (09-03) — [연관] **조회 파라미터/세션 API TODO 6건 처리**(`src/conversion`, gcc 무변경): 원본 ui/ 소스로 파라미터명 확정 후 실배선 — ULDCOM00008 ×3 `DISCLS_SUBMITPRN_TP_CD`, tms ULDCOM00007 `LIST_STAT_CD`·`SPOT_ISU_TRD_MKT_TP_CD`(4건)·세션 TODO 강등($c.session.getUserInfo 확정)·stale 제거(ULDINF20000) — 워크리스트 48→42건
- `b1f9ee3` (09-03) — [연관] **그리드 포커스 전환 TODO 8건 처리**(`src/conversion`, gcc 무변경): 대상 그리드(Grd_com_isur) 마크업 소실 확정 6건 결론 주석 정리(팝업 대체 완료)·사어 usrName 삭제 2건 — 워크리스트 56→48건. 후속 후보: 미정의 Grd_com_isur 참조 14곳·$c.stockSearch 오기
- `4b2cd18` (09-03) — [연관] **팝업 파라미터/결과 처리 TODO 23건 일괄 처리**(`src/conversion`, gcc 무변경): ULDCOM00007 리턴("코드^명")→isurSearch_Rtn 연결 8건, 무반환 팝업(42035·42045·30305·40221) 콜백/데이터 제거 11건(+사어 popupCallback 호출·스텁 정리), 미변환 대상 4건 표준 TODO 정규화 — 이스케이프 손상 3파일 수리·저장 게이트 node 구문검사 추가, 워크리스트 75→56건
- `3d1a779` (09-03) — [연관] **0-based 인덱스 검토 TODO 24건 일괄 해소**(`src/conversion`, gcc 무변경): 1-base 오름 루프 18곳 0-base 전환·초과 순회 3곳·이벤트 row 경계 1곳·파생 버그 2건(grp[i-1]·insertRow 후 인덱스) 교정 — 13파일, 워크리스트 99→75건("0-based" 유형 소거)
- `f8fd191` (09-03) — [연관] **응답 처리 TODO 331건 일괄 마감**(`src/conversion`, gcc 무변경): 후처리 원천 없는 172건 제거(target 자동 바인딩 충분)·미배선 구 핸들러 159건 시그니처별 연결(rowcount→getRowCount/응답형→sbmRtn/async→await) — 83파일, 워크리스트 430→99건("응답 처리" 유형 소거), 구문·멱등 검증
- `8b3bc90` (09-03) — [연관] **Stage 2 TODO 워크리스트 자동 집계기 신설**(`src/conversion`, gcc 무변경): `gen_stage2_worklist.py` — TODO Stage2/TO-DO 주석 스캔·유형 9종 분류로 stage2_todo_worklist.md 재생성("자동 생성" 명세 실체화). 최신 기준선 430건(fil 최초 포함 — 응답 처리 331·0-based 24·$c.frame 21 등), 일반 TODO 과포집 패턴 교정
- `9cdcc92` (09-03) — [연관] **잔여 변환 일괄 마감(84파일)**(`src/conversion`, gcc 무변경): Gauce API 332→10건 — A(경미: debugger 16·미정의 공통 63·frame→getParent 25·window.event 37)·B(stf·tms ULDCOM00008 정답지 이식)·C(규칙 29 기계 변환: 정형 루프 23·getCellData 181·setFocusedCell 8·sort 6)·D(잔여 토큰: removeRow 11·addRow 9·removeAll 10·setSelectedIndex 12 등) — 잔존은 통신류(trs KeyValue/Post 10건)·형제/절대 프레임(18건)뿐, 전부 TODO Stage2 표기(서버 API·프레임 구조 확정 대기). 336파일 구문 0오류·고정점 유지
- `442f3d7` (09-03) — [연관] **stf ULDCOM00007_KOSDAQ_IR 경미 잔재 정리**(`src/conversion`, gcc 무변경): 미사용 전역 4종 삭제·keyCode 문자 비교 2건·window.event/파라미터 누락 교정 — 멱등·활성 잔재 0 (ULDCOM00007 계열 4사본 전체 정비 완료)
- `d73537c` (09-03) — [연관] **mgt·stf ULDCOM00007 경미 잔재 정리**(`src/conversion`, gcc 무변경): mgt 콜백 명명 규약 정합(`sbm_select_list_submitdone`)+Gauce userData2 사어 토큰 제거, stf 활성 `$c.frame`→`getParent` 전환·debugger 삭제·암묵 전역 교정 — 두 파일 멱등·잔재 0
- `b51580b` (09-03) — [연관] **tms ULDCOM00007 규칙 29 재설계**(`src/conversion`, gcc 무변경): 미선언 데이터셋 참조를 선언 DataList 로 정합(정적 submission·더미 로드 삭제), Gauce API 9종 표준 전환, `$c.frame`→`getParent`·`session.info`→`getUserInfo`·combo_stat label/value 반전 등 결함 6건 정정, 버튼 16종·그리드·콤보 이벤트 배선 복원 — 876→527줄, 멱등·Gauce 잔존 0 (mgt·stf 사본은 경미 잔재만)
- `05f54d8` (09-03) — [연관] **ULDINF20000 규칙 19 재설계**(`src/conversion`, gcc 무변경): JSP/jQuery 사어 블록 8개(~250줄)·미사용 전역 24종·미사용 함수 2개 삭제, `$c.date.getServerDateTime`·`$c.win.alert`·`setFocus` 표준 전환, 미정의 바인딩 제거 — 규칙 4 경계 해석 실패 해소로 5단계 구조·규칙 26 적용, **규칙 4 보류 파일 0건 달성**(잔존 레거시 0·멱등)
- `79376d7` (09-03) — [연관] **규칙 4 보류 5파일 정리 + convert.py 결함 2건 수정**(`src/conversion`, gcc 무변경): `_only_comment_blank` 블록 주석 인지형 개선·함수 경계 겹침 가드 신설(코드 복제 위험 차단), 4파일 해소(arrPar 1구역 이동+콤마 연산자 버그·bare 함수 3종 scwin 전환+await await 교정·단일 함수 화면 수동 구조화) — ULDINF20000 은 규칙 19 재설계 대상 보류 유지, 규칙 26 적용 115→119·보류 5→1, 고정점·pytest 45건 유지
- `b2284e8`·`7430abd` (09-03) — [연관] **변환 규칙 29·30 신설 + 4개 모듈 336화면 일괄 재적용**(`src/conversion`, gcc 무변경): 규칙 29(Gauce 데이터셋/그리드 API→WebSquare 표준 매핑표, 단계 2)·규칙 30(W-Craft 확인 마커 삭제 — 종전 정렬 유지 폐기)·규칙 11 블록 주석 include 보강·규칙 1 타 스코프 보정(pytest 45건). fil·mgt·stf·tms ui-tobe 제자리 멱등 재변환(vScrenID 삭제·진입점 try/catch·4구역·마커/include 소급 전량 삭제), ULDCOM00008 규칙 29 재설계(DataList 선언·이벤트 바인딩 복원·로드 오류 3건 정정)·calMM 파스 오류 2파일 교정 — 고정점 무변경·JS/XML 0오류·규칙별 잔존 0 전수 감사
- `b7324fe` (09-03) — [연관] **bns_common.xml($c.bns) 함수 주석·gcc 치환 정리 + 팝업 return 수신 전환**(`src/pcc`, gcc 무변경): @param placeholder 232건 전량 작성(사전 198+본문 확인 34, 객체 타입 교정)·eval 5건 제거, `await $c.win.openPopup` 66건 → `return await` 전환(호출 화면이 팝업 리턴 데이터 수신) — bare 호출 의심 11건 주석 내 무해 확인, vScrenID 72건은 함수 파라미터 설계로 유지, pcc 린트 0/0
- `e2cb41d` (09-02) — [연관] **code-convention.md 규약 7건 보강**(`src/docs`, gcc 무변경): 본 이력 검토로 식별된 누락 규약 명문화 — 변수·문법 규칙 절(var 금지·엄격 비교 5a/5e·원시 alert/eval 금지+confirm 동기 계약 예외·빌드 $p 주입 참고), 함수 JSDoc 표준(placeholder 금지), 검증 통합 절(validateDataCollect 규칙 24·validateDataMap), 버튼 상태 setButtonState 절, 도구 연동 표 5a·5e/8 행 추가
- `1434c25` (09-02) — [연관] **cp.xml($c.cp) 함수 주석·gcc 치환 정리**(`src/pcc`, gcc 무변경): getColumnProp 미정의 변수 버그 수정, getNameValueRow 구현(Gauce IndexOfColumn 호환 1-base), 미사용 4함수 삭제(13→9·publicInfo 12→8), placeholder JSDoc 11건 전부 작성 — pcc 린트 0/0 유지
- `ceacc0a` (09-02) — [연관] **변환 규칙 1을 vScrenID 삭제 규칙으로 전환**(`src/conversion`·`src/docs`, gcc 무변경): scwin.vScrenID 미사용 확정 — code-convention 삭제 규약 명문화, convert.py 규칙 1 재작성(선언·대입 삭제+잔존 참조 대입값/파일명 리터럴 치환·멱등)·규칙 2 앵커를 스크립트 최상단으로 재설계, 테스트 43건 통과·규칙 문서 3종 동기화. 화면 ID 필요 시 `$p.getFrameId()` 사용
- `191e8f3` (09-02) — [연관] **main.xml 함수 주석 정리**(`src/pcc`, gcc 무변경): JSDoc 정비(빈 @param 제거·@returns 추가·placeholder/오타 정정), initMainLoad 도달 불가 코드 8줄 삭제(no-op 명시), isMobileSize 간소화 — 원시 confirm 은 $c.win 닫기 흐름의 동기 boolean 계약으로 1:1 치환 불가(사유 주석 유지, async 재설계 단계 2)
- `1a7a9f6` (09-02) — `$c.sbm` **setPagingInfo 페이지 수 계산 0 나눗셈 방지**: recordCountPerPage 0("전체 표시")·미지정·비숫자면 1페이지 처리(`rcpp > 0` 가드) — 기존 `totalCnt / 0 = Infinity` 로 페이지 리스트가 무한 카운트 렌더링되던 버그 수정, 페이지 리스트 미표시 분기(setCount(1)) 정상 동작
- `59dfba2` (09-02) — [연관] **print.xml($c.print) gcc 치환 정리**(`src/pcc`, gcc 무변경): `dataFormatValue` 날짜 포맷 4종→`$c.date.formatDate` 위임(미지원 3종 사유 주석과 인라인 유지), `$c.util.isEmpty` 중복 빈값 비교 2건 간소화, 헤더 주석 stale $c.frame 의존 기술 삭제, 수정 함수 한정 var 정리 — 반입 시 이미 전면 현대화(JSDoc 완비)라 주석 이관은 불요. Gauce 데이터셋 API·Rexpert 전역 의존은 재설계 보류
- `2bb6db1` (09-02) — [연관] **stf.xml($c.stf) 함수 주석·gcc 치환 정리**(`src/pcc`, gcc 무변경): 레거시 박스 주석 이관·placeholder JSDoc 8건 해소·@example $c.dis→$c.stf 오기 9건 정정, 원시 alert 3건→`$c.win.alert`·eval 1건 제거, `formatDateEx`→`$c.date.formatDate(str, "-")` 위임+`FormatDateEx` 하위호환 별칭(외부 호출 109건 무중단), 미사용 4함수 삭제(60→56)·publicInfo 오염/고아 항목 교정(list_common `getValue77` 포함) — **pcc 린트 0 errors/0 warnings 달성**. Gauce DataID 4건은 재설계 보류
- `53f5f24` (09-01) — [연관] **list_common.xml($c.lc) gcc 치환 정리**(`src/pcc`, gcc 무변경): 원시 alert 35건→`$c.win.alert`·eval 숫자 캐스팅 10건→`Number()`·디버그 alert 2건 삭제, 미사용 알림 래퍼 2종(fn_alertMsg·fn_alertNoUpdate) 삭제(호출자 0건)+publicInfo 동기화 — 박스 주석·argument 라인 0건(이관 원천 없음), Gauce 데이터셋 API(DataID 17·NameValue 33·CountRow 17)는 통신 재설계(단계 2) 보류
- `3a76010` (09-01) — `$c.win` **팝업 타입별 데이터 수신 규약 — `openPopup` options.callbackFn 지원**:
  - **수신 규약(확정)**: `pageFramePopup` 은 `const result = await $c.win.openPopup(...)` **동기 수신** / `browserPopup` 은 **`options.callbackFn` 콜백** 비동기 수신(await 미사용) — `openPopup` 이 options.callbackFn 을 내부 채널(data.callbackFn)로 브리지(기존 data 전달 하위호환·options 우선), JSDoc 예시 2종·Jest 브리지 테스트 3케이스(127건)
  - 변환 규칙 17 산출 변경(browserPopup: options.callbackFn + await/data 미생성)·가이드 §1b 수신 규약 신설·code-convention 팝업 절 추가, 샘플 정합화 3건(ULDSTF30700/30702 잉여 callbackFn 제거 — 이중 조회 해소, ULDFIL59410 await 수신 전환)

---

## 커밋 이력 (src/gcc)

| 일자 | 커밋 | 제목 |
|------|------|------|
| 2026-09-07 | `2a987d1` | style(docs): validate-generator 전체 폭 레이아웃 전환 — [연관, gcc 무변경] |
| 2026-09-07 | `6232c44` | feat(gcc): 동적 컬럼 그리드 공통함수 syncDataListColumns·buildGridStyleXml 신설 (315→317 메서드) |
| 2026-09-04 | `78a29d9` | fix(conversion): ULDFIS00600 멀티로우 헤더 미적용 — setColumns→setGridStyle 전환 — [연관, gcc 무변경] |
| 2026-09-04 | `963ceb0` | chore(engine): WebSquare 엔진 스냅샷 최신화 + beautified 재생성 — [연관, gcc 무변경] |
| 2026-09-04 | `0c2230c` | docs(conversion): jsp-front 변환작업 보고서 HTML 신설 — [연관, gcc 무변경] |
| 2026-09-04 | `b0ddf06` | feat(conversion): sample-front gridView 동적 컬럼 샘플(ULDFIS00600) 신설 — setColumns·executeDynamic async/await — [연관, gcc 무변경] |
| 2026-09-04 | `7ec2732` | refactor(conversion): jldfil25910 화면 인라인 IIFE 전면 제거 + code-convention 규칙 — [연관, gcc 무변경] |
| 2026-09-04 | `5a75a16` | style(conversion): jsp-front jldfil25900·25910 script 코드 뷰티파이 — [연관, gcc 무변경] |
| 2026-09-04 | `fc3b94f` | style(convention): 들여쓰기 규칙 추가 + jsp-front 2화면 들여쓰기 — [연관, gcc 무변경] |
| 2026-09-04 | `6b32da3` | feat(conversion): jsp-front jldfil25900·25910 code-convention 변환 + 가이드 — [연관, gcc 무변경] |
| 2026-09-04 | `d59962e` | docs(convention): 초기화·명명·변수 규약 추가 — [연관, gcc 무변경] |
| 2026-09-04 | `7bf7c83` | refactor(conversion): 필터 재설계 TODO 5건 처리 — 워크리스트 42→37건 — [연관, gcc 무변경] |
| 2026-09-03 | `51dabaa` | refactor(conversion): 조회 파라미터/세션 API TODO 6건 처리 — 워크리스트 48→42건 — [연관, gcc 무변경] |
| 2026-09-03 | `b1f9ee3` | refactor(conversion): 그리드 포커스 전환 TODO 8건 처리 — 워크리스트 56→48건 — [연관, gcc 무변경] |
| 2026-09-03 | `4b2cd18` | refactor(conversion): 팝업 파라미터/결과 처리 TODO 23건 일괄 처리 — 워크리스트 75→56건 — [연관, gcc 무변경] |
| 2026-09-03 | `3d1a779` | refactor(conversion): 0-based 인덱스 검토 TODO 24건 일괄 해소 — 워크리스트 99→75건 — [연관, gcc 무변경] |
| 2026-09-03 | `f8fd191` | refactor(conversion): 응답 처리 TODO 331건 일괄 마감 — 워크리스트 430→99건 — [연관, gcc 무변경] |
| 2026-09-03 | `8b3bc90` | feat(conversion): Stage 2 TODO 워크리스트 자동 집계기 신설 + 재집계(430건) — [연관, gcc 무변경] |
| 2026-09-03 | `9cdcc92` | refactor(conversion): 잔여 변환 일괄 마감(84파일) — Gauce API 332→10건 — [연관, gcc 무변경] |
| 2026-09-03 | `442f3d7` | refactor(conversion): stf ULDCOM00007_KOSDAQ_IR 경미 잔재 정리 — [연관, gcc 무변경] |
| 2026-09-03 | `d73537c` | refactor(conversion): mgt·stf ULDCOM00007 경미 잔재 정리 — [연관, gcc 무변경] |
| 2026-09-03 | `b51580b` | refactor(conversion): tms ULDCOM00007 규칙 29 재설계 — Gauce API 전면 전환 — [연관, gcc 무변경] |
| 2026-09-03 | `05f54d8` | refactor(conversion): ULDINF20000 규칙 19 재설계 — 보류 파일 0건 달성 — [연관, gcc 무변경] |
| 2026-09-03 | `79376d7` | fix(conversion): 규칙 4 보류 5파일 정리 + convert.py 결함 2건 수정 — [연관, gcc 무변경] |
| 2026-09-03 | `7430abd` | refactor(conversion): 4개 모듈 ui-tobe 336화면 신규 규칙 일괄 재적용 — [연관, gcc 무변경] |
| 2026-09-03 | `b2284e8` | feat(conversion): 규칙 29·30 신설 + 규칙 1 보정·11 보강 — [연관, gcc 무변경] |
| 2026-09-03 | `b7324fe` | refactor(pcc): bns_common.xml 함수 주석·gcc 치환 정리 + 팝업 return 수신 전환 — [연관, gcc 무변경] |
| 2026-09-02 | `e2cb41d` | docs(convention): 업데이트 이력 검토분 규약 7건 code-convention.md 반영 — [연관, gcc 무변경] |
| 2026-09-02 | `1434c25` | refactor(pcc): cp.xml 함수 주석·gcc 치환 정리 — 버그 수정·스텁 구현 — [연관, gcc 무변경] |
| 2026-09-02 | `ceacc0a` | feat(conversion): 규칙 1을 vScrenID 삭제 규칙으로 전환 — 미사용 코드 정리 — [연관, gcc 무변경] |
| 2026-09-02 | `191e8f3` | refactor(pcc): main.xml 함수 주석 정리 — confirm 동기 계약 유지 — [연관, gcc 무변경] |
| 2026-09-02 | `1a7a9f6` | fix(sbm): setPagingInfo 페이지 수 계산 0 나눗셈 방지 — 전체 표시 1페이지 처리 |
| 2026-09-02 | `59dfba2` | refactor(pcc): print.xml gcc 치환 정리 — 날짜 포맷 $c.date.formatDate 위임 — [연관, gcc 무변경] |
| 2026-09-02 | `2bb6db1` | refactor(pcc): stf.xml 함수 주석·gcc 치환 정리 — pcc 린트 0/0 — [연관, gcc 무변경] |
| 2026-09-01 | `53f5f24` | refactor(pcc): list_common.xml gcc 치환 정리 — [연관, gcc 무변경] |
| 2026-09-01 | `ce3c500` | refactor(pcc): common.xml 함수 주석·gcc 치환 정리 — [연관, gcc 무변경] |
| 2026-09-01 | `6c95493` | refactor(pcc): $c.frame 미정의 호출 10건 정리 — gcc 전환·미사용 삭제 — [연관, gcc 무변경] |
| 2026-09-01 | `4fe8607` | refactor(pcc): frame.xml·utils.xml·stf_old.xml 최종 삭제 — $c.frame/$c.utils 사용 중단 — [연관, gcc 무변경] |
| 2026-09-01 | `8e0f903` | feat(conversion): utils.xml($c.utils) gcc 이관 매핑 stf SOT 신설 + cGetToday 매핑 정정 — [연관, gcc 무변경] |
| 2026-09-01 | `d6baae5` | refactor(pcc): stf 업무공통 정비 — $c.frame 의존 제거·gcc 전환·미사용 삭제·컨벤션 정리 — [연관, gcc 무변경] |
| 2026-09-01 | `e83f7b3` | feat(date): isDate에 objName 인자·실패 시 공통 메시지 알림 추가 |
| 2026-09-01 | `3a76010` | feat(win,conversion): 팝업 타입별 데이터 수신 규약 — options.callbackFn 지원·규칙 17 반영 |
| 2026-09-01 | `f519466` | feat(conversion): 규칙 26 보완 + 샘플 15종 진입점 try/catch 소급 적용 (123건) — [연관, gcc 무변경] |
| 2026-09-01 | `1782df6` | feat(sample): SMPVAL10000에 validateDataMap 서버 체크 플래그 검사 데모 추가 — [연관, gcc 무변경] |
| 2026-09-01 | `bd1d208` | feat(validate): DataMap 값 검사 공통함수 validateDataMap 신설 + ULDBNS15000 적용 (314→315) |
| 2026-09-01 | `bae7a2a` | feat(sample): ULDBNS15000 표면이자율변경 가이드 화면 — 단계1+2 전체 변환 — [연관, gcc 무변경] |
| 2026-09-01 | `ba06e21` | feat(conversion): 변환 규칙 확장 — 5e·25~28 신설, 13 보강, 규칙24 문서화, 매핑 갱신 — [연관, gcc 무변경] |
| 2026-09-01 | `53991e1` | feat(gcc): getMessage 배열 인자 지원·checkCalendarFormat 메시지 코드 전환 |
| 2026-08-28 | `ff296d8` | refactor(gcc): 빌드 $p 주입 규칙 1단계 — util/exception/date $c 사용 헬퍼 공개화 |
| 2026-08-28 | `3ca9bfa` | refactor(gcc): 빌드 $p 주입 규칙 2·3단계 — data/sbm/win $c 사용 헬퍼 공개화 |
| 2026-08-28 | `360d563` | refactor(validate): 빌드 $p 주입 규칙 적용 — $c 사용 함수 공개 전환·$c.validate 호출 통일 |
| 2026-08-28 | `7c0c78b` | feat(sample): ULDINF05000 발행기관등록 가이드 화면 — 컨벤션 정리 + 공통 검증 전환 — [연관, gcc 무변경] |
| 2026-08-28 | `0c4b9da` | feat(validate): includeUnbound 옵션·composition 규칙 추가 |
| 2026-08-28 | `2208793` | feat(docs): validate-generator 필드 테이블에 컴포넌트 ID 열 추가 — [연관, gcc 무변경] |
| 2026-08-28 | `ad4228c` | feat(validate): 검증 모듈 명세 v3 반영 — focus/compare/matchValue 등 7항목 |
| 2026-08-27 | `d8c0780` | feat(sample): SPCHART_NOTICE 미리보기에 공시목록 총 건수 표시 추가 — [연관, gcc 무변경] |
| 2026-08-27 | `72b0536` | refactor(ext): var 선언을 const/let 으로 전환 |
| 2026-08-27 | `7e50d0b` | fix(ext): SBChart 고아 resize 리스너 정리 체계 — destroyChart 신설 (287→288) |
| 2026-08-27 | `7f2ab7b` | feat(sample): SPCHART_NOTICE 실무 골격 마크업·총건수·데이터 보강 + 얇은 막대 hit 보정 — [연관, gcc 무변경] |
| 2026-08-27 | `e520ee5` | fix(sample): SPCHART_NOTICE 리사이즈 시 crosshair·툴팁 복구 + x축 라벨 간격 2 — [연관, gcc 무변경] |
| 2026-08-27 | `9995fa6` | refactor(sample): SPCHART_NOTICE init/서브미션 분리 + 미리보기 5단계 영역 정리 — [연관, gcc 무변경] |
| 2026-08-27 | `be13515` | refactor(sample): SPCHART_NOTICE 표준 골격 재구성 + formatDate 공통함수 전환 — [연관, gcc 무변경] |
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
