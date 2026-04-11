"use client";

import { useEffect, useState } from "react";
import { Server, Wifi, WifiOff, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { formatBytes, timeAgo } from "@/lib/mock-data";
import { api, Node } from "@/lib/api";

function CapacityBar({
  avail,
  total,
  label,
  color = "nebula-pink",
}: {
  avail: number;
  total: number;
  label: string;
  color?: string;
}) {
  const used = total - avail;
  const pct = total > 0 ? (used / total) * 100 : 0;

  return (
    <div className="space-y-1.5 flex-1">
      <div className="flex items-baseline justify-between text-[9px] font-black uppercase tracking-widest leading-none">
        <span className="text-gray-500">{label}</span>
        <span className="font-mono text-gray-400">
          {used}/{total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-md bg-nebula-black border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            pct > 90
              ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
              : pct > 70
              ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
              : "bg-nebula-pink shadow-[0_0_8px_#A64D79]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function FleetPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const n = await api.getNodes();
        setNodes(n || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch nodes:", err);
        setError("Brain API is unreachable");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const online = nodes.length;

  if (loading && nodes.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-8 w-8 animate-spin text-nebula-pink" />
        <p className="animate-pulse font-black text-[10px] uppercase tracking-[0.3em] text-gray-600">Syncing Distributed Grid...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-nebula-maroon border border-white/5 flex items-center justify-center">
                <Server className="h-4 w-4 text-nebula-pink" />
             </div>
             <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white uppercase">
               Muscle <span className="text-nebula-pink">Fleet</span>
             </h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mt-2">Distributed Infrastructure Topology</p>
        </div>
        <div className="flex items-center gap-6">
          {error && (
            <span className="flex items-center gap-2 text-rose-500 text-[9px] font-black uppercase tracking-widest px-4 py-2 border border-rose-500/20 rounded-md bg-rose-500/5">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </span>
          )}
          <div className="flex items-center gap-3 bg-nebula-maroon/20 border border-white/5 px-4 py-2 rounded-xl">
            <span className="h-2 w-2 rounded-full bg-nebula-pink shadow-[0_0_10px_#A64D79] animate-glow-pink" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
              {online} Nodes Active
            </span>
          </div>
        </div>
      </div>

      {/* Node Grid */}
      <div className="grid gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {nodes.map((node) => {
          const hostedJobs = Array.from(new Set(Object.values(node.occupied_ports || {})));
          
          return (
            <div
              key={node.id}
              className="group flex flex-col lg:flex-row lg:items-center bg-nebula-black p-6 gap-8 transition-all hover:bg-nebula-maroon/10 border-b border-white/[0.02] last:border-b-0"
            >
              {/* Identity Pillar */}
              <div className="flex items-center gap-5 min-w-[280px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-nebula-maroon border border-white/5 group-hover:border-nebula-pink/30 transition-all">
                  <Wifi className="h-5 w-5 text-nebula-pink" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white italic tracking-tighter uppercase font-mono">{node.id}</h3>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-600">
                    <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">Localhost</span> 
                    <span className="flex items-center gap-1.5 text-nebula-pink opacity-60">
                      <MapPin className="h-3 w-3" />
                      Edge Node
                    </span>
                  </div>
                </div>
              </div>

              {/* Resource Matrix */}
              <div className="flex-1 flex gap-10 max-w-xl">
                  <CapacityBar
                    avail={node.avail_cpu}
                    total={node.total_cpu}
                    label="Compute_Units"
                  />
                  <CapacityBar
                    avail={node.avail_ram}
                    total={node.total_ram}
                    label="Memory_Buffer"
                  />
              </div>

              {/* Workload Vault */}
              <div className="flex flex-wrap items-center gap-2 min-w-[240px]">
                {hostedJobs.length > 0 ? (
                  hostedJobs.map((job) => (
                    <span
                      key={job}
                      className="rounded-md bg-nebula-purple/20 border border-nebula-purple/30 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-nebula-pink"
                    >
                      {job}
                    </span>
                  ))
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-700 italic">Idle_State</span>
                )}
              </div>

              {/* Pulse */}
              <div className="text-right text-[9px] font-black uppercase tracking-widest text-gray-700 min-w-[90px] font-mono italic">
                {timeAgo(node.last_heartbeat)}
              </div>
            </div>
          );
        })}
        {nodes.length === 0 && !loading && (
          <div className="flex h-[300px] flex-col items-center justify-center bg-nebula-black text-gray-600 gap-4">
            <div className="h-16 w-16 rounded-3xl bg-nebula-maroon border border-white/5 flex items-center justify-center mb-2">
              <Server className="h-8 w-8 text-gray-800" />
            </div>
            <p className="font-black text-[10px] uppercase tracking-[0.2em]">No Muscle Nodes Linked</p>
          </div>
        )}
      </div>
    </div>
  );
}
