"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Globe,
  LayoutDashboard,
  LogOut,
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
  { href: "/fleet", label: "Fleet", icon: Server },
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
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-[#111] bg-black xl:flex transition-all duration-300">
      {/* Brand Logo - Monotone Vercel Style */}
      <div className="flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-3 grayscale brightness-200">
          <Image 
            src="/logo2.png" 
            alt="Brain & Muscle Logo" 
              width={100} 
              height={80} 
          />
          <div>
            <h1 className="text-base font-black tracking-tight text-white uppercase leading-none">
              Brain <span className="text-zinc-500 font-light italic">X</span>
            </h1>
            <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-600 uppercase mt-1">Control Plane</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-md px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                isActive
                  ? "bg-zinc-800/20 text-white border border-white/5 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900"
              }`}
            >
              <item.icon
                className={`h-4 w-4 ${
                  isActive
                    ? "text-white"
                    : "text-zinc-600 group-hover:text-zinc-400"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Action Zone: Minimalist Logout & Support */}
      <div className="mt-auto border-t border-[#111] p-4 space-y-2">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-red-500 hover:bg-red-500/5 transition-all group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Sign Out</span>
        </button>

        <button 
          onClick={() => window.dispatchEvent(new CustomEvent("bam:open-support"))}
          className="w-full py-2.5 rounded-md text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-700 hover:text-white hover:bg-zinc-900 transition-all border border-transparent hover:border-[#222]"
        >
          Support Terminal
        </button>
      </div>
    </aside>
  );
}
