"use client";

import Link from "next/link";
import Image from "next/image";
import { SocialFeedPost } from "@/lib/socialFeed";
import { Calendar, Users, Mic, ExternalLink, Gamepad2 } from "lucide-react";

interface SocialFeedListProps {
  posts: SocialFeedPost[];
  currentPlayerId: string;
}

/**
 * Formats a timestamp to a relative time string
 * e.g., "2h ago", "3 days ago", etc.
 */
function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  } else {
    return "Just now";
  }
}

/**
 * Formats scheduled date for display
 */
function formatScheduledDate(dateString: string | null): string | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

export default function SocialFeedList({ posts, currentPlayerId }: SocialFeedListProps) {
  // Empty state: user follows nobody and has no own posts
  if (posts.length === 0) {
    return (
      <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-12 text-center">
        <Gamepad2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">No activity yet</h2>
        <p className="text-white/60 mb-6">
          Start following players or create your own LFG posts to see activity here.
        </p>
        <Link
          href="/games"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Browse Games
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const isOwnPost = post.playerId === currentPlayerId;
        const scheduledLabel = formatScheduledDate(post.scheduledAt);

        return (
          <article
            key={post.id}
            className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
          >
            {/* Header: Player Info */}
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar */}
              <Link href={`/profile/${post.player.username}`} className="flex-shrink-0">
                {post.player.avatarUrl ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={post.player.avatarUrl}
                      alt={post.player.displayName}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      {post.player.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </Link>

              {/* Player Info and Time */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/profile/${post.player.username}`}
                    className="text-white font-semibold hover:text-purple-400 transition-colors"
                  >
                    {post.player.displayName}
                  </Link>
                  <span className="text-white/40">•</span>
                  <Link
                    href={`/profile/${post.player.username}`}
                    className="text-white/60 hover:text-white/80 transition-colors"
                  >
                    @{post.player.username}
                  </Link>
                  {isOwnPost && (
                    <>
                      <span className="text-white/40">•</span>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                        You
                      </span>
                    </>
                  )}
                </div>
                <time className="text-white/40 text-sm">
                  {formatRelativeTime(post.createdAt)}
                </time>
              </div>
            </div>

            {/* LFG Post Content */}
            <div className="ml-16">
              <h3 className="text-white font-semibold text-lg mb-2">{post.title}</h3>
              
              {post.description && (
                <p className="text-white/70 text-sm mb-4 whitespace-pre-wrap">
                  {post.description}
                </p>
              )}

              {/* Game and Platform */}
              <div className="flex items-center gap-4 mb-4">
                <Link
                  href={`/games/${post.game.slug}`}
                  className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{post.game.title}</span>
                </Link>
                {post.platform && (
                  <>
                    <span className="text-white/20">•</span>
                    <span className="text-white/60 text-sm">{post.platform}</span>
                  </>
                )}
              </div>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                {/* Scheduled Date */}
                {scheduledLabel && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{scheduledLabel}</span>
                  </div>
                )}

                {/* Player Count */}
                {post.maxPlayers && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>
                      {post.currentPlayers || 0}/{post.maxPlayers} players
                    </span>
                  </div>
                )}

                {/* Voice Required */}
                {post.voiceRequired && (
                  <div className="flex items-center gap-1.5">
                    <Mic className="w-4 h-4" />
                    <span>Voice required</span>
                  </div>
                )}

                {/* External Link */}
                {post.externalLink && (
                  <a
                    href={post.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-purple-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Join</span>
                  </a>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

