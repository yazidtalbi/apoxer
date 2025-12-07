"use client";

import Link from "next/link";
import { Game, PlayGuide } from "@/types";
import { Calendar, ArrowRight } from "lucide-react";

interface PlayTogetherSectionProps {
  game: Game;
  guides: PlayGuide[];
}

export default function PlayTogetherSection({ game, guides }: PlayTogetherSectionProps) {
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Play Together Guides</h2>
        <span className="text-white/60 text-sm">{guides.length} guide{guides.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Guides List - Steam-style */}
      <div className="space-y-4">
        {guides.map((guide) => {
          const fromPlatform = (guide as PlayGuide & { from_platform?: string }).from_platform ?? guide.fromPlatform;
          const toPlatform = (guide as PlayGuide & { to_platform?: string }).to_platform ?? guide.toPlatform;
          const summary = (guide as PlayGuide & { summary?: string }).summary ?? "";
          const lastUpdated = (guide as PlayGuide & { last_updated?: string }).last_updated ?? guide.lastUpdated;
          const platform = guide.platform || fromPlatform;
          
          return (
            <Link
              key={guide.id}
              href={`/games/${game.slug}/guides/${guide.id}`}
              className="block bg-[#0E0E0E] border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all hover:bg-white/5"
            >
              <div className="flex items-start gap-4">
                {/* Guide Icon/Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-8 h-8 text-white/60" />
                </div>

                {/* Guide Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-white font-semibold text-lg">{guide.title}</h3>
                    <span className="text-white/40 text-xs whitespace-nowrap">
                      {formatDate(lastUpdated)}
                    </span>
                  </div>

                  {summary && (
                    <p className="text-white/70 text-sm mb-3 line-clamp-2">{summary}</p>
                  )}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {/* Platform */}
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Platform:</span>
                      <span className="text-white font-medium">{platform}</span>
                    </div>

                    {/* From → To */}
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Route:</span>
                      <span className="text-white font-medium">{fromPlatform} → {toPlatform}</span>
                    </div>

                    {/* Version */}
                    {guide.gameVersion && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">Version:</span>
                        <span className="text-white font-medium">{guide.gameVersion.versionName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* AI Generate Button */}
      <div className="pt-4 border-t border-white/10">
        <button className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded transition-colors">
          Generate Guide with AI (Coming Soon)
        </button>
      </div>
    </div>
  );
}
