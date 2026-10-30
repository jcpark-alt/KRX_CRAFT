# API.md 생성기 (`api-md-generator.html`)

브라우저로 저장한 **RapiDoc API 문서 HTML** 에서 고른 API 의 요청·응답 표를 읽어, conversion-front 전환에 쓰는
`{화면ID}_API.md`(형식: `conversion/conversion-front/ui/completed/*/…_API.md`)를 만드는 단일 HTML 도구다.
외부 의존 없이 `file://` 로 연다. 디자인은 [../DESIGN.md](../DESIGN.md).

## 왜 저장 HTML 인가

API 문서(`https://…/api/listing/rapidoc`)는 OpenAPI JSON(`/api/listing/v3/api-docs`)을 받아 그리는 RapiDoc 페이지지만,
그 JSON 은 받을 수 없다. 대신 문서 화면의 「REQUEST / RESPONSE → OBJECT 아래 DTO 표」를 그대로 저장한
HTML(「다른 이름으로 저장 — 웹페이지, 전체」)을 입력으로 쓴다. 저장본은 100MB 를 넘을 수 있고 내부 서버 주소가
들어 있으므로 **저장소에 커밋하지 않는다**.

## 사용법

1. **파일 선택** — 저장한 RapiDoc HTML(서비스가 다르면 여러 개). 읽은 뒤 「API n개 인식」이 뜬다.
2. **대상 API** — 한 줄에 하나. 섞어 적어도 된다.
   - 문서 URL — `https://…/rapidoc#get-/api/…` (# 뒤 앵커만 쓰므로 문서 주소가 항목마다 달라도 된다)
   - `GET /api/…` · `get-/api/…` · 경로만 `/api/…`(그 경로의 method 전부)
   - 화면ID — `ULDSTF08031` (API 제목 앞 `[ULDSTF08031]` 에 그 화면ID 가 든 API 전부, `[A/B]` 묶음·`[A/08032_new]` 숫자 꼬리·`[A~B]` 범위 인식)
   - 「문서 안에서 찾기」로 요약·경로를 검색해 클릭으로 추가할 수 있다.
3. **API.md 생성** → 결과를 확인·수정한 뒤 **복사** 또는 **다운로드**(`{화면ID…}_API.md`).

## 생성 규칙 (손으로 쓴 공용 명세와 같은 규칙)

| 항목 | 규칙 |
|---|---|
| 블록 머리 | `## n. {API 제목}` — 화면이 둘 이상이면 `## 0.` 머리글에 화면ID 목록 |
| AS-IS | API 설명 전체 (설명에 `AS-IS fn_xxx` 가 없으면 경고 — 직접 적어 넣는다) |
| TO-BE | `{METHOD} {경로}` |
| id | 경로 끝 단어에서 `select-` 를 떼고 camelCase (`select-list-releas-isu` → `listReleasIsu`, `select-one` → `detail`). 응답 object → `dma_`, array → `dlt_`. 하위 object/array 필드 → `{이름}{필드}` + target `…=body.{필드}`. 요청 본문이 있는 API 의 응답은 `{이름}Result` |
| dataType | integer·number → `number`, 그 밖 → `text` |
| name | 필드 설명 (`➔`·`Constraints`·`Examples`·하위 스키마 제목은 뺀다) |
| GET 쿼리 | `const requestData = { 파라미터: "" }` |
| POST 본문 | 평면 → 요청 dataMap + `ref`. 하위 구조가 있으면 dataMap/dataList 여러 개 + `requestData` 조합(`.getJSON()`·`.getAllJSON()`·`[]`) |

id 는 규칙으로 제안한 이름이다. 화면에서 다른 이름(`dlt_list`·`dma_detail` 등)을 쓰면 결과에서 고친다.
배열 행 안의 하위 목록은 target 으로 바로 적재할 수 없어 주석과 함께 구조만 싣는다.

## 검증 기록 (2026-10-30)

저장본(API 1,322개)으로 conversion-front `completed/` 화면의 API 202건을 다시 생성해 손작업 API.md 와 대조했다.
- api_spec_check 파서가 202블록 모두 인식, xml 블록 277개 모두 올바른 XML, javascript 블록 204개 `node --check` 통과.
- 키 구성 일치 66/158 블록. 나머지 차이는 손작업 쪽 사정이다 — POST 응답·요청 본문 생략, 문서 갱신 뒤 추가된 키,
  RapiDoc 표를 복사해 붙이며 들어간 `Constraints: …`·`bzProcsNo *` 같은 잔재, 손으로 바꾼 id. 생성기가 놓친 키는 없었다.
- 저장본에 없는 서비스(`/api/bonds`·`/api/discls`)와 문서상 다른 화면ID 로 등록된 API 는 화면ID 로 고르면 빠진다 — 그런 API 는 경로로 적는다.
