import Link from 'next/link';

import { ProjectSummaryPanel } from '@/components/project-summary-panel';
import { apiGet } from '@/lib/api';

export default async function ProjectsPage() {
  const res = await apiGet<{ items: any[] }>('/projects');
  const items = res.data.items;

  if (!items.length) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4">프로젝트가 없습니다.</div>
        <Link href="/projects/new" className="inline-block rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950">
          새 프로젝트 생성
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">프로젝트 목록</h1>
        <Link href="/projects/new" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950">
          새 프로젝트 생성
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`} className="block">
            <ProjectSummaryPanel project={project} />
          </Link>
        ))}
      </div>
    </section>
  );
}
