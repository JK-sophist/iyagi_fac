# Scene Lifecycle

1. `suggest_candidates(session)` 호출
2. 후보 3개 반환
3. 사용자가 1개 선택
4. `execute_selected_candidate(session, candidate)` 호출
5. `RuleEngine`로 상태 변화 반영
6. `StopConditionEvaluator`로 stop reason 계산
7. 세션에 stop reason 저장 + 체크포인트 자동 저장
8. 흐름 종료 (다음 후보는 별도 호출 필요)
