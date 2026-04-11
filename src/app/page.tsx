import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  Box, 
  Cpu, 
  Zap, 
  ArrowRight,
  Globe,
  Lock,
  ZapOff
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
    <div className="min-h-screen bg-nebula-black text-white selection:bg-nebula-pink/30 flex flex-col font-sans">
      {/* Background Gradients */}
      <div className="fixed top-0 -left-1/4 w-1/2 h-1/2 bg-nebula-purple/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 -right-1/4 w-1/2 h-1/2 bg-nebula-pink/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 bg-nebula-black/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
              <Zap className="w-6 h-6 text-brand-primary shadow-[0_0_15px_rgba(235,0,255,0.4)]" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Brain & Muscle
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <Link href="#features" className="hover:text-brand-primary transition-colors">Features</Link>
            <Link href="/docs" className="hover:text-brand-primary transition-colors">Documentation</Link>
            {session ? (
              <Link 
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-semibold text-white"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="hover:text-white transition-colors">Login</Link>
                <Link 
                  href="/setup" 
                  className="px-5 py-2.5 rounded-xl bg-brand-primary text-nebula-black hover:scale-105 active:scale-95 transition-all font-bold shadow-[0_0_20px_rgba(235,0,255,0.3)]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-secondary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Globe className="w-4 h-4" />
              <span>Distributed Computing Reimagined</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 italic">
              UNLEASH THE<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-nebula-purple to-brand-secondary">
                POWER OF THE CLUSTER
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/50 leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Orchestrate distributed AI workloads and heavy compute tasks across a secure, 
              headless network of worker nodes. Built for speed, scale, and security.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link 
                href="/setup" 
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-brand-primary text-nebula-black font-black text-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(235,0,255,0.2)]"
              >
                START ONBOARDING
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link 
                href="/docs" 
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                READ THE DOCS
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-16 text-center tracking-tight uppercase">Platform Capabilities</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-primary/50 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-nebula-purple/20 flex items-center justify-center mb-6 border border-nebula-purple/30 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7 text-nebula-purple" />
                </div>
                <h3 className="text-xl font-bold mb-4">Secure Tunneling</h3>
                <p className="text-white/50 leading-relaxed">
                  Every node connects via a private, encrypted Tailscale network, ensuring your data never hits the public internet.
                </p>
              </div>

              <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-pink/50 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-brand-pink/20 flex items-center justify-center mb-6 border border-brand-pink/30 group-hover:scale-110 transition-transform">
                  <Box className="w-7 h-7 text-brand-pink" />
                </div>
                <h3 className="text-xl font-bold mb-4">Isolated Runtimes</h3>
                <p className="text-white/50 leading-relaxed">
                  Tasks execute in lightweight Docker containers, providing perfect isolation and reproducibility across all workers.
                </p>
              </div>

              <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-brand-secondary/50 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-brand-secondary/20 flex items-center justify-center mb-6 border border-brand-secondary/30 group-hover:scale-110 transition-transform">
                  <Cpu className="w-7 h-7 text-brand-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-4">Muscle Workers</h3>
                <p className="text-xl font-bold mb-4 italic">The Muscle Nodes</p>
                <p className="text-white/50 leading-relaxed text-sm">
                  Headless workers that can run as background services on Windows, Linux, or macOS. Zero overhead, maximum output.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-white/30 text-sm">
          <p>© 2026 Brain & Muscle Foundation. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="https://github.com/akashtripathi12/brain-and-muscle" className="hover:text-white transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
