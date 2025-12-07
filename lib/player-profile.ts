import { createServerSupabaseClient } from "./supabase-server";

/**
 * Creates a player profile for a user if one doesn't exist
 * @param userId - The auth user ID
 * @returns The created or existing player profile ID
 */
export async function ensurePlayerProfile(userId: string): Promise<string | null> {
  const supabase = await createServerSupabaseClient();

  // First, check if player profile already exists
  const { data: existingPlayer, error: checkError } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (existingPlayer) {
    return existingPlayer.id;
  }

  // If no profile exists, create one
  // Get user email for default username
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return null;
  }

  // Generate a unique username from email
  const emailUsername = user.email?.split("@")[0] || "user";
  let username = emailUsername.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  // Ensure username is not empty and add random suffix if needed
  if (!username || username.length < 3) {
    username = `user${Math.random().toString(36).substring(2, 8)}`;
  }

  // Check if username is taken, if so add a number
  let finalUsername = username;
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from("players")
      .select("id")
      .eq("username", finalUsername)
      .limit(1)
      .single();

    if (!existing) {
      break; // Username is available
    }

    finalUsername = `${username}${Math.floor(Math.random() * 1000)}`;
    attempts++;
  }

  // Create the player profile
  const displayName = user.user_metadata?.display_name || 
                     user.user_metadata?.full_name || 
                     user.email?.split("@")[0] || 
                     "User";

  const { data: newPlayer, error: createError } = await supabase
    .from("players")
    .insert({
      user_id: userId,
      username: finalUsername,
      display_name: displayName,
      platform: null,
      status: "offline",
      bio: null,
      avatar_url: null,
      timezone: null,
      location: null,
      website: null,
    })
    .select("id")
    .single();

  if (createError) {
    console.error("Error creating player profile:", createError);
    return null;
  }

  return newPlayer?.id || null;
}

/**
 * Gets or creates a player profile for the current user
 * @returns The player profile ID, or null if user is not authenticated
 */
export async function getOrCreatePlayerProfile(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  return await ensurePlayerProfile(user.id);
}

