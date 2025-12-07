"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase-client";

interface AddToYourGamesButtonProps {
  gameId: string;
  initialIsInLibrary?: boolean;
  hasUser?: boolean;
}

export default function AddToYourGamesButton({ gameId, initialIsInLibrary = false, hasUser: serverHasUser = false }: AddToYourGamesButtonProps) {
  const router = useRouter();
  const [isInLibrary, setIsInLibrary] = useState(initialIsInLibrary);
  const [isAdding, setIsAdding] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(!serverHasUser); // If server says user exists, don't show loading

  useEffect(() => {
    const supabase = createClientSupabaseClient();
    let mounted = true;
    
    // Get user immediately - try getSession first (faster), then getUser as fallback
    const checkUser = async () => {
      if (!mounted) return;
      
      try {
        // Try getSession first (faster, uses cached session)
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            setIsCheckingUser(false);
            return;
          }
        }
        
        // Fallback to getUser if session is null
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (mounted) {
          setUser(currentUser);
          setIsCheckingUser(false);
        }
      } catch (error) {
        console.error("Error getting user:", error);
        if (mounted) {
          setUser(null);
          setIsCheckingUser(false);
        }
      }
    };

    // Check user immediately
    checkUser();

    // Listen for auth state changes (including initial session)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      // Handle initial session restoration
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const currentUser = session?.user;
        if (mounted && currentUser) {
          setUser(currentUser);
          // Re-check library status when user signs in or session is restored
          const { data } = await supabase
            .from("user_games")
            .select("id")
            .eq("user_id", currentUser.id)
            .eq("game_id", gameId)
            .maybeSingle();
          if (mounted) {
            setIsInLibrary(!!data);
          }
        } else if (mounted && !currentUser) {
          setUser(null);
          setIsInLibrary(false);
        }
      } else if (event === "SIGNED_OUT") {
        if (mounted) {
          setUser(null);
          setIsInLibrary(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [gameId]);

  const handleAddToLibrary = async () => {
    const supabase = createClientSupabaseClient();
    
    // Get user if not already set
    let currentUser = user;
    if (!currentUser) {
      const { data: { user: fetchedUser } } = await supabase.auth.getUser();
      if (!fetchedUser) {
        router.push("/login");
        return;
      }
      currentUser = fetchedUser;
      setUser(fetchedUser);
    }

    setIsAdding(true);
    try {
      const { error } = await supabase.from("user_games").insert({
        user_id: currentUser.id,
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

  // If server confirmed user exists, trust that and show appropriate button
  // Otherwise, wait for client-side check
  if (isCheckingUser && !serverHasUser) {
    return (
      <button
        disabled
        className="w-full bg-white/10 text-white px-6 py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        Loading...
      </button>
    );
  }

  // If server says user exists but client hasn't found user yet, show button based on initialIsInLibrary
  if (serverHasUser && !user && !isCheckingUser) {
    // Server confirmed user exists, show appropriate button
    if (initialIsInLibrary) {
      return (
        <button
          disabled
          className="w-full bg-white/10 text-white px-6 py-3 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
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
        className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        {isAdding ? "Adding..." : "Add to Your Games"}
      </button>
    );
  }

  if (!user && !serverHasUser) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded transition-colors text-sm font-medium"
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

