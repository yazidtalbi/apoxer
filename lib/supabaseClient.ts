import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
  );
}

/**
 * Supabase client for use in Client Components
 * 
 * Usage in Client Components:
 * ```tsx
 * 'use client'
 * import { supabase } from '@/lib/supabaseClient'
 * 
 * const { data, error } = await supabase.from('table').select()
 * ```
 * 
 * Usage in Server Components:
 * For server components, you should create a server-side client that handles cookies
 * for authentication. You can create a separate function like:
 * 
 * ```tsx
 * import { createServerClient } from '@supabase/ssr'
 * import { cookies } from 'next/headers'
 * 
 * export async function createClient() {
 *   const cookieStore = await cookies()
 *   return createServerClient(
 *     process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 *     {
 *       cookies: {
 *         getAll() { return cookieStore.getAll() },
 *         setAll(cookiesToSet) { ... }
 *       }
 *     }
 *   )
 * }
 * ```
 * 
 * Or use this client for read-only operations that don't require authentication.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

