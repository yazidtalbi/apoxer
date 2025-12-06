"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for Client Components
 * This client handles authentication automatically
 */
export function createClientSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

