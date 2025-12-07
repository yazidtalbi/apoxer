"use client";

import { LucideIcon } from "lucide-react";

interface Tab {
  key: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

interface GameTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function GameTabs({ tabs, activeTab, onTabChange }: GameTabsProps) {
  return (
    <div className="w-full border-b border-white/10 mb-8">
      <div className="flex gap-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative pb-4 px-1 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "text-white"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              {tab.icon && <tab.icon className="w-4 h-4 flex-shrink-0" />}
              {tab.label}
              {typeof tab.count === "number" && (
                <span className="ml-2 text-white/40">({tab.count})</span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white animate-in fade-in" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

