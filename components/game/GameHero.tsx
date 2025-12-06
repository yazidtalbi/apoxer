"use client";

import { useState } from "react";
import Image from "next/image";

interface GameHeroProps {
  coverUrl: string;
  gallery?: string[];
  videoUrl?: string;
}

export default function GameHero({ coverUrl, gallery = [], videoUrl }: GameHeroProps) {
  const [selectedMedia, setSelectedMedia] = useState(0);
  const allMedia = videoUrl ? [videoUrl, ...gallery] : gallery.length > 0 ? gallery : [coverUrl];

  return (
    <div className="mb-8">
      {/* Primary Hero Media */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 bg-white/5">
        {selectedMedia === 0 && videoUrl ? (
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            controls
            autoPlay
            muted
            loop
          />
        ) : (
          <Image
            src={allMedia[selectedMedia] || coverUrl}
            alt="Game media"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}
      </div>

      {/* Gallery Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => setSelectedMedia(index)}
              className={`relative flex-shrink-0 w-24 h-16 rounded overflow-hidden border-2 transition-all ${
                selectedMedia === index
                  ? "border-white/40 scale-105"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {index === 0 && videoUrl ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              ) : (
                <Image
                  src={media}
                  alt={`Gallery ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

