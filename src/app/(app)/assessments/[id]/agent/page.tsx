import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Answers } from "@/lib/questionnaire";
import type { Role } from "@/lib/roles";
import type { EvidenceState } from "@/lib/agent/core-service";
import { runAssessmentTurn } from "@/lib/agent/orchestrator";
import { BackLink } from "@/components/BackLink";
import { AgentAssessment } from "./AgentAssessment";

export default async function BiasLensAgentAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, title, role_context")
    .eq("id", id)
    .single();

  if (!assessment) notFound();

  const [{ data: questionnaire }, { data: evidence }] = await Promise.all([
    supabase
      .from("questionnaire_responses")
      .select("answers")
      .eq("assessment_id", id)
      .single(),
    supabase
      .from("evidence_log_entries")
      .select("evidence_state")
      .eq("assessment_id", id),
  ]);

  const answers = (questionnaire?.answers ?? {}) as Answers;
  const evidenceStates = (evidence ?? [])
    .map((item) => item.evidence_state)
    .filter(Boolean) as EvidenceState[];

  const initialTurn = await runAssessmentTurn({
    role: (assessment.role_context ?? "civil_society") as Role,
    answers,
    evidenceStates,
  });

  return (
    <div className="stack">
      <BackLink href={`/assessments/${id}`} label="Back to assessment overview" />
      <AgentAssessment
        assessmentId={id}
        assessmentTitle={assessment.title}
        initialTurn={initialTurn}
        initialAnswers={answers}
        initialEvidenceStates={evidenceStates}
      />
    </div>
  );
}
