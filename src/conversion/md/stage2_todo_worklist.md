# Stage 2 잔여 TODO 워크리스트 (conversion ui-tobe)

> W-Craft 변환 Stage 2에서 **기계가 안전하게 확정할 수 없어 보류**한 항목 목록이다. 대부분 화면 실행(런타임)·업무 로직 판단·서버 API 스펙 확정이 필요하다. 코드 내 `// TODO Stage2:` / `// TO-DO` 주석과 1:1 대응한다. 변환본은 `src/conversion/next-krx-lds-{fil,mgt,stf,tms}-front/ui-tobe/` 에 있다.

자동 생성 문서(`python src/conversion/tools/gen_stage2_worklist.py`, 최종 집계 2026-09-03) — 항목 해결 시 코드의 주석을 제거하고 본 도구로 재집계할 것.

## 요약

| 모듈 | 항목 수 |
| --- | ---: |
| fil | 13 |
| mgt | 307 |
| stf | 105 |
| tms | 5 |
| **합계** | **430** |

| 유형 | 항목 수 | 해결 방법 |
| --- | ---: | --- |
| 응답 처리(구 submitDoneHandler) | 331 | 순차 스타일 `await executeDynamic` 직후의 응답(sbmRtn) 처리 로직을 업무에 맞게 작성. 처리 불필요 시 주석 제거. |
| 0-based 인덱스 검토 | 24 | Gauce 1-based → WebSquare 0-based. 비정형 루프는 토큰만 치환된 상태 — 화면 실행으로 행 접근 어긋남 확인 후 `-1`/`+1` 조정. |
| $c.frame 프레임 재설계(형제/절대) | 21 | `../frame_head`·`/top` 등 형제/절대 프레임 접근은 대응 공통함수 없음. 프레임 구조 확정 후 재설계(부모는 `$c.win.getParent()` 전환 완료). |
| Gauce 통신 재설계(DataID/KeyValue/Post) | 9 | trs `KeyValue`/`Post`/`SetDataHeader` 잔존 — 서버 API 확정 후 `executeDynamic` 으로 재설계(규칙 12/16). |
| 그리드 포커스 전환(구 Rowposition) | 8 | 구 `ds.Rowposition = v` 쓰기 — 대상 그리드 특정 후 `setFocusedCell(row, col)` 로 재작성(유일 바인딩은 자동 전환 완료). |
| 필터 재설계(setColumnFilter) | 5 | Gauce `Filter()`/onfilter 콜백 로직을 `setColumnFilter({type:"row",...})`/`removeColumnFilterAll()` 로 재구현. |
| 조회 파라미터/세션 API 확정 | 6 | 조회 파라미터·세션 사용자 정보 취득 API 확정 시 반영. |
| 팝업 파라미터/결과 처리 보강 | 23 | openPopup 전환 화면의 data 파라미터 채움·result/arg 수신 후 업무 로직 작성. |
| 기타(개발필요) | 3 | 개별 확인 필요(원본 미구현 스텁 등). |

### 추가 점검 유형 (코드에 `// TODO Stage2:` 주석을 남기면 다음 집계에 포함)

| 유형 | 해결 방법 |
| --- | --- |
| browserPopup 부모 접근 | browserPopup 화면의 `window.opener.*`·부모 scwin 호출을 `$c.win.getOpenerScope()`/`callOpener()` 로 재작성(`getParent()` 불가). 가이드: `src/docs/popup-opener-guide.md` |
| 목록↔상세 복귀 상태 복원 | 목록→상세 moveUrl/setPageFrameSrc 화면에 `{isHistory:true, dataInfo}` 스냅샷 + 상세 [목록] 버튼 `{restoreData:true}` 적용, 목록 onpageload 에 `_isHistoryRestore` 자동조회 skip 관례 적용. 가이드: `src/docs/frame-history-guide.md` |
| 페이징 전체보기/역순 순번 대체 | AS-IS 자체 구현(전체보기 토글·내림차순 순번 계산)을 `$c.sbm.setPagingInfo` 옵션(`maxRowNum:"all"`, `rowNumVisble:"{grid}|desc"`, `rowNumColumn`)으로 대체 |

## 응답 처리(구 submitDoneHandler)  (331)

순차 스타일 `await executeDynamic` 직후의 응답(sbmRtn) 처리 로직을 업무에 맞게 작성. 처리 불필요 시 주석 제거.

| 파일 | 라인 |
| --- | --- |
| `[fil] dis/account/JLDFIL00356.xml` | 83, 127 |
| `[fil] dis/account/JLDFIL00357.xml` | 84 |
| `[fil] dis/register/JLDFIL40300.xml` | 68 |
| `[fil] inf/srch/ULDINF91200.xml` | 119 |
| `[fil] inf/srch/ULDINF91300.xml` | 92 |
| `[fil] inf/srch/ULDINF91400.xml` | 106 |
| `[fil] inf/srch/ULDINF91500.xml` | 104 |
| `[fil] inf/srch/ULDINF91600.xml` | 104 |
| `[mgt] common/ULDCOM00008.xml` | 276 |
| `[mgt] mgt/ULDMGT10000.xml` | 164, 180, 196, 207, 218, 229, 245, 316, 350, 467, 478, 489 |
| `[mgt] mgt/ULDMGT10102.xml` | 72, 86, 101, 112 |
| `[mgt] mgt/ULDMGT10103.xml` | 72, 86, 101 |
| `[mgt] mgt/ULDMGT10104.xml` | 71, 82, 93, 110, 125, 136, 147, 160 |
| `[mgt] mgt/ULDMGT10105.xml` | 72, 87 |
| `[mgt] mgt/ULDMGT10106.xml` | 73, 93 |
| `[mgt] mgt/ULDMGT10108.xml` | 32, 44, 55, 85, 99, 168, 183, 294, 305, 316, 327, 338 |
| `[mgt] mgt/ULDMGT10110.xml` | 34, 48, 59, 70, 139, 154, 231, 242, 253, 264, 275, 286, 297, 308, 319, 330, 341, 352, 363, 374 |
| `[mgt] mgt/ULDMGT10200.xml` | 129, 143, 164, 190, 208, 219, 230 |
| `[mgt] mgt/ULDMGT10201.xml` | 33, 102, 117, 193 |
| `[mgt] mgt/ULDMGT10203.xml` | 96, 110, 125, 136 |
| `[mgt] mgt/ULDMGT10301.xml` | 86, 97, 108, 135, 155, 166, 177, 188 |
| `[mgt] mgt/ULDMGT10302.xml` | 131, 145, 159, 174, 185, 196 |
| `[mgt] mgt/ULDMGT10303.xml` | 66, 83 |
| `[mgt] mgt/ULDMGT10304.xml` | 66, 83 |
| `[mgt] mgt/ULDMGT10700.xml` | 71, 86 |
| `[mgt] mgt/ULDMGT10800.xml` | 71, 85, 100, 111 |
| `[mgt] mgt/ULDMGT30300.xml` | 108, 126, 137, 178, 189, 200 |
| `[mgt] mgt/ULDMGT30301.xml` | 194, 243, 266, 311, 326 |
| `[mgt] mgt/ULDMGT30309.xml` | 163, 175, 193 |
| `[mgt] mgt/ULDMGT40002.xml` | 247, 261, 275, 289, 305, 320, 478, 489, 500 |
| `[mgt] mgt/ULDMGT40004.xml` | 73, 88 |
| `[mgt] mgt/ULDMGT40008.xml` | 315, 332, 346, 360, 374, 388, 402, 419, 695, 706, 717, 728, 739 |
| `[mgt] mgt/ULDMGT40020.xml` | 276, 287, 301, 312, 323, 334, 345, 360, 374 |
| `[mgt] mgt/ULDMGT40220.xml` | 247, 261, 275, 289, 305, 320, 478, 489, 500 |
| `[mgt] mgt/ULDMGT40221.xml` | 39, 54 |
| `[mgt] mgt/ULDMGT41000.xml` | 66 |
| `[mgt] mgt/ULDMGT42030.xml` | 105, 148, 196, 302, 316, 330, 344 |
| `[mgt] mgt/ULDMGT42040.xml` | 135, 149, 183 |
| `[mgt] mgt/ULDMGT42045.xml` | 230, 259, 274, 289, 304, 315, 456, 494 |
| `[mgt] mgt/ULDMGT50002.xml` | 132 |
| `[mgt] mgt/ULDMGT80000.xml` | 74, 91 |
| `[mgt] mgt/ULDMGT80203.xml` | 75, 86, 100, 115, 126, 137 |
| `[mgt] mgt/ULDMGT80204.xml` | 86, 97, 108, 119, 134, 154, 165, 176, 187, 198 |
| `[mgt] mgt/ULDMGT80205.xml` | 85, 121, 132 |
| `[mgt] mgt/ULDMGT80206.xml` | 73, 88 |
| `[mgt] mgt/ULDMGT80208.xml` | 88, 108, 123, 134 |
| `[mgt] mgt/ULDMGT80209.xml` | 88, 108, 123, 134 |
| `[mgt] mgt/ULDMGT80220.xml` | 123, 276 |
| `[mgt] mgt/ULDMGT80235.xml` | 168, 182 |
| `[mgt] mgt/ULDMGT80300.xml` | 73, 174 |
| `[mgt] mgt/ULDMGT80301.xml` | 96, 109, 120, 131, 146 |
| `[mgt] mgt/ULDMGT80400.xml` | 74, 89 |
| `[mgt] mgt/ULDMGT80500.xml` | 125, 139, 172, 183 |
| `[mgt] mgt/ULDMGT80600.xml` | 111, 131 |
| `[mgt] mgt/ULDMGT80700.xml` | 73, 174 |
| `[mgt] mgt/ULDMGT95000.xml` | 328, 342, 361, 387, 413, 431, 488, 523, 563, 675, 686 |
| `[mgt] mgt/ULDMGT95010.xml` | 132 |
| `[mgt] mgt/ULDMGT95030.xml` | 272, 286, 300, 314, 328, 346, 361 |
| `[stf] common/ULDCOM00008.xml` | 276 |
| `[stf] common/ULDINS90400.xml` | 164 |
| `[stf] common/ULDINS90600.xml` | 132 |
| `[stf] common/ULDINS91200.xml` | 398, 433, 453 |
| `[stf] dis/bizspt/ULDSTF30304.xml` | 338 |
| `[stf] dis/bizspt/ULDSTF30305.xml` | 515, 608, 692, 726, 749, 767 |
| `[stf] dis/dsclsrch/ULDSTF15000.xml` | 984, 997, 1009, 1191, 1225, 1286 |
| `[stf] etc/ULDINS20000.xml` | 309, 403 |
| `[stf] etc/ULDINS21340.xml` | 141, 179 |
| `[stf] ins/common/ULDINS90000.xml` | 146 |
| `[stf] listingcommon/ULDSTF92009.xml` | 139 |
| `[stf] lst/fis/ULDFIS00206.xml` | 87, 104, 121, 203 |
| `[stf] lst/fis/ULDFIS00220.xml` | 85, 103 |
| `[stf] lst/fis/ULDFIS00221.xml` | 85, 103 |
| `[stf] lst/fis/ULDFIS00500.xml` | 313 |
| `[stf] lst/lstinvstg/ULDSTF07400.xml` | 428 |
| `[stf] lst/lstinvstg/ULDSTF07401.xml` | 107, 143, 169, 539, 560, 578, 597, 609, 627, 845, 856, 966, 1041, 1056 |
| `[stf] lst/lstinvstg/ULDSTF07403.xml` | 363, 384 |
| `[stf] lst/lstinvstg/ULDSTF07404.xml` | 61, 73, 88, 127, 139, 150 |
| `[stf] lst/lstinvstg/ULDSTF07405.xml` | 62, 82, 114, 128, 226, 240 |
| `[stf] lst/lstinvstg/ULDSTF07406.xml` | 72 |
| `[stf] lst/lstinvstg/ULDSTF07407.xml` | 165 |
| `[stf] lstproc/ULDSTF05234.xml` | 200, 232, 254 |
| `[tms] common/ULDCOM00007.xml` | 300 |
| `[tms] common/ULDCOM00008.xml` | 276 |

## 0-based 인덱스 검토  (24)

Gauce 1-based → WebSquare 0-based. 비정형 루프는 토큰만 치환된 상태 — 화면 실행으로 행 접근 어긋남 확인 후 `-1`/`+1` 조정.

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT10200.xml` | 107 |
| `[mgt] mgt/ULDMGT30309.xml` | 112, 230, 251, 319 |
| `[mgt] mgt/ULDMGT40002.xml` | 452 |
| `[mgt] mgt/ULDMGT40008.xml` | 462, 507 |
| `[mgt] mgt/ULDMGT40220.xml` | 452 |
| `[mgt] mgt/ULDMGT42030.xml` | 375 |
| `[mgt] mgt/ULDMGT80220.xml` | 53, 135, 172 |
| `[mgt] mgt/ULDMGT95030.xml` | 452, 463 |
| `[stf] common/ULDINS91200.xml` | 494 |
| `[stf] dis/dsclsrch/ULDSTF15000.xml` | 323, 911, 1384 |
| `[stf] etc/ULDINS20000.xml` | 437, 521, 590 |
| `[stf] etc/ULDINS21340.xml` | 218 |
| `[stf] listingcommon/ULDSTF92009.xml` | 73 |

## $c.frame 프레임 재설계(형제/절대)  (21)

`../frame_head`·`/top` 등 형제/절대 프레임 접근은 대응 공통함수 없음. 프레임 구조 확정 후 재설계(부모는 `$c.win.getParent()` 전환 완료).

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT40008.xml` | 429 |
| `[mgt] mgt/ULDMGT95030.xml` | 31 |
| `[stf] dis/bizspt/ULDSTF30341.xml` | 74 |
| `[stf] dis/dsclinfo/ULDSTF30402.xml` | 175 |
| `[stf] dis/dsclsrch/ULDSTF15000.xml` | 612, 627, 639 |
| `[stf] dis/issueinfo/ULDSTF30700.xml` | 287, 303 |
| `[stf] dis/issueinfo/ULDSTF30702.xml` | 248 |
| `[stf] listingcommon/ULDSTF92009.xml` | 27 |
| `[stf] lst/fis/ULDFIS00200.xml` | 39 |
| `[stf] lst/fis/ULDFIS00206.xml` | 152, 155 |
| `[stf] lst/fis/ULDFIS00220.xml` | 116, 134, 137 |
| `[stf] lst/fis/ULDFIS00221.xml` | 116, 134, 137 |
| `[stf] lst/fis/ULDFIS00400.xml` | 38 |

## Gauce 통신 재설계(DataID/KeyValue/Post)  (9)

trs `KeyValue`/`Post`/`SetDataHeader` 잔존 — 서버 API 확정 후 `executeDynamic` 으로 재설계(규칙 12/16).

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT30309.xml` | 213 |
| `[mgt] mgt/ULDMGT42045.xml` | 332, 335, 362, 367 |
| `[mgt] mgt/ULDMGT80300.xml` | 85 |
| `[mgt] mgt/ULDMGT80700.xml` | 85 |
| `[stf] lst/lstinvstg/ULDSTF07404.xml` | 77, 179 |

## 그리드 포커스 전환(구 Rowposition)  (8)

구 `ds.Rowposition = v` 쓰기 — 대상 그리드 특정 후 `setFocusedCell(row, col)` 로 재작성(유일 바인딩은 자동 전환 완료).

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT10108.xml` | 231, 232 |
| `[mgt] mgt/ULDMGT10110.xml` | 202, 203 |
| `[mgt] mgt/ULDMGT10201.xml` | 165, 166 |
| `[mgt] mgt/ULDMGT40008.xml` | 649, 650 |

## 필터 재설계(setColumnFilter)  (5)

Gauce `Filter()`/onfilter 콜백 로직을 `setColumnFilter({type:"row",...})`/`removeColumnFilterAll()` 로 재구현.

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT10200.xml` | 97 |
| `[mgt] mgt/ULDMGT40008.xml` | 559, 590, 619 |
| `[mgt] mgt/ULDMGT42045.xml` | 428 |

## 조회 파라미터/세션 API 확정  (6)

조회 파라미터·세션 사용자 정보 취득 API 확정 시 반영.

| 파일 | 라인 |
| --- | --- |
| `[fil] inf/srch/ULDINF20000.xml` | 66 |
| `[mgt] common/ULDCOM00008.xml` | 256 |
| `[stf] common/ULDCOM00008.xml` | 256 |
| `[tms] common/ULDCOM00007.xml` | 41, 282 |
| `[tms] common/ULDCOM00008.xml` | 256 |

## 팝업 파라미터/결과 처리 보강  (23)

openPopup 전환 화면의 data 파라미터 채움·result/arg 수신 후 업무 로직 작성.

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT10108.xml` | 148, 152 |
| `[mgt] mgt/ULDMGT10110.xml` | 119, 123 |
| `[mgt] mgt/ULDMGT10201.xml` | 82, 86 |
| `[mgt] mgt/ULDMGT40002.xml` | 194, 198 |
| `[mgt] mgt/ULDMGT40220.xml` | 194, 198 |
| `[mgt] mgt/ULDMGT42030.xml` | 289, 366 |
| `[mgt] mgt/ULDMGT42040.xml` | 47, 84, 114 |
| `[mgt] mgt/ULDMGT95030.xml` | 407, 411 |
| `[stf] dis/bizspt/ULDSTF30304.xml` | 101, 319 |
| `[stf] lst/fis/ULDFIS00500.xml` | 294, 583 |
| `[stf] lstproc/ULDSTF05234.xml` | 179, 295 |

## 기타(개발필요)  (3)

개별 확인 필요(원본 미구현 스텁 등).

| 파일 | 라인 |
| --- | --- |
| `[fil] lst/lstinvstg/ULDFIL54000.xml` | 87, 175, 192 |
