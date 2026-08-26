# gcc 공통함수 활용 최종 샘플 카탈로그 (sample-front)

전환(Stage 2) 보강·신규 화면 개발 시 **화면 유형을 매칭해 그대로 참조하는 표준 템플릿 13종**을 정리한다.
모든 샘플은 [code-convention.md](../../docs/code-convention/code-convention.md)의 **5단계 정형화 구조**(`///////// n. 영역명 /////////`)와
**서브미션 async/await 순차 실행** 원칙을 따르며, gcc 공통함수(`$c.*`)만으로 화면을 구성한 최종 결과물이다. (2026-08-21 기준)

- **소스 위치**: `src/conversion/sample-front/ui/*.xml`
- **배포 경로**: `/ui/sample/template/*.xml` (WebSquare 서버)

## 1. 샘플 목록

| 소스 파일 | 가이드 유형 | 원본 화면 | 배포 경로 |
|-----------|------------|-----------|-----------|
| `JLDFIL25900.xml` | 신고 목록 + 작성 진입 | JLDFIL25900 배당기준일자 신고 | `/ui/sample/template/JLDFIL25900.xml` |
| `JLDFIL25910.xml` | 신고 저장·수정 | JLDFIL25910 배당기준일자 신고 저장 및 수정 | `/ui/sample/template/JLDFIL25910.xml` |
| `ULDFIL35700.xml` | 탭 + 입력 계산 + 기간조회 | ULDFIL35700 상장수수료 | `/ui/sample/template/ULDFIL35700.xml` |
| `ULDFIL52100.xml` | 입력폼 + 팝업조회 + 첨부저장 | ULDFIL52100 의무보유주식의 처분 작성화면 | `/ui/sample/template/ULDFIL52100.xml` |
| `ULDFIL52110.xml` | 법인명 찾기 팝업화면 | ULDFIL52110 법인명 찾기 팝업화면 | `/ui/sample/template/ULDFIL52110.xml` |
| `ULDFIL59400.xml` | 목록 조회 + 페이징 | ULDFIL59400 코스닥 전문평가신청 목록 | `/ui/sample/template/ULDFIL59400.xml` |
| `ULDFIL59410.xml` | 대형 작성화면 | ULDFIL59410 코스닥 전문평가신청 작성화면 | `/ui/sample/template/ULDFIL59410.xml` |
| `ULDINF20000.xml` | 조회조건 + 기간검색 + 엑셀다운로드 | ULDINF20000 표준코드 조회 | `/ui/sample/template/ULDINF20000.xml` |
| `ULDSTF07404.xml` | 메일 발송 팝업 | ULDSTF07404 전문평가 메일발송 | `/ui/sample/template/ULDSTF07404.xml` |
| `ULDSTF30700.xml` | 조회조건 + 페이징 + 엑셀 | ULDSTF30700 비밀번호 신규 | `/ui/sample/template/ULDSTF30700.xml` |
| `ULDSTF30702.xml` | 조회조건 + 페이징 + 엑셀 | ULDSTF30702 비밀번호 재발급 | `/ui/sample/template/ULDSTF30710.xml` |
| `SMPVAL10000.xml` | 통합 입력 검증 (validateDataCollect 전체 옵션) | (합성 가이드 — 원본 없음) | `/ui/sample/template/SMPVAL10000.xml` |
| `SMPBTN10000.xml` | 버튼 상태 일괄 제어 (setButtonState) | (합성 가이드 — 원본 없음) | `/ui/sample/template/SMPBTN10000.xml` |

> 소스↔원본은 파일 head(`meta_screenName`의 "원본 …" 표기) 기준 **1:1 매핑**이다.
> `ULDSTF30702`만 배포 파일명이 `ULDSTF30710.xml`로 다르므로 배포 시 주의한다.

## 2. 화면 유형 → 샘플 매칭 가이드 (Stage 2에서 사용)

전환 대상 화면의 성격을 아래에서 찾아 해당 샘플을 **구조·공통함수 사용의 기준**으로 삼는다.

| 전환 대상 화면 유형 | 참조 샘플 | 참조 포인트 |
|--------------------|-----------|-------------|
| 단순 목록 조회(+상세 진입) | `JLDFIL25900`, `ULDFIL59400` | `await executeDynamic` 조회 → gridview 바인딩, 행 클릭 `$c.win.moveUrl` 상세 이동, 사전 확인 서브미션 |
| 목록 + 페이징(+엑셀) | `ULDSTF30700/30702`, `ULDINF20000` | `$c.sbm.setPagingInfo`(totalCnt 전달), `$c.data.downloadGridViewExcel`, `$c.win.setEnterKeyEvent` 조회 트리거 |
| 조회조건 가변 + 기간검색 | `ULDINF20000` | 검색구분별 조건 토글, 기간 버튼(`$c.date.addDate/addMonth/addYear` + `getServerDateTime`), `compareFromToDate` 기간 검증 |
| 작성(등록·수정 겸용) | `JLDFIL25910` | 파라미터 유무로 등록/수정 분기(`$c.data.getParameter`), `$c.data.isModified` 이탈 확인, `validateGroup` + 저장 confirm→await 저장→이동 |
| 입력폼 + 팝업조회 + 첨부저장 | `ULDFIL52100` | 모드(신규/수정/조회) 분기, `$c.win.openPopup` 값 채움, `$c.util.onUploadClick`/`checkFileExtension` 첨부, `$c.data.downFile` |
| 대형 작성화면(다구역) | `ULDFIL59410` | 구역별 검증(`validateGroup`+`$c.str.isEmail/isPhone/isBizID`), 코드 팝업, 반복입력, 다중 첨부슬롯, 상태별 버튼, `setCommonCode` |
| 탭 구성 + 입력 계산 | `ULDFIL35700` | 탭별 독립 로직, `$c.num.formatNumber/unFormatNumber/round` 합산 계산, `$c.win.mainPrint`/`openReportPdf` 출력 |
| 조회 팝업(값 반환) | `ULDFIL52110` | 팝업 내 페이징 조회, 선택값 `$c.win.closePopup(param)` 반환 (부모는 callbackFn 수신) |
| 기능 팝업(부모 조작·발송) | `ULDSTF07404` | `$c.win.getParent` 부모 데이터 수신, `$c.validate.validateDataCollect`(폼)·`validateDataCollection`(그리드 행) 검증, 첨부 발송 |
| 입력 검증이 많은 작성화면 | `SMPVAL10000` | `validateDataCollect` 전 규칙 한 벌 시연 — 필수/byte(`maxLengthB`)/형식(`corpNum`·`bizNum`·`urlNoProtocol`·`email`·`date`)/조건부(`emptyIf` 외국국적·`requiredIf` 선행조건)/중복(`duplicateGroup`·그리드 `duplicate`)/약관(`checked`) + `$c.util.checkFileTotalSize` 총용량 |
| 상태별 버튼 제어가 있는 화면 | `SMPBTN10000` | `$c.util.setButtonState` 상태별 버튼 일괄 활성/비활성 시연 — 역할→버튼 매핑(id 비통일 대응)·표준 상태 6종·동적 역할(출력)·override 예외·`registerButtonState` 전용 상태·즉석 상태 객체 |

## 3. 샘플에 구현된 표준 패턴 (공통)

13종 전체가 공유하는 규약 — 전환 결과물도 이 상태에 도달해야 한다.

1. **5단계 정형화 구조** — `///////// 1. 변수 및 선언 영역 /////////` ~ `///////// 5. 일반/업무 함수 영역 /////////` 5개 헤더, 서브미션 콜백은 4구역으로 분리.
2. **서브미션 async/await** — `const sbmRtn = await $c.sbm.executeDynamic(sbmOptions);` 순차 스타일. `submitDoneHandler`를 넘기면 Promise가 settle 되지 않으므로 핸들러 방식과 혼용하지 않는다.
3. **알림·확인** — `$c.win.alert`/`confirm`(await) + `$c.data.getMessage` 메시지 코드 사용(하드코딩 문구 금지).
4. **검증** — 신규 화면은 `$c.validate.validateDataCollect`(폼)·`validateDataCollection`(그리드) 우선, 기존 골격은 `$c.data.validateGroup`. options 스니펫은 [validate-generator](../../docs/validate-generator/) 도구로 생성 가능.
5. **페이징** — 조회 후 `$c.sbm.setPagingInfo(... totalCnt ...)` 호출(내림차순 순번 `rowNumVisble desc`, `maxRowNum "all"` 지원).
6. **날짜·숫자·문자** — `$c.date.*`(getServerDateTime/formatDate/checkCalendarFormat/compareFromToDate), `$c.num.*`, `$c.str.*` 로만 처리(전역 prototype 확장 금지).
7. **세션·파일** — `$c.session.getUserInfo`, 업로드 `$c.util.onUploadClick`+`checkFileExtension`, 다운로드 `$c.data.downFile`.
8. **오류 처리** — 사용자 액션 진입점(이벤트 핸들러·`onpageload`)에서만 try/catch, catch 는 `$c.exception.handleError(ex, { context : "화면ID.함수명" })` 한 줄로 통일(빈 catch·원시 alert 금지, sbm 통신 오류·중복 제출 skip 은 handleError 가 선별해 이중 알림 없음). 상세: [code-convention.md](../../docs/code-convention/code-convention.md) §오류 처리.

### 모듈 공통 의존 (배포 환경 전제)

`ULDSTF30700/30702`는 gcc 외 **모듈 공통 네임스페이스**를 호출한다: `$c.stf.setFromToDate`/`openPopupCorpInfo`, `$c.cm.fn_com_isur`/`IsurcdSearch`/`IsurcdSearchBond`, `$c.data.comboCbDataSetDynamic`/`comboCbDataSetPeriod`.
`$c.stf`/`$c.cm`은 본 저장소 밖(모듈 공통)에서 제공되므로, **다른 프로젝트에서 이 샘플을 참조할 때는 대응 공통이 있는지 확인**하고 없으면 해당 호출부를 프로젝트 공통으로 대체한다.

## 4. 관리 규칙

- 샘플 파일을 추가·갱신하면 **이 문서의 표와 매칭 가이드를 함께 갱신**한다.
- 샘플은 항상 최신 conversion 규칙(규칙 1~23)과 code-convention을 만족한 상태를 유지한다 — 샘플이 곧 Stage 2의 "정답지"다.
- 관련 문서: [conversion_process_overview.md](conversion_process_overview.md) · [conversion_rules.md](conversion_rules.md) · [stage2_todo_worklist.md](stage2_todo_worklist.md) · [conversion_playbook.md](conversion_playbook.md)
