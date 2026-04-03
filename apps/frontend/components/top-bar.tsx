export function TopBar({ projectName, currentSession }: { projectName?: string; currentSession?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-panel/80 px-6 py-3 backdrop-blur">
      <div>
        <p className="text-xs text-slate-400">프로젝트</p>
        <p className="text-sm font-semibold">{projectName ?? '선택되지 않음'}</p>
      </div>
      <div>
        <p className="text-xs text-slate-400">현재 세션</p>
        <p className="text-sm">{currentSession ?? '-'}</p>
      </div>
      <div>
        <p className="text-xs text-slate-400">남은 포인트(placeholder)</p>
        <p className="text-sm text-emerald-300">120</p>
      </div>
    </header>
  );
}
