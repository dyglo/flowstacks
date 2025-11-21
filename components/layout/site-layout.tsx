'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { CompareView } from '@/components/tools/compare-view';
import { CommandPalette } from '@/components/global/command-palette';
import { useUser } from '@/components/auth/user-provider';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showFooter = pathname === '/';
  const { user } = useUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar currentUser={user} />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
      <CompareView />
      <CommandPalette />
    </div>
  );
}
