# fil.xml 함수 수정 내역

`src/as-is/fil/gcc/fil.xml`(`$c.fil`)에 적용한 함수 추출·표준화 사항을 정리한다.
(같은 폴더의 `trk.xml`은 `$c.trk`(분석/트래킹), `print.xml`은 `$c.print`(문서 인쇄) 분리 모듈이다.)

## 요약

| 대상 | 변경 유형 | 내용 |
|------|-----------|------|
| `$c.fil` 7개 함수 | **신규 빌드** | fil(상장공시 필링) 모듈 업무공통 핵심 함수를 camelCase 표준화 + AS-IS 병기로 이관 |
| `trk*` 8개 | **분리(계승)** | 분석/트래킹 함수를 `trk.xml`(`$c.trk`)로 이관 (ins/stf 의 `$c.trk` 와 동일 알고리즘) |
| `printPreView` | **분리** | 문서 인쇄(Rexpert+MarkAny) 함수를 `print.xml`(`$c.print`)로 이관 |
| `timeGuBun` | **수정** | 전역 `scwin.filSubmitGubun` 세팅·내부 서버호출 → 구분코드 **반환** 순수 함수 `getSubmitGubun` 으로 재구성 |
| 콤마 처리 | **표준화** | 화면별 `fn_CommaValueAll`/`fn_RmCommaValueAll` 이 공통 호출하던 컴포넌트 단위 코어만 선별 이관 |
| jQuery/DOM 의존성 | **제거** | `currentTime.xml`의 `$`·`innerHTML`·`css` UI 결합부는 이관 제외(A그룹) |

---

## 1. `$c.fil` 신규 빌드 (7개)

`fil` 모듈(111개 `.xml`, 약 1,160개 `scwin.*` — root 45 + bnf 30 + inf 36)에서 **여러 필링 화면이 재사용하는 핵심 업무공통** 함수만 선별 이관했다.
선별 기준과 전체 분류는 [`../../md/fil_function_analysis_report.md`](../../md/fil_function_analysis_report.md) 참조.

| 도메인 | 함수 | origin |
|------|------|--------|
| 콤마(소수점 허용, 문자열) | `setComma`, `delComma` | digitalNumberFormat.xml |
| 콤마(컴포넌트 단위) | `objSetComma`, `objRmComma`, `objRmComma2` | digitalNumberFormat.xml |
| 처리 확인 가드 | `confirmProcess` | digitalApplList.xml |
| 공시 제출 시간대 판정 | `getSubmitGubun` | currentTime.xml |

> 내부 헬퍼 `__rmComma`(AS-IS `fn_RmComma`, `@hidden Y`, publicInfo 미등재)는 `objRmComma`/`objRmComma2` 가 사용한다.

> 화면 전용 비즈니스 로직(ELW 발행검증 `elwCheck`, 예심 재무·주주 계산 `prelist05003/04`, 폼검증 오케스트레이터 `*FormValidate.fn_validate`, 채권 업무규칙 `bondCommon`/`bondListing`/`isuInfoChg`, 신청목록 조회 `*ApplList.fn_*SelectSub` 등)은 `$c.fil`에 넣지 않고 마스터 리포트에 '업무공통(별도 관리)'로 카탈로그화했다.

## 2. 콤마 처리 — 컴포넌트 단위 코어 선별

필링 입력화면(`elw05012~27`, `prelist05002~04`, `digital`, `etn`, `lossLimitEtn`)은 각자
`fn_CommaValueAll`/`fn_RmCommaValueAll` 에서 **자기 화면 필드 목록을 하드코딩**해 호출한다(화면 전용).
그 화면별 함수가 공통으로 호출하는 컴포넌트 단위 코어(`fn_ObjValueSetComma`/`fn_ObjValueResetRmComma(2)`)만
`$c.fil.objSetComma`/`objRmComma`/`objRmComma2` 로 이관했다.

> 정수만 다루는 `$c.num.formatNumber` 와 달리 필링 금액은 **소수점·음수·선행 `.`** 을 보존해야 하므로,
> 소수점 허용 콤마 로직(`fn_SetComma`/`fn_DelComma`)을 `$c.fil.setComma`/`delComma` 로 유지했다.

```javascript
// AS-IS (digitalNumberFormat.xml)
scwin.fn_ObjValueSetComma = function (numObj) {
    if (numObj != null && numObj != '') {
        var tmp = numObj.getValue();
        if (tmp.substring(0,1) == '.') numObj.setValue('0' + numObj.getValue());
        numObj.setValue(scwin.fn_SetComma(numObj.getValue()));
    }
};

// TO-BE ($c.fil.objSetComma) — setComma 위임, === 비교
scwin.objSetComma = function (numObj) {
    if (numObj !== null && numObj !== "") {
        const tmp = numObj.getValue();
        if (tmp.substring(0, 1) === ".") numObj.setValue("0" + numObj.getValue());
        numObj.setValue(scwin.setComma(numObj.getValue()));
    }
};
```

## 3. `timeGuBun` → `getSubmitGubun` (순수 함수화)

AS-IS `timeGuBun`(currentTime.xml)은 ① 전역 `scwin.filSubmitGubun` 을 세팅하고, ② 18시 이후
재개시 판정을 위해 **내부에서 서버(`getClosedVal`)를 직접 호출**했으며, ③ `submitSec` 전역으로
30틱마다 한 번만 서버를 치는 throttle 을 갖고 있었다.

TO-BE `getSubmitGubun(nowDate, beforeLogin, businessClosing)` 은 영업마감 여부를 **인자로 받아**
구분코드(0:제출가능 1:마감30분전 2:불가(로그인후) 3:불가(로그인전/마감))를 **반환**하는 순수 함수로
재구성했다. 서버 마감조회(`/main/mainIntro.do?method=getCurrentTime`)와 1초 타이머/UI 갱신은
화면 책임으로 남기고, 호출부가 `$c.sbm` 으로 마감여부를 받아 본 함수에 넘긴다.

```javascript
// AS-IS: 전역 세팅 + 내부 서버호출
scwin.timeGuBun = function (ver, ver1) { ... if (scwin.getClosedVal().businessClosing == 'N') scwin.filSubmitGubun = 0; ... };

// TO-BE: 마감여부 인자, 구분코드 반환
scwin.getSubmitGubun = function (nowDate, beforeLogin, businessClosing) { ... return closed ? 2 : 0; ... };
```

## 4. jQuery/DOM 의존성 제거

`currentTime.xml`의 `checkCanSubmit*`(`$('#submitCondition').text()/.css()`, `innerHTML`,
`window.setTimeout("...()",1000)` 재귀)와 `getClosedVal`(`$.ajax`)은 UI/통신 결합부로 A그룹(제외).
순수 시간대 판정 규칙만 `getSubmitGubun` 으로 추출했다.

---

## 분리 규칙: 분석/트래킹 → `trk.xml`, 문서 print → `print.xml`

`mgt`/`ins` 모듈에서 확립한 분리 규칙([../../ins/gcc/md/README.md](../../ins/gcc/md/README.md))을 그대로 따른다.

- **분석/트래킹(`_trk_*`)** → `trk.xml`(`$c.trk`). origin: `logger_tracking.xml`. ins/stf 의 `$c.trk` 와 동일 8개 알고리즘(트래킹 init 상태 주입 필요). fil 의 `logger_tracking.xml`은 ins/stf 사본이다.
- **문서 print(Rexpert 미리보기)** → `print.xml`(`$c.print`). origin: `report.xml`. fil 판은 **상장 외부리포트용 MarkAny(위변조방지)** 옵션을 포함한다(ins 판과의 차이). 화면별 변형(`fn_PrintPreView_DB`/`_JLDBNF*`/`_JLDINF*`)은 화면 전용으로 미이관.

---

## 검증

`python -m wsxml_lint src/as-is/fil/gcc` → `3 files, 0 errors, 0 warnings`.
- `fil.xml`(`$c.fil`, 7 공개 메서드 + 내부 `__rmComma`)
- `trk.xml`(`$c.trk`, 8 메서드)
- `print.xml`(`$c.print`, 1 메서드)
