import { typography } from '@/lib/tokens';

export function RelationshipDeltaPanel({ scene }: { scene?: any }) {
  const updates = scene?.state_delta?.relationship_updates ?? [];
  const top = updates.slice(0, 5);

  return (
    <section className="card-shell p-5">
      <h3 className={typography.cardTitle}>관계 변화 Top 5</h3>
      <p className="mb-3 mt-1 text-xs text-slate-400">관계 drift를 먼저 확인해 장면 채택 여부를 판단하세요.</p>
      {top.length === 0 ? (
        <p className="empty-state">변화 데이터 없음</p>
      ) : (
        <ul className="space-y-2 text-xs">
          {top.map((u: any, i: number) => (
            <li key={i} className="rounded-xl border border-border bg-panel px-3 py-2">
              {u.pair?.join(' ↔ ')} · trust <span className="text-emerald-300">{u.trust}</span> · tension <span className="text-amber-300">{u.tension}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
