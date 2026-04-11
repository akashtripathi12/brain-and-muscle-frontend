"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { type Session } from "@supabase/supabase-js";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import SupportForm from "@/components/SupportForm";

export default function LayoutWrapper({ 
  children,
  initialSession 
}: { 
  children: React.ReactNode,
  initialSession: Session | null
}) {
  const pathname = usePathname();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading, setLoading] = useState(!initialSession);

  useEffect(() => {
    const supabase = createClient();
    
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const handleOpenSupport = () => setIsSupportOpen(true);
    window.addEventListener("bam:open-support", handleOpenSupport);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("bam:open-support", handleOpenSupport);
    };
  }, []);

  const publicRoutes = ["/", "/setup", "/login", "/docs", "/terms", "/privacy"];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/auth") || pathname.startsWith("/api/auth");
  
  // Show app layout only if logged in AND not on a public route that should be clean
  // OR if on a dashboard/internal route (which should be blocked by proxy anyway)
  const showAppLayout = !!session && !isPublicRoute;

  if (!showAppLayout) {
    const isLogin = pathname === "/login";
    const isLanding = pathname === "/";
    const isSetup = pathname === "/setup";

    return (
      <main className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
        isLogin ? 'cyber-bg flex items-center justify-center p-4' : 
        isLanding ? 'bg-nebula-black' : 
        isSetup ? 'bg-bg-deep flex items-center justify-center p-4' :
        'bg-bg-deep p-8'
      }`}>
        {isLogin && <div className="glow-mesh" />}
        <div className={`relative z-10 w-full ${isLogin || isSetup ? 'max-w-4xl' : ''}`}>
          {children}
        </div>
        <SupportForm isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-deep transition-all duration-500">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 xl:pl-64 transition-all duration-300">
        <Navbar />
        <main className="flex-1 px-4 py-8 md:px-8 lg:px-10 w-full animate-in fade-in duration-700">
          {children}
        </main>
      </div>
      <SupportForm isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </div>
  );
}
