import type { Metadata } from 'next';
import './globals.css';
import { SideNavigation } from '@/components/side-navigation';
import { TopBar } from '@/components/top-bar';

export const metadata: Metadata = {
  title: 'Iyagi Workbench',
  description: '개인용 작가 워크벤치'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body>
        <div className="grid min-h-screen grid-cols-[250px_1fr] bg-bg text-text">
          <SideNavigation />
          <div className="flex min-h-screen flex-col">
            <TopBar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
