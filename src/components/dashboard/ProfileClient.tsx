"use client";

import { signOut } from "@/app/actions/auth";
import { 
  User, 
  Mail, 
  Shield, 
  Clock, 
  LogOut, 
  ExternalLink, 
  Fingerprint,
  Calendar
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";

interface ProfileClientProps {
  user: any;
  session: any;
}

export default function ProfileClient({ user, session }: ProfileClientProps) {
  const metadata = user?.user_metadata || {};
  const avatarUrl = metadata.avatar_url || "";
  const fullName = metadata.full_name || user?.email?.split("@")[0] || "User";
  const username = metadata.user_name || "";
  
  const stats = [
    { label: "Identity", value: "Verified GitHub", icon: Shield, color: "text-nebula-pink" },
    { label: "Access", value: "Root Cluster", icon: Fingerprint, color: "text-nebula-pink" },
    { label: "Status", value: "Active", icon: Clock, color: "text-nebula-pink" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header / Hero Section */}
      <div className="relative group">
        <div className="relative border border-white/5 bg-nebula-maroon/10 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl backdrop-blur-3xl overflow-hidden">
          {/* Avatar */}
          <div className="relative">
            {avatarUrl ? (
              <div className="relative h-40 w-40 overflow-hidden rounded-3xl border-2 border-white/10 shadow-2xl">
                <Image 
                  src={avatarUrl} 
                  alt={fullName} 
                  fill 
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative h-40 w-40 rounded-3xl bg-nebula-pink flex items-center justify-center text-5xl font-bold text-white">
                {fullName[0]?.toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-3 -right-3 h-10 w-10 bg-nebula-black border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
              <FaGithub className="w-5 h-5 text-nebula-pink" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-white uppercase">{fullName}</h1>
              <p className="text-nebula-pink font-bold tracking-wider uppercase text-[10px] opacity-70 flex items-center justify-center md:justify-start gap-3">
                Username: @{username || "distributed_node"}
                <span className="h-1.5 w-1.5 rounded-full bg-nebula-pink animate-glow-pink"></span>
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="bg-white/5 border border-white/5 rounded-full px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <Mail className="w-3.5 h-3.5 text-zinc-600" />
                {user?.email}
              </div>
              <div className="bg-white/5 border border-white/5 rounded-full px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                Linked {new Date(user?.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center md:justify-start gap-8">
              <button 
                onClick={() => signOut()}
                className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-rose-500 transition-all font-sans"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>

              <a 
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-all flex items-center gap-2 font-sans"
              >
                <FaGithub className="w-4 h-4 text-nebula-pink" />
                GitHub Profile
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-white tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* System Details */}
      <div className="border border-white/5 rounded-3xl p-8 bg-nebula-maroon/5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-white mb-8 flex items-center gap-3">
          <Shield className="w-4 h-4 text-nebula-pink" />
          Cluster Identity Detail
        </h3>
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04]">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider leading-none">User ID</span>
            <span className="text-[10px] font-mono text-nebula-pink mt-2 md:mt-0 select-all opacity-80">{user?.id}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04]">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider leading-none">Identity Provider</span>
            <span className="text-[10px] font-bold text-white mt-2 md:mt-0 uppercase tracking-widest">GitHub OAuth</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04]">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider leading-none">Session Expiry</span>
            <span className="text-[10px] font-mono text-zinc-400 mt-2 md:mt-0">
              {new Date(session?.expires_at * 1000).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
