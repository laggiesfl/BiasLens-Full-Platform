import type { EnquiryInput } from "./types";
import { validateEnquiry } from "./validation";

export const SERVICE_ERROR =
  "We could not submit your enquiry right now. Please try again or email hello@beaccessible.co.za.";

export type EnquiryDependencies = {
  save: (enquiry: EnquiryInput) => Promise<{ recordId: string }>;
  notify: (enquiry: EnquiryInput, recordId: string) => Promise<void>;
};

export type EnquiryProcessResult =
  | { status: 201; body: { ok: true; enquiryReference: string } }
  | { status: 400 | 503; body: { ok: false; errors: Record<string, string> } };

export async function processEnquiry(
  input: unknown,
  deps: EnquiryDependencies,
): Promise<EnquiryProcessResult> {
  const validation = validateEnquiry(input);
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
