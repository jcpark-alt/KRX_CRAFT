## 1. [ULDSTF05232][주권][상장폐지(회사별)] 회사별 상장폐지 갯수 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/stock/delisting-com/select-count`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dma_cnt=body"
}
// requestData 지정
const requestData = {
    'isurCd': '',
	'mktactApplObjTpCd' : ''
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_cnt" baseNode="map">
	<w2:keyInfo>
		<w2:key id="isurCd" name="회사코드" dataType="text"></w2:key>
		<w2:key id="comAbbrv" name="회사명" dataType="text"></w2:key>
		<w2:key id="spotIsuTrdMktTpCd" name="시장구분코드" dataType="text"></w2:key>
		<w2:key id="cnt" name="갯수" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>


```




---





## 2. [ULDSTF05232][주권][상장폐지(회사별)] 회사별 상장폐지 종목 및 주식수 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/stock/delisting-com/select-list-isu`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_list=body"
}

// requestData 지정
const requestData = {
    isurCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_list" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuSrtCd" name="종목단축코드" dataType="text"></w2:column>
		<w2:column id="isuKorNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="listShrs" name="상장주식수" dataType="number"></w2:column>
		<w2:column id="parval" name="액면가(1주당자본금)" dataType="number"></w2:column>
		<w2:column id="isuPrc" name="발행가격" dataType="number"></w2:column>
		<w2:column id="listDd" name="상장일" dataType="text"></w2:column>
		<w2:column id="stkcertKindNm" name="주권종류명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>


```



---






## 3. [ULDSTF05232][주권][상장폐지(회사별)] 상장폐지 내역 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/stock/delisting-com/select-list`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_list2=body"
}

// requestData 지정
const requestData = {
    isurCd: "",
	mktactApplObjTpCd:""
};
```



**[RESPONSE]**

```xml
<w2:dataList id="dlt_list2" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="draftYn" name="기안처리여부" dataType="text"></w2:column>
		<w2:column id="disclsYn" name="공시검토 여부" dataType="text"></w2:column>
		<w2:column id="mktactYn" name="시장조치여부" dataType="text"></w2:column>
		<w2:column id="delistDd" name="상장폐지일" dataType="text"></w2:column>
		<w2:column id="delistRsnCd" name="상장폐지사유코드" dataType="text"></w2:column>
		<w2:column id="delistRsnDsc" name="상장폐지사유" dataType="text"></w2:column>
		<w2:column id="grndRegulNm" name="근거" dataType="text"></w2:column>
		<w2:column id="remk" name="기타" dataType="text"></w2:column>
		<w2:column id="listAgnccomMbrNo" name="주간사" dataType="text"></w2:column>
		<w2:column id="mktpartcKorNm" name="시장참가자명" dataType="text"></w2:column>
		<w2:column id="fnlEmpNm" name="최종담당자" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>


```



