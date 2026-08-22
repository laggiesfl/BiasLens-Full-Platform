import type { Role } from "@/lib/roles";
import type { Answers } from "@/lib/questionnaire";
import { getNextQuestion } from "./methodology";
import type { EvidenceState } from "./core-service";

const CONSEQUENTIAL_DOMAINS = new Set([
  "employment",
  "welfare",
  "policing",
  "healthcare",
  "financial services",
  "migration",
  "justice",
]);

const PROHIBITED_VERDICTS = [
  /\bcompliant\b/i,
  /\bunbiased\b/i,
  /illegal discrimination proven/i,
  /^\s*ALLOW\s*$/i,
  /^\s*BLOCK\s*$/i,
];

export type AgentTurnResult =
  | {
      type: "question";
      message: string;
      question: NonNullable<ReturnType<typeof getNextQuestion>>;
      evidenceStates: EvidenceState[];
    }
  | {
      type: "summary_ready";
      message: string;
      evidenceStates: EvidenceState[];
    }
  | {
      type: "human_review_required";
      message: string;
      reason: string;
      evidenceStates: EvidenceState[];
    };

export interface RunAssessmentTurnInput {
  role: Role;
  answers: Answers;
  evidenceStates?: EvidenceState[];
  forceReviewCheck?: boolean;
}

export function validateProposedQuestionId(
  proposedQuestionId: string,
  permittedQuestionId: string
) {
  if (proposedQuestionId !== permittedQuestionId) {
    throw new Error("Agent proposed a question outside the BiasLens methodology");
  }
  return proposedQuestionId;
}

export function validateAgentFindingText(text: string) {
  if (PROHIBITED_VERDICTS.some((pattern) => pattern.test(text))) {
    throw new Error("BiasLens Agent cannot issue that verdict");
  }
  return text;
}

function needsHumanReview(
  answers: Answers,
  evidenceStates: EvidenceState[]
): boolean {
  const domain = String(answers.decision_domain ?? "").toLowerCase();
  const unresolved = evidenceStates.some(
    (state) => state === "unknown" || state === "conflicted"
  );
  return CONSEQUENTIAL_DOMAINS.has(domain) && unresolved;
}

export async function runAssessmentTurn(
  input: RunAssessmentTurnInput
): Promise<AgentTurnResult> {
  const evidenceStates = [...(input.evidenceStates ?? [])];

  if (input.forceReviewCheck && needsHumanReview(input.answers, evidenceStates)) {
    return {
      type: "human_review_required",
      message:
        "This assessment has unresolved evidence in a consequential decision context and needs human review.",
      reason: "Consequential use with Unknown or Conflicted evidence",
      evidenceStates,
    };
  }

  const question = getNextQuestion(input.role, input.answers);
  if (question) {
    return {
      type: "question",
      message: question.help
        ? `${question.label} ${question.help}`
        : question.label,
      question,
      evidenceStates,
    };
  }

  if (needsHumanReview(input.answers, evidenceStates)) {
    return {
      type: "human_review_required",
      message:
        "The questionnaire is complete, but unresolved evidence requires human review before stronger conclusions are made.",
      reason: "Consequential use with Unknown or Conflicted evidence",
      evidenceStates,
    };
  }

  return {
    type: "summary_ready",
    message:
      "The guided questions are complete. BiasLens can now prepare a structured evidence-based assessment summary.",
    evidenceStates,
  };
}
