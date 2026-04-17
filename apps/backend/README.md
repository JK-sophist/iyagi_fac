# apps/backend

FastAPI 기반 API 서버입니다.

## 실행

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 마이그레이션

```bash
alembic -c alembic.ini upgrade head
```

## Seed

```bash
python -m scripts.seed
```

## 테스트

```bash
pytest
```

## 주요 엔드포인트

- `GET /healthz` : 헬스체크


## 시뮬레이션 엔진 테스트

```bash
pytest tests/test_simulation_engine.py
```


## 데모 시나리오 실행

```bash
python -m scripts.demo_story_run
```
