import { describe, expect, it } from "vitest";
import {
  assertEvidenceState,
  assertKnownQuestionId,
  buildAgentActivityMetadata,
  mergeAssessmentAnswer,
} from "../core-service";

describe("BiasLens agent core persistence boundary", () => {
  it("rejects an unknown questionnaire id", () => {
    expect(() => assertKnownQuestionId("invented_question")).toThrow(
      "Unknown BiasLens question id"
    );
  });

  it("rejects an invalid Evidence State", () => {
    expect(() => assertEvidenceState("verified")).toThrow(
      "Invalid BiasLens Evidence State"
    );
  });

  it("preserves the literal unsure answer", () => {
    const answers = mergeAssessmentAnswer(
      { system_name: "ScreenRight" },
      "children_vulnerable",
      "unsure"
    );

    expect(answers.children_vulnerable).toBe("unsure");
  });

  it("marks persisted actions as originating from the BiasLens Agent", () => {
    expect(buildAgentActivityMetadata("system_name")).toEqual({
      question_id: "system_name",
      source: "biaslens_agent",
    });
  });
});
