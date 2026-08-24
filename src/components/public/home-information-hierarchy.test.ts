import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("BiasLens public homepage information hierarchy", () => {
  it("uses the approved six-section story including the hero and final proof/CTA section", () => {
    const page = read("src/app/page.tsx");

    expect(page).toContain("Know what your evidence supports — and what it does not.");
    expect(page).toContain("The problem: AI assurance needs evidence");
    expect(page).toContain("What BiasLens does");
    expect(page).toContain("Who BiasLens is for");
    expect(page).toContain("How a BiasLens assessment works");
    expect(page).toContain("Proof, boundaries and what makes BiasLens different");
    expect(page).toContain("Ready to assess one AI system?");
  });

  it("keeps detailed material available through progressive disclosure instead of extra full sections", () => {
    const page = read("src/app/page.tsx");

    expect(page).toContain("<details");
    expect(page).toContain("What BiasLens can assess");
    expect(page).toContain("Commercial pathway");
    expect(page).toContain("Why this product exists");
  });

  it("keeps the primary qualification and sign-in actions in the hero", () => {
    const page = read("src/app/page.tsx");

    expect(page).toContain('href="/enquire"');
    expect(page).toContain("Assess one AI system");
    expect(page).toContain('href="/login"');
    expect(page).toContain("Sign in to BiasLens");
  });

  it("coordinates the floating guide with the other accessibility control area", () => {
    const guideCss = read("src/components/guide/GuideLauncher.module.css");
    expect(guideCss).toContain("bottom: 5.5rem");
    expect(guideCss).toContain("top: 50%");
    expect(guideCss).toContain("transform: translateY(-50%)");
  });
});
