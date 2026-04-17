# Checkpoints

## 목적

체크포인트는 특정 장면 시점의 **세션 전체 복원**을 위한 스냅샷입니다.

## 저장 형식

- 테이블: `story_checkpoints`
- 핵심 필드:
  - `project_id`, `session_id`, `scene_no`
  - `snapshot_json` (JSONB): 세션 상태, 점수, 플래그, 선택 이력 포함

## 복원 전략

1. 체크포인트 스냅샷 로드
2. 대상 세션 상태를 해당 시점으로 복구
3. 필요 시 `story_sessions.parent_session_id`/`base_checkpoint_id`를 통해 새 분기 생성
