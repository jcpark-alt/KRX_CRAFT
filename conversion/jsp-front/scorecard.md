# 화면 스코어카드 (jsp-front ui-tobe · conversion/code convention 잔여 편차)

> `python conversion/tools/screen_scorecard.py` 가 만든다(P1, 2026-10-07). 점수 = Σ 가중(손작업 축 3 · 회신 축 2 · 기계 축 1) × 건수. `== null` 과 `getComponent` 는 정책상 보존이라 정보로만 싣는다. 화면별 전 수치는 `--tsv`.

화면 1677 · 함수 34,954 · 스크립트 693,514줄 · 점수 합 42,888 · 점수 0 화면 315

## 1. 항목별 합계

| 항목 | 축 | 가중 | 자리 | 화면 |
| --- | --- | ---: | ---: | ---: |
| jQuery | 손작업 | 3 | 6,295 | 496 |
| 폼 DOM | 손작업 | 3 | 430 | 144 |
| 원시 DOM | 손작업 | 3 | 3,916 | 881 |
| eval | 손작업 | 3 | 148 | 47 |
| location 이동 | 손작업 | 3 | 58 | 20 |
| 타이머 | 손작업 | 3 | 81 | 31 |
| innerHTML | 손작업 | 3 | 153 | 68 |
| 긴 함수 | 손작업 | 3 | 470 | 318 |
| try 없는 핸들러 | 기계 | 1 | 0 | 0 |
| fn_ 정의 | 기계 | 1 | 2 | 1 |
| console | 기계 | 1 | 4 | 3 |
| 네이티브 alert | 기계 | 1 | 7 | 2 |
| JSDoc 없음 | 기계 | 1 | 2 | 2 |
| TODO(회신) | 회신 | 2 | 1,333 | 727 |
| TODO(병합) | 회신 | 2 | 1,701 | 169 |
| TODO(규칙19) | 회신 | 2 | 266 | 75 |
| [sdd] console(회신) | 회신 | 2 | 540 | 172 |
| innerHTML(attrReals __html 실현) | 회신 | 2 | 270 | 270 |
| == null(정보) | 정보 | — | 12,413 | 1290 |
| getComponent(정보) | 정보 | — | 51,551 | 1485 |

## 2. 업무군별 합계

| 업무군 | 화면 | 점수 | jQuery | 폼 DOM | 원시 DOM | eval | 긴 함수 | try 없는 핸들러 | fn_ | console | TODO(회신) | TODO(병합) | TODO(규칙19) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| jldfil | 823 | 15,565 | 1068 | 15 | 2361 | 46 | 284 | 0 | 0 | 0 | 419 | 967 | 143 |
| jldinf | 209 | 10,713 | 2438 | 239 | 517 | 2 | 95 | 0 | 0 | 0 | 125 | 47 | 45 |
| jlddst | 204 | 5,116 | 1344 | 0 | 202 | 16 | 25 | 0 | 0 | 3 | 66 | 0 | 5 |
| jldbnf | 117 | 3,756 | 442 | 164 | 479 | 65 | 23 | 0 | 0 | 0 | 101 | 0 | 2 |
| jldstf | 155 | 3,379 | 224 | 1 | 139 | 15 | 30 | 0 | 2 | 0 | 380 | 490 | 45 |
| jldods | 100 | 2,983 | 755 | 0 | 122 | 0 | 8 | 0 | 0 | 1 | 80 | 27 | 10 |
| uldmgt | 66 | 1,337 | 23 | 11 | 96 | 4 | 1 | 0 | 0 | 0 | 150 | 170 | 16 |
| jldcom | 1 | 29 | 1 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 7 | 0 | 0 |
| jldbns | 1 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 |
| jldmgt | 1 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 |

## 3. 점수 상위 화면 (40)

| 화면 | 점수 | 줄 | 주된 편차 |
| --- | ---: | ---: | --- |
| JLDINF10100 | 719 | 4,444 | jQuery 193, 원시 DOM 33, 긴 함수 6, 폼 DOM 5, TODO(회신) 4 |
| JLDSTF31200 | 565 | 333 | TODO(병합) 278, TODO(회신) 2, 원시 DOM 1, innerHTML(attrReals __html 실현) 1 |
| JLDODS60301 | 452 | 1,537 | jQuery 149, 긴 함수 1, TODO(회신) 1 |
| JLDBNF05001 | 414 | 4,072 | jQuery 83, 원시 DOM 42, 폼 DOM 7, 긴 함수 3, TODO(회신) 3, 타이머 1 |
| JLDINF10600 | 325 | 1,421 | jQuery 94, 원시 DOM 6, 폼 DOM 4, 긴 함수 3, TODO(회신) 2 |
| JLDINF10000 | 318 | 1,841 | jQuery 83, 원시 DOM 8, 폼 DOM 5, 긴 함수 5, TODO(회신) 6, 타이머 1 |
| JLDINF10200 | 310 | 1,318 | jQuery 90, 원시 DOM 5, 폼 DOM 4, 긴 함수 3, TODO(회신) 2 |
| JLDINF10900 | 303 | 1,775 | jQuery 82, 원시 DOM 8, 폼 DOM 6, 긴 함수 3, TODO(회신) 3 |
| JLDDST90000 | 297 | 1,371 | jQuery 87, 타이머 6, 긴 함수 3, TODO(회신) 3, innerHTML(attrReals __html 실현) 1, console 1 |
| JLDDST50000 | 295 | 854 | jQuery 85, 타이머 8, [sdd] console(회신) 4, TODO(회신) 3, innerHTML(attrReals __html 실현) 1 |
| JLDDST00300 | 292 | 1,818 | jQuery 89, 긴 함수 3, 원시 DOM 2, 타이머 2, TODO(회신) 1, innerHTML(attrReals __html 실현) 1 |
| JLDINF91410 | 290 | 1,090 | jQuery 91, 폼 DOM 3, 원시 DOM 1, 긴 함수 1, TODO(회신) 1 |
| JLDFIL00000 | 285 | 1,345 | 원시 DOM 75, TODO(병합) 12, eval 3, TODO(회신) 4, [sdd] console(회신) 4, 긴 함수 2, location 이동 1, innerHTML(attrReals __html 실현) 1 |
| JLDINF91110 | 278 | 2,832 | jQuery 84, 원시 DOM 4, 긴 함수 3, 폼 DOM 1, TODO(회신) 1 |
| JLDDST60200 | 275 | 779 | jQuery 74, location 이동 7, 원시 DOM 5, 타이머 2, TODO(회신) 3, 긴 함수 1, innerHTML(attrReals __html 실현) 1 |
| JLDINF05400 | 268 | 1,532 | jQuery 48, 원시 DOM 28, 폼 DOM 5, [sdd] console(회신) 6, 긴 함수 3, TODO(회신) 2 |
| JLDINF10500 | 262 | 1,233 | jQuery 74, 원시 DOM 5, 폼 DOM 4, 긴 함수 3, TODO(회신) 2 |
| JLDFIL51200 | 243 | 2,575 | jQuery 48, 원시 DOM 29, [sdd] console(회신) 4, TODO(회신) 1, innerHTML(attrReals __html 실현) 1 |
| JLDINF92500 | 241 | 978 | jQuery 39, TODO(병합) 32, TODO(규칙19) 20, 폼 DOM 3, 원시 DOM 2, 긴 함수 1, TODO(회신) 1 |
| JLDBNF00000 | 238 | 1,086 | 원시 DOM 35, jQuery 27, 폼 DOM 8, TODO(회신) 11, location 이동 1, 긴 함수 1 |
| JLDINF11000 | 237 | 1,789 | jQuery 62, 원시 DOM 8, 폼 DOM 4, 긴 함수 3, TODO(회신) 3 |
| JLDDST60100 | 224 | 1,145 | 원시 DOM 58, jQuery 16, TODO(회신) 1 |
| JLDINF92010 | 224 | 1,099 | jQuery 68, 폼 DOM 3, 원시 DOM 2, 긴 함수 1, TODO(회신) 1 |
| JLDFIL35700C | 215 | 4,368 | jQuery 49, 원시 DOM 11, 긴 함수 5, [sdd] console(회신) 6, TODO(회신) 2, TODO(규칙19) 2 |
| JLDFIL35700_POP | 215 | 4,361 | jQuery 49, 원시 DOM 11, 긴 함수 5, [sdd] console(회신) 6, TODO(회신) 2, TODO(규칙19) 2 |
| JLDINF11100 | 214 | 1,275 | jQuery 57, 원시 DOM 6, 폼 DOM 4, 긴 함수 3, TODO(회신) 2 |
| JLDINF91810 | 209 | 1,004 | jQuery 64, 폼 DOM 3, 원시 DOM 1, 긴 함수 1, TODO(회신) 1 |
| JLDINF10800 | 198 | 946 | jQuery 47, 원시 DOM 9, 폼 DOM 5, 긴 함수 2, TODO(회신) 3, eval 1 |
| JLDINF11200 | 196 | 1,042 | jQuery 50, 원시 DOM 7, 폼 DOM 4, 긴 함수 3, TODO(회신) 2 |
| JLDINF91910 | 194 | 1,134 | jQuery 58, 폼 DOM 3, 원시 DOM 2, 긴 함수 1, TODO(회신) 1 |
| JLDINF10400 | 193 | 1,424 | jQuery 46, 원시 DOM 6, 폼 DOM 4, 타이머 4, 긴 함수 3, TODO(회신) 2 |
| JLDSTF70010 | 193 | 1,550 | TODO(병합) 44, jQuery 19, TODO(규칙19) 19, TODO(회신) 5 |
| JLDODS17001 | 188 | 386 | jQuery 62, [sdd] console(회신) 1 |
| JLDINF10700 | 175 | 1,471 | jQuery 41, 원시 DOM 6, 폼 DOM 4, 타이머 3, 긴 함수 3, TODO(회신) 2 |
| JLDINF00000 | 171 | 1,307 | 원시 DOM 40, 폼 DOM 10, TODO(회신) 6, location 이동 3 |
| JLDFIL25101 | 161 | 765 | TODO(병합) 61, 원시 DOM 5, jQuery 3, 긴 함수 3, TODO(회신) 1, TODO(규칙19) 1, innerHTML(attrReals __html 실현) 1 |
| JLDODS27000 | 161 | 484 | jQuery 53, TODO(회신) 1 |
| JLDINF25200 | 160 | 724 | jQuery 46, 원시 DOM 4, 폼 DOM 2, TODO(회신) 1, innerHTML(attrReals __html 실현) 1 |
| JLDINF10102 | 155 | 503 | jQuery 30, 원시 DOM 16, [sdd] console(회신) 6, 긴 함수 1, TODO(회신) 1 |
| JLDINF25600 | 154 | 595 | jQuery 42, 폼 DOM 4, 원시 DOM 4, TODO(회신) 1, innerHTML(attrReals __html 실현) 1 |

## 4. 다음 손작업 배치 제안 — 퍼블리싱 병합 화면(디자인 확정) 중 점수 순 (40)

> 병합 화면은 컴포넌트가 확정돼 B-7 처방(jQuery·폼 DOM 재작성)을 바로 적용할 수 있다. 손본 화면은 `publish_merge_overrides.json` 에 `frozen` 을 적어 보호한다.

| 순서 | 화면 | 점수 | 주된 편차 |
| ---: | --- | ---: | --- |
| 1 | JLDSTF31200 | 565 | TODO(병합) 278, TODO(회신) 2, 원시 DOM 1, innerHTML(attrReals __html 실현) 1 |
| 2 | JLDFIL00000 | 285 | 원시 DOM 75, TODO(병합) 12, eval 3, TODO(회신) 4, [sdd] console(회신) 4, 긴 함수 2, location 이동 1, innerHTML(attrReals __html 실현) 1 |
| 3 | JLDINF92500 | 241 | jQuery 39, TODO(병합) 32, TODO(규칙19) 20, 폼 DOM 3, 원시 DOM 2, 긴 함수 1, TODO(회신) 1 |
| 4 | JLDSTF70010 | 193 | TODO(병합) 44, jQuery 19, TODO(규칙19) 19, TODO(회신) 5 |
| 5 | JLDFIL25101 | 161 | TODO(병합) 61, 원시 DOM 5, jQuery 3, 긴 함수 3, TODO(회신) 1, TODO(규칙19) 1, innerHTML(attrReals __html 실현) 1 |
| 6 | ULDMGT50002 | 143 | TODO(회신) 33, TODO(병합) 18, 원시 DOM 10, 폼 DOM 2, eval 1, [sdd] console(회신) 1 |
| 7 | JLDFIL00021 | 140 | 원시 DOM 43, TODO(회신) 2, [sdd] console(회신) 2, 긴 함수 1 |
| 8 | JLDFIL25113 | 135 | TODO(병합) 56, 원시 DOM 5, location 이동 1, 긴 함수 1, [sdd] console(회신) 1 |
| 9 | JLDFIL59410 | 126 | TODO(병합) 34, innerHTML 7, jQuery 3, 원시 DOM 3, TODO(규칙19) 3, [sdd] console(회신) 3, 긴 함수 1, TODO(회신) 1, innerHTML(attrReals |
| 10 | ULDMGT76101 | 125 | TODO(병합) 30, jQuery 9, TODO(규칙19) 9, [sdd] console(회신) 8, TODO(회신) 1, innerHTML(attrReals __html 실현) 1 |
| 11 | JLDFIL40203 | 121 | TODO(병합) 43, 원시 DOM 7, 긴 함수 2, TODO(회신) 3, innerHTML(attrReals __html 실현) 1 |
| 12 | JLDSTF71000 | 119 | TODO(병합) 26, jQuery 13, TODO(규칙19) 13, TODO(회신) 1 |
| 13 | ULDMGT50316 | 118 | TODO(병합) 32, 원시 DOM 14, TODO(회신) 4, [sdd] console(회신) 2 |
| 14 | JLDFIL22110 | 114 | jQuery 19, TODO(규칙19) 19, 원시 DOM 3, TODO(병합) 3, [sdd] console(회신) 1, innerHTML(attrReals __html 실현) 1 |
| 15 | JLDFIL25107 | 111 | TODO(병합) 46, 원시 DOM 4, 긴 함수 1, TODO(회신) 1, innerHTML(attrReals __html 실현) 1 |
| 16 | JLDFIL20300 | 105 | TODO(병합) 48, 원시 DOM 3 |
| 17 | JLDFIL11060 | 104 | jQuery 15, TODO(규칙19) 14, TODO(병합) 9, 타이머 2, 원시 DOM 1, [sdd] console(회신) 1, innerHTML(attrReals __html 실현) 1 |
| 18 | JLDFIL11010 | 102 | jQuery 13, TODO(규칙19) 13, 원시 DOM 5, TODO(병합) 6, TODO(회신) 3, [sdd] console(회신) 1, innerHTML(attrReals __html 실현) 1 |
| 19 | JLDSTF75100 | 99 | TODO(병합) 35, jQuery 5, TODO(규칙19) 5, TODO(회신) 1, [sdd] console(회신) 1 |
| 20 | JLDFIL25910 | 94 | jQuery 14, TODO(규칙19) 14, TODO(병합) 6, 원시 DOM 1, 긴 함수 1, TODO(회신) 1, [sdd] console(회신) 1, innerHTML(attrReals __html 실현)  |
| 21 | JLDFIL00001 | 92 | 원시 DOM 11, TODO(병합) 14, eval 3, [sdd] console(회신) 4, TODO(회신) 3, location 이동 1, 긴 함수 1, innerHTML(attrReals __html 실현) 1 |
| 22 | JLDFIL25104 | 87 | TODO(병합) 36, 원시 DOM 3, location 이동 1, 긴 함수 1 |
| 23 | JLDFIL35700 | 84 | TODO(병합) 42 |
| 24 | JLDFIL25102 | 75 | TODO(병합) 30, 원시 DOM 3, location 이동 1, 긴 함수 1 |
| 25 | JLDFIL30201 | 75 | TODO(병합) 23, jQuery 4, TODO(규칙19) 4, 원시 DOM 2, 긴 함수 1 |
| 26 | JLDFIL30301 | 75 | TODO(병합) 23, jQuery 4, TODO(규칙19) 4, 원시 DOM 2, 긴 함수 1 |
| 27 | JLDFIL16200 | 74 | 원시 DOM 14, eval 5, TODO(병합) 4, 긴 함수 1, TODO(회신) 1, [sdd] console(회신) 1, innerHTML(attrReals __html 실현) 1 |
| 28 | JLDFIL45501 | 74 | TODO(병합) 37 |
| 29 | ULDMGT76100 | 73 | TODO(병합) 16, jQuery 5, TODO(규칙19) 5, 원시 DOM 2, TODO(회신) 3, [sdd] console(회신) 2 |
| 30 | JLDFIL17301 | 67 | TODO(병합) 15, 원시 DOM 7, [sdd] console(회신) 4, innerHTML 1, 긴 함수 1, TODO(회신) 1 |
| 31 | JLDFIL16404N | 64 | TODO(병합) 19, 원시 DOM 8, TODO(회신) 1 |
| 32 | JLDSTF30100 | 64 | [sdd] console(회신) 8, 원시 DOM 4, TODO(회신) 5, innerHTML 3, TODO(병합) 4, 긴 함수 2, eval 1 |
| 33 | JLDFIL25111 | 63 | TODO(병합) 24, 원시 DOM 3, location 이동 1, 긴 함수 1 |
| 34 | JLDFIL25800 | 62 | 원시 DOM 8, TODO(병합) 11, [sdd] console(회신) 7, TODO(회신) 1 |
| 35 | JLDFIL40200 | 59 | TODO(병합) 15, innerHTML 5, 원시 DOM 2, 네이티브 alert 6, TODO(회신) 1 |
| 36 | JLDFIL00010 | 58 | TODO(병합) 16, 원시 DOM 5, TODO(회신) 3, innerHTML 1, TODO(규칙19) 1 |
| 37 | JLDSTF76200 | 53 | jQuery 9, TODO(규칙19) 8, TODO(회신) 3, TODO(병합) 2 |
| 38 | JLDFIL25050 | 52 | eval 15, 원시 DOM 1, TODO(회신) 1, TODO(병합) 1 |
| 39 | JLDODS20010 | 52 | TODO(병합) 21, jQuery 2, TODO(규칙19) 2 |
| 40 | JLDODS20000 | 50 | jQuery 7, TODO(규칙19) 7, TODO(병합) 6, 타이머 1 |

