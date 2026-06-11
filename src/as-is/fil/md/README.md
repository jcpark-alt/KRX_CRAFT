# 🚀 WebSquare5 공통함수(gcc) 이관 및 리팩토링 분석 요청서 (fil 모듈)

너는 WebSquare AI 프레임워크 기반의 소스 코드를 분석하고 시스템 아키텍처를 재설계하는 **시니어 소프트웨어 엔지니어이자 코드 분석 전문가**야.
내가 제공하는 디렉토리 구조와 분석 규칙을 바탕으로, 기존 업무 화면/모듈(`src/as-is/fil`)의 함수들을 추출하고 공통 모듈(`src/gcc`)로 이관 및 통폐합하기 위한 리팩토링 가이드(MD 파일)를 작성해줘.

> 본 요청서는 `src/as-is/mgt`·`ins`·`stf`에서 먼저 수행한 분석 방식을 `fil` 모듈에 동일하게 적용한 것이다.
> `fil`은 상장공시 **필링(filing)** 모듈로, 루트 외에 `bnf`(채권 발행/공시)·`inf`(발행사/코드 설정) 하위 트리를 포함한다.

---

## 1. 분석 대상 및 디렉토리 구조
- **AS-IS 소스 위치:** `D:\workspace\W_Craft_gcc_20260529\src\as-is\fil` (이하 **fil 폴더**, 111개 `.xml` = root 45 + `bnf` 30 + `inf` 36)
- **TO-BE 공통 위치:** `D:\workspace\W_Craft_gcc_20260529\src\gcc` (이하 **gcc 폴더**)
- **파일 형태:** WebSquare5 화면 또는 스크립트 파일 (`.xml` 내 `<script>` 태그 안의 JavaScript 함수 정의부)

---

## 2. 핵심 분석 및 매핑 가이드라인 (중요)

`fil` 폴더 내의 XML 파일에서 함수 목록을 추출할 때, 다음 분류 규칙을 최우선으로 적용하여 필터링해줘.

### 🚫 [A 그룹] 이관 제외 및 삭제 대상 함수
아래 6가지 조건 중 하나라도 해당하면 **[삭제 대상]**으로 분류하고, `gcc` 공통함수 매핑 대상에서 완전히 제외해.

1. **달력(Calendar) 관련 함수:** Calendar 컴포넌트 제어, 날짜 선택/연산 등 달력 기능과 관련된 함수 전체.
2. **UI 레이아웃 제어 함수:** 컴포넌트의 크기 조절(`resize`), 위치 변경(`position` - left, top, right, bottom) 관련 함수 전체. (키이벤트 입력제어·포커스 이동·iframe 사이징 포함)
3. **패널 스타일 제어 함수:** 패널(Panel) 컴포넌트의 `style` 속성을 직접 수정하거나 관리하는 함수 전체.
4. **파일 다운로드 함수:** 엑셀 파일 다운로드(Excel Download) 및 일반 파일 다운로드 관련 함수 전체.
5. **진행바(Progress) 관련 함수:** 진행 상태 표시바(Progress Bar)·로딩 표시 생성·애니메이션·제어 등 진행바 UI 기능과 관련된 함수 전체.
6. **jQuery / 서드파티 / 폐기 함수:** jQuery(`$`, `jQuery`) 의존 함수, 서드파티 플러그인 래퍼/번들(`dTree`, `datejs`, `MiyaValidator`, `aes`/CryptoJS, jQuery-UI 등), Flash/ActiveX/`document.write` 등 폐기 기술, 미사용 stub.

### 🔄 [B 그룹] 공통함수(gcc) 매핑 및 추가 대상 함수
[A 그룹]에 해당하지 않는 정상 함수들을 대상으로 진행해.

1. **기존 gcc 매핑 함수(공통이관):** `fil`에서 추출한 함수의 기능과 동일/유사한 함수가 이미 `gcc` 폴더의 공통 XML 파일에 존재하는 경우 → 기존 gcc 함수를 유지·재사용(필요 시 보완), 레거시 함수는 폐기.
2. **신규 업무공통 함수(미매핑):** [A 그룹]이 아니면서 기존 `gcc` 어디에도 매핑되지 않는 KRX 고유 비즈니스 공통 기능 → 별도 '업무공통' 모듈(`$c.fil`)로 관리.
3. **세션/트래킹/인쇄 등 도메인 모듈:** 세션 → `$c.session`, 분석/트래킹(`_trk_*`) → `$c.trk`, 문서 인쇄(Rexpert) → `$c.print` 로 분리 이관한다.
4. **ins 모듈과 동일 사본 재사용:** `fil`은 `calendar`/`layer`/`JCommon`/`common`/`function`/`number_format_kor`/`trans`/`sessionTimer`/`logger_tracking`/`report`/`stockSearch` 등 ins·stf 와 **동일/사촌 사본**을 다수 보유한다. 이들의 공통이관·업무공통 분류는 ins/stf 명세를 그대로 계승하고, 종목검색·컴포넌트 값 get/set·메시지·로그저장 등은 신규 모듈을 만들지 않고 **`$c.ins`/`$c.trk`/`$c.print`를 재사용**한다.

---

## 3. 최종 출력 요구사항 (Markdown 포맷)

출력 결과물은 다음 **2가지 마크다운 문서 형태**로 나누어 직관적인 테이블(Table) 구조로 작성해줘.

### 파일 1: `fil_function_analysis_report.md`
> `fil` 폴더(root/bnf/inf)에서 추출된 전체 함수 목록의 분석 결과와 이관/삭제 여부를 기록하는 마스터 리포트.

### 파일 2: `gcc_mapping_and_biz_common.md`
> 공통함수로 편입될 함수들과 별도 관리할 신규 업무공통함수 리스트를 정리한 명세서.

---

## 4. API 문서 생성 위치
`D:\workspace\W_Craft_gcc_20260529\src\docs\api` 폴더 아래 신규 폴더에 생성해줘. 예) `src\docs\api\fil`

준비가 완료되었다면, `src/as-is/fil` 소스 코드 내용을 기반으로 위 규칙들을 엄격히 적용하여 API 마크다운 문서를 작성해줘.
