# Secrets and Environment

## 보안 원칙

- API key는 backend/server 전용
- frontend 번들에 key 포함 금지
- 목적별(project/service-account/key) 분리 운용

## 권장 변수

- `OPENAI_API_KEY_SIMULATION`
- `OPENAI_API_KEY_EVALUATION`
- `OPENAI_PROJECT_ID_SIMULATION`
- `OPENAI_PROJECT_ID_EVALUATION`
- `OPENAI_MODEL_SCENE_CANDIDATE`
- `OPENAI_MODEL_SCENE_EXECUTION`

## 환경 분리

- dev
- staging
- prod-simulation
- prod-evaluation
- prod-admin

## 운영 가이드

- 키 로테이션 주기 운영
- 최소 권한 service account 적용
- 배포 환경별 .env/secret store 분리
