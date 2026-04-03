from __future__ import annotations

import json

from app.services.llm.types import SceneContext, SceneExecutionContext, SceneResultSummaryContext


class PromptBuilder:
    @staticmethod
    def build_scene_candidates_prompt(context: SceneContext) -> str:
        payload = {
            "task": "Generate exactly 3 compact scene candidates in JSON.",
            "constraints": [
                "No long prose",
                "Focus on structured fields",
                "Use active_characters in detail",
                "Other characters/world/history only as short summaries",
            ],
            "required_fields": [
                "scene_type",
                "title",
                "participants",
                "location",
                "objective",
                "why_now",
                "predicted_effects",
                "risk_notes",
                "expected_stop_reason",
            ],
            "input": {
                "project_title": context.project_title,
                "objective": context.objective,
                "world_summary": context.world_summary,
                "past_log_summary": context.past_log_summary,
                "active_characters": context.active_characters,
                "inactive_character_summary": context.inactive_character_summary,
                "relationship_summary": context.relationship_summary,
            },
        }
        return json.dumps(payload, ensure_ascii=False)

    @staticmethod
    def build_scene_messages_prompt(context: SceneExecutionContext) -> str:
        payload = {
            "task": "Generate compact scene messages/actions/systems logs in JSON.",
            "constraints": ["No long prose", "Keep each log line short", "JSON only"],
            "required_fields": ["dialogue_log", "action_log", "system_log"],
            "input": {
                "selected_candidate": context.selected_candidate,
                "state_snapshot_summary": context.state_snapshot_summary,
                "active_characters": context.active_characters,
                "inactive_character_summary": context.inactive_character_summary,
            },
        }
        return json.dumps(payload, ensure_ascii=False)

    @staticmethod
    def build_scene_summary_prompt(context: SceneResultSummaryContext) -> str:
        payload = {
            "task": "Summarize scene result into compact JSON.",
            "constraints": ["No prose paragraph", "JSON only", "Include next decision points"],
            "required_fields": ["summary", "state_changes", "decision_points", "recommended_stop_reason"],
            "input": {
                "scene_result": context.scene_result,
                "delta_summary": context.delta_summary,
            },
        }
        return json.dumps(payload, ensure_ascii=False)
