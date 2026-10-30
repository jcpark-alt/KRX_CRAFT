## 1. [ULDSTF25205][공시][감사보고서제출] 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `/DisclosureStatistics.do?method=listAuditReport`
*   **TO-BE** : `get /api/discls/`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_list=body"
}
// requestData 지정
const requestData = {
    'isurCd': '',
	'ldMktTpCd' : '',
	'dateS' : '',
	'dateE' : '',
	'stdIndtp1' : '',
	'stdIndtp2' : '',
	'stdIndtp3' : '',
	'acntclsMm' : '',
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_list" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:keyInfo>
		<w2:column id="ldMktTpNm" name="시장구분" dataType="text"></w2:column>
		<w2:column id="listStatNm" name="상장여부" dataType="text"></w2:column>
		<w2:column id="comAbbrv" name="회사명" dataType="text"></w2:column>
		<w2:column id="isuSrtCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="remk" name="기타" dataType="text"></w2:column>
	</w2:keyInfo>
</w2:dataMap>


```




---