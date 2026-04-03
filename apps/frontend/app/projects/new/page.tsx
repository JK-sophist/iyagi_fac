'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { apiPost } from '@/lib/api';

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiPost<any>('/projects', { title, description });
      router.push(`/projects/${res.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성 실패');
    }
  };

  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h1 className="mb-4 text-xl font-semibold">프로젝트 생성</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          제목
          <input
            aria-label="project title"
            className="mt-1 w-full rounded-xl border border-border bg-panel px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          설명
          <textarea
            aria-label="project description"
            className="mt-1 w-full rounded-xl border border-border bg-panel px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        {error && <p className="text-xs text-red-300">{error}</p>}
        <button className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950">생성</button>
      </form>
    </section>
  );
}
