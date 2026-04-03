# Known Limitations

1. API는 현재 in-memory Store 기반으로 재시작 시 상태가 초기화됨.
2. OpenAI provider는 placeholder이며 실제 HTTP 연동 미완료.
3. 일부 frontend 화면은 ID 직접 입력 방식(목록 API 부족).
4. 관계도 그래프 편집 UI 미구현(폼 기반 편집만 제공).
5. scene detail 액션 버튼 일부는 UX만 있고 실제 API 연결이 제한적.
6. Docker compose 실기동은 실행 환경에 Docker daemon이 필요.
7. worker는 heartbeat placeholder로 실제 job queue 연동 전 단계.
