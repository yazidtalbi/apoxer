import { Game } from "@/types";
import Image from "next/image";

interface OverviewSectionProps {
  game: Game;
}

export default function OverviewSection({ game }: OverviewSectionProps) {
  const coverUrl = (game as Game & { cover_url?: string }).cover_url || game.coverUrl;

  return (
    <div className="space-y-8">
      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">About this game</h3>
        <p className="text-white/80 leading-relaxed">{game.description}</p>
      </div>

      {/* Gameplay Tags */}
      {game.tags && game.tags.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Gameplay Tags</h3>
          <div className="flex flex-wrap gap-2">
            {game.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-white/5 border border-white/10 text-white/80 text-xs px-3 py-1.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Genres & Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {game.genres && game.genres.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white/60 mb-2">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {game.genres.map((genre, index) => (
                <span
                  key={index}
                  className="bg-white/5 border border-white/10 text-white text-sm px-3 py-1.5 rounded"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {game.platforms && game.platforms.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white/60 mb-2">Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {game.platforms.map((platform, index) => (
                <span
                  key={index}
                  className="bg-white/5 border border-white/10 text-white text-sm px-3 py-1.5 rounded"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cover Image */}
      {coverUrl && (
        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-white/5">
          <Image
            src={coverUrl}
            alt={game.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 70vw"
          />
        </div>
      )}
    </div>
  );
}

