'use client';

import { useEffect, useState } from 'react';

import { BranchActionDialog } from '@/components/branch-action-dialog';
import { CheckpointCard } from '@/components/checkpoint-card';
import { typography } from '@/lib/tokens';
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
    <section className="space-y-5">
      <div className="card-strong p-5">
        <div className="flex items-center justify-between">
          <h1 className={typography.sectionHeading}>체크포인트 / 분기 실험</h1>
          <button onClick={saveNow} className="btn-primary text-xs">현재 시점 저장</button>
        </div>
        <p className="mt-2 text-xs text-slate-400">이 프로젝트의 핵심 기능입니다. 복원과 분기 생성을 통해 내러티브 실험을 안전하게 반복하세요.</p>
      </div>

      <BranchActionDialog onConfirm={() => setMessage('분기 라벨 입력 완료')} />

      {items.length === 0 ? (
        <div className="empty-state">체크포인트가 없습니다. 상단 버튼으로 첫 체크포인트를 저장하세요.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((cp) => (
            <CheckpointCard key={cp.id} cp={cp} onRestore={restore} onBranch={branch} />
          ))}
        </div>
      )}

      {message && <p className="text-xs text-emerald-300">{message}</p>}
    </section>
  );
}
