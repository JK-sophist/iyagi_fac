'use client';

import { FormEvent, useState } from 'react';

import { apiPost, apiPut } from '@/lib/api';

export default function RelationshipsPage({ params }: { params: { projectId: string } }) {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [trust, setTrust] = useState('0.2');
  const [tension, setTension] = useState('0.3');
  const [message, setMessage] = useState('');

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    await apiPost(`/projects/${params.projectId}/relationships`, {
      from_character_id: fromId,
      to_character_id: toId,
      trust: Number(trust),
      tension: Number(tension)
    });
    setMessage('관계 생성 완료');
  };

  const onUpdate = async () => {
    await apiPut(`/projects/${params.projectId}/relationships`, {
      from_character_id: fromId,
      to_character_id: toId,
      trust: Number(trust),
      tension: Number(tension) + 0.1
    });
    setMessage('관계 업데이트 완료');
  };

  return (
    <section className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">관계도 편집</h1>
      <form onSubmit={onCreate} className="rounded-2xl border border-border bg-card p-4 shadow-soft space-y-2">
        <input aria-label="from character" value={fromId} onChange={(e) => setFromId(e.target.value)} placeholder="from_character_id" className="w-full rounded-xl border border-border bg-panel px-3 py-2" />
        <input aria-label="to character" value={toId} onChange={(e) => setToId(e.target.value)} placeholder="to_character_id" className="w-full rounded-xl border border-border bg-panel px-3 py-2" />
        <div className="grid grid-cols-2 gap-2">
          <input aria-label="trust" value={trust} onChange={(e) => setTrust(e.target.value)} className="rounded-xl border border-border bg-panel px-3 py-2" />
          <input aria-label="tension" value={tension} onChange={(e) => setTension(e.target.value)} className="rounded-xl border border-border bg-panel px-3 py-2" />
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-slate-950">관계 생성</button>
          <button type="button" className="rounded-xl bg-panel px-3 py-2 text-xs" onClick={onUpdate}>관계 업데이트</button>
        </div>
      </form>
      {message && <p className="text-xs text-emerald-300">{message}</p>}
    </section>
  );
}
