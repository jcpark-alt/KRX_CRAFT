## 0. 이 문서에는 다음 화면의 API를 담고 있다.
 - ULDSTF08031,ULDSTF08032,ULDSTF08032_new,ULDSTF08033,ULDSTF08033_new,ULDSTF08034,ULDSTF08037

## 1. [ULDSTF08032/08032_new/08033/08033_new/08034][ETN][관리종목지정] 업무 중복입력 체크

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `같은 종목·같은 시행일로 이미 입력된 관리종목 건(자기 건 제외)이 있으면 처리일시·업무명, dupYn Y. 화면은 Y 면 "[업무명]건으로 일시에 이미 입력되어있습니다." 안내 후 저장 중단. 08032_new·08033_new 는 종목마다 호출. 업무구분 713(ETN 관리종목지정) 서버 고정. AS-IS fn_check_bz_doubleinput_etn (list_common_etn.js, 각 팝업 fn_CheckForm) / lds.stf.etn.select.bzprocsno.doublinputchek.condition`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu/check-double-input`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dma_checkDoubleInput=body"
}

// requestData 지정
const requestData = {
    isuCd: "",
    mktactEnforceDd: "",
    bzProcsNo: ""
};

```






**[RESPONSE]**

```xml
<w2:dataMap id="dma_checkDoubleInput" baseNode="map">
	<w2:keyInfo>
		<w2:key id="disclsProcsDdtm" name="이미 입력된 건의 처리일시 (YYYY-MM-DD HH24:MI:SS, 없으면 null → 중복 아님)" dataType="text"></w2:key>
		<w2:key id="disclsProcsStatCd" name="업무명 (상장업무구분코드명, 안내 문구용)" dataType="text"></w2:key>
		<w2:key id="dupYn" name="중복여부 (TO-BE 추가 : 처리일시가 있으면 Y)" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```


---










## 2. [ULDSTF08037][ETN][관리종목지정종목선택 팝업] 해제대상 종목내역 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `공시 완료된 지정건 중 아직 해제되지 않은 종목 목록 조회. 08033_new 에서 여는 08037 팝업. AS-IS 08037 fn_set_code (DIV_IDX=ISU_RELEAS)`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu/select-list-releas-isu`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_listReleasIsu=body"
}

// requestData 지정
const requestData = {
    isurCd: ""
};


```






**[RESPONSE]**

```xml
<w2:dataList id="dlt_listReleasIsu" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호 - AS-IS 는 항상 빈 문자열을 반환한다" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="disclsYn" name="공시여부" dataType="text"></w2:column>
		<w2:column id="listDd" name="상장일자(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목한글약명" dataType="text"></w2:column>
		<w2:column id="isuNmFm" name="종목한글명(전체)" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="comNm" name="발행회사명" dataType="text"></w2:column>
		<w2:column id="isurNm" name="발행회사약명" dataType="text"></w2:column>
		<w2:column id="secugrpId" name="증권그룹ID" dataType="text"></w2:column>
		<w2:column id="admisuDesignBzTpCd" name="관리종목지정업무구분코드" dataType="text"></w2:column>
		<w2:column id="mktactEnforceDd" name="시장조치시행일자(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="grndRegulNm" name="근거규정명" dataType="text"></w2:column>
		<w2:column id="admisuDesignBzProcsNo" name="관리종목지정업무처리번호" dataType="text"></w2:column>
		<w2:column id="remk" name="비고" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```



---










## 3. [ULDSTF08033/08033_new][ETN][관리종목지정 해제] 지정사유 신규조회2

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `최신 지정건의 사유 목록 조회(해제 대상 사유). AS-IS 08033 fn_search_rsn, 08033_new fn_search (DIV_IDX=RSN_BF, TRS_IDX=NEWSEL2)`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu/select-list-rsn-new2`

**[REQUEST]**


```javascript
// submission ref, target 지정
{
	target: "dlt_listRsnNew2=body"
}

// requestData 지정
const requestData = {
    isuCd: ""
};

```



**[RESPONSE]**

```xml
<w2:dataList id="dlt_listRsnNew2" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="admisuDesignRsnCd" name="관리종목지정사유코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnNm" name="관리종목지정사유명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```


---










## 4. [ULDSTF08034][ETN][관리종목 사유변경] 지정사유 신규조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `해제건 이후 최신 지정건의 사유 목록 조회(변경전 사유 초기값). AS-IS 08034 fn_search_rsn (DIV_IDX=RSN_BF, TRS_IDX=NEWSEL)`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu/select-list-rsn-new`

**[REQUEST]**


```javascript
// submission ref, target 지정
{
	target: "dlt_listRsnNew=body"
}

// requestData 지정
const requestData = {
    isuCd: ""
};

```






**[RESPONSE]**

```xml
<w2:dataList id="dlt_listRsnNew" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="admisuDesignRsnCd" name="관리종목지정사유코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnNm" name="관리종목지정사유명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```


---













## 5. [ULDSTF08031][ETN][관리종목지정] 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `조회구분(0:종목별/1:발행회사별/2:전체)에 따른 관리종목지정 목록(그리드) 조회. AS-IS fn_search`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu/select-list`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "dlt_list=body"
}

// requestData 지정
const requestData = {
    srchDivCd: "",
    isuCd: "",
    isurCd: ""
};

```


**[RESPONSE]**

```xml
<w2:dataList id="dlt_list" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="dftYn" name="기안여부" dataType="text"></w2:column>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="admisuDesignBzProcsNo" name="관리종목지정업무처리번호(지정건 기준번호)" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목명(종목한글약명)" dataType="text"></w2:column>
		<w2:column id="comNm" name="발행회사(회사약명)" dataType="text"></w2:column>
		<w2:column id="admisuDesignBzTpCd" name="관리종목지정업무구분코드(0:지정, 1:사유변경, 4:해제)" dataType="text"></w2:column>
		<w2:column id="mktactEnforceDd" name="관리종목 지정일(시장조치시행일자)" dataType="text"></w2:column>
		<w2:column id="dscYn" name="지정 공시여부" dataType="text"></w2:column>
		<w2:column id="mktactRsnChgDd" name="관리종목 사유변경일" dataType="text"></w2:column>
		<w2:column id="rsnChgDscYn" name="변경 공시여부" dataType="text"></w2:column>
		<w2:column id="mktactReleasDd" name="관리종목지정 해제(예정)일" dataType="text"></w2:column>
		<w2:column id="releasDscYn" name="해제 공시여부" dataType="text"></w2:column>
		<w2:column id="admisuDesignBzTpNm" name="관리종목지정업무구분명" dataType="text"></w2:column>
		<w2:column id="admisuRsnNm" name="지정사유(여러 건을 콤마로 결합)" dataType="text"></w2:column>
		<w2:column id="admisuRsnContn" name="관리종목지정사유내용" dataType="text"></w2:column>
		<w2:column id="grndRegulNm" name="근거규정명" dataType="text"></w2:column>
		<w2:column id="remk" name="비고" dataType="text"></w2:column>
		<w2:column id="lstEmpNm" name="최종처리자명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```



---









## 6. [ULDSTF08032/08032_new/08033/08033_new/08034][ETN][관리종목지정] 종목 최신 처리상태 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `해당 종목의 가장 최근 관리종목 처리건 조회. AS-IS fn_getMstStatus_etn (list_common_etn.js, 각 팝업 fn_CheckForm 에서 호출). 등록 API(register-design/-releas/-rsn-chg)가 저장 전에 같은 확인을 서버에서 하므로 저장 전 호출은 필요 없음`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu/select-one-status`

**[REQUEST]**

```javascript
// submission ref, target 지정
{
	target: "____dma____=body"
}

// requestData 지정
const requestData = {
    isuCd: ""
};

```


**[RESPONSE]**

```xml
<w2:dataMap id="dma_oneStatus" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="mktactEnforceDd" name="시장조치시행일자(YYYYMMDD)" dataType="text"></w2:key>
		<w2:key id="admisuDesignBzTpCd" name="관리종목지정업무구분코드(0:지정, 1:사유변경, 4:해제)" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```
---











## 7. [ULDSTF08032/08032_new/08033/08034][ETN][관리종목지정 팝업] 상세 조회 (묶음)

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `마스터(bzProcsNo) + 원 지정 건 마스터(orgBzProcsNo) + 종목내역(isurCd) + 지정사유 변경전·변경후(bzProcsNo)를 한 번에 조회. AS-IS 08032·08033·08034 fn_search, 08032_new fn_search(마스터만), 08033·08034 fn_new_onload(orgBzProcsNo·isurCd 만 - 원 지정 건 기준 종목). AS-IS 는 searchEtnAdministrativeIssue 를 DIV_IDX MST·ISU_ITM·RSN_BF·RSN_AF 로 여러 번 호출. 화면별 사용 항목은 응답 DTO 설명 참고`
*   **TO-BE** : `GET /api/listing/lstproc/etn/adm-isu/select-one`

**[REQUEST]**

```javascript
// requestData 지정
const requestData = {
    bzProcsNo: "",
    orgBzProcsNo: "",
    isurCd: ""
};

```


**[RESPONSE]**

```xml
<w2:dataMap id="dma_packageMst" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="dscYn" name="공시여부" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="admisuDesignBzTpCd" name="관리종목지정업무구분코드(0:지정, 1:사유변경, 4:해제)" dataType="text"></w2:key>
		<w2:key id="mktactEnforceDd" name="시장조치시행일자(YYYYMMDD)" dataType="text"></w2:key>
		<w2:key id="grndRegulNm" name="근거규정명" dataType="text"></w2:key>
		<w2:key id="admisuRsnContn" name="관리종목사유내용" dataType="text"></w2:key>
		<w2:key id="admisuDesignBzProcsNo" name="관리종목지정업무처리번호" dataType="text"></w2:key>
		<w2:key id="isurNm" name="발행회사약명" dataType="text"></w2:key>
		<w2:key id="comNm" name="발행회사명" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataMap id="dma_packageMstBf" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="dscYn" name="공시여부" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="admisuDesignBzTpCd" name="관리종목지정업무구분코드(0:지정, 1:사유변경, 4:해제)" dataType="text"></w2:key>
		<w2:key id="mktactEnforceDd" name="시장조치시행일자(YYYYMMDD)" dataType="text"></w2:key>
		<w2:key id="grndRegulNm" name="근거규정명" dataType="text"></w2:key>
		<w2:key id="admisuRsnContn" name="관리종목사유내용" dataType="text"></w2:key>
		<w2:key id="admisuDesignBzProcsNo" name="관리종목지정업무처리번호" dataType="text"></w2:key>
		<w2:key id="isurNm" name="발행회사약명" dataType="text"></w2:key>
		<w2:key id="comNm" name="발행회사명" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataList id="dlt_packageIsuList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="isuNm" name="종목한글약명" dataType="text"></w2:column>
		<w2:column id="listDd" name="상장일자(YYYYMMDD)" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="comNm" name="발행회사명" dataType="text"></w2:column>
		<w2:column id="isurNm" name="발행회사약명" dataType="text"></w2:column>
		<w2:column id="secugrpId" name="증권그룹ID" dataType="text"></w2:column>
		<w2:column id="isuNmFm" name="종목한글명(전체)" dataType="text"></w2:column>
		<w2:column id="selected" name="선택여부(T:이미 등록된 종목, F:미등록)" dataType="text"></w2:column>
		<w2:column id="stkKndNm" name="주식종류명 - 없으면 증권그룹명으로 대체" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
<w2:dataList id="dlt_packageRsnBfList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="chgBfafTpCd" name="변경전후구분코드(1:변경전, 2:변경후)" dataType="text"></w2:column>
		<w2:column id="admisuDesnrelsTpCd" name="관리종목지정및해제구분코드(1:지정, 2:해제)" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnCd" name="관리종목지정사유코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnNm" name="관리종목지정사유명 - 공표사유명이 없으면 사유코드의 기본 사유명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
<w2:dataList id="dlt_packageRsnAfList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="chgBfafTpCd" name="변경전후구분코드(1:변경전, 2:변경후)" dataType="text"></w2:column>
		<w2:column id="admisuDesnrelsTpCd" name="관리종목지정및해제구분코드(1:지정, 2:해제)" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnCd" name="관리종목지정사유코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnNm" name="관리종목지정사유명 - 공표사유명이 없으면 사유코드의 기본 사유명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```




**[RESPONSE & 처리]**

```javascript
const result = await $c.sbm.executeDynamic(sbmOptions, requestData);
if(result.responseJSON?.success) {
    dma_packageMst.setJSON(result.responseJSON.body.mst); // 마스터 (업무처리번호 건, AS-IS dts_Mst). 업무처리번호가 없으면 null
    dma_packageMstBf.setJSON(result.responseJSON.body.mstBf); // 원 지정 건 마스터 (08033·08034, AS-IS dts_Mst_Bf). 원 지정 업무처리번호가 없으면 null
    dlt_packageIsuList.setAllJSON(result.responseJSON.body.isuList); // 종목내역 (발행기관 종목 + 등록여부 SELECTED, AS-IS dts_Isu). 발행기관코드가 없으면 빈 목록
    dlt_packageRsnBfList.setAllJSON(result.responseJSON.body.rsnBfList); // 지정사유 변경전 (08034, AS-IS dts_Rsn, DIV_IDX RSN_BF)
    dlt_packageRsnAfList.setAllJSON(result.responseJSON.body.rsnAfList); // 지정사유 변경후 (08032 dts_Rsn·08034 dts_Rsn_Af, DIV_IDX RSN_AF)
}
```

---










## 8. [ULDSTF08032][ETN][관리종목지정] 수정

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `관리종목지정 수정. 종목내역·지정사유는 전체삭제 후 재등록된다. AS-IS fn_update`
*   **TO-BE** : `POST /api/listing/lstproc/etn/adm-isu/modify-design`

**[REQUEST]**

```xml
<w2:dataMap id="dma_modifyDesignMstDto" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호 - 수정은 필수. 등록 단건은 주면 그 값, 비우면 서버 채번. 등록 다건(isuCdList 2건 이상)은 종목마다 서버 채번" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드 - isuCdList 를 비울 때 필수(단건)" dataType="text"></w2:key>
		<w2:key id="mktactEnforceDd" name="시장조치시행일자(YYYYMMDD) - 지정일/사유변경일/해제일" dataType="text"></w2:key>
		<w2:key id="grndRegulNm" name="근거규정명" dataType="text"></w2:key>
		<w2:key id="admisuRsnContn" name="관리종목사유내용" dataType="text"></w2:key>
		<w2:key id="admisuDesignBzProcsNo" name="관리종목지정업무처리번호 - 지정은 서버가 자기 업무처리번호로 설정(보내도 무시). 사유변경·해제 단건은 원 지정건 번호 필수(해제 다건은 서버가 종목별 해제대상 조회값으로 설정)" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataList id="dlt_modifyDesignRsnList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="admisuDesignRsnCd" name="관리종목지정사유코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnNm" name="공표관리종목지정사유명 - 미입력 시 사유코드의 기본 사유명이 사용된다" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```

```javascript
// submission ref, target 지정
{
	target: "dlt_resultSave=body"
}

const requestData = {
    mstDto : dma_modifyDesignMstDto.getJSON(), // 관리종목지정 마스터
    rsnList : dlt_modifyDesignRsnList.getAllJSON(),// 관리종목지정사유 목록 - AS-IS dts_Rsn (변경후 CHG_BFAF_TP_CD='2' 로 저장, 종목마다 같은 사유)
    isuCdList : , // type: [string], 대상 종목코드 목록 - 발행사 단위 다건 지정(ULDSTF08032_new). 등록은 AS-IS 처럼 종목마다 업무처리번호를 채번해 1종목 1건으로 저장한다. 비우면 마스터 종목코드 1건
};

```






**[RESPONSE]**

```xml
<w2:dataList id="dlt_resultSave" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="bzProcsNo" name="업무처리번호 (다건이면 첫 종목의 번호)" dataType="text"></w2:column>
		<w2:column id="bzProcsNoList" name="저장된 업무처리번호 목록 (다건 등록은 종목마다 1건)" dataType="text"></w2:column>
		<w2:column id="result" name="처리결과(S:성공, F:실패)" dataType="text"></w2:column>
		<w2:column id="resultMessage" name="처리결과 메시지" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```



---










## 9. [ULDSTF08033][ETN][관리종목지정 해제] 수정

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `관리종목지정 해제 수정. AS-IS fn_update`
*   **TO-BE** : `POST /api/listing/lstproc/etn/adm-isu/modify-releas`

**[REQUEST]**

```xml
<w2:dataMap id="dma_modifyReleasMstDto" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호 - 수정은 필수. 등록 단건은 주면 그 값, 비우면 서버 채번. 등록 다건(isuCdList 2건 이상)은 종목마다 서버 채번" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드 - isuCdList 를 비울 때 필수(단건)" dataType="text"></w2:key>
		<w2:key id="mktactEnforceDd" name="시장조치시행일자(YYYYMMDD) - 지정일/사유변경일/해제일" dataType="text"></w2:key>
		<w2:key id="grndRegulNm" name="근거규정명" dataType="text"></w2:key>
		<w2:key id="admisuRsnContn" name="관리종목사유내용" dataType="text"></w2:key>
		<w2:key id="admisuDesignBzProcsNo" name="관리종목지정업무처리번호 - 지정은 서버가 자기 업무처리번호로 설정(보내도 무시). 사유변경·해제 단건은 원 지정건 번호 필수(해제 다건은 서버가 종목별 해제대상 조회값으로 설정)" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

```javascript
// submission ref, target 지정
{
	target: "dlt_resultSave=body"
}


const requestData = {
    mstDto: dma_modifyReleasMstDto.getJSON(), // 관리종목지정 해제 마스터
    isuCdList : , // type: [string], 해제 대상 종목코드 목록 - 다건 해제(ULDSTF08033_new). 등록은 AS-IS 처럼 종목마다 업무처리번호를 채번해 1종목 1건으로 저장하고, 원 지정 업무처리번호는 종목별 해제대상 조회값(select-list-releas-isu 의 admisuDesignBzProcsNo)을 서버가 찾는다. 비우면 마스터 종목코드 1건
};

```









---










## 10. [ULDSTF08034][ETN][관리종목 사유변경] 수정

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `관리종목 지정사유 변경 수정. AS-IS fn_update`
*   **TO-BE** : `POST /api/listing/lstproc/etn/adm-isu/modify-rsn-chg`

**[REQUEST]**

```xml
<w2:dataMap id="dma_modifyRsnChgMstDto" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호 - 수정은 필수. 등록 단건은 주면 그 값, 비우면 서버 채번. 등록 다건(isuCdList 2건 이상)은 종목마다 서버 채번" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드 - isuCdList 를 비울 때 필수(단건)" dataType="text"></w2:key>
		<w2:key id="mktactEnforceDd" name="시장조치시행일자(YYYYMMDD) - 지정일/사유변경일/해제일" dataType="text"></w2:key>
		<w2:key id="grndRegulNm" name="근거규정명" dataType="text"></w2:key>
		<w2:key id="admisuRsnContn" name="관리종목사유내용" dataType="text"></w2:key>
		<w2:key id="admisuDesignBzProcsNo" name="관리종목지정업무처리번호 - 지정은 서버가 자기 업무처리번호로 설정(보내도 무시). 사유변경·해제 단건은 원 지정건 번호 필수(해제 다건은 서버가 종목별 해제대상 조회값으로 설정)" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataList id="dlt_modifyRsnChgBfRsnList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="admisuDesignRsnCd" name="관리종목지정사유코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnNm" name="공표관리종목지정사유명 - 미입력 시 사유코드의 기본 사유명이 사용된다" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
<w2:dataList id="dlt_modifyRsnChgAfRsnList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="admisuDesignRsnCd" name="관리종목지정사유코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnNm" name="공표관리종목지정사유명 - 미입력 시 사유코드의 기본 사유명이 사용된다" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```

```javascript
// submission ref, target 지정
{
	target: "dlt_resultSave=body"
}


const requestData = {
    mstDto : dma_modifyRsnChgMstDto.getJSON(), // 관리종목 사유변경 마스터
    bfRsnList : bfRsnList.getAllJSON(), // 변경전 지정사유 목록 - CHG_BFAF_TP_CD='1' 로 저장
    afRsnList : afRsnList.getAllJSON(), // 변경후 지정사유 목록 - CHG_BFAF_TP_CD='2' 로 저장
    isuCdList : , // type [string], 대상 종목코드 목록 - AS-IS ULDSTF08034 는 단건이라 1종목만 허용. 비우면 마스터 종목코드
};

```





---










## 11. [ULDSTF08032/08032_new][ETN][관리종목지정] 등록

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `관리종목지정 신규 등록(마스터+종목내역+지정사유+상장업무처리로그), 전체 한 트랜잭션. 저장 전 전 종목 상태확인(최신 건이 없거나 해제여야 하고 시행일이 이후여야 함, AS-IS fn_getMstStatus_etn). isuCdList 다건(08032_new)은 AS-IS 처럼 종목마다 업무처리번호를 채번해 1종목 1건, 단건은 mstDto.bzProcsNo(비우면 채번). 관리종목지정업무처리번호는 자기 번호, 발행기관코드는 서버 조회. AS-IS fn_save`
*   **TO-BE** : `POST /api/listing/lstproc/etn/adm-isu/register-design`

**[REQUEST]**

```xml
<w2:dataMap id="dma_registerDesignMstDto" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호 - 수정은 필수. 등록 단건은 주면 그 값, 비우면 서버 채번. 등록 다건(isuCdList 2건 이상)은 종목마다 서버 채번" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드 - isuCdList 를 비울 때 필수(단건)" dataType="text"></w2:key>
		<w2:key id="mktactEnforceDd" name="시장조치시행일자(YYYYMMDD) - 지정일/사유변경일/해제일" dataType="text"></w2:key>
		<w2:key id="grndRegulNm" name="근거규정명" dataType="text"></w2:key>
		<w2:key id="admisuRsnContn" name="관리종목사유내용" dataType="text"></w2:key>
		<w2:key id="admisuDesignBzProcsNo" name="관리종목지정업무처리번호 - 지정은 서버가 자기 업무처리번호로 설정(보내도 무시). 사유변경·해제 단건은 원 지정건 번호 필수(해제 다건은 서버가 종목별 해제대상 조회값으로 설정)" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataList id="dlt_registerDesignRsnList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="admisuDesignRsnCd" name="관리종목지정사유코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnNm" name="공표관리종목지정사유명 - 미입력 시 사유코드의 기본 사유명이 사용된다" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```

```javascript
// submission ref, target 지정
{
	target: "dlt_resultSave=body"
}

const requestData = {
    mstDto : dma_registerDesignMstDto.getJSON(), // 관리종목지정 마스터
    rsnList : dlt_registerDesignRsnList.getAllJSON(), // 관리종목지정사유 목록 - AS-IS dts_Rsn (변경후 CHG_BFAF_TP_CD='2' 로 저장, 종목마다 같은 사유)
    isuCdList : , // type [string], 대상 종목코드 목록 - 발행사 단위 다건 지정(ULDSTF08032_new). 등록은 AS-IS 처럼 종목마다 업무처리번호를 채번해 1종목 1건으로 저장한다. 비우면 마스터 종목코드 1건
};

```





---










## 12. [ULDSTF08033/08033_new][ETN][관리종목지정 해제] 등록

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `관리종목지정 해제 신규 등록, 전체 한 트랜잭션. 저장 전 전 종목 상태확인(최신 건이 있고 해제가 아니어야 함). isuCdList 다건(08033_new)은 종목마다 채번, 원 지정 업무처리번호는 종목별 해제대상 조회값(단건은 mstDto.admisuDesignBzProcsNo, 비우면 조회값). 원 지정건의 지정사유에 해제업무처리번호를 갱신한다. AS-IS fn_save`
*   **TO-BE** : `POST /api/listing/lstproc/etn/adm-isu/register-releas`

**[REQUEST]**

```xml
<w2:dataMap id="dma_registerReleasMstDto" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호 - 수정은 필수. 등록 단건은 주면 그 값, 비우면 서버 채번. 등록 다건(isuCdList 2건 이상)은 종목마다 서버 채번" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드 - isuCdList 를 비울 때 필수(단건)" dataType="text"></w2:key>
		<w2:key id="mktactEnforceDd" name="시장조치시행일자(YYYYMMDD) - 지정일/사유변경일/해제일" dataType="text"></w2:key>
		<w2:key id="grndRegulNm" name="근거규정명" dataType="text"></w2:key>
		<w2:key id="admisuRsnContn" name="관리종목사유내용" dataType="text"></w2:key>
		<w2:key id="admisuDesignBzProcsNo" name="관리종목지정업무처리번호 - 지정은 서버가 자기 업무처리번호로 설정(보내도 무시). 사유변경·해제 단건은 원 지정건 번호 필수(해제 다건은 서버가 종목별 해제대상 조회값으로 설정)" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

```javascript
// submission ref, target 지정
{
	target: "dlt_resultSave=body"
}


const requestData = {
    mstDto : dma_registerReleasMstDto.getJSON(), // 관리종목지정 해제 마스터
    isuCdList : , // type [string], 해제 대상 종목코드 목록 - 다건 해제(ULDSTF08033_new). 등록은 AS-IS 처럼 종목마다 업무처리번호를 채번해 1종목 1건으로 저장하고, 원 지정 업무처리번호는 종목별 해제대상 조회값(select-list-releas-isu 의 admisuDesignBzProcsNo)을 서버가 찾는다. 비우면 마스터 종목코드 1건
};

```





---










## 13. [ULDSTF08034][ETN][관리종목 사유변경] 등록

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `관리종목 지정사유 변경 신규 등록(변경전/변경후 사유 함께 저장), 1종목. 저장 전 상태확인(최신 건이 있고 해제가 아니어야 함), 원 지정 업무처리번호(mstDto.admisuDesignBzProcsNo) 필수. AS-IS fn_save`
*   **TO-BE** : `POST /api/listing/lstproc/etn/adm-isu/register-rsn-chg`

**[REQUEST]**

```xml
<w2:dataMap id="dma_registerRsnChgMstDto" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호 - 수정은 필수. 등록 단건은 주면 그 값, 비우면 서버 채번. 등록 다건(isuCdList 2건 이상)은 종목마다 서버 채번" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드 - isuCdList 를 비울 때 필수(단건)" dataType="text"></w2:key>
		<w2:key id="mktactEnforceDd" name="시장조치시행일자(YYYYMMDD) - 지정일/사유변경일/해제일" dataType="text"></w2:key>
		<w2:key id="grndRegulNm" name="근거규정명" dataType="text"></w2:key>
		<w2:key id="admisuRsnContn" name="관리종목사유내용" dataType="text"></w2:key>
		<w2:key id="admisuDesignBzProcsNo" name="관리종목지정업무처리번호 - 지정은 서버가 자기 업무처리번호로 설정(보내도 무시). 사유변경·해제 단건은 원 지정건 번호 필수(해제 다건은 서버가 종목별 해제대상 조회값으로 설정)" dataType="text"></w2:key>
		<w2:key id="remk" name="비고" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataList id="dlt_registerRsnChgBfRsnList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="admisuDesignRsnCd" name="관리종목지정사유코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnNm" name="공표관리종목지정사유명 - 미입력 시 사유코드의 기본 사유명이 사용된다" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
<w2:dataList id="dlt_registerRsnChgAfRsnList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="admisuDesignRsnCd" name="관리종목지정사유코드" dataType="text"></w2:column>
		<w2:column id="admisuDesignRsnNm" name="공표관리종목지정사유명 - 미입력 시 사유코드의 기본 사유명이 사용된다" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```

```javascript
// submission ref, target 지정
{
	target: "dlt_resultSave=body"
}

const requestData = {
    mstDto : dma_registerRsnChgMstDto.getJSON(), // 관리종목 사유변경 마스터
    bfRsnList : dlt_registerRsnChgBfRsnList.getAllJSON(), // 변경전 지정사유 목록 - CHG_BFAF_TP_CD='1' 로 저장
    afRsnList : dlt_registerRsnChgAfRsnList.getAllJSON(), // 변경후 지정사유 목록 - CHG_BFAF_TP_CD='2' 로 저장
    isuCdList : , // type [string], 대상 종목코드 목록 - AS-IS ULDSTF08034 는 단건이라 1종목만 허용. 비우면 마스터 종목코드
};

```

---










## 14. [ULDSTF08032/08032_new/08033/08033_new/08034][ETN][관리종목지정] 삭제

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `업무처리번호만 받는다(발행기관·종목·업무구분은 서버 조회, 없는 건이면 오류). 시장안내공시가 승인된 건은 삭제할 수 없다(AS-IS fn_check_delete_discls, _new 화면에도 적용). 물리삭제 없이 상장업무처리로그만 삭제상태(50)로 기록하고, 해제건이면 지정사유의 해제업무처리번호를 원래 지정번호로 되돌린다. AS-IS fn_delete`
*   **TO-BE** : `POST /api/listing/lstproc/etn/adm-isu/remove`

**[REQUEST]**


```javascript
// submission ref, target 지정
{
	target: "dlt_resultSave=body"
}

// requestData 지정
const requestData = {
    bzProcsNo : ""
};

```

---










