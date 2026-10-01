# KRX `convert.py` dry-run 절차 — 우리 산출의 「기계 규칙 적용분」 재기

> 목적: 박지철(KRX) 의 기계 변환기 `convert.py` 를 우리 산출물에 **읽기 전용으로** 돌려
> 「그쪽 기계 규칙이 아직 바꿀 것이 남았는가」를 줄 수로 잰다. 0 이면 우리 산출은
> 그쪽 기계 규칙의 고정점(fixed point)이고, 0 이 아니면 그 줄이 곧 1차 전달의 지적거리다.
> 잰 판: sdd-system `b1bd5dffe0bf3f6b25df7a5ac9ff73000a0ae162` (2026-09-27) ·
> KRX 번들 `~/Downloads/krx-0922-박지철/` (src.zip 전개본, 2026-09-27 08:19)

---

## 1. 그쪽 도구 사용법 (실측)

```
python convert.py <src.xml> [out.xml] [--profile screen|lib]
```

- 위치: `~/Downloads/krx-0922-박지철/src/conversion/tools/convert.py` (131KB)
- 입력: WebSquare XML 1본. HEAD / SCRIPT(CDATA) / BODY 3영역으로 가르고 SCRIPT 에만
  결정적 규칙을 적용한다(문자열·주석·정규식 리터럴 보호).
- **부작용**: `out.xml` 을 쓴다. **`out` 을 생략하면 `<src>.converted.xml` 을 `src` 옆에 쓴다** —
  원본 디렉터리를 더럽히므로 dry-run 에서는 `out` 을 반드시 명시하고, 입력도 사본으로 쓴다.
  그 밖의 쓰기는 없다(리포트는 stdout).
- 프로파일: `screen`(기본) / `lib`. 화면 XML 은 `screen`.
- 적용 규칙(결정적): 1 vScrenID 삭제 · 2 전역변수 이동 · 3 `ev:on*` 소문자화 ·
  4 함수 재정렬 · 5a `==`→`===` · 5b `.value=`→`setValue()` · 5c `.src=`→`setBackgroundImage()` ·
  5d `getTotalRow`→`getRowCount` · 5e `!X === Y` 우선순위 · 7/7m/7n 레거시→gcc ·
  8 `var`→`const`/`let` · 12 Submission→`executeDynamic` · 13 `scwin.fn_*` camelCase ·
  14·15·17·23·25·26·27·28·30·31 + 포매팅(함수 사이 빈 줄 1개, 주석 컬럼 0 정렬, `//` 뒤 공백).
- 판단 필요 항목은 stdout 의 `==== [단계2 입력] ====` 절로 분리된다(파일은 안 바꾼다).

### 1.1 ⚠ 막힌 지점 — gcc 매핑 경로가 이 배포 레이아웃과 어긋난다

`gcc_mapping.py` 는 매핑 원천을 `<파일>/../../../cm/docs/api/<모듈>/index_transfer.html`
(= 번들의 `src/cm/docs/api/…`) 에서 찾는다. 그런데 번들은 그 내용을 `src/docs/api/…` 에 둔다
(`src` 가 그쪽 저장소의 `cm` 에 해당). 경로가 없으면 `path.exists()` 검사에 걸려
**조용히 건너뛴다** — 오류도, 경고도 없다. 실측:

```
원본 위치에서 : substitution_dict 0   · module_fn_dict 0     ← 규칙 7/7n 이 무증상으로 꺼진다
시밍 후       : substitution_dict 157 · module_fn_dict 0
```

그래서 **시밍 없이 돌린 dry-run 은 규칙 7 을 안 센 값**이다. 아래 절차는 시밍을 포함한다.
`module_fn_dict` 는 시밍 후에도 0 — 원천 `cm/as-is/{fil,ins,mgt,stf}/gcc/*.xml` 이 번들에
아예 없다. 따라서 **규칙 7n(모듈 네임스페이스 레거시명 정규화)은 이 번들로 잴 수 없다.**
그쪽에 물어야 할 항목이다.

---

## 2. 절차

### 2.1 시밍 (원본 디렉터리 무접촉)

```zsh
B=~/Downloads/krx-0922-박지철/src
SP=<스크래치패드>          # 예: /private/tmp/claude-501/<세션>/scratchpad
rm -rf "$SP/shim"; mkdir -p "$SP/shim/conversion/tools" "$SP/shim/cm"
cp "$B/conversion/tools/convert.py" "$B/conversion/tools/gcc_mapping.py" "$SP/shim/conversion/tools/"
ln -s "$B/docs" "$SP/shim/cm/docs"     # cm/docs/api/<모듈>/index_transfer.html 가 보이게
```

시밍이 실제로 먹었는지 «값으로» 확인한다(0 → 157 이어야 한다):

```zsh
python3 -c "import sys; sys.path.insert(0,'$SP/shim/conversion/tools'); import gcc_mapping as g; print(len(g.substitution_dict()), len(g.module_fn_dict()))"
# 기대: 157 0
```

### 2.2 표본 복사 후 실행

```zsh
D="$SP/convert-dryrun"; rm -rf "$D"; mkdir -p "$D/in" "$D/out" "$D/log"
for s in jldfil35700c jldfil59410 jldinf20000 jldfil25910 jldfil52100; do
  cp "samples/krx-tobe/$s/websquare/$s.xml" "$D/in/$s.xml"
done
for s in jldfil35700c jldfil59410 jldinf20000 jldfil25910 jldfil52100; do
  python3 "$SP/shim/conversion/tools/convert.py" "$D/in/$s.xml" "$D/out/$s.xml" > "$D/log/$s.log" 2>&1
  echo "[$s] exit=$? diff줄=$(diff "$D/in/$s.xml" "$D/out/$s.xml" | grep -c '^[<>]')"
done
```

### 2.3 판정

- **판정식**: `diff in/<s>.xml out/<s>.xml` 의 `^[<>]` 줄 수 = 「기계 규칙 적용분」.
  **0 이면 고정점** — 그쪽 기계 패스가 더 바꿀 것이 없다.
- 0 이 아니면 규칙별로 가른다: stdout 리포트의 `규칙N … : M 건` 줄(0 건은 뺀다) +
  diff 의 치환 쌍을 패턴으로 분류한다(§3 표).
- **멱등 확인**: 산출을 다시 넣어 2회차 diff 가 0 인지 본다. 0 이 아니면 그쪽 변환기가
  수렴하지 않는 것이므로 그쪽 건이다.

### 2.4 주의

- 원본 번들 디렉터리는 읽기만 한다. `out` 을 생략하면 원본 옆에 쓰므로 **항상 명시**한다.
- `--profile lib` 은 공통 라이브러리 XML 용이다. 화면에 쓰면 규칙 적용 폭이 달라진다.
- diff 줄 수는 **포매팅(빈 줄·주석 정렬)까지 포함**한다. 「규약 위반이 몇 건인가」와 같은 수가
  아니다. 빈 줄만 걷힌 것과 코드가 바뀐 것을 반드시 갈라 보고한다(§3).
- 규칙 4 재정렬·규칙 2 전역변수 이동은 «이동»이라 diff 에 삭제+삽입 두 벌로 나타난다.
  줄 수만 세면 실제 변경보다 크게 보인다.
- 시밍 검증(0→157)을 건너뛰면 규칙 7 이 무증상으로 빠진 값을 낸다.

---

## 3. 결과 (2026-09-27 실측)

### 3.1 표본 5본과 고른 근거

그쪽 31본과 **화면 id 가 겹치는** 29본 가운데, 규칙 밀도(함수 수·`var`·200자 초과)가
가장 높은 5본을 골랐다. 겹치는 화면이라야 그쪽 정비본과 같은 잣대로 맞대 볼 수 있고,
밀도가 높은 쪽이라야 「기계 규칙이 남았는가」를 가장 크게 드러낸다.

| 표본 | 근거 |
|------|------|
| `jldfil35700c` | 겹침 최대 규모(그쪽 함수 194·`var` 25·200자 21) — 기계 규칙 여지 최대 |
| `jldfil59410`  | 겹침. 그쪽 §7.2 B 그룹 8종을 쓰던 화면, 200자 초과 최다급(28) |
| `jldinf20000`  | 겹침. 페이징 DOM 재설계 보류 유형 + 규칙 7 치환이 실제로 걸리는 화면 |
| `jldfil25910`  | 겹침. form 제출·jQuery 잔존 최다(그쪽 §3), 규칙 13 `fn_*` 대상 |
| `jldfil52100`  | 겹침. 규칙 5b(`.value=`) 보류 유형의 원산지 |

### 3.2 바뀐 줄 — **0 이 아니다**

| 표본 | 줄 수 | 바뀐 줄 (−/+) | 2회차(멱등) |
|------|-------|---------------|-------------|
| `jldfil35700c` | 6,423 → 6,381 | −129 / +87 | 0 ✅ |
| `jldfil59410`  | 3,633 → 3,589 | −72 / +28  | 0 ✅ |
| `jldinf20000`  | 2,071 → 2,058 | −40 / +27  | 0 ✅ |
| `jldfil25910`  | 1,433 → 1,412 | −37 / +16  | 0 ✅ |
| `jldfil52100`  | 1,296 → 1,278 | −32 / +14  | 0 ✅ |
| **합계** | | **−310 / +172 (482줄)** | |

재현: `diff "$D/in/<s>.xml" "$D/out/<s>.xml" | grep -c '^[<>]'`

### 3.3 규칙별 목록 — 무엇이 몇 줄을 바꿨나

| 규칙 | 35700c | 59410 | inf20000 | 25910 | 52100 | 계 |
|------|--------|-------|----------|-------|-------|-----|
| 5a `==`/`!=` → `===`/`!==` | 5 | 14 | 28 | 11 | 12 | **70** |
| 8 `var` → `let` (const 0) | 25 | 2 | 3 | 0 | 0 | **30** |
| 5b `.value=` → `setValue()` | 7 | 2 | 0 | 0 | 3 | **12** |
| 2 전역변수 2구역 이동 | 3(보류 19) | 5(보류 2) | 4 | 4(보류 2) | 3 | **19** |
| 26 진입점 `try/catch`+`handleError` | 0 | 2 | 0 | 0 | 0 | **2** |
| 7 레거시 → gcc (`fnLeg`→`$c.str.lpad`) | 1 | 0 | 2 | 0 | 0 | **3** |
| 13 `scwin.fn_*` → camelCase | 0 | 0 | 0 | 1 | 0 | **1** |
| 5d `getTotalRow()` → `getRowCount()` | 0 | 1 | 0 | 0 | 0 | **1** |
| 4 재정렬 | init 1·event 158·callback 2·일반 34 | 보류 | 보류 | 보류 | 보류 | — |

※ 규칙 4 는 35700c 에서만 적용되고 나머지 4본은 「함수 사이/뒤에 최상위 실행문 존재」로
보류된다. 적용된 35700c 도 재정렬 결과가 기존 순서와 거의 같아 diff 로는 거의 안 드러난다.

**diff 줄의 성격 분류**(표본 5 합계, 삭제·치환 초과분 203줄 기준):

| 성격 | 줄 | 비고 |
|------|-----|------|
| 빈 줄 | 150 | 포매팅(함수 사이 빈 줄 1개 규칙) — 규약 위반이 아니다 |
| JSDoc/블록 주석 | 29 | 규칙 2·4 가 함수를 옮길 때 주석 블록이 함께 이동 |
| `//` 주석 | 7 | 같은 이동 |
| 코드 | 17 | 규칙 2·4 의 실제 이동(예: `scwin.init_conds` 블록) |

→ **482줄 가운데 「그쪽 규칙이 우리 코드를 실제로 고친 것」은 규칙별 집계 138건**
(5a 70 · 8 30 · 2 19 · 5b 12 · 7 3 · 26 2 · 13 1 · 5d 1)이고, 나머지는 포매팅·이동이다.

### 3.4 단계 2(판단 필요) 리포트 건수

| 표본 | 건 | 항목 |
|------|-----|------|
| `jldfil35700c` | 2 | 규칙 7 검토/대체 태그 `$`→`$c.util.getComponent` · 암묵적 전역 루프변수 `i` → `let` 검토 |
| `jldfil59410`  | 3 | 규칙 4 보류(함수 사이/뒤 최상위 실행문) · 규칙 7 검토/대체 태그 `$` · 레거시 Gauce API `.setDisabled` |
| `jldinf20000`  | 2 | 규칙 4 보류 · 규칙 7 검토/대체 태그 `$` |
| `jldfil25910`  | 3 | 규칙 4 보류 · 규칙 7 검토/대체 태그 `$` · 암묵적 전역 루프변수 `i` |
| `jldfil52100`  | 1 | 규칙 4 보류 |

되돌아오는 유형은 셋뿐이다: **규칙 4 보류(4본)** · **규칙 7 `$` 검토 태그(4본)** ·
**암묵적 전역 루프변수 `i`(2본)**. 앞 둘은 우리 산출 골격·gcc 치환 층 건이고,
`i` 는 방출 단계에서 `let i` 로 내면 사라진다.

### 3.5 읽는 법 — 무엇이 우리 몫인가

- **규칙 5a(70)·8(30)·5b(12)·5d(1)** 은 우리 생성기가 방출 단계에서 지키면 사라진다.
  특히 규칙 8 은 그쪽 변환기가 `var`→**`let`**(const 0)로 보내는 데 비해, 우리는
  `const` 기본이 이미 우세하다(전 산출 let 비율 0.104) — **남은 `var` 1,291건만 걷으면 된다**.
- **규칙 2(19)·4** 는 구역 배치 규약이다. 산출 골격 쪽 건이다.
- **규칙 7(3)** 은 gcc 치환. 시밍 없이는 무증상으로 0 이 되므로 잴 때 주의한다.
- 포매팅 빈 줄 150 은 그쪽이 `js-beautify`+자체 포매터로 맞추는 층이라,
  전달 전에 같은 포매팅을 우리가 걸면 diff 가 크게 줄어든다.

---

## 4. 못 잰 것

| 항목 | 이유 |
|------|------|
| 규칙 7n(모듈 네임스페이스 레거시명 정규화) | 원천 `cm/as-is/*/gcc/*.xml` 이 번들에 없음 → `module_fn_dict` 0. 그쪽에 원천 요청 필요 |
| 전 산출 2,217본 dry-run | 표본 5본만 쟀다. 1본당 약 1초이므로 전량도 가능하지만, 규칙별 성격은 5본에서 이미 갈렸다 |
| `--profile lib` 경로 | 화면 XML 만 쟀다 |

멱등은 표본 5본 전부 2회차 diff 0 — 그쪽 변환기는 수렴한다.

---

## 5. 같이 보는 것

- `tools/krx-tobe-cycle/krx-convention-gap-census.py` — 그쪽 §2·§7 잣대 계수기.
  이 dry-run 이 「기계 규칙이 바꿀 줄」을 재는 데 비해, 계수기는 「그쪽 규약 항목별 건수」를 잰다.
  `python3 tools/krx-tobe-cycle/krx-convention-gap-census.py --root samples/krx-tobe --glob '*/websquare/*.xml' --tsv krx-tobe/_meta/krx-convention-gap-census.tsv`
- `krx-tobe/_meta/krx-convention-gap-census.tsv` — 화면별·항목별 건수.
  **총계는 맨 아래 `# __TOTAL__` 주석 줄이다** — 데이터 행이 아니므로 열 합에 넣지 말 것
  (넣으면 정확히 2배가 된다. 2026-09-27 오보 사례: fn_ChkNumber 774→1,548).
- `krx-tobe/_meta/krx-cm-fn-inventory.tsv` — `$c.cm.fn_*` 호출 이름별 명세(28종·2,161건).
  `--fn-inventory <path>` 로 낸다. §7.2 표의 9종은 `group=B9`, 문서 목록 밖 19종은 `OUTSIDE`.
