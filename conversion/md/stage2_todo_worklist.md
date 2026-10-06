# Stage 2 잔여 TODO 워크리스트 (conversion ui-tobe)

> W-Craft 변환 Stage 2에서 **기계가 안전하게 확정할 수 없어 보류**한 항목 목록이다. 대부분 화면 실행(런타임)·업무 로직 판단·서버 API 스펙 확정이 필요하다. 코드 내 `// TODO Stage2:` / `// TO-DO` 주석과 1:1 대응한다. 변환본은 `conversion/next-krx-lds-{fil,mgt,stf,tms}-front/ui-tobe/` 에 있다.

자동 생성 문서(`python conversion/tools/gen_stage2_worklist.py`, 최종 집계 2026-10-06) — 항목 해결 시 코드의 주석을 제거하고 본 도구로 재집계할 것.

## 요약

| 모듈 | 항목 수 |
| --- | ---: |
| fil | 3 |
| mgt | 7 |
| stf | 25 |
| tms | 0 |
| **합계** | **35** |

| 유형 | 항목 수 | 해결 방법 |
| --- | ---: | --- |
| $c.frame 프레임 재설계(형제/절대) | 19 | `../frame_head`·`/top` 등 형제/절대 프레임 접근은 대응 공통함수 없음. 프레임 구조 확정 후 재설계(부모는 `$c.win.getParent()` 전환 완료). |
| Gauce 통신 재설계(DataID/KeyValue/Post) | 9 | trs `KeyValue`/`Post`/`SetDataHeader` 잔존 — 서버 API 확정 후 `executeDynamic` 으로 재설계(규칙 12/16). |
| 팝업 파라미터/결과 처리 보강 | 4 | openPopup 전환 화면의 data 파라미터 채움·result/arg 수신 후 업무 로직 작성. |
| 기타(개발필요) | 3 | 개별 확인 필요(원본 미구현 스텁 등). |

### 추가 점검 유형 (코드에 `// TODO Stage2:` 주석을 남기면 다음 집계에 포함)

| 유형 | 해결 방법 |
| --- | --- |
| browserPopup 부모 접근 | browserPopup 화면의 `window.opener.*`·부모 scwin 호출을 `$c.win.getOpenerScope()`/`callOpener()` 로 재작성(`getParent()` 불가). 가이드: `cm/docs/popup-opener-guide.md` |
| 목록↔상세 복귀 상태 복원 | 목록→상세 moveUrl/setPageFrameSrc 화면에 `{isHistory:true, dataInfo}` 스냅샷 + 상세 [목록] 버튼 `{restoreData:true}` 적용, 목록 onpageload 에 `_isHistoryRestore` 자동조회 skip 관례 적용. 가이드: `cm/docs/frame-history-guide.md` |
| 페이징 전체보기/역순 순번 대체 | AS-IS 자체 구현(전체보기 토글·내림차순 순번 계산)을 `$c.sbm.setPagingInfo` 옵션(`maxRowNum:"all"`, `rowNumVisble:"{grid}|desc"`, `rowNumColumn`)으로 대체 |

## jsp-front (공급사 r13 산출 전환본) — 유형별 집계  (4543건 / 1201화면)

> 1,677화면 전량이라 파일별 행은 싣지 않는다. 화면별 수는 `python conversion/tools/jspfront_summary.py` 의 `--tsv`, 접두별 밀도와 기계 치환 불가 축(jQuery·`document.`·조건 래퍼·hidden 입력·lybox)은 `conversion/jsp-front/README.md`.

| 유형 | 건수 | 화면 | 해결 방법 |
| --- | ---: | ---: | --- |
| 부모 화면 스코프 없음(팝업·프레임) | 1154 | 114 | 팝업/프레임의 부모 접근 — `$c.win.getParent()`/`getOpenerScope()` 로 재작성(가이드 `cm/docs/popup-opener-guide.md`). |
| 미실현 동작(포커스·표시·라벨) | 843 | 245 | 대상 컴포넌트가 해석되지 않은 set_focus/set_visible/set_label — id 확정 후 `focus()`/`show()/hide()`/`setValue()`. |
| 공급사 전환 미완(bizMessage 드러냄) | 603 | 283 | 공급사가 사유 알림으로 드러낸 자리(제출 주소·이동 목적지·입력값 미해결) — 회신(A-3/A-15) 또는 화면별 판단. |
| 행 복사 대상 부재 | 671 | 671 | as-is 가 서버 렌더로 그리던 반복 행 — 응답 전문 확정 후 DataList 바인딩으로 재설계. |
| 컨텍스트 키 출처 미확인(A-3) | 516 | 516 | as-is EL 이 서버 렌더로 채우던 값 — 조회 전문/세션/상수 중 출처 회신 뒤 연결. |
| 공급사 pcc 의존($c.lc/$c.frame/미반입 $c.fil) | 137 | 52 | 저장소 pcc/fil 에 없는 함수 — 반입 또는 gcc 치환 판단(V24~V30 으로 `fn_isProcess`·`fn_alertMsg`·상수·`CreateDialogFrame`·`fn_getMktId`·`showObj` 등 치환 완료 · 남은 것은 `$c.frame.Provider("../../"|"/top")`·`CloseFrame`·`srcUrl`·`SetWindowPos2` 류 프레임 재설계). |
| fieldEl(DOM 요소 계약) | 39 | 32 | `$c.util.fieldEl` 호출 함수 몸통을 컴포넌트 getValue/setValue 계약으로 전환. |
| 세션 키 실환경 확인 | 57 | 57 | `$c.session.getUserInfo(키)` 의 키 집합을 실환경에서 확인(회신 11항). |
| 행 동작 대상/정의 미해결 | 383 | 313 | 그리드 행 클릭이 부르는 함수·목록 id 미해결 — 대상 확정 후 연결. |
| 공급사 중복 정의 | 13 | 13 | 같은 이름 함수의 앞 정의(`_1`, as-is 에서 뒤 정의에 덮여 호출되지 않던 본문) — 필요 없으면 삭제, 필요하면 호출부 연결. |
| 기타(개발필요) | 127 | 70 | 개별 확인 필요(원본 미구현 스텁 등). |

## $c.frame 프레임 재설계(형제/절대)  (19)

`../frame_head`·`/top` 등 형제/절대 프레임 접근은 대응 공통함수 없음. 프레임 구조 확정 후 재설계(부모는 `$c.win.getParent()` 전환 완료).

| 파일 | 라인 |
| --- | --- |
| `[stf] dis/bizspt/ULDSTF30341.xml` | 101 |
| `[stf] dis/dsclinfo/ULDSTF30402.xml` | 289 |
| `[stf] dis/dsclsrch/ULDSTF15000.xml` | 843, 866, 886 |
| `[stf] dis/issueinfo/ULDSTF30700.xml` | 452, 476 |
| `[stf] dis/issueinfo/ULDSTF30702.xml` | 378 |
| `[stf] listingcommon/ULDSTF92009.xml` | 25 |
| `[stf] lst/fis/ULDFIS00200.xml` | 46 |
| `[stf] lst/fis/ULDFIS00206.xml` | 213, 216 |
| `[stf] lst/fis/ULDFIS00220.xml` | 178, 206, 209 |
| `[stf] lst/fis/ULDFIS00221.xml` | 178, 206, 209 |
| `[stf] lst/fis/ULDFIS00400.xml` | 48 |

## Gauce 통신 재설계(DataID/KeyValue/Post)  (9)

trs `KeyValue`/`Post`/`SetDataHeader` 잔존 — 서버 API 확정 후 `executeDynamic` 으로 재설계(규칙 12/16).

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT30309.xml` | 347 |
| `[mgt] mgt/ULDMGT42045.xml` | 478, 481, 514, 519 |
| `[mgt] mgt/ULDMGT80300.xml` | 144 |
| `[mgt] mgt/ULDMGT80700.xml` | 144 |
| `[stf] lst/lstinvstg/ULDSTF07404.xml` | 81, 228 |

## 팝업 파라미터/결과 처리 보강  (4)

openPopup 전환 화면의 data 파라미터 채움·result/arg 수신 후 업무 로직 작성.

| 파일 | 라인 |
| --- | --- |
| `[stf] lst/fis/ULDFIS00500.xml` | 376, 729 |
| `[stf] lstproc/ULDSTF05234.xml` | 329, 487 |

## 기타(개발필요)  (3)

개별 확인 필요(원본 미구현 스텁 등).

| 파일 | 라인 |
| --- | --- |
| `[fil] lst/lstinvstg/ULDFIL54000.xml` | 103, 223, 249 |
