from app.services.llm.mock_provider import MockLLMProvider
from app.services.llm.types import SceneContext, SceneExecutionContext, SceneResultSummaryContext


def sample_context() -> SceneContext:
    return SceneContext(
        project_title="검은 항구",
        world_summary="요약",
        past_log_summary="요약",
        active_characters=[{"id": "c1", "name": "리아"}, {"id": "c2", "name": "도윤"}],
        inactive_character_summary="2명 비활성",
        relationship_summary="긴장 상승",
        objective="갈등 통제",
    )


def test_generate_scene_candidates_returns_three_items() -> None:
    provider = MockLLMProvider()
    data = provider.generate_scene_candidates(sample_context())
    assert len(data["candidates"]) == 3


def test_generate_scene_messages_and_summary_are_structured() -> None:
    provider = MockLLMProvider()

    msg = provider.generate_scene_messages(
        SceneExecutionContext(
            selected_candidate={"participants": ["c1", "c2"]},
            state_snapshot_summary="s",
            active_characters=[{"id": "c1"}, {"id": "c2"}],
            inactive_character_summary="none",
        )
    )
    summary = provider.summarize_scene_result(
        SceneResultSummaryContext(scene_result={"id": 1}, delta_summary="trust +0.1")
    )

    assert "dialogue_log" in msg and "system_log" in msg
    assert summary["recommended_stop_reason"] == "user_decision_required"
