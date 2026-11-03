## 1. [ULDSTF05203][주권][결산기변경관리] 신규 등록 시 현재 결산월일 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_new_onload`
*   **TO-BE** : `get /api/listing/lstproc/stock/fiscal-year-change/select-current-acntcls-mmdd`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_listbasyymmdd=body"
}
// requestData 지정
const requestData = {
    isurCd : ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_mmdd" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="basMmdd" name="결산월일1 (AS-IS ACNTCLS_MMDD1 → TO-BE TBLD_ISUR_ADITM_D.ADD_ITM_VAL1)" dataType="text"></w2:column>
		<w2:column id="basMmdd2" name="결산월일2 (AS-IS ACNTCLS_MMDD2 → TO-BE TBLD_ISUR_ADITM_D.ADD_ITM_VAL2)" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>


```




---





## 2. [ULDSTF05203][주권][결산기변경관리] 예약(미래일자) 등록 중복 체크

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_mst_check`
*   **TO-BE** : `get /api/listing/lstproc/stock/fiscal-year-change/select-mst-check`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target : 'dma_one=body'
}

// requestData 지정
const requestData = {
    isurCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_one" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="isurCd" name="회사코드" dataType="text"></w2:key>
		<w2:key id="chgListMktactAdmNo" name="변경상장시장조치관리번호" dataType="number"></w2:key>
		<w2:key id="fiscyyDistrBasddTpCd" name="결산기분배기준일구분코드 (AS-IS FISCYY_DISTR_BASDD_TP_CD → TO-BE CHG_LIST_MKTACT_TP_CD, alias 로 AS-IS 명 유지). 결산기=&apos;13&apos;" dataType="text"></w2:key>
		<w2:key id="isurNm" name="회사명(약명)" dataType="text"></w2:key>
		<w2:key id="comNm" name="회사정식명 (AS-IS B.COM_NM)" dataType="text"></w2:key>
		<w2:key id="chgDd" name="변경일" dataType="text"></w2:key>
		<w2:key id="mktactEnforceDd" name="시장조치시행일" dataType="text"></w2:key>
		<w2:key id="fiscyyChgRsnCd" name="결산기변경사유코드 (AS-IS FISCYY_CHG_RSN_CD → TO-BE LIST_CHG_RSN_CD_VAL, alias 로 AS-IS 명 유지)" dataType="text"></w2:key>
		<w2:key id="fiscyyChgRsnNm" name="결산기변경사유명 (AS-IS 서브쿼리 FISCYY_CHG_RSN_NM. TO-BE 는 TBLD_LIST_BZ_RSN_C, LIST_BZ_RSN_TP_CD=&apos;03&apos;)" dataType="text"></w2:key>
		<w2:key id="remk" name="기타" dataType="text"></w2:key>
		<w2:key id="fiscyyChgStrtDd" name="변경 후 최초 사업연도 시작일 (MF 는 화면상 입력란이 숨겨져 항상 빈 값)" dataType="text"></w2:key>
		<w2:key id="fiscyyChgEndDd" name="변경 후 최초 사업연도 종료일 (MF 는 화면상 입력란이 숨겨져 항상 빈 값)" dataType="text"></w2:key>
		<w2:key id="fiscyyStrtYy" name="변경후 시작일 연 (AS-IS SUBSTR(FISCYY_CHG_STRT_DD,1,4))" dataType="text"></w2:key>
		<w2:key id="fiscyyStrtMm" name="변경후 시작일 월 (AS-IS SUBSTR(FISCYY_CHG_STRT_DD,5,2))" dataType="text"></w2:key>
		<w2:key id="fiscyyStrtDd" name="변경후 시작일 일 (AS-IS SUBSTR(FISCYY_CHG_STRT_DD,7,2))" dataType="text"></w2:key>
		<w2:key id="fiscyyEndYy" name="변경후 종료일 연 (AS-IS SUBSTR(FISCYY_CHG_END_DD,1,4))" dataType="text"></w2:key>
		<w2:key id="fiscyyEndMm" name="변경후 종료일 월 (AS-IS SUBSTR(FISCYY_CHG_END_DD,5,2))" dataType="text"></w2:key>
		<w2:key id="fiscyyEndDd" name="변경후 종료일 일 (AS-IS SUBSTR(FISCYY_CHG_END_DD,7,2))" dataType="text"></w2:key>
		<w2:key id="disclsYn" name="공시여부 (AS-IS VWLD_BZ_PROCS_LOG01.DISCLS_YN → TO-BE VWLD_LIST_BZ_PROCS01.DISCLS_YN)" dataType="text"></w2:key>
		<w2:key id="draftYn" name="기안여부 (AS-IS 목록 쿼리 DRAFT_YN 과 동일 소스, 자매 화면 05621 fn_dscl 용)" dataType="text"></w2:key>
		<w2:key id="dtlBfList" name="변경전 결산기 목록" dataType="text"></w2:key>
		<w2:key id="dtlAfList" name="변경후 결산기 목록" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>


```



---






## 3. [ULDSTF05203][주권][결산기변경관리] 상세 조회(마스터 + 변경전/후 결산기)

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_read_sync`
*   **TO-BE** : `get /api/listing/lstproc/stock/fiscal-year-change/select-one`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_experprc=body"
}

// requestData 지정
const requestData = {
    basYymm: "",
	rghtTpCd:""
};
```



**[RESPONSE]**

```xml
<w2:dataList id="dlt_experprc" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="gubun" name="구분(KOSPI200 / 코스닥150)" dataType="text"></w2:column>
		<w2:column id="rnk" name="번호(순위)" dataType="text"></w2:column>
		<w2:column id="isuCd" name="기초자산 종목코드" dataType="text"></w2:column>
		<w2:column id="isuKorAbbrv" name="기초자산명(종목한글약명)" dataType="text"></w2:column>
		<w2:column id="basDd" name="기준일(YYYY-MM-DD)" dataType="text"></w2:column>
		<w2:column id="basPrc" name="기준가격(당일종가)" dataType="text"></w2:column>
		<w2:column id="prity90" name="패리티 90% 행사가격" dataType="text"></w2:column>
		<w2:column id="prity92" name="패리티 92% 행사가격" dataType="text"></w2:column>
		<w2:column id="prity94" name="패리티 94% 행사가격" dataType="text"></w2:column>
		<w2:column id="prity96" name="패리티 96% 행사가격" dataType="text"></w2:column>
		<w2:column id="prity98" name="패리티 98% 행사가격" dataType="text"></w2:column>
		<w2:column id="prity100" name="패리티 100% 행사가격" dataType="text"></w2:column>
		<w2:column id="prity102" name="패리티 102% 행사가격" dataType="text"></w2:column>
		<w2:column id="prity104" name="패리티 104% 행사가격" dataType="text"></w2:column>
		<w2:column id="prity106" name="패리티 106% 행사가격" dataType="text"></w2:column>
		<w2:column id="prity108" name="패리티 108% 행사가격" dataType="text"></w2:column>
		<w2:column id="prity110" name="패리티 110% 행사가격" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```





---











## 4. [ULDSTF05203][주권][결산기변경관리] 삭제

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_delete`
*   **TO-BE** : `post /api/listing/lstproc/stock/fiscal-year-change/delete`

**[REQUEST]**
```javascript
// submission ref, target 지정


// requestData 지정
const requestData = {
	bzProcsNo:""
};
```


## 5. [ULDSTF05203][주권][결산기변경관리] 신규 저장

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_save`
*   **TO-BE** : `post /api/listing/lstproc/stock/fiscal-year-change/insert`

**[REQUEST]**
```xml
<w2:dataMap id="dma_in" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호(수정 시 필수, 신규 시 서버 채번)" dataType="text"></w2:key>
		<w2:key id="isurCd *" name="회사코드" dataType="text"></w2:key>
		<w2:key id="Constraints: Min 1 chars" name="string" dataType="text"></w2:key>
		<w2:key id="변경일" name="mktactEnforceDd *" dataType="text"></w2:key>
		<w2:key id="string" name="Constraints: Min 1 chars" dataType="text"></w2:key>
		<w2:key id="fiscyyChgRsnCd *" name="결산기변경사유코드 (1:임시주주총회에서 결의, 2:정기주주총회에서 결의, 9:기타)" dataType="text"></w2:key>
		<w2:key id="Constraints: Min 1 chars" name="string" dataType="text"></w2:key>
		<w2:key id="기타" name="string" dataType="text"></w2:key>
		<w2:key id="변경 후 최초 사업연도 시작일" name="string" dataType="text"></w2:key>
		<w2:key id="변경 후 최초 사업연도 종료일" name="array of object" dataType="text"></w2:key>
		<w2:key id="변경전 결산기 목록(dts_DtlBf)" name="array of object" dataType="text"></w2:key>
		<w2:key id="변경후 결산기 목록(dts_DtlAf)" name="" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

```javascript
// submission ref, target 지정
{
	ref: "dma_in",
}


```


## 6. [ULDSTF05203][주권][결산기변경관리] 삭제

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_update`
*   **TO-BE** : `post /api/listing/lstproc/stock/fiscal-year-change/update`

**[REQUEST]**
```xml
<w2:dataMap id="dma_in" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호(수정 시 필수, 신규 시 서버 채번)" dataType="text"></w2:key>
		<w2:key id="isurCd *" name="회사코드" dataType="text"></w2:key>
		<w2:key id="Constraints: Min 1 chars" name="string" dataType="text"></w2:key>
		<w2:key id="변경일" name="mktactEnforceDd *" dataType="text"></w2:key>
		<w2:key id="string" name="Constraints: Min 1 chars" dataType="text"></w2:key>
		<w2:key id="fiscyyChgRsnCd *" name="결산기변경사유코드 (1:임시주주총회에서 결의, 2:정기주주총회에서 결의, 9:기타)" dataType="text"></w2:key>
		<w2:key id="Constraints: Min 1 chars" name="string" dataType="text"></w2:key>
		<w2:key id="기타" name="string" dataType="text"></w2:key>
		<w2:key id="변경 후 최초 사업연도 시작일" name="string" dataType="text"></w2:key>
		<w2:key id="변경 후 최초 사업연도 종료일" name="array of object" dataType="text"></w2:key>
		<w2:key id="변경전 결산기 목록(dts_DtlBf)" name="array of object" dataType="text"></w2:key>
		<w2:key id="변경후 결산기 목록(dts_DtlAf)" name="" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

```javascript
// submission ref, target 지정
{
	ref: "dma_in",
}


```