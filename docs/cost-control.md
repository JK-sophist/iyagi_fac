# Cost Control

## 기본 원칙

1. 출력 형식은 구조화 JSON 우선
2. 장문 산문 금지
3. active character만 상세, 나머지는 summary
4. max output token guard 적용
5. timeout/retry 제한

## 적용 포인트

- PromptBuilder에서 필수 필드 제한
- LLMGuard:
  - `timeout_seconds`
  - `retry_count`
  - `max_output_tokens` 기반 clip
- 후보 생성/메시지 생성/요약을 분리해 필요한 호출만 수행
