"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || "http://localhost:8888";
const WEBHOOK_URL_BASE = process.env.BRAIN_WEBHOOK_URL || BRAIN_URL;

export async function importProject(repoFullName: string) {
  const supabase = await createClient();

  // 1. Authenticate and get authentic user data (getUser is more secure than getSession)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession(); // Still need session for provider_token
  
  if (authError || !user || !session) {
    throw new Error("Unauthorized: Please log in first");
  }

  // Supabase stores the GitHub token in the provider_token field
  const githubToken = session.provider_token;
  if (!githubToken) {
    throw new Error("Missing GitHub permissions. Please log out and sign back in with GitHub to access your repositories.");
  }

  // 2. Generate cryptographically secure HMAC secret for webhooks
  const webhookSecret = crypto.randomBytes(32).toString("hex");

  // 3. Inject Webhook into GitHub Repo
  // Webhooks require a public URL. If we are on localhost, we log a warning but proceed
  // so the project can still be registered in the control plane database.
  // Webhooks require a public URL. In dev, we use BRAIN_WEBHOOK_URL (Ngrok).
  // In a Production VM, we fallback to BRAIN_URL.
  const hookUrl = `${WEBHOOK_URL_BASE}/api/webhooks/github`;
  const isLocal = hookUrl.includes("localhost") || hookUrl.includes("127.0.0.1");

  if (isLocal) {
    console.warn(`[github] Localhost detected (${hookUrl}). Skipping webhook creation as GitHub requires a public URL.`);
  } else {
    try {
      // 1. Check for existing hooks to prevent "Machine Gun" logging
      const existingHooksResponse = await fetch(`https://api.github.com/repos/${repoFullName}/hooks`, {
        headers: {
          "Authorization": `Bearer ${githubToken}`,
          "Accept": "application/vnd.github+json",
        },
      });

      if (existingHooksResponse.ok) {
        const hooks = await existingHooksResponse.json();
        
        // 🚨 CLEANUP: Delete any OLD hooks that point to our system but have a different URL
        // (e.g., from old Ngrok sessions or previous setups)
        const ourHooks = hooks.filter((h: any) => h.config.url.includes("/api/webhooks/github"));
        
        let matchFound = false;
        for (const hook of ourHooks) {
          if (hook.config.url === hookUrl) {
            matchFound = true;
          } else {
            console.log(`[github] Removing legacy webhook: ${hook.config.url}`);
            await fetch(`https://api.github.com/repos/${repoFullName}/hooks/${hook.id}`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${githubToken}` },
            });
          }
        }

        if (matchFound) {
          console.log(`[github] Verified active webhook for ${repoFullName}. Proceeding to sync.`);
        } else {
          // 2. Create the hook if no exact match exists
          const githubResponse = await fetch(`https://api.github.com/repos/${repoFullName}/hooks`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${githubToken}`,
              "Accept": "application/vnd.github+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: "web",
              active: true,
              events: ["push"],
              config: {
                url: hookUrl,
                content_type: "json",
                secret: webhookSecret,
                insecure_ssl: "0",
              },
            }),
          });

          if (!githubResponse.ok) {
            const errorText = await githubResponse.text();
            console.warn(`[github] Webhook setup status: ${githubResponse.status}. Error: ${errorText}`);
          }
        }
      }
    } catch (err) {
      console.error("[github] Failed to contact GitHub API:", err);
    }
  }

  // 4. Register Project via Go Brain RPC Proxy
  const brainResponse = await fetch(`${BRAIN_URL}/internal/projects/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      user_id: user.id,
      repo_full_name: repoFullName,
      webhook_secret: webhookSecret,
    }),
  });

  const brainData = await brainResponse.json();
  const projectID = brainData.project_id || brainData.id;

  revalidatePath("/deployments");
  return { success: true, repo: repoFullName, projectId: projectID };
}

export interface DeploymentConfig {
  repoFullName: string;
  buildQuery: string;
  runQuery: string;
  rootDirectory: string;
  envVars: string; // "KEY=VAL\nKEY2=VAL2"
  exposedPort: number;
  requiredCPU: number;
  requiredRAM: number;
}

/**
 * finalizes the registration and triggers the FIRST deployment with user-defined config
 */
export async function finalizeDeployment(config: DeploymentConfig) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!user || !session) throw new Error("Unauthorized");

  // 1. Step 1: Sync & Register
  const importResult = await importProject(config.repoFullName);

  // 2. Step 2: Fetch default branch and latest commit from GitHub
  const repoResponse = await fetch(`https://api.github.com/repos/${config.repoFullName}`, {
    headers: {
      "Authorization": `Bearer ${session.provider_token}`,
      "Accept": "application/vnd.github+json",
    },
  });
  if (!repoResponse.ok) throw new Error("Failed to fetch repository details from GitHub");
  const repoData = await repoResponse.json();
  const defaultBranch = repoData.default_branch;

  const commitResponse = await fetch(`https://api.github.com/repos/${config.repoFullName}/commits/${defaultBranch}`, {
    headers: {
      "Authorization": `Bearer ${session.provider_token}`,
      "Accept": "application/vnd.github+json",
    },
  });
  if (!commitResponse.ok) throw new Error("Failed to fetch latest commit from GitHub");
  const commitData = await commitResponse.json();
  const latestHash = commitData.sha;

  // 3. Step 3: Parse Environment Variables
  const envMap: Record<string, string> = {};
  config.envVars.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return; // Skip empty lines and comments

    const [k, ...vParts] = trimmed.split("=");
    if (k && vParts.length > 0) {
      let v = vParts.join("=").trim();
      // Strip surrounding quotes if present
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      envMap[k.trim()] = v;
    }
  });

  // 4. Step 4: Submit Task to Brain
  const deployPayload = {
    job_type: "SERVICE",
    project_id: importResult.projectId,
    source_type: "github",
    git_repo: `https://github.com/` + config.repoFullName,
    user_script_path: `https://github.com/` + config.repoFullName, // 🚨 CRITICAL: Required by Brain validation
    branch_name: defaultBranch,
    commit_hash: latestHash,
    build_command: config.buildQuery,
    run_command: config.runQuery,
    root_directory: config.rootDirectory,
    env: envMap,
    required_cpu: config.requiredCPU, // float64 (0.5 etc)
    required_ram: Math.floor(config.requiredRAM), // float to int for bytes
    exposed_port: config.exposedPort || 80,
  };

  const brainResponse = await fetch(`${BRAIN_URL}/api/deploy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.NEXT_PUBLIC_BRAIN_API_KEY || "",
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(deployPayload),
  });

  if (!brainResponse.ok) {
    const error = await brainResponse.text();
    throw new Error(`Cloud Deployment failed: ${error}`);
  }

  revalidatePath("/deployments");
  return { success: true };
}

/**
 * Fetch repositories for the authenticated user from GitHub
 */
export async function getGitHubRepositories() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.provider_token) {
    console.warn("[github] No provider token found in session.");
    throw new Error("GITHUB_SESSION_EXPIRED: Please log out and sign back in with GitHub.");
  }

  // Fetch with all visibility and affiliations (owner, collab, org_member)
  const url = "https://api.github.com/user/repos?visibility=all&affiliation=owner,collaborator,organization_member&sort=updated&per_page=100";
  
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${session.provider_token}`,
      "Accept": "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[github] API Error:", error);
    return [];
  }

  const repos = await response.json();
  return repos.map((r: any) => ({
    id: r.id,
    full_name: r.full_name,
    private: r.private,
  }));
}
