import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("BiasLens Guide normal chatbot experience", () => {
  it("uses the Vercel AI SDK instead of failing when a manually-read token is absent", () => {
    const route = read("src/app/api/guide/route.ts");
    expect(route).toContain('from "ai"');
    expect(route).toContain("generateText");
    expect(route).not.toContain("if (!gatewayToken && !openAIKey)");
  });

  it("keeps the chat interface simple", () => {
    const guide = read("src/components/guide/BiasLensGuide.tsx");
    expect(guide).not.toContain("STARTER_QUESTIONS");
    expect(guide).not.toContain("speech-rate");
    expect(guide).not.toContain("Pause / Resume");
    expect(guide).toContain("Your question");
    expect(guide).toContain("Speak");
  });

  it("offers one listen control for the latest answer instead of controls on every message", () => {
    const guide = read("src/components/guide/BiasLensGuide.tsx");
    expect(guide).toContain("Listen to latest answer");
    expect(guide).not.toContain("messageActions");
  });
});
