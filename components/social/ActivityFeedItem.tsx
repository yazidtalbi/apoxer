"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Gamepad2, Plus, Zap, Calendar } from "lucide-react";

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

interface ActivityFeedItemProps {
  activity: Activity;
}

export default function ActivityFeedItem({ activity }: ActivityFeedItemProps) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case "game_added":
        return <Plus className="w-4 h-4 text-green-400" />;
      case "matchmaking_started":
        return <Zap className="w-4 h-4 text-purple-400" />;
      case "event_participated":
        return <Gamepad2 className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getActivityText = () => {
    switch (activity.type) {
      case "game_added":
        return "added a game";
      case "matchmaking_started":
        return "started matchmaking";
      case "event_participated":
        return "is participating in an event for";
      default:
        return "did something";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {activity.user.avatarUrl ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={activity.user.avatarUrl}
                alt={activity.user.username}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {activity.user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-white text-sm">
                <Link
                  href={`/profile/${activity.user.username}`}
                  className="font-semibold hover:text-white/80 transition-colors"
                >
                  {activity.user.displayName || activity.user.username}
                </Link>
                {" "}
                <span className="text-white/60">{getActivityText()}</span>
                {activity.event && (
                  <>
                    {" "}
                    <Link
                      href={`/games/${activity.event.game.slug}`}
                      className="font-medium text-white hover:text-white/80 transition-colors"
                    >
                      {activity.event.game.title}
                    </Link>
                  </>
                )}
                {activity.game && (
                  <>
                    {" "}
                    <Link
                      href={`/games/${activity.game.slug}`}
                      className="font-medium text-white hover:text-white/80 transition-colors"
                    >
                      {activity.game.title}
                    </Link>
                  </>
                )}
                {activity.platform && (
                  <span className="text-white/40 ml-1">on {activity.platform}</span>
                )}
              </p>
              <div className="flex items-center gap-2 mt-2 text-white/40 text-xs">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(activity.timestamp)}</span>
              </div>
            </div>

            {/* Activity Icon */}
            <div className="flex-shrink-0">{getActivityIcon()}</div>

            {/* Game Cover (if available) */}
            {(activity.game?.coverUrl || activity.event?.game) && (
              <Link
                href={`/games/${activity.game?.slug || activity.event?.game.slug}`}
                className="flex-shrink-0 relative w-16 h-20 rounded overflow-hidden hover:opacity-80 transition-opacity"
              >
                {activity.game?.coverUrl ? (
                  <Image
                    src={activity.game.coverUrl}
                    alt={activity.game.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-white/40" />
                  </div>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

