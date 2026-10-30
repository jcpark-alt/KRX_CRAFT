## 0. 이 문서에는 다음 화면의 API를 담고 있다.
 - ULDSTF08036,ULDSTF08035

## 1. [ULDSTF08036][ETN][관리종목지정우려예고] 삭제

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `"/etn/EtnMktAct.do?SCREN_ID="+vScrenID+"&SCREN_PROCES_TP_CD="+vScrenProcsTpCD+"&method=saveEtnAdministrativeIssueNoti"`
*   **TO-BE** : `POST /api/listing/lstproc/etn/adm-isu-noti/remove`

**[REQUEST]**

```xml
<w2:dataMap id="dma_remove" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드 (상장업무처리로그 기록용, AS-IS dts_Mst.ISUR_CD)" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

```javascript
// submission ref, target 지정
{
	ref: "dma_remove",
	target: "dma_removeResult=body"
}
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_removeResult" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="result" name="처리결과 (S:성공, F:실패)" dataType="text"></w2:key>
		<w2:key id="resultMessage" name="처리결과 메시지" dataType="text"></w2:key>
		<w2:key id="completeYn" name="처리완료 여부" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

---

## 2. [ULDSTF08036][ETN][관리종목지정우려예고] 등록

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `"/etn/EtnMktAct.do?SCREN_ID="+vScrenID+"&SCREN_PROCES_TP_CD="+vScrenProcsTpCD+"&method=saveEtnAdministrativeIssueNoti"`
*   **TO-BE** : `POST /api/listing/lstproc/etn/adm-isu-noti/register`

**[REQUEST]**

```xml
<w2:dataMap id="dma_register" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호 (프론트 채번값)" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드 (상장업무처리로그 기록용, AS-IS dts_Mst.ISUR_CD)" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="admisunotiDd" name="관리종목지정예고일자" dataType="text"></w2:key>
		<w2:key id="admisuDesignSchdlDd" name="관리종목지정예정일자 (예정일자 또는 주석 중 하나 필수 - AS-IS 화면 검증)" dataType="text"></w2:key>
		<w2:key id="admisuDesignSchdlContn" name="관리종목지정예정내용(주석)" dataType="text"></w2:key>
		<w2:key id="remk" name="기타" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataList id="dlt_registerRsnList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="admisuDesignRsnCd" name="관리종목지정사유코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnNm" name="관리종목지정사유명 (PUBL_ADMISU_DESIGN_RSN_NM 으로 저장)" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

```javascript
// submission ref, target 지정
{
	target: "dma_registerResult=body"
}

const requestData = {
    bzProcsNo : dma_register.get("bzProcsNo"), // 업무처리번호 (프론트 채번값)
    isurCd : dma_register.get("isurCd"), // 발행기관코드 (상장업무처리로그 기록용, AS-IS dts_Mst.ISUR_CD)
    isuCd : dma_register.get("isuCd"), // 종목코드
    admisunotiDd : dma_register.get("admisunotiDd"), // 관리종목지정예고일자
    admisuDesignSchdlDd : dma_register.get("admisuDesignSchdlDd"), // 관리종목지정예정일자 (예정일자 또는 주석 중 하나 필수 - AS-IS 화면 검증)
    admisuDesignSchdlContn : dma_register.get("admisuDesignSchdlContn"), // 관리종목지정예정내용(주석)
    remk : dma_register.get("remk"), // 기타
    rsnList : dlt_registerRsnList.getAllJSON(), // 지정사유 목록 (AS-IS dts_Rsn) Min Items: 1
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_registerResult" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="result" name="처리결과 (S:성공, F:실패)" dataType="text"></w2:key>
		<w2:key id="resultMessage" name="처리결과 메시지" dataType="text"></w2:key>
		<w2:key id="completeYn" name="처리완료 여부" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

---

## 3. [ULDSTF08036][ETN][관리종목지정우려예고] 수정

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `"/etn/EtnMktAct.do?SCREN_ID="+vScrenID+"&SCREN_PROCES_TP_CD="+vScrenProcsTpCD+"&method=saveEtnAdministrativeIssueNoti"`
*   **TO-BE** : `POST /api/listing/lstproc/etn/adm-isu-noti/modify`

**[REQUEST]**

```xml
<w2:dataMap id="dma_modify" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호 (프론트 채번값)" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드 (상장업무처리로그 기록용, AS-IS dts_Mst.ISUR_CD)" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="admisunotiDd" name="관리종목지정예고일자" dataType="text"></w2:key>
		<w2:key id="admisuDesignSchdlDd" name="관리종목지정예정일자 (예정일자 또는 주석 중 하나 필수 - AS-IS 화면 검증)" dataType="text"></w2:key>
		<w2:key id="admisuDesignSchdlContn" name="관리종목지정예정내용(주석)" dataType="text"></w2:key>
		<w2:key id="remk" name="기타" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataList id="dlt_modifyRsnList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="admisuDesignRsnCd" name="관리종목지정사유코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnNm" name="관리종목지정사유명 (PUBL_ADMISU_DESIGN_RSN_NM 으로 저장)" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

```javascript
// submission ref, target 지정
{
	target: "dma_modifyResult=body"
}

const requestData = {
    bzProcsNo : dma_modify.get("bzProcsNo"), // 업무처리번호 (프론트 채번값)
    isurCd : dma_modify.get("isurCd"), // 발행기관코드 (상장업무처리로그 기록용, AS-IS dts_Mst.ISUR_CD)
    isuCd : dma_modify.get("isuCd"), // 종목코드
    admisunotiDd : dma_modify.get("admisunotiDd"), // 관리종목지정예고일자
    admisuDesignSchdlDd : dma_modify.get("admisuDesignSchdlDd"), // 관리종목지정예정일자 (예정일자 또는 주석 중 하나 필수 - AS-IS 화면 검증)
    admisuDesignSchdlContn : dma_modify.get("admisuDesignSchdlContn"), // 관리종목지정예정내용(주석)
    remk : dma_modify.get("remk"), // 기타
    rsnList : dlt_modifyRsnList.getAllJSON(), // 지정사유 목록 (AS-IS dts_Rsn) Min Items: 1
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_modifyResult" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="result" name="처리결과 (S:성공, F:실패)" dataType="text"></w2:key>
		<w2:key id="resultMessage" name="처리결과 메시지" dataType="text"></w2:key>
		<w2:key id="completeYn" name="처리완료 여부" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

---

## 4. [ULDSTF08036][ETN][관리종목지정우려예고] 수정 진입 상세 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `"/etn/EtnMktAct.do?SCREN_ID="+vScrenID+"&SCREN_PROCES_TP_CD="+SCREN_PROCS_TP_CD_01+"&method=searchEtnAdministrativeIssueNoti"`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu-noti/select-one`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dma_detailMst=body.mst, dlt_detailIsuList=body.isuList, dlt_detailRsnList=body.rsnList"
}

// requestData 지정
const requestData = {
    bzProcsNo: "",
    isurCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_detailMst" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="dscYn" name="공시여부" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="admisunotiDd" name="관리종목지정예고일자" dataType="text"></w2:key>
		<w2:key id="admisuDesignSchdlDd" name="관리종목지정예정일자" dataType="text"></w2:key>
		<w2:key id="admisuDesignSchdlContn" name="관리종목지정예정내용(주석)" dataType="text"></w2:key>
		<w2:key id="admisuRsnNm" name="지정사유명 (변경후 사유를 ' 및 ' 로 연결)" dataType="text"></w2:key>
		<w2:key id="isurNm" name="발행회사약명" dataType="text"></w2:key>
		<w2:key id="comNm" name="발행회사명 (공시안내문용)" dataType="text"></w2:key>
		<w2:key id="remk" name="기타" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataList id="dlt_detailIsuList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목약명" dataType="text"></w2:column>
		<w2:column id="isuNmFm" name="종목명" dataType="text"></w2:column>
		<w2:column id="listDd" name="상장일자" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="comNm" name="발행회사명" dataType="text"></w2:column>
		<w2:column id="isurNm" name="발행회사약명" dataType="text"></w2:column>
		<w2:column id="secugrpId" name="증권그룹ID" dataType="text"></w2:column>
		<w2:column id="stkKndNm" name="주식종류명" dataType="text"></w2:column>
		<w2:column id="lsttrdDd" name="최종거래일자" dataType="text"></w2:column>
		<w2:column id="expDd" name="만기일자" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
<w2:dataList id="dlt_detailRsnList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="chgBfafTpCd" name="변경전후구분코드(1:변경전, 2:변경후)" dataType="text"></w2:column>
		<w2:column id="admisuDesnrelsTpCd" name="관리종목지정및해제구분코드(1:지정, 2:해제)" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnCd" name="관리종목지정사유코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnNm" name="관리종목지정사유명 - 공표사유명이 없으면 사유코드의 기본 사유명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---

## 5. [ULDSTF08035][ETN][관리종목지정우려예고] 목록 조회 - 발행사 기준 - DIV_ETN_IDX_ADMISUNOTI_LIST_CORP

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `발행기관코드 기준 관리종목지정우려예고 목록 조회. AS-IS fn_search (DIV_IDX=1)`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu-noti/select-list-corp`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_listCorp=body"
}

// requestData 지정
const requestData = {
    isurCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_listCorp" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="dftYn" name="기안여부" dataType="text"></w2:column>
		<w2:column id="dscYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="admisunotiDd" name="관리종목지정예고일자" dataType="text"></w2:column>
		<w2:column id="admisuDesignSchdlDd" name="관리종목지정예정일자" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목약명" dataType="text"></w2:column>
		<w2:column id="comNm" name="발행회사약명" dataType="text"></w2:column>
		<w2:column id="admisuRsnNm" name="지정사유명 (변경후 사유를 ',' 로 연결)" dataType="text"></w2:column>
		<w2:column id="admisuDesignSchdlContn" name="관리종목지정예정내용(주석)" dataType="text"></w2:column>
		<w2:column id="remk" name="기타" dataType="text"></w2:column>
		<w2:column id="lstEmpNm" name="최종처리자명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---

## 6. [ULDSTF08035][ETN][관리종목지정우려예고] 목록 조회 - 종목 기준 - DIV_ETN_IDX_ADMISUNOTI_LIST_ISU

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `종목코드 기준 관리종목지정우려예고 목록 조회. AS-IS fn_search (DIV_IDX=0)`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu-noti/select-list-isu`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_listIsu=body"
}

// requestData 지정
const requestData = {
    isuCd: ""
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_listIsu" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="dftYn" name="기안여부" dataType="text"></w2:column>
		<w2:column id="dscYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="admisunotiDd" name="관리종목지정예고일자" dataType="text"></w2:column>
		<w2:column id="admisuDesignSchdlDd" name="관리종목지정예정일자" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목약명" dataType="text"></w2:column>
		<w2:column id="comNm" name="발행회사약명" dataType="text"></w2:column>
		<w2:column id="admisuRsnNm" name="지정사유명 (변경후 사유를 ',' 로 연결)" dataType="text"></w2:column>
		<w2:column id="admisuDesignSchdlContn" name="관리종목지정예정내용(주석)" dataType="text"></w2:column>
		<w2:column id="remk" name="기타" dataType="text"></w2:column>
		<w2:column id="lstEmpNm" name="최종처리자명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---

## 7. [ULDSTF08035][ETN][관리종목지정우려예고] 목록 조회 - 전체 - DIV_ETN_IDX_ADMISUNOTI_LIST_ALL

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `검색조건 없이 전체 관리종목지정우려예고 목록 조회. AS-IS fn_search (DIV_IDX=2)`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu-noti/select-list-all`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_listAll=body"
}

```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_listAll" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="dftYn" name="기안여부" dataType="text"></w2:column>
		<w2:column id="dscYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="admisunotiDd" name="관리종목지정예고일자" dataType="text"></w2:column>
		<w2:column id="admisuDesignSchdlDd" name="관리종목지정예정일자" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목약명" dataType="text"></w2:column>
		<w2:column id="comNm" name="발행회사약명" dataType="text"></w2:column>
		<w2:column id="admisuRsnNm" name="지정사유명 (변경후 사유를 ',' 로 연결)" dataType="text"></w2:column>
		<w2:column id="admisuDesignSchdlContn" name="관리종목지정예정내용(주석)" dataType="text"></w2:column>
		<w2:column id="remk" name="기타" dataType="text"></w2:column>
		<w2:column id="lstEmpNm" name="최종처리자명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---
