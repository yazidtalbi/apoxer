"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Game } from "@/types";

interface LobbyContextType {
  game: Game | null;
  showLobby: boolean;
  setGame: (game: Game | null) => void;
  setShowLobby: (show: boolean) => void;
  openLobbyModal: () => void;
  isLobbyModalOpen: boolean;
  setIsLobbyModalOpen: (open: boolean) => void;
}

const LobbyContext = createContext<LobbyContextType | undefined>(undefined);

const STORAGE_KEY = "activeLobbyGame";

export function LobbyProvider({ children }: { children: ReactNode }) {
  const [game, setGameState] = useState<Game | null>(null);
  const [showLobby, setShowLobbyState] = useState(false);
  const [isLobbyModalOpen, setIsLobbyModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setGameState(parsed.game);
          setShowLobbyState(parsed.showLobby);
        } catch (e) {
          console.error("Error loading lobby from localStorage:", e);
        }
      }
    }
  }, []);

  // Persist to localStorage when state changes
  const setGame = (newGame: Game | null) => {
    setGameState(newGame);
    if (typeof window !== "undefined") {
      const current = localStorage.getItem(STORAGE_KEY);
      const parsed = current ? JSON.parse(current) : { showLobby: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ game: newGame, showLobby: parsed.showLobby }));
    }
  };

  const setShowLobby = (show: boolean) => {
    setShowLobbyState(show);
    if (typeof window !== "undefined") {
      const current = localStorage.getItem(STORAGE_KEY);
      const parsed = current ? JSON.parse(current) : { game: null };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ game: parsed.game, showLobby: show }));
      if (!show) {
        // Clear game when hiding lobby
        setGameState(null);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ game: null, showLobby: false }));
      }
    }
  };

  const openLobbyModal = () => {
    setIsLobbyModalOpen(true);
  };

  return (
    <LobbyContext.Provider
      value={{
        game,
        showLobby,
        setGame,
        setShowLobby,
        openLobbyModal,
        isLobbyModalOpen,
        setIsLobbyModalOpen,
      }}
    >
      {children}
    </LobbyContext.Provider>
  );
}

export function useLobby() {
  const context = useContext(LobbyContext);
  if (context === undefined) {
    return {
      game: null,
      showLobby: false,
      setGame: () => {},
      setShowLobby: () => {},
      openLobbyModal: () => {},
      isLobbyModalOpen: false,
      setIsLobbyModalOpen: () => {},
    };
  }
  return context;
}

