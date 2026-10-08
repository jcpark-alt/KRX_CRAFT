# 폼 의존 as-is 공통 함수 워크리스트(화면별 재작성용)

> `tmp/gen_form_worklist.py`(세션 스크립트) 가 ui-tobe 의 `TODO Stage2(pcc 반입 2차)` 표지 중 폼·DOM 의존/폼 전역 의존 자리를 모아 만든다(2026-10-08). 방침: as-is 공통이 전역 `form` 필드를 읽고 쓰는 함수는 pcc 로 반입하지 않고 **퍼블리싱·dataMap 확정 뒤 화면 안에서 재작성**한다 — 필드는 dataMap 키(`dma_X.get/set`), focus 는 바인딩 컴포넌트로. 아래 표는 그 재작성에 필요한 사실(필드 → dataMap 키, focus → 컴포넌트, 본문 성격)을 화면별로 미리 뽑은 것. `여럿`/`없음`/`바인딩 컴포넌트 없음` 이 재작성 전에 퍼블리셔·공급사에 확인할 항목.

요약: (함수, 화면) 쌍 222 · 동적/DOM(파일첨부·fn_validate 등, B-7) 104 · 필드 매핑 미해결 있음 90 · 전부 해결 28 · as-is 정의 없음 0

## 함수별 호출 화면

- `fn_validate`(digitalFormValidate.xml): JLDFIL70202C, JLDFIL70203C, JLDFIL70204C, JLDFIL70205C, JLDFIL70302C, JLDFIL70303C, JLDFIL70304C, JLDFIL70305C, JLDFIL70402C, JLDFIL70403C, JLDFIL70404C, JLDFIL70405C, JLDFIL70502C, JLDFIL70503C, JLDFIL70504C, JLDFIL70505C, JLDFIL70802C, JLDFIL70803C, JLDFIL70804C, JLDFIL70805C, JLDFIL70806C, JLDFIL70902C, JLDFIL70903C, JLDFIL70904C, JLDFIL70905C, JLDFIL70906C, JLDFIL71002C, JLDFIL71003C, JLDFIL71004C, JLDFIL71005C, JLDFIL71006C, JLDFIL71102C, JLDFIL71103C, JLDFIL71104C, JLDFIL71105C, JLDFIL71106C, JLDFIL71502C, JLDFIL71503C, JLDFIL71504C, JLDFIL71505C, JLDFIL71602C, JLDFIL71603C, JLDFIL71604C, JLDFIL71605C, JLDFIL71702C, JLDFIL71703C, JLDFIL71704C, JLDFIL71705C, JLDFIL71802C, JLDFIL71803C, JLDFIL71804C, JLDFIL71805C
- `fn_delRow`(bnf/fileUpload.xml): JLDBNF10000, JLDBNF10400, JLDBNF15000, JLDBNF15100, JLDBNF15200, JLDBNF15300, JLDBNF20000, JLDBNF20100, JLDBNF20200, JLDBNF20300, JLDBNF20400, JLDBNF25000, JLDBNF25100, JLDBNF25200, JLDBNF25300, JLDBNF25400, JLDBNF25500, JLDBNF25600, JLDBNF30001, JLDBNF30100, JLDBNF40000, JLDBNF50001, JLDBNF60101, JLDBNF60201, JLDINF05400
- `fn_chkSaveElwPrc`(elw.xml): JLDFIL05012C, JLDFIL05013C, JLDFIL05014C, JLDFIL05015C, JLDFIL05017C, JLDFIL05018C, JLDFIL05019C, JLDFIL05020C, JLDFIL05022C, JLDFIL05023C, JLDFIL05024C, JLDFIL05025C, JLDFIL05027C, JLDFIL05028C, JLDFIL05029C, JLDFIL05030C
- `fn_Edit56`(prelist.xml): JLDFIL05005C, JLDFIL05006C, JLDFIL51050, JLDFIL51050N, JLDFIL51050N2, JLDFIL51100
- `fn_getFileNm`(bnf/fileUpload.xml): JLDBNF55001, JLDFIL71505C, JLDFIL71605C, JLDFIL71705C, JLDFIL71805C
- `fn_UpdateLastPage`(prelist.xml): JLDFIL05005C, JLDFIL05006C, JLDFIL05007C, JLDFIL05008C, JLDFIL05009C
- `fn_clearTransTbl`(elw.xml): JLDFIL05011, JLDFIL05016, JLDFIL05021, JLDFIL05026, JLDFIL05031
- `fn_setMainPage`(elw.xml): JLDFIL05011, JLDFIL05016, JLDFIL05021, JLDFIL05026, JLDFIL05031
- `fn_IsValidDate`(elw.xml): JLDFIL05012C, JLDFIL05017C, JLDFIL05022C, JLDFIL05027C
- `fn_IsValidArr`(elw.xml): JLDFIL05013C, JLDFIL05018C, JLDFIL05023C, JLDFIL05028C
- `fn_UserCheckValues`(elw05015.xml): JLDFIL05015C, JLDFIL05020C, JLDFIL05025C, JLDFIL05030C
- `fn_DigitalSelectSub`(digitalApplList.xml): JLDFIL71501, JLDFIL71601, JLDFIL71701, JLDFIL71801
- `fn_DigitalExcelDownload`(digitalApplList.xml): JLDFIL71501, JLDFIL71601, JLDFIL71701, JLDFIL71801
- `fn_Delete789`(prelist.xml): JLDFIL05007C, JLDFIL05008C, JLDFIL05009C
- `fn_VcChange`(prelist05004.xml): JLDFIL05004C, JLDFIL51400
- `fn_InstInvstChange`(prelist05004.xml): JLDFIL05004C, JLDFIL51400
- `fn_EmpstkassoRadioChange`(prelist05004.xml): JLDFIL05004C, JLDFIL51400
- `fn_EmpstkassoChange`(prelist05004.xml): JLDFIL05004C, JLDFIL51400
- `fn_StkoptRadioChange`(prelist05004.xml): JLDFIL05004C, JLDFIL51400
- `fn_StkoptChange`(prelist05004.xml): JLDFIL05004C, JLDFIL51400
- `fn_TotalChange`(prelist05004.xml): JLDFIL05004C, JLDFIL51400
- `fn_SumAllStockHolder`(prelist05004.xml): JLDFIL05004C, JLDFIL51400
- `fn_Delete56`(prelist.xml): JLDFIL05005C, JLDFIL05006C
- `fn_setElwKoExerContnByRghtTpCd`(elwCheck.xml): JLDFIL05012C, JLDFIL05017C
- `fn_chkElwPrc`(elw.xml): JLDFIL05012C, JLDFIL05017C
- `fn_IsuCheckValues`(elwCheck.xml): JLDFIL05012C, JLDFIL05017C
- `fn_checkElwKoBasPrc`(elwCheck.xml): JLDFIL05012C, JLDFIL05017C
- `fn_checkElwCompnsRt`(elwCheck.xml): JLDFIL05012C, JLDFIL05017C
- `fn_checkIsuExp`(elwCheck.xml): JLDFIL05012C, JLDFIL05017C
- `fn_checkElwKoExerContn`(elwCheck.xml): JLDFIL05012C, JLDFIL05017C
- `fn_IsValidSelect`(elw.xml): JLDFIL05012C, JLDFIL05017C
- `fn_ObjValueResetRmCommaForKO`(elw05012.xml): JLDFIL05012C, JLDFIL05017C
- `fn_IsValidArrDate`(elw.xml): JLDFIL05013C, JLDFIL05023C
- `fn_checkLpAdd`(elw05022.xml): JLDFIL05022C, JLDFIL05027C
- `fn_openFeeCalc`(bnf/bondCommon.xml): JLDBNF00000
- `fn_PrintPreView`(bnf/report.xml): JLDBNF00600
- `fn_minusCheck2`(bnf/bondCommon.xml): JLDBNF30002
- `fn_PrintPreView_JLDBNF55200`(bnf/report.xml): JLDBNF55201
- `fn_PrintPreView_JLDBNF90002`(bnf/report.xml): JLDBNF90002
- `fn_getFileNm1`(bnf/fileUpload.xml): JLDBNF90008
- `fn_CalcPayDtCapAmt`(prelist05002.xml): JLDFIL05002C
- `fn_CalcPubSum`(prelist05002.xml): JLDFIL05002C
- `fn_CalcBusiProfit`(prelist05003.xml): JLDFIL05003C
- `fn_CalcOrdProfit`(prelist05003.xml): JLDFIL05003C
- `fn_CalcNetProfit`(prelist05003.xml): JLDFIL05003C
- `fn_CalcCorpTaxDeductProfit`(prelist05003.xml): JLDFIL05003C
- `fn_CalcAshInde`(prelist05003.xml): JLDFIL05003C
- `fn_CalcTermLastCash`(prelist05003.xml): JLDFIL05003C
- `fn_setInputItem`(prelist05003.xml): JLDFIL05003C
- `fn_CalcAssetSum`(prelist05003.xml): JLDFIL05003C
- `fn_DebtCapSum`(prelist05003.xml): JLDFIL05003C
- `fn_Over5Change`(prelist05004.xml): JLDFIL05004C
- `fn_Over1Change`(prelist05004.xml): JLDFIL05004C
- `fn_MinChange`(prelist05004.xml): JLDFIL05004C
- `fn_Edit10`(prelist.xml): JLDFIL05010C
- `fn_Delete10`(prelist.xml): JLDFIL05010C
- `fn_CheckStringLength`(prelistCheck.xml): JLDFIL05010C
- `fn_ElwSelectSub`(elw.xml): JLDFIL05011
- `fn_issSchdCheckValuesNew`(elw05022.xml): JLDFIL05022C
- `fn_setBzCd`(elw.xml): JLDFIL05031
- `fn_findInvst`(digital.xml): JLDFIL71302
- `fn_getFileNmCheck`(digital.xml): JLDFIL71302
- `fn_popupUserGuideJsp`(inf/function.xml): JLDINF00000
- `fn_startBlink`(inf/function.xml): JLDINF00006
- `fn_PrintPreView_JLDINF00009`(inf/report.xml): JLDINF00009
- `fn_acntcls_add`(inf/function.xml): JLDINF05400
- `fn_acntcls_del`(inf/function.xml): JLDINF05400
- `fn_zipCd`(inf/function.xml): JLDINF05400
- `fn_objStkStdCd`(inf/function.xml): JLDINF10101
- `fn_popupInstCdSearch`(inf/function.xml): JLDINF10101
- `fn_popupInstCdFirstSearch`(inf/function.xml): JLDINF10105
- `fn_numChkObj`(inf/function.xml): JLDINF10801
- `fn_PrintPreView_JLDINF15000`(inf/report.xml): JLDINF15000
- `fn_PrintPreView_JLDINF96000`(inf/report.xml): JLDINF96000

## 화면 × 함수 상세

| 함수 | 화면 | 호출 | as-is 정의 | 본문 성격 | 필드 → dataMap 키 | focus → 컴포넌트 |
| --- | --- | ---: | --- | --- | --- | --- |
| fn_CalcAshInde | JLDFIL05003C | 6 | prelist05003.xml | 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_CalcTermLastCash | fsttrmBzActivCash→여럿(dma_RegisterReq/dma_readDataVO), fsttrmCashIncdecAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmFncActivCash→여럿(dma_RegisterReq/dma_readDataVO), fsttrmInvstActivCash→여럿(dma_RegisterReq/dma_readDataVO), scndtrmBzActivCash→여럿(dma_RegisterReq/dma_readDataVO), scndtrmCashIncdecAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmFncActivCash→여럿(dma_RegisterReq/dma_readDataVO), scndtrmInvstActivCash→여럿(dma_RegisterReq/dma_readDataVO) |  |
| fn_CalcAssetSum | JLDFIL05003C | 2 | prelist05003.xml | 산술(fn_RmComma 문자열 덧셈 의심) | fsttrmFixasstAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmLiquasstAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmTotAsstAmt→여럿(dma_RegisterReq/dma_readDataVO), halfFixasstAmt→여럿(dma_RegisterReq/dma_readDataVO), halfLiquasstAmt→여럿(dma_RegisterReq/dma_readDataVO), halfTotAsstAmt→여럿(dma_RegisterReq/dma_readDataVO), invstgClmTpCd→여럿(dma_RegisterReq/dma_pageContext), scndtrmFixasstAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmLiquasstAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmTotAsstAmt→여럿(dma_RegisterReq/dma_readDataVO) |  |
| fn_CalcBusiProfit | JLDFIL05003C | 4 | prelist05003.xml | 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_CalcOrdProfit | fsttrmBzProftAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmSaleTotProftAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmSlmngcost→여럿(dma_RegisterReq/dma_readDataVO), halfBzProftAmt→여럿(dma_RegisterReq/dma_readDataVO), halfSaleTotProftAmt→여럿(dma_RegisterReq/dma_readDataVO), halfSlmngcost→여럿(dma_RegisterReq/dma_readDataVO), scndtrmBzProftAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmSaleTotProftAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmSlmngcost→여럿(dma_RegisterReq/dma_readDataVO) |  |
| fn_CalcCorpTaxDeductProfit | JLDFIL05003C | 6 | prelist05003.xml | 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_CalcNetProfit | fsttrmBfcorptaxNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmOrdnincmAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmSpeclLossAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmSpeclProftAmt→여럿(dma_RegisterReq/dma_readDataVO), halfBfcorptaxNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), halfOrdnincmAmt→여럿(dma_RegisterReq/dma_readDataVO), halfSpeclLossAmt→여럿(dma_RegisterReq/dma_readDataVO), halfSpeclProftAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmBfcorptaxNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmOrdnincmAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmSpeclLossAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmSpeclProftAmt→여럿(dma_RegisterReq/dma_readDataVO) |  |
| fn_CalcNetProfit | JLDFIL05003C | 3 | prelist05003.xml | 산술(fn_RmComma 문자열 덧셈 의심) | fsttrmBfcorptaxNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmCorptax→여럿(dma_RegisterReq/dma_readDataVO), fsttrmNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), halfBfcorptaxNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), halfCorptax→여럿(dma_RegisterReq/dma_readDataVO), halfNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmBfcorptaxNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmCorptax→여럿(dma_RegisterReq/dma_readDataVO), scndtrmNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO) |  |
| fn_CalcOrdProfit | JLDFIL05003C | 6 | prelist05003.xml | 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_CalcCorpTaxDeductProfit | fsttrmBzProftAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmBzexcldCost→여럿(dma_RegisterReq/dma_readDataVO), fsttrmBzexcldEarngAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmOrdnincmAmt→여럿(dma_RegisterReq/dma_readDataVO), halfBzProftAmt→여럿(dma_RegisterReq/dma_readDataVO), halfBzexcldCost→여럿(dma_RegisterReq/dma_readDataVO), halfBzexcldEarngAmt→여럿(dma_RegisterReq/dma_readDataVO), halfOrdnincmAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmBzProftAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmBzexcldCost→여럿(dma_RegisterReq/dma_readDataVO), scndtrmBzexcldEarngAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmOrdnincmAmt→여럿(dma_RegisterReq/dma_readDataVO) |  |
| fn_CalcPayDtCapAmt | JLDFIL05002C | 2 | prelist05002.xml | 산술(fn_RmComma 문자열 덧셈 의심) | billPrsntsubmitddCap→여럿(dma_RegisterReq/dma_readDataVO), billPrsntsubmitddCmstkCap→여럿(dma_RegisterReq/dma_readDataVO), billPrsntsubmitddPrefstkCap→여럿(dma_RegisterReq/dma_readDataVO) |  |
| fn_CalcPubSum | JLDFIL05002C | 3 | prelist05002.xml | 산술(fn_RmComma 문자열 덧셈 의심) | invstgClmTpCd→여럿(dma_RegisterReq/dma_pageContext), listSchdlCmstkShrs→여럿(dma_RegisterReq/dma_readDataVO), lwlmtPubofrSchdlTotamt→여럿(dma_RegisterReq/dma_readDataVO), pershrPubprcLwlmtAmt→여럿(dma_RegisterReq/dma_readDataVO), pershrPubprcUplmtAmt→여럿(dma_RegisterReq/dma_readDataVO), pubofrRto→여럿(dma_RegisterReq/dma_readDataVO), pubofrSchdlShrs→여럿(dma_RegisterReq/dma_readDataVO), uplmtPubofrSchdlTotamt→여럿(dma_RegisterReq/dma_readDataVO) |  |
| fn_CalcTermLastCash | JLDFIL05003C | 2 | prelist05003.xml | 산술(fn_RmComma 문자열 덧셈 의심) | fsttrmCashIncdecAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmPdendCash→여럿(dma_RegisterReq/dma_readDataVO), fsttrmPdstrtCash→여럿(dma_RegisterReq/dma_readDataVO), scndtrmCashIncdecAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmPdendCash→여럿(dma_RegisterReq/dma_readDataVO), scndtrmPdstrtCash→여럿(dma_RegisterReq/dma_readDataVO) |  |
| fn_CheckStringLength | JLDFIL05010C | 0 | prelistCheck.xml | 중첩 fn_StrCharByte |  |  |
| fn_DebtCapSum | JLDFIL05003C | 2 | prelist05003.xml | 산술(fn_RmComma 문자열 덧셈 의심) | fsttrmDebtcap→여럿(dma_RegisterReq/dma_readDataVO), fsttrmTotCap→여럿(dma_RegisterReq/dma_readDataVO), fsttrmTotDebtAmt→여럿(dma_RegisterReq/dma_readDataVO), halfDebtcap→여럿(dma_RegisterReq/dma_readDataVO), halfTotCap→여럿(dma_RegisterReq/dma_readDataVO), halfTotDebtAmt→여럿(dma_RegisterReq/dma_readDataVO), invstgClmTpCd→여럿(dma_RegisterReq/dma_pageContext), scndtrmDebtcap→여럿(dma_RegisterReq/dma_readDataVO), scndtrmTotCap→여럿(dma_RegisterReq/dma_readDataVO), scndtrmTotDebtAmt→여럿(dma_RegisterReq/dma_readDataVO) |  |
| fn_Delete10 | JLDFIL05010C | 1 | prelist.xml | 중첩 fn_CheckTrnsmYn | action→없음, method→dma_RegisterReq, resdbzRegNo→dma_RegisterReq, submit→없음, transKind→dma_RegisterReq |  |
| fn_Delete56 | JLDFIL05005C | 1 | prelist.xml | 중첩 fn_CheckTrnsmYn | action→없음, clmInstSeq→dma_RegisterReq, method→dma_RegisterReq, submit→없음, transKind→dma_RegisterReq |  |
| fn_Delete56 | JLDFIL05006C | 1 | prelist.xml | 중첩 fn_CheckTrnsmYn | action→없음, clmInstSeq→dma_RegisterReq, method→dma_RegisterReq, submit→없음, transKind→dma_RegisterReq |  |
| fn_Delete789 | JLDFIL05007C | 1 | prelist.xml | 중첩 fn_CheckTrnsmYn | action→없음, isuexerDd→dma_RegisterReq, isuexerRnd→dma_RegisterReq, method→dma_RegisterReq, submit→없음, transKind→dma_RegisterReq |  |
| fn_Delete789 | JLDFIL05008C | 1 | prelist.xml | 중첩 fn_CheckTrnsmYn | action→없음, isuexerDd→dma_RegisterReq, isuexerRnd→dma_RegisterReq, method→dma_RegisterReq, submit→없음, transKind→dma_RegisterReq |  |
| fn_Delete789 | JLDFIL05009C | 1 | prelist.xml | 중첩 fn_CheckTrnsmYn | action→없음, isuexerDd→dma_RegisterReq, isuexerRnd→dma_RegisterReq, method→dma_RegisterReq, submit→없음, transKind→dma_RegisterReq |  |
| fn_DigitalExcelDownload | JLDFIL71501 | 1 | digitalApplList.xml | 동적/DOM | action→없음, method→여럿(dma_DigitalMstReq/dma_SearchReq/dma_digitalApplDelReq/dma_loadListReq), submit→없음 |  |
| fn_DigitalExcelDownload | JLDFIL71601 | 1 | digitalApplList.xml | 동적/DOM | action→없음, method→여럿(dma_DigitalMstReq/dma_SearchReq/dma_digitalApplDelReq), submit→없음 |  |
| fn_DigitalExcelDownload | JLDFIL71701 | 1 | digitalApplList.xml | 동적/DOM | action→없음, method→여럿(dma_DigitalMstReq/dma_SearchReq/dma_digitalApplDelReq), submit→없음 |  |
| fn_DigitalExcelDownload | JLDFIL71801 | 1 | digitalApplList.xml | 동적/DOM | action→없음, method→여럿(dma_DigitalMstReq/dma_SearchReq/dma_digitalApplDelReq), submit→없음 |  |
| fn_DigitalSelectSub | JLDFIL71501 | 1 | digitalApplList.xml | 동적/DOM; 중첩 fn_isProcess | action→없음, method→여럿(dma_DigitalMstReq/dma_SearchReq/dma_digitalApplDelReq/dma_loadListReq), submit→없음 |  |
| fn_DigitalSelectSub | JLDFIL71601 | 1 | digitalApplList.xml | 동적/DOM; 중첩 fn_isProcess | action→없음, method→여럿(dma_DigitalMstReq/dma_SearchReq/dma_digitalApplDelReq), submit→없음 |  |
| fn_DigitalSelectSub | JLDFIL71701 | 1 | digitalApplList.xml | 동적/DOM; 중첩 fn_isProcess | action→없음, method→여럿(dma_DigitalMstReq/dma_SearchReq/dma_digitalApplDelReq), submit→없음 |  |
| fn_DigitalSelectSub | JLDFIL71801 | 1 | digitalApplList.xml | 동적/DOM; 중첩 fn_isProcess | action→없음, method→여럿(dma_DigitalMstReq/dma_SearchReq/dma_digitalApplDelReq), submit→없음 |  |
| fn_Edit10 | JLDFIL05010C | 1 | prelist.xml | 중첩 fn_CheckTrnsmYn·fn_Register | resdbzRegNo→dma_RegisterReq, transKind→dma_RegisterReq |  |
| fn_Edit56 | JLDFIL05005C | 1 | prelist.xml | 중첩 fn_CheckTrnsmYn·fn_Register | clmInstSeq→dma_RegisterReq, transKind→dma_RegisterReq |  |
| fn_Edit56 | JLDFIL05006C | 1 | prelist.xml | 중첩 fn_CheckTrnsmYn·fn_Register | clmInstSeq→dma_RegisterReq, transKind→dma_RegisterReq |  |
| fn_Edit56 | JLDFIL51050 | 1 | prelist.xml | 중첩 fn_CheckTrnsmYn·fn_Register | clmInstSeq→여럿(dma_DeleteAllReq/dma_DeleteReq/dma_PrelistPageSearchReq/dma_RegisterReq), transKind→여럿(dma_DeleteAllReq/dma_DeleteReq/dma_PrelistPageSearchReq/dma_RegisterReq) |  |
| fn_Edit56 | JLDFIL51050N | 1 | prelist.xml | 중첩 fn_CheckTrnsmYn·fn_Register | clmInstSeq→여럿(dma_DeleteAllReq/dma_DeleteReq/dma_PrelistPageSearchReq/dma_RegisterReq), transKind→여럿(dma_DeleteAllReq/dma_DeleteReq/dma_PrelistPageSearchReq/dma_RegisterReq) |  |
| fn_Edit56 | JLDFIL51050N2 | 1 | prelist.xml | 중첩 fn_CheckTrnsmYn·fn_Register | clmInstSeq→여럿(dma_DeleteAllReq/dma_DeleteReq/dma_PrelistPageSearchReq/dma_RegisterReq), transKind→여럿(dma_DeleteAllReq/dma_DeleteReq/dma_PrelistPageSearchReq/dma_RegisterReq) |  |
| fn_Edit56 | JLDFIL51100 | 1 | prelist.xml | 중첩 fn_CheckTrnsmYn·fn_Register | clmInstSeq→여럿(dma_DeleteAllReq/dma_DeleteReq/dma_PrelistPageSearchReq/dma_RegisterReq), transKind→여럿(dma_DeleteAllReq/dma_DeleteReq/dma_PrelistPageSearchReq/dma_RegisterReq) |  |
| fn_ElwSelectSub | JLDFIL05011 | 1 | elw.xml | 동적/DOM; 중첩 fn_isProcess | action→없음, checkSubNo→여럿(dma_ElwDelReq/dma_ElwExcelDownloadReq/dma_ElwExcelUploadPopReq/dma_ElwMstReq), listProcsStatCd→여럿(dma_ElwDelReq/dma_ElwExcelDownloadReq/dma_ElwExcelUploadPopReq/dma_ElwMstReq), method→여럿(dma_ElwDelReq/dma_ElwExcelDownloadReq/dma_ElwExcelUploadPopReq/dma_ElwMstReq), submit→없음 |  |
| fn_EmpstkassoChange | JLDFIL05004C | 1 | prelist05004.xml | 산술(fn_RmComma 문자열 덧셈 의심) | empstkassoGrntShrs→여럿(dma_RegisterReq/dma_readDataVO), empstkassoRto→여럿(dma_RegisterReq/dma_readDataVO), sumTotShr→dma_RegisterReq |  |
| fn_EmpstkassoChange | JLDFIL51400 | 1 | prelist05004.xml | 산술(fn_RmComma 문자열 덧셈 의심) | empstkassoGrntShrs→dma_readDataVO, empstkassoRto→dma_readDataVO, sumTotShr→없음 |  |
| fn_EmpstkassoRadioChange | JLDFIL05004C | 1 | prelist05004.xml | 검증/대입 | empstkassoGrntShrs→여럿(dma_RegisterReq/dma_readDataVO), empstkassoGrntprnCnt→여럿(dma_RegisterReq/dma_readDataVO), empstkassoRto→여럿(dma_RegisterReq/dma_readDataVO), empstkassoYn1→dma_RegisterReq |  |
| fn_EmpstkassoRadioChange | JLDFIL51400 | 1 | prelist05004.xml | 검증/대입 | empstkassoGrntShrs→dma_readDataVO, empstkassoGrntprnCnt→dma_readDataVO, empstkassoRto→dma_readDataVO, empstkassoYn1→없음 |  |
| fn_InstInvstChange | JLDFIL05004C | 2 | prelist05004.xml | 산술(fn_RmComma 문자열 덧셈 의심) | instInvstCmstkShrs→여럿(dma_RegisterReq/dma_readDataVO), instInvstPrefstkShrs→여럿(dma_RegisterReq/dma_readDataVO), instInvstShrRt→여럿(dma_RegisterReq/dma_readDataVO), sumTotShr→dma_RegisterReq |  |
| fn_InstInvstChange | JLDFIL51400 | 2 | prelist05004.xml | 산술(fn_RmComma 문자열 덧셈 의심) | instInvstCmstkShrs→dma_readDataVO, instInvstPrefstkShrs→dma_readDataVO, instInvstShrRt→dma_readDataVO, sumTotShr→없음 |  |
| fn_IsValidArr | JLDFIL05013C | 1 | elw.xml | 검증/대입 |  |  |
| fn_IsValidArr | JLDFIL05018C | 1 | elw.xml | 검증/대입 |  |  |
| fn_IsValidArr | JLDFIL05023C | 1 | elw.xml | 검증/대입 |  |  |
| fn_IsValidArr | JLDFIL05028C | 1 | elw.xml | 검증/대입 |  |  |
| fn_IsValidArrDate | JLDFIL05013C | 2 | elw.xml | 검증/대입 |  |  |
| fn_IsValidArrDate | JLDFIL05023C | 2 | elw.xml | 검증/대입 |  |  |
| fn_IsValidDate | JLDFIL05012C | 1 | elw.xml | 검증/대입 |  |  |
| fn_IsValidDate | JLDFIL05017C | 1 | elw.xml | 검증/대입 |  |  |
| fn_IsValidDate | JLDFIL05022C | 1 | elw.xml | 검증/대입 |  |  |
| fn_IsValidDate | JLDFIL05027C | 1 | elw.xml | 검증/대입 |  |  |
| fn_IsValidSelect | JLDFIL05012C | 1 | elw.xml | 검증/대입 |  |  |
| fn_IsValidSelect | JLDFIL05017C | 1 | elw.xml | 검증/대입 |  |  |
| fn_IsuCheckValues | JLDFIL05012C | 1 | elwCheck.xml | 중첩 fn_ulyCheck | delisttmPayCondContn→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwExerContn→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwExerTpCd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq), elwExpValuPrcMethd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwFinalPayVal→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwLsttrdDd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwPayAgntNm→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwPayDd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwRghtTpKindCd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq), exerEndDd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), exerStrtDd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), expDd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), lpMbrNo→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq), sysdate→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO) | delisttmPayCondContn→ipt_delisttmPayCondContn, elwExerContn→ipt_elwExerContn, elwExpValuPrcMethd→ipt_elwExpValuPrcMethd, elwFinalPayVal→ipt_elwFinalPayVal, elwLsttrdDd→cal_elwLsttrdDd, elwPayAgntNm→ipt_elwPayAgntNm, elwPayDd→cal_elwPayDd, exerEndDd→cal_exerEndDd, exerStrtDd→cal_exerStrtDd, expDd→cal_expDd |
| fn_IsuCheckValues | JLDFIL05017C | 1 | elwCheck.xml | 중첩 fn_ulyCheck | delisttmPayCondContn→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwExerContn→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwExerTpCd→여럿(dma_RegisterReq/dma_loadListReq), elwExpValuPrcMethd→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwFinalPayVal→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwLsttrdDd→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwPayAgntNm→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwPayDd→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwRghtTpKindCd→여럿(dma_RegisterReq/dma_loadListReq), exerEndDd→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), exerStrtDd→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), expDd→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), lpMbrNo→여럿(dma_RegisterReq/dma_loadListReq), sysdate→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO) | delisttmPayCondContn→ipt_delisttmPayCondContn, elwExerContn→ipt_elwExerContn, elwExpValuPrcMethd→ipt_elwExpValuPrcMethd, elwFinalPayVal→ipt_elwFinalPayVal, elwLsttrdDd→cal_elwLsttrdDd, elwPayAgntNm→ipt_elwPayAgntNm, elwPayDd→cal_elwPayDd, exerEndDd→cal_exerEndDd, exerStrtDd→cal_exerStrtDd, expDd→cal_expDd |
| fn_MinChange | JLDFIL05004C | 3 | prelist05004.xml | 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_TotalChange | minshrhdCmstkShrs→여럿(dma_RegisterReq/dma_readDataVO), minshrhdPrefstkShrs→여럿(dma_RegisterReq/dma_readDataVO), sumMinShr→dma_RegisterReq |  |
| fn_ObjValueResetRmCommaForKO | JLDFIL05012C | 2 | elw05012.xml | 검증/대입 |  |  |
| fn_ObjValueResetRmCommaForKO | JLDFIL05017C | 1 | elw05012.xml | 검증/대입 |  |  |
| fn_Over1Change | JLDFIL05004C | 5 | prelist05004.xml | 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_TotalChange | ovr1PctCmstkShrs→여럿(dma_RegisterReq/dma_readDataVO), ovr1PctPrefstkShrs→여럿(dma_RegisterReq/dma_readDataVO), ovr1PctRelprnCmstkShrs→여럿(dma_RegisterReq/dma_readDataVO), ovr1PctRelprnPrefstkShrs→여럿(dma_RegisterReq/dma_readDataVO), sumOver1LgShr→dma_RegisterReq, sumOver1RelShr→dma_RegisterReq, sumSubOver1Cmn→dma_RegisterReq, sumSubOver1Pref→dma_RegisterReq, sumSubOver1Tot→dma_RegisterReq |  |
| fn_Over5Change | JLDFIL05004C | 5 | prelist05004.xml | 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_TotalChange | ovr5PctCmstkShrs→여럿(dma_RegisterReq/dma_readDataVO), ovr5PctPrefstkShrs→여럿(dma_RegisterReq/dma_readDataVO), ovr5PctRelprnCmstkShrs→여럿(dma_RegisterReq/dma_readDataVO), ovr5PctRelprnPrefstkShrs→여럿(dma_RegisterReq/dma_readDataVO), sumOver5LgShr→dma_RegisterReq, sumOver5RelShr→dma_RegisterReq, sumSubOver5Cmn→dma_RegisterReq, sumSubOver5Pref→dma_RegisterReq, sumSubOver5Tot→dma_RegisterReq |  |
| fn_PrintPreView | JLDBNF00600 | 1 | bnf/report.xml | 검증/대입 |  |  |
| fn_PrintPreView_JLDBNF55200 | JLDBNF55201 | 1 | bnf/report.xml | 검증/대입 |  |  |
| fn_PrintPreView_JLDBNF90002 | JLDBNF90002 | 1 | bnf/report.xml | 검증/대입 |  |  |
| fn_PrintPreView_JLDINF00009 | JLDINF00009 | 1 | inf/report.xml | 검증/대입 |  |  |
| fn_PrintPreView_JLDINF15000 | JLDINF15000 | 1 | inf/report.xml | 검증/대입 |  |  |
| fn_PrintPreView_JLDINF96000 | JLDINF96000 | 1 | inf/report.xml | 검증/대입 |  |  |
| fn_StkoptChange | JLDFIL05004C | 1 | prelist05004.xml | 산술(fn_RmComma 문자열 덧셈 의심) | stkoptGrntShrs→여럿(dma_RegisterReq/dma_readDataVO), stkoptRto→여럿(dma_RegisterReq/dma_readDataVO), sumTotShr→dma_RegisterReq |  |
| fn_StkoptChange | JLDFIL51400 | 1 | prelist05004.xml | 산술(fn_RmComma 문자열 덧셈 의심) | stkoptGrntShrs→dma_readDataVO, stkoptRto→dma_readDataVO, sumTotShr→없음 |  |
| fn_StkoptRadioChange | JLDFIL05004C | 1 | prelist05004.xml | 검증/대입 | stkoptGrntShrs→여럿(dma_RegisterReq/dma_readDataVO), stkoptGrntprnCnt→여럿(dma_RegisterReq/dma_readDataVO), stkoptRto→여럿(dma_RegisterReq/dma_readDataVO), stkoptYn1→dma_RegisterReq |  |
| fn_StkoptRadioChange | JLDFIL51400 | 1 | prelist05004.xml | 검증/대입 | stkoptGrntShrs→dma_readDataVO, stkoptGrntprnCnt→dma_readDataVO, stkoptRto→dma_readDataVO, stkoptYn1→없음 |  |
| fn_SumAllStockHolder | JLDFIL05004C | 1 | prelist05004.xml | 검증/대입 | lgshrhdNm→여럿(dma_RegisterReq/dma_readDataVO), ovr1PctOwnrNm→여럿(dma_RegisterReq/dma_readDataVO), ovr5PctOwnrNm→여럿(dma_RegisterReq/dma_readDataVO) |  |
| fn_SumAllStockHolder | JLDFIL51400 | 1 | prelist05004.xml | 검증/대입 | lgshrhdNm→dma_readDataVO, ovr1PctOwnrNm→dma_readDataVO, ovr5PctOwnrNm→없음 |  |
| fn_TotalChange | JLDFIL05004C | 1 | prelist05004.xml | 산술(fn_RmComma 문자열 덧셈 의심) | lgshrhdRelprnShrRt→여럿(dma_RegisterReq/dma_readDataVO), lgshrhdShrRt→여럿(dma_RegisterReq/dma_readDataVO), minshrhdCmstkShrs→여럿(dma_RegisterReq/dma_readDataVO), minshrhdPrefstkShrs→여럿(dma_RegisterReq/dma_readDataVO), minshrhdShrRt→여럿(dma_RegisterReq/dma_readDataVO), ovr1PctRelprnShrRt→여럿(dma_RegisterReq/dma_readDataVO), ovr1PctShrRt→여럿(dma_RegisterReq/dma_readDataVO), ovr5PctRelprnShrRt→여럿(dma_RegisterReq/dma_readDataVO), ovr5PctShrRt→여럿(dma_RegisterReq/dma_readDataVO), sumLgShr→dma_RegisterReq, sumMinShr→dma_RegisterReq, sumOver1LgShr→dma_RegisterReq, sumOver1RelShr→dma_RegisterReq, sumOver5LgShr→dma_RegisterReq, sumOver5RelShr→dma_RegisterReq, sumRelShr→dma_RegisterReq, sumSubCmn→dma_RegisterReq, sumSubOver1Cmn→dma_RegisterReq, sumSubOver1Pref→dma_RegisterReq, sumSubOver1Rt→dma_RegisterReq, sumSubOver1Tot→dma_RegisterReq, sumSubOver5Cmn→dma_RegisterReq, sumSubOver5Pref→dma_RegisterReq, sumSubOver5Rt→dma_RegisterReq, sumSubOver5Tot→dma_RegisterReq, sumSubPref→dma_RegisterReq, sumSubRt→dma_RegisterReq, sumSubTot→dma_RegisterReq, sumTotCmnShr→dma_RegisterReq, sumTotPrefShr→dma_RegisterReq, sumTotRt→dma_RegisterReq, sumTotShr→dma_RegisterReq |  |
| fn_TotalChange | JLDFIL51400 | 1 | prelist05004.xml | 산술(fn_RmComma 문자열 덧셈 의심) | lgshrhdRelprnShrRt→없음, lgshrhdShrRt→dma_readDataVO, minshrhdCmstkShrs→없음, minshrhdPrefstkShrs→없음, minshrhdShrRt→없음, ovr1PctRelprnShrRt→없음, ovr1PctShrRt→없음, ovr5PctRelprnShrRt→없음, ovr5PctShrRt→없음, sumLgShr→없음, sumMinShr→없음, sumOver1LgShr→없음, sumOver1RelShr→없음, sumOver5LgShr→없음, sumOver5RelShr→없음, sumRelShr→없음, sumSubCmn→없음, sumSubOver1Cmn→없음, sumSubOver1Pref→없음, sumSubOver1Rt→없음, sumSubOver1Tot→없음, sumSubOver5Cmn→없음, sumSubOver5Pref→없음, sumSubOver5Rt→없음, sumSubOver5Tot→없음, sumSubPref→없음, sumSubRt→없음, sumSubTot→없음, sumTotCmnShr→없음, sumTotPrefShr→없음, sumTotRt→없음, sumTotShr→없음 |  |
| fn_UpdateLastPage | JLDFIL05005C | 1 | prelist.xml | 검증/대입 | action→없음, method→dma_RegisterReq, submit→없음 |  |
| fn_UpdateLastPage | JLDFIL05006C | 1 | prelist.xml | 검증/대입 | action→없음, method→dma_RegisterReq, submit→없음 |  |
| fn_UpdateLastPage | JLDFIL05007C | 1 | prelist.xml | 검증/대입 | action→없음, method→dma_RegisterReq, submit→없음 |  |
| fn_UpdateLastPage | JLDFIL05008C | 1 | prelist.xml | 검증/대입 | action→없음, method→dma_RegisterReq, submit→없음 |  |
| fn_UpdateLastPage | JLDFIL05009C | 1 | prelist.xml | 검증/대입 | action→없음, method→dma_RegisterReq, submit→없음 |  |
| fn_UserCheckValues | JLDFIL05015C | 1 | elw05015.xml | 검증/대입 | email→여럿(dma_RegisterReq/dma_loadListReq), faxNo→여럿(dma_RegisterReq/dma_loadListReq), nm→여럿(dma_RegisterReq/dma_loadListReq), telNo→여럿(dma_RegisterReq/dma_loadListReq) | email→ipt_email, faxNo→ipt_faxNo, nm→ipt_nm, telNo→ipt_telNo |
| fn_UserCheckValues | JLDFIL05020C | 1 | elw05015.xml | 검증/대입 | email→여럿(dma_RegisterReq/dma_loadListReq), faxNo→여럿(dma_RegisterReq/dma_loadListReq), nm→여럿(dma_RegisterReq/dma_loadListReq), telNo→여럿(dma_RegisterReq/dma_loadListReq) | email→ipt_email, faxNo→ipt_faxNo, nm→ipt_nm, telNo→ipt_telNo |
| fn_UserCheckValues | JLDFIL05025C | 1 | elw05015.xml | 검증/대입 | email→여럿(dma_RegisterReq/dma_loadListReq), faxNo→여럿(dma_RegisterReq/dma_loadListReq), nm→여럿(dma_RegisterReq/dma_loadListReq), telNo→여럿(dma_RegisterReq/dma_loadListReq) | email→ipt_email, faxNo→ipt_faxNo, nm→ipt_nm, telNo→ipt_telNo |
| fn_UserCheckValues | JLDFIL05030C | 1 | elw05015.xml | 검증/대입 | email→여럿(dma_RegisterReq/dma_loadListReq), faxNo→여럿(dma_RegisterReq/dma_loadListReq), nm→여럿(dma_RegisterReq/dma_loadListReq), telNo→여럿(dma_RegisterReq/dma_loadListReq) | email→ipt_email, faxNo→ipt_faxNo, nm→ipt_nm, telNo→ipt_telNo |
| fn_VcChange | JLDFIL05004C | 2 | prelist05004.xml | 산술(fn_RmComma 문자열 덧셈 의심) | sumTotShr→dma_RegisterReq, ventcapCmstkShrs→여럿(dma_RegisterReq/dma_readDataVO), ventcapPrefstkShrs→여럿(dma_RegisterReq/dma_readDataVO), ventcapShrRt→여럿(dma_RegisterReq/dma_readDataVO) |  |
| fn_VcChange | JLDFIL51400 | 3 | prelist05004.xml | 산술(fn_RmComma 문자열 덧셈 의심) | sumTotShr→없음, ventcapCmstkShrs→dma_readDataVO, ventcapPrefstkShrs→dma_readDataVO, ventcapShrRt→dma_readDataVO |  |
| fn_acntcls_add | JLDINF05400 | 1 | inf/function.xml | 동적/DOM |  |  |
| fn_acntcls_del | JLDINF05400 | 1 | inf/function.xml | 동적/DOM |  |  |
| fn_checkElwCompnsRt | JLDFIL05012C | 1 | elwCheck.xml | 산술(fn_RmComma 문자열 덧셈 의심) | elwCompnsRt→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwRghtTpKindCd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq) |  |
| fn_checkElwCompnsRt | JLDFIL05017C | 1 | elwCheck.xml | 산술(fn_RmComma 문자열 덧셈 의심) | elwCompnsRt→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwRghtTpKindCd→여럿(dma_RegisterReq/dma_loadListReq) |  |
| fn_checkElwKoBasPrc | JLDFIL05012C | 1 | elwCheck.xml | 산술(fn_RmComma 문자열 덧셈 의심) | elwKoBasPrc→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwRghtTpKindCd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq) |  |
| fn_checkElwKoBasPrc | JLDFIL05017C | 1 | elwCheck.xml | 산술(fn_RmComma 문자열 덧셈 의심) | elwKoBasPrc→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwRghtTpKindCd→여럿(dma_RegisterReq/dma_loadListReq) |  |
| fn_checkElwKoExerContn | JLDFIL05012C | 1 | elwCheck.xml | 검증/대입 | elwKoExerContn→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwRghtTpKindCd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq) |  |
| fn_checkElwKoExerContn | JLDFIL05017C | 1 | elwCheck.xml | 검증/대입 | elwKoExerContn→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwRghtTpKindCd→여럿(dma_RegisterReq/dma_loadListReq) |  |
| fn_checkIsuExp | JLDFIL05012C | 1 | elwCheck.xml | 산술(fn_RmComma 문자열 덧셈 의심) | elwRghtTpKindCd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq), isuExp→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO) |  |
| fn_checkIsuExp | JLDFIL05017C | 1 | elwCheck.xml | 산술(fn_RmComma 문자열 덧셈 의심) | elwRghtTpKindCd→여럿(dma_RegisterReq/dma_loadListReq), isuExp→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO) |  |
| fn_checkLpAdd | JLDFIL05022C | 1 | elw05022.xml | 검증/대입 | lpEndDd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq), lpStrtDd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq), sysdate→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO) | lpEndDd→바인딩 컴포넌트 없음, lpStrtDd→바인딩 컴포넌트 없음 |
| fn_checkLpAdd | JLDFIL05027C | 1 | elw05022.xml | 검증/대입 | lpEndDd→여럿(dma_RegisterReq/dma_loadListReq), lpStrtDd→여럿(dma_RegisterReq/dma_loadListReq), sysdate→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO) | lpEndDd→바인딩 컴포넌트 없음, lpStrtDd→바인딩 컴포넌트 없음 |
| fn_chkElwPrc | JLDFIL05012C | 2 | elw.xml | 중첩 fn_showMsgForRemind |  |  |
| fn_chkElwPrc | JLDFIL05017C | 2 | elw.xml | 중첩 fn_showMsgForRemind |  |  |
| fn_chkSaveElwPrc | JLDFIL05012C | 2 | elw.xml | 검증/대입 | elwExerPrc→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwUlyBasPrc→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO) | elwExerPrc→ipt_elwExerPrc, elwUlyBasPrc→ipt_elwUlyBasPrc |
| fn_chkSaveElwPrc | JLDFIL05013C | 1 | elw.xml | 검증/대입 | elwExerPrc→없음, elwUlyBasPrc→없음 | elwExerPrc→바인딩 컴포넌트 없음, elwUlyBasPrc→바인딩 컴포넌트 없음 |
| fn_chkSaveElwPrc | JLDFIL05014C | 1 | elw.xml | 검증/대입 | elwExerPrc→없음, elwUlyBasPrc→없음 | elwExerPrc→바인딩 컴포넌트 없음, elwUlyBasPrc→바인딩 컴포넌트 없음 |
| fn_chkSaveElwPrc | JLDFIL05015C | 1 | elw.xml | 검증/대입 | elwExerPrc→없음, elwUlyBasPrc→없음 | elwExerPrc→바인딩 컴포넌트 없음, elwUlyBasPrc→바인딩 컴포넌트 없음 |
| fn_chkSaveElwPrc | JLDFIL05017C | 2 | elw.xml | 검증/대입 | elwExerPrc→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwUlyBasPrc→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO) | elwExerPrc→ipt_elwExerPrc, elwUlyBasPrc→ipt_elwUlyBasPrc |
| fn_chkSaveElwPrc | JLDFIL05018C | 1 | elw.xml | 검증/대입 | elwExerPrc→없음, elwUlyBasPrc→없음 | elwExerPrc→바인딩 컴포넌트 없음, elwUlyBasPrc→바인딩 컴포넌트 없음 |
| fn_chkSaveElwPrc | JLDFIL05019C | 1 | elw.xml | 검증/대입 | elwExerPrc→없음, elwUlyBasPrc→없음 | elwExerPrc→바인딩 컴포넌트 없음, elwUlyBasPrc→바인딩 컴포넌트 없음 |
| fn_chkSaveElwPrc | JLDFIL05020C | 1 | elw.xml | 검증/대입 | elwExerPrc→없음, elwUlyBasPrc→없음 | elwExerPrc→바인딩 컴포넌트 없음, elwUlyBasPrc→바인딩 컴포넌트 없음 |
| fn_chkSaveElwPrc | JLDFIL05022C | 1 | elw.xml | 검증/대입 | elwExerPrc→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwUlyBasPrc→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO) | elwExerPrc→ipt_elwExerPrc, elwUlyBasPrc→ipt_elwUlyBasPrc |
| fn_chkSaveElwPrc | JLDFIL05023C | 1 | elw.xml | 검증/대입 | elwExerPrc→없음, elwUlyBasPrc→없음 | elwExerPrc→바인딩 컴포넌트 없음, elwUlyBasPrc→바인딩 컴포넌트 없음 |
| fn_chkSaveElwPrc | JLDFIL05024C | 1 | elw.xml | 검증/대입 | elwExerPrc→없음, elwUlyBasPrc→없음 | elwExerPrc→바인딩 컴포넌트 없음, elwUlyBasPrc→바인딩 컴포넌트 없음 |
| fn_chkSaveElwPrc | JLDFIL05025C | 1 | elw.xml | 검증/대입 | elwExerPrc→없음, elwUlyBasPrc→없음 | elwExerPrc→바인딩 컴포넌트 없음, elwUlyBasPrc→바인딩 컴포넌트 없음 |
| fn_chkSaveElwPrc | JLDFIL05027C | 1 | elw.xml | 검증/대입 | elwExerPrc→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwUlyBasPrc→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO) | elwExerPrc→ipt_elwExerPrc, elwUlyBasPrc→ipt_elwUlyBasPrc |
| fn_chkSaveElwPrc | JLDFIL05028C | 1 | elw.xml | 검증/대입 | elwExerPrc→없음, elwUlyBasPrc→없음 | elwExerPrc→바인딩 컴포넌트 없음, elwUlyBasPrc→바인딩 컴포넌트 없음 |
| fn_chkSaveElwPrc | JLDFIL05029C | 1 | elw.xml | 검증/대입 | elwExerPrc→없음, elwUlyBasPrc→없음 | elwExerPrc→바인딩 컴포넌트 없음, elwUlyBasPrc→바인딩 컴포넌트 없음 |
| fn_chkSaveElwPrc | JLDFIL05030C | 1 | elw.xml | 검증/대입 | elwExerPrc→없음, elwUlyBasPrc→없음 | elwExerPrc→바인딩 컴포넌트 없음, elwUlyBasPrc→바인딩 컴포넌트 없음 |
| fn_clearTransTbl | JLDFIL05011 | 1 | elw.xml | 검증/대입 | transTbl→여럿(dma_ElwDelReq/dma_ElwExcelDownloadReq/dma_ElwExcelUploadPopReq/dma_ElwMstReq) |  |
| fn_clearTransTbl | JLDFIL05016 | 1 | elw.xml | 검증/대입 | transTbl→여럿(dma_ElwDelReq/dma_ElwMstReq/dma_batchElwSubmitPopReq) |  |
| fn_clearTransTbl | JLDFIL05021 | 1 | elw.xml | 검증/대입 | transTbl→여럿(dma_ElwDelReq/dma_ElwMstReq) |  |
| fn_clearTransTbl | JLDFIL05026 | 1 | elw.xml | 검증/대입 | transTbl→여럿(dma_ElwDelReq/dma_ElwMstReq) |  |
| fn_clearTransTbl | JLDFIL05031 | 1 | elw.xml | 검증/대입 | transTbl→여럿(dma_ElwMstReq/dma_ElwPreDataDownloadReq) |  |
| fn_delRow | JLDBNF10000 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF10400 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF15000 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF15100 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF15200 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF15300 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF20000 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF20100 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF20200 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF20300 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF20400 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF25000 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF25100 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF25200 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF25300 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF25400 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF25500 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF25600 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF30001 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF30100 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF40000 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF50001 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF60101 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDBNF60201 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_delRow | JLDINF05400 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_findInvst | JLDFIL71302 | 1 | digital.xml | 동적/DOM |  |  |
| fn_getFileNm | JLDBNF55001 | 9 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_getFileNm | JLDFIL71505C | 10 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_getFileNm | JLDFIL71605C | 10 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_getFileNm | JLDFIL71705C | 10 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_getFileNm | JLDFIL71805C | 10 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_getFileNm1 | JLDBNF90008 | 1 | bnf/fileUpload.xml | 동적/DOM |  |  |
| fn_getFileNmCheck | JLDFIL71302 | 4 | digital.xml | 동적/DOM |  |  |
| fn_issSchdCheckValuesNew | JLDFIL05022C | 1 | elw05022.xml | 검증/대입 | isuSchdlAmt→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq), isuYymm→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq) | isuSchdlAmt→ipt_isuSchdlAmt, isuYymm→ipt_isuYymm |
| fn_minusCheck2 | JLDBNF30002 | 1 | bnf/bondCommon.xml | 검증/대입 |  |  |
| fn_numChkObj | JLDINF10801 | 1 | inf/function.xml | 검증/대입 |  |  |
| fn_objStkStdCd | JLDINF10101 | 1 | inf/function.xml | 동적/DOM |  |  |
| fn_openFeeCalc | JLDBNF00000 | 1 | bnf/bondCommon.xml | 동적/DOM |  |  |
| fn_popupInstCdFirstSearch | JLDINF10105 | 1 | inf/function.xml | 동적/DOM |  |  |
| fn_popupInstCdSearch | JLDINF10101 | 1 | inf/function.xml | 동적/DOM |  |  |
| fn_popupUserGuideJsp | JLDINF00000 | 1 | inf/function.xml | 동적/DOM |  |  |
| fn_setBzCd | JLDFIL05031 | 1 | elw.xml | 검증/대입 | bzCd→여럿(dma_ElwMstReq/dma_ElwPreDataDownloadReq), listBzTpCd→여럿(dma_ElwMstReq/dma_ElwPreDataDownloadReq/dma_readDataVO) |  |
| fn_setElwKoExerContnByRghtTpCd | JLDFIL05012C | 1 | elwCheck.xml | 검증/대입 | elwCompnsRt→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwKoExerContn→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq/dma_readDataVO), elwRghtTpCd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq), elwRghtTpKindCd→여럿(dma_RegisterReq/dma_bzCalndCheckXhrReq/dma_loadListReq) |  |
| fn_setElwKoExerContnByRghtTpCd | JLDFIL05017C | 1 | elwCheck.xml | 검증/대입 | elwCompnsRt→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwKoExerContn→여럿(dma_RegisterReq/dma_loadListReq/dma_readDataVO), elwRghtTpCd→여럿(dma_RegisterReq/dma_loadListReq), elwRghtTpKindCd→여럿(dma_RegisterReq/dma_loadListReq) |  |
| fn_setInputItem | JLDFIL05003C | 1 | prelist05003.xml | 동적/DOM | fsttrmAccOthrCmprIncm→여럿(dma_RegisterReq/dma_readDataVO), fsttrmBfcorptaxNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmBzActivCash→여럿(dma_RegisterReq/dma_readDataVO), fsttrmBzProftAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmBzexcldCost→여럿(dma_RegisterReq/dma_readDataVO), fsttrmBzexcldEarngAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmCap→여럿(dma_RegisterReq/dma_readDataVO), fsttrmCapAdjAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmCapSurplus→여럿(dma_RegisterReq/dma_readDataVO), fsttrmCashIncdecAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmContbzProftAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmCorptax→여럿(dma_RegisterReq/dma_readDataVO), fsttrmCuracntAsstAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmDebtcap→여럿(dma_RegisterReq/dma_readDataVO), fsttrmDepexps→여럿(dma_RegisterReq/dma_readDataVO), fsttrmEpsAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmFixasstAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmFixdebtAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmFncActivCash→여럿(dma_RegisterReq/dma_readDataVO), fsttrmIntCost→여럿(dma_RegisterReq/dma_readDataVO), fsttrmIntEarngAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmIntanasstAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmInventrAsstAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmInvstActivCash→여럿(dma_RegisterReq/dma_readDataVO), fsttrmInvstasstAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmLiquDebtAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmLiquasstAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmMiscFixasstAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmOrdnincmAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmPdendCash→여럿(dma_RegisterReq/dma_readDataVO), fsttrmPdstrtCash→여럿(dma_RegisterReq/dma_readDataVO), fsttrmProftAmtSurplus→여럿(dma_RegisterReq/dma_readDataVO), fsttrmRelcomColtrlsuplyAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmRelcomDebtReqamt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmRelcomLoanAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmRelcomPropayAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmRelcomSaleBndAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmSaleCost→여럿(dma_RegisterReq/dma_readDataVO), fsttrmSaleTotProftAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmSales→여럿(dma_RegisterReq/dma_readDataVO), fsttrmSlmngcost→여럿(dma_RegisterReq/dma_readDataVO), fsttrmSpeclLossAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmSpeclProftAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmSuspnBzPlAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmTanasstAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmTotAsstAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmTotCap→여럿(dma_RegisterReq/dma_readDataVO), fsttrmTotDebtAmt→여럿(dma_RegisterReq/dma_readDataVO), fsttrmTotSaleBndAmt→여럿(dma_RegisterReq/dma_readDataVO), halfBfcorptaxNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), halfBzProftAmt→여럿(dma_RegisterReq/dma_readDataVO), halfBzexcldCost→여럿(dma_RegisterReq/dma_readDataVO), halfBzexcldEarngAmt→여럿(dma_RegisterReq/dma_readDataVO), halfContbzProftAmt→여럿(dma_RegisterReq/dma_readDataVO), halfCorptax→여럿(dma_RegisterReq/dma_readDataVO), halfDepexps→여럿(dma_RegisterReq/dma_readDataVO), halfEpsAmt→여럿(dma_RegisterReq/dma_readDataVO), halfIntCost→여럿(dma_RegisterReq/dma_readDataVO), halfIntEarngAmt→여럿(dma_RegisterReq/dma_readDataVO), halfNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), halfOrdnincmAmt→여럿(dma_RegisterReq/dma_readDataVO), halfSaleCost→여럿(dma_RegisterReq/dma_readDataVO), halfSaleTotProftAmt→여럿(dma_RegisterReq/dma_readDataVO), halfSales→여럿(dma_RegisterReq/dma_readDataVO), halfSlmngcost→여럿(dma_RegisterReq/dma_readDataVO), halfSpeclLossAmt→여럿(dma_RegisterReq/dma_readDataVO), halfSpeclProftAmt→여럿(dma_RegisterReq/dma_readDataVO), halfSuspnBzPlAmt→여럿(dma_RegisterReq/dma_readDataVO), invstgClmTpCd→여럿(dma_RegisterReq/dma_pageContext), scndtrmAccOthrCmprIncm→여럿(dma_RegisterReq/dma_readDataVO), scndtrmBfcorptaxNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmBzActivCash→여럿(dma_RegisterReq/dma_readDataVO), scndtrmBzProftAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmBzexcldCost→여럿(dma_RegisterReq/dma_readDataVO), scndtrmBzexcldEarngAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmCap→여럿(dma_RegisterReq/dma_readDataVO), scndtrmCapAdjAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmCapSurplus→여럿(dma_RegisterReq/dma_readDataVO), scndtrmCashIncdecAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmContbzProftAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmCorptax→여럿(dma_RegisterReq/dma_readDataVO), scndtrmCuracntAsstAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmDebtcap→여럿(dma_RegisterReq/dma_readDataVO), scndtrmDepexps→여럿(dma_RegisterReq/dma_readDataVO), scndtrmEpsAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmFixasstAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmFixdebtAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmFncActivCash→여럿(dma_RegisterReq/dma_readDataVO), scndtrmIntCost→여럿(dma_RegisterReq/dma_readDataVO), scndtrmIntEarngAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmIntanasstAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmInventrAsstAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmInvstActivCash→여럿(dma_RegisterReq/dma_readDataVO), scndtrmInvstasstAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmLiquDebtAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmLiquasstAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmMiscFixasstAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmNetincmAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmOrdnincmAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmPdendCash→여럿(dma_RegisterReq/dma_readDataVO), scndtrmPdstrtCash→여럿(dma_RegisterReq/dma_readDataVO), scndtrmProftAmtSurplus→여럿(dma_RegisterReq/dma_readDataVO), scndtrmRelcomColtrlsuplyAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmRelcomDebtReqamt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmRelcomLoanAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmRelcomPropayAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmRelcomSaleBndAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmSaleCost→여럿(dma_RegisterReq/dma_readDataVO), scndtrmSaleTotProftAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmSales→여럿(dma_RegisterReq/dma_readDataVO), scndtrmSlmngcost→여럿(dma_RegisterReq/dma_readDataVO), scndtrmSpeclLossAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmSpeclProftAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmSuspnBzPlAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmTanasstAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmTotAsstAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmTotCap→여럿(dma_RegisterReq/dma_readDataVO), scndtrmTotDebtAmt→여럿(dma_RegisterReq/dma_readDataVO), scndtrmTotSaleBndAmt→여럿(dma_RegisterReq/dma_readDataVO) |  |
| fn_setMainPage | JLDFIL05011 | 1 | elw.xml | 검증/대입 | bzCd→여럿(dma_ElwDelReq/dma_ElwExcelDownloadReq/dma_ElwExcelUploadPopReq/dma_ElwMstReq), transTbl→여럿(dma_ElwDelReq/dma_ElwExcelDownloadReq/dma_ElwExcelUploadPopReq/dma_ElwMstReq) |  |
| fn_setMainPage | JLDFIL05016 | 1 | elw.xml | 검증/대입 | bzCd→여럿(dma_ElwDelReq/dma_ElwMstReq/dma_batchElwSubmitPopReq/dma_readDataVO), transTbl→여럿(dma_ElwDelReq/dma_ElwMstReq/dma_batchElwSubmitPopReq) |  |
| fn_setMainPage | JLDFIL05021 | 1 | elw.xml | 검증/대입 | bzCd→여럿(dma_ElwDelReq/dma_ElwMstReq), transTbl→여럿(dma_ElwDelReq/dma_ElwMstReq) |  |
| fn_setMainPage | JLDFIL05026 | 1 | elw.xml | 검증/대입 | bzCd→여럿(dma_ElwDelReq/dma_ElwMstReq), transTbl→여럿(dma_ElwDelReq/dma_ElwMstReq) |  |
| fn_setMainPage | JLDFIL05031 | 1 | elw.xml | 검증/대입 | bzCd→여럿(dma_ElwMstReq/dma_ElwPreDataDownloadReq), transTbl→여럿(dma_ElwMstReq/dma_ElwPreDataDownloadReq) |  |
| fn_startBlink | JLDINF00006 | 1 | inf/function.xml | 동적/DOM; 중첩 fn_doBlink |  |  |
| fn_validate | JLDFIL70202C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70203C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70204C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70205C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70302C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70303C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70304C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70305C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70402C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70403C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70404C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70405C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70502C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70503C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70504C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70505C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70802C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70803C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70804C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70805C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70806C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70902C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70903C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70904C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70905C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL70906C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71002C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71003C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71004C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71005C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71006C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71102C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71103C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71104C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71105C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71106C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71502C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71503C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71504C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71505C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71602C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71603C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71604C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71605C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71702C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71703C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71704C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71705C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71802C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71803C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71804C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_validate | JLDFIL71805C | 1 | digitalFormValidate.xml | 동적/DOM; 산술(fn_RmComma 문자열 덧셈 의심); 중첩 fn_checkDate·fn_checkLength |  |  |
| fn_zipCd | JLDINF05400 | 1 | inf/function.xml | 동적/DOM |  |  |
