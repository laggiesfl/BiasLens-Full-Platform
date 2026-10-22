# BiasLens unified website — deployment-readiness gate
Date: 22 October 2026
Status: READ-ONLY findings and safe implementation plan. No production changes authorized.

## Approved target
One unified BiasLens commercial website and authenticated assessment platform. Preserve existing dark navy interface, BeAccessible logo, current evidence-led enterprise messaging, and all authenticated workflows. Accessibility controls integrated into compact logo/navigation header. WCAG 2.2 AA baseline, AAA where achievable; screen-reader and browser testing required.

## Verified 22 October
- GitHub repository laggiesfl/BiasLens-Full-Platform exists; default branch main.
- README documents public and authenticated routes, Next.js, Supabase Auth/PostgreSQL with RLS, Airtable and Resend enquiry orchestration, and Vercel hosting.
- Public https://biaslens.beaccessible.co.za/ resolves and publicly displays sections including Why BiasLens, offers, proof, Guide and founder note, with enterprise evidence-led wording.
- Current GitHub main src/app/page.tsx hero reads "Can your organisation defend the decisions its AI makes?" whereas observed live site hero reads "Know what your evidence supports — and what it does not." This indicates SOURCE/DEPLOYMENT CONTENT MISMATCH and must be reconciled. Do not assume production deploys the main branch source as presently observed.
- Current GitHub main PublicHeader includes logo, public navigation, read-aloud, sign-in and enquiry; the earlier standalone prototype accessibility toolbar is NOT independently verified in the live application.
- Prior two screenshot variants show desired compact header integrated with original navy design, rather than a separate expanded toolbar.

## Blocking checks before modifying/deploying code
1. In Vercel read-only project settings, verify exact linked GitHub repository, production branch, latest production deployment commit SHA, root directory, build settings, domain, and protection settings.
2. Compare deployed SHA and repository branches before selecting implementation base. Preserve any newer live content not in main.
3. Verify Supabase backup and recovery workstream owner confirms database preservation; do not export or change data in this branch.
4. Check existing status of /login, /signup, /dashboard, /assessments, /enquire, privacy, accessibility statement without submitting sensitive data.
5. Inventory existing header and accessibility controls; test real behaviour in Firefox and screen reader rather than layering redundant controls.
6. Create a non-production preview branch/deployment with no database writes or new secrets, only after production baseline is known.
7. Test keyboard tab/focus, zoom 200/400%, 320px reflow, high contrast, reduced motion, context-aware speech, keyboard/screen reader, enquiry state, login flow (test account only), errors and regressions.
8. Prepare rollback against last verified good deployment/commit; merge and publish only after review and explicit final approval.

## Proposed minimal implementation
- Evolve existing PublicHeader and styles, not a replacement static HTML page.
- Retain live commercial messaging, preserving existing links/proof assets.
- Integrate compact keyboard-accessible control group with accessible labels/state: larger text, high contrast, reduced motion, read section, stop reading, reset.
- Avoid redundant read-aloud controls; reuse/extend existing ListenToPage behaviour where possible.
- Do not assume browsers support voice input. Don't expose nonworking controls.
- Keep one public site plus existing authenticated assessment routes, shared brand and navigation.

## Guardrails
NO DNS modifications, production deployments, Vercel settings changes, environment/secrets access, Supabase writes, auth changes, or live data copying in this readiness branch. Do not merge this document to main automatically.

## Current readiness verdict
Commercial positioning: already substantially live.
Read-only GitHub source review: partial.
Production-to-source parity: unresolved/blocking.
Vercel project settings: not independently checked.
Supabase recovery: managed separately, not checked here.
Automated and user-assistive-technology regression: not run.
Deployment go/no-go: NO-GO until project settings and SHA parity confirmed.

## Accessibility compliance note
This plan targets WCAG 2.2 AA and higher where feasible; documented proposals are not proof of conformance. Confirm functionality with real browsers and assistive technology.
