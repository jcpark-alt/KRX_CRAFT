[ULDSTF05950][ELW][회원사알림] 기준분기 콤보 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_Bas_YYMM_sync`
*   **TO-BE** : get /api/listing/lstproc/elw/mbr-noti/select-list-bas-yymm

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_listbasyymmdd=body"
}
// requestData 지정
const requestData = {
    
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_listbasyymmdd" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="value" name="코드값" dataType="text"></w2:column>
		<w2:column id="text" name="코드명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```




---





## 2. [ULDSTF05950][ELW][회원사알림] [심사서류첨부/기타안내] 목록 조회조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_list_sync`
*   **TO-BE** : get /api/listing/lstproc/elw/mbr-noti/select-list-decl-contn

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_declcontn=body"
}

// requestData 지정
const requestData = {
    elwMbrInfoTpCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_declcontn" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="notiTitle" name="제목" dataType="text"></w2:column>
		<w2:column id="notiContn" name="내용" dataType="text"></w2:column>
		<w2:column id="strtDd" name="메시지 표시기간 시작일자(YYYY-MM-DD)" dataType="text"></w2:column>
		<w2:column id="endDd" name="메시지 표시기간 종료일자(YYYY-MM-DD)" dataType="text"></w2:column>
		<w2:column id="infoRnd" name="정보회차(일련번호, 수정/삭제 시 PK)" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```



---






## 3. [ULDSTF05950][ELW][회원사알림] [발행가능행사가격] 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_list_sync`
*   **TO-BE** : `get /api/listing/lstproc/elw/mbr-noti/select-list-exer-prc`

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











## 4. [ULDSTF05950][ELW][회원사알림] [상장제한종목] 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_list_sync`
*   **TO-BE** : `get /api/listing/lstproc/elw/mbr-noti/select-list-isu-lmt`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_isulimit=body"
}

// requestData 지정
const requestData = {
	chkYn:""
};
```






**[RESPONSE]**

```xml
<w2:dataList id="dlt_isulimit" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="isurCd" name="발행기관코드(종목코드)" dataType="text"></w2:column>
		<w2:column id="comAbbrv" name="회사약명(종목명)" dataType="text"></w2:column>
		<w2:column id="notiTitle" name="안내제목(제한사유)" dataType="text"></w2:column>
		<w2:column id="notiContn" name="안내내용(안내문)" dataType="text"></w2:column>
		<w2:column id="strtDd" name="시작일자(제한사유 발생시점, YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="endDd" name="종료일자(제한사유 종료시점, YYYYMMDD)" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>


```







---













## 5. [ULDSTF05950][ELW][회원사알림] [발행가능 코스닥150 기초자산] 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_list_sync`
*   **TO-BE** : `get /api/listing/lstproc/elw/mbr-noti/select-list-stridx-top5`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_staridx=body"
}

// requestData 지정
const requestData = {
	basYymm:""
};
```




**[RESPONSE]**

```xml
<w2:dataList id="dlt_staridx" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="rnk" name="순위" dataType="text"></w2:column>
		<w2:column id="basYymm" name="기준년월(YYYYMM)" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드(종목코드)" dataType="text"></w2:column>
		<w2:column id="comAbbrv" name="종목한글약명(종목명)" dataType="text"></w2:column>
		<w2:column id="mktcap" name="시가총액" dataType="text"></w2:column>
		<w2:column id="notiTitle" name="상장제한사유(제한기간) - 여러 건을 콤마로 결합" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```



---




## 6. [ULDSTF05950][ELW][회원사알림] [지수구성종목변동] 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_list_sync`
*   **TO-BE** : `get /api/listing/lstproc/elw/mbr-noti/select-list-uly-chg`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_uly=body"
}

// requestData 지정
const requestData = {
	
};
```




**[RESPONSE]**

```xml
<w2:dataList id="dlt_uly" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="isurCd" name="발행기관코드(종목코드)" dataType="text"></w2:column>
		<w2:column id="comAbbrv" name="회사약명(종목명)" dataType="text"></w2:column>
		<w2:column id="notiTitle" name="안내제목(지수구분)" dataType="text"></w2:column>
		<w2:column id="notiContn" name="안내내용(안내문)" dataType="text"></w2:column>
		<w2:column id="strtDd" name="시작일자(지수편출일, YYYY-MM-DD)" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>


```



---

## 7. [ULDSTF05950][ELW][회원사알림] [발행가능 KOSPI200 기초자산] 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_list_sync`
*   **TO-BE** : `get /api/listing/lstproc/elw/mbr-noti/select-list-uly-nm`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_uly=body"
}

// requestData 지정
const requestData = {
	'basYymm': ''
};
```




**[RESPONSE]**

```xml
<w2:dataList id="dlt_ulynm" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="rank" name="순위" dataType="text"></w2:column>
		<w2:column id="basYymm" name="기준년월(YYYYMM)" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuKorAbbrv" name="종목한글약명(종목명)" dataType="text"></w2:column>
		<w2:column id="dyavgTrdval" name="일평균거래대금" dataType="text"></w2:column>
		<w2:column id="mktcap" name="시가총액" dataType="text"></w2:column>
		<w2:column id="notiTitle" name="상장제한사유(제한기간) - 여러 건을 콤마로 결합" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>



```



---

## 8. [ULDSTF05950][ELW][회원사알림] [심사서류첨부/기타안내] 수정

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_save`
*   **TO-BE** : `post /api/listing/lstproc/elw/mbr-noti/modify-decl-contn`

**[REQUEST]**
```xml
<w2:dataMap id="dma_contn" baseNode="map">
	<w2:keyInfo>
		<w2:key id="elwMbrInfoTpCd *" name="ELW회원사알림정보구분코드(3:심사서류첨부, 4:기타안내)" dataType="text"></w2:key>
		<w2:key id="Constraints: Min 1 chars" name="string" dataType="text"></w2:key>
		<w2:key id="정보회차 - 수정 시 필수(PK). 등록 시에는 서버에서 채번하므로 전달값 무시" name="string" dataType="text"></w2:key>
		<w2:key id="메시지 표시기간 시작일자(YYYYMMDD). 미입력 시 매월 말일 포함 직전 3영업일로 자동 설정" name="string" dataType="text"></w2:key>
		<w2:key id="메시지 표시기간 종료일자(YYYYMMDD). 미입력 시 매월 말일 직전 영업일로 자동 설정" name="string" dataType="text"></w2:key>
		<w2:key id="제목" name="string" dataType="text"></w2:key>
		<w2:key id="내용" name="" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

```javascript
// submission ref, target 지정
{
	ref: "dma_contn",
	target: "dma_result=body"
}
```



**[RESPONSE]**
```xml
<w2:dataMap id="dma_result" baseNode="map">
	<w2:keyInfo>
		<w2:key id="result" name="처리결과(S:성공, F:실패)" dataType="text"></w2:key>
		<w2:key id="resultMessage" name="처리결과 메시지" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>


```



---


---

## 9. [ULDSTF05950][ELW][회원사알림] [상장제한종목/지수구성종목변동] 등록

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_save`
*   **TO-BE** : `post /api/listing/lstproc/elw/mbr-noti/modify-uly-chg`

**[REQUEST]**
```xml
<w2:dataMap id="dma_ulychg" baseNode="map">
	<w2:keyInfo>
		<w2:key id="elwMbrInfoTpCd" name="ELW회원사알림정보구분코드(1:상장제한종목, 2:지수구성종목변동)" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="strtDd" name="시작일자(YYYYMMDD) - 상장제한종목은 제한사유 발생시점, 지수구성종목변동은 지수편출일" dataType="text"></w2:key>
		<w2:key id="endDd" name="종료일자(YYYYMMDD) - 제한사유 종료시점. 상장제한종목(구분코드 1)에서만 사용" dataType="text"></w2:key>
		<w2:key id="notiTitle" name="안내제목 - 상장제한종목은 제한사유, 지수구성종목변동은 지수구분" dataType="text"></w2:key>
		<w2:key id="notiContn" name="안내내용(안내문)" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>


```

```javascript
// submission ref, target 지정
{
	ref: "dma_ulychg",
	target: "dma_result=body"
}
```



**[RESPONSE]**
```xml
<w2:dataMap id="dma_result" baseNode="map">
	<w2:keyInfo>
		<w2:key id="result" name="처리결과(S:성공, F:실패)" dataType="text"></w2:key>
		<w2:key id="resultMessage" name="처리결과 메시지" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>


```


---

## 10. [ULDSTF05950][ELW][회원사알림] [심사서류첨부/기타안내] 삭제

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_save`
*   **TO-BE** : `post /api/listing/lstproc/elw/mbr-noti/remove-decl-contn`

**[REQUEST]**
```xml
<w2:dataMap id="dma_contny" baseNode="map">
	<w2:keyInfo>
		<w2:key id="elwMbrInfoTpCd" name="ELW회원사알림정보구분코드(3:심사서류첨부, 4:기타안내)" dataType="text"></w2:key>
		<w2:key id="infoRnd" name="정보회차" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>



```

```javascript
// submission ref, target 지정
{
	ref: "elwMbrInfoTpCd",
	target: "dma_result=body"
}
```



**[RESPONSE]**
```xml
<w2:dataMap id="dma_result" baseNode="map">
	<w2:keyInfo>
		<w2:key id="result" name="처리결과(S:성공, F:실패)" dataType="text"></w2:key>
		<w2:key id="resultMessage" name="처리결과 메시지" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>


```

## 11. [ULDSTF05950][ELW][회원사알림] [상장제한종목/지수구성종목변동] 삭제

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_save`
*   **TO-BE** : `post /api/listing/lstproc/elw/mbr-noti/remove-uly-chg`

**[REQUEST]**
```xml
<w2:dataMap id="dma_ulydelete" baseNode="map">
	<w2:keyInfo>
		<w2:key id="elwMbrInfoTpCd *" name="ELW회원사알림정보구분코드(1:상장제한종목, 2:지수구성종목변동)" dataType="text"></w2:key>
		<w2:key id="Constraints: Min 1 chars" name="string" dataType="text"></w2:key>
		<w2:key id="발행기관코드" name="strtDd *" dataType="text"></w2:key>
		<w2:key id="string" name="" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>




```

```javascript
// submission ref, target 지정
{
	ref: "elwMbrInfoTpCd",
	target: "dma_result=body"
}
```



**[RESPONSE]**
```xml
<w2:dataMap id="dma_result" baseNode="map">
	<w2:keyInfo>
		<w2:key id="result" name="처리결과(S:성공, F:실패)" dataType="text"></w2:key>
		<w2:key id="resultMessage" name="처리결과 메시지" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>


```