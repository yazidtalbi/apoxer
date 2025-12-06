"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const GENRES = [
  { value: "", label: "All Genres" },
  { value: "FPS", label: "FPS" },
  { value: "Tactical", label: "Tactical" },
  { value: "Battle Royale", label: "Battle Royale" },
  { value: "MOBA", label: "MOBA" },
  { value: "RPG", label: "RPG" },
  { value: "Strategy", label: "Strategy" },
  { value: "Action", label: "Action" },
  { value: "Adventure", label: "Adventure" },
  { value: "Sports", label: "Sports" },
  { value: "Racing", label: "Racing" },
  { value: "Horror", label: "Horror" },
  { value: "Sandbox", label: "Sandbox" },
  { value: "Survival", label: "Survival" },
  { value: "Party", label: "Party" },
  { value: "Social Deduction", label: "Social Deduction" },
  { value: "Hero Shooter", label: "Hero Shooter" },
  { value: "Asymmetric", label: "Asymmetric" },
  { value: "MMO", label: "MMO" },
  { value: "Looter-shooter", label: "Looter-shooter" },
];

const PLATFORMS = [
  { value: "", label: "All Platforms" },
  { value: "PC", label: "PC" },
  { value: "PlayStation", label: "PlayStation" },
  { value: "Xbox", label: "Xbox" },
  { value: "Nintendo Switch", label: "Nintendo Switch" },
  { value: "Mobile", label: "Mobile" },
];

export default function GameFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get("genre") || "");
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get("platform") || "");

  // Update local state when URL params change (e.g., browser back/forward)
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setSelectedGenre(searchParams.get("genre") || "");
    setSelectedPlatform(searchParams.get("platform") || "");
  }, [searchParams]);

  const updateFilters = (updates: { q?: string; genre?: string; platform?: string }) => {
    const params = new URLSearchParams();

    // Keep existing params and update with new ones
    const newQ = updates.q !== undefined ? updates.q : searchQuery;
    const newGenre = updates.genre !== undefined ? updates.genre : selectedGenre;
    const newPlatform = updates.platform !== undefined ? updates.platform : selectedPlatform;

    if (newQ) params.set("q", newQ);
    if (newGenre) params.set("genre", newGenre);
    if (newPlatform) params.set("platform", newPlatform);

    const queryString = params.toString();
    router.push(`/games${queryString ? `?${queryString}` : ""}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchQuery });
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedGenre(value);
    updateFilters({ genre: value });
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPlatform(value);
    updateFilters({ platform: value });
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games by title..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-10 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </form>

      {/* Filter Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={selectedGenre}
          onChange={handleGenreChange}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
        >
          {GENRES.map((genre) => (
            <option key={genre.value} value={genre.value} className="bg-[#0E0E0E]">
              {genre.label}
            </option>
          ))}
        </select>

        <select
          value={selectedPlatform}
          onChange={handlePlatformChange}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
        >
          {PLATFORMS.map((platform) => (
            <option key={platform.value} value={platform.value} className="bg-[#0E0E0E]">
              {platform.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

