```markdown
# [선박투자] 수입분배기준일변경 API 명세 및 변환 정보

## 1. [ULDSTF05621][선박투자][수입분배기준일변경 - 상세] 신규 등록 시 현재 수입분배기준일 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `GET /api/listing/lstproc/fund/dist-pay-basdd-change/select-current-dist-pay-basdd.do`
*   **TO-BE** : `GET /api/listing/lstproc/fund/dist-pay-basdd-change/select-current-dist-pay-basdd`

**[REQUEST]**
```javascript
const requestData = {
    isurCd: 조회 영역의 isurCd 값
};

```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_std" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호 (조회 응답 전용, AS-IS BZ_PROCS_NO)" dataType="text"></w2:key>
		<w2:key id="bybzprocsSeq" name="업무처리별일련번호 (조회 응답 전용, AS-IS BYBZPROCS_SEQ)" dataType="number"></w2:key>
		<w2:key id="isurCd" name="발행기관코드 (조회 응답 전용, AS-IS ISUR_CD)" dataType="text"></w2:key>
		<w2:key id="chgBfafTpCd" name="변경전후구분코드 (조회 응답 전용, AS-IS CHG_BFAF_TP_CD). 1=변경전, 2=변경후" dataType="text"></w2:key>
		<w2:key id="basMmdd" name="기준월일 (MMDD, 4자리)" dataType="text"></w2:key>
		<w2:key id="basMm" name="기준월 (조회 응답 전용, AS-IS SUBSTR(BAS_MMDD,1,2))" dataType="text"></w2:key>
		<w2:key id="basDd" name="기준일 (조회 응답 전용, AS-IS SUBSTR(BAS_MMDD,3,2))" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

* **submission target**: `"dma_std=body"`

---

## 2. [ULDSTF05620][선박투자][수입분배기준일변경] 목록 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `GET /api/listing/lstproc/fund/dist-pay-basdd-change/select-list.do`
* **TO-BE** : `GET /api/listing/lstproc/fund/dist-pay-basdd-change/select-list`

**[REQUEST]**

```javascript
const requestData = {
    isurCd: 조회 영역의 isurCd 값
};

```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_std" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="draftYn" name="기안검토 여부" dataType="text"></w2:column>
		<w2:column id="disclsYn" name="공시검토;여부" dataType="text"></w2:column>
		<w2:column id="bzProcsNo" name="업무처리번호" dataType="text"></w2:column>
		<w2:column id="isurCd" name="회사코드" dataType="text"></w2:column>
		<w2:column id="chgStrtDd" name="변경일" dataType="text"></w2:column>
		<w2:column id="mktactEnforceDd" name="변경일(시장조치시행일)" dataType="text"></w2:column>
		<w2:column id="basMmddBf" name="변경전 결산기" dataType="text"></w2:column>
		<w2:column id="basMmddAf" name="변경후 결산기" dataType="text"></w2:column>
		<w2:column id="listChgRsnCdVal" name="상장변경사유코드값" dataType="text"></w2:column>
		<w2:column id="fiscyyChgRsnNm" name="변경사유" dataType="text"></w2:column>
		<w2:column id="remk" name="기타" dataType="text"></w2:column>
		<w2:column id="lstEmpNm" name="최종처리자" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>

```

* **submission target**: `"dlt_std=body"`

---

## 3. [ULDSTF05621][선박투자][수입분배기준일변경 - 상세] 예약(미래일자) 등록 중복 체크

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `GET /api/listing/lstproc/fund/dist-pay-basdd-change/select-mst-check.do`
* **TO-BE** : `GET /api/listing/lstproc/fund/dist-pay-basdd-change/select-mst-check`

**[REQUEST]**

```javascript
const requestData = {
    isurCd: 조회 영역의 isurCd 값
};

```

**[RESPONSE & 처리]**

* `boolean` 반환

```javascript
const result = await $c.sbm.executeDynamic(sbmOptions, requestData);

```

---

## 4. [ULDSTF05621][선박투자][수입분배기준일변경 - 상세] 상세 조회(마스터 + 변경전/후 수입분배기준일)

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `GET /api/listing/lstproc/fund/dist-pay-basdd-change/select-one.do`
* **TO-BE** : `GET /api/listing/lstproc/fund/dist-pay-basdd-change/select-one`

**[REQUEST]**

```javascript
const requestData = {
    bzProcsNo: bzProcsNo
};

```

**[RESPONSE (JSON 구조)]**

```json
body {
	bzProcsNo, isurCd, fiscyyDistrBasddTpCd, ...,
	dtlBfList : [ { bzProcsNo, bybzprocsSeq, isurCd, ... } ],
	dtlAfList : [ { bzProcsNo, bybzprocsSeq, isurCd, ... } ]
}

```

* **submission target**: `"dma_resultDetail=body, dlt_detail_dtlBfList=body.dtlBfList, dlt_detail_dtlAfList=body.dtlAfList"`

---

## 5. [ULDSTF05621][선박투자][수입분배기준일변경 - 상세] 삭제

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `POST /api/listing/lstproc/fund/dist-pay-basdd-change/delete.do`
* **TO-BE** : `POST /api/listing/lstproc/fund/dist-pay-basdd-change/delete`

**[REQUEST]**

```javascript
const requestData = { bzProcsNo: bzProcsNo };

```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_resultDelete" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="result" name="결과" dataType="text"></w2:key>
		<w2:key id="resultMessage" name="결과 메시지" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

* **submission target**: `"dma_resultDelete=body"`

---

## 6. [ULDSTF05621][선박투자][수입분배기준일변경 - 상세] 신규 저장

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `POST /api/listing/lstproc/fund/dist-pay-basdd-change/insert.do`
* **TO-BE** : `POST /api/listing/lstproc/fund/dist-pay-basdd-change/insert`

**[REQUEST 병합 처리]**

```javascript
const requestData = {
    ...dma_resultDetail.getJSON(),                // 마스터 정보
    dtlBfList : dlt_detail_dtlBfList.getAllJSON(),  // 변경전 그리드 리스트 (배열)
    dtlAfList : dlt_detail_dtlAfList.getAllJSON()   // 변경후 그리드 리스트 (배열)
};

```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_resultSave" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="result" name="결과" dataType="text"></w2:key>
		<w2:key id="resultMessage" name="결과 메시지" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

```

* **submission target**: `"dma_resultSave=body"`

---

## 7. [ULDSTF05621][선박투자][수입분배기준일변경 - 상세] 수정

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `POST /api/listing/lstproc/fund/dist-pay-basdd-change/update.do`
* **TO-BE** : `POST /api/listing/lstproc/fund/dist-pay-basdd-change/update`

**[REQUEST 병합 처리]**

```javascript
const requestData = {
    ...dma_resultDetail.getJSON(),
    dtlBfList : dlt_detail_dtlBfList.getAllJSON(),
    dtlAfList : dlt_detail_dtlAfList.getAllJSON()
};

```

**[RESPONSE]**
*(6번 신규 저장의 DataMap `dma_resultSave` 구조와 동일)*

* **submission target**: `"dma_resultSave=body"`

```

```