# Stage 2 잔여 TODO 워크리스트 (conversion ui-tobe)

> W-Craft 변환 Stage 2에서 **기계가 안전하게 확정할 수 없어 보류**한 항목 목록이다. 대부분 화면 실행(런타임) 또는 업무 로직 판단이 필요하다. 코드 내 `// TODO Stage2:` / `// TO-DO :` 주석과 1:1 대응한다. 변환본은 `src/conversion/next-krx-lds-{mgt,stf,tms}-front/ui-tobe/` 에 있다.

자동 생성 문서 — 항목 해결 시 해당 주석을 코드에서 제거하고 이 표도 갱신할 것.

## 요약

| 모듈 | 항목 수 |
| --- | ---: |
| mgt | 137 |
| stf | 115 |
| tms | 24 |
| **합계** | **276** |

| 유형 | 항목 수 | 해결 방법 |
| --- | ---: | --- |
| 0-based 인덱스 검토 | 132 | Gauce는 1-based, WebSquare는 0-based. 토큰만 치환하고 인덱스 산술은 유지한 상태. 화면을 띄워 그리드 행 접근이 한 칸 어긋나는지 확인 후 필요시 `-1`/`+1` 조정. |
| submitdone 핸들러 미정의 | 39 | executeDynamic의 submitDoneHandler가 가리키는 함수가 정의돼 있지 않음(원본 노드에 submitdone 없거나 죽은 노드). 응답 처리 로직을 작성하거나, 콜백이 불필요하면 옵션에서 제거. |
| 팝업 data/callback 보강 | 38 | CreateDialogFrame→openPopup 변환 후 data 파라미터 채움과 result 콜백 처리 로직을 업무에 맞게 작성. |
| 필터 재구현(setColumnFilter) | 16 | Gauce `.Filter/.UseFilter`(onfilter 콜백 기반)를 주석 처리해 둠. WebSquare `setColumnFilter({type:"row",...})`/`removeColumnFilterAll()`로 재구현. |
| ValueOfIndex/getLabel 검토 | 14 | `.ValueOfIndex`/`.bindColVal`/`ColumnProp`/`NameMax` 등을 `getValue()`/`getLabel()`로 매핑했으나 바인드컬럼·헤더 가공 의미 확인 필요. |
| RowPosition 세터 검토 | 10 | `ds.RowPosition = v`(쓰기)는 직접 대응이 없어 주석+TODO 처리. 대상 그리드의 `setFocusedCell(row, colId)`로 재작성. |
| trs/action 보강 | 9 | Gauce trs `Action/KeyValue/Post`→executeDynamic 변환에서 action URL·ref(KeyValue 입력 매핑) 검증 필요. |
| 규칙4 최상위 실행문 위치 | 5 | 함수 사이/뒤의 최상위 실행문을 안전 판단 못해 그대로 둠. init/onpageload로 옮길지 실행순서 확인. |
| 미정의 참조 | 2 | 삭제용 데이터셋 등 정의되지 않은 객체 참조. 정의 추가 또는 로직 정리. |
| timeout 옵션 | 1 | 정적 submission 노드 삭제 시 사라진 timeout 설정을 executeDynamic 옵션으로 옮길지 확인. |
| fn_ 정규화 충돌 | 1 | `fn_*` 함수명 정규화 시 이름 충돌로 보류. 수동 리네임. |
| 기타 | 9 | 개별 확인 필요. |

## 0-based 인덱스 검토  (132)

Gauce는 1-based, WebSquare는 0-based. 토큰만 치환하고 인덱스 산술은 유지한 상태. 화면을 띄워 그리드 행 접근이 한 칸 어긋나는지 확인 후 필요시 `-1`/`+1` 조정.

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT10000.xml` | 113, 237, 247, 253, 261, 304, 327, 357, 367 |
| `[mgt] mgt/ULDMGT10106.xml` | 79 |
| `[mgt] mgt/ULDMGT10108.xml` | 208, 232, 242, 398 |
| `[mgt] mgt/ULDMGT10110.xml` | 220 |
| `[mgt] mgt/ULDMGT10200.xml` | 76, 100 |
| `[mgt] mgt/ULDMGT10201.xml` | 144, 168, 178, 264 |
| `[mgt] mgt/ULDMGT10203.xml` | 57 |
| `[mgt] mgt/ULDMGT10301.xml` | 143 |
| `[mgt] mgt/ULDMGT10302.xml` | 84 |
| `[mgt] mgt/ULDMGT30309.xml` | 282 |
| `[mgt] mgt/ULDMGT40002.xml` | 261, 302, 313, 320, 324, 349, 386 |
| `[mgt] mgt/ULDMGT40008.xml` | 363, 385, 429, 447, 462, 494, 513, 532, 543 |
| `[mgt] mgt/ULDMGT40220.xml` | 261, 302, 313, 320, 324, 349, 386 |
| `[mgt] mgt/ULDMGT42030.xml` | 292 |
| `[mgt] mgt/ULDMGT42040.xml` | 109 |
| `[mgt] mgt/ULDMGT42045.xml` | 228, 364 |
| `[mgt] mgt/ULDMGT80204.xml` | 140 |
| `[mgt] mgt/ULDMGT80205.xml` | 102 |
| `[mgt] mgt/ULDMGT80220.xml` | 56, 144 |
| `[mgt] mgt/ULDMGT95000.xml` | 531, 541, 564 |
| `[stf] common/ULDCOM00008.xml` | 66, 73, 88, 95, 109, 421 |
| `[stf] etc/ULDINS21340.xml` | 322 |
| `[stf] listingcommon/ULDSTF92009.xml` | 77 |
| `[stf] lst/fis/ULDFIS00206.xml` | 209, 211 |
| `[stf] lst/fis/ULDFIS00500.xml` | 347 |
| `[stf] lst/lstinvstg/ULDSTF07400.xml` | 239, 409, 445 |
| `[stf] lst/lstinvstg/ULDSTF07401.xml` | 129, 156, 175, 321, 337, 370, 502, 514, 523, 661, 665, 671, 707, 733, 761, 775, 802, 870, 876, 883, 911, 932, 956, 959 |
| `[stf] lst/lstinvstg/ULDSTF07403.xml` | 249, 252, 255 |
| `[stf] lst/lstinvstg/ULDSTF07404.xml` | 207, 253, 282, 290, 317, 326, 396, 419, 535, 548 |
| `[stf] lst/lstinvstg/ULDSTF07405.xml` | 71, 93, 144, 171, 173, 179, 253, 256, 283, 298, 328 |
| `[tms] common/ULDCOM00007.xml` | 114, 145, 164, 399, 422, 455, 494 |
| `[tms] common/ULDCOM00008.xml` | 70, 93, 126, 432 |

## submitdone 핸들러 미정의  (39)

executeDynamic의 submitDoneHandler가 가리키는 함수가 정의돼 있지 않음(원본 노드에 submitdone 없거나 죽은 노드). 응답 처리 로직을 작성하거나, 콜백이 불필요하면 옵션에서 제거.

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT30301.xml` | 146, 289 |
| `[mgt] mgt/ULDMGT40002.xml` | 176, 420 |
| `[mgt] mgt/ULDMGT40008.xml` | 235 |
| `[mgt] mgt/ULDMGT40220.xml` | 176, 420 |
| `[mgt] mgt/ULDMGT40221.xml` | 38, 53 |
| `[mgt] mgt/ULDMGT42040.xml` | 135, 171 |
| `[mgt] mgt/ULDMGT42045.xml` | 178, 285, 317, 371, 384, 430, 472 |
| `[mgt] mgt/ULDMGT80203.xml` | 63, 76, 107, 120 |
| `[mgt] mgt/ULDMGT95030.xml` | 220, 236, 252, 268 |
| `[stf] common/ULDCOM00008.xml` | 44, 132, 395, 407 |
| `[stf] dis/bizspt/ULDSTF30341.xml` | 110 |
| `[stf] listingcommon/ULDSTF92009.xml` | 126 |
| `[stf] lst/fis/ULDFIS00206.xml` | 122, 140, 158 |
| `[stf] lst/fis/ULDFIS00500.xml` | 398 |
| `[stf] lst/lstinvstg/ULDSTF07400.xml` | 377 |
| `[tms] common/ULDCOM00007.xml` | 90, 481 |

## 팝업 data/callback 보강  (38)

CreateDialogFrame→openPopup 변환 후 data 파라미터 채움과 result 콜백 처리 로직을 업무에 맞게 작성.

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT10000.xml` | 381 |
| `[mgt] mgt/ULDMGT10108.xml` | 166, 170 |
| `[mgt] mgt/ULDMGT10110.xml` | 138, 142 |
| `[mgt] mgt/ULDMGT10201.xml` | 102, 106 |
| `[mgt] mgt/ULDMGT40002.xml` | 146, 150 |
| `[mgt] mgt/ULDMGT40220.xml` | 146, 150 |
| `[mgt] mgt/ULDMGT42030.xml` | 283, 334 |
| `[mgt] mgt/ULDMGT42040.xml` | 59, 89, 190 |
| `[mgt] mgt/ULDMGT80235.xml` | 252, 270 |
| `[mgt] mgt/ULDMGT95030.xml` | 360, 364 |
| `[stf] dis/bizspt/ULDSTF30304.xml` | 108, 332 |
| `[stf] dis/dsclinfo/ULDSTF30402.xml` | 125, 139, 143 |
| `[stf] dis/issueinfo/ULDSTF30700.xml` | 213, 230, 235 |
| `[stf] dis/issueinfo/ULDSTF30702.xml` | 198 |
| `[stf] lst/fis/ULDFIS00101.xml` | 212 |
| `[stf] lst/fis/ULDFIS00500.xml` | 504, 584 |
| `[stf] lst/lstinvstg/ULDSTF07400.xml` | 393 |
| `[stf] lst/lstinvstg/ULDSTF07403.xml` | 140 |
| `[stf] lst/lstinvstg/ULDSTF07407.xml` | 92, 190 |
| `[stf] lstproc/ULDSTF05234.xml` | 244, 303 |

## 필터 재구현(setColumnFilter)  (16)

Gauce `.Filter/.UseFilter`(onfilter 콜백 기반)를 주석 처리해 둠. WebSquare `setColumnFilter({type:"row",...})`/`removeColumnFilterAll()`로 재구현.

| 파일 | 라인 |
| --- | --- |
| `[mgt] common/ULDCOM00008.xml` | 66, 111, 423 |
| `[mgt] mgt/ULDMGT10200.xml` | 70, 95, 238 |
| `[mgt] mgt/ULDMGT40008.xml` | 465, 473, 496, 515 |
| `[mgt] mgt/ULDMGT42045.xml` | 398 |
| `[stf] common/ULDCOM00008.xml` | 61, 106 |
| `[tms] common/ULDCOM00007.xml` | 394 |
| `[tms] common/ULDCOM00008.xml` | 65, 112 |

## ValueOfIndex/getLabel 검토  (14)

`.ValueOfIndex`/`.bindColVal`/`ColumnProp`/`NameMax` 등을 `getValue()`/`getLabel()`로 매핑했으나 바인드컬럼·헤더 가공 의미 확인 필요.

| 파일 | 라인 |
| --- | --- |
| `[stf] lst/lstinvstg/ULDSTF07401.xml` | 160, 179, 264, 1146, 1171 |
| `[stf] lst/lstinvstg/ULDSTF07405.xml` | 99, 241, 243, 245, 250, 258, 262 |
| `[tms] common/ULDCOM00007.xml` | 55, 154 |

## RowPosition 세터 검토  (10)

`ds.RowPosition = v`(쓰기)는 직접 대응이 없어 주석+TODO 처리. 대상 그리드의 `setFocusedCell(row, colId)`로 재작성.

| 파일 | 라인 |
| --- | --- |
| `[mgt] common/ULDCOM00008.xml` | 77, 101, 112 |
| `[mgt] mgt/ULDMGT10108.xml` | 251 |
| `[mgt] mgt/ULDMGT10201.xml` | 187 |
| `[tms] common/ULDCOM00007.xml` | 406, 429 |
| `[tms] common/ULDCOM00008.xml` | 77, 100, 115 |

## trs/action 보강  (9)

Gauce trs `Action/KeyValue/Post`→executeDynamic 변환에서 action URL·ref(KeyValue 입력 매핑) 검증 필요.

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT30309.xml` | 191 |
| `[mgt] mgt/ULDMGT40020.xml` | 388, 412 |
| `[mgt] mgt/ULDMGT42045.xml` | 63, 76, 89 |
| `[stf] dis/dsclinfo/ULDSTF30403.xml` | 426, 457 |
| `[stf] lst/lstinvstg/ULDSTF07401.xml` | 547 |

## 규칙4 최상위 실행문 위치  (5)

함수 사이/뒤의 최상위 실행문을 안전 판단 못해 그대로 둠. init/onpageload로 옮길지 실행순서 확인.

| 파일 | 라인 |
| --- | --- |
| `[mgt] common/ULDCOM00008.xml` | 32 |
| `[mgt] mgt/ULDMGT10108.xml` | 118 |
| `[mgt] mgt/ULDMGT10110.xml` | 90 |
| `[mgt] mgt/ULDMGT10201.xml` | 54 |
| `[tms] common/ULDCOM00008.xml` | 32 |

## 미정의 참조  (2)

삭제용 데이터셋 등 정의되지 않은 객체 참조. 정의 추가 또는 로직 정리.

| 파일 | 라인 |
| --- | --- |
| `[stf] common/ULDINS91200.xml` | 406 |
| `[stf] lst/fis/ULDFIS00300_P7.xml` | 126 |

## timeout 옵션  (1)

정적 submission 노드 삭제 시 사라진 timeout 설정을 executeDynamic 옵션으로 옮길지 확인.

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT41000.xml` | 60 |

## fn_ 정규화 충돌  (1)

`fn_*` 함수명 정규화 시 이름 충돌로 보류. 수동 리네임.

| 파일 | 라인 |
| --- | --- |
| `[stf] dis/support/ULDSTF03704.xml` | 197 |

## 기타  (9)

개별 확인 필요.

| 파일 | 라인 |
| --- | --- |
| `[mgt] mgt/ULDMGT40002.xml` | 286 |
| `[mgt] mgt/ULDMGT40008.xml` | 78, 82, 526 |
| `[mgt] mgt/ULDMGT40220.xml` | 286 |
| `[stf] etc/ULDINS21340.xml` | 81, 269 |
| `[stf] lst/lstinvstg/ULDSTF07404.xml` | 546 |
| `[stf] lst/lstinvstg/ULDSTF07405.xml` | 146 |
