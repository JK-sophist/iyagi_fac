'use client';

import { useState } from 'react';

type Props = {
  preview: { can_apply: boolean; recommended_mode: string; current_scene_no: number } | null;
  warnings: string[];
  onApply: (mode: 'future_only' | 'branch_from_checkpoint' | 'overwrite_current_session') => void;
};

export function SettingsChangePreviewDialog({ preview, warnings, onApply }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button className="rounded-xl bg-panel px-3 py-2 text-xs" onClick={() => setOpen(true)}>변경 미리보기</button>
      {open && (
        <div role="dialog" aria-label="settings preview" className="mt-2 rounded-2xl border border-border bg-card p-4">
          <h4 className="mb-2 text-sm font-semibold">설정 변경 Preview</h4>
          <p className="text-xs">변경 요약: current scene #{preview?.current_scene_no ?? '-'}</p>
          <p className="text-xs">미래 반영 권장 모드: {preview?.recommended_mode ?? '-'}</p>
          <ul className="my-2 list-disc pl-5 text-xs text-amber-300">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button className="rounded bg-emerald-500/20 px-2 py-1 text-xs" onClick={() => onApply('future_only')}>future_only 적용</button>
            <button className="rounded bg-indigo-500/20 px-2 py-1 text-xs" onClick={() => onApply('branch_from_checkpoint')}>분기 적용</button>
            <button className="rounded bg-red-500/20 px-2 py-1 text-xs" onClick={() => onApply('overwrite_current_session')}>overwrite 적용</button>
          </div>
        </div>
      )}
    </div>
  );
}
