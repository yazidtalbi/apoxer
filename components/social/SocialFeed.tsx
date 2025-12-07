"use client";

import { useState } from "react";
import ActivityFeedItem from "./ActivityFeedItem";
import UserGamesSection from "./UserGamesSection";
import QuickMatchmaker from "./QuickMatchmaker";
import { Game } from "@/types";

interface Activity {
  id: string;
  type: "game_added" | "matchmaking_started" | "status_updated";
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  game?: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string;
  };
  timestamp: string;
  platform?: string;
}

interface SocialFeedProps {
  initialActivities: Activity[];
  userGames: Game[];
}

export default function SocialFeed({ initialActivities, userGames }: SocialFeedProps) {
  const [activities] = useState<Activity[]>(initialActivities);

  return (
    <div className="space-y-8">
      {/* Quick Matchmaker Section */}
      <section className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Matchmaker</h2>
        <QuickMatchmaker userGames={userGames} />
      </section>

      {/* Your Games Section */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Your Games</h2>
        <UserGamesSection games={userGames} />
      </section>

      {/* Activity Feed */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Activity Feed</h2>
        {activities.length === 0 ? (
          <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-8 text-center">
            <p className="text-white/60 text-sm">No activity to show. Start following players to see their activity!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityFeedItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

