## 1. [ULDSTF70034_n2/p2][투자계약증권/신탁수익증권][만기에 의한 상장폐지] 상장폐지 중복 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_dupCheck - searchDigitalDupDelist`
*   **TO-BE** : `get /api/listing/lstproc/digital/delisting/select-list-dup`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_dup=body"
}
// requestData 지정
const requestData = {
    isuCd: "",
	delistDd: "",
	bzProcsNo: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_dup" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="isuCd" name="중복 종목코드" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 2. [ULDSTF70034_n2][투자계약증권/신탁수익증권][만기에 의한 상장폐지] 신규 대상종목 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_new_onload (DIV_IDX=8, NEWSEL)`
*   **TO-BE** : `get /api/listing/lstproc/digital/delisting/select-list-new-isu`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_newIsu=body"
}
// requestData 지정
const requestData = {
    gubunCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_newIsu" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호 (p2 만)" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목약명" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="isurNm" name="발행기관약명 (n2 만)" dataType="text"></w2:column>
		<w2:column id="comNm" name="발행기관약명 (p2 만)" dataType="text"></w2:column>
		<w2:column id="lsttrdDd" name="최종거래일자" dataType="text"></w2:column>
		<w2:column id="exerEndDd" name="만기일자 (n2 만)" dataType="text"></w2:column>
		<w2:column id="isuPrc" name="상장금액 (n2 만)" dataType="number"></w2:column>
		<w2:column id="isuShrs" name="상장수량 (n2 만)" dataType="number"></w2:column>
		<w2:column id="secugrpId" name="증권그룹ID" dataType="text"></w2:column>
		<w2:column id="secugrpIdNm" name="증권그룹명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 3. [ULDSTF70034_n2][투자계약증권/신탁수익증권][만기에 의한 상장폐지] 등록

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_save - saveDigitalDelist(TRS_IDX=1)`
*   **TO-BE** : `post /api/listing/lstproc/digital/delisting/register`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	ref: "dma_register"
}
```

```xml
<w2:dataMap id="dma_register" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호 (등록: /api/listing/common/bzprocsno/create 채번값, 수정: 목록 선택값)" dataType="text"></w2:key>
		<w2:key id="isuCd" name="상장폐지 종목코드 (AS-IS dts_Isu.ISU_CD)" dataType="text"></w2:key>
		<w2:key id="delistDd" name="상장폐지일자(YYYYMMDD) (AS-IS edt_DelistDd)" dataType="text"></w2:key>
		<w2:key id="delistRsnCd" name="상장폐지사유코드 (AS-IS 신규 기본값 730002)" dataType="text"></w2:key>
		<w2:key id="delistRsnDsc" name="상장폐지사유설명 (AS-IS 신규 기본값 &apos;투자계약증권/신탁수익증권 최종거래일 도래&apos;)" dataType="text"></w2:key>
		<w2:key id="grndRegulNm" name="근거규정명 (AS-IS txb_GrndRegulNm)" dataType="text"></w2:key>
		<w2:key id="remk" name="기타(비고) (AS-IS txa_Remk)" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

---