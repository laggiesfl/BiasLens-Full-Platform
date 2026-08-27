import { describe, expect, it } from "vitest";
import { buildAssessmentAgentSummary } from "../summary";

const evidence = [
  {
    id: "ev-1",
    label: "Vendor validation report",
    state: "established" as const,
    rationale: "Report received and source recorded.",
  },
  {
    id: "ev-2",
    label: "Disability subgroup outcomes",
    state: "unknown" as const,
    rationale: "No subgroup evidence supplied.",
  },
  {
    id: "ev-3",
    label: "Fairness assurance claim",
    state: "conflicted" as const,
    rationale: "Vendor assurance conflicts with incomplete validation evidence.",
  },
];

describe("BiasLens evidence-grounded agent summary", () => {
  it("keeps Established, Unknown and Conflicted evidence in separate first-class sections", () => {
    const summary = buildAssessmentAgentSummary({
      answers: { system_name: "ScreenRight", decision_domain: "employment" },
      visibleQuestionIds: ["system_name", "decision_domain", "purpose"],
      evidence,
      riskSignals: [],
    });

    expect(summary.establishedEvidence).toHaveLength(1);
    expect(summary.unknowns).toHaveLength(1);
    expect(summary.conflicts).toHaveLength(1);
    expect(summary.unknowns[0].label).toBe("Disability subgroup outcomes");
    expect(summary.conflicts[0].label).toBe("Fairness assurance claim");
  });

  it("gives every potential bias pathway an explicit rationale and limitation", () => {
    const summary = buildAssessmentAgentSummary({
      answers: { system_name: "ScreenRight", decision_domain: "employment" },
      visibleQuestionIds: ["system_name", "decision_domain"],
      evidence,
      riskSignals: [
        {
          title: "Disability outcome evidence gap",
          rationale: "No disaggregated disability outcome evidence is recorded.",
        },
      ],
    });

    expect(summary.potentialBiasPathways[0].rationale).toBeTruthy();
    expect(summary.potentialBiasPathways[0].limitation).toBeTruthy();
  });

  it("does not expose a biased or not-biased verdict field", () => {
    const summary = buildAssessmentAgentSummary({
      answers: {},
      visibleQuestionIds: [],
      evidence: [],
      riskSignals: [],
    });

    expect("biased" in summary).toBe(false);
    expect("verdict" in summary).toBe(false);
  });

  it("requires a human-review reason when unresolved evidence affects a consequential domain", () => {
    const summary = buildAssessmentAgentSummary({
      answers: { decision_domain: "employment" },
      visibleQuestionIds: ["decision_domain"],
      evidence,
      riskSignals: [],
    });

    expect(summary.humanReviewRequired).toBe(true);
    expect(summary.humanReviewReason).toMatch(/unresolved/i);
  });

  it("calculates answered and remaining questions from the persisted answer set", () => {
    const summary = buildAssessmentAgentSummary({
      answers: { system_name: "ScreenRight", purpose: "Shortlisting" },
      visibleQuestionIds: ["system_name", "purpose", "decision_domain"],
      evidence: [],
      riskSignals: [],
    });

    expect(summary.answeredCount).toBe(2);
    expect(summary.remainingCount).toBe(1);
  });

  it("keeps a 28/28 guided intake with zero Evidence State records open for evidence review", () => {
    const visibleQuestionIds = Array.from({ length: 28 }, (_, index) => `q-${index + 1}`);
    const answers = Object.fromEntries(
      visibleQuestionIds.map((questionId) => [questionId, "Recorded response"])
    );

    const summary = buildAssessmentAgentSummary({
      answers,
      visibleQuestionIds,
      evidence: [],
      riskSignals: [],
    });

    expect(summary.answeredCount).toBe(28);
    expect(summary.remainingCount).toBe(0);
    expect(summary.evidenceReviewRequired).toBe(true);
    expect(summary.recommendedNextActions).toContain(
      "Review and classify supporting evidence in BiasLens Core before treating the evidence assessment as complete."
    );
    expect(summary.limitations).toContain(
      "Guided questionnaire completion does not mean the BiasLens evidence assessment is complete."
    );
  });

  it.each(["established", "derived", "inferred", "unknown", "conflicted"] as const)(
    "does not use the no-evidence completion state when %s evidence is recorded",
    (state) => {
      const summary = buildAssessmentAgentSummary({
        answers: { system_name: "ScreenRight" },
        visibleQuestionIds: ["system_name"],
        evidence: [{ id: `ev-${state}`, label: `${state} record`, state }],
        riskSignals: [],
      });

      expect(summary.evidenceReviewRequired).toBe(false);
    }
  );
});
