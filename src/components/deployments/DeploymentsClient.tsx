"use client";

import { useState, useMemo } from "react";
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

  // 🧪 DATA DENSITY: Show skeletons during initial connection phase if no data
  const isLoading = realtimeDeployments.length === 0 && !initialError;

  return (
    <div className="w-full space-y-6 pb-20 px-4 md:px-8 lg:px-10">
      {/* Precision Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-nebula-pink/10 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Deployments</h1>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mt-2">Active service telemetry and status</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-5 px-5 py-2.5 bg-nebula-maroon/20 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-nebula-pink animate-glow-pink" />
              <span className="text-zinc-200">{stats.running} Nodes Active</span>
            </div>
            <div className="w-px h-3 bg-white/5" />
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500/50" />
              <span className="text-zinc-600 font-medium">{stats.failed} Interrupts</span>
            </div>
          </div>

          <button 
            onClick={() => setShowPicker(!showPicker)}
            className="btn-primary !px-6 !py-3 text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 shadow-2xl !bg-gradient-to-br from-nebula-pink to-nebula-purple transition-all hover:scale-[1.02]"
          >
            {showPicker ? "Terminate Selection" : "Initialize Service"}
            <ChevronRight className={`h-4 w-4 transition-transform duration-500 ${showPicker ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>

      {initialError && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest">
          <AlertTriangle className="h-4 w-4" />
          Protocol Error: {initialError}
        </div>
      )}

      {showPicker ? (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <ImportProject />
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
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
  const status = statusConfig[dep.status] || statusConfig[3];
  
  return (
    <Link
      href={`/deployments/${dep.job_id}`}
      className="group relative flex flex-col bg-nebula-black p-6 transition-all duration-300 hover:bg-nebula-maroon/20 border border-white/5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 min-w-[350px] max-w-[420px]"
    >
      {/* Header: Type & Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-nebula-maroon border border-white/5 flex items-center justify-center group-hover:border-nebula-pink/30 transition-colors">
            <Layers className="h-3.5 w-3.5 text-nebula-pink" />
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-[4px] flex items-center gap-2 border border-white/5 ${status.bg} transition-all`}>
          <div className={`h-1.5 w-1.5 rounded-full ${status.glow}`} />
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">{status.label}</span>
        </div>
      </div>

      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider group-hover:text-nebula-pink transition-colors">
        Service ID
      </p>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-white font-mono uppercase truncate">
        {dep.job_id}
      </h2>

      {/* Internal Specs Row */}
      <div className="grid grid-cols-3 gap-2 mb-6 mt-6">
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col gap-1.5">
          <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-none">CPU</span>
          <span className="text-[11px] font-bold text-zinc-200 font-mono flex items-center gap-1.5">
            <Cpu className="h-3 w-3 text-nebula-pink/60" />
            {dep.required_cpu}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col gap-1.5">
          <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-none">RAM</span>
          <span className="text-[11px] font-bold text-zinc-200 font-mono flex items-center gap-1.5">
            <HardDrive className="h-3 w-3 text-nebula-pink/60" />
            {formatBytes(dep.required_ram)}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col gap-1.5 text-right">
          <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-none">Last Active</span>
          <span className="text-[11px] font-bold text-zinc-500 font-mono">
            {timeAgo(dep.created_at)}
          </span>
        </div>
      </div>

      {/* Infrastructure Bar */}
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Server className="h-3 w-3 text-nebula-pink/40" />
          <span className="text-[10px] font-mono font-medium text-zinc-500 tracking-tight">
            {dep.assigned_worker_id ? `node:${dep.assigned_worker_id.split("-")[1]}` : "pending_assign"}
          </span>
        </div>

        {dep.public_route ? (
          <div className="flex items-center gap-2 text-nebula-pink/80 group-hover:text-nebula-pink transition-colors">
            <Activity className="h-3 w-3" />
            <span className="text-[10px] font-mono font-bold tracking-tighter uppercase italic">Active_Route</span>
          </div>
        ) : (
          <div className="h-1 w-12 bg-white/5 rounded-full" />
        )}
      </div>

      {/* Invisible Hover Action */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreVertical className="h-4 w-4 text-zinc-700" />
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full h-80 flex flex-col items-center justify-center gap-4 text-center bg-nebula-black p-12">
      <div className="h-12 w-12 rounded-xl bg-nebula-maroon border border-white/5 flex items-center justify-center mb-2">
        <Server className="h-6 w-6 text-nebula-pink/40" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-tight">No Active Nodes</h4>
        <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider max-w-xs">Cluster data-plane is idle. Launch a service to begin execution.</p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-nebula-black p-6 border border-white/5 rounded-2xl animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 items-center">
          <div className="h-7 w-7 bg-white/5 rounded-md" />
          <div className="space-y-2">
            <div className="h-3 w-24 bg-white/5 rounded" />
            <div className="h-2 w-16 bg-white/5 rounded" />
          </div>
        </div>
        <div className="h-5 w-20 bg-white/5 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="h-12 bg-white/5 rounded-lg" />
        <div className="h-12 bg-white/5 rounded-lg" />
        <div className="h-12 bg-white/5 rounded-lg" />
      </div>
      <div className="h-4 w-full bg-white/5 rounded mt-auto" />
    </div>
  );
}
