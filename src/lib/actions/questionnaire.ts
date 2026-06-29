"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_FIELD_MAP, type Answers } from "@/lib/questionnaire";

/**
 * Marks the questionnaire complete and copies the structured answers into
 * ai_system_profiles so other modules (risk engine, mapper, AIA/FRIA) can use
 * them. Answers themselves are already autosaved to questionnaire_responses.
 */
export async function finishQuestionnaire(assessmentId: string) {
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

  const profileUpdate: Record<string, unknown> = {};
  for (const [answerKey, column] of Object.entries(PROFILE_FIELD_MAP)) {
    if (answers[answerKey] !== undefined && answers[answerKey] !== "") {
      profileUpdate[column] = answers[answerKey];
    }
  }

  if (Object.keys(profileUpdate).length > 0) {
    await supabase
      .from("ai_system_profiles")
      .update(profileUpdate)
      .eq("assessment_id", assessmentId);
  }

  await supabase
    .from("questionnaire_responses")
    .update({ completed: true })
    .eq("assessment_id", assessmentId);

  await supabase.from("activity_log").insert({
    actor_id: user.id,
    action: "questionnaire_completed",
    entity_type: "assessment",
    entity_id: assessmentId,
    metadata: {},
  });

  revalidatePath(`/assessments/${assessmentId}`);
  redirect(
    `/assessments/${assessmentId}/report?message=` +
      encodeURIComponent(
        "Questionnaire saved. Now generate your Bias Risk Report below."
      )
  );
}
