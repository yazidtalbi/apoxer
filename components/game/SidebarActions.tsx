import Image from "next/image";
import Link from "next/link";
import { Game, Community } from "@/types";
import AddToYourGamesButton from "@/components/AddToYourGamesButton";

interface SidebarActionsProps {
  game: Game;
  communities: Community[];
  playersCount: number;
}

export default function SidebarActions({
  game,
  communities,
  playersCount,
}: SidebarActionsProps) {
  const coverUrl = (game as Game & { cover_url?: string }).cover_url || game.coverUrl;
  const activeCommunities = communities.length;
  const totalOnline = communities.reduce((sum, c) => {
    const onlineCount = (c as Community & { online_count?: number }).online_count ?? c.onlineCount;
    return sum + onlineCount;
  }, 0);

  return (
    <div className="lg:sticky lg:top-20">
      <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6 space-y-6 shadow-lg">
        {/* Game Cover */}
        {coverUrl && (
          <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden">
            <Image
              src={coverUrl}
              alt={game.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 30vw"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <AddToYourGamesButton gameId={game.id} />
          <button className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded transition-colors text-sm font-medium">
            Follow Game
          </button>
        </div>

        {/* Platform Selector */}
        {game.platforms && game.platforms.length > 1 && (
          <div>
            <label className="block text-white/60 text-xs mb-2">Platform</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-white/20">
              {game.platforms.map((platform) => (
                <option key={platform} value={platform} className="bg-[#0E0E0E]">
                  {platform}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Social Stats */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          {playersCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Players Online</span>
              <span className="text-white text-sm font-medium">{playersCount}</span>
            </div>
          )}
          {activeCommunities > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Active Communities</span>
              <span className="text-white text-sm font-medium">{activeCommunities}</span>
            </div>
          )}
          {totalOnline > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Total Online</span>
              <span className="text-white text-sm font-medium">{totalOnline.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          {communities.length > 0 && (
            <a
              href={communities[0].inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white/10 hover:bg-white/20 text-white text-center px-6 py-3 rounded transition-colors text-sm font-medium"
            >
              Join Discord
            </a>
          )}
          <button className="w-full bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded transition-colors text-sm font-medium">
            Play Now
          </button>
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-start justify-between">
            <span className="text-white/60 text-xs">Release Date</span>
            <span className="text-white text-xs text-right">Coming Soon</span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-white/60 text-xs">Developer</span>
            <span className="text-white text-xs text-right">TBA</span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-white/60 text-xs">Publisher</span>
            <span className="text-white text-xs text-right">TBA</span>
          </div>
        </div>
      </div>
    </div>
  );
}

