import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing route. Signed-in users go to their dashboard (or onboarding if they
 * have not chosen a role yet); everyone else goes to sign in.
 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarded) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
