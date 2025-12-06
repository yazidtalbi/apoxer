"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase-client";

interface AddToYourGamesButtonProps {
  gameId: string;
}

export default function AddToYourGamesButton({ gameId }: AddToYourGamesButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndLibrary();
  }, [gameId]);

  const checkAuthAndLibrary = async () => {
    try {
      const supabase = createClientSupabaseClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        setUser(null);
        setIsInLibrary(false);
        setIsLoading(false);
        return;
      }

      setUser(currentUser);

      // Check if game is in library
      const { data, error } = await supabase
        .from("user_games")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("game_id", gameId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking library:", error);
      }

      setIsInLibrary(!!data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsLoading(false);
    }
  };

  const handleAddToLibrary = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsAdding(true);
    try {
      const supabase = createClientSupabaseClient();
      const { error } = await supabase.from("user_games").insert({
        user_id: user.id,
        game_id: gameId,
      });

      if (error) {
        console.error("Error adding game:", error);
        alert("Failed to add game. Please try again.");
      } else {
        setIsInLibrary(true);
        router.refresh();
      }
    } catch (error) {
      console.error("Error adding game:", error);
      alert("Failed to add game. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="bg-white/10 text-white px-6 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded transition-colors"
      >
        Log in to save
      </button>
    );
  }

  if (isInLibrary) {
    return (
      <button
        disabled
        className="bg-white/10 text-white px-6 py-2 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        <svg
          className="w-4 h-4"
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
        In Your Games
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToLibrary}
      disabled={isAdding}
      className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isAdding ? "Adding..." : "Add to Your Games"}
    </button>
  );
}

