# Provider Design

## 목표

- provider interface 기반으로 LLM 벤더 의존성을 분리
- 구조화 JSON 우선 출력
- 장문 산문 억제 + 비용 통제

## 구성

- `LLMProvider` 인터페이스
  - `generate_scene_candidates(...)`
  - `generate_scene_messages(...)`
  - `summarize_scene_result(...)`
- `MockLLMProvider`
  - deterministic 결과
  - 테스트/로컬 개발용
- `OpenAIProviderPlaceholder`
  - PromptBuilder + JSON parser + guard/retry/timeout/max token 포함
  - 실제 HTTP 연결은 차후
- `FallbackProviderStrategy`
  - primary 실패 시 secondary 전환을 위한 자리

## 프롬프트 원칙

- active characters만 상세 포함
- 나머지 캐릭터/과거 로그/세계관은 요약 텍스트만 포함
- structured JSON-only 응답 지시
