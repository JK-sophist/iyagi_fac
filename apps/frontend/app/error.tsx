'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5" role="alert">
      <h2 className="mb-2 text-sm font-semibold text-red-300">요청 처리 중 오류가 발생했습니다.</h2>
      <p className="mb-4 text-xs text-red-200">{error.message}</p>
      <button onClick={reset} className="rounded-xl border border-red-400/40 bg-red-500/20 px-3 py-2 text-xs text-red-100">
        다시 시도
      </button>
    </div>
  );
}
