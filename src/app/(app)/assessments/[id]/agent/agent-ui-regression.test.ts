import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const sourcePath = path.join(
  process.cwd(),
  "src/app/(app)/assessments/[id]/agent/AgentAssessment.tsx"
);

function source() {
  return fs.readFileSync(sourcePath, "utf8");
}

describe("BiasLens Agent accessible assessment interface", () => {
  it("uses real labels and native answer controls", () => {
    const ui = source();
    expect(ui).toContain("<label htmlFor={inputId}");
    expect(ui).toContain("<button");
    expect(ui).toContain("<input");
    expect(ui).toContain("<select");
    expect(ui).toContain("<textarea");
  });

  it("announces status and errors accessibly", () => {
    const ui = source();
    expect(ui).toContain('role="status"');
    expect(ui).toContain('aria-live="polite"');
    expect(ui).toContain('role="alert"');
  });

  it("keeps Not sure as an explicit selectable answer", () => {
    expect(source()).toContain("Not sure");
  });

  it("renders Evidence State meaning as visible text", () => {
    const ui = source();
    expect(ui).toContain("Evidence posture");
    expect(ui).toContain("Unknown");
    expect(ui).toContain("Conflicted");
  });

  it("moves focus to the next question after a successful turn", () => {
    expect(source()).toContain("questionHeadingRef.current?.focus()");
  });

  it("disables submission while a request is being sent", () => {
    expect(source()).toContain("disabled={sending}");
  });
});
