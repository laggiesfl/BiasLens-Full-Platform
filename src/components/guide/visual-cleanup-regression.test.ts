import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("BiasLens Guide visual cleanup", () => {
  it("does not show the floating launcher while the panel is open", () => {
    const launcher = read("src/components/guide/GuideLauncher.tsx");
    expect(launcher).toContain("{!open && (");
    expect(launcher).not.toContain('{open ? "Close BiasLens Guide" : "Ask BiasLens Guide"}');
  });

  it("cleans simple markdown markers before displaying assistant answers", () => {
    const guide = read("src/components/guide/BiasLensGuide.tsx");
    expect(guide).toContain("displayText(message.content)");
    expect(guide).toContain('replace(/\\*\\*/g, "")');
  });
});
