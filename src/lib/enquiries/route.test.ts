import { describe, expect, it, vi } from "vitest";
import { processEnquiry } from "./orchestrate";

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

describe("processEnquiry", () => {
  it("does not call Airtable when validation fails", async () => {
    const save = vi.fn();
    const notify = vi.fn();
    const result = await processEnquiry({ ...valid, email: "bad" }, { save, notify });
    expect(result.status).toBe(400);
    expect(save).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });

  it("does not call notification when Airtable fails", async () => {
    const save = vi.fn().mockRejectedValue(new Error("failed"));
    const notify = vi.fn();
    const result = await processEnquiry(valid, { save, notify });
    expect(result.status).toBe(503);
    expect(notify).not.toHaveBeenCalled();
  });

  it("returns failure when notification fails", async () => {
    const save = vi.fn().mockResolvedValue({ recordId: "rec123" });
    const notify = vi.fn().mockRejectedValue(new Error("failed"));
    const result = await processEnquiry(valid, { save, notify });
    expect(result.status).toBe(503);
  });

  it("returns success only after persistence and notification both succeed", async () => {
    const save = vi.fn().mockResolvedValue({ recordId: "rec123" });
    const notify = vi.fn().mockResolvedValue(undefined);
    const result = await processEnquiry(valid, { save, notify });
    expect(result).toEqual({
      status: 201,
      body: { ok: true, enquiryReference: "BL-WEB-12345678" },
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(expect.any(Object), "rec123");
  });
});
