import { NextResponse } from "next/server";
import { saveEnquiryToAirtable } from "@/lib/enquiries/airtable";
import { sendEnquiryNotification } from "@/lib/enquiries/notify";
import { validateEnquiry } from "@/lib/enquiries/validation";
import type { EnquiryInput, EnquiryValidationResult } from "@/lib/enquiries/types";

const SERVICE_ERROR =
  "We could not submit your enquiry right now. Please try again or email hello@beaccessible.co.za.";

type Dependencies = {
  save: (enquiry: EnquiryInput) => Promise<{ recordId: string }>;
  notify: (enquiry: EnquiryInput, recordId: string) => Promise<void>;
};

export async function processEnquiry(
  input: unknown,
  deps: Dependencies = { save: saveEnquiryToAirtable, notify: sendEnquiryNotification },
): Promise<
  | { status: 201; body: { ok: true; enquiryReference: string } }
  | { status: 400 | 503; body: { ok: false; errors: Record<string, string> } }
> {
  const validation: EnquiryValidationResult = validateEnquiry(input);
  if (!validation.ok) return { status: 400, body: validation };

  try {
    const { recordId } = await deps.save(validation.data);
    await deps.notify(validation.data, recordId);
    return {
      status: 201,
      body: { ok: true, enquiryReference: validation.data.enquiryReference },
    };
  } catch {
    return { status: 503, body: { ok: false, errors: { form: SERVICE_ERROR } } };
  }
}

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

  const result = await processEnquiry(input);
  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}
