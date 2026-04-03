'use client';

import { FormEvent, useState } from 'react';

import { SettingsChangePreviewDialog } from '@/components/settings-change-preview-dialog';
import { apiPost, apiPut } from '@/lib/api';

export default function CharactersPage({ params }: { params: { projectId: string } }) {
  const [name, setName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [characterId, setCharacterId] = useState('');

  const createCharacter = async (e: FormEvent) => {
    e.preventDefault();
    const res = await apiPost<any>(`/projects/${params.projectId}/characters`, { name, is_introduced: false });
    setMessage(`생성됨: ${res.data.id}`);
    setCharacterId(res.data.id);
    setName('');
  };

  const archiveCharacter = async () => {
    if (!characterId) return;
    const res = await apiPost<any>(`/characters/${characterId}/archive`);
    setMessage(`archive 완료: ${res.data.id}`);
  };

  const updateCharacter = async () => {
    if (!characterId) return;
    await apiPut<any>(`/characters/${characterId}`, { archetype: 'updated-role', effective_from_scene_no: 2 });
    setMessage('캐릭터 수정 완료');
  };

  const introducePlan = async () => {
    if (!characterId) return;
    await apiPost<any>(`/characters/${characterId}/introduce-plan`, { planned_scene_no: 2, note: '중간 등장 계획' });
    setMessage('introduce plan 저장');
  };

  const loadPreview = async () => {
    if (!sessionId) return;
    const res = await apiPost<any>(`/sessions/${sessionId}/settings-change-preview`, {
      change_type: 'character',
      effective_from_scene_no: 2
    });
    setPreview(res.data);
    setWarnings(res.warnings);
  };

  const applyChange = async (mode: 'future_only' | 'branch_from_checkpoint' | 'overwrite_current_session') => {
    if (!sessionId) return;
    await apiPost<any>(`/sessions/${sessionId}/apply-settings-change`, { mode, effective_from_scene_no: 2 });
    setMessage(`설정 변경 적용: ${mode}`);
  };

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">캐릭터 편집</h1>
      <form onSubmit={createCharacter} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <label className="text-xs">이름</label>
        <input aria-label="new-character-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-panel px-3 py-2" />
        <button className="mt-3 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-slate-950">캐릭터 추가</button>
      </form>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft space-y-2">
        <label className="text-xs">캐릭터 ID</label>
        <input aria-label="character-id" value={characterId} onChange={(e) => setCharacterId(e.target.value)} className="w-full rounded-xl border border-border bg-panel px-3 py-2" />
        <div className="flex flex-wrap gap-2 text-xs">
          <button className="rounded bg-panel px-3 py-2" onClick={updateCharacter}>수정</button>
          <button className="rounded bg-red-500/20 px-3 py-2 text-red-300" onClick={archiveCharacter}>soft delete</button>
          <button className="rounded bg-indigo-500/20 px-3 py-2 text-indigo-300" onClick={introducePlan}>introduce plan</button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft space-y-2">
        <label className="text-xs">세션 ID (preview용)</label>
        <input aria-label="session-id" value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="w-full rounded-xl border border-border bg-panel px-3 py-2" />
        <button className="rounded bg-amber-500/20 px-3 py-2 text-xs text-amber-300" onClick={loadPreview}>변경 preview 불러오기</button>
        <SettingsChangePreviewDialog preview={preview} warnings={warnings} onApply={applyChange} />
      </div>

      {message && <p className="text-xs text-emerald-300">{message}</p>}
    </section>
  );
}
