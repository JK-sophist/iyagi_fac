from __future__ import annotations

from app.services.simulation.types import SceneResult, SessionState


class StopConditionEvaluator:
    def evaluate(self, session: SessionState, result: SceneResult) -> str:
        risk = result.state_delta["risk"]

        if risk["repetition_risk"] >= 0.7:
            return "repetition_risk_high"

        if risk["consistency_risk"] >= 0.7:
            return "consistency_risk_high"

        important_change = any(item["tension"] >= 0.6 for item in result.state_delta["relationship_updates"])
        if important_change:
            return "important_relationship_shift"

        if session.scene_no >= session.recommended_scene_limit:
            return "recommended_scene_limit_reached"

        collapse_risk = any(c.emotion == "collapsed" for c in session.characters)
        if collapse_risk:
            return "character_collapse_risk"

        return "user_decision_required"
