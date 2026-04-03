from __future__ import annotations

from app.services.simulation.rule_engine import RuleEngine
from app.services.simulation.types import SceneExecutionInput, SceneResult, SessionState


class SceneExecutor:
    def __init__(self, rule_engine: RuleEngine) -> None:
        self.rule_engine = rule_engine

    def execute(self, session: SessionState, execution_input: SceneExecutionInput) -> SceneResult:
        candidate = execution_input.candidate

        state_delta = self.rule_engine.apply(session, candidate)
        session.scene_no += 1

        dialogue_log = [
            f"{candidate.participants[0]}: 지금 결정을 미루면 손실이 커져.",
            f"{candidate.participants[-1]}: 동의하지만 대가를 계산해야 해.",
        ]
        action_log = [
            f"location={candidate.location} 이동",
            "핵심 자료 검증",
        ]
        system_log = [
            f"scene_type={candidate.scene_type}",
            "state_delta_applied=true",
            "auto_progression=false",
        ]

        return SceneResult(
            session_id=session.session_id,
            scene_no=session.scene_no,
            title=candidate.title,
            participants=candidate.participants,
            dialogue_log=dialogue_log,
            action_log=action_log,
            system_log=system_log,
            state_delta=state_delta,
        )
