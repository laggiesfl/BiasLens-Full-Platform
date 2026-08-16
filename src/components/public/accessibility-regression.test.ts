import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("public enquiry accessibility regressions", () => {
  it("keeps introductory and callout text high contrast on the light form surface", () => {
    const css = read("src/app/public-accessibility-fixes.css");
    expect(css).toContain(".public-form-card .public-lead");
    expect(css).toContain(".public-form-card .public-callout-note");
    expect(css).toContain("#17324d");
  });

  it("provides a prominent back control on the enquiry page", () => {
    const page = read("src/app/enquire/page.tsx");
    expect(page).toContain("Back to BiasLens overview");
  });

  it("lets keyboard users activate consent with Enter as well as native Space", () => {
    const form = read("src/components/public/EnquiryForm.tsx");
    expect(form).toContain("onKeyDown");
    expect(form).toContain('event.key === "Enter"');
    expect(form).toContain("Use Space or Enter");
  });

  it("supports pause, resume and stop without discarding the current utterance", () => {
    const listen = read("src/components/public/ListenToPage.tsx");
    expect(listen).toContain("speechSynthesis.pause()");
    expect(listen).toContain("speechSynthesis.resume()");
    expect(listen).toContain("Pause listening");
    expect(listen).toContain("Resume listening");
    expect(listen).toContain("Stop listening");
  });
});
