# gcc 공통 XML 작성 · 검증 가이드

`src/gcc`(및 `src/mgt/gcc` 등) 의 **WebSquare 공통함수 XML** 파일을 새로 만들거나 함수를 추가할 때 지켜야 할 규칙과 검증 절차를 정리한다.

---

## 1. 개요

- 공통함수는 `<w2:type>COMMON</w2:type>` 인 WebSquare 화면(`.xml`)이며, JavaScript 는 `<script><![CDATA[ ... ]]>` 안에 둔다.
- 각 파일은 **하나의 `$c.<네임스페이스>`** 를 등록한다(`meta_screenId` 로 지정). 예: `util.xml` → `$c.util`, `session.xml` → `$c.session`.
- 함수는 `scwin.함수명 = function () { ... }` 로 정의하고, 외부에서는 `$c.<네임스페이스>.함수명()` 으로 호출한다.

---

## 2. 파일 위치와 네임스페이스

| 항목 | 규칙 |
| :--- | :--- |
| 위치 | 표준 공통: `src/gcc/<name>.xml` · 모듈 업무공통: `src/<module>/gcc/<name>.xml` |
| `meta_screenId` | `$c.<id>` 형식 (예: `$c.util`, `$c.session`, `$c.mgt`) — 파일/도메인과 일치 |
| 호출 | 같은 파일 내부: `scwin.함수명()` · 다른 모듈: `$c.<id>.함수명()` |
| 내부(비공개) 헬퍼 | `scwin.__함수명` (이름 앞 `__`) — `@hidden Y`, **publicInfo 에 넣지 않음** |

---

## 3. XML 골격 (필수 구조)

아래 골격을 그대로 복사해 시작한다. lint(`wsxml_lint`)가 요구하는 요소를 모두 포함한다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
	xmlns:ev="http://www.w3.org/2001/xml-events"
	xmlns:w2="http://www.inswave.com/websquare" xmlns:xf="http://www.w3.org/2002/xforms">
	<head meta_screenName="ooo 관련 함수" meta_screenId="$c.ooo" meta_desc="ooo 관련 함수를 작성한다.">
		<w2:type>COMMON</w2:type>
		<w2:buildDate/>
		<w2:MSA/>
		<xf:model>
			<w2:dataCollection baseNode="map"/>
			<w2:workflowCollection/>
		</xf:model>
		<w2:layoutInfo/>
		<w2:publicInfo method="scwin.foo,scwin.bar"/>
		<script lazy="false" type="text/javascript"><![CDATA[// ===========================================================
/**
 * ooo 관련 함수.
 * @author Inswave Systems
 * @class ooo
 * @namespace $c.ooo
 */
// ===========================================================

scwin.onpageload = function () {

};

// ... 함수 정의 ...
]]></script>
	</head>
	<body ev:onpageload="scwin.onpageload"/>
</html>
```

### head 필수 구성요소

| 요소 | 필수 | 누락 시 lint |
| :--- | :---: | :--- |
| 루트 `xhtml:html` + `w2`/`xf` 네임스페이스 | ✅ | WS101 / WS102 |
| `<head>` | ✅ | WS110 (ERROR) |
| `@meta_screenId`, `@meta_screenName` | ✅ | WS111 (WARNING) |
| `<w2:type>COMMON</w2:type>` | ✅ | WS112 (ERROR) |
| `<xf:model>` | ✅ | WS112 (ERROR) |
| `<xf:model>` 안 `<w2:dataCollection baseNode="map">` | ✅ | WS113 (WARNING) / WS114(baseNode 는 `map`\|`list`) |
| `<w2:layoutInfo>` | ✅ | WS112 (WARNING) |
| `<w2:publicInfo method="...">` | ✅ | WS112 (WARNING) |
| `<body ev:onpageload="scwin.onpageload"/>` | 권장 | — |

> 모든 요소의 `@id` 는 문서 내에서 **유일**해야 한다(중복 시 WS120, ERROR).

---

## 4. 함수 작성 규칙

### 4.1 JSDoc (모든 함수 필수)

```js
/**
 * @method
 * @name isEmpty
 * @description 값이 비었는지 검사한다.
 * @param {Object} value 입력 값
 * @returns {Boolean} 비었으면 true
 * @hidden N
 * @exception
 * @example
$c.util.isEmpty(value);
 */
scwin.isEmpty = function (value) {
    // ...
};
```

- `@hidden N` = 공개(publicInfo 등재), `@hidden Y` = 내부(`__` 접두어, publicInfo 제외).
- `@param {Type} 이름 설명` / `@returns {Type} 설명` 형식. 타입은 `{Object}`, `{String}`, `{Boolean}`, `{Number}`, `{void}`, `{Promise<Object>}` 등.
- `@example` 아래 줄에 실제 호출 예시 코드를 둔다(주석 `*` 없이).
- 설명·예시는 **한국어** 로 작성(프로젝트 일관성).

### 4.2 코딩 컨벤션

- `var` 대신 **`const`/`let`** 사용.
- **기존 gcc 함수를 재사용**: 빈값 검사 `$c.util.isEmpty`, 문자열 `$c.str.*`, 숫자 `$c.num.*`, 날짜 `$c.date.*`, 통신 `$c.sbm.*`, 다이얼로그 `$c.win.alert/confirm`, 메시지 `$c.data.getMessage` 등 — 중복 구현 금지.
- 같은 파일 내부 호출은 `scwin.함수명()`, 다른 모듈 호출은 `$c.<id>.함수명()`.
- **`eval()` 금지** → `try/catch` 등으로 대체.
- 구형 브라우저 지원이 필요한 경우 최신 문법 남용 주의(기존 파일 스타일을 따른다).
- 외부 입력/컴포넌트 조회 결과는 **null/undefined 가드** (`$c.util.isEmpty` 등).

### 4.3 publicInfo 동기화 (중요)

- **공개 함수**(`@hidden N`)는 반드시 `<w2:publicInfo method="...">` 에 `scwin.함수명` 으로 등재한다.
- 함수 **추가/이름변경/삭제 시 publicInfo 도 함께 갱신**한다.
- publicInfo 에 있으나 CDATA 에 정의가 없으면 **WS201**(WARNING). 정의가 있으나 publicInfo 에 없으면 외부에서 `$c.<id>.함수` 호출 불가.

---

## 5. 검증 절차

### 5.1 명령

| 목적 | 명령 |
| :--- | :--- |
| 단일 파일 검증 | `python -m wsxml_lint src/gcc/<name>.xml` |
| gcc 전체(엄격) | `npm run lint:xml:gcc` (= `wsxml_lint src/gcc`) |
| 레거시(완화) | `npm run lint:xml:legacy` (`src/ins src/mgt src/stf --ignore WS111,WS112,WS113`) |
| 전체 | `npm run lint:xml` |
| API 문서 재생성 | `npm run docs:gcc` → `src/docs/api/gcc/index.html` |

> `wsxml_lint` 실행에는 Python 3.9+ 와 lxml 이 필요하다: `pip install "./tools/wsxml_lint[test]"`.

### 5.2 합격 기준

- **새/수정한 gcc 파일은 `0 errors, 0 warnings`** 여야 한다(WS111~113 포함 — 골격을 모두 갖추므로 경고가 나오면 안 됨).
- `--ignore` 로 경고를 덮지 말 것. 경고가 보이면 원인을 수정한다.

### 5.3 주요 룰 코드

| 코드 | 레벨 | 의미 |
| :--- | :--- | :--- |
| WS00x | wellformed | XML 구문 오류 (WS001) |
| WS101 / WS102 | structure | 루트 `xhtml:html` / 필수 네임스페이스(w2, xf) |
| WS110 / WS111 | structure | `<head>` 존재 / `@meta_screenId`·`@meta_screenName` |
| WS112 / WS113 / WS114 | structure | head 필수 자식 / `dataCollection` / `baseNode`(map\|list) |
| WS120 | structure | 문서 내 `@id` 중복 (ERROR) |
| WS201 | references | `publicInfo` 의 메서드가 CDATA 에 정의되지 않음 |
| WS4xx | schema | `--xsd` 지정 시 스키마 검증 |

필터 옵션: `--select WS201`, `--ignore WS111,WS112`, `--format json`, `--min-severity warning|error`.

### 5.4 문서 반영

- 함수를 추가했으면 `npm run docs:gcc` 로 `index.html` 을 **현행화**한다(공개 함수만 노출, `__`/`@hidden Y` 제외).

---

## 6. 레거시(mgt/ins/stf) → gcc 이관 시 추가 규칙

- **W-Craft 변환 아티팩트 수정**: `font-size__9pt` → `font-size:9pt`, `true__false : X` → `true : false` 등 콜론·삼항 깨짐.
- **모듈 외부 호출은 gcc 등가로 재작성**: `scwin.trim`→`$c.str.trim`, `FormatNumberEx`→`$c.num.formatNumber`, `$c.ut.cGet*`→`$c.date.add*`(음수 offset), 원시 XHR→`$c.sbm.*`.
- **중복 함수는 단일 구현으로 통합**: 같은 기능이 여러 곳에 있으면 정식 gcc 함수 하나만 두고 나머지는 그 함수를 호출(`$c.<id>.fn`)하도록 변경.
- **분류 후 문서 갱신**: 이관 결과를 `src/docs/api/mgt/*.md`(분석 리포트·매핑 명세)에 반영(업무공통→공통이관 등).
- **외부 전역 의존 코드**(예: 트래킹 `_trk_*`)는 알고리즘을 보존하되, 의존 전역(init)도 함께 이관해야 실제 동작함을 명시.

---

## 7. 체크리스트 (PR 전)

- [ ] `meta_screenId="$c.<id>"` 지정, 파일/도메인과 일치.
- [ ] head 골격(`w2:type`/`xf:model`+`dataCollection`/`layoutInfo`/`publicInfo`) 완비.
- [ ] 모든 공개 함수에 JSDoc(`@method`~`@example`) 작성, 한국어 설명.
- [ ] 공개 함수 ↔ `publicInfo` 일치(추가/삭제 동기화).
- [ ] 내부 헬퍼는 `__` + `@hidden Y` + publicInfo 제외.
- [ ] 기존 `$c.*` 함수 재사용(중복 구현·`eval` 없음, `const/let`).
- [ ] `python -m wsxml_lint <파일>` → **0 errors, 0 warnings**.
- [ ] (함수 추가 시) `npm run docs:gcc` 로 문서 현행화.
