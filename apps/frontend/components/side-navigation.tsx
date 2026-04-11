import Link from 'next/link';

export function SideNavigation() {
  const nav = [
    { href: '/projects', label: '프로젝트' },
    { href: '/projects/new', label: '새 프로젝트' }
  ];

  return (
    <aside className="min-h-screen border-r border-border bg-panel p-4" aria-label="side navigation">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-indigo-300">Story Workbench</h2>
      <nav className="space-y-2">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-card focus:outline-none focus:ring-2 focus:ring-accent">
            {n.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
