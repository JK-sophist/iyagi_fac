from __future__ import annotations

from app.services.llm.provider_interface import LLMProvider


class FallbackProviderStrategy:
    """Design placeholder: primary -> secondary provider routing."""

    def __init__(self, primary: LLMProvider, secondary: LLMProvider) -> None:
        self.primary = primary
        self.secondary = secondary

    # NOTE: call routing will be added when real OpenAI HTTP provider is connected.
