import { createClient } from "@/lib/supabase/server";
import type { Answers } from "@/lib/questionnaire";
import type { Role } from "@/lib/roles";
import {
  getAgentAssessmentContext,
  recordAssessmentResponse,
  recordEvidencePosture,
  saveAgentMessage,
  type AssessmentAnswer,
  type EvidenceState,
} from "@/lib/agent/core-service";
import { runAssessmentTurn, type AgentTurnResult } from "@/lib/agent/orchestrator";

type ParamsContext = { params: Promise<{ id: string }> };

type AccessibleAssessment = {
  id: string;
  role_context: Role | null;
};

type LoadedAgentContext = {
  answers: Answers;
  evidenceStates?: EvidenceState[];
};

type AgentPostDependencies = {
  getAuthenticatedUser: () => Promise<{ id: string } | null>;
  getAccessibleAssessment: (assessmentId: string) => Promise<AccessibleAssessment | null>;
  recordResponse: (
    assessmentId: string,
    questionId: string,
    answer: AssessmentAnswer
  ) => Promise<unknown>;
  recordPosture: (
    assessmentId: string,
    posture: {
      evidenceId: string;
      state: string;
      rationale: string;
      sourceUri?: string | null;
    }
  ) => Promise<unknown>;
  loadContext: (assessmentId: string) => Promise<LoadedAgentContext>;
  saveMessage: (
    assessmentId: string,
    input: { role: "user" | "assistant" | "system"; content: string; questionId?: string | null }
  ) => Promise<unknown>;
  runTurn: (input: {
    role: Role;
    answers: Answers;
    evidenceStates?: EvidenceState[];
  }) => Promise<AgentTurnResult>;
};

type AgentRequestBody = {
  message?: string;
  questionId?: string;
  answer?: AssessmentAnswer;
  evidencePosture?: {
    evidenceId?: string;
    state?: string;
    rationale?: string;
    sourceUri?: string;
  };
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function isAnswer(value: unknown): value is AssessmentAnswer {
  return (
    typeof value === "string" ||
    typeof value === "boolean" ||
    (Array.isArray(value) && value.every((item) => typeof item === "string"))
  );
}

function parseBody(value: unknown): AgentRequestBody | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;

  if (body.message !== undefined && typeof body.message !== "string") return null;
  if (body.questionId !== undefined && typeof body.questionId !== "string") return null;
  if (body.answer !== undefined && !isAnswer(body.answer)) return null;

  if (body.evidencePosture !== undefined) {
    if (
      !body.evidencePosture ||
      typeof body.evidencePosture !== "object" ||
      Array.isArray(body.evidencePosture)
    ) {
      return null;
    }
    const posture = body.evidencePosture as Record<string, unknown>;
    for (const key of ["evidenceId", "state", "rationale", "sourceUri"]) {
      if (posture[key] !== undefined && typeof posture[key] !== "string") return null;
    }
  }

  return body as AgentRequestBody;
}

export function createAgentPostHandler(deps: AgentPostDependencies) {
  return async function handler(request: Request, context: ParamsContext): Promise<Response> {
    const user = await deps.getAuthenticatedUser();
    if (!user) return jsonError("Authentication required.", 401);

    const { id: assessmentId } = await context.params;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return jsonError("The request could not be read.", 400);
    }

    const body = parseBody(rawBody);
    if (!body) return jsonError("The request is not valid.", 400);

    const assessment = await deps.getAccessibleAssessment(assessmentId);
    if (!assessment) return jsonError("Assessment not found.", 404);

    try {
      if (body.questionId !== undefined || body.answer !== undefined) {
        if (!body.questionId || body.answer === undefined) {
          return jsonError("A question and answer are both required.", 400);
        }
        await deps.recordResponse(assessmentId, body.questionId, body.answer);
        await deps.saveMessage(assessmentId, {
          role: "user",
          content: "Answer submitted.",
          questionId: body.questionId,
        });
      }

      if (body.message?.trim()) {
        await deps.saveMessage(assessmentId, {
          role: "user",
          content: body.message.trim(),
        });
      }

      if (body.evidencePosture) {
        const { evidenceId, state, rationale, sourceUri } = body.evidencePosture;
        if (!evidenceId || !state || rationale === undefined) {
          return jsonError("Evidence posture details are incomplete.", 400);
        }
        await deps.recordPosture(assessmentId, {
          evidenceId,
          state,
          rationale,
          sourceUri: sourceUri ?? null,
        });
      }

      const loaded = await deps.loadContext(assessmentId);
      const result = await deps.runTurn({
        role: assessment.role_context ?? "civil_society",
        answers: loaded.answers,
        evidenceStates: loaded.evidenceStates ?? [],
      });

      await deps.saveMessage(assessmentId, {
        role: "assistant",
        content: result.message,
        questionId: result.type === "question" ? result.question.id : null,
      });

      return Response.json(result, { status: 200 });
    } catch {
      return jsonError("BiasLens could not complete this assessment step.", 500);
    }
  };
}

export async function POST(request: Request, context: ParamsContext) {
  const supabase = await createClient();

  return createAgentPostHandler({
    getAuthenticatedUser: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user ? { id: user.id } : null;
    },
    getAccessibleAssessment: async (assessmentId) => {
      const { data, error } = await supabase
        .from("assessments")
        .select("id, role_context")
        .eq("id", assessmentId)
        .single();
      if (error || !data) return null;
      return data as AccessibleAssessment;
    },
    recordResponse: (assessmentId, questionId, answer) =>
      recordAssessmentResponse(supabase, assessmentId, questionId, answer),
    recordPosture: (assessmentId, posture) =>
      recordEvidencePosture(supabase, assessmentId, posture),
    loadContext: async (assessmentId) => {
      const loaded = await getAgentAssessmentContext(supabase, assessmentId);
      const { data: evidence } = await supabase
        .from("evidence_log_entries")
        .select("evidence_state")
        .eq("assessment_id", assessmentId);

      return {
        answers: (loaded.questionnaire.answers ?? {}) as Answers,
        evidenceStates: (evidence ?? [])
          .map((item) => item.evidence_state)
          .filter(Boolean) as EvidenceState[],
      };
    },
    saveMessage: (assessmentId, input) => saveAgentMessage(supabase, assessmentId, input),
    runTurn: (input) => runAssessmentTurn(input),
  })(request, context);
}
