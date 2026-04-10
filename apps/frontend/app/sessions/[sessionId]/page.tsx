'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CandidateCard } from '@/components/candidate-card';
import { CharacterStatePanel } from '@/components/character-state-panel';
import { RelationshipDeltaPanel } from '@/components/relationship-delta-panel';
import { SessionStatusBar } from '@/components/session-status-bar';
import { typography } from '@/lib/tokens';
import { apiGet, apiPost } from '@/lib/api';

export default function SessionProgressPage({ params }: { params: { sessionId: string } }) {
  const [session, setSession] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [latestScene, setLatestScene] = useState<any>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [manualGoal, setManualGoal] = useState('');
  const [manualGoalNote, setManualGoalNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    try {
      const res = await apiGet<any>(`/sessions/${params.sessionId}`);
      setSession(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'session load failed');
    }
  };

  const loadScenes = async () => {
    const sceneRes = await apiGet<{ items: any[] }>(`/sessions/${params.sessionId}/scenes`);
    const items = sceneRes.data.items;
    setLatestScene(items.length ? items[items.length - 1] : null);
  };

  useEffect(() => {
    Promise.all([loadSession(), loadScenes()]).finally(() => setLoading(false));
  }, []);

  const generateCandidates = async () => {
    const res = await apiPost<{ items: any[] }>(`/sessions/${params.sessionId}/scene-candidates`);
    setCandidates(res.data.items);
    setWarnings(res.warnings);
    await loadSession();
  };

  const executeCandidate = async (candidateId: string) => {
    const res = await apiPost<any>(`/sessions/${params.sessionId}/execute-scene`, { candidate_id: candidateId });
    setLatestScene(res.data);
    setWarnings(res.warnings);
    await loadSession();
  };

  const saveManualGoal = async () => {
    if (!manualGoal.trim()) return;
    await apiPost(`/sessions/${params.sessionId}/manual-scene-goal`, { goal: manualGoal, note: manualGoalNote });
    setWarnings((prev) => ['직접 장면 목표를 저장했습니다. 다음 실행 장면에 연결됩니다.', ...prev]);
    await loadSession();
  };

  if (loading) return <div className="skeleton h-56" />;
  if (error) return <p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-300">{error}</p>;

  const introducedCount = latestScene?.state_delta?.emotion_updates?.filter((x: any) => x.introduced).length ?? 0;

  return (
    <section className="space-y-6">
      <SessionStatusBar
        sceneNo={latestScene?.scene_no ?? 0}
        phase={session?.stopped_reason ?? 'awaiting_suggestions'}
        stopReason={session?.stopped_reason}
        introducedCount={introducedCount}
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <div className="card-shell p-5">
            <div className="flex items-center justify-between">
              <h2 className={typography.sectionHeading}>다음 장면 후보 3개</h2>
              <button className="btn-primary text-xs" onClick={generateCandidates}>다음 후보 보기</button>
            </div>
            <p className="mt-2 text-xs text-slate-400">후보 제안과 실행은 분리되어 있으며, 실행 후 반드시 사용자 승인 대기 상태로 멈춥니다.</p>
          </div>

          <div className="card-shell space-y-3 p-5">
            <h3 className={typography.cardTitle}>직접 장면 목표 입력</h3>
            <p className="text-xs text-slate-400">AI 추천과 별개로 작가가 원하는 목표를 먼저 기록할 수 있습니다.</p>
            <input
              value={manualGoal}
              onChange={(e) => setManualGoal(e.target.value)}
              className="w-full rounded-xl border border-border bg-panel px-3 py-2 text-sm"
              placeholder="예: 주인공이 거짓말을 고백하게 만들기"
            />
            <textarea
              value={manualGoalNote}
              onChange={(e) => setManualGoalNote(e.target.value)}
              className="w-full rounded-xl border border-border bg-panel px-3 py-2 text-xs"
              placeholder="보조 메모 (선택)"
            />
            <button className="btn-secondary text-xs" onClick={saveManualGoal}>목표 저장</button>
            <Link href={`/sessions/${params.sessionId}/checkpoints`} className="btn-secondary text-xs text-center">체크포인트 화면으로 이동</Link>
            {session?.manual_scene_goal && (
              <p className="text-xs text-indigo-300">
                저장됨: {session.manual_scene_goal.goal}
              </p>
            )}
          </div>

          {session?.current_major_goal_conflicts?.length > 0 && (
            <div className="card-shell space-y-2 p-5">
              <h3 className={typography.cardTitle}>현재 주요 목표 충돌</h3>
              <ul className="text-xs text-slate-300">
                {session.current_major_goal_conflicts.map((c: any, idx: number) => (
                  <li key={`${c.actor}-${idx}`}>- {c.actor}({c.actor_goal}) ↔ {c.rival}({c.rival_goal})</li>
                ))}
              </ul>
            </div>
          )}

          {candidates.length === 0 ? (
            <div className="empty-state">후보가 없습니다. 상단의 <strong>다음 후보 보기</strong> 버튼을 눌러주세요.</div>
          ) : (
            <div className="grid gap-4">
              {candidates.map((c) => (
                <CandidateCard key={c.candidate_id} candidate={c} onSelect={executeCandidate} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <RelationshipDeltaPanel scene={latestScene} />
          <CharacterStatePanel scene={latestScene} />
        </div>
      </div>

      <section className="card-shell p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className={typography.cardTitle}>최근 실행 장면 로그 요약</h3>
          {latestScene && <Link href={`/scenes/${latestScene.id}`} className="btn-secondary text-xs">장면 상세 보기</Link>}
        </div>
        {latestScene ? (
          <>
            <p className="text-sm font-medium">{latestScene.title}</p>
            <p className="mt-2 text-xs text-slate-400">{latestScene.dialogue_log?.[0]}</p>
          </>
        ) : (
          <p className="text-xs text-slate-400">아직 실행된 장면이 없습니다.</p>
        )}
      </section>

      {warnings.length > 0 && (
        <section className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-200">
          {warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </section>
      )}
    </section>
  );
}
