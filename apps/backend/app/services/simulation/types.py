from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

SceneType = Literal["conflict", "discovery", "negotiation", "recovery", "reveal"]


@dataclass
class CharacterState:
    id: str
    name: str
    is_introduced: bool
    is_archived: bool = False
    emotion: str = "neutral"
    surface_goal: str = ""
    hidden_goal: str = ""
    short_term_goal: str = ""
    long_term_goal: str = ""
    fear_or_taboo: str = ""
    leverage: str = ""
    secret: str = ""
    speaking_style_note: str = ""
    writer_note: str = ""


@dataclass
class RelationshipState:
    from_character_id: str
    to_character_id: str
    trust: float = 0.0
    tension: float = 0.0
    hostility: float = 0.0
    dependency: float = 0.0
    utility_value: float = 0.0
    surveillance_level: float = 0.0
    betrayal_risk: float = 0.0
    shared_secret: str = ""


@dataclass
class SceneCandidate:
    candidate_id: str
    scene_type: SceneType
    title: str
    participants: list[str]
    location: str
    objective: str
    why_now: str
    predicted_effects: dict
    risk_notes: list[str]
    expected_stop_reason: str
    goal_conflicts: list[dict] = field(default_factory=list)
    active_motives: list[dict] = field(default_factory=list)
    scheme_opportunities: list[str] = field(default_factory=list)


@dataclass
class SceneExecutionInput:
    session_id: str
    candidate: SceneCandidate


@dataclass
class SceneResult:
    session_id: str
    scene_no: int
    title: str
    participants: list[str]
    dialogue_log: list[str]
    action_log: list[str]
    system_log: list[str]
    state_delta: dict


@dataclass
class SessionState:
    session_id: str
    project_id: str
    scene_no: int = 0
    recommended_scene_limit: int = 8
    flags: dict[str, bool] = field(default_factory=dict)
    narrative_scores: dict[str, float] = field(
        default_factory=lambda: {
            "tension": 0.0,
            "coherence": 0.0,
            "pacing": 0.0,
            "novelty": 0.0,
            "repetition_risk": 0.0,
            "consistency_risk": 0.0,
        }
    )
    characters: list[CharacterState] = field(default_factory=list)
    relationships: list[RelationshipState] = field(default_factory=list)
    checkpoints: list[dict] = field(default_factory=list)
    stop_reason: str | None = None
