"""initial story schema

Revision ID: 0001_initial_story_schema
Revises: None
Create Date: 2026-04-02
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial_story_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    jsonb = postgresql.JSONB(astext_type=sa.Text())

    op.create_table(
        "story_projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("metadata_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "story_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("parent_session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("story_sessions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("base_checkpoint_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("branch_label", sa.String(length=100), nullable=True),
        sa.Column("stopped_reason", sa.String(length=100), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="awaiting_suggestions"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_story_sessions_project_id", "story_sessions", ["project_id"])

    op.create_table(
        "world_settings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version_no", sa.Integer(), nullable=False),
        sa.Column("supersedes_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("world_settings.id", ondelete="SET NULL"), nullable=True),
        sa.Column("effective_from_scene_no", sa.Integer(), nullable=True),
        sa.Column("rules_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("project_id", "version_no", name="uq_world_settings_project_version"),
    )

    op.create_table(
        "ending_goals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version_no", sa.Integer(), nullable=False),
        sa.Column("supersedes_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("ending_goals.id", ondelete="SET NULL"), nullable=True),
        sa.Column("effective_from_scene_no", sa.Integer(), nullable=True),
        sa.Column("goal_text", sa.Text(), nullable=False),
        sa.Column("goal_detail_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("project_id", "version_no", name="uq_ending_goals_project_version"),
    )

    op.create_table(
        "characters",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("archetype", sa.String(length=80), nullable=True),
        sa.Column("profile_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("is_introduced", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("first_scene_no", sa.Integer(), nullable=True),
        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("effective_from_scene_no", sa.Integer(), nullable=True),
        sa.Column("deleted_at_scene_no", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("first_scene_no IS NULL OR first_scene_no >= 1", name="ck_characters_first_scene_no"),
        sa.UniqueConstraint("project_id", "name", name="uq_characters_project_name"),
    )
    op.create_index("ix_characters_project_id", "characters", ["project_id"])

    op.create_table(
        "character_versions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("character_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("characters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version_no", sa.Integer(), nullable=False),
        sa.Column("effective_from_scene_no", sa.Integer(), nullable=True),
        sa.Column("personality_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("attributes_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("character_id", "version_no", name="uq_character_versions_char_version"),
    )

    op.create_table(
        "character_knowledge",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("character_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("characters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("key", sa.String(length=120), nullable=False),
        sa.Column("content_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("discovered_scene_no", sa.Integer(), nullable=True),
    )

    op.create_table(
        "character_secrets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("character_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("characters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("secret_title", sa.String(length=150), nullable=False),
        sa.Column("secret_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("revealed_scene_no", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )

    op.create_table(
        "relationships",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("from_character_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("characters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("to_character_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("characters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("trust", sa.Float(), nullable=False, server_default="0"),
        sa.Column("affection", sa.Float(), nullable=False, server_default="0"),
        sa.Column("hostility", sa.Float(), nullable=False, server_default="0"),
        sa.Column("dependency", sa.Float(), nullable=False, server_default="0"),
        sa.Column("tension", sa.Float(), nullable=False, server_default="0"),
        sa.Column("tags_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("project_id", "from_character_id", "to_character_id", name="uq_relationship_pair"),
    )

    op.create_table(
        "scenes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("story_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("scene_no", sa.Integer(), nullable=False),
        sa.Column("candidate_index", sa.Integer(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("immutable_locked", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("state_delta_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("scene_no >= 1", name="ck_scene_no_positive"),
        sa.UniqueConstraint("session_id", "scene_no", name="uq_scenes_session_scene_no"),
    )
    op.create_index("ix_scenes_project_session", "scenes", ["project_id", "session_id"])

    op.create_table(
        "scene_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("scene_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("scenes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_type", sa.String(length=80), nullable=False),
        sa.Column("payload_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("order_no", sa.Integer(), nullable=False, server_default="1"),
    )

    op.create_table(
        "scene_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("scene_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("scenes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("speaker_character_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("characters.id", ondelete="SET NULL"), nullable=True),
        sa.Column("message_text", sa.Text(), nullable=False),
        sa.Column("tone", sa.String(length=50), nullable=True),
        sa.Column("order_no", sa.Integer(), nullable=False, server_default="1"),
    )

    op.create_table(
        "narrative_scores",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("scene_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("scenes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tension_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("coherence_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("pacing_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("novelty_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("metadata_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.UniqueConstraint("scene_id", name="uq_narrative_scores_scene"),
    )

    op.create_table(
        "story_checkpoints",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("story_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("scene_no", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(length=120), nullable=True),
        sa.Column("snapshot_json", jsonb, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_foreign_key(
        "fk_story_sessions_base_checkpoint",
        "story_sessions",
        "story_checkpoints",
        ["base_checkpoint_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_table(
        "simulation_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("story_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("trigger_type", sa.String(length=50), nullable=False),
        sa.Column("input_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("output_json", jsonb, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="completed"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("simulation_runs")
    op.drop_constraint("fk_story_sessions_base_checkpoint", "story_sessions", type_="foreignkey")
    op.drop_table("story_checkpoints")
    op.drop_table("narrative_scores")
    op.drop_table("scene_messages")
    op.drop_table("scene_events")
    op.drop_index("ix_scenes_project_session", table_name="scenes")
    op.drop_table("scenes")
    op.drop_table("relationships")
    op.drop_table("character_secrets")
    op.drop_table("character_knowledge")
    op.drop_table("character_versions")
    op.drop_index("ix_characters_project_id", table_name="characters")
    op.drop_table("characters")
    op.drop_table("ending_goals")
    op.drop_table("world_settings")
    op.drop_index("ix_story_sessions_project_id", table_name="story_sessions")
    op.drop_table("story_sessions")
    op.drop_table("story_projects")
