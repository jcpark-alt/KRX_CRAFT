# mgt.xml 함수 수정 내역

`src/as-is/mgt/gcc/mgt.xml`(`$c.mgt`)에 적용한 함수 수정 사항을 정리한다.
(같은 폴더의 `trk.xml`은 mgt.xml에서 분리해 나온 `$c.trk` 모듈이다.)

## 요약

| 함수 | 변경 유형 | 내용 |
|------|-----------|------|
| `trk*` 8개 | **분리** | 분석/트래킹 함수를 `trk.xml`(`$c.trk`)로 이관. publicInfo 24→16개 |
| `fillGridHeaderTotalCnt` | **수정** | `innerHTML` HTML 구성 → `setValue`/`show` 컴포넌트 API |
| `panelMsg` | **수정** | `innerHTML` HTML 구성 → `setValue`/`show` 컴포넌트 API |
| `comboCbDataSetPeriod` | **수정** | `CBData` 문자열 → `itemArr` 객체 배열 |

---

## 1. 분석/트래킹(trk*) 함수 분리 → `trk.xml`

`trkEscape`, `trkSetCookie`, `trkGetCookie`, `trkGetParameter`, `trkMakeCode`,
`trkFlashContentsView`, `trkClickTrace`, `trkAdClick` (+ 모듈 상태 `_TRK_U`/`_EXEN`)를
같은 폴더의 신규 `trk.xml`(`meta_screenId="$c.trk"`)로 이관했다.

- mgt.xml `publicInfo`에서 trk 8개 제거(24→16), `meta_desc`/헤더 주석에서 "분석/트래킹" 문구를 "trk.xml로 분리" 안내로 갱신.
- repo 내 `$c.*.trk*` 호출처가 없어 네임스페이스 이동(`$c.mgt`→`$c.trk`)은 안전.
- API 문서: `src/docs/api/mgt/index_trk.html` 신규 생성, `index_mgt.html`에서 trk 제거.

## 2. `fillGridHeaderTotalCnt(vRsltCnt, panelID)`

그리드 헤더 패널의 총건수 표시를 DOM `innerHTML`(HTML 테이블 문자열) 방식에서
WebSquare 컴포넌트 API로 교체.

```javascript
// AS-IS
const vTotalArea = "<span ...>총건수: </span><span ...>" + $c.num.formatNumber(vRsltCnt) + "</span>";
panelID.innerHTML = "<table ...> ... " + vTotalArea + " ... </table>";

// TO-BE
panelID.setValue(vRsltCnt);
panelID.show("");
```

> 동작 변화: 천단위 콤마(`$c.num.formatNumber`)·"총건수:" 라벨 제거, 원값만 전달.
> `panelID`는 DOM 엘리먼트가 아닌 컴포넌트(`setValue`/`show` 보유)여야 한다.

## 3. `panelMsg(panelID, msg)`

지정 패널의 메시지 표시를 `innerHTML`에서 컴포넌트 API로 교체.

```javascript
// AS-IS
const vTotalArea = "<span ...>" + msg + "</span>";
panelID.innerHTML = "<table ...> ... " + vTotalArea + " ... </table>";

// TO-BE
panelID.setValue(msg);
panelID.show("");
```

> `panelID`는 컴포넌트(`setValue`/`show` 보유)여야 한다.

## 4. `comboCbDataSetPeriod(sval)`

기간 콤보 데이터를 `CBData`(`라벨^값,...`) 문자열에서 `itemArr` 객체 배열로 교체.

```javascript
// AS-IS
sval.CBData = "1주일전^1,1개월전^2,3개월전^3,6개월전^4,1년전^5,2년전^6";

// TO-BE
sval.itemArr = [
    { label: "1주일전", value: 1, orgLabel: "1주일전" },
    { label: "1개월전", value: 2, orgLabel: "1개월전" },
    { label: "3개월전", value: 3, orgLabel: "3개월전" },
    { label: "6개월전", value: 4, orgLabel: "6개월전" },
    { label: "1년전", value: 5, orgLabel: "1년전" },
    { label: "2년전", value: 6, orgLabel: "2년전" }
];
```

---

## 분리 규칙: 문서 print 관련 함수 → `print.xml`

공통함수 중 **문서 print(인쇄/출력) 관련 함수**는 `mgt.xml`에 두지 않고
같은 폴더의 별도 파일 `print.xml`(`meta_screenId="$c.print"`)로 분리해 생성한다.
(분석/트래킹 함수를 `trk.xml`로 분리한 [1번 항목](#1-분석트래킹trk-함수-분리--trkxml)과 동일한 방식.)

**분리 대상 판별 조건** — 함수가 다음 중 하나라도 해당하면 print 함수로 보고 `print.xml`로 이관한다.

- 함수명이 print/인쇄/출력 의미를 가짐 (`*print*`, `*Print*`, `fn_print*`, `*출력*` 등).
- 브라우저 인쇄(`window.print()`) 또는 리포트/문서 출력 솔루션(`$c.rpt.*` 등)을 호출.
- 화면 표시가 아니라 인쇄용 문서/미리보기 생성·레이아웃을 목적으로 함.

**이관 시 처리(요약)** — trk 분리와 동일한 절차를 따른다.

- 대상 함수 + 관련 모듈 상태(있다면)를 신규 `print.xml`(`meta_screenId="$c.print"`)로 이동.
- `mgt.xml` `publicInfo`에서 이관 함수 제거하고, `meta_desc`/헤더 주석을 "print.xml로 분리" 안내로 갱신.
- 호출처 네임스페이스(`$c.mgt.*` → `$c.print.*`)를 함께 변경(repo 내 호출처 확인 후).
- API 문서: `src/docs/api/mgt/index_print.html` 신규 생성, `index_mgt.html`에서 print 함수 제거.
- `python -m wsxml_lint src/as-is/mgt/gcc/print.xml`이 `0 errors, 0 warnings`인지 확인.

> 현재 `mgt.xml`에는 print 관련 함수가 없어 실제 이관은 발생하지 않았다.
> 이후 print 함수가 추가/식별되면 본 규칙에 따라 `print.xml`로 분리한다.

---

검증: `python -m wsxml_lint src/as-is/mgt/gcc/mgt.xml` → `0 errors, 0 warnings`.
