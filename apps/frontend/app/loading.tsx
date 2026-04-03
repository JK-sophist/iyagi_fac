export default function Loading() {
  return (
    <div className="space-y-4" aria-label="loading state">
      <div className="skeleton h-20" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="skeleton h-48" />
        <div className="skeleton h-48" />
      </div>
      <div className="skeleton h-56" />
    </div>
  );
}
