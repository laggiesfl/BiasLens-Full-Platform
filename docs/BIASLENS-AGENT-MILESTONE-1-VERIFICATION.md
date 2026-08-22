# BiasLens Assess — Milestone 1 Verification Record

**Date:** 22 August 2026  
**Branch:** `biaslens-agent-division-foundation`  
**Pull request:** #17  
**Status:** Draft implementation; application layer verified; production Supabase agent migration and authenticated release verification still required

## Implemented scope

Milestone 1 now contains:

- deterministic adaptive questioning using the existing BiasLens questionnaire and branching rules;
- preservation of `Not sure` as a distinct answer state;
- BiasLens Agent session and message schema with Row Level Security policies;
- controlled persistence into BiasLens Core assessment and evidence records;
- code-enforced prohibition on invented methodology questions and automatic compliance / biased-unbiased / `ALLOW` / `BLOCK` verdicts;
- human-review escalation for consequential domains with unresolved Unknown or Conflicted evidence;
- authenticated assessment API with generic error responses that do not echo submitted assessment text;
- accessible one-question-at-a-time assessment interface;
- text-visible Evidence State communication;
- structured evidence summary separating Established, Unknown and Conflicted evidence;
- assessment-overview entry point for starting or continuing BiasLens Agent;
- dedicated `BiasLens Agent CI` verification workflow.

## Automated verification

The agent-specific test suites cover methodology and adaptive question selection, persistence-boundary validation, orchestration guardrails, structured summary behaviour, authenticated API behaviour, and accessible UI source-level regression requirements.

The dedicated CI gate also runs TypeScript validation with `npx tsc --noEmit` and the Next.js production build with `npm run build`.

**Latest verified gate:** BiasLens Agent CI run 15 completed successfully on 22 August 2026. The focused BiasLens Agent tests, TypeScript validation and production build all completed successfully.

A Vercel Preview deployment is created automatically from the branch. A `READY` deployment proves that Vercel successfully built and published that commit; it does not by itself prove the authenticated database workflow works end to end. Runtime inspection on 22 August 2026 found no Vercel runtime errors during the checked period.

## Production Supabase project — authoritative checkpoint

The live BiasLens application is compiled against Supabase project:

- **Project name:** `Beaccessible`
- **Project reference:** `uuvxqyrqhqktkeovkivx`
- **Region:** `eu-west-2`
- **Status when checked:** `ACTIVE_HEALTHY`

This project is the authoritative BiasLens production backend. Vercel production runtime activity and the deployed browser bundle both confirmed that BiasLens uses `https://uuvxqyrqhqktkeovkivx.supabase.co`.

After reconnecting the Supabase connector to the correct BeAccessible organisation, production inspection confirmed that this project is intact and contains the existing BiasLens data model and records, including:

- `profiles` — 1 row;
- `assessments` — 2 rows;
- `ai_system_profiles` — 2 rows;
- `questionnaire_responses` — 2 rows;
- `risk_classifications`;
- `evidence_log_entries`;
- `generated_documents`;
- `legal_frameworks` — 15 rows;
- `legal_references` — 29 rows;
- `sample_systems` — 5 rows;
- `activity_log` — 36 rows;
- `biaslens_invited_users` — 1 row.

All of the inspected BiasLens production tables reported Row Level Security enabled.

A real BiasLens magic-link sign-in was completed successfully on the production site on 22 August 2026. Vercel runtime logs showed the successful login and `/auth/callback` flow on the production deployment.

## Critical correction — earlier restore was not production

An earlier connector session exposed Supabase project `rdawclptgbajyzmrbbcp`. That project was mistakenly treated as the BiasLens backend because it was the only project initially visible to the connector. Additive restore/hardening migrations were applied there during investigation.

Those migrations **must not be treated as production BiasLens migrations**. They were applied to the wrong project and did not modify the live BiasLens backend.

The live BiasLens production project `uuvxqyrqhqktkeovkivx` was later identified directly from the Vercel production build and then verified through the re-authorised Supabase connector.

Do **not** copy, replay, or infer production migration state from `rdawclptgbajyzmrbbcp` without first inspecting `uuvxqyrqhqktkeovkivx`.

## Production migration state still to verify

Before any production DDL is applied, the next session must inspect `uuvxqyrqhqktkeovkivx` and verify:

1. whether `public.evidence_log_entries` already has:
   - `evidence_state`
   - `evidence_state_rationale`
   - `source_uri`;
2. whether the Evidence State constraints / supporting provenance migration are already present;
3. whether `public.agent_assessment_sessions` exists;
4. whether `public.agent_messages` exists;
5. whether the intended BiasLens Agent RLS policies already exist;
6. current table grants for the BiasLens tables;
7. current Supabase security advisor findings.

Only the missing, already-reviewed Milestone 1 agent migration should then be applied to production. No unrelated production schema changes should be bundled into that step.

## Current blocker

The Supabase connector became intermittently unavailable after the correct production project had been authorised. Because the remaining steps require production DDL and authenticated persistence verification, work is intentionally paused rather than applying changes without a fresh schema read.

No further production database change should be made until the connector can reliably inspect `uuvxqyrqhqktkeovkivx` in the same session.

## Known repository-level blocker outside this work

The legacy whole-repository CI currently contains a pre-existing failure in `src/components/guide/normal-chatbot-regression.test.ts`. The failing assertion concerns placement detection for the public BiasLens Guide read-aloud controls. The new BiasLens Assess work does not modify that public Guide behaviour. The issue is tracked separately as GitHub issue #18.

## Release verification still required before production merge

Do not mark Milestone 1 production-ready until all of the following are evidenced:

1. verify the Evidence State schema on production;
2. apply only the missing production BiasLens Agent migration if required;
3. confirm the authorised BiasLens user exists in the production Auth project;
4. sign in to the Vercel Preview with that authorised BiasLens account;
5. start or open an assessment and enter BiasLens Agent;
6. complete several answer types, including `Not sure` and a multi-select answer;
7. leave and resume the assessment, confirming persisted progress;
8. verify an inaccessible user cannot read another assessment or its agent session;
9. verify Evidence State updates preserve provenance and audit history;
10. complete keyboard-only testing of the full agent journey;
11. test at 200% zoom and 320 CSS pixels width;
12. run at least one structured screen-reader walkthrough;
13. verify reduced-motion behaviour where motion is present;
14. confirm the structured summary never turns Unknown/Conflicted evidence into stronger claims;
15. retest the existing manual questionnaire and report routes for regression;
16. resolve issue #18 or confirm merge policy allows the formally separated pre-existing Guide regression.

## Accessibility Compliance Note

Milestone 1 is designed to a WCAG 2.2 Level AA release minimum and targets Level AAA where feasible. Implemented measures include semantic headings and regions, native form controls, programmatic labels and legends, visible text for all Evidence States, a `Not sure` path, status and error semantics, focus movement to each new question, disabled duplicate submission during network activity, 48-pixel minimum action/choice targets, no colour-only meaning, one-question-at-a-time interaction, and an ordinary collapsible review section rather than nested scrolling.

Manual screen-reader, zoom/reflow, cross-browser and full keyboard journey verification remains outstanding and no stronger accessibility-conformance claim should be made until those tests are completed.
