import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { saveEnquiryToAirtable } from "@/lib/enquiries/airtable";
import { sendEnquiryNotification } from "@/lib/enquiries/notify";
import { processEnquiry } from "@/lib/enquiries/orchestrate";

export const dynamic = "force-dynamic";

function expectedToken(): string | null {
  const secret = process.env.RESEND_API_KEY;
  if (!secret) return null;
  return createHash("sha256").update(secret).digest("hex").slice(0, 24);
}

function tokenMatches(actual: string | null, expected: string): boolean {
  if (!actual || actual.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export async function GET(request: Request) {
  const expected = expectedToken();
  const actual = new URL(request.url).searchParams.get("token");

  if (!expected || !tokenMatches(actual, expected)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const enquiryReference = `BL-WEB-E2E-${Date.now()}`;
  const result = await processEnquiry(
    {
      enquiryReference,
      name: "BiasLens Test Enquiry",
      email: "hello@beaccessible.co.za",
      organisation: "BeAccessible TEST ONLY",
      region: "South Africa",
      sector: "HR and recruitment",
      role: "Deployer",
      systemProcess: "Fictional AI-assisted candidate screening workflow for end-to-end test only",
      decisionOutcome: "Fictional candidate shortlisting test",
      concern: "TEST ONLY — verify Airtable persistence and owner notification",
      existingDocumentation: "Partial",
      phone: "",
      preferredContact: "Email",
      consent: true,
      website: "",
    },
    { save: saveEnquiryToAirtable, notify: sendEnquiryNotification },
  );

  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}
