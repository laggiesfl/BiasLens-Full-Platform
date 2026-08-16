# BiasLens Public Landing Page and Qualification Flow — Design Specification

Date: 2026-08-16
Repository: `laggiesfl/BiasLens-Full-Platform`
Hosting: Vercel
Primary domain: `https://biaslens.beaccessible.co.za`

## 1. Purpose

BiasLens currently functions primarily as an authenticated application. The root route redirects unauthenticated visitors to `/login`, which means the product has no public commercial front door.

This design adds a public, accessible, evidence-led marketing and qualification experience at the root of the existing BiasLens platform without separating the landing page from the application or moving any part of the product to another hosting platform.

The commercial objective is to convert qualified organisational interest into a short qualification flow, then into a consultation and paid BiasLens engagement.

## 2. Core Positioning

Primary proposition:

> BiasLens tells you what your evidence actually supports — and what it does not.

Supporting positioning:

- Evidence-led algorithmic accountability and bias-risk assessment.
- BiasLens assesses systems, processes and aggregated outcomes; it does not assess people as individual risk objects.
- BiasLens identifies evidence and signals that may require investigation. It does not make legal findings of discrimination.
- BiasLens preserves uncertainty rather than turning missing evidence into reassurance.
- BiasLens is broader than one regulatory deadline or one jurisdiction.

The page must not position BiasLens as a generic EU AI Act compliance tool.

## 3. Recommended Architecture

### Public routes

- `/` — public BiasLens landing page.
- `/enquire` — short qualification form for the primary CTA, “Assess one AI system”.
- `/enquire/thank-you` — accessible confirmation page after successful submission.

### Existing application routes

The following routes remain intact and unchanged in purpose:

- `/login`
- `/signup`
- `/onboarding`
- `/dashboard`
- `/assessments/...`
- `/settings/...`
- `/privacy`
- `/accessibility-statement`

The current root redirect logic is removed from `/` and replaced by the landing page. Authentication remains enforced on authenticated application routes through the current route group, middleware and server-side access controls.

### Domain

All public and authenticated routes remain under the same existing Vercel project and domain:

`https://biaslens.beaccessible.co.za`

No Netlify deployment is introduced.

## 4. Landing Page Information Architecture

The landing page should use a focused, single-purpose commercial structure with short navigation links and strong keyboard support.

### 4.1 Header

Contents:

- Existing BiasLens / BeAccessible branding from the codebase.
- Navigation anchors: Why BiasLens, Who it is for, Offers, Proof, Founder note, Contact.
- “Sign in” link to `/login`.
- Primary button: “Assess one AI system”.
- “Listen to this page” control.

The header may be sticky if it does not obstruct zoomed content or keyboard focus.

### 4.2 Hero

Headline:

> Know what your evidence supports — and what it does not.

Supporting message:

BiasLens helps organisations assess one AI system at a time, separate evidence from assumption, identify bias risks, document uncertainty and build an accountable evidence trail.

Primary CTA:

> Assess one AI system

Secondary CTA:

> Sign in to BiasLens

### 4.3 Problem section

Explain that many organisations can identify the AI tools they have purchased, but cannot demonstrate:

- what evidence supports system behaviour;
- which groups may be affected;
- whether vendor fairness claims are substantiated;
- where evidence is missing;
- what human oversight exists in practice;
- what remains uncertain.

This section must be written as a business problem, not a generic education section.

### 4.4 Who BiasLens is for

Buyer groups:

- AI Governance / Responsible AI
- Risk / Compliance
- HR / People
- Procurement / Vendor Governance
- Accessibility / Disability Inclusion
- Executive / Board oversight

Each buyer block should describe the decision problem BiasLens helps them address.

### 4.5 What BiasLens can assess

Examples may include:

- AI-assisted recruitment and candidate screening;
- workforce decision support;
- education and assessment systems;
- financial, insurance or eligibility systems;
- public-sector or essential-service decision workflows;
- third-party AI tools affecting customers, employees or applicants.

The page should not imply that every possible use case is within scope without assessment.

### 4.6 Commercial offer ladder

#### Offer 1 — Evidence Readiness Diagnostic

Entry engagement for one AI-enabled system or decision process.

Outputs:

- system and decision-context summary;
- evidence inventory;
- bias-pathway review;
- affected-group visibility review;
- documentation gaps;
- immediate governance questions;
- BiasLens Evidence Readiness Brief.

#### Offer 2 — System Bias Assessment

Deeper assessment using the BiasLens methodology.

Outputs may include:

- bias-risk findings;
- evidence strength;
- fairness analysis where appropriate;
- accessibility considerations;
- limitations;
- recommendations;
- traceable rationale and documentation.

#### Offer 3 — Algorithm Defence File

Organisation-owned evidence record showing:

- what was assessed;
- what evidence exists;
- what remains unverified;
- what controls exist;
- what findings were made;
- what action followed.

The page must explicitly state that this is governance evidence, not a promise of legal immunity.

#### Offer 4 — Continuous Assurance

Periodic reassessment for:

- changes in models;
- changed populations;
- changed use context;
- vendor changes;
- new evidence;
- emerging bias or Bias Drift.

### 4.7 Why BiasLens is different

Use approved claims only:

- severity and evidence are separate;
- uncertainty is preserved;
- findings are traceable;
- fairness signals are not legal determinations;
- small-sample guardrails are methodology protections, not legal safe harbours;
- BiasLens assesses systems, not people.

### 4.8 Proof and trust

Surface or reserve places for:

- BiasLens Methodology Note;
- two-minute problem-to-evidence demo;
- fictional-data recruitment case study;
- sample Algorithm Defence File;
- Privacy Notice;
- Accessibility Statement.

If an asset is not yet complete, do not publish a dead or misleading download link. Use clearly labelled “Coming soon” or omit until ready.

### 4.9 Founder note

Use a short, enterprise-appropriate founder rationale. The founder story should explain why evidence discipline matters, without turning disability into an inspiration narrative.

Approved direction:

> I have lived for more than thirty years with the consequences of institutions making assumptions about disabled people. BiasLens comes from a simple conviction: when a system can affect someone's opportunity, livelihood, access or participation, assumptions are not enough. Organisations should be able to show what their evidence supports — and what it does not.

### 4.10 Final CTA

Repeat:

> Assess one AI system

Supporting text should explain that the visitor will complete a short qualification form first.

## 5. Qualification Form Design

Route: `/enquire`

Purpose: capture enough information to qualify the opportunity without requiring the visitor to create a BiasLens account first.

### Required fields

- Name
- Work email
- Organisation
- Region
- Sector
- Role
- AI system or process they want assessed
- What decision or outcome the system influences
- Main concern or question
- Existing bias testing / impact-assessment documentation status
- POPIA/privacy consent checkbox allowing BeAccessible to contact them about the enquiry

### Optional fields

- Phone number
- Preferred contact method

### Form principles

- One clear label per field.
- Help text where necessary.
- No placeholder-only labels.
- Inline and summary validation errors.
- Errors announced to assistive technology.
- Full keyboard operation.
- No time limits.
- No inaccessible CAPTCHA.
- No colour-only validation state.
- Clear privacy link before submission.

Primary submit button:

> Submit BiasLens enquiry

## 6. Enquiry Data Flow

### Submission flow

1. Visitor submits `/enquire`.
2. Server validates required fields and consent.
3. Enquiry is written into the existing BiasLens marketing/sales Airtable pipeline.
4. BeAccessible receives a notification at `hello@beaccessible.co.za`.
5. Visitor is redirected to `/enquire/thank-you`.
6. Thank-you page confirms receipt and explains the expected next step: a 10-minute qualification conversation.

### Data separation

Marketing qualification data must remain separate from BiasLens assessment data until an organisation formally enters the BiasLens product process.

The enquiry form must not collect sensitive employee-level or applicant-level records.

### Failure behaviour

If Airtable or email notification fails:

- the user must not receive a false success state;
- the server should return a clear, accessible error message;
- the form should preserve non-sensitive entered fields where practical;
- operational failure should be logged without exposing user data to client-side logs.

## 7. Airtable Integration

The existing `Enquiries` table is the target operational pipeline.

Recommended mappings:

- Name → Name
- Work email → Email
- Organisation → Organisation
- Submission date → Date received
- Region → Region
- Sector → Sector
- Role → Their role
- Existing documentation → Existing documentation
- Source → Website / BiasLens landing page
- Stage → New
- Next action → “10-minute qualification conversation”
- Next action date → set operationally after triage or according to implementation rules
- Notes → system/process, influenced decision, main concern, preferred contact method

If existing Airtable single-select options do not support the required website source or stage, add only the minimum new options required.

## 8. Email Notification

Notification recipient:

`hello@beaccessible.co.za`

The message should contain:

- contact name;
- organisation;
- email;
- region;
- sector;
- role;
- system/process summary;
- influenced decision/outcome;
- concern/question;
- documentation status;
- link or identifier for the corresponding Airtable enquiry record if available.

Do not include unnecessary sensitive data.

If Resend is already part of the wider BeAccessible stack and can be safely configured in this Vercel project, it is the preferred email-delivery service. Otherwise, use the simplest existing project-compatible delivery mechanism without introducing unnecessary infrastructure.

## 9. Accessibility Requirements

Minimum gate: WCAG 2.1 AA.
Target: WCAG 2.2 AAA where feasible, consistent with the existing BiasLens project direction.

Required features:

- semantic landmarks;
- one logical `<h1>`;
- ordered heading hierarchy;
- skip link;
- visible keyboard focus;
- keyboard-operable navigation and controls;
- 200% zoom support without loss of content/function;
- responsive reflow;
- sufficient contrast;
- no information conveyed by colour alone;
- reduced-motion support;
- accessible form labels, instructions and errors;
- descriptive link text;
- accessible confirmation and error states;
- compatibility with common screen-reader navigation patterns.

### Listen to this page

Add a clearly labelled “Listen to this page” control.

Preferred first implementation: browser Speech Synthesis API with:

- Start / Stop state;
- `aria-live` status messages;
- keyboard operation;
- no automatic playback;
- graceful fallback when speech synthesis is unavailable.

The feature is a convenience aid and must not replace semantic accessibility.

## 10. Privacy and Security

- Do not collect employee-level or applicant-level datasets through the marketing form.
- Do not expose Airtable credentials to the browser.
- Perform Airtable writes server-side.
- Keep email service keys server-side.
- Validate and sanitise inputs server-side.
- Apply reasonable anti-spam controls that do not create accessibility barriers.
- Preserve current security headers and authenticated application protections.
- Do not weaken Supabase Row Level Security or application access checks.

## 11. Branding and Content

Use the existing BeAccessible design tokens and logo/component system already in the BiasLens repository where possible.

Brand direction:

- Deep Blue `#1F3F6B`
- Mid Blue `#2F5C9A`
- Soft Blue `#4A78B5`
- White `#FFFFFF`
- supporting tints already defined by BeAccessible

Visual rule: no decorative people, body parts, silhouettes or animals.

Do not invent a new BiasLens logo if none exists in the repository. Use the existing official BeAccessible / BiasLens brand treatment.

## 12. SEO and Metadata

Add clear metadata for the root page:

Suggested title:

`BiasLens | Evidence-Led Algorithmic Accountability by BeAccessible`

Suggested description:

`Assess one AI system at a time. BiasLens helps organisations separate evidence from assumption, identify bias risks, document uncertainty and build an accountable evidence trail.`

Open Graph and social metadata should be added only with accurate product claims.

## 13. Testing Requirements

### Functional

- Public `/` loads for signed-out visitors.
- Signed-in users can still access the landing page and have a clear route to dashboard.
- `/login`, `/signup`, `/onboarding` and authenticated routes continue to work.
- Form validation works client-side only as enhancement; server-side validation is authoritative.
- Valid enquiry creates one Airtable record.
- Valid enquiry triggers one notification email.
- Success page displays only after confirmed backend success.
- Failure states are accessible and do not lose critical user input unnecessarily.

### Accessibility

- Keyboard-only walkthrough.
- Screen-reader smoke test.
- Focus order test.
- 200% zoom and narrow viewport reflow.
- Error summary and inline error announcement.
- Speech-synthesis control start/stop behaviour.
- Reduced-motion preference test.

### Regression

- Existing Supabase auth flows.
- Dashboard access.
- Assessment routes.
- Privacy and accessibility statement routes.
- Middleware protection.

## 14. Implementation Boundaries

This release should not include:

- payment checkout;
- self-service purchase;
- complex CRM automation;
- client portal redesign;
- changes to the BiasLens assessment engine;
- new AI model integrations;
- Product Hunt launch work;
- unverified legal claims;
- a separate marketing deployment.

These can be added in later releases once the landing and qualification flow is proven.

## 15. Definition of Done

The feature is complete when:

1. `https://biaslens.beaccessible.co.za/` is a polished public BiasLens landing page.
2. The existing authenticated BiasLens app remains functional under the same Vercel project/domain.
3. “Assess one AI system” opens the accessible qualification form.
4. A successful enquiry creates an Airtable pipeline record.
5. `hello@beaccessible.co.za` receives a notification.
6. The visitor receives a clear, accessible confirmation page.
7. The page includes working “Listen to this page” functionality.
8. No public content violates the BiasLens Claims Register.
9. Core accessibility and regression checks pass.
10. The page is deployed through the existing GitHub → Vercel production workflow.
