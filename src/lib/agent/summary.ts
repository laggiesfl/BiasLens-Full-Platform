import type { Answers } from "@/lib/questionnaire";
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

export interface SummaryEvidenceItem {
  id: string;
  label: string;
  state: EvidenceState;
  rationale?: string | null;
  sourceUri?: string | null;
}

export interface PersistedRiskSignal {
  title: string;
  rationale?: string | null;
  limitation?: string | null;
}

export interface AssessmentBiasPathway {
  title: string;
  rationale: string;
  limitation: string;
}

export interface AssessmentAgentSummary {
  systemContext: {
    systemName: string | null;
    purpose: string | null;
    decisionDomain: string | null;
  };
  answeredCount: number;
  remainingCount: number;
  establishedEvidence: SummaryEvidenceItem[];
  unknowns: SummaryEvidenceItem[];
  conflicts: SummaryEvidenceItem[];
  potentialBiasPathways: AssessmentBiasPathway[];
  recommendedNextActions: string[];
  humanReviewRequired: boolean;
  humanReviewReason: string | null;
  limitations: string[];
}

export interface BuildAssessmentAgentSummaryInput {
  answers: Answers;
  visibleQuestionIds: string[];
  evidence: SummaryEvidenceItem[];
  riskSignals: PersistedRiskSignal[];
}

function hasAnswer(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== "";
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function buildAssessmentAgentSummary(
  input: BuildAssessmentAgentSummaryInput
): AssessmentAgentSummary {
  const visibleIds = Array.from(new Set(input.visibleQuestionIds));
  const answeredCount = visibleIds.filter((id) => hasAnswer(input.answers[id])).length;
  const remainingCount = Math.max(0, visibleIds.length - answeredCount);

  const establishedEvidence = input.evidence.filter((item) => item.state === "established");
  const unknowns = input.evidence.filter((item) => item.state === "unknown");
  const conflicts = input.evidence.filter((item) => item.state === "conflicted");

  const potentialBiasPathways = input.riskSignals.map((signal) => ({
    title: signal.title,
    rationale:
      signal.rationale?.trim() ||
      "The persisted record identifies this as a potential pathway, but a fuller rationale has not yet been established.",
    limitation:
      signal.limitation?.trim() ||
      "This is a signal for investigation, not proof of a discriminatory outcome or legal breach.",
  }));

  const domain = String(input.answers.decision_domain ?? "").toLowerCase();
  const hasUnresolvedEvidence = unknowns.length > 0 || conflicts.length > 0;
  const humanReviewRequired = CONSEQUENTIAL_DOMAINS.has(domain) && hasUnresolvedEvidence;

  const recommendedNextActions: string[] = [];
  if (unknowns.length) {
    recommendedNextActions.push("Obtain or generate evidence for the material Unknown items.");
  }
  if (conflicts.length) {
    recommendedNextActions.push("Resolve material conflicts between evidence sources before stronger reliance.");
  }
  if (potentialBiasPathways.length) {
    recommendedNextActions.push("Investigate the recorded potential bias pathways with appropriate evidence and affected-group analysis.");
  }
  if (humanReviewRequired) {
    recommendedNextActions.push("Escalate the unresolved consequential-use findings for meaningful human review.");
  }

  const limitations = [
    "This summary is an evidence and governance record; it is not an automatic legal or compliance determination.",
    "Potential bias pathways are investigation signals and do not by themselves prove discrimination.",
  ];
  if (unknowns.length) {
    limitations.push("Material evidence remains Unknown and should not be presented as established fact.");
  }
  if (conflicts.length) {
    limitations.push("Material evidence is Conflicted and should be resolved before stronger conclusions are made.");
  }

  return {
    systemContext: {
      systemName:
        typeof input.answers.system_name === "string" && input.answers.system_name.trim()
          ? input.answers.system_name.trim()
          : null,
      purpose:
        typeof input.answers.purpose === "string" && input.answers.purpose.trim()
          ? input.answers.purpose.trim()
          : null,
      decisionDomain: domain || null,
    },
    answeredCount,
    remainingCount,
    establishedEvidence,
    unknowns,
    conflicts,
    potentialBiasPathways,
    recommendedNextActions: unique(recommendedNextActions),
    humanReviewRequired,
    humanReviewReason: humanReviewRequired
      ? "Unresolved Unknown or Conflicted evidence affects a consequential decision domain and requires human judgement before stronger conclusions are made."
      : null,
    limitations: unique(limitations),
  };
}
