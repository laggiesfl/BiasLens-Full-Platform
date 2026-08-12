"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  PROFILE_FIELD_MAP,
  BOOLEAN_PROFILE_FIELDS,
  toNullableBoolean,
  type Answers,
} from "@/lib/questionnaire";

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
    const raw = answers[answerKey];

    if (BOOLEAN_PROFILE_FIELDS.has(answerKey)) {
      // These columns are boolean in the database. An answer of "Not sure"
      // must become NULL, which is what the column already means by "unknown".
      // Sending the string "unsure" would be rejected by Postgres, and the
      // rejection used to pass unnoticed — see the error handling below.
      const asBool = toNullableBoolean(raw);
      if (raw !== undefined && raw !== "") profileUpdate[column] = asBool;
      continue;
    }

    if (raw !== undefined && raw !== "") {
      profileUpdate[column] = raw;
    }
  }

  if (Object.keys(profileUpdate).length > 0) {
    const { error } = await supabase
      .from("ai_system_profiles")
      .update(profileUpdate)
      .eq("assessment_id", assessmentId);

    // Previously this result was discarded. A failed write then looked
    // identical to a successful one: the person saw a success message while
    // their profile had silently not saved. Telling them is the whole point of
    // checking. Their answers are safe either way — they are autosaved to
    // questionnaire_responses, which is a separate write, and the risk engine
    // reads from there rather than from the profile, so the report is still
    // correct.
    //
    // The message goes to the report page because that page renders errors in
    // a role="alert" region. Sending it to the questionnaire page would have
    // put the warning in the address bar where nobody would ever see it —
    // which would be the same silent failure in a new coat.
    if (error) {
      redirect(
        `/assessments/${assessmentId}/report?error=` +
          encodeURIComponent(
            "Your answers were saved and your report will still be correct, but the system profile could not be updated: " +
              error.message +
              " Nothing you typed has been lost. Please report this."
          )
      );
    }
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
