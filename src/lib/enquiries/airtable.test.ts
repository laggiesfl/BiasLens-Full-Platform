import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildAirtableFields, saveEnquiryToAirtable } from "./airtable";

const enquiry = {
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
} as const;

const originalFetch = global.fetch;

beforeEach(() => {
  process.env.AIRTABLE_API_TOKEN = "test-token";
  process.env.AIRTABLE_BASE_ID = "appj4M2hNcwDx2yjd";
  process.env.AIRTABLE_ENQUIRIES_TABLE_ID = "tblB1lF8cJsafECJR";
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("saveEnquiryToAirtable", () => {
  it("searches by enquiry reference before creating", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ records: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ records: [{ id: "rec-new" }] }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    await saveEnquiryToAirtable(enquiry);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toContain("filterByFormula=");
  });

  it("returns the existing record when the same reference already exists", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ records: [{ id: "rec-existing" }] }), { status: 200 }),
    );
    global.fetch = fetchMock as typeof fetch;

    await expect(saveEnquiryToAirtable(enquiry)).resolves.toEqual({ recordId: "rec-existing" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("maps website enquiries to the existing Airtable choices", () => {
    const fields = buildAirtableFields(enquiry);
    expect(fields.Source).toBe("Website");
    expect(fields.Stage).toBe("New — not yet replied");
    expect(fields["Next action"]).toBe("10-minute qualification conversation");
    expect(fields["Enquiry Reference"]).toBe(enquiry.enquiryReference);
  });

  it("throws without exposing the token when Airtable rejects the write", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("forbidden", { status: 403 }));
    global.fetch = fetchMock as typeof fetch;

    await expect(saveEnquiryToAirtable(enquiry)).rejects.toThrow("Airtable enquiry lookup failed");
    await expect(saveEnquiryToAirtable(enquiry)).rejects.not.toThrow("test-token");
  });
});
