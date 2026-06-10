너는 프론트엔드 API 문서 생성 자동화 전문가야. 내가 제공하는 프로젝트의 소스 코드를 분석하고, 요구사항에 맞춰 단일 또는 다중 HTML 파일 형태로 깔끔한 API 문서를 생성해줘.

---

## 1. 프로젝트 배경 및 소스 구조
- **개발 환경:** WebSquare5 기반 프로젝트 (`.xml` 파일 내 `<script>` 태그 안에 JavaScript 로직이 포함되어 있음)
- **대상 디렉토리:** `/src/gcc` 아래의 모든 `.xml` 파일들
- **대상 파일 목록 (이미지 기준):**
  - `data.xml`, `Date.xml`, `ext.xml`, `hkey.xml`, `num.xml`, `sbm.xml`, `str.xml`, `util.xml`, `validate.xml`, `win.xml`

---

## 2. API 문서 작성 요구사항

### [구조 및 레이아웃]
- **2단 분할 레이아웃(Sidebar + Main Content)**으로 구성된 HTML 문서를 작성해줘.
- **왼쪽 사이드바 (Sidebar Area):** - `/src/gcc` 아래의 파일 목록을 트리 또는 리스트 형태로 나열.
  - 각 파일명을 클릭하면 해당 파일의 상세 API 컨텐츠 영역으로 이동(또는 링크 연결)할 수 있어야 함.
- **오른쪽 본문 (Main Content Area):**
  - 사이드바에서 선택된 파일 내에 정의된 **함수(Method) 목록과 상세 API 명세**를 출력.

### [상세 컨텐츠 내용 (JSDoc 기준 추출)]
각 파일 내부의 JSDoc 주석(`/** ... */`)과 함수 선언부를 파싱하여 아래 정보를 표(Table)나 깔끔한 카드 형태로 정리해줘.
- **함수명 (Method Name):** 예: `scwin.getValResultMsg`
- **설명 (Description):** 함수의 역할 및 기능 설명
- **파라미터 (Parameters):** 인자값 정보 (타입, 변수명, 설명)
- **반환값 (Returns):** 반환 객체 타입 및 설명
- **예시 (Example):** 사용 예시 코드 (`@example`)

---

## 3. 출력 포맷 및 디자인 가이드
- **스타일링:** 개발자가 보기 편하도록 가독성 높은 Modern Dark 테마 또는 Clean White 테마의 CSS를 내장해줘. (예: Tailwind CSS CDN 활용 가능)
- **코드 블록:** `@example` 영역이나 함수 시그니처는 가독성을 위해 코드 블록 스타일(`background-color: #f5f5f5` 또는 어두운 톤)을 적용해줘.
- **출력 방식:** 모든 파일의 내용을 담은 하나의 통합 `index.html` 파일로 생성하거나, 파일별 HTML 소스 코드를 분할해서 작성해줘.

---

## 4. 분석 대상 샘플 코드 (data.xml 일부)
참고를 위해 `data.xml` 파일에 작성된 JSDoc 샘플을 제공할게. 이 스타일에 맞춰서 다른 파일들도 유추하거나 구조를 잡아줘.
D:\workspace\W_Craft_gcc_20260529\src\gcc 폴더에 각 파일 별로 전체 소스가 있으니 실제 파일을 참고해서 구조를 잡아줘.

/**
 * @method
 * @name getValResultMsg
 * @description 유효성 검사 결과 메시지를 반환.
 * @param {Object} valInfo 유효성 검사 옵션
 * @returns {Object} msgInfo 유효성 검사 결과 메시지 정보
 * @param {string} value 입력 값
 * @param {Object} dataCollectionObj DataCollection 객체
 * @param {Number} rowIndex Row Index 값
 * @example $c.data.getValResultMsg(valInfo, value);
 */
scwin.getValResultMsg = function (valInfo, value, dataCollectionObj, rowIndex) { ... }

---

## 5. API 문서 생성 위치
D:\workspace\W_Craft_gcc_20260529\src\docs\api 폴더 아래에 신규 폴더에 생성해줘.
예) D:\workspace\W_Craft_gcc_20260529\src\docs\api\gcc

---

위 요구사항을 바탕으로 완성된 HTML/CSS 소스 코드를 생성해줘.