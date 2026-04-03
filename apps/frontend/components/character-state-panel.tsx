export function CharacterStatePanel({ scene }: { scene?: any }) {
  const updates = scene?.state_delta?.emotion_updates ?? [];
  const risk = scene?.state_delta?.risk ?? {};
  const flags = scene?.state_delta?.flags ?? {};

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <h3 className="mb-3 text-sm font-semibold">캐릭터/플래그/리스크</h3>
      <p className="mb-2 text-xs">감정 변화: {updates.length ? JSON.stringify(updates) : '없음'}</p>
      <p className="mb-2 text-xs">주요 플래그: {Object.keys(flags).join(', ') || '없음'}</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <span className="rounded bg-slate-700/50 px-2 py-1">convergence: -</span>
        <span className="rounded bg-amber-500/20 px-2 py-1">repetition: {risk.repetition_risk ?? 0}</span>
        <span className="rounded bg-red-500/20 px-2 py-1">consistency: {risk.consistency_risk ?? 0}</span>
      </div>
    </section>
  );
}
