# jldfil52100 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `../krx_소스전환/jldfil52100.xml` → 정비본: `jsp-front/jldfil52100.xml` (2026-09-07)
> 기준: [code-convention.md](../../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 36건 | 전 함수(@description 구체 서술·@param 타입·@returns·@example·@hidden 완비, `@event`→`@method` 통일 12건 포함) |
| publicInfo 등재 | 13건 | 기계 패스 완료(onpageload + 이벤트 핸들러 12) — 이번 정비 범위 아님 |
| let→const | 75건 | 재할당 없는 지역 전부(let 84 → 9, 잔존 9는 루프 카운터 `i`/`j`·while 대입 `n`·catch 재할당 `v`·`res`×3·재조립 배열 `a`×2) |
| var 전환 | 0건 | var 잔존 없음 |
| `__` 지역변수 개명 | 19건 | `__cds`→`ctxDefaults`·`__pc0`→`pc`·`__ck`→`key`·`__cv0`→`cur`·`__rowCopies`→`rowCopies`·`__r0`→`renderRoot`/`root`·`__doc`→`doc`·`__self`→`selfEl`(핸들러 12) |
| 과밀 라인 분해 | 25건 | init_conds 바인딩 한 줄(2,377자) → `readSearchType`/`readReopnYn` 캐싱 + 바인딩별 행 분리 · init 의 ${} 가드 3줄(각 405~505자) → `readCtx` 헬퍼 · insert/updatePrtDepoWithd 의 unFormat 6줄(각 700자+) → 함수 내 `unformatField` 헬퍼(fieldEl 1회 해석 캐싱) · checkValue 체크 판정(405자) → `reopnYnComp`/`reopnYnChecked` 분리 · init_rowCopy·init_sessionFill·upd_attachFiles 결선 4건·btn_FileDown(_2)_onclick·tx_fn_FileDown·fn_findPrtDepo/fn_findAcptCompany openPopup·set*Info_recv 2건 등 다중행 분해. 반복 `getComponent('dma_FileDownReq')` 는 `fileDownReq` 캐싱 |
| onpageload 재배치 | O | 2구역 최하단 → **2구역 최상단**으로 이동, init_* 호출에 `// 1)`~`// 6)` 순번 주석 부여 |
| 기타 정리 | 1건 | 1구역 `scwin.form` 이중 선언(null → undefined 재선언)을 1벌(null)로 통합 — 모든 사용처가 사용 전 재할당하므로 동작 동등 |

## 2. 화면 개요

의무보유주식의 처분 작성 화면. 법인 검색(jldfil52110)·의무보유내역 검색(jldfil52120) 팝업으로 대상을 선정하고, 처분 주식수·사유·재의무보유 여부를 입력하고 공문/첨부서류를 업로드해 처분신청을 신규 저장(searchType=0)·수정 저장(2/3)·제출하며, 기첨부 파일을 다운로드한다. searchType 별로 업로드/다운로드 영역과 저장·제출 버튼 표시가 전환된다.

## 3. 보류(유지) 항목

- `fn_*`/`tx_*` 함수명(정의·호출부) 유지 — 개명 금지 규약.
- `== null`/`!= null` null/undefined 동시 판별 관용구 유지(checkValue·insertPrtDepoWithd·init 등).
- btn_filePrtDepoWithd_onclick 의 `filePrtDepoWithd()` — as-is 원본부터 이 화면에 정의가 없는 전역 호출. 로직 동등 원칙으로 유지(호출 시 try/catch 의 handleError 로 수집됨). JSDoc 에 명기.
- init_pageBody 의 `searchType = 'null';` 암묵 전역 대입 — as-is 흐름 보존(지역 선언화하면 전역 의미가 바뀌므로 유지).
- setCorpInfo_recv 의 파라미터 정렬 기준(setCorpInfo 시그니처)과 최종 적용 함수 호출 구조 — as-is 그대로 유지.
- `__krxFileControl`(외부 전역 함수)·`__sdd_rec`(팝업 회신 레코드 속성)·`__rb0`/`__rb1`/`__rb2`(컴포넌트 id 문자열) 등 비(非)지역변수 `__` 표기는 개명 대상 아님 — 유지.
- fn_findPrtDepo/fn_findAcptCompany 의 미사용 `w`/`h`/`l`/`t`(as-is window.open 좌표 계산 잔재), fn_FileDown 의 미사용 `downForm.action` 대입 흐름 — const 전환만 하고 유지.
- 핸들러의 미사용 지역 alias(`ev`/`event`/`selfEl`) — 변환기 표준 산출 형태라 삭제하지 않고 const 전환·개명만 수행(jldfil35701 선례).
- init 의 중첩 else-if 사다리 구조 — 로직 동등 원칙으로 평탄화하지 않고 유지.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0)
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0
- [x] 로직 동등(동작 변경 없음)
- [x] node --check 통과

## form 제출 재설계 — $c.win.openFormSubmit 전환 (2026-09-07)

JSP form 제출 기계부를 gcc `$c.win.openFormSubmit(url, params)` 기반으로 재설계. 이 화면의 폼은 2벌 — `fileDownForm`(form_1, **빈 그룹**: named 입력 0건, 다운로드 요청 전용)과 `prtDepoForm`(form_10, `w2:upload` 4개 — `upd_attachFiles`/`_2`/`_3`/`_4`, `name="attachFiles[0]/[1]"` — 를 포함한 **multipart 폼**). multipart 예외 규칙에 따라 prtDepoForm 계열 제출은 전량 보류.

### 제출 지점별 전환 (전환 1건 · 보류 3건)

| 제출 지점 | 구 흐름 | 처리 | URL·params 근거 |
|---|---|---|---|
| fn_FileDown | `document.fileDownForm` 참조 + `downForm.action='/listInvstg/lplAttach.do'`(미사용 대입) + dma_FileDownReq 세팅 → tx_fn_FileDown($c.data.downFile) | **전환** | `$c.win.openFormSubmit('/listInvstg/lplAttach.do', params)` POST — params = { method:'downloadPrtdepoFile', prtDepoId, prtDepoIdSeq, fileSeq } (form_1 빈 그룹 실측 + 이 흐름이 세팅하던 4키 = as-is fileDownForm hidden 필드 집합; 파일 다운로드 의미 보존) |
| insertPrtDepoWithd | `scwin.form=(document.prtDepoForm‖…)` + `action='/listInvstg/prtDepo.do'` + tx_insertPrtDepoWithd | **보류** | multipart 파일 전송(upd_attachFiles·upd_attachFiles_3 필수 선택 검사 후 제출) — 원형 유지 + `// TODO form-재설계-보류` 표기 |
| updatePrtDepoWithd | `scwin.form=(document.prtDepoForm‖…)` + `action='/listInvstg/prtDepo.do'` + tx_updatePrtDepoWithd | **보류** | multipart 파일 전송(searchType 2/3 재업로드 upd_attachFiles_2·upd_attachFiles_4) — 원형 유지 + TODO 표기 |
| sendPrtDepoWithd | `scwin.form=(document.prtDepoForm‖…)` + `action='/listInvstg/prtDepoList.do'` + tx_sendPrtDepoWithd | **보류** | prtDepoForm 자체가 업로드 컴포넌트를 포함한 multipart 폼 — 원형 유지 + TODO 표기 |

부수 정리:

- fn_FileDown 전환에 따라 tx_fn_FileDown 삭제(호출 잔존 0건), 미사용 `downForm.action` 대입 흐름(§3 보류 항목이던 것)과 dma_FileDownReq 임시 세팅 4건(prtDepoId·prtDepoIdSeq·fileSeq·method — 다른 소비처 0건 확인) 제거 — 전송 파라미터 객체 직접 구성으로 대체.
- 1구역 `scwin.form` 전역과 그 캐시 재설정(init_pageBody·checkValue) — prtDepoForm 보류 계열이 계속 사용하므로 **유지**(1구역 선언부에 보류 사유 TODO 주석 부기).
- `filePrtDepoWithd()` 미정의 전역 호출(§3 원본 유래 결함) — 지시대로 무변경.

### 보류 잔존 목록 (`document.폼` 참조 = 아래 5곳, `.submit()` 잔존 0건)

1. 1구역 다음의 init_pageBody `scwin.form = (document.prtDepoForm || { elements: [] })` — 활성 폼 캐시(as-is body onload 대응)
2. checkValue 동일 캐시 재설정 — 보류 제출 함수들의 선행 검증 경로
3. insertPrtDepoWithd — multipart 보류(TODO 표기)
4. updatePrtDepoWithd — multipart 보류(TODO 표기)
5. sendPrtDepoWithd — multipart 보류(TODO 표기)

### 검증 결과

- script CDATA 추출 → `node --check` OK
- `python -m wsxml_lint jldfil52100.xml --min-severity error` → 1 files, 0 errors, 0 warnings
- `document.폼` 잔존 5곳 = 위 보류 목록과 일치, tx_fn_FileDown/downFile/downForm 참조 잔존 0건
