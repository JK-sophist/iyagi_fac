from __future__ import annotations

from app.services.simulation.scene_candidate_generator import SceneCandidateGenerator
from app.services.simulation.scene_executor import SceneExecutor
from app.services.simulation.stop_condition_evaluator import StopConditionEvaluator
from app.services.simulation.types import SceneCandidate, SceneExecutionInput, SceneResult, SessionState


class SessionFlowOrchestrator:
    """No auto-loop. Candidate generation and execution are intentionally separate calls."""

    def __init__(
        self,
        generator: SceneCandidateGenerator,
        executor: SceneExecutor,
        stop_evaluator: StopConditionEvaluator,
    ) -> None:
        self.generator = generator
        self.executor = executor
        self.stop_evaluator = stop_evaluator

    def suggest_candidates(self, session: SessionState) -> list[SceneCandidate]:
        return self.generator.generate(session)

    def execute_selected_candidate(self, session: SessionState, candidate: SceneCandidate) -> SceneResult:
        result = self.executor.execute(
            session,
            SceneExecutionInput(session_id=session.session_id, candidate=candidate),
        )
        stop_reason = self.stop_evaluator.evaluate(session, result)
        session.stop_reason = stop_reason

        if stop_reason in {
            "important_relationship_shift",
            "recommended_scene_limit_reached",
            "repetition_risk_high",
            "consistency_risk_high",
            "character_collapse_risk",
            "user_decision_required",
        }:
            session.checkpoints.append(
                {
                    "scene_no": session.scene_no,
                    "stop_reason": stop_reason,
                    "snapshot": {
                        "flags": dict(session.flags),
                        "narrative_scores": dict(session.narrative_scores),
                    },
                }
            )

        return result
