import { Player } from "@/types";

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  // Get username from user metadata or use user_id as fallback
  // Note: In a real app, you'd want to fetch user data separately or store username in players table
  const username =
    player.user?.user_metadata?.username ||
    player.user?.email?.split("@")[0] ||
    `Player ${player.userId.slice(0, 8)}`;

  // Status colors
  const statusColors = {
    online: "bg-green-500/20 text-green-400 border-green-500/30",
    looking: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    offline: "bg-white/10 text-white/60 border-white/10",
  };

  const statusLabels = {
    online: "Online",
    looking: "Looking",
    offline: "Offline",
  };

  return (
    <div className="bg-[#0E0E0E] border border-white/10 rounded p-4 flex-shrink-0 w-64">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-white/60 text-sm">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate">{username}</p>
            {player.game && (
              <p className="text-white/60 text-xs truncate">{player.game.title}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded">
          {player.platform}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded border ${statusColors[player.status]}`}
        >
          {statusLabels[player.status]}
        </span>
      </div>

      <button className="w-full bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded transition-colors">
        Add Friend
      </button>
    </div>
  );
}

