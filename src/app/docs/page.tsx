"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  FileText,
  ArrowRight,
  BookOpen,
  Home,
  Check
} from "lucide-react";
import Link from "next/link";

const CodeSnippet = ({ language, code }: { language: string, code: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-[#0f1117] rounded-xl border border-white/10 overflow-hidden my-6 font-mono text-sm shadow-xl">
       <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black leading-none">{language}</span>
          <button 
             onClick={() => {
                navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
             }}
             className="text-[10px] text-zinc-400 hover:text-white uppercase tracking-widest font-bold flex items-center gap-1 transition-colors"
          >
             {copied ? <><Check className="w-3 h-3 text-green-400"/> <span className="text-green-400">Copied</span></> : "Copy"}
          </button>
       </div>
       <div className="p-5 overflow-x-auto custom-scrollbar">
          <pre className="text-zinc-300 leading-relaxed font-mono">
             <code>{code}</code>
          </pre>
       </div>
    </div>
  );
};

export default function DocumentationPage() {
  const [activeHash, setActiveHash] = useState("architecture");

  // A simple list for the robust TOC
  const TOC = [
    { id: "architecture", label: "1. System Architecture" },
    { id: "operating", label: "2. Operating the Muscle" },
    { id: "lifecycle", label: "3. Execution Lifecycle" },
    { id: "paradigms", label: "4. Execution Paradigms" },
    { id: "security", label: "5. Security & Auth" },
    { id: "tutorial", label: "6. Execution Tutorial" },
    { id: "cleanup", label: "7. Storage Maintenance" },
    { id: "manifests", label: "8. Task Manifests" },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveHash(id);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHash(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: "-100px 0px -40% 0px" }
    );

    TOC.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto text-white p-6 relative">
      <div className="flex flex-col lg:flex-row gap-16 lg:px-8">
        
        {/* Sidebar TOC */}
        <aside className="lg:w-64 flex-shrink-0 hidden lg:block sticky top-32 h-fit space-y-8">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 px-3">Contents</h3>
            {TOC.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300
                  ${activeHash === s.id 
                    ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-md" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] border border-transparent"}
                `}
              >
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl space-y-20 pb-32">
          
          <header className="space-y-6 pt-10 border-b border-white/5 pb-12">
            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-zinc-500">
               <Link href="/" className="hover:text-white flex items-center gap-2"><Home className="w-3.5 h-3.5"/> Home</Link>
               <span>/</span>
               <span className="text-brand-primary inline-flex items-center gap-2"><BookOpen className="w-3.5 h-3.5"/> Documentation</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">Brain & Muscle <br/><span className="text-brand-primary">Engineering Spec</span></h1>
            <p className="text-xl text-zinc-400 leading-relaxed font-medium mt-4 max-w-2xl">
              Official engineering documentation for the Brain & Muscle distributed task orchestration platform, targeting backend engineers and system administrators.
            </p>
          </header>

          <div className="space-y-24">
            {/* 1. Architecture */}
            <section id="architecture" className="space-y-6 scroll-mt-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h2 className="text-3xl font-black tracking-tight text-white border-b border-white/5 pb-4">1. System Architecture</h2>
              <p className="text-zinc-300 text-lg leading-relaxed">
                Brain & Muscle is a distributed task orchestration platform designed for high-concurrency workloads. The system enforces a strict decoupling between the Control Plane (the Brain) and the Data Plane (the Muscle fleet).
              </p>
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">The Brain (Control Plane)</h3>
                <p className="text-zinc-400 leading-relaxed">
                  The Brain orchestrates state transitions, schedules jobs, and proxies external requests. It is a Go-based application that utilizes the Raft consensus algorithm to replicate state across a highly-available cluster. All system communication occurs purely via precise TCP protocols. <br/><br/>
                  To guarantee fault tolerance, the Brain implements strict <strong>Write-Ahead Logging (WAL)</strong> alongside Raft. In the event of a catastrophic node failure, the Brain instantly reconstructs its exact state by replaying the WAL from the last committed index during the boot sequence. It handles GitHub App authentication, dynamically injects webhooks, queues tasks, and exposes a Next.js administrative dashboard.
                </p>
                <h3 className="text-xl font-bold text-white mt-8">The Muscle (Data Plane)</h3>
                <p className="text-zinc-400 leading-relaxed">
                  The Muscle is a Go-based worker node operating as a strictly stateless execution environment. Muscles connect to the Brain via persistent outbound TCP connections (typically port 9000). Upon assignment, a Muscle executes the assigned payload inside isolated Docker containers. <br/><br/>
                  <span className="italic text-zinc-500 border-l-2 border-zinc-700 pl-4 block my-2 py-1">Note: The first time a Muscle executes a specific runtime task (such as Go, C++, JS, or Python), it must download the official base image from the registry, which entails a slight initial performance delay.</span>
                  Afterward, it mounts secure volumes, executes the code, and uses temporary SAS tokens to stream logs and results back to the designated cloud storage.
                </p>
              </div>
            </section>

            {/* 2. Operating the Muscle */}
            <section id="operating" className="space-y-6 scroll-mt-32">
              <h2 className="text-3xl font-black tracking-tight text-white border-b border-white/5 pb-4">2. Operating the Muscle</h2>
              <p className="text-zinc-300 text-lg leading-relaxed">
                Muscle nodes are designed to run persistently in the background. They support two primary paradigms modes of execution.
              </p>
              
              <div className="bg-brand-primary/10 border border-brand-primary/30 p-6 rounded-2xl my-8">
                 <h4 className="text-brand-primary font-black uppercase text-xs tracking-widest flex items-center gap-2 mb-3"><ShieldCheck className="w-4 h-4"/> Network Prerequisites</h4>
                 <p className="text-brand-primary/80 font-medium leading-relaxed">
                   The Muscle node operates strictly via outbound TCP on port <code className="bg-black/50 px-2 py-0.5 rounded text-white border border-brand-primary/20">9000</code>. Ensure that the host network (including Virtual Machine Network Security Groups) permits outbound traffic on this port. Note that standard ICMP (ping) traffic to the Brain is not required.
                 </p>
              </div>

              <div className="space-y-12">
                <div>
                   <h3 className="text-2xl font-bold text-white mb-2">Foreground Mode</h3>
                   <p className="text-zinc-400 leading-relaxed mb-6">
                     Foreground execution runs the binary directly in the active terminal session. This mode is exclusively used for local development, debugging, and temporary executions. Logs are streamed directly to <code>stdout</code>.
                   </p>
                   
                   <p className="text-zinc-300 text-sm font-bold mb-2">Linux / Ubuntu</p>
                   <CodeSnippet language="bash" code={`chmod +x muscle-linux\n./muscle-linux --cpu 4.0 --ram 4096`} />
                   
                   <p className="text-zinc-300 text-sm font-bold mb-2 mt-6">macOS (Apple Silicon)</p>
                   <CodeSnippet language="bash" code={`chmod +x muscle-macos-arm64\n./muscle-macos-arm64 --cpu 4.0 --ram 4096`} />
                   
                   <p className="text-zinc-300 text-sm font-bold mb-2 mt-6">Windows</p>
                   <CodeSnippet language="powershell" code={`.\\bam-muscle.exe --cpu 4.0 --ram 4096`} />
                </div>

                <div>
                   <h3 className="text-2xl font-bold text-white mb-2">Daemon Mode</h3>
                   <p className="text-zinc-400 leading-relaxed mb-6">
                     For production workloads, Muscle must execute as a background process completely isolated from active user sessions.
                   </p>
                   
                   <h4 className="text-lg font-bold text-white mb-2">Linux (systemd)</h4>
                   <p className="text-zinc-400 mb-4 text-sm">Create a unit file <code>/etc/systemd/system/bam-muscle.service</code>, then execute <code>systemctl enable --now bam-muscle.service</code>.</p>
                   <CodeSnippet language="ini" code={`[Unit]\nDescription=Brain & Muscle Worker Node\nAfter=network.target docker.service\n\n[Service]\nExecStart=/usr/local/bin/muscle-linux --cpu 4.0 --ram 4096\nRestart=always\nUser=muscleuser\n\n[Install]\nWantedBy=multi-user.target`} />

                   <h4 className="text-lg font-bold text-white mt-12 mb-2">macOS (launchd)</h4>
                   <p className="text-zinc-400 mb-4 text-sm">Create a <code>.plist</code> file in <code>/Library/LaunchDaemons/com.bam.muscle.plist</code>. Execute <code>sudo launchctl load -w /Library/LaunchDaemons/com.bam.muscle.plist</code>.</p>
                   <CodeSnippet language="xml" code={`<?xml version="1.0" encoding="UTF-8"?>\n<plist version="1.0">\n<dict>\n    <key>Label</key>\n    <string>com.bam.muscle</string>\n    <key>ProgramArguments</key>\n    <array>\n        <string>/usr/local/bin/muscle-macos-arm64</string>\n        <string>--cpu</string>\n        <string>4.0</string>\n    </array>\n    <key>KeepAlive</key>\n    <true/>\n</dict>\n</plist>`} />

                   <h4 className="text-lg font-bold text-white mt-12 mb-2">Windows (Windows Services / Session 0)</h4>
                   <p className="text-zinc-400 mb-4 text-sm">It installs itself natively as a Windows Service running in Session 0, ensuring complete isolation from interactive user sessions.</p>
                   <CodeSnippet language="powershell" code={`# Install the binary as a background service (auto-starts instantly)\n.\\bam-muscle.exe --service install --cpu 4.0 --ram 4096`} />
                </div>
              </div>
            </section>

            {/* 3. Lifecycle */}
            <section id="lifecycle" className="space-y-6 scroll-mt-32">
              <h2 className="text-3xl font-black tracking-tight text-white border-b border-white/5 pb-4">3. The Execution Lifecycle (GATHER & RUN)</h2>
              <p className="text-zinc-300 text-lg leading-relaxed">
                The Data Plane employs a "Thin Host" strategy. Execution occurs in a locked-down Docker runtime (GCC, Go, Python, or Node.js) across a strict three-phase lifecycle:
              </p>
              <div className="space-y-6 mt-6">
                 <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                   <h3 className="text-white text-xl font-bold mb-2">Phase 1: GATHER</h3>
                   <p className="text-zinc-400 leading-relaxed">The Muscle validates the assigned task payload. It securely fetches Azure SAS tokens for artifact storage, clones the requisite code shards across branches, and executes any specified pre-flight operations dictated by <code>gather_script_path</code>.</p>
                 </div>
                 <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                   <h3 className="text-white text-xl font-bold mb-2">Phase 2: RUN</h3>
                   <p className="text-zinc-400 leading-relaxed">The Muscle mounts the fetched code and datasets into the running container as isolated volumes. The core engine executes the designated <code>user_script_path</code>. Upon termination, the Muscle captures streams, synchronizes the final output directly to the cloud storage provider via the SAS token, and reports a terminal status back to the Brain.</p>
                 </div>
                 <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 border-l-4 border-l-brand-primary">
                   <h3 className="text-white text-xl font-bold mb-2">Phase 3: TEARDOWN</h3>
                   <p className="text-zinc-400 leading-relaxed">To maintain strict statelessness and prevent host disk saturation, the Muscle forcefully destroys the isolated container and aggressively wipes all cloned repositories, temporary volumes, and local artifacts immediately after the SAS upload transaction completes.</p>
                 </div>
              </div>
            </section>

            {/* 4. Paradigms */}
            <section id="paradigms" className="space-y-6 scroll-mt-32">
              <h2 className="text-3xl font-black tracking-tight text-white border-b border-white/5 pb-4">4. Execution Paradigms</h2>
              <div className="space-y-10 text-zinc-400">
                 <div>
                   <h3 className="text-xl font-bold text-white mb-2">Map-Reduce Orchestration</h3>
                   <p className="leading-relaxed">Instead of complex DAGs (Directed Acyclic Graphs), Map-Reduce workloads are managed using a strict chunk index counter system. The Brain splits large processing tasks across the cluster, deploying independent <code>MAP</code> tasks linked by atomic slice indices. Once all chunk counters reach terminal success, the Brain natively executes the <code>REDUCE</code> phase logic to aggregate the distributed outputs securely.</p>
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-white mb-2">Services (Reverse Proxying)</h3>
                   <p className="leading-relaxed">Long-running web applications (APIs, Dashboards) are operated as Services. The Brain binds the executing code directly inside a continuously running Docker container (your configured codespace) and manages a native reverse proxy tunnel. This securely routes external HTTP requests directly to the bound port explicitly exposed by the Muscle executing the container.</p>
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-white mb-2">Distributed ML Training (Parameter Server)</h3>
                   <p className="leading-relaxed">For distributed machine learning training sequences, the platform utilizes a Parameter Server (PS) topology. Compute nodes pull neural network weights from the PS, calculate gradients locally against specific dataset shards, and push the gradients back. The Brain enforces a strict staleness bound (typically a staleness threshold of 2-3 batches) to balance rapid asynchronous mathematical computations against overall model convergence stability.</p>
                 </div>
              </div>
            </section>

            {/* 5. Security */}
            <section id="security" className="space-y-6 scroll-mt-32">
              <h2 className="text-3xl font-black tracking-tight text-white border-b border-white/5 pb-4">5. Security & Authentication (The GitHub App Model)</h2>
              <p className="text-zinc-300 text-lg leading-relaxed">
                The Brain circumvents the limitations of standard OAuth proxies by operating as a fully native GitHub App.
              </p>
              <ol className="list-decimal pl-6 space-y-4 text-zinc-400">
                 <li>The Brain generates a signed cryptographic JWT using its private key.</li>
                 <li>It exchanges the JWT with GitHub for an ephemeral <strong>Installation Access Token</strong>.</li>
                 <li>With this token, the Brain acts as an independent robot service account to securely drill into and clone private repositories.</li>
                 <li>It dynamically injects webhook endpoints into the source so that pushes automatically notify the Brain to dispatch pipeline updates to the surrounding Muscle fleet.</li>
              </ol>
            </section>

            {/* 6. Tutorial */}
            <section id="tutorial" className="space-y-6 scroll-mt-32">
              <h2 className="text-3xl font-black tracking-tight text-white border-b border-white/5 pb-4">6. Execution Tutorial: Batch vs Distributed</h2>
              <p className="text-zinc-300 text-lg leading-relaxed mb-6">Execute your workloads via the Next.js visual dashboard command center.</p>
              
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-4">Batch Task (Single Node)</h3>
                    <ol className="list-decimal pl-5 space-y-4 text-zinc-400">
                       <li>Navigate to the <strong>Deploy Batch</strong> page.</li>
                       <li>Select your isolated coding runtime (e.g., Python <code>3.11</code>). Verify your logic accepts streams.</li>
                       <li>Configure your core allocation limit utilizing the sliders (e.g., <code>2.5</code> vCores).</li>
                       <li>Launch. The Brain routes this task to a single capable Muscle which natively provisions the environment.</li>
                    </ol>
                 </div>
                 <div className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-4">Distributed Task (Multi-Node)</h3>
                    <ol className="list-decimal pl-5 space-y-4 text-zinc-400">
                       <li>Navigate to the <strong>Distributed Workloads</strong> section.</li>
                       <li>Enter the number of necessary worker shards for your core processing objective.</li>
                       <li>Specify your Azure storage <code>DATASET_PATH</code> and target your application map <code>scripts/mapper.py</code>.</li>
                       <li>Deploy the pipeline. The Brain mathematically shards the target job and disperses concurrent segments tightly across multiple Muscle nodes.</li>
                    </ol>
                 </div>
              </div>
            </section>

            {/* 7. Cleanup */}
            <section id="cleanup" className="space-y-6 scroll-mt-32">
              <h2 className="text-3xl font-black tracking-tight text-white border-b border-white/5 pb-4">7. Storage Maintenance (Cleanup)</h2>
              <p className="text-zinc-300 text-lg leading-relaxed">
                To ensure high availability across long-term sustained cluster lifetimes, hosts operating long-living Muscle nodes must strictly undergo routine preventative maintenance sequences.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                While Phase 3 TEARDOWN actively manages atomic task artifacts, residual images, log volumes, and abandoned processes will accumulate over months. It is imperative that system administrators schedule crontab / TaskScheduler sweeps enforcing system cleanups. You must periodically erase storage within:
              </p>
              <ul className="list-disc pl-6 py-2 space-y-3 text-zinc-400 font-mono text-sm">
                 <li><span className="font-bold text-white font-sans mr-2 text-base">Windows:</span> C:\ProgramData\BrainAndMuscle\tmp</li>
                 <li><span className="font-bold text-white font-sans mr-2 text-base">Linux & macOS:</span> /tmp/BrainAndMuscle</li>
              </ul>
              <p className="text-zinc-400 leading-relaxed mt-4">
                Furthermore, ensure active system pruning is utilized via Cron (e.g. <code>docker system prune -af --volumes</code>) to eliminate isolated ghost container layers abandoned over months of heavy data-plane operations.
              </p>
            </section>

            {/* 8. Manifests */}
            <section id="manifests" className="space-y-6 scroll-mt-32">
              <h2 className="text-3xl font-black tracking-tight text-white border-b border-white/5 pb-4">8. Task Manifests</h2>
              <p className="text-zinc-300 text-lg leading-relaxed">
                The Brain synthesizes your user dashboard requests into atomic JSON payloads. Muscles consume these raw manifests over the TCP control channel to allocate resources strictly overriding and enforcing <code>required_cpu</code> constraints and bootstrapping the GATHER and RUN workflows.
              </p>
              <CodeSnippet language="json" code={`{
  "job_id": "d256f75a-01a3-461b-8ab1-b2ad06b5e64c",
  "job_type": "MAP",
  "source_type": "github",
  "git_repo": "https://github.com/organization/data-pipeline.git",
  "branch_name": "main",
  "commit_hash": "a4d3f2c98e1b",
  "gather_script_path": "scripts/setup_environment.sh",
  "user_script_path": "src/process_shard.py",
  "run_command": "python3",
  "required_cpu": 4.0,
  "required_ram": 4096,
  "env": {
    "DATASET_PATH": "https://bucket.azure.com/data/shard_42.csv",
    "REPORT_DIR": "/app/reports/output"
  },
  "upload_url": "https://bamstorage.blob.core.windows.net/logs/d256f...?sig=..."
}`} />
            </section>
            
          </div>

          {/* Footer Call to Action */}
          <div className="p-12 rounded-3xl bg-brand-primary/5 border border-brand-primary/10 text-center space-y-6 mt-24">
             <FileText className="w-12 h-12 text-brand-primary mx-auto opacity-50" />
             <h3 className="text-2xl font-black">Need further assistance?</h3>
             <p className="text-zinc-400 max-w-md mx-auto">Explore the source code or report an anomaly directly to the terminal core.</p>
             <button 
                onClick={() => window.dispatchEvent(new CustomEvent("bam:open-support"))}
                className="btn-primary px-8 py-3 mx-auto mt-4"
             >
               Launch Support Probe <ArrowRight className="w-4 h-4 ml-2 inline" />
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
