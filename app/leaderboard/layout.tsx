import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard | FlowStacks',
  description: 'Top rated AI tools based on community reviews and scoring.',
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

