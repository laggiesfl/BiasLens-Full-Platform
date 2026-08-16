"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useMemo, useRef, useState } from "react";
import { DOCUMENTATION_VALUES, REGION_VALUES, ROLE_VALUES, SECTOR_VALUES } from "@/lib/enquiries/types";

function newReference(): string {
  const raw = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8).toUpperCase()
    : Math.random().toString(36).slice(2, 10).toUpperCase();
  return `BL-WEB-${raw}`;
}

export function EnquiryForm() {
  const enquiryReference = useMemo(newReference, []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    const data = new FormData(event.currentTarget);
    const payload = {
      enquiryReference,
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      organisation: String(data.get("organisation") || ""),
      region: String(data.get("region") || ""),
      sector: String(data.get("sector") || ""),
      role: String(data.get("role") || ""),
      systemProcess: String(data.get("systemProcess") || ""),
      decisionOutcome: String(data.get("decisionOutcome") || ""),
      concern: String(data.get("concern") || ""),
      existingDocumentation: String(data.get("existingDocumentation") || ""),
      phone: String(data.get("phone") || ""),
      preferredContact: String(data.get("preferredContact") || ""),
      consent: data.get("consent") === "on",
      website: String(data.get("website") || ""),
    };

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok: boolean; enquiryReference?: string; errors?: Record<string, string> };
      if (response.status === 201 && result.ok && result.enquiryReference) {
        window.location.assign(`/enquire/thank-you?ref=${encodeURIComponent(result.enquiryReference)}`);
        return;
      }
      setErrors(result.errors || { form: "We could not submit your enquiry right now. Please try again." });
      requestAnimationFrame(() => summaryRef.current?.focus());
    } catch {
      setErrors({ form: "We could not submit your enquiry right now. Please try again or email hello@beaccessible.co.za." });
      requestAnimationFrame(() => summaryRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  function activateConsentWithEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.click();
    }
  }

  const fieldError = (name: string) => errors[name];

  return (
    <form onSubmit={submit} noValidate>
      {Object.keys(errors).length > 0 && (
        <div className="public-error-summary" role="alert" tabIndex={-1} ref={summaryRef} aria-labelledby="error-summary-title">
          <h2 id="error-summary-title">Please correct the following</h2>
          <ul>
            {Object.entries(errors).map(([key, message]) => (
              <li key={key}>{key === "form" ? message : <a href={`#${key}`}>{message}</a>}</li>
            ))}
          </ul>
        </div>
      )}

      <input type="hidden" name="enquiryReference" value={enquiryReference} />
      <div className="public-honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="public-form-grid">
        <div className="public-field">
          <label htmlFor="name">Name <span aria-hidden="true">*</span></label>
          <input id="name" name="name" autoComplete="name" required aria-invalid={!!fieldError("name")} aria-describedby={fieldError("name") ? "name-error" : undefined} />
          {fieldError("name") && <p id="name-error" className="public-error">{fieldError("name")}</p>}
        </div>
        <div className="public-field">
          <label htmlFor="email">Work email <span aria-hidden="true">*</span></label>
          <input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!fieldError("email")} aria-describedby={fieldError("email") ? "email-error" : undefined} />
          {fieldError("email") && <p id="email-error" className="public-error">{fieldError("email")}</p>}
        </div>
        <div className="public-field">
          <label htmlFor="organisation">Organisation <span aria-hidden="true">*</span></label>
          <input id="organisation" name="organisation" autoComplete="organization" required aria-invalid={!!fieldError("organisation")} aria-describedby={fieldError("organisation") ? "organisation-error" : undefined} />
          {fieldError("organisation") && <p id="organisation-error" className="public-error">{fieldError("organisation")}</p>}
        </div>
        <div className="public-field">
          <label htmlFor="region">Region <span aria-hidden="true">*</span></label>
          <select id="region" name="region" defaultValue="Not yet known" required aria-invalid={!!fieldError("region")} aria-describedby={fieldError("region") ? "region-error" : undefined}>
            {REGION_VALUES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          {fieldError("region") && <p id="region-error" className="public-error">{fieldError("region")}</p>}
        </div>
        <div className="public-field">
          <label htmlFor="sector">Sector <span aria-hidden="true">*</span></label>
          <select id="sector" name="sector" defaultValue="Not yet known" required aria-invalid={!!fieldError("sector")} aria-describedby={fieldError("sector") ? "sector-error" : undefined}>
            {SECTOR_VALUES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          {fieldError("sector") && <p id="sector-error" className="public-error">{fieldError("sector")}</p>}
        </div>
        <div className="public-field">
          <label htmlFor="role">Your role in relation to the AI system <span aria-hidden="true">*</span></label>
          <select id="role" name="role" defaultValue="Not yet known" required aria-invalid={!!fieldError("role")} aria-describedby={fieldError("role") ? "role-error" : "role-help"}>
            {ROLE_VALUES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <p id="role-help" className="public-help">Choose the closest fit. “Not yet known” is acceptable.</p>
          {fieldError("role") && <p id="role-error" className="public-error">{fieldError("role")}</p>}
        </div>
        <div className="public-field public-field-full">
          <label htmlFor="systemProcess">What AI system or process do you want assessed? <span aria-hidden="true">*</span></label>
          <textarea id="systemProcess" name="systemProcess" maxLength={2000} required aria-invalid={!!fieldError("systemProcess")} aria-describedby={fieldError("systemProcess") ? "systemProcess-error" : "systemProcess-help"} />
          <p id="systemProcess-help" className="public-help">Describe one system or workflow. Do not paste employee, applicant or other person-level data.</p>
          {fieldError("systemProcess") && <p id="systemProcess-error" className="public-error">{fieldError("systemProcess")}</p>}
        </div>
        <div className="public-field public-field-full">
          <label htmlFor="decisionOutcome">What decision or outcome does it influence? <span aria-hidden="true">*</span></label>
          <textarea id="decisionOutcome" name="decisionOutcome" maxLength={2000} required aria-invalid={!!fieldError("decisionOutcome")} aria-describedby={fieldError("decisionOutcome") ? "decisionOutcome-error" : undefined} />
          {fieldError("decisionOutcome") && <p id="decisionOutcome-error" className="public-error">{fieldError("decisionOutcome")}</p>}
        </div>
        <div className="public-field public-field-full">
          <label htmlFor="concern">What is your main concern or question? <span aria-hidden="true">*</span></label>
          <textarea id="concern" name="concern" maxLength={2000} required aria-invalid={!!fieldError("concern")} aria-describedby={fieldError("concern") ? "concern-error" : undefined} />
          {fieldError("concern") && <p id="concern-error" className="public-error">{fieldError("concern")}</p>}
        </div>
        <div className="public-field">
          <label htmlFor="existingDocumentation">Existing bias / impact-assessment documentation <span aria-hidden="true">*</span></label>
          <select id="existingDocumentation" name="existingDocumentation" defaultValue="Not yet known" required aria-invalid={!!fieldError("existingDocumentation")} aria-describedby={fieldError("existingDocumentation") ? "existingDocumentation-error" : undefined}>
            {DOCUMENTATION_VALUES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          {fieldError("existingDocumentation") && <p id="existingDocumentation-error" className="public-error">{fieldError("existingDocumentation")}</p>}
        </div>
        <div className="public-field">
          <label htmlFor="preferredContact">Preferred contact method</label>
          <select id="preferredContact" name="preferredContact" defaultValue="Email">
            <option value="Email">Email</option><option value="Phone">Phone</option><option value="No preference">No preference</option>
          </select>
        </div>
        <div className="public-field public-field-full">
          <label htmlFor="phone">Phone number <span className="public-help">(optional)</span></label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </div>
      </div>

      <div className="public-field">
        <div className="public-consent">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            onKeyDown={activateConsentWithEnter}
            aria-keyshortcuts="Enter Space"
            aria-invalid={!!fieldError("consent")}
            aria-describedby={fieldError("consent") ? "consent-error" : "consent-help"}
          />
          <label htmlFor="consent">I consent to BeAccessible using the information in this form to respond to this BiasLens enquiry. <span aria-hidden="true">*</span></label>
        </div>
        <p id="consent-help" className="public-help">Use Space or Enter to select the consent checkbox. Read the <Link href="/privacy">BiasLens Privacy Notice</Link>. Do not submit sensitive person-level records through this form.</p>
        {fieldError("consent") && <p id="consent-error" className="public-error">{fieldError("consent")}</p>}
      </div>

      <div className="public-submit-row">
        <button type="submit" className="public-button public-button-primary" disabled={submitting}>{submitting ? "Submitting…" : "Submit BiasLens enquiry"}</button>
        <span className="public-help">Next step: a short qualification conversation if the enquiry is a fit.</span>
        <span className="sr-only" role="status" aria-live="polite">{submitting ? "Submitting your BiasLens enquiry." : ""}</span>
      </div>
    </form>
  );
}
