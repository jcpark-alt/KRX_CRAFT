## 1. [ULDSTF05702][신주인수권증권][행사가격변경] 변경전 행사가격 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_bfprc`
*   **TO-BE** : `GET /api/listing/lstproc/warrant/exerprcchange/select-bfprc`

**[REQUEST]**

```javascript
// requestData 지정
const requestData = {
    isuCd: 조회 영역의 isuCd(종목코드)
};
```


**[RESPONSE & 처리]**

```javascript
const result = await $c.sbm.executeDynamic(sbmOptions, requestData);
dma_detail.set('bfchgExerPrc', result.responseJSON.body.bfchgExerPrc);

```

---














## 2. [ULDSTF05702][신주인수권증권][행사가격변경] 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_list_sync`
*   **TO-BE** : `GET /api/listing/lstproc/warrant/exerprcchange/select-list`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_list=body"
}

// requestData 지정
const requestData = {
    isuCd: 조회 영역의 isuCd(종목코드)
};
```






**[RESPONSE]**

```xml
<w2:dataList id="dlt_list" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="rnum" name="순번" dataType="number"></w2:column>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="chgDd" name="변경일자" dataType="text"></w2:column>
		<w2:column id="chgRsnContn" name="변경사유내용" dataType="text"></w2:column>
		<w2:column id="bfchgExerPrc" name="변경전행사가격" dataType="number"></w2:column>
		<w2:column id="afchgExerPrc" name="변경후행사가격" dataType="number"></w2:column>
		<w2:column id="empNm" name="최종처리자명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```


---
















## 3. [ULDSTF05702][신주인수권증권][행사가격변경] 상세 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_read_sync`
*   **TO-BE** : `GET /api/listing/lstproc/warrant/exerprcchange/select-one`

**[REQUEST]**


```javascript
// submission ref, target 지정
{
	target: "dma_detail=body"
}

// requestData 지정
const requestData = {
    bzProcsNo: dlt_list.getJSON().bzProcsNo
};
```






**[RESPONSE]**

```xml
<w2:dataMap id="dma_detail" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="chgDd" name="변경일자" dataType="text"></w2:key>
		<w2:key id="chgRsnContn" name="변경사유내용" dataType="text"></w2:key>
		<w2:key id="bfchgExerPrc" name="변경전행사가격" dataType="number"></w2:key>
		<w2:key id="afchgExerPrc" name="변경후행사가격" dataType="number"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

---












## 4. [ULDSTF05702][신주인수권증권][행사가격변경] 수정

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_update`
*   **TO-BE** : `POST /api/listing/lstproc/warrant/exerprcchange/modify`

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
		<w2:key id="completeYn" name="처리 완료 여부" dataType="text"></w2:key>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```



---













## 5. [ULDSTF05702][신주인수권증권][행사가격변경] 등록

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_save 신규 등록. 업무처리번호 채번 + 상장업무처리로그 반영.`
*   **TO-BE** : `POST /api/listing/lstproc/warrant/exerprcchange/register`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	ref: "dma_detail",
	target: "dma_result=body"
}

```


---














## 6. [ULDSTF05702][신주인수권증권][행사가격변경] 삭제

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_delete`
*   **TO-BE** : `POST /api/listing/lstproc/warrant/exerprcchange/remove`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dma_result=body"
}

// requestData 지정
const requestData = {
    bzProcsNo: ,
    isurCd
};
```



---

