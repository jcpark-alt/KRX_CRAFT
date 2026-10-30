## 1. [관리종목지정] 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `/administrativeIssue.do?SCREN_ID="+vScrenID+"&SCREN_PROCES_TP_CD="+SCREN_PROCS_TP_CD_01+"&method=searchAdministrativeIssue" + "&DIV_IDX="+DIV_IDX_ADMISU_LIST + "&TRS_IDX="+TRS_IDX_SELECT + "&ISUR_CD=" + txb_IsurCd.value`
*   **TO-BE** : `GET /api/listing/lstproc/stock/administrative-issue/select-list`

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
		<w2:column id="dftYn" name="기안여부" dataType="text"></w2:column>
		<w2:column id="dscYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="mktactEnforceDd" name="시행일" dataType="text"></w2:column>
		<w2:column id="admisuDesignBzTpCd" name="구분코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignBzTpNm" name="구분" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="admisuRsnNm" name="지정사유" dataType="text"></w2:column>
		<w2:column id="bfchgDelistBasDdContn" name="변경전 유의사항" dataType="text"></w2:column>
		<w2:column id="afchgDelistBasDdContn" name="변경후 유의사항" dataType="text"></w2:column>
		<w2:column id="chgRsnContn" name="변경/해제 사유" dataType="text"></w2:column>
		<w2:column id="admisuDesignGrndRegulNm" name="근거규정" dataType="text"></w2:column>
		<w2:column id="remk" name="기타" dataType="text"></w2:column>
		<w2:column id="lstEmpNm" name="최종처리자" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---

## 2. [관리종목지정] 코스닥 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `[관리종목지정] 코스닥 목록 조회 API`
*   **TO-BE** : `GET /api/listing/lstproc/stock/administrative-issue/select-ksq-list`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_ksqList=body"
}

// requestData 지정
const requestData = {
    isurCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_ksqList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="dftYn" name="기안여부" dataType="text"></w2:column>
		<w2:column id="dscYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="admisuRsnNm" name="지정사유" dataType="text"></w2:column>
		<w2:column id="admisuDesignGrndRegulNm" name="근거규정" dataType="text"></w2:column>
		<w2:column id="remk" name="기타" dataType="text"></w2:column>
		<w2:column id="lstEmpNm" name="최종처리자" dataType="text"></w2:column>
		<w2:column id="admisuRsnChgDd" name="사유변경일" dataType="text"></w2:column>
		<w2:column id="admisuDesnrelsDd" name="지정일" dataType="text"></w2:column>
		<w2:column id="rsnChgTpCd" name="사유변동구분" dataType="text"></w2:column>
		<w2:column id="rsnChgTpNm" name="사유변동명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---

## 3. [관리종목지정] 발행기관별 건수 목록조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `[관리종목지정] 발행기관별 건수 목록 조회 API`
*   **TO-BE** : `GET /api/listing/lstproc/stock/administrative-issue/isurcd-cnt/select-list`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_list2=body"
}

```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_list2" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="spotIsuTrdMktTpCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="comAbbrv" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="cnt" name="발행기관코드" dataType="number"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---
