import { typography } from '@/lib/tokens';

function buildNameMap(scene?: any) {
  const ids = scene?.participants ?? [];
  const names = scene?.active_motives?.map((m: any) => m.character) ?? [];
  return ids.reduce((acc: Record<string, string>, id: string, idx: number) => {
    acc[id] = names[idx] ?? id;
    return acc;
  }, {});
}

export function CharacterStatePanel({ scene }: { scene?: any }) {
  const updates = scene?.state_delta?.emotion_updates ?? [];
  const risk = scene?.state_delta?.risk ?? {};
  const flags = scene?.state_delta?.flags ?? {};
  const nameMap = buildNameMap(scene);

  return (
    <section className="card-shell p-5">
      <h3 className={typography.cardTitle}>상태 변화 요약</h3>
      <p className="mb-3 mt-1 text-xs text-slate-400">이번 장면에서 인물 상태와 서사 위험도가 어떻게 변했는지 이해하기 쉽게 보여줍니다.</p>

      <div className="space-y-2 text-xs">
        {updates.length === 0 ? (
          <p>눈에 띄는 인물 상태 변화는 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {updates.map((u: any, idx: number) => (
              <li key={idx} className="rounded-xl border border-border bg-panel px-3 py-2">
                {(nameMap[u.character_id] ?? u.character_id)}는 현재 <strong>{u.emotion ?? '변화 없음'}</strong> 상태입니다{u.introduced ? ' · 이번 장면에서 본격적으로 등장했습니다.' : ' · 상태를 유지했습니다.'}
              </li>
            ))}
          </ul>
        )}

        <p>추가 플래그: {Object.keys(flags).length ? Object.keys(flags).join(', ') : '없음'}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <span className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-2 py-1">반복 위험: {risk.repetition_risk ?? 0}</span>
        <span className="rounded-xl border border-red-500/40 bg-red-500/15 px-2 py-1">일관성 위험: {risk.consistency_risk ?? 0}</span>
      </div>
    </section>
  );
}
