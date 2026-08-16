# BiasLens — Working Platform

**Evidence-led algorithmic accountability and bias-risk platform by BeAccessible.**
BiasLens combines a public commercial front door with an authenticated assessment platform. It is designed to help organisations distinguish evidence from assumption, document uncertainty, identify bias-risk signals and maintain a traceable evidence record without overstating what the evidence proves.

## Tech stack

| Layer | Tool |
|---|---|
| App framework | Next.js 16.2.9 (App Router) + TypeScript |
| UI | Custom accessible component system + BeAccessible CSS design tokens |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Authorisation | Supabase Row Level Security + app-level role checks |
| Enquiry pipeline | Airtable |
| Owner notifications | Resend |
| Hosting | Vercel |

## Public conversion flow

The public BiasLens experience stays in the same repository and Vercel project as the authenticated platform:

`Campaign → / → /enquire → Airtable Enquiries → owner email → /enquire/thank-you → 10-minute qualification conversation`

Public routes:

- `/` — dedicated BiasLens landing page.
- `/enquire` — accessible qualification form for the CTA “Assess one AI system”.
- `/enquire/thank-you` — confirmation after successful Airtable persistence and owner notification.
- `/privacy` — Privacy Notice.
- `/accessibility-statement` — Accessibility Statement.

Existing application routes remain intact, including `/login`, `/signup`, `/onboarding`, `/dashboard` and `/assessments/...`.

Marketing enquiry data is kept separate from BiasLens assessment data. The public form must not be used to submit employee-level, applicant-level or other sensitive person-level datasets.

## Live backend

The platform uses the existing BeAccessible Supabase project in `eu-west-2` with Row Level Security enabled. Supabase authentication and assessment data remain independent of the public marketing enquiry pipeline.

## Environment variables

Copy `.env.example` to `.env.local` for local development. Production values belong in the existing Vercel project and must never be committed.

### Existing Supabase / site variables

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

### Server-only BiasLens enquiry variables

```text
AIRTABLE_API_TOKEN=
AIRTABLE_BASE_ID=appj4M2hNcwDx2yjd
AIRTABLE_ENQUIRIES_TABLE_ID=tblB1lF8cJsafECJR
RESEND_API_KEY=
BIASLENS_NOTIFICATION_TO=hello@beaccessible.co.za
BIASLENS_NOTIFICATION_FROM=BiasLens <hello@beaccessible.co.za>
```

`AIRTABLE_API_TOKEN`, `RESEND_API_KEY` and the other server-only values must never use a `NEXT_PUBLIC_` prefix.

The Resend domain `beaccessible.co.za` must be verified and sending-enabled before using `hello@beaccessible.co.za` as the sender.

## Enquiry reliability rules

- A unique `Enquiry Reference` is generated for each form instance.
- The server validates all required fields and exact Airtable select values.
- Airtable is checked for the reference before a record is created, preventing duplicate records on retry.
- The owner email is sent only after Airtable persistence succeeds.
- The visitor sees success only after both Airtable persistence and the email notification succeed.
- If either backend operation fails, the visitor receives an accessible error and can retry or email `hello@beaccessible.co.za`.

## Run locally

```bash
npm install
npm run dev
```

Production verification:

```bash
npm test
npm run build
```

## Deployment

BiasLens is deployed through the existing GitHub → Vercel workflow. The primary domain remains:

`https://biaslens.beaccessible.co.za`

Before promoting the public landing flow to production:

1. Configure the server-only Airtable and Resend variables in the existing Vercel project for Preview and Production as appropriate.
2. Run the unit-test suite and production build.
3. Verify the feature branch preview.
4. Submit one clearly labelled test enquiry and confirm exactly one Airtable record and one owner notification.
5. Regression-check `/login`, `/signup`, `/dashboard`, assessment routes, privacy and accessibility pages.
6. Merge to `main` only after review.

## Security and privacy

- Row Level Security protects authenticated Supabase data.
- Airtable and Resend credentials are server-only.
- The public enquiry API does not echo free-text submission data back to the browser.
- A honeypot provides low-friction anti-spam protection without an inaccessible CAPTCHA.
- Public messaging states the design boundary: BiasLens assesses systems, processes and aggregated outcomes; it is not an employee-monitoring, productivity-surveillance or individual-scoring platform.

## Accessibility

Minimum gate: WCAG 2.1 AA. Target: WCAG 2.2 AAA where feasible.

The public flow includes semantic landmarks, a skip link, visible two-tone keyboard focus, responsive reflow, explicit form labels and errors, reduced-motion support, and an optional “Listen to this page” progressive enhancement. Read-aloud does not replace semantic accessibility.

## Project structure

```text
src/
  app/
    page.tsx                     # public landing page
    enquire/                     # qualification + confirmation
    api/enquiries/               # server orchestration
    (app)/                       # authenticated application
  components/
    public/                      # public header, read-aloud, enquiry form
    Logo.tsx                     # official BeAccessible logo component
  lib/
    enquiries/                   # validation, Airtable, Resend, orchestration + tests
    supabase/                    # auth/data clients
```

Contact: `hello@beaccessible.co.za`
