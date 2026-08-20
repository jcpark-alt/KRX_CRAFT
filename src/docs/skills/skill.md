# Claude Code 스킬·서브에이전트 정리 (KRX_CRAFT)

이 저장소에서 Claude Code 작업 시 **현재 사용 가능한 스킬(슬래시 명령)과 프로젝트 서브에이전트**를 정리한 문서다. (기준일 2026-08-21)

> - **스킬(Skill)** — `/명령` 형태로 호출하는 기능 단위. Claude Code 환경이 제공하며 세션의 available-skills 목록에 따라 달라질 수 있다.
> - **서브에이전트(Subagent)** — Agent 도구로 위임 실행하는 독립 작업자. 이 저장소는 `.claude/agents/` 에 WebSquare 전용 4종을 정의해 두었다.

---

## 1. 프로젝트 서브에이전트 (`.claude/agents/` — 저장소 커스텀)

| 에이전트 | 용도 | 도구 권한 |
|----------|------|-----------|
| **websquare-code-reviewer** | 변경된 WebSquare JS/XML 리뷰(정합성·컨벤션·흔한 함정). **읽기 전용** — 지적만 하고 수정하지 않음. 공통함수/화면 수정 후·커밋 전 호출 | Read, Grep, Glob |
| **websquare-common-fn-dev** | 공통/유틸 함수 작성·리팩터링(재사용 우선, `$c.*` 네임스페이스 표준화, 중복 로직 통합) | Read, Edit, Write, Grep, Glob |
| **websquare-xml-analyzer** | 화면 XML 분석·생성(컴포넌트·DataCollection·submission·이벤트 배선 파악, 공통함수 호출처 추적, XML 조각 스캐폴딩) | Read, Grep, Glob, Edit, Write |
| **websquare-test-doc** | 공통함수 단위 테스트 작성 + JSDoc/사용 문서 생성 | Read, Grep, Glob, Edit, Write |

**호출 방법**: 대화에서 "이 변경 리뷰해줘"(→ code-reviewer), "공통함수로 만들어줘"(→ common-fn-dev)처럼 요청하면 Claude가 해당 에이전트로 위임한다. CLAUDE.md 의 Subagents 절에도 동일 안내가 있다.

---

## 2. 내장 스킬 (슬래시 명령) — 이 저장소에서의 활용

### 코드 품질·리뷰

| 스킬 | 용도 | 이 저장소 활용 포인트 |
|------|------|------------------------|
| `/code-review` | 현재 diff 의 정합성 버그·개선점 리뷰(effort 단계 지정 가능, `ultra` 는 클라우드 멀티에이전트) | gcc 공통함수·변환 산출물 커밋 전 점검. `/code-review ultra` 는 브랜치/PR 단위 심층 리뷰(사용자 직접 실행·과금) |
| `/simplify` | 변경 코드의 재사용·단순화·효율 정리 후 **직접 수정 적용** (버그 탐지는 안 함) | 변환 후 정리 단계에서 사용 |
| `/security-review` | 현재 브랜치 보류 변경의 보안 리뷰 | 통신(sbm)·업로드 관련 변경 시 |
| `/review` | Pull Request 리뷰 | GitHub PR 워크플로 사용 시 |
| `/verify` | 변경이 실제 의도대로 동작하는지 앱 구동 관점 확인 | ※ 이 저장소는 셸 실행 불가(WebSquare 서버 배포 필요) — Jest/vm 하니스 검증이 대체 수단 |
| `/run` | 프로젝트 앱 실행/스크린샷 | 위와 동일한 제약 |

### 자동화·반복

| 스킬 | 용도 | 활용 포인트 |
|------|------|-------------|
| `/loop` | 프롬프트/명령을 주기 반복 실행 | CI 폴링·반복 점검류 |
| `/schedule` | 클라우드 예약 에이전트(cron/1회 예약) 관리 | 정기 리포트·배치성 작업 |
| `/fewer-permission-prompts` | 자주 쓰는 읽기 전용 명령을 allowlist 로 등록해 권한 프롬프트 감소 | 장기 세션 편의 |

### 환경·설정

| 스킬 | 용도 |
|------|------|
| `/update-config` | settings.json 설정·권한·훅 구성(자동화 동작 "매번 X 할 때" 류는 훅으로만 가능) |
| `/keybindings-help` | 키바인딩 커스터마이즈 |
| `/init` | 새 저장소에 CLAUDE.md 초기 생성 (이 저장소는 이미 완비) |

### 조사·레퍼런스

| 스킬 | 용도 |
|------|------|
| `/deep-research` | 다중 소스 웹 조사 + 교차 검증 리포트 |
| `/claude-api` | Claude API/SDK 레퍼런스(모델 id·파라미터·요금 등) |

---

## 3. 이 저장소 권장 워크플로우 예

```
gcc 공통함수 수정
  → websquare-code-reviewer (서브에이전트 리뷰, 읽기 전용)
  → npm run lint:xml + npm test (기준선: gcc 11파일 0/0 · legacy 227파일 0/0)
  → npm run docs:gcc (publicInfo/JSDoc 변경 시)
  → /code-review (diff 리뷰)
  → 커밋 (사용자 명시 요청 시에만)

변환(conversion) 작업
  → convert.py 단계 1 → websquare-xml-analyzer 로 화면 구조 파악
  → 단계 2 보강 → websquare-test-doc 으로 테스트/JSDoc 보강
```

---

## 4. 유의사항

- 스킬 목록은 **Claude Code 버전·세션 환경에 따라 변동**될 수 있다. 실제 가용 목록은 세션의 available-skills 안내가 기준이며, 이 문서는 본 저장소 작업 관점의 활용 가이드다.
- `/verify`·`/run` 은 앱 구동을 전제로 하므로 이 저장소(서버 배포형 WebSquare XML)에서는 제한적이다 — 정적 검증(`npm run lint:xml`)과 Jest vm 하니스(`test/*.test.js`)가 사실상의 검증 수단이다.
- 서브에이전트 정의를 수정/추가하려면 `.claude/agents/*.md` (frontmatter: name/description/tools/model)를 편집한다.
