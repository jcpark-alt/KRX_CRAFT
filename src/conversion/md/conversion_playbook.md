# 전환 프로젝트 적용 플레이북 (Conversion Playbook)

본 저장소의 **W-Craft → WebSquare(gcc) 전환 프로세스를 다른 전환 프로젝트에 그대로 적용**하기 위한 착수 절차서다.
프로세스 원리·규칙 상세는 [conversion_process_overview.md](conversion_process_overview.md) 이하 문서를 참조하고, 이 문서는 **순서와 체크리스트**만 담는다. (2026-08-21)

## 0. 전제 조건 체크리스트

착수 전 아래가 준비되어야 한다.

- [ ] **gcc 공통 라이브러리 배포** — 대상 프로젝트 WebSquare 서버에 `src/gcc/` 11개 파일(`$c.util/win/str/num/date/data/validate/sbm/hkey/session/ext`)이 배포되어 `$c.*` 로 접근 가능
- [ ] **W-Craft 1차 변환 완료** — 구 플랫폼(Gauce/X-Internet) 화면이 WebSquare XML 골격(`ui/`)으로 변환되어 있음 (`★Wcraft guide★` 마커)
- [ ] **Python 3.9+** — 변환 도구는 stdlib 만 사용(추가 패키지 불필요). 검증용 `wsxml_lint` 는 `pip install ./tools/wsxml_lint` (lxml 필요)
- [ ] **모듈 공통 확인** — 대상 화면이 gcc 외 네임스페이스(`$c.stf`/`$c.cm`/`$c.frame` 등 모듈 공통)를 쓰면 대응 공통의 존재 여부 확인(없으면 Stage 2 대체 대상)

## 1. 작업 공간 구성

프로젝트별 폴더를 `src/conversion/` 아래 표준 규격으로 만든다.

```
src/conversion/<프로젝트명>-front/
├── ui/          ← 입력: W-Craft 1차 변환 원본 (읽기 전용 — 절대 수정하지 않는다)
└── ui-tobe/     ← 출력: 단계 1 기계 치환본 → 단계 2 보강본 (배포 대상)
```

- `tools/convert_all.py` 의 `MAPPINGS` 목록에 새 프로젝트의 `("<프로젝트명>-front/ui", "<프로젝트명>-front/ui-tobe")` 항목을 추가한다.
- 하위 폴더 구조는 자동 미러링되므로 `ui/` 는 원본 트리 그대로 둔다.

## 2. 단계 1 — 기계 변환 실행

```powershell
# 신규 변환 (기존 ui-tobe 산출물은 건너뜀 — 수기 보강 보존)
python src/conversion/tools/convert_all.py <프로젝트명>-front

# 규칙 개정 후 전체 재생성 (기존 산출물 덮어씀)
python src/conversion/tools/convert_all.py --force <프로젝트명>-front
```

실행 결과 콘솔 리포트에서 확인할 것:

- [ ] **WF=OK** (well-formed) — XML 파싱 실패 파일 없음
- [ ] **IDEM=OK** (멱등성) — 2회 변환 결과 동일(규칙이 안정적으로 수렴)
- [ ] **오류 0건** — 예외 파일은 개별 `convert.py` 단건 실행으로 원인 파악
- [ ] 규칙별 적용 통계(r2~r15, 판단필요 건수)를 기록해 둔다 — 단계 2 작업량 산정 근거

> ⚠️ `--force` 는 `ui-tobe/` 의 **수기 단계 2 보강을 유실**시킨다. 재생성 전 반드시 git 상태·이력으로 수기 보강 유무를 확인한다.

## 3. 단계 2 — 판단 보강 (Claude Code)

[conversion_pipeline.md](conversion_pipeline.md) 단계 2 절차를 따른다. 요약:

1. 변환 리포트의 **검토·대체 태그** 항목을 [substitution_map.md](substitution_map.md) + gcc API 문서 시그니처 기준으로 보강
2. 원시 JSP/jQuery 페이지(규칙 19)는 `<w2:*>` 컴포넌트로 재설계
3. **화면 유형을 [sample_templates.md](sample_templates.md) 최종 샘플 11종에 매칭**해 5단계 구조·async/await 서브미션·검증(`$c.validate.*`)·페이징(`setPagingInfo`) 사용을 샘플 수준으로 정렬
4. 보류 항목은 `// TODO Stage2:` 주석 + [stage2_todo_worklist.md](stage2_todo_worklist.md) 집계로 추적
5. 잔존 레거시 호출 grep 점검 → `wsxml_lint` 통과 확인

## 4. 검증·마무리 체크리스트

- [ ] `python -m pytest src/conversion/tools/` — 변환기 회귀 테스트 통과 (규칙 개정을 했다면 필수)
- [ ] `python -m wsxml_lint <ui-tobe 경로>` — 구조/참조 검사(레거시 화면은 `--ignore WS111,WS112,WS113`)
- [ ] 샘플 대비 스팟 체크 — 유형별 대표 화면 1~2개를 매칭 샘플과 나란히 놓고 구조·공통함수 사용 비교
- [ ] 잔여 TODO 워크리스트 갱신 및 건수 보고
- [ ] `ui/` 무변경 확인(`git status` 에 ui/ 변경이 있으면 안 된다)

## 5. 산출물 인계

| 산출물 | 위치 | 용도 |
|--------|------|------|
| 전환된 화면 | `<프로젝트>-front/ui-tobe/**` | 운영 배포 대상 |
| 변환 통계 리포트 | 콘솔 출력(커밋 메시지에 요약 기록) | 작업량·품질 근거 |
| 잔여 TODO | [stage2_todo_worklist.md](stage2_todo_worklist.md) | 후속 보강 계획 |
| 최종 샘플 | `sample-front/ui/` + [sample_templates.md](sample_templates.md) | 화면 개발·보강 기준 |

## 6. 프로세스를 개정할 때

규칙을 추가·변경하는 경우의 순서 (이 순서를 지켜야 문서·도구·산출물이 어긋나지 않는다):

1. [conversion_rules.md](conversion_rules.md) 에 규칙 정의 추가/개정 (규칙 번호는 기존과 충돌 금지)
2. `tools/convert.py` 구현 + `tools/test_convert_*.py` pytest 추가 → 통과 확인
3. [substitution_map.md](substitution_map.md)·관련 가이드 문서 갱신
4. 기존 산출물 반영 — 수기 보강이 없으면 `--force` 재생성, 있으면 정리본 위에 규칙만 적용
5. 필요 시 `sample-front/` 샘플과 [sample_templates.md](sample_templates.md) 를 새 규칙에 맞게 갱신 (샘플 = 정답지 원칙 유지)
