'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { SceneLogTabs } from '@/components/scene-log-tabs';
import { apiGet, apiPut } from '@/lib/api';

export default function SceneDetailPage({ params }: { params: { sceneId: string } }) {
  const [scene, setScene] = useState<any>(null);
  const [sceneStatus, setSceneStatus] = useState<'adopted' | 'on_hold' | 'discarded'>('on_hold');
  const [writerMemo, setWriterMemo] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<any>(`/scenes/${params.sceneId}`)
      .then((r) => {
        setScene(r.data);
        setSceneStatus(r.data.scene_status ?? 'on_hold');
        setWriterMemo(r.data.writer_memo ?? '');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'error'));
  }, [params.sceneId]);

  const saveReview = async () => {
    const res = await apiPut<any>(`/scenes/${params.sceneId}/review`, {
      scene_status: sceneStatus,
      writer_memo: writerMemo
    });
    setScene(res.data);
    setMessage('장면 상태와 메모를 저장했습니다.');
  };

  if (error) return <p className="text-xs text-red-300">{error}</p>;
  if (!scene) return <div className="skeleton h-48" />;

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h1 className="text-lg font-semibold">{scene.title}</h1>
        <p className="text-xs text-slate-400">scene #{scene.scene_no}</p>
      </header>

      <SceneLogTabs scene={scene} />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h3 className="mb-2 text-sm font-semibold">상태 변화 패널</h3>
        <pre className="overflow-auto text-xs">{JSON.stringify(scene.state_delta, null, 2)}</pre>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h3 className="mb-2 text-sm font-semibold">이 장면의 목표 충돌 / 계략 가능성</h3>
        <ul className="space-y-1 text-xs">
          {(scene.goal_conflicts ?? []).map((conflict: any, idx: number) => (
            <li key={idx}>- {conflict.actor}({conflict.actor_goal}) ↔ {conflict.rival}({conflict.rival_goal})</li>
          ))}
          {(!scene.goal_conflicts || scene.goal_conflicts.length === 0) && <li>- 기록된 충돌 정보가 없습니다.</li>}
        </ul>
        {(scene.scheme_opportunities ?? []).length > 0 && (
          <p className="mt-2 text-xs text-slate-300">계략/협상/은폐/유혹 후보: {(scene.scheme_opportunities ?? []).join(' · ')}</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h3 className="mb-2 text-sm font-semibold">관련 캐릭터 카드</h3>
        <div className="flex flex-wrap gap-2">
          {scene.participants.map((p: string) => (
            <span key={p} className="rounded-full bg-panel px-3 py-1 text-xs">{p}</span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h3 className="mb-2 text-sm font-semibold">작가 메모 / 장면 상태</h3>
        <div className="grid gap-3">
          <select
            className="rounded-xl border border-border bg-panel px-3 py-2 text-sm"
            value={sceneStatus}
            onChange={(e) => setSceneStatus(e.target.value as 'adopted' | 'on_hold' | 'discarded')}
          >
            <option value="adopted">채택</option>
            <option value="on_hold">보류</option>
            <option value="discarded">폐기</option>
          </select>
          <textarea
            className="rounded-xl border border-border bg-panel px-3 py-2 text-sm"
            value={writerMemo}
            onChange={(e) => setWriterMemo(e.target.value)}
            placeholder="이 장면에 대한 작가 메모를 남겨두세요."
          />
          <button className="btn-primary w-fit text-xs" onClick={saveReview}>상태/메모 저장</button>
          {message && <p className="text-xs text-emerald-300">{message}</p>}
        </div>
      </section>

      <div className="flex flex-wrap gap-2 text-xs">
        <Link href={`/sessions/${scene.session_id}`} className="rounded-lg bg-panel px-3 py-2">세션 진행으로 돌아가기</Link>
        <Link href={`/sessions/${scene.session_id}/checkpoints`} className="rounded-lg bg-indigo-500/20 px-3 py-2 text-indigo-300">체크포인트/분기 열기</Link>
        <Link href="/projects" className="rounded-lg bg-red-500/20 px-3 py-2 text-red-300">프로젝트 목록</Link>
      </div>
    </section>
  );
}
