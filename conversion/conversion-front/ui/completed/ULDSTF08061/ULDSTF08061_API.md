## 1. [ULDSTF08061][ETN] 유동성공급자(LP) 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_init`
*   **TO-BE** : `get /api/listing/lstproc/etn/code/list-lpCd`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_lpCd=body"
}
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_lpCd" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="value" name="코드값" dataType="text"></w2:column>
		<w2:column id="text" name="코드명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 2. [ULDSTF08061][ETN] 보증인 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/code/list-srtyCd`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_srtyCd=body"
}
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_srtyCd" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="value" name="코드값" dataType="text"></w2:column>
		<w2:column id="text" name="코드명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 3. [ULDSTF08061][ETN][순자본비율] 발행사/LP 순자본비율 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_list_sync1`
*   **TO-BE** : `get /api/listing/lstproc/etn/ncr/select-list-isur-lp-ncr`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_isurLpNcr=body"
}
// requestData 지정
const requestData = {
    gubun: "",
	fromYymm: "",
	toYymm: "",
	isurLpCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_isurLpNcr" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="isurCd" name="발행기관코드 - 발행사(isur) 조회 시 채워짐" dataType="text"></w2:column>
		<w2:column id="isurLpCd" name="LP회원번호 - 유동성공급자(lp) 조회 시 채워짐" dataType="text"></w2:column>
		<w2:column id="comAbbrv" name="회사명/연월" dataType="text"></w2:column>
		<w2:column id="basYymm" name="기준년월(YYYYMM)" dataType="text"></w2:column>
		<w2:column id="fbzNetcap" name="영업용순자본" dataType="text"></w2:column>
		<w2:column id="totRiskAmt" name="총위험액" dataType="text"></w2:column>
		<w2:column id="reqPersisPrincCapVal" name="필요유지 자기자본" dataType="text"></w2:column>
		<w2:column id="ncr" name="순자본비율" dataType="text"></w2:column>
		<w2:column id="ncrPre1" name="전월 순자본비율 - 단월조회에서만 채워짐" dataType="text"></w2:column>
		<w2:column id="ncrPre2" name="전전월 순자본비율 - 단월조회에서만 채워짐" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 4. [ULDSTF08061][ETN][순자본비율] 보증인 자기자본비율 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_list_sync2`
*   **TO-BE** : `get /api/listing/lstproc/etn/ncr/select-list-srty-cap-rto`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_srtyCapRto=body"
}
// requestData 지정
const requestData = {
    fromYymm: "",
	toYymm: "",
	srtyCd: "",
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_srtyCapRto" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="srtyCd" name="보증인코드" dataType="text"></w2:column>
		<w2:column id="srtyAbbrv" name="회사명/연월" dataType="text"></w2:column>
		<w2:column id="basYymm" name="기준년월(YYYYMM)" dataType="text"></w2:column>
		<w2:column id="princCapRtoKindCd" name="비율종류(공통코드 03697 코드명)" dataType="text"></w2:column>
		<w2:column id="riskAsstVal" name="위험자산/책임준비(B)" dataType="text"></w2:column>
		<w2:column id="basEqtycap" name="(기본)자기자본(A)" dataType="text"></w2:column>
		<w2:column id="etnSrtyPrincCapRto" name="비율(A/B)" dataType="text"></w2:column>
		<w2:column id="capRtoPre1" name="전월 비율 - 단월조회에서만 채워짐" dataType="text"></w2:column>
		<w2:column id="capRtoPre2" name="전전월 비율 - 단월조회에서만 채워짐" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 5. [ULDSTF08061][ETN][순자본비율] 기준년 콤보 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_list_sync2`
*   **TO-BE** : `get /api/listing/lstproc/etn/ncr/select-list-year`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_year=body"
}
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_year" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="value" name="코드값" dataType="text"></w2:column>
		<w2:column id="text" name="코드명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---