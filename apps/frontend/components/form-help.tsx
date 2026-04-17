'use client';

export function HelpToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="rounded-lg bg-panel px-3 py-2 text-xs">
      {show ? '설명 숨기기' : '설명 보기'}
    </button>
  );
}

export function HelperText({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return <p className="mt-1 text-[11px] text-slate-400">{children}</p>;
}
