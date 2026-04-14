from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.config import settings
from app.services.simulation.mock_provider import DeterministicMockProvider
from app.services.simulation.participant_selector import ParticipantSelector
from app.services.simulation.types import CharacterState, SceneCandidate, SessionState

logger = logging.getLogger(__name__)


class SceneCandidateGenerator:
    def __init__(self, provider: DeterministicMockProvider, participant_selector: ParticipantSelector) -> None:
        self.provider = provider
        self.participant_selector = participant_selector
        self.last_source = "mock"
        self.last_error: str | None = None

    def generate(self, session: SessionState) -> list[SceneCandidate]:
        selected = self.participant_selector.select(session.characters, session.relationships)
        self.last_source = "mock"
        self.last_error = None
        if settings.openai_api_key_simulation:
            try:
                generated = self._generate_with_openai(session, selected)
                if generated:
                    self.last_source = "openai"
                    logger.info("Scene candidates generated with OpenAI for session=%s", session.session_id)
                    return generated
                self.last_error = "OpenAI returned empty candidate list"
                logger.warning("OpenAI candidate generation returned empty candidates for session=%s", session.session_id)
            except Exception as exc:
                self.last_error = str(exc)
                logger.exception("OpenAI candidate generation failed for session=%s: %s", session.session_id, exc)
                if getattr(settings, "require_openai_candidates", False):
                    raise
        logger.warning("Using mock fallback for session=%s reason=%s", session.session_id, self.last_error or "openai_disabled")
        return self._generate_with_mock(session, selected)

    def _generate_with_mock(self, session: SessionState, selected: list[CharacterState]) -> list[SceneCandidate]:
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

    def _generate_with_openai(self, session: SessionState, selected: list[CharacterState]) -> list[SceneCandidate]:
        participant_ids = [c.id for c in selected]
        prompt = self._build_prompt(session, selected)
        payload: dict[str, Any] = {
            "model": settings.openai_model_scene_candidate,
            "temperature": 0.9,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "너는 소설 작가를 돕는 서사 후보 생성기다. 반드시 JSON만 출력한다. "
                        "후보는 3개이며 서로 다른 갈등 축을 가져야 한다. 각 후보는 scene_type, title, location, objective, why_now, "
                        "goal_conflicts, active_motives, scheme_opportunities, predicted_effects, risk_notes 를 포함한다."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "response_format": {"type": "json_object"},
        }
        headers = {
            "Authorization": f"Bearer {settings.openai_api_key_simulation}",
            "Content-Type": "application/json",
        }
        if settings.openai_project_id_simulation:
            headers["OpenAI-Project"] = settings.openai_project_id_simulation

        with httpx.Client(timeout=settings.llm_timeout_seconds) as client:
            response = client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

        content = data["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        raw_candidates = parsed.get("candidates") if isinstance(parsed, dict) else None
        if not isinstance(raw_candidates, list) or not raw_candidates:
            return []

        normalized: list[SceneCandidate] = []
        for idx, item in enumerate(raw_candidates[:3]):
            if not isinstance(item, dict):
                continue
            scene_type = str(item.get("scene_type") or ["negotiation", "conflict", "discovery"][idx % 3])
            title = str(item.get("title") or f"후보 장면 {idx + 1}")
            location = str(item.get("location") or "불명")
            objective = str(item.get("objective") or "목표 충돌이 드러나는 장면")
            why_now = str(item.get("why_now") or "현재 목표와 관계 압력이 겹쳐 지금 충돌이 필요함")
            goal_conflicts = item.get("goal_conflicts") if isinstance(item.get("goal_conflicts"), list) else []
            active_motives = item.get("active_motives") if isinstance(item.get("active_motives"), list) else [
                {
                    "character": c.name,
                    "surface_goal": c.surface_goal,
                    "hidden_goal": c.hidden_goal,
                    "short_term_goal": c.short_term_goal,
                }
                for c in selected
            ]
            scheme_opportunities = item.get("scheme_opportunities") if isinstance(item.get("scheme_opportunities"), list) else []
            predicted_effects = item.get("predicted_effects") if isinstance(item.get("predicted_effects"), dict) else {}
            risk_notes = item.get("risk_notes") if isinstance(item.get("risk_notes"), list) else ["후속 장면 전 관계 변화 재평가 필요"]
            expected_stop_reason = str(item.get("expected_stop_reason") or "user_decision_required")

            normalized.append(
                SceneCandidate(
                    candidate_id=f"cand_{session.scene_no + 1}_{idx + 1}",
                    scene_type=scene_type,
                    title=title,
                    participants=participant_ids,
                    location=location,
                    objective=objective,
                    why_now=why_now,
                    predicted_effects=predicted_effects,
                    risk_notes=[str(x) for x in risk_notes],
                    expected_stop_reason=expected_stop_reason,
                    goal_conflicts=[x for x in goal_conflicts if isinstance(x, dict)],
                    active_motives=[x for x in active_motives if isinstance(x, dict)],
                    scheme_opportunities=[str(x) for x in scheme_opportunities],
                )
            )
        return normalized

    def _build_prompt(self, session: SessionState, selected: list[CharacterState]) -> str:
        relationship_lines = []
        for rel in session.relationships[:12]:
            a = next((c.name for c in session.characters if c.id == rel.from_character_id), rel.from_character_id)
            b = next((c.name for c in session.characters if c.id == rel.to_character_id), rel.to_character_id)
            relationship_lines.append(
                f"- {a} -> {b}: trust={rel.trust}, tension={rel.tension}, hostility={rel.hostility}, dependency={rel.dependency}, betrayal_risk={rel.betrayal_risk}, shared_secret={rel.shared_secret or '-'}"
            )

        character_lines = []
        for c in selected:
            character_lines.append(
                f"- {c.name}: surface_goal={c.surface_goal or '-'}, hidden_goal={c.hidden_goal or '-'}, short_term_goal={c.short_term_goal or '-'}, long_term_goal={c.long_term_goal or '-'}, fear_or_taboo={c.fear_or_taboo or '-'}, leverage={c.leverage or '-'}, secret={c.secret or '-'}"
            )

        return (
            f"session_id={session.session_id}\n"
            f"scene_no={session.scene_no}\n"
            "selected_characters:\n"
            + "\n".join(character_lines)
            + "\nrelationships:\n"
            + ("\n".join(relationship_lines) if relationship_lines else "- 관계 정보 없음")
            + "\nrequirements:\n"
            + "- 후보는 정확히 3개\n"
            + "- 서로 다른 갈등축을 가져야 함\n"
            + "- negotiation, conflict, discovery 중 장면 유형 분산\n"
            + "- 목표 충돌과 계략 가능성이 분명해야 함\n"
            + "- predicted_effects는 relationship_shift, secret_pressure를 포함하도록 노력\n"
        )
