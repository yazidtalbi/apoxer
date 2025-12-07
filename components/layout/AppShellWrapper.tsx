import { getCurrentUser } from "@/lib/supabase-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AppShell from "./AppShell";

interface AppShellWrapperProps {
  children: React.ReactNode;
}

export default async function AppShellWrapper({ children }: AppShellWrapperProps) {
  // Get user data server-side
  const user = await getCurrentUser();
  
  let initialUserEmail: string | null = null;
  let initialUsername: string | null = null;
  let initialDisplayName: string | null = null;
  let initialAvatarUrl: string | null = null;

  if (user) {
    initialUserEmail = user.email || null;
    
    // Try to get player profile
    try {
      const supabase = await createServerSupabaseClient();
      const { data: playerData } = await supabase
        .from("players")
        .select("username, display_name, avatar_url")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (playerData) {
        initialUsername = playerData.username;
        initialDisplayName = playerData.display_name;
        initialAvatarUrl = playerData.avatar_url;
      }
    } catch (error) {
      // Player profile doesn't exist yet, that's okay
      // We'll still show the email
    }
  }

  return (
    <AppShell
      initialUserEmail={initialUserEmail}
      initialUsername={initialUsername}
      initialDisplayName={initialDisplayName}
      initialAvatarUrl={initialAvatarUrl}
    >
      {children}
    </AppShell>
  );
}

