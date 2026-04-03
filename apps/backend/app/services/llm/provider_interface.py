from __future__ import annotations

from abc import ABC, abstractmethod

from app.services.llm.types import SceneContext, SceneExecutionContext, SceneResultSummaryContext


class LLMProvider(ABC):
    @abstractmethod
    def generate_scene_candidates(self, context: SceneContext) -> dict:
        """Return structured JSON candidates (3 items expected)."""

    @abstractmethod
    def generate_scene_messages(self, context: SceneExecutionContext) -> dict:
        """Return structured JSON message/action/system logs."""

    @abstractmethod
    def summarize_scene_result(self, context: SceneResultSummaryContext) -> dict:
        """Return compact structured JSON summary and next decisions."""
