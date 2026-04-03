'use client';

import { useEffect, useState } from 'react';

import { BranchActionDialog } from '@/components/branch-action-dialog';
import { CheckpointCard } from '@/components/checkpoint-card';
import { apiGet, apiPost } from '@/lib/api';

export default function CheckpointsPage({ params }: { params: { sessionId: string } }) {
  const [items, setItems] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const res = await apiGet<{ items: any[] }>(`/sessions/${params.sessionId}/checkpoints`);
    setItems(res.data.items);
  };

  useEffect(() => {
    load();
  }, []);

  const saveNow = async () => {
    await apiPost(`/sessions/${params.sessionId}/checkpoints`, { label: `manual_${Date.now()}` });
    setMessage('체크포인트 저장 완료');
    await load();
  };

  const restore = async (id: string) => {
    await apiPost(`/checkpoints/${id}/restore`);
    setMessage('복원 완료');
  };

  const branch = async (id: string) => {
    await apiPost(`/checkpoints/${id}/branch`, { branch_label: 'branch_ui' });
    setMessage('새 분기 생성 완료');
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">체크포인트 / 분기</h1>
        <button onClick={saveNow} className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-slate-950">현재 시점 저장</button>
      </div>

      <BranchActionDialog onConfirm={() => setMessage('분기 라벨 입력 완료')} />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-xs text-slate-400">체크포인트가 없습니다.</div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {items.map((cp) => (
            <CheckpointCard key={cp.id} cp={cp} onRestore={restore} onBranch={branch} />
          ))}
        </div>
      )}

      {message && <p className="text-xs text-emerald-300">{message}</p>}
    </section>
  );
}
