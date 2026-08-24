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

  it("keeps the hero heading prominent without overwhelming the first screen", () => {
    const css = read("src/app/home.module.css");
    expect(css).toContain("font-size: clamp(2.5rem, 5.4vw, 4.25rem)");
    expect(css).toContain("max-width: 15ch");
  });

  it("forces readable dark text throughout light homepage sections and cards", () => {
    const css = read("src/app/home.module.css");
    expect(css).toContain(".homeSectionLight h2");
    expect(css).toContain(".homeSectionWhite h2");
    expect(css).toContain(".homeSectionLight p");
    expect(css).toContain(".homeSectionWhite p");
    expect(css).toContain(".card h3");
    expect(css).toContain("color: #17324d !important");
  });

  it("uses one consistent card treatment across problem, capability, audience and proof cards", () => {
    const css = read("src/app/home.module.css");
    expect(css).toContain("border-top: 4px solid #4a78b5");
    expect(css).toContain(".capabilityCard");
    expect(css).toContain(".audienceCard");
    expect(css).toContain(".proofGrid .card");
  });

  it("keeps proof-card links and the final primary action visible on dark sections", () => {
    const css = read("src/app/home.module.css");
    expect(css).toContain(".homeSectionBlue .card a");
    expect(css).toContain("color: #1f3f6b !important");
    expect(css).toContain(".finalPanel :global(.public-button-primary)");
    expect(css).toContain("background: #ffffff");
    expect(css).toContain("color: #17324d !important");
  });
});
