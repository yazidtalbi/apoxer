"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Event } from "@/types";
import { Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface EventWithGame extends Event {
  game?: {
    id: string;
    title: string;
    cover_url: string | null;
    hero_url: string | null;
    slug: string;
  };
}

interface EventsCarouselProps {
  events: EventWithGame[];
}

export default function EventsCarousel({ events }: EventsCarouselProps) {
  const [isParticipating, setIsParticipating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check if user is participating in events
    const checkParticipation = async () => {
      const { createClientSupabaseClient } = await import("@/lib/supabase-client");
      const supabase = createClientSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const participation: Record<string, boolean> = {};
      for (const event of events) {
        const { data } = await supabase
          .from("event_participants")
          .select("id")
          .eq("event_id", event.id)
          .eq("user_id", user.id)
          .maybeSingle();
        
        participation[event.id] = !!data;
      }
      setIsParticipating(participation);
    };

    checkParticipation();
  }, [events]);

  if (events.length === 0) {
    return null;
  }

  const formatDuration = (startDate: string, startTime: string) => {
    try {
      const eventDate = new Date(`${startDate}T${startTime}`);
      const now = new Date();
      const diffMs = eventDate.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
      } else {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins > 0 ? `${diffMins} min${diffMins !== 1 ? "s" : ""}` : "Starting soon";
      }
    } catch {
      return "TBD";
    }
  };

  const formatEventTime = (startDate: string, startTime: string) => {
    try {
      const date = new Date(`${startDate}T${startTime}`);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return `${startDate} ${startTime}`;
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    const { createClientSupabaseClient } = await import("@/lib/supabase-client");
    const supabase = createClientSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      const { error } = await supabase.from("event_participants").insert({
        event_id: eventId,
        user_id: user.id,
      });

      if (error) {
        console.error("Error joining event:", error);
        alert("Failed to join event. Please try again.");
      } else {
        setIsParticipating((prev) => ({ ...prev, [eventId]: true }));
        // Refresh to update player count
        window.location.reload();
      }
    } catch (error) {
      console.error("Error joining event:", error);
      alert("Failed to join event. Please try again.");
    }
  };

  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    []
  );

  return (
    <div className="relative w-full">
      <Carousel
        plugins={[autoplayPlugin]}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {events.map((event) => {
            const heroUrl = event.game?.hero_url || "";
            const gameTitle = event.game?.title || "Unknown Game";
            const gameSlug = event.game?.slug || "";
            const isFull = event.playersHave >= event.playersNeeded;
            const userIsParticipating = isParticipating[event.id];
            
            return (
              <CarouselItem key={event.id} className="pl-0 basis-full">
                <div className="relative h-96 md:h-[500px] w-full overflow-hidden rounded-lg">
                  {/* Background Image */}
                  {heroUrl && (
                    <div className="absolute inset-0">
                      <Image
                        src={heroUrl}
                        alt={gameTitle}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
                    </div>
                  )}
                  {!heroUrl && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50" />
                  )}

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-6 md:p-12">
                    <div className="max-w-3xl">
                      {/* Game Title */}
                      {gameSlug && (
                        <Link
                          href={`/games/${gameSlug}`}
                          className="text-white/80 hover:text-white text-sm font-medium mb-2 inline-block transition-colors"
                        >
                          {gameTitle}
                        </Link>
                      )}

                      {/* Event Title/Description */}
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        {event.description || `Join ${gameTitle} Event`}
                      </h2>

                      {/* Duration and Players Info */}
                      <div className="flex flex-wrap items-center gap-6 mb-6">
                        <div className="flex items-center gap-2 text-white/90">
                          <Clock className="w-5 h-5" />
                          <span className="font-medium">
                            {formatDuration(event.startDate, event.startTime)}
                          </span>
                          <span className="text-white/60 text-sm ml-2">
                            {formatEventTime(event.startDate, event.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-white/90">
                          <Users className="w-5 h-5" />
                          <span className="font-medium">
                            {event.playersHave}/{event.playersNeeded} players
                          </span>
                        </div>
                        {event.platform && (
                          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                            {event.platform}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {event.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-white/20 border border-white/30 text-white text-xs px-3 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTA Button */}
                      <div>
                        {userIsParticipating ? (
                          <button
                            disabled
                            className="bg-green-600/80 text-white px-8 py-3 rounded-lg font-semibold text-lg disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            I'm In
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinEvent(event.id)}
                            disabled={isFull}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
                          >
                            {isFull ? "Event Full" : "Join Event"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-white/10 hover:bg-white/20 border-white/20 text-white" />
        <CarouselNext className="right-4 bg-white/10 hover:bg-white/20 border-white/20 text-white" />
      </Carousel>
    </div>
  );
}
