import { describe, expect, it } from "vitest";
import { GUIDE_LANGUAGES, STARTER_QUESTIONS, getGuideLanguage, isGuideLanguage } from "./languages";

describe("BiasLens Guide language configuration", () => {
  it("supports the six approved launch languages", () => {
    expect(GUIDE_LANGUAGES.map((language) => language.code)).toEqual(["en", "zu", "xh", "af", "fr", "es"]);
  });

  it("provides eight starter questions for every supported language", () => {
    for (const language of GUIDE_LANGUAGES) {
      expect(STARTER_QUESTIONS[language.code]).toHaveLength(8);
    }
  });

  it("rejects unsupported language codes", () => {
    expect(isGuideLanguage("en")).toBe(true);
    expect(isGuideLanguage("de")).toBe(false);
    expect(isGuideLanguage(null)).toBe(false);
  });

  it("returns the requested language configuration", () => {
    expect(getGuideLanguage("xh").label).toBe("isiXhosa");
    expect(getGuideLanguage("fr").locale).toBe("fr-FR");
  });
});
