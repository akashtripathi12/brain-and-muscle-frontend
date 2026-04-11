"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signInWithGitHub } from "@/app/actions/auth";
import { Zap, ShieldCheck, Globe, Loader2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      setIsVerifying(true);
      // Hard redirect to the callback handler
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const timer = setTimeout(() => {
        window.location.replace(`${siteUrl}/api/auth/callback?code=${code}`);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [code]);

  return (
    <div className="w-full">
      {/* Logo Section */}
      <div className="text-center mb-12 transform-gpu transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
        <div className="inline-flex items-center justify-center p-4 mb-6 rounded-3xl bg-brand-primary/10 border border-brand-primary/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
          <Zap className="w-10 h-10 text-brand-primary fill-brand-primary/10" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-3">
          Brain & <span className="text-gradient">Muscle</span>
        </h1>
        <p className="text-gray-400 text-lg font-medium">
          The Distributed Intelligence Engine.
        </p>
      </div>

      {/* Login Card */}
      <div className="glass-panel rounded-[2.5rem] p-10 relative overflow-hidden group transition-all duration-500 hover:shadow-brand-primary/5">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            {isVerifying ? "Verifying Session" : "Welcome back"}
          </h2>

          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
              <p className="text-gray-400 text-sm animate-pulse">Establishing secure connection...</p>
            </div>
          ) : (
            <form action={signInWithGitHub}>
              <button type="submit" className="btn-primary w-full gap-3 py-4 text-lg">
                <FaGithub className="w-6 h-6" />
                <span>Continue with GitHub</span>
              </button>
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-white/5">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 transition-colors hover:bg-white/[0.05]">
                <ShieldCheck className="w-6 h-6 text-brand-primary" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-bold">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 transition-colors hover:bg-white/[0.05]">
                <Globe className="w-6 h-6 text-brand-secondary" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-bold">Global</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-10 text-center animate-in fade-in duration-1000">
        <p className="text-sm text-gray-500">
          By continuing, you agree to our{" "}
          <button className="text-gray-300 hover:text-brand-primary underline transition-colors decoration-brand-primary/30 underline-offset-4">Terms</button>
          {" "}and{" "}
          <button className="text-gray-300 hover:text-brand-primary underline transition-colors decoration-brand-primary/30 underline-offset-4">Privacy</button>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}