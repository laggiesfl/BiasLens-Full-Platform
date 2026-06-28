"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/roles";

const VALID_ROLES: Role[] = [
  "civil_society",
  "business",
  "government",
  "affected_individual",
];

async function logActivity(action: string, metadata: Record<string, unknown>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("activity_log").insert({
    actor_id: user.id,
    action,
    entity_type: "profile",
    entity_id: user.id,
    metadata,
  });
}

export async function completeOnboarding(formData: FormData) {
  const role = String(formData.get("role") ?? "") as Role;
  if (!VALID_ROLES.includes(role)) {
    redirect("/onboarding?error=" + encodeURIComponent("Please choose a role to continue."));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ role, onboarded: true })
    .eq("id", user.id);

  if (error) {
    redirect("/onboarding?error=" + encodeURIComponent(error.message));
  }

  await logActivity("onboarding_completed", { role });
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function updateRole(formData: FormData) {
  const role = String(formData.get("role") ?? "") as Role;
  if (!VALID_ROLES.includes(role)) {
    redirect("/settings?error=" + encodeURIComponent("Please choose a valid role."));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", user.id);

  if (error) {
    redirect("/settings?error=" + encodeURIComponent(error.message));
  }

  await logActivity("role_changed", { role });
  revalidatePath("/", "layout");
  redirect("/settings?message=" + encodeURIComponent("Your role has been updated."));
}
