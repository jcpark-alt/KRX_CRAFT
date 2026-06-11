# 🚀 WebSquare5 공통함수(gcc) 이관 및 리팩토링 분석 요청서

너는 WebSquare AI 프레임워크 기반의 소스 코드를 분석하고 시스템 아키텍처를 재설계하는 **시니어 소프트웨어 엔지니어이자 코드 분석 전문가**야.
내가 제공하는 디렉토리 구조와 분석 규칙을 바탕으로, 기존 업무 화면/모듈(`src/as-is/stf`)의 함수들을 추출하고 공통 모듈(`src/gcc`)로 이관 및 통폐합하기 위한 리팩토링 가이드(MD 파일)를 작성해줘.

---

## 1. 분석 대상 및 디렉토리 구조
- **AS-IS 소스 위치:** `D:\workspace\W_Craft_gcc_20260529\src\as-is\stf` (이하 **stf 폴더**)
- **TO-BE 공통 위치:** `D:\workspace\W_Craft_gcc_20260529\src\gcc` (이하 **gcc 폴더**)
- **파일 형태:** WebSquare5 화면 또는 스크립트 파일 (`.xml` 내 `<script>` 태그 안의 JavaScript 함수 정의부)

> **참고:** `stf` 는 증권 상장/공시 업무(신규상장, ETN/ELW/채권/디지털 수리, 상장심사, 마켓메이커 등)를 담는 **가장 큰 레거시 모듈**이다. 48개 `.xml`, 약 **962개** `scwin.*` 함수로, mgt(196개)의 약 5배 규모다. 상당수 파일(`utils.xml`, `common.xml`, `stockSearch.xml`, `filing_common.xml`, `filing_trans.xml`, `session.xml`, `filing_calendar.xml`, `PopupCalendar.xml`, `controlResize.xml`, `libRoundPanel.xml`, `ShiftCrossBrowser_ver.2.4.min.xml`, `filing_progress.xml`)은 mgt 와 **동명·동일 사본**이므로 mgt 분류 결과를 그대로 계승한다.

---

## 2. 핵심 분석 및 매핑 가이드라인 (중요)

`stf` 폴더 내의 XML 파일에서 함수 목록을 추출할 때, 다음 분류 규칙을 최우선으로 적용하여 필터링해줘.

### 🚫 [A 그룹] 이관 제외 및 삭제 대상 함수
아래 조건 중 하나라도 해당하면 **[삭제 대상]**으로 분류하고, `gcc` 공통함수 매핑 대상에서 완전히 제외해.

1. **달력(Calendar) 관련 함수:** Calendar 컴포넌트 제어, 날짜 선택/연산 등 달력 기능과 관련된 함수 전체.
2. **UI 레이아웃 제어 함수:** 컴포넌트의 크기 조절(`resize`), 위치 변경(`position` - left, top, right, bottom) 관련 함수 전체.
3. **패널 스타일 제어 함수:** 패널(Panel) 컴포넌트의 `style` 속성을 직접 수정하거나 관리하는 함수 전체.
4. **파일 다운로드 함수:** 엑셀 파일 다운로드(Excel Download) 및 일반 파일 다운로드 관련 함수 전체.
5. **진행바(Progress) 관련 함수:** 진행 상태 표시바(Progress Bar) 생성·애니메이션·제어 등 진행바 UI 기능과 관련된 함수 전체.
6. **jQuery/Flash 등 외부 의존 함수:** jQuery(`$`, `jQuery`) 또는 레거시 Flash(`flashcall`, `login_flash`)·에디터 솔루션(`editor`, `filing_editor`)·ARF 리포트 플러그인에 의존하여 동작하는 함수 전체.

### 🔄 [B 그룹] 공통함수(gcc) 매핑 및 추가 대상 함수
[A 그룹]에 해당하지 않는 정상 함수들을 대상으로 진행해.

1. **기존 gcc 매핑 함수:** `stf`에서 추출한 함수의 기능과 동일하거나 유사한 함수가 이미 `gcc` 공통 XML 파일에 존재하는 경우.
   - **조치:** 기존 `gcc` 공통함수를 유지·재사용한다(레거시 함수는 폐기, 필요 시 gcc 함수를 보완).
2. **신규 업무공통 함수 (미매핑):** [A 그룹]이 아니면서, 기존 `gcc` 공통함수 어디에도 매핑되지 않는 KRX 고유 비즈니스 공통 기능인 경우.
   - **조치:** 별도의 '업무공통함수'군으로 분류하여 `src/as-is/stf/gcc/stf.xml`(`$c.stf`)로 이관한다.
3. **세션(Session) 관련 함수:** 세션 점검·만료 처리 기능인 경우.
   - **조치:** 신규 공통 모듈 `gcc/session.xml`(`$c.session`)에 매핑한다. (예: `sessionCheck` → `$c.session.sessionCheck`)
4. **인쇄/리포트(Print) 관련 함수:** `window.print()`·리포트 솔루션(`$c.rpt.*`) 호출 등 인쇄/출력 전용 함수인 경우.
   - **조치:** `stf.xml` 에 두지 않고 같은 폴더의 별도 파일 `print.xml`(`$c.print`)로 분리한다. (`src/as-is/stf/gcc/md/README.md` 의 print 분리 규칙 참조)

---

## 3. 최종 출력 요구사항 (Markdown 포맷)

출력 결과물은 다음 **2가지 마크다운 문서 형태**로 나누어 직관적인 테이블(Table) 구조로 작성해줘.

### 파일 1: `stf_function_analysis_report.md`
> `stf` 폴더에서 추출된 전체 함수 목록의 분석 결과와 이관/삭제 여부를 기록하는 마스터 리포트

### 파일 2: `gcc_mapping_and_biz_common.md`
> 공통함수로 편입될 함수들과 별도 관리할 신규 업무공통함수 리스트를 정리한 명세서

---

## 4. API 문서 생성 위치
`D:\workspace\W_Craft_gcc_20260529\src\docs\api` 폴더 아래에 신규 폴더(`src/docs/api/stf`)에 생성한다.

준비가 완료되었다면, `src/as-is/stf` 소스 코드 내용을 기반으로 위 규칙들을 엄격히 적용하여 분석 문서를 작성해줘.
