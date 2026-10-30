## 1. [ULDSTF70016][신종증권][신규상장 마감처리][마감처리내역]탭 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_list_sync`
*   **TO-BE** : `get /api/listing/lstproc/digital/cls-procs/select-list-log`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dma_log=body, dma_finalLog=body.finalLog, dlt_sndList=body.sndList"
}
// requestData 지정
const requestData = {
    taskDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_log" baseNode="map">
	<w2:keyInfo>
		<w2:key id="listDd" name="상장일(YYYYMMDD) - 마감일의 다음 영업일" dataType="text"></w2:key>
		<w2:key id="finalLog" name="마감이력(마감시각·담당자·팀장). 마감 전이면 null" dataType="json"></w2:key>
		<w2:key id="sndList" name="[마감처리내역 TAB] 송신데이터 목록. tabDiv=2 일 때만 조회" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>


<w2:dataMap id="dma_finalLog" baseNode="map">
	<w2:keyInfo>
		<w2:key id="listTrnsmEndTm" name="상장전송종료시각(HH24:MI:SS)" dataType="text"></w2:key>
		<w2:key id="approvEmpNm" name="담당자확인자명" dataType="text"></w2:key>
		<w2:key id="approvTeamleadrEmpNm" name="팀장승인자명" dataType="text"></w2:key>
		<w2:key id="approvTm" name="담당자확인시각(HH24:MI:SS)" dataType="text"></w2:key>
		<w2:key id="bzClsTm" name="마감시각(HH24:MI:SS)" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

<w2:dataList id="dlt_sndList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="taskDd" name="작업일자(마감일, YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="secugrpId" name="증권그룹ID" dataType="text"></w2:column>
		<w2:column id="secugrp" name="증권그룹명" dataType="text"></w2:column>
		<w2:column id="listDd" name="상장일자(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuSrtCd" name="종목단축코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="isuAbbrv" name="종목약명" dataType="text"></w2:column>
		<w2:column id="isuEngNm" name="종목영문명" dataType="text"></w2:column>
		<w2:column id="isuEngAbbrv" name="종목영문약명" dataType="text"></w2:column>
		<w2:column id="listQty" name="상장수량" dataType="text"></w2:column>
		<w2:column id="pubofrAmt" name="공모금액" dataType="text"></w2:column>
		<w2:column id="listApplntIsurCd" name="상장신청인발행기관코드" dataType="text"></w2:column>
		<w2:column id="listApplntIsurNm" name="상장신청인발행기관명" dataType="text"></w2:column>
		<w2:column id="listApplntIsuCd" name="상장신청인종목코드" dataType="text"></w2:column>
		<w2:column id="trstInstIsurCd" name="신탁기관발행기관코드" dataType="text"></w2:column>
		<w2:column id="trstInstIsurNm" name="신탁기관발행기관명" dataType="text"></w2:column>
		<w2:column id="basExpYn" name="기준만기여부" dataType="text"></w2:column>
		<w2:column id="expDd" name="만기일자(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="taxTpCd" name="과세유형코드" dataType="text"></w2:column>
		<w2:column id="taxTpNm" name="과세유형명" dataType="text"></w2:column>
		<w2:column id="lsttrdDd" name="최종거래일자(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="lpMbrNo1" name="LP회원번호1" dataType="text"></w2:column>
		<w2:column id="lpMbrNm1" name="LP회원명1" dataType="text"></w2:column>
		<w2:column id="lpMbrNo2" name="LP회원번호2" dataType="text"></w2:column>
		<w2:column id="lpMbrNm2" name="LP회원명2" dataType="text"></w2:column>
		<w2:column id="lpMbrNo3" name="LP회원번호3" dataType="text"></w2:column>
		<w2:column id="lpMbrNm3" name="LP회원명3" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd" name="분배금지급기준일자1(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd2" name="분배금지급기준일자2(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd3" name="분배금지급기준일자3(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd4" name="분배금지급기준일자4(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd5" name="분배금지급기준일자5(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd6" name="분배금지급기준일자6(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd7" name="분배금지급기준일자7(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd8" name="분배금지급기준일자8(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd9" name="분배금지급기준일자9(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd10" name="분배금지급기준일자10(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd11" name="분배금지급기준일자11(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd12" name="분배금지급기준일자12(YYYYMMDD)" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 2. [ULDSTF70016][신종증권][신규상장 마감처리] [마감처리]탭 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_list_sync`
*   **TO-BE** : `get /api/listing/lstproc/digital/cls-procs/select-list`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dma_list=body, dma_finalLog=body.finalLog, dlt_targetList=body.targetList"
}
// requestData 지정
const requestData = {
    taskDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_list" baseNode="map">
	<w2:keyInfo>
		<w2:key id="listDd" name="상장일(YYYYMMDD) - 마감일의 다음 영업일" dataType="text"></w2:key>
		<w2:key id="finalLog" name="마감이력(마감시각·담당자·팀장). 마감 전이면 null" dataType="json"></w2:key>
		<w2:key id="targetList" name="[마감처리 TAB] 마감대상 목록. tabDiv=1 일 때만 조회" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>


<w2:dataMap id="dma_finalLog" baseNode="map">
	<w2:keyInfo>
		<w2:key id="listTrnsmEndTm" name="상장전송종료시각(HH24:MI:SS)" dataType="text"></w2:key>
		<w2:key id="approvEmpNm" name="담당자확인자명" dataType="text"></w2:key>
		<w2:key id="approvTeamleadrEmpNm" name="팀장승인자명" dataType="text"></w2:key>
		<w2:key id="approvTm" name="담당자확인시각(HH24:MI:SS)" dataType="text"></w2:key>
		<w2:key id="bzClsTm" name="마감시각(HH24:MI:SS)" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

<w2:dataList id="dlt_targetList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명" dataType="text"></w2:column>
		<w2:column id="isuAbbrv" name="종목약명" dataType="text"></w2:column>
		<w2:column id="isuEngNm" name="종목영문명" dataType="text"></w2:column>
		<w2:column id="isuEngAbbrv" name="종목영문약명" dataType="text"></w2:column>
		<w2:column id="isuSrtCd" name="종목단축코드" dataType="text"></w2:column>
		<w2:column id="pubofrYn" name="공모여부" dataType="text"></w2:column>
		<w2:column id="pubofrDd" name="공모일자(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="listQty" name="상장수량" dataType="text"></w2:column>
		<w2:column id="pubofrAmt" name="공모금액" dataType="text"></w2:column>
		<w2:column id="secugrpId" name="증권그룹ID" dataType="text"></w2:column>
		<w2:column id="secugrp" name="증권그룹명" dataType="text"></w2:column>
		<w2:column id="listApplntIsurCd" name="상장신청인발행기관코드" dataType="text"></w2:column>
		<w2:column id="listApplntIsurNm" name="상장신청인발행기관명" dataType="text"></w2:column>
		<w2:column id="listApplntIsuCd" name="상장신청인종목코드" dataType="text"></w2:column>
		<w2:column id="trstInstIsurCd" name="신탁기관발행기관코드" dataType="text"></w2:column>
		<w2:column id="trstInstIsurNm" name="신탁기관발행기관명" dataType="text"></w2:column>
		<w2:column id="lpMbrNo" name="LP회원번호1" dataType="text"></w2:column>
		<w2:column id="lpMbrNm" name="LP회원명1" dataType="text"></w2:column>
		<w2:column id="lpMbrNo2" name="LP회원번호2" dataType="text"></w2:column>
		<w2:column id="lpMbrNm2" name="LP회원명2" dataType="text"></w2:column>
		<w2:column id="lpMbrNo3" name="LP회원번호3" dataType="text"></w2:column>
		<w2:column id="lpMbrNm3" name="LP회원명3" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd" name="분배금지급기준일자1(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd2" name="분배금지급기준일자2(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd3" name="분배금지급기준일자3(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd4" name="분배금지급기준일자4(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd5" name="분배금지급기준일자5(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd6" name="분배금지급기준일자6(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd7" name="분배금지급기준일자7(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd8" name="분배금지급기준일자8(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd9" name="분배금지급기준일자9(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd10" name="분배금지급기준일자10(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd11" name="분배금지급기준일자11(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="distrPayBasDd12" name="분배금지급기준일자12(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="basExpYn" name="기준만기여부" dataType="text"></w2:column>
		<w2:column id="expDd" name="만기일자(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="taxTpCd" name="과세유형코드" dataType="text"></w2:column>
		<w2:column id="taxTpNm" name="과세유형명" dataType="text"></w2:column>
		<w2:column id="lsttrdDd" name="최종거래일자(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="listDd" name="상장일자(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="listProcsSeq" name="상장처리일련번호" dataType="number"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---


## 3. [ULDSTF70016][신종증권][신규상장 마감처리] 팀장승인

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_cls / DigitalClsProcsSave`
*   **TO-BE** : `post /api/listing/lstproc/digital/cls-procs/save-approv`

**[REQUEST]**
```javascript
// requestData 지정
const requestData = {
    taskDd: "",
	listDd: ""
};
```

---


## 4. [ULDSTF70016][신종증권][신규상장 마감처리] 담당자확인

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_revw / DigitalRevwProcsSave`
*   **TO-BE** : `post /api/listing/lstproc/digital/cls-procs/save-revw`

**[REQUEST]**
```javascript
// requestData 지정
const requestData = {
    taskDd: "",
	listDd: ""
};
```

---


## 5. [ULDSTF70016][신종증권][신규상장 마감처리] 재마감처리

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `fn_recls / DigitalReClsProcsSave`
*   **TO-BE** : `post /api/listing/lstproc/digital/cls-procs/remove`

**[REQUEST]**
```javascript
// requestData 지정
const requestData = {
    taskDd: "",
	listDd: ""
};
```

---