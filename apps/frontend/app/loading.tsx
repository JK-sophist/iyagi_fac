export default function Loading() {
  return (
    <div className="space-y-3" aria-label="loading state">
      <div className="skeleton h-16" />
      <div className="skeleton h-40" />
      <div className="skeleton h-40" />
    </div>
  );
}
