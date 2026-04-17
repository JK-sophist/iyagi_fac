import { typography } from '@/lib/tokens';

function buildNameMap(scene?: any) {
  const ids = scene?.participants ?? [];
  const names = scene?.active_motives?.map((m: any) => m.character) ?? [];
  return ids.reduce((acc: Record<string, string>, id: string, idx: number) => {
    acc[id] = names[idx] ?? id;
    return acc;
  }, {});
}

export function RelationshipDeltaPanel({ scene }: { scene?: any }) {
  const updates = scene?.state_delta?.relationship_updates ?? [];
  const nameMap = buildNameMap(scene);
  const top = updates.slice(0, 5);
  const labelPair = (pair: string[]) => pair.map((id) => nameMap[id] ?? id).join(' ↔ ');

  return (
    <section className="card-shell p-5">
      <h3 className={typography.cardTitle}>관계 변화 요약</h3>
      <p className="mb-3 mt-1 text-xs text-slate-400">이 장면 이후 인물 사이의 신뢰, 긴장, 배신 위험이 어떻게 달라졌는지 요약합니다.</p>
      {top.length === 0 ? (
        <p className="empty-state">이번 장면에서 눈에 띄는 관계 변화는 없습니다.</p>
      ) : (
        <ul className="space-y-2 text-xs">
          {top.map((u: any, i: number) => (
            <li key={i} className="rounded-xl border border-border bg-panel px-3 py-2">
              <p className="font-medium">{labelPair(u.pair ?? [])}</p>
              <p className="text-slate-300">신뢰도 {u.trust ?? '-'} · 긴장도 {u.tension ?? '-'}{u.betrayal_risk !== undefined ? ` · 배신 위험 ${u.betrayal_risk}` : ''}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
