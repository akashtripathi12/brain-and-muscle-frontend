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
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, color: "text-blue-400" },
  { href: "/deployments", label: "Services", icon: Zap, color: "text-nebula-pink" },
  { href: "/batch", label: "Batch", icon: CheckCircle2, color: "text-amber-400" },
  { href: "/distributed", label: "Distributed", icon: Globe, color: "text-emerald-400" },
  { href: "/docs", label: "Documentation", icon: BookOpen, color: "text-zinc-500" },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden transition-opacity duration-500"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 z-50 h-screen w-64 flex-col border-r border-zinc-800 bg-black transition-all duration-500 xl:flex ${
        isOpen ? 'flex translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.8)]' : 'hidden xl:flex -translate-x-full xl:translate-x-0'
      }`}>
      {/* Brand Logo */}
      <Link href="/" className="flex h-24 items-center gap-3 px-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer">
          <div className="flex items-center justify-center">
            <Image 
              src="/logo2.png" 
              alt="Brain & Muscle Logo" 
              width={100} 
              height={80} 
              className="group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase leading-none">
              Brain <span className="text-nebula-pink">X</span>
            </h1>
            <p className="text-[11px] font-black tracking-[0.2em] text-zinc-600 uppercase mt-2">Control Plane</p>
          </div>
      </Link>

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
              onClick={onClose}
              className={`group relative flex items-center gap-4 rounded-xl px-4 py-3.5 text-[12px] font-black uppercase tracking-widest transition-all duration-300 ${
                isActive
                  ? "bg-zinc-900/50 text-white border border-zinc-800 shadow-xl"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <item.icon
                className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
                  isActive
                    ? "text-white"
                    : `${item.color} opacity-60 group-hover:opacity-100`
                }`}
              />
              {item.label}
              {isActive && (
                <div className="absolute right-4 h-1 w-1 rounded-full bg-white shadow-[0_0_8px_white]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Action Zone: New Deployment & Logout */}
      <div className="mt-auto border-t border-white/5 p-4 space-y-2">

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/5 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Logout Session</span>
        </button>

        <button 
          onClick={() => window.dispatchEvent(new CustomEvent("bam:open-support"))}
          className="w-full py-4 rounded-xl border border-white/5 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white hover:bg-white/[0.02] transition-all"
        >
          Report an Issue
        </button>
      </div>
    </aside>
    </>
  );
}
