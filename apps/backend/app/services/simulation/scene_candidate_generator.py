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
        participant_names = [c.name for c in selected]

        scene_types = ["negotiation", "conflict", "discovery"]
        locations = ["해저 회담실", "부두 관측탑", "폐쇄된 기록 보관소"]

        candidates: list[SceneCandidate] = []
        for idx in range(3):
            scene_type = scene_types[idx]
            actor = selected[idx % len(selected)] if selected else None
            rival = selected[(idx + 1) % len(selected)] if len(selected) > 1 else actor
            actor_goal = actor.short_term_goal or actor.surface_goal if actor else "정보 우위를 확보한다"
            rival_goal = rival.short_term_goal or rival.surface_goal if rival else "상대의 계획을 무력화한다"
            conflict = {
                "actor": actor.name if actor else "unknown",
                "actor_goal": actor_goal,
                "rival": rival.name if rival else "unknown",
                "rival_goal": rival_goal,
                "conflict_axis": "정보 통제권 / 주도권",
            }
            candidates.append(
                SceneCandidate(
                    candidate_id=f"cand_{session.scene_no + 1}_{idx + 1}",
                    scene_type=scene_type,
                    title=f"{scene_type.title()} 장면 {idx + 1} · 목표 충돌",
                    participants=participant_ids,
                    location=self.provider.pick(locations, idx),
                    objective=f"{conflict['actor']}는 '{actor_goal}'를 밀어붙이고, {conflict['rival']}는 '{rival_goal}'를 저지한다.",
                    why_now=f"{conflict['actor']}의 단기 목표와 {conflict['rival']}의 목표가 같은 자원/비밀을 요구하여 지금 충돌이 불가피함",
                    predicted_effects={
                        "goal_progress": {
                            conflict["actor"]: self.provider.float(0.2, -0.1, idx),
                            conflict["rival"]: self.provider.float(0.05, -0.05, idx),
                        },
                        "relationship_shift": {
                            "trust_delta": self.provider.float(-0.12, 0.08, idx),
                            "betrayal_risk_delta": self.provider.float(0.08, 0.03, idx),
                        },
                        "secret_pressure": {
                            "exposure_risk": self.provider.float(0.2, 0.1, idx),
                            "who_might_leak": conflict["rival"],
                        },
                    },
                    risk_notes=[
                        "목표 충돌이 완화되지 않으면 다음 장면에서 배신 리스크가 상승함",
                        "숨겨진 목표 노출 시 관계도 재평가 필요",
                    ],
                    expected_stop_reason="user_decision_required",
                    goal_conflicts=[conflict],
                    active_motives=[
                        {
                            "character": c.name,
                            "surface_goal": c.surface_goal,
                            "hidden_goal": c.hidden_goal,
                            "short_term_goal": c.short_term_goal,
                        }
                        for c in selected
                    ],
                    scheme_opportunities=[
                        f"{conflict['actor']}가 협상으로 시간을 벌며 비밀을 은폐",
                        f"{conflict['rival']}가 유혹/압박으로 leverage를 시험",
                        f"{', '.join(participant_names) or '참여자'} 사이에서 거짓 동맹 형성 시도",
                    ],
                )
            )
        return candidates
