# 🔄 [최종 단계] WebSquare AI 공통함수 이관 실행 및 API 문서 자동 생성 요청서

너는 WebSquare AI 프레임워크 기반의 시스템 마이그레이션과 코드 표준화를 담당하는 **리팩토링 전문 소프트웨어 아키텍트**야.
이전 단계에서 필터링 및 1차 분류된 명세서 데이터를 기반으로, 아래의 **참고 파일 경로**, **실행 계획**, **전환 규칙**에 따라 실제 적용 가능한 공통 XML 소스 코드와 전용 HTML API 문서를 생성한다.

> 본 문서/분석 자료는 `src/mgt/md/` 로 일원화되었다. (분석 결과물 = `src/mgt/md`, 생성 산출물 소스 = `src/mgt/gcc`, API HTML = `src/docs/api/mgt`)

---

## 1. 최우선 참조 파일 및 디렉토리 경로
다음 두 개의 마크다운 파일에 정리된 함수 추출 결과와 분류 기준을 **반드시 로드하고 상호 참조(Cross-Reference)**하여 이관을 진행한다.

1. **분석 마스터 리포트 파일:** `D:\documents\KRX_Craft\W_Craft_gcc_20260529\src\mgt\md\mgt_function_analysis_report.md`
   - *역할:* `mgt` 폴더에서 추출된 전체 함수 목록의 필터링 결과 및 [삭제 대상/이관 대상] 분류 이력 확인.
2. **이관 및 매핑 가이드 파일:** `D:\documents\KRX_Craft\W_Craft_gcc_20260529\src\mgt\md\gcc_mapping_and_biz_common.md`
   - *역할:* 기존 `gcc` 공통 파일(data.xml, util.xml 등)로 매핑된 함수 목록과 업무공통함수로 분류된 대상 목록 확인.

> 작성 규칙 표준은 `src/docs/gcc_xml_guide.md`(gcc 공통 XML 작성·검증 가이드) 참조.

---

## 2. 이관 및 리팩토링 진행 계획 (Execution Plan)
1. **[Plan-1] 매핑 대상 검증:** `gcc_mapping_and_biz_common.md` 의 §1(공통이관) 매핑이 실제 gcc 함수에 존재하는지 검증한다.
2. **[Plan-2] 표준 네이밍 및 이력 적용:** 기존 `gcc` 주석 스타일을 계승하되, TO-BE 함수명은 **camelCase 로 표준화**하고 AS-IS 원본명은 JSDoc 에 병기한다.
3. **[Plan-3] 소스 및 문서 빌드:** 업무공통 전용 `src/mgt/gcc/mgt.xml`(`$c.mgt`) 소스와 독립형 API 문서 `src/docs/api/mgt/index_mgt.html` 을 생성한다.

---

## 3. 함수 전환 및 이력 관리 규칙 (AS-IS ➡️ TO-BE)
기존 `gcc` 파일(`data.xml`, `validate.xml` 등)의 표준 네이밍 룰과 JSDoc 스타일을 계승한다.
- **네이밍 표준화:** TO-BE 함수명은 **lower camelCase** 로 선언한다(PascalCase·snake_case·`fn_`/`_trk_` 등 레거시 접두어 제거). 호출은 `$c.<namespace>.함수명`.
- **추적성 보장 (Traceability):** 전환되는 모든 함수의 JSDoc `@description` 에 **AS-IS 원본명과 origin 파일**을 `(AS-IS: 원본명, origin: 원본.xml)` 형식으로 기록한다.

### [JSDoc 주석 표준 형식 — 실제 적용 예]
```javascript
/**
 * @method
 * @name comboCbDataSetPeriod
 * @description 기간 선택 콤보(1주일~2년)용 CBData 를 지정한다.
 * (AS-IS: Combo_CBDataSetPeriod, origin: mgt.xml)
 * @param {Object} sval 적용할 콤보 컴포넌트
 * @returns {void}
 * @hidden N
 * @example $c.mgt.comboCbDataSetPeriod(cbo_period);
 */
scwin.comboCbDataSetPeriod = function (sval) { /* ... */ };
```

---

## 4. 신규 업무공통함수 파일 (`src/mgt/gcc/mgt.xml`) 생성 요구사항
기존 `gcc` 공통함수에 매핑되지 않고 '업무공통'으로 분류된 함수들은 `src/mgt/gcc/mgt.xml`(`$c.mgt`) 로 빌드한다.
- **XML 구조 규격:** WebSquare5 공통 스크립트 표준 구조(html/xmlns/head/`xf:model`/`w2:publicInfo`/script CDATA)를 그대로 따른다.
- **publicInfo 동기화·lint:** 공개 함수는 `<w2:publicInfo>` 에 등재하고 `python -m wsxml_lint src/mgt/gcc/mgt.xml` 이 **0 errors/0 warnings** 여야 한다.

---

## 5. 진행 현황 (완료)

| 항목 | 상태 |
| :--- | :--- |
| 분석 문서 2종 (`mgt_function_analysis_report.md`, `gcc_mapping_and_biz_common.md`) | `src/mgt/md/` 로 이동 완료 |
| 업무공통 24개 함수 → `src/mgt/gcc/mgt.xml`(`$c.mgt`) | 생성 완료 — **camelCase 표준화 + AS-IS 병기**, lint 0/0 |
| `$c.mgt` API 문서 `src/docs/api/mgt/index_mgt.html` | docgen 생성 완료(24개 메서드) |
| AS-IS→TO-BE 매핑 가이드 `src/docs/api/mgt/index_transfer.html` | 생성 완료(공통이관 함수 → `gcc/index.html` 앵커 연동) |
| 공통이관 신규 모듈 | `gcc/session.xml`(`$c.session.sessionCheck`), `$c.data.serializeFormToQueryString`, `$c.data.getMatchedJSON`(fn_findRow) 등 |
| 삭제 규칙 | A1~A5(달력/레이아웃/패널/다운로드/진행바) + 레거시 미사용 코드 개별 삭제 |

> 원본 `src/mgt/*.xml`(stockSearch/mgt/common 등)의 함수는 보존 상태이며, 호출부를 TO-BE(`$c.*`)로 전환한 뒤 제거하는 것을 권장한다.
