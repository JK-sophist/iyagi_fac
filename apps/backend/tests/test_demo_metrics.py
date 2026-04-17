from scripts.demo_story_run import evaluate_metrics


def test_evaluation_metrics_shape() -> None:
    scene = {
        "state_delta": {
            "risk": {"consistency_risk": 0.2, "repetition_risk": 0.3},
            "relationship_updates": [{"tension": 0.4}, {"tension": 0.5}],
        }
    }
    metrics = evaluate_metrics(scene, "user_decision_required", restore_ok=True, branch_ok=True)

    assert metrics["character_consistency_score"] >= 0
    assert metrics["checkpoint_integrity_score"] == 100.0
    assert metrics["branch_divergence_clarity"] == 100.0
