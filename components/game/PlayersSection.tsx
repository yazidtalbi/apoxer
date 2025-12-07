"use client";

import Image from "next/image";
import { UserCircle, UserPlus } from "lucide-react";

interface Player {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  status?: string;
  updated_at?: string;
}

interface PlayersSectionProps {
  players: Player[];
}

export default function PlayersSection({ players }: PlayersSectionProps) {
  // Dummy player data for now
  const dummyPlayers: Player[] = [
    {
      id: "1",
      username: "gamerpro123",
      displayName: "Gamer Pro",
      status: "online",
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      username: "ninjaplayer",
      displayName: "Ninja Player",
      status: "looking",
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      id: "3",
      username: "elitegamer",
      displayName: "Elite Gamer",
      status: "online",
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      id: "4",
      username: "casualplayer",
      displayName: "Casual Player",
      status: "offline",
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    },
    {
      id: "5",
      username: "progamer99",
      displayName: "Pro Gamer",
      status: "looking",
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: "6",
      username: "masterplayer",
      displayName: "Master Player",
      status: "online",
      updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    },
    {
      id: "7",
      username: "newbie123",
      displayName: "Newbie",
      status: "offline",
      updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    },
    {
      id: "8",
      username: "veteran",
      displayName: "Veteran",
      status: "online",
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
  ];

  // Use dummy data if players array is empty, otherwise merge
  const allPlayersData = players.length > 0 ? players : dummyPlayers;

  // Filter recent players (last week)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentPlayers = allPlayersData.filter((player) => {
    if (!player.updated_at) return false;
    const updatedDate = new Date(player.updated_at);
    return updatedDate >= oneWeekAgo;
  });

  const allPlayers = allPlayersData;

  // Generate placeholder avatars
  const getAvatarPlaceholder = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    return colors[index % colors.length];
  };

  const getInitials = (player: Player) => {
    const name = player.displayName || player.username || "Player";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8">
      {/* Recent Players / Last Week Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Players / Last Week</h2>
        {recentPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPlayers.map((player, index) => (
              <div
                key={player.id}
                className="bg-[#0E0E0E] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  {player.avatarUrl ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={player.avatarUrl}
                        alt={player.displayName || player.username || "Player"}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full ${getAvatarPlaceholder(index)} flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-white font-semibold text-sm">
                        {getInitials(player)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {player.displayName || player.username || "Player"}
                    </p>
                    {player.status && (
                      <p className="text-white/60 text-xs capitalize">{player.status}</p>
                    )}
                  </div>
                </div>
                <button className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6 text-center">
            <UserCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No recent players in the last week</p>
          </div>
        )}
      </section>

      {/* All Players Section */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">All Players</h2>
        {allPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPlayers.map((player, index) => (
              <div
                key={player.id}
                className="bg-[#0E0E0E] border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  {player.avatarUrl ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={player.avatarUrl}
                        alt={player.displayName || player.username || "Player"}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full ${getAvatarPlaceholder(index)} flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-white font-semibold text-sm">
                        {getInitials(player)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {player.displayName || player.username || "Player"}
                    </p>
                    {player.status && (
                      <p className="text-white/60 text-xs capitalize">{player.status}</p>
                    )}
                  </div>
                </div>
                <button className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6 text-center">
            <UserCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/60 text-sm">No players found for this game</p>
          </div>
        )}
      </section>
    </div>
  );
}

