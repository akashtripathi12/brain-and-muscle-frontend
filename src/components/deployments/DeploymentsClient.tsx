"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Clock,
  Cpu,
  HardDrive,
  Server,
  AlertTriangle,
  Layers,
  ChevronRight,
  Zap,
  MoreVertical,
  Activity,
} from "lucide-react";
import { formatBytes, timeAgo } from "@/lib/mock-data";
import { Deployment } from "@/lib/api";
import { useRealtimeTasks } from "@/hooks/useRealtimeTasks";
import ImportProject from "@/components/ImportProject";

const statusConfig: Record<number, { label: string; text: string; bg: string; glow: string }> = {
  0: {
    label: "Provisioning",
    text: "text-nebula-pink",
    bg: "bg-nebula-pink/10",
    glow: "animate-glow-pink bg-nebula-pink",
  },
  1: {
    label: "Running",
    text: "text-white",
    bg: "bg-nebula-purple/20",
    glow: "animate-glow-purple bg-nebula-purple",
  },
  2: {
    label: "Completed",
    text: "text-zinc-400",
    bg: "bg-zinc-800/10",
    glow: "bg-zinc-800",
  },
  3: {
    label: "Failed",
    text: "text-rose-500",
    bg: "bg-rose-500/10",
    glow: "bg-rose-500 shadow-[0_0_10px_#f43f5e]",
  },
};

export default function DeploymentsClient({ initialDeployments, error: initialError }: { initialDeployments: Deployment[]; error?: string | null }) {
  const [showPicker, setShowPicker] = useState(false);
  const realtimeDeployments = useRealtimeTasks(initialDeployments);
  
  // ⚡ LAZY LOADING: Use memoization to prevent expensive filter re-runs
  const filteredDeployments = useMemo(() => 
    realtimeDeployments.filter((d) => d.job_type === "SERVICE"),
    [realtimeDeployments]
  );
  
  const stats = useMemo(() => ({
    running: filteredDeployments.filter(d => d.status === 1).length,
    failed: filteredDeployments.filter(d => d.status === 3).length
  }), [filteredDeployments]);

  const [isSyncing, setIsSyncing] = useState(true);

  // 🧪 DATA DENSITY: Show skeletons during brief initial handshake
  useEffect(() => {
    const timer = setTimeout(() => setIsSyncing(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = isSyncing && realtimeDeployments.length === 0 && !initialError;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-20 px-6">
      {/* Precision Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Services <span className="text-nebula-pink font-normal">Control</span>
          </h1>
          <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-zinc-500 mt-4 font-mono">Active Infrastructure Telemetry</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 px-6 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-[11px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <span className="text-white">{stats.running} Active</span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span className="text-zinc-500">{stats.failed} Interrupts</span>
            </div>
          </div>

          <button 
            onClick={() => setShowPicker(!showPicker)}
            className="btn-primary flex items-center gap-3 px-8 py-4 transition-all"
          >
            {showPicker ? "Terminate Setup" : "Deploy Service"}
            <ChevronRight className={`h-4 w-4 transition-transform duration-500 ${showPicker ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>

      {initialError && (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-500 text-[11px] font-black uppercase tracking-widest">
          <AlertTriangle className="h-4 w-4" />
          Protocol Error: {initialError}
        </div>
      )}

      {showPicker ? (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <ImportProject />
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredDeployments.length > 0 ? (
            filteredDeployments.map((dep) => (
              <DeploymentCard key={dep.job_id} dep={dep} />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      )}
    </div>
  );
}

function DeploymentCard({ dep }: { dep: Deployment }) {
  const statusLabels: Record<number, string> = {
    0: "Provisioning",
    1: "Running",
    2: "Completed",
    3: "Failed"
  };

  const statusColors: Record<number, string> = {
    0: "text-amber-500",
    1: "text-emerald-500",
    2: "text-zinc-500",
    3: "text-rose-500"
  };

  const statusBg: Record<number, string> = {
    0: "bg-amber-500/15 border-amber-500/30",
    1: "bg-emerald-500/15 border-emerald-500/30",
    2: "bg-zinc-900 border-zinc-800",
    3: "bg-rose-500/15 border-rose-500/30"
  };
  
  return (
    <Link
      href={`/deployments/${dep.job_id}`}
      className="group relative flex flex-col bg-black p-8 transition-all duration-300 hover:border-nebula-pink border border-zinc-900 rounded-3xl shadow-xl hover:shadow-2xl border-t-2 border-t-nebula-pink/20"
    >
      {/* Header: Type & Status */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-nebula-pink/10 transition-colors">
          <Layers className="h-5 w-5 text-white active:text-nebula-pink" />
        </div>

        <div className={`px-4 py-1.5 rounded-full flex items-center gap-2.5 border ${statusBg[dep.status] || 'bg-zinc-900 border-zinc-800'} transition-all`}>
          <div className={`h-1.5 w-1.5 rounded-full ${dep.status === 1 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-500'}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${statusColors[dep.status] || 'text-zinc-500'}`}>
            {statusLabels[dep.status] || "Unknown"}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.2em] font-mono">
          Endpoint Identifier
        </p>
        <h2 className="text-2xl font-black tracking-tighter text-white font-mono uppercase truncate group-hover:text-zinc-400 transition-colors">
          {dep.job_id.split('-')[0]}<span className="text-zinc-800">-{dep.job_id.split('-').slice(1).join('-')}</span>
        </h2>
      </div>

      {/* Internal Specs Row */}
      <div className="grid grid-cols-2 gap-4 mb-10 mt-10">
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col gap-2">
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Compute Allocation</span>
          <span className="text-[13px] font-bold text-white font-mono flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-zinc-500" />
            {dep.required_cpu} vCPU
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col gap-2">
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Memory Reserved</span>
          <span className="text-[13px] font-bold text-white font-mono flex items-center gap-2">
            <HardDrive className="h-3.5 w-3.5 text-zinc-500" />
            {formatBytes(dep.required_ram)}
          </span>
        </div>
      </div>

      {/* Infrastructure Bar */}
      <div className="mt-auto pt-6 border-t border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="h-4 w-4 text-zinc-700" />
          <span className="text-[11px] font-mono font-bold text-zinc-600 tracking-tight uppercase">
            {dep.assigned_worker_id ? `node:${dep.assigned_worker_id.substring(0, 8)}` : "cluster_pending"}
          </span>
        </div>

        {dep.public_route ? (
          <div className="flex items-center gap-2.5 text-white transition-colors">
            <Activity className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[11px] font-mono font-black tracking-widest uppercase">Live</span>
          </div>
        ) : (
          <div className="h-1 w-16 bg-zinc-900 rounded-full" />
        )}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full h-80 flex flex-col items-center justify-center gap-6 text-center bg-black border border-zinc-800 rounded-3xl p-12">
      <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
        <Server className="h-7 w-7 text-zinc-700" />
      </div>
      <div className="space-y-2">
        <h4 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">Zero Active Deployments</h4>
        <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest max-w-xs mx-auto">The cluster control plane is currently idle. Initialize a service to begin.</p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-black p-8 border border-zinc-800 rounded-3xl animate-pulse">
      <div className="flex justify-between items-center mb-10">
        <div className="h-10 w-10 bg-zinc-900 rounded-xl" />
        <div className="h-6 w-24 bg-zinc-900 rounded-full" />
      </div>
      <div className="space-y-4 mb-10">
        <div className="h-4 w-32 bg-zinc-900 rounded" />
        <div className="h-8 w-64 bg-zinc-900 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="h-16 bg-zinc-900 rounded-2xl" />
        <div className="h-16 bg-zinc-900 rounded-2xl" />
      </div>
      <div className="h-4 w-full bg-zinc-900 rounded" />
    </div>
  );
}
