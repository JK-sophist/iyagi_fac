import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class StoryProject(Base):
    __tablename__ = "story_projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    metadata_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class StorySession(Base):
    __tablename__ = "story_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False)
    parent_session_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("story_sessions.id", ondelete="SET NULL"))
    base_checkpoint_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("story_checkpoints.id", ondelete="SET NULL")
    )
    branch_label: Mapped[str | None] = mapped_column(String(100))
    stopped_reason: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(30), default="awaiting_suggestions", nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class WorldSetting(Base):
    __tablename__ = "world_settings"
    __table_args__ = (UniqueConstraint("project_id", "version_no", name="uq_world_settings_project_version"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False)
    version_no: Mapped[int] = mapped_column(Integer, nullable=False)
    supersedes_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("world_settings.id", ondelete="SET NULL"))
    effective_from_scene_no: Mapped[int | None] = mapped_column(Integer)
    rules_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class EndingGoal(Base):
    __tablename__ = "ending_goals"
    __table_args__ = (UniqueConstraint("project_id", "version_no", name="uq_ending_goals_project_version"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False)
    version_no: Mapped[int] = mapped_column(Integer, nullable=False)
    supersedes_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("ending_goals.id", ondelete="SET NULL"))
    effective_from_scene_no: Mapped[int | None] = mapped_column(Integer)
    goal_text: Mapped[str] = mapped_column(Text, nullable=False)
    goal_detail_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class Character(Base):
    __tablename__ = "characters"
    __table_args__ = (
        UniqueConstraint("project_id", "name", name="uq_characters_project_name"),
        CheckConstraint("first_scene_no IS NULL OR first_scene_no >= 1", name="ck_characters_first_scene_no"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    archetype: Mapped[str | None] = mapped_column(String(80))
    profile_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)
    is_introduced: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    first_scene_no: Mapped[int | None] = mapped_column(Integer)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    effective_from_scene_no: Mapped[int | None] = mapped_column(Integer)
    deleted_at_scene_no: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class CharacterVersion(Base):
    __tablename__ = "character_versions"
    __table_args__ = (UniqueConstraint("character_id", "version_no", name="uq_character_versions_char_version"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    character_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("characters.id", ondelete="CASCADE"), nullable=False)
    version_no: Mapped[int] = mapped_column(Integer, nullable=False)
    effective_from_scene_no: Mapped[int | None] = mapped_column(Integer)
    personality_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)
    attributes_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class CharacterKnowledge(Base):
    __tablename__ = "character_knowledge"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    character_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("characters.id", ondelete="CASCADE"), nullable=False)
    key: Mapped[str] = mapped_column(String(120), nullable=False)
    content_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)
    discovered_scene_no: Mapped[int | None] = mapped_column(Integer)


class CharacterSecret(Base):
    __tablename__ = "character_secrets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    character_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("characters.id", ondelete="CASCADE"), nullable=False)
    secret_title: Mapped[str] = mapped_column(String(150), nullable=False)
    secret_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)
    revealed_scene_no: Mapped[int | None] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Relationship(Base):
    __tablename__ = "relationships"
    __table_args__ = (UniqueConstraint("project_id", "from_character_id", "to_character_id", name="uq_relationship_pair"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False)
    from_character_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("characters.id", ondelete="CASCADE"), nullable=False)
    to_character_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("characters.id", ondelete="CASCADE"), nullable=False)
    trust: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    affection: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    hostility: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    dependency: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    tension: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    tags_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class Scene(Base):
    __tablename__ = "scenes"
    __table_args__ = (
        UniqueConstraint("session_id", "scene_no", name="uq_scenes_session_scene_no"),
        CheckConstraint("scene_no >= 1", name="ck_scene_no_positive"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("story_sessions.id", ondelete="CASCADE"), nullable=False)
    scene_no: Mapped[int] = mapped_column(Integer, nullable=False)
    candidate_index: Mapped[int | None] = mapped_column(Integer)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    immutable_locked: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    state_delta_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class SceneEvent(Base):
    __tablename__ = "scene_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scene_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scenes.id", ondelete="CASCADE"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(80), nullable=False)
    payload_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)
    order_no: Mapped[int] = mapped_column(Integer, default=1, nullable=False)


class SceneMessage(Base):
    __tablename__ = "scene_messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scene_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scenes.id", ondelete="CASCADE"), nullable=False)
    speaker_character_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("characters.id", ondelete="SET NULL"))
    message_text: Mapped[str] = mapped_column(Text, nullable=False)
    tone: Mapped[str | None] = mapped_column(String(50))
    order_no: Mapped[int] = mapped_column(Integer, default=1, nullable=False)


class NarrativeScore(Base):
    __tablename__ = "narrative_scores"
    __table_args__ = (UniqueConstraint("scene_id", name="uq_narrative_scores_scene"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scene_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scenes.id", ondelete="CASCADE"), nullable=False)
    tension_score: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    coherence_score: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    pacing_score: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    novelty_score: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    metadata_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)


class StoryCheckpoint(Base):
    __tablename__ = "story_checkpoints"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("story_projects.id", ondelete="CASCADE"), nullable=False)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("story_sessions.id", ondelete="CASCADE"), nullable=False)
    scene_no: Mapped[int] = mapped_column(Integer, nullable=False)
    label: Mapped[str | None] = mapped_column(String(120))
    snapshot_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("story_sessions.id", ondelete="CASCADE"), nullable=False)
    trigger_type: Mapped[str] = mapped_column(String(50), nullable=False)
    input_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)
    output_json: Mapped[dict] = mapped_column(JSONB().with_variant(JSON(), "sqlite"), default=dict)
    status: Mapped[str] = mapped_column(String(30), default="completed", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
