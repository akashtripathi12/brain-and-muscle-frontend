"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft,
  Download,
  Terminal,
  Activity,
  CheckCircle,
  Database,
  Cpu,
  HardDrive,
  Clock,
  ExternalLink,
  Loader2,
  Package,
  ArrowUpRight
} from "lucide-react";
import { api, Deployment } from "@/lib/api";

const statusConfig: Record<number, any> = {
  0: { label: "Provisioning", dot: "bg-amber-400", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  1: { label: "Running", dot: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  2: { label: "Completed", dot: "bg-brand-primary", badge: "bg-brand-primary/10 text-brand-primary border-brand-primary/20" },
  3: { label: "Failed", dot: "bg-red-500", badge: "bg-red-500/10 text-red-500 border-red-500/20" },
};

export default function DistributedMonitorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [job, setJob] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 1. Polling for Job Metadata
  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const history = await api.getHistory(token); // Use history for persistence
        const found = history.find(j => j.job_id === id) || (await api.getDeployments(token)).find(j => j.job_id === id);
        setJob(found || null);
      } catch (err) {
        console.error("Failed to load job details:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [id, supabase]);

  // 2. Real Log Streaming
  useEffect(() => {
    if (!id) return;
    
    let isMounted = true;
    const controller = new AbortController();

    async function streamLogs() {
      try {
        const brainUrl = process.env.NEXT_PUBLIC_BRAIN_URL || "http://localhost:8888";
        const apiKey = process.env.NEXT_PUBLIC_BRAIN_API_KEY || "";

        const response = await fetch(`${brainUrl}/api/logs/${id}`, {
          headers: { "X-API-Key": apiKey },
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
                  const localTime = new Date(utcTime).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  return `[${localTime}] ${content}`;
                } catch (e) { return line; }
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

  // Auto-scroll logic
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({ top: logContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [visibleLogs]);

  const downloadResult = async () => {
    try {
      const res = await api.getDownloadUrl(id);
      if (!res.download_url) throw new Error("No download URL returned");
      window.open(res.download_url, '_blank');
    } catch (err) {
      alert("Failed to recover result manifest.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">Syncing with distributed cluster...</span>
    </div>
  );

  if (!job) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <h2 className="text-xl font-bold text-white">Workload Not Found</h2>
      <Link href="/distributed" className="btn-secondary px-6 py-2">Back to History</Link>
    </div>
  );

  const status = statusConfig[job.status] || statusConfig[3];

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/distributed" className="p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">{id.substring(0, 13)}</h1>
              <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${status.badge}`}>
                {status.label}
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1">Distributed {job.job_type} Payload</p>
          </div>
        </div>

        {job.status === 2 && (
          <button onClick={downloadResult} className="btn-primary px-6 py-2.5 gap-2">
            <Download className="w-4 h-4 text-black" />
            Download Result Manifest
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
         <div className="col-span-1 rounded-2xl border border-white/5 bg-white/[0.01] p-5 shadow-xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
              <Cpu className="w-3 h-3 text-brand-primary" /> Compute Cost
            </div>
            <p className="text-lg font-black text-white italic">{job.required_cpu}<span className="text-[10px] not-italic text-gray-500 ml-1 uppercase">vCores</span></p>
         </div>
         <div className="col-span-1 rounded-2xl border border-white/5 bg-white/[0.01] p-5 shadow-xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
              <HardDrive className="w-3 h-3 text-brand-primary" /> Memory Pool
            </div>
            <p className="text-lg font-black text-white italic">{job.required_ram >= 1024 ? `${job.required_ram/1024}GB` : `${job.required_ram}MB`}</p>
         </div>
         <div className="col-span-1 rounded-2xl border border-white/5 bg-white/[0.01] p-5 shadow-xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
              <Activity className="w-3 h-3 text-brand-primary" /> Job Status
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${status.dot} ${job.status === 1 ? 'animate-pulse' : ''}`} />
              <p className="text-lg font-black text-white italic uppercase tracking-tighter">{status.label}</p>
            </div>
         </div>
         <div className="col-span-1 rounded-2xl border border-white/5 bg-white/[0.01] p-5 shadow-xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
              <Clock className="w-3 h-3 text-brand-primary" /> Execution Start
            </div>
            <p className="text-lg font-black text-white italic">{new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[500px]">
        {/* Terminal */}
        <div className="col-span-8 flex flex-col rounded-2xl border border-white/5 overflow-hidden shadow-2xl glass-panel">
           <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
              <Terminal className="w-4 h-4 text-brand-primary" />
              <span className="text-[11px] font-black uppercase tracking-widest text-white">Live Execution Stream</span>
              {job.status === 1 && (
                <div className="ml-auto flex items-center gap-2 px-2 py-0.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-brand-primary">Broadcasting</span>
                </div>
              )}
           </div>
           <div ref={logContainerRef} className="flex-1 p-5 overflow-y-auto font-mono text-[11px] custom-scrollbar scroll-smooth">
              {visibleLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-600">
                   <Loader2 className="w-6 h-6 animate-spin text-white/5" />
                   <p className="text-[9px] font-black uppercase tracking-widest animate-pulse italic">Waiting for distributed artifacts...</p>
                </div>
              ) : (
                visibleLogs.map((l, i) => (
                  <div key={i} className="py-0.5 border-l-2 border-transparent hover:border-brand-primary/30 pl-3 mb-1 text-gray-300 transition-all hover:bg-white/[0.02]">
                    {l}
                  </div>
                ))
              )}
              {job.status === 1 && <div className="h-4 w-1 bg-brand-primary animate-pulse ml-3 mt-1" />}
           </div>
        </div>

        {/* Side Actions & Details */}
        <div className="col-span-4 flex flex-col gap-4">
           <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 shadow-xl space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Payload Artifacts</h3>
              
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                       <Package className="w-4 h-4 text-brand-primary" />
                       <span className="text-[10px] font-bold text-gray-400">User Script</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-600" />
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                       <Database className="w-4 h-4 text-brand-primary" />
                       <span className="text-[10px] font-bold text-gray-400">Dataset Shard</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-600" />
                 </div>
              </div>

              <div className="h-px bg-white/5" />

              <div className="space-y-2">
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Deployment Context</p>
                 <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-gray-400 font-mono">ID</span>
                    <span className="text-white font-mono">{id}</span>
                 </div>
                 <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-gray-400 font-mono">STRATEGY</span>
                    <span className="text-brand-primary font-mono">{job.job_type}</span>
                 </div>
              </div>
           </div>

           <div className="flex-1 rounded-2xl border border-white/5 bg-white/[0.01] p-6 flex flex-col items-center justify-center text-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <CheckCircle className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white italic">Self-Healing Cluster</h4>
                <p className="text-[9px] font-bold text-gray-500 mt-1">Status and reconciliation are managed by the Brain control plane.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
