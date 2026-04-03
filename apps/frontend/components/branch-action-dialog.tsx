'use client';

import { useState } from 'react';

export function BranchActionDialog({ onConfirm }: { onConfirm: (label: string) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('branch_alt');

  if (!open) {
    return (
      <button className="rounded-xl bg-indigo-500/20 px-3 py-2 text-xs text-indigo-300" onClick={() => setOpen(true)}>
        분기 생성 열기
      </button>
    );
  }

  return (
    <div role="dialog" aria-label="branch action" className="rounded-2xl border border-indigo-500/40 bg-panel p-3">
      <p className="mb-2 text-xs">새 분기 라벨</p>
      <input className="mb-2 w-full rounded-lg border border-border bg-card px-2 py-1 text-xs" value={label} onChange={(e) => setLabel(e.target.value)} />
      <div className="flex gap-2">
        <button className="rounded bg-indigo-500/20 px-2 py-1 text-xs" onClick={() => onConfirm(label)}>확인</button>
        <button className="rounded bg-slate-700 px-2 py-1 text-xs" onClick={() => setOpen(false)}>닫기</button>
      </div>
    </div>
  );
}
