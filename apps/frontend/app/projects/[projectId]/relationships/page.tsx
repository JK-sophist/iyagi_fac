'use client';

import { FormEvent, useState } from 'react';

import { apiPost, apiPut } from '@/lib/api';

export default function RelationshipsPage({ params }: { params: { projectId: string } }) {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [trust, setTrust] = useState('0.2');
  const [hostility, setHostility] = useState('0.1');
  const [dependency, setDependency] = useState('0.2');
  const [utilityValue, setUtilityValue] = useState('0.3');
  const [surveillanceLevel, setSurveillanceLevel] = useState('0.2');
  const [betrayalRisk, setBetrayalRisk] = useState('0.2');
  const [sharedSecret, setSharedSecret] = useState('');
  const [message, setMessage] = useState('');

  const payload = {
    from_character_id: fromId,
    to_character_id: toId,
    trust: Number(trust),
    tension: Number(hostility),
    hostility: Number(hostility),
    dependency: Number(dependency),
    utility_value: Number(utilityValue),
    surveillance_level: Number(surveillanceLevel),
    betrayal_risk: Number(betrayalRisk),
    shared_secret: sharedSecret
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    await apiPost(`/projects/${params.projectId}/relationships`, payload);
    setMessage('관계 생성 완료');
  };

  const onUpdate = async () => {
    await apiPut(`/projects/${params.projectId}/relationships`, payload);
    setMessage('관계 업데이트 완료');
  };

  return (
    <section className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold">관계도 편집 (목표 충돌 확장)</h1>
      <form onSubmit={onCreate} className="rounded-2xl border border-border bg-card p-4 shadow-soft space-y-2">
        <input aria-label="from character" value={fromId} onChange={(e) => setFromId(e.target.value)} placeholder="from_character_id" className="w-full rounded-xl border border-border bg-panel px-3 py-2" />
        <input aria-label="to character" value={toId} onChange={(e) => setToId(e.target.value)} placeholder="to_character_id" className="w-full rounded-xl border border-border bg-panel px-3 py-2" />
        <div className="grid grid-cols-2 gap-2 text-xs">
          <input value={trust} onChange={(e) => setTrust(e.target.value)} placeholder="trust" className="rounded-xl border border-border bg-panel px-3 py-2" />
          <input value={hostility} onChange={(e) => setHostility(e.target.value)} placeholder="hostility" className="rounded-xl border border-border bg-panel px-3 py-2" />
          <input value={dependency} onChange={(e) => setDependency(e.target.value)} placeholder="dependency" className="rounded-xl border border-border bg-panel px-3 py-2" />
          <input value={utilityValue} onChange={(e) => setUtilityValue(e.target.value)} placeholder="utility_value" className="rounded-xl border border-border bg-panel px-3 py-2" />
          <input value={surveillanceLevel} onChange={(e) => setSurveillanceLevel(e.target.value)} placeholder="surveillance_level" className="rounded-xl border border-border bg-panel px-3 py-2" />
          <input value={betrayalRisk} onChange={(e) => setBetrayalRisk(e.target.value)} placeholder="betrayal_risk" className="rounded-xl border border-border bg-panel px-3 py-2" />
        </div>
        <input value={sharedSecret} onChange={(e) => setSharedSecret(e.target.value)} placeholder="shared_secret" className="w-full rounded-xl border border-border bg-panel px-3 py-2" />
        <div className="flex gap-2">
          <button className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-slate-950">관계 생성</button>
          <button type="button" className="rounded-xl bg-panel px-3 py-2 text-xs" onClick={onUpdate}>관계 업데이트</button>
        </div>
      </form>
      {message && <p className="text-xs text-emerald-300">{message}</p>}
    </section>
  );
}
