"use client";

import { Key, Globe, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Global cluster configuration and API access
        </p>
      </div>

      {/* API Configuration */}
      <div className="rounded-xl border border-gray-800/60 bg-gray-900/30 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">
            API Configuration
          </h2>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Brain API Endpoint
          </label>
          <input
            type="text"
            defaultValue="http://127.0.0.1:8888"
            className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 font-mono text-sm text-white outline-none focus:border-emerald-500/50"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            API Key
          </label>
          <input
            type="password"
            disabled
            defaultValue="••••••••••••••••"
            title="The Brain API key is stored server-side and is never sent to the browser."
            className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 font-mono text-sm text-gray-500 outline-none cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">Managed server-side (BRAIN_API_KEY).</p>
        </div>
      </div>

      {/* Network */}
      <div className="rounded-xl border border-gray-800/60 bg-gray-900/30 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-white">
            Network Configuration
          </h2>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Custom Domain
          </label>
          <input
            type="text"
            defaultValue="api.akashtripathi.tech"
            className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 font-mono text-sm text-white outline-none focus:border-emerald-500/50"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Tailscale Network
          </label>
          <input
            type="text"
            defaultValue="brain-muscle-cluster"
            className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 font-mono text-sm text-white outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-gray-800/60 bg-gray-900/30 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Notifications</h2>
        </div>

        {[
          { label: "Node goes offline", description: "Alert when a Muscle loses heartbeat" },
          { label: "Service crashes", description: "Alert when a deployed app exits unexpectedly" },
          { label: "Resource exhaustion", description: "Alert when a node exceeds 90% CPU or RAM" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2"
          >
            <div>
              <p className="text-sm font-medium text-gray-200">
                {item.label}
              </p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
            <button className="relative h-6 w-11 rounded-full bg-emerald-600 transition-colors">
              <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-rose-400" />
          <h2 className="text-sm font-semibold text-rose-400">Danger Zone</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-200">
              Purge All Deployments
            </p>
            <p className="text-xs text-gray-500">
              Stop and remove all running containers across the cluster
            </p>
          </div>
          <button className="rounded-lg border border-rose-500/30 px-4 py-2 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500/10">
            Purge
          </button>
        </div>
      </div>
    </div>
  );
}
