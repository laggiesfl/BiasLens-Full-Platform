import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("homepage keyboard section navigation", () => {
  it("exposes a visible page-section navigator from the public header", () => {
    const header = read("src/components/public/PublicHeader.tsx");
    expect(header).toContain("HomeSectionNavigator");
  });

  it("provides direct and sequential movement through homepage sections", () => {
    const navigator = read("src/components/public/HomeSectionNavigator.tsx");
    expect(navigator).toContain('aria-label="Page sections"');
    expect(navigator).toContain("Previous section");
    expect(navigator).toContain("Next section");
    expect(navigator).toContain("scrollIntoView");
    expect(navigator).toContain('#main-content > section');
  });

  it("keeps the section navigator visible and gives its controls strong focus styling", () => {
    const css = read("src/app/public-accessibility-fixes.css");
    expect(css).toContain(".public-section-navigator");
    expect(css).toContain("position: sticky");
    expect(css).toContain(".public-section-nav-button:focus-visible");
    expect(css).toContain(".public-section-select:focus-visible");
  });
});
