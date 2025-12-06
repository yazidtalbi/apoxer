import Link from "next/link";
import Image from "next/image";
import { Game } from "@/types";

interface MoreLikeThisSectionProps {
  games: Game[];
}

export default function MoreLikeThisSection({ games }: MoreLikeThisSectionProps) {
  if (games.length === 0) {
    return (
      <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6">
        <p className="text-white/60 text-sm">No similar games found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex gap-4">
        {games.map((game) => {
          const coverUrl = (game as Game & { cover_url?: string }).cover_url || game.coverUrl;
          return (
            <Link
              key={game.id}
              href={`/games/${game.slug}`}
              className="flex-shrink-0 w-48 group"
            >
              <div className="bg-[#0E0E0E] border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all">
                <div className="relative aspect-[3/4] w-full">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={game.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="192px"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <span className="text-white/20 text-xs">No cover</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-white text-sm font-medium mb-1 line-clamp-2 group-hover:text-white/80 transition-colors">
                    {game.title}
                  </h3>
                  {game.genres && game.genres.length > 0 && (
                    <p className="text-white/60 text-xs line-clamp-1">
                      {game.genres.slice(0, 2).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

