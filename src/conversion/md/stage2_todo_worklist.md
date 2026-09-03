# Stage 2 잔여 TODO 워크리스트 (conversion ui-tobe)

> W-Craft 변환 Stage 2에서 **기계가 안전하게 확정할 수 없어 보류**한 항목 목록이다. 대부분 화면 실행(런타임)·업무 로직 판단·서버 API 스펙 확정이 필요하다. 코드 내 `// TODO Stage2:` / `// TO-DO` 주석과 1:1 대응한다. 변환본은 `src/conversion/next-krx-lds-{fil,mgt,stf,tms}-front/ui-tobe/` 에 있다.

자동 생성 문서(`python src/conversion/tools/gen_stage2_worklist.py`, 최종 집계 2026-09-03) — 항목 해결 시 코드의 주석을 제거하고 본 도구로 재집계할 것.

## 요약

| 모듈 | 항목 수 |
| --- | ---: |
| fil | 3 |
| mgt | 14 |
| stf | 25 |
| tms | 0 |
| **합계** | **42** |

| 유형 | 항목 수 | 해결 방법 |
| --- | ---: | --- |
| $c.frame 프레임 재설계(형제/절대) | 21 | `../frame_head`·`/top` 등 형제/절대 프레임 접근은 대응 공통함수 없음. 프레임 구조 확정 후 재설계(부모는 `$c.win.getParent()` 전환 완료). |
| Gauce 통신 재설계(DataID/KeyValue/Post) | 9 | trs `KeyValue`/`Post`/`SetDataHeader` 잔존 — 서버 API 확정 후 `executeDynamic` 으로 재설계(규칙 12/16). |
| 필터 재설계(setColumnFilter) | 5 | Gauce `Filter()`/onfilter 콜백 로직을 `setColumnFilter({type:"row",...})`/`removeColumnFilterAll()` 로 재구현. |
| 팝업 파라미터/결과 처리 보강 | 4 | openPopup 전환 화면의 data 파라미터 채움·result/arg 수신 후 업무 로직 작성. |
| 기타(개발필요) | 3 | 개별 확인 필요(원본 미구현 스텁 등). |

### 추가 점검 유형 (코드에 `// TODO Stage2:` 주석을 남기면 다음 집계에 포함)

| 유형 | 해결 방법 |
| --- | --- |
| browserPopup 부모 접근 | browserPopup 화면의 `window.opener.*`·부모 scwin 호출을 `$c.win.getOpenerScope()`/`callOpener()` 로 재작성(`getParent()` 불가). 가이드: `src/docs/popup-opener-guide.md` |
| 목록↔상세 복귀 상태 복원 | 목록→상세 moveUrl/setPageFrameSrc 화면에 `{isHistory:true, dataInfo}` 스냅샷 + 상세 [목록] 버튼 `{restoreData:true}` 적용, 목록 onpageload 에 `_isHistoryRestore` 자동조회 skip 관례 적용. 가이드: `src/docs/frame-history-guide.md` |
| 페이징 전체보기/역순 순번 대체 | AS-IS 자체 구현(전체보기 토글·내림차순 순번 계산)을 `$c.sbm.setPagingInfo` 옵션(`maxRowNum:"all"`, `rowNumVisble:"{grid}|desc"`, `rowNumColumn`)으로 대체 |

## $c.frame 프레임 재설계(형제/절대)  (21)

`../frame_head`·`/top` 등 형제/절대 프레임 접근은 대응 공통함수 없음. 프레임 구조 확정 후 재설계(부모는 `$c.win.getParent()` 전환 완료).

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT40008.xml` | 427 |
| `[mgt] mgt/ULDMGT95030.xml` | 31 |
| `[stf] dis/bizspt/ULDSTF30341.xml` | 74 |
| `[stf] dis/dsclinfo/ULDSTF30402.xml` | 175 |
| `[stf] dis/dsclsrch/ULDSTF15000.xml` | 611, 626, 638 |
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
| `[mgt] mgt/ULDMGT30309.xml` | 210 |
| `[mgt] mgt/ULDMGT42045.xml` | 326, 329, 356, 361 |
| `[mgt] mgt/ULDMGT80300.xml` | 85 |
| `[mgt] mgt/ULDMGT80700.xml` | 85 |
| `[stf] lst/lstinvstg/ULDSTF07404.xml` | 75, 173 |

## 필터 재설계(setColumnFilter)  (5)

Gauce `Filter()`/onfilter 콜백 로직을 `setColumnFilter({type:"row",...})`/`removeColumnFilterAll()` 로 재구현.

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT10200.xml` | 97 |
| `[mgt] mgt/ULDMGT40008.xml` | 555, 586, 615 |
| `[mgt] mgt/ULDMGT42045.xml` | 422 |

## 팝업 파라미터/결과 처리 보강  (4)

openPopup 전환 화면의 data 파라미터 채움·result/arg 수신 후 업무 로직 작성.

| 파일 | 라인 |
| --- | --- |
| `[stf] lst/fis/ULDFIS00500.xml` | 294, 582 |
| `[stf] lstproc/ULDSTF05234.xml` | 179, 294 |

## 기타(개발필요)  (3)

개별 확인 필요(원본 미구현 스텁 등).

| 파일 | 라인 |
| --- | --- |
| `[fil] lst/lstinvstg/ULDFIL54000.xml` | 87, 175, 192 |
