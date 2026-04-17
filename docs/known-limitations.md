# Known Limitations

1. 저장은 `apps/backend/data/store.json` 단일 파일 기반이라 동시 쓰기/대규모 데이터에는 부적합.
2. OpenAI provider는 placeholder이며 실제 네트워크 호출/키 관리/관측 로깅은 미완료.
3. 목표 충돌 후보 생성은 규칙 기반 MVP로, 고급 전략 추론(장기 플롯 최적화)은 제한적.
4. 관계도는 그래프 시각화가 아닌 폼 입력 중심 UX.
5. 테스트 실행을 위해서는 로컬에 Python/Node 의존성 설치가 필요(`fastapi`, `next` 등).
6. worker는 heartbeat placeholder로 실제 job queue 연동 전 단계.
