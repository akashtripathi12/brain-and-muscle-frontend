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
  const usedCores = nodes.reduce((a, n) => a + ((n.total_cpu || 0) - (n.avail_cpu || 0)), 0);
  
  const totalRam = nodes.reduce((a, n) => a + (n.total_ram || 0), 0);
  const usedRam = nodes.reduce((a, n) => a + ((n.total_ram || 0) - (n.avail_ram || 0)), 0);

  const activeNodes = nodes.length;
  const runningJobs = deployments.filter(d => d.status === 1).length;

  const stats = [
    {
      label: "Total Cores",
      value: totalCores,
      unit: "CPUs",
      used: `${usedCores} in use`,
      icon: Cpu,
      color: "pink",
      gradient: "from-nebula-pink/10 to-nebula-pink/2",
      border: "border-nebula-pink/10",
      glow: "shadow-[0_0_40px_rgba(166,77,121,0.05)]",
    },
    {
      label: "Total RAM",
      value: formatBytes(totalRam),
      unit: "",
      used: `${formatBytes(usedRam)} in use`,
      icon: HardDrive,
      color: "pink",
      gradient: "from-nebula-pink/10 to-nebula-pink/2",
      border: "border-nebula-pink/10",
      glow: "shadow-[0_0_40px_rgba(166,77,121,0.05)]",
    },
    {
      label: "Active Muscles",
      value: activeNodes,
      unit: `Nodes`,
      icon: Server,
      color: "pink",
      gradient: "from-nebula-pink/10 to-nebula-pink/2",
      border: "border-nebula-pink/10",
      glow: "shadow-[0_0_40px_rgba(166,77,121,0.05)]",
    },
    {
      label: "Running Jobs",
      value: runningJobs,
      unit: "Apps",
      icon: Activity,
      color: "pink",
      gradient: "from-nebula-pink/10 to-nebula-pink/2",
      border: "border-nebula-pink/10",
      glow: "shadow-[0_0_40px_rgba(166,77,121,0.05)]",
    },
  ];

  const colorMap: Record<string, string> = {
    pink: "text-nebula-pink",
  };

  const iconBgMap: Record<string, string> = {
    pink: "bg-nebula-pink/10",
  };

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">
            Global <span className="text-zinc-600">Overview</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mt-2">
            Real-time infrastructure health_flux
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-rose-500">
            <AlertTriangle className="h-4 w-4" />
            Control Plane Interrupt: {error}
          </div>
        )}
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`group relative overflow-hidden rounded-2xl border ${stat.border} bg-nebula-maroon/10 p-6 transition-all duration-500 hover:bg-nebula-maroon/20 ${stat.glow}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-nebula-pink transition-colors">
                  {stat.label}
                </p>
                <p className="mt-3 text-4xl font-bold tracking-tight text-white font-mono">
                  {stat.value}
                </p>
                <div className="mt-2 flex items-center gap-2">
                   <span className="text-[10px] font-semibold text-nebula-pink/60 uppercase">{stat.unit}</span>
                   {stat.used && (
                     <>
                        <span className="w-1 h-1 rounded-full bg-white/5" />
                        <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-widest">
                          {stat.used}
                        </span>
                     </>
                   )}
                </div>
              </div>
              <div
                className={`rounded-xl p-3 border border-white/5 ${iconBgMap[stat.color]} group-hover:scale-110 transition-transform duration-500`}
              >
                <stat.icon className={`h-6 w-6 ${colorMap[stat.color]}`} />
              </div>
            </div>
            {/* Holographic scanner line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-nebula-pink/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </div>
        ))}
      </div>
    </div>
  );
}
