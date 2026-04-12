'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { SceneLogTabs } from '@/components/scene-log-tabs';
import { apiGet, apiPut } from '@/lib/api';

type SceneStatus = 'adopted' | 'on_hold' | 'discarded';

function normalizeSceneStatus(value: unknown): SceneStatus {
  return value === 'adopted' || value === 'discarded' || value === 'on_hold' ? value : 'on_hold';
}

function characterLabel(scene: any, id: string) {
  return scene?.participant_name_map?.[id] ?? id;
}

export default function SceneDetailPage({ params }: { params: { sceneId: string } }) {
  const [scene, setScene] = useState<any>(null);
  const [sceneStatus, setSceneStatus] = useState<SceneStatus>('on_hold');
  const [writerMemo, setWriterMemo] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<any>(`/scenes/${params.sceneId}`)
      .then((r) => {
        setScene(r.data);
        setSceneStatus(normalizeSceneStatus(r.data.scene_status));
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
    setSceneStatus(normalizeSceneStatus(res.data.scene_status));
    setMessage('장면 상태와 메모를 저장했습니다.');
  };

  if (error) return <p className="text-xs text-red-300">{error}</p>;
  if (!scene) return <div className="skeleton h-48" />;

  const relationshipUpdates = scene?.state_delta?.relationship_updates ?? [];
  const emotionUpdates = scene?.state_delta?.emotion_updates ?? [];
  const risk = scene?.state_delta?.risk ?? {};
  const flags = scene?.state_delta?.flags ?? {};

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h1 className="text-lg font-semibold">{scene.title}</h1>
        <p className="text-xs text-slate-400">scene #{scene.scene_no}</p>
      </header>

      <SceneLogTabs scene={scene} />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h3 className="mb-2 text-sm font-semibold">이번 장면에서 달라진 점</h3>
        <div className="space-y-2 text-xs">
          {relationshipUpdates.length === 0 ? (
            <p>인물 사이의 큰 관계 변화는 없었습니다.</p>
          ) : (
            relationshipUpdates.map((item: any, idx: number) => (
              <p key={idx}>{characterLabel(scene, item.pair?.[0])} ↔ {characterLabel(scene, item.pair?.[1])} 관계가 변했습니다. 신뢰도 {item.trust}, 긴장도 {item.tension}{item.betrayal_risk !== undefined ? `, 배신 위험 ${item.betrayal_risk}` : ''}</p>
            ))
          )}
          {emotionUpdates.map((item: any, idx: number) => (
            <p key={`emotion-${idx}`}>{characterLabel(scene, item.character_id)}는 현재 {item.emotion} 상태이며{item.introduced ? ' 이번 장면에서 본격적으로 등장했습니다.' : ' 상태를 유지했습니다.'}</p>
          ))}
          <p>반복 위험 {risk.repetition_risk ?? 0}, 일관성 위험 {risk.consistency_risk ?? 0}</p>
          {Object.keys(flags).length > 0 && <p>추가 처리된 플래그: {Object.keys(flags).join(', ')}</p>}
        </div>
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
          <p className="mt-2 text-xs text-slate-300">계략/협상/은폐/유혹 가능성: {(scene.scheme_opportunities ?? []).join(' · ')}</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h3 className="mb-2 text-sm font-semibold">관련 인물</h3>
        <div className="flex flex-wrap gap-2">
          {(scene.participant_names ?? scene.participants ?? []).map((p: string) => (
            <span key={p} className="rounded-full bg-panel px-3 py-1 text-xs">{p}</span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <h3 className="mb-2 text-sm font-semibold">작가 메모 / 장면 상태</h3>
        <p className="mb-2 text-xs text-slate-400">이 장면을 채택/보류/폐기 중 하나로 정리하고, 다음 분기 판단을 위한 메모를 남기세요.</p>
        <div className="grid gap-3">
          <select className="rounded-xl border border-border bg-panel px-3 py-2 text-sm" value={sceneStatus} onChange={(e) => setSceneStatus(e.target.value as SceneStatus)}>
            <option value="adopted">채택</option>
            <option value="on_hold">보류</option>
            <option value="discarded">폐기</option>
          </select>
          <textarea className="rounded-xl border border-border bg-panel px-3 py-2 text-sm" value={writerMemo} onChange={(e) => setWriterMemo(e.target.value)} placeholder="이 장면에 대한 작가 메모를 남겨두세요." />
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
