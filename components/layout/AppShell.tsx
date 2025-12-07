"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Gamepad2, Users, Bell, Settings, Search } from "lucide-react";
import SidebarLobby from "./SidebarLobby";
import LobbyModal from "@/components/game/LobbyModal";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/games", icon: Gamepad2, label: "Games" },
    { href: "/social", icon: Users, label: "Social" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0E0E0E]">
      {/* Header - Full Width */}
      <header className="sticky top-0 z-50 backdrop-blur-md pt-2 sm:pt-3 pb-2 sm:pb-3">
        <div className="flex items-center gap-4 px-4 sm:px-6 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
           {/*   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-bold">A</span>
            </div> */}
            <span className="text-white font-bold text-lg hidden sm:block">Apoxer</span>
          </Link>

          {/* Search Bar - Centered */}
          <div className="flex-1 flex justify-center">
            <div className="relative max-w-lg w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="search"
                placeholder="Search games, players..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors shadow-sm"
              />
            </div>
          </div>

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0 shadow-md" />
        </div>
      </header>

      {/* Main Content Area - Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden px-2 sm:px-3 pb-2 sm:pb-3 gap-2 sm:gap-3">
        {/* Sidebar - Hidden on mobile, visible on sm+ */}
        <aside className="hidden sm:flex flex-col w-[300px] bg-[#121212] rounded-2xl flex-shrink-0">
          {/* Top Group */}
          <div className="flex flex-col py-6 px-4 gap-6">
            {/* Navigation Items */}
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      active
                        ? "bg-[#0E0E0E] text-white shadow-sm"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Lobby Info */}
          <SidebarLobby />

          {/* Bottom Group */}
          <div className="mt-auto flex flex-col gap-1 px-4 pb-4">
            <button
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">Notifications</span>
            </button>
            <button
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">Settings</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto rounded-2xl bg-[#1A1A1A]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8 w-full">{children}</div>
          </main>
        </div>
      </div>

      {/* Lobby Modal - Global */}
      <LobbyModal />
    </div>
  );
}

