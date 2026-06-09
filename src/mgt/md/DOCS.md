# 🔄 [최종 단계] WebSquare AI 공통함수 이관 실행 및 API 문서 자동 생성 요청서

너는 WebSquare AI 프레임워크 기반의 시스템 마이그레이션과 코드 표준화를 담당하는 **리팩토링 전문 소프트웨어 아키텍트**야. 
이전 단계에서 필터링 및 1차 분류된 명세서 데이터를 기반으로, 아래의 **참고 파일 경로**, **실행 계획**, **전환 규칙**에 따라 실제 적용 가능한 공통 XML 소스 코드와 전용 HTML API 문서를 생성해줘.

---

## 1. 최우선 참조 파일 및 디렉토리 경로
너는 작업을 시작하기 전, 다음 두 개의 마크다운 파일에 정리된 함수 추출 결과와 분류 기준을 **반드시 로드하고 상호 참조(Cross-Reference)**하여 이관을 진행해야 해.

1. **분석 마스터 리포트 파일:** `D:\documents\KRX_Craft\W_Craft_gcc_20260529\src\docs\api\mgt\mgt_function_analysis_report.md`
   - *역할:* `mgt` 폴더에서 추출된 전체 함수 목록의 필터링 결과 및 [삭제 대상/이관 대상] 분류 이력 확인.
2. **이관 및 매핑 가이드 파일:** `D:\documents\KRX_Craft\W_Craft_gcc_20260529\src\docs\api\mgt\gcc_mapping_and_biz_common.md`
   - *역할:* 기존 `gcc` 공통 파일(data.xml, util.xml 등)로 매핑된 함수 목록과 업무공통함수로 분류된 대상 목록 확인.

---

## 2. 이관 및 리팩토링 진행 계획 (Execution Plan)
지정된 마크다운 참고 파일들의 데이터를 바탕으로 다음 3단계 프로세스를 실행해줘.
1. **[Plan-1] 매핑 대상 검증:** `gcc_mapping_and_biz_common.md`를 읽고 기존 `gcc` 공통 파일별로 추가될 함수들을 매칭 및 검증한다.
2. **[Plan-2] 표준 네이밍 및 이력 적용:** 기존 `gcc` xml 소스를 참고하여 주석 스타일을 표준화하되, AS-IS 함수명을 보존한다.
3. **[Plan-3] 소스 및 문서 빌드:** 업무공통함수 전용 `mgt.xml` 소스 파일과 독립형 API 문서인 `index_mgt.html`을 생성한다.

---

## 3. 함수 전환 및 이력 관리 규칙 (AS-IS ➡️ TO-BE)
기존 `gcc` 폴더 아래의 파일들(`data.xml`, `validate.xml` 등)에 정의된 표준 네이밍 룰과 JSDoc 주석 스타일을 엄격히 계승한다.
- **네이밍 표준화:** 기존 gcc 파일 내의 컴포넌트 호출 패턴 및 접두어(예: `scwin.get...`, `$c.util...`)에 맞추어 TO-BE 함수명을 선언한다.
- **추적성 보장 (Traceability):** 유지보수 이력 관리를 위해, 전환되는 모든 함수의 JSDoc 주석 내에 **전환 전 원래 함수명(AS-IS)**을 `@history` 또는 커스텀 태그로 반드시 기록해야 한다.

---

## 4. 신규 업무공통함수 파일 (`src/gcc/mgt.xml`) 생성 요구사항
기존 `gcc` 공통함수 파일들에 매핑되지 않고 '업무공통'으로 분류된 함수들은 `src/gcc/mgt.xml` 파일로 새롭게 빌드한다.
- **XML 구조 규격:** WebSquare5 공통 스크립트 표준 구조(html, xmlns, head, xforms:model, script CDATA 등)를 그대로 복제하여 작성할 것.

### [mgt.xml 내 JSDoc 주석 표준 형식]
```javascript
/**
 * @method
 * @name scwin.newKrxFunction
 * @description KRX 업무 고유 지수 연산 처리 함수 (참고 파일 규칙 기반 추출)
 * @param {Array} data - 분석 대상 배열 데이터
 * @returns {Number} 결과 지수 값
 * @history AS-IS 원본 함수명: scwin.legacy_calculate_idx
 */
scwin.newKrxFunction = function(data) { ... }