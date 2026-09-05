import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Answers } from "@/lib/questionnaire";
import type { Role } from "@/lib/roles";
import type { EvidenceState } from "@/lib/agent/core-service";
import { getAssessmentQuestionState } from "@/lib/agent/methodology";
import { runAssessmentTurn } from "@/lib/agent/orchestrator";
import { buildAssessmentAgentSummary } from "@/lib/agent/summary";
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
      .select("id, document_name, evidence_state, evidence_state_rationale, source_uri")
      .eq("assessment_id", id),
  ]);

  const answers = (questionnaire?.answers ?? {}) as Answers;
  const role = (assessment.role_context ?? "civil_society") as Role;
  const evidenceItems = (evidence ?? [])
    .filter((item) => item.evidence_state)
    .map((item) => ({
      id: item.id,
      label: item.document_name,
      state: item.evidence_state as EvidenceState,
      rationale: item.evidence_state_rationale,
      sourceUri: item.source_uri,
    }));
  const evidenceStates = evidenceItems.map((item) => item.state);

  const initialTurn = await runAssessmentTurn({
    role,
    answers,
    evidenceStates,
  });

  const questionState = getAssessmentQuestionState(role, answers);
  const initialSummary =
    initialTurn.type === "question"
      ? null
      : buildAssessmentAgentSummary({
          answers,
          visibleQuestionIds: questionState.visibleQuestions.map((question) => question.id),
          evidence: evidenceItems,
          riskSignals: [],
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
        initialSummary={initialSummary}
      />
    </div>
  );
}
