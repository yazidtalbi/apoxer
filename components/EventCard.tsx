import Link from "next/link";
import Image from "next/image";
import { Event } from "@/types";
import { Clock, Users, Calendar } from "lucide-react";

interface EventCardProps {
  event: Event & {
    game?: {
      id: string;
      title: string;
      cover_url?: string | null;
      hero_url?: string | null;
      slug: string;
    };
  };
  variant?: "default" | "compact" | "featured";
}

export default function EventCard({ event, variant = "default" }: EventCardProps) {
  const coverUrl = event.game?.cover_url || event.game?.hero_url;
  const gameTitle = event.game?.title || "Unknown Game";
  const gameSlug = event.game?.slug;
  const isFull = event.playersHave >= event.playersNeeded;

  const formatTimeUntil = (startDatetime: string) => {
    try {
      const now = new Date();
      const eventTime = new Date(startDatetime);
      const diffMs = eventTime.getTime() - now.getTime();

      if (diffMs < 0) return "Event ended";

      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `in ${diffDays}d`;
      if (diffHours > 0) return `in ${diffHours}h`;
      if (diffMinutes > 0) return `in ${diffMinutes}m`;
      return "Starting soon";
    } catch {
      return "TBD";
    }
  };

  const formatEventTime = (startDate: string, startTime: string) => {
    try {
      const date = new Date(`${startDate}T${startTime}`);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return `${startDate} ${startTime}`;
    }
  };

  if (variant === "featured") {
    return (
      <Link
        href={gameSlug ? `/games/${gameSlug}?tab=events` : "#"}
        className="group flex-shrink-0 w-full md:w-[600px] bg-[#0E0E0E] border border-white/10 rounded-lg overflow-hidden hover:border-pink-600/50 transition-all snap-start"
      >
        {coverUrl && (
          <div className="relative h-48 w-full">
            <Image
              src={coverUrl}
              alt={gameTitle}
              fill
              className="object-cover"
              sizes="600px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              {gameSlug && (
                <p className="text-white/60 text-xs mb-1">{gameTitle}</p>
              )}
              <h3 className="text-white text-xl font-semibold group-hover:text-pink-400 transition-colors mb-2">
                {event.description || `Join ${gameTitle} Event`}
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isFull
                  ? "bg-red-500/20 text-red-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {isFull ? "Full" : "Open"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTimeUntil(event.startDatetime)}</span>
              <span className="text-white/50 text-xs">
                {formatEventTime(event.startDate, event.startTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                {event.playersHave}/{event.playersNeeded} players
              </span>
            </div>
            {event.platform && (
              <span className="bg-white/10 px-2 py-0.5 rounded text-xs">
                {event.platform}
              </span>
            )}
          </div>
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-white/10 border border-white/20 text-white text-xs px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={gameSlug ? `/games/${gameSlug}?tab=events` : "#"}
        className="group flex-shrink-0 w-72 bg-[#0E0E0E] border border-white/10 rounded-lg overflow-hidden hover:border-pink-600/50 transition-all snap-start"
      >
        {coverUrl && (
          <div className="relative h-32 w-full">
            <Image
              src={coverUrl}
              alt={gameTitle}
              fill
              className="object-cover"
              sizes="288px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        )}
        <div className="p-4">
          <h3 className="text-white text-sm font-semibold mb-2 group-hover:text-pink-400 transition-colors line-clamp-2">
            {event.description || `Join ${gameTitle} Event`}
          </h3>
          <div className="flex items-center gap-3 text-xs text-white/60 mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeUntil(event.startDatetime)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.playersHave}/{event.playersNeeded}
            </div>
          </div>
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs ${
              isFull ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
            }`}
          >
            {isFull ? "Full" : "Open"}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={gameSlug ? `/games/${gameSlug}?tab=events` : "#"}
      className="group flex-shrink-0 w-80 bg-[#0E0E0E] border border-white/10 rounded-lg overflow-hidden hover:border-pink-600/50 transition-all snap-start"
    >
      {coverUrl && (
        <div className="relative h-40 w-full">
          <Image
            src={coverUrl}
            alt={gameTitle}
            fill
            className="object-cover"
            sizes="320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white text-base font-semibold group-hover:text-pink-400 transition-colors line-clamp-2 flex-1">
            {event.description || `Join ${gameTitle} Event`}
          </h3>
          <span
            className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
              isFull ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
            }`}
          >
            {isFull ? "Full" : "Open"}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/60 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeUntil(event.startDatetime)}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {event.playersHave}/{event.playersNeeded}
          </div>
        </div>
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="bg-white/10 text-white text-xs px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

