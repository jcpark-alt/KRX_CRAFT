## 1. [ULDSTF15900_API][공시][상장형 수익증권공시검색] 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `/DsclSearchPF.do?method=listPFDsclSrch`
*   **TO-BE** : `get /api/discls/dsclsrch/detailed-dscl/pf/select-list`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_list=body"
}
// requestData 지정
const requestData = {
    'isuCd': '',
	'dateS' : '',
	'dateE' : '',
	'formCd' : '',
	'formNm' : ''
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="acptNo" name="접수번호" dataType="text"></w2:column>
		<w2:column id="modOrgnDisclsAcptNo" name="원공시접수번호(정정·추가 공시일 때)" dataType="text"></w2:column>
		<w2:column id="comAbbrv" name="회사약명(발행기관 약명) — 일괄공시는 빈 값" dataType="text"></w2:column>
		<w2:column id="isuKorAbbrv" name="종목약명 — 일괄공시는 빈 값" dataType="text"></w2:column>
		<w2:column id="ldMktNm" name="시장명(공통코드 01034 상장공시시장구분 코드값명)" dataType="text"></w2:column>
		<w2:column id="ldMktTpCd" name="상장공시시장구분코드" dataType="text"></w2:column>
		<w2:column id="listStatCd" name="상장상태코드 — 일괄공시는 빈 값" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드(공시대상회사)" dataType="text"></w2:column>
		<w2:column id="isuCd" name="종목코드(대표종목코드) — 일괄공시는 빈 값" dataType="text"></w2:column>
		<w2:column id="isuSrtCd" name="종목단축코드(대표종목단축코드 2~7자리) — 일괄공시는 빈 값" dataType="text"></w2:column>
		<w2:column id="docTitle" name="공시제목 ((영문)·[철회]·[정정] 등 표기 + 서식명 + 제목 + (자회사의 주요경영사항))" dataType="text"></w2:column>
		<w2:column id="formCd" name="서식코드" dataType="text"></w2:column>
		<w2:column id="formVer" name="서식버전" dataType="text"></w2:column>
		<w2:column id="acptDdtm" name="접수일시(YYYYMMDDHH24MISS)" dataType="text"></w2:column>
		<w2:column id="disclsPublDdtm" name="배포일시(YYYYMMDDHH24MISS) — 조회기간·정렬 기준" dataType="text"></w2:column>
		<w2:column id="disclsProcsDdtm" name="처리일시(YYYYMMDDHH24MISS)" dataType="text"></w2:column>
		<w2:column id="depNm" name="처리팀명" dataType="text"></w2:column>
		<w2:column id="depCd" name="처리부서코드" dataType="text"></w2:column>
		<w2:column id="corrContStat" name="정정내용상태 — 최초공시(F)인데 정정최종이 아니면 &apos;정정있음&apos;, 그 외 빈 값" dataType="text"></w2:column>
		<w2:column id="modAddSeq" name="정정추가순번" dataType="number"></w2:column>
		<w2:column id="empNm" name="담당자명 — 처리부서의 법인별 공시담당자(업무구분 1). 일괄공시는 빈 값" dataType="text"></w2:column>
		<w2:column id="trstComIsurNm" name="자산운용사명 — PF 공시는 종목의 운용사, 일괄공시는 제출회사(운용사) 약명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>


```




---


## 2. [ULDSTF15900_API][공시][상장형 수익증권공시검색] 자산운용사 목록 조회

**1) AS-IS 함수 → TO-BE 변환 API 명세 내용**
*   **AS-IS** : `/CodeAction.do?method=listTrstComPF`
*   **TO-BE** : `get /api/discls/dsclsrch/detailed-dscl/pf/select-list`

**[REQUEST]**
```javascript
// submission ref, target 지정
{
	target: "dlt_trstComList=body"
}
// requestData 지정
const requestData = {
    'type': ''
};
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="value" name="코드" dataType="text"></w2:column>
		<w2:column id="text" name="코드명" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>


```




---