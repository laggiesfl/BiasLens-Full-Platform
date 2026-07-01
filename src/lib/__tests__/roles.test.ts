import { describe, it, expect } from "vitest";
import { roleLabel, ROLES, ROLE_OPTIONS, type Role } from "@/lib/roles";

describe("roleLabel()", () => {
  it("returns a friendly fallback when no role is set", () => {
    expect(roleLabel(null)).toBe("No role selected");
    expect(roleLabel(undefined)).toBe("No role selected");
  });

  it("labels the admin role", () => {
    expect(roleLabel("admin")).toBe("BeAccessible administrator");
  });

  it("returns the short label for each configured role", () => {
    (Object.keys(ROLES) as Exclude<Role, "admin">[]).forEach((role) => {
      expect(roleLabel(role)).toBe(ROLES[role].shortLabel);
    });
  });
});

describe("ROLE_OPTIONS", () => {
  it("exposes every non-admin role with a label and description", () => {
    expect(ROLE_OPTIONS.length).toBe(Object.keys(ROLES).length);
    for (const opt of ROLE_OPTIONS) {
      expect(opt.label.length).toBeGreaterThan(0);
      expect(opt.description.length).toBeGreaterThan(0);
    }
  });
});
