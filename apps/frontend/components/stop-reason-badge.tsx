import { statusColor } from '@/lib/tokens';

type Props = { reason?: string | null };

const colorByReason = (reason?: string | null) => {
  if (!reason) return statusColor.stable;
  if (reason.includes('risk') || reason.includes('collapse')) return statusColor.danger;
  if (reason.includes('important') || reason.includes('limit')) return statusColor.warning;
  return statusColor.checkpoint;
};

export function StopReasonBadge({ reason }: Props) {
  return (
    <span aria-label="stop reason" className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${colorByReason(reason)}`}>
      {reason ?? 'none'}
    </span>
  );
}
