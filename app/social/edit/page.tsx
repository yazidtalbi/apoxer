import { getCurrentUser } from "@/lib/supabase-server";
import { getGames } from "@/lib/games";
import { redirect } from "next/navigation";
import EditPlayerStatus from "@/components/EditPlayerStatus";

export default async function EditPlayerStatusPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const games = await getGames();

  return (
    <div className="py-8">
      <h1 className="text-3xl font-semibold text-white mb-8">Set Your Status</h1>
      <EditPlayerStatus userId={user.id} games={games} />
    </div>
  );
}

