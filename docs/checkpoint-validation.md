# Checkpoint Validation

데모 스크립트 검증 순서:
1. scene 실행 후 checkpoint 생성
2. restore 호출
3. branch 생성 호출
4. restore/branch 성공 여부를 점수화

검증 포인트:
- checkpoint_id 일치
- restored_session_id 일치
- branch session이 base_checkpoint_id를 참조
- restore 후 stop_reason 및 scene_ids 복구 가능
