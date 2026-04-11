"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { signOut } from "@/app/actions/auth";
import { Bell, User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<{ name: string; avatar: string; role: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const metadata = user.user_metadata || {};
        setProfile({
          name: metadata.full_name || user.email?.split("@")[0] || "User",
          avatar: metadata.avatar_url || "",
          role: "Root Identity",
        });
      }
    }
    getProfile();
  }, [supabase]);

  const handleLogout = async () => {
    await signOut();
    router.refresh();
  };

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    return segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/5 bg-nebula-black/60 px-8 backdrop-blur-xl">
      {/* Left: Page context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="text-zinc-600">Infrastructure</span>
            <span className="text-nebula-pink/40">/</span>
            <span className="text-white">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right: Identity & Notifications */}
      <div className="flex items-center gap-6">
        <div className="h-8 w-px bg-white/5" />

        <div className="flex items-center gap-4 group">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-bold text-white tracking-tight leading-none">
              {profile?.name || "Authenticating..."}
            </p>
            <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mt-1.5 transition-colors group-hover:text-nebula-pink">
              {profile?.role || "Syncing..."}
            </p>
          </div>

          <div className="relative group/menu">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-nebula-maroon border border-white/5 transition-transform hover:scale-105 active:scale-95">
              {profile?.avatar ? (
                <Image src={profile.avatar} alt={profile.name} width={40} height={40} className="rounded-xl object-cover" />
              ) : (
                <User className="h-5 w-5 text-nebula-pink" />
              )}
            </button>

            {/* Dropdown Menu (Hover-based for density) */}
            <div className="absolute right-0 top-full pt-2 w-48 scale-95 opacity-0 pointer-events-none group-hover/menu:scale-100 group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto transition-all duration-200">
              <div className="rounded-xl border border-white/5 bg-nebula-black p-2 shadow-2xl backdrop-blur-2xl">
                <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                  Profile Account
                </Link>
                <div className="h-px bg-white/5 my-1" />
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-bold text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
