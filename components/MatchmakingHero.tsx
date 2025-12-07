"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Zap, Search, ChevronDown } from "lucide-react";
import { useLobby } from "@/contexts/LobbyContext";
import { Game } from "@/types";

const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile", "Cross-platform"];

interface MatchmakingHeroProps {
  featuredGames?: Game[];
}

export default function MatchmakingHero({ featuredGames = [] }: MatchmakingHeroProps) {
  const { setGame, setShowLobby } = useLobby();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [games, setGames] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(undefined);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);

  // Search games from database
  useEffect(() => {
    if (searchQuery.length < 2) {
      setGames([]);
      setShowDropdown(false);
      return;
    }

    const searchGames = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/games?q=${encodeURIComponent(searchQuery)}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setGames(data);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Error searching games:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchGames, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Update dropdown width when it should be shown
  useEffect(() => {
    if (showDropdown && searchInputRef.current) {
      setDropdownWidth(searchInputRef.current.getBoundingClientRect().width);
    }
  }, [showDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setSearchQuery(game.title);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleLaunch = () => {
    if (!selectedGame || !selectedPlatform) return;

    // Set the game in the lobby context
    setGame(selectedGame);
    setShowLobby(true);

    // Scroll to top to see the sidebar lobby
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isDisabled = !selectedGame || !selectedPlatform;

  // Split games for left and right sides
  const leftGames = featuredGames.slice(0, Math.ceil(featuredGames.length / 2));
  const rightGames = featuredGames.slice(Math.ceil(featuredGames.length / 2));

  return (
    <div className="mb-16 py-12 relative">
      <div className="max-w-7xl mx-auto px-4">
        {/* Game Images - Left Side */}
        {leftGames.length > 0 && (
          <div className="absolute left-4 xl:left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-0">
            {leftGames.map((game, index) => {
              const coverUrl = (game as any).cover_url || game.coverUrl;
              if (!coverUrl) return null;
              return (
                <div
                  key={game.id}
                  className="relative w-20 h-28 xl:w-24 xl:h-32 rounded-xl overflow-hidden shadow-2xl opacity-70 hover:opacity-100 transition-all hover:scale-105"
                  style={{
                    transform: `translateX(${index * 6}px)`,
                  }}
                >
                  <Image
                    src={coverUrl}
                    alt={game.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Game Images - Right Side */}
        {rightGames.length > 0 && (
          <div className="absolute right-4 xl:right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-0">
            {rightGames.map((game, index) => {
              const coverUrl = (game as any).cover_url || game.coverUrl;
              if (!coverUrl) return null;
              return (
                <div
                  key={game.id}
                  className="relative w-20 h-28 xl:w-24 xl:h-32 rounded-xl overflow-hidden shadow-2xl opacity-70 hover:opacity-100 transition-all hover:scale-105"
                  style={{
                    transform: `translateX(-${index * 6}px)`,
                  }}
                >
                  <Image
                    src={coverUrl}
                    alt={game.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto relative z-10 ">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
          A new way to play
          </h2>
          <p className="text-white/60 text-lg text-center mb-10 max-w-md mx-auto ">
          Find active players, guides, servers, and communities instantly.
          </p>

          {/* Integrated Search Bar - All inputs on same line */}
          <div ref={searchRef} className="relative">
            <div className="flex items-stretch gap-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-lg">
              {/* Game Search Input */}
              <div ref={searchInputRef} className="flex-1 relative">
                <div className="relative h-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedGame(null);
                    }}
                    onFocus={() => {
                      // Show dropdown if we have results, or if search is in progress
                      if (games.length > 0 || searchQuery.length >= 2) {
                        setShowDropdown(true);
                      }
                    }}
                    placeholder="What game are you looking for?"
                    className="w-full h-14 bg-transparent border-0 px-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none text-base relative z-10"
                  />
                  
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="w-px bg-white/10" />

              {/* Platform Select */}
              <div className="relative w-48 flex-shrink-0">
                <div className="relative h-full">
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full h-14 bg-transparent border-0 px-4 pr-10 text-white focus:outline-none appearance-none cursor-pointer text-base"
                  >
                    <option value="" className="bg-[#0E0E0E] text-white/40">
                      Platform
                    </option>
                    {PLATFORMS.map((platform) => (
                      <option key={platform} value={platform} className="bg-[#0E0E0E]">
                        {platform}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>

              {/* Divider */}
              <div className="w-px bg-white/10" />

              {/* Launch Button - Integrated */}
              <button
                onClick={handleLaunch}
                disabled={isDisabled}
                className="px-8 bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600 transition-all flex items-center justify-center gap-2 text-base whitespace-nowrap"
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>Start Matchmaking</span>
              </button>
            </div>
          
          {/* Dropdown Results - Positioned outside overflow-hidden container */}
          {showDropdown && games.length > 0 && dropdownWidth && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-[#0E0E0E] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto" style={{ width: `${dropdownWidth}px` }}>
                {games.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleGameSelect(game)}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                  >
                    <div className="text-white text-sm font-medium">{game.title}</div>
                    {game.genres && game.genres.length > 0 && (
                      <div className="text-white/60 text-xs mt-1">
                        {game.genres.slice(0, 2).join(", ")}
                      </div>
                    )}
                </button>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
