# 화면 스코어카드 (jsp-front ui-tobe · conversion/code convention 잔여 편차)

> `python conversion/tools/screen_scorecard.py` 가 만든다(P1, 2026-10-07). 점수 = Σ 가중(손작업 축 3 · 회신 축 2 · 기계 축 1) × 건수. `== null` 과 `getComponent` 는 정책상 보존이라 정보로만 싣는다. 화면별 전 수치는 `--tsv`.

화면 1677 · 함수 34,954 · 스크립트 693,498줄 · 점수 합 44,481 · 점수 0 화면 313

## 1. 항목별 합계

| 항목 | 축 | 가중 | 자리 | 화면 |
| --- | --- | ---: | ---: | ---: |
| jQuery | 손작업 | 3 | 6,295 | 496 |
| 폼 DOM | 손작업 | 3 | 430 | 144 |
| 원시 DOM | 손작업 | 3 | 3,916 | 881 |
| eval | 손작업 | 3 | 148 | 47 |
| location 이동 | 손작업 | 3 | 58 | 20 |
| 타이머 | 손작업 | 3 | 81 | 31 |
| innerHTML | 손작업 | 3 | 435 | 311 |
| 긴 함수 | 손작업 | 3 | 476 | 319 |
| try 없는 핸들러 | 기계 | 1 | 0 | 0 |
| fn_ 정의 | 기계 | 1 | 2 | 1 |
| console | 기계 | 1 | 2,369 | 317 |
| 네이티브 alert | 기계 | 1 | 7 | 2 |
| JSDoc 없음 | 기계 | 1 | 2 | 2 |
| TODO(회신) | 회신 | 2 | 1,325 | 721 |
| TODO(병합) | 회신 | 2 | 1,701 | 169 |
| TODO(규칙19) | 회신 | 2 | 266 | 75 |
| == null(정보) | 정보 | — | 13,563 | 1290 |
| getComponent(정보) | 정보 | — | 52,929 | 1485 |

## 2. 업무군별 합계

| 업무군 | 화면 | 점수 | jQuery | 폼 DOM | 원시 DOM | eval | 긴 함수 | try 없는 핸들러 | fn_ | console | TODO(회신) | TODO(병합) | TODO(규칙19) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| jldfil | 823 | 16,340 | 1068 | 15 | 2361 | 46 | 288 | 0 | 0 | 1167 | 415 | 967 | 143 |
| jldinf | 209 | 10,932 | 2438 | 239 | 517 | 2 | 97 | 0 | 0 | 477 | 124 | 47 | 45 |
| jlddst | 204 | 5,269 | 1344 | 0 | 202 | 16 | 25 | 0 | 0 | 206 | 65 | 0 | 5 |
| jldbnf | 117 | 3,827 | 442 | 164 | 479 | 65 | 23 | 0 | 0 | 83 | 100 | 0 | 2 |
| jldstf | 155 | 3,688 | 224 | 1 | 139 | 15 | 30 | 0 | 2 | 325 | 379 | 490 | 45 |
| jldods | 100 | 3,054 | 755 | 0 | 122 | 0 | 8 | 0 | 0 | 81 | 80 | 27 | 10 |
| uldmgt | 66 | 1,332 | 23 | 11 | 96 | 4 | 1 | 0 | 0 | 30 | 150 | 170 | 16 |
| jldcom | 1 | 29 | 1 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 7 | 0 | 0 |
| jldbns | 1 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 |
| jldmgt | 1 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 |

## 3. 점수 상위 화면 (40)

| 화면 | 점수 | 줄 | 주된 편차 |
| --- | ---: | ---: | --- |
| JLDINF10100 | 749 | 4,444 | jQuery 193, 원시 DOM 33, console 27, 긴 함수 7, 폼 DOM 5, TODO(회신) 4 |
| JLDSTF31200 | 567 | 333 | TODO(병합) 278, TODO(회신) 2, 원시 DOM 1, innerHTML 1, console 1 |
| JLDODS60301 | 452 | 1,537 | jQuery 149, 긴 함수 1, TODO(회신) 1 |
| JLDBNF05001 | 429 | 4,072 | jQuery 83, 원시 DOM 42, 폼 DOM 7, console 15, 긴 함수 3, TODO(회신) 3, 타이머 1 |
| JLDDST00300 | 419 | 1,818 | jQuery 89, console 126, 긴 함수 3, 원시 DOM 2, 타이머 2, innerHTML 1, TODO(회신) 1 |
| JLDINF10600 | 340 | 1,421 | jQuery 94, 원시 DOM 6, console 15, 폼 DOM 4, 긴 함수 3, TODO(회신) 2 |
| JLDINF10200 | 326 | 1,318 | jQuery 90, console 16, 원시 DOM 5, 폼 DOM 4, 긴 함수 3, TODO(회신) 2 |
| JLDINF10000 | 321 | 1,841 | jQuery 83, 원시 DOM 8, 폼 DOM 5, 긴 함수 5, TODO(회신) 6, 타이머 1, console 3 |
| JLDINF10900 | 316 | 1,775 | jQuery 82, 원시 DOM 8, 폼 DOM 6, console 13, 긴 함수 3, TODO(회신) 3 |
| JLDDST90000 | 298 | 1,371 | jQuery 87, 타이머 6, 긴 함수 3, TODO(회신) 3, innerHTML 1, console 1 |
| JLDINF91410 | 295 | 1,090 | jQuery 91, 폼 DOM 3, console 5, 원시 DOM 1, 긴 함수 1, TODO(회신) 1 |
| JLDDST50000 | 292 | 854 | jQuery 85, 타이머 8, TODO(회신) 3, console 4, innerHTML 1 |
| JLDINF05400 | 292 | 1,532 | jQuery 48, 원시 DOM 28, console 36, 폼 DOM 5, 긴 함수 3, TODO(회신) 2 |
| JLDFIL00000 | 282 | 1,345 | 원시 DOM 75, TODO(병합) 12, eval 3, TODO(회신) 4, 긴 함수 2, console 4, location 이동 1, innerHTML 1 |
| JLDDST60200 | 281 | 779 | jQuery 74, location 이동 7, 원시 DOM 5, 타이머 2, TODO(회신) 3, console 5, innerHTML 1, 긴 함수 1 |
| JLDINF91110 | 279 | 2,832 | jQuery 84, 원시 DOM 4, 긴 함수 3, 폼 DOM 1, TODO(회신) 1, console 1 |
| JLDINF10500 | 273 | 1,233 | jQuery 74, 원시 DOM 5, 폼 DOM 4, console 11, 긴 함수 3, TODO(회신) 2 |
| JLDINF11000 | 250 | 1,789 | jQuery 62, 원시 DOM 8, console 13, 폼 DOM 4, 긴 함수 3, TODO(회신) 3 |
| JLDINF92500 | 245 | 978 | jQuery 39, TODO(병합) 32, TODO(규칙19) 20, 폼 DOM 3, 원시 DOM 2, console 4, 긴 함수 1, TODO(회신) 1 |
| JLDFIL51200 | 240 | 2,575 | jQuery 48, 원시 DOM 29, console 4, innerHTML 1, TODO(회신) 1 |
| JLDBNF00000 | 238 | 1,086 | 원시 DOM 35, jQuery 27, 폼 DOM 8, TODO(회신) 11, location 이동 1, 긴 함수 1 |
| JLDINF92010 | 233 | 1,099 | jQuery 68, 폼 DOM 3, console 9, 원시 DOM 2, 긴 함수 1, TODO(회신) 1 |
| JLDFIL51030 | 231 | 7,055 | console 188, 원시 DOM 9, 긴 함수 3, TODO(회신) 2, innerHTML 1 |
| JLDINF11100 | 231 | 1,275 | jQuery 57, 원시 DOM 6, console 17, 폼 DOM 4, 긴 함수 3, TODO(회신) 2 |
| JLDFIL51030N | 228 | 6,962 | console 188, 원시 DOM 8, 긴 함수 3, TODO(회신) 2, innerHTML 1 |
| JLDFIL51030N2 | 228 | 6,962 | console 188, 원시 DOM 8, 긴 함수 3, TODO(회신) 2, innerHTML 1 |
| JLDDST60100 | 224 | 1,145 | 원시 DOM 58, jQuery 16, TODO(회신) 1 |
| JLDINF11200 | 213 | 1,042 | jQuery 50, 원시 DOM 7, console 17, 폼 DOM 4, 긴 함수 3, TODO(회신) 2 |
| JLDINF91810 | 213 | 1,004 | jQuery 64, 폼 DOM 3, console 4, 원시 DOM 1, 긴 함수 1, TODO(회신) 1 |
| JLDFIL35700C | 212 | 4,368 | jQuery 49, 원시 DOM 11, 긴 함수 5, console 9, TODO(회신) 2, TODO(규칙19) 2 |
| JLDFIL35700_POP | 212 | 4,361 | jQuery 49, 원시 DOM 11, 긴 함수 5, console 9, TODO(회신) 2, TODO(규칙19) 2 |
| JLDINF10800 | 207 | 946 | jQuery 47, 원시 DOM 9, 폼 DOM 5, console 9, 긴 함수 2, TODO(회신) 3, eval 1 |
| JLDINF10400 | 202 | 1,424 | jQuery 46, 원시 DOM 6, 폼 DOM 4, 타이머 4, 긴 함수 3, console 9, TODO(회신) 2 |
| JLDSTF07130 | 201 | 553 | console 192, 긴 함수 3 |
| JLDINF91910 | 196 | 1,134 | jQuery 58, 폼 DOM 3, 원시 DOM 2, 긴 함수 1, console 2, TODO(회신) 1 |
| JLDSTF70010 | 195 | 1,550 | TODO(병합) 44, jQuery 19, TODO(규칙19) 19, TODO(회신) 5, console 2 |
| JLDODS17001 | 187 | 386 | jQuery 62, console 1 |
| JLDINF10700 | 183 | 1,471 | jQuery 41, 원시 DOM 6, 폼 DOM 4, 타이머 3, 긴 함수 3, console 8, TODO(회신) 2 |
| JLDINF00000 | 171 | 1,307 | 원시 DOM 40, 폼 DOM 10, TODO(회신) 6, location 이동 3 |
| JLDFIL25101 | 162 | 765 | TODO(병합) 61, 원시 DOM 5, jQuery 3, 긴 함수 3, innerHTML 1, TODO(회신) 1, TODO(규칙19) 1 |

## 4. 다음 손작업 배치 제안 — 퍼블리싱 병합 화면(디자인 확정) 중 점수 순 (40)

> 병합 화면은 컴포넌트가 확정돼 B-7 처방(jQuery·폼 DOM 재작성)을 바로 적용할 수 있다. 손본 화면은 `publish_merge_overrides.json` 에 `frozen` 을 적어 보호한다.

| 순서 | 화면 | 점수 | 주된 편차 |
| ---: | --- | ---: | --- |
| 1 | JLDSTF31200 | 567 | TODO(병합) 278, TODO(회신) 2, 원시 DOM 1, innerHTML 1, console 1 |
| 2 | JLDFIL00000 | 282 | 원시 DOM 75, TODO(병합) 12, eval 3, TODO(회신) 4, 긴 함수 2, console 4, location 이동 1, innerHTML 1 |
| 3 | JLDINF92500 | 245 | jQuery 39, TODO(병합) 32, TODO(규칙19) 20, 폼 DOM 3, 원시 DOM 2, console 4, 긴 함수 1, TODO(회신) 1 |
| 4 | JLDSTF70010 | 195 | TODO(병합) 44, jQuery 19, TODO(규칙19) 19, TODO(회신) 5, console 2 |
| 5 | JLDFIL25101 | 162 | TODO(병합) 61, 원시 DOM 5, jQuery 3, 긴 함수 3, innerHTML 1, TODO(회신) 1, TODO(규칙19) 1 |
| 6 | ULDMGT50002 | 142 | TODO(회신) 33, TODO(병합) 18, 원시 DOM 10, 폼 DOM 2, eval 1, console 1 |
| 7 | JLDFIL00021 | 138 | 원시 DOM 43, TODO(회신) 2, 긴 함수 1, console 2 |
| 8 | JLDFIL59410 | 136 | TODO(병합) 34, innerHTML 8, console 14, jQuery 3, 원시 DOM 3, 긴 함수 2, TODO(규칙19) 3 |
| 9 | JLDFIL25113 | 134 | TODO(병합) 56, 원시 DOM 5, location 이동 1, 긴 함수 1, console 1 |
| 10 | JLDFIL40203 | 122 | TODO(병합) 43, 원시 DOM 7, 긴 함수 2, TODO(회신) 3, innerHTML 1 |
| 11 | JLDSTF71000 | 119 | TODO(병합) 26, jQuery 13, TODO(규칙19) 13, TODO(회신) 1 |
| 12 | ULDMGT76101 | 118 | TODO(병합) 30, jQuery 9, TODO(규칙19) 9, console 8, innerHTML 1, TODO(회신) 1 |
| 13 | ULDMGT50316 | 116 | TODO(병합) 32, 원시 DOM 14, TODO(회신) 4, console 2 |
| 14 | JLDFIL22110 | 114 | jQuery 19, TODO(규칙19) 19, 원시 DOM 3, TODO(병합) 3, innerHTML 1, console 1 |
| 15 | JLDFIL25107 | 112 | TODO(병합) 46, 원시 DOM 4, innerHTML 1, 긴 함수 1, TODO(회신) 1 |
| 16 | JLDFIL11010 | 107 | jQuery 13, TODO(규칙19) 13, 원시 DOM 5, TODO(병합) 6, console 6, TODO(회신) 3, innerHTML 1 |
| 17 | JLDFIL11060 | 105 | jQuery 15, TODO(규칙19) 14, TODO(병합) 9, 타이머 2, 원시 DOM 1, innerHTML 1, console 2 |
| 18 | JLDFIL20300 | 105 | TODO(병합) 48, 원시 DOM 3 |
| 19 | JLDSTF75100 | 98 | TODO(병합) 35, jQuery 5, TODO(규칙19) 5, TODO(회신) 1, console 1 |
| 20 | JLDFIL25910 | 94 | jQuery 14, TODO(규칙19) 14, TODO(병합) 6, 원시 DOM 1, innerHTML 1, 긴 함수 1, TODO(회신) 1, console 1 |
| 21 | JLDFIL00001 | 89 | 원시 DOM 11, TODO(병합) 14, eval 3, TODO(회신) 3, console 4, location 이동 1, innerHTML 1, 긴 함수 1 |
| 22 | JLDFIL25104 | 87 | TODO(병합) 36, 원시 DOM 3, location 이동 1, 긴 함수 1 |
| 23 | JLDFIL35700 | 84 | TODO(병합) 42 |
| 24 | JLDFIL16200 | 78 | 원시 DOM 14, eval 5, TODO(병합) 4, console 5, innerHTML 1, 긴 함수 1, TODO(회신) 1 |
| 25 | JLDFIL25102 | 75 | TODO(병합) 30, 원시 DOM 3, location 이동 1, 긴 함수 1 |
| 26 | JLDFIL30201 | 75 | TODO(병합) 23, jQuery 4, TODO(규칙19) 4, 원시 DOM 2, 긴 함수 1 |
| 27 | JLDFIL30301 | 75 | TODO(병합) 23, jQuery 4, TODO(규칙19) 4, 원시 DOM 2, 긴 함수 1 |
| 28 | JLDFIL45501 | 74 | TODO(병합) 37 |
| 29 | ULDMGT76100 | 71 | TODO(병합) 16, jQuery 5, TODO(규칙19) 5, 원시 DOM 2, TODO(회신) 3, console 2 |
| 30 | JLDFIL16404N | 64 | TODO(병합) 19, 원시 DOM 8, TODO(회신) 1 |
| 31 | JLDFIL17301 | 63 | TODO(병합) 15, 원시 DOM 7, console 4, innerHTML 1, 긴 함수 1, TODO(회신) 1 |
| 32 | JLDFIL25111 | 63 | TODO(병합) 24, 원시 DOM 3, location 이동 1, 긴 함수 1 |
| 33 | JLDFIL35400 | 62 | 원시 DOM 6, console 16, TODO(회신) 5, innerHTML 3, TODO(병합) 3, 긴 함수 1 |
| 34 | JLDODS20000 | 61 | jQuery 7, TODO(규칙19) 7, TODO(병합) 6, console 11, 타이머 1 |
| 35 | JLDFIL40200 | 59 | TODO(병합) 15, innerHTML 5, 원시 DOM 2, 네이티브 alert 6, TODO(회신) 1 |
| 36 | JLDFIL00010 | 58 | TODO(병합) 16, 원시 DOM 5, TODO(회신) 3, innerHTML 1, TODO(규칙19) 1 |
| 37 | JLDFIL25050 | 56 | eval 15, console 4, 원시 DOM 1, TODO(회신) 1, TODO(병합) 1 |
| 38 | JLDSTF30100 | 56 | 원시 DOM 4, TODO(회신) 5, innerHTML 3, console 8, TODO(병합) 4, 긴 함수 2, eval 1 |
| 39 | JLDFIL25800 | 55 | 원시 DOM 8, TODO(병합) 11, console 7, TODO(회신) 1 |
| 40 | JLDSTF76200 | 53 | jQuery 9, TODO(규칙19) 8, TODO(회신) 3, TODO(병합) 2 |

