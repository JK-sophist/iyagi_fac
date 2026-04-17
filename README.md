# Iyagi Fac MVP (개인용 작가 워크벤치)

> 이 프로젝트는 출시형 서비스보다 **개인용 글쓰기 보조 도구**에 집중합니다.
> 사용자는 작가/감독이며, 시스템은 **인물 목표 충돌 기반** 후보 제안과 시뮬레이션 보조를 수행합니다.

## 핵심 원칙

- 자동 진행/자동 결말/자동 챕터 완성 **미지원**
- 소설 **문체 변환 기능 없음**
- **체크포인트/분기 실험**이 MVP 핵심
- **자유 메모 / 장면 상태(채택·보류·폐기) / 직접 장면 목표 입력**을 우선 강화
- 장면 후보는 반드시 **인물 목표 추구/충돌**을 기반으로 생성
- 설정 변경은 기본적으로 **이후 장면부터 반영**
- 과거 장면은 **immutable record**

## 개인 작가 기본 사용 흐름

1. 프로젝트 생성
2. 캐릭터 생성 + 목표 입력(`surface_goal`, `hidden_goal`, `short_term_goal`, `long_term_goal` 등)
3. 관계 입력(`trust`, `hostility`, `dependency`, `betrayal_risk` 등)
4. 세션 시작 -> 후보 생성 -> 장면 실행
5. 장면 상태(채택/보류/폐기) + 작가 메모 저장
6. 체크포인트 저장/복원/분기
7. 자유 메모 저장
8. Markdown/TXT export

## 저장 방식

- 백엔드는 in-memory 상태를 `apps/backend/data/store.json` 파일로 즉시 동기화합니다.
- 서버 재시작 후에도 아래 데이터가 유지됩니다.
  - projects
  - characters
  - relationships
  - sessions
  - scenes
  - checkpoints
  - writer_memos
- `export`(Markdown/TXT)는 **사용자 출력본** 생성 기능이며, 내부 작업 상태 저장(store.json)과는 별개입니다.

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
- Pivot 계획: `docs/pivot-personal-writer-tool.md`
- 목표 기반 설계: `docs/goal-driven-narrative-design.md`
- 사용자 흐름: `docs/personal-writer-workflow.md`
