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
      <h1 className="mb-2 text-xl font-semibold">새 작업 프로젝트 만들기</h1>
      <p className="mb-4 text-xs text-slate-400">서비스 가입이 아닌, 개인 작업용 세계관/인물 실험 프로젝트를 만드는 단계입니다.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm">
          프로젝트 제목
          <p className="mt-1 text-[11px] text-slate-400">이야기나 실험 작업의 이름을 적습니다.</p>
          <input
            aria-label="project title"
            className="mt-1 w-full rounded-xl border border-border bg-panel px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          프로젝트 설명
          <p className="mt-1 text-[11px] text-slate-400">세계관, 장르, 분위기, 핵심 아이디어를 짧게 적어둡니다.</p>
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
