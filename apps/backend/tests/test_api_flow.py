from fastapi.testclient import TestClient

from app.api import store
from app.main import app

client = TestClient(app)


def reset_store() -> None:
    store.projects.clear()
    store.characters.clear()
    store.sessions.clear()
    store.scenes.clear()
    store.checkpoints.clear()


def bootstrap_project() -> tuple[str, str, str]:
    project = client.post("/api/projects", json={"title": "p"}).json()["data"]
    project_id = project["id"]
    c1 = client.post(f"/api/projects/{project_id}/characters", json={"name": "a", "is_introduced": True}).json()["data"]
    c2 = client.post(f"/api/projects/{project_id}/characters", json={"name": "b", "is_introduced": True}).json()["data"]
    client.post(
        f"/api/projects/{project_id}/relationships",
        json={"from_character_id": c1["id"], "to_character_id": c2["id"], "trust": 0.2, "tension": 0.3},
    )
    session = client.post(f"/api/projects/{project_id}/sessions", json={}).json()["data"]
    return project_id, session["id"], c1["id"]


def test_session_flow() -> None:
    reset_store()
    _, session_id, _ = bootstrap_project()

    cands = client.post(f"/api/sessions/{session_id}/scene-candidates")
    assert cands.status_code == 200
    assert len(cands.json()["data"]["items"]) == 3

    chosen = cands.json()["data"]["items"][0]["candidate_id"]
    run = client.post(f"/api/sessions/{session_id}/execute-scene", json={"candidate_id": chosen})
    assert run.status_code == 200
    assert run.json()["stop_reason"] is not None


def test_checkpoint_restore() -> None:
    reset_store()
    _, session_id, _ = bootstrap_project()
    cand = client.post(f"/api/sessions/{session_id}/scene-candidates").json()["data"]["items"][0]["candidate_id"]
    client.post(f"/api/sessions/{session_id}/execute-scene", json={"candidate_id": cand})

    cp = client.post(f"/api/sessions/{session_id}/checkpoints", json={"label": "cp1"}).json()["data"]
    restored = client.post(f"/api/checkpoints/{cp['id']}/restore")
    assert restored.status_code == 200
    assert restored.json()["data"]["restored_session_id"] == session_id


def test_branch_creation() -> None:
    reset_store()
    _, session_id, _ = bootstrap_project()
    cp = client.post(f"/api/sessions/{session_id}/checkpoints", json={"label": "cp1"}).json()["data"]

    branched = client.post(f"/api/checkpoints/{cp['id']}/branch", json={"branch_label": "alt"})
    assert branched.status_code == 200
    assert branched.json()["data"]["parent_session_id"] == session_id


def test_character_archive() -> None:
    reset_store()
    project_id, _, char_id = bootstrap_project()
    archived = client.post(f"/api/characters/{char_id}/archive")
    assert archived.status_code == 200
    assert archived.json()["data"]["is_archived"] is True

    session_id = client.post(f"/api/projects/{project_id}/sessions", json={}).json()["data"]["id"]
    cands = client.post(f"/api/sessions/{session_id}/scene-candidates").json()["data"]["items"]
    for c in cands:
        assert char_id not in c["participants"]


def test_settings_change_preview() -> None:
    reset_store()
    _, session_id, _ = bootstrap_project()
    cand = client.post(f"/api/sessions/{session_id}/scene-candidates").json()["data"]["items"][0]["candidate_id"]
    client.post(f"/api/sessions/{session_id}/execute-scene", json={"candidate_id": cand})

    preview = client.post(
        f"/api/sessions/{session_id}/settings-change-preview",
        json={"change_type": "world", "effective_from_scene_no": 1},
    )
    assert preview.status_code == 200
    assert len(preview.json()["warnings"]) >= 1
