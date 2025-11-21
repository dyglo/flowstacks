'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, Layers, Menu, X, User, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { href: '/tools', label: 'Tools' },
  { href: '/collections', label: 'Collections' },
  { href: '/discover', label: 'Discover' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/get-your-stack', label: 'Get Your Stack' },
];

interface CurrentUser {
  id: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

interface NavbarProps {
  currentUser?: CurrentUser | null;
}

function getInitials(displayName?: string | null): string {
  if (!displayName) return '?';
  const parts = displayName.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return displayName[0].toUpperCase();
}

export function Navbar({ currentUser }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="p-1.5 bg-primary rounded-lg group-hover:scale-110 transition-transform">
            <Zap className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="font-bold text-xl">FlowStacks</span>
        </Link>

        <nav className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Auth section */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.displayName || 'User'} />
                    <AvatarFallback className="text-xs">
                      {getInitials(currentUser.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{currentUser.displayName || 'User'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/stack" className="cursor-pointer">
                    <Layers className="mr-2 h-4 w-4" />
                    My Stacks
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={async () => {
                    const { createBrowserClient } = await import('@/lib/supabaseBrowserClient');
                    const supabase = createBrowserClient();
                    await supabase.auth.signOut();
                    router.push('/');
                    router.refresh();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="hidden sm:flex">
              <Link href="/auth/sign-up">Sign up</Link>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </nav>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t bg-background"
          >
            <div className="container max-w-6xl mx-auto px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {currentUser ? (
                <>
                  <Link
                    href="/settings/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <Settings className="h-4 w-4" />
                    Profile & Settings
                  </Link>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      const { createBrowserClient } = await import('@/lib/supabaseBrowserClient');
                      const supabase = createBrowserClient();
                      await supabase.auth.signOut();
                      router.push('/');
                      router.refresh();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted text-destructive w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <Button asChild className="mx-4">
                  <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    Sign up
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
