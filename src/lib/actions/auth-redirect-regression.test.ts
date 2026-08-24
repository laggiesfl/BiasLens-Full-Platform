import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const authSource = readFileSync(
  new URL("./auth.ts", import.meta.url),
  "utf-8"
);

function functionBody(name: string) {
  const start = authSource.indexOf(`export async function ${name}`);
  expect(start).toBeGreaterThanOrEqual(0);

  const nextExport = authSource.indexOf("export async function ", start + 1);
  return nextExport === -1
    ? authSource.slice(start)
    : authSource.slice(start, nextExport);
}

describe("authenticated redirect regression guard", () => {
  it("routes successful password sign-in to the authenticated dashboard", () => {
    const body = functionBody("signIn");
    expect(body).toContain('redirect("/dashboard")');
    expect(body).not.toContain('redirect("/")');
  });

  it("routes magic-link authentication to the authenticated dashboard", () => {
    const body = functionBody("signInWithMagicLink");
    expect(body).toContain("/auth/callback?next=/dashboard");
  });

  it("routes successful password updates to the authenticated dashboard", () => {
    const body = functionBody("updatePassword");
    expect(body).toContain('redirect("/dashboard")');
    expect(body).not.toContain('redirect("/")');
  });
});
