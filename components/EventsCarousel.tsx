"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Event } from "@/types";
import { ChevronRight, ChevronLeft, TrendingUp } from "lucide-react";

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

// Placeholder avatar colors
const AVATAR_COLORS = [
  "bg-gradient-to-br from-purple-500 to-pink-500",
  "bg-gradient-to-br from-blue-500 to-cyan-500",
  "bg-gradient-to-br from-orange-500 to-red-500",
  "bg-gradient-to-br from-green-500 to-emerald-500",
  "bg-gradient-to-br from-yellow-500 to-orange-500",
  "bg-gradient-to-br from-indigo-500 to-purple-500",
];

export default function EventsCarousel({ events }: EventsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft: currentScrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setScrollLeft(currentScrollLeft);
    setCanScrollLeft(currentScrollLeft > 0);
    setCanScrollRight(currentScrollLeft < scrollWidth - clientWidth - 10);
  };

  // Drag to scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = 'grabbing';
    scrollContainerRef.current.style.userSelect = 'none';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
      scrollContainerRef.current.style.userSelect = 'auto';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
      scrollContainerRef.current.style.userSelect = 'auto';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);
      return () => {
        container.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [events]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    scrollContainerRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

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

  // Generate placeholder avatars (always 3)
  const getAvatars = () => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      initial: String.fromCharCode(65 + (i % 26)), // A, B, C, etc.
    }));
  };

  return (
    <div className="w-full mb-12 relative">
      {/* Gaming Background Pattern - Grid with rounded squares */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 animate-scroll-right"
          style={{
            backgroundImage: `
              radial-gradient(circle at 60px 60px, rgba(255,255,255,0.4) 5px, transparent 5px),
              radial-gradient(circle at 140px 140px, rgba(255,255,255,0.3) 4px, transparent 4px),
              radial-gradient(circle at 220px 60px, rgba(255,255,255,0.35) 4.5px, transparent 4.5px)
            `,
            backgroundSize: '160px 160px, 160px 160px, 160px 160px',
            width: '200%',
            animation: 'scrollRight 20s linear infinite',
          }} 
        />
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 animate-scroll-right"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 159px, rgba(255,255,255,0.08) 159px, rgba(255,255,255,0.08) 160px),
              repeating-linear-gradient(90deg, transparent, transparent 159px, rgba(255,255,255,0.08) 159px, rgba(255,255,255,0.08) 160px)
            `,
            backgroundSize: '160px 160px',
            width: '200%',
            animation: 'scrollRight 20s linear infinite',
          }} 
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-white/60" />
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">
            Trending Events
          </h2>
        </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left blur fade - only show when scrolled */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-[#1A1A1A] to-transparent z-20 pointer-events-none transition-opacity duration-300" />
        )}
        
        {/* Right blur fade - only show when there's more content */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-[#1A1A1A] to-transparent z-20 pointer-events-none transition-opacity duration-300" />
        )}
        
        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 relative z-10 cursor-grab active:cursor-grabbing"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {events.map((event, index) => {
            const gameTitle = event.game?.title || "Unknown Game";
            const gameSlug = event.game?.slug || "";
            const coverUrl = event.game?.cover_url || event.game?.hero_url || null;
            const avatars = getAvatars();
            const duration = formatDuration(event.startDate, event.startTime);

            return (
              <Link
                key={event.id}
                href={gameSlug ? `/games/${gameSlug}?event=${event.id}` : "#"}
                className="flex-shrink-0 w-[320px] h-[180px] rounded-xl overflow-hidden shadow-xl group select-none"
                onClick={(e) => {
                  if (isDragging) {
                    e.preventDefault();
                  }
                }}
              >
                {/* Card with Cover Background */}
                <div className="relative w-full h-full p-5 flex flex-col justify-between">
                  {/* Background Image with Overlay */}
                  {coverUrl && (
                    <>
                      <Image
                        src={coverUrl}
                        alt={gameTitle}
                        fill
                        className="object-cover object-top"
                        sizes="320px"
                      />
                      <div className="absolute inset-0 bg-black/70" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    </>
                  )}
                  {!coverUrl && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    </>
                  )}
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    {/* Title Row */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-bold text-base leading-tight pr-2">
                        #{gameTitle.slice(0, 20)}{gameTitle.length > 20 ? '...' : ''}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-white/80 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                    </div>

                    {/* Description */}
                    <p className="text-white/90 text-sm mb-3 line-clamp-2">
                      {event.description || `Join ${gameTitle} event starting in ${duration}`}
                    </p>

                    {/* Footer with Stats and Avatars */}
                    <div className="flex items-end justify-between mt-auto">
                      {/* Statistics */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white font-semibold text-sm">
                          {event.playersHave || 0} {event.playersHave === 1 ? "Player" : "Players"}
                        </span>
                        <span className="text-white/80 text-xs">
                          {event.playersNeeded - (event.playersHave || 0)} {event.playersNeeded - (event.playersHave || 0) === 1 ? "slot left" : "slots left"}
                        </span>
                      </div>

                      {/* Avatar Stack - Always 3 avatars */}
                      <div className="flex -space-x-2">
                        {avatars.map((avatar, i) => (
                          <div
                            key={avatar.id}
                            className={`${avatar.color} w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white/30`}
                            style={{ zIndex: avatars.length - i }}
                          >
                            {avatar.initial}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all z-10"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all z-10"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes scrollRight {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
