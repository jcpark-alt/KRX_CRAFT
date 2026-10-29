## 1. [ULDSTF05806, ULDSTF05707][신주인수권증권/신주인수권증서][상장폐지] 이력 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `상장폐지 이력 목록(그리드) 조회. AS-IS fn_list_sync`
*   **TO-BE** : `GET /api/listing/lstproc/warrant/delisting/select-list`

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
		<w2:column id="draftYn" name="기안여부" dataType="text"></w2:column>
		<w2:column id="disclsYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="mktactYn" name="시장조치여부" dataType="text"></w2:column>
		<w2:column id="fnlEmpNm" name="최종처리자명" dataType="text"></w2:column>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="delistDd" name="상장폐지일자" dataType="text"></w2:column>
		<w2:column id="parval" name="액면가" dataType="number"></w2:column>
		<w2:column id="listShrs" name="상장증권수" dataType="number"></w2:column>
		<w2:column id="delistRsnCd" name="상장폐지사유코드" dataType="text"></w2:column>
		<w2:column id="delistRsnDsc" name="상장폐지사유설명" dataType="text"></w2:column>
		<w2:column id="grndRegulNm" name="근거규정명" dataType="text"></w2:column>
		<w2:column id="remk" name="비고" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```


---









## 2. [ULDSTF05806, ULDSTF05707][신주인수권증권/신주인수권증서][상장폐지] 상세 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `그리드 더블클릭 시 상세(입력폼 채움) 조회. AS-IS fn_read_sync`
*   **TO-BE** : `GET /api/listing/lstproc/warrant/delisting/select-one`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	
	target: "dma_detail=body"
}

// requestData 지정
const requestData = {
    bzProcsNo: ""
};
```






**[RESPONSE]**

```xml
<w2:dataMap id="dma_detail" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="delistDd" name="상장폐지일자" dataType="text"></w2:key>
		<w2:key id="delistAdvnotiStrtDd" name="상장폐지예고개시일자" dataType="text"></w2:key>
		<w2:key id="delistAdvnotiEndDd" name="상장폐지예고종료일자" dataType="text"></w2:key>
		<w2:key id="arrantrdMktactEnforceDd" name="정리매매시장조치시행일자" dataType="text"></w2:key>
		<w2:key id="arrantrdEndDd" name="정리매매종료일자" dataType="text"></w2:key>
		<w2:key id="parval" name="액면가" dataType="number"></w2:key>
		<w2:key id="listShrs" name="상장증권수" dataType="number"></w2:key>
		<w2:key id="delistRsnCd" name="상장폐지사유코드" dataType="text"></w2:key>
		<w2:key id="delistRsnDsc" name="상장폐지사유설명" dataType="text"></w2:key>
		<w2:key id="grndRegulNm" name="근거규정명" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
		<w2:key id="isuKorNm" name="한글종목명 (공시안내문용, AS-IS SELECT 재현)" dataType="text"></w2:key>
		<w2:key id="isuEngNm" name="영문종목명 (공시안내문용, AS-IS SELECT 재현)" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드 (공시안내문용, AS-IS SELECT 재현)" dataType="text"></w2:key>
		<w2:key id="trstComNm" name="위탁회사명" dataType="text"></w2:key>
		<w2:key id="trdHaltDd" name="매매거래정지일자" dataType="text"></w2:key>
		<w2:key id="trdHaltTYy" name="매매거래정지연도" dataType="text"></w2:key>
		<w2:key id="trdHaltTMm" name="매매거래정지월" dataType="text"></w2:key>
		<w2:key id="trdHaltTDd" name="매매거래정지일" dataType="text"></w2:key>
		<w2:key id="trdHaltDdT" name="매매거래정지일자(YYYY-MM-DD)" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```


---













## 3. [ULDSTF05806, ULDSTF05707][신주인수권증권/신주인수권증서][상장폐지] 총주식수 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `종목 선택 시 총주식수 조회. AS-IS fn_isubook_read_sync`
*   **TO-BE** : `GET /api/listing/lstproc/warrant/delisting/select-totstkcnt`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dma_totstkcnt=body"
}

// requestData 지정
const requestData = {
    isuCd: ""
};
```






**[RESPONSE]**

```xml
<w2:dataMap id="dma_totstkcnt" baseNode="map">
	<w2:keyInfo>
		<w2:key id="parval" name="액면가" dataType="number"></w2:key>
		<w2:key id="listShrs" name="상장증권수" dataType="number"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

---



## 4. [ULDSTF05806, ULDSTF05707][신주인수권증권/신주인수권증서][상장폐지] 수정

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_update`
*   **TO-BE** : `POST /api/listing/lstproc/warrant/delisting/modify`

**[REQUEST]**

```xml
<w2:dataMap id="dma_save" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호 (수정 시 필수, 등록 시 서버채번)" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="secugrpId" name="증권그룹코드 SW(신주인수권증권)/SR(신주인수권증서) - LIST_BZ_TP_CD 203/204 분기용" dataType="text"></w2:key>
		<w2:key id="delistDd" name="상장폐지일자" dataType="text"></w2:key>
		<w2:key id="delistAdvnotiStrtDd" name="상장폐지예고개시일자" dataType="text"></w2:key>
		<w2:key id="delistAdvnotiEndDd" name="상장폐지예고종료일자" dataType="text"></w2:key>
		<w2:key id="arrantrdMktactEnforceDd" name="정리매매시장조치시행일자" dataType="text"></w2:key>
		<w2:key id="arrantrdEndDd" name="정리매매종료일자" dataType="text"></w2:key>
		<w2:key id="delistRsnCd" name="상장폐지사유코드" dataType="text"></w2:key>
		<w2:key id="delistRsnDsc" name="상장폐지사유설명" dataType="text"></w2:key>
		<w2:key id="grndRegulNm" name="근거규정명" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataMap id="dma_saveIsuDtl" baseNode="map">
	<w2:keyInfo>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="listShrs" name="상장증권수" dataType="number"></w2:key>
		<w2:key id="parval" name="액면가" dataType="number"></w2:key>
		<w2:key id="isuPrc" name="발행가격" dataType="number"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

```javascript
// submission ref, target 지정
{
	target: "dma_saveResult=body"
}

const requestData = {
    ...dma_save.getJSON(),
    isuDtl : dma_saveIsuDtl.getAllJSON()
};

```




**[RESPONSE]**

```xml
<w2:dataMap id="dma_saveResult" baseNode="map">
	<w2:keyInfo>
		<w2:key id="completeYn" name="처리 완료 여부" dataType="text"></w2:key>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

**[RESPONSE & 처리]**
dma_saveResult.completeYn 는 boolean 이다.

---









## 5. [ULDSTF05806, ULDSTF05707][신주인수권증권/신주인수권증서][상장폐지] 등록

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `신규 등록. 업무처리번호 채번 + 상장업무처리로그 반영. AS-IS fn_sav`
*   **TO-BE** : `POST /api/listing/lstproc/warrant/delisting/register`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dma_saveResult=body"
}

const requestData = {
    ...dma_save.getJSON(),
    isuDtl : dma_saveIsuDtl.getAllJSON()
};

```

---






## 6. [ULDSTF05806, ULDSTF05707][신주인수권증권/신주인수권증서][상장폐지] 삭제

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_delete`
*   **TO-BE** : `POST /api/listing/lstproc/warrant/delisting/remove`

**[REQUEST]**

```xml
<w2:dataMap id="dma_delete" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo *" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="Constraints: Min 1 chars" name="string" dataType="text"></w2:key>
		<w2:key id="발행기관코드" name="secugrpId *" dataType="text"></w2:key>
		<w2:key id="string" name="" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

```javascript
// submission ref, target 지정
{
	ref: "dma_delete",
	target: "dma_saveResult=body"
}



---






















