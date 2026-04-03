export function RelationshipDeltaPanel({ scene }: { scene?: any }) {
  const updates = scene?.state_delta?.relationship_updates ?? [];
  const top = updates.slice(0, 5);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <h3 className="mb-3 text-sm font-semibold">관계 변화 Top 5</h3>
      {top.length === 0 ? (
        <p className="text-xs text-slate-400">변화 데이터 없음</p>
      ) : (
        <ul className="space-y-2 text-xs">
          {top.map((u: any, i: number) => (
            <li key={i} className="rounded-lg bg-panel px-2 py-1">
              {u.pair?.join(' ↔ ')} | trust {u.trust} | tension {u.tension}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
