# BiasLens — Accessibility & Usability Audit

*BeAccessible · WCAG 2.2 AAA + Universal Design sweep · July 2026*

This is a plain-language record of the accessibility review across every screen,
what was already strong, what was changed, and what still needs a human tester.

---

## Overall verdict

BiasLens was **built with accessibility from the start** — this was a refinement
pass, not a rescue. The foundations were already in place: a skip-to-content
link, a visible keyboard focus indicator, reduced-motion support, a sidebar that
collapses on small screens, 48px touch targets, status shown by text + symbol
(never colour alone), joined form labels, and semantic landmarks and headings.

The sweep found and fixed a small number of AAA-level gaps (mostly colour
contrast and confirmation of destructive actions) and corrected some wording.

---

## What was checked

Every screen and shared component: sign-in, sign-up, password reset, set-new-
password, onboarding, dashboard, assessments list, assessment detail, guided
questionnaire, bias risk report, evidence log, settings, privacy notice,
accessibility statement, the app shell (sidebar, top bar, skip link), the status
and risk badges, the password field, and the Word / PDF exports.

## What was fixed in this pass

1. **Colour contrast raised to AAA (7:1).** Measured every text colour. Three
   were below the AAA threshold and are now corrected:
   - Primary buttons: were mid-blue (white text ≈ 6.7:1) → now deep blue
     (≈ 10.6:1).
   - In-content links: were mid-blue (≈ 6.1–6.7:1) → now deep blue (≈ 9.7:1),
     with the underline (not colour) carrying the link meaning.
   - Status colours (success / warning / danger): darkened so each clears 7:1 as
     text on white and on its tinted message background.

2. **Confirmation before destructive actions (WCAG 2.2 AAA 3.3.6).** Deleting an
   assessment or an evidence item now asks you to confirm first, naming the item,
   so nothing important is lost by a mis-click.

3. **Consistent, always-reachable "back" navigation.** Top *and* bottom back
   links on every drill-down screen (assessment, questionnaire, evidence,
   report), with a larger tap target — so you never have to scroll to the top to
   move back. (From the earlier fix round.)

4. **Checkbox / radio label alignment.** Boxes and their labels now line up
   cleanly on the report, questionnaire and settings screens.

5. **Honest, accurate copy.** The dashboard no longer describes already-built
   features (questionnaire, report, evidence log) as "coming soon", and the
   accessibility statement's skip-link claim is now precisely worded.

6. **Exported documents.** Word and PDF now share the same structure (tables with
   header rows for the profile, bias types and pillars) and the Word file has
   proper paragraph and heading spacing. (From the earlier fix round.)

## Already strong (kept as-is)

- Skip-to-content link, semantic landmarks, logical heading order.
- Visible 3px focus indicator; full keyboard operation.
- Reduced-motion media query; text resize / zoom to 400%.
- Status and risk shown with text + symbol + border style, never colour alone.
- Form fields joined to labels; errors announced with `role="alert"`.
- Accessible password show/hide toggle with `aria-pressed`.
- Descriptive image alt text on the logo.

## What still needs a human tester (cannot be automated)

- Screen-reader passes with NVDA + VoiceOver + TalkBack.
- Real keyboard-only journeys end to end.
- The disability-inclusive UAT panel described in `TEST-PLAN.md`.
- Plain-language / reading-level check with real users.
- Exported-document reading in Word and a PDF reader with assistive tech.

---

## Accessibility Compliance Note

This audit and the changes it describes target **WCAG 2.0, 2.1 and 2.2 Level
AAA** and the seven **Universal Design** principles. Colour-contrast figures were
calculated from the actual brand colours. Automated and calculated checks cannot
replace testing with real assistive technology and real users; the items under
"What still needs a human tester" must be completed before wide public release.
Some legal text and future translated content will require separate manual
review. If you find any barrier, contact hello@beaccessible.co.za.
