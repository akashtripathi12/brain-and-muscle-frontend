import { createClient } from "@/utils/supabase/server";
import { api, Deployment } from "@/lib/api";
import DeploymentsClient from "@/components/deployments/DeploymentsClient";
import { redirect } from "next/navigation";

export default async function DeploymentsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const token = session.access_token;
  let initialDeployments: Deployment[] = [];
  let error: string | null = null;

  try {
    initialDeployments = await api.getDeployments(token);
  } catch (err) {
    console.error("[deployments] API connection failed:", err);
  }

  return (
    <DeploymentsClient 
      initialDeployments={initialDeployments} 
      error={error}
    />
  );
}
