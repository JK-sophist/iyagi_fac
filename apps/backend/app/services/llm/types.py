from __future__ import annotations

from dataclasses import dataclass


@dataclass
class LLMRuntimeOptions:
    timeout_seconds: int = 12
    retry_count: int = 2
    max_output_tokens: int = 700


@dataclass
class SceneContext:
    project_title: str
    world_summary: str
    past_log_summary: str
    active_characters: list[dict]
    inactive_character_summary: str
    relationship_summary: str
    objective: str


@dataclass
class SceneExecutionContext:
    selected_candidate: dict
    state_snapshot_summary: str
    active_characters: list[dict]
    inactive_character_summary: str


@dataclass
class SceneResultSummaryContext:
    scene_result: dict
    delta_summary: str
