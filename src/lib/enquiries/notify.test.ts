import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendEnquiryNotification } from "./notify";

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
  process.env.RESEND_API_KEY = "test-resend-key";
  process.env.BIASLENS_NOTIFICATION_FROM = "BiasLens <hello@beaccessible.co.za>";
  process.env.BIASLENS_NOTIFICATION_TO = "hello@beaccessible.co.za";
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("sendEnquiryNotification", () => {
  it("sends exactly one notification to hello@beaccessible.co.za", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email-1" }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    await sendEnquiryNotification(enquiry, "rec123");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.to).toEqual(["hello@beaccessible.co.za"]);
  });

  it("uses the enquiry reference as a stable Resend idempotency key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email-1" }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    await sendEnquiryNotification(enquiry, "rec123");

    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers["Idempotency-Key"]).toBe("biaslens-enquiry/BL-WEB-12345678");
  });

  it("includes organisation, contact, system, concern and Airtable record id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email-1" }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    await sendEnquiryNotification(enquiry, "rec123");
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.text).toContain("Example Org");
    expect(body.text).toContain("sam@example.org");
    expect(body.text).toContain("AI-assisted candidate screening");
    expect(body.text).toContain("represented in the evidence");
    expect(body.text).toContain("rec123");
  });

  it("does not include secrets or raw JSON dumps", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email-1" }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;

    await sendEnquiryNotification(enquiry, "rec123");
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.text).not.toContain("test-resend-key");
    expect(body.text).not.toContain(JSON.stringify(enquiry));
  });

  it("throws a generic error when Resend rejects the request", async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response("bad request", { status: 400 })) as typeof fetch;
    await expect(sendEnquiryNotification(enquiry, "rec123")).rejects.toThrow("BiasLens enquiry notification failed");
  });
});
