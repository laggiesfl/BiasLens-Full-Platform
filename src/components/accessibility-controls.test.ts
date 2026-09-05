import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("BiasLens accessibility controls", () => {
  it("mounts display accessibility controls across the application", () => {
    const layout = read("src/app/layout.tsx");
    const controls = read("src/components/AccessibilityControls.tsx");
    expect(layout).toContain("<AccessibilityControls />");
    for (const label of ["A- Decrease", "A Reset", "A+ Increase", "High contrast", "Reduce motion", "Reset accessibility"]) {
      expect(controls).toContain(label);
    }
  });

  it("persists text sizing from 80 to 200 percent in ten percent steps", () => {
    const controls = read("src/components/AccessibilityControls.tsx");
    expect(controls).toContain("biaslens-text-size");
    expect(controls).toMatch(/Math\.min\([^,]+\+\s*10,\s*200\)/);
    expect(controls).toMatch(/Math\.max\([^,]+-\s*10,\s*80\)/);
  });

  it("keeps high contrast and reduced motion persistent without disabling browser zoom", () => {
    const controls = read("src/components/AccessibilityControls.tsx");
    const css = read("src/app/globals.css");
    expect(controls).toContain("biaslens-high-contrast");
    expect(controls).toContain("biaslens-reduce-motion");
    expect(css).toContain("html.biaslens-high-contrast");
    expect(css).toContain("html.biaslens-reduce-motion");
    expect(read("src/app/layout.tsx")).not.toContain("maximumScale");
  });

  it("sanitises public read aloud so controls and form fields are excluded", () => {
    const listen = read("src/components/public/ListenToPage.tsx");
    expect(listen).toContain("cloneNode(true)");
    expect(listen).toContain('input, textarea, select, button, [data-speech-exclude]');
    expect(listen).toContain("speechSynthesis.pause()");
    expect(listen).toContain("speechSynthesis.resume()");
    expect(listen).toContain("Stop listening");
  });
});
