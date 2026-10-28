## 1. [STF08200][ETN][마감처리] 시장정보 마감 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-invst-warn/md-close-check`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dma_mdCloseCheck=body"
}
// requestData 지정
const requestData = {
    trdDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_mdCloseCheck" baseNode="map">
	<w2:keyInfo>
		<w2:key id="batClsYn" name="배치마감여부" dataType="text"></w2:key>
		<w2:key id="regClsYn" name="정규장마감여부" dataType="text"></w2:key>
		<w2:key id="clsYn" name="최종마감여부" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

---


## 2. [STF08200][ETN][마감처리] 최종마감정보 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-invst-warn/select-final-log`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dma_finalLog=body"
}
// requestData 지정
const requestData = {
    trdDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_finalLog" baseNode="map">
	<w2:keyInfo>
		<w2:key id="chrgEmpNm" name="담당자명" dataType="text"></w2:key>
		<w2:key id="approvTeamleadrEmpNm" name="팀장명" dataType="text"></w2:key>
		<w2:key id="chrgApprovTm" name="담당자 확인시각" dataType="text"></w2:key>
		<w2:key id="teamleadrApprovTm" name="팀장 승인시각" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

---


## 3. [STF08200][ETN][마감처리] 지정 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-invst-warn/select-list-design`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_design=body"
}
// requestData 지정
const requestData = {
    trdDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_design" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="designDd" name="지정일자" dataType="text"></w2:column>
		<w2:column id="releasDd" name="매매거래정지해제일" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuKorNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="empNm" name="최종처리자" dataType="text"></w2:column>
		<w2:column id="disclsYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="fstDesignDd" name="최초지정일자" dataType="text"></w2:column>
		<w2:column id="etpInvstwarnDesignCd" name="ETP투자유의지정코드" dataType="text"></w2:column>
		<w2:column id="taskDd" name="거래일" dataType="text"></w2:column>
		<w2:column id="addYn" name="추가여부" dataType="text"></w2:column>
		<w2:column id="haltDesnrelsTpNm" name="거래정지지정및해제구분" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 4. [STF08200][ETN][마감처리] 지정연장 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-invst-warn/select-list-extn`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_extn=body"
}
// requestData 지정
const requestData = {
    trdDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_extn" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="designDd" name="지정일자" dataType="text"></w2:column>
		<w2:column id="releasDd" name="매매거래정지해제일" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuKorNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="empNm" name="최종처리자" dataType="text"></w2:column>
		<w2:column id="disclsYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="fstDesignDd" name="최초지정일자" dataType="text"></w2:column>
		<w2:column id="etpInvstwarnDesignCd" name="ETP투자유의지정코드" dataType="text"></w2:column>
		<w2:column id="taskDd" name="거래일" dataType="text"></w2:column>
		<w2:column id="addYn" name="추가여부" dataType="text"></w2:column>
		<w2:column id="haltDesnrelsTpNm" name="거래정지지정및해제구분" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 5. [STF08200][ETN][마감처리] 최초적출 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-invst-warn/select-list-first-detect`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_firstDetect=body"
}
// requestData 지정
const requestData = {
    trdDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_firstDetect" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="designDd" name="지정일자" dataType="text"></w2:column>
		<w2:column id="releasDd" name="매매거래정지해제일" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuKorNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="empNm" name="최종처리자" dataType="text"></w2:column>
		<w2:column id="disclsYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="fstDesignDd" name="최초지정일자" dataType="text"></w2:column>
		<w2:column id="etpInvstwarnDesignCd" name="ETP투자유의지정코드" dataType="text"></w2:column>
		<w2:column id="taskDd" name="거래일" dataType="text"></w2:column>
		<w2:column id="addYn" name="추가여부" dataType="text"></w2:column>
		<w2:column id="haltDesnrelsTpNm" name="거래정지지정및해제구분" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 6. [STF08200][ETN][마감처리] 투자유의종목 마감처리내역 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-invst-warn/select-list-hist`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_hist=body"
}
// requestData 지정
const requestData = {
    trdDd: "",
	etpInvstwarnCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_hist" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="designDd" name="지정일자" dataType="text"></w2:column>
		<w2:column id="releasDd" name="매매거래정지해제일" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuKorNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="empNm" name="최종처리자" dataType="text"></w2:column>
		<w2:column id="disclsYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="fstDesignDd" name="최초지정일자" dataType="text"></w2:column>
		<w2:column id="etpInvstwarnDesignCd" name="ETP투자유의지정코드" dataType="text"></w2:column>
		<w2:column id="taskDd" name="거래일" dataType="text"></w2:column>
		<w2:column id="addYn" name="추가여부" dataType="text"></w2:column>
		<w2:column id="haltDesnrelsTpNm" name="거래정지지정및해제구분" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 7. [STF08200][ETN][마감처리] 지정예고 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-invst-warn/select-list-noti`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_noti=body"
}
// requestData 지정
const requestData = {
    trdDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_noti" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="designDd" name="지정일자" dataType="text"></w2:column>
		<w2:column id="releasDd" name="매매거래정지해제일" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuKorNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="empNm" name="최종처리자" dataType="text"></w2:column>
		<w2:column id="disclsYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="fstDesignDd" name="최초지정일자" dataType="text"></w2:column>
		<w2:column id="etpInvstwarnDesignCd" name="ETP투자유의지정코드" dataType="text"></w2:column>
		<w2:column id="taskDd" name="거래일" dataType="text"></w2:column>
		<w2:column id="addYn" name="추가여부" dataType="text"></w2:column>
		<w2:column id="haltDesnrelsTpNm" name="거래정지지정및해제구분" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 8. [STF08200][ETN][마감처리] 지정해제 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-invst-warn/select-list-release`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_release=body"
}
// requestData 지정
const requestData = {
    trdDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_release" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="designDd" name="지정일자" dataType="text"></w2:column>
		<w2:column id="releasDd" name="매매거래정지해제일" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuKorNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="empNm" name="최종처리자" dataType="text"></w2:column>
		<w2:column id="disclsYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="fstDesignDd" name="최초지정일자" dataType="text"></w2:column>
		<w2:column id="etpInvstwarnDesignCd" name="ETP투자유의지정코드" dataType="text"></w2:column>
		<w2:column id="taskDd" name="거래일" dataType="text"></w2:column>
		<w2:column id="addYn" name="추가여부" dataType="text"></w2:column>
		<w2:column id="haltDesnrelsTpNm" name="거래정지지정및해제구분" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 9. [STF08200][ETN][마감처리] 매매거래정지, 매매거래정지 해제, 매매거래정지 및 해제 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-invst-warn/select-list-trd-halt`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_trdHalt=body"
}
// requestData 지정
const requestData = {
    trdDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_trdHalt" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="designDd" name="지정일자" dataType="text"></w2:column>
		<w2:column id="releasDd" name="매매거래정지해제일" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuKorNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="empNm" name="최종처리자" dataType="text"></w2:column>
		<w2:column id="disclsYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="fstDesignDd" name="최초지정일자" dataType="text"></w2:column>
		<w2:column id="etpInvstwarnDesignCd" name="ETP투자유의지정코드" dataType="text"></w2:column>
		<w2:column id="taskDd" name="거래일" dataType="text"></w2:column>
		<w2:column id="addYn" name="추가여부" dataType="text"></w2:column>
		<w2:column id="haltDesnrelsTpNm" name="거래정지지정및해제구분" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 10. [STF08200][ETN][마감처리] 마감처리 정보 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-newlisting/close-info`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dma_closeInfo=body"
}
// requestData 지정
const requestData = {
    taskDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_closeInfo" baseNode="map">
	<w2:keyInfo>
		<w2:key id="listTrnsmEndTm" name="상장종목전송시각" dataType="text"></w2:key>
		<w2:key id="redmptTrnsmEndTm" name="상환주기전송시각" dataType="text"></w2:key>
		<w2:key id="approvEmpNm" name="담당자명" dataType="text"></w2:key>
		<w2:key id="approvTeamleadrEmpNm" name="팀장명" dataType="text"></w2:key>
		<w2:key id="approvTm" name="담당자 확인시각" dataType="text"></w2:key>
		<w2:key id="bzClsTm" name="팀장 확인시각" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

---


## 11. [STF08200][ETN][마감처리] 상장일 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-newlisting/next-bz-day`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dma_nextBzDay=body"
}
// requestData 지정
const requestData = {
    taskDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_nextBzDay" baseNode="map">
	<w2:keyInfo>
		<w2:key id="listDd" name="상장일" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

---


## 12. [STF08200][ETN][마감처리] 신규상장 마감처리내역 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-newlisting/select-list-hist`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_newlistingHist=body"
}
// requestData 지정
const requestData = {
    taskDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_newlistingHist" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="taskDd" name="작업일자" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="listDd" name="상장일자" dataType="text"></w2:column>
		<w2:column id="isuSrtCd" name="종목단축코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="isuAbbrv" name="종목약명" dataType="text"></w2:column>
		<w2:column id="isuEngNm" name="종목영문명" dataType="text"></w2:column>
		<w2:column id="isuEngAbbrv" name="종목영문약명" dataType="text"></w2:column>
		<w2:column id="isuMktpartcNo" name="발행시장참가자번호" dataType="text"></w2:column>
		<w2:column id="listShrs" name="상장주식수" dataType="number"></w2:column>
		<w2:column id="lpHdQty" name="LP보유수량" dataType="number"></w2:column>
		<w2:column id="ordSpdUplmtVal" name="호가스프레드상한값" dataType="number"></w2:column>
		<w2:column id="isuPrc" name="발행가격" dataType="number"></w2:column>
		<w2:column id="expDd" name="만기일자" dataType="text"></w2:column>
		<w2:column id="lsttrdDd" name="최종거래일자" dataType="text"></w2:column>
		<w2:column id="lstSetlMethdCd" name="최종결제방법코드" dataType="text"></w2:column>
		<w2:column id="lstSetlMethdNm" name="최종결제방법" dataType="text"></w2:column>
		<w2:column id="expRedmptAmtPayDd" name="만기상환금지급일자" dataType="text"></w2:column>
		<w2:column id="expRedmptPrcDecsnStrtDd" name="만기상환가격결정시작일자" dataType="text"></w2:column>
		<w2:column id="expRedmptPrcDecsnEndDd" name="만기상환가격결정종료일자" dataType="text"></w2:column>
		<w2:column id="etpProdTpCd" name="ETP상품구분코드" dataType="text"></w2:column>
		<w2:column id="etpProdTpNm" name="ETP상품구분" dataType="text"></w2:column>
		<w2:column id="traceYdMult" name="추적수익률배수" dataType="number"></w2:column>
		<w2:column id="taxTpCd" name="과세유형코드" dataType="text"></w2:column>
		<w2:column id="taxTpNm" name="과세유형" dataType="text"></w2:column>
		<w2:column id="distrTpCd" name="분배금형태코드" dataType="text"></w2:column>
		<w2:column id="distrTpNm" name="분배금형태" dataType="text"></w2:column>
		<w2:column id="mktpartcNo1" name="시장참가자번호1" dataType="text"></w2:column>
		<w2:column id="mktpartcNo2" name="시장참가자번호2" dataType="text"></w2:column>
		<w2:column id="mktpartcNo3" name="시장참가자번호3" dataType="text"></w2:column>
		<w2:column id="mktpartcNo4" name="시장참가자번호4" dataType="text"></w2:column>
		<w2:column id="mktpartcNo5" name="시장참가자번호5" dataType="text"></w2:column>
		<w2:column id="mktpartcNo6" name="시장참가자번호6" dataType="text"></w2:column>
		<w2:column id="mktpartcNo7" name="시장참가자번호7" dataType="text"></w2:column>
		<w2:column id="mktpartcNo8" name="시장참가자번호8" dataType="text"></w2:column>
		<w2:column id="mktpartcNo9" name="시장참가자번호9" dataType="text"></w2:column>
		<w2:column id="mktpartcNo10" name="시장참가자번호10" dataType="text"></w2:column>
		<w2:column id="mktpartcNo11" name="시장참가자번호11" dataType="text"></w2:column>
		<w2:column id="mktpartcNo12" name="시장참가자번호12" dataType="text"></w2:column>
		<w2:column id="mktpartcNo13" name="시장참가자번호13" dataType="text"></w2:column>
		<w2:column id="mktpartcNo14" name="시장참가자번호14" dataType="text"></w2:column>
		<w2:column id="mktpartcNo15" name="시장참가자번호15" dataType="text"></w2:column>
		<w2:column id="multAcntclsMmddContn" name="다중결산월일내용" dataType="text"></w2:column>
		<w2:column id="etnEarngStructId" name="ETN수익구조ID" dataType="text"></w2:column>
		<w2:column id="etnEarngStructContn" name="ETN수익구조내용" dataType="text"></w2:column>
		<w2:column id="etnMaxRedmptPrc" name="ETN최대상환가격" dataType="number"></w2:column>
		<w2:column id="etnMinRedmptPrc" name="ETN최소상환가격" dataType="number"></w2:column>
		<w2:column id="etnEaryRedmptPosblYn" name="ETN조기상환가능여부" dataType="text"></w2:column>
		<w2:column id="etnEaryRedmptCycleCd" name="ETN조기상환주기코드" dataType="text"></w2:column>
		<w2:column id="etnEaryRedmptCycleNm" name="ETN조기상환주기" dataType="text"></w2:column>
		<w2:column id="valuPrcCalcInstCd1" name="평가가격산출기관코드1" dataType="text"></w2:column>
		<w2:column id="valuPrcCalcInstNm1" name="평가가격산출기관1" dataType="text"></w2:column>
		<w2:column id="valuPrcCalcInstCd2" name="평가가격산출기관코드2" dataType="text"></w2:column>
		<w2:column id="valuPrcCalcInstNm2" name="평가가격산출기관2" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 13. [STF08200][ETN][마감처리] 신규상장 상환주기 마감처리내역 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-newlisting/select-list-redemption-hist`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_redemptionHist=body"
}
// requestData 지정
const requestData = {
    taskDd: "",
	isuCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_redemptionHist" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="taskDd" name="name1" dataType="text"></w2:column>
		<w2:column id="isuCd" name="name2" dataType="text"></w2:column>
		<w2:column id="redmptSeq" name="name3" dataType="number"></w2:column>
		<w2:column id="earyRedmptValuDd" name="name4" dataType="text"></w2:column>
		<w2:column id="earyRedmptCondRelCd" name="name5" dataType="text"></w2:column>
		<w2:column id="earyRedmptCondRelNm" name="name6" dataType="text"></w2:column>
		<w2:column id="earyRedmptBas1Idx" name="name7" dataType="number"></w2:column>
		<w2:column id="earyRedmptBas2Idx" name="name8" dataType="number"></w2:column>
		<w2:column id="earyRedmptPrc" name="name9" dataType="number"></w2:column>
		<w2:column id="earyRedmptPayDd" name="name10" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 14. [STF08200][ETN][마감처리] 신규상장 상환주기 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-newlisting/select-list-redemption`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_redemption=body"
}
// requestData 지정
const requestData = {
    bzProcsNo: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_redemption" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="redmptSeq" name="상환차수" dataType="number"></w2:column>
		<w2:column id="earyRedmptValuDd" name="조기상환평가일자" dataType="text"></w2:column>
		<w2:column id="earyRedmptCondRelCd" name="조기상환조건관계코드" dataType="text"></w2:column>
		<w2:column id="earyRedmptCondRelNm" name="조기상환조건관계" dataType="text"></w2:column>
		<w2:column id="earyRedmptBas1Idx" name="조기상환기준1지수" dataType="number"></w2:column>
		<w2:column id="earyRedmptBas2Idx" name="조기상환기준2지수" dataType="number"></w2:column>
		<w2:column id="earyRedmptPrc" name="조기상환가격" dataType="number"></w2:column>
		<w2:column id="earyRedmptPayDd" name="조기상환지급일자" dataType="text"></w2:column>
		<w2:column id="earyRedmptCycleTpCd" name="조기상환주기구분코드" dataType="text"></w2:column>
		<w2:column id="earyRedmptCycleTpNm" name="조기상환주기구분" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 15. [STF08200][ETN][마감처리] 신규상장 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `get /api/listing/lstproc/etn/close-procs-newlisting/select-list`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_list=body"
}
// requestData 지정
const requestData = {
    taskDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_list" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="listBzTpCd" name="상장업무구분코드" dataType="text"></w2:column>
		<w2:column id="listProcsStatCd" name="상장처리상태코드" dataType="text"></w2:column>
		<w2:column id="comNm" name="회사명" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="listDd" name="상장일" dataType="text"></w2:column>
		<w2:column id="isuSrtCd" name="대표종목단축코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="isuAbbrv" name="종목약명" dataType="text"></w2:column>
		<w2:column id="isuEngNm" name="종목영문명" dataType="text"></w2:column>
		<w2:column id="isuEngAbbrv" name="종목영문약명" dataType="text"></w2:column>
		<w2:column id="repIsuCd" name="대표종목코드" dataType="text"></w2:column>
		<w2:column id="isuMktpartcNo" name="발행시장참가자번호" dataType="text"></w2:column>
		<w2:column id="listShrs" name="상장주식수" dataType="number"></w2:column>
		<w2:column id="lpHdQty" name="LP보유수량" dataType="number"></w2:column>
		<w2:column id="declSpd" name="신고스프레드" dataType="number"></w2:column>
		<w2:column id="etnIsuPrc" name="발행가액(원)" dataType="number"></w2:column>
		<w2:column id="expDd" name="만기일자" dataType="text"></w2:column>
		<w2:column id="lsttrdDd" name="최종거래일" dataType="text"></w2:column>
		<w2:column id="lstSetlMethdCd" name="결제방법코드" dataType="text"></w2:column>
		<w2:column id="lstSetlMethdNm" name="결제방법" dataType="text"></w2:column>
		<w2:column id="expRedmptAmtPayDd" name="만기상환금지급일자" dataType="text"></w2:column>
		<w2:column id="expRedmptPrcDecsnStrtDd" name="만기상환가격결정시작일자" dataType="text"></w2:column>
		<w2:column id="expRedmptPrcDecsnEndDd" name="만기상환가격결정종료일자" dataType="text"></w2:column>
		<w2:column id="etpProdTpCd" name="ETP상품구분코드" dataType="text"></w2:column>
		<w2:column id="etpProdTpNm" name="ETP상품구분코드" dataType="text"></w2:column>
		<w2:column id="traceYdMult" name="추적수익률배수" dataType="number"></w2:column>
		<w2:column id="taxTpCd" name="과세유형코드" dataType="text"></w2:column>
		<w2:column id="taxTpNm" name="과세유형" dataType="text"></w2:column>
		<w2:column id="distrTpCd" name="분배금형태코드" dataType="text"></w2:column>
		<w2:column id="distrTpNm" name="분배금구분" dataType="text"></w2:column>
		<w2:column id="mktpartcNo1" name="시장참가자번호1" dataType="text"></w2:column>
		<w2:column id="earngStructTpCd" name="수익구조유형코드" dataType="text"></w2:column>
		<w2:column id="expEarngStructDscVal" name="만기수익구조설명값" dataType="text"></w2:column>
		<w2:column id="expMaxRedmptPrc" name="만기최대상환가격" dataType="number"></w2:column>
		<w2:column id="expMinRedmptPrc" name="만기최소상환가격" dataType="number"></w2:column>
		<w2:column id="earyRedmptCondYn" name="조기상환조건여부" dataType="text"></w2:column>
		<w2:column id="earyRedmptCycleCd" name="조기상환주기코드" dataType="text"></w2:column>
		<w2:column id="earyRedmptCycleNm" name="조기상환주기" dataType="text"></w2:column>
		<w2:column id="valuPrc1CalcInstCd" name="평가가격1산출기관코드" dataType="text"></w2:column>
		<w2:column id="valuPrc1CalcInstNm" name="평가가격1산출기관" dataType="text"></w2:column>
		<w2:column id="valuPrc2CalcInstCd" name="평가가격2산출기관코드" dataType="text"></w2:column>
		<w2:column id="valuPrc2CalcInstNm" name="평가가격2산출기관" dataType="text"></w2:column>
		<w2:column id="idxNm" name="지수명" dataType="text"></w2:column>
		<w2:column id="etnIsuQty" name="ETN발행수량" dataType="number"></w2:column>
		<w2:column id="isuOrgnVal" name="ETN발행가액" dataType="number"></w2:column>
		<w2:column id="idxLvrgInvrsTpNm" name="name1" dataType="text"></w2:column>
		<w2:column id="fnlEmpNm" name="추적 배수" dataType="text"></w2:column>
		<w2:column id="listBzProcsDdtm" name="상장업무처리시각" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 16. [STF08200][ETN][마감처리] 투자유의 팀장 승인

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `post /api/listing/lstproc/etn/close-procs-invst-warn/apprvFinal`

**[REQUEST]**
```javascript
// requestData 지정
const requestData = {
    clsIsuFirstDetect: dlt_firstDetect.getAllJSON(),
	clsIsuNoti: dlt_noti.getAllJSON(),
	clsIsuExtn: dlt_extn.getAllJSON(),
	clsIsuDesign: dlt_design.getAllJSON(),
	clsIsuRelease: dlt_release.getAllJSON(),
	clsIsuTrdHalt: dlt_trdHalt.getAllJSON()
};
```

**[RESPONSE]**


---


## 17. [STF08200][ETN][마감처리] 투자유의 재마감처리

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `post /api/listing/lstproc/etn/close-procs-invst-warn/reclose`

**[REQUEST]**
```javascript
// requestData 지정
const requestData = {
    clsIsuFirstDetect: dlt_firstDetect.getAllJSON(),
	clsIsuNoti: dlt_noti.getAllJSON(),
	clsIsuExtn: dlt_extn.getAllJSON(),
	clsIsuDesign: dlt_design.getAllJSON(),
	clsIsuRelease: dlt_release.getAllJSON(),
	clsIsuTrdHalt: dlt_trdHalt.getAllJSON()
};
```

**[RESPONSE]**


---


## 18. [STF08200][ETN][마감처리] 투자유의 담당자 확인

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `post /api/listing/lstproc/etn/close-procs-invst-warn/revwFinal`

**[REQUEST]**
```javascript
// requestData 지정
const requestData = {
    completeYn: ""
};
```

**[RESPONSE]**


---


## 19. [STF08200][ETN][마감처리] 신규상장 팀장승인

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `post /api/listing/lstproc/etn/close-procs-newlisting/apprvFinal`

**[REQUEST]**
```javascript
// requestData 지정
const requestData = {
    listDd: ""
};
```

**[RESPONSE]**


---


## 20. [STF08200][ETN][마감처리] 신규상장 재마감처리

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `post /api/listing/lstproc/etn/close-procs-newlisting/reClose`

**[REQUEST]**
```javascript
// requestData 지정
const requestData = {
    completeYn: ""
};
```

**[RESPONSE]**


---


## 21. [STF08200][ETN][마감처리] 신규상장 담당자 확인

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `post /api/listing/lstproc/etn/close-procs-newlisting/revwFinal`

**[REQUEST]**
```javascript
// requestData 지정
const requestData = {
    completeYn: ""
};
```

**[RESPONSE]**


---