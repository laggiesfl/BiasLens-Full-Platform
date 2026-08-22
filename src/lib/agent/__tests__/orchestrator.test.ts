import { describe, expect, it } from "vitest";
import {
  runAssessmentTurn,
  validateAgentFindingText,
  validateProposedQuestionId,
} from "../orchestrator";

describe("BiasLens agent orchestration", () => {
  it("selects the next assessment question deterministically", async () => {
    const result = await runAssessmentTurn({ role: "business", answers: {} });
    expect(result.type).toBe("question");
    if (result.type === "question") {
      expect(result.question.id).toBe("system_name");
    }
  });

  it("does not allow a model to invent a question id", () => {
    expect(() =>
      validateProposedQuestionId("invented_question", "system_name")
    ).toThrow("Agent proposed a question outside the BiasLens methodology");
  });

  it.each([
    "This system is compliant.",
    "The system is unbiased.",
    "Illegal discrimination proven.",
    "ALLOW",
    "BLOCK",
  ])("rejects prohibited verdict language: %s", (text) => {
    expect(() => validateAgentFindingText(text)).toThrow(
      "BiasLens Agent cannot issue that verdict"
    );
  });

  it("preserves unknown as a legitimate evidence result", async () => {
    const result = await runAssessmentTurn({
      role: "business",
      answers: { system_name: "ScreenRight" },
      evidenceStates: ["unknown"],
    });
    expect(result.evidenceStates).toContain("unknown");
  });

  it("requires human review for consequential use with unresolved evidence", async () => {
    const result = await runAssessmentTurn({
      role: "business",
      answers: {
        system_name: "ScreenRight",
        provider: "Vendor",
        deployer: "Employer",
        vendor: "Vendor",
        purpose: "Shortlists applicants",
        decision_domain: "employment",
      },
      evidenceStates: ["conflicted"],
      forceReviewCheck: true,
    });
    expect(result.type).toBe("human_review_required");
  });
});
