# Stage 2 잔여 TODO 워크리스트 (conversion ui-tobe)

> W-Craft 변환 Stage 2에서 **기계가 안전하게 확정할 수 없어 보류**한 항목 목록이다. 대부분 화면 실행(런타임)·업무 로직 판단·서버 API 스펙 확정이 필요하다. 코드 내 `// TODO Stage2:` / `// TO-DO` 주석과 1:1 대응한다. 변환본은 `src/conversion/next-krx-lds-{fil,mgt,stf,tms}-front/ui-tobe/` 에 있다.

자동 생성 문서(`python src/conversion/tools/gen_stage2_worklist.py`, 최종 집계 2026-09-03) — 항목 해결 시 코드의 주석을 제거하고 본 도구로 재집계할 것.

## 요약

| 모듈 | 항목 수 |
| --- | ---: |
| fil | 4 |
| mgt | 55 |
| stf | 37 |
| tms | 3 |
| **합계** | **99** |

| 유형 | 항목 수 | 해결 방법 |
| --- | ---: | --- |
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

## 0-based 인덱스 검토  (24)

Gauce 1-based → WebSquare 0-based. 비정형 루프는 토큰만 치환된 상태 — 화면 실행으로 행 접근 어긋남 확인 후 `-1`/`+1` 조정.

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT10200.xml` | 107 |
| `[mgt] mgt/ULDMGT30309.xml` | 112, 228, 249, 317 |
| `[mgt] mgt/ULDMGT40002.xml` | 449 |
| `[mgt] mgt/ULDMGT40008.xml` | 460, 505 |
| `[mgt] mgt/ULDMGT40220.xml` | 449 |
| `[mgt] mgt/ULDMGT42030.xml` | 372 |
| `[mgt] mgt/ULDMGT80220.xml` | 53, 135, 172 |
| `[mgt] mgt/ULDMGT95030.xml` | 446, 457 |
| `[stf] common/ULDINS91200.xml` | 492 |
| `[stf] dis/dsclsrch/ULDSTF15000.xml` | 323, 911, 1383 |
| `[stf] etc/ULDINS20000.xml` | 436, 520, 589 |
| `[stf] etc/ULDINS21340.xml` | 217 |
| `[stf] listingcommon/ULDSTF92009.xml` | 73 |

## $c.frame 프레임 재설계(형제/절대)  (21)

`../frame_head`·`/top` 등 형제/절대 프레임 접근은 대응 공통함수 없음. 프레임 구조 확정 후 재설계(부모는 `$c.win.getParent()` 전환 완료).

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT40008.xml` | 427 |
| `[mgt] mgt/ULDMGT95030.xml` | 31 |
| `[stf] dis/bizspt/ULDSTF30341.xml` | 74 |
| `[stf] dis/dsclinfo/ULDSTF30402.xml` | 175 |
| `[stf] dis/dsclsrch/ULDSTF15000.xml` | 612, 627, 639 |
| `[stf] dis/issueinfo/ULDSTF30700.xml` | 287, 303 |
| `[stf] dis/issueinfo/ULDSTF30702.xml` | 248 |
| `[stf] listingcommon/ULDSTF92009.xml` | 27 |
| `[stf] lst/fis/ULDFIS00200.xml` | 39 |
| `[stf] lst/fis/ULDFIS00206.xml` | 150, 153 |
| `[stf] lst/fis/ULDFIS00220.xml` | 116, 134, 137 |
| `[stf] lst/fis/ULDFIS00221.xml` | 116, 134, 137 |
| `[stf] lst/fis/ULDFIS00400.xml` | 38 |

## Gauce 통신 재설계(DataID/KeyValue/Post)  (9)

trs `KeyValue`/`Post`/`SetDataHeader` 잔존 — 서버 API 확정 후 `executeDynamic` 으로 재설계(규칙 12/16).

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT30309.xml` | 211 |
| `[mgt] mgt/ULDMGT42045.xml` | 326, 329, 356, 361 |
| `[mgt] mgt/ULDMGT80300.xml` | 85 |
| `[mgt] mgt/ULDMGT80700.xml` | 85 |
| `[stf] lst/lstinvstg/ULDSTF07404.xml` | 75, 173 |

## 그리드 포커스 전환(구 Rowposition)  (8)

구 `ds.Rowposition = v` 쓰기 — 대상 그리드 특정 후 `setFocusedCell(row, col)` 로 재작성(유일 바인딩은 자동 전환 완료).

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT10108.xml` | 226, 227 |
| `[mgt] mgt/ULDMGT10110.xml` | 197, 198 |
| `[mgt] mgt/ULDMGT10201.xml` | 163, 164 |
| `[mgt] mgt/ULDMGT40008.xml` | 647, 648 |

## 필터 재설계(setColumnFilter)  (5)

Gauce `Filter()`/onfilter 콜백 로직을 `setColumnFilter({type:"row",...})`/`removeColumnFilterAll()` 로 재구현.

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT10200.xml` | 97 |
| `[mgt] mgt/ULDMGT40008.xml` | 557, 588, 617 |
| `[mgt] mgt/ULDMGT42045.xml` | 422 |

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
| `[mgt] mgt/ULDMGT10108.xml` | 145, 149 |
| `[mgt] mgt/ULDMGT10110.xml` | 116, 120 |
| `[mgt] mgt/ULDMGT10201.xml` | 82, 86 |
| `[mgt] mgt/ULDMGT40002.xml` | 194, 198 |
| `[mgt] mgt/ULDMGT40220.xml` | 194, 198 |
| `[mgt] mgt/ULDMGT42030.xml` | 286, 363 |
| `[mgt] mgt/ULDMGT42040.xml` | 47, 84, 114 |
| `[mgt] mgt/ULDMGT95030.xml` | 401, 405 |
| `[stf] dis/bizspt/ULDSTF30304.xml` | 101, 319 |
| `[stf] lst/fis/ULDFIS00500.xml` | 294, 582 |
| `[stf] lstproc/ULDSTF05234.xml` | 179, 294 |

## 기타(개발필요)  (3)

개별 확인 필요(원본 미구현 스텁 등).

| 파일 | 라인 |
| --- | --- |
| `[fil] lst/lstinvstg/ULDFIL54000.xml` | 87, 175, 192 |
