'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { apiDelete } from '@/lib/api';

type SessionItem = {
  id: string;
  branch_label?: string | null;
  scene_count?: number;
  stopped_reason?: string | null;
};

export function ProjectSessionManager({ projectId, sessions }: { projectId: string; sessions: SessionItem[] }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const deleteProject = async () => {
    if (!confirm('이 프로젝트와 관련된 세션/장면/메모를 모두 삭제합니다. 계속할까요?')) return;
    setBusyId('project');
    try {
      await apiDelete(`/projects/${projectId}`);
      router.push('/projects');
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '프로젝트 삭제 실패');
    } finally {
      setBusyId(null);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('이 세션과 연결된 장면/체크포인트를 삭제합니다. 계속할까요?')) return;
    setBusyId(sessionId);
    try {
      await apiDelete(`/sessions/${sessionId}`);
      setMessage('세션을 삭제했습니다.');
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '세션 삭제 실패');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">진행 중인 세션</h3>
          <p className="text-xs text-slate-400">이미 만든 세션을 이어서 진행하거나, 불필요한 세션을 정리할 수 있습니다.</p>
        </div>
        <button
          type="button"
          onClick={deleteProject}
          disabled={busyId === 'project'}
          className="rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-300 disabled:opacity-60"
        >
          프로젝트 삭제
        </button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-xs text-slate-400">아직 생성된 세션이 없습니다. 아래의 세션 시작 버튼으로 첫 세션을 만드세요.</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((session) => (
            <li key={session.id} className="rounded-xl border border-border bg-panel p-3 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">세션 {session.id.slice(0, 8)}</p>
                  <p className="text-slate-400">라벨: {session.branch_label || 'main'} · 장면 수: {session.scene_count ?? 0}</p>
                  <p className="text-slate-500">상태: {session.stopped_reason || '-'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/sessions/${session.id}`} className="rounded-lg bg-accent px-3 py-2 text-slate-950">
                    이어서 하기
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteSession(session.id)}
                    disabled={busyId === session.id}
                    className="rounded-lg bg-red-500/20 px-3 py-2 text-red-300 disabled:opacity-60"
                  >
                    세션 삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {message && <p className="mt-3 text-xs text-emerald-300">{message}</p>}
    </div>
  );
}
