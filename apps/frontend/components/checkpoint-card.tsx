export function CheckpointCard({ cp, onRestore, onBranch }: { cp: any; onRestore: (id: string) => void; onBranch: (id: string) => void }) {
  return (
    <article className="rounded-2xl border border-indigo-500/30 bg-card p-4 shadow-soft">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold">{cp.label || cp.id}</h4>
        <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-xs text-indigo-300">checkpoint</span>
      </div>
      <p className="text-xs text-slate-400">scene #{cp.scene_no}</p>
      <p className="text-xs text-slate-400">생성: {cp.created_at ?? 'N/A'}</p>
      <p className="mb-3 text-xs">요약: stop={cp.snapshot_json?.stop_reason ?? '-'}</p>
      <div className="flex gap-2">
        <button className="rounded-lg bg-panel px-2 py-1 text-xs" onClick={() => onRestore(cp.id)}>복원</button>
        <button className="rounded-lg bg-indigo-500/20 px-2 py-1 text-xs text-indigo-300" onClick={() => onBranch(cp.id)}>새 분기</button>
      </div>
    </article>
  );
}
