"use client";

import { useState } from "react";
import { Game, PlayGuide } from "@/types";

interface PlayTogetherSectionProps {
  game: Game;
  guides: PlayGuide[];
}

export default function PlayTogetherSection({ game, guides }: PlayTogetherSectionProps) {
  const [selectedGuideIndex, setSelectedGuideIndex] = useState(0);

  if (guides.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">How to Play Together</h2>
        <div className="bg-[#0E0E0E] border border-white/10 rounded p-6">
          <p className="text-white/60 text-sm">
            We're still writing co-op instructions for this game.
          </p>
        </div>
      </section>
    );
  }

  const selectedGuide = guides[selectedGuideIndex];
  
  // Access database fields (snake_case) with fallback to camelCase
  const fromPlatform = (selectedGuide as PlayGuide & { from_platform?: string }).from_platform ?? selectedGuide.fromPlatform;
  const toPlatform = (selectedGuide as PlayGuide & { to_platform?: string }).to_platform ?? selectedGuide.toPlatform;
  const steps = (selectedGuide as PlayGuide & { steps?: string }).steps ?? "";
  const summary = (selectedGuide as PlayGuide & { summary?: string }).summary ?? "";

  // Split steps by newlines and filter out empty lines
  const stepLines = steps.split("\n").filter((line) => line.trim() !== "");

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-white mb-4">How to Play Together</h2>
      <div className="bg-[#0E0E0E] border border-white/10 rounded p-6">
        {guides.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {guides.map((guide, index) => {
              const guideFromPlatform = (guide as PlayGuide & { from_platform?: string }).from_platform ?? guide.fromPlatform;
              const guideToPlatform = (guide as PlayGuide & { to_platform?: string }).to_platform ?? guide.toPlatform;
              const isSelected = index === selectedGuideIndex;
              
              return (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuideIndex(index)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                  }`}
                >
                  {guideFromPlatform} → {guideToPlatform}
                </button>
              );
            })}
          </div>
        )}
        
        <div>
          <h3 className="text-white text-sm font-medium mb-2">{selectedGuide.title}</h3>
          {summary && (
            <p className="text-white/60 text-sm mb-4">{summary}</p>
          )}
          {stepLines.length > 0 && (
            <div className="space-y-2">
              {stepLines.map((line, index) => (
                <p key={index} className="text-white/80 text-sm">
                  {line.trim()}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

