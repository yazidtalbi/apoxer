"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Game } from "@/types";
import { Users } from "lucide-react";
import { useLobby } from "@/contexts/LobbyContext";

interface GameCardWithPlayersProps {
  game: Game & { playerCount?: number };
}

export default function GameCardWithPlayers({ game }: GameCardWithPlayersProps) {
  const router = useRouter();
  const { setGame, setShowLobby } = useLobby();
  const coverUrl = (game as Game & { cover_url?: string }).cover_url || game.coverUrl;
  const playerCount = game.playerCount || 0;

  const handleLobbyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setGame(game);
    setShowLobby(true);
    // Navigate to game page
    router.push(`/games/${game.slug}`);
  };

  return (
    <div className="bg-[#0E0E0E] rounded overflow-hidden group">
      <Link href={`/games/${game.slug}`} className="block">
        <div className="relative aspect-[3/4] w-full">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={game.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : null}
        </div>
        <div className="p-3">
          <h3 className="text-white text-sm mb-2 line-clamp-2">{game.title}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <Users className="w-3.5 h-3.5" />
              <span>{playerCount} {playerCount === 1 ? "player" : "players"}</span>
            </div>
            <button
              onClick={handleLobbyClick}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Join Lobby
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

