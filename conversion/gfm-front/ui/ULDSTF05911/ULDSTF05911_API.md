# [ELW] 행사가격/전환비율 변경 API 명세 및 변환 정보

원본: `ULDSTF05911_API.txt` (2026-10-27 md 형식으로 변환 — 블록 제목·경로·요청/응답 정의는 원문 그대로, AS-IS 는 업무 분석 결과서 `ULDSTF05911.md` §5 기준)

## 1. [ULDSTF05911][ELW][행사가격/전환비율 변경] 종목별 상세 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `/Listing.do?method=searchChgList&DIV_IDX=3(CHGLIST_PRC)&BZ_PROCS_NO=` → `dts_Isu`
* **TO-BE** : `GET /api/listing/lstproc/elw/chg-listing-prc/select-list-isu`

**[REQUEST]**

```javascript
const requestData = {
    bzProcsNo : bzProcsNo
};
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_detail" baseNode="map">
	<w2:keyInfo>
		<w2:key id="chgListMktactAdmNo" name="변경상장시장조치관리번호 (TO-BE PK, 수정/삭제 시 그대로 전달)" dataType="number"></w2:key>
		<w2:key id="bfchgBybzprocsSeq" name="변경전 업무처리별일련번호 (TO-BE _D PK 구성요소)" dataType="number"></w2:key>
		<w2:key id="afchgBybzprocsSeq" name="변경후 업무처리별일련번호 (TO-BE _D PK 구성요소)" dataType="number"></w2:key>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="isuCd" name="종목코드" dataType="text"></w2:key>
		<w2:key id="isuNm" name="종목명" dataType="text"></w2:key>
		<w2:key id="chgDd" name="변경일자" dataType="text"></w2:key>
		<w2:key id="chgRsnContn" name="변경사유내용" dataType="text"></w2:key>
		<w2:key id="bfchgExerPrc" name="변경전행사가격" dataType="number"></w2:key>
		<w2:key id="afchgExerPrc" name="변경후행사가격" dataType="number"></w2:key>
		<w2:key id="bfchgConvRto" name="변경전전환비율" dataType="number"></w2:key>
		<w2:key id="afchgConvRto" name="변경후전환비율" dataType="number"></w2:key>
		<w2:key id="bfchgElwKoOccrBasPrc" name="변경전조기종료기준가격" dataType="number"></w2:key>
		<w2:key id="afchgElwKoOccrBasPrc" name="변경후조기종료기준가격" dataType="number"></w2:key>
		<w2:key id="listMethdTpCd" name="상장방식유형코드" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="elwRghtTpKindCd" name="ELW권리형태종류코드" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

* **submission target**: `"dma_detail=body"`

---

## 2. [ULDSTF05911][ELW][행사가격/전환비율 변경] 수정

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `trs` `/Listing.do?method=saveChgList` `TRS_IDX=2` (`KeyValue: dtsParm1=dts_Isu`)
* **TO-BE** : `POST /api/listing/lstproc/elw/chg-listing-prc/modify`

**[REQUEST]**

```xml
<w2:dataMap id="dma_update" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호(수정 시 필수, 등록 시 서버채번)" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="chgDd" name="변경상장일자(변경일자, YYYYMMDD)" dataType="text"></w2:key>
		<w2:key id="chgRsnContn" name="변경사유내용" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

<w2:dataList id="dlt_update_isuList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="bfchgExerPrc" name="변경전행사가격" dataType="number"></w2:column>
		<w2:column id="afchgExerPrc" name="변경후행사가격" dataType="number"></w2:column>
		<w2:column id="bfchgConvRto" name="변경전전환비율" dataType="number"></w2:column>
		<w2:column id="afchgConvRto" name="변경후전환비율" dataType="number"></w2:column>
		<w2:column id="bfchgElwKoOccrBasPrc" name="변경전조기종료기준가격" dataType="number"></w2:column>
		<w2:column id="afchgElwKoOccrBasPrc" name="변경후조기종료기준가격" dataType="number"></w2:column>
		<w2:column id="listMethdTpCd" name="상장방식유형코드" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

* dma_update 데이터를 $c.sbm.executeDynamic함수의 ref 속성을 사용하지 않고 requestData 데이터로 전달함.
* dlt_update_isuList 데이터는 requestData의 isuList 객체명으로 전달함.

**[RESPONSE]**

(명세 빈칸 — 결과 코드만)

---

## 3. [ULDSTF05911][ELW][행사가격/전환비율 변경] 등록

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `fn_getNewBzProcNo` 채번 → `trs` `/Listing.do?method=saveChgList` `TRS_IDX=1` (`KeyValue: dtsParm1=dts_Isu`)
* **TO-BE** : `POST /api/listing/lstproc/elw/chg-listing-prc/register`

**[REQUEST]**

```xml
<w2:dataMap id="dma_register" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호(수정 시 필수, 등록 시 서버채번)" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="chgDd" name="변경상장일자(변경일자, YYYYMMDD)" dataType="text"></w2:key>
		<w2:key id="chgRsnContn" name="변경사유내용" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>

<w2:dataList id="dlt_register_isuList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="isuCd" name="종목코드" dataType="text"></w2:column>
		<w2:column id="bfchgExerPrc" name="변경전행사가격" dataType="number"></w2:column>
		<w2:column id="afchgExerPrc" name="변경후행사가격" dataType="number"></w2:column>
		<w2:column id="bfchgConvRto" name="변경전전환비율" dataType="number"></w2:column>
		<w2:column id="afchgConvRto" name="변경후전환비율" dataType="number"></w2:column>
		<w2:column id="bfchgElwKoOccrBasPrc" name="변경전조기종료기준가격" dataType="number"></w2:column>
		<w2:column id="afchgElwKoOccrBasPrc" name="변경후조기종료기준가격" dataType="number"></w2:column>
		<w2:column id="listMethdTpCd" name="상장방식유형코드" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

* dma_register 데이터를 $c.sbm.executeDynamic함수의 ref 속성을 사용하지 않고 requestData 데이터로 전달함.
* dlt_register_isuList 데이터는 requestData의 isuList 객체명으로 전달함.

**[RESPONSE]**

(명세 빈칸 — 결과 코드만)

---

## 4. [ULDSTF05911][ELW][행사가격/전환비율 변경] 삭제(논리삭제)

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `trs` `/Listing.do?method=saveChgList` `TRS_IDX=3` (그리드 전체 전송)
* **TO-BE** : `POST /api/listing/lstproc/elw/chg-listing-prc/remove`

**[REQUEST]**

```xml
<w2:dataMap id="dma_remove" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bzProcsNo" name="업무처리번호" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

**[RESPONSE]**

(명세 빈칸 — 결과 코드만)
