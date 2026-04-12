'use client';

import { useState } from 'react';

function replaceIds(line: string, nameMap: Record<string, string>) {
  let result = line;
  for (const [id, name] of Object.entries(nameMap)) {
    result = result.split(id).join(name);
  }
  return result;
}

function humanizeSystem(line: string) {
  if (line.startsWith('scene_type=')) return `장면 유형: ${line.replace('scene_type=', '')}`;
  if (line === 'state_delta_applied=true') return '이 장면의 상태 변화가 세션에 반영되었습니다.';
  if (line === 'auto_progression=false') return '자동 진행 없이 여기서 멈추고 사용자의 다음 선택을 기다립니다.';
  return line;
}

export function SceneLogTabs({ scene }: { scene: any }) {
  const [tab, setTab] = useState<'dialogue' | 'action' | 'system'>('dialogue');
  const nameMap = scene?.participant_name_map ?? {};
  const rawLogs = tab === 'dialogue' ? scene?.dialogue_log ?? [] : tab === 'action' ? scene?.action_log ?? [] : scene?.system_log ?? [];
  const logs = rawLogs.map((line: string) => {
    const replaced = replaceIds(line, nameMap);
    return tab === 'system' ? humanizeSystem(replaced) : replaced;
  });
  const labels = { dialogue: '대화', action: '행동', system: '처리 요약' } as const;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft" aria-label="scene log tabs">
      <div className="mb-3 flex gap-2">
        {(['dialogue', 'action', 'system'] as const).map((t) => (
          <button
            key={t}
            aria-label={`${t}-tab`}
            className={`rounded-lg px-2 py-1 text-xs ${tab === t ? 'bg-accent text-slate-950' : 'bg-panel'}`}
            onClick={() => setTab(t)}
          >
            {labels[t]}
          </button>
        ))}
      </div>
      <ul className="space-y-2 text-xs">
        {logs.length === 0 ? <li className="text-slate-400">기록이 없습니다.</li> : logs.map((line: string, idx: number) => <li key={idx}>{line}</li>)}
      </ul>
    </section>
  );
}
