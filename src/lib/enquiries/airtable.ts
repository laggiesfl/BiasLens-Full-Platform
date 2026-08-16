import type { EnquiryInput } from "./types";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error("BiasLens enquiry service is not configured");
  return value;
}

function airtableUrl(): string {
  const baseId = process.env.AIRTABLE_BASE_ID || "appj4M2hNcwDx2yjd";
  const tableId = process.env.AIRTABLE_ENQUIRIES_TABLE_ID || "tblB1lF8cJsafECJR";
  return `https://api.airtable.com/v0/${baseId}/${tableId}`;
}

function escapeFormulaString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\"/g, '\\"');
}

export function buildAirtableFields(enquiry: EnquiryInput): Record<string, string> {
  return {
    "Enquiry Reference": enquiry.enquiryReference,
    Name: enquiry.name,
    Email: enquiry.email,
    Organisation: enquiry.organisation,
    "Date received": new Date().toISOString().slice(0, 10),
    Source: "Website",
    Region: enquiry.region,
    Sector: enquiry.sector,
    "Their role": enquiry.role,
    "Existing documentation": enquiry.existingDocumentation,
    Stage: "New — not yet replied",
    "Next action": "10-minute qualification conversation",
    Notes: [
      `System/process: ${enquiry.systemProcess}`,
      `Decision/outcome: ${enquiry.decisionOutcome}`,
      `Main concern: ${enquiry.concern}`,
      `Preferred contact: ${enquiry.preferredContact || "Not specified"}`,
      `Phone: ${enquiry.phone || "Not supplied"}`,
    ].join("\n"),
  };
}

export async function saveEnquiryToAirtable(
  enquiry: EnquiryInput,
): Promise<{ recordId: string }> {
  const token = requireEnv("AIRTABLE_API_TOKEN");
  const baseUrl = airtableUrl();
  const formula = `{Enquiry Reference}=\"${escapeFormulaString(enquiry.enquiryReference)}\"`;
  const searchUrl = `${baseUrl}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;

  const searchResponse = await fetch(searchUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!searchResponse.ok) throw new Error("Airtable enquiry lookup failed");
  const searchBody = (await searchResponse.json()) as { records?: Array<{ id: string }> };
  if (searchBody.records?.[0]?.id) return { recordId: searchBody.records[0].id };

  const createResponse = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: [{ fields: buildAirtableFields(enquiry) }], typecast: false }),
    cache: "no-store",
  });

  if (!createResponse.ok) throw new Error("Airtable enquiry write failed");
  const created = (await createResponse.json()) as { records?: Array<{ id: string }> };
  const recordId = created.records?.[0]?.id;
  if (!recordId) throw new Error("Airtable enquiry write failed");
  return { recordId };
}
