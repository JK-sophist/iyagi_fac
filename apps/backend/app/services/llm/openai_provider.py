from __future__ import annotations

from app.config import settings
from app.services.llm.guard import LLMGuard
from app.services.llm.json_output_parser import JSONOutputParser
from app.services.llm.prompt_builder import PromptBuilder
from app.services.llm.provider_interface import LLMProvider
from app.services.llm.types import LLMRuntimeOptions, SceneContext, SceneExecutionContext, SceneResultSummaryContext


class OpenAIProviderPlaceholder(LLMProvider):
    """
    Placeholder provider.
    Real HTTP calls are intentionally not wired yet.
    API keys remain backend-only via settings.
    """

    def __init__(self) -> None:
        self.options = LLMRuntimeOptions(
            timeout_seconds=settings.llm_timeout_seconds,
            retry_count=settings.llm_retry_count,
            max_output_tokens=settings.llm_max_output_tokens,
        )

    def generate_scene_candidates(self, context: SceneContext) -> dict:
        prompt = PromptBuilder.build_scene_candidates_prompt(context)
        raw = LLMGuard.run_with_retry_timeout(lambda: self._simulate_structured_response(prompt, "candidates"), self.options)
        parsed = JSONOutputParser.parse_or_raise(raw["text"])
        return LLMGuard.clip_output(parsed, self.options.max_output_tokens)

    def generate_scene_messages(self, context: SceneExecutionContext) -> dict:
        prompt = PromptBuilder.build_scene_messages_prompt(context)
        raw = LLMGuard.run_with_retry_timeout(lambda: self._simulate_structured_response(prompt, "messages"), self.options)
        parsed = JSONOutputParser.parse_or_raise(raw["text"])
        return LLMGuard.clip_output(parsed, self.options.max_output_tokens)

    def summarize_scene_result(self, context: SceneResultSummaryContext) -> dict:
        prompt = PromptBuilder.build_scene_summary_prompt(context)
        raw = LLMGuard.run_with_retry_timeout(lambda: self._simulate_structured_response(prompt, "summary"), self.options)
        parsed = JSONOutputParser.parse_or_raise(raw["text"])
        return LLMGuard.clip_output(parsed, self.options.max_output_tokens)

    @staticmethod
    def _simulate_structured_response(prompt: str, mode: str) -> dict:
        if mode == "candidates":
            text = '{"candidates":[]}'
        elif mode == "messages":
            text = '{"dialogue_log":[],"action_log":[],"system_log":["auto_progression=false"]}'
        else:
            text = '{"summary":"ok","state_changes":{},"decision_points":[],"recommended_stop_reason":"user_decision_required"}'
        return {"text": text, "prompt_preview": prompt[:120]}
