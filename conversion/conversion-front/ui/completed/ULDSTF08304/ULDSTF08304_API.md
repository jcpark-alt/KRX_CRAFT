## 1. [ULDSTF08301~08305][ETN/ETF][투자유의] 중복체크

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_duplicate_check`
*   **TO-BE** : `GET /api/listing/lstproc/etn/invstwarn/select-check-duplicate`

**[REQUEST]**


```javascript

// requestData 지정
const requestData = {
    etpInvstwarnDesignCd: "",
    basDd: "",
    isuCd: ""
};
```





**[RESPONSE & 처리]**


```javascript
const result = await $c.sbm.executeDynamic(sbmOptions, requestData);
if(result.responseJSON.dupChk === "Y"){
    // 중복 Y
} else {
    // 중복 N
}
```

---











## 2. [ULDSTF08304, ULDSTF08305][ETN/ETF][투자유의 지정연장·지정해제] 최초지정일자 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_Instwarn_fstdd`
*   **TO-BE** : `GET /api/listing/lstproc/etn/invstwarn/select-fst-design-dd`


**[REQUEST]**


```javascript

// requestData 지정
const requestData = {
    isuCd: ""
};
```





**[RESPONSE & 처리]**


```javascript
const result = await $c.sbm.executeDynamic(sbmOptions, requestData);
console.log("최초지정일자: "+result.responseJSON.fstDesignDd);
```

---










## 3. [ULDSTF08301~08305][ETN/ETF][투자유의] 상세 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `업무처리번호 기준 상세(입력폼 채움) 조회. AS-IS fn_onload`
*   **TO-BE** : `GET /api/listing/lstproc/etn/invstwarn/select-one`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dma_detail=body"
}

// requestData 지정
const requestData = {
    secugrpId: "",
    bzProcsNo: ""
};
```






**[RESPONSE]**

```xml
<w2:dataMap id="dma_detail" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="isuNm" name="종목명" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="etpInvstwarnDesignCd" name="ETP투자유의지정코드" dataType="text"></w2:key>
		<w2:key id="fstDesignDd" name="최초지정일자" dataType="text"></w2:key>
		<w2:key id="designDd" name="지정일자" dataType="text"></w2:key>
		<w2:key id="designRsn" name="지정사유" dataType="text"></w2:key>
		<w2:key id="etpInvstwarnContn" name="ETP투자유의사항" dataType="text"></w2:key>
		<w2:key id="misc" name="기타" dataType="text"></w2:key>
		<w2:key id="addYn" name="추가여부" dataType="text"></w2:key>
		<w2:key id="basDd" name="기준일자" dataType="text"></w2:key>
		<w2:key id="lstEmpNm" name="최종처리자명" dataType="text"></w2:key>
		<w2:key id="dscYn" name="공시여부" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```


---













## 4. [ULDSTF08301~08305][ETN/ETF][투자유의] 수정

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_update`
*   **TO-BE** : `POST /api/listing/lstproc/etn/invstwarn/modify`

**[REQUEST]**

```xml
<w2:dataMap id="dma_update" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호 (수정 시 필수, 등록 시 서버채번)" dataType="text"></w2:key>
		<w2:key id="secugrpId" name="증권그룹코드 EN(ETN)/EF(ETF)" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드 (상장업무처리로그용, AS-IS dts_Isu.ISUR_CD)" dataType="text"></w2:key>
		<w2:key id="designDd" name="지정일자(적출일)" dataType="text"></w2:key>
		<w2:key id="designRsn" name="적출사유" dataType="text"></w2:key>
		<w2:key id="etpInvstwarnContn" name="투자유의사항" dataType="text"></w2:key>
		<w2:key id="misc" name="기타" dataType="text"></w2:key>
		<w2:key id="addYn" name="추가여부" dataType="text"></w2:key>
		<w2:key id="basDd" name="기준일자(조회기준일)" dataType="text"></w2:key>
		<w2:key id="etpInvstwarnDesignCd" name="ETP투자유의지정코드" dataType="text"></w2:key>
		<w2:key id="fstDesignDd" name="최초지정일자" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```


```javascript
// submission ref, target 지정
{
	ref: "dma_update",
	target: "dma_resultSave=body"
}
```






**[RESPONSE]**

```xml
<w2:dataMap id="dma_resultSave" baseNode="map">
	<w2:keyInfo>
		<w2:key id="completeYn" name="처리 완료 여부" dataType="text"></w2:key>
		<w2:key id="bzProcsNo" name="업무처리번호 (수정·삭제)" dataType="text"></w2:key>
		<w2:key id="bzProcsNoList" name="등록한 업무처리번호 목록 (등록, 요청 isuList 순서)" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```



---














## 4. [ULDSTF08301~08305][ETN/ETF][투자유의] 등록

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_save (fn_duplicate_check + 종목별 saveEtnInvstwarn)`
*   **TO-BE** : `POST /api/listing/lstproc/etn/invstwarn/register`

**[REQUEST]**

```xml
<w2:dataMap id="dma_register" baseNode="map">
	<w2:keyInfo>
		<w2:key id="secugrpId" name="증권그룹코드 EN(ETN)/EF(ETF) - LIST_BZ_TP_CD 716/750 분기" dataType="text"></w2:key>
		<w2:key id="etpInvstwarnDesignCd" name="ETP투자유의지정코드 (01 최초적출 08301, 02 지정예고 08302, 03 지정 08303, 04 지정연장 08304, 05 지정해제 08305). 비우면 01" dataType="text"></w2:key>
		<w2:key id="designDd" name="지정일자(적출일)" dataType="text"></w2:key>
		<w2:key id="designRsn" name="적출사유" dataType="text"></w2:key>
		<w2:key id="etpInvstwarnContn" name="투자유의사항" dataType="text"></w2:key>
		<w2:key id="misc" name="기타" dataType="text"></w2:key>
		<w2:key id="basDd" name="기준일자(조회기준일, AS-IS Inq_dd) - 중복체크·저장 BAS_DD" dataType="text"></w2:key>
		<w2:key id="fstDesignDd" name="최초지정일자 = 목록의 최초적출일(fst_dtect_dd)" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

<w2:dataList id="dlt_register" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호 (비우면 서버 채번)" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드 (상장업무처리로그용)" dataType="text"></w2:column>
		<w2:column id="addYn" name="추가여부 (종목찾기 팝업으로 수동 추가한 종목 Y)" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>


```


```javascript
// submission ref, target 지정
{
	target: "dma_resultSave=body"
}

// requestData 지정
const requestData = {
    ...dma_register.getJSON(),
    isuList : dlt_register.getAllJSON(), // 등록 종목 목록 (AS-IS dts_Isu_Temp)
};
```




---

















## 5. [ULDSTF08301~08305][ETN/ETF][투자유의] 삭제

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_delete`
*   **TO-BE** : `POST /api/listing/lstproc/etn/invstwarn/remove`

**[REQUEST]**

```xml
<w2:dataMap id="dma_delete" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="secugrpId" name="증권그룹코드 EN(ETN)/EF(ETF) - LIST_BZ_TP_CD 716/750 분기용" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드 (상장업무처리로그용)" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```


```javascript
// submission ref, target 지정
{
	ref: "dma_delete",
	target: "dma_resultSave=body"
}

```




---




