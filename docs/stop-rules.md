# Stop Rules

장면 실행 후 반드시 정지하고 사용자 결정을 기다린다.

## stop reason 우선순위

1. `repetition_risk_high`
2. `consistency_risk_high`
3. `important_relationship_shift`
4. `recommended_scene_limit_reached`
5. `character_collapse_risk`
6. `user_decision_required`

## 자동 진행 금지 정책

- 실행 함수는 단일 후보만 처리
- 다음 후보 생성은 별도 API/호출로만 가능
- orchestrator는 내부 루프를 돌지 않음
