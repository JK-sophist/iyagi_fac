from __future__ import annotations

import time
from collections.abc import Callable

from app.services.llm.types import LLMRuntimeOptions


class LLMGuard:
    @staticmethod
    def run_with_retry_timeout(fn: Callable[[], dict], options: LLMRuntimeOptions) -> dict:
        last_error: Exception | None = None
        start = time.time()

        for _ in range(options.retry_count + 1):
            if time.time() - start > options.timeout_seconds:
                raise TimeoutError("LLM timeout exceeded")
            try:
                return fn()
            except Exception as exc:  # noqa: BLE001
                last_error = exc

        if last_error:
            raise last_error
        raise RuntimeError("LLM execution failed without error details")

    @staticmethod
    def clip_output(payload: dict, max_output_tokens: int) -> dict:
        """Approximate token guard with JSON string length budget."""
        text = str(payload)
        max_chars = max_output_tokens * 4
        if len(text) <= max_chars:
            return payload
        return {
            "truncated": True,
            "raw_preview": text[:max_chars],
        }
