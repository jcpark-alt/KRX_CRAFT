# ins.xml 함수 수정 내역

`src/as-is/ins/gcc/ins.xml`(`$c.ins`)에 적용한 함수 추출·표준화 사항을 정리한다.
(같은 폴더의 `trk.xml`은 `$c.trk`(분석/트래킹), `print.xml`은 `$c.print`(문서 인쇄) 분리 모듈이다.)

## 요약

| 대상 | 변경 유형 | 내용 |
|------|-----------|------|
| `$c.ins` 20개 함수 | **신규 빌드** | ins 모듈 업무공통 핵심 함수를 camelCase 표준화 + AS-IS 병기로 이관 |
| `trk*` 8개 | **분리** | 분석/트래킹 함수를 `trk.xml`(`$c.trk`)로 이관 (mgt 의 trk 분리 규칙 계승) |
| `print*` 6개 | **분리** | 문서 인쇄(Rexpert) 함수를 `print.xml`(`$c.print`)로 이관 |
| `setObjectValue` | **수정** | 레거시 `value.getValue()` 결함 → `obj.setValue(value)` 로 교정 |
| `getStringSize` | **흡수** | 공개 노출 제거, 내부 헬퍼 `__byteLength`(@hidden Y)로 흡수 |
| `getMessageParam` | **수정** | 전역 변수 `messageKeys` → 모듈 상수 `scwin.MESSAGE_KEYS`, 전역 `i` 누수 제거 |
| 날짜/문자 의존성 | **표준화** | `$c.ut.*`/`scwin.trim` 등 레거시 의존 → `$c.date.*`/`$c.str.*`/`$c.util.*` 로 교체 |

---

## 1. `$c.ins` 신규 빌드 (20개)

`ins` 모듈(39개 `.xml`, 약 780개 `scwin.*`)에서 **여러 화면이 재사용하는 핵심 업무공통** 함수만 선별 이관했다.
선별 기준과 전체 분류는 [`../../md/ins_function_analysis_report.md`](../../md/ins_function_analysis_report.md) 참조.

| 도메인 | 함수 | origin |
|------|------|--------|
| 종목검색 | `jongmokSearchReset`, `jongmokSearchRtn`, `jongmokSearchRtn2` | stockSearch.xml |
| 컴포넌트 값 get/set | `getObjectValue`, `setObjectValue` | stf.xml |
| 입력검증 | `checkEmptyValue`, `checkMaxLength` | stf.xml |
| 기간/일자 | `setFromToDate`, `setFromToDate1`, `compareFromToDate`, `compareFromToDate2` | stf.xml |
| 메시지 | `getMessageParam` | stf.xml |
| 표준코드 매핑 | `getStdCdToStdTpCd` | function.xml |
| 문자열 Hex | `toHex4`, `fromHex4` | person.xml |
| 로그저장 | `createXmlObj4LogSave`, `startLogSave`, `chkStats4LogSave`, `viewParameter4LogSave`, `doLogSave` | stf.xml |

> 화면 전용 비즈니스 로직(업무 팝업 오픈, ELW/상장 read, prelist 페이지 로직, 관리종목 업무규칙 등)은 `$c.ins`에 넣지 않고 마스터 리포트에 '업무공통(별도 관리)'로 카탈로그화했다.

## 2. `setObjectValue` — 레거시 결함 교정

AS-IS 는 text/edt/txa/rdo 분기에서 설정값(`value`, 문자열)에 대해 `value.getValue()`를 호출해
사실상 동작 불가였다(W-Craft 전환 잔존 결함). TO-BE 는 `obj.setValue(value)`로 교정했다.

```javascript
// AS-IS
if (obj.type == "text") { obj.setValue(value.getValue()); }   // value 는 문자열 → 결함
else if (obj.id.indexOf("edt") > -1) { obj.setValue(value.getValue()); }
// ...

// TO-BE
if (obj.type === "checkbox") { obj.setValue(value === "Y"); }
else if (obj.id.indexOf("cmb") > -1) { obj.setSelectedIndex(obj.IndexOfColumn("VALUE", value)); }
else { obj.setValue(value); }   // text/password/rdo/edt/txa 공통
```

## 3. `getStringSize` → 내부 헬퍼 `__byteLength`

바이트 길이 계산(`getStringSize`)은 공개 API 가 아닌 내부 헬퍼 `scwin.__byteLength`(@hidden Y, publicInfo 미등재)로 흡수하고 `checkMaxLength` 에서만 사용한다.
> 원본의 "한글 2 byte" 의미(`charCodeAt > 255 ? 2 : 1`)를 보존하기 위해 `$c.str.getByteLength`(UTF-8 바이트) 대신 내부 헬퍼를 유지했다.

## 4. `getMessageParam` — 메시지 테이블 모듈화

전역 변수 `messageKeys` 를 모듈 상수 `scwin.MESSAGE_KEYS`(KRX 공통메시지 40종)로 옮기고,
전역 `i` 누수(`for (i=...)`)를 `let i` 로 교정했다. `"^"` → `targetMsg` 치환 알고리즘은 원본 보존.

## 5. 날짜/문자 의존성 표준화

`fn_setFromToDate(1)` 등은 AS-IS 에서 `$c.ut.cGetMinusDate2/cGetMinusMonth/cGetMinusYear`(repo 밖)과
`scwin.trim` 에 의존했다. TO-BE 는 gcc 공통함수로 표준화:

```javascript
// AS-IS
vFrom = $c.ut.cGetMinusMonth(vTo.substring(0,4), vTo.substring(4,6), vTo.substring(6,8), 1);

// TO-BE
vFrom = $c.date.addMonth(vTo, -1);
```

- `getObjectValue`: `scwin.trim` → `$c.str.trim`.
- `setFromToDate*`: `$c.ut.cGetToday` → `$c.date.getServerDateTime`, `cGetMinus*` → `$c.date.addDate/addMonth/addYear`(음수 offset), 빈값 판정 `== ''` → `$c.util.isEmpty`.
- `compareFromToDate*`: `eval(...)` 비교 → `Number(...)` 비교.
- `dataFormatValue`(print): `$c.stf.FormatNumberEx`(repo 밖) → `$c.num.formatNumber`.

---

## 분리 규칙: 분석/트래킹 → `trk.xml`, 문서 print → `print.xml`

`mgt` 모듈에서 확립한 분리 규칙([../../mgt/gcc/md/README.md](../../mgt/gcc/md/README.md))을 그대로 따른다.

- **분석/트래킹(`_trk_*`)** → `trk.xml`(`$c.trk`). origin: `logger_tracking.xml`. mgt 의 `$c.trk` 구현과 동일 알고리즘(트래킹 init 상태 주입 필요).
- **문서 print(Rexpert 인쇄/PDF/미리보기)** → `print.xml`(`$c.print`). origin: `report.xml`. 판별 조건: 함수명이 print/인쇄/출력 의미를 갖거나, `rex_*`/`$c.rpt.*`/`window.print()`/PDF submit 등 인쇄·문서 출력을 호출.
  - `yearanulfee_print.xml`의 `fn_pre_print_stock/kosdaq`(연부과금 인쇄)도 본 모듈 편입 후보다(현재 미이관 — 화면 파라미터 의존도 확인 후 추가).

---

## 검증

`python -m wsxml_lint src/as-is/ins/gcc` → `3 files, 0 errors, 0 warnings`.
- `ins.xml`(`$c.ins`, 20 공개 메서드 + 내부 `__byteLength`)
- `trk.xml`(`$c.trk`, 8 메서드)
- `print.xml`(`$c.print`, 6 메서드)
