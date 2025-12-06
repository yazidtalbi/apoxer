"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase-client";
import { Game } from "@/types";

interface EditPlayerStatusProps {
  userId: string;
  games: Game[];
}

const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"];
const STATUSES = [
  { value: "online", label: "Online" },
  { value: "looking", label: "Looking for players" },
  { value: "offline", label: "Offline" },
];

export default function EditPlayerStatus({ userId, games }: EditPlayerStatusProps) {
  const router = useRouter();
  const [selectedGameId, setSelectedGameId] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"online" | "looking" | "offline">("online");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);

  useEffect(() => {
    loadCurrentStatus();
  }, [userId]);

  const loadCurrentStatus = async () => {
    setIsLoading(true);
    try {
      const supabase = createClientSupabaseClient();
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data && !error) {
        setCurrentPlayer(data);
        setSelectedGameId(data.game_id);
        setSelectedPlatform(data.platform);
        setSelectedStatus(data.status);
      }
    } catch (error) {
      console.error("Error loading current status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameId || !selectedPlatform || !selectedStatus) {
      alert("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClientSupabaseClient();

      if (currentPlayer) {
        // Update existing player status
        const { error } = await supabase
          .from("players")
          .update({
            game_id: selectedGameId,
            platform: selectedPlatform,
            status: selectedStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentPlayer.id);

        if (error) throw error;
      } else {
        // Insert new player status
        const { error } = await supabase.from("players").insert({
          user_id: userId,
          game_id: selectedGameId,
          platform: selectedPlatform,
          status: selectedStatus,
        });

        if (error) throw error;
      }

      router.push("/social");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving status:", error);
      alert(`Failed to save status: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#0E0E0E] border border-white/10 rounded p-6">
        <p className="text-white/60 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#0E0E0E] border border-white/10 rounded p-6 space-y-4">
      <div>
        <label htmlFor="game" className="block text-white text-sm mb-2">
          Game
        </label>
        <select
          id="game"
          value={selectedGameId}
          onChange={(e) => setSelectedGameId(e.target.value)}
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
        >
          <option value="" className="bg-[#0E0E0E]">
            Select a game
          </option>
          {games.map((game) => (
            <option key={game.id} value={game.id} className="bg-[#0E0E0E]">
              {game.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="platform" className="block text-white text-sm mb-2">
          Platform
        </label>
        <select
          id="platform"
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
        >
          <option value="" className="bg-[#0E0E0E]">
            Select a platform
          </option>
          {PLATFORMS.map((platform) => (
            <option key={platform} value={platform} className="bg-[#0E0E0E]">
              {platform}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-white text-sm mb-2">
          Status
        </label>
        <select
          id="status"
          value={selectedStatus}
          onChange={(e) =>
            setSelectedStatus(e.target.value as "online" | "looking" | "offline")
          }
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
        >
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value} className="bg-[#0E0E0E]">
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : currentPlayer ? "Update Status" : "Save Status"}
      </button>
    </form>
  );
}

