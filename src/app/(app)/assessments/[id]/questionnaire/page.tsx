import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuestionnaireWizard } from "@/components/QuestionnaireWizard";
import type { Role } from "@/lib/roles";
import type { Answers } from "@/lib/questionnaire";

export default async function QuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, title")
    .eq("id", id)
    .single();

  if (!assessment) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const { data: response } = await supabase
    .from("questionnaire_responses")
    .select("answers, current_step")
    .eq("assessment_id", id)
    .single();

  const role = (profile?.role ?? "civil_society") as Role;

  return (
    <div className="stack" style={{ maxWidth: "70ch" }}>
      <p style={{ margin: 0 }}>
        <Link href={`/assessments/${id}`}>← Back to assessment</Link>
      </p>
      <div className="page-header">
        <h1>Guided Bias Risk Questionnaire</h1>
        <p>
          For: <strong>{assessment.title}</strong>. Answer what you can — your
          answers save automatically as you go, so you can stop and come back any
          time.
        </p>
      </div>

      <QuestionnaireWizard
        assessmentId={id}
        role={role}
        initialAnswers={(response?.answers ?? {}) as Answers}
        initialStep={response?.current_step ?? 0}
      />
    </div>
  );
}
