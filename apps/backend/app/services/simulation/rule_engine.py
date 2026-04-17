from __future__ import annotations

from app.services.simulation.types import SceneCandidate, SessionState


class RuleEngine:
    def apply(self, session: SessionState, candidate: SceneCandidate) -> dict:
        participants = {pid for pid in candidate.participants}
        predicted_effects = candidate.predicted_effects or {}
        relationship_effects = predicted_effects.get("relationship_shift") or predicted_effects.get("relationship") or {}
        emotion_effects = predicted_effects.get("emotion") or {}
        flags = predicted_effects.get("flags") or {}

        trust_delta = float(relationship_effects.get("trust_delta", 0.0))
        betrayal_risk_delta = float(relationship_effects.get("betrayal_risk_delta", 0.0))

        relationship_updates = []
        for rel in session.relationships:
            if rel.from_character_id in participants and rel.to_character_id in participants:
                rel.tension = round(min(1.0, rel.tension + 0.2), 2)
                rel.trust = round(max(0.0, min(1.0, rel.trust + trust_delta)), 2)
                if hasattr(rel, "betrayal_risk"):
                    rel.betrayal_risk = round(max(0.0, min(1.0, rel.betrayal_risk + betrayal_risk_delta)), 2)
                relationship_updates.append(
                    {
                        "pair": [rel.from_character_id, rel.to_character_id],
                        "trust": rel.trust,
                        "tension": rel.tension,
                        "betrayal_risk": getattr(rel, "betrayal_risk", None),
                    }
                )

        emotion_updates = []
        next_emotion = emotion_effects.get("shift")
        for char in session.characters:
            if char.id in participants and not char.is_archived:
                if next_emotion:
                    char.emotion = next_emotion
                if not char.is_introduced:
                    char.is_introduced = True
                emotion_updates.append(
                    {"character_id": char.id, "emotion": char.emotion, "introduced": char.is_introduced}
                )

        if flags:
            session.flags.update(flags)

        repetition_risk = round(min(1.0, session.narrative_scores["repetition_risk"] + 0.1), 2)
        consistency_risk = round(min(1.0, session.narrative_scores["consistency_risk"] + 0.05), 2)
        session.narrative_scores["repetition_risk"] = repetition_risk
        session.narrative_scores["consistency_risk"] = consistency_risk

        return {
            "relationship_updates": relationship_updates,
            "emotion_updates": emotion_updates,
            "flags": flags,
            "risk": {
                "repetition_risk": repetition_risk,
                "consistency_risk": consistency_risk,
            },
        }
