"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Plus, 
  Activity, 
  Search, 
  CheckCircle, 
  Loader2,
  ArrowRight,
  Database,
  Network
} from "lucide-react";
import { api, Deployment } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";

const statusConfig: Record<number, any> = {
  0: { label: "Provisioning", color: "text-nebula-pink", bg: "bg-nebula-pink/10", border: "border-nebula-pink/20" },
  1: { label: "Running", color: "text-white", bg: "bg-nebula-purple/20", border: "border-nebula-purple/20" },
  2: { label: "Completed", color: "text-zinc-400", bg: "bg-zinc-800/10", border: "border-white/5" },
  3: { label: "Failed", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
};

export default function DistributedHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  const fetchActivity = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const data = await api.getHistory(token);
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to fetch distributed history:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    setMounted(true);
    fetchActivity();
    const interval = setInterval(fetchActivity, 10000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  const filteredHistory = history.filter(item => {
    if (filter === "all") return true;
    if (filter === "completed") return item.status === 2;
    if (filter === "running") return item.status === 1 || item.status === 0;
    if (filter === "failed") return item.status === 3;
    return true;
  });

  return (
    <div className="space-y-10 w-full max-w-6xl mx-auto py-10 px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-10">
        <div>
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Network className="h-5 w-5 text-white" />
             </div>
             <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
               Distributed <span className="text-emerald-400 font-normal">Activity</span>
             </h1>
          </div>
          <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-zinc-500 mt-4">Historical Audit & Execution Ledger</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex rounded-xl border border-zinc-800 bg-black p-1">
              {["all", "running", "completed", "failed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {f}
                </button>
              ))}
           </div>
           
           <Link href="/distributed/new" className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all flex items-center gap-3">
              <Plus className="w-4 h-4 text-white" />
              <span className="text-[11px] uppercase font-black tracking-widest text-white">New Pipeline</span>
           </Link>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="p-6 rounded-2xl border border-zinc-800 bg-black">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Total Pipelines</p>
            <p className="text-4xl font-black text-white">{history.length}</p>
         </div>
         <div className="p-6 rounded-2xl border border-zinc-800 bg-black">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Operational</p>
            <p className="text-4xl font-black text-white">{history.filter(h => h.status === 1).length}</p>
         </div>
         <div className="p-6 rounded-2xl border border-zinc-800 bg-black">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Successful</p>
            <p className="text-4xl font-black text-emerald-500">{history.filter(h => h.status === 2).length}</p>
         </div>
         <div className="p-6 rounded-2xl border border-zinc-800 bg-black">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Failed</p>
            <p className="text-4xl font-black text-rose-500">{history.filter(h => h.status === 3).length}</p>
         </div>
      </div>

      {/* Activity Table */}
      <div className="rounded-2xl border border-zinc-800 bg-black overflow-hidden shadow-2xl">
         <div className="px-8 py-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Activity className="w-4 h-4 text-zinc-400" />
               <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Workload Audit Ledger</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-zinc-600">
               <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
               </span>
            </div>
         </div>

         <div className="min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                 <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
                 <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600 animate-pulse">Synchronizing Ledger...</span>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                 <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                    <Search className="w-6 h-6 text-zinc-700" />
                 </div>
                 <h3 className="text-[13px] font-black uppercase text-zinc-400 tracking-widest">Zero Match Records</h3>
                 <p className="text-[11px] text-zinc-600 mt-2 uppercase tracking-widest">Adjust filters or initialize a new cluster job</p>
              </div>
            ) : (
              <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-500">
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest">Workload_ID</th>
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest">Strategy_Map</th>
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest">Status_Code</th>
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-right">Termination_Timestamp</th>
                        <th className="px-8 py-5 w-10"></th>
                     </tr>
                  </thead>
                 <tbody className="divide-y divide-zinc-800 transition-all">
                    {filteredHistory.map((job) => {
                      const status = statusConfig[job.status] || statusConfig[3];
                      return (
                        <tr 
                          key={job.job_id} 
                          onClick={() => window.location.href = `/distributed/${job.job_id}`}
                          className="group hover:bg-zinc-900/50 cursor-pointer transition-all"
                        >
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                 <span className="text-[14px] font-bold text-white transition-colors font-mono tracking-tight uppercase">{(job.job_id || "unknown").substring(0, 16).toUpperCase()}...</span>
                                 <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mt-1 opacity-70">shards: {job.total_maps || 1}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-black uppercase tracking-widest text-zinc-400">
                                 {job.job_type}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <div className={`inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-zinc-800 bg-black transition-all`}>
                                 <div className={`h-1.5 w-1.5 rounded-full ${status.color.replace('text', 'bg')} ${job.status <= 1 ? 'animate-glow-white' : ''}`} />
                                 <span className={`text-[10px] font-black uppercase tracking-widest ${status.color ? status.color : 'text-zinc-400'}`}>{status.label}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex flex-col">
                                 <span className="text-[13px] font-bold text-zinc-300 font-mono">{new Date(job.created_at).toLocaleDateString()}</span>
                                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">{new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 pr-10">
                              <ArrowRight className="w-4 h-4 text-zinc-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
                           </td>
                        </tr>
                      );
                    })}
                 </tbody>
              </table>
            )}
         </div>
      </div>
    </div>
  );
}
