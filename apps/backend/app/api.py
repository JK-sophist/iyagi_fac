from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal
from zoneinfo import ZoneInfo

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.simulation import (
    CharacterState,
    DeterministicMockProvider,
    ParticipantSelector,
    RelationshipState,
    RuleEngine,
    SceneCandidateGenerator,
    SceneExecutor,
    SessionFlowOrchestrator,
    SessionState,
    StopConditionEvaluator,
)

KST = ZoneInfo("Asia/Seoul")

router = APIRouter(prefix="/api")


class Store:
    def __init__(self) -> None:
        self.projects: dict[str, dict] = {}
        self.characters: dict[str, dict] = {}
        self.sessions: dict[str, dict] = {}
        self.scenes: dict[str, dict] = {}
        self.checkpoints: dict[str, dict] = {}


store = Store()

provider = DeterministicMockProvider(seed=11)
selector = ParticipantSelector()
generator = SceneCandidateGenerator(provider=provider, participant_selector=selector)
executor = SceneExecutor(rule_engine=RuleEngine())
stop_eval = StopConditionEvaluator()
orchestrator = SessionFlowOrchestrator(generator=generator, executor=executor, stop_evaluator=stop_eval)


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
        "character_ids": [],
        "relationships": [],
        "session_ids": [],
        "created_at": datetime.now(KST).isoformat(),
    }
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
    return ok(item)


class EndingGoalRequest(BaseModel):
    goal_text: str
    detail: dict = Field(default_factory=dict)
    effective_from_scene_no: int | None = None


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
    }
    project["ending_goals"].append(item)
    return ok(item)


class CharacterCreateRequest(BaseModel):
    name: str
    archetype: str | None = None
    is_introduced: bool = False


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
    }
    store.characters[character_id] = character
    project["character_ids"].append(character_id)
    return ok(character)


class CharacterUpdateRequest(BaseModel):
    name: str | None = None
    archetype: str | None = None
    effective_from_scene_no: int | None = None


@router.put("/characters/{character_id}")
def update_character(character_id: str, body: CharacterUpdateRequest) -> dict:
    character = store.characters.get(character_id)
    if not character:
        fail("character_not_found", "Character not found", 404)
    for key in ["name", "archetype", "effective_from_scene_no"]:
        value = getattr(body, key)
        if value is not None:
            character[key] = value
    return ok(character)


@router.post("/characters/{character_id}/archive")
def archive_character(character_id: str) -> dict:
    character = store.characters.get(character_id)
    if not character:
        fail("character_not_found", "Character not found", 404)
    character["is_archived"] = True
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
    return ok({"character_id": character_id, "planned_scene_no": body.planned_scene_no, "note": body.note})


class RelationshipRequest(BaseModel):
    from_character_id: str
    to_character_id: str
    trust: float = 0.0
    tension: float = 0.0
    affection: float = 0.0
    hostility: float = 0.0
    dependency: float = 0.0


@router.post("/projects/{project_id}/relationships")
def create_relationship(project_id: str, body: RelationshipRequest) -> dict:
    project = store.projects.get(project_id)
    if not project:
        fail("project_not_found", "Project not found", 404)
    rel = body.model_dump()
    rel["id"] = str(uuid.uuid4())
    project["relationships"].append(rel)
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
    return ok(updated)


class CreateSessionRequest(BaseModel):
    parent_session_id: str | None = None
    base_checkpoint_id: str | None = None
    branch_label: str | None = None


def build_engine_state(project_id: str, session_id: str) -> SessionState:
    chars = [
        CharacterState(id=c["id"], name=c["name"], is_introduced=c["is_introduced"], is_archived=c["is_archived"])
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
        )
        for r in project["relationships"]
    ]
    return SessionState(session_id=session_id, project_id=project_id, characters=chars, relationships=rels)


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
        "engine_state": build_engine_state(project_id, session_id),
    }
    store.sessions[session_id] = session
    project["session_ids"].append(session_id)
    return ok({k: v for k, v in session.items() if k != "engine_state"}, stop_reason=session["stopped_reason"])


@router.get("/sessions/{session_id}")
def get_session(session_id: str) -> dict:
    session = store.sessions.get(session_id)
    if not session:
        fail("session_not_found", "Session not found", 404)
    data = {k: v for k, v in session.items() if k != "engine_state"}
    data["scene_count"] = len(session["scene_ids"])
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
        }
        for c in candidates
    ]
    session["candidate_cache"] = payload
    session["stopped_reason"] = "awaiting_user_choice"
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

    candidates = orchestrator.suggest_candidates(session["engine_state"])
    candidate = next((c for c in candidates if c.candidate_id == body.candidate_id), None)
    if not candidate:
        fail("candidate_execution_mismatch", "Candidate no longer valid", 409)

    result = orchestrator.execute_selected_candidate(session["engine_state"], candidate)
    scene_id = str(uuid.uuid4())
    scene_obj = {
        "id": scene_id,
        "session_id": session_id,
        "scene_no": result.scene_no,
        "title": result.title,
        "participants": result.participants,
        "dialogue_log": result.dialogue_log,
        "action_log": result.action_log,
        "system_log": result.system_log,
        "predicted_effects": candidate_data["predicted_effects"],
        "state_delta": result.state_delta,
    }
    store.scenes[scene_id] = scene_obj
    session["scene_ids"].append(scene_id)
    session["stopped_reason"] = session["engine_state"].stop_reason or "user_decision_required"
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
        "engine_state": new_state,
    }
    store.sessions[new_session_id] = session
    store.projects[parent["project_id"]]["session_ids"].append(new_session_id)
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
