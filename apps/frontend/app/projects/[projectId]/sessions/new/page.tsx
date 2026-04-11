'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { apiPost } from '@/lib/api';

export default function SessionStartPage({ params }: { params: { projectId: string } }) {
  const [branchLabel, setBranchLabel] = useState('main');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const startSession = async () => {
    try {
      const res = await apiPost<any>(`/projects/${params.projectId}/sessions`, { branch_label: branchLabel });
      router.push(`/sessions/${res.data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '세션 시작 실패');
    }
  };

  return (
    <section className="max-w-xl space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <Link href={`/projects/${params.projectId}`} className="rounded-lg bg-panel px-3 py-2">프로젝트로 돌아가기</Link>
        <Link href="/projects" className="rounded-lg bg-panel px-3 py-2">프로젝트 목록</Link>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h1 className="mb-3 text-xl font-semibold">세션 시작</h1>
        <p className="mb-3 text-xs text-slate-400">시작 후 후보 생성 → 선택 실행 → 사용자 승인 흐름으로 진행됩니다.</p>
        <label className="block text-sm">
          세션 라벨
          <input aria-label="branch label" value={branchLabel} onChange={(e) => setBranchLabel(e.target.value)} className="mt-1 mb-3 w-full rounded-xl border border-border bg-panel px-3 py-2" />
        </label>
        <button className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950" onClick={startSession}>세션 시작</button>
        {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      </section>
    </section>
  );
}
