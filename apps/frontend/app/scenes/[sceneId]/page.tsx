'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { SceneLogTabs } from '@/components/scene-log-tabs';
import { apiGet } from '@/lib/api';

export default function SceneDetailPage({ params }: { params: { sceneId: string } }) {
  const [scene, setScene] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<any>(`/scenes/${params.sceneId}`)
      .then((r) => setScene(r.data))
      .catch((e) => setError(e instanceof Error ? e.message : 'error'));
  }, [params.sceneId]);

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
        <h3 className="mb-2 text-sm font-semibold">관련 캐릭터 카드</h3>
        <div className="flex flex-wrap gap-2">
          {scene.participants.map((p: string) => (
            <span key={p} className="rounded-full bg-panel px-3 py-1 text-xs">{p}</span>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2 text-xs">
        <button className="rounded-lg bg-emerald-500/20 px-3 py-2 text-emerald-300">이 장면 채택</button>
        <button className="rounded-lg bg-amber-500/20 px-3 py-2 text-amber-300">다시 실행</button>
        <button className="rounded-lg bg-panel px-3 py-2">다른 후보 보기</button>
        <button className="rounded-lg bg-indigo-500/20 px-3 py-2 text-indigo-300">현재 시점 저장</button>
        <Link href="/projects" className="rounded-lg bg-red-500/20 px-3 py-2 text-red-300">세션 종료</Link>
      </div>
    </section>
  );
}
