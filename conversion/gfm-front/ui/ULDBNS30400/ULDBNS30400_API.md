
# [마감관리] 채권처리현황 API 명세 및 변환 정보


## 1. [ULDBNS30400][마감관리][채권처리현황] 전체탭 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_Search1`
*   **TO-BE** : `GET /api/bonds/clsAdm/procsStat/totList-select`

**[REQUEST]**
```javascript
{
	ref: dma_search,
	target: dlt_searchTotList
}

const requestData = {
    isurNm: 발행기관명,
    isuNm: 종목명,
    empNm: 처리자,
    mktRsnCd: 시장조치코드,
	state: 처리구분,
	strtDd: 시작일,
	endDd: 종료일,
	sriBndTpCd: SRI채권구분코드,
	ddTp: 기준구분
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

## 2. [ULDBNS30400][마감관리][채권처리현황] 개별종목탭 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_Search2`
* **TO-BE** : `GET /api/bonds/clsAdm/procsStat/indvdlIsuList-select`

**[REQUEST]**

```javascript
{
	ref: dma_search,
	target: dlt_searchIndvdlIsuList
}

const requestData = {
    isurNm: 발행기관명,
    isuNm: 종목명,
	empNm: 처리자,
	mktRsnCd: 시장조치코드,
	state: 처리구분,
	strtDd: 시작일,
	endDd: 종료일,
	sriBndTpCd: SRI채권구분코드,
	ddTp: 기준구분
};

```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_searchIndvdlIsuList" baseNode="list" saveRemovedData="true" repeatNode="map">
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

* **submission target**: `"dlt_searchIndvdlisuList=body"`

---

## 3. [ULDBNS30400][마감관리][채권처리현황] 일괄상장종목탭 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_Search3`
* **TO-BE** : `GET /api/bonds/clsAdm/procsStat/packListIsuList-select`

**[REQUEST]**

```javascript
{
	ref: dma_search,
	target: dlt_searchPackListIsuList
}

const requestData = {
    isurNm: 발행기관명,
	isuNm: 종목명,
	empNm: 처리자,
	mktRsnCd: 시장조치코드,
	state: 처리구분,
	strtDd: 시작일,
	endDd: 종료일,
	sriBndTpCd: SRI채권구분코드,
	ddTp: 기준구분
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

## 4. [ULDBNS30400][마감관리][채권처리현황] 직전영업일조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_getDate`
* **TO-BE** : `GET /api/bonds/clsAdm/procsStat/prevBzDd-select`

**[REQUEST]**

```javascript
{
	target: dma_searchPrevBzDd
}

```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_searchPrevBzDd" baseNode="map">
	<w2:keyInfo>
		<w2:key id="calndDd" name="달력일자" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>


```

* **submission target**: `"dma_searchPrevBzDd=body"`

---
