import Link from 'next/link';

export default function LandingPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl border border-border bg-card p-10 shadow-soft">
        <span className="mb-3 inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300">Demo / 로그인 없음</span>
        <h1 className="mb-3 text-3xl font-semibold">반자동 서사 시뮬레이터</h1>
        <p className="mb-6 text-sm text-slate-300">
          사용자는 작가이자 감독이며, AI는 다음 장면 후보를 제안하는 조수입니다. 장면 실행 후 시스템은 반드시 멈추고 사용자 선택을 기다립니다.
        </p>
        <div className="flex gap-3">
          <Link href="/projects" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950">
            프로젝트 목록 보기
          </Link>
          <Link href="/projects/new" className="rounded-xl bg-panel px-4 py-2 text-sm">
            새 프로젝트 만들기
          </Link>
        </div>
      </div>
    </section>
  );
}
