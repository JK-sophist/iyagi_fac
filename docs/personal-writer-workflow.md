# Personal Writer Workflow

## Codex 추가 지시 없이 가능한 기본 흐름
1. 웹 UI 접속
2. 프로젝트 생성
3. 캐릭터 생성 + 목표 입력
4. 관계 입력
5. 세션 시작
6. 후보 생성
7. 장면 실행
8. 장면 상태(채택/보류/폐기) + 작가 메모 저장
9. 체크포인트 저장/복원/분기
10. 자유 메모 저장
11. Markdown/TXT export 호출

## 화면 기준 사용 순서
- `/projects/new` : 프로젝트 생성
- `/projects/{projectId}` : 프로젝트 개요 + 목표 충돌 요약 + export 진입
- `/projects/{projectId}/characters` : 목표 중심 캐릭터 입력/수정
- `/projects/{projectId}/relationships` : 확장 관계 입력
- `/projects/{projectId}/sessions/new` : 세션 시작
- `/sessions/{sessionId}` : 후보 생성/실행 + 직접 장면 목표 입력 + 주요 충돌 확인
- `/scenes/{sceneId}` : 장면 검토/상태/메모 저장
- `/sessions/{sessionId}/checkpoints` : 체크포인트/분기
- `/projects/{projectId}/writer` : 자유 메모

## 현재 자동화 경계
- 자동 결말 도달 없음
- 자동 챕터 생성 없음
- 실행 후 항상 사용자 선택 대기
- 과거 장면은 immutable
- 설정 변경은 기본적으로 이후 장면부터 반영

## 저장 위치
- 백엔드 데이터 파일: `apps/backend/data/store.json`
- 저장 대상: projects, characters, relationships, sessions, scenes, checkpoints, writer_memos
