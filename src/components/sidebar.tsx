"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Globe,
  LayoutDashboard,
  LogOut,
  Rocket,
  Server,
  Zap,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/deployments", label: "Services", icon: Zap },
  { href: "/batch", label: "Batch", icon: CheckCircle2 },
  { href: "/distributed", label: "Distributed", icon: Globe },
  { href: "/fleet", label: "Muscle Fleet", icon: Server },
  { href: "/docs", label: "Documentation", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-white/5 bg-nebula-black xl:flex transition-all duration-500">
      {/* Brand Logo */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <Image 
              src="/logo2.png" 
              alt="Brain & Muscle Logo" 
              width={100} 
              height={80} 
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase leading-none">
              Brain <span className="text-nebula-pink">X</span>
            </h1>
            <p className="text-[10px] font-bold tracking-wider text-zinc-600 uppercase mt-1">Control Plane</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-4 rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                isActive
                  ? "bg-white/[0.04] text-white border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                  : "text-gray-500 hover:bg-white/[0.02] hover:text-gray-300"
              }`}
            >
              <item.icon
                className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive
                    ? "text-nebula-pink"
                    : "text-gray-500 group-hover:text-gray-400"
                }`}
              />
              {item.label}
              {isActive && (
                <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-nebula-pink shadow-[0_0_12px_#A64D79]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Action Zone: New Deployment & Logout */}
      <div className="mt-auto border-t border-white/5 p-4 space-y-2">
        <button 
          className="btn-primary w-full flex items-center justify-center gap-3 py-4 shadow-2xl !bg-gradient-to-br from-nebula-pink to-nebula-purple border border-white/10 group"
        >
          <Rocket className="w-4 h-4 text-white group-hover:animate-bounce" />
          <span className="flex-1 text-left text-[11px] font-bold uppercase tracking-wider">New Service</span>
          <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 border border-white/5">⌘</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 border border-white/5">N</span>
          </div>
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Logout Session</span>
        </button>

        <button 
          onClick={() => window.dispatchEvent(new CustomEvent("bam:open-support"))}
          className="w-full py-3.5 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white hover:bg-white/[0.02] transition-all"
        >
          Report an Issue
        </button>
      </div>
    </aside>
  );
}
