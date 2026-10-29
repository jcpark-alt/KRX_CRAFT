## 1. [ULDSTF05708][신주인수권증권][상장원부] 행사가격 조정내역 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_list_sync`
*   **TO-BE** : `GET /api/listing/lstproc/warrant/listedregister/select-list-swprc`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_list=body"
}

// requestData 지정
const requestData = {
    isuCd: ""
};

```






**[RESPONSE]**

```xml
<w2:dataList id="dlt_list" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="chgDd" name="변경일자" dataType="text"></w2:column>
		<w2:column id="chgRsnContn" name="변경사유내용" dataType="text"></w2:column>
		<w2:column id="bfchgExerPrc" name="변경전행사가격" dataType="number"></w2:column>
		<w2:column id="afchgExerPrc" name="변경후행사가격" dataType="number"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```




---









## 2. [ULDSTF05708/ULDSTF05807][신주인수권증권/신주인수권증서][상장원부] 상세 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_read_sync`
*   **TO-BE** : `GET /api/listing/lstproc/warrant/listedregister/select-one`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dma_detail=body"
}

// requestData 지정
const requestData = {
    isuCd: "",
    secugrpId: ""
};
```






**[RESPONSE]**

```xml
<w2:dataMap id="dma_detail" baseNode="map">
	<w2:keyInfo>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="isuSrtCd" name="종목단축코드" dataType="text"></w2:key>
		<w2:key id="isuKorNm" name="한글종목명" dataType="text"></w2:key>
		<w2:key id="isuKorAbbrv" name="한글종목약명" dataType="text"></w2:key>
		<w2:key id="isuEngNm" name="영문종목명" dataType="text"></w2:key>
		<w2:key id="isuEngAbbrv" name="영문종목약명" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="isuDd" name="발행일자" dataType="text"></w2:key>
		<w2:key id="listDd" name="상장일자" dataType="text"></w2:key>
		<w2:key id="delistDd" name="상장폐지일자" dataType="text"></w2:key>
		<w2:key id="haltYn" name="매매정지여부" dataType="text"></w2:key>
		<w2:key id="secugrpId" name="증권그룹코드" dataType="text"></w2:key>
		<w2:key id="listStatCd" name="상장상태코드" dataType="text"></w2:key>
		<w2:key id="spotIsuTrdMktTpCd" name="당해종목매매시장구분코드" dataType="text"></w2:key>
		<w2:key id="tarstkIsuCd" name="목적주권종목코드" dataType="text"></w2:key>
		<w2:key id="stkcertKindNm" name="발행주식의종류명" dataType="text"></w2:key>
		<w2:key id="isuRnd" name="발행회차" dataType="text"></w2:key>
		<w2:key id="isuRsnContn" name="발행사유내용" dataType="text"></w2:key>
		<w2:key id="listShrs" name="상장증권수" dataType="number"></w2:key>
		<w2:key id="isuShrs" name="발행증권수" dataType="number"></w2:key>
		<w2:key id="totIsuPrc" name="총발행가액" dataType="number"></w2:key>
		<w2:key id="exerPrc" name="행사가격" dataType="number"></w2:key>
		<w2:key id="exerStrtDd" name="행사시작일자" dataType="text"></w2:key>
		<w2:key id="exerEndDd" name="행사종료일자" dataType="text"></w2:key>
		<w2:key id="subsrghtExertmPaymethdContn" name="신주의납입방법내용" dataType="text"></w2:key>
		<w2:key id="subsrghtContn" name="신주인수권내용" dataType="text"></w2:key>
		<w2:key id="depNm" name="담당부서명 (AS-IS SELECT상 NULL 고정)" dataType="text"></w2:key>
		<w2:key id="empNm" name="담당자명 (AS-IS SELECT상 NULL 고정)" dataType="text"></w2:key>
		<w2:key id="nparvalstkYn" name="무액면주식여부" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```


---











