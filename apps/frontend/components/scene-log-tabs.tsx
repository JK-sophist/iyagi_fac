'use client';

import { useState } from 'react';

export function SceneLogTabs({ scene }: { scene: any }) {
  const [tab, setTab] = useState<'dialogue' | 'action' | 'system'>('dialogue');
  const logs =
    tab === 'dialogue' ? scene?.dialogue_log ?? [] : tab === 'action' ? scene?.action_log ?? [] : scene?.system_log ?? [];

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
            {t}
          </button>
        ))}
      </div>
      <ul className="space-y-1 text-xs">
        {logs.length === 0 ? <li className="text-slate-400">로그 없음</li> : logs.map((line: string, idx: number) => <li key={idx}>{line}</li>)}
      </ul>
    </section>
  );
}
