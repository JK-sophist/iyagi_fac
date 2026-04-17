from app.db import Base


def test_required_tables_exist() -> None:
    tables = set(Base.metadata.tables.keys())
    required = {
        "story_projects",
        "story_sessions",
        "world_settings",
        "ending_goals",
        "characters",
        "character_versions",
        "character_knowledge",
        "character_secrets",
        "relationships",
        "scenes",
        "scene_events",
        "scene_messages",
        "narrative_scores",
        "story_checkpoints",
        "simulation_runs",
    }
    assert required.issubset(tables)
