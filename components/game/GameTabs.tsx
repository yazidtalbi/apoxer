"use client";

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface GameTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function GameTabs({ tabs, activeTab, onTabChange }: GameTabsProps) {
  return (
    <div className="border-b border-white/10 mb-8">
      <div className="flex gap-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative pb-4 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "text-white"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
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

