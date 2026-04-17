# Architecture

## 개요

모노레포는 다음 컴포넌트로 구성됩니다.

- Frontend(Next.js): 사용자 조작 중심 UI
- Backend(FastAPI): 프로젝트/세션/체크포인트 API
- Worker(Python): 비동기 시뮬레이션/후처리 작업
- PostgreSQL: 영속 데이터 저장
- Redis: 캐시/큐

## 원칙

- 완전자동 서사 생성 금지
- 장면 실행 후 사용자 승인 대기
- 상태 변화 중심 모델(관계/감정/플래그/서사 점수)
- 과거 장면 immutable
- 설정 변경은 effective-from으로 이후 장면에만 적용
