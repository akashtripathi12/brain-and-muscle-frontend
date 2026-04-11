"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="min-h-screen cyber-bg relative overflow-hidden flex items-center justify-center p-4">
      <div className="glow-mesh" />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </main>;
  }

  return (
    <div className="flex min-h-screen bg-bg-deep">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 xl:pl-64 transition-all duration-300">
        <Navbar />
        <main className="flex-1 px-4 py-8 md:px-8 lg:px-10 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
