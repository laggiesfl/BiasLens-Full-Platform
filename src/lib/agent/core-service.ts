import type { SupabaseClient } from "@supabase/supabase-js";
import { QUESTIONNAIRE, type Answers } from "@/lib/questionnaire";

export const EVIDENCE_STATES = [
  "established",
  "derived",
  "inferred",
  "unknown",
  "conflicted",
] as const;

export type EvidenceState = (typeof EVIDENCE_STATES)[number];
export type AgentMessageRole = "user" | "assistant" | "system";
export type AssessmentAnswer = string | string[] | boolean;

const KNOWN_QUESTION_IDS = new Set(
  QUESTIONNAIRE.flatMap((step) => step.questions.map((question) => question.id))
);

export function assertKnownQuestionId(questionId: string): string {
  if (!KNOWN_QUESTION_IDS.has(questionId)) {
    throw new Error("Unknown BiasLens question id");
  }
  return questionId;
}

export function assertEvidenceState(value: string): EvidenceState {
  if (!EVIDENCE_STATES.includes(value as EvidenceState)) {
    throw new Error("Invalid BiasLens Evidence State");
  }
  return value as EvidenceState;
}

export function mergeAssessmentAnswer(
  current: Answers,
  questionId: string,
  answer: AssessmentAnswer
): Answers {
  assertKnownQuestionId(questionId);
  return { ...current, [questionId]: answer };
}

export function buildAgentActivityMetadata(questionId: string) {
  assertKnownQuestionId(questionId);
  return { question_id: questionId, source: "biaslens_agent" as const };
}

async function requireUser(client: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    throw new Error("Authentication required");
  }
  return user;
}

async function ensureAgentSession(client: SupabaseClient, assessmentId: string) {
  const user = await requireUser(client);
  const { data, error } = await client
    .from("agent_assessment_sessions")
    .upsert(
      {
        assessment_id: assessmentId,
        owner_id: user.id,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "assessment_id,owner_id" }
    )
    .select("id, status, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error("Could not open the BiasLens Agent session");
  }
  return { user, session: data };
}

export async function getAgentAssessmentContext(
  client: SupabaseClient,
  assessmentId: string
) {
  const user = await requireUser(client);

  const { data: assessment, error: assessmentError } = await client
    .from("assessments")
    .select("id, title, role_context, status")
    .eq("id", assessmentId)
    .single();

  if (assessmentError || !assessment) {
    throw new Error("Assessment not available");
  }

  const [{ data: questionnaire }, { data: systemProfile }] = await Promise.all([
    client
      .from("questionnaire_responses")
      .select("answers, current_step, completed")
      .eq("assessment_id", assessmentId)
      .single(),
    client
      .from("ai_system_profiles")
      .select("*")
      .eq("assessment_id", assessmentId)
      .single(),
  ]);

  const { session } = await ensureAgentSession(client, assessmentId);
  const { data: messages, error: messagesError } = await client
    .from("agent_messages")
    .select("id, role, content, question_id, created_at")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error("Could not load the BiasLens Agent conversation");
  }

  return {
    userId: user.id,
    assessment,
    questionnaire: questionnaire ?? { answers: {}, current_step: 0, completed: false },
    systemProfile: systemProfile ?? null,
    session,
    messages: messages ?? [],
  };
}

export async function saveAgentMessage(
  client: SupabaseClient,
  assessmentId: string,
  input: {
    role: AgentMessageRole;
    content: string;
    questionId?: string | null;
  }
) {
  const content = input.content.trim();
  if (!content) throw new Error("Agent message content is required");
  if (input.questionId) assertKnownQuestionId(input.questionId);

  const { session } = await ensureAgentSession(client, assessmentId);
  const { data, error } = await client
    .from("agent_messages")
    .insert({
      session_id: session.id,
      role: input.role,
      content,
      question_id: input.questionId ?? null,
    })
    .select("id, role, content, question_id, created_at")
    .single();

  if (error || !data) {
    throw new Error("Could not save the BiasLens Agent message");
  }
  return data;
}

export async function recordAssessmentResponse(
  client: SupabaseClient,
  assessmentId: string,
  questionId: string,
  answer: AssessmentAnswer
) {
  assertKnownQuestionId(questionId);
  const user = await requireUser(client);

  const { data: current, error: readError } = await client
    .from("questionnaire_responses")
    .select("answers")
    .eq("assessment_id", assessmentId)
    .single();

  if (readError || !current) {
    throw new Error("Could not load assessment responses");
  }

  const answers = mergeAssessmentAnswer((current.answers ?? {}) as Answers, questionId, answer);
  const { error: updateError } = await client
    .from("questionnaire_responses")
    .update({ answers })
    .eq("assessment_id", assessmentId);

  if (updateError) {
    throw new Error("Could not save the assessment response");
  }

  const { error: activityError } = await client.from("activity_log").insert({
    actor_id: user.id,
    action: "agent_assessment_response_recorded",
    entity_type: "assessment",
    entity_id: assessmentId,
    metadata: buildAgentActivityMetadata(questionId),
  });

  if (activityError) {
    throw new Error("Assessment response saved but audit logging failed");
  }

  return answers;
}

export async function recordEvidencePosture(
  client: SupabaseClient,
  assessmentId: string,
  input: {
    evidenceId: string;
    state: string;
    rationale: string;
    sourceUri?: string | null;
  }
) {
  const evidenceState = assertEvidenceState(input.state);
  const user = await requireUser(client);
  const rationale = input.rationale.trim();

  const update: Record<string, string | null> = {
    evidence_state: evidenceState,
    evidence_state_rationale: rationale || null,
  };
  if (input.sourceUri !== undefined) {
    update.source_uri = input.sourceUri?.trim() || null;
  }

  const { error } = await client
    .from("evidence_log_entries")
    .update(update)
    .eq("id", input.evidenceId)
    .eq("assessment_id", assessmentId);

  if (error) {
    throw new Error("Could not save the BiasLens Evidence State");
  }

  const { error: activityError } = await client.from("activity_log").insert({
    actor_id: user.id,
    action: "agent_evidence_state_recorded",
    entity_type: "assessment",
    entity_id: assessmentId,
    metadata: {
      evidence_id: input.evidenceId,
      evidence_state: evidenceState,
      source: "biaslens_agent",
    },
  });

  if (activityError) {
    throw new Error("Evidence State saved but audit logging failed");
  }

  return { evidenceId: input.evidenceId, evidenceState };
}
