# API Examples

## 1) 프로젝트 생성

`POST /api/projects`
```json
{ "title": "검은 항구의 맹세", "description": "demo" }
```

## 2) 장면 후보 생성

`POST /api/sessions/{session_id}/scene-candidates`

응답 예:
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "candidate_id": "cand_1_1",
        "scene_type": "negotiation",
        "title": "Negotiation 장면 1",
        "participants": ["c1", "c2"],
        "location": "해저 회담실",
        "objective": "갈등을 통제하면서 정보를 확보한다",
        "why_now": "scene_no=0 이후 긴장/정보 수요가 임계치에 도달함",
        "predicted_effects": {"relationship": {"trust_delta": -0.1}},
        "risk_notes": ["반복 패턴 위험"],
        "expected_stop_reason": "user_decision_required"
      }
    ]
  },
  "warnings": [],
  "stop_reason": "awaiting_user_choice"
}
```

## 3) 설정 변경 사전 점검

`POST /api/sessions/{session_id}/settings-change-preview`
```json
{ "change_type": "world", "effective_from_scene_no": 1 }
```

응답 예:
```json
{
  "ok": true,
  "data": {
    "can_apply": true,
    "recommended_mode": "branch_from_checkpoint",
    "current_scene_no": 3
  },
  "warnings": [
    "변경 적용 시점이 과거 장면 범위와 충돌할 수 있습니다.",
    "큰 설정 변경은 분기 생성(branch_from_checkpoint) 방식이 더 안전합니다."
  ],
  "stop_reason": null
}
```
