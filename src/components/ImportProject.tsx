"use client"

import { Search, Plus, CheckCircle2, Loader2, AlertCircle, Shield, Globe, RefreshCcw } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getGitHubRepositories, importProject } from "@/app/actions/deployment";
import { signOut } from "@/app/actions/auth";

interface Repository {
  id: number;
  full_name: string;
  private: boolean;
}

export default function ImportProject() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadRepos() {
      try {
        setLoading(true);
        const data = await getGitHubRepositories();
        setRepos(data);
        setError(null);
      } catch (err: any) {
        if (err.message === "GITHUB_TOKEN_MISSING") {
          setError("RECONNECT_GITHUB");
        } else {
          setError("Failed to fetch repositories. Ensure your GitHub account is connected.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadRepos();
  }, []);

  const filteredRepos = repos.filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleImport(repoName: string) {
    // We now redirect to the configuration page instead of deploying instantly
    window.location.href = `/deployments/new/${repoName}`;
  }

  if (error === "RECONNECT_GITHUB") {
    return (
      <div className="mx-auto max-w-2xl p-10 mt-10 glass-panel rounded-[3rem] border-brand-primary/20 bg-brand-primary/[0.02] flex flex-col items-center text-center gap-6 animate-in zoom-in-95 duration-500">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-brand-primary/20 animate-pulse" />
          <div className="relative h-16 w-16 rounded-2xl bg-bg-deep border border-brand-primary/30 flex items-center justify-center">
            <Shield className="h-8 w-8 text-brand-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Connection <span className="text-brand-primary">Interrupted</span></h2>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest leading-loose">
            Your GitHub identity token is missing or has expired. <br/>
            We need to re-verify your account to access your repositories.
          </p>
        </div>
        <button 
          onClick={() => signOut()}
          className="btn-primary px-10 py-4 uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 transition-all hover:scale-105"
        >
          <RefreshCcw className="h-4 w-4" />
          Restore Connection
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
          New <span className="text-brand-primary">Deployment</span>
        </h1>
        <p className="text-gray-400 font-medium text-lg">
          Select a repository to configure and launch across the Muscle cluster.
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-1 bg-white/[0.02] border border-white/5 rounded-[2rem]">
        <div className="relative flex-1 w-full md:w-auto ml-4">
          <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-primary/60" />
          <input
            type="text"
            placeholder="Search repositories..."
            className="w-full bg-transparent py-4 pl-8 pr-4 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 mr-1 text-sm font-bold text-gray-400 hover:text-white transition-all bg-white/[0.03] hover:bg-white/[0.05] rounded-[1.5rem] border border-white/5"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh GitHub
        </button>
      </div>

      {/* Messaging */}
      {(error && error !== "RECONNECT_GITHUB") && (
        <div className="flex items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm font-bold text-red-400 animate-in slide-in-from-top-4 duration-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Repository Showcase */}
      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-3xl border border-white/5 bg-white/[0.02] animate-pulse" />
          ))
        ) : filteredRepos.length > 0 ? (
          filteredRepos.map((repo) => (
            <div
              key={repo.id}
              className="glass-panel group relative flex flex-col justify-between rounded-[2rem] p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-brand-primary/5"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 text-gray-400 group-hover:text-brand-primary transition-colors">
                    <FaGithub className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-brand-primary transition-colors line-clamp-1">
                      {repo.full_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {repo.private ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-black uppercase text-orange-400">
                          <Shield className="h-3 w-3" />
                          Private
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-black uppercase text-brand-primary">
                          <Globe className="h-3 w-3" />
                          Public
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleImport(repo.full_name)}
                className="btn-primary w-full gap-2 text-xs py-3 uppercase tracking-[0.1em]"
              >
                <Plus className="h-4 w-4" />
                Configure Deployment
              </button>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 flex flex-col items-center justify-center p-20 rounded-[3rem] border border-dashed border-white/5 text-gray-600 bg-white/[0.01]">
            <Search className="mb-4 h-12 w-12 opacity-20" />
            <p className="text-lg font-bold">No repositories match your criteria</p>
            <p className="text-sm">Try searching for a different keyword or re-sync GitHub.</p>
          </div>
        )}
      </div>
    </div>
  );
}
