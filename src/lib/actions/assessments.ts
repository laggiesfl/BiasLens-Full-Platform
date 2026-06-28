"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/roles";

const ASSESSMENT_TYPE_BY_ROLE: Record<Exclude<Role, "admin">, string> = {
  civil_society: "investigation",
  business: "internal_audit",
  government: "procurement_review",
  affected_individual: "support_flow",
};

export async function createAssessment(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim() || "Untitled assessment";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "civil_society") as Exclude<Role, "admin">;
  const assessmentType = ASSESSMENT_TYPE_BY_ROLE[role] ?? "investigation";

  const { data: assessment, error } = await supabase
    .from("assessments")
    .insert({
      owner_id: user.id,
      title,
      role_context: role,
      assessment_type: assessmentType,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !assessment) {
    redirect(
      "/assessments?error=" +
        encodeURIComponent(error?.message ?? "Could not create the assessment.")
    );
  }

  // Create the empty linked records so later sprints can fill them in.
  await supabase.from("ai_system_profiles").insert({ assessment_id: assessment.id });
  await supabase
    .from("questionnaire_responses")
    .insert({ assessment_id: assessment.id });

  await supabase.from("activity_log").insert({
    actor_id: user.id,
    action: "assessment_created",
    entity_type: "assessment",
    entity_id: assessment.id,
    metadata: { title },
  });

  revalidatePath("/assessments");
  redirect(`/assessments/${assessment.id}`);
}

export async function deleteAssessment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/assessments");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("assessments").delete().eq("id", id);
  if (error) {
    redirect("/assessments?error=" + encodeURIComponent(error.message));
  }

  await supabase.from("activity_log").insert({
    actor_id: user.id,
    action: "assessment_deleted",
    entity_type: "assessment",
    entity_id: id,
    metadata: {},
  });

  revalidatePath("/assessments");
  redirect("/assessments?message=" + encodeURIComponent("Assessment deleted."));
}

export async function updateSystemBasics(formData: FormData) {
  const id = String(formData.get("assessment_id") ?? "");
  if (!id) redirect("/assessments");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();

  const update = {
    system_name: String(formData.get("system_name") ?? "").trim() || null,
    provider: String(formData.get("provider") ?? "").trim() || null,
    deployer: String(formData.get("deployer") ?? "").trim() || null,
    purpose: String(formData.get("purpose") ?? "").trim() || null,
    decision_domain: String(formData.get("decision_domain") ?? "").trim() || null,
  };

  const { error } = await supabase
    .from("ai_system_profiles")
    .update(update)
    .eq("assessment_id", id);

  if (error) {
    redirect(`/assessments/${id}?error=` + encodeURIComponent(error.message));
  }

  if (title) {
    await supabase.from("assessments").update({ title }).eq("id", id);
  }

  revalidatePath(`/assessments/${id}`);
  redirect(`/assessments/${id}?message=` + encodeURIComponent("Saved."));
}

export async function setAssessmentStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowed = ["draft", "in_review", "completed", "exported", "archived"];
  if (!id || !allowed.includes(status)) redirect("/assessments");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: current } = await supabase
    .from("assessments")
    .select("status")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("assessments")
    .update({ status })
    .eq("id", id);
  if (error) {
    redirect(`/assessments/${id}?error=` + encodeURIComponent(error.message));
  }

  await supabase.from("assessment_status_history").insert({
    assessment_id: id,
    from_status: current?.status ?? null,
    to_status: status,
    changed_by: user.id,
  });

  revalidatePath(`/assessments/${id}`);
  revalidatePath("/assessments");
  redirect(`/assessments/${id}?message=` + encodeURIComponent("Status updated."));
}
