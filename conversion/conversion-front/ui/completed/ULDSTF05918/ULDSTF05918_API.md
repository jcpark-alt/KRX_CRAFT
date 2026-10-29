## 1. [ULDSTF05918][ELW][상장폐지][팝업] 최종거래일에 의한 상장폐지 기타 안내문구용 일자 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `[ELW][상장폐지][팝업] 기준일 이후 3영업일을 화면 안내문구 형식으로 조회하는 API`
*   **TO-BE** : `GET /api/listing/lstproc/elw/delisting/detail/select-last-trading-day-info`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dma_lastTradingDayInfo=body"
}

// requestData 지정
const requestData = {
    baseDd: ""
};


```





**[RESPONSE]**

```xml
<w2:dataMap id="dma_lastTradingDayInfo" baseNode="map">
	<w2:keyInfo>
		<w2:key id="delistDd" name="상장폐지일자 - 기준일 다음 2번째 영업일" dataType="text"></w2:key>
		<w2:key id="lsttrdDdF" name="최종거래일 표기문구" dataType="text"></w2:key>
		<w2:key id="delistDdF" name="상장폐지일 표기문구" dataType="text"></w2:key>
		<w2:key id="exerEndDdF" name="행사종료일 표기문구" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```



---










## 2. [ULDSTF05918][ELW][상장폐지][팝업] 최종거래일 도래 신규 대상종목 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `[ELW][상장폐지][팝업] 기준일 다음 영업일이 최종거래일인 종목을 조회하는 API`
*   **TO-BE** : `GET /api/listing/lstproc/elw/delisting/detail/select-new-isu-last-trading-day`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_newIsuLastTradingDay=body"
}

// requestData 지정
const requestData = {
    baseDd: ""
};

```






**[RESPONSE]**

```xml
<w2:dataList id="dlt_newIsuLastTradingDay" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호 (등록된 종목 조회에서만 조회됨)" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="elwLsttrdDd" name="ELW최종거래일" dataType="text"></w2:column>
		<w2:column id="exerEndDd" name="행사종료일" dataType="text"></w2:column>
		<w2:column id="isuPrc" name="발행가액" dataType="number"></w2:column>
		<w2:column id="isuShrs" name="발행증권수" dataType="number"></w2:column>
		<w2:column id="infoIsurCd" name="발행기관코드 (등록된 종목 조회에서만 조회됨)" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```




---










## 3. [ULDSTF05917~05939][ELW][상장폐지][팝업] 등록된 대상종목(ISU) 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `[ELW][상장폐지][팝업] 업무처리번호로 등록된 상장폐지 대상종목을 조회하는 API`
*   **TO-BE** : `GET /api/listing/lstproc/elw/delisting/detail/select-isu`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_isu=body"
}

// requestData 지정
const requestData = {
    bzProcsNo: ""
};

```



**[RESPONSE]**

```xml
<w2:dataList id="dlt_isu" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호 (등록된 종목 조회에서만 조회됨)" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="elwLsttrdDd" name="ELW최종거래일" dataType="text"></w2:column>
		<w2:column id="exerEndDd" name="행사종료일" dataType="text"></w2:column>
		<w2:column id="isuPrc" name="발행가액" dataType="number"></w2:column>
		<w2:column id="isuShrs" name="발행증권수" dataType="number"></w2:column>
		<w2:column id="infoIsurCd" name="발행기관코드 (등록된 종목 조회에서만 조회됨)" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```



---











## 4. [ULDSTF05917~05939][ELW][상장폐지][팝업] 상세(MST) 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `[ELW][상장폐지][팝업] 업무처리번호로 상장폐지 마스터를 조회하는 API`
*   **TO-BE** : `GET /api/listing/lstproc/elw/delisting/detail/select-mst`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dma_mst=body"
}

// requestData 지정
const requestData = {
    bzProcsNo: ""
};
```






**[RESPONSE]**

```xml
<w2:dataMap id="dma_mst" baseNode="map">
	<w2:keyInfo>
		<w2:key id="comNm" name="발행회사명" dataType="text"></w2:key>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="mktactApplObjTpCd" name="시장조치적용대상구분코드" dataType="text"></w2:key>
		<w2:key id="delistDd" name="상장폐지일자" dataType="text"></w2:key>
		<w2:key id="delistAdvnotiStrtDd" name="상장폐지예고개시일자" dataType="text"></w2:key>
		<w2:key id="delistAdvnotiEndDd" name="상장폐지예고종료일자" dataType="text"></w2:key>
		<w2:key id="delistAdvnotiPdDsc" name="상장폐지예고기간설명" dataType="text"></w2:key>
		<w2:key id="delistRsnCd" name="상장폐지사유코드" dataType="text"></w2:key>
		<w2:key id="delistRsnDsc" name="상장폐지사유설명" dataType="text"></w2:key>
		<w2:key id="ulyDelistRsnCd" name="기초자산상장폐지사유코드" dataType="text"></w2:key>
		<w2:key id="ulyDelistBzProcsNo" name="기초자산상장폐지업무처리번호" dataType="text"></w2:key>
		<w2:key id="arrantrdMktactEnforceDd" name="정리매매시장조치시행일자" dataType="text"></w2:key>
		<w2:key id="arrantrdEndDd" name="정리매매종료일자" dataType="text"></w2:key>
		<w2:key id="arrantrdPermiPdDsc" name="정리매매허용기간설명" dataType="text"></w2:key>
		<w2:key id="grndRegulNm" name="근거규정명" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
		<w2:key id="listAgnccomMbrNo" name="상장주선사회원번호" dataType="text"></w2:key>
		<w2:key id="trdHaltDd" name="매매거래정지일자" dataType="text"></w2:key>
		<w2:key id="trdHaltTYy" name="매매거래정지일자 - 연" dataType="text"></w2:key>
		<w2:key id="trdHaltTMm" name="매매거래정지일자 - 월" dataType="text"></w2:key>
		<w2:key id="trdHaltTDd" name="매매거래정지일자 - 일" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

---











## 5. [ULDSTF05917][ELW][상장폐지][팝업] 신규 대상종목 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `[ELW][상장폐지][팝업] 발행기관의 전부보유 상장폐지 대상종목을 조회하는 API`
*   **TO-BE** : `GET /api/listing/lstproc/elw/delisting/detail/select-new-isu`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_newIsu=body"
}

// requestData 지정
const requestData = {
    isurCd: ""
};
```






**[RESPONSE]**

```xml
<w2:dataList id="dlt_newIsu" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호 (등록된 종목 조회에서만 조회됨)" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="elwLsttrdDd" name="ELW최종거래일" dataType="text"></w2:column>
		<w2:column id="exerEndDd" name="행사종료일" dataType="text"></w2:column>
		<w2:column id="isuPrc" name="발행가액" dataType="number"></w2:column>
		<w2:column id="isuShrs" name="발행증권수" dataType="number"></w2:column>
		<w2:column id="infoIsurCd" name="발행기관코드 (등록된 종목 조회에서만 조회됨)" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```


---
















## 6. [ULDSTF05917~05939][ELW][상장폐지][팝업] 수정

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `[ELW][상장폐지][팝업] 상장폐지 마스터를 수정하고 대상종목을 전건 재등록하는 API`
*   **TO-BE** : `POST /api/listing/lstproc/elw/delisting/detail/modify`

**[REQUEST]**

```xml
<w2:dataMap id="dma_save" baseNode="map">
	<w2:keyInfo>
		<w2:key id="listBzTpCd" name="상장업무처리코드" dataType="text"></w2:key>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="delistDd" name="상장폐지일자(YYYYMMDD)" dataType="text"></w2:key>
		<w2:key id="delistRsnCd" name="상장폐지사유코드" dataType="text"></w2:key>
		<w2:key id="delistRsnDsc" name="상장폐지사유설명" dataType="text"></w2:key>
		<w2:key id="ulyDelistRsnCd" name="기초자산상장폐지사유코드 (ULDSTF05917 기초자산 구분일 때만 입력)" dataType="text"></w2:key>
		<w2:key id="ulyDelistBzProcsNo" name="기초자산상장폐지업무처리번호" dataType="text"></w2:key>
		<w2:key id="grndRegulNm" name="근거규정명" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataList id="dlt_saveIsuList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuPrc" name="발행가액" dataType="number"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```

```javascript
// submission ref, target 지정
{
	target: "dma_result=body"
}

const requestData = {
    ...dma_save.getJSON(),
    isuList : dlt_saveIsuList.getAllJSON()
};

```






**[RESPONSE]**

```xml
<w2:dataMap id="dma_result" baseNode="map">
	<w2:keyInfo>
		<w2:key id="completeYn" name="처리 성공 여부" dataType="text"></w2:key>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```



**[RESPONSE & 처리]**

dma_result.completeYn는 boolean.

---










## 7. [ULDSTF05917~05939][ELW][상장폐지][팝업] 등록

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `[ELW][상장폐지][팝업] 상장폐지 마스터/대상종목을 등록하는 API`
*   **TO-BE** : `POST /api/listing/lstproc/elw/delisting/detail/register`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dma_result=body"
}

const requestData = {
    ...dma_save.getJSON(),
    isuList : dlt_saveIsuList.getAllJSON()
};
```

---










## 8. [ULDSTF05917~05939][ELW][상장폐지][팝업] 삭제

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `[ELW][상장폐지][팝업] 상장폐지를 삭제 처리하는 API`
*   **TO-BE** : `POST /api/listing/lstproc/elw/delisting/detail/remove`

**[REQUEST]**

```xml

```

```javascript
// submission ref, target 지정
{
	target: "dma_result=body"
}

// requestData 지정
const requestData = {
    listBzTpCd :"",
	bzProcsNo :"",
	isurCd :"",
};

```




---










