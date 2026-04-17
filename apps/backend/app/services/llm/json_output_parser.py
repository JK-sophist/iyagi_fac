from __future__ import annotations

import json


class JSONOutputParser:
    @staticmethod
    def parse_or_raise(raw: str) -> dict:
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ValueError("Provider returned non-JSON output") from exc

        if not isinstance(data, dict):
            raise ValueError("Provider JSON root must be an object")
        return data
