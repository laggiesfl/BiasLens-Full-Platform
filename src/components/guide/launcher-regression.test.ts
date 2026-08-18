import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("BiasLens Guide launcher placement", () => {
  it("does not render the floating launcher on the dedicated /guide page", () => {
    const launcher = read("src/components/guide/GuideLauncher.tsx");
    expect(launcher).toContain("usePathname");
    expect(launcher).toContain('pathname === "/guide"');
    expect(launcher).toContain("return null");
  });

  it("locks background page scrolling while the Guide panel is open", () => {
    const launcher = read("src/components/guide/GuideLauncher.tsx");
    expect(launcher).toContain('document.body.style.overflow = "hidden"');
    expect(launcher).toContain("previousOverflow");
    expect(launcher).toContain("document.body.style.overflow = previousOverflow");
  });
});
