# gcc API 문서 생성 규칙

`src/docs/api/gcc/index.html`(gcc 공통 라이브러리 API 문서)의 **생성 규칙**을 정리한 문서다.
이 HTML은 손으로 편집하지 않는다 — 아래 명령으로 **XML + JSDoc에서 자동 생성**되며, 매 실행 시 통째로 덮어써진다.

## 1. 실행

```bash
npm run docs:gcc
# → python -m wsxml_lint.docgen src/gcc -o src/docs/api/gcc --title "gcc API 문서"
```

- 입력: `src/gcc`의 모든 `.xml` 페이지.
- 출력: `src/docs/api/gcc/index.html` **단일 파일** (CSS/JS 인라인, 외부 의존성 없음 → `file://` 더블클릭으로 열림).
- 생성기 위치: `tools/wsxml_lint/wsxml_lint/docgen/`
  파이프라인 = **extractor**(파싱) → **model**(데이터 모델) → **render**(HTML).

> 함수가 문서에서 누락되면 먼저 `publicInfo` 등재 여부와 JSDoc 블록 위치를 의심할 것.
> 과거 `async function` 공개 메서드가 추출에서 누락된 버그가 있었다(현재는 수정됨).

---

## 2. 무엇이 문서화되는가 (extractor.py)

### 2-1. 대상 함수 — 공개 API만
- `<head>`의 `<w2:publicInfo method="scwin.a,scwin.b,...">`에 **등재된 `scwin.*` 함수만** 문서화한다.
- 정의돼 있어도 `publicInfo`에 없으면 제외 — 즉 `__` 내부 헬퍼, `@hidden Y` 함수는 문서에 나오지 않는다.
- → 문서에 함수를 노출하려면 **`publicInfo`에 반드시 추가**해야 한다(`wsxml_lint`의 WS201과 같은 규약).

### 2-2. 선언 매칭 규칙
- `/** ... */` JSDoc 블록 **바로 뒤**(공백/개행 허용)에 오는 선언만 대상:
  ```js
  scwin.<name> = function (args) { ... }
  scwin.<name> = async function (args) { ... }   // async도 인식
  ```
- JSDoc 블록에 선언이 붙지 않은 "고아 블록"은 건너뛴다.
- 정규식: `_ASSIGN_RE = /\s*scwin\.([A-Za-z0-9_$]+)\s*=\s*(?:async\s+)?function\s*\(([^)]*)\)/`

### 2-3. 모듈 메타데이터 (`<head>`에서 추출)
| 항목 | 소스 | 폴백 |
|------|------|------|
| 네임스페이스 | `meta_screenId` | 파일 stem으로 `$c.<stem>` |
| 제목 | `meta_screenName` | 파일 stem |
| 설명 | `meta_desc` | (없음) |
| 공개 목록 | `<w2:publicInfo method>` | (없으면 메서드 0개) |

- 모듈 정렬: **파일명(소문자) 기준** 오름차순.

---

## 3. JSDoc 파싱 규칙 (extractor.py)

- **태그 순서에 의존하지 않는다.** 블록을 `@tag` 단위 세그먼트로 토큰화하므로 `@returns`가 `@param` 사이에 껴 있어도 정상 처리된다.
- 한 태그의 값은 **다음 `@tag` 전까지 여러 줄**에 걸칠 수 있다. `' * '` 장식은 제거된다.
- 인식하는 태그:

| 태그 | 처리 |
|------|------|
| `@name` | 표시용 메서드명 (**선언명보다 우선**). 첫 토큰만 사용 |
| `@description` | 설명 (여러 개면 개행으로 합침) |
| `@param` | `{타입} 이름 설명` — 파라미터 표의 한 행 |
| `@returns` / `@return` | 반환. **첫 번째만** 사용 |
| `@example` | 예제 코드 (원본 개행/들여쓰기 보존) |
| `@exception` | 예외 |
| `@deprecated` | 존재 여부로 판단 (**설명이 비어도** deprecated로 취급) |

- 타입 `{...}`은 **중괄호 균형**으로 잘라낸다 → `{Promise<void>}`, `{a:b}` 같은 중첩/콜론 타입도 정상 파싱.

---

## 4. HTML 렌더링 규칙 (render.py)

### 4-1. 전체 구조
- **단일 자가완결 HTML**: `_CSS`, `_JS`를 전부 인라인 (외부 CDN·파일 없음).
- **2단 레이아웃**: 좌측 `aside.sidebar`(브랜드 + 검색창 + 네비) / 우측 `main.content`(모듈별 명세).
- 상단 요약: `{N}개 모듈 · {M}개 공개 메서드` (사이드바·본문 양쪽 표기).

### 4-2. 이스케이프 (중요)
- `_esc()` — 모든 텍스트를 `html.escape(quote=True)`로 이스케이프.
- `_multiline()` — 이스케이프 후 `\n` → `<br>` (설명·파라미터 설명·반환·예외에 적용).
- **`@example`만** `_esc` 후 `<pre class="example"><code>`에 담아 `white-space:pre`로 **원본 개행/들여쓰기 보존**.

### 4-3. 메서드 카드 출력 순서 (`_render_method`)
각 섹션은 **데이터가 있을 때만** 조건부 출력된다:

1. `<article class="method" id="m-{모듈}-{메서드}" data-search="이름+정규명+설명(소문자)">`
2. 시그니처 `<code class="sig">{네임스페이스}.{시그니처}</code>` + (deprecated면 배지)
3. deprecated 설명 있으면 `⚠` 경고문(`.dep-note`)
4. 설명(`.desc`)
5. 파라미터 표 — **타입 / 이름 / 설명** 3열
6. 반환 (`반환` 라벨)
7. 예외 (`예외` 라벨)
8. 예제 (`pre.example`)

> 앵커 ID 규칙: `m-{모듈이름}-{메서드이름}` (`_mid()`). 외부 문서에서 이 문서로 딥링크할 때 이 규칙을 따른다.

### 4-4. 모듈 섹션 (`_render_module`)
- 헤더: `{제목} <span class="ns">{네임스페이스}</span>`, `meta_desc`, `{파일명} · {N}개 메서드`.
- 메서드가 없으면 `note`("공개 메서드가 없습니다.")를 이탤릭으로 표시.

### 4-5. 사이드바 (`_render_sidebar`)
- 모듈별 접이식 그룹(`nav-mod`): 모듈 링크 + 카운트 뱃지(`cnt`) + 하위 메서드 `<ul>`.
- 기본 접힘(`display:none`), `.open` 클래스일 때만 펼침.

### 4-6. 인터랙션 (`_JS`)
- **초기 화면**: 첫 모듈만 표시(`showOnly(첫 모듈)`).
- **사이드바 클릭**: 해당 모듈만 표시하고 나머지 숨김. 메서드 링크면 해당 위치로 스크롤.
- **검색**: 모든 모듈을 가로질러 `data-search` 부분일치 메서드만 표시, 매칭 없는 모듈은 숨김. 검색어를 비우면 활성 모듈로 복귀.

---

## 5. 새 공개 함수를 문서에 반영하려면

1. 함수를 `scwin.<name> = function (...) {}` 형태로 정의하고 **바로 위에 JSDoc 블록**을 붙인다.
2. 그 파일 `<head>`의 `<w2:publicInfo method="...">`에 `scwin.<name>`을 추가한다.
3. `npm run lint:xml`로 WS201(선언 없이 등재) 등 정합성을 확인한다.
4. `npm run docs:gcc`를 실행해 `index.html`을 재생성한다.

> 관련 가이드: [gcc_xml_guide.md](gcc_xml_guide.md)(head 스켈레톤·JSDoc·publicInfo 규약), [DESIGN.md](DESIGN.md)(문서 페이지 디자인 시스템).
