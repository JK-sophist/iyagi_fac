# Runbook (Personal Writer Workbench)

이 프로젝트는 출시형 서비스가 아니라 **개인용 작가 워크벤치**다.

## 1) 환경 준비

```bash
cp .env.example .env
```

## 2) Backend 실행

```bash
cd apps/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:
```bash
curl http://127.0.0.1:8000/healthz
```

## 3) Frontend 실행

```bash
cd apps/frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api npm run dev
```

접속: `http://127.0.0.1:3000`

## 4) 저장 파일 확인 (재시작 내구성)
백엔드는 인메모리 + JSON persistence를 사용한다.
- 저장 파일: `apps/backend/data/store.json`
- 서버 재시작 후에도 projects/characters/relationships/sessions/scenes/checkpoints/writer_memos 유지
- Markdown/TXT export는 공유/검토용 출력이며, 내부 저장은 계속 `store.json`이 담당

## 5) 실제 사용 흐름 (Codex 추가 지시 없이 가능)
1. `/projects/new` 프로젝트 생성
2. `/projects/{projectId}/characters` 캐릭터 목표 입력
3. `/projects/{projectId}/relationships` 관계 입력
4. `/projects/{projectId}/sessions/new` 세션 시작
5. `/sessions/{sessionId}` 후보 생성/선택 실행
6. `/scenes/{sceneId}` 장면 상태 + 작가 메모 저장
7. `/sessions/{sessionId}/checkpoints` 체크포인트 저장/복원/분기
8. `/projects/{projectId}/writer` 자유 메모 저장
9. `/projects/{projectId}`에서 Markdown/TXT export

## 6) E2E 확인용 API 예시
```bash
curl -X POST http://127.0.0.1:8000/api/projects -H 'content-type: application/json' -d '{"title":"solo-workbench"}'
```
