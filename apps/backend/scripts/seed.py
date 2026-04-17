import uuid
from datetime import datetime

from sqlalchemy import text

from app.db import SessionLocal


def run_seed() -> None:
    now = datetime.utcnow()

    project_id = uuid.uuid4()
    session_id = uuid.uuid4()
    char1 = uuid.uuid4()
    char2 = uuid.uuid4()
    scene_id = uuid.uuid4()
    checkpoint_id = uuid.uuid4()

    snapshot = {
        "session_id": str(session_id),
        "scene_no": 1,
        "state": {
            "metrics": {"tension": 1.2, "trust": 0.1, "momentum": 0.8},
            "flags": {"after_scene_1": True},
        },
    }

    with SessionLocal() as db:
        db.execute(
            text(
                """
                INSERT INTO story_projects (id, title, description, metadata_json, created_at, updated_at)
                VALUES (:id, :title, :description, CAST(:metadata AS jsonb), :created_at, :updated_at)
                ON CONFLICT DO NOTHING
                """
            ),
            {
                "id": project_id,
                "title": "검은 항구의 맹세",
                "description": "반자동 서사 시뮬레이션 테스트 프로젝트",
                "metadata": "{}",
                "created_at": now,
                "updated_at": now,
            },
        )

        db.execute(
            text(
                """
                INSERT INTO story_sessions (id, project_id, parent_session_id, base_checkpoint_id, branch_label, stopped_reason, status, started_at, ended_at)
                VALUES (:id, :project_id, NULL, NULL, :branch_label, :stopped_reason, :status, :started_at, NULL)
                ON CONFLICT DO NOTHING
                """
            ),
            {
                "id": session_id,
                "project_id": project_id,
                "branch_label": "main",
                "stopped_reason": "awaiting_user_approval",
                "status": "awaiting_user_approval",
                "started_at": now,
            },
        )

        db.execute(
            text(
                """
                INSERT INTO world_settings (id, project_id, version_no, supersedes_id, effective_from_scene_no, rules_json, created_at)
                VALUES (:id, :project_id, 1, NULL, 0, CAST(:rules AS jsonb), :created_at)
                ON CONFLICT DO NOTHING
                """
            ),
            {
                "id": uuid.uuid4(),
                "project_id": project_id,
                "rules": '{"power_balance":"cold_war"}',
                "created_at": now,
            },
        )

        db.execute(
            text(
                """
                INSERT INTO ending_goals (id, project_id, version_no, supersedes_id, effective_from_scene_no, goal_text, goal_detail_json, created_at)
                VALUES (:id, :project_id, 1, NULL, 0, :goal_text, CAST(:detail AS jsonb), :created_at)
                ON CONFLICT DO NOTHING
                """
            ),
            {
                "id": uuid.uuid4(),
                "project_id": project_id,
                "goal_text": "전면전 방지 및 균형 협약 체결",
                "detail": '{"must_keep":"civil_order"}',
                "created_at": now,
            },
        )

        for cid, name, intro in [(char1, "리아", True), (char2, "도윤", True)]:
            db.execute(
                text(
                    """
                    INSERT INTO characters (
                      id, project_id, name, archetype, profile_json, is_introduced, first_scene_no,
                      is_archived, effective_from_scene_no, deleted_at_scene_no, created_at
                    ) VALUES (
                      :id, :project_id, :name, :archetype, CAST(:profile AS jsonb), :is_introduced, :first_scene_no,
                      false, 0, NULL, :created_at
                    )
                    ON CONFLICT DO NOTHING
                    """
                ),
                {
                    "id": cid,
                    "project_id": project_id,
                    "name": name,
                    "archetype": "협상가" if name == "리아" else "잠수기사",
                    "profile": "{}",
                    "is_introduced": intro,
                    "first_scene_no": 1,
                    "created_at": now,
                },
            )

        db.execute(
            text(
                """
                INSERT INTO relationships (
                  id, project_id, from_character_id, to_character_id, trust, affection, hostility, dependency, tension, tags_json, updated_at
                ) VALUES (
                  :id, :project_id, :from_character_id, :to_character_id, 0.2, 0.1, 0.0, 0.0, 0.3, CAST(:tags AS jsonb), :updated_at
                )
                ON CONFLICT DO NOTHING
                """
            ),
            {
                "id": uuid.uuid4(),
                "project_id": project_id,
                "from_character_id": char1,
                "to_character_id": char2,
                "tags": '{"label":"동맹 후보"}',
                "updated_at": now,
            },
        )

        db.execute(
            text(
                """
                INSERT INTO scenes (id, project_id, session_id, scene_no, candidate_index, summary, immutable_locked, state_delta_json, created_at)
                VALUES (:id, :project_id, :session_id, 1, 2, :summary, true, CAST(:delta AS jsonb), :created_at)
                ON CONFLICT DO NOTHING
                """
            ),
            {
                "id": scene_id,
                "project_id": project_id,
                "session_id": session_id,
                "summary": "장면 후보 2 실행: 갈등 완화 시도",
                "delta": '{"tension":1,"trust":1}',
                "created_at": now,
            },
        )

        db.execute(
            text(
                """
                INSERT INTO story_checkpoints (id, project_id, session_id, scene_no, label, snapshot_json, created_at)
                VALUES (:id, :project_id, :session_id, 1, :label, CAST(:snapshot_json AS jsonb), :created_at)
                ON CONFLICT DO NOTHING
                """
            ),
            {
                "id": checkpoint_id,
                "project_id": project_id,
                "session_id": session_id,
                "label": "scene_1_checkpoint",
                "snapshot_json": str(snapshot).replace("'", '"'),
                "created_at": now,
            },
        )

        db.execute(
            text(
                """
                UPDATE story_sessions
                SET base_checkpoint_id = :checkpoint_id
                WHERE id = :session_id
                """
            ),
            {"checkpoint_id": checkpoint_id, "session_id": session_id},
        )

        db.commit()

    print("seed completed")


if __name__ == "__main__":
    run_seed()
