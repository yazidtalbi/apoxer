import Link from "next/link";
import { PinnedLfgPost } from "@/lib/profile";
import { Pin, ExternalLink } from "lucide-react";

interface PinnedLfgCardProps {
  post: PinnedLfgPost;
}

export default function PinnedLfgCard({ post }: PinnedLfgCardProps) {
  const formatScheduledDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return null;
    }
  };

  const scheduledLabel = formatScheduledDate(post.scheduledAt);
  const progressPercentage =
    post.maxPlayers && post.currentPlayers
      ? (post.currentPlayers / post.maxPlayers) * 100
      : 0;

  return (
    <section className="mb-8">
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <Pin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg mb-1">{post.title}</h3>
            <p className="text-white/60 text-sm mb-3">
              {post.game.title}
              {post.platform && ` • ${post.platform}`}
              {scheduledLabel && ` • ${scheduledLabel}`}
            </p>
            {post.description && (
              <p className="text-white/80 text-sm mb-4">{post.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
              {post.voiceRequired && <span>Voice required</span>}
              {post.maxPlayers && (
                <span>
                  {post.currentPlayers || 0}/{post.maxPlayers} players
                </span>
              )}
              {post.externalLink && (
                <a
                  href={post.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Discord</span>
                </a>
              )}
            </div>
            {post.maxPlayers && (
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

