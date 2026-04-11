import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SetupTour from "@/components/SetupTour";

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const supabase = await createClient();

  // Handle OAuth code if it lands here
  if (code) {
    console.log(`[setup] Received code. Exchanging for session...`);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect("/dashboard");
    } else {
      console.error(`[setup] Error exchanging code: ${error.message}`);
    }
  }

  const { data: { session } } = await supabase.auth.getSession();

  return <SetupTour isLoggedIn={!!session} />;
}
