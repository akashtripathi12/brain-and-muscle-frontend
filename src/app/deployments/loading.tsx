"use client";

export default function DeploymentsLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 py-10 px-6 animate-pulse overflow-hidden">
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-10">
        <div className="space-y-4">
          <div className="h-10 w-64 bg-zinc-900 rounded-lg" />
          <div className="h-4 w-48 bg-zinc-900/50 rounded" />
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-48 bg-zinc-900 rounded-2xl" />
          <div className="h-12 w-32 bg-zinc-900 rounded-xl" />
        </div>
      </div>

      {/* Cards Shell */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-black p-8 border border-zinc-900 rounded-3xl space-y-8">
            <div className="flex justify-between items-center">
              <div className="h-10 w-10 bg-zinc-900 rounded-xl" />
              <div className="h-6 w-24 bg-zinc-900 rounded-full" />
            </div>
            <div className="space-y-4">
              <div className="h-3 w-32 bg-zinc-900 rounded" />
              <div className="h-8 w-64 bg-zinc-900 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-zinc-900 rounded-2xl" />
              <div className="h-16 bg-zinc-900 rounded-2xl" />
            </div>
            <div className="h-1 w-full bg-zinc-900 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
