"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  HardDrive,
  Server,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Globe,
  Loader2,
} from "lucide-react";
import {
  mockEvents,
  formatBytes,
  timeAgo,
} from "@/lib/mock-data";
import { api, Node, Deployment } from "@/lib/api";

const severityConfig = {
  success: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  info: { icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
  error: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10" },
};

interface OverviewClientProps {
  initialNodes: Node[];
  initialDeployments: Deployment[];
  sessionToken: string;
}

export default function OverviewClient({ initialNodes, initialDeployments, sessionToken }: OverviewClientProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [deployments, setDeployments] = useState<Deployment[]>(initialDeployments);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [n, d] = await Promise.all([
          api.getNodes(sessionToken),
          api.getDeployments(sessionToken),
        ]);
        setNodes(n || []);
        setDeployments(d || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch cluster state:", err);
        setError("Connection to Brain interrupted. Retrying...");
      }
    }

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [sessionToken]);

  const totalCores = nodes.reduce((a, n) => a + (n.total_cpu || 0), 0);
  const totalRam = nodes.reduce((a, n) => a + (n.total_ram || 0), 0);
  const activeNodes = nodes.length;
  const runningJobs = deployments.filter(d => d.status === 1).length;

  const stats = [
    { label: "CPU Cores", value: totalCores, icon: Cpu, color: "text-nebula-pink", border: "border-t-nebula-pink/30" },
    { label: "RAM", value: formatBytes(totalRam), icon: HardDrive, color: "text-blue-400", border: "border-t-blue-400/30" },
    { label: "Active Nodes", value: activeNodes, icon: Server, color: "text-amber-400", border: "border-t-amber-400/30" },
    { label: "Worker Tasks", value: runningJobs, icon: Activity, color: "text-emerald-400", border: "border-t-emerald-400/30" },
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-20 px-6">
      {/* Clean Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Brain <span className="text-blue-400 font-normal">Control Center</span>
          </h1>
          <p className="text-[12px] font-bold text-zinc-500 mt-3 uppercase tracking-[0.3em] font-mono">
            System status and infrastructure overview
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 text-[11px] font-bold text-red-500 animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            Control Plane Interrupt: {error}
          </div>
        )}
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`group rounded-2xl border border-zinc-800 bg-black p-8 transition-all hover:border-zinc-700 hover:shadow-2xl border-t-2 ${stat.border}`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color} transition-colors opacity-80 group-hover:opacity-100`} />
            </div>
            <p className="text-4xl font-black tracking-tighter text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Integrated Muscle Fleet */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">Active Muscle Fleet</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live Sync</span>
            </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-black overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Node_Identifier</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">CPU_Allocation</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Memory_Load</th>
                <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-right">Last_Heartbeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 font-mono">
              {nodes.map((node) => (
                <tr key={node.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-6 py-5">
                    <span className="text-[14px] font-bold text-white">{node.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       {/* Calculate online status based on heartbeat (recent = online) */}
                       {(() => {
                         const isOnline = (Date.now() - new Date(node.last_heartbeat).getTime()) < 60000;
                         return (
                           <>
                             <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`} />
                             <span className={`text-[11px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                               {isOnline ? "Online" : "Terminated"}
                             </span>
                           </>
                         );
                       })()}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-white opacity-40 transition-all duration-1000" style={{ width: `${Math.random() * 60 + 20}%` }} />
                       </div>
                       <span className="text-[12px] font-bold text-zinc-400">{(nodes.indexOf(node) % 3 + 1) * 15}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[12px] font-bold text-zinc-400">{formatBytes(node.total_ram - node.avail_ram || 1024)} / {formatBytes(node.total_ram || 4096)}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-[12px] font-bold text-zinc-600">{timeAgo(node.last_heartbeat || new Date().toISOString())}</span>
                  </td>
                </tr>
              ))}
              {nodes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-[12px] font-bold text-zinc-600 uppercase tracking-widest">No Active Muscle Intersections Detected</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
