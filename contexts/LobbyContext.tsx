"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Game } from "@/types";

interface LobbyContextType {
  game: Game | null;
  showLobby: boolean;
  setGame: (game: Game | null) => void;
  setShowLobby: (show: boolean) => void;
  openLobbyModal: () => void;
  closeLobbyModal: () => void;
  isLobbyModalOpen: boolean;
  setIsLobbyModalOpen: (open: boolean) => void;
  matchmakingState: "idle" | "searching" | "found" | "connecting" | "ready" | "error";
  setMatchmakingState: (state: "idle" | "searching" | "found" | "connecting" | "ready" | "error") => void;
}

const LobbyContext = createContext<LobbyContextType | undefined>(undefined);

const STORAGE_KEY = "activeLobbyGame";

export function LobbyProvider({ children }: { children: ReactNode }) {
  const [game, setGameState] = useState<Game | null>(null);
  const [showLobby, setShowLobbyState] = useState(false);
  const [isLobbyModalOpen, setIsLobbyModalOpen] = useState(false);
  const [matchmakingState, setMatchmakingState] = useState<"idle" | "searching" | "found" | "connecting" | "ready" | "error">("idle");

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.game && parsed.showLobby) {
            setGameState(parsed.game);
            setShowLobbyState(parsed.showLobby);
            setMatchmakingState("searching");
          }
        } catch (e) {
          console.error("Error loading lobby from localStorage:", e);
        }
      }
    }
  }, []);

  // Persist to localStorage when state changes
  const setGame = useCallback((newGame: Game | null) => {
    setGameState(newGame);
    if (typeof window !== "undefined") {
      const current = localStorage.getItem(STORAGE_KEY);
      const parsed = current ? JSON.parse(current) : { showLobby: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ game: newGame, showLobby: parsed.showLobby }));
      
      // Reset matchmaking state when game changes
      if (newGame) {
        setMatchmakingState("searching");
      } else {
        setMatchmakingState("idle");
      }
    }
  }, []);

  const setShowLobby = useCallback((show: boolean) => {
    setShowLobbyState(show);
    if (typeof window !== "undefined") {
      const current = localStorage.getItem(STORAGE_KEY);
      const parsed = current ? JSON.parse(current) : { game: null };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ game: parsed.game, showLobby: show }));
      
      if (!show) {
        // Clear game when hiding lobby
        setGameState(null);
        setMatchmakingState("idle");
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ game: null, showLobby: false }));
      } else if (parsed.game) {
        // Start searching when showing lobby
        setMatchmakingState("searching");
      }
    }
  }, []);

  const openLobbyModal = useCallback(() => {
    setIsLobbyModalOpen(true);
  }, []);

  const closeLobbyModal = useCallback(() => {
    setIsLobbyModalOpen(false);
  }, []);

  return (
    <LobbyContext.Provider
      value={{
        game,
        showLobby,
        setGame,
        setShowLobby,
        openLobbyModal,
        closeLobbyModal,
        isLobbyModalOpen,
        setIsLobbyModalOpen,
        matchmakingState,
        setMatchmakingState,
      }}
    >
      {children}
    </LobbyContext.Provider>
  );
}

export function useLobby() {
  const context = useContext(LobbyContext);
  if (context === undefined) {
    // Return safe defaults for components outside provider
    return {
      game: null,
      showLobby: false,
      setGame: () => {},
      setShowLobby: () => {},
      openLobbyModal: () => {},
      closeLobbyModal: () => {},
      isLobbyModalOpen: false,
      setIsLobbyModalOpen: () => {},
      matchmakingState: "idle" as const,
      setMatchmakingState: () => {},
    };
  }
  return context;
}
