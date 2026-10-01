# jsp-front — KRX 상장공시 제출시스템(JSP) 전환 작업 폴더

JSP 원본 화면을 WebSquare 로 옮기는 작업의 두 갈래가 한 폴더에 있다.

| 폴더 | 무엇 | 상태 |
|---|---|---|
| `ui/` | **공급사 13차 최종 전달본(2026-09-30, `16bf420e194` · `dep20260930_095541`)의 원본** — `jld*`/`uld*` 접두 화면 1,677본. 내용 무수정(반입 커밋 그대로) | 원본. **손대지 않는다** |
| `ui-tobe/` | `ui/` 를 우리 규칙(퍼블리싱·conversion·code convention)으로 전환한 산출 | 0단계 완료 시점엔 비어 있음 |
| `r13/` | 공급사 전달 문서 — `README.md`(13차 안내서) · `MD5SUMS.txt` · `_meta/`(치환 대응표 `krx-tobe.yaml`, `fn_*` 재고, 규약 계수표, forward 판별표) | 참고 자료 |
| `krx_소스전환/` | 2026-09 초 공급사 자동 산출 33화면(옛 판) | 역사. 정비 기준 비교용 |
| `jsp_소스전환/` | 위 31화면을 우리가 손으로 정비한 **정비본 + 화면별 수정가이드 + conversion-report** | **파일럿 정답지** |

전달본에서 뺀 것(2,216 → 1,677): `pop*`·`sub*`·`menu*`·`top*`·`login*` 등 셸·팝업 조각 539본과 `_commons/` 공용 자산 8본
(공급사 gcc 번들은 우리 `cm/gcc` 의 2026-08-04 스냅샷 — 정본은 `cm/gcc`). 필요하면 원본 zip(`krx-prod-full-20260930-r13.zip`)에서 꺼낸다.

## 전환 규칙(이 폴더에 고정)

- **pcc 참조**: `jld*`·`uld*` 화면은 `cm/pcc/fil`, `uldmgt*` 는 `cm/pcc/mgt` 만 참조한다(사용자 지시 2026-09-21).
  pcc/fil 에 없는 `$c.lc`·`$c.frame`·`$c.cm.fn_*` 류는 gcc 치환 우선, 남는 것은 화면 로컬 헬퍼 + `// TODO Stage2:`.
  pcc/fil 반입은 보류 지시(2026-09-30)가 있어 사용자가 열기 전에는 하지 않는다. 도구 쪽 매핑은 `screen_tools.PCC_BY_PREFIX`.
- **공급사 "드러냄" 표지**(`[sdd]` 콘솔 · `throw { bizMessage }` · `unresolved:` 주석)는 결함이 아니라 전환 미완 자리의
  표식이다. 지우지 않고 `// TODO Stage2:` + `conversion/md/stage2_todo_worklist.md` 집계로 흡수한다.
- **원본 보존**: `ui/` 는 git 에 반입 커밋돼 있다. 전환은 반드시 `ui-tobe/` 에 쓴다(`convert_all.py jsp-front`).
  제자리 변환으로 원본 복구 수단을 잃었던 교훈(2026-09-22 fil 10화면)의 재발 방지.

## 파이프라인(계획 — 상세는 전환 계획서)

```
ui/*.xml ──convert_all.py(Stage 1)──▶ ui-tobe/*.xml
            └ publish_normalize.py(퍼블리싱, 1단계에서 신설)
            └ 공급사 산출 전용 후처리(fn_NullChk→isEmpty 등, 1단계에서 신설)
            └ screen_convention.py(jsdoc·await·reindent·unused·finalize)
            └ init_restructure.py(필요 화면만)
            └ convert.py 재실행(고정점 확인)
게이트: gate_screen.py · scan_mixed_compare.py · wsxml_lint(strict) · pytest conversion/tools
```

도구는 모두 `conversion/tools/` 에 있고 `python conversion/tools/<도구>.py` 로 실행한다(`--pcc` 생략 시 파일명 접두로 결정).

## 기준선(2026-10-01, `ui/` 1,677본)

| 잣대 | 값 |
|---|---|
| `wsxml_lint ui` (strict) | 1,677 files · **1,179 errors / 320 warnings** — errors 는 전부 **WS120**(gridView·dataList 안 중복 id, 162화면 — 규칙 27 대상). warnings: WS112 214 · WS113 101 · WS201 5 |
| `convert.py` 단건 dry-run(jldfil25900) | 78줄 변경(규칙 5a 3 · 규칙 13 1 · 규칙 2 3) — Stage 1 은 거의 고정점 |
| 공급사 확장 7종 호출 | `fieldEl` 239자리/33화면만 잔존, 나머지 6종 0 |
| `$c.cm.fn_*` | 909자리/56화면(`fn_NullChk` 516 · `fn_IsNumber` 228) |
| jQuery `$(` / `document.` / `var` | 517 / 883 / 499화면 |
| head `/_commons` script 참조 | 1,564화면(전부 제거 대상) |

## 이력

- 2026-09-07 `jsp_소스전환` 31화면 정비 종결(브라우저 확인까지). 2026-09-21 규칙 재적용 + 공급사 확장 7종·`$c.cm.fn_*` 9종 치환.
- 2026-10-01 r13 전달본 반입(`ui/`·`r13/`), `convert_all.py` 등록, 잡 tmp 도구 5종 `conversion/tools` 승격
  (`screen_tools` · `gate_screen` · `scan_mixed_compare` · `screen_convention` · `init_restructure`) — 0단계.
