"use client";

export default function DashboardLoading() {
  return (
    <div className="space-y-12 max-w-6xl mx-auto py-10 px-6 animate-pulse overflow-hidden">
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
      <div className="flex items-center justify-between border-b border-zinc-800 pb-10">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-zinc-900 rounded-lg" />
          <div className="h-4 w-48 bg-zinc-900/50 rounded" />
        </div>
      </div>

      {/* Metric Grid Shell */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-zinc-900 bg-black p-8 space-y-6">
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-zinc-900 rounded" />
              <div className="h-4 w-4 bg-zinc-900 rounded" />
            </div>
            <div className="h-10 w-24 bg-zinc-900 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
