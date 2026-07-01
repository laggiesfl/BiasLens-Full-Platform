import { describe, it, expect } from "vitest";
import { classify, type Answers } from "@/lib/risk/engine";

/**
 * Safety-net tests for the bias risk classification engine.
 * These lock in the headline behaviour so future edits can't silently change
 * how a system is classified.
 */

describe("classify() — structure", () => {
  it("always returns the eight IBM bias types and six SA pillars", () => {
    const r = classify({});
    expect(r.ibm_bias_scores).toHaveLength(8);
    expect(r.sa_pillar_alignment).toHaveLength(6);
    expect(r.executive_summary.length).toBeGreaterThan(0);
    expect(Array.isArray(r.rationale)).toBe(true);
    expect(Array.isArray(r.remediation)).toBe(true);
  });

  it("gives every bias score a recognised level", () => {
    const r = classify({ decision_domain: "welfare" });
    for (const b of r.ibm_bias_scores) {
      expect(["Low", "Medium", "High"]).toContain(b.level);
    }
  });
});

describe("classify() — EU AI Act + SA tier", () => {
  it("flags biometric policing as the most serious category", () => {
    const answers: Answers = { decision_domain: "policing", biometric: true };
    const r = classify(answers);
    expect(r.sa_tier).toBe("Unacceptable");
    expect(r.eu_classification.toLowerCase()).toContain("prohibited");
  });

  it("treats welfare as a high-risk domain with an Annex III category", () => {
    const r = classify({ decision_domain: "welfare" });
    expect(r.eu_classification.toLowerCase()).toContain("high-risk");
    expect(r.eu_annex_category).toBeTruthy();
  });

  it("treats each listed high-risk domain as high-risk", () => {
    for (const domain of [
      "employment",
      "education",
      "welfare",
      "financial services",
      "policing",
      "migration",
      "justice",
      "healthcare",
    ]) {
      const r = classify({ decision_domain: domain });
      expect(r.eu_classification.toLowerCase()).toContain("high-risk");
    }
  });

  it("defaults an empty questionnaire to minimal EU risk and low SA tier", () => {
    const r = classify({});
    expect(r.eu_classification.toLowerCase()).toContain("minimal");
    expect(r.sa_tier).toBe("Low");
  });

  it("is deterministic — same answers give the same classification", () => {
    const answers: Answers = { decision_domain: "employment", eu_reach: true };
    expect(JSON.stringify(classify(answers))).toBe(
      JSON.stringify(classify(answers))
    );
  });
});
