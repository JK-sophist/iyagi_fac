from __future__ import annotations

from app.services.simulation.types import CharacterState, RelationshipState


class ParticipantSelector:
    def select(
        self,
        characters: list[CharacterState],
        relationships: list[RelationshipState],
        max_count: int = 4,
    ) -> list[CharacterState]:
        active = [c for c in characters if not c.is_archived]

        introduced = [c for c in active if c.is_introduced]
        not_introduced = [c for c in active if not c.is_introduced]

        ranked = sorted(
            introduced,
            key=lambda c: self._character_pressure(c.id, relationships),
            reverse=True,
        )

        selected = ranked[: max(2, min(max_count, len(ranked)))]

        if len(selected) < 2 and not_introduced:
            selected.append(not_introduced[0])

        if len(selected) < 2 and active:
            selected = active[:2]

        if len(selected) > 4:
            selected = selected[:4]

        return selected

    @staticmethod
    def _character_pressure(character_id: str, relationships: list[RelationshipState]) -> float:
        related = [r for r in relationships if r.from_character_id == character_id or r.to_character_id == character_id]
        return sum(abs(r.tension) + (1 - r.trust) for r in related)
