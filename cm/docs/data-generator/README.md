제공해주신 새로운 데이터 형식을 반영하여 기획 문서를 최종 업데이트했습니다. 3번째 라인이 '샘플 값' 대신 '한글 명칭(타입, 제목, 내용 등)'으로 명확해짐에 따라, 변환 결과의 `name` 속성이 보다 직관적이고 실무에 맞게 매핑되도록 예시와 세부 내용을 보완했습니다.

---

# [Plan] WebSquare Data Collection Generator 개발 계획 (V4)

이 문서는 복사된 텍스트 데이터를 기반으로 웹스퀘어(WebSquare5)의 `dataMap` 및 `dataList` XML 코드를 자동으로 생성해주는 단일 HTML 페이지(Generator)의 개발 계획을 담고 있습니다.

## 1. 개요 및 목적

* **목적**: 개발자가 명세서 등에서 복사한 텍스트를 활용해 웹스퀘어 데이터 객체(`w2:dataMap`, `w2:dataList`)를 수동으로 타이핑하는 번거로움을 줄입니다.
* **형태**: 외부 라이브러리 의존성을 최소화한 단일 HTML 파일 (Vanilla JS 기반).

---

## 2. UI/UX 및 입력 항목 요구사항

### 2.1 입력 폼 구성

1. **데이터 타입 선택 (Radio Button)**
* `dataMap` 또는 `dataList` 선택


2. **ID 입력 (Text Input)**
* 사용자가 기본 ID를 입력하면, 선택된 타입에 따라 Prefix가 자동 적용됩니다.
* `dataMap` 선택 시: `dma_` + [입력값]
* `dataList` 선택 시: `dlt_` + [입력값]




3. **원본 텍스트 입력 (Textarea)**
* 엔터(`\n`)를 기준으로 데이터가 파싱되는 입력창.


4. **실행 버튼 (Button)**
* `Generator` 버튼: 파싱 및 XML 생성 실행.



### 2.2 출력 및 편의 기능

1. **결과 표시 창 (Textarea)**
* 생성된 웹스퀘어 XML 코드가 Read-only 형태로 표시됩니다.


2. **복사 버튼 (Button)**
* `Copy` 버튼: 결과 창의 텍스트를 클립보드에 즉시 복사하고 안내 메시지(Toast 또는 Alert)를 노출합니다.



---

## 3. 웹스퀘어 지원 dataType 사양

Generator는 파싱된 데이터 타입을 기반으로 아래의 웹스퀘어 표준 `dataType` 속성값을 매핑하여 생성해야 합니다.

| Value | Description |
| --- | --- |
| `"text"` | Column에 문자 형식의 데이터가 저장됩니다. |
| `"number"` | Column에 숫자 형식의 데이터가 저장됩니다.<br>

<br>- 숫자를 String형으로 설정 시 String형으로 저장됩니다.<br>

<br>- 단, `setJSON()`과 같은 set 계열 메소드에서 숫자를 String형으로 설정 시 Number형으로 형변환됩니다. |
| `"bigDecimal"` | Column에 BigDecimal 형식의 데이터가 저장됩니다.<br>

<br>- 메소드에서 BigDecimal 형식으로 처리하려면 숫자를 String형으로 설정하여야 합니다. |
| `"date"` | Column에 날짜 형식의 데이터가 저장됩니다. |
| `"time"` | Column에 시간 형식의 데이터가 저장됩니다. |
| `"json"` | Column에 JSON 형식의 데이터가 저장됩니다.<br>

<br>- Column에 `JSON.stringify()` 처리 후 저장되며, 메소드로 조회 시 `JSON.parse()` 처리 후 반환됩니다. |

---

## 4. 데이터 파싱 및 타입 매핑 규칙 (Core Logic)

### 4.1 입력 텍스트 구조

입력되는 텍스트는 엔터(`\n`)를 기준으로 **[ID], [DataType], [Name(한글명)]** 순서가 반복되는 구조입니다. 빈 줄은 유연하게 무시되도록 처리합니다.

> **구조 예시 (3줄이 하나의 컬럼을 형성)**
> ```text
> TYPE       <- (1) ID
> number     <- (2) 입력 DataType
> 타입       <- (3) Name (웹스퀘어의 name 속성으로 변환)
> 
> ```
> 
> 

### 4.2 데이터 타입 자동 매핑 및 대소문자 전처리 로직

사용자가 입력한 DataType 텍스트의 다양한 형태(대소문자 혼재, 공백 등)에 대응하기 위해, **판별 전 대문자 변환(`toUpperCase()`) 및 공백 제거(`trim()`) 처리**를 반드시 수행합니다.

* **전처리 예시**: `String` $\rightarrow$ `STRING`, `Number` $\rightarrow$ `NUMBER`
* **최종 매핑 조건 테이블**:

| 전처리 후 입력값 (Upper Case & Trim) | 웹스퀘어 변환 결과 (`dataType`) |
| --- | --- |
| `STRING`, `TEXT`, `CHAR`, `VARCHAR`, `VARCHAR2` | `"text"` |
| `NUMBER`, `INT`, `INTEGER`, `FLOAT`, `DOUBLE`, `NUMERIC` | `"number"` |
| `BIGDECIMAL`, `DECIMAL` | `"bigDecimal"` |
| `DATE`, `TIMESTAMP`, `DATETIME` | `"date"` |
| `TIME` | `"time"` |
| `JSON`, `OBJECT`, `ARRAY` | `"json"` |
| *기타 정의되지 않은 모든 타입* | `"text"` *(기본값)* |

---

## 5. 웹스퀘어 XML 생성 템플릿

### 5.1 w2:dataMap Template

```xml
<w2:dataMap id="${computedId}" baseNode="map">
	<w2:keyInfo>
		<w2:key id="${columnId}" name="${columnName}" dataType="${mappedDataType}"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

### 5.2 w2:dataList Template

```xml
<w2:dataList id="${computedId}" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="${columnId}" name="${columnName}" dataType="${mappedDataType}"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```

---

## 6. 구현 상세 단계 (Implementation Steps)

### Step 1: HTML 구조 및 스타일링 (UI)

* 깔끔하고 직관적인 레이아웃 구성 (모던한 CSS Grid 또는 Flexbox 활용).
* 결과물 확인이 용이하도록 결과 Textarea는 넓은 영역을 할당.

### Step 2: 자바스크립트 파싱 및 매핑 알고리즘 구현

1. Textarea의 value를 가져와 줄바꿈(`\n`) 단위로 split 후, 공백 줄 제거.
2. 3줄씩 묶어 Object Array로 변환 유도.
3. **타입 변환 함수 구현**:
```javascript
function getWebSquareDataType(inputType) {
    const type = String(inputType).toUpperCase().trim();
    if (['STRING', 'TEXT', 'CHAR', 'VARCHAR', 'VARCHAR2'].includes(type)) return 'text';
    if (['NUMBER', 'INT', 'INTEGER', 'FLOAT', 'DOUBLE', 'NUMERIC'].includes(type)) return 'number';
    if (['BIGDECIMAL', 'DECIMAL'].includes(type)) return 'bigDecimal';
    if (['DATE', 'TIMESTAMP', 'DATETIME'].includes(type)) return 'date';
    if (['TIME'].includes(type)) return 'time';
    if (['JSON', 'OBJECT', 'ARRAY'].includes(type)) return 'json';
    return 'text';
}

```



### Step 3: XML 문자열 조립 및 출력

1. 선택된 라디오 버튼과 ID 입력값을 조합하여 `dma_` / `dlt_` ID 생성.
2. 템플릿 리터럴을 사용하여 들여쓰기(`\t`)가 적용된 깔끔한 XML 문자열 생성.
3. 결과 창에 바인딩.

### Step 4: 클립보드 복사 기능

* `navigator.clipboard.writeText` API를 사용하여 결과 코드를 원터치로 복사할 수 있도록 구현.

---

## 7. 예시 데이터 테스트 케이스

**[입력 텍스트]**

```text
TYPE
number
타입

SUBJECT
string
제목

CONTENT
string
내용

IS_USE
string
사용여부

REG_DATE
date
등록일자

```

### 테스트 케이스 A: dataMap 변환 결과

* **선택 조건**: `dataMap`, 입력 ID: `search` (최종 ID: `dma_search`)
* **기대 출력물**:

```xml
<w2:dataMap id="dma_search" baseNode="map">
	<w2:keyInfo>
		<w2:key id="TYPE" name="타입" dataType="number"></w2:key>
		<w2:key id="SUBJECT" name="제목" dataType="text"></w2:key>
		<w2:key id="CONTENT" name="내용" dataType="text"></w2:key>
		<w2:key id="IS_USE" name="사용여부" dataType="text"></w2:key>
		<w2:key id="REG_DATE" name="등록일자" dataType="date"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

### 테스트 케이스 B: dataList 변환 결과

* **선택 조건**: `dataList`, 입력 ID: `common` (최종 ID: `dlt_common`)
* **기대 출력물**:

```xml
<w2:dataList id="dlt_common" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="TYPE" name="타입" dataType="number"></w2:column>
		<w2:column id="SUBJECT" name="제목" dataType="text"></w2:column>
		<w2:column id="CONTENT" name="내용" dataType="text"></w2:column>
		<w2:column id="IS_USE" name="사용여부" dataType="text"></w2:column>
		<w2:column id="REG_DATE" name="등록일자" dataType="date"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```