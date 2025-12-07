"use client";

import { LayoutDashboard, Calendar, Users, BookOpen, Gamepad2 } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Tab {
  key: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface ProfileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ProfileTabs({ tabs, activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex border-b border-white/10 gap-6 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-2 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              isActive
                ? "text-white border-purple-500"
                : "text-white/60 border-transparent hover:text-white/80"
            }`}
            role="tab"
            aria-selected={isActive}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-white/40 text-xs">({tab.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

