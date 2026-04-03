import { typography } from '@/lib/tokens';

export function CharacterStatePanel({ scene }: { scene?: any }) {
  const updates = scene?.state_delta?.emotion_updates ?? [];
  const risk = scene?.state_delta?.risk ?? {};
  const flags = scene?.state_delta?.flags ?? {};

  return (
    <section className="card-shell p-5">
      <h3 className={typography.cardTitle}>상태 변화 패널</h3>
      <p className="mb-3 mt-1 text-xs text-slate-400">텍스트보다 상태 변화 지표를 우선 확인합니다.</p>

      <div className="space-y-2 text-xs">
        <p>감정 변화: {updates.length ? JSON.stringify(updates) : '없음'}</p>
        <p>주요 플래그: {Object.keys(flags).join(', ') || '없음'}</p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <span className="rounded-xl border border-slate-500/40 bg-slate-500/20 px-2 py-1">convergence: -</span>
        <span className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-2 py-1">repetition: {risk.repetition_risk ?? 0}</span>
        <span className="rounded-xl border border-red-500/40 bg-red-500/15 px-2 py-1">consistency: {risk.consistency_risk ?? 0}</span>
      </div>
    </section>
  );
}
