export function ProjectSummaryPanel({ project }: { project: any }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft" aria-label="project summary panel">
      <h3 className="mb-2 text-sm font-semibold">프로젝트 요약</h3>
      <p className="text-xs text-slate-300">제목: {project?.title}</p>
      <p className="text-xs text-slate-400">세계관 버전 수: {project?.world_settings?.length ?? 0}</p>
      <p className="text-xs text-slate-400">결말 목표 수: {project?.ending_goals?.length ?? 0}</p>
      <p className="text-xs text-slate-400">캐릭터 수: {project?.character_ids?.length ?? 0}</p>
      <p className="text-xs text-slate-400">관계 수: {project?.relationships?.length ?? 0}</p>
    </section>
  );
}
