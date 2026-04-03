'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CandidateCard } from '@/components/candidate-card';
import { CharacterStatePanel } from '@/components/character-state-panel';
import { RelationshipDeltaPanel } from '@/components/relationship-delta-panel';
import { SessionStatusBar } from '@/components/session-status-bar';
import { apiGet, apiPost } from '@/lib/api';

export default function SessionProgressPage({ params }: { params: { sessionId: string } }) {
  const [session, setSession] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [latestScene, setLatestScene] = useState<any>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
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

  if (loading) return <div className="skeleton h-56" />;
  if (error) return <p className="rounded-2xl bg-red-500/20 p-3 text-xs text-red-300">{error}</p>;

  const introducedCount = latestScene?.state_delta?.emotion_updates?.filter((x: any) => x.introduced).length ?? 0;

  return (
    <section className="space-y-4">
      <SessionStatusBar
        sceneNo={latestScene?.scene_no ?? 0}
        phase={session?.stopped_reason ?? 'awaiting_suggestions'}
        stopReason={session?.stopped_reason}
        introducedCount={introducedCount}
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">다음 장면 후보 3개</h2>
            <button className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-slate-950" onClick={generateCandidates}>다음 후보 보기</button>
          </div>

          {candidates.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-4 text-xs text-slate-400">후보가 없습니다. "다음 후보 보기"를 눌러주세요.</div>
          ) : (
            <div className="grid gap-3">
              {candidates.map((c) => (
                <CandidateCard key={c.candidate_id} candidate={c} onSelect={executeCandidate} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <RelationshipDeltaPanel scene={latestScene} />
          <CharacterStatePanel scene={latestScene} />
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h3 className="mb-2 text-sm font-semibold">최근 실행 장면 로그 요약</h3>
        {latestScene ? (
          <>
            <p className="mb-1 text-xs">{latestScene.title}</p>
            <p className="mb-2 text-xs text-slate-400">{latestScene.dialogue_log?.[0]}</p>
            <Link href={`/scenes/${latestScene.id}`} className="rounded-lg bg-panel px-3 py-2 text-xs">장면 상세 보기</Link>
          </>
        ) : (
          <p className="text-xs text-slate-400">아직 실행된 장면이 없습니다.</p>
        )}
      </section>

      {warnings.length > 0 && (
        <section className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
          {warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </section>
      )}
    </section>
  );
}
