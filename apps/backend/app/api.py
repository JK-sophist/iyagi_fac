from __future__ import annotations

import uuid
from datetime import datetime
import json
from pathlib import Path
from typing import Any, Literal
from zoneinfo import ZoneInfo

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from app.services.simulation import (
    CharacterState,
    DeterministicMockProvider,
    ParticipantSelector,
    RelationshipState,
    RuleEngine,
    SceneCandidate,
    SceneCandidateGenerator,
    SceneExecutor,
    SessionFlowOrchestrator,
    SessionState,
    StopConditionEvaluator,
)

KST = ZoneInfo("Asia/Seoul")

router = APIRouter(prefix="/api")
DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "store.json"


class Store:
    def __init__(self) -> None:
        self.projects: dict[str, dict] = {}
        self.characters: dict[str, dict] = {}
        self.sessions: dict[str, dict] = {}
        self.scenes: dict[str, dict] = {}
        self.checkpoints: dict[str, dict] = {}
        self.writer_memos: dict[str, dict] = {}


store = Store()

provider = DeterministicMockProvider(seed=11)
selector = ParticipantSelector()
generator = SceneCandidateGenerator(provider=provider, participant_selector=selector)
executor = SceneExecutor(rule_engine=RuleEngine())
stop_eval = StopConditionEvaluator()
orchestrator = SessionFlowOrchestrator(generator=generator, executor=executor, stop_evaluator=stop_eval)


def _engine_state_snapshot(session: dict) -> dict:
    state = session["engine_state"]
    return {
        "scene_no": state.scene_no,
        "flags": dict(state.flags),
        "narrative_scores": dict(state.narrative_scores),
        "stop_reason": state.stop_reason,
    }


def save_store() -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "projects": store.projects,
        "characters": store.characters,
        "sessions": {
            sid: {
                **{k: v for k, v in session.items() if k != "engine_state"},
                "engine_state_snapshot": _engine_state_snapshot(session),
            }
            for sid, session in store.sessions.items()
        },
        "scenes": store.scenes,
        "checkpoints": store.checkpoints,
        "writer_memos": store.writer_memos,
    }
    DATA_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def ok(data: Any, warnings: list[str] | None = None, stop_reason: str | None = None) -> dict:
    return {
        "ok": True,
        "data": data,
        "warnings": warnings or [],
        "stop_reason": stop_reason,
    }


def fail(code: str, message: str, status_code: int = 400) -> None:
    raise HTTPException(status_code=status_code, detail={"ok": False, "error": {"code": code, "message": message}})


class CreateProjectRequest(BaseModel):
    title: str
    description: str | None = None


@router.post("/projects")
def create_project(body: CreateProjectRequest) -> dict:
    project_id = str(uuid.uuid4())
    store.projects[project_id] = {
        "id": project_id,
        "title": body.title,
        "description": body.description,
        "world_settings": [],
        "ending_goals": [],
        "ending_vectors": {
            "collapse_vector": 0.0,
            "domination_vector": 0.0,
            "reconciliation_vector": 0.0,
            "betrayal_vector": 0.0,
            "corruption_vector": 0.0,
        },
        "character_ids": [],
        "relationships": [],
        "session_ids": [],
        "writer_memo_ids": [],
        "created_at": datetime.now(KST).isoformat(),
    }
    save_store()
    return ok(store.projects[project_id])


@router.get("/projects")
def list_projects() -> dict:
    return ok({"items": list(store.projects.values())})


@router.get("/projects/{project_id}")
def get_project(project_id: str) -> dict:
    project = store.projects.get(project_id)
    if not project:
        fail("project_not_found", "Project not found", 404)
    return ok(project)


class WorldSettingRequest(BaseModel):
    rules: dict = Field(default_factory=dict)
    effective_from_scene_no: int | None = None


@router.post("/projects/{project_id}/world-settings")
def create_world_setting(project_id: str, body: WorldSettingRequest) -> dict:
    project = store.projects.get(project_id)
    if not project:
        fail("project_not_found", "Project not found", 404)
    item = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "version_no": len(project["world_settings"]) + 1,
        "effective_from_scene_no": body.effective_from_scene_no,
        "rules": body.rules,
    }
    project["world_settings"].append(item)
    save_store()
    return ok(item)


class EndingGoalRequest(BaseModel):
    goal_text: str
    detail: dict = Field(default_factory=dict)
    effective_from_scene_no: int | None = None
    ending_vectors: dict[str, float] = Field(default_factory=dict)


@router.post("/projects/{project_id}/ending-goals")
def create_ending_goal(project_id: str, body: EndingGoalRequest) -> dict:
    project = store.projects.get(project_id)
    if not project:
        fail("project_not_found", "Project not found", 404)
    item = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "version_no": len(project["ending_goals"]) + 1,
        "effective_from_scene_no": body.effective_from_scene_no,
        "goal_text": body.goal_text,
        "detail": body.detail,
        "ending_vectors": body.ending_vectors,
    }
    project["ending_goals"].append(item)
    save_store()
    return ok(item)


class CharacterCreateRequest(BaseModel):
    name: str
    archetype: str | None = None
    is_introduced: bool = False
    surface_goal: str | None = None
    hidden_goal: str | None = None
    short_term_goal: str | None = None
    long_term_goal: str | None = None
    fear_or_taboo: str | None = None
    leverage: str | None = None
    secret: str | None = None
    speaking_style_note: str | None = None
    writer_note: str | None = None


@router.post("/projects/{project_id}/characters")
def create_character(project_id: str, body: CharacterCreateRequest) -> dict:
    project = store.projects.get(project_id)
    if not project:
        fail("project_not_found", "Project not found", 404)

    character_id = str(uuid.uuid4())
    character = {
        "id": character_id,
        "project_id": project_id,
        "name": body.name,
        "archetype": body.archetype,
        "is_introduced": body.is_introduced,
        "first_scene_no": None,
        "is_archived": False,
        "effective_from_scene_no": 0,
        "surface_goal": body.surface_goal,
        "hidden_goal": body.hidden_goal,
        "short_term_goal": body.short_term_goal,
        "long_term_goal": body.long_term_goal,
        "fear_or_taboo": body.fear_or_taboo,
        "leverage": body.leverage,
        "secret": body.secret,
        "speaking_style_note": body.speaking_style_note,
        "writer_note": body.writer_note,
    }
    store.characters[character_id] = character
    project["character_ids"].append(character_id)
    save_store()
    return ok(character)


class CharacterUpdateRequest(BaseModel):
    name: str | None = None
    archetype: str | None = None
    effective_from_scene_no: int | None = None
    surface_goal: str | None = None
    hidden_goal: str | None = None
    short_term_goal: str | None = None
    long_term_goal: str | None = None
    fear_or_taboo: str | None = None
    leverage: str | None = None
    secret: str | None = None
    speaking_style_note: str | None = None
    writer_note: str | None = None


@router.put("/characters/{character_id}")
def update_character(character_id: str, body: CharacterUpdateRequest) -> dict:
    character = store.characters.get(character_id)
    if not character:
        fail("character_not_found", "Character not found", 404)
    for key in [
        "name",
        "archetype",
        "effective_from_scene_no",
        "surface_goal",
        "hidden_goal",
        "short_term_goal",
        "long_term_goal",
        "fear_or_taboo",
        "leverage",
        "secret",
        "speaking_style_note",
        "writer_note",
    ]:
        value = getattr(body, key)
        if value is not None:
            character[key] = value
    save_store()
    return ok(character)


@router.get("/characters/{character_id}")
def get_character(character_id: str) -> dict:
    character = store.characters.get(character_id)
    if not character:
        fail("character_not_found", "Character not found", 404)
    return ok(character)


@router.post("/characters/{character_id}/archive")
def archive_character(character_id: str) -> dict:
    character = store.characters.get(character_id)
    if not character:
        fail("character_not_found", "Character not found", 404)
    character["is_archived"] = True
    save_store()
    return ok(character, warnings=["Archived character will be excluded from new scene participants."])


class IntroducePlanRequest(BaseModel):
    planned_scene_no: int
    note: str | None = None


@router.post("/characters/{character_id}/introduce-plan")
def create_introduce_plan(character_id: str, body: IntroducePlanRequest) -> dict:
    character = store.characters.get(character_id)
    if not character:
        fail("character_not_found", "Character not found", 404)
    character["effective_from_scene_no"] = body.planned_scene_no
    save_store()
    return ok({"character_id": character_id, "planned_scene_no": body.planned_scene_no, "note": body.note})


class RelationshipRequest(BaseModel):
    from_character_id: str
    to_character_id: str
    trust: float = 0.0
    tension: float = 0.0
    affection: float = 0.0
    hostility: float = 0.0
    dependency: float = 0.0
    utility_value: float = 0.0
    surveillance_level: float = 0.0
    betrayal_risk: float = 0.0
    shared_secret: str = ""


@router.post("/projects/{project_id}/relationships")
def create_relationship(project_id: str, body: RelationshipRequest) -> dict:
    project = store.projects.get(project_id)
    if not project:
        fail("project_not_found", "Project not found", 404)
    rel = body.model_dump()
    rel["id"] = str(uuid.uuid4())
    project["relationships"].append(rel)
    save_store()
    return ok(rel)


@router.put("/projects/{project_id}/relationships")
def update_relationship(project_id: str, body: RelationshipRequest) -> dict:
    project = store.projects.get(project_id)
    if not project:
        fail("project_not_found", "Project not found", 404)
    updated = None
    for rel in project["relationships"]:
        if rel["from_character_id"] == body.from_character_id and rel["to_character_id"] == body.to_character_id:
            rel.update(body.model_dump())
            updated = rel
            break
    if not updated:
        fail("relationship_not_found", "Relationship not found", 404)
    save_store()
    return ok(updated)


class CreateSessionRequest(BaseModel):
    parent_session_id: str | None = None
    base_checkpoint_id: str | None = None
    branch_label: str | None = None


def build_engine_state(project_id: str, session_id: str) -> SessionState:
    chars = [
        CharacterState(
            id=c["id"],
            name=c["name"],
            is_introduced=c["is_introduced"],
            is_archived=c["is_archived"],
            surface_goal=c.get("surface_goal") or "",
            hidden_goal=c.get("hidden_goal") or "",
            short_term_goal=c.get("short_term_goal") or "",
            long_term_goal=c.get("long_term_goal") or "",
            fear_or_taboo=c.get("fear_or_taboo") or "",
            leverage=c.get("leverage") or "",
            secret=c.get("secret") or "",
            speaking_style_note=c.get("speaking_style_note") or "",
            writer_note=c.get("writer_note") or "",
        )
        for c in store.characters.values()
        if c["project_id"] == project_id
    ]
    project = store.projects[project_id]
    rels = [
        RelationshipState(
            from_character_id=r["from_character_id"],
            to_character_id=r["to_character_id"],
            trust=r["trust"],
            tension=r["tension"],
            hostility=r.get("hostility", 0.0),
            dependency=r.get("dependency", 0.0),
            utility_value=r.get("utility_value", 0.0),
            surveillance_level=r.get("surveillance_level", 0.0),
            betrayal_risk=r.get("betrayal_risk", 0.0),
            shared_secret=r.get("shared_secret", ""),
        )
        for r in project["relationships"]
    ]
    return SessionState(session_id=session_id, project_id=project_id, characters=chars, relationships=rels)


def load_store() -> None:
    if not DATA_FILE.exists():
        return
    raw = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    store.projects = raw.get("projects", {})
    store.characters = raw.get("characters", {})
    store.scenes = raw.get("scenes", {})
    store.checkpoints = raw.get("checkpoints", {})
    store.writer_memos = raw.get("writer_memos", {})
    loaded_sessions: dict[str, dict] = {}
    for sid, session in raw.get("sessions", {}).items():
        hydrated = dict(session)
        snapshot = hydrated.pop("engine_state_snapshot", {})
        state = build_engine_state(hydrated["project_id"], sid)
        state.scene_no = snapshot.get("scene_no", state.scene_no)
        state.flags = snapshot.get("flags", state.flags)
        state.narrative_scores.update(snapshot.get("narrative_scores", {}))
        state.stop_reason = snapshot.get("stop_reason")
        hydrated.setdefault("candidate_cache", [])
        hydrated.setdefault("checkpoint_ids", [])
        hydrated.setdefault("scene_ids", [])
        hydrated.setdefault("manual_scene_goal", None)
        hydrated["engine_state"] = state
        loaded_sessions[sid] = hydrated
    store.sessions = loaded_sessions


load_store()


def summarize_goal_conflicts(session: dict) -> list[dict]:
    conflicts: list[dict] = []
    for item in session.get("candidate_cache", []):
        conflicts.extend(item.get("goal_conflicts", []))
    if conflicts:
        return conflicts
    project = store.projects.get(session["project_id"], {})
    chars = [store.characters[cid] for cid in project.get("character_ids", []) if cid in store.characters]
    for idx in range(min(len(chars), 3)):
        actor = chars[idx]
        rival = chars[(idx + 1) % len(chars)] if len(chars) > 1 else chars[idx]
        if actor.get("short_term_goal") or actor.get("surface_goal"):
            conflicts.append(
                {
                    "actor": actor["name"],
                    "actor_goal": actor.get("short_term_goal") or actor.get("surface_goal"),
                    "rival": rival["name"],
                    "rival_goal": rival.get("short_term_goal") or rival.get("surface_goal"),
                    "conflict_axis": "resource / trust",
                }
            )
    return conflicts


@router.post("/projects/{project_id}/sessions")
def create_session(project_id: str, body: CreateSessionRequest) -> dict:
    project = store.projects.get(project_id)
    if not project:
        fail("project_not_found", "Project not found", 404)
    session_id = str(uuid.uuid4())
    session = {
        "id": session_id,
        "project_id": project_id,
        "parent_session_id": body.parent_session_id,
        "base_checkpoint_id": body.base_checkpoint_id,
        "branch_label": body.branch_label,
        "stopped_reason": "awaiting_suggestions",
        "scene_ids": [],
        "candidate_cache": [],
        "checkpoint_ids": [],
        "manual_scene_goal": None,
        "engine_state": build_engine_state(project_id, session_id),
    }
    store.sessions[session_id] = session
    project["session_ids"].append(session_id)
    save_store()
    return ok({k: v for k, v in session.items() if k != "engine_state"}, stop_reason=session["stopped_reason"])


@router.get("/sessions/{session_id}")
def get_session(session_id: str) -> dict:
    session = store.sessions.get(session_id)
    if not session:
        fail("session_not_found", "Session not found", 404)
    data = {k: v for k, v in session.items() if k != "engine_state"}
    data["scene_count"] = len(session["scene_ids"])
    data["current_major_goal_conflicts"] = summarize_goal_conflicts(session)
    return ok(data, stop_reason=session["stopped_reason"])


@router.post("/sessions/{session_id}/scene-candidates")
def generate_scene_candidates(session_id: str) -> dict:
    session = store.sessions.get(session_id)
    if not session:
        fail("session_not_found", "Session not found", 404)
    candidates = orchestrator.suggest_candidates(session["engine_state"])
    payload = [
        {
            "candidate_id": c.candidate_id,
            "scene_type": c.scene_type,
            "title": c.title,
            "participants": c.participants,
            "location": c.location,
            "objective": c.objective,
            "why_now": c.why_now,
            "predicted_effects": c.predicted_effects,
            "risk_notes": c.risk_notes,
            "expected_stop_reason": c.expected_stop_reason,
            "goal_conflicts": c.goal_conflicts,
            "active_motives": c.active_motives,
            "scheme_opportunities": c.scheme_opportunities,
        }
        for c in candidates
    ]
    session["candidate_cache"] = payload
    session["stopped_reason"] = "awaiting_user_choice"
    save_store()
    return ok({"items": payload}, stop_reason=session["stopped_reason"])


class ExecuteSceneRequest(BaseModel):
    candidate_id: str


@router.post("/sessions/{session_id}/execute-scene")
def execute_scene(session_id: str, body: ExecuteSceneRequest) -> dict:
    session = store.sessions.get(session_id)
    if not session:
        fail("session_not_found", "Session not found", 404)
    candidate_data = next((c for c in session["candidate_cache"] if c["candidate_id"] == body.candidate_id), None)
    if not candidate_data:
        fail("candidate_not_found", "Call /scene-candidates first and choose valid candidate", 404)

    candidate = SceneCandidate(
        candidate_id=candidate_data["candidate_id"],
        scene_type=candidate_data["scene_type"],
        title=candidate_data["title"],
        participants=candidate_data["participants"],
        location=candidate_data["location"],
        objective=candidate_data["objective"],
        why_now=candidate_data["why_now"],
        predicted_effects=candidate_data.get("predicted_effects", {}),
        risk_notes=candidate_data.get("risk_notes", []),
        expected_stop_reason=candidate_data.get("expected_stop_reason", "user_decision_required"),
        goal_conflicts=candidate_data.get("goal_conflicts", []),
        active_motives=candidate_data.get("active_motives", []),
        scheme_opportunities=candidate_data.get("scheme_opportunities", []),
    )

    result = orchestrator.execute_selected_candidate(session["engine_state"], candidate)
    scene_id = str(uuid.uuid4())
    scene_obj = {
        "id": scene_id,
        "session_id": session_id,
        "scene_no": result.scene_no,
        "scene_status": "on_hold",
        "writer_memo": None,
        "manual_goal": session.get("manual_scene_goal"),
        "title": result.title,
        "participants": result.participants,
        "dialogue_log": result.dialogue_log,
        "action_log": result.action_log,
        "system_log": result.system_log,
        "predicted_effects": candidate_data["predicted_effects"],
        "goal_conflicts": candidate_data.get("goal_conflicts", []),
        "active_motives": candidate_data.get("active_motives", []),
        "scheme_opportunities": candidate_data.get("scheme_opportunities", []),
        "state_delta": result.state_delta,
    }
    store.scenes[scene_id] = scene_obj
    session["scene_ids"].append(scene_id)
    session["manual_scene_goal"] = None
    session["stopped_reason"] = session["engine_state"].stop_reason or "user_decision_required"
    save_store()
    return ok(scene_obj, stop_reason=session["stopped_reason"], warnings=["Scene executed. System stopped for user approval."])


@router.get("/sessions/{session_id}/scenes")
def list_scenes(session_id: str) -> dict:
    session = store.sessions.get(session_id)
    if not session:
        fail("session_not_found", "Session not found", 404)
    items = [store.scenes[sid] for sid in session["scene_ids"]]
    return ok({"items": items}, stop_reason=session["stopped_reason"])


@router.get("/scenes/{scene_id}")
def get_scene(scene_id: str) -> dict:
    scene = store.scenes.get(scene_id)
    if not scene:
        fail("scene_not_found", "Scene not found", 404)
    return ok(scene)


class SceneReviewUpdateRequest(BaseModel):
    scene_status: Literal["adopted", "on_hold", "discarded"] | None = None
    writer_memo: str | None = None


@router.put("/scenes/{scene_id}/review")
def update_scene_review(scene_id: str, body: SceneReviewUpdateRequest) -> dict:
    scene = store.scenes.get(scene_id)
    if not scene:
        fail("scene_not_found", "Scene not found", 404)
    if body.scene_status is not None:
        scene["scene_status"] = body.scene_status
    if body.writer_memo is not None:
        scene["writer_memo"] = body.writer_memo
    save_store()
    return ok(scene)


class ManualSceneGoalRequest(BaseModel):
    goal: str
    note: str | None = None


@router.post("/sessions/{session_id}/manual-scene-goal")
def set_manual_scene_goal(session_id: str, body: ManualSceneGoalRequest) -> dict:
    session = store.sessions.get(session_id)
    if not session:
        fail("session_not_found", "Session not found", 404)
    session["manual_scene_goal"] = {"goal": body.goal, "note": body.note}
    save_store()
    return ok({"session_id": session_id, "manual_scene_goal": session["manual_scene_goal"]})


class WriterMemoCreateRequest(BaseModel):
    content: str
    tags: list[str] = Field(default_factory=list)


@router.get("/projects/{project_id}/writer-memos")
def list_writer_memos(project_id: str) -> dict:
    project = store.projects.get(project_id)
    if not project:
        fail("project_not_found", "Project not found", 404)
    items = [store.writer_memos[mid] for mid in project["writer_memo_ids"]]
    return ok({"items": items})


@router.post("/projects/{project_id}/writer-memos")
def create_writer_memo(project_id: str, body: WriterMemoCreateRequest) -> dict:
    project = store.projects.get(project_id)
    if not project:
        fail("project_not_found", "Project not found", 404)
    memo_id = str(uuid.uuid4())
    memo = {
        "id": memo_id,
        "project_id": project_id,
        "content": body.content,
        "tags": body.tags,
        "created_at": datetime.now(KST).isoformat(),
    }
    store.writer_memos[memo_id] = memo
    project["writer_memo_ids"].append(memo_id)
    save_store()
    return ok(memo)


@router.get("/projects/{project_id}/export", response_class=PlainTextResponse)
def export_project(project_id: str, format: Literal["markdown", "txt"] = Query(default="markdown")) -> str:
    project = store.projects.get(project_id)
    if not project:
        fail("project_not_found", "Project not found", 404)
    sessions = [store.sessions[sid] for sid in project["session_ids"] if sid in store.sessions]
    scenes: list[dict] = []
    for session in sessions:
        scenes.extend([store.scenes[sid] for sid in session["scene_ids"] if sid in store.scenes])
    memos = [store.writer_memos[mid] for mid in project["writer_memo_ids"]]

    if format == "txt":
        lines = [f"Project: {project['title']}", f"Description: {project.get('description') or '-'}", "", "[Writer Memos]"]
        lines.extend([f"- {memo['content']}" for memo in memos] or ["- (none)"])
        lines.append("")
        lines.append("[Scenes]")
        lines.extend(
            [
                f"{scene['scene_no']}. {scene['title']} | status={scene.get('scene_status', 'on_hold')} | memo={scene.get('writer_memo') or '-'} | manual_goal={(scene.get('manual_goal') or {}).get('goal', '-')}"
                for scene in scenes
            ]
            or ["(none)"]
        )
        return "\n".join(lines)

    lines = [f"# {project['title']}", "", f"> {project.get('description') or 'No description'}", "", "## Writer Memos"]
    lines.extend([f"- {memo['content']}" for memo in memos] or ["- (none)"])
    lines.append("")
    lines.append("## Scenes")
    lines.extend(
        [
            f"- Scene {scene['scene_no']}: **{scene['title']}** (`{scene.get('scene_status', 'on_hold')}`)\n  - memo: {scene.get('writer_memo') or '-'}\n  - manual_goal: {(scene.get('manual_goal') or {}).get('goal', '-')}"
            for scene in scenes
        ]
        or ["- (none)"]
    )
    return "\n".join(lines)


class CheckpointCreateRequest(BaseModel):
    label: str | None = None


@router.post("/sessions/{session_id}/checkpoints")
def create_checkpoint(session_id: str, body: CheckpointCreateRequest) -> dict:
    session = store.sessions.get(session_id)
    if not session:
        fail("session_not_found", "Session not found", 404)
    checkpoint_id = str(uuid.uuid4())
    cp = {
        "id": checkpoint_id,
        "session_id": session_id,
        "project_id": session["project_id"],
        "scene_no": len(session["scene_ids"]),
        "label": body.label,
        "snapshot_json": {
            "scene_ids": list(session["scene_ids"]),
            "stop_reason": session["stopped_reason"],
            "flags": dict(session["engine_state"].flags),
            "scores": dict(session["engine_state"].narrative_scores),
        },
    }
    store.checkpoints[checkpoint_id] = cp
    session["checkpoint_ids"].append(checkpoint_id)
    save_store()
    return ok(cp)


@router.get("/sessions/{session_id}/checkpoints")
def list_checkpoints(session_id: str) -> dict:
    session = store.sessions.get(session_id)
    if not session:
        fail("session_not_found", "Session not found", 404)
    items = [store.checkpoints[cid] for cid in session["checkpoint_ids"]]
    return ok({"items": items})


@router.post("/checkpoints/{checkpoint_id}/restore")
def restore_checkpoint(checkpoint_id: str) -> dict:
    cp = store.checkpoints.get(checkpoint_id)
    if not cp:
        fail("checkpoint_not_found", "Checkpoint not found", 404)
    session = store.sessions.get(cp["session_id"])
    if not session:
        fail("session_not_found", "Session not found", 404)
    session["scene_ids"] = list(cp["snapshot_json"]["scene_ids"])
    session["stopped_reason"] = cp["snapshot_json"]["stop_reason"]
    session["engine_state"].flags = dict(cp["snapshot_json"]["flags"])
    session["engine_state"].narrative_scores.update(cp["snapshot_json"]["scores"])
    save_store()
    return ok({"restored_session_id": session["id"], "checkpoint_id": checkpoint_id}, stop_reason=session["stopped_reason"])


class BranchRequest(BaseModel):
    branch_label: str


@router.post("/checkpoints/{checkpoint_id}/branch")
def branch_from_checkpoint(checkpoint_id: str, body: BranchRequest) -> dict:
    cp = store.checkpoints.get(checkpoint_id)
    if not cp:
        fail("checkpoint_not_found", "Checkpoint not found", 404)
    parent = store.sessions.get(cp["session_id"])
    if not parent:
        fail("session_not_found", "Session not found", 404)

    new_session_id = str(uuid.uuid4())
    new_state = build_engine_state(parent["project_id"], new_session_id)
    new_state.flags = dict(cp["snapshot_json"]["flags"])
    new_state.narrative_scores.update(cp["snapshot_json"]["scores"])
    session = {
        "id": new_session_id,
        "project_id": parent["project_id"],
        "parent_session_id": parent["id"],
        "base_checkpoint_id": checkpoint_id,
        "branch_label": body.branch_label,
        "stopped_reason": "awaiting_suggestions",
        "scene_ids": list(cp["snapshot_json"]["scene_ids"]),
        "candidate_cache": [],
        "checkpoint_ids": [],
        "manual_scene_goal": None,
        "engine_state": new_state,
    }
    store.sessions[new_session_id] = session
    store.projects[parent["project_id"]]["session_ids"].append(new_session_id)
    save_store()
    return ok({k: v for k, v in session.items() if k != "engine_state"})


class SettingsPreviewRequest(BaseModel):
    change_type: Literal["world", "ending", "character"]
    effective_from_scene_no: int | None = None


@router.post("/sessions/{session_id}/settings-change-preview")
def settings_change_preview(session_id: str, body: SettingsPreviewRequest) -> dict:
    session = store.sessions.get(session_id)
    if not session:
        fail("session_not_found", "Session not found", 404)
    current_scene_no = len(session["scene_ids"])
    warnings: list[str] = []

    if current_scene_no > 0 and (body.effective_from_scene_no is None or body.effective_from_scene_no <= current_scene_no):
        warnings.append("변경 적용 시점이 과거 장면 범위와 충돌할 수 있습니다.")

    if body.change_type in {"world", "ending"} and current_scene_no >= 3:
        warnings.append("큰 설정 변경은 분기 생성(branch_from_checkpoint) 방식이 더 안전합니다.")

    return ok(
        {
            "can_apply": True,
            "recommended_mode": "branch_from_checkpoint" if warnings else "future_only",
            "current_scene_no": current_scene_no,
        },
        warnings=warnings,
    )


class ApplySettingsChangeRequest(BaseModel):
    mode: Literal["future_only", "branch_from_checkpoint", "overwrite_current_session"]
    world_rules: dict | None = None
    ending_goal: str | None = None
    effective_from_scene_no: int | None = None
    checkpoint_id: str | None = None


@router.post("/sessions/{session_id}/apply-settings-change")
def apply_settings_change(session_id: str, body: ApplySettingsChangeRequest) -> dict:
    session = store.sessions.get(session_id)
    if not session:
        fail("session_not_found", "Session not found", 404)
    project = store.projects[session["project_id"]]

    warnings: list[str] = []
    target_session_id = session_id

    if body.mode == "future_only":
        if body.world_rules is not None:
            project["world_settings"].append(
                {
                    "id": str(uuid.uuid4()),
                    "project_id": project["id"],
                    "version_no": len(project["world_settings"]) + 1,
                    "effective_from_scene_no": body.effective_from_scene_no or len(session["scene_ids"]) + 1,
                    "rules": body.world_rules,
                }
            )
        if body.ending_goal is not None:
            project["ending_goals"].append(
                {
                    "id": str(uuid.uuid4()),
                    "project_id": project["id"],
                    "version_no": len(project["ending_goals"]) + 1,
                    "effective_from_scene_no": body.effective_from_scene_no or len(session["scene_ids"]) + 1,
                    "goal_text": body.ending_goal,
                }
            )

    elif body.mode == "branch_from_checkpoint":
        if not body.checkpoint_id:
            fail("checkpoint_required", "checkpoint_id is required for branch_from_checkpoint mode", 400)
        branch_res = branch_from_checkpoint(body.checkpoint_id, BranchRequest(branch_label="settings_change_branch"))
        target_session_id = branch_res["data"]["id"]
        warnings.append("변경 적용을 위해 새 분기가 생성되었습니다.")

    elif body.mode == "overwrite_current_session":
        warnings.append("현재 세션 overwrite 모드는 과거 일관성 훼손 위험이 있습니다.")

    save_store()
    return ok(
        {
            "applied": True,
            "mode": body.mode,
            "target_session_id": target_session_id,
            "effective_from_scene_no": body.effective_from_scene_no,
        },
        warnings=warnings,
        stop_reason=store.sessions[target_session_id]["stopped_reason"],
    )
