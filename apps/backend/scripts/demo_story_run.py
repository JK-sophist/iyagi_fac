from __future__ import annotations

import json
from dataclasses import dataclass



@dataclass
class DemoResult:
    project_id: str
    session_id: str
    checkpoint_id: str
    branch_session_id: str
    metrics: dict


def _score_between_0_100(value: float) -> float:
    return round(max(0.0, min(100.0, value)), 2)


def evaluate_metrics(scene: dict, stop_reason: str, restore_ok: bool, branch_ok: bool) -> dict:
    risk = scene.get("state_delta", {}).get("risk", {})
    consistency_risk = float(risk.get("consistency_risk", 0))
    repetition_risk = float(risk.get("repetition_risk", 0))

    rel_updates = scene.get("state_delta", {}).get("relationship_updates", [])
    avg_drift = 0.0
    if rel_updates:
        avg_drift = sum(abs(float(i.get("tension", 0))) for i in rel_updates) / len(rel_updates)

    character_consistency = _score_between_0_100((1 - consistency_risk) * 100)
    relationship_drift = _score_between_0_100(max(0, 100 - (avg_drift * 25)))
    decision_clarity = 95.0 if stop_reason == "user_decision_required" else 75.0
    repetition_score = _score_between_0_100((1 - repetition_risk) * 100)
    checkpoint_integrity = 100.0 if restore_ok else 40.0
    branch_divergence_clarity = 100.0 if branch_ok else 45.0

    return {
        "character_consistency_score": character_consistency,
        "relationship_drift_score": relationship_drift,
        "decision_clarity_score": decision_clarity,
        "repetition_score": repetition_score,
        "checkpoint_integrity_score": checkpoint_integrity,
        "branch_divergence_clarity": branch_divergence_clarity,
    }


def run_demo() -> DemoResult:
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1) demo data load: world/ending/characters(6+)/relationships with special roles
    project = client.post("/api/projects", json={"title": "유리 항만 협약", "description": "demo story"}).json()["data"]
    project_id = project["id"]

    client.post(
        f"/api/projects/{project_id}/world-settings",
        json={"rules": {"factions": ["심해연합", "성채평의회"], "trade": "fragile"}, "effective_from_scene_no": 0},
    )
    client.post(
        f"/api/projects/{project_id}/ending-goals",
        json={"goal_text": "전면전 방지와 취약 협약 체결", "effective_from_scene_no": 0},
    )

    names = [
        ("리아", True),
        ("도윤", True),
        ("세린", False),  # mid-story introduction
        ("한결", True),
        ("민재", False),  # mid-story introduction
        ("이브", True),  # soft-delete candidate
    ]
    char_ids: dict[str, str] = {}
    for name, introduced in names:
        res = client.post(
            f"/api/projects/{project_id}/characters",
            json={"name": name, "is_introduced": introduced},
        ).json()["data"]
        char_ids[name] = res["id"]

    # relationships
    rel_pairs = [
        ("리아", "도윤", 0.2, 0.4),
        ("리아", "한결", 0.5, 0.2),
        ("도윤", "이브", 0.1, 0.6),
        ("한결", "세린", 0.3, 0.5),
    ]
    for a, b, trust, tension in rel_pairs:
        client.post(
            f"/api/projects/{project_id}/relationships",
            json={
                "from_character_id": char_ids[a],
                "to_character_id": char_ids[b],
                "trust": trust,
                "tension": tension,
            },
        )

    # soft delete candidate
    client.post(f"/api/characters/{char_ids['이브']}/archive")

    # 2) session create
    session = client.post(f"/api/projects/{project_id}/sessions", json={"branch_label": "main"}).json()["data"]
    session_id = session["id"]

    # scenario arcs: suspicion, betrayal, conversion
    # 3) scene candidates fetch
    candidates = client.post(f"/api/sessions/{session_id}/scene-candidates", json={}).json()["data"]["items"]

    # 4) one candidate execute
    executed = client.post(
        f"/api/sessions/{session_id}/execute-scene",
        json={"candidate_id": candidates[0]["candidate_id"]},
    ).json()

    # mid-story character introduction plan
    client.post(
        f"/api/characters/{char_ids['세린']}/introduce-plan",
        json={"planned_scene_no": 2, "note": "suspicion arc 이후 등장"},
    )

    # 5) checkpoint create
    cp = client.post(f"/api/sessions/{session_id}/checkpoints", json={"label": "after_suspicion"}).json()["data"]
    checkpoint_id = cp["id"]

    # 6) restore to branch
    restored = client.post(f"/api/checkpoints/{checkpoint_id}/restore", json={}).json()
    branched = client.post(
        f"/api/checkpoints/{checkpoint_id}/branch",
        json={"branch_label": "betrayal_branch"},
    ).json()["data"]

    # 7) settings change preview
    preview = client.post(
        f"/api/sessions/{session_id}/settings-change-preview",
        json={"change_type": "world", "effective_from_scene_no": 1},
    ).json()

    # 8) apply future-only edit
    applied = client.post(
        f"/api/sessions/{session_id}/apply-settings-change",
        json={"mode": "future_only", "world_rules": {"sanction_level": "high"}, "effective_from_scene_no": 2},
    ).json()

    restore_ok = restored.get("ok", False) and restored["data"]["checkpoint_id"] == checkpoint_id
    branch_ok = branched.get("base_checkpoint_id") == checkpoint_id

    metrics = evaluate_metrics(
        scene=executed["data"],
        stop_reason=executed.get("stop_reason") or "",
        restore_ok=restore_ok,
        branch_ok=branch_ok,
    )

    report = {
        "project_id": project_id,
        "session_id": session_id,
        "checkpoint_id": checkpoint_id,
        "branch_session_id": branched["id"],
        "preview_warnings": preview.get("warnings", []),
        "apply_warnings": applied.get("warnings", []),
        "metrics": metrics,
        "scenario_coverage": [
            "suspicion arc",
            "betrayal arc (branch)",
            "conversion arc (future-only settings edit)",
            "mid-story character introduction",
            "settings edit after scene acceptance",
            "checkpoint restore and branch creation",
        ],
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))

    return DemoResult(
        project_id=project_id,
        session_id=session_id,
        checkpoint_id=checkpoint_id,
        branch_session_id=branched["id"],
        metrics=metrics,
    )


if __name__ == "__main__":
    run_demo()
