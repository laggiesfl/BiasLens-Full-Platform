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

/**
 * Saves the person's display name and the organisation they complete
 * assessments for.
 *
 * These two values are stored once here and then carried into every assessment
 * tool, so nobody has to type them again in each one. That is what WCAG 2.2
 * success criterion 3.3.7 Redundant Entry asks for, and it matters most to
 * people who find typing tiring or difficult.
 *
 * Storing the name here also means invited users can set what BiasLens calls
 * them, instead of being greeted by a placeholder.
 */
export async function updateAccountDetails(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const organisationName = String(formData.get("organisation_name") ?? "").trim();

  if (!fullName) {
    redirect(
      "/settings?error=" +
        encodeURIComponent("Enter the name you would like BiasLens to use for you.")
    );
  }
  if (fullName.length > 120) {
    redirect(
      "/settings?error=" +
        encodeURIComponent("That name is too long. Please use 120 characters or fewer.")
    );
  }
  if (organisationName.length > 160) {
    redirect(
      "/settings?error=" +
        encodeURIComponent(
          "That organisation name is too long. Please use 160 characters or fewer."
        )
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      // Store an empty organisation as null rather than an empty string, so
      // "not provided" and "provided as blank" cannot drift apart.
      organisation_name: organisationName || null,
    })
    .eq("id", user.id);

  if (error) {
    redirect("/settings?error=" + encodeURIComponent(error.message));
  }

  await logActivity("account_details_changed", {
    has_organisation: Boolean(organisationName),
  });
  revalidatePath("/", "layout");
  redirect(
    "/settings?message=" +
      encodeURIComponent(
        "Saved. Your name and organisation will now be filled in for you across the assessment tools."
      )
  );
}
