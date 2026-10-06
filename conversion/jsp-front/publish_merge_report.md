# 퍼블리싱 병합 리포트 (publish ↔ 공급사 전환본)

> `jspfront_pipeline.py` 가 화면마다 병합(5b 단계)하며 행을 갱신한다(승격 2026-10-06 뒤 ui-tobe 가 병합 결과). `auto` 는 전부 이은 것, `todo` 는 본문에 `TODO Stage2(퍼블리싱 병합)` 표지가 있는 것, `manual` 은 `publish_merge_overrides.json` 지시로 닫은 것, `frozen` 은 손으로 고친 ui-tobe 파일(재생성 건너뜀), `review` 는 참조를 못 채웠거나 퍼블리싱 본문이 비어 있는 것, `mismatch` 는 지시 `skip`(다른 화면/빈 자리표).

화면 260 · auto 79 · todo 151(표지 1576건) · manual(override) 3 · frozen(손작업 정본) 19 · review 0 · mismatch(override skip) 8 · error 0

| 화면 | 판정 | 정합/퍼블리싱 항목 | TODO | 스크립트 참조 누락 | 공급사 미대응(옮겨 넣음) | 메모 |
| --- | --- | ---: | ---: | --- | --- | --- |
| jldfil00000 | todo | 6/9 | 12 |  | trigger:icon:guide#1(img_97); trigger:icon:download(img_108); select:#1(ipt_allEdit); select:#2(ipt_editClass) | 버튼 'trigger:조회#1' ← 공급사 'trigger:icon:search#1'(img_122, 같은 뜻); 버튼 'trigger:조회#2' ← 공급사 'trigger:icon:search#2'(img_236, 같은 뜻); 퍼블리싱 전용 버튼 '도움말'(공통 처리 대상); 공급사 trigger:icon:guide#1(img_97) 옮겨 넣음(TODO) |
| jldfil00001 | todo | 5/9 | 14 |  | trigger:icon:guide#1(img_90); trigger:icon:download(img_101); select:#1(ipt_allEdit); select:#2(ipt_editClass) | 버튼 'trigger:조회#1' ← 공급사 'trigger:icon:search#1'(img_115, 같은 뜻); 버튼 'trigger:조회#2' ← 공급사 'trigger:icon:search#2'(img_229, 같은 뜻); 퍼블리싱 전용 버튼 '도움말'(공통 처리 대상); 공급사 trigger:icon:guide#1(img_90) 옮겨 넣음(TODO) |
| jldfil00006 | todo | 3/5 | 1 |  |  | 버튼 'trigger:도움말' ← 공급사 'trigger:icon:guide'(img_41, 같은 뜻); 버튼 'trigger:다음' ← 공급사 'trigger:icon:next'(img_71, 같은 뜻); 버튼 'trigger:목록' ← 공급사 'trigger:icon:list_more'(img_72, 같은 뜻); 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상) |
| jldfil00010 | todo | 3/11 | 16 |  | input:종목명(ipt_searchIsuNm); trigger:icon:search(img_67); input:#1(ipt_disclsTitle); input:#2(ipt_submitprnNm) | 버튼 'trigger:도움말' ← 공급사 'trigger:icon:guide'(img_41, 같은 뜻); 버튼 'trigger:이전' ← 공급사 'trigger:icon:prev'(img_163, 같은 뜻); 버튼 'trigger:목록' ← 공급사 'trigger:icon:list_more'(img_169, 같은 뜻); 공급사 input:종목명(ipt_searchIsuNm) 옮겨 넣음(TODO) |
| jldfil00013 | todo | 1/3 | 3 |  | grid:(grd_resultVo) | 버튼 'trigger:도움말' ← 공급사 'trigger:icon:guide'(img_15, 같은 뜻); 공급사 grid:(grd_resultVo) 옮겨 넣음(TODO) |
| jldfil00014 | todo | 1/2 | 1 |  |  | 버튼 'trigger:도움말' ← 공급사 'trigger:icon:guide'(img_16, 같은 뜻) |
| jldfil00021 | auto | 9/9 | 0 |  |  | 그리드 헤더 '처리상태' 공급사 쪽 없음; 그리드 1:1(헤더 다름); 버튼 'trigger:도움말' ← 공급사 'trigger:icon:guide'(img_109, 같은 뜻); 버튼 'trigger:조회' ← 공급사 'trigger:icon:search'(img_149, 같은 뜻) |
| jldfil00022 | auto | 7/7 | 0 |  |  | 버튼 'trigger:도움말' ← 공급사 'trigger:icon:guide'(img_74, 같은 뜻); 버튼 'trigger:조회' ← 공급사 'trigger:icon:search'(img_104, 같은 뜻) |
| jldfil00033 | todo | 17/20 | 5 |  | input:(ipt_companyName); trigger:닫기(btn_window) | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_searchSubcomList, 같은 뜻); 공급사 input:(ipt_companyName) 옮겨 넣음(TODO); 공급사 trigger:닫기(btn_window) 옮겨 넣음(TODO); jQuery 잔여 3문장에 규칙 19 TODO |
| jldfil00100 | auto | 9/9 | 0 |  |  | 그리드 1:1(헤더 다름); 버튼 'trigger:도움말' ← 공급사 'trigger:icon:guide'(img_52, 같은 뜻); 버튼 'trigger:조회' ← 공급사 'trigger:icon:search'(img_92, 같은 뜻) |
| jldfil00101 | todo | 2/5 | 6 |  | select:#1(ipt_revTgtList); select:#2(ipt_revTgtList_5); trigger:icon:save(btn_tempRegister) | 버튼 'trigger:도움말' ← 공급사 'trigger:icon:guide'(img_80, 같은 뜻); 버튼 'trigger:목록' ← 공급사 'trigger:icon:list_more'(btn_history, 같은 뜻); 공급사 select:#1(ipt_revTgtList) 옮겨 넣음(TODO); 공급사 select:#2(ipt_revTgtList_5) 옮겨 넣음(TODO) |
| jldfil00175 | auto | 7/7 | 0 |  |  | 그리드 헤더 '비고' 공급사 쪽 없음; 그리드 1:1(헤더 다름); 버튼 'trigger:도움말' ← 공급사 'trigger:icon:guide'(img_70, 같은 뜻); 버튼 'trigger:조회' ← 공급사 'trigger:icon:search'(img_100, 같은 뜻) |
| jldfil00200 | auto | 9/9 | 0 |  |  | 그리드 헤더 '정정여부' 공급사 쪽 없음; 그리드 헤더 '정정요구여부' 공급사 쪽 없음; 그리드 1:1(헤더 다름); 버튼 'trigger:도움말' ← 공급사 'trigger:icon:guide'(img_78, 같은 뜻) |
| jldfil00300 | auto | 6/6 | 0 |  |  | 그리드 1:1(헤더 다름); 버튼 'trigger:도움말' ← 공급사 'trigger:icon:guide'(img_81, 같은 뜻); 버튼 'trigger:조회' ← 공급사 'trigger:icon:search'(img_101, 같은 뜻) |
| jldfil00330 | todo | 9/9 | 1 |  | trigger:icon:guide(img_83) | 버튼 'trigger:search' ← 공급사 'trigger:icon:search#1'(img_113, 같은 뜻); 버튼 'trigger:조회' ← 공급사 'trigger:icon:search#2'(img_120, 같은 뜻); 공급사 trigger:icon:guide(img_83) 옮겨 넣음(TODO) |
| jldfil00400 ⚠중복 | todo | 9/9 | 2 |  | input:회사코드(명)(ipt_disclsComInfo); trigger:일괄삭제(btn_deleteListSearch) | 그리드 헤더 '출처' 공급사 쪽 없음; 그리드 1:1(헤더 다름); 버튼 'trigger:도움말' ← 공급사 'trigger:icon:guide'(img_56, 같은 뜻); 버튼 'trigger:조회' ← 공급사 'trigger:icon:search'(img_102, 같은 뜻) |
| jldfil00401 | todo | 6/8 | 1 |  |  | 그리드 헤더 '타이틀' 공급사 쪽 없음; 그리드 1:1(헤더 다름); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); jQuery 잔여 4문장에 규칙 19 TODO |
| jldfil00500 | todo | 5/8 | 8 |  | trigger:icon:guide(img_30); select:#1(slc_pageSize); select:#2(ipt_applNoAll); select:#3(ipt_applNoArr) | 버튼 'trigger:조회' ← 공급사 'trigger:icon:search'(img_61, 같은 뜻); 공급사 trigger:icon:guide(img_30) 옮겨 넣음(TODO); 공급사 select:#1(slc_pageSize) 옮겨 넣음(TODO); 공급사 select:#2(ipt_applNoAll) 옮겨 넣음(TODO) |
| jldfil05011 | todo | 3/3 | 3 |  | trigger:선택제출(btn_ElwSelectSub); trigger:엑셀다운(btn_ElwExcelDownload); trigger:엑셀업로드(btn_ElwExcelUploadPop) | 그리드 헤더 '심사<br/>담당자' 공급사 쪽 없음; 그리드 1:1(헤더 다름); 공급사 trigger:선택제출(btn_ElwSelectSub) 옮겨 넣음(TODO); 공급사 trigger:엑셀다운(btn_ElwExcelDownload) 옮겨 넣음(TODO) |
| jldfil05016 | todo | 3/3 | 2 |  | trigger:일괄입력후선택제출(btn_contnInputPopup); trigger:선택제출(btn_batchElwSubmit) | 그리드 헤더 '심사<br/>담당자' 공급사 쪽 없음; 그리드 1:1(헤더 다름); 공급사 trigger:일괄입력후선택제출(btn_contnInputPopup) 옮겨 넣음(TODO); 공급사 trigger:선택제출(btn_batchElwSubmit) 옮겨 넣음(TODO) |
| jldfil05021 | auto | 5/5 | 0 |  |  | 버튼 'trigger:search' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻) |
| jldfil05026 | auto | 3/3 | 0 |  |  |  |
| jldfil05031 | todo | 8/8 | 1 |  | trigger:예비심사청구데이터다운로드(btn_ElwPreDataDownload) | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻); 공급사 trigger:예비심사청구데이터다운로드(btn_ElwPreDataDownload) 옮겨 넣음(TODO) |
| jldfil05036 | todo | 0/0 | 2 |  | trigger:Ⅰ.발행회사에관한사항Ⅱ.주식워런트증권에관한사항Ⅲ.유동성공급에관한사항(btn_showInfoPage); trigger:Ⅰ.발행회사에관한사항Ⅱ.상장후사용하고자하는명칭Ⅲ.주식워런트증권에관한사항Ⅳ.경영상중대한사실발생여부(btn_showInfoPage_2) | 공급사 trigger:Ⅰ.발행회사에관한사항Ⅱ.주식워런트증권에관한사항Ⅲ.유동성공급(btn_showInfoPage) 옮겨 넣음(TODO); 공급사 trigger:Ⅰ.발행회사에관한사항Ⅱ.상장후사용하고자하는명칭Ⅲ.주식워런트(btn_showInfoPage_2) 옮겨 넣음(TODO) |
| jldfil05039 | todo | 4/6 | 3 |  | trigger:Excel(btn_excel) | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻); 그리드 헤더 '종목코드' 공급사 쪽 없음; 그리드 헤더 '종목명' 공급사 쪽 없음; 그리드 헤더 '기준일' 공급사 쪽 없음 |
| jldfil05040 | todo | 5/8 | 5 |  | input:부과수수료합계(ipt_totFee); trigger:엑셀저장(btn_excel) | 공급사 input:부과수수료합계(ipt_totFee) 옮겨 넣음(TODO); 공급사 trigger:엑셀저장(btn_excel) 옮겨 넣음(TODO) |
| jldfil05100 | auto | 1/1 | 0 |  |  |  |
| jldfil05104 | auto | 2/2 | 0 |  |  | jQuery 잔여 1문장에 규칙 19 TODO |
| jldfil10000 | todo | 8/9 | 1 |  | input:회사코드(명)(ipt_disclsComInfo) | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_searchList, 같은 뜻); 퍼블리싱 전용 버튼 '도움말'(공통 처리 대상); 공급사 input:회사코드(명)(ipt_disclsComInfo) 옮겨 넣음(TODO) |
| jldfil10100 | auto | 3/3 | 0 |  |  |  |
| jldfil10200 | todo | 2/6 | 5 |  | grid:누적벌점/벌점/유형/지정일(grd_nfaithDesignCntList) | 그리드 헤더 '불성실공시 횟수관리' 공급사 쪽 없음; 그리드 닮음 0.80: grid:누적횟수/불성실공시횟수관리/유형/지정일/횟수 ← grd_nfaithDesignCntList_2; 그리드 헤더 '관리종목지정' 공급사 쪽 없음; 그리드 닮음 0.75: grid:관리종목지정/변경구분/변경일/사유 ← grd_admisuList |
| jldfil10300 | auto | 3/3 | 0 |  |  |  |
| jldfil10601 | todo | 0/3 | 1 |  |  | 퍼블리싱 전용 버튼 '도움말'(공통 처리 대상); 퍼블리싱 전용 버튼 '도움말'(공통 처리 대상) |
| jldfil10602 | auto | 7/7 | 0 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_searchList, 같은 뜻) |
| jldfil10603 | todo | 9/10 | 2 |  |  | 참조 txt_mainFormName 옮겨 넣음(TODO); jQuery 잔여 1문장에 규칙 19 TODO |
| jldfil10605 | todo | 3/3 | 1 |  | grid:(grd_resultVo) | 공급사 grid:(grd_resultVo) 옮겨 넣음(TODO) |
| jldfil10606 | todo | 1/2 | 1 |  |  |  |
| jldfil10607 | auto | 7/7 | 0 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_searchList, 같은 뜻) |
| jldfil10608 | todo | 9/10 | 2 |  |  | 참조 txt_mainFormName 옮겨 넣음(TODO); jQuery 잔여 1문장에 규칙 19 TODO |
| jldfil10609 | todo | 3/3 | 1 |  | grid:(grd_resultVo) | 공급사 grid:(grd_resultVo) 옮겨 넣음(TODO) |
| jldfil10610 | todo | 1/2 | 1 |  |  |  |
| jldfil11000 | frozen | 0/0 | 1 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 1건: keydown 바인딩 → ev:onkeydown 핸들러 |
| jldfil11010 | frozen | 0/0 | 6 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성 2차(규칙 19) — jQuery 4건: disclsChrg option:selected ×3 → slc_disclsChrg.getValue(), tooltip 사문 제거 |
| jldfil11040 | todo | 1/1 | 1 |  | grid:첨부파일(attachFileList) | 공급사 grid:첨부파일(attachFileList) 옮겨 넣음(TODO); 참조 1개는 공급사 body 에도 없음(게이트 report-only): ipt_disclsConsultApplId; jQuery 잔여 2문장에 규칙 19 TODO |
| jldfil11060 | todo | 1/3 | 9 |  | grid:삭제/첨부파일(attachFileList); trigger:일괄다운로드(btn_fileAllDown); trigger:삭제(btn_fileDel); select:메시지전송(slc_smsContn) | 공급사 grid:삭제/첨부파일(attachFileList) 옮겨 넣음(TODO); 공급사 trigger:일괄다운로드(btn_fileAllDown) 옮겨 넣음(TODO); 공급사 trigger:삭제(btn_fileDel) 옮겨 넣음(TODO); 공급사 select:메시지전송(slc_smsContn) 옮겨 넣음(TODO) |
| jldfil15000 | auto | 6/6 | 0 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻) |
| jldfil15001 | todo | 1/1 | 2 |  | trigger:${announcement.nextBbsVO.title}(btn_GoURL_2); trigger:${announcement.preBbsVO.title}(btn_GoURL_3) | 공급사 trigger:${announcement.nextBbsVO.title}(btn_GoURL_2) 옮겨 넣음(TODO); 공급사 trigger:${announcement.preBbsVO.title}(btn_GoURL_3) 옮겨 넣음(TODO) |
| jldfil15500 | todo | 4/7 | 4 |  | input:제목검색(ipt_keyword) | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻); 공급사 input:제목검색(ipt_keyword) 옮겨 넣음(TODO) |
| jldfil15900 | todo | 6/7 | 1 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻) |
| jldfil15901 | todo | 1/1 | 2 |  | trigger:${dsclData.nextBbsVO.title}(btn_GoURL_2); trigger:${dsclData.preBbsVO.title}(btn_GoURL_3) | 공급사 trigger:${dsclData.nextBbsVO.title}(btn_GoURL_2) 옮겨 넣음(TODO); 공급사 trigger:${dsclData.preBbsVO.title}(btn_GoURL_3) 옮겨 넣음(TODO) |
| jldfil16000 | todo | 0/8 | 8 |  |  | jQuery 잔여 3문장에 규칙 19 TODO |
| jldfil16200 | todo | 5/5 | 4 |  | trigger:이전#1(btn_Prev); trigger:이전#2(btn_Prev_2); trigger:다음(btn_Next); trigger:임시저장#2(btn_Save_2) | trigger:임시저장 퍼블리싱 1개 ↔ 공급사 2개: 앞에서부터 1개 이음(나머지 TODO); 공급사 trigger:이전#1(btn_Prev) 옮겨 넣음(TODO); 공급사 trigger:이전#2(btn_Prev_2) 옮겨 넣음(TODO); 공급사 trigger:다음(btn_Next) 옮겨 넣음(TODO) |
| jldfil16201 | todo | 1/1 | 1 |  | grid:(grd_pollPollQuesVO) | 공급사 grid:(grd_pollPollQuesVO) 옮겨 넣음(TODO) |
| jldfil16202 | auto | 2/2 | 0 |  |  |  |
| jldfil16300 | todo | 3/24 | 17 |  | trigger:검색(btn_Search) | select:카테고리선택 퍼블리싱 6개 ↔ 공급사 1개: 앞에서부터 1개 이음(나머지 TODO); input:카테고리선택 퍼블리싱 6개 ↔ 공급사 1개: 앞에서부터 1개 이음(나머지 TODO); trigger:인쇄 퍼블리싱 6개 ↔ 공급사 1개: 앞에서부터 1개 이음(나머지 TODO); 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상) |
| jldfil16301 | todo | 3/3 | 1 |  | trigger:인쇄(btn_Print) | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻); 공급사 trigger:인쇄(btn_Print) 옮겨 넣음(TODO) |
| jldfil16400 | todo | 5/6 | 4 |  | select:교육회차#2(slc_sltEduRnd1); select:교육회차#3(slc_sltEduRnd2); trigger:신청(btn_Submit) | select:교육회차 퍼블리싱 1개 ↔ 공급사 3개: 앞에서부터 1개 이음(나머지 TODO); 공급사 select:교육회차#2(slc_sltEduRnd1) 옮겨 넣음(TODO); 공급사 select:교육회차#3(slc_sltEduRnd2) 옮겨 넣음(TODO); 공급사 trigger:신청(btn_Submit) 옮겨 넣음(TODO) |
| jldfil16400n | auto | 3/3 | 0 |  |  |  |
| jldfil16402 | auto | 3/3 | 0 |  |  | 그리드 헤더 '구분' 공급사 쪽 없음; 그리드 헤더 '입금일' 공급사 쪽 없음; 그리드 헤더 '입금액' 공급사 쪽 없음; 그리드 헤더 '사유' 공급사 쪽 없음 |
| jldfil16403 | auto | 2/2 | 0 |  |  |  |
| jldfil16403n | todo | 5/5 | 12 |  | trigger:이전#2(btn_history_2); trigger:임시저장#1(btn_Modify_2); trigger:인쇄#2(btn_Print_2); trigger:제출#1(btn_Modify_3) | trigger:인쇄 퍼블리싱 1개 ↔ 공급사 3개: 앞에서부터 1개 이음(나머지 TODO); trigger:삭제 퍼블리싱 1개 ↔ 공급사 3개: 앞에서부터 1개 이음(나머지 TODO); trigger:이전 퍼블리싱 1개 ↔ 공급사 2개: 앞에서부터 1개 이음(나머지 TODO); 공급사 trigger:이전#2(btn_history_2) 옮겨 넣음(TODO) |
| jldfil16404 | auto | 2/2 | 0 |  |  |  |
| jldfil16404n | todo | 7/11 | 19 |  | input:(ipt_chrgDesignDd); input:Ο전화(ipt_telNo); input:Ο휴대폰(ipt_cellphoneNo); input:Ο이메일(ipt_email) | trigger:인쇄 퍼블리싱 1개 ↔ 공급사 3개: 앞에서부터 1개 이음(나머지 TODO); trigger:삭제 퍼블리싱 1개 ↔ 공급사 2개: 앞에서부터 1개 이음(나머지 TODO); trigger:이전 퍼블리싱 1개 ↔ 공급사 3개: 앞에서부터 1개 이음(나머지 TODO); 공급사 input:(ipt_chrgDesignDd) 옮겨 넣음(TODO) |
| jldfil16406 | todo | 0/16 | 14 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 목업 중복 id 14개 비움 |
| jldfil16500 | auto | 11/11 | 0 |  |  | 그리드 헤더 '구분' 공급사 쪽 없음; 그리드 헤더 '교육회차' 공급사 쪽 없음; 그리드 헤더 '공시교육일정' 공급사 쪽 없음; 그리드 헤더 '간담회 항목' 공급사 쪽 없음 |
| jldfil16501 | todo | 7/7 | 7 |  | select:교육회차#2(slc_sltEduRnd1); select:교육회차#3(slc_sltEduRnd2); select:교육회차#4(slc_sltEduRnd3); select:교육회차#5(slc_sltEduRnd4) | 그리드 1:1(헤더 다름); 버튼 'trigger:조회' ← 공급사 'trigger:icon:search'(btn_Search, 같은 뜻); 버튼 'trigger:엑셀다운로드' ← 공급사 'trigger:icon:download'(btn_excelDownload, 같은 뜻); select:교육회차 퍼블리싱 1개 ↔ 공급사 7개: 앞에서부터 1개 이음(나머지 TODO) |
| jldfil16800 | todo | 6/7 | 1 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻) |
| jldfil16801 | todo | 1/1 | 2 |  | trigger:${dsclData.nextBbsVO.title}(btn_GoURL_2); trigger:${dsclData.preBbsVO.title}(btn_GoURL_3) | 공급사 trigger:${dsclData.nextBbsVO.title}(btn_GoURL_2) 옮겨 넣음(TODO); 공급사 trigger:${dsclData.preBbsVO.title}(btn_GoURL_3) 옮겨 넣음(TODO) |
| jldfil17000 | todo | 6/7 | 1 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻) |
| jldfil17001 | todo | 1/1 | 2 |  | trigger:${dsclData.nextBbsVO.title}(btn_GoURL_2); trigger:${dsclData.preBbsVO.title}(btn_GoURL_3) | 공급사 trigger:${dsclData.nextBbsVO.title}(btn_GoURL_2) 옮겨 넣음(TODO); 공급사 trigger:${dsclData.preBbsVO.title}(btn_GoURL_3) 옮겨 넣음(TODO) |
| jldfil17300 | auto | 10/10 | 0 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_search, 같은 뜻) |
| jldfil17301 | todo | 7/10 | 15 |  | input:등록자명#1(ipt_name2); trigger:현재등록된파일:${entity.attachFileNm}(btn_FileDown); upload:(upd_attachBinFiles); trigger:저장(btn_register) | select:등록자명 퍼블리싱 1개 ↔ 공급사 2개: 앞에서부터 1개 이음(나머지 TODO); input:연락처 퍼블리싱 1개 ↔ 공급사 2개: 앞에서부터 1개 이음(나머지 TODO); input:이메일 퍼블리싱 1개 ↔ 공급사 2개: 앞에서부터 1개 이음(나머지 TODO); select:업무구분 퍼블리싱 1개 ↔ 공급사 2개: 앞에서부터 1개 이음(나머지 TODO) |
| jldfil17302 | todo | 1/1 | 2 |  | trigger:수정(btn_modify); trigger:삭제(btn_delete) | 공급사 trigger:수정(btn_modify) 옮겨 넣음(TODO); 공급사 trigger:삭제(btn_delete) 옮겨 넣음(TODO) |
| jldfil17400 | todo | 0/0 | 2 |  | grid:(grd_HelpBokmkVOList_3); grid:구분/내용(grd_HelpBokmkVOList_7) | 공급사 grid:(grd_HelpBokmkVOList_3) 옮겨 넣음(TODO); 공급사 grid:구분/내용(grd_HelpBokmkVOList_7) 옮겨 넣음(TODO); 퍼블리싱 목업 중복 id 4개 비움 |
| jldfil19000 | auto | 0/0 | 0 |  |  |  |
| jldfil20000 | todo | 0/0 | 1 |  | trigger:상세보기(btn_DisclsPrfmDtl) | 공급사 trigger:상세보기(btn_DisclsPrfmDtl) 옮겨 넣음(TODO) |
| jldfil20050 | auto | 0/0 | 0 |  |  |  |
| jldfil20100 | auto | 15/15 | 0 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻) |
| jldfil20200 | todo | 2/2 | 1 |  | grid:주식수/주식종류(grd_listStockStatusList) | 공급사 grid:주식수/주식종류(grd_listStockStatusList) 옮겨 넣음(TODO) |
| jldfil20300 | todo | 9/48 | 48 |  | trigger:신청내역(btn_ViewTreasuryStock); trigger:체결내역(btn_ViewTreasuryStock_2); inputCalendar:#1(cal_sdate); inputCalendar:#2(cal_edate) | trigger:1주 퍼블리싱 3개 ↔ 공급사 1개: 앞에서부터 1개 이음(나머지 TODO); trigger:1개월 퍼블리싱 3개 ↔ 공급사 1개: 앞에서부터 1개 이음(나머지 TODO); trigger:3개월 퍼블리싱 3개 ↔ 공급사 1개: 앞에서부터 1개 이음(나머지 TODO); trigger:6개월 퍼블리싱 3개 ↔ 공급사 1개: 앞에서부터 1개 이음(나머지 TODO) |
| jldfil20400 | auto | 11/11 | 0 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻); jQuery 잔여 8문장에 규칙 19 TODO |
| jldfil20500 | frozen | 0/0 | 11 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 4건: 체크박스 is/attr/removeAttr → getValue/setValue('Y'\|'') |
| jldfil21000 | todo | 9/11 | 14 |  | select:#1(ipt_securitiesDiv); select:#2(ipt_securitiesDiv_2); select:#3(ipt_securitiesDiv_3); select:#4(ipt_securitiesDiv_4) | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻); 공급사 select:#1(ipt_securitiesDiv) 옮겨 넣음(TODO); 공급사 select:#2(ipt_securitiesDiv_2) 옮겨 넣음(TODO); 공급사 select:#3(ipt_securitiesDiv_3) 옮겨 넣음(TODO) |
| jldfil21100 | todo | 9/9 | 1 |  | pageList:(krxpage_pagenavigator_83) | 그리드 헤더 '적용신처일자' 공급사 쪽 없음; 그리드 헤더 '타이틀' 공급사 쪽 없음; 그리드 1:1(헤더 다름); 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻) |
| jldfil21101 | todo | 5/9 | 4 |  |  | 버튼 'trigger:Search' ← 공급사 'trigger:icon:search'(btn_findCompany, 같은 뜻) |
| jldfil21102 | todo | 6/8 | 2 |  |  |  |
| jldfil21103 | mismatch | 0/0 | 0 |  |  | override skip: 퍼블리싱 파일은 '연계공시신청안내'(변동사실 select·제출/취소 안내 화면), 공급사는 '연계공시법인 탈퇴신청'(신청법인 그리드·신청일·적용신청일·상장자회사 입력) — 같은 이름에 다른 화면. 퍼블리셔에 탈퇴신청 화면 퍼블리싱 요청 |
| jldfil21104 | todo | 0/3 | 3 |  |  |  |
| jldfil21110 | auto | 5/5 | 0 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻) |
| jldfil21200 | auto | 3/3 | 0 |  |  |  |
| jldfil21210 | auto | 3/3 | 0 |  |  |  |
| jldfil21211 | auto | 1/1 | 0 |  |  |  |
| jldfil21212 | todo | 2/6 | 6 |  | upload:#1(upd_attachFile0); upload:#2(upd_attachFile1) | 공급사 upload:#1(upd_attachFile0) 옮겨 넣음(TODO); 공급사 upload:#2(upd_attachFile1) 옮겨 넣음(TODO) |
| jldfil22100 | auto | 4/4 | 0 |  |  | jQuery 잔여 2문장에 규칙 19 TODO |
| jldfil22110 | frozen | 0/0 | 3 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성 2차(규칙 19) — jQuery 1건: tooltip 사문 제거 |
| jldfil22120 | todo | 2/2 | 2 |  |  | 참조 ipt_attachFileNm 옮겨 넣음(TODO); 참조 ipt_contnAttachSeq 옮겨 넣음(TODO); jQuery 잔여 2문장에 규칙 19 TODO |
| jldfil25000 | todo | 13/15 | 2 |  |  |  |
| jldfil25003 | auto | 0/0 | 0 |  |  |  |
| jldfil25050 | todo | 1/1 | 1 |  | trigger:저장(btn_Modify) | 그리드 헤더 '제출일' 공급사 쪽 없음; 그리드 1:1(헤더 다름); 공급사 trigger:저장(btn_Modify) 옮겨 넣음(TODO) |
| jldfil25100 | frozen | 0/0 | 13 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 2건: change 바인딩 → ev:onchange 핸들러 |
| jldfil25101 | todo | 51/72 | 61 |  | input:소재지#1(ipt_locZipcd); input:소재지#2(ipt_locAddr); input:소재지#3(ipt_locDtlAddr); trigger:교육이수내역보기#1(btn_eduCompltListView) | trigger:공시교육일정등안내 퍼블리싱 6개 ↔ 공급사 1개: 앞에서부터 1개 이음(나머지 TODO); input:부서 퍼블리싱 5개 ↔ 공급사 4개: 앞에서부터 4개 이음(나머지 TODO); 공급사 input:소재지#1(ipt_locZipcd) 옮겨 넣음(TODO); 공급사 input:소재지#2(ipt_locAddr) 옮겨 넣음(TODO) |
| jldfil25102 | todo | 66/66 | 30 |  | input:성명#1(ipt_chrgNm); input:유선전화번호#4(ipt_chrgInnrNo); select:휴대전화번호#1(slc_cellphoneNo1); trigger:수정#1(btn_Modify_2) | input:유선전화번호 퍼블리싱 3개 ↔ 공급사 12개: 앞에서부터 3개 이음(나머지 TODO); input:휴대전화번호 퍼블리싱 3개 ↔ 공급사 6개: 앞에서부터 3개 이음(나머지 TODO); input:FAX 퍼블리싱 3개 ↔ 공급사 9개: 앞에서부터 3개 이음(나머지 TODO); 공급사 input:성명#1(ipt_chrgNm) 옮겨 넣음(TODO) |
| jldfil25103 | todo | 20/20 | 7 |  | input:유선전화번호#3(ipt_telNo3); input:유선전화번호#4(ipt_submitprnInnrNo); select:휴대전화번호(slc_cellphoneNo1); input:휴대전화번호#2(ipt_cellphoneNo3) | input:유선전화번호 퍼블리싱 2개 ↔ 공급사 4개: 앞에서부터 2개 이음(나머지 TODO); input:휴대전화번호 퍼블리싱 1개 ↔ 공급사 2개: 앞에서부터 1개 이음(나머지 TODO); input:FAX 퍼블리싱 1개 ↔ 공급사 3개: 앞에서부터 1개 이음(나머지 TODO); 공급사 input:유선전화번호#3(ipt_telNo3) 옮겨 넣음(TODO) |
| jldfil25104 | todo | 66/66 | 36 |  | input:유선전화번호#4(ipt_chrgInnrNo); select:휴대전화번호#1(slc_cellphoneNo1); input:생년월일#1(ipt_birthYear); input:생년월일#2(ipt_birthMonth) | input:유선전화번호 퍼블리싱 3개 ↔ 공급사 12개: 앞에서부터 3개 이음(나머지 TODO); input:휴대전화번호 퍼블리싱 3개 ↔ 공급사 6개: 앞에서부터 3개 이음(나머지 TODO); input:FAX 퍼블리싱 3개 ↔ 공급사 9개: 앞에서부터 3개 이음(나머지 TODO); 공급사 input:유선전화번호#4(ipt_chrgInnrNo) 옮겨 넣음(TODO) |
| jldfil25105 | todo | 50/50 | 3 |  | trigger:수정#2(btn_Modify_r1); trigger:수정#3(btn_Modify_r2); trigger:수정#4(btn_Modify_r3) | trigger:수정 퍼블리싱 1개 ↔ 공급사 4개: 앞에서부터 1개 이음(나머지 TODO); 공급사 trigger:수정#2(btn_Modify_r1) 옮겨 넣음(TODO); 공급사 trigger:수정#3(btn_Modify_r2) 옮겨 넣음(TODO); 공급사 trigger:수정#4(btn_Modify_r3) 옮겨 넣음(TODO) |
| jldfil25107 | todo | 45/55 | 46 |  | input:성명#1(ipt_chrgNm); input:유선전화번호#4(ipt_chrgInnrNo); select:휴대전화번호#1(slc_cellphoneNo1); input:소재지#1(ipt_locZipcd) | input:유선전화번호 퍼블리싱 3개 ↔ 공급사 12개: 앞에서부터 3개 이음(나머지 TODO); input:휴대전화번호 퍼블리싱 3개 ↔ 공급사 6개: 앞에서부터 3개 이음(나머지 TODO); input:FAX 퍼블리싱 3개 ↔ 공급사 9개: 앞에서부터 3개 이음(나머지 TODO); 공급사 input:성명#1(ipt_chrgNm) 옮겨 넣음(TODO) |
| jldfil25108 | todo | 38/38 | 2 |  | trigger:수정#2(btn_Modify_r1); trigger:수정#3(btn_Modify_r2) | trigger:수정 퍼블리싱 1개 ↔ 공급사 3개: 앞에서부터 1개 이음(나머지 TODO); 공급사 trigger:수정#2(btn_Modify_r1) 옮겨 넣음(TODO); 공급사 trigger:수정#3(btn_Modify_r2) 옮겨 넣음(TODO) |
| jldfil25111 | todo | 39/39 | 24 |  | input:유선전화번호#4(ipt_chrgInnrNo); select:휴대전화번호#1(slc_cellphoneNo1); trigger:재등록#1(btn_Modify); input:유선전화번호#5(ipt_telNo1_r1) | input:유선전화번호 퍼블리싱 3개 ↔ 공급사 12개: 앞에서부터 3개 이음(나머지 TODO); input:휴대전화번호 퍼블리싱 3개 ↔ 공급사 6개: 앞에서부터 3개 이음(나머지 TODO); input:FAX 퍼블리싱 3개 ↔ 공급사 9개: 앞에서부터 3개 이음(나머지 TODO); 공급사 input:유선전화번호#4(ipt_chrgInnrNo) 옮겨 넣음(TODO) |
| jldfil25113 | todo | 23/30 | 56 |  | input:지정일#1(ipt_chrgDesignYear); input:지정일#2(ipt_chrgDesignMonth); input:지정일#3(ipt_chrgDesignDay); input:지정일#4(ipt_chrgDesignYear_r1) | trigger:수정 퍼블리싱 2개 ↔ 공급사 5개: 앞에서부터 2개 이음(나머지 TODO); input:성명 퍼블리싱 2개 ↔ 공급사 5개: 앞에서부터 2개 이음(나머지 TODO); input:직위 퍼블리싱 2개 ↔ 공급사 5개: 앞에서부터 2개 이음(나머지 TODO); input:부서 퍼블리싱 2개 ↔ 공급사 5개: 앞에서부터 2개 이음(나머지 TODO) |
| jldfil25200 | todo | 6/7 | 1 |  |  | jQuery 잔여 1문장에 규칙 19 TODO |
| jldfil25210 | auto | 3/3 | 0 |  |  |  |
| jldfil25300 | todo | 0/2 | 2 |  |  |  |
| jldfil25301 | todo | 0/4 | 4 |  |  |  |
| jldfil25302 | todo | 6/8 | 3 |  | input:전화번호#2(ipt_chrgTelNo2); input:전화번호#3(ipt_chrgTelNo3) | input:전화번호 퍼블리싱 1개 ↔ 공급사 3개: 앞에서부터 1개 이음(나머지 TODO); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); 공급사 input:전화번호#2(ipt_chrgTelNo2) 옮겨 넣음(TODO); 공급사 input:전화번호#3(ipt_chrgTelNo3) 옮겨 넣음(TODO) |
| jldfil25303 | auto | 1/1 | 0 |  |  |  |
| jldfil25304 | todo | 0/1 | 1 |  |  |  |
| jldfil25305 | auto | 1/1 | 0 |  |  |  |
| jldfil25600 | todo | 1/1 | 3 |  |  | 참조 ipt_submitprnEmail 옮겨 넣음(TODO); 참조 ipt_submitprnNm 옮겨 넣음(TODO); 참조 ipt_telNo 옮겨 넣음(TODO) |
| jldfil25710 | auto | 1/1 | 0 |  |  |  |
| jldfil25800 | todo | 10/17 | 11 |  | input:(ipt_comNm); select:#1(slc_subTpCd); trigger:수정(btn_subInfoModify); trigger:삭제(btn_subInfoDelete) | 버튼 'trigger:Search' ← 공급사 'trigger:icon:search'(btn_findCompany, 같은 뜻); 닫기 2개 ← 공급사 닫기 1개(btn_cancle): 첫째 id+이벤트, 나머지 이벤트만; trigger:회사등록 퍼블리싱 2개 ↔ 공급사 1개: 앞에서부터 1개 이음(나머지 TODO); select:발행기관관계구분 퍼블리싱 2개 ↔ 공급사 1개: 앞에서부터 1개 이음(나머지 TODO) |
| jldfil25900 | todo | 2/2 | 1 |  |  | 참조 ipt_bzProcsNo 옮겨 넣음(TODO) |
| jldfil25910 | todo | 4/6 | 6 |  | inputCalendar:(cal_divBasDd); trigger:icon:delete(img_93) | 버튼 'trigger:등록' ← 공급사 'trigger:저장'(registerBtn, 같은 뜻); 공급사 inputCalendar:(cal_divBasDd) 옮겨 넣음(TODO); 공급사 trigger:icon:delete(img_93) 옮겨 넣음(TODO); 참조 ipt_attachFileNm 옮겨 넣음(TODO) |
| jldfil30000 | todo | 0/3 | 3 |  |  |  |
| jldfil30100 ⚠중복 | todo | 0/8 | 7 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상) |
| jldfil30105 ⚠중복 | todo | 0/8 | 7 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상) |
| jldfil30200 ⚠중복 | auto | 4/4 | 0 |  |  |  |
| jldfil30201 ⚠중복 | todo | 2/3 | 23 |  | select:증명용도#2(ipt_useGubun_2); select:증명용도#3(ipt_useGubun_3); select:증명용도#4(ipt_useGubun_4); select:증명용도#5(ipt_useGubun_5) | select:증명용도 퍼블리싱 1개 ↔ 공급사 23개: 앞에서부터 1개 이음(나머지 TODO); 공급사 select:증명용도#2(ipt_useGubun_2) 옮겨 넣음(TODO); 공급사 select:증명용도#3(ipt_useGubun_3) 옮겨 넣음(TODO); 공급사 select:증명용도#4(ipt_useGubun_4) 옮겨 넣음(TODO) |
| jldfil30300 ⚠중복 | auto | 4/4 | 0 |  |  |  |
| jldfil30301 ⚠중복 | todo | 2/3 | 23 |  | select:증명용도#2(ipt_useGubun_2); select:증명용도#3(ipt_useGubun_3); select:증명용도#4(ipt_useGubun_4); select:증명용도#5(ipt_useGubun_5) | select:증명용도 퍼블리싱 1개 ↔ 공급사 23개: 앞에서부터 1개 이음(나머지 TODO); 공급사 select:증명용도#2(ipt_useGubun_2) 옮겨 넣음(TODO); 공급사 select:증명용도#3(ipt_useGubun_3) 옮겨 넣음(TODO); 공급사 select:증명용도#4(ipt_useGubun_4) 옮겨 넣음(TODO) |
| jldfil30600 | auto | 1/1 | 0 |  |  |  |
| jldfil30601 | auto | 7/7 | 0 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_search, 같은 뜻) |
| jldfil30602 | todo | 10/19 | 10 |  | grid:시작분/시작시/시작일/일시/종료분/종료시/종료일(rowPlus) | 공급사 grid:시작분/시작시/시작일/일시/종료분/종료시/종료일(rowPlus) 옮겨 넣음(TODO) |
| jldfil30603 | todo | 1/1 | 3 |  | grid:연락처/이메일(grd_lecrDiptSchdl); trigger:수정#1(btn_modify); trigger:수정#2(btn_modify_2) | 공급사 grid:연락처/이메일(grd_lecrDiptSchdl) 옮겨 넣음(TODO); 공급사 trigger:수정#1(btn_modify) 옮겨 넣음(TODO); 공급사 trigger:수정#2(btn_modify_2) 옮겨 넣음(TODO) |
| jldfil30604 | todo | 10/11 | 2 |  | grid:시작분/시작시/시작일/일시/종료분/종료시/종료일(rowPlus) | 공급사 grid:시작분/시작시/시작일/일시/종료분/종료시/종료일(rowPlus) 옮겨 넣음(TODO) |
| jldfil35200 | mismatch | 0/0 | 0 |  |  | override skip: 퍼블리싱 본문이 빈 자리표(meta_screenName '원격지원안내(디자인필요)') — 퍼블리싱 미작성. 공급사 본문(step01~04 안내 이미지·텍스트)이 유일한 내용이라 ui-tobe 를 그대로 쓴다 |
| jldfil35400 | todo | 3/3 | 3 |  | trigger:목차(btn1); trigger:즐겨찾기(btn2); pageList:(krxpage_pagenavigator_92) | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻); 공급사 trigger:목차(btn1) 옮겨 넣음(TODO); 공급사 trigger:즐겨찾기(btn2) 옮겨 넣음(TODO); 공급사 pageList:(krxpage_pagenavigator_92) 옮겨 넣음(TODO) |
| jldfil35700 ⚠중복 | todo | 0/47 | 42 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상) |
| jldfil40100 | auto | 0/0 | 0 |  |  |  |
| jldfil40105 | auto | 0/0 | 0 |  |  |  |
| jldfil40200 | mismatch | 0/0 | 0 |  |  | override skip: 회원가입분류: 퍼블리싱은 시장별 select 5개 + 회사코드(5자리) 입력·확인 버튼(재설계), 공급사는 분류 select 8개(유가/코스닥/의결권/채권 묶음 1 + 코넥스·ETF사무관리·ETN발행사·ETN사무관리·투자계약/신탁·신탁상장신청인·상장형수익증권 7). 분류 체계가 달라 기계 대응 불가 — 기획 확인(새 분류 체계 확정) 뒤 pair 작성 |
| jldfil40201 | todo | 23/24 | 15 |  | trigger:다음#1(btn_ApplyJoin_2); trigger:취소#2(btn_GoURL_2); trigger:다음#2(btn_ApplyJoin_3); trigger:취소#3(btn_GoURL_3) | trigger:취소 퍼블리싱 1개 ↔ 공급사 8개: 앞에서부터 1개 이음(나머지 TODO); 공급사 trigger:다음#1(btn_ApplyJoin_2) 옮겨 넣음(TODO); 공급사 trigger:취소#2(btn_GoURL_2) 옮겨 넣음(TODO); 공급사 trigger:다음#2(btn_ApplyJoin_3) 옮겨 넣음(TODO) |
| jldfil40202 | todo | 0/1 | 1 |  |  |  |
| jldfil40203 | todo | 65/74 | 43 |  | select:(ipt_setChrg); input:생년월일#1(ipt_birthYear); input:생년월일#2(ipt_birthMonth); input:생년월일#3(ipt_birthDay) | input:담당자소재지회사주소 퍼블리싱 6개 ↔ 공급사 9개: 앞에서부터 6개 이음(나머지 TODO); 공급사 select:(ipt_setChrg) 옮겨 넣음(TODO); 공급사 input:생년월일#1(ipt_birthYear) 옮겨 넣음(TODO); 공급사 input:생년월일#2(ipt_birthMonth) 옮겨 넣음(TODO) |
| jldfil40207 | todo | 25/26 | 4 |  | input:생년월일#1(ipt_birthYear); input:생년월일#2(ipt_birthMonth); input:생년월일#3(ipt_birthDay) | 공급사 input:생년월일#1(ipt_birthYear) 옮겨 넣음(TODO); 공급사 input:생년월일#2(ipt_birthMonth) 옮겨 넣음(TODO); 공급사 input:생년월일#3(ipt_birthDay) 옮겨 넣음(TODO) |
| jldfil40211 | todo | 2/4 | 2 |  | input:(ipt_usrId) | 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); 공급사 input:(ipt_usrId) 옮겨 넣음(TODO) |
| jldfil40300 | frozen | 0/0 | 0 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 2건: alt 속성 + DOM 인자 → checkRequired(comp, name) |
| jldfil40301 | auto | 0/0 | 0 |  |  |  |
| jldfil40400 | frozen | 0/0 | 0 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 2건: alt 속성 + DOM 인자 → checkRequired(comp, name) |
| jldfil40401 | todo | 0/1 | 1 |  |  |  |
| jldfil45501 | todo | 26/53 | 37 |  | grid:구분/발행금액(a)/발행일/전환가액(b)/전환시발행주식수(a/b)/증가될자본금(rowPlus_1); grid:구분/발행일/전환가액/전환시발행주식수/전환일등/전환채권금액/증가된자본금(rowPlus_2); grid:구분/발행일/주식수/증가된자본금#1(rowPlus_3); grid:구분/발행일/주식수/증가된자본금#2(rowPlus_4) | input:합계 퍼블리싱 7개 ↔ 공급사 9개: 앞에서부터 7개 이음(나머지 TODO); 공급사 grid:구분/발행금액(a)/발행일/전환가액(b)/전환시발행주식수(a/b(rowPlus_1) 옮겨 넣음(TODO); 공급사 grid:구분/발행일/전환가액/전환시발행주식수/전환일등/전환채권금액/증가(rowPlus_2) 옮겨 넣음(TODO); 공급사 grid:구분/발행일/주식수/증가된자본금#1(rowPlus_3) 옮겨 넣음(TODO) |
| jldfil50200 | auto | 4/4 | 0 |  |  |  |
| jldfil50200n | auto | 3/3 | 0 |  |  |  |
| jldfil52700 | auto | 3/3 | 0 |  |  |  |
| jldfil52710 | todo | 1/3 | 2 |  |  | 그리드 헤더 '파이프라인' 공급사 쪽 없음; 그리드 헤더 '임상' 공급사 쪽 없음; 그리드 헤더 '기술이전' 공급사 쪽 없음; 그리드 닮음 0.73: grid:IND승인기관/계약상대방/계약일/기술이전/대상지역/임상/임상국가 ← grd_searchList |
| jldfil52720 | todo | 1/2 | 1 |  |  | jQuery 잔여 1문장에 규칙 19 TODO |
| jldfil53000n | auto | 3/3 | 0 |  |  | 그리드 헤더 '비고' 공급사 쪽 없음; 그리드 1:1(헤더 다름) |
| jldfil54000 | auto | 3/3 | 0 |  |  |  |
| jldfil54000n | auto | 3/3 | 0 |  |  |  |
| jldfil54100 | todo | 11/12 | 2 |  | trigger:수정(btn_goEditForm) | 버튼 'trigger:search' ← 공급사 'trigger:icon:search'(btn_openComInfo4fee, 같은 뜻); 공급사 trigger:수정(btn_goEditForm) 옮겨 넣음(TODO) |
| jldfil54100n | todo | 11/12 | 1 |  |  | 버튼 'trigger:Search' ← 공급사 'trigger:icon:search'(divSearchBtn_cell, 같은 뜻) |
| jldfil55000n | auto | 4/4 | 0 |  |  | 그리드 헤더 '비고' 공급사 쪽 없음; 그리드 1:1(헤더 다름) |
| jldfil55700 | todo | 7/9 | 2 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_search, 같은 뜻); 그리드 헤더 '발행<br/>회사' 공급사 쪽 없음; 그리드 헤더 '유가<br/>코스닥<br/>구분' 공급사 쪽 없음; 그리드 헤더 '공모<br/>(확정)<br/>가격' 공급사 쪽 없음 |
| jldfil55700n | todo | 7/8 | 1 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_search, 같은 뜻); 그리드 헤더 '발행<br/>회사' 공급사 쪽 없음; 그리드 헤더 '유가<br/>코스닥<br/>구분' 공급사 쪽 없음; 그리드 헤더 '공모<br/>(확정)<br/>가격' 공급사 쪽 없음 |
| jldfil55800 | todo | 4/6 | 2 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_search, 같은 뜻) |
| jldfil55800n | todo | 4/5 | 1 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_search, 같은 뜻) |
| jldfil58000 | todo | 8/9 | 1 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_search, 같은 뜻) |
| jldfil58000n | auto | 8/8 | 0 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_search, 같은 뜻) |
| jldfil58001 | todo | 1/2 | 1 |  |  |  |
| jldfil59400 | auto | 4/4 | 0 |  |  |  |
| jldfil59410 | todo | 58/71 | 34 |  | select:#1(slc_listAgnccomMbrNo0); select:#2(slc_agnccomMbr_g); select:#3(slc_listExcInstCd0); trigger:제척기관삭제(img_267) | 버튼 'trigger:search' ← 공급사 'trigger:icon:search'(btn_OpenIndCodeWin, 같은 뜻); trigger:삭제 퍼블리싱 1개 ↔ 공급사 3개: 앞에서부터 1개 이음(나머지 TODO); 공급사 select:#1(slc_listAgnccomMbrNo0) 옮겨 넣음(TODO); 공급사 select:#2(slc_agnccomMbr_g) 옮겨 넣음(TODO) |
| jldfil59411 | todo | 1/2 | 1 |  |  | jQuery 잔여 1문장에 규칙 19 TODO |
| jldfil70101 | todo | 0/0 | 4 |  | trigger:Ⅰ.발행증권에관한사항(btn_explainShow); trigger:Ⅱ.발행증권에관한사항2(손실제한)(btn_explainShow_2); trigger:Ⅲ.발행회사에관한사항(btn_explainShow_3); trigger:Ⅳ.보증인/제3자LP에관한사항(btn_explainShow_4) | 공급사 trigger:Ⅰ.발행증권에관한사항(btn_explainShow) 옮겨 넣음(TODO); 공급사 trigger:Ⅱ.발행증권에관한사항2(손실제한)(btn_explainShow_2) 옮겨 넣음(TODO); 공급사 trigger:Ⅲ.발행회사에관한사항(btn_explainShow_3) 옮겨 넣음(TODO); 공급사 trigger:Ⅳ.보증인/제3자LP에관한사항(btn_explainShow_4) 옮겨 넣음(TODO) |
| jldfil70201 | frozen | 0/0 | 0 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 1건: 선택 여부 → grd_pageList.getCheckedIndex('checkSub') |
| jldfil70211 | auto | 3/3 | 0 |  |  |  |
| jldfil70301 | frozen | 0/0 | 0 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 1건: 선택 여부 → grd_pageList.getCheckedIndex('checkSub') |
| jldfil70311 | auto | 3/3 | 0 |  |  |  |
| jldfil70401 | frozen | 0/0 | 0 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 1건: 선택 여부 → grd_pageList.getCheckedIndex('checkSub') |
| jldfil70411 | auto | 3/3 | 0 |  |  |  |
| jldfil70501 | frozen | 0/0 | 0 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 1건: 선택 여부 → grd_pageList.getCheckedIndex('checkSub') |
| jldfil70511 | auto | 3/3 | 0 |  |  |  |
| jldfil70601 | auto | 8/8 | 0 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻) |
| jldfil70701 | todo | 2/2 | 1 |  | pageList:(krxpage_pagenavigator_41) | 공급사 pageList:(krxpage_pagenavigator_41) 옮겨 넣음(TODO) |
| jldfil70702 | todo | 10/10 | 8 |  | input:보증인코드(ipt_srtyCd); input:보증인종류입력(ipt_srtyKindContn); input:보증인명#2(ipt_srtyNm_2); input:보증인약명#2(ipt_srtyAbbrv_2) | input:보증인명 퍼블리싱 1개 ↔ 공급사 2개: 앞에서부터 1개 이음(나머지 TODO); input:보증인약명 퍼블리싱 1개 ↔ 공급사 2개: 앞에서부터 1개 이음(나머지 TODO); input:보증인영문명 퍼블리싱 1개 ↔ 공급사 2개: 앞에서부터 1개 이음(나머지 TODO); input:보증인영문약명 퍼블리싱 1개 ↔ 공급사 2개: 앞에서부터 1개 이음(나머지 TODO) |
| jldfil70801 | frozen | 0/0 | 0 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 1건: 선택 여부 → grd_pageList.getCheckedIndex('checkSub') |
| jldfil70811 | auto | 3/3 | 0 |  |  |  |
| jldfil70901 | frozen | 0/0 | 0 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 1건: 선택 여부 → grd_pageList.getCheckedIndex('checkSub') |
| jldfil70911 | auto | 3/3 | 0 |  |  |  |
| jldfil71001 | frozen | 0/0 | 0 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 1건: 선택 여부 → grd_pageList.getCheckedIndex('checkSub') |
| jldfil71011 | auto | 3/3 | 0 |  |  |  |
| jldfil71111 | auto | 3/3 | 0 |  |  |  |
| jldfil71201 | todo | 0/0 | 3 |  | trigger:Ⅰ.발행증권에관한사항(btn_explainShow); trigger:Ⅱ.상장신청인에관한사항(btn_explainShow_2); trigger:Ⅲ.기타사항(btn_explainShow_3) | 공급사 trigger:Ⅰ.발행증권에관한사항(btn_explainShow) 옮겨 넣음(TODO); 공급사 trigger:Ⅱ.상장신청인에관한사항(btn_explainShow_2) 옮겨 넣음(TODO); 공급사 trigger:Ⅲ.기타사항(btn_explainShow_3) 옮겨 넣음(TODO) |
| jldfil71401 | todo | 2/2 | 1 |  | trigger:신규작성(btn_openAssgnPop) | 공급사 trigger:신규작성(btn_openAssgnPop) 옮겨 넣음(TODO) |
| jldfil71901 | auto | 7/7 | 0 |  |  | 버튼 'trigger:조회' ← 공급사 'trigger:검색'(btn_Search, 같은 뜻) |
| jldfil72000 | auto | 1/1 | 0 |  |  |  |
| jldfil72100 | frozen | 0/0 | 5 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 4건: 체크박스 헬퍼 인자·판정 → 컴포넌트, 사문 onsubmit 제거 |
| jldfil73000 | auto | 0/0 | 0 |  |  | jQuery 잔여 3문장에 규칙 19 TODO |
| jldinf35000 | frozen | 0/0 | 13 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 4건: 동적 id val/[0] → getComponent(id).getValue()/컴포넌트 |
| jldinf35101 | auto | 0/1 | 0 |  |  | 퍼블리싱 전용 버튼 'Close'(공통 처리 대상); jQuery 잔여 4문장에 규칙 19 TODO |
| jldinf91000 | todo | 0/2 | 1 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); 참조 ipt_type 옮겨 넣음(TODO) |
| jldinf91100 | manual | 0/1 | 1 |  | grid:거치기간/상환금액/이자율/이자지급일/차수(id_redmpt_methd_tp_cd_list) | 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); 공급사 grid:거치기간/상환금액/이자율/이자지급일/차수(id_redmpt_methd_tp_cd_list) 옮겨 넣음(TODO); override accept: 채권 상세정보 팝업: 퍼블리싱은 읽기 전용 textbox 표, 공급사 상호작용 요소는 상환방법 그리드(id_redmpt_methd_tp_cd_list) 하나 — 본문 끝에 TODO 표지와 함께 옮겨 넣은 결과를 받아들임. 퍼블리셔가 '상환방법' 표 자리로 옮길 것. 숨은 입력(ipt_stdcdType·ipt_stdCd·ipt_modDelCd)은 스크립트 참조 규칙 ⑦ 로 옮겨짐 |
| jldinf91200 | auto | 0/2 | 0 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); jQuery 잔여 1문장에 규칙 19 TODO |
| jldinf91300 | auto | 0/2 | 0 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상) |
| jldinf91400 | auto | 0/2 | 0 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); jQuery 잔여 3문장에 규칙 19 TODO |
| jldinf91500 | auto | 0/2 | 0 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); jQuery 잔여 3문장에 규칙 19 TODO |
| jldinf91600 | auto | 0/2 | 0 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); jQuery 잔여 5문장에 규칙 19 TODO |
| jldinf91700 | auto | 0/2 | 0 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); jQuery 잔여 2문장에 규칙 19 TODO |
| jldinf91800 | auto | 0/2 | 0 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); jQuery 잔여 2문장에 규칙 19 TODO |
| jldinf91900 | auto | 0/1 | 0 |  |  | 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); jQuery 잔여 2문장에 규칙 19 TODO |
| jldinf92000 | auto | 0/1 | 0 |  |  | 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); jQuery 잔여 2문장에 규칙 19 TODO |
| jldinf92100 | auto | 0/2 | 0 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상) |
| jldinf92200 | auto | 0/2 | 0 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상) |
| jldinf92300 | frozen | 0/0 | 0 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성(규칙 19) — jQuery 1건: 빈 ready 블록 제거 |
| jldinf92400 | auto | 0/2 | 0 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); jQuery 잔여 1문장에 규칙 19 TODO |
| jldinf92500 | mismatch | 0/0 | 0 |  |  | override skip: 퍼블리싱은 '투자계약증권 상세정보'(읽기 전용), 공급사 본문 제목은 'ETN 상세정보 변경'(입력 32개 수정 폼) — 같은 이름에 다른 화면/다른 성격. 공급사 산출의 화면 배정 오류 가능성 포함해 회신 요청 |
| jldods20000 | todo | 1/2 | 6 |  | trigger:접기(foldBt); trigger:등록#1(input_46); trigger:등록#2(input_51); trigger:등록#3(input_55) | 그리드 헤더 '담당기관' 공급사 쪽 없음; 그리드 닮음 0.60: grid:공시구분/담당기관/업무및서식/제출시한#1 ← grd_integsrchList; 공급사 trigger:접기(foldBt) 옮겨 넣음(TODO); 공급사 trigger:등록#1(input_46) 옮겨 넣음(TODO) |
| jldods20010 | mismatch | 0/0 | 0 |  |  | override skip: 퍼블리싱은 '통합검색 결과 상세'(업무해설 본문), 공급사는 '키워드목록'(ㄱ~ㅎ 색인 버튼·검색) — 같은 이름에 다른 화면. 퍼블리셔 확인 |
| jldstf10002 | todo | 2/5 | 3 |  | trigger:공시뷰어새창열기(viewer_btn) | 버튼 'trigger:조회' ← 공급사 'trigger:icon:search'(newWindowId, 같은 뜻); 버튼 'trigger:닫기' ← 공급사 'trigger:icon:close'(img_18, 같은 뜻); 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 공급사 trigger:공시뷰어새창열기(viewer_btn) 옮겨 넣음(TODO) |
| jldstf30100 | manual | 7/10 | 4 |  | trigger:일정추출계산식(btn_openSchdul) | override: select:년도#1 ← slc_YYYY; override: select:년도#2 ← slc_MM; override: select:표준산업업종 ← slc_STD_INDTP; override: trigger:신규 ← btn_New |
| jldstf30101 | auto | 0/0 | 0 |  |  |  |
| jldstf30110 | manual | 5/8 | 6 |  | trigger:icon:row_add(btn_New); trigger:메모입력(btn_Memo); trigger:일정추출계산식(btn_openSchdul) | override: select:년도#1 ← slc_YYYY; override: select:년도#2 ← slc_MM; override: select:표준산업업종 ← slc_STD_INDTP; 공급사 trigger:icon:row_add(btn_New) 옮겨 넣음(TODO) |
| jldstf30319 | todo | 1/3 | 3 |  | grid:(grd_ques) | 버튼 'trigger:닫기' ← 공급사 'trigger:icon:close'(img_51, 같은 뜻); 공급사 grid:(grd_ques) 옮겨 넣음(TODO) |
| jldstf31200 | todo | 4/281 | 278 |  | inputCalendar:취득/처분신고서제출일(이익소각신고일)(cal_decisionDate); trigger:icon:download(btn_ExcelDown); grid:거래일/누적체결수량/당일종가/대표종목(excelData1) | input:종목코드 퍼블리싱 9개 ↔ 공급사 1개: 앞에서부터 1개 이음(나머지 TODO); input:회사이름 퍼블리싱 9개 ↔ 공급사 1개: 앞에서부터 1개 이음(나머지 TODO); 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상) |
| jldstf70000 | todo | 4/10 | 13 |  | input:(ipt_formatKeywrd); select:#1(slc_disclsTp); select:#2(slc_ldMktTpCd); select:#3(ipt_modYn) | 그리드 1:1(헤더 다름); 버튼 'trigger:Search' ← 공급사 'trigger:조회#1'(input_25, 같은 뜻); 버튼 'trigger:조회' ← 공급사 'trigger:조회#2'(input_27, 같은 뜻); 공급사 input:(ipt_formatKeywrd) 옮겨 넣음(TODO) |
| jldstf70010 | frozen | 0/0 | 44 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성 2차(규칙 19) — jQuery 10건: as-is setBtnDisable/Enable(정의 없는 공통) + span 래퍼 → 버튼 컴포넌트 setDisabled, chargInstId option:selected → getValue |
| jldstf71000 | todo | 1/22 | 26 |  | input:#1(ipt_keywrdNm); input:#2(ipt_newKeywrdNm); trigger:등록(input_72) | 공급사 input:#1(ipt_keywrdNm) 옮겨 넣음(TODO); 공급사 input:#2(ipt_newKeywrdNm) 옮겨 넣음(TODO); 공급사 trigger:등록(input_72) 옮겨 넣음(TODO); 참조 ipt_keywrdInit 옮겨 넣음(TODO) |
| jldstf72000 | todo | 3/7 | 11 |  | select:(slc_junmoon); input:#1(ipt_searchText); input:#2(ipt_searchText2); trigger:관련법규조항등록#1(btn_regRelLaw) | 그리드 닮음 0.75: grid:관련법규조항/단위조항/법규전문 ← grd_resultList; 공급사 select:(slc_junmoon) 옮겨 넣음(TODO); 공급사 input:#1(ipt_searchText) 옮겨 넣음(TODO); 공급사 input:#2(ipt_searchText2) 옮겨 넣음(TODO) |
| jldstf73000 | todo | 4/6 | 5 |  | input:(ipt_searchText); trigger:단위조항등록#1(btn_regRelLawDtl); trigger:단위조항등록#2(btn_regRelLawDtl_2) | 그리드 1:1(헤더 다름); 공급사 input:(ipt_searchText) 옮겨 넣음(TODO); 공급사 trigger:단위조항등록#1(btn_regRelLawDtl) 옮겨 넣음(TODO); 공급사 trigger:단위조항등록#2(btn_regRelLawDtl_2) 옮겨 넣음(TODO) |
| jldstf75100 | todo | 3/31 | 35 |  | input:#1(ipt_formatKeywrd); select:#1(slc_disclsTp); select:#2(slc_ldMktTpCd); select:#3(ipt_modYn) | 버튼 'trigger:Search' ← 공급사 'trigger:조회#1'(input_14, 같은 뜻); 버튼 'trigger:조회#1' ← 공급사 'trigger:조회#2'(input_16, 같은 뜻); 버튼 'trigger:조회#2' ← 공급사 'trigger:조회#3'(input_107, 같은 뜻); 공급사 input:#1(ipt_formatKeywrd) 옮겨 넣음(TODO) |
| jldstf75200 | todo | 2/9 | 13 |  | input:(ipt_formatKeywrd); select:#1(slc_disclsTp); select:#2(slc_ldMktTpCd); select:#3(ipt_modYn) | 버튼 'trigger:Search' ← 공급사 'trigger:조회#1'(input_24, 같은 뜻); 버튼 'trigger:조회' ← 공급사 'trigger:조회#2'(input_26, 같은 뜻); 공급사 input:(ipt_formatKeywrd) 옮겨 넣음(TODO); 공급사 select:#1(slc_disclsTp) 옮겨 넣음(TODO) |
| jldstf75300 | todo | 1/9 | 21 |  | input:#1(ipt_formatKeywrd); trigger:조회#2(input_19); select:#1(slc_disclsTp); select:#2(slc_ldMktTpCd) | trigger:조회 퍼블리싱 1개 ↔ 공급사 3개: 앞에서부터 1개 이음(나머지 TODO); 공급사 input:#1(ipt_formatKeywrd) 옮겨 넣음(TODO); 공급사 trigger:조회#2(input_19) 옮겨 넣음(TODO); 공급사 select:#1(slc_disclsTp) 옮겨 넣음(TODO) |
| jldstf75500 | todo | 2/9 | 13 |  | input:(ipt_formatKeywrd); select:#1(slc_disclsTp); select:#2(slc_ldMktTpCd); select:#3(ipt_modYn) | 버튼 'trigger:Search' ← 공급사 'trigger:조회#1'(input_24, 같은 뜻); 버튼 'trigger:조회' ← 공급사 'trigger:조회#2'(input_26, 같은 뜻); 공급사 input:(ipt_formatKeywrd) 옮겨 넣음(TODO); 공급사 select:#1(slc_disclsTp) 옮겨 넣음(TODO) |
| jldstf75600 | todo | 2/9 | 13 |  | input:(ipt_formatKeywrd); select:#1(slc_disclsTp); select:#2(slc_ldMktTpCd); select:#3(ipt_modYn) | 버튼 'trigger:Search' ← 공급사 'trigger:조회#1'(input_24, 같은 뜻); 버튼 'trigger:조회' ← 공급사 'trigger:조회#2'(input_26, 같은 뜻); 공급사 input:(ipt_formatKeywrd) 옮겨 넣음(TODO); 공급사 select:#1(slc_disclsTp) 옮겨 넣음(TODO) |
| jldstf76200 | todo | 1/1 | 2 |  | trigger:등록(btn_openRegisterPop); trigger:저장(btn_setOutOrdNo) | 공급사 trigger:등록(btn_openRegisterPop) 옮겨 넣음(TODO); 공급사 trigger:저장(btn_setOutOrdNo) 옮겨 넣음(TODO); jQuery 잔여 8문장에 규칙 19 TODO |
| uldmgt50002 | mismatch | 0/0 | 0 |  |  | override skip: 퍼블리싱은 '기본정보서식맵핑조회'(검색 조건 5 + 그리드, 이미 의미 id rdo_MKT_ID·txb_ELMT_KOR_NM·btn_Search·grd_Grid 를 가짐 — mgt-front 용으로 만든 파일), 공급사 본문은 숨은 입력 3 + 아이콘 버튼 10(프레임 셸). 대응 불가 — mgt 쪽 전환본과 짝지을 것 |
| uldmgt50014 | mismatch | 0/0 | 0 |  |  | override skip: 퍼블리싱 본문이 빈 자리표('(팝업)양식보기') — 공급사는 ${htmlContent} 서버 렌더 뷰어(B-1 회신 대상). 퍼블리싱 미작성 |
| uldmgt50300 | todo | 1/3 | 2 |  |  | 버튼 'trigger:등록' ← 공급사 'trigger:icon:save'(img_15, 같은 뜻) |
| uldmgt50301 | todo | 2/8 | 12 |  | select:#1(slc_ldMktTpCd); inputCalendar:(cal_lawAmendDd); input:(ipt_lawTitle); upload:(upd_lawBinfile) | 버튼 'trigger:닫기' ← 공급사 'trigger:icon:close'(img_83, 같은 뜻); 버튼 'trigger:등록' ← 공급사 'trigger:icon:save'(img_82, 같은 뜻); 공급사 select:#1(slc_ldMktTpCd) 옮겨 넣음(TODO); 공급사 inputCalendar:(cal_lawAmendDd) 옮겨 넣음(TODO) |
| uldmgt50302 | todo | 0/2 | 2 |  |  |  |
| uldmgt50303 | todo | 2/3 | 2 |  | trigger:icon:close#1(img_49); trigger:icon:close#2(img_52) | 버튼 'trigger:삭제' ← 공급사 'trigger:icon:delete'(img_48, 같은 뜻); 버튼 'trigger:등록' ← 공급사 'trigger:icon:save'(img_51, 같은 뜻); 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상); 공급사 trigger:icon:close#1(img_49) 옮겨 넣음(TODO) |
| uldmgt50304 | todo | 0/3 | 3 |  |  |  |
| uldmgt50305 | todo | 2/4 | 3 |  | input:(ipt_title) | 버튼 'trigger:닫기' ← 공급사 'trigger:icon:close'(img_54, 같은 뜻); 버튼 'trigger:등록' ← 공급사 'trigger:icon:save'(img_53, 같은 뜻); 공급사 input:(ipt_title) 옮겨 넣음(TODO) |
| uldmgt50306 | todo | 0/4 | 4 |  |  |  |
| uldmgt50307 | todo | 2/3 | 1 |  |  | 버튼 'trigger:닫기' ← 공급사 'trigger:icon:close'(img_54, 같은 뜻); 버튼 'trigger:등록' ← 공급사 'trigger:icon:save'(img_53, 같은 뜻) |
| uldmgt50308 | todo | 1/3 | 2 |  |  | 버튼 'trigger:목록' ← 공급사 'trigger:icon:list_more'(img_53, 같은 뜻) |
| uldmgt50309 | auto | 1/1 | 0 |  |  | 버튼 'trigger:닫기' ← 공급사 'trigger:icon:close'(img_25, 같은 뜻) |
| uldmgt50310 | todo | 2/3 | 1 |  |  | 버튼 'trigger:목록' ← 공급사 'trigger:icon:list_more'(img_101, 같은 뜻); 버튼 'trigger:등록' ← 공급사 'trigger:icon:save'(img_100, 같은 뜻) |
| uldmgt50311 | todo | 2/6 | 8 |  | select:#1(slc_notiObjSysTpCd); select:#2(slc_ldHelpUseAreaTpCd); select:#3(slc_upHelpClssId); input:(ipt_helpClssNm) | 버튼 'trigger:닫기' ← 공급사 'trigger:icon:close'(img_76, 같은 뜻); 버튼 'trigger:저장' ← 공급사 'trigger:icon:save'(img_75, 같은 뜻); 공급사 select:#1(slc_notiObjSysTpCd) 옮겨 넣음(TODO); 공급사 select:#2(slc_ldHelpUseAreaTpCd) 옮겨 넣음(TODO) |
| uldmgt50312 | todo | 2/6 | 8 |  | select:#1(slc_notiObjSysTpCd); select:#2(slc_ldHelpUseAreaTpCd); select:#3(slc_upHelpClssId); input:(ipt_helpClssNm) | 버튼 'trigger:닫기' ← 공급사 'trigger:icon:close'(img_76, 같은 뜻); 버튼 'trigger:저장' ← 공급사 'trigger:icon:save'(img_75, 같은 뜻); 공급사 select:#1(slc_notiObjSysTpCd) 옮겨 넣음(TODO); 공급사 select:#2(slc_ldHelpUseAreaTpCd) 옮겨 넣음(TODO) |
| uldmgt50313 | todo | 2/6 | 8 |  | select:#1(slc_notiObjSysTpCd); select:#2(slc_ldHelpUseAreaTpCd); select:#3(slc_upHelpClssId); input:(ipt_helpClssNm) | 버튼 'trigger:닫기' ← 공급사 'trigger:icon:close'(img_76, 같은 뜻); 버튼 'trigger:저장' ← 공급사 'trigger:icon:save'(img_75, 같은 뜻); 공급사 select:#1(slc_notiObjSysTpCd) 옮겨 넣음(TODO); 공급사 select:#2(slc_ldHelpUseAreaTpCd) 옮겨 넣음(TODO) |
| uldmgt50314 | todo | 1/3 | 1 |  |  | 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상) |
| uldmgt50315 | todo | 1/3 | 1 |  |  | 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상) |
| uldmgt50316 | mismatch | 0/0 | 0 |  |  | override skip: 시행세칙 등록: 퍼블리싱은 법규/세칙 2열 정적 표 14행(행마다 '등록' 목업 버튼), 공급사는 그리드 grd_lawItems(법규/세칙). 그리드 → 버튼 컬럼 있는 그리드로 퍼블리싱 재설계 필요(목업 행을 데이터로 오인하지 않도록 병합하지 않음) |
| uldmgt50317 | todo | 2/3 | 1 |  |  | 버튼 'trigger:닫기' ← 공급사 'trigger:icon:close'(img_59, 같은 뜻); 버튼 'trigger:저장' ← 공급사 'trigger:icon:save'(img_58, 같은 뜻) |
| uldmgt50319 | todo | 0/0 | 1 |  | trigger:icon:close(img_15) | 공급사 trigger:icon:close(img_15) 옮겨 넣음(TODO) |
| uldmgt50320 | todo | 0/4 | 4 |  |  |  |
| uldmgt50321 | todo | 2/6 | 8 |  | select:#1(slc_notiObjSysTpCd); select:#2(slc_ldHelpUseAreaTpCd); select:#3(slc_upHelpClssId); input:(ipt_helpClssNm) | 버튼 'trigger:닫기' ← 공급사 'trigger:icon:close'(img_77, 같은 뜻); 버튼 'trigger:저장' ← 공급사 'trigger:icon:save'(img_76, 같은 뜻); 공급사 select:#1(slc_notiObjSysTpCd) 옮겨 넣음(TODO); 공급사 select:#2(slc_ldHelpUseAreaTpCd) 옮겨 넣음(TODO) |
| uldmgt50322 | todo | 1/3 | 1 |  |  | 퍼블리싱 전용 버튼 '닫기'(공통 처리 대상) |
| uldmgt50323 | todo | 2/3 | 1 |  |  | 버튼 'trigger:닫기' ← 공급사 'trigger:icon:close'(img_54, 같은 뜻); 버튼 'trigger:등록' ← 공급사 'trigger:icon:save'(img_53, 같은 뜻) |
| uldmgt76100 | todo | 2/11 | 16 |  | select:#1(slc_notiObjSysTpCd); select:#2(ipt_periodFlag); inputCalendar:#1(cal_strtDdtm); inputCalendar:#2(cal_endDdtm) | 버튼 'trigger:닫기' ← 공급사 'trigger:icon:close'(img_90, 같은 뜻); 버튼 'trigger:등록' ← 공급사 'trigger:icon:save'(img_89, 같은 뜻); 공급사 select:#1(slc_notiObjSysTpCd) 옮겨 넣음(TODO); 공급사 select:#2(ipt_periodFlag) 옮겨 넣음(TODO) |
| uldmgt76101 | frozen | 0/0 | 30 |  |  | override frozen: 2026-10-06 jQuery 화면별 재작성 2차(규칙 19) — jQuery 2건: option disabled → 컴포넌트 setDisabled |
