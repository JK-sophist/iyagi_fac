# Versioning Strategy

## 설정 버전

- `world_settings`, `ending_goals`는 `version_no` 단위 누적
- 이전 버전 참조는 `supersedes_id`
- 적용 시점은 `effective_from_scene_no`

## 캐릭터 버전

- 캐릭터 마스터(`characters`)는 현재 활성 상태/도입 상태를 보유
- 세부 성격/속성 변화는 `character_versions`에 누적
- 변경은 기본적으로 이후 장면부터 적용

## 분기 전략

- 급격한 설정 변경은 기존 세션 직접 편집 대신
  `story_checkpoints` + 새 `story_sessions`(parent_session_id 지정) 방식 권장
