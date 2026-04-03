from __future__ import annotations

from app.services.simulation.types import SceneCandidate, SessionState


class RuleEngine:
    def apply(self, session: SessionState, candidate: SceneCandidate) -> dict:
        participants = {pid for pid in candidate.participants}

        relationship_updates = []
        for rel in session.relationships:
            if rel.from_character_id in participants and rel.to_character_id in participants:
                rel.tension = round(rel.tension + 0.2, 2)
                rel.trust = round(max(0.0, min(1.0, rel.trust + candidate.predicted_effects["relationship"]["trust_delta"])), 2)
                relationship_updates.append({
                    "pair": [rel.from_character_id, rel.to_character_id],
                    "trust": rel.trust,
                    "tension": rel.tension,
                })

        emotion_updates = []
        for char in session.characters:
            if char.id in participants and not char.is_archived:
                char.emotion = candidate.predicted_effects["emotion"]["shift"]
                if not char.is_introduced:
                    char.is_introduced = True
                emotion_updates.append({"character_id": char.id, "emotion": char.emotion, "introduced": char.is_introduced})

        session.flags.update(candidate.predicted_effects["flags"])

        repetition_risk = round(min(1.0, session.narrative_scores["repetition_risk"] + 0.1), 2)
        consistency_risk = round(min(1.0, session.narrative_scores["consistency_risk"] + 0.05), 2)
        session.narrative_scores["repetition_risk"] = repetition_risk
        session.narrative_scores["consistency_risk"] = consistency_risk

        return {
            "relationship_updates": relationship_updates,
            "emotion_updates": emotion_updates,
            "flags": candidate.predicted_effects["flags"],
            "risk": {
                "repetition_risk": repetition_risk,
                "consistency_risk": consistency_risk,
            },
        }
