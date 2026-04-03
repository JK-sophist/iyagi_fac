'use client';

export default function Error({ error }: { error: Error }) {
  return (
    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4" role="alert">
      <h2 className="mb-2 text-sm font-semibold text-red-300">오류가 발생했습니다.</h2>
      <p className="text-xs text-red-200">{error.message}</p>
    </div>
  );
}
