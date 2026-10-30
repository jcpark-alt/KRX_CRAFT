## 1. [ULDSTF05930][ELW][ELW 마감처리] 재마감처리

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `당일 마감기록(송신데이터·마감로그)을 모두 삭제한다. 삭제 후 담당자승인을 다시 수행해야 한다. 마감일이 당일이어야 하고 담당자승인과 동일한 목록검증(발행회사명·LP보유량)을 통과해야 한다. 담당자·팀장승인 완료 여부는 검증하지 않으며 승인기록도 함께 삭제된다. AS-IS 는 시스템관리자(ZSYS)에게만 노출되는 복구 기능이다. AS-IS fn_re_trsend `
*   **TO-BE** : `POST /api/listing/lstproc/elw/cls-procs/remove-cls-procs`

**[REQUEST]**

```xml
<w2:dataMap id="dma_removeClsProcs" baseNode="map">
	<w2:keyInfo>
		<w2:key id="taskDd" name="마감일(YYYYMMDD)" dataType="text"></w2:key>
		<w2:key id="listDd" name="상장일(YYYYMMDD) - 담당자승인(마감) 시 필수. 팀장승인·재마감처리에는 사용하지 않는다" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

```javascript
// submission ref, target 지정
{
	ref: "dma_removeClsProcs",
	target: "dma_removeClsProcsResult=body"
}
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_removeClsProcsResult" baseNode="map">
	<w2:keyInfo>
		<w2:key id="result" name="처리결과(S:성공, F:실패)" dataType="text"></w2:key>
		<w2:key id="resultMessage" name="처리결과 메시지" dataType="text"></w2:key>
		<w2:key id="newListingCount" name="신규상장 마감처리 건수" dataType="number"></w2:key>
		<w2:key id="addListingCount" name="추가상장 마감처리 건수" dataType="number"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

---

## 2. [ULDSTF05930][ELW][ELW 마감처리] 팀장승인

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `담당자승인 완료 후 팀장 확인정보를 기록한다. AS-IS fn_rcvTeamleadr`
*   **TO-BE** : `POST /api/listing/lstproc/elw/cls-procs/register-teamleadr-approv`

**[REQUEST]**

```xml
<w2:dataMap id="dma_registerTeamleadrApprov" baseNode="map">
	<w2:keyInfo>
		<w2:key id="taskDd" name="마감일(YYYYMMDD)" dataType="text"></w2:key>
		<w2:key id="listDd" name="상장일(YYYYMMDD) - 담당자승인(마감) 시 필수. 팀장승인·재마감처리에는 사용하지 않는다" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

```javascript
// submission ref, target 지정
{
	ref: "dma_registerTeamleadrApprov",
	target: "dma_registerTeamleadrApprovResult=body"
}
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_registerTeamleadrApprovResult" baseNode="map">
	<w2:keyInfo>
		<w2:key id="result" name="처리결과(S:성공, F:실패)" dataType="text"></w2:key>
		<w2:key id="resultMessage" name="처리결과 메시지" dataType="text"></w2:key>
		<w2:key id="newListingCount" name="신규상장 마감처리 건수" dataType="number"></w2:key>
		<w2:key id="addListingCount" name="추가상장 마감처리 건수" dataType="number"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

---

## 3. [ULDSTF05930][ELW][ELW 마감처리] 담당자승인

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `마감처리와 담당자 확인을 한 트랜잭션으로 수행한다. 마감로그 2행(신규/추가)과 신규·추가 송신데이터를 저장한 뒤 담당자 승인정보를 기록한다. 마감일이 당일이어야 하며, 발행회사명 누락·LP보유량 0·삭제종목이 있으면 처리되지 않는다. AS-IS fn_trsend + fn_rcvApprove`
*   **TO-BE** : `POST /api/listing/lstproc/elw/cls-procs/register-approv`

**[REQUEST]**

```xml
<w2:dataMap id="dma_registerApprov" baseNode="map">
	<w2:keyInfo>
		<w2:key id="taskDd" name="마감일(YYYYMMDD)" dataType="text"></w2:key>
		<w2:key id="listDd" name="상장일(YYYYMMDD) - 담당자승인(마감) 시 필수. 팀장승인·재마감처리에는 사용하지 않는다" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

```javascript
// submission ref, target 지정
{
	ref: "dma_registerApprov",
	target: "dma_registerApprovResult=body"
}
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_registerApprovResult" baseNode="map">
	<w2:keyInfo>
		<w2:key id="result" name="처리결과(S:성공, F:실패)" dataType="text"></w2:key>
		<w2:key id="resultMessage" name="처리결과 메시지" dataType="text"></w2:key>
		<w2:key id="newListingCount" name="신규상장 마감처리 건수" dataType="number"></w2:key>
		<w2:key id="addListingCount" name="추가상장 마감처리 건수" dataType="number"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

---

## 4. [ULDSTF05930][ELW][ELW 마감처리] 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `마감일 기준으로 상장일(다음 영업일)·마감정보와 함께 신규/추가 목록을 조회한다. 마감일이 현재일자이고 마감전이면 [ELW마감처리] 목록(clsViewTpCd=N)을, 마감후이거나 마감일이 현재일자가 아니면 [ELW마감처리내역] 목록(clsViewTpCd=S)을 내려준다. 두 경우 모두 newListingList·addListingList 로 반환하며, 내역 조회 시에만 taskDd·sndrcvTpCd·sndrcvDataCorrYn 이 채워진다. AS-IS fn_list_sync`
*   **TO-BE** : `GET /api/listing/lstproc/elw/cls-procs/select-list`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dma_list=body, dma_listClsProcsInfo=body.clsProcsInfo, dlt_listNewListingList=body.newListingList, dlt_listAddListingList=body.addListingList"
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
		<w2:key id="clsViewTpCd" name="조회구분(N:ELW마감처리, S:ELW마감처리내역)" dataType="text"></w2:key>
		<w2:key id="listDd" name="상장일(YYYYMMDD) - 마감일의 다음 영업일" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataMap id="dma_listClsProcsInfo" baseNode="map">
	<w2:keyInfo>
		<w2:key id="taskDd" name="작업일자(마감일, YYYYMMDD)" dataType="text"></w2:key>
		<w2:key id="bzClsTm" name="마감처리시각(HH24:MI:SS)" dataType="text"></w2:key>
		<w2:key id="trnsmStrtTm" name="파일전송시작시각(HH24:MI:SS) - EXTURE 전송 배치가 기록하며 현재 개발범위 제외" dataType="text"></w2:key>
		<w2:key id="trnsmEndTm" name="파일전송시각(HH24:MI:SS) - EXTURE 전송 배치가 기록하며 현재 개발범위 제외" dataType="text"></w2:key>
		<w2:key id="rcvTm" name="파일수신시각(HH24:MI:SS) - EXTURE 수신 배치가 기록하며 현재 개발범위 제외" dataType="text"></w2:key>
		<w2:key id="approvTm" name="담당자 확인시각(HH24:MI:SS)" dataType="text"></w2:key>
		<w2:key id="chrgEmpNo" name="마감자 사원번호" dataType="text"></w2:key>
		<w2:key id="chrgEmpNm" name="마감자명" dataType="text"></w2:key>
		<w2:key id="approvEmpNo" name="담당자 사원번호" dataType="text"></w2:key>
		<w2:key id="approvEmpNm" name="담당자명" dataType="text"></w2:key>
		<w2:key id="elwListSndInfoTpCd" name="ELW상장송신정보구분코드(1:신규상장, 2:추가상장)" dataType="text"></w2:key>
		<w2:key id="approvTeamleadrEmpNm" name="팀장명" dataType="text"></w2:key>
		<w2:key id="teamleadrApprovTm" name="팀장 확인시각(HH24:MI:SS)" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataList id="dlt_listNewListingList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="신청일련번호(업무처리번호)" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="elwIsuMktpartcNm" name="발행회사명 - 마감 전 검증 대상(비어있으면 마감 불가)" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuSrtCd" name="종목단축코드" dataType="text"></w2:column>
		<w2:column id="isuKorNm" name="한글종목명" dataType="text"></w2:column>
		<w2:column id="isuKorAbbrv" name="한글종목약명 - 4개 분할컬럼을 연결한 값" dataType="text"></w2:column>
		<w2:column id="isuEngAbbrv" name="영문종목약명 - 4개 분할컬럼을 연결한 값" dataType="text"></w2:column>
		<w2:column id="isuEngNm" name="영문종목명" dataType="text"></w2:column>
		<w2:column id="listDd" name="상장일(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="isuShrs" name="LP보유량(발행수량) - 마감 전 검증 대상(0 이하면 마감 불가)" dataType="text"></w2:column>
		<w2:column id="isuPrc" name="발행가" dataType="text"></w2:column>
		<w2:column id="elwUlyBasPrc" name="기준가격/지수" dataType="text"></w2:column>
		<w2:column id="elwExerPrc" name="행사가격/지수" dataType="text"></w2:column>
		<w2:column id="elwKoOccrBasPrc" name="조기종료발생기준가격/지수" dataType="text"></w2:column>
		<w2:column id="elwLsttrdDd" name="최종거래일(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="elwConvRto" name="전환비율(%)" dataType="text"></w2:column>
		<w2:column id="ordSpdRto" name="호가스프레드" dataType="text"></w2:column>
		<w2:column id="elwCompnsRt" name="최소지급비율" dataType="text"></w2:column>
		<w2:column id="elwPayDd" name="지급일(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="elwPayAgntNm" name="지급대리인" dataType="text"></w2:column>
		<w2:column id="elwFinalPayVal" name="확정지급액" dataType="text"></w2:column>
		<w2:column id="exerStrtDd" name="행사개시일(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="exerEndDd" name="행사종료일(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="elwExerContn" name="만기시 권리내용" dataType="text"></w2:column>
		<w2:column id="elwKoExerContn" name="조기종료시 권리내용" dataType="text"></w2:column>
		<w2:column id="elwExpValuPrcMethd" name="만기평가가격/지수" dataType="text"></w2:column>
		<w2:column id="elwKoValuMethd" name="조기종료평가가격/지수" dataType="text"></w2:column>
		<w2:column id="lpEndDd" name="LP 공급종료일(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="elwIdxNm1" name="신지수명" dataType="text"></w2:column>
		<w2:column id="ulyNm" name="기초자산명(복수는 콤마 구분)" dataType="text"></w2:column>
		<w2:column id="ulyRto" name="기초자산구성비율(복수는 콤마 구분)" dataType="text"></w2:column>
		<w2:column id="ulyCompstRto1" name="기초자산구성비율1" dataType="text"></w2:column>
		<w2:column id="lpMbrNm" name="LP회원명(복수는 콤마 구분)" dataType="text"></w2:column>
		<w2:column id="lpHdQty" name="LP보유수량 - 마감처리내역 조회 시에만 반환" dataType="text"></w2:column>
		<w2:column id="elwEoTpNm" name="조기종료구분명" dataType="text"></w2:column>
		<w2:column id="elwRghtTpNm" name="권리유형명" dataType="text"></w2:column>
		<w2:column id="elwExerTpNm" name="행사유형명" dataType="text"></w2:column>
		<w2:column id="elwLstSetlMethdNm" name="최종결제방법명" dataType="text"></w2:column>
		<w2:column id="elwPrcUpPartcRt" name="가격상승참가율" dataType="text"></w2:column>
		<w2:column id="elwIdxBelngMktTpNm1" name="지수소속시장구분명" dataType="text"></w2:column>
		<w2:column id="idxIndNm1" name="지수명" dataType="text"></w2:column>
		<w2:column id="expDd" name="만기일(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="subsDd" name="청약일(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="isuTotamt" name="발행총액(발행가격×발행수량)" dataType="text"></w2:column>
		<w2:column id="uinscribeYn" name="무기명식여부" dataType="text"></w2:column>
		<w2:column id="fncUlyTpCd" name="금융기초자산유형코드" dataType="text"></w2:column>
		<w2:column id="fncUlyTpNm" name="금융기초자산유형명" dataType="text"></w2:column>
		<w2:column id="fornInvstLmtObjIsuYn" name="외국인투자한도대상종목여부" dataType="text"></w2:column>
		<w2:column id="elwRghtTpKindCd" name="ELW권리유형종류코드" dataType="text"></w2:column>
		<w2:column id="elwRghtTpCd" name="ELW권리유형코드" dataType="text"></w2:column>
		<w2:column id="halfwyRedmptYn" name="중도상환여부" dataType="text"></w2:column>
		<w2:column id="billLstSaveStatCd" name="청구서상장저장상태코드" dataType="text"></w2:column>
		<w2:column id="elwObjIdxTpCd" name="ELW대상지수유형코드" dataType="text"></w2:column>
		<w2:column id="elwObjIdxTpNm" name="ELW대상지수유형명" dataType="text"></w2:column>
		<w2:column id="isuDd" name="발행일(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="payDd" name="납입일(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="stdYn" name="표준여부" dataType="text"></w2:column>
		<w2:column id="trdMktNm" name="거래시장명" dataType="text"></w2:column>
		<w2:column id="idxCalcInstNm" name="지수산출기관명" dataType="text"></w2:column>
		<w2:column id="elwExerTpCd" name="ELW권리행사유형코드" dataType="text"></w2:column>
		<w2:column id="autoExerTpCd" name="자동행사유형코드" dataType="text"></w2:column>
		<w2:column id="autoExerTpNm" name="자동행사유형명" dataType="text"></w2:column>
		<w2:column id="elwLstSetlMethdCd" name="ELW최종결제방법코드" dataType="text"></w2:column>
		<w2:column id="delisttmPayCondContn" name="상장폐지시지급조건내용" dataType="text"></w2:column>
		<w2:column id="taskDd" name="마감일(YYYYMMDD) - 마감처리내역 조회 시에만 반환" dataType="text"></w2:column>
		<w2:column id="sndrcvTpCd" name="송수신구분코드(S:송신) - 마감처리내역 조회 시에만 반환" dataType="text"></w2:column>
		<w2:column id="sndrcvDataCorrYn" name="송수신데이터일치여부 - 마감처리내역 조회 시에만 반환" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
<w2:dataList id="dlt_listAddListingList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="신청일련번호(업무처리번호)" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuKorAbbrv" name="한글종목약명" dataType="text"></w2:column>
		<w2:column id="isuKorNm" name="한글종목명" dataType="text"></w2:column>
		<w2:column id="listDd" name="상장일(매매거래시행일자, YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="addIsuShrs" name="추가발행수량" dataType="text"></w2:column>
		<w2:column id="taskDd" name="마감일(YYYYMMDD) - 마감처리내역 조회 시에만 반환" dataType="text"></w2:column>
		<w2:column id="sndrcvTpCd" name="송수신구분코드(S:송신) - 마감처리내역 조회 시에만 반환" dataType="text"></w2:column>
		<w2:column id="sndrcvDataCorrYn" name="송수신데이터일치여부 - 마감처리내역 조회 시에만 반환" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---

## 5. [ULDSTF05930][ELW][ELW 마감처리] 미처리종목 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `담당자승인 전 미처리(신청완료·접수) 상태 종목을 조회한다. 결과가 있어도 승인은 가능하며 화면에서 진행 여부를 확인받는 용도이다. AS-IS fn_UnRcvIsuCheck`
*   **TO-BE** : `GET /api/listing/lstproc/elw/cls-procs/select-list-unprocessed-isu`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_listUnprocessedIsu=body"
}

// requestData 지정
const requestData = {
    taskDd: "",
    listDd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_listUnprocessedIsu" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="isuKorAbbrv" name="한글종목약명" dataType="text"></w2:column>
		<w2:column id="listProcsStatNm" name="상장처리상태명(사유)" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---
