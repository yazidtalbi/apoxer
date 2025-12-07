"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Users, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: Date;
  type: "message" | "system" | "join" | "leave";
}

interface LobbyUser {
  id: string;
  username: string;
  avatar?: string;
  status: "online" | "away" | "in-game";
}

interface LobbyChatProps {
  gameId: string;
  currentUserId: string;
  currentUsername: string;
}

// Dummy users for the lobby
const DUMMY_LOBBY_USERS: LobbyUser[] = [
  { id: "user-1", username: "ProGamer123", status: "online" },
  { id: "user-2", username: "SniperElite", status: "online" },
  { id: "user-3", username: "TeamPlayer", status: "online" },
  { id: "user-4", username: "QuickShot", status: "away" },
];

// Dummy messages
const DUMMY_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    userId: "user-1",
    username: "ProGamer123",
    message: "Hey everyone! Ready to start?",
    timestamp: new Date(Date.now() - 120000),
    type: "message",
  },
  {
    id: "msg-2",
    userId: "system",
    username: "System",
    message: "SniperElite joined the lobby",
    timestamp: new Date(Date.now() - 90000),
    type: "join",
  },
  {
    id: "msg-3",
    userId: "user-2",
    username: "SniperElite",
    message: "Yep, I'm ready. Who wants to team up?",
    timestamp: new Date(Date.now() - 60000),
    type: "message",
  },
];

export default function LobbyChat({ gameId, currentUserId, currentUsername }: LobbyChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(DUMMY_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate new messages from other users (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance
        const randomUser = DUMMY_LOBBY_USERS[Math.floor(Math.random() * DUMMY_LOBBY_USERS.length)];
        if (randomUser.id !== currentUserId) {
          const randomMessages = [
            "Anyone need a teammate?",
            "Let's go!",
            "Ready when you are",
            "Discord link in voice channel?",
            "Add me on Discord!",
          ];
          const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            userId: randomUser.id,
            username: randomUser.username,
            message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
            timestamp: new Date(),
            type: "message",
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUserId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUserId,
      username: currentUsername,
      message: inputValue.trim(),
      timestamp: new Date(),
      type: "message",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
        aria-label="Expand chat"
      >
        <MessageSquare className="w-4 h-4 text-white/60" aria-hidden="true" />
        <span className="text-white/60 text-xs">Chat</span>
        {messages.length > 0 && (
          <span className="ml-auto bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0E0E0E] border border-white/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#121212]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-white/60" aria-hidden="true" />
          <h3 className="text-white text-sm font-medium">Lobby Chat</h3>
          <span className="text-white/40 text-xs">({DUMMY_LOBBY_USERS.length} online)</span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-white/40 hover:text-white/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded"
          aria-label="Minimize chat"
        >
          <span className="text-xs">−</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 min-h-0" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((msg) => {
          const isOwnMessage = msg.userId === currentUserId;
          const isSystem = msg.type === "system" || msg.type === "join" || msg.type === "leave";

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center">
                <span className="text-white/40 text-xs italic">{msg.message}</span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {getInitials(msg.username)}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} max-w-[80%]`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-white/60 text-xs font-medium">{msg.username}</span>
                  <span className="text-white/30 text-xs">{formatTime(msg.timestamp)}</span>
                </div>
                <div
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    isOwnMessage
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-white/90"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-white/10 p-2">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            aria-label="Chat message input"
            maxLength={200}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-purple-600 hover:bg-purple-700 text-white h-9 w-9 flex-shrink-0"
            disabled={!inputValue.trim()}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
        <p className="text-white/30 text-xs mt-1 px-1">
          Press Enter to send • Keep it friendly
        </p>
      </form>
    </div>
  );
}

