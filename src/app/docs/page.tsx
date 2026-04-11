"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  Cpu, 
  Box, 
  Globe, 
  CheckCircle2, 
  Server, 
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Search,
  ChevronRight,
  FileText,
  Workflow,
  Microchip,
  LayoutDashboard
} from "lucide-react";

const SECTIONS = [
  {
    id: "architecture",
    title: "System Architecture",
    icon: Workflow,
    content: `
      The Brain & Muscle platform is a distributed task orchestration engine designed for high-concurrency and secure processing. 
      It follows a decoupled Control Plane and Data Plane architecture.
    `,
    details: [
      {
        sub: "The Brain (Control Plane)",
        text: "The central nervous system of the cluster. It manages authentication (Supabase), task scheduling, and state reconciliation. It communicates with Muscles via secure gRPC/HTTP tunnels."
      },
      {
        sub: "The Muscle (Data Plane)",
        text: "Lightweight, headless workers that execute in 'Session 0'. They are responsible for pulling Docker images, managing container lifecycles, and streaming logs back to the Brain."
      }
    ]
  },
  {
    id: "overview",
    title: "Overview & Monitoring",
    icon: LayoutDashboard,
    content: "The main Command Center provides real-time visibility into your global infrastructure.",
    details: [
      {
        sub: "Fleet Metrics",
        text: "Visualizes the number of active, idling, and offline worker nodes across your network."
      },
      {
        sub: "Job Stream",
        text: "A live feed of the most recent system activity, including deployment triggers and task completion statuses."
      }
    ]
  },
  {
    id: "services",
    title: "Services (Deployments)",
    icon: Zap,
    content: "Long-running applications are managed as 'Services'. This section enables continuous delivery with minimal downtime.",
    details: [
      {
        sub: "GATHER & REDUCE",
        text: "Updates happen in-place. The GATHER phase prepares the new environment, while REDUCE gracefully replaces the old container with the new version."
      },
      {
        sub: "State Persistence",
        text: "Services can be linked to persistent volumes, ensuring data survives across container updates."
      }
    ]
  },
  {
    id: "batch",
    title: "Batch Processing",
    icon: CheckCircle2,
    content: "Designed for intensive data processing at scale using the Map-Reduce paradigm.",
    details: [
      {
        sub: "Claim Check Pattern",
        text: "Large task results are uploaded directly to Azure Blob Storage using temporary SAS tokens, preventing the Brain from becoming a bandwidth bottleneck."
      },
      {
        sub: "Massive Parallelism",
        text: "Split a single job into thousands of sub-tasks that run concurrently across the entire Muscle fleet."
      }
    ]
  },
  {
    id: "fleet",
    title: "Muscle Fleet",
    icon: Server,
    content: "The raw compute power of the cluster is managed here.",
    details: [
      {
        sub: "Identity Management",
        text: "Each worker node is identified by a unique ID and is authenticated via secure tokens."
      },
      {
        sub: "Portable Mode",
        text: "Muscle can run as a standalone binary without installation. Ideal for temporary tasks or restricted environments where system service permissions are unavailable."
      },
      {
        sub: "Auto-Discovery",
        text: "Once a 'bam-muscle.exe' is launched, it automatically registers with the Brain and appears in the fleet control panel."
      }
    ]
  },
  {
    id: "runtimes",
    title: "Runtime Strategy",
    icon: Box,
    content: "Our distributed processing engine utilizes a 'Thin Host' strategy where Muscle nodes require zero language-specific dependencies.",
    details: [
      {
        sub: "The 4 Core Images",
        text: "Tasks are virtualized inside one of four official Bam runtimes: GCC (C/C++), Golang, Python, or Node.js. This ensures identical execution environments across the entire global fleet."
      },
      {
        sub: "Service Optionality",
        text: "Muscle workers can run as a Windows Service in 'Session 0' for always-on stealth processing, or as a foreground process for debugging and portable use-cases."
      }
    ]
  },
  {
    id: "patterns",
    title: "GATHER & RUN Pattern",
    icon: Workflow,
    content: "Task execution follows a two-phase lifecycle to ensure all resources are available before the logic begins.",
    details: [
      {
        sub: "Phase 1: GATHER",
        text: "The system identifies and 'gathers' required resources—pulling Docker images, fetching SAS tokens for Azure storage, or running a pre-flight script via 'gather_script_path'."
      },
      {
        sub: "Phase 2: RUN",
        text: "Once the environment is primed, the main business logic is executed using 'user_script_path'. This ensures reliable execution even for complex, data-heavy workloads."
      }
    ]
  },
  {
    id: "manifest",
    title: "Task Manifest Template",
    icon: FileText,
    content: "All requests to the Control Plane (Brain) follow a standardized manifest structure.",
    details: [
      {
        sub: "Resource Overrides",
        text: "Specify custom CPU and RAM limits in the manifest or via binary flags. Default allocation is 2.0 CPU and 2048 MB RAM."
      },
      {
        sub: "Example Structure",
        text: "{\n  \"job_type\": \"python\",\n  \"gather_script_path\": \"setup.py\",\n  \"user_script_path\": \"main.py\",\n  \"required_cpu\": 2.0,\n  \"required_ram\": 2048\n}"
      }
    ]
  }
];

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("architecture");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = SECTIONS.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto text-white">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar TOC */}
        <aside className="lg:w-72 hidden lg:block sticky top-32 h-fit space-y-8">
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600 mb-6">Table of Contents</h3>
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300
                  ${activeSection === section.id 
                    ? "bg-white/[0.05] text-white border border-white/10 shadow-lg" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"}
                `}
              >
                <section.icon className={`w-4 h-4 ${activeSection === section.id ? "text-nebula-pink" : ""}`} />
                {section.title}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">
            <div className="flex items-center gap-2 text-brand-primary mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] uppercase font-black tracking-widest">Protocol Active</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
              All documentation is synchronized with the latest Control Plane v1.2 revision.
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-24 pb-32">
          
          {/* Hero Header */}
          <header className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nebula-pink/10 border border-nebula-pink/20 text-nebula-pink text-[10px] font-black uppercase tracking-widest">
              <BookOpen className="w-3 h-3" />
              Intelligence Core
            </div>
            <h1 className="text-6xl font-black tracking-tighter leading-none">
              Control Plane <span className="text-gradient">Manual</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
              Thorough documentation for the Brain & Muscle distributed infrastructure. 
              Understand how to orchestrate, scale, and secure your fleet.
            </p>

            <div className="relative max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search procedures..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all"
              />
            </div>
          </header>

          {/* Sections */}
          <div className="space-y-32">
            {filteredSections.map((section) => (
              <section 
                key={section.id} 
                id={section.id} 
                className="scroll-mt-32 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(166,77,121,0.15)]">
                      <section.icon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight">{section.title}</h2>
                  </div>
                  <p className="text-2xl text-zinc-300 leading-relaxed font-medium">
                    {section.content}
                  </p>
                </div>

                {/* Technical Diagram Fallback (Beautiful CSS/SVG) */}
                {section.id === "architecture" && (
                   <div className="p-8 rounded-[2rem] bg-black/40 border border-white/5 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-nebula-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 py-8 px-4">
                        <div className="w-48 p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-3">
                           <Zap className="w-8 h-8 text-brand-primary mx-auto" />
                           <div className="text-xs font-black uppercase tracking-widest">Brain</div>
                           <div className="text-[10px] text-zinc-500 font-bold uppercase italic">Control Plane</div>
                        </div>
                        <div className="flex flex-col items-center">
                           <div className="h-0.5 w-16 bg-gradient-to-r from-brand-primary to-nebula-blue mb-1" />
                           <span className="text-[8px] uppercase font-black tracking-widest text-zinc-600">Secure Tunnel</span>
                        </div>
                        <div className="w-48 p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-3">
                           <Cpu className="w-8 h-8 text-nebula-blue mx-auto" />
                           <div className="text-xs font-black uppercase tracking-widest">Muscle</div>
                           <div className="text-[10px] text-zinc-500 font-bold uppercase italic">Data Plane</div>
                        </div>
                      </div>
                      <div className="text-center pb-4 text-[10px] uppercase font-black tracking-widest text-zinc-500">System Information Flow Diagram</div>
                   </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                  {section.details.map((detail, idx) => (
                    <div key={idx} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group">
                       <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                         <ChevronRight className="w-4 h-4 text-brand-primary group-hover:translate-x-1 transition-transform" />
                         {detail.sub}
                       </h4>
                       <p className="text-zinc-400 leading-relaxed text-lg font-medium">
                         {detail.text}
                       </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Footer Call to Action */}
          <div className="p-12 rounded-[3rem] bg-gradient-to-br from-brand-primary/10 to-nebula-purple/5 border border-brand-primary/20 text-center space-y-8 relative overflow-hidden">
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/10 blur-[100px] rounded-full" />
             <FileText className="w-16 h-16 text-brand-primary mx-auto mb-6 opacity-50" />
             <h3 className="text-4xl font-black tracking-tight">Need further assistance?</h3>
             <p className="text-xl text-zinc-400 max-w-xl mx-auto font-medium">
               Explore the source code or report an anomaly directly to the terminal core.
             </p>
             <button 
                onClick={() => window.dispatchEvent(new CustomEvent("bam:open-support"))}
                className="btn-primary px-12 py-5 gap-3 mx-auto text-lg"
             >
               Launch Support Probe
               <ArrowRight className="w-5 h-5" />
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
