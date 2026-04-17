import Link from 'next/link';

import { ProjectSummaryPanel } from '@/components/project-summary-panel';
import { typography } from '@/lib/tokens';
import { apiGet } from '@/lib/api';

export default async function ProjectsPage() {
  const res = await apiGet<{ items: any[] }>('/projects');
  const items = res.data.items;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className={typography.pageTitle}>프로젝트 목록</h1>
        <Link href="/projects/new" className="btn-primary">새 프로젝트 생성</Link>
      </div>

      {!items.length ? (
        <div className="empty-state">
          프로젝트가 없습니다. <Link href="/projects/new" className="text-accent underline">첫 프로젝트를 생성</Link>해 주세요.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block">
              <ProjectSummaryPanel project={project} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
