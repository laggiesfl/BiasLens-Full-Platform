"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { classify, type Answers } from "@/lib/risk/engine";

/**
 * Runs the transparent risk engine on the saved questionnaire answers and
 * stores the result. Re-runnable: regenerates from the latest answers.
 */
export async function generateRiskClassification(assessmentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: response } = await supabase
    .from("questionnaire_responses")
    .select("answers")
    .eq("assessment_id", assessmentId)
    .single();

  const answers = (response?.answers ?? {}) as Answers;
  const result = classify(answers);

  const { error } = await supabase.from("risk_classifications").upsert(
    {
      assessment_id: assessmentId,
      sa_tier: result.sa_tier,
      eu_classification: result.eu_classification,
      eu_annex_category: result.eu_annex_category,
      fairness_findings: result.fairness_findings,
      // Written in parallel during the rename so that anything still reading
      // the old column keeps working. Remove this line when
      // ibm_bias_scores is dropped — see add_fairness_findings_column.
      ibm_bias_scores: result.fairness_findings,
      sa_pillar_alignment: result.sa_pillar_alignment,
      triggered_obligations: result.triggered_obligations,
      rationale: result.rationale,
      remediation: result.remediation,
      executive_summary: result.executive_summary,
      reviewed: false,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "assessment_id" }
  );

  if (error) {
    redirect(`/assessments/${assessmentId}?error=` + encodeURIComponent(error.message));
  }

  await supabase.from("activity_log").insert({
    actor_id: user.id,
    action: "risk_classification_generated",
    entity_type: "assessment",
    entity_id: assessmentId,
    metadata: { sa_tier: result.sa_tier, eu: result.eu_classification },
  });

  revalidatePath(`/assessments/${assessmentId}/report`);
  redirect(`/assessments/${assessmentId}/report`);
}

/**
 * Reviewer edits: override the headline classifications and executive summary,
 * and mark the report as reviewed. Original generated values are preserved in
 * the rationale; overrides are stored separately.
 */
export async function saveRiskOverrides(formData: FormData) {
  const assessmentId = String(formData.get("assessment_id") ?? "");
  if (!assessmentId) redirect("/assessments");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const overrides = {
    sa_tier: String(formData.get("sa_tier") ?? "").trim() || null,
    eu_classification: String(formData.get("eu_classification") ?? "").trim() || null,
    executive_summary: String(formData.get("executive_summary") ?? "").trim() || null,
    edited_by: user.id,
    edited_at: new Date().toISOString(),
  };

  const reviewed = formData.get("reviewed") === "on";

  const { error } = await supabase
    .from("risk_classifications")
    .update({ overrides, reviewed, reviewed_by: reviewed ? user.id : null })
    .eq("assessment_id", assessmentId);

  if (error) {
    redirect(`/assessments/${assessmentId}/report?error=` + encodeURIComponent(error.message));
  }

  await supabase.from("activity_log").insert({
    actor_id: user.id,
    action: "risk_classification_reviewed",
    entity_type: "assessment",
    entity_id: assessmentId,
    metadata: { reviewed },
  });

  revalidatePath(`/assessments/${assessmentId}/report`);
  redirect(`/assessments/${assessmentId}/report?message=` + encodeURIComponent("Saved."));
}
