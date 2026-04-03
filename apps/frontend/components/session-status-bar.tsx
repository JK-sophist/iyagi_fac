import { StopReasonBadge } from '@/components/stop-reason-badge';

type Props = {
  sceneNo: number;
  phase: string;
  stopReason?: string | null;
  introducedCount: number;
};

export function SessionStatusBar({ sceneNo, phase, stopReason, introducedCount }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft" aria-label="session status bar">
      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <p className="text-xs text-slate-400">현재 Scene</p>
          <p className="text-xl font-semibold">#{sceneNo}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Current Phase</p>
          <p className="text-sm font-medium">{phase}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Stop Reason</p>
          <StopReasonBadge reason={stopReason} />
        </div>
        <div>
          <p className="text-xs text-slate-400">Introduced</p>
          <p className="text-sm font-medium">{introducedCount} 명</p>
        </div>
      </div>
    </section>
  );
}
