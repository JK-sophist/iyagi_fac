'use client';

import { FormEvent, useEffect, useState } from 'react';

import { HelpToggle, HelperText } from '@/components/form-help';
import { apiGet, apiPost, apiPut } from '@/lib/api';

export default function RelationshipsPage({ params }: { params: { projectId: string } }) {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [characters, setCharacters] = useState<any[]>([]);
  const [showHelp, setShowHelp] = useState(true);

  const [trust, setTrust] = useState('0.2');
  const [tension, setTension] = useState('0.3');
  const [hostility, setHostility] = useState('0.1');
  const [dependency, setDependency] = useState('0.2');
  const [utilityValue, setUtilityValue] = useState('0.3');
  const [surveillanceLevel, setSurveillanceLevel] = useState('0.2');
  const [betrayalRisk, setBetrayalRisk] = useState('0.2');
  const [sharedSecret, setSharedSecret] = useState('');
  const [message, setMessage] = useState('');

  const loadCharacters = async () => {
    const project = await apiGet<any>(`/projects/${params.projectId}`);
    const ids = project.data.character_ids ?? [];
    const items = await Promise.all(ids.map((id: string) => apiGet<any>(`/characters/${id}`).then((r) => r.data).catch(() => null)));
    const valid = items.filter(Boolean);
    setCharacters(valid);
    if (!fromId && valid[0]) setFromId(valid[0].id);
    if (!toId && valid[1]) setToId(valid[1].id);
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  const payload = {
    from_character_id: fromId,
    to_character_id: toId,
    trust: Number(trust),
    tension: Number(tension),
    hostility: Number(hostility),
    dependency: Number(dependency),
    utility_value: Number(utilityValue),
    surveillance_level: Number(surveillanceLevel),
    betrayal_risk: Number(betrayalRisk),
    shared_secret: sharedSecret
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId || fromId === toId) {
      setMessage('관계를 만들 두 인물을 서로 다르게 선택해 주세요.');
      return;
    }
    await apiPost(`/projects/${params.projectId}/relationships`, payload);
    setMessage('관계를 저장했습니다.');
  };

  const onUpdate = async () => {
    if (!fromId || !toId || fromId === toId) {
      setMessage('수정할 관계의 두 인물을 서로 다르게 선택해 주세요.');
      return;
    }
    await apiPut(`/projects/${params.projectId}/relationships`, payload);
    setMessage('관계를 업데이트했습니다.');
  };

  const slider = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    helper: string
  ) => (
    <label className="block rounded-xl border border-border bg-panel p-3 text-xs">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span>{value}</span>
      </div>
      <input type="range" min="0" max="1" step="0.05" value={value} onChange={(e) => setValue(e.target.value)} className="w-full" />
      <HelperText show={showHelp}>{helper} (0.0 ~ 1.0)</HelperText>
    </label>
  );

  return (
    <section className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">관계 설정</h1>
          <p className="text-xs text-slate-400">캐릭터를 선택해 관계 강도를 조정합니다.</p>
        </div>
        <HelpToggle show={showHelp} onToggle={() => setShowHelp((prev) => !prev)} />
      </div>

      <form onSubmit={onCreate} className="rounded-2xl border border-border bg-card p-4 shadow-soft space-y-3">
        <label className="block text-sm">
          기준 인물
          <select className="mt-1 w-full rounded-xl border border-border bg-panel px-3 py-2" value={fromId} onChange={(e) => setFromId(e.target.value)}>
            <option value="">선택</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.id.slice(0, 8)})</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          상대 인물
          <select className="mt-1 w-full rounded-xl border border-border bg-panel px-3 py-2" value={toId} onChange={(e) => setToId(e.target.value)}>
            <option value="">선택</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.id.slice(0, 8)})</option>
            ))}
          </select>
        </label>

        <div className="grid gap-2 md:grid-cols-2">
          {slider('신뢰도', trust, setTrust, '서로를 얼마나 믿는가 (0에 가까울수록 불신, 1에 가까울수록 깊은 신뢰)')}
          {slider('긴장도', tension, setTension, '대화만 해도 날이 서는 정도, 갈등의 즉각적인 압박감')}
          {slider('적대감', hostility, setHostility, '감정적으로 또는 이해관계적으로 얼마나 반감을 갖는가')}
          {slider('의존도', dependency, setDependency, '상대 없이는 원하는 행동을 하기 어려운 정도')}
          {slider('이용 가치', utilityValue, setUtilityValue, '감정과 별개로, 상대를 얼마나 쓸모 있는 존재로 보는가')}
          {slider('감시 수준', surveillanceLevel, setSurveillanceLevel, '상대를 얼마나 의심하고 주시하는가')}
          {slider('배신 위험', betrayalRisk, setBetrayalRisk, '언제든 돌아설 수 있다고 느끼는 정도')}
        </div>

        <label className="block text-sm">
          공유 비밀
          <input value={sharedSecret} onChange={(e) => setSharedSecret(e.target.value)} placeholder="예) 둘만 알고 있는 사건 은폐 기록" className="mt-1 w-full rounded-xl border border-border bg-panel px-3 py-2" />
          <HelperText show={showHelp}>둘만 알고 있는 비밀이나 약점, 공범 관계의 핵심입니다.</HelperText>
        </label>

        <div className="flex gap-2">
          <button className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-slate-950">관계 저장</button>
          <button type="button" className="rounded-xl bg-panel px-3 py-2 text-xs" onClick={onUpdate}>관계 업데이트</button>
        </div>
      </form>

      {message && <p className="text-xs text-emerald-300">{message}</p>}
    </section>
  );
}
