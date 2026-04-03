# Data Model

## 핵심 엔티티

- `story_projects`: 프로젝트 루트
- `story_sessions`: 세션/분기 트리 (parent_session_id, base_checkpoint_id)
- `world_settings`: 버전형 세계관 규칙
- `ending_goals`: 버전형 결말 목표
- `characters`: 캐릭터 현재 엔트리(소개 여부/아카이브/effective)
- `character_versions`: 성격/속성 버전
- `character_knowledge`, `character_secrets`: 지식/비밀
- `relationships`: 신뢰/애정/적대/의존/긴장 수치
- `scenes`: immutable 장면 레코드
- `scene_events`, `scene_messages`: 장면 세부 로그
- `narrative_scores`: 장면별 서사 점수
- `story_checkpoints`: 세션 복원 스냅샷(JSONB)
- `simulation_runs`: 시뮬레이션 실행 로그

## 제약

- scenes는 `(session_id, scene_no)` unique + `immutable_locked=true` 기본
- characters는 `is_introduced`, `first_scene_no`, `is_archived`, `effective_from_scene_no` 포함
- relationships는 숫자 컬럼 기반
- 설정/목표는 version_no + supersedes + effective_from_scene_no
