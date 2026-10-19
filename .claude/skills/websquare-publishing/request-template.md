# 퍼블리싱 XML 생성·반영 요청 템플릿

요청자는 아래를 채워 요청한다. **★ 항목은 필수** — 비어 있으면 작업자(모델)는 매핑 규칙으로 채운 초안을 먼저 보여 주고 확인을 받는다.

```
[퍼블리싱 XML 생성 요청]
★ 대상 화면     : JLDFIL05012 (ELW 상장신청)
★ 대상 파일     : conversion/sample-front/ui/JLDFIL05012.xml   (신규면 "신규: <경로>")
★ 퍼블리싱 기준 : 캡처 1.png, 2.png   또는   conversion/publish/<업무>/<파일>.xml
  참조 템플릿   : ULDFIL59410 (대형 작성화면)   ← 비우면 sample_templates.md 에서 선정
  탭 구성       : host JLDFIL05012 / 탭 본문 JLDFIL05012C, JLDFIL05013C   ← 탭 화면일 때

★ [영역별 컴포넌트]
  - 조회조건/신청인 정보     : Table
  - 발행에 관한 사항(3단)    : Table + lybox 3단
  - 기초주권 목록            : gridView (행 추가/삭제)
  - 첨부파일                 : gridView
  - 계산 결과(고정 3행)      : Table
  [애매 영역]                : 없음   ← 있으면 영역명 + 고민되는 점

[허용 범위]  ← 기본은 모두 "아니오"
  - 라벨 문구를 캡처대로 교체      : 아니오 / 예 (→ --allow P12)
  - 스크립트·이벤트 변경            : 아니오 / 예 (→ --allow P11,P20, 변경 내용 명시)

[완료 조건]
  - python conversion/tools/publish_gate.py --rev HEAD <대상 파일들>  → ALL PUBLISH GATES: OK
  - 캡처 대조 리뷰, 값 출처 미정 영역은 TODO 로 보고
```

## 작성 요령
- **영역 이름**은 캡처에 보이는 섹션 제목을 그대로 쓴다.
- 컴포넌트는 `Table` / `gridView` / `Table + lybox N단` / `gridView (행 추가/삭제)` / `gridView (페이징·엑셀)` 중에서 고른다.
- 판단 기준은 SKILL.md §Table / gridView 매핑 규칙을 따른다. 기준이 엇갈리면 [애매 영역]에 적는다.
