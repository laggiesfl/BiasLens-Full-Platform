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

  it("keeps read-aloud controls directly after each real assistant answer", () => {
    const guide = read("src/components/guide/BiasLensGuide.tsx");
    const answerTextIndex = guide.indexOf("<div>{message.content}</div>");
    const answerControlsIndex = guide.indexOf("className={styles.answerControls}");

    expect(guide).toContain("Listen to this answer");
    expect(guide).toContain("Stop listening");
    expect(guide).toContain('message.role === "assistant" && message.id !== "welcome"');
    expect(answerTextIndex).toBeGreaterThan(-1);
    expect(answerControlsIndex).toBeGreaterThan(answerTextIndex);
    expect(guide).not.toContain("Listen to latest answer");
  });

  it("does not create a second scrollbar inside the conversation", () => {
    const styles = read("src/components/guide/BiasLensGuide.module.css");
    expect(styles).not.toContain("max-height: 520px");
    expect(styles).not.toContain("overflow-y: auto");
  });
});
