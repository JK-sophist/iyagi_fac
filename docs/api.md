# API

Base path: `/api`

모든 성공 응답:
```json
{
  "ok": true,
  "data": {},
  "warnings": [],
  "stop_reason": "..."
}
```

## 목표 중심 확장 핵심
- 캐릭터는 목표/비밀/레버리지 필드를 가진다.
- 관계는 신뢰 외에 배신 리스크/감시 수준/공유 비밀 축을 가진다.
- 후보 장면은 `goal_conflicts`, `active_motives`, `scheme_opportunities`를 포함한다.
- 세션 조회는 `current_major_goal_conflicts` 요약을 포함한다.
- export는 장면 상태/작가 메모/직접 장면 목표를 포함한다.

## 구현 엔드포인트
1. `POST /projects`
2. `GET /projects`
3. `GET /projects/{project_id}`
4. `POST /projects/{project_id}/world-settings`
5. `POST /projects/{project_id}/ending-goals`
6. `POST /projects/{project_id}/characters`
7. `GET /characters/{character_id}`
8. `PUT /characters/{character_id}`
9. `POST /characters/{character_id}/archive`
10. `POST /characters/{character_id}/introduce-plan`
11. `POST /projects/{project_id}/relationships`
12. `PUT /projects/{project_id}/relationships`
13. `POST /projects/{project_id}/sessions`
14. `GET /sessions/{session_id}`
15. `POST /sessions/{session_id}/scene-candidates`
16. `POST /sessions/{session_id}/manual-scene-goal`
17. `POST /sessions/{session_id}/execute-scene`
18. `GET /sessions/{session_id}/scenes`
19. `GET /scenes/{scene_id}`
20. `PUT /scenes/{scene_id}/review`
21. `POST /sessions/{session_id}/checkpoints`
22. `GET /sessions/{session_id}/checkpoints`
23. `POST /checkpoints/{checkpoint_id}/restore`
24. `POST /checkpoints/{checkpoint_id}/branch`
25. `POST /sessions/{session_id}/settings-change-preview`
26. `POST /sessions/{session_id}/apply-settings-change`
27. `GET /projects/{project_id}/writer-memos`
28. `POST /projects/{project_id}/writer-memos`
29. `GET /projects/{project_id}/export?format=markdown|txt`
