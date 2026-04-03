type Props = { reason?: string | null };

const colorByReason = (reason?: string | null) => {
  if (!reason) return 'bg-slate-700 text-slate-200';
  if (reason.includes('risk') || reason.includes('collapse')) return 'bg-red-500/20 text-red-300 border-red-500/40';
  if (reason.includes('important') || reason.includes('limit')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
};

export function StopReasonBadge({ reason }: Props) {
  return (
    <span aria-label="stop reason" className={`rounded-full border px-3 py-1 text-xs font-medium ${colorByReason(reason)}`}>
      {reason ?? 'none'}
    </span>
  );
}
