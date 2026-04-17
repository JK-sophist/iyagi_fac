import Link from 'next/link';

export default function LandingPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl border border-border bg-card p-10 shadow-soft">
        <span className="mb-3 inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300">개인용 워크벤치 / 로그인 없음</span>
        <h1 className="mb-3 text-3xl font-semibold">개인용 작가 워크벤치</h1>
        <p className="mb-6 text-sm text-slate-300">
          이 도구는 자동 소설 생성기가 아니라 개인 글쓰기 보조 도구입니다. 작가는 세계관, 캐릭터, 분기, 체크포인트를 관리하고 AI 제안을 참고해 다음 장면을 선택합니다.
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
