type Candidate = {
  candidate_id: string;
  title: string;
  participants: string[];
  scene_type: string;
  why_now: string;
  predicted_effects: unknown;
  risk_notes: string[];
  expected_stop_reason: string;
};

export function CandidateCard({ candidate, onSelect }: { candidate: Candidate; onSelect: (id: string) => void }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{candidate.title}</h3>
        <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-xs text-indigo-300">{candidate.scene_type}</span>
      </div>
      <p className="mb-2 text-xs text-slate-400">참여 인물: {candidate.participants.join(', ')}</p>
      <p className="mb-2 text-xs">왜 지금: {candidate.why_now}</p>
      <p className="mb-2 text-xs">예상 효과: {JSON.stringify(candidate.predicted_effects)}</p>
      <p className="mb-2 text-xs text-amber-300">예상 위험: {candidate.risk_notes.join(', ')}</p>
      <p className="mb-3 text-xs text-indigo-300">예상 Stop: {candidate.expected_stop_reason}</p>
      <button
        aria-label={`select-candidate-${candidate.candidate_id}`}
        onClick={() => onSelect(candidate.candidate_id)}
        className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-slate-950 focus:outline-none focus:ring-2 focus:ring-accent"
      >
        이 후보 선택
      </button>
    </article>
  );
}
