from __future__ import annotations


class DeterministicMockProvider:
    """Deterministic helper for repeatable tests and predictable MVP behavior."""

    def __init__(self, seed: int = 17) -> None:
        self.seed = seed

    def pick(self, values: list[str], offset: int = 0) -> str:
        if not values:
            return "unknown"
        idx = (self.seed + offset) % len(values)
        return values[idx]

    def float(self, base: float, step: float, offset: int = 0) -> float:
        return round(base + (offset * step), 2)
