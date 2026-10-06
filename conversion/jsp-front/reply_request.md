# jsp-front(r13 전환본) 회신 요청 명부 — B 축(회신 의존)

> `python conversion/tools/jspfront_reply_request.py` 가 `ui-tobe` 를 읽어 만든다. 회신이 오면 규칙(convert/vendor_postprocess)에 반영해 전량 재생성한다.

## B-1 컨텍스트 키 — as-is EL 이 서버 렌더로 채우던 값의 출처(회신 A-3)

키 368종 · 화면 522. 근거 열은 화면 안에 같은 이름이 있는 화면 수(조회 전문 후보 / 입력 컴포넌트 후보 / 세션 후보).

| 키 | 화면 수 | dataMap/dataList 같은 이름 | body 컴포넌트 같은 이름 | 세션 키 같은 이름 | 화면(최대 5) |
| --- | ---: | ---: | ---: | ---: | --- |
| `stdCdApctTpCdList` | 27 | 24 | 27 | 0 | jldinf10000, jldinf10100, jldinf10200, jldinf10300, jldinf10400 |
| `isOk` | 25 | 0 | 0 | 0 | jldfil05107, jldfil50000, jldfil50000n, jldfil50100, jldfil50100n |
| `listProcsStatCd` | 23 | 23 | 6 | 0 | jldfil51000_menu, jldfil51000n2_menu, jldfil51000n_menu, jldfil51050, jldfil51050n |
| `cfiCdGroupList` | 21 | 20 | 21 | 0 | jldinf10100, jldinf10200, jldinf10300, jldinf10400, jldinf10500 |
| `fileList` | 21 | 9 | 21 | 0 | jldbnf35001, jldbnf35002, jldbnf35003, jldbnf35004, jldbnf35005 |
| `formKey` | 21 | 10 | 5 | 0 | jldfil00032, jldfil00036, jldfil00050, jldfil00051, jldfil00060 |
| `keyValue` | 21 | 10 | 5 | 0 | jldfil00032, jldfil00036, jldfil00050, jldfil00051, jldfil00060 |
| `page` | 21 | 3 | 20 | 0 | jldinf25000, jldinf25100, jldinf25200, jldinf25300, jldinf25400 |
| `returnKey` | 21 | 10 | 5 | 0 | jldfil00032, jldfil00036, jldfil00050, jldfil00051, jldfil00060 |
| `uploadCode` | 20 | 0 | 0 | 0 | jldfil05014c, jldfil05019c, jldfil05024c, jldfil05029c, jldfil17301 |
| `bndMktactTpCd` | 18 | 18 | 5 | 0 | jldbnf05000, jldbnf05001, jldbnf05101, jldbnf10000, jldbnf10400 |
| `loadTp` | 18 | 8 | 6 | 0 | jldfil05504, jldfil17301, jldfil21212, jldfil50100, jldfil50100n |
| `param.method` | 16 | 16 | 0 | 0 | jldfil00005, jldfil30203, jldinf91000_reportresult, jldinf91100_reportresult, jldinf91200_reportresult |
| `bbsList` | 15 | 0 | 0 | 0 | jldfil51310, jldfil51310n, jldfil51310n2, jldfil51320, jldfil51320n |
| `modifyYn` | 14 | 14 | 3 | 0 | jldfil53100, jldfil53100n, jldfil53200, jldfil53200n, jldfil55100 |
| `feeProcsStatCd` | 13 | 12 | 0 | 0 | jldinf10000, jldinf10100, jldinf10200, jldinf10300, jldinf10400 |
| `result` | 13 | 4 | 9 | 0 | jldinf05800, jldinf20000, jldinf20000p, jldinf30000, jldinf30100 |
| `acntNo` | 12 | 12 | 0 | 0 | jldinf10000, jldinf10100, jldinf10200, jldinf10300, jldinf10400 |
| `applId` | 12 | 12 | 0 | 0 | jldinf10000, jldinf10100, jldinf10200, jldinf10300, jldinf10400 |
| `excelCheckList` | 12 | 12 | 12 | 0 | jldfil70212, jldfil70312, jldfil70412, jldfil70512, jldfil70812 |
| `pageContext.psDepCd` | 12 | 12 | 0 | 0 | jldstf70000, jldstf70010, jldstf71000, jldstf72000, jldstf72020 |
| `pageContext.usrTpCd` | 12 | 12 | 2 | 0 | jldstf70000, jldstf70010, jldstf70030, jldstf71000, jldstf75100 |
| `param.listTpClssCd` | 12 | 12 | 6 | 0 | jldfil51000_menu, jldfil51040, jldfil51040n, jldfil51040n2, jldstf07100_menu |
| `corpUsrTpCd` | 10 | 10 | 1 | 0 | jldfil00018, jldfil30400, jldfil30401, jldfil30402, jldfil30403 |
| `pageContext.ldMktTpCd` | 10 | 10 | 10 | 0 | jldstf70000, jldstf70010, jldstf71000, jldstf72000, jldstf72020 |
| `spotIsuTrdMktTpCd` | 10 | 10 | 4 | 0 | jldfil00018, jldfil10200, jldfil25105, jldfil25106, jldfil25107 |
| `today` | 10 | 9 | 3 | 0 | jldfil05502, jldfil30401, jldfil30402, jldfil30403, jldfil30404 |
| `DST_URL` | 9 | 2 | 0 | 0 | jldfil21000, jldods16520, jldods60001, jldods60101, jldods60301 |
| `param.ldMktTpCd` | 8 | 8 | 8 | 0 | jldfil51000_menu, jldfil51040, jldfil51040n, jldfil51040n2, jldstf07100_menu |
| `param.modifyYn` | 8 | 8 | 0 | 0 | jldfil17301, jldfil51310, jldfil51310n, jldfil51310n2, jldfil57001 |
| `editAvailYn` | 7 | 7 | 5 | 0 | jldfil16403n, jldfil16404n, jldfil16405, jldfil16505, jldfil16506 |
| `message` | 7 | 1 | 0 | 0 | jldbnf00000, jldbnf00600, jldbnf55000, jldbnf90002, jldfil45000 |
| `param.mode` | 7 | 7 | 0 | 0 | uldmgt50201, uldmgt50203, uldmgt50205, uldmgt50207, uldmgt50209 |
| `param.returnKey` | 7 | 7 | 0 | 0 | jldfil00036, jldfil00046, jldfil00051, jldfil00090, jldfil00176 |
| `서버 응답/세션에서 받도록 연결` | 7 | 0 | 0 | 0 | jldstf07090, jldstf07091, jldstf07181, jldstf07304, jldstf07321 |
| `invstgStatCode` | 6 | 6 | 6 | 0 | jlddst71021, jlddst71022, jlddst71023, jlddst71024, jlddst71110 |
| `menuDiv` | 6 | 6 | 6 | 0 | jldfil00021, jldfil00023, jldfil00100, jldfil00200, jldfil00400 |
| `process` | 6 | 6 | 2 | 0 | jldfil55100, jldfil55100n, jldfil55200, jldfil55320, jldfil55320n |
| `resultDiv` | 6 | 6 | 0 | 0 | jldfil00014, jldfil00015, jldfil00053, jldfil10606, jldfil10610 |
| `resultList` | 6 | 0 | 6 | 0 | jldinf05100, jldinf05200, jldinf05300, jldinf15000, jldinf35100 |
| `usrLdMktTpCd` | 6 | 6 | 6 | 0 | jldstf70000, jldstf75100, jldstf75200, jldstf75300, jldstf75500 |
| `errorCode` | 5 | 1 | 0 | 0 | jldbnf00000, jldfil25305, jldfil45000, jldinf00000, jldods10000 |
| `index` | 5 | 3 | 0 | 0 | jlddst50000, jlddst90000, jldods25000, jldods27000, jldods29000 |
| `invstgStatDate` | 5 | 5 | 0 | 0 | jlddst71021, jlddst71022, jlddst71023, jlddst71024, jlddst71110 |
| `isExaService` | 5 | 5 | 1 | 0 | jlddst10400, jlddst50000, jlddst60205, jlddst60206, jlddst90000 |
| `kclicUsrTpId` | 5 | 4 | 1 | 0 | jldods10000, jldods15000, jldods60201, jldods60301, jldods70207 |
| `messageStr` | 5 | 4 | 0 | 0 | jldfil00005, jldfil00012, jldfil00053, jldfil10604, jldods70006_r0 |
| `param.kk` | 5 | 5 | 0 | 0 | jldfil35701, jldfil35702, jldfil35714, jldfil35715, jldfil35716 |
| `param.page` | 5 | 5 | 5 | 0 | jldfil51000_menu, jldfil51000n2_menu, jldfil51000n_menu, jldfil55200n2, jldfil55310n2 |
| `callList` | 4 | 2 | 1 | 0 | jldinf91100, jldinf91100_reportresult, jldinf91101, jldinf91110 |
| `comAttrTpCdList` | 4 | 3 | 4 | 0 | jldinf05000, jldinf05400, jldinf05700, jldinf90701 |
| `contnId` | 4 | 4 | 0 | 0 | jldfil45500, jldods25000, jldods27000, jldods29000 |
| `curDate` | 4 | 4 | 0 | 0 | jldinf05800, jldinf20000, jldinf20000p, jldinf40000 |
| `disableYn` | 4 | 0 | 0 | 0 | jldfil16403, jldfil16403n, jldfil16404, jldfil16404n |
| `isurCd` | 4 | 4 | 0 | 4 | jldfil25106, jldfil25107, jldfil25114, jldfil40202 |
| `listStatCd` | 4 | 4 | 0 | 4 | jldfil25900, jldfil25910, jldfil30200, jldfil30300 |
| `loginFailCnt` | 4 | 0 | 0 | 0 | jldbnf00000, jldfil45000, jldinf00000, jldods10000 |
| `registYn` | 4 | 3 | 0 | 0 | jldfil00005, jldfil00053, jldods70006_r0, jldods70006_r0i0 |
| `status` | 4 | 2 | 0 | 0 | jldstf71000, jldstf76120, jldstf76220, jldstf76320 |
| `sys_today` | 4 | 4 | 0 | 0 | jldinf05001, jldinf11100, jldinf11200, jldinf92600 |
| `transstkAgntCdList` | 4 | 3 | 0 | 0 | jldinf05000, jldinf05400, jldinf05700, jldinf90701 |
| `type` | 4 | 4 | 3 | 0 | jlddst90000, jldfil51000, jldfil51000n, jldfil51000n2 |
| `befLogin` | 3 | 3 | 3 | 0 | jldfil15001, jldfil25300, jldfil25304 |
| `briefDir` | 3 | 0 | 0 | 0 | jldfil15600, jldfil45202, jldfil45203 |
| `corpUserTpCd` | 3 | 3 | 2 | 0 | jldfil16400n, jldfil16403n, jldfil16404n |
| `count` | 3 | 0 | 0 | 0 | jldfil16403, jldfil16403n, jldfil16405 |
| `crtvlList` | 3 | 1 | 1 | 0 | jldinf91100, jldinf91100_reportresult, jldinf91110 |
| `gongMo` | 3 | 3 | 1 | 0 | jldfil51000n2_menu, jldfil51000n_menu, jldfil51010n |
| `lang` | 3 | 3 | 0 | 0 | jldfil20700, jldfil20800, jldfil20900 |
| `lastResvDay` | 3 | 3 | 0 | 0 | jldfil30401, jldfil30403, jldfil30406 |
| `ldMktTpCd` | 3 | 3 | 3 | 0 | jldfil16500, jldfil16501, jldstf70000 |
| `loginYn` | 3 | 3 | 3 | 0 | jldbnf00500, jldbnf00600, jldinf50000 |
| `pageContext.ssMarket` | 3 | 3 | 3 | 0 | jldstf75200, jldstf75500, jldstf75600 |
| `param.corpUsrTpCd` | 3 | 3 | 0 | 0 | jldfil40201, jldfil40203, jldfil40208 |
| `putList` | 3 | 1 | 0 | 0 | jldinf91100, jldinf91101, jldinf91110 |
| `regYn` | 3 | 3 | 0 | 0 | jldfil16403n, jldfil16505, jldfil16509 |
| `repIdYn` | 3 | 3 | 2 | 0 | jldfil50200, jldfil50200_kn, jldfil71401 |
| `sMessage` | 3 | 0 | 0 | 0 | jldfil25200, jldods10010, jldods16010 |
| `sType` | 3 | 0 | 0 | 0 | jldfil25200, jldods10010, jldods16010 |
| `save` | 3 | 0 | 0 | 0 | jldfil51030, jldfil51030n, jldfil51030n2 |
| `saveYN` | 3 | 0 | 0 | 0 | jldfil51060, jldfil51070, jldfil51080 |
| `searchType` | 3 | 3 | 3 | 0 | jlddst00700, jldfil52100, jldfil52101 |
| `ymd` | 3 | 0 | 0 | 0 | jldfil30401, jldfil30403, jldfil30406 |
| `ISREAL` | 2 | 1 | 1 | 0 | jldbnf00000, jldbnf41000 |
| `IsModify` | 2 | 2 | 0 | 0 | jldods70202, jldods70208 |
| `List` | 2 | 2 | 2 | 0 | jldstf30611, jldstf30621 |
| `ahthDdtm` | 2 | 2 | 0 | 0 | jldfil00012, jldfil10604 |
| `ahthKeyNo` | 2 | 2 | 0 | 0 | jldfil00012, jldfil10604 |
| `ahthSvrType` | 2 | 2 | 0 | 0 | jldfil00012, jldfil10604 |
| `alreadySavedYn` | 2 | 0 | 0 | 0 | jldfil53200, jldfil53200n |
| `attachFileList` | 2 | 0 | 2 | 0 | jldfil53100, jldfil53100n |
| `bkHoldyDdIntPayDecsnCdList` | 2 | 1 | 2 | 0 | jldinf10100, jldinf91110 |
| `bndIntPayDdBasTpCdList` | 2 | 1 | 0 | 0 | jldinf10100, jldinf91110 |
| `bndListStatYn` | 2 | 2 | 2 | 0 | jldfil25101, jldfil25105 |
| `bndSaleTpCdList` | 2 | 1 | 1 | 0 | jldinf10100, jldinf91110 |
| `bnd_mktact_tp_cd` | 2 | 0 | 0 | 0 | jldbnf05001, jldbnf05101 |
| `bzProcsNo` | 2 | 2 | 0 | 0 | jldfil54100, jldfil54100n |
| `certiYn` | 2 | 2 | 0 | 0 | jldfil00012, jldfil10604 |
| `certifyYN` | 2 | 2 | 0 | 0 | jldfil00010, jldfil00030 |
| `cfiCdGroupList5` | 2 | 1 | 2 | 0 | jldinf10000, jldinf91010 |
| `cfiCdGroupList6` | 2 | 1 | 0 | 0 | jldinf10000, jldinf91010 |
| `codCapSecuTpList` | 2 | 1 | 0 | 0 | jldinf10100, jldinf91110 |
| `completeYn` | 2 | 2 | 0 | 0 | jldfil55220, jldfil55230 |
| `coupnPayMethdCdList` | 2 | 1 | 2 | 0 | jldinf10100, jldinf91110 |
| `debtRepayRankTpList` | 2 | 1 | 2 | 0 | jldinf10100, jldinf91110 |
| `dutyYn` | 2 | 2 | 0 | 0 | jldfil11050, jldfil11070 |
| `editClassList` | 2 | 2 | 0 | 0 | jldfil00000, jldfil00001 |
| `exmptObjDisclsYn` | 2 | 2 | 0 | 0 | jldfil00005, jldods70006_r0 |
| `flag` | 2 | 2 | 0 | 0 | jldbnf05001, jldbnf10000 |
| `fssFileInfo` | 2 | 0 | 2 | 0 | jldods70202, jldods70208 |
| `gubun` | 2 | 2 | 0 | 0 | jldbnf05008, jldbnf05010 |
| `helpClssId` | 2 | 2 | 0 | 0 | jldfil16300, jldfil16301 |
| `insertComplete` | 2 | 0 | 0 | 0 | jldfil53100, jldfil53100n |
| `insertYn` | 2 | 0 | 0 | 0 | jldstf72020, jldstf73020 |
| `ipt_isurCd` | 2 | 0 | 2 | 0 | jldods60201, jldods60301 |
| `ipt_updateYn` | 2 | 0 | 2 | 0 | jldstf72020, jldstf73020 |
| `isur_cd` | 2 | 0 | 0 | 0 | jldbnf90004, jldinf20000 |
| `j` | 2 | 0 | 1 | 0 | jldfil40204, jldfil40206 |
| `kosreq` | 2 | 2 | 2 | 0 | jlddst00100, jlddst01600 |
| `list_stat_cd` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `mainnumber` | 2 | 0 | 2 | 0 | jldfil00020, jldods70009 |
| `marketType` | 2 | 2 | 2 | 0 | jlddst00000, jlddst05602 |
| `msgStr` | 2 | 2 | 0 | 0 | jldbnf55201, jldinf00009 |
| `noForms` | 2 | 0 | 2 | 0 | uldmgt50008, uldmgt50012 |
| `nowYear` | 2 | 2 | 2 | 0 | jlddst60100, jlddst70300 |
| `param.INIT_READ` | 2 | 2 | 0 | 0 | jldstf30100, jldstf30110 |
| `param.acntcls_tmp` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.bz_reg_no` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.bz_reg_no_p` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.bzcond_contn` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.ceo_nm` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.cntr_nm` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.com_attr_tp_cd` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.corp_reg_no` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.corp_reg_no_p` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.dtl_addr` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.eng_addr` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.eng_dtl_addr` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.formKey` | 2 | 2 | 0 | 0 | jldfil00046, jldods70020 |
| `param.found_dd` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.hpage` | 2 | 2 | 2 | 0 | jldinf05401, jldinf90702 |
| `param.isur_abbrv` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.isur_eng_abbrv` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.isur_eng_nm` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.isur_ind_contn` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.isur_nm` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.lang` | 2 | 2 | 0 | 0 | jldfil00900, jldfil00910 |
| `param.lei_nm` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.listProcsStatCd` | 2 | 2 | 0 | 0 | jldfil05105, jldfil05106 |
| `param.month` | 2 | 2 | 0 | 0 | jldfil35605, jldstf30101 |
| `param.noti_schdl_dd` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.nreg_rsn` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.section` | 2 | 2 | 0 | 0 | jldfil51010, jldstf07110 |
| `param.session_depcd` | 2 | 0 | 0 | 0 | jldstf30100, jldstf30110 |
| `param.tel_no` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.transstk_agnt_cd` | 2 | 0 | 0 | 0 | jldinf05401, jldinf90702 |
| `param.zipcd` | 2 | 2 | 2 | 0 | jldinf05401, jldinf90702 |
| `prtDepoNo` | 2 | 2 | 1 | 0 | jldfil52100, jldfil52101 |
| `pubofrWrtYn` | 2 | 2 | 0 | 0 | jldfil55300, jldfil55300n |
| `qnaList` | 2 | 0 | 0 | 0 | jldfil17301, jldfil17302 |
| `quesCnt` | 2 | 2 | 2 | 0 | jldfil16200, jldfil16201 |
| `resultVo` | 2 | 0 | 2 | 0 | jldfil00173, jldfil01085 |
| `rowCount` | 2 | 2 | 2 | 0 | jldfil05012c, jldfil05022c |
| `speclListTpCd` | 2 | 2 | 2 | 0 | jldfil51010n, jldfil51010n2 |
| `std_cd_grnt_end_dd` | 2 | 0 | 0 | 0 | jldinf20000, jldinf20000p |
| `std_cd_grnt_start_dd` | 2 | 0 | 0 | 0 | jldinf20000, jldinf20000p |
| `submittedDocumentList` | 2 | 1 | 2 | 0 | jldfil45100, jldfil45101 |
| `successYn` | 2 | 2 | 0 | 0 | jldbnf55201, jldinf00009 |
| `tempSaveYn` | 2 | 2 | 2 | 0 | jldfil00020, jldods70009 |
| `totalSize` | 2 | 2 | 2 | 0 | jldstf72000, jldstf73000 |
| `updateComplete` | 2 | 0 | 0 | 0 | jldfil53100, jldfil53100n |
| `uploadCodeFile` | 2 | 0 | 0 | 0 | jldfil05504, jldfil21212 |
| `usrId` | 2 | 2 | 2 | 0 | jldfil45000, jldods10000 |
| `viewYear` | 2 | 0 | 0 | 0 | jlddst60100, jlddst70300 |
| `writingDocumentList` | 2 | 1 | 2 | 0 | jldfil45100, jldfil45101 |
| `DeclPopupYn` | 1 | 1 | 0 | 0 | jldbnf05201 |
| `Item1` | 1 | 0 | 1 | 0 | jldstf30500 |
| `Item2` | 1 | 0 | 1 | 0 | jldstf30500 |
| `Item3` | 1 | 0 | 1 | 0 | jldstf30500 |
| `Item4` | 1 | 0 | 1 | 0 | jldstf30500 |
| `Item5` | 1 | 0 | 1 | 0 | jldstf30500 |
| `Item6` | 1 | 0 | 1 | 0 | jldstf30500 |
| `Item7` | 1 | 0 | 1 | 0 | jldstf30500 |
| `Item8` | 1 | 0 | 1 | 0 | jldstf30500 |
| `ItemA` | 1 | 0 | 1 | 0 | jldstf30500 |
| `ItemC` | 1 | 0 | 1 | 0 | jldstf30500 |
| `ItemD` | 1 | 0 | 1 | 0 | jldstf30500 |
| `MKM_NM` | 1 | 1 | 1 | 0 | jldstf30206 |
| `action_path` | 1 | 1 | 0 | 0 | jldstf10007 |
| `allCnt` | 1 | 0 | 0 | 0 | jldfil25800 |
| `announcementList` | 1 | 0 | 0 | 0 | jldfil45000 |
| `apiYn` | 1 | 1 | 1 | 0 | jldfil51200 |
| `applProcsTpCd` | 1 | 1 | 1 | 0 | jldinf15000 |
| `asstSecutizTpCdList` | 1 | 1 | 0 | 0 | jldinf10100 |
| `attachFileNm1` | 1 | 1 | 1 | 0 | jlddst33011 |
| `attachFileNm2` | 1 | 1 | 1 | 0 | jlddst33011 |
| `attachFileNm3` | 1 | 1 | 1 | 0 | jlddst33011 |
| `attachFileNm4` | 1 | 1 | 1 | 0 | jlddst33011 |
| `attachFileNm5` | 1 | 1 | 1 | 0 | jlddst33011 |
| `attachList2` | 1 | 0 | 0 | 0 | jldfil52101 |
| `attach_file_seq` | 1 | 0 | 0 | 0 | jldfil55400 |
| `audtWrtrptConn` | 1 | 1 | 1 | 0 | jldods60101 |
| `audtWrtrptIndvdl` | 1 | 0 | 1 | 0 | jldods60101 |
| `availableModify` | 1 | 1 | 0 | 0 | jldfil25001 |
| `bdchrgApplStatCd` | 1 | 1 | 0 | 0 | jldbnf55400 |
| `befDocTpCd` | 1 | 0 | 1 | 0 | jldfil45100 |
| `briefList` | 1 | 0 | 0 | 0 | jldfil45202 |
| `c` | 1 | 0 | 1 | 0 | jlddst90000 |
| `certification` | 1 | 1 | 0 | 0 | jldfil25303 |
| `changeCompanyInfo` | 1 | 1 | 0 | 0 | jldfil25002 |
| `checkModifiyDate` | 1 | 1 | 1 | 0 | jldfil25910 |
| `checkPointList` | 1 | 0 | 0 | 0 | jldfil45202 |
| `closeYn` | 1 | 1 | 0 | 0 | jldfil71302 |
| `cntlength` | 1 | 0 | 0 | 0 | jldstf30360 |
| `codeList` | 1 | 0 | 1 | 0 | jldfil01010 |
| `comList` | 1 | 0 | 1 | 0 | jldods70005 |
| `com_nm` | 1 | 0 | 0 | 0 | jldinf20000 |
| `consultVOVal` | 1 | 0 | 0 | 0 | jldfil11010 |
| `contnVal` | 1 | 1 | 0 | 0 | jldfil45500 |
| `corpCode` | 1 | 1 | 0 | 0 | jldfil00045 |
| `corpDisclsChrg4` | 1 | 1 | 1 | 0 | jldfil25108 |
| `corpUsrNm` | 1 | 1 | 1 | 0 | jldfil40201 |
| `corp_usr_tp_cd` | 1 | 0 | 0 | 0 | jldbnf00000 |
| `detail2` | 1 | 1 | 1 | 0 | jlddst90005 |
| `digitalType` | 1 | 1 | 0 | 0 | jldfil00170 |
| `disTypename` | 1 | 0 | 0 | 0 | jlddst00300 |
| `disclsUser` | 1 | 1 | 1 | 0 | jldods16001 |
| `divReckDdTpCdList` | 1 | 0 | 0 | 0 | jldinf10101 |
| `docType` | 1 | 1 | 0 | 0 | jldods70007_2 |
| `dutyTimeYn` | 1 | 0 | 0 | 0 | jldfil11010 |
| `eduCompltAddList` | 1 | 1 | 1 | 0 | jldfil25501 |
| `elwBatchYn` | 1 | 0 | 0 | 0 | jldinf96000 |
| `elwNoticeList1` | 1 | 1 | 1 | 0 | jldfil01060 |
| `elwNoticeList2` | 1 | 1 | 1 | 0 | jldfil01060 |
| `emailChkMsg` | 1 | 0 | 0 | 0 | jldfil40213 |
| `encryp_pw` | 1 | 0 | 0 | 0 | jldbnf00000 |
| `engMandatory1Yn` | 1 | 0 | 0 | 0 | jldfil00014 |
| `entityVal` | 1 | 0 | 1 | 0 | jldfil11010 |
| `estiPrfmList` | 1 | 0 | 1 | 0 | jldfil55300 |
| `etfIdxMktInfo` | 1 | 1 | 1 | 0 | jlddst01401 |
| `etfOvrvw` | 1 | 0 | 1 | 0 | jlddst01401 |
| `etfProdInfo` | 1 | 1 | 0 | 0 | jlddst01401 |
| `etnIdxMktInfo` | 1 | 1 | 1 | 0 | jlddst01411 |
| `etnOvrvw` | 1 | 1 | 1 | 0 | jlddst01411 |
| `etnProdInfo` | 1 | 1 | 0 | 0 | jlddst01411 |
| `etpProdTpCdList` | 1 | 1 | 0 | 0 | jldinf11100 |
| `faqvo[1]` | 1 | 0 | 0 | 0 | jldfil45201 |
| `fileCnt` | 1 | 0 | 0 | 0 | jldfil05506 |
| `formcd` | 1 | 1 | 0 | 0 | jldfil00171 |
| `fsttrmAudtWrtrptConn` | 1 | 1 | 0 | 0 | jldods60101 |
| `fsttrmAudtWrtrptIndvdl` | 1 | 0 | 1 | 0 | jldods60101 |
| `goView` | 1 | 0 | 0 | 0 | jldinf30000 |
| `grnt_fee_procs_cd` | 1 | 0 | 0 | 0 | jldinf50100 |
| `gubunRadio` | 1 | 1 | 0 | 0 | jldinf20000 |
| `idChgApplRsltCd` | 1 | 1 | 0 | 0 | jldbnf55300 |
| `imbdoptCorpbndCd` | 1 | 1 | 1 | 0 | jldbnf05004 |
| `imbdopt_corpbnd_cd` | 1 | 0 | 0 | 0 | jldbnf05004 |
| `initDepCd` | 1 | 0 | 0 | 0 | jldfil16000 |
| `inqOrgnDisclsAcptNo` | 1 | 1 | 0 | 0 | jldods60401_pop |
| `inquiredDisclosureList` | 1 | 0 | 0 | 0 | jldfil45100 |
| `integSrchNo` | 1 | 1 | 1 | 0 | jldstf70010 |
| `integUsrId` | 1 | 1 | 0 | 1 | jldods70009 |
| `integ_usr_id` | 1 | 0 | 0 | 0 | jldbnf00000 |
| `invstgClmTpCd` | 1 | 1 | 1 | 0 | jldfil05003c |
| `ipt_bndMktactTpCd` | 1 | 0 | 1 | 0 | jldbnf90004 |
| `ipt_curSh` | 1 | 0 | 1 | 0 | jldinf40000 |
| `ipt_disTypevalue` | 1 | 0 | 1 | 0 | jlddst00300 |
| `ipt_disclosureType` | 1 | 0 | 1 | 0 | jlddst00300 |
| `ipt_encrypPw` | 1 | 0 | 1 | 0 | jldinf00000 |
| `ipt_integUsrId` | 1 | 0 | 1 | 0 | jldinf00000 |
| `ipt_pageGubun` | 1 | 0 | 1 | 0 | jldods60302 |
| `ipt_scrollLoc` | 1 | 0 | 1 | 0 | jldods60301 |
| `isExaServiced` | 1 | 1 | 0 | 0 | jldods70006 |
| `isFirst` | 1 | 0 | 0 | 0 | jldfil45100 |
| `isLogin` | 1 | 1 | 0 | 0 | jldfil35400 |
| `isMaindoc` | 1 | 0 | 1 | 0 | uldmgt50002 |
| `isPop` | 1 | 1 | 1 | 0 | jldfil15400 |
| `issueDataList` | 1 | 0 | 0 | 0 | jldfil45202 |
| `isur_nm` | 1 | 0 | 0 | 0 | jldinf20000 |
| `item` | 1 | 0 | 0 | 0 | jldbnf35023 |
| `itemSearch` | 1 | 1 | 1 | 0 | jldstf30601 |
| `kosdaqSegment` | 1 | 1 | 1 | 0 | jlddst05602 |
| `kwd` | 1 | 1 | 1 | 0 | jlddst60201 |
| `langTpCd` | 1 | 1 | 1 | 0 | jldfil00044 |
| `language` | 1 | 1 | 0 | 0 | jlddst90002 |
| `lawList` | 1 | 0 | 1 | 0 | jldfil15303 |
| `lawvo[1]` | 1 | 0 | 0 | 0 | jldfil45201 |
| `lawvo[8]` | 1 | 0 | 0 | 0 | jldfil45201 |
| `list` | 1 | 1 | 0 | 0 | jlddst90000 |
| `listCnt` | 1 | 0 | 0 | 0 | jldfil25800 |
| `mailSuc` | 1 | 1 | 0 | 0 | jldods10025 |
| `manualvo[0]` | 1 | 0 | 0 | 0 | jldfil45201 |
| `manualvo[4]` | 1 | 0 | 0 | 0 | jldfil45201 |
| `modYn` | 1 | 1 | 1 | 0 | jlddst90002 |
| `mode` | 1 | 1 | 1 | 0 | uldmgt60102 |
| `modulus` | 1 | 0 | 1 | 0 | jldfil16200 |
| `newYn` | 1 | 1 | 0 | 0 | jldbnf55000 |
| `notiResult` | 1 | 0 | 1 | 0 | jldods15000 |
| `noticeDetail` | 1 | 0 | 0 | 0 | uldmgt76101 |
| `noticeList` | 1 | 0 | 0 | 0 | jldinf00000 |
| `noticePopupList` | 1 | 0 | 1 | 0 | jldinf00000 |
| `nowIndInfo` | 1 | 1 | 0 | 0 | jldods70015 |
| `occsnlDisclsSchedules` | 1 | 0 | 1 | 0 | jldfil45100 |
| `odsDisclsProcsStatCd` | 1 | 1 | 0 | 0 | jldods70009 |
| `packDeclIsurFrn` | 1 | 1 | 1 | 0 | jldbnf90011 |
| `packDeclIsurPriorredmpt` | 1 | 1 | 1 | 0 | jldbnf90004 |
| `pageContext.mktTpCd` | 1 | 1 | 1 | 0 | jldstf76300 |
| `pageContext.svrGubun` | 1 | 1 | 0 | 0 | jlddst90000 |
| `pageContext.usrLdMktTpCd` | 1 | 1 | 1 | 0 | jldstf70030 |
| `pageGubun` | 1 | 1 | 1 | 0 | jldods60302 |
| `param.CONFROOM` | 1 | 1 | 1 | 0 | jldstf30360 |
| `param.applDateYn` | 1 | 1 | 1 | 0 | jldfil25002 |
| `param.bzProcsNo` | 1 | 1 | 1 | 0 | jldfil05106 |
| `param.dtruleLawNo` | 1 | 1 | 1 | 0 | jlddst36910 |
| `param.follwBzProcsNo` | 1 | 1 | 0 | 0 | jldfil05106 |
| `param.keyValue` | 1 | 1 | 1 | 0 | jldods70005 |
| `param.optionType` | 1 | 1 | 1 | 0 | jldinf10102 |
| `param.pubforYn` | 1 | 1 | 1 | 0 | jldstf07301_menu |
| `param.type` | 1 | 1 | 0 | 0 | jldfil21104 |
| `pfOvrvw` | 1 | 1 | 0 | 0 | jlddst01421 |
| `pfProdInfo` | 1 | 1 | 0 | 0 | jlddst01421 |
| `popupResult` | 1 | 0 | 1 | 0 | jldbnf00000 |
| `preKonex` | 1 | 1 | 0 | 0 | jldfil00018 |
| `processingDocumentList` | 1 | 0 | 1 | 0 | jldfil45100 |
| `quotationList` | 1 | 0 | 1 | 0 | jldfil20400 |
| `realInvstgSubmitPermiYn` | 1 | 1 | 0 | 0 | jldfil22100 |
| `regSuc` | 1 | 1 | 0 | 0 | jldods10025 |
| `registerMode` | 1 | 1 | 1 | 0 | jldods70006_r0i0 |
| `regulssClsYn` | 1 | 0 | 0 | 0 | jldfil00000 |
| `relLawList` | 1 | 0 | 0 | 0 | jldods20040 |
| `reservChkList` | 1 | 1 | 1 | 0 | jldfil30408 |
| `returnYn` | 1 | 0 | 0 | 0 | jldinf96000 |
| `reviewYn` | 1 | 1 | 0 | 0 | jldods70006 |
| `rexName` | 1 | 0 | 0 | 0 | jldfil40401 |
| `saleInstId` | 1 | 1 | 0 | 0 | jldbnf50000 |
| `salesInstList` | 1 | 1 | 1 | 0 | jldbnf50000 |
| `schedules` | 1 | 0 | 1 | 0 | jldfil35600_excel |
| `screenDivCd` | 1 | 1 | 0 | 0 | jldbnf90002 |
| `searchRadio` | 1 | 1 | 0 | 0 | jldinf20000 |
| `searchRadio1` | 1 | 0 | 1 | 0 | jldinf20000 |
| `share` | 1 | 0 | 0 | 0 | jldfil16200 |
| `slc_admInstTpCd` | 1 | 0 | 1 | 0 | jldstf70030 |
| `sprtRoomDtl` | 1 | 1 | 0 | 0 | jldods20011 |
| `srchMyWrtrptInfo` | 1 | 0 | 1 | 0 | jldfil25050 |
| `stockDuty` | 1 | 1 | 0 | 0 | jldfil05105 |
| `subcomList` | 1 | 0 | 1 | 0 | jldfil25800 |
| `submitManual` | 1 | 0 | 1 | 0 | jldfil35401 |
| `submitManualClssId` | 1 | 1 | 0 | 0 | jldfil35400 |
| `submitManualList` | 1 | 0 | 1 | 0 | jldfil35400 |
| `svcRunYN` | 1 | 0 | 0 | 0 | jldfil00000 |
| `svrGubun` | 1 | 1 | 1 | 0 | jlddst50000 |
| `sysInfoList` | 1 | 0 | 1 | 0 | jldfil15400 |
| `sys_end_dd` | 1 | 0 | 0 | 0 | jldinf05100 |
| `sys_start_dd` | 1 | 0 | 0 | 0 | jldinf05100 |
| `sysinfovo[0]` | 1 | 0 | 0 | 0 | jldfil45201 |
| `test` | 1 | 1 | 0 | 0 | jlddst90000 |
| `thisMonth` | 1 | 0 | 0 | 0 | jldfil35600 |
| `thisServer` | 1 | 1 | 0 | 0 | jldinf20000 |
| `threePerson` | 1 | 1 | 1 | 0 | jldstf30601 |
| `uploadCodeMovie` | 1 | 0 | 0 | 0 | jldfil05504 |
| `useYn` | 1 | 1 | 1 | 0 | jldfil55400 |
| `usrTpCd` | 1 | 1 | 0 | 0 | jldfil00018 |
| `viewMode` | 1 | 1 | 1 | 0 | uldmgt50303 |
| `votedisclsSubmitprn` | 1 | 0 | 0 | 0 | jldfil25103 |
| `voterghtExerFlag` | 1 | 1 | 1 | 0 | jlddst60203 |
| `waringchVal` | 1 | 1 | 1 | 0 | jldods70012_doc |
| `workExampleList` | 1 | 0 | 0 | 0 | jldfil45202 |
| `zipList` | 1 | 0 | 1 | 0 | jldinf90009 |

## B-2 세션 키 — user-info 응답 계약에 없는 키(회신 11항)

저장소(sample-front·pcc)가 이미 쓰는 키(accessTp, bondYn, depCd, duty, dutyChrg, empNm, empNo, integUsrId, isurCd, jobtitl, js_bond_yn, js_market, listStatCd, market)는 계약에 있는 것으로 보고 뺐다.

| 키 | 화면 수 | 화면(최대 8) |
| --- | ---: | --- |
| `session.user.corpUsrTpCd` | 32 | jldfil00000, jldfil00001, jldfil00010, jldfil00021, jldfil00022, jldfil00027, jldfil00030, jldfil00100 |
| `session.user.usrTpCd` | 25 | jldfil00000, jldfil00001, jldfil00003, jldfil00006, jldfil00010, jldfil00013, jldfil00014, jldfil00015 |
| `session.user.exmptObjDisclsYn` | 8 | jldfil00000, jldfil00001, jldfil00021, jldfil00100, jldfil00200, jldfil00300, jldfil00400, jldods70001 |
| `session.user.sndlocTpCd` | 8 | jldfil00000, jldfil00001, jldfil00021, jldfil00022, jldfil00023, jldfil00027, jldfil00400, jldods70001 |
| `session.user.dutyGrpTpCd` | 6 | jldfil00000, jldfil00004, jldfil00014, jldfil00021, jldfil00400, jldfil45100 |
| `session.user.kclicUsrTpId` | 5 | jldods15000, jldods16001, jldods17010, jldods70009, jldods70012 |
| `session.user.usrId` | 5 | jldfil17302, jldfil50100, jldfil71302, jldods17000, jldods70009 |
| `session.user.repIdYn` | 2 | jldfil59400, jldfil71302 |
| `session.user.upDepCd` | 2 | jldfil11050, jldfil11070 |

## B-3 이동 목적지 — 공급사 드러냄 래퍼가 남은 자리(회신 A-15)

내부 `.xml` 리터럴로 정해지는 자리는 V32 가 이미 걷었다. 남은 것은 아래 종류별이다.

### .do(JSP 액션 — 화면 HTML 인지 JSON 인지) — 자리 86 · 대상 63종

| 대상 | 화면 수 | 화면(최대 6) |
| --- | ---: | --- |
| `/ods/sprtroom.do` | 5 | jldstf76100, jldstf76200, jldstf76210, jldstf76220, jldstf76300 |
| `/filing/systemInfo.do` | 3 | uldmgt50302, uldmgt50304, uldmgt50306 |
| `/ods/integsrch.do` | 3 | jldstf70000, jldstf70010, jldstf75300 |
| `/outer/faq.do` | 3 | jldfil40100, jldfil40105, jldfil40110 |
| `/submission/disclosure.do` | 3 | jldods60401_pop, jldods70002, jldods70012 |
| `/submission/disclosureView.do` | 3 | jldfil10000, jldfil35604, jldfil45502 |
| `/common/corpList.do` | 2 | jlddst00303, jlddst01000 |
| `/discls/sample.do` | 2 | jldods70002, jldods70006 |
| `/filing/editClass.do` | 2 | uldmgt50208, uldmgt50210 |
| `/filing/findForm.do` | 2 | uldmgt50000, uldmgt50002 |
| `/listInvstg/newListStkcertIsuStatDtl.do` | 2 | jldfil55300, jldfil55300n |
| `/listinvstg/pubofrprogcomdetail.do` | 2 | jlddst72000, jlddst72100 |
| `/ods/integsrchBase.do` | 2 | jldstf72000, jldstf73000 |
| `/outer/disclsSchdl.do` | 2 | jldfil25502, jldfil45000 |
| `/outer/register.do` | 2 | jldfil40200, jldfil45000 |
| `/PersonInfo.do` | 1 | jldstf30601 |
| `/common/disclsviewer.do` | 1 | jlddst60200 |
| `/common/leadcomList.do` | 1 | jldfil40201 |
| `/common/reportname.do` | 1 | jlddst01600 |
| `/company/linkDisclsAppl.do` | 1 | jldfil21100 |
| `/compfinance/financialinfo.do` | 1 | jlddst15400 |
| `/corpgeneral/listedissuestatusdetail.do` | 1 | jlddst05000 |
| `/digital/digitalCorpList.do` | 1 | jlddst60200 |
| `/disclosure/marketcalendar.do` | 1 | jlddst70300 |
| `/disclosure/rsstodaydistribute.do` | 1 | jlddst00000 |
| `/discls/dsReport.do` | 1 | jldods60401_pop |
| `/discls/searchDisclosureDocument.do` | 1 | jldods70006 |
| `/filing/byauthForm.do` | 1 | uldmgt50400 |
| `/filing/extractElement.do` | 1 | uldmgt50101 |
| `/filing/formProcess.do` | 1 | uldmgt50206 |
| `/filing/formUpclass.do` | 1 | uldmgt50200 |
| `/filing/fssForm.do` | 1 | uldmgt50000 |
| `/filing/helpFaq.do` | 1 | uldmgt50306 |
| `/filing/helpManual.do` | 1 | uldmgt50304 |
| `/filing/kclicFaq.do` | 1 | uldmgt50320 |
| `/filing/onlineDisclosureLaw.do` | 1 | uldmgt50316 |
| `/filing/reasonClass.do` | 1 | uldmgt50202 |
| `/filing/typeClass.do` | 1 | uldmgt50204 |
| `/filing/updateByformApproval.do` | 1 | uldmgt50002 |
| `/filing/updateByformAttach.do` | 1 | uldmgt50002 |
| `/filing/updateByformAuth.do` | 1 | uldmgt50002 |
| `/filing/updateByformEditClass.do` | 1 | uldmgt50002 |
| `/filing/updateByformProcess.do` | 1 | uldmgt50002 |
| `/filing/updateByformType.do` | 1 | uldmgt50002 |
| `/filing/updateDisclosureLaw.do` | 1 | uldmgt50300 |
| `/filing/updateForm.do` | 1 | uldmgt50002 |
| `/filing/updateFormForm.do` | 1 | uldmgt50002 |
| `/filing/updateHelpFaq.do` | 1 | uldmgt50306 |
| `/filing/updateHelpManual.do` | 1 | uldmgt50304 |
| `/filing/updateKclicFaq.do` | 1 | uldmgt50320 |
| `/filing/updateNotice.do` | 1 | uldmgt76100 |
| `/filing/updateSystemInfo.do` | 1 | uldmgt50302 |
| `/investwarn/investattentLargeShareChange.do` | 1 | jlddst30302 |
| `/issue/smsSend.do` | 1 | jldfil30702 |
| `/listInvstg/pipeline.do` | 1 | jldfil55300 |
| `/listbloc/blocListing.do` | 1 | jldbnf10000 |
| `/listinvstg/advserlistbrokerbylistcom.do` | 1 | jlddst74600 |
| `/listinvstg/listapplcom.do` | 1 | jlddst71100 |
| `/listinvstg/listbrokerbylistcom.do` | 1 | jlddst74500 |
| `/listinvstg/listinvstgcom.do` | 1 | jlddst71000 |
| `/stdcd/batchScdapl.do` | 1 | jldinf11000 |
| `/submission/searchDisclosureDocument.do` | 1 | jldfil00007_eng |
| `/submission/voterghtExerDisclsCorpList.do` | 1 | jldfil00120 |

### 미상(변수 — 리터럴 대입 없음) — 자리 24 · 대상 16종

| 대상 | 화면 수 | 화면(최대 6) |
| --- | ---: | --- |
| `strPageURL` | 4 | jldbnf00000, jlddst10000, jlddst10200, jldinf00000 |
| `pageURL` | 3 | jldods70002, jldods70012, jldods70012_admin |
| `url` | 3 | jlddst05800, jlddst90005, jldstf30006 |
| `wUrl` | 2 | jlddst00402, jlddst00406 |
| `"./JLDSTF10004_1.jsp?AcptNo=" + sAcptNo + "&gAccssAuthTpCd=" + gAccssAuthTpCd + "&gAskScrenID=" + gAskScrenID` | 1 | jldstf10004 |
| `"/lstproc/" + pageNM + ".gfm"` | 1 | jldstf05005 |
| `"/sprtroom/schedule.do?method=findDisclosureSchedule1&calndDd=" + ipt_calndDd + "&byddSeq=" + ipt_byddSeq + ""` | 1 | jldods16500 |
| `"/sprtroom/schedule.do?method=findDisclosureSchedule2&acptNo=" + ipt_acptNo + "&schdlAdmItmTpCd=" + ipt_schdlAdmItmTpCd + "&byddSeq=" + ipt_byddSeq + ""` | 1 | jldods16500 |
| `"https://" + serverDiv + "bonds.krx.co.kr/doc/frn_template.xls"` | 1 | jldbnf90008 |
| `'/corpgeneral/irschedule.do?method=searchIRSchedulePopup&irSeq=' + val` | 1 | jlddst05601 |
| `'microsoft-edge:' + scwin.dsclViewerUrl` | 1 | jldstf10002 |
| `dAction` | 1 | jldods15000 |
| `scwin.gUrl` | 1 | jldstf10002 |
| `selfVar.value` | 1 | jlddst90000 |
| `sprtRoomContn` | 1 | jldods29010 |
| `sprt_room_contn` | 1 | jldods26000 |

### 조립 전 빈 문자열 — 자리 13 · 대상 4종

| 대상 | 화면 수 | 화면(최대 6) |
| --- | ---: | --- |
| `url` | 7 | jldbnf00000, jldbnf05000, jldbnf60100, jldfil21000, jldfil55320, jldfil55320n |
| `dAction` | 2 | jldods15000, jldods70003 |
| `listCalcRuleURL` | 2 | jldfil35700_pop, jldfil35700c |
| `tmp` | 2 | jldfil45000, jldfil45100 |

### 기타 — 자리 12 · 대상 2종

| 대상 | 화면 수 | 화면(최대 6) |
| --- | ---: | --- |
| `/` | 9 | jldfil35300, jldfil40201, jldfil40203, jldfil40204, jldfil40205, jldfil40206 |
| `about:blank` | 3 | uldmgt50100, uldmgt50104, uldmgt50310 |

### .jsp/.gfm(전환 범위 확인) — 자리 6 · 대상 6종

| 대상 | 화면 수 | 화면(최대 6) |
| --- | ---: | --- |
| `/common/dividend_pop.jsp` | 1 | jlddst50000 |
| `/filing/form/ULDMGT50012_i0.jsp` | 1 | uldmgt50011 |
| `/filing/form/multiFile_Load.jsp` | 1 | uldmgt50000 |
| `/issueinfo/ULDSTF71004.gfm` | 1 | jldcom91000 |
| `/lstinvstg/ULDSTF07406.gfm` | 1 | jldstf07401 |
| `/main/pop_telno.jsp` | 1 | jldfil45000 |

### 외부 주소(openExternalPage 후보) — 자리 4 · 대상 4종

| 대상 | 화면 수 | 화면(최대 6) |
| --- | ---: | --- |
| `http://` | 1 | jlddst20011 |
| `http://idev-kind.krx.co.kr` | 1 | jldfil45000 |
| `http://idev-kind.krx.co.kr/ifrsapplsvc/qna.do?method=searchQnAMain` | 1 | jldfil45000 |
| `kakaolink://sendurl?msg=` | 1 | jlddst60200 |

## B-4 제출 주소(action) — 자기 화면 제출의 목적지를 못 정한 자리

| action | 화면 수 | 화면(최대 6) |
| --- | ---: | --- |
| `self_submit:tx_fn_List_xhr` | 15 | uldmgt50100, uldmgt50200, uldmgt50202, uldmgt50204, uldmgt50206, uldmgt50208 |
| `self_submit:tx_fn_PrelistPageSearch` | 12 | jldfil51010, jldfil51010n, jldfil51010n2, jldfil51020, jldfil51020n, jldfil51020n2 |
| `self_submit:tx_fn_Delete_xhr` | 10 | uldmgt50200, uldmgt50202, uldmgt50204, uldmgt50206, uldmgt50208, uldmgt50210 |
| `self_submit:tx_fn_CheckCode_xhr` | 6 | uldmgt50201, uldmgt50203, uldmgt50205, uldmgt50207, uldmgt50209, uldmgt50211 |
| `bbs.do` | 3 | jldstf07230, jldstf07231, jldstf07232 |
| `eduChrgStaff.do` | 3 | jldfil16507, jldfil16508, jldfil16510 |
| `eduRspnStaff.do` | 3 | jldfil16507, jldfil16508, jldfil16509 |
| `null` | 3 | jlddst36500, jlddst37004, jlddst37005 |
| `self_submit:tx_fn_findSchedules_xhr` | 3 | jldfil30800, jldfil30801, jldfil35600 |
| `self_submit:tx_fn_searchList` | 3 | jldfil10000, jldfil30105c, jldfil45502 |
| `self_submit:tx_list_xhr` | 3 | uldmgt50000, uldmgt50011, uldmgt50600 |
| `disclosureCommon.do` | 2 | jldods70005, jldods70006 |
| `educationStaff.do` | 2 | jldfil16507, jldfil16508 |
| `self_submit:sbm_trs_Save` | 2 | jldbns30000, jldstf30006 |
| `self_submit:tx_doProcs_xhr` | 2 | jldstf07220, jldstf07410 |
| `self_submit:tx_findContent_xhr` | 2 | uldmgt50002, uldmgt50400 |
| `self_submit:tx_findRsnClasses_xhr` | 2 | uldmgt50001, uldmgt50003 |
| `self_submit:tx_fn_Cal1` | 2 | jldstf31200, jldstf32200 |
| `self_submit:tx_fn_Cal10` | 2 | jldstf31203, jldstf32203 |
| `self_submit:tx_fn_Cal11` | 2 | jldstf31203, jldstf32203 |
| `self_submit:tx_fn_Cal12` | 2 | jldstf31203, jldstf32203 |
| `self_submit:tx_fn_Cal13` | 2 | jldstf31204, jldstf32204 |
| `self_submit:tx_fn_Cal14` | 2 | jldstf31205, jldstf32205 |
| `self_submit:tx_fn_Cal15` | 2 | jldstf31205, jldstf32205 |
| `self_submit:tx_fn_Cal16` | 2 | jldstf31206, jldstf32206 |
| `self_submit:tx_fn_Cal17` | 2 | jldstf31206, jldstf32206 |
| `self_submit:tx_fn_Cal2` | 2 | jldstf31201, jldstf32201 |
| `self_submit:tx_fn_Cal4` | 2 | jldstf31202, jldstf32202 |
| `self_submit:tx_fn_Cal5` | 2 | jldstf31202, jldstf32202 |
| `self_submit:tx_fn_Cal6` | 2 | jldstf31202, jldstf32202 |
| `self_submit:tx_fn_Cal7` | 2 | jldstf31202, jldstf32202 |
| `self_submit:tx_fn_Cal8` | 2 | jldstf31202, jldstf32202 |
| `self_submit:tx_fn_Calc_xhr` | 2 | jldstf31207, jldstf31208 |
| `self_submit:tx_fn_ExcelDown_xhr` | 2 | jldstf31207, jldstf31209 |
| `self_submit:tx_fn_GetLawDtruleItemContents_xhr` | 2 | jlddst36910, jldfil15302 |
| `self_submit:tx_fn_GetLawItemContents_xhr` | 2 | jlddst36910, jldfil15302 |
| `self_submit:tx_fn_Search_xhr` | 2 | uldmgt50006, uldmgt50009 |
| `self_submit:tx_fn_ViewSysInfo_xhr` | 2 | jlddst35400, jldfil15400 |
| `self_submit:tx_fn_bzCalndCheck_xhr` | 2 | jldfil05012c, jldfil05022c |
| `self_submit:tx_fn_chkChrgWork_xhr` | 2 | jldfil30700, jldfil45100 |
| `self_submit:tx_fn_isuSubmit_xhr` | 2 | jldfil00010, jldfil00030 |
| `self_submit:tx_fn_replaceFormForm_xhr` | 2 | uldmgt50002, uldmgt50600 |
| `self_submit:tx_fn_restoreFormForm_xhr` | 2 | uldmgt50002, uldmgt50600 |
| `self_submit:tx_getChrgList_xhr` | 2 | jldfil40203, jldfil40208 |
| `self_submit:tx_init_xhr` | 2 | jldstf31207, jldstf31208 |
| `self_submit:tx_showDetail_xhr` | 2 | jldfil16000, jldfil73000 |
| `../ajax/chg_int_data.jsp` | 1 | jldbnf05007 |
| `../ajax/exer_dd_data.jsp?OPTDIV=` | 1 | jldbnf05004 |
| `../ajax/exer_prc_data.jsp` | 1 | jldbnf05006 |
| `../ajax/frn_combo_data.jsp` | 1 | jldbnf05007 |
| `../ajax/princ_int_cnt_data.jsp` | 1 | jldbnf05011 |
| `../ajax/princ_int_data.jsp` | 1 | jldbnf05011 |
| `../ajax/split_redmpt_data.jsp` | 1 | jldbnf05008 |
| `DisclosureBriefPreview.do` | 1 | jldstf30501 |
| `PersonInfo.do` | 1 | jldstf30692 |
| `disclosure.do?method=reviewSendInfo` | 1 | jldods70006 |
| `eduManagement.do` | 1 | jldfil16500 |
| `pop_emergency.jsp` | 1 | jldbnf00000 |
| `pop_emergency_01.jsp` | 1 | jldbnf00000 |
| `pop_emergency_list.jsp` | 1 | jldbnf00000 |
| `pop_emergency_nprotect.jsp` | 1 | jldbnf00000 |
| `pop_emergency_tls.jsp` | 1 | jldbnf00000 |
| `sample.do` | 1 | jldods70008 |
| `self_submit:tx_addAuthForm_xhr` | 1 | uldmgt50400 |
| `self_submit:tx_afterExce_xhr` | 1 | jldstf31207 |
| `self_submit:tx_callProcessCalculateRelatedDisclosure9ToExcel_xhr` | 1 | jldstf31203 |
| `self_submit:tx_callProcessCalculateRelatedDisclosure9_xhr` | 1 | jldstf31203 |
| `self_submit:tx_delAuthForm_xhr` | 1 | uldmgt50400 |
| `self_submit:tx_downEditClass_xhr` | 1 | uldmgt50002 |
| `self_submit:tx_findAuthForm_xhr` | 1 | uldmgt50400 |
| `self_submit:tx_findAuthUser_xhr` | 1 | uldmgt50400 |
| `self_submit:tx_findDetailLaw_xhr` | 1 | uldmgt50309 |
| `self_submit:tx_findEditMidclasses_xhr` | 1 | uldmgt50007 |
| `self_submit:tx_findFormList_xhr` | 1 | uldmgt50400 |
| `self_submit:tx_findMainLaw_xhr` | 1 | uldmgt50309 |
| `self_submit:tx_findTypeTpClsses_xhr` | 1 | uldmgt50017 |
| `self_submit:tx_fnSubmit` | 1 | jldinf05900 |
| `self_submit:tx_fn_AddFavorite_xhr` | 1 | jldfil35400 |
| `self_submit:tx_fn_Cal3` | 1 | jldstf31202 |
| `self_submit:tx_fn_Cal9` | 1 | jldstf32203 |
| `self_submit:tx_fn_Cal_xhr` | 1 | jldstf31209 |
| `self_submit:tx_fn_ChangeUsrId_xhr` | 1 | jldfil45300 |
| `self_submit:tx_fn_Confirm_xhr` | 1 | jldfil40400 |
| `self_submit:tx_fn_DelDetail_xhr` | 1 | uldmgt50316 |
| `self_submit:tx_fn_DelDisclosureLaw_xhr` | 1 | uldmgt50300 |
| `self_submit:tx_fn_DeleteFavorite_xhr` | 1 | jldfil35400 |
| `self_submit:tx_fn_DetailList_xhr` | 1 | uldmgt50316 |
| `self_submit:tx_fn_Down_xhr` | 1 | uldmgt50210 |
| `self_submit:tx_fn_ElementList_xhr` | 1 | uldmgt50101 |
| `self_submit:tx_fn_GetFavorite_xhr` | 1 | jldfil35400 |
| `self_submit:tx_fn_LawAll_xhr` | 1 | uldmgt50308 |
| `self_submit:tx_fn_LoadNfaithDesignAdvnoti_xhr` | 1 | jldfil10200 |
| `self_submit:tx_fn_LoadNfaithDesign_xhr` | 1 | jldfil10200 |
| `self_submit:tx_fn_PopDelAttach_xhr` | 1 | uldmgt50002 |
| `self_submit:tx_fn_PopDelByformApproval_xhr` | 1 | uldmgt50002 |
| `self_submit:tx_fn_PopDelByformAuth_xhr` | 1 | uldmgt50002 |
| `self_submit:tx_fn_PopDelByformType_xhr` | 1 | uldmgt50002 |
| `self_submit:tx_fn_PopDelEditor_xhr` | 1 | uldmgt50002 |
| `self_submit:tx_fn_PopDelForm_xhr` | 1 | uldmgt50002 |
| `self_submit:tx_fn_PopDelLibrary_xhr` | 1 | uldmgt50002 |
| `self_submit:tx_fn_PopDelProcess_xhr` | 1 | uldmgt50002 |
| `self_submit:tx_fn_Search` | 1 | jldfil05039 |
| `self_submit:tx_fn_Up_xhr` | 1 | uldmgt50210 |
| `self_submit:tx_fn_ViewContents_xhr` | 1 | jldfil25400 |
| `self_submit:tx_fn_ViewSubmitManual_xhr` | 1 | jldfil35400 |
| `self_submit:tx_fn_excel` | 1 | jldfil05039 |
| `self_submit:tx_fn_existYn_xhr` | 1 | jldfil25720 |
| `self_submit:tx_fn_search` | 1 | jldods70015 |
| `self_submit:tx_preDataCheckValues_xhr` | 1 | jldbnf05001 |
| `self_submit:tx_script_MxDataSet_code1` | 1 | jldmgt90400 |
| `self_submit:tx_setFormVer_xhr` | 1 | uldmgt50001 |
| `self_submit:tx_setRecentVersionInfo_xhr` | 1 | uldmgt50001 |
| `self_submit:tx_test_xhr` | 1 | jldstf31200 |
| `self_submit:tx_upEditClass_xhr` | 1 | uldmgt50002 |
| `self_submit:tx_view_xhr` | 1 | jldfil00900 |

## B-5 보낼 입력값(query_param) — as-is 가 URL 에 싣던 값을 정적으로 못 읽은 자리

`SCREN_PROCES_TP_CD`·`SCREN_ID`·`DEP_CD`·`MKT_ID`·`INTEG_USR_ID` 는 화면 상수(V26)·`scwin.screenId`·세션 키로 채울 수 있는 후보다 — 통신별 처리구분 값만 확정하면 된다.

| 키 | 화면 수 | 화면(최대 8) |
| --- | ---: | --- |
| `SCREN_PROCES_TP_CD` | 38 | jldstf05005, jldstf07090, jldstf07091, jldstf07170, jldstf07171, jldstf07180, jldstf07181, jldstf07200 |
| `SCREN_ID` | 12 | jldstf07170, jldstf07180, jldstf07200, jldstf07210, jldstf07220, jldstf07230, jldstf07300, jldstf07310 |
| `LD_MKT_TP` | 10 | jldstf07170, jldstf07180, jldstf07200, jldstf07210, jldstf07220, jldstf07230, jldstf07310, jldstf07320 |
| `COM_NM` | 7 | jldstf07170, jldstf07180, jldstf07300, jldstf07310, jldstf07320, jldstf07330, jldstf07400 |
| `ISUR_CD` | 7 | jldcom91000, jldstf05005, jldstf07181, jldstf07321, jldstf08051, jldstf30001, jldstf30012 |
| `BZ_PROCS_NO` | 6 | jldstf07171, jldstf07181, jldstf07301, jldstf07311, jldstf07321, jldstf07401 |
| `DEP_CD` | 6 | jldstf10100, jldstf11100, jldstf30006, jldstf30013, jldstf31000, jldstf31010 |
| `BILL_SUBMIT_END_DD` | 5 | jldstf07170, jldstf07180, jldstf07300, jldstf07310, jldstf07320 |
| `BILL_SUBMIT_STRT_DD` | 5 | jldstf07170, jldstf07180, jldstf07300, jldstf07310, jldstf07320 |
| `BBS_TP_CD` | 4 | jldstf07200, jldstf07210, jldstf07220, jldstf07230 |
| `DIV_IDX` | 4 | jldstf05005, jldstf07181, jldstf07321, jldstf08051 |
| `EMP_NO` | 3 | jldstf10100, jldstf11100, jldstf30013 |
| `INTEG_USR_ID` | 3 | jldstf07341, jldstf30001, jldstf30012 |
| `MKT_ID` | 3 | jldstf30006, jldstf31000, jldstf31010 |
| `ACPT_DATE` | 2 | jldstf10100, jldstf11100 |
| `BYDD_SEQ` | 2 | jldstf30001, jldstf30012 |
| `ChrgEmpNo` | 2 | jldstf31000, jldstf31010 |
| `DISCLS_SCHDL_ADM_DD` | 2 | jldstf30001, jldstf30012 |
| `EDate` | 2 | jldstf31000, jldstf31010 |
| `END_DD` | 2 | jldstf07330, jldstf07400 |
| `EmpNo` | 2 | jldstf31000, jldstf31010 |
| `GDUTY` | 2 | jldstf31000, jldstf31010 |
| `LIST_DD` | 2 | jldstf07181, jldstf07321 |
| `MKT_TP_CD` | 2 | jldstf30001, jldstf30012 |
| `SDate` | 2 | jldstf31000, jldstf31010 |
| `STAT_00` | 2 | jldstf10100, jldstf11100 |
| `STAT_01` | 2 | jldstf10100, jldstf11100 |
| `STAT_02` | 2 | jldstf10100, jldstf11100 |
| `STAT_10` | 2 | jldstf10100, jldstf11100 |
| `STAT_20` | 2 | jldstf10100, jldstf11100 |
| `STAT_30` | 2 | jldstf10100, jldstf11100 |
| `STAT_40` | 2 | jldstf10100, jldstf11100 |
| `STAT_REG` | 2 | jldstf10100, jldstf11100 |
| `STRT_DD` | 2 | jldstf07330, jldstf07400 |
| `TEAM_ID` | 2 | jldstf31000, jldstf31010 |
| `UP_DEP_CD` | 2 | jldstf10100, jldstf11100 |
| `ADM_BAS_TP_CD` | 1 | jldstf30006 |
| `AFF_STAT_00` | 1 | jldstf11100 |
| `AFF_STAT_01` | 1 | jldstf11100 |
| `AFF_STAT_10` | 1 | jldstf11100 |
| `AFF_STAT_20` | 1 | jldstf11100 |
| `AFF_STAT_30` | 1 | jldstf11100 |
| `AFF_STAT_40` | 1 | jldstf11100 |
| `ANS_CONTN_ID` | 1 | jldstf07200 |
| `BAS_YY` | 1 | jldstf07405 |
| `BOND_YN` | 1 | jldcom91000 |
| `CHRG_NM` | 1 | jldstf07403 |
| `Condition1` | 1 | jldmgt90400 |
| `DELETE` | 1 | jldstf30006 |
| `DEL_EMP_NO` | 1 | jldstf31000 |
| `DEPT_CD` | 1 | jldstf90500 |
| `E_DATE` | 1 | jldstf05005 |
| `FORM_CD` | 1 | jldstf30006 |
| `FORM_KOR_NM` | 1 | jldstf30006 |
| `GUBUN` | 1 | jldstf30013 |
| `GUBUN_CD` | 1 | jldstf08051 |
| `ISU_CD` | 1 | jldstf08051 |
| `JOB_TITL` | 1 | jldstf30013 |
| `LD_MKT_TP_CD` | 1 | jldstf30013 |
| `LEADCOM_MBR_NO` | 1 | jldstf07340 |
| `LIST_PROCS_STAT` | 1 | jldstf07400 |
| `LIST_TP_CLSS_CD` | 1 | jldstf07300 |
| `NOTI_SVC_SEQ` | 1 | jldstf90500 |
| `RSN_CLSS_CD` | 1 | jldstf10100 |
| `SCHDL_ADM_ITM_TP_NM` | 1 | jldstf30006 |
| `SECUGRP_ID` | 1 | jldstf05005 |
| `SEQ` | 1 | jldstf31000 |
| `SKIL_VALU_PROG_STAT_CD` | 1 | jldstf07400 |
| `SMS_TRNSM_YN` | 1 | jldstf30006 |
| `SPECY_VALU_INST_CD` | 1 | jldstf07403 |
| `SPOT_ISU_TRD_MKT_TP_CD` | 1 | jldstf05005 |
| `STAT_35` | 1 | jldstf11100 |
| `SUBMIT_SYS_USE_YN` | 1 | jldstf30006 |
| `S_DATE` | 1 | jldstf05005 |
| `TRS_IDX` | 1 | jldstf08051 |
| `USE_YN` | 1 | jldstf30006 |
| `USR_ID` | 1 | jldstf90500 |
| `YYYYMM` | 1 | jldstf31000 |
| `ipt_keyword` | 1 | jldmgt90400 |
| `{P}BZ_PROCS_NO` | 1 | jldstf07401 |
| `{P}V_BZ_PROCS_NO` | 1 | jldstf07181 |
