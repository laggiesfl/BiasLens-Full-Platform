import { describe, expect, it } from "vitest";
import { getAssessmentQuestionState, getNextQuestion } from "../methodology";

describe("BiasLens agent methodology", () => {
  it("returns the first visible unanswered required question", () => {
    const next = getNextQuestion("business", {});
    expect(next?.id).toBe("system_name");
    expect(next?.label).toBe("What is the AI system called?");
  });

  it("skips questions already answered", () => {
    const next = getNextQuestion("business", { system_name: "ScreenRight" });
    expect(next?.id).toBe("provider");
  });

  it("respects questionnaire visibility rules", () => {
    const state = getAssessmentQuestionState("affected_individual", {
      system_name: "Unknown screening tool",
      provider: "Unknown",
      deployer: "Employer",
    });
    expect(state.visibleQuestions.some((q) => q.id === "vendor")).toBe(false);
  });

  it("treats unsure as answered rather than silently converting it to no", () => {
    const state = getAssessmentQuestionState("business", {
      system_name: "Tool",
      provider: "Vendor",
      deployer: "Employer",
      vendor: "Vendor",
      purpose: "Shortlists applicants",
      decision_domain: "employment",
      deployment_context: "Recruitment portal",
      affected_populations: ["People with disabilities"],
      children_vulnerable: "unsure",
    });
    expect(state.answeredQuestionIds).toContain("children_vulnerable");
  });
});
