import { createClient } from "@/utils/supabase/server";
import { api, Node, Deployment } from "@/lib/api";
import OverviewClient from "@/components/dashboard/OverviewClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const token = session.access_token;
  let initialNodes: Node[] = [];
  let initialDeployments: Deployment[] = [];

  try {
    // Initial fetch for SSR
    [initialNodes, initialDeployments] = await Promise.all([
      api.getNodes(token),
      api.getDeployments(token),
    ]);
  } catch (err) {
    console.error("[dashboard] API connection failed:", err);
  }

  return (
    <OverviewClient 
      initialNodes={initialNodes} 
      initialDeployments={initialDeployments} 
      sessionToken={token} 
    />
  );
}
