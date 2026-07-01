# BiasLens — Inclusive Test Plan

*Prepared for BeAccessible · Version 1.0 · July 2026*

This plan checks that BiasLens works correctly **and** works equitably for a
diverse range of people — including screen-reader users, keyboard-only users,
users with low digital literacy, multilingual users, and users on slow mobile
connections. It follows the BeAccessible inclusive testing standard (11 testing
levels, disability-inclusive UAT, WCAG 2.2 AAA, POPIA and AI-fairness).

---

## 1. Project overview

- **Product:** BiasLens — algorithmic bias testing and accountability platform.
- **Platform:** Web application (Next.js + Supabase), responsive for desktop,
  tablet and mobile.
- **Purpose:** Lets organisations and affected communities identify, document
  and respond to bias in AI-enabled systems, and produce a defensible Bias Risk
  Report.
- **Target users:** Civil society / journalists, businesses, government bodies,
  and directly affected individuals — including people with disabilities.
- **AI feature:** The risk classification engine (SA tier, EU AI Act, IBM bias
  types, six pillars, obligations, remediation). Because there is an automated
  decision-support feature, **all 11 levels apply and Level 9 is mandatory.**

## 2. Test scope

**In scope:** Sign-up / login / password reset, onboarding, dashboard,
assessments (create, edit, delete), guided questionnaire, risk report
(view, edit, regenerate), Word / PDF / CSV export, evidence log (add, update,
attach files, delete), settings, privacy and accessibility pages, navigation,
and the shared UI (buttons, tables, badges, forms).

**Out of scope (this round):** The "coming soon" modules (Fairness Metrics
Calculator, Compliance Mapper, Access Request Generator, AIA/FRIA Builder);
load testing beyond a small pilot; formal third-party penetration test.

**Timeline:** One pilot test cycle before go-live, then a regression cycle after
each change.

## 3. Test environment

- **Browsers:** Chrome, Firefox, Edge, Safari (latest 2 versions each).
- **Mobile:** Android 5+ (Chrome/TalkBack), iOS 14+ (Safari/VoiceOver).
- **Assistive tech:** NVDA + Chrome, VoiceOver + Safari, TalkBack + Chrome,
  keyboard-only, 400% zoom, OS high-contrast and dark mode.
- **Connections:** Fast Wi-Fi, 4G, 3G (South Africa / Africa realistic).
- **Test accounts:** One per role (civil society, business, government, affected
  individual) plus an admin account. Use non-real, non-sensitive sample data.

---

## 4. Test cases by level

### Level 1 — Unit (logic)
An automated suite already exists (`npm test`, Vitest) covering the risk engine,
questionnaire branching and role labels.

| Test ID | Feature | Expected result | A11y flag |
|---|---|---|---|
| TC-U01 | `classify()` structure | Always 8 IBM bias types + 6 SA pillars; summary present | No |
| TC-U02 | `classify()` biometric policing | SA tier = "Unacceptable"; EU = prohibited | AI fairness |
| TC-U03 | `classify()` high-risk domains | welfare/employment/etc. → EU high-risk + Annex category | AI fairness |
| TC-U04 | `classify()` empty input | EU minimal risk; SA tier Low; no crash | No |
| TC-U05 | Questionnaire branching | EU-only questions hidden until `eu_reach = true` | No |
| TC-U06 | `roleLabel()` | Correct label per role; friendly fallback when unset | No |

### Level 2 — Integration
| Test ID | Feature | Expected result | Privacy flag |
|---|---|---|---|
| TC-I01 | Supabase auth session | Login sets session; protected pages redirect when logged out | POPIA (access control) |
| TC-I02 | Save questionnaire answers | Autosave writes to `questionnaire_responses` and reloads on return | No |
| TC-I03 | Evidence file upload | File stored in `evidence` bucket; signed download URL works and expires | POPIA (security) |
| TC-I04 | Row-level security | User A cannot read User B's assessments or evidence | POPIA (Art. 19) |
| TC-I05 | Report export route | `?format=docx/pdf/csv` returns the correct file type | No |

### Level 3 — System (end-to-end journeys)
| Test ID | Journey | Expected result | A11y flag |
|---|---|---|---|
| TC-S01 | Sign up → confirm → onboarding → dashboard | New user reaches dashboard with role guidance | 2.4.3 focus order |
| TC-S02 | Create assessment → complete questionnaire → generate report → export Word | Report matches answers; Word downloads and opens | No |
| TC-S03 | Add evidence item → attach file → mark received → delete (confirm) | Row updates; delete asks for confirmation | 3.3.6 |
| TC-S04 | Full journey keyboard-only | Every step reachable and operable without a mouse | 2.1.1 |
| TC-S05 | Full journey with NVDA + VoiceOver | All content announced in logical order; forms labelled | 1.3.1, 4.1.2 |

### Level 4 — Accessibility & Universal Design *(non-negotiable)*
| Test ID | Check | Expected result | WCAG |
|---|---|---|---|
| TC-A01 | Colour contrast | All text ≥ 7:1 (primary buttons, links, status text verified) | 1.4.6 AAA |
| TC-A02 | Colour not sole meaning | Status/risk shown by text + symbol + border, never colour alone | 1.4.1 |
| TC-A03 | Keyboard operation | All controls operable; visible 3px focus indicator | 2.1.1, 2.4.7 |
| TC-A04 | Skip link + landmarks | Skip-to-content works; header/nav/main/aside present | 2.4.1 |
| TC-A05 | Zoom to 400% | No loss of content or function; no horizontal scroll traps | 1.4.10 |
| TC-A06 | Forms | Every field has a joined label; errors announced via role=alert | 3.3.1, 3.3.2 |
| TC-A07 | Target size | Interactive targets ≥ 44×44px (buttons use 48px min) | 2.5.5/2.5.8 |
| TC-A08 | Reduced motion | No essential motion; `prefers-reduced-motion` respected | 2.3.3 |
| TC-A09 | Error prevention | Destructive deletes require confirmation | 3.3.4/3.3.6 AAA |
| TC-A10 | Exported documents | Word uses heading styles + table headers; PDF has title, reading order, tables | 1.3.1 |

### Level 5 — Usability
| Test ID | Check | Success criterion |
|---|---|---|
| TC-US01 | First-time task completion | A new user can create an assessment and start the questionnaire unaided |
| TC-US02 | Navigation clarity | Users always know where they are and how to go back (top + bottom back links) |
| TC-US03 | Plain-language help | Field hints understood without expert knowledge |
| TC-US04 | SUS score | System Usability Scale ≥ 68 across the panel |

### Level 6 — Multilingual, cultural & plain language
| Test ID | Check | Expected result |
|---|---|---|
| TC-M01 | Reading level | Interface copy at Grade 8 or below (Flesch-Kincaid) |
| TC-M02 | Dates / numbers | Formatted for South Africa (en-ZA) consistently |
| TC-M03 | Cultural sensitivity | Sample data and examples are neutral and inclusive |
| TC-M04 | Future translation | Copy is externalised (i18n dictionary) so another official SA language can be added and screen-reader tested |

### Level 7 — Performance
| Test ID | Check | Target |
|---|---|---|
| TC-P01 | Page load on 4G | Interactive < 3 seconds |
| TC-P02 | Slow / intermittent 3G | Pages still load; autosave recovers gracefully |
| TC-P03 | Core Web Vitals | LCP, INP, CLS within "good" thresholds |
| TC-P04 | Large report export | Word/PDF generate without timeout for a full assessment |

### Level 8 — Security & privacy (POPIA-first)
| Test ID | Check | Framework |
|---|---|---|
| TC-SEC01 | HTTPS everywhere | POPIA / general |
| TC-SEC02 | Input validation | No XSS / SQL injection via form fields | 
| TC-SEC03 | Authorisation | RLS prevents cross-user data access | POPIA Art. 19 |
| TC-SEC04 | Data minimisation | Only necessary fields collected; sensitive-data warning shown | POPIA |
| TC-SEC05 | Deletion pathway | Assessment / evidence deletion works and is logged | POPIA (data subject rights) |
| TC-SEC06 | Privacy notice | Published, accessible, plain language | POPIA (openness) |
| TC-SEC07 | Session handling | Logout ends session; recovery link flow is safe | POPIA |

### Level 9 — AI fairness & bias *(mandatory)*
| Test ID | Check | Standard |
|---|---|---|
| TC-AI01 | AI disclosure | Report states it is decision-support, not legal advice | EU AI Act transparency |
| TC-AI02 | Explainability | "Why these classifications?" gives plain-language reasons + confidence | EU AI Act Art. 13 |
| TC-AI03 | Human oversight | A reviewer can edit and override headline classifications before export | EU AI Act Art. 14 |
| TC-AI04 | No proxy discrimination | Engine logic does not penalise protected groups as a hidden proxy | UNCRPD, CERD, CEDAW |
| TC-AI05 | Consistent outcomes | Same answers always give the same classification (deterministic) | Fairness / auditability |
| TC-AI06 | Protected characteristics | Disability, race, gender, age, language explicitly considered in affected-groups logic | UDHR Art. 7 |

### Level 10 — Regression
Run the Vitest suite (`npm test`) plus the core journeys (TC-S01–S05) and the
accessibility checks (TC-A01–A10) after **every** change. No change ships if it
introduces a new WCAG, privacy or fairness failure.

### Level 11 — Cross-device & cross-platform
Test the matrix in Section 3 (browsers × mobile OS × assistive tech × connection
speed × input method × display settings). Priority combinations: NVDA+Chrome,
VoiceOver+Safari, TalkBack+Chrome, keyboard-only, 400% zoom, dark mode, 3G.

---

## 5. Disability-inclusive UAT

Recruit a panel that includes, at minimum:

- 1–2 screen-reader users (visual impairment)
- 1–2 keyboard / switch users (motor)
- 1–2 users with cognitive disability or low digital literacy
- 1–2 Deaf or hard-of-hearing users
- 1–2 users from a non-English-first background
- 1–2 older adults (60+)
- 1–2 users on a low-bandwidth mobile connection

**Tasks:** sign up, create an assessment, complete the questionnaire, generate
and export a report, add an evidence item, and delete one item.

**Sign-off:** ≥ 80% task completion across every group, with **no critical
failure on any accessibility path**.

---

## 6. Bug report template

| Field | Detail |
|---|---|
| Bug ID | |
| Date found / Tester | |
| Page / Feature | |
| Device + Browser + OS | |
| Assistive technology used | |
| Steps to reproduce | |
| Expected result | |
| Actual result | |
| Screenshot / recording | |
| Severity | Critical / High / Medium / Low |
| Accessibility impact | Yes/No — WCAG criterion: |
| Privacy impact | Yes/No — Framework + article: |
| AI fairness impact | Yes/No — Protected characteristic: |
| Status | Open / In progress / Fixed / Closed |
| Fix verified by | |

---

## 7. Go-live sign-off checklist

**Functionality**
- [ ] All critical journeys (TC-S01–S05) complete without error
- [ ] All integrations (auth, storage, export) tested and working
- [ ] Error states handled with helpful messages
- [ ] Performance targets met on 4G and 3G

**Accessibility**
- [ ] Automated scan (axe/Lighthouse) passes with zero critical issues
- [ ] Keyboard-only navigation passes
- [ ] Screen-reader testing done (NVDA + VoiceOver minimum)
- [ ] Contrast verified at 7:1 for all text
- [ ] All images have alt text; all forms have labels and error messages

**Privacy & security**
- [ ] Privacy notice published, accessible, plain language
- [ ] HTTPS active on all pages
- [ ] RLS confirmed (no cross-user access)
- [ ] Deletion pathway tested and logged
- [ ] Input validation tested (no XSS / SQL injection)

**Usability & inclusion**
- [ ] Plain-language check (Grade 8 or below)
- [ ] UAT completed with a diverse panel including people with disabilities
- [ ] SUS score ≥ 68

**AI fairness**
- [ ] AI disclosure visible
- [ ] Human-oversight checkpoint present (reviewer edits)
- [ ] Bias logic reviewed across protected groups
- [ ] Report explains its reasoning in plain language

---

## Accessibility & Inclusive Compliance Note

**♿⚖️🌍 Inclusive Global Compliance Note**

**Accessibility standards:** WCAG 2.0 / 2.1 / 2.2 Level AAA; Universal Design
(7 Principles).

**Privacy frameworks considered:** POPIA (South Africa, primary) · GDPR (EU) ·
with a structure that extends to CCPA/CPRA, NDPR, PIPEDA, LGPD and PDPA if the
platform serves those regions.

**Human-rights foundations:** UNCRPD (Art. 3, 5, 9, 21) · UDHR (Art. 1, 2, 7,
12) · CEDAW · CERD · UN Guiding Principles on Business and Human Rights.

**AI-fairness standards:** EU AI Act · UNESCO AI Ethics Recommendation · IEEE
Ethically Aligned Design.

**Protected characteristics tested:** disability · race/ethnicity · gender ·
age · religion · sexual orientation · socioeconomic status · language/culture ·
intersectional identities.

**Known limitations:** This is a pilot test plan. Screen-reader, multilingual
and low-bandwidth results depend on running the panel described in Section 5.
Full AAA cannot be guaranteed for every browser + assistive-technology
combination or for exported-document readers without manual review. A formal
third-party security/penetration test is recommended before wide public release.
