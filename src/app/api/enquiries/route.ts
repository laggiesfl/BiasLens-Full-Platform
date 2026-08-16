import { NextResponse } from "next/server";
import { saveEnquiryToAirtable } from "@/lib/enquiries/airtable";
import { sendEnquiryNotification } from "@/lib/enquiries/notify";
import { processEnquiry } from "@/lib/enquiries/orchestrate";

const deps = {
  save: saveEnquiryToAirtable,
  notify: sendEnquiryNotification,
};

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: { form: "Unable to submit this enquiry." } },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = await processEnquiry(input, deps);
  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}
