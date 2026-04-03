import { StopReasonBadge } from '@/components/stop-reason-badge';
import { typography } from '@/lib/tokens';

type Props = {
  sceneNo: number;
  phase: string;
  stopReason?: string | null;
  introducedCount: number;
};

export function SessionStatusBar({ sceneNo, phase, stopReason, introducedCount }: Props) {
  return (
    <section className="card-strong p-5" aria-label="session status bar">
      <div className="mb-3 flex items-center justify-between">
        <h2 className={typography.sectionHeading}>현재 세션 상태</h2>
        <StopReasonBadge reason={stopReason} />
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div>
          <p className="text-xs text-slate-400">현재 Scene</p>
          <p className="text-2xl font-semibold">#{sceneNo}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Current Phase</p>
          <p className="text-sm font-medium">{phase}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Introduced</p>
          <p className="text-sm font-medium">{introducedCount} 명</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Operator Control</p>
          <p className="text-sm text-emerald-300">사용자 승인 대기</p>
        </div>
      </div>
    </section>
  );
}
