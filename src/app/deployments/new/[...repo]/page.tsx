"use client";

import { use, useState } from "react";
import { finalizeDeployment } from "@/app/actions/deployment";
import { 
  Rocket, 
  Terminal, 
  Folder, 
  Database, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2,
  AlertCircle, 
  Globe,
  Cpu,
  HardDrive,
} from "lucide-react";
import Link from "next/link";

export default function DeploymentConfigPage({ params }: { params: Promise<{ repo: string[] }> }) {
  const { repo } = use(params);
  const repoFullName = repo.join("/");

  const [buildQuery, setBuildQuery] = useState("");
  const [runQuery, setRunQuery] = useState("");
  const [rootDirectory, setRootDirectory] = useState("./");
  const [envVars, setEnvVars] = useState("");
  const [exposedPort, setExposedPort] = useState("80");
  const [requiredCPU, setRequiredCPU] = useState("0.5");
  const [requiredRAM, setRequiredRAM] = useState("512");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await finalizeDeployment({
        repoFullName,
        buildQuery,
        runQuery,
        rootDirectory,
        envVars,
        exposedPort: parseInt(exposedPort) || 80,
        requiredCPU: parseFloat(requiredCPU) || 0.5,
        requiredRAM: parseInt(requiredRAM) || 512
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Deployment failed.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-6 text-center animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-brand-primary/20 animate-pulse" />
          <CheckCircle2 className="relative h-20 w-20 text-brand-primary shadow-[0_0_30px_rgba(34,197,94,0.4)] rounded-full" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Mission Control: <span className="text-brand-primary">Active</span></h2>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest leading-loose">
            The project has been synced and the initial deployment <br/> task has been submitted to the Brain.
          </p>
        </div>
        <Link href="/deployments" className="btn-primary px-8 mt-4 uppercase tracking-[0.2em] text-[10px]">
          View Cluster Status
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Breadcrumbs / Back */}
      <Link href="/deployments" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors w-fit">
        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
        Discard & Exit
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-tight">
          Configure <span className="text-brand-primary">Deployment</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_#22c55e]" />
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
            Targeting: <span className="text-white">{repoFullName}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {/* Core Settings */}
        <div className="md:col-span-2 glass-panel rounded-3xl p-8 space-y-8 border-white/5">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
              <Terminal className="h-5 w-5 text-brand-primary" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Execution Parameters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Build Command</label>
              <div className="relative">
                <input 
                  required
                  placeholder="npm install && npm run build"
                  value={buildQuery}
                  onChange={(e) => setBuildQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-brand-primary/40 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Run Command</label>
              <div className="relative">
                <input 
                  required
                  placeholder="npm start"
                  value={runQuery}
                  onChange={(e) => setRunQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-brand-primary/40 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Root Directory</label>
              <div className="relative">
                <Folder className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-primary/40" />
                <input 
                  required
                  placeholder="./"
                  value={rootDirectory}
                  onChange={(e) => setRootDirectory(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-brand-primary/40 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Exposed Port</label>
              <div className="relative">
                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-primary/40" />
                <input 
                  required
                  type="number"
                  placeholder="80"
                  value={exposedPort}
                  onChange={(e) => setExposedPort(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-brand-primary/40 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Requested CPU (Cores)</label>
              <div className="relative">
                <Cpu className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-primary/40" />
                <input 
                  required
                  type="number"
                  step="0.1"
                  placeholder="0.5"
                  value={requiredCPU}
                  onChange={(e) => setRequiredCPU(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-brand-primary/40 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Requested RAM (MB)</label>
              <div className="relative">
                <HardDrive className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-primary/40" />
                <input 
                  required
                  type="number"
                  placeholder="512"
                  value={requiredRAM}
                  onChange={(e) => setRequiredRAM(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-brand-primary/40 transition-all font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Environment Vars */}
        <div className="glass-panel rounded-3xl p-8 space-y-6 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-32 w-32 bg-brand-primary/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-primary/10 transition-all duration-700" />
          
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
              <Database className="h-5 w-5 text-brand-primary" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Environment</h2>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex justify-between">
              <span>Variables</span>
              <span className="text-brand-primary/60 italic lowercase font-bold tracking-normal">KEY=VALUE (one per line)</span>
            </label>
            <textarea 
              placeholder={"NODE_ENV=production\nAPI_KEY=********"}
              rows={8}
              value={envVars}
              onChange={(e) => setEnvVars(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 px-6 text-sm text-white placeholder:text-gray-800 focus:outline-none focus:border-brand-primary/40 transition-all font-mono resize-none custom-scrollbar"
            />
          </div>
        </div>

        {/* Finalize Action */}
        <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between border-white/5 bg-brand-primary/[0.02]">
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Finalize & Deploy</h2>
            <p className="text-[11px] font-medium leading-relaxed text-gray-500 uppercase tracking-wide">
              Clicking the button below will register the repository hooks with GitHub and submit the first deployment task to the Brain Raft consensus.
            </p>
          </div>

          <div className="space-y-4 mt-8">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-[10px] font-bold uppercase tracking-wider animate-in shake duration-500">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="group btn-primary w-full h-16 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(34,197,94,0.2)] hover:shadow-[0_20px_40px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:grayscale transition-all"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Launch Service
                  <Rocket className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
