"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Play, Loader2, Code2, Database, FolderDown, Download, CheckCircle, Activity, Terminal, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

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
        const brainUrl = process.env.NEXT_PUBLIC_BRAIN_URL || "http://localhost:8888";
        const apiKey = process.env.NEXT_PUBLIC_BRAIN_API_KEY || "";

        const response = await fetch(`${brainUrl}/api/logs/${jobId}`, {
          headers: { "X-API-Key": apiKey },
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Log stream failed");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) return;

        while (isMounted) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Split into lines for better display
          const rawLines = chunk.split('\n');
          
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

            setVisibleLogs((prev) => [...prev, ...localizedLines]);
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Stream error:", err);
          if (isMounted) {
            setVisibleLogs((prev) => [...prev, "--- Log stream disconnected, retrying in 3s... ---"]);
            setTimeout(streamLogs, 3000);
          }
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

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    setJobId(null);
    setJobStatus("PROVISIONING");

    try {
      // 1. Save the code to local NextJS server disk
      const saveRes = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, extension: exts[language] })
      });
      const saveData = await saveRes.json();
      
      if (!saveRes.ok) {
        throw new Error(saveData.error || "Failed to save script internally");
      }

      // Prepare execution strategy
      let runCommand = "";
      if (language === "python") runCommand = "python3";
      if (language === "javascript") runCommand = "node";
      if (language === "go") runCommand = "go run";
      // for cpp we would normally need build & run, but let's assume muscle might handle it or we use run_command "g++ script.cpp -o out && ./out"
      if (language === "cpp") runCommand = "g++ -o /app/out.out";

      // Build task args logic
      // Passing dataset to the script as an argument natively
      const args = argsInput ? argsInput.split(",").map(s => s.trim()) : [];

      // 2. Submit to Brain
      const deployRes = await api.deploy({
        user_script_path: saveData.scriptPath,
        source_type: "local",
        job_type: "MAP",
        total_maps: 1, //  Ensure single node execution
        required_cpu: cpu,
        required_ram: ram,
        run_command: runCommand ? `${runCommand} ${saveData.scriptPath}` : undefined,
        args,
        env: {
          "DATASET_PATH": datasetInput,
          "REPORT_DIR": reportInput
        }
      });

      setJobId(deployRes.job_id);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to deploy batch task");
    } finally {
      setIsDeploying(false);
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
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)] w-full">
      {/* LEFT PANE - Massive Script Editor */}
      <div className="flex flex-1 flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-nebula-maroon border border-white/5 flex items-center justify-center">
              <Code2 className="h-4 w-4 text-nebula-pink" />
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">Batch Terminal</h1>
              <p className="text-[10px] font-black tracking-[0.2em] text-gray-600 uppercase">Single Node execution Plane</p>
            </div>
          </div>
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="rounded-lg border border-white/5 bg-nebula-maroon px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-nebula-pink/50 transition-colors cursor-pointer"
          >
            <option value="python">Python 3.11</option>
            <option value="javascript">Node.js LTS</option>
            <option value="go">Go 1.21</option>
            <option value="cpp">C++ 17</option>
          </select>
        </div>

        {/* Editor Area - Expanded Height */}
        <div className="flex-1 min-h-[500px] overflow-hidden rounded-xl border border-white/5 shadow-2xl bg-nebula-black">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "var(--font-mono), monospace",
              padding: { top: 20 },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      {/* RIGHT PANE - Configuration & Logs Pillar */}
      <div className="flex w-[400px] flex-col gap-4 shrink-0 h-full overflow-y-auto pr-2 custom-scrollbar">
        {!jobId ? (
           <>
            {/* IO Configuration Group */}
            <div className="space-y-4 rounded-xl border border-white/5 bg-nebula-maroon/20 p-5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5 pb-3">I/O Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <Database className="h-3 w-3 text-nebula-pink" />
                    Dataset Context
                  </label>
                  <input
                    type="text"
                    value={datasetInput}
                    onChange={(e) => setDatasetInput(e.target.value)}
                    placeholder="s3://... or /mount/path"
                    className="mt-2 w-full rounded-lg border border-white/5 bg-nebula-black px-4 py-2.5 text-xs font-mono text-white placeholder-gray-700 outline-none transition-colors focus:border-nebula-pink/50"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <Terminal className="h-3 w-3 text-nebula-pink" />
                    Batch Arguments
                  </label>
                  <input
                    type="text"
                    value={argsInput}
                    onChange={(e) => setArgsInput(e.target.value)}
                    placeholder="--iter 100 --epoch 5"
                    className="mt-2 w-full rounded-lg border border-white/5 bg-nebula-black px-4 py-2.5 text-xs font-mono text-white placeholder-gray-700 outline-none transition-colors focus:border-nebula-pink/50"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <FolderDown className="h-3 w-3 text-nebula-pink" />
                    Report Export
                  </label>
                  <input
                    type="text"
                    value={reportInput}
                    onChange={(e) => setReportInput(e.target.value)}
                    placeholder="./reports"
                    className="mt-2 w-full rounded-lg border border-white/5 bg-nebula-black px-4 py-2.5 text-xs font-mono text-white placeholder-gray-700 outline-none transition-colors focus:border-nebula-pink/50"
                  />
                </div>
              </div>
            </div>

            {/* Compute Group */}
            <div className="flex flex-col gap-6 rounded-xl border border-white/5 bg-nebula-maroon/20 p-5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5 pb-3">Compute Allocation</h3>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">CPU V-Cores</span>
                    <span className="font-mono text-sm font-bold text-nebula-pink italic">{cpu}</span>
                  </div>
                  <input
                    type="range"
                    min={1} max={16}
                    value={cpu}
                    onChange={(e) => setCpu(Number(e.target.value))}
                    className="w-full h-1.5 appearance-none rounded-lg bg-nebula-black border border-white/5 cursor-pointer accent-nebula-pink"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Memory (RAM)</span>
                    <span className="font-mono text-sm font-bold text-nebula-pink italic">{ram >= 1024 ? `${ram/1024} GB` : `${ram} MB`}</span>
                  </div>
                  <input
                    type="range"
                    min={128} max={8192} step={128}
                    value={ram}
                    onChange={(e) => setRam(Number(e.target.value))}
                    className="w-full h-1.5 appearance-none rounded-lg bg-nebula-black border border-white/5 cursor-pointer accent-nebula-pink"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-[10px] font-black uppercase tracking-wider text-rose-400">
                  <AlertTriangle className="h-3 w-3 inline mr-2" />
                  {error}
                </div>
              )}

              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="btn-primary w-full shadow-2xl py-4 !bg-gradient-to-br from-nebula-pink to-nebula-purple"
              >
                {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                  {isDeploying ? "Submitting Payload" : "Execute Batch Task"}
                </span>
              </button>
            </div>
           </>
        ) : (
           <div className="flex flex-col h-full gap-4">
             <div className="flex items-center justify-between rounded-xl border border-white/5 bg-nebula-maroon/20 p-4">
               <div className="flex items-center gap-3">
                 <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-white/10 ${
                   jobStatus === "COMPLETED" ? "bg-nebula-pink/20 text-nebula-pink" : "bg-nebula-purple/20 text-nebula-pink animate-pulse"
                 }`}>
                   {jobStatus === "COMPLETED" ? <CheckCircle className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                   {jobStatus}
                 </div>
                 <span className="text-[10px] font-mono font-bold text-zinc-500">{jobId.slice(0, 16)}...</span>
               </div>

                {jobStatus === "COMPLETED" && (
                  <button 
                    onClick={downloadOutput}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-nebula-pink text-white shadow-lg transition-all hover:scale-105"
                    title="Download Output"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
             </div>
             
             <div className="flex-1 min-h-0 basis-0 rounded-xl overflow-hidden border border-white/5 shadow-2xl flex flex-col bg-nebula-black">
               <div className="flex items-center gap-2 border-b border-white/5 bg-nebula-maroon/10 px-4 py-3">
                 <Terminal className="h-4 w-4 text-nebula-pink" />
                 <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">Live Logs</span>
                 <div className="ml-auto flex items-center gap-2">
                   {jobStatus !== "COMPLETED" && jobStatus !== "FAILED" && (
                     <div className="flex items-center gap-2">
                       <span className="h-1.5 w-1.5 rounded-full bg-nebula-pink animate-glow-pink" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-nebula-pink opacity-80 italic">Recording logs...</span>
                     </div>
                   )}
                 </div>
               </div>
               <div
                 ref={logContainerRef}
                 className="flex-1 overflow-y-auto p-4 font-mono text-[11px] custom-scrollbar bg-[#1A1A1D]/80"
               >
                 {visibleLogs.length === 0 ? (
                   <div className="flex items-center gap-3 text-gray-700 italic">
                     <Loader2 className="h-4 w-4 animate-spin" />
                     Waiting for infrastructure handshake...
                   </div>
                 ) : (
                   visibleLogs.map((log, i) => (
                     <div
                       key={i}
                       className="whitespace-pre-wrap py-0.5 px-3 border-l border-transparent hover:border-nebula-pink/30 hover:bg-nebula-pink/5 transition-colors text-zinc-400 font-medium"
                     >
                       <span className="text-nebula-pink/30 mr-2 opacity-50 select-none">{(i+1).toString().padStart(3, '0')}</span>
                       {log}
                     </div>
                   ))
                 )}
                 <div className="mt-2 pl-3">
                   <span className="inline-block h-3 w-1.5 animate-pulse bg-nebula-pink/50" />
                 </div>
               </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
