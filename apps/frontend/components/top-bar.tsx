export function TopBar({ projectName, currentSession }: { projectName?: string; currentSession?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-panel/80 px-8 py-4 backdrop-blur">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-500">프로젝트</p>
        <p className="text-sm font-semibold">{projectName ?? '선택되지 않음'}</p>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-500">현재 세션</p>
        <p className="text-sm">{currentSession ?? '-'}</p>
      </div>
      <p className="text-xs text-slate-400">개인용 작가 워크벤치 · 자동 결말/자동 챕터 없음</p>
    </header>
  );
}
