import { describe, it, expect } from "vitest";
import {
  QUESTIONNAIRE,
  visibleQuestions,
  totalSteps,
  type Answers,
} from "@/lib/questionnaire";
import type { Role } from "@/lib/roles";

describe("questionnaire configuration", () => {
  it("has at least one step and totalSteps matches the config", () => {
    expect(QUESTIONNAIRE.length).toBeGreaterThan(0);
    expect(totalSteps()).toBe(QUESTIONNAIRE.length);
  });

  it("every question has a unique id and a label", () => {
    const ids = new Set<string>();
    for (const step of QUESTIONNAIRE) {
      for (const q of step.questions) {
        expect(q.label.length).toBeGreaterThan(0);
        expect(ids.has(q.id)).toBe(false);
        ids.add(q.id);
      }
    }
  });
});

describe("visibleQuestions() — branching", () => {
  const allSteps = QUESTIONNAIRE;
  const stepOf = (id: string) =>
    allSteps.find((s) => s.questions.some((q) => q.id === id))!;

  it("shows a question with no visibleIf to everyone", () => {
    const q = allSteps[0].questions.find((x) => !x.visibleIf)!;
    const step = allSteps[0];
    const roles: Role[] = ["civil_society", "business", "government", "affected_individual"];
    for (const role of roles) {
      expect(visibleQuestions(step, role, {}).some((x) => x.id === q.id)).toBe(true);
    }
  });

  it("hides EU-conditional questions until eu_reach is true", () => {
    const business: Role = "business";
    // A question that only appears once the person says the system reaches the EU.
    const conditional = allSteps
      .flatMap((s) => s.questions)
      .find(
        (x) =>
          x.visibleIf &&
          x.visibleIf(business, { eu_reach: true }) &&
          !x.visibleIf(business, {})
      );
    expect(conditional).toBeTruthy();
    const step = stepOf(conditional!.id);
    expect(
      visibleQuestions(step, business, {}).some((x) => x.id === conditional!.id)
    ).toBe(false);
    expect(
      visibleQuestions(step, business, { eu_reach: true } as Answers).some(
        (x) => x.id === conditional!.id
      )
    ).toBe(true);
  });
});
