## 1. [ULDSTF24802][예탁원 의무보유 청구내역 조회] 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : ``
*   **TO-BE** : `GET /api/listing/lstsrch/ksd-duty-hd/select-list`

**[REQUEST]**


```javascript
// submission ref, target 지정
{
	target: "dlt_list=body"
}

// requestData 지정
const requestData = {
    dutyHdStrtDd: "",
    isuCd: ""
};

```






**[RESPONSE]**

```xml
<w2:dataList id="dlt_list" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="seqNo" name="구분(순번, 의미 없음)" dataType="number"></w2:column>
		<w2:column id="rcvDd" name="수신일자(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="rcvSeq" name="수신일련번호" dataType="number"></w2:column>
		<w2:column id="lstStatYn" name="최종상태여부" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuKorNm" name="종목한글명" dataType="text"></w2:column>
		<w2:column id="ksdDutyHdCallTpCd" name="예탁원의무보유호출구분코드(02:확정상장전일, 03:확정상장당일)" dataType="text"></w2:column>
		<w2:column id="ksdDutyHdCallTpNm" name="예탁원의무보유호출구분명" dataType="text"></w2:column>
		<w2:column id="ksdDutyHdRsnCd" name="예탁원의무보유사유코드" dataType="text"></w2:column>
		<w2:column id="ksdDutyHdRsnNm" name="예탁원의무보유사유명" dataType="text"></w2:column>
		<w2:column id="dutyHdStrtPrevdd" name="의무보유시작전일자(청구일, YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="dutyHdStrtDd" name="의무보유시작일자(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="ksdRcvDutyHdCnt" name="예탁원수신의무보유수(의무보유수량)" dataType="number"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```



---










