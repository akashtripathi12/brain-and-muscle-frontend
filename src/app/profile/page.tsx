import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/dashboard/ProfileClient";

export const metadata = {
  title: "User Profile | Brain & Muscle",
  description: "Manage your cluster identity and session settings.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  
  // Fetch user and session for SSR
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="w-full px-4 md:px-10 py-12">
      <div className="mb-10 text-center md:text-left border-b border-white/5 pb-10">
        <h1 className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2 italic">
          Identity Management
        </h1>
        <h2 className="text-4xl font-bold text-white uppercase tracking-tight italic">
          Profile Settings
        </h2>
      </div>

      <ProfileClient user={user} session={session} />
    </main>
  );
}
