import { describe, expect, it } from "vitest";
import { validateEnquiry } from "./validation";

const valid = {
  enquiryReference: "BL-WEB-12345678",
  name: "Sam Example",
  email: "sam@example.org",
  organisation: "Example Org",
  region: "South Africa",
  sector: "HR and recruitment",
  role: "Deployer",
  systemProcess: "AI-assisted candidate screening",
  decisionOutcome: "Shortlisting applicants",
  concern: "Whether disabled applicants are represented in the evidence",
  existingDocumentation: "Partial",
  phone: "",
  preferredContact: "Email",
  consent: true,
  website: "",
};

describe("validateEnquiry", () => {
  it("accepts a complete valid enquiry", () => {
    expect(validateEnquiry(valid)).toEqual({ ok: true, data: valid });
  });

  it("rejects missing consent", () => {
    const result = validateEnquiry({ ...valid, consent: false });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.consent).toBeTruthy();
  });

  it("rejects an invalid email", () => {
    const result = validateEnquiry({ ...valid, email: "not-an-email" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeTruthy();
  });

  it("rejects unsupported select values", () => {
    const result = validateEnquiry({ ...valid, region: "Mars" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.region).toBeTruthy();
  });

  it("treats a populated honeypot as spam", () => {
    const result = validateEnquiry({ ...valid, website: "https://spam.example" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form).toBe("Unable to submit this enquiry.");
  });
});
