'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

import { HelpToggle, HelperText } from '@/components/form-help';
import { apiGet, apiPost, apiPut } from '@/lib/api';

type CharacterForm = {
  name: string;
  archetype: string;
  surface_goal: string;
  hidden_goal: string;
  short_term_goal: string;
  long_term_goal: string;
  fear_or_taboo: string;
  leverage: string;
  secret: string;
  speaking_style_note: string;
  writer_note: string;
};

const emptyForm: CharacterForm = {
  name: '',
  archetype: '',
  surface_goal: '',
  hidden_goal: '',
  short_term_goal: '',
  long_term_goal: '',
  fear_or_taboo: '',
  leverage: '',
  secret: '',
  speaking_style_note: '',
  writer_note: ''
};

const fieldMeta: Array<{ key: keyof CharacterForm; label: string; placeholder: string; helper: string; multiline?: boolean }> = [
  { key: 'name', label: '이름', placeholder: '예) 허준기', helper: '인물의 이름입니다.' },
  { key: 'archetype', label: '인물 유형', placeholder: '예) 냉정한 전략가, 이상주의 해커, 현실적인 생존자', helper: '이 인물이 어떤 타입의 사람인지 한 줄로 정리합니다.' },
  { key: 'surface_goal', label: '겉으로 드러난 목표', placeholder: '예) 조직을 지킨다, 사건을 해결한다', helper: '다른 인물들이 보기에도 드러나는 공식적인 목표입니다.' },
  { key: 'hidden_goal', label: '실제 목표', placeholder: '예) 권력을 잡는다, A와 접촉한다, 조직을 무너뜨린다', helper: '겉으로는 숨기지만 실제로 원하는 목적입니다.' },
  { key: 'short_term_goal', label: '지금 당장 이루려는 목표', placeholder: '예) 팀장의 의심을 피한다, 비밀 파일을 확보한다', helper: '현재 장면들에서 가장 직접적으로 이 인물을 움직이게 만드는 목표입니다.' },
  { key: 'long_term_goal', label: '장기 목표', placeholder: '예) 인간 사회를 떠난다, 지배 체제의 핵심에 올라간다', helper: '이야기 전체에서 끝까지 밀고 가는 큰 목표입니다.' },
  { key: 'fear_or_taboo', label: '두려움 또는 금기', placeholder: '예) 정체가 드러나는 것, 무력하게 남는 것', helper: '반드시 피하고 싶어하는 것 또는 넘고 싶지 않은 선입니다.' },
  { key: 'leverage', label: '타인을 움직이는 수단', placeholder: '예) 정보력, 기술력, 협박거리, 매력', helper: '다른 사람을 설득하거나 압박할 때 쓰는 무기입니다.' },
  { key: 'secret', label: '숨기고 있는 비밀', placeholder: '예) 이미 A와 접촉했다, 기록을 조작했다', helper: '아직 다른 인물들에게 들키지 않은 핵심 비밀입니다.' },
  { key: 'speaking_style_note', label: '말투 메모', placeholder: '예) 짧고 차갑게 말함, 비꼬는 어조, 감정 숨김', helper: '대사 생성 시 참고할 말투와 표현 습관입니다.' },
  { key: 'writer_note', label: '작가 메모', placeholder: '예) 초반엔 충직하지만 후반에 배신 가능성 높음', helper: '작가가 따로 기록해두는 참고 메모입니다.', multiline: true }
];

export default function CharactersPage({ params }: { params: { projectId: string } }) {
  const [form, setForm] = useState<CharacterForm>(emptyForm);
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');
  const [showHelp, setShowHelp] = useState(true);

  const loadProject = async () => {
    const project = await apiGet<any>(`/projects/${params.projectId}`);
    const ids = project.data.character_ids ?? [];
    const items = await Promise.all(ids.map((id: string) => apiGet<any>(`/characters/${id}`).then((r) => r.data).catch(() => null)));
    setCharacters(items.filter(Boolean));
  };

  useEffect(() => {
    loadProject();
  }, []);

  useEffect(() => {
    const target = characters.find((c) => c.id === selectedId);
    if (!target) return;
    setForm({
      name: target.name ?? '',
      archetype: target.archetype ?? '',
      surface_goal: target.surface_goal ?? '',
      hidden_goal: target.hidden_goal ?? '',
      short_term_goal: target.short_term_goal ?? '',
      long_term_goal: target.long_term_goal ?? '',
      fear_or_taboo: target.fear_or_taboo ?? '',
      leverage: target.leverage ?? '',
      secret: target.secret ?? '',
      speaking_style_note: target.speaking_style_note ?? '',
      writer_note: target.writer_note ?? ''
    });
  }, [selectedId, characters]);

  const createCharacter = async (e: FormEvent) => {
    e.preventDefault();
    const res = await apiPost<any>(`/projects/${params.projectId}/characters`, { ...form, is_introduced: false });
    setMessage(`캐릭터 생성 완료: ${res.data.name}`);
    setSelectedId(res.data.id);
    await loadProject();
  };

  const updateCharacter = async () => {
    if (!selectedId) return;
    await apiPut<any>(`/characters/${selectedId}`, { ...form, effective_from_scene_no: 1 });
    setMessage('선택한 캐릭터 정보를 수정했습니다.');
    await loadProject();
  };

  const onChange = (key: keyof CharacterForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">캐릭터 설정</h1>
          <p className="text-xs text-slate-400">작가가 이해하기 쉬운 설명형 입력으로 인물의 목표/비밀 구조를 정리합니다.</p>
        </div>
        <HelpToggle show={showHelp} onToggle={() => setShowHelp((prev) => !prev)} />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Link href={`/projects/${params.projectId}`} className="rounded-lg bg-panel px-3 py-2">프로젝트로 돌아가기</Link>
        <Link href="/projects" className="rounded-lg bg-panel px-3 py-2">프로젝트 목록</Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <label className="text-xs">수정할 캐릭터 선택</label>
        <select className="mt-1 w-full rounded-xl border border-border bg-panel px-3 py-2" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          <option value="">(새 캐릭터 만들기)</option>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.id.slice(0, 8)})</option>
          ))}
        </select>
        <HelperText show={showHelp}>기존 캐릭터를 선택하면 아래 입력칸이 자동으로 채워집니다.</HelperText>
      </div>

      <form onSubmit={createCharacter} className="rounded-2xl border border-border bg-card p-4 shadow-soft space-y-4">
        {fieldMeta.map((field) => (
          <label key={field.key} className="block text-sm">
            <span className="font-medium">{field.label}</span>
            {field.multiline ? (
              <textarea className="mt-1 w-full rounded-xl border border-border bg-panel px-3 py-2" placeholder={field.placeholder} value={form[field.key]} onChange={(e) => onChange(field.key, e.target.value)} />
            ) : (
              <input className="mt-1 w-full rounded-xl border border-border bg-panel px-3 py-2" placeholder={field.placeholder} value={form[field.key]} onChange={(e) => onChange(field.key, e.target.value)} required={field.key === 'name'} />
            )}
            <HelperText show={showHelp}>{field.helper}</HelperText>
          </label>
        ))}

        <div className="flex flex-wrap gap-2 text-xs">
          <button className="rounded-xl bg-accent px-3 py-2 font-semibold text-slate-950">새 캐릭터 저장</button>
          <button type="button" className="rounded-xl bg-panel px-3 py-2" onClick={updateCharacter} disabled={!selectedId}>선택 캐릭터 수정</button>
        </div>
      </form>

      {characters.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h2 className="mb-2 text-sm font-semibold">인물 목표 요약</h2>
          <ul className="space-y-2 text-xs">
            {characters.map((c) => (
              <li key={c.id} className="rounded-xl border border-border bg-panel p-3">
                <p className="font-semibold">{c.name}</p>
                <p>겉 목표: {c.surface_goal || '-'}</p>
                <p>실제 목표: {c.hidden_goal || '-'}</p>
                <p>지금 목표: {c.short_term_goal || '-'}</p>
                <p>장기 목표: {c.long_term_goal || '-'}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {message && <p className="text-xs text-emerald-300">{message}</p>}
    </section>
  );
}
