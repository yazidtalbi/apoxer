"use client";

import { useMemo } from "react";
import ActivityFeedItem from "./ActivityFeedItem";
import FollowingAvatars from "./FollowingAvatars";
import { Game } from "@/types";
import { PlayerSummary } from "@/lib/profile";

interface Activity {
  id: string;
  type: "game_added" | "matchmaking_started" | "event_participated";
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  game?: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
  };
  event?: {
    id: string;
    title?: string;
    game: {
      id: string;
      title: string;
      slug: string;
    };
  };
  timestamp: string;
  platform?: string;
}

interface SocialFeedProps {
  initialActivities: Activity[];
  userGames: Game[];
  following: PlayerSummary[];
}

interface GroupedActivities {
  date: string;
  dateLabel: string;
  activities: Activity[];
}

export default function SocialFeed({ initialActivities, userGames, following }: SocialFeedProps) {
  // Group activities by date
  const groupedActivities = useMemo(() => {
    const grouped: GroupedActivities[] = [];
    const groups = new Map<string, Activity[]>();

    initialActivities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activityDate = new Date(date);
      activityDate.setHours(0, 0, 0, 0);

      let dateKey: string;
      let dateLabel: string;

      if (activityDate.getTime() === today.getTime()) {
        dateKey = "today";
        dateLabel = "Today";
      } else if (activityDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
        dateKey = "yesterday";
        dateLabel = "Yesterday";
      } else {
        dateKey = date.toISOString().split("T")[0];
        dateLabel = date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(activity);
    });

    // Convert to array and sort by date (most recent first)
    const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
      if (a[0] === "today") return -1;
      if (b[0] === "today") return 1;
      if (a[0] === "yesterday") return -1;
      if (b[0] === "yesterday") return 1;
      return b[0].localeCompare(a[0]);
    });

    sortedGroups.forEach(([dateKey, activities]) => {
      const dateLabel =
        dateKey === "today"
          ? "Today"
          : dateKey === "yesterday"
          ? "Yesterday"
          : new Date(dateKey).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

      grouped.push({
        date: dateKey,
        dateLabel,
        activities: activities.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
      });
    });

    return grouped;
  }, [initialActivities]);

  return (
    <div className="space-y-8">
      {/* Following Avatars */}
      {following.length > 0 && <FollowingAvatars following={following} />}

      {/* Activity Feed */}
      <section>
        {initialActivities.length === 0 ? (
          <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-8 text-center">
            <p className="text-white/60 text-sm">No activity to show. Start following players to see their activity!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedActivities.map((group) => (
              <div key={group.date}>
                <h2 className="text-lg font-semibold text-white mb-4 sticky top-0 bg-[#1A1A1A] py-2 z-10">
                  {group.dateLabel}
                </h2>
                <div className="space-y-4">
                  {group.activities.map((activity) => (
                    <ActivityFeedItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

