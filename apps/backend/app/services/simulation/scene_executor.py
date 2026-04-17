from __future__ import annotations

from app.services.simulation.rule_engine import RuleEngine
from app.services.simulation.types import SceneExecutionInput, SceneResult, SessionState


class SceneExecutor:
    def __init__(self, rule_engine: RuleEngine) -> None:
        self.rule_engine = rule_engine

    def execute(self, session: SessionState, execution_input: SceneExecutionInput) -> SceneResult:
        candidate = execution_input.candidate
        participant_names = self._participant_names(session, candidate.participants)

        state_delta = self.rule_engine.apply(session, candidate)
        session.scene_no += 1

        speaker_a = participant_names[0] if participant_names else "누군가"
        speaker_b = participant_names[-1] if participant_names else speaker_a

        dialogue_log = [
            f"{speaker_a}: 지금 결정을 미루면 손실이 커져.",
            f"{speaker_b}: 동의하지만 대가를 계산해야 해.",
        ]
        action_log = [
            f"{candidate.location}로 이동해 상황을 확인함",
            "핵심 자료와 관계 변화를 점검함",
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

    @staticmethod
    def _participant_names(session: SessionState, participant_ids: list[str]) -> list[str]:
        name_map = {char.id: char.name for char in session.characters}
        return [name_map.get(pid, pid) for pid in participant_ids]
