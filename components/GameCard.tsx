import Link from "next/link";
import Image from "next/image";
import { Game } from "@/types";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  // Access cover_url from the database (snake_case) with fallback to camelCase
  const coverUrl = (game as Game & { cover_url?: string }).cover_url || game.coverUrl;

  return (
    <Link href={`/games/${game.slug}`} className="block bg-[#0E0E0E] rounded overflow-hidden">
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
        <h3 className="text-white text-sm mb-1">{game.title}</h3>
        {game.genres.length > 0 && (
          <p className="text-white/60 text-xs">
            {game.genres.join(", ")}
          </p>
        )}
      </div>
    </Link>
  );
}

