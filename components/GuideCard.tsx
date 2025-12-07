import Link from "next/link";
import Image from "next/image";
import { PlayGuide } from "@/types";
import { Clock, ArrowRight } from "lucide-react";

interface GuideCardProps {
  guide: PlayGuide;
  gameSlug?: string;
  variant?: "default" | "compact";
}

export default function GuideCard({ guide, gameSlug, variant = "default" }: GuideCardProps) {
  const coverUrl = guide.game?.cover_url || guide.game?.coverUrl;
  const platform = guide.platform || guide.fromPlatform;
  const fromPlatform = guide.fromPlatform;
  const toPlatform = guide.toPlatform;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  if (variant === "compact") {
    return (
      <Link
        href={gameSlug ? `/games/${gameSlug}/guides/${guide.id}` : "#"}
        className="group flex-shrink-0 w-80 bg-[#0E0E0E] border border-white/10 rounded-lg overflow-hidden hover:border-blue-600/50 transition-all snap-start"
      >
        {coverUrl && (
          <div className="relative h-32 w-full">
            <Image
              src={coverUrl}
              alt={guide.game?.title || "Game cover"}
              fill
              className="object-cover"
              sizes="320px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        )}
        <div className="p-4">
          <h3 className="text-white text-base font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
            {guide.title}
          </h3>
          <p className="text-white/60 text-sm mb-3 line-clamp-2">
            {guide.summary}
          </p>
          <div className="flex items-center gap-3 text-xs text-white/50">
            {platform && (
              <span className="bg-white/10 px-2 py-0.5 rounded">
                {platform.toUpperCase()}
              </span>
            )}
            {fromPlatform && toPlatform && fromPlatform !== toPlatform && (
              <span className="flex items-center gap-1">
                {fromPlatform} <ArrowRight className="w-3 h-3" /> {toPlatform}
              </span>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {formatDate(guide.lastUpdated)}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={gameSlug ? `/games/${gameSlug}/guides/${guide.id}` : "#"}
      className="group flex-shrink-0 w-72 bg-[#0E0E0E] border border-white/10 rounded-lg overflow-hidden hover:border-blue-600/50 transition-all snap-start"
    >
      {coverUrl && (
        <div className="relative h-40 w-full">
          <Image
            src={coverUrl}
            alt={guide.game?.title || "Game cover"}
            fill
            className="object-cover"
            sizes="288px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-white text-sm font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
          {guide.title}
        </h3>
        <p className="text-white/60 text-xs mb-3 line-clamp-2">
          {guide.summary}
        </p>
        <div className="flex items-center gap-2 text-xs text-white/50">
          {platform && (
            <span className="bg-white/10 px-2 py-0.5 rounded text-xs">
              {platform.toUpperCase()}
            </span>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {formatDate(guide.lastUpdated)}
          </div>
        </div>
      </div>
    </Link>
  );
}
