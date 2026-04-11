# agent-company-os

Company OS v1 for CEO-led operations: goals -> missions -> evidence -> proposals -> eval -> approvals -> revenue events.

## 프로젝트 개요
내부 운영체계로 CEO가 목표를 등록하면 오케스트레이터가 에이전트/하네스를 실행해 승인 대기까지 자동화합니다.

## 왜 하이브리드 구조인가
상위 orchestration/ledger/risk/revenue는 우리 코드에서 통제하고, 장시간 조사/초안 생성만 provider(Anthropic or Mock)에 위임합니다.

## Agent / Harness
- Agents: COO, Scout, Builder, Reviewer
- Harnesses: Runtime, Eval(rule-based), Risk(approval queue), Revenue(KPI event logging)

## Anthropic provider
`PROVIDER_MODE=anthropic`에서만 활성화됩니다. API 키가 없으면 친절한 런타임 에러를 반환하며 앱 전체는 Mock 모드로 사용 가능합니다.

## 폴더 구조
- `apps/api`: Fastify API
- `apps/ceo-console`: React/Vite UI
- `packages/*`: types, storage, providers, tools, agents, harnesses
- `workers/orchestrator`: orchestrator
- `runtime-data`: JSON ledger storage
- `tests`: unit/e2e

## 환경 변수
`.env.example` 참고:
- PORT, WEB_PORT
- PROVIDER_MODE=mock|anthropic
- ANTHROPIC_API_KEY
- ANTHROPIC_MODEL
- ANTHROPIC_BETA_HEADER
- ANTHROPIC_AGENT_ID
- ANTHROPIC_ENVIRONMENT_ID

## Windows 기준 실행 방법
```powershell
npm install
copy .env.example .env
npm run dev
```

## Mock mode 실행
`.env`에서 `PROVIDER_MODE=mock`

## Anthropic mode 실행
`.env`에서 `PROVIDER_MODE=anthropic`, `ANTHROPIC_API_KEY` 포함. 키 없으면 demo 실행 시 명확한 에러를 반환합니다.

## 테스트
```powershell
npm run typecheck
npm run test
npm run build
```

## 알려진 한계
- JSON file storage only (single-process)
- Rule-based eval only
- Approval approved 후 실제 외부 실행은 mock

## 다음 단계
- Durable queue
- richer evaluator (LLM grader)
- KPI visualization + mission retry policies
