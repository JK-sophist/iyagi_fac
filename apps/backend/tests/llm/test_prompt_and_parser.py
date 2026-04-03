from app.services.llm.json_output_parser import JSONOutputParser
from app.services.llm.prompt_builder import PromptBuilder
from app.services.llm.types import SceneContext, SceneExecutionContext, SceneResultSummaryContext


def test_prompt_builder_includes_required_scene_candidate_fields() -> None:
    context = SceneContext(
        project_title="p",
        world_summary="w",
        past_log_summary="h",
        active_characters=[{"id": "c1", "name": "n1"}, {"id": "c2", "name": "n2"}],
        inactive_character_summary="others",
        relationship_summary="rel",
        objective="obj",
    )

    prompt = PromptBuilder.build_scene_candidates_prompt(context)

    assert "scene_type" in prompt
    assert "active_characters" in prompt
    assert "No long prose" in prompt


def test_json_parser_validates_object_root() -> None:
    parsed = JSONOutputParser.parse_or_raise('{"ok":true}')
    assert parsed["ok"] is True
