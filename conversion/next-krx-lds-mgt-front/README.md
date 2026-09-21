# next-krx-lds-mgt-front 전환 기록

- `ui/` — W-Craft 1차 변환 원본(수정 금지), `ui-tobe/` — Stage 1(`convert.py`) + Stage 2 보강 산출물 165화면.
- 업무공통은 **`cm/pcc/mgt/`**(mgt.xml `$c.mgt`·main.xml) 를 참조한다(사용자 확정 2026-09-21 — [conversion_playbook.md §0](../md/conversion_playbook.md)). gcc(`cm/gcc`)는 공통. 1차 재전환(4a3da53)은 pcc/mgt 반입 전에 **pcc/stf 가정**으로 수행했고, 2차(아래)에서 pcc/mgt 기준으로 재대조했다. 3차에서 `cm/pcc/mgt/common.xml`(`$c.cm`, pcc/stf common.xml 사본) 이 반입되어 발행사검색 `$c.cm.comIsur/comConfirmSet/comIsurNm` 6회도 해소 — 미정의 0.

## 2026-09-21 — pcc/stf 기준 재전환 (11파일)

`convert.py` dry-run 은 고정점(84파일 CDATA 첫 줄 결합 차이만)이라 기계 패스 없음. gcc 13모듈 + pcc/stf publicInfo 와 대조한 미정의 `$c` 호출 **49회(13종) → 0**.

| 구분 | 치환 | 파일 |
|------|------|------|
| 화면 로컬 `$c.cm.*` 8정의 삭제 → pcc/stf | `ULDMGT10108`·`10110`·`10201` 이 `$c.cm` 위에 직접 정의하던 발행사검색 8함수(`IsurTagetPos`/`fn_com_grid_pos`/`IsurcdSearch`/`isurSearch_Rtn`/`fn_com_isur_sync`/`fn_com_isur`/`fn_com_Confirm_set`/`fn_com_isur_nm`)와 상태 선언(`stFocusGrid`, `js_com_Isurcd/Isurnm/left/top`, `frame.Provider("/top").ps_market` 기반 `js_com_market`)을 삭제. 진입 `scwin.fn_com_isur(isur_cd, isur_nm)` → **`await $c.cm.comIsur(isur_cd, isur_nm)`**(autoComplete 바인더 — 시장구분은 공통이 `$c.session.getUserInfo("market")` 로 취득) | 3 |
| `ULDMGT95030` 동일 정리 | scwin 사본 8함수(`comIsur`/`comIsurSync`/`isurSearch_Rtn`/`comConfirmSet`/`IsurcdSearch`/`IsurTagetPos`/`comGridPos`/`comIsurNm`)와 마크업에 없는 Gauce 그리드 `Grd_com_isur` 핸들러 5종·미바인딩 `txb_isur_cd_onblur/onfocus`, head 의 `sbm_MxDataSet_com_isur` 서브미션 삭제. `txb_isur_cd_onkeyup` 은 Enter → `$c.cm.comConfirmSet()`, 그 외 `$c.cm.comIsurNm(keyCode)`(↓키 그리드 포커스 분기는 autoComplete 기본 동작으로 대체). `gform_onload` → `await $c.cm.comIsur(txb_isur_cd, txb_com_abbrv)`(async 화) | 1 |
| 발행회사검색 팝업 — 화면 로컬 유지 | pcc/stf `$c.cm.isurcdSearch` 는 팝업(ULDCOM00007)이 `$c.cm.isurSearchRtn` 을 되부르는 **콜백 계약**인데, 본 모듈의 `common/ULDCOM00007` 은 `$c.win.closePopup("코드^명")` 로 값을 돌려주는 **반환값 계약**이라 그대로 쓰면 선택값이 유실된다. 4화면에 `scwin.isurcdSearch(codeComp, labelComp)`(openPopup await → setValue) 를 두고 `/common/ULDCOM00007.gfm`(Gauce 경로) → `/ui/common/ULDCOM00007.xml`, 크기는 pcc 와 동일(618×730) | 4 |
| 개명·네임스페이스 이동 | `$c.cm.submitSearch_Rtn` → `submitSearchRtn`(ULDCOM00008); `$c.cm.setColumnProp` → **`$c.cp.setColumnProp`**(30309) | 2 |
| 삭제된 `$c.ut`/미반입 `$c.mgt` → gcc | `$c.ut.cGetToday("yyyymmdd")` → `$c.date.getServerDateTime()`(30301·42045·80235), `('yyyymmddhhmmss')` → `getServerDateTime("yyyyMMddHHmmss")`(80235), `$c.mgt.getSysDate()` → `getServerDateTime()`(ULDMGT_N010) | 4 |
| `$c.frame` 잔존 제거 | `ULDMGT40008` 의 `scwin.InfoMenuID`(정의만 있고 호출 없음, `$c.frame.path("/pageIndex")` 사용) 삭제 — 필요 시 pcc/stf `$c.cm.infoMenuID()`(= `$c.win.getProgramId()`). 95030 의 `$c.frame.path("/top").ps_market` 은 상태 선언과 함께 삭제 | 2 |
| 고정점 정렬 | 로컬 `$c.cm` 정의가 사라지자 10108·10110·10201 에 `convert.py` 가 5구역 헤더와 규칙 26(try/catch·handleError) 래핑을 적용 → 출력 채택(내용 삭제 0, 추가만) | 3 |

### 보류·확인 필요
- `$c.cm.comIsurNm`/`comConfirmSet` 은 pcc/stf 가 컴포넌트 id `txb_isur_cd`/`txb_com_abbrv` 를 고정 참조 — 95030 은 id 가 일치하고, 10108·10110·10201(`isur_cd`/`isur_nm`)은 이 두 함수를 부르지 않는다(autoComplete 바인더만 사용).
- `common/ULDCOM00008` 은 부모의 `js_com_market` 을 읽지만(`$c.win.getParent()?.js_com_market ?? ""`), 본 모듈 안에서 이 팝업을 여는 화면은 없다.
- 기존 결함(이번 미변경): `ULDMGT_N010` WS120(grd_dept 내 `chk` 컬럼 id 중복) — 그리고 CDATA 첫 줄에 놓인 `///////// 2. 초기화 영역` 헤더를 `convert.py` 의 첫 줄 결합이 삼켜 재변환 시 1줄 차이(HEAD 동일). body `ev:`·publicInfo↔정의·0열 여닫힘 문제 파일 HEAD 21 → 18(신규 0; 줄어든 3건은 삭제한 `const data = {` … `};` 잔재).

### 검증
`python -m wsxml_lint conversion/next-krx-lds-mgt-front/ui-tobe --ignore WS111,WS112,WS113` 165 files 0 warnings(오류 1 = 기존 WS120) · CDATA `node --check` 165/165 · 미정의 `$c` 호출 0(gcc 957·pcc/stf 23) · 변경 11파일 `convert.py` 재실행 내용 변화 0(N010 의 첫 줄 헤더 1줄 제외) · 잔존 토큰(`stFocusGrid`/`js_com_`/`Grd_com_isur`/`fn_com_`/`$c.ut`/`$c.mgt`/`$c.frame`) 0.

## 2026-09-21 (2차) — pcc/mgt 기준 재대조 (5파일)

`cm/pcc/mgt/`(mgt.xml `$c.mgt` 32·main.xml) 반입 후 gcc + pcc/mgt 만으로 대조: 미정의 **23회(9종) → 6회(3종)**. pcc/mgt 에는 `$c.cm`·`$c.cp`·`$c.stf` 가 없으므로 1차에서 pcc/stf 로 보냈던 호출을 gcc·엔진 API·문자열로 내렸다.

| 화면 | 치환 | 근거 |
|------|------|------|
| `ULDMGT30301` | `$c.stf.getMessageParam("MSG-A001/A002/A005", X)` 10회 → pcc/stf 메시지표의 문구를 그대로 문자열화(`"[X] 처리 성공하였습니다."`·`"[X] 처리 실패하였습니다."`·`"[X] 을(를) 입력하셔야 합니다."`); `eval($c.stf.getStringSize(obj.value/obj.text) - size)` → `$c.str.getByteLength(obj.getValue()) - size`(둘 다 한글 2byte 계산, `checkMaxLength1/2` 는 제목 textbox·내용 textarea 에서 호출됨) | pcc/mgt 에 메시지·바이트 공통 없음 |
| `ULDMGT30309` | `$c.cp.setColumnProp(grd_Receiver, 'CHECK', 'HeadCheck', "false")` 2회 삭제 — 전환 그리드의 CHECK 컬럼에 헤더 체크박스(`useCheckAll`)가 없고 `OnHeadCheckClick` 핸들러도 없어 무의미(pcc/stf 구현도 HeadCheck 를 무시했음) | 대응 없음 |
| `ULDMGT42045` | `$c.cp.valueOfIndex(cb_system_gbn, "VALUE", idx)` → `cb_system_gbn.getValue()`; `getNameValueRow(MxDataSet_code1, "CD_VAL", v)` + `setSelectedIndex(idx-1)` → `cb_system_gbn.setValue(v)` | select1 엔진 API 로 직접 표현 |
| `common/ULDCOM00008` | `$c.cm.submitSearchRtn(code, nm)` + `closePopup()` → `closePopup(code + "^" + nm)` | ULDCOM00007 과 같은 모듈 팝업 반환값 계약(본 모듈에서 여는 화면은 아직 없음) |
| `ULDMGT_N010` | `$c.date.getServerDateTime()` → **`$c.mgt.getSysDate()`** 복원(pcc/mgt 정의, 본문은 gcc 위임) | 모듈 공통 우선 |

### 보류 — pcc/mgt 반입 필요
- 발행사검색 `$c.cm.comIsur`(10108·10110·10201·95030)·`comConfirmSet`·`comIsurNm`(95030): autoComplete 바인더(`searchIsurCode` + 포맷터·`jongmokNameSearch` 의존)가 pcc/stf `common.xml` 에만 있다. pcc/mgt 에 같은 함수를 반입하면 호출 변경 없이 해소되고, 반입하지 않으면 4화면에 로컬 사본(약 150줄×4)이 필요하다.
- 30309 수신자 그리드의 헤더 전체선택은 전환 마크업에서 사라진 기능 — 필요하면 CHECK 컬럼에 `useCheckAll` 부여로 복원.

### 검증(2차)
lint 165 files 0 warnings(오류 1 = 기존 WS120) · `node --check` 165/165 · 문제 파일 18 → 18 · 변경 5파일 `convert.py` 재실행 내용 변화 0(N010 첫 줄 헤더 제외) · 미정의 `$c` 호출 6 = 보류 목록.

## 2026-09-21 (3차) — `cm/pcc/mgt/common.xml` 반입 후 재대조 (화면 변경 0)

`cm/pcc/mgt/common.xml` = `cm/pcc/stf/common.xml` 사본(2588줄, `$c.cm` 72 공개 함수). 화면 호출은 이미 `$c.cm.comIsur`·`comConfirmSet`·`comIsurNm` 이라 변경 없이 gcc + pcc/mgt 대조 **미정의 6 → 0**(pcc/mgt 해소 7회 = 발행사검색 6 + `$c.mgt.getSysDate` 1).

- 사본 조정 1건: 파일 안의 `$c.stf.getObjectValue` 3곳(`changeCheck` 2 + 주석 1) → **`$c.mgt.getObjectValue`**(mgt 배포에는 `$c.stf` 가 없고 pcc/mgt mgt.xml 에 동명 함수가 있음). 그 외 타 pcc 네임스페이스 의존 없음(주석 제외). mgt 화면이 타는 경로(`comIsur→searchIsurCode`, `comConfirmSet`, `comIsurNm→jongmokNameSearch`)는 gcc 만 사용.
- 참고: 사본에는 stf 전용 팝업 경로(`/ui/dis/...`)를 여는 함수도 그대로 들어 있다 — mgt 에서 쓰지 않는 함수는 정리 대상.
- API 문서: `npm run docs:pcc:mgt` → `cm/docs/api/mgt/index.html`(3 modules, 109 methods).

### 검증(3차)
`python -m wsxml_lint cm/pcc/mgt` 3 files 0/0 · 미정의 `$c` 호출 0 · 화면 파일 변경 없음(2차 게이트 유지).
