# 🔄 [최종 단계] WebSquare AI 공통함수 이관 실행 및 API 문서 자동 생성 요청서 (ins 모듈)

너는 WebSquare AI 프레임워크 기반의 시스템 마이그레이션과 코드 표준화를 담당하는 **리팩토링 전문 소프트웨어 아키텍트**야.
이전 단계에서 필터링 및 1차 분류된 명세서 데이터를 기반으로, 아래의 **참고 파일 경로**, **실행 계획**, **전환 규칙**에 따라 실제 적용 가능한 공통 XML 소스 코드와 전용 HTML API 문서를 생성한다.

> 본 문서/분석 자료는 `src/as-is/ins/md/` 로 일원화되었다. (분석 결과물 = `src/as-is/ins/md`, 생성 산출물 소스 = `src/as-is/ins/gcc`, API HTML = `src/docs/api/ins`)
> 방식은 `src/as-is/mgt`(`$c.mgt`/`$c.trk`)에서 검증된 절차를 동일하게 따른다.

---

## 1. 최우선 참조 파일 및 디렉토리 경로
다음 두 개의 마크다운 파일에 정리된 함수 추출 결과와 분류 기준을 **반드시 로드하고 상호 참조(Cross-Reference)**하여 이관을 진행한다.

1. **분석 마스터 리포트 파일:** `src/as-is/ins/md/ins_function_analysis_report.md`
   - *역할:* `ins` 폴더에서 추출된 전체 함수 목록의 필터링 결과 및 [삭제 대상/이관 대상] 분류 이력 확인.
2. **이관 및 매핑 가이드 파일:** `src/as-is/ins/md/gcc_mapping_and_biz_common.md`
   - *역할:* 기존 `gcc` 공통 파일로 매핑된 함수 목록과 업무공통함수로 분류된 대상 목록 확인.

> 작성 규칙 표준은 `src/docs/gcc_xml_guide.md`(gcc 공통 XML 작성·검증 가이드) 참조.

---

## 2. 이관 및 리팩토링 진행 계획 (Execution Plan)
1. **[Plan-1] 매핑 대상 검증:** `gcc_mapping_and_biz_common.md` §1(공통이관) 매핑이 실제 gcc 함수에 존재하는지 검증한다.
2. **[Plan-2] 표준 네이밍 및 이력 적용:** 기존 `gcc` 주석 스타일을 계승하되, TO-BE 함수명은 **camelCase 로 표준화**하고 AS-IS 원본명은 JSDoc 에 병기한다.
3. **[Plan-3] 소스 및 문서 빌드:** 업무공통 전용 `src/as-is/ins/gcc/ins.xml`(`$c.ins`) 소스와 독립형 API 문서 `src/docs/api/ins/index_ins.html` 을 생성한다.

---

## 3. 함수 전환 및 이력 관리 규칙 (AS-IS ➡️ TO-BE)
기존 `gcc` 파일(`data.xml`, `validate.xml` 등)의 표준 네이밍 룰과 JSDoc 스타일을 계승한다.
- **네이밍 표준화:** TO-BE 함수명은 **lower camelCase** 로 선언한다(PascalCase·snake_case·`fn_`/`_trk_` 등 레거시 접두어 제거). 호출은 `$c.<namespace>.함수명`.
- **추적성 보장 (Traceability):** 전환되는 모든 함수의 JSDoc `@description` 에 **AS-IS 원본명과 origin 파일**을 `(AS-IS: 원본명, origin: 원본.xml)` 형식으로 기록한다.

### [JSDoc 주석 표준 형식 — 실제 적용 예]
```javascript
/**
 * @method
 * @name getStdCdToStdTpCd
 * @description 표준코드 신청구분을 상세 표준유형코드로 매핑한다.
 * (AS-IS: get_stdcd2stdTpCd, origin: function.xml)
 * @param {String} stdCdApplContnTpCd 표준코드 신청구분 (01~13)
 * @param {String} type2 전자단기사채(07) 구분 시 "CP" 면 CP(7), 아니면 전단채(77)
 * @returns {String} 상세 표준유형코드
 * @hidden N
 * @example $c.ins.getStdCdToStdTpCd("01");
 */
scwin.getStdCdToStdTpCd = function (stdCdApplContnTpCd, type2) { /* ... */ };
```

---

## 4. 신규 업무공통함수 파일 생성 요구사항
기존 `gcc` 공통함수에 매핑되지 않고 '업무공통'으로 분류된 함수들은 `src/as-is/ins/gcc/` 로 빌드한다.
- **XML 구조 규격:** WebSquare5 공통 스크립트 표준 구조(html/xmlns/head/`xf:model`/`w2:publicInfo`/script CDATA)를 그대로 따른다.
- **publicInfo 동기화·lint:** 공개 함수는 `<w2:publicInfo>` 에 등재하고 `python -m wsxml_lint src/as-is/ins/gcc` 이 **0 errors/0 warnings** 여야 한다.
- **도메인 분리:** 분석/트래킹(`_trk_*`)은 `trk.xml`(`$c.trk`), 문서 인쇄(Rexpert)는 `print.xml`(`$c.print`)로 분리한다. (`mgt` 모듈의 trk/print 분리 규칙 계승)

---

## 5. 진행 현황 (완료)

| 항목 | 상태 |
| :--- | :--- |
| 분석 문서 2종 (`ins_function_analysis_report.md`, `gcc_mapping_and_biz_common.md`) | `src/as-is/ins/md/` 작성 완료 |
| 업무공통 20개 함수 → `src/as-is/ins/gcc/ins.xml`(`$c.ins`) | 생성 완료 — **camelCase 표준화 + AS-IS 병기**, lint 0/0 |
| 분석/트래킹 8개 함수 → `src/as-is/ins/gcc/trk.xml`(`$c.trk`) | 분리 완료 (origin: logger_tracking.xml), lint 0/0 |
| 문서 인쇄 6개 함수 → `src/as-is/ins/gcc/print.xml`(`$c.print`) | 분리 완료 (origin: report.xml), lint 0/0 |
| 공통이관 매핑 | 날짜/문자/숫자/검증 다수 → 기존 `$c.date/str/num/util/win/data/validate/sbm/session` 재사용(레거시 폐기) |
| 삭제 규칙 | A1~A5(달력/레이아웃/패널/다운로드/진행바) + jQuery·Flash·ActiveX·서드파티·미사용 stub |

> 원본 `src/as-is/ins/*.xml`의 함수는 보존 상태이며, 호출부를 TO-BE(`$c.*`)로 전환한 뒤 제거하는 것을 권장한다.
> `ins` 모듈은 KRX 상장·발행·공시 업무 규모가 커 업무공통(B2) 함수가 수백 개에 달한다. `ins.xml`에는 **여러 화면에서 재사용되는 핵심 공통 함수만 선별 이관**했고, 화면 전용 비즈니스 로직(각종 업무 팝업 오픈, ELW/상장 read, prelist 페이지 로직 등)은 마스터 리포트에 '업무공통(화면 전용/별도 관리)'으로 카탈로그화했다.
