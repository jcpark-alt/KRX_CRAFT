
# [마감관리] 채권상장마감 API 명세 및 변환 정보


## 1. [ULDBNS30300][마감관리][채권상장마감] 상장마감 종목정보 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_SearchClsDtl`
*   **TO-BE** : `GET /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseClsDtl-select`

**[REQUEST]**
```javascript
{
	ref: dma_search,
	target: dlt_searchTotList
}

const requestData = {
    strtDd: 적용일,
	clsDd: 종료일,
	bndMktactTpCd: 시장조치구분,
	applYn: 적용여부,
	stdCd: 표준코드,
	empNo: 로그인사번,
	isurCd: 발행기관코드,
	taskDd: 작업일자
};

```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_searchTotList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="procState" name="채권처리구분" dataType="text"></w2:column>
		<w2:column id="bndApplId" name="채권신청ID" dataType="text"></w2:column>
		<w2:column id="coNm" name="발행기관명" dataType="text"></w2:column>
		<w2:column id="mktNm" name="시장조치구분" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목 코드" dataType="text"></w2:column>
		<w2:column id="reqDt" name="채권신청일" dataType="text"></w2:column>
		<w2:column id="recvDt" name="접수처리일" dataType="text"></w2:column>
		<w2:column id="procDt" name="처리완료일" dataType="text"></w2:column>
		<w2:column id="bossProcDt" name="팀장확인일" dataType="text"></w2:column>
		<w2:column id="procReqDt" name="처리요구일" dataType="text"></w2:column>
		<w2:column id="aplDt" name="적용일" dataType="text"></w2:column>
		<w2:column id="reqPrsnCd" name="신청자구분" dataType="text"></w2:column>
		<w2:column id="bankBndNm" name="은행채구분" dataType="text"></w2:column>
		<w2:column id="bkbndTpCd" name="은행채구분코드" dataType="text"></w2:column>
		<w2:column id="retRsn" name="반송사유" dataType="text"></w2:column>
		<w2:column id="acptTranstrNm" name="접수처리자명" dataType="text"></w2:column>
		<w2:column id="procsCompltChrgNm" name="처리완료자명" dataType="text"></w2:column>
		<w2:column id="retChrgNm" name="반송자" dataType="text"></w2:column>
		<w2:column id="ctnt" name="신청내용" dataType="text"></w2:column>
		<w2:column id="bndMktactTpCd" name="채권시장조치구분코드" dataType="text"></w2:column>
		<w2:column id="searchGbNm" name="검색구분명" dataType="text"></w2:column>
		<w2:column id="teamleadrNm" name="팀장명" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>


```

* **submission target**: `"dlt_searchTotList=body"`

---

## 2. [ULDBNS30300][마감관리][채권상장마감] 상장마감한 시장조치목록 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_SearchClsEnd`
* **TO-BE** : `GET /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseClsEnd-select`

**[REQUEST]**

```javascript
{
	ref: dma_search,
	target: dlt_bndListingCloseClsEnd
}

const requestData = {
    strtDd: 적용일,
	clsDd: 종료일,
	bndMktactTpCd: 시장조치구분,
	applYn: 적용여부,
	stdCd: 표준코드,
	empNo: 로그인사번,
	isurCd: 발행기관코드,
	taskDd: 작업일자
};

```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_bndListingCloseClsEnd" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bndMktactTpCd" name="시장조치코드" dataType="text"></w2:column>
		<w2:column id="bndMktactTpNm" name="시장조치명" dataType="text"></w2:column>
		<w2:column id="mktactCnt" name="시장조치개수" dataType="text"></w2:column>
		<w2:column id="totMktactCnt" name="시장조치개수의 합" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>



```

* **submission target**: `"dlt_bndListingCloseClsEnd=body"`

---

## 3. [ULDBNS30300][마감관리][채권상장마감] 상장마감 종목정보(상장마감내역탭) 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_SearchClsDtl`
* **TO-BE** : `GET /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseClsEndDtl-select`

**[REQUEST]**

```javascript
{
	ref: dma_search,
	target: dlt_searchTotList
}

const requestData = {
    strtDd: 적용일,
	clsDd: 종료일,
	bndMktactTpCd: 시장조치구분,
	applYn: 적용여부,
	stdCd: 표준코드,
	empNo: 로그인사번,
	isurCd: 발행기관코드,
	taskDd: 작업일자
};

```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_searchPackListIsuList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="procState" name="채권처리구분" dataType="text"></w2:column>
		<w2:column id="bndApplId" name="채권신청ID" dataType="text"></w2:column>
		<w2:column id="coNm" name="발행기관명" dataType="text"></w2:column>
		<w2:column id="mktNm" name="시장조치구분" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목 코드" dataType="text"></w2:column>
		<w2:column id="reqDt" name="채권신청일" dataType="text"></w2:column>
		<w2:column id="recvDt" name="접수처리일" dataType="text"></w2:column>
		<w2:column id="procDt" name="처리완료일" dataType="text"></w2:column>
		<w2:column id="bossProcDt" name="팀장확인일" dataType="text"></w2:column>
		<w2:column id="procReqDt" name="처리요구일" dataType="text"></w2:column>
		<w2:column id="aplDt" name="적용일" dataType="text"></w2:column>
		<w2:column id="reqPrsnCd" name="신청자구분" dataType="text"></w2:column>
		<w2:column id="bankBndNm" name="은행채구분" dataType="text"></w2:column>
		<w2:column id="bkbndTpCd" name="은행채구분코드" dataType="text"></w2:column>
		<w2:column id="retRsn" name="반송사유" dataType="text"></w2:column>
		<w2:column id="acptTranstrNm" name="접수처리자명" dataType="text"></w2:column>
		<w2:column id="procsCompltChrgNm" name="처리완료자명" dataType="text"></w2:column>
		<w2:column id="retChrgNm" name="반송자" dataType="text"></w2:column>
		<w2:column id="ctnt" name="신청내용" dataType="text"></w2:column>
		<w2:column id="bndMktactTpCd" name="채권시장조치구분코드" dataType="text"></w2:column>
		<w2:column id="searchGbNm" name="검색구분명" dataType="text"></w2:column>
		<w2:column id="teamleadrNm" name="팀장명" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>



```

* **submission target**: `"dlt_searchPackListIsuList=body"`

---

## 4. [ULDBNS30300][마감관리][채권상장마감] 상장마감 내역 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_SearchCls`
* **TO-BE** : `GET /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseClsList-select`

**[REQUEST]**

```javascript
{
	ref: dma_search,
	target: dlt_bndListingCloseClsList
}

const requestData = {
    strtDd: 적용일,
	clsDd: 종료일,
	bndMktactTpCd: 시장조치구분,
	applYn: 적용여부,
	stdCd: 표준코드,
	empNo: 로그인사번,
	isurCd: 발행기관코드,
	taskDd: 작업일자
};

```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_bndListingCloseClsList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bndMktactTpCd" name="시장조치코드" dataType="text"></w2:column>
		<w2:column id="bndMktactTpNm" name="시장조치명" dataType="text"></w2:column>
		<w2:column id="mktactCnt" name="시장조치갯수" dataType="text"></w2:column>
		<w2:column id="totMktactCnt" name="총 시장조치갯수" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>



```

* **submission target**: `"dlt_bndListingCloseClsList=body"`

---

## 5. [ULDBNS30300][마감관리][채권상장마감] 상장마감완료 전송정보 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_SearchSendIsuInfo`
* **TO-BE** : `GET /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseClsSendInfo-select`

**[REQUEST]**

```javascript
{
	ref: dma_search,
	target: dlt_bndListingCloseClsSendInfo
}

const requestData = {
    strtDd: 적용일,
	clsDd: 종료일,
	bndMktactTpCd: 시장조치구분,
	applYn: 적용여부,
	stdCd: 표준코드,
	empNo: 로그인사번,
	isurCd: 발행기관코드,
	taskDd: 작업일자
};

```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_bndListingCloseClsSendInfo" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="mktactNm" name="시장조치종류명" dataType="text"></w2:column>
		<w2:column id="taskDd" name="작업일자" dataType="text"></w2:column>
		<w2:column id="mktactTrnsmTm" name="전송시간" dataType="text"></w2:column>
		<w2:column id="mktactEndTm" name="종료시간" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>



```

* **submission target**: `"dlt_bndListingCloseClsSendInfo=body"`

---

## 6. [ULDBNS30300][마감관리][채권상장마감] 마감일 데이터 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_SearchClsDd`
* **TO-BE** : `GET /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseDd-select`

**[REQUEST]**

```javascript
{
	ref: dma_search,
	target: dlt_bndListingCloseDd
}

const requestData = {
    strtDd: 적용일,
	clsDd: 종료일,
	bndMktactTpCd: 시장조치구분,
	applYn: 적용여부,
	stdCd: 표준코드,
	empNo: 로그인사번,
	isurCd: 발행기관코드,
	taskDd: 작업일자
};

```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_bndListingCloseDd" baseNode="map">
	<w2:keyInfo>
		<w2:key id="clsDd" name="마감일" dataType="text"></w2:key>
		<w2:key id="validClsDd" name="마감일여부" dataType="text"></w2:key>
		<w2:key id="bizClsDd" name="업무마감일" dataType="text"></w2:key>
		<w2:key id="validBizClsDd" name="업무마감일여부" dataType="text"></w2:key>
		<w2:key id="prsntDd" name="현재일" dataType="text"></w2:key>
		<w2:key id="endClsDd" name="종료달력일자" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>



```

* **submission target**: `"dlt_bndListingCloseDd=body"`

---

## 7. [ULDBNS30300][마감관리][채권상장마감] 시장조치내역 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_SearchMktact,fn_SearchMktact1`
* **TO-BE** : `GET /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseMktackDtl-select`

**[REQUEST]**

```javascript
{
	ref: dma_search,
	target: dlt_bndListingCloseMktackDtl
}

const requestData = {
    strtDd: 적용일,
	clsDd: 종료일,
	bndMktactTpCd: 시장조치구분,
	applYn: 적용여부,
	stdCd: 표준코드,
	empNo: 로그인사번,
	isurCd: 발행기관코드,
	taskDd: 작업일자
};

```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_bndListingCloseMktackDtl" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bndApplId" name="채권신청ID" dataType="text"></w2:column>
		<w2:column id="bndMktactTpNm" name="채권시장조치구분코드명" dataType="text"></w2:column>
		<w2:column id="strtDd" name="적용일자" dataType="text"></w2:column>
		<w2:column id="contn" name="시장조치내용" dataType="text"></w2:column>
		<w2:column id="procsCompltChrgNm" name="처리완료담당자명" dataType="text"></w2:column>
		<w2:column id="bndMktactTpCd" name="시장조치구분코드" dataType="text"></w2:column>
		<w2:column id="packApplId" name="일괄신청ID" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>


```

* **submission target**: `"dlt_bndListingCloseMktackDtl=body"`

---

## 8. [ULDBNS30300][마감관리][채권상장마감] 매매전송 종목정보 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_SearchSendData,fn_SearchSendData1`
* **TO-BE** : `GET /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseClsEndSendInfo-select`

**[REQUEST]**

```javascript
{
	ref: dma_search,
	target: dlt_bndListingCloseClsEndSendInfo
}

const requestData = {
    strtDd: 적용일,
	clsDd: 종료일,
	bndMktactTpCd: 시장조치구분,
	applYn: 적용여부,
	stdCd: 표준코드,
	empNo: 로그인사번,
	isurCd: 발행기관코드,
	taskDd: 작업일자
};

```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_bndListingCloseClsEndSendInfo" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="strtDd" name="영업일자4" dataType="text"></w2:column>
		<w2:column id="stdCd" name="종목코드5" dataType="text"></w2:column>
		<w2:column id="bndMktactTpCd" name="채권시장조치구분6" dataType="text"></w2:column>
		<w2:column id="recProcsCd" name="레코드처리구분7" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명8" dataType="text"></w2:column>
		<w2:column id="isuAbbrv" name="종목약명9" dataType="text"></w2:column>
		<w2:column id="isuEngNm" name="종목영문명10" dataType="text"></w2:column>
		<w2:column id="isuEngAbbrv" name="종목영문약명11" dataType="text"></w2:column>
		<w2:column id="isurNm" name="발행기관12" dataType="text"></w2:column>
		<w2:column id="listStatCd" name="채권상장구분코드13" dataType="text"></w2:column>
		<w2:column id="bndClssNm" name="채권분류14" dataType="text"></w2:column>
		<w2:column id="bndTpNm" name="채권유형15" dataType="text"></w2:column>
		<w2:column id="speclbndIsurCd" name="특수채발행채16" dataType="text"></w2:column>
		<w2:column id="munibndTpNm" name="지방채구분17" dataType="text"></w2:column>
		<w2:column id="bndGuarTpNm" name="채권보증구분18" dataType="text"></w2:column>
		<w2:column id="grtRt" name="지급보증율19" dataType="text"></w2:column>
		<w2:column id="nusualBndTpNm" name="특이채권유형20" dataType="text"></w2:column>
		<w2:column id="imbdoptCorpbndNm" name="옵션부사채21" dataType="text"></w2:column>
		<w2:column id="intPayMethdNm" name="이자지급방법22" dataType="text"></w2:column>
		<w2:column id="redmptMethdTpNm" name="리스크채권상환유형23" dataType="text"></w2:column>
		<w2:column id="bndIsuMethdNm" name="채권발행방법24" dataType="text"></w2:column>
		<w2:column id="asstSecutizTpNm" name="자산유동화구분25" dataType="text"></w2:column>
		<w2:column id="debtRepayRankTpNm" name="채무변제순위구분26" dataType="text"></w2:column>
		<w2:column id="listDd" name="상장일자27" dataType="text"></w2:column>
		<w2:column id="isuDd" name="발행일자28" dataType="text"></w2:column>
		<w2:column id="redmptDd" name="상환일자29" dataType="text"></w2:column>
		<w2:column id="saleDd" name="매출일자30" dataType="text"></w2:column>
		<w2:column id="fstIntPayDd" name="최초이자지급일자31" dataType="text"></w2:column>
		<w2:column id="bndIsuPrc" name="채권발행율32" dataType="text"></w2:column>
		<w2:column id="coupnRt" name="표면이자율33" dataType="text"></w2:column>
		<w2:column id="intPayCalcMms" name="이자지급계산월수34" dataType="text"></w2:column>
		<w2:column id="coupnPayMethdNm" name="이표지급방법35" dataType="text"></w2:column>
		<w2:column id="bndIntPayDdBasTpNm" name="채권이자지급일기준구분36" dataType="text"></w2:column>
		<w2:column id="intMmendTpNm" name="이자월말구분37" dataType="text"></w2:column>
		<w2:column id="intUdwonProcsNm" name="이자원단위미만처리38" dataType="text"></w2:column>
		<w2:column id="intPayUnitMms" name="이자지급단위월수39" dataType="text"></w2:column>
		<w2:column id="bndSaleTpNm" name="채권매출형태40" dataType="text"></w2:column>
		<w2:column id="bndPreSaleIntPayMethdNm" name="채권선매출이자지급방법41" dataType="text"></w2:column>
		<w2:column id="isuAmt" name="발행금액42" dataType="text"></w2:column>
		<w2:column id="listAmt" name="상장금액43" dataType="text"></w2:column>
		<w2:column id="packAmtFinalYn" name="일괄금액확정여부44" dataType="text"></w2:column>
		<w2:column id="currTpNm" name="통화구분45" dataType="text"></w2:column>
		<w2:column id="expRedmptRto" name="만기상환비율46" dataType="text"></w2:column>
		<w2:column id="grtYd" name="보장수익률47" dataType="text"></w2:column>
		<w2:column id="grtYdStrtDd" name="보장수익률적용일자48" dataType="text"></w2:column>
		<w2:column id="addYd" name="추가수익률49" dataType="text"></w2:column>
		<w2:column id="addYdStrtDd" name="추가수익률적용일자50" dataType="text"></w2:column>
		<w2:column id="eqmtFnd" name="시설자금51" dataType="text"></w2:column>
		<w2:column id="operFnd" name="운영자금52" dataType="text"></w2:column>
		<w2:column id="refundFnd" name="차환자금53" dataType="text"></w2:column>
		<w2:column id="miscFnd" name="기타자금54" dataType="text"></w2:column>
		<w2:column id="signYn" name="기명여부55" dataType="text"></w2:column>
		<w2:column id="taxYn" name="과세여부56" dataType="text"></w2:column>
		<w2:column id="bndMajagntComNm" name="채권주관기관57" dataType="text"></w2:column>
		<w2:column id="grtInstNm" name="지급보증기관58" dataType="text"></w2:column>
		<w2:column id="trstInstNm" name="수탁기관59" dataType="text"></w2:column>
		<w2:column id="regInstNm" name="등록기관60" dataType="text"></w2:column>
		<w2:column id="princintPayAgntNm" name="원리금지급대행기관61" dataType="text"></w2:column>
		<w2:column id="bndSrtCd" name="종목단축코드62" dataType="text"></w2:column>
		<w2:column id="bndDelistRsnNm" name="채권상장폐지사유63" dataType="text"></w2:column>
		<w2:column id="bndDelistDd" name="채권상장폐지일자64" dataType="text"></w2:column>
		<w2:column id="stkRelCorpbndRghtTpNm" name="주식관련사채권리구분65" dataType="text"></w2:column>
		<w2:column id="objIsuCd" name="대상종목코드66" dataType="text"></w2:column>
		<w2:column id="objIsuNm" name="대상종목명67" dataType="text"></w2:column>
		<w2:column id="stkRelCorpbndExerPrc" name="주식관련사채권리행사가격68" dataType="text"></w2:column>
		<w2:column id="exerRto" name="행사비율69" dataType="text"></w2:column>
		<w2:column id="exerStrtDd" name="행사개시일자70" dataType="text"></w2:column>
		<w2:column id="exerEndDd" name="행사종료일자71" dataType="text"></w2:column>
		<w2:column id="clmInstNm" name="청구기관코드명72" dataType="text"></w2:column>
		<w2:column id="divReckDdTpNm" name="배당기산일구분코드명73" dataType="text"></w2:column>
		<w2:column id="proftPartcAccYn" name="이익참가누적여부74" dataType="text"></w2:column>
		<w2:column id="subsrghtExerAfIsuCd" name="신주인수권행사이후종목코드75" dataType="text"></w2:column>
		<w2:column id="splitRedmptTpNm" name="분할상환유형구분76" dataType="text"></w2:column>
		<w2:column id="equivRedmptVal" name="균등상환액77" dataType="text"></w2:column>
		<w2:column id="defrMms" name="거치개월수78" dataType="text"></w2:column>
		<w2:column id="redmptPdIntTpNm" name="상환기간이자구분79" dataType="text"></w2:column>
		<w2:column id="splitRedmptCnt" name="분할상환횟수80" dataType="text"></w2:column>
		<w2:column id="intRtDecsnMiscBasIntNm" name="이자율결정기타기준금리명81" dataType="text"></w2:column>
		<w2:column id="spd" name="가산금리82" dataType="text"></w2:column>
		<w2:column id="intRtDecsnTmNm" name="이자율결정시점코드83" dataType="text"></w2:column>
		<w2:column id="uplmtCoupnRt" name="상한표면이자율84" dataType="text"></w2:column>
		<w2:column id="lwlmtCoupnRt" name="하한표면이자율85" dataType="text"></w2:column>
		<w2:column id="intRtDecsnBasDd" name="이자율결정기준일자86" dataType="text"></w2:column>
		<w2:column id="nusualIsuCondContn" name="특이발행조건내용87" dataType="text"></w2:column>
		<w2:column id="bkHoldyDdIntPayMethdNm" name="은행휴무일이자지급방법88" dataType="text"></w2:column>
		<w2:column id="hbrdbndYn" name="신종자본증권여부89,영구채권만기구조여부89" dataType="text"></w2:column>
		<w2:column id="condCapSecuTpCd" name="조건부자본증권여부90" dataType="text"></w2:column>
		<w2:column id="coupnRtFinalYn" name="표면이자율확정여부91" dataType="text"></w2:column>
		<w2:column id="bndStripTpNm" name="채권스트립구분92" dataType="text"></w2:column>
		<w2:column id="objOrgnBndCd" name="대상원본채권코드93" dataType="text"></w2:column>
		<w2:column id="stripNsprtBal" name="스트립미분리잔액94" dataType="text"></w2:column>
		<w2:column id="infllnkYn" name="물가연동여부95" dataType="text"></w2:column>
		<w2:column id="isuDdRefIdx" name="발행일참조지수96" dataType="text"></w2:column>
		<w2:column id="coupnRtDecsnBasIntNm" name="표면이자율결정기준금리97" dataType="text"></w2:column>
		<w2:column id="bndOddllotddIntBasTpNm" name="채권단수일이자기준구분98" dataType="text"></w2:column>
		<w2:column id="bkHoldyDdIntBasIntNm" name="은행휴무일이자지급유형99" dataType="text"></w2:column>
		<w2:column id="bkHoldyDdIntCmpAcrintRt" name="은행휴무이자대비경과이자율100" dataType="text"></w2:column>
		<w2:column id="bkHoldyPrincPayDdDecsnNm" name="은행휴무일원금지급결정101" dataType="text"></w2:column>
		<w2:column id="bkHoldyDdPrincBasIntNm" name="은행휴무일원금지급유형102" dataType="text"></w2:column>
		<w2:column id="bkHoldyDdPrincAcrintRt" name="은행휴무일원금경과이자율103" dataType="text"></w2:column>
		<w2:column id="scbdInt" name="낙찰금리104" dataType="text"></w2:column>
		<w2:column id="fstCallExerStrtDd" name="1차콜행사개시일자105" dataType="text"></w2:column>
		<w2:column id="fstCallExerEndDd" name="1차콜행사종료일자106" dataType="text"></w2:column>
		<w2:column id="scndCallExerStrtDd" name="2차콜행사개시일자107" dataType="text"></w2:column>
		<w2:column id="scndCallExerEndDd" name="2차콜행사종료일자108" dataType="text"></w2:column>
		<w2:column id="callExerRsn" name="콜행사사유109" dataType="text"></w2:column>
		<w2:column id="fstPutExerStrtDd" name="1차풋행사개시일자110" dataType="text"></w2:column>
		<w2:column id="fstPutExerEndDd" name="1차풋행사종료일자111" dataType="text"></w2:column>
		<w2:column id="scndPutExerStrtDd" name="2차풋행사개시일자112" dataType="text"></w2:column>
		<w2:column id="scndPutExerEndDd" name="2차풋행사종료일자113" dataType="text"></w2:column>
		<w2:column id="putExerRsn" name="풋행사사유114" dataType="text"></w2:column>
		<w2:column id="multyYn" name="시장조치중복여부" dataType="text"></w2:column>
		<w2:column id="clsApplyYn" name="마감이력여부" dataType="text"></w2:column>
		<w2:column id="presaleGovbndTrdTpNm" name="발행전국채거래구분코드115" dataType="text"></w2:column>
		<w2:column id="splitRedmptDd" name="분할상환일" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>



```

* **submission target**: `"dlt_bndListingCloseClsEndSendInfo=body"`

---

## 9. [ULDBNS30300][마감관리][채권상장마감] 상장마감

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_ClsProcs`
* **TO-BE** : `POST /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseCls-proc`

**[REQUEST]**

```javascript
{
	ref: dma_save,
}

const requestData = {
    strtDd:	적용일,
	empNo:	로그인사번,
	empNm:	로그인 성명,
	clsDd:	마감일자
};

```

**[RESPONSE]**

---

## 10. [ULDBNS30300][마감관리][채권상장마감] 재마감처리

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_ReClsProcs`
* **TO-BE** : `POST /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseReCls-proc`

**[REQUEST]**

```javascript
{
	ref: dma_save,
}

const requestData = {
    strtDd:	적용일,
	empNo:	로그인사번,
	empNm:	로그인 성명,
	clsDd:	마감일자
};

```

**[RESPONSE]**

---

## 11. [ULDBNS30300][마감관리][채권상장마감] 완성형한글체크 결과 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_SendCfm`
* **TO-BE** : `GET /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseKorChk-select`

**[REQUEST]**

```javascript
{
	ref: dma_search,
	target: dma_bndListingCloseKorChk
}

const requestData = {
    strtDd: 적용일,
	clsDd: 종료일,
	bndMktactTpCd: 시장조치구분,
	applYn: 적용여부,
	stdCd: 표준코드,
	empNo: 로그인사번,
	isurCd: 발행기관코드,
	taskDd: 작업일자
};

```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_bndListingCloseKorChk" baseNode="map">
	<w2:keyInfo>
		<w2:key id="div" name="구분" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관" dataType="text"></w2:key>
		<w2:key id="comNm" name="발행기관명" dataType="text"></w2:key>
		<w2:key id="comAbbrv" name="발행기관약어" dataType="text"></w2:key>
		<w2:key id="chk" name="체크할 발행기관명" dataType="text"></w2:key>
		<w2:key id="failCnt" name="한글명 체크 결과값 임시변수" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>



```

* **submission target**: `"dma_bndListingCloseKorChk=body"`

---

## 12. [ULDBNS30300][마감관리][채권상장마감] 전송내역생성 전 체크 결과 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_SendCfm`
* **TO-BE** : `GET /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseChkProc-select`

**[REQUEST]**

```javascript
{
	ref: dma_search,
	target: dma_bndListingCloseChkProc
}

const requestData = {
    strtDd: 적용일,
	clsDd: 종료일,
	bndMktactTpCd: 시장조치구분,
	applYn: 적용여부,
	stdCd: 표준코드,
	empNo: 로그인사번,
	isurCd: 발행기관코드,
	taskDd: 작업일자
};

```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_bndListingCloseChkProc" baseNode="map">
	<w2:keyInfo>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="stdCd" name="표준코드" dataType="text"></w2:key>
		<w2:key id="stdCdAppl" name="표준코드신청 마스터코드" dataType="text"></w2:key>
		<w2:key id="hasCreditRcv" name="채권신용등급수신종목내역 포함여부" dataType="text"></w2:key>
		<w2:key id="validCreditRcv" name="채권일자별신용등급기록상세 포함여부" dataType="text"></w2:key>
		<w2:key id="validStrip" name="스트립통합처리 확인여부" dataType="text"></w2:key>
		<w2:key id="validBndCls" name="시장조치처리종료시각 여부" dataType="text"></w2:key>
		<w2:key id="validBndCls1" name="시장조치반영시작시각 여부" dataType="text"></w2:key>
		<w2:key id="validSendCfm" name="시장조치처리시작시각 여부" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>



```

* **submission target**: `"dma_bndListingCloseChkProc=body"`

---

## 13. [ULDBNS30300][마감관리][채권상장마감] 종목중복체크 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_SendCfm`
* **TO-BE** : `GET /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseDupIsu-select`

**[REQUEST]**

```javascript
{
	ref: dma_search,
	target: dlt_bndListingCloseDupIsu
}

const requestData = {
    strtDd: 적용일,
	clsDd: 종료일,
	bndMktactTpCd: 시장조치구분,
	applYn: 적용여부,
	stdCd: 표준코드,
	empNo: 로그인사번,
	isurCd: 발행기관코드,
	taskDd: 작업일자
};

```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_bndListingCloseDupIsu" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="dupIsu" name="종목중복코드" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>



```

* **submission target**: `"dma_seardlt_bndListingCloseDupIsuchPrevBzDd=body"`

---

## 14. [ULDBNS30300][마감관리][채권상장마감] 시장조치내역 생성

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_SendCfm`
* **TO-BE** : `POST /api/bonds/bndCloseMgt/bndListingClose/bndListingCloseSend-proc`

**[REQUEST]**

```javascript
{
	ref: dma_save,
}

const requestData = {
    strtDd:	적용일,
	empNo:	로그인사번,
	empNm:	로그인 성명,
	clsDd:	마감일자
};

```

**[RESPONSE]**

---