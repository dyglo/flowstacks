import React from 'react';
import { ServerLeaderboard } from './server-leaderboard';

export default async function LeaderboardPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8 space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Tool Leaderboard
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Discover the highest-rated AI tools based on community reviews, scoring algorithms, and recency.
        </p>
      </div>

      {/* Server-side leaderboard component */}
      <ServerLeaderboard />
    </div>
  );
}
