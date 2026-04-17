# Simulation Engine

## 구성요소

1. `SceneCandidateGenerator`
   - 현재 세션 상태 기반 후보 3개 생성
   - 후보 필드: `scene_type`, `title`, `participants`, `location`, `objective`, `why_now`, `predicted_effects`, `risk_notes`, `expected_stop_reason`
2. `ParticipantSelector`
   - 장면 참여자 2~4명 선택
   - introduced 우선 + 관계 긴장도 기반 정렬
   - archived(soft-deleted) 제외
3. `SceneExecutor`
   - 선택 후보 실행
   - 대화/행동/시스템 로그 생성
4. `RuleEngine`
   - 관계/감정/플래그/introduced 변경 반영
   - 반복/일관성 리스크 계산
5. `StopConditionEvaluator`
   - stop reason 산출
6. `SessionFlowOrchestrator`
   - 후보 제안/선택 실행 분리
   - 실행 후 자동 진행 없이 정지
   - stop reason 저장 및 체크포인트 스냅샷 저장
