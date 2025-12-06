"use client";

import { useState } from "react";
import { seedDatabase } from "@/lib/seed";

/**
 * Development seed page
 * 
 * HOW TO USE:
 * 1. Make sure your Supabase environment variables are set in .env.local:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 
 * 2. Navigate to http://localhost:3000/dev/seed in your browser
 * 
 * 3. Click the "Seed Database" button to populate your database with sample data
 * 
 * 4. This will insert:
 *    - 18 popular multiplayer games
 *    - 1-3 Discord communities per game
 * 
 * NOTE: This page should only be accessible in development.
 * The seed function will skip games that already exist (by slug).
 */
export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    gamesInserted: number;
    communitiesInserted: number;
    errors: string[];
  } | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Call the seed function via an API route
      const response = await fetch("/api/dev/seed", {
        method: "POST",
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        gamesInserted: 0,
        communitiesInserted: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-white mb-4">Database Seed</h1>
        <div className="bg-[#0E0E0E] border border-white/10 rounded p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-white/80 text-sm">
            <li>Make sure your Supabase environment variables are set in .env.local</li>
            <li>Click the button below to seed your database</li>
            <li>This will insert 18 games and 1-3 communities per game</li>
            <li>Games that already exist (by slug) will be skipped</li>
          </ol>
        </div>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white px-6 py-3 rounded transition-colors mb-6"
        >
          {loading ? "Seeding..." : "Seed Database"}
        </button>

        {result && (
          <div className="bg-[#0E0E0E] border border-white/10 rounded p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Results</h2>
            <div className="space-y-2 text-sm">
              <p className="text-white">
                Games inserted: <span className="text-white/80">{result.gamesInserted}</span>
              </p>
              <p className="text-white">
                Communities inserted:{" "}
                <span className="text-white/80">{result.communitiesInserted}</span>
              </p>
              {result.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-white font-medium mb-2">Errors:</p>
                  <ul className="list-disc list-inside space-y-1 text-white/60">
                    {result.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

