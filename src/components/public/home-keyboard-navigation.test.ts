import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("homepage keyboard section navigation", () => {
  it("provides a visible page sections navigation near the top", () => {
    const page = read("src/app/page.tsx");
    expect(page).toContain('aria-label="Page sections"');
    expect(page).toContain('href="#who"');
    expect(page).toContain('href="#assess"');
    expect(page).toContain('href="#offers"');
    expect(page).toContain('href="#proof"');
  });

  it("gives major content sections stable fragment targets", () => {
    const page = read("src/app/page.tsx");
    for (const id of ["why", "who", "assess", "offers", "difference", "process", "proof", "founder", "ready"]) {
      expect(page).toContain(`id="${id}"`);
    }
  });

  it("provides sequential previous and next section controls", () => {
    const page = read("src/app/page.tsx");
    expect(page).toContain("Previous section");
    expect(page).toContain("Next section");
    expect(page).toContain("public-section-nav");
  });
});
