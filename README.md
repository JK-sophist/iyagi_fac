# Iyagi Fac MVP (반자동 서사 시뮬레이터)

> 이 서비스는 **자동 소설 생성기**가 아닙니다.
> 사용자는 작가/감독이며, 시스템은 후보 제안과 시뮬레이션 보조를 수행합니다.

## 핵심 원칙

- 자동 진행/자동 결말/자동 챕터 완성 **미지원**
- 소설 **문체 변환 기능 없음**
- **체크포인트/분기 실험**이 MVP 핵심
- 설정 변경은 기본적으로 **이후 장면부터 반영**
- 과거 장면은 **immutable record**

## 저장소 구조

- `apps/backend` — FastAPI API + simulation engine + LLM provider abstraction
- `apps/frontend` — Next.js App Router UI MVP
- `apps/worker` — background worker placeholder
- `infra` — Dockerfiles
- `docs` — 제품/설계/운영 문서

## 사전 준비

```bash
cp .env.example .env
```

## 실행 순서 (권장: Docker Compose)

```bash
docker compose up --build
```

기본 주소:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Health: `http://localhost:8000/healthz`

## 로컬 단독 실행

### Backend
```bash
cd apps/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic -c alembic.ini upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd apps/frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api npm run dev
```

### Worker
```bash
cd apps/worker
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m worker.main
```

## 테스트

### Backend
```bash
cd apps/backend
pytest -q
```

## 데모 플로우 실행

```bash
cd apps/backend
python -m scripts.demo_story_run
```

## 문서 인덱스

- API: `docs/api.md`
- API 예시: `docs/api-examples.md`
- Runbook: `docs/runbook.md`
- Known limitations: `docs/known-limitations.md`
- Next roadmap: `docs/next-roadmap.md`
- Secrets/Env: `docs/secrets-and-env.md`
- Frontend UX: `docs/frontend-mvp.md`, `docs/ux-flow.md`, `docs/design-system.md`, `docs/component-map.md`
- Engine/Rules: `docs/simulation-engine.md`, `docs/stop-rules.md`, `docs/scene-lifecycle.md`
