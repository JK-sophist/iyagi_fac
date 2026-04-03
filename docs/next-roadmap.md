# Next Roadmap

## P1 (실사용성)
- API 영속화 전환(in-memory -> PostgreSQL)
- frontend에서 캐릭터/관계/세션 상세 조회 API 연동 강화
- scene detail 액션(채택/재실행/다른후보/저장/종료) 완전 연동

## P2 (품질)
- simulation scoring 정교화(일관성/반복/수렴)
- checkpoint integrity 자동 검증 테스트 확장
- branch divergence 시각화 추가

## P3 (운영)
- OpenAI 실제 provider 연동 + fallback 전략 활성화
- secrets manager 기반 키 운영
- CI 파이프라인(backend+frontend+compose smoke)
