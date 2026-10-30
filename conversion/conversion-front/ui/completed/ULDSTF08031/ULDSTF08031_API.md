## 1. [ULDSTF08031][ETN][관리종목지정] 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `조회구분(0:종목별/1:발행회사별/2:전체)에 따른 관리종목지정 목록(그리드) 조회. AS-IS fn_search`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu/select-list`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_list=body"
}

// requestData 지정
const requestData = {
    srchDivCd: "",
    isuCd: "",
    isurCd: ""
};

```


**[RESPONSE]**

```xml
<w2:dataList id="dlt_list" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="dftYn" name="기안여부" dataType="text"></w2:column>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="admisuDesignBzProcsNo" name="관리종목지정업무처리번호(지정건 기준번호)" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명(종목한글약명)" dataType="text"></w2:column>
		<w2:column id="comNm" name="발행회사(회사약명)" dataType="text"></w2:column>
		<w2:column id="admisuDesignBzTpCd" name="관리종목지정업무구분코드(0:지정, 1:사유변경, 4:해제)" dataType="text"></w2:column>
		<w2:column id="mktactEnforceDd" name="관리종목 지정일(시장조치시행일자)" dataType="text"></w2:column>
		<w2:column id="dscYn" name="지정 공시여부" dataType="text"></w2:column>
		<w2:column id="mktactRsnChgDd" name="관리종목 사유변경일" dataType="text"></w2:column>
		<w2:column id="rsnChgDscYn" name="변경 공시여부" dataType="text"></w2:column>
		<w2:column id="mktactReleasDd" name="관리종목지정 해제(예정)일" dataType="text"></w2:column>
		<w2:column id="releasDscYn" name="해제 공시여부" dataType="text"></w2:column>
		<w2:column id="admisuDesignBzTpNm" name="관리종목지정업무구분명" dataType="text"></w2:column>
		<w2:column id="admisuRsnNm" name="지정사유(여러 건을 콤마로 결합)" dataType="text"></w2:column>
		<w2:column id="admisuRsnContn" name="관리종목지정사유내용" dataType="text"></w2:column>
		<w2:column id="grndRegulNm" name="근거규정명" dataType="text"></w2:column>
		<w2:column id="remk" name="비고" dataType="text"></w2:column>
		<w2:column id="lstEmpNm" name="최종처리자명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```



---










