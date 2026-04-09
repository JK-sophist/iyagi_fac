import { typography } from '@/lib/tokens';

type Candidate = {
  candidate_id: string;
  title: string;
  participants: string[];
  scene_type: string;
  why_now: string;
  predicted_effects: unknown;
  risk_notes: string[];
  expected_stop_reason: string;
  goal_conflicts?: Array<{ actor: string; actor_goal: string; rival: string; rival_goal: string }>;
  active_motives?: Array<{ character: string; surface_goal: string; hidden_goal: string; short_term_goal: string }>;
  scheme_opportunities?: string[];
};

export function CandidateCard({ candidate, onSelect }: { candidate: Candidate; onSelect: (id: string) => void }) {
  return (
    <article className="card-shell p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className={typography.cardTitle}>{candidate.title}</h3>
          <p className="mt-1 text-xs text-slate-400">참여 인물: {candidate.participants.join(', ')}</p>
        </div>
        <span className="rounded-full border border-indigo-500/40 bg-indigo-500/15 px-2 py-1 text-[11px] text-indigo-200">{candidate.scene_type}</span>
      </header>

      <div className="space-y-2 text-xs leading-5">
        {candidate.goal_conflicts?.[0] && (
          <p>
            <span className="text-slate-400">핵심 목표 충돌:</span>{' '}
            {candidate.goal_conflicts[0].actor}({candidate.goal_conflicts[0].actor_goal}) ↔{' '}
            {candidate.goal_conflicts[0].rival}({candidate.goal_conflicts[0].rival_goal})
          </p>
        )}
        {candidate.active_motives && candidate.active_motives.length > 0 && (
          <p>
            <span className="text-slate-400">누가 무엇을 노리는가:</span>{' '}
            {candidate.active_motives.map((m) => `${m.character}:${m.short_term_goal || m.surface_goal || '-'}`).join(' / ')}
          </p>
        )}
        {candidate.scheme_opportunities && candidate.scheme_opportunities.length > 0 && (
          <p><span className="text-slate-400">계략/협상 가능성:</span> {candidate.scheme_opportunities.join(' · ')}</p>
        )}
        <p><span className="text-slate-400">왜 지금:</span> {candidate.why_now}</p>
        <p><span className="text-slate-400">예상 효과:</span> {JSON.stringify(candidate.predicted_effects)}</p>
        <p className="text-amber-200"><span className="text-amber-300">예상 위험:</span> {candidate.risk_notes.join(', ')}</p>
        <p className="text-indigo-200"><span className="text-indigo-300">예상 Stop:</span> {candidate.expected_stop_reason}</p>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <button
          aria-label={`select-candidate-${candidate.candidate_id}`}
          onClick={() => onSelect(candidate.candidate_id)}
          className="btn-primary text-xs"
        >
          이 후보 선택
        </button>
      </div>
    </article>
  );
}
