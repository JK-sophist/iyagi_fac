'use client';

import { FormEvent, useEffect, useState } from 'react';

import { apiGet, apiPost } from '@/lib/api';

export default function WriterWorkbenchPage({ params }: { params: { projectId: string } }) {
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [memos, setMemos] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const res = await apiGet<{ items: any[] }>(`/projects/${params.projectId}/writer-memos`);
    setMemos(res.data.items);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const tags = tagInput
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
    await apiPost(`/projects/${params.projectId}/writer-memos`, { content, tags });
    setContent('');
    setTagInput('');
    setMessage('메모를 저장했습니다.');
    await load();
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h1 className="mb-2 text-lg font-semibold">작가 자유 메모</h1>
        <p className="text-xs text-slate-400">아이디어, 떡밥, 설정 충돌 후보를 자유롭게 기록해두세요.</p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <label className="block text-xs text-slate-300">메모</label>
        <textarea
          className="mt-1 w-full rounded-xl border border-border bg-panel px-3 py-2 text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <label className="mt-3 block text-xs text-slate-300">태그 (쉼표 구분)</label>
        <input
          className="mt-1 w-full rounded-xl border border-border bg-panel px-3 py-2 text-sm"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="ex) chapter2, foreshadowing"
        />
        <button className="mt-3 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-slate-950">메모 저장</button>
        {message && <p className="mt-2 text-xs text-emerald-300">{message}</p>}
      </form>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h2 className="mb-2 text-sm font-semibold">저장된 메모</h2>
        {memos.length === 0 ? (
          <p className="text-xs text-slate-400">아직 메모가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {memos.map((memo) => (
              <li key={memo.id} className="rounded-xl border border-border bg-panel p-3 text-xs">
                <p>{memo.content}</p>
                <p className="mt-1 text-[11px] text-slate-400">tags: {(memo.tags ?? []).join(', ') || '-'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
