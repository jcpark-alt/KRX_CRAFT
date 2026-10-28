## 1. [ULDSTF05923][ELW][상장원부] LP공급자 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_read_sync - readLpMbrNoIssueBook`
*   **TO-BE** : `GET /api/listing/lstproc/elw/listed-register/select-list-lp`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_lp=body"
}
// requestData 지정
const requestData = {
    isuCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_lp" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="lpMbrNo" name="LP회원번호" dataType="text"></w2:column>
		<w2:column id="lpMbrNm" name="유동성공급자명" dataType="text"></w2:column>
		<w2:column id="lpContrtDd" name="LP계약일자" dataType="text"></w2:column>
		<w2:column id="lpStrtDd" name="LP시작일자" dataType="text"></w2:column>
		<w2:column id="lpEndDd" name="LP종료일자" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 2. [ULDSTF05923][ELW][상장원부] 기초자산 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_read_sync - readUlyIssueBook`
*   **TO-BE** : `get /api/listing/lstproc/elw/listed-register/select-list-uly`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_ulyIsu=body"
}
// requestData 지정
const requestData = {
    isuCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_ulyIsu" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="ulyIsuCd" name="기초자산종목코드" dataType="text"></w2:column>
		<w2:column id="ulyIsuNm" name="기초자산명" dataType="text"></w2:column>
		<w2:column id="ulyCompstRto" name="기초자산구성비율" dataType="number"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 3. [ULDSTF05923][ELW][상장원부] 상세 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_read_sync - readIssueBook`
*   **TO-BE** : `get /api/listing/lstproc/elw/listed-register/select-one`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dma_isu=body"
}
// requestData 지정
const requestData = {
    isuCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_isu" baseNode="map">
	<w2:keyInfo>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="isuSrtCd" name="종목단축코드" dataType="text"></w2:key>
		<w2:key id="isuKorNm" name="한글종목명" dataType="text"></w2:key>
		<w2:key id="isuKorAbbrv" name="한글종목약명" dataType="text"></w2:key>
		<w2:key id="isuEngNm" name="영문종목명" dataType="text"></w2:key>
		<w2:key id="isuEngAbbrv" name="영문종목약명" dataType="text"></w2:key>
		<w2:key id="listDd" name="상장일자" dataType="text"></w2:key>
		<w2:key id="delistDd" name="상장폐지일자" dataType="text"></w2:key>
		<w2:key id="isuDd" name="발행일자" dataType="text"></w2:key>
		<w2:key id="elwLsttrdDd" name="ELW최종거래일자" dataType="text"></w2:key>
		<w2:key id="expDd" name="만기일자" dataType="text"></w2:key>
		<w2:key id="subsDd" name="청약일자" dataType="text"></w2:key>
		<w2:key id="payDd" name="납입일자" dataType="text"></w2:key>
		<w2:key id="isuPrc" name="발행가격" dataType="number"></w2:key>
		<w2:key id="isuShrs" name="발행증권수" dataType="number"></w2:key>
		<w2:key id="isuTotamt" name="발행총액" dataType="number"></w2:key>
		<w2:key id="elwConvRto" name="ELW전환비율" dataType="number"></w2:key>
		<w2:key id="payBkInstCd" name="납입은행기관코드" dataType="text"></w2:key>
		<w2:key id="payBkInstNm" name="납입은행기관명" dataType="text"></w2:key>
		<w2:key id="leadcomMbrNo" name="주간사회원번호" dataType="text"></w2:key>
		<w2:key id="leadcomMbrNm" name="주간사회원명" dataType="text"></w2:key>
		<w2:key id="udwrtInstCd" name="인수기관코드" dataType="text"></w2:key>
		<w2:key id="udwrtInstNm" name="인수기관명" dataType="text"></w2:key>
		<w2:key id="depoInstCd" name="예탁기관코드" dataType="text"></w2:key>
		<w2:key id="depoInstNm" name="예탁기관명" dataType="text"></w2:key>
		<w2:key id="bzagntInstCd" name="사무대행기관코드" dataType="text"></w2:key>
		<w2:key id="bzagntInstNm" name="사무대행기관명" dataType="text"></w2:key>
		<w2:key id="transstkAgntCd" name="명의개서대행기관코드" dataType="text"></w2:key>
		<w2:key id="transstkAgntNm" name="명의개서대행기관명" dataType="text"></w2:key>
		<w2:key id="uinscribeYn" name="무기명여부" dataType="text"></w2:key>
		<w2:key id="stdYn" name="표준여부" dataType="text"></w2:key>
		<w2:key id="fncUlyTpCd" name="금융기초자산구분코드" dataType="text"></w2:key>
		<w2:key id="elwObjIdxTpCd" name="ELW대상지수구분코드" dataType="text"></w2:key>
		<w2:key id="fornInvstLmtObjIsuYn" name="외국인투자한도대상종목여부" dataType="text"></w2:key>
		<w2:key id="idxCalcInstNm" name="지수산출기관명" dataType="text"></w2:key>
		<w2:key id="elwRghtTpKindCd" name="ELW권리형태종류코드" dataType="text"></w2:key>
		<w2:key id="trdMktNm" name="거래시장명" dataType="text"></w2:key>
		<w2:key id="elwRghtTpCd" name="ELW권리유형코드" dataType="text"></w2:key>
		<w2:key id="elwExerTpCd" name="ELW권리행사유형코드" dataType="text"></w2:key>
		<w2:key id="elwExerContn" name="ELW권리행사내용" dataType="text"></w2:key>
		<w2:key id="exerStrtDd" name="행사개시일자" dataType="text"></w2:key>
		<w2:key id="exerEndDd" name="행사종료일자" dataType="text"></w2:key>
		<w2:key id="autoExerTpCd" name="자동권리행사구분코드" dataType="text"></w2:key>
		<w2:key id="halfwyRedmptYn" name="중도상환여부" dataType="text"></w2:key>
		<w2:key id="elwLstSetlMethdCd" name="ELW최종결제방법코드" dataType="text"></w2:key>
		<w2:key id="elwUlyBasPrc" name="ELW기초자산기초가격" dataType="number"></w2:key>
		<w2:key id="elwExerPrc" name="ELW행사가격" dataType="number"></w2:key>
		<w2:key id="elwPrcUpPartcRt" name="ELW가격상승참가율" dataType="number"></w2:key>
		<w2:key id="elwCompnsRt" name="ELW보상률" dataType="number"></w2:key>
		<w2:key id="elwExpValuPrcMethd" name="ELW만기평가가격방식" dataType="text"></w2:key>
		<w2:key id="delisttmPayCondContn" name="상장폐지시지급조건내용" dataType="text"></w2:key>
		<w2:key id="elwPayDd" name="ELW지급일자" dataType="text"></w2:key>
		<w2:key id="elwPayAgntNm" name="ELW지급대리인명" dataType="text"></w2:key>
		<w2:key id="ordSpdRto" name="호가스프레드비율" dataType="number"></w2:key>
		<w2:key id="elwFinalPayVal" name="ELW확정지급액" dataType="number"></w2:key>
		<w2:key id="elwKoOccrBasPrc" name="ELW조기종료발생기준가격 (AS-IS TO_CHAR &apos;fm999999990.099&apos;)" dataType="text"></w2:key>
		<w2:key id="elwKoExerContn" name="ELW조기종료권리행사내용" dataType="text"></w2:key>
		<w2:key id="elwKoValuMethd" name="ELW조기종료평가방식" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

---


## 4. [ULDSTF05923][ELW][상장원부] 수정

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_update - updateIssueBook`
*   **TO-BE** : `post /api/listing/lstproc/elw/listed-register/modify`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	ref: "dma_save"
}
```

```xml
<w2:dataMap id="dma_save" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호 (/api/listing/common/bzprocsno/create 채번값)" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드 (종목팝업 선택값 ISUR_CD)" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="payBkInstCd" name="납입은행기관코드" dataType="text"></w2:key>
		<w2:key id="leadcomMbrNo" name="주간사회원번호" dataType="text"></w2:key>
		<w2:key id="udwrtInstCd" name="인수기관코드" dataType="text"></w2:key>
		<w2:key id="depoInstCd" name="예탁기관코드" dataType="text"></w2:key>
		<w2:key id="bzagntInstCd" name="사무대행기관코드" dataType="text"></w2:key>
		<w2:key id="transstkAgntCd" name="명의개서대행기관코드" dataType="text"></w2:key>
		<w2:key id="uinscribeYn" name="무기명여부" dataType="text"></w2:key>
		<w2:key id="stdYn" name="표준여부" dataType="text"></w2:key>
		<w2:key id="fornInvstLmtObjIsuYn" name="외국인투자한도대상종목여부" dataType="text"></w2:key>
		<w2:key id="elwObjIdxTpCd" name="ELW대상지수구분코드" dataType="text"></w2:key>
		<w2:key id="idxCalcInstNm" name="지수산출기관명" dataType="text"></w2:key>
		<w2:key id="elwRghtTpKindCd" name="ELW권리형태종류코드" dataType="text"></w2:key>
		<w2:key id="trdMktNm" name="거래시장명" dataType="text"></w2:key>
		<w2:key id="elwExerContn" name="ELW권리행사내용" dataType="text"></w2:key>
		<w2:key id="autoExerTpCd" name="자동권리행사구분코드" dataType="text"></w2:key>
		<w2:key id="halfwyRedmptYn" name="중도상환여부" dataType="text"></w2:key>
		<w2:key id="elwUlyBasPrc" name="ELW기초자산기초가격" dataType="number"></w2:key>
		<w2:key id="elwExerPrc" name="ELW행사가격" dataType="number"></w2:key>
		<w2:key id="elwPrcUpPartcRt" name="ELW가격상승참가율" dataType="number"></w2:key>
		<w2:key id="elwCompnsRt" name="ELW보상률" dataType="number"></w2:key>
		<w2:key id="elwExpValuPrcMethd" name="ELW만기평가가격방식" dataType="text"></w2:key>
		<w2:key id="delisttmPayCondContn" name="상장폐지시지급조건내용" dataType="text"></w2:key>
		<w2:key id="elwPayAgntNm" name="ELW지급대리인명" dataType="text"></w2:key>
		<w2:key id="ordSpdRto" name="호가스프레드비율" dataType="number"></w2:key>
		<w2:key id="elwFinalPayVal" name="ELW확정지급액" dataType="number"></w2:key>
		<w2:key id="elwKoOccrBasPrc" name="ELW조기종료발생기준가격 (AS-IS VARCHAR 바인딩)" dataType="text"></w2:key>
		<w2:key id="elwKoExerContn" name="ELW조기종료권리행사내용" dataType="text"></w2:key>
		<w2:key id="elwKoValuMethd" name="ELW조기종료평가방식" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

**[RESPONSE]**



---