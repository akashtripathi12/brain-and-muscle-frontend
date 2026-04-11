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
    <div className="space-y-8 w-full py-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-nebula-maroon border border-white/5 flex items-center justify-center">
                <Network className="h-4 w-4 text-nebula-pink" />
             </div>
             <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
               Distributed <span className="text-nebula-pink">Activity</span>
             </h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mt-2">Historical Audit & Execution Ledger</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex rounded-xl border border-white/5 bg-nebula-maroon/20 p-1">
              {["all", "running", "completed", "failed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                    filter === f ? "bg-nebula-pink text-white shadow-lg shadow-nebula-pink/20" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {f}
                </button>
              ))}
           </div>
           
           <Link href="/distributed/new" className="btn-primary !px-6 !py-3 gap-3 !bg-gradient-to-br from-nebula-pink to-nebula-purple shadow-2xl">
              <Plus className="w-4 h-4 text-white" />
              <span className="text-[10px] uppercase font-black tracking-widest">New Pipeline</span>
           </Link>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-6">
         <div className="rounded-2xl border border-white/5 bg-nebula-maroon/10 p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <Network className="w-32 h-32 text-nebula-pink" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-nebula-pink/10 border border-nebula-pink/20">
                <Activity className="w-4 h-4 text-nebula-pink" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Live Shard Pool</span>
            </div>
            <p className="text-4xl font-black text-white italic tracking-tighter">
               {history.filter(h => h.status < 2).length}
               <span className="text-xs not-italic text-nebula-pink ml-3 uppercase tracking-widest opacity-50">Active_Nodes</span>
            </p>
         </div>
         <div className="rounded-2xl border border-white/5 bg-nebula-maroon/10 p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <CheckCircle className="w-32 h-32 text-nebula-pink" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-nebula-purple/20 border border-nebula-purple/30">
                <CheckCircle className="w-4 h-4 text-nebula-pink" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Successful Terminations</span>
            </div>
            <p className="text-4xl font-black text-white italic tracking-tighter">
               {history.filter(h => h.status === 2).length}
               <span className="text-xs not-italic text-nebula-pink ml-3 uppercase tracking-widest opacity-50">Archived</span>
            </p>
         </div>
      </div>

      {/* Activity Table */}
      <div className="rounded-2xl border border-white/5 bg-nebula-black overflow-hidden shadow-2xl">
         <div className="px-6 py-5 border-b border-white/5 bg-nebula-maroon/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Activity className="w-4 h-4 text-nebula-pink" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Workload Audit Ledger</span>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">
               <span className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-nebula-pink animate-pulse" />
                  Synced: {mounted ? new Date().toLocaleTimeString() : "--:--:--"}
               </span>
            </div>
         </div>

         <div className="min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                 <Loader2 className="w-8 h-8 animate-spin text-nebula-pink" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 animate-pulse">Synchronizing Distributed Lexicon...</span>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6">
                    <Search className="w-6 h-6 text-gray-700" />
                 </div>
                 <h3 className="text-sm font-black uppercase italic text-gray-400 tracking-tighter">Zero Match Records</h3>
                 <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-[0.2em]">Adjust control parameters or initialize a new cluster job</p>
              </div>
            ) : (
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-white/5 bg-nebula-maroon/5 text-gray-600">
                       <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em]">Workload_ID</th>
                       <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em]">Strategy_Map</th>
                       <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em]">Status_Code</th>
                       <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-right">Termination_Timestamp</th>
                       <th className="px-8 py-5 w-10"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filteredHistory.map((job) => {
                      const status = statusConfig[job.status] || statusConfig[3];
                      return (
                        <tr 
                          key={job.job_id} 
                          onClick={() => window.location.href = `/distributed/${job.job_id}`}
                          className="group hover:bg-nebula-maroon/20 cursor-pointer transition-all border-l-2 border-transparent hover:border-nebula-pink"
                        >
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                 <span className="text-[11px] font-black text-white italic group-hover:text-nebula-pink transition-colors font-mono tracking-tight uppercase">{(job.job_id || "unknown").substring(0, 16)}...</span>
                                 <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest mt-1.5 opacity-50">shards: {job.total_maps || 1}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className="px-2.5 py-1 rounded-md bg-nebula-black border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                 {job.job_type}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <div className={`inline-flex items-center gap-3 px-3 py-1.5 rounded-full border ${status.border} ${status.bg} transition-all`}>
                                 <div className={`h-1.5 w-1.5 rounded-full ${status.color.replace('text', 'bg')} ${job.status <= 1 ? 'animate-glow-pink' : ''}`} />
                                 <span className={`text-[9px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex flex-col">
                                 <span className="text-[11px] font-bold text-zinc-400 font-mono">{new Date(job.created_at).toLocaleDateString()}</span>
                                 <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-1.5">{new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 pr-10">
                              <ArrowRight className="w-4 h-4 text-gray-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-nebula-pink transition-all" />
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
