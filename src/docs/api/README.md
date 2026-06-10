# 🌐 [최종 고도화] 공통 이관 함수 매핑 및 외부 링크 연동 API HTML 생성 요청서

너는 WebSquare5 프레임워크 기반의 레거시 시스템 리팩토링 및 API 문서화 표준을 수립하는 **프론트엔드 아키텍트이자 문서 자동화 전문가**야.
이전 단계의 분석 문서 내용을 기반으로, **AS-IS와 TO-BE 함수 간의 정합성을 검증하고, 클릭 시 기존 공통함수 인덱스 파일(`gcc/index.html`)의 해당 함수 위치로 정교하게 이동**할 수 있는 웹 기반 HTML API 문서를 생성해줘.

---

## 1. 최우선 참조 파일 및 분석 대상 경로
너는 작업을 수행하기 위해 아래 경로에 위치한 1차 분석 마스터 리포트를 완벽하게 파싱하고 그 안의 **'공통이관'**으로 분류된 함수 전체 목록을 추출해야 해.

- **참조 파일 경로:** `D:\workspace\W_Craft_gcc_20260529\src\docs\api\mgt\mgt_function_analysis_report.md`
- **추출 대상 데이터:** 위 파일에서 분류 결과가 **[공통이관]** 또는 **[이관 대상]**으로 확정된 함수들의 전체 리스트 (함수명, 설명, 매핑 파일 정보 등).

---

## 2. API HTML 문서 핵심 기능 및 UI 구현 요구사항

생성될 HTML 파일은 사용자가 AS-IS 함수를 기반으로 TO-BE 함수를 즉각적으로 추적할 수 있도록 시인성 높게 설계되어야 해.

### 🔍 [기능 1: AS-IS 기준의 매핑 및 검색 구조]
- **대시보드 레이아웃:** 좌측 사이드바에는 AS-IS 함수 목록을 나열하고, 메인 영역에는 매핑 상세 정보를 카드로 배치해줘.
- **인덱싱 기능:** 사용자가 기존에 쓰던 과거 함수명(AS-IS)을 보고 신규 표준 함수명(TO-BE)을 직관적으로 매칭할 수 있는 뷰(View) 인터페이스를 제공해줘.

### 🔗 [기능 2: 외부 API 문서 새 탭 연동 및 앵커 링킹 (핵심 요구사항)]
- 메인 화면에 출력된 **TO-BE 함수명을 클릭하면**, 다음 주소로 **새 탭(`target="_blank"`)이 열리며 이동**해야 해.
- **연동 타겟 주소:** `D:\workspace\W_Craft_gcc_20260529\src\docs\api\gcc\index.html`
- **앵커 링크 매핑 규칙:** 클릭 시 해당 `index.html` 내의 특정 함수 위치로 바로 스크롤 이동이 가능하도록 뒤에 **ID 앵커 해시값(`#TO-BE함수명`)**을 붙여서 하이퍼링크 주소를 바인딩해줘.
  - *예시:* `<a href="../gcc/index.html#scwin.getValResultMsg" target="_blank">scwin.getValResultMsg</a>` (상대 경로 유연성 고려 가능)

---

## 3. 스타일링 및 컴포넌트 디자인 가이드
- **디자인 테마:** 가독성이 뛰어난 개발자 친화적 Clean White 또는 Modern Slate 디자인 (Tailwind CSS CDN 내장).
- **시각적 강조:** 테이블 또는 카드 내에서 **[AS-IS 원본명]**과 **[TO-BE 변경명]**의 색상을 다르게 분리하여 네이밍 전환 이력이 한눈에 들어오도록 강조해줘.
- **반응형 테이블:** 추출된 함수 전체 목록을 담은 그리드/테이블은 정렬 및 필터링이 용이하도록 깔끔한 패딩과 보더 스타일을 적용해줘.

---

## 4. 최종 출력 포맷 가이드

분석과 UI 코딩이 완료되면 아래 마크다운 구조에 맞춰 완성된 소스코드를 정형화하여 출력해줘.

### [출력 구조 예시]
```markdown
### 📊 1. mgt_function_analysis_report.md 기반 공통이관 대상 분석 요약
- 파싱 파일: mgt_function_analysis_report.md
- 추출된 총 공통이관 함수 개수: (N)건
- 연동 타겟: /src/docs/api/gcc/index.html

### 🌐 2. 완성을 위한 전체 HTML/JS 소스 코드: `mgt_to_gcc_mapping.html`
\`\`\`html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>mgt -> gcc 공통이관 함수 맵핑 가이드</title>
    </head>
<body class="bg-gray-50 flex">
    </body>
</html>
\`\`\`