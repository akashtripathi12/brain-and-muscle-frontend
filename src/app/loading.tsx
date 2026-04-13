"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black overflow-hidden">
      {/* Global Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-zinc-900 z-[9999]">
        <div className="h-full bg-nebula-pink animate-[loading-bar_2s_infinite_ease-in-out]" />
      </div>

      <div className="relative">
        <div className="h-12 w-12 rounded-full border-2 border-zinc-900" />
        <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-2 border-nebula-pink animate-spin" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Handshaking</p>
        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">Secure Cluster Sync</p>
      </div>

      <style jsx global>{`
        @keyframes loading-bar {
          0% { width: 0%; left: 0%; }
          50% { width: 100%; left: 0%; }
          100% { width: 0%; left: 100%; }
        }
      `}</style>
    </div>
  );
}
