"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Home, Gamepad2, Users, Bell, Settings, Search } from "lucide-react";
import LobbySidebar from "./LobbySidebar";
import LobbySidebarCompact from "./LobbySidebarCompact";
import LobbyModal from "@/components/game/LobbyModal";
import { useLobby } from "@/contexts/LobbyContext";
import { createClientSupabaseClient } from "@/lib/supabase-client";

interface AppShellProps {
  children: React.ReactNode;
  initialUserEmail?: string | null;
  initialUsername?: string | null;
  initialDisplayName?: string | null;
  initialAvatarUrl?: string | null;
}

export default function AppShell({ 
  children,
  initialUserEmail = null,
  initialUsername = null,
  initialDisplayName = null,
  initialAvatarUrl = null,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { showLobby } = useLobby();
  const [isLobbySidebarExpanded, setIsLobbySidebarExpanded] = useState(true);
  const [username, setUsername] = useState<string | null>(initialUsername);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [displayName, setDisplayName] = useState<string | null>(initialDisplayName);
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);

  // Debug: Log state changes
  useEffect(() => {
    console.log("🟢 State changed - userEmail:", userEmail, "username:", username);
  }, [userEmail, username]);

  useEffect(() => {
    console.log("🟡 useEffect STARTED - AppShell mounted");
    
    const loadUserProfile = async () => {
      console.log("🟡 loadUserProfile FUNCTION CALLED");
      
      // Quick test - is Supabase URL configured?
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      console.log("🟡 Environment check:", { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseKey,
        urlLength: supabaseUrl?.length || 0 
      });
      try {
        console.log("🟡 Creating Supabase client...");
        const supabase = createClientSupabaseClient();
        console.log("🟡 Supabase client created, checking auth...");
        
        // Try getSession first (more reliable for initial load)
        console.log("🟡 Calling getSession()...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("🔵 Session check:", { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          email: session?.user?.email,
          error: sessionError?.message 
        });
        
        // Get current user
        console.log("🟡 Calling getUser()...");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log("🔵 User check:", { 
          hasUser: !!user,
          email: user?.email,
          userId: user?.id,
          error: userError?.message 
        });
        
        // Use session user if available, otherwise use getUser result
        const activeUser = session?.user || user;
        
        if (userError && sessionError && !activeUser) {
          console.error("❌ Error getting user:", userError, "Session error:", sessionError);
          setUserEmail(null);
          setUsername(null);
          setDisplayName(null);
          setAvatarUrl(null);
          return;
        }

        if (!activeUser) {
          // User not logged in
          console.log("❌ No active user found");
          setUsername(null);
          setDisplayName(null);
          setAvatarUrl(null);
          setUserEmail(null);
          return;
        }

        // Store email immediately
        const email = activeUser.email || null;
        console.log("✅ Setting userEmail to:", email);
        setUserEmail(email);
        console.log("✅ User logged in, email:", email, "user.id:", activeUser.id);

        // Get player profile
        let { data: playerData, error: playerError } = await supabase
          .from("players")
          .select("username, display_name, avatar_url")
          .eq("user_id", activeUser.id)
          .single();
        
        console.log("🔵 Player query result:", { 
          hasData: !!playerData, 
          username: playerData?.username,
          errorCode: playerError?.code, 
          errorMsg: playerError?.message 
        });

        // If player profile doesn't exist, create it
        if (playerError && playerError.code === "PGRST116") {
          // Profile doesn't exist, create it
          console.log("🔵 Creating new player profile...");
          const emailUsername = activeUser.email?.split("@")[0] || "user";
          let username = emailUsername.toLowerCase().replace(/[^a-z0-9]/g, "");
          
          if (!username || username.length < 3) {
            username = `user${Math.random().toString(36).substring(2, 8)}`;
          }

          // Check if username is taken and generate unique one
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
              break;
            }
            finalUsername = `${username}${Math.floor(Math.random() * 1000)}`;
            attempts++;
          }

          const displayName = activeUser.user_metadata?.display_name || 
                             activeUser.user_metadata?.full_name || 
                             activeUser.email?.split("@")[0] || 
                             "User";

          console.log("🔵 Creating profile with:", { username: finalUsername, displayName, userId: activeUser.id });

          // Create the profile
          const { data: newPlayer, error: createError } = await supabase
            .from("players")
            .insert({
              user_id: activeUser.id,
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
            .select("username, display_name, avatar_url")
            .single();

          if (createError) {
            console.error("❌ Error creating player profile:", createError);
            setUsername(null);
            setDisplayName(null);
            setAvatarUrl(null);
            // Keep email set
            return;
          }

          console.log("✅ Profile created successfully:", newPlayer?.username);
          playerData = newPlayer;
        } else if (playerError) {
          // Other error - but still show email if user is logged in
          console.error("Error fetching player profile:", playerError);
          setUsername(null);
          setDisplayName(null);
          setAvatarUrl(null);
          // Keep email set from earlier
          return;
        }

        if (playerData) {
          console.log("✅ Player profile found:", playerData.username);
          setUsername(playerData.username);
          setDisplayName(playerData.display_name);
          setAvatarUrl(playerData.avatar_url);
        } else {
          // If no player profile but user is logged in, still show email
          console.log("⚠️ No player profile, but user is logged in. Email:", email);
        }
        
        console.log("🔵 Final state after loadUserProfile:", { 
          userEmail, 
          username, 
          displayName 
        });
      } catch (error) {
        console.error("❌ ERROR in loadUserProfile:", error);
        console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack");
        setUsername(null);
        setDisplayName(null);
        setAvatarUrl(null);
        // Try to at least set email if user exists
        try {
          console.log("🟡 Attempting fallback email fetch...");
          const supabase = createClientSupabaseClient();
          const { data: { user } } = await supabase.auth.getUser();
          console.log("🟡 Fallback user:", user?.email);
          if (user) {
            setUserEmail(user.email || null);
          } else {
            setUserEmail(null);
          }
        } catch (fallbackError) {
          console.error("❌ Fallback error:", fallbackError);
          setUserEmail(null);
        }
      }
    };

    console.log("🟡 About to call loadUserProfile()");
    loadUserProfile().catch((err) => {
      console.error("❌ Unhandled promise rejection:", err);
    });

    // Listen for auth changes
    const supabase = createClientSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        loadUserProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

          {/* Right Side - User Profile */}
          {(() => {
            console.log("🔴 Navbar render - userEmail:", userEmail, "username:", username);
            return userEmail ? (
            <Link
              href={username ? `/profile/${username}` : "/profile"}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0 group"
            >
              {avatarUrl ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={avatarUrl}
                    alt={displayName || username || userEmail || "User"}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white text-xs font-semibold">
                    {(displayName || username || userEmail || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex flex-col hidden md:flex">
                <span className="text-white text-sm font-medium group-hover:text-white/80 transition-colors leading-tight">
                  {displayName || username || userEmail?.split("@")[0] || "User"}
                </span>
                <span className="text-white/60 text-xs leading-tight">
                  {userEmail}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0 shadow-md" />
               <span className="text-white text-sm font-medium hidden md:block">Sign In</span>
             </Link>
           );
          })()}
        </div>
      </header>

      {/* Main Content Area - Left Sidebar - Lobby Sidebar - Content */}
      <div className="flex flex-1 overflow-hidden px-2 sm:px-3 pb-2 sm:pb-3 gap-2 sm:gap-3">
        {/* Primary Sidebar - Icon only */}
        <aside className="hidden sm:flex flex-col w-16 bg-[#121212] rounded-2xl flex-shrink-0">
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
                    title={item.label}
                    className={`flex items-center justify-center px-3 py-2.5 rounded-lg transition-colors ${
                      active
                        ? "bg-[#0E0E0E] text-white shadow-sm"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Lobby Compact Section */}
          {showLobby && (
            <>
              {/* Horizontal Separator */}
              <div className="border-t border-white/10 mx-4"></div>
              <LobbySidebarCompact onExpand={() => setIsLobbySidebarExpanded(true)} />
            </>
          )}

          {/* Bottom Group */}
          <div className="mt-auto flex flex-col gap-1 px-4 pb-4">
            <button
              title="Notifications"
              className="flex items-center justify-center px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5 flex-shrink-0" />
            </button>
            <button
              title="Settings"
              className="flex items-center justify-center px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
            </button>
          </div>
        </aside>

        {/* Secondary Sidebar - Lobby with players (next to left sidebar, when lobby is active and expanded) */}
        {showLobby && isLobbySidebarExpanded && (
          <aside className="hidden lg:flex flex-col w-[360px] bg-[#121212] rounded-2xl flex-shrink-0 transition-all duration-300">
            <LobbySidebar onCollapse={() => setIsLobbySidebarExpanded(false)} />
          </aside>
        )}

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

