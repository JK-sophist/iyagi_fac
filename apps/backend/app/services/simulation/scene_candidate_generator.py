from __future__ import annotations

from app.services.simulation.mock_provider import DeterministicMockProvider
from app.services.simulation.participant_selector import ParticipantSelector
from app.services.simulation.types import SceneCandidate, SessionState


class SceneCandidateGenerator:
    def __init__(self, provider: DeterministicMockProvider, participant_selector: ParticipantSelector) -> None:
        self.provider = provider
        self.participant_selector = participant_selector

    def generate(self, session: SessionState) -> list[SceneCandidate]:
        selected = self.participant_selector.select(session.characters, session.relationships)
        participant_ids = [c.id for c in selected]

        scene_types = ["negotiation", "conflict", "discovery"]
        locations = ["해저 회담실", "부두 관측탑", "폐쇄된 기록 보관소"]

        candidates: list[SceneCandidate] = []
        for idx in range(3):
            scene_type = scene_types[idx]
            candidates.append(
                SceneCandidate(
                    candidate_id=f"cand_{session.scene_no + 1}_{idx + 1}",
                    scene_type=scene_type,
                    title=f"{scene_type.title()} 장면 {idx + 1}",
                    participants=participant_ids,
                    location=self.provider.pick(locations, idx),
                    objective="갈등을 통제하면서 정보를 확보한다",
                    why_now=f"scene_no={session.scene_no} 이후 긴장/정보 수요가 임계치에 도달함",
                    predicted_effects={
                        "relationship": {"trust_delta": self.provider.float(-0.1, 0.15, idx)},
                        "emotion": {"shift": ["tense", "focused", "uncertain"][idx]},
                        "flags": {f"candidate_{idx + 1}_executed": True},
                    },
                    risk_notes=[
                        "반복 패턴 위험",
                        "캐릭터 동기 일관성 점검 필요",
                    ],
                    expected_stop_reason="user_decision_required",
                )
            )
        return candidates
