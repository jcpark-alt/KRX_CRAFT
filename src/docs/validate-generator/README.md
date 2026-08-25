# validate-generator — WebSquare 유효성 검증 옵션 자동 생성 도구

화면 XML 을 분석해 `$c.validate.validateDataCollect`(src/gcc/validate.xml)에 적용할 `options` 객체와
호출 코드를 UI 로 생성하는 단일 HTML 도구입니다. 개발 생산성 향상과 검증 옵션 오탈자 방지가 목적입니다.

- **도구**: [validate-generator.html](validate-generator.html) — 의존성 0, `file://` 로 바로 열어 사용 (DESIGN.md 디자인 시스템 준수)
- **회귀 테스트**: `test/validateGenerator.test.js` (파싱·코드 생성 순수 로직 — `npm test` 포함)

---

## 사용법

1. **XML 입력** — 화면 XML 파일 선택 또는 붙여넣기 → [분석]
2. **검증 대상 선택** — 추출된 목록에서 선택 (생성 코드의 `validateObj` 가 됨)
   - `dataMap` : `<w2:key>` 의 id/name 이 필드 목록으로
   - `gridView` : 연결된 dataList(`dataList="data:dlt_x"`)의 `<w2:column>` id/name 이 컬럼 목록으로 (gridView 에 id 가 없으면 직접 입력)
   - `ref 컴포넌트 그룹` : `ref="data:..."` 입력 컴포넌트들 — 검증 대상 컨테이너(grp_*) id 는 직접 입력, 라벨은 참조 dataMap key 의 name 으로 자동 해석
3. **공통 옵션** — `validateType`(alert/mark/all) · `checkType`(single/multi) · `focus` · `editMode`
   (focus/editMode 는 기본값 true 와 다를 때만 코드에 출력)
4. **필드 규칙 입력** — name(라벨)은 XML 에서 자동 선입력. 규칙이 입력된 필드만 코드에 포함됩니다.
   - 기본: `required` · `allowChar`(프리셋: 0-9 / 0-9. / a-zA-Z / 가-힣) · `ignoreChar` · `minLength`/`maxLength` ·
     `num`(n/i/f) · `format`(email/date/phone/mobilePhone/securityNumber/bizNum/corpNum/urlNoProtocol/birth) · `fromNum`/`toNum`
   - 고급(토글): `checked`(체크박스 필수 체크) · `fixLength`(고정 문자수) · `minLengthB`/`maxLengthB`(byte) ·
     `maxLengthF`(예: 10.2 — 정수+소수 자릿수) ·
     `emptyIf`/`requiredIf`(조건 객체 원문 입력 — `{ compID : "sbx_nation", notEquals : "410" }`, equals|notEquals|in|notEmpty) ·
     `duplicate`(그리드 컬럼 행 간 중복 금지) · `duplicateGroup`(폼 그룹 필드 간 중복 금지)
5. **[코드 생성] → [복사]** — 생성 예:

```javascript
const options = {
    validateType : "alert", // alert|mark|all
    checkType : "single", // single|multi
    fields : {
        thisYear : { required : true, maxLength : 4, allowChar : "0-9", name : "조회연도" }
    }
};

const validateResult = await $c.validate.validateDataCollect(dma_Req, options);
if (!validateResult) {
    return;
}
```

`validateDataCollect` 는 **async** 이므로 await 호출 스니펫으로 생성됩니다(5단계 코드 컨벤션의
async/await 우선 원칙과 정합 — [code-convention.md](../code-convention/code-convention.md)).

## 구현 노트

- **파싱은 정규식 기반**(원 계획의 `DOMParser` 대신): CDATA 스크립트 내부의 마크업 유사 문자열을 안전하게
  제외하고, 네임스페이스 접두(`w2:`/`xf:`) 해석 차이에 영향받지 않으며, 순수 함수라 Node(Jest)로 회귀 검증이
  가능합니다. 파싱·생성 로직은 `<script id="vg-core">` 블록에 DOM 없이 분리되어 있습니다.
- 필드 key 가 식별자가 아니면(`COL-1` 등) 자동으로 따옴표 인용, 문자열 값은 이스케이프 처리합니다.
- **gridView 주의**: 입력 허용 문자·자릿수 등은 gridView **Column 속성**으로도 설정할 수 있습니다(JSDoc 안내).
  본 도구의 options 와 병행하면 이중 검증이 되므로 한쪽으로 통일하세요.

---

## 당초 실행 계획 (2026-08 수립 — 이행 완료)

**1. 추진 개요**

* **목적**: 웹스퀘어 XML 파일 분석을 통해 `scwin.validateDataCollect` 함수에 적용할 `options` 객체를 UI 기반으로 손쉽게 생성하여 개발 생산성 향상 및 설정 오류 방지
* **적용 대상**: 웹스퀘어 XML 소스 (dataMap, GridView, ref 매핑 컴포넌트)

**2. 세부 개발 단계별 계획**

* **Phase 1: XML 파싱 엔진 구축** — dataMap `<w2:key>` id/name, gridView 연결 dataList `<w2:column>` id/name, `ref="data:"` 컴포넌트 추출·중복 제거 ✅
* **Phase 2: UI/UX 레이아웃 설계** — 공통 옵션 입력부(validateType/checkType/focus/editMode) + 필드별 규칙 설정 테이블(required/allowChar/ignoreChar/min·maxLength/num/format/from·toNum + 고급 규칙) ✅
* **Phase 3: JS 객체 생성·출력** — gcc JSDoc 규약 형태 코드 생성(문자열/숫자 구분·name 마지막), 클립보드 복사(file:// 폴백) ✅
* **Phase 4: 단위 테스트·검증** — 실화면(JLDFIL00356)·합성 픽스처(다중 ref/CDATA 보호/이스케이프) Jest 6건 ✅

**3. 기대 효과**

* **개발 표준화**: 복잡한 검증 옵션 객체 작성 방식의 표준화 구현
* **휴먼 에러 방지**: 오탈자로 인한 유효성 검증 동작 오류 최소화
* **작업 시간 단축**: 화면별 유효성 검증 코드 생성 시간을 수작업 대비 80% 이상 절감
