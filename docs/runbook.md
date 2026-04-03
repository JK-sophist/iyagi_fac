# Runbook

## 1) 환경 준비

```bash
cp .env.example .env
```

## 2) 전체 서비스 기동 (Docker Compose)

```bash
docker compose up --build
```

## 3) 상태 확인

- Backend health: `curl http://localhost:8000/healthz`
- Frontend 접속: `http://localhost:3000`

## 4) 데모 플로우 실행

```bash
cd apps/backend
python -m scripts.demo_story_run
```

## 5) 기대 결과

- 샘플 프로젝트/세션 생성
- scene candidate 생성 및 1회 실행
- checkpoint 생성/복원/분기
- settings preview/apply
- metrics JSON 출력
