# BiasLens Public Landing Page and Qualification Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `https://biaslens.beaccessible.co.za/` into a polished public BiasLens commercial landing page with an accessible “Assess one AI system” qualification flow that writes to the existing Airtable pipeline, emails `hello@beaccessible.co.za`, and leaves the authenticated BiasLens platform intact.

**Architecture:** Replace only the current root redirect with a public Next.js App Router page. Add a public `/enquire` form backed by a server-only `/api/enquiries` route that validates input, creates an idempotent Airtable enquiry, sends a Resend notification, and returns success only when both operations succeed. Keep `/login`, `/signup`, `/onboarding`, `/dashboard`, assessment routes, Supabase auth/RLS, and middleware protections unchanged.

**Tech Stack:** Existing Next.js 16.2.9 App Router + React 19 + TypeScript 5.5 + existing CSS design tokens + Supabase auth + Airtable REST API + Resend REST API + Vitest 2.1.8 + Vercel.

## Global Constraints

- Keep the public landing page and authenticated BiasLens platform in the existing `laggiesfl/BiasLens-Full-Platform` repository and Vercel project; do not introduce Netlify.
- Primary domain remains `https://biaslens.beaccessible.co.za`.
- Primary proposition: “Know what your evidence supports — and what it does not.”
- Primary CTA: “Assess one AI system”.
- BiasLens identifies evidence/signals requiring investigation; it does not make legal findings of discrimination.
- BiasLens assesses systems, processes and aggregated outcomes; it is not employee monitoring, productivity surveillance or individual scoring.
- Algorithm Defence File means governance evidence, not legal immunity.
- Minimum accessibility gate: WCAG 2.1 AA; target WCAG 2.2 AAA where feasible.
- No employee/applicant datasets or sensitive person-level records in the marketing enquiry flow.
- Airtable and Resend credentials must remain server-side.
- Use the existing `Logo` component and official `/public/beaccessible-logo.png`; do not invent a new BiasLens logo.
- No decorative people, body parts, silhouettes or animals.
- Form success must not be shown unless Airtable persistence and notification email both succeed.
- Do not change the BiasLens risk engine, assessment engine, payment flow, or authenticated information architecture in this release.

---

## File Structure

**Create**
- `src/components/public/ListenToPage.tsx` — browser speech-synthesis control only.
- `src/components/public/PublicHeader.tsx` — public navigation, logo, CTA and sign-in entry.
- `src/components/public/EnquiryForm.tsx` — accessible client form and error handling.
- `src/app/enquire/page.tsx` — qualification form route.
- `src/app/enquire/thank-you/page.tsx` — success confirmation.
- `src/app/api/enquiries/route.ts` — public POST endpoint; server-only orchestration.
- `src/lib/enquiries/types.ts` — form/domain types and fixed option values.
- `src/lib/enquiries/validation.ts` — pure validation and sanitisation.
- `src/lib/enquiries/airtable.ts` — Airtable persistence and idempotency.
- `src/lib/enquiries/notify.ts` — Resend notification sender.
- `src/lib/enquiries/validation.test.ts` — validation tests.
- `src/lib/enquiries/airtable.test.ts` — Airtable payload/idempotency tests with mocked fetch.
- `src/lib/enquiries/notify.test.ts` — Resend request tests with mocked fetch.
- `src/lib/enquiries/route.test.ts` — orchestration contract tests at helper level.

**Modify**
- `src/app/page.tsx` — replace auth redirect with public landing page.
- `src/app/globals.css` — add scoped `.public-*` styles using existing BeAccessible tokens/patterns.
- `src/app/layout.tsx` — update root metadata for public BiasLens discovery if current metadata is generic.
- `.env.example` — document server-only Airtable and Resend configuration.
- `README.md` — document public routes and production environment variables.

**Operational change outside Git**
- Airtable `Enquiries` table (`tblB1lF8cJsafECJR`): add one single-line text field named `Enquiry Reference` for idempotency before enabling production submissions.

---

### Task 1: Lock the enquiry domain model and validation

**Files:**
- Create: `src/lib/enquiries/types.ts`
- Create: `src/lib/enquiries/validation.ts`
- Test: `src/lib/enquiries/validation.test.ts`

**Interfaces:**
- Produces: `EnquiryInput`, `EnquiryValidationResult`, `validateEnquiry(input: unknown): EnquiryValidationResult`, `normaliseEnquiry(input: EnquiryInput): EnquiryInput`.
- Region values must map exactly to Airtable: `EU / EEA`, `United Kingdom`, `South Africa`, `Other`, `Not yet known`.
- Sector values must map exactly to Airtable: `HR and recruitment`, `Financial services`, `Healthcare`, `Public sector and social protection`, `Education and vocational training`, `Other`, `Not yet known`.
- Regulatory-role values must map exactly to Airtable: `Deployer`, `Provider`, `Both`, `Adviser or consultant`, `Not yet known`.
- Existing-documentation values must map exactly to Airtable: `None`, `Partial`, `Substantial`, `Not yet known`.

- [ ] **Step 1: Write the failing validation tests**

```ts
import { describe, expect, it } from "vitest";
import { validateEnquiry } from "./validation";

const valid = {
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
};

describe("validateEnquiry", () => {
  it("accepts a complete valid enquiry", () => {
    expect(validateEnquiry(valid)).toEqual({ ok: true, data: valid });
  });

  it("rejects missing consent", () => {
    const result = validateEnquiry({ ...valid, consent: false });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.consent).toBeTruthy();
  });

  it("rejects an invalid email", () => {
    const result = validateEnquiry({ ...valid, email: "not-an-email" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.email).toBeTruthy();
  });

  it("rejects unsupported select values", () => {
    const result = validateEnquiry({ ...valid, region: "Mars" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.region).toBeTruthy();
  });

  it("treats a populated honeypot as spam", () => {
    const result = validateEnquiry({ ...valid, website: "https://spam.example" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form).toBe("Unable to submit this enquiry.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/enquiries/validation.test.ts`

Expected: FAIL because `./validation` does not exist.

- [ ] **Step 3: Implement the exact types and validation**

Create string-literal arrays for the Airtable-compatible option values; trim all text fields; cap free-text lengths (`name` 120, `email` 254, `organisation` 160, system/decision/concern 2000 each, phone 40, preferredContact 80); reject empty required fields; require a conventional email shape; require `consent === true`; reject non-empty `website` honeypot with the generic form error above.

Return shape:

```ts
export type EnquiryValidationResult =
  | { ok: true; data: EnquiryInput }
  | { ok: false; errors: Record<string, string> };
```

Do not log invalid payload contents.

- [ ] **Step 4: Run the test and full suite**

Run: `npm test -- src/lib/enquiries/validation.test.ts && npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/enquiries
git commit -m "feat: add BiasLens enquiry validation"
```

---

### Task 2: Add Airtable idempotency and persistence

**Files:**
- Create: `src/lib/enquiries/airtable.ts`
- Test: `src/lib/enquiries/airtable.test.ts`
- Modify operationally: Airtable `Enquiries` table

**Interfaces:**
- Consumes: validated `EnquiryInput` from Task 1.
- Produces: `saveEnquiryToAirtable(enquiry: EnquiryInput): Promise<{ recordId: string }>`.
- Environment: `AIRTABLE_API_TOKEN`, `AIRTABLE_BASE_ID=appj4M2hNcwDx2yjd`, `AIRTABLE_ENQUIRIES_TABLE_ID=tblB1lF8cJsafECJR`.

- [ ] **Step 1: Add the `Enquiry Reference` field to Airtable**

Create one `singleLineText` field named exactly `Enquiry Reference` in `tblB1lF8cJsafECJR`. Do not alter existing field names or choices.

- [ ] **Step 2: Write failing Airtable tests using mocked `fetch`**

Test these exact behaviours:

```ts
it("searches by enquiry reference before creating", async () => { /* assert GET filterByFormula call */ });
it("returns the existing record when the same reference already exists", async () => { /* assert no POST */ });
it("maps website enquiries to the existing Airtable choices", async () => { /* Source='Website', Stage='New — not yet replied' */ });
it("throws without exposing the token when Airtable rejects the write", async () => { /* generic Error */ });
```

Expected Airtable field mapping:

```ts
{
  "Enquiry Reference": enquiry.enquiryReference,
  "Name": enquiry.name,
  "Email": enquiry.email,
  "Organisation": enquiry.organisation,
  "Date received": "YYYY-MM-DD",
  "Source": "Website",
  "Region": enquiry.region,
  "Sector": enquiry.sector,
  "Their role": enquiry.role,
  "Existing documentation": enquiry.existingDocumentation,
  "Stage": "New — not yet replied",
  "Next action": "10-minute qualification conversation",
  "Notes": [
    `System/process: ${enquiry.systemProcess}`,
    `Decision/outcome: ${enquiry.decisionOutcome}`,
    `Main concern: ${enquiry.concern}`,
    `Preferred contact: ${enquiry.preferredContact || "Not specified"}`,
    `Phone: ${enquiry.phone || "Not supplied"}`,
  ].join("\n")
}
```

- [ ] **Step 3: Run tests to verify failure**

Run: `npm test -- src/lib/enquiries/airtable.test.ts`

Expected: FAIL because `airtable.ts` does not exist.

- [ ] **Step 4: Implement the minimal server-only Airtable client**

Add `import "server-only";` and use the Airtable REST API directly with `fetch`. First query for the exact `Enquiry Reference`; if found, return its record ID. Otherwise create exactly one record. Encode the filter safely. Throw generic errors such as `new Error("Airtable enquiry write failed")` without credentials or response bodies.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- src/lib/enquiries/airtable.test.ts && npm test`

```bash
git add src/lib/enquiries/airtable.ts src/lib/enquiries/airtable.test.ts
git commit -m "feat: persist BiasLens enquiries to Airtable"
```

---

### Task 3: Add owner notification through Resend

**Files:**
- Create: `src/lib/enquiries/notify.ts`
- Test: `src/lib/enquiries/notify.test.ts`

**Interfaces:**
- Consumes: validated `EnquiryInput` and Airtable `recordId`.
- Produces: `sendEnquiryNotification(enquiry: EnquiryInput, recordId: string): Promise<void>`.
- Environment: `RESEND_API_KEY`, `BIASLENS_NOTIFICATION_TO=hello@beaccessible.co.za`, `BIASLENS_NOTIFICATION_FROM` (verified sender on `beaccessible.co.za`).

- [ ] **Step 1: Write failing notification tests**

Cover:

```ts
it("sends exactly one notification to hello@beaccessible.co.za", async () => {});
it("includes organisation, contact, system, concern and Airtable record id", async () => {});
it("does not include secrets or raw JSON dumps", async () => {});
it("throws a generic error when Resend rejects the request", async () => {});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- src/lib/enquiries/notify.test.ts`

Expected: FAIL because `notify.ts` does not exist.

- [ ] **Step 3: Implement a small Resend REST client**

Use `POST https://api.resend.com/emails` with `Authorization: Bearer ${RESEND_API_KEY}` and a plain, readable HTML/text message. Subject:

`New BiasLens enquiry — ${organisation}`

Include only the fields listed in the design spec and the Airtable record ID. Do not add new npm dependencies.

- [ ] **Step 4: Run tests and commit**

Run: `npm test -- src/lib/enquiries/notify.test.ts && npm test`

```bash
git add src/lib/enquiries/notify.ts src/lib/enquiries/notify.test.ts
git commit -m "feat: notify BeAccessible of BiasLens enquiries"
```

---

### Task 4: Implement the enquiry API orchestration

**Files:**
- Create: `src/app/api/enquiries/route.ts`
- Create: `src/lib/enquiries/route.test.ts`

**Interfaces:**
- `POST /api/enquiries`
- Request JSON: `EnquiryInput`-shaped data.
- Success response: HTTP `201`, `{ ok: true, enquiryReference: string }`.
- Validation failure: HTTP `400`, `{ ok: false, errors: Record<string,string> }`.
- Persistence/notification failure: HTTP `503`, `{ ok: false, errors: { form: "We could not submit your enquiry right now. Please try again or email hello@beaccessible.co.za." } }`.

- [ ] **Step 1: Write failing orchestration tests**

Test the pure orchestration function exported from the route module or a small internal helper:

```ts
it("does not call Airtable when validation fails", async () => {});
it("does not call notification when Airtable fails", async () => {});
it("returns failure when notification fails", async () => {});
it("returns success only after Airtable and notification both succeed", async () => {});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/lib/enquiries/route.test.ts`

- [ ] **Step 3: Implement POST handling**

Parse JSON defensively, call `validateEnquiry`, then `saveEnquiryToAirtable`, then `sendEnquiryNotification`. Set `Cache-Control: no-store`. Never echo the submitted free text in the response. Never log the body.

- [ ] **Step 4: Run tests and commit**

Run: `npm test -- src/lib/enquiries/route.test.ts && npm test`

```bash
git add src/app/api/enquiries/route.ts src/lib/enquiries/route.test.ts
git commit -m "feat: add BiasLens enquiry API"
```

---

### Task 5: Build the accessible qualification form and confirmation route

**Files:**
- Create: `src/components/public/EnquiryForm.tsx`
- Create: `src/app/enquire/page.tsx`
- Create: `src/app/enquire/thank-you/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Form submits JSON to `/api/enquiries`.
- On `201`, route client-side to `/enquire/thank-you?ref=<encoded reference>`.
- On `400`, show one focusable error summary plus inline field errors.
- On `503`, show the generic form error and preserve entered non-sensitive values.

- [ ] **Step 1: Build the form structure with no submission logic**

Use explicit `<label htmlFor>` associations, `aria-describedby` help/error IDs, and `aria-invalid` only when a field has an error. Include required fields from the spec, optional phone/preferred contact, consent checkbox and off-screen honeypot named `website` that is removed from the tab order.

Generate the idempotency reference once per form instance in the browser in this format:

`BL-WEB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

Do not render the reference as a user-editable control.

- [ ] **Step 2: Add accessible submission behaviour**

On error:

```ts
errorSummaryRef.current?.focus();
```

Error summary container requirements:

```tsx
<div ref={errorSummaryRef} tabIndex={-1} role="alert" aria-labelledby="error-summary-title">
  <h2 id="error-summary-title">Please correct the following</h2>
  ...
</div>
```

Disable the submit button only while a request is actively in progress; button text becomes `Submitting…` and reverts on failure.

- [ ] **Step 3: Add the thank-you page**

Required copy:

- Heading: `Thank you. Your BiasLens enquiry has been received.`
- Explain that the next step is a 10-minute qualification conversation.
- Provide `hello@beaccessible.co.za` as a contact route.
- Provide a link back to `/` and a separate `/login` link for existing users.
- Do not expose the full form data.

- [ ] **Step 4: Add form/page styles scoped to `.public-*` classes**

Meet reflow, visible focus, error contrast, 44px target-size where feasible, and no colour-only errors. Reuse current CSS variables/tokens instead of duplicating a competing design system.

- [ ] **Step 5: Run build and manual keyboard smoke test**

Run: `npm run build`

Manual sequence: Tab through all fields → submit empty → focus moves to error summary → error links/labels remain understandable → complete form → submission state announced visually and programmatically.

- [ ] **Step 6: Commit**

```bash
git add src/components/public/EnquiryForm.tsx src/app/enquire src/app/globals.css
git commit -m "feat: add accessible BiasLens qualification form"
```

---

### Task 6: Build the public BiasLens landing page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/public/PublicHeader.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- `/` is public for signed-in and signed-out visitors.
- Primary CTA links to `/enquire`.
- Existing users get a clear `/login` link; signed-in visitors are not forcibly redirected away from the landing page.

- [ ] **Step 1: Remove only the root-page auth redirect**

Replace the current `src/app/page.tsx` redirect implementation. Do not remove or weaken middleware/auth protection elsewhere.

- [ ] **Step 2: Implement the approved page sections in this order**

1. Public header
2. Hero — `Know what your evidence supports — and what it does not.`
3. Business problem
4. Who BiasLens is for
5. What BiasLens can assess
6. Four-offer commercial ladder
7. Why BiasLens is different
8. Engagement process
9. Proof/trust assets (omit unavailable links or label genuinely unfinished assets `Coming soon`)
10. Founder note
11. Final CTA
12. Footer with privacy/accessibility links and `hello@beaccessible.co.za`

Use only claims approved in the design/Claims Register. Do not claim BiasLens proves discrimination, guarantees compliance, or creates legal immunity.

- [ ] **Step 3: Add metadata**

Root metadata:

```ts
export const metadata = {
  title: "BiasLens | Evidence-Led Algorithmic Accountability by BeAccessible",
  description: "Assess one AI system at a time. BiasLens helps organisations separate evidence from assumption, identify bias risks, document uncertainty and build an accountable evidence trail.",
};
```

If metadata belongs in `layout.tsx`, preserve existing global metadata and use page-level metadata where possible.

- [ ] **Step 4: Style responsively using existing BeAccessible branding**

Use official Deep Blue `#1F3F6B`, Mid Blue `#2F5C9A`, Soft Blue `#4A78B5`, white and current tints/tokens. Avoid decorative stock imagery. Reuse `Logo`.

- [ ] **Step 5: Verify public/auth route separation**

Run: `npm run build`

Manual checks:

- `/` loads signed out.
- `/login` still loads.
- `/signup` still loads.
- authenticated `/dashboard` still requires/uses the existing auth path.
- `/privacy` and `/accessibility-statement` still load.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/components/public/PublicHeader.tsx src/app/globals.css src/app/layout.tsx
git commit -m "feat: add public BiasLens commercial landing page"
```

---

### Task 7: Add “Listen to this page” as a progressive enhancement

**Files:**
- Create: `src/components/public/ListenToPage.tsx`
- Modify: `src/components/public/PublicHeader.tsx`

**Interfaces:**
- Client component exports `ListenToPage({ targetId }: { targetId: string })`.
- Target main content has stable ID `main-content`.

- [ ] **Step 1: Implement Start/Stop speech control**

Requirements:

- no autoplay;
- button label toggles `Listen to this page` / `Stop listening`;
- reads text from the target element only;
- `speechSynthesis.cancel()` before starting a new utterance and on unmount;
- status region uses `aria-live="polite"`;
- if unsupported, announce `Read-aloud is not available in this browser.`;
- do not hide or replace semantic page content.

- [ ] **Step 2: Add reduced-friction keyboard behaviour**

Use a native `<button type="button">`; no custom keyboard handlers are required. Ensure status text is not the only visual indication of state.

- [ ] **Step 3: Build and manually test**

Run: `npm run build`

Manual: keyboard start → speech begins → button says Stop → keyboard stop → speech cancels → navigate away → speech cancels.

- [ ] **Step 4: Commit**

```bash
git add src/components/public/ListenToPage.tsx src/components/public/PublicHeader.tsx
git commit -m "feat: add BiasLens page read-aloud control"
```

---

### Task 8: Configure production environment documentation and deployment checks

**Files:**
- Modify: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Vercel server environment must contain:
  - `AIRTABLE_API_TOKEN`
  - `AIRTABLE_BASE_ID=appj4M2hNcwDx2yjd`
  - `AIRTABLE_ENQUIRIES_TABLE_ID=tblB1lF8cJsafECJR`
  - `RESEND_API_KEY`
  - `BIASLENS_NOTIFICATION_TO=hello@beaccessible.co.za`
  - `BIASLENS_NOTIFICATION_FROM=<verified beaccessible.co.za sender>`
- Existing Supabase variables remain unchanged.

- [ ] **Step 1: Document variables without secrets**

Add names and descriptions only to `.env.example`. Never commit live tokens.

- [ ] **Step 2: Document the public conversion flow in README**

Document:

`Campaign → / → /enquire → Airtable Enquiries → owner email → /enquire/thank-you → 10-minute qualification conversation`

Also note that enquiry data is separate from assessment data.

- [ ] **Step 3: Run full verification before deployment**

Run:

```bash
npm test
npm run build
```

Expected: all tests PASS and production build succeeds.

- [ ] **Step 4: Commit documentation**

```bash
git add .env.example README.md
git commit -m "docs: configure BiasLens enquiry deployment"
```

- [ ] **Step 5: Configure Vercel environment variables**

Use the existing Vercel project `bias-lens-full-platform`. Add server-only values for Production and Preview as appropriate. Do not expose them with `NEXT_PUBLIC_` prefixes.

- [ ] **Step 6: Deploy through the existing GitHub → Vercel production workflow**

Verify the deployment reaches `READY` before any completion claim.

- [ ] **Step 7: Production smoke test**

Check on `https://biaslens.beaccessible.co.za`:

- landing page loads;
- official logo renders;
- anchor navigation works by keyboard;
- `Listen to this page` starts/stops;
- `/login` remains available;
- `/enquire` validates accessibly;
- submit one clearly labelled test enquiry;
- exactly one Airtable record is created;
- notification arrives at `hello@beaccessible.co.za`;
- confirmation page appears only after both backend operations succeed;
- remove/mark the test Airtable record as test after verification.

- [ ] **Step 8: Accessibility/regression acceptance**

Manual acceptance checklist:

- keyboard-only complete path `/` → `/enquire` → validation → submit;
- visible focus at all times;
- screen-reader smoke test for landmarks, H1, form labels and error summary;
- 200% zoom and narrow viewport reflow;
- no horizontal scrolling for primary content at 320 CSS px where feasible;
- reduced-motion preference does not hide functionality;
- no colour-only information;
- privacy/accessibility links work;
- authenticated dashboard and assessment routes still function.

- [ ] **Step 9: Final verification commit only if fixes were needed**

If production verification required code changes, make those changes with tests, then commit them separately as:

```bash
git commit -m "fix: complete BiasLens landing production verification"
```

---

## Self-Review

- Spec coverage: public root, enquiry form, thank-you route, Airtable, Resend, data separation, no false success, accessibility, Listen-to-page, brand, SEO, security, regression and Vercel deployment are all assigned to explicit tasks.
- No payment, platform redesign, engine work, new AI integration or Product Hunt work is included.
- Airtable select values in this plan match the live `Enquiries` schema reviewed on 2026-08-16.
- The implementation plan uses the actual repository package versions (`next@16.2.9`, `react@19`) rather than the older README wording.
- No secrets or placeholder tokens are committed; only environment-variable names are documented.
- Idempotency is explicit so a notification failure and subsequent retry cannot create duplicate Airtable enquiries.
