import { NextResponse } from "next/server";
import { saveEnquiryToAirtable } from "@/lib/enquiries/airtable";
import { sendEnquiryNotification } from "@/lib/enquiries/notify";
import { processEnquiry } from "@/lib/enquiries/orchestrate";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
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
