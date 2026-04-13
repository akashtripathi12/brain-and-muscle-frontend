"use client";

export default function DistributedLoading() {
  return (
    <div className="space-y-12 w-full max-w-6xl mx-auto py-10 px-6 animate-pulse overflow-hidden">
      {/* Global Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-zinc-900 z-[9999]">
        <div className="h-full bg-nebula-pink animate-[loading-bar_2s_infinite_ease-in-out]" />
      </div>

      <style jsx global>{`
        @keyframes loading-bar {
          0% { width: 0%; left: 0%; }
          50% { width: 100%; left: 0%; }
          100% { width: 0%; left: 100%; }
        }
      `}</style>
      {/* Header Shell */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-zinc-900 rounded-xl" />
            <div className="h-10 w-64 bg-zinc-900 rounded-lg" />
          </div>
          <div className="h-4 w-60 bg-zinc-900/50 rounded" />
        </div>
        <div className="h-12 w-80 bg-zinc-900 rounded-xl" />
      </div>

      {/* Grid Shell */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-2xl border border-zinc-900 bg-black space-y-4">
            <div className="h-3 w-20 bg-zinc-900 rounded" />
            <div className="h-10 w-16 bg-zinc-900 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table Shell */}
      <div className="rounded-2xl border border-zinc-900 bg-black overflow-hidden shadow-2xl">
        <div className="px-8 py-5 border-b border-zinc-800 bg-zinc-950 flex justify-between">
          <div className="h-5 w-40 bg-zinc-900 rounded" />
          <div className="h-5 w-20 bg-zinc-900 rounded" />
        </div>
        <div className="divide-y divide-zinc-900">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-8 py-8 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-zinc-900 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-zinc-900 rounded" />
                  <div className="h-3 w-20 bg-zinc-900/50 rounded" />
                </div>
              </div>
              <div className="h-8 w-24 bg-zinc-900 rounded-full" />
              <div className="h-5 w-32 bg-zinc-900 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
