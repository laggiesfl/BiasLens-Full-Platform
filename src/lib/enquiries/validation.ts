import {
  DOCUMENTATION_VALUES,
  REGION_VALUES,
  ROLE_VALUES,
  SECTOR_VALUES,
  type EnquiryInput,
  type EnquiryValidationResult,
} from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function inList<T extends readonly string[]>(value: string, list: T): value is T[number] {
  return list.includes(value as T[number]);
}

export function normaliseEnquiry(input: EnquiryInput): EnquiryInput {
  return {
    ...input,
    enquiryReference: text(input.enquiryReference, 80),
    name: text(input.name, 120),
    email: text(input.email, 254).toLowerCase(),
    organisation: text(input.organisation, 160),
    systemProcess: text(input.systemProcess, 2000),
    decisionOutcome: text(input.decisionOutcome, 2000),
    concern: text(input.concern, 2000),
    phone: text(input.phone, 40),
    preferredContact: text(input.preferredContact, 80),
    website: text(input.website, 300),
  };
}

export function validateEnquiry(input: unknown): EnquiryValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: { form: "Unable to submit this enquiry." } };
  }

  const raw = input as Record<string, unknown>;
  const candidate = {
    enquiryReference: text(raw.enquiryReference, 80),
    name: text(raw.name, 120),
    email: text(raw.email, 254).toLowerCase(),
    organisation: text(raw.organisation, 160),
    region: text(raw.region, 80),
    sector: text(raw.sector, 120),
    role: text(raw.role, 80),
    systemProcess: text(raw.systemProcess, 2000),
    decisionOutcome: text(raw.decisionOutcome, 2000),
    concern: text(raw.concern, 2000),
    existingDocumentation: text(raw.existingDocumentation, 80),
    phone: text(raw.phone, 40),
    preferredContact: text(raw.preferredContact, 80),
    consent: raw.consent === true,
    website: text(raw.website, 300),
  };

  if (candidate.website) {
    return { ok: false, errors: { form: "Unable to submit this enquiry." } };
  }

  const errors: Record<string, string> = {};
  if (!candidate.enquiryReference) errors.enquiryReference = "Enquiry reference is required.";
  if (!candidate.name) errors.name = "Name is required.";
  if (!candidate.email || !EMAIL_RE.test(candidate.email)) errors.email = "Enter a valid work email address.";
  if (!candidate.organisation) errors.organisation = "Organisation is required.";
  if (!inList(candidate.region, REGION_VALUES)) errors.region = "Select a valid region.";
  if (!inList(candidate.sector, SECTOR_VALUES)) errors.sector = "Select a valid sector.";
  if (!inList(candidate.role, ROLE_VALUES)) errors.role = "Select a valid role.";
  if (!candidate.systemProcess) errors.systemProcess = "Describe the AI system or process.";
  if (!candidate.decisionOutcome) errors.decisionOutcome = "Describe the decision or outcome it influences.";
  if (!candidate.concern) errors.concern = "Tell us your main concern or question.";
  if (!inList(candidate.existingDocumentation, DOCUMENTATION_VALUES)) {
    errors.existingDocumentation = "Select the current documentation status.";
  }
  if (!candidate.consent) errors.consent = "Consent is required so BeAccessible can respond to this enquiry.";

  if (Object.keys(errors).length) return { ok: false, errors };

  return { ok: true, data: candidate as EnquiryInput };
}
