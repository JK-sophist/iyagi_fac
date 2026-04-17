from __future__ import annotations

from app.services.llm.provider_interface import LLMProvider
from app.services.llm.types import SceneContext, SceneExecutionContext, SceneResultSummaryContext


class MockLLMProvider(LLMProvider):
    def generate_scene_candidates(self, context: SceneContext) -> dict:
        participants = [c["id"] for c in context.active_characters][:4]
        return {
            "candidates": [
                {
                    "scene_type": "negotiation",
                    "title": "긴급 교섭 제안",
                    "participants": participants,
                    "location": "중립 정박지",
                    "objective": context.objective,
                    "why_now": "긴장 지표 상승",
                    "predicted_effects": {"trust": +0.1, "tension": -0.1},
                    "risk_notes": ["합의 실패 가능성"],
                    "expected_stop_reason": "user_decision_required",
                },
                {
                    "scene_type": "conflict",
                    "title": "정보 충돌",
                    "participants": participants,
                    "location": "관측탑",
                    "objective": "상충 증거 검증",
                    "why_now": "상반된 진술 발생",
                    "predicted_effects": {"trust": -0.1, "tension": +0.2},
                    "risk_notes": ["반복 갈등 위험"],
                    "expected_stop_reason": "important_relationship_shift",
                },
                {
                    "scene_type": "discovery",
                    "title": "숨겨진 기록 발견",
                    "participants": participants,
                    "location": "기록 보관소",
                    "objective": "누락된 사실 확인",
                    "why_now": "증거 경로 확보",
                    "predicted_effects": {"trust": +0.05, "novelty": +0.2},
                    "risk_notes": ["일관성 재검증 필요"],
                    "expected_stop_reason": "user_decision_required",
                },
            ]
        }

    def generate_scene_messages(self, context: SceneExecutionContext) -> dict:
        participants = context.selected_candidate.get("participants", [])
        p1 = participants[0] if participants else "char_a"
        p2 = participants[-1] if participants else "char_b"
        return {
            "dialogue_log": [f"{p1}: 지금 결정을 미루면 비용이 커진다.", f"{p2}: 근거를 먼저 확인하자."],
            "action_log": ["핵심 문서 대조", "관계 변화 점검"],
            "system_log": ["auto_progression=false", "structured_output=true"],
        }

    def summarize_scene_result(self, context: SceneResultSummaryContext) -> dict:
        return {
            "summary": "장면 실행 완료. 주요 관계 변화가 감지됨.",
            "state_changes": context.delta_summary,
            "decision_points": ["채택", "재생성", "체크포인트 저장", "분기 생성"],
            "recommended_stop_reason": "user_decision_required",
        }
