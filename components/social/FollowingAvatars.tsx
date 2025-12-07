import Image from "next/image";
import Link from "next/link";
import { PlayerSummary } from "@/lib/profile";

interface FollowingAvatarsProps {
  following: PlayerSummary[];
}

export default function FollowingAvatars({ following }: FollowingAvatarsProps) {
  if (following.length === 0) {
    return null;
  }

  // Show max 10 avatars
  const displayFollowing = following.slice(0, 10);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-white/60">Following</h2>
        <div className="flex items-center gap-2">
          {displayFollowing.map((player) => (
            <Link
              key={player.id}
              href={`/profile/${player.username}`}
              className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-colors flex-shrink-0"
              title={player.displayName}
            >
              {player.avatarUrl ? (
                <Image
                  src={player.avatarUrl}
                  alt={player.displayName}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {player.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>
          ))}
          {following.length > 10 && (
            <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                +{following.length - 10}
              </span>
            </div>
          )}
        </div>
        {following.length > 0 && (
          <Link
            href={`/profile/${following[0].username}/following`}
            className="text-xs text-white/60 hover:text-white/80 transition-colors ml-auto"
          >
            See all
          </Link>
        )}
      </div>
    </div>
  );
}

