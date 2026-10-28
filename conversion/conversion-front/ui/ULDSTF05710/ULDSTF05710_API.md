## 1. [ULDSTF05710/ULDSTF05801][신주인수권증권/증서][신주상장] 증권발행내역 인쇄

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `GET /api/listing/lstproc/warrant/listing/print`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dma_print=body"
}
// requestData 지정
const requestData = {
    bzProcsNo: dma_detail.getJSON().bzProcsNo
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_print" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="acptNo" name="접수번호" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행회사코드" dataType="text"></w2:key>
		<w2:key id="comNm" name="회사명" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="tarstkIsuNm" name="대상주식종목코드명" dataType="text"></w2:key>
		<w2:key id="isuRnd" name="발행회차" dataType="text"></w2:key>
		<w2:key id="listDd" name="상장일" dataType="text"></w2:key>
		<w2:key id="delistDd" name="상장폐지 지정일" dataType="text"></w2:key>
		<w2:key id="isuDd" name="발행일" dataType="text"></w2:key>
		<w2:key id="isuRsnContn" name="변경사유" dataType="text"></w2:key>
		<w2:key id="listShrs" name="상장주식수" dataType="number"></w2:key>
		<w2:key id="isuShrs" name="증감주식수" dataType="number"></w2:key>
		<w2:key id="exerPrc" name="행사가격" dataType="number"></w2:key>
		<w2:key id="totIsuPrc" name="발행가액총액(원)" dataType="number"></w2:key>
		<w2:key id="exerStrtDd" name="행사시작일" dataType="text"></w2:key>
		<w2:key id="exerEndDd" name="행사종료일" dataType="text"></w2:key>
		<w2:key id="isuSrtCd" name="종목약어코드" dataType="text"></w2:key>
		<w2:key id="isuKorNm" name="종목한글명" dataType="text"></w2:key>
		<w2:key id="isuKorAbbrv" name="종목약어명" dataType="text"></w2:key>
		<w2:key id="isuEngNm" name="종목영문명" dataType="text"></w2:key>
		<w2:key id="isuEngAbbrv" name="종목영문약어" dataType="text"></w2:key>
		<w2:key id="subsrghtEpContn" name="신주의 납입방법" dataType="text"></w2:key>
		<w2:key id="commitDd" name="승인일" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```




---





## 2. [ULDSTF05700/ULDSTF05710][신주인수권증권/증서][신주상장] 증권발행내역 목록/상세 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `GET /api/listing/lstproc/warrant/listing/select-list-hist`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_list=body"
}

// requestData 지정
const requestData = {
    isurCd: "",
    secugrpId : "",
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_list" baseNode="list" saveRemovedData="true" repeatNode="map">
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






## 3. [ULDSTF05710/ULDSTF05801][신주인수권증권/증서][신주상장] 증권발행내역 수정

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `POST /api/listing/lstproc/warrant/listing/modify`

**[REQUEST]**
```xml
<w2:dataMap id="dma_detail" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="listDd" name="상장일" dataType="text"></w2:key>
		<w2:key id="isuSrtCd" name="종목단축코드" dataType="text"></w2:key>
		<w2:key id="isuKorNm" name="종목한글명" dataType="text"></w2:key>
		<w2:key id="isuKorAbbrv" name="종목약어명" dataType="text"></w2:key>
		<w2:key id="isuEngNm" name="종목영문명" dataType="text"></w2:key>
		<w2:key id="isuEngAbbrv" name="종목영문약어" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행회사코드" dataType="text"></w2:key>
		<w2:key id="acptNo" name="접수번호" dataType="text"></w2:key>
		<w2:key id="tarstkIsuCd" name="목적주권종목코드" dataType="text"></w2:key>
		<w2:key id="delistDd" name="상장폐지일" dataType="text"></w2:key>
		<w2:key id="isuShrs" name="발행증권수" dataType="number"></w2:key>
		<w2:key id="exerPrc" name="행사가격" dataType="number"></w2:key>
		<w2:key id="totIsuPrc" name="발행가액총액(원)" dataType="number"></w2:key>
		<w2:key id="exerStrtDd" name="행사시작일" dataType="text"></w2:key>
		<w2:key id="exerEndDd" name="행사종료일" dataType="text"></w2:key>
		<w2:key id="subsrghtContn" name="신주인수권의내용" dataType="text"></w2:key>
		<w2:key id="subsrghtExertmPaymethdContn" name="신주인수권행사시납입방법내용" dataType="text"></w2:key>
		<w2:key id="nparvalstkYn" name="무액면여부" dataType="text"></w2:key>
		<w2:key id="listMethdTpCd" name="상장방식유형코드" dataType="text"></w2:key>
		<w2:key id="incdecListShrs" name="증감증권수" dataType="number"></w2:key>
		<w2:key id="listShrs" name="상장주식수" dataType="number"></w2:key>
		<w2:key id="isuRsnContn" name="발행사유" dataType="text"></w2:key>
		<w2:key id="isuDd" name="발행일" dataType="text"></w2:key>
		<w2:key id="isuRnd" name="발행회차" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
		<w2:key id="secugrpId" name="증권그룹코드 SW(신주인수권증권)/SR(신주인수권증서) - LIST_BZ_TP_CD 121/122 분기용" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

```javascript
// submission ref, target 지정
{
	ref: "dma_detail",
	target: "dma_result=body"
}
```



**[RESPONSE]**

```xml
<w2:dataMap id="dma_result" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="completeYn" name="처리결과" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```





---











## 4. [ULDSTF05710/ULDSTF05801][신주인수권증권/증서][신주상장] 증권발행내역 저장

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `POST /api/listing/lstproc/warrant/listing/register`

**[REQUEST]**

```xml
<w2:dataMap id="dma_detail" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="listDd" name="상장일" dataType="text"></w2:key>
		<w2:key id="isuSrtCd" name="종목단축코드" dataType="text"></w2:key>
		<w2:key id="isuKorNm" name="종목한글명" dataType="text"></w2:key>
		<w2:key id="isuKorAbbrv" name="종목약어명" dataType="text"></w2:key>
		<w2:key id="isuEngNm" name="종목영문명" dataType="text"></w2:key>
		<w2:key id="isuEngAbbrv" name="종목영문약어" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행회사코드" dataType="text"></w2:key>
		<w2:key id="acptNo" name="접수번호" dataType="text"></w2:key>
		<w2:key id="tarstkIsuCd" name="목적주권종목코드" dataType="text"></w2:key>
		<w2:key id="delistDd" name="상장폐지일" dataType="text"></w2:key>
		<w2:key id="isuShrs" name="발행증권수" dataType="number"></w2:key>
		<w2:key id="exerPrc" name="행사가격" dataType="number"></w2:key>
		<w2:key id="totIsuPrc" name="발행가액총액(원)" dataType="number"></w2:key>
		<w2:key id="exerStrtDd" name="행사시작일" dataType="text"></w2:key>
		<w2:key id="exerEndDd" name="행사종료일" dataType="text"></w2:key>
		<w2:key id="subsrghtContn" name="신주인수권의내용" dataType="text"></w2:key>
		<w2:key id="subsrghtExertmPaymethdContn" name="신주인수권행사시납입방법내용" dataType="text"></w2:key>
		<w2:key id="nparvalstkYn" name="무액면여부" dataType="text"></w2:key>
		<w2:key id="listMethdTpCd" name="상장방식유형코드" dataType="text"></w2:key>
		<w2:key id="incdecListShrs" name="증감증권수" dataType="number"></w2:key>
		<w2:key id="listShrs" name="상장주식수" dataType="number"></w2:key>
		<w2:key id="isuRsnContn" name="발행사유" dataType="text"></w2:key>
		<w2:key id="isuDd" name="발행일" dataType="text"></w2:key>
		<w2:key id="isuRnd" name="발행회차" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
		<w2:key id="secugrpId" name="증권그룹코드 SW(신주인수권증권)/SR(신주인수권증서) - LIST_BZ_TP_CD 121/122 분기용" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```


```javascript
// submission ref, target 지정
{
	ref: "dma_detail",
	target: "dma_result=body"
}

// requestData 지정
const requestData = {
    isurCd: 조회 영역의 isurCd 값
};
```






**[RESPONSE]**

```xml
<w2:dataMap id="dma_result" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="completeYn" name="처리결과" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```







---













## 5. [ULDSTF05710/ULDSTF05801][신주인수권증권/증서][신주상장] 증권발행내역 삭제

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `POST /api/listing/lstproc/warrant/listing/remove`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	ref: "dma_detail",
	target: "dma_result=body"
}

```




**[RESPONSE]**

```xml
<w2:dataMap id="dma_result" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="completeYn" name="처리결과" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```



---