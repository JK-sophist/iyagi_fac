import { typography } from '@/lib/tokens';

export function ProjectSummaryPanel({ project }: { project: any }) {
  return (
    <section className="card-shell p-5" aria-label="project summary panel">
      <h3 className={typography.cardTitle}>{project?.title}</h3>
      <p className="mt-1 text-xs text-slate-400">{project?.description ?? '설명 없음'}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <span className="rounded-xl bg-panel px-2 py-1">세계관 버전: {project?.world_settings?.length ?? 0}</span>
        <span className="rounded-xl bg-panel px-2 py-1">결말 목표: {project?.ending_goals?.length ?? 0}</span>
        <span className="rounded-xl bg-panel px-2 py-1">캐릭터: {project?.character_ids?.length ?? 0}</span>
        <span className="rounded-xl bg-panel px-2 py-1">관계: {project?.relationships?.length ?? 0}</span>
      </div>
    </section>
  );
}
