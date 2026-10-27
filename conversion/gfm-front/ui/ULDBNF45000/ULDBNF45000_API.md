# [채권] 채권신고담당자 정보변경 API 명세 및 변환 정보

원본: `ULDBNF45000_API.txt` (2026-10-27 md 형식으로 변환 — 블록 제목·경로·요청/응답 정의는 원문 그대로, AS-IS 는 업무 분석 결과서 `ULDBNF45000.md` §5 기준)

## 1. [ULDBNF45000] 담당자 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : (없음 — JSP 서버 렌더링 `${result}`)
* **TO-BE** : `GET /api/bonds/accountMgt/bndClaimMgrUpdate/bndClaimMgr-select`

**[REQUEST]**

```javascript
{
    ref: "",
    target: "dlt_searchList=body"
}
```

```xml
<w2:dataMap id="dma_searchList" baseNode="map">
	<w2:keyInfo>
		<w2:key id="isurCd" name="발행기관" dataType="text"></w2:key>
		<w2:key id="chrgId" name="담당자ID" dataType="text"></w2:key>
		<w2:key id="bdchrgTpCd" name="채권신고담당자구분코드" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

**[RESPONSE]**

```xml
<w2:dataList id="dlt_searchList" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="chrgId" name="담당자ID" dataType="text"></w2:column>
		<w2:column id="chrgNm" name="담당자명" dataType="text"></w2:column>
		<w2:column id="isurCd" name="발행기관코드" dataType="text"></w2:column>
		<w2:column id="bdchrgTpCd" name="채권신고담당자구분코드" dataType="text"></w2:column>
		<w2:column id="bdchrgTpNm" name="채권신고담당자구분코드명" dataType="text"></w2:column>
		<w2:column id="telNo" name="전화번호" dataType="text"></w2:column>
		<w2:column id="cellphoneNo" name="암호화휴대폰번호" dataType="text"></w2:column>
		<w2:column id="email" name="암호화이메일" dataType="text"></w2:column>
		<w2:column id="faxNo" name="팩스번호" dataType="text"></w2:column>
		<w2:column id="belngInstNm" name="소속기관명" dataType="text"></w2:column>
		<w2:column id="belngDepNm" name="소속부서명" dataType="text"></w2:column>
		<w2:column id="jobposNm" name="직책명" dataType="text"></w2:column>
		<w2:column id="chrgUseYn" name="담당자사용여부" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

---

## 2. [ULDBNF45000] 담당자 상세 조회

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `POST /account/userInfo.do?method=selectBdchrgDtlInfo` (`$.ajax`, `async:false`, 폼 직렬화)
* **TO-BE** : `GET /api/bonds/accountMgt/bndClaimMgrUpdate/bndClaimMgrDtl-select`

**[REQUEST]**

```javascript
{
    ref: "",
    target: "dma_searchDtlRes=body"
}
```

```xml
<w2:dataMap id="dma_searchDtlReq" baseNode="map">
	<w2:keyInfo>
		<w2:key id="isurCd" name="발행기관" dataType="text"></w2:key>
		<w2:key id="chrgId" name="담당자ID" dataType="text"></w2:key>
		<w2:key id="bdchrgTpCd" name="채권신고담당자구분코드" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

**[RESPONSE]**

```xml
<w2:dataMap id="dma_searchDtlRes" baseNode="map">
	<w2:keyInfo>
		<w2:key id="chrgId" name="담당자ID" dataType="text"></w2:key>
		<w2:key id="chrgNm" name="담당자명" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="bdchrgTpCd" name="채권신고담당자구분코드" dataType="text"></w2:key>
		<w2:key id="bdchrgTpNm" name="채권신고담당자구분코드명" dataType="text"></w2:key>
		<w2:key id="telNo" name="전화번호" dataType="text"></w2:key>
		<w2:key id="cellphoneNo" name="암호화휴대폰번호" dataType="text"></w2:key>
		<w2:key id="email" name="암호화이메일" dataType="text"></w2:key>
		<w2:key id="faxNo" name="팩스번호" dataType="text"></w2:key>
		<w2:key id="belngInstNm" name="소속기관명" dataType="text"></w2:key>
		<w2:key id="belngDepNm" name="소속부서명" dataType="text"></w2:key>
		<w2:key id="jobposNm" name="직책명" dataType="text"></w2:key>
		<w2:key id="chrgUseYn" name="담당자사용여부" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

---

## 3. [ULDBNF45000] 담당자 정보 수정

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `POST /register/registerNew.do?method=updateBdchrgInfo` (폼 submit)
* **TO-BE** : `POST /api/bonds/accountMgt/bndClaimMgrUpdate/mgrInfo-update`

**[REQUEST]**

```javascript
{
    ref: "",
    target: ""
}
```

```xml
<w2:dataMap id="dma_mgrInfoUpdate" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bndApplId" name="채권신청ID" dataType="text"></w2:key>
		<w2:key id="chrgId" name="담당자ID" dataType="text"></w2:key>
		<w2:key id="chrgNm" name="담당자명" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="bdchrgTpCd" name="채권신고담당자구분코드" dataType="text"></w2:key>
		<w2:key id="bfBdchrgTpCd" name="채권신고담당자구분코드(변경전)" dataType="text"></w2:key>
		<w2:key id="bdchrgTpNm" name="채권신고담당자구분코드명" dataType="text"></w2:key>
		<w2:key id="telNo" name="전화번호" dataType="text"></w2:key>
		<w2:key id="cellphoneNo" name="암호화휴대폰번호" dataType="text"></w2:key>
		<w2:key id="email" name="암호화이메일" dataType="text"></w2:key>
		<w2:key id="faxNo" name="팩스번호" dataType="text"></w2:key>
		<w2:key id="belngInstNm" name="소속기관명" dataType="text"></w2:key>
		<w2:key id="belngDepNm" name="소속부서명" dataType="text"></w2:key>
		<w2:key id="jobposNm" name="직책명" dataType="text"></w2:key>
		<w2:key id="chrgUseYn" name="담당자사용여부" dataType="text"></w2:key>
		<w2:key id="bdchrgApplTpCd" name="채권신고담당자신청구분코드" dataType="text"></w2:key>
		<w2:key id="bdchrgApplStatCd" name="채권신고담당자신청상태코드" dataType="text"></w2:key>
		<w2:key id="applProcsContn" name="신청처리내용" dataType="text"></w2:key>
		<w2:key id="loginId" name="통합사용자ID" dataType="text"></w2:key>
		<w2:key id="transtrId" name="처리자ID" dataType="text"></w2:key>
		<w2:key id="empNo" name="로그인사번" dataType="text"></w2:key>
		<w2:key id="empNm" name="로그인성명" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
```

**[RESPONSE]**

(명세 빈칸 — 결과 코드만)

---

## 4. [ULDBNF45000] 담당자변경처리

**1) AS-IS → TO-BE 변환 API 명세 내용**

* **AS-IS** : `POST /register/registerNew.do?method=changeBdchrg` (폼 submit, multipart — 첨부 `attachFiles[0~2]`)
* **TO-BE** : `POST /api/bonds/accountMgt/bndClaimMgrUpdate/mgrUpdate-proc`

**[REQUEST]**

```javascript
{
    ref: "",
    target: ""
}
```

```xml
<w2:dataMap id="dma_mgrInfoUpdate" baseNode="map">
	<w2:keyInfo>
		<w2:key id="bndApplId" name="채권신청ID" dataType="text"></w2:key>
		<w2:key id="chrgId" name="담당자ID" dataType="text"></w2:key>
		<w2:key id="chrgNm" name="담당자명" dataType="text"></w2:key>
		<w2:key id="isurCd" name="발행기관코드" dataType="text"></w2:key>
		<w2:key id="bdchrgTpCd" name="채권신고담당자구분코드" dataType="text"></w2:key>
		<w2:key id="bfBdchrgTpCd" name="채권신고담당자구분코드(변경전)" dataType="text"></w2:key>
		<w2:key id="bdchrgTpNm" name="채권신고담당자구분코드명" dataType="text"></w2:key>
		<w2:key id="telNo" name="전화번호" dataType="text"></w2:key>
		<w2:key id="cellphoneNo" name="암호화휴대폰번호" dataType="text"></w2:key>
		<w2:key id="email" name="암호화이메일" dataType="text"></w2:key>
		<w2:key id="faxNo" name="팩스번호" dataType="text"></w2:key>
		<w2:key id="belngInstNm" name="소속기관명" dataType="text"></w2:key>
		<w2:key id="belngDepNm" name="소속부서명" dataType="text"></w2:key>
		<w2:key id="jobposNm" name="직책명" dataType="text"></w2:key>
		<w2:key id="chrgUseYn" name="담당자사용여부" dataType="text"></w2:key>
		<w2:key id="bdchrgApplTpCd" name="채권신고담당자신청구분코드" dataType="text"></w2:key>
		<w2:key id="bdchrgApplStatCd" name="채권신고담당자신청상태코드" dataType="text"></w2:key>
		<w2:key id="applProcsContn" name="신청처리내용" dataType="text"></w2:key>
		<w2:key id="loginId" name="통합사용자ID" dataType="text"></w2:key>
		<w2:key id="transtrId" name="처리자ID" dataType="text"></w2:key>
		<w2:key id="empNo" name="로그인사번" dataType="text"></w2:key>
		<w2:key id="empNm" name="로그인성명" dataType="text"></w2:key>
	</w2:keyInfo>
</w2:dataMap>
<w2:dataList id="dlt_files" baseNode="list" saveRemovedData="true" repeatNode="map">
	<w2:columnInfo>
		<w2:column id="id" dataType="number"></w2:column>
		<w2:column id="uid" dataType="text"></w2:column>
		<w2:column id="empNo" dataType="text"></w2:column>
		<w2:column id="empName" dataType="text"></w2:column>
		<w2:column id="fileName" dataType="text"></w2:column>
		<w2:column id="fileSize" dataType="number" defaultValue="0"></w2:column>
		<w2:column id="fileChanged" dataType="text"></w2:column>
	</w2:columnInfo>
</w2:dataList>
```

**[RESPONSE]**

(명세 빈칸 — 결과 코드만)
