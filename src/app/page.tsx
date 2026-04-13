import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, 
  Box, 
  Cpu, 
  ArrowRight,
  Globe,
} from "lucide-react";

export default async function LandingPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const supabase = await createClient();

  // Handle OAuth code if it lands here
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect("/dashboard");
    }
  }

  const { data: { session } } = await supabase.auth.getSession();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 flex flex-col font-sans">
      {/* Subtle Top Border/Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-50" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-zinc-900 bg-black/70">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo2.png" 
              alt="Brain & Muscle Logo" 
              width={80} 
              height={40}
              className="brightness-90 hover:brightness-100 transition-all"
            />
            <span className="text-[15px] font-black uppercase tracking-widest text-white">
              Brain <span className="text-zinc-500 font-bold">X</span> Muscle
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-10 text-[12px] font-black uppercase tracking-widest">
            <Link href="#features" className="text-zinc-500 hover:text-white transition-colors">Infrastructure</Link>
            <Link href="/docs" className="text-zinc-500 hover:text-white transition-colors">Documentation</Link>
            {session ? (
              <Link 
                href="/dashboard"
                className="px-4 py-1.5 rounded-full border border-white text-white hover:bg-white hover:text-black transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-8">
                <Link href="/login" className="text-zinc-500 hover:text-white transition-colors">Sign In</Link>
                <Link 
                  href="/setup" 
                  className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all whitespace-nowrap"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow relative">
        {/* Background Nebula Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-nebula-pink/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-nebula-purple/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

        {/* Hero Section */}
        <section className="pt-32 pb-40 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-black uppercase tracking-[0.2em] mb-12 animate-in fade-in slide-in-from-bottom-2">
               <span className="h-2 w-2 rounded-full bg-nebula-pink shadow-[0_0_8px_rgba(166,77,121,0.6)]" />
               Distributed Computing Reimagined
            </div>
            
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter mb-10 leading-[1.0] animate-in fade-in slide-in-from-bottom-4 duration-1000">
               UNLEASH THE <br/>
               <span className="text-brand-gradient whitespace-nowrap">POWER OF THE CLUSTER</span>
            </h1>
            
            <p className="max-w-3xl mx-auto text-[14px] md:text-[16px] text-zinc-500 leading-relaxed mb-14 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 uppercase tracking-[0.3em] font-bold">
               Orchestrate distributed AI workloads and heavy compute tasks across a 
               secure, headless network of worker nodes. Built for speed, scale, and security.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <Link 
                href={session ? "/dashboard" : "/setup"} 
                className="w-full sm:w-auto px-10 py-4 rounded-lg btn-primary font-black text-[13px] uppercase tracking-widest transition-all flex items-center justify-center gap-4 shadow-2xl"
              >
                {session ? "Enter Control Center" : "Initialize Protocol"}
                <ArrowRight className="w-5 h-5 text-white/80" />
              </Link>
              <Link 
                href="/docs" 
                className="w-full sm:w-auto px-10 py-4 rounded-lg bg-black border border-zinc-800 text-white font-black text-[13px] uppercase tracking-widest hover:border-zinc-600 hover:bg-zinc-900 transition-all flex items-center justify-center gap-4"
              >
                Documentation
              </Link>
            </div>
          </div>
        </section>

        {/* Bento Capabilities Grid */}
        <section id="features" className="py-32 px-6 border-t border-zinc-900 bg-zinc-950/20">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center mb-24 text-center">
               <h2 className="text-[13px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-6">Capabilities</h2>
               <p className="text-3xl font-black tracking-tight text-white uppercase">Designed for Production Integrity</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Feature 1 */}
              <div className="group relative p-10 rounded-2xl bg-black border border-zinc-900 hover:border-zinc-700 transition-all duration-500 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-10 group-hover:scale-110 transition-all">
                  <ShieldCheck className="w-5 h-5 text-zinc-100" />
                </div>
                <h3 className="text-[13px] font-black mb-4 uppercase tracking-[0.2em] text-white">Encrypted Tunneling</h3>
                <p className="text-[14px] text-zinc-500 leading-relaxed font-bold tracking-tight">
                  Private Tailscale-powered backplane ensures every muscle node is invisible to the public internet.
                </p>
                {/* Subtle Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Feature 2 */}
              <div className="group relative p-10 rounded-2xl bg-black border border-zinc-900 hover:border-zinc-700 transition-all duration-500 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-10 group-hover:scale-110 transition-all">
                  <Box className="w-5 h-5 text-zinc-100" />
                </div>
                <h3 className="text-[13px] font-black mb-4 uppercase tracking-[0.2em] text-white">Docker Reciprocity</h3>
                <p className="text-[14px] text-zinc-500 leading-relaxed font-bold tracking-tight">
                  Lightweight rkt/Docker runtimes allow for perfect isolation of heavy compute workloads.
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Feature 3 */}
              <div className="group relative p-10 rounded-2xl bg-black border border-zinc-900 hover:border-zinc-700 transition-all duration-500 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-10 group-hover:scale-110 transition-all">
                  <Cpu className="w-5 h-5 text-zinc-100" />
                </div>
                <h3 className="text-[13px] font-black mb-4 uppercase tracking-[0.2em] text-white">Muscle Fleet</h3>
                <p className="text-[14px] text-zinc-500 leading-relaxed font-bold tracking-tight">
                  Background services for POSIX and NT systems. Zero-config worker deployment.
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Industrial Footer */}
      <footer className="py-20 px-6 border-t border-zinc-900 bg-black mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3 opacity-40 grayscale">
              <Image src="/logo2.png" alt="Brain & Muscle" width={60} height={30} />
              <span className="text-[12px] font-black uppercase tracking-[0.3em] text-white">Brain Protocol</span>
          </div>
          <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest leading-loose text-center md:text-left">
            © 2026 Brain & Muscle Foundation. <br/> Integrated Distributed Systems. All rights reserved.
          </p>
          <div className="flex gap-10 text-[11px] font-black uppercase tracking-widest text-zinc-500">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Security</Link>
            <Link href="https://github.com/akashtripathi12/brain-and-muscle" className="hover:text-white transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

