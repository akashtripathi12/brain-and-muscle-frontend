/**
 * Brain API Client
 * Handles communication with the Go Brain Control Plane
 */

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || "http://localhost:8888";

/** Maps a Brain endpoint like "/api/logs/123" to the browser-safe proxy path "/api/brain/logs/123". */
export function brainProxyPath(endpoint: string): string {
  return endpoint.replace(/^\/api\//, "/api/brain/");
}

export interface Node {
  id: string;
  ip: string;
  total_cpu: number;
  total_ram: number;
  avail_cpu: number;
  avail_ram: number;
  occupied_ports: Record<number, string>;
  active_task_ids: string[];
  last_heartbeat: string;
}

export interface Deployment {
  job_id: string;
  job_type: string;
  status: number; // 0: Provisioning, 1: Running, 2: Completed, 3: Failed
  required_cpu: number;
  required_ram: number;
  assigned_worker_id: string;
  public_route?: string;
  created_at: string;
}

export interface DeployRequest {
  user_script_path?: string;
  code?: string;
  extension?: string;
  git_repo?: string;
  required_cpu: number;
  required_ram: number;
  job_type: string;
  exposed_port?: number;
  source_type?: string; // "github" | "local"
  env?: Record<string, string>;
  build_command?: string;
  run_command?: string;
  root_directory?: string;
  payload?: string;
  args?: string[];
  total_maps?: number;
  gather_script_path?: string;
}

const isServer = typeof window === "undefined";

/**
 * In the browser, requests go through the same-origin /api/brain proxy, which
 * attaches the server-only API key and the verified user identity.
 * On the server (Server Components / Actions), we call the Brain directly.
 */
async function brainFetch<T>(endpoint: string, options: RequestInit & { token?: string; userEmail?: string } = {}): Promise<T> {
  const { token, userEmail, ...init } = options;

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  let url: string;
  if (isServer) {
    url = `${BRAIN_URL}${endpoint}`;
    // Prefer the user's JWT; the API key (server-only env) is the fallback.
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("X-API-Key", process.env.BRAIN_API_KEY || "");
    if (userEmail) headers.set("X-User-Identity", userEmail);
  } else {
    url = brainProxyPath(endpoint);
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brain API Error (${response.status}): ${error}`);
  }

  return response.json();
}

export const api = {
  host: BRAIN_URL,
  getNodes: (token?: string, userEmail?: string) => brainFetch<Node[]>("/api/nodes", { token, userEmail }),
  getDeployments: (token?: string, userEmail?: string) => brainFetch<Deployment[]>("/api/deployments", { token, userEmail }),
  deploy: (data: DeployRequest, token?: string, userEmail?: string) => 
    brainFetch<{ status: string; index: number; job_id: string }>("/api/deploy", {
      method: "POST",
      body: JSON.stringify(data),
      token,
      userEmail,
    }),
  killDeployment: (jobId: string, token?: string, userEmail?: string) =>
    brainFetch<{ status: string; task_id: string; job_id: string }>(`/api/kill/${jobId}`, {
      method: "POST",
      token,
      userEmail,
    }),
  deleteDeployment: (jobId: string, token?: string, userEmail?: string) =>
    brainFetch<{ status: string; job_id: string }>(`/api/delete/${jobId}`, {
      method: "POST",
      token,
      userEmail,
    }),
  getDownloadUrl: (jobId: string, token?: string, userEmail?: string) =>
    brainFetch<{ job_id: string; download_url: string }>(`/api/tasks/${jobId}/download`, { token, userEmail }),
  getHistory: (token?: string, userEmail?: string) => brainFetch<Deployment[]>("/api/history", { token, userEmail }),
};
