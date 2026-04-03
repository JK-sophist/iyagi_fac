export function CheckpointCard({ cp, onRestore, onBranch }: { cp: any; onRestore: (id: string) => void; onBranch: (id: string) => void }) {
  return (
    <article className="card-shell border-indigo-500/35 p-5">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold">{cp.label || cp.id}</h4>
        <span className="rounded-full border border-indigo-500/40 bg-indigo-500/15 px-2 py-1 text-[11px] text-indigo-200">checkpoint</span>
      </div>
      <p className="text-xs text-slate-400">scene #{cp.scene_no}</p>
      <p className="text-xs text-slate-400">생성: {cp.created_at ?? 'N/A'}</p>
      <p className="mb-3 mt-2 text-xs">요약: stop={cp.snapshot_json?.stop_reason ?? '-'}</p>
      <div className="flex gap-2">
        <button className="btn-secondary text-xs" onClick={() => onRestore(cp.id)}>복원</button>
        <button className="rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-3 py-2 text-xs text-indigo-200" onClick={() => onBranch(cp.id)}>새 분기 생성</button>
      </div>
    </article>
  );
}
