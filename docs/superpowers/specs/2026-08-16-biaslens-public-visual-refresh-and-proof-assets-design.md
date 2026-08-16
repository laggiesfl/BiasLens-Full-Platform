# BiasLens Public Visual Refresh and Proof Assets Design

**Date:** 2026-08-16  
**Project:** BiasLens Full Platform  
**Scope:** Public-facing BiasLens experience only

## Purpose

Refresh the entire public BiasLens experience so it feels closer to the premium, structured BeAccessible website reference: less white, deeper blue, stronger hierarchy, subtle architectural-grid treatment and more cohesive proof-led presentation. Complete the public proof stack with a fictional-data recruitment case study and a sample Algorithm Defence File, each available as both a public web page and a branded downloadable PDF.

## Goals

- Reduce the current white/light feel across all public BiasLens pages.
- Align BiasLens visually with the BeAccessible family while retaining a distinct product identity.
- Create one shared public design system across landing, methodology, demo, enquiry and proof pages.
- Add two high-value proof assets that can be used online and in sales conversations.
- Preserve BiasLens evidence discipline, claims boundaries, privacy model and accessibility requirements.

## In scope

- `/` landing page
- `/methodology`
- `/demo`
- `/enquire`
- `/enquire/thank-you`
- new `/case-study/recruitment` page
- new `/algorithm-defence-file` page
- downloadable PDF version of the recruitment case study
- downloadable PDF version of the sample Algorithm Defence File
- landing-page proof section updates
- Airtable Campaign & Asset Register updates when assets are live

## Out of scope

- authenticated dashboard or assessment-engine redesign
- changes to assessment logic or legal classification logic
- payments or self-service purchasing
- rendered marketing video production
- a separate BiasLens brand detached from BeAccessible

## Design direction

Use a **full BeAccessible-aligned public system**, not a superficial dark-mode repaint and not a near-copy of the BeAccessible homepage.

### Visual language

- Deep Blue `#1F3F6B` as dominant base.
- Mid Blue `#2F5C9A` and Soft Blue `#4A78B5` for accents.
- White `#FFFFFF` for high-contrast text and selective high-clarity panels.
- Existing light tints may support forms or dense information, but should not dominate the canvas.
- Introduce a subtle low-contrast structural grid inspired by the BeAccessible reference screenshot.
- Use dark/translucent or lightly outlined cards instead of a page dominated by white cards.
- Preserve strong visible focus, readable type and responsive reflow.
- The overall feel should be executive, evidence-led, calm, modern and authoritative.

## Shared public system

All public pages share:
- common `PublicHeader`
- common footer
- common shell and section rhythm
- common heading scale and eyebrow/badge treatment
- common dark/tinted card and panel variants
- common CTA treatment
- consistent `Listen to this page` behaviour
- consistent accessibility semantics

Primary public navigation remains focused on Why BiasLens, Offers, Proof, Founder note, Sign in and Assess one AI system.

## Page intent

### Landing page
Preserve the current conversion architecture and four-offer ladder, but make the page visually richer, darker and more premium. Proof assets should be directly visible and no longer read as a collection of “coming soon” items once published.

### Methodology page
Present as a formal trust asset rather than a light article page. Improve scanning and visually separate methodology principles, cautions and explicit non-claims.

### Demo page
Keep the existing fictional-data two-minute walkthrough and narration, but present the six steps as a polished proof sequence rather than plain text cards.

### Enquiry and thank-you pages
Retain clarity and form accessibility. Align the page shell and surrounding panels to the refreshed visual system without reducing form usability.

## Fictional-data recruitment case study

Purpose: demonstrate an end-to-end BiasLens use case for one fictional AI-assisted recruitment workflow.

Required sections:
1. Case-study overview and explicit fictional-data disclaimer.
2. Fictional organisation and system in scope.
3. Assessment trigger / business concern.
4. System purpose and decision context.
5. Evidence available.
6. Evidence missing or unverified.
7. Possible preexisting, technical and emergent bias pathways.
8. Fictional fairness signal and what it does not establish.
9. Limitations and caution notes.
10. Recommended next actions.
11. What BiasLens clarified.
12. CTA: Assess one AI system.

The asset must feel realistic enough for a client conversation without implying it is a real client case.

## Sample Algorithm Defence File

Purpose: show what an organisation-owned governance evidence record can look like after a BiasLens engagement.

Required sections:
1. Purpose and disclaimer.
2. System overview.
3. Scope of review.
4. Evidence inventory.
5. Key findings summary.
6. Evidence-strength / confidence framing.
7. Documented limitations.
8. Controls currently in place.
9. Unresolved questions.
10. Recommended actions.
11. Governance / review record.
12. Next review checkpoint.
13. CTA into consultation or assessment.

The file must demonstrate governance documentation, not legal immunity, certification or guaranteed regulatory acceptance.

## PDF strategy

Each new proof asset must have a downloadable branded PDF generated from a single canonical content source wherever practical so web and PDF claims cannot drift.

PDFs must:
- use BeAccessible/BiasLens branding;
- use a dark-blue cover/header treatment;
- maintain strong contrast and readable spacing;
- include clear title and section hierarchy;
- use meaningful filenames;
- be suitable for proposals and sales follow-up;
- avoid claiming formal PDF/UA or WCAG conformance unless separately validated.

## Claims and evidence rules

All refreshed and new content remains aligned to the BiasLens Claims Register:
- “BiasLens tells you what your evidence actually supports — and what it does not.”
- BiasLens identifies evidence and signals requiring investigation.
- BiasLens does not prove discrimination.
- BiasLens does not substitute for legal advice, formal regulatory classification or conformity assessment.
- BiasLens assesses systems, processes and aggregated outcomes — not individual people.
- Vendor assertions are not presented as verified evidence without support.
- Fairness signals are not converted into findings of causation or unlawful discrimination.
- Sample-size guardrails are product methodology, not legal thresholds.
- Fictional case material must be visibly labelled fictional.
- Accessibility demonstration is distinct from testing, validation and conformance.

## Accessibility requirements

The refresh must preserve or improve accessibility:
- semantic headings and landmarks;
- keyboard-operable navigation and forms;
- strong visible focus on dark backgrounds;
- sufficient contrast on dark/translucent surfaces;
- responsive reflow and 200% zoom usability;
- reduced-motion safety;
- clear form labels, errors and status messaging;
- meaningful links and button names;
- screen-reader-friendly confirmations;
- `Listen to this page` preserved across the public system;
- PDFs use clear headings, readable spacing and meaningful filenames.

Usability takes precedence over decorative styling.

## Implementation order

1. Establish refreshed shared public visual tokens and components.
2. Apply the system to the landing page.
3. Apply it to methodology, demo, enquiry and thank-you pages.
4. Build the fictional-data recruitment case study page.
5. Build the sample Algorithm Defence File page.
6. Build branded PDF generation/downloads for both assets.
7. Update the landing-page proof section.
8. Verify public routing, conversion, accessibility and authenticated-app regression.
9. Update Airtable proof-asset statuses and production URLs.

## Definition of done

- All public BiasLens pages present a coherent darker BeAccessible-aligned visual system.
- The public experience is no longer dominated by white cards and light canvas areas.
- The recruitment case study is live on the web and downloadable as a branded PDF.
- The sample Algorithm Defence File is live on the web and downloadable as a branded PDF.
- Proof-page CTAs route correctly to `/enquire`.
- Enquiry submission, Airtable persistence and owner notification still work.
- Protected application routes remain protected.
- New content remains claims-safe and explicitly fictional where appropriate.
- Keyboard, screen-reader structure, focus visibility, responsive reflow and read-aloud behaviour are preserved.
