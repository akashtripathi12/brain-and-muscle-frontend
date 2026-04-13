"use client";

import { usePathname } from "next/navigation";
import { 
  Bell, 
  Search, 
  Command,
  User,
  ShieldCheck
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const pageTitle = pathname.split("/").pop() || "Overview";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#111] bg-black/80 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white italic">
          {pageTitle}
        </h2>
        <div className="hidden h-4 w-px bg-[#222] md:block" />
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-2.5 py-1 border border-[#333]">
            <ShieldCheck className="h-3 w-3 text-white" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Protocol Secured</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Command Search Bar - Vercel Style */}
        <div className="group relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600 transition-colors group-hover:text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search Cluster..."
            className="h-9 w-64 rounded-md border border-[#222] bg-zinc-950 pl-10 pr-12 text-[10px] uppercase font-bold tracking-widest text-zinc-200 placeholder:text-zinc-700 focus:border-white/20 focus:outline-none transition-all"
          />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 opacity-40">
             <Command className="h-2.5 w-2.5" />
             <span className="text-[9px] font-bold">K</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-zinc-500 hover:border-[#222] hover:bg-zinc-900 transition-all relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </button>
          <div className="h-8 w-8 rounded-full border border-[#333] bg-zinc-900 flex items-center justify-center group cursor-pointer hover:border-white transition-all">
             <User className="h-4 w-4 text-zinc-500 group-hover:text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
