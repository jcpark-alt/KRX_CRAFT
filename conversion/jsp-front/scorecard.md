# 화면 스코어카드 (jsp-front ui-tobe · conversion/code convention 잔여 편차)

> `python conversion/tools/screen_scorecard.py` 가 만든다(P1, 2026-10-07). 점수 = Σ 가중(손작업 축 3 · 회신 축 2 · 기계 축 1) × 건수. `== null` 과 `getComponent` 는 정책상 보존이라 정보로만 싣는다. 화면별 전 수치는 `--tsv`.

화면 1677 · 함수 34,954 · 스크립트 691,393줄 · 점수 합 38,521 · 점수 0 화면 398

## 1. 항목별 합계

| 항목 | 축 | 가중 | 자리 | 화면 |
| --- | --- | ---: | ---: | ---: |
| jQuery | 손작업 | 3 | 6,247 | 490 |
| 폼 DOM | 손작업 | 3 | 217 | 104 |
| 원시 DOM | 손작업 | 3 | 2,255 | 609 |
| eval | 손작업 | 3 | 62 | 22 |
| location 이동 | 손작업 | 3 | 47 | 20 |
| 타이머 | 손작업 | 3 | 81 | 31 |
| innerHTML | 손작업 | 3 | 147 | 66 |
| 긴 함수 | 손작업 | 3 | 444 | 292 |
| try 없는 핸들러 | 기계 | 1 | 0 | 0 |
| fn_ 정의 | 기계 | 1 | 2 | 1 |
| console | 기계 | 1 | 4 | 3 |
| 네이티브 alert | 기계 | 1 | 7 | 2 |
| JSDoc 없음 | 기계 | 1 | 2 | 2 |
| TODO(회신) | 회신 | 2 | 1,338 | 727 |
| TODO(병합) | 회신 | 2 | 1,701 | 169 |
| TODO(규칙19) | 회신 | 2 | 248 | 69 |
| [sdd] console(회신) | 회신 | 2 | 521 | 164 |
| innerHTML(attrReals __html 실현) | 회신 | 2 | 270 | 270 |
| 미정의 as-is 공통(fn_) | 회신 | 2 | 925 | 314 |
| == null(정보) | 정보 | — | 12,413 | 1290 |
| getComponent(정보) | 정보 | — | 51,620 | 1485 |

## 2. 업무군별 합계

| 업무군 | 화면 | 점수 | jQuery | 폼 DOM | 원시 DOM | eval | 긴 함수 | try 없는 핸들러 | fn_ | console | TODO(회신) | TODO(병합) | TODO(규칙19) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| jldfil | 823 | 12,532 | 1068 | 15 | 1166 | 10 | 258 | 0 | 0 | 0 | 424 | 967 | 143 |
| jldinf | 209 | 10,505 | 2390 | 124 | 376 | 2 | 95 | 0 | 0 | 0 | 125 | 47 | 27 |
| jlddst | 204 | 5,060 | 1344 | 0 | 193 | 3 | 25 | 0 | 0 | 3 | 66 | 0 | 5 |
| jldstf | 155 | 3,249 | 224 | 1 | 83 | 8 | 30 | 0 | 2 | 0 | 380 | 490 | 45 |
| jldbnf | 117 | 2,999 | 442 | 66 | 292 | 39 | 23 | 0 | 0 | 0 | 101 | 0 | 2 |
| jldods | 100 | 2,791 | 755 | 0 | 50 | 0 | 8 | 0 | 0 | 1 | 80 | 27 | 10 |
| uldmgt | 66 | 1,324 | 23 | 11 | 95 | 0 | 1 | 0 | 0 | 0 | 150 | 170 | 16 |
| jldcom | 1 | 41 | 1 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 7 | 0 | 0 |
| jldbns | 1 | 16 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 |
| jldmgt | 1 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 |

## 3. 점수 상위 화면 (40)

| 화면 | 점수 | 줄 | 주된 편차 |
| --- | ---: | ---: | --- |
| JLDINF10100 | 736 | 4,429 | jQuery 193, 원시 DOM 28, 미정의 as-is 공통(fn_) 19, 긴 함수 6, 폼 DOM 3, TODO(회신) 4 |
| JLDSTF31200 | 565 | 332 | TODO(병합) 278, TODO(회신) 2, 원시 DOM 1, innerHTML(attrReals __html 실현) 1 |
| JLDODS60301 | 454 | 1,537 | jQuery 149, 긴 함수 1, TODO(회신) 1, 미정의 as-is 공통(fn_) 1 |
| JLDBNF05001 | 388 | 4,055 | jQuery 83, 원시 DOM 28, 미정의 as-is 공통(fn_) 14, 폼 DOM 3, 긴 함수 3, TODO(회신) 3, 타이머 1 |
| JLDINF10600 | 330 | 1,418 | jQuery 92, 미정의 as-is 공통(fn_) 10, 원시 DOM 5, 긴 함수 3, 폼 DOM 2, TODO(회신) 2 |
| JLDINF10000 | 313 | 1,836 | jQuery 81, 미정의 as-is 공통(fn_) 8, 원시 DOM 5, 긴 함수 5, TODO(회신) 6, 폼 DOM 3, 타이머 1 |
| JLDINF91110 | 311 | 2,826 | jQuery 83, 미정의 as-is 공통(fn_) 18, 원시 DOM 4, 긴 함수 3, 폼 DOM 1, TODO(회신) 1 |
| JLDINF10900 | 310 | 1,771 | jQuery 81, 미정의 as-is 공통(fn_) 11, 원시 DOM 6, 폼 DOM 4, 긴 함수 3, TODO(회신) 3 |
| JLDINF10200 | 307 | 1,315 | jQuery 88, 원시 DOM 4, 미정의 as-is 공통(fn_) 6, 긴 함수 3, 폼 DOM 2, TODO(회신) 2 |
| JLDDST90000 | 297 | 1,371 | jQuery 87, 타이머 6, 긴 함수 3, TODO(회신) 3, innerHTML(attrReals __html 실현) 1, console 1 |
| JLDDST50000 | 295 | 854 | jQuery 85, 타이머 8, [sdd] console(회신) 4, TODO(회신) 3, innerHTML(attrReals __html 실현) 1 |
| JLDDST00300 | 292 | 1,818 | jQuery 89, 긴 함수 3, 원시 DOM 2, 타이머 2, TODO(회신) 1, innerHTML(attrReals __html 실현) 1 |
| JLDINF91410 | 280 | 1,087 | jQuery 88, 미정의 as-is 공통(fn_) 4, 폼 DOM 1, 긴 함수 1, TODO(회신) 1 |
| JLDDST60200 | 275 | 779 | jQuery 74, location 이동 7, 원시 DOM 5, 타이머 2, TODO(회신) 3, 긴 함수 1, innerHTML(attrReals __html 실현) 1 |
| JLDINF05400 | 272 | 1,529 | jQuery 48, 원시 DOM 26, 미정의 as-is 공통(fn_) 8, [sdd] console(회신) 6, 폼 DOM 3, 긴 함수 3, TODO(회신) 2 |
| JLDINF10500 | 265 | 1,230 | jQuery 72, 미정의 as-is 공통(fn_) 9, 원시 DOM 4, 긴 함수 3, 폼 DOM 2, TODO(회신) 2 |
| JLDINF11000 | 245 | 1,785 | jQuery 62, 미정의 as-is 공통(fn_) 10, 원시 DOM 6, 긴 함수 3, 폼 DOM 2, TODO(회신) 3 |
| JLDBNF00000 | 244 | 1,077 | 원시 DOM 33, jQuery 27, 폼 DOM 8, TODO(회신) 11, 미정의 as-is 공통(fn_) 6, location 이동 1, 긴 함수 1 |
| JLDFIL51200 | 244 | 2,574 | jQuery 48, 원시 DOM 28, [sdd] console(회신) 4, 미정의 as-is 공통(fn_) 2, TODO(회신) 1, innerHTML(attrReals __html 실현) 1 |
| JLDINF92500 | 235 | 974 | jQuery 38, TODO(병합) 32, TODO(규칙19) 19, 미정의 as-is 공통(fn_) 4, 폼 DOM 1, 원시 DOM 1, 긴 함수 1, TODO(회신) 1 |
| JLDINF92010 | 225 | 1,096 | jQuery 66, 미정의 as-is 공통(fn_) 8, 폼 DOM 1, 원시 DOM 1, 긴 함수 1, TODO(회신) 1 |
| JLDDST60100 | 224 | 1,145 | 원시 DOM 58, jQuery 16, TODO(회신) 1 |
| JLDINF11100 | 214 | 1,272 | jQuery 56, 원시 DOM 5, 미정의 as-is 공통(fn_) 6, 긴 함수 3, 폼 DOM 2, TODO(회신) 2 |
| JLDFIL35700C | 209 | 4,366 | jQuery 49, 원시 DOM 9, 긴 함수 5, [sdd] console(회신) 6, TODO(회신) 2, TODO(규칙19) 2 |
| JLDFIL35700_POP | 209 | 4,359 | jQuery 49, 원시 DOM 9, 긴 함수 5, [sdd] console(회신) 6, TODO(회신) 2, TODO(규칙19) 2 |
| JLDINF91810 | 206 | 1,001 | jQuery 62, 미정의 as-is 공통(fn_) 6, 폼 DOM 1, 긴 함수 1, TODO(회신) 1 |
| JLDINF10800 | 203 | 943 | jQuery 47, 원시 DOM 8, 미정의 as-is 공통(fn_) 7, 폼 DOM 3, 긴 함수 2, TODO(회신) 3, eval 1 |
| JLDINF10400 | 200 | 1,421 | jQuery 46, 미정의 as-is 공통(fn_) 8, 원시 DOM 5, 타이머 4, 긴 함수 3, 폼 DOM 2, TODO(회신) 2 |
| JLDSTF70010 | 195 | 1,550 | TODO(병합) 44, jQuery 19, TODO(규칙19) 19, TODO(회신) 5, 미정의 as-is 공통(fn_) 1 |
| JLDINF11200 | 194 | 1,039 | jQuery 49, 원시 DOM 6, 미정의 as-is 공통(fn_) 5, 긴 함수 3, 폼 DOM 2, TODO(회신) 2 |
| JLDINF91910 | 194 | 1,131 | jQuery 57, 미정의 as-is 공통(fn_) 6, 폼 DOM 1, 원시 DOM 1, 긴 함수 1, TODO(회신) 1 |
| JLDODS17001 | 188 | 386 | jQuery 62, [sdd] console(회신) 1 |
| JLDINF10700 | 186 | 1,468 | jQuery 41, 미정의 as-is 공통(fn_) 10, 원시 DOM 5, 타이머 3, 긴 함수 3, 폼 DOM 2, TODO(회신) 2 |
| JLDFIL25101 | 181 | 765 | TODO(병합) 61, 원시 DOM 5, TODO(회신) 6, 미정의 as-is 공통(fn_) 5, jQuery 3, 긴 함수 3, TODO(규칙19) 1, innerHTML(attrReals __html 실현) 1 |
| JLDINF25200 | 164 | 724 | jQuery 46, 원시 DOM 4, 폼 DOM 2, 미정의 as-is 공통(fn_) 2, TODO(회신) 1, innerHTML(attrReals __html 실현) 1 |
| JLDINF00000 | 161 | 1,293 | 원시 DOM 37, 폼 DOM 9, TODO(회신) 6, location 이동 3, 미정의 as-is 공통(fn_) 1 |
| JLDODS27000 | 161 | 484 | jQuery 53, TODO(회신) 1 |
| JLDINF10102 | 155 | 503 | jQuery 30, 원시 DOM 16, [sdd] console(회신) 6, 긴 함수 1, TODO(회신) 1 |
| JLDBNF25700 | 152 | 714 | jQuery 35, 폼 DOM 10, 원시 DOM 4, innerHTML 1, 미정의 as-is 공통(fn_) 1 |
| JLDINF10105 | 149 | 634 | jQuery 44, 원시 DOM 2, [sdd] console(회신) 2, 미정의 as-is 공통(fn_) 2, 긴 함수 1 |

## 4. 다음 손작업 배치 제안 — 퍼블리싱 병합 화면(디자인 확정) 중 점수 순 (40)

> 병합 화면은 컴포넌트가 확정돼 B-7 처방(jQuery·폼 DOM 재작성)을 바로 적용할 수 있다. 손본 화면은 `publish_merge_overrides.json` 에 `frozen` 을 적어 보호한다.

| 순서 | 화면 | 점수 | 주된 편차 |
| ---: | --- | ---: | --- |
| 1 | JLDSTF31200 | 565 | TODO(병합) 278, TODO(회신) 2, 원시 DOM 1, innerHTML(attrReals __html 실현) 1 |
| 2 | JLDINF92500 | 235 | jQuery 38, TODO(병합) 32, TODO(규칙19) 19, 미정의 as-is 공통(fn_) 4, 폼 DOM 1, 원시 DOM 1, 긴 함수 1, TODO(회신) 1 |
| 3 | JLDSTF70010 | 195 | TODO(병합) 44, jQuery 19, TODO(규칙19) 19, TODO(회신) 5, 미정의 as-is 공통(fn_) 1 |
| 4 | JLDFIL25101 | 181 | TODO(병합) 61, 원시 DOM 5, TODO(회신) 6, 미정의 as-is 공통(fn_) 5, jQuery 3, 긴 함수 3, TODO(규칙19) 1, innerHTML(attrReals __html 실현) 1 |
| 5 | ULDMGT50002 | 140 | TODO(회신) 33, TODO(병합) 18, 원시 DOM 10, 폼 DOM 2, [sdd] console(회신) 1 |
| 6 | JLDFIL59410 | 125 | TODO(병합) 34, innerHTML 7, jQuery 3, 원시 DOM 2, TODO(규칙19) 3, [sdd] console(회신) 3, 긴 함수 1, TODO(회신) 1, innerHTML(attrReals |
| 7 | ULDMGT76101 | 125 | TODO(병합) 30, jQuery 9, TODO(규칙19) 9, [sdd] console(회신) 8, TODO(회신) 1, innerHTML(attrReals __html 실현) 1 |
| 8 | JLDFIL25113 | 120 | TODO(병합) 56, location 이동 1, 긴 함수 1, [sdd] console(회신) 1 |
| 9 | JLDSTF71000 | 119 | TODO(병합) 26, jQuery 13, TODO(규칙19) 13, TODO(회신) 1 |
| 10 | ULDMGT50316 | 118 | TODO(병합) 32, 원시 DOM 14, TODO(회신) 4, [sdd] console(회신) 2 |
| 11 | JLDFIL22110 | 111 | jQuery 19, TODO(규칙19) 19, 원시 DOM 2, TODO(병합) 3, [sdd] console(회신) 1, innerHTML(attrReals __html 실현) 1 |
| 12 | JLDFIL11060 | 104 | jQuery 15, TODO(규칙19) 14, TODO(병합) 9, 타이머 2, 원시 DOM 1, [sdd] console(회신) 1, innerHTML(attrReals __html 실현) 1 |
| 13 | JLDFIL40203 | 103 | TODO(병합) 43, 긴 함수 2, TODO(회신) 3, 원시 DOM 1, innerHTML(attrReals __html 실현) 1 |
| 14 | JLDFIL11010 | 99 | jQuery 13, TODO(규칙19) 13, 원시 DOM 4, TODO(병합) 6, TODO(회신) 3, [sdd] console(회신) 1, innerHTML(attrReals __html 실현) 1 |
| 15 | JLDFIL25107 | 99 | TODO(병합) 46, 긴 함수 1, TODO(회신) 1, innerHTML(attrReals __html 실현) 1 |
| 16 | JLDSTF75100 | 99 | TODO(병합) 35, jQuery 5, TODO(규칙19) 5, TODO(회신) 1, [sdd] console(회신) 1 |
| 17 | JLDFIL20300 | 96 | TODO(병합) 48 |
| 18 | JLDFIL00000 | 94 | 원시 DOM 13, TODO(병합) 12, TODO(회신) 4, [sdd] console(회신) 4, 긴 함수 2, 미정의 as-is 공통(fn_) 2, location 이동 1, innerHTML(attrReals |
| 19 | JLDFIL25910 | 91 | jQuery 14, TODO(규칙19) 14, TODO(병합) 6, 긴 함수 1, TODO(회신) 1, [sdd] console(회신) 1, innerHTML(attrReals __html 실현) 1 |
| 20 | JLDFIL35700 | 84 | TODO(병합) 42 |
| 21 | JLDFIL25104 | 78 | TODO(병합) 36, location 이동 1, 긴 함수 1 |
| 22 | JLDFIL45501 | 74 | TODO(병합) 37 |
| 23 | ULDMGT76100 | 73 | TODO(병합) 16, jQuery 5, TODO(규칙19) 5, 원시 DOM 2, TODO(회신) 3, [sdd] console(회신) 2 |
| 24 | JLDFIL30201 | 69 | TODO(병합) 23, jQuery 4, TODO(규칙19) 4, 긴 함수 1 |
| 25 | JLDFIL30301 | 69 | TODO(병합) 23, jQuery 4, TODO(규칙19) 4, 긴 함수 1 |
| 26 | JLDFIL00001 | 66 | TODO(병합) 14, 원시 DOM 4, [sdd] console(회신) 4, TODO(회신) 3, 미정의 as-is 공통(fn_) 2, location 이동 1, 긴 함수 1, innerHTML(attrReals  |
| 27 | JLDFIL25102 | 66 | TODO(병합) 30, location 이동 1, 긴 함수 1 |
| 28 | JLDFIL17301 | 63 | TODO(병합) 15, 원시 DOM 5, [sdd] console(회신) 4, innerHTML 1, 긴 함수 1, TODO(회신) 1, 미정의 as-is 공통(fn_) 1 |
| 29 | JLDSTF30100 | 61 | [sdd] console(회신) 8, 원시 DOM 4, TODO(회신) 5, innerHTML 3, TODO(병합) 4, 긴 함수 2 |
| 30 | JLDFIL00010 | 54 | TODO(병합) 16, 원시 DOM 3, TODO(회신) 3, innerHTML 1, TODO(규칙19) 1, 미정의 as-is 공통(fn_) 1 |
| 31 | JLDFIL25111 | 54 | TODO(병합) 24, location 이동 1, 긴 함수 1 |
| 32 | JLDFIL16200 | 53 | 원시 DOM 12, TODO(병합) 4, 긴 함수 1, TODO(회신) 1, [sdd] console(회신) 1, innerHTML(attrReals __html 실현) 1 |
| 33 | JLDSTF76200 | 53 | jQuery 9, TODO(규칙19) 8, TODO(회신) 3, TODO(병합) 2 |
| 34 | JLDFIL16404N | 52 | TODO(병합) 19, 원시 DOM 4, TODO(회신) 1 |
| 35 | JLDODS20010 | 52 | TODO(병합) 21, jQuery 2, TODO(규칙19) 2 |
| 36 | JLDODS20000 | 50 | jQuery 7, TODO(규칙19) 7, TODO(병합) 6, 타이머 1 |
| 37 | JLDFIL40201 | 48 | TODO(병합) 15, innerHTML 2, TODO(회신) 3, 원시 DOM 1, 긴 함수 1 |
| 38 | JLDFIL70101 | 48 | [sdd] console(회신) 20, TODO(병합) 4 |
| 39 | JLDSTF30110 | 47 | 원시 DOM 4, TODO(병합) 6, TODO(회신) 5, [sdd] console(회신) 5, 긴 함수 1 |
| 40 | JLDFIL30602 | 46 | TODO(병합) 10, 원시 DOM 5, [sdd] console(회신) 4, 긴 함수 1 |

