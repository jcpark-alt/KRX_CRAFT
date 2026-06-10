# DESIGN.md — 도구 페이지 디자인 가이드

`src/docs/` 아래 단일 HTML 도구(현재: `data-generator/data-generator.html`)에 적용된 **디자인 시스템(색상·타이포·레이아웃·컴포넌트)** 을 정리한다. 새 도구 페이지를 만들 때 이 토큰과 패턴을 재사용해 일관된 룩앤필을 유지한다.

> 기준 구현: `src/docs/data-generator/data-generator.html` (Vanilla CSS/JS, 외부 라이브러리·CDN 의존성 0).

---

## 1. 디자인 원칙

- **Clean / Slate**: 밝은 슬레이트 배경 위 흰 카드, 한 가지 강조색(blue)만 사용해 시선을 분산하지 않는다.
- **무의존**: 프레임워크·아이콘 폰트·웹폰트 없이 시스템 폰트와 순수 CSS 로만 구성(오프라인·`file://` 에서 그대로 동작).
- **입력 → 결과 2분할**: 좌측 입력 / 우측 결과 카드의 대시보드 레이아웃. 결과 영역을 넓게 배분한다.
- **즉각 피드백**: 액션 결과는 Toast 로 알리고, 결과 영역 높이는 데이터에 맞춰 자동 조정한다.

---

## 2. 색상 팔레트 (토큰)

| 역할 | 값 | 사용처 |
| :--- | :--- | :--- |
| 페이지 배경 | `#f0f4f8` | `body` |
| 카드 배경 | `#ffffff` | `.card` |
| 본문 텍스트 | `#1f2933` | `body` |
| 제목(강) | `#243b53` | `.card h2`, toast |
| 제목(중)·라벨 | `#486581` | `.field label`, `.desc` |
| 보조 텍스트 | `#627d98` | 설명, hint base |
| 옅은 보조 | `#7b8794` / `#9aa5b1` | meta, hint |
| 보더(연) | `#e4e7eb` | 카드·구분선 |
| 보더(입력) | `#cbd2d9` | input/textarea/radio |
| **Primary** | `#2563eb` (hover `#1d4ed8`) | 주 버튼, prefix, 강조 |
| Primary 옅음 | `#eef2f7` (hover `#dde5ee`) | ghost 버튼, prefix 배경 |
| 결과 영역(다크) | bg `#0f172a` · text `#e2e8f0` | `#result` Textarea |
| Toast | bg `#102a43` · text `#fff` | 안내 메시지 |
| 에러 | `#b91c1c` | 에러 Toast/메시지 |
| 강조(주황) | `#b45309` | (확장용) AS-IS 등 대비 강조 |

---

## 3. 타이포그래피

- **폰트 스택**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif` (한글 = 맑은 고딕).
- **모노스페이스**(코드·입력/결과): `Consolas, 'D2Coding', monospace`.
- **크기**: 페이지 타이틀 `20px` · 카드 제목 `14px` · 라벨 `12px/700` · 본문/입력 `13px` · hint `11px`.
- **줄간격**: `1.5`.

---

## 4. 레이아웃 · 그리드

- **컨테이너** `.wrap`: `max-width: 1500px`, 가운데 정렬, `padding: 24px 20px 48px`.
- **그리드** `.grid`: `display:grid; grid-template-columns: minmax(0,1fr) minmax(0,916px); gap:20px; align-items:start;`
  - 좌측 **입력** = 유연(`1fr`), 우측 **결과** = 고정 `916px`.
  - 컨테이너 고정 폭에서 결과 폭을 늘리면 입력 폭이 그만큼 줄어든다.
- **반응형**: `@media (max-width:860px)` → `grid-template-columns: 1fr` (1열로 스택).

---

## 5. 컴포넌트

### 5.1 카드 `.card`
흰 배경 · `border:1px solid #e4e7eb` · `border-radius:10px` · `padding:18px`. 카드 제목 `h2` 는 `14px`, 색 `#243b53`.

### 5.2 필드 `.field`
라벨(블록, `12px/700`, `#486581`) + 컨트롤. 하단 `margin-bottom:16px`.

### 5.3 라디오 그룹 `.radios`
가로 균등(`flex:1`) 버튼형 라벨. 보더 `#cbd2d9` · `border-radius:8px` · hover 시 `#f7f9fc`. `accent-color:#2563eb`.

### 5.4 ID 입력 `.id-row` (Prefix 결합형)
좌측 고정 prefix 박스(`.prefix`, 배경 `#eef2f7`, 글자 `#2563eb/700`, 모노) + 우측 입력. 모서리: prefix `8px 0 0 8px`, input `0 8px 8px 0` 로 하나의 캡슐처럼 결합. 하단 `.hint` 에 최종 ID 표기.

### 5.5 입력/결과 Textarea
- 공통: `border:1px solid #cbd2d9; border-radius:8px; padding:11px; resize:vertical;` 모노스페이스 `13px`.
- 입력 `#srcText`: `min-height:280px`.
- 결과 `#result`: **다크 테마**(bg `#0f172a`, text `#e2e8f0`), `readonly`. 높이는 JS 로 자동 조정(§6).

### 5.6 버튼 `.btn`
공통 `border-radius:8px; padding:10px 18px; font-size:13px; font-weight:700;`
- `.btn-primary`: 배경 `#2563eb`(hover `#1d4ed8`), 흰 글자, 입력 카드에서 full-width.
- `.btn-ghost`: 배경 `#eef2f7`(hover `#dde5ee`), 글자 `#243b53` — 보조 액션(Copy).

### 5.7 Toast `.toast`
화면 하단 중앙 고정 캡슐(`border-radius:24px`). 기본 `#102a43`, 에러 시 `#b91c1c`. `.show` 클래스로 페이드+슬라이드 인, ~1.8s 후 자동 소멸.

### 5.8 접이식 안내 `details`
보조 설명(지원 타입 매핑 등). `summary` 클릭 토글, 내부 `pre` 는 `#f7f9fc` 배경 코드블록.

---

## 6. 인터랙션 패턴

- **결과 높이 자동 조정**: 생성 시 `height:auto` 로 리셋 후 `scrollHeight` 로 설정해 데이터 양에 맞춰 늘어난다.
- **카드 높이 동기화**: 결과 카드(section) 전체 높이를 입력 카드 높이와 일치시킨다 — 결과 Textarea 의 `min-height = inputCard.offsetHeight − (헤더+meta+패딩)`. 로드·생성·리사이즈·입력 변경 시 재계산.
- **클립보드 복사**: `navigator.clipboard.writeText` → 실패 시 `execCommand('copy')` 폴백(비보안 컨텍스트/`file://` 대응). 성공/실패를 Toast 로 안내.
- **실시간 Prefix/최종 ID**: 타입 라디오·ID 입력 변경 시 prefix(`dma_`/`dlt_`)와 최종 ID 표기를 즉시 갱신.

---

## 7. 새 도구 페이지 체크리스트

- [ ] 외부 의존성 없이 단일 HTML(인라인 CSS/JS)로 작성 — `file://` 에서 동작.
- [ ] §2 색상 토큰 · §3 폰트 스택 재사용(강조색은 `#2563eb` 하나).
- [ ] `.wrap`(max-width) + `.grid`(입력/결과 2분할) + `@media ≤860px` 1열 반응형.
- [ ] 카드/버튼/Textarea 등 §5 컴포넌트 스타일 일관 적용.
- [ ] 액션 피드백은 Toast, 결과 영역은 데이터에 맞춘 높이.
- [ ] XML/HTML 출력 시 특수문자 이스케이프(`& < > " '`).
