"use client";

import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HorizontalScrollerProps {
  title?: string;
  children: ReactNode;
  className?: string;
  showArrows?: boolean;
}

export default function HorizontalScroller({
  title,
  children,
  className = "",
  showArrows = true,
}: HorizontalScrollerProps) {
  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById(`scroller-${title?.toLowerCase().replace(/\s+/g, "-") || "default"}`);
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const containerId = `scroller-${title?.toLowerCase().replace(/\s+/g, "-") || "default"}`;

  return (
    <div className={`relative ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
          {showArrows && (
            <div className="hidden md:flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scrollContainer("left")}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scrollContainer("right")}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      <div
        id={containerId}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
      >
        {children}
      </div>
    </div>
  );
}

