# cm/gcc → gcc 머지 내역 · 정책

> **[폐기 공지 — 2026-08-18]** `src/cm/` 폴더는 더 이상 사용하지 않아 **삭제**되었다.
> `src/gcc/`가 유일한 canonical 공통 라이브러리이며, 아래 내용은 삭제 이전의 병합 이력 기록으로만 보존한다.
> (사본 자체는 git 이력에서 복원 가능.)

`src/cm/gcc/`(2026-06-10 `13b1994` 커밋으로 bnf/cm/fil/inf W-Craft 트리와 함께 추가)를
canonical 공통 라이브러리 `src/gcc/`에 "머지"할 때의 분석 결과·결정·실제 반영 내역을 정리한다.

## 핵심 결론

`src/cm/gcc/`(9개 파일)는 **모듈별 복사본**이며 **더 최신 버전이 아니다**. 9개 파일쌍을
전수 비교한 결과 **`src/gcc`가 거의 모든 면에서 canonical(더 최신·상위집합) 복사본**이다.

| 파일 | 관계 | cm/gcc의 고유 내용 |
|------|------|--------------------|
| `date/num/str/util.xml` | `src/gcc`가 **strict 상위집합** (gcc에 date +17, num +6, str +17, util +24 함수) | 없음 — cm/gcc는 더 오래됨(`substr()` 사용, JSDoc 복붙 버그) |
| `hkey.xml`, `ext.xml` | **바이트 동일** | 없음 |
| `data.xml` | gcc가 더 최신(async/await `setCommonCode`) | 다른 **백엔드 계약**(`/api/common/sample/common-codes`, 필드명 `cdVal`/`cdValNm`/`DEP_CD`) |
| `sbm.xml` | cm/gcc가 더 큼 | ✅ 일반적으로 유용: 중복 제출 가드(`__applyDuplicateGuard` + `allowDuplicate`/`onDuplicate`). 단 gcc의 `setPagingInfo` 누락 |
| `win.xml` | 혼재 | CM 전용: `goHomeEx` + 하드코딩 `/cm/main/index.xml` 랜딩, 단일 프레임 GNB 네비 재작성, `pushState` no-op, publicInfo 깨짐(`__getI18NUrl`/`pushMeta` 선언만·미정의 = WS201) |

> 따라서 "cm/gcc를 gcc에 머지"를 **그대로 덮어쓰면 대부분 파일이 회귀**하고, CM 전용 동작이
> 공유 라이브러리에 섞여 `ins/mgt/stf`를 깨뜨린다.

## 합의된 정책 (cherry-pick)

- **일반적으로 유효한 개선만** `src/gcc`에 선별 반영한다.
- **CM 전용 백엔드/UI 동작은 제외**한다 (예: `src/gcc/sbm.xml`의 `IS_RESTFUL_URL = false` 유지).
- 다른 모듈별 트리(bnf/inf 등도 gcc 유사/벤더 복사본 보유)에도 같은 정책을 적용한다.
- `src/cm/gcc/` 자체는 그대로 둔다 (cm 모듈이 여전히 사용).

## 실제 반영 내역 (2026-06-10)

### `src/gcc/sbm.xml` — 커밋 `7da21f9`
- 중복 제출 가드 이식: private `scwin.__applyDuplicateGuard` + `execute()`/`executeDynamic()`에
  `allowDuplicate`/`onDuplicate` 옵션.
  - `ignore`(기본): 통신 진행 중 재호출 무시(더블클릭/연타 방지), `{ skipped:true }`로 resolve.
  - `abort`: 진행 중 요청 취소 후 최신 요청 실행(검색 자동완성 등).
- 부수 개선: `execute()`가 잘못된 sbmObj/빈 action에서 silent return 대신 reject → **pending-Promise 누수 수정**.
- 가드는 `__`/`@hidden Y`이며 **publicInfo 미포함**(strict 린트 유지).

### `src/gcc/data.xml` — 커밋 `c515bf1`
- 사용자 명시 요청으로 cm의 `COMMON_CODE_INFO` 필드명 채택:
  `LABEL:"cdValNm"`, `VALUE:"cdVal"`, `FILED_ARR:["DEP_CD","cdVal","cdValNm"]`, `ACTION` 추가.
- `__getCommonCodeData`를 `COMMON_CODE_INFO.ACTION` 기반으로 **엔드포인트 배선**:
  REST GET, 코드를 `?cdEngNmList=`에 덧붙임, 응답은 `responseJSON.body`에서 읽음,
  캐시 키는 `DATA_PREFIX + code`로 정규화(`.body` 래퍼 없거나 이미 prefixed인 경우 방어 처리).

> ⚠️ **미검증 가정**: 위 REST 요청/응답 형태(`?cdEngNmList=` GET, `{ body: { code: [...] } }`)는
> cm의 *수작업 유의(conversion-flagged)* 코드에서 가져온 것으로 **실제 백엔드와 대조 확인 필요**.
> 컬럼은 `DEP_CD`/`cdVal`/`cdValNm` 가정. (cm에 있던 캐시 키 버그 — bare code로 저장하고
> prefixed로 조회 → 캐시 미스 — 는 의도적으로 복제하지 않음.)

## 검증

- `npm run lint:xml` → `src/gcc` strict **11 files 0/0**, legacy **107 files 0/0** 유지.
- 동작 검증은 배포된 WebSquare 화면에서만 가능(이 repo에 실행 단계 없음).
