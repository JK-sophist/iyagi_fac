import Link from 'next/link';

import { ProjectSummaryPanel } from '@/components/project-summary-panel';
import { apiGet } from '@/lib/api';

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const project = await apiGet<any>(`/projects/${params.projectId}`);
  const latestSessionId = project.data.session_ids?.[project.data.session_ids.length - 1];
  const latestSession = latestSessionId ? await apiGet<any>(`/sessions/${latestSessionId}`) : null;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
      <div className="space-y-4">
        <ProjectSummaryPanel project={project.data} />
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h3 className="mb-2 text-sm font-semibold">설정 편집</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link className="rounded-lg bg-panel px-3 py-2" href={`/projects/${params.projectId}/characters`}>캐릭터 편집</Link>
            <Link className="rounded-lg bg-panel px-3 py-2" href={`/projects/${params.projectId}/relationships`}>관계도 편집</Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h3 className="mb-2 text-sm font-semibold">현재 세션 상태</h3>
          <p className="text-xs text-slate-400">세션 시작 후 진행 화면에서 후보 생성/실행을 관리하세요.</p>
          <Link href={`/projects/${params.projectId}/sessions/new`} className="mt-3 inline-block rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-slate-950">
            세션 시작
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h3 className="mb-2 text-sm font-semibold">다음 장면 후보 / 최근 장면</h3>
          <p className="text-xs text-slate-400">세션이 시작되면 이 패널에서 후보 및 최근 장면을 확인합니다.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h3 className="mb-2 text-sm font-semibold">인물 목표 / 충돌 구조</h3>
          {latestSession?.data?.current_major_goal_conflicts?.length ? (
            <ul className="space-y-2 text-xs">
              {latestSession.data.current_major_goal_conflicts.map((conflict: any, idx: number) => (
                <li key={`${conflict.actor}-${idx}`} className="rounded-lg bg-panel px-3 py-2">
                  <p><strong>{conflict.actor}</strong>: {conflict.actor_goal}</p>
                  <p className="text-slate-400">충돌 대상: {conflict.rival} ({conflict.rival_goal})</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">아직 세션 충돌 요약이 없습니다. 세션 시작 후 후보를 생성해보세요.</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h3 className="mb-2 text-sm font-semibold">작가 도구</h3>
          <p className="text-xs text-slate-400">자유 메모를 남기고 현재 프로젝트를 Markdown/TXT로 내보낼 수 있습니다.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link href={`/projects/${params.projectId}/writer`} className="rounded-lg bg-panel px-3 py-2">
              작가 메모 열기
            </Link>
            <a href={`${apiBase}/projects/${params.projectId}/export?format=markdown`} className="rounded-lg bg-panel px-3 py-2">
              Markdown 내보내기
            </a>
            <a href={`${apiBase}/projects/${params.projectId}/export?format=txt`} className="rounded-lg bg-panel px-3 py-2">
              TXT 내보내기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
