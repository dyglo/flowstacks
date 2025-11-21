import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SiteLayout } from '@/components/layout/site-layout';
import { StackProvider } from '@/lib/stack-store';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from '@/components/auth/user-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlowStacks - Discover AI Productivity Tools',
  description: 'Curated directory of AI tools that boost work and personal productivity. Find the perfect tools for your workflow.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <StackProvider>
              <SiteLayout>{children}</SiteLayout>
              <Toaster />
            </StackProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
