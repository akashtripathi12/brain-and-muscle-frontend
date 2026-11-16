"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Square,
  Trash2,
  Cpu,
  HardDrive,
  Clock,
  Server,
  Globe,
  Terminal,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Layers,
} from "lucide-react";
import {
  formatBytes,
  timeAgo,
} from "@/lib/mock-data";
import { api, Deployment } from "@/lib/api";

const statusConfig: Record<number, any> = {
  0: {
    label: "Provisioning",
    dot: "bg-nebula-pink shadow-[0_0_10px_#A64D79]",
    badge: "bg-nebula-pink/10 text-nebula-pink border-nebula-pink/20",
  },
  1: {
    label: "Running",
    dot: "bg-nebula-pink shadow-[0_0_12px_#A64D79] animate-glow-pink",
    badge: "bg-nebula-purple/20 text-nebula-pink border-nebula-pink/30",
  },
  2: {
    label: "Completed",
    dot: "bg-zinc-600",
    badge: "bg-zinc-800/20 text-zinc-400 border-white/5",
  },
  3: {
    label: "Failed",
    dot: "bg-rose-500 shadow-[0_0_10px_#f43f5e]",
    badge: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
  4: {
    label: "Killed",
    dot: "bg-zinc-800",
    badge: "bg-zinc-900/50 text-zinc-600 border-white/5",
  },
};

export default function DeploymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [dep, setDep] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);

  // Action states
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Fetch Deployment Details
  useEffect(() => {
    async function load() {
      try {
        const deployments = await api.getDeployments();
        const found = deployments.find((d) => d.job_id === id);
        setDep(found || null);
      } catch (err) {
        console.error("Failed to load deployment:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // 2. Real Log Streaming
  useEffect(() => {
    if (!id) return;
    
    let isMounted = true;
    const controller = new AbortController();

    async function streamLogs() {
      try {
        const response = await fetch(`/api/brain/logs/${id}`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          if (isMounted) setTimeout(streamLogs, 5000);
          return;
        }

        if (!response.ok) throw new Error("Log stream failed");

        const text = await response.text();
        if (!text.trim()) {
          if (isMounted) setTimeout(streamLogs, 5000);
          return;
        }

        const rawLines = text.split('\n');
        if (isMounted) {
          const localizedLines = rawLines
            .map(line => {
              if (!line.trim()) return null;
              const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)\s?(.*)$/);
              if (match) {
                const utcTime = match[1];
                const content = match[2];
                try {
                  const localTime = new Date(utcTime).toLocaleTimeString([], { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  });
                  return `[${localTime}] ${content}`;
                } catch (e) {
                  return line;
                }
              }
              return line;
            })
            .filter((l): l is string => l !== null);

          setVisibleLogs(localizedLines);
        }

        if (isMounted) setTimeout(streamLogs, 5000);

      } catch (err: any) {
        if (err.name !== "AbortError" && isMounted) {
          setTimeout(streamLogs, 5000);
        }
      }
    }

    streamLogs();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({
        top: logContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [visibleLogs]);

  // Clear action result after 5s
  useEffect(() => {
    if (actionResult) {
      const timer = setTimeout(() => setActionResult(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionResult]);

  // Action handlers
  const handleStop = useCallback(async () => {
    setActionInProgress("stop");
    try {
      await api.killDeployment(id);
      setActionResult({ type: "success", message: "Termination sequence initiated..." });
    } catch (err: any) {
      setActionResult({ type: "error", message: err.message || "Failed to terminate deployment" });
    } finally {
      setActionInProgress(null);
    }
  }, [id]);

  const handleDelete = useCallback(async () => {
    setActionInProgress("delete");
    try {
      await api.deleteDeployment(id);
      setActionResult({ type: "success", message: "Deployment purged from ledger." });
      setTimeout(() => router.push("/deployments"), 1500);
    } catch (err: any) {
      setActionResult({ type: "error", message: err.message || "Failed to purge deployment" });
    } finally {
      setActionInProgress(null);
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-8 w-8 animate-spin text-nebula-pink" />
        <p className="animate-pulse font-bold text-[10px] uppercase tracking-wider text-zinc-600">Verifying Identity...</p>
      </div>
    );
  }

  if (!dep) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <div className="space-y-6">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-nebula-maroon border border-white/5 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-white">404: Node Missing</h2>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mt-2">ID_REF: {id}</p>
          </div>
          <Link href="/deployments" className="btn-primary !px-6 !py-3 inline-flex items-center gap-3">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[dep.status] || statusConfig[3];

  return (
    <div className="space-y-8 w-full">
      {/* Precision Header Ribbon */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link
            href="/deployments"
            className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-nebula-maroon/20 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 transition-all hover:bg-nebula-maroon/40 hover:text-nebula-pink"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to List
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStop}
              disabled={!!actionInProgress || dep.status !== 1}
              className="px-5 py-2.5 rounded-xl border border-white/5 bg-nebula-black text-[10px] font-bold uppercase tracking-wider text-amber-500 transition-all hover:bg-amber-500/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {actionInProgress === "stop" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Square className="h-3 w-3" />}
              Stop Service
            </button>
            <button
              onClick={handleDelete}
              disabled={!!actionInProgress}
              className="px-5 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-[10px] font-bold uppercase tracking-wider text-rose-500 transition-all hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {actionInProgress === "delete" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              Delete
            </button>
          </div>
        </div>

        {/* HUD Data Ribbon */}
        <div className="rounded-2xl border border-white/5 bg-nebula-maroon/10 p-1 flex flex-col md:flex-row shadow-2xl overflow-hidden backdrop-blur-xl">
           {/* Context Block */}
           <div className="flex-1 p-6 flex items-center gap-6 border-r border-white/5">
              <div className="h-14 w-14 rounded-2xl bg-nebula-maroon border border-white/10 flex items-center justify-center shadow-inner">
                 <Layers className="h-7 w-7 text-nebula-pink" />
              </div>
              <div className="space-y-1.5 min-w-0">
                 <h1 className="text-2xl font-bold tracking-tight text-white truncate font-mono uppercase">
                    {dep.job_id}
                 </h1>
                 <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-3 px-3 py-1.5 rounded-full border ${status.badge} transition-all`}>
                       <div className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                       <span className="text-[9px] font-bold uppercase tracking-wider">{status.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider italic">SERVICE_NODE</span>
                 </div>
              </div>
           </div>

           {/* Metrics Blocks */}
           <div className="grid grid-cols-2 md:grid-cols-4 flex-[1.5]">
              {[
                { icon: Cpu, label: "Core_Allocation", value: `${dep.required_cpu}`, unit: "V-CPUs" },
                { icon: HardDrive, label: "Memory_Buffer", value: formatBytes(dep.required_ram), unit: "RAM" },
                { icon: Server, label: "Assigned_Worker", value: dep.assigned_worker_id ? `node:${dep.assigned_worker_id.split("-")[1]}` : "pending_assign", unit: "Identity" },
                { icon: Clock, label: "Time_Since_Init", value: timeAgo(dep.created_at), unit: "History" },
              ].map((stat, idx) => (
                <div key={idx} className="p-6 border-r border-white/5 last:border-r-0 flex flex-col justify-center">
                   <div className="flex items-center gap-2 mb-2 text-zinc-700">
                      <stat.icon className="h-3.5 w-3.5" />
                      <span className="text-[8px] font-bold uppercase tracking-wider">{stat.label}</span>
                   </div>
                   <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-white font-mono uppercase truncate">{stat.value}</span>
                      <span className="text-[9px] font-semibold text-nebula-pink/40 uppercase italic">{stat.unit}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Route Bar */}
        {dep.status === 1 && (
          <div className="flex items-center justify-between px-6 py-4 rounded-xl border border-nebula-pink/10 bg-nebula-pink/5 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <Globe className="h-4 w-4 text-nebula-pink" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">Public Protocol Endpoint:</span>
              <a
                href={`${process.env.NEXT_PUBLIC_BRAIN_URL || "http://localhost:8888"}/proxy/${dep.job_id}/health`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-white italic hover:text-nebula-pink transition-colors underline decoration-nebula-pink/30 underline-offset-4 font-mono tracking-normal"
              >
                /proxy/{dep.job_id}/health
              </a>
            </div>
            <div className="flex items-center gap-2">
               <span className="h-1.5 w-1.5 bg-nebula-pink rounded-full animate-pulse shadow-[0_0_8px_#A64D79]" />
               <span className="text-[9px] font-bold uppercase tracking-wider text-nebula-pink italic">Active_Route</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Terminal Grid */}
      <div className="grid gap-8">
        {/* Live Logs Terminal */}
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-nebula-black shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 bg-nebula-maroon/20 px-6 py-4">
             <div className="flex items-center gap-3">
                <Terminal className="h-4 w-4 text-nebula-pink" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">Activity Log</span>
             </div>
             <div className="flex items-center gap-4">
                {dep.status === 1 && (
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-nebula-pink animate-glow-pink" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-nebula-pink/80 italic">
                      Live_Telemetry
                    </span>
                  </div>
                )}
             </div>
          </div>
          <div
            ref={logContainerRef}
            className="h-[600px] overflow-y-auto p-0 font-mono text-[11px] custom-scrollbar bg-[#1A1A1D]"
          >
            <div className="min-h-full py-4 bg-gradient-to-b from-transparent to-black/20">
              {visibleLogs.length === 0 ? (
                <div className="flex h-full items-center justify-center gap-4 py-32 text-gray-700 italic">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing data stream...</span>
                </div>
              ) : (
                visibleLogs.map((log, i) => (
                  <div
                    key={i}
                    className="group flex px-6 py-0.5 border-l-2 border-transparent hover:border-nebula-pink/30 transition-all"
                  >
                    <span className="w-12 shrink-0 text-zinc-800 select-none font-bold text-[9px] group-hover:text-nebula-pink/40">
                      {(i + 1).toString().padStart(4, '0')}
                    </span>
                    <span className="whitespace-pre-wrap text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      {log}
                    </span>
                  </div>
                ))
              )}
              <div className="mt-4 px-6 flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-nebula-pink/40 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-900">End of Log</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {actionResult && (
        <div className="fixed bottom-10 right-10 z-50">
           <div className={`flex items-center gap-4 rounded-xl border border-white/5 px-6 py-4 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right-10 duration-500 ${
              actionResult.type === "success"
                ? "bg-nebula-purple/40 text-nebula-pink"
                : "bg-rose-500/20 text-rose-500 border-rose-500/30"
            }`}>
              {actionResult.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              <span className="text-[11px] font-black uppercase tracking-widest">{actionResult.message}</span>
           </div>
        </div>
      )}
    </div>
  );
}
