from app.services.simulation import (
    CharacterState,
    DeterministicMockProvider,
    ParticipantSelector,
    RelationshipState,
    RuleEngine,
    SceneCandidateGenerator,
    SceneExecutor,
    SessionFlowOrchestrator,
    SessionState,
    StopConditionEvaluator,
)


def build_orchestrator() -> SessionFlowOrchestrator:
    provider = DeterministicMockProvider(seed=3)
    selector = ParticipantSelector()
    generator = SceneCandidateGenerator(provider=provider, participant_selector=selector)
    rule_engine = RuleEngine()
    executor = SceneExecutor(rule_engine=rule_engine)
    stop_eval = StopConditionEvaluator()
    return SessionFlowOrchestrator(generator=generator, executor=executor, stop_evaluator=stop_eval)


def sample_session() -> SessionState:
    return SessionState(
        session_id="s1",
        project_id="p1",
        characters=[
            CharacterState(id="c1", name="리아", is_introduced=True),
            CharacterState(id="c2", name="도윤", is_introduced=True),
            CharacterState(id="c3", name="세린", is_introduced=False),
            CharacterState(id="c4", name="유진", is_introduced=True, is_archived=True),
        ],
        relationships=[
            RelationshipState(from_character_id="c1", to_character_id="c2", trust=0.2, tension=0.5),
            RelationshipState(from_character_id="c2", to_character_id="c3", trust=0.4, tension=0.3),
        ],
    )


def test_candidate_generation_returns_three_candidates() -> None:
    orch = build_orchestrator()
    session = sample_session()

    candidates = orch.suggest_candidates(session)

    assert len(candidates) == 3
    assert candidates[0].expected_stop_reason == "user_decision_required"
    assert 2 <= len(candidates[0].participants) <= 4


def test_execute_selected_candidate_updates_state_and_logs() -> None:
    orch = build_orchestrator()
    session = sample_session()

    candidate = orch.suggest_candidates(session)[1]
    result = orch.execute_selected_candidate(session, candidate)

    assert result.scene_no == 1
    assert len(result.dialogue_log) > 0
    assert len(result.action_log) > 0
    assert "auto_progression=false" in result.system_log
    assert session.stop_reason is not None


def test_stop_reason_is_set_after_scene_execution() -> None:
    orch = build_orchestrator()
    session = sample_session()
    session.narrative_scores["repetition_risk"] = 0.65

    candidate = orch.suggest_candidates(session)[0]
    orch.execute_selected_candidate(session, candidate)

    assert session.stop_reason == "repetition_risk_high"


def test_introduced_character_is_marked_when_participating() -> None:
    orch = build_orchestrator()
    session = sample_session()
    target = next(c for c in session.characters if c.id == "c3")

    candidate = orch.suggest_candidates(session)[0]
    candidate.participants = ["c1", "c3"]
    orch.execute_selected_candidate(session, candidate)

    assert target.is_introduced is True


def test_soft_deleted_character_is_excluded_from_participants() -> None:
    orch = build_orchestrator()
    session = sample_session()

    candidates = orch.suggest_candidates(session)
    archived_ids = {c.id for c in session.characters if c.is_archived}
    for candidate in candidates:
        assert archived_ids.isdisjoint(set(candidate.participants))
