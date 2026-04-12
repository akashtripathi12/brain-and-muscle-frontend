/**
 * Brain API Client
 * Handles communication with the Go Brain Control Plane
 */

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || "http://localhost:8888";

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

async function brainFetch<T>(endpoint: string, options: RequestInit & { token?: string } = {}): Promise<T> {
  const url = `${BRAIN_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  // Auth logic: Prioritize user token.
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  } else {
    headers.set("X-API-Key", process.env.NEXT_PUBLIC_BRAIN_API_KEY || "");
  }

  const response = await fetch(url, {
    ...options,
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
  getNodes: (token?: string) => brainFetch<Node[]>("/api/nodes", { token }),
  getDeployments: (token?: string) => brainFetch<Deployment[]>("/api/deployments", { token }),
  deploy: (data: DeployRequest, token?: string) => 
    brainFetch<{ status: string; index: number; job_id: string }>("/api/deploy", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
  killDeployment: (jobId: string, token?: string) =>
    brainFetch<{ status: string; task_id: string; job_id: string }>(`/api/kill/${jobId}`, {
      method: "POST",
      token,
    }),
  deleteDeployment: (jobId: string, token?: string) =>
    brainFetch<{ status: string; job_id: string }>(`/api/delete/${jobId}`, {
      method: "POST",
      token,
    }),
  getDownloadUrl: (jobId: string, token?: string) =>
    brainFetch<{ job_id: string; download_url: string }>(`/api/tasks/${jobId}/download`, { token }),
  getHistory: (token?: string) => brainFetch<Deployment[]>("/api/history", { token }),
};
