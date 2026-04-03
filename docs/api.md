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

모든 에러 응답:
```json
{
  "ok": false,
  "error": {
    "code": "...",
    "message": "..."
  }
}
```

## 구현 엔드포인트

1. `POST /projects`
2. `GET /projects`
3. `GET /projects/{project_id}`
4. `POST /projects/{project_id}/world-settings`
5. `POST /projects/{project_id}/ending-goals`
6. `POST /projects/{project_id}/characters`
7. `PUT /characters/{character_id}`
8. `POST /characters/{character_id}/archive`
9. `POST /characters/{character_id}/introduce-plan`
10. `POST /projects/{project_id}/relationships`
11. `PUT /projects/{project_id}/relationships`
12. `POST /projects/{project_id}/sessions`
13. `GET /sessions/{session_id}`
14. `POST /sessions/{session_id}/scene-candidates`
15. `POST /sessions/{session_id}/execute-scene`
16. `GET /sessions/{session_id}/scenes`
17. `GET /scenes/{scene_id}`
18. `POST /sessions/{session_id}/checkpoints`
19. `GET /sessions/{session_id}/checkpoints`
20. `POST /checkpoints/{checkpoint_id}/restore`
21. `POST /checkpoints/{checkpoint_id}/branch`
22. `POST /sessions/{session_id}/settings-change-preview`
23. `POST /sessions/{session_id}/apply-settings-change`
