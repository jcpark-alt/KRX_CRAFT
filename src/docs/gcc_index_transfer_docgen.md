# gcc 공통이관 매핑 문서(index_transfer.html) 생성 규칙

`src/docs/api/gcc/index_transfer.html`(레거시 AS-IS → gcc 표준 TO-BE `$c.*` 함수 이관 매핑 통합 가이드)의 **생성 규칙**이다.
이 HTML은 손으로 편집하지 않는다 — 아래 명령으로 **모듈별 매핑 SOT에서 자동 생성**되며 매 실행 시 통째로 덮어써진다.

> API 명세서(`index.html`)의 생성 규칙은 [gcc_api_docgen.md](gcc_api_docgen.md) 참조. index_transfer 는 "무엇을 무엇으로 바꾸나(이관 맵)", index.html 은 "그 함수의 상세 시그니처"를 담당하며, TO-BE 클릭 시 `index.html` 의 해당 함수 앵커로 새 탭 이동한다.

## 1. 실행

```bash
npm run docs:transfer
# → python src/conversion/tools/gen_index_transfer.py
```

- 출력: `src/docs/api/gcc/index_transfer.html` **단일 파일**(CSS/JS 인라인, 외부 의존성 없음 → `file://` 로 열림).
- 생성기: `src/conversion/tools/gen_index_transfer.py` (+ 로더 `gcc_mapping.py`, 셸 템플릿 `index_transfer.template.html`).

## 2. 데이터 출처(SOT)

| 섹션 | SOT | 방식 |
| --- | --- | --- |
| **RAW**(파일별 AS-IS→TO-BE 매핑) | `src/docs/api/{fil,ins,mgt}/index_transfer.html` 의 `const DATA = [...]` 배열 | `gcc_mapping.load_mappings()` 로 3개 모듈을 읽어 **통합 → `(file, asis, tobe, desc, tag)` 기준 중복제거**. gcc 고유 항목은 없음(전량 모듈 파생). |
| **CONV_RULES**(객체/컴포넌트 단위 직접 치환 규칙 5건) | `gen_index_transfer.py` 의 `CONV_RULES` 상수 | conversion_rules.md 규칙 14·15 계열과 **수동 동기화**. 규칙을 늘리려면 이 상수를 편집. |

- 즉 **모듈별 `index_transfer.html`(fil/ins/mgt)이 1차 SOT**이고, gcc 통합본은 그 파생물이다. 매핑을 추가·수정하려면 해당 **모듈 파일의 `DATA`** 를 고친 뒤 재생성한다(gcc 통합본을 직접 고치지 않는다).
- 같은 로더(`gcc_mapping.py`)를 변환기(규칙 7 치환 사전)도 사용하므로, 문서와 변환기가 **동일한 매핑 출처**를 공유한다.

## 3. 생성 파이프라인

1. `gcc_mapping.load_mappings(("fil","ins","mgt"))` → 각 모듈 `DATA` 파싱(항목: `file, asis_raw, tobe, desc, tag`).
2. `(file, asis, tobe, desc, tag)` 로 중복제거 → RAW 배열.
3. `RAW` 와 `CONV_RULES` 를 각각 JS(=JSON, 한글 보존) 리터럴로 직렬화.
4. 셸 템플릿 `index_transfer.template.html` 의 플레이스홀더 `/*__RAW__*/` · `/*__CONV_RULES__*/` 에 주입 → 최종 HTML.
   - 템플릿의 CSS/사이드바/검색/앵커(`toAnchor`: `$c.<ns>.<fn>` → `m-<ns>-<fn>`, 와일드카드는 `mod-<ns>`) 렌더 JS 는 그대로 유지된다. 디자인 변경은 템플릿을 편집.

## 4. 재생성이 필요한 때

- `src/docs/api/{fil,ins,mgt}/index_transfer.html` 의 `DATA` 를 추가/수정했을 때.
- `gen_index_transfer.py` 의 `CONV_RULES` 를 바꿨을 때.
- 페이지 디자인(`index_transfer.template.html`)을 손봤을 때.

재생성은 **멱등**이다(입력이 같으면 출력 동일). 생성물은 커밋 대상이며, 손으로 편집하지 말고 위 SOT를 고친 뒤 `npm run docs:transfer` 로 갱신한다.
