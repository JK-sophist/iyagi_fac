'use client';

import { FormEvent, useEffect, useState } from 'react';

import { apiGet, apiPost, apiPut } from '@/lib/api';

type CharacterForm = {
  name: string;
  archetype: string;
  surface_goal: string;
  hidden_goal: string;
  short_term_goal: string;
  long_term_goal: string;
  fear_or_taboo: string;
  leverage: string;
  secret: string;
  speaking_style_note: string;
  writer_note: string;
};

const emptyForm: CharacterForm = {
  name: '',
  archetype: '',
  surface_goal: '',
  hidden_goal: '',
  short_term_goal: '',
  long_term_goal: '',
  fear_or_taboo: '',
  leverage: '',
  secret: '',
  speaking_style_note: '',
  writer_note: ''
};

export default function CharactersPage({ params }: { params: { projectId: string } }) {
  const [form, setForm] = useState<CharacterForm>(emptyForm);
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');

  const loadProject = async () => {
    const project = await apiGet<any>(`/projects/${params.projectId}`);
    const ids = project.data.character_ids ?? [];
    const items = await Promise.all(ids.map((id: string) => apiGet<any>(`/characters/${id}`).then((r) => r.data).catch(() => null)));
    setCharacters(items.filter(Boolean));
  };

  useEffect(() => {
    loadProject();
  }, []);

  useEffect(() => {
    const target = characters.find((c) => c.id === selectedId);
    if (!target) return;
    setForm({
      name: target.name ?? '',
      archetype: target.archetype ?? '',
      surface_goal: target.surface_goal ?? '',
      hidden_goal: target.hidden_goal ?? '',
      short_term_goal: target.short_term_goal ?? '',
      long_term_goal: target.long_term_goal ?? '',
      fear_or_taboo: target.fear_or_taboo ?? '',
      leverage: target.leverage ?? '',
      secret: target.secret ?? '',
      speaking_style_note: target.speaking_style_note ?? '',
      writer_note: target.writer_note ?? ''
    });
  }, [selectedId, characters]);

  const createCharacter = async (e: FormEvent) => {
    e.preventDefault();
    const res = await apiPost<any>(`/projects/${params.projectId}/characters`, { ...form, is_introduced: false });
    setMessage(`캐릭터 생성 완료: ${res.data.name}`);
    setSelectedId(res.data.id);
    await loadProject();
  };

  const updateCharacter = async () => {
    if (!selectedId) return;
    await apiPut<any>(`/characters/${selectedId}`, { ...form, effective_from_scene_no: 1 });
    setMessage('캐릭터 목표/메모 수정 완료');
    await loadProject();
  };

  const onChange = (key: keyof CharacterForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">캐릭터 편집 (목표 중심)</h1>
      <p className="text-xs text-slate-400">표면 목표/숨은 목표/단기·장기 목표를 분리해 입력하면 목표 충돌 기반 후보 생성 품질이 좋아집니다.</p>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <label className="text-xs">편집할 캐릭터 선택</label>
        <select className="mt-1 w-full rounded-xl border border-border bg-panel px-3 py-2" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">(신규 생성 모드)</option>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.id.slice(0, 8)})</option>
          ))}
        </select>
      </div>

      <form onSubmit={createCharacter} className="rounded-2xl border border-border bg-card p-4 shadow-soft space-y-3">
        <input className="w-full rounded-xl border border-border bg-panel px-3 py-2" placeholder="이름" value={form.name} onChange={(e) => onChange('name', e.target.value)} required />
        <input className="w-full rounded-xl border border-border bg-panel px-3 py-2" placeholder="아키타입" value={form.archetype} onChange={(e) => onChange('archetype', e.target.value)} />
        <input className="w-full rounded-xl border border-border bg-panel px-3 py-2" placeholder="surface_goal" value={form.surface_goal} onChange={(e) => onChange('surface_goal', e.target.value)} />
        <input className="w-full rounded-xl border border-border bg-panel px-3 py-2" placeholder="hidden_goal" value={form.hidden_goal} onChange={(e) => onChange('hidden_goal', e.target.value)} />
        <input className="w-full rounded-xl border border-border bg-panel px-3 py-2" placeholder="short_term_goal" value={form.short_term_goal} onChange={(e) => onChange('short_term_goal', e.target.value)} />
        <input className="w-full rounded-xl border border-border bg-panel px-3 py-2" placeholder="long_term_goal" value={form.long_term_goal} onChange={(e) => onChange('long_term_goal', e.target.value)} />
        <input className="w-full rounded-xl border border-border bg-panel px-3 py-2" placeholder="fear_or_taboo" value={form.fear_or_taboo} onChange={(e) => onChange('fear_or_taboo', e.target.value)} />
        <input className="w-full rounded-xl border border-border bg-panel px-3 py-2" placeholder="leverage" value={form.leverage} onChange={(e) => onChange('leverage', e.target.value)} />
        <input className="w-full rounded-xl border border-border bg-panel px-3 py-2" placeholder="secret" value={form.secret} onChange={(e) => onChange('secret', e.target.value)} />
        <input className="w-full rounded-xl border border-border bg-panel px-3 py-2" placeholder="speaking_style_note" value={form.speaking_style_note} onChange={(e) => onChange('speaking_style_note', e.target.value)} />
        <textarea className="w-full rounded-xl border border-border bg-panel px-3 py-2" placeholder="writer_note" value={form.writer_note} onChange={(e) => onChange('writer_note', e.target.value)} />

        <div className="flex flex-wrap gap-2 text-xs">
          <button className="rounded-xl bg-accent px-3 py-2 font-semibold text-slate-950">캐릭터 생성</button>
          <button type="button" className="rounded-xl bg-panel px-3 py-2" onClick={updateCharacter} disabled={!selectedId}>선택 캐릭터 업데이트</button>
        </div>
      </form>

      {characters.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h2 className="mb-2 text-sm font-semibold">인물 목표 / 충돌 관찰용 요약</h2>
          <ul className="space-y-2 text-xs">
            {characters.map((c) => (
              <li key={c.id} className="rounded-xl border border-border bg-panel p-3">
                <p className="font-semibold">{c.name}</p>
                <p>surface: {c.surface_goal || '-'}</p>
                <p>hidden: {c.hidden_goal || '-'}</p>
                <p>short-term: {c.short_term_goal || '-'}</p>
                <p>long-term: {c.long_term_goal || '-'}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {message && <p className="text-xs text-emerald-300">{message}</p>}
    </section>
  );
}
