# jldfil59410 수정 가이드 — editor-web generate 산출물 후속 정비

> 원본: `../krx_소스전환/jldfil59410.xml` → 정비본: `jsp-front/jldfil59410.xml` (2026-09-07)
> 기준: [code-convention.md](../../../docs/code-convention/code-convention.md), 정답지 [jldfil25900](jldfil25900_수정가이드.md)

## 1. 변경 요약

| 항목 | 건수 | 내용 |
|------|------|------|
| JSDoc 표준화 | 87 | 전 함수(85 + 신규 헬퍼 2)에 `@description`(본문 기반 한국어 서술)·`@param`(타입 명기)·`@returns`·`@hidden N`·`@example` 부여, placeholder 0. 기존 `@method`/`@event`/`@name` 유지 |
| publicInfo 등재 | 40 | 기계 패스 선반영분 유지(이벤트 핸들러 40종) — body/publicInfo 무변경 |
| let→const | 175 | 재할당 없는 `let` 전부 `const` 전환 (let 209 → 잔여 let 34: 루프 카운터·재할당 변수(`res`·`valuRslt`·`innerStr`·`objArr`·`strVal`·`chkDupFlag`·`subMode`·`txt`·`tmpFile*`·`rowIdx`·`renderRoot`·`a`·`v`·`n`)만 유지, const 220) |
| var 전환 | 2 | `checkForm` 의 `for (var i …` 2건 → `for (let i …` (루프 후 미사용 확인, 블록 스코프 무해) |
| `__` 지역변수 개명 | 62 | `__self`(37)→`srcElem`, `__d`(6)→`dataList`, `__g`(4)→`gen`, `__i`(4)→`idx`, `__vFields`(2)→`vFields`, `__pc_loadTp`/`__pc`→`pc`, `__attrReals`→`attrReals`, `__genFills`→`genFills`, `__row`→`rowIdx`, `__cell`→`readCell`(콜백 파라미터 `__v`/`__i`→`read`/`idx`), `__rowCopies`→`rowCopies`, `__r0`→`renderRoot`, `__doc`→`doc` — 함수 내 참조 전부 동반 개명, 선언 잔존 0 |
| 과밀 한 줄 분해 | 44 | 200자 초과 라인 전부 분해(잔존 0). 동일 호출식 반복은 const 캐싱: `readLoadTp`/`readDetail`(init_conds), `seq`(다운로드/삭제 핸들러 15종), `registerReq`(fn_Register·checkForm, `getComponent("dma_RegisterReq")` 14회 축약), `frameRender`(init_sessionFill), 4중 중복 `readValue`(loadTp·returnVal·entity.seq·leadcom_mbr_no·specy_valu_inst_cd) |
| 헬퍼 신설 | 2 | `scwin.findFileControl(id)`(파일 컨트롤 7종 로드 시 초기화의 동일 3항식 반복 제거)·`scwin.readPageParam(key)`(loadTp/returnVal 의 4중 중복 readValue + EL 토큰 가드 축약) — 로드 시점 사용부 상단에 정의(순서 의존 주석 명기), publicInfo 비등재(내부용) |
| onpageload 재배치 | 1 | 2구역 중간(파일컨트롤 선언 뒤) 정의를 **2구역 최상단**으로 이동, `init_recvParam → … → init_pageBody` 9단계에 순번 주석(1)~9)) 부여. 실행 시점은 body `ev:onpageload` 이벤트라 동작 무변경 |

## 2. 화면 개요

코스닥 **전문평가(특례평가) 배정 신청 작성/상세 화면**. 신규 진입(loadTp "0") 시 신청서 작성(회사·대표자·신청인 정보, 주관사/제척기관 선택, 평가기관 신청수·연장신청, 첨부파일 업로드)을, 조회 진입 시 저장분 복원과 평가결과 요약(valuRsltInfo1~6) 표시·수정/삭제/철회를 제공한다. 등록·철회·삭제·파일 다운로드는 `specyValuAppl.do` 서브미션(tx_fn_*)으로 처리하고, 목록 화면(jldfil59400)과 우편번호(jldinf90009)·업종코드 팝업이 연계된다.

## 3. 보류(유지) 항목

- **`fn_*`/`tx_fn_*` 명명 17건**: `fn_PopZipCode`·`fn_toList`·`fn_chk*`·`fn_check*`·`fn_Register`·`fn_Delete`·`fn_RetrRequest`·`fn_DownloadFile`·`fn_chkUploadFile` 등 14건 + `tx_fn_Delete`·`tx_fn_RetrRequest`·`tx_fn_DownloadFile` 3건 — 호출자 정합용 as-is 별칭이라 정의·호출부 모두 개명하지 않음.
- **jQuery 3건**: `$(".form_search").on(...)`·`$(".chkNumber").on(...)`(init_pageBody 이벤트 바인딩)·`$('[type=file]')`(fn_chkUploadFile) — 규칙 19(원시 jQuery→컴포넌트) 재설계 대상으로 범위 제외.
- **`== null`/`!= null` 관용구**: null·undefined 동시 판별 관용구라 엄격화하지 않음(중복 호출식 캐싱으로 16→12건 자연 감소, 전환 0).
- **`ev:ondataload` 배선·body 마크업·publicInfo**: 무변경.
- **`'__self.value'` 문자열 리터럴 2건**(rd_skilBzTpCd_onclick·rd_extnApplYn_onclick): 변수가 아닌 **문자열 인자**로 전달되는 as-is 변환 산출물 — 로직 동등 유지 원칙에 따라 문자열 그대로 보존(해당 JSDoc 에 명기). 변수 `__self` 자체는 전부 `srcElem` 으로 개명.
- **유지되는 `__` 토큰(지역변수 아님)**: `__krxFileControl`(외부 전역 헬퍼 참조), `__sdd_rec`(팝업 회신 레코드 마커 프로퍼티), `"__rb0"`/`"__rb1"`(body 컴포넌트 id 문자열).
- **converter 산출 특이 코드**: `leadcomList[$];`·`status.index;`(setLeadcomVars/setSpecyValuInsts 의 무효 표현식), 빈 if 블록(checkForm), `(corpRegNo + 0) === 0` 등 — 동작 변경 금지 원칙으로 그대로 유지.
- **`fn_DownloadFile(01, …)` 8진 표기 리터럴**(01/02): as-is 인자 그대로 유지.

## 4. 검토 체크리스트

- [x] 전 함수 표준 JSDoc(@description 완비, placeholder 0) — 87개
- [x] const 기본(재할당만 let)·var 0
- [x] __ 접두 지역변수 0 (선언 62건 전부 개명, `let|const|var __` 잔존 0)
- [x] 200자 초과 라인 0 (44건 분해)
- [x] onpageload 2구역 최상단 단일 정의 + init_* 순번 주석
- [x] 로직 동등(동작 변경 없음) — 문자열 리터럴·$c 호출 대사(캐싱 축약분만 감소), 단락 평가 순서 보존
- [x] node --check 통과, XML well-formed, wsxml_lint(WS111·112·113 제외) 0 오류·0 경고
- [x] `@author`/`@date` 0건, publicInfo·body 마크업 무변경
