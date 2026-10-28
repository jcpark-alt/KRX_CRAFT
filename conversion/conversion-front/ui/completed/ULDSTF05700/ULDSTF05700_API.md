## 1. [ULDSTF05700][신주인수권증권][신주상장] 발행예정종목 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `[신주인수권증권][신주상장] 발행예정종목 목록 조회 하는 API`
*   **TO-BE** : `GET /api/listing/lstproc/warrant/listing/select-list-recv`

**[REQUEST]**


```javascript
// submission ref, target 지정
{
	target: "dlt_recv=body"
}

// requestData 지정
const requestData = {
    isurCd: "",
    spotIsuTrdMktTpCd: ""

};
```


**[RESPONSE]**

```xml
<w2:dataList id="dlt_recv" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="disclsAcptTpNm" name="제출유형" dataType="text"></w2:column>
		<w2:column id="acptNo" name="접수번호" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="comAbbrv" name="회사약명" dataType="text"></w2:column>
		<w2:column id="isuKorNm" name="한글종목명" dataType="text"></w2:column>
		<w2:column id="listShrs" name="상장주식수" dataType="number"></w2:column>
		<w2:column id="rghtRto" name="신주인수비율" dataType="number"></w2:column>
		<w2:column id="exerStrtDd" name="행사시작일" dataType="text"></w2:column>
		<w2:column id="exerEndDd" name="행사종료일" dataType="text"></w2:column>
		<w2:column id="isuDd" name="발행일자" dataType="text"></w2:column>
		<w2:column id="stkcertKindNm" name="주권종류명" dataType="text"></w2:column>
		<w2:column id="isuShrs" name="발행주식수" dataType="number"></w2:column>
		<w2:column id="parval" name="액면가" dataType="number"></w2:column>
		<w2:column id="exerPrc" name="행사가격(발행가)" dataType="number"></w2:column>
		<w2:column id="totPar" name="액면총액" dataType="number"></w2:column>
		<w2:column id="totIsuPrc" name="발행가액총액(원)" dataType="number"></w2:column>
		<w2:column id="sktamtSbPayContn" name="주금대용납입의제사항" dataType="text"></w2:column>
		<w2:column id="newstkProftDivContn" name="신주의이익배당사항" dataType="text"></w2:column>
		<w2:column id="listDd" name="상장일" dataType="text"></w2:column>
		<w2:column id="nparvalstkYn" name="무액면여부" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```



---











## 2. [ULDSTF05700/ULDSTF05710][신주인수권증권/증서][신주상장] 증권발행내역 목록/상세 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `[신주인수권증권/증서][신주상장] 증권발행내역 목록/상세 조회 하는 API (SECUGRP_ID 로 SW/SR 구분)`
*   **TO-BE** : `GET /api/listing/lstproc/warrant/listing/select-list-hist`

**[REQUEST]**


```javascript
// submission ref, target 지정
{
	target: "dma_std=body"
}

// requestData 지정
const requestData = {
    isurCd: "",
    secugrpId: ""
};

const requestData = {
    ...dma_resultDetail.getJSON(),                // 마스터 정보
    dtlBfList : dlt_detail_dtlBfList.getAllJSON(),  // 변경전 그리드 리스트 (배열)
    dtlAfList : dlt_detail_dtlAfList.getAllJSON()   // 변경후 그리드 리스트 (배열)
};

```






**[RESPONSE]**

```xml
<w2:dataList id="dlt_hist" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="acptNo" name="접수번호" dataType="text"></w2:column>
		<w2:column id="disclsAcptTpNm" name="제출유형" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행회사코드" dataType="text"></w2:column>
		<w2:column id="comNm" name="회사명" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="tarstkIsuCd" name="대상주식종목코드" dataType="text"></w2:column>
		<w2:column id="tarstkIsuNm" name="대상주식종목코드명" dataType="text"></w2:column>
		<w2:column id="listMethdTpCd" name="상장방식유형코드" dataType="text"></w2:column>
		<w2:column id="listMethdTpNm" name="상장방식유형" dataType="text"></w2:column>
		<w2:column id="isuRnd" name="발행회차" dataType="number"></w2:column>
		<w2:column id="listDd" name="상장일" dataType="text"></w2:column>
		<w2:column id="delistDd" name="상장폐지 지정일" dataType="text"></w2:column>
		<w2:column id="isuDd" name="발행일" dataType="text"></w2:column>
		<w2:column id="isuRsnContn" name="변경사유" dataType="text"></w2:column>
		<w2:column id="bfListShrs" name="변경전 수량" dataType="text"></w2:column>
		<w2:column id="incdecListShrs" name="발행주식수(증감증권수)" dataType="number"></w2:column>
		<w2:column id="listShrs" name="상장주식수" dataType="number"></w2:column>
		<w2:column id="isuShrs" name="증감주식수" dataType="number"></w2:column>
		<w2:column id="nparvalstkYn" name="무액면주식여부" dataType="text"></w2:column>
		<w2:column id="exerPrc" name="행사가격" dataType="number"></w2:column>
		<w2:column id="totIsuPrc" name="발행가액총액(원)" dataType="number"></w2:column>
		<w2:column id="exerStrtDd" name="행사시작일" dataType="text"></w2:column>
		<w2:column id="exerEndDd" name="행사종료일" dataType="text"></w2:column>
		<w2:column id="subsrghtContn" name="신주인수권의내용" dataType="text"></w2:column>
		<w2:column id="subsrghtExertmPaymethdContn" name="신주의납입방법" dataType="text"></w2:column>
		<w2:column id="remk" name="기타" dataType="text"></w2:column>
		<w2:column id="isuSrtCd" name="종목약어코드" dataType="text"></w2:column>
		<w2:column id="isuKorNm" name="종목한글명" dataType="text"></w2:column>
		<w2:column id="isuKorAbbrv" name="종목약어명" dataType="text"></w2:column>
		<w2:column id="isuEngNm" name="종목영문명" dataType="text"></w2:column>
		<w2:column id="isuEngAbbrv" name="종목영문약어" dataType="text"></w2:column>
		<w2:column id="disclsYn" name="공시검토 여부" dataType="text"></w2:column>
		<w2:column id="fnlEmpNm" name="최종처리자" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```

---

















