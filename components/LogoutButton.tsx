"use client";

import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase-client";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClientSupabaseClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full bg-[#0E0E0E] border border-white/10 rounded p-4 text-left hover:bg-white/5 transition-colors disabled:opacity-50"
    >
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-medium">
          {isLoading ? "Logging out..." : "Logout"}
        </span>
        <svg
          className="w-5 h-5 text-white/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}

