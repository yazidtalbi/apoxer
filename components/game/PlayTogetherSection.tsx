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
      <div className="space-y-6">
        <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6">
          <p className="text-white/60 text-sm mb-4">
            We're still writing co-op instructions for this game.
          </p>
          <button className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded transition-colors">
            Generate Guide with AI (Coming Soon)
          </button>
        </div>
      </div>
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
    <div className="space-y-6">
      {/* Platform Presets */}
      {guides.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {guides.map((guide, index) => {
            const guideFromPlatform = (guide as PlayGuide & { from_platform?: string }).from_platform ?? guide.fromPlatform;
            const guideToPlatform = (guide as PlayGuide & { to_platform?: string }).to_platform ?? guide.toPlatform;
            const isSelected = index === selectedGuideIndex;
            
            return (
              <button
                key={guide.id}
                onClick={() => setSelectedGuideIndex(index)}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 border border-white/10"
                }`}
              >
                {guideFromPlatform} → {guideToPlatform}
              </button>
            );
          })}
        </div>
      )}
      
      {/* Guide Content */}
      <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6">
        <h3 className="text-white text-lg font-semibold mb-2">{selectedGuide.title}</h3>
        {summary && (
          <p className="text-white/60 text-sm mb-6">{summary}</p>
        )}
        {stepLines.length > 0 && (
          <div className="space-y-3">
            {stepLines.map((line, index) => (
              <div key={index} className="flex gap-3">
                <span className="text-white/40 text-sm font-medium flex-shrink-0 w-6">
                  {index + 1}.
                </span>
                <p className="text-white/80 text-sm leading-relaxed">{line.trim()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Generate Button */}
      <button className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded transition-colors">
        Generate Guide with AI (Coming Soon)
      </button>
    </div>
  );
}

