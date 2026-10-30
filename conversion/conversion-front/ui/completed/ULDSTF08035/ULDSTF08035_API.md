## 1. [ULDSTF08035][ETN][관리종목지정우려예고] 목록 조회 - 발행사 기준 - DIV_ETN_IDX_ADMISUNOTI_LIST_CORP

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `발행기관코드 기준 관리종목지정우려예고 목록 조회. AS-IS fn_search (DIV_IDX=1)`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu-noti/select-list-corp`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_listCorp=body"
}

// requestData 지정
const requestData = {
    isurCd: ""
};


```


**[RESPONSE]**

```xml
<w2:dataList id="dlt_listCorp" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="dftYn" name="기안여부" dataType="text"></w2:column>
		<w2:column id="dscYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="admisunotiDd" name="관리종목지정예고일자" dataType="text"></w2:column>
		<w2:column id="admisuDesignSchdlDd" name="관리종목지정예정일자" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목약명" dataType="text"></w2:column>
		<w2:column id="comNm" name="발행회사약명" dataType="text"></w2:column>
		<w2:column id="admisuRsnNm" name="지정사유명 (변경후 사유를 , 로 연결)" dataType="text"></w2:column>
		<w2:column id="admisuDesignSchdlContn" name="관리종목지정예정내용(주석)" dataType="text"></w2:column>
		<w2:column id="remk" name="기타" dataType="text"></w2:column>
		<w2:column id="lstEmpNm" name="최종처리자명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```

---











## 2. [ULDSTF08035][ETN][관리종목지정우려예고] 목록 조회 - 종목 기준 - DIV_ETN_IDX_ADMISUNOTI_LIST_ISU

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `종목코드 기준 관리종목지정우려예고 목록 조회. AS-IS fn_search (DIV_IDX=0)`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu-noti/select-list-isu`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_listIsu=body"
}

// requestData 지정
const requestData = {
    isuCd: ""
};

```






**[RESPONSE]**

```xml
<w2:dataList id="dlt_listIsu" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="dftYn" name="기안여부" dataType="text"></w2:column>
		<w2:column id="dscYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="admisunotiDd" name="관리종목지정예고일자" dataType="text"></w2:column>
		<w2:column id="admisuDesignSchdlDd" name="관리종목지정예정일자" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목약명" dataType="text"></w2:column>
		<w2:column id="comNm" name="발행회사약명" dataType="text"></w2:column>
		<w2:column id="admisuRsnNm" name="지정사유명 (변경후 사유를 &apos;,&apos; 로 연결)" dataType="text"></w2:column>
		<w2:column id="admisuDesignSchdlContn" name="관리종목지정예정내용(주석)" dataType="text"></w2:column>
		<w2:column id="remk" name="기타" dataType="text"></w2:column>
		<w2:column id="lstEmpNm" name="최종처리자명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```


---










