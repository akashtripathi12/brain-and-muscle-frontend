// ===========================
// TYPE DEFINITIONS
// ===========================

export interface MuscleNode {
  id: string;
  tailscaleIp: string;
  status: "online" | "offline";
  totalCpu: number;
  availableCpu: number;
  totalRamMb: number;
  availableRamMb: number;
  lastHeartbeat: string;
  hostedJobs: string[];
  location: string;
}

export interface Deployment {
  jobId: string;
  name: string;
  status: "pending" | "running" | "failed";
  assignedNodeId: string;
  publicRoute: string;
  requestedCpu: number;
  requestedRamMb: number;
  uptimeSeconds: number;
  exposedPort: number;
  language: string;
}

export interface ClusterEvent {
  id: string;
  timestamp: string;
  type: "deployment" | "node_join" | "node_leave" | "error" | "scale";
  message: string;
  severity: "info" | "warning" | "error" | "success";
}

// ===========================
// MOCK DATA
// ===========================

export const mockNodes: MuscleNode[] = [
  {
    id: "muscle-mumbai-1",
    tailscaleIp: "100.99.88.10",
    status: "online",
    totalCpu: 16,
    availableCpu: 4,
    totalRamMb: 8192,
    availableRamMb: 2048,
    lastHeartbeat: new Date(Date.now() - 3000).toISOString(),
    hostedJobs: ["service-2", "service-5"],
    location: "Mumbai, IN",
  },
  {
    id: "muscle-nyc-1",
    tailscaleIp: "100.99.88.20",
    status: "online",
    totalCpu: 8,
    availableCpu: 6,
    totalRamMb: 4096,
    availableRamMb: 3584,
    lastHeartbeat: new Date(Date.now() - 5000).toISOString(),
    hostedJobs: ["service-8"],
    location: "New York, US",
  },
  {
    id: "muscle-london-1",
    tailscaleIp: "100.99.88.30",
    status: "online",
    totalCpu: 32,
    availableCpu: 28,
    totalRamMb: 65536,
    availableRamMb: 61440,
    lastHeartbeat: new Date(Date.now() - 2000).toISOString(),
    hostedJobs: ["service-12", "service-14"],
    location: "London, UK",
  },
  {
    id: "muscle-tokyo-1",
    tailscaleIp: "100.99.88.40",
    status: "offline",
    totalCpu: 4,
    availableCpu: 4,
    totalRamMb: 2048,
    availableRamMb: 2048,
    lastHeartbeat: new Date(Date.now() - 120000).toISOString(),
    hostedJobs: [],
    location: "Tokyo, JP",
  },
];

export const mockDeployments: Deployment[] = [
  {
    jobId: "service-2",
    name: "VEM Backend API",
    status: "running",
    assignedNodeId: "muscle-mumbai-1",
    publicRoute: "/proxy/service-2",
    requestedCpu: 2,
    requestedRamMb: 512,
    uptimeSeconds: 86400,
    exposedPort: 8080,
    language: "Go",
  },
  {
    jobId: "service-5",
    name: "Books API",
    status: "running",
    assignedNodeId: "muscle-mumbai-1",
    publicRoute: "/proxy/service-5",
    requestedCpu: 1,
    requestedRamMb: 256,
    uptimeSeconds: 43200,
    exposedPort: 3000,
    language: "Node.js",
  },
  {
    jobId: "service-8",
    name: "Auth Microservice",
    status: "running",
    assignedNodeId: "muscle-nyc-1",
    publicRoute: "/proxy/service-8",
    requestedCpu: 2,
    requestedRamMb: 512,
    uptimeSeconds: 7200,
    exposedPort: 4000,
    language: "Go",
  },
  {
    jobId: "service-12",
    name: "ML Inference Engine",
    status: "pending",
    assignedNodeId: "muscle-london-1",
    publicRoute: "/proxy/service-12",
    requestedCpu: 8,
    requestedRamMb: 4096,
    uptimeSeconds: 0,
    exposedPort: 5000,
    language: "Python",
  },
  {
    jobId: "service-14",
    name: "WebSocket Gateway",
    status: "failed",
    assignedNodeId: "muscle-london-1",
    publicRoute: "/proxy/service-14",
    requestedCpu: 1,
    requestedRamMb: 128,
    uptimeSeconds: 300,
    exposedPort: 9090,
    language: "Node.js",
  },
];

export const mockEvents: ClusterEvent[] = [
  {
    id: "evt-1",
    timestamp: new Date(Date.now() - 30000).toISOString(),
    type: "deployment",
    message: "service-2 (VEM Backend API) deployed to muscle-mumbai-1",
    severity: "success",
  },
  {
    id: "evt-2",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    type: "node_join",
    message: "muscle-london-1 joined the cluster from London, UK",
    severity: "info",
  },
  {
    id: "evt-3",
    timestamp: new Date(Date.now() - 90000).toISOString(),
    type: "error",
    message: "service-14 (WebSocket Gateway) crashed — OOM Kill",
    severity: "error",
  },
  {
    id: "evt-4",
    timestamp: new Date(Date.now() - 120000).toISOString(),
    type: "node_leave",
    message: "muscle-tokyo-1 went offline — no heartbeat for 60s",
    severity: "warning",
  },
  {
    id: "evt-5",
    timestamp: new Date(Date.now() - 150000).toISOString(),
    type: "deployment",
    message: "service-5 (Books API) deployed to muscle-mumbai-1",
    severity: "success",
  },
  {
    id: "evt-6",
    timestamp: new Date(Date.now() - 200000).toISOString(),
    type: "scale",
    message: "service-8 scaled up to 2 CPU / 512MB RAM on muscle-nyc-1",
    severity: "info",
  },
  {
    id: "evt-7",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    type: "deployment",
    message: "service-12 (ML Inference) queued — waiting for GPU node",
    severity: "info",
  },
];

export const mockLogs = [
  { ts: "03:00:50", level: "INFO", msg: "muscle worker muscle-1 starting — brain at 127.0.0.1:9000 (16 CPU / 4096 MB RAM)" },
  { ts: "03:00:52", level: "INFO", msg: "✅ [warmpool] muscle-ml-env initialized! (ID: 040bc3c1e374)" },
  { ts: "03:01:11", level: "INFO", msg: "[exec] starting task service-2-daemon" },
  { ts: "03:01:11", level: "INFO", msg: "[muscle] Booting Backend Service for Job service-2 (Internal: 8080 -> Host: 51182)..." },
  { ts: "03:01:11", level: "INFO", msg: "[exec] ✅ Injecting 11 variables from /app/VEM_Backend/.env" },
  { ts: "03:01:47", level: "INFO", msg: "✅ Connected to Supabase" },
  { ts: "03:01:47", level: "INFO", msg: "✅ DB Connected" },
  { ts: "03:01:47", level: "INFO", msg: "✅ Connected to Redis at redis://host.docker.internal:6379" },
  { ts: "03:01:47", level: "INFO", msg: "✅ Redis eviction policy set to allkeys-lfu" },
  { ts: "03:01:47", level: "INFO", msg: "👷 Asynq Worker Server Starting..." },
  { ts: "03:01:47", level: "INFO", msg: "┌───────────────────────────────────────────────────┐" },
  { ts: "03:01:47", level: "INFO", msg: "│                  Fiber v2.52.11                   │" },
  { ts: "03:01:47", level: "INFO", msg: "│       (bound on host 0.0.0.0 and port 8080)       │" },
  { ts: "03:01:47", level: "INFO", msg: "└───────────────────────────────────────────────────┘" },
  { ts: "03:01:49", level: "INFO", msg: "[muscle] ✅ Service verified running at 127.0.0.1:51182" },
  { ts: "03:01:49", level: "INFO", msg: "[registry] 🌐 API Gateway Route Added: /proxy/service-2 -> 127.0.0.1:51182" },
];

// ===========================
// HELPER FUNCTIONS
// ===========================

export function formatUptime(seconds: number): string {
  if (seconds === 0) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatBytes(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

export function timeAgo(isoString: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
