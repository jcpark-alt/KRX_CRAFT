# 퍼블리싱 병합 리포트 (publish ↔ ui-tobe)

> `python conversion/tools/publish_merge.py conversion/jsp-front/ui-tobe` 가 만든다. `auto` 는 `conversion/jsp-front/ui-pub/` 에 병합 결과를 썼다(스크립트 참조 전부 자리잡음·공급사 상호작용 컴포넌트 전부 대응). `review` 는 사유를 보고 손으로 잇는다.

화면 260 · auto 66 · review 194 · error 0

| 화면 | 판정 | 정합/퍼블리싱 항목 | 스크립트 참조 누락 | 공급사 미대응 | 메모 |
| --- | --- | ---: | --- | --- | --- |
| jldfil00000 | review | 4/9 |  | trigger 'icon:download'; trigger 'icon:guide'; trigger 'icon:search'; select '' | 퍼블리싱 trigger '도움말' ↔ 공급사 대응 없음; input '보고서제목' 2개 ← 같은 개수, 순서대로; 퍼블리싱 trigger '조회' 가 2개(라벨 중복) |
| jldfil00001 | review | 3/9 |  | trigger 'icon:download'; trigger 'icon:guide'; trigger 'icon:search'; select '' | 퍼블리싱 trigger '도움말' ↔ 공급사 대응 없음; 퍼블리싱 grid '문서구분/보고서명/영문보기' ↔ 공급사 대응 없음; input '보고서제목' 2개 ← 같은 개수, 순서대로 |
| jldfil00006 | review | 3/5 |  |  | 버튼 '도움말' ← 공급사 아이콘 guide(img_41); 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '이전' ↔ 공급사 대응 없음 |
| jldfil00010 | review | 3/11 |  | input '종목명'; trigger 'icon:search'; input ''; trigger 'icon:next' | 버튼 '도움말' ← 공급사 아이콘 guide(img_41); 퍼블리싱 input '추가제목입력' ↔ 공급사 대응 없음; 퍼블리싱 select '제출인정보' ↔ 공급사 대응 없음 |
| jldfil00013 | review | 1/3 |  | grid 'grid' | 버튼 '도움말' ← 공급사 아이콘 guide(img_15); 퍼블리싱 trigger '제출' ↔ 공급사 대응 없음; 퍼블리싱 trigger '취소' ↔ 공급사 대응 없음 |
| jldfil00014 | review | 1/2 |  |  | 버튼 '도움말' ← 공급사 아이콘 guide(img_16); 퍼블리싱 trigger '제출현황바로가기' ↔ 공급사 대응 없음 |
| jldfil00021 | auto | 9/9 |  |  | 그리드 헤더 '처리상태' 공급사 쪽 없음; 버튼 '도움말' ← 공급사 아이콘 guide(img_109); 버튼 '조회' ← 공급사 아이콘 search(img_149) |
| jldfil00022 | auto | 7/7 |  |  | 버튼 '도움말' ← 공급사 아이콘 guide(img_74); 버튼 '조회' ← 공급사 아이콘 search(img_104); inputCalendar '기간' 2개 ← 같은 개수, 순서대로 |
| jldfil00033 | review | 17/20 |  | input ''; trigger '닫기' | 퍼블리싱 input '회사명' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 '검색'(동의어); 퍼블리싱 grid '대표이사명/발행기관<br/>코드/사업자등록번호/상장<br/>여부/회사명/' ↔ 공급사 대응 없음 |
| jldfil00100 | auto | 9/9 |  |  | 버튼 '도움말' ← 공급사 아이콘 guide(img_52); 버튼 '조회' ← 공급사 아이콘 search(img_92); inputCalendar '기간' 2개 ← 같은 개수, 순서대로 |
| jldfil00101 | review | 2/5 |  | trigger 'icon:save'; select '' | 버튼 '도움말' ← 공급사 아이콘 guide(img_80); 퍼블리싱 select '' ↔ 공급사 대응 없음; 퍼블리싱 grid '구분/보고서명/정정/정정요구여부' ↔ 공급사 대응 없음 |
| jldfil00175 | auto | 7/7 |  |  | 그리드 헤더 '비고' 공급사 쪽 없음; 버튼 '도움말' ← 공급사 아이콘 guide(img_70); 버튼 '조회' ← 공급사 아이콘 search(img_100) |
| jldfil00200 | auto | 9/9 |  |  | 그리드 헤더 '정정여부' 공급사 쪽 없음; 그리드 헤더 '정정요구여부' 공급사 쪽 없음; 버튼 '도움말' ← 공급사 아이콘 guide(img_78) |
| jldfil00300 | auto | 6/6 |  |  | 버튼 '도움말' ← 공급사 아이콘 guide(img_81); 버튼 '조회' ← 공급사 아이콘 search(img_101) |
| jldfil00330 | review | 7/9 |  | trigger 'icon:guide'; trigger 'icon:search' | 퍼블리싱 trigger 'search' ↔ 공급사 대응 없음; 퍼블리싱 trigger '조회' ↔ 공급사 대응 없음; inputCalendar '기간' 2개 ← 같은 개수, 순서대로 |
| jldfil00400 ⚠중복 | review | 9/9 |  | input '회사코드(명)'; trigger '일괄삭제' | 그리드 헤더 '출처' 공급사 쪽 없음; 버튼 '도움말' ← 공급사 아이콘 guide(img_56); 버튼 '조회' ← 공급사 아이콘 search(img_102) |
| jldfil00401 | review | 6/8 |  |  | 그리드 헤더 '타이틀' 공급사 쪽 없음; 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음; 퍼블리싱 trigger '선택완료' ↔ 공급사 대응 없음 |
| jldfil00500 | review | 5/8 |  | trigger 'icon:guide'; trigger 'icon:delete'; select '' | 버튼 '조회' ← 공급사 아이콘 search(img_61); 퍼블리싱 select '' ↔ 공급사 대응 없음; 퍼블리싱 trigger '제출' ↔ 공급사 대응 없음 |
| jldfil05011 | review | 3/3 |  | trigger '선택제출'; trigger '엑셀다운'; trigger '엑셀업로드' | 그리드 헤더 '심사<br/>담당자' 공급사 쪽 없음 |
| jldfil05016 | review | 3/3 |  | trigger '일괄입력후선택제출'; trigger '선택제출' | 그리드 헤더 '심사<br/>담당자' 공급사 쪽 없음; 그리드 헤더 '경영상<br/>중대한 사실<br/>발생 여부' 공급사 쪽 없음 |
| jldfil05021 | review | 4/5 |  | trigger '검색' | 퍼블리싱 trigger 'search' ↔ 공급사 대응 없음 |
| jldfil05026 | auto | 3/3 |  |  |  |
| jldfil05031 | review | 8/8 |  | trigger '예비심사청구데이터다운로드' | 버튼 '조회' ← 공급사 '검색'(동의어); inputCalendar '발행일' 2개 ← 같은 개수, 순서대로 |
| jldfil05036 | review | 0/0 |  | trigger 'Ⅰ.발행회사에관한사항Ⅱ.주식워런트증권에관한사항Ⅲ.유동성공급에관한사항'; trigger 'Ⅰ.발행회사에관한사항Ⅱ.상장후사용하고자하는명칭Ⅲ.주식워런트증권에관한사항Ⅳ.경영상중대한사실발생여부' |  |
| jldfil05039 | review | 2/6 |  | trigger 'Excel'; grid 'grid' | 퍼블리싱 select '권리형태' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 '검색'(동의어); 퍼블리싱 trigger '엑셀다운로드' ↔ 공급사 대응 없음 |
| jldfil05040 | review | 5/8 |  | input '부과수수료합계'; trigger '엑셀저장' | 퍼블리싱 input '' ↔ 공급사 대응 없음; 퍼블리싱 trigger '엑셀다운로드' ↔ 공급사 대응 없음; 퍼블리싱 grid '발행가액/발행수량/발행총액/수수료/종목약명' ↔ 공급사 대응 없음 |
| jldfil05100 | auto | 1/1 |  |  |  |
| jldfil05104 | auto | 2/2 |  |  | 그리드 헤더 '생년월일<br/>(사업자번호)' 공급사 쪽 없음; 그리드 헤더 '부여<br/>결의일' 공급사 쪽 없음; 그리드 헤더 '주식의<br/>종류' 공급사 쪽 없음 |
| jldfil10000 | review | 8/9 |  | input '회사코드(명)' | 퍼블리싱 trigger '도움말' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 '검색'(동의어); inputCalendar '기간' 2개 ← 같은 개수, 순서대로 |
| jldfil10100 | auto | 3/3 |  |  | 그리드 헤더 '확정<br/>여부' 공급사 쪽 없음 |
| jldfil10200 | review | 0/6 |  | grid 'grid'; grid 'grid'; grid 'grid' | 퍼블리싱 grid '불성실지정예고' ↔ 공급사 대응 없음; 퍼블리싱 grid '불성실공시' ↔ 공급사 대응 없음; 퍼블리싱 grid '관리종목지정/변경구분/변경일/사유' ↔ 공급사 대응 없음 |
| jldfil10300 | auto | 3/3 |  |  | 그리드 헤더 '확정<br/>여부' 공급사 쪽 없음 |
| jldfil10601 | review | 0/3 |  |  | 퍼블리싱 select '' ↔ 공급사 대응 없음; 퍼블리싱 trigger '도움말' 가 2개(라벨 중복) |
| jldfil10602 | auto | 7/7 |  |  | 버튼 '조회' ← 공급사 '검색'(동의어); inputCalendar '기간' 2개 ← 같은 개수, 순서대로 |
| jldfil10603 | review | 9/10 | txt_mainFormName |  | 퍼블리싱 select '제출인정보' ↔ 공급사 대응 없음 |
| jldfil10605 | review | 3/3 |  | grid 'grid' |  |
| jldfil10606 | review | 1/2 |  |  | 퍼블리싱 trigger '제출현황바로가기' ↔ 공급사 대응 없음 |
| jldfil10607 | auto | 7/7 |  |  | 버튼 '조회' ← 공급사 '검색'(동의어); inputCalendar '기간' 2개 ← 같은 개수, 순서대로 |
| jldfil10608 | review | 9/10 | txt_mainFormName |  | 퍼블리싱 select '제출인정보' ↔ 공급사 대응 없음 |
| jldfil10609 | review | 3/3 |  | grid 'grid' |  |
| jldfil10610 | review | 1/2 |  |  | 퍼블리싱 trigger '제출현황바로가기' ↔ 공급사 대응 없음 |
| jldfil11000 | review | 8/9 | ipt_disclsConsultApplId |  | 버튼 '조회' ← 공급사 '검색'(동의어); 퍼블리싱 trigger '도움말' ↔ 공급사 대응 없음; inputCalendar '기간' 2개 ← 같은 개수, 순서대로 |
| jldfil11010 | review | 7/9 | ipt_telNo | trigger '파일선택'; grid 'grid'; grid 'grid'; trigger '삭제' | 퍼블리싱 trigger '삭제' ↔ 공급사 대응 없음; 퍼블리싱 upload '첨부파일' ↔ 공급사 대응 없음 |
| jldfil11040 | review | 1/1 | ipt_disclsConsultApplId | grid 'grid' |  |
| jldfil11060 | review | 1/3 | ipt_disclsConsultApplId | grid 'grid'; trigger '일괄다운로드'; trigger '삭제'; select '메시지전송' | 퍼블리싱 trigger '임시저장' ↔ 공급사 대응 없음; 퍼블리싱 trigger '상담요청' ↔ 공급사 대응 없음 |
| jldfil15000 | auto | 6/6 |  |  | 버튼 '조회' ← 공급사 '검색'(동의어) |
| jldfil15001 | review | 1/1 |  | trigger '${announcement.nextBbsVO.title}'; trigger '${announcement.preBbsVO.title}' |  |
| jldfil15500 | review | 4/7 |  | input '제목검색' | 퍼블리싱 select '검색구분' ↔ 공급사 대응 없음; 퍼블리싱 input '검색구분' ↔ 공급사 대응 없음; 퍼블리싱 trigger '버튼' ↔ 공급사 대응 없음 |
| jldfil15900 | review | 6/7 |  |  | 퍼블리싱 trigger '버튼' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 '검색'(동의어) |
| jldfil15901 | review | 1/1 |  | trigger '${dsclData.nextBbsVO.title}'; trigger '${dsclData.preBbsVO.title}' |  |
| jldfil16000 | review | 0/8 |  |  | 퍼블리싱 trigger '(구)공시지원TF팀' ↔ 공급사 대응 없음; 퍼블리싱 trigger '공시1팀' ↔ 공급사 대응 없음; 퍼블리싱 trigger '공시2팀' ↔ 공급사 대응 없음 |
| jldfil16200 | review | 4/5 |  | trigger '다음'; trigger '이전'; trigger '임시저장' | 퍼블리싱 trigger '임시저장' ↔ 공급사 대응 없음; select '' 2개 ← 같은 개수, 순서대로 |
| jldfil16201 | review | 1/1 |  | grid 'grid' |  |
| jldfil16202 | auto | 2/2 |  |  |  |
| jldfil16300 | review | 0/24 |  | select '카테고리선택'; input '카테고리선택'; trigger '검색'; trigger '인쇄' | 퍼블리싱 select '카테고리선택' 가 6개(라벨 중복); 퍼블리싱 input '카테고리선택' 가 6개(라벨 중복); 퍼블리싱 trigger '조회' 가 6개(라벨 중복) |
| jldfil16301 | review | 3/3 |  | trigger '인쇄' | 버튼 '조회' ← 공급사 '검색'(동의어) |
| jldfil16400 | review | 4/6 | slc_sltEduRnd1, slc_sltEduRnd2 | trigger '신청'; select '교육회차' | 퍼블리싱 select '교육회차' ↔ 공급사 대응 없음; 퍼블리싱 trigger '저장' ↔ 공급사 대응 없음 |
| jldfil16400n | auto | 3/3 |  |  |  |
| jldfil16402 | auto | 3/3 |  |  | 그리드 헤더 '구분' 공급사 쪽 없음; 그리드 헤더 '입금일' 공급사 쪽 없음; 그리드 헤더 '입금액' 공급사 쪽 없음 |
| jldfil16403 | auto | 2/2 |  |  |  |
| jldfil16403n | review | 2/5 |  | trigger '초기화'; trigger '이전'; trigger '인쇄'; trigger '삭제' | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '삭제' ↔ 공급사 대응 없음; 퍼블리싱 trigger '이전' ↔ 공급사 대응 없음 |
| jldfil16404 | auto | 2/2 |  |  |  |
| jldfil16404n | review | 4/11 |  | input ''; input 'Ο전화'; input 'Ο휴대폰'; input 'Ο이메일' | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '삭제' ↔ 공급사 대응 없음; 퍼블리싱 input '지정자문인지정일' ↔ 공급사 대응 없음 |
| jldfil16406 | review | 0/16 |  |  | 퍼블리싱 grid '구분/사유/입금액/입금일' ↔ 공급사 대응 없음; 퍼블리싱 grid '교육과정명/교육구분/교육일/구분/이수자성명' ↔ 공급사 대응 없음; 퍼블리싱 inputCalendar '입금일기간' 가 4개(라벨 중복) |
| jldfil16500 | auto | 11/11 |  |  | 그리드 헤더 '구분' 공급사 쪽 없음; 그리드 헤더 '교육회차' 공급사 쪽 없음; 그리드 헤더 '공시교육일정' 공급사 쪽 없음 |
| jldfil16501 | review | 6/7 |  | trigger '교육이력반영'; select '교육회차' | 퍼블리싱 select '교육회차' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 아이콘 search(btn_Search); 버튼 '엑셀다운로드' ← 공급사 아이콘 download(btn_excelDownload) |
| jldfil16800 | review | 6/7 |  |  | 퍼블리싱 trigger '버튼' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 '검색'(동의어) |
| jldfil16801 | review | 1/1 |  | trigger '${dsclData.nextBbsVO.title}'; trigger '${dsclData.preBbsVO.title}' |  |
| jldfil17000 | review | 6/7 |  |  | 퍼블리싱 trigger '버튼' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 '검색'(동의어) |
| jldfil17001 | review | 1/1 |  | trigger '${dsclData.nextBbsVO.title}'; trigger '${dsclData.preBbsVO.title}' |  |
| jldfil17300 | auto | 10/10 |  |  | 버튼 '조회' ← 공급사 '검색'(동의어); inputCalendar '기간' 2개 ← 같은 개수, 순서대로 |
| jldfil17301 | review | 1/10 |  | trigger '현재등록된파일:${entity.attachFileNm}'; upload ''; trigger '저장'; upload '첨부파일' | 퍼블리싱 select '등록자정보' ↔ 공급사 대응 없음; 퍼블리싱 select '등록자명' ↔ 공급사 대응 없음; 퍼블리싱 input '연락처' ↔ 공급사 대응 없음 |
| jldfil17302 | review | 1/1 |  | trigger '수정'; trigger '삭제' |  |
| jldfil17400 | review | 0/0 |  | grid 'grid'; grid 'grid' |  |
| jldfil19000 | auto | 0/0 |  |  |  |
| jldfil20000 | review | 0/0 |  | trigger '상세보기' |  |
| jldfil20050 | auto | 0/0 |  |  |  |
| jldfil20100 | auto | 15/15 |  |  | 버튼 '조회' ← 공급사 '검색'(동의어); inputCalendar '조회기간' 2개 ← 같은 개수, 순서대로 |
| jldfil20200 | review | 1/2 |  | grid 'grid'; grid 'grid' | 퍼블리싱 grid '구분/발행가/상장(예정)일/수/액면가/<br/>개별주당자본금/주식종류/증' ↔ 공급사 대응 없음 |
| jldfil20300 | review | 1/48 |  | trigger '신청내역'; trigger '체결내역'; trigger '1주'; trigger '1개월' | 퍼블리싱 grid '가능수량/신청수량/신청일/종목명/취득/처분구분/호가시기' ↔ 공급사 대응 없음; 퍼블리싱 grid '당일체결수량/매매일/신청수량/종목명/체결율(%)/취득/처분구분/평균체결가' ↔ 공급사 대응 없음; 퍼블리싱 inputCalendar '조회기간' 가 6개(라벨 중복) |
| jldfil20400 | auto | 11/11 |  |  | 버튼 '조회' ← 공급사 '검색'(동의어); inputCalendar '조회기간' 2개 ← 같은 개수, 순서대로 |
| jldfil20500 | review | 3/5 |  | select '변경구분'; select '' | 퍼블리싱 select '조회기간' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 '검색'(동의어); 퍼블리싱 select '' ↔ 공급사 대응 없음 |
| jldfil21000 | review | 9/11 |  | select '' | 퍼블리싱 select '유가증권구분' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 '검색'(동의어); 퍼블리싱 select '' ↔ 공급사 대응 없음 |
| jldfil21100 | review | 9/9 |  | pageList '' | 그리드 헤더 '자산총액10%<br/>이상여부' 공급사 쪽 없음; 그리드 헤더 '적용신처일자' 공급사 쪽 없음; 그리드 헤더 '타이틀' 공급사 쪽 없음 |
| jldfil21101 | review | 4/9 |  | trigger 'icon:search' | 그리드 헤더 '자산총액10%<br/>이상여부' 공급사 쪽 없음; 퍼블리싱 trigger 'Search' ↔ 공급사 대응 없음; 퍼블리싱 select '지주회사자산총액<br/>대비비중' ↔ 공급사 대응 없음 |
| jldfil21102 | review | 6/8 |  |  | 퍼블리싱 trigger 'Search' ↔ 공급사 대응 없음; 퍼블리싱 select '지주회사자산총액<br/>대비비중' ↔ 공급사 대응 없음 |
| jldfil21103 | review | 0/3 |  | grid 'grid'; input '신청일'; inputCalendar '적용신청일'; input '상장자회사' | 퍼블리싱 select '' ↔ 공급사 대응 없음; 퍼블리싱 trigger '제출' ↔ 공급사 대응 없음; 퍼블리싱 trigger '취소' ↔ 공급사 대응 없음 |
| jldfil21104 | review | 0/3 |  |  | 퍼블리싱 select '' ↔ 공급사 대응 없음; 퍼블리싱 trigger '제출' ↔ 공급사 대응 없음; 퍼블리싱 trigger '취소' ↔ 공급사 대응 없음 |
| jldfil21110 | review | 4/5 |  | trigger '검색</>' | 퍼블리싱 trigger '조회' ↔ 공급사 대응 없음; inputCalendar '적용일자' 2개 ← 같은 개수, 순서대로 |
| jldfil21200 | auto | 3/3 |  |  |  |
| jldfil21210 | auto | 3/3 |  |  |  |
| jldfil21211 | auto | 1/1 |  |  |  |
| jldfil21212 | review | 2/6 |  | upload '' | 퍼블리싱 select '구분' ↔ 공급사 대응 없음; 퍼블리싱 upload '첨부파일1' ↔ 공급사 대응 없음; 퍼블리싱 upload '첨부파일2' ↔ 공급사 대응 없음 |
| jldfil22100 | auto | 4/4 |  |  |  |
| jldfil22110 | review | 5/6 |  | trigger '파일선택'; grid 'grid'; trigger '삭제' | 퍼블리싱 trigger '삭제' ↔ 공급사 대응 없음 |
| jldfil22120 | review | 2/2 | ipt_attachFileNm, ipt_contnAttachSeq |  |  |
| jldfil25000 | review | 13/15 |  |  | 퍼블리싱 trigger '대표이사변경공시제출하기' ↔ 공급사 대응 없음; 퍼블리싱 trigger '본점소재지변경공시제출하기' ↔ 공급사 대응 없음; select '' 5개 ← 같은 개수, 순서대로 |
| jldfil25003 | auto | 0/0 |  |  |  |
| jldfil25050 | review | 1/1 |  | trigger '저장' | 그리드 헤더 '제출일' 공급사 쪽 없음 |
| jldfil25100 | review | 7/14 |  | select '휴대전화번호'; select 'Email주소'; input '유선전화번호'; input '휴대전화번호' | 퍼블리싱 trigger '수정' ↔ 공급사 대응 없음; 퍼블리싱 input '유선전화번호' ↔ 공급사 대응 없음; 퍼블리싱 input '휴대전화번호' ↔ 공급사 대응 없음 |
| jldfil25101 | review | 46/72 |  | trigger '공시교육일정등안내'; input '소재지'; trigger '교육이수내역보기'; input '지정일' | 퍼블리싱 trigger '공시교육일정등안내' 가 6개(라벨 중복); input '직위' 5개 ← 같은 개수, 순서대로; 퍼블리싱 input '부서' 가 5개(라벨 중복) |
| jldfil25102 | review | 57/66 |  | input '성명'; input '유선전화번호'; select '휴대전화번호'; input '휴대전화번호' | trigger '재등록' 3개 ← 같은 개수, 순서대로; input '직위' 3개 ← 같은 개수, 순서대로; input '부서' 3개 ← 같은 개수, 순서대로 |
| jldfil25103 | review | 16/20 |  | select '휴대전화번호'; trigger '저장'; input '유선전화번호'; input '휴대전화번호' | 퍼블리싱 input '휴대전화번호' ↔ 공급사 대응 없음; 퍼블리싱 input 'FAX' ↔ 공급사 대응 없음; 퍼블리싱 input '유선전화번호' 가 2개(라벨 중복) |
| jldfil25104 | review | 57/66 |  | input '유선전화번호'; select '휴대전화번호'; input '휴대전화번호'; input 'FAX' | trigger '재등록' 3개 ← 같은 개수, 순서대로; input '직위' 3개 ← 같은 개수, 순서대로; input '부서' 3개 ← 같은 개수, 순서대로 |
| jldfil25105 | review | 49/50 |  | trigger '수정' | 퍼블리싱 trigger '수정' ↔ 공급사 대응 없음; input '직위' 4개 ← 같은 개수, 순서대로; input '부서' 4개 ← 같은 개수, 순서대로 |
| jldfil25107 | review | 36/55 |  | input '성명'; input '유선전화번호'; select '휴대전화번호'; input '휴대전화번호' | 퍼블리싱 trigger '신고서제출하기' ↔ 공급사 대응 없음; trigger '최근변동된내역인쇄' 3개 ← 같은 개수, 순서대로; trigger '수정' 3개 ← 같은 개수, 순서대로 |
| jldfil25108 | review | 37/38 |  | trigger '수정' | 퍼블리싱 trigger '수정' ↔ 공급사 대응 없음; input '직위' 3개 ← 같은 개수, 순서대로; input '부서' 3개 ← 같은 개수, 순서대로 |
| jldfil25111 | review | 30/39 |  | input '유선전화번호'; select '휴대전화번호'; input '휴대전화번호'; input 'FAX' | trigger '수정' 3개 ← 같은 개수, 순서대로; trigger '삭제' 3개 ← 같은 개수, 순서대로; input '직위' 3개 ← 같은 개수, 순서대로 |
| jldfil25113 | review | 1/30 |  | input '성명'; input '직위'; input '부서'; input '유선전화번호' | 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음; 퍼블리싱 trigger '수정' 가 2개(라벨 중복); 퍼블리싱 input '성명' 가 2개(라벨 중복) |
| jldfil25200 | review | 6/7 |  |  | 퍼블리싱 trigger '확인' ↔ 공급사 대응 없음 |
| jldfil25210 | auto | 3/3 |  |  | input 'E-mail' 2개 ← 같은 개수, 순서대로 |
| jldfil25300 | review | 0/2 |  |  | 퍼블리싱 trigger '등록하기' ↔ 공급사 대응 없음; 퍼블리싱 trigger '재등록하기' ↔ 공급사 대응 없음 |
| jldfil25301 | review | 0/4 |  |  | 퍼블리싱 trigger '등록하기' ↔ 공급사 대응 없음; 퍼블리싱 trigger '조회하기' ↔ 공급사 대응 없음; 퍼블리싱 trigger '재등록하기' ↔ 공급사 대응 없음 |
| jldfil25302 | review | 5/8 |  | input '전화번호' | 퍼블리싱 input '전화번호' ↔ 공급사 대응 없음; 퍼블리싱 trigger '확인' ↔ 공급사 대응 없음; 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldfil25303 | auto | 1/1 |  |  |  |
| jldfil25304 | review | 0/1 |  |  | 퍼블리싱 trigger '다운로드' ↔ 공급사 대응 없음 |
| jldfil25305 | auto | 1/1 |  |  |  |
| jldfil25600 | review | 1/1 | ipt_submitprnEmail, ipt_submitprnNm, ipt_telNo |  |  |
| jldfil25710 | auto | 1/1 |  |  |  |
| jldfil25800 | review | 5/17 |  | input ''; trigger '수정'; trigger '삭제'; trigger 'icon:search' | 퍼블리싱 grid '비고/상장여부/자회사구분/회사명' ↔ 공급사 대응 없음; 퍼블리싱 select '' ↔ 공급사 대응 없음; 퍼블리싱 input '회사명' ↔ 공급사 대응 없음 |
| jldfil25900 | review | 2/2 | ipt_bzProcsNo |  |  |
| jldfil25910 | review | 4/6 | ipt_attachFileNm, ipt_contnId | inputCalendar ''; trigger 'icon:delete' | 퍼블리싱 select '배당기준일' ↔ 공급사 대응 없음; 퍼블리싱 inputCalendar '배당기준일' ↔ 공급사 대응 없음; 버튼 '등록' ← 공급사 '저장'(동의어) |
| jldfil30000 | review | 0/3 |  |  | 퍼블리싱 trigger '연부과금조회' ↔ 공급사 대응 없음; 퍼블리싱 trigger '상장증명서발급' ↔ 공급사 대응 없음; 퍼블리싱 trigger '상장폐지확인서발급' ↔ 공급사 대응 없음 |
| jldfil30100 ⚠중복 | review | 0/8 |  |  | 퍼블리싱 select '입금일기간' ↔ 공급사 대응 없음; 퍼블리싱 trigger '조회' ↔ 공급사 대응 없음; 퍼블리싱 select '' ↔ 공급사 대응 없음 |
| jldfil30105 ⚠중복 | review | 0/8 |  |  | 퍼블리싱 select '입금일기간' ↔ 공급사 대응 없음; 퍼블리싱 trigger '조회' ↔ 공급사 대응 없음; 퍼블리싱 select '' ↔ 공급사 대응 없음 |
| jldfil30200 ⚠중복 | auto | 4/4 |  |  |  |
| jldfil30201 ⚠중복 | review | 1/3 |  | select '증명용도' | 퍼블리싱 select '양식구분' ↔ 공급사 대응 없음; 퍼블리싱 select '증명용도' ↔ 공급사 대응 없음 |
| jldfil30300 ⚠중복 | auto | 4/4 |  |  |  |
| jldfil30301 ⚠중복 | review | 1/3 |  | select '증명용도' | 퍼블리싱 select '양식구분' ↔ 공급사 대응 없음; 퍼블리싱 select '증명용도' ↔ 공급사 대응 없음 |
| jldfil30600 | auto | 1/1 |  |  |  |
| jldfil30601 | auto | 7/7 |  |  | 버튼 '조회' ← 공급사 '검색'(동의어); inputCalendar '기간' 2개 ← 같은 개수, 순서대로 |
| jldfil30602 | review | 10/19 |  | grid 'grid' | 퍼블리싱 select '신청자정보' ↔ 공급사 대응 없음; 퍼블리싱 inputCalendar '일시' 가 2개(라벨 중복); 퍼블리싱 select '일시' 가 4개(라벨 중복) |
| jldfil30603 | review | 1/1 |  | grid 'grid'; trigger '수정' |  |
| jldfil30604 | review | 10/11 |  | grid 'grid' | 퍼블리싱 select '신청자정보' ↔ 공급사 대응 없음 |
| jldfil35200 | review | 0/0 |  |  | 퍼블리싱 본문 비어 있음(자리표만) |
| jldfil35400 | review | 3/3 |  | trigger '목차'; trigger '즐겨찾기'; pageList '' | 버튼 '조회' ← 공급사 '검색'(동의어) |
| jldfil35700 ⚠중복 | review | 0/47 |  |  | 퍼블리싱 select '시장구분' ↔ 공급사 대응 없음; 퍼블리싱 select '상장방식' ↔ 공급사 대응 없음; 퍼블리싱 grid '상장할신탁원본액/수수료/종목약명' ↔ 공급사 대응 없음 |
| jldfil40100 | auto | 0/0 |  |  |  |
| jldfil40105 | auto | 0/0 |  |  |  |
| jldfil40200 | review | 0/7 |  | select '' | 퍼블리싱 input '회사코드(5자리)' ↔ 공급사 대응 없음; 퍼블리싱 trigger '확인' ↔ 공급사 대응 없음; 퍼블리싱 select '' 가 5개(라벨 중복) |
| jldfil40201 | review | 22/24 |  | trigger '취소'; trigger '다음' | 퍼블리싱 input '회사코드' ↔ 공급사 대응 없음; 퍼블리싱 trigger '취소' ↔ 공급사 대응 없음; input '우편물수령지' 3개 ← 같은 개수, 순서대로 |
| jldfil40202 | review | 0/1 |  |  | 퍼블리싱 trigger '가입결과서인쇄' ↔ 공급사 대응 없음 |
| jldfil40203 | review | 59/74 |  | select ''; input '생년월일'; input '교육이수시기'; input '연수과정명' | input '성명' 3개 ← 같은 개수, 순서대로; input '직위' 3개 ← 같은 개수, 순서대로; input '부서' 3개 ← 같은 개수, 순서대로 |
| jldfil40207 | review | 25/26 |  | input '생년월일' | 퍼블리싱 inputCalendar '생년월일' ↔ 공급사 대응 없음; input '유선전화번호' 4개 ← 같은 개수, 순서대로; input '휴대전화번호' 2개 ← 같은 개수, 순서대로 |
| jldfil40211 | review | 2/4 |  | input '' | 퍼블리싱 input '아이디입력' ↔ 공급사 대응 없음; 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldfil40300 | auto | 8/8 |  |  | input '신청자<br/>E-mail주소' 2개 ← 같은 개수, 순서대로 |
| jldfil40301 | auto | 0/0 |  |  |  |
| jldfil40400 | auto | 24/24 |  |  | input '주소' 3개 ← 같은 개수, 순서대로; input '신청인전화번호' 3개 ← 같은 개수, 순서대로; input 'FAX' 3개 ← 같은 개수, 순서대로 |
| jldfil40401 | review | 0/1 |  |  | 퍼블리싱 trigger '비밀번호재발급신청서인쇄' ↔ 공급사 대응 없음 |
| jldfil45501 | review | 19/53 |  | grid 'grid'; grid 'grid'; input '행사되지아니한CB,BW'; input '1년이내행사된CB,BW' | trigger '행추가' 4개 ← 같은 개수, 순서대로; trigger '행삭제' 4개 ← 같은 개수, 순서대로; 퍼블리싱 input '' 가 27개(라벨 중복) |
| jldfil50200 | auto | 4/4 |  |  |  |
| jldfil50200n | auto | 3/3 |  |  |  |
| jldfil52700 | auto | 3/3 |  |  |  |
| jldfil52710 | review | 0/3 |  | grid 'grid' | 퍼블리싱 grid 'IND<br/>승인기관/계약상대방/계약일/기술이전/대상지역/임상/임상국가' ↔ 공급사 대응 없음; 퍼블리싱 grid 'IND승인기관/T+1/T+2/T+3/T+4/T+5/계약상대방/계약일/기술' ↔ 공급사 대응 없음; 퍼블리싱 trigger '목록보기' ↔ 공급사 대응 없음 |
| jldfil52720 | review | 1/2 |  |  | 퍼블리싱 select '수정요청업무' ↔ 공급사 대응 없음 |
| jldfil53000n | auto | 3/3 |  |  | 그리드 헤더 '심사<br/>담당자' 공급사 쪽 없음; 그리드 헤더 '단축<br/>코드' 공급사 쪽 없음; 그리드 헤더 '청구서<br/>접수일' 공급사 쪽 없음 |
| jldfil54000 | auto | 3/3 |  |  |  |
| jldfil54000n | auto | 3/3 |  |  |  |
| jldfil54100 | review | 10/12 |  | trigger 'icon:search'; trigger '수정' | 퍼블리싱 trigger 'search' ↔ 공급사 대응 없음; 퍼블리싱 select '수수료종류' ↔ 공급사 대응 없음; input '법인명' 2개 ← 같은 개수, 순서대로 |
| jldfil54100n | review | 10/12 |  | trigger 'icon:search' | 퍼블리싱 trigger 'Search' ↔ 공급사 대응 없음; 퍼블리싱 select '수수료종류' ↔ 공급사 대응 없음; input '법인명' 2개 ← 같은 개수, 순서대로 |
| jldfil55000n | auto | 4/4 |  |  | 그리드 헤더 '심사<br/>담당자' 공급사 쪽 없음; 그리드 헤더 '단축<br/>코드' 공급사 쪽 없음; 그리드 헤더 '예비심사<br/>승인일' 공급사 쪽 없음 |
| jldfil55700 | review | 5/9 |  | grid 'grid'; grid 'grid' | 버튼 '조회' ← 공급사 '검색'(동의어); 퍼블리싱 grid '1개월(일별종가평균)/3개월(일별종가평균)/6개월(일별종가평균)/9개월(' ↔ 공급사 대응 없음; 퍼블리싱 grid '1년차결산/1년차반기/2년차결산/2년차반기/공모예정가<br/>PER/당기' ↔ 공급사 대응 없음 |
| jldfil55700n | review | 5/8 |  | grid 'grid'; grid 'grid' | 퍼블리싱 select '검색일자' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 '검색'(동의어); 퍼블리싱 grid '1개월(일별종가평균)/3개월(일별종가평균)/6개월(일별종가평균)/9개월(' ↔ 공급사 대응 없음 |
| jldfil55800 | review | 4/6 |  |  | 그리드 헤더 '상장심사<br/>제출일' 공급사 쪽 없음; 버튼 '조회' ← 공급사 '검색'(동의어); 퍼블리싱 select '검색조건' 가 2개(라벨 중복) |
| jldfil55800n | review | 4/5 |  |  | 그리드 헤더 '상장심사<br/>제출일' 공급사 쪽 없음; 퍼블리싱 select '검색조건' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 '검색'(동의어) |
| jldfil58000 | review | 8/9 |  |  | 퍼블리싱 select '시장구분' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 '검색'(동의어); inputCalendar '기간' 2개 ← 같은 개수, 순서대로 |
| jldfil58000n | auto | 8/8 |  |  | 버튼 '조회' ← 공급사 '검색'(동의어); inputCalendar '기간' 2개 ← 같은 개수, 순서대로 |
| jldfil58001 | review | 1/2 |  |  | 퍼블리싱 trigger '한글' ↔ 공급사 대응 없음 |
| jldfil59400 | auto | 4/4 |  |  |  |
| jldfil59410 | review | 56/71 |  | trigger 'icon:search'; trigger '제척기관삭제'; upload '신청서첨부'; upload '서약서' | 퍼블리싱 trigger 'search' ↔ 공급사 대응 없음; 퍼블리싱 select '주관사' ↔ 공급사 대응 없음; 퍼블리싱 select '기술사업구분' ↔ 공급사 대응 없음 |
| jldfil59411 | review | 1/2 |  |  | 퍼블리싱 select '수정요청업무' ↔ 공급사 대응 없음 |
| jldfil70101 | review | 0/0 |  | trigger 'Ⅰ.발행증권에관한사항'; trigger 'Ⅱ.발행증권에관한사항2(손실제한)'; trigger 'Ⅲ.발행회사에관한사항'; trigger 'Ⅳ.보증인/제3자LP에관한사항' |  |
| jldfil70201 | review | 5/6 |  | trigger '엑셀다운' | 퍼블리싱 trigger '엑셀다운로드' ↔ 공급사 대응 없음 |
| jldfil70211 | auto | 3/3 |  |  |  |
| jldfil70301 | review | 5/6 |  | trigger '엑셀다운' | 퍼블리싱 trigger '엑셀다운로드' ↔ 공급사 대응 없음 |
| jldfil70311 | auto | 3/3 |  |  |  |
| jldfil70401 | review | 7/8 |  | trigger '엑셀다운' | 버튼 '조회' ← 공급사 '검색'(동의어); 퍼블리싱 trigger '엑셀다운로드' ↔ 공급사 대응 없음 |
| jldfil70411 | auto | 3/3 |  |  |  |
| jldfil70501 | review | 7/8 |  | trigger '엑셀다운' | 버튼 '조회' ← 공급사 '검색'(동의어); 퍼블리싱 trigger '엑셀다운로드' ↔ 공급사 대응 없음 |
| jldfil70511 | auto | 3/3 |  |  |  |
| jldfil70601 | auto | 8/8 |  |  | 버튼 '조회' ← 공급사 '검색'(동의어); inputCalendar '발행일' 2개 ← 같은 개수, 순서대로 |
| jldfil70701 | review | 2/2 |  | pageList '' |  |
| jldfil70702 | review | 4/10 |  | input '보증인코드'; input '보증인종류입력'; input '보증인명'; input '보증인약명' | 퍼블리싱 input '보증인명' ↔ 공급사 대응 없음; 퍼블리싱 input '보증인약명' ↔ 공급사 대응 없음; 퍼블리싱 input '보증인영문명' ↔ 공급사 대응 없음 |
| jldfil70801 | review | 5/6 |  | trigger '엑셀다운' | 퍼블리싱 trigger '엑셀다운로드' ↔ 공급사 대응 없음 |
| jldfil70811 | auto | 3/3 |  |  |  |
| jldfil70901 | review | 5/6 |  | trigger '엑셀다운' | 퍼블리싱 trigger '엑셀다운로드' ↔ 공급사 대응 없음 |
| jldfil70911 | auto | 3/3 |  |  |  |
| jldfil71001 | review | 7/8 |  | trigger '엑셀다운' | 버튼 '조회' ← 공급사 '검색'(동의어); 퍼블리싱 trigger '엑셀다운로드' ↔ 공급사 대응 없음 |
| jldfil71011 | auto | 3/3 |  |  |  |
| jldfil71111 | auto | 3/3 |  |  |  |
| jldfil71201 | review | 0/0 |  | trigger 'Ⅰ.발행증권에관한사항'; trigger 'Ⅱ.상장신청인에관한사항'; trigger 'Ⅲ.기타사항' |  |
| jldfil71401 | review | 2/2 |  | trigger '신규작성' |  |
| jldfil71901 | auto | 7/7 |  |  | 버튼 '조회' ← 공급사 '검색'(동의어); inputCalendar '신청일' 2개 ← 같은 개수, 순서대로 |
| jldfil72000 | auto | 1/1 |  |  |  |
| jldfil72100 | review | 4/8 |  | trigger '+'; select '증권구분'; grid 'grid' | 퍼블리싱 trigger 'Search' ↔ 공급사 대응 없음; 퍼블리싱 select '증권구분' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 '검색'(동의어) |
| jldfil73000 | auto | 0/0 |  |  |  |
| jldinf35000 | review | 11/13 |  | trigger 'KOREA'; select 'Type' | 퍼블리싱 trigger 'Search' ↔ 공급사 대응 없음; 퍼블리싱 select 'Type' ↔ 공급사 대응 없음; input 'Company' 4개 ← 같은 개수, 순서대로 |
| jldinf35101 | review | 0/1 |  |  | 퍼블리싱 trigger 'Close' ↔ 공급사 대응 없음 |
| jldinf91000 | review | 0/2 | ipt_type |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf91100 | review | 0/1 |  | grid 'grid' | 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf91200 | review | 0/2 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf91300 | review | 0/2 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf91400 | review | 0/2 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf91500 | review | 0/2 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf91600 | review | 0/2 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf91700 | review | 0/2 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf91800 | review | 0/2 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf91900 | review | 0/1 |  |  | 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf92000 | review | 0/1 |  |  | 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf92100 | review | 0/2 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf92200 | review | 0/2 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf92300 | review | 1/2 |  |  | 그리드 헤더 '표면이자율%<br/>(할인율)' 공급사 쪽 없음; 그리드 헤더 '액면총액<br/>(원)' 공급사 쪽 없음; 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf92400 | review | 0/2 |  |  | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldinf92500 | review | 0/1 |  | input '발행금액'; inputCalendar '발행일'; select '발행통화'; inputCalendar '만기일' | 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음 |
| jldods20000 | review | 0/2 |  | grid 'grid'; trigger '접기'; trigger '전체등록'; trigger '등록' | 퍼블리싱 grid '('공시구분', '담당기관', '업무및서식', '제출시한')' 가 2개(라벨 중복) |
| jldods20010 | review | 0/3 |  | input ''; trigger '검색'; trigger 'ㄱ'; trigger 'ㄴ' | 퍼블리싱 전용 버튼 '인쇄'(공통 처리 대상); 퍼블리싱 grid '('공시구분', '담당기관', '업무및서식', '제출시한')' 가 2개(라벨 중복) |
| jldstf10002 | review | 2/5 |  | trigger '공시뷰어새창열기' | 퍼블리싱 trigger '국문보기' ↔ 공급사 대응 없음; 퍼블리싱 trigger '영문보기' ↔ 공급사 대응 없음; 버튼 '조회' ← 공급사 아이콘 search(newWindowId) |
| jldstf30100 | review | 3/10 | tbl_calendar | trigger 'icon:row_add'; trigger '일정추출계산식'; select '' | 퍼블리싱 select '표준산업업종' ↔ 공급사 대응 없음; 퍼블리싱 select '팀' ↔ 공급사 대응 없음; 퍼블리싱 select '담당자' ↔ 공급사 대응 없음 |
| jldstf30101 | auto | 0/0 |  |  |  |
| jldstf30110 | review | 2/8 | tbl_calendar | trigger 'icon:row_add'; trigger '메모입력'; trigger '일정추출계산식'; select '' | 퍼블리싱 select '표준산업업종' ↔ 공급사 대응 없음; 퍼블리싱 select '팀' ↔ 공급사 대응 없음; 퍼블리싱 trigger '공시일정추출현황' ↔ 공급사 대응 없음 |
| jldstf30319 | review | 1/3 |  | grid 'grid' | 버튼 '닫기' ← 공급사 아이콘 close(img_51); 퍼블리싱 select '' 가 2개(라벨 중복) |
| jldstf31200 | review | 2/281 |  | input '종목코드'; input '회사이름'; inputCalendar '취득/처분신고서제출일(이익소각신고일)'; trigger 'icon:download' | 퍼블리싱 input '취득/처분신고서제출일(이익소각신고일)' ↔ 공급사 대응 없음; 퍼블리싱 trigger '조회' ↔ 공급사 대응 없음; 퍼블리싱 input '최근자사주신고개시일자' ↔ 공급사 대응 없음 |
| jldstf70000 | review | 2/10 | ipt_integSrchNo | input ''; trigger '등록'; trigger '조회'; select '' | 퍼블리싱 input '키워드(검색어)' ↔ 공급사 대응 없음; 퍼블리싱 trigger 'Search' ↔ 공급사 대응 없음; 퍼블리싱 select '공시구분' ↔ 공급사 대응 없음 |
| jldstf70010 | review | 10/41 | slc_ldMktTpCd | trigger '삭제'; grid 'grid'; trigger '▲'; trigger '▼' | 퍼블리싱 select '통합검색명' ↔ 공급사 대응 없음; 퍼블리싱 input '통합검색명' ↔ 공급사 대응 없음; 퍼블리싱 select '시장구분' ↔ 공급사 대응 없음 |
| jldstf71000 | review | 1/22 | ipt_keywrdInit, ipt_keywrdNm, ipt_keywrdNo | trigger '등록'; input '' | 퍼블리싱 input '키워드' ↔ 공급사 대응 없음; 퍼블리싱 trigger 'ㄱ' ↔ 공급사 대응 없음; 퍼블리싱 trigger 'ㄴ' ↔ 공급사 대응 없음 |
| jldstf72000 | review | 2/7 |  | select ''; grid 'grid'; input ''; trigger '관련법규조항등록' | 퍼블리싱 select '법규전문' ↔ 공급사 대응 없음; 퍼블리싱 input '단위조항' ↔ 공급사 대응 없음; 퍼블리싱 input '관련법규조항' ↔ 공급사 대응 없음 |
| jldstf73000 | review | 4/6 |  | input ''; trigger '단위조항등록' | 퍼블리싱 select '법규전문' ↔ 공급사 대응 없음; 퍼블리싱 input '단위조항' ↔ 공급사 대응 없음 |
| jldstf75100 | review | 0/31 |  | grid 'grid'; input ''; trigger '조회'; select '' | 퍼블리싱 input '키워드(검색어)' ↔ 공급사 대응 없음; 퍼블리싱 trigger 'Search' ↔ 공급사 대응 없음; 퍼블리싱 select '공시구분' ↔ 공급사 대응 없음 |
| jldstf75200 | review | 0/9 |  | input ''; trigger '저장'; trigger '조회'; select '' | 퍼블리싱 input '키워드(검색어)' ↔ 공급사 대응 없음; 퍼블리싱 trigger 'Search' ↔ 공급사 대응 없음; 퍼블리싱 select '공시구분' ↔ 공급사 대응 없음 |
| jldstf75300 | review | 0/9 | ipt_integSrchNo | trigger '▲'; trigger '▼'; input ''; trigger '조회' | 퍼블리싱 input '키워드(검색어)' ↔ 공급사 대응 없음; 퍼블리싱 trigger 'Search' ↔ 공급사 대응 없음; 퍼블리싱 select '공시구분' ↔ 공급사 대응 없음 |
| jldstf75500 | review | 0/9 |  | input ''; trigger '저장'; trigger '조회'; select '' | 퍼블리싱 input '키워드(검색어)' ↔ 공급사 대응 없음; 퍼블리싱 trigger 'Search' ↔ 공급사 대응 없음; 퍼블리싱 select '공시구분' ↔ 공급사 대응 없음 |
| jldstf75600 | review | 0/9 |  | input ''; trigger '저장'; trigger '조회'; select '' | 퍼블리싱 input '키워드(검색어)' ↔ 공급사 대응 없음; 퍼블리싱 trigger 'Search' ↔ 공급사 대응 없음; 퍼블리싱 select '공시구분' ↔ 공급사 대응 없음 |
| jldstf76200 | review | 1/1 |  | trigger '등록'; trigger '저장' |  |
| uldmgt50002 | review | 0/8 |  | trigger 'icon:list_more'; trigger 'icon:close' | 퍼블리싱 select '시장구분' ↔ 공급사 대응 없음; 퍼블리싱 select '서식버전' ↔ 공급사 대응 없음; 퍼블리싱 input '엘리먼트명' ↔ 공급사 대응 없음 |
| uldmgt50014 | review | 0/0 |  |  | 퍼블리싱 본문 비어 있음(자리표만) |
| uldmgt50300 | review | 1/3 |  |  | 퍼블리싱 grid 'On-line/법규번호/상장공시시장구분/원문/제목' ↔ 공급사 대응 없음; 퍼블리싱 trigger '뒤로' ↔ 공급사 대응 없음; 버튼 '등록' ← 공급사 아이콘 save(img_15) |
| uldmgt50301 | review | 2/8 |  | inputCalendar ''; input ''; upload ''; select '' | 퍼블리싱 select '시장구분' ↔ 공급사 대응 없음; 퍼블리싱 inputCalendar '개정일자' ↔ 공급사 대응 없음; 퍼블리싱 input '제목' ↔ 공급사 대응 없음 |
| uldmgt50302 | review | 0/2 |  |  | 퍼블리싱 trigger '분류등록' ↔ 공급사 대응 없음; 퍼블리싱 grid '분류ID/분류명/상위분류ID' ↔ 공급사 대응 없음 |
| uldmgt50303 | review | 2/3 |  | trigger 'icon:close' | 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음; 버튼 '삭제' ← 공급사 아이콘 delete(img_48); 버튼 '등록' ← 공급사 아이콘 save(img_51) |
| uldmgt50304 | review | 0/3 |  |  | 퍼블리싱 trigger '매뉴얼등록' ↔ 공급사 대응 없음; 퍼블리싱 trigger '분류등록' ↔ 공급사 대응 없음; 퍼블리싱 grid '분류ID/분류명/상위분류ID' ↔ 공급사 대응 없음 |
| uldmgt50305 | review | 2/4 |  | input '' | 퍼블리싱 select '분류' ↔ 공급사 대응 없음; 퍼블리싱 input '제목' ↔ 공급사 대응 없음; 버튼 '닫기' ← 공급사 아이콘 close(img_54) |
| uldmgt50306 | review | 0/4 |  |  | 퍼블리싱 select '' ↔ 공급사 대응 없음; 퍼블리싱 grid '대상시스템/분류ID/분류명/사용영역/상위분류ID' ↔ 공급사 대응 없음; 퍼블리싱 trigger 'FAQ등록' ↔ 공급사 대응 없음 |
| uldmgt50307 | review | 2/3 |  |  | 퍼블리싱 select '분류' ↔ 공급사 대응 없음; 버튼 '닫기' ← 공급사 아이콘 close(img_54); 버튼 '등록' ← 공급사 아이콘 save(img_53) |
| uldmgt50308 | review | 1/3 |  |  | 퍼블리싱 trigger '세칙등록' ↔ 공급사 대응 없음; 퍼블리싱 trigger '수정' ↔ 공급사 대응 없음; 버튼 '목록' ← 공급사 아이콘 list_more(img_53) |
| uldmgt50309 | auto | 1/1 |  |  | 버튼 '닫기' ← 공급사 아이콘 close(img_25) |
| uldmgt50310 | review | 2/3 |  |  | 퍼블리싱 select '구분' ↔ 공급사 대응 없음; 버튼 '목록' ← 공급사 아이콘 list_more(img_101); 버튼 '등록' ← 공급사 아이콘 save(img_100) |
| uldmgt50311 | review | 2/6 |  | input ''; select '' | 퍼블리싱 select '공지대상시스템구분' ↔ 공급사 대응 없음; 퍼블리싱 select '상장공시도움말사용영역구분' ↔ 공급사 대응 없음; 퍼블리싱 select '상위제도안내분류' ↔ 공급사 대응 없음 |
| uldmgt50312 | review | 2/6 |  | input ''; select '' | 퍼블리싱 select '공지대상시스템구분' ↔ 공급사 대응 없음; 퍼블리싱 select '상장공시도움말사용영역구분' ↔ 공급사 대응 없음; 퍼블리싱 select '상위매뉴얼분류' ↔ 공급사 대응 없음 |
| uldmgt50313 | review | 2/6 |  | input ''; select '' | 퍼블리싱 select '공지대상시스템구분' ↔ 공급사 대응 없음; 퍼블리싱 select '상장공시도움말사용영역구분' ↔ 공급사 대응 없음; 퍼블리싱 select '상위FAQ분류' ↔ 공급사 대응 없음 |
| uldmgt50314 | review | 1/3 |  |  | 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음; 퍼블리싱 trigger '등록' ↔ 공급사 대응 없음 |
| uldmgt50315 | review | 1/3 |  |  | 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음; 퍼블리싱 trigger '등록' ↔ 공급사 대응 없음 |
| uldmgt50316 | review | 0/31 |  | grid 'grid' | 퍼블리싱 trigger '목록' ↔ 공급사 대응 없음; 퍼블리싱 trigger '등록' 가 30개(라벨 중복) |
| uldmgt50317 | review | 2/3 |  |  | 퍼블리싱 select '세칙항목' ↔ 공급사 대응 없음; 버튼 '닫기' ← 공급사 아이콘 close(img_59); 버튼 '저장' ← 공급사 아이콘 save(img_58) |
| uldmgt50319 | review | 0/0 |  | trigger 'icon:close' |  |
| uldmgt50320 | review | 0/4 |  |  | 퍼블리싱 select '' ↔ 공급사 대응 없음; 퍼블리싱 grid '대상시스템/분류ID/분류명/사용영역/상위분류ID' ↔ 공급사 대응 없음; 퍼블리싱 trigger 'FAQ등록' ↔ 공급사 대응 없음 |
| uldmgt50321 | review | 2/6 |  | input ''; select '' | 퍼블리싱 select '공지대상시스템구분' ↔ 공급사 대응 없음; 퍼블리싱 select '상장공시도움말사용영역구분' ↔ 공급사 대응 없음; 퍼블리싱 select '상위FAQ분류' ↔ 공급사 대응 없음 |
| uldmgt50322 | review | 1/3 |  |  | 퍼블리싱 trigger '닫기' ↔ 공급사 대응 없음; 퍼블리싱 trigger '등록' ↔ 공급사 대응 없음 |
| uldmgt50323 | review | 2/3 |  |  | 퍼블리싱 select '분류' ↔ 공급사 대응 없음; 버튼 '닫기' ← 공급사 아이콘 close(img_54); 버튼 '등록' ← 공급사 아이콘 save(img_53) |
| uldmgt76100 | review | 2/11 |  | input ''; select ''; inputCalendar '' | 퍼블리싱 select '시스템구분' ↔ 공급사 대응 없음; 퍼블리싱 input '제목' ↔ 공급사 대응 없음; 퍼블리싱 trigger '조회' ↔ 공급사 대응 없음 |
| uldmgt76101 | review | 2/16 |  | trigger '파일선택'; trigger '삭제'; grid 'grid'; grid 'grid' | 퍼블리싱 trigger '복제' ↔ 공급사 대응 없음; 퍼블리싱 select '대상시스템' ↔ 공급사 대응 없음; 퍼블리싱 input '공지타입' ↔ 공급사 대응 없음 |
