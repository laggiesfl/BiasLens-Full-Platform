import type { EnquiryInput } from "./types";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error("BiasLens notification service is not configured");
  return value;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendEnquiryNotification(
  enquiry: EnquiryInput,
  recordId: string,
): Promise<void> {
  const apiKey = requireEnv("RESEND_API_KEY");
  const from = requireEnv("BIASLENS_NOTIFICATION_FROM");
  const to = process.env.BIASLENS_NOTIFICATION_TO || "hello@beaccessible.co.za";

  const lines = [
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Organisation: ${enquiry.organisation}`,
    `Region: ${enquiry.region}`,
    `Sector: ${enquiry.sector}`,
    `Role: ${enquiry.role}`,
    `System/process: ${enquiry.systemProcess}`,
    `Decision/outcome: ${enquiry.decisionOutcome}`,
    `Main concern: ${enquiry.concern}`,
    `Existing documentation: ${enquiry.existingDocumentation}`,
    `Preferred contact: ${enquiry.preferredContact || "Not specified"}`,
    `Phone: ${enquiry.phone || "Not supplied"}`,
    `Enquiry reference: ${enquiry.enquiryReference}`,
    `Airtable record ID: ${recordId}`,
  ];

  const html = `<h1>New BiasLens enquiry</h1><dl>${lines
    .map((line) => {
      const [label, ...rest] = line.split(": ");
      return `<dt><strong>${esc(label)}</strong></dt><dd>${esc(rest.join(": "))}</dd>`;
    })
    .join("")}</dl>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `New BiasLens enquiry — ${enquiry.organisation}`,
      text: lines.join("\n"),
      html,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("BiasLens enquiry notification failed");
}
