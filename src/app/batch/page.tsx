"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Play, Loader2, Code2, Database, FolderDown, Download, CheckCircle, Activity, Terminal, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { createClient } from "@/utils/supabase/client";

const langDefaults = {
  python: `import sys
import os

print('Batch task starting')
# Add your logic here
`,
  javascript: `console.log('Batch task starting');
// Add your logic here
`,
  go: `package main

import "fmt"

func main() {
	fmt.Println("Batch task starting")
}
`,
  cpp: `#include <iostream>

int main() {
	std::cout << "Batch task starting\\n";
	return 0;
}
`
};

const exts = { python: "py", javascript: "js", go: "go", cpp: "cpp" };

export default function BatchDeployPage() {
  const [language, setLanguage] = useState<keyof typeof langDefaults>("python");
  const [code, setCode] = useState(langDefaults.python);
  const [datasetInput, setDatasetInput] = useState("");
  const [reportInput, setReportInput] = useState("./reports");
  const [argsInput, setArgsInput] = useState("");
  
  const [cpu, setCpu] = useState(2);
  const [ram, setRam] = useState(512);

  const supabase = createClient();

  const [isDeploying, setIsDeploying] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>("PROVISIONING");
  const [error, setError] = useState<string | null>(null);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Status polling.
  useEffect(() => {
    if (!jobId || jobStatus === "COMPLETED" || jobStatus === "FAILED") return;

    const interval = setInterval(async () => {
      try {
        const deployments = await api.getDeployments();
        const current = deployments.find((d: any) => d.job_id === jobId);
        if (current) {
          const statusMap = ["PROVISIONING", "RUNNING", "COMPLETED", "FAILED"];
          setJobStatus(statusMap[current.status] || "UNKNOWN");
        }
      } catch (err) {
        console.error("Failed to poll job status:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  // Log streaming.
  useEffect(() => {
    if (!jobId) return;
    
    let isMounted = true;
    const controller = new AbortController();

    async function streamLogs() {
      try {
        const response = await fetch(`/api/brain/logs/${jobId}`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          // Blob doesn't exist yet — worker hasn't synced logs yet. Wait silently.
          if (isMounted) setTimeout(streamLogs, 5000);
          return;
        }

        if (!response.ok) throw new Error("Log stream failed");

        const text = await response.text();
        if (!text.trim()) {
          // Empty log — retry
          if (isMounted) setTimeout(streamLogs, 5000);
          return;
        }

        const rawLines = text.split('\n');
        if (isMounted) {
          const localizedLines = rawLines
            .map(line => {
              if (!line.trim()) return null;
              // Docker format: 2026-04-10T00:20:56.546768952Z ...
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

        // Poll again after 5s to pick up new log lines from the worker
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
  }, [jobId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({
        top: logContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [visibleLogs]);

  const handleLanguageChange = (e: any) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(langDefaults[newLang as keyof typeof langDefaults]);
  };

  const [deployStage, setDeployStage] = useState<string>("Initializing");

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    setJobId(null);
    setJobStatus("PROVISIONING");
    setDeployStage("Signing Payload");

    try {
      const { data: { session, user: sbUser } } = await supabase.auth.getSession() as any;
      const token = session?.access_token as string | undefined;
      const userEmail = sbUser?.email || session?.user?.email;

      setDeployStage("Cloud Handshake");

      // Prepare execution strategy
      let runCommand = "";
      if (language === "python") runCommand = "python3";
      if (language === "javascript") runCommand = "node";
      if (language === "go") runCommand = "go run";
      if (language === "cpp") runCommand = "g++ -o /app/out.out";

      // Build task args logic
      const args = argsInput ? argsInput.split(",").map(s => s.trim()) : [];

      setDeployStage("Staging Code");

      // 1. Submit to Brain directly with raw code for cloud staging
      const deployRes = await api.deploy({
        code,
        extension: exts[language],
        source_type: "local",
        job_type: "MAP",
        total_maps: 1, // Ensure single node execution
        required_cpu: cpu,
        required_ram: ram,
        run_command: runCommand, // Brain will append filename after staging
        args,
        env: {
          "DATASET_PATH": datasetInput,
          "REPORT_DIR": reportInput
        }
      }, token, userEmail);

      setDeployStage("Stack Provisioned");
      setJobId(deployRes.job_id);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to deploy batch task");
    } finally {
      setIsDeploying(false);
      setDeployStage("Initializing");
    }
  };

  const downloadOutput = async () => {
    if (!jobId) return;
    try {
      // Get the secure Azure download SAS string from the Brain API
      const res = await api.getDownloadUrl(jobId);
      if (!res.download_url) throw new Error("No Azure Blob URL returned");

      // Fetch the actual file directly from Azure infrastructure
      const resp = await fetch(res.download_url);
      if (!resp.ok) throw new Error("Failed to fetch output from Azure Storage");
      
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `batch_output_${jobId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download results. Please ensure the job successfully saved its results to Azure.");
    }
  };  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-6xl mx-auto px-6 gap-10">
      {/* Precision Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-10">
        <div>
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Code2 className="h-5 w-5 text-white" />
             </div>
             <h1 className="text-3xl font-black tracking-tight text-white uppercase">
          Batch <span className="text-amber-400 font-normal">Execution</span>
        </h1>
          </div>
          <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-zinc-500 mt-4 font-mono">Single Node Execution Plane</p>
        </div>

        <select 
          value={language} 
          onChange={handleLanguageChange}
          className="rounded-lg border border-zinc-800 bg-black px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-white transition-colors cursor-pointer"
        >
          <option value="python">Python 3.11</option>
          <option value="javascript">Node.js LTS</option>
          <option value="go">Go 1.21</option>
          <option value="cpp">C++ 17</option>
        </select>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* LEFT PANE - Script Editor */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="flex-1 overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl bg-black">
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
                padding: { top: 24, bottom: 24 },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* RIGHT PANE - Configuration & Logs Pillar */}
        <div className="flex w-[380px] flex-col gap-6 shrink-0 h-full overflow-y-auto pr-2 custom-scrollbar">
          {!jobId ? (
             <>
              {/* IO Configuration Group */}
              <div className="space-y-6 rounded-2xl border border-zinc-800 bg-black p-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600 border-b border-zinc-800 pb-4">Configuration</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                       Dataset Context
                    </label>
                    <input
                      type="text"
                      value={datasetInput}
                      onChange={(e) => setDatasetInput(e.target.value)}
                      placeholder="s3://... or /mount/path"
                      className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-xs font-mono text-white placeholder-zinc-700 outline-none transition-colors focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                      Batch Arguments
                    </label>
                    <input
                      type="text"
                      value={argsInput}
                      onChange={(e) => setArgsInput(e.target.value)}
                      placeholder="--iter 100 --epoch 5"
                      className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-xs font-mono text-white placeholder-zinc-700 outline-none transition-colors focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                      Report Export
                    </label>
                    <input
                      type="text"
                      value={reportInput}
                      onChange={(e) => setReportInput(e.target.value)}
                      placeholder="./reports"
                      className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-xs font-mono text-white placeholder-zinc-700 outline-none transition-colors focus:border-white"
                    />
                  </div>
                </div>
              </div>

              {/* Compute Group */}
              <div className="flex flex-col gap-8 rounded-2xl border border-zinc-800 bg-black p-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-600 border-b border-zinc-800 pb-4">Resources</h3>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">CPU Cores</span>
                      <span className="font-mono text-[13px] font-bold text-white">{cpu}</span>
                    </div>
                    <input
                      type="range"
                      min={0.1} max={16} step={0.1}
                      value={cpu}
                      onChange={(e) => setCpu(Number(e.target.value))}
                      className="w-full h-1.5 appearance-none rounded-full bg-zinc-900 border border-zinc-800 cursor-pointer accent-white"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Memory</span>
                      <span className="font-mono text-[13px] font-bold text-white">{ram >= 1024 ? `${ram/1024} GB` : `${ram} MB`}</span>
                    </div>
                    <input
                      type="range"
                      min={128} max={8192} step={128}
                      value={ram}
                      onChange={(e) => setRam(Number(e.target.value))}
                      className="w-full h-1.5 appearance-none rounded-full bg-zinc-900 border border-zinc-800 cursor-pointer accent-white"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-[11px] font-bold uppercase tracking-widest text-rose-500">
                    <AlertTriangle className="h-4 w-4 inline mr-3" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="btn-primary w-full py-4 transition-all flex items-center justify-center gap-4 shadow-xl"
                >
                  {isDeploying ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Play className="h-4 w-4 fill-white" />}
                  {isDeploying ? `${deployStage}...` : "Initialize Execution"}
                </button>
              </div>
             </>
          ) : (
             <div className="flex flex-col h-full gap-6">
               <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black p-5">
                 <div className="flex items-center gap-4">
                   <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-zinc-800 bg-zinc-900/50 ${
                     jobStatus === "COMPLETED" ? "text-emerald-500" : "text-white animate-pulse"
                   }`}>
                     {jobStatus === "COMPLETED" ? <CheckCircle className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                     {jobStatus}
                   </div>
                   <span className="text-[11px] font-mono font-bold text-zinc-600 uppercase">{jobId.slice(0, 16).toUpperCase()}</span>
                 </div>

                  {jobStatus === "COMPLETED" && (
                    <button 
                      onClick={downloadOutput}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-white shadow-lg transition-all hover:border-zinc-500 hover:bg-black"
                      title="Download Output"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
               </div>
               
               <div className="flex-1 min-h-0 basis-0 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col bg-black">
                 <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-6 py-4">
                   <Terminal className="h-4 w-4 text-zinc-500" />
                   <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white font-mono">Real-Time Trace</span>
                   <div className="ml-auto flex items-center gap-2">
                     {jobStatus !== "COMPLETED" && jobStatus !== "FAILED" && (
                       <div className="flex items-center gap-3">
                         <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Capture Active</span>
                       </div>
                     )}
                   </div>
                 </div>
                 <div
                   ref={logContainerRef}
                   className="flex-1 overflow-y-auto p-6 font-mono text-[12px] custom-scrollbar selection:bg-white/20"
                 >
                   {visibleLogs.length === 0 ? (
                     <div className="flex items-center gap-4 text-zinc-700 font-bold uppercase tracking-widest text-[10px]">
                       <Loader2 className="h-4 w-4 animate-spin text-zinc-800" />
                       Awaiting Infrastructure Handshake...
                     </div>
                   ) : (
                     visibleLogs.map((log, i) => (
                       <div
                         key={i}
                         className="whitespace-pre-wrap py-1 px-4 border-l border-transparent hover:border-zinc-800 hover:bg-zinc-900/20 transition-all text-zinc-500 font-medium group"
                       >
                         <span className="text-zinc-800 mr-4 select-none opacity-40 group-hover:opacity-100 transition-opacity">{(i+1).toString().padStart(3, '0')}</span>
                         {log}
                       </div>
                     ))
                   )}
                   <div className="mt-4 pl-4">
                     <span className="inline-block h-4 w-2 animate-pulse bg-zinc-800" />
                   </div>
                 </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
