import Image from "next/image";
import Link from "next/link";
import { FeaturedGame } from "@/lib/profile";
import HorizontalScroller from "@/components/HorizontalScroller";

interface FeaturedGamesRowProps {
  games: FeaturedGame[];
}

export default function FeaturedGamesRow({ games }: FeaturedGamesRowProps) {
  if (games.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Featured Games</h2>
        <Link
          href="#games"
          className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1"
        >
          View more <span>↗</span>
        </Link>
      </div>
      <HorizontalScroller showArrows={games.length > 3}>
        {games.map((item) => (
          <Link
            key={item.id}
            href={`/games/${item.game.slug}`}
            className="flex-shrink-0 w-[280px] bg-[#0E0E0E] border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all group"
          >
            <div className="relative aspect-video w-full">
              {item.game.coverUrl ? (
                <Image
                  src={item.game.coverUrl}
                  alt={item.game.title}
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <span className="text-white/40 text-sm">No cover</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-white/60 text-sm mb-2">Video Game</p>
              <h3 className="text-white font-medium mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                {item.game.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-xs">
                  {item.platform || item.game.platforms?.[0]?.toUpperCase() || "PC"}
                </span>
                <span className="text-white/60">→</span>
              </div>
            </div>
          </Link>
        ))}
      </HorizontalScroller>
    </section>
  );
}

