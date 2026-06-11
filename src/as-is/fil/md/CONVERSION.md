# 🔄 [최종 단계] WebSquare AI 공통함수 이관 실행 및 API 문서 자동 생성 요청서 (fil 모듈)

너는 WebSquare AI 프레임워크 기반의 시스템 마이그레이션과 코드 표준화를 담당하는 **리팩토링 전문 소프트웨어 아키텍트**야.
이전 단계에서 필터링 및 1차 분류된 명세서 데이터를 기반으로, 아래의 **참고 파일 경로**, **실행 계획**, **전환 규칙**에 따라 실제 적용 가능한 공통 XML 소스 코드와 전용 HTML API 문서를 생성한다.

> 본 문서/분석 자료는 `src/as-is/fil/md/` 로 일원화되었다. (분석 결과물 = `src/as-is/fil/md`, 생성 산출물 소스 = `src/as-is/fil/gcc`, API HTML = `src/docs/api/fil`)
> 방식은 `src/as-is/mgt`(`$c.mgt`/`$c.trk`)·`ins`(`$c.ins`/`$c.trk`/`$c.print`)에서 검증된 절차를 동일하게 따른다.

---

## 1. 최우선 참조 파일 및 디렉토리 경로
다음 두 개의 마크다운 파일에 정리된 함수 추출 결과와 분류 기준을 **반드시 로드하고 상호 참조(Cross-Reference)**하여 이관을 진행한다.

1. **분석 마스터 리포트 파일:** `src/as-is/fil/md/fil_function_analysis_report.md`
   - *역할:* `fil` 폴더(root/bnf/inf)에서 추출된 전체 함수 목록의 필터링 결과 및 [삭제 대상/이관 대상] 분류 이력 확인.
2. **이관 및 매핑 가이드 파일:** `src/as-is/fil/md/gcc_mapping_and_biz_common.md`
   - *역할:* 기존 `gcc` 공통 파일로 매핑된 함수 목록과 업무공통함수로 분류된 대상 목록 확인.

> 작성 규칙 표준은 `src/docs/gcc_xml_guide.md`(gcc 공통 XML 작성·검증 가이드) 참조.

---

## 2. 이관 및 리팩토링 진행 계획 (Execution Plan)
1. **[Plan-1] 매핑 대상 검증:** `gcc_mapping_and_biz_common.md` §1(공통이관) 매핑이 실제 gcc 함수에 존재하는지 검증한다.
2. **[Plan-2] 표준 네이밍 및 이력 적용:** 기존 `gcc` 주석 스타일을 계승하되, TO-BE 함수명은 **camelCase 로 표준화**하고 AS-IS 원본명은 JSDoc 에 병기한다.
3. **[Plan-3] 소스 및 문서 빌드:** 업무공통 전용 `src/as-is/fil/gcc/fil.xml`(`$c.fil`) 소스와 독립형 API 문서 `src/docs/api/fil/index_fil.html` 을 생성한다.

---

## 3. 함수 전환 및 이력 관리 규칙 (AS-IS ➡️ TO-BE)
기존 `gcc` 파일(`data.xml`, `validate.xml` 등)의 표준 네이밍 룰과 JSDoc 스타일을 계승한다.
- **네이밍 표준화:** TO-BE 함수명은 **lower camelCase** 로 선언한다(PascalCase·snake_case·`fn_`/`_trk_` 등 레거시 접두어 제거). 호출은 `$c.<namespace>.함수명`.
- **추적성 보장 (Traceability):** 전환되는 모든 함수의 JSDoc `@description` 에 **AS-IS 원본명과 origin 파일**을 `(AS-IS: 원본명, origin: 원본.xml)` 형식으로 기록한다.

### [JSDoc 주석 표준 형식 — 실제 적용 예]
```javascript
/**
 * @method
 * @name getSubmitGubun
 * @description 현재 시각으로 공시 제출 가능 시간대 구분코드를 판정한다. (평일 18:00 마감)
 * (AS-IS: timeGuBun, origin: currentTime.xml)
 * @param {Date} nowDate 기준 시각(서버시각 권장)
 * @param {Boolean} beforeLogin 로그인 전 화면이면 true
 * @param {String} businessClosing 영업마감 여부("Y"/"N")
 * @returns {Number} 0:제출가능 1:마감30분전 2:불가(로그인후) 3:불가(로그인전/마감)
 * @hidden N
 * @example var gb = $c.fil.getSubmitGubun(new Date(serverTime), false, "N");
 */
scwin.getSubmitGubun = function (nowDate, beforeLogin, businessClosing) { /* ... */ };
```

---

## 4. 신규 업무공통함수 파일 (`src/as-is/fil/gcc/fil.xml`) 생성 요구사항
기존 `gcc` 공통함수에 매핑되지 않고 '업무공통'으로 분류된 함수들은 `src/as-is/fil/gcc/fil.xml`(`$c.fil`) 로 빌드한다.
- **XML 구조 규격:** WebSquare5 공통 스크립트 표준 구조(html/xmlns/head/`xf:model`/`w2:publicInfo`/script CDATA)를 그대로 따른다.
- **publicInfo 동기화·lint:** 공개 함수는 `<w2:publicInfo>` 에 등재하고 `python -m wsxml_lint src/as-is/fil/gcc` 이 **0 errors/0 warnings** 여야 한다.
- **도메인 분리:** 분석/트래킹(`_trk_*`)은 `trk.xml`(`$c.trk`), 문서 인쇄(Rexpert)는 `print.xml`(`$c.print`)로 분리한다. (`ins`/`mgt` 모듈의 trk/print 분리 규칙 계승)
- **사본 재사용:** ins 모듈과 동일 사본 함수(종목검색/컴포넌트 값/메시지/로그저장 등)는 신규 빌드하지 않고 `$c.ins` 를 재사용한다.

---

## 5. 진행 현황 (완료)

| 항목 | 상태 |
| :--- | :--- |
| 분석 문서 2종 (`fil_function_analysis_report.md`, `gcc_mapping_and_biz_common.md`) | `src/as-is/fil/md/` 작성 완료 |
| 업무공통 7개 함수 → `src/as-is/fil/gcc/fil.xml`(`$c.fil`) | 생성 완료 — **camelCase 표준화 + AS-IS 병기**, lint 0/0 |
| 분석/트래킹 8개 함수 → `src/as-is/fil/gcc/trk.xml`(`$c.trk`) | 분리 완료 (origin: logger_tracking.xml, ins/stf `$c.trk` 동일), lint 0/0 |
| 문서 인쇄 1개 함수 → `src/as-is/fil/gcc/print.xml`(`$c.print`) | 분리 완료 (origin: report.xml, MarkAny 포함), lint 0/0 |
| 공통이관 매핑 | 날짜/문자/숫자/검증/원시XHR/세션 다수 → 기존 `$c.date/str/num/util/win/data/validate/sbm/session` 재사용(레거시 폐기) |
| 사본 재사용 | 종목검색·컴포넌트 값·메시지·검색팝업·표준코드 등 ins 동일 사본 → `$c.ins` 재사용 |
| 삭제 규칙 | A1~A5(달력/레이아웃/패널/다운로드/진행바) + jQuery·Flash·ActiveX·서드파티(dTree/datejs/Miya/aes)·미사용 stub |
| lint 범위 편입 | `package.json`/`ci.yml`/`CLAUDE.md` 의 `lint:xml:legacy` 에 `src/as-is/fil` 추가(jQuery orphan publicInfo·dtree 인코딩 정리로 0 warnings) |

> 원본 `src/as-is/fil/*.xml`(및 `bnf`/`inf`)의 함수는 보존 상태이며, 호출부를 TO-BE(`$c.*`)로 전환한 뒤 제거하는 것을 권장한다.
> `fil` 모듈은 KRX 상장공시 필링(ELW/ETN/디지털/예심/채권) 업무 규모가 크나, **대부분이 ins/stf 와 동일 사본 또는 화면 전용 비즈니스 로직**이다. `fil.xml`에는 **여러 필링 화면이 재사용하는 핵심 공통 함수(소수점 콤마·처리 가드·제출 시간대)만 선별 이관**했고, 화면 전용 로직(ELW 발행검증, 예심 재무·주주 계산, 폼검증 오케스트레이터, 채권 업무규칙 등)은 마스터 리포트에 '업무공통(화면 전용/별도 관리)'으로 카탈로그화했다.
