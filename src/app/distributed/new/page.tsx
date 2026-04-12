"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import Editor from "@monaco-editor/react";
import { 
  Play, 
  Loader2, 
  Database, 
  FolderDown, 
  Network, 
  ArrowLeft,
  Cpu,
  HardDrive,
  Rocket
} from "lucide-react";
import { api } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";

const langDefaults = {
  python: "import sys\nimport os\n\nJOB_TYPE = os.environ.get(\"JOB_TYPE\", \"MAP\")\n\ndef map_task():\n    print(\"Executing MAP logic...\")\n    # Add mapping phase logic\n\ndef reduce_task():\n    print(\"Executing GATHER logic...\")\n    # Add reduction phase logic\n\nif __name__ == '__main__':\n    if JOB_TYPE == \"MAP\":\n        map_task()\n    elif JOB_TYPE == \"GATHER\":\n        reduce_task()\n",
  javascript: "// Map function — called once per chunk by the Goja VM.\nfunction map_task() {\n    return JSON.stringify({ result: \"success\" });\n}\n\nfunction reduce_task() {\n    return \"Final aggregated result\";\n}\n",
  go: "package main\nimport \"fmt\"\nfunc main() { fmt.Println(\"Distributed Go Task\") }",
  cpp: "#include <iostream>\nint main() { std::cout << \"C++ Task\" << std::endl; return 0; }"
};

const exts = { python: "py", javascript: "js", go: "go", cpp: "cpp" };

export default function NewDistributedPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<keyof typeof langDefaults>("python");
  const [code, setCode] = useState(langDefaults.python);
  const [jobMode, setJobMode] = useState<"GENERIC" | "ML_TRAIN">("GENERIC");
  const [datasetInput, setDatasetInput] = useState("");
  const [reportInput, setReportInput] = useState("./reports");
  const [argsInput, setArgsInput] = useState("");
  
  const [totalNodes, setTotalNodes] = useState(2);
  const [cpu, setCpu] = useState(2);
  const [ram, setRam] = useState(512);

  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleDeploy = async () => {
    console.log("🚀 [deploy] Launching Pipeline chain check...");
    setIsDeploying(true);
    setError(null);

    try {
      console.log("🔑 [deploy] Fetching Supabase session...");
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (token) {
        console.log("✅ [deploy] Auth token acquired.");
      } else {
        console.warn("⚠️ [deploy] No auth token found. Falling back to System key.");
      }

      let runCommand = "";
      if (language === "python") runCommand = "python3";
      if (language === "javascript") runCommand = "node";
      if (language === "go") runCommand = "go run";
      if (language === "cpp") runCommand = "g++ -o /app/out.out";

      const args = argsInput ? argsInput.split(",").map(s => s.trim()) : [];

      console.log("🧠 [deploy] Sending POST to Brain API (/api/deploy) with raw code for cloud staging...");
      const deployRes = await api.deploy({
        code,
        extension: exts[language],
        source_type: "local",
        job_type: jobMode === "ML_TRAIN" ? "ML_TRAIN" : "MAP", 
        total_maps: totalNodes,
        required_cpu: cpu,
        required_ram: ram,
        run_command: runCommand, // Brain will append filename after staging
        args,
        env: {
          "DATASET_PATH": datasetInput,
          "REPORT_DIR": reportInput
        }
      }, token);

      console.log("🏆 [deploy] SUCCESS! Redirecting to monitor:", deployRes.job_id);
      router.push(`/distributed/${deployRes.job_id}`);
    } catch (err: any) {
      console.error("❌ [deploy] CHAIN BROKEN:", err);
      setError(err.message || "Failed to deploy pipeline");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/distributed" className="p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
              Launch <span className="text-brand-primary">Pipeline</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Configure your distributed cluster</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group/select">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as any)}
              className="rounded-xl border border-white/5 bg-white/5 pl-4 pr-10 py-2.5 text-xs font-bold text-white outline-none focus:border-brand-primary/30 uppercase tracking-widest cursor-pointer appearance-none transition-all group-hover/select:bg-white/[0.08]"
            >
              <option value="python" className="bg-zinc-900">Python 3.10</option>
              <option value="javascript" className="bg-zinc-900">Node.js ES6</option>
              <option value="go" className="bg-zinc-900">Go 1.21</option>
              <option value="cpp" className="bg-zinc-900">C++ 17</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover/select:text-brand-primary transition-colors" />
          </div>
          
          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="btn-primary px-8 py-3 gap-3"
          >
            {isDeploying ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Rocket className="h-4 w-4 text-black fill-black" />}
            {isDeploying ? "Deploying..." : "Launch Pipeline"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-14rem)]">
        {/* Workspace */}
        <div className="col-span-8 flex flex-col gap-4">
          <div className="flex-1 rounded-2xl border border-white/5 bg-black overflow-hidden relative shadow-2xl">
             <div className="absolute top-4 right-4 z-10 flex gap-2">
                <div className="px-2 py-1 rounded bg-black/50 border border-white/10 text-[9px] font-mono text-gray-400">READ_ONLY: FALSE</div>
             </div>
             <Editor
               height="100%"
               theme="vs-dark"
               language={language}
               value={code}
               onChange={(val) => setCode(val || "")}
               options={{
                 minimap: { enabled: false },
                 fontSize: 14,
                 fontFamily: "var(--font-mono), monospace",
                 padding: { top: 20 },
                 cursorStyle: 'block',
                 lineNumbers: 'on',
                 renderLineHighlight: 'all',
                 scrollbar: { verticalScrollbarSize: 0 }
               }}
             />
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-xl">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <Database className="w-4 h-4 text-brand-primary" />
                   <h3 className="text-xs font-black uppercase tracking-widest text-white">Data Strategy</h3>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Dataset Connection</label>
                  <input
                    type="text"
                    value={datasetInput}
                    onChange={(e) => setDatasetInput(e.target.value)}
                    placeholder="https://bucket.azure.com/data.csv"
                    className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-white placeholder-gray-700 outline-none focus:border-brand-primary/30 transition-all font-mono"
                  />
                </div>
             </div>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <FolderDown className="w-4 h-4 text-brand-primary" />
                   <h3 className="text-xs font-black uppercase tracking-widest text-white">Output Sink</h3>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Reports Directory</label>
                  <input
                    type="text"
                    value={reportInput}
                    onChange={(e) => setReportInput(e.target.value)}
                    placeholder="./output"
                    className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-white placeholder-gray-700 outline-none focus:border-brand-primary/30 transition-all font-mono"
                  />
                </div>
             </div>
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="col-span-4 flex flex-col gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-8 shadow-2xl overflow-y-auto custom-scrollbar">
           <div className="space-y-2">
             <h2 className="text-sm font-black uppercase tracking-widest text-white">Cluster Topology</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">Resource allocation per worker node</p>
           </div>

           <div className="space-y-5">
              <div className="space-y-3 p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Network className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Worker Shards</span>
                    </div>
                    <span className="text-xs font-black text-purple-400 font-mono">{totalNodes}</span>
                 </div>
                 <input type="range" min={1} max={32} value={totalNodes} onChange={(e) => setTotalNodes(Number(e.target.value))} className="w-full accent-purple-500 h-1.5" />
                 <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase">
                    <span>1 Unit</span>
                    <span>32 Units</span>
                 </div>
              </div>

              <div className="space-y-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">vCPU Reservation</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono">{cpu} Cores</span>
                 </div>
                 <input type="range" min={1} max={16} value={cpu} onChange={(e) => setCpu(Number(e.target.value))} className="w-full accent-emerald-500 h-1" />

                 <div className="h-px bg-white/5 my-2" />

                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">RAM Allocation</span>
                    </div>
                    <span className="text-xs font-black text-blue-400 font-mono">{ram >= 1024 ? `${ram/1024} GB` : `${ram} MB`}</span>
                 </div>
                 <input type="range" min={128} max={8192} step={128} value={ram} onChange={(e) => setRam(Number(e.target.value))} className="w-full accent-blue-500 h-1" />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Execution Strategy</label>
                <div className="relative group/select">
                  <select 
                    value={jobMode}
                    onChange={(e) => setJobMode(e.target.value as any)}
                    className="w-full rounded-xl border border-white/5 bg-white/5 pl-4 pr-10 py-3 text-xs font-bold text-white outline-none focus:border-brand-primary/30 uppercase tracking-widest cursor-pointer appearance-none transition-all group-hover/select:bg-white/[0.08]"
                  >
                    <option value="GENERIC" className="bg-zinc-900">Standard Map-Reduce</option>
                    <option value="ML_TRAIN" className="bg-zinc-900">Distributed ML (PS)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none group-hover/select:text-brand-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Environment Args</label>
                <input
                  type="text"
                  value={argsInput}
                  onChange={(e) => setArgsInput(e.target.value)}
                  placeholder="--epoch 10, --lr 0.001"
                  className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-white placeholder-gray-700 outline-none focus:border-brand-primary/30 transition-all font-mono"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-[10px] font-black uppercase tracking-wider text-red-400">
                  ⚠️ ERROR: {error}
                </div>
              )}
           </div>

           <div className="mt-auto pt-6 border-t border-white/5">
              <div className="bg-brand-primary/5 rounded-xl p-4 border border-brand-primary/10">
                 <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary mb-1">Estimated Capacity</p>
                 <div className="flex justify-between items-end">
                    <span className="text-xl font-black text-white italic">{(totalNodes * cpu).toFixed(1)}<span className="text-[10px] not-italic text-gray-500 ml-1">vCores</span></span>
                    <span className="text-sm font-black text-gray-400 uppercase tracking-tighter">Total Pool</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
